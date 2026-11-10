/* BizOn – «Bến BizOn»: lớp chi tiết của cảnh (bản thử). © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Làm cho bến sông «đầy» hơn mà vẫn nhẹ: nền cỏ có lối mòn và đá lát (một ảnh vẽ bằng canvas), bụi cỏ, hoa dại, đá cuội,
 * hàng rào tre, luống rau, lu nước, đống củi, bếp lửa có khói, dây phơi, bụi chuối, thúng trái cây, gà trên sân, vịt dưới sông.
 * Mọi thứ dựng bằng khối cơ bản của three.js và số ngẫu nhiên có hạt giống cố định (cảnh lần nào cũng giống nhau);
 * không nạp tệp ngoài, không gọi mạng. Vật nhỏ lặp nhiều dùng InstancedMesh để ít lệnh vẽ. Máy yếu (nhe) thì giảm số lượng.
 * ben-bizon.js truyền vào đồ nghề dựng khối của nó; tệp này không tự tạo scene hay renderer.
 */
const PI = Math.PI;
const LOI = [[0, -6.4, 2.6, 12.2], [0, -6.2, 24, 2.2], [-10, -4.4, 2.2, 3.6], [10.5, -4.4, 2.2, 3.6]];   // lối đi: tâm x, tâm z, rộng, dài
const DAT = { x1: -23, x2: 23, z1: -17.2, z2: 0 };

export function lamDayCanh(c) {
  const { THREE, scene, khoi, M, hop, tru, cau, nhom, chan, dong, giam, nhe, NUOC_Y, noi, diDuoc } = c;
  let hat = 20261110;
  const rnd = () => { hat = hat + 0x6D2B79F5 | 0; let t = Math.imul(hat ^ hat >>> 15, 1 | hat); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const kg = (a, b) => a + rnd() * (b - a);
  const trenLoi = (x, z, m = 0) => LOI.some(([lx, lz, w, d]) => Math.abs(x - lx) < w / 2 + m && Math.abs(z - lz) < d / 2 + m);
  const ganNoi = (x, z, m) => noi.some(p => Math.hypot(x - p.x, z - p.z) < m);
  const dem = { co: 0, hoa: 0, da: 0, rao: 0, ga: 0, vit: 0, vat: 0 };

  // ---- nền: cỏ, lối mòn, đá lát, dải phù sa sát mép nước (một ảnh canvas phủ lên mặt bờ)
  (function nen() {
    const W = nhe ? 1536 : 2048, H = Math.round(W * (DAT.z2 - DAT.z1) / (DAT.x2 - DAT.x1)), k = W / (DAT.x2 - DAT.x1);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    const X = x => (x - DAT.x1) * k, Z = z => (z - DAT.z1) * k;
    g.fillStyle = '#93bf6c'; g.fillRect(0, 0, W, H);
    const xanh = ['#86b662', '#9dc978', '#a6cf7d', '#7fae5c', '#b0d488'];
    for (let i = 0; i < (nhe ? 700 : 1500); i++) { g.globalAlpha = kg(0.18, 0.4); g.fillStyle = xanh[i % xanh.length]; g.beginPath(); g.ellipse(rnd() * W, rnd() * H, kg(8, 46) * k / 44, kg(6, 26) * k / 44, rnd() * PI, 0, PI * 2); g.fill(); }
    g.globalAlpha = 1;
    const ps = g.createLinearGradient(0, Z(-2.6), 0, Z(0)); ps.addColorStop(0, 'rgba(217,189,138,0)'); ps.addColorStop(0.55, 'rgba(217,189,138,.85)'); ps.addColorStop(1, '#cfae7a');
    g.fillStyle = ps; g.fillRect(0, Z(-2.6), W, Z(0) - Z(-2.6));
    // lối mòn: đất sáng màu, mép nhòe vào cỏ
    g.save(); g.shadowColor = '#d9c292'; g.shadowBlur = 0.55 * k; g.fillStyle = '#d9c292';
    LOI.forEach(([x, z, w, d]) => g.fillRect(X(x - w / 2 - 0.2), Z(z - d / 2 - 0.2), (w + 0.4) * k, (d + 0.4) * k));
    noi.forEach(p => { if (p.z > -0.4) return; g.beginPath(); g.arc(X(p.x), Z(p.z), p.tam * 0.62 * k, 0, PI * 2); g.fill(); });
    g.restore();
    for (let i = 0; i < (nhe ? 900 : 2200); i++) { const x = kg(DAT.x1, DAT.x2), z = kg(DAT.z1, DAT.z2); if (!trenLoi(x, z, 0.5) && z < -2) continue; g.globalAlpha = kg(0.15, 0.4); g.fillStyle = i % 3 ? '#b99e6c' : '#efe2bf'; g.fillRect(X(x), Z(z), kg(1, 3), kg(1, 3)); }
    g.globalAlpha = 1;
    // đá lát trên lối đi: mỗi viên lệch một chút, vài viên vỡ để lộ đất
    const da = ['#eadfc6', '#e1d3b4', '#f0e6cf', '#dccba9', '#e6d8ba'], o = 0.62;
    LOI.forEach(([lx, lz, w, d]) => {
      for (let x = lx - w / 2 + 0.06; x < lx + w / 2 - o + 0.1; x += o) for (let z = lz - d / 2 + 0.06; z < lz + d / 2 - o + 0.1; z += o) {
        if (rnd() < 0.07) continue;
        const j = () => kg(-0.025, 0.025), s = (o - 0.07) * k, px = X(x + j()), pz = Z(z + j()), r = 0.07 * k;
        g.fillStyle = da[Math.floor(rnd() * da.length)]; g.beginPath(); g.roundRect(px, pz, s + kg(-2, 2), s + kg(-2, 2), r); g.fill();
        g.strokeStyle = 'rgba(120,96,60,.3)'; g.lineWidth = Math.max(1, k / 40); g.stroke();
        if (rnd() < 0.16) { g.strokeStyle = 'rgba(110,88,55,.45)'; g.beginPath(); g.moveTo(px + kg(0, s), pz); g.lineTo(px + kg(0, s), pz + kg(s * 0.4, s)); g.stroke(); }
      }
    });
    // nét cỏ nhỏ cho mặt cỏ có vân
    g.lineWidth = Math.max(1, k / 36);
    for (let i = 0; i < (nhe ? 2500 : 7000); i++) { const x = kg(DAT.x1, DAT.x2), z = kg(DAT.z1, -1.8); if (trenLoi(x, z, 0.15)) continue; g.strokeStyle = i % 2 ? 'rgba(96,142,72,.5)' : 'rgba(178,214,138,.55)'; g.beginPath(); g.moveTo(X(x), Z(z)); g.lineTo(X(x) + kg(-2, 2), Z(z) - kg(3, 7) * k / 44); g.stroke(); }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(DAT.x2 - DAT.x1, DAT.z2 - DAT.z1), new THREE.MeshStandardMaterial({ map: t, roughness: 0.95, metalness: 0 }));
    m.rotation.x = -PI / 2; m.position.set(0, 0.022, (DAT.z1 + DAT.z2) / 2); m.receiveShadow = true; scene.add(m);
    (c.nenCu || []).forEach(o2 => { o2.visible = false; });
  })();

  // ---- bụi cỏ, hoa dại, đá cuội: mỗi loại một InstancedMesh
  const mt = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s3 = new THREE.Vector3(), mau = new THREE.Color();
  function rai(geo, mat, n, dat1, bong) {
    const im = new THREE.InstancedMesh(geo, mat, n); let k = 0, thu = 0;
    while (k < n && thu++ < n * 30) { const r = dat1(k); if (!r) continue; e.set(r.rx || 0, r.ry || 0, r.rz || 0); q.setFromEuler(e); v.set(r.x, r.y, r.z); s3.set(r.sx, r.sy, r.sz); mt.compose(v, q, s3); im.setMatrixAt(k, mt); im.setColorAt(k, mau.set(r.c)); k++; }
    im.count = k; im.castShadow = !!bong; im.receiveShadow = false; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; scene.add(im); return k;
  }
  const trang = () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0 });
  let cum = null;
  const cho = (x, z) => z < -0.9 && z > -16.6 && Math.abs(x) < 22.4 && !trenLoi(x, z, 0.22);
  dem.co = rai(new THREE.ConeGeometry(0.034, 0.17, 4), trang(), nhe ? 420 : 1100, i => {
    if (i % 3 === 0 || !cum) { const x = kg(-22, 22), z = kg(-16.5, -1); if (!cho(x, z)) { cum = null; return null; } cum = { x, z }; }
    const s = kg(0.6, 1.25); return { x: cum.x + kg(-0.1, 0.1), y: 0.02 + 0.085 * s, z: cum.z + kg(-0.14, 0.14), rx: kg(-0.25, 0.25), ry: rnd() * PI, rz: kg(-0.25, 0.25), sx: s, sy: s, sz: s, c: [0x6fa257, 0x86bb63, 0x9bcb72, 0x5f9450][Math.floor(rnd() * 4)] };
  });
  dem.hoa = rai(new THREE.SphereGeometry(0.05, 6, 5), trang(), nhe ? 60 : 170, () => {
    const x = kg(-22, 22), z = kg(-16.5, -1.6); if (!cho(x, z) || trenLoi(x, z, 0.5)) return null;
    const s = kg(0.7, 1.2); return { x, y: kg(0.1, 0.2), z, sx: s, sy: s * 0.7, sz: s, c: [0xffe27a, 0xffffff, 0xf7a8c4, 0xb79ae8, 0xffb35c][Math.floor(rnd() * 5)] };
  });
  dem.da = rai(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true }), nhe ? 14 : 30, i => {
    const sat = i % 2 === 0, x = kg(-21.5, 21.5), z = sat ? kg(-1.5, -0.45) : kg(-16.2, -1.6);
    if (trenLoi(x, z, 0.5) || ganNoi(x, z, 1.5) || !diDuoc(x, z) || Math.abs(x) < 2.2 && z > -2.5) return null;
    const s = kg(0.1, sat ? 0.3 : 0.2); return { x, y: s * 0.35, z, ry: rnd() * PI, sx: s * kg(1, 1.5), sy: s * 0.62, sz: s, c: [0xb9b3a6, 0xc9c1b0, 0xa7a295, 0xd3c9b3][Math.floor(rnd() * 4)] };
  }, true);

  // ---- hàng rào tre: cọc là một InstancedMesh, thanh ngang là trụ dài
  const coc = [];
  function raoTre(x1, z1, x2, z2, ho) {
    const dai = Math.hypot(x2 - x1, z2 - z1), n = Math.max(2, Math.round(dai / 0.5)), gx = (x2 - x1) / dai, gz = (z2 - z1) / dai;
    for (let i = 0; i <= n; i++) { const t = i / n * dai; if (ho && Math.abs(t - ho[0]) < ho[1]) continue; coc.push([x1 + gx * t, z1 + gz * t, kg(0.62, 0.74)]); }
    const doan = ho ? [[0, ho[0] - ho[1]], [ho[0] + ho[1], dai]] : [[0, dai]];
    doan.forEach(([a, b]) => { if (b - a < 0.3) return; [0.22, 0.5].forEach(y => { const m = khoi(tru(0.022, 0.022, b - a, 5), M(0xc8b06a), x1 + gx * (a + b) / 2, y, z1 + gz * (a + b) / 2); m.rotation.z = PI / 2; m.rotation.y = -Math.atan2(gz, gx); m.castShadow = false; }); });
  }
  // luống rau cạnh lối chính, có rào ba mặt và lối vào
  raoTre(2.3, -12.6, 5.6, -12.6); raoTre(5.6, -12.6, 5.6, -8.9); raoTre(5.6, -8.9, 2.3, -8.9, [1.6, 0.55]); raoTre(2.3, -8.9, 2.3, -12.6);
  raoTre(-21.2, -15.9, -14.6, -15.9); raoTre(14.2, -15.9, 21.2, -15.9); raoTre(17.2, -7.0, 21.2, -7.0);
  dem.rao = rai(tru(0.03, 0.036, 1, 6), trang(), coc.length, i => { const p = coc[i]; return { x: p[0], y: p[2] / 2, z: p[1], rx: kg(-0.05, 0.05), rz: kg(-0.05, 0.05), sx: 1, sy: p[2], sz: 1, c: i % 3 ? 0xc8b06a : 0xb79c58 }; }, true);
  [[2.1, -12.8, 5.8, -12.4], [5.4, -12.8, 5.8, -8.7], [2.1, -12.8, 2.5, -8.7], [2.1, -9.1, 3.2, -8.7], [4.6, -9.1, 5.8, -8.7]].forEach(r => c.chanHop(r[0], r[1], r[2], r[3], true));
  [[3.1, -11.6], [4.75, -11.6], [3.1, -10.0]].forEach(([x, z], bi) => {
    khoi(hop(1.1, 0.18, 1.3), M(0x7a5638), x, 0.09, z); const d = khoi(hop(0.98, 0.04, 1.18), M(0x5c4030), x, 0.19, z); d.castShadow = false;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) {
      const bi2 = bi === 1 && (i + j) % 4 === 0, m = khoi(cau(bi2 ? 0.11 : 0.085, 7, 5), M(bi2 ? 0xe8842c : (i + j + bi) % 2 ? 0x5fa055 : 0x86bf66), x - 0.32 + i * 0.32, bi2 ? 0.28 : 0.27, z - 0.45 + j * 0.3); m.scale.y = bi2 ? 0.8 : 1.25; m.castShadow = false;
    }
  });
  dem.vat += 3;

  // ---- lu nước, đống củi, thúng trái cây, bụi chuối
  function lu(x, z, s = 1) {
    const g = nhom(x, 0, z); g.scale.setScalar(s);
    const th = khoi(cau(0.36, 14, 10), M(0x8a4b2f, { roughness: 0.55 }), 0, 0.36, 0, g); th.scale.y = 1.05;
    khoi(tru(0.25, 0.27, 0.07, 14), M(0x74391f, { roughness: 0.55 }), 0, 0.71, 0, g);
    const n = khoi(new THREE.CircleGeometry(0.22, 14), M(0x3f7d86, { roughness: 0.25 }), 0, 0.735, 0, g); n.rotation.x = -PI / 2; n.castShadow = false;
    chan(x, z, 0.38 * s); dem.vat++;
  }
  lu(4.9, -9.6, 1); lu(-17.4, -5.4, 1.1); lu(-16.6, -5.7, 0.8); lu(18.6, -8.0, 1);
  function cui(x, z, ry) {
    const g = nhom(x, 0, z); g.rotation.y = ry; const go = [M(0x8a5a34), M(0x9c6b3f), M(0x7a4d2b)];
    [[-0.2, 0.1], [0, 0.1], [0.2, 0.1], [-0.1, 0.27], [0.1, 0.27], [0, 0.44]].forEach(([dx, y], i) => { const m = khoi(tru(0.095, 0.095, 0.95, 7), go[i % 3], dx, y, 0, g); m.rotation.x = PI / 2; });
    chan(x, z, 0.5); dem.vat++;
  }
  cui(-4.9, -10.9, 0.5); cui(19.4, -9.2, -0.4);
  function thung(x, z, trai, n = 6) {
    const g = nhom(x, 0, z); khoi(tru(0.3, 0.23, 0.26, 12), M(0xc9a76a), 0, 0.13, 0, g);
    for (let i = 0; i < n; i++) { const a = i * 2.4, r = i ? 0.15 : 0; const m = khoi(cau(0.085, 7, 5), M(trai), Math.cos(a) * r, 0.29 + (i ? 0 : 0.06), Math.sin(a) * r, g); m.castShadow = false; }
    chan(x, z, 0.32); dem.vat++;
  }
  thung(-2.2, -1.25, 0xf2c14e); thung(-2.95, -1.0, 0xd9486e); thung(-2.55, -1.95, 0x7fae4a, 5);
  function chuoi(x, z, s = 1, ry = 0) {
    const g = nhom(x, 0, z); g.scale.setScalar(s); g.rotation.y = ry;
    khoi(tru(0.11, 0.15, 1.5, 8), M(0x9fb86a), 0, 0.75, 0, g);
    for (let i = 0; i < 6; i++) { const tay = nhom(0, 1.45, 0, g); tay.rotation.y = i * PI / 3 + 0.3; const l = khoi(cau(1, 8, 5), M(i % 2 ? 0x5fa055 : 0x78b85c), 0.62, 0.12 - (i % 3) * 0.1, 0, tay); l.scale.set(0.72, 0.045, 0.24); l.rotation.z = 0.5 - (i % 3) * 0.32; }
    const buong = khoi(cau(0.13, 7, 6), M(0xd9c24a), 0.2, 1.05, 0.1, g); buong.scale.y = 1.6;
    chan(x, z, 0.22 * s); dem.vat++;
  }
  chuoi(-15.6, -6.6, 1.1, 0.4); chuoi(-14.4, -7.0, 0.9, 2.1); chuoi(18.9, -3.9, 1.05, 1.0); chuoi(-5.2, -12.2, 1.0, 3.0); chuoi(20.4, -8.6, 0.9, 4.0);

  // ---- bếp lửa có khói, nồi đất treo trên ba cây chụm đầu
  (function bep() {
    const x = -3.4, z = -9.6, g = nhom(x, 0, z);
    for (let i = 0; i < 7; i++) { const a = i * PI * 2 / 7; const d = khoi(cau(0.13, 7, 5), M(i % 2 ? 0xb9b3a6 : 0xa39d90, { flatShading: true }), Math.cos(a) * 0.42, 0.08, Math.sin(a) * 0.42, g); d.scale.y = 0.7; }
    for (let i = 0; i < 3; i++) { const a = i * PI * 2 / 3 + 0.4; const m = khoi(tru(0.025, 0.03, 1.25, 5), M(0x6e4a2b), Math.cos(a) * 0.3, 0.56, Math.sin(a) * 0.3, g); m.rotation.z = Math.cos(a) * 0.5; m.rotation.x = -Math.sin(a) * 0.5; }
    const noi2 = khoi(cau(0.19, 12, 8), M(0x4a3526, { roughness: 0.6 }), 0, 0.5, 0, g); noi2.scale.y = 0.85;
    const lua = khoi(new THREE.ConeGeometry(0.16, 0.36, 7), M(0xffb347, { emissive: 0xff7a1a, emissiveIntensity: 1.2 }), 0, 0.2, 0, g); lua.castShadow = false;
    const km = new THREE.MeshBasicMaterial({ color: 0xf2ece0, transparent: true, opacity: 0.35, depthWrite: false }), puff = [];
    for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(cau(0.16, 8, 6), km.clone()); p.position.set(0, 0.9 + i * 0.5, 0); g.add(p); puff.push(p); }
    if (!giam) dong.push(t => {
      lua.scale.set(1 + Math.sin(t * 11) * 0.12, 1 + Math.sin(t * 13.7 + 1) * 0.2, 1 + Math.cos(t * 9.3) * 0.12);
      puff.forEach((p, i) => { const u = ((t * 0.28 + i / 4) % 1); p.position.set(Math.sin(t * 0.7 + i) * 0.12 + u * 0.5, 0.8 + u * 2.4, u * 0.2); p.scale.setScalar(0.6 + u * 1.5); p.material.opacity = 0.4 * (1 - u); });
    });
    chan(x, z, 0.62); dem.vat++;
  })();

  // ---- dây phơi: hai cọc, một sợi dây, mấy tấm vải bay nhẹ
  (function phoi() {
    const z = -5.6, x1 = 14.4, x2 = 17.6;
    [x1, x2].forEach(x => { khoi(tru(0.04, 0.05, 1.9, 6), M(0x8a5a34), x, 0.95, z); chan(x, z, 0.14); });
    const d = khoi(tru(0.012, 0.012, x2 - x1, 4), M(0xe8d6a8), (x1 + x2) / 2, 1.78, z); d.rotation.z = PI / 2; d.castShadow = false;
    [0xd9483b, 0xfaf3e3, 0x1f8a8a, 0xfda127, 0x5b8fd9].forEach((mau2, i) => {
      const tr = nhom(x1 + 0.45 + i * 0.58, 1.78, z), v2 = khoi(hop(0.44, 0.62, 0.015), M(mau2, { side: THREE.DoubleSide }), 0, -0.32, 0, tr);
      v2.scale.y = i % 2 ? 0.8 : 1; if (!giam) dong.push(t => { tr.rotation.x = Math.sin(t * 1.6 + i * 0.9) * 0.16; });
    });
    dem.vat++;
  })();

  // ---- gà trên sân (đi quanh, mổ thóc) và vịt dưới sông (bơi theo đàn)
  function ga(hx, hz, i, trong) {
    const g = nhom(hx, 0, hz), than = trong ? 0xfaf3e3 : i % 2 ? 0xc9793a : 0x8a4b2f;
    const b = khoi(cau(0.15, 9, 7), M(than), 0, 0.2, 0, g); b.scale.set(0.85, 0.9, 1.2);
    const dau = nhom(0, 0.33, 0.14, g); khoi(cau(0.075, 8, 6), M(than), 0, 0, 0, dau);
    const mo = khoi(new THREE.ConeGeometry(0.025, 0.07, 5), M(0xf2a23a), 0, -0.005, 0.09, dau); mo.rotation.x = PI / 2; mo.castShadow = false;
    const mao = khoi(cau(0.03, 6, 5), M(0xd9483b), 0, 0.075, 0.01, dau); mao.scale.set(0.5, 1, 1.3); mao.castShadow = false;
    const duoi = khoi(new THREE.ConeGeometry(0.07, 0.18, 5), M(than), 0, 0.3, -0.19, g); duoi.rotation.x = -0.9;
    [-0.05, 0.05].forEach(dx => { const ch = khoi(tru(0.012, 0.012, 0.1, 4), M(0xf2a23a), dx, 0.05, 0, g); ch.castShadow = false; });
    return { g, dau };
  }
  [[-4.2, -8.9], [-2.6, -10.7], [-4.6, -9.9], [3.9, -9.4], [16.2, -4.4]].slice(0, nhe ? 3 : 5).forEach(([hx, hz], i) => {
    const k = ga(hx, hz, i, i === 2), r = 0.55 + (i % 3) * 0.18, w = 0.32 + i * 0.05; k.g.rotation.y = i * 1.3; dem.ga++;
    if (giam) return;
    dong.push(t => {
      const a = t * w + i * 2.1, x = hx + Math.cos(a) * r + Math.sin(a * 2.3) * 0.15, z = hz + Math.sin(a * 1.3) * r * 0.7;
      const dx = x - k.g.position.x, dz = z - k.g.position.z; if (dx * dx + dz * dz > 1e-7) k.g.rotation.y = Math.atan2(dx, dz);
      k.g.position.set(x, Math.abs(Math.sin(t * 7 + i)) * 0.015, z);
      const mo2 = Math.max(0, Math.sin(t * 1.1 + i * 1.7) - 0.55) * 2.2; k.dau.position.y = 0.33 - mo2 * 0.22; k.dau.position.z = 0.14 + mo2 * 0.06; k.dau.rotation.x = mo2 * 1.1;
    });
  });
  [[9.5, 3.4], [10.3, 3.9], [11.2, 3.5], [-11.5, 4.2]].slice(0, nhe ? 2 : 4).forEach(([hx, hz], i) => {
    const g = nhom(hx, NUOC_Y + 0.07, hz), b = khoi(cau(0.17, 9, 7), M(i ? 0xfaf3e3 : 0xe9d8a6), 0, 0.03, 0, g); b.scale.set(0.8, 0.6, 1.25); b.castShadow = false;
    khoi(cau(0.08, 8, 6), M(i ? 0xfaf3e3 : 0xe9d8a6), 0, 0.2, 0.14, g).castShadow = false;
    const mo = khoi(hop(0.05, 0.02, 0.09), M(0xf2a23a), 0, 0.185, 0.24, g); mo.castShadow = false; dem.vit++;
    if (!giam) dong.push(t => { const a = t * 0.16 + i * 0.5; g.position.set(hx + Math.cos(a) * 1.6, NUOC_Y + 0.07 + Math.sin(t * 1.9 + i) * 0.012, hz + Math.sin(a) * 0.7); g.rotation.y = -a + (hx > 0 ? 0 : PI); });
  });

  return dem;
}
