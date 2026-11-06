/* Trang chủ (06/11/2026): bìa Hộ Chiếu Thương Hiệu bản v2 cận cảnh đảo chính (người, nhà, bến thuyền to rõ hơn bản cũ
 * chụp xa cả quần đảo) và trailer Bật Nghiệp bản v5 – hình, giọng của v4 trộn lại nhạc nền gốc (v4 chỉ còn lời đọc).
 * Ảnh, video cũ giữ nguyên trong kho. Có ffmpeg thì kiểm tiếng v5 không còn khoảng lặng dài như v4. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const home = read('index.html');
assert.equal(home, read('academia3d-v2.html'), 'index.html giống hệt academia3d-v2.html');
assert.ok(home.includes('src="assets/covers/ho-chieu-thuong-hieu-3d-v2.webp"') && !home.includes('ho-chieu-thuong-hieu-3d.webp'), 'trang chủ dùng bìa v2');
for (const f of ['js/games-clay.js', 'js/music-data.js', 'universe.html']) assert.ok(read(f).includes('ho-chieu-thuong-hieu-3d-v2.webp') && !read(f).includes('ho-chieu-thuong-hieu-3d.webp'), 'bìa v2 ở ' + f);
assert.ok(fs.existsSync(R('assets/covers/ho-chieu-thuong-hieu-3d.webp')), 'bìa cũ giữ nguyên');
assert.ok(fs.statSync(R('assets/covers/ho-chieu-thuong-hieu-3d-v2.webp')).size < 150000, 'bìa v2 nhẹ');
assert.ok((home.match(/data-trailer="assets\/video\/bizon-trailer-v5-720p\.mp4"/g) || []).length === 2 && !home.includes('bizon-trailer-v4-720p'), 'hai chỗ trailer Bật Nghiệp dùng v5');
const silences = f => { const r = spawnSync('ffmpeg', ['-nostats', '-i', R(f), '-af', 'silencedetect=n=-45dB:d=1.5', '-vn', '-f', 'null', '-'], { encoding: 'utf8' }); return r.error ? null : (r.stderr.match(/silence_start/g) || []).length; };
const s5 = silences('assets/video/bizon-trailer-v5-720p.mp4');
if (s5 === null) console.log('  (không có ffmpeg: bỏ qua kiểm tiếng)');
else { assert.equal(s5, 0, 'trailer v5 có nhạc liền mạch'); assert.ok(silences('assets/video/bizon-trailer-v4-720p.mp4') > 3, 'v4 vẫn là bản chỉ có lời'); }
console.log('bia-trailer-bat-nghiep: ok');
