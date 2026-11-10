'use client';

import { useEffect, useRef } from 'react';
import type { ProjectImage } from '@/lib/data';

type Props = {
  items: ProjectImage[];
  index: number;
  title: string;
  onIndex: (i: number) => void;
  onClose: () => void;
};

/** Visor de imágenes a pantalla completa: flechas, teclado (← → Esc), deslizar con el dedo y foco devuelto al cerrar. */
export default function Lightbox({ items, index, title, onIndex, onClose }: Props) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);
  const start = useRef<number | null>(null);
  const n = items.length;
  const cur = items[index];
  const go = (d: number) => onIndex((index + d + n) % n);

  useEffect(() => {
    opener.current = document.activeElement;
    closeBtn.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // precarga las vecinas para que el cambio sea inmediato
  useEffect(() => {
    [index + 1, index - 1].forEach((i) => {
      const it = items[(i + n) % n];
      if (it) { const im = new Image(); im.src = it.src; }
    });
  }, [index, items, n]);

  if (!cur) return null;
  return (
    <div
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label={`${title}: imagen ${index + 1} de ${n}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onPointerDown={(e) => { start.current = e.clientX; }}
      onPointerUp={(e) => {
        if (start.current == null) return;
        const dx = e.clientX - start.current;
        start.current = null;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
      }}
    >
      <button ref={closeBtn} type="button" className="lb__btn lb__close" aria-label="Cerrar" onClick={onClose}>×</button>
      <figure className="lb__fig">
        <img key={cur.src} className="lb__img" src={cur.src} alt={cur.alt} width={cur.w} height={cur.h} draggable={false} />
        <figcaption className="lb__cap">
          <span className="label">{title}</span>
          <span className="lb__alt">{cur.alt}</span>
          <span className="label lb__count">{String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        </figcaption>
      </figure>
      {n > 1 && (
        <>
          <button type="button" className="lb__btn lb__prev" aria-label="Anterior" onClick={() => go(-1)}>←</button>
          <button type="button" className="lb__btn lb__next" aria-label="Siguiente" onClick={() => go(1)}>→</button>
        </>
      )}
    </div>
  );
}
