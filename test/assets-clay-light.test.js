'use strict';
// Tối ưu tài nguyên + ánh sáng đất sét: video chỉ MP4 (WebM đã bỏ, xem PR #947); poster WebP; mô-đun js/clay-light.js
// (đèn bù + đèn viền theo bảng màu claymation-warm) nối vào Bến Phù Sa 3D, Bật Nghiệp 3D, quả cầu Hộ Chiếu 3D và Sầu Riêng 3D.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8'), size = f => fs.statSync(R(f)).size;

// --- video: chỉ MP4 (H.264/AAC). Bản WebM VP9/Opus từng đứng trước MP4 (PR #938) làm một số điện thoại phát trailer
// thiếu tiếng (PR #947) nên bỏ hẳn; poster được dùng có bản WebP nhỏ hơn ---
const PAGES = ['academia3d-v2.html', 'index.html', 'universe.html', 'brand-passport.html', 'Ho Chieu Thuong Hieu 3D.html', 'js/app.js'];
const mp4s = new Set(), posters = new Set();
for (const f of PAGES) { const s = read(f); for (const m of s.matchAll(/assets\/video\/([a-zA-Z0-9_.-]+)\.mp4/g)) mp4s.add(m[1]); for (const m of s.matchAll(/assets\/video\/([a-zA-Z0-9_.-]+-poster)\.(jpg|webp)/g)) { posters.add(m[1]); assert.equal(m[2], 'webp', f + ': poster còn JPG ' + m[1]); }
  assert.ok(!/\.webm\b/.test(s.replace(/\.webmanifest/g, '')), f + ': còn tham chiếu WebM'); }
assert.ok(mp4s.size >= 12 && posters.size >= 10, `tham chiếu: ${mp4s.size} video, ${posters.size} poster`);
for (const v of mp4s) assert.ok(fs.existsSync(R(`assets/video/${v}.mp4`)) && size(`assets/video/${v}.mp4`) > 100000, 'thiếu MP4 ' + v);
assert.ok(!fs.readdirSync(R('assets/video')).some(f => f.endsWith('.webm')), 'assets/video không còn tệp WebM');
// trailer Bật Nghiệp bản v3: lời đọc đúng tên riêng tiếng Việt; bản v2 giữ nguyên trong kho, trang dùng v3
assert.ok(read('academia3d-v2.html').includes('data-trailer="assets/video/bizon-trailer-v3.mp4"') && !read('academia3d-v2.html').includes('bizon-trailer-v2.mp4'));
assert.ok(fs.existsSync(R('assets/video/bizon-trailer-v2.mp4')) && size('assets/video/bizon-trailer-v3.mp4') > 5e6, 'trailer v3 có, v2 giữ nguyên');
{ const b = fs.readFileSync(R('assets/video/bizon-trailer-v3.mp4')).subarray(0, 64 * 1024).toString('latin1'); assert.ok(b.includes('moov') && b.indexOf('moov') < (b.indexOf('mdat') < 0 ? Infinity : b.indexOf('mdat')), 'faststart: moov đứng trước mdat'); assert.ok(b.includes('mp4a') && b.includes('avc1'), 'H.264 + AAC'); }
assert.ok(read('docs/video/trailer-bat-nghiep-loi-doc.md').includes('**Hà Nội**') && read('THIRD-PARTY-NOTICES.md').includes('bizon-trailer-v3.mp4'));
for (const p of posters) { assert.ok(fs.existsSync(R(`assets/video/${p}.webp`)), 'thiếu poster WebP ' + p); assert.ok(size(`assets/video/${p}.webp`) < size(`assets/video/${p}.jpg`), 'WebP phải nhỏ hơn JPG: ' + p); }
// mỗi <source> là MP4; hộp thoại trailer và trang Vũ trụ chỉ dựng một nguồn MP4
for (const f of ['universe.html', 'brand-passport.html', 'Ho Chieu Thuong Hieu 3D.html']) { const s = read(f); const n = (s.match(/<source src="assets\/video\/[a-zA-Z0-9_.-]+\.mp4" type="video\/mp4">/g) || []).length; assert.ok(n > 0 && n === (s.match(/<source /g) || []).length, f + ': mọi <source> phải là MP4'); }
assert.match(read('js/app.js'), /<source src="\$\{T\('assets\/video\/bizon-huong-dan-choi-vi\.mp4'/);
assert.match(read('academia3d-v2.html'), /\[\[mp4, 'video\/mp4'\]\]\.forEach/);
assert.match(read('universe.html'), /var m=v\.dataset\.viSrc; \[\[m,'video\/mp4'\]\]\.forEach/);
assert.equal(read('index.html'), read('academia3d-v2.html'), 'index.html phải y hệt academia3d-v2.html');

// --- ánh sáng đất sét ---
{ const s = read('js/clay-light.js'); assert.match(s, /PALETTE = Object\.freeze\(\{ primary: '#e07a5f', secondary: '#f4f1de', accent: '#81b29a'/); assert.match(s, /root\.BizOnClayLight = \{ VERSION, PALETTE, rig, float \}/); }
for (const f of ['ben-phu-sa-3d.html', 'BizOn Game 3D.html', 'Ho Chieu Thuong Hieu 3D.html']) assert.ok(read(f).includes('<script src="js/bizon-lang.js"></script>\n<script src="js/clay-light.js"></script>'), f + ': nạp clay-light sau bizon-lang');
assert.match(read('js/bps3d.js'), /if \(window\.BizOnClayLight\) BizOnClayLight\.rig\(THREE, scene, \{ distance: 40 \}\);/);
{ const g = read('BizOn Game 3D.html'); assert.match(g, /BizOnClayLight\.rig\(THREE, scene, \{ distance: 14 \}\)/); assert.match(g, /BizOnClayLight\.rig\(THREE, RM\.scene, \{ distance: 10 \}\)/); assert.match(g, /BizOnClayLight\.rig\(THREE, AR\.scene, \{ distance: 11, intensity: 0\.7 \}\)/); assert.match(g, /pendants\.forEach\(\(p, i\) => BizOnClayLight\.float\(p, t, \{ amp: 0\.025/); }
assert.match(read('js/game3d-globe.js'), /BizOnClayLight\.rig\(THREE, scene, \{ distance: 4, intensity: 0\.8 \}\)/);
{ const sr = read('lab/ho-chieu-sau-rieng-3d.html'); assert.ok(sr.includes("clayFill = new T.DirectionalLight('#81b29a', 0.35)") && sr.includes("clayRim = new T.DirectionalLight('#f4f1de', 0.25)"), 'Sầu Riêng 3D có đèn đất sét'); }
{ const sw = read('sw.js'); assert.match(sw, /const CACHE = 'bizon-v\d+';/); assert.ok(sw.includes("'./js/clay-light.js'")); }
// Node: rig và float trên THREE giả
{ const vm = require('node:vm'); const ctx = { globalThis: null }; ctx.globalThis = ctx; vm.createContext(ctx); vm.runInContext(read('js/clay-light.js'), ctx);
  const CL = ctx.BizOnClayLight; assert.equal(CL.VERSION, 'cl-v1');
  class V3 { constructor() { this.x = 0; this.y = 0; this.z = 0; } set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } }
  class Obj { constructor() { this.position = new V3(); this.rotation = new V3(); this.children = []; this.userData = {}; } add(c) { this.children.push(c); return this; } }
  class DirectionalLight extends Obj { constructor(color, intensity) { super(); this.color = color; this.intensity = intensity; this.castShadow = true; } }
  class Group extends Obj {}
  const THREE = { DirectionalLight, Group }, scene = new Obj();
  const r = CL.rig(THREE, scene, { distance: 40 }); assert.equal(scene.children.length, 1); assert.equal(scene.children[0].name, 'clay-light-rig'); assert.equal(r.fill.color, '#81b29a'); assert.equal(r.fill.intensity, 0.35); assert.equal(r.rim.intensity, 0.25); assert.equal(r.fill.castShadow, false); assert.deepEqual([r.fill.position.x, r.fill.position.y, r.fill.position.z], [-40, 24, -40]); assert.deepEqual([r.rim.position.x, r.rim.position.y, r.rim.position.z], [0, -24, 40]);
  r.setIntensity(2); assert.equal(r.fill.intensity, 0.7); const r2 = CL.rig(THREE, new Obj(), { intensity: 0.5, fillColor: '#fff' }); assert.equal(r2.fill.color, '#fff'); assert.equal(r2.rim.intensity, 0.125);
  const o = new Obj(); o.position.y = 3; CL.float(o, 0, { amp: 0.5, speed: 1 }); assert.equal(o.position.y, 3); CL.float(o, Math.PI / 2, { amp: 0.5, speed: 1 }); assert.ok(Math.abs(o.position.y - 3.5) < 1e-9); assert.equal(o.userData.clayBaseY, 3); CL.float(null, 1); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } }); const errors = [];
  page.on('pageerror', e => errors.push('err: ' + e.message));
  await page.route(/\.(woff2?|mp3|m4a|mp4|webm)(\?|$)/, r => r.abort());
  await page.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
  // hộp thoại trailer trên trang chủ: một nguồn MP4; đóng thì xoá nguồn
  await page.goto(`${BASE}/academia3d-v2.html`, { waitUntil: 'load', timeout: 60000 }); await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelector('a[data-trailer]').click());
  await page.waitForFunction(() => document.getElementById('hp-trailer').open, null, { timeout: 10000 });
  const src = await page.$$eval('#hp-trailer video source', es => es.map(s => s.getAttribute('type') + ' ' + s.getAttribute('src')));
  assert.equal(src.length, 1); assert.match(src[0], /^video\/mp4 assets\/video\/[a-z0-9_.-]+\.mp4$/);
  assert.match(await page.evaluate(() => document.querySelector('#hp-trailer video').poster), /-poster\.webp$/);
  await page.evaluate(() => document.getElementById('hp-trailer').close()); await page.waitForTimeout(100);
  assert.equal(await page.$$eval('#hp-trailer video source', es => es.length), 0);
  // trang Vũ trụ (tiếng Việt): một nguồn MP4 tiếng Việt, poster WebP
  await page.goto(`${BASE}/universe.html`, { waitUntil: 'load', timeout: 60000 }); await page.waitForTimeout(300);
  const vu = await page.$$eval('#vu-intro source', es => es.map(s => s.getAttribute('src'))); assert.deepEqual(vu, ['assets/video/bizon-intro-vi-v4.mp4']);
  assert.match(await page.evaluate(() => document.getElementById('vu-intro').poster), /bizon-intro-vi-v3-poster\.webp$/);
  await browser.close();
  assert.deepEqual(errors, [], 'không lỗi JS');
  console.log('assets-clay-light: OK');
})().catch(e => { console.error(e); process.exit(1); });
