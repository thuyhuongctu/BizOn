/* BizOn Bật Nghiệp 2026 – Thử nghiệm giao diện đất sét 3D (màn đăng nhập)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 * Dùng three.js (tự host tại js/vendor/, MIT license) – chưa có model 3D
 * riêng của các nhân vật nên linh vật ở đây dựng từ khối hình học đơn giản
 * (cầu, viên nang, xuyến) theo đúng bảng màu đất sét của game. */
import * as THREE from './vendor/three.module.min.js';

function initClay3D() {
  const canvas = document.getElementById('clay3d-canvas');
  if (!canvas || canvas.dataset.inited) return;
  canvas.dataset.inited = '1';

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, canvas.clientWidth / canvas.clientHeight || 1, 0.1, 100);
  camera.position.set(0, 1.1, 5.4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  scene.add(new THREE.AmbientLight(0xfff2df, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x00c4ff, 0.55);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  const mascot = new THREE.Group();
  scene.add(mascot);

  const clayMat = (hex) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.85, metalness: 0.02 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.6, 0.5, 6, 16), clayMat(0x006687));
  body.position.y = -0.05;
  mascot.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 20), clayMat(0xe8b384));
  head.position.y = 1.05;
  mascot.add(head);

  [-1, 1].forEach((s) => {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), clayMat(0xf3a583));
    cheek.position.set(0.33 * s, 0.95, 0.41);
    mascot.add(cheek);
  });

  [-1, 1].forEach((s) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), clayMat(0x033337));
    eye.position.set(0.18 * s, 1.11, 0.49);
    mascot.add(eye);
  });

  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.025, 8, 20, Math.PI), clayMat(0x033337));
  smile.rotation.z = Math.PI;
  smile.position.set(0, 0.9, 0.52);
  mascot.add(smile);

  [-1, 1].forEach((s) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.48, 4, 10), clayMat(0xe8762d));
    arm.position.set(0.6 * s, 0.15, 0);
    arm.rotation.z = -0.35 * s;
    mascot.add(arm);
  });

  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.035, 8, 48), clayMat(0xfda127));
  halo.rotation.x = Math.PI / 2.4;
  halo.position.y = 0.32;
  mascot.add(halo);

  const confettiColors = [0xe8762d, 0xfda127, 0x00c4ff, 0x006687];
  const confetti = [];
  for (let i = 0; i < 14; i++) {
    const geo = Math.random() > 0.5
      ? new THREE.BoxGeometry(0.07, 0.07, 0.07)
      : new THREE.SphereGeometry(0.045, 8, 8);
    const m = new THREE.Mesh(geo, clayMat(confettiColors[i % confettiColors.length]));
    const r = 1.5 + Math.random() * 0.6;
    const a = Math.random() * Math.PI * 2;
    m.position.set(Math.cos(a) * r, Math.random() * 2.2 - 0.3, Math.sin(a) * r);
    m.userData.baseY = m.position.y;
    m.userData.speed = 0.4 + Math.random() * 0.6;
    m.userData.phase = Math.random() * Math.PI * 2;
    confetti.push(m);
    scene.add(m);
  }

  // Kéo (chuột/chạm) để xoay linh vật; buông tay vẫn trôi nhẹ rồi tự quay chậm lại.
  let dragging = false, lastX = 0, lastY = 0, velX = 0.004;
  const onDown = (x, y) => { dragging = true; lastX = x; lastY = y; canvas.style.cursor = 'grabbing'; };
  const onMove = (x, y) => {
    if (!dragging) return;
    const dx = x - lastX, dy = y - lastY;
    mascot.rotation.y += dx * 0.01;
    mascot.rotation.x = Math.max(-0.5, Math.min(0.5, mascot.rotation.x + dy * 0.01));
    velX = dx * 0.001;
    lastX = x; lastY = y;
  };
  const onUp = () => { dragging = false; canvas.style.cursor = 'grab'; };

  canvas.addEventListener('pointerdown', (e) => onDown(e.clientX, e.clientY));
  window.addEventListener('pointermove', (e) => onMove(e.clientX, e.clientY));
  window.addEventListener('pointerup', onUp);
  canvas.addEventListener('touchstart', (e) => { const t = e.touches[0]; onDown(t.clientX, t.clientY); }, { passive: true });
  canvas.addEventListener('touchmove', (e) => { const t = e.touches[0]; onMove(t.clientX, t.clientY); }, { passive: true });
  canvas.addEventListener('touchend', onUp);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', resize);
  // Màn đăng nhập còn ẩn (display:none, chờ hết splash) lúc script này chạy
  // nên canvas rộng 0px lúc khởi tạo – theo dõi để bắt kích thước thật khi
  // màn hiện ra, nếu không renderer kẹt ở khung hình 0×0 mãi mãi.
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(resize).observe(canvas);
  }

  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    if (document.hidden) return;
    const t = clock.getElapsedTime();
    if (!dragging) {
      velX *= 0.985;
      mascot.rotation.y += reduceMotion ? 0 : (velX + 0.0025);
    }
    if (!reduceMotion) {
      mascot.position.y = Math.sin(t * 1.4) * 0.05;
      confetti.forEach((c) => {
        c.position.y = c.userData.baseY + Math.sin(t * c.userData.speed + c.userData.phase) * 0.15;
        c.rotation.x += 0.01;
        c.rotation.y += 0.014;
      });
    }
    renderer.render(scene, camera);
  }
  tick();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initClay3D);
} else {
  initClay3D();
}
