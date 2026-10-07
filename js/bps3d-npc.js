/* Bến Phù Sa 3D – chế độ chèo ghe gặp NPC. Dựng lại bàn đất sét + sông của bps3d-v3.js (cùng toạ độ P, HOME),
   thêm ghe người chơi điều khiển được và NPC đứng to trên bàn, lại gần bấm E / chạm để nói chuyện. */
import * as THREE from '../vendor/three/three.module.js';

export const P = [[-26, -8], [-4, -2], [-20, 16], [12, 16], [30, -16], [24, 4], [-5, 25], [6, -23]];
export const HOME = [-4, 10];

export function mount(el, init) {
  // mô hình ghe thật từ bp3d-boat/ (repo). Module này được nạp qua blob: nên phải resolve theo document, không theo import.meta.url
  const MODELS = (async () => { try { const base = (typeof document !== 'undefined' && document.baseURI) || location.href;
    const [mt, bo, hu, tu, gm, cg, tm] = await Promise.all(['materials','model-boat','model-huong','model-tu','model-ghe-mui','model-ghe-cargo','model-team'].map(n => (window.__bp3dMods ? window.__bp3dMods(n) : import(new URL('bp3d-boat/' + n + '.js', base).href))));
    return { M: mt.makeMaterials(THREE), bo, hu, tu, gm, cg, tm }; } catch (e) { console.warn('bp3d-boat models', e); return null; } })();
  let props = init;
  const W = () => el.clientWidth || 800, H = () => el.clientHeight || 450;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio)); renderer.setSize(W(), H());
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
  Object.assign(renderer.domElement.style, { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', touchAction: 'none' });
  el.appendChild(renderer.domElement);
  const labels = document.createElement('div'); Object.assign(labels.style, { position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }); el.appendChild(labels);

  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xcfeaf2); scene.fog = new THREE.Fog(0xcfeaf2, 70, 160);
  const camera = new THREE.PerspectiveCamera(36, W() / H(), 0.1, 400);
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x9bbf9a, 0.95));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.2); sun.position.set(-26, 44, 22); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.06; Object.assign(sun.shadow.camera, { left: -52, right: 52, top: 52, bottom: -52, far: 140 }); scene.add(sun);
  const fill = new THREE.DirectionalLight(0xbcd8ff, 0.45); fill.position.set(30, 18, -30); scene.add(fill);

  const clayTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#808080'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) { const r = 1 + Math.random() * 5, v = 110 + Math.random() * 40; x.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',.35)'; x.beginPath(); x.arc(Math.random() * 256, Math.random() * 256, r, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(150,150,150,.25)'; x.lineWidth = 2; for (let i = 0; i < 40; i++) { x.beginPath(); const cx = Math.random() * 256, cy = Math.random() * 256; x.arc(cx, cy, 6 + Math.random() * 14, Math.random() * 3, Math.random() * 3 + 2); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t; })();
  const MATS = {};
  const clay = (c, o = {}) => { const k = c + JSON.stringify(o); if (!o.emissive && MATS[k]) return MATS[k];
    const m = new THREE.MeshPhysicalMaterial(Object.assign({ color: c, roughness: 0.82, metalness: 0, sheen: 0.55, sheenRoughness: 0.75, sheenColor: 0xffffff, bumpMap: clayTex, bumpScale: 1.4 }, o)); if (!o.emissive) MATS[k] = m; return m; };
  const M = (geo, mat, x = 0, y = 0, z = 0, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const GEO = {};
  function rrect(w, d, r) { const s = new THREE.Shape(), x = -w / 2, y = -d / 2; r = Math.min(r, w / 2, d / 2);
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
  function rgeo(w, h, d) { const k = [w, h, d].join(); if (GEO[k]) return GEO[k];
    const b = Math.min(0.28, w / 4, h / 4, d / 4), g = new THREE.ExtrudeGeometry(rrect(w - 2 * b, d - 2 * b, Math.min(w, d) * 0.12), { depth: Math.max(0.01, h - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 4, curveSegments: 6 });
    g.rotateX(-Math.PI / 2); g.translate(0, -(h - 2 * b) / 2, 0); g.computeVertexNormals(); return GEO[k] = g; }
  const box = (w, h, d, c, x, y, z, p) => M(rgeo(w, h, d), clay(c), x, y + h / 2, z, p);
  const cyl = (r1, r2, h, c, x, y, z, p, s = 20) => M(new THREE.CylinderGeometry(r1, r2, h, s), clay(c), x, y + h / 2, z, p);
  const ball = (r, c, x, y, z, p) => M(new THREE.SphereGeometry(r, 24, 18), clay(c), x, y, z, p);
  const blob = (r, c, x, y, z, p, sx = 1, sy = 0.8, sz = 1) => { const m = ball(r, c, x, y, z, p); m.scale.set(sx, sy, sz); return m; };
  const roof = (w, h, d, c, x, y, z, p) => { const m = M(new THREE.ConeGeometry(0.72, 1, 4), clay(c), x, y + h / 2, z, p); m.rotation.y = Math.PI / 4; m.scale.set(w, h, d); return m; };

  // bàn đất nặn + đảo + sông – như bps3d-v3.js
  M(new THREE.CylinderGeometry(90, 90, 1, 64), clay(0xf1dfc2), 0, -5.2, 0).castShadow = false;
  M(new THREE.CylinderGeometry(45, 43, 4.4, 80), clay(0xc98b5a), 0, -2.4, 0).castShadow = false;
  const ground = M(new THREE.CylinderGeometry(44.2, 45.2, 1.2, 80), clay(0xa7d690), 0, -0.6, 0); ground.castShadow = false;
  for (let k = 0; k < 44; k++) { const a = k / 44 * Math.PI * 2, b = ball(1.3 + (k % 3) * 0.3, k % 2 ? 0x98cc80 : 0xb3dd98, Math.cos(a) * 44.4, -0.2, Math.sin(a) * 44.4); b.scale.set(1.2, 0.55, 1.2); }
  const river = new THREE.Shape(); river.moveTo(-50, -6);
  river.bezierCurveTo(-25, -12, -12, 6, 4, 2); river.bezierCurveTo(18, -2, 30, 10, 50, 6);
  river.lineTo(50, 14); river.bezierCurveTo(30, 18, 18, 6, 4, 10); river.bezierCurveTo(-14, 14, -24, -4, -50, 2); river.closePath();
  const water = M(new THREE.ExtrudeGeometry(river, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.6, bevelSegments: 4 }), clay(0x69c3d3, { roughness: 0.35, sheen: 0.2, clearcoat: 0.6 }), 0, 0.05, 0);
  water.rotation.x = -Math.PI / 2; water.position.z = -4; water.castShadow = false; water.scale.set(0.9, 0.9, 1);
  const PADC = [0xe0a04f, 0xd9b56a, 0xf2c97a, 0x9fd06e, 0xb7b0a6, 0x8a7bc8, 0xe07a5f, 0xf5c542];
  P.forEach((p, i) => cyl(5.2, 5.5, 0.4, PADC[i], p[0], -0.1, p[1]));
  const GREENS = [0x6fbf6a, 0x86cc72, 0x5aad63];
  function tree(x, z, p, s = 1) { cyl(0.26 * s, 0.4 * s, 1.6 * s, 0x9a6a45, x, 0, z, p); const k = Math.floor(Math.abs(x * 7 + z * 3)) % 3;
    blob(1.2 * s, GREENS[k], x, 2.2 * s, z, p, 1, 0.9, 1); blob(0.85 * s, GREENS[(k + 1) % 3], x + 0.7 * s, 2.9 * s, z + 0.2 * s, p, 1, 0.9, 1); blob(0.75 * s, GREENS[(k + 2) % 3], x - 0.6 * s, 2.8 * s, z - 0.3 * s, p, 1, 0.9, 1); }
  function palm(x, z, p, s = 1) { let px = x; for (let k = 0; k < 6; k++) { cyl(0.26 * s, 0.3 * s, 0.7 * s, k % 2 ? 0xa9784e : 0x946441, px, k * 0.66 * s, z, p, 12); px += 0.12 * s; }
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, l = blob(0.9 * s, 0x5fae63, px + Math.cos(a) * 1.1 * s, 4.1 * s, z + Math.sin(a) * 1.1 * s, p, 1.6, 0.22, 0.55); l.rotation.y = -a; l.rotation.z = -0.35; }
    ball(0.28 * s, 0x7a5a3a, px, 3.9 * s, z + 0.2, p); }
  function house(x, z, p, c = 0xfbf1dc, rc = 0xe07a5f, s = 1) { box(3 * s, 2.2 * s, 2.4 * s, c, x, 0, z, p); roof(3.9 * s, 1.8 * s, 3.3 * s, rc, x, 2.2 * s, z, p); box(0.7 * s, 1.2 * s, 0.2 * s, 0x8a5a3b, x, 0, z + 1.2 * s, p); box(0.6 * s, 0.6 * s, 0.15 * s, 0xbfe6f5, x + 0.9 * s, 1 * s, z + 1.22 * s, p); }
  function stilt(x, z, p) { [[-1.2, -0.8], [1.2, -0.8], [-1.2, 0.8], [1.2, 0.8]].forEach(q => cyl(0.14, 0.14, 1.4, 0x7a5a3a, x + q[0], -0.2, z + q[1], p, 8)); box(3.2, 0.3, 2.2, 0xb58a5a, x, 1.2, z, p); box(2.8, 1.6, 1.8, 0xf1e3c8, x, 1.5, z, p); roof(3.9, 1.5, 2.9, 0xc9a25a, x, 3.1, z, p); }
  function lantern(x, y, z, p) { const l = ball(0.34, 0xff7a3d, x, y, z, p); l.material = clay(0xff7a3d, { emissive: 0xff5a1f, emissiveIntensity: 0 }); l.userData.lantern = true; return l; }
  function build(i, g) {
    if (i === 0) { for (let k = 0; k < 5; k++) { const b = new THREE.Group(); box(2.8, 0.6, 1.1, [0xd98b4a, 0xc9713a, 0xe0a04f][k % 3], 0, 0, 0, b); blob(0.35, 0xf5c542, -0.5, 0.8, 0, b); blob(0.35, 0x7bc46a, 0.2, 0.8, 0.1, b); blob(0.32, 0xe86a5a, 0.8, 0.8, -0.1, b); box(0.9, 0.12, 0.9, 0x5b7f5a, -1, 1.5, 0, b); cyl(0.05, 0.05, 1, 0x7a5a3a, -1, 0.5, 0, b, 6);
      b.position.set((k % 3) * 3.2 - 3.2, 0.2, Math.floor(k / 3) * 2.2 - 1); b.rotation.y = k * 0.7; b.userData.bob = k; g.add(b); } }
    if (i === 1) { box(6.4, 0.45, 2.4, 0xb58a5a, 0, 0.2, 0, g); for (let k = -2.4; k <= 2.4; k += 1.6) cyl(0.2, 0.2, 1, 0x7a5a3a, k, -0.6, 1.1, g, 10); house(-4, 1.8, g, 0xfbf1dc, 0x2f8a8c, 0.7);
      const f = new THREE.Group(); box(4.4, 0.9, 2.2, 0xfbf1dc, 0, 0, 0, f); box(2.2, 1, 1.7, 0x2f8a8c, -0.4, 0.9, 0, f); box(0.5, 0.9, 0.5, 0xf5a04a, 1.3, 0.9, 0, f); f.position.set(0, 0.2, -3.2); f.userData.bob = 9; g.add(f); }
    if (i === 2) { box(4.6, 3.6, 3.2, 0xfbf1dc, -1.4, 0, 0, g); roof(5.8, 1.6, 4.4, 0xe07a5f, -1.4, 3.6, 0, g); for (let k = 0; k < 3; k++) box(0.7, 0.9, 0.15, 0xbfe6f5, -2.8 + k * 1.4, 1.8, 1.62, g);
      box(2.6, 2.4, 2.4, 0xf6e2c0, 2.8, 0, 0.8, g); cyl(0.08, 0.08, 3, 0x6a6a6a, 2.8, 2.4, 0.8, g, 6); box(1.3, 0.8, 0.12, 0x2f8a8c, 3.45, 4.4, 0.8, g); palm(-4.8, 2.6, g, 0.8); tree(4.6, -1.8, g, 0.7); }
    if (i === 3) { M(new THREE.CylinderGeometry(4, 4.2, 0.3, 36), clay(0x97d27c), 0, 0.1, 0, g).castShadow = false; tree(-2.5, -1, g); tree(0.5, 1.6, g, 1.2); palm(2.8, -1.4, g, 0.9);
      box(2.2, 0.35, 0.7, 0xb58a5a, 0, 0.45, -2.6, g); [-0.8, 0.8].forEach(x => box(0.15, 0.45, 0.6, 0x7a5a3a, x, 0, -2.6, g)); for (let k = 0; k < 6; k++) ball(0.22, [0xf2a5c0, 0xf5c542, 0xffffff][k % 3], -3 + k * 1.1, 0.4, 2.8, g); }
    if (i === 4) { box(5.4, 2.8, 3.6, 0xc7d0d3, 0, 0, 0, g); for (let k = 0; k < 3; k++) roof(1.9, 1.2, 3.7, 0xa7b4b8, -1.8 + k * 1.8, 2.8, 0, g); cyl(0.5, 0.6, 5.4, 0xe07a5f, 2.4, 0, -1.4, g); box(1.2, 1.2, 1.2, 0xf5a04a, -3.6, 0, 1.8, g); box(1.2, 1.2, 1.2, 0x2f8a8c, -3.6, 1.2, 1.8, g);
      for (let k = 0; k < 3; k++) { const sm = blob(0.7 + k * 0.2, 0xf4f4f0, 2.4, 6.2 + k, -1.4, g, 1, 0.85, 1); sm.userData.smoke = k; } }
    if (i === 6) { box(5.2, 0.5, 3.8, 0xd9c19a, 0, 0, 0, g); box(4.2, 2.2, 2.8, 0xfbe3c0, 0, 0.5, -0.2, g); roof(5.6, 1.7, 4, 0xc0392b, 0, 2.7, -0.2, g); [-1.8, 1.8].forEach(x => cyl(0.22, 0.22, 2.4, 0xb8862f, x, 0.5, 1.3, g, 10));
      for (let k = 0; k < 6; k++) { const x = -3.6 + k * 1.45; cyl(0.06, 0.06, 3.2, 0x7a5a3a, x, 0, 2.6, g, 6); box(0.6, 0.4, 0.06, [0xf5c542, 0xe8762d, 0x2f8a8c][k % 3], x + 0.32, 2.7, 2.6, g); }
      for (let k = 0; k < 6; k++) lantern(-3 + k * 1.2, 3.6 + Math.sin(k) * 0.15, 1.6, g); }
    if (i === 7) { M(new THREE.CylinderGeometry(4.4, 4.6, 0.3, 36), clay(0x8fcb72), 0, 0.1, 0, g).castShadow = false;
      [[-2.6, -1.6], [0, -2], [2.6, -1.4], [-1.4, 1], [1.4, 1.2]].forEach((q, k) => { tree(q[0], q[1], g, 0.85); for (let f = 0; f < 4; f++) ball(0.2, [0xf5c542, 0xe86a5a, 0xf29a3a, 0x9bd14a][(k + f) % 4], q[0] + Math.cos(f * 1.6) * 0.9, 2.1 + (f % 2) * 0.5, q[1] + Math.sin(f * 1.6) * 0.7, g); });
      for (let k = 0; k < 3; k++) { cyl(0.5, 0.4, 0.5, 0xb58a5a, -1.4 + k * 1.4, 0.2, 3, g, 12); blob(0.4, [0xf5c542, 0x7bc46a, 0xe86a5a][k], -1.4 + k * 1.4, 0.85, 3, g); } }
    if (i === 5) { for (let k = 0; k < 4; k++) { const x = -3.3 + k * 2.2; box(1.8, 1.2, 1.4, 0xfbf1dc, x, 0, 0, g); roof(2.3, 0.8, 1.9, [0xf5a04a, 0x2f8a8c, 0xe07a8f, 0x6fb86a][k], x, 1.2, 0, g); }
      for (let k = 0; k < 8; k++) lantern(-4.2 + k * 1.2, 2.9 + Math.sin(k * 1.3) * 0.2, 1.3, g); cyl(0.1, 0.1, 3, 0x6a6a6a, -4.6, 0, 1.3, g, 8); cyl(0.1, 0.1, 3, 0x6a6a6a, 4.6, 0, 1.3, g, 8); }
  }
  const ANIM = { bob: [], smoke: [], lantern: [], cloud: [], ripple: [], boats: [], birds: [], ducks: [] };
  P.forEach((p, i) => { const g = new THREE.Group(); g.position.set(p[0], 0, p[1]); scene.add(g); build(i, g);
    g.traverse(o => { if (o.userData.bob !== undefined) { o.userData.y0 = o.position.y; ANIM.bob.push(o); } if (o.userData.smoke !== undefined) { o.userData.y0 = o.position.y; ANIM.smoke.push(o); } if (o.userData.lantern) ANIM.lantern.push(o); }); });
  // ghe hàng xuôi ngược trên sông
  const riverY = x => x * 0.02 + 2 + Math.sin(x / 9) * 2.6;
  for (let k = 0; k < 4; k++) { const b = new THREE.Group(); box(2.6, 0.5, 1, [0xd98b4a, 0x2f8a8c, 0xe0a04f, 0xc9713a][k], 0, 0, 0, b); blob(0.32, [0xf5c542, 0x7bc46a, 0xe86a5a, 0xf08a24][k], -0.5, 0.65, 0, b); blob(0.3, 0xfbf1dc, 0.4, 0.65, 0, b);
    const pr = new THREE.Group(); M(new THREE.CapsuleGeometry(0.22, 0.3, 4, 10), clay([0x8a7bc8, 0xe07a8f, 0x2f8a8c, 0xf5a04a][k]), 0, 0.75, 0, pr); M(new THREE.ConeGeometry(0.4, 0.22, 14), clay(0xf3dca0), 0, 1.25, 0, pr); pr.position.x = 1; b.add(pr);
    b.userData = { x: -40 + k * 20, dir: k % 2 ? 1 : -1, sp: 2.2 + k * 0.5 }; scene.add(b); ANIM.boats.push(b); }
  // vịt trên sông
  for (let k = 0; k < 5; k++) { const d = new THREE.Group(); blob(0.28, 0xfbf1dc, 0, 0.2, 0, d, 1.3, 0.8, 1); ball(0.16, 0xfbf1dc, 0.3, 0.45, 0, d); M(new THREE.ConeGeometry(0.07, 0.18, 8), clay(0xf5a04a), 0.46, 0.43, 0, d).rotation.z = -Math.PI / 2;
    d.userData = { a: k * 1.3, cx: -22 + k * 11, cz: riverY(-22 + k * 11), r: 1.2 + (k % 2) }; scene.add(d); ANIM.ducks.push(d); }
  // chim bay
  for (let k = 0; k < 3; k++) { const f = new THREE.Group(); const w1 = M(new THREE.BoxGeometry(0.9, 0.06, 0.25), clay(0x2b2b30), -0.45, 0, 0, f), w2 = M(new THREE.BoxGeometry(0.9, 0.06, 0.25), clay(0x2b2b30), 0.45, 0, 0, f); f.userData = { w1, w2, ph: k * 2, r: 18 + k * 6, h: 14 + k * 2 }; f.traverse(o => { o.castShadow = false; }); scene.add(f); ANIM.birds.push(f); }
  [[-38, 20], [-34, 27], [38, 20], [36, -28], [-14, 33], [6, 34], [-40, -20], [-6, -33], [18, -30], [42, -6], [-30, 32], [28, 28]].forEach((p, k) => (k % 2 ? palm : tree)(p[0], p[1], scene, 1 + (k % 3) * 0.18));
  [[-40, -8], [-16, 9.5], [14, 11.5], [40, -1]].forEach(p => stilt(p[0], p[1], scene));
  [[-12, -24], [8, -22], [-36, 8]].forEach(p => house(p[0], p[1], scene, 0xfbf1dc, 0xe07a5f, 0.9));
  [[-30, 22, -30], [10, 26, -36], [34, 20, -22]].forEach(c => { const g = new THREE.Group(); [[0, 0, 2.4], [2.4, 0.4, 1.8], [-2.2, 0.2, 1.9], [0.6, 1.4, 1.7]].forEach(q => blob(q[2], 0xffffff, q[0], q[1], 0, g, 1, 0.8, 0.9)); g.position.set(c[0], c[1], c[2]); g.userData.x0 = c[0]; g.traverse(o => { o.castShadow = false; }); scene.add(g); ANIM.cloud.push(g); });
  [[-34, -3], [-14, 3.5], [8, 2], [22, 4.5], [38, 5]].forEach(p => { const r = M(new THREE.TorusGeometry(1.2, 0.12, 8, 28), clay(0xe8f7fa), p[0], 0.45, p[1], scene); r.rotation.x = -Math.PI / 2; r.castShadow = false; r.userData.ph = p[0]; ANIM.ripple.push(r); });
  [[-30, -1], [-10, 5], [16, 3], [32, 6.5]].forEach(p => { const l = M(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 18, 1, false, 0.4, 5.6), clay(0x6fb86a), p[0], 0.45, p[1], scene); l.castShadow = false; ball(0.25, 0xf2a5c0, p[0] + 0.3, 0.7, p[1], scene); });
  // bến nhà: sàn gỗ + cọc neo
  cyl(2.6, 2.9, 0.4, 0xb58a5a, HOME[0], -0.1, HOME[1]); box(1.4, 0.3, 2.6, 0x9a6a45, HOME[0] + 2.6, 0.3, HOME[1]); cyl(0.12, 0.12, 1.3, 0x7a5a3a, HOME[0] + 3.3, 0.3, HOME[1] - 1.1, scene, 8); cyl(0.12, 0.12, 1.3, 0x7a5a3a, HOME[0] + 3.3, 0.3, HOME[1] + 1.1, scene, 8);

  // sprite NPC
  const TL = new THREE.TextureLoader(), TEX = {};
  const src = u => { const im = typeof document !== 'undefined' && document.querySelector('img[data-bps-asset="' + u + '"]'); return im && im.src ? im.src : u; };
  const tex = url => TEX[url] || (TEX[url] = TL.load(src(url), t => { t.colorSpace = THREE.SRGBColorSpace; t.userData.ready = true; Object.values(N).forEach(n => n.url === url && fit(n)); }));
  const N = {};
  const fit = n => { const im = n.sp.material.map && n.sp.material.map.image; if (!im || !im.width) return; n.sp.scale.set(n.h * im.width / im.height, n.h, 1); };
  // Đội Demo Rồng Xanh (5 bạn) trên ghe mui neo gần bến nhà – như bps3d-v3.js
  const team5 = new THREE.Group(); team5.position.set(HOME[0] - 10, 0.1, HOME[1] - 6.8); scene.add(team5);
  const sTeam = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex('assets/character/phu-sa/doi-5-nguoi.png'), transparent: true, alphaTest: 0.4 })); sTeam.center.set(0.5, 0); sTeam.scale.set(8.6, 4.8, 1); team5.add(sTeam);
  const t5s = M(new THREE.CircleGeometry(3.4, 28), new THREE.MeshBasicMaterial({ color: 0x033337, transparent: true, opacity: 0.2 }), 0, 0.02, 0.4, team5); t5s.rotation.x = -Math.PI / 2; t5s.castShadow = false; t5s.scale.set(1, 0.4, 1);

  function mkLabel(n) { const b = document.createElement('div');
    Object.assign(b.style, { position: 'absolute', left: 0, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', pointerEvents: 'auto', cursor: 'pointer', whiteSpace: 'nowrap', font: "700 11px 'Be Vietnam Pro',sans-serif" });
    b.innerHTML = '<span data-t style="padding:3px 9px;border-radius:999px"></span><span data-e style="display:none;background:#fffaf0;color:#033337;font-size:11.5px;padding:4px 9px;border-radius:7px;box-shadow:0 4px 10px -4px rgba(0,0,0,.4)"><b style="display:inline-grid;place-items:center;width:17px;height:17px;border-radius:4px;background:#033337;color:#fff;font-size:10px;margin-right:6px">E</b>Nói chuyện</span>';
    b.addEventListener('pointerdown', e => { e.stopPropagation(); goTalk(n.id); }); labels.appendChild(b); return b; }
  function sync() {
    const seen = {};
    (props.npcs || []).forEach(d => { seen[d.id] = 1; let n = N[d.id];
      if (!n) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, alphaTest: 0.4, depthWrite: true })); sp.center.set(0.5, 0); scene.add(sp);
        const ring = M(new THREE.TorusGeometry(1.5, 0.12, 8, 32), new THREE.MeshBasicMaterial({ color: 0x00c4ff, transparent: true, opacity: 0 })); ring.rotation.x = -Math.PI / 2; ring.castShadow = false;
        n = N[d.id] = { id: d.id, sp, ring }; n.lab = mkLabel(n); }
      if (n.url !== d.img) { n.url = d.img; n.sp.material.map = tex(d.img); n.sp.material.needsUpdate = true; }
      n.h = d.h3 || 3.6; fit(n); n.sp.position.set(d.x3, 0.5, d.z3); n.ring.position.set(d.x3, 0.62, d.z3);
      const t = n.lab.querySelector('[data-t]'); t.textContent = d.tag; t.style.background = d.tagBg; t.style.color = d.tagFg; });
    Object.keys(N).forEach(id => { if (!seen[id]) { scene.remove(N[id].sp); scene.remove(N[id].ring); N[id].lab.remove(); delete N[id]; } });
  }

  // ghe người chơi
  const me = new THREE.Group(); scene.add(me);
  const hull = new THREE.Group(); me.add(hull);
  const shadow = M(new THREE.CircleGeometry(2.6, 24), new THREE.MeshBasicMaterial({ color: 0x033337, transparent: true, opacity: 0.22 }), 0, 0.12, 0.3, hull); shadow.rotation.x = -Math.PI / 2; shadow.castShadow = false; shadow.scale.set(1, 0.45, 1);
  const meSp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex('assets/character/phu-sa/doi-phu-sa-ghe-v7.png'), transparent: true, alphaTest: 0.4 })); meSp.center.set(0.5, 0); meSp.scale.set(6.4, 3.96, 1); meSp.position.y = 0.15; me.add(meSp);
  const me3 = new THREE.Group(); me3.visible = false; me3.scale.setScalar(1.15); hull.add(me3);
  const team3 = new THREE.Group(); team3.visible = false; team3.scale.setScalar(0.95); team3.rotation.y = 0.5;
  MODELS.then(m => { if (!m) return; const { M: MM } = m;
    const boat = m.bo.buildBoat(THREE, MM), h = m.hu.buildHuong(THREE, MM), t = m.tu.buildTu(THREE, MM); h.scale.setScalar(1.3); t.scale.setScalar(1.3); me3.add(boat, h, t);
    team3.add(m.gm.buildGheMui(THREE, MM), m.cg.buildCargo(THREE, MM), m.tm.buildTeam(THREE, MM)); team5.add(team3);
    [me3, team3].forEach(g => g.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }));
    applyMode(); });
  let use3d = !!init.models3d;
  function applyMode() { const on = use3d && me3.children.length > 0; me3.visible = on; meSp.visible = !on; shadow.visible = !on; team3.visible = on; sTeam.visible = !on; }
  const pos = new THREE.Vector3(HOME[0] + 6, 0.1, HOME[1] + 3); me.position.copy(pos);
  const meLab = document.createElement('div'); Object.assign(meLab.style, { position: 'absolute', left: 0, top: 0, background: '#fda127', color: '#033337', font: "800 11px 'Be Vietnam Pro',sans-serif", padding: '3px 9px', borderRadius: '999px', whiteSpace: 'nowrap' });
  meLab.textContent = 'Ghe của bạn'; labels.appendChild(meLab);
  const ambient = !!init.ambient; if (ambient) { me.visible = false; meLab.style.display = 'none'; }

  // điều khiển
  const keys = {}; let target = null, then = null, nearId = null, jx = 0, jz = 0;
  const MVK = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
  const kd = e => { if (/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '')) return; const k = (e.key || '').toLowerCase();
    if (MVK.includes(k) && !props.paused) { keys[k] = true; e.preventDefault(); }
    if (k === 'e' && nearId && !props.paused) props.onTalk(nearId); if (k === 'escape' && props.paused) props.onClose(); };
  const ku = e => { keys[(e.key || '').toLowerCase()] = false; };
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  function goTalk(id) { if (props.paused) return; if (id === nearId) { props.onTalk(id); return; } const n = N[id]; if (!n) return;
    const p = n.sp.position; target = new THREE.Vector3(p.x + (pos.x < p.x ? -3 : 3), 0.1, p.z + 2.5); then = () => props.onTalk(id); }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.1), hit = new THREE.Vector3();
  renderer.domElement.addEventListener('pointerdown', e => { if (props.paused) return; const r = renderer.domElement.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, camera);
    const hs = ray.intersectObjects(Object.values(N).map(n => n.sp)); if (hs.length) { const n = Object.values(N).find(n => n.sp === hs[0].object); if (n) { goTalk(n.id); return; } }
    if (ray.ray.intersectPlane(plane, hit)) { target = hit.clone(); then = null; } });
  const joy = document.createElement('div'); Object.assign(joy.style, { position: 'absolute', left: '16px', bottom: '16px', width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(3,51,55,.5)', boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.35)', display: 'grid', placeItems: 'center', touchAction: 'none', cursor: 'grab', zIndex: 3 });
  const knob = document.createElement('span'); Object.assign(knob.style, { width: '40px', height: '40px', borderRadius: '50%', background: '#fffaf0', boxShadow: '0 4px 10px rgba(0,0,0,.35)', pointerEvents: 'none' }); joy.appendChild(knob); el.appendChild(joy);
  joy.addEventListener('pointerdown', e => { e.stopPropagation(); const r = joy.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width / 2;
    const mv = ev => { let dx = (ev.clientX - cx) / R, dy = (ev.clientY - cy) / R; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; } jx = dx; jz = dy; knob.style.transform = 'translate(' + dx * 28 + 'px,' + dy * 28 + 'px)'; };
    const up = () => { jx = jz = 0; knob.style.transform = ''; removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
    mv(e); addEventListener('pointermove', mv); addEventListener('pointerup', up); });

  const v3 = new THREE.Vector3(), camPos = new THREE.Vector3(), look = new THREE.Vector3();
  const place = (elm, x, y, z, below) => { v3.set(x, y, z).project(camera); const vis = v3.z < 1;
    elm.style.display = vis ? 'flex' : 'none'; elm.style.transform = 'translate(-50%,' + (below ? '6px' : '-100%') + ') translate(' + ((v3.x + 1) / 2 * W()).toFixed(1) + 'px,' + ((1 - v3.y) / 2 * H()).toFixed(1) + 'px)'; };
  // hiệu ứng cập bến: vòng sóng lan + tiếng chuông gỗ nhẹ (WebAudio, không cần file)
  const WAKE = []; for (let k = 0; k < 6; k++) { const r = M(new THREE.TorusGeometry(1, 0.08, 6, 28), new THREE.MeshBasicMaterial({ color: 0xe8f7fa, transparent: true, opacity: 0 }), 0, 0.3, 0); r.rotation.x = -Math.PI / 2; r.castShadow = false; r.userData.t = 9; WAKE.push(r); }
  let wakeAcc = 0; const ripple = (x, z, big) => { const r = WAKE.find(w => w.userData.t >= 1) || WAKE[0]; r.position.set(x, 0.3, z); r.userData.t = 0; r.userData.big = big ? 2.4 : 1; };
  let muted = localStorage.getItem('bps3d-npc-muted') === '1';
  let AC = null; const chime = () => { if (muted) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); const t0 = AC.currentTime;
    [[523, 0], [659, 0.09], [784, 0.18]].forEach(([f, d]) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, t0 + d); g.gain.linearRampToValueAtTime(0.12, t0 + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.5); o.connect(g).connect(AC.destination); o.start(t0 + d); o.stop(t0 + d + 0.55); }); } catch (e) {} };

  // thanh gợi ý điều khiển + nút tắt chuông cập bến / toàn màn hình, góc trên-trái
  const EN = () => localStorage.getItem('bizon-lang') === 'en';
  const ctlBar = document.createElement('div'); Object.assign(ctlBar.style, { position: 'absolute', left: '10px', top: '10px', zIndex: 4, display: 'flex', alignItems: 'center', gap: '6px' });
  const pill = (txt, title) => { const b = document.createElement('button'); b.type = 'button'; if (title) b.title = title;
    Object.assign(b.style, { border: 0, background: 'rgba(3,51,55,.85)', color: '#fff', fontSize: '12px', height: '26px', padding: '0 10px', borderRadius: '999px', cursor: 'pointer' }); b.textContent = txt; return b; };
  const muteBtn = pill(muted ? '🔇' : '🔊', EN() ? 'Mute dock-arrival chime' : 'Tắt chuông cập bến');
  muteBtn.onclick = () => { muted = !muted; localStorage.setItem('bps3d-npc-muted', muted ? '1' : '0'); muteBtn.textContent = muted ? '🔇' : '🔊'; };
  const fullBtn = pill('⛶', EN() ? 'Fullscreen' : 'Toàn màn hình');
  fullBtn.onclick = () => { try { if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); } catch (e) {} };
  const hintSpan = document.createElement('span'); Object.assign(hintSpan.style, { pointerEvents: 'none', background: 'rgba(3,51,55,.85)', color: '#fff', fontSize: '11px', padding: '5px 10px', borderRadius: '999px', whiteSpace: 'nowrap' });
  hintSpan.textContent = EN() ? 'WASD / joystick / tap the water · near an NPC press E' : 'WASD / joystick / bấm nước · gần NPC bấm E';
  ctlBar.append(muteBtn, fullBtn, hintSpan); el.appendChild(ctlBar);
  let lastNear = null;
  let last = performance.now(), raf, first = true;
  function loop(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!props.paused) { let vx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0) + jx, vz = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0) + jz;
      if (vx || vz) target = null; else if (target) { const dx = target.x - pos.x, dz = target.z - pos.z, d = Math.hypot(dx, dz); if (d < 0.4) { target = null; const f = then; then = null; if (f) { ripple(pos.x, pos.z + 0.6, true); chime(); f(); } } else { vx = dx / d; vz = dz / d; } }
      const m = Math.hypot(vx, vz); if (m > 0) { wakeAcc += dt; if (wakeAcc > 0.28) { wakeAcc = 0; ripple(pos.x, pos.z + 0.6, false); } const k = Math.max(1, m), sp = 11 * dt; pos.x += vx / k * sp; pos.z += vz / k * sp; const r = Math.hypot(pos.x, pos.z); if (r > 40) { pos.x *= 40 / r; pos.z *= 40 / r; }
        if (Math.abs(vx) > 0.2) meSp.material.map.repeat.x = vx > 0 ? -1 : 1, meSp.material.map.offset.x = vx > 0 ? 1 : 0; me3.rotation.y = Math.atan2(-vz, vx); } }
    else { for (const k in keys) keys[k] = false; }
    me.position.set(pos.x, 0.1 + Math.sin(now / 500) * 0.06, pos.z);
    let best = null, bd = 1e9; Object.values(N).forEach(n => { const d = Math.hypot(n.sp.position.x - pos.x, n.sp.position.z - pos.z); if (d < bd) { bd = d; best = n.id; } });
    nearId = bd < 4.6 ? best : null; if (nearId && nearId !== lastNear && !target) ripple(pos.x, pos.z + 0.6, true); lastNear = nearId;
    Object.values(N).forEach(n => { const on = n.id === nearId; n.ring.material.opacity = on ? 0.9 : 0; n.sp.position.y = 0.5 + (on ? Math.abs(Math.sin(now / 260)) * 0.15 : 0);
      n.lab.querySelector('[data-e]').style.display = on && !props.paused ? 'inline-block' : 'none'; n.lab.style.zIndex = on ? 5 : 1; });
    meLab.style.visibility = nearId || ambient ? 'hidden' : 'visible';
    // xếp nhãn trong không gian màn hình: chiếu chân từng NPC, rồi đẩy nhãn chồng nhau xuống dưới cho tới khi không còn đè
    const items = Object.values(N).map(n => ({ el: n.lab, x: n.sp.position.x, y: 0.5, z: n.sp.position.z }));
    if (!nearId && !ambient) items.push({ el: meLab, x: pos.x, y: 0.2, z: pos.z + 0.8 });
    const placed = [];
    items.forEach(it => { v3.set(it.x, it.y, it.z).project(camera); it.vis = v3.z < 1; it.px = (v3.x + 1) / 2 * W(); it.py = (1 - v3.y) / 2 * H() + 6;
      it.w = it.el.offsetWidth || 90; it.h = Math.min(it.el.offsetHeight || 22, 24); });
    items.sort((a, b) => a.py - b.py || a.px - b.px).forEach(it => { if (!it.vis) { it.el.style.display = 'none'; return; }
      let y = it.py, moved = true, guard = 0; const L = it.px - it.w / 2, Rr = it.px + it.w / 2;
      while (moved && guard++ < 12) { moved = false; for (const q of placed) { if (L < q.r + 4 && Rr > q.l - 4 && y < q.b + 2 && y + it.h > q.t - 2) { y = q.b + 3; moved = true; } } }
      placed.push({ l: L, r: Rr, t: y, b: y + it.h });
      it.el.style.display = 'flex'; it.el.style.transform = 'translate(' + (it.px - it.w / 2).toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; });
    if (ambient) { const a = now / 14000; camPos.set(Math.sin(a) * 30, 26, Math.cos(a) * 30 + 10); look.set(0, 0, 0); joy.style.display = 'none'; }
    else { camPos.set(pos.x * 0.6, 30, pos.z * 0.6 + 34); look.set(pos.x * 0.8, 0, pos.z * 0.8 - 2); }
    if (first) { camera.position.copy(camPos); first = false; } else camera.position.lerp(camPos, Math.min(1, dt * 3)); camera.lookAt(look);
    water.position.y = 0.05 + Math.sin(now / 900) * 0.03; team5.position.y = 0.1 + Math.sin(now / 1300) * 0.06; sTeam.material.rotation = Math.sin(now / 1700) * 0.015; team3.rotation.z = Math.sin(now / 1700) * 0.015;
    const t = now / 1000;
    WAKE.forEach(w => { if (w.userData.t >= 1) { w.material.opacity = 0; return; } w.userData.t += dt / (w.userData.big > 1 ? 1.4 : 0.9); const s = 0.6 + w.userData.t * 2.2 * w.userData.big; w.scale.set(s, s, 1); w.material.opacity = (1 - w.userData.t) * 0.9; });
    ANIM.bob.forEach(o => { o.position.y = o.userData.y0 + Math.sin(t * 1.6 + o.userData.bob) * 0.08; o.rotation.z = Math.sin(t * 1.2 + o.userData.bob) * 0.04; });
    ANIM.smoke.forEach(o => { const k = o.userData.smoke, ph = (t * 0.35 + k * 0.33) % 1; o.position.y = o.userData.y0 - k + ph * 4; o.position.x = 2.4 + Math.sin(t + k) * 0.4; const s = 0.6 + ph * 0.9; o.scale.set(s, s * 0.85, s); o.material.transparent = true; o.material.opacity = 0.85 * (1 - ph); });
    ANIM.lantern.forEach((o, k) => { o.material.emissiveIntensity = 0.5 + Math.sin(t * 3 + k * 1.7) * 0.35; });
    ANIM.cloud.forEach((g, k) => { g.position.x = g.userData.x0 + Math.sin(t * 0.05 + k) * 6; });
    ANIM.ripple.forEach(r => { const ph = (t * 0.5 + r.userData.ph) % 1; const s = 0.5 + ph * 1.4; r.scale.set(s, s, 1); r.material.transparent = true; r.material.opacity = 1 - ph; });
    ANIM.boats.forEach(b => { const u = b.userData; u.x += u.dir * u.sp * dt; if (u.x > 46) u.x = -46; if (u.x < -46) u.x = 46; const z = riverY(u.x); b.position.set(u.x, 0.25 + Math.sin(t * 2 + u.x) * 0.05, z); b.rotation.y = Math.atan2(-(riverY(u.x + 1) - z), 1) + (u.dir < 0 ? Math.PI : 0); b.rotation.z = Math.sin(t * 1.5 + u.x) * 0.03; });
    ANIM.ducks.forEach(d => { const u = d.userData; u.a += dt * 0.5; d.position.set(u.cx + Math.cos(u.a) * u.r, 0.25 + Math.sin(t * 3 + u.cx) * 0.03, u.cz + Math.sin(u.a) * u.r * 0.6); d.rotation.y = -u.a - Math.PI / 2; });
    ANIM.birds.forEach(f => { const u = f.userData, a = t * 0.25 + u.ph; f.position.set(Math.cos(a) * u.r, u.h + Math.sin(t * 2 + u.ph) * 0.4, Math.sin(a) * u.r * 0.7); f.rotation.y = -a; const fl = Math.sin(t * 9 + u.ph) * 0.6; u.w1.rotation.z = fl; u.w2.rotation.z = -fl; });
    renderer.render(scene, camera); raf = requestAnimationFrame(loop); }
  const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); }); ro.observe(el);
  sync(); raf = requestAnimationFrame(loop);
  return {
    update(p) { props = p; sync(); const u = !!p.models3d; if (u !== use3d) { use3d = u; applyMode(); } },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', kd); removeEventListener('keyup', ku); renderer.dispose(); el.innerHTML = ''; }
  };
}
