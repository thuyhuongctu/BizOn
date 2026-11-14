// Kịch bản video ngắn Bến Phù Sa «Thứ không treo lên sào được» (docs/video/kich-ban-ben-phu-sa-cay-beo.md, duyệt 14/11/2026):
// đủ 11 câu lời đọc VI và EN, bảng nguồn có đường dẫn báo chí / cơ quan nhà nước, có dòng «Trong BizOn» gắn chuẩn đầu ra BPS.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const kb = read('docs/video/kich-ban-ben-phu-sa-cay-beo.md');
const nguon = kb.split('## 1.')[1].split('## 2.')[0], vi = kb.split('## 2.')[1].split('## 3.')[0], en = kb.split('## 4.')[1];
assert.equal((vi.match(/^\| (\d+) \| /gm) || []).length, 11, 'đủ 11 câu lời đọc tiếng Việt');
assert.equal((en.match(/^\| (\d+) \| /gm) || []).length, 11, 'đủ 11 câu lời đọc tiếng Anh');
for (const u of ['vietnamtourism.gov.vn/post/36257', 'congthuong.vn/nghich-ly-cho-noi-cai-rang', 'tuoitre.vn/cho-noi-mien-tay-noi-theo-cach-nao'])
  assert.ok(nguon.includes(u), 'bảng nguồn có ' + u);
assert.match(kb, /BPS-1/); assert.match(kb, /BPS-2/);
assert.ok(fs.existsSync(R('ben-phu-sa-3d.html')), 'game Bến Phù Sa có thật');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 866);
console.log('kich-ban-ben-phu-sa-cay-beo: ok');
