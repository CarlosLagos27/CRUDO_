'use client';

import { useEffect, useRef, useState } from 'react';

/** Video corto en bucle: se reproduce solo (mudo) cuando está a la vista, se pausa al salir y al hacer clic. */
export default function AutoVideo({ src, poster, label }: { src: string; poster?: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const manual = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) { setPaused(true); return; }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !manual.current) v.play().then(() => setPaused(false)).catch(() => setPaused(true));
        else v.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { manual.current = false; v.play().then(() => setPaused(false)).catch(() => {}); }
    else { manual.current = true; v.pause(); setPaused(true); }
  };

  return (
    <button type="button" className="pj__vid" onClick={toggle} aria-label={paused ? `Reproducir: ${label}` : `Pausar: ${label}`}>
      <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" aria-hidden="true" />
      <span className="pj__vid-state label" aria-hidden="true">{paused ? '▶ Play' : '❚❚ Pausa'}</span>
    </button>
  );
}
