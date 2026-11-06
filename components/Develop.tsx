type Props = { src: string; alt: string; pos?: string; head: React.ReactNode };

const N = 30;
/** Engagement diario: antes (caído y a la baja) -> después (en alza). Valores 0–1. */
const RAW_BARS = Array.from({ length: N }, (_, i) => 0.3 - i * 0.006 + 0.07 * Math.sin(i * 1.7) + 0.04 * Math.sin(i * 0.5));
const DEV_BARS = Array.from({ length: N }, (_, i) => 0.22 + 0.7 * Math.pow(i / (N - 1), 1.15) + 0.07 * Math.sin(i * 1.3 + 1));

/** a = variación en crudo (negativa), b = variación revelada. Enteros: los cuenta CSS con @property. Cifras de ejemplo. */
const PARAMS = [
  { k: 'Alcance', a: -38, b: 124, n: 'alc' },
  { k: 'Interacciones', a: -52, b: 86, n: 'int' },
  { k: 'Guardados', a: -27, b: 64, n: 'gua' },
  { k: 'Clics al perfil', a: -41, b: 58, n: 'clk' },
];

const vars = (o: Record<string, string | number>) => o as React.CSSProperties;

/**
 * "Revelá tu idea": un clip de CSS puro hace de botón. Un checkbox oculto guarda el estado
 * y todo lo demás (círculo de revelado, contadores, histograma) se anima con :has() y @property.
 * Sin JS; el botón se opera con mouse, toque o teclado (Espacio).
 */
export default function Develop({ src, alt, pos = 'center', head }: Props) {
  return (
    <div className="rev">
      {head}
      <div className="wrap rev__stage">
        <input id="rev-toggle" className="rev__in sr-only" type="checkbox" />

        <div className="rev__frame">
          <div className="rev__imgs">
            <img className="rev__raw" src={src} alt="" aria-hidden="true" draggable={false} style={{ objectPosition: pos }} />
            <img className="rev__dev" src={src} alt={alt} draggable={false} style={{ objectPosition: pos }} />
            <span className="rev__grain" aria-hidden="true" />
            <span className="rev__tag rev__tag--raw label">( RAW )</span>
            <span className="rev__tag rev__tag--dev label">( revelado )</span>
          </div>

          <span className="rev__ring" aria-hidden="true" />
          <span className="rev__cur" aria-hidden="true"><i className="tap" /><span className="arrow"><svg viewBox="0 0 24 24" focusable="false"><path d="M5 3V19.2L9.1 15.4L11.9 21.6L14.8 20.3L12 14.2H17.8Z" /></svg></span></span>
          <label htmlFor="rev-toggle" className="rev__clip">
            <span className="sr-only">Revelar la foto: de RAW a revelada</span>
            <span className="clip" aria-hidden="true">
              <svg viewBox="0 0 56 150" focusable="false">
                <path pathLength="1" d="M3 37V122A25 25 0 0 0 53 122V25A18 18 0 0 0 17 25V100A11 11 0 0 0 39 100V58" />
              </svg>
            </span>
          </label>
        </div>

        <div className="rev__read" aria-hidden="true">
          {PARAMS.map((p) => (
            <div className="rev__param" key={p.k} style={vars({ '--a': p.a, '--b': p.b })}>
              <span className="label">{p.k}</span>
              <span className={`rev__val rev__val--${p.n}`} />
              <span className="rev__bar"><i /></span>
            </div>
          ))}
          <div className="rev__hist">
            <span className="label">Engagement · 30 días</span>
            <div className="rev__bars">
              {RAW_BARS.map((r, i) => (
                <i key={i} style={vars({ '--r': r.toFixed(3), '--d': DEV_BARS[i].toFixed(3) })} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
