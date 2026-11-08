/* Lối vào «Văn phòng đội» ở mỗi game (08/11/2026): bốn thẻ game trên trang chủ dẫn tới văn phòng của game đó; bản 3D Hộ Chiếu Sầu Riêng có
 * nút văn phòng trên thanh đầu (VI/EN). Ba bản 3D còn lại thuộc hồ sơ SHTT đang thẩm định nên chưa chạm (Giai đoạn 3). Chạy thật bằng Playwright. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const idx = R('index.html');
check(idx === R('academia3d-v2.html'), 'index.html giống hệt academia3d-v2.html');
for (const f of ['van-phong-ben-phu-sa.html', 'van-phong-doi.html', 'van-phong-hc-thuong-hieu.html', 'van-phong-hc-sau-rieng.html']) {
  check(idx.includes('<a href="' + f + '" data-en="🏢 Team office">🏢 Văn phòng đội</a>'), 'trang chủ dẫn tới ' + f);
  check(fs.existsSync(path.join(__dirname, '..', f)), f + ' tồn tại');
}
const sr3d = R('lab/ho-chieu-sau-rieng-3d.html');
check(sr3d.includes('van-phong-hc-sau-rieng.html') && sr3d.includes("office: '🏢 Văn phòng đội'") && sr3d.includes("office: '🏢 Team office'"), 'bản 3D Hộ Chiếu Sầu Riêng có nút văn phòng VI/EN');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(R('sw.js')) || [])[1] >= 820, 'sw.js ≥ bizon-v820');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message));
    await p.goto(BASE + '/index.html', { timeout: 60000 }); await p.waitForTimeout(800);
    const links = await p.$$eval('.hp-game .hp-alt a[href^="van-phong"]', a => a.map(x => ({ h: x.getAttribute('href'), w: x.getBoundingClientRect().width, hh: x.getBoundingClientRect().height })));
    check(links.length === 4 && links.every(l => l.hh >= 44), 'trang chủ: 4 liên kết văn phòng, vùng chạm ≥ 44 px: ' + JSON.stringify(links.map(l => [l.h, Math.round(l.hh)])));
    check(await p.evaluate(() => document.documentElement.scrollWidth <= 390), 'trang chủ không tràn ngang ở 390 px');
    await p.goto(BASE + '/lab/ho-chieu-sau-rieng-3d.html', { timeout: 60000 }); await p.waitForTimeout(4000);
    const of = await p.$$eval('a[href="van-phong-hc-sau-rieng.html"]', a => a.map(x => x.textContent.trim()));
    check(of.length >= 1 && /Văn phòng đội|Team office/.test(of[0]), 'bản 3D Sầu Riêng: nút văn phòng đội hiện trên thanh đầu (VI hoặc EN theo ngôn ngữ trình duyệt): ' + of[0]);
    check(!loi.length, 'không lỗi JS: ' + loi.join(' | '));
  } finally { await b.close(); }
  if (fails) { console.error(fails + ' kiểm tra thất bại'); process.exit(1); } console.log('van-phong-loi-vao: ok');
})().catch(e => { console.error(e); process.exit(1); });
