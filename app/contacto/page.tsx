import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { INSTAGRAM, MAIL, TIKTOK } from '@/lib/data';

export const metadata: Metadata = { title: 'Contacto' };

export default function Contacto() {
  return (
    <>
      <Header />
      <main>
        <section className="wrap page-hero">
          <h1 className="display">¿Tenés una idea en crudo<span className="dot">?</span></h1>
          <p className="lead" style={{ marginTop: 'var(--space-4)' }}>Contanos. Lo armamos juntas.</p>
        </section>

        <section className="section">
          <div className="wrap contact-grid">
            <ContactForm />
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div className="contact-links">
                <span className="label muted">Mail y redes</span>
                <a href={`mailto:${MAIL}`}>{MAIL}</a>
                <a href={INSTAGRAM}>Instagram ↗</a>
                <a href={TIKTOK}>TikTok ↗</a>
              </div>
              <div className="tile tile--blue" style={{ minHeight: 220 }}>
                <span className="label">Argentocolombianas</span>
                <span className="tile__title">ARG // COL</span>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
