/* BizOn – Sảnh 3D (hub 3D toàn vũ trụ Bật Nghiệp)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * v0: một sân nền tròn, nhân vật đi lại bằng WASD/mũi tên (hoặc cần điều
 * khiển ảo trên di động), một NPC (Lumina) có thể bắt chuyện.
 * v0.1: thêm 5 "cửa" quanh sân dẫn thẳng sang từng game trong vũ trụ Bật
 * Nghiệp – biến sảnh từ một phòng demo thành một hub thật sự.
 *
 * Nhân vật người chơi, NPC và các cửa đều là sprite luôn quay mặt về camera
 * (kiểu "búp bê giấy" đứng trong khung cảnh 3D) – khớp tinh thần đất nặn/cắt
 * dán của BizOn mà không cần dựng mô hình 3D có khớp xương. Khi có
 * model/animation thật, chỉ cần thay SpriteMaterial bằng mesh mà không đổi
 * phần còn lại (di chuyển, va chạm biên, tương tác, hội thoại).
 */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') {
    var warn = document.getElementById('hub3d-fallback');
    if (warn) warn.hidden = false;
    return;
  }

  var reduceMotion = false;
  try { reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var BOUNDS = 8.6;
  var PLAYER_SPEED = 4.4;
  var NPC_DIST = 2.3;
  var DOOR_DIST = 2.6;
  var DOOR_RADIUS = BOUNDS - 1.1;
  var NPC_POS = new THREE.Vector3(0, 0.95, -3.4);

  var DIALOGUE = [
    ['Lumina AI', 'Chào bạn! Mình là Lumina – người dẫn đường ở Sảnh BizOn. 👋'],
    ['Lumina AI', 'Đây là hub 3D nối tới mọi trò chơi trong vũ trụ Bật Nghiệp.'],
    ['Lumina AI', 'Đi tới gần một cánh cửa quanh sân rồi nhấn E (hoặc chạm nút) để bước sang game đó.'],
    ['Lumina AI', 'Trong lúc chờ khám phá hết, bạn có thể ghé chơi luôn Hộ Chiếu Thương Hiệu nhé!'],
  ];

  // 5 game hiện có trong vũ trụ Bật Nghiệp – cùng bộ liên kết với nhóm
  // "🎮 Trò chơi" ở site-nav.js/site-footer.js, xếp đều quanh sân.
  var GAMES = [
    { label: 'Hộ Chiếu Thương Hiệu', icon: '🛂', url: 'brand-passport.html', color: '#006687' },
    { label: 'Game Bật Nghiệp', icon: '🎮', url: 'game.html', color: '#0f8f6b' },
    { label: 'BizOn Arcade', icon: '🕹️', url: 'games.html', color: '#7b3fa0' },
    { label: 'Go Global', icon: '🌏', url: 'global.html', color: '#1c6fd1' },
    { label: 'Gánh Hàng Khởi Nghiệp', icon: '🛶', url: 'ben-phu-sa.html', color: '#c2740c' },
  ];

  var canvas, renderer, scene, camera;
  var player, npc, npcBob = 0;
  var keys = {};
  var joyVec = { x: 0, y: 0 };
  var joyActive = false, joyId = null, joyBase, joyKnob;
  var promptEl, interactBtn, dlgEl, dlgName, dlgText, dlgNextBtn, dlgCtaBtn;
  var dlgIdx = -1;
  var clock;
  var interactables = [];
  var currentTarget = null;

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapTwoLines(text) {
    var words = text.split(' ');
    if (words.length <= 2) return [text];
    var mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }

  // Placeholder cho nhân vật người chơi: vẽ trực tiếp lên canvas thay vì cần
  // thêm tệp ảnh mới – dễ thay bằng tạo hình đất nặn thật khi có sau này.
  function makePlaceholderTexture(fill) {
    var c = document.createElement('canvas');
    c.width = 128; c.height = 256;
    var ctx = c.getContext('2d');
    ctx.fillStyle = fill;
    ctx.beginPath(); ctx.arc(64, 54, 38, 0, Math.PI * 2); ctx.fill();
    roundRect(ctx, 26, 92, 76, 148, 30); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(64, 54, 38, 0, Math.PI * 2); ctx.stroke();
    roundRect(ctx, 26, 92, 76, 148, 30); ctx.stroke();
    return new THREE.CanvasTexture(c);
  }

  // Biển "cửa" vào từng game: mái vòm màu riêng + icon lớn + nhãn tên game,
  // vẽ hết vào một canvas texture duy nhất cho gọn (không cần model 3D).
  function makeDoorTexture(icon, label, color) {
    var c = document.createElement('canvas');
    c.width = 220; c.height = 300;
    var ctx = c.getContext('2d');
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(20, 300); ctx.lineTo(20, 110);
    ctx.arc(110, 110, 90, Math.PI, 0);
    ctx.lineTo(200, 300);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 6; ctx.stroke();

    ctx.font = '86px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(icon, 110, 118);

    roundRect(ctx, 8, 232, 204, 62, 18);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.fillStyle = '#033337';
    var lines = wrapTwoLines(label);
    ctx.font = '800 22px Manrope, sans-serif';
    if (lines.length === 1) {
      ctx.fillText(lines[0], 110, 263);
    } else {
      ctx.font = '800 19px Manrope, sans-serif';
      ctx.fillText(lines[0], 110, 251);
      ctx.fillText(lines[1], 110, 276);
    }
    return new THREE.CanvasTexture(c);
  }

  function makeSprite(texture, w, h) {
    var mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    var spr = new THREE.Sprite(mat);
    spr.scale.set(w, h, 1);
    spr.center.set(0.5, 0);
    return spr;
  }

  function buildDoors() {
    GAMES.forEach(function (g, i) {
      var angle = (i / GAMES.length) * Math.PI * 2 - Math.PI / 2;
      var spr = makeSprite(makeDoorTexture(g.icon, g.label, g.color), 2.0, 2.7);
      spr.position.set(Math.cos(angle) * DOOR_RADIUS, 0, Math.sin(angle) * DOOR_RADIUS);
      scene.add(spr);
      interactables.push({
        pos: spr.position,
        dist: DOOR_DIST,
        promptAction: 'vào ' + g.label.toLowerCase(),
        buttonLabel: '🚪 Vào ' + g.label,
        activate: function () { location.href = g.url; },
      });
    });
  }

  function init() {
    canvas = document.getElementById('hub3d-canvas');
    if (!canvas) return;
    promptEl = document.getElementById('hub3d-prompt');
    interactBtn = document.getElementById('hub3d-interact');
    dlgEl = document.getElementById('hub3d-dialogue');
    dlgName = document.getElementById('hub3d-dlg-name');
    dlgText = document.getElementById('hub3d-dlg-text');
    dlgNextBtn = document.getElementById('hub3d-dlg-next');
    dlgCtaBtn = document.getElementById('hub3d-dlg-cta');
    joyBase = document.getElementById('hub3d-joy-base');
    joyKnob = document.getElementById('hub3d-joy-knob');
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfe6ec);
    scene.fog = new THREE.Fog(0xbfe6ec, 13, 26);

    var box = canvas.getBoundingClientRect();
    camera = new THREE.PerspectiveCamera(48, box.width / Math.max(1, box.height), 0.1, 100);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(box.width, box.height, false);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x2f6b57, 1.05));
    var sun = new THREE.DirectionalLight(0xfff2d6, 0.85);
    sun.position.set(6, 10, 4);
    scene.add(sun);

    var ground = new THREE.Mesh(
      new THREE.CircleGeometry(BOUNDS + 1.2, 48),
      new THREE.MeshStandardMaterial({ color: 0x0f8f6b, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    var ring = new THREE.Mesh(
      new THREE.RingGeometry(BOUNDS - 0.15, BOUNDS, 64),
      new THREE.MeshBasicMaterial({ color: 0xfda127, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    player = makeSprite(makePlaceholderTexture('#006687'), 1.15, 2.15);
    player.position.set(0, 0, 4.4);
    scene.add(player);

    npc = makeSprite(new THREE.TextureLoader().load('assets/character/lumina-ao-dai-wave.webp'), 1.35, 2.75);
    npc.position.copy(NPC_POS);
    scene.add(npc);

    interactables.push({
      pos: npc.position,
      dist: NPC_DIST,
      promptAction: 'trò chuyện với Lumina',
      buttonLabel: '🗨️ Nói chuyện',
      activate: openDialogue,
    });
    buildDoors();

    updateCamera();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });
    window.addEventListener('resize', onResize);
    dlgNextBtn.addEventListener('click', advanceDialogue);
    dlgEl.addEventListener('click', function (e) { if (e.target === dlgEl) closeDialogue(); });
    interactBtn.addEventListener('click', interact);
    document.getElementById('hub3d-dlg-close').addEventListener('click', closeDialogue);

    initJoystick();
    requestAnimationFrame(loop);
  }

  function interact() {
    if (currentTarget) currentTarget.activate();
  }

  function onKeyDown(e) {
    var k = e.key.toLowerCase();
    keys[k] = true;
    if (k === 'e' && !dlgOpen()) interact();
    if (k === 'escape' && dlgOpen()) closeDialogue();
  }

  function initJoystick() {
    if (!joyBase) return;
    function toVec(clientX, clientY) {
      var r = joyBase.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = clientX - cx, dy = clientY - cy;
      var max = r.width / 2;
      var len = Math.hypot(dx, dy);
      if (len > max) { dx = dx / len * max; dy = dy / len * max; }
      joyKnob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      joyVec.x = dx / max; joyVec.y = dy / max;
    }
    joyBase.addEventListener('pointerdown', function (e) {
      joyActive = true; joyId = e.pointerId;
      joyBase.setPointerCapture(e.pointerId);
      toVec(e.clientX, e.clientY);
    });
    joyBase.addEventListener('pointermove', function (e) {
      if (!joyActive || e.pointerId !== joyId) return;
      toVec(e.clientX, e.clientY);
    });
    function release(e) {
      if (e.pointerId !== joyId) return;
      joyActive = false; joyId = null;
      joyVec.x = 0; joyVec.y = 0;
      joyKnob.style.transform = 'translate(0,0)';
    }
    joyBase.addEventListener('pointerup', release);
    joyBase.addEventListener('pointercancel', release);
  }

  function dlgOpen() { return dlgIdx >= 0; }

  function openDialogue() {
    dlgIdx = 0;
    renderDialogue();
    dlgEl.classList.add('on');
  }
  function advanceDialogue() {
    dlgIdx++;
    if (dlgIdx >= DIALOGUE.length) { closeDialogue(); return; }
    renderDialogue();
  }
  function renderDialogue() {
    var line = DIALOGUE[dlgIdx];
    dlgName.textContent = line[0];
    dlgText.textContent = line[1];
    var last = dlgIdx === DIALOGUE.length - 1;
    dlgNextBtn.hidden = last;
    dlgCtaBtn.hidden = !last;
  }
  function closeDialogue() {
    dlgIdx = -1;
    dlgEl.classList.remove('on');
  }

  function onResize() {
    var box = canvas.getBoundingClientRect();
    camera.aspect = box.width / Math.max(1, box.height);
    camera.updateProjectionMatrix();
    renderer.setSize(box.width, box.height, false);
  }

  function updateCamera() {
    var target = player.position;
    camera.position.set(target.x, target.y + 6.6, target.z + 7.4);
    camera.lookAt(target.x, target.y + 0.6, target.z - 1.4);
  }

  function findNearestTarget() {
    var best = null, bestD = Infinity;
    for (var i = 0; i < interactables.length; i++) {
      var it = interactables[i];
      var d = player.position.distanceTo(it.pos);
      if (d <= it.dist && d < bestD) { bestD = d; best = it; }
    }
    return best;
  }

  function loop() {
    requestAnimationFrame(loop);
    var dt = Math.min(clock.getDelta(), 0.05);

    if (!dlgOpen()) {
      var mx = 0, mz = 0;
      if (keys.w || keys.arrowup) mz -= 1;
      if (keys.s || keys.arrowdown) mz += 1;
      if (keys.a || keys.arrowleft) mx -= 1;
      if (keys.d || keys.arrowright) mx += 1;
      if (joyActive) { mx += joyVec.x; mz += joyVec.y; }
      var len = Math.hypot(mx, mz);
      if (len > 0.001) {
        mx /= len; mz /= len;
        player.position.x += mx * PLAYER_SPEED * dt;
        player.position.z += mz * PLAYER_SPEED * dt;
        var d = Math.hypot(player.position.x, player.position.z);
        if (d > BOUNDS) {
          player.position.x = player.position.x / d * BOUNDS;
          player.position.z = player.position.z / d * BOUNDS;
        }
      }
      updateCamera();
    }

    if (!reduceMotion) {
      npcBob += dt;
      npc.position.y = NPC_POS.y + Math.sin(npcBob * 1.6) * 0.05;
    }

    currentTarget = dlgOpen() ? null : findNearestTarget();
    var near = !!currentTarget;
    promptEl.hidden = !near;
    interactBtn.hidden = !near;
    if (near) {
      promptEl.innerHTML = 'Nhấn <b>E</b> hoặc chạm nút bên phải để ' + currentTarget.promptAction;
      interactBtn.textContent = currentTarget.buttonLabel;
    }

    renderer.render(scene, camera);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
