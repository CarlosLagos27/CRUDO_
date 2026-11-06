---
name: Crudo_
description: Agencia creativa argento-colombiana. Tus ideas en su estado más crudo, reveladas.
colors:
  terracotta-red: "#a33b21"
  darkroom-brown: "#57433c"
  safelight-cream: "#faf8d6"
  proof-blue: "#b1d1e1"
  ink-black: "#111111"
  ink-soft: "#333333"
  ink-muted: "#444444"
  graphite: "#555555"
  hairline-grey: "#dddddd"
  paper-grey: "#f3f3f1"
  paper-white: "#ffffff"
  developer-salmon: "#f2b9a6"
typography:
  display:
    fontFamily: "Archivo, Satoshi, sans-serif"
    fontSize: "clamp(64px, 14vw, 200px)"
    fontWeight: 900
    lineHeight: 0.84
    letterSpacing: "-0.05em"
  headline:
    fontFamily: "Archivo, Satoshi, sans-serif"
    fontSize: "clamp(56px, 7.2vw, 104px)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.05em"
  title:
    fontFamily: "Archivo, Satoshi, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  body-lg:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  manifesto:
    fontFamily: "Instrument Serif, serif"
    fontSize: "clamp(32px, 4vw, 60px)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.04em"
rounded:
  xs: "3px"
  sm: "4px"
  md: "6px"
  lg: "12px"
  xl: "20px"
  2xl: "28px"
  chapter: "40px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
  4xl: "96px"
  5xl: "120px"
components:
  button-ink:
    backgroundColor: "{colors.ink-black}"
    textColor: "{colors.paper-white}"
    typography: "{typography.title}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 22px"
  button-ink-hover:
    backgroundColor: "{colors.terracotta-red}"
    textColor: "{colors.paper-white}"
  button-red:
    backgroundColor: "{colors.terracotta-red}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 22px"
  button-red-hover:
    backgroundColor: "{colors.ink-black}"
    textColor: "{colors.paper-white}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 22px"
  button-line-hover:
    backgroundColor: "{colors.ink-black}"
    textColor: "{colors.paper-white}"
  button-light:
    backgroundColor: "transparent"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 22px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  chip-selected:
    backgroundColor: "{colors.ink-black}"
    textColor: "{colors.paper-white}"
  tile-ink:
    backgroundColor: "{colors.ink-black}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.xl}"
    padding: "32px"
  tile-yellow:
    backgroundColor: "{colors.safelight-cream}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.xl}"
    padding: "32px"
  tile-blue:
    backgroundColor: "{colors.proof-blue}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.xl}"
    padding: "32px"
  pack:
    backgroundColor: "transparent"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.lg}"
    padding: "24px"
  pack-red:
    backgroundColor: "{colors.terracotta-red}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.lg}"
    padding: "24px"
  float-card:
    backgroundColor: "{colors.terracotta-red}"
    textColor: "{colors.paper-white}"
    width: "300px"
    padding: "22px"
  chapter-brown:
    backgroundColor: "{colors.darkroom-brown}"
    textColor: "{colors.safelight-cream}"
    rounded: "{rounded.chapter}"
  chapter-red:
    backgroundColor: "{colors.terracotta-red}"
    textColor: "{colors.safelight-cream}"
    rounded: "{rounded.chapter}"
  chapter-blue:
    backgroundColor: "{colors.proof-blue}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.chapter}"
  chapter-yellow:
    backgroundColor: "{colors.safelight-cream}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.chapter}"
  field-underline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-black}"
    rounded: "0"
    padding: "8px 0"
---

# Design System: Crudo_

## Overview

**Creative North Star: "El Cuarto Oscuro"**

Crudo_ trata sus ideas como un archivo RAW: planas, grises y sin tocar hasta que alguien las revela. Todo el sistema visual sigue esa lógica de laboratorio fotográfico. Los titulares son enormes y compactos, como una copia de contacto; los capítulos de color a sangre se suben uno sobre otro como hojas que salen del baño; y la interacción central, el clip que prende la foto, es literalmente un gesto de revelado. La marca habla en dos idiomas a la vez (ARG // COL) y lo muestra con una serif itálica que interrumpe la sans pesada, igual que una anotación a mano sobre una copia.

La densidad es alta en el titular y baja en todo lo demás: mucho aire, una sola idea por pantalla, fotos reales incrustadas en las palabras. El color no decora, **revela**: cada capítulo es un campo de color pleno (rojo, marrón, azul, crema) que cambia el clima de la página sin cambiar la estructura. El tono es cálido, hecho a mano y seguro de sí, nunca corporativo ni "tech".

**Key Characteristics:**
- Titulares en mayúscula, peso 900, tracking de −0.05em, interlineado casi pegado (0.84–0.92).
- Fotos reales dentro de paréntesis tipográficos, que reemplazan a los íconos y a la ilustración genérica.
- Capítulos de color a sangre con esquinas superiores de 40px que se montan como hojas.
- Acentos en serif itálica (Instrument Serif) en rojo terracota, y etiquetas en mono mayúscula entre paréntesis.
- Todo aparece de a una sección por vez: blur que se aclara, como un revelado.

## Colors

Una paleta de cuatro campos cálidos sobre blanco y tinta. Un solo rojo carga el peso de marca; el resto son climas de capítulo.

### Primary
- **Rojo Terracota** (#a33b21): el color de marca. Botones principales, el guion bajo del logotipo, números de servicio, acentos en serif itálica, selección de texto, scrollbar, foco y la tarjeta flotante. Se usa como acento sobre claro y como campo pleno en capítulos y packs destacados.

### Secondary
- **Marrón Cuarto Oscuro** (#57433c): capítulo oscuro "Revelá tu idea" y proceso. Es el fondo donde la foto RAW se enciende. Texto sobre él en crema, nunca en blanco puro.

### Tertiary
- **Crema Luz de Seguridad** (#faf8d6): campo cálido (capítulo amarillo, mailclub) y color de texto sobre marrón y rojo. Es el "blanco" de las secciones oscuras.
- **Azul Prueba** (#b1d1e1): capítulo azul y placeholders de foto. Frío y calmo, equilibra los cálidos.

### Neutral
- **Negro Tinta** (#111111): texto principal, bordes de 1px, botón "ink", footer oscuro.
- **Tinta Suave** (#333333) / **Tinta Apagada** (#444444) / **Grafito** (#555555): jerarquía de texto secundario y metadatos.
- **Gris Línea** (#dddddd): separadores finos entre filas.
- **Gris Papel** (#f3f3f1): fondo de hover en tablas y la palabra gigante "crudo" detrás del hero.
- **Blanco Papel** (#ffffff): fondo base.
- **Salmón Revelador** (#f2b9a6): versión clara del rojo, solo para acentos sobre el marrón (donde el rojo pierde contraste).

### Named Rules
**La Regla del Un Solo Rojo.** El rojo terracota es el único color de acción. Ninguna otra tonalidad cálida actúa como botón o enlace; crema, azul y marrón son siempre fondo.
**La Regla del Capítulo.** Un capítulo es un campo de color pleno a sangre, no una tarjeta con fondo. No se mezclan dos colores de capítulo dentro de la misma sección.
**La Regla del Crema.** Sobre marrón y rojo el texto es crema (#faf8d6), no blanco; el blanco puro se reserva para botones sobre rojo y para el footer.

## Typography

**Display Font:** Archivo (con Satoshi como fuente definitiva prevista; Archivo es reemplazo provisorio)
**Body Font:** Archivo (con Helvetica Neue, Helvetica, Arial)
**Serif Accent:** Instrument Serif, itálica
**Label/Mono Font:** JetBrains Mono

**Character:** Una sans geométrica pesada y compacta que grita, contra una serif itálica de acento que susurra, más una mono de etiquetas que suena a hoja de contactos. La tensión entre las tres es la voz de la marca.

### Hierarchy
- **Display** (900, clamp(64px, 14vw, 200px), 0.84, −0.05em, mayúscula): titulares de hero. Una frase corta por línea; las fotos en paréntesis viven aquí.
- **Headline** (500, clamp(56px, 7.2vw, 104px), 1, −0.05em): títulos de sección ("Qué hacemos", "Nuestros packs"). En capítulos oscuros sube a 900.
- **Title** (800, 18–32px, 1.15, −0.03em): nombres de pack, servicio, paso y producto; texto de botones.
- **Body** (400, 15px, 1.55): párrafos y metadatos. Los párrafos largos no pasan de 620px.
- **Body Large** (400, 17px, 1.6, color tinta suave): texto de apoyo en capítulos.
- **Manifesto** (Instrument Serif 400, clamp(32px, 4vw, 60px), 1.04): declaraciones de marca, en una sola frase.
- **Label** (JetBrains Mono 400, 12px, mayúscula, 0.04em): etiquetas, navegación, numeración "( 01 )". Siempre entre paréntesis cuando funciona como sección.

### Named Rules
**La Regla del Serif de Acento.** La serif itálica en rojo aparece en una o dos palabras por pantalla ("RAW", "Argento‑colombianas"), nunca en un párrafo completo.
**La Regla del Paréntesis.** Las etiquetas de sección y los estados se escriben entre paréntesis y en mono: `( 01 ) Servicios`, `( RAW )`.

## Layout

Contenedor centrado de 1440px máximo con 32px de relleno lateral (`.wrap`). El ritmo vertical usa una escala de 8px: 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 120. Las secciones respiran con 120px arriba y abajo; los capítulos de color suman 40px por el solape. Las grillas son `auto-fit` con mínimos de 220–300px, así que colapsan solas en móvil sin puntos de ruptura propios. El único quiebre explícito es 900px (la tarjeta flotante pasa de absoluta a flujo normal) y 800px en el revelado. La composición del hero de Nosotras es deliberadamente asimétrica: cada línea del titular tiene su propio sangrado izquierdo.

## Elevation & Depth

Plano por defecto. La profundidad se logra con **capas de color**: cada capítulo sube con −40px de margen y esquinas superiores de 40px, montándose sobre el anterior como una hoja. Las sombras existen solo para lo que flota o se levanta con el mouse; en reposo las superficies son planas con borde de 1px en tinta.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 24px 48px rgba(17,17,17,0.16)`): tarjeta roja flotante del hero.
- **Lift** (`box-shadow: 0 18px 36px rgba(17,17,17,0.1)`): packs al hover.
- **Card** (`box-shadow: 0 20px 40px rgba(17,17,17,0.18)`): fotos apiladas del mailclub.
- **Clip** (`filter: drop-shadow(0 10px 12px rgba(0,0,0,0.38))`): el clip del revelado, para que parezca un objeto físico sobre la foto.

### Named Rules
**La Regla de Plano en Reposo.** Una superficie no tiene sombra hasta que flota (tarjeta) o responde al mouse (pack, tile). Los capítulos nunca llevan sombra: se separan por color y por esquina.

## Shapes

Mezcla deliberada de dos lenguajes: **pastillas totales** (999px) para todo lo que se pulsa, y **esquinas moderadas** (12–28px) para superficies. Las fotos casi no se redondean (3–6px), como una copia de contacto recortada. El gesto de firma es la esquina superior de 40px de cada capítulo. Los bordes son siempre 1px en tinta; las líneas internas de tablas y servicios son 1px gris línea. Las fotos viven en "paréntesis": una imagen apaisada de 0.78em de alto entre dos paréntesis tipográficos.

## Components

### Buttons
- **Shape:** pastilla completa (999px), 44px de alto, 22px de relleno lateral.
- **Primary (ink):** fondo tinta, texto blanco, Archivo 800 15px. Hover a rojo con borde rojo, transición de 0.35s.
- **Red:** fondo rojo; hover invierte a tinta.
- **Line:** transparente con borde tinta; hover rellena de tinta.
- **Light:** transparente con borde y texto blancos (o crema sobre rojo); hover rellena de blanco/crema con texto rojo. Sobre rojo el hover se oscurece en vez de aclararse.

### Chips
- **Style:** pastilla con borde de 1px en tinta, relleno 6px × 14px, transparente.
- **State:** `aria-pressed="true"` rellena de tinta con texto blanco; el hover hace lo mismo.

### Cards / Containers
- **Tiles:** 260px de alto mínimo, 32px de relleno, esquinas de 20px, en tinta, crema o azul; suben 8px al hover. Título en serif de 56px.
- **Packs:** borde 1px tinta, esquinas de 12px, 24px de relleno, 280px de alto mínimo; suben 6px y ganan sombra Lift al hover. La variante roja es campo pleno rojo con texto blanco.
- **Mailclub:** campo crema con esquinas de 28px y 96px / 32px de relleno.

### Inputs / Fields
- **Style:** sin caja; solo borde inferior de 1px en tinta, fondo transparente, texto de 17px.
- **Focus:** el borde inferior pasa a rojo, y se queda rojo mientras haya texto.
- **Placeholder:** marrón al 55% de opacidad.

### Navigation
- **Style:** etiquetas mono mayúscula en una fila, con áreas de clic de 44px. La página actual va en rojo con un punto. Hover con fondo gris papel y pastilla. En móvil se alinea a la izquierda.

### Tarjeta flotante
Tarjeta roja de 300px con sombra Float y un clip decorativo. Se pliega a 150px con un panel que se despliega con `grid-template-rows`. Foco en crema.

### El Clip (componente de firma)
El botón de "Revelá tu idea". Es un alambre de tres piezas de borde en CSS (lazo grande, arco, lazo chico), 56 × 150px, con puntas libres redondeadas y rotación de 30°. Es un `label` sobre un checkbox oculto: el estado lo lleva `:has(:checked)`, sin JavaScript. Al activarse se levanta, gira a 6° y pasa de crema a rojo, mientras un círculo de color se abre desde su posición y las métricas de engagement (Alcance, Interacciones, Guardados, Clics al perfil) cuentan de negativo a positivo, de salmón a crema. En reposo da un tironcito periódico y un cursor animado le hace clic para invitar a pulsar.

### Capítulos de color
Sección a sangre con color pleno, `margin-top: −40px` y esquinas superiores de 40px. Entran con clip-path y desenfoque que se aclara al hacer scroll, una sección por vez.

## Do's and Don'ts

### Do:
- **Do** usar el rojo terracota (#a33b21) como único color de acción, y dejar el crema, azul y marrón como campos de fondo.
- **Do** escribir titulares en mayúscula, peso 900, con tracking −0.05em y una sola idea por línea.
- **Do** meter fotos reales dentro de paréntesis tipográficos antes que ilustraciones o íconos.
- **Do** etiquetar secciones con mono en mayúscula entre paréntesis: `( 02 ) Packs`.
- **Do** usar pastillas de 999px para todo lo pulsable y esquinas de 12–28px para superficies.
- **Do** dejar que cada capítulo de color suba como una hoja, con esquinas de 40px y solape de −40px.
- **Do** mantener un área de clic mínima de 44px en navegación y enlaces del pie.
- **Do** respetar `prefers-reduced-motion`: todo entra visible y sin transición.

### Don't:
- **Don't** poner sombra a superficies que no flotan ni se apilan: la profundidad de los capítulos y las secciones viene del color y de la esquina de 40px.
- **Don't** meter una segunda tonalidad cálida como acento junto al rojo.
- **Don't** usar texto blanco puro sobre marrón o rojo; el texto de capítulo es crema.
- **Don't** poner cajas, bordes redondeados ni fondos a los campos de formulario: solo línea inferior.
- **Don't** usar la serif itálica en párrafos largos; es un acento de una o dos palabras.
- **Don't** repetir el mismo color de capítulo en dos secciones seguidas.
- **Don't** usar iconos genéricos o ilustraciones de stock; la marca habla con fotos y tipografía.
