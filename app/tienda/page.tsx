import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ContactBand, SectionLabel } from '@/components/Parts';
import ServiceCards from '@/components/ServiceCards';
import MailClub from '@/components/MailClub';
import { DIGITALES, PACKS_NOTE } from '@/lib/data';

export const metadata: Metadata = { title: 'Tienda' };

export default function Tienda() {
  return (
    <>
      <Header />
      <main>
        <section className="wrap page-hero page-hero--tight">
          <h1 className="display">Tienda<span className="dot">.</span></h1>
          {/* índice: deja claro que la tienda tiene tres secciones separadas */}
          <nav className="shop-index" aria-label="Secciones de la tienda">
            <a href="#mailclub" className="shop-index__item">
              <span className="label">( 01 )</span>
              <b>Mail Club</b>
              <span className="label shop-index__n">3 ediciones</span>
            </a>
            <a href="#digitales" className="shop-index__item">
              <span className="label">( 02 )</span>
              <b>Productos digitales</b>
              <span className="label shop-index__n">Descargables</span>
            </a>
            <a href="#servicios" className="shop-index__item">
              <span className="label">( 03 )</span>
              <b>Servicios</b>
              <span className="label shop-index__n">4 servicios</span>
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
              <a href="https://mpago.la/2qcZfqo" className="btn btn--ink" target="_blank" rel="noopener noreferrer">Sumate ↗</a>
            </div>
          </div>
        </section>

        <section className="mc-sec" style={{ paddingBottom: 'var(--space-8)' }}>
          <MailClub />
        </section>

        <section id="digitales" data-clip="tienda-digitales" className="section chapter--red shop-dig">
          <div className="wrap">
            <SectionLabel>( 02 ) Productos digitales</SectionLabel>
            <div className="products products--ebooks">
              {DIGITALES.map((p) => (
                <article className="product product--ebook" key={p.name}>
                  <div className="product__img"><img src={p.img} alt={p.alt} loading="lazy" decoding="async" /></div>
                  <h3 className="product__t">{p.name}</h3>
                  <s className="product__old">{p.old}</s>
                  <p className="product__now"><b>{p.price}</b><span>{p.off}</span></p>
                  <a href={p.href} className="btn btn--cream" target="_blank" rel="noopener noreferrer">Comprar ↗</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="servicios" data-clip="tienda-servicios" className="section">
          <div className="wrap">
            <SectionLabel>( 03 ) Servicios</SectionLabel>
            <ServiceCards />
            <p className="packs__note lead">{PACKS_NOTE} <Link href="/contacto/" className="link">Escribinos ↗</Link></p>
          </div>
        </section>

        <ContactBand />
      </main>
      <Footer />
    </>
  );
}
