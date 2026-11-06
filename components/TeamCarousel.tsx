'use client';

import { useEffect, useRef, useState } from 'react';
import { PHOTOS, TEAM } from '@/lib/data';

const rv = (i: number) => ({ ['--i' as string]: i }) as React.CSSProperties;
const pad = (n: number) => String(n).padStart(2, '0');

type Slide = {
  key: string;
  tab: string;
  eyebrow: string;
  name: string;
  role: string;
  bio: string;
  photo: { src: string; alt: string; pos?: string } | null;
  placeholder: string;
};

/** Primero el grupo, después cada integrante por separado. */
const SLIDES: Slide[] = [
  {
    key: 'grupo',
    tab: 'Las tres',
    eyebrow: '( Las tres )',
    name: 'Las tres, juntas',
    role: 'ARG // COL',
    bio: '[Texto sobre el equipo: cómo se conocieron, qué mezcla trae cada una y cómo se trabaja con Crudo_.]',
    photo: PHOTOS.equipo,
    placeholder: '',
  },
  ...TEAM.map((m, i) => ({
    key: `m${i}`,
    tab: m.name.startsWith('[') ? `[Integrante ${i + 1}]` : m.name,
    eyebrow: `( Integrante ${pad(i + 1)} )`,
    name: m.name,
    role: `${m.role} · ${m.origin}`,
    bio: m.bio,
    photo: m.photo,
    placeholder: '[Foto de la integrante]',
  })),
];

/**
 * Carrusel de equipo: scroll horizontal con snap (se desliza con el dedo o el trackpad),
 * pestañas, flechas y teclado. La slide activa dispara las animaciones de entrada.
 */
export default function TeamCarousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const last = SLIDES.length - 1;

  useEffect(() => {
    const root = scroller.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        });
      },
      { root, threshold: 0.6 },
    );
    slideRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (i: number) => {
    const el = scroller.current;
    if (!el) return;
    const n = Math.max(0, Math.min(last, i));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: n * el.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
    setActive(n);
  };

  return (
    <div
      className="team"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Quiénes somos"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
      }}
    >
      <div className="team__tabs" role="group" aria-label="Elegir integrante">
        {SLIDES.map((s, i) => (
          <button key={s.key} type="button" className="chip" aria-pressed={active === i} onClick={() => go(i)}>
            {s.tab}
          </button>
        ))}
      </div>

      <div className="team__scroller" ref={scroller}>
        {SLIDES.map((s, i) => (
          <article
            key={s.key}
            ref={(el) => { slideRefs.current[i] = el; }}
            data-i={i}
            className={`team__slide${active === i ? ' is-active' : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${SLIDES.length}`}
          >
            <div className="team__photo">
              {s.photo ? (
                <img src={s.photo.src} alt={s.photo.alt} style={{ objectPosition: s.photo.pos }} draggable={false} />
              ) : (
                <div className="team__ph" role="img" aria-label="Espacio para la foto">
                  <span className="label">{s.placeholder}</span>
                </div>
              )}
              <span className="team__num label">{pad(i + 1)} / {pad(SLIDES.length)}</span>
            </div>

            <div className="team__text">
              <span className="label" style={rv(0)}>{s.eyebrow}</span>
              <h3 className="team__name display" style={rv(1)}>{s.name}</h3>
              <p className="team__role label" style={rv(2)}>{s.role}</p>
              <p className="body-lg team__bio" style={rv(3)}>{s.bio}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="team__ctl">
        <button type="button" className="team__arrow" aria-label="Anterior" disabled={active === 0} onClick={() => go(active - 1)}>←</button>
        <span className="team__progress" aria-hidden="true"><i style={{ transform: `scaleX(${(active + 1) / SLIDES.length})` }} /></span>
        <button type="button" className="team__arrow" aria-label="Siguiente" disabled={active === last} onClick={() => go(active + 1)}>→</button>
      </div>
    </div>
  );
}
