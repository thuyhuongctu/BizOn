/* BizOn – Phòng Hội đồng 3D cho Phòng luyện pitch gọi vốn (đặc tả 010, PR 3).
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Cùng cách dựng với sa bàn văn phòng (js/van-phong-doi-3d.js): nhân vật là ẢNH GỐC của game dựng đứng, luôn quay về
 * máy quay, không dựng mô hình mới. Ba thành viên Hội đồng ngồi sau bàn dài, Lumina đứng bên trái giữ giờ.
 * Người đang hỏi: đèn chiếu, vòng sáng dưới ghế, lớn hơn một chút; hai người còn lại mờ đi.
 * three.js (~670 KB) chỉ nạp khi đội vào phần hỏi đáp ở chế độ 3D (napThree). Máy không có WebGL hoặc nạp hỏng thì
 * trang dùng bản phẳng (Câu chuyện 1), không báo lỗi.
 * prefers-reduced-motion: máy quay đứng yên, nhân vật không nhún; chỉ vẽ lại khi đổi người hỏi.
 * Chỉ vẽ khi khung đang hiện trên màn hình và thẻ trình duyệt đang mở.
 * Dùng: PitchPhong3D.mount(canvas, { hoiDong, lumina, lang }) → { hoi(id), ngonNgu(l), trangThai(), dispose() } */
(function (root) {
  'use strict';

  /** Có WebGL không (không tạo renderer, chỉ thử lấy ngữ cảnh). */
  function hoTro() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  /** Máy yếu: bật sẵn bản phẳng (người dùng vẫn bật 3D được). */
  function mayYeu() {
    const n = navigator, c = n.connection || {};
    return !!(c.saveData || (n.deviceMemory && n.deviceMemory < 4) || (n.hardwareConcurrency && n.hardwareConcurrency <= 2));
  }

  let dangNap = null;
  /** Nạp three.min.js một lần; trả Promise. */
  function napThree(src) {
    if (root.THREE) return Promise.resolve(root.THREE);
    if (dangNap) return dangNap;
    dangNap = new Promise((ok, hong) => {
      const s = document.createElement('script'); s.src = src; s.async = true;
      s.onload = () => (root.THREE ? ok(root.THREE) : hong(new Error('three.js không có THREE')));
      s.onerror = () => { dangNap = null; hong(new Error('Không nạp được three.js')); };
      document.head.appendChild(s);
    });
    return dangNap;
  }

  function mount(canvas, opts) {
    const THREE = root.THREE; if (!THREE) throw new Error('Thiếu three.js');
    const hd = opts.hoiDong, lumina = opts.lumina;
    let lang = opts.lang === 'en' ? 'en' : 'vi';
    const tinh = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xEFE6D6);
    const cam = new THREE.PerspectiveCamera(34, 1, 0.5, 120);
    scene.add(new THREE.HemisphereLight(0xFFF7EA, 0xB9A98F, 1.25));
    const nang = new THREE.DirectionalLight(0xFFFFFF, 0.9); nang.position.set(4, 12, 10); scene.add(nang);

    // Sàn, tường, biển «Hội đồng đầu tư»
    const san = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshLambertMaterial({ color: 0xD9C7A8 }));
    san.rotation.x = -Math.PI / 2; scene.add(san);
    const tuong = new THREE.Mesh(new THREE.PlaneGeometry(60, 18), new THREE.MeshLambertMaterial({ color: 0xF4ECDD }));
    tuong.position.set(0, 9, -6); scene.add(tuong);
    const bienTex = { vi: null, en: null };
    function veBien(l) {
      if (bienTex[l]) return bienTex[l];
      const c = document.createElement('canvas'); c.width = 1024; c.height = 160; const g = c.getContext('2d');
      g.fillStyle = '#8C2F39'; g.fillRect(0, 0, 1024, 160);
      g.fillStyle = '#C9A24A'; g.fillRect(0, 148, 1024, 12);
      g.fillStyle = '#FBF9F4'; g.font = '800 64px "Plus Jakarta Sans", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(l === 'en' ? 'INVESTMENT BOARD' : 'HỘI ĐỒNG ĐẦU TƯ', 512, 78, 960);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; bienTex[l] = t; return t;
    }
    const bien = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.9), new THREE.MeshBasicMaterial({ map: veBien(lang) }));
    bien.position.set(0, 8.4, -5.9); scene.add(bien);

    // Bàn dài và ghế
    const go = new THREE.MeshLambertMaterial({ color: 0x7B5B3E });
    const matBan = new THREE.Mesh(new THREE.BoxGeometry(15, 0.4, 3), go); matBan.position.set(0, 2.2, 0); scene.add(matBan);
    const yem = new THREE.Mesh(new THREE.BoxGeometry(15, 2, 0.2), new THREE.MeshLambertMaterial({ color: 0x8C2F39 })); yem.position.set(0, 1.1, 1.45); scene.add(yem);

    const loader = new THREE.TextureLoader();
    let daTai = 0, tong = 0, hoiId = null, khung = 0;
    const thanhVien = [];
    function anh(url, cao, xong) {
      tong++;
      const mat = new THREE.SpriteMaterial({ transparent: true, alphaTest: 0.05, color: 0xFFFFFF });
      const sp = new THREE.Sprite(mat); sp.scale.set(cao * 0.5, cao, 1);
      loader.load(url, t => {
        t.colorSpace = THREE.SRGBColorSpace; mat.map = t; mat.needsUpdate = true;
        const r = t.image && t.image.width ? t.image.width / t.image.height : 0.5; sp.scale.set(cao * r, cao, 1);
        daTai++; if (xong) xong(sp); veLai();
      }, undefined, () => { daTai++; veLai(); });
      return sp;
    }
    function bangTen(h) {
      const c = document.createElement('canvas'); c.width = 512; c.height = 128;
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
      m.userData.ve = (sang) => {
        const g = c.getContext('2d'); g.clearRect(0, 0, 512, 128);
        g.fillStyle = sang ? '#C9A24A' : '#FBF9F4'; g.beginPath(); if (g.roundRect) g.roundRect(4, 4, 504, 120, 28); else g.rect(4, 4, 504, 120); g.fill();
        g.fillStyle = '#1F2A44'; g.font = '800 46px "Plus Jakarta Sans", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(h[lang], 256, 66, 480); t.needsUpdate = true;
      };
      return m;
    }
    const X = [-4.6, 0, 4.6];
    hd.forEach((h, i) => {
      const ghe = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.2, 0.4), new THREE.MeshLambertMaterial({ color: 0x3E5C8A }));
      ghe.position.set(X[i], 2.6, -2.1); scene.add(ghe);
      const vong = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.5, 40), new THREE.MeshBasicMaterial({ color: 0xC9A24A, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
      vong.rotation.x = -Math.PI / 2; vong.position.set(X[i], 0.03, -1.2); vong.visible = false; scene.add(vong);
      const den = new THREE.SpotLight(0xFFF1C9, 0, 30, 0.26, 0.7, 1); den.position.set(X[i], 12, 3); den.target.position.set(X[i], 3.6, -1.1); scene.add(den); scene.add(den.target);
      const quang = new THREE.Mesh(new THREE.CircleGeometry(1.9, 48), new THREE.MeshBasicMaterial({ color: 0xF2C96B, transparent: true, opacity: 0.55 }));
      quang.position.set(X[i], 4.3, -2.32); quang.visible = false; scene.add(quang);
      const sp = anh(h.anh, 5.2); sp.position.set(X[i], 3.1, -1.1); scene.add(sp);
      const ten = bangTen(h); ten.position.set(X[i], 1.25, 1.57); scene.add(ten);
      thanhVien.push({ id: h.id, sp, vong, den, ten, quang, goc: 5.2 });
    });
    if (lumina) { const sp = anh(lumina, 4.2); sp.position.set(-9.6, 2.1, 0.6); scene.add(sp); }

    function hoi(id) {
      hoiId = id;
      thanhVien.forEach(t => {
        const on = t.id === id;
        t.sp.material.color.setHex(on ? 0xFFFFFF : 0x8E8A84);
        t.vong.visible = on; t.quang.visible = on; t.den.intensity = on ? 140 : 0;
        t.ten.userData.ve(on);
      });
      veLai();
    }
    function ngonNgu(l) {
      lang = l === 'en' ? 'en' : 'vi';
      bien.material.map = veBien(lang); bien.material.needsUpdate = true;
      thanhVien.forEach(t => t.ten.userData.ve(t.id === hoiId));
      veLai();
    }

    function coKhung() {
      const w = canvas.clientWidth || 360, h = canvas.clientHeight || 220;
      if (canvas.width !== Math.round(w * renderer.getPixelRatio()) || canvas.height !== Math.round(h * renderer.getPixelRatio())) {
        renderer.setSize(w, h, false); cam.aspect = w / h;
        // lùi máy quay vừa đủ để cả phòng (Lumina ở x = −9,6 đến mép bàn x = 7,5) nằm trong khung ngang ở mọi tỉ lệ màn hình
        const xa = Math.max(19, 11 / (Math.tan(cam.fov * Math.PI / 360) * cam.aspect) + 1);
        cam.position.set(0, 7.2, xa); cam.lookAt(0, 3.2, -1); cam.updateProjectionMatrix();
      }
    }
    let hien = true, chay = true, raf = 0, t0 = performance.now();
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { hien = es[0].isIntersecting; tiep(); }) : null;
    if (io) io.observe(canvas);
    const visib = () => tiep(); document.addEventListener('visibilitychange', visib);
    function ve() {
      raf = 0; if (!chay) return;
      coKhung();
      if (!tinh) {
        const t = (performance.now() - t0) / 1000;
        cam.position.x = Math.sin(t * 0.25) * 1.2; cam.lookAt(0, 3.2, -1);
        thanhVien.forEach(m => { const on = m.id === hoiId, s = on ? 1.08 + Math.sin(t * 2.2) * 0.015 : 1; const r = m.sp.scale.x / m.sp.scale.y; m.sp.scale.set(m.goc * s * r, m.goc * s, 1); });
      } else thanhVien.forEach(m => { const on = m.id === hoiId, s = on ? 1.08 : 1; const r = m.sp.scale.x / m.sp.scale.y; m.sp.scale.set(m.goc * s * r, m.goc * s, 1); });
      renderer.render(scene, cam); khung++;
      if (!tinh) tiep();
    }
    function tiep() { if (!raf && chay && hien && !document.hidden) raf = requestAnimationFrame(ve); }
    function veLai() { tiep(); }
    tiep();

    return {
      hoi, ngonNgu,
      trangThai: () => ({ hoi: hoiId, sanSang: tong > 0 && daTai >= tong, khung, nhanVat: thanhVien.length, tinh }),
      dispose() {
        chay = false; if (raf) cancelAnimationFrame(raf); if (io) io.disconnect();
        document.removeEventListener('visibilitychange', visib);
        scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
        renderer.dispose();
      },
    };
  }

  root.PitchPhong3D = { hoTro, mayYeu, napThree, mount };
})(typeof self !== 'undefined' ? self : this);
