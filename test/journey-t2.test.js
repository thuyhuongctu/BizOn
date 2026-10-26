'use strict';
// Hành trình 3 bậc · J5: Bật Nghiệp (game.html, bat-nghiep-v2.html) hỏi nhận hành trang trước màn mở đầu, áp vào ván mới,
// Lumina chào theo phong cách Bậc 1, ghi Bậc 2 cuối ván, khối «Sang Bậc 3». Cần máy chủ tĩnh (scripts/run-tests.mjs tự bật).
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const J = require('../js/core/journey.js');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }

const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const app = read('js/app.js'), bn2 = read('js/bn2-ui.js'), link = read('js/journey-link.js');
assert.match(read('game.html'), /<script src="js\/journey-link\.js"><\/script>\n<script src="js\/app\.js"><\/script>\n<script>window\.__bnJourney = window\.BizOnJourneyLink \? BizOnJourneyLink\.attach\('t2'\) : null;/);
assert.match(read('bat-nghiep-v2.html'), /<script src="js\/journey-link\.js"><\/script>\n<script src="js\/bn2-ui\.js"><\/script>/);
assert.match(read('BizOn Game 3D.html'), /document\.getElementById\('gf'\)\.src = 'game\.html\?journey=' \+ m\[1\];/, 'bản 3D chuyển ?journey= vào iframe');
assert.match(app, /const applied = await BizOnJourneyLink\.offerCarry\(window\.__bnJourney, \{ classControls: controls \}\);\n    BizOnJourneyLink\.stamp\(S, window\.__bnJourney, applied\);\n    if \(applied\) BizOnJourney\.applyToTier2\(S, \{ applied \}\);/, 'app.js: hỏi hành trang rồi áp vào ván mới');
assert.match(app, /if \(!restored && window\.BizOnJourneyLink && window\.__bnJourney && window\.__bnJourney\.active\) \{/, 'app.js: chỉ ván mới');
assert.match(app, /BizOnClassSync\.fetchControls\(classId, team\), new Promise\(r => setTimeout\(\(\) => r\(null\), 2500\)\)/, 'app.js: cờ lớp đọc một lần, chờ tối đa 2,5 s');
assert.match(app, /if \(S\.finished\) \{ journeyFinish2\(\); currentReport = 'season';/);
assert.match(app, /function renderSeasonReport\(body\) \{\n  renderSeasonReportBody\(body\);\n  if \(S && S\.finished\) \{ journeyFinish2\(\); journeyEndBlock\(body\); \}\n\}/);
assert.match(app, /\$\{window\.BizOnJourneyLink \? BizOnJourneyLink\.introExtrasHtml\(S\) : ''\}/, 'app.js: lời chào + bản tin trong thẻ biến cố');
assert.match(bn2, /ui\.journey = window\.BizOnJourneyLink \? BizOnJourneyLink\.attach\('t2'\) : null;/);
assert.match(bn2, /const applied = await BizOnJourneyLink\.offerCarry\(ui\.journey, \{ classControls: controls \}\);/);
assert.match(bn2, /BizOnJourneyLink\.finish\(ui\.journey, S, \{ appVersion: 'bizon-bn-v2' \}\)/);
assert.match(bn2, /BizOnJourneyLink\.endHtml\(ui\.journey\)/);
assert.match(read('js/class-sync.js'), /async function fetchControls\(code, team\)/);
assert.match(link, /function offerCarry\(ctx, opts\)/); assert.match(link, /function greeting\(p\)/); assert.match(link, /function introExtrasHtml\(S\)/);

(async () => {
  // Hộ chiếu đã xong Bậc 1 (dò đường kỹ: 2 tuần gánh + 1 khảo sát), tự học → hành trang bật
  let passport = J.recordTier1(J.createPassport({ teamName: 'Đội Thử', createdAt: '2026-11-03T02:10:00Z' }), { total: 4.2, result: { eff: 71, rank: 2 }, history: [{ w: 1, m: 1 }, { w: 2, m: 2 }, { w: 3, m: 1 }, { w: 4, m: 0 }, { w: 5, m: 0 }], knownPairs: { '0-2': true, '1-4': true, '2-1': true } });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push('err: ' + e.message)); page.on('dialog', d => d.accept());
  await page.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
  await page.addInitScript(p => { try { if (!sessionStorage.getItem('jt2-init')) { localStorage.clear(); sessionStorage.setItem('jt2-init', '1'); localStorage.setItem('bizon-journey', JSON.stringify(p)); localStorage.setItem('bizon-intro-seen', '1'); } localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} }, passport);

  // ---- game.html ----
  await page.goto(`${BASE}/game.html?journey=${encodeURIComponent(passport.journeyId)}`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => typeof window.doLoginDemo === 'function' && window.__bnJourney, null, { timeout: 60000 });
  const b = await page.evaluate(() => { const el = document.getElementById('ft-journey'); return { reason: el && el.dataset.reason, inLogin: !!(el && el.closest('#screen-login')), st: JSON.parse(localStorage.getItem('bizon-journey')).tiers.t2.status }; });
  assert.equal(b.reason, 'ok'); assert.equal(b.inLogin, true, 'băng nằm trong màn đăng nhập'); assert.equal(b.st, 'playing');
  // Đội Demo (mã DEMO-2026 = tự học) → hộp thoại hành trang hiện TRƯỚC khi vào game
  await page.evaluate(() => { window.doLoginDemo(); });
  await page.waitForSelector('#jl-modal #jc-accept', { timeout: 15000 });
  const m = await page.evaluate(() => ({ lines: document.querySelectorAll('#jl-modal .jc-line').length, txt: document.querySelector('#jl-modal').textContent, appShellHidden: document.getElementById('app-shell').classList.contains('hidden') }));
  assert.equal(m.lines, 3); assert.match(m.txt, /528 triệu/); assert.equal(m.appShellHidden, true, 'chưa vào game khi đang hỏi');
  await page.click('#jl-modal #jc-accept');
  await page.waitForFunction(() => !document.getElementById('jl-modal') && typeof S !== 'undefined' && S && !document.getElementById('app-shell').classList.contains('hidden'), null, { timeout: 15000 });
  const s1 = await page.evaluate(() => ({ balance: S.balance, brand: S.brand, j: S.journey, round: S.round, choice: window.__bnJourney.choice }));
  assert.equal(s1.balance, 528); assert.equal(s1.brand, 1.05); assert.equal(s1.round, 1); assert.equal(s1.choice, 'accept');
  assert.equal(s1.j.id, passport.journeyId); assert.equal(s1.j.marketBrief, true); assert.match(s1.j.greeting.vi, /dò đường kỹ \(3\/5 tuần/); assert.equal(s1.j.carryApplied.balanceBonus, 28);
  // Thẻ biến cố vòng 1: lời chào + bản tin thị trường (3 đối thủ)
  await page.evaluate(() => { document.querySelectorAll('.fixed.inset-0').forEach(d => d.remove()); window.maybeShowEventIntro(); });
  await page.waitForSelector('#ev-cta', { timeout: 10000 });
  const ev = await page.evaluate(() => ({ greet: !!document.querySelector('.jl-greet'), brief: document.querySelectorAll('.jl-brief li').length, txt: (document.querySelector('.jl-brief') || {}).textContent || '' }));
  assert.equal(ev.greet, true); assert.equal(ev.brief, 3); assert.match(ev.txt, /Alpha Dynamics/);
  await page.click('#ev-close');
  // Kết thúc ván (mô phỏng trạng thái cuối 6 vòng) → ghi Bậc 2, báo cáo mùa có khối «Sang Bậc 3 · Hộ Chiếu Sầu Riêng»
  await page.evaluate(() => { S.finished = true; S.round = 7; S.committed = false; S.balance = 612; S.brand = 1.22; S.quickRatio = 1.3; S.loan = 0; S.rdCumulative = 60; S.history = [10, 20, 15, 25, -4, 30].map(p => ({ netProfit: p, share: 31.5, oee: 88, revenue: 100, brandLoyalty: 60, round: 1 })); window.__bnJourneyFinish(); });
  const p2 = await page.evaluate(() => JSON.parse(localStorage.getItem('bizon-journey')));
  assert.equal(p2.tiers.t2.status, 'done'); assert.equal(p2.tiers.t2.appVersion, 'bizon-bn-v1'); assert.equal(p2.tiers.t2.balanceEnd, 612); assert.equal(p2.tiers.t2.profitableRounds, 5);
  assert.equal(p2.carry.t3.variant, 'durian'); assert.equal(p2.carry.t3.cashMul, 1.15); assert.equal(p2.carry.t3.adapt, 3);
  await page.evaluate(() => { const body = document.createElement('div'); document.body.appendChild(body); body.id = 'jt2-season'; window.renderSeasonReport(body); });
  const end = await page.evaluate(() => { const b = document.querySelector('#jt2-season #ft-journey-next'); return { has: !!b, txt: b && b.textContent, href: b && b.querySelector('a.jl-next').getAttribute('href'), lines: b ? b.querySelectorAll('.jc-line').length : -1 }; });
  assert.equal(end.has, true); assert.match(end.txt, /Bậc 2 đã ghi vào hộ chiếu của Đội Thử/); assert.match(end.txt, /Sang Bậc 3 · Hộ Chiếu Sầu Riêng/); assert.equal(end.href, 'hanh-trinh.html'); assert.equal(end.lines, 5);
  // Ghi lại không đổi hộ chiếu
  const before = await page.evaluate(() => localStorage.getItem('bizon-journey'));
  await page.evaluate(() => window.__bnJourneyFinish()); assert.equal(await page.evaluate(() => localStorage.getItem('bizon-journey')), before);

  // ---- bat-nghiep-v2.html: hộ chiếu mới (Bậc 1 xong), chọn «Chơi độc lập» → vốn 500, không hành trang; mã lớp thật → hành trang tắt ----
  await page.evaluate(p => { localStorage.setItem('bizon-journey', JSON.stringify(p)); localStorage.removeItem('bizon-save'); Object.keys(localStorage).filter(k => /^bizon-(game|state|save)/.test(k)).forEach(k => localStorage.removeItem(k)); }, passport);
  await page.goto(`${BASE}/bat-nghiep-v2.html?journey=${encodeURIComponent(passport.journeyId)}`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForSelector('#bn2-login', { timeout: 60000 });
  assert.equal(await page.evaluate(() => (document.getElementById('ft-journey') || {}).dataset?.reason), 'ok', 'băng ở màn mở đầu bản gọn');
  await page.fill('#bn2-login input[name=team]', 'Đội Gọn'); await page.click('#bn2-login button[type=submit]');
  await page.waitForSelector('#jl-modal #jc-solo', { timeout: 15000 });
  await page.click('#jl-modal #jc-solo');
  await page.waitForFunction(() => !document.getElementById('jl-modal') && document.querySelector('[data-act=commit]'), null, { timeout: 15000 });
  const v2 = await page.evaluate(() => ({ balance: S.balance, brand: S.brand, j: S.journey }));
  assert.equal(v2.balance, 500); assert.equal(v2.brand, 1); assert.equal(v2.j.carryApplied, null); assert.equal(v2.j.id, passport.journeyId);
  // Lớp chấm điểm: hộ chiếu có mã lớp thật, không có cờ lớp → thẻ tắt, chỉ nút «Bắt đầu»
  const graded = J.recordTier1(J.createPassport({ classCode: 'QTKD-K48', teamName: 'Đội Lớp', createdAt: '2026-11-03T02:10:00Z' }), { total: 4.2, result: { eff: 71, rank: 2 }, history: [], knownPairs: {} });
  await page.evaluate(p => { localStorage.setItem('bizon-journey', JSON.stringify(p)); Object.keys(localStorage).filter(k => /^bizon-(game|state|save)/.test(k)).forEach(k => localStorage.removeItem(k)); }, graded);
  await page.goto(`${BASE}/bat-nghiep-v2.html?journey=${encodeURIComponent(graded.journeyId)}`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForSelector('#bn2-login', { timeout: 60000 });
  await page.fill('#bn2-login input[name=team]', 'Đội Lớp'); await page.click('#bn2-login button[type=submit]');
  await page.waitForSelector('#jl-modal', { timeout: 15000 });
  const g = await page.evaluate(() => ({ off: !!document.querySelector('#jl-modal .jc-card.jc-off'), accept: !!document.querySelector('#jl-modal #jc-accept'), note: !!document.querySelector('#jl-modal .jl-modal-note') }));
  assert.deepEqual(g, { off: true, accept: false, note: true }, 'lớp chấm điểm: hành trang tắt, có ghi chú');
  await page.click('#jl-modal #jc-solo');
  await page.waitForFunction(() => !document.getElementById('jl-modal') && typeof S !== 'undefined' && S, null, { timeout: 15000 });
  assert.equal(await page.evaluate(() => S.balance), 500);

  await browser.close();
  assert.deepEqual(errors, [], 'không lỗi JS');
  console.log('journey-t2: OK');
})().catch(e => { console.error(e); process.exit(1); });
