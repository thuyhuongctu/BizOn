/* Hộ Chiếu Thương Hiệu (bản thẻ + bản 3D): tri thức thị trường có giá trị kinh tế.
 * BPCore.knowMul: 0 → 0,90, 100 → 1,05; hai trang nhân doanh thu từng thị trường với hệ số này; luật chơi công khai;
 * cùng hạt giống và cùng nước đi, ván đặt tri thức 100 ở thị trường vừa vào lãi hơn ván để nguyên; bản 3D: nhiệm vụ
 * Lina Park không còn là «dùng đủ 2 nguồn tin». Cần máy chủ tĩnh BIZON_URL. */
'use strict';
const path = require('path');
const fs = require('fs');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  try { chromium = require('playwright-core').chromium; } catch (e2) { try { chromium = require(path.join(process.env.HOME || '', '.cache', 'playwright-core')).chromium; } catch (e3) { console.error('Cần playwright'); process.exit(1); } }
}
const root = path.join(__dirname, '..');
const PAGES = { '3D': '/Ho%20Chieu%20Thuong%20Hieu%203D.html', 'thẻ': '/brand-passport.html' };
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };

const C = require(path.join(root, 'js', 'bp-core.js'));
check(Math.abs(C.knowMul(0) - 0.9) < 1e-9 && Math.abs(C.knowMul(100) - 1.05) < 1e-9 && Math.abs(C.knowMul(150) - 1.05) < 1e-9, 'bp-core: knowMul(0)=0,90 · knowMul(100)=1,05 · kẹp trên 100');
for (const f of ['brand-passport.html', 'Ho Chieu Thuong Hieu 3D.html']) {
  const h = fs.readFileSync(path.join(root, f), 'utf8');
  check(/rev \*= window\.BPCore\.knowMul\(S\.know\[m\]\);/.test(h), f + ': doanh thu nhân BPCore.knowMul(S.know[m])');
  check(/Tri thức sinh lời/.test(h) && /Knowledge pays/.test(h), f + ': luật chơi có mục «Tri thức sinh lời» song ngữ');
}
const b3 = fs.readFileSync(path.join(root, 'bp3d.js'), 'utf8');
check(!/Dùng đủ 2 nguồn tin trong quý/.test(b3) && /tri thức ở đó đã ≥ 50/.test(b3) && /entArr: S\.entered\.slice\(\)/.test(b3), 'bp3d.js: nhiệm vụ Lina Park đổi thành «vào khi tri thức ≥ 50», có mốc entArr');

async function playOne(browser, url, boost) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
  await page.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); localStorage.setItem('bizon-bp-tour-seen', '{"obs":1,"dec":1,"evt":1}'); } catch (e) {} });
  await page.route(/\.(woff2?|mp3|m4a|webp|png|jpg|jpeg|glb)(\?|$)/, r => r.abort());
  await page.goto(BASE + url + '?seed=4242', { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => !!window.bpTest && typeof window.bpStart === 'function', null, { timeout: 60000 });
  const r = await page.evaluate(async (boost) => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    try { window.bpFirm(0); } catch (e) {}
    window.bpStart(); await wait(300);
    window.bpToDecide(); await wait(200);
    window.bpPick('prio', 0); window.bpPick('bud', 1); window.bpEnter(0, 1);
    // Ván B: vật phẩm «Điều tra viên bí mật» (SCOUT) đặt tri thức thị trường 0 lên 100 – cách hợp lệ trong game, dùng được ở cả hai bản.
    if (boost) { window.bpBuyItem('SCOUT'); window.bpUseItem('SCOUT', 0); }
    const knowAtCommit = window.bpTest.state().know[0];
    window.bpCommit(); await wait(200);
    window.bpEv(0); await wait(300);
    const st = window.bpTest.state();
    return { knowAtCommit, profit: st.profit, cash: st.cash, mul: window.BPCore.knowMul(knowAtCommit), lib: typeof window.BPCore.knowMul === 'function' };
  }, boost);
  r.errors = errors; await ctx.close(); return r;
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    for (const [name, url] of Object.entries(PAGES)) {
      const a = await playOne(browser, url, false);
      const b = await playOne(browser, url, true);
      check(a.lib && b.lib, name + ': BPCore.knowMul có trong trang');
      check(a.knowAtCommit < 100 && b.knowAtCommit === 100, name + ': ván A tri thức ' + a.knowAtCommit + ', ván B tri thức 100 lúc chốt');
      check(b.profit > a.profit, name + ': cùng hạt giống và nước đi, tri thức 100 lãi hơn (' + a.profit.toFixed(3) + ' → ' + b.profit.toFixed(3) + ')');
      check(a.errors.length === 0 && b.errors.length === 0, name + ': không lỗi JS (' + a.errors.concat(b.errors).slice(0, 2).join(' | ') + ')');
    }
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await browser.close();
  console.log(fails ? `\n${fails} kiểm tra hỏng` : '\nbrand-passport-knowledge: ok'); process.exit(fails ? 1 : 0);
})();
