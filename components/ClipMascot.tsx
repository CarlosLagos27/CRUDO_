'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type Pose = 'hide' | 'wave' | 'read' | 'hop' | 'team' | 'point' | 'bye' | 'cheer';
type Side = 'right' | 'left';

/** Qué hace la mascota según la sección que está en pantalla (las específicas primero). Lo que no esté aquí la esconde. */
const POSES: [string, Exclude<Pose, 'hide' | 'cheer'>][] = [
  ['.hero-nos, .page-hero, .hero-home', 'wave'],
  ['#historia', 'read'],
  ['.team-sec', 'team'],
  ['.band-red, .tiles', 'point'],
  ['footer', 'bye'],
  ['@pj', 'hop'],
  ['.mc-card', 'hop'],
  ['.chapter:not(.develop-sec)', 'hop'],
];

/** De qué borde asoma en cada pose: se alterna para no tapar contenido. */
const SIDE: Partial<Record<Pose, Side>> = { wave: 'right', read: 'left', hop: 'right', team: 'right', point: 'right', bye: 'left', cheer: 'left' };

/** Comentarios al azar, según lo que esté viendo la persona. Editá libremente. */
const SAY: Record<string, string[]> = {
  wave: ['¡Hola! Soy Clippy.', '¡Te damos la bienvenida a Crudo_!', 'Tus ideas, en su estado más crudo.', '¿Tenés una idea en crudo?', 'Dale, bajá un poquito.'],
  read: ['Dos países, una agencia.', 'Así nació Crudo_.', 'Esta parte me la sé de memoria.', 'Seguí leyendo, que se pone bueno.'],
  hop: ['Todo empieza en crudo.', '¡Me encanta esta parte!', 'Esto recién empieza.', '¡Qué buena onda este lugar!'],
  team: ['¡Qué equipo!', 'Deslizá para conocer al equipo.', 'ARG // COL: una mezcla perfecta.', 'Tres cabezas piensan mejor que una.'],
  point: ['¡Hablemos!', 'Tocá ese botón, no muerde.', 'Contanos tu idea.', '¿Armamos algo entre todos?'],
  bye: ['¡Nos vemos!', 'Gracias por pasar.', 'Volvé cuando quieras.', 'Escribinos, estamos acá.'],
  cheer: ['¡Qué lindo quedó!', '¡Eso es revelar!', 'De RAW a obra de arte.'],
  uncheer: ['De vuelta en crudo.', '¿Otra vez? ¡Dale!'],
  poke: ['¡Ey!', '¡Cosquillas!', '¡Auch!', 'Eso hace cosquillas.'],
  dizzy: ['Uy, me mareo...', 'El mundo da vueltas.', 'Basta, basta.'],
  angry: ['Ey, con calma.', 'Pará un poquito.', 'Mmm... ya, ya.', 'Con suavidad, che.'],
  calm: ['Bueno, ya pasó.', 'Estoy bien, estoy bien.'],
  wake: ['¡Ah! ¿Qué pasó?', 'No estaba dormida.', '¿Eh? Ya voy.'],
  mailopen: ['¡Abriste el sobre!', '¿Qué trae este mes?', 'Me encantan las sorpresas.', 'Mirá todo lo que sale.'],
  mailclose: ['Sobre cerrado, misterio guardado.', 'Ya lo guardo.'],
  mailpiece: ['Esa pieza es de mis favoritas.', 'Qué detalle tan lindo.', 'Los detalles importan.'],
  expand: ['¡Mirá cuánto hay para ver!', 'Acá viene lo bueno.', 'Desplegando el proyecto completo.'],
  collapse: ['Listo, lo guardo.', 'Recogido. ¿Cuál sigue?'],
  expandAll: ['¡Todo a la vista!', 'Uf, cuánto material.'],
  collapseAll: ['A ordenar todo.', 'Todo guardadito.'],
  filter: ['Buen filtro.', '¡A ver qué sale!', 'Ordenando los proyectos...'],
  filterAll: ['Todos de vuelta.', 'Acá están todos.'],
  zoom: ['¡Qué lindo se ve en grande!', 'Esa pieza quedó espectacular.', 'Los detalles importan.'],
  near: ['¿Me ves?', '¡Hola, hola!', 'Acá estoy.'],
};

/** Poses que se van alternando entre un proyecto y el siguiente. */
const PJ_POSES: Exclude<Pose, 'hide' | 'cheer'>[] = ['hop', 'wave', 'team', 'read'];

/** Mensajes sobre cada producto, para cuando esa sección está a la vista (clave: id del proyecto). */
const SAY_PJ: Record<string, string[]> = {
  piccolino: ['¡Qué salchicha más simpática!', 'Piccolino ladra con estilo.', 'Ese perrito corre por toda la marca.', '¿Viste el cartel de la calle?'],
  'mart-bakery': ['Mart Bakery: se me hizo agua la boca.', 'Esos stickers de tortas son un amor.', 'Quiero uno de esos croissants.', 'Hasta el delantal quedó lindo.'],
  miga: ['Miga tiene pan y mucho cariño.', 'La niña con pañuelo es toda una personalidad.', 'El letrero colgante quedó precioso.', 'Panadería colombiana, ¡qué rico!'],
  'nube-skin': ['Nube Skin: tan suave como una nube.', 'Ese logo parece de perla.', 'Letras infladas en 3D, ¡qué lujo!', 'Cuidar la piel también es diseño.'],
  archetype: ['Archetype: mucho concreto y rojo señal.', 'Berlín nos queda perfecta.', 'Esa A gigante es tremenda.', 'El video está en loop, ¡miralo!'],
  malcriada: ['Esa torta de zanahoria me llama.', 'Luz de ventana y café con leche.', 'Malcriada sale muy bien en foto.', '¿Quién se anima a una porción?'],
  'da-vinci': ['¡Un diente con el Hombre de Vitruvio!', 'Precisión y arte en un solo logo.', 'Da Vinci cuida las sonrisas.', 'Azul marino, muy elegante.'],
  anma: ['ANMA: el verde lima se nota.', 'Minúsculas y mucho estilo.', 'Principal, secundario y marcas de agua.', 'Ese azul pizarra calma.'],
};

/** Gestos al azar mientras está quieta. */
const IDLE = ['look', 'lean', 'hop', 'peek'] as const;

/**
 * Clippy, la mascota. Asoma en algunas secciones y hace una animación corta (saludar, leer, saltar, señalar, despedirse),
 * cambia de borde, camina un poco al cambiar de sección, comenta lo que se está viendo, celebra cuando se revela la foto,
 * se pinta según el fondo, se inclina al scrollear, se sorprende si el mouse se acerca, se duerme (con burbujas ZzZ)
 * y se marea si le hacen clic varias veces seguidas.
 */
export default function ClipMascot() {
  const path = usePathname();
  const [target, setTarget] = useState<Pose>('hide');
  const [override, setOverride] = useState<Pose | null>(null);
  const [shown, setShown] = useState<Pose>('hide');
  const [side, setSide] = useState<Side>('right');
  const [say, setSay] = useState({ text: '', on: false });
  const [poked, setPoked] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const sayW = useRef<HTMLDivElement>(null);
  const shownRef = useRef<Pose>('hide');
  const sideRef = useRef<Side>('right');
  const clicks = useRef<number[]>([]);
  const lastSay = useRef('');
  const sayTimer = useRef(0);
  const [grp, setGrp] = useState('');
  const grpRef = useRef('');
  const angryTimer = useRef(0);
  const emoTimer = useRef(0);

  /** Muestra un símbolo de emoción (bang, sweat, spark) durante `ms`. */
  const emote = useCallback((name: string, ms: number) => {
    const el = root.current;
    if (!el) return;
    el.dataset.emo = name;
    window.clearTimeout(emoTimer.current);
    emoTimer.current = window.setTimeout(() => { el.dataset.emo = ''; }, ms);
  }, []);
  const emoteRef = useRef(emote);
  useEffect(() => { emoteRef.current = emote; }, [emote]);

  useEffect(() => { shownRef.current = shown; }, [shown]);
  useEffect(() => { sideRef.current = side; }, [side]);
  useEffect(() => { grpRef.current = grp; }, [grp]);

  /** Dice una frase al azar del grupo (sin repetir la anterior) y la oculta a los ~4 s. */
  const speak = useCallback((group: string, slug?: string) => {
    const pool = (slug && SAY_PJ[slug]) || SAY[group];
    if (!pool) return;
    let t = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && t === lastSay.current) t = pool[(pool.indexOf(t) + 1) % pool.length];
    lastSay.current = t;
    setSay({ text: t, on: true });
    window.clearTimeout(sayTimer.current);
    sayTimer.current = window.setTimeout(() => setSay((s) => ({ ...s, on: false })), 4200);
  }, []);
  const speakRef = useRef(speak);
  useEffect(() => { speakRef.current = speak; }, [speak]);

  // globo horizontal: invierte la parte lineal (giro y escala) de la cadena .mascot > .mascot__t > .mascot__b
  useEffect(() => {
    const el = root.current;
    const w = sayW.current;
    if (!el || !w || !say.on) return;
    const t = el.querySelector('.mascot__t');
    const b = el.querySelector('.mascot__b');
    if (!t || !b) return;
    const lin = (n: Element) => { const m = new DOMMatrixReadOnly(getComputedStyle(n).transform); return new DOMMatrix([m.a, m.b, m.c, m.d, 0, 0]); };
    let raf = 0;
    const tick = () => {
      const rot = parseFloat(getComputedStyle(el).rotate) || 0; // la caminata anima la propiedad `rotate` del contenedor
      const inv = new DOMMatrix().rotate(rot).multiply(lin(t)).multiply(lin(b)).inverse();
      w.style.transform = `matrix(${inv.a}, ${inv.b}, ${inv.c}, ${inv.d}, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); w.style.transform = ''; };
  }, [say.on]);

  // 1) pose según la sección más visible
  useEffect(() => {
    const pjTargets = Array.from(document.querySelectorAll<HTMLElement>('section.pj')).map((el, i) => ({ el, p: PJ_POSES[i % PJ_POSES.length], g: el.id }));
    const targets = POSES.flatMap(([sel, p]) =>
      sel === '@pj' ? pjTargets : Array.from(document.querySelectorAll<HTMLElement>(sel)).map((el) => ({ el, p, g: '' })),
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

  // 2) pose mostrada: si cambia de borde, primero se esconde y reaparece del otro lado
  useEffect(() => {
    const eff: Pose = override ?? target;
    if (eff === 'hide') { setShown('hide'); return; }
    const ns = SIDE[eff] ?? sideRef.current;
    if (ns !== sideRef.current && shownRef.current !== 'hide') {
      setShown('hide');
      const t = window.setTimeout(() => { setSide(ns); setShown(eff); }, 560);
      return () => window.clearTimeout(t);
    }
    setSide(ns);
    setShown(eff);
  }, [target, override]);

  // 3) al aparecer o cambiar de sección: camina un poco y comenta
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (shown === 'hide') { setSay((s) => ({ ...s, on: false })); return; }
    el.dataset.walk = '1';
    const w = window.setTimeout(() => { el.dataset.walk = '0'; }, 1000);
    let c = 0;
    if (shown !== 'cheer' && Math.random() < 0.85) c = window.setTimeout(() => speakRef.current(shown, grp || undefined), 1500);
    return () => { window.clearTimeout(w); window.clearTimeout(c); };
  }, [shown, grp]);

  // reacciona a lo que hace la persona en la lista de proyectos
  useEffect(() => {
    const onSay = (e: Event) => {
      const d = (e as CustomEvent<{ group: string }>).detail;
      if (d?.group && shownRef.current !== 'hide' && root.current?.dataset.sleep !== '1') speakRef.current(d.group);
    };
    window.addEventListener('clippy:say', onSay);
    return () => window.removeEventListener('clippy:say', onSay);
  }, []);

  // 4) cuando se revela la foto, asoma y celebra
  useEffect(() => {
    let off = 0;
    let talk = 0;
    const onChange = (e: Event) => {
      const t = e.target as HTMLInputElement | null;
      if (t?.id !== 'rev-toggle') return;
      setOverride('cheer');
      window.clearTimeout(talk);
      talk = window.setTimeout(() => { speakRef.current(t.checked ? 'cheer' : 'uncheer'); emoteRef.current(t.checked ? 'spark' : 'sweat', t.checked ? 3200 : 2200); }, 900);
      window.clearTimeout(off);
      off = window.setTimeout(() => setOverride(null), 4800);
    };
    document.addEventListener('change', onChange);
    return () => { document.removeEventListener('change', onChange); window.clearTimeout(off); window.clearTimeout(talk); };
  }, []);

  // 5) interacción: ojos, color, inclinación, sorpresa, gestos, charla y sueño
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let raf = 0;
    let px = -999;
    let py = -999;
    let lastY = window.scrollY;
    let tiltTimer = 0;
    let sleepTimer = 0;
    let idleTimer = 0;
    let idleOff = 0;
    let chatTimer = 0;
    let lastRgb = '';
    let lastNear = 0;

    const wake = () => {
      if (el.dataset.sleep === '1') {
        el.dataset.sleep = '0';
        if (shownRef.current !== 'hide') { speakRef.current('wake'); emoteRef.current('bang', 1200); }
      }
      window.clearTimeout(sleepTimer);
      sleepTimer = window.setTimeout(() => { el.dataset.sleep = '1'; setSay((s) => ({ ...s, on: false })); }, 14000);
    };

    // color: toma el fondo de lo que hay detrás de la mascota
    const sampleColor = () => {
      const x = el.dataset.side === 'left' ? 30 : window.innerWidth - 30;
      const stack = document.elementsFromPoint(x, window.innerHeight - 70);
      let rgb: number[] | null = null;
      for (const s of stack) {
        if (s.closest('.mascot') || s.closest('.site-header')) continue;
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
        const near = shownRef.current !== 'hide' && d < 130 ? '1' : '0';
        if (near === '1' && el.dataset.near !== '1' && Date.now() - lastNear > 22000 && Math.random() < 0.35) {
          lastNear = Date.now();
          speakRef.current('near');
          emoteRef.current('bang', 1100);
        }
        el.dataset.near = near;
      }
      sampleColor();
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(frame); };

    const onMove = (e: PointerEvent) => { px = e.clientX; py = e.clientY; wake(); schedule(); };

    const onScroll = () => {
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      el.style.setProperty('--tilt', `${Math.max(-12, Math.min(12, dy * 0.35)).toFixed(1)}deg`);
      if (Math.abs(dy) > 6 && px < -900) {
        el.style.setProperty('--lx', '0px');
        el.style.setProperty('--ly', `${dy > 0 ? 2.6 : -2.6}px`);
      }
      window.clearTimeout(tiltTimer);
      tiltTimer = window.setTimeout(() => el.style.setProperty('--tilt', '0deg'), 140);
      wake();
      schedule();
    };

    // gestos al azar cada 6–12 s
    const loopIdle = () => {
      idleTimer = window.setTimeout(() => {
        if (shownRef.current !== 'hide' && el.dataset.sleep !== '1') {
          el.dataset.idle = IDLE[Math.floor(Math.random() * IDLE.length)];
          window.clearTimeout(idleOff);
          idleOff = window.setTimeout(() => { el.dataset.idle = ''; }, 1500);
        }
        loopIdle();
      }, 6000 + Math.random() * 6000);
    };

    // comentario espontáneo cada 20–32 s sobre lo que se está viendo
    const loopChat = () => {
      chatTimer = window.setTimeout(() => {
        const s = shownRef.current;
        if (s !== 'hide' && s !== 'cheer' && el.dataset.sleep !== '1') speakRef.current(s, grpRef.current || undefined);
        loopChat();
      }, 20000 + Math.random() * 12000);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    wake();
    schedule();
    loopIdle();
    loopChat();
    const resample = window.setInterval(() => { if (shownRef.current !== 'hide') schedule(); }, 500);
    return () => {
      window.clearInterval(resample);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(raf);
      [tiltTimer, sleepTimer, idleTimer, idleOff, chatTimer].forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const poke = () => {
    const el = root.current;
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 4000), now];
    if (el && el.dataset.sleep === '1') el.dataset.sleep = '0';
    if (el && clicks.current.length >= 6) {
      // muchos clics seguidos: se enoja (cejas, tiembla y protesta), y después se calma
      clicks.current = [];
      el.dataset.dizzy = '0';
      el.dataset.emo = '';
      el.dataset.angry = '1';
      speak('angry');
      window.clearTimeout(angryTimer.current);
      angryTimer.current = window.setTimeout(() => {
        el.dataset.angry = '0';
        speak('calm');
        emote('sweat', 2200);
      }, 2400);
      return;
    }
    if (el && el.dataset.angry === '1') { speak('angry'); return; }
    if (el && clicks.current.length >= 3) {
      // varios clics seguidos: se marea
      if (el.dataset.dizzy !== '1') {
        el.dataset.dizzy = '1';
        el.dataset.emo = '';
        speak('dizzy');
        window.setTimeout(() => { el.dataset.dizzy = '0'; }, 2000);
      }
      return;
    }
    speak('poke');
    emote('bang', 900);
    setPoked(false);
    requestAnimationFrame(() => setPoked(true));
    window.setTimeout(() => setPoked(false), 700);
  };

  return (
    <div ref={root} className="mascot" data-pose={shown} data-side={side} data-tone="light" aria-hidden="true">
      <div className="mascot__t">
        <div className={`mascot__b${poked ? ' is-poked' : ''}`} onClick={poke}>
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
          <div className="mascot__zzz">
            <span>Z</span>
            <span>z</span>
            <span>Z</span>
          </div>
          <svg viewBox="-6 -6 68 162" focusable="false">
            <path className="mascot__halo" d="M3 37V122A25 25 0 0 0 53 122V25A18 18 0 0 0 17 25V100A11 11 0 0 0 39 100V58" />
            <path className="mascot__wire" d="M3 37V122A25 25 0 0 0 53 122V25A18 18 0 0 0 17 25V100A11 11 0 0 0 39 100V58" />
            <g className="mascot__eyes">
              <g className="eye"><circle className="eye__w" cx="15" cy="52" r="7.2" /><circle className="eye__p" cx="15" cy="52" r="2.9" /></g>
              <path className="brow" d="M7 43L23 47" />
              <path className="brow" d="M49 43L33 47" />
              <g className="eye"><circle className="eye__w" cx="39" cy="52" r="7.2" /><circle className="eye__p" cx="39" cy="52" r="2.9" /></g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
