// Thư viện Sáng tạo, mục MV 3D: 13 ảnh của MV «Southern Horizons» (thuyền rồng qua bốn nước và về Việt Nam).
// Mỗi ảnh phải tồn tại, có tên/chú thích và bản tiếng Anh.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(read('js/thu-vien-data.js'), ctx); vm.runInContext(read('js/thu-vien-data-en.js'), ctx);
const D = ctx.window.BZ_LIB, E = ctx.window.BZ_LIB_EN;
const sh = D.mv.filter(a => a[0].startsWith('mv3d/southern-horizons/'));
assert.equal(sh.length, 13, 'phải đủ 13 ảnh Southern Horizons');
for (const [f, ten, ghi] of sh) {
  assert.ok(fs.existsSync(path.join(ROOT, 'assets', f)), 'thiếu tệp assets/' + f);
  assert.ok(ten && ghi, 'thiếu tên/chú thích: ' + f);
  assert.ok(E[f] && E[f][0] && E[f][1], 'thiếu bản tiếng Anh: ' + f);
}
assert.ok(read('js/thu-vien-clay.js').includes('«Southern Horizons»'), 'ghi chú mục MV 3D chưa nhắc Southern Horizons');
console.log('thu-vien-southern-horizons: ok (' + sh.length + ' ảnh)');
