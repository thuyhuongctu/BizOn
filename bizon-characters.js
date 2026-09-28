// BizOn B·∫≠t Nghi·ªáp ‚Äî clay 3D characters, built from the repo's character art (assets/character/team, advisors).
// makeCharacters(THREE) ‚Üí { roster, build(id) }. Each built character exposes .userData.rig for animation.
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
    // torso: tapered lathe (waist ‚Üí shoulders)
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
    // head (built at r‚âà0.14, scaled down for game proportions ‚âà 1/5 of height)
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
      add('hair_back', sph(0.14), hair, 0, 0., -0.03, head);
      add('hair_bun', sph(0.06), hair, 0, 0.14, -0.06, head);
    }
    if (c.hairStyle === 'long') {
      add('hair_back', sph(0.145), hair, 0, 0, -0.03, head);
      add('hair_long', cap(0.13, 0.22), hair, 0, -0.17, -0.06, head).scale.set(1.15, 1, 0.55);
      for (const s of [-1, 1]) add('hair_side', cap(0.05, 0.22), hair, s * 0.13, -0.13, 0.0, head).rotation.z = s * 0.1;
      add('hair_fringe', sph(0.075), hair, 0.035, 0.095, 0.07, head).scale.set(1.35, 0.45, 0.85);
    }
    // arms: shoulder ‚Üí elbow
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

  // Character sheet ‚Äî colours sampled from assets/character/team/lineup-cut.webp & advisors/*.webp
  const roster = [
    { id: 'ceo', label: 'CEO', name: 'Minh Long', note2: 'Nh√† l√£nh ƒë·∫°o t·∫ßm nh√¨n', note: 'La b√†n chi·∫øn l∆∞ÜÓ£c', skin: 0xe8b08c, hair: 0x7a5238, hairStyle: 'short', hairCap: 0.42,
      top: 0x2e3d6a, bottom: 0x2e3d6a, shoe: 0x6b4128, shirtFront: 0xf1efe9, tie: 0x2a3456, jacket: true, cuff: 0xf1efe9, pose: 'chest', prop: 'compass', badge: 'CEO',
      line: 'M√¨nh gi·ªØ la b√†n. M·ªói v√≤ng, c·∫£ ƒë·ªôi ch·ªçn h∆∞·ªõng ƒëi, m√¨nh ch·ªãt quy·∫øt ƒë·ªãnh.' },
    { id: 'cfo', label: 'CFO', name: 'Thu H√†', note2: 'Chi·∫øn l∆∞ÜÓ£c gia t√†i ch√≠nh', note: 'T√∫i ng√¢n s√°ch', skin: 0xecb896, hair: 0xe0b46a, hairStyle: 'bob', smile: 'open',
      top: 0x8a8886, bottom: 0x7e7c7a, shoe: 0x2e2c2c, shirtFront: 0xf4f1ea, jacket: true, heels: true, pose: 'both', prop: 'moneybag', badge: 'CFO',
      line: 'TiÜÁ∏Å∑ÜÍ›–Å≥ÄÅΩ·‰∏ÅQÀ¿h1¥ÂåÅ≠°§Å∑ÜÓ|ÅÀÜÓeπú∞Å∑±π†Å”µπ†Åì…πúÅ—ßÜÓ∏Åç°ºÅœÖ‘Å€…πú∏úÅÙ∞(ÄÄÄÅÏÅ•êËÄùçµºú∞Å±Öâï∞ËÄù5<ú∞ÅπÖµîËÄù7ÜÍÖπ†Å°§ú∞ÅπΩ—î»ËÄùA£‰Å—£ÜÓù§ÅµÖ…≠ï—•πúú∞ÅπΩ—îËÄù1ΩÑÅ—£√ÖπúÅ°ßÜÓ‘ú∞ÅÕ≠•∏ËÄ¡·î·à¿·å∞Å°Ö•»ËÄ¡‡ŸÑ–ÿÃ¿∞Å°Ö•…M—Â±îËÄùÕ°Ω…–ú∞Å°Ö•…Ö¿ËÄ¿∏–»∞ÅÕµ•±îËÄùΩ¡ï∏ú∞(ÄÄÄÄÄÅ—Ω¿ËÄ¡·à–’ÑÃÿ∞ÅâΩ——Ω¥ËÄ¡·å·Ñ‘›Ñ∞ÅÕ°ΩîËÄ¡‡·Ñ’ÑÃ–∞ÅÕ°•…—…Ωπ–ËÄ¡·ò≈ïâî¿∞ÅΩ¡ïπ)Öç≠ï–ËÅ—…’î∞Åç’ôòËÄ¡·ò≈ïâî¿∞Å©Öç≠ï–ËÅ—…’î∞Å¡ΩÕîËÄùµïùÖ¡°Ωπîú∞Å¡…Ω¿ËÄùµïùÖ¡°Ωπîú∞ÅâÖëùîËÄù5<ú∞(ÄÄÄÄÄÅ±•πîËÄù-£Öç†Å£ÅπúÅ¡£ÜÍç§Åπù°îÅ—£ÜÍï‰Å∑±π†Å—À√ÜÓmåÉGÜÓE§Å—£ÜÓú∏ÅQ£√ÖπúÅ°ßÜÓ‘Å≥ÄÅ”Å§ÅœÜÍç∏∏úÅÙ∞(ÄÄÄÅÏÅ•êËÄùçΩºú∞Å±Öâï∞ËÄù=<ú∞ÅπÖµîËÄùÜÍçºÅ9üÜÓ5åú∞ÅπΩ—î»ËÄù°’Á©∏Åù•ÑÅ€ÜÍµ∏Å£Åπ†ú∞ÅπΩ—îËÄù7Ö‰Å”µπ†ÅãÜÍçπúú∞ÅÕ≠•∏ËÄ¡·î·à‘‰¿∞Å°Ö•»ËÄ¡‡›Ñ‘»Ã‡∞Å°Ö•…M—Â±îËÄùâΩàú∞(ÄÄÄÄÄÅ—Ω¿ËÄ¡·ÑÂåŸïÑ∞ÅâΩ——ΩµQÂ¡îËÄùÕ≠•…–ú∞ÅÕ≠•…–ËÄ¡‡Ÿò‰—çå∞ÅÕ≠•…—1ï∏ËÄ¿∏Ã∞ÅÕ≠•…—±Ö…îËÄ¿∏ƒ»∞ÅÕ°ΩîËÄ¡‡·ôà¡ëå∞Å°ïï±ÃËÅ—…’î∞ÅçΩ±±Ö»ËÄ¡·âçê…ïå∞Å¡ΩÕîËÄù—Öâ±ï–ú∞Å¡…Ω¿ËÄù—Öâ±ï–ú∞ÅâÖëùîËÄù=<ú∞(ÄÄÄÄÄÅ±•πîËÄù/ÜÍ¸Å°øÜÍÖç†Å°Ö‰ÉGÜÍ˝∏ÉGâ‘Åè•πúÅ¡£ÜÍç§Åç£ÜÍÖ‰ÉG√ÜÓçå∏Åc√ÜÓ}πú∞Å≠°º∞Åù•ÖºÅ£ÅπúÉGÜÓÅ∑±π†Å±º∏úÅÙ∞(ÄÄÄÅÏÅ•êËÄùÕïåú∞Å±Öâï∞ËÄùMú∞ÅπÖµîËÄù•ÑÅ#â∏ú∞ÅπΩ—î»ËÄùQ£¿ÅØÙÅ¡£Ö¿Åç£ÜÍ¸ú∞ÅπΩ—îËÄùÜÍçπúÅâß©∏ÅãÜÍç∏ú∞ÅÕ≠•∏ËÄ¡‡ÂÑÿ¿–¿∞Å°Ö•»ËÄ¡‡ÕÑ»ÿ≈å∞Å°Ö•…M—Â±îËÄùâ’πQΩ¿ú∞ÅïÖ……•πúËÅ—…’î∞(ÄÄÄÄÄÅ—Ω¿ËÄ¡‡’ò·Ñ‘–∞ÅâΩ——Ω¥ËÄ¡‡—ò›Ñ–‡∞ÅÕ°ΩîËÄ¡‡’ÑÕÑ»‡∞ÅçΩ±±Ö»ËÄ¡‡‡ŸÖî‹ÿ∞Åâ’——ΩπÃËÄ–∞Å›Ö•Õ—âÖπêËÅ—…’î∞Å¡ΩÕîËÄùç±•¡âΩÖ…êú∞Å¡…Ω¿ËÄùç±•¡âΩÖ…êú∞ÅâÖëùîËÄùMú∞(ÄÄÄÄÄÅ±•πîËÄù3ÜÓ-ç†Å£ÜÓ5¿∞Åâß©∏ÅãÜÍç∏∞Å£ÜÍÖ∏Åç£Õ–ÉäPÅ∑ÜÓ5§Å—£ÜÓ§ÉGåÉG√ÜÓçåÅù°§Å≥ÜÍÖ§∏úÅÙ∞(ÄÄÄÅÏÅ•êËÄù±’µ•πÑú∞Å±Öâï∞ËÄù1’µ•πÑú∞ÅπÖµîËÄùÜÓDÅ€ÜÍï∏Å$ú∞ÅπΩ—îËÄüºÅìÅ§Å—ÀÜÍΩπúÉ
‹Å°ΩÑÅÕï∏ú∞ÅÕ≠•∏ËÄ¡·ò…å·ÖÑ∞Å°Ö•»ËÄ¡‡·Ñ’ÑÕÑ∞Å°Ö•…M—Â±îËÄù›ÖŸ‰ú∞Å°Ö•…±Ω›ï»ËÅ—…’î∞Åô±ÖùA•∏ËÅ—…’î∞(ÄÄÄÄÄÅ—Ω¿ËÄ¡·òŸò≈î‡∞ÅâΩ——Ω¥ËÄ¡·òŸò≈î‡∞ÅÖΩÖ§ËÄ¿∏‘∞ÅÕ°ΩîËÄ¡·ïôî…å–∞Å°ïï±ÃËÅ—…’î∞Å¡ΩÕîËÄù±Ω—’Ãú∞(ÄÄÄÄÄÅ±•πîËÄù£ÅºÅ<ÑÅ7±π†Å≥ÄÅ1’µ•πÑ∏Å7±π†ÅœÜÍÙÉE§ÅèÂπúÉGÜÓe§Å≈’ÑÅœÖ‘Å€…πúÅÜÍµ–Å9ù°ßÜÓ¿∏úÅÙ∞(ÄÄÄÅÏÅ•êËÄù—‘ú∞Å±Öâï∞ËÄùSËÅA°Ö∏ú∞ÅπÖµîËÄùÜÓDÅ€ÜÍï∏Å£ÜÓ5åÅ—°◊ÜÍµ–ú∞ÅπΩ—îËÄüºÅìÅ§Å—ÀÜÍΩπúÉ
‹Åç◊ÜÓe∏Åç£ÜÓ•πúÅπ£ÜÍµ∏ú∞ÅÕ≠•∏ËÄ¡·î·à¿·å∞Å°Ö•»ËÄ¡‡≈ò≈Ñƒ‡∞Å°Ö•…M—Â±îËÄùÕ±•ç¨ú∞ÅÕµ•±îËÄùΩ¡ï∏ú∞(ÄÄÄÄÄÅ—Ω¿ËÄ¡·ò—ò≈ïÑ∞ÅâΩ——Ω¥ËÄ¡·ò—ò≈ïÑ∞ÅÖΩÖ§ËÄ¿∏Ã–∞ÅÕ°ΩîËÄ¡·ïôî…å–∞Å¡ΩÕîËÄùÕç…Ω±∞ú∞(ÄÄÄÄÄÅ±•πîËÄùÜÓºÅ±ßÜÓ‘Åç°ºÅ—ÑÅâßÜÍ˝–Å≈◊ÑÅ≠£ÜÓ§∞Å≈’ÁÜÍ˝–ÉGÜÓ-π†Å£—¥ÅπÖ‰ÅŸßÜÍ˝–Åª©∏Å”√ÖπúÅ±Ö§∏úÅÙ∞(ÄÄÄÅÏÅ•êËÄùŸ•ç—Ω»ú∞Å±Öâï∞ËÄùY•ç—Ω»Å3â¥ú∞ÅπÖµîËÄüCÜÓE§Å”ÖåÄºÉGÜÓE§Å—£ÜÓúú∞ÅπΩ—îËÄù#ÜÓLÅœÑÅ—£ÜÓ,Å—À√ÜÓuπúú∞ÅÕ≠•∏ËÄ¡·îŸà»·î∞Å°Ö•»ËÄ¡‡ÂåÂåÂå∞Å°Ö•…M—Â±îËÄùù…ï‰ú∞Å°Ö•…Ö¿ËÄ¿∏–»∞(ÄÄÄÄÄÅ—Ω¿ËÄ¡‡…òÕÑ’å∞ÅâΩ——Ω¥ËÄ¡‡…òÕÑ’å∞ÅÕ°ΩîËÄ¡‡»‘»‘»‘∞ÅÕ°•…—…Ωπ–ËÄ¡·ò≈ïôî‰∞Å©Öç≠ï–ËÅ—…’î∞Å¡•∏ËÅ—…’î∞Åç’ôòËÄ¡·ò≈ïôî‰∞Å¡ΩÕîËÄù°’úú∞Å¡…Ω¿ËÄùôΩ±ëï»ú∞(ÄÄÄÄÄÅ±•πîËÄùQ£ÜÓ,Å—À√ÜÓuπúÅ≠£—πúÅç£ÜÓtÅÖ§∏ÅS—§ÉGåÉGÜÓ5åÅãÖºÅèÖºÉäPÅè…∏ÅèÖåÅãÜÍÖ∏Å—£∞ÅÕÖº¸úÅÙ∞(ÄÄÄÅÏÅ•êËÄùÖ±¡°Ñú∞Å±Öâï∞ËÄù±¡°ÑÅÂπÖµ•çÃú∞ÅπÖµîËÄüCÜÓE§Å—£ÜÓúÅ$É
‹ÅßÑÅ…£ÜÓ,Å”ÜÓUåÅç°ßÜÍ˝∏ú∞ÅπΩ—îËÄù	§ôπ†çÖÖ–ÏÅ≥ÜÓç§Åπ°§¿¡úÅ∑ÜÓ=πúÉäLÉGÜÓ•πúÉGï•ÑÅùßÑÉGÖ‰ú∞ÅÕ≠•∏ËÄ¡·ïçå¡Ñ¿∞Å°Ö•»ËÄ¡‡…Ñ—Ñ·Ñ∞Å°Ö•…M—Â±îËÄùÕ±•ç¨ú∞(ÄÄÄÄÄÅ—Ω¿ËÄ¡‡…ò’ôà‡∞ÅâΩ——Ω¥ËÄ¡‡…ò’ôà‡∞ÅÕ°ΩîËÄ¡‡›Ñ—Ñ…Ñ∞ÅÕ°•…—…Ωπ–ËÄ¡·ò—ò≈ïÑ∞Å—•îËÄ¡‡…Ñ—ÑÂÑ∞Å©Öç≠ï–ËÅ—…’î∞Å¡•∏ËÅ—…’î∞Åç’ôòËÄ¡·ò—ò≈ïÑ∞Å¡ΩÕîËÄù¡Ωç≠ï–ú∞(ÄÄÄÄÄÅ±•πîËÄùßÑÅÀÜÓÏÅπ£ÜÍï–Å—£ÜÍΩπú∏ÅÖåÅãÜÍÖ∏Å—°ïºÅØÜÓ-¿Å≠£—πú¸úÅÙ∞(ÄÄÄÅÏÅ•êËÄùµï≠Ωπúú∞Å±Öâï∞ËÄù5ï≠ΩπúÅYïπ—’…ïÃú∞ÅπÖµîËÄüCÜÓE§Å—£ÜÓúÅ$É
‹Åâ∏ÅãÜÍ≈πúÅç£ÜÍΩåÅç£ÜÍΩ∏ú∞ÅπΩ—îËÄùA£ÜÍç∏ÉÜÓ•πúÅç£ÜÍµ¥Å€ÜÓm§ÅâßÜÍ˝∏ÉGÜÓeπúú∞ÅÕ≠•∏ËÄ¡·î…Öå‡ÿ∞Å°Ö•»ËÄ¡‡—Ñ’Ñ›Ñ∞Å°Ö•…M—Â±îËÄùÕ°Ω…–ú∞Å°Ö•…Ö¿ËÄ¿∏––∞(ÄÄÄÄÄÅ—Ω¿ËÄ¡‡‘‘‡¿ÂÑ∞ÅâΩ——Ω¥ËÄ¡‡…îÕÑ—Ñ∞ÅÕ°ΩîËÄ¡‡…Ñ»ÿ»–∞ÅÕ°•…—…Ωπ–ËÄ¡·î·ëçå–∞ÅŸïÕ–ËÄ¡·å·Ñ‡‹‡∞Å©Öç≠ï–ËÅ—…’î∞Å¡•∏ËÅ—…’î∞Åç’ôòËÄ¡·î·ëçå–∞Å¡ΩÕîËÄùç…ΩÕÃú∞(ÄÄÄÄÄÅ±•πîËÄù£ÜÍµ¥Å∑ÄÅç£ÜÍΩå∏Å5ï≠ΩπúÅ≠£—πúÅ€ÜÓe§∏úÅÙ∞(ÄÄÄÅÏÅ•êËÄùÕ—Ö…ç±Ö‰ú∞Å±Öâï∞ËÄùM—Ö»Å±Ö‰Åº∏ú∞ÅπÖµîËÄüCÜÓE§Å—£ÜÓúÅ$É
‹ÅÖºÅèÜÍï¿Å—£√ÖπúÅ°ßÜÓ‘ú∞ÅπΩ—îËÄùQ£ÜÓúÅè—πúÅ≠£ÃÅ∑ÜÓ|ÅÀÜÓeπúú∞ÅÕ≠•∏ËÄ¡·ò¡åÕÑÃ∞Å°Ö•»ËÄ¡‡›Ñ—ÑÃ¿∞Å°Ö•…M—Â±îËÄùâΩàú∞ÅôïÖ—°ï»ËÅ—…’î∞(ÄÄÄÄÄÅ—Ω¿ËÄ¡‡ŸÑÕÖÑ‡∞ÅâΩ——ΩµQÂ¡îËÄùÕ≠•…–ú∞ÅÕ≠•…–ËÄ¡‡ŸÑÕÖÑ‡∞ÅÕ≠•…—1ï∏ËÄ¿∏»–∞ÅÕ≠•…—±Ö…îËÄ¿∏ƒ»∞ÅÕ°ΩîËÄ¡‡›Ñ—Öå¿∞Å°ïï±ÃËÅ—…’î∞ÅçΩ±±Ö»ËÄ¡‡ÂÑ›Öê¿∞Åâ’——ΩπÃËÄ–∞Åâ—πΩ±Ω»ËÄ¡·êÂàÃ’Ñ∞Å¡ΩÕîËÄù—…Ω¡°‰ú∞(ÄÄÄÄÄÅ±•πîËÄùQ£√ÖπúÅ°ßÜÓ‘ÅçÖºÅèÜÍï¿Å≠£—πúÅèÜÍù∏ÅùßÜÍç¥ÅùßÑ∏úÅÙ∞(ÄÅtÏ(ÄÄººÅ9£â∏Å€ÜÍµ–ÅìÂπúÉÜÍçπ†Å…ïπëï»ÄÕÅüÜÓEåÄ°â•±±âΩÖ…ê§Å—°Ö‰Å∑–Å£±π†Å≠£ÜÓE§∏(ÄÅçΩπÕ–ÅIPÄÙÅÏÅçïºËÄùÕΩ±•êΩçïºµ—ï‡π›ïâ¿ú∞ÅçôºËÄùÕΩ±•êΩçôºµ—ï‡π›ïâ¿ú∞ÅçµºËÄùÕΩ±•êΩçµºµ—ï‡π›ïâ¿ú∞ÅçΩºËÄùÕΩ±•êΩçΩºµ—ï‡π›ïâ¿ú∞ÅÕïåËÄùÕΩ±•êΩÕïåµ—ï‡π›ïâ¿ú∞Å±’µ•πÑËÄùÕΩ±•êΩ±’µ•πÑµ—ï‡π›ïâ¿ú∞Å—‘ËÄùÕΩ±•êΩ—‘µ¡°Ö∏µ—ï‡π›ïâ¿ú∞ÅÖ±¡°ÑËÄùÕΩ±•êΩÖ±¡°Ñµô’±∞µ—ï‡π›ïâ¿ú∞Åµï≠ΩπúËÄù…•ŸÖ±ÃΩµï≠Ωπúπ›ïâ¿ú∞ÅÕ—Ö…ç±Ö‰ËÄù…•ŸÖ±ÃΩÕ—Ö»π›ïâ¿úÅÙÏ(ÄÅçΩπÕ–ÅIQ}AÄÙÅÏÅµï≠ΩπúËÄ¿∏¿‹∞ÅÕ—Ö…ç±Ö‰ËÄ¿∏¿‹ÅÙÏ(ÄÅçΩπÕ–ÅIQ} ÄÙÅÏÅµï≠ΩπúËÄƒ∏–∞ÅÕ—Ö…ç±Ö‰ËÄƒ∏–∞ÄÅçïºËÄƒ∏»∞ÅçôºËÄƒ∏ƒ»∞ÅçµºËÄƒ∏»∞ÅçΩºËÄƒ∏ƒ»∞ÅÕïåËÄƒ∏ƒ∞Å±’µ•πÑËÄƒ∏ƒ–∞Å—‘ËÄƒ∏ƒ‡∞ÅÖ±¡°ÑËÄƒ∏»ÅÙÏ(ÄÅçΩπÕ–ÅQ0ÄÙÅπï‹ÅQ!IπQï·—’…ï1ΩÖëï»†§∞Å—ï·Öç°îÄÙÅÌÙ∞Åâ±Ωâ5Ö–ÄÙÅπï‹ÅQ!Iπ5ïÕ°	ÖÕ•ç5Ö—ï…•Ö∞°ÏÅçΩ±Ω»ËÄ¡‡ÕÑ…Ñ≈Ñ∞Å—…ÖπÕ¡Ö…ïπ–ËÅ—…’î∞ÅΩ¡Öç•—‰ËÄ¿∏»»∞Åëï¡—°]…•—îËÅôÖ±ÕîÅÙ§Ï(ÄÅçΩπÕ–ÅIQ	MÄÙÄ°—Â¡ïΩòÅ›•πëΩ‹ÄÑÙÙÄù’πëïô•πïêúÄòòÅ›•πëΩ‹π	%i=9}IQ}	M§ÅÒÄùÖÕÕï—ÃΩç°Ö…Öç—ï»ºúÏ(ÄÅô’πç—•Ω∏ÅÖ…—°Ö»°•ê§ÅÏ(ÄÄÄÅçΩπÕ–Å…ΩΩ–ÄÙÅπï‹ÅQ!Iπ…Ω’¿†§ÏÅ…ΩΩ–ππÖµîÄÙÄùç°Ö…|úÄ¨Å•êÏÅçΩπÕ–ÅâΩë‰ÄÙÅπï‹ÅQ!Iπ…Ω’¿†§ÏÅ…ΩΩ–πÖëê°âΩë‰§Ï(ÄÄÄÅçΩπÕ–Å†ÄÙÅIQ}!m•ëtÅÒÄƒ∏ƒ‘∞ÅÕ¿ÄÙÅπï‹ÅQ!IπM¡…•—î°πï‹ÅQ!IπM¡…•—ï5Ö—ï…•Ö∞°ÏÅ—…ÖπÕ¡Ö…ïπ–ËÅôÖ±Õî∞ÅÖ±¡°ÖQïÕ–ËÄ¿∏‘∞Åëï¡—°]…•—îËÅ—…’î∞Å—Ωπï5Ö¡¡ïêËÅôÖ±ÕîÅÙ§§Ï(ÄÄÄÄººÉÜÍâπ†Å”Öç†ÅªÜÓ∏Åè…∏Å€ÂπúÉÖºÅ—ÀÜÍΩπúÅãÖ∏Å—…ΩπúÅÕ◊ÜÓE–ÉäHÅœÅ∏Å≥ÜÓdÅ≈’ÑÅπ£¿Å€ÜÍ˝–ÅãÜÍ•∏∏ÉCÜÍ•‰ÅÖ±¡°ÑÅ≥©∏ÉGÜÍ›å∞Åç£ÜÓ$ÅùßÜÓºÅŸßÜÓ∏Å∑ÜÓ¥∏(ÄÄÄÅÕ¿πµÖ—ï…•Ö∞πΩπ	ïôΩ…ïΩµ¡•±îÄÙÅÕ†ÄÙ¯ÅÏÅÕ†πô…Öùµïπ—M°Öëï»ÄÙÅÕ†πô…Öùµïπ—M°Öëï»π…ï¡±Öçî†úç•πç±’ëîÄÒÖ±¡°Ö—ïÕ—}ô…Öùµïπ–¯ú∞Äùë•ôô’ÕïΩ±Ω»πÑÄÙÅÕµΩΩ—°Õ—ï¿†¿∏¿Ã∞Ä¿∏»»∞Åë•ôô’ÕïΩ±Ω»πÑ§ÏÅ•òÄ°ë•ôô’ÕïΩ±Ω»πÑÄÄ¿∏¿»§Åë•ÕçÖ…êÏú§ÏÅÙÏ(ÄÄÄÅÕ¿πµÖ—ï…•Ö∞πç’Õ—ΩµA…Ωù…ÖµÖç°ï-ï‰ÄÙÄ†§ÄÙ¯Äùâ•ÈΩπ…—MΩ±•êúÏ(ÄÄÄÅÕ¿πçïπ—ï»πÕï–†¿∏‘∞ÅIQ}Am•ëtÅÒÄ¿§ÏÅÕ¿πÕçÖ±îπÕï–°†Ä®Ä¿∏–∞Å†∞Äƒ§ÏÅÕ¿πŸ•Õ•â±îÄÙÅôÖ±ÕîÏÅâΩë‰πÖëê°Õ¿§Ï(ÄÄÄÅÕ¿πµÖ—ï…•Ö∞πΩπ	ïôΩ…ïΩµ¡•±îÄÙÅÕ†ÄÙ¯ÅÏÅÕ†πô…Öùµïπ—M°Öëï»ÄÙÅÕ†πô…Öùµïπ—M°Öëï»π…ï¡±Öçî†úç•πç±’ëîÄÒÖ±¡°Ö—ïÕ—}ô…Öùµïπ–¯ú∞Äùë•ôô’ÕïΩ±Ω»πÑÄÙÅÕµΩΩ—°Õ—ï¿†¿∏¿Ã∞Ä¿∏»∞Åë•ôô’ÕïΩ±Ω»πÑ§Ìq∏ç•πç±’ëîÄÒÖ±¡°Ö—ïÕ—}ô…Öùµïπ–¯ú§ÏÅÙÏ(ÄÄÄÅçΩπÕ–ÅÖ¡¡±‰ÄÙÅ–ÄÙ¯ÅÏÅÕ¿πµÖ—ï…•Ö∞πµÖ¿ÄÙÅ–ÏÅÕ¿πµÖ—ï…•Ö∞ππïïëÕU¡ëÖ—îÄÙÅ—…’îÏÅÕ¿π’Õï…Ö—ÑπÖÕ¡ïç–ÄÙÅ–π•µÖùîπ›•ë—†ÄºÅ–π•µÖùîπ°ï•ù°–ÏÅÕ¿πÕçÖ±îπÕï–°†Ä®ÅÕ¿π’Õï…Ö—ÑπÖÕ¡ïç–∞Å†∞Äƒ§ÏÅÕ¿πŸ•Õ•â±îÄÙÅ—…’îÏÅÙÏ(ÄÄÄÅçΩπÕ–ÅÕ…åÄÙÅIQ	MÄ¨ÅIQm•ëtÏ(ÄÄÄÅ•òÄ°—ï·Öç°ïmÕ…çtÄòòÅ—ï·Öç°ïmÕ…çtπ•µÖùî§ÅÖ¡¡±‰°—ï·Öç°ïmÕ…çt§Ï(ÄÄÄÅï±ÕîÅ•òÄ°—ï·Öç°ïmÕ…çt§Å—ï·Öç°ïmÕ…çtπ}}‹π¡’Õ†°Ö¡¡±‰§Ï(ÄÄÄÅï±ÕîÅÏÅçΩπÕ–Å–ÄÙÅQ0π±ΩÖê°Õ…å∞Ä†§ÄÙ¯ÅÏÅ–π}}‹πôΩ…Öç†°òÄÙ¯Åò°–§§ÏÅÙ§ÏÅ–πçΩ±Ω…M¡ÖçîÄÙÅQ!IπMI	Ω±Ω…M¡ÖçîÏÅ–πÖπ•ÕΩ—…Ω¡‰ÄÙÄ°—Â¡ïΩòÅ›•πëΩ‹ÄÑÙÙÄù’πëïô•πïêúÄòòÅ›•πëΩ‹π}}5a9%M<§ÅÒÄ‡ÏÅ–πµ•π•±—ï»ÄÙÅQ!Iπ1•πïÖ…5•¡µÖ¡1•πïÖ…•±—ï»ÏÅ–πµÖù•±—ï»ÄÙÅQ!Iπ1•πïÖ…•±—ï»ÏÅ–πùïπï…Ö—ï5•¡µÖ¡ÃÄÙÅ—…’îÏÅ–π}}‹ÄÙÅmÖ¡¡±ÂtÏÅ—ï·Öç°ïmÕ…çtÄÙÅ–ÏÅÙ(ÄÄÄÅçΩπÕ–Åâ±ΩàÄÙÅπï‹ÅQ!Iπ5ïÕ†°πï‹ÅQ!Iπ•…ç±ïïΩµï—…‰†¿∏»∞Ä»–§∞Åâ±Ωâ5Ö–§ÏÅâ±Ωàπ…Ω—Ö—•Ω∏π‡ÄÙÄµ5Ö—†πA$ÄºÄ»ÏÅâ±Ωàπ¡ΩÕ•—•Ω∏π‰ÄÙÄ¿∏¿¿–ÏÅâ±ΩàπÕçÖ±îπÕï–†ƒ∞Ä¿∏‹∞Äƒ§ÏÅâ±Ωàπ…ïπëï…=…ëï»ÄÙÄ¥ƒÏÅ…ΩΩ–πÖëê°â±Ωà§Ï(ÄÄÄÅçΩπÕ–ÅêÄÙÄ†§ÄÙ¯Åπï‹ÅQ!Iπ=â©ïç–Õ†§Ï(ÄÄÄÅ…ΩΩ–π’Õï…Ö—Ñπ…•úÄÙÅÏÅÖ…–ËÅ—…’î∞ÅÕ¡…•—îËÅÕ¿∞Å†∞ÅâΩë‰∞Å—Ω…ÕºËÅâΩë‰∞Å°ïÖêËÅê†§∞Å±ïùÃËÅmê†§∞Åê†•t∞ÅÖ…µÃËÅÌÙ∞ÅïÂïÃËÅmt∞ÅµΩ’—†ËÅê†§∞Å°Ω±êËÅÌÙ∞Å…ïÕ–ËÅÌÙ∞Å¡ΩÕîËÄùÖ…–úÅÙÏ(ÄÄÄÅ…ï—’…∏Å…ΩΩ–Ï(ÄÅÙ(ÄÅçΩπÕ–ÅUM}IPÄÙÄÑ°—Â¡ïΩòÅ›•πëΩ‹ÄÑÙÙÄù’πëïô•πïêúÄòòÅ›•πëΩ‹π	%i=9}!I}IPÄÙÙÙÅôÖ±Õî§Ï(ÄÅçΩπÕ–Åâ’•±êÄÙÅ•êÄÙ¯Ä°UM}IPÄòòÅIQm•ët§Ä¸ÅÖ…—°Ö»°•ê§ÄËÅç°Ö…Öç—ï»°…ΩÕ—ï»πô•πê°»ÄÙ¯Å»π•êÄÙÙÙÅ•ê§§Ï((ÄÄººÅπ•µÖ—•Ω∏ËÅµΩëîÄù•ë±îúÅÄù—Ö±¨úÅÄù›Ö±¨ú∏ÅÖ±∞ÅïŸï…‰Åô…Öµî∏(ÄÅô’πç—•Ω∏ÅÖπ•µÖ—î°…ΩΩ–∞Å–∞ÅµΩëî∞Å¡°ÖÕîÄÙÄ¿§ÅÏ(ÄÄÄÅçΩπÕ–Å»ÄÙÅ…ΩΩ–π’Õï…Ö—Ñπ…•úÏÅ•òÄ†Ö»§Å…ï—’…∏Ï(ÄÄÄÅçΩπÕ–Å—–ÄÙÅ–Ä¨Å¡°ÖÕîÏ(ÄÄÄÅ•òÄ°»πÖ…–§ÅÏ(ÄÄÄÄÄÅçΩπÕ–ÅÃÄÙÅ»πÕ¡…•—î∞Å‹ÄÙÄ°Ãπ’Õï…Ö—ÑπÖÕ¡ïç–ÅÒÄ¿∏–§Ä®Å»π†Ï(ÄÄÄÄÄÅ•òÄ°µΩëîÄÙÙÙÄù›Ö±¨ú§ÅÏÅ»πâΩë‰π¡ΩÕ•—•Ω∏π‰ÄÙÅ5Ö—†πÖâÃ°5Ö—†πÕ•∏°—–Ä®Ä‹§§Ä®Ä¿∏¿Ã‘ÏÅ»πâΩë‰π…Ω—Ö—•Ω∏πËÄÙÄ¿ÏÅÃπµÖ—ï…•Ö∞π…Ω—Ö—•Ω∏ÄÙÅ5Ö—†πÕ•∏°—–Ä®Ä‹§Ä®Ä¿∏¿Ã‘ÏÅÃπÕçÖ±îπÕï–°‹∞Å»π†∞Äƒ§ÏÅÙ(ÄÄÄÄÄÅï±ÕîÅ•òÄ°µΩëîÄÙÙÙÄù—Ö±¨ú§ÅÏÅçΩπÕ–Å¨ÄÙÅ5Ö—†πÖâÃ°5Ö—†πÕ•∏°—–Ä®Ä–∏»§§ÏÅ»πâΩë‰π¡ΩÕ•—•Ω∏π‰ÄÙÅ¨Ä®Ä¿∏¿»ÏÅÃπµÖ—ï…•Ö∞π…Ω—Ö—•Ω∏ÄÙÅ5Ö—†πÕ•∏°—–Ä®Äƒ∏‹§Ä®Ä¿∏¿ÃÏÅÃπÕçÖ±îπÕï–°‹Ä®Ä†ƒÄ¥Å¨Ä®Ä¿∏¿ƒ‘§∞Å»π†Ä®Ä†ƒÄ¨Å¨Ä®Ä¿∏¿»‘§∞Äƒ§ÏÅÙ(ÄÄÄÄÄÅï±ÕîÅÏÅçΩπÕ–ÅàÄÙÅ5Ö—†πÕ•∏°—–Ä®Ä»∏»§ÏÅ»πâΩë‰π¡ΩÕ•—•Ω∏π‰ÄÙÄ¿ÏÅÃπµÖ—ï…•Ö∞π…Ω—Ö—•Ω∏ÄÙÅ5Ö—†πÕ•∏°—–Ä®Ä¿∏‡§Ä®Ä¿∏¿ƒÏÅÃπÕçÖ±îπÕï–°‹Ä®Ä†ƒÄ¥ÅàÄ®Ä¿∏¿¿–§∞Å»π†Ä®Ä†ƒÄ¨ÅàÄ®Ä¿∏¿¿‡§∞Äƒ§ÏÅÙ(ÄÄÄÄÄÅ…ï—’…∏Ï(ÄÄÄÅÙ(ÄÄÄÅçΩπÕ–Å›Ö±¨ÄÙÅµΩëîÄÙÙÙÄù›Ö±¨ú∞Å—Ö±¨ÄÙÅµΩëîÄÙÙÙÄù—Ö±¨úÏ(ÄÄÄÅçΩπÕ–Åâ…ïÖ—°îÄÙÅ5Ö—†πÕ•∏°—–Ä®Ä»∏»§Ï(ÄÄÄÅ»π—Ω…ÕºπÕçÖ±îπÕï–†ƒÄ¨Åâ…ïÖ—°îÄ®Ä¿∏¿¿ÿ∞ÄƒÄ¨Åâ…ïÖ—°îÄ®Ä¿∏¿ƒ»∞Äƒ§Ï(ÄÄÄÅçΩπÕ–Åâ±•π¨ÄÙÄ°—–ÄîÄÃ∏‹§ÄÄ¿∏ƒ»Ä¸Ä¿∏ƒ‘ÄËÄƒÏ(ÄÄÄÅ»πïÂïÃπôΩ…Öç†°îÄÙ¯ÅîπÕçÖ±îπ‰ÄÙÅâ±•π¨§Ï(ÄÄÄÅçΩπÕ–ÅÕ—…•ëîÄÙÅ›Ö±¨Ä¸Å5Ö—†πÕ•∏°—–Ä®Ä‹§ÄËÄ¿Ï(ÄÄÄÅ»π±ïùÕl¡tπ…Ω—Ö—•Ω∏π‡ÄÙÅÕ—…•ëîÄ®Ä¿∏‘‘ÏÅ»π±ïùÕl≈tπ…Ω—Ö—•Ω∏π‡ÄÙÄµÕ—…•ëîÄ®Ä¿∏‘‘Ï(ÄÄÄÅ»πâΩë‰π¡ΩÕ•—•Ω∏π‰ÄÙÅ›Ö±¨Ä¸Å5Ö—†πÖâÃ°5Ö—†πçΩÃ°—–Ä®Ä‹§§Ä®Ä¿∏¿»»ÄËÄ¿Ï(ÄÄÄÅ»π—Ω…Õºπ…Ω—Ö—•Ω∏πËÄÙÅ›Ö±¨Ä¸ÅÕ—…•ëîÄ®Ä¿∏¿–ÄËÅ5Ö—†πÕ•∏°—–Ä®Ä¿∏‰§Ä®Ä¿∏¿ƒ‘Ï(ÄÄÄÅ»π°ïÖêπ…Ω—Ö—•Ω∏π‰ÄÙÅ—Ö±¨Ä¸Å5Ö—†πÕ•∏°—–Ä®Äƒ∏‹§Ä®Ä¿∏ƒ‡ÄËÅ5Ö—†πÕ•∏°—–Ä®Ä¿∏ÿ§Ä®Ä¿∏¿‡Ï(ÄÄÄÅ»π°ïÖêπ…Ω—Ö—•Ω∏π‡ÄÙÅ—Ö±¨Ä¸Å5Ö—†πÕ•∏°—–Ä®Ä‘∏Ã§Ä®Ä¿∏¿ÿÄËÄ¿Ï(ÄÄÄÅ»πµΩ’—†πÕçÖ±îπÕï–†ƒ∞Å—Ö±¨Ä¸Ä¿∏ÿÄ¨Å5Ö—†πÖâÃ°5Ö—†πÕ•∏°—–Ä®Äƒƒ§§Ä®Äƒ∏ÿÄËÄƒ∞Äƒ§Ï(ÄÄÄÅôΩ»Ä°çΩπÕ–Å¨Å•∏Å»πÖ…µÃ§ÅÏ(ÄÄÄÄÄÅçΩπÕ–ÅÑÄÙÅ»πÖ…µÕm≠t∞Å…ÃÄÙÅ»π…ïÕ—m≠tÏ(ÄÄÄÄÄÅ•òÄ°»π°Ω±ëm≠t§ÅÏÅÑπÕ†π…Ω—Ö—•Ω∏π‡ÄÙÅ…Ãπ‡Ä¨Ä°›Ö±¨Ä¸Ä¿∏¿–Ä®ÅÕ—…•ëîÄËÄ¿§ÏÅçΩπ—•π’îÏÅÙ(ÄÄÄÄÄÅ•òÄ°›Ö±¨§ÅÏÅÑπÕ†π…Ω—Ö—•Ω∏π‡ÄÙÄ°¨ÄÙÙÙÄù0úÄ¸ÅÕ—…•ëîÄËÄµÕ—…•ëî§Ä®Ä¿∏‘ÏÅÑπï∞π…Ω—Ö—•Ω∏π‡ÄÙÄ¥¿∏»‘ÏÅÑπÕ†π…Ω—Ö—•Ω∏πËÄÙÅÑπÃÄ®Ä¿∏ƒÏÅÙ(ÄÄÄÄÄÅï±ÕîÅ•òÄ°—Ö±¨§ÅÏÅÑπÕ†π…Ω—Ö—•Ω∏π‡ÄÙÅ…Ãπ‡Ä¥Ä¿∏ÃÄ¥Å5Ö—†πÕ•∏°—–Ä®ÄÃ§Ä®Ä¿∏»‘ÏÅÑπï∞π…Ω—Ö—•Ω∏π‡ÄÙÅ…ÃπîÄ¥Ä¿∏ÿÄ¨Å5Ö—†πÕ•∏°—–Ä®ÄÃ∏–§Ä®Ä¿∏ÃÏÅÑπÕ†π…Ω—Ö—•Ω∏πËÄÙÅ…ÃπËÄ¨Ä¿∏ƒ‘ÏÅÙ(ÄÄÄÄÄÅï±ÕîÅÏÅÑπÕ†π…Ω—Ö—•Ω∏π‡ÄÙÅ…Ãπ‡Ä¨Å5Ö—†πÕ•∏°—–Ä®Äƒ∏ƒ§Ä®Ä¿∏¿–ÏÅÑπï∞π…Ω—Ö—•Ω∏π‡ÄÙÅ…ÃπîÏÅÑπÕ†π…Ω—Ö—•Ω∏πËÄÙÅ…ÃπËÏÅÙ(ÄÄÄÅÙ(ÄÅÙ(ÄÅ…ï—’…∏ÅÏÅ…ΩÕ—ï»∞Åâ’•±ê∞ÅÖπ•µÖ—îÅÙÏ)Ù(