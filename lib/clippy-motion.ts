/**
 * Motor de movimiento de Clippy. Trabaja con la posición de los "pies" en coordenadas del viewport.
 * El contenedor `pos` se desplaza con las variables CSS --tx/--ty respecto a su "casa" (el borde de la pantalla).
 *
 * Modos: home (en su borde) · hop (yendo a un punto a saltos) · perch (parada sobre un elemento, siguiéndolo)
 *        · drag (agarrada por el puntero) · fly (lanzada, con gravedad y rebotes) · away (quieta lejos de casa).
 */
export type Pt = { x: number; y: number };
export type Mode = 'home' | 'hop' | 'perch' | 'drag' | 'fly' | 'away';

export type Hooks = {
  squash: (name: 'crouch' | 'stretch' | 'land' | '', ms?: number) => void;
  lean: (deg: number) => void;
  puff: (x: number, y: number) => void;
  hit: (speed: number) => void;
  hop: () => void;
  reduced: () => boolean;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

export class Mover {
  tx = 0;
  ty = 0;
  mode: Mode = 'home';
  private token = 0;
  private raf = 0;
  private grab = { ox: 0, oy: 0 };
  private samples: { x: number; y: number; t: number }[] = [];

  constructor(private root: HTMLElement, private pos: HTMLElement, private h: Hooks) {}

  /** ¿Está lejos de su borde (viajando, parada sobre algo, agarrada o lanzada)? */
  get away() { return this.mode !== 'home'; }

  /** Pies en reposo: centro del borde donde asoma, sobre el límite inferior de la pantalla. */
  home(): Pt {
    const d = document.documentElement;
    const half = this.root.offsetWidth / 2;
    const left = this.root.dataset.side === 'left';
    return { x: left ? -5 + half : d.clientWidth + 5 - half, y: d.clientHeight + 1 };
  }

  feet(): Pt {
    const h = this.home();
    return { x: h.x + this.tx, y: h.y + this.ty };
  }

  private apply() {
    this.pos.style.setProperty('--tx', `${this.tx.toFixed(1)}px`);
    this.pos.style.setProperty('--ty', `${this.ty.toFixed(1)}px`);
  }

  place(x: number, y: number) {
    const h = this.home();
    this.tx = x - h.x;
    this.ty = y - h.y;
    this.apply();
  }

  private stop() {
    this.token++;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.pos.getAnimations().forEach((a) => a.cancel());
  }

  /** Interrumpe cualquier movimiento y se queda donde esté. */
  cancel() {
    this.stop();
    if (this.mode !== 'home') this.mode = 'away';
  }

  /** Vuelve de golpe a su borde, sin animar (por ejemplo, al cambiar de sección). */
  reset() {
    this.stop();
    this.tx = 0;
    this.ty = 0;
    this.apply();
    this.mode = 'home';
    this.h.lean(0);
    this.h.squash('');
  }

  /** Va a saltos hasta (x, y). Devuelve false si algo la interrumpió. */
  async hopTo(x: number, y: number, maxHop = 170): Promise<boolean> {
    this.stop();
    const my = this.token;
    const target = { x, y };
    if (this.h.reduced()) { this.place(x, y); this.mode = 'away'; return true; }
    this.mode = 'hop';
    const home = this.home();
    const ex = target.x - home.x;
    const ey = target.y - home.y;
    const sx0 = this.tx;
    const sy0 = this.ty;
    const total = Math.hypot(ex - sx0, ey - sy0);
    const n = clamp(Math.round(total / (total > 700 ? maxHop * 1.4 : maxHop)), 1, 9); // más lejos, saltos más largos
    for (let i = 1; i <= n; i++) {
      const fx = sx0 + ((ex - sx0) * i) / n;
      const fy = sy0 + ((ey - sy0) * i) / n;
      const len = Math.hypot(fx - this.tx, fy - this.ty);
      if (len < 2) continue;
      this.h.squash('crouch');
      await sleep(100);
      if (this.token !== my) return false;
      this.h.lean(clamp((fx - this.tx) * 0.12, -12, 12));
      this.h.squash('stretch');
      this.h.hop();
      const lift = 16 + len * 0.3;
      const a = this.pos.animate(
        [
          { translate: `${this.tx}px ${this.ty}px` },
          { translate: `${(this.tx + fx) / 2}px ${(this.ty + fy) / 2 - lift}px`, offset: 0.5 },
          { translate: `${fx}px ${fy}px` },
        ],
        { duration: 280 + len * 0.9, easing: 'cubic-bezier(.4,0,.6,1)' },
      );
      try { await a.finished; } catch { /* cancelada */ }
      if (this.token !== my) { a.cancel(); return false; }
      this.tx = fx;
      this.ty = fy;
      this.apply();
      a.cancel();
      this.h.squash('land');
      this.h.puff(home.x + fx, home.y + fy);
      this.h.lean(0);
      await sleep(i === n ? 120 : 70);
      if (this.token !== my) return false;
    }
    this.mode = 'away';
    return true;
  }

  /** Vuelve a su borde saltando y queda en reposo. */
  async goHome(): Promise<boolean> {
    if (this.mode === 'home') return true;
    const h = this.home();
    const ok = await this.hopTo(h.x, h.y);
    if (ok) {
      this.tx = 0;
      this.ty = 0;
      this.apply();
      this.mode = 'home';
    }
    return ok;
  }

  /** Se queda parada siguiendo un punto que se recalcula en cada cuadro (por ejemplo, el borde de un elemento). */
  perch(get: () => Pt | null, onLost?: () => void) {
    this.stop();
    const my = this.token;
    this.mode = 'perch';
    const loop = () => {
      if (this.token !== my || this.mode !== 'perch') return;
      const t = get();
      if (!t) { onLost?.(); return; }
      const h = this.home();
      this.tx += (t.x - h.x - this.tx) * 0.2;
      this.ty += (t.y - h.y - this.ty) * 0.2;
      this.apply();
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  /* ───────── arrastrar y lanzar ───────── */
  beginDrag(px: number, py: number) {
    this.stop();
    this.mode = 'drag';
    const f = this.feet();
    this.grab = { ox: px - f.x, oy: clamp(py - f.y, -118, 0) };
    this.samples = [];
    this.h.squash('stretch');
  }

  dragTo(px: number, py: number, t: number) {
    if (this.mode !== 'drag') return;
    const d = document.documentElement;
    const x = clamp(px - this.grab.ox, 14, d.clientWidth - 14);
    const y = clamp(py - this.grab.oy, 124, d.clientHeight + 1);
    this.place(x, y);
    this.samples.push({ x: px, y: py, t });
    while (this.samples.length > 2 && t - this.samples[0].t > 140) this.samples.shift();
    const a = this.samples[0];
    const dt = (t - a.t) / 1000;
    if (dt > 0.008) this.h.lean(clamp(((px - a.x) / dt) * 0.012, -32, 32));
  }

  /** Suelta: sigue con la velocidad que llevaba, con gravedad, rebotes y fricción. Resuelve con la rapidez del lanzamiento. */
  release(): Promise<number> {
    const my = ++this.token;
    this.mode = 'fly';
    let vx = 0;
    let vy = 0;
    const s = this.samples;
    if (s.length >= 2) {
      const a = s[0];
      const b = s[s.length - 1];
      const dt = (b.t - a.t) / 1000;
      if (dt > 0.01) { vx = (b.x - a.x) / dt; vy = (b.y - a.y) / dt; }
    }
    vx = clamp(vx, -3200, 3200);
    vy = clamp(vy, -3200, 3200);
    const speed = Math.hypot(vx, vy);
    const d = document.documentElement;
    if (this.h.reduced()) {
      this.place(this.feet().x, d.clientHeight + 1);
      this.mode = 'away';
      this.h.lean(0);
      return Promise.resolve(0);
    }
    return new Promise((resolve) => {
      const g = 2600;
      let last = performance.now();
      const f = this.feet();
      let x = f.x;
      let y = f.y;
      const loop = (now: number) => {
        if (this.token !== my) { resolve(speed); return; }
        const dt = Math.min(0.033, (now - last) / 1000);
        last = now;
        vy += g * dt;
        x += vx * dt;
        y += vy * dt;
        const floor = d.clientHeight + 1;
        const minX = 14;
        const maxX = d.clientWidth - 14;
        const ceil = 124;
        let onFloor = false;
        if (y >= floor) {
          y = floor;
          onFloor = true;
          if (vy > 240) { this.h.hit(vy); this.h.squash('land'); this.h.puff(x, y); }
          vy = -vy * 0.42;
          if (Math.abs(vy) < 200) vy = 0;
          vx *= Math.pow(0.02, dt); // fricción en el piso
        }
        if (y <= ceil) { y = ceil; vy = Math.abs(vy) * 0.3; }
        if (x < minX) { x = minX; vx = Math.abs(vx) * 0.6; } else if (x > maxX) { x = maxX; vx = -Math.abs(vx) * 0.6; }
        this.place(x, y);
        this.h.lean(clamp(vx / 45, -30, 30) * (onFloor ? 0.3 : 1));
        if (onFloor && vy === 0 && Math.abs(vx) < 25) {
          this.h.lean(0);
          this.mode = 'away';
          resolve(speed);
          return;
        }
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    });
  }
}
