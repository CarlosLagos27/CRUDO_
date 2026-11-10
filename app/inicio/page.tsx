import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ParenPhoto, SectionLabel, Title } from '@/components/Parts';
import { PACKS, PHOTOS, SERVICES, STEPS } from '@/lib/data';

export const metadata: Metadata = { title: 'Inicio' };

const rv = (i: number) => ({ ['--i' as string]: i }) as React.CSSProperties;

export default function Inicio() {
  return (
    <>
      <Header />
      <main>
        <section className="wrap hero-home">
          <h1 className="display">
            <span className="ln"><span style={rv(0)}>Tus ideas</span></span>
            <span className="ln"><span style={rv(1)} className="paren"><ParenPhoto k="resultado" red /></span></span>
            <span className="ln"><span style={rv(2)}>en crudo<span className="dot caret">_</span></span></span>
          </h1>
          <div className="hero-home__meta">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span className="argcol">ARG // COL</span>
              <span style={{ fontSize: 13, lineHeight: 1.2 }}>Agencia<br />creativa</span>
            </div>
            <p className="muted" style={{ maxWidth: 220, fontSize: 13, lineHeight: 1.4, textAlign: 'right' }}>
              De una foto en RAW a una campaña entera.
            </p>
          </div>
        </section>

        <section className="wrap" style={{ paddingBottom: 'var(--space-9)' }}>
          <div className="strip" data-rv>
            {(['idea', 'proceso', 'resultado', 'equipo'] as const).map((k) => (
              <img key={k} src={PHOTOS[k].src} alt={PHOTOS[k].alt} style={{ objectPosition: PHOTOS[k].pos }} />
            ))}
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <span data-rv><SectionLabel>( 01 ) Servicios</SectionLabel></span>
            <div style={{ marginTop: 'var(--space-4)' }} data-rv><Title>Qué hacemos</Title></div>
            <ul className="svc-list">
              {SERVICES.map((s, i) => (
                <li className="svc" key={s} data-rv style={rv(i % 3)}>
                  <span className="label red">0{i + 1}</span>
                  <h3 className="svc__t">{s}</h3>
                  <p className="svc__d">[Descripción corta del servicio]</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section data-sec className="chapter chapter--blue">
          <div className="wrap">
            <span data-rv><SectionLabel>( 02 ) Packs</SectionLabel></span>
            <div style={{ marginTop: 'var(--space-4)' }} data-rv><Title>Nuestros packs</Title></div>
            <div className="packs">
              {PACKS.map((p, i) => (
                <article key={i} className={`pack${p.red ? ' pack--red' : ''}`} data-rv style={rv(i)}>
                  <span className="label">( 0{i + 1} )</span>
                  <h3 className="pack__t">{p.name}</h3>
                  <p className="pack__d">{p.desc}</p>
                  <span className="pack__price">{p.price}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section data-sec className="chapter chapter--brown">
          <div className="wrap">
            <span data-rv><SectionLabel>( 03 ) Proceso</SectionLabel></span>
            <div style={{ marginTop: 'var(--space-4)' }} data-rv><Title>Nuestro proceso</Title></div>
            <ol className="steps steps--cream">
              {STEPS.map((s, i) => (
                <li className="step" key={i} data-rv style={rv(i)}>
                  <span className="label">0{i + 1}</span>
                  <h3 className="step__t">{s.t}</h3>
                  <p className="step__d">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section data-sec className="chapter chapter--red">
          <div className="wrap cta-line">
            <h2 data-rv>¿Tenés una idea en crudo?</h2>
            <Link href="/contacto/" className="btn btn--light" data-rv style={rv(1)}>Hablemos ↗</Link>
          </div>
        </section>
      </main>
      <Footer dark />
    </>
  );
}
