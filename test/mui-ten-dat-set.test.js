/* Mũi tên đất sét (19/11/2026, chị góp ý dấu «→» trông xấu): trên các trang clay, dấu «→» trong liên kết và nút
 * được js/bizon-clay-nav.js thay bằng viên đất sét .clay-go (aria-hidden). Đổi VI → EN → VI vẫn không còn «→» hiện ra,
 * (mũi tên giữa câu như «A → B» thì giữ), chữ gốc trong data-en vẫn giữ nguyên, cửa trang chủ trên điện thoại vẫn thấy viên mũi tên. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 908, 'sw.js ≥ v908');
assert.match(read('css/bizon-clay.css'), /\.clay-go\{/, 'css có .clay-go');
assert.match(read('index.html'), /data-en="[^"]*→"/, 'chữ gốc trong HTML vẫn giữ «→»');

const left = p => p.$$eval('a, button', els => els.filter(e => e.offsetParent !== null && /^\s*→|→\s*$/.test(e.textContent)).map(e => e.textContent.trim().slice(0, 60)));
(async () => {
  const b = await chromium.launch();
  try {
    for (const [url, w] of [['/index.html', 390], ['/index.html', 1280], ['/truong-hoc-thuat.html', 390], ['/giang-vien.html', 390], ['/vao-lop.html', 390]]) {
      const p = await b.newPage({ viewport: { width: w, height: 844 } }), errs = [];
      p.on('pageerror', e => errs.push(e.message));
      await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
      await p.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await p.addInitScript(() => localStorage.setItem('bizon-lang', 'vi'));
      await p.goto(BASE + url + '?lang=vi', { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(600);
      const tag = url + ' ' + w;
      assert.deepEqual(await left(p), [], tag + ': không còn «→» hiện trong liên kết/nút');
      assert.ok(await p.$$eval('.clay-go', a => a.length && a.every(x => x.getAttribute('aria-hidden') === 'true')), tag + ': có viên mũi tên đất sét, ẩn với trình đọc màn hình');
      for (const lang of ['en', 'vi']) {
        await p.evaluate(l => window.clayApplyLang ? window.clayApplyLang(l) : (window.clayCurrentLang && [...document.querySelectorAll('button, a')].find(x => x.textContent.trim() === l.toUpperCase()) || { click() {} }).click(), lang);
        await p.waitForTimeout(400);
        assert.deepEqual(await left(p), [], tag + ' sau khi đổi sang ' + lang + ': không còn «→»');
      }
      if (url === '/index.html' && w === 390) {
        const vis = await p.$$eval('#ba-cua .hp-door-go .clay-go', a => a.map(x => { const r = x.getBoundingClientRect(); return r.width > 20 && r.height > 20; }));
        assert.deepEqual(vis, [true, true, true], 'trang chủ điện thoại: ba cửa đều thấy viên mũi tên');
        assert.match(await p.$eval('[data-door="giang-vien"] .hp-door-go [data-en]', e => e.dataset.en), /Guide/, 'data-en vẫn giữ chữ gốc');
      }
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await p.close();
    }
    console.log('mui-ten-dat-set: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
