/* BizOn – <three-d-stage>: khung xem mô hình 3D dùng chung cho các trang
 * "phòng trưng bày" nhỏ (three.js), tách biệt khỏi màn chơi chính.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Dùng: <three-d-stage background="#f3eee6" autorotate></three-d-stage>
 * rồi ở script riêng: stage.ready.then(function () { stage.setObject(group); });
 * setObject() tự canh khung hình theo bounding box của vật thể, không cần
 * biết trước kích thước. Kéo chuột/chạm để xoay quanh vật thể, lăn chuột
 * (hoặc chụm 2 ngón) để phóng to/thu nhỏ.
 *
 * Nạp sau js/vendor/three.min.js (bản three.js toàn cục đã dùng ở Sảnh 3D –
 * js/hub3d.js) – không cần ES module/CDN riêng.
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof customElements === 'undefined') return;
  if (typeof THREE === 'undefined') return;

  var ThreeDStage = function () {
    var el = Reflect.construct(HTMLElement, [], ThreeDStage);
    el._object = null;
    el._theta = Math.PI * 0.22;
    el._phi = Math.PI * 0.38;
    el._radius = 1.4;
    el._target = new THREE.Vector3(0, 0.1, 0);
    el._dragging = false;
    el._lastX = 0;
    el._lastY = 0;
    el._idle = 0;
    var readyResolve;
    el.ready = new Promise(function (res) { readyResolve = res; });
    el._readyResolve = readyResolve;
    return el;
  };
  ThreeDStage.prototype = Object.create(HTMLElement.prototype);
  ThreeDStage.prototype.constructor = ThreeDStage;

  ThreeDStage.prototype.connectedCallback = function () {
    if (this._built) return;
    this._built = true;
    this._build();
  };

  ThreeDStage.prototype._build = function () {
    var el = this;
    // Chỉ đặt vị trí/hiển thị mặc định khi trang chưa tự style phần tử này
    // qua CSS ngoài (kiểm tra computed style, không phải inline style, vì
    // "position:fixed" khai báo trong <style> mới là style thật đang áp
    // dụng – nếu gán đè "relative" vào đây thì khung 3D sẽ co về cao 0px).
    var computed = window.getComputedStyle(this);
    if (computed.position === 'static') this.style.position = 'relative';
    if (computed.display === 'inline') this.style.display = 'block';
    this.style.overflow = 'hidden';
    this.style.touchAction = 'none';

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    this.appendChild(canvas);
    this._canvas = canvas;

    var bg = this.getAttribute('background') || '#f4faff';
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(bg);

    var camera = new THREE.PerspectiveCamera(42, 1, 0.05, 100);
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene.add(new THREE.HemisphereLight(0xffffff, 0xcdbfa2, 0.75));
    var sun = new THREE.DirectionalLight(0xfff2d6, 1.05);
    sun.position.set(1.6, 2.6, 1.8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.2;
    sun.shadow.camera.far = 8;
    sun.shadow.camera.left = -1.2;
    sun.shadow.camera.right = 1.2;
    sun.shadow.camera.top = 1.2;
    sun.shadow.camera.bottom = -1.2;
    scene.add(sun);
    var fill = new THREE.DirectionalLight(0xbfe6ec, 0.32);
    fill.position.set(-1.4, 1.1, -1.2);
    scene.add(fill);

    this._scene = scene;
    this._camera = camera;
    this._renderer = renderer;
    this._updateCamera();

    canvas.addEventListener('pointerdown', function (e) {
      el._dragging = true; el._lastX = e.clientX; el._lastY = e.clientY;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!el._dragging) return;
      var dx = e.clientX - el._lastX, dy = e.clientY - el._lastY;
      el._lastX = e.clientX; el._lastY = e.clientY;
      el._theta -= dx * 0.008;
      el._phi = Math.min(Math.PI * 0.85, Math.max(Math.PI * 0.12, el._phi - dy * 0.008));
      el._idle = 0;
      el._updateCamera();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (type) {
      canvas.addEventListener(type, function () { el._dragging = false; });
    });
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      var base = Math.max(0.25, el._fitRadius || el._radius);
      el._radius = Math.min(base * 3, Math.max(base * 0.4, el._radius + e.deltaY * 0.0015 * base));
      el._idle = 0;
      el._updateCamera();
    }, { passive: false });

    function resize() {
      var w = el.clientWidth || 1, h = el.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    resize();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(resize).observe(this);
    } else {
      window.addEventListener('resize', resize);
    }

    var last = performance.now();
    var autorotate = this.hasAttribute('autorotate');
    function loop(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      el._idle += dt;
      if (autorotate && !el._dragging && el._idle > 1.2) {
        el._theta += dt * 0.24;
        el._updateCamera();
      }
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    this._readyResolve({ THREE: THREE });
  };

  ThreeDStage.prototype._updateCamera = function () {
    var sinPhi = Math.sin(this._phi);
    this._camera.position.set(
      this._target.x + this._radius * sinPhi * Math.sin(this._theta),
      this._target.y + this._radius * Math.cos(this._phi),
      this._target.z + this._radius * sinPhi * Math.cos(this._theta)
    );
    this._camera.lookAt(this._target);
  };

  // Thay vật thể đang hiển thị và tự canh camera vừa khung theo bounding box.
  ThreeDStage.prototype.setObject = function (obj) {
    var el = this;
    if (!this._scene) { this.ready.then(function () { el.setObject(obj); }); return; }
    if (this._object) this._scene.remove(this._object);
    this._object = obj;
    if (!obj) return;
    this._scene.add(obj);

    var box = new THREE.Box3().setFromObject(obj);
    if (box.isEmpty()) return;
    var size = box.getSize(new THREE.Vector3());
    var center = box.getCenter(new THREE.Vector3());
    var maxDim = Math.max(size.x, size.y, size.z, 0.01);
    var fov = this._camera.fov * Math.PI / 180;
    var fitRadius = (maxDim / (2 * Math.tan(fov / 2))) * 1.6;

    this._target.copy(center);
    this._radius = this._fitRadius = Math.max(0.35, fitRadius);
    this._theta = Math.PI * 0.22;
    this._phi = Math.PI * 0.38;
    this._idle = 0;
    this._updateCamera();

    var name = this.getAttribute('name');
    if (name) this.setAttribute('aria-label', name.replace(/[-_]+/g, ' '));
  };

  customElements.define('three-d-stage', ThreeDStage);
})();
