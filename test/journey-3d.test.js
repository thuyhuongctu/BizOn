'use strict';
// Hành trình 3 bậc · J8: bản 3D nhận cùng mô-đun – Hộ Chiếu Thương Hiệu 3D và Hộ Chiếu Sầu Riêng 3D (bundle) hỏi hành trang,
// ghi Bậc 3; trang Hành trình có nút «Bản 3D». Cần máy chủ tĩnh (scripts/run-tests.mjs tự bật); WebGL qua swiftshader.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const zlib = require('node:zlib');
const J = require('../js/core/journey.js');
const C = require('../js/journey-card.js');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }

const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const bp3 = read('Ho Chieu Thuong Hieu 3D.html'), ht = read('js/hanh-trinh.js');
assert.match(bp3, /<script src="js\/bp-core\.js"><\/script>\n<!-- Hành trình 3 bậc[^\n]*-->\n<link rel="stylesheet" href="css\/journey\.css">\n<link rel="stylesheet" href="css\/explain-mode\.css">\n<script src="js\/explain-mode\.js"><\/script>\n<script src="js\/journey-sync\.js"><\/script>\n<script src="js\/core\/journey\.js"><\/script><script src="js\/journey-store\.js"><\/script><script src="js\/journey-card\.js"><\/script><script src="js\/journey-link\.js"><\/script>/);
assert.match(bp3, /window\.__bpJourney = window\.BizOnJourneyLink \? BizOnJourneyLink\.attach\('t3', undefined, \{ variant: 'brand' \}\) : null;/);
assert.match(bp3, /stageObs\(\);\n    if \(window\.BizOnJourneyLink && window\.__bpJourney && window\.__bpJourney\.active\) BizOnJourneyLink\.offerCarry\(window\.__bpJourney, \{ variant: 'brand' \}\)\.then\(window\.bpApplyCarry\);\n  \};/);
assert.match(bp3, /BizOnJourneyLink\.complete\(window\.__bpJourney, \{ total: scores\(\)\.total, entered: S\.entered, cash: S\.cash, rep: S\.rep \}, \{ variant: 'brand', appVersion: 'bizon-bp-3d' \}, \{ host: 'bp-end', before: '\.flex\.gap-3\.mt-6' \}\)/);
assert.match(ht, /data-mode="3d"/);
assert.equal(C.gameLink({ journeyId: 'J-X' }, 't2', undefined, '3d'), 'BizOn%20Game%203D.html?journey=J-X');
assert.equal(C.gameLink({ journeyId: 'J-X' }, 't3', 'brand', '3d'), 'Ho%20Chieu%20Thuong%20Hieu%203D.html?journey=J-X');
assert.equal(C.gameLink({ journeyId: 'J-X' }, 't3', 'durian', '3d'), 'lab/ho-chieu-sau-rieng-3d.html?journey=J-X');
assert.equal(C.gameLink({ journeyId: 'J-X' }, 't1', undefined, '3d'), 'ben-phu-sa-3d.html?journey=J-X');
assert.equal(C.gameLink({ journeyId: 'J-X' }, 't1'), 'ben-phu-sa.html?journey=J-X', 'bản 2D không đổi');
// Bundle Sầu Riêng 3D: 4 mô-đun + CSS trong manifest, template nạp chúng và có các móc hành trình
const lines = read('lab/ho-chieu-sau-rieng-3d.html').split('\n');
const at = tag => { const i = lines.findIndex(l => l.trim() === '<script type="' + tag + '">'); assert.ok(i >= 0, 'bundle thiếu ' + tag); return JSON.parse(lines[i + 1]); };
const manifest = at('__bundler/manifest'), template = at('__bundler/template');
const decode = e => { const raw = Buffer.from(e.data, 'base64'); return e.compressed ? zlib.gunzipSync(raw) : raw; };
// Các mô-đun hành trình (+ nhánh hộp đen R1) ghép thành một asset theo thứ tự phụ thuộc (helmet nạp <script> bất đồng bộ, không giữ thứ tự giữa các tệp)
const MODS = ['js/core/journey.js', 'js/journey-store.js', 'js/journey-card.js', 'js/journey-link.js', 'js/journey-sync.js', 'js/explain-mode.js'];
const ASSETS = { '3b7f2c91-6d4e-4a8b-9c15-2e7d8f0a1b3c': 'css/journey.css', '8a4e6d12-3f5b-4c7a-8d9e-1b2c3d4e5f60': MODS };
const srcOf = f => (Array.isArray(f) ? Buffer.concat(f.flatMap((x, i) => (i ? [Buffer.from('\n'), fs.readFileSync(path.join(__dirname, '..', x))] : [fs.readFileSync(path.join(__dirname, '..', x))]))) : fs.readFileSync(path.join(__dirname, '..', f)));
for (const [uuid, file] of Object.entries(ASSETS)) {
  const name = Array.isArray(file) ? file.join(' + ') : file;
  assert.ok(manifest[uuid], name + ': chưa có trong manifest'); assert.equal(manifest[uuid].mime, name.endsWith('.css') ? 'text/css' : 'application/javascript');
  assert.ok(decode(manifest[uuid]).equals(srcOf(file)), name + ': bản nhúng khác tệp nguồn (chạy scripts/release/rebundle-ho-chieu-sau-rieng-3d.mjs)');
  assert.ok(template.includes(name.endsWith('.css') ? '<link rel="stylesheet" href="' + uuid + '">' : '<script src="' + uuid + '"></script>'), name + ': template không nạp ' + uuid);
}
assert.equal(Object.keys(manifest).filter(u => /^(9c5f7e23|a6d08f34|b7e19a45)-/.test(u)).length, 0, 'không còn uuid lẻ của ba mô-đun');
assert.match(template, /this\.journey = window\.BizOnJourneyLink \? window\.BizOnJourneyLink\.attach\('t3', undefined, \{ variant: 'durian' \}\) : null;/);
assert.match(template, /if \(\/\[\?&\]journey=\/\.test\(location\.search\)\) for \(let i = 0; i < 100 && !window\.BizOnJourneyLink; i\+\+\) await new Promise/);
assert.match(template, /pend\.roleId = this\.journey\.passport\.tiers\.t3\.roleId;/);
assert.match(template, /window\.BizOnJourneyLink\.offerCarry\(this\.journey, \{ variant: 'durian', roleId: st\.roleId, cashAdj: \(D\.roles\[st\.roleId\] \|\| \{\}\)\.cashAdj \|\| 0 \}\)\.then\(applied => \{/);
assert.match(template, /if \(st\.n > D\.seasons\.length\) \{ this\.journeyFinish\(st\);/);
assert.match(template, /appVersion: 'bizon-srp-3d'/);
assert.match(template, /<sc-if value="\{\{ sum\.journey \}\}"><a href="hanh-trinh\.html" target="_top" data-journey-next=""/);

// Hộ chiếu: Bậc 1 + Bậc 2 xong
const base = J.recordTier2(J.recordTier1(J.createPassport({ teamName: 'Đội 3D', createdAt: '2026-11-03T02:10:00Z' }), { total: 4.2, result: { eff: 71, rank: 2 }, history: [{ w: 1, m: 1 }, { w: 2, m: 2 }, { w: 3, m: 1 }, { w: 4, m: 0 }, { w: 5, m: 0 }], knownPairs: { '0-2': true } }),
  { balance: 612, brand: 1.22, quickRatio: 1.3, loan: 0, rdCumulative: 60, history: [10, 20, 15, 25, -4, 30].map(x => ({ netProfit: x, share: 31.5, oee: 88, revenue: 100, brandLoyalty: 60 })) });
const durian = J.setTier3Variant(base, 'durian', 'packer'), brand = J.setTier3Variant(base, 'brand');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push('err: ' + e.message)); page.on('dialog', d => d.accept());
  await page.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
  await page.addInitScript(p => { try { if (!sessionStorage.getItem('jt3d-init')) { localStorage.clear(); sessionStorage.setItem('jt3d-init', '1'); localStorage.setItem('bizon-journey', JSON.stringify(p)); } localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} }, brand);
  const setP = p => page.evaluate(p => { localStorage.setItem('bizon-journey', JSON.stringify(p)); Object.keys(localStorage).filter(k => /^(hsr3d_|bizon-bp-save|bizon-bp3d)/.test(k)).forEach(k => localStorage.removeItem(k)); }, p);
  const passport = () => page.evaluate(() => JSON.parse(localStorage.getItem('bizon-journey')));

  // ---- Hộ Chiếu Thương Hiệu 3D ----
  await page.goto(`${BASE}/Ho%20Chieu%20Thuong%20Hieu%203D.html?journey=${encodeURIComponent(brand.journeyId)}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => typeof window.bpStart === 'function' && window.__bpJourney, null, { timeout: 90000 });
  assert.equal(await page.evaluate(() => window.__bpJourney.reason), 'ok');
  const quick = page.getByText('Chơi thử nhanh, không cần điền').first(); if (await quick.count()) await quick.click({ force: true }).catch(() => {});
  await page.waitForFunction(() => !document.getElementById('g3d-demo'), null, { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => { window.bpFirm(0); window.bpStart(); });
  await page.waitForSelector('#jl-modal #jc-accept', { timeout: 20000 });
  const bm = await page.evaluate(() => ({ lines: document.querySelectorAll('#jl-modal .jc-line').length, txt: document.querySelector('#jl-modal').textContent, z: getComputedStyle(document.getElementById('jl-modal')).zIndex }));
  assert.equal(bm.lines, 5); assert.match(bm.txt, /9,2|9\.2/); assert.equal(bm.z, '9000');
  await page.click('#jl-modal #jc-accept');
  await page.waitForFunction(() => !document.getElementById('jl-modal'), null, { timeout: 15000 });
  const s = await page.evaluate(() => { const st = bpTest.state(); const sv = JSON.parse(localStorage.getItem('bizon-bp-save')); return { cash: st.cash, resil: st.resil, net5: st.net[5], net2: st.net[2], j: sv.S.journey }; });
  assert.equal(s.cash, 9.2); assert.equal(s.resil, 53); assert.equal(s.net5, 15); assert.equal(s.net2, 15); assert.equal(s.j.id, brand.journeyId); assert.equal(s.j.carryApplied.cashMul, 1.15);
  await page.evaluate(() => bpTest.end());
  await page.waitForSelector('#bp-end #ft-journey-next', { state: 'attached', timeout: 15000 });
  const pb = await passport();
  const be = await page.evaluate(() => { const b = document.querySelector('#bp-end #ft-journey-next'); return { txt: b.textContent, nextIsBtnRow: !!(b.nextElementSibling && b.nextElementSibling.classList.contains('gap-3')), n: document.querySelectorAll('#ft-journey-next').length }; });
  assert.equal(pb.tiers.t3.status, 'done'); assert.equal(pb.tiers.t3.variant, 'brand'); assert.equal(pb.tiers.t3.appVersion, 'bizon-bp-3d'); assert.equal(pb.tiers.t3.cashEnd, 9.2);
  assert.match(be.txt, /Bậc 3 đã ghi vào hộ chiếu của Đội 3D/); assert.equal(be.nextIsBtnRow, true); assert.equal(be.n, 1);

  // ---- Hộ Chiếu Sầu Riêng 3D (bundle): vai chọn sẵn, hộp thoại trước vụ 1, ghi Bậc 3 + lối tổng kết ----
  await setP(durian);
  await page.goto(`${BASE}/lab/ho-chieu-sau-rieng-3d.html?journey=${encodeURIComponent(durian.journeyId)}&test=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => window.__hsr3d && window.__hsr3d.state.ready && window.DurianData && window.BizOnJourneyLink, null, { timeout: 120000 });
  const d0 = await page.evaluate(() => ({ reason: window.__hsr3d.journey.reason, role: window.__hsr3d.state.roleId, css: !!Array.from(document.styleSheets).find(ss => { try { return Array.from(ss.cssRules).some(r => r.selectorText === '#jl-modal'); } catch (e) { return false; } }), st: JSON.parse(localStorage.getItem('bizon-journey')).tiers.t3.status }));
  assert.deepEqual(d0, { reason: 'ok', role: 'packer', css: true, st: 'playing' });
  await page.evaluate(() => { window.__hsr3d.joinBusiness('packer'); });
  await page.waitForFunction(() => window.__hsr3d.state.phase === 'team', null, { timeout: 15000 });
  await page.evaluate(() => { window.__hsr3d.startGame(); });
  await page.waitForSelector('#jl-modal #jc-accept', { timeout: 20000 });
  const dm = await page.evaluate(() => ({ lines: document.querySelectorAll('#jl-modal .jc-line').length, txt: document.querySelector('#jl-modal').textContent, phase: window.__hsr3d.state.phase }));
  assert.equal(dm.lines, 5); assert.match(dm.txt, /13,8|13\.8/); assert.equal(dm.phase, 'team', 'chưa vào vụ 1 khi đang hỏi');
  await page.click('#jl-modal #jc-accept');
  await page.waitForFunction(() => !document.getElementById('jl-modal') && window.__hsr3d.state.phase === 'play', null, { timeout: 20000 });
  const g1 = await page.evaluate(() => { const st = window.__hsr3d.state.st; return { cash: st.cash, rep: st.rep, resil: st.resil, adapt: st.adapt, linked: st.linkedBonus, cl: st.journey.creditLimitAdj, id: st.journey.id, saved: JSON.parse(localStorage.getItem('hsr3d_test_save_v1')).st.journey.carryApplied.cash, v: JSON.parse(localStorage.getItem('bizon-journey')).tiers.t3 }; });
  assert.equal(g1.cash, 13.8); assert.equal(g1.rep, 52); assert.equal(g1.resil, 53); assert.equal(g1.adapt, 43); assert.equal(g1.linked, 0.05); assert.equal(g1.cl, 0); assert.equal(g1.id, durian.journeyId); assert.equal(g1.saved, 13.8);
  assert.equal(g1.v.variant, 'durian'); assert.equal(g1.v.roleId, 'packer');
  // Hết mùa (mô phỏng: một vụ thật rồi ép n = 7) → ghi Bậc 3, bảng tổng kết có lối «Xem tổng kết hành trình»
  await page.evaluate(() => { const c = window.__hsr3d, D = window.DurianData, E = window.DurianEngine; const st = E.playSeason(D, c.state.st, c.decision(c.state.dec)); st.n = D.seasons.length + 1; c.journeyFinish(st); c.setState({ st, phase: 'summary', focus: 'board-summary', talk: null }); });
  await page.waitForSelector('[data-journey-next]', { state: 'attached', timeout: 20000 });
  const p3 = await passport();
  assert.equal(p3.tiers.t3.status, 'done'); assert.equal(p3.tiers.t3.variant, 'durian'); assert.equal(p3.tiers.t3.roleId, 'packer'); assert.equal(p3.tiers.t3.appVersion, 'bizon-srp-3d');
  assert.ok(p3.tiers.t3.channelOrder.length >= 1); assert.equal(p3.tiers.t3.carryApplied.cash, 13.8);
  const lnk = await page.evaluate(() => { const a = document.querySelector('[data-journey-next]'); return { href: a.getAttribute('href'), target: a.getAttribute('target'), txt: a.textContent, abs: a.href }; });
  assert.equal(lnk.href, 'hanh-trinh.html'); assert.equal(lnk.target, '_top'); assert.match(lnk.txt, /Xem tổng kết hành trình/); assert.match(lnk.abs, /\/hanh-trinh\.html$/, 'base href ../ → trang gốc');

  // ---- Trang Hành trình: mỗi bậc mở có thêm nút «Bản 3D» ----
  await setP(J.setTier3Variant(base, 'durian', 'packer'));
  await page.goto(`${BASE}/hanh-trinh.html`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForSelector('.jr-tier[data-tier="t3"] a.go.alt', { timeout: 60000 });
  const alt = await page.evaluate(() => Array.from(document.querySelectorAll('.jr-tier a.go.alt')).map(a => [a.closest('.jr-tier').dataset.tier, a.getAttribute('href'), a.textContent]));
  assert.deepEqual(alt, [['t3', 'lab/ho-chieu-sau-rieng-3d.html?journey=' + base.journeyId, '🧊 Bản 3D']]);
  assert.match(await page.getAttribute('.jr-tier[data-tier="t3"] a.go', 'href'), /^lab\/ho-chieu-sau-rieng-v2\.html\?journey=/, 'nút chính vẫn là bản gọn');

  await browser.close();
  assert.deepEqual(errors, [], 'không lỗi JS');
  console.log('journey-3d: OK');
})().catch(e => { console.error(e); process.exit(1); });
