'use client';

import { useState } from 'react';
import { Clip } from '@/components/Brand';

/** Tarjeta flotante sujetada con el clip: se recoge a una pestaña y se despliega completa. */
export default function StoryCard() {
  const [open, setOpen] = useState(true);

  return (
    <div className={`float-card${open ? '' : ' is-closed'}`}>
      <button type="button" className="float-card__head" aria-expanded={open} aria-controls="float-card-body" onClick={() => setOpen(!open)}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15 }}>Crudo_</span>
        <span className="float-card__tools" aria-hidden="true">
          <span className="float-card__clip"><Clip size={26} color="var(--yellow)" stroke={2} /></span>
          <span className="float-card__icon">{open ? '−' : '+'}</span>
        </span>
        <span className="sr-only">{open ? 'Recoger tarjeta' : 'Desplegar tarjeta'}</span>
      </button>
      <div className={`float-card__panel${open ? ' is-open' : ''}`} id="float-card-body">
        <div className="float-card__inner">
          <p style={{ fontWeight: 500, fontSize: 16, lineHeight: 1.3 }}>Somos una agencia creativa hecha por mujeres argento‑colombianas.</p>
          <p style={{ fontSize: 13, lineHeight: 1.4 }}>Branding, naming, diseño, social media, audiovisual, ads e impresiones.</p>
          <a href="#historia" style={{ fontSize: 14, fontWeight: 500, marginTop: 18 }}>Conocé la historia ↘</a>
        </div>
      </div>
    </div>
  );
}
