'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PROJECTS, PROJECT_MEDIA, SERVICES, type Project, type ProjectImage } from '@/lib/data';
import Lightbox from '@/components/Lightbox';
import AutoVideo from '@/components/AutoVideo';

const ALL = 'Todos';
const FILTERS = SERVICES.filter((s) => PROJECTS.some((p) => p.servicios.includes(s)));

/** Avisa a Clippy (ClipMascot) de lo que está pasando en la lista. */
const say = (group: string) => window.dispatchEvent(new CustomEvent('clippy:say', { detail: { group } }));

const css = (o: Record<string, string | number>) => o as React.CSSProperties;

/** Largo de la palabra más larga del nombre: el título se achica para que ninguna palabra se parta. */
const longest = (s: string) => Math.max(...s.split(' ').map((w) => w.length));

/** Elige texto claro u oscuro sobre un color de muestra. */
function readable(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  return lum > 0.6 ? '#111111' : '#ffffff';
}

/** Todas las imágenes visibles de un caso, en orden: portada, galería y tira de historias. */
function itemsOf(p: Project): { all: ProjectImage[]; main: ProjectImage[]; stories: ProjectImage[]; offMain: number; offStories: number } {
  const m = PROJECT_MEDIA[p.slug];
  const main = m.gallery.filter((g) => g.group !== 'stories');
  const stories = m.gallery.filter((g) => g.group === 'stories');
  return { all: [m.cover, ...main, ...stories], main, stories, offMain: 1, offStories: 1 + main.length };
}

/**
 * Miniatura que acompaña al puntero sobre el índice. Se dibuja en <body>: las secciones usan will-change/filter
 * y convertirían un position:fixed en relativo a la sección (se movía con el scroll y las demás secciones la tapaban).
 */
function Peek({ slug }: { slug: string }) {
  const el = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [last, setLast] = useState(slug);
  const target = useRef({ x: -999, y: -999 });
  const pos = useRef({ x: -999, y: -999 });
  const wasOn = useRef(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (slug) setLast(slug); }, [slug]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => { target.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => {
    if (!mounted || !slug) { wasOn.current = false; return; }
    if (!wasOn.current) { pos.current = { ...target.current }; wasOn.current = true; } // al aparecer, arranca bajo el puntero
    let raf = 0;
    let lastX = pos.current.y;
    const tick = () => {
      const node = el.current;
      if (node) {
        const w = node.offsetWidth;
        const h = node.offsetHeight;
        const t = target.current;
        const p = pos.current;
        p.x += (t.x - p.x) * 0.22;
        p.y += (t.y - p.y) * 0.22;
        // anclada al borde derecho: no tapa los nombres grandes de la izquierda; solo acompaña al puntero en vertical
        const x = Math.max(8, window.innerWidth - w - 28);
        const y = Math.max(8, Math.min(window.innerHeight - h - 8, p.y - h / 2));
        const rot = Math.max(-5, Math.min(5, (p.y - lastX) * 0.35)); // se inclina un poco según la velocidad
        lastX = p.y;
        node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mounted, slug]);

  const p = PROJECTS.find((x) => x.slug === last);
  if (!mounted || !p) return null;
  const m = PROJECT_MEDIA[p.slug];
  return createPortal(
    <div ref={el} className="pj-peek" data-on={slug ? '1' : '0'} aria-hidden="true" style={css({ '--pk-bg': p.bg, '--pk-ink': p.ink, '--pk-ac': p.accent })}>
      <div className="pj-peek__card">
        <div className="pj-peek__img"><img key={p.slug} src={m.cover.src} alt="" /></div>
        <div className="pj-peek__cap">
          <span className="label">( {p.n} )</span>
          <b>{p.cliente}</b>
          <span className="pj-peek__n label">{m.gallery.length + 1} piezas</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function ProjectsList() {
  const [filter, setFilter] = useState(ALL);
  const [box, setBox] = useState<{ slug: string; i: number } | null>(null);
  const [peek, setPeek] = useState('');
  const [rail, setRail] = useState(false);
  const [active, setActive] = useState('');
  const [opened, setOpened] = useState<string[]>([]);
  /** 'out': saliendo, 'gone': oculto, 'in': entrando; sin valor: estable. */
  const [phase, setPhase] = useState<Record<string, 'in' | 'out' | 'gone'>>({});
  const gone = (p: Project) => phase[p.slug] === 'gone';
  const isOpen = (slug: string) => opened.includes(slug);
  const setOne = (slug: string, on: boolean) => setOpened((o) => (on ? (o.includes(slug) ? o : [...o, slug]) : o.filter((s) => s !== slug)));
  const collapseAndGo = (slug: string) => {
    setOne(slug, false);
    say('collapse');
    const el = document.getElementById(slug);
    if (!el) return;
    // El documento se encoge mientras se recoge: un scroll "smooth" del navegador pelea con eso y se sacude.
    // Se anima a mano, recalculando el destino en cada cuadro, y se suelta si la persona toca la rueda o la pantalla.
    const top = () => el.getBoundingClientRect().top + window.scrollY - 64;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { window.scrollTo({ top: top(), behavior: 'instant' }); return; }
    const from = window.scrollY;
    const t0 = performance.now();
    const dur = 750;
    let raf = 0;
    const stop = () => { cancelAnimationFrame(raf); window.removeEventListener('wheel', stop); window.removeEventListener('touchstart', stop); window.removeEventListener('keydown', stop); };
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('keydown', stop);
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      const to = top();
      window.scrollTo({ top: from + (to - from) * e, behavior: 'instant' });
      if (k < 1) raf = requestAnimationFrame(step); else stop();
    };
    raf = requestAnimationFrame(step);
  };
  const show = (p: Project) => filter === ALL || p.servicios.includes(filter);

  /** Filtra con animación: los que no corresponden se desvanecen y recién después se quitan; los que quedan entran escalonados. */
  const applyFilter = (next: string) => {
    if (next === filter) return;
    const will = (p: Project) => next === ALL || p.servicios.includes(next);
    setPhase((cur) => {
      const upd = { ...cur };
      PROJECTS.forEach((p) => {
        if (cur[p.slug] !== 'gone' && !will(p)) upd[p.slug] = 'out';
        else if (will(p)) upd[p.slug] = 'in';
      });
      return upd;
    });
    setFilter(next);
    say(next === ALL ? 'filterAll' : 'filter');
    window.setTimeout(() => setPhase((cur) => Object.fromEntries(Object.entries(cur).map(([k, v]) => [k, v === 'out' ? 'gone' : v])) as typeof cur), 380);
    window.setTimeout(() => setPhase((cur) => Object.fromEntries(Object.entries(cur).filter(([, v]) => v !== 'in')) as typeof cur), 1500);
  };
  const shown = PROJECTS.filter(show);
  const allOpen = shown.length > 0 && shown.every((p) => isOpen(p.slug));

  useEffect(() => {
    let t = 0;
    let px = -1;
    let py = -1;
    const onMove = (e: PointerEvent) => { px = e.clientX; py = e.clientY; };
    const onScroll = () => {
      setPeek('');
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const row = (document.elementFromPoint(px, py) as HTMLElement | null)?.closest<HTMLElement>('[data-slug]');
        if (row?.dataset.slug) setPeek(row.dataset.slug);
      }, 160);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('scroll', onScroll); window.clearTimeout(t); };
  }, []);

  // la URL puede traer #proyecto (desde otra página o al cambiar el hash): se abre el caso y se lleva a la vista
  useEffect(() => {
    let t = 0;
    const openFromHash = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      if (!h || !PROJECTS.some((p) => p.slug === h)) return;
      setOne(h, true);
      window.clearTimeout(t);
      t = window.setTimeout(() => document.getElementById(h)?.scrollIntoView({ block: 'start' }), 150);
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => { window.removeEventListener('hashchange', openFromHash); window.clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // riel lateral: se muestra mientras se recorren los casos y marca el que está en el centro de la pantalla
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const secs = Array.from(document.querySelectorAll<HTMLElement>('section.pj')).filter((s) => !s.hidden);
      if (!secs.length) { setRail(false); setActive(''); return; }
      const vh = window.innerHeight;
      const first = secs[0].getBoundingClientRect();
      const last = secs[secs.length - 1].getBoundingClientRect();
      setRail(first.top < vh * 0.55 && last.bottom > vh * 0.45);
      let cur = '';
      for (const s of secs) {
        const r = s.getBoundingClientRect();
        if (r.top <= vh * 0.45 && r.bottom > vh * 0.45) cur = s.id;
      }
      setActive(cur);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    const t = window.setInterval(on, 600); // las secciones cambian de alto al desplegarse o filtrarse
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); window.clearInterval(t); cancelAnimationFrame(raf); };
  }, []);

  // las piezas aparecen al llegar a la pantalla (también las de casos que se vuelven a mostrar al filtrar)
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.pj__tile:not(.is-seen)'));
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-seen')); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-seen'); io.unobserve(e.target); } }),
      { rootMargin: '0px 0px -6% 0px', threshold: 0.04 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [filter]);

  const open = (p: Project, i: number) => { setBox({ slug: p.slug, i }); if (Math.random() < 0.5) say('zoom'); };
  const boxProject = box ? PROJECTS.find((p) => p.slug === box.slug) : null;

  return (
    <>
      <div className="wrap" style={{ paddingBottom: 'var(--space-7)' }}>
        <div className="filters label" role="group" aria-label="Filtrar por servicio">
          {[ALL, ...FILTERS].map((s) => (
            <button key={s} className="chip label" aria-pressed={filter === s} onClick={() => applyFilter(s)}>
              {s}<span className="chip__n">{s === ALL ? PROJECTS.length : PROJECTS.filter((p) => p.servicios.includes(s)).length}</span>
            </button>
          ))}
          <span key={shown.length} className="pj-count label" aria-live="polite">{shown.length} de {PROJECTS.length} proyectos</span>
          <button
            type="button"
            className="chip label pj-all"
            onClick={() => { setOpened(allOpen ? [] : shown.map((p) => p.slug)); say(allOpen ? 'collapseAll' : 'expandAll'); }}
          >
            {allOpen ? '− Recoger todos' : '+ Expandir todos'}
          </button>
        </div>
      </div>

      <section className="wrap section--tight pj-index" style={{ borderTop: '1px solid var(--ink)' }}>
        <ol className="pj-list" aria-label="Índice de clientes">
          {PROJECTS.map((p) => {
            const m = PROJECT_MEDIA[p.slug];
            const pieces = m.gallery.length + 1 + (m.video ? 1 : 0);
            return (
              <li
                key={p.n}
                hidden={gone(p)}
                data-phase={phase[p.slug] || undefined}
                data-slug={p.slug}
                style={css({ '--k': Math.max(0, shown.indexOf(p)), '--rc': p.bg, '--ri': p.ink })}
                onMouseEnter={() => setPeek(p.slug)}
                onMouseLeave={() => setPeek('')}
              >
                <a className="pj-row" href={`#${p.slug}`} onClick={() => setOne(p.slug, true)}>
                  <span className="pj-row__n label">{p.n}</span>
                  <span className="pj-row__thumb" aria-hidden="true"><img src={m.cover.src} alt="" loading="lazy" decoding="async" /></span>
                  <span className="pj-row__name">{p.cliente}</span>
                  <span className="pj-row__rubro">{p.rubro}</span>
                  <span className="pj-row__tags">{p.servicios.map((s) => <i key={s} className="label">{s}</i>)}</span>
                  <span className="pj-row__meta label">{pieces} piezas</span>
                  <span className="pj-row__go" aria-hidden="true">↓</span>
                </a>
              </li>
            );
          })}
        </ol>
        <Peek slug={peek} />
      </section>

      {PROJECTS.map((p) => {
        const m = PROJECT_MEDIA[p.slug];
        const { main, stories, offMain, offStories } = itemsOf(p);
        const vars = css({ '--pj-bg': p.bg, '--pj-ink': p.ink, '--pj-accent': p.accent, '--k': Math.max(0, shown.indexOf(p)) });
        const hasVideo = !!m.video;
        const nStory = stories.length + (hasVideo ? 1 : 0);
        const count = main.length + nStory;
        const on = isOpen(p.slug);
        return (
          <section key={p.slug} id={p.slug} hidden={gone(p)} data-phase={phase[p.slug] || undefined} data-sec className="chapter pj" style={vars} aria-label={p.cliente}>
            <div className="wrap">
              <div className="pj__top">
                <div className="pj__id">
                  <span className="label pj__n">( {p.n} ) <span>{p.rubro}</span>{p.anio ? <span>{p.anio}</span> : null}</span>
                  <h2 className={`pj__name display${p.long ? ' pj__name--long' : ''}`} style={css({ '--len': longest(p.cliente) + 1 })}>
                    {p.cliente}<span className="pj__dot">.</span>
                  </h2>
                </div>
                <div className="pj__info">
                  <p className="body-lg pj__desc">{p.desc}</p>
                  <div className="pj__tags">
                    {p.servicios.map((s) => <span key={s} className="pj__tag label">{s}</span>)}
                  </div>
                </div>
              </div>

              <button type="button" className={`pj__hero${p.coverBg ? ' pj__hero--contain' : ''}`} style={p.coverBg ? css({ background: p.coverBg }) : undefined} onClick={() => open(p, 0)} aria-label={`Ampliar: ${m.cover.alt}`}>
                <img src={m.cover.src} alt={m.cover.alt} width={m.cover.w} height={m.cover.h} loading="lazy" decoding="async" draggable={false} />
                <span className="pj__zoom label" aria-hidden="true">Ampliar</span>
              </button>

              <button
                type="button"
                className="pj__toggle"
                aria-expanded={on}
                aria-controls={`${p.slug}-more`}
                onClick={() => { setOne(p.slug, !on); say(on ? 'collapse' : 'expand'); }}
              >
                <span className="pj__toggle-t">{on ? 'Recoger proyecto' : 'Ver proyecto completo'}</span>
                <span className="pj__toggle-n label">{count} piezas{p.palette ? ' + paleta' : ''}</span>
                <span className="pj__toggle-i" aria-hidden="true" />
              </button>

              <div id={`${p.slug}-more`} className="pj__more" data-open={on ? '1' : '0'}>
               <div className="pj__more-in">
              <ul className="pj__deliv">
                {p.entregables.map((e) => <li key={e}>{e}</li>)}
              </ul>
              {p.palette && (
                <div className="pj__pal" role="img" aria-label={`Paleta de ${p.cliente}: ${p.palette.join(', ')}`}>
                  {p.palette.map((c) => (
                    <span key={c} className="pj__sw" style={css({ background: c, color: readable(c) })}>
                      <i className="label">{c}</i>
                    </span>
                  ))}
                </div>
              )}

              <div className="pj__gal">
                {main.map((g, i) => (
                  <button
                    key={g.src}
                    type="button"
                    className="pj__tile"
                    style={css({ '--i': i % 3 })}
                    onClick={() => open(p, offMain + i)}
                    aria-label={`Ampliar: ${g.alt}`}
                  >
                    <img src={g.src} alt={g.alt} width={g.w} height={g.h} loading="lazy" decoding="async" draggable={false} />
                  </button>
                ))}
              </div>

              {nStory > 0 && (
                <>
                  <span className="label pj__sub">Historias{hasVideo ? ' y video' : ''}</span>
                  <div className="pj__stories" style={css({ '--n': Math.min(nStory, 6) })}>
                    {hasVideo && (
                      <div className="pj__tile pj__tile--vid" style={css({ '--i': 0 })}>
                        <AutoVideo src={m.video!.src} poster={m.cover.src} label={`Secuencia de ${p.cliente}`} />
                      </div>
                    )}
                    {stories.map((g, i) => (
                      <button
                        key={g.src}
                        type="button"
                        className="pj__tile pj__tile--story"
                        style={css({ '--i': (i + (hasVideo ? 1 : 0)) % 3 })}
                        onClick={() => open(p, offStories + i)}
                        aria-label={`Ampliar: ${g.alt}`}
                      >
                        <img src={g.src} alt={g.alt} width={g.w} height={g.h} loading="lazy" decoding="async" draggable={false} />
                      </button>
                    ))}
                  </div>
                </>
              )}

              <button type="button" className="pj__collapse label" onClick={() => collapseAndGo(p.slug)} tabIndex={on ? 0 : -1}>
                ↑ Recoger {p.cliente}
              </button>
               </div>
              </div>
            </div>
          </section>
        );
      })}

      <nav className="pj-rail" data-on={rail ? '1' : '0'} aria-label="Ir a un proyecto" aria-hidden={!rail}>
        {shown.map((p) => (
          <a
            key={p.slug}
            href={`#${p.slug}`}
            className="pj-rail__a"
            data-active={active === p.slug ? '1' : '0'}
            tabIndex={rail ? 0 : -1}
            style={css({ '--rc': p.bg, '--ri': p.ink })}
            onClick={() => setOne(p.slug, true)}
            aria-label={p.cliente}
          >
            <span className="label">{p.n}</span>
            <span className="pj-rail__t" aria-hidden="true">{p.cliente}</span>
          </a>
        ))}
      </nav>

      {box && boxProject && (
        <Lightbox
          items={itemsOf(boxProject).all}
          index={box.i}
          title={boxProject.cliente}
          onIndex={(i) => setBox({ slug: box.slug, i })}
          onClose={() => setBox(null)}
        />
      )}
    </>
  );
}
