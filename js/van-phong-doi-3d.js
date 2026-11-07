/* BizOn — Sa bàn văn phòng 3D cho trang «Văn phòng của đội» (van-phong-doi.html).
 * Nhìn từ trên xuống: năm nhân vật và hai cố vấn, mỗi người một phòng, các phòng nối về trạm Lumina ở giữa bằng lối đi có đường sáng,
 * chấm sáng chạy dọc lối đi cho thấy việc đang chuyển giữa các phòng.
 * Nhân vật là ẢNH GỐC trong game (assets/character/solid/*-tex.webp) dựng đứng, luôn quay về máy quay; không dựng mô hình mới.
 * Cần js/vendor/three.min.js (THREE toàn cục). Dùng: BizOnVanPhong.mount(canvas, { onPick(id) {} }) → { dispose() }.
 * Bấm vào một phòng gọi onPick(id). Kéo ngang để xoay. prefers-reduced-motion: đứng yên, không tự xoay, chấm sáng không chạy.
 * Chỉ vẽ khi canvas đang trong khung nhìn và thẻ đang mở. */
(function () {
  'use strict';
  const IMG = id => 'assets/character/solid/' + id + '.webp';
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'vi');

  // Toạ độ (x, z) trên sàn; w × d là cỡ phòng. mau: màu sàn phòng (bộ màu đất sét), sang: màu viền sáng.
  const PHONG = [
    { id: 'lumina', giua: true, do: 'vong', x: 0, z: 0, w: 6, d: 6, mau: 0xF3E6CF, sang: 0x7FD3DC, anh: 'lumina-tex', tl: 218 / 720,
      ten: { vi: 'Trạm Lumina', en: 'Lumina hub' }, vai: { vi: 'Cố vấn học tập', en: 'Learning advisor' } },
    { id: 'ceo', do: 'ban-tron', x: -10, z: -7, w: 7, d: 5.5, mau: 0xD9F0F2, sang: 0x7FD3DC, anh: 'ceo-tex', tl: 263 / 720,
      ten: { vi: 'Phòng chiến lược', en: 'Strategy room' }, vai: { vi: 'CEO Minh Long', en: 'CEO Minh Long' } },
    { id: 'cfo', do: 'ket', x: 10, z: -7, w: 7, d: 5.5, mau: 0xFFE6B8, sang: 0xFDA127, anh: 'cfo-tex', tl: 233 / 720,
      ten: { vi: 'Két & sổ sách', en: 'Vault & ledgers' }, vai: { vi: 'CFO Thu Hà', en: 'CFO Thu Hà' } },
    { id: 'cmo', do: 'bang', x: -12, z: 4, w: 6.5, d: 5.5, mau: 0xFDE1CE, sang: 0xE8762D, anh: 'cmo-tex', tl: 336 / 720,
      ten: { vi: 'Studio thị trường', en: 'Market studio' }, vai: { vi: 'CMO Mạnh Chi', en: 'CMO Mạnh Chi' } },
    { id: 'coo', do: 'bang-chuyen', x: 12, z: 4, w: 7.5, d: 5.5, mau: 0xDDF1E4, sang: 0xA9DCC4, anh: 'coo-tex', tl: 245 / 720,
      ten: { vi: 'Xưởng đất sét', en: 'Clay workshop' }, vai: { vi: 'COO Bảo Ngọc', en: 'COO Bảo Ngọc' } },
    { id: 'sec', do: 'tu', x: -5, z: 11, w: 6.5, d: 5, mau: 0xF4E1E6, sang: 0xF4B6C2, anh: 'sec-tex', tl: 257 / 720,
      ten: { vi: 'Văn thư – pháp chế', en: 'Records & compliance' }, vai: { vi: 'Thư ký Gia Hân', en: 'Secretary Gia Hân' } },
    { id: 'thaytu', do: 'bang-trang', cao: 4.3, x: 6, z: 11, w: 7, d: 5, mau: 0xFFF3DA, sang: 0xFFD58A, anh: 'tu-phan-tex-v3', tl: 333 / 720,
      ten: { vi: 'Phòng cố vấn học thuật', en: 'Academic advisor' }, vai: { vi: 'Thầy Tu Phan', en: 'Thầy Tu Phan' } },
  ];
  // Lối đi: từ trạm giữa ra từng phòng, gãy góc một lần (kiểu sơ đồ mạch) cho dễ đọc từ trên xuống.
  const LOI = [
    [[0, -3], [0, -7], [-6.5, -7]], [[0, -3], [0, -7], [6.5, -7]],
    [[-3, 0], [-6, 0], [-6, 4], [-8.75, 4]], [[3, 0], [6, 0], [6, 4], [8.25, 4]],
    [[-1.5, 3], [-1.5, 8.5], [-5, 8.5]], [[1.5, 3], [1.5, 8.5], [6, 8.5]],
  ];

  /* Trang của các game khác truyền danh sách phòng riêng (opts.phong) không kèm toạ độ: phòng đầu có giua: true
   * đặt ở giữa, các phòng còn lại xếp quanh một vòng elip; lối đi tự gãy góc một lần từ mép trạm giữa ra mép phòng. */
  function sapXep(ds) {
    const giua = ds.filter(p => p.giua), quanh = ds.filter(p => !p.giua), n = quanh.length;
    const rx = n > 7 ? 16.5 : 13.5, rz = n > 7 ? 12 : 10;
    giua.forEach(p => Object.assign(p, { x: 0, z: 0, w: p.w || 6, d: p.d || 6 }));
    quanh.forEach((p, i) => {
      const a = -Math.PI / 2 + (i + .5) * 2 * Math.PI / n;
      Object.assign(p, { x: Math.round(Math.cos(a) * rx * 10) / 10, z: Math.round(Math.sin(a) * rz * 10) / 10, w: p.w || 6.4, d: p.d || 5.2 });
    });
    const loi = quanh.map(p => {
      const sx = Math.sign(p.x) || 1, sz = Math.sign(p.z) || 1;
      if (Math.abs(p.x) >= Math.abs(p.z)) {
        if (Math.abs(p.z) <= p.d / 2) return [[sx * 3, 0], [p.x - sx * p.w / 2, 0]];
        return [[sx * 3, 0], [p.x, 0], [p.x, p.z - sz * p.d / 2]];
      }
      if (Math.abs(p.x) <= p.w / 2) return [[0, sz * 3], [0, p.z - sz * p.d / 2]];
      return [[0, sz * 3], [0, p.z], [p.x - sx * p.w / 2, p.z]];
    });
    return loi;
  }

  function nhan(text, sub, hex) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 144;
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(255,251,244,.94)';
    const r = 60; g.beginPath(); g.moveTo(r, 8); g.arcTo(504, 8, 504, 136, r); g.arcTo(504, 136, 8, 136, r); g.arcTo(8, 136, 8, 8, r); g.arcTo(8, 8, 504, 8, r); g.fill();
    g.fillStyle = '#' + hex.toString(16).padStart(6, '0'); g.beginPath(); g.arc(62, 72, 22, 0, 7); g.fill();
    g.fillStyle = '#033337'; g.font = '800 44px "Be Vietnam Pro", system-ui, sans-serif'; g.textBaseline = 'alphabetic';
    g.fillText(text, 100, 68, 390);
    g.fillStyle = '#3E5A5C'; g.font = '600 32px "Be Vietnam Pro", system-ui, sans-serif'; g.fillText(sub, 100, 112, 390);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, alphaTest: .05 }));
    s.scale.set(5.6, 1.58, 1); return s;
  }

  function mount(canvas, opts) {
    opts = opts || {};
    if (!window.THREE) throw new Error('Thiếu three.js');
    const DS = opts.phong ? opts.phong.map(p => Object.assign({}, p)) : PHONG, LO = opts.phong ? sapXep(DS) : LOI;
    // khung sàn và tâm máy quay theo đúng phạm vi các phòng
    const bien = DS.reduce((b, p) => [Math.min(b[0], p.x - p.w / 2), Math.max(b[1], p.x + p.w / 2), Math.min(b[2], p.z - p.d / 2), Math.max(b[3], p.z + p.d / 2)], [0, 0, 0, 0]);
    const tamX = (bien[0] + bien[1]) / 2, tamZ = (bien[2] + bien[3]) / 2, coSan = Math.max(1, (bien[1] - bien[0]) / 31.5, (bien[3] - bien[2]) / 23);
    const tinh = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0B2E33);
    scene.fog = new THREE.Fog(0x0B2E33, 70, 120);
    const cam = new THREE.PerspectiveCamera(30, 1, 1, 300);
    scene.add(new THREE.HemisphereLight(0xFFF3DA, 0x0B2E33, 1.1));
    const nang = new THREE.DirectionalLight(0xFFF1DC, 1.6); nang.position.set(-18, 30, 14); scene.add(nang);

    const hinh = [], vatLieu = [], tex = [];
    const giu = (o) => { if (o.geometry) hinh.push(o.geometry); if (o.material) vatLieu.push(o.material); return o; };
    const std = (c, extra) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .85, metalness: 0 }, extra || {})); vatLieu.push(m); return m; };
    const sang = c => { const m = new THREE.MeshBasicMaterial({ color: c }); vatLieu.push(m); return m; };
    const hop = (w, h, d, mat, x, y, z) => { const g = new THREE.BoxGeometry(w, h, d); hinh.push(g); const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); scene.add(m); return m; };
    const tru = (r, h, mat, x, y, z, seg) => { const g = new THREE.CylinderGeometry(r, r, h, seg || 24); hinh.push(g); const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); scene.add(m); return m; };

    // Sàn chung + lưới mờ
    const sanW = Math.max(46, bien[1] - bien[0] + 14), sanD = Math.max(32, bien[3] - bien[2] + 10);
    hop(sanW, .4, sanD, std(0x12393F), tamX, -.21, tamZ);
    const luoi = new THREE.GridHelper(Math.max(sanW, sanD), Math.round(Math.max(sanW, sanD)), 0x1F5560, 0x174750); luoi.position.set(tamX, .001, tamZ); scene.add(luoi); hinh.push(luoi.geometry); vatLieu.push(luoi.material);

    // Lối đi + vạch sáng giữa lối + đường cho chấm sáng chạy
    const duong = [];
    LO.forEach(ds => {
      const pts = ds.map(([x, z]) => new THREE.Vector3(x, .14, z));
      for (let i = 0; i < ds.length - 1; i++) {
        const [x1, z1] = ds[i], [x2, z2] = ds[i + 1], dai = Math.hypot(x2 - x1, z2 - z1), ngang = Math.abs(x2 - x1) > Math.abs(z2 - z1);
        hop(ngang ? dai + 1.6 : 1.6, .12, ngang ? 1.6 : dai + 1.6, std(0x2B5A60), (x1 + x2) / 2, .06, (z1 + z2) / 2);
        hop(ngang ? dai : .12, .02, ngang ? .12 : dai, sang(0x7FD3DC), (x1 + x2) / 2, .13, (z1 + z2) / 2);
      }
      const cong = new THREE.CurvePath(); for (let i = 0; i < pts.length - 1; i++) cong.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
      duong.push(cong);
    });
    const cham = [];
    const chamG = new THREE.SphereGeometry(.22, 12, 8); hinh.push(chamG);
    duong.forEach((c, i) => { for (let k = 0; k < 2; k++) { const m = new THREE.Mesh(chamG, sang(k ? 0xFDA127 : 0xFFF3DA)); scene.add(m); cham.push({ m, c, t: (i * .17 + k * .5) % 1, v: .09 + (i % 3) * .02 }); } });

    // Phòng: nền tôn cao, viền sáng, hai vách thấp phía sau, bảng tên, nhân vật
    const loader = new THREE.TextureLoader();
    const chon = [], nv = [], bang = [];
    DS.forEach(p => {
      const nen = hop(p.w, .5, p.d, std(p.mau), p.x, .25, p.z); nen.userData.phong = p.id; chon.push(nen);
      const v = sang(p.sang), dx = p.w / 2, dz = p.d / 2;
      hop(p.w + .16, .08, .16, v, p.x, .54, p.z - dz); hop(p.w + .16, .08, .16, v, p.x, .54, p.z + dz);
      hop(.16, .08, p.d + .16, v, p.x - dx, .54, p.z); hop(.16, .08, p.d + .16, v, p.x + dx, .54, p.z);
      if (!p.giua) {
        const vach = std(0xFFFBF4);
        hop(p.w, 1.1, .2, vach, p.x, 1.05, p.z - dz + .1); hop(.2, 1.1, p.d, vach, p.x - Math.sign(p.x || 1) * (dx - .1), 1.05, p.z);
        hop(p.w, .06, .24, v, p.x, 1.62, p.z - dz + .1);
      }
      doDac(p);
      // nhân vật: ảnh gốc dựng đứng, chân chạm sàn phòng
      const t = loader.load(p.anh.includes('/') ? p.anh : IMG(p.anh)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; tex.push(t);
      const mat = new THREE.SpriteMaterial({ map: t, transparent: true, alphaTest: .35 }); vatLieu.push(mat);
      const s = new THREE.Sprite(mat); const cao = p.cao || 4.0;
      s.center.set(.5, 0); s.scale.set(cao * p.tl, cao, 1);
      const ox = p.giua ? 0 : -p.w * .18, oz = .6;
      s.position.set(p.x + ox, .5, p.z + oz); s.userData.phong = p.id; scene.add(s); chon.push(s);
      // viền tối mờ quanh người để tách nhân vật khỏi sàn phòng sáng màu (áo dài trắng trên sàn kem)
      const vm = new THREE.SpriteMaterial({ map: t, color: 0x0B2E33, transparent: true, opacity: .5, depthWrite: false }); vatLieu.push(vm);
      const vien = new THREE.Sprite(vm); vien.center.set(.5, .02); vien.scale.set(cao * p.tl * 1.09, cao * 1.05, 1);
      vien.position.copy(s.position); vien.renderOrder = -1; scene.add(vien); s.userData.vien = vien;
      s.userData.co = [cao * p.tl, cao];
      // bóng tròn dưới chân
      const bg = new THREE.CircleGeometry(.7, 24); hinh.push(bg);
      const bm = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .22, depthWrite: false }); vatLieu.push(bm);
      const bong = new THREE.Mesh(bg, bm); bong.rotation.x = -Math.PI / 2; bong.position.set(s.position.x, .51, s.position.z); scene.add(bong);
      const n = nhan(p.ten[lang()], p.vai[lang()], p.sang); n.position.set(p.x, 3.2, p.z - p.d / 2 + .2); scene.add(n); tex.push(n.material.map); vatLieu.push(n.material);
      nv.push({ s, n, p, y0: .5, pha: Math.random() * 6.28 });
    });

    // Đồ đạc từng phòng: hình khối đơn giản, đủ để nhận ra phòng làm gì
    function doDac(p) {
      const x = p.x + p.w * .18, z = p.z, y = .5;
      const k = p.do;
      if (k === 'vong') {
        const vong = new THREE.TorusGeometry(2.1, .07, 8, 64); hinh.push(vong);
        const m = new THREE.Mesh(vong, sang(0x7FD3DC)); m.rotation.x = Math.PI / 2; m.position.set(p.x, y + .05, p.z); scene.add(m); bang.push({ m, xoay: true });
        tru(.9, .5, std(0xFFFBF4), p.x, y + .25, p.z - 1.4);
      } else if (k === 'ban-tron') {
        tru(1.3, .1, std(0xC08A5A), x, y + .9, z, 32); tru(.18, .85, std(0x8A6040), x, y + .43, z);
        tru(1.15, .02, std(0x7FD3DC, { emissive: 0x2F8A8C, emissiveIntensity: .5 }), x, y + .96, z, 32);
        const kim = hop(.12, .04, 1.6, sang(0xE8762D), x, y + .99, z); bang.push({ m: kim, quay: true });
      } else if (k === 'ket') {
        hop(1.4, 1.6, 1.2, std(0x5A6B74, { roughness: .5 }), x + .6, y + .8, z - 1);
        tru(.38, .06, std(0xFDA127), x + .6, y + .9, z - .38).rotation.x = Math.PI / 2;
        for (let i = 0; i < 3; i++) tru(.3, .12 + i * .14, std(0xFDA127, { roughness: .4 }), x - .6 + i * .45, y + (.12 + i * .14) / 2, z + 1, 20);
      } else if (k === 'bang') {
        hop(2.6, 1.6, .12, std(0x24403F), x, y + 1.5, z - 1.6);
        [.5, .9, .65, 1.2].forEach((h, i) => { const c = hop(.34, h, .04, sang(i === 3 ? 0xE8762D : 0xFFD58A), x - .8 + i * .55, y + .8 + h / 2, z - 1.52); bang.push({ m: c, cot: h, y0: y + .8, pha: i }); });
        tru(.05, 1, std(0x24403F), x, y + .5, z - 1.6);
      } else if (k === 'bang-chuyen') {
        hop(4.6, .5, .9, std(0x3E5A5C), x - .2, y + .45, z + 1.1);
        for (let i = 0; i < 4; i++) { const b = hop(.5, .45, .5, std([0xE8762D, 0xFDA127, 0xC2581B, 0xF4B6C2][i]), x - 2 + i * 1.2, y + .92, z + 1.1); bang.push({ m: b, bang: true, x0: x - 2.3, dai: 4.4, t: i / 4 }); }
        hop(.9, 1.6, .9, std(0x7FA88C), x + 1.6, y + .8, z - 1.2);
      } else if (k === 'tu') {
        for (let i = 0; i < 3; i++) hop(.8, 1.5, .7, std(0xB9A890), x + .2 + i * .9, y + .75, z - 1.5);
        hop(1.8, .1, .9, std(0xC08A5A), x + .6, y + .8, z + .6);
      } else if (k === 'bang-trang') {
        hop(2.6, 1.6, .1, std(0xFFFFFF, { roughness: .4 }), x, y + 1.6, z - 1.7);
        hop(2.8, .1, .1, std(0x8A6040), x, y + .78, z - 1.7);
        hop(1.8, .1, 1, std(0xC08A5A), x + .3, y + .8, z + .7);
      } else if (k === 'ghe') {          // ghe hàng trên bến
        hop(3.2, .45, 1.2, std(0x8A6040), x, y + .25, z + .9); hop(3.4, .12, 1.3, std(0xC08A5A), x, y + .5, z + .9);
        for (let i = 0; i < 3; i++) tru(.22, .3, std([0xE8762D, 0xA9DCC4, 0xFDA127][i]), x - .9 + i * .9, y + .7, z + .9, 16);
        tru(.04, 2.2, std(0x8A6040), x + 1.4, y + 1.1, z + .9);
      } else if (k === 'noi') {          // bếp nấu
        hop(1.6, .7, 1, std(0x7A5A44), x, y + .35, z - 1.1); tru(.5, .5, std(0x5A6B74, { roughness: .4 }), x, y + .95, z - 1.1, 20);
        hop(1.6, .1, .9, std(0xC08A5A), x + .4, y + .8, z + .9);
      } else if (k === 'cay') {          // cây trong vườn
        [[-.8, -1.2], [.9, -1.3], [1.6, .9]].forEach(([dx, dz], i) => { tru(.15, 1.1, std(0x7A5A44), x + dx, y + .55, z + dz, 10);
          const g = new THREE.SphereGeometry(.65 + i * .05, 14, 10); hinh.push(g); const c = new THREE.Mesh(g, std(0x5BAA86)); c.position.set(x + dx, y + 1.5, z + dz); scene.add(c); });
      } else if (k === 'hang') {         // kệ hàng, thùng hàng
        hop(2.4, 1.5, .5, std(0xC08A5A), x, y + .75, z - 1.5);
        for (let i = 0; i < 4; i++) hop(.5, .4, .4, std([0xE8762D, 0xA9DCC4, 0xFDA127, 0xF4B6C2][i]), x - .8 + i * .55, y + 1.0 + (i % 2) * .5, z - 1.25);
        hop(.8, .6, .8, std(0xB9A890), x + 1.3, y + .3, z + 1);
      } else {                           // bàn làm việc
        hop(1.8, .1, .9, std(0xC08A5A), x + .4, y + .8, z - .6); hop(.9, .55, .06, std(0x24403F), x + .4, y + 1.15, z - .9);
      }
    }

    // Máy quay: nghiêng nhìn xuống, tự lắc nhẹ; kéo ngang để xoay
    let goc = -.35, keo = null, rong = 1, cao = 1;
    function khung() {
      const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      rong = w; cao = h; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
      // khung dọc: máy quay lùi xa nên phóng bảng tên lên cho còn đọc được
      const k = cam.aspect < 1 ? 1.35 : 1; nv.forEach(o => { o.n.scale.set(5.6 * k, 1.58 * k, 1); o.n.position.y = 2.6 + .8 * k;
        // khung dọc: máy quay lùi xa nên phóng người lên cho dễ nhìn (viền phóng theo)
        const kn = cam.aspect < 1 ? 1.3 : 1, [cw, ch] = o.s.userData.co; o.s.scale.set(cw * kn, ch * kn, 1); o.s.userData.vien.scale.set(cw * kn * 1.09, ch * kn * 1.05, 1); });
    }
    function datMay(t) {
      const a = goc + (tinh || keo ? 0 : Math.sin(t * .00012) * (cam.aspect < 1.2 ? .1 : .28));
      // khung dọc (điện thoại) cần lùi xa hơn để thấy đủ bảy phòng
      const R = 46 * coSan * Math.max(1, 1.32 / Math.min(cam.aspect, 1.32));
      cam.position.set(tamX + Math.sin(a) * R * .62, R * .78, tamZ + Math.cos(a) * R * .62);
      cam.lookAt(tamX, 0, tamZ + .4);
    }
    const ray = new THREE.Raycaster(), chuot = new THREE.Vector2();
    function trung(e) {
      const r = canvas.getBoundingClientRect(); chuot.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(chuot, cam); const h = ray.intersectObjects(chon, false)[0]; return h ? h.object.userData.phong : null;
    }
    const down = e => { keo = { x: e.clientX, g: goc, dx: 0 }; };
    const move = e => {
      if (keo) { keo.dx = e.clientX - keo.x; goc = keo.g - keo.dx / Math.max(rong, 1) * 2.2; }
      else canvas.style.cursor = trung(e) ? 'pointer' : 'grab';
    };
    const up = e => { const k = keo; keo = null; if (k && Math.abs(k.dx) < 6) { const id = trung(e); if (id && opts.onPick) opts.onPick(id); } };
    canvas.addEventListener('pointerdown', down); addEventListener('pointermove', move); addEventListener('pointerup', up);

    // CurvePath.getPointAt trả null khi t sát 1 do làm tròn số thực: kẹp lại và bỏ qua khung ấy
    const datCham = c => { const q = c.c.getPointAt(Math.min(c.t, .999)); if (q) c.m.position.copy(q); };
    // số liệu cho test: đã vẽ bao nhiêu khung, khung cuối có bao nhiêu tam giác
    const thongKe = canvas.__vanPhong = { lanVe: 0, tamGiac: 0 };
    let chay = false, raf = 0, t0 = performance.now(), truoc = t0;
    function ve(t) {
      raf = chay ? requestAnimationFrame(ve) : 0;
      const dt = Math.min(.05, (t - truoc) / 1000); truoc = t;
      if (canvas.clientWidth !== rong || canvas.clientHeight !== cao) khung();
      datMay(t);
      if (!tinh) {
        cham.forEach(c => { c.t = (c.t + c.v * dt) % 1; datCham(c); });
        bang.forEach(b => {
          if (b.xoay) b.m.rotation.z += dt * .4;
          else if (b.quay) b.m.rotation.y += dt * .5;
          else if (b.cot) { const k = .75 + .25 * Math.sin(t * .0015 + b.pha); b.m.scale.y = k; b.m.position.y = b.y0 + b.cot * k / 2; }
          else if (b.bang) { b.t = (b.t + dt * .12) % 1; b.m.position.x = b.x0 + b.t * b.dai; }
        });
        nv.forEach(o => { o.s.position.y = o.y0 + Math.abs(Math.sin(t * .0016 + o.pha)) * .06; o.s.userData.vien.position.y = o.s.position.y; });
      } else cham.forEach(datCham);
      renderer.render(scene, cam); thongKe.lanVe++; thongKe.tamGiac = renderer.info.render.triangles;
    }
    function bat() { if (!chay && !document.hidden) { chay = true; truoc = performance.now(); raf = requestAnimationFrame(ve); } }
    function tat() { chay = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    const io = new IntersectionObserver(es => { es[0].isIntersecting ? bat() : tat(); }, { threshold: .01 }); io.observe(canvas);
    const vis = () => (document.hidden ? tat() : (canvas.getBoundingClientRect().bottom > 0 && bat()));
    document.addEventListener('visibilitychange', vis);
    // đổi ngôn ngữ thì vẽ lại bảng tên
    const mo = new MutationObserver(() => nv.forEach(o => {
      const n = nhan(o.p.ten[lang()], o.p.vai[lang()], o.p.sang); o.n.material.map.dispose(); o.n.material.map = n.material.map; n.material.dispose();
    }));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    khung(); datMay(0); renderer.render(scene, cam);

    return {
      phong: DS.map(p => p.id),
      dispose() {
        tat(); io.disconnect(); mo.disconnect(); document.removeEventListener('visibilitychange', vis);
        canvas.removeEventListener('pointerdown', down); removeEventListener('pointermove', move); removeEventListener('pointerup', up);
        nv.forEach(o => o.n.material.map.dispose());
        hinh.forEach(g => g.dispose()); vatLieu.forEach(m => m.dispose()); tex.forEach(t => t && t.dispose()); renderer.dispose();
      },
    };
  }

  window.BizOnVanPhong = { mount, PHONG: PHONG.map(p => ({ id: p.id, ten: p.ten, vai: p.vai })) };
})();
