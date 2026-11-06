/** Clip de la marca, redibujado en SVG a partir del kit (reemplazar por el SVG oficial cuando exista). */
export function Clip({ size = 22, color = 'currentColor', stroke = 2.4 }: { size?: number; color?: string; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g transform="translate(24 0) scale(-1 1)">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
      </g>
    </svg>
  );
}

/** Wordmark: Crudo + guion bajo como barra. */
export function Wordmark({ barColor }: { barColor?: string }) {
  return (
    <span className="wm">
      Crudo<i className="wm__bar" style={barColor ? { background: barColor } : undefined} />
    </span>
  );
}
