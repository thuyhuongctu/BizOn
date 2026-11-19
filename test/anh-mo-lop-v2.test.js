/* Trang Giảng viên, thẻ «Mở lớp trong 5 bước»: ảnh minh họa cũ có số bước méo («4 4 ENGAGE», «1 1 START 2», «GETTING STARTEI»).
 * Bản v2 (19/11/2026): xóa chữ méo trên 5 ô, vẽ lại số 1–5 cho rõ; ảnh gốc giữ nguyên, không ghi đè. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'giang-vien.html'), 'utf8');
assert.ok(html.includes('assets/giang-vien/mo-lop-5-buoc-v2.webp'), 'giang-vien.html dùng ảnh v2');
assert.ok(!/mo-lop-5-buoc\.webp/.test(html), 'không còn dùng ảnh cũ có số méo');
for (const f of ['mo-lop-5-buoc.webp', 'mo-lop-5-buoc-v2.webp']) {
  const b = fs.readFileSync(path.join(ROOT, 'assets/giang-vien', f));
  assert.equal(b.slice(0, 4).toString(), 'RIFF', f + ' là WebP');
  assert.equal(b.slice(8, 12).toString(), 'WEBP', f + ' là WebP');
}
assert.ok(+(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 897, 'sw.js ≥ v897');
console.log('anh-mo-lop-v2: ok');
