'use client';

import { useEffect, useRef, useState } from 'react';
import { EDITIONS, type Edition } from '@/lib/mailclub';

const css = (o: Record<string, string | number>) => o as React.CSSProperties;
const pad = (n: number) => String(n).padStart(2, '0');

/** Avisa a Clippy (ClipMascot) de lo que está pasando; `slug` elige mensajes específicos (p. ej. "septiembre:sudoku"). */
const say = (group: string, slug?: string) => window.dispatchEvent(new CustomEvent('clippy:say', { detail: { group, slug } }));

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

/**
 * Una edición del Mail Club. Cerrada ocupa todo el ancho (título grande y el sobre al centro);
 * al abrir el sobre la tarjeta pasa a mitad y mitad: el detalle a un lado y el escenario con las piezas al otro.
 * Al elegir una pieza para verla a detalle, pasa al frente: vuela al centro del escenario, se agranda y el resto se atenúa.
 */
function MailEdition({ e, flip }: { e: Edition; flip: boolean }) {
  const [open, setOpen] = useState(false);
  const [settled, setSettled] = useState(false);
  const [hot, setHot] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [lastFocus, setLastFocus] = useState<string>(e.pieces[0].id);
  const stage = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const lastSay = useRef(0);

  // tras la entrada en cascada, las piezas dejan de tener demora: así reaccionan al instante al resaltarlas o enfocarlas
  useEffect(() => {
    if (!open) { setSettled(false); return; }
    const t = window.setTimeout(() => setSettled(true), 1700);
    return () => window.clearTimeout(t);
  }, [open]);

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

  /** Resalta una pieza al pasar el puntero y Clippy comenta de qué se trata (máximo una vez cada 3 s). */
  const hover = (id: string | null) => {
    if (focus) return;
    setHot(id);
    const now = Date.now();
    if (id && now - lastSay.current > 3000) {
      lastSay.current = now;
      say('mailpiece', `${e.id}:${id}`);
    }
  };

  /** Pasa una pieza al frente (o la devuelve a su lugar si ya estaba al frente). */
  const bring = (id: string | null) => {
    setHot(null);
    setFocus(id);
    if (id) {
      setLastFocus(id);
      lastSay.current = Date.now();
      say('mailpiece', `${e.id}:${id}`);
    }
  };

  const toggle = () => {
    say(open ? 'mailclose' : 'mailopen', `mc-${e.id}`);
    setOpen((o) => !o);
    setHot(null);
    setFocus(null);
  };

  const pick = (id: string) => {
    if (!open) { say('mailopen', `mc-${e.id}`); setOpen(true); }
    bring(focus === id ? null : id);
  };

  const step = (d: number) => {
    const i = e.pieces.findIndex((p) => p.id === focus);
    if (i < 0) return;
    bring(e.pieces[(i + d + e.pieces.length) % e.pieces.length].id);
  };

  // la pieza al frente se escala para llenar buena parte del escenario sin pasarse ni pixelarse; teclado: ← → Esc
  useEffect(() => {
    if (!focus) return;
    const apply = () => {
      const b = box.current;
      const p = e.pieces.find((x) => x.id === focus);
      if (!b || !p) return;
      const bw = b.clientWidth;
      const bh = b.clientHeight;
      const pw = (bw * p.w) / 100;
      const ph = (pw * p.img.h) / p.img.w;
      const fs = Math.max(1, Math.min((0.8 * bh) / ph, (0.84 * bw) / pw, (p.img.w / pw) * 1.3));
      b.style.setProperty('--fs', fs.toFixed(3));
    };
    apply();
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') bring(null);
      else if (ev.key === 'ArrowRight') step(1);
      else if (ev.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('resize', apply);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('resize', apply); window.removeEventListener('keydown', onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  const vars = css({ '--mc-bg': e.bg, '--mc-ink': e.ink, '--mc-ac': e.accent });
  const loop = [...e.ticker, ...e.ticker];
  const cur = e.pieces.find((p) => p.id === lastFocus) ?? e.pieces[0];
  const curIdx = e.pieces.findIndex((p) => p.id === cur.id);

  return (
    <article
      className={`mc-card mc-card--${e.id}${flip ? ' mc-card--flip' : ''}`}
      style={vars}
      data-open={open ? '1' : '0'}
      data-edition={e.id}
      data-rv
      aria-label={`Mail Club de ${e.mes}`}
    >
      <span className="mc-num" aria-hidden="true">{e.n}</span>

      <header className="mc-head">
        <span className="label mc-head__n">( Edición {e.n} )</span>
        <h3 className="mc-mes display" style={css({ '--len': e.mes.length + 1 })}>{e.mes}<span className="mc-dot">.</span></h3>
        <p className="mc-tema"><b>{e.tema}.</b> {e.lema}</p>
      </header>

      <div className="mc-body">
        <aside className="mc-info">
          <div className="mc-info__in">
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
                    className={`mc-item${hot === p.id || focus === p.id ? ' is-on' : ''}`}
                    aria-pressed={focus === p.id}
                    onMouseEnter={() => open && hover(p.id)}
                    onMouseLeave={() => hover(null)}
                    onFocus={() => open && hover(p.id)}
                    onBlur={() => hover(null)}
                    onClick={() => pick(p.id)}
                  >
                    <span className="label mc-item__n">{pad(i + 1)}</span>
                    <span className="mc-item__t">{p.label}</span>
                    <span className="mc-item__arr" aria-hidden="true">{focus === p.id ? '×' : '↗'}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="mc-stagewrap">
          <div
            ref={stage}
            className="mc-stage"
            data-open={open ? '1' : '0'}
            data-hot={hot ? '1' : '0'}
            data-focus={focus ? '1' : '0'}
            data-settled={settled ? '1' : '0'}
            style={css({ '--px': 0, '--py': 0 })}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
          >
            {/* velo que atenúa todo menos la pieza al frente; al hacer clic se vuelve al sobre */}
            <button type="button" className="mc-dim" aria-label="Volver al sobre" tabIndex={focus ? 0 : -1} onClick={() => bring(null)} />

            <div ref={box} className="mc-box">
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
                onClick={toggle}
              >
                <span className="mc-env__hint label" aria-hidden="true">{open ? 'Cerrar' : 'Abrir el sobre'}</span>
              </button>

              {e.pieces.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className={`mc-piece mc-piece--${p.id}${hot === p.id ? ' is-hot' : ''}${focus === p.id ? ' is-focus' : ''}`}
                  data-low={p.y > 58 ? '1' : '0'}
                  style={css({ '--x': `${p.x}%`, '--y': `${p.y}%`, '--w': p.w, '--rot': `${p.rot}deg`, '--d': p.d, '--i': i })}
                  tabIndex={open ? 0 : -1}
                  aria-hidden={!open}
                  aria-pressed={focus === p.id}
                  aria-label={`${focus === p.id ? 'Volver' : 'Ver a detalle'}: ${p.label}. ${p.note}`}
                  onMouseEnter={() => hover(p.id)}
                  onMouseLeave={() => hover(null)}
                  onFocus={() => hover(p.id)}
                  onBlur={() => hover(null)}
                  onClick={() => bring(focus === p.id ? null : p.id)}
                >
                  <img src={p.img.src} alt="" width={p.img.w} height={p.img.h} draggable={false} loading="lazy" />
                  <span className="mc-piece__tag" aria-hidden="true"><b>{p.label}</b><i>{p.note}</i></span>
                </button>
              ))}

              {/* barra de la pieza al frente: nombre, nota, y flechas para pasar a la anterior o siguiente */}
              <div className="mc-cap" role="group" aria-label="Detalle de la pieza" aria-hidden={!focus}>
                <button type="button" className="mc-cap__btn" aria-label="Pieza anterior" tabIndex={focus ? 0 : -1} onClick={() => step(-1)}>←</button>
                <span className="mc-cap__t">
                  <span className="label">{pad(curIdx + 1)} / {pad(e.pieces.length)}</span>
                  <b>{cur.label}</b>
                  <i>{cur.note}</i>
                </span>
                <button type="button" className="mc-cap__btn" aria-label="Pieza siguiente" tabIndex={focus ? 0 : -1} onClick={() => step(1)}>→</button>
                <button type="button" className="mc-cap__btn mc-cap__x" aria-label="Volver al sobre" tabIndex={focus ? 0 : -1} onClick={() => bring(null)}>×</button>
              </div>
            </div>
          </div>

          <button type="button" className="mc-toggle" onClick={toggle} aria-expanded={open}>
            <span>{open ? 'Cerrar el sobre' : 'Abrir el sobre'}</span>
            <span className="mc-toggle__i" aria-hidden="true" />
          </button>
        </div>
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
