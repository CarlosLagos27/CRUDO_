// Prueba la página de proyectos: carga de imágenes, filtro, visor, video y desbordes. Uso: node scripts/test-proyectos.mjs
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const OUT = '.playwright';
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
let fails = 0;
const ok = (name, cond, extra = '') => { if (!cond) fails++; console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`); };

const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
const bad = [];
p.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
await p.goto('http://localhost:3000/proyectos/', { waitUntil: 'networkidle' });

ok('8 casos', (await p.locator('section.pj').count()) === 8);
ok('índice con 8 filas', (await p.locator('.proj-table tbody tr').count()) === 8);

// por defecto, los casos están recogidos
const h0 = await p.evaluate(() => document.querySelector('#piccolino .pj__more').getBoundingClientRect().height);
ok('casos recogidos por defecto', h0 < 2, h0 + 'px');
ok('botones con aria-expanded=false', (await p.locator('.pj__toggle[aria-expanded="false"]').count()) === 8);
const hid = await p.evaluate(() => getComputedStyle(document.querySelector('#piccolino .pj__more-in')).visibility);
ok('contenido recogido oculto a teclado/lectores', hid === 'hidden');
await p.locator('#mart-bakery .pj__toggle').scrollIntoViewIfNeeded();
await p.locator('#mart-bakery .pj__toggle').click();
await p.waitForTimeout(1100);
const h1 = await p.evaluate(() => document.querySelector('#mart-bakery .pj__more').getBoundingClientRect().height);
ok('un caso se despliega', h1 > 800 && (await p.locator('#mart-bakery .pj__toggle').getAttribute('aria-expanded')) === 'true', Math.round(h1) + 'px');
await p.locator('#mart-bakery .pj__collapse').scrollIntoViewIfNeeded();
await p.locator('#mart-bakery .pj__collapse').click();
await p.waitForTimeout(1400);
const h2 = await p.evaluate(() => document.querySelector('#mart-bakery .pj__more').getBoundingClientRect().height);
ok('se recoge con el botón de abajo', h2 < 2, h2 + 'px');
// expandir todos para recorrer todo
await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await p.getByRole('button', { name: '+ Expandir todos' }).click();
await p.waitForTimeout(1000);
ok('expandir todos abre los 8', (await p.locator('.pj__toggle[aria-expanded="true"]').count()) === 8);
// recorrer toda la página para disparar las revelaciones
const H = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += 500) { await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(220); }
await p.waitForTimeout(1200);
const broken = await p.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
ok('todas las imágenes cargan', broken.length === 0, broken.slice(0, 3).join(' '));
ok('sin respuestas 4xx/5xx (excepto favicon)', bad.filter((x) => !x.includes('favicon')).length === 0, bad.filter((x) => !x.includes('favicon')).slice(0, 3).join(' '));
const unseen = await p.evaluate(() => document.querySelectorAll('.pj__tile:not(.is-seen)').length);
ok('todas las piezas se revelaron al hacer scroll', unseen === 0, `${unseen} sin revelar`);
ok('sin scroll horizontal (escritorio)', (await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) === 0);

// capturas de varios casos
for (const id of ['piccolino', 'mart-bakery', 'miga', 'nube-skin', 'archetype', 'malcriada', 'da-vinci', 'anma']) {
  await p.evaluate((id) => document.getElementById(id).scrollIntoView({ block: 'start', behavior: 'instant' }), id);
  await p.waitForTimeout(1700);
  await p.screenshot({ path: `${OUT}/pj-${id}.png` });
}
await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await p.waitForTimeout(500);
await p.screenshot({ path: `${OUT}/pj-top.png` });

// vista previa al pasar por el índice
await p.locator('.proj-table tbody tr').nth(2).scrollIntoViewIfNeeded();
await p.locator('.proj-table tbody tr').nth(2).hover();
await p.waitForTimeout(500);
ok('vista previa del índice', (await p.locator('.pj-peek').getAttribute('data-on')) === '1');
await p.screenshot({ path: `${OUT}/pj-peek.png` });

// visor
await p.evaluate(() => document.getElementById('mart-bakery').scrollIntoView({ block: 'start', behavior: 'instant' }));
await p.waitForTimeout(1500);
await p.locator('#mart-bakery .pj__tile').nth(2).click();
await p.waitForTimeout(500);
ok('visor abre', (await p.locator('.lb').count()) === 1);
const c0 = await p.locator('.lb__count').textContent();
await p.keyboard.press('ArrowRight');
await p.waitForTimeout(250);
const c1 = await p.locator('.lb__count').textContent();
ok('visor avanza con →', c0 !== c1, `${c0.trim()} → ${c1.trim()}`);
await p.screenshot({ path: `${OUT}/pj-lightbox.png` });
await p.keyboard.press('Escape');
await p.waitForTimeout(250);
ok('visor cierra con Esc', (await p.locator('.lb').count()) === 0);
ok('el scroll se desbloquea al cerrar', (await p.evaluate(() => document.body.style.overflow)) !== 'hidden');

// video de Archetype
await p.evaluate(() => document.querySelector('#archetype .pj__stories').scrollIntoView({ block: 'center', behavior: 'instant' }));
await p.waitForTimeout(1800);
const playing = await p.evaluate(() => { const v = document.querySelector('#archetype video'); return !v.paused && v.readyState >= 2; });
ok('el video de Archetype se reproduce solo a la vista', playing);

// filtro
await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await p.getByRole('button', { name: 'Audiovisual', exact: true }).click();
await p.waitForTimeout(150);
const leaving = await p.locator('section.pj[data-phase="out"]').count();
ok('al filtrar, los casos salen con animación', leaving === 6, leaving + ' saliendo');
await p.waitForTimeout(700);
const visible = await p.evaluate(() => [...document.querySelectorAll('section.pj')].filter((s) => !s.hidden).map((s) => s.id));
ok('filtro Audiovisual muestra Archetype y Malcriada', visible.sort().join() === 'archetype,malcriada', visible.join());
await p.getByRole('button', { name: 'Todos', exact: true }).click();
await p.waitForTimeout(200);
const entering = await p.locator('section.pj[data-phase="in"]').count();
ok('al quitar el filtro, los casos entran con animación', entering === 8, entering + ' entrando');
await p.waitForTimeout(1700);
ok('las fases terminan (sin data-phase)', (await p.locator('[data-phase]').count()) === 0);
// al volver a mostrar, los capítulos no quedan invisibles
await p.evaluate(() => document.getElementById('anma').scrollIntoView({ block: 'start', behavior: 'instant' }));
await p.waitForTimeout(1800);
const vis = await p.evaluate(() => { const s = document.getElementById('anma'); const c = getComputedStyle(s); return Number(c.opacity) > 0.9 && c.filter === 'none'; });
ok('capítulo reaparece tras filtrar', vis);

// móvil
const m = await b.newPage({ viewport: { width: 390, height: 844 } });
const merrs = []; m.on('pageerror', (e) => merrs.push(e.message));
await m.goto('http://localhost:3000/proyectos/', { waitUntil: 'networkidle' });
const MH = await m.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < MH; y += 600) { await m.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await m.waitForTimeout(120); }
ok('móvil: sin scroll horizontal', (await m.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, `${await m.evaluate(() => document.documentElement.scrollWidth - innerWidth)}px`);
for (const id of ['piccolino', 'archetype']) {
  await m.evaluate((id) => document.getElementById(id).scrollIntoView({ block: 'start', behavior: 'instant' }), id);
  await m.waitForTimeout(1500);
  await m.screenshot({ path: `${OUT}/pj-m-${id}.png` });
}
const real = errs.filter((e) => !(e.includes('Failed to load resource') && bad.every((x) => x.includes('favicon'))));
ok('sin errores de JavaScript', real.length + merrs.length === 0, [...real, ...merrs].slice(0, 2).join(' | '));
console.log(fails ? `\n${fails} fallo(s)` : '\nTodo bien');
await b.close();
process.exit(fails ? 1 : 0);
