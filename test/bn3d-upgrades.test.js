// Bật Nghiệp 3D («BizOn Game 3D.html») dùng chung các nâng cấp của bat-nghiep-v2.html:
// lời Lumina về cú sốc thị trường, bảng điểm dự kiến B1–B6 và phiếu in A4, cùng một bộ chấm với Trang Giảng viên.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const g3d = read('BizOn Game 3D.html');
const v2 = read('bat-nghiep-v2.html');
const grade = read('js/bn2-grade.js');
const gradeCss = read('css/bn2-grade.css');
const bn2Css = read('css/bn2.css');

// Bộ chấm duy nhất + bảng điểm dự kiến, nạp trước module 3D.
const iGrading = g3d.indexOf('<script src="js/bizon-grading.js"></script>');
const iBn2 = g3d.indexOf('<script src="js/bn2-grade.js"></script>');
assert.ok(iGrading > 0 && iBn2 > iGrading, 'nạp bizon-grading.js rồi bn2-grade.js');
assert.ok(iBn2 < g3d.indexOf('<script type="module">'), 'nạp trước module 3D');
assert.match(g3d, /href="css\/bn2-grade\.css"/);
assert.match(v2, /href="css\/bn2-grade\.css"/);

// Màn tổng kết 3D: bảng điểm, đọc bảng xếp hạng lớp qua backend của khung game, nút in truyền S của khung game.
assert.match(g3d, /\$\{window\.BN2Grade \? BN2Grade\.html\(s\) : ''\}/);
assert.match(g3d, /BN2Grade\.load\(s, W\.BizonBackend\)/);
assert.match(g3d, /closest\('\[data-bn2-print\]'\)[\s\S]{0,120}BN2Grade\.printSheet\(s\)/);

// Lumina ứng phó cú sốc: cả thẻ biến cố ở trụ sở lẫn thẻ ở phòng đối đầu.
assert.match(g3d, /function shockNotes\(\)/);
assert.match(g3d, /BizonMarket\.activeShocks\(S\)/);
assert.equal((g3d.match(/\$\{shockNotes\(\)\}/g) || []).length, 2, 'shockNotes ở 2 thẻ biến cố');

// Đăng nhập 3D nhận cả email nghiên cứu sinh @gstudent.ctu.edu.vn.
assert.match(g3d, /\/@g\?student\\\.ctu\\\.edu\\\.vn\$\/i/);

// bn2-grade.js chạy được ở trang không có T()/currentLang() và nhận backend truyền vào.
assert.match(grade, /localStorage\.getItem\('bizon-lang'\) === 'en'/);
assert.match(grade, /function load\(s, backend\)/);
assert.match(grade, /B\.classLeaderboard\(cls\)/);

// CSS bảng điểm + phiếu in nằm ở một tệp dùng chung, không còn trùng trong bn2.css; khối @media print đóng đủ.
assert.match(gradeCss, /@media print\{/);
assert.match(gradeCss, /body\.bn2-printing>\*:not\(#bn2-print-sheet\)/);
assert.doesNotMatch(bn2Css, /bn2-print-sheet|bn2-grade-total/);
const depth = css => [...css.replace(/\/\*[\s\S]*?\*\//g, '')].reduce((d, c) => d + (c === '{') - (c === '}'), 0);
assert.equal(depth(gradeCss), 0, 'ngoặc cân trong bn2-grade.css');
assert.equal(depth(bn2Css), 0, 'ngoặc cân trong bn2.css');

console.log('bn3d-upgrades: ok');
