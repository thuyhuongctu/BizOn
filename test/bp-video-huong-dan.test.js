// Video hướng dẫn Hộ Chiếu Thương Hiệu quay lại theo game hiện tại (04/11/2026) bằng scripts/video/quay-ho-chieu-thuong-hieu.mjs:
// bản ngắn v4 (~1 phút), bản chi tiết v5 (~2 phút), ảnh bìa <tên>-poster; tệp cũ giữ nguyên trong kho (không ghi đè tài sản gốc).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), R = f => path.join(ROOT, f), read = f => fs.readFileSync(R(f), 'utf8');

const NEW = ['bp-huong-dan-choi-vi-v4', 'bp-huong-dan-choi-en-v4', 'bp-huong-dan-chi-tiet-vi-v5', 'bp-huong-dan-chi-tiet-en-v5'];
const OLD = ['bp-huong-dan-choi-vi-v3', 'bp-huong-dan-choi-en-v3', 'bp-huong-dan-chi-tiet-vi-v4', 'bp-huong-dan-chi-tiet-en-v4'];
for (const n of NEW) {
  const f = `assets/video/${n}.mp4`;
  assert.ok(fs.existsSync(R(f)), 'thiếu ' + f);
  const size = fs.statSync(R(f)).size;
  assert.ok(size > 3e6 && size < 20e6, f + ': cỡ tệp bất thường ' + size);
  const head = fs.readFileSync(R(f)).subarray(0, 64 * 1024).toString('latin1');
  assert.ok(head.includes('moov') && head.includes('avc1') && head.includes('mp4a'), f + ': phải là H.264 + AAC, faststart');
  const poster = n + '-poster';
  for (const ext of ['webp', 'jpg']) assert.ok(fs.existsSync(R(`assets/video/${poster}.${ext}`)), 'thiếu ảnh bìa ' + poster + '.' + ext);
}
for (const n of OLD) assert.ok(fs.existsSync(R(`assets/video/${n}.mp4`)), 'tệp gốc phải giữ nguyên: ' + n);

for (const p of ['brand-passport.html', 'Ho Chieu Thuong Hieu 3D.html']) {
  const s = read(p);
  for (const n of NEW) assert.ok(s.includes(`assets/video/${n}.mp4`), p + ': chưa trỏ tới ' + n);
  for (const n of OLD) assert.ok(!s.includes(`assets/video/${n}.mp4`), p + ': còn trỏ tới bản cũ ' + n);
  for (const n of NEW) assert.ok(s.includes(`assets/video/${n}-poster.webp`), p + ': ảnh bìa mới ' + n);
  assert.ok(s.includes('Ngắn (~1 phút)') && s.includes('Chi tiết – đủ 6 quý (~2 phút)') && s.includes('Quick (~1 min)'), p + ': nhãn thời lượng');
}
assert.ok(read('scripts/video/quay-ho-chieu-thuong-hieu.mjs').includes('freezeframes'), 'kịch bản quay còn bước thay khung hỏng');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 771);
console.log('bp-video-huong-dan: ok');
