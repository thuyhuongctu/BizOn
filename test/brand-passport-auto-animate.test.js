/* Hộ Chiếu Thương Hiệu (bản thẻ + bản 3D): chuyển động danh sách bằng auto-animate (js/vendor/auto-animate.min.js).
 * Kiểm tra: thư viện nạp thành biến toàn cục; cửa hàng và kho vẽ lại theo khóa (data-key) nên phần tử cũ được giữ
 * nguyên khi vẽ lại; mua vật phẩm thêm một dòng mới vào kho; dòng nhật ký mới có hoạt ảnh Web Animations đang chạy;
 * không lỗi JS. Cần máy chủ tĩnh BIZON_URL. */
'use strict';
const path = require('path');
const fs = require('fs');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  try { chromium = require('playwright-core').chromium; } catch (e2) { try { chromium = require(path.join(process.env.HOME || '', '.cache', 'playwright-core')).chromium; } catch (e3) { console.error('Cần playwright'); process.exit(1); } }
}
const PAGES = { '3D': '/Ho%20Chieu%20Thuong%20Hieu%203D.html', 'thẻ': '/brand-passport.html' };
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };

// Tệp thư viện: có mặt, là bản đóng gói toàn cục (không còn export ESM), có giấy phép MIT.
const root = path.join(__dirname, '..');
const lib = fs.readFileSync(path.join(root, 'js', 'vendor', 'auto-animate.min.js'), 'utf8');
check(/MIT License/.test(lib) && /window\.autoAnimate\s*=/.test(lib) && !/^\s*export\b|[;}]export\{/m.test(lib), 'js/vendor/auto-animate.min.js: bản toàn cục, giấy phép MIT, không còn export ESM');
for (const f of ['brand-passport.html', 'Ho Chieu Thuong Hieu 3D.html']) {
  const h = fs.readFileSync(path.join(root, f), 'utf8');
  check(/<script src="js\/vendor\/auto-animate\.min\.js"><\/script>/.test(h), f + ': nạp js/vendor/auto-animate.min.js');
  check(/function syncList\(/.test(h) && (h.match(/syncList\(/g) || []).length >= 3, f + ': cửa hàng và kho vẽ lại qua syncList (theo khóa)');
}
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
check(/'\.\/js\/vendor\/auto-animate\.min\.js'/.test(sw) && /'\.\/js\/bp-core\.js'/.test(sw), 'sw.js: auto-animate và bp-core nằm trong SHELL');

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
      const r1 = await page.evaluate(() => {
        const out = { lib: typeof window.autoAnimate === 'function' };
        window.bpToggleShop();
        const list = document.getElementById('bp-shop-list');
        out.nRows = list.children.length;
        out.allKeyed = Array.prototype.every.call(list.children, c => c.hasAttribute('data-key') && c.classList.contains('bp-opt'));
        const green = list.querySelector('[data-key="GREEN"]'); if (green) green.setAttribute('data-mark', 'giữ');
        out.invBefore = document.getElementById('bp-inv-list').querySelectorAll('[data-key]').length;
        window.bpBuyItem('GREEN');
        const green2 = list.querySelector('[data-key="GREEN"]');
        out.sameNode = !!green2 && green2.getAttribute('data-mark') === 'giữ';
        out.greenText = green2 ? green2.innerText : '';
        out.invAfter = document.getElementById('bp-inv-list').querySelectorAll('[data-key="GREEN"]').length;
        return out;
      });
      await page.waitForTimeout(60);
      const r2 = await page.evaluate(() => {
        const log = document.getElementById('bp-log'); const n0 = log.children.length;
        return { n0, anim: document.getAnimations().length, first: (log.firstElementChild || {}).innerText || '' };
      });
      check(r1.lib, name + ': window.autoAnimate là hàm');
      check(r1.nRows >= 5 && r1.allKeyed, name + ': cửa hàng ' + r1.nRows + ' dòng, mỗi dòng có data-key và lớp bp-opt');
      check(r1.sameNode && /1\/3/.test(r1.greenText), name + ': vẽ lại theo khóa giữ nguyên phần tử cũ, nội dung cập nhật «đã mua 1/3»');
      check(r1.invBefore === 0 && r1.invAfter === 1, name + ': kho thêm đúng một dòng data-key=GREEN sau khi mua');
      check(r2.n0 >= 1 && /Hồ sơ xanh/.test(r2.first) && r2.anim > 0, name + ': dòng nhật ký mới đứng đầu và có hoạt ảnh đang chạy (' + r2.anim + ')');
      check(errors.length === 0, name + ': không lỗi JS (' + errors.slice(0, 2).join(' | ') + ')');
      await ctx.close();
    }
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await browser.close();
  console.log(fails ? `\n${fails} kiểm tra hỏng` : '\nbrand-passport-auto-animate: ok'); process.exit(fails ? 1 : 0);
})();
