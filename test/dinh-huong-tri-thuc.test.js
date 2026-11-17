/* Trang Định hướng phải nói đúng với game: ở Hộ Chiếu Thương Hiệu (2D và 3D) tri thức thị trường đã nhân vào doanh thu
 * qua BPCore.knowMul (0/100 → ×0,90, 100/100 → ×1,05; js/bp-core.js). Trước 17/11/2026 trang còn ghi «tri thức chưa đi vào
 * công thức doanh thu» và xếp việc này vào mục «chưa mô hình hóa». Test đối chiếu câu chữ với hằng số trong mã. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const core = R('js/bp-core.js');
const m = core.match(/KNOW\s*=\s*\{\s*base:\s*([\d.]+),\s*span:\s*([\d.]+)\s*\}/);
assert.ok(m, 'tìm thấy hằng số KNOW trong bp-core.js');
const lo = Math.round(+m[1] * 100), hi = Math.round((+m[1] + +m[2]) * 100);
for (const f of ['brand-passport.html', 'Ho Chieu Thuong Hieu 3D.html']) assert.ok(/rev \*= window\.BPCore\.knowMul\(/.test(R(f)), f + ' nhân doanh thu với knowMul');
const dh = R('dinh-huong.html');
assert.ok(!/chưa đi vào công thức doanh thu|does not yet enter the revenue formula/.test(dh), 'không còn câu «tri thức chưa đi vào công thức doanh thu»');
assert.ok(!/Chưa mô hình hóa, đang ưu tiên phát triển: cho tri thức thị trường/.test(dh), 'tri thức → doanh thu không còn nằm trong mục «chưa mô hình hóa»');
assert.ok(dh.includes(`tri thức 0/100 thì doanh thu chỉ còn ${lo}%, tri thức 100/100 thì được ${hi}%`), `VI nêu đúng ${lo}%–${hi}%`);
assert.ok(dh.includes(`0/100 knowledge leaves revenue at ${lo}%, 100/100 lifts it to ${hi}%`), `EN nêu đúng ${lo}%–${hi}%`);
assert.ok(+(R('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 894, 'sw.js ≥ v894');
console.log('dinh-huong-tri-thuc: ok');
