// BizOn — linh vật đất sét 4 đội (Rồng Xanh, Sói Alpha, Voi Mekong, Công Star Clay) + đồ gốm đi kèm.
// makeMascots(THREE, {B,Cy,G,S,mesh,mat,ctex,panel}) → { babyDragon, wolf, elephant, peacock, lotusPod, lotusBloom, items }
export function makeMascots(THREE, h) {
  const { B, Cy, G, S, mesh, mat, ctex, panel } = h;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const sp = (p, n, r, m, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = S(p, n, r, m, x, y, z); o.scale.set(sx, sy, sz); return o; };
  const cone = (p, n, r, hh, m, x, y, z, rx = 0, rz = 0, ry = 0) => { const o = mesh(p, n, new THREE.ConeGeometry(r, hh, 14), m, x, y, z); o.rotation.set(rx, ry, rz); return o; };
  const limb = (p, n, a, b, r, m) => { const A = V(...a), Bv = V(...b), d = Bv.clone().sub(A); const o = mesh(p, n, new THREE.CapsuleGeometry(r, Math.max(d.length(), 1e-3), 6, 14), m); o.position.copy(A).add(Bv).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return o; };
  const tube = (p, n, pts, r, m, t0 = 0.3) => { const c = new THREE.CatmullRomCurve3(pts.map(q => V(...q))), N = 48, R = 10, g = new THREE.TubeGeometry(c, N, r, R, false), ps = g.attributes.position;
    for (let i = 0; i <= N; i++) { const k = 1 - (1 - t0) * (i / N), ce = c.getPoint(i / N); for (let j = 0; j <= R; j++) { const id = i * (R + 1) + j, v = V(ps.getX(id), ps.getY(id), ps.getZ(id)).sub(ce).multiplyScalar(k).add(ce); ps.setXYZ(id, v.x, v.y, v.z); } }
    g.computeVertexNormals(); const o = mesh(p, n, g, m); return { o, c }; };
  const blushM = Object.assign(new THREE.MeshStandardMaterial({ color: 0xe8908a, roughness: 0.9, transparent: true, opacity: 0.55 }), { name: 'clay_blush' });
  const K = { ink: mat(0x141414, 0.25), white: mat(0xffffff, 0.2), gold: mat(0xd9b35a, 0.35, 0.55), pink: mat(0xf2a7bb, 0.6), pinkL: mat(0xfad3dd, 0.6), leaf: mat(0x5f9d5a, 0.6), red: mat(0xd23a2e, 0.55), yellow: mat(0xf4d23c, 0.5), terra: mat(0xc9754a, 0.8), terraD: mat(0xa65a36, 0.85), rattan: mat(0xc99a5a, 0.95), cream: mat(0xf1e6cf, 0.7) };
  const eye = (p, x, y, z, r = 0.02) => { sp(p, 'eye', r, K.ink, x, y, z, 1, 1.12, 0.7); sp(p, 'eye_shine', r * 0.3, K.white, x - r * 0.25, y + r * 0.4, z + r * 0.55); };

  function lotusBloom(p, s = 1) {
    const g = G('lotus_bloom', p); g.scale.setScalar(s);
    sp(g, 'lotus_pad', 0.05, K.leaf, 0, 0, 0, 1, 0.12, 1);
    [[8, 0.028, 1.05, K.pink], [6, 0.018, 0.55, K.pinkL]].forEach(([n, d, tilt, m], k) => { for (let i = 0; i < n; i++) { const pv = G('petal', g, 0, 0.008 + k * 0.006, 0); pv.rotation.y = i / n * Math.PI * 2 + k * 0.4; const pe = sp(pv, 'lotus_petal', 0.022, m, d, 0.018, 0, 0.3, 1, 0.55); pe.rotation.z = -tilt; } });
    sp(g, 'lotus_heart', 0.008, K.yellow, 0, 0.03, 0);
    return g;
  }
  function lotusPod(p, s = 1) {
    const g = G('lotus_pod', p); g.scale.setScalar(s); const m = mat(0x6a4a34, 0.9);
    mesh(g, 'pod', new THREE.CylinderGeometry(0.04, 0.022, 0.035, 20), m, 0, 0.018, 0);
    for (let i = 0; i < 7; i++) { const a = i / 6 * Math.PI * 2, r = i ? 0.024 : 0; sp(g, 'pod_hole', 0.0065, K.ink, Math.cos(a) * r, 0.036, Math.sin(a) * r, 1, 0.3, 1); }
    return g;
  }
  function vnFlag(p, x, y, z) { const f = G('vn_flag', p, x, y, z); Cy(f, 'flag_pole', 0.004, 0.004, 0.16, K.gold); B(f, 'flag_cloth', 0.08, 0.052, 0.006, K.red, 0.042, 0.1, 0, 0.004); const st = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.006 : 0.015; i ? st.lineTo(Math.cos(a) * r, Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, Math.sin(a) * r); } mesh(f, 'flag_star', new THREE.ExtrudeGeometry(st, { depth: 0.002, bevelEnabled: false }), K.yellow, 0.042, 0.126, 0.004); return f; }
  function goldCup(p, s = 1) { const g = G('gold_trophy', p); g.scale.setScalar(s); mesh(g, 'cup', new THREE.LatheGeometry([[0, 0], [0.03, 0], [0.03, 0.012], [0.008, 0.02], [0.008, 0.045], [0.03, 0.06], [0.04, 0.1], [0.036, 0.1], [0, 0.07]].map(([a, b]) => new THREE.Vector2(a, b)), 28), K.gold); for (const sx of [-1, 1]) mesh(g, 'handle', new THREE.TorusGeometry(0.016, 0.004, 8, 16, Math.PI), K.gold, sx * 0.04, 0.08, 0).rotation.z = sx * -Math.PI / 2; return g; }
  function glasses(p, x, y, z, w = 0.045, r = 0.02) { for (const sx of [-1, 1]) mesh(p, 'glasses_rim', new THREE.TorusGeometry(r, 0.0032, 8, 24), K.gold, x + sx * w, y, z); limb(p, 'glasses_bridge', [x - w + r, y, z + 0.004], [x + w - r, y, z + 0.004], 0.0025, K.gold); }

  // ---------- Đội Rồng Xanh: baby dragon (pose: lotus | cheer | think | surprised | wave)
  function babyDragon(p, pose = 'lotus', s = 1) {
    const g = G('mascot_dragon_' + pose, p); g.scale.setScalar(s);
    const gr = mat(0x6fae5e, 0.72), grL = mat(0x9fd08a, 0.72), bel = mat(0xece2b8, 0.78);
    sp(g, 'body', 0.11, gr, 0, 0.125, 0, 1, 1.06, 0.92);
    sp(g, 'belly', 0.09, bel, 0, 0.12, 0.058, 0.84, 1.02, 0.55);
    for (let i = 0; i < 4; i++) { const t = mesh(g, 'belly_ridge', new THREE.TorusGeometry(0.066 - Math.abs(i - 1.5) * 0.007, 0.0045, 6, 20, Math.PI), mat(0xd9cc98, 0.8), 0, 0.06 + i * 0.04, 0.05); t.rotation.x = Math.PI / 2; t.scale.y = 0.72; }
    const hd = G('dragon_head', g, 0, 0, 0);
    sp(hd, 'head', 0.105, gr, 0, 0.305, 0.01, 1.08, 0.95, 0.96);
    sp(hd, 'snout', 0.062, gr, 0, 0.275, 0.085, 1.15, 0.78, 0.85);
    for (const sx of [-1, 1]) {
      sp(hd, 'nostril', 0.0065, K.ink, sx * 0.022, 0.293, 0.14);
      if (pose === 'cheer') { const e = mesh(hd, 'eye_happy', new THREE.TorusGeometry(0.016, 0.004, 6, 16, Math.PI), K.ink, sx * 0.045, 0.325, 0.093); } else eye(hd, sx * 0.045, 0.33, 0.085, pose === 'surprised' ? 0.024 : 0.021);
      sp(hd, 'brow', 0.02, grL, sx * 0.05, 0.372, 0.07, 1.4, 0.5, 0.6);
      sp(hd, 'cheek', 0.018, blushM, sx * 0.078, 0.286, 0.074, 1, 0.7, 0.4);
      const ear = cone(hd, 'ear', 0.03, 0.075, gr, sx * 0.1, 0.345, -0.01, 0, -sx * 1.15); ear.scale.z = 0.5;
      limb(hd, 'antler', [sx * 0.04, 0.39, -0.01], [sx * 0.06, 0.475, -0.02], 0.011, K.gold); limb(hd, 'antler_tine', [sx * 0.052, 0.43, -0.015], [sx * 0.088, 0.452, -0.015], 0.008, K.gold);
      tube(hd, 'whisker', [[sx * 0.06, 0.265, 0.115], [sx * 0.11, 0.275, 0.1], [sx * 0.145, 0.3, 0.075]], 0.0045, grL, 0.6);
      for (let i = 0; i < 3; i++) cone(hd, 'frill', 0.014, 0.04, grL, sx * 0.105, 0.3 - i * 0.025, -0.03, 0, -sx * (1.3 + i * 0.15));
    }
    [[0, 0.408, 0.005], [0, 0.4, -0.045], [0, 0.365, -0.085]].forEach(([x, y, z], i) => cone(hd, 'head_spike', 0.014, 0.035, grL, x, y, z, -0.4 - i * 0.4));
    if (pose === 'surprised') sp(hd, 'mouth_o', 0.013, K.ink, 0, 0.245, 0.128, 1, 1.1, 0.5);
    else if (pose === 'cheer' || pose === 'lotus') { sp(hd, 'mouth_open', 0.022, mat(0x6a2a2a, 0.5), 0, 0.248, 0.122, 1.3, 0.62, 0.5); sp(hd, 'tongue', 0.012, mat(0xe07a7a, 0.6), 0, 0.242, 0.128, 1.2, 0.6, 0.6); }
    else { const m = mesh(hd, 'smile', new THREE.TorusGeometry(0.025, 0.004, 6, 18, Math.PI), K.ink, 0, 0.258, 0.128); m.rotation.z = Math.PI; }
    if (pose === 'think') glasses(hd, 0, 0.33, 0.108, 0.045, 0.025);
    [[0.215, -0.095], [0.165, -0.108], [0.115, -0.11], [0.065, -0.1]].forEach(([y, z]) => cone(g, 'back_spike', 0.017, 0.04, grL, 0, y, z, -1.4));
    const tl = tube(g, 'tail', [[0.05, 0.05, -0.08], [0.13, 0.035, -0.07], [0.19, 0.07, -0.01], [0.205, 0.13, 0.02]], 0.04, gr, 0.2);
    for (let i = 1; i < 6; i++) { const q = tl.c.getPoint(i / 6.5); cone(g, 'tail_spike', 0.012, 0.03, grL, q.x, q.y + 0.03 * (1 - i / 7), q.z, 0, -0.4); }
    for (const sx of [-1, 1]) {
      sp(g, 'thigh', 0.052, gr, sx * 0.075, 0.055, 0.03, 1, 0.8, 1.2);
      sp(g, 'foot', 0.036, gr, sx * 0.085, 0.028, 0.105, 1, 0.72, 1.15);
      for (let i = -1; i <= 1; i++) sp(g, 'toe', 0.011, grL, sx * 0.085 + i * 0.018, 0.022, 0.139);
    }
    const sh = sx => [sx * 0.085, 0.19, 0.035];
    const hands = { lotus: [[-0.03, 0.15, 0.11], [0.03, 0.15, 0.11]], cheer: [[-0.17, 0.3, 0.04], [0.16, 0.31, 0.04]], think: [[-0.015, 0.235, 0.13], [0.045, 0.12, 0.1]], surprised: [[-0.08, 0.27, 0.1], [0.08, 0.27, 0.1]], wave: [[-0.04, 0.12, 0.1], [0.17, 0.3, 0.03]] }[pose];
    hands.forEach((hp, i) => { const sx = i ? 1 : -1; limb(g, 'arm', sh(sx), hp, 0.026, gr); sp(g, 'hand', 0.028, gr, ...hp); });
    if (pose === 'lotus') { const l = lotusBloom(g, 1.15); l.position.set(0, 0.16, 0.14); l.rotation.x = 0.35; }
    if (pose === 'cheer') { vnFlag(g, 0.16, 0.26, 0.04); const md = mesh(g, 'medal', new THREE.CylinderGeometry(0.02, 0.02, 0.006, 20), K.gold, 0, 0.14, 0.098); md.rotation.x = Math.PI / 2; mesh(g, 'medal_ribbon', new THREE.TorusGeometry(0.05, 0.004, 6, 24, Math.PI), K.red, 0, 0.19, 0.075).rotation.set(0.35, 0, Math.PI); }
    return g;
  }

  // ---------- Alpha Dynamics: sói xanh cầm loa
  function wolf(p, s = 1) {
    const g = G('mascot_wolf_alpha', p); g.scale.setScalar(s);
    const bl = mat(0x4b5f92, 0.8), gy = mat(0x93a0bb, 0.82), org = mat(0xe07b33, 0.6);
    sp(g, 'body', 0.1, bl, 0, 0.13, 0, 1, 1.15, 0.9); sp(g, 'chest_fur', 0.075, gy, 0, 0.16, 0.05, 0.92, 1.12, 0.6);
    for (let i = 0; i < 5; i++) cone(g, 'fur_tuft', 0.02, 0.05, gy, -0.04 + i * 0.02, 0.1, 0.085, 2.6, (i - 2) * 0.2);
    sp(g, 'head', 0.09, bl, 0, 0.31, 0.01, 1.12, 0.95, 0.95);
    sp(g, 'muzzle', 0.05, gy, 0, 0.285, 0.075, 1, 0.72, 1.25); sp(g, 'nose', 0.016, K.ink, 0, 0.302, 0.135, 1.2, 0.9, 0.9);
    const sm = mesh(g, 'smirk', new THREE.TorusGeometry(0.022, 0.0035, 6, 16, Math.PI * 0.8), K.ink, 0.004, 0.268, 0.12); sm.rotation.z = Math.PI * 1.1;
    for (const sx of [-1, 1]) {
      sp(g, 'eye_iris', 0.018, org, sx * 0.037, 0.325, 0.078, 1, 1, 0.6); sp(g, 'eye_pupil', 0.009, K.ink, sx * 0.037, 0.325, 0.088); sp(g, 'eye_shine', 0.004, K.white, sx * 0.033, 0.33, 0.093);
      limb(g, 'brow', [sx * 0.062, 0.355, 0.07], [sx * 0.016, 0.342, 0.085], 0.007, gy);
      cone(g, 'ear', 0.034, 0.09, bl, sx * 0.055, 0.41, -0.01, 0, -sx * 0.25).scale.z = 0.6; cone(g, 'ear_inner', 0.02, 0.06, gy, sx * 0.055, 0.405, 0.004, 0, -sx * 0.25).scale.z = 0.4;
      for (let i = 0; i < 3; i++) cone(g, 'cheek_fluff', 0.02, 0.055, gy, sx * 0.09, 0.3 - i * 0.02, 0.02, 0, -sx * (1.8 + i * 0.25));
      sp(g, 'haunch', 0.055, bl, sx * 0.075, 0.06, -0.01, 1, 0.8, 1.2); sp(g, 'paw', 0.03, gy, sx * 0.05, 0.022, 0.1, 1, 0.7, 1.2);
    }
    const cap = mesh(g, 'cap', new THREE.SphereGeometry(0.094, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), bl, 0, 0.35, -0.01); cap.scale.set(1.1, 0.8, 1); cap.rotation.x = -0.15;
    mesh(g, 'cap_band', new THREE.TorusGeometry(0.094, 0.009, 8, 32), org, 0, 0.37, -0.01).rotation.x = Math.PI / 2 - 0.15;
    const vis = mesh(g, 'cap_visor', new THREE.CylinderGeometry(0.07, 0.07, 0.008, 24, 1, false, -1, 2), bl, 0, 0.375, 0.04); vis.scale.z = 1.1;
    mesh(g, 'collar', new THREE.TorusGeometry(0.062, 0.011, 8, 28), org, 0, 0.225, 0.01).rotation.x = Math.PI / 2 + 0.2;
    const bolt = new THREE.Shape([[0.006, 0.02], [-0.008, -0.002], [0.001, -0.002], [-0.006, -0.02], [0.009, 0.003], [0, 0.003]].map(([a, b]) => new THREE.Vector2(a, b)));
    mesh(g, 'bolt_tag', new THREE.ExtrudeGeometry(bolt, { depth: 0.004, bevelEnabled: false }), K.gold, 0, 0.19, 0.07);
    limb(g, 'front_leg', [-0.05, 0.13, 0.05], [-0.05, 0.03, 0.09], 0.026, bl); limb(g, 'arm', [0.07, 0.2, 0.04], [0.12, 0.17, 0.11], 0.026, bl); sp(g, 'paw', 0.03, gy, 0.12, 0.17, 0.11);
    const mg = G('megaphone', g, 0.14, 0.2, 0.13, 0.7); const horn = mesh(mg, 'horn', new THREE.CylinderGeometry(0.055, 0.02, 0.11, 24, 1, true), K.white, 0.05, 0, 0); horn.rotation.z = -Math.PI / 2; horn.material = mat(0xf6f3ec, 0.5); horn.material.side = THREE.DoubleSide;
    mesh(mg, 'horn_rim', new THREE.TorusGeometry(0.055, 0.008, 8, 28), K.red, 0.105, 0, 0).rotation.y = Math.PI / 2; Cy(mg, 'grip', 0.012, 0.012, 0.05, K.white, 0, -0.06, 0);
    tube(g, 'tail', [[-0.06, 0.05, -0.08], [-0.15, 0.08, -0.08], [-0.19, 0.18, -0.04], [-0.17, 0.26, -0.02]], 0.035, bl, 0.35);
    return g;
  }

  // ---------- Mekong Ventures: voi xanh ngọc đeo kính, khăn rƱ1n, bông lúa
  function elephant(p, s = 1) {
    const g = G('mascot_elephant_mekong', p); g.scale.setScalar(s);
    const tl = mat(0x3aa39a, 0.78), tlL = mat(0x68c1b6, 0.8);
    sp(g, 'body', 0.12, tl, 0, 0.17, -0.02, 1, 0.9, 1.2);
    for (const [x, z] of [[-0.065, 0.07], [0.065, 0.07], [-0.065, -0.1], [0.065, -0.1]]) { Cy(g, 'leg', 0.04, 0.042, 0.13, tl, x, 0, z); for (let i = -1; i <= 1; i++) sp(g, 'toenail', 0.009, K.cream, x + i * 0.018, 0.01, z + 0.038, 1, 0.8, 0.6); }
    sp(g, 'head', 0.1, tl, 0, 0.29, 0.1, 1.05, 1, 0.95);
    for (const sx of [-1, 1]) { const e = sp(g, 'ear', 0.1, tl, sx * 0.13, 0.3, 0.05, 1, 1.12, 0.2); e.rotation.y = sx * 0.5; const ei = sp(g, 'ear_inner', 0.075, tlL, sx * 0.128, 0.3, 0.064, 1, 1.1, 0.12); ei.rotation.y = sx * 0.5; eye(g, sx * 0.042, 0.315, 0.183, 0.012); limb(g, 'brow', [sx * 0.06, 0.345, 0.17], [sx * 0.025, 0.35, 0.185], 0.004, mat(0x2a7a72, 0.8)); sp(g, 'cheek', 0.02, blushM, sx * 0.07, 0.28, 0.16, 1, 0.7, 0.4); }
    glasses(g, 0, 0.315, 0.195, 0.042, 0.022);
    tube(g, 'trunk', [[0, 0.28, 0.18], [0, 0.22, 0.215], [0.02, 0.19, 0.25], [0.06, 0.22, 0.27], [0.075, 0.29, 0.26]], 0.034, tl, 0.45);
    const rice = G('rice_stalk', g, 0.078, 0.3, 0.26); limb(rice, 'stem', [0, 0, 0], [0.01, 0.07, 0], 0.003, K.leaf);
    for (let i = 0; i < 9; i++) sp(rice, 'grain', 0.007, mat(0xe0b44a, 0.6), 0.012 + (i % 2 ? 0.009 : -0.002), 0.035 + i * 0.006, (i % 3 - 1) * 0.005, 0.7, 1.3, 0.7);
    const cv = ctex(128, 128, (x) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? '#2a2a2a' : '#f2efe6'; x.fillRect(i * 16, j * 16, 16, 16); } }); cv.wrapS = cv.wrapT = THREE.RepeatWrapping; cv.repeat.set(3, 1);
    const kr = Object.assign(new THREE.MeshStandardMaterial({ map: cv, roughness: 0.9 }), { name: 'khan_ran' });
    const band = mesh(g, 'scarf_band', new THREE.CylinderGeometry(0.085, 0.095, 0.04, 28, 1, true), kr, 0, 0.22, 0.09); band.material.side = THREE.DoubleSide; band.rotation.x = 0.3;
    const tri = mesh(g, 'scarf_tip', new THREE.ConeGeometry(0.065, 0.1, 3), kr, 0, 0.17, 0.165); tri.rotation.set(Math.PI + 0.2, Math.PI / 6, 0); tri.scale.z = 0.3;
    tube(g, 'tail', [[0, 0.17, -0.16], [0, 0.12, -0.19], [0.01, 0.08, -0.19]], 0.008, tl, 0.8);
    return g;
  }

  // ---------- Star Clay Co.: công tím ôm cúp vàng
  function peacock(p, s = 1) {
    const g = G('mascot_peacock_star', p); g.scale.setScalar(s);
    const pu = mat(0x6a3aa0, 0.6), puL = mat(0x9a6ad0, 0.6), tq = mat(0x4ab8c8, 0.55);
    Cy(g, 'base', 0.1, 0.11, 0.02, mat(0xb07ac0, 0.7), 0, 0, 0, 36);
    for (let k = 0; k < 3; k++) { const n = 7 + k * 2, R = 0.11 + k * 0.06; for (let i = 0; i < n; i++) { const a = -1.35 + 2.7 * i / (n - 1), fm = (i + k) % 2 ? pu : (k ? puL : tq); const f = sp(g, 'tail_feather', 0.036 + k * 0.004, fm, Math.sin(a) * R, 0.14 + Math.cos(a) * R, -0.07 - k * 0.012, 0.62, 1.05, 0.14); f.rotation.z = -a;
      if (k) { const e = sp(g, 'feather_eye', 0.013, K.gold, Math.sin(a) * (R + 0.012), 0.14 + Math.cos(a) * (R + 0.012), -0.06 - k * 0.012 + 0.008, 1, 1.25, 0.3); e.rotation.z = -a; sp(g, 'feather_eye_gem', 0.0065, tq, e.position.x, e.position.y, e.position.z + 0.004); } } }
    sp(g, 'body', 0.075, pu, 0, 0.1, 0, 1, 1.2, 0.9);
    limb(g, 'neck', [0, 0.16, 0.01], [0, 0.26, 0.03], 0.034, pu);
    sp(g, 'head', 0.048, pu, 0, 0.3, 0.035, 1, 1.05, 1);
    for (const sx of [-1, 1]) { sp(g, 'eye_white', 0.017, K.white, sx * 0.022, 0.31, 0.068, 1, 1.15, 0.6); sp(g, 'eye_pupil', 0.009, K.ink, sx * 0.022, 0.308, 0.077); limb(g, 'lash', [sx * 0.032, 0.326, 0.068], [sx * 0.04, 0.334, 0.064], 0.0025, K.ink);
      const w = sp(g, 'wing', 0.055, puL, sx * 0.06, 0.1, 0.03, 0.45, 1, 0.9); w.rotation.z = sx * 0.3; sp(g, 'foot', 0.012, mat(0xd08a50, 0.6), sx * 0.025, 0.024, 0.03, 1, 0.5, 1.8); }
    cone(g, 'beak', 0.012, 0.035, K.gold, 0, 0.295, 0.09, Math.PI / 2 + 0.3);
    for (let i = -1; i <= 1; i++) { limb(g, 'crest', [0, 0.34, 0.03], [i * 0.022, 0.39, 0.02], 0.003, pu); sp(g, 'crest_tip', 0.008, K.gold, i * 0.022, 0.39, 0.02); }
    const cp = goldCup(g, 0.9); cp.position.set(0, 0.07, 0.08);
    return g;
  }

  // ---------- gốm đi kèm & kệ trưng bày
  function lotusJar(p, s = 1) {
    const g = G('lotus_jar', p); g.scale.setScalar(s);
    mesh(g, 'jar_body', new THREE.LatheGeometry([[0, 0], [0.06, 0], [0.075, 0.03], [0.078, 0.12], [0.065, 0.16], [0.05, 0.17], [0, 0.17]].map(([a, b]) => new THREE.Vector2(a, b)), 32), K.terra);
    Cy(g, 'jar_lid', 0.056, 0.058, 0.02, K.terraD, 0, 0.168, 0, 28);
    for (let i = 0; i < 3; i++) { const a = Math.PI / 2 + (i - 1) * 1.3; const l = lotusBloom(g, 0.7); l.position.set(Math.cos(a) * 0.076, 0.08, Math.sin(a) * 0.076); l.quaternion.setFromUnitVectors(V(0, 1, 0), V(Math.cos(a), 0.2, Math.sin(a)).normalize()); }
    const d = babyDragon(g, 'wave', 0.32); d.position.set(0, 0.185, 0); d.rotation.x = 0.1;
    return g;
  }
  function teaCup(p) { const g = G('tea_cup', p); Cy(g, 'rattan_coaster', 0.07, 0.07, 0.008, K.rattan, 0, 0, 0, 32); mesh(g, 'cup', new THREE.LatheGeometry([[0, 0.008], [0.03, 0.008], [0.045, 0.03], [0.05, 0.06], [0.046, 0.06], [0.04, 0.03], [0, 0.02]].map(([a, b]) => new THREE.Vector2(a, b)), 28), K.terra).material.side = THREE.DoubleSide; const l = lotusBloom(g, 0.45); l.position.set(0, 0.036, 0.047); l.rotation.x = 1.3; return g; }
  function mascotCollection() {
    const g = G('PRD_MascotCollection'); g.userData.label = 'Bộ sưu tập linh vật đất sét'; g.userData.role = 'Rồng Xanh · Sói Alpha · Voi Mekong · Công Star Clay';
    B(g, 'plinth', 1.6, 0.08, 0.55, mat(0x7a4a2a, 0.8), 0, 0, 0, 0.02);
    const sg = G('collection_sign', g, 0, 0.98, -0.22); B(sg, 'sign_board', 0.9, 0.2, 0.03, mat(0x8a5a36, 0.85), 0, -0.1, 0, 0.03);
    panel(sg, 'sign_text', 0.84, 0.17, ctex(840, 170, (x, w, hh) => { x.fillStyle = '#8a5a36'; x.fillRect(0, 0, w, hh); x.textAlign = 'center'; x.fillStyle = '#fbe9c8'; x.font = '700 30px "Baloo 2",sans-serif'; x.fillText('BizOn Bật Nghiệp', w / 2, 38); x.font = '800 50px "Baloo 2",sans-serif'; x.fillText('LINH VẬT ĐẤT SÉT 4 ĐỘI', w / 2, 96); x.font = '600 26px "Be Vietnam Pro",sans-serif'; x.fillText('Rồng Xanh · Sói Alpha · Voi Mekong · Công Star Clay', w / 2, 146); }), 0, -0.1, 0.016);
    for (const sx of [-1, 1]) Cy(sg, 'sign_post', 0.012, 0.012, 0.9, mat(0x5a3a22, 0.8), sx * 0.4, -0.98, -0.02, 8);
    const T = 0.08;
    const d = babyDragon(g, 'lotus', 1.25); d.position.set(0, T, 0.02);
    const w = wolf(g, 0.95); w.position.set(-0.42, T, 0.05); w.rotation.y = 0.35;
    const e = elephant(g, 0.95); e.position.set(0.42, T, 0.02); e.rotation.y = -0.35;
    const pc = peacock(g, 0.95); pc.position.set(0.66, T, -0.12); pc.rotation.y = -0.4;
    const j = lotusJar(g, 1); j.position.set(-0.68, T, -0.12);
    const c1 = teaCup(g); c1.position.set(-0.22, T, 0.2); const c2 = teaCup(g); c2.position.set(0.22, T, 0.2);
    const f = babyDragon(g, 'cheer', 0.5); f.position.set(-0.66, T, 0.16); f.rotation.y = 0.3;
    return g;
  }
  const one = (fn, l, r) => () => { const g = G('PRD_' + l); g.userData.label = l; g.userData.role = r; fn(g); return g; };
  const I = (id, label, build) => ({ id, dept: 'products', label, build });
  const items = [
    I('mascotCollection', 'Bộ sưu tập linh vật 4 đội', mascotCollection),
    I('mascotDragon', 'Linh vật Rồng Xanh ôm sen', one(g => babyDragon(g, 'lotus', 1.4), 'Rồng Xanh ôm sen', 'Linh vật Đội Rồng Xanh')),
    I('mascotDragonCheer', 'Rồng Xanh mừng chiến thắng', one(g => babyDragon(g, 'cheer', 1.4), 'Rồng Xanh mừng chiến thắng', 'Cờ đỏ sao vàng & huy chương')),
    I('mascotDragonThink', 'Rồng Xanh suy tư', one(g => babyDragon(g, 'think', 1.4), 'Rồng Xanh suy tư', 'Đeo kính, tay chống cằm')),
    I('mascotDragonWow', 'Rồng Xanh ngạc nhiên', one(g => babyDragon(g, 'surprised', 1.4), 'Rồng Xanh ngạc nhiên', 'Biến cố thị trường!')),
    I('mascotWolf', 'Sói Alpha Dynamics', one(g => wolf(g, 1.4), 'Sói Alpha Dynamics', 'Đối thủ AI · Giá rλ tốc chiến')),
    I('mascotElephant', 'Voi Mekong Ventures', one(g => elephant(g, 1.4), 'Voi Mekong Ventures', 'Đối thủ AI · Cân bằng chắc chắn')),
    I('mascotPeacock', 'Công Star Clay Co.', one(g => peacock(g, 1.4), 'Công Star Clay Co.', 'Đối thủ AI · Cao cấp thương hiệu')),
    I('lotusJar', 'HŹ gốm sen & rồng con', one(g => lotusJar(g, 1.5), 'HŹ gốm sen & rồng con', 'Nắp hŹ có rồng con nằm')),
  ];
  return { babyDragon, wolf, elephant, peacock, lotusPod, lotusBloom, lotusJar, teaCup, items };
}
