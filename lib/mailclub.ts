import media from './mailclub-media.json';

type Img = { src: string; w: number; h: number };
type EditionMedia = { layers: Record<'closed' | 'back' | 'content' | 'front', Img>; pieces: Record<string, Img> };
const MEDIA = media as Record<string, EditionMedia>;

/** Una pieza suelta del sobre. Posición y ancho en % del escenario; `rot` en grados; `d` = profundidad del paralaje. */
export type Piece = {
  id: string;
  label: string;
  note: string;
  x: number;
  y: number;
  w: number;
  rot: number;
  d: number;
};

export type Edition = {
  id: 'septiembre' | 'octubre';
  n: string;
  mes: string;
  tema: string;
  lema: string;
  desc: string;
  /** Colores de la tarjeta */
  bg: string;
  ink: string;
  accent: string;
  /** Frases de la cinta que se desplaza */
  ticker: string[];
  layers: EditionMedia['layers'];
  pieces: (Piece & { img: Img })[];
};

const build = (id: Edition['id'], pieces: Piece[]) => pieces.map((p) => ({ ...p, img: MEDIA[id].pieces[p.id] }));

/** Textos redactados a partir del contenido de cada sobre (carta de bienvenida y piezas). Revisar con el equipo. */
export const EDITIONS: Edition[] = [
  {
    id: 'septiembre',
    n: '01',
    mes: 'Septiembre',
    tema: 'Rojo',
    lema: 'Pasión, amor, fuerza.',
    desc: 'La primera edición del Mail Club. Un sobre envuelto en un color intenso y lleno de personalidad, con libreta, carta, receta, sudoku y stickers para hacer de un momento algo especial.',
    bg: '#7a1623',
    ink: '#f6e7d8',
    accent: '#f4b9a2',
    ticker: ['Rojo', 'Pasión', 'Amor', 'Fuerza', 'Edición 01'],
    layers: MEDIA.septiembre.layers,
    pieces: build('septiembre', [
      { id: 'libreta', label: 'Libreta bordó', note: 'Rosas en relieve sobre fondo bordó', x: 12, y: 42, w: 17, rot: -9, d: 14 },
      { id: 'sudoku', label: 'The Sudoku', note: 'Versión Crudo_, nivel 1', x: 88, y: 40, w: 17, rot: 8, d: 12 },
      { id: 'carta', label: 'Carta de bienvenida', note: 'El tema del mes, escrito a mano', x: 20, y: 77, w: 25, rot: -6, d: 20 },
      { id: 'receta', label: 'Receta: budín de limón', note: 'Con foto y preparación en el dorso', x: 80, y: 77, w: 25, rot: 7, d: 18 },
      { id: 'separador', label: 'Separador de libros', note: 'Para anotar libro, personaje y frase', x: 62, y: 23, w: 7, rot: 6, d: 10 },
      { id: 'lacre', label: 'Sticker de lacre', note: 'Una amapola en relieve', x: 50, y: 52, w: 10, rot: -12, d: 24 },
      { id: 'lirio', label: 'Sticker de lirio', note: 'Para decorar donde quieras', x: 11, y: 14, w: 13, rot: -24, d: 22 },
      { id: 'corazon', label: 'Sticker de encaje', note: 'Corazón de encaje con mensaje', x: 90, y: 13, w: 14, rot: 16, d: 20 },
    ]),
  },
  {
    id: 'octubre',
    n: '02',
    mes: 'Octubre',
    tema: 'Misterio',
    lema: 'Cuervos, castillos y un cuento por leer.',
    desc: 'Una edición de noche cerrada: un cuento que se lee con la luz tenue, una carta cifrada que hay que descifrar y stickers de criaturas que salen cuando oscurece.',
    bg: '#0e0e10',
    ink: '#ebe6dd',
    accent: '#e0452a',
    ticker: ['Misterio', 'Carta cifrada', 'El hijo del vampiro', 'Cuervos', 'Edición 02'],
    layers: MEDIA.octubre.layers,
    pieces: build('octubre', [
      { id: 'poster', label: 'Póster: El hijo del vampiro', note: 'Un cuento gótico para leer en voz baja', x: 12, y: 41, w: 18, rot: -8, d: 14 },
      { id: 'carta', label: 'Carta cifrada', note: 'Con la clave para descifrarla', x: 88, y: 40, w: 17, rot: 8, d: 12 },
      { id: 'direccion', label: 'Sobre con dirección', note: 'Con estampilla y espacio para escribir', x: 20, y: 77, w: 27, rot: -6, d: 20 },
      { id: 'papel-rojo', label: 'Papel texturado', note: 'Rojo sangre, para dibujar o escribir', x: 82, y: 77, w: 17, rot: 10, d: 18 },
      { id: 'separador', label: 'Separador gótico', note: 'Vitral con luna por un lado, ficha de lectura por el otro', x: 62, y: 23, w: 7, rot: 5, d: 10 },
      { id: 'calabaza', label: 'Sticker de calabaza', note: 'Trazo a mano, borde blanco', x: 36, y: 53, w: 11, rot: -14, d: 24 },
      { id: 'murcielago', label: 'Sticker de murciélago', note: 'Alas abiertas', x: 66, y: 52, w: 12, rot: 8, d: 22 },
      { id: 'castillo', label: 'Sticker de castillo', note: 'Torres góticas', x: 9, y: 13, w: 8, rot: -10, d: 20 },
      { id: 'cuervo', label: 'Sticker de cuervo', note: 'El mensajero de la noche', x: 91, y: 13, w: 7.5, rot: 12, d: 20 },
    ]),
  },
];
