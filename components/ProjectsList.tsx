'use client';

import { useEffect, useRef, useState } from 'react';
import { PROJECTS, PROJECT_MEDIA, SERVICES, type Project, type ProjectImage } from '@/lib/data';
import Lightbox from '@/components/Lightbox';
import AutoVideo from '@/components/AutoVideo';

const ALL = 'Todos';
const FILTERS = SERVICES.filter((s) => PROJECTS.some((p) => p.servicios.includes(s)));

const css = (o: Record<string, string | number>) => o as React.CSSProperties;

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

export default function ProjectsList() {
  const [filter, setFilter] = useState(ALL);
  const [box, setBox] = useState<{ slug: string; i: number } | null>(null);
  const [peek, setPeek] = useState('');
  const peekEl = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState<string[]>([]);
  const isOpen = (slug: string) => opened.includes(slug);
  const setOne = (slug: string, on: boolean) => setOpened((o) => (on ? (o.includes(slug) ? o : [...o, slug]) : o.filter((s) => s !== slug)));
  const collapseAndGo = (slug: string) => {
    setOne(slug, false);
    document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const show = (p: Project) => filter === ALL || p.servicios.includes(filter);
  const shown = PROJECTS.filter(show);
  const allOpen = shown.length > 0 && shown.every((p) => isOpen(p.slug));

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

  const open = (p: Project, i: number) => setBox({ slug: p.slug, i });
  const boxProject = box ? PROJECTS.find((p) => p.slug === box.slug) : null;

  return (
    <>
      <div className="wrap" style={{ paddingBottom: 'var(--space-7)' }}>
        <div className="filters label" role="group" aria-label="Filtrar por servicio">
          {[ALL, ...FILTERS].map((s) => (
            <button key={s} className="chip label" aria-pressed={filter === s} onClick={() => setFilter(s)}>
              {s}
            </button>
          ))}
          <button
            type="button"
            className="chip label pj-all"
            onClick={() => setOpened(allOpen ? [] : shown.map((p) => p.slug))}
          >
            {allOpen ? '− Recoger todos' : '+ Expandir todos'}
          </button>
        </div>
      </div>

      <section className="wrap section--tight pj-index" style={{ borderTop: '1px solid var(--ink)' }}>
        <div className="table-box">
          <table className="proj-table">
            <thead>
              <tr className="label">
                <th>Nº</th><th>Cliente</th><th>Rubro</th><th>Servicios</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr
                  key={p.n}
                  onMouseEnter={() => setPeek(PROJECT_MEDIA[p.slug].cover.src)}
                  onMouseLeave={() => setPeek('')}
                  onMouseMove={(e) => { if (peekEl.current) peekEl.current.style.transform = `translate(${e.clientX + 24}px, ${e.clientY - 90}px)`; }}
                >
                  <td className="label red"><a href={`#${p.slug}`} tabIndex={-1} aria-hidden="true">{p.n}</a></td>
                  <td><a className="pj-index__name" href={`#${p.slug}`} onClick={() => setOne(p.slug, true)}>{p.cliente}<span className="pj-index__arr" aria-hidden="true">↓</span></a></td>
                  <td>{p.rubro}</td>
                  <td>{p.servicios.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div ref={peekEl} className="pj-peek" data-on={peek ? '1' : '0'} aria-hidden="true">
          {peek && <img src={peek} alt="" />}
        </div>
      </section>

      {PROJECTS.map((p) => {
        const m = PROJECT_MEDIA[p.slug];
        const { main, stories, offMain, offStories } = itemsOf(p);
        const vars = css({ '--pj-bg': p.bg, '--pj-ink': p.ink, '--pj-accent': p.accent });
        const hasVideo = !!m.video;
        const nStory = stories.length + (hasVideo ? 1 : 0);
        const count = main.length + nStory;
        const on = isOpen(p.slug);
        return (
          <section key={p.slug} id={p.slug} hidden={!show(p)} data-sec className="chapter pj" style={vars} aria-label={p.cliente}>
            <div className="wrap">
              <div className="pj__top">
                <div className="pj__id">
                  <span className="label pj__n">( {p.n} ) <span>{p.rubro}</span>{p.anio ? <span>{p.anio}</span> : null}</span>
                  <h2 className={`pj__name display${p.long ? ' pj__name--long' : ''}`}>
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
                onClick={() => setOne(p.slug, !on)}
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
