// BizOn Bật Nghiệp — clay 3D characters, built from the repo's character art (assets/character/team, advisors).
// makeCharacters(THREE) → { roster, build(id) }. Each built character exposes .userData.rig for animation.
export function makeCharacters(THREE) {
  const cache = {};
  const mat = (name, color, rough = 0.82) => {
    const k = name + color;
    return cache[k] ??= Object.assign(new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 }), { name });
  };
  function add(name, geo, m, x = 0, y = 0, z = 0, parent) {
    const o = new THREE.Mesh(geo, m); o.name = name; o.position.set(x, y, z);
    o.castShadow = o.receiveShadow = true; parent.add(o); return o;
  }
  const grp = (name, parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); parent && parent.add(g); return g; };
  function rbox(w, h, d, r) {
    const s = new THREE.Shape(), iw = Math.max(w - 2 * r, 1e-4), ih = Math.max(h - 2 * r, 1e-4);
    s.moveTo(-iw / 2, -ih / 2); s.lineTo(iw / 2, -ih / 2); s.lineTo(iw / 2, ih / 2); s.lineTo(-iw / 2, ih / 2); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(d - 2 * r, 1e-4), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 4, curveSegments: 2 });
    g.translate(0, 0, -Math.max(d - 2 * r, 1e-4) / 2); g.computeVertexNormals(); return g;
  }
  const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 8, 20);
  const sph = (r) => new THREE.SphereGeometry(r, 32, 22);

  // ---- props
  const P = {
    compass(p) {
      const g = grp('prop_compass', p);
      add('compass_rim', new THREE.CylinderGeometry(0.06, 0.06, 0.02, 40), mat('steel', 0xc9ced4, 0.45), 0, 0, 0, g).rotation.x = Math.PI / 2;
      add('compass_face', new THREE.CylinderGeometry(0.05, 0.05, 0.022, 40), mat('clay_cream', 0xf5efe4), 0, 0, 0.002, g).rotation.x = Math.PI / 2;
      add('compass_needle_n', new THREE.ConeGeometry(0.009, 0.045, 12), mat('clay_red', 0xd6453a), 0, 0.02, 0.014, g);
      add('compass_needle_s', new THREE.ConeGeometry(0.009, 0.045, 12), mat('clay_navy', 0x2d3f6b), 0, -0.02, 0.014, g).rotation.z = Math.PI;
      add('compass_bow', new THREE.TorusGeometry(0.012, 0.004, 8, 16), mat('steel', 0xc9ced4, 0.45), 0, 0.068, 0, g);
      return g;
    },
    moneybag(p) {
      const g = grp('prop_moneybag', p);
      const kraft = mat('clay_kraft', 0xc58f54);
      add('bag_body', sph(0.085), kraft, 0, 0, 0, g).scale.set(1, 0.92, 0.85);
      add('bag_neck', new THREE.CylinderGeometry(0.03, 0.045, 0.04, 20), kraft, 0, 0.085, 0, g);
      add('bag_tie', new THREE.TorusGeometry(0.032, 0.008, 10, 24), mat('clay_brown', 0x7b4e2a), 0, 0.075, 0, g).rotation.x = Math.PI / 2;
      add('bag_top', sph(0.035), kraft, 0, 0.115, 0, g).scale.y = 0.6;
      add('bag_coin', new THREE.CylinderGeometry(0.035, 0.035, 0.01, 32), mat('clay_gold', 0xf2c14e), 0, -0.005, 0.07, g).rotation.x = Math.PI / 2;
      return g;
    },
    megaphone(p) {
      const g = grp('prop_megaphone', p);
      const horn = add('horn', new THREE.CylinderGeometry(0.085, 0.03, 0.17, 32, 1, true), mat('clay_white', 0xf4f1ea), 0, 0, 0, g);
      horn.material.side = THREE.DoubleSide; horn.rotation.z = -Math.PI / 2;
      add('horn_rim', new THREE.TorusGeometry(0.085, 0.012, 12, 36), mat('clay_sunset', 0xe8784a), 0.085, 0, 0, g).rotation.y = Math.PI / 2;
      add('horn_back', new THREE.CylinderGeometry(0.034, 0.034, 0.04, 20), mat('clay_sunset', 0xe8784a), -0.1, 0, 0, g).rotation.z = Math.PI / 2;
      add('horn_grip', rbox(0.025, 0.07, 0.03, 0.01), mat('clay_charcoal', 0x3a3f47), -0.07, -0.05, 0, g);
      return g;
    },
    clipboard(p) {
      const g = grp('prop_clipboard', p);
      add('board', rbox(0.15, 0.2, 0.014, 0.006), mat('clay_kraft', 0xc58f54), 0, 0, 0, g);
      add('paper', rbox(0.125, 0.16, 0.004, 0.002), mat('clay_white', 0xf4f1ea), 0, -0.01, 0.008, g);
      add('clip', rbox(0.06, 0.025, 0.02, 0.006), mat('steel', 0xc9ced4, 0.45), 0, 0.098, 0.006, g);
      return g;
    },
    tablet(p) {
      const g = grp('prop_tablet', p);
      add('tablet_body', rbox(0.15, 0.2, 0.014, 0.008), mat('clay_silver', 0xd9dde2, 0.5), 0, 0, 0, g);
      add('tablet_screen', rbox(0.13, 0.175, 0.004, 0.003), mat('clay_screen', 0x9fb7c9, 0.4), 0, 0, 0.007, g);
      return g;
    },
    starTrophy(p) {
      const g = grp('prop_star_trophy', p), clay = mat('clay_taupe', 0xc9ad8f);
      add('trophy_base', rbox(0.16, 0.03, 0.07, 0.01), mat('clay_brown', 0x8a6446), 0, -0.07, 0, g);
      const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 0.035 : 0.08; i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      const sg = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 }); sg.translate(0, 0, -0.01);
      add('trophy_star', sg, clay, 0, 0.01, 0, g);
      for (const [x, h] of [[-0.06, 0.1], [-0.035, 0.14], [0.04, 0.12], [0.065, 0.08]]) add('trophy_tower', rbox(0.02, h, 0.02, 0.004), clay, x, -0.055 + h / 2, -0.02, g);
      add('trophy_badge', new THREE.SphereGeometry(0.014, 16, 12), mat('clay_indigo', 0x4a3fa0), 0, 0.01, 0.018, g);
      return g;
    },
    tabletWarm(p) {
      const g = grp('prop_tablet', p);
      add('tablet_body', rbox(0.15, 0.2, 0.014, 0.008), mat('clay_sand', 0xd8b68f), 0, 0, 0, g);
      return g;
    },
    lotus(p) {
      const g = grp('prop_lotus', p);
      add('lotus_stem', cap(0.005, 0.2), mat('clay_leaf', 0x5f9d5a), 0, -0.02, 0, g);
      const b = grp('lotus_bloom', g, 0, 0.1, 0);
      for (let i = 0; i < 8; i++) { const pv = grp('petal', b); pv.rotation.y = i / 8 * Math.PI * 2; const pe = add('lotus_petal', sph(0.02), mat(i % 2 ? 'clay_pinkL' : 'clay_pink', i % 2 ? 0xf8cbd9 : 0xef9ab6, 0.6), 0.016, 0.014, 0, pv); pe.scale.set(0.35, 1, 0.6); pe.rotation.z = -0.6; }
      add('lotus_bud', sph(0.014), mat('clay_pinkL', 0xf8cbd9, 0.6), 0, 0.02, 0, b).scale.set(1, 1.4, 1);
      return g;
    },
    scroll(p) {
      const g = grp('prop_scroll', p);
      add('scroll_roll', new THREE.CylinderGeometry(0.026, 0.026, 0.26, 24), mat('clay_paper', 0xefe3c4, 0.9), 0, 0, 0, g);
      for (const s of [-1, 1]) add('ribbon_loop', new THREE.TorusGeometry(0.02, 0.007, 8, 16), mat('clay_navy', 0x2d3f6b), s * 0.022, 0.04, 0.02, g).rotation.y = s * 0.8;
      add('ribbon_band', new THREE.TorusGeometry(0.028, 0.006, 8, 24), mat('clay_navy', 0x2d3f6b), 0, 0.04, 0, g).rotation.x = Math.PI / 2;
      return g;
    },
    goldCup(p) {
      const g = grp('prop_gold_cup', p), gm = mat('clay_goldm', 0xd9b35a, 0.35);
      add('cup', new THREE.LatheGeometry([[0, -0.07], [0.03, -0.07], [0.03, -0.058], [0.008, -0.05], [0.008, -0.02], [0.035, 0], [0.045, 0.05], [0.04, 0.05], [0, 0.02]].map(([a, b]) => new THREE.Vector2(a, b)), 24), gm, 0, 0, 0, g);
      for (const s of [-1, 1]) add('cup_handle', new THREE.TorusGeometry(0.018, 0.005, 8, 16, Math.PI), gm, s * 0.045, 0.028, 0, g).rotation.z = -s * Math.PI / 2;
      return g;
    },
    folder(p) {
      const g = grp('prop_folder', p);
      add('folder_body', rbox(0.19, 0.24, 0.03, 0.008), mat('clay_kraft', 0xb07a48), 0, 0, 0, g);
      add('folder_pages', rbox(0.17, 0.22, 0.02, 0.004), mat('clay_white', 0xf4f1ea), 0.012, 0.008, 0.002, g);
      return g;
    },
  };

  // ---- one clay figure
  function character(c) {
    const root = grp('char_' + c.id);
    const body = grp('body', root);
    const skin = mat('skin_' + c.id, c.skin, 0.75), top = mat('top_' + c.id, c.top), bottom = mat('bottom_' + c.id, c.bottom ?? c.top);
    const shoe = mat('shoe_' + c.id, c.shoe, 0.6), hair = mat('hair_' + c.id, c.hair, 0.8), dark = mat('clay_ink', 0x2b2320, 0.5);
    const skirt = c.bottomType === 'skirt';
    // legs (pivot at hip)
    const legs = [];
    for (const s of [-1, 1]) {
      const leg = grp('leg_' + (s < 0 ? 'R' : 'L'), body, s * 0.056, 0.585, 0);
      const wide = c.aoDai ? 0.064 : 0.056;
      if (skirt) { add('leg', new THREE.CylinderGeometry(0.036, 0.028, 0.5, 20), skin, 0, -0.28, 0, leg); add('knee', sph(0.036), skin, 0, -0.03, 0, leg); }
      else { add('leg', new THREE.CylinderGeometry(wide, wide - 0.004, 0.54, 24), bottom, 0, -0.27, 0, leg); add('trouser_top', sph(wide), bottom, 0, 0, 0, leg); }
      const fem = c.heels;
      add('shoe', sph(fem ? 0.044 : 0.052), shoe, 0, -0.556, fem ? 0.022 : 0.03, leg).scale.set(fem ? 0.9 : 0.98, fem ? 0.55 : 0.6, fem ? 1.55 : 1.6);
      add('shoe_sole', new THREE.CylinderGeometry(fem ? 0.04 : 0.05, fem ? 0.04 : 0.05, 0.012, 20), mat('sole', 0x3a2a22, 0.7), 0, -0.581, fem ? 0.022 : 0.03, leg).scale.z = fem ? 1.55 : 1.6;
      if (c.heels) add('heel', new THREE.CylinderGeometry(0.012, 0.01, 0.035, 10), shoe, 0, -0.57, -0.035, leg);
      legs.push(leg);
    }
    const hips = add('hips', new THREE.CylinderGeometry(0.108, 0.112, 0.1, 32), skirt ? mat('skirt_' + c.id, c.skirt ?? c.top) : bottom, 0, 0.62, 0, body); hips.scale.z = 0.74;
    if (skirt) { const L = c.skirtLen ?? 0.3; add('skirt', new THREE.CylinderGeometry(0.11, c.skirtFlare ?? 0.125, L, 36), mat('skirt_' + c.id, c.skirt ?? c.top), 0, 0.67 - L / 2, 0, body).scale.z = 0.76; }
    // torso: tapered lathe (waist → shoulders)
    const torso = grp('torso', body, 0, 0.81, 0);
    const lat = (pts, m, n, par = torso, sz = 0.72) => { const o = add(n, new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), 40), m, 0, 0, 0, par); o.scale.z = sz; return o; };
    lat([[0, -0.15], [0.104, -0.15], [0.106, -0.08], [0.114, 0.02], [0.12, 0.09], [0.116, 0.14], [0.09, 0.175], [0.05, 0.19], [0, 0.192]], top, 'chest');
    const white = mat('shirt_' + c.id, c.shirtFront ?? 0xf4f1ea);
    if (c.jacket) {
      if (c.shirtFront) { const sf = add('shirt_front', rbox(c.openJacket ? 0.09 : 0.06, c.openJacket ? 0.32 : 0.12, 0.01, 0.004), white, 0, c.openJacket ? -0.02 : 0.12, 0.084, torso); sf.rotation.x = c.openJacket ? -0.04 : -0.35; }
      if (c.openJacket) for (let i = 0; i < 4; i++) add('shirt_button', sph(0.005), mat('btn_' + c.id, 0xd8cfc0), 0, 0.1 - i * 0.07, 0.091, torso);
      if (c.vest) { const v = add('vest', rbox(0.1, 0.2, 0.012, 0.005), mat('vest_' + c.id, c.vest), 0, -0.02, 0.086, torso); v.rotation.x = -0.05; }
      lat([[0.121, -0.02], [0.126, -0.1], [0.132, -0.19], [0.134, -0.22], [0.108, -0.22]], top, 'jacket_hem', torso, 0.76);
      const gap = c.openJacket ? 0.062 : 0.036;
      for (const s of [-1, 1]) { const l = add('lapel', rbox(0.05, 0.2, 0.012, 0.006), top, s * gap, 0.07, 0.086, torso); l.rotation.set(-0.12, s * 0.2, s * 0.32); }
      for (const s of [-1, 1]) add('jacket_pocket', rbox(0.06, 0.01, 0.01, 0.004), top, s * 0.072, -0.13, 0.1, torso).rotation.y = s * 0.4;
      for (const s of [-1, 1]) { const k = add('shirt_collar', rbox(0.035, 0.028, 0.008, 0.004), white, s * 0.024, 0.19, 0.04, torso); k.rotation.set(-0.5, s * 0.5, s * 0.5); }
      if (!c.openJacket) for (const y of [-0.04, -0.12]) add('button', sph(0.008), dark, 0.004, y, 0.094, torso);
    }
    if (c.tie) { const tm = mat('tie_' + c.id, c.tie); add('tie_knot', sph(0.012), tm, 0, 0.17, 0.068, torso).scale.set(1, 0.9, 0.7); const t = add('tie', rbox(0.022, 0.13, 0.008, 0.004), tm, 0, 0.1, 0.086, torso); t.rotation.x = -0.3; }
    if (c.collar) { const cm = mat('collar_' + c.id, c.collar); for (const s of [-1, 1]) { const k = add('collar', rbox(0.045, 0.034, 0.01, 0.006), cm, s * 0.03, 0.185, 0.045, torso); k.rotation.set(-0.7, s * 0.45, s * 0.55); } }
    if (c.buttons) for (let i = 0; i < c.buttons; i++) add('shirt_button', sph(0.0065), mat('btn_' + c.id, c.btnColor ?? c.top), 0.004, 0.13 - i * 0.065, 0.091 - (i === 0 ? 0.006 : 0), torso);
    if (c.waistband) { const wb = add('waistband', new THREE.CylinderGeometry(0.108, 0.108, 0.035, 32), bottom, 0, -0.15, 0, torso); wb.scale.z = 0.75; }
    if (c.aoDai) {
      const am = top, L = c.aoDai;
      for (const back of [0, 1]) { const f = add('aodai_panel', new THREE.CylinderGeometry(0.108, 0.14, L, 28, 1, true, back ? Math.PI - 1.15 : -1.15, 2.3), am, 0, -0.13 - L / 2, 0, torso); f.material.side = THREE.DoubleSide; f.scale.z = 0.72; }
      const mc = add('mandarin_collar', new THREE.CylinderGeometry(0.043, 0.045, 0.045, 24, 1, true), am, 0, 0.205, 0, torso); mc.material.side = THREE.DoubleSide;
    }
    if (c.belt) add('belt', new THREE.TorusGeometry(0.106, 0.01, 10, 36), mat('belt_' + c.id, c.belt), 0, -0.14, 0, torso).rotation.x = Math.PI / 2;
    if (c.pin) add('pin', sph(0.014), mat('clay_globe', 0x3c8f6a), -0.06, 0.07, 0.085, torso);
    if (c.badge) {
      const cv = document.createElement('canvas'); cv.width = 128; cv.height = 64; const x = cv.getContext('2d');
      x.fillStyle = '#c9a24a'; x.fillRect(0, 0, 128, 64); x.strokeStyle = '#8a6a2a'; x.lineWidth = 6; x.strokeRect(3, 3, 122, 58);
      x.fillStyle = '#fff4d6'; x.font = '800 34px "Baloo 2",system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(c.badge, 64, 35);
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
      const bm = add('name_badge', rbox(0.07, 0.034, 0.01, 0.004), mat('clay_gold', 0xc9a24a, 0.45), 0.062, 0.075, 0.09, torso); bm.rotation.y = 0.28;
      const face = add('name_badge_text', new THREE.PlaneGeometry(0.064, 0.03), Object.assign(new THREE.MeshStandardMaterial({ map: tx, roughness: 0.5 }), { name: 'badge_' + c.id }), 0, 0, 0.0056, bm); face.castShadow = false;
    }
    add('neck', new THREE.CylinderGeometry(0.036, 0.04, 0.09, 20), skin, 0, 0.22, 0, torso);
    // head (built at r≈0.14, scaled down for game proportions ≈ 1/5 of height)
    const head = grp('head', torso, 0, 0.37, 0); head.scale.setScalar(0.86);
    add('skull', sph(0.14), skin, 0, 0.005, 0, head).scale.set(0.97, 1.08, 0.95);
    add('jaw', sph(0.118), skin, 0, -0.045, 0.012, head).scale.set(1, 0.88, 0.95);
    for (const s of [-1, 1]) add('ear', sph(0.036), skin, s * 0.132, -0.01, -0.005, head).scale.set(0.45, 1, 0.75);
    add('nose', sph(0.025), skin, 0, -0.015, 0.132, head).scale.set(0.9, 1.1, 1.05);
    const eyes = [];
    for (const s of [-1, 1]) {
      eyes.push(add('eye', sph(0.013), dark, s * 0.047, 0.022, 0.124, head)); eyes[eyes.length - 1].scale.set(0.85, 1.3, 0.6);
      add('brow', cap(0.006, 0.03), hair, s * 0.05, 0.055, 0.122, head).rotation.set(0, 0, Math.PI / 2 - s * 0.1);
      add('cheek', sph(0.022), mat('clay_blush', 0xe89a86, 0.9), s * 0.075, -0.035, 0.105, head).scale.set(1, 0.6, 0.4);
    }
    const mouth = c.smile === 'open'
      ? add('mouth', new THREE.SphereGeometry(0.026, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat('clay_mouth', 0x7a2e2a, 0.6), 0, -0.05, 0.12, head)
      : add('mouth', new THREE.TorusGeometry(0.024, 0.0055, 8, 20, Math.PI), mat('clay_mouth', 0x8a3b32, 0.6), 0, -0.055, 0.125, head);
    if (c.smile === 'open') { mouth.scale.set(1.1, 0.75, 0.5); add('teeth', rbox(0.036, 0.009, 0.006, 0.003), mat('clay_teeth', 0xfbf6ee, 0.4), 0, -0.053, 0.132, head); }
    else mouth.rotation.z = Math.PI;
    if (c.flagPin) { const fp = add('flag_pin', rbox(0.034, 0.022, 0.006, 0.003), mat('clay_red', 0xd23a2e, 0.5), 0.07, 0.1, 0.09, torso); fp.rotation.y = 0.3; add('flag_pin_star', sph(0.005), mat('clay_star', 0xf4d23c, 0.5), 0, 0, 0.004, fp); }
    if (c.hairFlower) { const hf = grp('hair_flower', head, 0.1, 0.1, 0.06); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; add('flower_petal', sph(0.016), mat('clay_petal', 0xfbf1dc, 0.6), Math.cos(a) * 0.014, Math.sin(a) * 0.014, 0, hf).scale.set(1, 1, 0.5); } add('flower_heart', sph(0.008), mat('clay_star', 0xf4d23c, 0.5), 0, 0, 0.006, hf); }
    if (c.feather) { const f = grp('peacock_feather', head, 0.11, 0.14, 0.02); f.rotation.z = -0.5; add('feather_vane', sph(0.03), mat('clay_teal', 0x2f9a78, 0.5), 0, 0.03, 0, f).scale.set(0.6, 1.2, 0.3); add('feather_eye', sph(0.012), mat('clay_indigo', 0x2a3a9a, 0.4), 0, 0.035, 0.008, f).scale.set(1, 1.2, 0.4); }
    if (c.glasses) {
      const gm = mat('glasses_' + c.id, c.glasses, 0.5);
      for (const s of [-1, 1]) add('lens_rim', new THREE.TorusGeometry(0.03, 0.0045, 8, 28), gm, s * 0.05, 0.018, 0.132, head);
      add('bridge', cap(0.004, 0.02), gm, 0, 0.024, 0.138, head).rotation.z = Math.PI / 2;
    }
    if (c.earring) for (const s of [-1, 1]) add('earring', sph(0.009), mat('clay_pearl', 0xf6efe0, 0.4), s * 0.138, -0.04, 0, head);
    // hair
    const capG = new THREE.SphereGeometry(0.148, 36, 20, 0, Math.PI * 2, 0, Math.PI * (c.hairCap ?? 0.5));
    const hc = add('hair_cap', capG, hair, 0, 0.012, -0.012, head); hc.scale.set(1.02, 1.05, 1.02); hc.rotation.x = -0.32;
    if (c.hairStyle === 'none') hc.visible = false;
    if (c.hairStyle === 'short' || c.hairStyle === 'grey') {
      add('hair_quiff', sph(0.06), hair, 0.025, 0.118, 0.055, head).scale.set(1.7, 0.55, 1.2);
      add('hair_back', sph(0.14), hair, 0, 0.02, -0.035, head).scale.set(1.02, 0.98, 0.92);
      for (const s of [-1, 1]) add('sideburn', sph(0.04), hair, s * 0.125, 0.02, -0.01, head).scale.set(0.45, 1.1, 0.9);
    }
    if (c.hairStyle === 'spiky') {
      add('hair_back', sph(0.14), hair, 0, 0.02, -0.035, head).scale.set(1.02, 0.98, 0.92);
      for (const s of [-1, 1]) add('sideburn', sph(0.04), hair, s * 0.125, 0.02, -0.01, head).scale.set(0.45, 1.1, 0.9);
      [[-0.07, 0.13, 0.05, 0.5], [-0.02, 0.15, 0.06, 0.2], [0.035, 0.15, 0.05, -0.2], [0.08, 0.13, 0.03, -0.55], [0, 0.14, -0.03, 0.05], [-0.05, 0.12, -0.05, 0.4], [0.06, 0.12, -0.05, -0.4]].forEach(([x, y, z, rz]) => {
        const sp = add('hair_spike', new THREE.ConeGeometry(0.035, 0.1, 14), hair, x, y, z, head); sp.rotation.set(-0.5, 0, rz); });
    }
    if (c.hairStyle === 'bob') {
      add('hair_back', sph(0.155), hair, 0, -0.01, -0.03, head).scale.set(1.06, 1.04, 1);
      for (const s of [-1, 1]) { const sd = add('hair_side', cap(0.058, 0.14), hair, s * 0.13, -0.07, 0.01, head); sd.rotation.z = s * 0.1; sd.scale.set(0.85, 1, 1.25); add('hair_curl', sph(0.05), hair, s * 0.14, -0.15, 0.0, head).scale.set(1, 0.7, 1.2); }
      const fr = add('hair_fringe', cap(0.045, 0.15), hair, 0.03, 0.105, 0.085, head); fr.rotation.set(0.35, 0, -1.25); fr.scale.set(1, 1, 0.7);
    }
    if (c.hairStyle === 'bunTop') {
      add('hair_back', sph(0.148), hair, 0, 0.02, -0.02, head).scale.set(1.02, 1.02, 1);
      add('hair_bun', sph(0.058), hair, 0, 0.175, -0.02, head).scale.set(1, 0.85, 1);
      add('bun_swirl', new THREE.TorusGeometry(0.045, 0.012, 8, 24), hair, 0, 0.19, -0.02, head).rotation.x = Math.PI / 2;
      const fr = add('hair_fringe', cap(0.04, 0.13), hair, 0.03, 0.11, 0.08, head); fr.rotation.set(0.4, 0, -1.3); fr.scale.set(1, 1, 0.6);
    }
    if (c.hairStyle === 'wavy') {
      add('hair_back', sph(0.155), hair, 0, 0.0, -0.03, head).scale.set(1.08, 1.04, 1);
      add('hair_long', cap(0.14, 0.26), hair, 0, -0.22, -0.07, head).scale.set(1.2, 1, 0.55);
      for (const s of [-1, 1]) { for (let i = 0; i < 6; i++) add('hair_wave', sph(0.052), hair, s * (0.135 + (i % 2) * 0.018), -0.05 - i * 0.06, 0.0 - i * 0.004, head).scale.set(0.8, 1, 1); const pt = add('hair_part', cap(0.05, 0.12), hair, s * 0.07, 0.1, 0.07, head); pt.rotation.set(0.5, 0, s * 1.0); pt.scale.set(1, 1, 0.6); }
    }
    if (c.hairStyle === 'slick') {
      add('hair_back', sph(0.143), hair, 0, 0.02, -0.03, head).scale.set(1.02, 0.98, 0.95);
      for (const s of [-1, 1]) add('sideburn', sph(0.04), hair, s * 0.126, 0.02, -0.01, head).scale.set(0.42, 1.1, 0.9);
      const q = add('hair_quiff', cap(0.04, 0.12), hair, 0.02, 0.118, 0.07, head); q.rotation.set(0.3, 0, -1.35); q.scale.set(1, 1, 0.8);
    }
    if (c.hairStyle === 'bun') {
      add('hair_back', sph(0.14), hair, 0, 0.0, -0.03, head);
      add('hair_bun', sph(0.06), hair, 0, 0.14, -0.06, head);
    }
    if (c.hairStyle === 'long') {
      add('hair_back', sph(0.145), hair, 0, 0, -0.03, head);
      add('hair_long', cap(0.13, 0.22), hair, 0, -0.17, -0.06, head).scale.set(1.15, 1, 0.55);
      for (const s of [-1, 1]) add('hair_side', cap(0.05, 0.22), hair, s * 0.13, -0.13, 0.0, head).rotation.z = s * 0.1;
      add('hair_fringe', sph(0.075), hair, 0.035, 0.095, 0.07, head).scale.set(1.35, 0.45, 0.85);
    }
    // arms: shoulder → elbow
    const arms = {};
    for (const s of [-1, 1]) {
      const side = s < 0 ? 'R' : 'L';
      const sh = grp('arm_' + side, torso, s * 0.15, 0.12, 0);
      add('upper_arm', cap(0.043, 0.13), top, 0, -0.1, 0, sh);
      const el = grp('forearm_' + side, sh, 0, -0.215, 0);
      add('forearm', cap(0.039, 0.13), c.shortSleeve ? skin : top, 0, -0.085, 0, el);
      if (!c.shortSleeve && c.cuff) add('cuff', new THREE.CylinderGeometry(0.04, 0.04, 0.022, 16), mat('shirt_' + c.id, c.cuff), 0, -0.165, 0, el);
      const hand = add('hand', sph(0.04), skin, 0, -0.2, 0.004, el); hand.scale.set(0.8, 1.2, 0.72);
      add('thumb', cap(0.014, 0.025), skin, -s * 0.028, -0.19, 0.02, el).rotation.z = -s * 0.5;
      sh.rotation.z = s * 0.1;
      arms[side] = { sh, el, s };
    }
    // pose + prop
    const hold = {};
    const pose = c.pose || 'rest';
    const set = (side, shx, shz, elx) => { const a = arms[side]; a.sh.rotation.x = shx; a.sh.rotation.z = a.s * shz; a.el.rotation.x = elx; hold[side] = true; };
    let prop = null;
    if (pose === 'chest') { set('R', -0.35, -0.2, -1.5); prop = P[c.prop](torso); prop.position.set(-0.03, 0.04, 0.14); prop.rotation.y = 0.2; }
    if (pose === 'both') { set('R', -0.45, -0.3, -1.25); set('L', -0.45, -0.3, -1.25); prop = P[c.prop](torso); prop.position.set(0, -0.06, 0.2); }
    if (pose === 'megaphone') { set('L', -0.15, 0.32, -2.55); prop = P[c.prop](torso); prop.scale.setScalar(0.8); prop.position.set(0.24, 0.17, 0.12); prop.rotation.set(0, 0.2, 0.6); }
    if (pose === 'lotus') { set('R', -0.35, -0.3, -1.1); set('L', -0.35, -0.3, -1.1); prop = P.lotus(torso); prop.position.set(0, -0.12, 0.2); }
    if (pose === 'scroll') { set('R', -0.35, 0.42, -1.0); set('L', -0.45, 0.35, -1.05); prop = P.scroll(torso); prop.position.set(0.26, -0.14, 0.2); prop.rotation.set(0, 0, 0.35); }
    if (pose === 'pocket') { set('R', 0.2, 0.28, -0.55); }
    if (pose === 'trophy') { set('L', -0.35, -0.35, -1.5); prop = P.goldCup(torso); prop.position.set(0.05, 0.02, 0.16); }
    if (pose === 'clipboard') { set('L', -0.3, -0.35, -1.45); prop = P[c.prop](torso); prop.position.set(0.05, -0.02, 0.15); prop.rotation.set(-0.35, 0.2, 0); }
    if (pose === 'tablet') { set('R', -0.3, -0.35, -1.45); prop = P[c.prop](torso); prop.position.set(-0.06, -0.02, 0.15); prop.rotation.set(-0.5, -0.25, 0); }
    if (pose === 'present') { set('R', -0.3, -0.35, -1.45); set('L', -0.35, 0.95, -1.1); hold.L = false; prop = P[c.prop](torso); prop.position.set(-0.06, -0.01, 0.15); prop.rotation.set(-0.6, -0.3, 0); }
    if (pose === 'cross') { set('R', -0.45, -0.05, -0.9); set('L', -0.55, -0.05, -0.9); arms.R.el.rotation.z = 1.35; arms.L.el.rotation.z = -1.35; }
    if (pose === 'hands') { set('R', -0.3, -0.42, -1.25); set('L', -0.3, -0.42, -1.25); }
    if (pose === 'hug') { set('R', -0.5, -0.45, -1.6); set('L', -0.35, -0.5, -1.7); prop = P[c.prop](torso); prop.position.set(-0.02, 0.02, 0.1); prop.rotation.set(-0.15, 0.1, -0.12); }
    const rest = {}; for (const k in arms) rest[k] = { x: arms[k].sh.rotation.x, z: arms[k].sh.rotation.z, e: arms[k].el.rotation.x };
    root.userData.rig = { body, torso, head, legs, arms, eyes, mouth, hold, rest, pose };
    return root;
  }

  // Character sheet — colours sampled from assets/character/team/lineup-cut.webp & advisors/*.webp
  const roster = [
    { id: 'ceo', label: 'CEO', name: 'Minh Long', note2: 'Nhà lãnh đạo tầm nhìn', note: 'La bàn chiến lược', skin: 0xe8b08c, hair: 0x7a5238, hairStyle: 'short', hairCap: 0.42,
      top: 0x2e3d6a, bottom: 0x2e3d6a, shoe: 0x6b4128, shirtFront: 0xf1efe9, tie: 0x2a3456, jacket: true, cuff: 0xf1efe9, pose: 'chest', prop: 'compass', badge: 'CEO',
      line: 'Mình giữ la bàn. Mỗi vòng, cả đội chọn hướng đi, mình chốt quyết định.' },
    { id: 'cfo', label: 'CFO', name: 'Thu Hà', note2: 'Chiến lược gia tài chính', note: 'Túi ngân sách', skin: 0xecb896, hair: 0xe0b46a, hairStyle: 'bob', smile: 'open',
      top: 0x8a8886, bottom: 0x7e7c7a, shoe: 0x2e2c2c, shirtFront: 0xf4f1ea, jacket: true, heels: true, pose: 'both', prop: 'moneybag', badge: 'CFO',
      line: 'Tiền mặt là oxy. Trước khi mở rộng, mình tính dòng tiền cho sáu vòng.' },
    { id: 'cmo', label: 'CMO', name: 'Mạnh Chi', note2: 'Phù thủy marketing', note: 'Loa thương hiệu', skin: 0xe8b08c, hair: 0x6a4630, hairStyle: 'short', hairCap: 0.42, smile: 'open',
      top: 0xb45a36, bottom: 0xc8a57a, shoe: 0x8a5a34, shirtFront: 0xf1ebe0, openJacket: true, cuff: 0xf1ebe0, jacket: true, pose: 'megaphone', prop: 'megaphone', badge: 'CMO',
      line: 'Khách hàng phải nghe thấy mình trước đối thủ. Thương hiệu là tài sản.' },
    { id: 'coo', label: 'COO', name: 'Bảo Ngọc', note2: 'Chuyên gia vận hành', note: 'Máy tính bảng', skin: 0xe8b590, hair: 0x7a5238, hairStyle: 'bob',
      top: 0xa9c6ea, bottomType: 'skirt', skirt: 0x6f94cc, skirtLen: 0.3, skirtFlare: 0.12, shoe: 0x8fb0dc, heels: true, collar: 0xbcd2ec, pose: 'tablet', prop: 'tablet', badge: 'COO',
      line: 'Kế hoạch hay đến đâu cũng phải chạy được. Xưởng, kho, giao hàng để mình lo.' },
    { id: 'sec', label: 'SEC', name: 'Gia Hân', note2: 'Thư ký pháp chế', note: 'Bảng biên bản', skin: 0x9a6040, hair: 0x3a261c, hairStyle: 'bunTop', earring: true,
      top: 0x5f8a54, bottom: 0x4f7a48, shoe: 0x5a3a28, collar: 0x86ae76, buttons: 4, waistband: true, pose: 'clipboard', prop: 'clipboard', badge: 'SEC',
      line: 'Lịch họp, biên bản, hạn chót — mọi thứ đã được ghi lại.' },
    { id: 'lumina', label: 'Lumina', name: 'Cố vấn chiến lược', note: 'Áo dài trắng · hoa sen', skin: 0xf2c8aa, hair: 0x8a5a3a, hairStyle: 'wavy', hairFlower: true, flagPin: true,
      top: 0xf6f1e8, bottom: 0xf6f1e8, aoDai: 0.5, shoe: 0xefe2c4, heels: true, pose: 'lotus',
      line: 'Chào CEO! Mình là Lumina. Mình sẽ đi cùng đội qua sáu vòng Bật Nghiệp.' },
    { id: 'tu', label: 'Tú Phan', name: 'Cố vấn học thuật', note: 'Áo dài trắng · cuộn chứng nhận', skin: 0xe8b08c, hair: 0x1f1a18, hairStyle: 'slick', smile: 'open',
      top: 0xf4f1ea, bottom: 0xf4f1ea, aoDai: 0.34, shoe: 0xefe2c4, pose: 'scroll',
      line: 'Dữ liệu cho ta biết quá khứ, quyết định hôm nay viết nên tương lai.' },
    { id: 'victor', label: 'Thầy Tú Phan', name: 'Giảng viên cố vấn', note: 'Chiến lược quốc tế hoá', skin: 0xe6b28e, hair: 0x9c9c9c, hairStyle: 'grey', hairCap: 0.42,
      top: 0x2f3a5c, bottom: 0x2f3a5c, shoe: 0x252525, shirtFront: 0xf1efe9, jacket: true, pin: true, cuff: 0xf1efe9, pose: 'hug', prop: 'folder',
      line: 'Thị trường không chờ ai. Tôi đã đọc báo cáo — còn các bạn thì sao?' },
    { id: 'alpha', label: 'Alpha Dynamics', name: 'Đối thủ ảo · Giá rẻ tốc chiến', note: 'Biên lợi nhuận mỏng – đừng đua giá đáy', skin: 0xecc0a0, hair: 0x2a4a8a, hairStyle: 'slick',
      top: 0x2f5fb8, bottom: 0x2f5fb8, shoe: 0x7a4a2a, shirtFront: 0xf4f1ea, tie: 0x2a4a9a, jacket: true, pin: true, cuff: 0xf4f1ea, pose: 'pocket',
      line: 'Giá rẻ nhất thắng. Các bạn theo kịp không?' },
    { id: 'mekong', label: 'Mekong Ventures', name: 'Đối thủ ảo · Cân bằng chắc chắn', note: 'Phản ứng chậm với biến động', skin: 0xe2ac86, hair: 0x4a5a7a, hairStyle: 'short', hairCap: 0.44,
      top: 0x55809a, bottom: 0x2e3a4a, shoe: 0x2a2624, shirtFront: 0xe8dcc4, vest: 0xc8a878, jacket: true, pin: true, cuff: 0xe8dcc4, pose: 'cross',
      line: 'Chậm mà chắc. Mekong không vội.' },
    { id: 'starclay', label: 'Star Clay Co.', name: 'Đối thủ ảo · Cao cấp thương hiệu', note: 'Thủ công khó mở rộng', skin: 0xf0c3a3, hair: 0x7a4a30, hairStyle: 'bob', feather: true,
      top: 0x6a3aa8, bottomType: 'skirt', skirt: 0x6a3aa8, skirtLen: 0.24, skirtFlare: 0.12, shoe: 0x7a4ac0, heels: true, collar: 0x9a7ad0, buttons: 4, btnColor: 0xd9b35a, pose: 'trophy',
      line: 'Thương hiệu cao cấp không cần giảm giá.' },
  ];
  // Nhân vật dùng ảnh render 3D gốc (billboard) thay mô hình khối.
  const ART = { ceo: 'solid/ceo-tex.webp', cfo: 'solid/cfo-tex.webp', cmo: 'solid/cmo-tex.webp', coo: 'solid/coo-tex.webp', sec: 'solid/sec-tex.webp', lumina: 'solid/lumina-tex.webp', tu: 'solid/tu-phan-tex-v3.webp', alpha: 'solid/alpha-full-tex.webp', mekong: 'rivals/mekong.webp', starclay: 'rivals/star.webp' };
  const ART_PAD = { mekong: 0.07, starclay: 0.07 };
  const ART_H = { mekong: 1.4, starclay: 1.4,  ceo: 1.2, cfo: 1.12, cmo: 1.2, coo: 1.12, sec: 1.1, lumina: 1.14, tu: 1.18, alpha: 1.2 };
  const TL = new THREE.TextureLoader(), texCache = {}, blobMat = new THREE.MeshBasicMaterial({ color: 0x3a2a1a, transparent: true, opacity: 0.22, depthWrite: false });
  const ARTBASE = (typeof window !== 'undefined' && window.BIZON_ART_BASE) || 'assets/character/';
  function artChar(id) {
    const root = new THREE.Group(); root.name = 'char_' + id; const body = new THREE.Group(); root.add(body);
    const h = ART_H[id] || 1.15, sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: false, alphaTest: 0.5, depthWrite: true, toneMapped: false }));
    // Ảnh tách nền còn vùng áo trắng bán trong suốt → sàn lộ qua như vết bẩn. Đẩy alpha lên đặc, chỉ giữ viền mềm.
    sp.material.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <alphatest_fragment>', 'diffuseColor.a = smoothstep(0.03, 0.22, diffuseColor.a); if (diffuseColor.a < 0.02) discard;'); };
    sp.material.customProgramCacheKey = () => 'bizonArtSolid';
    sp.center.set(0.5, ART_PAD[id] || 0); sp.scale.set(h * 0.4, h, 1); sp.visible = false; body.add(sp);
    sp.material.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <alphatest_fragment>', 'diffuseColor.a = smoothstep(0.03, 0.2, diffuseColor.a);\n#include <alphatest_fragment>'); };
    const apply = t => { sp.material.map = t; sp.material.needsUpdate = true; sp.userData.aspect = t.image.width / t.image.height; sp.scale.set(h * sp.userData.aspect, h, 1); sp.visible = true; };
    const src = ARTBASE + ART[id];
    if (texCache[src] && texCache[src].image) apply(texCache[src]);
    else if (texCache[src]) texCache[src].__w.push(apply);
    else { const t = TL.load(src, () => { t.__w.forEach(f => f(t)); }); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = (typeof window !== 'undefined' && window.__MAXANISO) || 8; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; t.__w = [apply]; texCache[src] = t; }
    const blob = new THREE.Mesh(new THREE.CircleGeometry(0.2, 24), blobMat); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.004; blob.scale.set(1, 0.7, 1); blob.renderOrder = -1; root.add(blob);
    const d = () => new THREE.Object3D();
    root.userData.rig = { art: true, sprite: sp, h, body, torso: body, head: d(), legs: [d(), d()], arms: {}, eyes: [], mouth: d(), hold: {}, rest: {}, pose: 'art' };
    return root;
  }
  const USE_ART = !(typeof window !== 'undefined' && window.BIZON_CHAR_ART === false);
  const build = id => (USE_ART && ART[id]) ? artChar(id) : character(roster.find(r => r.id === id));

  // Animation: mode 'idle' | 'talk' | 'walk'. Call every frame.
  function animate(root, t, mode, phase = 0) {
    const r = root.userData.rig; if (!r) return;
    const tt = t + phase;
    if (r.art) {
      const s = r.sprite, w = (s.userData.aspect || 0.4) * r.h;
      if (mode === 'walk') { r.body.position.y = Math.abs(Math.sin(tt * 7)) * 0.035; r.body.rotation.z = 0; s.material.rotation = Math.sin(tt * 7) * 0.035; s.scale.set(w, r.h, 1); }
      else if (mode === 'talk') { const k = Math.abs(Math.sin(tt * 4.2)); r.body.position.y = k * 0.02; s.material.rotation = Math.sin(tt * 1.7) * 0.03; s.scale.set(w * (1 - k * 0.015), r.h * (1 + k * 0.025), 1); }
      else { const b = Math.sin(tt * 2.2); r.body.position.y = 0; s.material.rotation = Math.sin(tt * 0.8) * 0.01; s.scale.set(w * (1 - b * 0.004), r.h * (1 + b * 0.008), 1); }
      return;
    }
    const walk = mode === 'walk', talk = mode === 'talk';
    const breathe = Math.sin(tt * 2.2);
    r.torso.scale.set(1 + breathe * 0.006, 1 + breathe * 0.012, 1);
    const blink = (tt % 3.7) < 0.12 ? 0.15 : 1;
    r.eyes.forEach(e => e.scale.y = blink);
    const stride = walk ? Math.sin(tt * 7) : 0;
    r.legs[0].rotation.x = stride * 0.55; r.legs[1].rotation.x = -stride * 0.55;
    r.body.position.y = walk ? Math.abs(Math.cos(tt * 7)) * 0.022 : 0;
    r.torso.rotation.z = walk ? stride * 0.04 : Math.sin(tt * 0.9) * 0.015;
    r.head.rotation.y = talk ? Math.sin(tt * 1.7) * 0.18 : Math.sin(tt * 0.6) * 0.08;
    r.head.rotation.x = talk ? Math.sin(tt * 5.3) * 0.06 : 0;
    r.mouth.scale.set(1, talk ? 0.6 + Math.abs(Math.sin(tt * 11)) * 1.6 : 1, 1);
    for (const k in r.arms) {
      const a = r.arms[k], rs = r.rest[k];
      if (r.hold[k]) { a.sh.rotation.x = rs.x + (walk ? 0.04 * stride : 0); continue; }
      if (walk) { a.sh.rotation.x = (k === 'L' ? stride : -stride) * 0.5; a.el.rotation.x = -0.25; a.sh.rotation.z = a.s * 0.1; }
      else if (talk) { a.sh.rotation.x = rs.x - 0.3 - Math.sin(tt * 3) * 0.25; a.el.rotation.x = rs.e - 0.6 + Math.sin(tt * 3.4) * 0.3; a.sh.rotation.z = rs.z + 0.15; }
      else { a.sh.rotation.x = rs.x + Math.sin(tt * 1.1) * 0.04; a.el.rotation.x = rs.e; a.sh.rotation.z = rs.z; }
    }
  }
  return { roster, build, animate };
}
