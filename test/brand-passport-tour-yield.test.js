/* Hộ Chiếu Thương Hiệu (bản thẻ + bản 3D): tour hướng dẫn Lumina (js/bp-tutorial.js) nhường chỗ cho lớp phủ khác.
 * Đang chạy mà có luật chơi / lễ đóng dấu / màn đua mở lên thì tour tạm ẩn, đóng xong thì hiện lại; chưa chạy mà đã có
 * lớp phủ thì chờ. Bản 3D còn kiểm tra tình huống thật ở quý 1: chốt quý → lễ đóng dấu (.sg-ov) và tour Biến cố cùng
 * đến – tour không được đè lên hay nằm dưới lễ đóng dấu. Cần máy chủ tĩnh BIZON_URL. */
'use strict';
const path = require('path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  try { chromium = require('playwright-core').chromium; } catch (e2) { try { chromium = require(path.join(process.env.HOME || '', '.cache', 'playwright-core')).chromium; } catch (e3) { console.error('Cần playwright'); process.exit(1); } }
}
const PAGES = { '3D': '/Ho%20Chieu%20Thuong%20Hieu%203D.html', 'thẻ': '/brand-passport.html' };
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const TOUR = () => ({ el: !!document.querySelector('#bp-tour-next'), visible: !!document.querySelector('#bp-tour-next') && document.querySelector('#bp-tour-next').closest('div[style*="z-index: 90"]').style.display !== 'none' });
// Tour vẽ qua hai setTimeout (180 + 120 ms) sau khi cuộn tới phần tử; bản 3D vẽ chậm hơn nên chờ tới 3 s thay vì chờ cố định.
const waitTour = async (page) => { try { await page.waitForFunction(() => { const n = document.querySelector('#bp-tour-next'); return !!n && n.closest('div[style*="z-index: 90"]').style.display !== 'none'; }, null, { timeout: 8000 }); } catch (e) {} return page.evaluate(TOUR); };

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    for (const [name, url] of Object.entries(PAGES)) {
      const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, serviceWorkers: 'block' });
      const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
      await page.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} }); // tour chưa xem → tự bật ở quý 1
      await page.route(/\.(woff2?|mp3|m4a|webp|png|jpg|jpeg|glb)(\?|$)/, r => r.abort());
      await page.goto(BASE + url + '?seed=4242', { waitUntil: 'commit', timeout: 60000 });
      await page.waitForFunction(() => !!window.bpTest && typeof window.bpStart === 'function' && !!window.BPTour, null, { timeout: 60000 });
      await page.evaluate(() => { try { if (typeof window.bpFirm === 'function') window.bpFirm(0); } catch (e) {} window.bpStart(); });
      const t0 = await waitTour(page);
      check(t0.el && t0.visible, name + ': tour Quan sát tự bật ở quý 1');
      // 1. Tour đang chạy, mở Luật chơi → tour tạm ẩn; đóng Luật chơi → tour hiện lại
      await page.evaluate(() => window.bpShowRules());
      try { await page.waitForFunction(() => { const n = document.querySelector('#bp-tour-next'); return !!n && n.closest('div[style*="z-index: 90"]').style.display === 'none'; }, null, { timeout: 2000 }); } catch (e) {}
      const t1 = await page.evaluate(TOUR);
      await page.evaluate(() => window.bpCloseRules());
      const t2 = await waitTour(page);
      check(t1.el && !t1.visible, name + ': mở Luật chơi → tour tạm ẩn (không đè, không nằm dưới)');
      check(t2.el && t2.visible, name + ': đóng Luật chơi → tour hiện lại');
      // 2. Chưa có tour, Luật chơi đang mở, bấm «Hướng dẫn» → tour chờ; đóng Luật chơi → tour bắt đầu
      await page.evaluate(() => { window.BPTour.close(); window.bpShowRules(); window.BPTour.replay('obs'); }); await page.waitForTimeout(500);
      const t3 = await page.evaluate(TOUR);
      await page.evaluate(() => window.bpCloseRules());
      const t4 = await waitTour(page);
      check(!t3.el, name + ': Luật chơi đang mở thì tour chờ, chưa vẽ');
      check(t4.el && t4.visible, name + ': đóng Luật chơi → tour chờ bắt đầu');
      await page.evaluate(() => window.BPTour.close());
      // 3. Tình huống thật quý 1 (bản 3D có lễ đóng dấu): chốt quý → .sg-ov và tour Biến cố cùng đến
      await page.evaluate(() => window.bpToDecide()); await page.waitForTimeout(900);
      await page.evaluate(() => { window.BPTour.close(); window.bpPick('prio', 0); window.bpPick('bud', 1); try { window.bpEnter(0, 1); } catch (e) {} });
      await page.evaluate(() => window.bpCommit());
      try { await page.waitForSelector('.sg-ov', { state: 'attached', timeout: 2500 }); } catch (e) {} // lễ đóng dấu hiện qua vòng tick 400 ms của bp-signature (chỉ bản 3D)
      await page.waitForTimeout(700); // đủ cho tour Biến cố (hẹn 400 ms + vẽ 300 ms) kịp đến trong lúc lễ đóng dấu còn mở
      const s1 = await page.evaluate(() => ({ stamp: !!document.querySelector('.sg-ov'), tour: (function () { const n = document.querySelector('#bp-tour-next'); return n ? n.closest('div[style*="z-index: 90"]').style.display !== 'none' : false; })() }));
      if (s1.stamp) {
        check(!s1.tour, name + ': lễ đóng dấu đang mở → tour Biến cố không hiện cùng lúc');
        await page.evaluate(() => { const b = document.querySelector('.sg-ov .sg-btn'); if (b) b.click(); });
        const s2 = await waitTour(page);
        check(s2.el && s2.visible, name + ': đóng lễ đóng dấu → tour Biến cố hiện');
      } else {
        // Máy chậm (CI): lễ đóng dấu bản 3D có thể tới muộn hơn 2,5 s và chặn tour – chờ tour HOẶC lễ; lễ tới thì đóng rồi mới chờ tour.
        try { await page.waitForFunction(() => !!document.querySelector('.sg-ov') || (function () { const n = document.querySelector('#bp-tour-next'); return !!n && n.closest('div[style*="z-index: 90"]').style.display !== 'none'; })(), null, { timeout: 8000 }); } catch (e) {}
        const late = await page.evaluate(() => { const b = document.querySelector('.sg-ov .sg-btn'); if (b) { b.click(); return true; } return false; });
        const s2 = await waitTour(page);
        check(s2.el && s2.visible, name + ': không có lễ đóng dấu' + (late ? ' (lễ tới muộn, đã đóng)' : '') + ' → tour Biến cố hiện bình thường');
      }
      check(errors.length === 0, name + ': không lỗi JS (' + errors.slice(0, 2).join(' | ') + ')');
      await ctx.close();
    }
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await browser.close();
  console.log(fails ? `\n${fails} kiểm tra hỏng` : '\nbrand-passport-tour-yield: ok'); process.exit(fails ? 1 : 0);
})();
