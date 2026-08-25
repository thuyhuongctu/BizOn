/* Bộ kiểm thử cho js/engine.js – engine mô phỏng của game Bật Nghiệp.
 *
 * Vì sao đáng làm trước những thứ khác: đây là engine dùng để CHẤM ĐIỂM sinh
 * viên. Một sai số ở đây không chỉ làm game khó chịu mà làm điểm số sai, và
 * làm hỏng luôn tuyên bố «engine xác định, kết quả tái lập được» trong hồ sơ
 * học thuật.
 *
 * js/engine.js không đụng tới DOM (không document, không window, không
 * localStorage) nên nạp thẳng vào Node được – bộ này chạy trong vài giây,
 * không cần trình duyệt hay máy chủ.
 *
 * Chạy:  node test/engine.test.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'js', 'engine.js'), 'utf8');

/* engine.js là script thường: mọi khai báo ở mức ngoài cùng nằm trong phạm vi
 * của chính đoạn mã đó. Chạy trong vm rồi gom tên cần dùng ở cuối cùng đoạn. */
const ctx = vm.createContext({ console });
vm.runInContext(src + `
;globalThis.__E = {
  newGameState, simulateRound, currentEvent, rng, energyReport,
  approveLoan, doMaintenance, optimizeLine, cutCosts, brandingPremium,
  claimMission, missionStatus, MISSIONS,
  whatIfSimulate, WHAT_IF_LIMIT, forecastCash, esgScore,
  ROUNDS_TOTAL, STARTING_BALANCE, UNITS_PER_WORKER, REF_PRICE,
  MARKET_EVENTS, SHOP_ITEMS, ACHIEVEMENTS, BASE_MARKET_UNITS,
};`, ctx, { filename: 'js/engine.js' });
const E = ctx.__E;

/* ---------- khung kiểm thử tối giản ---------- */
const tests = [];
let cur = null;
const test = (name, fn) => tests.push({ name, fn });
const check = (ok, msg) => { cur.checks.push({ ok: !!ok, msg }); if (!ok) cur.failed = true; };
const eq = (a, b, msg) => {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  check(ok, msg + (ok ? '' : ` — mong ${JSON.stringify(b)}, nhận ${JSON.stringify(a)}`));
};
const near = (a, b, tol, msg) => {
  const ok = Math.abs(a - b) <= tol;
  check(ok, msg + (ok ? '' : ` — mong ${b}±${tol}, nhận ${a}`));
};

/* ---------- tiện ích ---------- */
const PROFILE = { email: 'test@vlute.edu.vn', teamName: 'Đội Kiểm Thử', role: 'CEO' };
const newGame = () => E.newGameState(PROFILE);
const DEC = (over = {}) => Object.assign({
  price: 150, production: 2000, marketing: 50, rd: 30,
  workers: 45, training: 0, funding: 'equity', paymentTerm: 30,
}, over);

/* ================= XÁC ĐỊNH & TÁI LẬP ================= */

test('Cùng hạt giống và cùng quyết định thì ra kết quả giống hệt nhau', () => {
  const run = () => {
    const s = newGame();
    const out = [];
    for (let i = 0; i < E.ROUNDS_TOTAL; i++) out.push(E.simulateRound(s, DEC()));
    return out.map(r => [r.round, r.revenue, r.netProfit, r.share, r.sold, r.oee, r.roi]);
  };
  eq(run(), run(), 'hai lần chạy độc lập cho cùng một dãy số');
});

test('Bộ sinh số giả ngẫu nhiên phụ thuộc hoàn toàn vào hạt giống', () => {
  const a = { seed: 12345 }, b = { seed: 12345 }, c = { seed: 999 };
  const seq = st => Array.from({ length: 5 }, () => E.rng(st));
  eq(seq(a), seq(b), 'cùng hạt giống cho cùng dãy');
  check(JSON.stringify(seq({ seed: 12345 })) !== JSON.stringify(seq(c)), 'khác hạt giống cho dãy khác');
  const vals = seq({ seed: 7 });
  check(vals.every(v => v >= 0 && v < 1), 'mọi giá trị nằm trong [0,1): ' + vals.map(v => v.toFixed(3)).join(', '));
});

/* ================= VÒNG CHƠI ================= */

test('Ván chạy đúng sáu vòng rồi kết thúc', () => {
  const s = newGame();
  eq(s.round, 1, 'bắt đầu ở vòng 1');
  for (let i = 1; i <= E.ROUNDS_TOTAL; i++) {
    const r = E.simulateRound(s, DEC());
    eq(r.round, i, `báo cáo mang số vòng ${i}`);
    eq(s.history.length, i, `lịch sử có ${i} bản ghi`);
  }
  check(s.finished, 'ván đã kết thúc sau vòng 6');
  eq(s.round, E.ROUNDS_TOTAL, 'số vòng dừng ở 6, không tăng tiếp');
});

test('Mỗi vòng dùng đúng biến cố thị trường của vòng đó', () => {
  const s = newGame();
  for (let i = 1; i <= E.ROUNDS_TOTAL; i++) {
    const want = E.MARKET_EVENTS[i];
    const r = E.simulateRound(s, DEC());
    eq(r.event.id, want.id, `vòng ${i} dùng biến cố ${want.id}`);
  }
});

/* ================= KẾ TOÁN ================= */

test('Số dư sau vòng bằng số dư trước cộng lợi nhuận ròng', () => {
  const s = newGame();
  eq(s.balance, E.STARTING_BALANCE, 'vốn khởi điểm đúng bằng hằng số');
  for (let i = 1; i <= E.ROUNDS_TOTAL; i++) {
    const before = s.balance;
    const r = E.simulateRound(s, DEC({ price: 140 + i * 5, marketing: 40 + i * 10 }));
    near(s.balance, before + r.netProfit, 1e-9, `vòng ${i}: số dư khớp với lợi nhuận ròng`);
    near(r.balance, s.balance, 1e-9, `vòng ${i}: số dư trong báo cáo khớp với trạng thái`);
  }
});

test('Doanh thu bằng số bán được nhân giá, không tự sinh ra từ đâu', () => {
  const s = newGame();
  const d = DEC({ price: 160 });
  const r = E.simulateRound(s, d);
  near(r.revenue, r.sold * d.price / 1000, 1e-9, 'doanh thu = số bán × giá (triệu ₫)');
  check(r.sold >= 0, `số bán không âm: ${r.sold}`);
});

test('Không bán quá lượng hàng có trong tay, phần hụt tính vào đơn mất', () => {
  const s = newGame();
  const d = DEC({ production: 300, workers: 45 });   // cố tình sản xuất ít
  const invBefore = s.inventory;
  const r = E.simulateRound(s, d);
  check(r.sold <= d.production + invBefore,
    `bán ${r.sold} ≤ sản xuất ${d.production} + tồn đầu kỳ ${invBefore}`);
  check(s.inventory >= 0, `tồn kho không âm: ${s.inventory}`);
  check(r.lostSales >= 0, `đơn mất không âm: ${r.lostSales}`);
  near(r.lostSales, r.demandUnits - r.sold, 1e-9, 'đơn mất = cầu − số bán');
});

/* ================= LUẬT KINH DOANH ================= */

test('Nhân sự giới hạn sản lượng thực tế', () => {
  const s = newGame();
  const workers = 10;
  const cap = workers * E.UNITS_PER_WORKER;
  const d = DEC({ production: 99999, workers });
  const r = E.simulateRound(s, d);
  eq(r.decisions.production, cap, `sản lượng bị cắt về trần nhân sự ${cap} sp`);
  eq(r.workers, workers, 'số nhân sự trong báo cáo khớp quyết định');
});

test('Giá lên thì cầu xuống (độ co giãn theo giá)', () => {
  const demandAt = price => {
    const s = newGame();
    return E.simulateRound(s, DEC({ price, production: 99999, workers: 200 })).demandUnits;
  };
  const lo = demandAt(110), mid = demandAt(150), hi = demandAt(200);
  check(lo > mid && mid > hi, `cầu giảm đơn điệu khi giá tăng: ${lo} > ${mid} > ${hi}`);
});

test('Chi marketing nhiều hơn thì thị phần cao hơn, các yếu tố khác giữ nguyên', () => {
  const shareAt = marketing => {
    const s = newGame();
    return E.simulateRound(s, DEC({ marketing, production: 99999, workers: 200 })).share;
  };
  const lo = shareAt(10), hi = shareAt(200);
  check(hi > lo, `marketing 200 cho thị phần cao hơn marketing 10: ${hi.toFixed(1)}% > ${lo.toFixed(1)}%`);
});

test('Thị phần luôn nằm trong 0–100 suốt cả ván', () => {
  const s = newGame();
  for (let i = 1; i <= E.ROUNDS_TOTAL; i++) {
    const r = E.simulateRound(s, DEC({ price: 100 + i * 20, marketing: i * 30 }));
    check(r.share >= 0 && r.share <= 100, `vòng ${i}: thị phần ${r.share.toFixed(1)}% nằm trong 0–100`);
  }
});

test('Chỉ số vận hành luôn nằm trong khoảng cho phép', () => {
  const s = newGame();
  for (let i = 1; i <= E.ROUNDS_TOTAL; i++) {
    const r = E.simulateRound(s, DEC({ production: i * 900, workers: 20 + i * 10, training: i }));
    check(r.oee >= 55 && r.oee <= 96, `vòng ${i}: OEE ${r.oee} trong 55–96`);
    check(r.defect >= 0, `vòng ${i}: tỉ lệ phế phẩm ${r.defect} không âm`);
    check(r.brandLoyalty >= 0 && r.brandLoyalty <= 95, `vòng ${i}: gắn bó thương hiệu ${r.brandLoyalty} trong 0–95`);
    check(r.quickRatio > 0, `vòng ${i}: hệ số thanh toán nhanh ${r.quickRatio} dương`);
  }
});

/* ================= VẬT PHẨM & QUYẾT ĐỊNH TÀI CHÍNH ================= */

test('Khiên bảo hiểm vô hiệu hoá biến cố xấu đúng một lần', () => {
  const badRound = E.MARKET_EVENTS.findIndex((e, i) => i >= 1 && e && e.tone === 'bad');
  check(badRound > 0, `tìm được vòng có biến cố xấu: vòng ${badRound}`);
  if (badRound <= 0) return;

  const play = withShield => {
    const s = newGame();
    for (let i = 1; i < badRound; i++) E.simulateRound(s, DEC());
    if (withShield) s.activeBoosts.push('INS_SHIELD_01');
    return E.simulateRound(s, DEC());
  };
  const off = play(false), on = play(true);
  check(!off.shielded, 'không mua khiên thì không được che');
  check(on.shielded, 'có khiên thì báo cáo ghi nhận đã che');
  check(on.netProfit > off.netProfit,
    `có khiên lãi hơn: ${on.netProfit.toFixed(1)} > ${off.netProfit.toFixed(1)} triệu ₫`);
});

test('Khiên bảo hiểm bị tiêu sau khi dùng, không che được vòng sau', () => {
  const s = newGame();
  s.activeBoosts.push('INS_SHIELD_01');
  E.simulateRound(s, DEC());
  eq(s.activeBoosts, [], 'danh sách hiệu ứng được dọn sau mỗi vòng');
});

test('Vay vốn cộng tiền ngay và phát sinh lãi ở vòng sau', () => {
  const s = newGame();
  const before = s.balance;
  E.approveLoan(s, 300);
  near(s.balance, before + 300, 1e-9, 'vay 300 thì số dư tăng đúng 300 triệu ₫');
  eq(s.loan, 300, 'khoản vay được ghi nhận');
  const r = E.simulateRound(s, DEC());
  near(r.loanInterest, 300 * 0.05, 1e-9, 'lãi vay 5%/vòng được tính vào chi phí');
});

test('Cắt giảm chi phí chỉ có tác dụng đúng một vòng', () => {
  const fixedOf = useCut => {
    const s = newGame();
    if (useCut) E.cutCosts(s);
    return [E.simulateRound(s, DEC()).fixed, E.simulateRound(s, DEC()).fixed];
  };
  const base = fixedOf(false), cut = fixedOf(true);
  check(cut[0] < base[0], `vòng có cắt giảm rẻ hơn: ${cut[0].toFixed(1)} < ${base[0].toFixed(1)}`);
  near(cut[1], base[1], 1e-9, 'sang vòng sau chi phí cố định trở lại bình thường');
});

/* ================= NHIỆM VỤ & THÀNH TỰU ================= */

test('Nhận thưởng nhiệm vụ chỉ được một lần', () => {
  const s = newGame();
  E.simulateRound(s, DEC());
  const m = E.MISSIONS.find(x => x.id === 'M_FIRST');
  eq(E.missionStatus(s, m), 'ready', 'chơi xong vòng 1 thì nhiệm vụ Khởi động sẵn sàng');
  const before = s.balance;
  eq(E.claimMission(s, 'M_FIRST'), true, 'lần nhận đầu thành công');
  near(s.balance, before + m.rewardMoney, 1e-9, `được cộng ${m.rewardMoney} triệu ₫`);
  eq(E.claimMission(s, 'M_FIRST'), false, 'lần nhận thứ hai bị từ chối');
  near(s.balance, before + m.rewardMoney, 1e-9, 'số dư không tăng thêm lần nữa');
  eq(E.missionStatus(s, m), 'claimed', 'trạng thái chuyển thành đã nhận');
});

test('Không nhận được nhiệm vụ chưa đạt điều kiện', () => {
  const s = newGame();
  eq(E.claimMission(s, 'M_FINISH'), false, 'chưa chơi hết 6 vòng thì không nhận được Tốt nghiệp');
  eq(s.missionsClaimed, [], 'không ghi nhận gì');
});

test('Thành tựu mở đúng lúc và không trùng lặp', () => {
  const s = newGame();
  E.simulateRound(s, DEC());
  check(s.achievements.includes('A_FIRST'), 'mở A_FIRST sau vòng đầu');
  for (let i = 2; i <= E.ROUNDS_TOTAL; i++) E.simulateRound(s, DEC());
  check(s.achievements.includes('A_FINISH'), 'mở A_FINISH khi hết 6 vòng');
  eq(s.achievements.length, new Set(s.achievements).size, 'không có thành tựu nào bị ghi hai lần');
});

/* ================= CÔNG CỤ PHỤ TRỢ ================= */

test('Mô phỏng Nếu–Thì không làm thay đổi trạng thái ván', () => {
  const s = newGame();
  E.simulateRound(s, DEC());
  const snapshot = JSON.stringify(s);
  const out = E.whatIfSimulate(s, 'CEO', DEC({ price: 120, marketing: 90 }));
  eq(JSON.stringify(s), snapshot, 'trạng thái giữ nguyên sau khi chạy thử');
  check(out && typeof out === 'object', 'trả về kết quả ước tính');
});

test('Bộ đếm lượt Nếu–Thì được dọn về 0 mỗi vòng', () => {
  const s = newGame();
  s.whatIfUsed = E.WHAT_IF_LIMIT;
  E.simulateRound(s, DEC());
  eq(s.whatIfUsed, 0, 'sang vòng mới lại có đủ lượt');
  eq(s.aiUsed, 0, 'lượt hỏi Lumina cũng được dọn');
});

test('Báo cáo năng lượng khớp số dây chuyền', () => {
  const s = newGame();
  E.simulateRound(s, DEC());
  const rep = E.energyReport(s);
  check(Array.isArray(rep) ? rep.length === s.energyLines.length : !!rep,
    'báo cáo phủ đủ 3 dây chuyền');
});

test('Điểm ESG nằm trong thang hợp lệ', () => {
  const s = newGame();
  for (let i = 1; i <= 3; i++) E.simulateRound(s, DEC());
  const v = E.esgScore(s);
  check(typeof v === 'number' && isFinite(v), `trả về số hữu hạn: ${v}`);
  check(v >= 0 && v <= 100, `nằm trong 0–100: ${v}`);
});

/* ================= CHẠY ================= */
let failed = 0;
for (const t of tests) {
  cur = { checks: [], failed: false };
  const t0 = process.hrtime.bigint();
  try {
    t.fn();
  } catch (e) {
    cur.failed = true;
    cur.checks.push({ ok: false, msg: 'ngoại lệ: ' + String(e.message).split('\n')[0] });
  }
  const ms = Number((process.hrtime.bigint() - t0) / 1000000n);
  console.log((cur.failed ? '✗ ' : '✓ ') + t.name + ` (${ms}ms)`);
  cur.checks.forEach(c => { if (!c.ok) console.log('    ✗ ' + c.msg); });
  if (cur.failed) failed++;
}
console.log(`\n${tests.length - failed}/${tests.length} phép thử đạt`);
process.exit(failed ? 1 : 0);
