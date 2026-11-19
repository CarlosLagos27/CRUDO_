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

export const PACKS_NOTE = 'Cada proyecto es único, y su precio también. Escribinos y te pasamos tu presupuesto.';

export const PACKS: { name: string; desc: string; items?: string[]; red?: boolean }[] = [
  { name: 'Redes Sociales', desc: 'Tu marca, viva todos los días.', items: ['Estrategia de contenido', 'Creación de contenido', 'Community Management', 'Ads', 'Calendario mensual'] },
  { name: 'Diseño Gráfico', desc: 'De la idea en crudo a una identidad.', items: ['Branding y rebranding', 'Packaging', 'Señalética', 'Merch', 'Piezas gráficas', 'Impresiones de pequeña y gran escala'] },
  { name: 'Audiovisual', desc: 'Lo que tu marca tiene para contar, en movimiento.', items: ['Dirección creativa y de arte', 'Video', 'Fotografía', 'Edición de video e imagen', 'Cobertura de eventos'] },
  { name: 'A medida', desc: 'Armamos el pack con lo que necesites. Combiná servicios de las tres áreas o contanos tu proyecto puntual.', red: true },
];

/** Productos digitales de la tienda (ebooks). Fotos en /public/tienda, con el mismo rojo de fondo de la sección. */
export const DIGITALES = [
  { name: 'Guía CM desde casa + Planner mensual', href: 'https://mpago.la/2ygE6Pv', old: '$60.000', price: '$30.000', off: '50% OFF', img: '/tienda/combo-community-manager.webp', alt: 'Los dos libros juntos con un sello que dice: lleva los dos por $30.000' },
  { name: 'Planner mensual para Community Managers', href: 'https://mpago.la/2EHntvY', old: '$25.000', price: '$19.990', off: '20% OFF', img: '/tienda/planner-community-managers.webp', alt: 'Libro Planner mensual para Community Managers, by Crudo_' },
  { name: 'Guía del Community Manager desde casa', href: 'https://mpago.la/34i9sU2', old: '$45.000', price: '$39.990', off: '11% OFF', img: '/tienda/guia-community-manager.webp', alt: 'Libro Community Manager desde casa, by Crudo_' },
];

export const STEPS = [
  { t: 'La idea', d: 'Partimos de tu idea tal como viene: la escuchamos, la ordenamos y definimos hacia dónde va.' },
  { t: 'El proceso', d: 'Diseño, cámara y medios tradicionales: probamos, ajustamos y te mostramos el avance en cada paso.' },
  { t: 'El resultado', d: 'Una marca, una pieza o una campaña lista para salir al mundo.' },
];

export const PHOTOS = {
  idea: { src: '/img/idea-piccolino.jpg', alt: 'Moodboard de Piccolino abierto en Illustrator en una laptop, frente a una pared con collage', pos: '55% 47%' },
  proceso: { src: '/img/cambio-dev.webp', raw: '/img/cambio-raw.webp', alt: 'Frasco de Nescafé Ice junto a un vaso de café frío sobre fondo azul, con luz y color ya revelados', pos: 'center 55%' },
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
    desc: 'Una pastelería con letra manuscrita y mucho dulce. Un logotipo hecho a mano, stickers de tortas ilustradas y packaging color manteca que se ve tan bien como sabe.',
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
    entregables: ['Logo y monograma 3D', 'Moodboard', 'Lanzamiento “coming soon”', 'Contenido para redes'],
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
    desc: 'Una muela que lleva adentro al Hombre de Vitruvio. Trazo fino, azul marino y una tipografía sobria para una clínica que combina precisión y arte.',
    entregables: ['Isotipo y logotipo', 'Variantes en positivo y negativo', 'Guía de marca'],
    bg: '#2a3255', ink: '#eff2f7', accent: '#9fb4ff', palette: ['#2a3255', '#eff2f7'], coverBg: '#2a3255', long: true,
  },
  {
    n: '08', slug: 'anma', cliente: 'ANMA Beauty', rubro: 'Belleza', servicios: ['Branding', 'Social media'],
    desc: 'Letras minúsculas, un verde lima que se nota y un azul pizarra que calma. El sistema de logos de ANMA Beauty —principal, secundario y marcas de agua— y las piezas de redes para lanzar su bruma Matifix.',
    entregables: ['Logotipo principal y secundario', 'Monograma', 'Marcas de agua', 'Guía de marca', 'Fotos de producto', 'Contenido para redes'],
    bg: '#ebf263', ink: '#2f4a5c', accent: '#2f4a5c', palette: ['#ebf263', '#3f5b6d', '#ddf1fc', '#fbf7f4'], coverBg: '#3f5b6d',
  },
];

/** Integrantes, en el orden en que aparecen en el carrusel. La foto sale de las capas de /public/equipo. */
export type Member = {
  name: string;
  role: string;
  origin: string;
  bio: string;
  photo: { src: string; alt: string; pos?: string } | null;
};

export const TEAM: Member[] = [
  { name: "Luz Belén Jaimes", role: "Productora y Directora Audiovisual | Editora de Video", origin: 'ARG', bio: "Profesional creativa formada en producción y dirección audiovisual, con experiencia en edición de video, dirección de arte, creación de contenido y comunicación visual. He participado en el desarrollo y la realización de proyectos de fotografía, rodajes cinematográficos, producciones de moda, videoclips y campañas publicitarias, involucrándome en distintas etapas del proceso creativo y productivo. Cuento con experiencia en la conceptualización de ideas, planificación de producciones, desarrollo de propuestas visuales y edición de contenido para marcas, plataformas digitales y proyectos audiovisuales. Combino una mirada creativa con habilidades técnicas y experiencia colaborando con fotógrafos, diseñadores, modelos, talentos, clientes y equipos multidisciplinarios.", photo: null },
  { name: "Laura Lagos", role: "Social Media Manager", origin: 'COL', bio: "Soy Laura y me encargo de que las ideas en crudo encuentren su lugar en las redes. Escucho a cada marca, entiendo su personalidad y la transformo en contenido que conecta. Planifico, organizo y le doy ritmo a la comunicación, sin perder de vista las tendencias. Uso las métricas para entender qué funciona y seguir mejorando. Mi objetivo es que las marcas no solo se vean, sino que conecten de verdad con su comunidad.", photo: null },
  { name: "Valeria Prada", role: "Diseñadora Gráfica", origin: 'COL', bio: "Soy Valeria, directora creativa y diseñadora gráfica. Trabajo constantemente con ideas: las transformo, las cuestiono y las reconstruyo hasta encontrar una forma de expresarlas visual y emocionalmente. Creo porque es parte de lo que soy, no solo de lo que hago. Paso mis días diseñando, explorando referencias y convirtiendo pensamientos en algo tangible. Me atrae lo crudo, lo imperfecto y todo aquello que tiene una intención detrás.", photo: null },
];
