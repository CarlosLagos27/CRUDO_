'use client';

import { useEffect } from 'react';

/**
 * Hace que las pupilas del clip sigan al mouse. Calcula el vector del ojo al puntero en pantalla,
 * lo des-rota según la inclinación actual del clip y lo escribe en --lx/--ly del .clip.
 */
export default function ClipEyes() {
  useEffect(() => {
    const clip = document.querySelector<HTMLElement>('.rev .clip');
    if (!clip) return;
    const whites = Array.from(clip.querySelectorAll<SVGCircleElement>('.eye__w'));
    if (!whites.length) return;
    const MAX = 3.4; // recorrido máximo de la pupila dentro del ojo (unidades del SVG)
    let raf = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      raf = 0;
      const rects = whites.map((w) => w.getBoundingClientRect());
      const cx = rects.reduce((s, r) => s + r.left + r.width / 2, 0) / rects.length;
      const cy = rects.reduce((s, r) => s + r.top + r.height / 2, 0) / rects.length;
      let dx = x - cx;
      let dy = y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, dist / 160); // cerca del ojo, la pupila se mueve menos
      // des-rotar: el clip está girado, la pupila se traslada en su sistema local
      const m = new DOMMatrixReadOnly(getComputedStyle(clip).transform);
      const a = -Math.atan2(m.b, m.a);
      const rx = (dx * Math.cos(a) - dy * Math.sin(a)) / dist;
      const ry = (dx * Math.sin(a) + dy * Math.cos(a)) / dist;
      clip.style.setProperty('--lx', `${(rx * MAX * k).toFixed(2)}px`);
      clip.style.setProperty('--ly', `${(ry * MAX * k).toFixed(2)}px`);
    };

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const reset = () => {
      clip.style.removeProperty('--lx');
      clip.style.removeProperty('--ly');
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', reset);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', reset);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
