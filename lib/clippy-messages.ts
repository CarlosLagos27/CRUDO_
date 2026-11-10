/**
 * Mensajes de Clippy. Se agrupan por situación (clave de SAY); los de cada producto y pieza tienen su propio grupo.
 * Los textos son editables: voseo, con tildes y sin foco en género.
 */

export const SAY: Record<string, string[]> = {
  // llegada a cada tipo de sección
  wave: ['¡Hola! Soy Clippy.', '¡Te damos la bienvenida a Crudo_!', 'Tus ideas, en su estado más crudo.', '¿Tenés una idea en crudo?', 'Dale, bajá un poquito.'],
  read: ['Dos países, una agencia.', 'Así nació Crudo_.', 'Esta parte me la sé de memoria.', 'Seguí leyendo, que se pone bueno.'],
  hop: ['Todo empieza en crudo.', '¡Me encanta esta parte!', 'Esto recién empieza.', '¡Qué buena onda este lugar!'],
  team: ['¡Qué equipo!', 'Deslizá para conocer al equipo.', 'ARG // COL: una mezcla perfecta.', 'Tres cabezas piensan mejor que una.'],
  point: ['¡Hablemos!', 'Tocá ese botón, no muerde.', 'Contanos tu idea.', '¿Armamos algo entre todos?'],
  bye: ['¡Nos vemos!', 'Gracias por pasar.', 'Volvé cuando quieras.', 'Escribinos, estamos acá.'],
  tour: ['Seguime, te muestro lo importante.'],

  // revelar la foto
  cheer: ['¡Qué lindo quedó!', '¡Eso es revelar!', 'De RAW a obra de arte.'],
  uncheer: ['De vuelta en crudo.', '¿Otra vez? ¡Dale!'],

  // interacción directa
  poke: ['¡Ey!', '¡Cosquillas!', '¡Auch!', 'Eso hace cosquillas.'],
  dizzy: ['Uy, me mareo...', 'El mundo da vueltas.', 'Basta, basta.'],
  angry: ['Ey, con calma.', 'Pará un poquito.', 'Mmm... ya, ya.', 'Con suavidad, che.'],
  calm: ['Bueno, ya pasó.', 'Estoy bien, estoy bien.'],
  wake: ['¡Ah! ¿Qué pasó?', 'No estaba dormida.', '¿Eh? Ya voy.'],
  near: ['¿Me ves?', '¡Hola, hola!', 'Acá estoy.'],
  yawn: ['Aaaah... tengo sueño.', 'Uf, qué sueño.'],
  stretch: ['¡Qué siesta!', 'Ahora sí, a estirarse.'],
  pet: ['Mmm... qué rico.', 'Me encantan los mimos.', 'Ronroneo, ronroneo.'],
  tickle: ['¡Jaja, cosquillas!', '¡Pará, pará! Jaja.', '¡No, ahí no!'],
  scare: ['¡Ay, qué susto!', '¡Casi me pisás!', '¡Uy!'],
  drag: ['¡Eeey! ¿A dónde vamos?', '¡Wiii!', '¿Me llevás de paseo?'],
  throw: ['¡Wiiiii!', '¡Voy volandooo!', '¡Más fuerte!'],
  land: ['¡Auch! Estoy bien.', 'Aterrizaje perfecto.', 'Uf, qué viaje.'],
  home: ['Bueno, vuelvo a mi lugar.', 'Vuelvo a mi rincón.'],
  curious: ['¿Eh? ¿Qué estás mirando?', '¿Puedo ver?', '¿Qué hacés por acá?'],
  fast: ['¡Más despacio, que me mareo!', 'Uy, qué velocidad.', '¡Frená, frená!'],
  bottom: ['Llegamos al final.', 'Me siento un ratito.'],

  // saludos
  hello: ['¡Hola! Soy Clippy.'],
  greet_morning: ['¡Buen día! Qué lindo arrancar con una idea.', '¡Buen día! ¿Café y proyectos?'],
  greet_afternoon: ['¡Buenas tardes! ¿Cómo viene la jornada?', '¡Buenas tardes! Es buen momento para una idea.'],
  greet_night: ['¡Buenas noches! A esta hora salen las mejores ideas.', '¡Buenas noches! ¿No es tarde para estar acá?'],
  return: ['¡Volviste! Me alegra verte.', 'Otra vez por acá, ¡qué bueno!', '¡Qué bueno verte de nuevo!'],
  return_long: ['¡Cuánto tiempo! Te extrañé.', '¡Volviste! Hacía rato que no te veía.'],

  // secretos y ajustes
  secret_name: ['¿Me llamaste? ¡Acá estoy!', '¡Ese es mi nombre!'],
  secret_konami: ['¡Modo fiesta activado!', '¡Esto sí es una fiesta!'],
  hide: ['Bueno, me escondo. Si me necesitás, tocá el botón.'],
  show: ['¡Volví!', '¡Acá estoy de nuevo!'],
  sound_on: ['¡Sonido activado!'],
  quiet_off: ['¡Vuelvo a charlar!'],

  // Mail Club y proyectos (eventos de la página)
  mailopen: ['¡Abriste el sobre!', '¿Qué trae este mes?', 'Me encantan las sorpresas.', 'Mirá todo lo que sale.'],
  mailclose: ['Sobre cerrado, misterio guardado.', 'Ya lo guardo.'],
  mailpiece: ['Esa pieza es de mis favoritas.', 'Qué detalle tan lindo.', 'Los detalles importan.'],
  expand: ['¡Mirá cuánto hay para ver!', 'Acá viene lo bueno.', 'Desplegando el proyecto completo.'],
  collapse: ['Listo, lo guardo.', 'Recogido. ¿Cuál sigue?'],
  expandAll: ['¡Todo a la vista!', 'Uf, cuánto material.'],
  collapseAll: ['A ordenar todo.', 'Todo guardadito.'],
  filter: ['Buen filtro.', '¡A ver qué sale!', 'Ordenando los proyectos...'],
  filterAll: ['Todos de vuelta.', 'Acá están todos.'],
  zoom: ['¡Qué lindo se ve en grande!', 'Esa pieza quedó espectacular.', 'Los detalles importan.'],
};

/** Prioridad por grupo: 0 ambiente, 1 contexto, 2 respuesta a una acción, 3 importante (recorrido, secretos). */
export const PRIO: Record<string, number> = {
  near: 0, curious: 0, bottom: 0,
  poke: 2, dizzy: 2, angry: 2, calm: 1, tickle: 2, scare: 2, drag: 2, throw: 2, land: 1, home: 1, pet: 2, fast: 1,
  yawn: 1, stretch: 1, wake: 1,
  tour: 3, hide: 3, show: 3, sound_on: 3, quiet_off: 3, secret_name: 3, secret_konami: 3,
  mailopen: 2, mailclose: 1, mailpiece: 1,
  expand: 2, collapse: 1, expandAll: 2, collapseAll: 1, filter: 2, filterAll: 1, zoom: 1,
  cheer: 2, uncheer: 1,
};

/** Poses que se van alternando entre un proyecto y el siguiente. */
export const PJ_POSES = ['hop', 'wave', 'team', 'read'] as const;

/** Mensajes sobre cada producto, para cuando esa sección está a la vista (clave: id del proyecto). */
export const SAY_PJ: Record<string, string[]> = {
  piccolino: ['¡Qué salchicha más simpática!', 'Piccolino ladra con estilo.', 'Ese perrito corre por toda la marca.', '¿Viste el cartel de la calle?'],
  'mart-bakery': ['Mart Bakery: se me hizo agua la boca.', 'Esos stickers de tortas son un amor.', 'Quiero uno de esos croissants.', 'Hasta el delantal quedó lindo.'],
  miga: ['Miga tiene pan y mucho cariño.', 'La niña con pañuelo es toda una personalidad.', 'El letrero colgante quedó precioso.', 'Panadería colombiana, ¡qué rico!'],
  'nube-skin': ['Nube Skin: tan suave como una nube.', 'Ese logo parece de perla.', 'Letras infladas en 3D, ¡qué lujo!', 'Cuidar la piel también es diseño.'],
  archetype: ['Archetype: mucho concreto y rojo señal.', 'Berlín nos queda perfecta.', 'Esa A gigante es tremenda.', 'El video está en loop, ¡miralo!'],
  malcriada: ['Esa torta de zanahoria me llama.', 'Luz de ventana y café con leche.', 'Malcriada sale muy bien en foto.', '¿Quién se anima a una porción?'],
  'da-vinci': ['¡Un diente con el Hombre de Vitruvio!', 'Precisión y arte en un solo logo.', 'Da Vinci cuida las sonrisas.', 'Azul marino, muy elegante.'],
  anma: ['ANMA: el verde lima se nota.', 'Minúsculas y mucho estilo.', 'Principal, secundario y marcas de agua.', 'Ese azul pizarra calma.'],
};

/** Mensajes del Mail Club: por edición (clave "mc-<edición>") y por pieza (clave "<edición>:<pieza>"). */
export const SAY_MC: Record<string, string[]> = {
  'mc-septiembre': ['Septiembre: todo es rojo.', 'Pasión, amor y fuerza en un sobre.', 'La primera edición, ¡qué emoción!', 'Ese lacre con amapola es precioso.'],
  'mc-octubre': ['Octubre se pone misterioso.', '¿Podrás descifrar la carta?', 'Cuervos, castillos y murciélagos.', 'Leelo con luz tenue.'],
  'septiembre:libreta': ['Rosas en relieve, ¡qué elegancia!', 'Una libreta bordó para anotar de todo.'],
  'septiembre:sudoku': ['The Sudoku: nivel 1, a pensar un rato.', 'Lápiz en mano, que arranca el nivel 1.'],
  'septiembre:carta': ['La carta explica el tema del mes.', 'Rojo: pasión, amor y fuerza.'],
  'septiembre:receta': ['Un budín de limón: ¿quién lo prueba?', 'Receta con foto y paso a paso.'],
  'septiembre:separador': ['Anotá libro, personaje y frase favorita.', 'Un separador que además se completa.'],
  'septiembre:lacre': ['Una amapola en lacre. ¡Divina!', 'Ese sello late como un corazón.'],
  'septiembre:lirio': ['Un lirio para decorar donde quieras.', 'Hasta las flores se pegan.'],
  'septiembre:corazon': ['Corazón de encaje: puro cariño.', 'Con mensaje en el centro.'],
  'octubre:poster': ['Un cuento de vampiros, ¡qué escalofrío!', 'El hijo del vampiro, para leer en voz baja.'],
  'octubre:carta': ['Descifrala con la clave de abajo.', 'Cada símbolo es una letra.'],
  'octubre:direccion': ['Con estampilla y todo.', 'Un sobre listo para enviar misterios.'],
  'octubre:papel-rojo': ['Rojo sangre, ideal para dibujar.', 'Un papel con mucha textura.'],
  'octubre:separador': ['Un vitral con luna, ¡qué elegante!', 'Por detrás, tu ficha de lectura.'],
  'octubre:calabaza': ['Esa calabaza no sonríe.', 'Trazo a mano y borde blanco.'],
  'octubre:murcielago': ['¡Cuidado, que vuela!', 'Alas abiertas, listo para pegar.'],
  'octubre:castillo': ['¿Quién vivirá ahí?', 'Torres góticas en sticker.'],
  'octubre:cuervo': ['Dicen que trae mensajes.', 'El mensajero de la noche.'],
};

/** Paradas del recorrido guiado: se usan las que existan en la página. */
export const TOUR: { sel: string; say: string; where?: 'below' | 'on' }[] = [
  { sel: '.site-header .nav a[href*="proyectos"]', say: 'Acá están nuestros proyectos: marcas, fotos y mucho más.', where: 'below' },
  { sel: '.rev__clip', say: 'Tocá este clip y revelá la foto. ¡Mirá cómo mejoran las métricas!' },
  { sel: '.team__ctl, .team__tabs', say: 'Y acá, el equipo. Deslizá para conocer a cada una.' },
  { sel: '.tiles .tile--yellow, .band-red .btn, .band-red a', say: '¿Tenés una idea en crudo? Contanos, lo armamos juntos.' },
];

/** Secretos que se pueden descubrir. La pista no dice cómo, solo da una idea. */
export const SECRETS = [
  { id: 'nombre', label: 'Llamarla por su nombre' },
  { id: 'konami', label: 'Un código clásico de los videojuegos' },
  { id: 'mimos', label: 'Darle mimos' },
  { id: 'lanzada', label: 'Lanzarla por los aires' },
  { id: 'recorrido', label: 'Hacer el recorrido completo' },
] as const;
export type SecretId = (typeof SECRETS)[number]['id'];
