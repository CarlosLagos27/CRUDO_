// Prueba la tienda: Mail Club con sus dos ediciones. Uso: node scripts/test-tienda.mjs
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
let fails = 0;
const ok = (n, c, x = '') => { if (!c) fails++; console.log(`${c ? 'OK  ' : 'FAIL'} ${n}${x ? ' — ' + x : ''}`); };
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
const bad = []; p.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('favicon')) bad.push(r.status() + ' ' + r.url()); });
await p.goto('http://localhost:3000/tienda/', { waitUntil: 'networkidle' });
const H = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += 500) { await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(120); }

ok('2 ediciones', (await p.locator('.mc-card').count()) === 2);
ok('imágenes cargan', (await p.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length)) === 0);
ok('sin 4xx/5xx', bad.length === 0, bad.slice(0, 2).join(' '));

for (const id of ['septiembre', 'octubre']) {
  const card = `.mc-card--${id}`;
  await p.evaluate((c) => document.querySelector(c).scrollIntoView({ block: 'center', behavior: 'instant' }), card);
  await p.waitForTimeout(1200);
  ok(`${id}: arranca cerrado`, (await p.locator(`${card} .mc-stage`).getAttribute('data-open')) === '0');
  const op0 = await p.evaluate((c) => Number(getComputedStyle(document.querySelector(c + ' .mc-piece')).opacity), card);
  ok(`${id}: piezas ocultas con el sobre cerrado`, op0 === 0);
  const hid = await p.locator(`${card} .mc-piece`).first().getAttribute('tabindex');
  ok(`${id}: piezas fuera del tab cerrado`, hid === '-1');

  // abrir con clic en el sobre
  await p.locator(`${card} .mc-env`).click();
  await p.waitForTimeout(2600);
  ok(`${id}: se abre`, (await p.locator(`${card} .mc-stage`).getAttribute('data-open')) === '1');
  const geo = await p.evaluate((c) => {
    const st = document.querySelector(c + ' .mc-stage').getBoundingClientRect();
    const ps = [...document.querySelectorAll(c + ' .mc-piece')].map((e) => { const r = e.getBoundingClientRect(); return { op: Number(getComputedStyle(e).opacity), inside: r.left >= st.left - 4 && r.right <= st.right + 4 && r.top >= st.top - 4 && r.bottom <= st.bottom + 4 }; });
    return { n: ps.length, visible: ps.filter((x) => x.op > 0.9).length, inside: ps.filter((x) => x.inside).length };
  }, card);
  ok(`${id}: todas las piezas salen y quedan dentro del escenario`, geo.visible === geo.n && geo.inside === geo.n, `${geo.visible}/${geo.n} visibles, ${geo.inside}/${geo.n} dentro`);
  const closedOp = await p.evaluate((c) => Number(getComputedStyle(document.querySelector(c + ' .mc-layer--closed')).opacity), card);
  ok(`${id}: el sobre cerrado se desvanece`, closedOp === 0);

  // resaltar desde la lista y desde la pieza
  await p.locator(`${card} .mc-item`).nth(1).hover();
  await p.waitForTimeout(500);
  ok(`${id}: la lista resalta una pieza`, (await p.locator(`${card} .mc-piece.is-hot`).count()) === 1);
  const tagOp = await p.evaluate((c) => Number(getComputedStyle(document.querySelector(c + ' .mc-piece.is-hot .mc-piece__tag')).opacity), card);
  ok(`${id}: aparece la etiqueta de la pieza`, tagOp > 0.9);
  await p.mouse.move(5, 5);
  await p.locator(`${card} .mc-piece`).nth(2).hover();
  await p.waitForTimeout(400);
  ok(`${id}: pasar el mouse por una pieza la resalta`, (await p.locator(`${card} .mc-piece.is-hot`).count()) === 1);

  // cerrar con el botón
  await p.mouse.move(5, 5);
  await p.locator(`${card} .mc-toggle`).click();
  await p.waitForTimeout(1400);
  ok(`${id}: se cierra`, (await p.locator(`${card} .mc-stage`).getAttribute('data-open')) === '0');
  // abrir desde la lista (clic en un ítem abre el sobre)
  await p.locator(`${card} .mc-item`).nth(0).click();
  await p.waitForTimeout(2400);
  ok(`${id}: un ítem de la lista abre el sobre y resalta`, (await p.locator(`${card} .mc-stage`).getAttribute('data-open')) === '1' && (await p.locator(`${card} .mc-piece.is-hot`).count()) === 1);
}
ok('sin scroll horizontal (escritorio)', (await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) === 0);

// móvil
const m = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
const merrs = []; m.on('pageerror', (e) => merrs.push(e.message));
await m.goto('http://localhost:3000/tienda/', { waitUntil: 'networkidle' });
const MH = await m.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < MH; y += 500) { await m.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await m.waitForTimeout(100); }
await m.evaluate(() => document.querySelector('.mc-card--septiembre').scrollIntoView({ block: 'start', behavior: 'instant' }));
await m.waitForTimeout(1200);
await m.locator('.mc-card--septiembre .mc-env').tap();
await m.waitForTimeout(2600);
ok('móvil: toque abre el sobre', (await m.locator('.mc-card--septiembre .mc-stage').getAttribute('data-open')) === '1');
ok('móvil: sin scroll horizontal', (await m.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
await m.screenshot({ path: '.playwright/mc-m-open.png' });
await m.evaluate(() => window.scrollBy(0, 700));
await m.waitForTimeout(500);
await m.screenshot({ path: '.playwright/mc-m-list.png' });
ok('sin errores de JavaScript', errs.length + merrs.length === 0, [...errs, ...merrs].slice(0, 2).join(' | '));
console.log(fails ? `\n${fails} fallo(s)` : '\nTodo bien');
await b.close();
process.exit(fails ? 1 : 0);
