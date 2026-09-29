// Phố Thị Trường 3D — không gian bên trong từng thị trường của Hộ Chiếu Thương Hiệu.
// Đọc ảnh chụp ván chơi (localStorage 'bizon-bp3d-last', do bp3d.js ghi) và dựng phố mua sắm đất sét,
// camera bay theo kịch bản: toàn cảnh → dạo vỉa hè → vòng quanh cửa hàng → áp sát bảng hiệu → (đối thủ).
import * as THREE from 'three';
import { makeBPCast, RIVAL_ID } from './bp-clay-cast.js';
const CLAY = makeBPCast(THREE); let clay = [];

const $ = id => document.getElementById(id);
const EN = () => { try { return localStorage.getItem('bizon-lang') === 'en'; } catch (e) { return false; } };
const tr = (vi, en) => EN() ? en : vi;
const FONT = 'Manrope, "Be Vietnam Pro", system-ui, sans-serif';
const small = Math.min(innerWidth, innerHeight) < 600;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- dữ liệu ---------- */
const MODES = [['🛒', 'Nền tảng số', 'Digital platform'], ['🚢', 'Xuất khẩu trực tiếp', 'Direct export'], ['🤝', 'Liên minh chiến lược', 'Strategic alliance'], ['📜', 'Cấp phép', 'Licensing'], ['🏗️', 'Liên doanh', 'Joint venture'], ['🏭', 'Đầu tư 100% vốn (FDI)', 'Wholly owned FDI']];
const MODE_HEX = ['#2f8fcf', '#e8762d', '#3f8f4a', '#8a5fc9', '#1f8f8a', '#b0473f'];
const TH = [
  { name: 'Hải Lam', icon: '🌐', sky: 0xbfe0f0, ground: 0xc9d3dc, road: 0x5d6877, walk: 0xe3e8ee, wall: [0x9fd4ef, 0xcfe4f2, 0x7fb3d6, 0xe6eef5], roof: 0x2f6f9a, h: [5, 11], trait: ['Thị trường số – cạnh tranh trực tuyến rất cao', 'Digital market – very high online competition'],
    shops: ['Cà phê 24h', 'Game Hub', 'Tech Mart', 'Stream Box', 'Pixel Mall', 'Cloud Tea'] },
  { name: 'Bắc Phong', icon: '🏔️', sky: 0xdfe8ef, ground: 0xf4f6f8, road: 0x6c7280, walk: 0xd9dde2, wall: [0xd9c9b0, 0xe8dcc8, 0xb8a58a, 0xf1ece2], roof: 0x5b6f86, h: [3.5, 6], trait: ['Tiêu chuẩn nghiêm ngặt – cần chứng nhận', 'Strict standards – certification required'],
    shops: ['Tiệm bánh', 'Kiểm định', 'Nhà sách', 'Dược phẩm', 'Len & Dạ', 'Đồng hồ'] },
  { name: 'Kim Sa', icon: '🌅', sky: 0xffe2c2, ground: 0xf3dcb4, road: 0x8a7a68, walk: 0xf6e6c9, wall: [0xf6b3c1, 0xffd88a, 0x9edbd0, 0xc9b3f0], roof: 0xe8604c, h: [3, 5.5], trait: ['Khách trẻ – xu hướng đổi nhanh', 'Young customers – trends shift fast'],
    shops: ['Trà sữa', 'Sneaker', 'Selfie Studio', 'K-Beauty', 'Kem que', 'Vintage'] },
  { name: 'Lục Đảo', icon: '🏝️', sky: 0xd4efd8, ground: 0xb9dca0, road: 0x7f8a70, walk: 0xe9e3cf, wall: [0xe9dcc0, 0xcfe3c0, 0xb7d3a8, 0xf3ead6], roof: 0x3f8a45, h: [3, 5], trait: ['Ưu tiên môi trường – cần hồ sơ bền vững', 'Environment-first – needs a sustainability record'],
    shops: ['Chợ hữu cơ', 'Refill', 'Xe đạp', 'Cây cảnh', 'Zero Waste', 'Nước ép'] },
  { name: 'Nhật Quang', icon: '🌸', sky: 0xf7d9d4, ground: 0xe7d8c4, road: 0x7a6a60, walk: 0xeee2d0, wall: [0xf6ecd8, 0xe8d2b0, 0xd9b99a, 0xf3e3cf], roof: 0x9a3a3a, h: [3, 4.6], trait: ['Lòng tin xây chậm – đối tác trung thành', 'Trust builds slowly – loyal partners'],
    shops: ['Trà đạo', 'Gốm sứ', 'Bánh mochi', 'Giấy washi', 'Mỳ soba', 'Hương trầm'] },
  { name: 'Tân Cảng', icon: '⚓', sky: 0xcfdde8, ground: 0xbfc4c8, road: 0x535c66, walk: 0xcfd3d6, wall: [0xd9a37a, 0xb8c4cf, 0xe8604c, 0x3aa0d8], roof: 0x44566e, h: [4, 7.5], trait: ['Cửa ngõ khu vực – vận hành đắt đỏ', 'Regional gateway – expensive to operate'],
    shops: ['Logistics', 'Hải sản', 'Đổi tiền', 'Kho lạnh', 'Hàng miễn thuế', 'Cà phê cảng'] },
  { name: 'Hỏa Sơn', icon: '🌋', sky: 0xf2d6c0, ground: 0xc9b48f, road: 0x6e5a48, walk: 0xe4d2b0, wall: [0xe9c28a, 0xd98a5a, 0x9ac27a, 0xf3dcae], roof: 0xb8522a, h: [2.8, 4.4], trait: ['Dân số trẻ – phân mảnh theo vùng đảo', 'Young population – fragmented across island regions'],
    shops: ['Chợ nổi', 'Sim & Data', 'Dừa tươi', 'Vải batik', 'Cá nướng', 'Ví điện tử'] },
];
const FIRM_PROD = [0x6fae6a, 0xd98a3a, 0x3a7fa0, 0x5a6ad0];
function loadSnap() {
  try { const s = JSON.parse(localStorage.getItem('bizon-bp3d-last')); if (s && s.entered) return { ...s, demo: false }; } catch (e) {}
  return { demo: true, firm: { name: 'Mộc Nhiên', icon: '🧴', idx: 0 }, entered: [1, null, 0, 2, 1, null, 2], ship: [0, null, null, null, 1, null, null], know: [55, 20, 45, 70, 60, 15, 50],
    cust: [72, 60, 64, 81, 77, 60, 58], qin: [4, 0, 3, 2, 3, 0, 1], q: 6, rival: { in: [0, 2, 5], name: 'Kim Long', icon: '🐉', img: 'assets/character/firms/kim-long-rival-cut.webp' } };
}
let SNAP = loadSnap();

/* ---------- renderer ---------- */
const wrap = $('ps-stage');
const R = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
R.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 1.75));
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
wrap.prepend(R.domElement);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(46, 1, 0.1, 300);
const hemi = new THREE.HemisphereLight(0xfff6e8, 0x7a8f9a, 1.15); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d8, 2.2); sun.position.set(-14, 26, 18); sun.castShadow = true;
sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 22, bottom: -22, near: 1, far: 80 }); sun.shadow.bias = -0.0005; scene.add(sun);

const mc = {};
const M = (c, o) => { const k = c + (o ? JSON.stringify(o) : ''); return mc[k] || (mc[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.82 }, o || {}))); };
const GE = { box: new THREE.BoxGeometry(1, 1, 1), sph: new THREE.SphereGeometry(1, 20, 14), ico: new THREE.IcosahedronGeometry(1, 1), cyl: new THREE.CylinderGeometry(1, 1, 1, 18), cone: new THREE.ConeGeometry(1, 1, 18), cone4: new THREE.ConeGeometry(1, 1, 4), cap: new THREE.CapsuleGeometry(1, 1.6, 6, 12) };
let world = null, anim = [];
function P(g, m, par, x = 0, y = 0, z = 0, sx = 1, sy = sx, sz = sx) { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = o.receiveShadow = true; par.add(o); return o; }
const grp = (par, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); par.add(g); return g; };
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const texCache = {};
function signTex(txt, bg, fg = '#ffffff', w = 512, h = 128, fs = 56) {
  const k = [txt, bg, fg, w, h, fs].join('|'); if (texCache[k]) return texCache[k];
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.fillStyle = bg; rr(g, 0, 0, w, h, 18); g.fill();
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 ' + fs + 'px ' + FONT;
  let f = fs; while (g.measureText(txt).width > w - 30 && f > 18) { f -= 2; g.font = '800 ' + f + 'px ' + FONT; }
  g.fillText(txt, w / 2, h / 2 + 3);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return (texCache[k] = t);
}
const signMat = (txt, bg, fg, w, h, fs) => new THREE.MeshStandardMaterial({ map: signTex(txt, bg, fg, w, h, fs), roughness: 0.6 });
const hex = n => '#' + n.toString(16).padStart(6, '0');
const TL = new THREE.TextureLoader();
function artSprite(src, h, par, x, y, z) {
  const mat = new THREE.SpriteMaterial({ transparent: false, alphaTest: 0.5, toneMapped: false });
  mat.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <alphatest_fragment>', 'diffuseColor.a = smoothstep(0.03, 0.2, diffuseColor.a);\n#include <alphatest_fragment>'); };
  const sp = new THREE.Sprite(mat); sp.center.set(0.5, 0); sp.position.set(x, y, z); sp.visible = false; par.add(sp);
  TL.load(src, t => { t.colorSpace = THREE.SRGBColorSpace; mat.map = t; mat.needsUpdate = true; sp.scale.set(h * t.image.width / t.image.height, h, 1); sp.visible = true; });
  return sp;
}

/* ---------- đạo cụ chung ---------- */
function tree(par, x, z, c = 0x5f9e55, s = 1) { P(GE.cyl, M(0x8a5a34), par, x, 0.6 * s, z, 0.1 * s, 1.2 * s, 0.1 * s); P(GE.ico, M(c, { flatShading: true }), par, x, 1.6 * s, z, 0.7 * s); }
function palm(par, x, z, s = 1) { P(GE.cyl, M(0x9a6a3a), par, x, 1.2 * s, z, 0.1 * s, 2.4 * s, 0.1 * s); for (let i = 0; i < 6; i++) { const a = i * 1.05, l = P(GE.sph, M(0x4f9a4a), par, x + Math.cos(a) * 0.55 * s, 2.4 * s, z + Math.sin(a) * 0.55 * s, 0.7 * s, 0.08 * s, 0.22 * s); l.rotation.y = -a; l.rotation.z = -0.3; } }
function lamp(par, x, z, glow = 0xffe7a8) { P(GE.cyl, M(0x3a4048), par, x, 1.5, z, 0.05, 3, 0.05); P(GE.sph, new THREE.MeshStandardMaterial({ color: glow, emissive: glow, emissiveIntensity: 0.6 }), par, x, 3.05, z, 0.18); }
function bench(par, x, z, ry = 0) { const g = grp(par, x, 0, z); g.rotation.y = ry; P(GE.box, M(0x9a6a3a), g, 0, 0.45, 0, 1.4, 0.08, 0.45); P(GE.box, M(0x9a6a3a), g, 0, 0.75, -0.2, 1.4, 0.4, 0.06); [-0.6, 0.6].forEach(dx => P(GE.box, M(0x3a4048), g, dx, 0.22, 0, 0.06, 0.45, 0.4)); }
function building(par, x, side, w, h, wall, roof, name, awn, th) {
  const z = side * 9, d = 7, face = side * (9 - d / 2);
  const g = grp(par, x, 0, 0);
  P(GE.box, M(wall), g, 0, h / 2, z, w, h, d);
  if (th === 1 || th === 4) { const r = P(GE.cone4, M(roof), g, 0, h + 0.8, z, w * 0.75, 1.6, d * 0.72); r.rotation.y = Math.PI / 4; if (th === 1) P(GE.cone4, M(0xffffff), g, 0, h + 1.35, z, w * 0.35, 0.55, d * 0.34).rotation.y = Math.PI / 4; }
  else P(GE.box, M(roof), g, 0, h + 0.1, z, w + 0.2, 0.2, d + 0.2);
  const glass = M(th === 0 ? 0x5a8fb5 : 0x8fbcd4, { roughness: 0.25, metalness: 0.2 });
  P(GE.box, glass, g, 0, 1.2, face, w * 0.7, 1.7, 0.08);
  P(GE.box, M(0x5a4030), g, w * 0.36 - 0.1, 1.05, face, 0.8, 2.1, 0.1);
  for (let y = 3.2; y < h - 0.6; y += 1.6) for (let k = -1; k <= 1; k++) if (Math.abs(k) * 1.4 < w / 2 - 0.4) P(GE.box, glass, g, k * 1.4, y, face, 0.8, 0.9, 0.08);
  const aw = P(GE.box, M(awn), g, 0, 2.35, face + side * -0.55, w * 0.85, 0.08, 1.1); aw.rotation.x = side * -0.28;
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w * 0.8, 3.4), 0.7), signMat(name, hex(awn)));
  sg.position.set(0, 2.9, face - side * 0.06); if (side > 0) sg.rotation.y = Math.PI; g.add(sg);
  return g;
}
let pn = 0;
function person(par, color, skin) {
  const r = CLAY.villager(color, skin ?? null, pn++, 1.35); par.add(r);
  const rig = r.userData.rig || {}; r.userData.b = rig.body || r; r.userData.legs = [new THREE.Object3D(), new THREE.Object3D()]; r.userData.walk = true;
  if (Math.random() < 0.35) P(GE.box, M([0xfda127, 0xe8604c, 0xffffff, 0x3aa0d8][pn % 4]), r, 0.2 / (r.scale.x || 1), 0.45 / (r.scale.x || 1), 0, 0.14 / (r.scale.x || 1), 0.2 / (r.scale.x || 1), 0.2 / (r.scale.x || 1));
  return r;
}
const PEOPLE_C = [0xe8604c, 0x3aa0d8, 0xf2a73b, 0x4f9a55, 0x8a6ad0, 0xf2a7bf, 0x2f6f7a, 0xffffff];

/* ---------- chủ đề riêng từng thị trường ---------- */
const EXTRA = [
  (g, t) => { // Hải Lam
    for (let i = 0; i < 9; i++) { const h = 14 + (i * 7) % 12; P(GE.box, M(0x9fc4dc, { roughness: 0.3, metalness: 0.2 }), g, -32 + i * 8, h / 2, -22 - (i % 3) * 3, 4, h, 4); }
    const scr = P(GE.box, new THREE.MeshStandardMaterial({ color: 0x5cc4e6, emissive: 0x3aa7d8, emissiveIntensity: 0.9 }), g, -10, 7.2, -5.4, 4, 2.2, 0.1);
    anim.push(tt => { scr.material.emissiveIntensity = 0.7 + Math.sin(tt * 3) * 0.3; });
    for (let i = 0; i < 3; i++) { const d = grp(g); P(GE.box, M(0x333a44), d, 0, 0, 0, 0.5, 0.12, 0.5); [[-.3, -.3], [.3, -.3], [-.3, .3], [.3, .3]].forEach(([x, z]) => P(GE.cyl, M(0xdddddd), d, x, 0.08, z, 0.14, 0.02, 0.14)); P(GE.box, M(0xfda127), d, 0, -0.2, 0, 0.25, 0.22, 0.25);
      anim.push(tt => d.position.set(Math.sin(tt * 0.3 + i * 2) * 18, 6 + i + Math.sin(tt + i) * 0.3, Math.cos(tt * 0.3 + i * 2) * 3)); }
  },
  (g) => { // Bắc Phong
    [[-26, -34, 16, 9], [-6, -38, 20, 11], [16, -34, 15, 8], [34, -30, 12, 7]].forEach(([x, z, h, r]) => { P(GE.cone, M(0x8e9aa9, { flatShading: true }), g, x, h / 2, z, r, h, r); P(GE.cone, M(0xffffff, { flatShading: true }), g, x, h * 0.83, z, r * 0.36, h * 0.35, r * 0.36); });
    snow(g, 0xffffff, 0.12, 0.8);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.9), signMat('✅ CERT', '#1f6f5a', '#ffffff', 256, 180, 50)); pl.position.set(-4.3, 1.9, -5.54); g.add(pl);
  },
  (g) => { // Kim Sa
    for (let i = 0; i < 7; i++) palm(g, -22 + i * 7.3, i % 2 ? 3.6 : -3.9, 1.1);
    for (let i = 0; i < 6; i++) { const b = grp(g, -18 + i * 7, 6 + (i % 3), -1 + (i % 2) * 2); P(GE.sph, M([0xe8604c, 0xf2a7bf, 0xfda127, 0x9edbd0][i % 4]), b, 0, 0, 0, 0.5, 0.62, 0.5); anim.push(tt => { b.position.y = 6 + (i % 3) + Math.sin(tt * 0.8 + i) * 0.5; }); }
  },
  (g) => { // Lục Đảo
    for (let i = 0; i < 9; i++) tree(g, -24 + i * 6, i % 2 ? 3.8 : -3.8, i % 2 ? 0x4f9a4a : 0x7cc36a, 0.9);
    for (let i = 0; i < 4; i++) { const b = grp(g, -14 + i * 9, 0, 3.4); [-0.5, 0.5].forEach(x => { const w = P(new THREE.TorusGeometry(0.35, 0.05, 6, 16), M(0x333333), b, x, 0.4, 0); }); P(GE.box, M([0x4f9a55, 0xfda127, 0x3aa0d8, 0xe8604c][i]), b, 0, 0.62, 0, 0.9, 0.06, 0.06); }
    [-12, 6, 18].forEach(x => { const s = P(GE.box, M(0x2f4f7a, { roughness: 0.3, metalness: 0.4 }), g, x, 7.4, -9, 3, 0.08, 2); s.rotation.x = 0.4; });
    const hub = grp(g, 26, 12, -30); P(GE.cyl, M(0xf4f4f4), g, 26, 6, -30, 0.25, 12, 0.25);
    for (let i = 0; i < 3; i++) { const q = grp(hub); q.rotation.z = i * 2.094; P(GE.box, M(0xffffff), q, 0, 2, 0, 0.3, 4, 0.1); } anim.push(tt => { hub.rotation.z = tt * 0.8; });
  },
  (g) => { // Nhật Quang
    for (let i = 0; i < 7; i++) { const x = -21 + i * 7; P(GE.cyl, M(0x6a3f2c), g, x, 0.9, i % 2 ? 3.9 : -3.9, 0.12, 1.8, 0.12); for (let k = 0; k < 4; k++) P(GE.ico, M(k % 2 ? 0xf6b8cb : 0xf08fae, { flatShading: true }), g, x + (k - 1.5) * 0.5, 2.2 + (k % 2) * 0.3, (i % 2 ? 3.9 : -3.9) + (k % 3 - 1) * 0.3, 0.7); }
    const lm = new THREE.MeshStandardMaterial({ color: 0xffb24a, emissive: 0xff8a2a, emissiveIntensity: 0.8 });
    for (let x = -22; x <= 22; x += 2.2) P(GE.sph, lm, g, x, 4.2 + Math.sin(x * 0.7) * 0.15, 0, 0.2, 0.26, 0.2);
    P(GE.box, M(0x444444), g, 0, 4.4, 0, 46, 0.02, 0.02);
    snow(g, 0xf6b8cb, 0.14, 0.5);
    const tor = grp(g, -24, 0, 0); [-2, 2].forEach(z => P(GE.cyl, M(0xc8372d), tor, 0, 2.4, z, 0.22, 4.8, 0.22)); P(GE.box, M(0xc8372d), tor, 0, 4.9, 0, 0.4, 0.35, 5.6); P(GE.box, M(0x222222), tor, 0, 5.2, 0, 0.5, 0.2, 6.2);
  },
  (g) => { // Tân Cảng
    for (let i = 0; i < 3; i++) { const x = -20 + i * 18; P(GE.box, M(0xf2b53a), g, x, 8, -30, 0.6, 16, 0.6); P(GE.box, M(0xf2b53a), g, x - 3, 15.5, -30, 10, 0.5, 0.6); P(GE.box, M(0x333333), g, x - 7, 12, -30, 0.08, 7, 0.08); }
    const cs = [0xe8604c, 0x3aa0d8, 0xf2a73b, 0x4f9a55, 0x8a6ad0];
    for (let i = 0; i < 24; i++) P(GE.box, M(cs[i % 5]), g, -28 + (i % 8) * 7, 1.2 + Math.floor(i / 8) * 2.4, -24, 6, 2.3, 2.4);
    for (let i = 0; i < 4; i++) { const b = grp(g); P(GE.sph, M(0xffffff), b, 0, 0, 0, 0.18, 0.12, 0.3); [-1, 1].forEach(s => { const w = P(GE.box, M(0xeeeeee), b, s * 0.35, 0, 0, 0.6, 0.03, 0.18); w.rotation.z = s * 0.3; });
      anim.push(tt => { const a = tt * 0.4 + i * 1.6; b.position.set(Math.cos(a) * 12, 9 + Math.sin(tt * 2 + i) * 0.4, -6 + Math.sin(a) * 6); b.rotation.y = -a; b.children[1].rotation.z = 0.3 + Math.sin(tt * 8 + i) * 0.4; b.children[2].rotation.z = -0.3 - Math.sin(tt * 8 + i) * 0.4; }); }
  },
  (g) => { // Hỏa Sơn
    P(new THREE.CylinderGeometry(3, 16, 18, 24), M(0x7a5a48, { flatShading: true }), g, 4, 9, -48);
    const lava = P(GE.sph, new THREE.MeshStandardMaterial({ color: 0xff7a2a, emissive: 0xff5a1a, emissiveIntensity: 1.2 }), g, 4, 18, -48, 2.6, 0.6, 2.6);
    anim.push(tt => { lava.material.emissiveIntensity = 1 + Math.sin(tt * 2) * 0.4; });
    for (let i = 0; i < 6; i++) palm(g, -22 + i * 9, i % 2 ? 3.7 : -3.8, 1);
    for (let i = 0; i < 5; i++) { const x = -18 + i * 9; const st = grp(g, x, 0, 3.6); P(GE.box, M(0x9a6a3a), st, 0, 0.5, 0, 1.6, 0.1, 1); [[-.7, -.4], [.7, -.4], [-.7, .4], [.7, .4]].forEach(([a, b]) => P(GE.cyl, M(0x7a4f2c), st, a, 1.1, b, 0.05, 2.2, 0.05)); const r = P(GE.cone4, M([0xe8604c, 0xf2a73b, 0x4f9a55][i % 3]), st, 0, 2.5, 0, 1.4, 0.6, 1); r.rotation.y = Math.PI / 4;
      for (let k = 0; k < 3; k++) P(GE.sph, M([0x6fb86a, 0xfda127, 0xe8604c][k]), st, -0.4 + k * 0.4, 0.68, 0, 0.16); }
  },
];
function snow(g, color, size, speed) {
  const n = small ? 250 : 500, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 60; pos[i * 3 + 1] = Math.random() * 14; pos[i * 3 + 2] = (Math.random() - 0.5) * 30; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.9, depthWrite: false })); g.add(pts);
  anim.push((tt, dt) => { const a = geo.attributes.position.array; for (let i = 0; i < n; i++) { a[i * 3 + 1] -= dt * speed * (0.6 + (i % 5) * 0.1); a[i * 3] += Math.sin(tt + i) * dt * 0.3; if (a[i * 3 + 1] < 0) a[i * 3 + 1] = 14; } geo.attributes.position.needsUpdate = true; });
}

/* ---------- cửa hàng của bạn & đối thủ ---------- */
const STORE = new THREE.Vector3(0, 0, -5.5), RIVAL = new THREE.Vector3(7, 0, 5.5);
function myStore(g, m) {
  const md = SNAP.entered[m], f = SNAP.firm, prodC = FIRM_PROD[f.idx || 0] || 0x6fae6a, col = md == null ? '#8a8f98' : MODE_HEX[md];
  const s = grp(g, STORE.x, 0, -9);
  const w = md === 1 ? 7 : 5.6, h = md === 1 ? 5.4 : 4.6;
  P(GE.box, M(md == null ? 0xd8d4cc : 0xfff4e0), s, 0, h / 2, 0, w, h, 7);
  P(GE.box, M(new THREE.Color(col).getHex()), s, 0, h + 0.15, 0, w + 0.3, 0.3, 7.3);
  const front = 3.5;
  if (md == null) {
    for (let y = 0.2; y < 2.6; y += 0.22) P(GE.box, M(0x9aa0a8), s, 0, y, front + 0.05, w * 0.8, 0.16, 0.06);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.8), signMat(tr('🔒 Sắp có mặt', '🔒 Coming soon'), '#6c7280')); sg.position.set(0, 3.2, front + 0.06); s.add(sg);
    const fogM = new THREE.MeshStandardMaterial({ color: 0xf6f9fa, transparent: true, opacity: 0.55, depthWrite: false });
    for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(GE.ico, fogM); p.position.set(-3 + i * 1.2, 0.8 + (i % 2) * 0.6, front + 1.5); p.scale.setScalar(1.1); s.add(p); anim.push(tt => { p.position.x = -3 + i * 1.2 + Math.sin(tt * 0.5 + i) * 0.3; }); }
    return s;
  }
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.86, 1.05), signMat(f.icon + ' ' + f.name, col, '#ffffff', 768, 150, 76)); sign.position.set(0, h - 0.8, front + 0.07); s.add(sign);
  const glass = M(0xbfe3f2, { roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.55 });
  P(GE.box, glass, s, -w * 0.18, 1.4, front + 0.02, w * 0.55, 2.3, 0.06);
  P(GE.box, M(0x5a4030), s, w * 0.32, 1.2, front + 0.02, 1, 2.3, 0.1);
  const aw = P(GE.box, M(new THREE.Color(col).getHex()), s, 0, 2.85, front + 0.6, w * 0.9, 0.08, 1.2); aw.rotation.x = 0.28;
  // quầy trưng bày sản phẩm
  for (let k = 0; k < 3; k++) { const x = -w * 0.36 + k * w * 0.18; P(GE.cyl, M(0xffffff), s, x, 0.45, front - 0.5, 0.35, 0.9, 0.35); P(GE.cyl, M(prodC), s, x, 1.08, front - 0.5, 0.12, 0.36, 0.12); P(GE.sph, M(0xf4d35e), s, x, 1.3, front - 0.5, 0.07); }
  if (md === 0) { // nền tảng số: tủ nhận hàng + màn hình QR
    const lk = grp(s, -w / 2 - 1.2, 0, front - 0.6); P(GE.box, M(0x2f8fcf), lk, 0, 1.2, 0, 1.6, 2.4, 0.8);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) P(GE.box, M(0xdfeef8), lk, -0.38 + c * 0.76, 0.5 + r * 0.7, 0.41, 0.66, 0.6, 0.02);
    const qr = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), signMat('📱 QR', '#033337', '#5cc4e6', 256, 170, 64)); qr.position.set(-w / 2 - 1.2, 2.85, front - 0.19); s.add(qr);
    const dr = grp(s); P(GE.box, M(0x333a44), dr, 0, 0, 0, 0.5, 0.12, 0.5); P(GE.box, M(0xfda127), dr, 0, -0.22, 0, 0.3, 0.26, 0.3);
    anim.push(tt => { const k = (tt * 0.15) % 1; dr.position.set(-w / 2 - 1.2 + Math.sin(k * Math.PI * 2) * 6, 3.4 + Math.abs(Math.sin(k * Math.PI)) * 3, front + 1 + Math.cos(k * Math.PI * 2) * 2); });
  } else if (md === 2) { // đối tác địa phương: bảng đối tác
    const pb = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.55), signMat(tr('🤝 Đối tác', '🤝 Partner'), '#3f8f4a', '#ffffff', 384, 118, 50)); pb.position.set(w * 0.32, 2.65, front + 0.09); s.add(pb);
  } else { // xuất khẩu: xe tải giao hàng
    const tk = grp(s, -w / 2 - 2.2, 0, front + 2.2); P(GE.box, M(0xe8762d), tk, 0, 0.95, 0, 2.6, 1.3, 1.2); P(GE.box, M(0xffffff), tk, 1.7, 0.75, 0, 0.9, 0.9, 1.1);
    [[-0.8, .62], [0.8, .62], [-0.8, -.62], [0.8, -.62], [1.7, .6], [1.7, -.6]].forEach(([x, z]) => P(GE.cyl, M(0x222222), tk, x, 0.28, z, 0.28, 0.16, 0.28).rotation.x = Math.PI / 2);
    const sh = SNAP.ship && SNAP.ship[m] === 1; const lbl = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.6), signMat(sh ? '✈️ Express' : '🚢 Sea', '#e8762d', '#ffffff', 384, 104, 50)); lbl.position.set(0, 1.1, 0.61); tk.add(lbl);
  }
  [['cmo', 2.4, 1.2, -0.35, 'talk'], ['ceo', -2.3, 1.4, 0.4, 'idle'], ['coo', -3.2, 0.7, 0.6, 'idle']].forEach(([id, x, dz, ry, mode]) => { const c = CLAY.build(id, 1.85); c.position.set(x, 0.18, front + dz); c.rotation.y = ry; s.add(c); clay.push({ r: c, mode }); });
  return s;
}
function rivalStore(g) {
  const s = grp(g, RIVAL.x, 0, 9); s.rotation.y = Math.PI;
  P(GE.box, M(0x3a2a2a), s, 0, 2.6, 0, 5.4, 5.2, 7); P(GE.box, M(0xc8372d), s, 0, 5.35, 0, 5.7, 0.3, 7.3);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1), signMat((SNAP.rival.icon || '⚔️') + ' ' + (SNAP.rival.name || tr('Đối thủ', 'Rival')), '#c8372d', '#ffffff', 768, 150, 76)); sg.position.set(0, 4.4, 3.57); s.add(sg);
  P(GE.box, M(0xffd2c8, { transparent: true, opacity: 0.6 }), s, -0.8, 1.4, 3.52, 3, 2.3, 0.06);
  const b = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.6), signMat('−20% SALE', '#fda127', '#3a2a2a', 384, 110, 58)); b.position.set(1.6, 2.3, 3.58); s.add(b);
  anim.push(tt => { b.position.y = 2.3 + Math.sin(tt * 4) * 0.04; });
  const kl = CLAY.build(RIVAL_ID, 1.95); kl.position.set(2.2, 0, 4.4); s.add(kl); clay.push({ r: kl, mode: 'talk' });
  return s;
}

/* ---------- dựng phố ---------- */
let peds = [], cur = 0, crowd = 0;
function build(m) {
  if (world) { scene.remove(world); world.traverse(o => { if (o.geometry && !Object.values(GE).includes(o.geometry)) o.geometry.dispose(); }); }
  anim = []; peds = []; clay = []; world = new THREE.Group(); scene.add(world);
  const th = TH[m]; scene.background = new THREE.Color(th.sky); scene.fog = new THREE.Fog(th.sky, 40, 95);
  const warm = m === 4; sun.intensity = warm ? 1.7 : 2.2; sun.color.set(warm ? 0xffc9a0 : 0xfff0d8);
  P(new THREE.PlaneGeometry(200, 200), M(th.ground), world, 0, -0.02, 0).rotation.x = -Math.PI / 2;
  P(GE.box, M(th.road), world, 0, 0.01, 0, 80, 0.02, 5);
  for (let x = -38; x < 40; x += 4) P(GE.box, M(0xffffff), world, x, 0.03, 0, 1.8, 0.01, 0.15);
  [-1, 1].forEach(s => { P(GE.box, M(th.walk), world, 0, 0.09, s * 3.8, 80, 0.18, 2.6); P(GE.box, M(0xb9b3a8), world, 0, 0.1, s * 2.5, 80, 0.2, 0.12); });
  if (m === 5 || m === 6) { const sea = P(new THREE.PlaneGeometry(200, 60), M(0x5db3c0, { roughness: 0.3 }), world, 0, 0.0, 44); sea.rotation.x = -Math.PI / 2; }
  const ent = SNAP.entered[m] != null, rival = (SNAP.rival.in || []).indexOf(m) >= 0;
  let xi = 0;
  [-1, 1].forEach(side => {
    for (let x = -30; x <= 30;) {
      const w = 4.6 + ((xi * 13) % 5) * 0.4;
      const skip = (side < 0 && Math.abs(x + w / 2 - STORE.x) < 4.6) || (side > 0 && rival && Math.abs(x + w / 2 - RIVAL.x) < 4.2);
      if (!skip) { const h = th.h[0] + ((xi * 7) % 5) / 4 * (th.h[1] - th.h[0]); building(world, x + w / 2, side, w - 0.3, h, th.wall[xi % 4], th.roof, th.shops[xi % th.shops.length], [0xe8604c, 0x3aa0d8, 0xf2a73b, 0x4f9a55, 0x8a6ad0][xi % 5], m); }
      x += w; xi++;
    }
  });
  for (let x = -26; x <= 26; x += 8.5) { lamp(world, x, 2.95); lamp(world, x + 4, -2.95); }
  bench(world, -8, -4.4, Math.PI); bench(world, 11, 4.4);
  myStore(world, m); if (rival) rivalStore(world);
  EXTRA[m](world, th);
  streetLife(world, m, th, ent);
  // khách bộ hành – lượng khách theo S.cust và việc đã thâm nhập
  const cust = SNAP.cust ? SNAP.cust[m] || 60 : 60;
  crowd = ent ? cust : 25;
  const n = Math.round((small ? 7 : 12) * (0.5 + crowd / 100));
  for (let i = 0; i < n; i++) {
    const p = person(world, PEOPLE_C[i % PEOPLE_C.length], [0xf1c9a5, 0xd9a47a, 0xa8764f, 0xf6d8bf][i % 4]);
    const lane = i % 2 ? 1 : -1, dir = Math.random() < 0.5 ? 1 : -1;
    p.position.set(-30 + Math.random() * 60, 0.18, lane * (3.3 + Math.random() * 0.9)); p.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    peds.push({ p, dir, sp: 1 + Math.random() * 0.8, ph: Math.random() * 6 });
  }
  if (ent) { const q = Math.round(cust / 16); for (let i = 0; i < q; i++) { const p = person(world, PEOPLE_C[(i + 3) % PEOPLE_C.length]); p.position.set(-1.6 - i * 0.62, 0.18, -3.4); p.rotation.y = -Math.PI / 2; peds.push({ p, q: true, ph: i }); } }
  world.traverse(o => { if (o.isMesh && o.material && o.material.transparent) o.castShadow = false; });
  return { ent, rival, cust };
}

/* ---------- kịch bản camera ---------- */
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
function shots(info, m) {
  const md = SNAP.entered[m], th = TH[m], f = SNAP.firm, list = [];
  const inQ = SNAP.qin ? SNAP.qin[m] : 0;
  list.push({ d: 5, p: [V(-26, th.h[1] + 9, 0.5), V(-13, th.h[1] * 0.45 + 3, 1.2)], l: [V(-6, 1.5, -2), V(-1, 2, -4.5)],
    cap: th.icon + ' ' + th.name + ' — ' + tr(th.trait[0], th.trait[1]) });
  list.push({ d: 5.5, p: [V(-14, 1.7, 3.9), V(-4.5, 1.7, 3.4)], l: [V(-6, 1.6, -3), V(0, 1.8, -5.5)],
    cap: info.ent ? tr('Lượng khách ', 'Customer traffic ') + info.cust + '/100 · ' + (SNAP.know ? tr('tri thức thị trường ', 'market intel ') + SNAP.know[m] + '%' : '')
      : tr('Phố vẫn đông, nhưng thương hiệu của bạn chưa có mặt ở đây.', 'The street is busy, but your brand is not here yet.') });
  list.push({ d: 5, orbit: { c: V(0, 1.6, -5.5), r: 8.5, a0: -1.0, a1: 0.9, y: 3.4 },
    cap: info.ent ? MODES[md][0] + ' ' + tr(MODES[md][1], MODES[md][2]) + (inQ ? ' · ' + inQ + tr(' quý hiện diện', ' quarters present') : '') : tr('🌫️ Sương mù thông tin – hãy mua tin trước khi thâm nhập.', '🌫️ Fog of information – buy intel before entering.') });
  list.push({ d: 4, p: [V(0.4, 2.6, 5), V(0, 3.4, -0.6)], l: [V(0, 3.6, -5.6), V(0, 3.8, -5.6)],
    cap: info.ent ? f.icon + ' ' + f.name + tr(' – dấu mộc ', ' – stamp ') + th.name + ' ✓' : tr('🔒 Cửa hàng chờ khai trương', '🔒 Store waiting to open') });
  if (info.rival) list.push({ d: 4.5, p: [V(2, 2.2, -2.2), V(3.5, 2, 0)], l: [V(7, 3, 5.5), V(7, 3.4, 5.5)],
    cap: '⚔️ ' + (SNAP.rival.name || tr('Đối thủ', 'Rival')) + tr(' đã mở cửa ngay bên kia đường.', ' has opened right across the street.') });
  return list;
}
let SH = [], shotI = 0, shotT = 0, playing = !reduce, info = null;
const pTmp = V(0, 0, 0), lTmp = V(0, 0, 0), look = V(0, 2, 0);
function pose(sh, u) {
  const k = ease(u);
  if (sh.orbit) { const o = sh.orbit, a = o.a0 + (o.a1 - o.a0) * k; pTmp.set(o.c.x + Math.sin(a) * o.r, o.y, o.c.z + Math.cos(a) * o.r); lTmp.copy(o.c); }
  else { pTmp.lerpVectors(sh.p[0], sh.p[1], k); lTmp.lerpVectors(sh.l[0], sh.l[1], k); }
  if (cam.aspect < 0.8 && !sh.p) { const back = lTmp.clone().sub(pTmp).normalize().multiplyScalar(-(0.8 / cam.aspect - 1) * 5); pTmp.add(back); }
}

/* ---------- giao diện ---------- */
const cap = $('ps-cap'), chips = $('ps-chips');
function setCap(t) { if (cap.textContent === t) return; cap.classList.remove('on'); void cap.offsetWidth; cap.textContent = t; cap.classList.add('on'); }
function renderChips() {
  chips.innerHTML = TH.map((t, m) => {
    const md = SNAP.entered[m], badge = md != null ? MODES[md][0] : '🔒';
    return '<button type="button" data-m="' + m + '" class="ps-chip' + (m === cur ? ' on' : '') + (md == null ? ' off' : '') + '" aria-pressed="' + (m === cur) + '">' + t.icon + ' ' + t.name + ' <span>' + badge + '</span></button>';
  }).join('');
}
chips.addEventListener('click', e => { const b = e.target.closest('button[data-m]'); if (b) go(+b.dataset.m); });
function go(m) {
  cur = m; info = build(m); SH = shots(info, m); shotI = 0; shotT = 0; renderChips(); setCap(SH[0].cap);
  const cb = chips.querySelector('.on'); if (cb) chips.scrollTo({ left: cb.offsetLeft - chips.clientWidth / 2 + cb.clientWidth / 2, behavior: 'smooth' });
  try { localStorage.setItem('bizon-bp3d-street', m); } catch (e) {}
}
const playBtn = $('ps-play'); const autoBtn = $('ps-auto'); let auto = true;
function syncBtns() { playBtn.textContent = playing ? '⏸' : '▶'; playBtn.setAttribute('aria-label', playing ? tr('Tạm dừng', 'Pause') : tr('Phát', 'Play')); autoBtn.classList.toggle('on', auto); }
playBtn.addEventListener('click', () => { playing = !playing; syncBtns(); });
autoBtn.addEventListener('click', () => { auto = !auto; syncBtns(); });
$('ps-next').addEventListener('click', () => go(nextMarket()));
$('ps-prev').addEventListener('click', () => go((cur + 6) % 7));
addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(nextMarket()); else if (e.key === 'ArrowLeft') go((cur + 6) % 7); else if (e.key === ' ') { e.preventDefault(); playing = !playing; syncBtns(); } });
function nextMarket() { for (let k = 1; k <= 7; k++) { const m = (cur + k) % 7; if (SNAP.entered[m] != null) return m; } return (cur + 1) % 7; }
if (SNAP.demo) $('ps-demo').hidden = false;
$('ps-firm').textContent = SNAP.firm.icon + ' ' + SNAP.firm.name + ' · ' + SNAP.entered.filter(x => x != null).length + '/7 ' + tr('thị trường', 'markets');

/* ---------- vòng lặp ---------- */
function resize() { const dk = document.querySelector('.ps-dock'); if (dk) document.documentElement.style.setProperty('--dock', dk.offsetHeight + 'px'); const w = wrap.clientWidth, h = wrap.clientHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
let startM = +new URLSearchParams(location.search).get('m');
if (!(startM >= 0 && startM < 7)) { const saved = +localStorage.getItem('bizon-bp3d-street'); startM = saved >= 0 && saved < 7 ? saved : SNAP.entered.findIndex(x => x != null); if (startM < 0) startM = 0; }
go(startM); syncBtns(); resize();
document.querySelectorAll('[data-en]').forEach(el => { if (EN()) el.textContent = el.dataset.en; });
document.querySelectorAll('[data-en-aria]').forEach(el => { if (EN()) el.setAttribute('aria-label', el.dataset.enAria); });
document.fonts && document.fonts.ready.then(() => { Object.keys(texCache).forEach(k => delete texCache[k]); go(cur); });
const clock = new THREE.Clock(); let perfN = 0, perfS = 0;
pose(SH[0], 0); cam.position.copy(pTmp); look.copy(lTmp);
function frame() {
  requestAnimationFrame(frame); if (document.hidden) return;
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  anim.forEach(f => f(t, dt));
  clay.forEach((c, i) => CLAY.animate(c.r, t, c.mode, i * 1.7));
  peds.forEach(o => {
    const u = o.p.userData;
    if (o.q) { CLAY.animate(o.p, t, 'idle', o.ph); return; }
    CLAY.animate(o.p, t, 'walk', o.ph);
    o.p.position.x += o.dir * o.sp * dt; if (o.p.position.x > 32) o.p.position.x = -32; if (o.p.position.x < -32) o.p.position.x = 32;
    
  });
  if (playing && SH.length) {
    shotT += dt; const sh = SH[shotI];
    if (shotT > sh.d) { shotT = 0; shotI++; if (shotI >= SH.length) { if (auto) { go(nextMarket()); } else shotI = 0; } setCap(SH[shotI].cap); }
  }
  const sh = SH[shotI]; pose(sh, shotT / sh.d);
  const k = 1 - Math.exp(-dt * 4); cam.position.lerp(pTmp, k); look.lerp(lTmp, k); cam.lookAt(look);
  perfN++; perfS += dt; if (perfS > 3) { const fps = perfN / perfS; perfN = perfS = 0; if (fps < 36 && t > 5) { const pr = R.getPixelRatio(); if (pr > 1.01) { R.setPixelRatio(Math.max(1, pr - 0.3)); resize(); } else if (R.shadowMap.enabled) R.shadowMap.enabled = false; } }
  R.render(scene, cam);
}
frame();

/* ---------- phố đông vui: xe cộ, cây, dây cờ, quầy rong, chim, khách xách túi ---------- */
function car(par, col, kind) {
  const g = grp(par);
  if (kind === 'bike') { P(GE.box, M(col), g, 0, 0.45, 0, 1.1, 0.25, 0.3); [-0.4, 0.4].forEach(x => P(new THREE.TorusGeometry(0.2, 0.06, 8, 16), M(0x222222), g, x, 0.22, 0)); const r = person(g, PEOPLE_C[Math.floor(Math.random() * 8)]); r.position.set(-0.05, 0.3, 0); r.rotation.y = Math.PI / 2; r.scale.multiplyScalar(0.85); }
  else if (kind === 'van') { P(GE.box, M(col), g, 0, 0.9, 0, 3, 1.4, 1.5); P(GE.box, M(0x9fd4ef), g, 1.3, 1.15, 0, 0.42, 0.6, 1.4); [-1, 1].forEach(x => [-1, 1].forEach(z => P(GE.cyl, M(0x222222), g, x, 0.3, z * 0.75, 0.3, 0.2, 0.3).rotation.x = Math.PI / 2)); }
  else { P(GE.box, M(col), g, 0, 0.5, 0, 2.2, 0.55, 1.1); P(GE.box, M(col), g, -0.1, 0.95, 0, 1.2, 0.45, 1.0); P(GE.box, M(0x9fd4ef), g, -0.1, 0.97, 0, 1.25, 0.35, 1.02); [-0.7, 0.7].forEach(x => [-1, 1].forEach(z => P(GE.cyl, M(0x222222), g, x, 0.25, z * 0.52, 0.25, 0.16, 0.25).rotation.x = Math.PI / 2)); }
  return g;
}
function streetLife(w, m, th, ent) {
  const cols = [0xe8604c, 0x3aa0d8, 0xf2a73b, 0xffffff, 0x4f9a55, 0x2b3f6b];
  // xe chạy hai chiều
  for (let i = 0; i < (small ? 4 : 7); i++) {
    const kind = m === 2 || m === 6 ? (i % 2 ? 'bike' : 'car') : i % 3 === 0 ? 'bike' : 'car', dir = i % 2 ? 1 : -1, c = car(w, cols[i % cols.length], kind);
    c.position.set(-34 + i * 11, 0.02, dir * 0.85); c.rotation.y = dir > 0 ? 0 : Math.PI; const sp = kind === 'bike' ? 3.2 : 4.5 + (i % 3);
    anim.push((t, dt) => { c.position.x += dir * sp * (dt || 0.016); if (c.position.x > 38) c.position.x = -38; if (c.position.x < -38) c.position.x = 38; });
  }
  // xe giao hàng trước cửa hàng mình
  if (ent) { const v = car(w, [0x2f8fcf, 0xe8762d, 0x3f8f4a][SNAP.entered[m]] || 0x2f8fcf, 'van'); v.position.set(STORE.x + 4.2, 0.02, -2.1); const box = P(GE.box, M(0xc9a57a), w, STORE.x + 2.6, 0.45, -2.6, 0.5, 0.4, 0.5);
    anim.push(t => { const k = (t * 0.35) % 1; box.position.set(STORE.x + 2.6 - k * 1.8, 0.45 + Math.sin(k * Math.PI) * 0.4, -2.6 - k * 0.8); }); }
  // cây xanh & chậu hoa dọc vỉa hè
  for (let x = -28; x <= 28; x += 7) [-1, 1].forEach(sd => { const px = x + (sd > 0 ? 3.5 : 0); if (Math.abs(px - STORE.x) < 3 && sd < 0) return;
    if (m === 1) { P(GE.cone, M(0x3f7a52, { flatShading: true }), w, px, 1.3, sd * 4.6, 0.6, 1.8, 0.6); P(GE.cone, M(0xffffff), w, px, 2.05, sd * 4.6, 0.25, 0.35, 0.25); }
    else { P(GE.cyl, M(0x7a4f2c), w, px, 0.7, sd * 4.6, 0.08, 1.2, 0.08); P(GE.ico, M(m === 4 ? 0xf6b8cb : m === 2 ? 0x4f9a4a : 0x5f9e55, { flatShading: true }), w, px, 1.6, sd * 4.6, 0.7); }
    P(GE.box, M(0x9a8a7a), w, px + 1.6, 0.4, sd * 4.7, 0.9, 0.45, 0.5); P(GE.sph, M(cols[(x + 30) % 6]), w, px + 1.6, 0.72, sd * 4.7, 0.35, 0.18, 0.2); });
  // dây cờ / đèn lồng băng ngang phố
  for (let k = 0; k < 4; k++) { const x0 = -18 + k * 12;
    for (let j = 0; j <= 10; j++) { const z = -4.8 + j * 0.96, y = 4.6 - Math.sin(j / 10 * Math.PI) * 0.9;
      if (m === 4) { const l = P(GE.sph, new THREE.MeshStandardMaterial({ color: 0xff6a4a, emissive: 0xff3a1a, emissiveIntensity: 0.5 }), w, x0, y - 0.25, z, 0.16, 0.22, 0.16); l.castShadow = false; }
      else { const f = P(GE.cone4, M(cols[j % 6], { side: THREE.DoubleSide }), w, x0, y - 0.22, z, 0.2, 0.36, 0.04); f.rotation.x = Math.PI; f.castShadow = false; } } }
  // quầy hàng rong
  [[-14, 4.2, 0], [17, -4.2, Math.PI]].forEach(([x, z, ry], i) => { const g = grp(w, x, 0.18, z); g.rotation.y = ry;
    P(GE.box, M(0x9a6a3a), g, 0, 0.45, 0, 1.4, 0.8, 0.8); P(GE.box, M(cols[i + 1]), g, 0, 1.65, 0, 1.7, 0.1, 1.1);
    [-0.65, 0.65].forEach(a => P(GE.cyl, M(0x7a4f2c), g, a, 1.1, 0.45, 0.03, 1.1, 0.03));
    for (let f = 0; f < 5; f++) P(GE.sph, M(cols[(f + i) % 6]), g, -0.5 + f * 0.25, 0.92, 0, 0.1);
    const v = person(g, 0xffffff); v.position.set(0, 0, -0.75); clay.push({ r: v, mode: 'talk' }); });
  // chim bồ câu trên vỉa hè
  for (let i = 0; i < 6; i++) { const b = grp(w, -6 + i * 1.3, 0.2, 3.9 + (i % 2) * 0.4); P(GE.sph, M(0x8a8f99), b, 0, 0.1, 0, 0.12, 0.1, 0.16); P(GE.sph, M(0x6a6f79), b, 0, 0.2, 0.1, 0.07);
    anim.push(t => { b.children[1].position.y = 0.2 - Math.max(0, Math.sin(t * 3 + i * 2)) * 0.06; b.rotation.y = Math.sin(t * 0.5 + i) * 1.2; }); }
  // khách xách túi thương hiệu đi ra từ cửa hàng
  if (ent) for (let i = 0; i < 3; i++) { const p = person(w, PEOPLE_C[(i + 5) % 8]); { const k = 1 / (p.scale.x || 1); P(GE.box, M(0xf2b53a), p, -0.24 * k, 0.45 * k, 0, 0.18 * k, 0.26 * k, 0.24 * k); }
    anim.push(t => { const k = ((t * 0.12) + i / 3) % 1; p.position.set(STORE.x + (k < 0.2 ? 0 : (k - 0.2) * 30 * (i % 2 ? 1 : -1)), 0.18, -5.4 + Math.min(k, 0.2) * 12); p.rotation.y = k < 0.2 ? 0 : (i % 2 ? Math.PI / 2 : -Math.PI / 2);
      CLAY.animate(p, t, k < 0.2 ? 'walk' : 'walk', i); }); }
  // biển quảng cáo thương hiệu trên nóc
  if (ent) { const bb = grp(w, 6, 0, -5.2); P(GE.box, M(0x444444), bb, 0, 5.5, 0, 0.12, 3, 0.12);
    const pan = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.8, 0.1), new THREE.MeshStandardMaterial({ map: signTex((SNAP.firm.icon || '🌿') + ' ' + (SNAP.firm.name || 'Mộc Nhiên'), '#fff4e0', '#033337') })); pan.position.y = 7.3; bb.add(pan); }
}
