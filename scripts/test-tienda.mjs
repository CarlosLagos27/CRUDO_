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

/** Proporción del ancho útil de la tarjeta que ocupan el escenario y el detalle. */
const widths = (card) => p.evaluate((c) => {
  const k = document.querySelector(c);
  const cs = getComputedStyle(k);
  const inner = k.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const st = document.querySelector(c + ' .mc-stage').getBoundingClientRect().width;
  const inf = document.querySelector(c + ' .mc-info').getBoundingClientRect().width;
  return {
    card: Math.round(k.getBoundingClientRect().width), vw: innerWidth,
    stage: st / inner, info: inf / inner, infoPx: inf,
    vis: getComputedStyle(document.querySelector(c + ' .mc-info')).visibility,
    op: Number(getComputedStyle(document.querySelector(c + ' .mc-info__in')).opacity),
  };
}, card);

for (const id of ['septiembre', 'octubre']) {
  const card = `.mc-card--${id}`;
  await p.evaluate((c) => document.querySelector(c).scrollIntoView({ block: 'center', behavior: 'instant' }), card);
  await p.waitForTimeout(1200);
  ok(`${id}: arranca cerrado`, (await p.locator(`${card} .mc-stage`).getAttribute('data-open')) === '0');

  const w0 = await widths(card);
  ok(`${id}: la tarjeta ocupa todo el ancho de la página`, w0.card >= w0.vw - 1, `${w0.card}px de ${w0.vw}px`);
  ok(`${id}: cerrada, el escenario ocupa todo el ancho y el detalle está colapsado`, w0.stage > 0.97 && w0.infoPx < 2, `escenario ${Math.round(w0.stage * 100)}%, detalle ${Math.round(w0.infoPx)}px`);

  const op0 = await p.evaluate((c) => Number(getComputedStyle(document.querySelector(c + ' .mc-piece')).opacity), card);
  ok(`${id}: piezas ocultas con el sobre cerrado`, op0 === 0);
  ok(`${id}: piezas fuera del tab cerrado`, (await p.locator(`${card} .mc-piece`).first().getAttribute('tabindex')) === '-1');
  ok(`${id}: detalle oculto a teclado/lectores cuando está colapsado`, w0.vis === 'hidden');

  // abrir con clic en el sobre
  await p.locator(`${card} .mc-env`).click();
  await p.waitForTimeout(250);
  const wMid = await widths(card);
  ok(`${id}: la transición está en curso (ni cerrada ni mitad)`, wMid.stage < 0.99 && wMid.stage > 0.5, `escenario ${Math.round(wMid.stage * 100)}%`);
  await p.waitForTimeout(2600);
  ok(`${id}: se abre`, (await p.locator(`${card} .mc-stage`).getAttribute('data-open')) === '1');
  const w1 = await widths(card);
  ok(`${id}: al abrir pasa a mitad y mitad`, w1.stage > 0.42 && w1.stage < 0.56 && w1.info > 0.42 && w1.info < 0.56 && w1.vis === 'visible' && w1.op > 0.95, `escenario ${Math.round(w1.stage * 100)}%, detalle ${Math.round(w1.info * 100)}%`);

  const geo = await p.evaluate((c) => {
    const st = document.querySelector(c + ' .mc-stage').getBoundingClientRect();
    const k = document.querySelector(c).getBoundingClientRect();
    const ps = [...document.querySelectorAll(c + ' .mc-piece')].map((e) => {
      const r = e.getBoundingClientRect();
      return { op: Number(getComputedStyle(e).opacity), inStage: r.left >= st.left - 4 && r.right <= st.right + 4 && r.top >= st.top - 4 && r.bottom <= st.bottom + 4, inCard: r.left >= k.left && r.right <= k.right && r.top >= k.top && r.bottom <= k.bottom };
    });
    return { n: ps.length, visible: ps.filter((x) => x.op > 0.9).length, inStage: ps.filter((x) => x.inStage).length, inCard: ps.filter((x) => x.inCard).length };
  }, card);
  ok(`${id}: todas las piezas salen y quedan dentro del escenario`, geo.visible === geo.n && geo.inStage === geo.n, `${geo.visible}/${geo.n} visibles, ${geo.inStage}/${geo.n} dentro`);
  ok(`${id}: ninguna pieza sobresale de la tarjeta`, geo.inCard === geo.n, `${geo.n - geo.inCard} fuera`);

  const translate = await p.evaluate((c) => getComputedStyle(document.querySelector(c + ' .mc-layer--content')).translate, card);
  ok(`${id}: el contenido queda dentro del sobre (sin bajar del frente)`, translate === 'none' || /^0(px)?( 0(px)?)?$/.test(translate), translate);
  ok(`${id}: el sobre cerrado se desvanece`, (await p.evaluate((c) => Number(getComputedStyle(document.querySelector(c + ' .mc-layer--closed')).opacity), card)) === 0);

  // resaltar desde la lista y desde la pieza (y que no se salga de la tarjeta al agrandarse)
  await p.locator(`${card} .mc-item`).nth(1).hover();
  await p.waitForTimeout(500);
  ok(`${id}: la lista resalta una pieza`, (await p.locator(`${card} .mc-piece.is-hot`).count()) === 1);
  ok(`${id}: aparece la etiqueta de la pieza`, (await p.evaluate((c) => Number(getComputedStyle(document.querySelector(c + ' .mc-piece.is-hot .mc-piece__tag')).opacity), card)) > 0.9);
  const hotIn = await p.evaluate((c) => { const k = document.querySelector(c).getBoundingClientRect(); const r = document.querySelector(c + ' .mc-piece.is-hot').getBoundingClientRect(); return r.left >= k.left && r.right <= k.right && r.top >= k.top && r.bottom <= k.bottom; }, card);
  ok(`${id}: la pieza resaltada tampoco sobresale`, hotIn);
  await p.mouse.move(5, 5);
  await p.locator(`${card} .mc-piece`).nth(2).hover();
  await p.waitForTimeout(400);
  ok(`${id}: pasar el mouse por una pieza la resalta`, (await p.locator(`${card} .mc-piece.is-hot`).count()) === 1);

  // Clippy comenta la pieza
  await p.waitForTimeout(300);
  const talk = await p.evaluate(() => { const s = document.querySelector('.mascot__say'); return { on: s.dataset.on === '1', txt: s.textContent, pose: document.querySelector('.mascot').dataset.pose }; });
  ok(`${id}: Clippy comenta el contenido`, talk.pose === 'hide' || talk.txt.length > 3, `${talk.pose} "${talk.txt}"`);

  // clic en el centro de CADA pieza: debe tomarla ella (nunca la zona del sobre, que lo cerraría)
  {
    const n = await p.locator(`${card} .mc-piece`).count();
    const fails = [];
    for (let i = 0; i < n; i++) {
      const pt = await p.evaluate(([c, i]) => { const e = document.querySelectorAll(c + ' .mc-piece')[i]; const r = e.querySelector('img').getBoundingClientRect(); const top = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2)[0]; return { x: r.left + r.width / 2, y: r.top + r.height / 2, name: e.className.split(' ')[1].replace('mc-piece--', ''), onEnv: !!top?.closest('.mc-env') }; }, [card, i]);
      await p.mouse.move(pt.x, pt.y, { steps: 2 });
      await p.mouse.click(pt.x, pt.y);
      await p.waitForTimeout(650);
      const s = await p.evaluate((c) => ({ open: document.querySelector(c + ' .mc-stage').dataset.open, focus: document.querySelectorAll(c + ' .mc-piece.is-focus').length }), card);
      if (pt.onEnv || s.open !== '1' || s.focus !== 1) fails.push(pt.name);
      if (s.open !== '1') { await p.locator(`${card} .mc-env`).click({ force: true }); await p.waitForTimeout(2800); } else { await p.keyboard.press('Escape'); await p.waitForTimeout(800); }
    }
    ok(`${id}: un clic sobre cualquier pieza la abre (y no cierra el sobre)`, fails.length === 0, fails.length ? 'fallan: ' + fails.join(', ') : `${n}/${n} piezas`);
  }

  // ver a detalle: la pieza pasa al frente (centro del escenario, más grande, por encima de todo)
  await p.mouse.move(5, 5);
  await p.waitForTimeout(300);
  const piece = p.locator(`${card} .mc-piece`).nth(1); // pieza que está a un costado, no en el centro
  const rel = (c) => p.evaluate((q) => { const b = document.querySelector(q.c + " .mc-box").getBoundingClientRect(); const r = document.querySelectorAll(q.c + " .mc-piece")[1].getBoundingClientRect(); return { x: (r.left - b.left) / b.width, y: (r.top - b.top) / b.height, w: r.width }; }, { c });
  const before = await rel(card);
  const beforeBox = { width: before.w };
  await piece.click();
  await p.waitForTimeout(1300);
  const fz = await p.evaluate((c) => {
    const f = document.querySelector(c + ' .mc-piece.is-focus');
    if (!f) return null;
    const r = f.getBoundingClientRect();
    const st = document.querySelector(c + ' .mc-box').getBoundingClientRect();
    const k = document.querySelector(c).getBoundingClientRect();
    const dim = Number(getComputedStyle(document.querySelector(c + ' .mc-dim')).opacity);
    const cap = Number(getComputedStyle(document.querySelector(c + ' .mc-cap')).opacity);
    return {
      dx: Math.abs(r.left + r.width / 2 - (st.left + st.width / 2)) / st.width,
      dy: Math.abs(r.top + r.height / 2 - (st.top + st.height / 2)) / st.height,
      w: r.width, h: r.height, boxH: st.height, boxW: st.width,
      z: getComputedStyle(f).zIndex, dim, cap,
      inCard: r.left >= k.left && r.right <= k.right && r.top >= k.top && r.bottom <= k.bottom,
      inBox: r.left >= st.left - 2 && r.right <= st.right + 2 && r.top >= st.top - 2 && r.bottom <= st.bottom + 2,
      capTxt: document.querySelector(c + ' .mc-cap__t b').textContent,
    };
  }, card);
  ok(`${id}: al elegir una pieza pasa al frente`, !!fz && Number(fz.z) >= 30);
  ok(`${id}: queda centrada en el escenario`, !!fz && fz.dx < 0.1 && fz.dy < 0.14, fz ? `desvío ${Math.round(fz.dx * 100)}% / ${Math.round(fz.dy * 100)}%` : '');
  ok(`${id}: se ve más grande que antes`, !!fz && fz.w > beforeBox.width * 1.5, fz ? `${Math.round(beforeBox.width)}px → ${Math.round(fz.w)}px` : '');
  ok(`${id}: ocupa buena parte del escenario sin pasarse`, !!fz && fz.inBox && fz.inCard && fz.h > fz.boxH * 0.5, fz ? `alto ${Math.round((fz.h / fz.boxH) * 100)}% del escenario` : '');
  ok(`${id}: el resto se atenúa y aparece la barra con el nombre`, !!fz && fz.dim > 0.9 && fz.cap > 0.9 && fz.capTxt.length > 2, fz ? fz.capTxt : '');
  await p.screenshot({ path: `.playwright/mc-${id}-focus.png` });
  // siguiente con la flecha del teclado y con el botón
  const nameA = await p.locator(`${card} .mc-cap__t b`).textContent();
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(900);
  const nameB = await p.locator(`${card} .mc-cap__t b`).textContent();
  ok(`${id}: → pasa a la pieza siguiente`, nameA !== nameB && (await p.locator(`${card} .mc-piece.is-focus`).count()) === 1, `${nameA} → ${nameB}`);
  await p.locator(`${card} .mc-cap__btn`).first().click();
  await p.waitForTimeout(900);
  ok(`${id}: ← (botón) vuelve a la anterior`, (await p.locator(`${card} .mc-cap__t b`).textContent()) === nameA);
  // Esc y clic fuera devuelven la pieza a su lugar
  await p.keyboard.press('Escape');
  await p.waitForTimeout(1100);
  const back = await rel(card);
  ok(`${id}: Esc devuelve la pieza a su lugar`, (await p.locator(`${card} .mc-piece.is-focus`).count()) === 0 && Math.abs(back.x - before.x) < 0.02 && Math.abs(back.y - before.y) < 0.02, `desvío ${(100 * (back.x - before.x)).toFixed(1)}% / ${(100 * (back.y - before.y)).toFixed(1)}%`);
  await p.locator(`${card} .mc-item`).nth(2).click();
  await p.waitForTimeout(1000);
  ok(`${id}: elegir desde la lista también la pasa al frente`, (await p.locator(`${card} .mc-piece.is-focus`).count()) === 1);
  await p.locator(`${card} .mc-dim`).click({ position: { x: 20, y: 20 } });
  await p.waitForTimeout(900);
  ok(`${id}: clic en el velo la devuelve`, (await p.locator(`${card} .mc-piece.is-focus`).count()) === 0);

  // cerrar con el botón: vuelve a ancho completo
  await p.mouse.move(5, 5);
  await p.locator(`${card} .mc-toggle`).click();
  await p.waitForTimeout(1500);
  const w2 = await widths(card);
  ok(`${id}: se cierra y vuelve a todo el ancho`, (await p.locator(`${card} .mc-stage`).getAttribute('data-open')) === '0' && w2.stage > 0.97, `escenario ${Math.round(w2.stage * 100)}%`);
  // abrir desde la lista (clic en un ítem abre el sobre)
  await p.locator(`${card} .mc-item`).nth(0).click({ force: true, trial: false }).catch(() => {});
  if ((await p.locator(`${card} .mc-stage`).getAttribute('data-open')) === '0') await p.locator(`${card} .mc-env`).click();
  await p.waitForTimeout(2400);
  ok(`${id}: se vuelve a abrir`, (await p.locator(`${card} .mc-stage`).getAttribute('data-open')) === '1');
  await p.screenshot({ path: `.playwright/mc-${id}-half.png` });
}
const tick = await p.evaluate(() => { const cards = [...document.querySelectorAll('.mc-card')]; return cards.slice(0, -1).map((c, i) => { const tk = c.querySelector('.mc-ticker').getBoundingClientRect(); const next = cards[i + 1].getBoundingClientRect(); return { gap: Math.round(next.top - tk.bottom) }; }); });
ok('la cinta de textos de cada tarjeta no la tapa la siguiente', tick.every((x) => x.gap >= 0), tick.map((x) => x.gap + 'px de aire').join(', '));
ok('sin scroll horizontal (escritorio)', (await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) === 0);

// pantallas anchas: la tarjeta sigue llenando el ancho
for (const w of [1920, 2560]) {
  await p.setViewportSize({ width: w, height: 1100 });
  await p.waitForTimeout(500);
  const a = await widths('.mc-card--septiembre');
  ok(`${w}px: la tarjeta ocupa todo el ancho`, a.card >= a.vw - 1, `${a.card}px`);
}
await p.setViewportSize({ width: 1440, height: 900 });

// móvil
const m = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
const merrs = []; m.on('pageerror', (e) => merrs.push(e.message));
await m.goto('http://localhost:3000/tienda/', { waitUntil: 'networkidle' });
const MH = await m.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < MH; y += 500) { await m.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await m.waitForTimeout(100); }
await m.evaluate(() => document.querySelector('.mc-card--septiembre').scrollIntoView({ block: 'start', behavior: 'instant' }));
await m.waitForTimeout(1200);
ok('móvil: el detalle se ve aunque el sobre esté cerrado', (await m.evaluate(() => getComputedStyle(document.querySelector('.mc-card--septiembre .mc-info')).visibility)) === 'visible');
await m.locator('.mc-card--septiembre .mc-env').tap();
await m.waitForTimeout(2600);
ok('móvil: toque abre el sobre', (await m.locator('.mc-card--septiembre .mc-stage').getAttribute('data-open')) === '1');
ok('móvil: sin scroll horizontal', (await m.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
await m.screenshot({ path: '.playwright/mc-m-open.png' });
ok('sin errores de JavaScript', errs.length + merrs.length === 0, [...errs, ...merrs].slice(0, 2).join(' | '));
console.log(fails ? `\n${fails} fallo(s)` : '\nTodo bien');
await b.close();
process.exit(fails ? 1 : 0);
