'use strict';
// Trang Hành trình 3 bậc (hanh-trinh.html): tạo hộ chiếu, ba thẻ bậc, xem trước hành trang, đổi biến thể, xuất tệp,
// VI/EN, điện thoại không tràn ngang, không lỗi JS. Cần máy chủ tĩnh (scripts/run-tests.mjs tự bật 127.0.0.1:8899).
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }

const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const html = read('hanh-trinh.html');
// Tĩnh: trang mặc định tiếng Việt, nạp đúng thứ tự mô-đun, có CSS thẻ hành trang, có song ngữ.
assert.match(html, /<html lang="vi" data-default-lang="vi">/);
const order = ['js/core/journey.js', 'js/journey-store.js', 'js/journey-card.js', 'js/bizon-clay-i18n.js', 'js/hanh-trinh.js', 'js/bizon-clay-nav.js'].map(s => html.indexOf(s));
assert.ok(order.every((v, i) => v > 0 && (i === 0 || v > order[i - 1])), 'thứ tự script: ' + order.join(','));
assert.match(html, /href="css\/journey\.css"/);
assert.ok((html.match(/data-en=/g) || []).length >= 20, 'đủ nhãn song ngữ');
assert.doesNotMatch(html, /[ \t]+$/m, 'không khoảng trắng cuối dòng');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('err: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  // Chỉ xóa ở lần tải đầu (sessionStorage sống qua reload) để bước «tải lại vẫn giữ» kiểm tra được kho thật.
  await page.addInitScript(() => { try { if (!sessionStorage.getItem('jr-test-init')) { localStorage.clear(); sessionStorage.setItem('jr-test-init', '1'); } localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
  await page.goto(BASE + '/hanh-trinh.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__jrRender && !document.getElementById('jr-setup').hidden);
  assert.equal(await page.isVisible('#jr-dash'), false, 'chưa có hộ chiếu → màn tạo');

  // Tạo hộ chiếu tự học
  await page.fill('#jr-team', 'Đội Thử');
  await page.click('#jr-create');
  await page.waitForSelector('#jr-dash:not([hidden])');
  assert.equal(await page.isVisible('#jr-setup'), false);
  const tiers = await page.$$eval('.jr-tier', els => els.map(e => e.dataset.tier + ':' + e.dataset.status));
  assert.deepEqual(tiers, ['t1:open', 't2:locked', 't3:locked'], 'chỉ Bậc 1 mở, không nhảy cóc');
  const link1 = await page.getAttribute('.jr-tier[data-tier="t1"] a.go', 'href');
  assert.match(link1, /^ben-phu-sa\.html\?journey=J-TU-HOC-DOI-THU-\d{4}-\d{2}-\d{2}$/, 'liên kết sâu Bậc 1: ' + link1);
  assert.match(await page.textContent('#jr-meta'), /Tự học/);
  assert.match(await page.textContent('#jr-carry'), /chưa có hành trang/i);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('bizon-journey')));
  assert.equal(stored.tiers.t3.variant, 'durian'); assert.equal(stored.tiers.t3.roleId, 'packer');

  // Mô phỏng xong Bậc 1 qua kho (game sẽ làm ở J4) → Bậc 2 mở, hành trang 3 dòng, +28 triệu
  await page.evaluate(() => { window.BizOnJourneyStore.update(p => window.BizOnJourney.recordTier1(p, { total: 4.2, result: { eff: 71, rank: 2 }, history: [{ w: 1, m: 0 }, { w: 2, m: 2 }, { w: 3, m: 0 }, { w: 4, m: 1 }, { w: 5, m: 1 }], knownPairs: { '0-2': true, '1-4': true, '2-1': true } })); window.__jrRender(); });
  assert.deepEqual(await page.$$eval('.jr-tier', els => els.map(e => e.dataset.status)), ['done', 'open', 'locked']);
  assert.equal(await page.$$eval('#jr-carry .jc-line', els => els.length), 3);
  assert.match(await page.textContent('#jr-carry'), /528 triệu/);
  assert.equal(await page.$$eval('#jr-carry .jc-btn', els => els.length), 0, 'trang chỉ xem trước, không nút nhận');
  assert.match(await page.getAttribute('.jr-tier[data-tier="t2"] a.go', 'href'), /^game\.html\?journey=/);
  assert.equal(await page.isVisible('#jr-summary-box'), true); assert.match(await page.textContent('#jr-summary'), /0\.60/);

  // Tắt hành trang → thẻ mờ, không dòng; bật lại
  await page.click('#jr-carry-on'); await page.waitForFunction(() => document.querySelector('#jr-carry .jc-card.jc-off'));
  assert.equal(await page.$$eval('#jr-carry .jc-line', els => els.length), 0);
  await page.click('#jr-carry-on'); await page.waitForFunction(() => document.querySelectorAll('#jr-carry .jc-line').length === 3);

  // Đổi biến thể Bậc 3 → lưu, thẻ Bậc 3 đổi tên, tải lại vẫn giữ
  await page.click('#jr-variant .jr-radio:has(input[value="brand"]) span');
  await page.waitForFunction(() => /Thương Hiệu/.test(document.querySelector('.jr-tier[data-tier="t3"] h3').textContent));
  await page.reload({ waitUntil: 'load' }); await page.waitForSelector('#jr-dash:not([hidden])');
  assert.match(await page.textContent('.jr-tier[data-tier="t3"] h3'), /Hộ Chiếu Thương Hiệu/);
  assert.equal(await page.isVisible('#jr-role2-wrap'), false, 'Thương Hiệu không có vai Sầu Riêng');

  // Xuất tệp: tải xuống JSON đúng định dạng
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#jr-export')]);
  assert.match(dl.suggestedFilename(), /^hanh-trinh-J-TU-HOC-DOI-THU-.*\.json$/);
  const txt = fs.readFileSync(await dl.path(), 'utf8'); const obj = JSON.parse(txt);
  assert.equal(obj.format, 'bizon-journey-export'); assert.equal(obj.passport.tiers.t3.variant, 'brand');

  // Tiếng Anh
  await page.evaluate(() => window.clayApplyLang('en'));
  await page.waitForFunction(() => /From the River Silt/.test(document.querySelector('.jr-hero h1').textContent));
  assert.match(await page.textContent('.jr-tier[data-tier="t2"] a.go'), /Play Level 2/);
  assert.match(await page.textContent('#jr-carry'), /Carry-over into Bật Nghiệp/);
  await page.evaluate(() => window.clayApplyLang('vi'));

  // Hành trình mới (xóa) → về màn tạo
  page.once('dialog', d => d.accept());
  await page.click('#jr-reset'); await page.waitForSelector('#jr-setup:not([hidden])');
  assert.equal(await page.evaluate(() => localStorage.getItem('bizon-journey')), null);

  // Điện thoại: không tràn ngang ở cả hai màn
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mp = await m.newPage();
  await mp.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
  await mp.goto(BASE + '/hanh-trinh.html', { waitUntil: 'load' }); await mp.waitForFunction(() => window.__jrRender);
  assert.ok(await mp.evaluate(() => document.documentElement.scrollWidth <= 390), 'màn tạo không tràn ngang');
  await mp.fill('#jr-team', 'Đội Di Động'); await mp.click('#jr-create'); await mp.waitForSelector('#jr-dash:not([hidden])');
  assert.ok(await mp.evaluate(() => document.documentElement.scrollWidth <= 390), 'bảng điều khiển không tràn ngang');
  await m.close();

  await browser.close();
  assert.deepEqual(errors, [], 'không lỗi JS');
  console.log('hanh-trinh: OK');
})().catch(e => { console.error(e); process.exit(1); });
