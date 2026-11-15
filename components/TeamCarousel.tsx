'use client';

import { useRef, useState } from 'react';
import { PHOTOS, TEAM } from '@/lib/data';

const rv = (i: number) => ({ ['--i' as string]: i }) as React.CSSProperties;
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Capas de la foto grupal (todas con el mismo lienzo 1440×1080, así encajan píxel a píxel).
 * ox: centro horizontal de la integrante, para que el zoom salga desde ella.
 * Orden de izquierda a derecha: Laura, Luz, Valeria.
 */
const LAYERS = [
  { src: '/equipo/laura.webp', ox: '18%' },
  { src: '/equipo/luz.webp', ox: '50%' },
  { src: '/equipo/valeria.webp', ox: '81%' },
];

/** Orden de aparición: Luz (centro), Laura (izquierda), Valeria (derecha). Índice dentro de LAYERS. */
const ORDER = [1, 0, 2];

type Slide = {
  key: string;
  tab: string;
  eyebrow: string;
  name: string;
  role: string;
  bio: string;
};

/** Primero el grupo, después el centro, la izquierda y la derecha (TEAM ya viene en ese orden). */
const SLIDES: Slide[] = [
  {
    key: 'grupo',
    tab: 'Las tres',
    eyebrow: '( Las tres )',
    name: 'Somos Crudo_',
    role: 'ARG // COL',
    bio: 'Somos un equipo de mujeres que cree que toda gran idea empieza en crudo, como una hoja en blanco o un archivo RAW. Luz le da vida a las historias desde la dirección creativa y la producción audiovisual, Valeria las convierte en imágenes que comunican y Laura las lleva a las redes para que conecten con su comunidad. Juntas combinamos estrategia, diseño y creatividad para que cada marca encuentre su voz. Nos gusta trabajar cerca, escuchar y construir cada proyecto desde cero. Tomamos tus ideas en su estado más crudo y las convertimos en algo real.',
  },
  ...TEAM.map((m, i) => ({
    key: `m${i}`,
    tab: m.name.startsWith('[') ? `[Integrante ${i + 1}]` : m.name,
    eyebrow: `( Integrante ${pad(i + 1)} )`,
    name: m.name,
    role: m.origin ? `${m.role} · ${m.origin}` : m.role,
    bio: m.bio,
  })),
];

/**
 * Carrusel de equipo: una sola foto en capas. La integrante activa se agranda y queda nítida,
 * las otras dos se desenfocan. Pestañas, flechas, teclado y swipe cambian de integrante.
 */
export default function TeamCarousel() {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(0);
  const [dir, setDir] = useState(1);
  const touchX = useRef<number | null>(null);
  const last = SLIDES.length - 1;
  const go = (i: number) => {
    const n = Math.max(0, Math.min(last, i));
    if (n === active) return;
    setPrev(active);
    setDir(n > active ? 1 : -1);
    setActive(n);
  };
  /** Parallax: las capas siguen el puntero, cada una con su profundidad. */
  const tilt = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--px', String(((e.clientX - r.left) / r.width - 0.5) * 2));
    e.currentTarget.style.setProperty('--py', String(((e.clientY - r.top) / r.height - 0.5) * 2));
  };
  const untilt = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--px', '0');
    e.currentTarget.style.setProperty('--py', '0');
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

      <div
        className="team__stage"
        style={{ ['--dir' as string]: dir } as React.CSSProperties}
        onPointerDown={(e) => { touchX.current = e.clientX; }}
        onPointerUp={(e) => {
          if (touchX.current === null) return;
          const dx = e.clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
        }}
        onPointerCancel={() => { touchX.current = null; }}
      >
        <div className="team__photo" data-a={active} role="img" aria-label={PHOTOS.equipo.alt} onPointerMove={tilt} onPointerLeave={untilt}>
          <img className="team__layer team__layer--bg" src="/equipo/fondo.webp" alt="" draggable={false} />
          <img className="team__layer team__layer--base" src="/equipo/grupo.webp" alt="" draggable={false} />
          {LAYERS.map((l, i) => (
            <div
              key={l.src}
              className={`team__layer team__layer--m${active > 0 && ORDER[active - 1] === i ? ' is-on' : ''}`}
              style={{ ['--ox' as string]: l.ox } as React.CSSProperties}
            >
              <img className="team__ring" src={l.src.replace('.webp', '-borde.webp')} alt="" draggable={false} />
              <img src={l.src} alt="" draggable={false} />
            </div>
          ))}
          <img className="team__layer team__layer--all" src="/equipo/completa.webp" alt="" draggable={false} />
          <img className="team__layer team__layer--all team__layer--allring" src="/equipo/grupo-borde.webp" alt="" draggable={false} />
          <span key={active} className="team__num is-pop label">{pad(active + 1)} / {pad(SLIDES.length)}</span>
        </div>

        <div className="team__texts">
          {SLIDES.map((s, i) => (
            <article
              key={s.key}
              data-i={i}
              className={`team__slide${active === i ? ' is-active' : ''}${prev === i && prev !== active ? ' is-leaving' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${SLIDES.length}`}
              aria-hidden={active !== i}
            >
              <div className="team__text">
                <span className="label" style={rv(0)}>{s.eyebrow}</span>
                <h3 className="team__name display" style={rv(1)}>{s.name}</h3>
                <p className="team__role label" style={rv(2)}>{s.role}</p>
                <p className="body-lg team__bio" style={rv(3)}>{s.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="team__ctl">
        <button type="button" className="team__arrow" aria-label="Anterior" disabled={active === 0} onClick={() => go(active - 1)}>←</button>
        <span className="team__progress" aria-hidden="true"><i style={{ transform: `scaleX(${(active + 1) / SLIDES.length})` }} /></span>
        <button type="button" className="team__arrow" aria-label="Siguiente" disabled={active === last} onClick={() => go(active + 1)}>→</button>
      </div>
    </div>
  );
}
