'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PJ_POSES, PRIO, SAY, SAY_MC, SAY_PJ, SECRETS, TOUR, type SecretId } from '@/lib/clippy-messages';
import { SayQueue, readTime } from '@/lib/clippy-say';
import { Mover, type Pt } from '@/lib/clippy-motion';
import { confetti, puff, reducedMotion, sound } from '@/lib/clippy-fx';
import { DEFAULTS, dayPart, loadState, saveState, type ClipState } from '@/lib/clippy-store';
import { PROJECTS } from '@/lib/data';

type Pose = 'hide' | 'wave' | 'read' | 'hop' | 'team' | 'point' | 'bye' | 'cheer' | 'tour';
type Side = 'right' | 'left';
type BasePose = Exclude<Pose, 'hide' | 'cheer' | 'tour'>;

/** Qué hace la mascota según la sección que está en pantalla (las específicas primero). Lo que no esté aquí la esconde. */
const POSES: [string, BasePose][] = [
  ['.hero-nos, .page-hero, .hero-home', 'wave'],
  ['#historia', 'read'],
  ['.team-sec', 'team'],
  ['.band-red, .tiles', 'point'],
  ['footer', 'bye'],
  ['@pj', 'hop'],
  ['@mc', 'wave'],
  ['.chapter:not(.develop-sec)', 'hop'],
];

/** De qué borde asoma en cada pose: se alterna para no tapar contenido. */
const SIDE: Partial<Record<Pose, Side>> = { wave: 'right', read: 'left', hop: 'right', team: 'right', point: 'right', bye: 'left', cheer: 'left', tour: 'right' };

/** Gestos al azar mientras está quieta. */
const IDLE = ['look', 'lean', 'hop', 'peek'] as const;

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Dónde se para Clippy para acompañar a un elemento: sobre su borde superior, o colgada debajo si está muy arriba. */
function perchPoint(el: HTMLElement, where?: 'below' | 'on'): Pt | null {
  const r = el.getBoundingClientRect();
  const d = document.documentElement;
  if (r.bottom < 40 || r.top > d.clientHeight - 20 || r.width === 0) return null;
  const x = clamp(r.left + Math.min(r.width / 2, 140), 30, d.clientWidth - 30);
  if (where === 'below' || (where !== 'on' && r.top < 190) || r.top < 126) return { x, y: Math.min(r.bottom + 122, d.clientHeight) };
  return { x, y: r.top + 2 };
}

/**
 * Clippy, la mascota. Vive en el borde de la pantalla y asoma en algunas secciones. Tiene:
 *  - cuerpo con estirar y aplastar, y cara con boca y varias expresiones;
 *  - globos de texto ordenados en una cola (uno a la vez, con tiempo de lectura);
 *  - desplazamientos a saltos hasta un elemento (recorrido guiado y señalar el "Hablemos");
 *  - juego con el cursor: se deja arrastrar y lanzar, pide mimos, tiene cosquillas, se asusta y a veces se asoma a mirar;
 *  - reacciones al scroll y a la hora, bostezo y siesta; memoria de visitas y secretos;
 *  - confeti, sonido opcional y un panel de ajustes para ocultarla, silenciarla o callarla.
 */
export default function ClipMascot() {
  const path = usePathname();
  const [target, setTarget] = useState<Pose>('hide');
  const [override, setOverride] = useState<Pose | null>(null);
  const [shown, setShown] = useState<Pose>('hide');
  const [side, setSide] = useState<Side>('right');
  const [say, setSay] = useState({ text: '', on: false });
  const [face, setFaceState] = useState('idle');
  const [poked, setPoked] = useState(false);
  const [grp, setGrp] = useState('');
  const [prefs, setPrefs] = useState<ClipState>(DEFAULTS);
  const [panel, setPanel] = useState(false);
  const [touring, setTouring] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const posEl = useRef<HTMLDivElement>(null);
  const sqEl = useRef<HTMLDivElement>(null);
  const sayW = useRef<HTMLDivElement>(null);
  const mover = useRef<Mover | null>(null);
  const queue = useRef<SayQueue | null>(null);

  const shownRef = useRef<Pose>('hide');
  const sideRef = useRef<Side>('right');
  const grpRef = useRef('');
  const prefsRef = useRef<ClipState>(DEFAULTS);
  const sleepRef = useRef(false);
  const lastSay = useRef('');
  const clicks = useRef<number[]>([]);
  const angryTimer = useRef(0);
  const emoTimer = useRef(0);
  const faceTimer = useRef(0);
  const sqTimer = useRef(0);
  const ownedByPose = useRef(false);
  const tour = useRef({ running: false, cancel: false });
  const visit = useRef({ first: false, gapDays: 0, lastSlug: '' });
  const greeted = useRef(false);
  const drag = useRef<{ id: number; sx: number; sy: number; active: boolean } | null>(null);

  useEffect(() => { shownRef.current = shown; }, [shown]);
  useEffect(() => { sideRef.current = side; }, [side]);
  useEffect(() => { grpRef.current = grp; }, [grp]);

  /* ───────── ajustes y memoria ───────── */
  const update = useCallback((patch: Partial<ClipState>) => {
    const n = { ...prefsRef.current, ...patch };
    prefsRef.current = n;
    setPrefs(n);
    saveState(n);
  }, []);

  /* ───────── mensajes: una cola, un globo a la vez ───────── */
  useEffect(() => {
    const q = new SayQueue(
      (text) => setSay({ text, on: true }),
      () => setSay((s) => ({ ...s, on: false })),
      () => !prefsRef.current.quiet && !prefsRef.current.hidden && shownRef.current !== 'hide' && !sleepRef.current,
    );
    queue.current = q;
    return () => q.clear();
  }, []);

  /** Dice una frase al azar del grupo (sin repetir la anterior). `slug` elige las de un producto o pieza. */
  const speak = useCallback((group: string, slug?: string, prio?: number) => {
    const pool = (slug && (SAY_PJ[slug] || SAY_MC[slug])) || SAY[group];
    if (!pool?.length) return;
    let t = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && t === lastSay.current) t = pool[(pool.indexOf(t) + 1) % pool.length];
    lastSay.current = t;
    queue.current?.push(t, prio ?? PRIO[group] ?? 1);
  }, []);
  const speakText = useCallback((t: string, prio = 2, force = false) => queue.current?.push(t, prio, { force }), []);
  const speakRef = useRef(speak);
  useEffect(() => { speakRef.current = speak; }, [speak]);

  /* ───────── cara, emociones y cuerpo ───────── */
  const setFace = useCallback((f: string, ms = 1800) => {
    setFaceState(f);
    window.clearTimeout(faceTimer.current);
    if (ms > 0) faceTimer.current = window.setTimeout(() => setFaceState('idle'), ms);
  }, []);

  /** Símbolo de emoción (bang, sweat, spark, love) durante `ms`. */
  const emote = useCallback((name: string, ms: number) => {
    const el = root.current;
    if (!el) return;
    el.dataset.emo = name;
    window.clearTimeout(emoTimer.current);
    emoTimer.current = window.setTimeout(() => { el.dataset.emo = ''; }, ms);
  }, []);

  /** Estirar y aplastar: crouch (agacharse), stretch (estirarse), land (aterrizar). */
  const squash = useCallback((name: 'crouch' | 'stretch' | 'land' | '', ms = 560) => {
    const el = sqEl.current;
    if (!el) return;
    el.dataset.sq = '';
    void el.offsetWidth;
    el.dataset.sq = name;
    window.clearTimeout(sqTimer.current);
    if (name) sqTimer.current = window.setTimeout(() => { el.dataset.sq = ''; }, ms);
  }, []);

  const flag = useCallback((name: string, ms: number) => {
    const el = root.current;
    if (!el) return;
    el.dataset[name] = '1';
    window.setTimeout(() => { el.dataset[name] = '0'; }, ms);
  }, []);

  /* ───────── motor de movimiento ───────── */
  useEffect(() => {
    const el = root.current;
    const pos = posEl.current;
    if (!el || !pos) return;
    mover.current = new Mover(el, pos, {
      squash,
      lean: (deg) => el.style.setProperty('--lean', `${deg.toFixed(1)}deg`),
      puff,
      hit: (v) => { sound.play('land'); if (v > 900) emote('bang', 700); },
      hop: () => sound.play('hop'),
      reduced: reducedMotion,
    });
    return () => { mover.current?.cancel(); mover.current = null; };
  }, [squash, emote]);

  const goHomeNow = useCallback(async () => {
    const mv = mover.current;
    if (!mv || !mv.away) return true;
    const ok = await mv.goHome();
    if (ok) { root.current?.style.setProperty('--lean', '0deg'); setFace('idle', 0); }
    return ok;
  }, [setFace]);

  /* ───────── secretos ───────── */
  const unlock = useCallback((id: SecretId) => {
    if (prefsRef.current.found.includes(id)) return;
    const found = [...prefsRef.current.found, id];
    update({ found });
    const f = mover.current?.feet();
    if (f) confetti(f.x, f.y - 60, 34);
    sound.play('chime');
    setFace('happy', 2600);
    speakText(`¡Secreto encontrado! (${found.length}/${SECRETS.length}): ${SECRETS.find((s) => s.id === id)?.label.toLowerCase()}.`, 3, true);
  }, [update, setFace, speakText]);

  /** Hace que aparezca aunque la sección no le toque (para secretos y celebraciones). */
  const summon = useCallback((ms: number) => {
    if (prefsRef.current.hidden) return;
    setOverride('cheer');
    window.setTimeout(() => setOverride((o) => (o === 'cheer' ? null : o)), ms);
  }, []);

  /* ───────── recorrido guiado ───────── */
  const stopTour = useCallback(() => { tour.current.cancel = true; }, []);

  const startTour = useCallback(async () => {
    const mv = mover.current;
    if (!mv || tour.current.running || prefsRef.current.hidden) return;
    tour.current = { running: true, cancel: false };
    setTouring(true);
    setPanel(false);
    setOverride('tour');
    const reduced = reducedMotion();
    await sleep(900);
    const stops = TOUR.map((s) => ({ ...s, el: document.querySelector<HTMLElement>(s.sel) })).filter((s): s is typeof s & { el: HTMLElement } => !!s.el);
    if (!stops.length) speakText('Acá no hay un recorrido, pero en la portada sí. ¡Probá ahí!', 3, true);
    speakText('Seguime, te muestro lo importante.', 3, true);
    await sleep(2600);
    for (const s of stops) {
      if (tour.current.cancel) break;
      s.el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      await sleep(reduced ? 150 : 1000);
      if (tour.current.cancel) break;
      const get = () => perchPoint(s.el, s.where);
      const pt = get();
      if (!pt) continue;
      const ok = await mv.hopTo(pt.x, pt.y);
      if (!ok || tour.current.cancel) break;
      mv.perch(get);
      window.dispatchEvent(new Event('clippy:active'));
      setFace('happy', 3000);
      speakText(s.say, 3, true);
      await sleep(readTime(s.say) + 900);
    }
    const done = !tour.current.cancel;
    tour.current.running = false;
    window.dispatchEvent(new Event('clippy:active'));
    mv.cancel();
    await goHomeNow();
    setOverride(null);
    setTouring(false);
    if (done) {
      update({ tourDone: true });
      unlock('recorrido');
    } else {
      speakText('Listo, cuando quieras lo retomamos.', 3, true);
    }
  }, [goHomeNow, setFace, speakText, unlock, update]);

  /* ───────── señalar el "Hablemos" ───────── */
  const pointAtCTA = useCallback(async () => {
    const mv = mover.current;
    const el = document.querySelector<HTMLElement>('.tiles .tile--yellow, .band-red .btn, .band-red a');
    if (!mv || !el || mv.away || tour.current.running) return;
    const get = () => perchPoint(el, 'on');
    const pt = get();
    if (!pt) return;
    ownedByPose.current = true;
    const ok = await mv.hopTo(pt.x, pt.y);
    if (!ok) return;
    mv.perch(get, () => { ownedByPose.current = false; void goHomeNow(); });
    window.dispatchEvent(new Event('clippy:active'));
    setFace('happy', 2400);
    speak('point');
  }, [goHomeNow, setFace, speak]);

  /* ───────── 1) pose según la sección más visible ───────── */
  useEffect(() => {
    const pjTargets = Array.from(document.querySelectorAll<HTMLElement>('section.pj')).map((el, i) => ({ el, p: PJ_POSES[i % PJ_POSES.length] as BasePose, g: el.id }));
    const mcTargets = Array.from(document.querySelectorAll<HTMLElement>('.mc-card')).map((el, i) => ({ el, p: (i % 2 ? 'hop' : 'wave') as BasePose, g: `mc-${el.dataset.edition}` }));
    const targets = POSES.flatMap(([sel, p]) =>
      sel === '@pj' ? pjTargets : sel === '@mc' ? mcTargets : Array.from(document.querySelectorAll<HTMLElement>(sel)).map((el) => ({ el, p, g: '' })),
    );
    if (!targets.length || !('IntersectionObserver' in window)) return;
    const ratio = new Map<Element, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratio.set(e.target, e.intersectionRatio));
        let best: Pose = 'hide';
        let bestG = '';
        let top = 0.3;
        targets.forEach(({ el, p, g }) => {
          const r = ratio.get(el) ?? 0;
          if (r > top) { top = r; best = p; bestG = g; }
        });
        setTarget(best);
        setGrp(bestG);
      },
      { threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1] },
    );
    targets.forEach(({ el }) => io.observe(el));
    return () => io.disconnect();
  }, [path]);

  /* ───────── 2) pose mostrada: si cambia de borde, primero se esconde y reaparece del otro lado ───────── */
  useEffect(() => {
    const eff: Pose = prefs.hidden ? 'hide' : (override ?? target);
    const mv = mover.current;
    const apply = () => {
      if (eff === 'hide') { setShown('hide'); return; }
      const ns = SIDE[eff] ?? sideRef.current;
      if (ns !== sideRef.current && shownRef.current !== 'hide') {
        setShown('hide');
        return window.setTimeout(() => { setSide(ns); setShown(eff); }, 560);
      }
      setSide(ns);
      setShown(eff);
    };
    // lejos de su borde (pasó una pose que la había movido): primero vuelve a casa
    if (mv?.away && eff !== 'tour' && override !== 'tour') {
      if (ownedByPose.current) { ownedByPose.current = false; void mv.goHome().then(() => apply()); return; }
      if (eff === 'hide') void mv.goHome().then((ok) => { if (ok) setShown('hide'); });
      return;
    }
    const t = apply();
    return () => { if (typeof t === 'number') window.clearTimeout(t); };
  }, [target, override, prefs.hidden]);

  /* ───────── 3) al aparecer o cambiar de sección: camina, saluda o comenta ───────── */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (shown === 'hide') { queue.current?.clear(); return; }
    el.dataset.walk = '1';
    const w = window.setTimeout(() => { el.dataset.walk = '0'; }, 1000);
    let c = 0;
    if (shown !== 'cheer' && shown !== 'tour') {
      c = window.setTimeout(() => {
        // primera aparición en la página: saludo según la visita y la hora
        if (!greeted.current) {
          greeted.current = true;
          const v = visit.current;
          const last = PROJECTS.find((p) => p.slug === v.lastSlug);
          if (!v.first && last && path.startsWith('/proyectos') && grpRef.current !== last.slug) {
            speakText(`La última vez mirabas ${last.cliente}. ¿Seguimos?`, 2);
          } else if (v.first) speak('hello', undefined, 2);
          else if (v.gapDays > 3) speak('return_long', undefined, 2);
          else if (Math.random() < 0.5) speak('return', undefined, 2);
          else speak(`greet_${dayPart()}`, undefined, 2);
          return;
        }
        if (Math.random() < 0.85) speak(shown, grp || undefined, 1);
      }, 1500);
    }
    // señalar el "Hablemos" cuando llega a esa sección
    let cta = 0;
    if (shown === 'point') cta = window.setTimeout(() => void pointAtCTA(), 1500);
    return () => { window.clearTimeout(w); window.clearTimeout(c); window.clearTimeout(cta); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, grp]);

  // memoria: último proyecto que estuvo mirando
  useEffect(() => {
    if (grp && PROJECTS.some((p) => p.slug === grp) && prefsRef.current.lastSlug !== grp) update({ lastSlug: grp });
  }, [grp, update]);

  /* ───────── globo horizontal: invierte giro y escala de toda la cadena para que el texto no se incline ───────── */
  useEffect(() => {
    const el = root.current;
    const w = sayW.current;
    if (!el || !w || !say.on) return;
    const chain = [el, el.querySelector('.mascot__t'), el.querySelector('.mascot__s'), el.querySelector('.mascot__b')].filter(Boolean) as Element[];
    const lin = (n: Element) => {
      const cs = getComputedStyle(n);
      const m = new DOMMatrixReadOnly(cs.transform);
      let out = new DOMMatrix();
      const rot = parseFloat(cs.rotate);
      if (!Number.isNaN(rot)) out = out.rotate(rot);
      if (cs.scale && cs.scale !== 'none') {
        const [sx, sy] = cs.scale.split(' ').map(Number);
        out = out.scale(sx, sy ?? sx);
      }
      return out.multiply(new DOMMatrix([m.a, m.b, m.c, m.d, 0, 0]));
    };
    let raf = 0;
    const tick = () => {
      let m = new DOMMatrix();
      for (const n of chain) m = m.multiply(lin(n));
      const inv = m.inverse();
      w.style.transform = `matrix(${inv.a}, ${inv.b}, ${inv.c}, ${inv.d}, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); w.style.transform = ''; };
  }, [say.on]);

  /* ───────── eventos de la página: mensajes y efectos ───────── */
  useEffect(() => {
    const onSay = (e: Event) => {
      const d = (e as CustomEvent<{ group: string; slug?: string }>).detail;
      if (d?.group) speakRef.current(d.group, d.slug);
    };
    const onFx = (e: Event) => {
      const d = (e as CustomEvent<{ x: number; y: number; count?: number; colors?: string[] }>).detail;
      if (d) confetti(d.x, d.y, d.count ?? 30, d.colors);
    };
    window.addEventListener('clippy:say', onSay);
    window.addEventListener('clippy:fx', onFx);
    return () => { window.removeEventListener('clippy:say', onSay); window.removeEventListener('clippy:fx', onFx); };
  }, []);

  /* ───────── revelar la foto: asoma y celebra ───────── */
  useEffect(() => {
    let off = 0;
    let talk = 0;
    const onChange = (e: Event) => {
      const t = e.target as HTMLInputElement | null;
      if (t?.id !== 'rev-toggle') return;
      if (prefsRef.current.hidden) return;
      setOverride('cheer');
      window.clearTimeout(talk);
      talk = window.setTimeout(() => {
        speakRef.current(t.checked ? 'cheer' : 'uncheer');
        emote(t.checked ? 'spark' : 'sweat', t.checked ? 3200 : 2200);
        setFace(t.checked ? 'happy' : 'sad', 2400);
        if (t.checked) {
          const r = document.querySelector('.rev__clip')?.getBoundingClientRect();
          if (r) confetti(r.left + r.width / 2, r.top + 30, 36);
          sound.play('chime');
        }
      }, 900);
      window.clearTimeout(off);
      off = window.setTimeout(() => setOverride(null), 4800);
    };
    document.addEventListener('change', onChange);
    return () => { document.removeEventListener('change', onChange); window.clearTimeout(off); window.clearTimeout(talk); };
  }, [emote, setFace]);

  /* ───────── cargar memoria al abrir el sitio ───────── */
  useEffect(() => {
    const s = loadState();
    const now = Date.now();
    visit.current = { first: s.visits === 0, gapDays: s.last ? (now - s.last) / 86400000 : 0, lastSlug: s.lastSlug };
    const n = { ...s, visits: s.visits + 1, last: now };
    prefsRef.current = n;
    setPrefs(n);
    saveState(n);
    sound.set(n.sound);
  }, []);

  /* ───────── cerebro: ojos, color, scroll, juego con el cursor, bostezo y siesta, gestos y charla ───────── */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let raf = 0;
    let px = -999;
    let py = -999;
    let lastMove = Date.now();
    let activity = Date.now();
    let yawned = false;
    let lastY = window.scrollY;
    let lastScrollT = performance.now();
    let scrollEma = 0;
    let lastFast = 0;
    let sat = false;
    let tiltTimer = 0;
    let idleTimer = 0;
    let idleOff = 0;
    let chatTimer = 0;
    let lastRgb = '';
    let lastNear = 0;
    let lastScare = 0;
    let lastTickle = 0;
    let lastCurious = Date.now();
    let petAcc = 0;
    let lastPointerT = performance.now();
    let lastDx = 0;
    let reversals: number[] = [];
    let curious = false;

    const body = () => el.querySelector('.mascot__b') as HTMLElement | null;
    const visible = () => shownRef.current !== 'hide' && !prefsRef.current.hidden;

    const wake = () => {
      activity = Date.now();
      yawned = false;
      if (sleepRef.current) {
        sleepRef.current = false;
        el.dataset.sleep = '0';
        setFace('sleepy', 1300);
        squash('stretch', 900);
        if (visible()) { speakRef.current('wake'); emote('bang', 1200); }
      }
    };

    const sleepNow = () => {
      sleepRef.current = true;
      el.dataset.sleep = '1';
      setFace('idle', 0);
      queue.current?.clear();
    };

    // color: toma el fondo de lo que hay detrás de la mascota
    const sampleColor = () => {
      const f = mover.current?.feet();
      const d = document.documentElement;
      const x = clamp(f ? f.x : el.dataset.side === 'left' ? 30 : d.clientWidth - 30, 6, d.clientWidth - 6);
      const y = clamp((f ? f.y : d.clientHeight) - 70, 6, d.clientHeight - 6);
      const stack = document.elementsFromPoint(x, y);
      let rgb: number[] | null = null;
      for (const s of stack) {
        if (s.closest('.mascot') || s.closest('.site-header') || s.closest('.cl-ctl')) continue;
        for (let n: Element | null = s; n && !rgb; n = n.parentElement) {
          const bg = getComputedStyle(n).backgroundColor;
          const m = bg.match(/[\d.]+/g);
          if (m && (m.length < 4 || Number(m[3]) > 0.5)) {
            const k = bg.startsWith('color(') ? 255 : 1;
            rgb = m.slice(0, 3).map((v) => Math.round(Number(v) * k));
          }
        }
        if (rgb) break;
      }
      if (!rgb) return;
      const key = rgb.join(',');
      if (key === lastRgb) return;
      lastRgb = key;
      const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
      el.style.setProperty('--mc-bg', `rgb(${key})`);
      el.dataset.tone = lum < 0.5 ? 'dark' : 'light';
    };

    const frame = () => {
      raf = 0;
      const eyes = el.querySelector('.mascot__eyes')?.getBoundingClientRect();
      if (eyes) {
        const dx = px - (eyes.left + eyes.width / 2);
        const dy = py - (eyes.top + eyes.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        if (px > -900) {
          const k = Math.min(1, d / 160);
          el.style.setProperty('--lx', `${((dx / d) * 3.4 * k).toFixed(2)}px`);
          el.style.setProperty('--ly', `${((dy / d) * 3.4 * k).toFixed(2)}px`);
        }
        const near = visible() && d < 130 ? '1' : '0';
        if (near === '1' && el.dataset.near !== '1' && Date.now() - lastNear > 22000 && Math.random() < 0.35) {
          lastNear = Date.now();
          speakRef.current('near');
          emote('bang', 1100);
          setFace('wow', 1000);
        }
        el.dataset.near = near;
      }
      sampleColor();
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(frame); };

    /** Mimos: el puntero quieto (o casi) sobre el cuerpo un rato. */
    const pet = () => {
      petAcc = -3500;
      setFace('love', 2800);
      emote('love', 2800);
      squash('land', 600);
      flag('purr', 2600);
      sound.play('pop');
      speakRef.current('pet');
      const n = prefsRef.current.pets + 1;
      update({ pets: n });
      if (n >= 5) unlock('mimos');
    };

    const tickle = () => {
      lastTickle = Date.now();
      reversals = [];
      setFace('happy', 2000);
      flag('giggle', 1600);
      sound.play('giggle');
      speakRef.current('tickle');
    };

    const scare = () => {
      lastScare = Date.now();
      setFace('wow', 1100);
      emote('bang', 1000);
      squash('stretch', 500);
      flag('scare', 600);
      sound.play('squeak');
      speakRef.current('scare');
    };

    /** A veces se asoma a ver qué está mirando el cursor: salta hasta cerca de él y vuelve. */
    const visitCursor = async () => {
      const mv = mover.current;
      if (!mv || curious || mv.away || !visible() || sleepRef.current || tour.current.running || reducedMotion()) return;
      curious = true;
      lastCurious = Date.now();
      const d = document.documentElement;
      const x = clamp(px + (px > d.clientWidth / 2 ? -80 : 80), 30, d.clientWidth - 30);
      const y = clamp(py + 70, 130, d.clientHeight);
      const ok = await mv.hopTo(x, y);
      if (ok && !tour.current.running) {
        setFace('think', 3000);
        speakRef.current('curious');
        await sleep(3200);
      }
      if (!tour.current.running && mv.mode === 'away') await goHomeNow();
      curious = false;
    };

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(8, now - lastPointerT);
      const mx = e.clientX - (px > -900 ? px : e.clientX);
      const my = e.clientY - (py > -900 ? py : e.clientY);
      const speed = (Math.hypot(mx, my) / dt) * 1000;
      const dPrev = (() => { const r = body()?.getBoundingClientRect(); return r ? Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2)) : 9999; })();
      px = e.clientX;
      py = e.clientY;
      lastPointerT = now;
      lastMove = Date.now();
      if (e.pointerType !== 'touch' || drag.current) wake();

      const r = body()?.getBoundingClientRect();
      if (r && visible() && !drag.current && mover.current?.mode !== 'drag' && mover.current?.mode !== 'fly') {
        const inside = px >= r.left - 4 && px <= r.right + 4 && py >= r.top - 4 && py <= r.bottom + 4;
        const dNow = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
        if (inside) {
          // mimos (quieto) o cosquillas (de un lado a otro)
          if (speed < 520) petAcc += Math.min(dt, 120);
          else petAcc = Math.min(petAcc, 0) - 0;
          if (Math.sign(mx) !== 0 && Math.sign(mx) !== Math.sign(lastDx) && Math.abs(mx) > 2) reversals.push(Date.now());
          if (Math.sign(mx) !== 0) lastDx = mx;
          reversals = reversals.filter((t) => Date.now() - t < 1200);
          if (reversals.length >= 6 && Date.now() - lastTickle > 6000) tickle();
          else if (petAcc >= 1300) pet();
        } else {
          petAcc = Math.min(0, petAcc);
          reversals = [];
          // se asusta si el cursor se le viene encima muy rápido
          if (speed > 1700 && dNow < 170 && dNow < dPrev - 20 && Date.now() - lastScare > 8000 && Math.random() < 0.8) scare();
        }
      }
      schedule();
    };

    const onScroll = () => {
      const now = performance.now();
      const dy = window.scrollY - lastY;
      const dts = Math.max(8, now - lastScrollT);
      lastY = window.scrollY;
      lastScrollT = now;
      el.style.setProperty('--tilt', `${clamp(dy * 0.35, -12, 12).toFixed(1)}deg`);
      if (Math.abs(dy) > 6 && px < -900) {
        el.style.setProperty('--lx', '0px');
        el.style.setProperty('--ly', `${dy > 0 ? 2.6 : -2.6}px`);
      }
      window.clearTimeout(tiltTimer);
      tiltTimer = window.setTimeout(() => el.style.setProperty('--tilt', '0deg'), 140);

      // scroll muy rápido: se marea
      scrollEma = scrollEma * 0.7 + ((Math.abs(dy) / dts) * 1000) * 0.3;
      if (scrollEma > 2600 && Date.now() - lastFast > 20000 && visible() && !sleepRef.current && !tour.current.running && mover.current?.mode === 'home') {
        lastFast = Date.now();
        flag('dizzy', 1800);
        setFace('wow', 1400);
        speakRef.current('fast');
      }
      // al llegar al final de la página se sienta
      const d = document.documentElement;
      const bottom = window.scrollY + d.clientHeight >= d.scrollHeight - 6;
      if (bottom !== sat) {
        sat = bottom;
        el.dataset.sit = bottom ? '1' : '0';
        if (bottom && visible()) speakRef.current('bottom');
      }
      wake();
      schedule();
    };

    // bostezo a los 9 s sin actividad y siesta a los 14 s
    const sleepLoop = window.setInterval(() => {
      if (document.hidden || !visible() || mover.current?.mode === 'drag' || mover.current?.mode === 'fly' || tour.current.running) return;
      const idle = Date.now() - activity;
      if (idle > 9000 && !yawned && !sleepRef.current) {
        yawned = true;
        setFace('yawn', 2400);
        squash('stretch', 900);
        speakRef.current('yawn');
      }
      if (idle > 14000 && !sleepRef.current && !queue.current?.busy) sleepNow();
      // curiosidad: con el cursor quieto un rato, a veces se asoma a mirar
      if (!sleepRef.current && px > -900 && Date.now() - lastMove > 4500 && Date.now() - lastCurious > 90000 && Math.random() < 0.15) void visitCursor();
    }, 1000);

    // gestos al azar cada 6–12 s
    const loopIdle = () => {
      idleTimer = window.setTimeout(() => {
        if (!document.hidden && visible() && !sleepRef.current && mover.current?.mode === 'home') {
          el.dataset.idle = IDLE[Math.floor(Math.random() * IDLE.length)];
          window.clearTimeout(idleOff);
          idleOff = window.setTimeout(() => { el.dataset.idle = ''; }, 1500);
        }
        loopIdle();
      }, 6000 + Math.random() * 6000);
    };

    // comentario espontáneo cada 20–32 s sobre lo que se está viendo (prioridad baja: se descarta si está ocupada)
    const loopChat = () => {
      chatTimer = window.setTimeout(() => {
        const s = shownRef.current;
        if (!document.hidden && s !== 'hide' && s !== 'cheer' && s !== 'tour' && !sleepRef.current) speakRef.current(s, grpRef.current || undefined, 0);
        loopChat();
      }, 20000 + Math.random() * 12000);
    };

    // secretos: escribir "clippy" y el código Konami
    let typed = '';
    let kseq: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      wake();
      if (e.key === 'Escape' && tour.current.running) { stopTour(); return; }
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      kseq = [...kseq, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-10);
      if (kseq.join(',') === KONAMI.join(',')) {
        kseq = [];
        summon(8500);
        window.setTimeout(() => {
          flag('disco', 7000);
          setFace('happy', 7000);
          speakRef.current('secret_konami');
          sound.play('chime');
          const f = mover.current?.feet();
          for (let i = 0; i < 6; i++) window.setTimeout(() => { const g = mover.current?.feet() ?? f; if (g) confetti(g.x, g.y - 70, 26); }, i * 1000);
          unlock('konami');
        }, 700);
        return;
      }
      if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
        typed = (typed + e.key.toLowerCase()).slice(-6);
        if (typed === 'clippy') {
          typed = '';
          summon(5000);
          window.setTimeout(() => {
            flag('spin', 1100);
            setFace('happy', 2600);
            speakRef.current('secret_name');
            sound.play('boing');
            const g = mover.current?.feet();
            if (g) confetti(g.x, g.y - 70, 30);
            unlock('nombre');
          }, 700);
        }
      }
    };

    const onVisibility = () => { if (!document.hidden) { activity = Date.now(); schedule(); } };

    const onActive = () => { activity = Date.now(); yawned = false; };
    window.addEventListener('clippy:active', onActive);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVisibility);
    schedule();
    loopIdle();
    loopChat();
    const resample = window.setInterval(() => { if (!document.hidden && visible()) schedule(); }, 500);
    return () => {
      window.clearInterval(resample);
      window.clearInterval(sleepLoop);
      window.removeEventListener('clippy:active', onActive);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(raf);
      [tiltTimer, idleTimer, idleOff, chatTimer].forEach((t) => window.clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ───────── recorrido automático la primera vez (solo en la portada, si la persona no empezó a explorar) ───────── */
  useEffect(() => {
    if (!(path === '/' || path.startsWith('/nosotras'))) return;
    const t = window.setTimeout(() => {
      if (!prefsRef.current.tourDone && !prefsRef.current.hidden && window.scrollY < 500 && shownRef.current !== 'hide') void startTour();
    }, 9000);
    return () => window.clearTimeout(t);
  }, [path, startTour]);

  /* ───────── clic, arrastrar y lanzar ───────── */
  const poke = () => {
    const el = root.current;
    if (tour.current.running) { stopTour(); return; }
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 4000), now];
    if (el && sleepRef.current) { sleepRef.current = false; el.dataset.sleep = '0'; }
    if (el && clicks.current.length >= 6) {
      // muchos clics seguidos: se enoja (cejas, tiembla y protesta), y después se calma
      clicks.current = [];
      el.dataset.dizzy = '0';
      el.dataset.emo = '';
      el.dataset.angry = '1';
      setFace('angry', 2400);
      speak('angry');
      window.clearTimeout(angryTimer.current);
      angryTimer.current = window.setTimeout(() => {
        el.dataset.angry = '0';
        speak('calm');
        emote('sweat', 2200);
        setFace('sad', 1600);
      }, 2400);
      return;
    }
    if (el && el.dataset.angry === '1') { speak('angry'); return; }
    if (el && clicks.current.length >= 3) {
      // varios clics seguidos: se marea
      if (el.dataset.dizzy !== '1') {
        el.dataset.dizzy = '1';
        el.dataset.emo = '';
        setFace('wow', 2000);
        speak('dizzy');
        window.setTimeout(() => { el.dataset.dizzy = '0'; }, 2000);
      }
      return;
    }
    speak('poke');
    emote('bang', 900);
    setFace('wow', 800);
    sound.play('squeak');
    setPoked(false);
    requestAnimationFrame(() => setPoked(true));
    window.setTimeout(() => setPoked(false), 700);
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || shownRef.current === 'hide' || prefsRef.current.hidden) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, active: false };
  };

  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const mv = mover.current;
    if (!d || !mv || d.id !== e.pointerId) return;
    if (!d.active && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 8) {
      d.active = true;
      if (tour.current.running) stopTour();
      sleepRef.current = false;
      if (root.current) { root.current.dataset.sleep = '0'; root.current.dataset.drag = '1'; }
      mv.beginDrag(d.sx, d.sy);
      setFace('wow', 0);
      speak('drag');
      sound.play('whoosh');
    }
    if (d.active) mv.dragTo(e.clientX, e.clientY, e.timeStamp);
  };

  const onUp = async (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    const el = root.current;
    const mv = mover.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.active || !mv) { poke(); return; }
    if (el) el.dataset.drag = '0';
    const speed = await mv.release();
    // lanzada: festeja el vuelo; al aterrizar comenta y, un rato después, vuelve a su lugar
    const thrown = speed > 1000;
    setFace(thrown ? 'happy' : 'idle', thrown ? 1800 : 0);
    if (thrown) { speak('throw'); unlock('lanzada'); }
    await sleep(900);
    if (mv.mode !== 'away') return;
    speak('land');
    setFace('sad', 1200);
    await sleep(2600);
    if (mv.mode !== 'away' || tour.current.running) return;
    speak('home');
    await goHomeNow();
  };

  /* ───────── ajustes ───────── */
  const toggleHidden = (hidden: boolean) => {
    if (hidden) {
      queue.current?.clear();
      stopTour();
      mover.current?.reset();
      update({ hidden: true });
    } else {
      update({ hidden: false });
      window.setTimeout(() => speak('show', undefined, 3), 1200);
    }
  };
  const toggleSound = (on: boolean) => {
    sound.set(on);
    update({ sound: on });
    if (on) { sound.play('chime'); speak('sound_on', undefined, 3); }
  };
  const toggleQuiet = (quiet: boolean) => {
    if (quiet) queue.current?.clear();
    update({ quiet });
    if (!quiet) window.setTimeout(() => speak('quiet_off', undefined, 3), 400);
  };

  // el panel se cierra con Escape o al hacer clic fuera
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPanel(false); };
    const onClick = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.cl-ctl')) setPanel(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onClick);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('pointerdown', onClick); };
  }, [panel]);

  const found = prefs.found.length;

  return (
    <>
      <div
        ref={root}
        className="mascot"
        data-pose={shown}
        data-side={side}
        data-tone="light"
        data-face={face}
        data-hidden={prefs.hidden ? '1' : '0'}
        aria-hidden="true"
      >
        <div ref={posEl} className="mascot__pos">
          <div className="mascot__t">
            <div ref={sqEl} className="mascot__s">
              <div
                className={`mascot__b${poked ? ' is-poked' : ''}`}
                onPointerDown={onDown}
                onPointerMove={onDragMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
              >
                {/* el globo sigue a Clippy (sube, baja, se balancea con ella) pero se mantiene horizontal: el contenedor cancela su giro */}
                <div className="mascot__sayw" ref={sayW}>
                  <div className="mascot__say" data-on={say.on ? '1' : '0'}>{say.text}</div>
                </div>
                <span className="emo emo--vein" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M4 10Q10 10 10 4M14 4Q14 10 20 10M20 14Q14 14 14 20M10 20Q10 14 4 14" /></svg>
                </span>
                <span className="emo emo--sweat" aria-hidden="true">
                  <svg viewBox="0 0 24 28"><path d="M12 2C12 2 4 12 4 18a8 8 0 0 0 16 0C20 12 12 2 12 2Z" /><path className="hl" d="M8.5 18a3.5 3.5 0 0 0 3 3.4" /></svg>
                </span>
                <span className="emo emo--bang" aria-hidden="true">
                  <svg viewBox="0 0 16 28"><rect x="5" y="2" width="6" height="16" rx="3" /><circle cx="8" cy="24" r="3.2" /></svg>
                </span>
                <span className="emo emo--stars" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <svg key={i} viewBox="0 0 24 24" style={{ animationDelay: `${-i * 0.5}s` }}><path d="M12 2l2.9 6.6 7.1.7-5.3 4.8 1.5 7-6.2-3.6-6.2 3.6 1.5-7L2 9.3l7.1-.7z" /></svg>
                  ))}
                </span>
                <span className="emo emo--spark" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <svg key={i} viewBox="0 0 24 24" className={`s${i}`}><path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" /></svg>
                  ))}
                </span>
                <span className="emo emo--hearts" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <svg key={i} viewBox="0 0 24 24" className={`h${i}`}><path d="M12 21C5 15.5 2.5 11.8 2.5 8.4 2.5 5.6 4.6 3.8 7 3.8c1.9 0 3.9 1.1 5 3.1 1.1-2 3.1-3.1 5-3.1 2.4 0 4.5 1.8 4.5 4.6 0 3.4-2.5 7.1-9.5 12.6Z" /></svg>
                  ))}
                </span>
                <div className="mascot__zzz">
                  <span>Z</span>
                  <span>z</span>
                  <span>Z</span>
                </div>
                <svg viewBox="-6 -6 68 162" focusable="false">
                  <path className="mascot__halo" d="M3 37V122A25 25 0 0 0 53 122V25A18 18 0 0 0 17 25V100A11 11 0 0 0 39 100V58" />
                  <path className="mascot__wire" d="M3 37V122A25 25 0 0 0 53 122V25A18 18 0 0 0 17 25V100A11 11 0 0 0 39 100V58" />
                  <g className="mascot__eyes">
                    <g className="eye">
                      <circle className="eye__w" cx="15" cy="52" r="7.2" />
                      <circle className="eye__p" cx="15" cy="52" r="2.9" />
                      <path className="eye__arc" d="M8.5 55Q15 46.5 21.5 55" />
                      <path className="eye__heart" d="M15 56.5C10 52.6 9.6 48.2 12.6 48C13.7 47.9 14.6 48.5 15 49.3C15.4 48.5 16.3 47.9 17.4 48C20.4 48.2 20 52.6 15 56.5Z" />
                    </g>
                    <path className="brow" d="M7 43L23 47" />
                    <path className="brow brow--up" d="M7 44L23 42" />
                    <path className="brow" d="M49 43L33 47" />
                    <path className="brow brow--up" d="M49 44L33 42" />
                    <g className="eye">
                      <circle className="eye__w" cx="39" cy="52" r="7.2" />
                      <circle className="eye__p" cx="39" cy="52" r="2.9" />
                      <path className="eye__arc" d="M32.5 55Q39 46.5 45.5 55" />
                      <path className="eye__heart" d="M39 56.5C34 52.6 33.6 48.2 36.6 48C37.7 47.9 38.6 48.5 39 49.3C39.4 48.5 40.3 47.9 41.4 48C44.4 48.2 44 52.6 39 56.5Z" />
                    </g>
                    <ellipse className="blush" cx="10" cy="62" rx="4.2" ry="2.4" />
                    <ellipse className="blush" cx="44" cy="62" rx="4.2" ry="2.4" />
                  </g>
                  <g className="mouth">
                    <path className="m m--smile" d="M23.5 66Q28 70.5 32.5 66" />
                    <path className="m m--grin" d="M22.5 65Q28 76 33.5 65Z" />
                    <ellipse className="m m--o" cx="28" cy="69" rx="3" ry="4" />
                    <path className="m m--flat" d="M24.5 68H31.5" />
                    <path className="m m--sad" d="M23.5 71Q28 66 32.5 71" />
                    <ellipse className="m m--yawn" cx="28" cy="70" rx="4.4" ry="7" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ajustes: siempre disponibles, aunque Clippy esté escondida */}
      <div className="cl-ctl" data-open={panel ? '1' : '0'} data-off={prefs.hidden ? '1' : '0'}>
        <button type="button" className="cl-ctl__btn" aria-label="Ajustes de Clippy" aria-expanded={panel} onClick={() => setPanel((p) => !p)}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7.5 5.5v12a4.5 4.5 0 0 0 9 0v-11a3 3 0 0 0-6 0v8a1.8 1.8 0 0 0 3.6 0v-5" /></svg>
        </button>
        {panel && (
          <div className="cl-ctl__panel" role="group" aria-label="Ajustes de Clippy">
            <p className="cl-ctl__t">Clippy</p>
            <label className="cl-sw"><input type="checkbox" checked={!prefs.hidden} onChange={(e) => toggleHidden(!e.target.checked)} /><span className="cl-sw__k" aria-hidden="true" />Mostrar a Clippy</label>
            <label className="cl-sw"><input type="checkbox" checked={!prefs.quiet} onChange={(e) => toggleQuiet(!e.target.checked)} /><span className="cl-sw__k" aria-hidden="true" />Globos de texto</label>
            <label className="cl-sw"><input type="checkbox" checked={prefs.sound} onChange={(e) => toggleSound(e.target.checked)} /><span className="cl-sw__k" aria-hidden="true" />Sonido</label>
            <button type="button" className="cl-ctl__go" disabled={prefs.hidden} onClick={() => (touring ? stopTour() : void startTour())}>
              {touring ? 'Detener el recorrido' : 'Hacer el recorrido'}
            </button>
            <p className="cl-ctl__t cl-ctl__t--s">Secretos {found}/{SECRETS.length}</p>
            <ul className="cl-ctl__list">
              {SECRETS.map((s) => (
                <li key={s.id} data-found={prefs.found.includes(s.id) ? '1' : '0'}>{prefs.found.includes(s.id) ? '✓' : '·'} {s.label}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
