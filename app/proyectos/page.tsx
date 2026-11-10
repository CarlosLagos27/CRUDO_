import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProjectsList from '@/components/ProjectsList';
import { ContactBand } from '@/components/Parts';

export const metadata: Metadata = { title: 'Proyectos' };

export default function Proyectos() {
  return (
    <>
      <Header />
      <main>
        <section className="wrap page-hero">
          <h1 className="display">Proyectos<span className="dot">.</span></h1>
          <p className="lead" style={{ marginTop: 'var(--space-4)' }}>
            Ocho casos que salieron de una idea en crudo: marcas, fotos y piezas que hoy se ven, se tocan y se comen.
          </p>
        </section>
        <ProjectsList />
        <div style={{ height: 'var(--space-8)' }} />
        <ContactBand />
      </main>
      <Footer />
    </>
  );
}
