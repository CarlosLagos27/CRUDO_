'use client';

import { useState } from 'react';
import { MAIL, SERVICES } from '@/lib/data';

/** Clave pública de Web3Forms (va en el código por diseño; se restringe al dominio desde su panel). */
const W3F_KEY = '68fe7bdb-7afc-4b2d-a95b-ca2c0d3289d7';

/** Sitio estático: el formulario se envía a Web3Forms, que lo reenvía por mail a Crudo. Si falla, queda el mailto como respaldo. */
export default function ContactForm() {
  const [picked, setPicked] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  const toggle = (s: string) =>
    setPicked((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (f.get('botcheck')) return; // trampa para bots: las personas no ven este campo
    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: W3F_KEY,
          subject: 'Idea en crudo: nuevo mensaje desde la web',
          from_name: 'Web Crudo',
          replyto: f.get('mail'),
          nombre: f.get('nombre'),
          mail: f.get('mail'),
          whatsapp: f.get('whatsapp') || '-',
          servicios: picked.join(', ') || '-',
          mensaje: f.get('mensaje'),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'error');
      form.reset();
      setPicked([]);
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  }

  const mailtoFallback = () => {
    const f = new FormData(document.querySelector<HTMLFormElement>('form.form')!);
    const body = [`Nombre: ${f.get('nombre')}`, `Mail: ${f.get('mail')}`, `WhatsApp: ${f.get('whatsapp') || '-'}`, `Servicios: ${picked.join(', ') || '-'}`, '', `${f.get('mensaje')}`].join('\n');
    return `mailto:${MAIL}?subject=${encodeURIComponent('Idea en crudo')}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className="form" onSubmit={onSubmit}>
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
      <label className="field">
        <span className="label">( 01 ) Nombre</span>
        <input name="nombre" required placeholder="Tu nombre" autoComplete="name" />
      </label>
      <label className="field">
        <span className="label">( 02 ) Mail</span>
        <input name="mail" type="email" required placeholder="tu@mail.com" autoComplete="email" />
      </label>
      <label className="field">
        <span className="label">( 03 ) WhatsApp</span>
        <input name="whatsapp" type="tel" inputMode="tel" placeholder="+54 9 11 1234 5678" autoComplete="tel" pattern="[0-9+()s-]{7,20}" title="Número con código de país, por ejemplo +54 9 11 1234 5678" />
      </label>
      <fieldset className="field" style={{ border: 0 }}>
        <legend className="label" style={{ marginBottom: 8 }}>( 04 ) Qué necesitás</legend>
        <div className="chips">
          {SERVICES.map((s) => (
            <button type="button" key={s} className="chip label" aria-pressed={picked.includes(s)} onClick={() => toggle(s)}>
              {s}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="field">
        <span className="label">( 05 ) Contanos tu idea</span>
        <textarea name="mensaje" required placeholder="Contanos cómo viene tu idea, tal cual." />
      </label>
      <div>
        <button type="submit" className="btn btn--red" disabled={status === 'sending'}>{status === 'sending' ? 'Enviando…' : 'Enviar ↗'}</button>
      </div>
      <div aria-live="polite">
        {status === 'ok' && <p className="lead">¡Gracias! Recibimos tu idea y te respondemos pronto.</p>}
        {status === 'error' && (
          <p className="lead">No se pudo enviar. Probá de nuevo o <a className="link" href={mailtoFallback()}>escribinos por mail ↗</a>.</p>
        )}
      </div>
    </form>
  );
}
