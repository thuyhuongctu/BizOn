// BizOn Go Global — sản phẩm & bao bì xuất khẩu (clay 3D). Built on bizon-hq-kit helpers.
// makeProducts(THREE, hq) → { items: [{id, dept:'products', label, build}] }
import { makeMascots } from './bizon-mascots.js';
export function makeProducts(THREE, hq) {
  const { B, Cy, G, S, mesh, mat, ctex, panel } = hq;
  const MS = makeMascots(THREE, hq);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const FONT = '"Baloo 2","Be Vietnam Pro",system-ui,sans-serif';
  const C = {
    terra: mat(0xc9754a, 0.8), terraD: mat(0xa85c38, 0.85), celadon: mat(0x7fb89a, 0.28), creamGlaze: mat(0xf1e6cf, 0.3),
    lotus: mat(0xef9ab6, 0.6), lotusL: mat(0xf8cbd9, 0.6), lotusC: mat(0xf2c64e, 0.6), leaf: mat(0x6fa36a, 0.55), leafD: mat(0x4f8a55, 0.6),
    dragon: mat(0x2f9a78, 0.45), dragonL: mat(0x9fd8b8, 0.5), horn: mat(0xf2e6c8, 0.5), eyeW: mat(0xffffff, 0.3), ink: mat(0x1d1a18, 0.3),
    rosewood: mat(0x5a2a1c, 0.55), rosewoodD: mat(0x3e1c12, 0.6), gold: mat(0xd6ad55, 0.35, 0.6), paper: mat(0xf1e6cc, 0.95),
    box: mat(0xeee3cc, 0.92), boxIn: mat(0xe6d8bc, 0.95), satin: mat(0x1d6b48, 0.32, 0.05), emerald: mat(0x1f5a43, 0.7),
    wax: mat(0xb8282a, 0.45), red: mat(0xd23a2e, 0.55), star: mat(0xf4d23c, 0.5), white: mat(0xf6f3ec, 0.6),
    crate: mat(0xc98a52, 0.9), crateD: mat(0xa06a3a, 0.9), strap: mat(0x2f7a4a, 0.8), kraft: mat(0xc49a66, 0.95), pulp: mat(0xd2a870, 0.98),
  };
  const lathe = (p, n, pts, m, y = 0, seg = 40) => mesh(p, n, new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), seg), m, 0, y, 0);
  const onSurface = (o, nrm) => o.quaternion.setFromUnitVectors(V(0, 1, 0), nrm.clone().normalize());
  const label = (g, l, r) => { g.userData.label = l; g.userData.role = r; return g; };
  const txt = (w, h, bg, draw) => ctex(w, h, (x, W, H) => { if (bg) { x.fillStyle = bg; x.fillRect(0, 0, W, H); } x.textAlign = 'center'; x.textBaseline = 'middle'; draw(x, W, H); });
  const font = (x, s, w = 800) => x.font = `${w} ${s}px ${FONT}`;

  // ---------- pieces
  function lotus(p, pos, nrm, s = 1) {
    const g = G('lotus_flower', p); g.position.copy(pos); onSurface(g, nrm); g.scale.setScalar(s);
    for (let i = 0; i < 8; i++) { const pv = G('petal_pivot', g); pv.rotation.y = -i / 8 * Math.PI * 2; const pe = S(pv, 'lotus_petal', 0.022, i % 2 ? C.lotusL : C.lotus, 0.02, 0.012, 0); pe.scale.set(0.26, 1, 0.5); pe.rotation.z = -0.95; }
    for (let i = 0; i < 5; i++) { const pv = G('petal_pivot', g); pv.rotation.y = -i / 5 * Math.PI * 2 - 0.3; const pe = S(pv, 'lotus_petal_in', 0.018, C.lotusL, 0.009, 0.02, 0); pe.scale.set(0.3, 1, 0.55); pe.rotation.z = -0.4; }
    S(g, 'lotus_seedpod', 0.008, C.lotusC, 0, 0.03, 0);
    return g;
  }
  function leaf(p, pos, nrm, s = 1) { const l = S(p, 'lotus_leaf', 0.045 * s, C.leaf, pos.x, pos.y, pos.z); onSurface(l, nrm); l.scale.set(1, 0.14, 0.8); return l; }
  function dragonHead(p, pos, ry, s = 1) {
    const h = G('dragon_head', p); h.position.copy(pos); h.rotation.y = ry; h.scale.setScalar(s);
    S(h, 'dragon_skull', 0.03, C.dragon).scale.set(1, 0.88, 1.15);
    S(h, 'dragon_snout', 0.022, C.dragon, 0, -0.006, 0.03).scale.set(1.05, 0.72, 1.1);
    S(h, 'dragon_jaw', 0.017, C.dragonL, 0, -0.018, 0.026).scale.set(0.95, 0.5, 1.1);
    for (const sx of [-1, 1]) {
      S(h, 'dragon_eye', 0.009, C.eyeW, sx * 0.017, 0.012, 0.02); S(h, 'dragon_pupil', 0.0045, C.ink, sx * 0.019, 0.012, 0.028);
      S(h, 'dragon_nostril', 0.0035, C.ink, sx * 0.008, 0.002, 0.052);
      const hn = mesh(h, 'dragon_horn', new THREE.ConeGeometry(0.006, 0.035, 10), C.horn, sx * 0.013, 0.033, -0.012); hn.rotation.set(-0.7, 0, sx * -0.25);
      const w = mesh(h, 'dragon_whisker', new THREE.CapsuleGeometry(0.0025, 0.03, 4, 8), C.dragonL, sx * 0.022, -0.01, 0.04); w.rotation.set(0.3, 0, sx * 1.1);
    }
    for (let i = 0; i < 3; i++) { const m = mesh(h, 'dragon_mane', new THREE.ConeGeometry(0.009, 0.026, 8), C.dragonL, 0, 0.02 - i * 0.012, -0.028 - i * 0.008); m.rotation.x = -1.2; }
    return h;
  }
  function dragonBody(p, pts, r = 0.013) {
    const curve = new THREE.CatmullRomCurve3(pts), g = G('dragon_body', p);
    const taper = new THREE.TubeGeometry(curve, 90, r, 12, false);
    const pos = taper.attributes.position, n = 90, ring = 13;
    for (let i = 0; i <= n; i++) { const k = 0.35 + 0.65 * (i / n), c = curve.getPoint(i / n); for (let j = 0; j < ring; j++) { const idx = i * ring + j; const v = V(pos.getX(idx), pos.getY(idx), pos.getZ(idx)).sub(c).multiplyScalar(k).add(c); pos.setXYZ(idx, v.x, v.y, v.z); } }
    taper.computeVertexNormals(); mesh(g, 'dragon_coil', taper, C.dragon);
    for (let i = 2; i < 18; i++) { const t = i / 19, c = curve.getPoint(t), sp = mesh(g, 'dragon_spine', new THREE.ConeGeometry(r * 0.5, r * 1.3, 8), C.dragonL, c.x, c.y + r * (0.35 + 0.65 * t) * 0.9, c.z); sp.rotation.z = 0.2; }
    return curve;
  }
  function vaseBody(p, s = 1) {
    const g = G('vase_sasa', p); g.scale.setScalar(s);
    const prof = [[0, 0.004], [0.07, 0], [0.098, 0.025], [0.125, 0.085], [0.122, 0.15], [0.095, 0.2], [0.058, 0.236], [0.05, 0.27], [0.062, 0.302], [0.074, 0.316], [0.066, 0.322], [0.048, 0.3], [0.04, 0.26]];
    lathe(g, 'vase_body', prof, C.terra);
    lathe(g, 'vase_celadon_glaze', [[0.086, 0.212], [0.062, 0.237], [0.053, 0.27], [0.065, 0.302], [0.077, 0.317], [0.068, 0.324], [0.05, 0.302]], C.celadon);
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, d = S(g, 'glaze_drip', 0.012, C.creamGlaze, Math.cos(a) * 0.084, 0.21 - (i % 3) * 0.007, Math.sin(a) * 0.084); d.scale.set(1.1, 1.3, 0.5); d.lookAt(V(Math.cos(a), 0.19, Math.sin(a)).multiplyScalar(2)); }
    mesh(g, 'vase_mouth', new THREE.CircleGeometry(0.05, 28), C.creamGlaze, 0, 0.3, 0).rotation.x = -Math.PI / 2;
    Cy(g, 'vase_foot', 0.075, 0.07, 0.012, C.terraD, 0, 0, 0, 32);
    const R = 0.124;
    [[Math.PI / 2 - 0.35, 0.115, 1], [Math.PI / 2 + 0.55, 0.085, 0.85], [Math.PI / 2 + 2.3, 0.1, 0.9], [-0.6, 0.1, 0.9]].forEach(([a, y, sc]) => { const n = V(Math.cos(a), 0.15, Math.sin(a)); lotus(g, V(Math.cos(a) * R, y, Math.sin(a) * R), n, sc * 1.5); });
    [[Math.PI / 2 + 0.95, 0.06], [Math.PI / 2 - 0.9, 0.055], [Math.PI + 0.9, 0.07]].forEach(([a, y]) => leaf(g, V(Math.cos(a) * 0.122, y, Math.sin(a) * 0.122), V(Math.cos(a), 0.1, Math.sin(a)), 1));
    for (const [a, y] of [[Math.PI / 2 - 0.35, 0.115], [Math.PI / 2 + 0.55, 0.085]]) { const st = mesh(g, 'lotus_stem', new THREE.CapsuleGeometry(0.004, 0.06, 4, 8), C.leafD, Math.cos(a) * 0.125, y - 0.045, Math.sin(a) * 0.125); st.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3); }
    return g;
  }
  function vaseDragon(g, s = 1) {
    const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12, a = -0.2 + t * 4.6, R = 0.132 - 0.062 * t, y = 0.15 + 0.095 * t; pts.push(V(Math.cos(a) * R * s, y * s, Math.sin(a) * R * s)); }
    const last = pts[pts.length - 1]; pts.push(V(last.x * 1.25, 0.28 * s, last.z * 1.25 + 0.01 * s), V(last.x * 1.35, 0.33 * s, last.z * 1.2 + 0.02 * s));
    dragonBody(g, pts, 0.014 * s);
    const hp = pts[pts.length - 1]; dragonHead(g, V(hp.x, hp.y + 0.02 * s, hp.z + 0.01 * s), 0.9, s);
  }
  function woodStand(p, r = 0.17) {
    const g = G('rosewood_stand', p);
    Cy(g, 'stand_base', r, r + 0.012, 0.04, C.rosewood, 0, 0.012, 0, 48); Cy(g, 'stand_top', r - 0.015, r - 0.005, 0.018, C.rosewoodD, 0, 0.052, 0, 48);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; S(g, 'stand_foot', 0.022, C.rosewoodD, Math.cos(a) * (r - 0.02), 0.014, Math.sin(a) * (r - 0.02)).scale.set(1, 0.7, 1); }
    return g;
  }
  function plaque(p, text, w, h, x, y, z, ry = 0, rx = 0) {
    const g = G('gold_plaque', p, x, y, z, ry); g.rotation.x = rx;
    B(g, 'plaque_plate', w, h, 0.006, C.gold, 0, -h / 2, 0, 0.002);
    panel(g, 'plaque_text', w * 0.94, h * 0.8, txt(512, Math.round(512 * h / w), '#d8b25c', (x, W, H) => { x.fillStyle = '#3a2a12'; font(x, H * 0.5, 700); x.fillText(text, W / 2, H * 0.55); }), 0, 0, 0.0035);
    return g;
  }

  // ---------- items
  function lotusDragonVase() {
    const g = label(G('PRD_LotusDragonVase'), 'Bình gốm Sa Sa Mekong · Đội Rồng Xanh', 'Gốm đỏ Cần Thơ · sen đắp nổi & rồng men ngọc · 150.000đ');
    woodStand(g); const v = vaseBody(g); v.position.y = 0.062; vaseDragon(v);
    plaque(g, 'BizOn · Đội Rồng Xanh · 150.000đ', 0.2, 0.026, 0, 0.048, 0.178, 0, -0.08);
    return g;
  }
  function dragonMini(p, s = 1) { return MS.babyDragon(p, 'lotus', s * 0.3); }
  function dragonMiniOld(p, s = 1) {
    const g = G('dragon_figurine', p); g.scale.setScalar(s);
    const pts = [V(-0.07, 0.02, -0.02), V(-0.03, 0.018, 0.03), V(0.03, 0.02, 0.02), V(0.05, 0.03, -0.03), V(0.01, 0.05, -0.05), V(-0.02, 0.07, -0.02), V(-0.005, 0.1, 0.01)].reverse();
    dragonBody(g, pts, 0.02);
    dragonHead(g, V(0, 0.125, 0.025), 0, 1.25);
    for (const sx of [-1, 1]) S(g, 'dragon_claw', 0.012, C.dragonL, sx * 0.03, 0.01, 0.045).scale.set(1, 0.6, 1.3);
    const tail = mesh(g, 'dragon_tail_fin', new THREE.ConeGeometry(0.014, 0.04, 8), C.dragonL, -0.075, 0.03, -0.02); tail.rotation.z = 1.2;
    return g;
  }
  function dragonFigurine() { const g = label(G('PRD_DragonFigurine'), 'Linh vật Rồng Xanh', 'Rồng con đất sét ôm sen · BizOn Mekong 2026'); Cy(g, 'terra_base', 0.13, 0.14, 0.06, mat(0xd99a72, 0.9), 0, 0, 0, 40);
    panel(g, 'base_text', 0.2, 0.035, txt(512, 90, '#d99a72', (x, W, H) => { x.fillStyle = '#7a3a1e'; font(x, 52, 700); x.fillText('BizOn Mekong 2026', W / 2, H / 2 + 4); }), 0, 0.03, 0.141); MS.babyDragon(g, 'lotus', 0.5).position.y = 0.06; return g; }
  function kraftGiftSet() {
    const g = label(G('PRD_KraftGiftSet'), 'Hộp quà kraft · Tinh hoa Gốm Sa Sa Cần Thơ', 'OCOP 4 Sao · hũ gốm sen, rồng con, gương sen · 150.000đ');
    const kr = mat(0xc9a06a, 0.95), krD = mat(0xb08852, 0.95), twine = mat(0xa8804a, 0.95), W = 0.36, H = 0.13, D = 0.36, wt = 0.012;
    B(g, 'kraft_bottom', W, wt, D, kr, 0, 0, 0, 0.004);
    for (const [w, d, x, z] of [[W, wt, 0, D / 2], [W, wt, 0, -D / 2], [wt, D, W / 2, 0], [wt, D, -W / 2, 0]]) B(g, 'kraft_wall', w, H, d, kr, x, 0, z, 0.004);
    for (let i = 0; i < 90; i++) { const a = i * 2.39, r = 0.02 + (i % 13) / 13 * 0.14, st = mesh(g, 'straw', new THREE.CapsuleGeometry(0.003, 0.09, 3, 5), mat(0xe2c27a, 0.9), Math.cos(a) * r, 0.07 + (i % 5) * 0.008, Math.sin(a) * r); st.rotation.set(Math.PI / 2 + (i % 3 - 1) * 0.3, a, 0); }
    const jar = G('round_lotus_jar', g, -0.07, 0.07, 0.03); mesh(jar, 'jar', new THREE.SphereGeometry(0.075, 28, 20), mat(0xc9683e, 0.8)).scale.set(1, 0.9, 1); jar.children[0].position.y = 0.065; Cy(jar, 'jar_neck', 0.04, 0.045, 0.02, mat(0xb85a34, 0.8), 0, 0.125, 0, 24);
    for (const [a, y, sc] of [[Math.PI / 2, 0.08, 0.9], [Math.PI / 2 + 0.7, 0.06, 0.6], [Math.PI / 2 - 0.7, 0.07, 0.6]]) { const l = MS.lotusBloom(jar, sc); l.position.set(Math.cos(a) * 0.074, y, Math.sin(a) * 0.074); l.quaternion.setFromUnitVectors(V(0, 1, 0), V(Math.cos(a), 0.15, Math.sin(a)).normalize()); }
    const d = MS.babyDragon(g, 'wave', 0.36); d.position.set(0.08, 0.07, -0.03); d.rotation.y = -0.3;
    MS.lotusPod(g, 1).position.set(-0.08, 0.09, -0.12); const lp = MS.lotusPod(g, 0.9); lp.position.set(0.12, 0.085, 0.12); lp.rotation.z = 0.5;
    const lid = G('kraft_lid', g, -0.44, 0, -0.05, 0.25); B(lid, 'lid_top', W + 0.02, 0.03, D + 0.02, kr, 0, 0, 0, 0.005);
    const lt = panel(lid, 'lid_print', W - 0.01, D - 0.01, txt(512, 512, '#c9a06a', (x, Wc, Hc) => { x.fillStyle = '#3a2412'; x.save(); x.translate(Wc / 2, Hc * 0.64); for (let i = -2; i <= 2; i++) { x.save(); x.rotate(i * 0.42); x.beginPath(); x.ellipse(0, -70, 26, 70, 0, 0, Math.PI * 2); x.fill(); x.restore(); } x.restore(); x.fillStyle = '#d8b884'; x.fillRect(Wc * 0.2, 40, Wc * 0.6, 110); x.strokeStyle = '#8a5a30'; x.lineWidth = 4; x.strokeRect(Wc * 0.2 + 6, 46, Wc * 0.6 - 12, 98); x.fillStyle = '#7a3a1e'; font(x, 40); x.fillText('BizOn Bật Nghiệp', Wc / 2, 80); font(x, 20, 600); x.fillText('· Tinh hoa Gốm Sa Sa Cần Thơ ·', Wc / 2, 112); x.fillText('· OCOP 4 Sao', Wc / 2, 134); }), 0, 0.031, 0); lt.rotation.x = -Math.PI / 2;
    B(lid, 'twine', W + 0.024, 0.006, 0.008, twine, 0, 0.028, 0.1, 0.003); B(lid, 'twine', 0.008, 0.006, D + 0.024, twine, -0.12, 0.028, 0, 0.003);
    const seal = mesh(lid, 'wax_seal_star', new THREE.CylinderGeometry(0.026, 0.028, 0.01, 24), mat(0xb8282a, 0.45), -0.12, 0.038, 0.1); const st = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.006 : 0.015; i ? st.lineTo(Math.cos(a) * r, Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, Math.sin(a) * r); } const sm = mesh(lid, 'seal_star', new THREE.ExtrudeGeometry(st, { depth: 0.002, bevelEnabled: false }), mat(0xf4d23c, 0.5), -0.12, 0.044, 0.1); sm.rotation.x = -Math.PI / 2;
    const cert = G('artisan_certificate', g, -0.38, 0, 0.28, 0.3); B(cert, 'cert_card', 0.2, 0.008, 0.16, mat(0xe8cfa2, 0.9), 0, 0, 0, 0.004); const ct = panel(cert, 'cert_text', 0.19, 0.15, txt(380, 300, '#e8cfa2', (x, Wc) => { x.fillStyle = '#6a3a1e'; font(x, 28); ['Giấy Chứng Nhận', 'Nghệ Nhân Cần Thơ', '- Bảo trợ học thuật', 'Đại học Can Thơ'].forEach((t, i) => x.fillText(t, Wc / 2, 44 + i * 50)); font(x, 38); x.fillText('CTU', Wc / 2, 256); }), 0, 0.009, 0); ct.rotation.x = -Math.PI / 2;
    const tag = G('price_tag', g, -0.1, 0, 0.32, -0.2); B(tag, 'tag_card', 0.11, 0.006, 0.045, mat(0xe0c090, 0.9), 0, 0, 0, 0.004); const pt = panel(tag, 'tag_text', 0.1, 0.04, txt(256, 100, '#e0c090', (x, Wc, Hc) => { x.fillStyle = '#6a3a1e'; font(x, 52); x.fillText('150.000đ', Wc / 2, Hc / 2 + 4); }), 0, 0.007, 0); pt.rotation.x = -Math.PI / 2;
    return g;
  }
  function scroll(p, len = 0.24, r = 0.022, seal = 'gold') {
    const g = G('certificate_scroll', p);
    const t = txt(512, 128, '#f3ead6', (x, W, H) => { x.fillStyle = '#6a5a3a'; font(x, 22, 600); x.fillText('International Passport Certificate', W / 2, 40); font(x, 18, 500); x.fillText('Global Certificate of Authenticity · Handcrafted in Vietnam', W / 2, 76); x.strokeStyle = '#b89a5a'; x.lineWidth = 4; x.strokeRect(6, 6, W - 12, H - 12); });
    const body = mesh(g, 'scroll_roll', new THREE.CylinderGeometry(r, r, len, 28), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, name: 'scroll_paper' }), 0, r, 0); body.rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) mesh(g, 'scroll_end', new THREE.CylinderGeometry(r * 0.55, r * 0.55, 0.012, 20), C.paper, sx * (len / 2 + 0.004), r, 0).rotation.z = Math.PI / 2;
    const sm = seal === 'gold' ? C.gold : C.wax;
    mesh(g, 'scroll_band', new THREE.TorusGeometry(r + 0.002, 0.004, 8, 28), sm, 0, r, 0).rotation.y = Math.PI / 2;
    const sd = mesh(g, 'wax_seal', new THREE.CylinderGeometry(0.02, 0.022, 0.008, 24), sm, 0, r, r + 0.004); sd.rotation.x = Math.PI / 2;
    if (seal === 'gold') for (const sx of [-1, 1]) { const rb = B(g, 'ribbon_tail', 0.014, 0.06, 0.003, C.gold, sx * 0.012, r - 0.055, r + 0.004, 0.001); rb.rotation.z = sx * 0.3; }
    return g;
  }
  function pins(p) {
    const g = G('enamel_pins', p);
    const s = new THREE.Shape(); [[0.004, 0.05], [0.014, 0.046], [0.01, 0.034], [0.018, 0.022], [0.024, 0.006], [0.026, -0.012], [0.018, -0.03], [0.004, -0.046], [-0.006, -0.042], [0.006, -0.026], [0.012, -0.01], [0.008, 0.008], [0.0, 0.024], [-0.006, 0.042]].forEach(([a, b], i) => i ? s.lineTo(a, b) : s.moveTo(a, b));
    const vn = mesh(g, 'pin_vietnam_map', new THREE.ExtrudeGeometry(s, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2 }), C.red, -0.06, 0.004, 0); vn.rotation.x = -Math.PI / 2;
    B(g, 'pin_flag', 0.05, 0.008, 0.034, C.red, 0, 0, 0, 0.004);
    const st = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 0.0055 : 0.013; i ? st.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : st.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    const sm = mesh(g, 'pin_flag_star', new THREE.ExtrudeGeometry(st, { depth: 0.002, bevelEnabled: false }), C.star, 0, 0.0085, 0); sm.rotation.x = -Math.PI / 2;
    B(g, 'pin_bizon', 0.06, 0.008, 0.026, C.white, 0.065, 0, 0.005, 0.004);
    const bt = panel(g, 'pin_bizon_text', 0.054, 0.02, txt(256, 96, '#f6f3ec', (x, W, H) => { x.fillStyle = '#2c3552'; font(x, 64); x.fillText('BizOn', W / 2, H / 2 + 4); }), 0.065, 0.0085, 0.005); bt.rotation.x = -Math.PI / 2;
    return g;
  }
  function boxShell(p, W, H, D, wt = 0.012) {
    B(p, 'box_bottom', W, 0.012, D, C.box, 0, 0, 0, 0.004);
    B(p, 'box_wall_f', W, H, wt, C.box, 0, 0, D / 2 - wt / 2, 0.004); B(p, 'box_wall_b', W, H, wt, C.box, 0, 0, -D / 2 + wt / 2, 0.004);
    for (const sx of [-1, 1]) B(p, 'box_wall_s', wt, H, D, C.box, sx * (W / 2 - wt / 2), 0, 0, 0.004);
  }
  function giftBoxOpen() {
    const g = label(G('PRD_GiftBoxOpen'), 'Hộp quà Go Global · Sa Sa Pottery', 'Hộp cứng kem, lót lụa xanh ngọc: bình sen, róng, chứng nhận');
    const W = 0.46, H = 0.13, D = 0.4; boxShell(g, W, H, D);
    const sg = new THREE.PlaneGeometry(W - 0.03, D - 0.03, 30, 26); sg.rotateX(-Math.PI / 2); const sp = sg.attributes.position;
    for (let i = 0; i < sp.count; i++) { const x = sp.getX(i), z = sp.getZ(i); sp.setY(i, Math.sin(x * 38 + z * 12) * 0.006 + Math.sin(z * 30 - x * 9) * 0.005 + Math.cos(x * 71) * 0.002); }
    sg.computeVertexNormals(); mesh(g, 'satin_lining', sg, C.satin, 0, 0.075, 0);
    for (const [x, z, sx, sz] of [[0, D / 2 - 0.03, W - 0.05, 0.04], [0, -D / 2 + 0.03, W - 0.05, 0.04], [W / 2 - 0.03, 0, 0.04, D - 0.05], [-W / 2 + 0.03, 0, 0.04, D - 0.05]]) S(g, 'satin_roll', 0.5, C.satin, x, 0.1, z).scale.set(sx, 0.05, sz);
    const lid = G('box_lid', g, 0, H, -D / 2); lid.rotation.x = -1.92;
    B(lid, 'lid_board', W + 0.012, 0.014, D + 0.012, C.box, 0, -0.007, D / 2, 0.004);
    for (const sx of [-1, 1]) B(lid, 'lid_lip', 0.01, 0.03, D, C.box, sx * (W / 2 + 0.001), -0.03, D / 2, 0.003);
    const lt = panel(lid, 'lid_inner_print', W - 0.02, D - 0.02, txt(512, 448, '#ece0c6', (x, Wc, Hc) => { x.fillStyle = '#b8903c'; font(x, 110); x.fillText('BIZON', Wc / 2, Hc * 0.36); font(x, 40, 700); x.fillText('GO GLOBAL · MEKONG', Wc / 2, Hc * 0.56); font(x, 34, 600); x.fillText('SA SA POTTERY', Wc / 2, Hc * 0.68); }), 0, -0.0145, D / 2);
    lt.rotation.set(Math.PI / 2, 0, 0);
    const v = vaseBody(g, 0.52); v.position.set(-0.1, 0.07, 0.04); v.rotation.set(0.05, 0.4, 0.28);
    const d = dragonMini(g, 0.75); d.position.set(0.11, 0.085, 0.02); d.rotation.y = -0.4;
    const sc = scroll(g, 0.2, 0.018, 'wax'); sc.position.set(0.02, 0.085, -0.11); sc.rotation.y = 0.3;
    plaque(g, 'Bilingual Texts Tags · Sa Sa 001', 0.13, 0.03, 0.12, 0.105, 0.14, -0.35, -1.0);
    return g;
  }
  function giftBoxClosed() {
    const g = label(G('PRD_GiftBoxClosed'), 'Hộp quà BizOn Go Global', 'Mekong Artisan Heritage · niêm phong sáp CTU');
    const W = 0.5, H = 0.13, D = 0.42;
    B(g, 'box_base', W, H, D, C.box, 0, 0, 0, 0.008); B(g, 'box_lid', W + 0.012, 0.055, D + 0.012, C.box, 0, H - 0.01, 0, 0.008);
    const top = panel(g, 'lid_print', W - 0.04, D - 0.04, txt(512, 432, '#efe4cc', (x, Wc, Hc) => {
      x.fillStyle = '#c29a44'; x.lineWidth = 16; x.strokeStyle = '#c29a44'; x.beginPath(); x.arc(Wc / 2 - 10, 110, 34, 0.3, Math.PI * 1.7); x.stroke(); x.beginPath(); x.arc(Wc / 2 + 22, 110, 24, Math.PI * 0.9, Math.PI * 2.6); x.stroke();
      font(x, 62); x.fillText('BizOn Go Global', Wc / 2, 200); font(x, 28, 600); x.fillText('· Mekong Artisan Heritage ·', Wc / 2, 256); x.fillText('Handcrafted in Cần Thơ, Việt Nam', Wc / 2, 296); x.fillText('+84', Wc / 2, 336); }), 0, H + 0.0455, 0);
    top.rotation.x = -Math.PI / 2;
    const seal = mesh(g, 'wax_seal_ctu', new THREE.CylinderGeometry(0.036, 0.04, 0.012, 28), C.wax, 0, H - 0.005, D / 2 + 0.01); seal.rotation.x = Math.PI / 2;
    panel(g, 'wax_seal_text', 0.05, 0.03, txt(128, 76, null, (x, Wc, Hc) => { x.fillStyle = '#e8b0a0'; font(x, 40); x.fillText('CTU', Wc / 2, Hc / 2 + 3); }), 0, H - 0.02, D / 2 + 0.017).material.transparent = true;
    return g;
  }
  function giftAccessories() {
    const g = label(G('PRD_ScrollPins'), 'Chứng nhận & huy hiệu', 'Cuộn chứng nhận niêm vàng · pin bản đồ, cờ đỏ sao vàng, BizOn');
    const s = scroll(g, 0.3, 0.028, 'gold'); s.rotation.y = 0.25; const p = pins(g); p.position.set(0.02, 0, 0.11); return g;
  }
  function crateFace(w, h, lines, side) {
    return ctex(1024, Math.round(1024 * h / w), (x, W, H) => {
      const tones = ['#c98a52', '#bf8048', '#d0925a', '#c4864e']; const n = side ? 5 : 6, ph = H / n;
      for (let i = 0; i < n; i++) { x.fillStyle = tones[i % 4]; x.fillRect(0, i * ph, W, ph); x.fillStyle = 'rgba(80,40,15,.45)'; x.fillRect(0, i * ph, W, 5); for (let k = 0; k < 8; k++) { x.strokeStyle = 'rgba(90,50,20,.15)'; x.lineWidth = 3; x.beginPath(); const y = i * ph + 14 + k * ph / 9; x.moveTo(0, y); x.bezierCurveTo(W * 0.3, y + 6, W * 0.6, y - 6, W, y + 3); x.stroke(); } }
      x.textAlign = 'center'; x.textBaseline = 'middle';
      lines.forEach(([t, y, sz, col]) => { x.fillStyle = col || '#2b1d12'; let f = sz; do { font(x, f); f -= 2; } while (x.measureText(t).width > W - 60 && f > 12); x.fillText(t, W / 2, y * H); });
    });
  }
  function exportCrate() {
    const g = label(G('PRD_ExportCrate'), 'Thùng gỗ xuất khẩu Go Global', 'Cần Thơ → Frankfurt / Tokyo / New York · hàng gốm dễ vỡ');
    const W = 1.1, H = 0.72, D = 0.78, P = 0.14;
    for (const z of [-D / 2 + 0.06, 0, D / 2 - 0.06]) B(g, 'pallet_runner', W, 0.1, 0.1, C.crateD, 0, 0, z, 0.01);
    for (let i = 0; i < 7; i++) B(g, 'pallet_deck', 0.13, 0.03, D, C.crate, -W / 2 + 0.065 + i * (W - 0.13) / 6, 0.1, 0, 0.006);
    B(g, 'crate_box', W - 0.02, H, D - 0.02, C.crate, 0, P, 0, 0.01);
    const front = crateFace(W, H, [['BIZON GO GLOBAL · CẦN THƠ → FRANKFURT / TOKYO / NEW YORK', 0.1, 54], ['INTERCONTINENTAL', 0.36, 64], ['AIR CARGO PRIORITY', 0.5, 64, '#a8281e'], ['FRAGILE – ARTISAN CERAMICS', 0.86, 60, '#a8281e']]);
    panel(g, 'crate_print_front', W - 0.04, H - 0.02, front, 0, P + H / 2, D / 2 - 0.0085);
    const side = crateFace(D, H, [['↑ THIS WAY UP ↑', 0.14, 70], ['↑ THIS WAY UP ↑', 0.86, 70], ['FRAGILE', 0.5, 90, '#a8281e']], true);
    for (const sx of [-1, 1]) panel(g, 'crate_print_side', D - 0.04, H - 0.02, side, sx * (W / 2 - 0.0085), P + H / 2, 0, sx * Math.PI / 2);
    const fr = (w, h, d, x, y, z) => B(g, 'crate_frame', w, h, d, C.crateD, x, y, z, 0.008);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) fr(0.06, H + 0.02, 0.06, sx * (W / 2 - 0.02), P - 0.01, sz * (D / 2 - 0.02));
    for (const y of [P - 0.01, P + H - 0.04]) { for (const sz of [-1, 1]) fr(W, 0.05, 0.05, 0, y, sz * (D / 2 - 0.015)); for (const sx of [-1, 1]) fr(0.05, 0.05, D, sx * (W / 2 - 0.015), y, 0); }
    for (const x of [-0.46, 0.46]) { B(g, 'strap_top', 0.05, 0.012, D + 0.01, C.strap, x, P + H, 0, 0.004); B(g, 'strap_front', 0.05, H, 0.012, C.strap, x, P, D / 2 + 0.002, 0.004); }
    [['#2a5aa8', 'IATA'], ['#4f9a52', 'ZERO'], ['#c9a878', 'IPPC']].forEach(([c, t], i) => { const b = panel(g, 'cert_badge', 0.085, 0.085, txt(128, 128, null, (x, Wc, Hc) => { x.fillStyle = c; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 6; x.stroke(); x.fillStyle = '#fff'; font(x, 34); x.fillText(t, 64, 68); }), 0.2 + i * 0.1, P + H - 0.19, D / 2 + 0.003); b.material.transparent = true; });
    const tag = G('aviation_tag', g, -0.3, P + H - 0.12, D / 2 + 0.01); tag.rotation.z = 0.06;
    B(tag, 'tag_card', 0.11, 0.2, 0.004, C.white, 0, -0.2, 0, 0.002);
    panel(tag, 'tag_print', 0.1, 0.18, txt(128, 232, '#f6f3ec', (x, Wc, Hc) => { x.fillStyle = '#2b2b2b'; font(x, 16); x.fillText('AVIATION TAG', Wc / 2, 44); for (let i = 0; i < 34; i++) x.fillRect(14 + i * 3, 80, (i * 7) % 3 + 1, 70); font(x, 13, 600); x.fillText('VN-GLOBAL 84', Wc / 2, 178); x.beginPath(); x.arc(64, 16, 7, 0, 7); x.fillStyle = '#b8282a'; x.fill(); }), 0, -0.1, 0.0025);
    const cb = G('shipping_clipboard', g, W / 2 + 0.12, 0, D / 2 - 0.1, -0.5); cb.rotation.x = -0.18;
    B(cb, 'clip_board', 0.26, 0.34, 0.012, mat(0x8a5a38), 0, 0.01, 0, 0.006);
    panel(cb, 'packing_list', 0.22, 0.27, txt(220, 270, '#f6f3ec', (x) => { x.fillStyle = '#333'; font(x, 14); x.fillText('PACKING LIST · BIZON', 110, 22); x.strokeStyle = '#999'; x.lineWidth = 1.5; for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(12, 44 + i * 24); x.lineTo(208, 44 + i * 24); x.stroke(); } for (const cx of [110, 150, 180]) { x.beginPath(); x.moveTo(cx, 44); x.lineTo(cx, 236); x.stroke(); } }), 0, 0.165, 0.007);
    B(cb, 'clip_metal', 0.08, 0.03, 0.02, mat(0xc4cad1, 0.4, 0.5), 0, 0.33, 0.006, 0.006);
    const dr = dragonMini(g, 1.1); dr.position.set(W / 2 - 0.14, P + H + 0.012, 0.05); dr.rotation.y = -0.5;
    return g;
  }
  function ecoPackStack() {
    const g = label(G('PRD_EcoPackaging'), 'Bao bì xvất khẩu thân thiện môi trường', 'Thùng carton đất sét → khay bã mía/vỏ trấu → hộp nam châm xanh ngọc → bình → hộ chiếu thương hiệu');
    const cW = 0.44, cH = 0.3, cD = 0.38, wt = 0.012;
    B(g, 'carton_bottom', cW, wt, cD, C.kraft, 0, 0, 0, 0.003);
    B(g, 'carton_wall', cW, cH, wt, C.kraft, 0, 0, cD / 2, 0.003); B(g, 'carton_wall', cW, cH, wt, C.kraft, 0, 0, -cD / 2, 0.003);
    for (const sx of [-1, 1]) { B(g, 'carton_wall', wt, cH, cD, C.kraft, sx * cW / 2, 0, 0, 0.003); const f = G('carton_flap', g, sx * cW / 2, cH, 0); f.rotation.z = sx * -0.6; B(f, 'flap', 0.18, 0.008, cD, C.kraft, sx * 0.09, 0, 0, 0.003); }
    panel(g, 'carton_label', 0.16, 0.08, txt(256, 128, '#e9dcc0', (x, Wc, Hc) => { x.fillStyle = '#2c3552'; font(x, 40); x.fillText('Cần Thơ', Wc / 2, 48); font(x, 22, 600); x.fillText('Global Gateway', Wc / 2, 92); }), 0.1, 0.17, cD / 2 + 0.007);
    const tray = G('pulp_tray', g, 0, 0.42, 0); B(tray, 'tray_base', 0.4, 0.05, 0.32, C.pulp, 0, 0, 0, 0.02);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) Cy(tray, 'tray_cup', 0.05, 0.035, 0.012, mat(0xb88d58, 0.98), -0.12 + i * 0.12, 0.045, -0.07 + j * 0.14, 20);
    const gb = G('emerald_box', g, 0, 0.6, 0); B(gb, 'emerald_base', 0.28, 0.14, 0.24, C.emerald, 0, 0, 0, 0.01); B(gb, 'emerald_rim', 0.26, 0.02, 0.22, C.white, 0, 0.14, 0, 0.004);
    const em = mesh(gb, 'emerald_emblem', new THREE.CylinderGeometry(0.03, 0.03, 0.004, 24), C.gold, 0.08, 0.07, 0.121); em.rotation.x = Math.PI / 2;
    const v = vaseBody(g, 0.8); v.position.y = 0.84;
    const doc = G('brand_passport', g, 0.06, 1.2, 0); doc.rotation.set(-0.25, 0.3, 0.1); B(doc, 'passport', 0.12, 0.012, 0.16, C.white, 0, 0, 0, 0.003); Cy(doc, 'passport_seal', 0.018, 0.018, 0.004, C.wax, 0, 0.012, 0, 16);
    return g;
  }
  function productShowcase() {
    const g = G('PRD_Showcase');
    const T = 0.62, W = 1.35, D = 0.62;
    B(g, 'showcase_top', W, 0.05, D, C.rosewood, 0, T - 0.05, 0, 0.015);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(g, 'showcase_leg', 0.06, T - 0.05, 0.06, C.rosewoodD, sx * (W / 2 - 0.06), 0, sz * (D / 2 - 0.06), 0.01);
    B(g, 'showcase_shelf', W - 0.08, 0.03, D - 0.08, C.rosewood, 0, 0.14, 0, 0.01);
    B(g, 'showcase_runner', W - 0.12, 0.006, 0.34, C.satin, 0, T, 0, 0.002);
    const v = lotusDragonVase(); v.position.set(-0.38, T, 0.02); v.rotation.y = 0.15; g.add(v);
    const ob = giftBoxOpen(); ob.position.set(0.22, T, -0.02); ob.rotation.y = -0.2; ob.scale.setScalar(0.95); g.add(ob);
    const ac = giftAccessories(); ac.position.set(0.02, T, 0.2); ac.scale.setScalar(0.85); g.add(ac);
    const df = dragonFigurine(); df.position.set(0.52, T, 0.2); df.rotation.y = -0.5; g.add(df);
    const cb = giftBoxClosed(); cb.position.set(-0.3, 0.17, 0); g.add(cb);
    const cb2 = giftBoxClosed(); cb2.position.set(0.3, 0.17, 0.02); cb2.rotation.y = 0.08; g.add(cb2);
    const card = G('showcase_card', g, 0.52, T, -0.2, -0.3); B(card, 'card_back', 0.2, 0.12, 0.01, C.box, 0, 0, 0, 0.004).rotation.x = -0.2;
    const ct = panel(card, 'card_text', 0.18, 0.1, txt(360, 200, '#efe4cc', (x, Wc, Hc) => { x.fillStyle = '#1f6f8a'; font(x, 52); x.fillText('SẢN PHẨM', Wc / 2, 72); x.fillStyle = '#c29a44'; font(x, 36, 700); x.fillText('BizOn Go Global', Wc / 2, 138); }), 0, 0.062, 0.018); ct.rotation.x = -0.2;
    return g;
  }

  const I = (id, label, build) => ({ id, dept: 'products', label, build });
  return {
    dept: { id: 'products', label: 'Sản phẩm BizOn', color: '#2f9a78' },
    items: [
      I('lotusDragonVase', 'Bình gốm Sa Sa Mekong · Đội Rồng Xanh', lotusDragonVase), I('dragonFigurine', 'Linh vật Rồng Xanh', dragonFigurine),
      I('giftBoxOpen', 'Hộp quà Go Global (mở)', giftBoxOpen), I('giftBoxClosed', 'Hộp quà Go Global (niêm phong)', giftBoxClosed),
      I('giftAccessories', 'Chứng nhận & huy hiệu', giftAccessories), I('ecoPackaging', 'Bao bì xuất khẩu (tách lớp)', ecoPackStack),
      I('exportCrate', 'Thùng gỗ xuất khẩu hàng không', exportCrate), I('productShowcase', 'Kệ trưng bày sản phẩm', productShowcase),
      I('kraftGiftSet', 'Hộp quà kraft OCOP 4 Sao', kraftGiftSet), ...MS.items,
    ],
  };
}
