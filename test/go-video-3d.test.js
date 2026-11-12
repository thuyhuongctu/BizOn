/* Đặc tả 004 (video ngắn dọc 3D) đã dừng ngày 12/11/2026: chị xem video thử và bỏ vì hình chưa đạt.
 * Kiểm: bộ dựng scripts/video/3d/ và test của nó đã gỡ, không còn ghi nguồn cho công cụ không còn trong kho,
 * đặc tả ghi rõ «Đã dừng», sw.js ≥ bizon-v839. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const goc = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(goc, f), 'utf8');
check(!fs.existsSync(path.join(goc, 'scripts/video/3d')), 'đã gỡ scripts/video/3d/');
check(!fs.existsSync(path.join(goc, 'test/video-3d-bo-dung.test.js')), 'đã gỡ test/video-3d-bo-dung.test.js');
check(!/scripts\/video\/3d/.test(read('THIRD-PARTY-NOTICES.md')), 'THIRD-PARTY-NOTICES.md không còn nhắc bộ dựng đã gỡ');
check(/\*\*Đã dừng\*\*/.test(read('specs/004-video-ngan-3d/spec.md')), 'đặc tả 004 ghi trạng thái «Đã dừng»');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 839, 'sw.js ≥ bizon-v839');
console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\ngo-video-3d: ok');
process.exit(fails ? 1 : 0);
