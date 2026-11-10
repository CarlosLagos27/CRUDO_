import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ContactBand, SectionLabel } from '@/components/Parts';
import MailClub from '@/components/MailClub';

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

        <section className="wrap mc-intro">
          <SectionLabel>( Mail Club )</SectionLabel>
          <h2>Mail Club<span className="dot">.</span></h2>
          <p className="lead" style={{ maxWidth: '40ch' }}>
            Un sobre por mes con papelería, stickers y pasatiempos hechos por Crudo_. Cada edición tiene su tema, su color y su historia: abrilo y mirá qué trae.
          </p>
          <div className="mc-intro__row">
            <p className="label">[PRECIO]</p>
            <a href="#" className="btn btn--ink" aria-disabled="true">Sumate ↗ [LINK DE PAGO]</a>
          </div>
        </section>

        <section className="wrap" style={{ paddingBottom: 'var(--space-9)' }}>
          <MailClub />
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
