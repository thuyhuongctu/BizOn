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
  // Thẻ canonical / Open Graph cần URL tuyệt đối nhưng không gây tải mạng: bỏ ra trước khi dò.
  const noMeta = html.replace(/<footer[\s\S]*?<\/footer>/, '').replace(/<link rel="canonical"[^>]*>|<meta property="og:[^"]*" content="[^"]*">/g, '');
  assert.ok(!/fetch\(|XMLHttpRequest|https?:\/\/(?!www\.w3\.org)/.test(noMeta), 'có gọi mạng');
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  ['ho-chieu-sau-rieng.html', 'ho-chieu-sau-rieng-3d.html', 'ho-chieu-sau-rieng-engine.js', 'ho-chieu-sau-rieng-data.js'].forEach(f => assert.ok(sw.includes('./lab/' + f), 'sw.js thiếu ' + f));
});

test('Nếu – Thì: không làm đổi trạng thái, không lộ may rủi kiểm dịch, gần kết quả khi giá ước tính đúng', () => {
  const s0 = E.newGame(D, 'exporter', 99);
  const before = JSON.stringify(s0);
  const dec = { priority: 'area', linked: 0.5, alloc: { BORDER: 50, DOM: 50 }, intel: ['moit', 'buyer'], option: 0 };
  const f1 = E.forecast(D, s0, dec), f2 = E.forecast(D, s0, dec);
  assert.strictEqual(JSON.stringify(s0), before, 'forecast sửa trạng thái');
  assert.strictEqual(f1.profit, f2.profit);
  // giá ước tính = giá thật thì dự báo khớp kết quả khi không có rủi ro ngẫu nhiên (không đi chính ngạch, Nhật)
  const exp = E.playSeason(D, s0, dec, { expected: true, depotEstimate: E.depotPrice(D, s0) });
  const act = E.playSeason(D, s0, dec);
  near(exp.history[0].profit, act.history[0].profit, 1e-9, 'dự báo với giá thật');
  // có chính ngạch: dự báo trả về xác suất bị chặn trong [0,1] và không gắn cờ bị chặn
  let s = E.newGame(D, 'packer', 5); s = E.playSeason(D, s, { priority: 'area', linked: 0.8, alloc: { DOM: 100 }, option: 0 });
  const g = E.playSeason(D, s, { priority: 'test', linked: 0.8, alloc: { CN: 80, DOM: 20 }, option: 0 }, { expected: true, depotEstimate: 100 });
  const r = g.history[1];
  assert.ok(r.pBlockCN > 0 && r.pBlockCN < 1 && !r.blockedCN && g.suspendedUntil === s.suspendedUntil);
});

test('Đối thủ AI: 7 CEO Go Global, mỗi ván 3 người khác nhóm, tất định, đủ 6 vụ, cờ so với đối thủ mạnh nhất', () => {
  assert.strictEqual(D.rivals.length, 7);
  const a = E.rivalsRun(D, 'exporter', 77), b = E.rivalsRun(D, 'exporter', 77);
  assert.strictEqual(a.length, 3);
  // mỗi ván 3 đối thủ, mỗi người một nhóm lối chơi; khắp các hạt giống thì gặp đủ 7 CEO
  assert.deepStrictEqual(a.map(r => D.rivals.find(x => x.id === r.id).group).sort(), D.rivalGroups.slice().sort());
  const seen = new Set(); for (let k = 0; k < 60; k++) E.pickRivals(D, k * 7919).forEach(r => seen.add(r.id));
  assert.strictEqual(seen.size, 7);
  assert.strictEqual(JSON.stringify(a), JSON.stringify(b));
  a.forEach(r => assert.strictEqual(r.state.history.length, 6));
  const fake = { n: 1, profit: Math.max(...a.map(r => r.state.history[0].profit)) };
  assert.ok(E.flagFor(a, fake).win);
  assert.ok(!E.flagFor(a, { n: 1, profit: fake.profit - 0.01 }).win);
  // đối thủ không mua lại tài sản đã có
  const st = E.newGame(D, 'packer', 1);
  assert.notStrictEqual(E.rivalDecision(D, Object.assign({}, D.rivals[0], { plan: ['pack', 'area'] }), st, null).priority, 'pack');
});

test('Bản lớp học: đủ 5 vai, câu hỏi Lumina, rubric 100%, cột nhật ký sự kiện', () => {
  assert.deepStrictEqual(D.team.map(m => m.id), ['ceo', 'cmo', 'coo', 'cfo', 'sec']);
  assert.ok(D.luminaQuestions.length >= 3);
  assert.strictEqual(D.rubric.reduce((x, r) => x + r.w, 0), 100);
  ['event_id', 'timestamp', 'class_id', 'team_id', 'round_id', 'role', 'event_type', 'committed'].forEach(c => assert.ok(D.eventLogColumns.includes(c)));
  [...D.team.map(m => m.img), ...D.rivals.map(r => r.img)].forEach(img => assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', 'character', img)), 'thiếu ảnh ' + img));
});

test('Chuỗi cung ứng lạnh chi tiết (chain2) và quy trình 8 bước (eightSteps): đủ ảnh trên đĩa', () => {
  assert.strictEqual(D.chain2.stages.length, 8);
  const chainImgs = D.chain2.stages.flatMap(st => st.items.map(it => it.img)).concat(D.chain2.cast.map(c => c.img));
  assert.strictEqual(chainImgs.length, 59);
  chainImgs.forEach(img => assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', img)), 'thiếu ảnh chain2 ' + img));
  assert.strictEqual(D.eightSteps.steps.length, 8);
  D.eightSteps.steps.forEach(st => {
    [st.img, st.img2].filter(Boolean).forEach(img => assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', img)), 'thiếu ảnh bước ' + st.n + ': ' + img));
  });
});

// Bản 3D là bundle tự chứa: engine, data, core được nhúng (gzip + base64) trong <script type="__bundler/manifest">.
// Đóng gói lại bằng: node scripts/release/rebundle-ho-chieu-sau-rieng-3d.mjs
const readBundle3D = () => {
  const zlib = require('zlib');
  const html = fs.readFileSync(path.join(__dirname, '..', 'lab', 'ho-chieu-sau-rieng-3d.html'), 'utf8');
  const lines = html.split('\n');
  const at = tag => { const i = lines.findIndex(l => l.trim() === '<script type="' + tag + '">'); assert.ok(i >= 0, 'bundle thiếu ' + tag); return JSON.parse(lines[i + 1]); };
  const manifest = at('__bundler/manifest'), template = at('__bundler/template');
  const decode = e => { const raw = Buffer.from(e.data, 'base64'); return e.compressed ? zlib.gunzipSync(raw) : raw; };
  return { manifest, template, decode };
};

test('Bản 3D: engine, data, core nhúng trong bundle trùng từng byte với lab/*.js và được trang chơi nạp', () => {
  const { manifest, template, decode } = readBundle3D();
  const js = Object.entries(manifest).filter(([, e]) => /javascript/.test(e.mime)).map(([uuid, e]) => ({ uuid, text: decode(e) }));
  [['ho-chieu-sau-rieng-engine.js', 'root.DurianEngine = api'], ['ho-chieu-sau-rieng-data.js', 'root.DurianData = api'], ['ho-chieu-sau-rieng-core.js', 'window.DurianCore = {']].forEach(([file, marker]) => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'lab', file));
    const same = js.filter(a => a.text.includes(marker));
    assert.strictEqual(same.length, 1, file + ': cần đúng một bản nhúng, có ' + same.length + ' (chạy scripts/release/rebundle-ho-chieu-sau-rieng-3d.mjs)');
    assert.ok(same[0].text.equals(src), file + ': bản nhúng trong 3D khác lab/' + file + ' (chạy scripts/release/rebundle-ho-chieu-sau-rieng-3d.mjs)');
    assert.ok(template.includes('<script src="' + same[0].uuid + '">'), file + ': template 3D không nạp uuid ' + same[0].uuid);
  });
});

test('Bản 3D: chữ trên giao diện khớp tham số (vùng liên kết, xử lý ra hoa), link giảng viên tồn tại, không còn chỉ số ẩn «Chống chịu»', () => {
  const { template } = readBundle3D();
  assert.ok(!/đắt hơn 8%|cost 8% more|sản lượng −15%|output −15%|Chống chịu −8/.test(template), 'còn chữ cũ trái với tham số');
  assert.ok(/induce: true, intel: \[\], option: null/.test(template), 'mặc định xử lý ra hoa phải giống bản 2D (true)');
  assert.ok(DCore().freshDec().induce === true);
  (template.match(/<a href="([^"#]+)"/g) || []).map(a => a.slice(9, -1)).filter(h => !/^https?:/.test(h)).forEach(h => assert.ok(fs.existsSync(path.join(__dirname, '..', decodeURI(h))), 'link 3D hỏng: ' + h));
  const html2d = fs.readFileSync(path.join(__dirname, '..', 'lab', 'ho-chieu-sau-rieng.html'), 'utf8');
  assert.ok(!/rẻ hơn 8%|8% cheaper/.test(html2d), 'bản 2D còn «8%» cứng');
  assert.ok(!/8%/.test(D.sourcingTheory.vi) && D.sourcingTheory.vi.includes('+' + Math.round(D.params.linkedPremium * 100) + '%'));
  assert.ok(!/Chống chịu|Resilience/.test(D.priorities.find(p => p.id === 'finance').effVi + D.priorities.find(p => p.id === 'finance').effEn));
  Object.keys(D.sourcesEn).forEach(k => assert.ok(D.sources[k], 'sourcesEn có khóa lạ: ' + k));
});

test('Cân bằng 10/2026: tỷ trọng mặc định theo doanh nghiệp, tự đưa % vào kênh vừa mở, HTX mốc 60 và giá thành nghịch vụ ×1,8', () => {
  const ids = D.channels.map(c => c.id);
  const sum100 = (a, name) => { Object.keys(a).forEach(k => assert.ok(ids.includes(k), name + ': kênh lạ ' + k)); assert.strictEqual(Object.values(a).reduce((x, y) => x + y, 0), 100, name + ' phải cộng đủ 100'); };
  sum100(D.params.defaultAlloc, 'params.defaultAlloc');
  Object.keys(D.roles).forEach(r => { if (D.roles[r].defaultAlloc) sum100(D.roles[r].defaultAlloc, r + '.defaultAlloc'); });
  Object.entries(D.params.openSeed).forEach(([k, v]) => assert.ok(ids.includes(k) && v > 0 && v < 100));
  const C = DCore();
  assert.deepStrictEqual(C.freshDec(D, 'frozen').alloc, { FROZEN: 40, BORDER: 30, DOM: 30 });
  assert.deepStrictEqual(C.freshDec(D, 'packer').alloc, D.params.defaultAlloc);
  // Cơ sở đóng gói làm mã vùng trồng ở vụ 1 → vụ 2 chính ngạch mở, được đưa sẵn 40%, các kênh còn lại vẫn cộng đủ 100
  const s0 = E.newGame(D, 'packer', 7), s1 = E.playSeason(D, s0, { priority: 'area', linked: 0.5, induce: false, alloc: D.params.defaultAlloc, intel: [], option: 0 });
  const seeded = C.seedNewChannels(D, E, s0, s1, D.params.defaultAlloc);
  assert.strictEqual(seeded.CN, D.params.openSeed.CN);
  const open = D.channels.filter(c => E.eligible(D, s1, c)).map(c => c.id);
  near(open.reduce((x, k) => x + (seeded[k] || 0), 0), 100, 1e-9, 'tỷ trọng sau khi đưa sẵn');
  assert.deepStrictEqual(C.seedNewChannels(D, E, s1, s1, seeded), seeded, 'không có kênh mới thì giữ nguyên');
  assert.strictEqual(D.roles.htx.benchMargin, 60);
  const h0 = E.newGame(D, 'htx', 3), h1 = E.playSeason(D, h0, { priority: 'finance', linked: 1, induce: true, alloc: { DOM: 100 }, intel: [], option: 0 });
  const h2 = E.playSeason(D, h1, { priority: 'finance', linked: 1, induce: true, alloc: { DOM: 100 }, intel: [], option: 0 }).history[1];
  assert.strictEqual(h2.season, 'off');
  near(h2.purchase, h2.volume * D.params.farmCost * D.params.offFarmMult / 1000, 1e-9, 'giá thành HTX nghịch vụ khi xử lý ra hoa');
  const { template } = readBundle3D();
  assert.ok(!/giá thành \+30%|cost \+30%|costs \+30%/.test(template), 'nhãn xử lý ra hoa còn +30% cũ');
});

test('Biến cố có needsAny chỉ xuất hiện khi đội đang đi được ít nhất một kênh trong danh sách', () => {
  assert.ok(D.events.some(e => e.needsAny), 'chưa có biến cố nào khai báo needsAny');
  D.events.filter(e => e.needsAny).forEach(e => e.needsAny.forEach(id => assert.ok(D.channels.some(c => c.id === id), e.id + ': kênh lạ ' + id)));
  const plans = [['area', 'pack', 'test', 'trace', 'test', 'freezer'], ['finance', 'finance', 'finance', 'finance', 'finance', 'finance'], ['test', 'area', 'pack', 'finance', 'trace', 'test']];
  let checked = 0;
  Object.keys(D.roles).forEach(role => plans.forEach((plan, pi) => { for (let k = 0; k < 40; k++) {
    let s = E.newGame(D, role, 5000 + k * 7 + pi);
    while (s.n <= D.seasons.length) {
      const ev = E.eventFor(D, s);
      if (ev && ev.needsAny) { checked++; assert.ok(ev.needsAny.some(id => E.eligible(D, s, D.channels.find(c => c.id === id))), `${role} vụ ${s.n}: biến cố ${ev.id} đòi kênh đang đóng`); }
      s = E.playSeason(D, s, { priority: plan[s.n - 1], linked: 0.7, induce: true, alloc: { CN: 50, BORDER: 20, JP: 10, DOM: 20 }, intel: [], option: 1 });
    }
  } }));
  assert.ok(checked > 50, 'quá ít biến cố needsAny được kiểm: ' + checked);
});

function DCore() { global.window = global.window || {}; require('../lab/ho-chieu-sau-rieng-core.js'); return global.window.DurianCore; }

console.log(`\n${passed} kiểm thử đạt`);
