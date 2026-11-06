/* Nhân vật 3D có xương cho cả đội BizOn (06/11/2026): CFO, CMO, COO, SEC, Lumina, thầy Tú dựng bằng Meshy AI từ ảnh gốc assets/character/solid/
 * theo cùng cách với CEO (test nhan-vat-3d-ceo). Kiểm tĩnh từng GLB (hợp lệ, nhẹ, ba clip Idle/Talk/Walk, một bộ xương, một lớp màu JPEG), bảng GLB
 * trong bizon-characters.js, ghi nguồn; chạy thật (Playwright): sáu nhân vật nạp xong thay ảnh, đúng chiều cao theo ART_H, chuyển clip, không lỗi JS. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const IDS = ['cfo', 'cmo', 'coo', 'sec', 'lumina', 'tu'];

for (const id of IDS) {
  const glb = fs.readFileSync(R('assets/models/nhan-vat/' + id + '.glb'));
  const js = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)).toString());
  const tris = js.meshes.flatMap(m => m.primitives).reduce((a, p) => a + js.accessors[p.indices].count / 3, 0);
  check(glb.subarray(0, 4).toString() === 'glTF' && glb.length > 3e5 && glb.length < 2e6
    && JSON.stringify((js.animations || []).map(a => a.name)) === '["Idle","Talk","Walk"]' && js.skins && js.skins.length === 1
    && tris > 5000 && tris <= 20000 && js.images.length === 1 && js.images[0].mimeType === 'image/jpeg',
    id + '.glb hợp lệ ' + (glb.length / 1e6).toFixed(2) + ' MB, ' + Math.round(tris) + ' tam giác, clip Idle/Talk/Walk, một bộ xương, màu JPEG');
}
const bc = read('bizon-characters.js');
check(IDS.every(id => bc.includes(id + ": '" + id + ".glb'")) && bc.includes("ceo: 'ceo.glb'"), 'bizon-characters.js: bảng GLB có đủ CEO và sáu nhân vật đội');
const src = read('assets/models/SOURCES.md');
check(IDS.every(id => src.includes(id + '.glb')), 'SOURCES.md ghi nguồn sáu tệp');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 793, 'sw.js ≥ bizon-v793');

const PAGE = `<!DOCTYPE html><html><head><meta charset="utf-8"><script type="importmap">{"imports":{"three":"./js/vendor/three.module.js"}}</script></head>
<body><script type="module">
import * as THREE from 'three'; import { makeCharacters } from './bizon-characters.js';
const r = new THREE.WebGLRenderer(); r.setSize(300, 300); document.body.append(r.domElement);
const s = new THREE.Scene(), c = new THREE.PerspectiveCamera(35, 1, 0.01, 100); c.position.set(0, 1, 6); c.lookAt(0, 0.8, 0); s.add(new THREE.AmbientLight(0xffffff, 2));
const chars = makeCharacters(THREE); const IDS = ${JSON.stringify(IDS)}; const os = IDS.map((id, i) => { const o = chars.build(id); o.position.x = (i - 2.5) * 0.7; s.add(o); return o; });
window.__rig = () => os.map(o => { const g = o.userData.rig; return { glb: !!g.glb, art: g.art, cur: g.cur, h: g.model ? new THREE.Box3().setFromObject(g.model, true).getSize(new THREE.Vector3()).y : null }; });
let t = 0; window.__step = (mode, n) => { for (let i = 0; i < n; i++) { t += 1 / 60; os.forEach((o, k) => chars.animate(o, t, mode, k)); } r.render(s, c); };
window.__ready = 1;
</script></body></html>`;
const ART_H = { cfo: 1.12, cmo: 1.2, coo: 1.12, sec: 1.1, lumina: 1.14, tu: 1.18 };

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const p = await b.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message)); p.on('console', m => { if (m.type() === 'error') loi.push(m.text()); });
    await p.route(BASE + '/_nv3d-doi.html', r => r.fulfill({ contentType: 'text/html', body: PAGE }));
    await p.goto(BASE + '/_nv3d-doi.html'); await p.waitForFunction(() => window.__ready, null, { timeout: 60000 });
    await p.waitForFunction(() => window.__rig().every(x => x.glb), null, { timeout: 120000 });
    await p.evaluate(() => window.__step('idle', 5));
    let st = await p.evaluate(() => window.__rig());
    check(st.every(x => x.glb && !x.art && x.cur === 'idle'), 'sáu nhân vật tải xong thay ảnh bằng mô hình, clip Idle');
    check(st.every((x, i) => Math.abs(x.h - ART_H[IDS[i]]) < 0.08), 'chiều cao đúng như ảnh gốc: ' + st.map((x, i) => IDS[i] + ' ' + x.h.toFixed(2)).join(', '));
    await p.evaluate(() => window.__step('walk', 30)); st = await p.evaluate(() => window.__rig());
    check(st.every(x => x.cur === 'walk'), 'đi bộ: cả sáu chuyển sang clip Walk');
    await p.evaluate(() => window.__step('talk', 30)); st = await p.evaluate(() => window.__rig());
    check(st.every(x => x.cur === 'talk'), 'nói chuyện: cả sáu chuyển sang clip Talk');
    check(!loi.length, 'không lỗi JS ' + loi.join(' / '));
    await p.close();
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await b.close();
  if (fails) { console.log('nhan-vat-3d-doi: ' + fails + ' lỗi'); process.exit(1); }
  console.log('nhan-vat-3d-doi: ok');
})();
