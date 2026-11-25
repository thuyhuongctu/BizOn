// Đợt thu dữ liệu sau (25/11/2026): phiếu sau có c_6 «tốn công suy nghĩ», c_7 «trao đổi trong đội»;
// c_1–c_5 giữ nguyên chữ và thứ tự để so được với đợt 10/2026; bản giấy, bản tiếng Anh, CSV giảng viên cùng 7 câu;
// tài liệu thiết kế có số liệu lực kiểm định đúng công thức và tài liệu tham khảo đủ DOI.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

const DOT10 = [
  'Buổi học với BizOn cuốn hút tôi hơn buổi học thông thường.',
  'Việc «làm thử» giúp tôi hiểu khái niệm kinh doanh dễ hơn nghe giảng.',
  'Cuộc họp đội và gợi ý của cố vấn AI giúp tôi biết cần làm gì.',
  'Phần giải thích «Vì sao?» sau mỗi vòng giúp tôi rút ra bài học.',
  'Tôi muốn tiếp tục dùng BizOn trong các buổi học sau.',
];
const MOI = ['Khi chơi, tôi phải suy nghĩ, cân nhắc nhiều trước mỗi quyết định.', 'Các bạn trong đội trao đổi, tranh luận với nhau trước khi chốt quyết định.'];

// 1. Phiếu online: 7 câu, 5 câu đầu giữ nguyên, kiểm thiếu theo độ dài mảng
const online = R('khao-sat-online.html');
const arr = online.match(/const LIKERT_C = \[([\s\S]*?)\n  \];/)[1].split('\n').map(l => l.trim()).filter(l => l.startsWith("'")).map(l => l.replace(/^'|',?$/g, ''));
assert.deepEqual(arr, [...DOT10, ...MOI], 'LIKERT_C: c_1–c_5 như đợt 10/2026, thêm c_6, c_7 ở cuối');
assert.match(online, /i <= LIKERT_C\.length; i\+\+\) \{ const v = val\('c' \+ i\)/, 'kiểm thiếu Phần C theo số câu thật');
assert.ok(!/i <= 5; i\+\+\) \{ const v = val\('c'/.test(online), 'không còn vòng lặp cứng 5 câu');

// 2. Bản tiếng Anh 7 câu, câu 6–7 khớp tài liệu
const en = R('js/khao-sat-en.js');
const thietKe = R('docs/research/THIET-KE-DOT-KHAO-SAT-SAU.md');
for (const c of ['While playing, I had to think hard and weigh options before each decision.', 'My teammates and I discussed and debated with each other before finalizing decisions.']) {
  assert.ok(en.includes(c) && thietKe.includes(c), 'bản tiếng Anh và tài liệu cùng câu: ' + c.slice(0, 30));
}
for (const c of MOI) assert.ok(thietKe.includes(c), 'tài liệu ghi đúng câu: ' + c.slice(0, 30));

// 3. Phiếu giấy 7 dòng Phần C, «mức tham gia» vẫn là trung bình C1–C5
const giay = R('khao-sat.html');
const phanC = giay.split('Phần C – Trải nghiệm')[1].split('</table>')[0];
assert.equal((phanC.match(/<tr><td>\d\./g) || []).length, 7, 'phiếu giấy có 7 câu Phần C');
[...DOT10, ...MOI].forEach((c, i) => assert.ok(phanC.includes(`${i + 1}. ${c}`), 'phiếu giấy câu ' + (i + 1)));
assert.match(giay, /mức tham gia<\/b> = trung bình câu C1–C5/, 'mức tham gia không cộng c_6, c_7');

// 4. CSV của Instructor Studio có c1–c7
const studio = R('js/app-shell/instructor-studio.js');
assert.match(studio, /\[1, 2, 3, 4, 5, 6, 7\]\.map\(i => `c\$\{i\}`\)/, 'tiêu đề CSV c1–c7');

// 5. Bảng lực kiểm định: d = 2,80 × √(2/n)
const d = n => (2.80 * Math.sqrt(2 / n)).toFixed(2).replace('.', ',');
for (const [n2, n3, tong] of [[30, 20, 60], [50, 33, 100]]) {
  const dong = thietKe.split('\n').find(l => l.startsWith(`| ${tong} |`));
  assert.ok(dong, 'có dòng tổng mẫu ' + tong);
  assert.ok(dong.includes(`${n2} → ${d(n2)}`) && dong.includes(`${n3} → ${d(n3)}`), `lực kiểm định đúng công thức ở tổng ${tong}: ${dong}`);
}

// 6. Tài liệu tham khảo đủ DOI; từ điển biến và hướng dẫn cập nhật
const refs = thietKe.split('## Tài liệu tham khảo')[1].split('\n').filter(l => /\(\d{4}\)\./.test(l));
assert.equal(refs.length, 4, 'bốn tài liệu tham khảo');
for (const r of refs) assert.match(r, /https:\/\/doi\.org\/10\.\d{4,}\/\S+$/, 'thiếu DOI: ' + r.slice(0, 40));
assert.match(R('docs/research/TU-DIEN-BIEN.md'), /`c_1…c_7`/, 'từ điển biến ghi c_1…c_7');
assert.match(R('docs/research/HUONG-DAN-THU-BO-2-TREN-LOP.md'), /7 câu trải nghiệm/, 'hướng dẫn giảng viên ghi 7 câu');

const v = +R('sw.js').match(/bizon-v(\d+)/)[1];
assert.ok(v >= 986, 'sw.js phải ≥ bizon-v986, đang ' + v);
console.log('khao-sat-dot-sau: đạt');
