// Prueba de "Revelá tu idea": click real en el clip, estado, contadores, cursor y móvil.
// Uso: con `npm run dev` corriendo, `node scripts/test-reveal.mjs [url]`
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const TARGET = process.argv[2] || 'http://localhost:3000/nosotras/';
const OUT = new URL('../.playwright/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
mkdirSync(OUT, { recursive: true });

let fails = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);
  if (!ok) fails++;
};

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

await page.goto(TARGET, { waitUntil: 'networkidle' });
const rev = page.locator('.rev');
await rev.scrollIntoViewIfNeeded();
await page.waitForTimeout(1800); // deja que el clip se dibuje y el cursor entre

const v = () => rev.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue('--v')));
const checked = () => page.locator('#rev-toggle').isChecked();
const num = (name) => rev.evaluate((el, n) => parseInt(getComputedStyle(el).getPropertyValue(n)), name);

// 1) reposo
check('arranca en crudo (--v = 0, sin marcar)', (await v()) === 0 && !(await checked()));
check('clip SVG presente', (await page.locator('.clip svg path').count()) === 1);

// 2) cursor en movimiento: toma 6 cuadros de un ciclo de 4,2 s
const cur = page.locator('.rev__cur .arrow');
const seen = new Set();
for (let i = 0; i < 6; i++) {
  const t = await cur.evaluate((el) => getComputedStyle(el).transform + '|' + getComputedStyle(el).opacity);
  seen.add(t);
  if (i === 2 || i === 3) await page.screenshot({ path: `${OUT}cursor-${i}.png`, clip: { x: 760, y: 0, width: 520, height: 520 } }).catch(() => {});
  await page.waitForTimeout(700);
}
check('el cursor se mueve (varios cuadros distintos)', seen.size >= 4, `${seen.size} cuadros distintos`);

// 3) click real
const clip = page.locator('.rev__clip');
const box = await clip.boundingBox();
await page.screenshot({ path: `${OUT}1-reposo.png` });
await clip.click();
await page.waitForTimeout(300);
check('el click marca el checkbox', await checked());
await page.waitForTimeout(2200);
check('revelado completo (--v = 1)', (await v()) === 1);
check('métricas pasan de negativo a positivo', (await num('--m1')) === 124 && (await num('--m4')) === 58, `alcance=${await num('--m1')} clics=${await num('--m4')}`);
check('el cursor se oculta al revelar', await cur.evaluate((el) => getComputedStyle(el.parentElement).display === 'none'));
await page.screenshot({ path: `${OUT}2-revelado.png` });

// 4) el clip no pisa el párrafo de arriba
const lead = await page.locator('.develop-head .lead').boundingBox();
const clipB = await page.locator('.rev__clip .clip').boundingBox();
const overlap = lead && clipB && clipB.y < lead.y + lead.height && clipB.x < lead.x + lead.width && clipB.x + clipB.width > lead.x;
check('el clip revelado no se solapa con el texto', !overlap, overlap ? `clip.y=${Math.round(clipB.y)} texto.bottom=${Math.round(lead.y + lead.height)}` : '');

// 5) teclado: Tab hasta el checkbox y Espacio para volver a crudo
await page.locator('#rev-toggle').focus();
await page.keyboard.press('Space');
await page.waitForTimeout(2200);
check('Espacio vuelve a crudo (--v = 0)', (await v()) === 0 && !(await checked()));

// 6) móvil
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
await m.goto(TARGET, { waitUntil: 'networkidle' });
await m.locator('.rev').scrollIntoViewIfNeeded();
await m.waitForTimeout(1500);
const overflow = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check('móvil: sin scroll horizontal', overflow <= 0, `${overflow}px de sobra`);
await m.locator('.rev__clip').click();
await m.waitForTimeout(2200);
check('móvil: el click revela', await m.locator('#rev-toggle').isChecked());
await m.screenshot({ path: `${OUT}3-movil-revelado.png` });

check('sin errores en consola', errors.length === 0, errors.slice(0, 2).join(' | '));
await browser.close();
console.log(fails ? `\n${fails} fallo(s). Capturas en ${OUT}` : `\nTodo bien. Capturas en ${OUT}`);
process.exit(fails ? 1 : 0);
