// Congela la animación del cursor en el instante del click y captura el clip de cerca.
import { chromium } from 'playwright-core';
const TARGET = process.argv[2] || 'http://localhost:3000/nosotras/';
const W = Number(process.argv[3] || 1280);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: W, height: 900 }, deviceScaleFactor: 2 });
await page.goto(TARGET, { waitUntil: 'networkidle' });
await page.locator('.rev').scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);

const info = await page.evaluate(() => {
  const frame = document.querySelector('.rev__frame').getBoundingClientRect();
  const svg = document.querySelector('.clip svg').getBoundingClientRect();
  const path = document.querySelector('.clip path');
  // centro visual del clip = centro de la caja del trazo (ya rotado)
  const pb = path.getBoundingClientRect();
  return { frame: { x: frame.x, y: frame.y, w: frame.width }, clipCenter: { x: pb.x + pb.width / 2, y: pb.y + pb.height / 2 }, clipBox: { x: pb.x, y: pb.y, w: pb.width, h: pb.height } };
});

for (const frac of [0.4, 0.52, 0.6]) {
  await page.evaluate((f) => {
    for (const a of document.getAnimations()) {
      const n = a.animationName;
      if (n === 'rev-cur' || n === 'rev-tap') { a.pause(); a.currentTime = 1600 + f * 4200; }
    }
  }, frac);
  await page.waitForTimeout(150);
  const tip = await page.evaluate(() => {
    const r = document.querySelector('.rev__cur .arrow').getBoundingClientRect();
    const t = document.querySelector('.rev__cur .tap').getBoundingClientRect();
    return { arrow: { x: r.x, y: r.y }, tapCenter: { x: t.x + t.width / 2, y: t.y + t.height / 2 }, tapOpacity: getComputedStyle(document.querySelector('.rev__cur .tap')).opacity };
  });
  console.log(`frac ${frac}`, JSON.stringify(tip));
  await page.screenshot({ path: `.playwright/click-${String(frac).replace('.', '')}.png`, clip: { x: Math.max(0, info.clipCenter.x - 140), y: Math.max(0, info.clipCenter.y - 130), width: 280, height: 260 } });
}
console.log('clip center', JSON.stringify(info.clipCenter), 'clip box', JSON.stringify(info.clipBox));
await browser.close();
