// 16/11/2026: 17 bài nhạc nặng (> 6 MB) có bản nghe trên web nén 128 kbps (tệp «-v2»), giảm khoảng 30 % dung lượng tải trên điện thoại.
// Bản gốc giữ nguyên trong kho (quy tắc không ghi đè); trang và trình phát dùng bản -v2; nút tải về ở Kho âm nhạc vẫn đưa bản gốc.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8'), size = f => fs.statSync(R(f)).size;
const IDS = ['bai-hat-ben-phu-sa', 'bat-nghiep-mekong-sunfire-rise-2', 'bat-nghiep-mekong-sunfire-rise', 'bat-nghiep-thap-den-ben-song', 'bizon-lesprit-du-mekong', 'brand-passport-remix-25', 'durian-passport', 'ho-chieu-p3-en-remix', 'ho-chieu-p3-en-remix2', 'ho-chieu-p3-remix', 'ho-chieu-p3-remix2', 'ho-chieu-p3-remix3', 'ho-chieu-p3-viet-nam-ra-the-gioi', 'ho-chieu-p3-vietnam-to-the-world-en', 'huong-ngot-phu-sa', 'huong-ngot-que-minh', 'stamps-beyond-borders-extended'];
for (const id of IDS) {
  const goc = 'assets/audio/' + id + '.mp3', nhe = 'assets/audio/' + id + '-v2.mp3';
  assert.ok(fs.existsSync(R(goc)), 'giữ bản gốc ' + id);
  assert.ok(fs.existsSync(R(nhe)), 'có bản nhẹ ' + id);
  const b = fs.readFileSync(R(nhe)).subarray(0, 4);
  assert.ok(b.toString('latin1', 0, 3) === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0), 'MP3 hợp lệ ' + id);
  assert.ok(size(nhe) < size(goc) * 0.8 && size(nhe) > size(goc) * 0.5, 'bản nhẹ nhỏ hơn bản gốc 20–50 %: ' + id);
}
// Trang và trình phát không còn trỏ vào bản gốc nặng
const PAGES = ['js/site-dock.js', 'js/app.js', 'js/bai-hat-chinh.js', 'brand-passport.html', 'Ho Chieu Thuong Hieu 3D.html', 'nhac-ben-phu-sa.html', 'lab/ho-chieu-sau-rieng.html'];
for (const p of PAGES) { const s = read(p); for (const id of IDS) assert.ok(!s.includes(id + '.mp3'), p + ' còn trỏ bản gốc ' + id); }
// Trình phát ghép tên từ mã bài: Kho âm nhạc, Thư viện, Sầu Riêng 3D
for (const p of ['js/am-nhac-clay.js', 'js/thu-vien-clay.js']) { const s = read(p); assert.ok(/var LIGHT = \[/.test(s) && IDS.every(id => s.includes("'" + id + "'")), p + ': danh sách bản nhẹ đủ 17 bài'); }
assert.match(read('js/am-nhac-clay.js'), /dl\.setAttribute\('href', urlGoc\(item\.f\)\)/, 'nút tải về đưa bản gốc');
const b3 = read('lab/ho-chieu-sau-rieng-3d.html');
for (const id of ['huong-ngot-phu-sa', 'huong-ngot-que-minh', 'durian-passport']) assert.ok(b3.includes("['" + id + "-v2', '"), 'Sầu Riêng 3D phát bản nhẹ ' + id);
assert.ok(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 883, 'sw.js ≥ v883');
console.log('nhac-nhe: ok');
