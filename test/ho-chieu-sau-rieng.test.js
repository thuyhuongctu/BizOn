/* Kiểm thử Hộ Chiếu Sầu Riêng: tất định, kế toán khớp, quy định chính ngạch, trích nguồn, cân bằng chiến lược. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const E = require('../lab/ho-chieu-sau-rieng-engine.js');
const D = require('../lab/ho-chieu-sau-rieng-data.js');

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('ok -', name); };
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const play = (role, f, seed) => {
  let s = E.newGame(D, role, seed === undefined ? 42 : seed);
  while (s.n <= D.seasons.length) { const ev = E.eventFor(D, s); s = E.playSeason(D, s, f(s.n, ev, s)); }
  return s;
};
const avgScore = (role, f, N) => {
  let x = 0; for (let k = 0; k < N; k++) x += E.summary(D, play(role, f, 1000 + k)).total; return x / N;
};

// Chiến lược mẫu để kiểm tra cân bằng
const refuseFraud = ev => (ev && ev.id === 'fake' ? 0 : 0);
const compliance = role => (n, ev) => {
  const own = D.roles[role].ownFarm;
  const order = own ? ['pack', 'area', 'test', 'trace', 'freezer', 'test'] : ['area', D.roles[role].packCode ? 'test' : 'pack', 'test', 'trace', 'freezer', 'finance'];
  return { priority: order[n - 1], linked: 0.8, induce: true, alloc: { CN: 60, BORDER: 15, TW: 10, JP: 5, FROZEN: 20, DOM: 10 }, option: refuseFraud(ev) };
};
const borderOnly = () => (n, ev) => ({ priority: 'finance', linked: 0, induce: false, alloc: { BORDER: 70, DOM: 30 }, option: 0 });
const fraud = () => (n, ev) => ({ priority: 'finance', linked: 0, induce: true, alloc: { BORDER: 60, DOM: 40 }, option: ev && ev.id === 'fake' ? 1 : 0 });

test('Có 6 vụ xen kẽ chính vụ – nghịch vụ, vụ 4 là nhiệm vụ kiểm tra', () => {
  assert.strictEqual(D.seasons.length, 6);
  D.seasons.forEach((s, i) => { assert.strictEqual(s.n, i + 1); assert.strictEqual(s.season, i % 2 ? 'off' : 'main'); });
  assert.strictEqual(D.seasons[3].mission, 'audit');
});

test('Mọi mốc và biến cố đều trỏ tới dữ kiện có nguồn; mọi nguồn đều được khai báo', () => {
  D.seasons.forEach(s => assert.ok(D.facts[s.anchor], 'thiếu dữ kiện mốc ' + s.anchor));
  D.events.forEach(e => assert.ok(D.facts[e.src], 'thiếu dữ kiện biến cố ' + e.id));
  Object.values(D.facts).forEach(f => assert.ok(D.sources[f.src], 'nguồn chưa khai báo: ' + f.src));
  D.channels.forEach(c => assert.ok(D.sources[c.src], 'nguồn kênh chưa khai báo: ' + c.src));
});

test('Dữ kiện then chốt khớp tài liệu gốc', () => {
  assert.deepStrictEqual(D.params.sampling, [0.02, 0.01]);            // Nghị định thư, Điều 5
  assert.strictEqual(D.channels.find(c => c.id === 'TW').tariff, 0.17); // thuế MFN Đài Loan
  near(D.params.fraudMult, 160 / 70, 0.01, 'Chênh giá dán nhãn Thái');
  assert.ok(D.params.offMult >= 2 && D.params.offMult <= 3, 'giá nghịch vụ gấp 2–3 lần');
  assert.ok(D.params.offYieldCut >= 0.10 && D.params.offYieldCut <= 0.20, 'nghịch vụ thấp hơn 10–20%');
  assert.ok(D.params.baseLoss >= 0.15 && D.params.baseLoss <= 0.40, 'hao hụt toàn chuỗi 15–40%');
});

test('Tất định: cùng hạt giống và quyết định cho cùng kết quả; khác hạt giống thì khác', () => {
  const f = compliance('exporter');
  assert.deepStrictEqual(play('exporter', f, 7).history, play('exporter', f, 7).history);
  assert.notStrictEqual(play('exporter', f, 7).history[0].depot, play('exporter', f, 8).history[0].depot);
});

test('Biến cố không lặp trong một ván và tôn trọng điều kiện vai, mùa', () => {
  for (const role of Object.keys(D.roles)) for (let seed = 0; seed < 30; seed++) {
    const g = play(role, compliance(role), seed);
    const ids = g.history.map(r => r.eventId).filter(Boolean);
    assert.strictEqual(new Set(ids).size, ids.length);
    g.history.forEach(r => {
      const ev = D.events.find(e => e.id === r.eventId); if (!ev) return;
      if (ev.onlyBuyers) assert.ok(!D.roles[role].ownFarm);
      if (ev.onlySeason) assert.strictEqual(ev.onlySeason, r.season);
    });
  }
});

test('Kế toán khớp: lợi nhuận = doanh thu − mua − logistics − đầu tư − tin − biến cố − chi phí vốn; tiền mặt cộng dồn', () => {
  const g = play('packer', compliance('packer'), 3);
  let cash = D.params.cash0 + D.roles.packer.cashAdj;
  g.history.forEach(r => {
    near(r.profit, r.revenue - r.purchase - r.logistics - r.priorityCost - r.intelCost + r.eventCash - r.finance, 1e-9, 'lợi nhuận vụ ' + r.n);
    const sold = r.byChannel.reduce((x, c) => x + c.qty, 0);
    near(sold, r.sellable, 1e-6, 'khối lượng bán = khối lượng sau hao hụt, vụ ' + r.n);
    cash += r.profit;
  });
  near(g.cash, cash, 1e-9, 'tiền mặt');
});

test('Chính ngạch: thiếu mã vùng trồng hoặc mã đóng gói thì không bán được sang kênh này', () => {
  const s = E.newGame(D, 'exporter', 1);
  assert.strictEqual(E.eligible(D, s, D.channels.find(c => c.id === 'CN')), false);
  const r = E.playSeason(D, s, { priority: 'finance', linked: 1, alloc: { CN: 100 }, option: 0 }).history[0];
  assert.strictEqual(r.byChannel.find(c => c.id === 'CN').qty, 0);
  // mã có hiệu lực từ vụ sau
  let g = E.playSeason(D, s, { priority: 'area', linked: 1, alloc: { DOM: 100 }, option: 0 });
  assert.strictEqual(g.assets.area, true);
  assert.strictEqual(E.eligible(D, g, D.channels.find(c => c.id === 'CN')), false);   // vẫn thiếu mã đóng gói
  g = E.playSeason(D, g, { priority: 'pack', linked: 1, alloc: { DOM: 100 }, option: 0 });
  assert.strictEqual(E.eligible(D, g, D.channels.find(c => c.id === 'CN')), true);
});

test('Chỉ hàng từ vùng có mã mới đi chính ngạch; phần còn lại chuyển nội địa', () => {
  let g = E.newGame(D, 'packer', 5);
  g = E.playSeason(D, g, { priority: 'area', linked: 0, alloc: { DOM: 100 }, option: 0 });
  const r = E.playSeason(D, g, { priority: 'finance', linked: 0.25, alloc: { CN: 100 }, option: 0 }).history[1];
  const cn = r.byChannel.find(c => c.id === 'CN').qty;
  assert.ok(cn <= r.sellable * 0.25 + 1e-6, `chính ngạch ${cn} vượt phần có mã`);
});

test('Bị chặn ở chính ngạch thì mã bị tạm dừng vụ sau', () => {
  let found = false;
  for (let seed = 0; seed < 200 && !found; seed++) {
    let g = E.newGame(D, 'packer', seed);
    g = E.playSeason(D, g, { priority: 'area', linked: 0, alloc: { DOM: 100 }, option: 0 });
    const g2 = E.playSeason(D, g, { priority: 'finance', linked: 0.2, alloc: { CN: 100 }, option: 0 });
    if (g2.history[1].blockedCN) {
      found = true;
      assert.strictEqual(g2.suspendedUntil, 3);
      assert.strictEqual(E.eligible(D, g2, D.channels.find(c => c.id === 'CN')), false);
    }
  }
  assert.ok(found, 'không tìm thấy ván nào bị chặn');
});

test('Kiểm nghiệm làm giảm tỷ lệ bị chặn', () => {
  const rate = test2 => {
    let blocked = 0, used = 0;
    for (let seed = 0; seed < 300; seed++) {
      let g = E.newGame(D, 'packer', seed);
      g.assets = Object.assign({}, g.assets, { area: true, test: test2 });
      const r = E.playSeason(D, g, { priority: 'finance', linked: 0.5, alloc: { CN: 100 }, option: 0 }).history[0];
      if (r.byChannel.find(c => c.id === 'CN').qty > 0) { used++; blocked += r.blockedCN ? 1 : 0; }
    }
    return blocked / used;
  };
  assert.ok(rate(2) < rate(0), `${rate(2)} không nhỏ hơn ${rate(0)}`);
});

test('Nghịch vụ: HTX xử lý ra hoa thì sản lượng cao hơn nhưng vườn yếu đi', () => {
  let g = E.newGame(D, 'htx', 9);
  g = E.playSeason(D, g, { priority: 'finance', alloc: { DOM: 100 }, option: 0 });
  const yes = E.playSeason(D, g, { priority: 'finance', induce: true, alloc: { DOM: 100 }, option: 0 });
  const no = E.playSeason(D, g, { priority: 'finance', induce: false, alloc: { DOM: 100 }, option: 0 });
  assert.ok(yes.history[1].volume > no.history[1].volume);
  assert.ok(yes.treeHealth < no.treeHealth);
});

test('Điểm tổng nằm trong 0–100 và đúng trọng số công khai', () => {
  assert.strictEqual(Object.values(D.scoreWeights).reduce((a, b) => a + b, 0), 100);
  const S = E.summary(D, play('frozen', compliance('frozen'), 11));
  assert.ok(S.total >= 0 && S.total <= 100);
  near(S.total, Object.keys(D.scoreWeights).reduce((x, k) => x + D.scoreWeights[k] * S.parts[k] / 100, 0), 1e-9, 'tổng điểm');
});

test('Cân bằng: tuân thủ thắng bán tiểu ngạch và thắng gian lận ở mọi vai (trung bình 40 ván)', () => {
  for (const role of Object.keys(D.roles)) {
    const c = avgScore(role, compliance(role), 40), b = avgScore(role, borderOnly(), 40), f = avgScore(role, fraud(), 40);
    assert.ok(c > b + 10, `${role}: tuân thủ ${c.toFixed(1)} vs tiểu ngạch ${b.toFixed(1)}`);
    assert.ok(c > f + 10, `${role}: tuân thủ ${c.toFixed(1)} vs gian lận ${f.toFixed(1)}`);
  }
});

test('Trang HTML nạp đúng hai tệp lõi, có bản quyền, không gọi mạng', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'lab', 'ho-chieu-sau-rieng.html'), 'utf8');
  assert.ok(html.includes('src="ho-chieu-sau-rieng-engine.js"') && html.includes('src="ho-chieu-sau-rieng-data.js"'));
  assert.ok(html.includes('Phan Anh Tú') && html.includes('Đỗ Thùy Hương'));
  assert.ok(!/fetch\(|XMLHttpRequest|https?:\/\/(?!www\.w3\.org)/.test(html.replace(/<footer[\s\S]*?<\/footer>/, '')), 'có gọi mạng');
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  ['ho-chieu-sau-rieng.html', 'ho-chieu-sau-rieng-engine.js', 'ho-chieu-sau-rieng-data.js'].forEach(f => assert.ok(sw.includes('./lab/' + f), 'sw.js thiếu ' + f));
});

console.log(`\n${passed} kiểm thử đạt`);
