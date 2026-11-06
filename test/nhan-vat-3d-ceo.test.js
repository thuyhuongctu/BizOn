/* Nhân vật 3D có xương cho BizOn Game 3D (06/11/2026), thử trước với CEO: assets/models/nhan-vat/ceo.glb do Meshy AI dựng từ chính ảnh gốc
 * assets/character/solid/ceo-tex.webp, gắn xương, ba clip Idle/Talk/Walk gộp trong một tệp, màu vẽ 1024 px. bizon-characters.js ưu tiên GLB,
 * trong lúc tải hay tải hỏng thì dùng ảnh gốc dựng đứng như cũ. Kiểm tĩnh và chạy thật (Playwright): mô hình nạp xong thay ảnh, đúng chiều cao,
 * chuyển clip theo trạng thái idle/talk/walk, hai bản nhân bản chạy độc lập, không lỗi JS. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');

const glb = fs.readFileSync(R('assets/models/nhan-vat/ceo.glb'));
check(glb.subarray(0, 4).toString() === 'glTF' && glb.length > 3e5 && glb.length < 2e6, 'GLB hợp lệ, dưới 2 MB (' + (glb.length / 1e6).toFixed(2) + ' MB)');
const js = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)).toString());
check(JSON.stringify((js.animations || []).map(a => a.name)) === '["Idle","Talk","Walk"]' && js.skins && js.skins.length === 1, 'ba clip Idle, Talk, Walk và một bộ xương');
const tris = js.meshes.flatMap(m => m.primitives).reduce((a, p) => a + js.accessors[p.indices].count / 3, 0);
check(tris > 5000 && tris <= 20000 && js.images.length === 1 && js.images[0].mimeType === 'image/jpeg', 'lưới nhẹ ' + Math.round(tris) + ' tam giác, một lớp màu JPEG');
const bc = read('bizon-characters.js');
check(bc.includes("const GLB = { ceo: 'ceo.glb',") && bc.includes("'assets/models/nhan-vat/'") && bc.includes('skeletonClone(gltf.scene)') && bc.includes('AnimationMixer'), 'bizon-characters.js: nạp GLB, nhân bản xương, mixer');
check(bc.includes("const build = id => (USE_GLB && GLB[id]) ? rigChar(id) : (USE_ART && ART[id]) ? artChar(id)"), 'ưu tiên GLB → ảnh gốc → khối đất sét');
check(bc.includes('sm.geometry.computeBoundingBox()') && bc.includes('gltf.scene.updateMatrixWorld(true)'), 'đo chiều cao bằng hình học tư thế gốc; cập nhật ma trận trước khi nhân bản');
check(read('assets/models/SOURCES.md').includes('nhan-vat/ceo.glb') && read('THIRD-PARTY-NOTICES.md').includes('nhan-vat/'), 'ghi nguồn gốc');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 791, 'sw.js ≥ bizon-v791');

const PAGE = `<!DOCTYPE html><html><head><meta charset="utf-8"><script type="importmap">{"imports":{"three":"./js/vendor/three.module.js"}}</script></head>
<body><script type="module">
import * as THREE from 'three'; import { makeCharacters } from './bizon-characters.js';
const r = new THREE.WebGLRenderer(); r.setSize(300, 300); document.body.append(r.domElement);
const s = new THREE.Scene(), c = new THREE.PerspectiveCamera(35, 1, 0.01, 100); c.position.set(0, 1, 4); c.lookAt(0, 0.8, 0); s.add(new THREE.AmbientLight(0xffffff, 2));
const chars = makeCharacters(THREE); const a = chars.build('ceo'), b = chars.build('ceo'); a.position.x = -0.6; b.position.x = 0.6; s.add(a, b);
window.__rig = () => [a, b].map(o => { const g = o.userData.rig; return { glb: !!g.glb, art: g.art, cur: g.cur, t: g.mixer ? g.mixer.time : null, h: g.model ? new THREE.Box3().setFromObject(g.model, true).getSize(new THREE.Vector3()).y : null, hip: g.model ? g.model.getObjectByName('Hips').quaternion.toArray().map(v => +v.toFixed(3)) : null }; });
let t = 0; window.__step = (mode, n) => { for (let i = 0; i < n; i++) { t += 1 / 60; chars.animate(a, t, mode, 0); chars.animate(b, t, 'idle', 3); } r.render(s, c); };
window.__ready = 1;
</script></body></html>`;

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const p = await b.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message)); p.on('console', m => { if (m.type() === 'error') loi.push(m.text()); });
    await p.route(BASE + '/_nv3d.html', r => r.fulfill({ contentType: 'text/html', body: PAGE }));
    await p.goto(BASE + '/_nv3d.html'); await p.waitForFunction(() => window.__ready, null, { timeout: 60000 });
    await p.waitForFunction(() => window.__rig().every(x => x.glb), null, { timeout: 90000 });
    await p.evaluate(() => window.__step('idle', 5));
    let st = await p.evaluate(() => window.__rig());
    check(st.every(x => x.glb && !x.art && x.cur === 'idle') && st.every(x => Math.abs(x.h - 1.2) < 0.08), 'tải xong thay ảnh bằng mô hình, cao 1,2 đơn vị như ảnh (' + st.map(x => x.h.toFixed(2)).join(', ') + ')');
    await p.evaluate(() => window.__step('walk', 30)); st = await p.evaluate(() => window.__rig());
    check(st[0].cur === 'walk' && st[1].cur === 'idle' && st[0].t > 0.4, 'đi bộ: clip Walk chạy, bản nhân bản kia vẫn đứng (t=' + st[0].t.toFixed(2) + ')');
    const hipA = st[0].hip.join(','), hipB = st[1].hip.join(',');
    await p.evaluate(() => window.__step('walk', 20)); st = await p.evaluate(() => window.__rig());
    check(st[0].hip.join(',') !== hipA && hipB !== st[0].hip.join(','), 'xương hông chuyển động theo clip, hai bản nhân bản độc lập');
    await p.evaluate(() => window.__step('talk', 30)); st = await p.evaluate(() => window.__rig());
    check(st[0].cur === 'talk', 'nói chuyện: chuyển sang clip Talk');
    check(!loi.length, 'không lỗi JS ' + loi.join(' / '));
    await p.close();
    // Không tải được GLB (mạng chặn): vẫn là ảnh gốc dựng đứng, không lỗi
    const q = await b.newPage(); const loi3 = []; q.on('pageerror', e => loi3.push(e.message));
    await q.route(BASE + '/_nv3d.html', r => r.fulfill({ contentType: 'text/html', body: PAGE }));
    await q.route(/nhan-vat\/ceo\.glb/, r => r.abort());
    await q.goto(BASE + '/_nv3d.html'); await q.waitForFunction(() => window.__ready, null, { timeout: 60000 }); await q.waitForTimeout(1500);
    await q.evaluate(() => window.__step('walk', 10));
    const du = await q.evaluate(() => window.__rig());
    check(du.every(x => x.art && !x.glb) && !loi3.length, 'tải GLB hỏng thì vẫn dùng ảnh gốc dựng đứng, không lỗi JS ' + loi3.join(' / '));
    await q.close();
    // Trang game thật: CEO nạp được trong trụ sở (diorama), không lỗi JS
    const g = await b.newPage({ viewport: { width: 1000, height: 600 } }); const loi2 = []; g.on('pageerror', e => loi2.push(e.message));
    await g.goto(BASE + '/BizOn%20Game%203D.html?diorama=1'); await g.waitForTimeout(12000);
    const ok = await g.evaluate(async () => (await fetch('assets/models/nhan-vat/ceo.glb', { method: 'HEAD' })).ok);
    check(ok && !loi2.length, 'BizOn Game 3D (diorama) tải tệp CEO qua máy chủ, không lỗi JS ' + loi2.join(' / '));
    await g.close();
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await b.close();
  if (fails) { console.log('nhan-vat-3d-ceo: ' + fails + ' lỗi'); process.exit(1); }
  console.log('nhan-vat-3d-ceo: ok');
})();
