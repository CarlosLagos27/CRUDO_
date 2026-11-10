// Optimiza el material de /design/Mailclub (PNG con transparencia) a WebP y genera lib/mailclub-media.json.
// Uso: node scripts/build-mailclub.mjs  (necesita ../design/Mailclub; el resultado se versiona en public/mailclub)
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(process.env.MAILCLUB_SRC || '../design/Mailclub');
const OUT = path.resolve('public/mailclub');
const MANIFEST = path.resolve('lib/mailclub-media.json');

/** Capas del sobre: mismo lienzo 2400×3000 en las cuatro, así que se superponen sin ajustes. */
const LAYERS = { closed: '0_sobre_cerrado', back: '1_sobre_atras', content: '2_contenido', front: '3_sobre_frente' };

/** Piezas sueltas por edición: id -> archivo dentro de piezas_individuales (o ruta relativa). */
const PIECES = {
  septiembre: {
    libreta: 'piezas_individuales/libreta_bordo.png',
    'libreta-blanca': 'piezas_individuales/libreta_blanca.png',
    carta: 'piezas_individuales/carta_hola.png',
    sudoku: 'piezas_individuales/sudoku.png',
    receta: 'piezas_individuales/receta_frente.png',
    'receta-dorso': 'piezas_individuales/receta_dorso.png',
    separador: 'piezas_individuales/separador_frente.png',
    'separador-dorso': 'piezas_individuales/separador_dorso.png',
    lacre: 'piezas_individuales/sticker_lacre.png',
    lirio: 'piezas_individuales/sticker_lirio.png',
    corazon: 'piezas_individuales/sticker_corazon.png',
    encaje: 'piezas_individuales/sticker_encaje.png',
  },
  octubre: {
    poster: 'piezas_individuales/poster_cuento.png',
    carta: 'piezas_individuales/carta_cifrada.png',
    separador: 'piezas_individuales/separador_frente.png',
    'separador-dorso': 'piezas_individuales/separador_dorso.png',
    'papel-rojo': 'piezas_individuales/papel_texturado_rojo.png',
    'papel-negro': 'piezas_individuales/papel_texturado_negro.png',
    direccion: 'mailclub_octubre_sobre_frente_direccion_transparente.png',
    calabaza: 'piezas_individuales/sticker_calabaza.png',
    castillo: 'piezas_individuales/sticker_castillo.png',
    cuervo: 'piezas_individuales/sticker_cuervo.png',
    murcielago: 'piezas_individuales/sticker_murcielago.png',
  },
};

async function emit(file, dest, { max, quality, trim }) {
  let img = sharp(file, { limitInputPixels: false });
  if (trim) img = img.trim({ threshold: 8 });
  const out = await img.resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true }).webp({ quality, alphaQuality: 90, effort: 5 }).toFile(dest);
  return { w: out.width, h: out.height, kb: Math.round(out.size / 1024) };
}

const manifest = {};
let total = 0;
for (const mes of Object.keys(PIECES)) {
  const dir = path.join(SRC, mes);
  const outDir = path.join(OUT, mes);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const m = { layers: {}, pieces: {} };
  for (const [k, f] of Object.entries(LAYERS)) {
    // lienzo completo (sin recortar) para que las capas queden alineadas
    const r = await emit(path.join(dir, 'capas_animacion', f + '.png'), path.join(outDir, `sobre-${k}.webp`), { max: 1200, quality: 84, trim: false });
    m.layers[k] = { src: `/mailclub/${mes}/sobre-${k}.webp`, w: r.w, h: r.h };
    total += r.kb;
  }
  for (const [id, rel] of Object.entries(PIECES[mes])) {
    const small = /sticker/.test(rel);
    const r = await emit(path.join(dir, rel), path.join(outDir, `${id}.webp`), { max: small ? 700 : 1000, quality: 84, trim: true });
    m.pieces[id] = { src: `/mailclub/${mes}/${id}.webp`, w: r.w, h: r.h };
    total += r.kb;
  }
  manifest[mes] = m;
  console.log(mes.padEnd(11), `${Object.keys(m.layers).length} capas + ${Object.keys(m.pieces).length} piezas`);
}
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`listo · ${(total / 1024).toFixed(1)} MB · ${MANIFEST}`);
