// Trailer Gravity Lab (60 giây, thuyết minh tiếng Anh) trong khu «Xem trước khi bắt đầu» ở trang chủ.
// Chỉ MP4 H.264/AAC, faststart (moov trước mdat) để điện thoại phát ngay; ảnh bìa riêng; README có liên kết.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), R = f => path.join(ROOT, f), read = f => fs.readFileSync(R(f), 'utf8');

const mp4 = 'assets/video/gravity-lab-trailer.mp4', poster = 'assets/video/gravity-lab-trailer-poster.webp';
assert.ok(fs.existsSync(R(mp4)) && fs.statSync(R(mp4)).size > 5e6 && fs.statSync(R(mp4)).size < 15e6, 'có trailer, dung lượng hợp lý');
const head = fs.readFileSync(R(mp4)).subarray(0, 64 * 1024).toString('latin1');
assert.ok(head.includes('moov') && head.indexOf('moov') < (head.indexOf('mdat') < 0 ? Infinity : head.indexOf('mdat')), 'faststart: moov trước mdat');
assert.ok(fs.existsSync(R(poster)) && fs.statSync(R(poster)).size < 200e3, 'ảnh bìa webp gọn');

const home = read('index.html');
assert.equal(home, read('academia3d-v2.html'), 'index.html và academia3d-v2.html giống hệt');
assert.ok(home.includes(`href="${mp4}" data-trailer="${mp4}" data-poster="${poster}" data-title="Gravity Lab"`), 'thẻ trailer trên trang chủ');
assert.ok(!home.includes('gravity-lab-trailer.webm'), 'chỉ MP4');
assert.ok(read('README.md').includes('(https://bizonland.com/' + mp4 + ')'), 'README có liên kết trailer');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 695, 'sw.js nâng phiên bản bộ nhớ đệm');
console.log('gravity-lab-trailer: ok');
