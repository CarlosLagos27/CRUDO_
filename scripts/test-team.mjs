// Prueba del carrusel "Quiénes somos" y de las métricas de "Revelá tu idea".
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const TARGET = process.argv[2] || 'http://localhost:3000/nosotras/';
mkdirSync('.playwright', { recursive: true });
let fails = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`); if (!ok) fails++; };

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(TARGET, { waitUntil: 'networkidle' });

// ── métricas del revelado ──
const rev = page.locator('.rev');
await rev.scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
const m1 = () => rev.evaluate((el) => parseInt(getComputedStyle(el).getPropertyValue('--m1')));
check('en crudo el alcance es negativo', (await m1()) === -38, String(await m1()));
await page.screenshot({ path: '.playwright/m-crudo.png' });
await page.locator('.rev__clip').click();
await page.waitForTimeout(2600);
check('revelado: el alcance pasa a +124', (await m1()) === 124, String(await m1()));
await page.screenshot({ path: '.playwright/m-revelado.png' });

// ── carrusel ──
const team = page.locator('.team');
await team.scrollIntoViewIfNeeded();
await page.waitForTimeout(1800);
const active = () => page.evaluate(() => [...document.querySelectorAll('.team__slide')].findIndex((s) => s.classList.contains('is-active')));
check('hay 4 slides (grupo + 3 integrantes)', (await page.locator('.team__slide').count()) === 4);
check('arranca en el grupo', (await active()) === 0);
await page.screenshot({ path: '.playwright/team-0.png' });

await page.locator('.team__arrow[aria-label="Siguiente"]').click();
await page.waitForTimeout(1800);
check('flecha siguiente avanza', (await active()) === 1, `slide ${await active()}`);
await page.screenshot({ path: '.playwright/team-1.png' });

await page.locator('.team__tabs .chip').nth(3).click();
await page.waitForTimeout(1800);
check('pestaña salta a la tercera integrante', (await active()) === 3, `slide ${await active()}`);
check('siguiente queda deshabilitada al final', await page.locator('.team__arrow[aria-label="Siguiente"]').isDisabled());

await team.focus();
await page.keyboard.press('ArrowLeft');
await page.waitForTimeout(1500);
check('teclado ← retrocede', (await active()) === 2, `slide ${await active()}`);

const nameVisible = await page.evaluate(() => {
  const el = document.querySelector('.team__slide.is-active .team__name');
  return getComputedStyle(el).opacity;
});
check('el texto de la slide activa aparece', nameVisible === '1', `opacity ${nameVisible}`);
check('las demás slides esconden su texto', await page.evaluate(() => getComputedStyle(document.querySelector('.team__slide:not(.is-active) .team__name')).opacity === '0'));

// ── móvil ──
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
await m.goto(TARGET, { waitUntil: 'networkidle' });
await m.locator('.team').scrollIntoViewIfNeeded();
await m.waitForTimeout(1800);
const overflow = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check('móvil: sin scroll horizontal de página', overflow <= 0, `${overflow}px`);
await m.locator('.team__arrow[aria-label="Siguiente"]').click();
await m.waitForTimeout(1800);
check('móvil: avanza', (await m.evaluate(() => [...document.querySelectorAll('.team__slide')].findIndex((s) => s.classList.contains('is-active')))) === 1);
await m.screenshot({ path: '.playwright/team-movil.png' });

check('sin errores en consola', errors.length === 0, errors.slice(0, 2).join(' | '));
await browser.close();
console.log(fails ? `\n${fails} fallo(s)` : '\nTodo bien');
process.exit(fails ? 1 : 0);
