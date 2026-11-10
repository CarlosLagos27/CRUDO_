// Prueba a Clippy: cola de mensajes, memoria, movimiento, juego con el cursor, recorrido, ajustes y secretos.
// Uso: node scripts/test-clippy.mjs   (tarda unos 3 minutos: hay siesta y recorrido completo)
import { chromium } from 'playwright-core';

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
let fails = 0;
const ok = (n, c, x = '') => { if (!c) fails++; console.log(`${c ? 'OK  ' : 'FAIL'} ${n}${x ? ' — ' + x : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errs = [];

/** Contexto nuevo con la memoria de Clippy ya preparada (por defecto: persona recurrente, sin recorrido pendiente). */
async function fresh(state = { visits: 5, last: Date.now() - 1000, tourDone: true }, opts = {}) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  if (state) await ctx.addInitScript((s) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('crudo-clippy', JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); } }, state);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  return { ctx, p };
}
const open = async (p, url = '/nosotras/', wait = 3200) => { await p.goto('http://localhost:3000' + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(wait); };
const attr = (p, a) => p.evaluate((a) => document.querySelector('.mascot').dataset[a], a);
const cssvar = (p, v) => p.evaluate((v) => parseFloat(getComputedStyle(document.querySelector('.mascot__pos')).getPropertyValue(v)) || 0, v);
const stored = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('crudo-clippy') || '{}'));
const bodyBox = (p) => p.locator('.mascot__b').boundingBox();
const say = (p) => p.evaluate(() => { const s = document.querySelector('.mascot__say'); return { on: s.dataset.on === '1', text: s.textContent }; });

/* ───────── A) la cola: varios mensajes seguidos no se pisan ───────── */
{
  const { ctx, p } = await fresh();
  await open(p, '/nosotras/', 8500); // deja pasar el saludo de entrada
  await p.mouse.move(300, 300); // hay actividad: no bosteza ni se duerme durante la ráfaga
  const keepAlive = setInterval(() => p.mouse.move(300 + Math.random() * 40, 300).catch(() => {}), 2500);
  await p.evaluate(() => {
    window.__log = [];
    window.__t0 = performance.now();
    setInterval(() => { const s = document.querySelector('.mascot__say'); window.__log.push({ t: performance.now() - window.__t0, on: s.dataset.on === '1', text: s.textContent }); }, 100);
    // ráfaga: ocho mensajes de la página casi a la vez
    ['poke', 'expand', 'filter', 'cheer', 'mailopen', 'zoom', 'mailpiece', 'collapse'].forEach((g, i) => setTimeout(() => window.dispatchEvent(new CustomEvent('clippy:say', { detail: { group: g } })), i * 120));
  });
  await sleep(17000);
  clearInterval(keepAlive);
  const log = await p.evaluate(() => window.__log);
  // segmentos de texto visible
  const segs = [];
  for (const s of log) {
    const last = segs[segs.length - 1];
    if (s.on && last && last.end === undefined && last.text === s.text) continue;
    if (last && last.end === undefined && !(s.on && last.text === s.text)) last.end = s.t;
    if (s.on) segs.push({ text: s.text, start: s.t });
  }
  const closed = segs.filter((s) => s.end !== undefined);
  const durations = closed.map((s) => Math.round(s.end - s.start));
  ok('se muestran varios mensajes, no uno solo ni todos', segs.length >= 2 && segs.length <= 4, `${segs.length} mensajes: ${segs.map((s) => '"' + s.text.slice(0, 18) + '"').join(', ')}`);
  ok('cada mensaje queda a la vista el tiempo de lectura (≥ 2,8 s)', closed.length > 0 && durations.every((d) => d >= 2800), durations.join(' ms, ') + ' ms');
  // nunca cambia el texto sin pasar por oculto
  let swapsWithoutGap = 0;
  for (let i = 1; i < log.length; i++) if (log[i].on && log[i - 1].on && log[i].text !== log[i - 1].text) swapsWithoutGap++;
  ok('el texto nunca cambia de golpe (siempre se oculta antes)', swapsWithoutGap === 0, `${swapsWithoutGap} cambios bruscos`);
  const gaps = [];
  for (let i = 1; i < segs.length; i++) if (segs[i - 1].end !== undefined) gaps.push(Math.round(segs[i].start - segs[i - 1].end));
  ok('entre dos mensajes hay una pausa', gaps.every((g) => g >= 150), gaps.join(' ms, ') + ' ms');
  await ctx.close();
}

/* ───────── B) memoria de visitas ───────── */
{
  const { ctx, p } = await fresh(null);
  await open(p, '/nosotras/', 4200);
  const s = await say(p);
  ok('primera visita: se presenta', s.on && s.text.includes('Soy Clippy'), s.text);
  const st = await stored(p);
  ok('guarda la visita en la memoria del navegador', st.visits === 1 && st.last > 0);
  await ctx.close();
}
{
  const { ctx, p } = await fresh({ visits: 4, last: Date.now() - 5 * 86400000, tourDone: true });
  await open(p, '/nosotras/', 4200);
  const s = await say(p);
  ok('vuelve tras varios días: lo nota', s.on && /Cuánto tiempo|hacía rato|Hacía rato/i.test(s.text), s.text);
  await ctx.close();
}
{
  const { ctx, p } = await fresh({ visits: 4, last: Date.now() - 1000, tourDone: true, lastSlug: 'miga' });
  await open(p, '/proyectos/', 4500);
  const s = await say(p);
  ok('en Proyectos recuerda el último caso que miraste', s.on && s.text.includes('Miga'), s.text);
  await ctx.close();
}

/* ───────── C) cuerpo, caras, clic ───────── */
{
  const { ctx, p } = await fresh();
  await open(p, '/nosotras/', 3000);
  ok('tiene el cuerpo articulado (estirar y aplastar)', (await p.locator('.mascot__s').count()) === 1 && (await p.evaluate(() => getComputedStyle(document.querySelector('.mascot__s')).animationName)).includes('mc-breathe'));
  ok('tiene boca y las 6 formas de boca', (await p.locator('.mascot .m').count()) === 6);
  const c = await bodyBox(p);
  await p.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
  await p.mouse.down(); await p.mouse.up();
  await p.waitForTimeout(350);
  ok('un clic suelto la sorprende (cara de sorpresa)', (await attr(p, 'face')) === 'wow');
  await p.waitForTimeout(2500);
  ok('la cara vuelve a la normal', (await attr(p, 'face')) === 'idle');
  await ctx.close();
}

/* ───────── D) arrastrar y lanzar ───────── */
{
  const { ctx, p } = await fresh();
  await open(p, '/nosotras/', 3000);
  const c = await bodyBox(p);
  const cx = c.x + c.width / 2;
  const cy = c.y + c.height / 2;
  await p.mouse.move(cx, cy);
  await p.mouse.down();
  await p.mouse.move(cx - 80, cy - 120, { steps: 4 });
  ok('al arrastrarla queda agarrada', (await attr(p, 'drag')) === '1');
  const during = { x: await cssvar(p, '--tx'), y: await cssvar(p, '--ty') };
  ok('sigue al puntero (se desplazó de su borde)', Math.abs(during.x) > 40 && Math.abs(during.y) > 40, `${Math.round(during.x)}px, ${Math.round(during.y)}px`);
  await p.mouse.move(cx - 520, cy - 380, { steps: 3 }); // movimiento rápido: sale lanzada
  await p.mouse.up();
  await p.waitForTimeout(1500);
  ok('al soltarla sigue por el aire y rebota (queda lejos de su borde)', Math.abs(await cssvar(p, '--tx')) > 100);
  await p.waitForTimeout(9500);
  const home = { x: await cssvar(p, '--tx'), y: await cssvar(p, '--ty') };
  ok('después vuelve sola a su lugar', Math.abs(home.x) < 3 && Math.abs(home.y) < 3, `${home.x.toFixed(1)}px, ${home.y.toFixed(1)}px`);
  const st = await stored(p);
  ok('lanzarla desbloquea un secreto', st.found?.includes('lanzada'), JSON.stringify(st.found));
  await ctx.close();
}

/* ───────── E) mimos, cosquillas y susto ───────── */
{
  const { ctx, p } = await fresh();
  await open(p, '/nosotras/', 3000);
  const c = await bodyBox(p);
  const cx = c.x + c.width / 2;
  const cy = c.y + c.height / 2;
  await p.mouse.move(cx - 60, cy, { steps: 3 });
  // mimos: el puntero casi quieto sobre ella
  await p.mouse.move(cx, cy);
  for (let i = 0; i < 20; i++) { await p.mouse.move(cx + (i % 2), cy + 1); await p.waitForTimeout(100); }
  await p.waitForTimeout(300);
  ok('con el puntero quieto sobre ella recibe mimos (cara de enamorada)', (await attr(p, 'face')) === 'love', await attr(p, 'face'));
  ok('salen corazones', (await attr(p, 'emo')) === 'love');
  ok('cuenta los mimos', (await stored(p)).pets === 1);
  await p.waitForTimeout(3300);
  // cosquillas: de un lado a otro
  for (let i = 0; i < 16; i++) { await p.mouse.move(cx + (i % 2 ? 7 : -7), cy + 4); await p.waitForTimeout(45); }
  await p.waitForTimeout(250);
  ok('moviendo el puntero de lado a lado tiene cosquillas (se ríe)', (await attr(p, 'giggle')) === '1' && (await attr(p, 'face')) === 'happy');
  await p.waitForTimeout(2200);
  // susto: el cursor se le viene encima muy rápido
  let scared = false;
  for (let t = 0; t < 5 && !scared; t++) {
    await p.mouse.move(cx - 420, cy - 40);
    await p.waitForTimeout(150);
    await p.mouse.move(cx - 120, cy - 20, { steps: 2 });
    await p.waitForTimeout(250);
    scared = (await attr(p, 'scare')) === '1' || (await attr(p, 'face')) === 'wow';
    if (!scared) await p.waitForTimeout(500);
  }
  ok('si el cursor se le viene encima rápido, se asusta', scared);
  await ctx.close();
}

/* ───────── F) scroll rápido ───────── */
{
  const { ctx, p } = await fresh();
  await open(p, '/nosotras/', 3000);
  await p.evaluate(async () => { for (let i = 0; i < 14; i++) { window.scrollBy(0, 700); await new Promise((r) => setTimeout(r, 22)); } });
  await p.waitForTimeout(300);
  ok('con un scroll muy rápido se marea', (await attr(p, 'dizzy')) === '1');
  await ctx.close();
}

/* ───────── G) bostezo y siesta ───────── */
{
  const { ctx, p } = await fresh();
  await open(p, '/nosotras/', 1500);
  await p.waitForTimeout(8500);
  let yawn = false;
  for (let i = 0; i < 14 && !yawn; i++) { yawn = (await attr(p, 'face')) === 'yawn'; if (!yawn) await p.waitForTimeout(250); }
  ok('sin actividad, bosteza', yawn);
  await p.waitForTimeout(5500);
  ok('y después se duerme (acostada de lado)', (await attr(p, 'sleep')) === '1');
  await p.screenshot({ path: '.playwright/clippy-sleep.png' });
  await p.mouse.move(400, 400);
  await p.waitForTimeout(500);
  ok('con un movimiento se despierta y se estira', (await attr(p, 'sleep')) === '0' && (await attr(p, 'face')) === 'sleepy');
  await ctx.close();
}

/* ───────── H) señalar el "Hablemos" ───────── */
{
  const { ctx, p } = await fresh();
  await open(p, '/nosotras/', 2500);
  await p.evaluate(() => document.querySelector('.tiles').scrollIntoView({ block: 'center', behavior: 'instant' }));
  await p.waitForTimeout(5200);
  const x = await cssvar(p, '--tx');
  const y = await cssvar(p, '--ty');
  ok('al llegar al "Hablemos" salta hasta ahí y lo señala', Math.abs(x) > 80 || Math.abs(y) > 80, `${Math.round(x)}px, ${Math.round(y)}px`);
  await p.screenshot({ path: '.playwright/clippy-cta.png' });
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await p.waitForTimeout(6500);
  ok('al irse de la sección vuelve a su borde', Math.abs(await cssvar(p, '--tx')) < 3 && Math.abs(await cssvar(p, '--ty')) < 3);
  await ctx.close();
}

/* ───────── I) ajustes: ocultar, callar, sonido ───────── */
{
  const { ctx, p } = await fresh();
  await open(p, '/nosotras/', 3000);
  ok('el botón de ajustes está siempre', (await p.locator('.cl-ctl__btn').count()) === 1);
  await p.locator('.cl-ctl__btn').click();
  ok('el panel se abre con sus opciones', (await p.locator('.cl-ctl__panel .cl-sw').count()) === 3 && (await p.locator('.cl-ctl__go').count()) === 1);
  // callar: no más globos
  const sw = (name) => p.locator('.cl-sw', { hasText: name }); // se hace clic en la pastilla, como una persona
  await sw('Globos de texto').click();
  await p.evaluate(() => window.dispatchEvent(new CustomEvent('clippy:say', { detail: { group: 'expand' } })));
  await p.waitForTimeout(3000);
  ok('con "Globos de texto" apagado no habla', !(await say(p)).on);
  await sw('Globos de texto').click();
  // sonido
  await sw('Sonido').click();
  ok('activar el sonido se guarda', (await stored(p)).sound === true);
  // ocultar
  await sw('Mostrar a Clippy').click();
  await p.waitForTimeout(900);
  ok('ocultarla la esconde (y el botón sigue)', (await attr(p, 'hidden')) === '1' && (await p.locator('.cl-ctl__btn').isVisible()));
  const box = await bodyBox(p);
  ok('escondida queda fuera de la pantalla', box.y > 880, `y=${Math.round(box.y)}`);
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  ok('la preferencia se recuerda al recargar', (await attr(p, 'hidden')) === '1');
  await p.locator('.cl-ctl__btn').click();
  await p.locator('.cl-sw', { hasText: 'Mostrar a Clippy' }).click();
  await p.waitForTimeout(2500);
  ok('volver a mostrarla la trae de vuelta', (await attr(p, 'hidden')) === '0' && (await bodyBox(p)).y < 880);
  await p.keyboard.press('Escape');
  ok('Esc cierra el panel', (await p.locator('.cl-ctl__panel').count()) === 0);
  await ctx.close();
}

/* ───────── J) secretos ───────── */
{
  const { ctx, p } = await fresh();
  await open(p, '/nosotras/', 3000);
  await p.keyboard.type('clippy', { delay: 70 });
  await p.waitForTimeout(1300);
  ok('escribir "clippy" la hace girar', (await attr(p, 'spin')) === '1' || (await stored(p)).found?.includes('nombre'));
  ok('y desbloquea el secreto del nombre', (await stored(p)).found?.includes('nombre'));
  await p.waitForTimeout(2500);
  for (const k of ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']) await p.keyboard.press(k);
  await p.waitForTimeout(1400);
  ok('el código Konami activa el modo fiesta', (await attr(p, 'disco')) === '1');
  ok('y desbloquea ese secreto', (await stored(p)).found?.includes('konami'));
  await p.locator('.cl-ctl__btn').click();
  ok('el panel cuenta los secretos', (await p.locator('.cl-ctl__t--s').textContent()).includes('2/5'));
  await p.screenshot({ path: '.playwright/clippy-panel.png' });
  await ctx.close();
}

/* ───────── K) recorrido guiado completo ───────── */
{
  const { ctx, p } = await fresh({ visits: 5, last: Date.now() - 1000, tourDone: false });
  await open(p, '/nosotras/', 2500);
  await p.locator('.cl-ctl__btn').click();
  await p.locator('.cl-ctl__go').click();
  await p.waitForTimeout(4500);
  const seen = new Set();
  let moved = false;
  const t0 = Date.now();
  while (Date.now() - t0 < 70000) {
    const s = await say(p);
    if (s.on && s.text) seen.add(s.text);
    if (Math.abs(await cssvar(p, '--tx')) > 60 || Math.abs(await cssvar(p, '--ty')) > 60) moved = true;
    if ((await stored(p)).tourDone) break;
    await p.waitForTimeout(400);
  }
  ok('el recorrido la lleva por la página (se desplaza)', moved);
  ok('comenta cada parada', seen.size >= 3, [...seen].map((t) => t.slice(0, 26)).join(' | '));
  const st = await stored(p);
  ok('termina y queda registrado', st.tourDone === true);
  ok('desbloquea el secreto del recorrido', st.found?.includes('recorrido'));
  // en el último paso queda junto al "Hablemos" (ahí la sección la hace señalarlo); al irse de esa sección vuelve a su borde
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await p.waitForTimeout(7000);
  ok('al terminar y salir de esa sección vuelve a su borde', Math.abs(await cssvar(p, '--tx')) < 3 && Math.abs(await cssvar(p, '--ty')) < 3);
  await ctx.close();
}

/* ───────── L) móvil ───────── */
{
  const { ctx, p } = await fresh(undefined, { viewport: { width: 390, height: 844 }, hasTouch: true });
  await open(p, '/nosotras/', 3000);
  ok('móvil: el botón de ajustes se ve', await p.locator('.cl-ctl__btn').isVisible());
  await p.locator('.cl-ctl__btn').tap();
  const r = await p.locator('.cl-ctl__panel').boundingBox();
  ok('móvil: el panel cabe en la pantalla', r.x >= 0 && r.x + r.width <= 390, `${Math.round(r.x)}→${Math.round(r.x + r.width)}`);
  ok('móvil: sin desborde horizontal', (await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
  await ctx.close();
}

ok('sin errores de JavaScript', errs.length === 0, errs.slice(0, 2).join(' | '));
console.log(fails ? `\n${fails} fallo(s)` : '\nTodo bien');
await b.close();
process.exit(fails ? 1 : 0);
