// BizOn Bật Nghiệp — HQ diorama kit: department furniture, team flags, crew accessories.
import { makeProducts } from './bizon-products.js';
// makeHQ(THREE) → { items, depts, TEAMS, build(id), waveFlag(flag,t), dress(char,kind), crew }
// Units: meters, y-up, each item centered on origin, front faces +z.
export function makeHQ(THREE) {
  const mc = {}, gc = {};
  const mat = (hex, r = 0.85, m = 0, name) => mc[hex + '_' + r + '_' + m] ??= Object.assign(new THREE.MeshStandardMaterial({ color: hex, roughness: r, metalness: m }), { name: name || 'clay_' + hex.toString(16) });
  const C = { wood: 0xa8683c, woodD: 0x7a4a2a, woodL: 0xcf9864, teal: 0x2f8a8c, tealD: 0x1f6466, cream: 0xf2e6d0, white: 0xf4f1ea, navy: 0x2c3552,
    grey: 0x8a8f96, greyD: 0x5f656e, steel: 0xc4cad1, dark: 0x3a3f47, gold: 0xe8b64a, orange: 0xf08a3c, red: 0xd6453a, sage: 0x8fa77e, sageD: 0x6f8a60,
    leaf: 0x4f9a52, leafD: 0x3a7a42, terracotta: 0xc8643a, blue: 0x3f78c0, purple: 0x6a45a8, yellow: 0xf2c94c, kraft: 0xc9955a, black: 0x2b2b30,
    coral: 0xe4876a, sand: 0xe8cf9a, slate: 0x6f7f95, glass: 0x9fd6e6, holo: 0x6fe3ff, pink: 0xe79aa6, skyblue: 0x8fb8de };
  const M = {};
  for (const k in C) M[k] = mat(C[k], k === 'steel' || k === 'gold' ? 0.4 : 0.85, k === 'steel' ? 0.35 : k === 'gold' ? 0.4 : 0, 'clay_' + k);
  M.glass = Object.assign(new THREE.MeshStandardMaterial({ color: C.glass, roughness: 0.15, transparent: true, opacity: 0.35 }), { name: 'clay_glass' });
  M.holo = Object.assign(new THREE.MeshStandardMaterial({ color: C.holo, emissive: C.holo, emissiveIntensity: 0.8, transparent: true, opacity: 0.55, roughness: 0.3 }), { name: 'holo_glow' });
  M.holo.userData.glow = true;
  const bulbMat = () => { const m = new THREE.MeshStandardMaterial({ color: 0xfff1c9, emissive: 0xffc466, emissiveIntensity: 0.2, roughness: 0.4, name: 'lamp_bulb' }); m.userData.bulb = true; return m; };

  function rbox(w, h, d, r = 0.02) {
    r = Math.min(r, w * 0.49, h * 0.49, d * 0.49);
    const key = [w, h, d, r].map(v => v.toFixed(4)).join();
    if (gc[key]) return gc[key];
    const iw = Math.max(w - 2 * r, 1e-4), ih = Math.max(h - 2 * r, 1e-4), id = Math.max(d - 2 * r, 1e-4);
    const s = new THREE.Shape(); s.moveTo(-iw / 2, -ih / 2); s.lineTo(iw / 2, -ih / 2); s.lineTo(iw / 2, ih / 2); s.lineTo(-iw / 2, ih / 2); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: id, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 3, curveSegments: 1 });
    g.translate(0, 0, -id / 2); g.computeVertexNormals(); return gc[key] = g;
  }
  const mesh = (p, n, geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.name = n; o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; p.add(o); return o; };
  const G = (n, p, x = 0, y = 0, z = 0, ry = 0) => { const g = new THREE.Group(); g.name = n; g.position.set(x, y, z); g.rotation.y = ry; p && p.add(g); return g; };
  const B = (p, n, w, h, d, m, x = 0, y = 0, z = 0, r = 0.02) => mesh(p, n, rbox(w, h, d, r), m, x, y + h / 2, z);
  const Cy = (p, n, rt, rb, h, m, x = 0, y = 0, z = 0, seg = 24) => mesh(p, n, new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y + h / 2, z);
  const S = (p, n, r, m, x = 0, y = 0, z = 0) => mesh(p, n, new THREE.SphereGeometry(r, 24, 16), m, x, y, z);
  const L = (p, n, pts, m, x = 0, y = 0, z = 0) => mesh(p, n, new THREE.LatheGeometry(pts.map(q => new THREE.Vector2(q[0], q[1])), 32), m, x, y, z);
  const strut = (p, n, a, b, r, m) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = Bv.clone().sub(A); const o = mesh(p, n, new THREE.CylinderGeometry(r, r, d.length(), 8), m); o.position.copy(A).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return o; };
  const tripod = (p, h, spread, m) => { for (let i = 0; i < 3; i++) { const a = i * 2.094; strut(p, 'tripod_leg', [0, h, 0], [Math.cos(a) * spread, 0, Math.sin(a) * spread], 0.012, m); } };
  const Tor = (p, n, R, r, m, x, y, z, arc = Math.PI * 2) => mesh(p, n, new THREE.TorusGeometry(R, r, 10, 32, arc), m, x, y, z);

  // ---------- canvas textures
  function ctex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); draw(x, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  function panel(p, n, w, h, tex, x, y, z, ry = 0, glow = false) {
    const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, name: 'tex_' + n });
    if (glow) { m.emissive = new THREE.Color(0xffffff); m.emissiveMap = tex; m.emissiveIntensity = 0.12; m.userData.screen = true; }
    const o = mesh(p, n, new THREE.PlaneGeometry(w, h), m, x, y, z); o.rotation.y = ry; o.castShadow = false; return o;
  }
  const FONT = '"Baloo 2","Be Vietnam Pro",system-ui,sans-serif';
  function fit(x, s, maxW, size, weight = 700) { let f = size; do { x.font = `${weight} ${f}px ${FONT}`; f -= 2; } while (x.measureText(s).width > maxW && f > 10); }
  const rr = (x, X, Y, W, H, R) => { x.beginPath(); x.roundRect(X, Y, W, H, R); };
  const TX = {
    sign: (t, bg, fg, sub) => ctex(768, 192, (x, w, h) => {
      x.fillStyle = bg; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10);
      x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle';
      fit(x, t, w - 60, sub ? 78 : 92); x.fillText(t, w / 2, sub ? h * 0.4 : h / 2 + 4);
      if (sub) { fit(x, sub, w - 60, 40, 500); x.fillText(sub, w / 2, h * 0.76); }
    }),
    chart: (bg = '#23466b') => ctex(256, 160, (x, w, h) => {
      x.fillStyle = bg; x.fillRect(0, 0, w, h);
      [40, 62, 50, 88, 110].forEach((v, i) => { x.fillStyle = i === 4 ? '#f0a34a' : '#7fd3c9'; x.fillRect(24 + i * 30, h - 18 - v, 20, v); });
      x.strokeStyle = '#f4e9c8'; x.lineWidth = 5; x.beginPath(); [[20, 110], [70, 90], [120, 96], [170, 58], [236, 30]].forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke();
    }),
    logo: () => ctex(256, 160, (x, w, h) => {
      x.fillStyle = '#d9dde2'; x.fillRect(0, 0, w, h); x.fillStyle = '#1f6f9a'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `800 64px ${FONT}`; x.fillText('BizOn', w / 2, h / 2 + 4);
    }),
    worldDots: () => ctex(512, 320, (x, w, h) => {
      x.fillStyle = '#1d4f6e'; x.fillRect(0, 0, w, h);
      let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      const blobs = [[120, 110, 70, 50], [150, 220, 35, 55], [270, 100, 60, 40], [290, 190, 40, 55], [380, 120, 85, 55], [430, 240, 40, 25]];
      for (let i = 0; i < 900; i++) { const X = rnd() * w, Y = rnd() * h; if (blobs.some(([a, b, rx, ry]) => ((X - a) / rx) ** 2 + ((Y - b) / ry) ** 2 < 1)) { x.fillStyle = rnd() < 0.08 ? '#ffd166' : '#62d48a'; x.beginPath(); x.arc(X, Y, 3.2, 0, 7); x.fill(); } }
      x.strokeStyle = 'rgba(98,212,138,.5)'; x.setLineDash([6, 6]); x.lineWidth = 2; x.beginPath(); x.moveTo(390, 150); x.quadraticCurveTo(300, 60, 140, 110); x.stroke();
    }),
    whiteboard: (title, kind) => ctex(512, 360, (x, w, h) => {
      x.fillStyle = '#f7f5ef'; x.fillRect(0, 0, w, h); x.fillStyle = '#2c3552'; x.textAlign = 'left'; x.textBaseline = 'top';
      if (title) { fit(x, title, w - 40, 32); x.fillText(title, 20, 16); }
      x.lineWidth = 4; x.strokeStyle = '#2c3552';
      if (kind === 'sticky') {
        const cols = ['#ffd166', '#8fd3a8', '#ffb3a1', '#9cc9f0', '#f7e37a'];
        for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { x.fillStyle = cols[(r * 2 + c) % 5]; x.fillRect(24 + c * 92, 70 + r * 92, 72, 72); }
      } else if (kind === 'formula') {
        x.font = `600 26px ${FONT}`; ['E = k·T²', 'σ = F/A', 'ΔH ≈ 42 kJ'].forEach((s, i) => x.fillText(s, 24, 72 + i * 44));
        x.beginPath(); x.moveTo(290, 320); x.lineTo(290, 90); x.moveTo(290, 320); x.lineTo(490, 320); x.stroke();
        x.strokeStyle = '#d6453a'; x.beginPath(); x.moveTo(295, 300); x.bezierCurveTo(360, 290, 380, 120, 480, 110); x.stroke();
        x.strokeStyle = '#2f8a8c'; x.beginPath(); x.moveTo(295, 200); x.bezierCurveTo(360, 240, 420, 260, 480, 300); x.stroke();
        x.fillStyle = '#2c3552'; x.font = `500 20px ${FONT}`; x.fillText('Patent sketch #07', 24, 230); x.strokeStyle = '#2c3552'; x.strokeRect(24, 262, 200, 70);
      } else if (kind === 'breakeven') {
        x.beginPath(); x.moveTo(50, 320); x.lineTo(50, 70); x.moveTo(50, 320); x.lineTo(490, 320); x.stroke();
        x.fillStyle = 'rgba(214,69,58,.25)'; x.beginPath(); x.moveTo(52, 318); x.lineTo(52, 210); x.lineTo(250, 190); x.closePath(); x.fill();
        x.fillStyle = 'rgba(79,154,82,.3)'; x.beginPath(); x.moveTo(250, 190); x.lineTo(480, 80); x.lineTo(480, 165); x.closePath(); x.fill();
        x.lineWidth = 5; x.strokeStyle = '#4f9a52'; x.beginPath(); x.moveTo(52, 318); x.lineTo(480, 80); x.stroke();
        x.strokeStyle = '#d6453a'; x.beginPath(); x.moveTo(52, 210); x.lineTo(480, 165); x.stroke();
        x.fillStyle = '#e8b64a'; x.beginPath(); x.arc(250, 190, 11, 0, 7); x.fill();
        x.fillStyle = '#2c3552'; x.font = `600 20px ${FONT}`; x.fillText('ĐIỂM HÒA VỐN', 200, 208); x.fillText('DOANH THU', 380, 60); x.fillText('CHI PHÍ', 400, 176);
      } else if (kind === 'oee') {
        x.strokeStyle = '#2f8a8c'; x.lineWidth = 18; x.beginPath(); x.arc(130, 210, 80, Math.PI, Math.PI * 1.85); x.stroke();
        x.strokeStyle = '#e1e4e8'; x.beginPath(); x.arc(130, 210, 80, Math.PI * 1.85, Math.PI * 2); x.stroke();
        x.fillStyle = '#2c3552'; x.textAlign = 'center'; x.font = `800 44px ${FONT}`; x.fillText('85%', 130, 170); x.font = `600 22px ${FONT}`; x.fillText('OEE', 130, 222);
        x.textAlign = 'left'; ['Kế hoạch', 'Đang làm', 'Xong'].forEach((s, i) => { x.fillText(s, 260 + i * 82, 70); for (let k = 0; k < 3 - (i === 1); k++) { x.fillStyle = ['#ffd166', '#9cc9f0', '#8fd3a8'][i]; x.fillRect(262 + i * 82, 104 + k * 58, 66, 44); x.fillStyle = '#2c3552'; } });
      } else if (kind === 'risk') {
        const g = ['#62b36b', '#9ccf5f', '#f2d04c', '#f29a45', '#d6453a'];
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) { x.fillStyle = g[Math.min(4, Math.max(0, c + (4 - r) - 3))]; x.fillRect(40 + c * 50, 70 + r * 50, 46, 46); }
        x.fillStyle = '#2c3552'; x.font = `600 18px ${FONT}`; x.fillText('KHẢ NĂNG →', 60, 330);
        x.strokeStyle = '#2f8a8c'; x.lineWidth = 3; x.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 - Math.PI / 2, rr2 = [60, 42, 70, 50, 38, 64][i]; x.lineTo(410 + Math.cos(a) * rr2, 210 + Math.sin(a) * rr2); } x.closePath(); x.stroke();
        x.fillStyle = 'rgba(47,138,140,.25)'; x.fill();
        ['#ffd166', '#ffb3a1', '#9cc9f0'].forEach((cl, i) => { x.fillStyle = cl; x.fillRect(320 + i * 58, 70, 50, 40); });
      } else {
        x.beginPath(); x.ellipse(160, 200, 90, 70, 0, 0, 7); x.stroke(); x.beginPath(); x.moveTo(300, 300); x.lineTo(340, 200); x.lineTo(390, 240); x.lineTo(460, 120); x.stroke();
      }
    }),
    calc: (s = '420,000,000') => ctex(256, 64, (x, w, h) => { x.fillStyle = '#b7c9a3'; x.fillRect(0, 0, w, h); x.fillStyle = '#243024'; x.font = `700 38px monospace`; x.textAlign = 'right'; x.textBaseline = 'middle'; x.fillText(s, w - 12, h / 2 + 2); }),
    poster: (bg, fg, t) => ctex(256, 384, (x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.beginPath(); x.arc(w / 2, 140, 70, 0, 7); x.fill(); x.textAlign = 'center'; fit(x, t, w - 30, 46); x.fillText(t, w / 2, 290); x.font = `500 24px ${FONT}`; x.fillText('Gốm Mê Kông', w / 2, 330); }),
    swatch: () => ctex(256, 128, (x, w, h) => { ['#e4876a', '#f2c94c', '#8fd3a8', '#9cc9f0', '#b69ae0', '#f08a3c', '#2f8a8c'].forEach((c, i) => { x.fillStyle = c; x.fillRect(i * w / 7, 0, w / 7, h); }); }),
    stream: () => ctex(256, 160, (x, w, h) => { x.fillStyle = '#1e2433'; x.fillRect(0, 0, w, h); x.fillStyle = '#f08a3c'; x.beginPath(); x.arc(70, 80, 42, 0, 7); x.fill(); x.fillStyle = '#e8584a'; rr(x, 150, 20, 80, 30, 8); x.fill(); x.fillStyle = '#fff'; x.font = `700 20px ${FONT}`; x.fillText('LIVE', 168, 42); ['#8fd3a8', '#9cc9f0', '#ffd166'].forEach((c, i) => { x.fillStyle = c; x.fillRect(140, 70 + i * 26, 90 - i * 18, 16); }); }),
    holo: () => ctex(256, 160, (x, w, h) => { x.fillStyle = 'rgba(0,40,60,.2)'; x.fillRect(0, 0, w, h); x.strokeStyle = '#bff4ff'; x.lineWidth = 3; x.strokeRect(6, 6, w - 12, h - 12); x.beginPath(); [[20, 120], [70, 90], [110, 100], [160, 50], [230, 40]].forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke(); [30, 55, 45, 75].forEach((v, i) => { x.fillStyle = '#7fe8ff'; x.fillRect(150 + i * 20, 140 - v, 12, v); }); }),
    code: () => ctex(256, 160, (x, w, h) => { x.fillStyle = '#1b2230'; x.fillRect(0, 0, w, h); for (let i = 0; i < 9; i++) { x.fillStyle = ['#8fd3a8', '#9cc9f0', '#ffd166'][i % 3]; x.fillRect(14 + (i % 3) * 14, 14 + i * 15, 60 + (i * 37) % 120, 7); } }),
  };

  // ---------- shared pieces
  function desk(p, o = {}) {
    const { w = 1.5, d = 0.75, h = 0.74, top = M.wood, body = M.woodD, exec = true, trim } = o;
    const g = G('desk', p);
    B(g, 'desk_top', w, 0.06, d, top, 0, h - 0.06, 0, 0.022);
    if (exec) {
      for (const s of [-1, 1]) {
        B(g, 'desk_pedestal', 0.42, h - 0.06, d - 0.08, body, s * (w / 2 - 0.25), 0, 0, 0.025);
        for (let k = 0; k < 3; k++) {
          B(g, 'drawer', 0.34, 0.17, 0.02, top, s * (w / 2 - 0.25), 0.06 + k * 0.21, -(d - 0.08) / 2 - 0.005, 0.008);
          S(g, 'knob', 0.014, trim || M.gold, s * (w / 2 - 0.25), 0.145 + k * 0.21, -(d - 0.08) / 2 - 0.02);
        }
      }
      B(g, 'modesty', w - 0.9, h - 0.25, 0.03, body, 0, 0.18, d / 2 - 0.08, 0.01);
      if (trim) B(g, 'trim', w + 0.01, 0.02, d + 0.01, trim, 0, h - 0.07, 0, 0.008);
    } else for (const sx of [-1, 1]) for (const sz of [-1, 1]) Cy(g, 'desk_leg', 0.03, 0.03, h - 0.06, body, sx * (w / 2 - 0.08), 0, sz * (d / 2 - 0.08), 14);
    return h;
  }
  function officeChair(p, m, x, z, ry = 0, n = 'chair') {
    const g = G(n, p, x, 0, z, ry);
    for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; const leg = B(g, 'chair_star', 0.05, 0.035, 0.28, M.dark, Math.sin(a) * 0.13, 0.04, Math.cos(a) * 0.13, 0.012); leg.rotation.y = a; S(g, 'caster', 0.028, M.dark, Math.sin(a) * 0.26, 0.028, Math.cos(a) * 0.26); }
    Cy(g, 'chair_stem', 0.028, 0.03, 0.34, M.dark, 0, 0.07, 0, 14);
    B(g, 'chair_seat', 0.5, 0.09, 0.48, m, 0, 0.41, 0, 0.04);
    B(g, 'chair_back', 0.48, 0.55, 0.09, m, 0, 0.5, -0.24, 0.04).rotation.x = 0.08;
    for (const s of [-1, 1]) B(g, 'chair_arm', 0.05, 0.05, 0.3, M.dark, s * 0.25, 0.6, 0.0, 0.02);
    return g;
  }
  function armchair(p, m, x, z, ry = 0, tufted = false, n = 'armchair') {
    const g = G(n, p, x, 0, z, ry);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) Cy(g, 'leg', 0.025, 0.018, 0.14, M.woodL, sx * 0.3, 0, sz * 0.28, 12);
    B(g, 'seat', 0.76, 0.22, 0.72, m, 0, 0.14, 0, 0.06);
    B(g, 'cushion', 0.52, 0.1, 0.56, m, 0, 0.34, 0.04, 0.05);
    B(g, 'back', 0.76, 0.6, 0.18, m, 0, 0.3, -0.29, 0.07);
    for (const s of [-1, 1]) B(g, 'arm', 0.14, 0.3, 0.7, m, s * 0.33, 0.3, 0, 0.06);
    if (tufted) for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) S(g, 'tuft', 0.015, M.black, -0.18 + i * 0.18, 0.62 + j * 0.14, -0.2);
    return g;
  }
  function plant(p, x, z, s = 1, pot = M.terracotta, kind = 'bush', n = 'plant') {
    const g = G(n, p, x, 0, z); g.scale.setScalar(s);
    L(g, 'pot', [[0, 0], [0.14, 0], [0.18, 0.3], [0.2, 0.32], [0, 0.32]], pot);
    Cy(g, 'soil', 0.17, 0.17, 0.02, M.woodD, 0, 0.29, 0);
    if (kind === 'bush') [[0, 0.55, 0, 0.2], [0.13, 0.46, 0.06, 0.14], [-0.12, 0.47, -0.05, 0.15], [0.03, 0.72, -0.03, 0.13]].forEach(([a, b, c, r], i) => S(g, 'leaf_' + i, r, i % 2 ? M.leafD : M.leaf, a, b, c));
    else if (kind === 'tall') for (let i = 0; i < 7; i++) { const a = i * 0.9, lf = mesh(g, 'leaf_' + i, new THREE.SphereGeometry(0.1, 16, 10), i % 2 ? M.leaf : M.leafD, Math.cos(a) * 0.1, 0.5 + i * 0.07, Math.sin(a) * 0.1); lf.scale.set(0.6, 1.9, 0.3); lf.rotation.set(Math.sin(a) * 0.5, a, Math.cos(a) * 0.5); }
    else if (kind === 'bonsai') {
      const tr = mesh(g, 'trunk', new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0, 0.3, 0], [0.06, 0.45, 0], [-0.05, 0.6, 0.02], [0.04, 0.75, 0]].map(q => new THREE.Vector3(...q))), 24, 0.035, 10), M.woodD);
      [[-0.16, 0.66, 0, 0.13], [0.16, 0.78, 0.02, 0.12], [0.02, 0.9, 0, 0.12], [-0.05, 0.56, 0.08, 0.08]].forEach(([a, b, c, r], i) => { const l = S(g, 'foliage_' + i, r, M.leaf, a, b, c); l.scale.y = 0.6; });
    }
    return g;
  }
  function books(p, x, y, z, len, colors = [M.red, M.teal, M.navy, M.gold, M.sage, M.terracotta], kind = 'book') {
    let cx = x - len / 2, i = 0;
    while (cx < x + len / 2 - 0.04) { const w = kind === 'binder' ? 0.07 : 0.035 + ((i * 7) % 3) * 0.012, h = kind === 'binder' ? 0.3 : 0.2 + ((i * 5) % 4) * 0.025; const m = colors[(i * 3 + 1) % colors.length]; B(p, kind, w, h, 0.22, m, cx + w / 2, y, z, 0.006); if (kind === 'binder') B(p, 'label', w * 0.6, 0.08, 0.01, M.white, cx + w / 2, y + h * 0.55, z + 0.11, 0.003); cx += w + 0.006; i++; }
  }
  function bookcase(p, o = {}) {
    const { w = 1.2, h = 1.9, d = 0.36, m = M.wood, levels = 5, fill = 'book', colors } = o;
    const g = G('bookcase', p);
    for (const s of [-1, 1]) B(g, 'side', 0.05, h, d, m, s * (w / 2 - 0.025), 0, 0, 0.012);
    B(g, 'back', w, h, 0.02, m, 0, 0, -d / 2 + 0.01, 0.006);
    const step = (h - 0.08) / levels;
    for (let i = 0; i <= levels; i++) { B(g, 'shelf', w - 0.04, 0.035, d - 0.02, m, 0, i * step, 0, 0.008); if (i < levels && fill) books(g, 0, i * step + 0.035, 0.02, w - 0.14, colors, fill); }
    return g;
  }
  function laptop(p, x, y, z, ry = 0, tex) {
    const g = G('laptop', p, x, y, z, ry);
    B(g, 'laptop_base', 0.34, 0.018, 0.24, M.steel, 0, 0, 0, 0.006);
    B(g, 'keys', 0.28, 0.004, 0.12, M.dark, 0, 0.018, -0.02, 0.002);
    const lid = G('lid', g, 0, 0.018, 0.12); lid.rotation.x = 0.28;
    B(lid, 'lid', 0.34, 0.23, 0.012, M.steel, 0, 0, 0, 0.006);
    panel(lid, 'laptop_screen', 0.3, 0.19, tex || TX.chart(), 0, 0.115, -0.0075, Math.PI, true);
    panel(lid, 'laptop_logo', 0.3, 0.19, TX.logo(), 0, 0.115, 0.0075);
    return g;
  }
  function monitor(p, x, y, z, ry, tex, w = 0.5) {
    const g = G('monitor', p, x, y, z, ry);
    B(g, 'mon_foot', 0.2, 0.015, 0.14, M.dark, 0, 0, 0, 0.006); Cy(g, 'mon_neck', 0.018, 0.02, 0.18, M.dark, 0, 0.01, 0.02, 12);
    B(g, 'mon_frame', w, w * 0.62, 0.03, M.dark, 0, 0.16, 0.02, 0.01);
    panel(g, 'mon_screen', w - 0.04, w * 0.62 - 0.04, tex, 0, 0.16 + w * 0.31, 0.02 - 0.0155, Math.PI, true);
    return g;
  }
  function deskLamp(p, x, y, z, ry = 0, m = M.gold) {
    const g = G('desk_lamp', p, x, y, z, ry);
    Cy(g, 'lamp_base', 0.07, 0.08, 0.025, m, 0, 0, 0);
    const a = Cy(g, 'lamp_arm', 0.01, 0.01, 0.34, m, 0, 0.02, 0, 10); a.rotation.z = 0.25;
    const sh = mesh(g, 'lamp_shade', new THREE.ConeGeometry(0.09, 0.12, 24, 1, true), m, 0.1, 0.36, 0); sh.material.side = THREE.DoubleSide; sh.rotation.z = -0.9;
    S(g, 'lamp_bulb', 0.03, bulbMat(), 0.12, 0.32, 0);
    return g;
  }
  function stand(p, w, h, tex, frame = M.woodD, n = 'board', wheels = true, ry = 0) {
    const g = G(n, p, 0, 0, 0, ry);
    for (const s of [-1, 1]) { Cy(g, 'post', 0.025, 0.025, h + 0.55, M.steel, s * (w / 2 + 0.02), 0.06, 0, 12); B(g, 'foot', 0.07, 0.04, 0.5, M.steel, s * (w / 2 + 0.02), 0.03, 0, 0.015); if (wheels) for (const z of [-0.22, 0.22]) S(g, 'wheel', 0.03, M.dark, s * (w / 2 + 0.02), 0.03, z); }
    B(g, 'frame', w + 0.04, h + 0.04, 0.04, frame, 0, 0.58, 0, 0.012);
    panel(g, 'face', w, h, tex, 0, 0.6 + h / 2, 0.021);
    B(g, 'tray', w * 0.6, 0.02, 0.06, frame, 0, 0.56, 0.04, 0.008);
    return g;
  }
  function crate(p, s, x, y, z, ry = 0, m = M.kraft, n = 'box') {
    const g = G(n, p, x, y, z, ry);
    B(g, 'box', s, s * 0.8, s, m, 0, 0, 0, s * 0.06); B(g, 'tape', s * 0.2, 0.006, s * 1.004, M.sand, 0, s * 0.8 - 0.002, 0, 0.002);
    B(g, 'label', s * 0.4, s * 0.25, 0.004, M.white, 0, s * 0.3, s / 2 + 0.002, 0.002);
    return g;
  }
  function pallet(p, x, y, z, ry = 0) {
    const g = G('pallet', p, x, y, z, ry);
    for (const zz of [-0.45, 0, 0.45]) B(g, 'runner', 1.2, 0.1, 0.12, M.woodL, 0, 0, zz, 0.012);
    for (let i = 0; i < 7; i++) B(g, 'slat', 0.14, 0.03, 1.0, M.sand, -0.52 + i * 0.173, 0.1, 0, 0.008);
    return g;
  }
  function barrel(p, x, y, z, m = M.terracotta) {
    const g = G('barrel', p, x, y, z);
    L(g, 'barrel', [[0, 0], [0.2, 0], [0.25, 0.25], [0.2, 0.5], [0, 0.5]], m);
    for (const h of [0.1, 0.4]) Tor(g, 'rope', 0.235, 0.014, M.sand, 0, h, 0).rotation.x = Math.PI / 2;
    return g;
  }
  const vase = (p, x, y, z, s = 1, m = M.terracotta, n = 'vase') => { const v = L(p, n, [[0, 0], [0.05, 0], [0.08, 0.06], [0.085, 0.12], [0.05, 0.19], [0.04, 0.22], [0.055, 0.24], [0, 0.24]], m, x, y, z); v.scale.setScalar(s); return v; };
  function wallShelf(p, w, m) { const g = G('wall_shelf', p); B(g, 'shelf_board', w, 0.05, 0.28, m, 0, 0, 0.14, 0.015); for (const s of [-1, 1]) B(g, 'bracket', 0.04, 0.16, 0.2, M.dark, s * (w / 2 - 0.12), -0.16, 0.1, 0.01); return g; }
  function trophy(p, x, y, z, s = 1, m = M.gold) { const g = G('trophy', p, x, y, z); g.scale.setScalar(s); B(g, 'base', 0.1, 0.05, 0.1, M.woodD, 0, 0, 0, 0.01); L(g, 'cup', [[0, 0], [0.03, 0], [0.012, 0.03], [0.01, 0.07], [0.06, 0.1], [0.07, 0.17], [0.06, 0.17], [0, 0.12]], m, 0, 0.05, 0); for (const sd of [-1, 1]) Tor(g, 'handle', 0.03, 0.007, m, sd * 0.065, 0.19, 0, Math.PI).rotation.z = -sd * Math.PI / 2; return g; }
  function safe(p, s, m, open, fill) {
    const g = G('safe', p);
    B(g, 'body', s, s, s * 0.9, m, 0, 0, 0, 0.05);
    B(g, 'inner', s * 0.8, s * 0.8, 0.02, M.black, 0, s * 0.1, s * 0.45 - 0.005, 0.01);
    const door = G('door', g, s * 0.42, 0, s * 0.45 + 0.02); door.rotation.y = open ? -1.9 : 0;
    B(door, 'door', s * 0.84, s * 0.84, 0.06, m, -s * 0.42, s * 0.08, 0, 0.03);
    const dial = Cy(door, 'dial', 0.07, 0.07, 0.03, M.gold, -s * 0.42, s * 0.5, 0.04); dial.rotation.x = Math.PI / 2;
    for (let i = 0; i < 4; i++) { const sp = Cy(door, 'spoke', 0.008, 0.008, 0.16, M.gold, -s * 0.42, s * 0.5 - 0.08, 0.06, 8); sp.rotation.z = i * Math.PI / 4; sp.position.y = s * 0.5; sp.geometry.translate(0, -0.08, 0); sp.rotation.x = 0; }
    if (fill === 'gold') for (let i = 0; i < 3; i++) for (let j = 0; j < 3 - i; j++) B(g, 'gold_bar', 0.16, 0.06, 0.08, M.gold, -0.12 + j * 0.17 + i * 0.08, s * 0.12 + i * 0.065, 0.1, 0.01);
    return g;
  }
  function stool(p, x, z, h = 0.45, m = M.woodL) { const g = G('stool', p, x, 0, z); Cy(g, 'stool_seat', 0.17, 0.17, 0.05, m, 0, h - 0.05, 0); for (let i = 0; i < 3; i++) { const a = i * 2.1, l = Cy(g, 'stool_leg', 0.02, 0.02, h - 0.05, M.woodD, Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1, 10); } return g; }
  function coffeeTable(p, x, z, w, d, top, legs, ry = 0) { const g = G('coffee_table', p, x, 0, z, ry); B(g, 'ct_top', w, 0.05, d, top, 0, 0.38, 0, 0.02); for (const sx of [-1, 1]) for (const sz of [-1, 1]) Cy(g, 'ct_leg', 0.022, 0.022, 0.38, legs, sx * (w / 2 - 0.06), 0, sz * (d / 2 - 0.06), 12); return g; }
  function cup(p, x, y, z, m = M.white) { L(p, 'cup', [[0, 0], [0.03, 0], [0.036, 0.07], [0.03, 0.07], [0, 0.01]], m, x, y, z); Tor(p, 'cup_handle', 0.016, 0.005, m, x + 0.036, y + 0.04, z, Math.PI).rotation.z = -Math.PI / 2; }

  // ========== CEO / EXECUTIVE
  function ceoDesk() { const g = G('CEO_MasterDesk'); const T = desk(g, { w: 1.8, d: 0.85, top: M.wood, body: M.woodD, trim: M.gold });
    laptop(g, -0.05, T, -0.05, 0); deskLamp(g, -0.7, T, 0.15, 0.4); B(g, 'blotter', 0.5, 0.01, 0.32, M.navy, 0.35, T, -0.1, 0.004);
    const gl = G('globe', g, 0.7, T, 0.15); Cy(gl, 'globe_foot', 0.06, 0.07, 0.03, M.gold); Tor(gl, 'globe_ring', 0.12, 0.008, M.gold, 0, 0.17, 0).rotation.y = Math.PI / 2; S(gl, 'globe_ball', 0.105, M.blue, 0, 0.17, 0); S(gl, 'land', 0.06, M.leaf, 0.05, 0.2, 0.06).scale.set(1, 0.7, 0.5);
    B(g, 'nameplate', 0.28, 0.06, 0.05, M.gold, 0.1, T, 0.34, 0.01); officeChair(g, M.navy, 0, -0.8, 0); return g; }
  function trophyCabinet() { const g = G('CEO_TrophyCabinet'); const W = 0.95, H = 1.8, D = 0.45;
    B(g, 'cab_base', W, 0.14, D, M.woodD, 0, 0, 0, 0.02); B(g, 'cab_top', W + 0.06, 0.08, D + 0.04, M.wood, 0, H - 0.08, 0, 0.02);
    for (const s of [-1, 1]) B(g, 'cab_post', 0.06, H - 0.2, D, M.wood, s * (W / 2 - 0.03), 0.14, 0, 0.015);
    B(g, 'cab_back', W - 0.1, H - 0.2, 0.02, M.woodD, 0, 0.14, -D / 2 + 0.02, 0.005);
    [0.55, 1.0, 1.42].forEach((y, i) => { B(g, 'glass_shelf', W - 0.12, 0.015, D - 0.06, M.glass, 0, y, 0, 0.004);
      if (i === 2) [-0.25, 0, 0.25].forEach(x => trophy(g, x, y + 0.015, 0, 1.2)); else if (i === 1) [-0.2, 0.2].forEach(x => { B(g, 'certificate', 0.24, 0.3, 0.02, M.cream, x, y + 0.015, -0.1, 0.005).rotation.x = -0.15; B(g, 'seal', 0.05, 0.05, 0.01, M.red, x, y + 0.06, -0.08, 0.005); });
      else [-0.25, 0, 0.25].forEach((x, k) => { Cy(g, 'medal', 0.05, 0.05, 0.012, [M.gold, M.steel, M.terracotta][k], x, y + 0.08, 0.05).rotation.x = Math.PI / 2; B(g, 'ribbon', 0.04, 0.08, 0.006, M.blue, x, y + 0.12, 0.05, 0.002); }); });
    B(g, 'glass_front', W - 0.1, H - 0.22, 0.01, M.glass, 0, 0.15, D / 2 - 0.01, 0.003); return g; }
  function visionMap() { const g = G('CEO_VisionWallMap'); B(g, 'map_frame', 1.7, 1.05, 0.06, M.gold, 0, 1.35, 0, 0.02); panel(g, 'map_face', 1.58, 0.93, TX.worldDots(), 0, 1.875, 0.031, 0, true);
    const pr = G('holo_projector', g, 0.95, 0, 0.35); Cy(pr, 'proj_base', 0.18, 0.2, 0.08, M.greyD); Cy(pr, 'proj_ring', 0.14, 0.14, 0.02, M.holo, 0, 0.08, 0); const h = mesh(pr, 'holo_dragon', new THREE.TorusKnotGeometry(0.1, 0.03, 80, 10, 2, 3), M.holo, 0, 0.35, 0); h.scale.y = 1.4; mesh(pr, 'holo_cone', new THREE.ConeGeometry(0.16, 0.45, 24, 1, true), M.holo, 0, 0.32, 0).rotation.x = Math.PI; return g; }
  function vipLounge() { const g = G('CEO_VIPLounge'); armchair(g, M.navy, -0.6, 0, 0.5, true); armchair(g, M.navy, 0.6, 0, -0.5, true); coffeeTable(g, 0, 0.55, 0.8, 0.5, M.white, M.gold); cup(g, -0.15, 0.43, 0.55); cup(g, 0.18, 0.43, 0.5); L(g, 'decanter', [[0, 0], [0.05, 0], [0.06, 0.08], [0.02, 0.14], [0.02, 0.18], [0, 0.18]], M.glass, 0.02, 0.43, 0.62); return g; }
  function execVault() { const g = G('CEO_ExecVault'); safe(g, 0.8, M.greyD, true, 'gold'); return g; }
  function bonsai() { const g = G('CEO_Bonsai'); plant(g, 0, 0, 1.3, M.terracotta, 'bonsai'); return g; }
  function grandClock() { const g = G('CEO_GrandClock'); B(g, 'clock_base', 0.5, 0.2, 0.34, M.woodD, 0, 0, 0, 0.03); B(g, 'clock_case', 0.4, 1.3, 0.28, M.wood, 0, 0.2, 0, 0.03); B(g, 'clock_head', 0.52, 0.5, 0.34, M.wood, 0, 1.5, 0, 0.06);
    Cy(g, 'clock_face', 0.17, 0.17, 0.02, M.cream, 0, 0, 0, 32).position.set(0, 1.75, 0.17); g.getObjectByName('clock_face').rotation.x = Math.PI / 2;
    B(g, 'hand_h', 0.012, 0.1, 0.01, M.black, 0, 1.75, 0.185, 0.004); const hm = B(g, 'hand_m', 0.01, 0.13, 0.01, M.black, 0.03, 1.72, 0.19, 0.004); hm.rotation.z = -1.1;
    B(g, 'window', 0.26, 0.8, 0.01, M.glass, 0, 0.45, 0.145, 0.005); Cy(g, 'pendulum_rod', 0.006, 0.006, 0.55, M.gold, 0, 0.7, 0.12, 8); Cy(g, 'pendulum', 0.07, 0.07, 0.02, M.gold, 0, 0.6, 0.12, 24).rotation.x = Math.PI / 2;
    S(g, 'finial', 0.05, M.gold, 0, 2.05, 0); return g; }

  // ========== R&D LAB
  function printer3d() { const g = G('RnD_ClayPrinter'); B(g, 'printer_base', 0.9, 0.18, 0.7, M.blue, 0, 0, 0, 0.05); B(g, 'printer_deck', 0.6, 0.04, 0.5, M.dark, 0, 0.18, 0, 0.01);
    for (const s of [-1, 1]) B(g, 'gantry_post', 0.08, 0.7, 0.08, M.steel, s * 0.38, 0.18, -0.2, 0.02); B(g, 'gantry_beam', 0.84, 0.08, 0.1, M.orange, 0, 0.86, -0.2, 0.02);
    B(g, 'print_head', 0.14, 0.12, 0.14, M.orange, 0.05, 0.72, -0.08, 0.03); mesh(g, 'nozzle', new THREE.ConeGeometry(0.025, 0.06, 16), M.gold, 0.05, 0.69, -0.08).rotation.x = Math.PI;
    vase(g, 0.05, 0.22, -0.08, 1.4, M.coral, 'printed_vase'); B(g, 'panel', 0.24, 0.12, 0.02, M.dark, 0.25, 0.04, 0.35, 0.01); panel(g, 'panel_screen', 0.2, 0.08, TX.chart('#3a7bb0'), 0.25, 0.1, 0.362, 0, true);
    const sp = G('filament_spool', g, -0.55, 0.3, 0); ['#e4876a', '#f2c94c', '#8fd3a8', '#9cc9f0'].forEach((c, i) => Cy(sp, 'filament', 0.18, 0.18, 0.04, mat(parseInt(c.slice(1), 16)), 0, i * 0.04 - 0.08, 0, 32)); sp.rotation.z = Math.PI / 2;
    const arm = G('robot_arm', g, 0.55, 0.18, 0.1); Cy(arm, 'arm_base', 0.1, 0.12, 0.06, M.steel); const a1 = B(arm, 'arm_seg1', 0.07, 0.4, 0.07, M.steel, 0, 0.06, 0, 0.03); a1.rotation.z = 0.3; S(arm, 'arm_joint', 0.06, M.orange, -0.12, 0.44, 0); const a2 = B(arm, 'arm_seg2', 0.06, 0.3, 0.06, M.steel, -0.2, 0.42, 0, 0.025); a2.rotation.z = 1.2;
    Tor(arm, 'gear', 0.07, 0.02, M.gold, -0.12, 0.44, 0.06); return g; }
  function labBench() { const g = G('RnD_LabBench'); const T = desk(g, { w: 1.6, d: 0.7, h: 0.8, top: M.wood, body: M.woodD, exec: false });
    const rack = G('tube_rack', g, -0.55, T, 0.05); B(rack, 'rack', 0.3, 0.06, 0.1, M.woodL, 0, 0, 0, 0.01); ['#e4876a', '#62b36b', '#6a45a8', '#3f78c0', '#f2c94c'].forEach((c, i) => { Cy(rack, 'tube', 0.018, 0.018, 0.2, M.glass, -0.12 + i * 0.06, 0.02, 0, 12); Cy(rack, 'liquid', 0.016, 0.016, 0.12, mat(parseInt(c.slice(1), 16), 0.4), -0.12 + i * 0.06, 0.02, 0, 12); });
    L(g, 'flask', [[0, 0], [0.11, 0], [0.1, 0.06], [0.03, 0.18], [0.03, 0.26], [0, 0.26]], M.glass, -0.1, T, -0.1); L(g, 'flask_liquid', [[0, 0], [0.1, 0], [0.09, 0.06], [0, 0.07]], mat(0x62b36b, 0.3), -0.1, T + 0.005, -0.1);
    B(g, 'notebook', 0.34, 0.02, 0.24, M.cream, 0.05, T, 0.15, 0.005); B(g, 'scale', 0.24, 0.05, 0.2, M.white, 0.35, T, 0.12, 0.02); panel(g, 'scale_lcd', 0.12, 0.03, TX.calc('12.45 g'), 0.35, T + 0.03, 0.222, 0, true);
    const mic = G('microscope', g, 0.55, T, -0.15); B(mic, 'mic_base', 0.2, 0.05, 0.22, M.white, 0, 0, 0, 0.02); B(mic, 'mic_arm', 0.06, 0.34, 0.08, M.white, 0, 0.05, -0.07, 0.02); Cy(mic, 'mic_tube', 0.04, 0.035, 0.16, M.grey, 0, 0.26, 0.0).rotation.x = 0.4; S(mic, 'mic_light', 0.03, mat(0xd6453a), 0, 0.1, 0.05); return g; }
  function holoStation() { const g = G('RnD_HoloStation'); L(g, 'console', [[0, 0], [0.7, 0], [0.75, 0.1], [0.7, 0.62], [0, 0.66]], M.steel); B(g, 'console_top', 1.2, 0.04, 0.6, M.dark, 0, 0.66, 0, 0.02).scale.set(1, 1, 1);
    panel(g, 'console_screen', 1.0, 0.45, TX.holo(), 0, 0.69, 0, 0, true).rotation.x = -Math.PI / 2;
    const hg = G('holo', g, 0, 0.7, -0.1); panel(hg, 'holo_panel', 1.1, 0.6, TX.holo(), 0, 0.55, 0, 0, true).material.transparent = true;
    mesh(hg, 'holo_cube', new THREE.BoxGeometry(0.2, 0.2, 0.2), M.holo, 0, 0.35, 0.3).rotation.set(0.6, 0.6, 0); return g; }
  function formulaBoard() { const g = G('RnD_FormulaBoard'); stand(g, 1.3, 0.85, TX.whiteboard('BIZON BẬT NGHIỆP – R&D LAB', 'formula'), M.steel); return g; }
  function kiln() { const g = G('RnD_PotteryKiln'); Cy(g, 'kiln_body', 0.42, 0.44, 1.1, M.terracotta, 0, 0, 0, 40); Cy(g, 'kiln_lid', 0.44, 0.44, 0.06, M.woodD, 0, 1.1, 0, 40);
    B(g, 'kiln_door', 0.4, 0.34, 0.12, M.dark, 0, 0.42, 0.36, 0.04); const w = B(g, 'kiln_window', 0.3, 0.24, 0.02, bulbMat(), 0, 0.47, 0.43, 0.02); w.material.color.set(0xffa040); w.material.emissive.set(0xff7a1a); w.material.emissiveIntensity = 0.6; w.material.userData.bulb = false; w.material.userData.glow = true;
    vase(g, 0, 0.5, 0.36, 0.6, M.woodD); Cy(g, 'gauge', 0.07, 0.07, 0.02, M.white, 0.25, 0.85, 0.37).rotation.x = Math.PI / 2; return g; }
  function materialRack() { const g = G('RnD_MaterialRack'); const W = 1.3, H = 1.6, D = 0.5;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(g, 'rack_post', 0.04, H, 0.04, M.steel, sx * W / 2, 0, sz * D / 2, 0.008);
    [0.1, 0.6, 1.1, 1.58].forEach(y => B(g, 'rack_shelf', W + 0.04, 0.03, D + 0.04, M.greyD, 0, y, 0, 0.006));
    ['#d6453a', '#3f78c0', '#62b36b', '#f2c94c', '#6a45a8', '#e4876a'].forEach((c, i) => { Cy(g, 'jar', 0.07, 0.07, 0.2, M.glass, -0.5 + i * 0.2, 1.13, 0, 16); Cy(g, 'jar_fill', 0.065, 0.065, 0.14, mat(parseInt(c.slice(1), 16)), -0.5 + i * 0.2, 1.13, 0, 16); Cy(g, 'jar_lid', 0.072, 0.072, 0.03, M.dark, -0.5 + i * 0.2, 1.33, 0, 16); });
    for (let i = 0; i < 4; i++) Tor(g, 'gear', 0.09, 0.03, M.grey, -0.45 + i * 0.3, 0.72, 0).rotation.x = Math.PI / 2 - 0.3;
    for (let i = 0; i < 3; i++) crate(g, 0.34, -0.42 + i * 0.42, 0.13, 0, 0);
    [M.red, M.teal, M.gold].forEach((m, i) => B(g, 'block', 0.16, 0.16, 0.16, m, 0.3 + i * 0.1 - 0.1, 1.61 + (i === 1 ? 0.16 : 0), 0, 0.02)); return g; }
  function rover() { const g = G('RnD_RobotRover'); B(g, 'rover_body', 0.4, 0.2, 0.3, M.yellow, 0, 0.1, 0, 0.05); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const w = Cy(g, 'wheel', 0.08, 0.08, 0.06, M.black, sx * 0.17, 0, sz * 0.18, 16); w.rotation.x = Math.PI / 2; w.position.y = 0.08; }
    B(g, 'rover_head', 0.18, 0.14, 0.14, M.white, 0.04, 0.3, 0, 0.04); for (const s of [-1, 1]) S(g, 'eye', 0.025, M.dark, 0.08 + s * 0.04, 0.38, 0.07); Cy(g, 'antenna', 0.006, 0.006, 0.15, M.dark, 0, 0.44, -0.03, 8); S(g, 'antenna_tip', 0.02, mat(0xd6453a), 0, 0.6, -0.03);
    const dr = G('drone', g, 0.55, 0.1, 0); Cy(dr, 'pad', 0.18, 0.2, 0.05, M.greyD); B(dr, 'drone_body', 0.14, 0.06, 0.14, M.white, 0, 0.45, 0, 0.03); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; Cy(dr, 'rotor', 0.07, 0.07, 0.01, M.dark, Math.cos(a) * 0.14, 0.51, Math.sin(a) * 0.14, 16); } return g; }

  // ========== CFO / FINANCE
  function cfoDesk() { const g = G('CFO_Desk'); const T = desk(g, { w: 1.6, d: 0.8, top: M.slate, body: mat(0x56647a), trim: M.gold });
    laptop(g, -0.35, T, -0.05, 0.15); const c = G('calculator', g, 0.35, T, 0); B(c, 'calc_body', 0.34, 0.07, 0.26, M.steel, 0, 0, 0, 0.02); c.rotation.x = -0.15;
    panel(c, 'calc_lcd', 0.28, 0.06, TX.calc(), 0, 0.075, -0.1, 0, true).rotation.x = -Math.PI / 2 + 0.4;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) B(c, 'key', 0.05, 0.02, 0.035, [M.white, M.white, M.white, M.orange][j], -0.1 + j * 0.068, 0.06, -0.03 + i * 0.045, 0.006);
    B(g, 'ledger', 0.36, 0.015, 0.26, M.woodD, 0.0, T, 0.2, 0.004); Cy(g, 'pen_stand', 0.03, 0.035, 0.06, M.gold, -0.7, T, 0.2); Cy(g, 'pen', 0.006, 0.006, 0.14, M.woodD, -0.7, T + 0.04, 0.2, 8).rotation.z = 0.3;
    officeChair(g, M.grey, 0, -0.8, 0); return g; }
  function goldVault() { const g = G('CFO_GoldVault'); safe(g, 0.85, M.grey, true, 'gold'); for (let i = 0; i < 4; i++) B(g, 'cash_stack', 0.2, 0.06, 0.1, mat(0x7fb07a), 0.62, i * 0.06, 0.25, 0.01); for (let i = 0; i < 6; i++) Cy(g, 'coin', 0.04, 0.04, 0.012, M.gold, 0.3 + (i % 3) * 0.1, 0, 0.6 - Math.floor(i / 3) * 0.08, 20); return g; }
  function ledgerCabinet() { const g = G('CFO_LedgerCabinet'); const bc = bookcase(g, { w: 1.1, h: 1.3, d: 0.4, m: M.slate, levels: 3, fill: 'binder', colors: [M.navy, M.red, M.leafD, M.teal, M.terracotta, M.purple] });
    const bd = stand(g, 1.05, 0.68, TX.whiteboard('', 'breakeven'), M.woodD, 'breakeven_board', false); bd.position.set(0, 0.72, 0.05); bd.scale.set(1, 1, 1);
    g.traverse(o => { if (o.name === 'post' || o.name === 'foot') o.visible = false; }); return g; }
  function receiptPrinter() { const g = G('CFO_ReceiptPrinter'); B(g, 'stand', 0.55, 0.7, 0.45, M.slate, 0, 0, 0, 0.03); B(g, 'printer', 0.5, 0.2, 0.38, M.teal, 0, 0.7, 0, 0.05); B(g, 'printer_top', 0.44, 0.06, 0.3, M.white, 0, 0.9, -0.02, 0.03);
    Cy(g, 'paper_roll', 0.06, 0.06, 0.26, M.white, 0, 0.96, -0.08, 20).rotation.z = Math.PI / 2;
    const strip = mesh(g, 'receipt', new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0, 0.92, 0.18], [0, 0.85, 0.35], [0.05, 0.4, 0.45], [0.1, 0.02, 0.6], [0.2, 0.01, 0.9]].map(q => new THREE.Vector3(...q))), 40, 0.06, 2), M.white); strip.scale.x = 1; return g; }
  function moneyPallet() { const g = G('CFO_MoneyPallet'); pallet(g, 0, 0, 0); [[-0.3, -0.2], [0.25, -0.2], [0, 0.22], [-0.05, -0.05]].forEach(([x, z], i) => { const bag = G('money_bag', g, x, 0.13 + (i === 3 ? 0.25 : 0), z); S(bag, 'bag', 0.2, M.kraft, 0, 0.18, 0).scale.set(1, 0.9, 0.9); Cy(bag, 'bag_neck', 0.06, 0.1, 0.08, M.kraft, 0, 0.33, 0); Tor(bag, 'bag_tie', 0.07, 0.015, M.woodD, 0, 0.36, 0).rotation.x = Math.PI / 2; });
    const sc = G('balance_scale', g, 0.95, 0, 0.2); B(sc, 'scale_base', 0.34, 0.08, 0.2, M.woodD, 0, 0, 0, 0.02); Cy(sc, 'scale_post', 0.015, 0.015, 0.5, M.gold, 0, 0.08, 0, 10); B(sc, 'beam', 0.46, 0.02, 0.02, M.gold, 0, 0.56, 0, 0.006); for (const s of [-1, 1]) Cy(sc, 'pan', 0.08, 0.06, 0.02, M.gold, s * 0.22, 0.4, 0, 20); return g; }
  function piggyShelf() { const g = G('CFO_PiggyShelf'); wallShelf(g, 1.1, M.teal); const pg = G('piggy', g, -0.3, 0.05, 0.14); S(pg, 'piggy', 0.12, M.gold, 0, 0.1, 0).scale.set(1.2, 1, 1); S(pg, 'snout', 0.04, M.gold, 0.14, 0.1, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) Cy(pg, 'leg', 0.025, 0.025, 0.05, M.gold, sx * 0.07, 0, sz * 0.05, 10);
    const ar = mesh(g, 'arrow', new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0, 0.06, 0], [0.08, 0.15, 0], [0.12, 0.12, 0], [0.24, 0.32, 0]].map(q => new THREE.Vector3(...q))), 20, 0.02, 8), M.leaf, 0, 0, 0.14); mesh(g, 'arrow_head', new THREE.ConeGeometry(0.04, 0.08, 12), M.leaf, 0.26, 0.36, 0.14).rotation.z = -0.5;
    B(g, 'certificate', 0.24, 0.3, 0.02, M.gold, 0.35, 0.05, 0.08, 0.01); B(g, 'cert_paper', 0.2, 0.26, 0.01, M.cream, 0.35, 0.07, 0.095, 0.004); return g; }

  // ========== CMO / CREATIVE
  function creativeDesk() { const g = G('CMO_CreativeDesk'); const T = desk(g, { w: 1.6, d: 0.8, top: M.coral, body: M.coral, exec: false });
    laptop(g, 0.3, T, -0.05, -0.2, TX.stream()); B(g, 'sketchbook', 0.4, 0.02, 0.28, M.white, -0.25, T, 0.05, 0.005); panel(g, 'swatch', 0.3, 0.14, TX.swatch(), -0.55, T + 0.012, 0.15, 0).rotation.x = -Math.PI / 2;
    const mg = mesh(g, 'mini_megaphone', new THREE.CylinderGeometry(0.08, 0.03, 0.18, 20, 1, true), M.red, -0.6, T + 0.08, -0.15); mg.material = mat(0xd6453a); mg.material.side = THREE.DoubleSide; mg.rotation.z = Math.PI / 2;
    officeChair(g, M.grey, 0, -0.8, 0); return g; }
  function moodboard() { const g = G('CMO_Moodboard'); stand(g, 1.4, 0.9, TX.whiteboard('CAMPAIGN · TẾT 2027', 'sticky'), M.steel); return g; }
  function streamDesk() { const g = G('CMO_StreamDesk'); const T = desk(g, { w: 1.4, d: 0.7, top: M.coral, body: M.coral, exec: false });
    monitor(g, 0.1, T, 0.05, 0, TX.stream(), 0.7); B(g, 'keyboard', 0.4, 0.02, 0.13, M.dark, 0.1, T, -0.2, 0.005);
    const mic = G('podcast_mic', g, -0.45, T, -0.1); Cy(mic, 'mic_base', 0.06, 0.07, 0.02, M.dark); Cy(mic, 'mic_stem', 0.01, 0.01, 0.2, M.dark, 0, 0.02, 0, 8); L(mic, 'mic_head', [[0, 0], [0.035, 0.01], [0.04, 0.08], [0.03, 0.11], [0, 0.12]], M.dark, 0, 0.22, 0);
    B(g, 'foam_panel', 1.0, 0.6, 0.06, M.black, 0.1, T + 0.5, 0.33, 0.02);
    const rl = G('ring_light', g, -0.95, 0, 0); tripod(rl, 1.0, 0.28, M.black);
    Cy(rl, 'tripod_mast', 0.014, 0.014, 0.65, M.black, 0, 1.0, 0, 8); Tor(rl, 'ring', 0.22, 0.03, bulbMat(), 0, 1.85, 0); return g; }
  function billboards() { const g = G('CMO_BillboardMaquettes'); [[-0.35, M.greyD, TX.poster('#f6efe2', '#c8643a', 'BizOn')], [0.35, M.greyD, TX.poster('#e8584a', '#fff1e0', 'Mua 1 tặng 1')]].forEach(([x, m, t], i) => {
      const b = G('billboard_' + i, g, x, 0, i ? 0.1 : 0, i ? -0.2 : 0.15); B(b, 'bb_foot', 0.4, 0.06, 0.3, m, 0, 0, 0, 0.02); Cy(b, 'bb_post', 0.03, 0.03, 0.35, m, 0, 0.06, 0, 10); B(b, 'bb_frame', 0.52, 0.8, 0.08, m, 0, 0.4, 0, 0.03); panel(b, 'bb_poster', 0.44, 0.7, t, 0, 0.8, 0.041, 0, true); }); return g; }
  function photoStation() { const g = G('CMO_PhotoStation'); B(g, 'photo_table', 0.9, 0.5, 0.7, M.black, 0, 0, 0, 0.03); const sweep = mesh(g, 'backdrop', new THREE.CylinderGeometry(0.4, 0.4, 0.84, 24, 1, true, Math.PI, Math.PI / 2), M.white, 0, 0.9, -0.0); sweep.material = mat(0xfafafa); sweep.material.side = THREE.DoubleSide; sweep.rotation.z = Math.PI / 2; sweep.position.set(0, 0.9, 0);
    Cy(g, 'turntable', 0.2, 0.2, 0.04, M.steel, 0, 0.5, 0.1, 32); vase(g, 0, 0.54, 0.1, 1.1, M.coral);
    for (const s of [-1, 1]) { const st = G('softbox', g, s * 0.75, 0, 0.3, s * 0.5); Cy(st, 'sb_post', 0.012, 0.012, 1.3, M.black, 0, 0, 0, 8); B(st, 'softbox', 0.4, 0.4, 0.1, M.black, 0, 1.2, 0, 0.02); panel(st, 'sb_face', 0.36, 0.36, ctex(8, 8, (x) => { x.fillStyle = '#fff'; x.fillRect(0, 0, 8, 8); }), 0, 1.4, 0.051, 0, true); }
    const cam = G('camera', g, 0.2, 0, 0.9); tripod(cam, 1.0, 0.25, M.black); B(cam, 'cam_body', 0.16, 0.1, 0.08, M.black, 0, 1.0, 0, 0.02); Cy(cam, 'lens', 0.035, 0.035, 0.08, M.dark, 0, 1.05, -0.07, 16).rotation.x = Math.PI / 2; return g; }
  function beanbags() { const g = G('CMO_BrainstormLounge'); [[-0.7, M.coral], [0.7, M.yellow]].forEach(([x, m]) => { const b = S(g, 'beanbag', 0.38, m, x, 0.25, 0); b.scale.set(1.1, 0.72, 1.05); S(g, 'beanbag_back', 0.26, m, x, 0.5, -0.22).scale.set(1.2, 0.9, 0.6); });
    Cy(g, 'round_table', 0.35, 0.35, 0.04, M.woodL, 0, 0.3, 0, 32); Cy(g, 'table_leg', 0.04, 0.05, 0.3, M.woodL, 0, 0, 0, 12);
    ['#d6453a', '#3f78c0', '#62b36b', '#f2c94c', '#6a45a8'].forEach((c, i) => { const mk = Cy(g, 'marker', 0.012, 0.012, 0.12, mat(parseInt(c.slice(1), 16)), -0.15 + i * 0.07, 0.35, 0.05 - (i % 2) * 0.1, 8); mk.rotation.z = Math.PI / 2; mk.rotation.y = i; }); return g; }
  function awardShelf() { const g = G('CMO_AwardShelf'); wallShelf(g, 1.1, M.woodD); const mg = mesh(g, 'megaphone', new THREE.CylinderGeometry(0.09, 0.03, 0.22, 20, 1, true), M.gold, -0.35, 0.14, 0.14); mg.material.side = THREE.DoubleSide; mg.rotation.z = 0.8;
    B(g, 'plaque', 0.26, 0.3, 0.03, M.woodL, 0.05, 0.025, 0.12, 0.01); B(g, 'plaque_gold', 0.16, 0.14, 0.01, M.gold, 0.05, 0.12, 0.14, 0.004); [[0.3, M.red], [0.42, M.coral], [0.36, M.dark]].forEach(([x, m], i) => B(g, 'award_block', 0.1, 0.1, 0.1, m, x, 0.025 + (i === 2 ? 0.1 : 0), 0.14, 0.015)); return g; }

  // ========== COO / OPERATIONS
  function cooDesk() { const g = G('COO_OperationsDesk'); const T = desk(g, { w: 1.5, d: 0.75, top: M.woodL, body: M.skyblue, trim: M.steel });
    panel(g, 'blueprint', 0.7, 0.45, ctex(256, 160, (x, w, h) => { x.fillStyle = '#2f6fb0'; x.fillRect(0, 0, w, h); x.strokeStyle = '#cfe6ff'; x.lineWidth = 3; x.strokeRect(20, 20, 120, 80); x.strokeRect(150, 50, 80, 90); x.beginPath(); x.moveTo(20, 130); x.lineTo(140, 130); x.stroke(); }), 0, T + 0.004, 0.05).rotation.x = -Math.PI / 2;
    const tb = B(g, 'tablet', 0.22, 0.012, 0.16, M.dark, 0.55, T, 0.1, 0.006); vase(g, -0.6, T, -0.15, 0.8, M.cream); B(g, 'walkie', 0.06, 0.16, 0.04, M.black, 0.55, T, -0.2, 0.01);
    officeChair(g, M.skyblue, 0, -0.75, 0); return g; }
  function kpiBoard() { const g = G('COO_KPIBoard'); stand(g, 1.4, 0.85, TX.whiteboard('OEE & CHUỖI CUNG ỨNG', 'oee'), M.steel); return g; }
  function palletRack() { const g = G('COO_PalletRack'); const W = 2.2, H = 2.0, D = 0.6;
    for (const sx of [-1, 0, 1]) for (const sz of [-1, 1]) B(g, 'upright', 0.06, H, 0.06, M.blue, sx * W / 2, 0, sz * D / 2, 0.01);
    [0.05, 0.75, 1.45].forEach((y, lv) => { for (const sz of [-1, 1]) B(g, 'beam', W + 0.06, 0.07, 0.05, M.orange, 0, y + 0.1, sz * D / 2, 0.01);
      for (const sx of [-0.55, 0.55]) { pallet(g, sx, y + 0.17, 0, 0).scale.set(0.8, 0.6, 0.5);
        if (lv < 2) { crate(g, 0.36, sx - 0.2, y + 0.26, 0.02); crate(g, 0.36, sx + 0.2, y + 0.26, 0.02, 0.1); if (lv === 0) crate(g, 0.32, sx, y + 0.55, 0.02, -0.2); }
        else { vase(g, sx - 0.2, y + 0.26, 0, 1.2); vase(g, sx + 0.15, y + 0.26, 0.05, 1.0, M.cream); vase(g, sx + 0.1, y + 0.26, -0.12, 0.9, mat(0x6f9bb0)); } } }); return g; }
  function palletJack() { const g = G('COO_PalletJack'); pallet(g, 0.5, 0, 0); pallet(g, 0.5, 0.13, 0, 0.05); pallet(g, 0.5, 0.26, 0, -0.04);
    const j = G('jack', g, -0.6, 0, 0); for (const z of [-0.2, 0.2]) B(j, 'fork', 1.0, 0.06, 0.16, M.orange, -0.1, 0.04, z, 0.02); B(j, 'jack_body', 0.2, 0.28, 0.5, M.orange, -0.65, 0.04, 0, 0.04);
    const h = Cy(j, 'handle', 0.02, 0.02, 1.0, M.dark, -0.72, 0.3, 0, 10); h.rotation.z = 0.35; B(j, 'grip', 0.06, 0.06, 0.3, M.dark, -1.05, 1.24, 0, 0.02);
    for (let i = 0; i < 2; i++) for (let k = 0; k < 2; k++) crate(j, 0.4, -0.35 + i * 0.44, 0.1 + 0, -0.2 + k * 0.42, 0);
    j.children.filter(o => o.name === 'box').forEach((c, i) => { c.position.y = 0.1; }); return g; }
  function packBench() { const g = G('COO_PackingBench'); const T = desk(g, { w: 1.6, d: 0.75, h: 0.85, top: M.woodL, body: M.blue, exec: false });
    B(g, 'lower_shelf', 1.5, 0.03, 0.65, M.woodL, 0, 0.18, 0, 0.008); crate(g, 0.32, -0.4, 0.21, 0); crate(g, 0.32, 0.1, 0.21, 0);
    const sc = G('scale', g, -0.5, T, 0); B(sc, 'scale_base', 0.3, 0.06, 0.28, M.white, 0, 0, 0, 0.02); B(sc, 'scale_plate', 0.26, 0.015, 0.24, M.steel, 0, 0.06, 0, 0.005); B(sc, 'scale_disp', 0.14, 0.12, 0.03, M.dark, 0, 0.07, -0.13, 0.01);
    Cy(g, 'tape_roll', 0.06, 0.06, 0.05, M.sand, 0.0, T, -0.1, 20); for (let i = 0; i < 3; i++) Cy(g, 'wrap_roll', 0.07, 0.07, 0.3, M.white, 0.4 + i * 0.15, T, -0.15, 20);
    B(g, 'scanner', 0.06, 0.14, 0.08, M.dark, 0.6, T, 0.2, 0.02); crate(g, 0.36, 0.1, T, 0.1, 0.2); return g; }
  function cratesBarrels() { const g = G('COO_CrateBarrels'); const cr = G('crate', g, -0.5, 0, 0); B(cr, 'crate', 0.8, 0.5, 0.6, M.woodL, 0, 0, 0, 0.02); for (const y of [0.1, 0.3]) for (const s of [-1, 1]) B(cr, 'slat', 0.82, 0.08, 0.02, M.sand, 0, y, s * 0.31, 0.006);
    vase(cr, -0.2, 0.5, 0, 1.2, M.teal); vase(cr, 0.05, 0.5, 0.05, 1.3, M.purple); vase(cr, 0.25, 0.5, -0.05, 1.1, M.leaf); barrel(g, 0.35, 0, 0.1); barrel(g, 0.8, 0, -0.05, M.woodL);
    const sh = G('iso_shelf', g, 0.2, 0.95, -0.4); wallShelf(sh, 1.0, M.woodL); S(sh, 'hardhat', 0.1, M.yellow, -0.3, 0.05, 0.14).scale.y = 0.7; B(sh, 'iso_cert', 0.18, 0.22, 0.02, M.white, 0.3, 0.025, 0.1, 0.006); Tor(sh, 'gear_award', 0.07, 0.02, M.gold, 0, 0.12, 0.14); return g; }
  function potteryWheel() { const g = G('COO_PotteryWheel'); Cy(g, 'wheel_base', 0.35, 0.4, 0.4, M.greyD, 0, 0, 0, 36); Cy(g, 'wheel_basin', 0.42, 0.4, 0.1, M.grey, 0, 0.4, 0, 36); Cy(g, 'wheel_head', 0.25, 0.25, 0.04, M.steel, 0, 0.46, 0, 36);
    const v = vase(g, 0, 0.5, 0, 1.5, M.terracotta, 'clay_on_wheel'); v.userData.spin = true; stool(g, 0, -0.62, 0.42); return g; }

  // ========== SEC / LEGAL
  function legalDesk() { const g = G('SEC_LegalDesk'); const T = desk(g, { w: 1.6, d: 0.8, top: M.sageD, body: M.sage, trim: M.woodD });
    laptop(g, 0, T, -0.05, 0, TX.code()); const gv = G('gavel', g, -0.55, T, 0.1); Cy(gv, 'sound_block', 0.08, 0.08, 0.03, M.woodD); const hd = Cy(gv, 'gavel_head', 0.04, 0.04, 0.16, M.woodD, 0, 0.06, 0); hd.rotation.z = Math.PI / 2; Cy(gv, 'gavel_handle', 0.012, 0.012, 0.22, M.woodL, 0.06, 0.06, 0.08, 8).rotation.x = Math.PI / 2;
    const sc = G('scales', g, 0.55, T, -0.15); Cy(sc, 'post', 0.012, 0.015, 0.34, M.gold, 0, 0, 0, 10); B(sc, 'beam', 0.3, 0.015, 0.015, M.gold, 0, 0.33, 0, 0.005); for (const s of [-1, 1]) Cy(sc, 'pan', 0.05, 0.04, 0.015, M.gold, s * 0.14, 0.22, 0, 16);
    B(g, 'law_books', 0.3, 0.12, 0.22, M.sand, 0.5, T, 0.15, 0.01); B(g, 'seal_stamp', 0.06, 0.08, 0.06, M.red, -0.3, T, 0.25, 0.02); officeChair(g, M.sage, 0, -0.8, 0); return g; }
  function lawBookcase() { const g = G('SEC_LawBookcase'); bookcase(g, { w: 1.3, h: 2.0, d: 0.4, m: M.sage, levels: 5, fill: 'book', colors: [M.woodD, M.terracotta, M.sageD, M.navy, M.sand] }); return g; }
  function riskBoard() { const g = G('SEC_RiskBoard'); stand(g, 1.4, 0.9, TX.whiteboard('MA TRẬN RỦI RO · RADAR TUÂN THỦ', 'risk'), M.woodL); return g; }
  function fileSafe() { const g = G('SEC_FilingCabinet'); B(g, 'cabinet', 1.0, 0.95, 0.5, M.sageD, 0, 0, 0, 0.03); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { B(g, 'drawer', 0.28, 0.25, 0.02, M.sage, -0.32 + c * 0.32, 0.06 + r * 0.3, 0.255, 0.01); B(g, 'label', 0.1, 0.04, 0.01, M.cream, -0.32 + c * 0.32, 0.22 + r * 0.3, 0.27, 0.003); }
    B(g, 'open_drawer', 0.28, 0.25, 0.4, M.sage, 0.32, 0.36, 0.45, 0.01); books(g, 0.32, 0.4, 0.45, 0.24, [M.cream, M.sand], 'book'); B(g, 'lock', 0.06, 0.08, 0.03, M.gold, 0, 0.84, 0.27, 0.01);
    for (let i = 0; i < 2; i++) B(g, 'box_file', 0.36, 0.1, 0.28, M.sand, -0.2 + i * 0.05, 0.95 + i * 0.1, 0, 0.01); return g; }
  function stampTable() { const g = G('SEC_StampTable'); Cy(g, 'table_top', 0.42, 0.42, 0.05, M.wood, 0, 0.72, 0, 36); Cy(g, 'table_stem', 0.05, 0.06, 0.66, M.woodD, 0, 0.06, 0, 14); Cy(g, 'table_foot', 0.25, 0.28, 0.06, M.woodD, 0, 0, 0, 30);
    B(g, 'felt', 0.5, 0.005, 0.36, mat(0x3f7a52), 0, 0.77, 0, 0.002); B(g, 'contract', 0.2, 0.004, 0.28, M.white, -0.08, 0.776, 0, 0.001);
    const pr = G('stamp_press', g, 0.14, 0.77, -0.02); B(pr, 'press_base', 0.14, 0.03, 0.18, M.greyD, 0, 0, 0, 0.01); B(pr, 'press_body', 0.07, 0.18, 0.08, M.greyD, 0, 0.03, -0.05, 0.02); Cy(pr, 'press_lever', 0.012, 0.012, 0.25, M.steel, 0, 0.2, 0.05, 8).rotation.x = 1.1; return g; }
  function consultChairs() { const g = G('SEC_ConsultChairs'); armchair(g, M.sage, -0.6, 0, 0.45); armchair(g, M.sage, 0.6, 0, -0.45); coffeeTable(g, 0, 0.5, 0.5, 0.4, M.woodL, M.woodD); L(g, 'water_jug', [[0, 0], [0.05, 0], [0.06, 0.12], [0.04, 0.18], [0, 0.18]], M.glass, 0, 0.43, 0.5); cup(g, 0.14, 0.43, 0.45); return g; }

  // ========== SHARED
  function sofaSet() { const g = G('Shared_Sofa'); const s = G('sofa', g); B(s, 'sofa_base', 1.9, 0.3, 0.8, M.terracotta, 0, 0.1, 0, 0.08); B(s, 'sofa_back', 1.9, 0.5, 0.22, M.terracotta, 0, 0.3, -0.32, 0.09); for (const x of [-1, 1]) B(s, 'sofa_arm', 0.22, 0.45, 0.8, M.terracotta, x * 0.9, 0.1, 0, 0.09); [-0.5, 0.5].forEach(x => B(s, 'cushion', 0.8, 0.12, 0.55, M.coral, x, 0.4, 0.05, 0.06)); [-0.55, 0.55].forEach(x => B(s, 'pillow', 0.36, 0.34, 0.12, M.pink, x, 0.52, -0.2, 0.08).rotation.x = -0.2);
    for (const x of [-0.85, 0.85]) for (const z of [-0.3, 0.3]) Cy(s, 'foot', 0.03, 0.025, 0.1, M.woodD, x, 0, z, 10);
    coffeeTable(g, 0, 0.95, 1.0, 0.5, M.terracotta, M.woodD); L(g, 'teapot', [[0, 0], [0.08, 0], [0.1, 0.06], [0.07, 0.12], [0.02, 0.13], [0.02, 0.15], [0, 0.15]], M.cream, -0.2, 0.43, 0.95); cup(g, 0.05, 0.43, 0.9, M.leaf); cup(g, 0.2, 0.43, 1.0, M.leaf); return g; }
  function waterCooler() { const g = G('Shared_WaterCooler'); B(g, 'cooler_body', 0.36, 0.95, 0.36, M.white, 0, 0, 0, 0.05); L(g, 'bottle', [[0, 0], [0.04, 0], [0.04, 0.05], [0.15, 0.1], [0.16, 0.35], [0.14, 0.4], [0, 0.42]], mat(0x5aa7e0, 0.2), 0, 0.95, 0).material.transparent = true;
    B(g, 'tap_panel', 0.2, 0.14, 0.04, M.steel, 0, 0.62, 0.18, 0.01); S(g, 'tap_hot', 0.02, mat(0xd6453a), -0.05, 0.66, 0.21); S(g, 'tap_cold', 0.02, M.blue, 0.05, 0.66, 0.21); return g; }
  function plants() { const g = G('Shared_Plants'); plant(g, -0.35, 0, 1.1, M.terracotta, 'tall'); plant(g, 0.35, 0, 1.0, M.terracotta, 'bush'); return g; }
  function flipchart() { const g = G('Shared_Flipchart'); for (const [x, z, rz] of [[-0.3, 0.15, 0.12], [0.3, 0.15, -0.12], [0, -0.3, 0]]) { const l = Cy(g, 'easel_leg', 0.02, 0.02, 1.6, M.woodL, x, 0, z, 8); l.rotation.set(z < 0 ? -0.2 : 0.08, 0, rz); }
    panel(g, 'flip_paper', 0.7, 0.9, TX.whiteboard('', ''), 0, 1.15, 0.12, 0).rotation.x = -0.08; B(g, 'flip_clip', 0.76, 0.05, 0.05, M.woodD, 0, 1.58, 0.14, 0.01); return g; }

  // ========== TEAM FLAGS
  const TEAMS = {
    star: { name: 'Đất Sét Mê Kông', short: 'Đội bạn', color: '#f39a33', base: 0x9a6a45, pole: 0x8a5a36, emblem: 'star' },
    wolf: { name: 'Alpha Dynamics', short: 'Alpha', color: '#e2622a', base: 0x7a6a5a, pole: 0x5f4a3a, emblem: '🐺' },
    elephant: { name: 'Mekong Ventures', short: 'Mekong', color: '#1f8fa6', base: 0x8a6a4e, pole: 0x6f6a5a, emblem: '🐘' },
    peacock: { name: 'Star Clay Co.', short: 'Star Clay', color: '#6a3fa8', base: 0xa0784e, pole: 0xb58a3a, emblem: '🦚' },
  };
  function emblemTex(t) {
    return ctex(512, 340, (x, w, h) => {
      x.fillStyle = t.color; x.fillRect(0, 0, w, h);
      let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 2200; i++) { x.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.07)'; x.fillRect(rnd() * w, rnd() * h, 3 + rnd() * 5, 2); }
      x.save(); x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 10; x.shadowOffsetY = 6;
      if (t.emblem === 'star') { x.fillStyle = '#f6efe4'; x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 44 : 104, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } x.closePath(); x.fill(); }
      else { x.fillStyle = 'rgba(255,255,255,.22)'; x.beginPath(); x.arc(w / 2, h / 2, 118, 0, 7); x.fill(); x.font = '170px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t.emblem, w / 2, h / 2 + 10); }
      x.restore();
    });
  }
  function teamFlag(key) {
    const t = TEAMS[key], g = G('Flag_' + key);
    L(g, 'flag_base', [[0, 0], [0.24, 0], [0.26, 0.05], [0.22, 0.12], [0.12, 0.16], [0, 0.17]], mat(t.base));
    Cy(g, 'flag_pole', 0.022, 0.028, 1.45, mat(t.pole), 0, 0.14, 0, 14);
    mesh(g, 'flag_finial', new THREE.ConeGeometry(0.035, 0.12, 14), key === 'peacock' ? M.gold : mat(t.pole), 0, 1.66, 0);
    const col = new THREE.Color(t.color).getHex();
    for (const y of [1.0, 1.52]) Cy(g, 'flag_collar', 0.032, 0.032, 0.04, mat(col), 0, y, 0, 14);
    const geo = new THREE.PlaneGeometry(0.95, 0.62, 24, 12); geo.translate(0.475 + 0.025, 0, 0);
    const cloth = mesh(g, 'flag_cloth', geo, new THREE.MeshStandardMaterial({ map: emblemTex(t), roughness: 0.95, side: THREE.DoubleSide, name: 'flag_' + key }), 0, 1.24, 0);
    g.userData.cloth = cloth; g.userData.orig = Float32Array.from(geo.attributes.position.array); g.userData.team = key;
    return g;
  }
  function waveFlag(f, t, amp = 1) {
    const c = f.userData.cloth; if (!c) return; const p = c.geometry.attributes.position, o = f.userData.orig;
    for (let i = 0; i < p.count; i++) { const x = o[i * 3], y = o[i * 3 + 1], k = x / 0.97; p.array[i * 3 + 2] = Math.sin(x * 6 - t * 3.2 + y * 1.5) * 0.07 * k * amp; p.array[i * 3 + 1] = y - k * k * 0.04 * amp + Math.sin(x * 5 - t * 3.2) * 0.012 * k; }
    p.needsUpdate = true; c.geometry.computeVertexNormals();
  }

  // ========== CREW (extra roster + accessories for bizon-characters.js)
  const crew = [
    { id: 'potter', label: 'Thợ gốm', name: 'Nghệ nhân gốm', skin: 0xe8b08c, hair: 0xe0a882, hairStyle: 'none', hairCap: 0.3, top: 0xd0674a, bottom: 0x5f7fa6, shoe: 0xd9a13a, shortSleeve: true, acc: ['mustache', 'overalls'] },
    { id: 'worker', label: 'Thủ kho', name: 'Nhân viên kho vận', skin: 0x9c6444, hair: 0x2b1d15, hairStyle: 'short', hairCap: 0.4, top: 0x3a3f47, bottom: 0x4f6f9a, shoe: 0x5a3a26, acc: ['hardhat', 'vest'] },
    { id: 'accountant', label: 'Kế toán', name: 'Kế toán viên', skin: 0xe8b08c, hair: 0x8a5a38, hairStyle: 'short', hairCap: 0.44, top: 0xf1ece0, bottom: 0x4f6f9a, shoe: 0x5a3a26, tie: 0x3f78c0, shirtFront: 0xf1ece0, acc: ['sweatervest'] },
    { id: 'designer', label: 'Thiết kế', name: 'Nhà thiết kế', skin: 0xebb592, hair: 0x5a3a26, hairStyle: 'short', hairCap: 0.4, top: 0xeadcc9, bottom: 0x5a4636, shoe: 0xd9a13a, glasses: 0x2b2320, acc: ['beanie'] },
    { id: 'scientist', label: 'Nghiên cứu', name: 'Kỹ sư R&D', skin: 0x7a4e34, hair: 0x1f1510, hairStyle: 'short', hairCap: 0.42, top: 0xf4f4f0, bottom: 0x4a4f6a, shoe: 0x3a3634, jacket: true, acc: ['goggles', 'labcoat'] },
    { id: 'clerk', label: 'Pháp chế', name: 'Chuyên viên pháp chế', skin: 0xe6ad88, hair: 0x3a2418, hairStyle: 'bun', top: 0x8fa77e, bottom: 0x7f976e, shoe: 0x5a4636, collar: 0x8fa77e, pose: 'clipboard', prop: 'clipboard', acc: [] },
    { id: 'streamer', label: 'Livestream', name: 'Nhân viên livestream', skin: 0xe8b08c, hair: 0x7a4a2a, hairStyle: 'short', hairCap: 0.42, smile: 'open', top: 0xe0674a, bottom: 0x4f6f9a, shoe: 0xf1ede4, shortSleeve: true, pose: 'megaphone', prop: 'megaphone', acc: [] },
  ];
  function dress(ch, kinds = []) {
    const r = ch.userData.rig; if (!r) return;
    for (const k of kinds) {
      if (k === 'hardhat' || k === 'beanie') ['hair_quiff', 'hair_cap'].forEach(n => { const h = r.head.getObjectByName(n); if (h) h.visible = false; });
      if (k === 'hardhat') { S(r.head, 'hardhat', 0.165, M.yellow, 0, 0.05, -0.005).scale.set(1, 0.85, 1.02); r.head.getObjectByName('hardhat').geometry = new THREE.SphereGeometry(0.165, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2); Cy(r.head, 'hardhat_brim', 0.19, 0.19, 0.018, M.yellow, 0, 0.04, 0.02, 28); }
      if (k === 'beanie') { const b = mesh(r.head, 'beanie', new THREE.SphereGeometry(0.155, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xc86a3a), 0, 0.035, -0.01); b.scale.set(1, 1.15, 1); Tor(r.head, 'beanie_cuff', 0.148, 0.022, mat(0xc86a3a), 0, 0.045, -0.01).rotation.x = Math.PI / 2; }
      if (k === 'goggles') { for (const s of [-1, 1]) Tor(r.head, 'goggle', 0.035, 0.009, mat(0x9fd6e6, 0.2), s * 0.05, 0.02, 0.13); Tor(r.head, 'goggle_band', 0.148, 0.01, M.dark, 0, 0.02, 0).rotation.x = Math.PI / 2; }
      if (k === 'mustache') { for (const s of [-1, 1]) { const m = mesh(r.head, 'mustache', new THREE.CapsuleGeometry(0.014, 0.035, 6, 10), mat(0x5a3a26), s * 0.026, -0.035, 0.132); m.rotation.z = Math.PI / 2 + s * 0.35; } for (const s of [-1, 1]) S(r.head, 'side_hair', 0.05, mat(0x6a5040), s * 0.12, 0.02, -0.04).scale.set(0.5, 0.9, 1); }
      if (k === 'vest' || k === 'sweatervest' || k === 'overalls' || k === 'labcoat') {
        const col = { vest: 0xd8e04a, sweatervest: 0xc9b48a, overalls: 0x5f7fa6, labcoat: 0xf8f8f4 }[k];
        const v = mesh(r.torso, k, new THREE.CapsuleGeometry(0.124, 0.12, 8, 20), mat(col), 0, k === 'overalls' ? -0.04 : 0, 0); v.scale.set(1, k === 'overalls' ? 0.75 : 0.94, 0.78);
        if (k === 'vest') for (const y of [-0.02, 0.06]) Tor(r.torso, 'reflect', 0.121, 0.008, mat(0xd8dde2, 0.3), 0, y, 0).rotation.x = Math.PI / 2;
        if (k === 'labcoat') mesh(r.torso, 'coat_tail', new THREE.CylinderGeometry(0.13, 0.16, 0.28, 24, 1, true), mat(col), 0, -0.2, 0).material.side = THREE.DoubleSide;
      }
    }
  }

  const depts = [
    { id: 'ceo', label: 'CEO · Điều hành', color: '#2c3552' }, { id: 'rnd', label: 'R&D Lab', color: '#3f78c0' }, { id: 'cfo', label: 'CFO · Tài chính', color: '#6f7f95' },
    { id: 'cmo', label: 'CMO · Sáng tạo', color: '#e4876a' }, { id: 'coo', label: 'COO · Vận hành', color: '#2f8a8c' }, { id: 'sec', label: 'SEC · Pháp chế', color: '#6f8a60' },
    { id: 'shared', label: 'Dùng chung', color: '#c8643a' }, { id: 'flags', label: 'Cờ đội', color: '#f39a33' },
  ];
  const I = (id, dept, label, build) => ({ id, dept, label, build });
  const items = [
    I('ceoDesk', 'ceo', 'Bàn CEO', ceoDesk), I('trophyCabinet', 'ceo', 'Tủ cúp & giải thưởng', trophyCabinet), I('visionMap', 'ceo', 'Bản đồ tầm nhìn & máy chiếu 3D', visionMap), I('vipLounge', 'ceo', 'Ghế VIP & bàn trà', vipLounge), I('execVault', 'ceo', 'Két sắt điều hành', execVault), I('bonsai', 'ceo', 'Cây bonsai', bonsai), I('grandClock', 'ceo', 'Đồng hồ cây', grandClock),
    I('printer3d', 'rnd', 'Máy in 3D đất sét', printer3d), I('labBench', 'rnd', 'Bàn thí nghiệm vật liệu', labBench), I('holoStation', 'rnd', 'Trạm phân tích hologram', holoStation), I('formulaBoard', 'rnd', 'Bảng công thức & sáng chế', formulaBoard), I('kiln', 'rnd', 'Lò nung gốm', kiln), I('materialRack', 'rnd', 'Kệ vật liệu', materialRack), I('rover', 'rnd', 'Robot & drone cảm biến', rover),
    I('cfoDesk', 'cfo', 'Bàn CFO', cfoDesk), I('goldVault', 'cfo', 'Két vàng', goldVault), I('ledgerCabinet', 'cfo', 'Tủ sổ sách & biểu đồ hòa vốn', ledgerCabinet), I('receiptPrinter', 'cfo', 'Máy in hóa đơn', receiptPrinter), I('moneyPallet', 'cfo', 'Túi tiền & cân', moneyPallet), I('piggyShelf', 'cfo', 'Kệ heo đất & kiểm toán', piggyShelf),
    I('creativeDesk', 'cmo', 'Bàn sáng tạo', creativeDesk), I('moodboard', 'cmo', 'Bảng ý tưởng chiến dịch', moodboard), I('streamDesk', 'cmo', 'Bàn livestream & podcast', streamDesk), I('billboards', 'cmo', 'Mô hình billboard', billboards), I('photoStation', 'cmo', 'Góc chụp sản phẩm', photoStation), I('beanbags', 'cmo', 'Góc brainstorm', beanbags), I('awardShelf', 'cmo', 'Kệ giải thưởng', awardShelf),
    I('cooDesk', 'coo', 'Bàn COO', cooDesk), I('kpiBoard', 'coo', 'Bảng OEE & chuỗi cung ứng', kpiBoard), I('palletRack', 'coo', 'Kệ pallet kho', palletRack), I('palletJack', 'coo', 'Xe nâng tay & pallet', palletJack), I('packBench', 'coo', 'Bàn đóng gói & QC', packBench), I('cratesBarrels', 'coo', 'Thùng gốm & thùng tròn', cratesBarrels), I('potteryWheel', 'coo', 'Bàn xoay gốm', potteryWheel),
    I('legalDesk', 'sec', 'Bàn pháp chế', legalDesk), I('lawBookcase', 'sec', 'Tủ sách luật', lawBookcase), I('riskBoard', 'sec', 'Bảng ma trận rủi ro', riskBoard), I('fileSafe', 'sec', 'Tủ hồ sơ chống cháy', fileSafe), I('stampTable', 'sec', 'Bàn ký hợp đồng', stampTable), I('consultChairs', 'sec', 'Ghế tư vấn', consultChairs),
    I('sofaSet', 'shared', 'Sofa & bàn trà', sofaSet), I('waterCooler', 'shared', 'Cây nước', waterCooler), I('plants', 'shared', 'Chậu cây', plants), I('flipchart', 'shared', 'Bảng lật', flipchart),
    ...Object.keys(TEAMS).map(k => I('flag_' + k, 'flags', 'Cờ ' + TEAMS[k].name, () => teamFlag(k))),
  ];
  const products = makeProducts(THREE, { B, Cy, G, S, mesh, mat, ctex, panel });
  depts.splice(depts.length - 2, 0, products.dept); items.push(...products.items);
  const build = id => items.find(i => i.id === id).build();
  return { items, depts, TEAMS, build, teamFlag, waveFlag, dress, crew, TX, panel, plant, B, Cy, G, S, mesh, M, mat, ctex, bulbMat };
}
