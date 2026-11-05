// Hành Trình Một Trái Sầu Riêng – cảnh 3D sa bàn đất sét. © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
// Chỉ vẽ cảnh: tiến độ cuộn (0 → 6, số thực) do hanh-trinh-sau-rieng-ui.js ghi vào window.__htTien.
// Mô hình Kenney (CC0, xem assets/models/SOURCES.md) + khối đất sét dựng tay. Không có số liệu nào ở đây.
import * as THREE from 'three';
import { GLTFLoader } from '../js/vendor/GLTFLoader.js';

const CH = window.HanhTrinhData.CHANG;
const host = document.getElementById('ht-stage');
const giam = matchMedia('(prefers-reduced-motion: reduce)').matches;
const nho = () => innerWidth < 760;

let R;
try {
  R = new THREE.WebGLRenderer({ antialias: !nho(), alpha: false, powerPreference: 'low-power' });
} catch (e) { document.documentElement.classList.add('ht-no3d'); throw e; }
R.setPixelRatio(Math.min(devicePixelRatio || 1, nho() ? 1.5 : 2));
R.shadowMap.enabled = !nho();
R.shadowMap.type = THREE.PCFSoftShadowMap;
host.appendChild(R.domElement);

const scene = new THREE.Scene();
const NEN = new THREE.Color('#FBF4E8');
scene.background = NEN;
scene.fog = new THREE.Fog(NEN, 45, 95);
const cam = new THREE.PerspectiveCamera(34, 1, 0.5, 300);

scene.add(new THREE.HemisphereLight('#fff7e8', '#c8b38a', 1.15));
const sun = new THREE.DirectionalLight('#fff1d6', 1.6);
sun.position.set(18, 30, 14);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -28, right: 28, top: 28, bottom: -28, near: 1, far: 90 });
scene.add(sun, sun.target);

const clay = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: new THREE.Color(c), roughness: 0.9, metalness: 0 }, o));
const M = {
  dat: clay('#E9D9B6'), co: clay('#BFD99A'), co2: clay('#A9CF84'), duong: clay('#5C6B6B'), vach: clay('#F6EFD9'),
  trai: clay('#8DAA3A', { flatShading: true }), traiVang: clay('#F5BE2E'), go: clay('#B07A4A'), trang: clay('#F7F7F2'),
  teal: clay('#006687'), cam: clay('#E8762D'), do: clay('#C2412D'), nuoc: clay('#7FC7D6'), bang: clay('#D9F0F2'), xam: clay('#9AA6A6'),
  vang: clay('#FDA127'), non: clay('#E9C987'), da: clay('#F1C9A5'), ao: clay('#2E7D6B')
};
function hop(w, h, d, m, x, y, z) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; scene.add(o); return o; }
function tru(rt, rb, h, m, x, y, z, seg = 16) { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; scene.add(o); return o; }
const TRAI = new THREE.DodecahedronGeometry(0.34, 0);
function trai(x, y, z, s = 1) { const o = new THREE.Mesh(TRAI, M.trai); o.position.set(x, y, z); o.scale.setScalar(s); o.rotation.set(x, z, y); o.castShadow = true; scene.add(o); return o; }
function bien(chu, x, y, z, nen = '#006687', w = 3.2) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 96; const g = c.getContext('2d');
  g.fillStyle = nen; g.beginPath(); g.roundRect(4, 4, 248, 88, 26); g.fill();
  g.fillStyle = '#fff'; g.font = '800 46px "Plus Jakarta Sans", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(chu, 128, 50);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false })); s.scale.set(w, w * 96 / 256, 1); s.position.set(x, y, z); scene.add(s); return s;
}

// ---- Đất, con đường uốn nhẹ ----
const zDuong = x => 2.2 * Math.sin(x / 15);
const dai = CH[CH.length - 1].x + 30;
const nen = new THREE.Mesh(new THREE.PlaneGeometry(dai + 120, 160), M.dat); nen.rotation.x = -Math.PI / 2; nen.position.set(dai / 2 - 15, 0, 0); nen.receiveShadow = true; scene.add(nen);
const ptDuong = []; for (let x = -12; x <= dai; x += 2) ptDuong.push(new THREE.Vector3(x, 0.03, zDuong(x)));
const cung = new THREE.CatmullRomCurve3(ptDuong);
{ // mặt đường: dải phẳng theo cung
  const N = 260, pos = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const p = cung.getPointAt(i / N), t = cung.getTangentAt(i / N), n = new THREE.Vector3(-t.z, 0, t.x).multiplyScalar(2.6);
    pos.push(p.x + n.x, 0.04, p.z + n.z, p.x - n.x, 0.04, p.z - n.z);
    if (i) { const a = 2 * i; idx.push(a - 2, a - 1, a, a - 1, a + 1, a); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, clay('#5C6B6B', { side: THREE.DoubleSide })); m.receiveShadow = true; scene.add(m);
  for (let x = -10; x < dai; x += 3) hop(1.1, 0.02, 0.14, M.vach, x, 0.06, zDuong(x)).rotation.y = -Math.atan(2.2 / 15 * Math.cos(x / 15));
}
// thảm cỏ hai bên đường
for (let i = 0; i < 70; i++) { const x = -10 + (i * 37) % (dai + 10), z = (i % 2 ? 1 : -1) * (6 + (i * 13) % 10); tru(1.2 + (i % 3) * 0.4, 1.4 + (i % 3) * 0.4, 0.12, i % 2 ? M.co : M.co2, x, 0.06, z, 10); }

// ---- 1. Vườn có mã vùng trồng ----
const CAY = [];
for (let i = 0; i < 18; i++) { const x = -8 + (i % 6) * 3.2, z = -9 + Math.floor(i / 6) * 3.4; CAY.push([x, z]); }
for (let i = 0; i < 8; i++) CAY.push([-7 + (i % 4) * 3.4, 6 + Math.floor(i / 4) * 3.4]);
const capThan = (x, z) => { tru(0.22, 0.3, 2.2, M.go, x, 1.1, z, 8); const tan = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, 1), M.co2); tan.position.set(x, 2.9, z); tan.scale.y = 0.85; tan.castShadow = true; scene.add(tan); trai(x + 0.7, 2.2, z + 0.5, 0.8); trai(x - 0.6, 2.4, z - 0.4, 0.75); };
CAY.forEach(([x, z]) => capThan(x, z));
hop(0.15, 1.6, 0.15, M.go, 4, 0.8, 3.6); bien('PUC', 4, 2.1, 3.6, '#2E7D6B', 2.4);

// ---- 2. Cắt trái: thợ nón lá, sọt trái ----
function nguoi(x, z, ao = M.ao, quay = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = quay;
  const than = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.7, 4, 10), ao); than.position.y = 0.75; than.castShadow = true;
  const dau = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), M.da); dau.position.y = 1.55; dau.castShadow = true;
  const non = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.32, 18), M.non); non.position.y = 1.86; non.castShadow = true;
  g.add(than, dau, non); scene.add(g); return g;
}
for (let i = 0; i < 4; i++) { const x = 18 + i * 2.4, z = -4.6; tru(0.55, 0.42, 0.6, M.go, x, 0.3, z, 12); for (let k = 0; k < 4; k++) trai(x + (k % 2) * 0.3 - 0.15, 0.7 + Math.floor(k / 2) * 0.25, z + (k % 2 ? 0.15 : -0.15), 0.75); }
nguoi(21, -2.6, M.ao, 0.4); nguoi(24.5, -6.4, M.cam, -0.6); nguoi(19, 4.4, M.ao, 2.4);
for (let i = 0; i < 6; i++) { const x = 22 + (i % 3) * 3.2, z = 5 + Math.floor(i / 3) * 3.2; capThan(x, z); }

// ---- 3. Nhà đóng gói (Kenney City Kit Industrial) + băng chuyền ----
const nhaDG = new THREE.Group(); nhaDG.position.set(44, 0, -7.5); scene.add(nhaDG);
hop(9, 0.3, 6, M.vach, 44, 0.15, -7.5);
const bang = hop(10, 0.45, 1.1, M.xam, 44, 0.75, -2.6);
for (let i = -4; i <= 4; i += 2) hop(0.2, 0.6, 0.9, M.teal, 44 + i, 0.3, -2.6);
const traiBang = []; for (let i = 0; i < 8; i++) traiBang.push(trai(39 + i * 1.25, 1.2, -2.6, 0.85));
for (let i = 0; i < 6; i++) hop(1, 0.8, 0.8, M.go, 48.5 + (i % 3) * 1.1, 0.4 + Math.floor(i / 3) * 0.8, -0.6);
bien('PHC', 47.5, 6.2, -7.5, '#006687', 2.6); nguoi(42, -0.9, M.trang, 3.1); nguoi(46, -0.9, M.trang, 3.1);

// ---- 4. Kho lạnh ----
hop(8, 4.2, 6, M.trang, 66, 2.1, -8); hop(2.6, 3, 0.2, M.bang, 64.5, 1.5, -4.95); hop(2.6, 3, 0.2, M.bang, 67.5, 1.5, -4.95);
hop(8.4, 0.5, 6.4, M.teal, 66, 4.45, -8);
bien('−18 °C', 66, 6.4, -8, '#1E7E8C', 3);
const tuyet = []; { const g = new THREE.SphereGeometry(0.08, 6, 4); for (let i = 0; i < 40; i++) { const s = new THREE.Mesh(g, M.trang); s.position.set(62 + Math.random() * 8, 0.5 + Math.random() * 4, -4.4 + Math.random() * 2); scene.add(s); tuyet.push(s); } }

// ---- 5. Xe lạnh (chạy theo tiến độ cuộn từ kho lạnh tới cửa khẩu) ----
const xe = new THREE.Group(); scene.add(xe);
{ const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; xe.add(o); return o; };
  add(new THREE.BoxGeometry(5, 2.2, 2.1), M.trang, -0.6, 1.65, 0); add(new THREE.BoxGeometry(5.05, 0.35, 2.15), M.teal, -0.6, 1.1, 0);
  add(new THREE.BoxGeometry(1.7, 1.7, 2), M.cam, 2.6, 1.35, 0); add(new THREE.BoxGeometry(0.1, 0.7, 1.7), M.bang, 3.46, 1.65, 0);
  const banh = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 14); [[-2.4, 1], [-2.4, -1], [0.8, 1], [0.8, -1], [2.6, 1], [2.6, -1]].forEach(([x, z]) => { const b = add(banh, M.duong, x, 0.42, z); b.rotation.x = Math.PI / 2; });
}
// cao tốc: biển báo, cột đèn
for (let x = 74; x < 106; x += 8) { tru(0.08, 0.08, 3, M.xam, x, 1.5, zDuong(x) + 3.4, 6); hop(0.2, 0.2, 0.9, M.xam, x, 3, zDuong(x) + 3); }
hop(0.15, 2.4, 0.15, M.xam, 84, 1.2, zDuong(84) - 3.6); bien('Cao tốc', 84, 2.7, zDuong(84) - 3.6, '#2E7D6B', 2.6);

// ---- 6. Cửa khẩu và kiểm dịch ----
{ const zc = zDuong(110);
  hop(1.2, 5, 1.2, M.vach, 110, 2.5, zc - 3.6); hop(1.2, 5, 1.2, M.vach, 110, 2.5, zc + 3.6);
  hop(1.8, 0.8, 9.2, M.do, 110, 5.3, zc); hop(2.2, 0.35, 9.8, M.vang, 110, 5.85, zc);
  hop(0.2, 0.2, 3, M.do, 108.6, 1.1, zc + 1.2);
  hop(2.4, 2.4, 2.4, M.trang, 114, 1.2, zc - 6); hop(2.8, 0.3, 2.8, M.teal, 114, 2.55, zc - 6);
  bien('Kiểm dịch', 114, 3.6, zc - 6, '#C2412D', 2.8); nguoi(112, zc - 3.9, M.ao, 0); }
for (let i = 0; i < 3; i++) { const x = 103 - i * 6.2; const g = xe.clone(); g.position.set(x, 0, zDuong(x) - 1.3); g.rotation.y = -Math.atan(2.2 / 15 * Math.cos(x / 15)); g.scale.setScalar(0.8); scene.add(g); }

// ---- 7. Chợ: sạp mái màu, đống trái, container ----
const MAI = [M.do, M.vang, M.teal, M.cam];
for (let i = 0; i < 6; i++) {
  const x = 126 + (i % 3) * 4.6, z = (i < 3 ? -6.5 : 5.5);
  hop(3.6, 0.9, 2.2, M.go, x, 0.45, z); for (let k = 0; k < 6; k++) trai(x - 1.2 + (k % 3) * 1.2, 1.15 + Math.floor(k / 3) * 0.3, z + (k % 2 ? 0.3 : -0.3), 0.85);
  for (const dx of [-1.6, 1.6]) for (const dz of [-1, 1]) tru(0.07, 0.07, 2.6, M.xam, x + dx, 1.3, z + dz, 6);
  const mai = hop(4, 0.25, 2.8, MAI[i % 4], x, 2.7, z); mai.rotation.x = i < 3 ? 0.12 : -0.12;
}
for (let i = 0; i < 5; i++) nguoi(124 + i * 2.6, (i % 2 ? 1.6 : -2.2), i % 2 ? M.cam : M.teal, i);
const mui = []; for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), M.traiVang); m.position.set(130 + i * 0.7, 1.3, -6.5); scene.add(m); mui.push(m); }

// ---- Số chặng nổi trên từng khu ----
CH.forEach((c, i) => bien(String(i + 1), c.x, 7.6, zDuong(c.x), i === CH.length - 1 ? '#E8762D' : '#033337', 1.4));

// ---- Mô hình Kenney (CC0): nhà kho cho nhà đóng gói, container ở chợ. Không tải được thì vẫn còn khối dựng tay. ----
const L = new GLTFLoader();
// Nature Kit khai metallic 1 (gần như đen) và lá xanh ngọc: đặt metalness 0, nhuộm lá về xanh lá (như ra-khoi-3d.js).
const sua = o => o.traverse(m => { if (m.isMesh) { m.castShadow = m.receiveShadow = true; (Array.isArray(m.material) ? m.material : [m.material]).forEach(v => { v.metalness = 0;
  const hsl = {}; v.color.getHSL(hsl); if (!v.map && hsl.h > .38 && hsl.h < .56 && hsl.s > .2) v.color.set(hsl.l > .3 ? '#79b25c' : '#4f8a3e'); }); } });
L.load('../assets/models/tan-cang-warehouse.glb', g => { const o = g.scene; sua(o); o.scale.setScalar(4.2); o.position.set(0, 0.3, 0); nhaDG.add(o); ve(); }, undefined, () => { hop(8, 4, 5, M.vach, 44, 2.3, -7.5); hop(8.6, 0.4, 5.6, M.cam, 44, 4.5, -7.5); });
L.load('../assets/models/crate.glb', g => { sua(g.scene); [[136, 1.5], [139.5, 1.5], [137.7, 1.5]].forEach(([x, z], i) => { const o = g.scene.clone(); o.scale.setScalar(2.4); o.position.set(x, i === 2 ? 2.4 : 0, z + 10); scene.add(o); }); ve(); });
['tree_palm', 'tree_oak', 'plant_bushLarge'].forEach((t, k) => L.load('../assets/models/kenney-cay/' + t + '.glb', g => {
  sua(g.scene); for (let i = 0; i < 6; i++) { const o = g.scene.clone(); o.scale.setScalar(3.2); const x = 30 + i * 22 + k * 6; o.position.set(x, 0, (i + k) % 2 ? 11 : -12); o.rotation.y = i; scene.add(o); }
  ve();
}));

// ---- Máy quay theo tiến độ cuộn ----
const viTri = t => { // t: 0 → số chặng − 1 (thực)
  const i = Math.max(0, Math.min(CH.length - 1, t)), a = Math.floor(i), b = Math.min(CH.length - 1, a + 1), f = i - a, e = f * f * (3 - 2 * f);
  return CH[a].x + (CH[b].x - CH[a].x) * e;
};
const dich = new THREE.Vector3(), mat = new THREE.Vector3(), camPos = new THREE.Vector3();
let daCo = false, canVe = true;
function datKhung() {
  const w = host.clientWidth, h = host.clientHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); canVe = true;
}
function ve() { canVe = true; }
addEventListener('resize', datKhung); datKhung();

let t0 = performance.now();
function khung(now) {
  requestAnimationFrame(khung);
  if (document.hidden) return;
  const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
  const t = +window.__htTien || 0, x = viTri(t);
  const lech = nho() ? new THREE.Vector3(11, 19, 24) : new THREE.Vector3(15, 15, 21);
  dich.set(x + (nho() ? 0 : -4), 0.8, zDuong(x) + (nho() ? 3.5 : 0));
  const k = giam || !daCo ? 1 : 1 - Math.pow(0.0015, dt);
  const truoc = mat.clone();
  mat.lerp(dich, k); camPos.copy(mat).add(lech);
  daCo = true;
  // xe lạnh: đậu ở kho lạnh tới chặng 4, chạy theo cuộn tới cửa khẩu (chặng 6), rồi qua chợ
  const xx = Math.max(CH[3].x + 3, Math.min(CH[6].x - 6, viTri(Math.max(3, t)) + 2));
  xe.scale.setScalar(0.8); xe.position.set(xx, 0, zDuong(xx) + 1.3); xe.rotation.y = -Math.atan(2.2 / 15 * Math.cos(xx / 15));
  let dong = truoc.distanceToSquared(mat) > 1e-6;
  if (!giam) {
    traiBang.forEach(o => { o.position.x += dt * 1.4; if (o.position.x > 49) o.position.x = 39; o.rotation.y += dt; });
    tuyet.forEach(s => { s.position.y -= dt * 0.6; if (s.position.y < 0.2) s.position.y = 4.5; });
    mui.forEach((m, i) => { m.position.y = 1.3 + Math.abs(Math.sin(now / 600 + i)) * 0.25; });
    dong = true;
  }
  if (!dong && !canVe) return;
  canVe = false;
  cam.position.copy(camPos); cam.lookAt(mat);
  sun.position.set(mat.x + 18, 30, mat.z + 14); sun.target.position.copy(mat);
  R.render(scene, cam);
}
requestAnimationFrame(khung);
document.documentElement.classList.add('ht-3d-san-sang');
