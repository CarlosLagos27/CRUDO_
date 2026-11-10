// Optimiza el material de /design/Proyectos para la web y genera lib/projects-media.json.
// Uso: node scripts/build-projects.mjs  (necesita la carpeta ../design/Proyectos; el resultado se versiona en public/proyectos)
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(process.env.PROJECTS_SRC || '../design/Proyectos');
const OUT = path.resolve('public/proyectos');
const MANIFEST = path.resolve('lib/projects-media.json');

/**
 * Por proyecto: carpeta de origen, portada (`cover`) y piezas de la galería.
 * Los números son el índice en la lista ordenada de .png/.jpg de la carpeta (ver scripts/_sheet.mjs).
 * `g: 'stories'` agrupa piezas verticales de redes en una tira aparte.
 */
const PROJECTS = {
  piccolino: {
    dir: 'PICCOLINO', name: 'Piccolino',
    cover: [8, 'Integrante con camiseta Piccolino, acostada sobre fondo blanco'],
    gallery: [
      [7, 'Ilustración del perro salchicha de Piccolino corriendo'],
      [6, 'Marca Piccolino en verde sobre fondo amarillo'],
      [0, 'Cartel de calle con la marca Piccolino'],
      [10, 'Cartel Piccolino sobre el pavimento'],
      [9, 'Camiseta y hoodie Piccolino sobre el pasto'],
      [2, 'Camiseta y hoodie sobre fondo azul con forma de nube'],
      [11, 'Cintas de embalaje con la marca Piccolino'],
      [3, 'Cintas Piccolino sobre ilustración en naranja'],
      [4, 'Persona con perros frente al nombre Piccolino'],
      [5, 'Caniche probando un vasito amarillo de Piccolino'],
      [1, 'Collage de fotos de perros con la marca Piccolino'],
      [12, 'Historia de Instagram con dálmata', 'stories'],
      [13, 'Historia de Instagram con perro con pañuelo rosa', 'stories'],
      [14, 'Historia de Instagram con perro salchicha', 'stories'],
      [15, 'Historia de Instagram con perro pastor', 'stories'],
    ],
  },
  'mart-bakery': {
    dir: 'MART BAKERY', name: 'Mart Bakery',
    cover: [18, 'Vaso de Mart Bakery con postre de chocolate sobre una mesa de madera'],
    gallery: [
      [0, 'Logo Mart Bakery en azul claro sobre chocolate'],
      [3, 'Logo Mart Bakery en crema sobre bordó'],
      [16, 'Bandeja de medialunas con tarjeta Mart'],
      [17, 'Delantal con el logo de Mart Bakery'],
      [19, 'Toldo azul con el logo de Mart Bakery'],
      [20, 'Panadero con remera de Mart Bakery'],
      [21, 'Tortas con stickers ilustrados de Mart'],
      [24, 'Bandeja de masas con stickers de Mart'],
      [26, 'Porciones de torta en cajas triangulares de Mart'],
      [27, 'Café para llevar con vaso de Mart sobre la vereda'],
      [28, 'Porción de torta sobre mantel con el logo Mart'],
      [29, 'Dos personas llevando cajas de Mart Bakery'],
      [30, 'Cajas amarillas de Mart Bakery con un bollo encima'],
      [31, 'Set de stickers ilustrados de tortas'],
    ],
  },
  miga: {
    dir: 'MIGA', name: 'Miga',
    cover: [16, 'Fachada de Miga Panadería Colombiana con la marca en la vidriera'],
    gallery: [
      [1, 'Afiche de Miga con modelo mordiendo un pan'],
      [2, 'Entrada de Miga con toldo y letrero'],
      [3, 'Letrero colgante de Miga'],
      [4, 'Persona comiendo pan frente al local de Miga'],
      [5, 'Vidriera de Miga con el isotipo'],
      [8, 'Isotipo de Miga: una niña con pañuelo'],
      [11, 'Isotipo de Miga con contorno crema'],
      [13, 'Marca de Miga en composición circular'],
      [0, 'Lista de precios de Miga sobre masa de croissant'],
      [17, 'Lista de precios de Miga'],
      [15, 'Letrero colgante de Miga sobre una fachada'],
      [14, 'Fachada de Miga con persianas verdes'],
    ],
  },
  'nube-skin': {
    dir: 'NUBE SKIN', name: 'Nube Skin',
    cover: [27, 'Logo Nube Skin sobre un cielo con nubes'],
    gallery: [
      [0, 'Monograma NS en 3D sobre azul'],
      [4, 'Logo Nube Skin en 3D perlado sobre azul'],
      [3, 'Estrella perlada de la marca'],
      [5, 'Monograma NS en perla'],
      [13, 'Sticker redondo con el logo Nube Skin'],
      [14, 'Sticker redondo con el monograma NS'],
      [19, 'Moodboard de Nube Skin'],
      [20, 'Persona en la bañera con el logo Nube Skin'],
      [22, 'Rostro con mascarilla y pincel, para el lanzamiento'],
      [24, 'Piel con gotas de agua y el logo Nube Skin'],
      [26, 'Hombro mojado con el logo Nube Skin'],
      [23, 'Pieza "coming soon" para redes'],
      [1, 'Pieza de redes: ¿cómo comprar?'],
      [2, 'Pieza de redes: newbies'],
    ],
  },
  archetype: {
    dir: 'ARCHETYPE', name: 'Archetype',
    cover: [13, 'Tarjetas rojas de Archetype dispersas sobre fondo claro'],
    gallery: [
      [5, 'Logo Archetype en negro'],
      [0, 'Tarjetas de Archetype sobre fotografía de arquitectura'],
      [2, 'Afiche de Archetype con plástico arrugado'],
      [3, 'Collage de un edificio con la marca Archetype'],
      [1, 'Afiche con arquitectura curva y el logo Archetype'],
      [11, 'Afiche con figura bajo un edificio'],
      [12, 'Silueta de edificio blanca sobre fotografía en blanco y negro'],
      [14, 'Afiche de Archetype con plástico sobre fondo claro'],
      [10, 'Letra A de la marca Archetype'],
      [15, 'Historia de Instagram sobre interior de piedra', 'stories'],
      [16, 'Historia de Instagram sobre una mesa de dibujo', 'stories'],
      [17, 'Historia de Instagram con retrato de persona de negro', 'stories'],
      [18, 'Historia de Instagram sobre concreto', 'stories'],
      [19, 'Historia de Instagram sobre un café de diseño', 'stories'],
    ],
    video: ['ARCHETYPE/1x/Secuencia archetype.mp4', 'secuencia.mp4'],
  },
  malcriada: {
    dir: 'MALCRIADA FOTOS', name: 'Malcriada',
    cover: [27, 'Porción de torta de zanahoria sobre una mesa de madera junto a la ventana'],
    gallery: [
      [0, 'Mesa de mármol con torta, bebida y rol de canela'],
      [5, 'Primer plano de la torta de zanahoria'],
      [9, 'Rol de canela y café con leche junto al cartel de neón'],
      [13, 'Torta de zanahoria con bebida roja frente a la ventana'],
      [15, 'Porción de torta de zanahoria con naranja deshidratada'],
      [18, 'Bebida roja con rodaja de naranja'],
      [19, 'Café con leche y bebida con naranja'],
      [22, 'Pared del local con ilustración y frase'],
      [23, 'Torta de zanahoria de frente'],
      [29, 'Persona sonriendo junto a la ventana con su torta'],
      [30, 'Persona en el local con torta y bebida'],
      [35, 'Persona disfrutando de la torta con un café helado'],
      [1, 'Mesa de mármol vista desde arriba'],
      [24, 'Torta de zanahoria sobre la barra'],
      [8, 'Mesa del local con pared pintada', 'wide'],
    ],
  },
  'da-vinci': {
    dir: 'Clínica Dental Da Vinci', name: 'Clínica Dental Da Vinci',
    cover: [1, 'Logo de Clínica Dental Da Vinci en blanco sobre azul marino'],
    gallery: [
      [0, 'Logo horizontal de Clínica Dental Da Vinci en azul'],
      [2, 'Isotipo: un diente con el hombre de Vitruvio'],
      [3, 'Tipografía de la marca Clínica Dental Da Vinci'],
      [4, 'Tipografía de la marca en blanco sobre azul'],
      [5, 'Isotipo en blanco sobre azul marino'],
    ],
  },
  anma: {
    dir: 'ANMA BEAUTY', name: 'ANMA Beauty',
    cover: [2, 'Logo ANMA Beauty en verde lima sobre azul pizarra'],
    gallery: [
      [0, 'Logo ANMA Beauty en azul sobre lima'],
      [1, 'Logo ANMA Beauty en azul sobre celeste'],
      [3, 'Logo ANMA Beauty en celeste sobre azul'],
      [4, 'Logo ANMA Beauty en crema sobre azul'],
      [6, 'Logo ANMA Beauty en azul sobre crema'],
      [8, 'Monograma anma en azul sobre lima'],
      [10, 'Monograma anma en lima sobre azul'],
      [12, 'Monograma anma en blanco sobre azul'],
      [13, 'Monograma anma en azul sobre crema'],
      [7, 'Monograma anma en azul sobre celeste'],
      [11, 'Monograma anma en crema sobre azul'],
    ],
  },
};

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

async function emit(file, dest, { max, quality }) {
  const out = await sharp(file, { limitInputPixels: false }).rotate()
    .resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toFile(dest);
  return { w: out.width, h: out.height, kb: Math.round(out.size / 1024) };
}

const manifest = {};
let totalKb = 0;
for (const [slug, cfg] of Object.entries(PROJECTS)) {
  const dir = path.join(SRC, cfg.dir);
  const files = walk(dir).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort();
  const outDir = path.join(OUT, slug);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const m = { name: cfg.name, gallery: [] };

  const [ci, calt] = cfg.cover;
  const c = await emit(files[ci], path.join(outDir, 'cover.webp'), { max: 2000, quality: 80 });
  m.cover = { src: `/proyectos/${slug}/cover.webp`, w: c.w, h: c.h, alt: calt };
  totalKb += c.kb;

  let n = 1;
  for (const [i, alt, group] of cfg.gallery) {
    const name = `${String(n++).padStart(2, '0')}.webp`;
    const r = await emit(files[i], path.join(outDir, name), { max: 1500, quality: 78 });
    m.gallery.push({ src: `/proyectos/${slug}/${name}`, w: r.w, h: r.h, alt, ...(group ? { group } : {}) });
    totalKb += r.kb;
  }
  if (cfg.video) {
    const [from, to] = cfg.video;
    fs.copyFileSync(path.join(SRC, from), path.join(outDir, to));
    m.video = { src: `/proyectos/${slug}/${to}` };
  }
  manifest[slug] = m;
  console.log(slug.padEnd(12), `${m.gallery.length + 1} imágenes`);
}
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`listo · ${Math.round(totalKb / 1024)} MB de imágenes · ${MANIFEST}`);
