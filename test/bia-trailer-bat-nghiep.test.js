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
// 16/11/2026: trailer v6 = hình v5 + giọng v4 + nhạc «Mekong Compass» liền mạch, tự hạ khi có lời (v5 lúc có tiếng lúc không).
// 16/11/2026 (chiều): chị đổi lại – ô «Bật Nghiệp» ở «Xem trước khi bắt đầu» phát trailer v6 (có nhạc); video hướng dẫn 3D
// chuyển xuống nút trên thẻ game Bật Nghiệp («Hướng dẫn chơi»).
assert.ok((home.match(/data-trailer="assets\/video\/bizon-trailer-v6-720p\.mp4"/g) || []).length === 1 && !/bizon-trailer-v[45]-720p/.test(home), 'trang chủ dùng trailer v6 đúng một chỗ');
const xemTruoc = home.slice(home.indexOf('Xem trước khi bắt đầu.'));
assert.ok(/data-trailer="assets\/video\/bizon-trailer-v6-720p\.mp4" data-poster="assets\/video\/bizon-trailer-poster\.webp"/.test(xemTruoc) && xemTruoc.includes('Đấu trường 6 vòng thị trường · thuyết minh tiếng Anh · có nhạc · 1:30') && !xemTruoc.includes('bat-nghiep-3d-huong-dan-en-v2.mp4'), 'ô Bật Nghiệp ở «Xem trước» phát trailer v6');
const theBN = (home.match(/<li class="hp-game lv2">[\s\S]*?<\/li>/) || [''])[0];
assert.ok(theBN.includes('class="hp-game-tr" href="assets/video/bat-nghiep-3d-huong-dan-en-v2.mp4" data-trailer="assets/video/bat-nghiep-3d-huong-dan-en-v2.mp4" data-poster="assets/video/bat-nghiep-3d-huong-dan-en-poster.webp"') && theBN.includes('<span data-en="How to play">Hướng dẫn chơi</span>'), 'nút trên thẻ game Bật Nghiệp phát video hướng dẫn 3D');
for (const v of [4, 5]) assert.ok(fs.existsSync(R(`assets/video/bizon-trailer-v${v}-720p.mp4`)), 'giữ bản v' + v);
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 881, 'sw.js ≥ v881');
const silences = f => { const r = spawnSync('ffmpeg', ['-nostats', '-i', R(f), '-af', 'silencedetect=n=-45dB:d=1.5', '-vn', '-f', 'null', '-'], { encoding: 'utf8' }); return r.error ? null : (r.stderr.match(/silence_start/g) || []).length; };
// Không còn chỗ lặng: ngưỡng −35 dB, dài 0,8 giây (v5 bị hai chỗ ở mức này và nhiều đoạn nhạc rất nhỏ giữa các câu).
const quiet = f => { const r = spawnSync('ffmpeg', ['-nostats', '-i', R(f), '-af', 'silencedetect=n=-35dB:d=0.8', '-vn', '-f', 'null', '-'], { encoding: 'utf8' }); return r.error ? null : (r.stderr.match(/silence_start/g) || []).length; };
const s6 = silences('assets/video/bizon-trailer-v6-720p.mp4');
if (s6 === null) console.log('  (không có ffmpeg: bỏ qua kiểm tiếng)');
else { assert.equal(s6, 0, 'trailer v6 có nhạc liền mạch'); assert.ok(quiet('assets/video/bizon-trailer-v6-720p.mp4') <= 1, 'v6 không tụt tiếng giữa các câu'); assert.ok(silences('assets/video/bizon-trailer-v4-720p.mp4') > 3, 'v4 vẫn là bản chỉ có lời'); }
console.log('bia-trailer-bat-nghiep: ok');
