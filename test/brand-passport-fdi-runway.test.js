/* Hộ Chiếu Thương Hiệu 3D – cân bằng FDI 100 % vốn và cảnh báo dòng tiền khi chọn vào thị trường mới.
 * Kiểm tra tĩnh: tham số MODES[5] (vốn, biên lời, quy mô, chi vận hành) đúng bộ đã cân bằng bằng mô phỏng; nhiệm vụ
 * Bắc Phong không ghi đè phương thức đã vào (cả bản thẻ và 3D); hàm runwayHtml có mặt. Chạy thật: chọn FDI khi năng lực
 * < 55 bị chặn; đủ năng lực thì ghi chú dưới nút Chốt hiện dòng tiền còn lại + số quý vận hành + lãi/lỗ quý ước; tiền
 * không đủ → cảnh báo đỏ; vốn mỏng → Minh Khang cảnh báo vàng. Cần máy chủ tĩnh BIZON_URL. */
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
const h3 = read('Ho Chieu Thuong Hieu 3D.html'), h2 = read('brand-passport.html');

const FDI = { cost: '3.0', margin: '0.55', scale: '1.6', op: '0.8' };
const m5 = h3.match(/\{ id: 5, icon: '🏭',[^}]*\}/)[0];
check(m5.includes('cost: ' + FDI.cost + ',') && m5.includes('margin: ' + FDI.margin + ',') && m5.includes('scale: ' + FDI.scale + ',') && m5.includes('op: ' + FDI.op + ','), 'MODES[5] FDI: vốn ' + FDI.cost + ' · biên lời ' + FDI.margin + ' · quy mô ' + FDI.scale + ' · vận hành ' + FDI.op);
check(/function runwayHtml\(/.test(h3) && /runwayHtml\(S\.sel\.enter, S\.sel\.enterMode, S\.sel\.shipMode, fr\)/.test(h3), '3D: ghi chú quyết định gọi runwayHtml()');
for (const [n, s] of [['3D', h3], ['thẻ', h2]]) check(/if \(S\.capab >= 55 && S\.cash >= 2\) \{ S\.cash -= 2; if \(S\.entered\[1\] === null\) \{ S\.entered\[1\] = 2; S\.ship\[1\] = 1; \} S\.certBP = true;/.test(s), n + ': nhiệm vụ Bắc Phong giữ nguyên phương thức đã vào, chỉ thêm chứng nhận');

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
    const page = await ctx.newPage(); const errors = [], dialogs = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => { dialogs.push(d.message()); d.accept(); });
    await page.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
    await page.route(/\.(mp3|m4a|webp|png|jpg|jpeg|woff2?|mp4|glb)(\?|$)/, r => r.abort());
    await page.goto(BASE + '/Ho%20Chieu%20Thuong%20Hieu%203D.html?seed=4242', { waitUntil: 'commit', timeout: 60000 });
    await page.waitForFunction(() => !!window.bpTest && !!window.__bp && typeof window.bpStart === 'function', null, { timeout: 60000 });
    await page.evaluate(() => { window.bpFirm(1); window.bpStart(); });
    await page.waitForFunction(() => window.__bp.S.phase === 'obs', null, { timeout: 60000 });
    await page.evaluate(() => { window.BPTour = null; window.bpToDecide(); }); await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
      const S = window.__bp.S, out = {}, note = () => document.getElementById('bp-dec-note'), rw = () => note().querySelector('.bp-runway');
      window.bpPick('prio', 1); window.bpPick('bud', 1);
      window.bpEnter(2, 5); out.blocked = S.sel.enter === null && S.capab < 55;
      S.capab = 60; window.bpEnter(2, 5); window.bpShip(0);
      out.okCls = rw() && rw().className; out.okTxt = rw() && rw().textContent;
      window.bpEnter(5, 5); window.bpShip(1); out.tcTxt = rw() && rw().textContent; // Tân Cảng ×1,4 + hoả tốc ×1,3: chi vận hành cao hơn
      S.cash = 4.2; window.bpEnter(2, 5); window.bpShip(1); out.warnCls = rw() && rw().className; out.warnTxt = rw() && rw().textContent;
      S.cash = 2; window.bpEnter(2, 1); window.bpEnter(2, 5); window.bpShip(0); out.badCls = rw() && rw().className; // bpEnter cùng cặp thị trường×phương thức là bỏ chọn, nên đổi qua xuất khẩu rồi chọn lại FDI
      return out;
    });
    check(r.blocked && dialogs.some(d => /năng lực ≥ 55/.test(d)), 'FDI khi năng lực < 55 bị chặn kèm lời nhắc nâng cấp');
    check(/bp-runway ok/.test(r.okCls) && /Sau khi vào còn .* tỷ \(~.* quý vận hành\) · lãi\/lỗ quý ước tại đây/.test(r.okTxt), 'đủ vốn: dòng tiền còn lại, số quý vận hành và lãi/lỗ quý ước: ' + r.okTxt);
    const opOf = t => parseFloat((t.match(/chi vận hành ~([\d,]+)/) || [0, '0'])[1].replace(',', '.'));
    check(opOf(r.tcTxt) > opOf(r.okTxt), 'Tân Cảng + hoả tốc có chi vận hành ước cao hơn Kim Sa + đường biển (' + opOf(r.tcTxt) + ' > ' + opOf(r.okTxt) + ')');
    check(/bp-runway warn/.test(r.warnCls) && /Minh Khang/.test(r.warnTxt) && /thua sớm/.test(r.warnTxt), 'vốn mỏng (< 2 quý vận hành): Minh Khang cảnh báo vàng');
    check(/bp-runway bad/.test(r.badCls), 'không đủ tiền vào: cảnh báo đỏ');
    check(errors.length === 0, 'không lỗi JS' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await ctx.close();
  } finally { await browser.close(); }
  console.log(fails ? `\n✗ ${fails} kiểm tra thất bại` : '\n✓ brand-passport-fdi-runway: tất cả đạt');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
