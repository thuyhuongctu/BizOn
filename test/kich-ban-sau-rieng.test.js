// Kịch bản video ngắn «Một trái sầu riêng, cả vùng cùng sầu» (lệnh /video-ngan): mọi câu đọc trích nguồn có trong bảng sự thật,
// độ dài trong khung 220–380 âm tiết, câu kết đã duyệt (5/11/2026).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const s = fs.readFileSync(path.join(__dirname, '..', 'docs/video/kich-ban-sau-rieng-ma-so-vung-trong.md'), 'utf8');
const sec = (a, b) => s.slice(s.indexOf(a), s.indexOf(b));
const rows = t => t.split('\n').map(l => l.split('|').map(x => x.trim())).filter(c => c.length > 4 && /^\d+$/.test(c[1]));

const facts = new Set(rows(sec('## 1. Sự thật và nguồn', '## 2.')).map(c => c[1]));
assert.ok(facts.size >= 10, 'bảng sự thật quá ít');
const lines = rows(sec('## 3. Lời đọc', '## 4.'));
assert.ok(lines.length >= 10);
let syl = 0;
for (const c of lines) {
  const refs = c[5].split(/[,\s]+/).filter(Boolean);
  assert.ok(refs.length && refs.every(r => facts.has(r)), `câu ${c[1]} trích nguồn không có trong bảng: ${c[5]}`);
  syl += (c[3].replace('công-te-nơ', 'công te nơ').match(/[0-9A-Za-zÀ-ỹ]+/g) || []).length + (c[3].match(/cadimi/g) || []).length * 2;
}
assert.ok(syl >= 220 && syl <= 380, 'độ dài ' + syl + ' âm tiết');
assert.ok(s.includes('**' + syl + '**'), 'bảng âm tiết phải ghi đúng tổng ' + syl);
assert.match(lines[lines.length - 1][3], /Họ chỉ đọc một dòng chữ: Việt Nam\.$/, 'câu kết đã duyệt');
assert.ok(lines[0][3].startsWith('Chỉ một trái sầu riêng'), 'móc câu');
assert.ok(s.includes('kịch bản đã duyệt'));
console.log('kich-ban-sau-rieng: ok (' + syl + ' âm tiết)');
