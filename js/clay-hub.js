/* BizOn – "Hub clay" đi lại dùng chung, tách từ js/office-scene.js (văn phòng Bật
 * Nghiệp) và tham số hoá để Brand Passport 3D / Bến Phù Sa 3D dùng lại cùng một
 * cơ chế trực quan: không gian clay nhìn chéo trên xuống, có nhân vật người chơi
 * đi lại (WASD/mũi tên/joystick/chạm sàn), đến gần NPC hoặc "góc chức năng" rồi
 * bấm E/chạm để tương tác. Module KHÔNG biết gì về luật chơi cụ thể – trang chủ
 * truyền vào toàn bộ nội dung (NPC, góc chức năng, hành động khi mở) qua config.
 * API: window.ClayHub.open(config) / ClayHub.close()
 *
 * config = {
 *   id, title, subtitle, hint, exitLabel,
 *   width, height (kích thước thế giới, mặc định 1600×1000),
 *   floor: màu nền sàn (mặc định be),
 *   decor: [{x,y,w,h,img,radius}]                         // khung ảnh trang trí tĩnh
 *   player: {img, name, tag, x, y}
 *   npcs: [{id,img,fb,accent,icon,name,tag,x,y,talk(api)}] // talk tuỳ chọn – mặc định mở hội thoại tĩnh từ desc
 *   stations: [{id,icon,art,name,desc,x,y,flat,onOpen(api)}]
 *   onClose()
 * }
 * api truyền vào talk()/onOpen(): { dialogue(text, choices), toast(msg), close(), exit() }
 * choices = [{text, primary, onPick()}] – onPick mặc định là close() nếu bỏ qua.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const CSS = `
#chub{position:fixed;inset:0;z-index:70;background:#dfeaf0;font-family:inherit;color:#033337;overflow:hidden;user-select:none}
#chub .w{position:absolute;left:0;top:0;background:radial-gradient(#c5d9e3 1.5px,transparent 1.5px) 0 0/28px 28px,#e6f0f5;will-change:transform}
#chub .wall{position:absolute;left:0;right:0;top:0;height:170px;background:#f2e6d0;box-shadow:inset 0 -14px 0 #e8a04f}
#chub .plaque{position:absolute;top:184px;transform:translateX(-50%);background:rgba(255,255,255,.9);border-radius:16px;padding:6px 20px;font-weight:900;color:#006687;letter-spacing:.04em;text-align:center;white-space:nowrap}
#chub .plaque small{display:block;font-size:11.5px;font-weight:700;letter-spacing:0;color:#033337;opacity:.75}
#chub .deco{position:absolute;overflow:hidden;border:6px solid #6b4a2b;box-shadow:0 10px 16px -6px rgba(0,0,0,.4)}
#chub .deco img{width:100%;height:100%;object-fit:cover;display:block}
#chub .npc,#chub .stn{position:absolute;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;cursor:pointer}
#chub .npc img{height:190px;width:auto;transform-origin:bottom center;animation:chub-idle 2.6s ease-in-out infinite}
#chub .npc.near img,#chub .stn.near .box{filter:drop-shadow(0 0 8px rgba(0,196,255,.9))}
#chub .tag{margin-top:6px;background:#033337;color:#fff;font-size:11px;font-weight:800;padding:3px 10px;border-radius:999px;white-space:nowrap}
#chub .stn .box{width:100px;height:100px;border-radius:50%;background:#fff;box-shadow:0 12px 16px -8px rgba(0,60,80,.4);display:flex;align-items:center;justify-content:center;font-size:42px;overflow:hidden}
#chub .stn .box img{width:100%;height:100%;object-fit:cover}
#chub .stn.flat .box{border-radius:26px;background:#f7ecd9}
#chub .pl{position:absolute;transform:translate(-50%,-100%)}
#chub .pl img{height:210px;width:auto;position:relative;transform-origin:bottom center}
#chub .sh{position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:100px;height:20px;border-radius:50%;background:rgba(15,117,150,.3);filter:blur(2px)}
#chub .hud{position:absolute;top:12px;left:12px;right:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;z-index:2}
#chub .pill{background:rgba(255,255,255,.92);border:2px solid #dbe9f0;border-radius:999px;padding:6px 12px;font-size:13px;font-weight:700}
#chub .hint{position:absolute;bottom:14px;right:14px;background:rgba(3,51,55,.75);color:#fff;font-size:12px;padding:8px 12px;border-radius:12px;max-width:290px;z-index:2}
#chub .joy{position:absolute;bottom:28px;left:28px;width:116px;height:116px;border-radius:50%;background:rgba(255,255,255,.35);border:4px solid rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;touch-action:none;z-index:2}
#chub .thumb{width:50px;height:50px;border-radius:50%;background:#fff;box-shadow:inset -4px -4px 8px rgba(0,0,0,.1),4px 4px 12px rgba(0,0,0,.15)}
#chub .mk{position:absolute;width:32px;height:32px;margin:-16px;border-radius:50%;border:4px solid #00c4ff;display:none}
#chub .dlg{position:absolute;left:16px;right:16px;bottom:20px;max-width:780px;margin:0 auto;background:#fff;border:4px solid #dbe9f0;border-radius:28px;box-shadow:10px 10px 30px rgba(0,60,80,.15);padding:20px;display:flex;gap:18px;align-items:flex-start;z-index:3}
#chub .dlg .av{height:150px;width:auto;flex-shrink:0}
#chub .dlg .ic{width:104px;height:104px;border-radius:26px;background:#f4faff;display:flex;align-items:center;justify-content:center;font-size:52px;flex-shrink:0}
#chub .dlg h3{margin:0 0 4px;font-size:18px;font-weight:900;color:#006687}
#chub .dlg p{margin:0 0 12px;font-size:14.5px;line-height:1.5;min-height:40px;text-wrap:pretty;white-space:pre-line}
#chub .ch{display:flex;flex-direction:column;gap:8px}
#chub .ch button{text-align:left;padding:11px 14px;border:2px solid #dbe9f0;background:#f4faff;border-radius:14px;font:inherit;font-weight:600;font-size:14px;cursor:pointer;color:inherit}
#chub .ch button:hover{background:#e0f4fb}
#chub .ch button.p{align-self:flex-end;background:#006687;color:#fff;border-color:#006687;font-weight:800}
#chub .toast{position:absolute;top:60px;right:14px;background:#033337;color:#fff;padding:10px 14px;border-radius:14px;font-size:13px;z-index:4;transition:.3s;opacity:0;transform:translateY(-20px);max-width:320px}
#chub .toast.on{opacity:1;transform:none}
#chub .skip{margin-left:auto;background:#006687;color:#fff;border:0;border-radius:999px;padding:7px 14px;font:inherit;font-weight:800;cursor:pointer}
@keyframes chub-idle{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@media (max-width:640px){#chub .dlg{flex-direction:column;align-items:center;padding:12px}#chub .dlg .av{height:96px}#chub .npc img{height:150px}#chub .pl img{height:165px}}`;

  let activeClose = null;

  function open(cfg) {
    if (activeClose) activeClose();
    // Cờ toàn cục để các vòng render ba.js khác (bp3d.js, js/bps3d.js) tạm
    // dừng khi hub đang mở toàn màn hình phía trên – tránh tranh CPU/GPU với
    // animation loop của hub.
    window.__clayHubOpen = true;
    if (!document.getElementById('chub-css')) { const st = document.createElement('style'); st.id = 'chub-css'; st.textContent = CSS; document.head.appendChild(st); }
    const W = cfg.width || 1600, H = cfg.height || 1000;
    const root = document.createElement('div'); root.id = 'chub';
    const decor = (cfg.decor || []).map(d => `<div class="deco" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;height:${d.h}px;border-radius:${d.radius || 14}px"><img src="${d.img}" alt=""></div>`).join('');
    root.innerHTML = `
      <div class="w" style="width:${W}px;height:${H}px">
        <div class="wall"></div>
        ${decor}
        <div class="plaque" style="left:${W / 2}px">${cfg.title || ''}${cfg.subtitle ? `<small>${cfg.subtitle}</small>` : ''}</div>
        <div class="npcs"></div>
        <div class="pl"><div class="sh"></div><img class="pi" src="${cfg.player.img}" alt="${cfg.player.name || ''}"><div style="text-align:center;margin-top:4px"><span class="pill" style="font-size:12px;color:#006687">${cfg.player.name || ''}</span></div></div>
        <div class="mk"></div>
      </div>
      <div class="hud"><span class="pill title">${cfg.title || ''}</span><button class="skip">${cfg.exitLabel || '✕'}</button></div>
      <div class="hint">${cfg.hint || ''}</div>
      <div class="toast"></div>
      <div class="joy"><div class="thumb"></div></div>`;
    document.body.appendChild(root);
    const q = sel => root.querySelector(sel);
    const world = q('.w'), player = q('.pl'), pimg = q('.pi'), npcsEl = q('.npcs'), marker = q('.mk'), joy = q('.joy'), thumb = q('.thumb'), toastEl = q('.toast');

    const entities = {};
    const addEntity = (kind, def) => {
      const el = document.createElement('div'); el.className = kind; el.dataset.id = def.id;
      el.style.left = def.x + 'px'; el.style.top = def.y + 'px';
      if (kind === 'stn' && def.flat) el.classList.add('flat');
      if (kind === 'npc') {
        el.innerHTML = `<img src="${def.img}" alt="${def.name}"${def.fb ? ` onerror="this.onerror=null;this.src='${def.fb}'"` : ''} style="animation-delay:${-Math.random() * 3}s"><span class="tag"${def.accent ? ` style="background:${def.accent}"` : ''}>${def.icon ? def.icon + ' ' : ''}${def.name}</span>`;
      } else {
        el.innerHTML = `<div class="box">${def.art ? `<img src="${def.art}" alt="" onerror="this.outerHTML='${def.icon || ''}'">` : (def.icon || '')}</div><span class="tag" style="background:#006687">${def.name}</span>`;
      }
      el.onclick = e => { e.stopPropagation(); talk(def.id); };
      npcsEl.appendChild(el); entities[def.id] = def;
    };
    (cfg.npcs || []).forEach(n => addEntity('npc', n));
    (cfg.stations || []).forEach(s => addEntity('stn', Object.assign({}, s, { station: true })));

    let px = cfg.player.x ?? W / 2, py = cfg.player.y ?? H / 2, vec = { x: 0, y: 0 }, keys = {}, target = null, facing = 1,
      drag = false, pid = null, jc = {}, nearId = null, camX = 0, camY = 0, dlg = null, done = false, last = performance.now(), toastT, typeT, raf;
    const toast = m => { toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 3200); };
    const type = (el, text, cb) => { clearInterval(typeT); el.textContent = ''; let i = 0; typeT = setInterval(() => { i += 2; el.textContent = text.slice(0, i); if (i >= text.length) { clearInterval(typeT); cb && cb(); } }, 16); };
    const closeDlg = () => { clearInterval(typeT); if (dlg) { dlg.remove(); dlg = null; } };
    function openDlg(c, text, choices) {
      closeDlg(); dlg = document.createElement('div'); dlg.className = 'dlg';
      dlg.innerHTML = `${c.station ? `<div class="ic">${c.art ? `<img src="${c.art}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:26px" onerror="this.outerHTML='${c.icon || ''}'">` : (c.icon || '')}</div>` : `<img class="av" src="${c.img}" alt=""${c.fb ? ` onerror="this.onerror=null;this.src='${c.fb}'"` : ''}>`}<div style="flex:1;min-width:0"><h3${c.accent ? ` style="color:${c.accent}"` : ''}>${c.name}</h3><p></p><div class="ch"></div></div>`;
      root.appendChild(dlg);
      const box = dlg.querySelector('.ch');
      type(dlg.querySelector('p'), text, () => (choices || []).forEach(ch => { const b = document.createElement('button'); if (ch.primary) b.className = 'p'; b.textContent = ch.text; b.onclick = () => (ch.onPick || closeDlg)(); box.appendChild(b); }));
    }
    const bye = { text: cfg.byeLabel || 'OK', primary: true, onPick: closeDlg };
    const api = { dialogue: openDlg, toast, close: closeDlg, exit: () => finish() };
    function talk(id) {
      if (dlg || done) return; const c = entities[id]; if (!c) return;
      if (Math.hypot(c.x - px, c.y - py) > 240) { target = { x: c.x + (px < c.x ? -140 : 140), y: c.y + 30, then: () => talk(id) }; marker.style.display = 'block'; marker.style.left = target.x + 'px'; marker.style.top = target.y + 'px'; return; }
      if (c.station) { if (c.onOpen) return c.onOpen(api); return openDlg(c, c.desc || '', [bye]); }
      if (c.talk) return c.talk(api);
      return openDlg(c, c.desc || c.name, [bye]);
    }
    function finish() {
      if (done) return; done = true; closeDlg(); cancelAnimationFrame(raf); root.remove(); activeClose = null;
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
      window.__clayHubOpen = false;
      cfg.onClose && cfg.onClose();
    }
    activeClose = finish;
    q('.skip').onclick = () => finish();
    joy.addEventListener('pointerdown', e => { drag = true; pid = e.pointerId; joy.setPointerCapture(pid); const r = joy.getBoundingClientRect(); jc = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    joy.addEventListener('pointermove', e => { if (!drag || e.pointerId !== pid) return; let dx = e.clientX - jc.x, dy = e.clientY - jc.y, d = Math.hypot(dx, dy); if (d > 46) { dx *= 46 / d; dy *= 46 / d; } thumb.style.transform = `translate(${dx}px,${dy}px)`; vec = { x: dx / 46, y: dy / 46 }; target = null; });
    const jr = e => { if (e.pointerId !== pid) return; drag = false; pid = null; thumb.style.transform = ''; vec = { x: 0, y: 0 }; };
    joy.addEventListener('pointerup', jr); joy.addEventListener('pointercancel', jr);
    const kd = e => { keys[e.key.toLowerCase()] = true; if (e.key.toLowerCase() === 'e' && nearId && !dlg) talk(nearId); if (e.key === 'Escape') closeDlg(); };
    const ku = e => { keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    world.addEventListener('pointerdown', e => { if (dlg) return; const r = world.getBoundingClientRect(); target = { x: e.clientX - r.left, y: e.clientY - r.top }; marker.style.display = 'block'; marker.style.left = target.x + 'px'; marker.style.top = target.y + 'px'; });

    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!dlg) {
        let vx = vec.x, vy = vec.y;
        if (!drag) { const kx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0), ky = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0); if (kx || ky) { vx = kx; vy = ky; target = null; } }
        if (target) { const dx = target.x - px, dy = target.y - py, d = Math.hypot(dx, dy); if (d < 8) { const t = target.then; target = null; marker.style.display = 'none'; t && t(); } else { vx = dx / d; vy = dy / d; } }
        const sp = 380 * dt, l = Math.hypot(vx, vy) || 1, mv = Math.min(1, Math.hypot(vx, vy));
        px = clamp(px + vx / l * mv * sp, 60, W - 60); py = clamp(py + vy / l * mv * sp, 300, H - 40);
        if (Math.abs(vx) > 0.05) facing = vx < 0 ? -1 : 1;
        pimg.style.transform = mv > 0.05 ? `scaleX(${facing}) translateY(${Math.abs(Math.sin(now / 85)) * -7}px)` : `scaleX(${facing})`;
      }
      player.style.left = px + 'px'; player.style.top = py + 'px';
      const vw = root.clientWidth, vh = root.clientHeight;
      const tx = clamp(px - vw / 2, 0, Math.max(0, W - vw)), ty = clamp(py - vh / 2 - 60, 0, Math.max(0, H - vh));
      camX += (tx - camX) * Math.min(1, dt * 6); camY += (ty - camY) * Math.min(1, dt * 6);
      world.style.transform = `translate3d(${-camX}px,${-camY}px,0)`;
      nearId = null; let best = 200;
      for (const [id, c] of Object.entries(entities)) { const d = Math.hypot(c.x - px, c.y - py); if (d < best) { best = d; nearId = id; } }
      npcsEl.querySelectorAll('[data-id]').forEach(el => el.classList.toggle('near', el.dataset.id === nearId));
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
  }

  window.ClayHub = { open, close: () => activeClose && activeClose() };
})();
