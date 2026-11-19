'use client';

import { useEffect, useRef } from 'react';

type Props = { src: string; poster?: string; title: string; onClose: () => void };

/** Video a pantalla completa con controles; Esc o clic afuera lo cierran y el foco vuelve al botón que lo abrió. */
export default function VideoLightbox({ src, poster, title, onClose }: Props) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    opener.current = document.activeElement;
    closeBtn.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      (opener.current as HTMLElement | null)?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label={`${title}: video`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <button ref={closeBtn} type="button" className="lb__btn lb__close" aria-label="Cerrar" onClick={onClose}>×</button>
      <figure className="lb__fig">
        <video className="lb__img lb__video" src={src} poster={poster} controls autoPlay loop playsInline />
        <figcaption className="lb__cap">
          <span className="label">{title}</span>
          <span className="lb__alt">Secuencia en video</span>
        </figcaption>
      </figure>
    </div>
  );
}
