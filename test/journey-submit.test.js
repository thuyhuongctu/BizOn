'use strict';
// Hành trình 3 bậc · J10: kết quả nộp về lớp kèm journey = { journeyId, tier, carryApplied } (p_detail_json / result_json),
// Trang Giảng viên đánh dấu 🧭. RPC giả lập bằng page.route; cần máy chủ tĩnh.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const J = require('../js/core/journey.js');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

assert.match(read('js/journey-link.js'), /function submitInfo\(src\)/); assert.match(read('js/journey-link.js'), /endHtml, submitInfo, lang \}\)/);
for (const f of ['ben-phu-sa.html', 'ben-phu-sa-3d.html']) assert.ok(read(f).includes('p_detail_json: { journey: window.BizOnJourneyLink ? BizOnJourneyLink.submitInfo(window.__ftJourney) : null, '), f);
for (const f of ['brand-passport.html', 'Ho Chieu Thuong Hieu 3D.html']) assert.ok(read(f).includes('p_detail_json: { journey: window.BizOnJourneyLink ? BizOnJourneyLink.submitInfo(S) : null, seed: seedBase,'), f);
assert.match(read('js/backend.js'), /journey: \(window\.BizOnJourneyLink && typeof BizOnJourneyLink\.submitInfo === 'function'\) \? BizOnJourneyLink\.submitInfo\(S\) : null,/);
const gv = read('Trang Giang Vien.dc.html'); assert.match(gv, /t\.rs\.some\(r => r\.result_json && r\.result_json\.journey\) \? ' 🧭' : ''/); assert.match(gv, /🧭 hành trình/);

(async () => {
  const passport = J.createPassport({ classCode: 'KT-TEST', teamName: 'Đội Nộp', createdAt: '2026-11-03T02:10:00Z' });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errors = [], rpcCalls = [];
  page.on('pageerror', e => errors.push('err: ' + e.message)); page.on('dialog', d => d.accept());
  await page.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
  await page.route('**/rest/v1/rpc/**', async route => {
    const fn = route.request().url().split('/rpc/')[1].split('?')[0]; let body = {}; try { body = JSON.parse(route.request().postData() || '{}'); } catch (e) {}
    rpcCalls.push({ fn, body });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fn === 'bizon_student_domains' ? ['student.ctu.edu.vn'] : fn === 'bizon_journey_get' ? null : fn === 'bizon_journey_upsert' ? { ok: 1 } : null) });
  });
  await page.addInitScript(p => { try { if (!sessionStorage.getItem('js2-init')) { localStorage.clear(); sessionStorage.setItem('js2-init', '1'); localStorage.setItem('bizon-journey', JSON.stringify(p)); sessionStorage.setItem('bizon-student-session', JSON.stringify({ accessToken: 'test-token', email: 'sva@student.ctu.edu.vn', expiresAt: Date.now() + 3600000 })); } localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} }, passport);

  // Bến Phù Sa: chơi hết 5 tuần rồi nộp → p_detail_json.journey = { journeyId, tier: 't1', carryApplied: null }
  await page.goto(`${BASE}/ben-phu-sa.html?journey=${encodeURIComponent(passport.journeyId)}`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => !!window.ftTest && window.__ftJourney && window.BizOnJourneyLink, null, { timeout: 60000 });
  await page.evaluate(() => { window.ftTeam(0); window.ftStart(); });
  for (let w = 0; w < 5; w++) {
    await page.evaluate(() => { window.ftPick('menu', 0); window.ftPick('loc', 2); window.ftPick('m', 1); window.ftCommit(); });
    await page.waitForTimeout(150);
    if (await page.evaluate(() => window.ftTest.phase() === 'ritual')) await page.evaluate(() => window.ftRitualNext(true));
  }
  await page.waitForFunction(() => window.ftTest.phase() === 'end', null, { timeout: 10000 });
  await page.evaluate(() => { document.getElementById('ft-class').value = 'KT-TEST'; document.getElementById('ft-name').value = 'Thu'; return window.ftSubmit(); });
  await page.waitForFunction(() => /Đã nộp/.test(document.getElementById('ft-send-msg').textContent), null, { timeout: 15000 });
  const sub = rpcCalls.filter(c => c.fn === 'bizon_submit_ft_result'); assert.equal(sub.length, 1);
  assert.deepEqual(sub[0].body.p_detail_json.journey, { journeyId: passport.journeyId, tier: 't1', carryApplied: null });
  assert.ok(sub[0].body.p_detail_json.captain, 'các trường cũ vẫn còn');
  // submitInfo cho Bậc 2/3 (trạng thái ván đã stamp) và ván ngoài hành trình
  const si = await page.evaluate(() => [
    BizOnJourneyLink.submitInfo({ journey: { id: 'J-X', tier: 't2', carryApplied: { balance: 528, balanceBonus: 28, brand: 1.05, marketBrief: true }, greeting: { vi: 'x' } } }),
    BizOnJourneyLink.submitInfo({ journey: { id: 'J-X', tier: 't3', carryApplied: null } }),
    BizOnJourneyLink.submitInfo({ balance: 500 }), BizOnJourneyLink.submitInfo(null), BizOnJourneyLink.submitInfo({ id: null, tier: 't1' })
  ]);
  assert.deepEqual(si, [{ journeyId: 'J-X', tier: 't2', carryApplied: { balance: 528, balanceBonus: 28, brand: 1.05, marketBrief: true } }, { journeyId: 'J-X', tier: 't3', carryApplied: null }, null, null, null]);
  // Không có ?journey= → journey: null trong payload
  await page.goto(`${BASE}/ben-phu-sa.html`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => !!window.ftTest && window.BizOnJourneyLink, null, { timeout: 60000 });
  assert.equal(await page.evaluate(() => BizOnJourneyLink.submitInfo(window.__ftJourney)), null);

  await browser.close();
  assert.deepEqual(errors, [], 'không lỗi JS');
  console.log('journey-submit: OK');
})().catch(e => { console.error(e); process.exit(1); });
