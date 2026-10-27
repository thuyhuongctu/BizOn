/* Xe lạnh đất sét (clay reefer truck) – mô hình thủ tục Three.js dựng từ ảnh tham chiếu assets/hc/durian/chang-6-xe-lanh-cao-toc.webp
   theo quy trình img2threejs (quan sát → đặc tả → dựng từng lớp → đối chiếu ảnh). Không dùng texture ngoài; bảng LED và tem sầu riêng vẽ bằng canvas.
   Trục: xe dài theo Z (+Z = mũi xe), rộng theo X, cao theo Y; bánh chạm đất ở y = 0. Dùng chung cho Sầu Riêng 3D (xe trên đường + mô hình nhỏ ở chặng 6). */
(function (root) {
  'use strict';
  const VERSION = 'ct-v1';
  const COLORS = Object.freeze({ cab: '#9FD6BF', cabDark: '#7FBFA6', box: '#F6F8F4', band: '#BFE6D3', chassis: '#3A3F3B', tire: '#1E2A22', hub: '#D8DDD6', glass: '#BFE3EE', orange: '#F2A33A', red: '#D7263D', led: '#10161C', ledText: '#FF9A4A', ledText2: '#FFD36B', unit: '#EEF2EC', grille: '#5B6660', mirror: '#2E3A33' });
  const DIM = Object.freeze({ width: 2.2, length: 5.4, height: 3.1 }); // kích thước gốc (đơn vị cảnh); scale theo opts.scale

  // hộp bo góc: hình chữ nhật bo tròn (w×h) đùn sâu d, có bevel để bo cả 12 cạnh – đủ «đất sét» mà không cần RoundedBoxGeometry
  function roundedBox(T, w, h, d, r, seg) {
    w -= 2 * r; h -= 2 * r; const s = new T.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const g = new T.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: seg || 2, curveSegments: 4 });
    g.translate(0, 0, -(d - 2 * r) / 2); // tâm tại gốc
    return g;
  }
  function canvasTex(T, w, h, draw) {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  function ledTexture(T, lines, flip) {
    return canvasTex(T, 512, 192, (ctx, w, h) => {
      ctx.fillStyle = COLORS.led; ctx.fillRect(0, 0, w, h);
      if (flip) { ctx.translate(w, 0); ctx.scale(-1, 1); }
      ctx.font = 'bold 40px "Courier New", monospace'; ctx.textBaseline = 'middle';
      lines.forEach((ln, i) => { ctx.fillStyle = i % 2 ? COLORS.ledText2 : COLORS.ledText; ctx.fillText(ln, 24, 40 + i * 44); });
      // lưới điểm LED mờ
      ctx.fillStyle = 'rgba(0,0,0,.28)'; for (let y = 0; y < h; y += 6) ctx.fillRect(0, y, w, 2);
    });
  }
  function emblemTexture(T) {
    return canvasTex(T, 256, 256, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#F6F1E6'; ctx.beginPath(); ctx.arc(w / 2, h / 2, 118, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 10; ctx.strokeStyle = '#2E6B3A'; ctx.stroke();
      // trái sầu riêng: thân vàng-xanh + gai
      ctx.fillStyle = '#B9C94F'; ctx.beginPath(); ctx.ellipse(w / 2, h / 2 + 8, 62, 70, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8CA33A'; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, px = w / 2 + Math.cos(a) * 62, py = h / 2 + 8 + Math.sin(a) * 70; ctx.beginPath(); ctx.moveTo(px - 7, py - 7); ctx.lineTo(px + Math.cos(a) * 16, py + Math.sin(a) * 16); ctx.lineTo(px + 7, py + 7); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#6B4F2A'; ctx.fillRect(w / 2 - 4, h / 2 - 72, 8, 22);
    });
  }

  /** Dựng xe. opts: { scale, cabColor, boxColor, lines (LED), mat(color)→Material, emblem (bool), detail ('full'|'low') }.
   *  Trả về { group, wheels[], unitFan, tick(dt, speed) } – tick quay bánh và quạt dàn lạnh. */
  function build(THREE, opts) {
    const T = THREE, o = opts || {}, S = o.scale == null ? 1 : +o.scale, low = o.detail === 'low';
    const mat = o.mat || (c => new T.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true }));
    const cabC = o.cabColor || COLORS.cab, boxC = o.boxColor || COLORS.box;
    const g = new T.Group(); g.name = 'clay-truck';
    const add = (geo, m, x, y, z, cast) => { const mesh = new T.Mesh(geo, m); mesh.position.set(x, y, z); mesh.castShadow = cast !== false; g.add(mesh); return mesh; };
    const seg = low ? 1 : 2;
    // 1 · khung gầm + thùng lạnh (cuboid chính, bo góc) + dải mint trên nóc & váy dưới
    add(new T.BoxGeometry(1.7, 0.3, 5.0), mat(COLORS.chassis), 0, 0.72, -0.15);
    add(roundedBox(T, 2.2, 2.3, 3.6, 0.12, seg), mat(boxC), 0, 2.0, -0.9);
    add(new T.BoxGeometry(2.24, 0.22, 3.64), mat(COLORS.band), 0, 3.05, -0.9);           // dải mint nóc
    add(new T.BoxGeometry(2.24, 0.18, 3.64), mat(COLORS.band), 0, 0.95, -0.9);           // váy mint dưới
    add(new T.BoxGeometry(2.0, 1.9, 0.06), mat(COLORS.band), 0, 2.0, -2.72, false);     // cửa sau (tấm mint có 2 cánh)
    add(new T.BoxGeometry(0.04, 1.8, 0.08), mat(COLORS.grille), 0, 2.0, -2.75, false);  // khe giữa 2 cánh cửa
    // 2 · dàn lạnh trên mũi thùng (hộp trắng có lưới) + quạt
    add(roundedBox(T, 1.6, 0.62, 0.5, 0.08, 1), mat(COLORS.unit), 0, 2.75, 1.12);
    const grille = add(new T.BoxGeometry(1.2, 0.34, 0.04), mat(COLORS.grille), 0, 2.75, 1.37, false); [-0.4, 0, 0.4].forEach(dx => add(new T.BoxGeometry(0.08, 0.3, 0.02), mat(COLORS.unit), dx, 2.75, 1.395, false));
    const fan = add(new T.CylinderGeometry(0.1, 0.1, 0.03, 8), mat(COLORS.unit), 0.2, 2.75, 1.41, false); fan.rotation.x = Math.PI / 2;
    // 3 · ca-bin (bo góc), kính chắn gió lớn, kính bên, cản trước, đèn pha, lưới tản nhiệt
    add(roundedBox(T, 2.0, 1.55, 1.55, 0.16, seg), mat(cabC), 0, 1.5, 1.82);
    { const ws = add(new T.BoxGeometry(1.8, 0.92, 0.06), mat(COLORS.glass), 0, 1.7, 2.56, false); ws.rotation.x = -0.08; } // kính chắn gió lớn, hơi ngả
    [-1, 1].forEach(sx => { add(new T.BoxGeometry(0.06, 0.72, 0.8), mat(COLORS.glass), sx * 1.0, 1.76, 1.95, false);  // kính bên
      add(new T.BoxGeometry(0.1, 0.28, 0.1), mat(COLORS.mirror), sx * 1.1, 1.8, 2.3, false);                  // gương
      add(new T.CylinderGeometry(0.14, 0.14, 0.06, 12), mat(COLORS.ledText2), sx * 0.7, 1.05, 2.6, false).rotation.x = Math.PI / 2; // đèn pha
      add(new T.BoxGeometry(0.1, 0.08, 0.1), mat(COLORS.orange), sx * 0.98, 1.32, 2.56, false); });                 // xi-nhan
    add(new T.BoxGeometry(2.1, 0.3, 0.3), mat(COLORS.cabDark), 0, 0.78, 2.5);                                      // cản trước
    add(new T.BoxGeometry(1.2, 0.18, 0.04), mat(COLORS.grille), 0, 1.3, 2.6, false);                                // lưới tản nhiệt
    add(roundedBox(T, 1.9, 0.18, 1.45, 0.07, 1), mat(COLORS.band), 0, 2.3, 1.8, false);                               // mái ca-bin mint bo tròn
    // 4 · ăng-ten GPS trên nóc ca-bin
    if (!low) { add(new T.CylinderGeometry(0.025, 0.025, 0.45, 6), mat(COLORS.chassis), 0.6, 2.5, 1.5, false); add(new T.SphereGeometry(0.07, 8, 6), mat(COLORS.red), 0.6, 2.75, 1.5, false); }
    // 5 · bánh xe: 3 trục (trước đơn, sau kép) – lốp đen + mâm sáng
    const wheels = [];
    const axles = [[1.6, 0.98], [-0.85, 0.98], [-1.75, 0.98]];
    axles.forEach(([z, x], ai) => [-1, 1].forEach(sx => {
      const wg = new T.Group(); wg.position.set(sx * x, 0.42, z); g.add(wg);
      const tire = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, ai ? 0.42 : 0.3, low ? 10 : 16), mat(COLORS.tire)); tire.rotation.z = Math.PI / 2; tire.castShadow = true; wg.add(tire);
      const hub = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, (ai ? 0.42 : 0.3) + 0.04, 10), mat(COLORS.hub)); hub.rotation.z = Math.PI / 2; wg.add(hub);
      wheels.push(wg);
    }));
    [[-1.0, 1.2], [1.0, 1.2]].forEach(([x, z]) => add(new T.BoxGeometry(0.1, 0.5, 0.95), mat(cabC), x, 1.0, z, false)); // chắn bùn trước
    // 6 · đèn sườn cam dọc váy thùng + bảng LED nhiệt độ hai bên + tem sầu riêng
    [-1, 1].forEach(sx => {
      if (!low) [-2.3, -1.6, -0.9, -0.2, 0.5].forEach(z => add(new T.BoxGeometry(0.04, 0.08, 0.16), mat(COLORS.orange), sx * 1.13, 0.95, z, false));
      const lines = o.lines || ['TEMP: -18.0°C', 'HUMIDITY: 85%', 'GPS ACTIVE'];
      const tex = ledTexture(T, lines, sx < 0);
      const led = add(new T.PlaneGeometry(1.7, 0.64), tex ? new T.MeshBasicMaterial({ map: tex, toneMapped: false }) : new T.MeshBasicMaterial({ color: COLORS.led }), sx * 1.112, 2.15, -0.5, false);
      led.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
      if (o.emblem !== false) { const et = emblemTexture(T); const em = add(new T.PlaneGeometry(0.55, 0.55), et ? new T.MeshBasicMaterial({ map: et, transparent: true, alphaTest: 0.3 }) : mat('#F6F1E6'), sx * 1.112, 2.45, -2.1, false); em.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2; }
    });
    // nóc thùng sang mint + wifi ký hiệu không dựng (biểu tượng 2D trong ảnh, không phải vật thể)
    g.scale.setScalar(S);
    return { group: g, wheels, fan, VERSION, tick(dt, speed) { const v = speed == null ? 1 : speed; wheels.forEach(w => { w.rotation.x -= dt * v * 3; }); fan.rotation.z += dt * 12; } };
  }
  root.BizOnClayTruck = { VERSION, COLORS, DIM, build, roundedBox };
})(typeof window !== 'undefined' ? window : globalThis);
