// Nguồn dữ liệu mở (01/11/2026): mục #nguon-mo ở trang giảng viên. Chỉ đặt liên kết ra trang ngoài, không nhúng.
// Không gắn vào trong game: Hộ Chiếu Sầu Riêng giữ quy tắc không có URL ngoài (chạy offline, xem test/ho-chieu-sau-rieng.test.js).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const gv = read('giang-vien.html');
const sec = gv.slice(gv.indexOf('id="nguon-mo"'), gv.indexOf('</section>', gv.indexOf('id="nguon-mo"')));
assert.ok(sec.length > 100, 'thiếu mục Nguồn dữ liệu mở');
const links = [...sec.matchAll(/<a href="([^"]+)"([^>]*)>/g)];
assert.ok(links.length >= 12, 'mục nguồn mở cần ít nhất 12 liên kết');
for (const [, url, rest] of links) {
  assert.match(url, /^https:\/\//, 'liên kết ngoài phải là https: ' + url);
  assert.ok(rest.includes('target="_blank"') && rest.includes('rel="noopener"'), 'liên kết ngoài mở tab mới, rel=noopener: ' + url);
}
assert.ok(!/<iframe/i.test(sec), 'không nhúng trang ngoài');
assert.ok(sec.includes('CC BY 4.0'), 'nhắc ghi nguồn số liệu');


assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 730);

(async () => {
  const b = await chromium.launch(); const errs = [];
  try {
    const pg = await b.newPage({ viewport: { width: 390, height: 844 } }); pg.on('pageerror', e => errs.push(e.message));
    await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await pg.goto(BASE + '/giang-vien.html#nguon-mo', { waitUntil: 'load', timeout: 60000 }); await pg.waitForTimeout(600);
    assert.ok(await pg.$$eval('#nguon-mo .gv-src', l => l.length) >= 5, 'đủ 5 nhóm nguồn');
    assert.ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'tràn ngang trên điện thoại');
  } finally { await b.close(); }
  assert.deepEqual(errs, []);
  console.log('nguon-du-lieu-mo: ok');
})().catch(e => { console.error(e); process.exit(1); });
