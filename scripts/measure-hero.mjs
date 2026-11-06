// Mide si la tarjeta roja del hero de Nosotras se solapa con el texto del titular.
import { chromium } from 'playwright-core';
const TARGET = process.argv[2] || 'http://localhost:3000/nosotras/';
const WIDTHS = (process.argv[3] || '901,1024,1280,1440,1920').split(',').map(Number);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
let bad = 0;
for (const w of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(TARGET, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  const r = await page.evaluate(() => {
    const card = document.querySelector('.float-card').getBoundingClientRect();
    const sec = document.querySelector('.hero-nos').getBoundingClientRect();
    const lines = [...document.querySelectorAll('.hero-nos h1 .ln > span')].map((s) => {
      const range = document.createRange();
      range.selectNodeContents(s);
      const b = range.getBoundingClientRect();
      return { t: s.textContent, l: Math.round(b.left), r: Math.round(b.right), top: Math.round(b.top - sec.top), bottom: Math.round(b.bottom - sec.top) };
    });
    const hit = lines.filter((l) => l.r > card.left && l.l < card.right && l.bottom > card.top - sec.top && l.top < card.bottom - sec.top).map((l) => l.t);
    return { card: { l: Math.round(card.left), r: Math.round(card.right), top: Math.round(card.top - sec.top), bottom: Math.round(card.bottom - sec.top) }, lines, hit, secH: Math.round(sec.height), vw: document.documentElement.clientWidth };
  });
  console.log(`${w}px  tarjeta x ${r.card.l}-${r.card.r}  y ${r.card.top}-${r.card.bottom}  hero h=${r.secH}  ${r.hit.length ? 'SOLAPA: ' + r.hit.join(' | ') : 'sin solape'}`);
  if (process.argv[4]) console.log(r.lines.map((l) => `   ${l.t.padEnd(14)} x ${l.l}-${l.r}  y ${l.top}-${l.bottom}`).join('\n'));
  if (r.hit.length) bad++;
  await page.close();
}
await browser.close();
process.exit(bad ? 1 : 0);
