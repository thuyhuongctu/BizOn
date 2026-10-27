// Rà soát hệ sinh thái 27/10/2026: các lỗi nhỏ tìm được khi quét 88 trang ở 390px và 1280px.
// 1. Sầu Riêng 3D không còn yêu cầu «{{ sb.img }}» (404) khi nạp trang.
// 2. Trang công khai mới có trong sitemap.xml; mọi mục sitemap trỏ tới tệp có thật.
// 3. Trang công khai khai báo sẵn <html lang> (trước đây chỉ gắn khi chạy script).
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const lines = read('lab/ho-chieu-sau-rieng-3d.html').split('\n');
const tpl = JSON.parse(lines[lines.findIndex(l => l.trim() === '<script type="__bundler/template">') + 1]);
assert.ok(!tpl.includes('src="{{ sb.img }}"'), 'ảnh sa bàn không dùng chuỗi mẫu trong src');

const sm = read('sitemap.xml');
for (const p of ['hanh-trinh.html', 'brand-passport-v2.html', 'lab/ho-chieu-sau-rieng-v2.html', 'ben-phu-sa-v2.html', 'nhac-ben-phu-sa.html']) assert.ok(sm.includes('https://bizonland.com/' + p + '<'), 'sitemap thiếu ' + p);
for (const m of sm.matchAll(/<loc>https:\/\/bizonland\.com\/([^<]*)<\/loc>/g)) {
  const f = decodeURIComponent(m[1]) || 'index.html';
  assert.ok(fs.existsSync(path.join(ROOT, f)), 'sitemap trỏ tới tệp không có: ' + f);
  if (f.endsWith('.html')) assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(read(f).slice(0, 20000)), 'sitemap có trang noindex: ' + f);
}

for (const f of ['lumina.html', 'huong-dan.html', 'hinh-dung.html', 'huong-dan-cai-dat.html', 'thu-vien-clip.html', 'du-an.html', 'hau-truong.html']) assert.match(read(f), /<html lang="vi">/, f + ' thiếu lang');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 694, 'sw.js nâng phiên bản bộ nhớ đệm');
console.log('site-hygiene: ok');
