import type { SecretId } from './clippy-messages';

/** Lo que Clippy recuerda de esta persona en este navegador. Todo se guarda en localStorage, sin enviarse a ningún lado. */
export type ClipState = {
  visits: number;
  /** Marca de tiempo de la visita anterior. */
  last: number;
  /** Último proyecto que estuvo mirando. */
  lastSlug: string;
  tourDone: boolean;
  /** Preferencias */
  hidden: boolean;
  sound: boolean;
  quiet: boolean;
  /** Secretos encontrados y contadores. */
  found: SecretId[];
  pets: number;
};

const KEY = 'crudo-clippy';

export const DEFAULTS: ClipState = { visits: 0, last: 0, lastSlug: '', tourDone: false, hidden: false, sound: false, quiet: false, found: [], pets: 0 };

export function loadState(): ClipState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ClipState>) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveState(s: ClipState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* modo privado o almacenamiento bloqueado: se sigue sin memoria */
  }
}

/** Saludo según la hora local. */
export function dayPart(d = new Date()): 'morning' | 'afternoon' | 'night' {
  const h = d.getHours();
  return h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 20 ? 'afternoon' : 'night';
}
