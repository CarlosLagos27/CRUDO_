'use client';

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
  return (
    <header className="wrap header">
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
    </header>
  );
}
