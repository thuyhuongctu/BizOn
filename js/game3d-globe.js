// Quả địa cầu đất sét làm nền cho màn đăng nhập của game 3D (xem Game3DGate.mount, tùy chọn backdrop).
// Chỉ trang trí: không tương tác, không có dữ liệu địa hình thật. Nạp như module để dùng được import 'three'
// qua importmap của trang; phải đặt SAU importmap trong HTML.
import * as THREE from 'three';

(function () {
  // Trả về { dispose } để trang tắt WebGL khi không cần quả địa cầu nữa (vd. khi vào game).
  function mount(el) {
    if (!el) return null;
    if (el._globeHandle) return el._globeHandle;
    el.dataset.globeMounted = '1';

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    el.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.4, 4.2);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x0a3a40, 1.1));
    var sun = new THREE.DirectionalLight(0xfff1d6, 1.4);
    sun.position.set(3, 2, 4);
    scene.add(sun);
    if (window.BizOnClayLight) BizOnClayLight.rig(THREE, scene, { distance: 4, intensity: 0.8 });   // đèn bù + đèn viền đất sét

    var R = 1;
    function latLonToVec3(lat, lon, r) {
      var phi = THREE.MathUtils.degToRad(90 - lat);
      var theta = THREE.MathUtils.degToRad(lon + 180);
      return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
    }

    var earth = new THREE.Group();
    scene.add(earth);
    earth.add(new THREE.Mesh(
      new THREE.SphereGeometry(R, 72, 48),
      new THREE.MeshStandardMaterial({ color: 0xd9a46f, roughness: 0.78, metalness: 0.0 })
    ));

    var gridPts = [];
    var seg = 96;
    for (var lat = -60; lat <= 60; lat += 30) {
      for (var i = 0; i < seg; i++) {
        gridPts.push(latLonToVec3(lat, (i / seg) * 360 - 180, R * 1.003), latLonToVec3(lat, ((i + 1) / seg) * 360 - 180, R * 1.003));
      }
    }
    for (var lon = -180; lon < 180; lon += 30) {
      for (var j = 0; j < seg / 2; j++) {
        gridPts.push(latLonToVec3((j / (seg / 2)) * 180 - 90, lon, R * 1.003), latLonToVec3(((j + 1) / (seg / 2)) * 180 - 90, lon, R * 1.003));
      }
    }
    earth.add(new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(gridPts),
      new THREE.LineBasicMaterial({ color: 0x033337, transparent: true, opacity: 0.3 })
    ));

    // Cần Thơ: điểm sáng và vòng nhấp nháy
    var pinPos = latLonToVec3(10.03, 105.78, R * 1.01);
    var pin = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xf08a3c, emissive: 0xf08a3c, emissiveIntensity: 0.6 })
    );
    pin.position.copy(pinPos);
    earth.add(pin);
    var ring = new THREE.Mesh(
      new THREE.RingGeometry(0.06, 0.075, 40),
      new THREE.MeshBasicMaterial({ color: 0xffd58a, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
    );
    ring.position.copy(pinPos);
    ring.lookAt(pinPos.clone().multiplyScalar(2));
    earth.add(ring);
    // Xoay để Cần Thơ hướng về camera khi mở trang
    earth.rotation.y = -Math.atan2(pinPos.x, pinPos.z);

    function resize() {
      var w = el.clientWidth || 1, h = el.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    resize();
    var ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(el);

    function dispose() {
      renderer.setAnimationLoop(null);
      if (ro) ro.disconnect();
      renderer.dispose();
      renderer.domElement.remove();
      delete el.dataset.globeMounted;
      el._globeHandle = null;
    }

    var t0 = performance.now();
    renderer.setAnimationLoop(function () {
      // Tự dọn khi khung đăng nhập bị gỡ khỏi trang
      if (!el.isConnected) { dispose(); return; }
      var t = (performance.now() - t0) / 1000;
      var pulse = 1 + 0.35 * Math.sin(t * 2.4);
      ring.scale.set(pulse, pulse, pulse);
      ring.material.opacity = 0.9 - 0.5 * ((t * 2.4) % (2 * Math.PI)) / (2 * Math.PI);
      earth.rotation.y += 0.002;
      renderer.render(scene, camera);
    });

    el._globeHandle = { dispose: dispose };
    return el._globeHandle;
  }

  window.Game3DGlobe = { mount: mount };
})();
