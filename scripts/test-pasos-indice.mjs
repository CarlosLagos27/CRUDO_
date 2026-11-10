// Prueba los tres pasos de Nosotras y el índice editorial de Proyectos. Uso: node scripts/test-pasos-indice.mjs
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
let fails = 0;
const ok = (n, c, x = '') => { if (!c) fails++; console.log(`${c ? 'OK  ' : 'FAIL'} ${n}${x ? ' — ' + x : ''}`); };
const scrollAll = async (p) => { const H = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < H; y += 500) { await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(70); } };

// ───────── Nosotras: los tres pasos ─────────
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://localhost:3000/nosotras/', { waitUntil: 'networkidle' });
await scrollAll(p);
ok('hay 3 pasos', (await p.locator('.hstep').count()) === 3);
ok('ya no queda la pista "Pasá el mouse por las fotos"', (await p.getByText('Pasá el mouse por las fotos').count()) === 0);

// el paso que cruza el centro de la pantalla se enciende
const activeAt = async (i) => {
  await p.evaluate((i) => { const e = document.querySelectorAll('.hstep')[i]; const r = e.getBoundingClientRect(); window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - window.innerHeight / 2, behavior: 'instant' }); }, i);
  await p.waitForTimeout(1300);
  return p.evaluate(() => [...document.querySelectorAll('.hstep')].map((e) => e.dataset.on).join(''));
};
for (let i = 0; i < 3; i++) {
  const st = await activeAt(i);
  ok(`al centrar el paso ${i + 1} solo ese se enciende`, st === ['100', '010', '001'][i], `estado ${st}`);
}
const d = await p.evaluate(() => { const on = document.querySelector('.hstep[data-on="1"]'); const off = document.querySelector('.hstep[data-on="0"]'); return { clip: getComputedStyle(on.querySelector('.hstep__bg')).clipPath, veil: Number(getComputedStyle(on.querySelector('.hstep__veil')).opacity), color: getComputedStyle(on).color, dim: Number(getComputedStyle(off).opacity), clipOff: getComputedStyle(off.querySelector('.hstep__bg')).clipPath }; });
ok('el paso encendido despliega su foto de lado a lado', /inset\(0(px)?( 0(px)?){0,3}\)/.test(d.clip) && d.veil > 0.9, d.clip);
ok('el texto pasa a claro y los otros se apagan', d.color !== 'rgb(17, 17, 17)' && d.dim < 0.5, `color ${d.color}, opacidad de los otros ${d.dim}`);
ok('los pasos apagados tienen la foto recogida', /100%/.test(d.clipOff), d.clipOff);

// con el mouse: pasar sobre un paso lo enciende aunque no esté al centro
await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await p.evaluate(() => document.querySelector('.steps-sec').scrollIntoView({ block: 'start', behavior: 'instant' }));
await p.evaluate(() => window.scrollBy(0, -40));
await p.waitForTimeout(500);
const row = await p.locator('.hstep').nth(2).boundingBox();
await p.mouse.move(row.x + 200, row.y + 30, { steps: 4 });
await p.waitForTimeout(1300);
ok('el mouse enciende el paso que tiene debajo', (await p.locator('.hstep').nth(2).getAttribute('data-on')) === '1');
await p.screenshot({ path: '.playwright/steps-hover.png' });
await p.mouse.move(5, 5);

// enlaces a casos reales
const hrefs = await p.evaluate(() => [...document.querySelectorAll('.hstep__link')].map((a) => a.getAttribute('href')));
ok('los enlaces llevan a Piccolino, a Proyectos y a Malcriada', hrefs.join(' ') === '/proyectos/#piccolino /proyectos/ /proyectos/#malcriada', hrefs.join(' '));
ok('sin desborde horizontal', (await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) === 0);

// ───────── Proyectos: índice editorial ─────────
await p.goto('http://localhost:3000/proyectos/', { waitUntil: 'networkidle' });
await scrollAll(p);
await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await p.waitForTimeout(600);
ok('el índice ya no es una tabla', (await p.locator('table, .proj-table, .table-box').count()) === 0);
ok('8 filas en el índice', (await p.locator('.pj-list li').count()) === 8);
const chips = await p.evaluate(() => [...document.querySelectorAll('.filters .chip:not(.pj-all)')].map((c) => c.textContent.trim()));
ok('los filtros muestran cuántos proyectos hay en cada uno', chips[0].endsWith('8') && chips.slice(1).every((t) => /\d+$/.test(t)), chips.join(' | '));

// hover: la fila se pinta con el color de la marca
const li = p.locator('.pj-list li').nth(1); // Mart Bakery: crema + chocolate
await li.scrollIntoViewIfNeeded();
const rb = await li.boundingBox();
await p.mouse.move(rb.x + 300, rb.y + 30, { steps: 4 });
await p.waitForTimeout(800);
const h = await p.evaluate(() => { const r = document.querySelectorAll('.pj-row')[1]; const bg = getComputedStyle(r, '::before'); return { color: getComputedStyle(r).color, bg: bg.backgroundColor, t: bg.transform }; });
ok('al pasar el mouse la fila se rellena con el color de la marca', h.bg === 'rgb(252, 236, 179)' && h.t !== 'matrix(1, 0, 0, 0, 0, 0)', `fondo ${h.bg}, texto ${h.color}`);
ok('el texto cambia al color de la marca', h.color === 'rgb(57, 40, 35)', h.color);
ok('sigue apareciendo la miniatura flotante', (await p.locator('.pj-peek').getAttribute('data-on')) === '1');
await p.screenshot({ path: '.playwright/indice-hover.png' });
await p.mouse.move(5, 5);

// riel lateral al recorrer los casos
ok('el riel está oculto arriba del todo', (await p.locator('.pj-rail').getAttribute('data-on')) === '0');
await p.evaluate(() => document.getElementById('miga').scrollIntoView({ block: 'center', behavior: 'instant' }));
await p.waitForTimeout(900);
const rl = await p.evaluate(() => ({ on: document.querySelector('.pj-rail').dataset.on, act: document.querySelector('.pj-rail__a[data-active="1"]')?.getAttribute('aria-label') }));
ok('el riel aparece y marca el proyecto que se está viendo', rl.on === '1' && rl.act === 'Miga', JSON.stringify(rl));
await p.screenshot({ path: '.playwright/riel.png' });
await p.locator('.pj-rail__a').nth(6).click();
await p.waitForTimeout(1500);
ok('un clic en el riel lleva a ese proyecto (y lo abre)', (await p.evaluate(() => { const s = document.getElementById('da-vinci'); const r = s.getBoundingClientRect(); return r.top < 200 && r.top > -300; })) && (await p.locator('#da-vinci .pj__toggle').getAttribute('aria-expanded')) === 'true');

// enlace con #proyecto desde otra página: abre y lleva al caso
await p.goto('http://localhost:3000/proyectos/#malcriada', { waitUntil: 'networkidle' });
await p.waitForTimeout(1600);
const hs = await p.evaluate(() => ({ open: document.querySelector('#malcriada .pj__toggle').getAttribute('aria-expanded'), top: Math.round(document.getElementById('malcriada').getBoundingClientRect().top) }));
ok('/proyectos/#malcriada abre el caso y lo muestra', hs.open === 'true' && hs.top < 150 && hs.top > -150, JSON.stringify(hs));

// desde Nosotras: clic en el enlace del paso 3
await p.goto('http://localhost:3000/nosotras/', { waitUntil: 'networkidle' });
await scrollAll(p);
await p.evaluate(() => document.querySelectorAll('.hstep')[2].scrollIntoView({ block: 'center', behavior: 'instant' }));
await p.waitForTimeout(800);
await p.locator('.hstep').nth(2).locator('.hstep__link').click();
await p.waitForURL('**/proyectos/#malcriada');
await p.waitForTimeout(1800);
ok('desde el paso "El resultado" se llega al caso Malcriada ya abierto', (await p.locator('#malcriada .pj__toggle').getAttribute('aria-expanded')) === 'true');

// ───────── móvil ─────────
const m = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
const merrs = []; m.on('pageerror', (e) => merrs.push(e.message));
await m.goto('http://localhost:3000/nosotras/', { waitUntil: 'networkidle' });
await scrollAll(m);
await m.evaluate(() => document.querySelectorAll('.hstep')[1].scrollIntoView({ block: 'center', behavior: 'instant' }));
await m.waitForTimeout(1400);
ok('móvil: el scroll enciende el paso del centro', (await m.evaluate(() => [...document.querySelectorAll('.hstep')].map((e) => e.dataset.on).join(''))) === '010');
await m.screenshot({ path: '.playwright/steps-m.png' });
ok('móvil (Nosotras): sin desborde horizontal', (await m.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
await m.goto('http://localhost:3000/proyectos/', { waitUntil: 'networkidle' });
await scrollAll(m);
await m.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await m.waitForTimeout(500);
const mm = await m.evaluate(() => {
  const th = [...document.querySelectorAll('.pj-row__thumb')].filter((e) => getComputedStyle(e).display !== 'none').length;
  const wide = [...document.querySelectorAll('.pj-list *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 1).length;
  return { th, wide, ovf: document.documentElement.scrollWidth - innerWidth, rail: getComputedStyle(document.querySelector('.pj-rail')).display };
});
ok('móvil: cada cliente muestra su miniatura', mm.th === 8, mm.th + ' miniaturas');
ok('móvil: el índice no se desplaza horizontalmente', mm.wide === 0 && mm.ovf <= 0, `${mm.wide} elementos fuera, desborde ${mm.ovf}px`);
ok('móvil: el riel lateral no se muestra', mm.rail === 'none');
await m.evaluate(() => document.querySelector('.pj-list').scrollIntoView({ block: 'start', behavior: 'instant' }));
await m.screenshot({ path: '.playwright/indice-m.png' });
ok('sin errores de JavaScript', errs.length + merrs.length === 0, [...errs, ...merrs].slice(0, 2).join(' | '));
console.log(fails ? `\n${fails} fallo(s)` : '\nTodo bien');
await b.close();
process.exit(fails ? 1 : 0);
