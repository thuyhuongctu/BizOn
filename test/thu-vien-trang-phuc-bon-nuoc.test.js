// Thư viện Sáng tạo có mục «Trang phục bốn nước»: 28 ảnh tách nền (Lumina, Tu Phan, CEO, CFO, CMO, COO,
// thư ký pháp chế × Na Uy, Pháp, Hàn Quốc, Singapore) của MV «Ngọn hải đăng soi đường».
// Mỗi ảnh phải tồn tại, có nền trong suốt, có bản dịch tiếng Anh; mục phải có tiêu đề cả hai thứ tiếng.
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

assert.ok(Array.isArray(D.world), 'thiếu mục world trong BZ_LIB');
assert.equal(D.world.length, 28, 'phải đủ 28 ảnh (7 nhân vật × 4 nước)');
for (const ai of ['lumina', 'tu', 'ceo', 'cfo', 'cmo', 'coo', 'sec']) for (const nuoc of ['no', 'fr', 'kr', 'sg']) {
  const f = 'character/the-gioi/' + ai + '-' + nuoc + '.webp';
  const muc = D.world.find(a => a[0] === f);
  assert.ok(muc, 'thiếu mục ' + f);
  assert.ok(muc[1] && muc[2], 'thiếu tên/chú thích: ' + f);
  assert.ok(E[f] && E[f][0] && E[f][1], 'thiếu bản tiếng Anh: ' + f);
  const buf = fs.readFileSync(path.join(ROOT, 'assets', f));
  // WebP có kênh alpha: khối VP8X với cờ alpha (bit 4), hoặc VP8L (luôn lưu alpha)
  const vp8x = buf.toString('ascii', 12, 16) === 'VP8X' && (buf[20] & 0x10);
  assert.ok(vp8x || buf.toString('ascii', 12, 16) === 'VP8L', 'ảnh chưa tách nền (không có alpha): ' + f);
}
const js = read('js/thu-vien-clay.js');
assert.ok(js.includes("'Trang phục bốn nước – MV «Ngọn hải đăng soi đường»'") && js.includes("'Costumes of four countries – MV «Southern Horizons»'"), 'thiếu tiêu đề mục');
assert.ok(js.includes('D.world'), 'thu-vien-clay.js chưa dựng mục world');
console.log('thu-vien-trang-phuc-bon-nuoc: ok (' + D.world.length + ' ảnh)');
