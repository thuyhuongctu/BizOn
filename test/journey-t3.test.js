'use strict';
// Hành trình 3 bậc · J6: Hộ Chiếu Sầu Riêng v2 và Hộ Chiếu Thương Hiệu (engine + bản gọn) hỏi nhận hành trang trước màn mở đầu,
// áp vào ván mới, ghi Bậc 3 cuối ván, khối «Xem tổng kết hành trình»; biến thể không khớp → chơi độc lập. Cần máy chủ tĩnh.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const J = require('../js/core/journey.js');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }

const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const dp2 = read('js/dp2-ui.js'), bp2 = read('js/bp2-ui.js'), bp = read('brand-passport.html'), link = read('js/journey-link.js'), ht = read('js/hanh-trinh.js');
assert.match(read('lab/ho-chieu-sau-rieng-v2.html'), /<script src="\.\.\/js\/journey-link\.js"><\/script>\n<script src="\.\.\/js\/dp2-ui\.js"><\/script>/);
assert.match(read('brand-passport-v2.html'), /<script src="js\/journey-link\.js"><\/script>\n<script src="js\/bp2-ui\.js"><\/script>/);
assert.match(link, /if \(tier === 't3' && opts && opts\.variant && \(p\.tiers\.t3\.variant \|\| J\.DEFAULT_T3_VARIANT\) !== opts\.variant\) \{ ctx\.reason = 'variant'; return ctx; \}/, 'attach: biến thể Bậc 3 phải khớp');
assert.match(dp2, /ui\.journey = window\.BizOnJourneyLink \? BizOnJourneyLink\.attach\('t3', undefined, \{ variant: 'durian' \}\) : null;/);
assert.match(dp2, /const applied = await BizOnJourneyLink\.offerCarry\(ui\.journey, \{ variant: 'durian', roleId: APP\.roleId, cashAdj: \(D\.roles\[APP\.roleId\] \|\| \{\}\)\.cashAdj \|\| 0 \}\);\n      BizOnJourneyLink\.stamp\(APP, ui\.journey, applied\);\n      if \(applied\) BizOnJourney\.applyToDurian\(APP\.game, \{ applied \}\);/);
assert.match(dp2, /BizOnJourneyLink\.finish\(ui\.journey, durianResult\(\), \{ variant: 'durian', roleId: APP\.roleId, appVersion: 'bizon-srp-v2' \}\)/);
assert.match(dp2, /<\/section>\$\{window\.BizOnJourneyLink && ui\.journey \? BizOnJourneyLink\.endHtml\(ui\.journey\) : ''\}`;/);
assert.match(read('lab/ho-chieu-sau-rieng-engine.js'), /const lim = \(P\.creditLimit \|\| 8\) \+ \(\(state\.journey && Number\(state\.journey\.creditLimitAdj\)\) \|\| 0\)/, 'engine: hạn mức tín dụng đọc hành trang');
assert.match(bp2, /ui\.journey = window\.BizOnJourneyLink \? BizOnJourneyLink\.attach\('t3', undefined, \{ variant: 'brand' \}\) : null;/);
assert.match(bp2, /const applied = await BizOnJourneyLink\.offerCarry\(ui\.journey, \{ variant: 'brand' \}\);\n      call\('bpApplyCarry', applied\);/);
assert.match(bp2, /\(jm \? '&journey=' \+ jm\[1\] : ''\)/, 'bản gọn chuyển ?journey= vào iframe engine');
assert.match(bp, /window\.bpApplyCarry = function \(applied\) \{/); assert.match(bp, /BizOnJourney\.applyToBrand\(S, \{ applied: applied \}\);/);
assert.match(bp, /BizOnJourneyLink\.complete\(window\.__bpJourney, \{ total: scores\(\)\.total, entered: S\.entered, cash: S\.cash, rep: S\.rep \}, \{ variant: 'brand', appVersion: 'bizon-bp-v2' \}, \{ host: 'bp-end', before: '\.flex\.gap-3\.mt-6' \}\)/);
assert.match(bp, /end: function \(\) \{ bpEnd\(null\); \},/, 'bpTest.end cho kiểm thử');
assert.match(ht, /\$\('jr-csv'\)\.addEventListener\('click'/); assert.match(read('hanh-trinh.html'), /id="jr-timeline-box" hidden/);
assert.match(read('sw.js'), /const CACHE = 'bizon-v672';/);

// Hộ chiếu: Bậc 1 + Bậc 2 xong (như journey-t2) → hành trang Bậc 3 có sẵn
const base = J.recordTier2(J.recordTier1(J.createPassport({ teamName: 'Đội Thử', createdAt: '2026-11-03T02:10:00Z' }), { total: 4.2, result: { eff: 71, rank: 2 }, history: [{ w: 1, m: 1 }, { w: 2, m: 2 }, { w: 3, m: 1 }, { w: 4, m: 0 }, { w: 5, m: 0 }], knownPairs: { '0-2': true, '1-4': true, '2-1': true } }),
  { balance: 612, brand: 1.22, quickRatio: 1.3, loan: 0, rdCumulative: 60, history: [10, 20, 15, 25, -4, 30].map(x => ({ netProfit: x, share: 31.5, oee: 88, revenue: 100, brandLoyalty: 60 })) });
const durian = J.setTier3Variant(base, 'durian', 'packer'), brand = J.setTier3Variant(base, 'brand');
const expD = J.journeyCarry(durian, 't3', { variant: 'durian', roleId: 'packer', cashAdj: 0 }).applied, expB = J.journeyCarry(brand, 't3', { variant: 'brand' }).applied;
assert.equal(expD.cash, 13.8); assert.equal(expB.cash, 9.2); assert.equal(expB.net[0].market, 5);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push('err: ' + e.message)); page.on('dialog', d => d.accept());
  await page.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
  await page.addInitScript(p => { try { if (!sessionStorage.getItem('jt3-init')) { localStorage.clear(); sessionStorage.setItem('jt3-init', '1'); localStorage.setItem('bizon-journey', JSON.stringify(p)); } localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} }, durian);
  const setP = p => page.evaluate(p => { localStorage.setItem('bizon-journey', JSON.stringify(p)); ['durian_class_v2', 'bizon-bp-save', 'bp-team', 'bp-class'].forEach(k => localStorage.removeItem(k)); }, p);
  const passport = () => page.evaluate(() => JSON.parse(localStorage.getItem('bizon-journey')));

  // ---- Hộ Chiếu Sầu Riêng v2: băng ok, vai «packer» chọn sẵn từ hộ chiếu ----
  await page.goto(`${BASE}/lab/ho-chieu-sau-rieng-v2.html?journey=${encodeURIComponent(durian.journeyId)}`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForSelector('#dp2-login', { timeout: 60000 });
  const d0 = await page.evaluate(() => ({ reason: (document.getElementById('ft-journey') || {}).dataset?.reason, role: (document.querySelector('[data-act=role].on') || {}).dataset?.v, st: JSON.parse(localStorage.getItem('bizon-journey')).tiers.t3.status }));
  assert.deepEqual(d0, { reason: 'ok', role: 'packer', st: 'playing' });
  await page.fill('#dp2-login input[name=cls]', 'DEMO-2026'); await page.fill('#dp2-login input[name=team]', 'thu');
  await page.click('#dp2-login button[type=submit]');
  await page.waitForSelector('#jl-modal #jc-accept', { timeout: 15000 });
  const dm = await page.evaluate(() => ({ lines: document.querySelectorAll('#jl-modal .jc-line').length, txt: document.querySelector('#jl-modal').textContent, decide: !!document.querySelector('[data-act=commit]') }));
  assert.equal(dm.lines, 5); assert.match(dm.txt, /13,8|13\.8/); assert.equal(dm.decide, false, 'chưa vào vụ 1 khi đang hỏi');
  await page.click('#jl-modal #jc-accept');
  await page.waitForFunction(() => !document.getElementById('jl-modal') && DP2.phase() === 'decide', null, { timeout: 15000 });
  const g1 = await page.evaluate(() => { const a = DP2.app(), G = a.game; return { cash: G.cash, rep: G.rep, resil: G.resil, adapt: G.adapt, linked: G.linkedBonus, cl: G.journey.creditLimitAdj, j: a.journey, role: a.roleId, saved: JSON.parse(localStorage.getItem('durian_class_v2')).game.journey.carryApplied.cash, v: JSON.parse(localStorage.getItem('bizon-journey')).tiers.t3 }; });
  assert.equal(g1.cash, 13.8); assert.equal(g1.rep, 52); assert.equal(g1.resil, 53); assert.equal(g1.adapt, 43); assert.equal(g1.linked, 0.05); assert.equal(g1.cl, 0);
  assert.equal(g1.j.id, durian.journeyId); assert.equal(g1.j.carryApplied.cashMul, 1.15); assert.equal(g1.role, 'packer'); assert.equal(g1.saved, 13.8);
  assert.equal(g1.v.variant, 'durian'); assert.equal(g1.v.roleId, 'packer');
  // Chơi hết vụ 1 thật (giữ quyết định mặc định) rồi ép hết mùa → ghi Bậc 3 với thứ tự mở kênh, khối «Xem tổng kết hành trình»
  await page.evaluate(() => { DP2.setSheet({ goal: 'profit', assume: 'Giá nội địa ổn định', ceo: 'Giữ kênh nội địa để chắc dòng tiền' }); DP2.commit(); });
  await page.waitForFunction(() => DP2.app().game.history.length === 1, null, { timeout: 15000 });
  await page.evaluate(() => { DP2.setJournal({ cause: 'price', next: 'Giảm tiểu ngạch, thêm nội địa' }); DP2.journalDone(); });
  await page.waitForFunction(() => DP2.phase() === 'decide', null, { timeout: 15000 });
  await page.evaluate(() => { DP2.app().game.n = 99; DP2.render(); });
  await page.waitForSelector('#ft-journey-next', { timeout: 15000 });
  const p3 = await passport();
  const d3 = await page.evaluate(() => { const b = document.querySelector('#ft-journey-next'); return { txt: b.textContent, href: b.querySelector('a.jl-next').getAttribute('href'), cards: document.querySelectorAll('#ft-journey-next').length }; });
  assert.equal(p3.tiers.t3.status, 'done'); assert.equal(p3.tiers.t3.variant, 'durian'); assert.equal(p3.tiers.t3.roleId, 'packer'); assert.equal(p3.tiers.t3.appVersion, 'bizon-srp-v2');
  assert.ok(p3.tiers.t3.channelOrder.length >= 1, 'thứ tự mở kênh'); assert.ok(p3.tiers.t3.total > 0); assert.equal(p3.tiers.t3.carryApplied.cash, 13.8);
  assert.ok(['near-first', 'leapfrog', 'mixed', 'none'].includes(p3.summary.intlPattern) || typeof p3.summary.intlPattern === 'string');
  assert.match(d3.txt, /Bậc 3 đã ghi vào hộ chiếu của Đội Thử/); assert.equal(d3.href, 'hanh-trinh.html'); assert.equal(d3.cards, 1);
  // Vẽ lại (đổi ngôn ngữ) không ghi lại, không nhân đôi khối
  const before = JSON.stringify(p3);
  await page.evaluate(() => { localStorage.setItem('bizon-lang', 'en'); window.dispatchEvent(new Event('bizon:langchange')); });
  assert.equal(JSON.stringify(await passport()), before); assert.equal(await page.evaluate(() => document.querySelectorAll('#ft-journey-next').length), 1);
  await page.evaluate(() => localStorage.setItem('bizon-lang', 'vi'));

  // ---- Biến thể không khớp: hộ chiếu chọn Thương Hiệu → trang Sầu Riêng chơi độc lập ----
  await setP(brand);
  await page.goto(`${BASE}/lab/ho-chieu-sau-rieng-v2.html?journey=${encodeURIComponent(brand.journeyId)}`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForSelector('#dp2-login', { timeout: 60000 });
  const mis = await page.evaluate(() => ({ reason: (document.getElementById('ft-journey') || {}).dataset?.reason, txt: (document.getElementById('ft-journey') || {}).textContent, st: JSON.parse(localStorage.getItem('bizon-journey')).tiers.t3.status }));
  assert.equal(mis.reason, 'variant'); assert.match(mis.txt, /Hộ Chiếu Thương Hiệu/); assert.equal(mis.st, 'pending', 'không đánh dấu đang chơi');
  await page.fill('#dp2-login input[name=cls]', 'DEMO-2026'); await page.fill('#dp2-login input[name=team]', 'thu'); await page.click('#dp2-login button[type=submit]');
  await page.waitForFunction(() => DP2.phase() === 'decide', null, { timeout: 15000 });
  assert.deepEqual(await page.evaluate(() => ({ m: !!document.getElementById('jl-modal'), cash: DP2.app().game.cash, j: DP2.app().journey || null })), { m: false, cash: 18, j: null }, 'không hộp thoại, vốn gốc vai mặc định (exporter), không dấu hộ chiếu');

  // ---- Hộ Chiếu Thương Hiệu bản gọn: băng ok, hộp thoại ở trang mẹ, áp vào engine trong iframe ----
  await setP(brand);
  await page.goto(`${BASE}/brand-passport-v2.html?journey=${encodeURIComponent(brand.journeyId)}`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForSelector('#bp2-login', { timeout: 60000 });
  await page.waitForFunction(() => BP2.ready && BP2.ready(), null, { timeout: 60000 }).catch(() => {});
  await page.waitForFunction(() => { const w = BP2.engine(); return w && typeof w.bpApplyCarry === 'function' && w.__bpJourney && w.__bpJourney.id; }, null, { timeout: 60000 });
  const b0 = await page.evaluate(() => ({ reason: (document.getElementById('ft-journey') || {}).dataset?.reason, src: document.getElementById('bp2-engine').getAttribute('src'), inner: BP2.engine().__bpJourney.reason }));
  assert.equal(b0.reason, 'ok'); assert.match(b0.src, /journey=/); assert.equal(b0.inner, 'ok');
  await page.fill('#bp2-login input[name=team]', 'Đội Gọn'); await page.fill('#bp2-login input[name=classId]', 'DEMO-2026');
  await page.click('#bp2-login button[type=submit]');
  await page.waitForSelector('#jl-modal #jc-accept', { timeout: 15000 });
  const bm = await page.evaluate(() => ({ lines: document.querySelectorAll('#jl-modal .jc-line').length, txt: document.querySelector('#jl-modal').textContent, inner: !!BP2.engine().document.getElementById('jl-modal') }));
  assert.equal(bm.lines, 5); assert.match(bm.txt, /9,2|9\.2/); assert.equal(bm.inner, false, 'engine nhúng không tự hỏi lần hai');
  await page.click('#jl-modal #jc-accept');
  await page.waitForFunction(() => !document.getElementById('jl-modal') && BP2.ui.screen === 'play', null, { timeout: 15000 });
  const s = await page.evaluate(() => { const W = BP2.engine(), st = W.bpTest.state(), f = W.bpTest.firm ? W.bpTest.firm() : null; const sv = JSON.parse(localStorage.getItem('bizon-bp-save')); return { cash: st.cash, cash0: st.cash0, rep: st.rep, resil: st.resil, capab: st.capab, net5: st.net[5], net2: st.net[2], net0: st.net[0], j: sv.S.journey, firm: f }; });
  // hãng mặc định: uy tín/năng lực gốc theo hãng (+2 uy tín, +3 năng lực từ hành trang), chống chịu 50 + 3, vốn 8 × 1,15
  assert.equal(s.cash, 9.2); assert.equal(s.resil, 53); assert.equal(s.net5, 15); assert.equal(s.net2, 15); assert.equal(s.net0, 10);
  assert.equal(s.j.carryApplied.rep, 2); assert.equal(s.j.carryApplied.capab, 3);
  assert.equal(s.j.id, brand.journeyId); assert.equal(s.j.carryApplied.cashMul, 1.15);
  // Kết thúc ván (móc kiểm thử) → engine ghi Bậc 3 (entered, cash, rep), khối trước hàng nút «Chơi lại»
  await page.evaluate(() => BP2.engine().bpTest.end());
  await page.waitForFunction(() => BP2.engine().document.querySelector('#bp-end #ft-journey-next'), null, { timeout: 15000 });
  const pb = await passport();
  const be = await page.evaluate(() => { const d = BP2.engine().document, b = d.querySelector('#bp-end #ft-journey-next'); return { txt: b.textContent, nextIsBtnRow: !!(b.nextElementSibling && b.nextElementSibling.classList.contains('gap-3')), target: b.querySelector('a.jl-next').getAttribute('target'), n: d.querySelectorAll('#ft-journey-next').length }; });
  assert.equal(pb.tiers.t3.status, 'done'); assert.equal(pb.tiers.t3.variant, 'brand'); assert.equal(pb.tiers.t3.appVersion, 'bizon-bp-v2'); assert.equal(pb.tiers.t3.entered.length, 7); assert.equal(pb.tiers.t3.cashEnd, 9.2); assert.equal(pb.tiers.t3.repEnd, s.rep);
  assert.match(be.txt, /Bậc 3 đã ghi vào hộ chiếu/); assert.equal(be.nextIsBtnRow, true); assert.equal(be.target, '_top'); assert.equal(be.n, 1);

  // ---- Trang Hành trình: hộ chiếu đủ ba bậc → khối «Nhìn lại cả hành trình» 3 dòng, nút CSV tải một dòng ẩn danh ----
  await page.goto(`${BASE}/hanh-trinh.html`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => !document.getElementById('jr-timeline-box').hidden, null, { timeout: 60000 });
  const tl = await page.evaluate(() => ({ n: document.querySelectorAll('#jr-timeline li').length, txt: document.getElementById('jr-timeline').textContent, carries: document.querySelectorAll('#jr-timeline .carry').length }));
  assert.equal(tl.n, 3); assert.equal(tl.carries, 2); assert.match(tl.txt, /Bậc 1 · Bến Phù Sa/); assert.match(tl.txt, /Mang sang Bậc 3: vốn ×1\.15 = 9\.2 tỷ/);
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('#jr-csv')]);
  const csv = fs.readFileSync(await dl.path(), 'utf8').trim().split('\n');
  assert.equal(csv.length, 2); assert.match(csv[0], /^journey_hash,carry_enabled,t1_eff,/); assert.ok(!csv[1].includes('Đội') && !csv[1].includes(pb.journeyId), 'không tên đội, không journeyId thô');
  assert.match(csv[1], /^[0-9a-f]{8},1,71,2,/); assert.match(dl.suggestedFilename(), /^hanh-trinh-[0-9a-f]{8}\.csv$/);

  await browser.close();
  assert.deepEqual(errors, [], 'không lỗi JS');
  console.log('journey-t3: OK');
})().catch(e => { console.error(e); process.exit(1); });
