// Phần di chuyển 3D dùng chung (js/di-chuyen-3d.js, đặc tả specs/002-ben-bizon-3d): (1) ba game thuộc hồ sơ quyền tác giả đang thẩm định
// và các tệp mã riêng của chúng KHÔNG nạp, không nhắc tới phần này cho tới khi có giấy chứng nhận (FR-015, SC-008); (2) tệp dùng chung
// không mang bối cảnh hay địa điểm nào, mỗi nơi tự truyền bối cảnh của mình vào (FR-020); (3) bizon-characters.js không bị sửa vì việc này.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const HO_SO = ['BizOn Game 3D.html', 'game.html', 'ben-phu-sa.html', 'ben-phu-sa-v8.html', 'ben-phu-sa-3d.html', 'brand-passport.html', 'Ho Chieu Thuong Hieu 3D.html',
  'js/clay-hub.js', 'js/office-scene.js', 'js/bps-hub.js', 'js/bp-hub.js', 'js/bps3d.js', 'bp3d.js', 'bizon-characters.js', 'js/engine.js', 'js/app.js', 'js/backend.js'];
for (const f of HO_SO) {
  const s = read(f);
  assert.ok(!/di-chuyen-3d|BizOnDiChuyen|ben-bizon\.js/.test(s), f + ': thuộc hồ sơ quyền tác giả, chưa được nạp phần di chuyển mới');
}

const dc = read('js/di-chuyen-3d.js');
assert.match(dc, /BizOnDiChuyen/, 'tệp dùng chung phải lộ BizOnDiChuyen');
for (const w of ['Bến Phù Sa', 'Bật Nghiệp', 'Hộ Chiếu', 'Sầu Riêng', 'Arcade', 'Lumina', 'chợ nổi', 'cầu tàu', 'dừa', 'ben-phu-sa', 'games.html', 'assets/']) {
  assert.ok(!dc.includes(w), 'js/di-chuyen-3d.js không được mang bối cảnh hay địa điểm: thấy «' + w + '»');
}
assert.ok(!/from\s+['"]three['"]|three\.module|three\.min/.test(dc), 'tệp dùng chung không tự nạp three.js: trang truyền THREE vào');
assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|supabase/i.test(dc), 'tệp dùng chung không gọi mạng (FR-016)');
assert.ok(!/claude-(opus|sonnet|haiku|fable)/i.test(dc + read('js/ben-bizon.js')), 'không ghi mã mô hình AI');

// Bến BizOn bật mô hình có xương bằng cờ có sẵn, không sửa bizon-characters.js
assert.match(read('js/ben-bizon.js'), /BIZON_CHAR_GLB\s*=\s*true/, 'ben-bizon.js bật mô hình bằng cờ BIZON_CHAR_GLB');
assert.match(read('bizon-characters.js'), /window\.BIZON_CHAR_GLB === true/, 'bizon-characters.js vẫn mặc định tắt mô hình (PR #1024)');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 823);
console.log('di-chuyen-3d-ho-so: ok');
