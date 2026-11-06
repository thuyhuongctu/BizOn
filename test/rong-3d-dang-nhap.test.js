/* Thanh Long cưỡi mây 3D trên màn đăng nhập BizOn Game 3D (06/11/2026): mô hình assets/models/rong-bay-doi-bizon.glb (Meshy AI dựng
 * từ tranh rong-bay-doi-bizon-v5 của BizOn, đã giảm còn ~42k tam giác và màu vẽ 2048 px) bay lượn đúng chỗ con rồng trong ảnh nền.
 * Kiểm tĩnh (GLB hợp lệ, nhẹ, một lớp màu JPEG; trang nạp module; sw.js; SOURCES.md) và chạy thật bằng Playwright: canvas gắn trong
 * #login3d dưới thẻ đăng nhập, mô hình tải xong, khung chiếu khớp khung rồng, không lỗi JS, ở 1366px và 390px. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');

const glb = fs.readFileSync(R('assets/models/rong-bay-doi-bizon.glb'));
check(glb.subarray(0, 4).toString() === 'glTF' && glb.readUInt32LE(4) === 2 && glb.length > 1e6 && glb.length < 4.5e6, 'GLB hợp lệ, 1–4,5 MB (' + (glb.length / 1e6).toFixed(2) + ' MB)');
const js = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)).toString());
const tris = js.meshes.flatMap(m => m.primitives).reduce((a, p) => a + (p.indices != null ? js.accessors[p.indices].count / 3 : js.accessors[p.attributes.POSITION].count / 3), 0);
check(tris > 20000 && tris <= 50000, 'lưới nhẹ cho web: ' + Math.round(tris) + ' tam giác');
check(js.images.length === 1 && js.images[0].mimeType === 'image/jpeg' && js.materials.length === 1 && !js.materials[0].normalTexture && !js.materials[0].pbrMetallicRoughness.metallicRoughnessTexture,
  'một lớp màu JPEG, không normal/metallic (đúng tông đất sét, nhẹ)');
const html = read('BizOn Game 3D.html'), mod = read('js/game3d-rong.js');
{ const nen = fs.readFileSync(R('assets/illustrations/rong-bay-doi-bizon-nen.webp')); check(nen.subarray(0, 4).toString() === 'RIFF' && nen.length > 100000 && nen.length < 600000 && mod.includes("'assets/illustrations/rong-bay-doi-bizon-nen.webp'"), 'ảnh nền không rồng có, nhẹ, module trỏ tới'); }
check(html.includes('<script type="module" src="js/game3d-rong.js"></script>') && html.indexOf('"imports"') < html.indexOf('game3d-rong.js'), 'trang nạp module sau importmap');
check(html.includes("window.__l3Rong = Game3DRong.mount(document.getElementById('login3d'))") && html.includes('window.__l3Rong.dispose()'), 'gắn khi vào màn đăng nhập, gỡ khi vào game');
check(mod.includes("'assets/models/rong-bay-doi-bizon.glb'") && mod.includes('OrthographicCamera') && mod.includes('prefers-reduced-motion'), 'module: nạp GLB, máy quay trực giao, tôn trọng giảm chuyển động');
check(read('sw.js').includes("'./js/game3d-rong.js'") && +(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 790, 'sw.js cache module, ≥ bizon-v790');
check(read('assets/models/SOURCES.md').includes('rong-bay-doi-bizon.glb') && read('assets/models/SOURCES.md').includes('Meshy'), 'SOURCES.md ghi nguồn gốc và cách dựng');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  async function chay(w, h) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); const loi = [];
    p.on('pageerror', e => loi.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) loi.push(m.text()); });
    await p.goto(BASE + '/BizOn%20Game%203D.html'); await p.waitForTimeout(500);
    await p.evaluate(() => { const e = document.getElementById('boot'); if (e) e.style.display = 'none'; document.body.classList.add('login3d');
      if (!window.__l3Rong && window.Game3DRong) window.__l3Rong = Game3DRong.mount(document.getElementById('login3d')); });
    await p.waitForFunction(() => window.__l3Rong && (window.__l3Rong.error || (window.__l3Rong.ready && window.__l3Rong.nen)), null, { timeout: 120000 });
    const st = await p.evaluate(() => { const c = document.querySelector('#login3d canvas[data-rong]'); const r = window.__l3Rong;
      return { ready: r.ready, error: r.error, nen: getComputedStyle(document.getElementById('login3d')).backgroundImage, canvas: !!c, first: c && c === document.getElementById('login3d').firstElementChild, cw: c && c.clientWidth, ch: c && c.clientHeight, rect: r.rect, rr: window.Game3DRong.rectOnScreen(innerWidth, innerHeight) }; });
    check(st.ready && !st.error, w + 'px: mô hình tải xong ' + (st.error || ''));
    check(/rong-bay-doi-bizon-nen\.webp/.test(st.nen), w + 'px: tải xong thì ảnh nền đổi sang bản không rồng');
    const tra = await p.evaluate(() => { window.__l3Rong.dispose(); window.__l3Rong = null; return getComputedStyle(document.getElementById('login3d')).backgroundImage; });
    check(/rong-bay-doi-bizon-v5\.webp/.test(tra) && !(await p.$('#login3d canvas[data-rong]')), w + 'px: gỡ thì trả lại ảnh gốc có rồng, bỏ canvas');
    await p.evaluate(() => { window.__l3Rong = Game3DRong.mount(document.getElementById('login3d')); });
    await p.waitForFunction(() => window.__l3Rong && window.__l3Rong.ready && window.__l3Rong.nen, null, { timeout: 120000 });
    check(st.canvas && st.first && st.cw === w && st.ch === h, w + 'px: canvas phủ cả màn, nằm dưới thẻ đăng nhập');
    check(st.rect && Math.abs(st.rect.w - st.rr.w) < 1 && st.rr.w > w * 0.5, w + 'px: khung rồng khớp phép cover của ảnh nền (' + Math.round(st.rr.x) + ',' + Math.round(st.rr.y) + ' ' + Math.round(st.rr.w) + '×' + Math.round(st.rr.h) + ')');
    await p.waitForTimeout(600);
    await p.screenshot({ path: path.join(__dirname, '..', 'artifacts', 'rong-3d-dang-nhap-' + w + '.png') }).catch(() => {});
    check(!loi.length, w + 'px: không lỗi JS ' + loi.join(' / '));
    await ctx.close();
  }
  try { fs.mkdirSync(R('artifacts'), { recursive: true }); await chay(1366, 768); await chay(390, 844); }
  catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await b.close();
  if (fails) { console.log('rong-3d-dang-nhap: ' + fails + ' lỗi'); process.exit(1); }
  console.log('rong-3d-dang-nhap: ok');
})();
