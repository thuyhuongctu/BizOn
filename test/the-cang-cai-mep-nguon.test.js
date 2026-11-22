// 21/11/2026 – rà nguồn khi viết kịch bản video Cảng Cái Mép:
// - liên kết VOV trong dòng nguồn của thẻ kiến thức là một bài khác (năm 2021, tàu 15.000 TEU), nên bỏ khỏi dòng nguồn;
// - bài SGGP 30/3/2023 gọi tàu 24.188 TEU là «tàu container nước ngoài lớn nhất» cập cảng Việt Nam tới lúc đó, thẻ ghi đúng như vậy;
// - thẻ «Khi cảng tắc» còn tả luật vụ 5 cũ (chỉ tăng 25% giá thành, giao 85%); từ #1142 đội chọn một trong ba cách.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const s = read('js/cang-cai-mep-3d.js');
const src = s.slice(s.indexOf('const SRC'), s.indexOf('\n', s.indexOf('const SRC')));
assert.ok(!/VOV/.test(src), 'dòng nguồn không còn VOV');
assert.ok(/SGGP \(2023\)/.test(src) && /Cảng vụ Hàng hải Vũng Tàu \(2024\)/.test(src) && /Vũng Tàu Maritime Administration \(2024\)/.test(src), 'dòng nguồn VI/EN có SGGP và Cảng vụ');
assert.ok(s.includes('tàu container nước ngoài lớn nhất từng cập cảng Việt Nam tính tới lúc đó') && s.includes('the largest foreign container ship to call at a Vietnamese port up to then'), 'thẻ tàu ghi đúng như nguồn');
assert.ok(!s.includes('tàu container lớn nhất từng cập cảng Việt Nam.'), 'bỏ câu cũ');
const jam = s.slice(s.indexOf("key: 'jam'"), s.indexOf('];', s.indexOf("key: 'jam'")));
assert.ok(/trả phí ưu tiên/.test(jam) && /chờ hoặc đổi cảng/.test(jam) && /lùi ngày giao/.test(jam), 'thẻ «Khi cảng tắc» nêu đủ ba cách của vụ 5');
assert.ok(/priority fee/.test(jam) && /switch ports/.test(jam) && /later delivery date/.test(jam), 'bản EN nêu đủ ba cách');
assert.ok(/mất một chút uy tín/.test(jam) && /lose a little trust/.test(jam), 'câu hỏi cho CEO có cả lựa chọn uy tín');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 950, 'sw.js ≥ v950');
console.log('the-cang-cai-mep-nguon: ok');
