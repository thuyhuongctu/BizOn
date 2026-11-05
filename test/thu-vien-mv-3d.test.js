// Thư viện Sáng tạo có mục «MV 3D – Thế giới thu nhỏ»: bìa YouTube và khung cảnh của hai MV 3D.
// Mỗi ảnh phải tồn tại, có bản dịch tiếng Anh, và mục phải có tiêu đề cả hai thứ tiếng.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(read('js/thu-vien-data.js'), ctx);
vm.runInContext(read('js/thu-vien-data-en.js'), ctx);
const D = ctx.window.BZ_LIB, E = ctx.window.BZ_LIB_EN;
assert.ok(Array.isArray(D.mv) && D.mv.length >= 7, 'thiếu mục mv trong BZ_LIB');
for (const [f, ten, ghi] of D.mv) {
  assert.ok(fs.existsSync(path.join(ROOT, 'assets', f)), 'thiếu tệp assets/' + f);
  assert.ok(ten && ghi, 'thiếu tên/chú thích: ' + f);
  assert.ok(E[f] && E[f][0] && E[f][1], 'thiếu bản tiếng Anh: ' + f);
}
assert.ok(D.mv.some(a => /bia-brand-passport-3d/.test(a[0])) && D.mv.some(a => /bia-durian-passport-3d/.test(a[0])), 'thiếu bìa của hai MV');
const js = read('js/thu-vien-clay.js');
assert.ok(js.includes("'MV 3D – Thế giới thu nhỏ'") && js.includes("'3D MVs – a miniature world'"), 'thiếu tiêu đề mục');
assert.ok(js.includes('D.mv'), 'thu-vien-clay.js chưa dựng mục mv');
console.log('thu-vien-mv-3d: ok (' + D.mv.length + ' ảnh)');
