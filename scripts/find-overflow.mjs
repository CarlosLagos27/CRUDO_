// Lista los elementos que se salen del ancho del viewport en móvil.
import { chromium } from 'playwright-core';
const TARGET = process.argv[2] || 'http://localhost:3000/nosotras/';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(TARGET, { waitUntil: 'networkidle' });
await page.locator('.rev').scrollIntoViewIfNeeded();
await page.waitForTimeout(2500);
const res = await page.evaluate(() => {
  const w = document.documentElement.clientWidth;
  return [...document.querySelectorAll('body *')]
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.width > 0 && r.right > w + 1)
    .map(({ el, r }) => `${el.tagName.toLowerCase()}.${String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).split(' ').join('.')} right=${Math.round(r.right)} w=${Math.round(r.width)}`)
    .slice(0, 15);
});
console.log(res.join('\n') || 'nada se sale');
await browser.close();
