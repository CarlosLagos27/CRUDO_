'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Entrada escalonada: cada [data-rv] sube y aparece una vez al entrar en pantalla. */
export default function RevealInit() {
  const path = usePathname();

  useEffect(() => {
    document.documentElement.classList.add('rv-ready');
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-rv], [data-sec], main > section, footer'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -15% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);

  return null;
}
