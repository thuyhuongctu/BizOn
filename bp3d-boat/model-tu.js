import { kit } from './model-kit.js';
// Thầy Tú – standing, blue jacket, black trousers, pushing a bamboo pole.
export function buildTu(THREE, M) {
  const { add, limb, face, scarf, buttons } = kit(THREE, M);
  const t = new THREE.Group(); t.name = 'tu'; t.position.set(0.6, 0.22, -0.2); t.rotation.y = 0.15;
  for (const s of [-1, 1]) {
    limb(t, 'tu_leg', M.pantsDark, [s * 0.1, 0.86, 0], [s * 0.11, 0.1, 0.01], 0.075, 0.08);
    add(new THREE.SphereGeometry(0.05, 16, 12), M.skin, 'tu_foot', t, s * 0.11, 0.035, 0.07).scale.set(1, 0.6, 1.9);
  }
  add(new THREE.SphereGeometry(0.17, 24, 16), M.pantsDark, 'tu_hips', t, 0, 0.9, 0).scale.set(1.15, 0.55, 0.85);
  // Jacket: tapered body with flared hem
  const prof = [[0.21, 0], [0.2, 0.15], [0.19, 0.35], [0.2, 0.5], [0.16, 0.6], [0.06, 0.64]].map(p => new THREE.Vector2(p[0], p[1]));
  add(new THREE.LatheGeometry(prof, 40), M.shirtBlue, 'tu_jacket', t, 0, 0.82, 0).scale.z = 0.72;
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.09, 20, 14), M.shirtBlue, 'tu_shoulder', t, s * 0.19, 1.39, 0).scale.set(1, 0.75, 0.9);
  buttons(t, 0.01, 1.32, 5, 0.09, 0.152);
  add(new THREE.BoxGeometry(0.1, 0.012, 0.01), M.shirtSeam, 'tu_pocket', t, -0.1, 1.0, 0.15);
  scarf(t, 'tu_scarf', 1.46, 0.085, 0.01, 0.36);
  add(new THREE.CylinderGeometry(0.055, 0.06, 0.1, 16), M.skin, 'tu_neck', t, 0, 1.5, 0);
  const th = new THREE.Group(); th.name = 'tu_head'; th.position.set(0, 1.7, 0.01); th.rotation.y = 0.3; t.add(th);
  const R = 0.15;
  add(new THREE.SphereGeometry(R, 40, 28), M.skin, 'tu_face', th).scale.set(0.95, 1.15, 0.95);
  add(new THREE.SphereGeometry(R * 0.65, 24, 16), M.skin, 'tu_jaw', th, 0, -R * 0.5, R * 0.3).scale.set(1.2, 0.8, 0.9);
  face(th, R, { eyeH: 0.95, eyeW: 0.9, browR: 0.04 });
  // Short dark hair, swept up with a side quiff
  const cap = add(new THREE.SphereGeometry(R * 1.04, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.5), M.hairDark, 'tu_hair', th, 0, R * 0.25, -R * 0.06);
  cap.rotation.x = -0.25; cap.scale.y = 1.05;
  add(new THREE.SphereGeometry(R * 0.65, 24, 16), M.hairDark, 'tu_quiff', th, R * 0.1, R * 0.95, R * 0.35).scale.set(1.45, 0.5, 0.8);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(R * 0.12, R * 0.4, R * 0.35), M.hairDark, 'tu_sideburn', th, s * R * 0.9, R * 0.3, -R * 0.1);
  // Pole line: top behind-left, tip into the water beyond the gunwale
  const A = new THREE.Vector3(-0.55, 2.0, -0.1), B = new THREE.Vector3(0.95, 0.0, 1.3);
  const at = s => A.clone().lerp(B, s).toArray();
  const hl = at(0.26), hr = at(0.41);
  limb(t, 'tu_upperarm_l', M.shirtBlue, [-0.21, 1.38, 0], [-0.24, 1.15, 0.12], 0.058);
  limb(t, 'tu_forearm_l', M.shirtBlue, [-0.24, 1.15, 0.12], hl, 0.05, 0.058);
  limb(t, 'tu_upperarm_r', M.shirtBlue, [0.21, 1.38, 0], [0.25, 1.1, 0.12], 0.058);
  limb(t, 'tu_forearm_r', M.shirtBlue, [0.25, 1.1, 0.12], hr, 0.05, 0.058);
  for (const p of [hl, hr]) add(new THREE.SphereGeometry(0.05, 16, 12), M.skin, 'tu_hand', t, ...p).scale.set(1, 1.1, 0.9);
  const pole = new THREE.Group(); pole.name = 'tu_pole'; t.add(pole);
  limb(pole, 'tu_pole_shaft', M.bamboo, A.toArray(), B.toArray(), 0.028);
  for (let i = 1; i < 6; i++) limb(pole, 'tu_pole_node', M.bambooNode, at(i / 6 - 0.006), at(i / 6 + 0.006), 0.034);
  return t;
}
