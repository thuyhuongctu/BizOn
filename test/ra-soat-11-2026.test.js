// Rà soát hệ sinh thái 01/11/2026: giữ các lỗi đã sửa không quay lại.
// 1. bizon-intro.jsx: chú thích // chèn giữa dòng (#850) từng nuốt dấu } đóng khối, hai trang «BizOn Intro» không dựng được.
// 2. Tràn ngang trên điện thoại: bp3d-boat/index.html, cham-tinh-huong.html, kt330h/index.html.
// 3. Trang trong sitemap có thẻ canonical.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// Không còn dòng nào có chú thích // rồi code phía sau trên cùng dòng trong useMusic
assert.ok(!/\/\/ nhạc gốc của intro[^\n]*ref\.current\.preload/.test(read('bizon-intro.jsx')), 'chú thích // nuốt code trong useMusic');
for (const loc of [...read('sitemap.xml').matchAll(/<loc>https:\/\/bizonland\.com\/([^<]*)<\/loc>/g)].map(m => decodeURIComponent(m[1]))) {
  const f = !loc ? 'index.html' : loc.endsWith('/') ? loc + 'index.html' : loc;
  assert.ok(read(f).includes('rel="canonical"'), f + ': thiếu canonical');
}
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 745);

(async () => {
  const b = await chromium.launch(); const errs = [];
  try {
    for (const p of ['BizOn Intro.dc.html', 'BizOn Intro VI.dc.html']) {
      const pg = await b.newPage({ viewport: { width: 1280, height: 800 } }); const bad = [];
      pg.on('console', m => { if (m.type() === 'error' && /x-import|SyntaxError/.test(m.text())) bad.push(m.text().slice(0, 160)); });
      pg.on('pageerror', e => bad.push(e.message));
      await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await pg.goto(BASE + '/' + encodeURI(p), { waitUntil: 'load', timeout: 60000 }); await pg.waitForTimeout(2500);
      assert.deepEqual(bad, [], p + ' không dựng được');
      await pg.close();
    }
    for (const w of [360, 390]) for (const p of ['bp3d-boat/index.html', 'cham-tinh-huong.html', 'kt330h/index.html']) {
      const pg = await b.newPage({ viewport: { width: w, height: 844 } }); pg.on('pageerror', e => errs.push(p + ': ' + e.message));
      await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await pg.goto(BASE + '/' + p, { waitUntil: 'load', timeout: 60000 }); await pg.waitForTimeout(1000);
      assert.ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), p + ' tràn ngang ở ' + w + 'px');
      await pg.close();
    }
  } finally { await b.close(); }
  assert.deepEqual(errs, []);
  console.log('ra-soat-11-2026: ok');
})().catch(e => { console.error(e); process.exit(1); });
