// BizOn Bật Nghiệp — clay-style 3D asset builders. Each builder returns a named THREE.Group (meters, y-up).
export function makeKit(THREE) {
  const mat = (name, color, roughness = 0.85, metalness = 0) =>
    Object.assign(new THREE.MeshStandardMaterial({ color, roughness, metalness }), { name });
  const M = {
    teal: mat('clay_teal', 0x0f7596),
    cream: mat('clay_cream', 0xf2e6d0),
    orange: mat('clay_sunset', 0xf08a3c),
    gold: mat('clay_gold', 0xf4c152),
    dark: mat('clay_charcoal', 0x353a42, 0.7),
    kraft: mat('clay_kraft', 0xb98555),
  };
  function add(name, geo, m, x = 0, y = 0, z = 0, parent) {
    const mesh = new THREE.Mesh(geo, m); mesh.name = name;
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  function rrShape(w, h, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    r = Math.max(1e-5, Math.min(r, w / 2, h / 2));
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  function rbox(w, h, d, r, seg = 4) {
    r = Math.min(r, w / 2, h / 2, d / 2) * 0.999;
    const geo = new THREE.ExtrudeGeometry(rrShape(Math.max(w - 2 * r, 1e-4), Math.max(h - 2 * r, 1e-4), 1e-5), {
      depth: Math.max(d - 2 * r, 1e-4), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: seg, curveSegments: 2 });
    geo.translate(0, 0, -Math.max(d - 2 * r, 1e-4) / 2); geo.computeVertexNormals(); return geo;
  }
  function slab(w, d, r, h, bev) {
    const geo = new THREE.ExtrudeGeometry(rrShape(w - 2 * bev, d - 2 * bev, r - bev), {
      depth: Math.max(h - 2 * bev, 1e-4), bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 5, curveSegments: 24 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, bev, 0); geo.computeVertexNormals(); return geo;
  }
  const lathe = (pts, seg = 40) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg);
  const group = (name, parent, x = 0, y = 0, z = 0) => { const gr = new THREE.Group(); gr.name = name; gr.position.set(x, y, z); if (parent) parent.add(gr); return gr; };
  function flag(name, parent, x, y, z, m, h = 0.1, s = 1) {
    const f = group(name, parent, x, y, z);
    add(name + '_pole', new THREE.CylinderGeometry(0.004 * s, 0.004 * s, h, 12), M.dark, 0, h / 2, 0, f);
    add(name + '_knob', new THREE.SphereGeometry(0.007 * s, 16, 12), M.gold, 0, h, 0, f);
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.06 * s, -0.019 * s); sh.lineTo(0, -0.038 * s); sh.closePath();
    add(name + '_cloth', new THREE.ExtrudeGeometry(sh, { depth: 0.004 * s, bevelEnabled: true, bevelThickness: 0.0015, bevelSize: 0.0015, bevelSegments: 2 }), m, 0.003, h - 0.008 * s, -0.002 * s, f);
    return f;
  }
  const star = (ro, ri) => { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? ri : ro, a = Math.PI / 2 + i * Math.PI / 5; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } s.closePath(); return s; };

  // ---------- 1. Strategy meeting table (Trung tâm điều hành)
  function strategyTable() {
    const g = group('BizOn_StrategyTable');
    add('rug', slab(3.0, 2.1, 0.5, 0.03, 0.012), M.cream, 0, 0, 0, g);
    const F = 0.03, TL = 1.9, TW = 0.95, TH = 0.75;
    const table = group('table', g);
    add('table_top', slab(TL, TW, TW / 2, 0.06, 0.022), M.teal, 0, F + TH - 0.06, 0, table);
    add('table_top_inlay', slab(TL - 0.16, TW - 0.16, (TW - 0.16) / 2, 0.006, 0.002), M.cream, 0, F + TH - 0.001, 0, table);
    for (const x of [-0.55, 0.55]) {
      add('table_pedestal', new THREE.CylinderGeometry(0.07, 0.09, TH - 0.1, 36), M.orange, x, F + 0.04 + (TH - 0.1) / 2, 0, table);
      add('table_foot', slab(0.22, 0.6, 0.11, 0.05, 0.018), M.orange, x, F, 0, table);
    }
    const TOP = F + TH + 0.005;
    const hub = group('data_hub', g, 0, TOP, 0); hub.scale.setScalar(1.4);
    add('hub_plinth', slab(0.9, 0.36, 0.18, 0.03, 0.01), M.dark, 0, 0, 0, hub);
    const HT = 0.03;
    [0.07, 0.11, 0.09, 0.16, 0.22].forEach((h, i) => add('bar_' + (i + 1), rbox(0.05, h, 0.05, 0.012), i === 4 ? M.orange : M.gold, -0.36 + i * 0.065, HT + h / 2, 0.04, hub));
    const pts = [[-0.37, 0.12], [-0.3, 0.16], [-0.24, 0.14], [-0.17, 0.21], [-0.11, 0.27]].map(([x, y]) => new THREE.Vector3(x, HT + y, -0.07));
    add('trend_line', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.008, 12, false), M.teal, 0, 0, 0, hub);
    const head = add('trend_arrow', new THREE.ConeGeometry(0.022, 0.05, 24), M.teal, pts[4].x + 0.012, pts[4].y + 0.02, -0.07, hub);
    head.rotation.z = -0.6;
    [0, 2, 4].forEach(i => add('trend_post_' + i, new THREE.CylinderGeometry(0.004, 0.004, pts[i].y - HT, 10), M.dark, pts[i].x, HT + (pts[i].y - HT) / 2, -0.07, hub));
    const pie = group('pie_chart', hub, 0.12, HT, 0);
    [[0.42, M.orange, 0.03], [0.28, M.teal, 0], [0.18, M.gold, 0], [0.12, M.cream, 0]].reduce((start, [frac, m, lift], i) => {
      const len = frac * Math.PI * 2;
      const s = add('pie_slice_' + (i + 1), new THREE.CylinderGeometry(0.1, 0.1, 0.035 + lift, 48, 1, false, start, len), m, 0, (0.035 + lift) / 2, 0, pie);
      if (i === 0) { const mid = start + len / 2; s.position.x += Math.sin(mid) * 0.015; s.position.z += Math.cos(mid) * 0.015; }
      return start + len;
    }, 0.4);
    const gauge = group('brand_gauge', hub, 0.34, HT, 0);
    add('gauge_base', rbox(0.14, 0.03, 0.06, 0.012), M.cream, 0, 0.015, 0, gauge);
    add('gauge_arc_bg', new THREE.TorusGeometry(0.055, 0.012, 14, 40, Math.PI), M.cream, 0, 0.03, 0, gauge);
    add('gauge_arc_fill', new THREE.TorusGeometry(0.055, 0.0135, 14, 40, Math.PI * 0.72), M.orange, 0, 0.03, 0.001, gauge).rotation.z = Math.PI * 0.28;
    const needle = add('gauge_needle', rbox(0.06, 0.008, 0.008, 0.003), M.dark, 0, 0.03, 0.014, gauge);
    needle.geometry.translate(0.03, 0, 0); needle.rotation.z = Math.PI * 0.28;
    add('gauge_pivot', new THREE.SphereGeometry(0.01, 20, 14), M.dark, 0, 0.03, 0.014, gauge);
    const seats = [
      { name: 'CEO', x: -TL / 2 - 0.32, z: 0, ry: Math.PI / 2 },
      { name: 'CFO', x: -0.45, z: TW / 2 + 0.3, ry: 0 }, { name: 'CMO', x: 0.45, z: TW / 2 + 0.3, ry: 0 },
      { name: 'COO', x: -0.45, z: -TW / 2 - 0.3, ry: Math.PI }, { name: 'SEC', x: 0.45, z: -TW / 2 - 0.3, ry: Math.PI },
    ];
    const cup = [[0, 0], [0.03, 0], [0.034, 0.01], [0.038, 0.08], [0.033, 0.085], [0.03, 0.02], [0, 0.02]];
    seats.forEach(s => {
      const place = group('place_' + s.name, g);
      const ceo = s.name === 'CEO';
      const px = ceo ? -TL / 2 + 0.17 : s.x, pz = ceo ? 0 : Math.sign(s.z) * (TW / 2 - 0.15);
      add('tablet_' + s.name, rbox(0.24, 0.012, 0.17, 0.005), M.dark, px, TOP + 0.006, pz, place).rotation.y = s.ry;
      add('tablet_screen_' + s.name, rbox(0.21, 0.004, 0.14, 0.002), M.gold, px, TOP + 0.013, pz, place).rotation.y = s.ry;
      const cx = px + (ceo ? 0 : 0.18), cz = pz + (ceo ? 0.2 : 0);
      add('cup_' + s.name, lathe(cup, 32), M.cream, cx, TOP, cz, place);
      add('cup_handle_' + s.name, new THREE.TorusGeometry(0.018, 0.006, 10, 24, Math.PI), M.cream, cx + 0.037, TOP + 0.045, cz, place).rotation.z = -Math.PI / 2;
      const c = group('chair_' + s.name, g, s.x, F, s.z); c.rotation.y = s.ry;
      const accent = ceo ? M.orange : M.teal;
      add('chair_base', new THREE.CylinderGeometry(0.22, 0.24, 0.035, 40), M.dark, 0, 0.0175, 0, c);
      add('chair_stem', new THREE.CylinderGeometry(0.03, 0.035, 0.36, 24), M.dark, 0, 0.215, 0, c);
      add('chair_seat', rbox(0.48, 0.09, 0.46, 0.04), accent, 0, 0.44, 0, c);
      const bh = ceo ? 0.62 : 0.5;
      add('chair_back', rbox(0.46, bh, 0.08, 0.035), accent, 0, 0.46 + bh / 2, 0.22, c).rotation.x = -0.12;
      add('chair_cushion', rbox(0.36, 0.03, 0.34, 0.014), M.cream, 0, 0.495, -0.01, c);
      for (const x of [-0.25, 0.25]) {
        add('chair_arm', rbox(0.05, 0.05, 0.34, 0.02), M.cream, x, 0.62, 0.02, c);
        add('chair_arm_post', new THREE.CylinderGeometry(0.014, 0.014, 0.14, 12), M.cream, x, 0.53, 0.02, c);
      }
    });
    const board = group('presentation_board', g, TL / 2 + 0.45, F, 0); board.rotation.y = -Math.PI / 2;
    add('board_foot', slab(0.9, 0.35, 0.17, 0.04, 0.015), M.dark, 0, 0, 0, board);
    for (const x of [-0.34, 0.34]) add('board_post', new THREE.CylinderGeometry(0.02, 0.022, 1.3, 20), M.dark, x, 0.69, 0, board);
    add('board_frame', rbox(0.9, 0.6, 0.05, 0.03), M.teal, 0, 1.05, 0, board);
    add('board_face', rbox(0.8, 0.5, 0.006, 0.02), M.cream, 0, 1.05, 0.026, board);
    [0.12, 0.2, 0.16, 0.28, 0.36].forEach((h, i) => add('board_bar_' + (i + 1), rbox(0.08, h, 0.02, 0.01), i === 4 ? M.orange : M.teal, -0.28 + i * 0.13, 0.82 + h / 2, 0.035, board));
    flag('board_flag', board, 0.24, 0.82 + 0.36, 0.035, M.orange, 0.12, 1.3);
    const plant = group('plant', g, -TL / 2 - 0.45, F, -0.75);
    add('plant_pot', lathe([[0, 0], [0.1, 0], [0.13, 0.22], [0.14, 0.24], [0, 0.24]], 36), M.orange, 0, 0, 0, plant);
    [[0, 0.36, 0, 0.13], [0.08, 0.3, 0.05, 0.09], [-0.07, 0.31, -0.05, 0.1], [0.02, 0.46, -0.02, 0.09]].forEach(([x, y, z, r], i) =>
      add('plant_leaf_' + i, new THREE.SphereGeometry(r, 28, 18), M.teal, x, y, z, plant));
    return g;
  }

  // ---------- 2. Expansion roadmap board (Lộ trình mở rộng thị truủyng, 6 cờ)
  function roadmap() {
    const g = group('BizOn_Roadmap');
    add('board_base', slab(0.62, 1.0, 0.06, 0.04, 0.012), M.teal, 0, 0, 0, g);
    add('board_top', slab(0.58, 0.96, 0.045, 0.006, 0.002), M.cream, 0, 0.039, 0, g);
    const T = 0.045;
    const river = new THREE.CatmullRomCurve3([[-0.29, 0.3], [-0.12, 0.26], [0.02, 0.36], [0.2, 0.3], [0.29, 0.34]].map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const rv = add('river', new THREE.TubeGeometry(river, 64, 0.022, 12, false), M.teal, 0, T, 0, g); rv.scale.y = 0.2;
    const stops = [[0.12, 0.4], [-0.1, 0.22], [0.1, 0.05], [-0.12, -0.12], [0.08, -0.26], [-0.04, -0.4]];
    const road = new THREE.CatmullRomCurve3(stops.map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const rd = add('road', new THREE.TubeGeometry(road, 160, 0.02, 12, false), M.gold, 0, T, 0, g); rd.scale.y = 0.35;
    const won = 3;
    stops.forEach(([x, z], i) => {
      const last = i === stops.length - 1;
      add('stop_' + (i + 1) + '_disc', new THREE.CylinderGeometry(last ? 0.04 : 0.03, last ? 0.042 : 0.032, 0.014, 36), i < won ? M.orange : M.dark, x, T + 0.007, z, g);
      flag('stop_' + (i + 1) + '_flag', g, x, T + 0.014, z, i < won ? M.orange : M.cream, last ? 0.12 : 0.085, last ? 1.3 : 1);
    });
    add('capital_star', new THREE.ExtrudeGeometry(star(0.022, 0.009), { depth: 0.006, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2 }), M.gold, stops[5][0] - 0.06, T + 0.02, stops[5][1] + 0.003, g).rotation.x = -Math.PI / 2;
    [[-0.2, 0.05], [0.22, -0.1], [0.2, 0.18], [-0.22, -0.3], [0.22, -0.4], [-0.2, 0.42]].forEach(([x, z], i) => {
      add('tree_' + i + '_trunk', new THREE.CylinderGeometry(0.005, 0.006, 0.03, 10), M.kraft, x, T + 0.015, z, g);
      add('tree_' + i + '_crown', new THREE.SphereGeometry(0.022, 20, 14), M.teal, x, T + 0.045, z, g);
    });
    [[-0.2, -0.05, 0.05], [0.21, 0.0, 0.04], [-0.21, 0.28, 0.04]].forEach(([x, z, r], i) =>
      add('hill_' + i, new THREE.SphereGeometry(r, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.orange, x, T, z, g).scale.y = 0.55);
    const car = group('company_car', g, stops[3][0] + 0.06, T, stops[3][1] + 0.05); car.rotation.y = 0.9;
    add('car_body', rbox(0.06, 0.02, 0.032, 0.008), M.orange, 0, 0.018, 0, car);
    add('car_cabin', rbox(0.032, 0.018, 0.028, 0.007), M.cream, -0.004, 0.034, 0, car);
    for (const [wx, wz] of [[-0.018, 0.016], [0.018, 0.016], [-0.018, -0.016], [0.018, -0.016]])
      add('car_wheel', new THREE.CylinderGeometry(0.008, 0.008, 0.006, 16), M.dark, wx, 0.008, wz, car).rotation.x = Math.PI / 2;
    return g;
  }

  // ---------- 3. C-suite tokens (CEO/CFO/CMO/COO/SEC)
  function csuite() {
    const g = group('BizOn_CSuite_Tokens');
    add('tray', slab(0.5, 0.2, 0.1, 0.02, 0.008), M.cream, 0, 0, 0, g);
    const pawn = [[0, 0], [0.03, 0], [0.032, 0.006], [0.028, 0.012], [0.018, 0.02], [0.013, 0.05], [0.016, 0.058], [0.012, 0.062], [0, 0.064]];
    const roles = ['CEO', 'CFO', 'CMO', 'COO', 'SEC'];
    roles.forEach((r, i) => {
      const t = group('token_' + r, g, -0.18 + i * 0.09, 0.02, 0);
      add(r + '_body', lathe(pawn, 40), r === 'CEO' ? M.orange : M.teal, 0, 0, 0, t);
      add(r + '_head', new THREE.SphereGeometry(0.02, 32, 20), M.cream, 0, 0.078, 0, t);
      const top = group(r + '_icon', t, 0, 0.098, 0);
      if (r === 'CEO') {
        add('crown_band', new THREE.CylinderGeometry(0.016, 0.016, 0.01, 32, 1, true), M.gold, 0, 0.002, 0, top).material.side = THREE.DoubleSide;
        for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5; add('crown_spike', new THREE.ConeGeometry(0.005, 0.014, 12), M.gold, Math.cos(a) * 0.014, 0.013, Math.sin(a) * 0.014, top); }
      } else if (r === 'CFO') {
        [0, 1, 2].forEach(k => add('coin_' + k, new THREE.CylinderGeometry(0.014, 0.014, 0.005, 32), M.gold, k * 0.002, 0.001 + k * 0.0055, 0, top));
      } else if (r === 'CMO') {
        const mg = add('megaphone', new THREE.CylinderGeometry(0.013, 0.005, 0.03, 28, 1, true), M.gold, 0.005, 0.01, 0, top);
        mg.material = M.gold; mg.rotation.z = -Math.PI / 2 - 0.3;
        add('megaphone_rim', new THREE.TorusGeometry(0.013, 0.002, 8, 28), M.orange, 0.02, 0.015, 0, top).rotation.y = Math.PI / 2;
      } else if (r === 'COO') {
        const gear = group('gear', top, 0, 0.012, 0); gear.rotation.x = Math.PI / 2;
        add('gear_hub', new THREE.CylinderGeometry(0.012, 0.012, 0.006, 32), M.gold, 0, 0, 0, gear);
        for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; const tooth = add('gear_tooth', rbox(0.006, 0.006, 0.006, 0.001), M.gold, Math.cos(a) * 0.014, 0, Math.sin(a) * 0.014, gear); tooth.rotation.y = -a; }
        add('gear_hole', new THREE.CylinderGeometry(0.004, 0.004, 0.0065, 16), M.dark, 0, 0, 0, gear);
      } else {
        add('notebook', rbox(0.022, 0.028, 0.008, 0.002), M.gold, 0, 0.012, 0, top).rotation.y = 0.3;
        add('notebook_spine', new THREE.CylinderGeometry(0.0025, 0.0025, 0.028, 10), M.dark, -0.0105, 0.012, 0.003, top);
      }
      add(r + '_base_ring', new THREE.TorusGeometry(0.03, 0.003, 10, 40), M.gold, 0, 0.004, 0, t).rotation.x = Math.PI / 2;
    });
    return g;
  }

  // ---------- 4. Clay Factory Frenzy
  function factory() {
    const g = group('BizOn_ClayFactory');
    add('base', rbox(1.2, 0.06, 0.7, 0.03), M.teal, 0, 0.03, 0, g);
    add('base_top', rbox(1.14, 0.012, 0.64, 0.006), M.cream, 0, 0.066, 0, g);
    const FLOOR = 0.072, BELT_Y = FLOOR + 0.16, BELT_L = 0.78, BELT_X = 0.12;
    const conv = group('conveyor', g);
    add('conveyor_frame_front', rbox(BELT_L + 0.04, 0.05, 0.02, 0.008), M.orange, BELT_X, BELT_Y - 0.01, 0.1, conv);
    add('conveyor_frame_back', rbox(BELT_L + 0.04, 0.05, 0.02, 0.008), M.orange, BELT_X, BELT_Y - 0.01, -0.1, conv);
    add('belt', rbox(BELT_L, 0.03, 0.18, 0.014), M.dark, BELT_X, BELT_Y, 0, conv);
    for (let i = 0; i < 9; i++) add('roller_' + i, new THREE.CylinderGeometry(0.012, 0.012, 0.2, 20), M.cream, BELT_X - BELT_L / 2 + 0.03 + i * (BELT_L - 0.06) / 8, BELT_Y - 0.03, 0, conv).rotation.x = Math.PI / 2;
    for (const lx of [-0.34, 0, 0.34]) for (const lz of [0.1, -0.1]) add('leg', rbox(0.03, BELT_Y - FLOOR - 0.03, 0.03, 0.01), M.teal, BELT_X + lx, FLOOR + (BELT_Y - FLOOR - 0.03) / 2, lz, conv);
    const TOP = BELT_Y + 0.015;
    function crate(name, s, x, y, z, rot) {
      const c = group(name, g, x, y + s / 2 + 0.001, z); c.rotation.y = rot;
      add(name + '_box', rbox(s, s, s, s * 0.14), M.kraft, 0, 0, 0, c);
      add(name + '_tape', rbox(s * 0.22, 0.006, s * 1.004, 0.003), M.cream, 0, s / 2 - 0.001, 0, c);
      add(name + '_label', rbox(s * 0.4, s * 0.3, 0.004, 0.002), M.teal, 0, -s * 0.05, s / 2 + 0.001, c);
    }
    crate('crate_a', 0.1, 0.36, TOP, 0, 0.1); crate('crate_b', 0.085, 0.2, TOP, 0, -0.15);
    const pot = [[0, 0], [0.022, 0], [0.03, 0.012], [0.036, 0.035], [0.033, 0.058], [0.02, 0.075], [0.017, 0.085], [0.024, 0.092], [0.022, 0.097], [0.014, 0.094]];
    add('clay_pot_a', lathe(pot), M.orange, -0.02, TOP + 0.001, 0.02, g);
    add('clay_pot_b', lathe(pot), M.orange, -0.14, TOP + 0.001, -0.03, g).scale.setScalar(0.85);
    add('clay_pot_ring', new THREE.TorusGeometry(0.035, 0.004, 12, 40), M.cream, -0.02, TOP + 0.036, 0.02, g).rotation.x = Math.PI / 2;
    const arch = group('packing_arch', g, 0.08); const AH = 0.2, PH = TOP + AH - FLOOR;
    for (const z of [0.14, -0.14]) add('arch_post', rbox(0.04, PH, 0.04, 0.012), M.teal, 0, FLOOR + PH / 2, z, arch);
    add('arch_beam', rbox(0.08, 0.06, 0.34, 0.02), M.teal, 0, TOP + AH, 0, arch);
    add('arch_lamp', new THREE.SphereGeometry(0.018, 24, 16), M.orange, 0, TOP + AH + 0.04, 0, arch);
    add('arch_nozzle', new THREE.CylinderGeometry(0.012, 0.02, 0.04, 24), M.cream, 0, TOP + AH - 0.05, 0, arch);
    const fac = group('factory', g, -0.4, FLOOR, 0); const FW = 0.3, FH = 0.26, FD = 0.4;
    add('factory_body', rbox(FW, FH, FD, 0.025), M.cream, 0, FH / 2, 0, fac);
    for (let i = 0; i < 3; i++) {
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(FD / 3, 0); sh.lineTo(0, 0.08); sh.closePath();
      const m = add('roof_tooth_' + i, new THREE.ExtrudeGeometry(sh, { depth: FW - 0.02, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 }), M.teal, (FW - 0.02) / 2, FH - 0.004, -FD / 2 + i * FD / 3, fac);
      m.rotation.y = -Math.PI / 2;
    }
    add('factory_door', rbox(0.004, 0.12, 0.2, 0.002), M.dark, FW / 2 + 0.001, 0.07, 0, fac);
    for (const z of [-0.12, 0.12]) add('factory_window', rbox(0.004, 0.05, 0.06, 0.002), M.orange, FW / 2 + 0.001, 0.19, z, fac);
    for (const x of [-0.08, 0.08]) add('factory_window_side', rbox(0.06, 0.05, 0.004, 0.002), M.orange, x, 0.16, FD / 2 + 0.001, fac);
    add('chimney', new THREE.CylinderGeometry(0.03, 0.036, 0.22, 32), M.orange, -0.08, FH + 0.11, -0.12, fac);
    add('chimney_cap', new THREE.TorusGeometry(0.032, 0.008, 12, 32), M.dark, -0.08, FH + 0.22, -0.12, fac).rotation.x = Math.PI / 2;
    [[0, 0.25, 0.03], [0.03, 0.3, 0.024], [0.065, 0.34, 0.018]].forEach(([dx, dy, r], i) => add('smoke_' + i, new THREE.SphereGeometry(r, 24, 16), M.cream, -0.08 + dx, FH + dy, -0.12, fac));
    flag('factory_flag', fac, 0.08, FH, 0.14, M.orange, 0.2, 1.4);
    crate('crate_stack_1', 0.09, 0.48, FLOOR, -0.22, 0); crate('crate_stack_2', 0.09, 0.38, FLOOR, -0.24, 0.3); crate('crate_stack_3', 0.08, 0.43, FLOOR + 0.092, -0.23, -0.2);
    add('clay_bin', new THREE.CylinderGeometry(0.06, 0.05, 0.08, 36), M.teal, -0.12, FLOOR + 0.04, 0.23, g);
    add('clay_lump', new THREE.SphereGeometry(0.055, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2), M.orange, -0.12, FLOOR + 0.078, 0.23, g).scale.y = 0.6;
    return g;
  }

  // ---------- 5. Shop chest (Cửa hàng / Kho đồ)
  function shopChest() {
    const g = group('BizOn_ShopChest');
    const W = 0.36, D = 0.22, H = 0.16;
    add('chest_body', rbox(W, H, D, 0.025), M.orange, 0, H / 2, 0, g);
    for (const x of [-0.12, 0.12]) add('chest_band', rbox(0.03, H + 0.004, D + 0.006, 0.01), M.gold, x, H / 2, 0, g);
    add('chest_rim', rbox(W + 0.006, 0.02, D + 0.006, 0.008), M.gold, 0, H - 0.01, 0, g);
    add('coin_pile', new THREE.SphereGeometry(0.15, 36, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.gold, 0, H - 0.02, 0, g).scale.set(1.05, 0.35, 0.6);
    const lid = group('chest_lid', g, 0, H, -D / 2); lid.rotation.x = -1.05;
    const lidMesh = add('lid_shell', new THREE.CylinderGeometry(D / 2, D / 2, W, 40, 1, false, 0, Math.PI), M.orange, 0, 0, D / 2, lid);
    lidMesh.rotation.z = Math.PI / 2; lidMesh.rotation.y = 0;
    for (const x of [-0.12, 0.12]) add('lid_band', new THREE.CylinderGeometry(D / 2 + 0.003, D / 2 + 0.003, 0.03, 40, 1, false, 0, Math.PI), M.gold, x, 0, D / 2, lid).rotation.z = Math.PI / 2;
    add('lock_plate', rbox(0.05, 0.06, 0.012, 0.008), M.gold, 0, H - 0.04, D / 2 + 0.004, g);
    add('lock_hole', new THREE.CylinderGeometry(0.006, 0.006, 0.004, 16), M.dark, 0, H - 0.045, D / 2 + 0.011, g).rotation.x = Math.PI / 2;
    [[0.06, 0.04, 0.1], [-0.08, 0.03, 0.14], [0.12, 0.045, -0.03]].forEach(([x, dy, z], i) => add('coin_top_' + i, new THREE.CylinderGeometry(0.024, 0.024, 0.006, 32), M.gold, x * 0.9, H + dy, z * 0.4, g).rotation.set(0.3 * i, 0, 0.4));
    add('gem', new THREE.OctahedronGeometry(0.03, 0), M.teal, -0.04, H + 0.06, 0, g).scale.y = 1.4;
    [[0.25, 0.1, 0], [0.29, 0.02, 0.4], [-0.24, 0.13, 0.2]].forEach(([x, z, r], i) => add('coin_floor_' + i, new THREE.CylinderGeometry(0.024, 0.024, 0.006, 32), M.gold, x, z, r, g).rotation.y = r);
    [0, 1, 2].forEach(k => add('coin_stack_' + k, new THREE.CylinderGeometry(0.024, 0.024, 0.006, 32), M.gold, -0.26, 0.003 + k * 0.0062, -0.04, g));
    return g;
  }

  // ---------- 6. Skill tree (Cây kỹ năng)
  function skillTree() {
    const g = group('BizOn_SkillTree');
    add('pot', lathe([[0, 0], [0.1, 0], [0.12, 0.12], [0.135, 0.13], [0.135, 0.145], [0, 0.145]], 44), M.orange, 0, 0, 0, g);
    add('soil', new THREE.CylinderGeometry(0.122, 0.122, 0.01, 44), M.dark, 0, 0.142, 0, g);
    add('trunk', new THREE.CylinderGeometry(0.02, 0.032, 0.26, 20), M.kraft, 0, 0.145 + 0.13, 0, g);
    const TY = 0.36;
    const branches = [[-0.5, 0.12], [0.55, 0.13], [0, 0.14], [-0.2, 0.1], [0.25, 0.1]];
    const crowns = [];
    branches.forEach(([a, len], i) => {
      const b = add('branch_' + i, new THREE.CylinderGeometry(0.008, 0.013, len, 12), M.kraft, 0, 0, 0, g);
      const dir = new THREE.Vector3(Math.sin(a) * Math.cos(i), Math.cos(a), Math.sin(a) * Math.sin(i) * 0.6 + (i % 2 ? 0.05 : -0.05)).normalize();
      b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      b.position.set(0, TY, 0).addScaledVector(dir, len / 2);
      crowns.push(new THREE.Vector3(0, TY, 0).addScaledVector(dir, len));
    });
    crowns.forEach((c, i) => add('crown_' + i, new THREE.SphereGeometry(i === 2 ? 0.09 : 0.075, 32, 20), M.teal, c.x, c.y + 0.03, c.z, g));
    const nodes = [];
    crowns.forEach((c, i) => {
      for (let k = 0; k < 3; k++) {
        const r = i === 2 ? 0.09 : 0.075, a = k * 2.1 + i, e = 0.4 + (k % 2) * 0.5;
        nodes.push(new THREE.Vector3(c.x + Math.cos(a) * Math.cos(e) * r, c.y + 0.03 + Math.sin(e) * r, c.z + Math.sin(a) * Math.cos(e) * r));
      }
    });
    nodes.forEach((p, i) => add('skill_node_' + i + (i % 3 === 2 ? '_locked' : '_unlocked'), new THREE.SphereGeometry(0.017, 20, 14), i % 3 === 2 ? M.cream : M.gold, p.x, p.y, p.z, g));
    add('top_star', new THREE.ExtrudeGeometry(star(0.04, 0.017), { depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 3 }), M.gold, crowns[2].x, crowns[2].y + 0.15, crowns[2].z - 0.008, g);
    add('star_stem', new THREE.CylinderGeometry(0.004, 0.004, 0.04, 10), M.gold, crowns[2].x, crowns[2].y + 0.11, crowns[2].z, g);
    return g;
  }

  // ---------- 7. Leaderboard podium (Bảng xếp hạng)
  function podium() {
    const g = group('BizOn_Podium');
    add('stage_base', slab(0.62, 0.3, 0.06, 0.02, 0.008), M.cream, 0, 0, 0, g);
    const blocks = [[-0.19, 0.14, M.teal, 2], [0, 0.2, M.orange, 1], [0.19, 0.1, M.teal, 3]];
    blocks.forEach(([x, h, m, rank]) => {
      add('block_' + rank, rbox(0.18, h, 0.2, 0.02), m, x, 0.02 + h / 2, 0, g);
      for (let s = 0; s < 4 - rank; s++) add('block_' + rank + '_star_' + s, new THREE.ExtrudeGeometry(star(0.016, 0.007), { depth: 0.004, bevelEnabled: true, bevelThickness: 0.001, bevelSize: 0.001, bevelSegments: 1 }), M.gold, x + (s - (3 - rank) / 2) * 0.04, 0.02 + h * 0.55, 0.1, g);
    });
    const cup = group('trophy', g, 0, 0.22, 0);
    add('trophy_base', rbox(0.08, 0.03, 0.08, 0.008), M.dark, 0, 0.015, 0, cup);
    add('trophy_body', lathe([[0, 0], [0.025, 0], [0.02, 0.01], [0.008, 0.02], [0.007, 0.05], [0.015, 0.06], [0.045, 0.08], [0.05, 0.13], [0.052, 0.14], [0.046, 0.14], [0.043, 0.09], [0, 0.07]], 44), M.gold, 0, 0.03, 0, cup);
    for (const s of [-1, 1]) add('trophy_handle', new THREE.TorusGeometry(0.022, 0.005, 12, 28, Math.PI), M.gold, s * 0.048, 0.14, 0, cup).rotation.z = s > 0 ? -Math.PI / 2 : Math.PI / 2;
    [[-0.19, 0.16], [0.19, 0.12]].forEach(([x, y], i) => {
      const md = group('medal_' + (i + 2), g, x, y, 0);
      add('medal_stand', new THREE.CylinderGeometry(0.004, 0.004, 0.04, 10), M.dark, 0, 0.02, 0, md);
      add('medal_disc', new THREE.CylinderGeometry(0.035, 0.035, 0.008, 36), i ? M.orange : M.cream, 0, 0.075, 0, md).rotation.x = Math.PI / 2;
      add('medal_ribbon', rbox(0.02, 0.03, 0.004, 0.002), M.teal, 0, 0.114, 0, md);
    });
    return g;
  }

  // ---------- 8. Lumina advisor console
  function lumina() {
    const g = group('BizOn_Lumina_Console');
    add('pedestal', lathe([[0, 0], [0.12, 0], [0.12, 0.02], [0.07, 0.05], [0.05, 0.2], [0.08, 0.23], [0.08, 0.25], [0, 0.25]], 48), M.cream, 0, 0, 0, g);
    add('pedestal_ring', new THREE.TorusGeometry(0.075, 0.01, 14, 48), M.teal, 0, 0.245, 0, g).rotation.x = Math.PI / 2;
    add('orb_post', new THREE.CylinderGeometry(0.006, 0.006, 0.06, 12), M.dark, 0, 0.28, 0, g);
    add('orb', new THREE.SphereGeometry(0.065, 48, 32), M.gold, 0, 0.36, 0, g);
    add('orb_eye_l', new THREE.SphereGeometry(0.009, 16, 12), M.dark, -0.022, 0.37, 0.06, g);
    add('orb_eye_r', new THREE.SphereGeometry(0.009, 16, 12), M.dark, 0.022, 0.37, 0.06, g);
    add('orb_smile', new THREE.TorusGeometry(0.018, 0.0035, 8, 24, Math.PI), M.dark, 0, 0.352, 0.061, g).rotation.z = Math.PI;
    const r1 = add('orbit_ring_a', new THREE.TorusGeometry(0.1, 0.005, 12, 64), M.teal, 0, 0.36, 0, g); r1.rotation.set(1.2, 0.3, 0);
    const r2 = add('orbit_ring_b', new THREE.TorusGeometry(0.11, 0.004, 12, 64), M.orange, 0, 0.36, 0, g); r2.rotation.set(1.9, -0.5, 0);
    const b = group('speech_bubble', g, 0.2, 0, 0);
    add('bubble_post', new THREE.CylinderGeometry(0.004, 0.004, 0.43, 10), M.dark, 0, 0.215, 0, b);
    add('bubble_foot', new THREE.CylinderGeometry(0.03, 0.034, 0.012, 28), M.dark, 0, 0.006, 0, b);
    add('bubble', rbox(0.16, 0.09, 0.03, 0.03), M.cream, 0.02, 0.47, 0, b);
    const tail = add('bubble_tail', new THREE.ConeGeometry(0.018, 0.04, 16), M.cream, -0.055, 0.425, 0, b); tail.rotation.z = -2.3;
    [-0.03, 0.02, 0.07].forEach((x, i) => add('bubble_dot_' + i, new THREE.SphereGeometry(0.009, 16, 12), i === 2 ? M.orange : M.teal, x, 0.47, 0.017, b));
    return g;
  }

  return {
    items: [
      { id: 'table', label: 'Trung tâm điều hành', sub: 'Bàn họp chiến lược', build: strategyTable },
      { id: 'roadmap', label: 'Lộ trình mở rộng', sub: '6 chặng · cắm cờ', build: roadmap },
      { id: 'csuite', label: 'Đội C-Suite', sub: 'CEO · CFO · CMO · COO · SEC', build: csuite },
      { id: 'factory', label: 'Clay Factory Frenzy', sub: 'Mini-game xưởng đất sét', build: factory },
      { id: 'shop', label: 'Cửa hàng', sub: 'Kho đồ của đội', build: shopChest },
      { id: 'skills', label: 'Cây kỹ năng', sub: 'Mở khóa bằng XP', build: skillTree },
      { id: 'podium', label: 'Bảng xep hạng', sub: 'Thành tựu & cúp', build: podium },
      { id: 'lumina', label: 'Lumina', sub: 'Cố vấn chiến lược', build: lumina },
    ],
  };
}
