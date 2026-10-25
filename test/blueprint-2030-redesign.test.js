/* app/blueprint-2030.html – bản thiết kế lại 10-2026 (gói design_handoff_blueprint_2030): một lớp da đất sét đêm dưới
 * menu/chân trang đất sét dùng chung, bộ lọc trạng thái + 4 góc nhìn cho 10 trụ cột, lộ trình 3 lớp tương tác, VI/EN.
 * Kiểm tra tĩnh (không còn vỏ bz-topbar/bizon-unified, khối JSON đủ 10 trụ cột, CSS có breakpoint 620 và reduced
 * motion) và chạy thật bằng Playwright: vẽ đủ thẻ, đổi góc nhìn/bộ lọc, mở thẻ, chọn lớp, đổi ngôn ngữ qua
 * clayApplyLang, điện thoại không tràn ngang, không lỗi JS. Cần máy chủ tĩnh BIZON_URL. */
'use strict';
const path = require('path');
const fs = require('fs');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  try { chromium = require('playwright-core').chromium; } catch (e2) { try { chromium = require(path.join(process.env.HOME || '', '.cache', 'playwright-core')).chromium; } catch (e3) { console.error('Cần playwright'); process.exit(1); } }
}
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const page = read('app/blueprint-2030.html'), css = read('css/bizon-blueprint-2030.css'), js = read('js/blueprint-2030.js');
check(!/bz-topbar|bizon-unified\.css|#030a14/.test(page) && !/#030a14/.test(css), 'không còn vỏ cũ (bz-topbar, bizon-unified.css, nền #030a14)');
for (const need of ['../css/clay-dark-skin.css', '../css/bizon-clay-chrome.css', '../js/bizon-clay-nav.js', '../js/bizon-clay-footer.js', '../js/blueprint-2030.js', 'id="bp30-data"']) check(page.includes(need), 'trang nạp ' + need);
const data = JSON.parse(page.match(/<script type="application\/json" id="bp30-data">([\s\S]*?)<\/script>/)[1]);
check(data.pillars.length === 10 && data.live.length === 6 && data.layers.length === 3, 'JSON: 10 trụ cột, 6 mô-đun hiện trạng, 3 lớp');
check(data.pillars.every(p => p.desc.vi && p.desc.en && ['A', 'B', 'C'].includes(p.layer) && /^20(2[6-9]|30)$/.test(p.year)), 'mỗi trụ cột có mô tả VI/EN, lớp A/B/C và năm 2026–2030');
check(/@media\(max-width:620px\)/.test(css) && /prefers-reduced-motion/.test(css) && /@media\(max-width:900px\)/.test(css), 'CSS: breakpoint 900/620 và prefers-reduced-motion');
check(/bizon:langchange/.test(js) && /clayCurrentLang/.test(js), 'script vẽ lại khi đổi ngôn ngữ qua i18n đất sét');

(async () => {
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
    const pg = await ctx.newPage(); const errors = []; pg.on('pageerror', e => errors.push(e.message));
    // Trình duyệt headless chạy en-US: js/bizon-lang.js tự chọn EN cho khách chưa chọn ngôn ngữ, nên chốt VI như một người dùng đã chọn.
    await pg.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
    await pg.route(/\.(woff2?|mp3|m4a)(\?|$)/, r => r.abort());
    await pg.goto(BASE + '/app/blueprint-2030.html', { waitUntil: 'load', timeout: 60000 });
    await pg.waitForFunction(() => window.BP30 && document.querySelectorAll('.bp30-card').length === 10, null, { timeout: 20000 });
    const r0 = await pg.evaluate(() => ({ nav: !!document.getElementById('clay-nav'), foot: !!document.getElementById('clay-footer'), live: document.querySelectorAll('.bp30-live').length,
      bg: getComputedStyle(document.body).backgroundColor, views: document.querySelectorAll('[data-view]').length, filters: document.querySelectorAll('[data-filter]').length,
      road: document.querySelectorAll('[data-layer]').length, sel: document.querySelector('[data-layer][aria-selected=true]').dataset.layer, h1: document.querySelector('.bp30-hero h1').textContent }));
    check(r0.nav && r0.foot, 'menu và chân trang đất sét dùng chung được bơm vào');
    check(r0.bg === 'rgb(2, 42, 46)', 'nền đất sét đêm #022A2E (được: ' + r0.bg + ')');
    check(r0.live === 6 && r0.views === 4 && r0.filters === 4 && r0.road === 3 && r0.sel === 'A', '6 thẻ hiện trạng, 4 góc nhìn, 4 bộ lọc, 3 lớp (lớp A chọn sẵn)');
    check(/Từ hệ sinh thái mô phỏng/.test(r0.h1), 'tiêu đề VI mặc định (data-default-lang=vi)');
    await pg.click('[data-filter=planned]');
    const r1 = await pg.evaluate(() => ({ n: document.querySelectorAll('.bp30-card').length, on: document.querySelector('[data-filter=planned]').getAttribute('aria-pressed') }));
    check(r1.n === 6 && r1.on === 'true', 'lọc «Kế hoạch» → 6 thẻ');
    await pg.click('[data-view=matrix]');
    const r2 = await pg.evaluate(() => document.querySelectorAll('.bp30-matrix tbody tr').length);
    check(r2 === 6, 'góc nhìn Ma trận giữ bộ lọc → 6 hàng');
    await pg.click('[data-filter=all]'); await pg.click('[data-view=layers]');
    const r3 = await pg.evaluate(() => Array.from(document.querySelectorAll('.bp30-layer')).map(l => l.querySelectorAll('.bp30-pill').length));
    check(r3.join(',') === '7,2,1', 'góc nhìn Lớp: C/B/A có 7/2/1 trụ cột (được ' + r3.join(',') + ')');
    await pg.click('.bp30-pill[data-focus="03"]');
    const r4 = await pg.evaluate(() => ({ view: document.querySelector('[data-view][aria-selected=true]').dataset.view, open: !!document.querySelector('#bp30-p03.open .bp30-card-more a[href="../aibis-entry-mode-preview.html"]') }));
    check(r4.view === 'cards' && r4.open, 'bấm trụ cột trong Lớp → về Thẻ, mở đúng thẻ 03 với liên kết kiểm chứng');
    await pg.click('[data-view=timeline]');
    const r5 = await pg.evaluate(() => Array.from(document.querySelectorAll('.bp30-year')).map(y => y.querySelector('span').textContent + ':' + y.querySelectorAll('.bp30-tl').length).join(' '));
    check(r5 === '2026:3 2027:1 2028:2 2029:2 2030:2', 'dòng thời gian 2026–2030 (được ' + r5 + ')');
    await pg.click('[data-layer=C]');
    const r6 = await pg.evaluate(() => ({ h3: document.querySelector('#bp30-road-detail h3').textContent, linked: document.querySelectorAll('#bp30-road-detail .bp30-linked span').length, gates: document.querySelectorAll('.bp30-gates span').length }));
    check(r6.h3 === 'International Platform' && r6.linked === 7 && r6.gates === 4, 'lộ trình: chọn lớp C → 7 trụ cột liên quan, 4 điều kiện');
    await pg.evaluate(() => window.clayApplyLang('en')); await pg.waitForTimeout(200);
    const r7 = await pg.evaluate(() => ({ h2: document.querySelector('#now h2').textContent, f: document.querySelector('[data-filter=all]').textContent, g: document.querySelector('.bp30-gates span:last-child').textContent, cta: document.querySelector('.bp30-live strong').textContent, title: document.title }));
    check(r7.h2 === 'What you can see and use now' && /^All · 10$/.test(r7.f) && r7.g === 'Device testing' && r7.cta === 'Open home →' && /Platform Map/.test(r7.title), 'đổi sang EN: phần tĩnh và phần động cùng đổi');
    await pg.evaluate(() => window.clayApplyLang('vi'));
    const ph = await ctx.newPage(); ph.on('pageerror', e => errors.push(e.message));
    await ph.setViewportSize({ width: 390, height: 844 });
    await ph.goto(BASE + '/app/blueprint-2030.html', { waitUntil: 'load', timeout: 60000 });
    await ph.waitForFunction(() => window.BP30 && document.querySelectorAll('.bp30-card').length === 10, null, { timeout: 20000 });
    const r8 = await ph.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, navh: parseInt(getComputedStyle(document.body).getPropertyValue('--bp30-navh'), 10), top: getComputedStyle(document.getElementById('bp30-toolbar')).top }));
    check(r8.sw <= r8.cw, 'điện thoại 390px: không tràn ngang (scrollWidth ' + r8.sw + ')');
    check(r8.navh > 40 && parseInt(r8.top, 10) === r8.navh + 8, 'thanh công cụ dính nằm ngay dưới menu đất sét (đo ' + r8.navh + 'px)');
    check(errors.length === 0, 'không lỗi JS' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await ctx.close();
  } finally { await browser.close(); }
  console.log(fails ? `\n✗ ${fails} kiểm tra thất bại` : '\n✓ blueprint-2030-redesign: tất cả đạt');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
