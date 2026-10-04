import { kit } from './model-kit.js';
// Generic team member: stand / sit, hair style, optional prop.
export function person(THREE, M, o) {
  const { add, limb, face, scarf, buttons } = kit(THREE, M);
  const p = new THREE.Group(); p.name = o.name; p.position.set(...o.pos); p.rotation.y = o.ry || 0;
  const sit = o.pose === 'sit', H = o.male ? 1 : 0.92, hipY = sit ? 0.42 : 0.82 * H;
  for (const s of [-1, 1]) {
    const x = s * 0.09;
    if (sit) {
      limb(p, o.name + '_thigh', o.pants, [x, hipY, 0], [x, hipY, 0.38], 0.07);
      limb(p, o.name + '_shin', o.pants, [x, hipY, 0.4], [x, 0.06, 0.44], 0.06, 0.07);
      add(new THREE.SphereGeometry(0.045, 14, 10), M.skin, o.name + '_foot', p, x, 0.03, 0.5).scale.set(0.9, 0.55, 1.7);
    } else {
      limb(p, o.name + '_leg', o.pants, [x, hipY, 0], [x * 1.1, 0.1, 0.01], 0.07, 0.078);
      add(new THREE.SphereGeometry(0.048, 14, 10), M.skin, o.name + '_foot', p, x * 1.1, 0.035, 0.07).scale.set(1, 0.6, 1.8);
    }
  }
  add(new THREE.SphereGeometry(0.16, 20, 14), o.pants, o.name + '_hips', p, 0, hipY, 0).scale.set(1.15, 0.6, 0.9);
  const tl = o.male ? 0.62 : 0.55, top = hipY + tl;
  const prof = [[0.19, 0], [0.17, 0.12], [0.15, tl * 0.55], [0.16, tl * 0.82], [0.12, tl * 0.95], [0.05, tl]].map(v => new THREE.Vector2(v[0] * (o.male ? 1.12 : 1), v[1]));
  add(new THREE.LatheGeometry(prof, 32), o.shirt, o.name + '_shirt', p, 0, hipY - 0.05, 0).scale.z = 0.75;
  buttons(p, 0.01, top - 0.12, 4, 0.08, o.male ? 0.15 : 0.135);
  scarf(p, o.name + '_scarf', top - 0.06, 0.08, 0.01, 0.32);
  p.traverse(m => { if (m.name.startsWith(o.name + '_scarf')) m.material = o.scarf; });
  add(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 14), M.skin, o.name + '_neck', p, 0, top, 0);
  const hd = new THREE.Group(); hd.name = o.name + '_head'; hd.position.set(0, top + 0.2, 0.02); hd.rotation.y = o.look || 0; p.add(hd);
  const R = 0.15;
  add(new THREE.SphereGeometry(R, 32, 24), M.skin, o.name + '_face', hd).scale.set(0.97, 1.08, 0.95);
  add(new THREE.SphereGeometry(R * 0.6, 20, 14), M.skin, o.name + '_chin', hd, 0, -R * 0.45, R * 0.32).scale.set(1.15, 0.8, 0.9);
  face(hd, R, { eyeH: o.male ? 0.95 : 1.2, browR: o.male ? 0.04 : 0.022 });
  const hair = o.hair || M.hairDark;
  const cap = add(new THREE.SphereGeometry(R * 1.08, 32, 20, 0, Math.PI * 2, 0, Math.PI * (o.male ? 0.48 : 0.56)), hair, o.name + '_hair', hd, 0, R * 0.12, -R * 0.06);
  cap.rotation.x = -0.3;
  if (o.male) add(new THREE.SphereGeometry(R * 0.6, 20, 14), hair, o.name + '_quiff', hd, R * 0.1, R * 0.9, R * 0.35).scale.set(1.45, 0.5, 0.8);
  if (o.style === 'bun') add(new THREE.SphereGeometry(R * 0.42, 20, 14), hair, o.name + '_bun', hd, 0, R * 0.75, -R * 0.75);
  if (o.style === 'bob' || o.style === 'long') {
    const len = o.style === 'long' ? 0.42 : 0.22;
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (0.1 + 0.8 * i / 8), x = Math.cos(a) * R * 1.02, z = -Math.sin(a) * R * 0.9;
      limb(hd, o.name + '_hair_lock', hair, [x, R * 0.2, z], [x * 1.15, R * 0.2 - len, z - 0.02], 0.05);
    }
  }
  // Arms: generic pose ending at given hand targets (local coords)
  const sh = top - 0.07, hands = o.hands || [[0.2, hipY + 0.05, 0.08], [-0.2, hipY + 0.05, 0.08]];
  hands.forEach((hp, i) => {
    const s = i ? -1 : 1, S = [s * 0.18 * (o.male ? 1.12 : 1), sh, 0], E = [(S[0] + hp[0]) / 2 + s * 0.06, (sh + hp[1]) / 2, (hp[2]) / 2 - 0.02];
    limb(p, o.name + '_upperarm', o.shirt, S, E, 0.048);
    limb(p, o.name + '_forearm', o.shirt, E, hp, 0.042, 0.048);
    add(new THREE.SphereGeometry(0.042, 14, 10), M.skin, o.name + '_hand', p, ...hp);
  });
  if (o.prop === 'book') add(new THREE.BoxGeometry(0.22, 0.02, 0.16), M.paper, o.name + '_notebook', p, ...o.hands[0]).rotation.x = -0.6;
  if (o.prop === 'megaphone') {
    const m = add(new THREE.CylinderGeometry(0.09, 0.03, 0.24, 20, 1, true), M.megaphone, o.name + '_megaphone', p, o.hands[0][0] + 0.05, o.hands[0][1] + 0.04, o.hands[0][2] + 0.12);
    m.rotation.set(Math.PI / 2, 0, -0.4); m.material.side = THREE.DoubleSide;
  }
  if (o.prop === 'basket') add(new THREE.CylinderGeometry(0.16, 0.12, 0.1, 24, 1, true), M.wicker, o.name + '_basket', p, 0, hipY + 0.08, 0.32).material.side = THREE.DoubleSide;
  return p;
}
