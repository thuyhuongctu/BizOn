/* Kiểm thử Nhà máy FDI: tất định, kế toán khớp, quy tắc xuất xứ/thuế đúng, cân bằng chiến lược. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const E = require('../lab/nha-may-fdi-engine.js');
const D = require('../lab/nha-may-fdi-data.js');

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('ok -', name); };
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const DIV = { US: 45, EU: 30, JPKR: 20, CNAS: 25 };
const play = (ind, f, seed) => { let s = E.newGame(D, ind, seed === undefined ? 42 : seed); for (let q = 1; q <= D.events.length; q++) s = E.playQuarter(D, s, f(q)); return s; };

test('Kịch bản có đủ 8 quý, đánh số liên tục', () => {
  assert.strictEqual(D.events.length, 8);
  D.events.forEach((e, i) => assert.strictEqual(e.q, i + 1));
});

test('Số tham chiếu Hải quan khớp biểu gốc (8 tháng 2026)', () => {
  near(D.benchmarks.textile.imports, 6.004471127 + 1.685061743 + 1.555557824 + 3.559106893, 0.001, 'Nhập đầu vào dệt may');
  near(D.benchmarks.electronics.exports, 100.443, 0.001, 'Xuất khẩu điện tử');
  near(D.benchmarks.electronics.imports, 157.668, 0.001, 'Nhập khẩu điện tử');
});

test('Tất định: cùng hạt giống và quyết định cho cùng kết quả; khác hạt giống thì khác', () => {
  const f = () => ({ local: 0.3, alloc: DIV, invest: 0 });
  assert.deepStrictEqual(play('electronics', f, 7).history, play('electronics', f, 7).history);
  assert.notStrictEqual(play('electronics', f, 7).history[0].byMarket[0].demand, play('electronics', f, 8).history[0].byMarket[0].demand);
});

test('Kế toán: lợi nhuận = xuất khẩu + thanh lý − chi phí − đầu tư; DVA = xuất − nhập', () => {
  play('textile', q => ({ local: 0.4, alloc: DIV, invest: q === 1 ? 5e5 : 0 })).history.forEach(r => {
    near(r.profit, r.exports + r.salvage - r.imports - r.localPurchases - r.otherCost - r.decision.invest, 1e-6, 'lợi nhuận Q' + r.quarter);
    near(r.dva, r.exports - r.imports, 1e-6, 'DVA Q' + r.quarter);
    near(r.produced, r.sold + r.unsold, 1e-6, 'sản lượng Q' + r.quarter);
  });
});

test('Quy tắc xuất xứ: đạt 40% nội địa thì vào EU thuế 0%, dưới ngưỡng chịu MFN', () => {
  const eu = D.markets.find(m => m.id === 'EU');
  assert.strictEqual(E.tariffFor(eu, D.events[0], 0.40), 0);
  assert.strictEqual(E.tariffFor(eu, D.events[0], 0.39), eu.mfn);
});

test('Thuế Hoa Kỳ quý 7: 20%, hoặc 40% nếu nội địa dưới 30%', () => {
  const us = D.markets.find(m => m.id === 'US');
  near(E.tariffFor(us, D.events[6], 0.35), 0.20, 1e-12, 'đạt ngưỡng');
  near(E.tariffFor(us, D.events[6], 0.10), 0.40, 1e-12, 'nghi trung chuyển');
  assert.strictEqual(E.tariffFor(us, D.events[0], 0), 0);
});

test('Đứt gãy quý 4 làm giảm sản lượng theo phần đầu vào nhập khẩu', () => {
  const s = play('electronics', () => ({ local: 0, alloc: DIV, invest: 0 }));
  near(s.history[3].produced, D.industries.electronics.capacity * (1 - 0.5), 1e-6, 'nhập 100%');
  const t = play('electronics', () => ({ local: 0.6, alloc: DIV, invest: 0 }));
  near(t.history[3].produced, D.industries.electronics.capacity * (1 - 0.5 * 0.4), 1e-6, 'nội địa 60%');
});

test('Đầu tư nhà cung cấp làm giảm phần chênh giá nội địa từ quý sau', () => {
  const s = play('electronics', q => ({ local: 0.4, alloc: DIV, invest: q === 1 ? 1e6 : 0 }));
  near(s.history[0].premium, D.industries.electronics.localPremium, 1e-12, 'Q1 chưa có tác dụng');
  near(s.history[1].premium, D.industries.electronics.localPremium * Math.exp(-1), 1e-12, 'Q2 giảm e lần');
});

test('Cân bằng: nội địa hóa có đầu tư vừa phải > nhập 100% > dồn hết sang Mỹ (cả hai ngành, nhiều hạt giống)', () => {
  ['electronics', 'textile'].forEach(ind => [1, 42, 2026].forEach(seed => {
    const A = E.summary(play(ind, () => ({ local: 0, alloc: { US: 100 }, invest: 0 }), seed)).profit;
    const B = E.summary(play(ind, () => ({ local: 0, alloc: DIV, invest: 0 }), seed)).profit;
    const Dp = E.summary(play(ind, q => ({ local: 0.45, alloc: DIV, invest: q <= 3 ? 5e5 : 0 }), seed)).profit;
    assert.ok(Dp > B && B > A, `${ind} seed ${seed}: ${Dp} > ${B} > ${A}`);
  }));
});

test('Nhật ký quyết định đủ 8 vòng, không chứa định danh', () => {
  const log = E.decisionLog(play('textile', () => ({ local: 0.5, alloc: DIV, invest: 0 })), { cohort: 'EC1314-2026A' });
  assert.strictEqual(log.length, 8);
  assert.ok(!JSON.stringify(log).includes('@'));
});

test('Trang HTML nạp lõi và dữ liệu, có ghi công, không dùng CDN', () => {
  const html = fs.readFileSync(path.join(__dirname, '../lab/nha-may-fdi.html'), 'utf8');
  assert.ok(html.includes('nha-may-fdi-engine.js') && html.includes('nha-may-fdi-data.js'));
  assert.ok(html.includes('Phan Anh Tú') && html.includes('Đỗ Thùy Hương'));
  assert.ok(!/https?:\/\/(cdn|fonts\.googleapis)/.test(html));
});

console.log(`\n${passed} kiểm thử đạt.`);
