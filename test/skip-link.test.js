// «Bỏ qua tới nội dung» (27/10/2026, rút từ danh mục ship requirements của skill landing-page-design – MIT, elayadesign):
// js/bizon-clay-nav.js chèn liên kết đầu tiên của trang, ẩn tới khi được focus, trỏ tới <main> (gán id/tabindex nếu thiếu).
// Chạy thật: Tab đầu tiên vào liên kết, Enter đưa focus vào <main>; có bản tiếng Anh.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const nav = read('js/bizon-clay-nav.js'), css = read('css/bizon-clay.css');
assert.ok(nav.includes("skip.className = 'cn-skip'") && nav.includes("skip.setAttribute('data-en', 'Skip to content')") && nav.includes("if (!mainEl.id) mainEl.id = 'noi-dung';"));
assert.match(css, /\.cn-skip\{position:fixed;left:12px;top:-80px;/);
assert.match(css, /\.cn-skip:focus\{top:max\(12px,env\(safe-area-inset-top\)\)\}/);
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 699);
(async () => {
  const b = await chromium.launch(); const errs = [];
  try {
    for (const [p, lang, txt] of [['index.html', 'vi', 'Bỏ qua tới nội dung'], ['games.html', 'en', 'Skip to content']]) {
      const pg = await b.newPage({ viewport: { width: 390, height: 844 } }); pg.on('pageerror', e => errs.push(e.message));
      await pg.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
      await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await pg.goto(BASE + '/' + p, { waitUntil: 'load', timeout: 60000 }); await pg.waitForTimeout(1200);
      assert.ok(await pg.evaluate(() => document.body.firstElementChild.classList.contains('cn-skip') && document.querySelector('.cn-skip').getBoundingClientRect().bottom <= 0), p + ': liên kết đứng đầu, ẩn khi chưa focus');
      await pg.keyboard.press('Tab');
      assert.equal(await pg.evaluate(() => document.activeElement.className + '|' + document.activeElement.textContent), 'cn-skip|' + txt, p + ': Tab đầu tiên vào liên kết');
      await pg.keyboard.press('Enter'); await pg.waitForTimeout(200);
      assert.equal(await pg.evaluate(() => document.activeElement.tagName), 'MAIN', p + ': Enter đưa focus vào <main>');
      await pg.close();
    }
  } finally { await b.close(); }
  assert.deepEqual(errs, []);
  console.log('skip-link: ok');
})().catch(e => { console.error(e); process.exit(1); });
