// Ghe mui: covered trading boat. Bow toward -x, stern (motor) toward +x.
export function buildGheMui(THREE, M) {
  const g = new THREE.Group(); g.name = 'ghe_mui';
  const add = (geo, mat, name, p = g, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true; p.add(m); return m;
  };
  const L = 7.6, N = 48, R = 14, B = 1.0;
  const half = t => B * Math.pow(Math.sin(Math.PI * t), 0.55) + 0.03;
  const rise = t => 0.25 * Math.pow(Math.abs(t - 0.5) * 2, 3) + (t < 0.5 ? 0.25 * Math.pow(1 - 2 * t, 4) : 0);
  const pos = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, x = (t - 0.5) * L, s = Math.pow(Math.sin(Math.PI * t), 0.55), d = 0.55 * Math.sqrt(s) + 0.05;
    for (let j = 0; j <= R; j++) { const a = Math.PI * j / R; pos.push(x, 0.65 + rise(t) - Math.sin(a) * d, -Math.cos(a) * half(t)); }
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < R; j++) { const a = i * (R + 1) + j, b = a + R + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const hg = new THREE.BufferGeometry();
  hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setIndex(idx); hg.computeVertexNormals();
  add(hg, M.hull, 'hull').material.side = THREE.DoubleSide;
  for (const s of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= N; i++) { const t = i / N; pts.push(new THREE.Vector3((t - 0.5) * L, 0.65 + rise(t), s * half(t))); }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 96, 0.06, 8), M.trim, 'gunwale');
    // Mắt ghe: red-and-white eye on the bow
    const t = 0.1, x = (t - 0.5) * L, y = 0.6 + rise(t), z = s * (half(t) + 0.005);
    const eye = new THREE.Group(); eye.name = 'mat_ghe'; eye.position.set(x, y, z); eye.rotation.y = s > 0 ? 0.35 : Math.PI - 0.35; g.add(eye);
    add(new THREE.CircleGeometry(0.16, 32), M.eyeWhite, 'mat_ghe_white', eye).scale.set(1.5, 0.75, 1);
    add(new THREE.CircleGeometry(0.11, 32), M.boatEyeRed, 'mat_ghe_red', eye, 0, 0, 0.002).scale.set(1.5, 0.7, 1);
    add(new THREE.CircleGeometry(0.05, 24), M.dark, 'mat_ghe_pupil', eye, 0, 0, 0.004);
  }
  add(new THREE.BoxGeometry(4.4, 0.05, 1.05), M.plank, 'deck', g, 0.1, 0.32, 0);
  for (const x of [-2.2, -0.9, 0.4, 1.7, 2.9]) add(new THREE.BoxGeometry(0.16, 0.06, 1.7), M.trim, 'thwart', g, x, 0.6, 0);
  // Mui: arched green roof on posts over the middle/stern
  const rx0 = -0.2, rx1 = 2.9, rl = rx1 - rx0, rr = 0.95;
  const roof = add(new THREE.CylinderGeometry(rr, rr, rl, 40, 1, true, 0, Math.PI), M.roofGreen, 'mui_roof', g, (rx0 + rx1) / 2, 2.3, 0);
  roof.rotation.z = Math.PI / 2; roof.scale.set(0.45, 1, 1); roof.material.side = THREE.DoubleSide;
  for (const x of [rx0, rx1]) {
    const e = add(new THREE.TorusGeometry(rr, 0.05, 8, 40, Math.PI), M.roofEdge, 'mui_rib', g, x, 2.3, 0);
    e.rotation.y = Math.PI / 2; e.scale.set(1, 0.45, 1);
  }
  for (const x of [rx0 + 0.05, (rx0 + rx1) / 2, rx1 - 0.05]) for (const s of [-1, 1])
    add(new THREE.CylinderGeometry(0.045, 0.05, 1.7, 12), M.trim, 'mui_post', g, x, 1.45, s * 0.9);
  // Stern motor with long-tail shaft
  const mt = new THREE.Group(); mt.name = 'may_duoi_tom'; mt.position.set(3.5, 0.95, 0.2); g.add(mt);
  add(new THREE.BoxGeometry(0.4, 0.32, 0.3), M.motorRed, 'motor_block', mt);
  add(new THREE.CylinderGeometry(0.12, 0.12, 0.34, 20), M.metal, 'motor_drum', mt, 0, 0.2, 0).rotation.x = Math.PI / 2;
  const sh = add(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 12), M.metal, 'motor_shaft', mt, 1.15, -0.35, 0.1);
  sh.rotation.z = Math.PI / 2 + 0.3;
  add(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 10), M.metal, 'motor_tiller', mt, -0.55, 0.15, -0.05).rotation.z = Math.PI / 2 - 0.25;
  return g;
}
