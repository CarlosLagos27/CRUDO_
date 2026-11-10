'use client';

import { useRef, useState } from 'react';
import { EDITIONS, type Edition } from '@/lib/mailclub';

const css = (o: Record<string, string | number>) => o as React.CSSProperties;
/** Avisa a Clippy (ClipMascot) de lo que está pasando. */
const say = (group: string) => window.dispatchEvent(new CustomEvent('clippy:say', { detail: { group } }));
const pad = (n: number) => String(n).padStart(2, '0');

/** Sello circular con texto que gira lentamente. */
function Stamp({ n }: { n: string }) {
  const id = `st-${n}`;
  return (
    <svg className="mc-stamp" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs><path id={id} d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" /></defs>
      <g className="mc-stamp__ring"><text><textPath href={`#${id}`}>MAIL CLUB · EDICIÓN {n} · MAIL CLUB · EDICIÓN {n} ·</textPath></text></g>
      <text className="mc-stamp__n" x="60" y="72" textAnchor="middle">{n}</text>
    </svg>
  );
}

function MailEdition({ e, flip }: { e: Edition; flip: boolean }) {
  const [open, setOpen] = useState(false);
  const [hot, setHot] = useState<string | null>(null);
  const stage = useRef<HTMLDivElement>(null);

  // paralaje: las piezas se desplazan según el puntero, más o menos según su profundidad
  const onMove = (ev: React.PointerEvent) => {
    const el = stage.current;
    if (!el || ev.pointerType === 'touch') return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--px', (((ev.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty('--py', (((ev.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };
  const onLeave = () => {
    stage.current?.style.setProperty('--px', '0');
    stage.current?.style.setProperty('--py', '0');
    setHot(null);
  };

  const pick = (id: string) => {
    if (!open) say('mailopen');
    setOpen(true);
    setHot((h) => (h === id ? null : id));
  };

  const vars = css({ '--mc-bg': e.bg, '--mc-ink': e.ink, '--mc-ac': e.accent });
  const loop = [...e.ticker, ...e.ticker];

  return (
    <article className={`mc-card mc-card--${e.id}${flip ? ' mc-card--flip' : ''}`} style={vars} data-rv aria-label={`Mail Club de ${e.mes}`}>
      <span className="mc-num" aria-hidden="true">{e.n}</span>

      <div className="mc-info">
        <span className="label mc-info__n">( Edición {e.n} )</span>
        <h3 className="mc-mes display" style={css({ '--len': e.mes.length + 1 })}>{e.mes}<span className="mc-dot">.</span></h3>
        <p className="mc-tema"><b>{e.tema}.</b> {e.lema}</p>
        <p className="mc-desc">{e.desc}</p>

        <div className="mc-meta label">
          <span>{e.pieces.length} piezas</span>
          <span>Sobre + contenido</span>
        </div>

        <ul className="mc-list" aria-label={`Qué trae el sobre de ${e.mes}`}>
          {e.pieces.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                className={`mc-item${hot === p.id ? ' is-on' : ''}`}
                onMouseEnter={() => open && setHot(p.id)}
                onMouseLeave={() => setHot(null)}
                onFocus={() => open && setHot(p.id)}
                onBlur={() => setHot(null)}
                onClick={() => pick(p.id)}
              >
                <span className="label mc-item__n">{pad(i + 1)}</span>
                <span className="mc-item__t">{p.label}</span>
                <span className="mc-item__arr" aria-hidden="true">↗</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mc-stagewrap">
        <div
          ref={stage}
          className="mc-stage"
          data-open={open ? '1' : '0'}
          data-hot={hot ? '1' : '0'}
          style={css({ '--px': 0, '--py': 0 })}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
        >
          <div className="mc-glow" aria-hidden="true" />
          <Stamp n={e.n} />

          <div className="mc-canvas">
            <img className="mc-layer mc-layer--back" src={e.layers.back.src} alt="" width={e.layers.back.w} height={e.layers.back.h} draggable={false} />
            <img className="mc-layer mc-layer--content" src={e.layers.content.src} alt="" width={e.layers.content.w} height={e.layers.content.h} draggable={false} />
            <img className="mc-layer mc-layer--front" src={e.layers.front.src} alt="" width={e.layers.front.w} height={e.layers.front.h} draggable={false} />
            <img className="mc-layer mc-layer--closed" src={e.layers.closed.src} alt={`Sobre cerrado del Mail Club de ${e.mes}`} width={e.layers.closed.w} height={e.layers.closed.h} draggable={false} />
          </div>

          {/* zona clicable del sobre */}
          <button
            type="button"
            className="mc-env"
            aria-pressed={open}
            aria-label={open ? `Cerrar el sobre de ${e.mes}` : `Abrir el sobre de ${e.mes}`}
            onClick={() => { say(open ? 'mailclose' : 'mailopen'); setOpen((o) => !o); setHot(null); }}
          >
            <span className="mc-env__hint label" aria-hidden="true">{open ? 'Cerrar' : 'Abrir el sobre'}</span>
          </button>

          {e.pieces.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`mc-piece mc-piece--${p.id}${hot === p.id ? ' is-hot' : ''}`}
              data-low={p.y > 58 ? '1' : '0'}
              style={css({ '--x': `${p.x}%`, '--y': `${p.y}%`, '--w': p.w, '--rot': `${p.rot}deg`, '--d': p.d, '--i': i })}
              tabIndex={open ? 0 : -1}
              aria-hidden={!open}
              aria-label={`${p.label}: ${p.note}`}
              onMouseEnter={() => setHot(p.id)}
              onMouseLeave={() => setHot(null)}
              onFocus={() => setHot(p.id)}
              onBlur={() => setHot(null)}
              onClick={() => setHot((h) => (h === p.id ? null : p.id))}
            >
              <img src={p.img.src} alt="" width={p.img.w} height={p.img.h} draggable={false} loading="lazy" />
              <span className="mc-piece__tag" aria-hidden="true"><b>{p.label}</b><i>{p.note}</i></span>
            </button>
          ))}
        </div>

        <button type="button" className="mc-toggle" onClick={() => { say(open ? 'mailclose' : 'mailopen'); setOpen((o) => !o); setHot(null); }} aria-expanded={open}>
          <span>{open ? 'Cerrar el sobre' : 'Abrir el sobre'}</span>
          <span className="mc-toggle__i" aria-hidden="true" />
        </button>
      </div>

      <div className="mc-ticker" aria-hidden="true">
        <div className="mc-ticker__in">
          {loop.map((t, i) => (<span key={i}>{t}<i>✺</i></span>))}
        </div>
      </div>
    </article>
  );
}

export default function MailClub() {
  return (
    <div className="mc">
      {EDITIONS.map((e, i) => (
        <MailEdition key={e.id} e={e} flip={i % 2 === 1} />
      ))}
    </div>
  );
}
