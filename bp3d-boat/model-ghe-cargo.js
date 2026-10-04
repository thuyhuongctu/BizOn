// Cây bẹo loaded with fruit + cargo baskets for the ghe mui.
export function buildCargo(THREE, M) {
  const g = new THREE.Group(); g.name = 'hang_hoa';
  const add = (geo, mat, name, p = g, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true; p.add(m); return m;
  };
  // Cây bẹo
  const bx = -2.75, bz = 0;
  const beo = new THREE.Group(); beo.name = 'cay_beo'; g.add(beo);
  add(new THREE.CylinderGeometry(0.06, 0.075, 4.6, 16), M.bamboo, 'beo_pole', beo, bx, 2.6, bz);
  for (let i = 0; i < 9; i++) add(new THREE.TorusGeometry(0.072, 0.012, 6, 18), M.bambooNode, 'beo_node', beo, bx, 0.6 + i * 0.5, bz).rotation.x = Math.PI / 2;
  const hang = (geo, mat, name, y, a, r = 0.2, sc = [1, 1, 1]) => {
    const m = add(geo, mat, name, beo, bx + Math.cos(a) * r, y, bz + Math.sin(a) * r); m.scale.set(...sc); return m;
  };
  const S = (r) => new THREE.SphereGeometry(r, 24, 16);
  hang(S(0.2), M.melon, 'beo_watermelon', 4.35, 2.6, 0.24, [1, 0.85, 1.2]);
  hang(S(0.2), M.melon, 'beo_watermelon', 3.75, 3.4, 0.24, [1, 0.85, 1.2]);
  for (const [y, a] of [[4.25, 0.6], [3.55, 1.6], [3.0, 0.2]]) {
    hang(S(0.13), M.pineapple, 'beo_pineapple', y, a, 0.22, [1, 1.4, 1]);
    for (let i = 0; i < 6; i++) { const l = hang(new THREE.ConeGeometry(0.03, 0.2, 6), M.leaf, 'beo_pineapple_leaf', y + 0.25, a, 0.22); l.rotation.set(0.4 * Math.cos(i), 0, 0.4 * Math.sin(i)); }
  }
  for (let i = 0; i < 8; i++) hang(S(0.1), i % 2 ? M.mangoOrange : M.mango, 'beo_mango', 3.9 - i * 0.12, 1.2 + i * 0.7, 0.2, [0.85, 1.3, 0.85]);
  for (let i = 0; i < 3; i++) hang(S(0.11), M.papaya, 'beo_papaya', 2.6 - i * 0.22, 4 + i, 0.21, [0.9, 1.5, 0.9]);
  for (let i = 0; i < 4; i++) { const r = hang(new THREE.CapsuleGeometry(0.06, 0.4, 6, 16), M.radish, 'beo_radish', 2.75, -0.4 + i * 0.2, 0.17); r.rotation.z = 0.08 * i; }
  for (let i = 0; i < 4; i++) hang(S(0.12), M.coconut, 'beo_coconut', 2.0 - (i % 2) * 0.2, 0.5 + i * 1.5, 0.2, [1, 1.1, 1]);
  for (let i = 0; i < 3; i++) hang(S(0.11), M.lime, 'beo_lime', 2.2 - i * 0.25, 2.5 + i, 0.2, [1, 1.3, 1]);
  // Baskets
  const basket = (name, x, z, r, mat, fr = 0.07, scl = [1, 0.85, 1.2]) => {
    const b = new THREE.Group(); b.name = name; b.position.set(x, 0.34, z); g.add(b);
    const prof = [[r * 0.65, 0], [r * 0.9, 0.06], [r, 0.18], [r * 1.02, 0.2]].map(p => new THREE.Vector2(p[0], p[1]));
    add(new THREE.LatheGeometry(prof, 32), M.wicker, name + '_basket', b).material.side = THREE.DoubleSide;
    add(new THREE.TorusGeometry(r * 1.02, 0.02, 8, 32), M.wicker, name + '_rim', b, 0, 0.2, 0).rotation.x = Math.PI / 2;
    for (let ring = 0, k = 0; ring < 3; ring++) {
      const n = ring ? ring * 6 : 1, rr = ring * r * 0.32;
      for (let i = 0; i < n; i++, k++) { const a = i / n * Math.PI * 2 + ring; const f = add(S(fr), mat, name + '_fruit', b, Math.cos(a) * rr, 0.2 + (2 - ring) * 0.045, Math.sin(a) * rr); f.scale.set(...scl); f.rotation.y = a; }
    }
  };
  basket('mango_basket', -1.75, 0.35, 0.3, M.mango);
  basket('coconut_basket', -1.15, -0.4, 0.28, M.coconut, 0.075, [1, 1, 1]);
  basket('lime_basket', -0.6, 0.45, 0.28, M.lime);
  basket('dragon_basket', -0.5, -0.35, 0.26, M.dragon, 0.07, [1, 1.2, 1]);
  basket('orange_basket', 0.25, 0.5, 0.26, M.mangoOrange, 0.065, [1, 1, 1]);
  basket('veg_basket', 2.3, 0.45, 0.3, M.leaf, 0.06, [1.4, 0.4, 1]);
  basket('durian_basket', 0.9, -0.5, 0.26, M.durian, 0.08, [1, 1.1, 1]);
  return g;
}
