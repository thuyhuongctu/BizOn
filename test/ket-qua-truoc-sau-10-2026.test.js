/* Kết quả phiếu trước–sau đợt 10/2026 (PR 7b của kế hoạch docs/roadmap/KE-HOACH-DON-HE-SINH-THAI-2026-11.md): hai lớp KTM330HM01/02,
 * 125 phiếu, 49 cặp ghép. Trang Bằng chứng và Thiết kế nghiên cứu phải nêu đúng con số đã phân tích, nói rõ trần điểm của bộ 15 câu
 * và không nhận là «tác động» khi chỉ có một nhóm trước–sau. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const doc = R('docs/research/KET-QUA-TRUOC-SAU-2026-10.md');
for (const s of ['49 cặp', '125 phiếu', '14,22', '14,20', '30,61', '31,10', '28/67', 'NPS gộp −3', 'không nhóm đối chứng']) assert.ok(doc.includes(s), 'tài liệu kết quả thiếu «' + s + '»');
const bc = R('bang-chung.html');
assert.ok(bc.includes('id="dot-10-2026"'), 'bang-chung.html có mục đợt 10/2026');
for (const s of ['125 phiếu, 49 cặp ghép', '−0,02', '42%', '+0,49', 'docs/research/KET-QUA-TRUOC-SAU-2026-10.md', 'không có nhóm đối chứng', 'bị trần']) assert.ok(bc.includes(s), 'bang-chung.html thiếu «' + s + '»');
assert.ok(bc.indexOf('id="dot-10-2026"') < bc.indexOf('>3</span>'), 'mục đợt 10/2026 đứng trước mục 3 (giới hạn)');
const sec = bc.slice(bc.indexOf('id="dot-10-2026"'), bc.indexOf('>3</span>'));
assert.ok((sec.match(/data-en="/g) || []).length >= 10, 'mục đợt 10/2026 có bản tiếng Anh (data-en)');
assert.ok(!/tác động của BizOn|hiệu quả đã được chứng minh/i.test(sec), 'không khẳng định nhân quả');
const tk = R('thiet-ke-nghien-cuu.html');
for (const s of ['49 cặp ghép', '14,22 → 14,20', '30,6 → 31,1', 'chạm trần', 'docs/research/KET-QUA-TRUOC-SAU-2026-10.md']) assert.ok(tk.includes(s), 'thiet-ke-nghien-cuu.html thiếu «' + s + '»');
assert.ok(tk.indexOf('49 cặp ghép') < tk.indexOf('id="thiet-ke"'), 'kết quả đợt 10/2026 nằm trong mục Hiện trạng, trước Thiết kế');
console.log('ket-qua-truoc-sau-10-2026: ok');
