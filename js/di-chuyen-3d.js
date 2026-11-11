/* BizOn – Di chuyển 3D «kiểu sau lưng», dùng chung cho các cảnh 3D (đặc tả specs/002-ben-bizon-3d).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Người chơi điều khiển một nhân vật 3D bằng cần điều khiển (chạm), WASD hoặc phím mũi tên; máy quay bám sau lưng;
 * tới gần một địa điểm thì hiện thẻ có nút «Vào»; luôn có lối tắt «Đi tới…» để chọn thẳng một địa điểm.
 * Cách tương tác tham khảo các game «đi bộ góc nhìn thứ ba» trên điện thoại (mẫu chị Hương gửi 10/11/2026); không chép
 * mã, hình hay bản đồ của ai.
 *
 * Tệp này KHÔNG mang bối cảnh nào và không biết luật chơi: cảnh (mặt bằng, vật cản, địa điểm, nhân vật) do trang truyền
 * vào, kể cả thư viện THREE của trang (để dùng được với mọi bản three.js). Không gọi mạng, không lưu gì.
 *
 * BizOnDiChuyen.create({
 *   THREE, camera, canvas, host,          // host: phần tử chứa cảnh (position khác static) để gắn nút, thẻ, cần điều khiển
 *   player,                               // Object3D của nhân vật; mặt quay về +z khi rotation.y = 0
 *   places: [{ id, bieuTuong, ten: {vi, en}, moTa: {vi, en}, nhan: {vi, en} | null, nut: {vi, en} | null, x, z, tam, huong }],
 *   diDuoc(x, z) → boolean,               // điểm này đứng được không (trong bờ, ngoài vật cản)
 *   cheMay(x, z) → boolean,               // điểm này có vật cao che máy quay không (tuỳ chọn)
 *   lang() → 'vi' | 'en', onEnter(place), giamChuyenDong, batDau: { x, z, yaw }, tocDo (hoặc tocDoDi + tocDoChay, nguongChay, tocQuay), camXa, camCao
 * }) → { update(dt), goTo(id), dat(x, z, yaw), state(), setPlaces(list), lamMoiChu(), dung(bool), dispose() }
 */
(function (root) {
  'use strict';
  var TAU = Math.PI * 2;
  function gocGan(a) { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; }   // đưa góc về (-π, π]
  function kep(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function el(tag, cls, attrs) { var e = document.createElement(tag); if (cls) e.className = cls; if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }

  var CSS = [
    '.dc-ui{position:absolute;inset:0;pointer-events:none;font-family:inherit;color:#033337;-webkit-user-select:none;user-select:none}',
    '.dc-ui button{font:inherit;cursor:pointer;border:0}',
    '.dc-ui button:focus-visible{outline:3px solid #fda127;outline-offset:2px}',
    '.dc-joy{position:absolute;left:max(18px,env(safe-area-inset-left,0px));bottom:calc(18px + env(safe-area-inset-bottom,0px));width:116px;height:116px;border-radius:50%;background:rgba(3,51,55,.3);border:3px solid rgba(255,255,255,.7);pointer-events:auto;touch-action:none}',
    '.dc-joy i{position:absolute;left:50%;top:50%;width:50px;height:50px;margin:-25px;border-radius:50%;background:rgba(255,255,255,.92);box-shadow:0 4px 10px rgba(0,0,0,.28);pointer-events:none}',
    '@media (hover:hover) and (pointer:fine) and (min-width:900px){.dc-joy{display:none}}',
    '.dc-card{position:absolute;left:12px;right:12px;bottom:calc(150px + env(safe-area-inset-bottom,0px));max-width:430px;margin:0 auto;display:none;gap:12px;align-items:center;background:#fff;border-radius:22px;padding:12px 12px 12px 14px;box-shadow:0 14px 34px -10px rgba(0,40,50,.5),inset 0 -4px 0 rgba(0,0,0,.06);pointer-events:auto}',
    '.dc-card.on{display:flex}',
    '@media (hover:hover) and (pointer:fine) and (min-width:900px){.dc-card{bottom:28px}}',
    '.dc-card .dc-ic{flex:0 0 auto;width:48px;height:48px;border-radius:16px;background:#fff3da;display:flex;align-items:center;justify-content:center;font-size:26px}',
    '.dc-card .dc-tx{flex:1 1 auto;min-width:0}',
    '.dc-card .dc-ten{font-weight:800;font-size:16px;line-height:1.25;margin:0;color:#033337}',
    '.dc-card .dc-mo{font-size:12.5px;line-height:1.4;margin:2px 0 0;color:#2c4a50}',
    '.dc-card .dc-nhan{display:inline-block;margin:0 0 3px;padding:2px 9px;border-radius:999px;background:#e3f4ea;color:#0b5b3f;font-size:11px;font-weight:800}',
    '.dc-card .dc-nhan[hidden]{display:none}',
    '.dc-vao{flex:0 0 auto;min-width:76px;min-height:48px;padding:10px 18px;border-radius:16px;background:#006687;color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.18)}',
    '.dc-goto-btn{position:absolute;right:max(12px,env(safe-area-inset-right,0px));top:calc(12px + env(safe-area-inset-top,0px));min-height:46px;padding:10px 16px;border-radius:999px;background:#fff;color:#033337;font-weight:800;font-size:14px;box-shadow:0 8px 20px -8px rgba(0,40,50,.5),inset 0 -3px 0 rgba(0,0,0,.08);pointer-events:auto}',
    '.dc-goto{position:absolute;right:max(12px,env(safe-area-inset-right,0px));top:calc(66px + env(safe-area-inset-top,0px));width:min(300px,calc(100% - 24px));max-height:calc(100% - 90px);overflow:auto;display:none;flex-direction:column;gap:6px;background:#fff;border-radius:20px;padding:10px;box-shadow:0 18px 40px -12px rgba(0,40,50,.55);pointer-events:auto}',
    '.dc-goto.on{display:flex}',
    '.dc-goto h2{margin:2px 6px 4px;font-size:13px;font-weight:800;color:#2c4a50}',
    '.dc-goto button[data-id]{display:flex;align-items:center;gap:10px;min-height:46px;padding:8px 12px;border-radius:14px;background:#f4faff;color:#033337;font-weight:700;font-size:14px;text-align:left}',
    '.dc-goto button[data-id]:hover{background:#e0f4fb}',
    '.dc-goto button[data-id] span{font-size:20px;width:26px;text-align:center}',
    'html[data-theme="dark"] .dc-card,html[data-theme="dark"] .dc-goto,html[data-theme="dark"] .dc-goto-btn{background:#0e2a33;color:#d6ecf0}',
    'html[data-theme="dark"] .dc-card .dc-ten{color:#eaf6f8}html[data-theme="dark"] .dc-card .dc-mo,html[data-theme="dark"] .dc-goto h2{color:#b5d3d9}',
    'html[data-theme="dark"] .dc-goto button[data-id]{background:#143a45;color:#eaf6f8}',
    'html[data-theme="dark"] .dc-card .dc-ic{background:#143a45}'
  ].join('\n');
  var CHU = {
    vao: { vi: 'Vào', en: 'Enter' }, diToi: { vi: '🧭 Đi tới…', en: '🧭 Go to…' }, chonNoi: { vi: 'Chọn nơi muốn tới', en: 'Choose where to go' },
    can: { vi: 'Cần điều khiển: kéo để đi', en: 'Joystick: drag to walk' }
  };

  function create(o) {
    var THREE = o.THREE, cam = o.camera, host = o.host, pl = o.player;
    var lang = o.lang || function () { return 'vi'; };
    var diDuoc = o.diDuoc || function () { return true; }, cheMay = o.cheMay || function () { return false; };
    var giam = !!o.giamChuyenDong;
    var TOC = o.tocDo || 3.4, TOC_DI = o.tocDoDi || TOC, TOC_CHAY = o.tocDoChay || TOC, NGUONG = o.nguongChay || 0.75, QUAY = o.tocQuay || 12, chay = false,
      NHIP = o.nhip === 'chay' ? 'chay' : 'tu-dong',   // «tự động»: đẩy nhẹ đi, đẩy hết chạy; «chạy»: đẩy cần mức nào cũng chạy
      XA = o.camXa || 3.6, CAO = o.camCao || 1.55, NHIN = o.camNhin || 0.95;
    var bd = o.batDau || { x: 0, z: 0, yaw: 0 };
    var places = (o.places || []).slice();
    var T = function (k) { return CHU[k][lang() === 'en' ? 'en' : 'vi']; };
    var L = function (v) { return v ? (v[lang() === 'en' ? 'en' : 'vi'] || v.vi || '') : ''; };

    if (!document.getElementById('dc-css')) { var stl = el('style', null, { id: 'dc-css' }); stl.textContent = CSS; document.head.appendChild(stl); }

    // ---- trạng thái
    var px = bd.x, pz = bd.z, yaw = bd.yaw || 0, vx = 0, vz = 0;
    var camYaw = yaw, camPitch = 0, camD = XA, lastDrag = -99, now = 0;
    var camPos = new THREE.Vector3(), camTo = new THREE.Vector3();
    var keys = {}, joy = { x: 0, y: 0, id: null }, look = { id: null, x: 0, y: 0 };
    var near = null, mode = 'idle', dungLai = false, disposed = false;

    // ---- giao diện
    var ui = el('div', 'dc-ui');
    var joyEl = el('div', 'dc-joy', { role: 'img', 'aria-label': T('can') }), knob = el('i'); joyEl.appendChild(knob);
    var card = el('div', 'dc-card', { role: 'region', 'aria-live': 'polite' });
    var ic = el('div', 'dc-ic', { 'aria-hidden': 'true' }), tx = el('div', 'dc-tx'), nhan = el('span', 'dc-nhan'), ten = el('p', 'dc-ten'), mo = el('p', 'dc-mo');
    var vao = el('button', 'dc-vao', { type: 'button' });
    tx.appendChild(nhan); tx.appendChild(ten); tx.appendChild(mo); card.appendChild(ic); card.appendChild(tx); card.appendChild(vao);
    var gbtn = el('button', 'dc-goto-btn', { type: 'button', 'aria-expanded': 'false', 'aria-controls': 'dc-goto' });
    var glist = el('div', 'dc-goto', { id: 'dc-goto', role: 'dialog' });
    ui.appendChild(card); ui.appendChild(joyEl); ui.appendChild(gbtn); ui.appendChild(glist); host.appendChild(ui);

    function veThe() {
      if (!near) { card.classList.remove('on'); return; }
      ic.textContent = near.bieuTuong || '📍'; ten.textContent = L(near.ten); mo.textContent = L(near.moTa);
      var n = L(near.nhan); nhan.textContent = n; nhan.hidden = !n;
      vao.textContent = near.nut ? L(near.nut) : T('vao');
      card.setAttribute('aria-label', L(near.ten)); card.classList.add('on');
    }
    function veDanhSach() {
      gbtn.textContent = T('diToi'); glist.setAttribute('aria-label', T('chonNoi')); joyEl.setAttribute('aria-label', T('can'));
      glist.textContent = ''; var h = el('h2'); h.textContent = T('chonNoi'); glist.appendChild(h);
      places.forEach(function (p) {
        var b = el('button', null, { type: 'button', 'data-id': p.id }), s = el('span', null, { 'aria-hidden': 'true' });
        s.textContent = p.bieuTuong || '📍'; b.appendChild(s); b.appendChild(document.createTextNode(L(p.ten))); glist.appendChild(b);
      });
    }
    function lamMoiChu() { veDanhSach(); veThe(); }
    function moDanhSach(mo_) {
      glist.classList.toggle('on', mo_); gbtn.setAttribute('aria-expanded', mo_ ? 'true' : 'false');
      if (mo_) { xoaPhim(); var f = glist.querySelector('button[data-id]'); if (f) f.focus(); }
    }
    function dangMo() { return glist.classList.contains('on'); }
    function xoaPhim() { keys = {}; joy.x = joy.y = 0; joy.id = null; knob.style.transform = ''; }

    // ---- tìm địa điểm gần nhất trong tầm
    function timGan() {
      var best = null, bd2 = 1e9;
      for (var i = 0; i < places.length; i++) {
        var p = places[i], d = Math.hypot(p.x - px, p.z - pz);
        if (d < (p.tam || 2) && d < bd2) { best = p; bd2 = d; }
      }
      if (best !== near) { near = best; veThe(); }
    }
    function vaoNoi() { if (near && o.onEnter) { xoaPhim(); o.onEnter(near); } }

    // ---- đặt vị trí, lối tắt
    function dat(x, z, y) {
      px = x; pz = z; vx = vz = 0; if (y != null) { yaw = gocGan(y); camYaw = yaw; }
      camD = XA; datMay(true); timGan();
    }
    function goTo(id) {
      var p = null; for (var i = 0; i < places.length; i++) if (places[i].id === id) p = places[i];
      if (!p) return false;
      dat(p.x, p.z, p.huong != null ? p.huong : yaw);
      moDanhSach(false); near = p; veThe();
      try { vao.focus({ preventScroll: true }); } catch (e) { vao.focus(); }
      return true;
    }

    // ---- máy quay sau lưng
    function datMay(ngay, dt) {
      var fx = Math.sin(camYaw), fz = Math.cos(camYaw);
      // lùi lại gần khi giữa nhân vật và máy quay có vật cao che
      var d = XA;
      for (var k = 1; k <= 8; k++) { var t = XA * k / 8; if (cheMay(px - fx * t, pz - fz * t)) { d = Math.max(1.3, t - XA / 8 - 0.25); break; } }
      camD = ngay || giam ? d : camD + (d - camD) * Math.min(1, (dt || 0.016) * 6);
      var tgt = camTo.set(px - fx * camD, CAO + camPitch * camD * 0.6 + (XA - camD) * 0.25, pz - fz * camD);
      if (ngay || giam) camPos.copy(tgt); else camPos.lerp(tgt, 1 - Math.exp(-(dt || 0.016) * 9));
      cam.position.copy(camPos); cam.lookAt(px, NHIN, pz);
    }

    function update(dt) {
      if (disposed) return;
      dt = kep(dt || 0, 0, 0.05); now += dt;
      var ix = 0, iy = 0;
      if (!dungLai && !dangMo()) {
        ix = (keys.d || keys.right ? 1 : 0) - (keys.a || keys.left ? 1 : 0) + joy.x;
        iy = (keys.w || keys.up ? 1 : 0) - (keys.s || keys.down ? 1 : 0) + joy.y;
      }
      var m = Math.hypot(ix, iy); if (m > 1) { ix /= m; iy /= m; m = 1; }
      // hướng đi tính theo máy quay: đẩy lên là đi ra xa máy quay
      var fx = Math.sin(camYaw), fz = Math.cos(camYaw), rx = -Math.cos(camYaw), rz = Math.sin(camYaw);
      // hai nhịp: đẩy nhẹ cần (hoặc giữ Shift) là đi bộ, đẩy hết cần hay bấm phím là chạy; nơi gọi không đặt tocDoDi/tocDoChay thì chỉ có một tốc độ như cũ
      chay = (NHIP === 'chay' ? m >= 0.05 : m >= NGUONG) && !keys.shift;
      var toc = m < 0.05 ? 0 : chay ? TOC_CHAY : TOC_DI * Math.max(0.55, Math.min(1, m / NGUONG)), dai = m || 1;
      var tx_ = (fx * iy + rx * ix) / dai * toc, tz_ = (fz * iy + rz * ix) / dai * toc;
      var a = Math.min(1, dt * (m > 0.05 ? 9 : 12));
      vx += (tx_ - vx) * a; vz += (tz_ - vz) * a;
      var sp = Math.hypot(vx, vz);
      if (sp > 0.001) {
        var nx = px + vx * dt, nz = pz + vz * dt;
        if (diDuoc(nx, nz)) { px = nx; pz = nz; }
        else if (diDuoc(nx, pz)) { px = nx; vz = 0; }       // trượt dọc vật cản / mép nước
        else if (diDuoc(px, nz)) { pz = nz; vx = 0; }
        else { vx = vz = 0; }
        sp = Math.hypot(vx, vz);
      }
      if (sp > 0.25) {
        var want = Math.atan2(vx, vz);
        yaw = gocGan(yaw + gocGan(want - yaw) * Math.min(1, dt * QUAY));
        // máy quay xoay dần về sau lưng; không xoay khi nhân vật chạy về phía máy quay, khi người chơi vừa kéo nhìn quanh, hay khi giảm chuyển động
        var lech = gocGan(yaw - camYaw);
        if (!giam && Math.abs(lech) < 2.1 && now - lastDrag > 1.2) camYaw = gocGan(camYaw + lech * Math.min(1, dt * 1.5));
      }
      var md = sp > 0.25 ? 'walk' : 'idle'; mode = md;
      pl.position.x = px; pl.position.z = pz; pl.rotation.y = yaw;
      datMay(false, dt); timGan();
    }

    // ---- bàn phím
    var PHIM = { KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd', ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', ShiftLeft: 'shift', ShiftRight: 'shift' };
    function dangGo(e) { var t = e.target; return t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable); }
    function onKeyDown(e) {
      if (disposed || dangGo(e) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape' && dangMo()) { moDanhSach(false); gbtn.focus(); e.preventDefault(); return; }
      if (dungLai) return;
      if (dangMo()) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          var bs = Array.prototype.slice.call(glist.querySelectorAll('button[data-id]')), i = bs.indexOf(document.activeElement);
          var n = bs[(i + (e.key === 'ArrowDown' ? 1 : bs.length - 1)) % bs.length]; if (n) n.focus(); e.preventDefault();
        }
        return;
      }
      var k = PHIM[e.code];
      if (k) { if (ui.contains(e.target) && e.target.tagName === 'BUTTON' && /^Arrow/.test(e.code)) e.target.blur(); keys[k] = true; e.preventDefault(); return; }
      var tren = e.target && e.target.tagName === 'BUTTON';
      if (e.code === 'KeyE' || (e.key === 'Enter' && !tren)) { if (near) { vaoNoi(); e.preventDefault(); } }
    }
    function onKeyUp(e) { var k = PHIM[e.code]; if (k) keys[k] = false; }
    function onBlur() { xoaPhim(); }
    function onVis() { if (document.hidden) xoaPhim(); }

    // ---- cần điều khiển
    function joyMove(e) {
      var r = joyEl.getBoundingClientRect(), R = r.width / 2, dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R);
      var d = Math.hypot(dx, dy), mx = R * 0.72; if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
      knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      var nx = dx / mx, ny = -dy / mx; if (Math.hypot(nx, ny) < 0.14) nx = ny = 0;
      joy.x = nx; joy.y = ny;
    }
    function joyDown(e) { if (joy.id !== null) return; joy.id = e.pointerId; try { joyEl.setPointerCapture(e.pointerId); } catch (x) {} joyMove(e); e.preventDefault(); }
    function joyMv(e) { if (e.pointerId === joy.id) { joyMove(e); e.preventDefault(); } }
    function joyUp(e) { if (e.pointerId !== joy.id) return; joy.id = null; joy.x = joy.y = 0; knob.style.transform = ''; }
    joyEl.addEventListener('pointerdown', joyDown); joyEl.addEventListener('pointermove', joyMv);
    joyEl.addEventListener('pointerup', joyUp); joyEl.addEventListener('pointercancel', joyUp); joyEl.addEventListener('lostpointercapture', joyUp);

    // ---- kéo trên cảnh để nhìn quanh
    var cv = o.canvas;
    function lookDown(e) { if (look.id !== null || dungLai) return; look.id = e.pointerId; look.x = e.clientX; look.y = e.clientY; }
    function lookMove(e) {
      if (e.pointerId !== look.id) return;
      var dx = e.clientX - look.x, dy = e.clientY - look.y; look.x = e.clientX; look.y = e.clientY;
      if (Math.abs(dx) + Math.abs(dy) < 0.5) return;
      camYaw = gocGan(camYaw - dx * 0.008); camPitch = kep(camPitch + dy * 0.004, -0.25, 0.7); lastDrag = now;
    }
    function lookUp(e) { if (e.pointerId === look.id) look.id = null; }
    if (cv) { cv.addEventListener('pointerdown', lookDown); cv.addEventListener('pointermove', lookMove); cv.addEventListener('pointerup', lookUp); cv.addEventListener('pointercancel', lookUp); }

    vao.addEventListener('click', vaoNoi);
    gbtn.addEventListener('click', function () { moDanhSach(!dangMo()); });
    glist.addEventListener('click', function (e) { var b = e.target.closest ? e.target.closest('button[data-id]') : null; if (b) goTo(b.getAttribute('data-id')); });
    window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur); document.addEventListener('visibilitychange', onVis);

    lamMoiChu(); pl.position.x = px; pl.position.z = pz; pl.rotation.y = yaw; datMay(true); timGan();

    return {
      update: update, goTo: goTo, dat: dat, lamMoiChu: lamMoiChu,
      setPlaces: function (list) { places = (list || []).slice(); near = null; lamMoiChu(); timGan(); },
      // đổi góc máy khi đang chơi (xa, cao, điểm nhìn); bỏ trống thì giữ nguyên
      mayQuay: function (m) { m = m || {}; if (m.xa > 0) XA = m.xa; if (m.cao > 0) CAO = m.cao; if (m.nhin >= 0) NHIN = m.nhin; camD = XA; datMay(true); return { xa: XA, cao: CAO, nhin: NHIN }; },
      // đổi tốc độ khi đang chơi (ví dụ kho động tác «chạy» không tải được thì hạ tốc độ chạy xuống mức clip «đi» theo kịp)
      tocDo: function (m) { m = m || {}; if (m.di > 0) TOC_DI = m.di; if (m.chay > 0) TOC_CHAY = m.chay; return { di: TOC_DI, chay: TOC_CHAY }; },
      dung: function (v) { dungLai = !!v; if (dungLai) { xoaPhim(); vx = vz = 0; } },
      // nhịp chạy/đi của cần điều khiển: 'tu-dong' (mặc định) hoặc 'chay'; bàn phím không đổi (Shift vẫn là đi chậm)
      nhip: function (m) { if (m) NHIP = m === 'chay' ? 'chay' : 'tu-dong'; return NHIP; },
      state: function () {
        return { x: px, z: pz, yaw: yaw, camYaw: camYaw, camX: cam.position.x, camY: cam.position.y, camZ: cam.position.z,
          mode: mode, chay: chay && mode === 'walk', nhip: NHIP, speed: Math.hypot(vx, vz), near: near ? near.id : null, giamChuyenDong: giam, dangDung: dungLai };
      },
      dispose: function () {
        disposed = true;
        window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('blur', onBlur); document.removeEventListener('visibilitychange', onVis);
        if (cv) { cv.removeEventListener('pointerdown', lookDown); cv.removeEventListener('pointermove', lookMove); cv.removeEventListener('pointerup', lookUp); cv.removeEventListener('pointercancel', lookUp); }
        if (ui.parentNode) ui.parentNode.removeChild(ui);
      }
    };
  }

  root.BizOnDiChuyen = { VERSION: 'dc-v1', create: create };
})(typeof window !== 'undefined' ? window : globalThis);
