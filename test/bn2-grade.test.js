/* Bộ kiểm thử cho js/bn2-grade.js – bảng điểm dự kiến ở màn tổng kết của bat-nghiep-v2.html.
 *
 * Bảng điểm không có công thức riêng: nó dựng lại dữ liệu nộp bài từ S.history rồi gọi đúng
 * BizOnInstructorPage.grades() của Trang Giảng viên. Bộ này kiểm rằng:
 *  - B2, B3, B4, B6 (phần không cần nhật ký) trùng với điểm giảng viên chấm từ cùng dữ liệu nộp bài;
 *  - B1 chỉ được tính khi có ≥ 3 đội khác trong lớp, và khi ấy trùng xếp hạng của giảng viên;
 *  - khoảng điểm luôn chứa điểm giảng viên có thể cho, với mọi giá trị B5 và «Chuẩn bị».
 * Chạy:  node test/bn2-grade.test.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const ctx = { console, T: (vi) => vi, currentLang: () => 'vi', document: { getElementById: () => null, addEventListener() {} } };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(read('js/engine.js'), ctx, { filename: 'js/engine.js' });
vm.runInContext(read('js/bizon-grading.js'), ctx, { filename: 'js/bizon-grading.js' });
vm.runInContext(read('js/bn2-grade.js'), ctx, { filename: 'js/bn2-grade.js' });
const P = ctx.BizOnInstructorPage, G = ctx.BN2Grade;
const N = vm.runInContext('ROUNDS_TOTAL', ctx);

const tests = [];
let cur = null;
const test = (name, fn) => tests.push({ name, fn });
const check = (ok, msg) => { cur.checks.push({ ok: !!ok, msg }); if (!ok) cur.failed = true; };
const near = (a, b, msg) => check(Math.abs(a - b) < 1e-9, msg + ` — mong ${b}, nhận ${a}`);

// Chơi trọn ván với quyết định khác nhau theo đội, để điểm các đội trải rộng.
function finished(team, k) {
  const s = ctx.newGameState({ email: 'sv@student.ctu.edu.vn', teamName: team, role: 'CEO', classId: 'KT330H-TEST' });
  s.profile.classId = 'KT330H-TEST';
  for (let i = 0; i < N; i++) {
    const r = ctx.simulateRound(s, { price: 120 + k * 9, production: 1500 + k * 250, marketing: 30 + k * 12, rd: 20 + k * 5, workers: 40 + k, training: k % 3 ? 5 : 0, funding: 'equity', paymentTerm: 30 });
    s.conquest = s.conquest || []; s.conquest.push({ round: r.round, win: false });
  }
  return s;
}
// Dữ liệu nộp bài như js/backend.js gửi lên (để giảng viên chấm độc lập với bn2-grade.js).
function submissions(s) {
  return s.history.map(r => ({ team_name: s.profile.teamName, round_number: r.round, created_at: '', student_email: 'sv@student.ctu.edu.vn',
    result_json: { round: r.round, eventId: r.event && r.event.id, netProfit: r.netProfit, share: r.share, oee: r.oee, quickRatio: r.quickRatio,
      defect: r.defect, ach: s.achievements.length, win: false } }));
}

const CLASS = Array.from({ length: 8 }, (_, k) => finished('Đội ' + (k + 1), k));
const board = CLASS.map(s => ({ team_name: s.profile.teamName, round: 6, total_profit: s.history.reduce((a, r) => a + r.netProfit, 0), last_share: s.history[5].share }));

test('B2, B3, B4, B6 trùng điểm giảng viên chấm từ cùng dữ liệu nộp bài', () => {
  const teacher = P.grades(P.teams(CLASS.flatMap(submissions)), [], {}, []);
  CLASS.forEach(s => {
    const c = G.compute(s, null), t = teacher.find(x => x.name === s.profile.teamName);
    for (const k of ['b2', 'b3', 'b4', 'b6']) near(c.g[k], t[k], `${s.profile.teamName} ${k}`);
  });
});

test('B1 để trống khi chưa đủ 3 đội khác, và trùng xếp hạng của giảng viên khi đủ', () => {
  const teacher = P.grades(P.teams(CLASS.flatMap(submissions)), [], {}, []);
  CLASS.forEach(s => {
    const few = G.compute(s, board.slice(0, 3)); // có thể chỉ còn 2 đội khác nếu đội này nằm trong 3 dòng đầu
    const othersFew = board.slice(0, 3).filter(r => r.team_name !== s.profile.teamName).length;
    check(few.classKnown === (othersFew >= 3), `${s.profile.teamName}: ${othersFew} đội khác → ${othersFew >= 3 ? 'tính' : 'để trống'} B1`);
    const all = G.compute(s, board), t = teacher.find(x => x.name === s.profile.teamName);
    check(all.classKnown, `${s.profile.teamName}: đủ lớp thì tính B1`);
    near(all.b1[0], t.b1, `${s.profile.teamName} B1 khi đủ lớp`);
  });
});

test('Khoảng điểm chứa mọi điểm giảng viên có thể cho (mọi B5, có hoặc không «Chuẩn bị»)', () => {
  const teacher = P.grades(P.teams(CLASS.flatMap(submissions)), [], {}, []);
  CLASS.forEach(s => {
    const c = G.compute(s, board), t = teacher.find(x => x.name === s.profile.teamName);
    for (const b5 of [0, 0.4, 0.95, 1.5]) for (const prep of [0, 0.2]) {
      const tot = t.b1 + t.b2 + t.b3 + t.b4 + b5 + t.b6 + prep;
      check(tot >= c.lo - 1e-9 && tot <= c.hi + 1e-9, `${s.profile.teamName}: ${tot.toFixed(2)} nằm trong ${c.lo.toFixed(2)}–${c.hi.toFixed(2)}`);
    }
  });
});

test('Không có lịch sử thì không vẽ gì; ván không Mã lớp ghi rõ là không tính điểm', () => {
  const s0 = ctx.newGameState({ email: 'a', teamName: 'X', role: 'CEO' });
  check(G.html(s0) === '', 'ván chưa chơi: chuỗi rỗng');
  const s = finished('Thử', 2); s.profile.classId = '';
  check(/không tính điểm/.test(G.html(s)), 'ván chơi thử có dòng «không tính điểm»');
  check(!/không tính điểm/.test(G.html(finished('Lớp thật', 2))), 'ván có Mã lớp không có dòng ấy');
});

test('Phiếu in: có dấu «dự kiến», số liệu thật của ván, thoát ký tự tên đội, không có ô chữ ký hay tên trường', () => {
  const s = finished('Đội <b>X</b> & "Y"', 3);
  const h = G.sheet(s);
  check(/DỰ KIẾN – KHÔNG PHẢI ĐIỂM CHÍNH THỨC/.test(h), 'có dấu dự kiến');
  check(h.includes('Đội &lt;b&gt;X&lt;/b&gt; &amp; &quot;Y&quot;') && !h.includes('<b>X</b>'), 'tên đội đã thoát ký tự');
  check(s.history.every(r => h.includes(r.event.name.replace(/&/g, '&amp;'))), 'đủ tên biến cố 6 vòng');
  check(!/chữ ký|ký tên|ký và ghi|đóng dấu|signature/i.test(h), 'không có ô chữ ký');
  check(!/data-bn2-print/.test(h), 'không in kèm nút in');
  check((h.match(/<tr>/g) || []).length >= 6 + 6, 'đủ 6 dòng vòng chơi và 6 dòng tiêu chí');
});

let failed = 0;
for (const t of tests) {
  cur = { checks: [], failed: false };
  try { t.fn(); } catch (err) { cur.failed = true; cur.checks.push({ ok: false, msg: 'ngoại lệ: ' + String(err && err.stack || err).split('\n').slice(0, 3).join(' | ') }); }
  console.log((cur.failed ? '✗ ' : '✓ ') + t.name);
  cur.checks.filter(c => !c.ok).slice(0, 8).forEach(c => console.log('    ✗ ' + c.msg));
  if (cur.failed) failed++;
}
console.log(`\n${tests.length - failed}/${tests.length} phép thử đạt`);
process.exit(failed ? 1 : 0);
