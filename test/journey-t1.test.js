'use strict';
// Hành trình 3 bậc · J4: Bến Phù Sa đọc ?journey=, ghi Bậc 1 vào hộ chiếu cuối ván, khối «Sang Bậc 2».
// Tĩnh: cả hai trang (2D, 3D) và bản gọn được nối; trình duyệt: đi trọn 5 tuần với hộ chiếu thật trong localStorage.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const J = require('../js/core/journey.js');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }

const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
for (const [f, ver] of [['ben-phu-sa.html', 'bizon-bps-v1'], ['ben-phu-sa-3d.html', 'bizon-bps3d-v2']]) {
  const s = read(f);
  assert.match(s, /<script src="js\/core\/journey\.js"><\/script><script src="js\/journey-store\.js"><\/script><script src="js\/journey-card\.js"><\/script><script src="js\/journey-link\.js"><\/script>/, f + ': nạp bốn mô-đun');
  assert.match(s, /href="css\/journey\.css"/, f);
  assert.match(s, /window\.__ftJourney = window\.BizOnJourneyLink \? BizOnJourneyLink\.attach\('t1'\) : null; if \(window\.__ftJourney && window\.__ftJourney\.id\) BizOnJourneyLink\.mountBanner\(window\.__ftJourney, 'ft-intro'\);/, f + ': attach + băng');
  assert.match(s, new RegExp("S\\.result = \\{ eff: eff, rank: rank \\+ 1 \\};\\n[^\\n]*\\n    if \\(window\\.BizOnJourneyLink && window\\.__ftJourney\\) BizOnJourneyLink\\.complete\\(window\\.__ftJourney, S, \\{ appVersion: '" + ver + "' \\}, \\{ host: 'ft-end', before: 'a\\[href=\"game\\.html\"\\]' \\}\\);"), f + ': complete() ngay sau S.result');
}
assert.match(read('js/bps2-ui.js'), /fr\.src = 'ben-phu-sa\.html\?embed=1' \+ \(jm \? '&journey=' \+ jm\[1\] : ''\);/, 'bản gọn chuyển ?journey= vào engine');
const sw = read('sw.js');
for (const f of ['./hanh-trinh.html', './js/hanh-trinh.js', './js/core/journey.js', './js/journey-store.js', './js/journey-card.js', './js/journey-link.js', './css/journey.css']) assert.ok(sw.includes(`'${f}'`), 'sw SHELL: ' + f);

(async () => {
  const passport = J.createPassport({ teamName: 'Đội Thử', createdAt: '2026-11-03T02:10:00Z' });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push('err: ' + e.message)); page.on('dialog', d => d.accept());
  await page.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
  await page.addInitScript(p => { try { if (!sessionStorage.getItem('jt1-init')) { localStorage.clear(); sessionStorage.setItem('jt1-init', '1'); localStorage.setItem('bizon-journey', JSON.stringify(p)); } localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} }, passport);

  // 1. Mở với ?journey= đúng → băng «Bậc 1/3 · Đội Thử», bậc 1 chuyển «đang chơi»
  await page.goto(`${BASE}/ben-phu-sa.html?journey=${encodeURIComponent(passport.journeyId)}`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => !!window.ftTest && window.__ftJourney, null, { timeout: 60000 });
  const b1 = await page.evaluate(() => { const b = document.getElementById('ft-journey'); return { reason: b && b.dataset.reason, text: b && b.textContent, parent: b && b.parentElement.id, ctx: window.__ftJourney.reason, st: JSON.parse(localStorage.getItem('bizon-journey')).tiers.t1.status }; });
  assert.equal(b1.reason, 'ok'); assert.match(b1.text, /Bậc 1\/3 · Đội Thử/); assert.equal(b1.parent, 'ft-intro'); assert.equal(b1.st, 'playing');

  // 2. Đi trọn 5 tuần qua API của engine (gánh hàng rong, món 0 × khu 2; lễ cúng sau tuần 2)
  await page.evaluate(() => { window.ftTeam(0); window.ftStart(); });
  for (let w = 0; w < 5; w++) {
    await page.evaluate(() => { window.ftPick('menu', 0); window.ftPick('loc', 2); window.ftPick('m', 1); window.ftCommit(); });
    await page.waitForTimeout(150);
    if (await page.evaluate(() => window.ftTest.phase() === 'ritual')) await page.evaluate(() => window.ftRitualNext(true));
  }
  await page.waitForFunction(() => window.ftTest.phase() === 'end', null, { timeout: 10000 });
  const end = await page.evaluate(() => {
    const p = JSON.parse(localStorage.getItem('bizon-journey')), blk = document.getElementById('ft-journey-next'), a = document.querySelector('#ft-end a.jl-next'), old = document.querySelector('#ft-end a[href="hanh-trinh.html"].clay-btn');
    return { st: window.ftTest.state(), t1: p.tiers.t1, carry: p.carry.t2, blk: blk && blk.textContent, lines: blk ? blk.querySelectorAll('.jc-line').length : -1, next: a && a.getAttribute('href') + '|' + a.target + '|' + a.textContent, old: old && old.textContent, ctx: window.__ftJourney.reason };
  });
  assert.equal(end.t1.status, 'done'); assert.equal(end.t1.appVersion, 'bizon-bps-v1');
  assert.equal(end.t1.eff, end.st.result.eff); assert.equal(end.t1.rank, end.st.result.rank);
  assert.equal(end.t1.weeks.length, 5); assert.deepEqual(end.t1.style, { exploreWeeks: 5, exploitWeeks: 0, surveyWeeks: 0 });
  assert.ok(end.t1.knownPairs.includes('0-2'), 'cặp đã bán được ghi: ' + end.t1.knownPairs);
  assert.equal(end.carry.balance, 500 + end.carry.balanceBonus, 'hành trang T1→T2 đã tính sẵn');
  assert.match(end.blk, /Bậc 1 đã ghi vào hộ chiếu của Đội Thử/); assert.equal(end.lines, 3, 'xem trước 3 khoản hành trang');
  assert.equal(end.next, 'hanh-trinh.html|_top|🧭 Sang Bậc 2 · Bật Nghiệp →');
  assert.match(end.old, /Tiếp tục hành trình/, 'nút «Lên Bậc 2» cũ trỏ về trang Hành trình');
  assert.equal(end.ctx, 'done');

  // 3. Chơi lại cùng URL: bậc đã ghi → băng «không ghi đè», kết thúc không đổi hộ chiếu
  const before = await page.evaluate(() => localStorage.getItem('bizon-journey'));
  await page.reload({ waitUntil: 'commit' }); await page.waitForFunction(() => !!window.ftTest && window.__ftJourney, null, { timeout: 60000 });
  assert.equal(await page.evaluate(() => document.getElementById('ft-journey').dataset.reason), 'done');
  assert.equal(await page.evaluate(() => window.__ftJourney.active), false);
  await page.evaluate(() => { window.ftTeam(1); window.ftStart(); });
  for (let w = 0; w < 5; w++) { await page.evaluate(() => { window.ftPick('menu', 1); window.ftPick('loc', 0); window.ftPick('m', 1); window.ftCommit(); }); await page.waitForTimeout(150); if (await page.evaluate(() => window.ftTest.phase() === 'ritual')) await page.evaluate(() => window.ftRitualNext(true)); }
  await page.waitForFunction(() => window.ftTest.phase() === 'end', null, { timeout: 10000 });
  assert.equal(await page.evaluate(() => localStorage.getItem('bizon-journey')), before, 'ván chơi lại không ghi đè hộ chiếu');
  assert.equal(await page.evaluate(() => !!document.getElementById('ft-journey-next')), false);

  // 4. Hộ chiếu không khớp → băng cảnh báo, chơi độc lập; không có ?journey= → không có gì
  await page.goto(`${BASE}/ben-phu-sa.html?journey=J-KHAC`, { waitUntil: 'commit' }); await page.waitForFunction(() => !!window.ftTest && window.__ftJourney, null, { timeout: 60000 });
  assert.equal(await page.evaluate(() => document.getElementById('ft-journey').dataset.reason), 'mismatch');
  await page.goto(`${BASE}/ben-phu-sa.html`, { waitUntil: 'commit' }); await page.waitForFunction(() => !!window.ftTest, null, { timeout: 60000 });
  assert.equal(await page.evaluate(() => ({ b: !!document.getElementById('ft-journey'), id: window.__ftJourney && window.__ftJourney.id })).then(r => !!(r.b || r.id)), false, 'không ?journey= → không băng');

  // 5. Bản gọn chuyển tham số vào iframe engine
  await page.goto(`${BASE}/ben-phu-sa-v2.html?journey=${encodeURIComponent(passport.journeyId)}`, { waitUntil: 'commit' });
  await page.waitForFunction(() => document.getElementById('bps2-engine') && /journey=/.test(document.getElementById('bps2-engine').src), null, { timeout: 60000 });
  assert.match(await page.evaluate(() => document.getElementById('bps2-engine').src), /ben-phu-sa\.html\?embed=1&journey=J-TU-HOC-DOI-THU-2026-11-03$/);

  await browser.close();
  assert.deepEqual(errors, [], 'không lỗi JS');
  console.log('journey-t1: OK');
})().catch(e => { console.error(e); process.exit(1); });
