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
  cliente: string;
  rubro: string;
  servicios: string[];
  anio: string;
  desc: string;
  photo?: keyof typeof PHOTOS;
};

export const PROJECTS: Project[] = [
  { n: '01', cliente: 'Piccolino', rubro: '[RUBRO]', servicios: ['Branding', 'Diseño'], anio: '[AÑO]', desc: '[Descripción corta del caso]', photo: 'idea' },
  { n: '02', cliente: 'Malcriada', rubro: '[RUBRO]', servicios: ['Diseño', 'Audiovisual'], anio: '[AÑO]', desc: '[Descripción corta del caso]', photo: 'resultado' },
  { n: '03', cliente: '[CLIENTE]', rubro: '[RUBRO]', servicios: ['Social media'], anio: '[AÑO]', desc: '[Descripción corta del caso]', photo: 'proceso' },
  { n: '04', cliente: '[CLIENTE]', rubro: '[RUBRO]', servicios: ['Naming', 'Branding'], anio: '[AÑO]', desc: '[Descripción corta del caso]' },
  { n: '05', cliente: '[CLIENTE]', rubro: '[RUBRO]', servicios: ['Ads'], anio: '[AÑO]', desc: '[Descripción corta del caso]' },
  { n: '06', cliente: '[CLIENTE]', rubro: '[RUBRO]', servicios: ['Impresiones', 'Diseño'], anio: '[AÑO]', desc: '[Descripción corta del caso]' },
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
