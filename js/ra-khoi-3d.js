/* BizOn – Ra Khơi Cùng Lớp 3D. © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 * Mỗi người một thuyền mang hình nhà sáng lập doanh nghiệp mình chọn; cả phòng thấy nhau qua Supabase Realtime.
 * Địa hình bảy đảo thị trường dựng cùng cách với MV «Brand Passport – Vietnam to the World» (bản thế giới thu nhỏ). */
import * as THREE from 'three';
import { moPhong } from './phong-realtime.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const EN = () => { try { return localStorage.getItem('bizon-lang') === 'en'; } catch (e) { return false; } };
const T = (vi, en) => (EN() ? en : vi);
document.documentElement.lang = EN() ? 'en' : 'vi';
document.querySelectorAll('[data-en]').forEach(el => { if (EN()) el.textContent = el.dataset.en; });
document.querySelectorAll('[data-en-aria]').forEach(el => { if (EN()) el.setAttribute('aria-label', el.dataset.enAria); });
document.querySelectorAll('[data-en-ph]').forEach(el => { if (EN()) el.setAttribute('placeholder', el.dataset.enPh); });

const $ = id => document.getElementById(id);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
const SUC_CHUA = 30;

// ---------- dữ liệu ----------
const CTY = [
  { id: 'phu-sa-foods', ten: 'Phù Sa Foods', mau: '#c45c3a' },
  { id: 'moc-nhien', ten: 'Mộc Nhiên', mau: '#4f9a4a' },
  { id: 'lam-viet', ten: 'Lam Việt', mau: '#2a6fb0' },
  { id: 'mekong-digital', ten: 'Mekong Digital', mau: '#6b4c8a' }];
const ctyCua = id => CTY.find(c => c.id === id) || CTY[0];
const DAO = [
  { id: 'nha', ten: 'Đảo Mekong', x: 0, z: 0, r: 13, vi: 'Đảo nhà – nơi bốn doanh nghiệp xuất phát.', en: 'Home island – where the four companies set out.' },
  { id: 'bac-phong', ten: 'Bắc Phong', x: -46, z: -34, r: 12, vi: 'Tiêu chuẩn nghiêm ngặt: chứng nhận trước, bán hàng sau.', en: 'Strict standards: certification first, sales second.' },
  { id: 'hai-lam', ten: 'Hải Lam', x: 44, z: -38, r: 12, vi: 'Thị trường số: kênh trực tuyến quyết định thắng thua.', en: 'Digital market: online channels decide who wins.' },
  { id: 'hoa-son', ten: 'Hỏa Sơn', x: -54, z: 22, r: 12, vi: 'Phân mảnh theo vùng đảo: mỗi vùng một cách phân phối.', en: 'Fragmented by island region: each region needs its own distribution.' },
  { id: 'kim-sa', ten: 'Kim Sa', x: 48, z: 22, r: 12, vi: 'Khách hàng trẻ: thích mới, đổi nhanh.', en: 'Young customers: love new things, switch fast.' },
  { id: 'luc-dao', ten: 'Lục Đảo', x: -16, z: -64, r: 12, vi: 'Thị trường xanh: cần hồ sơ bền vững.', en: 'Green market: a sustainability record is required.' },
  { id: 'nhat-quang', ten: 'Nhật Quang', x: 22, z: -66, r: 12, vi: 'Quan hệ dài hạn: niềm tin xây từng bước.', en: 'Long-term relationships: trust is built step by step.' },
  { id: 'tan-cang', ten: 'Tân Cảng', x: 8, z: 52, r: 12, vi: 'Cửa ngõ khu vực: logistics là lợi thế.', en: 'Regional gateway: logistics is the advantage.' }];

// ---------- dựng cảnh ----------
const stage = $('rk-stage');
const small = Math.min(innerWidth, innerHeight) < 600;
const R = new THREE.WebGLRenderer({ antialias: !small });
R.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 1.75));
R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.0;
R.shadowMap.enabled = !small; R.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(R.domElement);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(42, 1, .3, 1500);
const clay = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: new THREE.Color(c), roughness: .9, metalness: 0 }, o));
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const bong = m => { m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return m; };

const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { a: { value: new THREE.Color('#6fb2e2') }, b: { value: new THREE.Color('#e6f2f2') } },
  vertexShader: 'varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: 'uniform vec3 a; uniform vec3 b; varying float h; void main(){ gl_FragColor = vec4(mix(b, a, smoothstep(-.04,.5,h)), 1.); }' }));
scene.add(sky);
scene.fog = new THREE.Fog('#e6f2f2', 160, 640);
scene.add(new THREE.HemisphereLight('#ffffff', '#3a6a5a', .9));
const sun = new THREE.DirectionalLight('#fff3de', 2.4); sun.castShadow = true; sun.shadow.mapSize.set(1536, 1536);
Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 320 }); sun.shadow.bias = -.0008;
scene.add(sun, sun.target);
const huongNang = V(-.5, .78, -.38).normalize();

// biển: màu theo khoảng cách tới đảo, sóng trên CPU
const sea = new THREE.Mesh(new THREE.PlaneGeometry(520, 520, small ? 90 : 130, small ? 90 : 130), clay('#ffffff', { roughness: .3, vertexColors: true, flatShading: true }));
sea.geometry.rotateX(-Math.PI / 2); sea.receiveShadow = true; scene.add(sea);
{ const p = sea.geometry.attributes.position, c = new Float32Array(p.count * 3), nong = new THREE.Color('#5fd4c4'), sau = new THREE.Color('#2b8fae'), xa = new THREE.Color('#1f6f94'), tg = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); let d = 1e9; DAO.forEach(o => { d = Math.min(d, Math.hypot(x - o.x, z - o.z) - o.r); });
    tg.copy(nong).lerp(sau, ss(0, 34, d)).lerp(xa, ss(70, 230, d)); c[i * 3] = tg.r; c[i * 3 + 1] = tg.g; c[i * 3 + 2] = tg.b; }
  sea.geometry.setAttribute('color', new THREE.BufferAttribute(c, 3)); }
const sea0 = sea.geometry.attributes.position.array.slice();
const far = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), clay('#1f6f94', { roughness: .3 })); far.rotation.x = -Math.PI / 2; far.position.y = -1.6; scene.add(far);
const song = (x, z, t) => .3 * (Math.sin(x * .07 + t * .9) * .6 + Math.sin(z * .09 - t * 1.1) * .5 + Math.sin((x + z) * .15 + t * 1.7) * .25) - .15;
function veSong(t) { const p = sea.geometry.attributes.position, a = p.array; for (let i = 0; i < p.count; i++) a[i * 3 + 1] = song(sea0[i * 3], sea0[i * 3 + 2], t); p.needsUpdate = true; sea.geometry.computeVertexNormals(); }

// địa hình
const nhieu = (x, z) => Math.sin(x * .9 + z * .3) * .5 + Math.sin(z * 1.1 - x * .5) * .5 + Math.sin((x - z) * 1.9) * .25;
const g2 = (x, z, cx, cz, s) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / s);
function caoDo(k, x, z, r) { const d = Math.hypot(x, z) / r, dat = 1 - ss(.74, 1.02, d); let h = 1 + nhieu(x, z) * .12;
  if (k === 'nha') h += 2.6 * g2(x, z, -3, -5, 10) + .4 * g2(x, z, 6, -4, 20);
  if (k === 'bac-phong') h += 11 * g2(x, z, -2, -2, 14) + 8 * g2(x, z, 4, 1, 9) + 6.5 * g2(x, z, -5, 4, 8) + Math.abs(nhieu(x * 1.7, z * 1.7)) * 1.4 * (1 - d);
  if (k === 'hoa-son') h += 14 * Math.pow(Math.max(0, 1 - d / .78), 1.25) - (d < .13 ? 3.2 * (1 - d / .13) : 0);
  if (k === 'kim-sa') h += 1.6 * Math.abs(Math.sin(x * .5 + Math.sin(z * .32) * 1.6)) * (1 - ss(.45, .8, d));
  if (k === 'luc-dao') { const raw = 8.5 * Math.max(0, 1 - d / .86); h += Math.floor(raw / 1.05) * 1.05; }
  if (k === 'nhat-quang') h += 1.8 * g2(x, z, 3, -3, 18) + 1.2 * g2(x, z, -4, 2, 12);
  if (k === 'tan-cang') h = 1;
  return h * dat - (1 - dat) * 2.6; }
const MAU = { 'nha': '#86c45e', 'hai-lam': '#55607a', 'kim-sa': '#f0d48a', 'nhat-quang': '#a6d47e', 'tan-cang': '#b9b4a8' };
function mau(k, x, y, z, r, c) {
  if (y < .55 && k !== 'tan-cang') return c.set('#ead6a2');
  if (k === 'bac-phong') return c.set(y > 4.8 ? '#f4f7fa' : y > 2.6 ? '#8b9097' : '#6f9a6a');
  if (k === 'hoa-son') { const d = Math.hypot(x, z) / r; return c.set(d < .17 ? '#ff6a20' : y > 9 ? '#3e2a22' : y > 4 ? '#5a3c2c' : '#6d8a4a'); }
  if (k === 'luc-dao') return c.set(Math.floor(y / 1.05) % 2 ? '#7fcb5c' : '#5aae48');
  return c.set(MAU[k]); }
const G = {};
DAO.forEach(o => { const g = new THREE.Group(); g.position.set(o.x, 0, o.z); scene.add(g); G[o.id] = g;
  const n = small ? 56 : (o.id === 'bac-phong' || o.id === 'hoa-son' || o.id === 'luc-dao' ? 90 : 64);
  const geo = new THREE.PlaneGeometry(o.r * 2.3, o.r * 2.3, n, n); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, c = new Float32Array(p.count * 3), tg = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const lx = p.getX(i), lz = p.getZ(i), y = caoDo(o.id, lx, lz, o.r); p.setY(i, y); mau(o.id, lx, y, lz, o.r, tg); c[i * 3] = tg.r; c[i * 3 + 1] = tg.g; c[i * 3 + 2] = tg.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, clay('#ffffff', { vertexColors: true, flatShading: true })); m.castShadow = m.receiveShadow = true; g.add(m);
  g.userData.h = (lx, lz) => caoDo(o.id, lx, lz, o.r);
  const bot = new THREE.Mesh(new THREE.RingGeometry(o.r * .93, o.r * 1.08, 56), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .3, depthWrite: false }));
  bot.rotation.x = -Math.PI / 2; bot.position.set(o.x, .12, o.z); scene.add(bot); });
// ---------- mô hình 3D Kenney (CC0): thuyền, dừa, cây, bụi, đá, hoa, lục bình ----------
// Nạp không đồng bộ: chỗ nào cần mô hình thì gọi chay(f); nạp xong mới chạy. Nạp hỏng thì dùng hình khối cũ.
const MH = {}, DAT = []; let MH_XONG = false;
const MH_DS = { 'kenney-thuyen': ['boat-fishing-small', 'boat-row-small', 'boat-house-a'],
  'kenney-cay': ['tree_palm', 'tree_palmBend', 'tree_palmShort', 'tree_default', 'tree_oak', 'plant_bush', 'plant_bushDetailed', 'plant_bushLarge',
    'rock_smallA', 'flower_redA', 'flower_yellowB', 'flower_purpleB', 'grass_large', 'lily_large', 'lily_small', 'stump_round'] };
const chay = f => { if (MH_XONG) f(); else DAT.push(f); };
function moHinh(ten, cao) { const m = MH[ten]; if (!m) return null; const g = m.clone(true);
  if (cao) { const b = new THREE.Box3().setFromObject(g); g.scale.setScalar(cao / Math.max(.01, b.max.y - b.min.y)); }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; }
function datMH(cha, ten, x, y, z, cao, quay) { const g = moHinh(ten, cao); if (!g) return false; g.position.set(x, y, z); g.rotation.y = quay; cha.add(g); return true; }
{ const L = new GLTFLoader(); const viec = Object.entries(MH_DS).flatMap(([d, ds]) => ds.map(t => [d, t])); let con = viec.length;
  const xong = () => { if (--con > 0) return; MH_XONG = true; DAT.splice(0).forEach(f => f()); document.body.dataset.moHinh = Object.keys(MH).length + '/' + viec.length; };
  viec.forEach(([d, ten]) => L.load('assets/models/' + d + '/' + ten + '.glb', gl => {
    gl.scene.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.metalness = 0;
      const hsl = {}; m.color.getHSL(hsl); if (!m.map && hsl.h > .38 && hsl.h < .56 && hsl.s > .2) m.color.set(hsl.l > .3 ? '#79b25c' : '#4f8a3e'); }); });  // Nature Kit khai metallic 1; lá xanh ngọc → xanh lá
    MH[ten] = gl.scene; xong(); }, undefined, () => xong())); }
function cayDua(g, x, z, h = 3) { const k = DAT.length; chay(() => datMH(g, ['tree_palm', 'tree_palmBend', 'tree_palmShort'][k % 3], x, g.userData.h(x, z) - .05, z, h * 1.25, k * 1.7) || cayDuaCu(g, x, z, h)); }
function cayDuaCu(g, x, z, h = 3) { const t = new THREE.Group(); t.position.set(x, g.userData.h(x, z), z);
  const th = new THREE.Mesh(new THREE.CylinderGeometry(.12, .18, h, 6), clay('#9a6b3f')); th.position.y = h / 2; th.rotation.z = .12; t.add(th);
  for (let k = 0; k < 6; k++) { const la = new THREE.Mesh(new THREE.ConeGeometry(.35, 1.9, 4), clay('#4f9a4a')); la.position.set(Math.cos(k) * .7, h + .1, Math.sin(k) * .7); la.rotation.set(Math.PI / 2 - .6, 0, k * 1.05); t.add(la); }
  g.add(bong(t)); }
function cayTron(g, x, z, m, s = 1) { const k = DAT.length; chay(() => (!/^#f[3-6]/i.test(m) && datMH(g, k % 2 ? 'tree_oak' : 'tree_default', x, g.userData.h(x, z) - .05, z, 3.4 * s, k * 1.3)) || cayTronCu(g, x, z, m, s)); }
function cayTronCu(g, x, z, m, s = 1) { const t = new THREE.Group(); t.position.set(x, g.userData.h(x, z), z);
  const th = new THREE.Mesh(new THREE.CylinderGeometry(.12 * s, .18 * s, 1.4 * s, 6), clay('#6a4a3a')); th.position.y = .7 * s;
  const tan = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1 * s, 0), clay(m)); tan.position.y = 1.9 * s; t.add(th, tan); g.add(bong(t)); }
function cayThong(g, x, z, s = 1) { const t = new THREE.Group(); t.position.set(x, g.userData.h(x, z), z);
  for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry((1 - k * .25) * s, 1.4 * s, 7), clay('#3f6e4a')); c.position.y = (.8 + k * .7) * s; t.add(c); } g.add(bong(t)); }
function nha(g, x, z, w, h, mt, mm, rot = 0) { const n = new THREE.Group(); n.position.set(x, g.userData.h(x, z) - .05, z); n.rotation.y = rot;
  const tg = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * .8), clay(mt)); tg.position.y = h / 2;
  const mai = new THREE.Mesh(new THREE.ConeGeometry(w * .82, h * .7, 4), clay(mm)); mai.position.y = h * 1.35; mai.rotation.y = Math.PI / 4; n.add(tg, mai); g.add(bong(n)); }
{ const g = G.nha;
  const da = new THREE.Group(); da.position.set(-3, g.userData.h(-3, -5) - .2, -5);
  const goc = new THREE.Mesh(new THREE.CylinderGeometry(.5, .9, 3.2, 8), clay('#7a5634')); goc.position.y = 1.6; da.add(goc);
  for (let k = 0; k < 6; k++) { const tn = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 0), clay(k % 2 ? '#3f8a3e' : '#4a9a46')); tn.position.set(Math.cos(k * 1.1) * 1.6, 3.8 + (k % 2) * .6, Math.sin(k * 1.1) * 1.6); da.add(tn); }
  g.add(bong(da));
  const ben = new THREE.Mesh(new THREE.BoxGeometry(2.2, .2, 7), clay('#a7744a')); ben.position.set(2, 1.05, 13); g.add(bong(ben));
  nha(g, -7, 2, 2.6, 1.8, '#f1e2c4', '#c45c3a', .3); nha(g, -3.4, 6, 2.4, 1.7, '#e8d9f0', '#3f6f68', -.2); nha(g, 3.2, 5, 2.4, 1.7, '#d7ecf5', '#b8842c', .2); nha(g, 6.4, .5, 2.6, 1.8, '#f6e9d0', '#6b4c8a', -.4);
  [[9, 6], [-9, -2], [7.5, -6.5], [-6.5, 8.5], [4.5, 9], [10, -1], [-10, 4], [0, -10]].forEach(([x, z], i) => cayDua(g, x, z, 2.6 + (i % 3) * .4)); }
{ const g = G['bac-phong']; [[6, 6], [7.5, 3.5], [-7, 6.5], [-8.5, 3], [8, -4], [2, 8.5], [-3, 8.8], [5, -7.5]].forEach(([x, z]) => cayThong(g, x, z, 1)); nha(g, 5.5, 7.2, 1.9, 1.4, '#a8b0b8', '#4a5462', .4); }
{ const g = G['hai-lam'], N = ['#ff4fa3', '#3fd0ff', '#b46bff', '#ffd23f'];
  for (let k = 0; k < 14; k++) { const a = k * 2.39, rr = 1.5 + (k % 5) * 1.5, h = 3 + ((k * 7) % 6) * 1.6 + (5 - (k % 5));
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.5, h, 1.5), clay('#2e3a5a', { emissive: new THREE.Color(N[k % 4]), emissiveIntensity: .45 })); b.position.set(Math.cos(a) * rr, 1 + h / 2, Math.sin(a) * rr); g.add(bong(b)); } }
{ const g = G['hoa-son']; const l = new THREE.Mesh(new THREE.CircleGeometry(1.7, 20), new THREE.MeshBasicMaterial({ color: '#ff8a3a' })); l.rotation.x = -Math.PI / 2; l.position.y = g.userData.h(0, 0) + .25; g.add(l);
  [[8, 5], [-8, 6], [7, -7], [-9, -3]].forEach(([x, z]) => cayTron(g, x, z, '#5d7a3a', .8)); }
{ const g = G['kim-sa'], m = ['#e8553a', '#f2c45c', '#3fb0a8', '#ffffff'];
  for (let k = 0; k < 8; k++) { const x = -5 + (k % 4) * 3.3, z = 2 + Math.floor(k / 4) * 3.4, o = new THREE.Group(); o.position.set(x, g.userData.h(x, z), z);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 2, 5), clay('#ffffff')); c.position.y = 1; const d = new THREE.Mesh(new THREE.ConeGeometry(1.3, .6, 8), clay(m[k % 4])); d.position.y = 2.1; o.add(c, d); g.add(bong(o)); }
  [[8, 6], [-8, 7], [9, -3], [-9, -4]].forEach(([x, z]) => cayDua(g, x, z)); }
{ const g = G['luc-dao']; [[9, 4], [-9, 5], [8, -6], [-7.5, -7], [2, 9.5], [-3, -9.5]].forEach(([x, z], i) => cayTron(g, x, z, i % 2 ? '#3e8a3e' : '#4f9a40', .9)); }
{ const g = G['nhat-quang'], n = new THREE.Group(); n.position.set(3, g.userData.h(3, -3), -3);
  for (let k = 0; k < 3; k++) { const th = new THREE.Mesh(new THREE.BoxGeometry(2.2 - k * .5, .9, 2.2 - k * .5), clay('#f4ead8')); th.position.y = .45 + k * 1.15;
    const mai = new THREE.Mesh(new THREE.BoxGeometry(3 - k * .6, .22, 3 - k * .6), clay('#9a2a2a')); mai.position.y = 1 + k * 1.15; n.add(th, mai); } g.add(bong(n));
  [[-5, 3], [-2, 6], [2, 6.5], [6, 4], [-6.5, -1.5], [7, -.5]].forEach(([x, z], i) => cayTron(g, x, z, i % 3 ? '#f6a6c0' : '#f3c0d2', .95)); }
{ const g = G['tan-cang'], m = ['#c45c3a', '#3f6f68', '#2a6fb0', '#e8b23a', '#7fbf9a'];
  for (let k = 0; k < 3; k++) { const c = new THREE.Group(); c.position.set(-5 + k * 5, 1, -7); const a = new THREE.Mesh(new THREE.BoxGeometry(.35, 7, .35), clay('#f2c23a')); a.position.set(-.9, 3.5, 0); const b = a.clone(); b.position.x = .9;
    const ng = new THREE.Mesh(new THREE.BoxGeometry(.35, .35, 8), clay('#f2c23a')); ng.position.set(0, 7, -2); c.add(a, b, ng); g.add(bong(c)); }
  for (let k = 0; k < 24; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(2, .9, .9), clay(m[k % 5])); b.position.set(-6 + (k % 6) * 2.15, 1.45 + Math.floor(k / 12) * .9, 1 + (Math.floor(k / 6) % 2) * 1.05); g.add(bong(b)); } }

// nhà nổi, lục bình ven đảo nhà; bụi, đá, hoa rải trên các đảo xanh
const NHA_NOI = [];
chay(() => { [[-12, -12, .9], [-15, 6, -.6], [61, 26, 2.2]].forEach(([x, z, q]) => { const b = moHinh('boat-house-a', 3.2); if (b) { b.position.set(x, .05, z); b.rotation.y = q; scene.add(b); NHA_NOI.push(b); } });
  for (let k = 0; k < 26; k++) { const a = k * 2.399, rr = 14.2 + (k % 4) * .9; datMH(scene, k % 2 ? 'lily_large' : 'lily_small', Math.cos(a) * rr, .16, Math.sin(a) * rr, .15, k); }
  const RAI = { 'nha': 22, 'luc-dao': 10, 'nhat-quang': 12, 'kim-sa': 8, 'hoa-son': 6, 'bac-phong': 8 };
  const DO = ['plant_bushDetailed', 'plant_bush', 'plant_bushLarge', 'rock_smallA', 'flower_redA', 'flower_yellowB', 'flower_purpleB', 'grass_large', 'stump_round'];
  DAO.forEach(o => { const g = G[o.id]; for (let k = 0; k < (RAI[o.id] || 0); k++) { const a = k * 2.399 + o.id.length, rr = o.r * (.35 + .4 * ((k * .618) % 1)), x = Math.cos(a) * rr, z = Math.sin(a) * rr, y = g.userData.h(x, z);
      if (y < .6 || y > 4) continue; const t = o.id === 'kim-sa' ? ['rock_smallA', 'grass_large', 'stump_round'][k % 3] : DO[k % DO.length];
      datMH(g, t, x, y - .03, z, /flower/.test(t) ? .55 : /rock|stump/.test(t) ? .7 : .9, k * 1.9); } }); });

// nhãn chữ trên canvas (tên đảo, tên người chơi)
function nhan(text, mauNen, w = 512) { const c = document.createElement('canvas'); c.width = w; c.height = 128; const g = c.getContext('2d');
  g.font = '800 54px Manrope, "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (mauNen) { const tw = Math.min(w - 8, g.measureText(text).width + 56); g.fillStyle = mauNen; g.beginPath(); g.roundRect((w - tw) / 2, 18, tw, 92, 46); g.fill(); g.fillStyle = '#ffffff'; }
  else { g.lineWidth = 12; g.strokeStyle = 'rgba(15,30,34,.85)'; g.strokeText(text, w / 2, 66); g.fillStyle = '#fffcf5'; }
  g.fillText(text, w / 2, 66); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false })); s.scale.set(w / 128 * 2.2, 2.2, 1); s.renderOrder = 5; return s; }
DAO.forEach(o => { const s = nhan(o.ten); s.scale.multiplyScalar(1.1); const top = { 'bac-phong': 15, 'hoa-son': 17, 'hai-lam': 15, 'luc-dao': 11 }[o.id] || 9; s.position.set(o.x, top, o.z); scene.add(s); });

// thuyền: thân màu doanh nghiệp, cờ, hình nhà sáng lập đứng trên boong
const anhCty = {}; const loader = new THREE.TextureLoader();
CTY.forEach(c => { const tex = loader.load('assets/character/firms/' + c.id + '-cut.webp', t => { anhCty[c.id].ratio = t.image.width / t.image.height; anhCty[c.id].ok = true; });
  tex.colorSpace = THREE.SRGBColorSpace; anhCty[c.id] = { tex, ratio: .7, ok: false }; });
function taoThuyen(ctyId, ten, cuaMinh) { const c = ctyCua(ctyId), g = new THREE.Group(), vo = new THREE.Group(); g.add(vo);
  // thân thuyền: thuyền đánh cá Kenney khi mô hình đã nạp, còn không thì khối hộp (rồi đổi khi nạp xong); cờ mang màu doanh nghiệp
  const coMau = new THREE.Mesh(new THREE.PlaneGeometry(.9, .5), clay(c.mau, { side: THREE.DoubleSide })); coMau.position.set(.45, 3.8, .3); coMau.rotation.y = Math.PI / 2; g.add(coMau);
  chay(() => { const b = moHinh('boat-fishing-small', 3.1); if (!b) return; vo.clear(); vo.add(b); });
  const than = new THREE.Mesh(new THREE.BoxGeometry(1.5, .7, 4), clay(c.mau)); than.position.y = .35;
  const mui = new THREE.Mesh(new THREE.ConeGeometry(.75, 1.5, 4), clay(c.mau)); mui.rotation.set(Math.PI / 2, 0, Math.PI / 4); mui.position.set(0, .35, 2.7);
  const cot = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 3.4, 5), clay('#7a5634')); cot.position.set(0, 2.2, .9);
  const buom = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.4), clay('#fff7e6', { side: THREE.DoubleSide })); buom.position.set(0, 2.3, .9); buom.rotation.y = Math.PI / 2;
  if (!MH_XONG) vo.add(than, mui, cot, buom); bong(g);
  const a = anhCty[c.id]; const nv = new THREE.Sprite(new THREE.SpriteMaterial({ map: a.tex, transparent: true, alphaTest: .05 })); nv.center.set(.5, 0); nv.position.set(0, .75, 1.2); g.add(nv); g.userData.nv = nv; g.userData.cty = c.id; NV_DS.push(g);
  const tag = nhan(ten, cuaMinh ? '#006687' : c.mau); tag.position.set(0, 4.6, 0); tag.scale.multiplyScalar(.42); g.add(tag); g.userData.tag = tag;
  scene.add(g); return g; }
function datTen(g, ten, cuaMinh, dau) { g.remove(g.userData.tag); g.userData.tag.material.map.dispose(); const tag = nhan(ten + (dau ? '  ✦' + dau : ''), cuaMinh ? '#006687' : ctyCua(g.userData.cty).mau); tag.position.set(0, 4.6, 0); tag.scale.multiplyScalar(.42); g.add(tag); g.userData.tag = tag; }

// hiệu ứng: pháo hoa nhỏ và bong bóng vẫy tay, gắn theo thuyền
const TRON = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.4, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
const HIEU = [], NV_DS = [];
function phaoHoa(g, mau) { const n = 90, geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), dir = [];
  for (let i = 0; i < n; i++) { const th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1); dir.push([Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)]); }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ map: TRON, color: new THREE.Color(mau), size: .9, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  scene.add(p); HIEU.push({ p, g, dir, t0: performance.now(), kieu: 'phao' }); }
function vayTay(g) { const s = nhan('👋', null, 128); s.scale.set(3, 3, 1); scene.add(s); HIEU.push({ p: s, g, t0: performance.now(), kieu: 'vay' }); }
function chayHieu(now) { for (let i = HIEU.length - 1; i >= 0; i--) { const h = HIEU[i], u = (now - h.t0) / 1000, gp = h.g.position;
  if (h.kieu === 'phao') { const a = h.p.geometry.attributes.position.array, r = Math.min(u * 9, 6);
    h.dir.forEach((d, k) => { a[k * 3] = gp.x + d[0] * r; a[k * 3 + 1] = gp.y + 9 + d[1] * r - u * u * 1.5; a[k * 3 + 2] = gp.z + d[2] * r; });
    h.p.geometry.attributes.position.needsUpdate = true; h.p.material.opacity = Math.max(0, 1 - u / 1.8); }
  else { h.p.position.set(gp.x, gp.y + 7.4 + u * .8, gp.z); h.p.material.opacity = Math.max(0, 1 - u / 2.2); }
  if (u > 2.3) { scene.remove(h.p); h.p.geometry.dispose(); h.p.material.dispose(); HIEU.splice(i, 1); } } }

// ---------- người chơi ----------
const KEY_TEN = 'bizon-rakhoi-ten', KEY_CTY = 'bizon-rakhoi-cty', KEY_PHONG = 'bizon-rakhoi-phong', KEY_DAU = 'bizon-rakhoi-dau';
const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
const id = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)).slice(0, 12);
const xp = Math.random() * 2.4 - 1.2;   // chỗ xuất phát: rải quanh bến cho khỏi chồng lên nhau
const toi = { ten: '', cty: ls.get(KEY_CTY) || 'phu-sa-foods', x: Math.sin(xp) * 24, z: Math.cos(xp) * 24, h: xp + Math.PI, v: 0, g: null, dau: new Set(JSON.parse(ls.get(KEY_DAU) || '[]')) };
const ban = new Map();   // id → { g, ten, cty, dau, mau: [{t,x,z,h}] }
let phong = null, maPhong = '', ketNoi = false;

const sach = s => String(s || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 24);
const so = (x, a, b) => typeof x === 'number' && isFinite(x) ? clamp(x, a, b) : null;
function toast(msg) { const d = document.createElement('div'); d.className = 'rk-pill'; d.textContent = msg; $('rk-toast').appendChild(d); setTimeout(() => d.remove(), 4100); while ($('rk-toast').children.length > 3) $('rk-toast').firstChild.remove(); }

function veDanhSach() {
  const ds = [{ ten: toi.ten + T(' (bạn)', ' (you)'), cty: toi.cty, dau: toi.dau.size }, ...[...ban.values()].map(b => ({ ten: b.ten, cty: b.cty, dau: b.dau }))];
  $('rk-room-t').textContent = (maPhong || '…') + ' · ' + ds.length + '/' + SUC_CHUA;
  $('rk-room').classList.toggle('on', ketNoi);
  $('rk-list-h').textContent = ketNoi ? T(ds.length + ' thuyền trong phòng ' + maPhong, ds.length + ' boats in room ' + maPhong) : T('Đang chờ kết nối…', 'Connecting…');
  const ul = $('rk-list-ul'); ul.textContent = '';
  ds.forEach(d => { const li = document.createElement('li'); const c = document.createElement('span'); c.className = 'c'; c.style.background = ctyCua(d.cty).mau;
    const n = document.createElement('span'); n.textContent = d.ten; const e = document.createElement('em'); e.textContent = '✦ ' + d.dau + '/7'; li.append(c, n, e); ul.appendChild(li); }); }

function nhanDanhSach(ds) {
  const con = new Set();
  ds.forEach(m => { if (m.id === id) return; con.add(m.id); const ten = sach(m.ten) || T('Thuyền lạ', 'Unknown'), cty = ctyCua(m.cty).id, dau = clamp(+m.dau || 0, 0, 7);
    let b = ban.get(m.id);
    if (!b) { b = { g: taoThuyen(cty, ten, false), ten, cty, dau, mau: [] }; b.g.visible = false; ban.set(m.id, b); toast(T('⛵ ' + ten + ' vừa ra khơi', '⛵ ' + ten + ' set sail')); }
    if (b.ten !== ten || b.dau !== dau) { b.ten = ten; b.dau = dau; datTen(b.g, ten, false, dau); } });
  for (const [k, b] of ban) if (!con.has(k)) { scene.remove(b.g); NV_DS.splice(NV_DS.indexOf(b.g), 1); ban.delete(k); }
  veDanhSach(); }

function nhanTin(ev, p) {
  if (!p || typeof p !== 'object' || p.i === id) return; const b = ban.get(p.i); if (!b) return;
  if (ev === 'p') { const x = so(p.x, -200, 200), z = so(p.z, -200, 200), h = so(p.h, -50, 50); if (x === null || z === null || h === null) return;
    b.mau.push({ t: performance.now(), x, z, h }); if (b.mau.length > 12) b.mau.shift(); b.g.visible = true; }
  else if (ev === 'e') { if (p.k === 'vay') vayTay(b.g); else if (p.k === 'phao') phaoHoa(b.g, ctyCua(b.cty).mau);
    else if (p.k === 'dau') { const d = DAO.find(o => o.id === p.d); if (d) { phaoHoa(b.g, '#ffd27a'); toast(T('✦ ' + b.ten + ' vừa đóng dấu ' + d.ten, '✦ ' + b.ten + ' got the ' + d.ten + ' stamp')); } } } }

function vaoPhong(ma, lan = 0) {
  maPhong = ma; ketNoi = false; veDanhSach();
  const cfg = window.BIZON_BACKEND;
  if (!cfg || !cfg.enabled || !cfg.url) { toast(T('Chưa bật kết nối – bạn đang đi một mình', 'No connection configured – sailing solo')); return; }
  let daXet = false;
  phong = moPhong({ url: cfg.url, key: cfg.anonKey, phong: ma.toLowerCase().replace(/[^a-z0-9-]/g, '-'), id,
    trangThai: () => ({ ten: toi.ten, cty: toi.cty, dau: toi.dau.size }),
    onTin: nhanTin,
    onDanhSach: ds => { if (!daXet && ketNoi) { daXet = true;
        if (ds.length > SUC_CHUA && lan < 9) { const moi = ma.replace(/-\d+$/, '') + '-' + (lan + 2); toast(T('Phòng ' + ma + ' đã đủ ' + SUC_CHUA + ' thuyền, chuyển sang ' + moi, 'Room ' + ma + ' is full, moving to ' + moi)); roiPhong(); vaoPhong(moi, lan + 1); return; } }
      nhanDanhSach(ds); },
    onTrangThai: s => { ketNoi = s === 'da-vao'; if (s === 'mat-ket-noi') toast(T('Mất kết nối, đang nối lại…', 'Connection lost, reconnecting…')); veDanhSach(); } });
  ls.set(KEY_PHONG, ma); }
function roiPhong() { if (phong) phong.dong(); phong = null; for (const [, b] of ban) { scene.remove(b.g); NV_DS.splice(NV_DS.indexOf(b.g), 1); } ban.clear(); }
addEventListener('pagehide', () => roiPhong());

// ---------- màn vào ----------
{ const box = $('rk-firms');
  CTY.forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.className = 'rk-firm'; b.setAttribute('aria-pressed', String(c.id === toi.cty));
    const im = document.createElement('img'); im.src = 'assets/character/firms/' + c.id + '-cut.webp'; im.alt = ''; im.loading = 'lazy';
    const s = document.createElement('span'); s.textContent = c.ten; b.append(im, s);
    b.onclick = () => { toi.cty = c.id; box.querySelectorAll('.rk-firm').forEach(x => x.setAttribute('aria-pressed', String(x === b))); }; box.appendChild(b); });
  $('rk-ten').value = ls.get(KEY_TEN) || '';
  const q = new URLSearchParams(location.search); $('rk-ma').value = sach(q.get('lop') || q.get('phong') || ls.get(KEY_PHONG) || '').toUpperCase();
  $('rk-form').addEventListener('submit', e => { e.preventDefault();
    toi.ten = sach($('rk-ten').value); if (!toi.ten) { $('rk-ten').focus(); return; }
    const ma = (sach($('rk-ma').value).toUpperCase().replace(/[^A-Z0-9-]/g, '') || 'BIZON').slice(0, 24);
    ls.set(KEY_TEN, toi.ten); ls.set(KEY_CTY, toi.cty);
    toi.g = taoThuyen(toi.cty, toi.ten, true); datTen(toi.g, toi.ten, true, toi.dau.size);
    $('rk-vao').hidden = true; vaoPhong(ma); document.activeElement && document.activeElement.blur(); }); }
$('rk-room').onclick = () => { const l = $('rk-list'); l.hidden = !l.hidden; $('rk-room').setAttribute('aria-expanded', String(!l.hidden)); };

// ---------- điều khiển ----------
const phim = {};
addEventListener('keydown', e => { if (e.target.tagName === 'INPUT') return; phim[e.key.toLowerCase()] = true; if (e.key.startsWith('Arrow')) e.preventDefault(); });
addEventListener('keyup', e => { phim[e.key.toLowerCase()] = false; });
const joy = { x: 0, y: 0, on: false };
{ const el = $('rk-joy'), nut = el.querySelector('b');
  const dat = e => { const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy), m = r.width / 2;
    const k = d > m ? m / d : 1; joy.x = dx * k / m; joy.y = dy * k / m; nut.style.transform = `translate(${dx * k}px, ${dy * k}px)`; };
  el.addEventListener('pointerdown', e => { joy.on = true; el.setPointerCapture(e.pointerId); dat(e); });
  el.addEventListener('pointermove', e => { if (joy.on) dat(e); });
  const tha = () => { joy.on = false; joy.x = joy.y = 0; nut.style.transform = ''; }; el.addEventListener('pointerup', tha); el.addEventListener('pointercancel', tha); }
let choEmo = 0;
function emo(k) { const now = performance.now(); if (!toi.g || now < choEmo) return; choEmo = now + 1500;
  if (k === 'vay') vayTay(toi.g); else phaoHoa(toi.g, ctyCua(toi.cty).mau); phong && phong.phat('e', { i: id, k }); }
$('rk-wave').onclick = () => emo('vay'); $('rk-fire').onclick = () => emo('phao');
let daoGan = null;
$('rk-port').onclick = () => { if (!daoGan) return; const d = daoGan;
  $('rk-mkt-img').src = d.id === 'nha' ? 'assets/illustrations/game/mkt-tan-cang.webp' : 'assets/illustrations/game/mkt-' + d.id + '.webp';
  $('rk-mkt-img').hidden = d.id === 'nha';
  $('rk-mkt-h').textContent = d.ten; $('rk-mkt-p').textContent = T(d.vi, d.en);
  if (d.id !== 'nha') { const moi = !toi.dau.has(d.id); toi.dau.add(d.id); ls.set(KEY_DAU, JSON.stringify([...toi.dau]));
    $('rk-mkt-dau').hidden = false; $('rk-mkt-dau').textContent = moi ? T('✦ Đã đóng dấu – ' + toi.dau.size + '/7 thị trường', '✦ Stamped – ' + toi.dau.size + '/7 markets') : T('✦ Đã có dấu ' + d.ten, '✦ You already have the ' + d.ten + ' stamp');
    if (moi) { datTen(toi.g, toi.ten, true, toi.dau.size); phaoHoa(toi.g, '#ffd27a'); phong && (phong.phat('e', { i: id, k: 'dau', d: d.id }), phong.capNhat()); veDanhSach(); } }
  else $('rk-mkt-dau').hidden = true;
  $('rk-mkt').hidden = false; $('rk-mkt-x').focus(); };
$('rk-mkt-x').onclick = () => { $('rk-mkt').hidden = true; };
addEventListener('keydown', e => { if (e.key === 'Escape') $('rk-mkt').hidden = true; });

// ---------- vòng lặp ----------
function resize() { const w = stage.clientWidth, h = stage.clientHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
const camPos = V(30, 40, 70), camNhin = V(0, 2, 0), tmp = V();
let tPrev = performance.now(), guiLuc = 0, guiCu = '';
function vong(now) {
  const dt = Math.min(.05, (now - tPrev) / 1000); tPrev = now; const t = now / 1000;
  veSong(t);
  if (toi.g) {
    const len = (phim['arrowup'] || phim['w'] ? 1 : 0) - (phim['arrowdown'] || phim['s'] ? 1 : 0) - joy.y;
    const re = (phim['arrowleft'] || phim['a'] ? 1 : 0) - (phim['arrowright'] || phim['d'] ? 1 : 0) - joy.x;
    toi.v += (clamp(len, -1, 1) * 11 - toi.v) * Math.min(1, dt * 1.6); toi.h += clamp(re, -1, 1) * dt * 1.5 * (.35 + Math.min(1, Math.abs(toi.v) / 6));
    toi.x += Math.sin(toi.h) * toi.v * dt; toi.z += Math.cos(toi.h) * toi.v * dt;
    // không lên bờ: đẩy ra ngoài bán kính đảo; không ra khỏi biển
    DAO.forEach(o => { const dx = toi.x - o.x, dz = toi.z - o.z, d = Math.hypot(dx, dz), m = o.r + 1.6; if (d < m) { toi.x = o.x + dx / d * m; toi.z = o.z + dz / d * m; toi.v *= .6; } });
    const dd = Math.hypot(toi.x, toi.z); if (dd > 150) { toi.x *= 150 / dd; toi.z *= 150 / dd; }
    const y = song(toi.x, toi.z, t);
    toi.g.position.set(toi.x, y, toi.z); toi.g.rotation.set(Math.sin(t * 1.3) * .03, toi.h, Math.sin(t * 1.7) * .04 - re * Math.min(1, Math.abs(toi.v) / 8) * .08);
    // camera bám phía sau
    camPos.lerp(tmp.set(toi.x - Math.sin(toi.h) * 17, 8.5, toi.z - Math.cos(toi.h) * 17), Math.min(1, dt * 2.4));
    camNhin.lerp(tmp.set(toi.x + Math.sin(toi.h) * 6, 2, toi.z + Math.cos(toi.h) * 6), Math.min(1, dt * 3));
    // gửi vị trí ~8 lần/giây khi đang đi, 1 lần/giây khi đứng
    const msg = toi.x.toFixed(1) + toi.z.toFixed(1) + toi.h.toFixed(2);
    if (phong && ketNoi && (now - guiLuc > (msg !== guiCu ? 125 : 1000))) { guiLuc = now; guiCu = msg; phong.phat('p', { i: id, x: +toi.x.toFixed(2), z: +toi.z.toFixed(2), h: +toi.h.toFixed(3) }); }
    // đảo gần nhất trong tầm cập cảng
    let gan = null; DAO.forEach(o => { if (Math.hypot(toi.x - o.x, toi.z - o.z) < o.r + 7) gan = o; });
    if (gan !== daoGan) { daoGan = gan; const b = $('rk-port'); b.hidden = !gan; if (gan) b.textContent = gan.id === 'nha' ? T('🏝️ Ghé đảo nhà', '🏝️ Visit home island') : (toi.dau.has(gan.id) ? '✦ ' : '⚓ ') + T('Cập cảng ' + gan.ten, 'Dock at ' + gan.ten); }
  } else { const a = t * .05; camPos.set(Math.cos(a) * 95, 55, Math.sin(a) * 95); camNhin.set(0, 0, -6); }
  // thuyền người khác: nội suy chậm 200 ms cho mượt
  const tr = now - 200;
  for (const [, b] of ban) { const m = b.mau; if (!m.length) continue; let a = m[0], c = m[m.length - 1];
    for (let i = 0; i < m.length - 1; i++) if (m[i].t <= tr && m[i + 1].t >= tr) { a = m[i]; c = m[i + 1]; break; }
    const k = c.t > a.t ? clamp((tr - a.t) / (c.t - a.t), 0, 1) : 1; let dh = c.h - a.h; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    const x = a.x + (c.x - a.x) * k, z = a.z + (c.z - a.z) * k; b.g.position.set(x, song(x, z, t), z); b.g.rotation.set(Math.sin(t * 1.3) * .03, a.h + dh * k, Math.sin(t * 1.7) * .04); }
  // hình nhà sáng lập trên boong: đúng tỉ lệ ảnh khi ảnh đã nạp
  NV_DS.forEach(o => { const a = anhCty[o.userData.cty]; o.userData.nv.scale.set(2.3 * a.ratio, 2.3, 1); });
  NHA_NOI.forEach((b, k) => { b.position.y = song(b.position.x, b.position.z, t) * .7; b.rotation.z = Math.sin(t * 1.1 + k) * .025; });
  chayHieu(now);
  cam.position.copy(camPos); cam.lookAt(camNhin);
  sun.target.position.copy(camNhin); sun.position.copy(camNhin).addScaledVector(huongNang, 140);
  R.render(scene, cam); requestAnimationFrame(vong); }
veDanhSach(); requestAnimationFrame(vong);
