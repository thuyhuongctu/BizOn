/* Điện thoại (PR 3 của kế hoạch docs/roadmap/KE-HOACH-DON-HE-SINH-THAI-2026-11.md, 06/11/2026): thanh điều hướng đất sét và chân trang
 * có vùng chạm đủ lớn ở 390 px (mục menu hàng 2 và liên kết chân trang ≥ 44 px, nút VI/EN và nút tròn ≥ 40 px, pill trang chủ ≥ 44 px),
 * trang không tràn ngang ở 360 px, gợi ý «Xem bằng tiếng Việt?» chừa chỗ ở cuối trang khi hiện, game.html có h1. Chạy thật bằng Playwright. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
check(/<h1 class="sr-only">BizOn Bật Nghiệp<\/h1>/.test(R('game.html')), 'game.html có h1 ẩn thị giác');
check(R('index.html') === R('academia3d-v2.html'), 'index.html giống hệt academia3d-v2.html');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(R('sw.js')) || [])[1] >= 797, 'sw.js ≥ bizon-v797');
(async () => {
  const b = await chromium.launch();
  try {
    for (const w of [360, 390]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 800 } }); const p = await ctx.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message));
      for (const u of ['index.html', 'games.html', 'giang-vien.html', 'lab/day-chuyen-sau-rieng.html']) {
        await p.goto(BASE + '/' + u, { timeout: 60000 }); await p.waitForSelector('#clay-nav .cn-row2 a'); await p.waitForTimeout(400);
        const r = await p.evaluate(() => {
          const h = sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).map(e => Math.round(e.getBoundingClientRect().height));
          return { sw: document.documentElement.scrollWidth, row2: h('#clay-nav .cn-row2 a'), lang: h('#clay-nav .cn-lang button'), tron: h('#clay-nav .cn-dl,#clay-nav .cn-theme,#clay-nav .cn-refresh'), cta: h('#clay-nav .cn-cta'), foot: h('#clay-footer .cf-cols a,#clay-footer .cf-legal a'), pill: h('.hp-pill') };
        });
        check(r.sw <= w, w + 'px ' + u + ': không tràn ngang (' + r.sw + ')');
        check(r.row2.length && r.row2.every(x => x >= 44) && r.cta.every(x => x >= 44), w + 'px ' + u + ': mục menu hàng 2 và nút Bắt đầu ≥ 44 px (' + Math.min(...r.row2) + ')');
        check(r.lang.every(x => x >= 40) && r.tron.every(x => x >= (w <= 360 ? 36 : 40)), w + 'px ' + u + ': nút VI/EN và nút tròn ≥ 40 px (36 px ở ≤ 360)');
        check(r.foot.length && r.foot.every(x => x >= 44), w + 'px ' + u + ': liên kết chân trang ≥ 44 px (' + Math.min(...r.foot) + ')');
        if (u === 'index.html') check(r.pill.length && r.pill.every(x => x >= 44), w + 'px: pill lối vào trang chủ ≥ 44 px');
      }
      check(!loi.length, w + 'px: không lỗi JS ' + loi.join(' / '));
      await ctx.close();
    }
    // Gợi ý ngôn ngữ: giả lập trình duyệt tiếng Anh, lần mở đầu → gợi ý hiện và body được chừa chỗ, bấm × thì trả lại
    const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, locale: 'en-US' }); const p = await ctx.newPage();
    await p.goto(BASE + '/huong-dan.html', { timeout: 60000 }); await p.waitForSelector('#bz-lang-hint', { timeout: 10000 }).catch(() => {});
    const st = await p.evaluate(() => ({ co: !!document.getElementById('bz-lang-hint'), pad: parseFloat(getComputedStyle(document.body).paddingBottom) }));
    check(st.co && st.pad >= 40, 'gợi ý «Xem bằng tiếng Việt?» hiện ở máy tiếng Anh và body chừa chỗ (' + st.pad + 'px)');
    if (st.co) { await p.click('#bz-lang-hint .x'); const pad2 = await p.evaluate(() => parseFloat(getComputedStyle(document.body).paddingBottom)); check(pad2 < st.pad, 'đóng gợi ý thì trả lại chỗ'); }
    await ctx.close();
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await b.close();
  if (fails) { console.log('dien-thoai-vung-cham: ' + fails + ' lỗi'); process.exit(1); }
  console.log('dien-thoai-vung-cham: ok');
})();
