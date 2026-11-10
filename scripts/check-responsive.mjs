// Revisa en varios anchos que los nombres de los proyectos no partan palabras y que nada se salga de la pantalla.
// Uso: node scripts/check-responsive.mjs [url]
import { chromium } from 'playwright-core';

const URL = process.argv[2] || 'http://localhost:3000/proyectos/';
const WIDTHS = [320, 340, 360, 375, 390, 412, 430, 600, 768, 900, 1000, 1100, 1200, 1280, 1366, 1440, 1600, 1920, 2560];
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
let bad = 0;
for (const w of WIDTHS) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  const res = await p.evaluate(() => {
    const out = { broken: [], overflow: [], page: document.documentElement.scrollWidth - innerWidth };
    for (const h of document.querySelectorAll('.pj__name')) {
      const name = h.closest('section').id;
      // ¿alguna palabra ocupa más de un renglón? (palabra partida)
      const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const re = /\S+/g; let m;
        while ((m = re.exec(node.textContent))) {
          const r = document.createRange(); r.setStart(node, m.index); r.setEnd(node, m.index + m[0].length);
          const lines = new Set([...r.getClientRects()].map((q) => Math.round(q.top)));
          if (lines.size > 1) out.broken.push(`${name}:"${m[0]}"`);
        }
      }
      if (h.scrollWidth > h.clientWidth + 1) out.overflow.push(`${name} h2 ${h.scrollWidth}>${h.clientWidth}`);
    }
    // cualquier elemento de un caso que sobresalga por la derecha del viewport
    for (const s of document.querySelectorAll('section.pj')) {
      for (const e of s.querySelectorAll('.pj__top *, .pj__toggle *, .pj__tag')) {
        const r = e.getBoundingClientRect();
        if (r.width && r.right > innerWidth + 1) { out.overflow.push(`${s.id} .${(e.className || e.tagName).toString().split(' ')[0]} right=${Math.round(r.right)}`); break; }
      }
    }
    return out;
  });
  const flag = res.broken.length || res.overflow.length || res.page > 0;
  if (flag) bad++;
  console.log(`${String(w).padStart(4)}px ${flag ? 'FAIL' : 'OK  '} página +${res.page}px${res.broken.length ? ' | palabras partidas: ' + res.broken.join(', ') : ''}${res.overflow.length ? ' | desborde: ' + res.overflow.slice(0, 4).join('; ') : ''}`);
  await p.close();
}
await b.close();
console.log(bad ? `\n${bad} ancho(s) con problemas` : '\nTodo bien');
process.exit(bad ? 1 : 0);
