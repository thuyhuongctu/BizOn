// Link khảo sát theo lớp: mã lớp điền sẵn từ link giảng viên gửi, CSV xuất đủ thang đo.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const survey = read('khao-sat-online.html');
const studioHtml = read('app/instructor-studio.html');
const studioJs = read('js/app-shell/instructor-studio.js');

// Phiếu khảo sát: ?lop= điền sẵn và khoá mã lớp, ?phieu= chọn sẵn phiếu trước/sau.
assert.match(survey, /QS\.get\('lop'\)/);
assert.match(survey, /\$\('ks-class'\)\.readOnly = true/);
assert.match(survey, /id="ks-class-lock"/);
assert.match(survey, /truoc: 'pre'/);
assert.match(survey, /sau: 'post'/);
assert.match(survey, /const klass = normClass\(\$\('ks-class'\)\.value\)/);

// Instructor Studio: tạo và chép link theo lớp đã đăng ký.
for (const id of ['bi-survey-instrument', 'bi-copy-survey-pre', 'bi-copy-survey-post', 'bi-survey-link-output']) {
  assert.match(studioHtml, new RegExp(`id="${id}"`));
}
assert.match(studioJs, /new URL\('\.\.\/khao-sat-online\.html', location\.href\)/);
assert.match(studioJs, /searchParams\.set\('lop', state\.classCode\)/);
assert.match(studioJs, /state\.mode !== 'auth'/);
assert.match(studioJs, /navigator\.clipboard\.writeText\(link\)/);

// CSV khảo sát có đủ thang Likert B (8 câu), C (5 câu) và điểm A theo chuẩn đầu ra.
assert.match(studioJs, /diem_A_theo_chuan/);
assert.match(studioJs, /likert\(row\.likert_b, 8\)/);
assert.match(studioJs, /likert\(row\.likert_c, 5\)/);

console.log('survey-class-link: ok');
