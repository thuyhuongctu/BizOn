'use strict';
// Nhánh nghiên cứu «hộp đen» · R1: cờ lớp class_controls.explain_hidden → js/explain-mode.js thêm html.bz-blackbox,
// css/explain-mode.css giấu phần giải thích cơ chế; điều kiện ('hidden'|'shown') ghi vào kết quả nộp và hộ chiếu.
// Feed lớp giả lập bằng page.route; cần máy chủ tĩnh (BIZON_URL).
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const J = require('../js/core/journey.js');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const EXPL = "explain: window.BizOnExplain ? BizOnExplain.condition() : 'shown'";

// --- tĩnh: tệp, nạp trang, bề mặt được gắn lớp, payload, hộ chiếu, Trang Giảng viên, migration, sw ---
const em = read('js/explain-mode.js'), css = read('css/explain-mode.css');
assert.match(em, /window\.BizOnExplain = \{ init, applyControls, condition, ready/); assert.match(em, /rpc\/bizon_class_feed/); assert.match(em, /\[\?&\]explain=\(hidden\|shown\)/);
for (const sel of ['html.bz-blackbox .bz-explain', '#dash-lumina', '#advisor-chat', '.bp-adv', '#bp-footprint', '#bp-lesson', '.jc-lines', '.jc-bb', '.bz-blackbox-note']) assert.ok(css.includes(sel), 'css thiếu ' + sel);
for (const [f, pre] of [['ben-phu-sa.html', ''], ['ben-phu-sa-3d.html', ''], ['game.html', ''], ['bat-nghiep-v2.html', ''], ['brand-passport.html', ''], ['Ho Chieu Thuong Hieu 3D.html', ''], ['lab/ho-chieu-sau-rieng-v2.html', '../']])
  assert.ok(read(f).includes(`<link rel="stylesheet" href="${pre}css/explain-mode.css">\n<script src="${pre}js/explain-mode.js"></script>\n<script src="${pre}js/journey-sync.js"></script>`), f + ': nạp explain-mode trước journey-sync');
for (const f of ['ben-phu-sa.html', 'ben-phu-sa-3d.html']) { const s = read(f); assert.ok(s.includes('mt-3 bz-explain" data-en-html="💡 Core lesson'), f + ': bài học cốt lõi'); assert.ok(s.includes(EXPL + ','), f + ': payload'); assert.match(s, /setItem\('bps-class', klass\)[^\n]*\n\s*if \(window\.BizOnExplain\) BizOnExplain\.init\(\{ classCode: klass \}\);/); }
for (const f of ['brand-passport.html', 'Ho Chieu Thuong Hieu 3D.html']) { const s = read(f); assert.ok(s.includes(EXPL + ', seed: seedBase,'), f + ': payload'); assert.match(s, /setItem\('bp-class', klass\)[^\n]*\n\s*if \(window\.BizOnExplain\) BizOnExplain\.init\(\{ classCode: klass \}\);/); }
{ const g = read('game.html'); assert.match(g, /text-xs bz-explain">Hỏi<\/button>/); assert.match(g, /<div class="clay-card p-4 mb-4 bz-explain">\n\s*<p class="font-bold text-sm text-deep-teal mb-1">🔮 Mô phỏng/); assert.match(g, /id="advisor-chat"[^\n]*\n\s*<div class="clay-card p-4 mb-4 bz-blackbox-note">/); }
{ const a = read('js/app.js'); assert.match(a, /mt-6\$\{\(window\.BizOnJourneyLink && BizOnJourneyLink\.introExtrasHtml\(S\)\) \? '' : ' bz-explain'\}/); assert.match(a, /leading-relaxed bz-explain">"\$\{ev\.luminaMsg\}"/); assert.match(a, /if \(window\.BizOnExplain\) BizOnExplain\.init\(\{ classCode: classId \}\);/); }
{ const b = read('js/bn2-ui.js'); assert.match(b, /class="bn2-say bz-explain"/); assert.match(b, /class="bn2-sunk bz-explain" style="margin-top:6px"/); assert.match(b, /<section class="bn2-card bz-blackbox-note"[\s\S]*<section class="bn2-card bz-explain" aria-labelledby="bn2-lum-h">/); assert.match(b, /BizOnExplain\.init\(\{ classCode: classId \}\)/); }
assert.match(read('js/dp2-ui.js'), /class="bn2-sunk bz-explain" style="margin-top:14px"/); assert.match(read('js/dp2-ui.js'), /BizOnExplain\.init\(\{ classCode: cls \}\)/);
assert.match(read('js/backend.js'), new RegExp(EXPL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ',')); assert.match(read('js/class-sync.js'), /BizOnExplain\.applyControls\(ctl \|\| \{\}, code\)/);
assert.match(read('js/journey-link.js'), /meta = Object\.assign\(\{\}, meta \|\| \{\}, \{ explain: /); assert.equal((read('js/core/journey.js').match(/explain: text\(meta\.explain, 'shown'\)/g) || []).length, 3);
assert.match(read('js/journey-card.js'), /<p class="jc-bb jc-muted">/); assert.match(read('js/hanh-trinh.js'), /'explain_t1', 'explain_t2', 'explain_t3'/);
{ const gv = read('Trang Giang Vien.dc.html'); assert.match(gv, /data-panel="explain"/); assert.match(gv, /🔬 Giải thích cơ chế/); assert.match(gv, /async setExplainHidden\(on\)/); assert.match(gv, /j\.explain === 'hidden' \? ' · 🔬 hộp đen' : ''/); }
assert.match(read('js/instructor-api.js'), /bizon_set_explain_hidden/);
{ const m = read('supabase/migrations/20261027000000_explain_mode.sql'); assert.match(m, /add column if not exists explain_hidden boolean/); assert.match(m, /'explain_hidden', c\.explain_hidden/); assert.match(m, /'journey_carry', c\.journey_carry/); assert.match(m, /revoke all on function public\.bizon_set_explain_hidden\(text, boolean\) from public, anon/); }
assert.match(read('.github/workflows/supabase-student-login.yml'), /explain_mode_smoke\.sql/);
{ const sw = read('sw.js'); assert.match(sw, /const CACHE = 'bizon-v\d+';/); assert.ok(sw.includes("'./js/explain-mode.js'") && sw.includes("'./css/explain-mode.css'"), 'sw precache'); }
// Lõi: điều kiện mặc định 'shown', ghi theo meta
{ let p = J.createPassport({ classCode: 'X', teamName: 'T' }); p = J.recordTier1(p, { total: 1, result: { eff: 50, rank: 2 }, history: [] }, { explain: 'hidden' }); assert.equal(p.tiers.t1.explain, 'hidden');
  p = J.recordTier2(p, { balance: 100, history: [] }); assert.equal(p.tiers.t2.explain, 'shown'); assert.deepEqual(J.validatePassport(p), { valid: true, errors: [] }); }

(async () => {
  const passport = J.createPassport({ classCode: 'KT-BB', teamName: 'Đội Hộp Đen', createdAt: '2026-11-03T02:10:00Z' });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errors = [], rpcCalls = []; let feedHidden = true;
  page.on('pageerror', e => errors.push('err: ' + e.message)); page.on('dialog', d => d.accept());
  await page.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
  await page.route('**/rest/v1/rpc/**', async route => {
    const fn = route.request().url().split('/rpc/')[1].split('?')[0]; let body = {}; try { body = JSON.parse(route.request().postData() || '{}'); } catch (e) {}
    rpcCalls.push({ fn, body });
    const out = fn === 'bizon_class_feed' ? { controls: { locked_round: null, journey_carry: null, explain_hidden: feedHidden }, grants: [] } : fn === 'bizon_student_domains' ? ['student.ctu.edu.vn'] : fn === 'bizon_journey_upsert' ? { ok: 1 } : null;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  await page.addInitScript(p => { try { if (!sessionStorage.getItem('bb-init')) { localStorage.clear(); sessionStorage.setItem('bb-init', '1'); localStorage.setItem('bizon-journey', JSON.stringify(p)); sessionStorage.setItem('bizon-student-session', JSON.stringify({ accessToken: 'test-token', email: 'sva@student.ctu.edu.vn', expiresAt: Date.now() + 3600000 })); } localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} }, passport);
  const vis = (sel) => page.evaluate(s => { const el = document.querySelector(s); return !!el && getComputedStyle(el).display !== 'none'; }, sel);

  // 1. Bến Phù Sa + ?journey=: mã lớp lấy từ hộ chiếu → feed trả explain_hidden=true → hộp đen; ghi vào payload và hộ chiếu
  await page.goto(`${BASE}/ben-phu-sa.html?journey=${encodeURIComponent(passport.journeyId)}`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => !!window.ftTest && window.__ftJourney && window.BizOnExplain, null, { timeout: 60000 });
  await page.evaluate(() => BizOnExplain.ready());
  assert.equal(await page.evaluate(() => [BizOnExplain.hidden, BizOnExplain.source, BizOnExplain.classCode, BizOnExplain.condition(), document.documentElement.classList.contains('bz-blackbox')].join('|')), 'true|class|KT-BB|hidden|true');
  const feed = rpcCalls.filter(c => c.fn === 'bizon_class_feed'); assert.equal(feed.length, 1); assert.deepEqual(feed[0].body, { p_class_code: 'KT-BB', p_team_name: '-' });
  await page.evaluate(() => { window.ftTeam(0); window.ftStart(); });
  for (let w = 0; w < 5; w++) {
    await page.evaluate(() => { window.ftPick('menu', 0); window.ftPick('loc', 2); window.ftPick('m', 1); window.ftCommit(); });
    await page.waitForTimeout(150);
    if (await page.evaluate(() => window.ftTest.phase() === 'ritual')) await page.evaluate(() => window.ftRitualNext(true));
  }
  await page.waitForFunction(() => window.ftTest.phase() === 'end', null, { timeout: 10000 });
  assert.equal(await vis('p.bz-explain'), false, 'bài học cốt lõi bị ẩn');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('bizon-journey')).tiers.t1.explain), 'hidden', 'hộ chiếu ghi điều kiện');
  await page.evaluate(() => { document.getElementById('ft-class').value = 'KT-BB'; document.getElementById('ft-name').value = 'Thu'; return window.ftSubmit(); });
  await page.waitForFunction(() => /Đã nộp/.test(document.getElementById('ft-send-msg').textContent), null, { timeout: 15000 });
  const sub = rpcCalls.filter(c => c.fn === 'bizon_submit_ft_result'); assert.equal(sub.length, 1);
  assert.equal(sub[0].body.p_detail_json.explain, 'hidden'); assert.equal(sub[0].body.p_detail_json.journey.tier, 't1');
  // nhớ 5 phút trong sessionStorage: tải lại không hỏi feed nữa
  await page.reload({ waitUntil: 'commit' }); await page.waitForFunction(() => window.BizOnExplain, null, { timeout: 60000 }); await page.evaluate(() => BizOnExplain.ready());
  assert.equal(await page.evaluate(() => BizOnExplain.source + '|' + BizOnExplain.hidden), 'cache|true'); assert.equal(rpcCalls.filter(c => c.fn === 'bizon_class_feed').length, 1);

  // 2. Không mã lớp thật → 'shown', không gọi feed; mã lớp DEMO-2026 cũng vậy
  await page.goto(`${BASE}/ben-phu-sa.html`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => !!window.ftTest && window.BizOnExplain, null, { timeout: 60000 });
  await page.evaluate(() => { try { localStorage.removeItem('bps-class'); sessionStorage.removeItem('bizon-explain-cache'); } catch (e) {} return BizOnExplain.init({}); });
  assert.equal(await page.evaluate(() => [BizOnExplain.hidden, BizOnExplain.source, BizOnExplain.condition(), document.documentElement.classList.contains('bz-blackbox')].join('|')), 'false|none|shown|false');
  assert.equal(await page.evaluate(() => BizOnExplain.init({ classCode: 'demo-2026' }).then(() => BizOnExplain.source)), 'none');
  assert.equal(rpcCalls.filter(c => c.fn === 'bizon_class_feed').length, 1);
  // feed trả false → hiện; applyControls đổi tại chỗ
  feedHidden = false; await page.evaluate(() => BizOnExplain.init({ classCode: 'KT-ON' }));
  assert.equal(await page.evaluate(() => [BizOnExplain.hidden, BizOnExplain.source, BizOnExplain.classCode].join('|')), 'false|class|KT-ON');
  assert.equal(await page.evaluate(() => BizOnExplain.applyControls({ explain_hidden: true }) + '|' + document.documentElement.classList.contains('bz-blackbox')), 'true|true');
  assert.equal(await page.evaluate(() => BizOnExplain.applyControls({}) + '|' + document.documentElement.classList.contains('bz-blackbox')), 'false|false');

  // 3. Bật Nghiệp ?explain=hidden: Lumina, Nếu – Thì và cố vấn ẩn, ghi chú hộp đen hiện; URL thắng cờ lớp
  await page.goto(`${BASE}/game.html?explain=hidden`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => window.BizOnExplain && document.getElementById('dash-lumina'), null, { timeout: 60000 });
  await page.evaluate(() => BizOnExplain.ready());
  assert.equal(await page.evaluate(() => BizOnExplain.source + '|' + BizOnExplain.condition()), 'url|hidden');
  assert.equal(await page.evaluate(() => BizOnExplain.applyControls({ explain_hidden: false }) + '|' + BizOnExplain.source), 'true|url', 'URL thắng feed');
  await page.evaluate(() => { document.getElementById('tab-dashboard') && document.getElementById('tab-dashboard').classList.add('active'); });
  assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById('dash-lumina')).display), 'none');
  assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById('advisor-chat')).display), 'none');
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.clay-card.bz-explain')).display), 'none', 'hộp Nếu – Thì');
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.bz-blackbox-note')).display), 'block');
  // ?explain=shown → hiện
  await page.goto(`${BASE}/game.html?explain=shown`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => window.BizOnExplain && document.getElementById('dash-lumina'), null, { timeout: 60000 }); await page.evaluate(() => BizOnExplain.ready());
  assert.equal(await page.evaluate(() => BizOnExplain.condition() + '|' + document.documentElement.classList.contains('bz-blackbox') + '|' + getComputedStyle(document.querySelector('.bz-blackbox-note')).display), 'shown|false|none');

  // 4. Hộ Chiếu Thương Hiệu ?explain=hidden: cố vấn, dấu chân, bài học ẩn; payload explain='hidden'
  await page.goto(`${BASE}/brand-passport.html?explain=hidden`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => window.bpTest && window.BizOnExplain, null, { timeout: 60000 }); await page.evaluate(() => BizOnExplain.ready());
  await page.evaluate(() => window.bpTest.end());
  await page.waitForFunction(() => document.getElementById('bp-lesson'), null, { timeout: 10000 });
  for (const id of ['bp-lesson', 'bp-footprint']) assert.equal(await page.evaluate(i => getComputedStyle(document.getElementById(i)).display, id), 'none', id);
  assert.equal(await page.evaluate(() => Array.from(document.querySelectorAll('.bp-adv')).every(el => getComputedStyle(el).display === 'none')), true);
  assert.equal(await page.evaluate(() => BizOnExplain.condition()), 'hidden');
  // thẻ hành trang: dòng giải thích ẩn, câu thay thế hiện
  await page.setContent(`<link rel="stylesheet" href="${BASE}/css/journey.css"><link rel="stylesheet" href="${BASE}/css/explain-mode.css"><script src="${BASE}/js/core/journey.js"></script><script src="${BASE}/js/journey-card.js"></script>`);
  await page.waitForFunction(() => window.BizOnJourneyCard, null, { timeout: 20000 });
  const card = await page.evaluate(() => { document.body.insertAdjacentHTML('beforeend', BizOnJourneyCard.html({ enabled: true, lines: [{ key: 'balance', value: 528, vi: 'Vốn', en: 'Cash' }], applied: { balance: 528 } }, { tier: 't2' }));
    const d = () => getComputedStyle(document.querySelector('.jc-lines')).display + '|' + getComputedStyle(document.querySelector('.jc-bb')).display; const a = d(); document.documentElement.classList.add('bz-blackbox'); return a + ' → ' + d(); });
  assert.equal(card, 'flex|none → none|block');

  await browser.close();
  assert.deepEqual(errors, [], 'không lỗi JS');
  console.log('explain-mode: OK');
})().catch(e => { console.error(e); process.exit(1); });
