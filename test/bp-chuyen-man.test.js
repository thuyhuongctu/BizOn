/* Hộ Chiếu Thương Hiệu (bản thẻ + bản 3D) trên điện thoại:
 * (1) đổi màn (Bắt đầu, Quyết định, Chốt quý, Quý mới, Kết thúc) đưa đầu màn mới vào khung nhìn – trước đây trang giữ chỗ cuộn cũ
 *     nên người chơi bị bỏ lại ở chân trang; (2) chọn doanh nghiệp chỉ đổi viền chọn, không vẽ lại danh sách (ảnh nạp lại, nháy). */
'use strict';
const fs = require('fs');
const path = require('path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const { chromium } = require('playwright');
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };

for (const f of ['brand-passport.html', 'Ho Chieu Thuong Hieu 3D.html']) {
  const s = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  check(/function toStageTop\(id\)/.test(s) && /stageEvent = \(function \(f\)/.test(s) && /bpEnd = \(function \(f\)/.test(s), f + ': có toStageTop gắn vào các màn');
  check(/b\.classList\.toggle\('sel', k === i\)/.test(s), f + ': bpFirm chỉ đổi viền chọn');
}

(async () => {
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
    await page.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); localStorage.setItem('bizon-bp-tour-seen', '{"obs":1,"dec":1,"evt":1}'); } catch (e) {} });
    await page.route(/\.(mp3|mp4|glb)(\?|$)/, r => r.abort());
    await page.goto(BASE + '/brand-passport.html?seed=42', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => !!window.bpTest && !!document.getElementById('g3d-demo'), null, { timeout: 60000 });
    await page.click('#g3d-demo'); await page.waitForTimeout(300);
    // (2) chọn doanh nghiệp: cùng phần tử ảnh, chỉ đổi lớp sel
    const firm = await page.evaluate(() => {
      const before = document.querySelector('#bp-firms .bp-firm img'); window.bpFirm(3);
      const bs = [...document.querySelectorAll('#bp-firms .bp-firm')];
      return { same: before === document.querySelector('#bp-firms .bp-firm img'), sel: bs.map(b => b.classList.contains('sel')).join(','), firm: window.bpTest.state().firm };
    });
    check(firm.same && firm.sel === 'false,false,false,true' && firm.firm === 3, 'bpFirm(3) giữ nguyên ảnh, chỉ thẻ 4 được chọn (' + firm.sel + ')');
    // (1) bấm «Bắt đầu» từ cuối phần giới thiệu → đầu khu chơi phải nằm trong khung nhìn
    const top = sel => page.evaluate(s => Math.round(document.querySelector(s).getBoundingClientRect().top), sel);
    const inView = t => t >= -1 && t <= 640 * 0.6;
    await page.evaluate(() => { document.querySelector('[onclick="bpStart()"]').scrollIntoView({ block: 'center' }); document.querySelector('[onclick="bpStart()"]').click(); });
    await page.waitForTimeout(200);
    let t = await top('#bp-play'); check(inView(t), 'Bắt đầu: đầu khu chơi trong khung nhìn (top=' + t + ')');
    await page.evaluate(() => { const b = document.querySelector('[onclick="bpToDecide()"]'); b.scrollIntoView({ block: 'center' }); b.click(); }); await page.waitForTimeout(150);
    t = await top('#bp-stage'); check(inView(t), 'Sang Quyết định: đầu thẻ màn trong khung nhìn (top=' + t + ')');
    await page.evaluate(() => { window.bpPick('prio', 0); window.bpEnter(0, 0); window.bpShip(1); const b = document.querySelector('[onclick="bpCommit()"]'); b.scrollIntoView({ block: 'center' }); b.click(); }); await page.waitForTimeout(150);
    t = await top('#bp-stage'); check(inView(t), 'Chốt quý: đầu màn Biến cố trong khung nhìn (top=' + t + ')');
    await page.evaluate(() => { window.bpEv(0); if (window.BPRivalIntel && document.getElementById('bp-rival-arena')) BPRivalIntel.closeArena(); const b = document.querySelector('[onclick="bpNext()"]'); b.scrollIntoView({ block: 'center' }); b.click(); }); await page.waitForTimeout(150);
    t = await top('#bp-play'); check(inView(t), 'Sang quý 2: đầu khu chơi trong khung nhìn (top=' + t + ')');
    await page.evaluate(() => { window.scrollTo(0, document.documentElement.scrollHeight); window.bpTest.end(); }); await page.waitForTimeout(200);
    t = await top('#bp-end'); check(inView(t), 'Kết thúc: đầu màn kết quả trong khung nhìn (top=' + t + ')');
    // Đang ở đầu màn thì không giật trang
    const y0 = await page.evaluate(() => { window.scrollTo(0, 0); return window.scrollY; });
    check(y0 === 0, 'không cuộn khi đã thấy đầu màn');
    check(errors.length === 0, 'không lỗi JS (' + errors.slice(0, 2).join(' | ') + ')');
    await ctx.close();
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await browser.close();
  console.log(fails ? `\n${fails} kiểm tra hỏng` : '\nbp-chuyen-man: ok'); process.exit(fails ? 1 : 0);
})();
