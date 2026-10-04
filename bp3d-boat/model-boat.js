// Ghe hàng bông – boat, cargo, bẹo pole. Units: meters, y-up, bow toward +x.
export function buildBoat(THREE, M) {
  const g = new THREE.Group(); g.name = 'ghe_hang_bong';
  const add = (geo, mat, name, x = 0, y = 0, z = 0, parent = g) => {
    const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true; parent.add(m); return m;
  };
  // Hull: lofted cross-sections along x (pointed, raised bow/stern)
  const L = 6.4, N = 40, R = 14;
  const pos = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, x = (t - 0.5) * L;
    const s = Math.pow(Math.sin(Math.PI * t), 0.6);       // beam profile
    const half = 0.78 * s + 0.02;
    const rise = 0.32 * Math.pow(Math.abs(t - 0.5) * 2, 3); // sheer upsweep
    const depth = 0.42 * Math.pow(s, 0.5) + 0.04;
    for (let j = 0; j <= R; j++) {
      const a = Math.PI * (j / R);                         // 0..π across the U
      const z = -Math.cos(a) * half;
      const y = 0.5 + rise - Math.sin(a) * depth;
      pos.push(x, y, z);
    }
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < R; j++) {
    const a = i * (R + 1) + j, b = a + R + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const hg = new THREE.BufferGeometry();
  hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  hg.setIndex(idx); hg.computeVertexNormals();
  const hull = add(hg, M.hull, 'hull'); hull.material.side = THREE.DoubleSide;
  // Gunwale rails (tubes along sheer line)
  for (const side of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, x = (t - 0.5) * L;
      const s = Math.pow(Math.sin(Math.PI * t), 0.6);
      pts.push(new THREE.Vector3(x, 0.5 + 0.32 * Math.pow(Math.abs(t - 0.5) * 2, 3), side * (0.78 * s + 0.02)));
    }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.045, 8), M.trim, side < 0 ? 'gunwale_port' : 'gunwale_starboard');
  }
  // Floor planks + thwarts
  add(new THREE.BoxGeometry(3.4, 0.04, 0.7), M.plank, 'floor', 0, 0.2, 0);
  for (const [x, w] of [[-1.7, 1.2], [-0.1, 1.5], [1.5, 1.3]])
    add(new THREE.BoxGeometry(0.22, 0.05, w), M.trim, 'thwart', x, 0.42, 0);
  // Boat eyes (mắt ghe) on bow
  for (const side of [-1, 1]) {
    const eye = add(new THREE.CircleGeometry(0.075, 24), M.eyeWhite, 'mat_ghe_eye', 2.62, 0.56, side * 0.43);
    eye.lookAt(2.62 + 0.3, 0.56, side * 3); 
    const pupil = add(new THREE.CircleGeometry(0.035, 20), M.dark, 'mat_ghe_pupil', 0, 0, 0.002, eye);
    pupil.castShadow = false;
  }
  // Baskets with fruit
  const basket = (name, x, z, r, fruitMat, count) => {
    const b = new THREE.Group(); b.name = name; b.position.set(x, 0.22, z); g.add(b);
    const prof = [[r * 0.6, 0], [r * 0.85, 0.05], [r, 0.2], [r * 1.02, 0.22]].map(p => new THREE.Vector2(p[0], p[1]));
    add(new THREE.LatheGeometry(prof, 32), M.wicker, name + '_basket', 0, 0, 0, b).material.side = THREE.DoubleSide;
    add(new THREE.TorusGeometry(r * 1.02, 0.02, 8, 40), M.wicker, name + '_rim', 0, 0.22, 0, b).rotation.x = Math.PI / 2;
    let k = 0;
    for (let ring = 0; ring < 3 && k < count; ring++) {
      const n = ring === 0 ? 1 : ring * 6, rr = ring * r * 0.33;
      for (let i = 0; i < n && k < count; i++, k++) {
        const a = (i / n) * Math.PI * 2 + ring;
        const f = add(new THREE.SphereGeometry(r * 0.2, 20, 14), fruitMat, name + '_fruit',
          Math.cos(a) * rr, 0.24 + (2 - ring) * 0.05, Math.sin(a) * rr, b);
        f.scale.set(1, 0.85, 1.25); f.rotation.y = a;
      }
    }
    return b;
  };
  basket('mango_basket', -1.0, 0.42, 0.3, M.mango, 13);
  basket('tomato_basket', 1.0, -0.35, 0.3, M.red, 13);
  basket('lime_basket', -2.0, -0.25, 0.3, M.lime, 13);
  basket('mango_basket_2', 1.9, 0.2, 0.28, M.mangoOrange, 13);
  // Loose mangoes on floor
  for (let i = 0; i < 6; i++) {
    const f = add(new THREE.SphereGeometry(0.075, 20, 14), i % 2 ? M.mango : M.mangoOrange, 'mango_loose',
      0.1 + (i % 3) * 0.17, 0.28, 0.25 + Math.floor(i / 3) * 0.16);
    f.scale.set(1, 0.85, 1.3);
  }
  // Pineapples
  const pineapple = (x, z) => {
    const p = new THREE.Group(); p.name = 'pineapple'; p.position.set(x, 0.22, z); g.add(p);
    add(new THREE.SphereGeometry(0.12, 24, 16), M.pineapple, 'pineapple_body', 0, 0.15, 0, p).scale.set(1, 1.4, 1);
    for (let i = 0; i < 7; i++) {
      const leaf = add(new THREE.ConeGeometry(0.03, 0.22, 6), M.leaf, 'pineapple_leaf', 0, 0.38, 0, p);
      leaf.rotation.set(0.35 * Math.cos(i), i, 0.35 * Math.sin(i * 1.3));
    }
  };
  pineapple(0.45, -0.45); pineapple(0.15, -0.5);
  // Durian
  const dur = add(new THREE.IcosahedronGeometry(0.17, 2), M.durian, 'durian', 2.25, 0.4, -0.25);
  dur.scale.set(1, 1.15, 1);
  for (let i = 0; i < 40; i++) {
    const v = new THREE.Vector3().randomDirection();
    const s = add(new THREE.ConeGeometry(0.022, 0.06, 5), M.durian, 'durian_spike', v.x * 0.17, v.y * 0.17, v.z * 0.17, dur);
    s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v); s.castShadow = false;
  }
  // Cây bẹo: bamboo pole with hanging mangoes
  const bx = -1.2, bz = -0.55;
  const pole = new THREE.Group(); pole.name = 'cay_beo'; g.add(pole);
  add(new THREE.CylinderGeometry(0.035, 0.045, 3.2, 16), M.bamboo, 'beo_pole', bx, 1.8, bz, pole);
  for (let i = 0; i < 6; i++) add(new THREE.TorusGeometry(0.043, 0.008, 6, 16), M.bambooNode, 'beo_node', bx, 0.6 + i * 0.5, bz, pole).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.022, 0.022, 0.9, 12), M.bamboo, 'beo_arm', bx + 0.4, 3.0, bz, pole).rotation.z = Math.PI / 2;
  const hang = [[0, 0], [0.12, 0.06], [-0.1, 0.05], [0.04, -0.1], [0.15, -0.08], [-0.06, -0.06], [0.02, -0.2]];
  add(new THREE.CylinderGeometry(0.006, 0.006, 0.3, 6), M.dark, 'beo_string', bx + 0.75, 2.85, bz, pole);
  hang.forEach(([dx, dy], i) => {
    const f = add(new THREE.SphereGeometry(0.09, 20, 14), i % 3 ? M.mango : M.mangoOrange, 'beo_mango', bx + 0.75 + dx, 2.55 + dy, bz + (i % 2 ? 0.06 : -0.06), pole);
    f.scale.set(0.85, 1.3, 0.85);
  });
  return g;
}
