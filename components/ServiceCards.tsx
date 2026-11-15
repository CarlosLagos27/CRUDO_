'use client';

import { useState } from 'react';
import { PACKS } from '@/lib/data';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Servicios como cartas que se dan vuelta: al frente el título sobre el logo difuminado,
 * al dorso el detalle. Un clic la voltea y otro clic la vuelve. El cursor animado enseña el gesto
 * hasta que la persona voltea la primera.
 */
export default function ServiceCards() {
  const [flipped, setFlipped] = useState<boolean[]>(() => PACKS.map(() => false));
  const [touched, setTouched] = useState(false);
  const toggle = (i: number) => {
    setTouched(true);
    setFlipped((f) => f.map((v, k) => (k === i ? !v : v)));
  };

  return (
    <div className="flc" data-touched={touched ? '1' : '0'}>
      {PACKS.map((p, i) => {
        const on = flipped[i];
        return (
          <button
            key={p.name}
            type="button"
            className={`flc__card${p.red ? ' flc__card--red' : ''}`}
            data-flipped={on ? '1' : '0'}
            aria-pressed={on}
            aria-label={`${p.name}: ${on ? 'volver al frente' : 'ver detalle'}`}
            onClick={() => toggle(i)}
          >
            <span className="flc__inner">
              <span className="flc__face flc__front">
                <span className="flc__logo display" aria-hidden="true">Crudo_</span>
                <span className="label flc__n">( {pad(i + 1)} )</span>
                <span className="flc__title display">{p.name}</span>
                <span className="label flc__tip">Tocá para ver</span>
                <span className="flc__cur" aria-hidden="true">
                  <i className="tap" />
                  <span className="arrow"><svg viewBox="0 0 24 24" focusable="false"><path d="M5 3V19.2L9.1 15.4L11.9 21.6L14.8 20.3L12 14.2H17.8Z" /></svg></span>
                </span>
              </span>
              <span className="flc__face flc__back" aria-hidden={!on}>
                <span className="flc__logo display" aria-hidden="true">Crudo_</span>
                <span className="label flc__n">( {pad(i + 1)} ) {p.name}</span>
                <span className="flc__d">{p.desc}</span>
                {p.items && <ul className="flc__items">{p.items.map((it) => <li key={it}>{it}</li>)}</ul>}
                <span className="label flc__tip">Tocá para volver</span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
