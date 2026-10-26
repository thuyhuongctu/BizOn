/* BizOn — Ánh sáng đất sét dùng chung cho các cảnh 3D (Three.js thuần, không phụ thuộc thêm).
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Bảng màu «claymation-warm» (cam đất, kem, xanh ngọc, ánh đèn vàng ấm) và dàn đèn ba điểm mềm: cảnh giữ nguyên
 * mặt trời + bầu trời sẵn có, mô-đun chỉ THÊM đèn bù (fill) màu xanh ngọc từ phía đối diện mặt trời và đèn viền (rim)
 * màu kem từ thấp phía trước, cả hai không đổ bóng → khối đất sét mềm hơn, mặt khuất không đen, gần như không tốn hiệu năng.
 * float(): đung đưa nhẹ cho vật treo/nổi (lồng đèn, phao, ghim) – biên độ nhỏ, không đổi va chạm hay logic ván.
 * Nạp kiểu classic (<script src="js/clay-light.js">) trước các module 3D; cảnh gọi window.BizOnClayLight khi có. */
(function (root) {
  'use strict';
  const VERSION = 'cl-v1';
  const PALETTE = Object.freeze({ primary: '#e07a5f', secondary: '#f4f1de', accent: '#81b29a', tint: '#fef3c7', background: '#f4f1de', ink: '#3d405b' });
  // rig(THREE, scene, { intensity = 1, distance = 10, fillColor, rimColor }) → { group, fill, rim }
  function rig(THREE, scene, opts) {
    const o = opts || {}, k = o.intensity == null ? 1 : +o.intensity, d = o.distance || 10;
    const fill = new THREE.DirectionalLight(o.fillColor || PALETTE.accent, 0.35 * k); fill.position.set(-d, 0.6 * d, -d); fill.castShadow = false; fill.name = 'clay-fill';
    const rim = new THREE.DirectionalLight(o.rimColor || PALETTE.secondary, 0.25 * k); rim.position.set(0, -0.6 * d, d); rim.castShadow = false; rim.name = 'clay-rim';
    const group = new THREE.Group(); group.name = 'clay-light-rig'; group.add(fill); group.add(rim); scene.add(group);
    return { group, fill, rim, setIntensity(v) { fill.intensity = 0.35 * v; rim.intensity = 0.25 * v; } };
  }
  // float(obj, t, { amp = 0.12, speed = 1.5, phase = 0, rot = 0.04 }): đặt y quanh vị trí gốc (ghi nhớ lần đầu trong userData)
  function float(obj, t, opts) {
    if (!obj || !obj.position) return;
    const o = opts || {}, amp = o.amp == null ? 0.12 : o.amp, speed = o.speed == null ? 1.5 : o.speed, phase = o.phase || 0, rot = o.rot == null ? 0.04 : o.rot;
    const u = obj.userData || (obj.userData = {}); if (u.clayBaseY === undefined) u.clayBaseY = obj.position.y;
    obj.position.y = u.clayBaseY + Math.sin(t * speed + phase) * amp;
    if (rot) obj.rotation.z = Math.sin(t * speed * 0.7 + phase) * rot;
  }
  root.BizOnClayLight = { VERSION, PALETTE, rig, float };
})(typeof window !== 'undefined' ? window : globalThis);
