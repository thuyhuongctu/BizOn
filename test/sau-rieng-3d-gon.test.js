/* Hộ Chiếu Sầu Riêng 3D gọn hơn (20/11/2026, đợt 2 sau rà soát game 3D trên điện thoại):
 * - bỏ preserveDrawingBuffer (không trang nào đọc lại canvas 3D; giữ bộ đệm tốn GPU điện thoại);
 * - dự phòng three.js là bản r184 trong kho (../js/vendor/three.module.min.js), không gọi esm.sh;
 * - nhạc nền theo đường dẫn tương đối (../assets/audio/), chỉ khi mở tệp tải về (file://) mới dùng https://bizonland.com.
 * Kiểm chạy thật: không gọi máy chủ ngoài; ngữ cảnh WebGL không giữ bộ đệm; ép thiếu window.THREE thì cảnh vẫn dựng bằng bản trong kho. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const html = fs.readFileSync(path.join(__dirname, '..', 'lab/ho-chieu-sau-rieng-3d.html'), 'utf8');
assert.ok(!html.includes('preserveDrawingBuffer'), 'không giữ bộ đệm vẽ');
assert.ok(!html.includes('esm.sh') && html.includes("this.T = window.THREE || await import(new URL('../js/vendor/three.module.min.js', location.href).href);"), 'dự phòng three.js trong kho');
assert.ok(!html.includes("'https://bizonland.com/assets/audio/'") && (html.match(/\(location\.protocol === 'file:' \? 'https:\/\/bizonland\.com' : '\.\.'\) \+ '\/assets\/audio\/'/g) || []).length === 3, 'nhạc theo đường dẫn tương đối');
assert.ok(+(fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 920, 'sw.js ≥ bizon-v920');

async function mo(b, epThieu) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(e => {
    try { localStorage.setItem('bizon-lang', 'vi'); } catch (x) {}
    // Ghi lại thuộc tính ngữ cảnh WebGL do trang tạo (bản dựng sẵn và bản dự phòng)
    const g = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (k, o) { if (/webgl/.test(k)) window.__glOpt = Object.assign({}, o || {}); return g.call(this, k, o); };
    if (e) Object.defineProperty(window, 'THREE', { configurable: true, get() { return undefined; }, set() {} });
  }, epThieu);
  const p = await ctx.newPage(); const loi = [], ngoai = [];
  p.on('pageerror', x => loi.push(x.message));
  p.on('request', r => { const u = r.url(); if (!/^(http:\/\/127\.0\.0\.1|data:|blob:|about:)/.test(u)) ngoai.push(u.slice(0, 80)); });
  await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await p.route(/\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
  await p.goto(BASE + '/lab/ho-chieu-sau-rieng-3d.html', { waitUntil: 'load', timeout: 90000 });
  await p.getByText('CEO', { exact: true }).first().waitFor({ timeout: 60000 });
  await p.getByText('CEO', { exact: true }).first().click({ force: true }).catch(() => {});
  await p.waitForFunction(() => window.__glOpt, null, { timeout: 30000 });
  await p.waitForTimeout(1500);
  return { ctx, p, loi, ngoai };
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    { const { ctx, p, loi, ngoai } = await mo(b, false);
      const o = await p.evaluate(() => window.__glOpt);
      assert.ok(!o.preserveDrawingBuffer, 'ngữ cảnh WebGL không giữ bộ đệm ' + JSON.stringify(o));
      assert.deepEqual(ngoai.filter(u => !/supabase\.co/.test(u)), [], 'không gọi máy chủ ngoài');
      assert.deepEqual(loi, [], 'không lỗi JS: ' + loi.join(' / '));
      await ctx.close(); }
    { const { ctx, p, loi, ngoai } = await mo(b, true);
      assert.ok(await p.evaluate(() => [...document.querySelectorAll('canvas')].some(c => c.width > 100 && c.height > 100)), 'thiếu window.THREE: cảnh vẫn dựng bằng bản trong kho');
      assert.deepEqual(ngoai.filter(u => !/supabase\.co/.test(u)), [], 'thiếu window.THREE: không gọi esm.sh hay CDN');
      assert.deepEqual(loi, [], 'thiếu window.THREE: không lỗi JS: ' + loi.join(' / '));
      await ctx.close(); }
    console.log('sau-rieng-3d-gon: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
