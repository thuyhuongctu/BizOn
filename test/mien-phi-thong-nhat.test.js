'use strict';
// Chữ «miễn phí» phải khớp trang Chính sách (mục B5) và README: Arcade và Bến Phù Sa miễn phí;
// hai trụ cột (Bật Nghiệp, Hộ Chiếu Thương Hiệu) chỉ dùng thử một học kỳ, dùng tiếp cần giấy phép.
// Trước đây các trang Giải pháp, Liên hệ, Hướng dẫn cài đặt, Trường học thuật, Định hướng hứa «miễn phí» chung chung.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

const chinhSach = read('chinh-sach.html');
assert.match(chinhSach, /Arcade và game bậc 1 \(Bến Phù Sa\): miễn phí/);
assert.match(chinhSach, /Hai game trụ cột \(Bật Nghiệp và Hộ Chiếu Thương Hiệu\): một học kỳ dùng thử/);

const CAM = [/luôn miễn phí/i, /Free play is always free/i, /dùng BizOn miễn phí/i, /use BizOn free/i,
  /Miễn phí cho giảng dạy/i, /Free for non-commercial teaching/i, /Dùng thử miễn phí/i, /Try it free/i,
  /miễn phí cho học/i, /free to learn/i, /free for learning/i, /trình duyệt, miễn phí/i, /browser, free/i,
  /hoàn toàn miễn phí/i, /completely free/i, /PLAY NOW – FREE/i, /Play free on the Web/i];
for (const f of ['giai-phap.html', 'lien-he.html', 'huong-dan-cai-dat.html', 'truong-hoc-thuat.html', 'dinh-huong.html', 'universe.html', 'js/site-ui.js']) {
  const s = read(f);
  for (const re of CAM) assert.ok(!re.test(s), `${f}: còn câu hứa miễn phí chung chung (${re})`);
}
assert.match(read('giai-phap.html'), /dùng thử một học kỳ/);
console.log('mien-phi-thong-nhat: OK');
