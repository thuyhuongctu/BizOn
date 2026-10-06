// Ghe hàng bông Bến Phù Sa – widget 3D xoay nhẹ, nhúng được trong một <div>
// bất kỳ (thẻ sản phẩm trang chủ, trang giới thiệu...). Không phụ thuộc
// custom element <three-d-stage> để portable: tự dựng renderer/scene riêng.
//
// mountGhe(el, opts) -> { update(opts), destroy() }
//   opts.style      'anh' (ảnh tĩnh Hương+Tú, mặc định, nhẹ) | '3d' (model Three.js, xoay được)
//   opts.autorotate true mặc định – tự xoay chầm chậm khi ở chế độ 3d
//   opts.water      true mặc định – có mặt nước phía dưới ghe (chế độ 3d)
//   opts.background màu CSS phía sau cảnh (mặc định transparent)

const PHOTO_SRC = '../assets/character/phu-sa/doi-phu-sa-ghe-v2.png';
const PHOTO_RATIO = 1264 / 848; // tỉ lệ ảnh gốc doi-phu-sa-mat-ghe

export async function mountGhe(el, opts = {}) {
  const o = { style: 'anh', autorotate: true, water: true, background: 'transparent', ...opts };
  el.style.position = el.style.position || 'relative';
  el.style.overflow = 'hidden';
  el.style.background = o.background;

  const img = document.createElement('img');
  img.src = new URL(PHOTO_SRC, import.meta.url).href;
  img.alt = 'Hương & Thầy Tú trên ghe hàng bông';
  img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center bottom';
  el.appendChild(img);

  let three3d = null; // lazily built on first switch to '3d'

  async function build3d() {
    if (three3d) return three3d;
    // Không dùng OrbitControls.js: nó import bare specifier "three" cần
    // <script type="importmap"> trên trang host – widget này phải nhúng
    // được vào bất kỳ trang nào (trang chủ, giới thiệu...) không có importmap
    // đó, nên tự xoay model bằng tay thay vì orbit controls tương tác.
    const [THREE, { buildBoat }, { buildHuong }, { buildTu }] = await Promise.all([
      import(new URL('../vendor/three/three.module.js', import.meta.url).href),
      import(new URL('../bp3d-boat/model-boat.js', import.meta.url).href),
      import(new URL('../bp3d-boat/model-huong.js', import.meta.url).href),
      import(new URL('../bp3d-boat/model-tu.js', import.meta.url).href),
    ]);

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:none';
    el.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

    const hemi = new THREE.HemisphereLight('#ffe9c6', '#6a7a52', 0.95);
    const key = new THREE.DirectionalLight('#ffd9a0', 2.2);
    key.position.set(4, 5, 3);
    const fill = new THREE.DirectionalLight('#cfe3ff', 0.5);
    fill.position.set(-4, 2, -3);
    scene.add(hemi, key, fill);

    const mat = (name, color, roughness = 0.7, metalness = 0) =>
      new THREE.MeshStandardMaterial({ name, color, roughness, metalness });
    const M = {
      hull: mat('teak_hull', '#8a5a36', 0.65), trim: mat('dark_teak', '#5e3a22', 0.6),
      plank: mat('deck_plank', '#a87448', 0.75), wicker: mat('wicker', '#b88a4e', 0.9),
      bamboo: mat('bamboo', '#d9b56a', 0.55), bambooNode: mat('bamboo_node', '#a8843f', 0.6),
      mango: mat('mango_yellow', '#f2c230', 0.45), mangoOrange: mat('mango_orange', '#f08a24', 0.45),
      red: mat('tomato_red', '#d63a2a', 0.35), lime: mat('lime_green', '#9cc93a', 0.5),
      pineapple: mat('pineapple', '#c99a2e', 0.8), durian: mat('durian', '#8aa23a', 0.85),
      leaf: mat('leaf', '#3f8a44', 0.7), skin: mat('skin', '#f2c4a0', 0.6),
      blush: mat('blush', '#ec9a8a', 0.7), eyeDark: mat('eye_dark', '#2a1a14', 0.3),
      mouth: mat('mouth', '#b6524a', 0.6), eyeWhite: mat('boat_eye_white', '#f5efe2', 0.6),
      dark: mat('ink', '#1c1a18', 0.6), lavender: mat('lavender_ao_ba_ba', '#b9a2d8', 0.75),
      pants: mat('black_silk', '#2c2b33', 0.42), pantsFold: mat('black_silk_fold', '#1a1920', 0.55),
      fishSilver: mat('ca_silver', '#cfd6d2', 0.25, 0.6), fishBack: mat('ca_back', '#4d6b62', 0.4),
      fishBeak: mat('ca_beak', '#c2483a', 0.5), fishFin: mat('ca_fin', '#a9b7ae', 0.5),
      ripple: mat('ripple', '#dfe6d4', 0.3), pantsDark: mat('charcoal', '#2b2b30', 0.7),
      shirtBlue: mat('denim_blue', '#4a6a98', 0.8), scarf: mat('khan_ran_gingham', '#ffffff', 0.85),
      iris: mat('iris_brown', '#6a3c22', 0.3), brow: mat('brow', '#4a2a1a', 0.6),
      teeth: mat('teeth', '#fbf7ef', 0.4), button: mat('button', '#efe8f5', 0.4),
      embroidery: mat('embroidery_violet', '#7a4fb0', 0.6), shirtSeam: mat('denim_seam', '#3a5580', 0.8),
      hairAuburn: mat('hair_auburn', '#9a4a26', 0.55), hairDark: mat('hair_black', '#2a2420', 0.5),
      water: mat('river_phu_sa', '#9aa97e', 0.6), hullSide: mat('teak_weathered', '#7a5234', 0.7),
      nonLa: mat('non_la', '#e8d29a', 0.8),
    };
    {
      const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
      x.fillStyle = '#f3efe4'; x.fillRect(0, 0, 64, 64);
      x.fillStyle = 'rgba(30,30,30,.55)'; for (let i = 0; i < 64; i += 16) { x.fillRect(i, 0, 8, 64); x.fillRect(0, i, 64, 8); }
      x.fillStyle = '#1e1e1e'; for (let i = 0; i < 64; i += 16) for (let j = 0; j < 64; j += 16) x.fillRect(i, j, 8, 8);
      const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 3);
      tex.colorSpace = THREE.SRGBColorSpace; M.scarf.map = tex;
    }

    const model = new THREE.Group(); model.name = 'ghe_phu_sa_widget';
    model.add(buildBoat(THREE, M));
    const huong = buildHuong(THREE, M), tu = buildTu(THREE, M);
    huong.scale.setScalar(1.3); tu.scale.setScalar(1.3);
    model.add(huong, tu);

    let water = null;
    if (o.water) {
      water = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 0.1, 64), M.water);
      water.position.y = 0.05;
      model.add(water);
    }
    scene.add(model);

    const tgt = new THREE.Vector3(0, 1.1, 0.1);
    let autorotate = !!o.autorotate;

    function frame() {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const vf = camera.fov * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
      const d = Math.max(2.4 / Math.tan(vf / 2), 2.6 / Math.tan(hf / 2));
      camera.position.copy(tgt).addScaledVector(new THREE.Vector3(1, 0.3, 1.2).normalize(), d);
      camera.near = 0.05; camera.far = 100; camera.updateProjectionMatrix();
      camera.lookAt(tgt);
    }
    frame();
    const ro = new ResizeObserver(frame);
    ro.observe(el);

    let raf = 0, alive = true;
    const tick = () => {
      if (!alive) return;
      if (autorotate) model.rotation.y += 0.0045;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    three3d = {
      canvas,
      setAutorotate: v => { autorotate = !!v; },
      setWater: v => { if (water) water.visible = !!v; },
      destroy: () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); canvas.remove(); },
    };
    return three3d;
  }

  async function applyStyle() {
    if (o.style === '3d') {
      const t3 = await build3d();
      img.style.display = 'none';
      t3.canvas.style.display = 'block';
      t3.setAutorotate(o.autorotate);
      t3.setWater(o.water);
    } else {
      img.style.display = 'block';
      if (three3d) three3d.canvas.style.display = 'none';
    }
  }
  await applyStyle();

  return {
    async update(next = {}) {
      Object.assign(o, next);
      el.style.background = o.background;
      await applyStyle();
      if (three3d) { three3d.setAutorotate(o.autorotate); three3d.setWater(o.water); }
    },
    destroy() {
      if (three3d) three3d.destroy();
      img.remove();
    },
  };
}
