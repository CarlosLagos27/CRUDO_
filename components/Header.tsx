'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV } from '@/lib/data';
import { Clip, Wordmark } from '@/components/Brand';

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Crudo_, inicio">
      <Clip size={22} color="var(--red)" />
      <Wordmark />
    </Link>
  );
}

export default function Header() {
  const path = usePathname();
  const ref = useRef<HTMLElement>(null);

  /** Toma el color de la sección que está debajo del header: lo usa de fondo translúcido y elige texto claro u oscuro. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let last = '';
    const sample = () => {
      raf = 0;
      const h = el.offsetHeight;
      const stack = document.elementsFromPoint(4, h + 2);
      let rgb: number[] | null = null;
      for (let n: Element | null = stack[0] ?? null; n && !rgb; n = n.parentElement) {
        const bg = getComputedStyle(n).backgroundColor;
        const m = bg.match(/[\d.]+/g);
        if (m && (m.length < 4 || Number(m[3]) > 0.5)) {
          const k = bg.startsWith('color(') ? 255 : 1; // color(srgb r g b) viene en 0–1
          rgb = m.slice(0, 3).map((v) => Math.round(Number(v) * k));
        }
      }
      if (!rgb) return;
      const key = rgb.join(',');
      if (key === last) return;
      last = key;
      const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
      el.style.setProperty('--hdr-bg', `rgb(${key})`);
      el.dataset.tone = lum < 0.5 ? 'dark' : 'light';
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(sample); };
    sample();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, [path]);

  return (
    <header className="site-header" ref={ref}>
      <div className="wrap header">
      <Logo />
      <nav className="nav label" aria-label="Principal">
        {NAV.map((l) => {
          const active = path.startsWith(l.href) || (path === '/' && l.href === '/nosotras/');
          return (
            <Link key={l.href} href={l.href} aria-current={active ? 'page' : undefined}>
              {active ? '● ' : ''}
              {l.label}
            </Link>
          );
        })}
      </nav>
      </div>
    </header>
  );
}
