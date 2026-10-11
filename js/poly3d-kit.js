/* BizOn – Bộ khối dựng cảnh 3D low-poly dùng chung (Hộ Chiếu Sầu Riêng).
 * Tất cả hình khối cơ bản (cầu/trụ/hộp/nón), không cần model .glb ngoài —
 * nhẹ, tải nhanh, khớp phong cách tham khảo (ảnh game dựng trên Grok).
 * Dùng: import { P3 } from '../js/poly3d-kit.js'; P3.tree(THREE, opts) …
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
export const P3 = {
  // ---------- Camera xoay/zoom bằng kéo/chạm — cùng cơ chế js/three-d-stage.js ----------
  orbitCamera(THREE, renderer, camera, opts = {}) {
    let theta = opts.theta ?? Math.PI * 0.22;
    let phi = opts.phi ?? Math.PI * 0.3;
    let radius = opts.radius ?? 16;
    const target = opts.target || new THREE.Vector3(0, 1, 0);
    const minPhi = opts.minPhi ?? Math.PI * 0.12, maxPhi = opts.maxPhi ?? Math.PI * 0.49;
    const minR = opts.minRadius ?? radius * 0.35, maxR = opts.maxRadius ?? radius * 1.8;
    function update() {
      const s = Math.sin(phi);
      camera.position.set(
        target.x + radius * s * Math.sin(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * s * Math.cos(theta)
      );
      camera.lookAt(target);
    }
    update();
    let dragging = false, lastX = 0, lastY = 0, idle = 0;
    let autorotate = opts.autorotate !== false;
    const el = renderer.domElement;
    const onDown = e => { dragging = true; lastX = e.clientX; lastY = e.clientY; autorotate = false; };
    const onMove = e => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      theta -= dx * 0.007;
      phi = Math.min(maxPhi, Math.max(minPhi, phi - dy * 0.007));
      idle = 0; update();
    };
    const onUp = () => dragging = false;
    const onWheel = e => { e.preventDefault(); radius = Math.min(maxR, Math.max(minR, radius + e.deltaY * 0.01)); update(); };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    function tick(dt) {
      idle += dt;
      if (autorotate && idle > 0) { theta += dt * 0.12; update(); }
    }
    function dispose() {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('wheel', onWheel);
    }
    return { tick, dispose, update, setAutorotate: v => autorotate = v };
  },

  // ---------- Ánh sáng chuẩn (nắng + hemisphere + fill) ----------
  lights(THREE, scene) {
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6b8f5a, 0.85));
    const sun = new THREE.DirectionalLight(0xfff2d6, 1.15);
    sun.position.set(8, 14, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -14; sun.shadow.camera.right = 14;
    sun.shadow.camera.top = 14; sun.shadow.camera.bottom = -14;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 40;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xbfe6ec, 0.3);
    fill.position.set(-6, 5, -4);
    scene.add(fill);
    return { sun, fill };
  },

  // ---------- Nền đất tròn (cỏ + đất) ----------
  ground(THREE, { grassColor = 0x8fbf6e, soilColor = 0xc9a46a, radius = 16, soilRadius = 9 } = {}) {
    const g = new THREE.Group();
    const grass = new THREE.Mesh(new THREE.CircleGeometry(radius, 48), new THREE.MeshStandardMaterial({ color: grassColor, roughness: 1 }));
    grass.rotation.x = -Math.PI / 2; grass.receiveShadow = true; g.add(grass);
    if (soilRadius > 0) {
      const soil = new THREE.Mesh(new THREE.CircleGeometry(soilRadius, 40), new THREE.MeshStandardMaterial({ color: soilColor, roughness: 1 }));
      soil.rotation.x = -Math.PI / 2; soil.position.y = 0.01; soil.receiveShadow = true; g.add(soil);
    }
    return g;
  },

  // ---------- Cây sầu riêng (tán cầu nhiều khối + thân trụ + trái vàng) ----------
  durianTree(THREE, { scale = 0.8, leafColor = 0x3f7d3a } = {}) {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.85, flatShading: true });
    const fruitMat = new THREE.MeshStandardMaterial({ color: 0xcdb24a, roughness: 0.6, flatShading: true });
    const g = new THREE.Group();
    const trunkH = 1.1 * scale;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * scale, 0.16 * scale, trunkH, 8), trunkMat);
    trunk.position.y = trunkH / 2; trunk.castShadow = true; g.add(trunk);
    const canopyY = trunkH + 0.55 * scale;
    const blobs = [
      { r: 0.95, dx: 0, dz: 0, dy: 0 }, { r: 0.62, dx: 0.55, dz: 0.2, dy: 0.15 },
      { r: 0.58, dx: -0.5, dz: -0.25, dy: 0.1 }, { r: 0.5, dx: 0.1, dz: 0.55, dy: -0.1 },
      { r: 0.48, dx: -0.3, dz: 0.4, dy: 0.2 },
    ];
    blobs.forEach(b => {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(b.r * scale, 1), leafMat);
      m.position.set(b.dx * scale, canopyY + b.dy * scale, b.dz * scale);
      m.castShadow = true; g.add(m);
    });
    const fruitCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < fruitCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const rad = 0.55 * scale + Math.random() * 0.3 * scale;
      const fruit = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11 * scale, 0), fruitMat);
      fruit.position.set(Math.cos(a) * rad, canopyY - 0.3 * scale - Math.random() * 0.3 * scale, Math.sin(a) * rad);
      fruit.castShadow = true; g.add(fruit);
    }
    return g;
  },

  // ---------- Nhân vật low-poly (thân trụ + đầu cầu + nón/mũ tuỳ chọn) ----------
  character(THREE, opts = {}) {
    const { shirt = 0x5b7fae, pants = 0x3b3b3b, skin = 0xe8b98a, hat = 'nón', hatColor = 0xe7d6a3, basket = false } = opts;
    const g = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.8 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.9 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: pants, roughness: 0.9 });

    const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.5, 8), pantsMat);
    legs.position.y = 0.25; legs.castShadow = true; g.add(legs);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.55, 8), shirtMat);
    body.position.y = 0.78; body.castShadow = true; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), skinMat);
    head.position.y = 1.16; head.castShadow = true; g.add(head);

    if (hat === 'nón') {
      const hatMat = new THREE.MeshStandardMaterial({ color: hatColor, roughness: 0.95 });
      const h = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.16, 16), hatMat);
      h.position.y = 1.28; h.castShadow = true; g.add(h);
    } else if (hat === 'mũ cứng') {
      const hatMat = new THREE.MeshStandardMaterial({ color: hatColor, roughness: 0.5 });
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI / 1.8), hatMat);
      h.position.y = 1.24; h.castShadow = true; g.add(h);
    }

    if (basket) {
      const basketMat = new THREE.MeshStandardMaterial({ color: 0x9a7033, roughness: 0.9, side: THREE.DoubleSide });
      const fruitMat = new THREE.MeshStandardMaterial({ color: 0xcdb24a, roughness: 0.6, flatShading: true });
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.2, 10, 1, true), basketMat);
      b.position.set(0.28, 0.75, 0.12); b.rotation.z = -0.15; b.castShadow = true; g.add(b);
      for (let i = 0; i < 4; i++) {
        const f = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06, 0), fruitMat);
        f.position.set(0.28 + (Math.random() - 0.5) * 0.15, 0.86 + Math.random() * 0.05, 0.12 + (Math.random() - 0.5) * 0.15);
        f.castShadow = true; g.add(f);
      }
    }
    return g;
  },

  // ---------- Nhà/kho low-poly (hộp + mái) ----------
  building(THREE, opts = {}) {
    const { w = 2.2, d = 1.8, h = 1.4, wallColor = 0xf0ece0, roofColor = 0xb5523a, roofType = 'gable', doorColor = 0x2b2b2b } = opts;
    const g = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.9 });
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    wall.position.y = h / 2; wall.castShadow = true; wall.receiveShadow = true; g.add(wall);

    const door = new THREE.Mesh(new THREE.BoxGeometry(w * 0.26, h * 0.6, 0.05), new THREE.MeshStandardMaterial({ color: doorColor, roughness: 0.7 }));
    door.position.set(0, h * 0.3, d / 2 + 0.03); g.add(door);

    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.8 });
    if (roofType === 'gable') {
      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, h * 0.55, 4), roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = h + (h * 0.55) / 2 - 0.02;
      roof.castShadow = true; g.add(roof);
    } else {
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 1.08, h * 0.12, d * 1.08), roofMat);
      roof.position.y = h + h * 0.06; roof.castShadow = true; g.add(roof);
    }
    return g;
  },

  // ---------- Thùng/container hàng hóa ----------
  crate(THREE, { size = 0.5, color = 0xcf7a3a } = {}) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), new THREE.MeshStandardMaterial({ color, roughness: 0.8 }));
    m.castShadow = true; m.receiveShadow = true;
    return m;
  },

  // ---------- Đường / lối đi (dải chữ nhật phẳng) ----------
  road(THREE, { length = 10, width = 1.6, color = 0xd8c9a6 } = {}) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(width, length), new THREE.MeshStandardMaterial({ color, roughness: 1 }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.015; m.receiveShadow = true;
    return m;
  },
};
