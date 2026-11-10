import ClipEyes from '@/components/ClipEyes';

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

/** Línea de tendencia: viewBox 100×40, valores 0–1 -> y. */
const line = (arr: number[]) =>
  arr.map((v, i) => `${i ? 'L' : 'M'}${((i / (N - 1)) * 100).toFixed(2)} ${(38 - Math.max(0, Math.min(1, v)) * 34).toFixed(2)}`).join('');
const RAW_LINE = line(RAW_BARS);
const DEV_LINE = line(DEV_BARS);
const DEV_AREA = `${DEV_LINE}L100 40L0 40Z`;

/** Mapa de calor 7×4 (día × franja): apagado en crudo, encendido al revelar. Determinista. */
const HEAT = Array.from({ length: 28 }, (_, i) => {
  const c = i % 7;
  const rw = i / 7 | 0;
  const r = 0.05 + 0.18 * Math.abs(Math.sin(i * 2.3));
  const d = Math.min(1, 0.3 + 0.5 * Math.abs(Math.sin(i * 1.1 + 0.6)) + (c > 3 ? 0.2 : 0) + (rw === 2 ? 0.15 : 0));
  return { r: r.toFixed(2), d: d.toFixed(2) };
});

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
        <ClipEyes />
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
                <g className="eyes">
                  <g className="eye"><circle className="eye__w" cx="15" cy="52" r="7.2" /><circle className="eye__p" cx="15" cy="52" r="2.9" /></g>
                  <g className="eye"><circle className="eye__w" cx="39" cy="52" r="7.2" /><circle className="eye__p" cx="39" cy="52" r="2.9" /></g>
                </g>
              </svg>
            </span>
          </label>
        </div>

        {/* izquierda: anillo + mapa de calor */}
        <div className="rev__side rev__side--l" aria-hidden="true">
          <div className="rev__card">
            <span className="label">Retención de video</span>
            <div className="rev__donut">
              <svg viewBox="0 0 100 100" focusable="false">
                <circle className="trk" cx="50" cy="50" r="40" pathLength="100" />
                <circle className="arc" cx="50" cy="50" r="40" pathLength="100" />
              </svg>
              <span className="rev__val rev__val--ret" />
            </div>
          </div>
          <div className="rev__card">
            <span className="label">Actividad semanal</span>
            <div className="rev__heat">
              {HEAT.map((h, i) => (
                <i key={i} style={vars({ '--r': h.r, '--d': h.d })} />
              ))}
            </div>
          </div>
        </div>

        {/* derecha: tendencia + variación por métrica */}
        <div className="rev__side rev__side--r" aria-hidden="true">
          <div className="rev__card">
            <span className="label">Engagement · 30 días</span>
            <svg className="rev__spark" viewBox="0 0 100 40" focusable="false">
              <path className="area" d={DEV_AREA} />
              <path className="raw" d={RAW_LINE} />
              <path className="dev" pathLength="1" d={DEV_LINE} />
            </svg>
          </div>
          <div className="rev__card rev__card--div">
            <span className="label">Variación</span>
            {PARAMS.map((p) => (
              <div className="rev__drow" key={p.k} style={vars({ '--a': p.a, '--b': p.b })}>
                <span className="label">{p.k}</span>
                <span className="rev__div"><i /></span>
                <span className={`rev__val rev__val--${p.n}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
