'use strict';
// Hộ Chiếu Thương Hiệu (bản thẻ) trên điện thoại 390×844: thanh điều hướng đất sét không dính và ẩn khi vào màn chơi,
// tour Lumina nằm gọn ở đáy (≤ 42 % màn hình), nút ⋯ và gợi ý ngôn ngữ ẩn trong lúc tour chạy, phần tử được soi nằm
// phía trên thẻ tour, không tràn ngang. Kèm: ảnh Hương v3 đã dọn (một mảng alpha duy nhất) thay v2 ở mọi trang Bến Phù Sa.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// --- 1 · tĩnh ---
const bp = read('brand-passport.html');
assert.ok(bp.includes('@media (max-width: 899px) {\n    #clay-nav { position: static; }'), 'thiếu quy tắc nav không dính trên điện thoại');
assert.ok(bp.includes('body:has(#bp-play:not(.hidden)) #clay-nav, body:has(#bp-play:not(.hidden)) > header.pt-24,'), 'thiếu quy tắc ẩn nav khi chơi');
const tour = read('js/bp-tutorial.js');
assert.ok(tour.includes("var phone = innerWidth < 640;") && tour.includes("bottom:calc(10px + env(safe-area-inset-bottom, 0px))") && tour.includes("max-height:42vh; overflow:auto"));
assert.ok(tour.includes("document.body.classList.add('bp-tour-on')") && tour.includes("document.body.classList.remove('bp-tour-on')") && tour.includes('body.bp-tour-on #bz-dock-btn, body.bp-tour-on #bz-lang-hint { display: none !important; }'));
assert.ok(tour.includes("block: innerWidth < 640 ? 'start' : 'center'"));
for (const f of ['ben-phu-sa.html', 'ben-phu-sa-3d.html', 'ben-phu-sa-v8.html', 'Ben Phu Sa Game v4 Nhom.dc.html', 'js/bps3d.js', 'js/bps-hub-nhom.js', 'js/bps3d-v3.js']) {
  const s = read(f); assert.ok(s.includes('phu-sa/huong-new-v3.webp') && !s.includes('phu-sa/huong-new-v2.webp'), f + ' chưa dùng ảnh Hương v3');
}
assert.ok(fs.existsSync(path.join(ROOT, 'assets/character/phu-sa/huong-new-v3.webp')) && fs.existsSync(path.join(ROOT, 'assets/character/phu-sa/huong-new-v2.webp')), 'ảnh v2 phải giữ nguyên, v3 là tệp mới');
assert.match(read('sw.js'), /CACHE = 'bizon-v688'/);

// --- 2 · trình duyệt ---
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
  await page.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
  await page.route(/\.(woff2?|mp3|m4a|glb)(\?|$)/, r => r.abort());
  await page.goto(BASE + '/brand-passport.html', { waitUntil: 'load' }); await page.waitForTimeout(800);
  // cổng đăng nhập → chơi nhanh
  await page.locator('#g3d-demo').click({ force: true }); await page.waitForTimeout(600);
  const navPos = await page.evaluate(() => getComputedStyle(document.getElementById('clay-nav')).position);
  assert.equal(navPos, 'static', 'điện thoại: nav phải không dính (static), đang ' + navPos);
  await page.locator('#bp-intro button').filter({ hasText: /Bắt đầu|Begin|hành trình|journey/i }).first().click({ force: true });
  await page.waitForFunction(() => { const n = document.querySelector('#bp-tour-next'); return !!n && n.getBoundingClientRect().height > 0; }, null, { timeout: 6000 });
  await page.waitForTimeout(400);
  const m = await page.evaluate(() => {
    const vis = el => el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0;
    const card = document.querySelector('#bp-tour-next').closest('.clay-card').getBoundingClientRect();
    const spot = document.querySelector('div[style*="z-index: 90"] > div:first-child').getBoundingClientRect();
    return { nav: vis(document.getElementById('clay-nav')), header: vis(document.querySelector('body > header.pt-24')), intro: vis(document.getElementById('bp-intro')),
      dock: vis(document.getElementById('bz-dock-btn')), tourOn: document.body.classList.contains('bp-tour-on'),
      cardTop: card.top, cardBottom: card.bottom, cardH: card.height, spotTop: spot.top, spotBottom: spot.bottom, vh: innerHeight, sw: document.documentElement.scrollWidth };
  });
  assert.ok(!m.nav && !m.header && !m.intro, 'khi chơi trên điện thoại phải ẩn nav, ảnh chủ đạo, màn giới thiệu: ' + JSON.stringify(m));
  assert.ok(m.tourOn && !m.dock, 'tour chạy thì nút ⋯ phải ẩn');
  assert.ok(m.cardBottom <= m.vh - 6 && m.cardBottom >= m.vh - 40, 'thẻ tour phải sát đáy màn hình: ' + JSON.stringify(m));
  assert.ok(m.cardH <= m.vh * 0.42 + 1, 'thẻ tour không được cao quá 42 % màn hình: ' + m.cardH);
  assert.ok(m.spotTop >= 0 && m.spotTop < m.cardTop, 'phần tử được soi phải nằm phía trên thẻ tour: ' + JSON.stringify(m));
  assert.ok(m.sw <= 390, 'tràn ngang: ' + m.sw);
  // xem hết tour → nút ⋯ hiện lại
  for (let i = 0; i < 8; i++) { const n = page.locator('#bp-tour-next'); if (!(await n.count())) break; await n.click({ force: true }); await page.waitForTimeout(500); }
  const after = await page.evaluate(() => ({ tourOn: document.body.classList.contains('bp-tour-on'), dock: !!document.getElementById('bz-dock-btn') && getComputedStyle(document.getElementById('bz-dock-btn')).display !== 'none' }));
  assert.ok(!after.tourOn && after.dock, 'hết tour phải trả lại nút ⋯: ' + JSON.stringify(after));
  // ảnh Hương v3: một mảng alpha duy nhất, không chấm rời (ngưỡng alpha 40)
  const img = await page.evaluate(async (src) => {
    const im = new Image(); im.src = src; await im.decode(); const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
    const x = c.getContext('2d'); x.drawImage(im, 0, 0); const a = x.getImageData(0, 0, c.width, c.height).data, W = c.width, N = W * c.height;
    const m = new Uint8Array(N); for (let i = 0; i < N; i++) m[i] = a[i * 4 + 3] > 40 ? 1 : 0;
    const lab = new Int32Array(N), st = new Int32Array(N); let n = 0, maxs = 0;
    for (let s = 0; s < N; s++) { if (!m[s] || lab[s]) continue; n++; let sp = 0, sz = 0; st[sp++] = s; lab[s] = n; while (sp) { const q = st[--sp]; sz++; const px = q % W; for (const d of [px > 0 ? -1 : 0, px < W - 1 ? 1 : 0, -W, W]) { const r = q + d; if (d && r >= 0 && r < N && m[r] && !lab[r]) { lab[r] = n; st[sp++] = r; } } } maxs = Math.max(maxs, sz); }
    return { n, maxs };
  }, BASE + '/assets/character/phu-sa/huong-new-v3.webp');
  assert.equal(img.n, 1, 'ảnh Hương v3 phải là một mảng duy nhất, đang ' + img.n);
  assert.equal(errors.length, 0, 'lỗi JS: ' + errors.join(' | '));
  await browser.close();
  console.log('brand-passport-mobile: OK');
})().catch(e => { console.error(e); process.exit(1); });
