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

/** Tiles de cierre: siguiente página + Hablemos. */
export function NextTiles({ next }: { next: { href: string; label: string } }) {
  return (
    <section className="wrap" style={{ paddingBottom: 'var(--space-9)' }}>
      <div className="tiles">
        <Link href={next.href} className="tile tile--ink">
          <span className="label">Siguiente</span>
          <span className="tile__title">{next.label} ↗</span>
        </Link>
        <Link href="/contacto/" className="tile tile--yellow">
          <span className="label">¿Tenés una idea en crudo?</span>
          <span className="tile__title">Hablemos ↗</span>
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
        <Link href="/contacto/" className="btn btn--light">Hablemos ↗</Link>
      </div>
    </section>
  );
}
