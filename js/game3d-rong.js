// Thanh Long cưỡi mây 3D trang trí màn đăng nhập BizOn Game 3D: mô hình đất sét (assets/models/rong-bay-doi-bizon.glb,
// Meshy AI dựng từ chính tranh rong-bay-doi-bizon-v5 của BizOn) bay lượn chậm ngay trên vị trí con rồng trong ảnh nền,
// như bức tranh sống dậy. Chỉ trang trí: không tương tác. Nạp như module để dùng import 'three' qua importmap; đặt SAU importmap.
// Không có WebGL hay không tải được mô hình thì bỏ qua, ảnh nền 2D vẫn còn nguyên.
import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';

(function () {
  var GLB = 'assets/models/rong-bay-doi-bizon.glb';
  // Khung con rồng + đội trong ảnh nền (tỷ lệ theo ảnh 1376×768, cùng tỷ lệ với bản v5 2752×1536)
  var IMG = { w: 1376, h: 768, x0: 45, y0: 60, x1: 1215, y1: 590 };

  // Vị trí khung rồng trên màn hình: tính lại đúng phép «background-size: cover» và background-position của #login3d
  function rectOnScreen(w, h) {
    var s = Math.max(w / IMG.w, h / IMG.h), px = 0.5, py = 0.5;
    if (w <= 600) { px = 0.58; py = 0.22; }   // điện thoại dọc: khớp CSS @media (max-width:600px)
    var ox = (w - IMG.w * s) * px, oy = (h - IMG.h * s) * py;
    return { x: ox + IMG.x0 * s, y: oy + IMG.y0 * s, w: (IMG.x1 - IMG.x0) * s, h: (IMG.y1 - IMG.y0) * s };
  }

  function mount(el) {
    if (!el) return null;
    if (el._rongHandle) return el._rongHandle;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return null; }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none';
    renderer.domElement.setAttribute('data-rong', '1');
    renderer.domElement.setAttribute('aria-hidden', 'true');
    el.insertBefore(renderer.domElement, el.firstChild);   // nằm dưới thẻ đăng nhập, bong bóng gợi ý và quả địa cầu

    var scene = new THREE.Scene();
    // Máy quay trực giao, đơn vị = px CSS: đặt mô hình thẳng theo khung rồng trong ảnh nền
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -4000, 4000);
    var EL = 0.22;   // nhìn hơi từ trên xuống như tranh gốc
    camera.position.set(0, Math.sin(EL) * 2000, Math.cos(EL) * 2000); camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xfff4e0, 0x6a4a60, 1.25));
    var sun = new THREE.DirectionalLight(0xffe2b8, 1.6); sun.position.set(-600, 900, 1400); scene.add(sun);
    var fill = new THREE.DirectionalLight(0xffb27a, 0.5); fill.position.set(1200, -200, 600); scene.add(fill);   // hoàng hôn hắt từ phải

    var root = new THREE.Group(); scene.add(root);
    var model = null, baseScale = 1, basePos = new THREE.Vector3(), fitted = false;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    var handle = { dispose: dispose, ready: false, error: null, rect: null };

    function size() {
      var w = el.clientWidth || window.innerWidth, h = el.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.left = -w / 2; camera.right = w / 2; camera.top = h / 2; camera.bottom = -h / 2; camera.updateProjectionMatrix();
      if (model) fit(w, h);
    }

    // Khớp khung chiếu của mô hình vào khung rồng trong ảnh: chia tỷ lệ theo bề ngang, căn tâm
    var box = new THREE.Box3(), v = new THREE.Vector3();
    function projected() {
      root.updateMatrixWorld(true); camera.updateMatrixWorld(true);
      box.setFromObject(root);
      var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (var i = 0; i < 8; i++) {
        v.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(camera);
        minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x); minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
      }
      var w = camera.right - camera.left, h = camera.top - camera.bottom;
      return { x: (minX + 1) / 2 * w, y: (1 - maxY) / 2 * h, w: (maxX - minX) / 2 * w, h: (maxY - minY) / 2 * h };
    }
    function fit(w, h) {
      var r = rectOnScreen(w, h); handle.rect = r;
      root.position.set(0, 0, 0); root.scale.setScalar(1);
      var p = projected();
      baseScale = r.w / p.w; root.scale.setScalar(baseScale);
      p = projected();
      var dx = (r.x + r.w / 2) - (p.x + p.w / 2), dy = (r.y + r.h / 2) - (p.y + p.h / 2);
      // 1 đơn vị thế giới = 1 px theo trục ngang/dọc của máy quay trực giao
      var right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
      root.position.addScaledVector(right, dx).addScaledVector(up, -dy);
      basePos.copy(root.position); fitted = true;
    }

    new GLTFLoader().load(GLB, function (gltf) {
      if (!el.isConnected) return;
      model = gltf.scene;
      model.traverse(function (o) { if (o.isMesh && o.material) { o.material.roughness = 0.85; o.material.metalness = 0; } });
      // Mô hình Meshy: đầu rồng ở +z. Máy quay ở +z nhìn về -z, nên xoay +60° quanh y: đầu sang phải và hơi hướng về
      // người xem, thân lùi về trái như tranh gốc (nhìn ba phần tư)
      model.rotation.y = Math.PI * 60 / 180;
      // Đặt tâm hộp bao về gốc để xoay, nhún quanh tâm
      var b = new THREE.Box3().setFromObject(model), c = b.getCenter(new THREE.Vector3());
      model.position.sub(c);
      root.add(model);
      size(); handle.ready = true;
    }, undefined, function (err) { handle.error = String(err && err.message || err); });

    size();
    var ro = window.ResizeObserver ? new ResizeObserver(size) : null;
    if (ro) ro.observe(el); else window.addEventListener('resize', size);

    function dispose() {
      renderer.setAnimationLoop(null);
      if (ro) ro.disconnect(); else window.removeEventListener('resize', size);
      renderer.dispose(); renderer.domElement.remove();
      el._rongHandle = null;
    }

    var t0 = performance.now();
    renderer.setAnimationLoop(function () {
      if (!el.isConnected) { dispose(); return; }
      if (fitted && !reduce) {
        var t = (performance.now() - t0) / 1000;
        // bay lượn chậm: nhún theo nhịp, nghiêng mình và đổi hướng rất nhẹ
        root.position.copy(basePos); root.position.y += Math.sin(t * 0.8) * 7;
        root.rotation.z = Math.sin(t * 0.8 + 1.2) * 0.022;
        root.rotation.y = Math.sin(t * 0.5) * 0.035;
        root.rotation.x = Math.sin(t * 0.65 + 0.4) * 0.015;
      }
      renderer.render(scene, camera);
    });

    el._rongHandle = handle;
    return handle;
  }

  window.Game3DRong = { mount: mount, rectOnScreen: rectOnScreen };
  // Màn đăng nhập đã hiện trước khi module này tải xong (mạng chậm) thì gắn ngay
  if (document.body && document.body.classList.contains('login3d') && !window.__l3Rong) {
    var el = document.getElementById('login3d'); if (el) window.__l3Rong = mount(el);
  }
})();
