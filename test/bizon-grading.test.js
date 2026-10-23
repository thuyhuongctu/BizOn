'use strict';
// Kiểm tra js/bizon-grading.js (Trang Giảng viên – chấm Bật Nghiệp) với các lỗi gặp khi chấm lớp KT330H-M02.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ctx = { window: {}, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'bizon-grading.js'), 'utf8'), ctx);
const P = ctx.window.BizOnInstructorPage;
assert.ok(P && typeof P.grades === 'function', 'module xuất BizOnInstructorPage');

const sub = (team, round, j, email) => ({ team_name: team, round_number: round, created_at: `2026-10-16T0${round}:00:00Z`,
  student_email: email || 'x@student.ctu.edu.vn', result_json: Object.assign({ netProfit: 10, share: 26, oee: 86, quickRatio: 1.2 }, j) });
const six = (team, j, email) => [1, 2, 3, 4, 5, 6].map(r => sub(team, r, j, email));

// 1) Làm tròn half-up: 5,45 phải thành 5,5 (C), không phải 5,4 (D+).
assert.equal(P.letter(5.45).l, 'C');
assert.equal(P.letter(4.95).l, 'D+');
assert.equal(P.f1(5.45), '5,5');

// 2) Tên đội khác hoa/thường được gộp làm một đội, giữ cách viết gặp đầu tiên.
let T = P.teams([...six('Clayholic CN1', {}), sub('CLAYHOLIC CN1', 7, {}), sub(' clayholic  cn1 ', 8, {})]);
assert.equal(T.length, 1);
assert.equal(T[0].name, 'Clayholic CN1');
assert.equal(T[0].rs.length, 8);

// 3) Đội giảng viên không tham gia xếp hạng B1.
const subs = [
  ...six('A', { netProfit: 100 }), ...six('B', { netProfit: 80 }), ...six('C', { netProfit: 60 }), ...six('D', { netProfit: 40 }),
  ...six('GV ADMIN', { netProfit: 90 }, 'thuyhuongctu@gmail.com'),
];
T = P.teams(subs);
let G = P.grades(T, [], {}, []);
const b1 = Object.fromEntries(G.map(g => [g.name, g.b1]));
assert.equal(T.find(t => t.name === 'GV ADMIN').staff, true);
assert.deepEqual([b1.A, b1.B, b1.C, b1.D], [2, 1.5, 1, 0.5], 'xếp hạng 4 đội SV như khi không có đội GV');
// Đội chỉ do email giảng viên chơi cũng là đội GV, dù tên khác.
assert.equal(P.teams(six('Thử nghiệm', {}, 'patu@ctu.edu.vn'))[0].staff, true);

// 4) B4 và phần lỗi sản phẩm của B3 đọc từ kết quả vòng cuối.
T = P.teams(six('E', { ach: 7, defect: 1.5 }));
G = P.grades(T, [], {}, []);
assert.equal(G[0].b4, 1.05);
assert.equal(G[0].b3, 1 + 0.4 + 0.6);
assert.equal(G[0].missing, false);

// 5) Nhật ký thành viên: cùng MSSV (email gõ thiếu một lần) là một người; tên đội khác hoa/thường vẫn khớp.
T = P.teams(six('PHUSA', {}));
const log = [
  { team_name: 'PHUSA', member_email: 'vanab2400001@student.ctu.edu.vn', role: 'CFO', round_number: 1, kind: 'proposal', payload: {}, created_at: '2026-10-16T00:30:00Z' },
  { team_name: 'phusa', member_email: 'vanab2400001@student', role: 'CFO', round_number: 2, kind: 'proposal', payload: {}, created_at: '2026-10-16T01:30:00Z' },
  { team_name: 'PHUSA', member_email: 'vanab2400001@student.ctu.edu.vn', role: 'CFO', round_number: 3, kind: 'proposal', payload: {}, created_at: '2026-10-16T02:30:00Z' },
];
const MB = P.members(T, log);
assert.equal(MB.length, 1, 'gộp thành 1 thành viên');
assert.equal(MB[0].p, 3);
assert.equal(MB[0].team, 'PHUSA');
const act = P.memberActivity(log);
assert.equal(act.length, 1);
assert.equal(act[0].team, 'PHUSA');

console.log('bizon-grading: OK');
