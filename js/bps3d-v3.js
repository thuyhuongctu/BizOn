/* Bến Phù Sa 3D – cảnh sông nước đất sét (three.js). Chỉ hiển thị + chọn địa điểm; luật chơi giữ nguyên trong ben-phu-sa-3d.html.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const G = () => window.__bps;
const EN = () => { try { return localStorage.getItem('bizon-lang') === 'en' || document.documentElement.lang === 'en'; } catch (e) { return false; } };
const T = (vi, en) => EN() ? en : vi;
const host = document.getElementById('bps3d');
const labels = document.getElementById('bps3d-labels');
const W0 = () => host.clientWidth, H0 = () => host.clientHeight;

const LOW = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || (navigator.hardwareConcurrency || 8) <= 4 || Math.min(screen.width, screen.height) < 700;
const renderer = new THREE.WebGLRenderer({ antialias: !LOW, powerPreference: 'high-performance' });
renderer.setPixelRatio(LOW ? 1 : Math.min(2, devicePixelRatio));
renderer.setSize(W0(), H0());
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
host.prepend(renderer.domElement);
renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, W0() / H0(), 0.1, 400);
camera.position.set(0, 46, 58);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, -3); controls.enableDamping = true; controls.maxPolarAngle = 1.2; controls.minDistance = 22; controls.maxDistance = 100; controls.enablePan = false;

const hemi = new THREE.HemisphereLight(0xfff1dc, 0x9bbf9a, 0.95); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d8, 2.2); sun.position.set(-26, 44, 22); sun.castShadow = true;
sun.shadow.mapSize.set(LOW ? 1024 : 2048, LOW ? 1024 : 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.06;
Object.assign(sun.shadow.camera, { left: -52, right: 52, top: 52, bottom: -52, far: 140 }); scene.add(sun);
const fill = new THREE.DirectionalLight(0xbcd8ff, 0.45); fill.position.set(30, 18, -30); scene.add(fill);

// vân tay đất sét: bump map nhiễu mềm dùng chung
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

// bàn đất nặn + đảo + sông
const table = M(new THREE.CylinderGeometry(90, 90, 1, 64), clay(0xf1dfc2), 0, -5.2, 0); table.castShadow = false;
M(new THREE.CylinderGeometry(45, 43, 4.4, 80), clay(0xc98b5a), 0, -2.4, 0).castShadow = false;
M(new THREE.CylinderGeometry(44.2, 45.2, 1.2, 80), clay(0xa7d690), 0, -0.6, 0).castShadow = false;
for (let k = 0; k < 44; k++) { const a = k / 44 * Math.PI * 2; blob(1.3 + (k % 3) * 0.3, k % 2 ? 0x98cc80 : 0xb3dd98, Math.cos(a) * 44.4, -0.2, Math.sin(a) * 44.4, scene, 1.2, 0.55, 1.2); }
for (let k = 0; k < 22; k++) { const a = k / 22 * Math.PI * 2 + 0.2; blob(0.9, 0xb49c86, Math.cos(a) * 45.6, -3.2, Math.sin(a) * 45.6, scene, 1.3, 0.7, 1); }
const river = new THREE.Shape(); river.moveTo(-50, -6);
river.bezierCurveTo(-25, -12, -12, 6, 4, 2); river.bezierCurveTo(18, -2, 30, 10, 50, 6);
river.lineTo(50, 14); river.bezierCurveTo(30, 18, 18, 6, 4, 10); river.bezierCurveTo(-14, 14, -24, -4, -50, 2); river.closePath();
const water = M(new THREE.ExtrudeGeometry(river, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.6, bevelSegments: 4 }), clay(0x69c3d3, { roughness: 0.35, sheen: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.4 }), 0, 0.05, 0);
water.rotation.x = -Math.PI / 2; water.position.z = -4; water.castShadow = false; water.scale.set(0.9, 0.9, 1);
const ripples = [];
[[-34, -3], [-14, 3.5], [8, 2], [22, 4.5], [38, 5]].forEach((p, k) => { const r = M(new THREE.TorusGeometry(1.2, 0.12, 8, 28), clay(0xe8f7fa), p[0], 0.45, p[1], scene); r.rotation.x = -Math.PI / 2; r.castShadow = false; r.userData.ph = k; ripples.push(r); });
[[-30, -1], [-10, 5], [16, 3], [32, 6.5]].forEach(p => { const l = M(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 18, 1, false, 0.4, 5.6), clay(0x6fb86a), p[0], 0.45, p[1], scene); l.castShadow = false; ball(0.25, 0xf2a5c0, p[0] + 0.3, 0.7, p[1], scene); });

// 6 địa điểm: [x, z]
const P = [[-26, -8], [-4, -2], [-20, 16], [12, 16], [30, -16], [24, 4], [-5, 25], [6, -23]];
const spots = [];
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
P.forEach((p, i) => {
  const g = new THREE.Group(); g.position.set(p[0], 0, p[1]); scene.add(g); build(i, g);
  const pad = M(new THREE.CylinderGeometry(5.4, 5.4, 0.12, 40), new THREE.MeshStandardMaterial({ color: 0xfda127, transparent: true, opacity: 0, roughness: 1 }), 0, 0.06, 0, g); pad.castShadow = false; pad.userData.loc = i;
  const hit = M(new THREE.CylinderGeometry(5.5, 5.5, 6, 20), new THREE.MeshBasicMaterial({ visible: false }), 0, 3, 0, g); hit.userData.loc = i;
  const crowd = new THREE.Group(); g.add(crowd);
  const cloud = new THREE.Group(); [[0, 0], [1.3, 0.3], [-1.2, 0.2], [0.4, 0.7]].forEach(c => blob(1.2, 0x9aa7b4, c[0], 8 + c[1], 0, cloud, 1, 0.8, 1)); cloud.visible = false; g.add(cloud);
  const drops = []; for (let k = 0; k < 24; k++) { const d = M(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 4), clay(0x9fd3ff), (Math.random() - 0.5) * 5, Math.random() * 8, (Math.random() - 0.5) * 3, cloud); d.castShadow = false; drops.push(d); }
  const lab = document.createElement('button'); lab.type = 'button'; lab.className = 'bps3d-lab'; labels.appendChild(lab);
  lab.onclick = () => pick(i);
  spots.push({ g, pad, hit, crowd, cloud, drops, lab });
});
// cảnh quê: cây, dừa, nhà sàn ven sông, mây đất sét
[[-38, 20], [-34, 27], [38, 20], [36, -28], [-14, 33], [6, 34], [-40, -20], [-6, -33], [18, -30], [42, -6], [-30, 32], [28, 28]].forEach((p, k) => (k % 2 ? palm : tree)(p[0], p[1], scene, 1 + (k % 3) * 0.18));
[[-40, -8], [-16, 9.5], [14, 11.5], [40, -1]].forEach(p => stilt(p[0], p[1], scene));
[[-12, -24], [8, -22], [-36, 8]].forEach(p => house(p[0], p[1], scene, 0xfbf1dc, 0xe07a5f, 0.9));
const skyClouds = []; [[-30, 22, -30], [10, 26, -36], [34, 20, -22]].forEach(c => { const g = new THREE.Group(); [[0, 0, 2.4], [2.4, 0.4, 1.8], [-2.2, 0.2, 1.9], [0.6, 1.4, 1.7]].forEach(q => blob(q[2], 0xffffff, q[0], q[1], 0, g, 1, 0.8, 0.9)); g.position.set(c[0], c[1], c[2]); g.traverse(o => { o.castShadow = false; }); scene.add(g); skyClouds.push(g); });
// người + thuyền
const person = (c, p) => { const g = new THREE.Group(); M(new THREE.CapsuleGeometry(0.42, 0.55, 6, 14), clay(c), 0, 0.7, 0, g); ball(0.4, 0xf1c9a5, 0, 1.62, 0, g); const hat = M(new THREE.ConeGeometry(0.62, 0.34, 18), clay(0xf3dca0), 0, 2.05, 0, g); p.add(g); return g; };
function boatEyes(g, x, hw, s = 1) {
  // mắt ghe – nét trang trí truyền thống ghe thuyền miền Tây, xua đuổi tà ma trên sông
  [1, -1].forEach(k => { const e = new THREE.Group(); e.position.set(x, 0.32 * s, k * hw); e.rotation.x = Math.PI / 2; e.scale.setScalar(s); g.add(e);
    M(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 16), clay(0xf4efe4), 0, 0, 0, e);
    M(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 16), clay(0xd9473a), 0, 0, 0.006, e);
    M(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), clay(0x262626), 0, 0, 0.012, e); });
}
const GOODS_G = [0xf5c542, 0xe86a5a, 0x7bc46a, 0xf08a24, 0xfbf1dc];
function vessel(kind, color) {
  const g = new THREE.Group();
  if (kind === 0) { box(3.2, 0.6, 1.2, color, 0, 0, 0, g); cyl(0.07, 0.07, 3, 0x7a5a3a, 0, 0.6, 0, g); const s = M(new THREE.ConeGeometry(1, 2.2, 3), clay(0xf4efe4), 0.4, 2.4, 0, g); s.rotation.z = -0.1; boatEyes(g, 1.15, 0.62); }
  else if (kind === 1) {
    // gánh hàng rong: người đội nón lá, áo bà ba, đòn gánh tre cong trên vai, hai thúng hàng treo dây
    const p = new THREE.Group(); g.add(p);
    [-0.16, 0.16].forEach(z => cyl(0.13, 0.15, 0.75, 0x2b2b30, 0, 0, z, p, 12));
    M(new THREE.CapsuleGeometry(0.4, 0.5, 6, 16), clay(color), 0, 1.15, 0, p);
    ball(0.36, 0xf1c9a5, 0, 1.95, 0, p); blob(0.3, 0x2a2420, 0, 2.02, -0.12, p, 1.1, 0.9, 1);
    M(new THREE.ConeGeometry(0.78, 0.42, 24), clay(0xf3dca0), 0, 2.38, 0, p);
    [-1, 1].forEach(sx => { const a = M(new THREE.CapsuleGeometry(0.1, 0.45, 4, 10), clay(color), sx * 0.32, 1.5, 0.18, p); a.rotation.x = -0.9; });
    M(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-1.45, 1.46, 0), new THREE.Vector3(0, 1.78, 0), new THREE.Vector3(1.45, 1.46, 0)), 24, 0.06, 8), clay(0xd9b56a), 0, 0, 0, g);
    [-1.3, 1.3].forEach(x => {
      [[-0.3, 0], [0.3, 0], [0, -0.3], [0, 0.3]].forEach(([dx, dz]) => { const r = M(new THREE.CylinderGeometry(0.015, 0.015, 0.75, 6), clay(0x5a4632), x + dx * 0.5, 1.1, dz * 0.5, g); r.rotation.z = -dx * 0.55; r.rotation.x = dz * 0.55; });
      const b = M(new THREE.CylinderGeometry(0.5, 0.36, 0.42, 20, 1, true), clay(0xc99a5a), x, 0.55, 0, g); b.material.side = THREE.DoubleSide;
      M(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 20), clay(0xb8844a), x, 0.36, 0, g);
      for (let k = 0; k < 5; k++) ball(0.15, GOODS_G[(k + (x > 0 ? 2 : 0)) % GOODS_G.length], x + Math.cos(k * 1.3) * 0.22, 0.78, Math.sin(k * 1.3) * 0.22, g);
    });
  }
  else { person(color, g); box(0.6, 0.8, 0.1, 0xf4efe4, 0.5, 0.9, 0.3, g); }
  scene.add(g); return g;
}
const TL = new THREE.TextureLoader();
function sprite(url, h, y) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, alphaTest: 0.5 })); s.visible = false; s.position.y = y;
  TL.load(url, tx => { tx.colorSpace = THREE.SRGBColorSpace; tx.generateMipmaps = false; tx.minFilter = THREE.LinearFilter; tx.magFilter = THREE.LinearFilter; s.material.map = tx; s.material.needsUpdate = true; const a = tx.image.width / tx.image.height; s.scale.set(h * a, h, 1); s.visible = true; }); return s; }
// Tú Phan & cô Lumina đứng ở bến nhà
const dock = new THREE.Group(); dock.position.set(-4, 0, 7.5); scene.add(dock);
box(4.4, 0.35, 2, 0xb58a5a, 0, 0, 0, dock);
box(0.4, 0.42, 0.4, 0x5a4632, 1.85, 0.35, -0.75, dock); lantern(1.85, 1.08, -0.75, dock); // đôn gỗ + đèn dầu bên bến
const sDuo = new THREE.Group(); sDuo.position.set(0.2, 0.35, 0.2); dock.add(sDuo); // Lumina & Tú Phan đứng ở bến nhà
{ const h = sprite('assets/character/phu-sa/huong-new.png?v=7', 2.6, 1.3); h.position.x = -0.8; const tu = sprite('assets/character/phu-sa/tu-new.png?v=5', 2.9, 1.45); tu.position.x = 0.8; sDuo.add(h, tu); }
function duoOnBoat(v) { const h = sprite('assets/character/phu-sa/huong-new.png?v=7', 2.2, 1.7); h.position.set(-0.55, 0, 0.1); const tu = sprite('assets/character/phu-sa/tu-new.png?v=5', 2.45, 1.82); tu.position.set(0.6, 0, -0.1); v.add(h, tu); }
// Đội Demo Rồng Xanh (5 bạn) trên ghe mui neo gần bến
const team5 = new THREE.Group(); team5.position.set(-14, 0.1, 3.2); scene.add(team5);
const sTeam = sprite('assets/character/phu-sa/doi-phu-sa-ghe-v2.png', 4.8, 2.0); team5.add(sTeam);
M(new THREE.CylinderGeometry(3.2, 3.2, 0.05, 32), new THREE.MeshBasicMaterial({ color: 0x3f8f9c, transparent: true, opacity: 0.25 }), 0, 0.02, 0, team5).castShadow = false;
const RIMG = ['assets/character/rivals/ba-le-full.png', 'assets/character/rivals/chu-sau-full.png', 'assets/character/rivals/co-bay-full.png'];
const RC = [0x7a7f8a, 0x9a8a78, 0x3f8a44];
const rivals = RC.map((c, k) => { const v = vessel(0, c); v.add(sprite(RIMG[k], 3.4, 3.4)); v.position.set(-40 + k * 3, 0, 34); v.visible = false; v.userData.home = v.position.clone(); return v; });
let me = null, meKind = -1;
const HOME = new THREE.Vector3(-4, 0.1, 10);

// ---- trạng thái ----
let stormAt = -1, sel = null, week = 0, night = 0, nightT = 0, anim = [];
const TOD = [[0xfff0d8, 2.1, 0xcfeaf2], [0xffffff, 2.3, 0xbfe3ef], [0xffe0b0, 1.9, 0xf7d6b0], [0xffa878, 1.3, 0xf0b3a0], [0x9fb0ff, 0.55, 0x2a3558]];
const TODN = [['Sáng sớm', 'Early morning'], ['Trưa', 'Midday'], ['Chiều', 'Afternoon'], ['Hoàng hôn', 'Sunset'], ['Đêm', 'Night']];
function setWeek(w) {
  week = Math.max(0, Math.min(4, w)); const t = TOD[week];
  sun.color.set(t[0]); sun.intensity = t[1]; scene.background = new THREE.Color(t[2]); scene.fog = new THREE.Fog(t[2], 70, 160);
  hemi.intensity = week === 4 ? 0.45 : 1.1; nightT = week >= 3 ? (week === 4 ? 1 : 0.5) : 0;
  const tl = document.getElementById('bps3d-tod'); if (tl) tl.textContent = T('Tuần ', 'Week ') + (week + 1) + '/5 · ' + T(TODN[week][0], TODN[week][1]);
  const dt = document.getElementById('bps3d-dots'); if (dt) dt.textContent = [0, 1, 2, 3, 4].map(k => k < week ? '●' : k === week ? '◉' : '○').join('');
  coach();
  const g = G(); if (!g) return;
  const wk = g.W[week], lo = wk.indexOf(Math.min.apply(null, wk)); stormAt = wk[lo] < 0.9 ? lo : -1;
  spots.forEach((s, i) => {
    const w0 = g.W[week][i];
    s.cloud.visible = i === stormAt;
    while (s.crowd.children.length) s.crowd.remove(s.crowd.children[0]);
    const n = Math.round((w0 - 0.75) * 16);
    for (let k = 0; k < n; k++) { const a = k * 2.4, r = 3 + (k % 3) * 0.9; const pp = person([0xe8762d, 0x006687, 0xf2c14e, 0xc0446a, 0x6fbf73][k % 5], s.crowd); pp.scale.setScalar(0.6); pp.position.set(Math.cos(a) * r, 0.1, Math.sin(a) * r); pp.userData.jig = k; }
  });
  labelsText();
}
function coach() {
  const c = document.getElementById('bps3d-coach'), g = G(); if (!c || !g) return;
  if (typeof exploreMode !== 'undefined' && exploreMode) { c.style.display = 'none'; return; }
  const s = g.S.sel; if (week > 0 || (s.m !== null && s.menu !== null && s.loc !== null)) { c.style.display = 'none'; return; }
  const step = s.m === null ? 1 : s.menu === null ? 2 : 3;
  c.style.display = 'block';
  c.innerHTML = [T('① Chọn phương thức', '① Pick a method'), T('② Chọn món hàng', '② Pick a product'), T('③ Bấm một điểm trên bản đồ', '③ Tap a spot on the map')].map((x, k) => k + 1 === step ? '<b>' + x + ' ←</b>' : k + 1 < step ? '<s style="opacity:.6">' + x + '</s>' : '<span style="opacity:.7">' + x + '</span>').join(' &nbsp; ') + '<br><span style="font-weight:600">' + T('👥 Nhiều người = đông khách tuần này. Nhu cầu thật của từng món vẫn phải tự khám phá.', '👥 More people = more foot traffic this week. True demand per product must still be discovered.') + '</span>';
}
function labelsText() {
  const g = G(); if (!g) return;
  spots.forEach((s, i) => { const L = g.LOCS[i], w0 = g.W[week][i]; const known = Object.keys(g.S.knownPairs || {}).some(k => +k.split('-')[1] === i); s.lab.innerHTML = '<b>' + L[0] + ' ' + T(L[1], L[3]) + (known ? ' 📒' : '') + '</b><small>' + T(L[2], L[4]) + (i === stormAt ? ' · 🌧️ ' + T('mưa bão', 'storm') : w0 >= 1.1 ? ' · 🔥 ' + T('đông', 'busy') : '') + '</small>'; s.lab.classList.toggle('on', sel === i); });
}
function pick(i) { if (exploreMode) return; const g = G(); if (!g) return; if (typeof window.ftPick === 'function') window.ftPick('loc', i); }
let camGoal = null, follow = null;
function highlight(i) { sel = i; spots.forEach((s, k) => { s.pad.material.opacity = k === i ? 0.55 : 0; }); labelsText(); coach(); camGoal = i == null ? new THREE.Vector3(0, 0, -3) : new THREE.Vector3(P[i][0] * 0.35, 0, P[i][1] * 0.35 - 2); }
function showRivals(prevWeek) {
  const g = G(); if (!g) return;
  rivals.forEach((v, k) => { const r = g.RIVALS[k]; if (!r.plan || prevWeek < 0) { v.visible = false; return; } const loc = r.plan[prevWeek]; const p = P[loc]; v.visible = true; tween(v, new THREE.Vector3(p[0] + 3 * Math.cos(k * 2.1 + 1), 0.1, p[1] + 3 * Math.sin(k * 2.1 + 1)), 1400); });
}
function tween(obj, to, ms, done) { anim.push({ obj, from: obj.position.clone(), to, t0: performance.now(), ms, done }); }
function sendMe(m, loc, done) {
  if (me && meKind !== m) { scene.remove(me); me = null; }
  if (!me) { me = vessel(m, 0xfda127); if (m === 0) { const isTeam5 = (G() && G().S.team === 0); if (isTeam5) me.add(sprite('assets/character/phu-sa/doi-phu-sa-ghe-v2.png', 4.2, 2.0)); else duoOnBoat(me); (isTeam5 ? sTeam : sDuo).visible = false; setTimeout(() => { (isTeam5 ? sTeam : sDuo).visible = false; }, 400); } me.scale.setScalar(1.25); me.position.copy(HOME); meKind = m; }
  const p = P[loc], to = m === 2 ? new THREE.Vector3(p[0] - 2, 0.1, p[1] + 4.5) : new THREE.Vector3(p[0] - 1.5, 0.1, p[1] + 4.2);
  me.lookAt(to.x, me.position.y, to.z); follow = me; tween(me, to, 1600, () => { setTimeout(() => { follow = null; camGoal = new THREE.Vector3(0, 0, -3); }, 1400); if (done) done(); });
}

// ---- Chế độ khám phá: Chợ nổi Phù Sa (thị trấn hư cấu, lấy cảm hứng từ văn hoá chợ nổi
// miền Tây nói chung) – tham quan văn hoá, tách biệt hoàn toàn khỏi luật chơi kinh doanh. ----
let exploreMode = false;
const EXPLORE = [
  { p: [-42, -9], t: ['Chợ nổi Phù Sa là gì?', 'What is Phù Sa floating market?'], d: ['Chợ nổi Phù Sa nằm trên dòng sông chảy qua thị trấn Bến Phù Sa – nơi thương hồ tụ họp mua bán nông sản trên ghe thuyền từ bao đời nay, khi kênh rạch từng là tuyến giao thương chính của miền Tây.', "Phù Sa floating market sits on the river running through the town of Bến Phù Sa – where river traders have gathered to buy and sell produce from their boats for generations, back when canals were the Mekong Delta's main trade routes."] },
  { p: [-28, -5], t: ['Nếp sống trên sông', 'A river way of life'], d: ['Chợ nổi là nét văn hoá đặc trưng của miền sông nước Cửu Long – một nếp sống buôn bán trên ghe thuyền đã gắn bó với người dân nơi đây qua nhiều thế hệ, trở thành một phần bản sắc của miền Tây.', "Floating markets are a hallmark of life along the Mekong – a tradition of trading from boats that has shaped this region's identity for generations."] },
  { p: [-14, -1], t: ['Cây bẹo là gì?', 'What is a "cây bẹo"?'], d: ['«Cây bẹo» là sào tre cắm trên ghe để treo mẫu hàng lên cao. Trên sông, tiếng rao khó vang xa, nên thương hồ «bẹo hàng» bằng hình ảnh: treo gì bán nấy – nhìn cây bẹo là biết ghe bán thứ gì.', "A «cây bẹo» is a bamboo pole mounted on a boat to hoist a sample of its goods. Shouting doesn't carry far on the water, so vendors advertise visually instead – whatever hangs from the pole is what's for sale."] },
  { p: [0, 3], t: ['Giờ vàng ghé chợ', 'The best time to visit'], d: ['Chợ đông và sôi động nhất vào sáng sớm, thường trước 8–9 giờ – càng về trưa ghe càng thưa dần. Đi chợ nổi sớm để còn thấy sương giăng trên sông và không khí mua bán tấp nập nhất.', 'The market is busiest early in the morning, usually before 8–9am – boats thin out as the day goes on. Visit early to catch the river mist and the liveliest trading.'] },
  { p: [14, 1], t: ['Hàng hoá trên chợ', 'What is sold here'], d: ['Mặt hàng chính là trái cây và rau củ đặc sản miền Tây, chở số lượng lớn để bán sỉ. Len lỏi giữa những ghe lớn là các xuồng nhỏ bán đồ ăn thức uống nổi trên sông – cà phê, hủ tiếu, bún riêu phục vụ ngay tại chỗ.', 'The main goods are Mekong Delta fruit and vegetables, carried in bulk for wholesale. Smaller boats weave between them selling food and drink on the spot – coffee, noodle soup, served right on the water.'] },
  { p: [27, 5], t: ['Ghe lớn, xuồng nhỏ', 'Big boats, small boats'], d: ['Ghe lớn (ghe bầu, ghe chài) thường neo cố định để bán sỉ – nhiều chiếc còn là nơi thương hồ sinh sống luôn trên sông. Xuồng nhỏ len lỏi giữa các ghe lớn để bán lẻ hoặc phục vụ đồ ăn.', 'Large boats often anchor in place for wholesale trading – many double as floating homes for the traders. Smaller boats weave between them for retail sales or food service.'] },
  { p: [38, 8], t: ['Chợ nổi đang đổi thay', 'A changing market'], d: ['Theo thời gian, ghe xuồng thưa dần khi đường bộ phát triển, nhiều thương hồ chuyển hẳn lên bờ sinh sống – nhưng chợ nổi Phù Sa vẫn giữ được nét rộn ràng của riêng mình, nhờ những người quyết tâm bám sông.', 'Over time, fewer boats come as roads expand and many traders move ashore for good – yet Phù Sa floating market still keeps its own lively spirit, thanks to those who choose to stay on the river.'] },
  { p: [46, 10], t: ['Phù Sa lúc bình minh', 'Phù Sa at dawn'], d: ['Hàng trăm ghe xuồng san sát, tiếng máy nổ lạch tạch xen tiếng mời mua bán, những cây bẹo treo đủ màu trái cây tạo thành mảng màu rực rỡ trên mặt nước – đó là Phù Sa lúc bình minh.', "Hundreds of boats packed together, the putter of engines mixed with vendors' calls, poles hung with colorful fruit painting the water with color – that's Phù Sa at dawn."] },
];
const GOODS = [0xc0443a, 0xf2c14e, 0x6fbf73, 0xe8762d, 0xfda127, 0xd94f8a];
function pineapple(x, y, z, g, sc = 1) {
  // trái khóm (dứa) – món hàng đặc trưng nhất treo trên cây bẹo chợ nổi
  const p = new THREE.Group(); p.position.set(x, y, z); p.scale.setScalar(sc); g.add(p);
  blob(0.22, 0xd9a23a, 0, 0, 0, p, 0.85, 1.15, 0.85);
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; const leaf = M(new THREE.ConeGeometry(0.06, 0.26, 6), clay(0x6a9a4a), Math.cos(a) * 0.05, 0.28, Math.sin(a) * 0.05, p); leaf.rotation.z = Math.cos(a) * 0.35; leaf.rotation.x = Math.sin(a) * 0.35; }
}
// một "cây bẹo" thật treo cả chùm hàng, không chỉ 1 món – cho đúng tinh thần "treo gì bán nấy"
function beoPole(g, seed, tall = 3) {
  cyl(0.1, 0.1, tall, 0x8a5a3b, 0.3, 0.35, 0, g);
  const n = 2 + (seed % 2);
  for (let k = 0; k < n; k++) { const xx = 0.3 + Math.sin(seed + k) * 0.16, yy = tall - 0.3 - k * 0.55, zz = Math.cos(seed + k) * 0.1;
    if (k === 0) pineapple(xx, yy, zz, g, 1.15); else ball(0.22, GOODS[(seed + k) % GOODS.length], xx, yy, zz, g); }
}
const explorePins = EXPLORE.map((e, i) => {
  const g = new THREE.Group(); g.position.set(e.p[0], 0, e.p[1]); scene.add(g); g.visible = false;
  box(1.6, 0.35, 0.7, 0xd9a85a, 0, 0, 0, g); boatEyes(g, 0.55, 0.37, 0.6);
  beoPole(g, i, 3.2);
  box(0.32, 0.22, 0.32, GOODS[(i + 2) % GOODS.length], -0.5, 0.35, 0.15, g); box(0.3, 0.2, 0.3, GOODS[(i + 4) % GOODS.length], -0.5, 0.35, -0.18, g); // sọt hàng chất trên ghe
  if (i % 2 === 0) { cyl(0.04, 0.04, 1.1, 0x7a5a3a, -0.9, 0.35, 0, g); cyl(0.04, 0.04, 1.1, 0x7a5a3a, -0.1, 0.35, 0.32, g); box(1, 0.06, 0.5, 0xf4efe4, -0.5, 1.4, 0.16, g); } // mái che ghe hàng ăn
  const hit = M(new THREE.CylinderGeometry(1.6, 1.6, 4, 12), new THREE.MeshBasicMaterial({ visible: false }), 0, 2, 0, g); hit.userData.explore = i;
  const lab = document.createElement('button'); lab.type = 'button'; lab.className = 'bps3d-lab'; lab.style.display = 'none'; lab.innerHTML = '<b>🪧 ' + T(e.t[0], e.t[1]) + '</b>'; labels.appendChild(lab);
  lab.onclick = () => showExplore(i);
  return { g, hit, lab };
});
// ghe nền rải rác dọc sông cho đông đúc – chỉ trang trí, không tương tác
const MARKET_BOATS = [[-36, -7, 0], [-20, -8, 1], [-8, 6, 2], [7, -1, 0], [21, 8, 1], [34, -4, 2], [-32, 4, 1], [42, 4, 0]];
const marketBoats = MARKET_BOATS.map((p, i) => {
  const g = new THREE.Group(); g.position.set(p[0], 0, p[1]); g.rotation.y = i * 1.3; scene.add(g); g.visible = false;
  box(1.2 + (i % 3) * 0.2, 0.3, 0.55, [0xd9a85a, 0xc9713a, 0xe0a04f][i % 3], 0, 0, 0, g); boatEyes(g, 0.5, 0.29, 0.5);
  if (p[2] > 0) beoPole(g, i + 5, 2.2 + (i % 2) * 0.4);
  g.userData.bob = i * 1.7;
  return g;
});
const visited = new Set();
function showExplore(i) {
  const e = EXPLORE[i], box = document.getElementById('bps3d-info'); if (!box) return;
  document.getElementById('bps3d-info-t').textContent = T(e.t[0], e.t[1]);
  document.getElementById('bps3d-info-d').textContent = T(e.d[0], e.d[1]);
  box.style.display = 'grid';
  if (visited.has(i)) return;
  visited.add(i); explorePins[i].lab.classList.add('on');
  const cl = document.getElementById('bps3d-checklist'); if (cl) cl.textContent = '🎯 ' + visited.size + '/' + EXPLORE.length;
  if (visited.size === EXPLORE.length) setTimeout(() => {
    document.getElementById('bps3d-info-t').textContent = T('🎖️ Khám phá trọn vẹn!', '🎖️ Fully explored!');
    document.getElementById('bps3d-info-d').textContent = T('Bạn đã ghé thăm cả 8 điểm văn hoá của Chợ nổi Phù Sa. Rất tốt!', 'You visited all 8 cultural spots of Phù Sa floating market. Well done!');
    box.style.display = 'grid';
  }, 700);
}
window.addEventListener('bps-mode', e => {
  exploreMode = e.detail.mode === 'explore';
  explorePins.forEach(p => { p.g.visible = exploreMode; p.lab.style.display = exploreMode ? '' : 'none'; });
  marketBoats.forEach(g => { g.visible = exploreMode; });
  controls.maxPolarAngle = exploreMode ? 1.5 : 1.2;
  controls.minDistance = exploreMode ? 8 : 22;
  controls.maxDistance = exploreMode ? 130 : 100;
  coach();
});
window.addEventListener('bps-lang', () => explorePins.forEach((p, i) => { p.lab.innerHTML = '<b>🪧 ' + T(EXPLORE[i].t[0], EXPLORE[i].t[1]) + '</b>'; }));

// ---- tương tác ----
const ray = new THREE.Raycaster(), mv = new THREE.Vector2();
let downAt = null;
renderer.domElement.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
  const r = renderer.domElement.getBoundingClientRect(); mv.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(mv, camera);
  if (exploreMode) { const eh = ray.intersectObjects(explorePins.map(p => p.hit))[0]; if (eh) showExplore(eh.object.userData.explore); return; }
  const hit = ray.intersectObjects(spots.map(s => s.hit))[0]; if (hit) pick(hit.object.userData.loc);
});
renderer.domElement.addEventListener('pointermove', e => {
  const r = renderer.domElement.getBoundingClientRect(); mv.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(mv, camera);
  const objs = exploreMode ? explorePins.map(p => p.hit) : spots.map(s => s.hit);
  renderer.domElement.style.cursor = ray.intersectObjects(objs).length ? 'pointer' : 'grab';
});
window.addEventListener('bps-pick', e => { if (e.detail.g === 'loc') highlight(e.detail.i); else coach(); });
window.addEventListener('bps-week', e => { highlight(null); setWeek(e.detail.week); showRivals(e.detail.week - 1); });
const pops = [];
function pop(loc, html, bad) { const el = document.createElement('div'); el.className = 'bps3d-pop' + (bad ? ' bad' : ''); el.innerHTML = html; labels.appendChild(el); pops.push({ el, loc, t0: performance.now() }); }
window.addEventListener('bps-commit', e => { const d = e.detail, g = G();
  const wasStorm = d.loc === stormAt && d.m !== 2;
  sendMe(d.m, d.loc, () => { showRivals(d.week); window.dispatchEvent(new CustomEvent('bps-result', { detail: Object.assign({ storm: wasStorm }, d) }));
    if (d.m === 2) pop(d.loc, '📋 ' + T('Đã ghi chép', 'Notes taken'));
    else pop(d.loc, (d.rev >= 0 ? '+' : '') + (Math.round(d.rev * 10) / 10).toLocaleString(EN() ? 'en-US' : 'vi-VN') + ' ' + T('tr', 'm') + (d.clash ? '<small>⚡ ' + d.clash + ' ' + T('đối thủ', 'rival(s)') + '</small>' : ''), d.clash > 0 || wasStorm);
    if (wasStorm) { const b = document.getElementById('bps3d-storm'); if (b) { document.getElementById('bps3d-storm-t').textContent = '🌧️ ' + T('Mưa bão ở ' + g.LOCS[d.loc][1], 'Storm at ' + g.LOCS[d.loc][3]); document.getElementById('bps3d-storm-d').textContent = T('Khu này ít khách nhất tuần. Lần sau hãy nhìn đám đông trên bản đồ trước khi chọn.', 'This was the quietest spot this week. Next time, check the crowds on the map before choosing.'); b.style.display = 'grid'; } }
  }); });
window.addEventListener('bps-lang', labelsText);
new ResizeObserver(() => { renderer.setSize(W0(), H0()); camera.aspect = W0() / H0(); camera.updateProjectionMatrix(); }).observe(host);

// ---- vòng vẽ ----
const v3 = new THREE.Vector3(); const clock = new THREE.Clock();
// Né nhãn chồng lên nhau: nhãn gần camera giữ vị trí, nhãn xa hơn bị đẩy xuống
// nếu lấn vào vùng ngang của một nhãn đã đặt trước đó.
function declutter(list) {
  const ordered = list.slice().sort((a, b) => a._z - b._z), minGap = 34;
  for (let pass = 0; pass < 5; pass++) for (let i = 0; i < ordered.length; i++) { const a = ordered[i];
    for (let j = 0; j < i; j++) { const b = ordered[j], dx = Math.abs(a._x - b._x), minDx = (a.lab.offsetWidth + b.lab.offsetWidth) / 2 + 8;
      if (dx < minDx && Math.abs(a._y - b._y) < minGap) a._y = b._y + minGap; } }
  ordered.forEach(it => { it.lab.style.transform = 'translate(-50%,-100%) translate(' + it._x.toFixed(1) + 'px,' + it._y.toFixed(1) + 'px)'; });
}
function frame() {
  // Tạm dừng vòng vẽ nặng khi hub clay (js/bps-hub.js) hoặc tab đang ẩn, để
  // khỏi tranh CPU/GPU với animation loop của hub – xem js/clay-hub.js.
  if (document.hidden || window.__clayHubOpen) { requestAnimationFrame(frame); return; }
  const t = clock.getElapsedTime(), now = performance.now();
  night += (nightT - night) * 0.05;
  scene.traverse(o => {
    if (o.userData.bob !== undefined) { o.position.y = 0.1 + Math.sin(t * 1.6 + o.userData.bob) * 0.12; o.rotation.z = Math.sin(t + o.userData.bob) * 0.04; }
    if (o.userData.lantern) o.material.emissiveIntensity = night * 1.6 + 0.05;
    if (o.userData.smoke !== undefined) { const k = (t * 0.5 + o.userData.smoke / 3) % 1; o.position.y = 6 + k * 3.4; o.scale.setScalar(0.6 + k * 0.9); }
    if (o.userData.jig !== undefined) o.position.y = 0.1 + Math.abs(Math.sin(t * 3 + o.userData.jig)) * 0.15;
  });
  ripples.forEach(r => { const k = (t * 0.35 + r.userData.ph * 0.2) % 1; r.scale.setScalar(0.6 + k * 1.4); r.material.opacity = 1; });
  skyClouds.forEach((c, k) => { c.position.x += Math.sin(t * 0.1 + k) * 0.01; c.position.y += Math.sin(t * 0.6 + k) * 0.004; });
  spots.forEach(s => { if (s.cloud.visible) s.drops.forEach(d => { d.position.y -= 0.25; if (d.position.y < 0) d.position.y = 8; }); s.pad.rotation.y = t * 0.3; });
  anim = anim.filter(a => { const k = Math.min(1, (now - a.t0) / a.ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; a.obj.position.lerpVectors(a.from, a.to, e); a.obj.position.y = a.to.y + Math.sin(k * Math.PI) * 1.2; if (k >= 1) { if (a.done) a.done(); return false; } return true; });
  if (follow) { controls.target.lerp(follow.position, 0.08); const d = camera.position.distanceTo(controls.target); if (d > 34) camera.position.lerp(controls.target, 0.012); camGoal = null; }
  if (camGoal) { controls.target.lerp(camGoal, 0.04); if (controls.target.distanceTo(camGoal) < 0.05) camGoal = null; }
  controls.update(); renderer.render(scene, camera);
  for (let k = pops.length - 1; k >= 0; k--) { const p = pops[k], a = (now - p.t0) / 1000, sp = P[p.loc]; v3.set(sp[0], 9 + a * 1.2, sp[1]).project(camera);
    p.el.style.transform = 'translate(-50%,-100%) translate(' + ((v3.x + 1) / 2 * W0()).toFixed(1) + 'px,' + ((1 - v3.y) / 2 * H0()).toFixed(1) + 'px)'; if (a > 2.6) p.el.style.opacity = 0; if (a > 3.3) { p.el.remove(); pops.splice(k, 1); } }
  const W = W0(), H = H0();
  spots.forEach(s => { if (exploreMode) { s.lab.style.display = 'none'; return; } v3.set(s.g.position.x, 7.2, s.g.position.z).project(camera); const vis = v3.z < 1; s.lab.style.display = vis ? '' : 'none';
    if (vis) { const hw = s.lab.offsetWidth / 2 + 4; s._x = Math.max(hw, Math.min(W - hw, (v3.x + 1) / 2 * W)); s._y = Math.max(92, (1 - v3.y) / 2 * H); s._z = v3.z; } });
  if (!exploreMode) declutter(spots.filter(s => s.lab.style.display !== 'none'));
  if (exploreMode) { explorePins.forEach(p => { v3.set(p.g.position.x, 3.4, p.g.position.z).project(camera); const vis = v3.z < 1; p.lab.style.display = vis ? '' : 'none';
    if (vis) { const hw = p.lab.offsetWidth / 2 + 4; p._x = Math.max(hw, Math.min(W - hw, (v3.x + 1) / 2 * W)); p._y = Math.max(92, (1 - v3.y) / 2 * H); p._z = v3.z; } });
    declutter(explorePins.filter(p => p.lab.style.display !== 'none')); }
  hooks.forEach(f => f(t));
  riverBoats.forEach(g => { g.position.y = 0.1 + Math.sin(t * 1.6 + g.userData.bob) * 0.08; g.rotation.z = Math.sin(t * 1.2 + g.userData.bob) * 0.03; });
  requestAnimationFrame(frame);
}

// ---- Toàn cảnh làng sông: ruộng lúa, chùa, cầu khỉ, dừa ven sông, ghe chợ nổi thường trực ----
const riverBoats = [];
const hooks = [];
(function world() {
  // ruộng lúa bậc thấp
  [[-26, -30, 4, 3], [6, 25, 4, 2], [-44 + 14, 24, 2, 2]].forEach(([x0, z0, nx, nz]) => {
    for (let a = 0; a < nx; a++) for (let b = 0; b < nz; b++) {
      const x = x0 + a * 3.8, z = z0 + b * 3.2;
      box(3.5, 0.25, 2.9, 0x7a5a3a, x, -0.05, z); const p = box(3.2, 0.12, 2.6, (a + b) % 2 ? 0x9fd06e : 0xb8dc7a, x, 0.2, z); p.castShadow = false;
      for (let k = 0; k < 6; k++) blob(0.22, 0x6fae4a, x - 1.2 + (k % 3) * 1.2, 0.45, z - 0.6 + Math.floor(k / 3) * 1.2, scene, 1, 1.4, 1);
    }
  });
  // chùa làng
  const ch = new THREE.Group(); ch.position.set(-33, 0, -19); ch.rotation.y = 0.5; scene.add(ch);
  box(6, 0.6, 5, 0xe9dcc2, 0, 0, 0, ch); box(4.6, 2.6, 3.6, 0xf6d98a, 0, 0.6, 0, ch);
  roof(6.4, 1.4, 5, 0xc0443a, 0, 3.2, 0, ch); roof(4.6, 1.2, 3.6, 0xc0443a, 0, 4.4, 0, ch);
  box(1, 1.6, 0.2, 0x8a3a2a, 0, 0.6, 1.82, ch); [-1.8, 1.8].forEach(x => cyl(0.18, 0.2, 2.6, 0xc0443a, x, 0.6, 1.9, ch, 12));
  box(0.6, 0.3, 0.6, 0x9aa7b4, 2.6, 0.6, 2.2, ch); ball(0.3, 0xf2c14e, 2.6, 1.2, 2.2, ch);
  // cầu khỉ tre bắc qua sông
  const br = new THREE.Group(); br.position.set(10, 0, 3.5); br.rotation.y = 0.12; scene.add(br);
  for (let k = -5; k <= 5; k += 2.5) { [-0.5, 0.5].forEach(x => { const p = cyl(0.08, 0.08, 2.4, 0xb58a5a, x, -0.4, k, br, 8); p.rotation.z = x * 0.5; }); }
  box(0.35, 0.12, 11, 0xd9b56a, 0, 1.6, 0, br); box(0.06, 0.06, 11, 0xb58a5a, 0.55, 2.5, 0, br); box(0.06, 0.06, 11, 0xb58a5a, -0.55, 2.5, 0, br);
  for (let k = -5; k <= 5; k += 1.25) [-0.55, 0.55].forEach(x => cyl(0.04, 0.04, 0.9, 0xb58a5a, x, 1.6, k, br, 6));
  // hàng dừa nước + dừa ven bờ
  [[-44, -13], [-37, 3], [-22, 6], [-6, 9], [20, 12], [33, 0], [44, 12], [-30, -12], [2, -6], [40, -10], [16, -8]].forEach((p, k) => palm(p[0], p[1], scene, 0.85 + (k % 3) * 0.12));
  for (let k = 0; k < 14; k++) { const x = -46 + k * 7, z = -4 + Math.sin(k * 0.9) * 3; blob(0.9, 0x5f9e55, x, 0.3, z - 3.5, scene, 1.6, 0.5, 1); }
  // nhà sàn & quán ven sông thêm
  [[-28, 10], [28, 12.5], [-46 + 4, 8]].forEach(p => stilt(p[0], p[1], scene));
  [[20, -24], [-22, 26], [36, 14]].forEach((p, k) => house(p[0], p[1], scene, 0xfbf1dc, [0xe07a5f, 0x2f8a8c, 0xf5a04a][k], 0.85));
  // ghe chợ nổi thường trực trên sông (luôn hiện, chỉ trang trí)
  const COLS = [0xd98b4a, 0xc9713a, 0xe0a04f, 0xb86a3a];
  [[-38, -3, 0.2], [-9, -6, 2.6], [-2, 5, 1.1], [18, 6, 3.4], [36, 6.5, 0.7], [44, 7, 2.2]].forEach((p, i) => {
    const g = new THREE.Group(); g.position.set(p[0], 0.1, p[1]); g.rotation.y = p[2]; scene.add(g);
    box(2.6, 0.5, 1.0, COLS[i % 4], 0, 0, 0, g); boatEyes(g, 1.0, 0.52, 0.8);
    beoPole(g, i + 11, 2.6 + (i % 2) * 0.5);
    for (let k = 0; k < 5; k++) ball(0.2, GOODS[(i + k) % GOODS.length], -0.8 + k * 0.32, 0.65, (k % 2) * 0.2 - 0.1, g);
    if (i % 2) person([0x006687, 0xc0446a, 0x6fbf73][i % 3], g).position.set(-1.0, 0.4, 0);
    g.userData.bob = i * 1.3 + 0.4; riverBoats.push(g);
  });
  // xuồng con chèo qua lại
  [[-24, -1], [6, 1], [28, 4]].forEach((p, i) => { const g = new THREE.Group(); g.position.set(p[0], 0.1, p[1]); g.rotation.y = i; scene.add(g);
    box(1.6, 0.3, 0.6, 0xa8784a, 0, 0, 0, g); person(0xf2c14e, g).scale.setScalar(0.7); g.userData.bob = i * 2.1; riverBoats.push(g); });
})();

// ---- (1) Ghe đối thủ tuần tra trên sông trước khi vào chợ ----
const RIVER = [[-50, -5.8], [-34, -3], [-14, 3.5], [8, 2], [22, 4.5], [38, 5], [50, 5]];
const riverZ = x => { for (let i = 0; i < RIVER.length - 1; i++) { const a = RIVER[i], b = RIVER[i + 1]; if (x <= b[0]) { const u = (x - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * u; } } return 5; };
const cruisers = RC.map((c, k) => { const v = vessel(0, c); v.add(sprite(RIMG[k], 2.4, 2.5)); v.scale.setScalar(1.1); v.userData.ph = k * 2.1; v.userData.lane = (k - 1) * 1.6; return v; });
hooks.push(t => {
  cruisers.forEach((v, k) => {
    const hide = rivals[k].visible; v.visible = !hide; if (hide) return;
    const u = ((t * 0.018 + v.userData.ph / 6.3) % 1), dir = k % 2 ? -1 : 1;
    const x = dir > 0 ? -44 + u * 88 : 44 - u * 88, z = riverZ(x) + v.userData.lane;
    const x2 = x + dir * 0.5; v.position.set(x, 0.1 + Math.sin(t * 2 + k) * 0.06, z); v.lookAt(x2, v.position.y, riverZ(x2) + v.userData.lane); v.rotateY(-Math.PI / 2);
  });
});
// ---- (3) Người dân đi chợ quanh các điểm ----
const walkers = [];
spots.forEach((sp, i) => { for (let k = 0; k < 4; k++) { const w = person([0xe8762d, 0x006687, 0xf2c14e, 0xc0446a, 0x6fbf73, 0x8a5ab0][(i + k) % 6], sp.g); w.scale.setScalar(0.55); w.userData = { r: 6 + (k % 2) * 0.9, ph: k * 1.57 + i, sp: (k % 2 ? -1 : 1) * (0.12 + k * 0.02) }; walkers.push(w); } });
hooks.push(t => walkers.forEach(w => { const d = w.userData, a = d.ph + t * d.sp; w.position.set(Math.cos(a) * d.r, 0.1 + Math.abs(Math.sin(t * 6 + d.ph)) * 0.12, Math.sin(a) * d.r); w.rotation.y = -a - (d.sp > 0 ? 0 : Math.PI); }));

// ---- (2) Ngày – đêm: sương sớm, mặt trời, dây đèn lồng ----
const mist = new THREE.Group(); scene.add(mist);
for (let k = 0; k < 16; k++) { const x = -44 + k * 6; const m = M(new THREE.SphereGeometry(4, 16, 10), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }), x, 1.2, riverZ(x) + Math.sin(k) * 2, mist); m.scale.set(1.6, 0.25, 1); m.castShadow = m.receiveShadow = false; m.userData.ph = k; }
const sunDisc = M(new THREE.SphereGeometry(3.2, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffe2a0, fog: false }), -60, 30, -70); sunDisc.castShadow = false;
const SUNP = [[-70, 14, 0xfff0c8], [-10, 58, 0xfffbe8], [40, 30, 0xffd08a], [70, 8, 0xff8a50], [60, 40, 0xe8eeff]];
const strings = [];
[[-8, -6, 8, -6], [-34, -10, -18, -6], [16, 8, 32, 9], [-24, 9, -10, 10]].forEach(([x1, z1, x2, z2]) => {
  for (let k = 0; k <= 8; k++) { const u = k / 8, x = x1 + (x2 - x1) * u, z = z1 + (z2 - z1) * u, y = 3.6 - Math.sin(u * Math.PI) * 0.7;
    const l = M(new THREE.SphereGeometry(0.26, 14, 10), clay([0xff7a3d, 0xf2c14e, 0xe0444a][k % 3], { emissive: [0xff5a1f, 0xffb020, 0xff2a2a][k % 3], emissiveIntensity: 0 }), x, y, z); l.castShadow = false; strings.push(l); }
  [[x1, z1], [x2, z2]].forEach(p => cyl(0.08, 0.08, 3.8, 0x7a5a3a, p[0], 0, p[1], scene, 8));
});
const nightLight = new THREE.PointLight(0xffa860, 0, 40, 1.6); nightLight.position.set(0, 6, 2); scene.add(nightLight);
hooks.push(t => {
  const mo = week === 0 ? 0.42 : week === 3 ? 0.12 : 0;
  mist.children.forEach(m => { m.material.opacity += (mo - m.material.opacity) * 0.03; m.position.x += Math.sin(t * 0.2 + m.userData.ph) * 0.01; });
  const sp = SUNP[week]; sunDisc.position.lerp(new THREE.Vector3(sp[0], sp[1], -70), 0.03); sunDisc.material.color.lerp(new THREE.Color(sp[2]), 0.05);
  strings.forEach((l, k) => { l.material.emissiveIntensity = night * (1.4 + Math.sin(t * 3 + k) * 0.3); });
  nightLight.intensity = night * 40;
});
// ---- (4) Bảng xếp hạng 3D nổi trên bản đồ ----
const board = new THREE.Group(); board.position.set(0, 0, -26); scene.add(board);
box(16, 0.8, 4, 0xfbf1dc, 0, 0, 0, board); box(16.6, 0.4, 4.6, 0xb58a5a, 0, -0.3, 0, board);
const BCOL = [0xfda127, 0x7a7f8a, 0x9a8a78, 0x3f8a44];
const bars = BCOL.map((c, k) => { const b = M(rgeo(2.4, 1, 2.4), clay(c), -5.4 + k * 3.6, 0.8, 0, board); b.userData.h = 0.4; return b; });
const tags = BCOL.map((c, k) => { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthWrite: false })); sp.scale.set(3.6, 1.8, 1); board.add(sp); return { cv, tx, sp, last: '' }; });
const title = (() => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const x = cv.getContext('2d'); x.fillStyle = '#033337'; x.font = '800 54px "Plus Jakarta Sans",sans-serif'; x.textAlign = 'center'; x.fillText('🏆 Bảng xếp hạng', 256, 66);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthWrite: false })); sp.scale.set(10, 1.9, 1); sp.position.set(0, 9.5, 0); board.add(sp); return sp; })();
hooks.push(t => {
  const g = G(); if (!g) return;
  const vals = [g.S.total || 0].concat(g.RIVALS.map(r => r.total || 0)), mx = Math.max(1, ...vals);
  const names = ['🧺 Bạn'].concat(g.RIVALS.map(r => r.icon + ' ' + (r.short || r.name.split(' ')[0])));
  bars.forEach((b, k) => { const h = 0.4 + vals[k] / mx * 6; b.userData.h += (h - b.userData.h) * 0.06; b.scale.y = b.userData.h; b.position.y = 0.8 + b.userData.h / 2;
    const tg = tags[k]; tg.sp.position.set(b.position.x, 0.8 + b.userData.h + 1.1, 0);
    const txt = names[k] + '|' + (Math.round(vals[k] * 10) / 10).toLocaleString('vi-VN');
    if (txt !== tg.last) { tg.last = txt; const x = tg.cv.getContext('2d'); x.clearRect(0, 0, 256, 128);
      x.fillStyle = 'rgba(255,253,246,.95)'; x.beginPath(); x.roundRect(6, 6, 244, 116, 28); x.fill(); x.fillStyle = '#033337'; x.textAlign = 'center';
      x.font = '800 34px "Plus Jakarta Sans",sans-serif'; x.fillText(names[k], 128, 52); x.font = '800 38px "Plus Jakarta Sans",sans-serif'; x.fillStyle = '#006687'; x.fillText(txt.split('|')[1] + ' tr', 128, 98); tg.tx.needsUpdate = true; }
  });
  title.position.y = 9.5 + Math.sin(t * 1.4) * 0.2;
});

// ---- (6) Âm thanh nền: sóng nước, máy ghe, tiếng chợ (tổng hợp bằng Web Audio) ----
const sfx = { ctx: null, on: false };
function sfxStart() {
  const C = sfx.ctx = new (window.AudioContext || window.webkitAudioContext)(), out = C.createGain(); out.gain.value = 0.55; out.connect(C.destination); sfx.out = out;
  const nb = C.createBuffer(1, C.sampleRate * 2, C.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const noise = () => { const n = C.createBufferSource(); n.buffer = nb; n.loop = true; n.start(); return n; };
  // sóng
  const w = noise(), wf = C.createBiquadFilter(); wf.type = 'lowpass'; wf.frequency.value = 420; const wg = C.createGain(); wg.gain.value = 0.18;
  const lfo = C.createOscillator(), lg = C.createGain(); lfo.frequency.value = 0.18; lg.gain.value = 0.1; lfo.connect(lg); lg.connect(wg.gain); lfo.start();
  w.connect(wf); wf.connect(wg); wg.connect(out);
  // máy ghe (tạch tạch)
  const eo = C.createOscillator(); eo.type = 'square'; eo.frequency.value = 52; const ef = C.createBiquadFilter(); ef.type = 'lowpass'; ef.frequency.value = 260;
  const eg = C.createGain(); eg.gain.value = 0; const am = C.createOscillator(), ag = C.createGain(); am.frequency.value = 9; ag.gain.value = 0.5; am.connect(ag); ag.connect(eg.gain);
  eo.connect(ef); ef.connect(eg); eg.connect(out); eo.start(); am.start(); sfx.engine = eg;
  // tiếng chợ: nhiễu dải giọng nói, lúc to lúc nhỏ
  const m = noise(), mf = C.createBiquadFilter(); mf.type = 'bandpass'; mf.frequency.value = 900; mf.Q.value = 0.8; const mg = C.createGain(); mg.gain.value = 0.04;
  m.connect(mf); mf.connect(mg); mg.connect(out); sfx.market = mg; sfx.mf = mf;
}
const sfxBtn = document.createElement('button'); sfxBtn.type = 'button'; sfxBtn.className = 'bps3d-chip'; sfxBtn.textContent = '🔇 ' + T('Âm thanh', 'Sound');
sfxBtn.style.cssText = 'position:absolute;right:12px;top:52px;cursor:pointer;pointer-events:auto;z-index:2;border:0';
host.parentElement.appendChild(sfxBtn);
sfxBtn.onclick = () => { if (!sfx.ctx) sfxStart(); sfx.on = !sfx.on; sfx.on ? sfx.ctx.resume() : sfx.ctx.suspend(); sfxBtn.textContent = (sfx.on ? '🔊' : '🔇') + ' ' + T('Âm thanh', 'Sound'); };
window.addEventListener('bps-lang', () => { sfxBtn.textContent = (sfx.on ? '🔊' : '🔇') + ' ' + T('Âm thanh', 'Sound'); });
hooks.push(t => {
  if (!sfx.on || !sfx.ctx) return; const C = sfx.ctx;
  const moving = anim.some(a => a.obj === me) || cruisers.some(v => v.visible);
  sfx.engine.gain.setTargetAtTime(anim.some(a => a.obj === me) ? 0.22 : (moving ? 0.05 : 0), C.currentTime, 0.3);
  const busy = night > 0.9 ? 0.02 : 0.03 + 0.03 * Math.max(0, Math.sin(t * 0.7)) + (week === 0 ? 0.02 : 0);
  sfx.market.gain.setTargetAtTime(busy, C.currentTime, 0.5); sfx.mf.frequency.setTargetAtTime(800 + Math.sin(t * 2.3) * 250, C.currentTime, 0.2);
});

// ---- (7) Ghe đội kia (chơi nhóm v4): Rồng Xanh / Phù Sa chạy tới bến lúc công bố ----
const others = {};
function otherBoat(team) { if (others[team]) return others[team];
  const v = vessel(0, team === 'rx' ? 0x2f7fb8 : 0xfda127); if (team === 'rx') v.add(sprite('assets/character/phu-sa/doi-phu-sa-ghe-v2.png', 4.2, 2.0)); else duoOnBoat(v);
  v.scale.setScalar(1.2); v.position.set(team === 'rx' ? -14 : -4, 0.1, team === 'rx' ? 4.5 : 10); v.userData.home = v.position.clone(); scene.add(v); return others[team] = v; }
window.addEventListener('bps-commit-other', e => { const d = e.detail; if (d.m === 2) return; const v = otherBoat(d.team), p = P[d.loc];
  const to = new THREE.Vector3(p[0] + 2.2, 0.1, p[1] + 3.6); v.visible = true; v.lookAt(to.x, v.position.y, to.z); tween(v, to, 1900, () => pop(d.loc, (d.team === 'rx' ? '🐉 ' : '🌾 ') + (d.rev >= 0 ? '+' : '') + (Math.round(d.rev * 10) / 10).toLocaleString(EN() ? 'en-US' : 'vi-VN') + ' ' + T('tr', 'm'), false)); });
window.addEventListener('bps-week', () => { Object.values(others).forEach(v => { tween(v, v.userData.home.clone(), 1500); }); if (team5) team5.visible = !others.rx; });

// ---- (8) Hiệu ứng sự kiện tuần: lũ, mưa, lễ hội, nắng nóng, mùa trái cây, mùa thi, du khách ----
const rainGeo = new THREE.BufferGeometry(), RN = LOW ? 700 : 1600, rp = new Float32Array(RN * 3);
for (let i = 0; i < RN; i++) { rp[i * 3] = (Math.random() - 0.5) * 90; rp[i * 3 + 1] = Math.random() * 30; rp[i * 3 + 2] = (Math.random() - 0.5) * 90; }
rainGeo.setAttribute('position', new THREE.BufferAttribute(rp, 3));
const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0xcfe6ff, size: 0.28, transparent: true, opacity: 0.75, depthWrite: false })); rain.visible = false; scene.add(rain);
const sparkGeo = new THREE.BufferGeometry(), SN = 260, spp = new Float32Array(SN * 3), spv = []; sparkGeo.setAttribute('position', new THREE.BufferAttribute(spp, 3));
const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ size: 0.5, vertexColors: false, color: 0xffc04a, transparent: true, depthWrite: false })); sparks.visible = false; scene.add(sparks);
let evKind = null, evT0 = 0, evMark = null; const waterY0 = water.position.y, sunC0 = new THREE.Color();
const EVK = { '🌊': 'flood', '🌧️': 'rain', '🏮': 'festival', '☀️': 'heat', '🥭': 'fruit', '🎓': 'exam', '📸': 'tourist' };
const EVLOC = { flood: 0, festival: 6, fruit: 7, exam: 2, tourist: 0, rain: 3 };
function burst() { const p = P[6]; for (let i = 0; i < SN; i++) { spp[i * 3] = p[0]; spp[i * 3 + 1] = 10; spp[i * 3 + 2] = p[1]; const a = Math.random() * 6.283, u = Math.random() * 2 - 1, s = 0.12 + Math.random() * 0.12; spv[i] = [Math.cos(a) * Math.sqrt(1 - u * u) * s, u * s + 0.05, Math.sin(a) * Math.sqrt(1 - u * u) * s]; } sparkGeo.attributes.position.needsUpdate = true; sparks.material.color.setHSL(Math.random(), 0.9, 0.62); }
function setEvent(icon) {
  evKind = icon ? EVK[icon] || null : null; evT0 = performance.now();
  rain.visible = evKind === 'rain' || evKind === 'flood'; sparks.visible = evKind === 'festival'; if (evKind === 'festival') burst();
  if (evMark) { evMark.remove(); evMark = null; }
  if (evKind && EVLOC[evKind] != null) { evMark = document.createElement('div'); evMark.className = 'bps3d-pop'; evMark.style.background = evKind === 'flood' || evKind === 'rain' ? '#2f6f9f' : '#e8762d'; evMark.style.fontSize = '22px'; evMark.textContent = icon; evMark.userData = EVLOC[evKind]; labels.appendChild(evMark); }
}
window.addEventListener('bps-event', e => setEvent(e.detail && e.detail.icon));
window.addEventListener('bps-week', () => setEvent(null));
hooks.push(t => {
  const wt = evKind === 'flood' ? 0.55 : 0; water.position.y += (waterY0 + wt - water.position.y) * 0.03;
  if (evKind === 'heat') { sun.color.lerp(new THREE.Color(0xffc27a), 0.03); sun.intensity += (2.8 - sun.intensity) * 0.03; }
  if (rain.visible) { const a = rainGeo.attributes.position.array; for (let i = 0; i < RN; i++) { a[i * 3 + 1] -= 0.55; if (a[i * 3 + 1] < 0) a[i * 3 + 1] = 30; } rainGeo.attributes.position.needsUpdate = true; }
  if (sparks.visible) { let alive = false; for (let i = 0; i < SN; i++) { spp[i * 3] += spv[i][0]; spp[i * 3 + 1] += spv[i][1]; spp[i * 3 + 2] += spv[i][2]; spv[i][1] -= 0.004; if (spp[i * 3 + 1] > 2) alive = true; } sparkGeo.attributes.position.needsUpdate = true; sparks.material.opacity = alive ? 1 : 0; if (!alive) burst(); }
  if (evKind === 'festival') nightT = Math.max(nightT, 0.6);
  if (evMark) { const sp = P[evMark.userData]; v3.set(sp[0], 8 + Math.sin(t * 2.4) * 0.6, sp[1]).project(camera); const r = renderer.domElement; evMark.style.transform = 'translate(-50%,-100%) translate(' + ((v3.x + 1) / 2 * r.clientWidth).toFixed(1) + 'px,' + ((1 - v3.y) / 2 * r.clientHeight).toFixed(1) + 'px)'; evMark.style.display = v3.z < 1 ? '' : 'none'; }
});

// ---- (9) Tự hạ chất lượng khi máy chạy chậm ----
let perfN = 0, perfSum = 0, perfLast = performance.now(), degraded = LOW;
hooks.push(() => { const now = performance.now(), dt = now - perfLast; perfLast = now; if (degraded || dt > 500) return; perfSum += dt; perfN++;
  if (perfN >= 120) { if (perfSum / perfN > 40) { degraded = true; renderer.setPixelRatio(1); sun.castShadow = false; renderer.shadowMap.enabled = false; scene.traverse(o => { if (o.material) o.material.needsUpdate = true; }); } perfN = 0; perfSum = 0; } });
if (LOW) { sun.castShadow = true; }

// ---- (10) Hướng dẫn lần đầu trong cảnh 3D ----
(function tips() { let seen = false; try { seen = localStorage.getItem('bps3d-tips') === '1'; } catch (e) {} if (seen) return;
  const box = document.createElement('div'); box.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:3;pointer-events:auto;max-width:min(92%,380px);background:#fffdf6;color:#033337;border-radius:22px;padding:16px 18px;font:600 13px/1.45 Manrope,system-ui,sans-serif;box-shadow:0 6px 0 #d9c7a6,0 20px 40px -12px rgba(3,51,55,.55);display:flex;flex-direction:column;gap:8px';
  const fill = () => { box.innerHTML = '<b style="font:800 16px Plus Jakarta Sans,sans-serif">' + T('Cách dùng cảnh 3D', 'Using the 3D scene') + '</b>' +
    ['👆 ' + T('Kéo để xoay sông nước', 'Drag to rotate the river'), '🤏 ' + T('Chụm hai ngón hoặc lăn chuột để phóng to', 'Pinch or scroll to zoom'), '📍 ' + T('Bấm vào nhãn bến hoặc bãi đất để chọn bến', 'Tap a landing label or plot to choose it'), '⛵ ' + T('Chốt xong, ghe sẽ chạy tới bến và hiện doanh thu', 'Once locked in, your boat sails there and shows the revenue'), '🔊 ' + T('Bật âm thanh ở góc phải nếu muốn nghe sông nước', 'Turn on sound at the top right to hear the river')].map(x => '<span>' + x + '</span>').join('') +
    '<button type="button" style="margin-top:4px;min-height:44px;border:0;border-radius:14px;background:#fda127;color:#033337;font:800 14px Manrope,sans-serif;cursor:pointer;box-shadow:inset 0 -4px 0 rgba(232,118,45,.6)">' + T('Đã hiểu, bắt đầu', 'Got it, let’s go') + '</button>';
    box.querySelector('button').onclick = () => { try { localStorage.setItem('bps3d-tips', '1'); } catch (e) {} box.remove(); }; };
  fill(); window.addEventListener('bps-lang', () => { if (box.isConnected) fill(); }); host.parentElement.appendChild(box); })();

const wait = () => { if (G()) { setWeek(G().S.week || 0); frame(); } else setTimeout(wait, 60); };
wait();
