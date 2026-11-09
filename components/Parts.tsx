import Link from 'next/link';
import { PHOTOS } from '@/lib/data';

type PhotoKey = keyof typeof PHOTOS;

/** Foto encajada entre paréntesis: la firma del sitio. */
export function ParenPhoto({ k, red = false }: { k: PhotoKey; red?: boolean }) {
  const p = PHOTOS[k];
  const c = red ? { color: 'var(--red)' } : undefined;
  return (
    <>
      <span style={c}>{red ? '*(' : '('}</span>
      <img src={p.src} alt={p.alt} style={{ objectPosition: p.pos }} />
      <span style={c}>)</span>
    </>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="label">{children}</span>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="heading-section">
      {children}
      <span className="dot">.</span>
    </h2>
  );
}

/** Flecha ↗ en SVG: al pasar el mouse por la card se despliega (el asta se dibuja y la punta sale). */
export function ArrowOut() {
  return (
    <svg className="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path className="arr__sh" pathLength="1" d="M5 19L19 5" />
      <path className="arr__hd" d="M8 5H19V16" />
    </svg>
  );
}

/** Tiles de cierre: siguiente página + Hablemos. */
export function NextTiles({ next }: { next: { href: string; label: string } }) {
  return (
    <section className="wrap" style={{ paddingBottom: 'var(--space-9)' }}>
      <div className="tiles">
        <Link href={next.href} className="tile tile--ink">
          <span className="label">Siguiente</span>
          <span className="tile__title">{next.label} <ArrowOut /></span>
        </Link>
        <Link href="/contacto/" className="tile tile--yellow">
          <span className="label">¿Tenés una idea en crudo?</span>
          <span className="tile__title">Hablemos <ArrowOut /></span>
        </Link>
      </div>
    </section>
  );
}

/** Banda roja de contacto. */
export function ContactBand() {
  return (
    <section className="wrap" style={{ paddingBottom: 'var(--space-9)' }}>
      <div className="band-red cta-line">
        <h2>¿Tenés una idea en crudo?</h2>
        <Link href="/contacto/" className="btn btn--light">Hablemos <ArrowOut /></Link>
      </div>
    </section>
  );
}
