'use strict';
// Trang Âm nhạc (am-nhac.html): mỗi nút phát MV (data-yt) có mã YouTube đúng 11 ký tự, poster WebP có thật,
// và có mục MV «Brand Passport» bản thế giới thu nhỏ 3D (đăng YouTube 04/11/2026).
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const R = f => path.join(__dirname, '..', f);
const s = fs.readFileSync(R('am-nhac.html'), 'utf8');
const nut = [...s.matchAll(/<button type="button" data-yt="([^"]+)" aria-label="([^"]+)" style="background-image:url\('([^']+)'\)">/g)];
assert.ok(nut.length >= 8, 'phải có ít nhất 8 nút phát MV, thấy ' + nut.length);
const ma = new Set();
for (const [, id, nhan, poster] of nut) {
  assert.match(id, /^[A-Za-z0-9_-]{11}$/, 'mã YouTube sai: ' + id);
  assert.ok(!ma.has(id), 'mã YouTube trùng: ' + id); ma.add(id);
  assert.ok(nhan.length > 10, 'aria-label quá ngắn: ' + id);
  assert.match(poster, /^assets\/video\/[a-z0-9-]+-poster\.webp$/, 'poster phải là WebP: ' + poster);
  assert.ok(fs.existsSync(R(poster)) && fs.statSync(R(poster)).size > 10000, 'thiếu poster ' + poster);
}
// MV Brand Passport 3D: đúng mã, đúng poster, có liên kết về game, có bản tiếng Anh cho tiêu đề và mô tả
assert.ok(ma.has('4Do7SZpc5pU'), 'thiếu MV Brand Passport 3D');
assert.ok(s.includes("data-yt=\"4Do7SZpc5pU\"") && s.includes("assets/video/mv-brand-passport-3d-poster.webp"));
assert.match(s, /<h2 data-en="Music video «Brand Passport»">MV «Hộ chiếu thương hiệu»<\/h2>/);
assert.ok(s.includes('href="ho-chieu-thuong-hieu.html" data-en="▶ Play the Brand Passport game"'));
assert.ok(fs.existsSync(R('ho-chieu-thuong-hieu.html')));
console.log('am-nhac-mv: ' + nut.length + ' nút MV, poster và mã YouTube đều hợp lệ');
