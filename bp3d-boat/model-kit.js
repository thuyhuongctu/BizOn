// Shared character helpers (stylized, big-head proportions).
export function kit(THREE, M) {
  const up = new THREE.Vector3(0, 1, 0);
  const add = (geo, mat, name, parent, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true; parent.add(m); return m;
  };
  const limb = (parent, name, mat, a, b, r, r2) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), len = d.length();
    const geo = r2 === undefined ? new THREE.CapsuleGeometry(r, len, 8, 20) : new THREE.CylinderGeometry(r2, r, len, 20);
    const m = add(geo, mat, name, parent);
    m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(up, d.normalize()); return m;
  };
  const tube = (parent, name, mat, pts, r) =>
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 32, r, 12), mat, name, parent);
  // Face: big eyes w/ iris + highlight, brows, nose, smile, cheeks
  const face = (head, r, o = {}) => {
    for (const s of [-1, 1]) {
      const ew = add(new THREE.SphereGeometry(r * 0.2, 20, 16), M.eyeWhite, 'eye_white', head, s * r * 0.36, r * 0.02, r * 0.82);
      ew.scale.set(o.eyeW || 1, o.eyeH || 1.15, 0.55);
      add(new THREE.SphereGeometry(r * 0.13, 20, 16), M.iris, 'eye_iris', head, s * r * 0.35, r * 0.0, r * 0.9).scale.set(1, (o.eyeH || 1.15) * 0.95, 0.45);
      add(new THREE.SphereGeometry(r * 0.07, 16, 12), M.eyeDark, 'eye_pupil', head, s * r * 0.35, 0, r * 0.94).scale.set(1, 1.1, 0.4);
      add(new THREE.SphereGeometry(r * 0.035, 10, 8), M.eyeWhite, 'eye_glint', head, s * r * 0.31, r * 0.05, r * 0.97);
      const br = add(new THREE.CapsuleGeometry(r * (o.browR || 0.03), r * 0.22, 6, 10), M.brow, 'brow', head, s * r * 0.36, r * 0.3, r * 0.86);
      br.rotation.z = Math.PI / 2 + s * 0.15;
      add(new THREE.SphereGeometry(r * 0.15, 16, 12), M.blush, 'cheek', head, s * r * 0.55, -r * 0.27, r * 0.74).scale.set(1, 0.6, 0.35);
    }
    add(new THREE.SphereGeometry(r * 0.08, 16, 12), M.skin, 'nose', head, 0, -r * 0.15, r * 0.98).scale.set(1, 0.8, 0.8);
    const sm = add(new THREE.TorusGeometry(r * 0.2, r * 0.035, 8, 24, Math.PI), M.mouth, 'smile', head, 0, -r * 0.36, r * 0.9);
    sm.rotation.z = Math.PI; sm.scale.y = 0.7;
    add(new THREE.SphereGeometry(r * 0.17, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.teeth, 'teeth', head, 0, -r * 0.37, r * 0.86).scale.set(1, 0.45, 0.4);
    for (const s of [-1, 1]) add(new THREE.SphereGeometry(r * 0.16, 16, 12), M.skin, 'ear', head, s * r * 0.95, 0, 0).scale.set(0.4, 1, 0.7);
  };
  // Khăn rằn: loop around neck + two flat gingham tails down the chest
  const scarf = (parent, name, y, r, z0, len) => {
    const s = add(new THREE.TorusGeometry(r, 0.04, 12, 32), M.scarf, name, parent, 0, y, z0);
    s.rotation.x = Math.PI / 2; s.scale.set(1.1, 1, 1);
    for (const sx of [-1, 1]) {
      const t = add(new THREE.BoxGeometry(0.075, len, 0.02), M.scarf, name + '_tail', parent, sx * 0.065, y - len / 2 + 0.02, z0 + r + 0.035);
      t.rotation.z = sx * 0.06; t.rotation.x = -0.12;
    }
  };
  const buttons = (parent, x, y0, n, step, z) => {
    for (let i = 0; i < n; i++) add(new THREE.SphereGeometry(0.012, 10, 8), M.button, 'button', parent, x, y0 - i * step, z).scale.z = 0.5;
  };
  return { add, limb, tube, face, scarf, buttons };
}
