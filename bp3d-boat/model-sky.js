// Bình minh: small birds (chim sẻ/chìa vôi) and butterflies flying around the boats.
export function buildSky(THREE) {
  const g = new THREE.Group(); g.name = 'binh_minh_sinh_vat';
  const mat = (n, c, r = 0.6, extra = {}) => new THREE.MeshStandardMaterial({ name: n, color: c, roughness: r, ...extra });
  const M = {
    bird: mat('chim_body', '#7a5232'), birdBelly: mat('chim_belly', '#e9d2a6'), birdWing: mat('chim_wing', '#4b3220'),
    beak: mat('chim_beak', '#e0a030'), eye: mat('chim_eye', '#111111', 0.3),
    bfA: mat('buom_vang', '#f6b83a', 0.5, { side: THREE.DoubleSide }), bfB: mat('buom_trang', '#fbf3df', 0.5, { side: THREE.DoubleSide }),
    bfC: mat('buom_tim', '#a88ad8', 0.5, { side: THREE.DoubleSide }), bfEdge: mat('buom_vien', '#2a2018', 0.6, { side: THREE.DoubleSide }),
    bfBody: mat('buom_than', '#2a2018'),
  };
  const add = (geo, m, name, p, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.name = name; o.position.set(x, y, z); o.castShadow = true; p.add(o); return o; };
  const movers = [];

  const bird = (i) => {
    const b = new THREE.Group(); b.name = 'chim_' + i; g.add(b);
    const body = new THREE.Group(); b.add(body);
    add(new THREE.SphereGeometry(0.07, 16, 12), M.bird, 'chim_body', body).scale.set(1.5, 0.9, 0.9);
    add(new THREE.SphereGeometry(0.055, 14, 10), M.birdBelly, 'chim_belly', body, 0.01, -0.02, 0).scale.set(1.3, 0.8, 0.85);
    add(new THREE.SphereGeometry(0.05, 14, 10), M.bird, 'chim_head', body, 0.1, 0.035, 0);
    const bk = add(new THREE.ConeGeometry(0.014, 0.045, 8), M.beak, 'chim_beak', body, 0.16, 0.03, 0); bk.rotation.z = -Math.PI / 2;
    for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.01, 8, 6), M.eye, 'chim_eye', body, 0.125, 0.05, s * 0.035);
    const tail = add(new THREE.BoxGeometry(0.09, 0.008, 0.05), M.birdWing, 'chim_tail', body, -0.13, 0.01, 0); tail.rotation.z = 0.25;
    const wings = [];
    for (const s of [-1, 1]) {
      const pivot = new THREE.Group(); pivot.position.set(0, 0.03, s * 0.04); body.add(pivot);
      const wgt = add(new THREE.BoxGeometry(0.1, 0.008, 0.16), M.birdWing, 'chim_wing', pivot, -0.01, 0, s * 0.08);
      wgt.scale.x = 0.9; wings.push([pivot, s]);
    }
    const r = 3.2 + (i % 3) * 1.4, h = 2.6 + (i % 4) * 0.45, spd = 0.28 + (i % 5) * 0.05, ph = i * 1.9, dir = i % 2 ? 1 : -1;
    movers.push(t => {
      const a = ph + dir * t * spd;
      const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.75, y = h + Math.sin(t * 1.3 + ph) * 0.25;
      b.position.set(x, y, z);
      const vx = -Math.sin(a) * dir, vz = Math.cos(a) * 0.75 * dir;
      b.rotation.y = Math.atan2(-vz, vx);
      body.rotation.z = Math.cos(t * 1.3 + ph) * 0.15;
      const glide = (Math.sin(t * 0.7 + ph) > 0.6);
      const f = glide ? 0.15 : Math.sin(t * 22 + ph) * 0.9;
      wings.forEach(([p, s]) => p.rotation.x = s * f);
    });
  };
  for (let i = 0; i < 7; i++) bird(i);

  const bfShape = (() => {
    const s = new THREE.Shape(); s.moveTo(0, 0);
    s.bezierCurveTo(0.02, 0.09, 0.12, 0.12, 0.13, 0.05); s.bezierCurveTo(0.14, 0.0, 0.08, -0.01, 0.05, -0.01);
    s.bezierCurveTo(0.1, -0.03, 0.1, -0.09, 0.05, -0.09); s.bezierCurveTo(0.02, -0.08, 0.0, -0.04, 0, 0);
    return new THREE.ShapeGeometry(s, 12);
  })();
  const butterfly = (i, wm, cx, cz, cy) => {
    const b = new THREE.Group(); b.name = 'buom_' + i; g.add(b);
    add(new THREE.CapsuleGeometry(0.008, 0.07, 4, 8), M.bfBody, 'buom_than', b).rotation.z = Math.PI / 2;
    const wings = [];
    for (const s of [-1, 1]) {
      const p = new THREE.Group(); b.add(p);
      const w = add(bfShape, wm, 'buom_canh', p); w.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); w.scale.set(1, s, 1);
      const e = add(bfShape, M.bfEdge, 'buom_vien', p, 0, -0.001, 0); e.rotation.copy(w.rotation); e.scale.set(1.08, s * 1.08, 1);
      wings.push([p, s]);
    }
    const ph = i * 2.3, rr = 0.5 + (i % 3) * 0.25;
    movers.push(t => {
      const a = ph + t * (0.45 + (i % 2) * 0.2);
      b.position.set(cx + Math.cos(a) * rr + Math.sin(t * 1.7 + ph) * 0.15, cy + Math.sin(t * 2.3 + ph) * 0.18, cz + Math.sin(a) * rr * 0.8);
      b.rotation.y = -a + Math.PI;
      const f = 0.2 + Math.abs(Math.sin(t * 11 + ph)) * 1.1;
      wings.forEach(([p, s]) => p.rotation.x = s * f);
    });
  };
  [[M.bfA, 2.2, 1.8, 0.75], [M.bfB, -2.5, -1.4, 0.8], [M.bfC, -1.3, 2.4, 0.7], [M.bfA, 0.6, -5.4, 0.85], [M.bfC, 3.2, -0.5, 0.9], [M.bfB, -0.8, 0.9, 1.9]]
    .forEach((c, i) => butterfly(i, ...c));

  return { group: g, update: t => movers.forEach(m => m(t)) };
}

// Synthesized birdsong (Web Audio): short chirps & trills at random intervals.
export function birdsong() {
  let ctx = null, timer = null, on = false;
  const chirp = (when, f0, f1, dur, vol) => {
    const o = ctx.createOscillator(), gn = ctx.createGain(), pan = ctx.createStereoPanner();
    o.type = 'sine'; o.frequency.setValueAtTime(f0, when); o.frequency.exponentialRampToValueAtTime(f1, when + dur);
    gn.gain.setValueAtTime(0, when); gn.gain.linearRampToValueAtTime(vol, when + 0.008); gn.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    pan.pan.value = Math.random() * 1.6 - 0.8;
    o.connect(gn).connect(pan).connect(ctx.destination); o.start(when); o.stop(when + dur + 0.02);
  };
  const phrase = () => {
    const t = ctx.currentTime + 0.05, kind = Math.random(), base = 2600 + Math.random() * 1800, v = 0.05 + Math.random() * 0.05;
    if (kind < 0.4) for (let i = 0; i < 4 + (Math.random() * 6 | 0); i++) chirp(t + i * 0.07, base * 1.15, base * 0.85, 0.05, v);
    else if (kind < 0.75) { chirp(t, base * 0.8, base * 1.4, 0.12, v); chirp(t + 0.16, base * 1.3, base * 0.9, 0.1, v); }
    else for (let i = 0; i < 3; i++) chirp(t + i * 0.13, base, base * 1.6, 0.08, v * 0.9);
    timer = setTimeout(phrase, 350 + Math.random() * 1600);
  };
  return {
    get on() { return on; },
    toggle() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      on = !on;
      if (on) { ctx.resume(); phrase(); } else { clearTimeout(timer); ctx.suspend(); }
      return on;
    },
  };
}
