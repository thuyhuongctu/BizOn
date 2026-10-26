'use strict';
// R3 · Rubric chấm bài tình huống và độ tin cậy liên chấm: hàm thống kê (κ, ICC) khớp giá trị sách, rubric đủ tiêu chí,
// trang chấm mù (không hiện giai đoạn/điều kiện), xuất điểm, báo cáo κ/ICC từ hai tệp điểm. Cần máy chủ tĩnh (BIZON_URL).
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const I = require('../js/core/irr.js');
const R = require('../js/case-rubric-data.js');
const D = require('../js/case-task-data.js');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const near = (a, b, eps, what) => assert.ok(Math.abs(a - b) <= eps, `${what}: ${a} ≠ ${b}`);

// --- thống kê ---
{ const a = [], b = []; const add = (x, y, n) => { for (let i = 0; i < n; i++) { a.push(x); b.push(y); } }; add(1, 1, 20); add(1, 0, 5); add(0, 1, 10); add(0, 0, 15);
  const k = I.cohenKappa(a, b); near(k.kappa, 0.4, 1e-9, 'κ 2×2'); near(k.po, 0.7, 1e-9, 'po'); near(k.pe, 0.5, 1e-9, 'pe'); assert.equal(k.n, 50); }
near(I.cohenKappa([0, 1, 2, 1], [0, 1, 2, 1]).kappa, 1, 1e-9, 'κ hoàn toàn'); near(I.cohenKappa([0, 1, 2, 1], [0, 1, 2, 1], { weights: 'quadratic' }).kappa, 1, 1e-9, 'κw hoàn toàn');
assert.ok(Number.isNaN(I.cohenKappa([1, 1], [1, 1]).kappa), 'một hạng → không tính được');
{ const x = [0, 1, 2, 2, 1, 0, 2], y = [0, 2, 2, 1, 1, 0, 2]; const u = I.cohenKappa(x, y, { categories: [0, 1, 2] }).kappa, w = I.cohenKappa(x, y, { categories: [0, 1, 2], weights: 'quadratic' }).kappa; assert.ok(w > u, 'trọng số bậc hai tha thứ lệch 1 bậc'); near(I.cohenKappa(y, x, { weights: 'quadratic' }).kappa, w, 1e-12, 'đối xứng'); }
assert.equal(I.agreement([1, 2, null, 3], [1, 0, 1, 3]).n, 3); near(I.agreement([1, 2, null, 3], [1, 0, 1, 3]).po, 2 / 3, 1e-12, 'bỏ cặp thiếu');
{ const sf = [[9, 2, 5, 8], [6, 1, 3, 2], [8, 4, 6, 8], [7, 1, 2, 6], [10, 5, 6, 9], [6, 2, 4, 7]]; const r = I.icc(sf); near(r.icc21, 0.29, 0.005, 'ICC(2,1) Shrout–Fleiss'); near(r.icc2k, 0.62, 0.005, 'ICC(2,k) Shrout–Fleiss'); assert.equal(r.n, 6); assert.equal(r.k, 4); }
assert.ok(Number.isNaN(I.icc([[1, 2]]).icc21)); near(I.icc([[1, 1], [2, 2], [3, 3], [4, 4]]).icc21, 1, 1e-9, 'ICC hoàn toàn');
assert.equal(I.interpretKappa(0.7).en, 'substantial'); assert.equal(I.interpretIcc(0.8).vi, 'tốt'); assert.equal(I.interpretKappa(NaN).en, 'not computable');

// --- rubric ---
assert.equal(R.VERSION, 'rb-v1'); assert.deepEqual(Object.keys(R.WHY).sort(), ['eff-high', 'eff-low', 'outsidership', 'uppsala', 'void']);
for (const [m, c] of Object.entries(R.WHY)) { assert.equal(c.key, 'why'); for (const L of ['vi', 'en']) for (const k of ['name', 'a0', 'a1', 'a2']) assert.ok(c[L][k] && c[L][k].length > 8, m + L + k); }
assert.deepEqual(R.EXPLAIN.map(c => c.key), ['x1', 'x2', 'x3', 'x4']); for (const c of R.EXPLAIN) for (const L of ['vi', 'en']) for (const k of ['name', 'a0', 'a1', 'a2']) assert.ok(c[L][k], c.key + L + k);
assert.equal(R.criteriaFor('explain').length, 4); assert.equal(R.criteriaFor('uppsala')[0].key, 'why'); assert.deepEqual(R.criteriaFor('nope'), []); assert.deepEqual(R.MAX, { why: 10, explain: 8, aligned: 5, total: 23 });
for (const f of ['A', 'B']) for (const it of D.FORMS[f]) assert.ok(R.criteriaFor(it.mech).length, 'mọi tình huống có tiêu chí: ' + it.mech);

// --- tĩnh ---
{ const p = read('cham-tinh-huong.html'); assert.ok(p.includes('<script src="js/core/irr.js" defer></script>\n<script src="js/case-task-data.js" defer></script>\n<script src="js/case-rubric-data.js" defer></script>\n<script src="js/bizon-clay-i18n.js" defer></script>\n<script src="js/case-rubric.js" defer></script>'), 'thứ tự nạp');
  for (const id of ['rb-rater', 'rb-file', 'rb-start', 'rb-items', 'rb-export', 'rb-a', 'rb-b', 'rb-compute', 'rb-rep-crit', 'rb-rep-icc', 'rb-rep-dis']) assert.ok(p.includes(`id="${id}"`), id); assert.match(p, /<meta name="robots" content="noindex">/); }
{ const sw = read('sw.js'); assert.match(sw, /const CACHE = 'bizon-v\d+';/); for (const f of ["'./cham-tinh-huong.html'", "'./js/case-rubric.js'", "'./js/case-rubric-data.js'", "'./js/core/irr.js'"]) assert.ok(sw.includes(f), 'sw ' + f); }
assert.match(read('Trang Giang Vien.dc.html'), /href="cham-tinh-huong\.html"/);
assert.ok(fs.existsSync(path.join(__dirname, '..', 'docs/architecture/RUBRIC-CHAM-TINH-HUONG.md')));

// --- dữ liệu mẫu: CSV bài tình huống như Trang Giảng viên xuất ---
const HEAD = 'class,student_key,team,phase,form,item,mech,choice,expected,aligned,logic,why,duration_s,explain_condition,journey_hash,submitted_at,answers_version';
const cell = v => (/[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v));
const bai = [['s1', 'pre', 'A', 'hidden'], ['s1', 'post', 'B', 'hidden'], ['s2', 'pre', 'B', 'shown']];
const csvLines = [HEAD];
for (const [sk, ph, form, cond] of bai) for (const it of D.FORMS[form]) csvLines.push([ 'KT-TEST', sk, 'Đội ' + sk, ph, form, it.id, it.mech, it.mech === 'explain' ? '' : 'b', it.expected || '', it.expected ? (it.expected === 'b' ? 1 : 0) : '', '', it.mech === 'explain' ? `giải thích của ${sk} lần ${ph === 'pre' ? 'một' : 'hai'}, có "ngoặc"\nhai dòng` : `lý do ${it.id} của ${sk} lần ${ph === 'pre' ? 'một' : 'hai'}`, 300, cond, 'abcd1234', '2026-11-03T03:00:00Z', 'ct-v1'].map(cell).join(','));
const answersCsv = csvLines.join('\n') + '\n';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push('err: ' + e.message)); page.on('dialog', d => d.accept());
  await page.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
  await page.addInitScript(() => { try { if (!sessionStorage.getItem('rb-init')) { localStorage.clear(); sessionStorage.setItem('rb-init', '1'); } localStorage.setItem('bizon-lang', 'vi'); HTMLAnchorElement.prototype.click = function () {}; } catch (e) {} });
  await page.goto(`${BASE}/cham-tinh-huong.html`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => window.__rbTest && window.BizOnIRR, null, { timeout: 60000 });
  // parseCsv: ngoặc kép, xuống dòng trong ô, BOM
  const parsed = await page.evaluate(t => __rbTest.parseCsv('﻿' + t), answersCsv);
  assert.equal(parsed.length, 18); assert.equal(parsed[5].why, 'giải thích của s1 lần một, có "ngoặc"\nhai dòng'); assert.equal(parsed[0].student_key, 's1');
  // nạp tệp + bắt đầu chấm GV1
  await page.setInputFiles('#rb-file', { name: 'bai.csv', mimeType: 'text/csv', buffer: Buffer.from(answersCsv, 'utf8') });
  await page.waitForFunction(() => /Đã nạp 3 bài/.test(document.getElementById('rb-msg').textContent), null, { timeout: 10000 });
  await page.fill('#rb-rater', 'GV1'); await page.click('#rb-start');
  await page.waitForFunction(() => !document.getElementById('rb-grade').hidden, null, { timeout: 10000 });
  assert.equal(await page.$$eval('#rb-items .rb-item', els => els.length), 6, 'một bài 6 câu');
  assert.equal(await page.$$eval('#rb-items .rb-crit', els => els.length), 9, '5 lý do + 4 tiêu chí giải thích');
  assert.equal(await page.$$eval('#rb-items .rb-lv', els => els.length), 27);
  const shown = await page.evaluate(() => document.getElementById('rb-grade').textContent);
  assert.ok(!/\bpre\b|\bpost\b|hidden|shown|TRƯỚC|SAU\b/.test(shown), 'chấm mù: không hiện giai đoạn/điều kiện'); assert.ok(/lý do u1 của/.test(shown));
  const order1 = await page.evaluate(() => __rbTest.state.order.slice());
  // chấm hết 3 bài: GV1 cho điểm theo quy tắc (why=2 cho u1, 1 cho còn lại; x1..x4 = 2,1,0,2)
  const gv1 = { why: { u1: 2, o1: 1, v1: 1, e1: 1, e2: 1 }, x: { x1: 2, x2: 1, x3: 0, x4: 2 } };
  const gv2 = { why: { u1: 2, o1: 1, v1: 0, e1: 1, e2: 2 }, x: { x1: 2, x2: 2, x3: 0, x4: 1 } };
  const rate = async (plan) => { for (let i = 0; i < 3; i++) {
    await page.evaluate(p => { document.querySelectorAll('#rb-items .rb-item').forEach(li => { const item = li.dataset.item; li.querySelectorAll('.rb-crit').forEach(cr => { const lv = cr.dataset.crit === 'why' ? p.why[item] : p.x[cr.dataset.crit]; cr.querySelector(`.rb-lv[data-lv="${lv}"]`).click(); }); }); }, plan);
    if (i < 2) await page.click('#rb-next'); } };
  await rate(gv1);
  assert.ok(/đã chấm xong 3\/3/.test(await page.textContent('#rb-progress')));
  assert.equal(await page.$$eval('#rb-items .rb-item.done', els => els.length), 6);
  const linesA = await page.evaluate(() => __rbTest.exportScores()); assert.equal(linesA.length, 1 + 27); assert.equal(linesA[0], 'rater,class,student_key,phase,form,explain_condition,item,mech,criterion,score,rubric_version,scored_at');
  assert.ok(linesA.slice(1).every(l => l.startsWith('GV1,KT-TEST,'))); assert.ok(linesA.some(l => /,s1,pre,A,hidden,u1,uppsala,why,2,rb-v1,/.test(l)));
  // điểm được giữ trong localStorage khi quay lại cùng người chấm + tệp
  await page.reload({ waitUntil: 'commit' }); await page.waitForFunction(() => window.__rbTest, null, { timeout: 60000 });
  await page.setInputFiles('#rb-file', { name: 'bai.csv', mimeType: 'text/csv', buffer: Buffer.from(answersCsv, 'utf8') }); await page.waitForFunction(() => /Đã nạp/.test(document.getElementById('rb-msg').textContent));
  assert.equal(await page.inputValue('#rb-rater'), 'GV1'); await page.click('#rb-start'); await page.waitForFunction(() => !document.getElementById('rb-grade').hidden);
  assert.ok(/đã chấm xong 3\/3/.test(await page.textContent('#rb-progress')), 'điểm còn sau khi tải lại');
  // GV2: thứ tự xáo khác, chấm theo kế hoạch 2
  await page.click('#rb-back'); await page.fill('#rb-rater', 'GV2'); await page.click('#rb-start'); await page.waitForFunction(() => !document.getElementById('rb-grade').hidden);
  const order2 = await page.evaluate(() => __rbTest.state.order.slice()); assert.deepEqual(order2.slice().sort(), [0, 1, 2]); assert.deepEqual(order1.slice().sort(), [0, 1, 2]);
  // xáo theo hạt giống người chấm: với 50 bài, hai người chấm cho hai thứ tự khác nhau và cùng người cho cùng thứ tự
  const sh = await page.evaluate(() => { const ids = Array.from({ length: 50 }, (_, i) => i); const s1 = __rbTest.shuffle(ids, 11), s2 = __rbTest.shuffle(ids, 22), s3 = __rbTest.shuffle(ids, 11); return { same: JSON.stringify(s1) === JSON.stringify(s3), diff: JSON.stringify(s1) !== JSON.stringify(s2), perm: s1.slice().sort((a, b) => a - b).every((v, i) => v === i) }; });
  assert.deepEqual(sh, { same: true, diff: true, perm: true }, 'xáo theo người chấm');
  assert.ok(/đã chấm xong 0\/3/.test(await page.textContent('#rb-progress')));
  await rate(gv2); const linesB = await page.evaluate(() => __rbTest.exportScores()); assert.equal(linesB.length, 28);

  // tab 2: độ tin cậy từ hai tệp
  await page.click('[data-tab="irr"]');
  await page.setInputFiles('#rb-a', { name: 'a.csv', mimeType: 'text/csv', buffer: Buffer.from(linesA.join('\n') + '\n') });
  await page.setInputFiles('#rb-b', { name: 'b.csv', mimeType: 'text/csv', buffer: Buffer.from(linesB.join('\n') + '\n') });
  await page.click('#rb-compute'); await page.waitForFunction(() => !document.getElementById('rb-report').hidden, null, { timeout: 10000 });
  const rep = await page.evaluate(({ a, b }) => { const r = __rbTest.reliability(__rbTest.parseCsv(a), __rbTest.parseCsv(b)); return { n_pairs: r.n_pairs, n_bai: r.n_bai, n_full: r.n_full, crit: r.crit, totals: r.totals, dis: r.disagreements.length, raters: r.raters }; }, { a: linesA.join('\n'), b: linesB.join('\n') });
  assert.equal(rep.n_pairs, 27); assert.equal(rep.n_bai, 3); assert.equal(rep.n_full, 3); assert.deepEqual(rep.raters, ['GV1', 'GV2']);
  // Đối chiếu với tính tay: why gộp 15 cặp (3 bài × 5), lệch ở v1 (1 vs 0) và e2 (1 vs 2) mỗi bài → 9/15 trùng
  const wa = [], wb = []; for (let i = 0; i < 3; i++) for (const k of ['u1', 'o1', 'v1', 'e1', 'e2']) { wa.push(gv1.why[k]); wb.push(gv2.why[k]); }
  near(rep.crit.why_all.po, 9 / 15, 1e-9, 'po why'); near(rep.crit.why_all.kappa, I.cohenKappa(wa, wb, { categories: [0, 1, 2] }).kappa, 1e-9, 'κ why'); near(rep.crit.why_all.wkappa, I.cohenKappa(wa, wb, { categories: [0, 1, 2], weights: 'quadratic' }).kappa, 1e-9, 'κw why');
  assert.equal(rep.crit['why:uppsala'].po, 1); assert.equal(rep.crit['why:void'].po, 0); assert.equal(rep.crit.x1.po, 1); assert.equal(rep.crit.x2.po, 0); assert.equal(rep.crit.x4.n, 3);
  // Tổng: lý do GV1 = 6, GV2 = 6 mỗi bài → hằng số → ICC không tính được; giải thích 5 vs 5 → cũng hằng; dùng dữ liệu có phương sai qua hàm thuần
  assert.equal(rep.totals.why.n, 3); assert.equal(rep.totals.total.n, 3); assert.equal(rep.dis, 12, '4 bất đồng × 3 bài');
  const table = await page.evaluate(() => document.getElementById('rb-rep-crit').textContent); assert.ok(/Lý do \(5 tình huống gộp\)/.test(table) && /Cơ chế tri thức → cam kết/.test(table));
  assert.equal(await page.$$eval('#rb-rep-dis li', els => els.length), 12); assert.ok(/GV1: 1 · GV2: 0/.test(await page.textContent('#rb-rep-dis')));
  assert.ok(/lý do v1 của/.test(await page.textContent('#rb-rep-dis')), 'bất đồng hiện câu trả lời khi đã nạp CSV bài');
  await page.evaluate(() => document.getElementById('rb-report-export').click());

  await browser.close();
  assert.deepEqual(errors, [], 'không lỗi JS');
  console.log('case-rubric: OK');
})().catch(e => { console.error(e); process.exit(1); });
