'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PHOTOS } from '@/lib/data';
import { ArrowOut } from '@/components/Parts';

type Step = {
  n: string;
  t: string;
  k: 'idea' | 'proceso' | 'resultado';
  d: string;
  link: { href: string; label: string };
};

/** Los tres pasos del método. Los textos son editables; los enlaces llevan a casos reales de Proyectos. */
const STEPS: Step[] = [
  { n: '01', t: 'La idea', k: 'idea', d: 'Partimos de tu idea tal como viene: la escuchamos, la ordenamos y definimos hacia dónde va.', link: { href: '/proyectos/#piccolino', label: 'Ver el caso: Piccolino' } },
  { n: '02', t: 'El proceso', k: 'proceso', d: 'Diseño, cámara y medios tradicionales: probamos, ajustamos y te mostramos el avance en cada paso.', link: { href: '/proyectos/', label: 'Ver todos los proyectos' } },
  { n: '03', t: 'El resultado', k: 'resultado', d: 'Una marca, una pieza o una campaña lista para salir al mundo.', link: { href: '/proyectos/#malcriada', label: 'Ver el caso: Malcriada' } },
];

/**
 * "La idea · el proceso · el resultado": tres renglones a todo el ancho. El que está en el centro de la pantalla
 * (o bajo el puntero) se enciende: su foto se despliega de lado a lado, el texto pasa a claro y el resto se apaga.
 * Funciona sin mouse: al hacer scroll se van encendiendo en orden.
 */
export default function Steps() {
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const [scrollOn, setScrollOn] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const on = hover ?? scrollOn;

  // el renglón que cruza una franja fina en el centro de la pantalla
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const ratio = new Map<number, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratio.set(Number((e.target as HTMLElement).dataset.i), e.isIntersecting ? e.intersectionRatio : 0));
        let best: number | null = null;
        let top = 0;
        ratio.forEach((r, i) => { if (r > top) { top = r; best = i; } });
        setScrollOn(best);
      },
      { rootMargin: '-42% 0px -42% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    rows.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="steps-sec" aria-label="Cómo trabajamos">
      <div className="wrap steps-head">
        <span className="label">( Cómo trabajamos )</span>
      </div>
      <ol className="how" data-any={on !== null ? '1' : '0'}>
        {STEPS.map((s, i) => {
          const p = PHOTOS[s.k];
          return (
            <li
              key={s.n}
              ref={(el) => { rows.current[i] = el; }}
              data-i={i}
              className="hstep"
              data-on={on === i ? '1' : '0'}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            >
              <img className="hstep__bg" src={p.src} alt={p.alt} style={{ objectPosition: p.pos }} loading="lazy" draggable={false} />
              <div className="hstep__veil" aria-hidden="true" />
              <div className="wrap hstep__in">
                <span className="label hstep__n">( {s.n} )</span>
                <h3 className="hstep__t display">
                  {s.t}
                  <span className="hstep__ph" aria-hidden="true">
                    <span className={i === 2 ? 'hstep__p hstep__p--red' : 'hstep__p'}>{i === 2 ? '*(' : '('}</span>
                    <img src={p.src} alt="" style={{ objectPosition: p.pos }} draggable={false} />
                    <span className={i === 2 ? 'hstep__p hstep__p--red' : 'hstep__p'}>)</span>
                  </span>
                </h3>
                <div className="hstep__d">
                  <p>{s.d}</p>
                  <Link href={s.link.href} className="hstep__link">
                    {s.link.label} <ArrowOut />
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
