/* BizOn – Sảnh 3D (hub 3D toàn vũ trụ Bật Nghiệp)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * v0: một sân nền tròn, nhân vật đi lại bằng WASD/mũi tên (hoặc cần điều
 * khiển ảo trên di động), một NPC (Lumina) có thể bắt chuyện.
 * v0.1: thêm 5 "cửa" quanh sân dẫn thẳng sang từng game trong vũ trụ Bật
 * Nghiệp – biến sảnh từ một phòng demo thành một hub thật sự.
 * v0.2: thay hình đặt chỗ vẽ bằng canvas bằng tạo hình đất nặn thật (chọn
 * 1 trong 2 đại diện áo dài, nhớ lựa chọn qua localStorage), và thêm hiệu
 * ứng mờ dần khi bước qua cửa thay vì điều hướng đột ngột.
 * v0.3: thêm "hoạt hình đi bộ" giả lập cho nhân vật (chỉ có 1 ảnh tĩnh,
 * chưa có sprite sheet nhiều khung hình) bằng cách nhấp nhô + nghiêng nhẹ
 * + co giãn (squash & stretch) theo nhịp bước khi đang di chuyển, không
 * cần thêm ảnh mới. Tắt hoàn toàn khi prefers-reduced-motion.
 * v0.4: thêm 3 hoạt động khác ngoài đi lại + cửa: máy hát (bật/tắt nhạc
 * nền BizOn Theme), NPC thứ hai (Thầy Tú – cố vấn học thuật, hội thoại
 * riêng), và bảng thông tin giới thiệu Sảnh. Tổng quát hoá hệ hội thoại
 * để dùng chung cho nhiều nhân vật/nội dung khác nhau thay vì chỉ Lumina.
 * v0.5: thêm bảng thành tích – ghi nhớ (localStorage) những game đã ghé
 * qua cửa nào, tạo động lực khám phá đủ cả 5 game trong vũ trụ Bật Nghiệp.
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
  var EXTRA_RADIUS = 4.6;
  var EXTRA_DIST = 2.4;
  var NPC_POS = new THREE.Vector3(0, 0.95, -3.4);
  // Góc giữa các cửa (xen kẽ, bán kính nhỏ hơn) cho 3 hoạt động phụ – tránh
  // chồng lấn với NPC Lumina (nằm cùng hướng cửa 0) và các cửa.
  var JUKEBOX_ANGLE = deg(-54);
  var TU_ANGLE = deg(234); // KHÔNG dùng 90° – trùng hướng xuất phát của người chơi (0,0,4.4)
  var BOARD_ANGLE = deg(162);
  // Khe hở 72° còn lại duy nhất không kề góc xuất phát (90°) là giữa cửa
  // cuối (342°) và cửa đầu (54°, vòng qua 0°) – chia đôi ra 18° cho vừa.
  var PROGRESS_ANGLE = deg(18);
  function deg(d) { return d * Math.PI / 180; }

  // Hoạt hình đi bộ giả lập trên sprite tĩnh: tần số bước, biên độ nhấp
  // nhô/nghiêng/co giãn. playerBob/Tilt/Squash là giá trị hiện tại, luôn
  // easing (lerp) về đích mỗi khung hình – tránh giật cục lúc dừng đột ngột.
  var PLAYER_W = 1.3, PLAYER_H = 2.6;
  var WALK_FREQ = 9;
  var BOB_HEIGHT = 0.1;
  var TILT_AMOUNT = 0.06;
  var SQUASH_AMOUNT = 0.05;
  var walkPhase = 0;
  var playerBob = 0, playerTilt = 0, playerSquash = 0;

  // Mỗi mục là một cuộc hội thoại độc lập: avatar hiện trong hộp thoại, các
  // dòng thoại, và nút CTA tùy chọn ở dòng cuối (null = chỉ có nút đóng).
  var DIALOGUES = {
    lumina: {
      avatar: 'assets/character/lumina-ao-dai-wave.webp',
      lines: [
        ['Lumina', 'Chào bạn! Mình là Lumina – người dẫn đường ở Sảnh BizOn. 👋'],
        ['Lumina', 'Đây là hub 3D nối tới mọi trò chơi trong vũ trụ Bật Nghiệp.'],
        ['Lumina', 'Đi tới gần một cánh cửa quanh sân rồi nhấn E (hoặc chạm nút) để bước sang game đó.'],
        ['Lumina', 'Trong lúc chờ khám phá hết, bạn có thể ghé chơi luôn Hộ Chiếu Thương Hiệu nhé!'],
      ],
      cta: { label: '🛂 Vào chơi Hộ Chiếu Thương Hiệu', href: 'brand-passport.html' },
    },
    tu: {
      avatar: 'assets/character/anh-tu-ao-dai-explain-cut.webp',
      lines: [
        ['PGS.TS. Phan Anh Tú', 'Chào bạn! Thầy là Tú – cố vấn học thuật của BizOn Bật Nghiệp. 📚'],
        ['PGS.TS. Phan Anh Tú', 'Mỗi ván Hộ Chiếu Thương Hiệu hay Bến Phù Sa đều dựng trên mô hình kinh tế thật, không chỉ là trò chơi.'],
        ['PGS.TS. Phan Anh Tú', 'Nếu muốn tìm hiểu sâu hơn về phương pháp giảng dạy đứng sau, ghé Nền tảng học thuật nhé!'],
      ],
      cta: { label: '🎓 Xem Nền tảng học thuật', href: 'truong-hoc-thuat.html' },
    },
    board: {
      avatar: 'assets/icons/icon-192.png',
      lines: [
        ['📋 Bảng thông tin', 'Sảnh 3D là hub thử nghiệm kết nối tới mọi trò chơi trong vũ trụ BizOn Bật Nghiệp.'],
        ['📋 Bảng thông tin', '5 game hiện có: Hộ Chiếu Thương Hiệu, Game Bật Nghiệp, BizOn Arcade, Go Global, Gánh Hàng Khởi Nghiệp.'],
        ['📋 Bảng thông tin', 'Toàn bộ chạy thẳng trong trình duyệt bằng three.js, không cần cài đặt gì cả.'],
      ],
      cta: null,
    },
  };

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
  var promptEl, interactBtn, dlgEl, dlgName, dlgText, dlgNextBtn, dlgCtaBtn, dlgAvatar;
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

  // Biển hiệu dùng chung cho cửa vào game lẫn các vật thể tương tác khác
  // (máy hát, bảng thông tin): mái vòm màu riêng + icon lớn + nhãn, vẽ hết
  // vào một canvas texture duy nhất cho gọn (không cần model 3D).
  function makeSignTexture(icon, label, color) {
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

  var VISITED_KEY = 'bizon-hub3d-visited';

  function getVisited() {
    try { return JSON.parse(localStorage.getItem(VISITED_KEY) || '[]'); } catch (e) { return []; }
  }
  function markVisited(url) {
    try {
      var v = getVisited();
      if (v.indexOf(url) === -1) { v.push(url); localStorage.setItem(VISITED_KEY, JSON.stringify(v)); }
    } catch (e) {}
  }

  function buildDoors() {
    GAMES.forEach(function (g, i) {
      var angle = (i / GAMES.length) * Math.PI * 2 - Math.PI / 2;
      var spr = makeSprite(makeSignTexture(g.icon, g.label, g.color), 2.0, 2.7);
      spr.position.set(Math.cos(angle) * DOOR_RADIUS, 0, Math.sin(angle) * DOOR_RADIUS);
      scene.add(spr);
      interactables.push({
        pos: spr.position,
        dist: DOOR_DIST,
        promptAction: 'vào ' + g.label.toLowerCase(),
        buttonLabel: '🚪 Vào ' + g.label,
        // Chuyển cảnh mờ dần rồi mới điều hướng, thay vì nhảy trang đột ngột.
        // Ghi nhận đã ghé qua game này trước khi rời trang, để Bảng thành
        // tích còn dữ liệu đọc lại ở lần quay về Sảnh sau.
        activate: function () {
          markVisited(g.url);
          fadeEl.classList.add('on');
          setTimeout(function () { location.href = g.url; }, 420);
        },
      });
    });
  }

  var jukeboxAudio = null, musicPlaying = false, jukeboxInteractable = null;

  function toggleMusic() {
    if (!jukeboxAudio) {
      jukeboxAudio = new Audio('assets/audio/bizon-theme.mp3');
      jukeboxAudio.loop = true;
      jukeboxAudio.volume = 0.45;
    }
    if (musicPlaying) { jukeboxAudio.pause(); } else { jukeboxAudio.play().catch(function () {}); }
    musicPlaying = !musicPlaying;
    jukeboxInteractable.buttonLabel = musicPlaying ? '⏸️ Tắt nhạc nền' : '🎵 Bật nhạc nền';
    jukeboxInteractable.promptAction = musicPlaying ? 'tắt nhạc nền' : 'bật nhạc nền';
  }

  var tuNpc, tuBob = 0;

  // 3 hoạt động phụ ngoài đi lại + cửa: máy hát, NPC thứ hai (Thầy Tú),
  // bảng thông tin. Đặt ở bán kính nhỏ hơn cửa, xen giữa các góc cửa.
  function buildExtras() {
    var jukeboxPos = new THREE.Vector3(Math.cos(JUKEBOX_ANGLE) * EXTRA_RADIUS, 0, Math.sin(JUKEBOX_ANGLE) * EXTRA_RADIUS);
    var jukeboxSpr = makeSprite(makeSignTexture('🎵', 'Máy hát', '#e85d75'), 1.7, 2.3);
    jukeboxSpr.position.copy(jukeboxPos);
    scene.add(jukeboxSpr);
    jukeboxInteractable = {
      pos: jukeboxSpr.position,
      dist: EXTRA_DIST,
      promptAction: 'bật nhạc nền',
      buttonLabel: '🎵 Bật nhạc nền',
      activate: toggleMusic,
    };
    interactables.push(jukeboxInteractable);

    var tuPos = new THREE.Vector3(Math.cos(TU_ANGLE) * EXTRA_RADIUS, 0.95, Math.sin(TU_ANGLE) * EXTRA_RADIUS);
    tuNpc = makeSprite(new THREE.TextureLoader().load(DIALOGUES.tu.avatar), 1.3, 2.6);
    tuNpc.position.copy(tuPos);
    scene.add(tuNpc);
    interactables.push({
      pos: tuNpc.position,
      dist: NPC_DIST,
      promptAction: 'trò chuyện với Thầy Tú',
      buttonLabel: '🗨️ Nói chuyện',
      activate: function () { openDialogueWith('tu'); },
    });

    var boardPos = new THREE.Vector3(Math.cos(BOARD_ANGLE) * EXTRA_RADIUS, 0, Math.sin(BOARD_ANGLE) * EXTRA_RADIUS);
    var boardSpr = makeSprite(makeSignTexture('📋', 'Bảng thông tin', '#0f5c4e'), 1.7, 2.3);
    boardSpr.position.copy(boardPos);
    scene.add(boardSpr);
    interactables.push({
      pos: boardSpr.position,
      dist: EXTRA_DIST,
      promptAction: 'đọc bảng thông tin',
      buttonLabel: '📋 Đọc bảng tin',
      activate: function () { openDialogueWith('board'); },
    });

    var progressPos = new THREE.Vector3(Math.cos(PROGRESS_ANGLE) * EXTRA_RADIUS, 0, Math.sin(PROGRESS_ANGLE) * EXTRA_RADIUS);
    var progressSpr = makeSprite(makeSignTexture('🏆', 'Bảng thành tích', '#b8860b'), 1.7, 2.3);
    progressSpr.position.copy(progressPos);
    scene.add(progressSpr);
    interactables.push({
      pos: progressSpr.position,
      dist: EXTRA_DIST,
      promptAction: 'xem bảng thành tích',
      buttonLabel: '🏆 Xem thành tích',
      activate: function () { openDialogueWith('progress'); },
    });
  }

  var AVATAR_KEY = 'bizon-hub3d-avatar';
  var fadeEl, charSelectEl;

  function bootstrap() {
    fadeEl = document.getElementById('hub3d-fade');
    charSelectEl = document.getElementById('hub3d-charselect');
    var stored = null;
    try { stored = localStorage.getItem(AVATAR_KEY); } catch (e) {}
    if (stored) {
      charSelectEl.classList.add('off');
      startScene(stored);
      return;
    }
    ['hub3d-pick-nam', 'hub3d-pick-nu'].forEach(function (id) {
      var btn = document.getElementById(id);
      btn.addEventListener('click', function () {
        var tex = btn.dataset.tex;
        try { localStorage.setItem(AVATAR_KEY, tex); } catch (e) {}
        charSelectEl.classList.add('off');
        startScene(tex);
      });
    });
  }

  function startScene(avatarTexPath) {
    canvas = document.getElementById('hub3d-canvas');
    if (!canvas) return;
    promptEl = document.getElementById('hub3d-prompt');
    interactBtn = document.getElementById('hub3d-interact');
    dlgEl = document.getElementById('hub3d-dialogue');
    dlgName = document.getElementById('hub3d-dlg-name');
    dlgText = document.getElementById('hub3d-dlg-text');
    dlgNextBtn = document.getElementById('hub3d-dlg-next');
    dlgCtaBtn = document.getElementById('hub3d-dlg-cta');
    dlgAvatar = document.getElementById('hub3d-dlg-avatar');
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

    player = makeSprite(new THREE.TextureLoader().load(avatarTexPath), PLAYER_W, PLAYER_H);
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
      activate: function () { openDialogueWith('lumina'); },
    });
    buildDoors();
    buildExtras();

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

  var activeDialogue = null;

  function dlgOpen() { return dlgIdx >= 0; }

  // Không phải hội thoại tĩnh như DIALOGUES – nội dung dựng lại mỗi lần mở
  // dựa trên GAMES đã ghé (đọc từ localStorage), nên không khai báo sẵn.
  function buildProgressDialogue() {
    var visited = getVisited();
    var count = 0;
    var lines = GAMES.map(function (g) {
      var done = visited.indexOf(g.url) !== -1;
      if (done) count++;
      return [g.icon + ' ' + g.label, done ? 'Đã ghé qua ✅' : 'Chưa ghé qua'];
    });
    lines.unshift(['🏆 Bảng thành tích', 'Bạn đã ghé qua ' + count + '/' + GAMES.length + ' game trong vũ trụ BizOn.']);
    if (count === GAMES.length) {
      lines.push(['🏆 Bảng thành tích', 'Xuất sắc! Bạn đã khám phá đủ cả 5 game rồi. 🎉']);
    }
    return { avatar: 'assets/icons/icon-192.png', lines: lines, cta: null };
  }

  function openDialogueWith(key) {
    activeDialogue = key === 'progress' ? buildProgressDialogue() : DIALOGUES[key];
    dlgIdx = 0;
    dlgAvatar.src = activeDialogue.avatar;
    if (activeDialogue.cta) {
      dlgCtaBtn.href = activeDialogue.cta.href;
      dlgCtaBtn.textContent = activeDialogue.cta.label;
    }
    renderDialogue();
    dlgEl.classList.add('on');
  }
  function advanceDialogue() {
    dlgIdx++;
    if (dlgIdx >= activeDialogue.lines.length) { closeDialogue(); return; }
    renderDialogue();
  }
  function renderDialogue() {
    var line = activeDialogue.lines[dlgIdx];
    dlgName.textContent = line[0];
    dlgText.textContent = line[1];
    var last = dlgIdx === activeDialogue.lines.length - 1;
    dlgNextBtn.hidden = last;
    dlgCtaBtn.hidden = !(last && activeDialogue.cta);
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

    var isMoving = false;
    if (!dlgOpen()) {
      var mx = 0, mz = 0;
      if (keys.w || keys.arrowup) mz -= 1;
      if (keys.s || keys.arrowdown) mz += 1;
      if (keys.a || keys.arrowleft) mx -= 1;
      if (keys.d || keys.arrowright) mx += 1;
      if (joyActive) { mx += joyVec.x; mz += joyVec.y; }
      var len = Math.hypot(mx, mz);
      isMoving = len > 0.001;
      if (isMoving) {
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
      tuBob += dt;
      tuNpc.position.y = 0.95 + Math.sin(tuBob * 1.6 + Math.PI) * 0.05;

      // Hoạt hình đi bộ giả lập: nhấp nhô + nghiêng + co giãn theo nhịp bước
      // khi đang di chuyển, ease mượt về trạng thái đứng yên khi dừng lại.
      if (isMoving) walkPhase += dt * WALK_FREQ;
      var targetBob = isMoving ? Math.abs(Math.sin(walkPhase)) * BOB_HEIGHT : 0;
      var targetTilt = isMoving ? Math.sin(walkPhase) * TILT_AMOUNT : 0;
      var targetSquash = isMoving ? Math.abs(Math.sin(walkPhase)) * SQUASH_AMOUNT : 0;
      var ease = Math.min(1, dt * 12);
      playerBob += (targetBob - playerBob) * ease;
      playerTilt += (targetTilt - playerTilt) * ease;
      playerSquash += (targetSquash - playerSquash) * ease;
      player.position.y = playerBob;
      player.material.rotation = playerTilt;
      player.scale.set(PLAYER_W * (1 + playerSquash), PLAYER_H * (1 - playerSquash), 1);
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootstrap);
  else bootstrap();
})();
