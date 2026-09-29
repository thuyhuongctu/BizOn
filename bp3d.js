// Hộ Chiếu Thương Hiệu 3D — thế giới đất sét cho game gốc brand-passport.
// Đọc trạng thái qua window.__bp (không can thiệp logic game) và vẽ: biển, Vàm Thịnh, 7 thị trường,
// sương mù thông tin, cờ thâm nhập, tuyến vận tải, thuyền sen, hộ chiếu đóng dấu mộc, radar 5 chiều, giấy chứng nhận.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { makeBPCast, CAST_IDS, RIVAL_ID } from './bp-clay-cast.js';

const $ = id => document.getElementById(id);
const EN = () => { try { return localStorage.getItem('bizon-lang') === 'en'; } catch (e) { return false; } };
const tr = (vi, en) => EN() ? en : vi;
const FONT = 'Manrope, "Be Vietnam Pro", system-ui, sans-serif';
const wrap = $('bp3d-stage');
const small = Math.min(innerWidth, innerHeight) < 600;
const dark = document.documentElement.dataset.theme === 'dark';

const R = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
R.setPixelRatio(Math.min(devicePixelRatio, small ? 1.6 : 1.75));
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
wrap.prepend(R.domElement);
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(dark ? 0x0d2a33 : 0xd4ecef, 60, 140);
const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 400); scene.add(cam);
cam.position.set(0, 50, 60);
const ctl = new OrbitControls(cam, R.domElement);
Object.assign(ctl, { enableDamping: true, dampingFactor: 0.08, maxPolarAngle: 1.32, minDistance: 6, maxDistance: 100, enablePan: false });
let autoCam = true;
ctl.addEventListener('start', () => { autoCam = false; });

scene.add(new THREE.HemisphereLight(dark ? 0x9fc7d6 : 0xfff6e8, dark ? 0x1d4650 : 0x5a8f9a, dark ? 0.8 : 1.15));
const sun = new THREE.DirectionalLight(dark ? 0xcfe3ff : 0xfff0d8, dark ? 1.3 : 2.3);
sun.position.set(-18, 32, 18); sun.castShadow = true;
sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 90 });
sun.shadow.bias = -0.0005; scene.add(sun);
const bookLight = new THREE.PointLight(0xfff4e0, 6, 7, 1.5); bookLight.position.set(0.5, 1.4, -2.2); cam.add(bookLight);

/* ---------- vật liệu & hình khối dùng chung ---------- */
const mc = {};
const M = (c, o) => { const k = c + (o ? JSON.stringify(o) : ''); return mc[k] || (mc[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.82 }, o || {}))); };
const GE = {
  sph: new THREE.SphereGeometry(1, 22, 16), ico: new THREE.IcosahedronGeometry(1, 1), puff: new THREE.IcosahedronGeometry(1, 2),
  box: new THREE.BoxGeometry(1, 1, 1), cyl: new THREE.CylinderGeometry(1, 1, 1, 18), cone: new THREE.ConeGeometry(1, 1, 18),
  cone4: new THREE.ConeGeometry(1, 1, 4), cap: new THREE.CapsuleGeometry(1, 2, 6, 14),
};
function P(g, m, par, x = 0, y = 0, z = 0, sx = 1, sy = sx, sz = sx) {
  const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz);
  o.castShadow = o.receiveShadow = true; (par || scene).add(o); return o;
}
const grp = (par, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); (par || scene).add(g); return g; };
const anim = [];
const U = { t: { value: 0 }, amp: { value: 1 } };
const G0 = 0.47;
const WOOD = M(0x9a6a3a), WOOD2 = M(0x7a4f2c);

/* ---------- bố cục thế giới ---------- */
const MK = [
  { name: 'Hải Lam', icon: '🌐', c: '#2f7fb5' }, { name: 'Bắc Phong', icon: '🏔️', c: '#5b6f86' }, { name: 'Kim Sa', icon: '🌅', c: '#c07a1f' },
  { name: 'Lục Đảo', icon: '🏝️', c: '#3f8a45' }, { name: 'Nhật Quang', icon: '🌸', c: '#c0587e' }, { name: 'Tân Cảng', icon: '⚓', c: '#44566e' },
  { name: 'Hỏa Sơn', icon: '🌋', c: '#b8522a' }];
const MODE_HEX = ['#2f8fcf', '#e8762d', '#3f8f4a'];
const MODE_ICON = ['🛒', '🚢', '🤝'];
const HOME = new THREE.Vector3(0, 0, 10);
const END = new THREE.Vector3(9, 0, 13.5);
const IR = 2.6;
const IPOS = [165, 140, 115, 90, 65, 40, 15].map(a => new THREE.Vector3(19 * Math.cos(a * Math.PI / 180), 0, 6 - 19 * Math.sin(a * Math.PI / 180)));

/* ---------- biển ---------- */
const seaM = new THREE.MeshStandardMaterial({ color: dark ? 0x1f5a66 : 0x5db3c0, roughness: 0.35, metalness: 0.05 });
seaM.onBeforeCompile = sh => {
  sh.uniforms.t = U.t; sh.uniforms.amp = U.amp;
  sh.vertexShader = 'uniform float t;\nuniform float amp;\n' + sh.vertexShader.replace('#include <begin_vertex>',
    '#include <begin_vertex>\ntransformed.z += (sin(position.x*.33+t*1.1)*.13 + cos(position.y*.27+t*.8)*.11)*amp;');
};
const sea = new THREE.Mesh(new THREE.PlaneGeometry(260, 260, small ? 70 : 110, small ? 70 : 110), seaM);
sea.rotation.x = -Math.PI / 2; sea.position.y = -0.22; sea.receiveShadow = true; scene.add(sea);
const foamM = new THREE.MeshBasicMaterial({ color: 0xf1fbf8, transparent: true, opacity: 0.6, depthWrite: false, fog: true });
function foam(par, r) { const f = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.32, 48), foamM); f.rotation.x = -Math.PI / 2; f.position.y = -0.1; par.add(f); anim.push(t => f.scale.setScalar(1 + Math.sin(t * 1.3 + r) * 0.025)); }

/* ---------- nhãn & sprite ---------- */
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const labels = [];
function lift(o) { o.traverse(x => { if (x.isSprite) { x.renderOrder = 3; } }); }
function makeLabel(w = 4.2) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 150;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, fog: false }));
  sp.renderOrder = 20; sp.scale.set(w, w * 150 / 512, 1); sp.center.set(0.5, 0); sp.userData.bw = w;
  let last = '', args = null;
  const draw = (l1, l2, accent = '#006687', force) => {
    const k = l1 + '|' + l2 + '|' + accent; if (k === last && !force) return; last = k; args = [l1, l2, accent];
    const g = c.getContext('2d'); g.clearRect(0, 0, 512, 150);
    g.font = '800 44px ' + FONT; const w1 = g.measureText(l1).width;
    g.font = '700 29px ' + FONT; const w2 = l2 ? g.measureText(l2).width : 0;
    const bw = Math.min(504, Math.max(w1, w2) + 52), h = l2 ? 128 : 80, x0 = (512 - bw) / 2;
    rr(g, x0, 150 - h - 8, bw, h, 32); g.fillStyle = 'rgba(255,255,255,.94)'; g.fill(); g.lineWidth = 5; g.strokeStyle = accent; g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#033337';
    g.font = '800 44px ' + FONT; g.fillText(l1, 256, 150 - h - 8 + (l2 ? 42 : 41));
    if (l2) { g.font = '700 29px ' + FONT; g.fillStyle = accent; g.fillText(l2, 256, 150 - 8 - 32); }
    tex.needsUpdate = true;
  };
  sp.userData.set = draw; sp.userData.redraw = () => args && draw(args[0], args[1], args[2], true);
  labels.push(sp); return sp;
}
function emojiTex(txt, bg, w = 256, h = 160, fs = 92) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = fs + 'px ' + FONT; g.fillText(txt, w / 2, h / 2 + 6);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const TL = new THREE.TextureLoader();
function artSprite(src, h) {
  const mat = new THREE.SpriteMaterial({ transparent: false, alphaTest: 0.5, depthWrite: true, toneMapped: false });
  mat.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <alphatest_fragment>', 'diffuseColor.a = smoothstep(0.03, 0.2, diffuseColor.a);\n#include <alphatest_fragment>'); };
  mat.customProgramCacheKey = () => 'bp3dArt';
  const sp = new THREE.Sprite(mat); sp.center.set(0.5, 0); sp.visible = false; sp.userData = { h, w: h * 0.4 };
  TL.load(src, t => { t.colorSpace = THREE.SRGBColorSpace; mat.map = t; mat.needsUpdate = true; sp.userData.w = h * t.image.width / t.image.height; sp.scale.set(sp.userData.w, h, 1); sp.visible = true; });
  return sp;
}
const blobM = new THREE.MeshBasicMaterial({ color: 0x1d2a20, transparent: true, opacity: 0.22, depthWrite: false });
const blobG = new THREE.CircleGeometry(1, 24);
function blob(par, x, y, z, r) { const b = new THREE.Mesh(blobG, blobM); b.rotation.x = -Math.PI / 2; b.position.set(x, y + 0.012, z); b.scale.setScalar(r); par.add(b); return b; }

/* ---------- đảo ---------- */
const hits = [];
function islandBase(par, r, top, sand = 0xeedbb0, m = -1) {
  const s = P(new THREE.CylinderGeometry(r * 1.05, r * 1.22, 0.8, 32), M(sand), par, 0, -0.25, 0);
  P(new THREE.CylinderGeometry(r * 0.86, r * 0.97, 0.34, 32), M(top), par, 0, 0.3, 0);
  s.userData.m = m; hits.push(s); foam(par, r * 1.22);
}
function tree(par, x, z, c = 0x5f9e55, s = 1) { P(GE.cyl, WOOD, par, x, G0 + 0.35 * s, z, 0.08 * s, 0.7 * s, 0.08 * s); P(GE.ico, M(c, { flatShading: true }), par, x, G0 + 0.95 * s, z, 0.44 * s); }
function palm(par, x, z, s = 1) {
  const tr_ = P(GE.cyl, M(0x9a6a3a), par, x, G0 + 0.75 * s, z, 0.08 * s, 1.5 * s, 0.08 * s); tr_.rotation.z = 0.12;
  for (let i = 0; i < 6; i++) { const a = i * 1.05, l = P(GE.sph, M(0x4f9a4a), par, x + 0.18 * s + Math.cos(a) * 0.36 * s, G0 + 1.5 * s, z + Math.sin(a) * 0.36 * s, 0.45 * s, 0.06 * s, 0.15 * s); l.rotation.y = -a; l.rotation.z = -0.25; }
}
function house(par, x, z, wall, roof, s = 1, ry = 0) {
  const g = grp(par, x, G0, z); g.rotation.y = ry;
  P(GE.box, M(wall), g, 0, 0.34 * s, 0, 0.8 * s, 0.68 * s, 0.66 * s);
  const r = P(GE.cone4, M(roof), g, 0, 0.9 * s, 0, 0.66 * s, 0.46 * s, 0.6 * s); r.rotation.y = Math.PI / 4;
  P(GE.box, M(0x6a4a3a), g, 0, 0.2 * s, 0.34 * s, 0.2 * s, 0.34 * s, 0.02);
}
const DECO = [
  p => { // Hải Lam – thị trường số
    [[-0.8, 0.3, 2.6], [0.5, -0.6, 3.4], [1.05, 0.75, 1.9], [-0.25, 1.15, 1.4]].forEach(([x, z, h]) => {
      P(GE.box, M(0x9fd4ef, { roughness: 0.25, metalness: 0.25 }), p, x, G0 + h / 2, z, 0.74, h, 0.74);
      P(GE.box, M(0x2f6f9a), p, x, G0 + h + 0.05, z, 0.8, 0.1, 0.8);
      for (let k = 0.5; k < h - 0.2; k += 0.5) P(GE.box, M(0x2f6f9a), p, x, G0 + k, z, 0.76, 0.04, 0.76);
    });
    P(GE.cyl, M(0xe6e6e6), p, 0.5, G0 + 3.95, -0.6, 0.04, 1.1, 0.04);
    const b = P(GE.sph, new THREE.MeshStandardMaterial({ color: 0xff6a5a, emissive: 0xff3a2a, emissiveIntensity: 1 }), p, 0.5, G0 + 4.55, -0.6, 0.12);
    anim.push(t => { b.material.emissiveIntensity = Math.sin(t * 4) > 0 ? 1.6 : 0.15; });
    const scr = P(GE.box, new THREE.MeshStandardMaterial({ color: 0x5cc4e6, emissive: 0x3aa7d8, emissiveIntensity: 0.8, roughness: 0.3 }), p, -1.5, G0 + 2.2, -0.7, 1.2, 0.72, 0.05);
    scr.rotation.y = 0.5; anim.push(t => { scr.position.y = G0 + 2.2 + Math.sin(t * 1.5) * 0.12; });
  },
  p => { // Bắc Phong – tiêu chuẩn nghiêm ngặt
    [[-0.7, -0.4, 3, 1.35], [0.95, -0.6, 2.3, 1.05], [0.15, 0.75, 1.7, 0.85]].forEach(([x, z, h, r]) => {
      P(GE.cone, M(0x8e9aa9, { flatShading: true }), p, x, G0 + h / 2, z, r, h, r);
      P(GE.cone, M(0xffffff, { flatShading: true }), p, x, G0 + h * 0.83, z, r * 0.37, h * 0.35, r * 0.37);
    });
    [[-1.6, 1.0], [1.65, 0.85], [-1.05, 1.75], [0.95, 1.7], [-1.9, -0.3]].forEach(([x, z]) => { P(GE.cyl, WOOD2, p, x, G0 + 0.15, z, 0.06, 0.3, 0.06); P(GE.cone, M(0x3f7a52, { flatShading: true }), p, x, G0 + 0.75, z, 0.34, 1, 0.34); });
  },
  p => { // Kim Sa – khách trẻ
    [[-0.9, -0.6, 1], [0.9, -0.3, 0.8], [0.1, -1.4, 0.7]].forEach(([x, z, s]) => P(GE.sph, M(0xeec27e), p, x, G0 - 0.05, z, 0.95 * s, 0.4 * s, 0.75 * s));
    house(p, -0.45, 0.45, 0xfff4e0, 0xe8604c, 1, 0.3); house(p, 0.75, 0.8, 0xfff4e0, 0x3aa0d8, 0.85, -0.4); house(p, 0.5, -0.9, 0xfff4e0, 0xf2a73b, 0.8, 0.2);
    palm(p, -1.55, 0.9); palm(p, 1.6, -0.6, 0.9);
    const bal = grp(p, -1.1, G0 + 2.7, -0.9); P(GE.sph, M(0xe8604c), bal, 0, 0, 0, 0.42, 0.5, 0.42); P(GE.box, WOOD, bal, 0, -0.72, 0, 0.2, 0.16, 0.2);
    anim.push(t => { bal.position.y = G0 + 2.7 + Math.sin(t * 0.9) * 0.25; });
  },
  p => { // Lục Đảo – xanh
    [[-1, -0.6], [-0.2, -1.25], [0.95, -0.75], [-1.35, 0.6], [0.15, 0.95], [1.3, 0.55], [-0.6, 1.5]].forEach(([x, z], i) => tree(p, x, z, i % 2 ? 0x4f9a4a : 0x7cc36a, 0.85 + (i % 3) * 0.15));
    P(GE.cyl, M(0xf4f4f4), p, 0.35, G0 + 1.45, 0, 0.07, 2.9, 0.07);
    const hub = grp(p, 0.35, G0 + 2.9, 0.12);
    for (let i = 0; i < 3; i++) { const g = grp(hub); g.rotation.z = i * 2.094; P(GE.box, M(0xffffff), g, 0, 0.55, 0, 0.12, 1.1, 0.04); }
    P(GE.sph, M(0xffffff), hub, 0, 0, 0, 0.12);
    anim.push(t => { hub.rotation.z = t * 1.6; });
  },
  p => { // Nhật Quang – quan hệ dài hạn
    [[-1.15, -0.5], [1.1, -0.7], [-1.0, 0.95], [1.2, 0.85], [0, -1.4]].forEach(([x, z]) => {
      P(GE.cyl, M(0x6a3f2c), p, x, G0 + 0.35, z, 0.07, 0.7, 0.07);
      for (let k = 0; k < 3; k++) P(GE.ico, M(k ? 0xf6b8cb : 0xf08fae, { flatShading: true }), p, x + (k - 1) * 0.22, G0 + 0.85 + (k % 2) * 0.15, z + (k - 1) * 0.1, 0.33);
    });
    P(GE.box, M(0xf6ecd8), p, 0, G0 + 0.35, 0.1, 1, 0.7, 0.8);
    for (let k = 0; k < 3; k++) { const r = P(new THREE.CylinderGeometry(0.2, 0.95, 0.3, 4), M(0x9a3a3a), p, 0, G0 + 0.85 + k * 0.45, 0.1, 1 - k * 0.25); r.rotation.y = Math.PI / 4; if (k < 2) P(GE.box, M(0xf6ecd8), p, 0, G0 + 1.08 + k * 0.45, 0.1, 0.55 - k * 0.15, 0.25, 0.45 - k * 0.12); }
    [[-0.6, 1.45], [0.6, 1.45]].forEach(([x, z]) => { P(GE.cyl, M(0x6a4a3a), p, x, G0 + 0.3, z, 0.03, 0.6, 0.03); P(GE.sph, new THREE.MeshStandardMaterial({ color: 0xffb24a, emissive: 0xff8a2a, emissiveIntensity: 0.7 }), p, x, G0 + 0.7, z, 0.13, 0.17, 0.13); });
  },
  p => { // Tân Cảng – cửa ngõ khu vực
    const cs = [0xe8604c, 0x3aa0d8, 0xf2a73b, 0x4f9a55, 0x8a6ad0];
    for (let i = 0; i < 10; i++) { const col = i % 3, row = Math.floor(i / 3) % 2, lay = i > 5 ? 1 : 0; P(GE.box, M(cs[i % 5]), p, -1.1 + col * 0.66, G0 + 0.17 + lay * 0.34, -0.6 + row * 0.5, 0.6, 0.32, 0.44); }
    [[1.05, -0.7], [1.45, 0.55]].forEach(([x, z]) => {
      P(GE.box, M(0xf2b53a), p, x, G0 + 1.25, z, 0.14, 2.5, 0.14);
      P(GE.box, M(0xf2b53a), p, x - 0.55, G0 + 2.45, z, 1.5, 0.12, 0.14);
      P(GE.box, M(0x333333), p, x - 1.1, G0 + 2.05, z, 0.03, 0.8, 0.03);
    });
    P(GE.cyl, M(0xffffff), p, -1.55, G0 + 0.8, 1.0, 0.24, 1.6, 0.24);
    P(GE.cyl, M(0xd6453a), p, -1.55, G0 + 1.05, 1.0, 0.26, 0.28, 0.26);
    const lt = P(GE.sph, new THREE.MeshStandardMaterial({ color: 0xfff2a8, emissive: 0xffe07a, emissiveIntensity: 1 }), p, -1.55, G0 + 1.75, 1.0, 0.2);
    anim.push(t => { lt.material.emissiveIntensity = 0.7 + Math.sin(t * 2.5) * 0.5; });
  },
  p => { // Hỏa Sơn – phân mảnh theo vùng đảo
    P(new THREE.CylinderGeometry(0.45, 1.6, 2.3, 20), M(0x7a5a48, { flatShading: true }), p, 0, G0 + 1.1, -0.2);
    const lava = P(GE.sph, new THREE.MeshStandardMaterial({ color: 0xff7a2a, emissive: 0xff5a1a, emissiveIntensity: 1.2 }), p, 0, G0 + 2.25, -0.2, 0.38, 0.1, 0.38);
    const smoke = []; const sm = new THREE.MeshStandardMaterial({ color: 0xdad6d0, transparent: true, opacity: 0.7, depthWrite: false });
    for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(GE.puff, sm.clone()); p.add(s); smoke.push(s); }
    anim.push(t => { lava.material.emissiveIntensity = 1 + Math.sin(t * 2) * 0.4; smoke.forEach((s, i) => { const k = (t * 0.22 + i / 4) % 1; s.position.set(Math.sin(k * 4 + i) * 0.3, G0 + 2.4 + k * 2.4, -0.2); s.scale.setScalar(0.2 + k * 0.5); s.material.opacity = 0.75 * (1 - k); }); });
    palm(p, 1.4, 1.0, 0.8); tree(p, -1.4, 0.9, 0x5f9e55, 0.8);
    [[3.3, 1.4, 0.8], [-3.2, 1.7, 0.9], [1.3, 3.3, 0.7]].forEach(([x, z, r]) => {
      P(new THREE.CylinderGeometry(r, r * 1.2, 0.6, 16), M(0xeedbb0), p, x, -0.22, z);
      P(new THREE.CylinderGeometry(r * 0.8, r * 0.9, 0.22, 16), M(0x7fb06a), p, x, 0.15, z);
      palm(p, x, z, 0.55);
    });
  },
];

const islands = IPOS.map((pos, m) => {
  const g = grp(null, pos.x, 0, pos.z); g.rotation.y = Math.atan2(HOME.x - pos.x, HOME.z - pos.z) * 0.35;
  islandBase(g, IR, [0x9ccf86, 0xa8c2a0, 0xf3d08e, 0x74bd6c, 0xa9cf8f, 0xb8b6ae, 0x8aa86a][m], [0xeedbb0, 0xe6dccb, 0xf5e2b5, 0xeedbb0, 0xeedbb0, 0xd9d2c0, 0xe4cfa4][m], m);
  DECO[m](g);
  const label = makeLabel(); label.position.set(pos.x, 4.6 + (m % 2) * 1.7, pos.z); scene.add(label);
  const fog = grp(null, pos.x, 0, pos.z);
  const fm = new THREE.MeshStandardMaterial({ color: 0xf6f9fa, roughness: 1, transparent: true, opacity: 0.62, depthWrite: false });
  for (let i = 0; i < 11; i++) {
    const a = i * 2.4, d = i === 0 ? 0 : 1 + (i % 3) * 0.75, s = 1.25 + ((i * 37) % 10) / 10;
    const pf = new THREE.Mesh(GE.puff, fm); pf.position.set(Math.cos(a) * d, 1 + (i % 4) * 0.55, Math.sin(a) * d); pf.scale.set(s * 1.2, s * 0.8, s); pf.userData.b = pf.position.clone(); pf.renderOrder = 5; fog.add(pf);
  }
  anim.push(t => fog.children.forEach((pf, i) => { pf.position.x = pf.userData.b.x + Math.sin(t * 0.4 + i) * 0.25; pf.position.y = pf.userData.b.y + Math.sin(t * 0.6 + i * 2) * 0.12; }));
  return { g, pos, label, fog, fm, fogV: 0.62, flag: null, rival: null, route: null };
});

/* ---------- Vàm Thịnh ---------- */
const home = grp(null, HOME.x, 0, HOME.z);
islandBase(home, 4.4, 0x8cc27a, 0xeedbb0, -2);
(() => {
  const hg = grp(home, -1.9, 0, -1.6);
  [[-0.85, -0.6], [0.85, -0.6], [-0.85, 0.6], [0.85, 0.6]].forEach(([x, z]) => P(GE.cyl, WOOD2, hg, x, G0 + 0.3, z, 0.07, 0.6, 0.07));
  P(GE.box, M(0x7a4f2c), hg, 0, G0 + 0.62, 0, 2.1, 0.08, 1.6);
  P(GE.box, M(0xf3e6c8), hg, 0, G0 + 1.15, 0, 1.9, 1, 1.4);
  const rf = P(GE.cone4, M(0xb5553a), hg, 0, G0 + 2.05, 0, 1.75, 0.9, 1.35); rf.rotation.y = Math.PI / 4;
  P(GE.box, M(0x6a4a3a), hg, 0, G0 + 1.0, 0.71, 0.4, 0.7, 0.02);
  [[-0.6, 0.71], [0.6, 0.71]].forEach(([x, z]) => P(GE.box, M(0x9fd4ef), hg, x, G0 + 1.25, z, 0.35, 0.3, 0.02));
  const sg = grp(home, 1.6, 0, -2.3); P(GE.cyl, WOOD2, sg, 0, G0 + 0.6, 0, 0.05, 1.2, 0.05);
  const sign = P(GE.box, M(0xfff4e0), sg, 0, G0 + 1.25, 0, 1.3, 0.5, 0.06);
  sign.material = new THREE.MeshStandardMaterial({ map: emojiTex('🌿 Mộc Nhiên', '#fff4e0', 512, 190, 64) });
  palm(home, 3.0, -1.4); palm(home, -3.3, 0.6, 0.9); tree(home, 2.4, -2.9, 0x6fb86a, 0.9); tree(home, -0.3, -3.3, 0x5f9e55, 0.8);
  P(GE.box, WOOD, home, 1.4, 0.12, 5.6, 1.2, 0.12, 3.4);
  for (let z = 4.4; z <= 7.2; z += 0.7) [0.85, 1.95].forEach(x => P(GE.cyl, WOOD2, home, x, -0.2, z, 0.07, 0.7, 0.07));
  const padM = M(0x5b9a4a), petM = M(0xf2a7bf), petM2 = M(0xf7c9d6);
  [[-1.4, 5.4, 0.5, 1], [-2.4, 6.3, 0.4, 0], [-0.6, 6.9, 0.45, 1], [3.2, 5.9, 0.5, 1], [4.2, 4.6, 0.38, 0], [2.9, 7.6, 0.4, 1], [-3.4, 4.8, 0.45, 1], [-1.8, 7.9, 0.35, 0], [4.8, 6.6, 0.42, 1]].forEach(([x, z, r, f]) => {
    P(GE.cyl, padM, home, x, -0.08, z, r, 0.04, r);
    if (f) for (let i = 0; i < 6; i++) { const a = i * 1.047, pt = P(GE.sph, i % 2 ? petM : petM2, home, x + Math.cos(a) * 0.14, 0.08, z + Math.sin(a) * 0.14, 0.09, 0.16, 0.06); pt.rotation.y = -a; pt.rotation.x = 0.5; }
  });
})();
const homeLabel = makeLabel(4); homeLabel.position.set(HOME.x, 4.6, HOME.z - 1.6); scene.add(homeLabel);

/* ---------- ban cố vấn ---------- */
const CAST_FALLBACK = [
  ['Bà Sáu Lành', 'ba-sau-lanh-cut'], ['Minh Khang', 'minh-khang-cut'], ['An Nhiên', 'an-nhien-cut'],
  ['Victor Lâm', 'victor-lam-cut'], ['Lina Park', 'lina-park-cut'], ['Lumina AI', 'lumina-vest-cut']];
const CLAY = makeBPCast(THREE); const clayAnim = [];
const bubbleTex = emojiTex('💬', null, 128, 128, 88);
const advisors = CAST_FALLBACK.map(([name, f], i) => {
  const g = grp(home, -2.9 + i * 1.16, G0, 1.5 + Math.sin(i / 5 * Math.PI) * 0.9);
  const sp = CLAY.build(CAST_IDS[name], 1.85); g.add(sp); blob(g, 0, 0, 0, 0.38);
  const bub = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleTex, depthTest: false, transparent: true })); bub.scale.set(0.55, 0.55, 1); bub.position.y = 1.75; bub.visible = false; bub.renderOrder = 21; g.add(bub);
  const say3 = makeLabel(4.6); say3.position.y = 2.55; say3.visible = false; g.add(say3);
  return { name, g, sp, bub, say3, talk: 0 };
});

/* ---------- thuyền sen ---------- */
function makeBoat(s = 1, sail = true) {
  const b = grp(); const body = grp(b);
  P(GE.cap, WOOD, body, 0, 0.12, 0, 0.36, 0.55, 0.42).rotation.z = Math.PI / 2;
  b.userData.hull = P(GE.box, M(0x2f6f7a), body, 0, 0.3, 0, 1.9, 0.07, 0.62).material;
  P(GE.box, M(0xc9a57a), body, 0, 0.36, 0, 1.7, 0.05, 0.5);
  if (sail) {
    P(GE.cyl, WOOD2, body, 0.05, 1.35, 0, 0.045, 2.0, 0.045);
    const sg = new THREE.PlaneGeometry(1.15, 1.45, 8, 8); const pa = sg.attributes.position;
    for (let i = 0; i < pa.count; i++) { const x = pa.getX(i); pa.setZ(i, Math.sin((x / 1.15 + 0.5) * Math.PI) * 0.22); }
    sg.computeVertexNormals();
    b.userData.sail = P(sg, M(0xf2a7bf, { side: THREE.DoubleSide }), body, -0.52, 1.45, 0).material;
    const petals = grp(body, 1.0, 0.45, 0);
    for (let i = 0; i < 5; i++) { const a = i * 1.256, pt = P(GE.sph, i % 2 ? M(0xf2a7bf) : M(0xf7c9d6), petals, Math.cos(a) * 0.1, 0.12, Math.sin(a) * 0.1, 0.1, 0.22, 0.07); pt.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); }
    P(GE.sph, M(0xf4d35e), petals, 0, 0.14, 0, 0.07);
    b.userData.flag = P(new THREE.PlaneGeometry(0.5, 0.3), M(0xfda127, { side: THREE.DoubleSide }), body, -0.2, 2.25, 0).material;
  }
  b.scale.setScalar(s); b.userData.body = body; return b;
}
const boat = makeBoat(1.1); const DOCK = new THREE.Vector3(HOME.x + 2.8, 0, HOME.z + 6.2);
boat.position.copy(DOCK); boat.rotation.y = Math.PI / 2;
const TEAM = ['ceo', 'cfo', 'cmo', 'coo', 'sec']; const landed = [];
let landMode = localStorage.getItem('bizon-bp3d-land') || 'ceo';
function landParty(I, quiet) {
  if (!quiet) sfx('cheer');
  if (I.party) { I.party.forEach(r => { I.g.remove(r); const k = landed.findIndex(o => o.r === r); if (k >= 0) landed.splice(k, 1); }); }
  const ids = landMode === 'team' ? TEAM : ['ceo'], n = ids.length, fx = IR * 0.5, fz = IR * 0.45;
  I.party = ids.map((id, k) => {
    const r = CLAY.build(id, n > 1 ? 1.15 : 1.35), a = n > 1 ? Math.PI * (0.35 + 0.75 * k / (n - 1)) : Math.PI * 0.6, rad = n > 1 ? 0.95 : 0.6;
    r.position.set(fx + Math.cos(a) * rad, G0, fz + Math.sin(a) * rad); r.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)) * 0.35 + 0.3;
    r.userData.s = r.scale.x; r.userData.pop = quiet ? 1 : -k * 0.18; r.scale.setScalar(quiet ? r.userData.s : 0.001); I.g.add(r);
    landed.push({ r, cheer: quiet ? 0 : 3.2 + k * 0.15 }); if (!quiet && k === 0) setTimeout(() => sfx('cheer'), 900); window.__bp3dScarf && window.__bp3dScarf(r); return r;
  });
}
const crew = ['ceo', 'cfo', 'cmo', 'coo', 'sec'].map((id, i) => { const c = CLAY.build(id, 0.95); c.position.set(0.85 - i * 0.36, 0.385, i % 2 ? 0.12 : -0.12); c.rotation.y = Math.PI / 2 + (i % 2 ? 0.35 : -0.35); boat.userData.body.add(c); return c; });
const wake = []; const wakeM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false });
for (let i = 0; i < 10; i++) { const w = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.34, 20), wakeM.clone()); w.rotation.x = -Math.PI / 2; w.position.y = -0.08; w.visible = false; w.userData.life = 1; scene.add(w); wake.push(w); }
let wakeI = 0, wakeAcc = 0;

/* ---------- vòng chọn ---------- */
const ring = new THREE.Mesh(new THREE.TorusGeometry(IR * 1.45, 0.09, 8, 60), new THREE.MeshBasicMaterial({ color: 0xfda127, transparent: true, opacity: 0.9 }));
ring.rotation.x = -Math.PI / 2; ring.position.y = 0.05; ring.visible = false; scene.add(ring);

/* ---------- cờ & tuyến ---------- */
const flagM = MODE_HEX.map((c, i) => {
  const m = new THREE.MeshStandardMaterial({ map: emojiTex(MODE_ICON[i], c), side: THREE.DoubleSide, roughness: 0.9 });
  m.onBeforeCompile = sh => { sh.uniforms.t = U.t; sh.vertexShader = 'uniform float t;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.z += sin(position.x*5.0 - t*6.0) * 0.09 * (position.x + 0.6);'); };
  m.customProgramCacheKey = () => 'bp3dFlag'; return m;
});
const flagGeo = new THREE.PlaneGeometry(1.2, 0.75, 14, 4);
function makeFlag(mode, par, x, z) {
  const g = grp(par, x, G0, z);
  P(GE.cyl, M(0xeeeeee), g, 0, 1.3, 0, 0.045, 2.6, 0.045); P(GE.sph, M(0xfda127), g, 0, 2.63, 0, 0.08);
  const cl = new THREE.Mesh(flagGeo, flagM[mode]); cl.castShadow = true; cl.position.set(0.62, 0.5, 0); g.add(cl);
  g.userData = { cl, raise: 0 }; return g;
}
const rivalM = new THREE.MeshStandardMaterial({ color: 0xc8372d, side: THREE.DoubleSide });
function makeRival(par, x, z, img) {
  const g = grp(par, x, G0, z);
  P(GE.cyl, M(0x444444), g, 0, 0.8, 0, 0.035, 1.6, 0.035);
  const tri = new THREE.Shape(); tri.moveTo(0, 0); tri.lineTo(0.7, -0.2); tri.lineTo(0, -0.4); tri.closePath();
  const pn = new THREE.Mesh(new THREE.ShapeGeometry(tri), rivalM); pn.position.set(0.03, 1.6, 0); pn.castShadow = true; g.add(pn);
  const kl = CLAY.build(RIVAL_ID, 1.5); kl.position.set(-0.45, 0, 0.1); g.add(kl); blob(g, -0.45, 0, 0.1, 0.3); clayAnim.push(kl);
  g.scale.setScalar(0.01); g.userData.grow = 0; return g;
}
const START = new THREE.Vector3(HOME.x, 0, HOME.z - 4.8);
function makeRoute(m, kind) {
  const E = IPOS[m].clone().add(HOME.clone().sub(IPOS[m]).setY(0).normalize().multiplyScalar(IR * 1.3));
  const mid = START.clone().lerp(E, 0.5); const side = new THREE.Vector3(-(E.z - START.z), 0, E.x - START.x).normalize().multiplyScalar(m % 2 ? 2 : -2);
  mid.add(side); mid.y = kind === 'sea' ? 0.02 : 6.5; const s = START.clone(), e = E.clone(); if (kind !== 'sea') { s.y = 0.8; e.y = 1.4; } else { s.y = e.y = 0.02; }
  const curve = new THREE.QuadraticBezierCurve3(s, mid, e);
  const g = grp();
  const n = 28, dots = new THREE.InstancedMesh(GE.sph, new THREE.MeshBasicMaterial({ color: kind === 'sea' ? 0xffffff : kind === 'air' ? 0xfdd79a : 0x9fe0f5, transparent: true, opacity: 0.85 }), n);
  const d = new THREE.Object3D();
  for (let i = 0; i < n; i++) { d.position.copy(curve.getPointAt(i / (n - 1))); d.scale.setScalar(kind === 'sea' ? 0.08 : 0.065); d.updateMatrix(); dots.setMatrixAt(i, d.matrix); }
  g.add(dots);
  let car;
  if (kind === 'sea') { car = makeBoat(0.45, false); P(GE.box, M([0xe8604c, 0x3aa0d8, 0xf2a73b][m % 3]), car.userData.body, 0, 0.62, 0, 0.9, 0.45, 0.5); }
  else if (kind === 'air') { car = grp(); P(GE.cap, M(0xffffff), car, 0, 0, 0, 0.13, 0.35, 0.13).rotation.z = Math.PI / 2; P(GE.box, M(0x2f8fcf), car, 0, 0, 0, 0.25, 0.04, 1.1); P(GE.box, M(0x2f8fcf), car, -0.45, 0.14, 0, 0.16, 0.24, 0.04); car.scale.setScalar(1.2); }
  else { car = new THREE.Mesh(GE.sph, new THREE.MeshStandardMaterial({ color: 0x9fe0f5, emissive: 0x3ab7e8, emissiveIntensity: 1.2 })); car.scale.setScalar(0.22); }
  g.add(car);
  g.userData = { curve, car, kind, m, dots, grow: 0 };
  dots.count = 0; return g;
}

/* ---------- hộ chiếu 3D ---------- */
const PW = 1.9, PH = 2.6;
const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { c, t, g: c.getContext('2d') }; };
const cover = mkCanvas(512, 700), inside = mkCanvas(512, 700), page = mkCanvas(512, 700);
const book = grp(cam, 0, -3.5, -4.2); book.rotation.x = -0.28; book.visible = false;
const edgeM = M(0xf4ecd8), shellM = M(0x0b4a55);
const pageBlock = new THREE.Mesh(new THREE.BoxGeometry(PW, PH, 0.08), [edgeM, edgeM, edgeM, edgeM, new THREE.MeshStandardMaterial({ map: page.t, roughness: 0.95 }), shellM]);
pageBlock.position.x = PW / 2; book.add(pageBlock);
const coverPivot = grp(book);
const coverMesh = new THREE.Mesh(new THREE.BoxGeometry(PW + 0.06, PH + 0.06, 0.05), [shellM, shellM, shellM, shellM, new THREE.MeshStandardMaterial({ map: cover.t, roughness: 0.7 }), new THREE.MeshStandardMaterial({ map: inside.t, roughness: 0.95 })]);
coverMesh.position.set(PW / 2 + 0.03, 0, 0.07); coverPivot.add(coverMesh);
const stampTool = grp(book); stampTool.visible = false;
const stampFace = P(GE.cyl, M(0xe8762d), stampTool, 0, 0, 0.06, 0.3, 0.12, 0.3); stampFace.rotation.x = Math.PI / 2;
P(GE.cyl, M(0xc98f52), stampTool, 0, 0, 0.18, 0.26, 0.12, 0.26).rotation.x = Math.PI / 2;
P(GE.cyl, M(0x7a4f2c), stampTool, 0, 0, 0.45, 0.09, 0.45, 0.09).rotation.x = Math.PI / 2;
P(GE.sph, M(0x7a4f2c), stampTool, 0, 0, 0.72, 0.17);
book.traverse(o => { o.castShadow = o.receiveShadow = false; });
const SLOTS = [[0.52, 0.86], [1.38, 0.86], [0.52, 0.26], [1.38, 0.26], [0.52, -0.34], [1.38, -0.34], [0.95, -0.94]];
const stamps = []; let shown = 0;
function firmInfo() { const B = window.__bp; const f = B && B.FIRMS ? B.FIRMS[B.S.firm] : null; return f || { icon: '🧴', name: 'Mộc Nhiên', prod: 'Mỹ phẩm thảo mộc', prodEn: 'Herbal cosmetics' }; }
function drawCover() {
  const { g, t } = cover, f = firmInfo();
  g.fillStyle = '#0b4a55'; g.fillRect(0, 0, 512, 700);
  g.strokeStyle = '#e9b54a'; g.lineWidth = 6; rr(g, 28, 28, 456, 644, 22); g.stroke(); g.lineWidth = 2; rr(g, 44, 44, 424, 612, 16); g.stroke();
  g.fillStyle = '#e9b54a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '800 52px ' + FONT; g.fillText('HỘ CHIẾU', 256, 130); g.font = '800 40px ' + FONT; g.fillText('THƯƠNG HIỆU', 256, 184);
  g.font = '700 24px ' + FONT; g.fillText('BRAND PASSPORT', 256, 228);
  g.lineWidth = 5; g.beginPath(); g.arc(256, 370, 84, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 8; i++) { g.save(); g.translate(256, 380); g.rotate(i * Math.PI / 4 - Math.PI / 2 * 0); g.beginPath(); g.ellipse(0, -34, 14, 36, 0, 0, Math.PI * 2); g.globalAlpha = 0.9; g.fill(); g.restore(); }
  g.globalAlpha = 1; g.fillStyle = '#0b4a55'; g.beginPath(); g.arc(256, 380, 16, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e9b54a'; g.font = '800 34px ' + FONT; g.fillText(f.name.toUpperCase(), 256, 520);
  g.font = '700 22px ' + FONT; g.fillText('Vàm Thịnh → ' + tr('Thế giới', 'the World'), 256, 566);
  g.font = '700 16px ' + FONT; g.globalAlpha = 0.7; g.fillText('BizOn Go Global · 2026', 256, 620); g.globalAlpha = 1;
  t.needsUpdate = true;
}
function paper(g) {
  g.fillStyle = '#fbf6ea'; g.fillRect(0, 0, 512, 700);
  g.strokeStyle = 'rgba(0,102,135,.07)'; g.lineWidth = 1;
  for (let y = 20; y < 700; y += 18) { g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(170, y - 8, 340, y + 8, 512, y); g.stroke(); }
  g.strokeStyle = 'rgba(0,102,135,.25)'; g.lineWidth = 2; g.strokeRect(18, 18, 476, 664);
}
function drawInside() {
  const { g, t } = inside, f = firmInfo(), B = window.__bp;
  paper(g); g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = '#006687';
  g.font = '800 22px ' + FONT; g.fillText(tr('TRANG THÔNG TIN', 'DATA PAGE'), 44, 70);
  g.fillStyle = 'rgba(0,102,135,.1)'; rr(g, 44, 96, 150, 180, 14); g.fill();
  g.font = '96px ' + FONT; g.textAlign = 'center'; g.fillStyle = '#033337'; g.fillText(f.icon, 119, 222);
  g.textAlign = 'left';
  const rows = [[tr('Thương hiệu', 'Brand'), f.name], [tr('Sản phẩm', 'Product'), tr(f.prod, f.prodEn || f.prod)], [tr('Nơi xuất phát', 'Home port'), 'Vàm Thịnh'],
    [tr('Quý hiện tại', 'Quarter'), B ? Math.min(6, B.S.q + 1) + '/6' : '1/6'], [tr('Dấu mộc', 'Stamps'), stamps.length + '/7']];
  rows.forEach(([k, v], i) => { const y = i < 2 ? 136 + i * 70 : 330 + (i - 2) * 72; const x = i < 2 ? 216 : 44;
    g.fillStyle = 'rgba(3,51,55,.55)'; g.font = '700 17px ' + FONT; g.fillText(k.toUpperCase(), x, y);
    g.fillStyle = '#033337'; g.font = '800 27px ' + FONT; g.fillText(v, x, y + 32); });
  g.fillStyle = 'rgba(3,51,55,.4)'; g.font = '600 15px monospace';
  g.fillText('P<VNM' + f.name.toUpperCase().replace(/[^A-Z]/g, '').padEnd(14, '<') + '<<<<<<<<', 44, 620);
  g.fillText('BIZON2026<<VAMTHINH<<GOGLOBAL<<<<', 44, 646);
  t.needsUpdate = true;
}
function drawStamp(g, s, i) {
  const [sx, sy] = SLOTS[i], cx = sx / PW * 512, cy = (PH / 2 - sy) / PH * 700, col = MODE_HEX[s.mode] || '#006687';
  g.save(); g.translate(cx, cy); g.rotate(((s.m * 37) % 20 - 10) * Math.PI / 180);
  g.globalAlpha = 0.86; g.strokeStyle = col; g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (i % 2) { g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 92, 0, Math.PI * 2); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 80, 0, Math.PI * 2); g.stroke(); }
  else { g.lineWidth = 6; rr(g, -96, -72, 192, 144, 16); g.stroke(); g.lineWidth = 2; rr(g, -86, -62, 172, 124, 10); g.stroke(); }
  g.font = '44px ' + FONT; g.fillText(MK[s.m].icon, 0, -26);
  g.font = '800 24px ' + FONT; g.fillText(MK[s.m].name.toUpperCase(), 0, 16);
  g.font = '700 16px ' + FONT; g.fillText(tr('QUÝ ', 'Q') + s.q + ' · ' + MODE_ICON[s.mode], 0, 44);
  g.restore(); g.globalAlpha = 1;
}
function drawPage() {
  const { g, t } = page; paper(g);
  g.fillStyle = 'rgba(0,102,135,.45)'; g.font = '800 18px ' + FONT; g.textAlign = 'right'; g.fillText(tr('THỊ THỰC · VISAS', 'VISAS'), 488, 52);
  if (!shown) { g.textAlign = 'center'; g.fillStyle = 'rgba(3,51,55,.35)'; g.font = '700 22px ' + FONT; g.fillText(tr('Chưa có dấu mộc nào', 'No stamps yet'), 256, 350); }
  for (let i = 0; i < shown; i++) drawStamp(g, stamps[i], i);
  t.needsUpdate = true;
}
const PP = { mode: 'idle', t: 0, lift: 0, open: 0, queue: [], applied: false, cur: -1, justStamped: false };
function queueStamp(idx) { PP.queue.push(idx); if (PP.mode !== 'stamp') { PP.justStamped = true; nextStamp(); } }
function nextStamp() {
  if (!PP.queue.length) {
    PP.mode = 'idle';
    if (PP.justStamped) { PP.justStamped = false; setTimeout(() => openPassportModal('page'), 900); }
    return;
  }
  PP.cur = PP.queue.shift(); PP.mode = 'stamp'; PP.t = 0; PP.applied = false;
  const [sx, sy] = SLOTS[PP.cur]; stampTool.position.set(sx, sy, 1.6); stampFace.material = M(new THREE.Color(MODE_HEX[stamps[PP.cur].mode]).getHex());
  drawInside();
}
function stampBurst(sx, sy) {
  const n = 16, geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = sx; pos[i * 3 + 1] = sy; pos[i * 3 + 2] = 0.22; }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xe9b54a, size: 0.07, transparent: true, opacity: 1, depthWrite: false });
  const pts = new THREE.Points(geo, mat); book.add(pts);
  const dirs = Array.from({ length: n }, () => [(Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5]);
  let t0 = null;
  const fn = t => {
    if (t0 === null) t0 = t;
    const k = Math.min(1, (t - t0) / 0.65);
    if (k >= 1) { book.remove(pts); geo.dispose(); mat.dispose(); const idx = anim.indexOf(fn); if (idx >= 0) anim.splice(idx, 1); return; }
    for (let i = 0; i < n; i++) { pos[i * 3] = sx + dirs[i][0] * k; pos[i * 3 + 1] = sy + dirs[i][1] * k + k * k * 0.35; pos[i * 3 + 2] = 0.22; }
    geo.attributes.position.needsUpdate = true; mat.opacity = 1 - k;
  };
  anim.push(fn);
}
let shake = 0, AC;
function thump() {
  if (window.__bp3dMute) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t = AC.currentTime;
    const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.18);
    g.gain.setValueAtTime(0.45, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.26); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + 0.3);
  } catch (e) {}
}
const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
const approach = (v, to, d) => v < to ? Math.min(to, v + d) : Math.max(to, v - d);
function updatePassport(dt) {
  let liftT = 0, openT = 0;
  if (PP.mode === 'stamp') {
    PP.t += dt; const t = PP.t;
    liftT = t < 4.6 ? 1 : 0; openT = t > 0.45 && t < 4.1 ? 1 : 0;
    if (t > 1.1 && t < 2.4) {
      stampTool.visible = true;
      stampTool.position.z = t < 1.7 ? 1.6 - (1.6 - 0.1) * ease((t - 1.1) / 0.6) ** 2 : 0.1 + 1.5 * ease((t - 1.75) / 0.6);
    } else stampTool.visible = false;
    if (t >= 1.7 && !PP.applied) {
      PP.applied = true; shown = Math.max(shown, PP.cur + 1); drawPage(); drawInside(); thump(); shake = 0.35;
      const [bx, by] = SLOTS[PP.cur]; stampBurst(bx, by);
      say('🛂 ' + tr('Đóng dấu mộc ', 'Stamped: ') + MK[stamps[PP.cur].m].name);
    }
    if (t > 5.3) nextStamp();
  } else if (PP.mode === 'view') { liftT = 1; openT = 1; }
  PP.lift = approach(PP.lift, liftT, dt * 2.2); PP.open = approach(PP.open, openT, dt * 1.8);
  book.visible = PP.lift > 0.001;
  const a = cam.aspect, visH = 2 * Math.tan(21 * Math.PI / 180) * 4.2, s = Math.min(1, visH * a * 0.9 / (PW * 2.3), visH * 0.8 / PH);
  book.scale.setScalar(s);
  book.position.set(0, -0.1 - (1 - ease(PP.lift)) * 3.6, -4.2);
  coverPivot.rotation.y = -Math.PI * ease(PP.open);
  book.position.x = -PW * s * 0.5 * (1 - ease(PP.open)) * 0 - 0 + (ease(PP.open) - 1) * (PW * s / 2) + 0;
}

/* ---------- hộ chiếu – màn hình lớn (2D, ngoài cảnh 3D) ---------- */
let ppPage = 'cover', ppMounted = false;
function mountPPCanvases() {
  if (ppMounted) return; const mount = $('bp-pp-pages'); if (!mount) return;
  cover.c.id = 'bp-pp-cover'; inside.c.id = 'bp-pp-inside'; page.c.id = 'bp-pp-page';
  mount.append(cover.c, inside.c, page.c); ppMounted = true;
}
function showPPPage(p) {
  ppPage = p;
  [[cover.c, 'cover'], [inside.c, 'inside'], [page.c, 'page']].forEach(([el, key]) => el.classList.toggle('on', key === p));
  document.querySelectorAll('#bp-pp-modal .bp-pp-nav button[data-pg]').forEach(b => b.classList.toggle('on', b.dataset.pg === p));
}
function openPassportModal(pg) {
  drawCover(); drawInside(); drawPage(); mountPPCanvases(); showPPPage(pg || ppPage);
  const m = $('bp-pp-modal'); if (m) m.classList.add('on');
}
document.querySelectorAll('#bp-pp-modal .bp-pp-nav button[data-pg]').forEach(b => b.addEventListener('click', () => showPPPage(b.dataset.pg)));
$('bp-pp-close') && $('bp-pp-close').addEventListener('click', () => { const m = $('bp-pp-modal'); if (m) m.classList.remove('on'); });

/* ---------- bản đồ thị trường – tổng quan 2D ---------- */
function renderMarketMap() {
  const B = window.__bp; if (!B || !B.S) return;
  const isDark = document.documentElement.dataset.theme === 'dark';
  const S = B.S, MKTS = B.MKTS, ANGLES = [165, 140, 115, 90, 65, 40, 15];
  const cx = 480, baseY = 520, Rx = 410, Ry = 300;
  const pts = ANGLES.map(a => { const r = a * Math.PI / 180; return [cx + Math.cos(r) * Rx, baseY - Math.sin(r) * Ry]; });
  const seaFrom = isDark ? '#123a45' : '#bfe6ee', seaTo = isDark ? '#0a232b' : '#7fc3d2';
  const txt = isDark ? '#d6ecf0' : '#033337', sub = isDark ? 'rgba(214,236,240,.62)' : 'rgba(3,51,55,.55)';
  let svg = '<svg viewBox="0 0 960 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + tr('Bản đồ thị trường', 'Market map') + '">';
  svg += '<defs><radialGradient id="bpmSea" cx="50%" cy="25%" r="85%"><stop offset="0%" stop-color="' + seaFrom + '"/><stop offset="100%" stop-color="' + seaTo + '"/></radialGradient></defs>';
  svg += '<rect x="0" y="0" width="960" height="600" rx="28" fill="url(#bpmSea)"/>';
  for (let y = 44; y < 600; y += 48) svg += '<path d="M-10,' + y + ' q80,-15 160,0 t160,0 t160,0 t160,0 t160,0" stroke="' + (isDark ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.4)') + '" stroke-width="3" fill="none"/>';
  pts.forEach(([x, y], m) => {
    const md = S.entered[m]; if (md === null || md === undefined) return;
    const col = MODE_HEX[md];
    svg += '<path d="M' + cx + ',' + baseY + ' Q' + ((cx + x) / 2) + ',' + ((baseY + y) / 2 - 46) + ' ' + x + ',' + y + '" fill="none" stroke="' + col + '" stroke-width="4" stroke-dasharray="2 11" stroke-linecap="round"/>';
  });
  svg += '<g transform="translate(' + cx + ',' + baseY + ')"><circle r="50" fill="' + (isDark ? '#0e2a33' : '#fffaf0') + '" stroke="#e8762d" stroke-width="4"/>' +
    '<text y="-6" font-size="34" text-anchor="middle">🏡</text><text y="26" font-size="15" font-weight="800" text-anchor="middle" fill="' + txt + '" font-family="' + FONT + '">Vàm Thịnh</text></g>';
  pts.forEach(([x, y], m) => {
    const md = S.entered[m], entered = md !== null && md !== undefined, mk = MKTS[m];
    const ringCol = entered ? MODE_HEX[md] : (isDark ? '#3a5a63' : '#c7d6da');
    svg += '<g transform="translate(' + x + ',' + y + ')">' +
      '<clipPath id="bpmClip' + m + '"><circle r="50"/></clipPath>' +
      '<circle r="56" fill="none" stroke="' + ringCol + '" stroke-width="' + (entered ? 5 : 3) + '"' + (entered ? '' : ' stroke-dasharray="3 7"') + '/>' +
      '<image href="' + mk.img + '" x="-50" y="-50" width="100" height="100" clip-path="url(#bpmClip' + m + ')" preserveAspectRatio="xMidYMid slice" style="filter:' + (entered ? 'none' : (isDark ? 'grayscale(1) brightness(.55)' : 'grayscale(1) brightness(.92) opacity(.8)')) + '"/>' +
      (entered ? '<text x="38" y="-34" font-size="24">' + MODE_ICON[md] + '</text>' : '') +
      '<text y="80" font-size="17" font-weight="800" text-anchor="middle" fill="' + txt + '" font-family="' + FONT + '">' + mk.icon + ' ' + mk.name + '</text>' +
      '<text y="100" font-size="11" font-weight="700" text-anchor="middle" fill="' + sub + '" font-family="' + FONT + '">' + (entered ? tr('Đã thâm nhập', 'Entered') : tr('Chưa thâm nhập', 'Not entered')) + '</text>' +
      '</g>';
  });
  svg += '</svg>';
  const mount = $('bp-map-svg'); if (mount) mount.innerHTML = svg;
  const enteredCount = S.entered.filter(v => v !== null && v !== undefined).length;
  const legend = $('bp-map-legend');
  if (legend) legend.innerHTML = '<span><b>' + enteredCount + '/7</b> ' + tr('thị trường đã thâm nhập', 'markets entered') + '</span>' +
    MODE_ICON.map((ic, i) => '<span><i style="background:' + MODE_HEX[i] + '"></i>' + ic + ' ' + tr(['Nền tảng số', 'Xuất khẩu trực tiếp', 'Đối tác địa phương'][i], ['Digital platform', 'Direct export', 'Local partner'][i]) + '</span>').join('');
}
$('bp3d-map') && $('bp3d-map').addEventListener('click', () => { renderMarketMap(); const m = $('bp-map-modal'); if (m) m.classList.add('on'); });
$('bp-map-close') && $('bp-map-close').addEventListener('click', () => { const m = $('bp-map-modal'); if (m) m.classList.remove('on'); });

/* ---------- hồ sơ đối thủ – tổng hợp Kim Long trên cả 7 thị trường ---------- */
function renderRivalDossier() {
  const B = window.__bp; if (!B || !B.S) return;
  const isDark = document.documentElement.dataset.theme === 'dark';
  const S = B.S, MKTS = B.MKTS, RIVAL = B.RIVAL || { name: 'Kim Long Exports', icon: '🐉' };
  const mine = S.profit || 0, theirs = (S.rival && S.rival.rev) || 0, max = Math.max(mine, theirs, 1);
  const barCol = isDark ? '#5cc4e6' : '#033337', rivalCol = '#e8762d';
  let html = '<div class="bp-rival-head">' +
    (RIVAL.img ? '<img src="' + RIVAL.img + '" alt="">' : '<span style="font-size:40px">' + RIVAL.icon + '</span>') +
    '<div><b>' + RIVAL.icon + ' ' + RIVAL.name + '</b><span>' + (mine >= theirs ?
      tr('Bạn đang dẫn trước trong cuộc đua doanh thu', "You're leading the revenue race") :
      tr('Đối thủ đang dẫn trước – tăng tốc thôi!', "The rival is ahead – time to catch up!")) + '</span></div></div>';
  html += '<div class="bp-rival-race">' +
    '<div class="bp-rival-bar-row"><span>🏢 ' + tr('Bạn', 'You') + '</span><div class="bp-rival-bar-track"><div class="bp-rival-bar-fill" style="width:' + Math.max(4, mine / max * 100) + '%;background:' + barCol + '"></div></div><span>' + f1(mine) + tr(' tỷ', ' bn') + '</span></div>' +
    '<div class="bp-rival-bar-row"><span>' + RIVAL.icon + ' ' + tr('Đối thủ', 'Rival') + '</span><div class="bp-rival-bar-track"><div class="bp-rival-bar-fill" style="width:' + Math.max(4, theirs / max * 100) + '%;background:' + rivalCol + '"></div></div><span>' + f1(theirs) + tr(' tỷ', ' bn') + '</span></div>' +
    '</div>';
  const rivalIn = (S.rival && S.rival.in) || [];
  html += '<div class="bp-rival-mkts">' + MKTS.map((mk, m) => {
    const inHere = rivalIn.indexOf(m) >= 0, myHere = S.entered[m] !== null && S.entered[m] !== undefined;
    const qn = inHere && S.rival.qin ? (S.rival.qin[m] || 0) : 0;
    const status = inHere ? ('🐉 Q' + qn + (B.rivalAttr ? ' · ' + f1(B.rivalAttr(m)) + tr(' tỷ', ' bn') : '') + (myHere ? ' · ⚔️' : '')) : tr('chưa có mặt', 'not present');
    return '<div class="bp-rival-mkt' + (inHere ? ' in' : '') + '"><span>' + mk.icon + '</span><span class="nm">' + mk.name + '</span><span class="st" style="color:' + (inHere ? rivalCol : (isDark ? 'rgba(214,236,240,.45)' : 'rgba(3,51,55,.4)')) + '">' + status + '</span></div>';
  }).join('') + '</div>';
  const sharedCount = rivalIn.filter(m => S.entered[m] !== null && S.entered[m] !== undefined).length;
  html += '<p class="bp-rival-note">' + (rivalIn.length === 0 ?
    tr('Kim Long chưa mở thị trường nào – đây là lúc tốt để đi trước.', "Kim Long hasn't entered any market yet – a good time to move first.") :
    sharedCount > 0 ?
      tr('Đang chung ' + sharedCount + ' thị trường với Kim Long – đấu giá trực diện tốn kém, khác biệt hoá hoặc liên minh địa phương thường bền hơn.', 'Sharing ' + sharedCount + ' market(s) with Kim Long – a head-on price fight is costly; differentiation or local alliances usually last longer.') :
      tr('Kim Long đã có mặt ở ' + rivalIn.length + ' thị trường nhưng chưa đụng bạn trực tiếp – theo dõi để chọn thời điểm thâm nhập.', 'Kim Long is in ' + rivalIn.length + ' market(s) but not head-to-head with you yet – watch and time your entry.')) + '</p>';
  const mount = $('bp-rival-body'); if (mount) mount.innerHTML = html;
}
$('bp3d-rival') && $('bp3d-rival').addEventListener('click', () => { renderRivalDossier(); const m = $('bp-rival-modal'); if (m) m.classList.add('on'); });
$('bp-rival-close') && $('bp-rival-close').addEventListener('click', () => { const m = $('bp-rival-modal'); if (m) m.classList.remove('on'); });

/* ---------- sân lễ: radar & giấy chứng nhận ---------- */
const stage = grp(null, END.x, -4, END.z); stage.visible = false;
P(new THREE.CylinderGeometry(3.9, 4.3, 0.7, 36), M(0xeedbb0), stage, 0, -0.2, 0); P(new THREE.CylinderGeometry(3.6, 3.7, 0.2, 36), M(0xc98f52), stage, 0, 0.22, 0);
const radar = grp(stage, -1.6, 2.5, 0.2); radar.rotation.x = -0.18; radar.rotation.y = 0.2;
P(new THREE.CylinderGeometry(2.25, 2.25, 0.1, 40), M(0xfffaf0), radar, 0, 0, -0.08).rotation.x = Math.PI / 2;
P(GE.cyl, WOOD2, stage, -1.6, 0.9, 0.1, 0.09, 1.4, 0.09);
const RR = 1.7, AX = [0, 1, 2, 3, 4].map(k => Math.PI / 2 + k * 2 * Math.PI / 5);
const lineM = new THREE.LineBasicMaterial({ color: 0x006687, transparent: true, opacity: 0.35 });
[0.25, 0.5, 0.75, 1].forEach(f => { const pts = AX.map(a => new THREE.Vector3(Math.cos(a) * RR * f, Math.sin(a) * RR * f, 0)); const l = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), lineM); radar.add(l); });
AX.forEach(a => radar.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(Math.cos(a) * RR, Math.sin(a) * RR, 0)]), lineM)));
let radarMesh = null, radarVals = [0, 0, 0, 0, 0], endT = -1;
const radarMat = new THREE.MeshStandardMaterial({ color: 0xfda127, roughness: 0.6, transparent: true, opacity: 0.92 });
const radarLabels = AX.map(() => { const l = makeLabel(1.9); radar.add(l); return l; });
const totalLabel = makeLabel(2.4); totalLabel.position.set(0, 2.3, 0.1); radar.add(totalLabel);
function buildRadar(k) {
  if (radarMesh) { radar.remove(radarMesh); radarMesh.geometry.dispose(); }
  const sh = new THREE.Shape(); AX.forEach((a, i) => { const r = Math.max(0.04, radarVals[i] / 100 * k) * RR; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); });
  radarMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), radarMat); radarMesh.castShadow = true; radar.add(radarMesh);
}
const easel = grp(stage, 1.9, 0, 0.1); easel.rotation.y = -0.28;
[[-0.9, 0.2], [0.9, 0.2]].forEach(([x, z]) => { const l = P(GE.box, WOOD2, easel, x, 1.4, z, 0.1, 2.9, 0.1); l.rotation.x = -0.12; });
P(GE.box, WOOD2, easel, 0, 1.3, -0.35, 0.1, 2.6, 0.1).rotation.x = 0.35;
const cert = mkCanvas(1024, 720);
const certBoard = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.9, 0.06), [M(0xc98f52), M(0xc98f52), M(0xc98f52), M(0xc98f52), new THREE.MeshStandardMaterial({ map: cert.t, roughness: 0.9 }), M(0xc98f52)]);
certBoard.position.set(0, 2.25, 0.32); certBoard.rotation.x = -0.12; certBoard.castShadow = true; easel.add(certBoard);
const sigs = ['assets/docs/sig-huong.png', 'assets/docs/sig-tu.png'].map(src => { const im = new Image(); im.onload = () => endT >= 0 && drawCert(); im.src = src; return im; });
function wrapText(g, txt, x, y, mw, lh) { const w = txt.split(' '); let line = ''; for (const wd of w) { const t = line ? line + ' ' + wd : wd; if (g.measureText(t).width > mw && line) { g.fillText(line, x, y); line = wd; y += lh; } else line = t; } g.fillText(line, x, y); }
function drawCert() {
  const { g, t } = cert, W = 1024, H = 720, B = window.__bp, f = firmInfo(), sc = B ? B.scores() : { total: 0 };
  const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#fffdf6'); grd.addColorStop(1, '#f1f8fb'); g.fillStyle = grd; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#fda127'; g.lineWidth = 16; g.strokeRect(18, 18, W - 36, H - 36); g.strokeStyle = 'rgba(0,102,135,.3)'; g.lineWidth = 3; g.strokeRect(42, 42, W - 84, H - 84);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.fillStyle = 'rgba(3,51,55,.55)'; g.font = '800 24px ' + FONT; g.fillText(tr('🎓 GIẤY CHỨNG NHẬN HOÀN THÀNH', '🎓 CERTIFICATE OF COMPLETION'), W / 2, 104);
  g.fillStyle = '#033337'; g.font = '800 46px ' + FONT; g.fillText('CERTIFICATE OF COMPLETION', W / 2, 160);
  g.fillStyle = '#006687'; g.font = '700 24px ' + FONT; g.fillText('Hộ Chiếu Thương Hiệu · Brand Passport', W / 2, 200);
  g.fillStyle = 'rgba(3,51,55,.6)'; g.font = 'italic 600 22px ' + FONT; g.fillText(tr('Trao cho', 'Awarded to'), W / 2, 252);
  const inp = $('bp-name'), nm = (inp && inp.value.trim()) || ($('bp-cert-name') && $('bp-cert-name').textContent.trim() !== '–' && $('bp-cert-name').textContent.trim()) || tr('Nhà điều hành ' + f.name, f.name + ' Operator');
  g.fillStyle = '#006687'; g.font = '800 58px ' + FONT; g.fillText(nm, W / 2, 322);
  g.strokeStyle = 'rgba(253,161,39,.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(W / 2 - 260, 344); g.lineTo(W / 2 + 260, 344); g.stroke();
  const title = ($('bp-title') && $('bp-title').textContent.trim()) || '';
  g.fillStyle = 'rgba(3,51,55,.78)'; g.font = '700 23px ' + FONT;
  wrapText(g, tr('Đưa ' + f.name + ' từ Vàm Thịnh ra ' + stamps.length + ' thị trường qua 6 quý', 'Took ' + f.name + ' from Vàm Thịnh to ' + stamps.length + ' markets over 6 quarters') + ' · ' + tr('Điểm tổng', 'Total') + ' ' + sc.total + '/100' + (title ? ' · ' + title : ''), W / 2, 388, 760, 32);
  [[250, sigs[0], 'NCS. Đỗ Thùy Hương', 'Founder & Project Lead'], [774, sigs[1], 'PGS.TS. Phan Anh Tú', 'Co-founder & Chief Academic Advisor']].forEach(([x, im, n, r]) => {
    if (im.complete && im.naturalWidth) { const h = 70, w = h * im.naturalWidth / im.naturalHeight; g.drawImage(im, x - w / 2, 496, w, h); }
    g.strokeStyle = 'rgba(3,51,55,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 150, 576); g.lineTo(x + 150, 576); g.stroke();
    g.fillStyle = '#033337'; g.font = '800 20px ' + FONT; g.fillText(n, x, 604); g.fillStyle = 'rgba(3,51,55,.55)'; g.font = '700 15px ' + FONT; g.fillText(r, x, 628);
  });
  g.save(); g.translate(W / 2, 560); g.rotate(0.2); g.strokeStyle = '#e8762d'; g.fillStyle = 'rgba(253,161,39,.14)'; g.lineWidth = 4; g.setLineDash([8, 6]);
  g.beginPath(); g.arc(0, 0, 66, 0, Math.PI * 2); g.fill(); g.stroke(); g.setLineDash([]);
  g.fillStyle = '#e8762d'; g.font = '800 15px ' + FONT; g.fillText('OFFICIAL', 0, -18); g.font = '800 28px ' + FONT; g.fillText('BizOn', 0, 14); g.font = '800 18px ' + FONT; g.fillText('✓', 0, 40); g.restore();
  g.fillStyle = 'rgba(3,51,55,.45)'; g.font = '700 16px ' + FONT; g.fillText(new Date().toLocaleDateString(EN() ? 'en-GB' : 'vi-VN'), W / 2, 680);
  t.needsUpdate = true;
}
let certTimer; document.addEventListener('input', e => { if (e.target && e.target.id === 'bp-name' && endT >= 0) { clearTimeout(certTimer); certTimer = setTimeout(drawCert, 200); } });
function startEnd() {
  const B = window.__bp; if (!B) return; const sc = B.scores();
  radarVals = [sc.p, sc.r, sc.c, sc.a, sc.s];
  const names = [['💹', tr('Lợi nhuận', 'Profit')], ['⭐', tr('Uy tín', 'Reputation')], ['🏭', tr('Năng lực', 'Capability')], ['🤸', tr('Thích ứng', 'Adaptability')], ['🌱', tr('Bền vững', 'Sustainability')]];
  radarLabels.forEach((l, i) => { l.position.set(Math.cos(AX[i]) * (RR + 0.55), Math.sin(AX[i]) * (RR + 0.55) - 0.25, 0.2); l.userData.set(names[i][0] + ' ' + radarVals[i], names[i][1], '#006687'); });
  totalLabel.userData.set(sc.total + '/100', tr('Điểm tổng', 'Total score'), '#e8762d');
  stage.visible = true; endT = 0; buildRadar(0); drawCert();
}

/* ---------- chú thích ---------- */
const cap = $('bp3d-cap'); let capT;
function say(msg, ms = 3400) { if (!cap) return; cap.textContent = msg; cap.classList.add('on'); clearTimeout(capT); capT = setTimeout(() => cap.classList.remove('on'), ms); }

/* ---------- camera ---------- */
let camKey = 'ov', userKey = null;
const goalP = new THREE.Vector3(), goalT = new THREE.Vector3();
function camGoal(key, t) {
  const a = cam.aspect, k = a < 1 ? Math.pow(1 / a, 0.85) : 1;
  let T, dir, d;
  if (key === 'ov' || key === 'intro') {
    T = new THREE.Vector3(0, 0, 0.5); const sw = key === 'intro' ? Math.sin(t * 0.08) * 0.3 : 0;
    dir = new THREE.Vector3(Math.sin(sw), 1.15, Math.cos(sw)).normalize(); d = fitDist(T, new THREE.Vector3(0, 1.15, 1).normalize());
  } else if (key === 'home') { T = HOME.clone().add(new THREE.Vector3(0, 1, 1)); d = 15 * k; dir = new THREE.Vector3(0.15, 0.6, 1); }
  else if (key === 'end') { T = END.clone().add(new THREE.Vector3(0, 2, 0)); d = 12.5 * k; dir = new THREE.Vector3(0, 0.32, 1); }
  else { const m = +key.slice(1), p = IPOS[m]; T = p.clone().setY(1.2); d = 14.5 * k; dir = HOME.clone().sub(p).setY(0).normalize().setY(0.85); }
  goalT.copy(T); goalP.copy(T).add(dir.normalize().multiplyScalar(d));
}

/* ---------- đồng bộ với game ---------- */
const seen = { entered: Array(7).fill(null), rival: new Set(), cleared: Array(7).fill(false), intro: true, ended: false };
function sync(t) {
  const B = window.__bp; if (!B) return; const S = B.S;
  if (sync.ph !== S.phase) { sync.ph = S.phase; const ab = $('bp3d-act'); if (ab) ab.hidden = true; }
  const introEl = $('bp-intro'), endEl = $('bp-end');
  const intro = introEl && !introEl.classList.contains('hidden'), ended = endEl && !endEl.classList.contains('hidden');
  document.body.classList.toggle('bp3d-playing', !intro);
  const justStarted = seen.intro && !intro; seen.intro = intro;
  if (justStarted) { drawCover(); drawInside(); if (!ended) say('⛵ ' + tr('Thuyền sen rời bến Vàm Thịnh', 'The lotus boat leaves Vàm Thịnh'), 3800); }
  homeLabel.userData.set('🏡 Vàm Thịnh', '', '#e8762d');
  let key = intro ? 'intro' : ended ? 'end' : S.phase === 'dec' && S.sel && S.sel.enter !== null ? 'm' + S.sel.enter : S.phase === 'evt' ? 'home' : 'ov';
  // Thâm nhập → cờ, tuyến, dấu mộc
  for (let m = 0; m < 7; m++) {
    const md = S.entered[m], I = islands[m];
    if (md !== null && md !== undefined && seen.entered[m] === null) {
      seen.entered[m] = md;
      const q = justStarted ? Math.max(1, S.q + 1 - (S.qin[m] || 0)) : Math.min(6, S.q + 1);
      stamps.push({ m, q, mode: md });
      I.flag = makeFlag(md, I.g, IR * 0.5, IR * 0.45);
      landParty(I, justStarted);
      const kind = md === 0 ? 'data' : (S.ship && S.ship[m] === 1) ? 'air' : 'sea';
      I.route = makeRoute(m, kind); I.routeKind = kind;
      if (justStarted) { I.flag.userData.raise = 1; I.route.userData.grow = 1; shown = stamps.length; }
      else { queueStamp(stamps.length - 1); say('🚩 ' + MK[m].name + ' · ' + MODE_ICON[md]); }
    } else if (I.route && md !== null) {
      const kind = md === 0 ? 'data' : (S.ship && S.ship[m] === 1) ? 'air' : 'sea';
      if (kind !== I.routeKind) { scene.remove(I.route); I.route = makeRoute(m, kind); I.route.userData.grow = 1; I.routeKind = kind; }
    }
    // Sương mù thông tin
    const kn = S.know[m] || 0, target = kn >= 60 ? 0 : THREE.MathUtils.clamp((60 - kn) / 50, 0.1, 0.62);
    I.fogT = target;
    if (kn >= 60 && !seen.cleared[m]) { seen.cleared[m] = true; if (!justStarted && !intro) say('🌤️ ' + tr('Sương mù tan ở ', 'Fog lifts over ') + MK[m].name); }
    // Đối thủ
    if (S.rival && S.rival.in.indexOf(m) >= 0 && !seen.rival.has(m)) {
      seen.rival.add(m); I.rival = makeRival(I.g, -IR * 0.55, IR * 0.35, B.RIVAL && B.RIVAL.img);
      if (!justStarted) say((B.RIVAL ? B.RIVAL.icon + ' ' + B.RIVAL.name : '⚔️') + tr(' đổ bộ ', ' lands in ') + MK[m].name);
    }
    if (md !== null && md !== undefined && I.rival && !I.duel) {
      I.duel = duelFx(I); I.rival.rotation.y = Math.PI / 2;
      if (!justStarted) { setTimeout(() => window.__bp3dDuel && window.__bp3dDuel(m), 1600); sfx('clash'); say('⚔️ ' + tr('Đối đầu ', 'Face-off with ') + (B.RIVAL ? B.RIVAL.name : 'Kim Long') + tr(' tại ', ' in ') + MK[m].name, 4200); }
    }
    const st = md !== null && md !== undefined ? MODE_ICON[md] + ' ' + tr('đã vào', 'entered') : kn >= 60 ? '🌤️ ' + tr('đã rõ', 'clear') : '🌫️ ' + tr('tri thức ', 'intel ') + kn + '%';
    const vk = userKey || key, far = vk === 'ov' || vk === 'intro';
    I.label.userData.set(MK[m].icon + ' ' + MK[m].name, far ? '' : st + (S.rival && S.rival.in.indexOf(m) >= 0 ? ' · ⚔️' : ''), md !== null && md !== undefined ? MODE_HEX[md] : MK[m].c);
  }
  
  // Cố vấn đang lên tiếng
  const talking = new Set(Array.prototype.map.call(document.querySelectorAll('#bp-stage .bp-adv .who'), e => e.textContent.trim()));
  const lines = {}; document.querySelectorAll('#bp-stage .bp-adv').forEach(el => { const w = el.querySelector('.who'); if (!w) return; const n = w.textContent.trim(); if (lines[n]) return; const p = w.nextElementSibling; let s = p ? p.textContent.trim().replace(/\s+/g, ' ') : ''; if (s.length > 40) s = s.slice(0, 38).replace(/\s\S*$/, '') + '…'; lines[n] = s; });
  const near = camKey === 'home' || userKey === 'home'; const tk = advisors.filter(a => talking.has(a.name) && lines[a.name]); const pick = tk.length ? tk[Math.floor(t / 3.5) % tk.length] : null;
  advisors.forEach(a => { a.talk = talking.has(a.name) ? 1 : 0; const cv = window.__bp3dConvo && window.__bp3dConvo(); if (cv && a.name === cv.who) a.talk = 1; const txt = cv ? (a.name === cv.who && cv.short) : (near && a === pick && lines[a.name]);
    a.say3.visible = !!txt; if (txt) a.say3.userData.set('💬 ' + a.name, cv ? cv.short : lines[a.name], '#e8762d');
    a.bub.visible = !!a.talk && !txt; });
  // Camera & thuyền
  if (key !== camKey) { camKey = key; userKey = null; autoCam = true; }
  ring.visible = !intro && !ended && S.phase === 'dec' && S.sel && S.sel.enter !== null;
  if (ring.visible) ring.position.set(IPOS[S.sel.enter].x, 0.05, IPOS[S.sel.enter].z);
  if (ended && !seen.ended) { seen.ended = true; startEnd(); }
  if (!intro) try {
    const f = firmInfo(), snap = JSON.stringify({ firm: { name: f.name, icon: f.icon, prod: f.prod, prodEn: f.prodEn, idx: S.firm }, entered: S.entered, ship: S.ship, know: S.know, cust: S.cust, qin: S.qin, q: S.q,
      rival: { in: S.rival ? S.rival.in : [], name: B.RIVAL ? B.RIVAL.name : '', icon: B.RIVAL ? B.RIVAL.icon : '⚔️', img: B.RIVAL ? B.RIVAL.img : '' } });
    if (snap !== sync.snap) { sync.snap = snap; localStorage.setItem('bizon-bp3d-last', snap); }
  } catch (e) {}
  sync.boatKey = intro || ended ? 'dock' : key;
}

/* ---------- chạm đảo ---------- */
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let down = null;
R.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
R.domElement.addEventListener('pointerup', e => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
  if (PP.mode === 'view') { PP.mode = 'idle'; return; }
  if (PP.mode === 'stamp' && PP.t > 2.4 && PP.t < 4.1) { PP.t = 4.1; return; }
  const r = R.domElement.getBoundingClientRect(); ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(ptr, cam); const h = ray.intersectObjects(hits, false)[0]; if (!h) return;
  const m = h.object.userData.m, B = window.__bp;
  if (m === -2) { userKey = 'home'; autoCam = true; say('🏡 Vàm Thịnh · ' + tr('Ban cố vấn: Bà Sáu Lành, Minh Khang, An Nhiên, Victor Lâm, Lina Park, Lumina AI', 'Advisors: Bà Sáu Lành, Minh Khang, An Nhiên, Victor Lâm, Lina Park, Lumina AI'), 4200); return; }
  if (m < 0) return;
  userKey = 'm' + m; autoCam = true;
  let msg = MK[m].icon + ' ' + MK[m].name;
  const sl = $('bp3d-street'); if (sl) sl.href = 'Pho%20Thi%20Truong%203D.html?m=' + m;
  if (B && B.MKTS) { const mk = B.MKTS[m], S = B.S; msg += ' — ' + tr(mk.trait, mk.traitEn) + ' · ' + tr('tri thức ', 'intel ') + S.know[m] + '%'; if (S.entered[m] !== null && B.MODES) msg += ' · ' + MODE_ICON[S.entered[m]] + ' ' + tr(B.MODES[S.entered[m]].name, B.MODES[S.entered[m]].nameEn); }
  if (!openAct(m)) say(msg, 4600);
});
function duelFx(I) {
  const g = grp(I.g, 0, G0 + 0.04, IR * 0.4);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.07, 10, 40), M(0xe8472d)); ring.rotation.x = -Math.PI / 2; g.add(ring);
  const ring2 = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.55, 40), new THREE.MeshBasicMaterial({ color: 0xf2b53a, transparent: true, opacity: 0.35, depthWrite: false })); ring2.rotation.x = -Math.PI / 2; ring2.position.y = 0.02; g.add(ring2);
  const lb = makeLabel(2.4); lb.position.y = 1.7; lb.userData.set('⚔️', tr('Tranh chấp', 'Contested'), '#e8472d'); g.add(lb);
  anim.push(t => { ring.rotation.z = t * 1.4; const k = 1 + Math.sin(t * 5) * 0.08; ring2.scale.setScalar(k); lb.position.y = 1.7 + Math.sin(t * 2.4) * 0.08; });
  return g;
}
function f1(x) { return (Math.round(x * 10) / 10).toString().replace('.', tr(',', '.')); }
function openAct(m) {
  const B = window.__bp, box = $('bp3d-act'); if (!B || !box || !B.S) return false; const S = B.S, mk = B.MKTS[m];
  const head = '<button class="x" type="button" aria-label="' + tr('Đóng', 'Close') + '" data-x>✕</button><h4>' + MK[m].icon + ' ' + MK[m].name + '</h4><p>' + tr(mk.trait, mk.traitEn) + ' · ' + tr('tri thức ', 'intel ') + S.know[m] + '% · ' + tr('tiền ', 'cash ') + f1(S.cash) + tr(' tỷ', ' bn') + '</p>';
  let body = '';
  if (S.phase === 'obs' && B.SOURCES) {
    const used = S.sel.intel.length >= 2, disc = S.sel.prio === 0 ? 0.5 : 1;
    body = '<p style="margin:0 0 6px;font-weight:800;opacity:.9">🔍 ' + tr('Mua tin cho đảo này', 'Buy intel for this island') + (used ? ' · ' + tr('đã đủ 2 nguồn/quý', '2 sources used') : '') + '</p><div class="g">' +
      B.SOURCES.map((s, i) => '<button type="button" data-src="' + i + '"' + (used || S.cash < s.cost * disc || S.sel.intel.indexOf(i) >= 0 ? ' disabled' : '') + '>' + s.icon + ' ' + tr(s.name, s.nameEn) + '<small>' + f1(s.cost * disc) + tr(' tỷ', ' bn') + ' · +' + s.know + '</small></button>').join('') + '</div>';
  } else if (S.phase === 'dec' && S.entered[m] === null && B.MODES) {
    body = '<p style="margin:0 0 6px;font-weight:800;opacity:.9">🚩 ' + tr('Chọn phương thức thâm nhập', 'Pick an entry mode') + '</p><div class="g">' +
      B.MODES.map(md => '<button type="button" data-md="' + md.id + '"' + (S.sel.enter === m && S.sel.enterMode === md.id ? ' class="sel"' : '') + '>' + md.icon + ' ' + tr(md.name, md.nameEn) + '<small>' + f1(md.cost) + tr(' tỷ', ' bn') + ' · ' + tr(md.note, md.noteEn) + '</small></button>').join('') + '</div>' +
      '<p style="margin:8px 0 0">' + tr('Sau đó chọn vận chuyển ở thẻ Quyết định bên dưới.', 'Then choose shipping in the Decision card below.') + '</p>';
  } else return false;
  box.innerHTML = head + body; box.hidden = false; box.dataset.m = m; return true;
}
$('bp3d-act') && $('bp3d-act').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return; const box = $('bp3d-act'), m = +box.dataset.m;
  if (b.hasAttribute('data-x')) { box.hidden = true; return; }
  if (b.dataset.src !== undefined && window.bpIntel) { window.bpIntel(+b.dataset.src, m); sfx && sfx('coin'); openAct(m); const n = $('bp-intel-note'); if (n) say('🔍 ' + n.textContent, 5200); }
  if (b.dataset.md !== undefined && window.bpEnter) { window.bpEnter(m, +b.dataset.md); sfx && sfx('pop'); openAct(m); }
});
/* ---------- âm thanh 3D (tổng hợp, không cần file) ---------- */
window.__bp3dMute = localStorage.getItem('bizon-bp3d-mute') === '1';
let seaN = null;
function ac() { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; }
function noiseBuf(a, sec) { const b = a.createBuffer(1, a.sampleRate * sec, a.sampleRate), d = b.getChannelData(0); let l = 0; for (let i = 0; i < d.length; i++) { l = l * 0.97 + (Math.random() * 2 - 1) * 0.03; d[i] = l * 6; } return b; }
function seaSnd(on) {
  try { const a = ac();
    if (on && !seaN) { const s = a.createBufferSource(); s.buffer = noiseBuf(a, 4); s.loop = true; const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 520; const g = a.createGain(); g.gain.value = 0.05;
      const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = 0.12; lg.gain.value = 0.035; lfo.connect(lg).connect(g.gain); lfo.start(); s.connect(f).connect(g).connect(a.destination); s.start(); seaN = { s, lfo, g }; }
    else if (!on && seaN) { seaN.s.stop(); seaN.lfo.stop(); seaN = null; } } catch (e) {}
}
function sfx(k) {
  if (window.__bp3dMute) return;
  try { const a = ac(), t = a.currentTime, out = a.destination;
    const tone = (f0, f1, dur, type = 'sine', vol = 0.18, at = 0) => { const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t + at); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + at + dur); g.gain.setValueAtTime(0.0001, t + at); g.gain.exponentialRampToValueAtTime(vol, t + at + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur); o.connect(g).connect(out); o.start(t + at); o.stop(t + at + dur + 0.05); };
    const burst = (dur, fq, vol, at = 0) => { const s = a.createBufferSource(); s.buffer = noiseBuf(a, dur); const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = fq; f.Q.value = 0.8; const g = a.createGain(); g.gain.setValueAtTime(0.0001, t + at); g.gain.exponentialRampToValueAtTime(vol, t + at + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur); s.connect(f).connect(g).connect(out); s.start(t + at); };
    if (k === 'tariff') { tone(180, 120, 0.18, 'square', 0.09); tone(180, 120, 0.18, 'square', 0.09, 0.28); }
    if (k === 'home') { tone(300, 330, 0.12, 'square', 0.06); tone(260, 240, 0.12, 'square', 0.06, 0.16); }
    if (k === 'coin') { tone(988, 0, 0.09, 'square', 0.06); tone(1319, 0, 0.22, 'square', 0.06, 0.08); }
    else if (k === 'pop') tone(420, 880, 0.12, 'triangle', 0.16);
    else if (k === 'cheer') { burst(1.2, 1400, 0.22); [523, 659, 784, 1047].forEach((f, i) => tone(f, 0, 0.22, 'triangle', 0.08, 0.1 + i * 0.09)); }
    else if (k === 'storm') { burst(1.6, 180, 0.35); tone(70, 40, 1.2, 'sawtooth', 0.05); }
    else if (k === 'fair') [659, 784, 988, 784, 1175].forEach((f, i) => tone(f, 0, 0.16, 'square', 0.05, i * 0.11));
    else if (k === 'tax') { tone(330, 0, 0.18, 'square', 0.07); tone(247, 0, 0.3, 'square', 0.07, 0.18); }
    else if (k === 'clash') { burst(0.25, 3200, 0.3); tone(180, 90, 0.3, 'sawtooth', 0.09); burst(0.25, 3200, 0.25, 0.35); }
    else if (k === 'badge') [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0, 0.3, 'sine', 0.12, i * 0.08));
  } catch (e) {}
}
function setMute(m) { window.__bp3dMute = m; localStorage.setItem('bizon-bp3d-mute', m ? '1' : '0'); if (AC || !m && setMute.ready) seaSnd(!m); const b = $('bp3d-snd'); if (b) b.textContent = m ? '🔇' : '🔊'; }
$('bp3d-snd') && $('bp3d-snd').addEventListener('click', () => setMute(!window.__bp3dMute));
addEventListener('pointerdown', function first() { removeEventListener('pointerdown', first); setMute.ready = true; if (!window.__bp3dMute) seaSnd(true); }, { once: true });
setMute(window.__bp3dMute);
window.__bp3dSfx = sfx;
const landBtn = $('bp3d-land'); const landTxt = () => { if (landBtn) landBtn.textContent = landMode === 'team' ? tr('👥 Cả đội lên đảo', '👥 Whole team lands') : tr('👤 CEO lên đảo', '👤 CEO lands'); };
landTxt(); landBtn && landBtn.addEventListener('click', () => { landMode = landMode === 'team' ? 'ceo' : 'team'; localStorage.setItem('bizon-bp3d-land', landMode); landTxt(); islands.forEach(I => I.party && landParty(I, false)); });
$('bp3d-full') && $('bp3d-full').addEventListener('click', () => { const on = document.body.classList.toggle('bp3d-full'); $('bp3d-full').textContent = on ? tr('▾ Thu nhỏ', '▾ Shrink') : tr('⤢ Mở rộng', '⤢ Expand'); resize(); });
$('bp3d-ov') && $('bp3d-ov').addEventListener('click', () => { userKey = camKey === 'intro' ? null : 'ov'; autoCam = true; });
$('bp3d-pp') && $('bp3d-pp').addEventListener('click', () => openPassportModal('cover'));

/* ---------- vòng lặp ---------- */
function navBottom() {
  let b = 0;
  for (const x of [innerWidth * 0.25, innerWidth * 0.5, innerWidth * 0.75]) {
    for (const el of document.elementsFromPoint(x, 4)) {
      if (wrap.contains(el)) continue;
      for (let n = el; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.position === 'fixed' || cs.position === 'sticky') { const r = n.getBoundingClientRect(); if (r.top <= 4 && r.bottom < 160) b = Math.max(b, r.bottom); break; } }
    }
  }
  return Math.round(b);
}
let fitCache = {};
function resize() {
  const top = navBottom(), desk = innerWidth >= 1024;
  const full = document.body.classList.contains('bp3d-full'); wrap.style.top = top + 'px'; wrap.style.height = ((desk || full ? innerHeight : innerHeight * 0.54) - top) + 'px';
  const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return;
  R.setSize(w, h, false); cam.aspect = w / h; cam.clearViewOffset(); cam.updateProjectionMatrix(); fitCache = {};
}
setTimeout(resize, 400); setTimeout(resize, 1500); addEventListener('resize', resize);
const FIT_PTS = [];
IPOS.forEach((p, m) => { FIT_PTS.push(new THREE.Vector3(p.x - IR, 0, p.z), new THREE.Vector3(p.x + IR, 0, p.z), new THREE.Vector3(p.x, 0, p.z - IR), new THREE.Vector3(p.x, 4.6 + (m % 2) * 1.7 + 1.3, p.z)); });
FIT_PTS.push(new THREE.Vector3(HOME.x - 4.6, 0, HOME.z), new THREE.Vector3(HOME.x + 4.6, 0, HOME.z), new THREE.Vector3(DOCK.x, 0, DOCK.z + 1.2));
function fitDist(T, dir) {
  const k = cam.aspect.toFixed(3) + dir.x.toFixed(2); if (fitCache[k]) return fitCache[k];
  const c = cam.clone(false), v = new THREE.Vector3(); let lo = 12, hi = 200;
  for (let i = 0; i < 22; i++) {
    const d = (lo + hi) / 2; c.position.copy(T).addScaledVector(dir, d); c.lookAt(T); c.updateMatrixWorld(); c.updateProjectionMatrix();
    let ok = true; for (const p of FIT_PTS) { v.copy(p).project(c); if (Math.abs(v.x) > 0.94 || v.y > 0.9 || v.y < -0.94 || v.z > 1) { ok = false; break; } }
    if (ok) hi = d; else lo = d;
  }
  return (fitCache[k] = hi);
}
resize();
drawCover(); drawInside(); drawPage();
document.fonts && document.fonts.ready.then(() => { labels.forEach(l => l.userData.redraw()); drawCover(); drawInside(); drawPage(); });
const perf = { n: 0, s: 0 };
const clock = new THREE.Clock(); let acc = 1, lastT = 0;
const tmp = new THREE.Vector3(), boatGoal = new THREE.Vector3();
camGoal('intro', 0); cam.position.copy(goalP); ctl.target.copy(goalT);
function frame() {
  requestAnimationFrame(frame);
  if (document.hidden) return;
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime; U.t.value = t;
  acc += dt; if (acc > 0.25) { acc = 0; sync(t); if (window.__bp3dQReady) { questTick(); badgeTick(); } }
  perf.n++; perf.s += dt; if (perf.s > 2.5) { const fps = perf.n / perf.s; perf.n = perf.s = 0;
    if (fps < 38 && t > 4) { const pr = R.getPixelRatio(); if (pr > 1.01) { R.setPixelRatio(Math.max(1, pr - 0.3)); resize(); } else if (R.shadowMap.enabled) { R.shadowMap.enabled = false; scene.traverse(o => o.material && (o.material.needsUpdate = true)); } } }
  anim.forEach(f => f(t));
  { const ph = R.domElement.clientHeight || 300, fh = 2 * Math.tan(21 * Math.PI / 180);
    labels.forEach(l => { if (!l.parent || !l.userData.bw) return; l.getWorldPosition(tmp); const d = tmp.distanceTo(cam.position);
      const px = l.userData.bw / (fh * d) * ph, want = THREE.MathUtils.clamp(px, small ? 88 : 104, 230), w = l.userData.bw * want / Math.max(px, 1);
      l.scale.set(w, w * 150 / 512, 1); }); }
  islands.forEach((I, m) => {
    I.fogV += ((I.fogT ?? 0.62) - I.fogV) * Math.min(1, dt * 1.5); I.fm.opacity = I.fogV; I.fog.visible = I.fogV > 0.02;
    I.fog.scale.setScalar(0.75 + I.fogV * 0.35);
    if (I.flag) { const u = I.flag.userData; u.raise = Math.min(1, u.raise + dt * 0.7); u.cl.position.y = 0.5 + ease(u.raise) * 1.62; }
    if (I.rival) { const u = I.rival.userData; u.grow = Math.min(1, u.grow + dt * 1.5); I.rival.scale.setScalar(Math.max(0.01, ease(u.grow))); }
    if (I.route) {
      const u = I.route.userData; u.grow = Math.min(1, u.grow + dt * 0.8); u.dots.count = Math.round(28 * u.grow);
      const ph = (t * (u.kind === 'data' ? 0.22 : 0.07) + m * 0.17) % 2, pp = ph < 1 ? ph : 2 - ph, back = ph >= 1 && u.kind !== 'data';
      const q = u.kind === 'data' ? ph % 1 : pp; u.curve.getPointAt(q, tmp); u.car.position.copy(tmp);
      const tg = u.curve.getTangentAt(Math.min(0.999, q)); if (back) tg.negate();
      if (u.kind === 'sea') { u.car.rotation.y = Math.atan2(-tg.z, tg.x); u.car.position.y = Math.sin(t * 2 + m) * 0.05; }
      else if (u.kind === 'air') { u.car.lookAt(tmp.clone().add(tg)); u.car.rotateY(-Math.PI / 2); }
      u.car.visible = u.grow > 0.95;
    }
  });
  advisors.forEach((a, i) => {
    CLAY.animate(a.sp, t, a.talk ? 'talk' : 'idle', i * 1.3); a.sp.position.y = a.talk ? Math.abs(Math.sin(t * 4.2 + i)) * 0.06 : 0;
    a.sp.rotation.y += ((a.talk ? 0 : Math.sin(t * 0.4 + i) * 0.25) - a.sp.rotation.y) * Math.min(1, dt * 3);
    a.bub.position.y = 2.2 + Math.sin(t * 3 + i) * 0.06;
  });
  clayAnim.forEach((c, i) => CLAY.animate(c, t, 'idle', i));
  crew.forEach((c, i) => { if (!(c.userData.wave > 0)) CLAY.animate(c, t, i === 0 ? 'talk' : 'idle', i * 0.9); });
  landed.forEach((o, i) => { const u = o.r.userData; u.pop = Math.min(1, u.pop + dt * 1.2); o.r.scale.setScalar(Math.max(0.001, u.s * ease(Math.max(0, u.pop))));
    o.cheer = Math.max(0, o.cheer - dt); CLAY.animate(o.r, t, o.cheer > 0 ? 'cheer' : 'idle', i * 1.1); o.r.position.y = G0; });
  // thuyền sen
  const bk = sync.boatKey || 'dock';
  if (bk === 'dock' || bk === 'home') boatGoal.copy(DOCK);
  else if (bk[0] === 'm') { const p = IPOS[+bk.slice(1)]; boatGoal.copy(p).add(HOME.clone().sub(p).setY(0).normalize().multiplyScalar(IR * 1.9)); }
  else boatGoal.set(Math.cos(t * 0.09) * 9, 0, -1 + Math.sin(t * 0.09) * 6);
  tmp.subVectors(boatGoal, boat.position).setY(0); const dist = tmp.length();
  if (dist > 0.15) {
    const sp = Math.min(dist, 5.5 * dt * Math.min(1, dist / 2 + 0.3)); tmp.normalize();
    const want = Math.atan2(-tmp.z, tmp.x); let dr = want - boat.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr));
    boat.rotation.y += dr * Math.min(1, dt * 3); const f = new THREE.Vector3(Math.cos(boat.rotation.y), 0, -Math.sin(boat.rotation.y));
    boat.position.addScaledVector(f, sp * Math.max(0.2, Math.cos(dr)));
    wakeAcc += dt; if (wakeAcc > 0.18 && sp > 0.02) { wakeAcc = 0; const w = wake[wakeI++ % wake.length]; w.position.set(boat.position.x - f.x * 1.1, -0.08, boat.position.z - f.z * 1.1); w.userData.life = 0; w.visible = true; }
  }
  boat.position.y = Math.sin(t * 1.6) * 0.07; boat.userData.body.rotation.x = Math.sin(t * 1.3) * 0.05;
  wake.forEach(w => { if (!w.visible) return; w.userData.life += dt * 0.6; w.scale.setScalar(1 + w.userData.life * 4); w.material.opacity = 0.5 * (1 - w.userData.life); if (w.userData.life >= 1) w.visible = false; });
  // sân lễ
  if (endT >= 0) {
    endT += dt; stage.position.y = -4 + 4 * ease(endT / 1.4);
    if (endT > 1.2 && endT < 3.2) buildRadar(ease((endT - 1.2) / 1.8));
    radarMesh && (radarMesh.position.z = 0.02);
  }
  // camera
  if (autoCam) { camGoal(userKey || camKey, t); const k = 1 - Math.exp(-dt * 2); cam.position.lerp(goalP, k); ctl.target.lerp(goalT, k); }
  ctl.update();
  updatePassport(dt);
  if (shake > 0) { shake = Math.max(0, shake - dt); cam.position.y += Math.sin(t * 90) * shake * 0.15; }
  R.render(scene, cam);
}
frame();

/* ---------- sự kiện thị trường 3D ---------- */
const EVFX = { id: null, g: null, t0: 0 };
const EVCAT = { trend: 'fair', celeb: 'fair', green: 'fair', training: 'fair', cert: 'fair', pricewar: 'storm', subst: 'storm', fx: 'storm', review: 'storm', devalue: 'storm', copy: 'storm', betray: 'storm', held: 'storm', board: 'storm', defect: 'storm', reg: 'tariff', tax: 'tariff', data: 'tariff', greenlaw: 'tariff', port: 'tariff', talent: 'home', supplier: 'home', cashflow: 'home', conflict: 'home' };
function evTargets(S) { const e = []; for (let m = 0; m < 7; m++) if (S.entered[m] !== null && S.entered[m] !== undefined) e.push(m); return e; }
function fxAt(kind, par) {
  const g = grp(par, 0, 0, 0);
  if (kind === 'storm') {
    const cm = M(0x5c6470); for (let k = 0; k < 5; k++) P(GE.sph, cm, g, (k - 2) * 0.55, 4.2 + (k % 2) * 0.25, (k % 3 - 1) * 0.3, 0.55 + (k % 2) * 0.15);
    const rm = new THREE.MeshBasicMaterial({ color: 0x9fc3e8, transparent: true, opacity: 0.7 });
    g.userData.rain = []; for (let k = 0; k < 18; k++) { const d = P(GE.cyl, rm, g, (Math.random() - 0.5) * 2.6, 3 + Math.random() * 1.2, (Math.random() - 0.5) * 1.6, 0.015, 0.35, 0.015); d.castShadow = false; g.userData.rain.push(d); }
    g.userData.bolt = P(GE.box, new THREE.MeshBasicMaterial({ color: 0xffe36a }), g, 0.3, 3.3, 0, 0.06, 1, 0.06); g.userData.bolt.rotation.z = 0.35;
  } else if (kind === 'fair') {
    g.userData.bal = []; [0xe8762d, 0xf2b53a, 0x2f9d8f, 0xd9486a, 0x6a7fdb].forEach((c, k) => { const b = grp(g, Math.cos(k * 1.26) * 1.4, 2.6, Math.sin(k * 1.26) * 1.4); P(GE.sph, M(c), b, 0, 0.9, 0, 0.26, 0.32, 0.26); P(GE.cyl, M(0xf4efe4), b, 0, 0.35, 0, 0.008, 0.9, 0.008); g.userData.bal.push(b); });
    P(GE.box, M(0xf6e3c0), g, 0, 0.55, -1.1, 1.2, 0.08, 0.7); P(GE.box, M(0xe8762d), g, 0, 1.05, -1.1, 1.3, 0.12, 0.8);
  } else if (kind === 'tariff') {
    P(GE.box, M(0xc23a30), g, 0, 0.7, 0, 2.2, 0.16, 0.16); P(GE.box, M(0xf4efe4), g, -0.55, 0.7, 0, 0.4, 0.17, 0.17); P(GE.box, M(0xf4efe4), g, 0.55, 0.7, 0, 0.4, 0.17, 0.17);
    P(GE.cyl, M(0x3a3a3a), g, -1.15, 0.4, 0, 0.07, 0.8, 0.07); P(GE.cyl, M(0x3a3a3a), g, 1.15, 0.4, 0, 0.07, 0.8, 0.07);
    const st = grp(g, 0, 1.6, 0); P(GE.cyl, M(0xc23a30), st, 0, 0, 0, 0.42, 0.1, 0.42).rotation.x = Math.PI / 2; g.userData.seal = st;
  } else {
    g.userData.gear = []; for (let k = 0; k < 3; k++) { const gg = grp(g, (k - 1) * 0.8, 3.4 + (k % 2) * 0.4, 0); const c = P(GE.cyl, M(k === 1 ? 0xf2b53a : 0x8a8f99), gg, 0, 0, 0, 0.32, 0.12, 0.32); c.rotation.x = Math.PI / 2; for (let j = 0; j < 8; j++) { const tt = P(GE.box, c.material, gg, Math.cos(j * 0.785) * 0.36, Math.sin(j * 0.785) * 0.36, 0, 0.1, 0.1, 0.12); tt.rotation.z = j * 0.785; } g.userData.gear.push(gg); }
  }
  g.scale.setScalar(0.001); return g;
}
function evClear() { if (EVFX.g) EVFX.g.forEach(g => g.parent && g.parent.remove(g)); EVFX.g = null; }
function evSync(t) {
  const B = window.__bp; if (!B || !B.S) return; const S = B.S, ev = window.__bpEv;
  const id = S.phase === 'evt' && ev ? ev.id + ':' + S.q : null;
  if (id === EVFX.id) return; EVFX.id = id; evClear(); if (!id) { EVFX.kind = null; evBanner(null); return; }
  const kind = EVCAT[ev.id] || 'home', ent = evTargets(S);
  let tg = kind === 'home' || !ent.length ? [-1] : (ev.id === 'copy' || ev.id === 'betray') && S.rival && S.rival.in.length ? S.rival.in.slice(0, 3) : ent.slice(0, 3);
  EVFX.g = tg.map(m => { const par = m < 0 ? grp(scene, HOME.x, 0, HOME.z) : islands[m].g; const g = fxAt(kind, par); if (kind === 'tariff' && m >= 0) g.position.set(-IR * 0.2, G0, -IR * 0.55); else if (m >= 0) g.position.y = G0 - 0.1; return g; });
  EVFX.t0 = t; EVFX.kind = kind; if (typeof sfx === 'function') sfx(kind);
  EVFX.tg = tg; if (tg[0] >= 0) { userKey = 'm' + tg[0]; autoCam = true; } else { userKey = 'home'; autoCam = true; } evBanner(ev, kind, tg);
  const ic = { storm: '⛈️', fair: '🎪', tariff: '🛃', home: '⚙️' }[kind];
  say(ic + ' ' + tr(ev.t, ev.tEn || ev.t) + (tg[0] >= 0 ? ' · ' + tg.map(m => MK[m].name).join(', ') : ' · Vàm Thịnh'), 4200);
}
anim.push(t => {
  anim.acc = (anim.acc || 0) + 1; if (anim.acc % 8 === 0) evSync(t);
  if (!EVFX.g) return; const k = Math.min(1, (t - EVFX.t0) * 1.6);
  EVFX.g.forEach((g, i) => { g.scale.setScalar(ease(k)); const u = g.userData;
    if (u.rain) { u.rain.forEach((d, j) => { d.position.y -= 0.05; if (d.position.y < 0.6) d.position.y = 4; }); u.bolt.visible = Math.sin(t * 9 + i * 3) > 0.93; }
    if (u.bal) u.bal.forEach((b, j) => { b.position.y = 2.6 + Math.sin(t * 1.5 + j) * 0.2; });
    if (u.seal) { u.seal.rotation.y = t * 1.5; u.seal.position.y = 1.6 + Math.sin(t * 2) * 0.1; }
    if (u.gear) u.gear.forEach((gg, j) => { gg.rotation.z = t * (j % 2 ? -1.2 : 1.2); });
  });
});

window.BP3D = { say, queueStamp };

/* ---------- nhiệm vụ phụ mỗi quý ---------- */
const QUESTS = [
  { id: 'fog', who: 'Bà Sáu Lành', ic: '🌫️', vi: 'Làm rõ thêm 40% tri thức (tổng các đảo)', en: 'Gain +40% total intel', ok: (S, b) => sum(S.know) - b.know >= 40 },
  { id: 'enter', who: 'An Nhiên', ic: '🚩', vi: 'Thâm nhập một thị trường mới', en: 'Enter a new market', ok: (S, b) => cntE(S) > b.ent },
  { id: 'clear', who: 'Lumina AI', ic: '🌤️', vi: 'Đưa một đảo lên tri thức ≥ 60%', en: 'Bring an island to ≥60% intel', ok: (S, b) => S.know.some((k, m) => k >= 60 && b.kn[m] < 60) },
  { id: 'cash', who: 'Minh Khang', ic: '💰', vi: 'Kết thúc quý với tiền mặt không thấp hơn đầu quý', en: 'End the quarter with no less cash', ok: (S, b) => S.cash >= b.cash, atEnd: true },
  { id: 'rival', who: 'Victor Lâm', ic: '⚔️', vi: 'Có mặt ở một thị trường Kim Long đã vào', en: 'Be present where Kim Long is', ok: S => !!(S.rival && S.rival.in.some(m => S.entered[m] !== null && S.entered[m] !== undefined)) },
  { id: 'two', who: 'Lina Park', ic: '🔍', vi: 'Dùng đủ 2 nguồn tin trong quý', en: 'Use 2 intel sources this quarter', ok: S => !!(S.sel && S.sel.intel && S.sel.intel.length >= 2) },
];
function sum(a) { return (a || []).reduce((x, y) => x + (+y || 0), 0); }
function cntE(S) { return S.entered.filter(v => v !== null && v !== undefined).length; }
const QK = 'bizon-bp3d-quests';
let QS = {}; try { QS = JSON.parse(localStorage.getItem(QK) || '{}'); } catch (e) {}
const qBox = document.createElement('div'); qBox.id = 'bp3d-quest';
qBox.style.cssText = 'position:absolute;left:10px;bottom:10px;width:min(340px,calc(100% - 20px));background:rgba(255,250,240,.94);color:#033337;border-radius:14px;padding:8px 12px;font:700 12.5px/1.35 inherit;box-shadow:0 4px 0 rgba(3,51,55,.18);display:none;gap:8px;align-items:center;z-index:5;pointer-events:none';
wrap.appendChild(qBox);
function qSave() { try { localStorage.setItem(QK, JSON.stringify(QS)); } catch (e) {} }
function questTick() {
  const B = window.__bp; if (!B || !B.S || !B.S.know) return; const S = B.S, q = S.q;
  const _in = $('bp-intro'); if (_in && !_in.classList.contains('hidden')) { qBox.style.display = 'none'; return; }
  if (S.phase === 'end' || q >= 6) { qBox.style.display = 'none'; return; }
  let cur = QS[q];
  if (!cur || cur.firm !== S.firm) {
    const prev = QS[q - 1]; if (prev && !prev.done && prev.firm === S.firm) { const Q0 = QUESTS.find(x => x.id === prev.id); if (Q0 && Q0.atEnd && Q0.ok(S, prev.b)) { prev.done = true; celebrate(Q0); } }
    const Q = QUESTS[(q * 5 + (S.firm | 0)) % QUESTS.length];
    cur = QS[q] = { id: Q.id, firm: S.firm, done: false, b: { know: sum(S.know), ent: cntE(S), kn: S.know.slice(), cash: S.cash } }; qSave();
    if (q > 0 || Object.keys(QS).length > 1) say(Q.ic + ' ' + Q.who + ': ' + tr(Q.vi, Q.en), 5000);
  }
  const Q = QUESTS.find(x => x.id === cur.id); if (!Q) return;
  if (!cur.done && !Q.atEnd && Q.ok(S, cur.b)) { cur.done = true; qSave(); celebrate(Q); }
  const stars = Object.values(QS).filter(x => x.done && x.firm === S.firm).length;
  const html = '<span style="font-size:20px">' + (cur.done ? '✅' : Q.ic) + '</span><span><span style="opacity:.6;font-size:10.5px;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap">' + tr('Nhiệm vụ quý ', 'Quarter ') + (q + 1) + tr(' · ', ' quest · ') + Q.who + ' · ⭐ ' + stars + '</span><br>' + tr(Q.vi, Q.en) + (Q.atEnd && !cur.done ? '<span style="opacity:.6"> ' + tr('(chấm cuối quý)', '(checked at quarter end)') + '</span>' : '') + '</span>';
  if (qBox._h !== html) { qBox._h = html; qBox.innerHTML = html; }
  qBox.style.display = 'flex'; if (typeof aboveTB === 'function') { aboveTB(qBox, 8); qBox.style.maxHeight = ''; } qBox.style.opacity = cur.done ? '.85' : '1';
}
function celebrate(Q) {
  sfx('coin'); say('⭐ ' + tr('Hoàn thành nhiệm vụ của ', 'Quest done for ') + Q.who + '!', 3800);
  const a = advisors.find(x => x.name === Q.who); if (a) { a.bub.visible = true; setTimeout(() => { a.bub.visible = !!a.talk; }, 3000); }
  window.dispatchEvent(new CustomEvent('bp3d-quest', { detail: { id: Q.id } }));
}
window.__bp3dQuests = () => QS;

/* ---------- thành tích & huy hiệu ---------- */
const BADGES = [
  { id: 'first', ic: '🚩', vi: 'Cắm cờ đầu tiên', en: 'First flag', ok: S => cntE(S) >= 1 },
  { id: 'three', ic: '🗺️', vi: 'Ba châu lục', en: 'Three markets', ok: S => cntE(S) >= 3 },
  { id: 'five', ic: '🌏', vi: 'Nhà chinh phục', en: 'Conqueror', ok: S => cntE(S) >= 5 },
  { id: 'clear', ic: '🌤️', vi: 'Xua tan sương mù', en: 'Fog breaker', ok: S => S.know.filter(k => k >= 60).length >= 3 },
  { id: 'scholar', ic: '🔭', vi: 'Nhà nghiên cứu', en: 'Researcher', ok: S => S.know.every(k => k >= 30) },
  { id: 'duel', ic: '⚔️', vi: 'Dám đối đầu', en: 'Face-off', ok: S => !!(S.rival && S.rival.in.some(m => S.entered[m] !== null && S.entered[m] !== undefined)) },
  { id: 'modes', ic: '🧩', vi: 'Đa phương thức', en: 'Multi-mode', ok: S => new Set(S.entered.filter(v => v !== null && v !== undefined)).size >= 3 },
  { id: 'star3', ic: '⭐', vi: 'Trợ thủ đắc lực', en: 'Reliable crew', ok: () => qStars() >= 3 },
  { id: 'star6', ic: '🏅', vi: 'Hoàn hảo 6/6', en: 'Perfect 6/6', ok: () => qStars() >= 6 },
  { id: 'finish', ic: '🎓', vi: 'Hoàn thành hành trình', en: 'Journey complete', ok: S => S.phase === 'end' || S.q >= 6 },
];
function qStars() { const B = window.__bp; const f = B && B.S ? B.S.firm : null; return Object.values(QS).filter(x => x.done && x.firm === f).length; }
const BK = 'bizon-bp3d-badges';
let BG = {}; try { BG = JSON.parse(localStorage.getItem(BK) || '{}'); } catch (e) {}
const bBtn = document.createElement('button'); bBtn.type = 'button';
const TB = $('bp3d-ov') ? $('bp3d-ov').parentElement : wrap; bBtn.className = $('bp3d-ov') ? $('bp3d-ov').className : ''; TB.appendChild(bBtn); bBtn.textContent = '🏆';
function aboveTB(el, gap) { const w = wrap.getBoundingClientRect(), t = TB === wrap ? w.bottom - 10 : TB.getBoundingClientRect().top; el.style.bottom = Math.round(w.bottom - t + gap) + 'px'; el.style.maxHeight = Math.max(120, Math.round(t - w.top - gap - 8)) + 'px'; }
const bPanel = document.createElement('div');
bPanel.style.cssText = 'position:absolute;right:10px;bottom:60px;z-index:7;width:min(320px,calc(100% - 20px));overflow:auto;background:rgba(255,250,240,.97);color:#033337;border-radius:16px;padding:12px;box-shadow:0 6px 0 rgba(3,51,55,.2);display:none';
wrap.appendChild(bPanel);
bBtn.addEventListener('click', () => { bPanel.style.display = bPanel.style.display === 'none' ? 'block' : 'none'; aboveTB(bPanel, 8); drawBadges(); });
function myB() { const B = window.__bp; const f = B && B.S ? B.S.firm : 0; return BG[f] = BG[f] || {}; }
function drawBadges() {
  const got = myB(), n = Object.keys(got).length;
  bBtn.textContent = '🏆 ' + n + '/' + BADGES.length;
  if (bPanel.style.display === 'none') return;
  bPanel.innerHTML = '<div style="font:800 14px/1.2 inherit;margin-bottom:8px">🏆 ' + tr('Huy hiệu', 'Badges') + ' · ' + n + '/' + BADGES.length + ' · ⭐ ' + qStars() + '</div><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px">' +
    BADGES.map(b => { const on = got[b.id]; return '<div style="display:flex;gap:6px;align-items:center;padding:6px 8px;border-radius:10px;background:' + (on ? '#fdf0cf' : 'rgba(3,51,55,.06)') + ';opacity:' + (on ? 1 : 0.55) + '"><span style="font-size:20px;filter:' + (on ? 'none' : 'grayscale(1)') + '">' + b.ic + '</span><span style="font:700 12px/1.25 inherit">' + tr(b.vi, b.en) + (on ? '<br><span style="opacity:.6;font-size:10.5px">' + tr('Quý ', 'Q') + on + '</span>' : '') + '</span></div>'; }).join('') + '</div>';
}
function badgeTick() {
  const B = window.__bp; if (!B || !B.S || !B.S.know) return; const S = B.S, got = myB(); let neu = null;
  BADGES.forEach(b => { if (!got[b.id]) { try { if (b.ok(S)) { got[b.id] = Math.min(6, S.q + 1); neu = b; } } catch (e) {} } });
  if (neu) { try { localStorage.setItem(BK, JSON.stringify(BG)); } catch (e) {} if (badgeTick.ready) { sfx('badge'); say('🏆 ' + tr('Huy hiệu mới: ', 'New badge: ') + neu.ic + ' ' + tr(neu.vi, neu.en), 4200); } window.dispatchEvent(new CustomEvent('bp3d-badge', { detail: { id: neu.id } })); }
  badgeTick.ready = true; drawBadges();
}
window.__bp3dBadges = () => myB();

window.__bp3dQReady = true;

/* ---------- tuỳ biến thuyền & đồng phục ---------- */
const STY_OPT = {
  hull: [[0x2f6f7a, 'Xanh két', 'Teal'], [0x8a3b2e, 'Gỗ đỏ', 'Red wood'], [0x2b3f6b, 'Chàm', 'Indigo'], [0x3f6b3a, 'Lá sen', 'Lotus leaf']],
  sail: [[0xf2a7bf, 'Hồng sen', 'Lotus pink'], [0xf4efe2, 'Trắng ngà', 'Ivory'], [0xf2b53a, 'Vàng nghệ', 'Turmeric'], [0x6fc3c9, 'Xanh ngọc', 'Aqua']],
  flag: [[0xfda127, 'Cam', 'Orange'], [0xda251d, 'Đỏ', 'Red'], [0x2f7a86, 'Xanh', 'Teal'], [0x7a4a9a, 'Tím', 'Purple']],
  scarf: [[null, 'Không', 'None'], [0xe8472d, 'Đỏ', 'Red'], [0xf2b53a, 'Vàng', 'Yellow'], [0x2f7a86, 'Xanh', 'Teal']],
};
const STK = 'bizon-bp3d-style';
let STY = { hull: 0, sail: 0, flag: 0, scarf: 0 }; try { Object.assign(STY, JSON.parse(localStorage.getItem(STK) || '{}')); } catch (e) {}
const scarfed = [];
function addScarf(r) {
  if (!r || r.userData.scarf) return;
  if (CLAY.isArt(r)) { const k = (r.userData.rig.h || 1) * 0.3; const m = new THREE.Mesh(new THREE.TorusGeometry(k, k * 0.14, 8, 28), M(0xe8472d)); m.rotation.x = -Math.PI / 2; m.position.y = 0.03; r.add(m); r.userData.scarf = m; scarfed.push(r); paintScarf(r); return; }
  r.updateWorldMatrix(true, true); const bx = new THREE.Box3().setFromObject(r), h = bx.max.y - bx.min.y; if (!(h > 0)) return;
  const ws = new THREE.Vector3(); r.getWorldScale(ws); const k = h / (ws.y || 1);
  const c = bx.getCenter(new THREE.Vector3()); c.y = bx.min.y + h * 0.7; r.worldToLocal(c);
  const mat = M(0xe8472d), m = new THREE.Mesh(new THREE.TorusGeometry(0.1 * k, 0.028 * k, 8, 22), mat); m.rotation.x = Math.PI / 2; m.position.copy(c);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.05 * k, 0.02 * k, 0.13 * k), mat); tail.position.set(0.04 * k, 0.09 * k, 0.02 * k); tail.rotation.y = 0.4; m.add(tail);
  r.add(m); r.userData.scarf = m; scarfed.push(r); paintScarf(r);
}
function paintScarf(r) { const c = STY_OPT.scarf[STY.scarf][0], s = r.userData.scarf; if (!s) return; s.visible = c !== null; if (c !== null) s.material.color.setHex(c); }
function applyStyle() {
  ['hull', 'sail', 'flag'].forEach(p => boat.userData[p] && boat.userData[p].color.setHex(STY_OPT[p][STY[p]][0]));
  scarfed.forEach(paintScarf);
}
window.__bp3dScarf = addScarf;
crew.forEach(addScarf); landed.forEach(o => addScarf(o.r)); applyStyle();
const sBtn = document.createElement('button'); sBtn.type = 'button'; sBtn.textContent = '🎨';
sBtn.setAttribute('aria-label', tr('Tuỳ biến thuyền & đồng phục', 'Customize boat & uniform'));
sBtn.className = bBtn.className; TB.appendChild(sBtn);
const sPanel = document.createElement('div');
sPanel.style.cssText = 'position:absolute;right:10px;bottom:58px;z-index:7;overflow:auto;width:min(250px,calc(100% - 20px));background:rgba(255,250,240,.97);color:#033337;border-radius:16px;padding:10px 12px;box-shadow:0 6px 0 rgba(3,51,55,.2);display:none;font:700 12px/1.3 inherit';
wrap.appendChild(sPanel);
const ROWS = [['hull', '⛵ Thân thuyền', '⛵ Hull'], ['sail', '🪷 Buồm', '🪷 Sail'], ['flag', '🚩 Cờ hiệu', '🚩 Pennant'], ['scarf', '⭕ Vòng màu đội', '⭕ Team ring']];
function drawStyle() {
  sPanel.innerHTML = '<div style="font:800 13.5px/1.2 inherit;margin-bottom:6px">🎨 ' + tr('Thuyền & đồng phục', 'Boat & uniform') + '</div>' + ROWS.map(([p, vi, en]) =>
    '<div style="margin-top:6px">' + tr(vi, en) + '</div><div style="display:flex;gap:6px;margin-top:4px">' + STY_OPT[p].map((o, i) => {
      const col = o[0] === null ? 'repeating-linear-gradient(45deg,#fff 0 4px,#ddd 4px 8px)' : '#' + o[0].toString(16).padStart(6, '0');
      return '<button type="button" data-p="' + p + '" data-i="' + i + '" title="' + tr(o[1], o[2]) + '" aria-label="' + tr(o[1], o[2]) + '" style="width:34px;height:34px;border-radius:50%;cursor:pointer;background:' + col + ';border:' + (STY[p] === i ? '3px solid #033337' : '2px solid rgba(3,51,55,.2)') + '"></button>';
    }).join('') + '</div>').join('');
}
sPanel.addEventListener('click', e => { const b = e.target.closest('button[data-p]'); if (!b) return; STY[b.dataset.p] = +b.dataset.i; try { localStorage.setItem(STK, JSON.stringify(STY)); } catch (er) {} applyStyle(); drawStyle(); sfx('coin'); window.dispatchEvent(new CustomEvent('bp3d-style', { detail: STY })); });
sBtn.addEventListener('click', () => { const on = sPanel.style.display === 'none'; sPanel.style.display = on ? 'block' : 'none'; if (on) { drawStyle(); aboveTB(sPanel, 8); bPanel.style.display = 'none'; } });
bBtn.addEventListener('click', () => { sPanel.style.display = 'none'; });
window.__bp3dStyle = () => STY;

/* ---------- sự sống: dân cư, văn hóa, Vàm Thịnh, hành trình thuyền ---------- */
const LIFE = { t: 0, dt: 0 }; anim.push(t => { LIFE.dt = Math.min(0.05, t - LIFE.t); LIFE.t = t; });
const villAnim = [];
function pawn(par, body, head = null, hat = null, s = 1) {
  const r = CLAY.villager(body, head === 0xf0c09c ? null : head, villAnim.length, 0.78 * s); par.add(r);
  if (hat) { const hb = new THREE.Box3().setFromObject(r), hs = r.scale.x || 1, H = (hb.max.y - hb.min.y) / hs; const hm = hat.cone ? GE.cone : GE.cyl;
    const h = P(hm, M(hat.c), r, 0, H * 0.97 + (hat.h || 0.07) / hs * 0.4, 0, (hat.w || 0.13) / hs * 1.15, (hat.h || 0.07) / hs, (hat.w || 0.13) / hs * 1.15); h.castShadow = false; }
  const o = { r, mode: 'idle', ph: villAnim.length * 0.7 }; villAnim.push(o); r.userData.va = o; return r;
}
anim.push(t => { for (const o of villAnim) if (o.r.visible !== false) CLAY.animate(o.r, t, o.mode, o.ph); });
function walker(par, cfg) {
  const p = pawn(par, cfg.body, cfg.head, cfg.hat, cfg.s || 1), ph = cfg.ph || 0, d = cfg.dir || 1, rz = cfg.rz || cfg.rx; p.userData.va.mode = 'walk';
  anim.push(t => { const a = ph + t * (cfg.sp || 0.35) * d;
    p.position.set(cfg.cx + Math.cos(a) * cfg.rx, cfg.y ?? G0, cfg.cz + Math.sin(a) * rz);
    p.rotation.y = Math.atan2(-Math.sin(a) * cfg.rx * d, Math.cos(a) * rz * d); });
  return p;
}
function particles(par, n, cfg) {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), seed = [];
  for (let i = 0; i < n; i++) seed.push([Math.random(), Math.random(), Math.random()]);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: cfg.c, size: cfg.size || 0.12, transparent: true, opacity: cfg.o ?? 0.9, depthWrite: false }));
  par.add(pts);
  anim.push(t => { for (let i = 0; i < n; i++) { const [a, b, c] = seed[i], v = cfg.fn(t, a, b, c, i); pos[i * 3] = v[0]; pos[i * 3 + 1] = v[1]; pos[i * 3 + 2] = v[2]; } geo.attributes.position.needsUpdate = true; });
  return pts;
}
function stall(par, x, z, awn, goods, ry = 0) {
  const g = grp(par, x, G0, z); g.rotation.y = ry;
  P(GE.box, WOOD, g, 0, 0.22, 0, 0.7, 0.44, 0.36);
  [[-0.32, -0.16], [0.32, -0.16], [-0.32, 0.16], [0.32, 0.16]].forEach(([a, b]) => P(GE.cyl, WOOD2, g, a, 0.5, b, 0.025, 1, 0.025));
  const aw = P(GE.box, M(awn), g, 0, 1.0, 0.04, 0.82, 0.05, 0.5); aw.rotation.x = 0.18;
  for (let i = 0; i < 4; i++) P(GE.box, M(0xffffff), g, -0.3 + i * 0.2, 1.005, 0.04, 0.08, 0.052, 0.5).rotation.x = 0.18;
  goods.forEach((c, i) => P(GE.sph, M(c), g, -0.22 + i * 0.15, 0.5, 0, 0.07));
  return g;
}
// trang phục & văn hóa từng thị trường
const FOLK = [
  { body: [0x2f6f9a, 0x5a5a6a, 0x9fd4ef], hat: null, goods: [0x5cc4e6, 0x333333, 0x9fd4ef], awn: 0x2f7fb5 },
  { body: [0x8a2a2a, 0x2a4a6a, 0xe6e6e6], hat: { c: 0xd6453a, w: 0.1, h: 0.12, cone: true }, goods: [0xf4f4f4, 0x8e9aa9, 0x3f7a52], awn: 0x5b6f86 },
  { body: [0xf2a73b, 0xe8604c, 0x3aa0d8], hat: { c: 0xf3e3b0, w: 0.2, h: 0.03 }, goods: [0xf2a73b, 0xe8604c, 0xfff4e0], awn: 0xc07a1f },
  { body: [0x4f9a4a, 0xf4efe2, 0x7cc36a], hat: { c: 0xd9c38a, w: 0.2, h: 0.08, cone: true }, goods: [0x7cc36a, 0xf2b53a, 0x4f9a4a], awn: 0x3f8a45 },
  { body: [0xc0587e, 0x2b3f6b, 0xf6ecd8], hat: null, goods: [0xf08fae, 0xf6ecd8, 0x9a3a3a], awn: 0xc0587e },
  { body: [0x44566e, 0xf2b53a, 0x3aa0d8], hat: { c: 0xf2b53a, w: 0.12, h: 0.07 }, goods: [0xe8604c, 0x3aa0d8, 0xf2a73b], awn: 0x44566e },
  { body: [0xb8522a, 0x6a3f2c, 0xf2b53a], hat: { c: 0xe6c88a, w: 0.2, h: 0.08, cone: true }, goods: [0xff7a2a, 0x6a3f2c, 0xf2b53a], awn: 0xb8522a },
];
islands.forEach((I, m) => {
  const F = FOLK[m], g = I.g, life = grp(g); I.life = life;
  stall(life, -1.55, 1.35, F.awn, F.goods, 0.6);
  for (let k = 0; k < (small ? 1 : 2); k++) walker(life, { body: F.body[k], hat: k === 1 ? null : F.hat, cx: 0, cz: 0.2, rx: 1.75 - k * 0.12, rz: 1.45, sp: 0.22 + k * 0.05, ph: k * 2.1, dir: k % 2 ? -1 : 1, s: 0.9 });
  const buyer = pawn(life, F.body[2], 0xe8b890, F.hat, 0.9); buyer.position.set(-1.25, G0, 1.75); buyer.rotation.y = -2.4;
  buyer.userData.va.mode = 'talk';
});
// điểm nhấn văn hóa / thời tiết theo đảo
(() => {
  const I = islands;
  // Hải Lam: drone giao hàng
  for (let k = 0; k < 2; k++) { const d = grp(I[0].g); P(GE.box, M(0x333a44), d, 0, 0, 0, 0.26, 0.06, 0.26); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => P(GE.cyl, M(0xe6e6e6, { transparent: true, opacity: 0.6 }), d, a * 0.17, 0.04, b * 0.17, 0.09, 0.01, 0.09)); P(GE.box, M(0xf2b53a), d, 0, -0.1, 0, 0.12, 0.12, 0.12);
    anim.push(t => { const a = t * 0.5 + k * Math.PI; d.position.set(Math.cos(a) * 1.9, G0 + 2.6 + Math.sin(t * 1.3 + k) * 0.25, Math.sin(a) * 1.9); d.rotation.y = -a; }); }
  // Bắc Phong: tuyết rơi
  particles(I[1].g, 60, { c: 0xffffff, size: 0.09, fn: (t, a, b, c) => [(a - 0.5) * 5, G0 + 4.2 - ((t * 0.35 + c * 4) % 4), (b - 0.5) * 5] });
  // Kim Sa: dù bãi biển + người lướt sóng
  [[1.7, 1.5, 0xe8604c], [2.05, 0.7, 0x3aa0d8]].forEach(([x, z, c]) => { P(GE.cyl, M(0xffffff), I[2].g, x, G0 + 0.45, z, 0.02, 0.9, 0.02); P(GE.cone, M(c), I[2].g, x, G0 + 0.95, z, 0.42, 0.22, 0.42); });
  const surf = grp(I[2].g); P(GE.box, M(0xf2b53a), surf, 0, 0, 0, 0.7, 0.04, 0.18); const sp = pawn(surf, 0x3aa0d8, 0xe8b08c, null, 0.8); sp.position.y = 0.02; sp.rotation.y = Math.PI / 2;
  anim.push(t => { const a = t * 0.3; surf.position.set(Math.cos(a) * 3.6, -0.02 + Math.sin(t * 2) * 0.05, Math.sin(a) * 3.6); surf.rotation.y = -a; surf.rotation.z = Math.sin(t * 2) * 0.12; });
  // Lục Đảo: đàn chim
  for (let k = 0; k < 5; k++) { const b = grp(I[3].g); [-1, 1].forEach(s => { const w = P(GE.box, M(0xffffff), b, s * 0.12, 0, 0, 0.22, 0.02, 0.07); w.userData.s = s; });
    anim.push(t => { const a = t * 0.45 + k * 0.35; b.position.set(Math.cos(a) * (2.4 + k * 0.1), G0 + 3.2 + Math.sin(t + k) * 0.2, Math.sin(a) * (2.4 + k * 0.1)); b.rotation.y = -a; b.children.forEach(w => w.rotation.z = w.userData.s * Math.sin(t * 9 + k) * 0.5); }); }
  // Nhật Quang: cánh hoa rơi
  particles(I[4].g, 50, { c: 0xf6b8cb, size: 0.11, fn: (t, a, b, c) => { const y = (t * 0.25 + c * 3) % 3; return [(a - 0.5) * 4.6 + Math.sin(t + a * 9) * 0.3, G0 + 3.1 - y, (b - 0.5) * 4.6 + y * 0.3]; } });
  // Tân Cảng: tàu hàng ra vào
  const ship = grp(I[5].g); P(GE.box, M(0x2b3f6b), ship, 0, 0.1, 0, 1.3, 0.3, 0.42); P(GE.box, M(0xffffff), ship, -0.45, 0.4, 0, 0.3, 0.3, 0.36);
  [0xe8604c, 0x3aa0d8, 0xf2a73b].forEach((c, i) => P(GE.box, M(c), ship, -0.05 + i * 0.3, 0.37, 0, 0.26, 0.2, 0.34));
  anim.push(t => { const a = t * 0.18; ship.position.set(Math.cos(a) * 3.9, -0.1 + Math.sin(t * 1.4) * 0.04, Math.sin(a) * 3.9); ship.rotation.y = -a + Math.PI; });
  // Hỏa Sơn: khói núi lửa
  particles(I[6].g, 36, { c: 0x6a5a55, size: 0.34, o: 0.55, fn: (t, a, b, c) => { const y = (t * 0.4 + c * 3) % 3; return [Math.sin(a * 9 + t * 0.3) * y * 0.35, G0 + 2.4 + y, -0.2 + Math.cos(b * 9) * y * 0.3 - y * 0.25]; } });
})();
// Vàm Thịnh: chợ nổi, người dân, khói bếp
(() => {
  const FRUIT = [0xf2b53a, 0x7cc36a, 0xe8604c, 0x9a4a8a, 0xf28a3a];
  for (let k = 0; k < 3; k++) {
    const x = grp(home); P(GE.cap, WOOD, x, 0, 0, 0, 0.18, 0.4, 0.22).rotation.z = Math.PI / 2; P(GE.box, WOOD2, x, 0, 0.12, 0, 1.0, 0.04, 0.34);
    for (let f = 0; f < 5; f++) P(GE.sph, M(FRUIT[(f + k) % 5]), x, -0.3 + f * 0.15, 0.2 + (f % 2) * 0.05, (f % 2 - 0.5) * 0.12, 0.07);
    const rower = pawn(x, [0x2b5f7a, 0x9a3a3a, 0x3f6b3a][k], 0xe2a882, { c: 0xe6c88a, w: 0.22, h: 0.09, cone: true }, 0.85); rower.position.set(0.38, 0.08, 0); rower.rotation.y = -Math.PI / 2;
    const oar = P(GE.box, WOOD2, x, 0.22, 0.3, 0.12, 0.03, 0.6, 0.03);
    const cx = [-2.2, 3.4, 0.4][k], cz = [5.6, 5.2, 7.6][k], rr_ = [0.9, 0.7, 1.1][k];
    anim.push(t => { const a = t * 0.15 + k * 2; x.position.set(cx + Math.cos(a) * rr_, -0.08 + Math.sin(t * 1.5 + k) * 0.03, cz + Math.sin(a) * rr_ * 0.6); x.rotation.y = -a; oar.rotation.z = Math.sin(t * 2.4 + k) * 0.5; });
  }
  const V = [[0x7a4a6a, { c: 0xe6c88a, w: 0.22, h: 0.09, cone: true }], [0x2f6f7a, null], [0xf2b53a, null], [0x3f6b3a, { c: 0xe6c88a, w: 0.22, h: 0.09, cone: true }]];
  V.forEach(([c, h], k) => walker(home, { body: c, hat: h, head: 0xe2a882, cx: 0.6, cz: -0.9, rx: 2.4 - k * 0.25, rz: 1.1, sp: 0.18 + k * 0.04, ph: k * 1.6, dir: k % 2 ? -1 : 1 }));
  const kid = pawn(home, 0xe8765a, 0xf0c09c, null, 0.65); kid.userData.va.mode = 'walk'; anim.push(t => { kid.position.set(0.9 + Math.sin(t * 1.1) * 0.8, G0 + Math.abs(Math.sin(t * 6)) * 0.08, -0.3); kid.rotation.y = Math.cos(t * 1.1) > 0 ? Math.PI / 2 : -Math.PI / 2; });
  particles(home, 22, { c: 0xeae6df, size: 0.28, o: 0.5, fn: (t, a, b, c) => { const y = (t * 0.3 + c * 2.2) % 2.2; return [-1.9 + 0.55 + Math.sin(t + a * 6) * y * 0.25, G0 + 2.4 + y, -1.6 - 0.3 + y * 0.2]; } });
  P(GE.box, M(0x8a6a5a), home, -1.35, G0 + 2.25, -1.9, 0.18, 0.5, 0.18);
  if (dark) particles(home, 26, { c: 0xfff2a0, size: 0.1, fn: (t, a, b, c) => [(a - 0.5) * 7 + Math.sin(t * 0.7 + c * 9) * 0.4, G0 + 0.5 + b * 1.2 + Math.sin(t * 1.3 + a * 9) * 0.2, 1 + (c - 0.5) * 6] });
})();
// hành trình thuyền: tuyến chấm, bọt mũi, cập bến
(() => {
  const N = 26, dots = [], dm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, depthWrite: false });
  for (let i = 0; i < N; i++) { const d = new THREE.Mesh(GE.sph, dm); d.scale.set(0.09, 0.03, 0.09); d.visible = false; scene.add(d); dots.push(d); }
  const spray = particles(scene, 30, { c: 0xffffff, size: 0.12, o: 0.85, fn: (t, a, b, c, i) => { const f = new THREE.Vector3(Math.cos(boat.rotation.y), 0, -Math.sin(boat.rotation.y)), side = i % 2 ? 1 : -1, k = (t * 1.6 + c) % 1;
    return [boat.position.x + f.x * (1.1 - k * 0.6) + f.z * side * k * 0.6, 0.05 + Math.sin(k * Math.PI) * 0.3, boat.position.z + f.z * (1.1 - k * 0.6) - f.x * side * k * 0.6]; } });
  const rings = []; for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.72, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.position.y = -0.06; scene.add(r); rings.push(r); }
  let prev = boat.position.clone(), moving = false, dockT = -1, sail0 = boat.userData.sail ? 1 : 0;
  const sailMesh = []; boat.traverse(o => { if (o.material && boat.userData.sail && o.material === boat.userData.sail) sailMesh.push(o); });
  anim.push(t => {
    const dt = LIFE.dt || 0.016, v = boat.position.distanceTo(prev) / Math.max(dt, 1e-3); prev.copy(boat.position);
    const was = moving; moving = v > 0.4; spray.visible = moving; spray.material.opacity = Math.min(0.85, v * 0.2);
    sailMesh.forEach(s => { s.scale.z += ((moving ? 1.7 : 1) - s.scale.z) * Math.min(1, dt * 3); });
    if (was && !moving) { dockT = 0; rings.forEach(r => r.position.set(boat.position.x, -0.06, boat.position.z)); if (typeof sfx === 'function') sfx('pop'); }
    if (dockT >= 0) { dockT += dt; rings.forEach((r, i) => { const k = Math.max(0, dockT - i * 0.25); r.scale.setScalar(1 + k * 3); r.material.opacity = Math.max(0, 0.6 - k * 0.5); }); if (dockT > 2) dockT = -1; }
    const bk = sync.boatKey || 'dock', show = (bk[0] === 'm' || bk === 'dock' || bk === 'home') && boatGoal.distanceTo(boat.position) > 1.2;
    for (let i = 0; i < N; i++) { const d = dots[i]; d.visible = show; if (!show) continue; const k = (i + (t * 2) % 1) / N;
      d.position.lerpVectors(boat.position, boatGoal, k); d.position.y = -0.04; d.scale.set(0.09 * (1 - k * 0.5), 0.03, 0.09 * (1 - k * 0.5)); }
  });
})();

/* ---------- sự kiện kịch tính: bầu trời, sấm chớp, pháo hoa, biểu ngữ ---------- */
const tint = document.createElement('div'); tint.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:2;transition:background .8s;background:transparent';
const flash = document.createElement('div'); flash.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:3;background:#fff;opacity:0';
const banner = document.createElement('div'); banner.style.cssText = 'position:absolute;left:50%;top:56px;transform:translate(-50%,-20px);opacity:0;transition:all .45s cubic-bezier(.2,1.4,.4,1);z-index:6;pointer-events:none;width:min(420px,calc(100% - 24px));border-radius:18px;padding:12px 16px;color:#fff;box-shadow:0 6px 0 rgba(0,0,0,.2);font:700 13px/1.4 inherit;text-align:center';
wrap.append(tint, flash, banner);
const EVSTY = { storm: ['#3a4452', '⛈️', 'Sóng gió thị trường', 'Market storm'], fair: ['#e8762d', '🎪', 'Cơ hội bùng nổ', 'Opportunity'], tariff: ['#a8322a', '🛃', 'Rào cản chính sách', 'Policy barrier'], home: ['#2f6f7a', '⚙️', 'Biến động nội bộ', 'Internal shake-up'] };
function evBanner(ev, kind, tg) {
  if (!ev) { banner.style.opacity = 0; banner.style.transform = 'translate(-50%,-20px)'; tint.style.background = 'transparent'; U.amp.value = 1; return; }
  const s = EVSTY[kind] || EVSTY.home;
  banner.style.background = s[0];
  banner.innerHTML = '<div style="font:800 11px/1 inherit;letter-spacing:.08em;text-transform:uppercase;opacity:.85">' + s[1] + ' ' + tr(s[2], s[3]) + '</div><div style="font:800 17px/1.25 inherit;margin-top:5px"></div><div style="opacity:.9;margin-top:3px;font-size:12px"></div>';
  banner.children[1].textContent = tr(ev.t, ev.tEn || ev.t);
  banner.children[2].textContent = tg && tg[0] >= 0 ? tr('Tác động tới: ', 'Affects: ') + tg.map(m => MK[m].icon + ' ' + MK[m].name).join(', ') : tr('Tác động tới: 🏡 Vàm Thịnh', 'Affects: 🏡 Vàm Thịnh');
  requestAnimationFrame(() => { banner.style.opacity = 1; banner.style.transform = 'translate(-50%,0)'; });
  clearTimeout(evBanner.t); evBanner.t = setTimeout(() => { banner.style.opacity = 0; banner.style.transform = 'translate(-50%,-20px)'; }, 5200);
  tint.style.background = kind === 'storm' ? 'radial-gradient(ellipse at 50% 30%, rgba(30,40,55,.18), rgba(20,28,40,.45))' : kind === 'tariff' ? 'radial-gradient(ellipse at 50% 40%, transparent, rgba(120,20,20,.22))' : kind === 'fair' ? 'radial-gradient(ellipse at 50% 20%, rgba(255,200,90,.18), transparent 70%)' : 'transparent';
  if (kind === 'tariff') { shake = 0.5; }
}
const fw = particles(scene, 90, { c: 0xffd36a, size: 0.2, fn: (t, a, b, c, i) => {
  if (EVFX.kind !== 'fair' || !EVFX.tg || EVFX.tg[0] < 0) return [0, -50, 0];
  const m = EVFX.tg[i % EVFX.tg.length], p = IPOS[m], cyc = (t * 0.5 + (i % 3) * 0.33) % 1, burst = Math.floor(t * 0.5 + (i % 3) * 0.33), ang = a * 6.283 + burst, el = b * 3.14 - 1.57, r = cyc * 2.2;
  return [p.x + Math.cos(ang) * Math.cos(el) * r + ((i % 3) - 1) * 1.2, 5.2 + Math.sin(el) * r - cyc * cyc * 1.4, p.z + Math.sin(ang) * Math.cos(el) * r]; } });
const fwCols = [0xffd36a, 0xff7a8a, 0x7ad3ff];
anim.push(t => {
  const k = EVFX.kind;
  U.amp.value += ((k === 'storm' ? 3.2 : 1) - U.amp.value) * 0.03;
  if (scene.fog) scene.fog.color.lerp(new THREE.Color(k === 'storm' ? 0x6a7480 : (dark ? 0x0d2a33 : 0xd4ecef)), 0.03);
  if (k === 'storm') { const f = Math.sin(t * 9) > 0.93 ? 0.55 : Math.sin(t * 9 + 0.3) > 0.97 ? 0.3 : 0; flash.style.opacity = f; if (f > 0.5 && !anim.thund) { anim.thund = 1; sfx('storm'); setTimeout(() => anim.thund = 0, 3000); } }
  else flash.style.opacity = 0;
  fw.material.color.setHex(fwCols[Math.floor(t * 0.5) % 3]);
  if (k === 'storm') { boat.rotation.z = Math.sin(t * 2.2) * 0.12; } else boat.rotation.z *= 0.95;
});

/* ---------- đối đầu Kim Long: lựa chọn chiến lược ---------- */
const DUEL_OPT = [
  { ic: '🏷️', vi: 'Giảm giá đối đầu', en: 'Price war', ex: ['Chiến lược chi phí thấp: giành khách nhanh nhưng bào mòn biên lợi nhuận và dễ kéo cả hai vào vòng xoáy giảm giá.', 'Cost leadership: wins customers fast but erodes margins and can drag both firms into a price spiral.'], fx: { cash: -0.4, rep: -3, resil: 0 }, kl: 'stay' },
  { ic: '✨', vi: 'Khác biệt hoá thương hiệu', en: 'Differentiate', ex: ['Khác biệt hoá: đầu tư vào câu chuyện, chất lượng, bao bì để khách sẵn lòng trả giá cao hơn. Tốn vốn, nhưng lợi thế bền.', 'Differentiation: invest in story, quality and packaging so customers pay a premium. Costly, but the edge lasts.'], fx: { cash: -0.6, rep: 6, resil: 2 }, kl: 'back' },
  { ic: '🤝', vi: 'Liên minh đối tác địa phương', en: 'Local alliance', ex: ['Liên minh chiến lược: dựa vào đối tác bản địa để có kênh phân phối và hiểu biết văn hoá, chia sẻ rủi ro lẫn lợi nhuận.', 'Strategic alliance: lean on a local partner for distribution and cultural know-how, sharing both risk and profit.'], fx: { cash: -0.2, rep: 2, resil: 6 }, kl: 'back' },
];
const duelCard = document.createElement('div');
duelCard.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.9);opacity:0;pointer-events:none;transition:all .3s;z-index:8;width:min(440px,calc(100% - 20px));max-height:calc(100% - 20px);overflow:auto;background:#fffaf0;color:#033337;border-radius:20px;padding:14px;box-shadow:0 8px 0 rgba(168,50,42,.35);border:3px solid #e8472d';
wrap.appendChild(duelCard);
const DK = 'bizon-bp3d-duels'; let DD = {}; try { DD = JSON.parse(localStorage.getItem(DK) || '{}'); } catch (e) {}
window.__bp3dDuel = m => {
  const B = window.__bp; if (!B || !B.S) return; const key = (B.S.firm | 0) + ':' + m; if (DD[key] !== undefined) return;
  duelCard.innerHTML = '<div style="font:800 11px/1 inherit;letter-spacing:.08em;text-transform:uppercase;color:#e8472d">⚔️ ' + tr('Đối đầu tại ', 'Face-off in ') + MK[m].icon + ' ' + MK[m].name + '</div>' +
    '<div style="font:800 17px/1.3 inherit;margin:6px 0 4px">' + tr('Kim Long vừa hạ giá 15% ngay cạnh cửa hàng của bạn. Đội phản ứng thế nào?', 'Kim Long just cut prices 15% right next to your store. How does the team respond?') + '</div>' +
    '<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">' + DUEL_OPT.map((o, i) => '<button type="button" data-i="' + i + '" style="text-align:left;border:2px solid rgba(3,51,55,.15);background:#fff;border-radius:14px;padding:10px 12px;cursor:pointer;font:700 13px/1.35 inherit;color:#033337;min-height:44px"><b style="font-size:14px">' + o.ic + ' ' + tr(o.vi, o.en) + '</b><br><span style="opacity:.7;font-size:11.5px">' + tr('Tiền ', 'Cash ') + o.fx.cash + tr(' tỷ · Uy tín ', 'B · Rep ') + (o.fx.rep > 0 ? '+' : '') + o.fx.rep + tr(' · Chống chịu +', ' · Resilience +') + o.fx.resil + '</span></button>').join('') + '</div>';
  duelCard.style.pointerEvents = 'auto'; duelCard.style.opacity = 1; duelCard.style.transform = 'translate(-50%,-50%) scale(1)'; userKey = 'm' + m; autoCam = true;
  duelCard.onclick = e => {
    const b = e.target.closest('button[data-i]'); if (!b) return; const o = DUEL_OPT[+b.dataset.i], S = B.S;
    if (b.dataset.done) { duelCard.style.opacity = 0; duelCard.style.pointerEvents = 'none'; return; }
    DD[key] = +b.dataset.i; try { localStorage.setItem(DK, JSON.stringify(DD)); } catch (er) {}
    S.cash = Math.round((S.cash + o.fx.cash) * 10) / 10; S.rep = Math.max(0, Math.min(100, S.rep + o.fx.rep)); if (S.resil != null) S.resil = Math.max(0, Math.min(100, S.resil + o.fx.resil));
    (S.foot = S.foot || []).push(tr('⚔️ ' + MK[m].name + ': chọn "' + o.vi + '" khi đối đầu Kim Long.', '⚔️ ' + MK[m].name + ': chose "' + o.en + '" against Kim Long.'));
    const I = islands[m]; if (I.rival && o.kl === 'back') { I.rival.userData.retreat = 1; }
    sfx(o.kl === 'back' ? 'cheer' : 'coin'); landed.forEach(l => { if (l.r.parent === I.g) l.cheer = 2.5; });
    duelCard.innerHTML = '<div style="font:800 15px/1.3 inherit">' + o.ic + ' ' + tr(o.vi, o.en) + '</div><p style="margin:8px 0;font:600 13px/1.5 inherit;text-wrap:pretty">' + tr(o.ex[0], o.ex[1]) + '</p><div style="font:700 12px/1.4 inherit;opacity:.75">' + tr('Đã áp dụng: tiền ', 'Applied: cash ') + o.fx.cash + tr(' tỷ, uy tín ', 'B, rep ') + (o.fx.rep > 0 ? '+' : '') + o.fx.rep + (o.kl === 'back' ? tr(' · Kim Long lùi bước.', ' · Kim Long backs off.') : tr(' · Kim Long vẫn bám trụ.', ' · Kim Long holds on.')) + '</div><button type="button" data-i="0" data-done="1" style="margin-top:10px;border:0;border-radius:999px;background:#033337;color:#fff;padding:10px 18px;font:800 13px/1 inherit;cursor:pointer;min-height:44px">' + tr('Tiếp tục', 'Continue') + '</button>';
    window.dispatchEvent(new CustomEvent('bp3d-duel', { detail: { m, choice: +b.dataset.i } }));
  };
};
anim.push(() => { islands.forEach(I => { if (I.rival && I.rival.userData.retreat) { I.rival.position.x += (-IR * 0.75 - I.rival.position.x) * 0.02; I.rival.rotation.y += (Math.PI - I.rival.rotation.y) * 0.03; } }); });
islands.forEach((I, m) => { const B = window.__bp; if (B && B.S && DUEL_OPT[DD[(B.S.firm | 0) + ':' + m]] && DUEL_OPT[DD[(B.S.firm | 0) + ':' + m]].kl === 'back' && I.rival) I.rival.userData.retreat = 1; });

/* ---------- họp cố vấn: hội thoại nhiều lượt ---------- */
const CONVO = { q: [], i: 0, t: 0, on: false };
function short(s) { return s.length > 40 ? s.slice(0, 38).replace(/\s\S*$/, '') + '…' : s; }
function buildConvo() {
  const B = window.__bp; if (!B || !B.S) return [];
  const S = B.S, n = S.entered.filter(v => v !== null && v !== undefined).length, avg = Math.round(S.know.reduce((a, b) => a + b, 0) / S.know.length), q = Math.min(6, S.q + 1);
  const L = [];
  L.push(['Lumina AI', tr('Quý ' + q + '/6. Tiền mặt ' + S.cash + ' tỷ, đã vào ' + n + '/7 thị trường, tri thức trung bình ' + avg + '%.', 'Quarter ' + q + '/6. Cash ' + S.cash + 'B, in ' + n + '/7 markets, average intel ' + avg + '%.')]);
  if (avg < 40) { L.push(['Lina Park', tr('Sương mù còn dày. Mua tin trước khi thâm nhập giúp tránh đoán sai nhu cầu – nghiên cứu thị trường rẻ hơn một lần thất bại.', 'The fog is still thick. Buying intel before entering avoids misreading demand – research is cheaper than one failure.')]); L.push(['Bà Sáu Lành', tr('Hồi má bán ghe chợ nổi, cũng phải hỏi giá mấy ghe bên cạnh trước rồi mới hét giá.', 'When I sold on the floating market, I asked the boats next door first before naming my price.')]); }
  else L.push(['An Nhiên', tr('Mình đã hiểu khách rồi. Giờ là lúc kể câu chuyện thương hiệu Vàm Thịnh cho đúng văn hoá từng nước.', 'We understand the customers now. Time to tell the Vàm Thịnh brand story in a way that fits each culture.')]);
  if (S.cash < 2.5) L.push(['Minh Khang', tr('Tiền đang mỏng. Xuất khẩu tốn ít vốn nhất; liên doanh cần nhiều vốn hơn nhưng đổi lại kiểm soát và hiểu thị trường tốt hơn.', 'Cash is thin. Exporting needs the least capital; a joint venture needs more but gives more control and market insight.')]);
  else L.push(['Minh Khang', tr('Còn dư địa vốn. Nhớ quy tắc: càng cam kết nguồn lực lớn, rủi ro càng cao nhưng lợi nhuận tiềm năng cũng cao hơn.', 'We still have room. Remember: the more resources committed, the higher the risk – and the higher the potential return.')]);
  if (S.rival && S.rival.in && S.rival.in.length) L.push(['Victor Lâm', tr('Kim Long đang ở ' + S.rival.in.map(m => MK[m].name).join(', ') + '. Đấu giá trực diện tốn kém; khác biệt hoá hoặc liên minh thường bền hơn.', 'Kim Long is in ' + S.rival.in.map(m => MK[m].name).join(', ') + '. A head-on price fight is costly; differentiation or alliances usually last longer.')]);
  else L.push(['Victor Lâm', tr('Kim Long chưa ra khơi. Người đến trước có lợi thế, nhưng đến trước mà chưa hiểu thị trường thì cũng dễ trả giá.', 'Kim Long hasn\'t set sail yet. First movers gain an edge – but moving first without understanding the market is expensive.')]);
  L.push(['Bà Sáu Lành', tr('Chậm mà chắc nghen tụi con. Uy tín gầy dựng cả đời, mất chỉ một mùa.', 'Slow and steady, kids. A reputation takes a lifetime to build and one season to lose.')]);
  return L;
}
window.__bp3dConvo = () => CONVO.on && CONVO.q[CONVO.i] ? { who: CONVO.q[CONVO.i][0], short: short(CONVO.q[CONVO.i][1]) } : null;
function startConvo() { CONVO.q = buildConvo(); if (!CONVO.q.length) return; CONVO.i = 0; CONVO.on = true; CONVO.t = LIFE.t; userKey = 'home'; autoCam = true; say('💬 ' + CONVO.q[0][0] + ': ' + CONVO.q[0][1], 5600); sfx('pop'); }
anim.push(t => { if (!CONVO.on) return; const cur = CONVO.q[CONVO.i], dur = 2.4 + cur[1].length * 0.035; if (t - CONVO.t > dur) { CONVO.i++; CONVO.t = t; if (CONVO.i >= CONVO.q.length) { CONVO.on = false; return; } const n = CONVO.q[CONVO.i]; say('💬 ' + n[0] + ': ' + n[1], (2.4 + n[1].length * 0.035) * 1000 + 400); } });
const cBtn = document.createElement('button'); cBtn.type = 'button'; cBtn.className = bBtn.className; cBtn.textContent = tr('💬 Họp cố vấn', '💬 Advisor huddle');
TB.insertBefore(cBtn, TB.children[2] || null); cBtn.addEventListener('click', () => { CONVO.on ? (CONVO.on = false) : startConvo(); });
let lastQ = -1; anim.push(() => { const B = window.__bp; if (!B || !B.S || B.S.phase === 'end') return; if (B.S.phase === 'obs' && B.S.q !== lastQ) { lastQ = B.S.q; if (LIFE.t > 3) setTimeout(startConvo, 1200); } });

/* ---------- sổ tay học tập + câu hỏi ôn sau mỗi lần thâm nhập ---------- */
function mkPanel(w) { const p = document.createElement('div'); p.style.cssText = 'position:absolute;left:10px;z-index:7;width:min(' + w + 'px,calc(100% - 20px));overflow:auto;background:rgba(255,250,240,.98);color:#033337;border-radius:18px;padding:14px;box-shadow:0 6px 0 rgba(3,51,55,.2);display:none;font:600 12.5px/1.5 inherit'; wrap.appendChild(p); return p; }
const hbPanel = mkPanel(460), chPanel = mkPanel(460);
const allPanels = () => [hbPanel, chPanel, bPanel, sPanel];
function openPanel(p, draw) { const on = p.style.display === 'none'; allPanels().forEach(x => x.style.display = 'none'); if (on) { draw(); p.style.display = 'block'; aboveTB(p, 8); } }
const CONCEPTS = [
  ['🪜', 'Thang cam kết nguồn lực', 'Resource commitment ladder', 'Doanh nghiệp thường đi từ cách tốn ít vốn, ít rủi ro (bán qua nền tảng số) lên cách cam kết cao hơn (xuất khẩu trực tiếp, liên doanh) khi đã hiểu thị trường. Mô hình Uppsala gọi đây là quốc tế hoá theo từng bước.', 'Firms usually move from low-capital, low-risk entry (digital platforms) toward higher commitment (direct export, joint ventures) as they learn the market. The Uppsala model calls this stepwise internationalisation.'],
  ['🧭', 'Khoảng cách tâm lý', 'Psychic distance', 'Khác biệt về ngôn ngữ, văn hoá, luật lệ, thói quen mua sắm làm việc kinh doanh ở nước ngoài khó hơn. Thị trường càng "xa", càng cần thêm tri thức trước khi cam kết vốn.', 'Differences in language, culture, law and buying habits make business abroad harder. The more "distant" a market, the more knowledge you need before committing capital.'],
  ['🔍', 'Độ tin cậy nguồn tin', 'Source reliability', 'Không phải nguồn tin nào cũng ngang nhau: dữ liệu mạng xã hội rẻ nhưng hay thổi phồng, còn thử nghiệm bán hàng đắt nhưng cho dữ liệu thật. Nên kết hợp nhiều nguồn.', 'Not all sources are equal: social data is cheap but inflated, while a sales pilot is expensive but real. Combine several sources.'],
  ['⚔️', 'Chiến lược cạnh tranh', 'Competitive strategy', 'Theo Porter, doanh nghiệp thắng bằng chi phí thấp hoặc khác biệt hoá. Liên minh chiến lược giúp chia sẻ rủi ro và mượn năng lực của đối tác.', 'Per Porter, firms win through cost leadership or differentiation. Strategic alliances share risk and borrow a partner\'s capabilities.'],
];
function drawHandbook() {
  const B = window.__bp, MD = B && B.MODES ? B.MODES : [];
  const bar = v => '<span style="display:inline-block;width:52px;height:7px;border-radius:9px;background:rgba(3,51,55,.1);vertical-align:middle"><i style="display:block;height:100%;width:' + Math.round(v * 100) + '%;border-radius:9px;background:#2f8a8c"></i></span>';
  hbPanel.innerHTML = '<div style="font:800 15px/1.2 inherit;margin-bottom:10px">📘 ' + tr('Sổ tay quốc tế hoá', 'Internationalisation handbook') + '</div>' +
    '<div style="font:800 12px/1 inherit;text-transform:uppercase;letter-spacing:.05em;opacity:.6;margin-bottom:6px">' + tr('3 phương thức thâm nhập', '3 entry modes') + '</div>' +
    '<div style="display:grid;gap:6px">' + MD.map(md => '<div style="background:#fff;border-radius:12px;padding:8px 10px"><b style="font-size:13.5px">' + md.icon + ' ' + tr(md.name, md.nameEn) + '</b> <span style="opacity:.6">· ' + tr(md.note, md.noteEn) + '</span>' +
      '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3px 12px;margin-top:5px;font-size:11.5px">' +
      '<span>' + tr('Vốn ', 'Capital ') + md.cost + tr(' tỷ', 'B') + '</span><span>' + tr('Biên LN ', 'Margin ') + Math.round(md.margin * 100) + '%</span>' +
      '<span>' + tr('Quy mô ', 'Reach ') + bar(md.scale / 1.3) + '</span><span>' + tr('Chi phí vận hành ', 'Op. cost ') + bar(md.op / 0.5) + '</span></div></div>').join('') + '</div>' +
    '<div style="font:800 12px/1 inherit;text-transform:uppercase;letter-spacing:.05em;opacity:.6;margin:12px 0 6px">' + tr('Khái niệm then chốt', 'Key concepts') + '</div>' +
    CONCEPTS.map(c => '<details style="background:#fff;border-radius:12px;padding:8px 10px;margin-bottom:6px"><summary style="cursor:pointer;font-weight:800">' + c[0] + ' ' + tr(c[1], c[2]) + '</summary><p style="margin:6px 0 0;text-wrap:pretty">' + tr(c[3], c[4]) + '</p></details>').join('');
}
const hbBtn = document.createElement('button'); hbBtn.type = 'button'; hbBtn.className = bBtn.className; hbBtn.textContent = tr('📘 Sổ tay', '📘 Handbook');
TB.appendChild(hbBtn); hbBtn.addEventListener('click', () => openPanel(hbPanel, drawHandbook));
bBtn.addEventListener('click', () => { hbPanel.style.display = chPanel.style.display = 'none'; });
sBtn.addEventListener('click', () => { hbPanel.style.display = chPanel.style.display = 'none'; });
// câu hỏi ôn tập ngắn sau khi thâm nhập
const QUIZ = [
  [['Bán qua nền tảng số phù hợp nhất khi nào?', 'When does a digital platform fit best?'], [['Muốn thử thị trường với ít vốn, chấp nhận lời mỏng', 'You want to test with little capital, accepting thin margins'], ['Muốn kiểm soát toàn bộ kênh phân phối', 'You want full control of distribution'], ['Đã hiểu rất rõ thị trường', 'You already know the market very well']], 0],
  [['Xuất khẩu trực tiếp đổi lại điều gì so với nền tảng số?', 'What does direct export trade for, vs. a platform?'], [['Tốn ít vốn hơn', 'Less capital'], ['Tốn vốn hơn nhưng kiểm soát và biên lợi nhuận tốt hơn', 'More capital, but more control and better margins'], ['Không cần hiểu thị trường', 'No market knowledge needed']], 1],
  [['Rủi ro lớn nhất khi đi cùng đối tác địa phương?', 'Biggest risk of a local partner?'], [['Không có mạng lưới phân phối', 'No distribution network'], ['Phụ thuộc vào đối tác và phải chia lợi nhuận', 'Dependence on the partner and shared profits'], ['Chi phí vận hành quá thấp', 'Operating costs too low']], 1],
];
const QZK = 'bizon-bp3d-quiz'; let QZ = {}; try { QZ = JSON.parse(localStorage.getItem(QZK) || '{}'); } catch (e) {}
const qzCard = document.createElement('div'); qzCard.style.cssText = duelCard.style.cssText.replace('#e8472d', '#2f8a8c').replace('rgba(168,50,42,.35)', 'rgba(47,138,140,.35)'); wrap.appendChild(qzCard);
function quiz(md) {
  const B = window.__bp; if (!B || !B.S) return; const key = (B.S.firm | 0) + ':' + md; if (QZ[key] !== undefined || !QUIZ[md]) return;
  const [qq, opts, ok] = QUIZ[md];
  qzCard.innerHTML = '<div style="font:800 11px/1 inherit;letter-spacing:.08em;text-transform:uppercase;color:#2f8a8c">📘 ' + tr('Ôn nhanh · Lumina hỏi', 'Quick check · Lumina asks') + '</div><div style="font:800 16px/1.3 inherit;margin:6px 0 10px">' + tr(qq[0], qq[1]) + '</div>' +
    opts.map((o, i) => '<button type="button" data-i="' + i + '" style="display:block;width:100%;text-align:left;border:2px solid rgba(3,51,55,.15);background:#fff;border-radius:14px;padding:10px 12px;margin-bottom:7px;cursor:pointer;font:700 13px/1.35 inherit;color:#033337;min-height:44px">' + tr(o[0], o[1]) + '</button>').join('');
  qzCard.style.pointerEvents = 'auto'; qzCard.style.opacity = 1; qzCard.style.transform = 'translate(-50%,-50%) scale(1)';
  qzCard.onclick = e => { const b = e.target.closest('button[data-i]'); if (!b) return;
    if (b.dataset.done) { qzCard.style.opacity = 0; qzCard.style.pointerEvents = 'none'; return; }
    const i = +b.dataset.i, right = i === ok; QZ[key] = right ? 1 : 0; try { localStorage.setItem(QZK, JSON.stringify(QZ)); } catch (er) {}
    [...qzCard.querySelectorAll('button[data-i]')].forEach((x, j) => { x.style.borderColor = j === ok ? '#3f8a44' : j === i ? '#c0443a' : 'rgba(3,51,55,.1)'; x.style.background = j === ok ? '#e6f4e1' : j === i ? '#fbe4e1' : '#fff'; x.disabled = true; });
    sfx(right ? 'coin' : 'pop');
    const f = document.createElement('div'); f.style.cssText = 'margin-top:6px;font:700 12.5px/1.45 inherit;text-wrap:pretty'; f.textContent = right ? tr('✅ Chính xác! Mở 📘 Sổ tay để xem so sánh đầy đủ.', '✅ Correct! Open 📘 Handbook for the full comparison.') : tr('Chưa đúng – đáp án xanh là đáp án đúng. Xem thêm trong 📘 Sổ tay.', 'Not quite – the green answer is correct. See 📘 Handbook.');
    const c = document.createElement('button'); c.type = 'button'; c.dataset.i = '0'; c.dataset.done = '1'; c.textContent = tr('Tiếp tục', 'Continue'); c.style.cssText = 'margin-top:10px;border:0;border-radius:999px;background:#033337;color:#fff;padding:10px 18px;font:800 13px/1 inherit;cursor:pointer;min-height:44px';
    qzCard.append(f, c); };
}
let entSeen = null; anim.push(() => { const B = window.__bp; if (!B || !B.S) return; const e = B.S.entered.map(v => v === null || v === undefined ? -1 : v).join(',');
  if (entSeen === null) { entSeen = e; return; } if (e !== entSeen) { const a = entSeen.split(','), b = e.split(','); entSeen = e; const m = b.findIndex((v, i) => v !== a[i] && +v >= 0); if (m >= 0) setTimeout(() => quiz(+b[m]), 5200); } });

/* ---------- biểu đồ kết quả mỗi quý ---------- */
const HK = 'bizon-bp3d-hist'; let HIST = {}; try { HIST = JSON.parse(localStorage.getItem(HK) || '{}'); } catch (e) {}
let hq = null;
anim.push(() => { const B = window.__bp; if (!B || !B.S) return; const S = B.S, f = S.firm | 0;
  if (S.q === 0 && S.phase === 'obs' && HIST[f] && HIST[f].length && HIST[f][HIST[f].length - 1].q > 0) HIST[f] = [];
  if (hq === S.q) return; const first = hq === null; hq = S.q;
  const arr = HIST[f] = HIST[f] || []; if (!arr.length || arr[arr.length - 1].q !== S.q) arr.push({ q: S.q, p: +S.profit.toFixed(2), rv: +(S.rival.rev || 0).toFixed(2), c: S.cash, r: Math.round(S.rep), n: S.entered.filter(v => v !== null && v !== undefined).length, k: Math.round(S.know.reduce((a, b) => a + b, 0) / 7) });
  try { localStorage.setItem(HK, JSON.stringify(HIST)); } catch (e) {}
  if (!first && S.q > 0) setTimeout(() => openPanel(chPanel, drawChart), 2600);
});
function svgLine(series, W, H, cols, labels) {
  const all = series.flat(), mx = Math.max(1, ...all), mn = Math.min(0, ...all), n = Math.max(2, series[0].length), x = i => 30 + i * (W - 44) / (n - 1), y = v => H - 22 - (v - mn) / (mx - mn || 1) * (H - 36);
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block">';
  for (let g = 0; g <= 3; g++) { const v = mn + (mx - mn) * g / 3; s += '<line x1="30" x2="' + (W - 10) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="rgba(3,51,55,.1)"/><text x="26" y="' + (y(v) + 3) + '" text-anchor="end" font-size="9" fill="#5a6b74">' + v.toFixed(1) + '</text>'; }
  for (let i = 0; i < n; i++) s += '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="9" fill="#5a6b74">Q' + i + '</text>';
  series.forEach((ser, k) => { s += '<polyline fill="none" stroke="' + cols[k] + '" stroke-width="2.5" stroke-linejoin="round" points="' + ser.map((v, i) => x(i) + ',' + y(v)).join(' ') + '"/>' + ser.map((v, i) => '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="3" fill="' + cols[k] + '"/>').join(''); });
  return s + '</svg><div style="display:flex;gap:12px;font-size:11px;margin-top:2px">' + labels.map((l, k) => '<span><i style="display:inline-block;width:10px;height:3px;background:' + cols[k] + ';vertical-align:middle;margin-right:4px"></i>' + l + '</span>').join('') + '</div>';
}
function drawChart() {
  const B = window.__bp, S = B && B.S, arr = S ? (HIST[S.firm | 0] || []) : [];
  if (arr.length < 2) { chPanel.innerHTML = '<div style="font:800 15px/1.2 inherit">📈 ' + tr('Kết quả theo quý', 'Quarterly results') + '</div><p style="margin:8px 0 0;opacity:.7">' + tr('Biểu đồ hiện sau khi hết quý đầu tiên.', 'The chart appears after the first quarter.') + '</p>'; return; }
  const a = arr[arr.length - 1], b = arr[arr.length - 2], d = (v, u = '') => (v > 0 ? '+' : '') + (Math.round(v * 10) / 10) + u;
  const chip = (l, v, dv, good) => '<div style="background:#fff;border-radius:12px;padding:7px 9px"><div style="font-size:10.5px;opacity:.6;text-transform:uppercase;letter-spacing:.04em">' + l + '</div><b style="font-size:16px">' + v + '</b> <span style="font-size:11px;font-weight:800;color:' + (good ? '#3f8a44' : dv === 0 ? '#5a6b74' : '#c0443a') + '">' + d(dv) + '</span></div>';
  chPanel.innerHTML = '<div style="font:800 15px/1.2 inherit;margin-bottom:8px">📈 ' + tr('Kết quả sau quý ', 'Results after quarter ') + a.q + '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px">' + chip(tr('Lợi nhuận lũy kế (tỷ)', 'Cum. profit (B)'), a.p, a.p - b.p, a.p >= b.p) + chip(tr('Tiền mặt (tỷ)', 'Cash (B)'), a.c, +(a.c - b.c).toFixed(1), a.c >= b.c) + chip(tr('Uy tín', 'Reputation'), a.r, a.r - b.r, a.r >= b.r) + chip(tr('Tri thức TB', 'Avg. intel'), a.k + '%', a.k - b.k, a.k >= b.k) + '</div>' +
    '<div style="background:#fff;border-radius:12px;padding:8px 10px;margin-top:8px"><b style="font-size:12px">' + tr('Bạn so với Kim Long', 'You vs. Kim Long') + '</b>' + svgLine([arr.map(x => x.p), arr.map(x => x.rv)], 400, 150, ['#2f8a8c', '#e8472d'], [tr('Lợi nhuận lũy kế của bạn', 'Your cum. profit'), tr('Doanh thu ước tính Kim Long', 'Kim Long est. revenue')]) + '</div>' +
    '<div style="background:#fff;border-radius:12px;padding:8px 10px;margin-top:8px"><b style="font-size:12px">' + tr('Uy tín & tri thức', 'Reputation & intel') + '</b>' + svgLine([arr.map(x => x.r), arr.map(x => x.k)], 400, 130, ['#f2b53a', '#6a7fdb'], [tr('Uy tín', 'Reputation'), tr('Tri thức trung bình %', 'Avg. intel %')]) + '</div>' +
    '<p style="font-size:11px;opacity:.6;margin:8px 0 0">' + tr('Đường đỏ là doanh thu ước tính của đối thủ, khác đơn vị với lợi nhuận của bạn – chỉ để so xu hướng.', 'The red line is the rival\'s estimated revenue, a different unit from your profit – compare trends only.') + '</p>';
}
const chBtn = document.createElement('button'); chBtn.type = 'button'; chBtn.className = bBtn.className; chBtn.textContent = '📈';
chBtn.setAttribute('aria-label', tr('Kết quả theo quý', 'Quarterly results')); TB.appendChild(chBtn); chBtn.addEventListener('click', () => openPanel(chPanel, drawChart));

/* ---------- màn mở đầu & kết thúc điện ảnh ---------- */
const introTitle = document.createElement('div');
introTitle.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;z-index:4;opacity:0;transition:opacity .8s;width:min(560px,92%);background:rgba(3,51,55,.72);border-radius:22px;padding:16px 18px;box-shadow:0 6px 0 rgba(3,51,55,.3)';
introTitle.innerHTML = '<div style="font:800 12px/1 inherit;letter-spacing:.3em;text-transform:uppercase;color:#fff;text-shadow:0 2px 8px rgba(3,51,55,.6)">BizOn · ' + tr('Quốc tế hoá thương hiệu', 'Brand internationalisation') + '</div><div style="font:900 clamp(28px,6vw,54px)/1.05 inherit;color:#fff;margin-top:8px;text-shadow:0 4px 0 #033337,0 8px 24px rgba(3,51,55,.5)">🛂 ' + tr('Hộ Chiếu Thương Hiệu', 'Brand Passport') + '</div><div style="font:700 14px/1.4 inherit;color:#fff;margin-top:10px;text-shadow:0 2px 6px rgba(3,51,55,.7)">' + tr('7 thị trường · 6 quý · 1 con thuyền sen từ Vàm Thịnh', '7 markets · 6 quarters · 1 lotus boat from Vàm Thịnh') + '</div>';
const stampEl = document.createElement('div');
stampEl.style.cssText = 'position:absolute;left:50%;top:44%;transform:translate(-50%,-50%) rotate(-12deg) scale(2.4);opacity:0;pointer-events:none;z-index:5;border:6px solid #c23a30;color:#c23a30;border-radius:16px;padding:10px 22px;font:900 clamp(24px,5vw,42px)/1 inherit;letter-spacing:.08em;background:rgba(255,250,240,.85);transition:transform .35s cubic-bezier(.3,1.6,.5,1),opacity .2s';
wrap.append(introTitle, stampEl);
function stamp(txt, ms = 1800) { stampEl.textContent = txt; stampEl.style.transition = 'none'; stampEl.style.opacity = 0; stampEl.style.transform = 'translate(-50%,-50%) rotate(-12deg) scale(2.4)';
  requestAnimationFrame(() => requestAnimationFrame(() => { stampEl.style.transition = ''; stampEl.style.opacity = 1; stampEl.style.transform = 'translate(-50%,-50%) rotate(-12deg) scale(1)'; shake = 0.35; sfx('pop'); }));
  setTimeout(() => { stampEl.style.opacity = 0; }, ms); }
function horn() { if (window.__bp3dMute) return; try { const a = ac(), t = a.currentTime; [110, 138].forEach(f => { const o = a.createOscillator(), g = a.createGain(); o.type = 'sawtooth'; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.07, t + 0.1); g.gain.setValueAtTime(0.07, t + 1.1); g.gain.linearRampToValueAtTime(0, t + 1.5); const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; o.connect(lp); lp.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 1.6); }); } catch (e) {} }
const endFx = { on: false, t0: 0 };
let wasIntro = null, wasEnd = null;
anim.push(t => {
  const introEl = $('bp-intro'), endEl = $('bp-end'); if (!introEl) return;
  const intro = !introEl.classList.contains('hidden'), ended = endEl && !endEl.classList.contains('hidden');
  introTitle.style.opacity = intro ? 1 : 0; const sc = Math.min(1, Math.max(0.55, (wrap.clientHeight - 40) / 300)); introTitle.style.transform = 'translate(-50%,-50%) scale(' + sc.toFixed(2) + ')';
  islands.forEach(I => { I.label.visible = !intro; }); homeLabel.visible = !intro;
  if (wasIntro === true && !intro && !ended) {
    userKey = 'home'; autoCam = true; say('🏡 ' + tr('Vàm Thịnh – cả đội lên thuyền sen, chuẩn bị ra khơi!', 'Vàm Thịnh – the team boards the lotus boat!'), 3200);
    crew.forEach(c => c.userData.wave = 2.4);
    setTimeout(() => { horn(); stamp(tr('XUẤT BẾN', 'SET SAIL')); }, 1400);
    setTimeout(() => { userKey = null; autoCam = true; }, 3600);
  }
  if (wasEnd === false && ended) { setTimeout(() => stamp(tr('HOÀN THÀNH', 'COMPLETE'), 2200), 400); endFx.on = true; endFx.t0 = t; landed.forEach(l => l.cheer = 5); sfx('cheer'); }
  if (!ended) endFx.on = false;
  wasIntro = intro; wasEnd = !!ended;
  crew.forEach((c, i) => { if (c.userData.wave > 0) { c.userData.wave -= LIFE.dt || 0.016; CLAY.animate(c, t, 'cheer', i); } else if (c.userData.wave !== undefined) { c.position.y = 0.385; } });
});
const efw = particles(scene, 140, { c: 0xffd36a, size: 0.24, fn: (t, a, b, c, i) => {
  if (!endFx.on) return [0, -50, 0];
  const src = [HOME, ...IPOS.filter((p, m) => islands[m].flag)], p = src[i % src.length], cyc = (t * 0.45 + (i % 4) * 0.25) % 1, burst = Math.floor(t * 0.45 + (i % 4) * 0.25), ang = a * 6.283 + burst * 1.7, el = b * 3.14 - 1.57, r = cyc * 2.6;
  return [p.x + Math.cos(ang) * Math.cos(el) * r, 6 + (i % 3) + Math.sin(el) * r - cyc * cyc * 1.6, p.z + Math.sin(ang) * Math.cos(el) * r]; } });
anim.push(t => { efw.material.color.setHSL((t * 0.15) % 1, 0.8, 0.65); });

/* ---------- thẻ 2D ↔ 3D: rê/chạm thị trường trên thẻ, camera bay tới đảo ---------- */
let hovT = null;
document.addEventListener('pointerover', e => {
  const el = e.target.closest && e.target.closest('[data-m]'); if (!el || wrap.contains(el)) return; const m = +el.dataset.m; if (!(m >= 0 && m < 7)) return;
  clearTimeout(hovT); hovT = setTimeout(() => { userKey = 'm' + m; autoCam = true; hiIsland(m); }, 160);
});
const hiRing = new THREE.Mesh(new THREE.TorusGeometry(IR * 1.3, 0.08, 8, 60), new THREE.MeshBasicMaterial({ color: 0xf2b53a, transparent: true, opacity: 0 })); hiRing.rotation.x = -Math.PI / 2; hiRing.position.y = 0.1; scene.add(hiRing);
let hiT = 0; function hiIsland(m) { hiRing.position.set(IPOS[m].x, 0.1, IPOS[m].z); hiT = 1.6; }
anim.push(t => { hiT = Math.max(0, hiT - (LIFE.dt || 0.016)); hiRing.material.opacity = Math.min(1, hiT) * 0.9; hiRing.scale.setScalar(1 + Math.sin(t * 5) * 0.03); });
window.BP3D.focus = m => { userKey = m >= 0 ? 'm' + m : 'home'; autoCam = true; if (m >= 0) hiIsland(m); };

/* ---------- thanh công cụ gọn: chỉ biểu tượng khi hẹp ---------- */
function compactTB() {
  if (!TB || TB === wrap) return; const narrow = wrap.clientWidth < 1100;
  [...TB.children].forEach(b => { const txt = b.textContent.trim(), ic = b.dataset.icon;
    if (txt !== ic) { b.dataset.full = txt; b.dataset.icon = txt.length <= 7 ? txt : txt.split(' ')[0]; }
    const want = narrow ? b.dataset.icon : b.dataset.full; if (b.textContent !== want) b.textContent = want;
    b.title = b.dataset.full; b.setAttribute('aria-label', b.dataset.full); });
  const hint = $('bp3d-hint'); if (hint) hint.style.display = TB.scrollWidth > TB.clientWidth + 2 || TB.getBoundingClientRect().right > hint.getBoundingClientRect().left - 8 ? 'none' : '';
}
setInterval(compactTB, 800); compactTB(); addEventListener('resize', compactTB);
