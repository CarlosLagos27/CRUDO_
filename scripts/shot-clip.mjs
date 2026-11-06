// Captura el clip de cerca (2x), en reposo y revelado, sin el cursor.
import { chromium } from 'playwright-core';
const TARGET = process.argv[2] || 'http://localhost:3000/nosotras/';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 3 });
await page.goto(TARGET, { waitUntil: 'networkidle' });
await page.locator('.rev').scrollIntoViewIfNeeded();
await page.addStyleTag({ content: '.rev__cur{display:none!important}' });
await page.waitForTimeout(2200);
const shot = async (name) => {
  const b = await page.locator('.clip svg').boundingBox();
  const f = await page.locator('.rev__frame').boundingBox();
  await page.screenshot({ path: `.playwright/${name}.png`, clip: { x: b.x - 40, y: f.y - 90, width: b.width + 80, height: 200 } });
};
await shot('clip-reposo');
await page.locator('.rev__clip').click();
await page.mouse.move(10, 10);
await page.waitForTimeout(2400);
await shot('clip-revelado');
await browser.close();
console.log('ok');
