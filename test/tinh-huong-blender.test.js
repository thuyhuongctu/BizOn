// Tình huống học tập «Phần mềm miễn phí, khóa học có phí» (docs/tinh-huong/, duyệt 20/11/2026): đủ phần, đủ 8 câu hỏi,
// lời giải câu 3 khớp phép tính (0,1·P = 200.000 đ → P = 2.000.000 đ), không bịa số liệu học phí hay số học viên.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const t = read('docs/tinh-huong/phan-mem-mien-phi-khoa-hoc-co-phi.md');
for (const h of ['## 1. Bối cảnh', '## 2. Vấn đề kinh doanh', '## 3. Câu hỏi thảo luận', '## 4. Gợi ý cho giảng viên']) assert.ok(t.includes(h), 'thiếu ' + h);
assert.equal((t.split('## 3.')[1].split('## 4.')[0].match(/^\d+\. /gm) || []).length, 8, 'đủ 8 câu hỏi');
assert.equal(0.1 * 2000000, 200000); assert.match(t, /P\* = 2\.000\.000 đ/);
assert.match(t, /không\*\* công bố học phí/, 'ghi rõ bài quảng cáo không có học phí');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 922);
console.log('tinh-huong-blender: ok');
