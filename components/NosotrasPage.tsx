import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StoryCard from '@/components/StoryCard';
import Develop from '@/components/Develop';
import TeamCarousel from '@/components/TeamCarousel';
import { NextTiles, ParenPhoto, SectionLabel } from '@/components/Parts';
import { PHOTOS } from '@/lib/data';

const lines: [string, string][] = [
  ['Tus ideas', '14%'],
  ['en su estado', '34%'],
  ['más crudo,', '4%'],
  ['hechas', '26%'],
  ['realidad_', '22%'],
];

const rv = (i: number) => ({ ['--i' as string]: i }) as React.CSSProperties;

export default function NosotrasPage() {
  return (
    <>
      <Header />
      <main>
        <section className="wrap hero-nos">
          <div className="hero-nos__bg display" aria-hidden="true">crudo</div>
          <h1 className="display">
            {lines.map(([t, pl], i) => (
              <span key={t} className="ln" style={{ paddingLeft: pl }}>
                <span style={rv(i)}>{t.endsWith("_") ? <>{t.slice(0, -1)}<i className="caret-bar caret" aria-hidden="true" /></> : t}</span>
              </span>
            ))}
          </h1>
          <StoryCard />
          <div className="hero-home__meta" style={{ position: 'relative', marginTop: 72 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span className="argcol">ARG // COL</span>
              <span style={{ fontSize: 13, lineHeight: 1.2 }}>Agencia<br />creativa</span>
            </div>
            <p className="muted" style={{ maxWidth: 200, fontSize: 13, lineHeight: 1.4, textAlign: 'right' }}>De una foto en RAW a una campaña entera.</p>
          </div>
        </section>

        <section data-sec className="chapter chapter--brown develop-sec" aria-labelledby="revelado">
          <Develop
            src={PHOTOS.proceso.src}
            alt={PHOTOS.proceso.alt}
            pos={PHOTOS.proceso.pos}
            head={
              <div className="wrap develop-head">
                <h2 id="revelado" className="heading-section">Revelá tu idea<span className="dot-cream">.</span></h2>
                <p className="lead">Un archivo RAW se ve plano hasta que alguien lo revela.</p>
              </div>
            }
          />
        </section>

        <section id="historia" data-sec className="chapter chapter--yellow">
          <div className="wrap cols">
            <span data-rv><SectionLabel>( 01 ) Por qué Crudo</SectionLabel></span>
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 32 }}>
              <p className="manifesto" data-rv style={rv(1)}>
                Todo empieza en crudo: una hoja en blanco, un archivo <span className="kw">RAW</span> sin tocar. Ahí, donde la idea todavía no tiene forma, es donde más nos gusta trabajar.
              </p>
              <p className="body-lg" data-rv style={rv(2)}>
                Nos conocimos trabajando en el mundo del marketing y vimos cosas que sentíamos que podíamos hacer distinto. Así nació Crudo_: una agencia que toma tu idea como viene y la lleva hasta un proyecto real, combinando diseño, cámara y medios tradicionales.
              </p>
            </div>
          </div>
        </section>

        <section className="wrap statement">
          <h2 className="display" data-rv>
            <span className="paren">La idea <ParenPhoto k="idea" /></span>
            <span className="paren">el proceso <ParenPhoto k="proceso" /></span>
            <span className="paren">y el <ParenPhoto k="resultado" red /> resultado</span>
          </h2>
          <p className="label muted" style={{ marginTop: 32 }}>( Pasá el mouse por las fotos )</p>
        </section>

        <section data-sec className="chapter chapter--blue team-sec">
          <div className="wrap team-head">
            <span data-rv><SectionLabel>( 02 ) Quiénes somos</SectionLabel></span>
            <h2 className="display" data-rv style={{ ...rv(1), fontSize: 'clamp(44px,5.6vw,92px)', lineHeight: 0.92 }}>
              Hecha por mujeres. <span className="kw">Argento‑colombianas.</span>
            </h2>
          </div>
          <div className="wrap" data-rv style={rv(2)}>
            <TeamCarousel />
          </div>
        </section>

        <div style={{ height: 'var(--space-9)' }} />
        <NextTiles next={{ href: '/proyectos/', label: 'Ver proyectos' }} />
      </main>
      <Footer />
    </>
  );
}
