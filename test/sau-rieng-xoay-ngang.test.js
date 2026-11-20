/* Hộ Chiếu Sầu Riêng 3D trên điện thoại xoay ngang (20/11/2026, đợt 1 sau rà soát game 3D trên điện thoại):
 * trước đây cờ «mobile» chỉ xét bề rộng < 760 px nên khi xoay ngang (844×390) hay trên máy tính bảng thì mất cần điều khiển,
 * và khung cảnh cao tối thiểu 520 px trong trang overflow:hidden nên bị cắt mất phần dưới. Kiểm:
 * - tĩnh: cờ mobile xét thêm (pointer: coarse); khung cảnh dùng 100dvh, min-height không vượt chiều cao màn;
 * - chạy thật (điện thoại có cảm ứng): dọc 390×844 và ngang 844×390 đều có cần điều khiển nằm trọn trong màn, khung cảnh
 *   không cao hơn màn; không lỗi JS. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const html = fs.readFileSync(path.join(__dirname, '..', 'lab/ho-chieu-sau-rieng-3d.html'), 'utf8');
assert.ok(html.includes("const mobile = W < 760 || !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);"), 'cờ mobile xét cả màn cảm ứng');
assert.ok(html.includes('height:100vh;height:100dvh;min-height:min(520px, 100dvh);overflow:hidden;'), 'khung cảnh theo chiều cao màn thật');
assert.ok(!html.includes('height:100vh;min-height:520px;overflow:hidden;'), 'không còn min-height 520px cố định');
assert.ok(+(fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 916, 'sw.js ≥ bizon-v916');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
    const p = await ctx.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message));
    await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p.route(/\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await p.goto(BASE + '/lab/ho-chieu-sau-rieng-3d.html', { waitUntil: 'load', timeout: 90000 });
    await p.getByText('CEO', { exact: true }).first().waitFor({ timeout: 60000 });
    await p.getByText('CEO', { exact: true }).first().click({ force: true }).catch(() => {});
    await p.waitForTimeout(1500);
    for (const t of ['Continue', 'Start', 'Bắt đầu', 'OK', 'Got it']) { const l = p.getByText(t, { exact: true }); if (await l.count()) { await l.first().click({ force: true }).catch(() => {}); await p.waitForTimeout(1000); } }
    const do_ = () => p.evaluate(() => {
      const j = [...document.querySelectorAll('div')].find(d => d.style.borderRadius === '50%' && d.style.width === '110px');
      const root = [...document.querySelectorAll('div')].find(d => /100dvh/.test(d.getAttribute('style') || ''));
      const r = j && j.getBoundingClientRect(), q = root && root.getBoundingClientRect();
      return { joy: r ? { top: r.top, bottom: r.bottom, vis: getComputedStyle(j).display !== 'none' && r.width > 0 } : null, rootH: q ? q.height : null, vh: innerHeight };
    });
    await p.waitForFunction(() => [...document.querySelectorAll('div')].some(d => d.style.borderRadius === '50%' && d.style.width === '110px'), null, { timeout: 30000 });
    for (const [w, h, ten] of [[390, 844, 'dọc 390×844'], [844, 390, 'ngang 844×390'], [1024, 768, 'máy tính bảng 1024×768']]) {
      await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(1500);
      const r = await do_();
      assert.ok(r.joy && r.joy.vis && r.joy.top >= 0 && r.joy.bottom <= r.vh, ten + ': có cần điều khiển nằm trọn trong màn ' + JSON.stringify(r.joy));
      assert.ok(r.rootH !== null && r.rootH <= r.vh + 1, ten + ': khung cảnh không cao hơn màn (' + r.rootH + ' / ' + r.vh + ')');
    }
    assert.deepEqual(loi, [], 'không lỗi JS: ' + loi.join(' / '));
    await ctx.close();
    console.log('sau-rieng-xoay-ngang: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
