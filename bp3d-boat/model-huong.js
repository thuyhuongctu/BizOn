import { kit } from './model-kit.js';
// Hương – seated on the starboard gunwale, legs over the side, hand on mango basket.
export function buildHuong(THREE, M) {
  const { add, limb, tube, face, scarf, buttons } = kit(THREE, M);
  const up = new THREE.Vector3(0, 1, 0);
  const h = new THREE.Group(); h.name = 'huong'; h.position.set(-0.45, 0.56, 0.7); h.rotation.y = 0.2;
  const hip = 0.07;
  add(new THREE.SphereGeometry(0.16, 24, 16), M.pants, 'huong_hips', h, 0, hip, 0).scale.set(1.15, 0.65, 1);
  // Áo bà ba: flared jacket (lathe) + chest
  const prof = [[0.2, 0], [0.17, 0.1], [0.13, 0.28], [0.12, 0.4], [0.1, 0.48], [0.05, 0.52]].map(p => new THREE.Vector2(p[0], p[1]));
  const jk = add(new THREE.LatheGeometry(prof, 40), M.lavender, 'huong_ao_ba_ba', h, 0, hip - 0.02, 0.02); jk.scale.z = 0.78;
  add(new THREE.SphereGeometry(0.115, 24, 16), M.lavender, 'huong_chest', h, 0, hip + 0.36, 0.03).scale.set(1.05, 0.85, 0.8);
  buttons(h, 0.012, hip + 0.42, 5, 0.075, 0.13);
  for (let i = 0; i < 7; i++) add(new THREE.SphereGeometry(0.014, 8, 6), i % 2 ? M.embroidery : M.leaf, 'huong_embroidery', h, -0.09 + (i % 3) * 0.02, hip + 0.06 + i * 0.022, 0.155 - i * 0.004);
  scarf(h, 'huong_scarf', hip + 0.5, 0.075, 0.02, 0.3);
  add(new THREE.CylinderGeometry(0.04, 0.045, 0.09, 16), M.skin, 'huong_neck', h, 0, hip + 0.55, 0.02);
  // Head (big, cartoon proportions)
  const hh = new THREE.Group(); hh.name = 'huong_head'; hh.position.set(0, hip + 0.74, 0.04); hh.rotation.set(0.05, 0.15, 0.06); h.add(hh);
  const R = 0.15;
  add(new THREE.SphereGeometry(R, 40, 28), M.skin, 'huong_face', hh).scale.set(1, 1.05, 0.95);
  add(new THREE.SphereGeometry(R * 0.6, 24, 16), M.skin, 'huong_chin', hh, 0, -R * 0.45, R * 0.35).scale.set(1.1, 0.8, 0.9);
  face(hh, R, { eyeH: 1.25, browR: 0.022 });
  // Hair: crown cap with side part + long wavy locks to mid-back
  const cap = add(new THREE.SphereGeometry(R * 1.1, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.55), M.hairAuburn, 'huong_hair_cap', hh, 0, R * 0.08, -R * 0.08);
  cap.rotation.x = -0.4;
  add(new THREE.SphereGeometry(R * 0.55, 24, 16), M.hairAuburn, 'huong_fringe', hh, -R * 0.3, R * 0.78, R * 0.3).scale.set(1.4, 0.35, 0.9);
  const wav = (x0, z0, len, phase, sx) => {
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      pts.push([x0 * (1 + t * 0.5) + sx * Math.sin(t * 9 + phase) * 0.035, R * 0.3 - t * len, z0 - t * 0.06 + Math.cos(t * 9 + phase) * 0.02]);
    }
    return pts;
  };
  for (let i = 0; i < 13; i++) {
    const a = Math.PI * (0.15 + 0.7 * (i / 12)); // across the back
    const x = Math.cos(a) * R * 1.05, z = -Math.sin(a) * R * 0.95;
    tube(hh, 'huong_hair_lock', M.hairAuburn, wav(x, z, 0.62 + (i % 3) * 0.05, i, 1), 0.045);
  }
  for (const s of [-1, 1]) {
    tube(hh, 'huong_hair_front', M.hairAuburn, wav(s * R * 1.0, R * 0.25, 0.5, s, s), 0.04);
    tube(hh, 'huong_hair_side', M.hairAuburn, wav(s * R * 1.05, 0, 0.58, s * 2, s), 0.045);
  }
  // Legs: wide black silk trousers (quần đen ống rộng) with folds, crease, flared hem; bare feet
  for (const s of [-1, 1]) {
    const x = s * 0.085;
    limb(h, 'huong_thigh', M.pants, [x, hip, 0.04], [x, hip + 0.02, 0.4], 0.078);
    add(new THREE.SphereGeometry(0.082, 20, 14), M.pants, 'huong_knee', h, x, hip + 0.015, 0.42).scale.set(1, 0.95, 0.9);
    // Lower leg: flared tube following knee -> hem
    const K = new THREE.Vector3(x, hip + 0.01, 0.43), Hm = new THREE.Vector3(x * 1.12, hip - 0.37, 0.48);
    const dir = Hm.clone().sub(K), len = dir.length();
    const shin = add(new THREE.CylinderGeometry(0.07, 0.098, len, 28, 6, true), M.pants, 'huong_shin', h);
    shin.material.side = THREE.DoubleSide;
    shin.position.copy(K).addScaledVector(dir, 0.5);
    shin.quaternion.setFromUnitVectors(up, dir.clone().normalize());
    const at = t => K.clone().lerp(Hm, t);
    // Fabric folds: horizontal soft rings + front crease
    [0.18, 0.42, 0.64].forEach((t, i) => {
      const f = add(new THREE.TorusGeometry(0.074 + t * 0.026, 0.009, 8, 28), M.pantsFold, 'huong_pants_fold', h);
      f.position.copy(at(t)); f.quaternion.copy(shin.quaternion); f.rotateX(Math.PI / 2); f.rotateY((i - 1) * 0.12 * s);
    });
    const cr = add(new THREE.CapsuleGeometry(0.006, len * 0.85, 4, 8), M.pantsFold, 'huong_pants_crease', h);
    cr.position.copy(at(0.5)).add(new THREE.Vector3(0, 0, 0.083)); cr.quaternion.copy(shin.quaternion);
    // Thigh wrinkles at the hip
    for (let k = 0; k < 2; k++) {
      const w = add(new THREE.CapsuleGeometry(0.008, 0.1, 4, 8), M.pantsFold, 'huong_pants_wrinkle', h, x + s * 0.02, hip + 0.07, 0.12 + k * 0.08);
      w.rotation.set(Math.PI / 2, 0, s * 0.5);
    }
    const hem = add(new THREE.TorusGeometry(0.098, 0.012, 8, 28), M.pantsFold, 'huong_pants_hem', h);
    hem.position.copy(Hm); hem.quaternion.copy(shin.quaternion); hem.rotateX(Math.PI / 2);
    add(new THREE.CylinderGeometry(0.036, 0.04, 0.08, 16), M.skin, 'huong_ankle', h, x * 1.12, hip - 0.4, 0.485);
    add(new THREE.SphereGeometry(0.045, 16, 12), M.skin, 'huong_foot', h, x * 1.12, hip - 0.45, 0.53).scale.set(0.85, 0.55, 1.8);
    for (let k = 0; k < 5; k++) add(new THREE.SphereGeometry(0.011, 8, 6), M.skin, 'huong_toe', h, x * 1.12 + (k - 2) * 0.014, hip - 0.46, 0.605 - Math.abs(k - 1.5) * 0.004);
  }
  // Waistband under the jacket hem
  add(new THREE.TorusGeometry(0.17, 0.015, 8, 32), M.pantsFold, 'huong_waistband', h, 0, hip + 0.02, 0.02).rotation.x = Math.PI / 2;
  // Left arm resting on her knee; right arm reaching to the mango basket beside her
  limb(h, 'huong_upperarm_l', M.lavender, [0.15, hip + 0.42, 0.02], [0.19, hip + 0.18, 0.12], 0.042);
  limb(h, 'huong_forearm_l', M.lavender, [0.19, hip + 0.18, 0.12], [0.11, hip + 0.1, 0.33], 0.038, 0.045);
  add(new THREE.SphereGeometry(0.038, 16, 12), M.skin, 'huong_hand_l', h, 0.1, hip + 0.09, 0.37).scale.set(1, 0.6, 1.3);
  limb(h, 'huong_upperarm_r', M.lavender, [-0.15, hip + 0.42, 0.02], [-0.27, hip + 0.2, -0.04], 0.042);
  limb(h, 'huong_forearm_r', M.lavender, [-0.27, hip + 0.2, -0.04], [-0.42, hip - 0.04, -0.18], 0.038, 0.045);
  add(new THREE.SphereGeometry(0.038, 16, 12), M.skin, 'huong_hand_r', h, -0.45, hip - 0.06, -0.2).scale.set(1.2, 0.6, 1);
  return h;
}
