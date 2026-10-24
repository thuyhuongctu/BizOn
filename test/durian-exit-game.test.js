// Hộ Chiếu Sầu Riêng: thoát ván đang chơi giữa chừng (vd. muốn chơi lại sau khi game cập nhật).
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const html2d = read('lab/ho-chieu-sau-rieng.html');
const html3d = read('lab/ho-chieu-sau-rieng-3d.html');

// Bản 2D: nút trên thanh đầu trang, chỉ hiện khi đang có ván; thoát về màn mở đầu mà vẫn giữ ván đã lưu.
assert.match(html2d, /<button class="tbtn" id="exitBtn" type="button" hidden><\/button>/);
assert.match(html2d, /\$\('exitBtn'\)\.hidden = !APP;/);
assert.match(html2d, /\$\('exitBtn'\)\.onclick = \(\) => \{[\s\S]{0,400}save\(\); APP = null; RIVALS = null; render\(\);/);

// Bản 3D (template đóng gói trong bundle, «</» được viết thành «<\u002F»): nút trong nhóm nút lúc chơi, hỏi xác nhận rồi về cổng chọn doanh nghiệp.
assert.match(html3d, /exitRun: '⏏ Thoát ván'/);
assert.match(html3d, /exitRun: '⏏ Quit game'/);
assert.match(html3d, /sc-camel-on-click=\\"\{\{ exitRun \}\}\\"/);
assert.match(html3d, /exitRun: \(\) => \{[\s\S]{0,700}confirm\([\s\S]{0,700}phase: 'role', st: null, dec: null/);

console.log('durian-exit-game: ok');
