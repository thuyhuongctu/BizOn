/* BizOn – Màn hình lớp học: ba cảnh 3D (Three.js) cho máy chiếu.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *   bps  Sa bàn đất sét đồng bằng: ghe mỗi nhóm trên tuyến Cần Thơ → Cái Mép, đi xa hơn khi doanh thu cao hơn.
 *   hcth Quần đảo 7 thị trường quanh đảo nhà Mekong: tuyến dày hơn khi nhiều doanh nghiệp vào thị trường đó.
 *   hcsr Dòng phù sa 8 chặng (ảnh chặng thật của game): hạt đất sét mỗi nhóm đứng ở chặng ứng với điểm tổng.
 * Chế độ đêm: nền tối, đèn ấm, đom đóm. Tự viết, chỉ dùng three.js (MIT) trong vendor/three. */
import * as THREE from '../vendor/three/three.module.js';
// 06/11/2026: nhãn song ngữ, theo lựa chọn ngôn ngữ của site (bizon-lang / bizon-clay-i18n)
const EN = (() => { try { const q = new URLSearchParams(location.search).get('lang'); if (q === 'en') return true; if (q === 'vi') return false; return localStorage.getItem('bizon-lang') === 'en' && localStorage.getItem('bizon-lang-auto') !== '1'; } catch (e) { return false; } })();

export const TEAM_COLORS = ['#FDA127', '#E86A8C', '#2F8A8C', '#F4D35E', '#8FB339', '#5B8DEF', '#C0703A', '#7FC8A9', '#B48EAD', '#E8762D'];
const ROOT = new URL('..', import.meta.url).href;

// ---------- dùng chung ----------
function fireflies(scene, pick, n) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');
  const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  rg.addColorStop(0, 'rgba(255,240,170,1)'); rg.addColorStop(0.3, 'rgba(255,214,110,.6)'); rg.addColorStop(1, 'rgba(255,200,80,0)');
  g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
  const pos = new Float32Array(n * 3), seed = [];
  for (let i = 0; i < n; i++) { const p = pick(i); pos.set([p.x, p.y, p.z], i * 3); seed.push([p, (i * 2.399) % 10]); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(cv), size: 0.45, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(pts);
  return t => {
    for (let i = 0; i < n; i++) { const [b, s] = seed[i]; pos[i * 3] = b.x + Math.sin(t * 0.5 + s) * 0.14; pos[i * 3 + 1] = b.y + Math.sin(t * 0.8 + s * 2) * 0.09; pos[i * 3 + 2] = b.z + Math.cos(t * 0.4 + s) * 0.14; }
    geo.attributes.position.needsUpdate = true; pts.material.opacity = 0.75 + Math.sin(t * 3) * 0.15;
  };
}
function lotus(scale = 1) {
  const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: '#F4A7B9', roughness: 0.7 });
  for (let i = 0; i < 9; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), m); p.scale.set(0.45, 1, 0.9); const a = i / 9 * Math.PI * 2;
    p.position.set(Math.cos(a) * 0.16, 0.13, Math.sin(a) * 0.16); p.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6); p.castShadow = true; g.add(p); }
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.1, 12), new THREE.MeshStandardMaterial({ color: '#F4D35E' })); core.position.y = 0.17; g.add(core);
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 24), new THREE.MeshStandardMaterial({ color: '#6FA35A' })); g.add(pad);
  g.scale.setScalar(scale); return g;
}
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
function lights(scene, night) {
  scene.add(new THREE.HemisphereLight(night ? '#3a5a52' : '#fff4e0', night ? '#120c06' : '#b98a5a', night ? 1.1 : 1.15));
  const sun = new THREE.DirectionalLight(night ? '#ffd9a0' : '#ffe2b8', night ? 0.9 : 2.3);
  sun.position.set(-12, 24, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26 }); scene.add(sun);
}

// ---------- bps: sa bàn đồng bằng ----------
const C0 = { lon: 105.9, lat: 10.15 }, K = 10;
const P = (lon, lat) => new THREE.Vector2((lon - C0.lon) * K * Math.cos(C0.lat * Math.PI / 180), -(lat - C0.lat) * K);
const curve = (pts, y) => new THREE.CatmullRomCurve3(pts.map(([x, z]) => { const v = P(x, z); return new THREE.Vector3(v.x, y, v.y); }));
const RIVERS = [
  [[105.10, 10.72], [105.25, 10.55], [105.43, 10.38], [105.62, 10.18], [105.78, 10.03], [106.0, 9.82], [106.2, 9.66], [106.42, 9.52]],
  [[105.24, 10.80], [105.45, 10.62], [105.63, 10.46], [105.95, 10.34], [106.18, 10.33], [106.36, 10.36], [106.6, 10.27], [106.8, 10.2]],
];
const ROUTE = [[105.78, 10.03], [105.97, 10.25], [106.36, 10.36], [106.70, 10.78], [107.03, 10.53]];
const PLACES = [['Cần Thơ', 105.78, 10.03, 'home'], ['Vĩnh Long', 105.97, 10.25], ['Mỹ Tho', 106.36, 10.36], ['TP. Hồ Chí Minh', 106.70, 10.78], ['Cảng Cái Mép', 107.03, 10.53]];

async function buildBps(ctx, data, night) {
  const { scene, camera } = ctx;
  scene.background = new THREE.Color(night ? '#14231F' : '#FBF4E8'); scene.fog = new THREE.Fog(night ? '#14231F' : '#FBF4E8', 30, 80);
  camera.position.set(3.2, 20, 12); camera.lookAt(3.2, 0, -2.4); lights(scene, night);
  const sea = new THREE.Mesh(new THREE.CylinderGeometry(34, 34, 0.6, 96), mat(night ? '#1F4A45' : '#9FD3D6'));
  sea.position.y = -0.5; sea.receiveShadow = true; scene.add(sea);
  const g = await (await fetch(ROOT + 'assets/geo/vnm.json')).json();
  const shapes = g.coordinates.map(poly => { const s = new THREE.Shape(poly[0].map(([x, y]) => P(x, y))); poly.slice(1).forEach(h => s.holes.push(new THREE.Path(h.map(([x, y]) => P(x, y))))); return s; });
  const land = new THREE.Mesh(new THREE.ExtrudeGeometry(shapes, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 3, curveSegments: 4 }), mat(night ? '#4F5E3A' : '#CFE3A4', { roughness: 0.95 }));
  land.rotation.x = Math.PI / 2; land.position.y = 0.3; land.castShadow = land.receiveShadow = true; scene.add(land);
  RIVERS.forEach(r => { const t = new THREE.Mesh(new THREE.TubeGeometry(curve(r, 0.3), 120, 0.14, 8), mat(night ? '#2E6E6A' : '#7FBFC4', { roughness: 0.6 })); scene.add(t); });
  const route = curve(ROUTE, 0.62);
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 8), mat('#8a5a2b'), 90);
  for (let i = 0; i < 90; i++) { const p = route.getPointAt(i / 89); dots.setMatrixAt(i, new THREE.Matrix4().makeTranslation(p.x, p.y, p.z)); } scene.add(dots);
  const teams = data.teams.slice(0, 10);
  const boats = teams.map((t, i) => {
    const b = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.42, 6, 12), mat(TEAM_COLORS[i], { roughness: 0.7 }));
    hull.rotation.z = Math.PI / 2; hull.scale.set(1, 1, 0.75); hull.castShadow = true; b.add(hull);
    const roof = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#F6E7CB')); roof.position.y = 0.12; b.add(roof);
    if (night) { const l = new THREE.PointLight('#FFC870', 0.8, 2.2); l.position.y = 0.4; b.add(l); }
    b.scale.setScalar(1.4); scene.add(b); return b;
  });
  if (teams.length) { const L = lotus(1.5); const p = route.getPointAt(Math.min(0.995, teams[0].progress)); L.position.set(p.x + 0.5, 0.66, p.z - 0.6); scene.add(L); ctx.spin.push(L); }
  ctx.labels(PLACES.map(([vi, lon, lat, k]) => { const v = P(lon, lat); return { text: vi, cls: k || '', at: new THREE.Vector3(v.x, 0.9, v.y) }; }));
  const ff = night ? fireflies(scene, () => { const v = P(105.0 + Math.random() * 2.2, 9.6 + Math.random() * 1.3); return new THREE.Vector3(v.x, 0.9 + Math.random() * 0.9, v.y); }, 260) : null;
  ctx.tick = t => {
    boats.forEach((b, i) => { const u = Math.min(teams[i].progress * 0.97 + Math.sin(t * 0.6 + i) * 0.003, 0.995); const p = route.getPointAt(u), q = route.getTangentAt(u);
      b.position.set(p.x + (i % 2 ? 0.3 : -0.3), 0.8 + Math.sin(t * 2 + i) * 0.02, p.z + ((i % 3) - 1) * 0.3); b.rotation.y = Math.atan2(-q.z, q.x); });
    if (ff) ff(t);
  };
}

// ---------- hcth: quần đảo 7 thị trường ----------
function island(kind) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.35, 0.5, 32), mat(kind === 'ks' ? '#E9C98A' : '#C9A46A'));
  base.position.y = 0.05; base.castShadow = base.receiveShadow = true; g.add(base);
  const add = (m, x, y, z) => { m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  if (kind === 'home') { add(new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.12, 32), mat('#8FBF6A')), 0, 0.36, 0);
    [[-0.4, 0.2], [0.35, -0.25], [0.1, 0.45]].forEach(([x, z]) => { add(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.3), mat('#E8D2A8')), x, 0.55, z); add(new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.2, 4), mat('#B5542F')), x, 0.78, z).rotation.y = Math.PI / 4; }); }
  if (kind === 'hl') [[-0.4, 0.6, -0.2, '#5B8DEF'], [0.1, 0.9, 0.1, '#E86A8C'], [0.45, 0.5, -0.3, '#7FC8A9'], [-0.1, 0.7, 0.45, '#B48EAD']].forEach(([x, h, z, c]) =>
    add(new THREE.Mesh(new THREE.BoxGeometry(0.3, h, 0.3), mat('#2B2F45', { emissive: c, emissiveIntensity: 0.55 })), x, 0.3 + h / 2, z));
  if (kind === 'bp') { add(new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.4, 6), mat('#8FA3A6')), 0, 1.0, 0); add(new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.6, 6), mat('#FFFFFF')), 0, 1.45, 0); }
  if (kind === 'ks') [[-0.3, 0.1, 0.55], [0.35, -0.2, 0.45]].forEach(([x, z, r]) => add(new THREE.Mesh(new THREE.SphereGeometry(r, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat('#E9C98A')), x, 0.3, z));
  if (kind === 'ld') [0.95, 0.72, 0.5, 0.28].forEach((r, i) => add(new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.08, 0.2, 24), mat(i % 2 ? '#6FA35A' : '#5C8F48')), 0, 0.4 + i * 0.2, 0));
  if (kind === 'nq') [[-0.35, 0.1], [0.3, -0.3], [0.2, 0.4]].forEach(([x, z]) => { add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.4, 8), mat('#6B4A33')), x, 0.5, z); add(new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), mat('#F4B6C8')), x, 0.85, z); });
  if (kind === 'tc') { [['#C0703A', -0.3, 0.1], ['#2F8A8C', 0.05, -0.25], ['#F4D35E', 0.35, 0.2], ['#E86A8C', -0.05, 0.35]].forEach(([c, x, z]) => add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.2), mat(c)), x, 0.4, z));
    add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.08), mat('#E8A23A')), 0.6, 0.85, -0.4); add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.07, 0.07), mat('#E8A23A')), 0.3, 1.38, -0.4); }
  if (kind === 'hs') { add(new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.3, 20, 1, true), mat('#5A4036', { side: THREE.DoubleSide })), 0, 0.95, 0);
    add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 10), mat('#FF7A2E', { emissive: '#FF5A1E', emissiveIntensity: 1.2 })), 0, 1.55, 0); }
  return g;
}
const BP_KINDS = ['hl', 'bp', 'ks', 'ld', 'nq', 'tc', 'hs'];

function buildHcth(ctx, data, night) {
  const { scene, camera } = ctx;
  scene.background = new THREE.Color(night ? '#14231F' : '#EAF4F1'); scene.fog = new THREE.Fog(night ? '#14231F' : '#EAF4F1', 30, 70);
  camera.position.set(0, 27, 21); camera.lookAt(0, 0, -1.2); lights(scene, night);
  const sea = new THREE.Mesh(new THREE.CircleGeometry(40, 96), mat(night ? '#173A36' : '#8CCBCB', { roughness: 0.5 }));
  sea.rotation.x = -Math.PI / 2; sea.position.y = -0.2; sea.receiveShadow = true; scene.add(sea);
  const home = island('home'); home.scale.setScalar(1.35); scene.add(home);
  const markets = data.markets || BP_KINDS.map(() => ({ count: 0 }));
  const max = Math.max(1, ...markets.map(m => m.count));
  const arcs = [], labels = [{ text: EN ? 'Mekong home island' : 'Đảo nhà Mekong', cls: 'home', at: new THREE.Vector3(0, 2.2, 0) }];
  BP_KINDS.forEach((k, i) => {
    const a = -Math.PI / 2 + i / 7 * Math.PI * 2, R = 7.2, x = Math.cos(a) * R * 1.25, z = Math.sin(a) * R * 0.82;
    const isl = island(k); isl.position.set(x, 0, z); scene.add(isl);
    const n = markets[i] ? markets[i].count : 0;
    labels.push({ text: (markets[i] ? (EN && markets[i].en ? markets[i].en : markets[i].vi || '') : '') + ' · ' + n, cls: n ? '' : 'dim', at: new THREE.Vector3(x, 2.1, z) });
    if (!n) return;
    const s = new THREE.Vector3(0, 0.9, 0), e = new THREE.Vector3(x, 0.8, z), m = s.clone().lerp(e, 0.5); m.y = 2.4 + s.distanceTo(e) * 0.12;
    const c = new THREE.QuadraticBezierCurve3(s, m, e);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(c, 60, 0.03 + 0.11 * n / max, 8), new THREE.MeshBasicMaterial({ color: '#FDA127', transparent: true, opacity: night ? 0.9 : 0.8 })));
    arcs.push(c);
  });
  ctx.labels(labels);
  const lanterns = arcs.map(() => { const l = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), new THREE.MeshBasicMaterial({ color: night ? '#FFF6D8' : '#FFFFFF' })); scene.add(l); return l; });
  const ff = night ? fireflies(scene, i => { if (i < 160) { const a = Math.random() * Math.PI * 2, r = 1 + Math.random() * 2.5; return new THREE.Vector3(Math.cos(a) * r, 1 + Math.random(), Math.sin(a) * r); }
    const c = arcs.length ? arcs[i % arcs.length].getPointAt(Math.random()) : new THREE.Vector3(); return c.add(new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.6)); }, 360) : null;
  ctx.tick = t => { lanterns.forEach((l, i) => l.position.copy(arcs[i].getPointAt((t * 0.09 + i * 0.17) % 1))); if (ff) ff(t); };
}

// ---------- hcsr: dòng phù sa 8 chặng ----------
export const DURIAN_STAGES = [
  ['chang-1-vuon-puc', 'Vườn có mã PUC', 'Orchard with PUC code'], ['chang-2-thu-hoach-brix', 'Thu hoạch đo Brix', 'Harvest, Brix check'], ['chang-3-rua-phan-loai-phc', 'Rửa, phân loại', 'Wash and grade'], ['chang-4-cap-dong-iqf', 'Cấp đông IQF', 'IQF freezing'],
  ['chang-5-qr-kiem-dich', 'QR và kiểm dịch', 'QR and quarantine'], ['chang-6-xe-lanh-cao-toc', 'Xe lạnh cao tốc', 'Reefer truck, expressway'], ['chang-7-cang-hai-quan', 'Cảng, hải quan', 'Port and customs'], ['chang-8-ban-le-nem-thu', 'Bán lẻ, nếm thử', 'Retail tasting'],
];
function buildHcsr(ctx, data, night) {
  const { scene, camera } = ctx;
  scene.background = new THREE.Color(night ? '#14231F' : '#F6EBD6');
  camera.position.set(0.5, 30, 31); camera.lookAt(0.5, 0, 0.9); lights(scene, night);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 50), mat(night ? '#2A3B32' : '#E9D6B0', { roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const path = new THREE.CatmullRomCurve3([-13, -9.6, -6.2, -2.8, 0.6, 4, 7.4, 10.8, 13.4].map((x, i) => new THREE.Vector3(x, 0.02, Math.sin(i * 1.15) * 1.6 + 1.2)));
  const N = 240, W = 1.5, pos = [], uv = [], idx = [];
  for (let i = 0; i <= N; i++) { const u = i / N, p = path.getPointAt(u), t = path.getTangentAt(u), n = new THREE.Vector3(-t.z, 0, t.x).normalize();
    for (const s of [-1, 1]) { const q = p.clone().addScaledVector(n, s * W); pos.push(q.x, 0.03, q.z); uv.push(u, (s + 1) / 2); }
    if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); rg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); rg.setIndex(idx);
  const water = new THREE.ShaderMaterial({ uniforms: { t: { value: 0 }, night: { value: night ? 1 : 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec2 vUv; uniform float t; uniform float night;
      float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      void main(){ vec2 p=vec2(vUv.x*60.-t*.9, vUv.y*4.); float s=n(p)*.6+n(p*2.3+3.)*.4;
        vec3 c=mix(vec3(.55,.76,.74), vec3(.80,.58,.36), smoothstep(.45,.8,s)*.75);
        float edge=smoothstep(0.,.12,vUv.y)*smoothstep(1.,.88,vUv.y); c=mix(vec3(.85,.72,.52), c, edge);
        gl_FragColor=vec4(mix(c, c*vec3(.35,.45,.45), night),1.); }` });
  scene.add(new THREE.Mesh(rg, water));
  const U = DURIAN_STAGES.map((_, i) => 0.11 + i * (0.76 / 7));
  const st = U.map((u, i) => { const p = path.getPointAt(u); p.z += (i % 2 ? 1 : -1) * 2.6;
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.9, 0.5, 32), mat('#D9A86C', { roughness: 0.9 })); ped.position.set(p.x, 0.25, p.z); ped.castShadow = ped.receiveShadow = true; scene.add(ped); return p; });
  const teams = data.teams.slice(0, 10), stack = Array(8).fill(0);
  teams.forEach((t, i) => { const s = t.stage || 0, p = st[s], k = stack[s]++, a = k * 2.1;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 16), mat(TEAM_COLORS[i], { roughness: 0.6 }));
    b.position.set(p.x + Math.cos(a) * (k ? 0.42 : 0), 0.78 + Math.floor(k / 3) * 0.42, p.z + Math.sin(a) * (k ? 0.42 : 0)); b.castShadow = true; scene.add(b); });
  const lead = teams.length ? teams[0].stage || 0 : -1;
  if (lead >= 0) { const L = lotus(1.9); L.position.set(st[lead].x + 1.3, 0.15, st[lead].z + 0.4); scene.add(L); ctx.spin.push(L); }
  const counts = Array(8).fill(0); teams.forEach(t => counts[t.stage || 0]++);
  ctx.cards(DURIAN_STAGES.map(([f, vi, en], i) => ({ img: ROOT + 'assets/hc/durian/' + f + '.webp', text: (i + 1) + '. ' + (EN && en ? en : vi), badge: counts[i] + (EN ? ' teams' : ' nhóm'), lead: i === lead, below: i % 2 === 1,
    at: new THREE.Vector3(st[i].x, i % 2 ? -0.2 : 1.3, st[i].z + (i % 2 ? 0.5 : 0)) })));
  const ff = night ? fireflies(scene, () => { const p = path.getPointAt(Math.random()); return new THREE.Vector3(p.x + (Math.random() - 0.5) * 3, 0.6 + Math.random(), p.z + (Math.random() - 0.5) * 3); }, 260) : null;
  ctx.tick = t => { water.uniforms.t.value = t; if (ff) ff(t); };
}

// ---------- khung dựng ----------
export function createStage(canvas, overlay) {
  const R = new THREE.WebGLRenderer({ canvas, antialias: true });
  R.setPixelRatio(Math.min(devicePixelRatio, 2)); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.toneMapping = THREE.ACESFilmicToneMapping;
  let ctx = null, offset = 0, gen = 0; const clock = new THREE.Clock();
  function size() {
    const w = innerWidth, h = innerHeight; R.setSize(w, h);
    if (ctx) { ctx.camera.aspect = w / h; offset ? ctx.camera.setViewOffset(w + offset, h, offset, 0, w, h) : ctx.camera.clearViewOffset(); ctx.camera.updateProjectionMatrix(); }
  }
  addEventListener('resize', size);
  function dispose(scene) { scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); }); }
  async function show(game, data, night, panelPx) {
    const my = ++gen;
    const next = { scene: new THREE.Scene(), camera: new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.1, 200), spin: [], tick: null, tags: [] };
    next.labels = list => { next.tags.push(...list.map(o => { const e = document.createElement('div'); e.className = 'lab ' + (o.cls || ''); e.textContent = o.text; return { e, at: o.at }; })); };
    next.cards = list => { next.tags.push(...list.map(o => { const e = document.createElement('div'); e.className = 'st' + (o.lead ? ' lead' : '') + (o.below ? ' below' : '');
      const img = document.createElement('img'); img.src = o.img; img.alt = ''; const b = document.createElement('b'); b.textContent = o.text; const s = document.createElement('span'); s.textContent = o.badge;
      e.append(img, b, s); return { e, at: o.at }; })); };
    if (game === 'bps') await buildBps(next, data, night); else if (game === 'hcth') buildHcth(next, data, night); else buildHcsr(next, data, night);
    if (my !== gen) { dispose(next.scene); return; }
    if (ctx) dispose(ctx.scene);
    overlay.replaceChildren(...next.tags.map(t => t.e));
    ctx = next; offset = panelPx || 0; size();
  }
  (function frame() {
    requestAnimationFrame(frame);
    if (!ctx) return;
    const t = clock.getElapsedTime(); if (ctx.tick) ctx.tick(t); ctx.spin.forEach(o => { o.rotation.y = t * 0.3; });
    R.render(ctx.scene, ctx.camera);
    for (const g of ctx.tags) { const s = g.at.clone().project(ctx.camera); g.e.style.left = ((s.x + 1) / 2 * innerWidth).toFixed(1) + 'px'; g.e.style.top = ((1 - s.y) / 2 * innerHeight).toFixed(1) + 'px'; }
  })();
  return { show };
}
