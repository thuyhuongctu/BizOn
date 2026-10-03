// Mặt sông: lục bình (water hyacinth) clumps + cá lìm kìm (halfbeak) schools near the surface.
export function buildRiverLife(THREE, M, waterY = 0.17) {
  const g = new THREE.Group(); g.name = 'song_nuoc';
  const add = (geo, mat, name, p, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true; p.add(m); return m;
  };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // Lục bình: swollen petiole floats, glossy round leaves, lilac flower spike
  const leafGeo = new THREE.SphereGeometry(0.11, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  const bulbGeo = new THREE.SphereGeometry(0.045, 12, 10);
  const plant = (p, x, z, s) => {
    const q = new THREE.Group(); q.name = 'luc_binh'; q.position.set(x, waterY, z); q.scale.setScalar(s); q.rotation.y = rnd() * 6.28; p.add(q);
    add(new THREE.CylinderGeometry(0.16, 0.12, 0.03, 16), M.hyacinthRoot, 'luc_binh_base', q, 0, 0.0, 0);
    const n = 6 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd() * 0.4, r = 0.07 + rnd() * 0.04, tilt = 0.5 + rnd() * 0.4;
      const b = add(bulbGeo, M.hyacinthStem, 'luc_binh_bulb', q, Math.cos(a) * r, 0.05, Math.sin(a) * r);
      b.scale.set(0.9, 1.3, 0.9);
      const lf = add(leafGeo, M.hyacinthLeaf, 'luc_binh_leaf', q, Math.cos(a) * (r + 0.07), 0.15 + rnd() * 0.06, Math.sin(a) * (r + 0.07));
      lf.scale.set(1, 0.18, 1.15);
      lf.rotation.set(Math.sin(a) * tilt, 0, -Math.cos(a) * tilt);
    }
    if (rnd() > 0.35) {
      const hgt = 0.3 + rnd() * 0.1;
      add(new THREE.CylinderGeometry(0.012, 0.016, hgt, 8), M.hyacinthStem, 'luc_binh_spike', q, 0, hgt / 2 + 0.04, 0);
      for (let k = 0; k < 9; k++) {
        const a = k * 2.4, yy = hgt * 0.55 + k * 0.022;
        const f = add(new THREE.SphereGeometry(0.03, 10, 8), k % 3 ? M.hyacinthFlower : M.hyacinthFlowerDeep, 'luc_binh_flower', q, Math.cos(a) * 0.035, yy, Math.sin(a) * 0.035);
        f.scale.set(1.2, 0.55, 1.2); f.rotation.set(Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5);
      }
      add(new THREE.SphereGeometry(0.009, 8, 6), M.hyacinthEye, 'luc_binh_flower_eye', q, 0.03, hgt * 0.7, 0.03);
    }
  };
  const clump = (x, z, count, spread) => {
    const p = new THREE.Group(); p.name = 'luc_binh_cum'; g.add(p);
    for (let i = 0; i < count; i++) {
      const a = rnd() * 6.28, r = Math.sqrt(rnd()) * spread;
      plant(p, x + Math.cos(a) * r, z + Math.sin(a) * r * 0.7, 0.85 + rnd() * 0.5);
    }
  };
  [[2.3, 1.9, 7, 0.55], [-2.6, -1.6, 6, 0.5], [-1.4, 2.4, 5, 0.45], [3.3, -0.4, 4, 0.4], [-6.2, -2.6, 6, 0.6], [6.4, 0.8, 5, 0.55], [0.6, -5.6, 7, 0.7], [-0.6, 5.4, 6, 0.6]]
    .forEach(c => clump(...c));

  // Cá lìm kìm: slim silver body, long needle lower jaw, forked tail, dark back stripe
  const fish = (p, x, z, ry, s, jump) => {
    const f = new THREE.Group(); f.name = 'ca_lim_kim'; f.position.set(x, waterY + (jump ? 0.25 : 0.015), z); f.rotation.y = ry; f.scale.setScalar(s); p.add(f);
    if (jump) f.rotation.z = 0.45;
    const body = add(new THREE.CapsuleGeometry(0.022, 0.2, 6, 14), M.fishSilver, 'ca_body', f); body.rotation.z = Math.PI / 2; body.scale.set(1, 1, 0.75);
    const back = add(new THREE.CapsuleGeometry(0.009, 0.18, 4, 8), M.fishBack, 'ca_back', f, 0, 0.016, 0); back.rotation.z = Math.PI / 2;
    const jaw = add(new THREE.ConeGeometry(0.008, 0.11, 8), M.fishBeak, 'ca_beak', f, 0.18, -0.008, 0); jaw.rotation.z = -Math.PI / 2;
    add(new THREE.ConeGeometry(0.009, 0.025, 8), M.fishBack, 'ca_upper_jaw', f, 0.14, 0.004, 0).rotation.z = -Math.PI / 2;
    for (const sz of [-1, 1]) add(new THREE.SphereGeometry(0.008, 8, 6), M.eyeDark, 'ca_eye', f, 0.115, 0.007, sz * 0.015);
    for (const sy of [-1, 1]) {
      const t = add(new THREE.ConeGeometry(0.022, 0.06, 3), M.fishFin, 'ca_tail', f, -0.155, sy * 0.016, 0);
      t.rotation.z = Math.PI / 2 + sy * 0.55; t.scale.z = 0.25;
    }
    const dor = add(new THREE.ConeGeometry(0.014, 0.035, 3), M.fishFin, 'ca_dorsal', f, -0.09, 0.03, 0); dor.rotation.z = 0.6; dor.scale.z = 0.25;
    if (!jump) {
      const rip = add(new THREE.TorusGeometry(0.16, 0.006, 6, 32), M.ripple, 'ca_ripple', f, 0.02, -0.01, 0);
      rip.rotation.x = Math.PI / 2; rip.scale.set(1.3, 0.5, 1); rip.castShadow = false;
    }
  };
  const school = (x, z, ry, n) => {
    const p = new THREE.Group(); p.name = 'dan_ca_lim_kim'; g.add(p);
    for (let i = 0; i < n; i++) fish(p, x + (rnd() - 0.5) * 0.9, z + (rnd() - 0.5) * 0.6, ry + (rnd() - 0.5) * 0.35, 1.3 + rnd() * 0.4, i === 0);
  };
  school(1.6, 2.7, 0.4, 6);
  school(-3.1, 1.2, -2.6, 5);
  school(3.4, -2.6, 2.2, 5);
  school(-1.0, -3.4, 0.9, 4);
  return g;
}
