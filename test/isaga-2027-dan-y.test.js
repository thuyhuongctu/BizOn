// Dàn ý bài ISAGA 2027 (25/11/2026): đúng yêu cầu hội thảo, số liệu khớp báo cáo thí điểm, tài liệu tham khảo đủ DOI.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const s = R('docs/research/ISAGA-2027-DAN-Y-BAI.md');
const kq = R('docs/research/KET-QUA-TRUOC-SAU-2026-10.md');

// 1. Yêu cầu của ISAGA 2027: tóm tắt 150–250 từ, các mốc đã xác nhận, khai báo AI
const abs = s.split('<!-- abstract:start -->')[1].split('<!-- abstract:end -->')[0];
const n = abs.trim().split(/\s+/).length;
assert.ok(n >= 150 && n <= 250, 'tóm tắt phải 150–250 từ, đang có ' + n);
for (const d of ['14/02/2027', '28/02/2027', '31/03/2027', '30/04/2027', '31/05/2027']) assert.ok(s.includes(d), 'thiếu mốc ' + d);
assert.match(s, /6–15 trang/, 'nêu giới hạn 6–15 trang');
assert.match(s, /Use of AI tools/, 'có mục khai báo dùng công cụ AI');
assert.match(s, /Ethics/, 'có mục đạo đức nghiên cứu');

// 2. Số liệu thí điểm phải khớp báo cáo trước – sau (không tự đặt số)
const so = [['125', '125 phiếu'], ['49', '49 cặp'], ['14,22', '14.22'], ['14,20', '14.20'], ['30,61', '30.61'], ['31,10', '31.10'], ['4,14', '4.14'], ['3,41', '3.41']];
for (const [vi, en] of so) {
  assert.ok(kq.includes(vi.split(' ')[0]), 'báo cáo gốc có ' + vi);
  assert.ok(s.includes(en.split(' ')[0]), 'dàn ý dùng đúng số ' + en);
}
assert.ok(s.includes('d_z = 0.25') && kq.includes('| 0,25 |'), 'cỡ hiệu ứng tự tin khớp báo cáo (0,25)');
assert.ok(s.includes('28 of 67') && kq.includes('28/67'), 'tỷ lệ trần khớp báo cáo (28/67)');

// 3. Tài liệu tham khảo: mỗi mục có DOI; mỗi tác giả trích trong bài có trong danh mục
const refs = s.split('## References')[1].split('**Ghi chú về nguồn:**')[0].split('\n').filter(l => /^\S.*\(\d{4}\)\./.test(l));
assert.ok(refs.length >= 10, 'có ít nhất 10 tài liệu tham khảo, đang có ' + refs.length);
for (const r of refs) assert.match(r, /https:\/\/doi\.org\/10\.\d{4,}\/\S+$/, 'tài liệu thiếu DOI: ' + r.slice(0, 60));
const body = s.split('## References')[0];
for (const r of refs) {
  const ho = r.split(',')[0];
  assert.ok(body.includes(ho), 'tài liệu ' + ho + ' có trong danh mục nhưng không được trích');
}
for (const m of body.matchAll(/\(([A-Z][A-Za-zÀ-ỹ\-]+)(?: et al\.| & [A-Z][\w\- ]+)?, (\d{4})\)/g)) {
  assert.ok(refs.some(r => r.startsWith(m[1]) && r.includes('(' + m[2] + ')')), 'trích ' + m[1] + ' ' + m[2] + ' nhưng thiếu trong danh mục');
}
assert.ok(!s.includes('10.5465/amr.2001.4378020') || s.includes('chuyển hướng'), 'Sarasvathy dùng DOI chuẩn trên Crossref');

// 4. sw.js
const v = +R('sw.js').match(/bizon-v(\d+)/)[1];
assert.ok(v >= 985, 'sw.js phải ≥ bizon-v985, đang ' + v);
console.log('isaga-2027-dan-y: đạt');
