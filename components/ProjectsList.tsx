'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PHOTOS, PROJECTS, SERVICES } from '@/lib/data';

const ALL = 'Todos';

export default function ProjectsList() {
  const [filter, setFilter] = useState(ALL);
  const shown = PROJECTS.filter((p) => filter === ALL || p.servicios.includes(filter));

  return (
    <>
      <div className="wrap" style={{ paddingBottom: 'var(--space-7)' }}>
        <div className="filters label" role="group" aria-label="Filtrar por servicio">
          {[ALL, ...SERVICES].map((s) => (
            <button key={s} className="chip label" aria-pressed={filter === s} onClick={() => setFilter(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <section className="wrap section--tight" style={{ borderTop: '1px solid var(--ink)' }}>
        <div className="table-box">
          <table className="proj-table">
            <thead>
              <tr className="label">
                <th>Nº</th><th>Cliente</th><th>Rubro</th><th>Servicios</th><th>Año</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.n}>
                  <td className="label red">{p.n}</td>
                  <td style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>{p.cliente}</td>
                  <td>{p.rubro}</td>
                  <td>{p.servicios.join(', ')}</td>
                  <td className="label">{p.anio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {shown.map((p) => {
        const photo = p.photo ? PHOTOS[p.photo] : null;
        return (
          <article key={p.n} className="wrap case">
            <div className="case__frame">
              {photo ? (
                <img className="case__photo" src={photo.src} alt={photo.alt} style={{ objectPosition: photo.pos }} />
              ) : (
                <div className="case__photo ph label" style={{ display: 'grid', placeItems: 'center' }}>*( foto )</div>
              )}
            </div>
            <div>
              <span className="label red">( {p.n} ) {p.rubro}</span>
              <h2 className="case__name">{p.cliente}<span className="dot">.</span></h2>
              <div className="case__meta label">
                <span>{p.servicios.join(' · ')}</span>
                <span>{p.anio}</span>
              </div>
              <p className="body-lg" style={{ marginBottom: 'var(--space-4)' }}>{p.desc}</p>
              <Link href="/contacto/" className="btn btn--line">Ver caso completo ↗</Link>
            </div>
          </article>
        );
      })}
    </>
  );
}
