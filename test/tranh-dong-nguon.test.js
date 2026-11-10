// Hướng «tranh gốc thành hoạt hình» cho nhân vật Bến BizOn (10/11/2026): ảnh mẫu CEO không có la bàn (chị Hương yêu cầu bỏ) và công cụ
// tách nền xanh thành tờ sprite. Kiểm tĩnh: ảnh mẫu có mặt, đúng định dạng và đủ nhẹ; công cụ không chứa khóa, không gọi mạng; có ghi nguồn.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
for (const f of ['ceo-tranh-dong-truoc-v1.jpg', 'ceo-tranh-dong-sau-v1.jpg']) {
  const b = fs.readFileSync(R('assets/models/nhan-vat/nguon/' + f));
  assert.ok(b[0] === 0xFF && b[1] === 0xD8, f + ' phải là JPEG (công cụ tạo video chỉ nhận JPG/PNG)');
  assert.ok(b.length > 20000 && b.length < 300000, f + ' nặng ' + Math.round(b.length / 1024) + ' KB (cho phép 20–300 KB)');
}
const py = read('scripts/3d/tach-nen-sprite.py');
assert.ok(!/msy_[A-Za-z0-9]{8,}|sk-[A-Za-z0-9]{12,}/.test(py), 'công cụ tách nền không được chứa khóa API');
assert.ok(!/urllib|requests|http\.client|socket/.test(py), 'công cụ tách nền không gọi mạng');
assert.match(py, /sys\.argv\[3\]/, 'tên sprite truyền qua tham số');
const src = read('assets/models/SOURCES.md');
assert.ok(src.includes('ceo-tranh-dong-truoc-v1.jpg') && /bỏ la bàn/.test(src), 'SOURCES.md ghi nguồn ảnh mẫu và việc bỏ la bàn');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 827);
console.log('tranh-dong-nguon: ok');
