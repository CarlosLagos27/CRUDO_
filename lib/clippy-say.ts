/**
 * Cola de mensajes de Clippy: muestra uno a la vez, cada uno el tiempo que lleva leerlo,
 * y decide qué hacer con los que llegan mientras habla:
 *  - los de prioridad baja (ambiente) se descartan si está ocupada,
 *  - los de prioridad media o alta esperan su turno (máximo 2 en cola) y caducan si pasa mucho tiempo,
 *  - uno de prioridad mayor puede interrumpir, pero solo después de que el actual se leyó un rato.
 * Así nunca se pisan dos globos ni cambia el texto antes de poder leerlo.
 */
export type SayOpts = { ttl?: number; key?: string; force?: boolean };

type Item = { text: string; prio: number; ttl: number; key: string; t: number };

/** Milisegundos que un mensaje permanece a la vista: ~2,6 s más 45 ms por carácter (entre 3 y 7,5 s). */
export const readTime = (text: string) => Math.min(7500, Math.max(3000, 2600 + text.length * 45));

export class SayQueue {
  private cur: Item | null = null;
  private curStart = 0;
  private queue: Item[] = [];
  private endTimer = 0;
  private nextTimer = 0;
  private swapTimer = 0;
  private lastEnd = 0;
  private recent = new Map<string, number>();

  constructor(
    private onShow: (text: string) => void,
    private onHide: () => void,
    private canTalk: () => boolean,
  ) {}

  /** ¿Hay un mensaje a la vista ahora? */
  get busy() { return this.cur !== null; }

  push(text: string, prio = 1, opts: SayOpts = {}) {
    if (!this.canTalk()) return;
    const now = Date.now();
    const key = opts.key ?? text;
    if (!opts.force) {
      const seen = this.recent.get(key);
      if (seen && now - seen < 25000) return; // la misma frase no se repite enseguida
    }
    const item: Item = { text, prio, ttl: opts.ttl ?? 5000, key, t: now };

    if (!this.cur) {
      // pasó poco desde el último mensaje: los de ambiente se descartan, los demás esperan un instante
      const gap = prio >= 2 ? 450 : 2200;
      if (now - this.lastEnd < gap) {
        if (prio >= 1) this.enqueue(item, gap - (now - this.lastEnd));
        return;
      }
      this.show(item);
      return;
    }
    // ya está hablando
    if (prio > this.cur.prio && now - this.curStart > 1500) { this.interrupt(item); return; }
    if (prio >= 1) this.enqueue(item);
  }

  /** Corta lo que haya en pantalla y vacía la cola (al esconderse, dormirse o silenciarla). */
  clear() {
    window.clearTimeout(this.endTimer);
    window.clearTimeout(this.nextTimer);
    window.clearTimeout(this.swapTimer);
    this.queue = [];
    if (this.cur) { this.cur = null; this.lastEnd = Date.now(); this.onHide(); }
  }

  private enqueue(item: Item, delay = 0) {
    if (this.queue.some((q) => q.key === item.key)) return;
    this.queue.push(item);
    this.queue.sort((a, b) => b.prio - a.prio || a.t - b.t);
    if (this.queue.length > 2) this.queue.length = 2;
    if (!this.cur && !this.nextTimer) this.nextTimer = window.setTimeout(() => this.next(), Math.max(120, delay));
  }

  private show(item: Item) {
    window.clearTimeout(this.nextTimer);
    this.nextTimer = 0;
    this.cur = item;
    this.curStart = Date.now();
    this.recent.set(item.key, this.curStart);
    this.onShow(item.text);
    window.clearTimeout(this.endTimer);
    this.endTimer = window.setTimeout(() => this.end(), readTime(item.text));
  }

  /** Cambia de mensaje con un fundido: primero se oculta el actual y recién después aparece el nuevo. */
  private interrupt(item: Item) {
    window.clearTimeout(this.endTimer);
    this.onHide();
    this.cur = item;
    this.curStart = Date.now() + 200;
    this.recent.set(item.key, this.curStart);
    window.clearTimeout(this.swapTimer);
    this.swapTimer = window.setTimeout(() => {
      if (this.cur !== item) return;
      this.onShow(item.text);
      this.endTimer = window.setTimeout(() => this.end(), readTime(item.text));
    }, 200);
  }

  private end() {
    this.cur = null;
    this.lastEnd = Date.now();
    this.onHide();
    window.clearTimeout(this.nextTimer);
    this.nextTimer = window.setTimeout(() => this.next(), 800);
  }

  private next() {
    this.nextTimer = 0;
    if (this.cur) return;
    const now = Date.now();
    this.queue = this.queue.filter((q) => now - q.t < q.ttl); // lo que ya no viene al caso se descarta
    const item = this.queue.shift();
    if (item && this.canTalk()) this.show(item);
  }
}
