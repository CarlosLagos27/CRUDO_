import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ContactBand, SectionLabel } from '@/components/Parts';

export const metadata: Metadata = { title: 'Tienda' };

const PRODUCTS = [1, 2, 3, 4];

export default function Tienda() {
  return (
    <>
      <Header />
      <main>
        <section className="wrap page-hero">
          <h1 className="display">Tienda<span className="dot">.</span></h1>
        </section>

        <section className="wrap" style={{ paddingBottom: 'var(--space-9)' }}>
          <div className="mailclub">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <SectionLabel>( Mail Club )</SectionLabel>
              <h2>Mail Club<span className="dot">.</span></h2>
              <p className="body-lg">[Descripción del Mail Club]</p>
              <p className="label">[PRECIO]</p>
              <div><a href="#" className="btn btn--ink" aria-disabled="true">Sumate ↗ [LINK DE PAGO]</a></div>
            </div>
            <div className="stack" aria-hidden="true">
              <div className="ph" style={{ left: 0, top: 20, transform: 'rotate(-5deg)' }} />
              <div className="ph ph--brown" style={{ left: '25%', top: 0, transform: 'rotate(2deg)' }} />
              <div className="ph" style={{ right: 0, top: 40, transform: 'rotate(7deg)' }} />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <SectionLabel>( Productos digitales )</SectionLabel>
            <div className="products">
              {PRODUCTS.map((n) => (
                <Link href="/contacto/" className="product" key={n}>
                  <div className="ph" />
                  <div className="product__row">
                    <span>[PRODUCTO]</span>
                    <span>[PRECIO]</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <ContactBand />
      </main>
      <Footer />
    </>
  );
}
