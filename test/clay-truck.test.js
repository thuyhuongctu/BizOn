'use strict';
// Xe lạnh đất sét (js/clay-truck.js): mô hình Three.js dựng bằng mã theo ảnh chặng 6 (quy trình img2threejs), dùng cho
// hai xe trên đường và mô hình nhỏ ở trạm chặng 6 của Hộ Chiếu Sầu Riêng 3D thay bốn khối hộp cũ.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// --- 1 · Mô-đun chạy trong Node với THREE giả ---
class V3 { constructor() { this.x = 0; this.y = 0; this.z = 0; } set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } setScalar(v) { return this.set(v, v, v); } }
class Obj { constructor() { this.position = new V3(); this.rotation = new V3(); this.scale = new V3().setScalar(1); this.children = []; this.castShadow = false; } add(c) { this.children.push(c); return this; } traverse(fn) { fn(this); this.children.forEach(c => c.traverse(fn)); } }
class Geo { constructor(kind, args) { this.kind = kind; this.args = args; } translate() { return this; } }
const geo = kind => class extends Geo { constructor(...a) { super(kind, a); } };
class Shape { moveTo() {} lineTo() {} quadraticCurveTo() {} }
class Mesh extends Obj { constructor(g, m) { super(); this.isMesh = true; this.geometry = g; this.material = m; } }
const THREE = { Group: class extends Obj {}, Mesh, Shape, BoxGeometry: geo('box'), CylinderGeometry: geo('cyl'), SphereGeometry: geo('sph'), PlaneGeometry: geo('plane'), ExtrudeGeometry: geo('extrude'), MeshStandardMaterial: class { constructor(o) { Object.assign(this, o); } }, MeshBasicMaterial: class { constructor(o) { Object.assign(this, o); } }, CanvasTexture: class {}, SRGBColorSpace: 'srgb' };
const ctx = { globalThis: null }; ctx.globalThis = ctx; vm.createContext(ctx); vm.runInContext(read('js/clay-truck.js'), ctx);
const CT = ctx.BizOnClayTruck; assert.equal(CT.VERSION, 'ct-v1'); assert.equal(CT.COLORS.cab, '#9FD6BF'); assert.deepEqual(JSON.parse(JSON.stringify(CT.DIM)), { width: 2.2, length: 5.4, height: 3.1 });
{ const mats = []; const r = CT.build(THREE, { mat: c => { mats.push(c); return { color: c }; } });
  assert.equal(r.group.name, 'clay-truck'); assert.equal(r.wheels.length, 6, '3 trục × 2 bánh'); assert.ok(r.fan);
  const rounded = []; r.group.traverse(o => { if (o.isMesh && o.geometry.kind === 'extrude') rounded.push(o); }); assert.equal(rounded.length, 4, 'thùng, dàn lạnh, ca-bin, mái ca-bin bo góc');
  assert.ok(mats.includes('#9FD6BF') && mats.includes('#F6F8F4') && mats.includes('#F2A33A'), 'ca-bin mint, thùng trắng, đèn sườn cam');
  let planes = 0; r.group.traverse(o => { if (o.isMesh && o.geometry.kind === 'plane') planes++; }); assert.equal(planes, 4, '2 bảng LED + 2 tem (không có document → vật liệu màu phẳng)');
  const y0 = r.wheels[0].rotation.x; r.tick(0.5, 2); assert.ok(Math.abs(r.wheels[0].rotation.x - (y0 - 3)) < 1e-9, 'bánh quay theo dt × tốc độ'); assert.ok(r.fan.rotation.z > 0);
  assert.equal(r.group.scale.x, 1); }
{ const r = CT.build(THREE, { scale: 0.16, detail: 'low', emblem: false, cabColor: '#C0603F' });
  assert.equal(r.group.scale.x, 0.16); let planes = 0, cab = 0; r.group.traverse(o => { if (o.isMesh && o.geometry.kind === 'plane') planes++; if (o.isMesh && o.material && o.material.color === '#C0603F') cab++; });
  assert.equal(planes, 2, 'bản thấp không tem, vẫn 2 bảng LED'); assert.ok(cab >= 2, 'ca-bin và chắn bùn theo màu truyền vào'); assert.equal(r.wheels.length, 6); }
{ const g = CT.roundedBox(THREE, 2, 1, 3, 0.1, 2); assert.equal(g.kind, 'extrude'); assert.equal(g.args[1].depth, 2.8); assert.equal(g.args[1].bevelSize, 0.1); }

// --- 2 · Nối vào Sầu Riêng 3D: nạp đồng bộ ở <head> trước runtime, template dùng mô-đun cho xe đường + xe mini, không còn khối hộp cũ ---
const page = read('lab/ho-chieu-sau-rieng-3d.html'), lines = page.split('\n');
assert.ok(page.includes('<script src="../js/bizon-lang.js"></script>\n<script src="../js/clay-truck.js"></script>'), 'clay-truck.js nạp ngay sau bizon-lang.js');
const tpl = JSON.parse(lines[lines.findIndex(l => l.trim() === '<script type="__bundler/template">') + 1]);
assert.match(tpl, /const rig = window\.BizOnClayTruck\.build\(T, \{ mat, cabColor: i \? '#C0603F' : undefined, detail: this\.low \? 'low' : 'full'/);
assert.match(tpl, /return \{ g, rig, x1, z1, x2, z2, t: i \* 0\.5, sp: 0\.035 \};/);
assert.match(tpl, /k\.g\.rotation\.y = Math\.atan2\(k\.x2 - k\.x1, 0\) \* \(k\.t < 0\.5 \? 1 : -1\);\n\s*k\.rig\.tick\(dt, 1\.4\);/);
assert.match(tpl, /const mini = P\.truckRig = window\.BizOnClayTruck\.build\(T, \{ mat, scale: 0\.16, detail: 'low', emblem: false \}\); mini\.group\.rotation\.y = Math\.PI \/ 2; tr\.add\(mini\.group\);/);
assert.match(tpl, /if \(P\.truck\) \{ P\.truckRig\.tick\(1 \/ 60, on \? 1\.6 : 0\.5\);/);
assert.ok(!tpl.includes("new T.BoxGeometry(2.2, 1.6, 4), mat('#F4F7F8')") && !tpl.includes("new T.BoxGeometry(0.75, 0.42, 0.4), mat('#F4F7F8')"), 'khối hộp cũ đã bỏ');
{ const sw = read('sw.js'); assert.match(sw, /const CACHE = 'bizon-v\d+';/); assert.ok(sw.includes("'./js/clay-truck.js'"), 'sw precache'); }

// --- 3 · Trình duyệt: trang 3D dựng cảnh với 2 xe trên đường + xe mini, không lỗi JS ---
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await browser.newPage({ viewport: { width: 1280, height: 800 } }); const errors = [];
  pg.on('pageerror', e => errors.push('err: ' + e.message));
  await pg.route(/\.(mp3|m4a|mp4|webm)(\?|$)/, r => r.abort());
  await pg.goto(`${BASE}/lab/ho-chieu-sau-rieng-3d.html?test=1`, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForFunction(() => window.BizOnClayTruck && window.__hsr3d && window.__hsr3d.state.ready, null, { timeout: 120000 });
  const info = await pg.evaluate(() => { const c = window.__hsr3d; const t = c.trucks || []; let mini = 0; c.scene.traverse(o => { if (o.name === 'clay-truck') mini++; }); return { trucks: t.length, wheels: t.map(k => k.rig.wheels.length), named: mini, version: BizOnClayTruck.VERSION }; });
  assert.equal(info.version, 'ct-v1'); assert.equal(info.trucks, 2); assert.deepEqual(info.wheels, [6, 6]); assert.ok(info.named >= 2, 'ít nhất 2 xe đường trong cảnh (xe mini dựng khi vào ván)');
  await pg.waitForTimeout(800);
  const moved = await pg.evaluate(() => { const k = window.__hsr3d.trucks[0]; return { x: k.g.position.x, rot: k.rig.wheels[0].rotation.x }; });
  assert.ok(Number.isFinite(moved.x) && moved.rot < 0, 'xe chạy, bánh quay');
  await browser.close();
  assert.deepEqual(errors, [], 'không lỗi JS');
  console.log('clay-truck: OK');
})().catch(e => { console.error(e); process.exit(1); });
