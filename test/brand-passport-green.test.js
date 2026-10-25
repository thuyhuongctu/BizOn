/* Hộ Chiếu Thương Hiệu (bản thẻ + bản 3D): đường tăng Bền vững không phụ thuộc may rủi.
 * Vật phẩm «🌱 Hồ sơ xanh & truy xuất» (GREEN): mua lặp lại tối đa 3 lần, mỗi lần +1 bền vững và trừ 0,7 tỷ,
 * hiệu lực ngay; đủ 2 thì Lumina thôi nhắc «hồ sơ bền vững còn mỏng». Cần máy chủ tĩnh BIZON_URL. */
'use strict';
const path = require('path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  try { chromium = require('playwright-core').chromium; } catch (e2) { try { chromium = require(path.join(process.env.HOME || '', '.cache', 'playwright-core')).chromium; } catch (e3) { console.error('Không nạp được playwright.'); process.exit(2); } }
}
const PAGES = { '3D': '/Ho%20Chieu%20Thuong%20Hieu%203D.html', 'thẻ': '/brand-passport.html' };
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    for (const [name, url] of Object.entries(PAGES)) {
      const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, serviceWorkers: 'block' });
      const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
      await page.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
      await page.route(/\.(woff2?|mp3|m4a|webp|png|jpg|jpeg|glb)(\?|$)/, r => r.abort());
      await page.goto(BASE + url + '?seed=4242', { waitUntil: 'commit', timeout: 60000 });
      await page.waitForFunction(() => !!window.bpTest && typeof window.bpStart === 'function', null, { timeout: 60000 });
      await page.evaluate(() => { try { if (typeof window.bpFirm === 'function') window.bpFirm(0); } catch (e) {} window.bpStart(); }); await page.waitForTimeout(400);
      const r = await page.evaluate(() => {
        const st0 = window.bpTest.state(), out = { susts0: st0.susts, cash0: st0.cash, steps: [], advice: [] };
        const item = (window.__bp && window.__bp.SHOP_ITEMS ? window.__bp.SHOP_ITEMS : []).find(x => x.id === 'GREEN');
        out.item = item ? { price: item.price, max: item.max, type: item.type } : null;
        for (let i = 0; i < 4; i++) { window.bpBuyItem('GREEN'); const st = window.bpTest.state(); out.steps.push({ susts: st.susts, cash: Math.round(st.cash * 100) / 100 }); out.advice.push(window.bpTest.advice().some(a => /Hồ sơ bền vững còn mỏng/.test(a))); }
        out.scoreS = window.bpTest.scores().s;
        out.shopText = (document.getElementById('bp-shop-list') || {}).innerText || '';
        out.logHas = /Hồ sơ xanh & truy xuất<\/b> lần 1|Hồ sơ xanh & truy xuất/.test(document.body.innerHTML);
        return out;
      });
      const d = r.steps;
      check(d.length === 4 && d[0].susts === r.susts0 + 1 && d[1].susts === r.susts0 + 2 && d[2].susts === r.susts0 + 3 && d[3].susts === r.susts0 + 3, name + ': mua 4 lần → bền vững +1/+2/+3 rồi dừng ở trần 3 (' + d.map(x => x.susts).join(',') + ')');
      check(Math.abs((r.cash0 - d[2].cash) - 2.1) < 1e-6 && d[3].cash === d[2].cash, name + ': trừ đúng 0,7 tỷ mỗi lần, lần 4 không trừ');
      check(r.advice[0] === true && r.advice[1] === false, name + ': Lumina thôi nhắc «hồ sơ bền vững còn mỏng» khi đủ 2');
      check(r.scoreS >= 74, name + ': điểm bền vững sau 3 lần ≥ 74 (' + r.scoreS + ')');
      check(r.logHas, name + ': nhật ký ghi lần đầu tư xanh');
      check(errors.length === 0, name + ': không lỗi JS (' + errors.slice(0, 2).join(' | ') + ')');
      await ctx.close();
    }
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await browser.close();
  console.log(fails ? `\n${fails} kiểm tra hỏng` : '\nbrand-passport-green: ok'); process.exit(fails ? 1 : 0);
})();
