/* Hộ Chiếu Thương Hiệu (bản thẻ + bản 3D): tách lợi nhuận vận hành và chi ngoài lợi nhuận.
 * Chip «Chi ngoài LN» trong tóm tắt quý khi có vốn thâm nhập; khung «Tiền đi đâu» ở màn kết thúc với
 * vốn ban đầu + lợi nhuận − chi ngoài lợi nhuận = tiền mặt; luật chơi nêu lợi nhuận vận hành (bản 3D thêm hai hệ số). */
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
      await page.goto(BASE + url + '?seed=1234', { waitUntil: 'commit', timeout: 60000 });
      await page.waitForFunction(() => !!window.bpTest && typeof window.bpStart === 'function', null, { timeout: 60000 });
      const rules = await page.evaluate(() => (document.getElementById('bp-rules-block') || {}).innerText || '');
      check(rules.includes('Lợi nhuận trong điểm là lợi nhuận vận hành'), name + ': luật chơi nêu lợi nhuận vận hành');
      if (name === '3D') check(rules.includes('bề rộng thị trường = 0,7 + 0,08') && rules.includes('×0,6 khi thua sớm'), name + ': luật chơi công khai hệ số bề rộng và hệ số thua sớm');
      await page.evaluate(() => { try { if (typeof window.bpFirm === 'function') window.bpFirm(0); } catch (e) {} window.bpStart(); }); await page.waitForTimeout(400);
      // Quý 1: vào Hải Lam bằng xuất khẩu (1,2 tỷ) → chip «Chi ngoài LN» phải hiện và ≈ −1,2 (± biến cố)
      await page.evaluate(() => { window.bpToDecide(); }); await page.waitForTimeout(250);
      await page.evaluate(() => { window.bpPick('prio', 4); window.bpPick('bud', 1); window.bpEnter(0, 1); if (window.bpShip) window.bpShip(1); window.bpCommit(); }); await page.waitForTimeout(250);
      await page.evaluate(() => { window.bpEv(0); }); await page.waitForTimeout(500);
      const chip = await page.evaluate(() => { const el = [...document.querySelectorAll('.bp-chip')].find(e => /Chi ngoài LN/.test(e.textContent)); return el ? el.textContent.trim() : ''; });
      check(/Chi ngoài LN −?\-?\d/.test(chip.replace('-', '−')) || /Chi ngoài LN/.test(chip), name + ': tóm tắt quý 1 có chip «Chi ngoài LN» (' + chip + ')');
      // chơi nốt tới hết ván
      for (let q = 1; q < 6; q++) {
        if (await page.evaluate(() => window.bpTest.ended())) break;
        await page.evaluate(() => { window.bpNext(); }); await page.waitForTimeout(200);
        await page.evaluate(() => { window.bpToDecide(); }); await page.waitForTimeout(200);
        await page.evaluate(() => { window.bpPick('prio', 4); window.bpPick('bud', 1); window.bpCommit(); }); await page.waitForTimeout(200);
        await page.evaluate(() => { window.bpEv(0); }); await page.waitForTimeout(400);
      }
      const end = await page.evaluate(() => { const el = document.getElementById('bp-cash-bridge'); const st = window.bpTest.state(); return { ended: window.bpTest.ended(), has: !!el, d: el ? { start: +el.dataset.start, profit: +el.dataset.profit, spent: +el.dataset.spent, cash: +el.dataset.cash } : null, text: el ? el.innerText : '', cash: st.cash, profit: st.profit }; });
      check(end.ended && end.has, name + ': màn kết thúc có khung «Tiền đi đâu»');
      check(end.d && Math.abs(end.d.start + end.d.profit - end.d.spent - end.d.cash) < 1e-6 && Math.abs(end.d.cash - end.cash) < 1e-6 && Math.abs(end.d.profit - end.profit) < 1e-6, name + ': vốn ban đầu + lợi nhuận − chi ngoài LN = tiền mặt (' + (end.d ? end.d.start + ' + ' + end.d.profit.toFixed(2) + ' − ' + end.d.spent.toFixed(2) + ' = ' + end.d.cash.toFixed(2) : '—') + ')');
      check(end.d && end.d.spent >= 1.2 - 1e-6, name + ': chi ngoài lợi nhuận ≥ vốn thâm nhập 1,2 tỷ');
      check(end.text.includes('Tiền đi đâu') && end.text.includes('lợi nhuận vận hành'), name + ': khung ghi rõ lợi nhuận vận hành');
      check(errors.length === 0, name + ': không lỗi JS (' + errors.slice(0, 2).join(' | ') + ')');
      await ctx.close();
    }
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await browser.close();
  console.log(fails ? `\n${fails} kiểm tra hỏng` : '\nbrand-passport-cash-bridge: ok'); process.exit(fails ? 1 : 0);
})();
