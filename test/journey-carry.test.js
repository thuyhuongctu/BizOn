'use strict';
// Hành trình 3 bậc – hàm thuần journeyCarry (docs/architecture/HANH-TRINH-3-BAC.md mục 4, 8, 9).
const assert = require('node:assert/strict');
const J = require('../js/core/journey.js');

const P = J.PARAMS;
const base = () => J.createPassport({ classCode: 'QTKD-K48', teamName: 'Đội Phù Sa', createdAt: '2026-11-03T02:10:00Z' });

// Ba hồ sơ Bến Phù Sa: yếu / trung bình / mạnh.
const BPS = {
  weak: { total: 1.1, result: { eff: 20, rank: 4 }, history: [{ w: 1, m: 1, menu: 0, loc: 0, net: 0.2 }, { w: 2, m: 1, menu: 0, loc: 0, net: 0.3 }, { w: 3, m: 1, menu: 1, loc: 1, net: 0.2 }, { w: 4, m: 1, menu: 1, loc: 1, net: 0.2 }, { w: 5, m: 1, menu: 1, loc: 1, net: 0.2 }], knownPairs: { '0-0': true } },
  mid: { total: 4.2, result: { eff: 71, rank: 2 }, history: [{ w: 1, m: 0, menu: 0, loc: 2, net: 0.6 }, { w: 2, m: 2, menu: null, loc: null, net: -0.1 }, { w: 3, m: 0, menu: 1, loc: 4, net: 0.8 }, { w: 4, m: 1, menu: 1, loc: 4, net: 1.5 }, { w: 5, m: 1, menu: 1, loc: 4, net: 1.4 }], knownPairs: { '0-2': true, '1-4': true, '2-1': true } },
  strong: { total: 5.9, result: { eff: 100, rank: 1 }, history: [{ w: 1, m: 0, menu: 2, loc: 1, net: 0.9 }, { w: 2, m: 0, menu: 2, loc: 1, net: 1 }, { w: 3, m: 1, menu: 2, loc: 1, net: 1.3 }, { w: 4, m: 1, menu: 2, loc: 1, net: 1.3 }, { w: 5, m: 1, menu: 2, loc: 1, net: 1.4 }], knownPairs: { '2-1': true, '0-0': true, '1-3': true, '2-2': true } }
};
// Ba hồ sơ Bật Nghiệp.
const hist = (profits, share, oee) => profits.map(p => ({ netProfit: p, share, oee }));
const BN = {
  weak: { balance: 380, history: hist([-20, -30, 5, -10, -25, -40], 14, 70), brand: 0.95, quickRatio: 0.8, loan: 60, rdCumulative: 10, caseId: 'B' },
  mid: { balance: 612, history: hist([10, 20, 15, 25, -4, 30], 31.5, 88), brand: 1.22, quickRatio: 1.3, loan: 0, rdCumulative: 60, caseId: 'A' },
  strong: { balance: 1200, history: hist([80, 90, 100, 110, 120, 200], 44, 93), brand: 1.9, quickRatio: 2.4, loan: 0, rdCumulative: 240, caseId: 'A' }
};

(function emptyPassport() {
  const p = base();
  for (const t of ['t2', 't3']) { const c = J.journeyCarry(p, t); assert.equal(c.empty, true); assert.deepEqual(c.applied, {}); assert.deepEqual(c.lines, []); }
  assert.equal(J.nextTier(p), 't1');
  assert.equal(J.canPlay(p, 't1'), true); assert.equal(J.canPlay(p, 't2'), false, 'không bỏ qua bậc'); assert.equal(J.canPlay(p, 't3'), false);
})();

(function tier1ToTier2() {
  const w = J.recordTier1(base(), BPS.weak), m = J.recordTier1(base(), BPS.mid), s = J.recordTier1(base(), BPS.strong);
  // yếu: eff 20 → +8, hạng 4 → brand 1, 1 cặp → không bản tin
  assert.deepEqual(J.journeyCarry(w, 't2').applied, { balanceBonus: 8, balance: 508, brand: 1, marketBrief: false });
  // trung bình: eff 71 → +28, hạng 2 → 1,05, 3 cặp → bản tin
  assert.deepEqual(J.journeyCarry(m, 't2').applied, { balanceBonus: 28, balance: 528, brand: 1.05, marketBrief: true });
  // mạnh: eff 100 → 40 + 10 = 50 = trần
  const cs = J.journeyCarry(s, 't2');
  assert.deepEqual(cs.applied, { balanceBonus: 50, balance: 550, brand: 1.05, marketBrief: true });
  assert.equal(cs.applied.balanceBonus, P.T1_CASH_MAX);
  assert.equal(cs.lines.length, 3); assert.match(cs.lines[0].vi, /vốn khởi điểm 550 triệu ₫/); assert.match(cs.lines[0].en, /starting capital 550m/);
  // hộ chiếu ghi sẵn hành trang và hồ sơ phong cách
  assert.deepEqual(m.carry.t2, { balanceBonus: 28, balance: 528, brand: 1.05, marketBrief: true });
  assert.deepEqual(m.tiers.t1.style, { exploreWeeks: 2, exploitWeeks: 2, surveyWeeks: 1 });
  assert.deepEqual(m.tiers.t1.knownPairs, ['0-2', '1-4', '2-1']);
  assert.equal(m.summary.effectuationIndex, 0.6);
  assert.equal(J.nextTier(m), 't2'); assert.equal(J.canPlay(m, 't2'), true); assert.equal(J.canPlay(m, 't3'), false, 'chưa xong Bậc 2 thì chưa vào Bậc 3');
  // trần tuyệt đối: eff quá 100 / hạng lạ vẫn trong trần
  const odd = J.recordTier1(base(), { total: 9, result: { eff: 500, rank: 0 }, history: [], knownPairs: {} });
  assert.equal(J.journeyCarry(odd, 't2').applied.balanceBonus, 50);
})();

(function tier2ToTier3Durian() {
  const p1 = J.recordTier1(base(), BPS.mid);
  const w = J.recordTier2(p1, BN.weak), m = J.recordTier2(p1, BN.mid), s = J.recordTier2(p1, BN.strong);
  // mặc định biến thể Sầu Riêng
  assert.equal(J.DEFAULT_T3_VARIANT, 'durian'); assert.equal(w.tiers.t3.variant, 'durian');
  // yếu: k = (380−500)/500 = −0,24 → kẹp −0,15; brand < 1 → rep 0; quick 0,8 và nợ → resil −3; R&D 10 → ứng phó round(0,5) = 1; 1/6 lãi → không liên kết; nợ → tín dụng −1
  assert.deepEqual(J.journeyCarry(w, 't3').applied, { variant: 'durian', cashMul: 0.85, cash0: 12, cash: 10.2, rep: 0, resil: -3, adapt: 1, linkedBonus: 0, creditLimitAdj: -1 });
  // trung bình: k = 0,224 → kẹp 0,15; brand 1,22 → round(5×0,44) = 2; quick 1,3 → +3; R&D 60 → ứng phó +3; 5/6 lãi → liên kết
  assert.deepEqual(J.journeyCarry(m, 't3').applied, { variant: 'durian', cashMul: 1.15, cash0: 12, cash: 13.8, rep: 2, resil: 3, adapt: 3, linkedBonus: 0.05, creditLimitAdj: 0 });
  // mạnh: mọi khoản chạm trần
  const cs = J.journeyCarry(s, 't3');
  assert.deepEqual(cs.applied, { variant: 'durian', cashMul: 1.15, cash0: 12, cash: 13.8, rep: 5, resil: 3, adapt: 5, linkedBonus: 0.05, creditLimitAdj: 0 });
  assert.ok(Math.abs(cs.applied.cash / 12 - 1) <= P.T2_CASH_CAP + 1e-9, 'tiền ≤ ±15 %');
  // vai có cashAdj (HTX −2 tỷ): nhân trên vốn đã điều chỉnh, đơn vị tỷ ₫
  assert.deepEqual(J.journeyCarry(m, 't3', { cashAdj: -2 }).applied.cash, 11.5);
  assert.equal(J.journeyCarry(m, 't3', { cashAdj: 6 }).applied.cash0, 18);
  // dòng giải thích VI/EN
  const lines = J.journeyCarry(m, 't3').lines; assert.equal(lines.length, 5);
  assert.match(lines[0].vi, /×1\.15 = 13\.8 tỷ ₫/); assert.match(lines[3].en, /event response \+3/);
  assert.equal(m.tiers.t2.profitableRounds, 5); assert.equal(m.tiers.t2.netProfitTotal, 96);
  assert.equal(J.nextTier(m), 't3'); assert.equal(J.canPlay(m, 't3'), true);
})();

(function tier2ToTier3Brand() {
  const p = J.setTier3Variant(J.recordTier2(J.recordTier1(base(), BPS.mid), BN.mid), 'brand');
  const c = J.journeyCarry(p, 't3');
  assert.deepEqual(c.applied, { variant: 'brand', cashMul: 1.15, cash0: 8, cash: 9.2, rep: 2, resil: 3, capab: 3, net: [{ market: 5, add: 5 }, { market: 2, add: 5 }] });
  assert.deepEqual(p.carry.t3, c.applied, 'đổi biến thể thì tính lại hành trang đã lưu');
  const strong = J.setTier3Variant(J.recordTier2(J.recordTier1(base(), BPS.strong), BN.strong), 'brand');
  assert.equal(J.journeyCarry(strong, 't3').applied.capab, 5, 'năng lực trần +5');
  const weak = J.setTier3Variant(J.recordTier2(J.recordTier1(base(), BPS.weak), BN.weak), 'brand');
  assert.deepEqual(J.journeyCarry(weak, 't3').applied.net, []);
  assert.equal(J.journeyCarry(weak, 't3').applied.cash, 6.8);
})();

(function deterministic() {
  const p = J.recordTier2(J.recordTier1(base(), BPS.mid), BN.mid);
  assert.deepEqual(J.journeyCarry(p, 't3'), J.journeyCarry(p, 't3'));
  assert.deepEqual(J.journeyCarry(p, 't2'), J.journeyCarry(p, 't2'));
  const q = JSON.parse(JSON.stringify(p)); assert.deepEqual(J.journeyCarry(q, 't3').applied, J.journeyCarry(p, 't3').applied, 'qua JSON vẫn giống');
})();

(function carryDisabled() {
  const p = J.recordTier1(base(), BPS.mid);
  const off = J.journeyCarry(p, 't2', { enabled: false });
  assert.equal(off.enabled, false); assert.deepEqual(off.applied, {}); assert.deepEqual(off.lines, []);
  assert.deepEqual(off.preview, { balanceBonus: 28, balance: 528, brand: 1.05, marketBrief: true }, 'vẫn xem trước để giải thích cho người chơi');
  const p2 = J.createPassport({ classCode: 'QTKD-K48', teamName: 'A', carryEnabled: false });
  assert.equal(J.journeyCarry(J.recordTier1(p2, BPS.mid), 't2').empty, true);
  // Lớp chấm điểm mặc định TẮT; tự học mặc định bật; cờ lớp quyết định khi có.
  assert.equal(J.resolveCarryEnabled(p, undefined), false, 'mã lớp thật, chưa có cờ → tắt');
  assert.equal(J.resolveCarryEnabled(p, { journey_carry: true }), true);
  assert.equal(J.resolveCarryEnabled(p, { journey_carry: false }), false);
  assert.equal(J.resolveCarryEnabled(J.createPassport({}), undefined), true, 'tự học → bật');
  assert.equal(J.resolveCarryEnabled(J.createPassport({ classCode: 'DEMO-2026' }), undefined), true);
  assert.equal(J.resolveCarryEnabled(p2, { journey_carry: true }), false, 'hộ chiếu tắt thì lớp bật cũng không áp');
})();

(function applyHelpers() {
  const p = J.recordTier2(J.recordTier1(base(), BPS.mid), BN.mid);
  // Bậc 2: chỉ đổi balance/brand khởi điểm + cờ bản tin
  const s2 = J.applyToTier2({ balance: 500, brand: 1.0, round: 1 }, J.journeyCarry(p, 't2'));
  assert.equal(s2.balance, 528); assert.equal(s2.brand, 1.05); assert.equal(s2.round, 1); assert.equal(s2.journey.marketBrief, true);
  // Sầu Riêng: cash, rep, resil, ứng phó; KHÔNG chạm tài sản (kiểm nghiệm là mở khóa kênh); liên kết; ghi hạn mức
  const d = J.applyToDurian({ cash: 12, rep: 50, resil: 50, adapt: 40, assets: { test: 0 }, linkedBonus: 0 }, J.journeyCarry(p, 't3', { variant: 'durian' }));
  assert.deepEqual([d.cash, d.rep, d.resil, d.adapt, d.assets.test, d.linkedBonus, d.journey.creditLimitAdj], [13.8, 52, 53, 43, 0, 0.05, 0]);
  // Thương Hiệu: cash, rep, resil, capab, net ở hai thị trường gần
  const b = J.applyToBrand({ cash: 8, rep: 50, resil: 50, capab: 40, net: [10, 10, 10, 10, 10, 10, 10] }, J.journeyCarry(p, 't3', { variant: 'brand' }));
  assert.deepEqual([b.cash, b.rep, b.resil, b.capab], [9.2, 52, 53, 43]); assert.deepEqual(b.net, [10, 10, 15, 10, 10, 15, 10]);
  // hành trang rỗng → trạng thái y nguyên
  const same = J.applyToTier2({ balance: 500, brand: 1 }, J.journeyCarry(base(), 't2')); assert.deepEqual(same, { balance: 500, brand: 1 });
})();

(function researchSummary() {
  let p = J.recordTier2(J.recordTier1(base(), BPS.mid), Object.assign({}, BN.mid, { history: BN.mid.history.map((r, i) => Object.assign({}, r, { whatIfUsed: i % 2 })) }));
  assert.equal(p.summary.causationIndex, 0.5);
  const dur = J.recordTier3(p, 'durian', { total: 78.4, parts: { profit: 70 }, cash: 20.1, channelsUsed: ['DOM', 'CN'], channelOrder: ['DOM', 'BORDER', 'CN'], badges: ['resilient'] }, { roleId: 'packer' });
  assert.equal(dur.tiers.t3.status, 'done'); assert.equal(dur.summary.intlPattern, 'near-first'); assert.equal(J.nextTier(dur), null);
  assert.deepEqual(dur.tiers.t3.carryApplied, p.carry.t3, 'hành trang đã áp được ghi vào bậc 3');
  const leap = J.recordTier3(p, 'durian', { total: 60, channelOrder: ['CN', 'JP'] }); assert.equal(leap.summary.intlPattern, 'leapfrog');
  const br = J.recordTier3(J.setTier3Variant(p, 'brand'), 'brand', { total: 81, entered: [3, null, 2, null, null, 1, 4], cash: 10, rep: 60 });
  assert.equal(br.summary.intlPattern, 'near-first', 'vào Tân Cảng (q1) rồi Kim Sa (q2) trước');
  const mixed = J.recordTier3(J.setTier3Variant(p, 'brand'), 'brand', { total: 70, entered: [null, 2, 1, null, null, null, null] });
  assert.equal(mixed.summary.intlPattern, 'mixed');
})();

console.log('journey-carry: OK');
