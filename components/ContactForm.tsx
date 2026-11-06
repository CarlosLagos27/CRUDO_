'use client';

import { useState } from 'react';
import { MAIL, SERVICES } from '@/lib/data';

/** Sitio estático: el envío abre el mail del usuario con el mensaje armado. */
export default function ContactForm() {
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (s: string) =>
    setPicked((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = [
      `Nombre: ${f.get('nombre')}`,
      `Mail: ${f.get('mail')}`,
      `Servicios: ${picked.join(', ') || '-'}`,
      '',
      `${f.get('mensaje')}`,
    ].join('\n');
    window.location.href = `mailto:${MAIL}?subject=${encodeURIComponent('Idea en crudo')}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label className="field">
        <span className="label">( 01 ) Nombre</span>
        <input name="nombre" required placeholder="Tu nombre" autoComplete="name" />
      </label>
      <label className="field">
        <span className="label">( 02 ) Mail</span>
        <input name="mail" type="email" required placeholder="tu@mail.com" autoComplete="email" />
      </label>
      <fieldset className="field" style={{ border: 0 }}>
        <legend className="label" style={{ marginBottom: 8 }}>( 03 ) Qué necesitás</legend>
        <div className="chips">
          {SERVICES.map((s) => (
            <button type="button" key={s} className="chip label" aria-pressed={picked.includes(s)} onClick={() => toggle(s)}>
              {s}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="field">
        <span className="label">( 04 ) Contanos tu idea</span>
        <textarea name="mensaje" required placeholder="Contanos cómo viene tu idea, tal cual." />
      </label>
      <div><button type="submit" className="btn btn--red">Enviar ↗</button></div>
    </form>
  );
}
