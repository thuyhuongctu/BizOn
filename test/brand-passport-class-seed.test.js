/* Hộ Chiếu Thương Hiệu (bản thẻ + bản 3D): hạt giống theo MÃ LỚP.
 * Có mã lớp ở cổng vào (localStorage bp-class) → hai ván cùng lớp có cùng hạt giống gốc, cùng hồ sơ thị trường ẩn;
 * khác mã lớp → khác; ?seed= vẫn được ưu tiên; không mã lớp → ngẫu nhiên và nhật ký nói rõ. Hạt giống vào CSV và màn kết thúc.
 * Cần máy chủ tĩnh BIZON_URL (scripts/run-tests.mjs tự bật ở 127.0.0.1:8899). */
'use strict';
const path = require('path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  try { chromium = require('playwright-core').chromium; } catch (e2) { try { chromium = require(path.join(process.env.HOME || '', '.cache', 'playwright-core')).chromium; } catch (e3) { console.error('Không nạp được playwright.'); process.exit(2); } }
}
const PAGES = { '3D': '/Ho%20Chieu%20Thuong%20Hieu%203D.html', 'thẻ': '/brand-passport.html' };
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };

async function fresh(browser, url, cls, drive) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
  await page.addInitScript(c => { try { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); if (c) localStorage.setItem('bp-class', c); } catch (e) {} }, cls || '');
  // Phông chữ, nhạc, ảnh không liên quan tới hạt giống – chặn để tải nhanh và tránh treo kết nối trên máy chủ tĩnh đơn giản.
  await page.route(/\.(woff2?|mp3|m4a|webp|png|jpg|jpeg|glb)(\?|$)/, r => r.abort());
  await page.goto(BASE + url, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => !!window.bpTest && typeof window.bpStart === 'function', null, { timeout: 60000 });
  await page.evaluate(() => { try { if (typeof window.bpFirm === 'function') window.bpFirm(0); } catch (e) {} window.bpStart(); });
  await page.waitForTimeout(400);
  if (drive) { // chốt một quý để game lưu ván (save() chỉ chạy sau khi kết sổ quý)
    await page.evaluate(() => { window.bpToDecide(); }); await page.waitForTimeout(300);
    await page.evaluate(() => { window.bpPick('prio', 4); window.bpPick('bud', 1); window.bpCommit(); }); await page.waitForTimeout(300);
    await page.evaluate(() => { window.bpEv(0); }); await page.waitForTimeout(600);
  }
  // Lấy hết dữ liệu rồi đóng ngay: một trang 3D đang chạy cảnh WebGL mở song song làm trang kế tiếp không khởi động được trong swiftshader.
  const r = await page.evaluate(() => ({ base: window.bpTest.seedBase(), src: window.bpTest.seedSource(), world: window.bpTest.world(), log: document.body.innerText.slice(0, 20000),
    saved: (function () { try { return JSON.parse(localStorage.getItem('bizon-bp-save')); } catch (e) { return null; } })(), csvHas: typeof window.bpExportCsv === 'function' ? /'seed', 'seed_source', 'date'/.test(String(window.bpExportCsv)) : null }));
  r.errors = errors; await ctx.close(); return r;
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    for (const [name, url] of Object.entries(PAGES)) {
      const a = await fresh(browser, url, 'QTKD-2026-A', true), b = await fresh(browser, url, 'qtkd-2026-a '), c = await fresh(browser, url, 'KTM330H-M02');
      check(a.src === 'class' && a.base === b.base, name + ': cùng mã lớp (không phân biệt hoa/thường, khoảng trắng) → cùng hạt giống gốc ' + a.base);
      check(JSON.stringify(a.world) === JSON.stringify(b.world), name + ': cùng mã lớp → cùng hồ sơ ẩn 7 thị trường');
      check(c.src === 'class' && c.base !== a.base && JSON.stringify(c.world) !== JSON.stringify(a.world), name + ': khác mã lớp → khác hạt giống và hồ sơ');
      check(a.log.includes('Mã lớp QTKD-2026-A') && a.log.includes('hạt giống ' + a.base), name + ': nhật ký đầu ván nêu mã lớp và hạt giống');
      const n = await fresh(browser, url, '');
      check(n.src === 'random' && n.log.includes('Chưa có mã lớp') , name + ': không mã lớp → ngẫu nhiên, nhật ký nhắc nhập mã lớp');
      const u = await fresh(browser, url + '?seed=424242', 'QTKD-2026-A');
      check(u.src === 'url' && u.base === 424242, name + ': ?seed= trên URL vẫn được ưu tiên dù có mã lớp');
      // Tiếp tục ván: hạt giống và nguồn được khôi phục từ bản lưu
      check(!!a.saved && a.saved.base === a.base && a.saved.src === 'class' && a.saved.cls === 'QTKD-2026-A', name + ': bản lưu ván mang hạt giống gốc, nguồn và mã lớp');
      // CSV (bản 3D) có cột seed
      if (name === '3D') check(a.csvHas === true, name + ': CSV đội có cột seed và seed_source');
      check([a, b, c, n, u].every(x => x.errors.length === 0), name + ': không lỗi JS (' + [a, b, c, n, u].flatMap(x => x.errors).slice(0, 2).join(' | ') + ')');
    }
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await browser.close();
  console.log(fails ? `\n${fails} kiểm tra hỏng` : '\nbrand-passport-class-seed: ok'); process.exit(fails ? 1 : 0);
})();
