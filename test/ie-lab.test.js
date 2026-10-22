/* Kiểm thử IE Lab (lab/ie-lab.html + lab/ie-lab.js).
 *
 * - Lõi mô phỏng (IP_MARKETS, ipPerf) phải TRÙNG TỪNG BYTE với global.html và cho cùng kết quả.
 * - Trang nạp không lỗi JS; nhiệm vụ cộng +10 XP đúng một lần; nhiệm vụ khoá khi giảng viên chưa mở;
 *   nút VI/EN đổi nội dung và ghi lại 'bizon-lang'; màn 390 px không tràn ngang.
 *
 * Yêu cầu: máy chủ tĩnh phục vụ thư mục gốc của kho mã, mặc định http://127.0.0.1:8899
 * (đổi bằng biến môi trường BIZON_URL), và Chromium của Playwright (BIZON_CHROME).
 */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const CHROME = process.env.BIZON_CHROME || '/opt/pw-browsers/chromium';
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

let chromium;
try { chromium = require('playwright-core').chromium; } catch (e) {
  try { chromium = require(path.join(process.env.HOME || '', '.cache', 'playwright-core')).chromium; } catch (e2) {
    console.error('Không nạp được playwright-core. Xem test/README.md.');
    process.exit(2);
  }
}

const results = [];
const test = (name, fn) => results.push({ name, fn });
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const block = (src, start, end) => { const i = src.indexOf(start); assert.ok(i >= 0, 'thiếu ' + start); return src.slice(i, src.indexOf(end, i) + end.length); };

const GLOBAL = read('global.html');
const LAB = read('lab/ie-lab.js');
const HTML = read('lab/ie-lab.html');
const INPUTS = [];
['vn', 'sg', 'cn', 'in', 'jp', 'sids', 'asia'].forEach(id => [0, 17, 43, 43.6, 80, 100].forEach(x => [[0, 0], [40, 40], [100, 15], [55, 100]].forEach(([tci, dai]) => INPUTS.push([id, x, tci, dai]))));

/* ---------------- tĩnh ---------------- */
test('IP_MARKETS và ipPerf trùng từng byte với global.html', () => {
  assert.strictEqual(block(LAB, 'const IP_MARKETS = [', '];\n'), block(GLOBAL, 'const IP_MARKETS = [', '];\n'));
  assert.strictEqual(block(LAB, 'function ipPerf(m, x, tci, dai) {', '\n}\n'), block(GLOBAL, 'function ipPerf(m, x, tci, dai) {', '\n}\n'));
});

test('ipPerf của lab cho cùng kết quả với mã của global.html (chạy độc lập)', () => {
  const ctx = {};
  vm.runInNewContext(block(GLOBAL, 'const IP_MARKETS = [', '];\n') + block(GLOBAL, 'function ipPerf(m, x, tci, dai) {', '\n}\n') + 'this.IP_MARKETS = IP_MARKETS; this.ipPerf = ipPerf;', ctx);
  const L = require('../lab/ie-lab.js');
  INPUTS.forEach(([id, x, tci, dai]) => {
    const g = ctx.ipPerf(ctx.IP_MARKETS.find(m => m.id === id), x, tci, dai);
    assert.strictEqual(L.ipPerf(L.ieMarket(id), x, tci, dai), g, `${id} x=${x} tci=${tci} dai=${dai}`);
  });
  // Công thức trong README: VN 43% · TCI 40 · DAI 40 → 40 + 10,4 + 38,7 − 18,45 = 70,65
  near(L.ipPerf(L.ieMarket('vn'), 43, 40, 40), 40 + 10.4 + 0.9 * 43 - 0.9 / 86 * 43 * 43, 1e-9, 'VN tại đỉnh');
  near(L.ipPerf(L.ieMarket('vn'), 30, 80, 40) - L.ipPerf(L.ieMarket('vn'), 30, 40, 40), 5.6, 1e-9, 'NV5: TCI 40→80 = +5,6');
});

test('Điều kiện nhiệm vụ và cấp độ đúng README', () => {
  const L = require('../lab/ie-lab.js');
  assert.ok(L.ieCheck(0, { mk: 'vn', x: 40, tci: 40, dai: 40 }) && L.ieCheck(0, { mk: 'vn', x: 46, tci: 0, dai: 0 }));
  assert.ok(!L.ieCheck(0, { mk: 'vn', x: 47, tci: 40, dai: 40 }) && !L.ieCheck(0, { mk: 'cn', x: 43, tci: 40, dai: 40 }));
  assert.ok(L.ieCheck(1, { mk: 'sids', x: 0, tci: 40, dai: 40 }) && !L.ieCheck(1, { mk: 'sids', x: 30, tci: 40, dai: 40 }));
  assert.ok(L.ieCheck(2, { mk: 'sg', x: 80, tci: 0, dai: 80 }) && !L.ieCheck(2, { mk: 'sg', x: 80, tci: 100, dai: 79 }));
  assert.deepStrictEqual(L.START_XP, [70, 150, 40, 120, 95]);
  assert.deepStrictEqual([0, 99, 100, 250, 999].map(L.ieLevel), [0, 0, 1, 2, 9]);
  assert.strictEqual(L.ieLevelName(999, 'vi'), 'Born global');
  assert.strictEqual(L.ieLevelName(150, 'en'), 'Exporter');
  assert.strictEqual(L.ieLevelName(250, 'vi'), 'Nhà khởi nghiệp toàn cầu');
});

test('Số liệu thật (Sustainable Trade Index 2025) khớp global.html; trang có ghi công, không CDN', () => {
  // Chép từ thẻ «Bối cảnh thực» của global.html trước khi IE Lab chuyển sang trang riêng (10/2026).
  ['58.4', '74.2', '38.5', '66.7', 'Hạng', 'Rank',
    'FDI ròng: 4.23% GDP (hạng 5/30, 2024)', 'FDI net inflows: 4.23% of GDP (rank 5/30, 2024)',
    '16 hiệp định thương mại khu vực đang có hiệu lực (APEC, CPTPP, RCEP).', 'Regional trade agreements in force: 16 (APEC, CPTPP, RCEP).',
    '78.1% dân số dùng Internet · 130.99 thuê bao di động/100 dân (2023)', 'Internet users: 78.1% of population · 130.99 mobile subscriptions per 100 people (2023)',
    'GDP đầu người: 4.536 USD (2024, mức thu nhập trung bình).', 'GDP per capita: US$4,536 (2024, medium-income tier).',
    'Nguồn: Hinrich Foundation &amp; IMD World Competitiveness Center, <i>Sustainable Trade Index 2025 – Vietnam Economy Profile</i>.',
    'Source: Hinrich Foundation &amp; IMD World Competitiveness Center, <i>Sustainable Trade Index 2025 – Vietnam Economy Profile</i>.'].forEach(k => {
    assert.ok(LAB.includes(k), 'ie-lab.js có ' + k);
  });
  [[14, 12, 19, 13]].forEach(r => r.forEach(n => assert.ok(LAB.includes(', ' + n + ']'))));
  assert.ok(HTML.includes('../js/bizon-lang.js') && HTML.indexOf('bizon-lang.js') < HTML.indexOf('<title>'));
  assert.ok(HTML.includes('Phan Anh Tú') && HTML.includes('Đỗ Thùy Hương') && HTML.includes('../universe.html'));
  assert.ok(!/https?:\/\/(cdn|fonts\.googleapis)/.test(HTML));
  assert.ok(GLOBAL.includes('id="ip-lab"') && GLOBAL.includes('href="lab/ie-lab.html"'), 'global.html giữ #ip-lab và trỏ sang lab mới');
  assert.strictEqual(read('index.html'), read('academia3d-v2.html'));
});

/* ---------------- trình duyệt ---------------- */
async function open(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1440, height: 900 }, isMobile: !!opts.mobile, hasTouch: !!opts.mobile });
  await ctx.addInitScript(l => {
    try { if (!sessionStorage.getItem('ie-test')) { localStorage.clear(); localStorage.setItem('bizon-lang', l); sessionStorage.setItem('ie-test', '1'); } } catch (e) {}
  }, opts.lang || 'en');
  const p = await ctx.newPage();
  p.__errors = [];
  p.on('pageerror', e => p.__errors.push(e.message));
  await p.goto(BASE + '/lab/ie-lab.html' + (opts.q || ''));
  await p.waitForSelector('#missions .mis', { state: 'attached' });
  return p;
}
const state = p => p.evaluate(() => window.ieLabState());
const slide = (p, k, v) => p.evaluate(([k, v]) => { const i = document.getElementById('in_' + k); i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); }, [k, v]);

test('Trang nạp không lỗi JS, ipPerf trong trình duyệt khớp global.html', async browser => {
  const p = await open(browser);
  const ctx = {};
  vm.runInNewContext(block(GLOBAL, 'const IP_MARKETS = [', '];\n') + block(GLOBAL, 'function ipPerf(m, x, tci, dai) {', '\n}\n') + 'this.f = (id, x, t, d) => ipPerf(IP_MARKETS.find(m => m.id === id), x, t, d);', ctx);
  const got = await p.evaluate(inp => inp.map(([id, x, t, d]) => ipPerf(IP_MARKETS.find(m => m.id === id), x, t, d)), INPUTS);
  INPUTS.forEach((inp, i) => assert.strictEqual(got[i], ctx.f(...inp), inp.join(' ')));
  assert.strictEqual(await p.textContent('#score'), '68.0', 'VN · FSTS 30 · TCI 40 · DAI 40');
  assert.deepStrictEqual(p.__errors, []);
  await p.context().close();
});

test('Nhiệm vụ: +10 XP đúng một lần, sai thì báo «Not yet», lên cấp hiện bảng', async browser => {
  const p = await open(browser);
  await p.click('.team-tile[data-i="4"]');                 // T05: 95 XP
  await slide(p, 'x', 60);
  await p.click('.mis[data-ci="0"] .opt');
  assert.strictEqual((await state(p)).xp[4], 95, 'chưa đạt thì không cộng');
  assert.match(await p.textContent('#toast'), /Not yet/);
  await slide(p, 'x', 43);
  await p.click('.mis[data-ci="0"] .opt');
  let s = await state(p);
  assert.strictEqual(s.xp[4], 105);
  assert.strictEqual(s.answers[0], 0);
  assert.ok(await p.isVisible('#modal'), 'lên cấp 2 thì hiện bảng');
  assert.strictEqual(await p.textContent('#mLvl'), '2');
  await p.click('#mCont');
  assert.ok(await p.isDisabled('.mis[data-ci="0"] .opt'));
  await p.click('.mis[data-ci="0"] .opt', { force: true });
  assert.strictEqual((await state(p)).xp[4], 105, 'bấm lại không cộng thêm');
  await p.waitForTimeout(2000);
  assert.ok(await p.isHidden('#toast'), 'toast tự tắt sau 1,8 s');
  // tải lại: XP và đáp án được lưu trong ielab-v1
  await p.reload(); await p.waitForSelector('#missions .mis', { state: 'attached' });
  s = await state(p);
  assert.strictEqual(s.xp[4], 105);
  assert.ok(JSON.parse(await p.evaluate(() => localStorage.getItem('ielab-v1'))).answers['0'] === 0);
  assert.deepStrictEqual(p.__errors, []);
  await p.context().close();
});

test('Khoá nhiệm vụ: chờ giảng viên mở, trả lời sai thì «Not quite»', async browser => {
  const p = await open(browser);
  assert.strictEqual(await p.getAttribute('.mis[data-ci="3"]', 'data-state'), 'locked');
  assert.match(await p.textContent('.mis[data-ci="3"] .mtag'), /Waiting for teacher/);
  assert.ok(await p.isDisabled('.mis[data-ci="3"] .opt[data-oi="0"]'));
  await p.click('.mis[data-ci="3"] .opt[data-oi="0"]', { force: true });
  assert.strictEqual((await state(p)).xp[0], 70, 'nhiệm vụ khoá không cộng XP');
  // giảng viên mở NV4 và NV5 ở màn hình lớp
  await p.goto(BASE + '/lab/ie-lab.html?view=teacher');
  await p.waitForSelector('#relCtl .rel');
  await p.click('#relCtl .rel[data-i="3"]');
  await p.click('#relCtl .rel[data-i="4"]');
  assert.strictEqual(await p.textContent('#tLive'), '5/5');
  await p.click('#awardCtl button[data-i="2"]');
  assert.strictEqual((await state(p)).xp[2], 50, 'thưởng +10 XP cho T03');
  await p.click('#tBack');
  await p.waitForSelector('#student:not([hidden])');
  assert.strictEqual(await p.getAttribute('.mis[data-ci="3"]', 'data-state'), 'open');
  await p.click('.mis[data-ci="3"] .opt[data-oi="0"]');   // SIDS – đúng
  await p.click('.mis[data-ci="4"] .opt[data-oi="1"]');   // +14 – sai
  const s = await state(p);
  assert.strictEqual(s.xp[0], 80);
  assert.strictEqual(await p.getAttribute('.mis[data-ci="4"]', 'data-state'), 'wrong');
  assert.match(await p.textContent('.mis[data-ci="4"] .mtag'), /Not quite/);
  // đặt lại lớp
  await p.goto(BASE + '/lab/ie-lab.html#teacher');
  await p.waitForSelector('#relCtl .rel');
  await p.click('#tReset');
  const r = await state(p);
  assert.deepStrictEqual(r.xp, [70, 150, 40, 120, 95]);
  assert.deepStrictEqual(r.released, [true, true, true, false, false]);
  assert.deepStrictEqual(r.answers, {});
  assert.deepStrictEqual(p.__errors, []);
  await p.context().close();
});

test('VI/EN: đổi nội dung và dùng chung bizon-lang với toàn site', async browser => {
  const p = await open(browser, { lang: 'en' });
  assert.match(await p.textContent('h1'), /How much/);
  assert.strictEqual(await p.getAttribute('html', 'lang'), 'en');
  await p.click('.nav .seg button[data-v="vi"]');
  assert.match(await p.textContent('h1'), /Quốc tế hóa/);
  assert.match(await p.textContent('#illus'), /Minh họa – cần giảng viên xác nhận/);
  assert.strictEqual(await p.textContent('#score'), '68,0');
  assert.strictEqual(await p.evaluate(() => localStorage.getItem('bizon-lang')), 'vi');
  assert.strictEqual(JSON.parse(await p.evaluate(() => localStorage.getItem('ielab-v1'))).lang, 'vi');
  await p.click('.nav .seg button[data-v="en"]');
  assert.match(await p.textContent('#illus'), /Illustrative – to be confirmed by the instructor/);
  assert.strictEqual(await p.evaluate(() => localStorage.getItem('bizon-lang')), 'en');
  // ngôn ngữ chung của site thắng lựa chọn cũ đã lưu trong ielab-v1
  await p.evaluate(() => { localStorage.setItem('ielab-v1', JSON.stringify({ lang: 'en' })); localStorage.setItem('bizon-lang', 'vi'); });
  await p.reload(); await p.waitForSelector('#missions .mis', { state: 'attached' });
  assert.match(await p.textContent('#chooseM'), /Chọn thị trường/);
  assert.deepStrictEqual(p.__errors, []);
  await p.context().close();
});

test('Di động 390×844: không tràn ngang ở cả 4 tab, nút bấm ≥ 44 px', async browser => {
  for (const lang of ['en', 'vi']) {
    const p = await open(browser, { viewport: { width: 390, height: 844 }, mobile: true, lang });
    for (let i = 0; i < 4; i++) {
      await p.click(`.tabbar button[data-i="${i}"]`);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(sw <= 390, `${lang} tab ${i}: scrollWidth ${sw}`);
      const small = await p.evaluate(() => [...document.querySelectorAll('#student button, #student input[type=range]')]
        .filter(el => el.offsetParent !== null).map(el => { const r = el.getBoundingClientRect(); return [el.className || el.id, Math.round(r.width), Math.round(r.height)]; })
        .filter(([, w, h]) => h < 44 || w < 44));
      assert.deepStrictEqual(small, [], `${lang} tab ${i}: nút nhỏ hơn 44 px`);
    }
    assert.deepStrictEqual(p.__errors, []);
    await p.context().close();
  }
});

/* ================= CHẠY ================= */
(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  let failed = 0;
  for (const t of results) {
    try { await t.fn(browser); console.log('ok -', t.name); } catch (e) { failed++; console.log('✗', t.name, '\n   ', e.message.split('\n').slice(0, 4).join('\n    ')); }
  }
  await browser.close();
  console.log(`\n${results.length - failed}/${results.length} kiểm thử đạt.`);
  process.exit(failed ? 1 : 0);
})();
