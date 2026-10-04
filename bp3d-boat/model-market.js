// Chợ nổi: lighter vendor boats around the hero boat.
export function buildMarket(THREE, M) {
  const g = new THREE.Group(); g.name = 'cho_noi';
  const add = (geo, mat, name, p, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true; p.add(m); return m;
  };
  const hull = (p, L, B) => {
    const N = 24, R = 10, pos = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, x = (t - 0.5) * L, s = Math.pow(Math.sin(Math.PI * t), 0.6);
      const half = B * s + 0.02, rise = 0.28 * Math.pow(Math.abs(t - 0.5) * 2, 3), d = 0.38 * Math.sqrt(s) + 0.04;
      for (let j = 0; j <= R; j++) { const a = Math.PI * j / R; pos.push(x, 0.45 + rise - Math.sin(a) * d, -Math.cos(a) * half); }
    }
    for (let i = 0; i < N; i++) for (let j = 0; j < R; j++) { const a = i * (R + 1) + j, b = a + R + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = add(geo, M.hullSide, 'vendor_hull', p); m.material.side = THREE.DoubleSide;
    add(new THREE.BoxGeometry(L * 0.62, 0.04, B * 1.1), M.plank, 'vendor_floor', p, 0, 0.2, 0);
  };
  const pile = (p, mat, x, z, w, d, layers, r) => {
    for (let l = 0; l < layers; l++) {
      const nx = Math.max(1, Math.round((w - l * r) / (r * 2))), nz = Math.max(1, Math.round((d - l * r) / (r * 2)));
      for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++)
        add(new THREE.SphereGeometry(r, 14, 10), mat, 'vendor_fruit', p, x + (i - (nx - 1) / 2) * r * 2, 0.24 + r + l * r * 1.5, z + (k - (nz - 1) / 2) * r * 2);
    }
  };
  const vendor = (p, x, z, shirt, ry) => {
    const v = new THREE.Group(); v.name = 'vendor'; v.position.set(x, 0.22, z); v.rotation.y = ry; p.add(v);
    add(new THREE.SphereGeometry(0.2, 20, 14), M.pantsDark, 'vendor_legs', v, 0, 0.12, 0.08).scale.set(1, 0.6, 1.3);
    add(new THREE.CapsuleGeometry(0.15, 0.3, 6, 16), shirt, 'vendor_body', v, 0, 0.45, 0);
    add(new THREE.SphereGeometry(0.14, 24, 16), M.skin, 'vendor_head', v, 0, 0.82, 0.02);
    add(new THREE.ConeGeometry(0.3, 0.17, 32, 1, true), M.nonLa, 'non_la', v, 0, 0.98, 0).material.side = THREE.DoubleSide;
  };
  const beo = (p, x, z, mat) => {
    add(new THREE.CylinderGeometry(0.03, 0.04, 2.6, 12), M.bamboo, 'vendor_beo', p, x, 1.5, z);
    for (let i = 0; i < 8; i++)
      add(new THREE.CapsuleGeometry(0.035, 0.14, 4, 8), mat, 'vendor_beo_fruit', p, x + Math.cos(i) * 0.1, 2.45 - (i % 4) * 0.08, z + Math.sin(i) * 0.1).rotation.z = 0.3 * Math.cos(i * 2);
  };
  const boats = [
    { x: -1.2, z: -3.4, ry: 0.15, fruit: [M.mango, M.lime], shirt: M.shirtGreen, beoMat: M.mango },
    { x: 4.6, z: -2.0, ry: -0.35, fruit: [M.red, M.mangoOrange], shirt: M.shirtRed, beoMat: M.mango },
    { x: -5.4, z: 0.6, ry: 0.3, fruit: [M.durian, M.mango], shirt: M.shirtCyan, beoMat: M.lime },
    { x: 4.9, z: 2.8, ry: 0.5, fruit: [M.lime, M.red], shirt: M.shirtGreen, beoMat: M.mango },
    { x: -3.6, z: 3.6, ry: -0.2, fruit: [M.mangoOrange, M.lime], shirt: M.shirtRed, beoMat: M.red },
  ];
  boats.forEach((b, i) => {
    const p = new THREE.Group(); p.name = 'vendor_boat_' + (i + 1); p.position.set(b.x, 0, b.z); p.rotation.y = b.ry; g.add(p);
    hull(p, 4.6, 0.62);
    pile(p, b.fruit[0], 0.5, 0, 1.2, 0.7, 3, 0.09);
    pile(p, b.fruit[1], -0.55, 0, 0.6, 0.6, 2, 0.09);
    vendor(p, -1.4, 0, b.shirt, Math.PI / 2);
    beo(p, 1.4, -0.3, b.beoMat);
  });
  return g;
}
