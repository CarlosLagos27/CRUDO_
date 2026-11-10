/** Efectos de Clippy: confeti, nubes de polvo al aterrizar y sonidos sintetizados (sin archivos de audio). */

const DEFAULT_COLORS = ['#a33b21', '#faf8d6', '#b1d1e1', '#f2b9a6', '#ebf263', '#111111', '#fff'];

export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let layer: HTMLElement | null = null;
function getLayer(): HTMLElement {
  if (layer && document.body.contains(layer)) return layer;
  layer = document.createElement('div');
  layer.className = 'clippy-fx';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);
  return layer;
}

/** Ráfaga de confeti desde un punto de la pantalla (coordenadas del viewport). */
export function confetti(x: number, y: number, count = 28, colors?: string[]) {
  if (reducedMotion()) return;
  const COLORS = colors && colors.length ? colors : DEFAULT_COLORS;
  const L = getLayer();
  if (L.childElementCount > 140) return;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('i');
    el.className = 'clippy-conf';
    const w = 5 + Math.random() * 7;
    el.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${w * (0.5 + Math.random() * 0.6)}px;background:${COLORS[(Math.random() * COLORS.length) | 0]};border-radius:${Math.random() < 0.3 ? '50%' : '1px'}`;
    L.appendChild(el);
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
    const sp = 130 + Math.random() * 240;
    const dx = Math.cos(ang) * sp;
    const up = Math.abs(Math.sin(ang)) * sp * 0.8;
    const fall = 140 + Math.random() * 260;
    const rot = (Math.random() - 0.5) * 900;
    const a = el.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${-up}px) rotate(${rot * 0.5}deg)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${dx}px, ${fall}px) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: 1100 + Math.random() * 800, easing: 'cubic-bezier(.2,.7,.4,1)', delay: Math.random() * 120 },
    );
    a.onfinish = () => el.remove();
  }
}

/** Nubecitas de polvo bajo los pies al aterrizar. */
export function puff(x: number, y: number) {
  if (reducedMotion()) return;
  const L = getLayer();
  if (L.childElementCount > 140) return;
  for (let i = 0; i < 4; i++) {
    const el = document.createElement('i');
    el.className = 'clippy-puff';
    const s = 7 + Math.random() * 7;
    el.style.cssText = `left:${x}px;top:${y - 3}px;width:${s}px;height:${s}px`;
    L.appendChild(el);
    const dir = i % 2 ? 1 : -1;
    const a = el.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0.7 },
        { transform: `translate(calc(-50% + ${dir * (10 + i * 6)}px), calc(-50% - ${4 + i * 3}px)) scale(1.5)`, opacity: 0 },
      ],
      { duration: 520 + i * 60, easing: 'ease-out' },
    );
    a.onfinish = () => el.remove();
  }
}

/* ───────── sonido: osciladores del navegador, apagado por defecto ───────── */
type Name = 'pop' | 'boing' | 'squeak' | 'chime' | 'hop' | 'land' | 'whoosh' | 'giggle';

let ctx: AudioContext | null = null;
let enabled = false;

function audio(): AudioContext | null {
  if (!enabled) return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(c: AudioContext, freq: number, dur: number, o: { type?: OscillatorType; vol?: number; to?: number; delay?: number } = {}) {
  const t0 = c.currentTime + (o.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
  const v = o.vol ?? 0.06;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(v, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sound = {
  get on() { return enabled; },
  set(on: boolean) { enabled = on; if (on) audio(); },
  play(name: Name) {
    const c = audio();
    if (!c) return;
    switch (name) {
      case 'pop': tone(c, 520, 0.09, { to: 820 }); break;
      case 'hop': tone(c, 300, 0.08, { to: 440, type: 'triangle', vol: 0.05 }); break;
      case 'land': tone(c, 150, 0.12, { to: 80, type: 'triangle', vol: 0.09 }); break;
      case 'boing': tone(c, 200, 0.32, { to: 560, type: 'triangle', vol: 0.07 }); break;
      case 'squeak': tone(c, 880, 0.12, { to: 1350, type: 'square', vol: 0.025 }); break;
      case 'chime': tone(c, 784, 0.26); tone(c, 1175, 0.4, { delay: 0.12 }); break;
      case 'giggle': for (let i = 0; i < 4; i++) tone(c, 700 + (i % 2) * 180, 0.07, { type: 'square', vol: 0.02, delay: i * 0.08 }); break;
      case 'whoosh': {
        const len = Math.floor(c.sampleRate * 0.28);
        const buf = c.createBuffer(1, len, c.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = c.createBufferSource();
        src.buffer = buf;
        const f = c.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.setValueAtTime(500, c.currentTime);
        f.frequency.exponentialRampToValueAtTime(2400, c.currentTime + 0.28);
        const g = c.createGain();
        g.gain.value = 0.18;
        src.connect(f).connect(g).connect(c.destination);
        src.start();
        break;
      }
    }
  },
};
