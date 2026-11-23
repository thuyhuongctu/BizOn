// Đếm lượt xem ẩn danh (js/thong-ke.js, 23/11/2026): mọi trang trong sitemap nạp tệp đếm đúng đường dẫn; tệp đếm không đặt cookie,
// không gửi phần sau «?»/«#» (mã lớp), chỉ gửi tên miền trang dẫn tới; không đếm ở máy cục bộ, trình duyệt tự động, Do Not Track, GPC.
// Chính sách dữ liệu có mục «Thống kê lượt xem trang ẩn danh» hai thứ tiếng.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const trang = [...read('sitemap.xml').matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => { let p = decodeURIComponent(m[1].replace('https://bizonland.com/', '')) || 'index.html'; return p.endsWith('/') ? p + 'index.html' : p; });
assert.ok(trang.length > 40);
for (const p of trang) assert.ok(read(p).includes('<script src="' + '../'.repeat(p.split('/').length - 1) + 'js/thong-ke.js" defer></script>'), p + ': nạp js/thong-ke.js');
assert.equal(read('index.html'), read('academia3d-v2.html'), 'index.html giống hệt academia3d-v2.html');
const ma = read('js/thong-ke.js');
assert.doesNotMatch(ma, /document\.cookie|localStorage|sessionStorage/, 'không cookie, không lưu trên máy');
function chay({ href, ref = '', dnt, gpc, webdriver } = {}) {
  const u = new URL(href), gui = [];
  const ctx = { location: { protocol: u.protocol, hostname: u.hostname, pathname: u.pathname }, navigator: { doNotTrack: dnt, globalPrivacyControl: gpc, webdriver },
    document: { referrer: ref }, screen: { width: 390 }, URL, encodeURIComponent, Math, Image: function () { const o = {}; Object.defineProperty(o, 'src', { set: v => gui.push(v) }); return o; } };
  ctx.window = ctx; vm.runInNewContext(ma, ctx); return gui;
}
let g = chay({ href: 'https://bizonland.com/lop-hoc.html?lop=ABC123#doi-2', ref: 'https://www.facebook.com/groups/xyz?id=9' });
assert.equal(g.length, 1, 'đếm một lần');
assert.match(g[0], /^https:\/\/bizonland\.goatcounter\.com\/count\?p=%2Flop-hoc\.html&r=www\.facebook\.com&s=390/);
assert.doesNotMatch(g[0], /ABC123|lop%3D|doi-2|groups|xyz/, 'không gửi mã lớp, mảnh #, đường dẫn trang dẫn tới');
assert.doesNotMatch(chay({ href: 'https://bizonland.com/a.html', ref: 'https://bizonland.com/b.html' })[0], /&r=/, 'không gửi trang nội bộ làm nguồn');
assert.equal(chay({ href: 'https://bizonland.com/a.html', dnt: '1' }).length, 0, 'tôn trọng Do Not Track');
assert.equal(chay({ href: 'https://bizonland.com/a.html', gpc: true }).length, 0, 'tôn trọng Global Privacy Control');
assert.equal(chay({ href: 'https://bizonland.com/a.html', webdriver: true }).length, 0, 'không đếm trình duyệt tự động');
assert.equal(chay({ href: 'http://127.0.0.1:8899/a.html' }).length, 0, 'không đếm máy cục bộ');
const cs = read('chinh-sach.html');
assert.ok(cs.includes('id="thong-ke"') && cs.includes('Thống kê lượt xem trang ẩn danh') && cs.includes('Anonymous page-view statistics') && /không lưu địa chỉ IP/.test(cs), 'chính sách có mục thống kê VI/EN');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 957);
console.log('thong-ke-truy-cap: ok');
