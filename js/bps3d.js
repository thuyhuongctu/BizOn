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

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
renderer.setSize(W0(), H0());
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
host.prepend(renderer.domElement);
renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W0() / H0(), 0.1, 400);
camera.position.set(0, 40, 50);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, -3); controls.enableDamping = true; controls.maxPolarAngle = 1.25; controls.minDistance = 18; controls.maxDistance = 90; controls.enablePan = false;

const hemi = new THREE.HemisphereLight(0xfff4e0, 0x6a8f7a, 1.1); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(-20, 40, 18); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45 }); scene.add(sun);

const clay = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.92, metalness: 0 }, o));
const M = (geo, mat, x = 0, y = 0, z = 0, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
const box = (w, h, d, c, x, y, z, p) => M(new THREE.BoxGeometry(w, h, d), clay(c), x, y + h / 2, z, p);
const cyl = (r1, r2, h, c, x, y, z, p, s = 16) => M(new THREE.CylinderGeometry(r1, r2, h, s), clay(c), x, y + h / 2, z, p);
const ball = (r, c, x, y, z, p) => M(new THREE.SphereGeometry(r, 18, 14), clay(c), x, y, z, p);

// đất + sông
const ground = M(new THREE.CylinderGeometry(46, 48, 3, 64), clay(0x9cc98a), 0, -1.5, 0); ground.castShadow = false;
const river = new THREE.Shape(); river.moveTo(-50, -6);
river.bezierCurveTo(-25, -12, -12, 6, 4, 2); river.bezierCurveTo(18, -2, 30, 10, 50, 6);
river.lineTo(50, 14); river.bezierCurveTo(30, 18, 18, 6, 4, 10); river.bezierCurveTo(-14, 14, -24, -4, -50, 2); river.closePath();
const water = M(new THREE.ExtrudeGeometry(river, { depth: 0.2, bevelEnabled: false }), clay(0x3fa6b8, { roughness: 0.35 }), 0, 0.05, 0);
water.rotation.x = -Math.PI / 2; water.position.z = -4; water.castShadow = false;
water.scale.set(0.92, 0.92, 1);

// 6 địa điểm: [x, z]
const P = [[-26, -8], [-4, -2], [-20, 16], [12, 16], [30, -16], [24, 4]];
const spots = [];
function tree(x, z, p, s = 1) { cyl(0.25 * s, 0.35 * s, 1.4 * s, 0x8a5a3b, x, 0, z, p); ball(1.1 * s, 0x5fae63, x, 2 * s, z, p); }
function lantern(x, y, z, p) { const l = ball(0.32, 0xff7a3d, x, y, z, p); l.material = clay(0xff7a3d, { emissive: 0xff5a1f, emissiveIntensity: 0 }); l.userData.lantern = true; return l; }
function build(i, g) {
  if (i === 0) { for (let k = 0; k < 5; k++) { const b = new THREE.Group(); box(2.6, 0.5, 1, [0xd98b4a, 0xc9713a, 0xe0a04f][k % 3], 0, 0, 0, b); box(0.8, 0.6, 0.7, [0x6fbf73, 0xf2c14e, 0xe86a5a][k % 3], 0.3, 0.5, 0, b); b.position.set((k % 3) * 3 - 3, 0.1, Math.floor(k / 3) * 2 - 1); b.rotation.y = k * 0.7; b.userData.bob = k; g.add(b); } }
  if (i === 1) { box(6, 0.4, 2.2, 0xb58a5a, 0, 0.2, 0, g); for (let k = -2; k <= 2; k += 2) cyl(0.2, 0.2, 1, 0x7a5a3a, k, -0.6, 1, g); const f = new THREE.Group(); box(4, 0.8, 2, 0xf4efe4, 0, 0, 0, f); box(2, 0.9, 1.6, 0x006687, 0, 0.8, 0, f); f.position.set(0, 0.1, -3); f.userData.bob = 9; g.add(f); }
  if (i === 2) { box(4, 3.4, 3, 0xf1e3c8, -1.5, 0, 0, g); box(4.4, 0.6, 3.4, 0xc0443a, -1.5, 3.4, 0, g); box(3, 2.2, 2.4, 0xe9d7b4, 2.4, 0, 0.6, g); box(0.2, 3, 0.2, 0x555555, 2.4, 2.2, 0.6, g); box(1.2, 0.3, 1.2, 0x033337, 2.4, 5.2, 0.6, g); tree(-4.5, 2.5, g, 0.8); }
  if (i === 3) { tree(-2.5, -1, g); tree(0.5, 1.5, g, 1.2); tree(2.8, -1.2, g, 0.9); box(2, 0.3, 0.6, 0xb58a5a, 0, 0.4, -2.5, g); M(new THREE.CylinderGeometry(3.6, 3.6, 0.1, 32), clay(0x8fcf7a), 0, 0.05, 0, g).castShadow = false; }
  if (i === 4) { box(5, 2.6, 3.4, 0xb9c3c6, 0, 0, 0, g); for (let k = 0; k < 3; k++) box(1.6, 1, 3.4, 0x93a3a8, -1.7 + k * 1.7, 2.6, 0, g); cyl(0.45, 0.55, 5, 0xc0443a, 2.2, 0, -1.3, g); const sm = ball(0.7, 0xdddddd, 2.2, 5.8, -1.3, g); sm.userData.smoke = true; }
  if (i === 5) { for (let k = 0; k < 4; k++) { const x = -3 + k * 2; box(1.6, 1.1, 1.3, 0xf4efe4, x, 0, 0, g); box(1.9, 0.25, 1.6, [0xe8762d, 0x006687, 0xc0446a, 0x3f8a44][k], x, 1.1, 0, g); } for (let k = 0; k < 7; k++) lantern(-3.8 + k * 1.3, 2.6 + Math.sin(k) * 0.2, 1, g); cyl(0.08, 0.08, 2.6, 0x555555, -4.2, 0, 1, g); cyl(0.08, 0.08, 2.6, 0x555555, 4.2, 0, 1, g); }
}
P.forEach((p, i) => {
  const g = new THREE.Group(); g.position.set(p[0], 0, p[1]); scene.add(g); build(i, g);
  const pad = M(new THREE.CylinderGeometry(5.4, 5.4, 0.12, 40), new THREE.MeshStandardMaterial({ color: 0xfda127, transparent: true, opacity: 0, roughness: 1 }), 0, 0.06, 0, g); pad.castShadow = false; pad.userData.loc = i;
  const hit = M(new THREE.CylinderGeometry(5.5, 5.5, 6, 20), new THREE.MeshBasicMaterial({ visible: false }), 0, 3, 0, g); hit.userData.loc = i;
  const crowd = new THREE.Group(); g.add(crowd);
  const cloud = new THREE.Group(); [[0, 0], [1.3, 0.3], [-1.2, 0.2], [0.4, 0.7]].forEach(c => ball(1.1, 0x8795a1, c[0], 8 + c[1], 0, cloud)); cloud.visible = false; g.add(cloud);
  const drops = []; for (let k = 0; k < 24; k++) { const d = M(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 4), clay(0x9fd3ff), (Math.random() - 0.5) * 5, Math.random() * 8, (Math.random() - 0.5) * 3, cloud); d.castShadow = false; drops.push(d); }
  const lab = document.createElement('button'); lab.type = 'button'; lab.className = 'bps3d-lab'; labels.appendChild(lab);
  lab.onclick = () => pick(i);
  spots.push({ g, pad, hit, crowd, cloud, drops, lab });
});
// cây rải rác + nhà sàn
[[-38, 20], [-34, 26], [38, 20], [36, -28], [-10, 30], [4, 30], [-40, -20], [0, -30], [16, -26], [42, -4]].forEach(p => tree(p[0], p[1], scene, 1 + Math.random() * 0.4));
// người + thuyền
const person = (c, p) => { const g = new THREE.Group(); cyl(0.35, 0.45, 1.1, c, 0, 0, 0, g); ball(0.38, 0xf1c9a5, 0, 1.45, 0, g); p.add(g); return g; };
function vessel(kind, color) {
  const g = new THREE.Group();
  if (kind === 0) { box(3.2, 0.6, 1.2, color, 0, 0, 0, g); cyl(0.07, 0.07, 3, 0x7a5a3a, 0, 0.6, 0, g); const s = M(new THREE.ConeGeometry(1, 2.2, 3), clay(0xf4efe4), 0.4, 2.4, 0, g); s.rotation.z = -0.1; }
  else if (kind === 1) { person(color, g); box(2.4, 0.08, 0.08, 0x8a5a3b, 0, 1.3, 0, g); [-1.1, 1.1].forEach(x => M(new THREE.CylinderGeometry(0.45, 0.35, 0.5, 12), clay(0xd9a85a), x, 0.8, 0, g)); }
  else { person(color, g); box(0.6, 0.8, 0.1, 0xf4efe4, 0.5, 0.9, 0.3, g); }
  scene.add(g); return g;
}
const RC = [0x7a7f8a, 0x9a8a78, 0x3f8a44];
const rivals = RC.map((c, k) => { const v = vessel(1, c); v.position.set(-40 + k * 3, 0, 34); v.visible = false; v.userData.home = v.position.clone(); return v; });
let me = null, meKind = -1;
const HOME = new THREE.Vector3(-4, 0.1, 6);

// ---- trạng thái ----
let stormAt = -1, sel = null, week = 0, night = 0, nightT = 0, anim = [];
const TOD = [[0xfff1d6, 1.6, 0xbfe6f5], [0xffffff, 1.7, 0xa9dcef], [0xffe2b8, 1.3, 0xf6c79b], [0xff9f6b, 0.8, 0xe79a8a], [0x8aa0ff, 0.35, 0x1d2a4a]];
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
let camGoal = null;
function highlight(i) { sel = i; spots.forEach((s, k) => { s.pad.material.opacity = k === i ? 0.55 : 0; }); labelsText(); coach(); camGoal = i == null ? new THREE.Vector3(0, 0, -3) : new THREE.Vector3(P[i][0] * 0.35, 0, P[i][1] * 0.35 - 2); }
function showRivals(prevWeek) {
  const g = G(); if (!g) return;
  rivals.forEach((v, k) => { const r = g.RIVALS[k]; if (!r.plan || prevWeek < 0) { v.visible = false; return; } const loc = r.plan[prevWeek]; const p = P[loc]; v.visible = true; tween(v, new THREE.Vector3(p[0] + 3 * Math.cos(k * 2.1 + 1), 0.1, p[1] + 3 * Math.sin(k * 2.1 + 1)), 1400); });
}
function tween(obj, to, ms, done) { anim.push({ obj, from: obj.position.clone(), to, t0: performance.now(), ms, done }); }
function sendMe(m, loc, done) {
  if (me && meKind !== m) { scene.remove(me); me = null; }
  if (!me) { me = vessel(m, 0xfda127); me.scale.setScalar(1.25); me.position.copy(HOME); meKind = m; }
  const p = P[loc], to = m === 2 ? new THREE.Vector3(p[0] - 2, 0.1, p[1] + 4.5) : new THREE.Vector3(p[0] - 1.5, 0.1, p[1] + 4.2);
  me.lookAt(to.x, me.position.y, to.z); tween(me, to, 1600, done);
}

// ---- Chế độ khám phá: Chợ nổi Cái Răng (Cần Thơ) – tham quan văn hoá, tách biệt hoàn toàn
// khỏi luật chơi kinh doanh. Nguồn: Cục Du lịch Quốc gia VN, Bộ VHTTDL, báo Tuổi Trẻ (xem PR). ----
let exploreMode = false;
const EXPLORE = [
  { p: [-42, -9], t: ['Chợ nổi Cái Răng là gì?', 'What is Cái Răng floating market?'], d: ['Chợ nổi Cái Răng nằm trên sông ở quận Cái Răng, TP. Cần Thơ – nơi thương hồ tụ họp mua bán nông sản trên ghe thuyền đã hàng trăm năm nay, khi kênh rạch từng là tuyến giao thương chính của miền Tây.', "Cái Răng floating market sits on a river in Cái Răng district, Cần Thơ – where river traders have gathered to buy and sell produce from their boats for centuries, back when canals were the Mekong Delta's main trade routes."] },
  { p: [-28, -5], t: ['Di sản văn hoá quốc gia', 'National cultural heritage'], d: ['Năm 2016, Bộ Văn hoá, Thể thao và Du lịch công nhận «Văn hoá chợ nổi Cái Răng» là di sản văn hoá phi vật thể cấp quốc gia – ghi nhận giá trị một nếp sống sông nước độc đáo của miền Tây.', 'In 2016, Vietnam’s Ministry of Culture, Sports and Tourism recognized «Cái Răng floating market culture» as a national intangible cultural heritage, honoring this distinctive Mekong Delta river way of life.'] },
  { p: [-14, -1], t: ['Cây bẹo là gì?', 'What is a "cây bẹo"?'], d: ['«Cây bẹo» là sào tre cắm trên ghe để treo mẫu hàng lên cao. Trên sông, tiếng rao khó vang xa, nên thương hồ «bẹo hàng» bằng hình ảnh: treo gì bán nấy – nhìn cây bẹo là biết ghe bán thứ gì.', "A «cây bẹo» is a bamboo pole mounted on a boat to hoist a sample of its goods. Shouting doesn't carry far on the water, so vendors advertise visually instead – whatever hangs from the pole is what's for sale."] },
  { p: [0, 3], t: ['Giờ vàng ghé chợ', 'The best time to visit'], d: ['Chợ đông và sôi động nhất vào sáng sớm, thường trước 8–9 giờ – càng về trưa ghe càng thưa dần. Đi chợ nổi sớm để còn thấy sương giăng trên sông và không khí mua bán tấp nập nhất.', 'The market is busiest early in the morning, usually before 8–9am – boats thin out as the day goes on. Visit early to catch the river mist and the liveliest trading.'] },
  { p: [14, 1], t: ['Hàng hoá trên chợ', 'What is sold here'], d: ['Mặt hàng chính là trái cây và rau củ đặc sản miền Tây, chở số lượng lớn để bán sỉ. Len lỏi giữa những ghe lớn là các xuồng nhỏ bán đồ ăn thức uống nổi trên sông – cà phê, hủ tiếu, bún riêu phục vụ ngay tại chỗ.', 'The main goods are Mekong Delta fruit and vegetables, carried in bulk for wholesale. Smaller boats weave between them selling food and drink on the spot – coffee, noodle soup, served right on the water.'] },
  { p: [27, 5], t: ['Ghe lớn, xuồng nhỏ', 'Big boats, small boats'], d: ['Ghe lớn (ghe bầu, ghe chài) thường neo cố định để bán sỉ – nhiều chiếc còn là nơi thương hồ sinh sống luôn trên sông. Xuồng nhỏ len lỏi giữa các ghe lớn để bán lẻ hoặc phục vụ đồ ăn.', 'Large boats often anchor in place for wholesale trading – many double as floating homes for the traders. Smaller boats weave between them for retail sales or food service.'] },
  { p: [38, 8], t: ['Chợ nổi đang đổi thay', 'A changing market'], d: ['Những năm gần đây, chợ nổi thu hẹp dần khi đường bộ và cầu phát triển làm giảm nhu cầu vận chuyển đường sông – nhiều thương hồ đã lên bờ. Địa phương đang tìm cách gìn giữ nét văn hoá này.', 'In recent years, the floating market has been shrinking as new roads and bridges reduce the need for river transport – many traders have moved ashore. Local efforts are underway to help preserve this culture.'] },
  { p: [46, 10], t: ['Cái Răng lúc bình minh', 'Cái Răng at dawn'], d: ['Hàng trăm ghe xuồng san sát, tiếng máy nổ lạch tạch xen tiếng mời mua bán, những cây bẹo treo đủ màu trái cây tạo thành mảng màu rực rỡ trên mặt nước – đó là Cái Răng lúc bình minh.', "Hundreds of boats packed together, the putter of engines mixed with vendors' calls, poles hung with colorful fruit painting the water with color – that's Cái Răng at dawn."] },
];
const explorePins = EXPLORE.map((e, i) => {
  const g = new THREE.Group(); g.position.set(e.p[0], 0, e.p[1]); scene.add(g); g.visible = false;
  box(1.6, 0.35, 0.7, 0xd9a85a, 0, 0, 0, g);
  cyl(0.1, 0.1, 3, 0x8a5a3b, 0.3, 0.35, 0, g);
  ball(0.36, [0xc0443a, 0xf2c14e, 0x6fbf73, 0xe8762d][i % 4], 0.3, 3.1, 0, g);
  const hit = M(new THREE.CylinderGeometry(1.6, 1.6, 4, 12), new THREE.MeshBasicMaterial({ visible: false }), 0, 2, 0, g); hit.userData.explore = i;
  const lab = document.createElement('button'); lab.type = 'button'; lab.className = 'bps3d-lab'; lab.style.display = 'none'; lab.innerHTML = '<b>🪧 ' + T(e.t[0], e.t[1]) + '</b>'; labels.appendChild(lab);
  lab.onclick = () => showExplore(i);
  return { g, hit, lab };
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
    document.getElementById('bps3d-info-d').textContent = T('Bạn đã ghé thăm cả 8 điểm văn hoá của Chợ nổi Cái Răng. Rất tốt!', 'You visited all 8 cultural spots of Cái Răng floating market. Well done!');
    box.style.display = 'grid';
  }, 700);
}
window.addEventListener('bps-mode', e => {
  exploreMode = e.detail.mode === 'explore';
  explorePins.forEach(p => { p.g.visible = exploreMode; p.lab.style.display = exploreMode ? '' : 'none'; });
  controls.maxPolarAngle = exploreMode ? 1.5 : 1.25;
  controls.minDistance = exploreMode ? 8 : 18;
  controls.maxDistance = exploreMode ? 130 : 90;
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
  sendMe(d.m, d.loc, () => { showRivals(d.week);
    if (d.m === 2) pop(d.loc, '📋 ' + T('Đã ghi chép', 'Notes taken'));
    else pop(d.loc, '+' + (Math.round(d.rev * 10) / 10).toLocaleString(EN() ? 'en-US' : 'vi-VN') + ' ' + T('tr', 'm') + (d.clash ? '<small>⚡ ' + d.clash + ' ' + T('đối thủ', 'rival(s)') + '</small>' : ''), d.clash > 0 || wasStorm);
    if (wasStorm) { const b = document.getElementById('bps3d-storm'); if (b) { document.getElementById('bps3d-storm-t').textContent = '🌧️ ' + T('Mưa bão ở ' + g.LOCS[d.loc][1], 'Storm at ' + g.LOCS[d.loc][3]); document.getElementById('bps3d-storm-d').textContent = T('Khu này ít khách nhất tuần. Lần sau hãy nhìn đám đông trên bản đồ trước khi chọn.', 'This was the quietest spot this week. Next time, check the crowds on the map before choosing.'); b.style.display = 'grid'; } }
  }); });
window.addEventListener('bps-lang', labelsText);
new ResizeObserver(() => { renderer.setSize(W0(), H0()); camera.aspect = W0() / H0(); camera.updateProjectionMatrix(); }).observe(host);

// ---- vòng vẽ ----
const v3 = new THREE.Vector3(); const clock = new THREE.Clock();
function frame() {
  const t = clock.getElapsedTime(), now = performance.now();
  night += (nightT - night) * 0.05;
  scene.traverse(o => {
    if (o.userData.bob !== undefined) { o.position.y = 0.1 + Math.sin(t * 1.6 + o.userData.bob) * 0.12; o.rotation.z = Math.sin(t + o.userData.bob) * 0.04; }
    if (o.userData.lantern) o.material.emissiveIntensity = night * 1.6 + 0.05;
    if (o.userData.smoke) { o.position.y = 5.8 + (t % 3) * 0.8; o.material.opacity = 1; }
    if (o.userData.jig !== undefined) o.position.y = 0.1 + Math.abs(Math.sin(t * 3 + o.userData.jig)) * 0.15;
  });
  spots.forEach(s => { if (s.cloud.visible) s.drops.forEach(d => { d.position.y -= 0.25; if (d.position.y < 0) d.position.y = 8; }); s.pad.rotation.y = t * 0.3; });
  anim = anim.filter(a => { const k = Math.min(1, (now - a.t0) / a.ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; a.obj.position.lerpVectors(a.from, a.to, e); a.obj.position.y = a.to.y + Math.sin(k * Math.PI) * 1.2; if (k >= 1) { if (a.done) a.done(); return false; } return true; });
  if (camGoal) { controls.target.lerp(camGoal, 0.04); if (controls.target.distanceTo(camGoal) < 0.05) camGoal = null; }
  controls.update(); renderer.render(scene, camera);
  for (let k = pops.length - 1; k >= 0; k--) { const p = pops[k], a = (now - p.t0) / 1000, sp = P[p.loc]; v3.set(sp[0], 9 + a * 1.2, sp[1]).project(camera);
    p.el.style.transform = 'translate(-50%,-100%) translate(' + ((v3.x + 1) / 2 * W0()).toFixed(1) + 'px,' + ((1 - v3.y) / 2 * H0()).toFixed(1) + 'px)'; if (a > 2.6) p.el.style.opacity = 0; if (a > 3.3) { p.el.remove(); pops.splice(k, 1); } }
  const W = W0(), H = H0();
  spots.forEach(s => { if (exploreMode) { s.lab.style.display = 'none'; return; } v3.set(s.g.position.x, 7.2, s.g.position.z).project(camera); const vis = v3.z < 1; s.lab.style.display = vis ? '' : 'none'; s.lab.style.transform = 'translate(-50%,-100%) translate(' + Math.max(70, Math.min(W - 70, (v3.x + 1) / 2 * W)).toFixed(1) + 'px,' + Math.max(92, (1 - v3.y) / 2 * H).toFixed(1) + 'px)'; });
  if (exploreMode) explorePins.forEach(p => { v3.set(p.g.position.x, 3.4, p.g.position.z).project(camera); const vis = v3.z < 1; p.lab.style.display = vis ? '' : 'none'; p.lab.style.transform = 'translate(-50%,-100%) translate(' + Math.max(70, Math.min(W - 70, (v3.x + 1) / 2 * W)).toFixed(1) + 'px,' + Math.max(92, (1 - v3.y) / 2 * H).toFixed(1) + 'px)'; });
  requestAnimationFrame(frame);
}
const wait = () => { if (G()) { setWeek(G().S.week || 0); frame(); } else setTimeout(wait, 60); };
wait();
