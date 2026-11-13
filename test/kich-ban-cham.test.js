// Kịch bản video ngắn CHAM Homestay «Hòa vốn sau năm tháng» (docs/video/kich-ban-cham-hoa-von.md, duyệt 13/11/2026):
// đủ 11 câu lời đọc VI và EN, có bảng nguồn trỏ về học liệu CHAM trong kho, ghi rõ số liệu là giả định của kế hoạch.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const kb = read('docs/video/kich-ban-cham-hoa-von.md');
const vi = kb.split('## 2.')[1].split('## 3.')[0], en = kb.split('## 4.')[1];
assert.equal((vi.match(/^\| (\d+) \| /gm) || []).length, 11, 'đủ 11 câu lời đọc tiếng Việt');
assert.equal((en.match(/^\| (\d+) \| /gm) || []).length, 11, 'đủ 11 câu lời đọc tiếng Anh');
assert.match(kb, /số liệu là giả định/, 'ghi rõ số liệu là giả định của kế hoạch');
for (const f of ['cham/ke-hoach-2017.html', 'js/cham-review.js', 'cham/tham-dinh.html', 'cham/tro-choi.html']) {
  assert.ok(kb.includes(f) && fs.existsSync(R(f)), 'nguồn trỏ về tệp có thật: ' + f);
}
assert.ok(read('js/cham-review.js').includes('4.000 / 1.042,5 = 3,84 năm'), 'con số tính lại 3,84 năm vẫn có trong ghi chú thẩm định');
assert.ok(read('cham/ke-hoach-2017.html').includes('5 tháng 23 ngày'), 'mốc «5 tháng 23 ngày» vẫn có trong kế hoạch 2017');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 853);
console.log('kich-ban-cham: ok');
