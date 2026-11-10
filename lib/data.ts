import media from './projects-media.json';

export const MAIL = 'agencycrudo@gmail.com';
export const INSTAGRAM = 'https://www.instagram.com/agenciacrudo_/';
export const TIKTOK = 'https://www.tiktok.com/@agenciacrudo_';

export const NAV = [
  { href: '/nosotras/', label: 'Nosotras' },
  { href: '/proyectos/', label: 'Proyectos' },
  { href: '/tienda/', label: 'Tienda' },
  { href: '/contacto/', label: 'Contacto' },
];

export const SERVICES = [
  'Branding',
  'Naming',
  'Diseño',
  'Social media',
  'Audiovisual',
  'Ads',
  'Impresiones',
];

export const PACKS = [
  { name: '[NOMBRE PACK]', desc: '[Detalle de qué incluye]', price: '[PRECIO]' },
  { name: '[NOMBRE PACK]', desc: '[Detalle de qué incluye]', price: '[PRECIO]' },
  { name: '[NOMBRE PACK]', desc: '[Detalle de qué incluye]', price: '[PRECIO]' },
  { name: 'Personalizado', desc: '[Detalle de qué incluye]', price: '[PRECIO]', red: true },
];

export const STEPS = [
  { t: '[Paso 1]', d: '[Texto del paso, a validar]' },
  { t: '[Paso 2]', d: '[Texto del paso, a validar]' },
  { t: '[Paso 3]', d: '[Texto del paso, a validar]' },
  { t: '[Paso 4]', d: '[Texto del paso, a validar]' },
];

export const PHOTOS = {
  idea: { src: '/img/idea-piccolino.jpg', alt: 'Moodboard de Piccolino abierto en Illustrator en una laptop, frente a una pared con collage', pos: '55% 47%' },
  proceso: { src: '/img/proceso.jpg', alt: 'Integrante del equipo fotografiando una torta y bebidas junto a un ventanal con un cartel de neón', pos: 'center 58%' },
  resultado: { src: '/img/resultado-malcriada.jpg', alt: 'Porción de torta de zanahoria con ilustraciones y el nombre Malcriada en rosa', pos: 'center 30%' },
  equipo: { src: '/img/equipo.jpg', alt: 'Las tres integrantes de Crudo posando juntas y sonriendo frente a una pared blanca', pos: 'center 40%' },
};

export type Project = {
  n: string;
  /** Carpeta en /public/proyectos y clave en lib/projects-media.json */
  slug: string;
  cliente: string;
  rubro: string;
  servicios: string[];
  /** Opcional: si se completa, se muestra junto al rubro. */
  anio?: string;
  desc: string;
  /** Qué se hizo, en pocas palabras. */
  entregables: string[];
  /** Colores del capítulo: fondo, texto y acento (punto del título). */
  bg: string;
  ink: string;
  accent: string;
  /** Paleta de marca (solo casos de identidad). */
  palette?: string[];
  /** Portada cuadrada (logos): se muestra entera sobre este color en vez de recortarse. */
  coverBg?: string;
  /** Nombre largo: baja el tamaño del título. */
  long?: boolean;
};

export type ProjectImage = { src: string; w: number; h: number; alt: string; group?: 'stories' | 'wide' };
export type ProjectMedia = { name: string; cover: ProjectImage; gallery: ProjectImage[]; video?: { src: string } };

/** Material optimizado por scripts/build-projects.mjs (origen: /design/Proyectos). */
export const PROJECT_MEDIA = media as Record<string, ProjectMedia>;

/** Textos redactados a partir del material entregado: revisar rubro, servicios y descripción con cada cliente. */
export const PROJECTS: Project[] = [
  {
    n: '01', slug: 'piccolino', cliente: 'Piccolino', rubro: 'Marca de mascotas', servicios: ['Branding', 'Diseño', 'Impresiones', 'Social media'],
    desc: 'Una marca para perros con un salchicha como protagonista. Trazo a mano, formas de nube y una paleta que no se calla: del cartel de calle al merch, pasando por las historias de Instagram.',
    entregables: ['Identidad visual', 'Ilustración del símbolo', 'Cartel y cinta de marca', 'Camisetas y hoodies', 'Historias para redes'],
    bg: '#f48301', ink: '#111111', accent: '#fef748', palette: ['#fef748', '#f48301', '#87c0ed', '#63bb50', '#111111'],
  },
  {
    n: '02', slug: 'mart-bakery', cliente: 'Mart Bakery', rubro: 'Panadería y pastelería', servicios: ['Branding', 'Diseño', 'Impresiones'],
    desc: 'Una panadería con letra manuscrita y mucho dulce. Un logotipo hecho a mano, stickers de tortas ilustradas y packaging color manteca que se ve tan bien como sabe.',
    entregables: ['Logotipo y variantes', 'Stickers ilustrados', 'Packaging y cajas', 'Delantal y uniformes', 'Toldo y señalética'],
    bg: '#fcecb3', ink: '#392823', accent: '#82242a', palette: ['#fcecb3', '#82242a', '#cad7e8', '#392823'],
  },
  {
    n: '03', slug: 'miga', cliente: 'Miga', rubro: 'Panadería colombiana', servicios: ['Branding', 'Diseño', 'Impresiones'],
    desc: 'La panadería colombiana tiene cara: una niña con pañuelo como isotipo. Tipografía redondeada, marrón y crema, del letrero colgante a la vidriera.',
    entregables: ['Isotipo y logotipo', 'Letrero y toldo', 'Vidriera', 'Afiches', 'Lista de precios'],
    bg: '#6a4226', ink: '#ece4a7', accent: '#e0a460', palette: ['#6a4226', '#ece4a7'],
  },
  {
    n: '04', slug: 'nube-skin', cliente: 'Nube Skin', rubro: 'Cuidado de la piel', servicios: ['Branding', 'Diseño', 'Social media'],
    desc: 'Un logo que parece una nube de perla. Letras infladas en 3D, azul pervinca y un universo suave para una marca de skincare que se lanzó con intriga.',
    entregables: ['Logo y monograma 3D', 'Stickers', 'Moodboard', 'Lanzamiento “coming soon”', 'Contenido para redes'],
    bg: '#b4c8ed', ink: '#1f2a4a', accent: '#ffffff', palette: ['#b4c8ed', '#e6eef4', '#cabbc2', '#8a9cb6'],
  },
  {
    n: '05', slug: 'archetype', cliente: 'Archetype', rubro: 'Estudio de arquitectura · Berlín', servicios: ['Branding', 'Diseño', 'Audiovisual', 'Social media'],
    desc: 'Tipografía gigante, concreto y rojo señal. Una identidad para un estudio de arquitectura de Berlín que se arma como un edificio: por bloques.',
    entregables: ['Logotipo', 'Tarjetas', 'Afiches', 'Historias de Instagram', 'Secuencia en video'],
    bg: '#ebebeb', ink: '#111111', accent: '#d4361d', palette: ['#111111', '#ffffff', '#d4361d'],
  },
  {
    n: '06', slug: 'malcriada', cliente: 'Malcriada', rubro: 'Cafetería y pastelería', servicios: ['Audiovisual'],
    desc: 'Una sesión de fotos para que la torta de zanahoria se luzca. Luz de ventana, neón y café con leche, con la gente del lugar como parte de la escena.',
    entregables: ['Fotografía gastronómica', 'Retratos en el local', 'Edición y color'],
    bg: '#f2b9a6', ink: '#111111', accent: '#a33b21',
  },
  {
    n: '07', slug: 'da-vinci', cliente: 'Clínica Dental Da Vinci', rubro: 'Odontología', servicios: ['Branding'],
    desc: 'Un diente que lleva adentro al Hombre de Vitruvio. Trazo fino, azul marino y una tipografía sobria para una clínica que combina precisión y arte.',
    entregables: ['Isotipo y logotipo', 'Variantes en positivo y negativo', 'Guía de marca'],
    bg: '#2a3255', ink: '#eff2f7', accent: '#9fb4ff', palette: ['#2a3255', '#eff2f7'], coverBg: '#2a3255', long: true,
  },
  {
    n: '08', slug: 'anma', cliente: 'ANMA Beauty', rubro: 'Belleza', servicios: ['Branding'],
    desc: 'Letras minúsculas, un verde lima que se nota y un azul pizarra que calma. El sistema de logos de ANMA Beauty: principal, secundario y marcas de agua.',
    entregables: ['Logotipo principal y secundario', 'Monograma', 'Marcas de agua', 'Guía de marca'],
    bg: '#ebf263', ink: '#2f4a5c', accent: '#2f4a5c', palette: ['#ebf263', '#3f5b6d', '#ddf1fc', '#fbf7f4'], coverBg: '#3f5b6d',
  },
];

/** Integrantes: completar nombre, rol, texto y foto. Con `photo: null` el carrusel muestra el espacio reservado. */
export type Member = {
  name: string;
  role: string;
  origin: string;
  bio: string;
  photo: { src: string; alt: string; pos?: string } | null;
};

export const TEAM: Member[] = [
  { name: '[Nombre]', role: '[Rol]', origin: '[ARG // COL]', bio: '[Texto sobre la integrante: qué hace en Crudo_, de dónde viene y qué mezcla trae al equipo.]', photo: null },
  { name: '[Nombre]', role: '[Rol]', origin: '[ARG // COL]', bio: '[Texto sobre la integrante: qué hace en Crudo_, de dónde viene y qué mezcla trae al equipo.]', photo: null },
  { name: '[Nombre]', role: '[Rol]', origin: '[ARG // COL]', bio: '[Texto sobre la integrante: qué hace en Crudo_, de dónde viene y qué mezcla trae al equipo.]', photo: null },
];
