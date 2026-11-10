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
        <section className="wrap page-hero page-hero--tight">
          <h1 className="display">Tienda<span className="dot">.</span></h1>
          {/* índice: deja claro que la tienda tiene dos secciones separadas */}
          <nav className="shop-index" aria-label="Secciones de la tienda">
            <a href="#mailclub" className="shop-index__item">
              <span className="label">( 01 )</span>
              <b>Mail Club</b>
              <span className="label shop-index__n">2 ediciones</span>
            </a>
            <a href="#digitales" className="shop-index__item">
              <span className="label">( 02 )</span>
              <b>Productos digitales</b>
              <span className="label shop-index__n">Descargables</span>
            </a>
          </nav>
        </section>

        <section id="mailclub" className="wrap mc-intro">
          <div className="mc-intro__title">
            <SectionLabel>( 01 ) Mail Club</SectionLabel>
            <h2>Mail Club<span className="dot">.</span></h2>
          </div>
          <div className="mc-intro__body">
            <p className="lead">
              Un sobre por mes con papelería, stickers y pasatiempos hechos por Crudo_. Cada edición tiene su tema, su color y su historia: abrilo y mirá qué trae.
            </p>
            <div className="mc-intro__row">
              <p className="label">[PRECIO]</p>
              <a href="#" className="btn btn--ink" aria-disabled="true">Sumate ↗ [LINK DE PAGO]</a>
            </div>
          </div>
        </section>

        <section className="mc-sec" style={{ paddingBottom: 'var(--space-8)' }}>
          <MailClub />
        </section>

        <section id="digitales" className="section">
          <div className="wrap">
            <SectionLabel>( 02 ) Productos digitales</SectionLabel>
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
