/* Hộ Chiếu Thương Hiệu – vị thế mạng lưới (Johanson & Vahlne 2009) và sự kiện khoảng trống thể chế (Khanna & Palepu 1997).
 *
 * Chạy như test/brand-passport.test.js: cần máy chủ tĩnh ở BIZON_URL (mặc định http://127.0.0.1:8899).
 * Khoá những gì engine hứa: mỗi thị trường có S.net 0–100 khởi đầu 10; nguồn tin «Hiệp hội ngành hàng»
 * cộng mạng lưới; mỗi quý bán hàng mạng lưới tăng (đối tác tăng nhanh hơn); sự kiện «voids» nằm trong
 * bể sự kiện; bản 3D có cùng cơ chế; ván vẫn tất định theo ?seed=.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const CHROME = process.env.BIZON_CHROME;

let chromium;
try { chromium = require('playwright-core').chromium; }
catch (e) {
  try { chromium = require(path.join(process.env.HOME || '', '.cache', 'playwright-core')).chromium; }
  catch (e2) { console.error('Không nạp được playwright-core. Xem test/README.md.'); process.exit(2); }
}

const results = [];
let current = null;
function test(name, fn) { results.push({ name, fn }); }
function check(ok, msg) { current.checks.push({ ok: !!ok, msg }); if (!ok) current.failed = true; }
function eq(a, b, msg) { const ok = JSON.stringify(a) === JSON.stringify(b); check(ok, msg + (ok ? '' : ` — mong ${JSON.stringify(b)}, nhận ${JSON.stringify(a)}`)); }

const SEED = 424242;
async function newGame(browser, opts = {}) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 950 } });
  await page.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
  page.setDefaultTimeout(15000);
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const url = `${BASE}/brand-passport.html?seed=${opts.seed || SEED}`;
  try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 }); }
  catch (e) { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); }
  await page.waitForFunction(() => !!window.bpTest, null, { timeout: 20000 });
  await page.evaluate(() => { try { localStorage.removeItem('bizon-bp-save'); } catch (e) {} });
  await page.evaluate(() => window.bpFirm(0));
  await page.evaluate(() => window.bpStart());
  await page.waitForTimeout(250);
  page.__errors = errors;
  return page;
}
const st = page => page.evaluate(() => window.bpTest.state());
async function playQuarter(page, { prio = 0, budget = 1, enter = null, mode = 1 } = {}) {
  await page.evaluate(() => window.bpToDecide()); await page.waitForTimeout(200);
  await page.evaluate(p => window.bpPick('prio', p), prio);
  await page.evaluate(b => window.bpPick('bud', b), budget);
  if (enter !== null) await page.evaluate(([m, md]) => window.bpEnter(m, md), [enter, mode]);
  await page.waitForTimeout(150);
  await page.evaluate(() => window.bpCommit()); await page.waitForTimeout(350);
  if (await page.evaluate(() => !!document.querySelector('[onclick^="bpEv("]'))) { await page.evaluate(() => window.bpEv(0)); await page.waitForTimeout(350); }
  const ended = await page.evaluate(() => window.bpTest.ended());
  if (!ended && await page.evaluate(() => !!document.querySelector('[onclick="bpNext()"]'))) { await page.evaluate(() => window.bpNext()); await page.waitForTimeout(250); }
  return ended;
}

test('Mỗi thị trường có vị thế mạng lưới, khởi đầu 10/100; HUD có chip Mạng lưới', async browser => {
  const p = await newGame(browser);
  const s = await st(p);
  eq(s.net, [10, 10, 10, 10, 10, 10, 10], 'S.net có 7 ô, đều 10');
  const hud = await p.evaluate(() => document.getElementById('bp-hud').textContent);
  check(/Mạng lưới\s*10/.test(hud), 'HUD hiện 🤝 Mạng lưới 10');
  await p.close();
});

test('Nguồn «Hiệp hội ngành hàng» cộng mạng lưới +25 và tri thức +8, trừ đúng 0,4 tỷ', async browser => {
  const p = await newGame(browser);
  const src = await p.evaluate(() => window.bpTest.sources());
  eq(src.length, 7, 'có 7 nguồn tin');
  eq([src[6].know, src[6].net, src[6].cost], [8, 25, 0.4], 'nguồn 6: +8 tri thức, +25 mạng lưới, 0,4 tỷ');
  eq(src[5].net, 10, 'tin từ đối tác địa phương: +10 mạng lưới');
  const before = await st(p);
  await p.evaluate(() => window.bpIntel(6, 2)); await p.waitForTimeout(300);
  const s = await st(p);
  eq(s.net[2], 35, 'net[2] 10 -> 35');
  eq(s.know[2], 18, 'know[2] 10 -> 18');
  eq(Math.round((before.cash - s.cash) * 100) / 100, 0.4, 'trừ 0,4 tỷ');
  eq(s.net.filter((v, i) => i !== 2), [10, 10, 10, 10, 10, 10], 'các thị trường khác không đổi');
  await p.close();
});

test('Mạng lưới tăng mỗi quý bán hàng: +5 thường, +12 với phương thức đối tác', async browser => {
  const a = await newGame(browser);
  await playQuarter(a, { enter: 5, mode: 1 }); // xuất khẩu trực tiếp vào Tân Cảng
  const sa = await st(a);
  eq(sa.entered[5], 1, 'đã vào thị trường 5 bằng xuất khẩu trực tiếp');
  eq(sa.net[5], 15, 'net[5] 10 -> 15 sau một quý');
  eq(sa.net[0], 10, 'thị trường chưa vào không đổi');
  await a.close();
  const b = await newGame(browser);
  await playQuarter(b, { enter: 5, mode: 2 }); // đối tác địa phương
  const sb = await st(b);
  eq(sb.net[5], 22, 'đối tác địa phương: net[5] 10 -> 22');
  await b.close();
});

test('Sự kiện «Khoảng trống thể chế» nằm trong bể sự kiện và ván vẫn tất định theo ?seed=', async browser => {
  const a = await newGame(browser, { seed: 9191 });
  const ids = await a.evaluate(() => window.bpTest.events());
  check(ids.includes('voids'), 'EVENTS có id voids');
  check(ids.indexOf('voids') === ids.indexOf('board') - 1, 'voids đứng ngay trước board');
  let ended = false, guard = 0;
  while (!ended && guard < 10) { ended = await playQuarter(a, { prio: 1, budget: 1, enter: guard < 2 ? guard + 4 : null, mode: 2 }); guard++; }
  const sa = await st(a);
  const b = await newGame(browser, { seed: 9191 });
  ended = false; guard = 0;
  while (!ended && guard < 10) { ended = await playQuarter(b, { prio: 1, budget: 1, enter: guard < 2 ? guard + 4 : null, mode: 2 }); guard++; }
  const sb = await st(b);
  eq([sa.cash, sa.profit, sa.net], [sb.cash, sb.profit, sb.net], 'cùng seed, cùng quyết định → cùng tiền, lợi nhuận, mạng lưới');
  eq(a.__errors.concat(b.__errors), [], 'không lỗi JS');
  await a.close(); await b.close();
});

test('Bản 3D có cùng cơ chế (kiểm tĩnh)', async () => {
  const s3 = fs.readFileSync(path.join(__dirname, '..', 'Ho Chieu Thuong Hieu 3D.html'), 'utf8');
  for (const need of ["net: [10, 10, 10, 10, 10, 10, 10]", "{ id: 'voids'", "name: 'Hiệp hội ngành hàng", 'if (src.net) S.net[m] = clamp(S.net[m] + src.net);',
    'rev *= 0.9 + 0.1 * clamp((S.entered[m] === 2 || S.entered[m] === 4) ? Math.max(S.net[m], 50) : S.net[m]) / 100;',
    "S.net[m] = clamp(S.net[m] + ((S.entered[m] === 2 || S.entered[m] === 4) ? 12 : 5) + (S.items.NETWORK ? 4 : 0));",
    'if (!S.net || S.net.length !== MKTS.length) S.net = MKTS.map']) {
    check(s3.includes(need), '3D có: ' + need.slice(0, 60));
  }
});

(async () => {
  const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
  let failed = 0;
  for (const t of results) {
    current = { checks: [], failed: false };
    try { await t.fn(browser); } catch (e) { current.failed = true; current.checks.push({ ok: false, msg: 'ngoại lệ: ' + e.message.split('\n')[0] }); }
    console.log((current.failed ? '✗ ' : '✓ ') + t.name);
    current.checks.forEach(c => { if (!c.ok) console.log('    ✗ ' + c.msg); });
    if (current.failed) failed++;
  }
  await browser.close();
  console.log(`\n${results.length - failed}/${results.length} phép thử đạt`);
  process.exit(failed ? 1 : 0);
})();
