/* BizOn · Góc chức năng trong Văn phòng điều hành · plugin cho game.html
 * Nạp SAU js/engine.js, js/app.js, js/office-scene.js:  <script src="js/office-stations.js"></script>
 * Mở ngay trong văn phòng (#bzo), dùng đúng dữ liệu & luật của game:
 *   Cửa hàng + Kho đồ (SHOP_ITEMS_LIST, skillEffect shopMul, buy/toggleBoost như app.js)
 *   Cây kỹ năng (SKILLS_LIST, xp − spentXp)      Nhiệm vụ (MISSIONS_LIST, missionStatus, claimMission)
 *   Thành tựu (ACHIEVEMENTS_LIST)                 Bảng xếp hạng (như renderLeaderboard)
 *   Clay Factory Frenzy (3 lượt/vòng, 30 giây, thưởng min(60, điểm×2) tr₫, điểm đổi quà ×10)
 * API: BizonStations.can(id), BizonStations.open(id, ctx{root, hud, toast, openTab})
 */
(function () {
  'use strict';
  const tr = (vi, en) => (typeof T === 'function' ? T(vi, en) : vi);
  const gs = () => (typeof S !== 'undefined' ? S : null);
  const fmt = m => (typeof money === 'function' ? money(m) : Math.round(m) + 'tr₫');
  const has = n => typeof window[n] === 'function';
  const call = (n, ...a) => { try { if (has(n)) return window[n](...a); } catch (e) { console.warn(n, e); } };
  const commit = () => { call('save'); call('renderAll'); };
  const party = () => call('createConfetti');
  const list = n => { try { return typeof window[n] === 'function' ? window[n]() : []; } catch (e) { return []; } };
  const shopMul = s => { try { return typeof skillEffect === 'function' ? skillEffect(s, 'shopMul', 1) : 1; } catch (e) { return 1; } };
  const XPL = typeof XP_PER_LEVEL !== 'undefined' ? XP_PER_LEVEL : 100;

  const CSS = `
#bzo .bzs-panel{position:absolute;inset:0;z-index:6;background:rgba(3,51,55,.45);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:14px}
#bzo .bzs-card{background:#fff;border:4px solid #dbe9f0;border-radius:28px;box-shadow:10px 10px 30px rgba(0,60,80,.2);width:100%;max-width:760px;max-height:92vh;display:flex;flex-direction:column;overflow:hidden}
#bzo .bzs-hd{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:2px solid #eef4f8}
#bzo .bzs-hd .ic{width:52px;height:52px;border-radius:50%;background:#f4faff;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0}
#bzo .bzs-hd h3{margin:0;font-size:19px;font-weight:900;color:#006687}
#bzo .bzs-hd p{margin:2px 0 0;font-size:12px;color:#5d6770}
#bzo .bzs-x{margin-left:auto;width:36px;height:36px;border-radius:50%;border:0;background:#f4faff;font-size:18px;font-weight:900;color:#033337;cursor:pointer;flex-shrink:0}
#bzo .bzs-bd{padding:16px 18px;overflow:auto;display:flex;flex-direction:column;gap:10px}
#bzo .bzs-ft{padding:10px 18px 14px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;border-top:2px solid #eef4f8}
#bzo .bzs-row{display:flex;align-items:center;gap:12px;background:#fff;border:3px solid #eef4f8;border-radius:20px;padding:12px}
#bzo .bzs-row.on{border-color:#9fd8ea}
#bzo .bzs-row.off{opacity:.62}
#bzo .bzs-row .em{font-size:30px;width:44px;text-align:center;flex-shrink:0}
#bzo .bzs-row img.em{width:52px;height:52px;border-radius:14px;object-fit:cover}
#bzo .bzs-row b{display:block;font-size:14px;color:#033337}
#bzo .bzs-row small{display:block;font-size:11.5px;color:#5d6770;line-height:1.4;text-wrap:pretty}
#bzo .bzs-row .rw{font-size:11px;font-weight:800;color:#006687;margin-top:2px}
#bzo .bzs-tag{display:inline-block;font-size:10px;font-weight:900;padding:2px 8px;border-radius:99px;margin-left:6px;vertical-align:2px}
#bzo .bzs-btn{border:0;border-radius:14px;padding:9px 14px;font:inherit;font-weight:800;font-size:13px;cursor:pointer;background:#006687;color:#fff;flex-shrink:0;white-space:nowrap}
#bzo .bzs-btn.s{background:#f4faff;color:#006687;border:2px solid #dbe9f0}
#bzo .bzs-btn.g{background:#1f9a63}
#bzo .bzs-btn[disabled]{opacity:.45;cursor:default}
#bzo .bzs-sum{display:flex;gap:8px;flex-wrap:wrap}
#bzo .bzs-sum span{background:#f4faff;border-radius:99px;padding:6px 12px;font-size:12.5px;font-weight:800;color:#033337}
#bzo .bzs-h{margin:6px 0 0;font-size:11px;font-weight:900;letter-spacing:.06em;color:rgba(3,51,55,.5)}
#bzo .bzs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
#bzo .bzs-tile{background:#fff;border:3px solid #eef4f8;border-radius:20px;padding:12px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px}
#bzo .bzs-tile .em{font-size:34px}
#bzo .bzs-tile b{font-size:12.5px;color:#033337}
#bzo .bzs-tile small{font-size:10.5px;color:#5d6770;line-height:1.35}
#bzo .bzs-tile.off{filter:grayscale(1);opacity:.55}
#bzo .bzs-msg{font-size:12.5px;font-weight:800;border-radius:14px;padding:9px 12px;background:#fff4e8;color:#a8520f}
#bzo .bzs-msg.ok{background:#e6f7ef;color:#1f7a50}
#bzo .bzs-tree{position:relative;height:330px;background:linear-gradient(#f4faff,#eaf5ea);border-radius:22px;overflow:hidden}
#bzo .bzs-tree svg{position:absolute;inset:0;width:100%;height:100%}
#bzo .bzs-node{position:absolute;transform:translate(-50%,-50%);width:74px;height:74px;border-radius:50%;border:5px solid #fff;display:flex;align-items:center;justify-content:center;font-size:30px;cursor:pointer;box-shadow:0 8px 14px -6px rgba(0,60,80,.45);background:#dfe7ec}
#bzo .bzs-node.own{background:#f4c152}
#bzo .bzs-node.can{background:#9fd8ea;animation:bzs-glow 1.6s ease-in-out infinite}
#bzo .bzs-node.sel{outline:4px solid #006687}
#bzo .bzs-node i{position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);font-style:normal;font-size:10.5px;font-weight:900;color:#033337;background:#fff;border-radius:99px;padding:1px 7px;white-space:nowrap}
#bzo .bzs-belt{position:relative;height:150px;border-radius:22px;background:repeating-linear-gradient(90deg,#3a3f47 0 26px,#434952 26px 52px);overflow:hidden;box-shadow:inset 0 -12px 0 rgba(0,0,0,.25)}
#bzo .bzs-belt .it{position:absolute;top:44px;left:-70px;font-size:48px;cursor:pointer;animation:bzs-move linear forwards;filter:drop-shadow(0 6px 4px rgba(0,0,0,.35))}
#bzo .bzs-belt .fb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:#fff;text-align:center;padding:10px}
#bzo .bzs-tgt{display:flex;align-items:center;gap:10px;background:#fff4e8;border-radius:18px;padding:10px 14px;font-weight:900;color:#a8520f}
#bzo .bzs-tgt span{font-size:40px}
@keyframes bzs-move{to{left:calc(100% + 20px)}}
@keyframes bzs-glow{0%,100%{box-shadow:0 0 0 0 rgba(0,196,255,.5),0 8px 14px -6px rgba(0,60,80,.45)}50%{box-shadow:0 0 0 10px rgba(0,196,255,0),0 8px 14px -6px rgba(0,60,80,.45)}}
@media (max-width:640px){#bzo .bzs-row{flex-wrap:wrap}#bzo .bzs-tree{height:300px}#bzo .bzs-node{width:62px;height:62px;font-size:26px}}`;
  const css = () => { if (document.getElementById('bzs-css')) return; const st = document.createElement('style'); st.id = 'bzs-css'; st.textContent = CSS; document.head.appendChild(st); };

  const UI = { '🛍️': 'shop', '🌳': 'skills', '📋': 'missions', '🎖️': 'achievements', '🏆': 'leaderboard', '🏭': 'minigame' };
  function panel(ctx, icon, title, sub, tab) {
    css();
    const el = document.createElement('div'); el.className = 'bzs-panel';
    el.innerHTML = `<div class="bzs-card"><div class="bzs-hd"><div class="ic">${UI[icon] ? `<img src="assets/ui/${UI[icon]}.png" alt="" style="width:52px;height:52px;border-radius:50%" onerror="this.outerHTML='${icon}'">` : icon}</div><div style="min-width:0"><h3>${title}</h3><p>${sub}</p></div><button class="bzs-x" aria-label="${tr('Đóng', 'Close')}">×</button></div>${tab && window.BizonArt && BizonArt[tab] ? `<div style="height:120px;flex-shrink:0;overflow:hidden"><img src="${BizonArt[tab]}" alt="" style="width:100%;height:100%;object-fit:cover;display:block"></div>` : ''}<div class="bzs-bd"></div>
      <div class="bzs-ft">${tab ? `<button class="bzs-btn s" data-tab>${tr('Mở tab đầy đủ trong game', 'Open full tab in game')} ↗</button>` : ''}<button class="bzs-btn" data-close>${tr('Quay lại văn phòng', 'Back to office')}</button></div></div>`;
    const bd = el.querySelector('.bzs-bd');
    const api = { el, bd, cleanup: [] };
    api.close = () => { api.cleanup.forEach(f => f()); el.remove(); ctx.hud && ctx.hud(); };
    el.querySelector('.bzs-x').onclick = api.close; el.querySelector('[data-close]').onclick = api.close;
    el.addEventListener('pointerdown', e => { e.stopPropagation(); if (e.target === el) api.close(); });
    const tb = el.querySelector('[data-tab]'); if (tb) tb.onclick = () => { api.close(); ctx.openTab && ctx.openTab(tab); };
    ctx.root.appendChild(el);
    return api;
  }
  const flash = (bd, text, ok) => { let m = bd.querySelector('.bzs-msg'); if (!m) { m = document.createElement('div'); bd.prepend(m); } m.className = 'bzs-msg' + (ok ? ' ok' : ''); m.textContent = text; };

  // ---------- Cửa hàng + Kho đồ ----------
  function shop(ctx) {
    const p = panel(ctx, '🛍️', tr('Cửa hàng', 'Shop'), tr('Dùng ví ảo của đội để mua vật phẩm tăng lực.', 'Use the team wallet to buy power-ups.'), 'shop');
    const TYPE = { blueprint: [tr('Bản thiết kế', 'Blueprint'), '#e3f2ff', '#006687'], booster: [tr('Tăng lực', 'Booster'), '#fff1dc', '#a8520f'], consumable: [tr('Tiêu hao', 'Consumable'), '#efe6fb', '#5a32a3'] };
    let msg = null;
    function draw() {
      const s = gs(), mul = shopMul(s), items = list('SHOP_ITEMS_LIST');
      s.items ??= {}; s.activeBoosts ??= [];
      const owned = Object.entries(s.items).filter(([, q]) => q > 0);
      p.bd.innerHTML = (msg ? `<div class="bzs-msg${msg[1] ? ' ok' : ''}">${msg[0]}</div>` : '') +
        `<div class="bzs-sum"><span>💰 ${fmt(s.balance)}</span>${mul < 1 ? `<span>🤝 ${tr('Giảm', 'Discount')} ${Math.round((1 - mul) * 100)}% ${tr('nhờ Đàm phán chiến lược', 'from Strategic Negotiation')}</span>` : ''}<span>🎒 ${owned.reduce((a, [, q]) => a + q, 0)} ${tr('vật phẩm', 'items')}</span></div>` +
        items.map(it => {
          const price = Math.round(it.price * mul), t = TYPE[it.type] || TYPE.booster, q = s.items[it.id] || 0;
          return `<div class="bzs-row">${it.img ? `<img class="em" src="${it.img}" alt="" onerror="this.outerHTML='<span class=&quot;em&quot;>${it.icon}</span>'">` : `<span class="em">${it.icon}</span>`}
            <div style="flex:1;min-width:0"><b>${it.name}<span class="bzs-tag" style="background:${t[1]};color:${t[2]}">${t[0]}</span>${q ? `<span class="bzs-tag" style="background:#f4faff;color:#033337">×${q}</span>` : ''}</b><small>${it.desc}</small></div>
            <button class="bzs-btn" data-buy="${it.id}"${s.balance < price ? ' disabled' : ''}>${price}tr₫</button></div>`;
        }).join('') +
        `<p class="bzs-h">🎒 ${tr('KHO ĐỒ CỦA ĐỘI', 'TEAM INVENTORY')}</p>` +
        (owned.length ? `<div class="bzs-grid">${owned.map(([id, q]) => {
          const it = items.find(x => x.id === id) || { icon: '📦', name: id, type: 'booster' }, bp = it.type === 'blueprint', on = s.activeBoosts.includes(id);
          return `<div class="bzs-tile"><span class="em">${it.icon}</span><b>${it.name}</b><small>×${q}${on ? tr(' · ĐÃ BẬT', ' · ACTIVE') : ''}</small>
            ${bp ? `<small style="font-weight:800;color:#1f7a50">${tr('Hiệu lực vĩnh viễn ✅', 'Permanent ✅')}</small>` : `<button class="bzs-btn${on ? ' s' : ''}" data-use="${id}">${on ? tr('Tắt kích hoạt', 'Deactivate') : tr('Sử dụng 🚀', 'Use 🚀')}</button>`}</div>`;
        }).join('')}</div>` : `<small style="color:#5d6770">${tr('Chưa có vật phẩm nào trong kho.', 'No items in the inventory yet.')}</small>`);
      p.bd.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
        const it = items.find(x => x.id === b.dataset.buy), price = Math.round(it.price * shopMul(s));
        if (s.balance < price) { msg = [tr('Ví ảo của đội không đủ ' + price + 'tr₫.', "The team wallet doesn't have " + price + 'm₫.')]; return draw(); }
        s.balance -= price; s.items[it.id] = (s.items[it.id] || 0) + 1; s.itemsBought = (s.itemsBought || 0) + 1;
        commit(); party(); msg = [tr('Đã mua ', 'Bought ') + it.name + ' · −' + price + 'tr₫', 1]; ctx.hud && ctx.hud(); draw();
      });
      p.bd.querySelectorAll('[data-use]').forEach(b => b.onclick = () => {
        const id = b.dataset.use, i = s.activeBoosts.indexOf(id);
        if (i >= 0) { s.activeBoosts.splice(i, 1); msg = [tr('Đã tắt kích hoạt vật phẩm', 'Item deactivated'), 1]; }
        else { s.activeBoosts.push(id); const it = items.find(x => x.id === id); if ((s.items[id] || 0) > 0 && it && it.type === 'consumable') s.items[id]--; msg = [tr('✨ Vật phẩm đã được kích hoạt! Áp dụng ở vòng kế tiếp.', '✨ Item activated! Applies next round.'), 1]; }
        commit(); draw();
      });
    }
    draw();
  }

  // ---------- Cây kỹ năng ----------
  function skills(ctx) {
    const p = panel(ctx, '🌳', tr('Cây kỹ năng', 'Skill tree'), tr('Mở khóa bằng XP tích lũy từ kết quả kinh doanh.', 'Unlock with XP earned from business results.'), 'skills');
    const POS = { SK_FIN1: [50, 82], SK_MKT1: [24, 56], SK_OPS1: [76, 56], SK_NEG1: [30, 22], SK_AI1: [70, 22] };
    const EDGES = [['SK_FIN1', 'SK_MKT1'], ['SK_FIN1', 'SK_OPS1'], ['SK_MKT1', 'SK_NEG1'], ['SK_OPS1', 'SK_AI1']];
    let sel = null, msg = null;
    function draw() {
      const s = gs(), sks = list('SKILLS_LIST'); s.skills ??= [];
      const avail = (s.xp || 0) - (s.spentXp || 0);
      const pos = (id, i) => POS[id] || [15 + (i % 4) * 23, 85 - Math.floor(i / 4) * 30];
      const edges = EDGES.filter(([a, b]) => sks.some(x => x.id === a) && sks.some(x => x.id === b));
      const cur = sks.find(x => x.id === sel);
      p.bd.innerHTML = (msg ? `<div class="bzs-msg${msg[1] ? ' ok' : ''}">${msg[0]}</div>` : '') +
        `<div class="bzs-sum"><span>⭐ ${tr('XP khả dụng', 'Available XP')}: ${avail.toLocaleString('vi-VN')}</span><span>🏅 ${tr('Cấp', 'Level')} ${1 + Math.floor((s.xp || 0) / XPL)}</span><span>🌿 ${s.skills.length}/${sks.length} ${tr('kỹ năng', 'skills')}</span></div>
        <div class="bzs-tree"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M50 100 L50 82" stroke="#b98555" stroke-width="5"/>${edges.map(([a, b]) => { const A = pos(a), B = pos(b); return `<path d="M${A[0]} ${A[1]} Q${(A[0] + B[0]) / 2} ${A[1] - 4} ${B[0]} ${B[1]}" stroke="#b98555" stroke-width="3" fill="none"/>`; }).join('')}</svg>
        ${sks.map((sk, i) => { const [x, y] = pos(sk.id, i), own = s.skills.includes(sk.id), can = !own && avail >= sk.cost;
          return `<div class="bzs-node${own ? ' own' : can ? ' can' : ''}${sel === sk.id ? ' sel' : ''}" data-sk="${sk.id}" style="left:${x}%;top:${y}%" title="${sk.name}">${sk.icon}<i>${own ? '✅' : sk.cost + ' XP'}</i></div>`; }).join('')}</div>` +
        (cur ? `<div class="bzs-row on"><span class="em">${cur.icon}</span><div style="flex:1;min-width:0"><b>${cur.name}</b><small>${cur.desc}</small></div>
          ${s.skills.includes(cur.id) ? '<span style="font-size:22px">✅</span>' : `<button class="bzs-btn" data-un="${cur.id}"${avail < cur.cost ? ' disabled' : ''}>${tr('Mở khóa', 'Unlock')} · ${cur.cost} XP</button>`}</div>`
          : `<small style="color:#5d6770">${tr('Chạm vào một nhánh để xem hiệu ứng. Nhánh sáng xanh là đủ XP để mở.', 'Tap a node to see its effect. Glowing nodes are affordable.')}</small>`);
      p.bd.querySelectorAll('[data-sk]').forEach(n => n.onclick = () => { sel = n.dataset.sk; msg = null; draw(); });
      const u = p.bd.querySelector('[data-un]');
      if (u) u.onclick = () => {
        const sk = sks.find(x => x.id === u.dataset.un);
        if ((s.xp || 0) - (s.spentXp || 0) < sk.cost) { msg = [tr('Chưa đủ XP – hãy hoàn thành thêm vòng chơi!', 'Not enough XP yet – complete more rounds!')]; return draw(); }
        s.spentXp = (s.spentXp || 0) + sk.cost; s.skills.push(sk.id); commit(); party(); msg = [tr('Đã mở khóa ', 'Unlocked ') + sk.name, 1]; draw();
      };
    }
    draw();
  }

  // ---------- Nhiệm vụ ----------
  function missions(ctx) {
    const p = panel(ctx, '📋', tr('Nhiệm vụ', 'Missions'), tr('Hoàn thành nhiệm vụ để nhận thưởng tiền ảo và XP.', 'Complete missions for virtual cash and XP.'), 'missions');
    let msg = null;
    function draw() {
      const s = gs(), ms = list('MISSIONS_LIST'); s.missionsClaimed ??= [];
      const st = m => { try { return typeof missionStatus === 'function' ? missionStatus(s, m) : 'pending'; } catch (e) { return 'pending'; } };
      const ready = ms.filter(m => st(m) === 'ready').length;
      p.bd.innerHTML = (msg ? `<div class="bzs-msg ok">${msg}</div>` : '') +
        `<div class="bzs-sum"><span>✅ ${s.missionsClaimed.length}/${ms.length} ${tr('đã nhận', 'claimed')}</span>${ready ? `<span style="background:#fff1dc;color:#a8520f">🎁 ${ready} ${tr('sẵn sàng nhận', 'ready to claim')}</span>` : ''}</div>` +
        ms.map(m => { const x = st(m);
          return `<div class="bzs-row${x === 'pending' ? ' off' : x === 'claimed' ? ' on' : ''}"><span class="em">${m.icon}</span><div style="flex:1;min-width:0"><b>${m.name}</b><small>${m.desc}</small><div class="rw">🎁 ${m.rewardMoney}tr₫ + ${m.rewardXp} XP</div></div>
            ${x === 'claimed' ? '<span style="font-size:22px">✅</span>' : x === 'ready' ? `<button class="bzs-btn g" data-cl="${m.id}">${tr('Nhận', 'Claim')}</button>` : '<span style="font-size:18px;opacity:.45">🔒</span>'}</div>`; }).join('');
      p.bd.querySelectorAll('[data-cl]').forEach(b => b.onclick = () => {
        const m = ms.find(x => x.id === b.dataset.cl);
        if (typeof claimMission === 'function' && claimMission(s, m.id)) { commit(); party(); msg = `🎁 +${m.rewardMoney}tr₫ · +${m.rewardXp} XP – ${m.name}`; ctx.hud && ctx.hud(); draw(); }
      });
    }
    draw();
  }

  // ---------- Thành tựu ----------
  function achievements(ctx) {
    const s = gs(), all = list('ACHIEVEMENTS_LIST'), got = s.achievements || [];
    const p = panel(ctx, '🎖️', tr('Thành tựu', 'Achievements'), `${got.length}/${all.length} ${tr('huy hiệu đã mở khóa', 'badges unlocked')}`, 'achievements');
    p.bd.innerHTML = `<div class="bzs-grid">${all.map(a => `<div class="bzs-tile${got.includes(a.id) ? '' : ' off'}"><span class="em">${a.icon}</span><b>${a.name}</b><small>${a.desc}</small></div>`).join('')}</div>` +
      (s.finished ? `<div class="bzs-row on"><span class="em">📜</span><div style="flex:1"><b>${tr('Chứng chỉ hoàn thành', 'Certificate of completion')}</b><small>${tr('Mở tab Thành tựu để xem và tải chứng chỉ.', 'Open the Achievements tab to view and download it.')}</small></div></div>` : '');
  }

  // ---------- Bảng xếp hạng ----------
  function leaderboard(ctx) {
    const s = gs(), me = (s.profile && s.profile.teamName) || tr('Đội bạn', 'Your team');
    const totalProfit = (s.history || []).reduce((a, r) => a + r.netProfit, 0);
    const lastShare = (s.history || []).length ? s.history[s.history.length - 1].share : 25;
    const trial = typeof isTrial === 'function' ? isTrial() : !((s.profile && s.profile.classId) || '').trim();
    let rows, note;
    if (trial) {
      rows = [{ name: me + tr(' (Bạn)', ' (You)'), profit: totalProfit, share: lastShare, me: true }, ...(s.competitors || []).map(c => ({ name: c.name, profit: c.profit || 0, share: c.share || 25 }))].sort((a, b) => b.profit - a.profit);
      note = tr('🧪 Chơi thử · so với 3 đối thủ AI (nhập Mã lớp để đua với các đội trong lớp)', '🧪 Trial · vs 3 AI rivals (enter a Class ID to compete with classmates)');
    } else {
      rows = [{ name: me + tr(' (Bạn)', ' (You)'), profit: totalProfit, share: lastShare, me: true }];
      note = tr('🔒 Bảng xếp hạng chéo đội đang tạm khóa — chỉ hiện kết quả của đội bạn', '🔒 Cross-team leaderboard is temporarily locked — showing only your team’s results');
    }
    const medal = i => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i + 1));
    const p = panel(ctx, '🏆', tr('Bảng xếp hạng', 'Leaderboard'), note, 'leaderboard');
    p.bd.innerHTML = rows.map((t, i) => `<div class="bzs-row${t.me ? ' on' : ''}"><span class="em" style="font-size:24px">${medal(i)}</span><div style="flex:1;min-width:0"><b>${t.name}</b><small>$tr('Thị phần', 'Market share')} ${t.share.toFixed(1)}%</small></div><b style="color:${t.profit >= 0 ? '#006687' : '#c8641c'}">${fmt(t.profit)}</b></div>`).join('');
  }

  // ---------- Clay Factory Frenzy ----------
  function minigame(ctx) {
    const ITEMS = ['🏺', '🫖', '🧱', '🪴', '🏆'];
    const p = panel(ctx, '🏭', 'Clay Factory Frenzy', tr('Băng chuyển xư�ng đất sét! Chạm đúng món hàng được đặt để đóng gói. Mỗi vòng chơi được 3 lượt.', 'The clay factory conveyor! Tap the ordered item to pack it. 3 plays per round.'), 'minigame');
    let g = null, last = null;
    const stop = () => { if (g) { g.timers.forEach(clearInterval); g = null; } };
    p.cleanup.push(stop);
    function draw() {
      const s = gs(), plays = s.minigamePlays || 0, out = plays >= 3;
      p.bd.innerHTML = (last ? `<div class="bzs-msg ok">${last}</div>` : '') +
        `<div class="bzs-sum"><span>🎯 ${tr('Điểm', 'Score')}: <b class="sc">0</b></span><span>⏱️ <b class="tm">30</b>s</span><span>🏅 ${tr('Cao nhất', 'Best')}: ${s.minigameBest || 0}</span><span>🐷 ${(s.minigamePoints || 0).toLocaleString('vi-VN')} points</span><span>🎟️ ${tr('Lượt', 'Plays')} <b class="pl">${Math.min(plays, 3)}</b>/3</span></div>
        <div class="bzs-tgt">${tr('Đơn hàng cần đóng gói:', 'Order to pack:')} <span class="tg">❔</span></div>
        <div class="bzs-belt"><div class="fb">${out ? tr('⏳ Hết lượt – commit vòng mới để chơi tiếp', '⏳ Out of attempts – commit a new round to play again') : tr('Bấm Bắt đầu. Chạm đúng món: +1 điểm · sai: −1 điểm. Mỗi điểm = 2tr₫ (tối đa 60tr₫) và 10 points đổi quà.', 'Press Start. Correct: +1 · wrong: −1. Each point = 2m₫ (max 60m₫) and 10 reward points.')}</div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="bzs-btn st"${out ? ' disabled' : ''}>▶️ ${tr('Bắt đầu (lượt', 'Start (play')} ${Math.min(3, plays + 1)}/3)</button>${typeof showRewardShop === 'function' ? `<button class="bzs-btn s rs">🏺 Clay Reward Shop</button>` : ''}</div>`;
      const rs = p.bd.querySelector('.rs'); if (rs) rs.onclick = () => showRewardShop();
      const stb = p.bd.querySelector('.st'); stb.onclick = () => start(stb);
    }
    function start(btn) {
      const s = gs(); if ((s.minigamePlays || 0) >= 3 || g) return;
      s.minigamePlays = (s.minigamePlays || 0) + 1; call('save');
      btn.disabled = true; btn.textContent = '⏳ ' + tr('Đang chơi (lượt', 'Playing (play') + ' ' + s.minigamePlays + '/3)';
      const plEl = p.bd.querySelector('.pl'); if (plEl) plEl.textContent = s.minigamePlays;
      const belt = p.bd.querySelector('.bzs-belt'), sc = p.bd.querySelector('.sc'), tm = p.bd.querySelector('.tm'), tg = p.bd.querySelector('.tg');
      belt.innerHTML = '';
      g = { score: 0, time: 30, target: ITEMS[0], timers: [] };
      const pick = () => { g.target = ITEMS[Math.floor(Math.random() * ITEMS.length)]; tg.textContent = g.target; };
      pick();
      g.timers.push(setInterval(() => { g.time--; tm.textContent = g.time; if (g.time <= 0) end(); }, 1000));
      g.timers.push(setInterval(() => {
        if (!g) return;
        const el = document.createElement('span'); el.className = 'it'; el.textContent = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        el.style.animationDuration = (2.6 + Math.random() * 1.6) + 's'; el.style.top = (22 + Math.random() * 44) + 'px';
        el.onpointerdown = e => { e.stopPropagation(); if (!g) return; if (el.textContent === g.target) { g.score++; pick(); } else g.score = Math.max(0, g.score - 1); sc.textContent = g.score; el.remove(); };
        el.addEventListener('animationend', () => el.remove());
        belt.appendChild(el);
      }, 700));
    }
    function end() {
      if (!g) return; const s = gs(), score = g.score; stop();
      const reward = Math.min(60, score * 2);
      s.balance += reward; s.minigamePoints = (s.minigamePoints || 0) + score * 10;
      if (score > (s.minigameBest || 0)) s.minigameBest = score;
      commit(); if (reward > 0) party(); ctx.hud && ctx.hud();
      last = tr(`🎉 ${score} điểm · +${reward}tr₫ · +${score * 10} points`, `🎉 ${score} points · +${reward}m₫ · +${score * 10} reward points`);
      draw();
    }
    draw();
  }

  // ---------- Báo cáo kết quả (đúng trường report của simulateRound) ----------
  function reports(ctx) {
    const s = gs(), hist = s.history || [];
    const p = panel(ctx, '📊', tr('Báo cáo kết quả', 'Reports'), tr('Dòng tiền, CVP, chi phí và vận hành theo từng vòng.', 'Cash flow, CVP, costs and operations per round.'), 'reports');
    if (!hist.length) { p.bd.innerHTML = `<div class="bzs-row"><span class="em">📭</span><div style="flex:1"><b>${tr('Chưa có báo cáo', 'No reports yet')}</b><small>${tr('Chốt quyết định vòng đầu tiên để có báo cáo kết quả.', 'Commit your first round to get a report.')}</small></div></div>`; return; }
    let sel = hist.length - 1;
    const n = v => (v == null || isNaN(v) ? '–' : Math.round(v).toLocaleString('vi-VN'));
    function draw() {
      const r = hist[sel], d = r.decisions || {};
      const cost = (r.cogs || 0) + (r.marketing || 0) + (r.rd || 0) + (r.fixed || 0) + (r.depreciation || 0) + (r.wageCost || 0) + (r.trainingCost || 0) + (r.holding || 0) + (r.loanInterest || 0) + (r.creditInterest || 0);
      const cell = (l, v, c) => `<div class="bzs-tile"><small>${l}</small><b style="font-size:14px${c ? ';color:' + c : ''}">${v}</b></div>`;
      const line = (l, v) => `<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px dashed #e3edf3"><span>${l}</span><b>${v}</b></div>`;
      p.bd.innerHTML = `<div class="bzs-sum">${hist.map((h, i) => `<button class="bzs-btn${i === sel ? '' : ' s'}" data-r="${i}" style="padding:6px 10px">V${h.round}</button>`).join('')}</div>
        <div class="bzs-row on"><span class="em">${(r.event && r.event.icon) || '📅'}</span><div style="flex:1;min-width:0"><b>${tr('Vòng ', 'Round ')}${r.round}${r.event ? ' · ' + r.event.name : ''}${r.shielded ? ' 🛡️' : ''}</b><small>${tr('Giá', 'Price')} ${n(d.price)}k · ${tr('Sản xuất', 'Production')} ${n(d.production)} · Marketing ${n(d.marketing)}tr · R&D ${n(d.rd)}tr${d.workers ? ' · ' + d.workers + tr(' công nhân', ' workers') : ''}</small></div></div>
        <div class="bzs-grid">${cell(tr('Doanh thu', 'Revenue'), fmt(r.revenue || 0))}${cell(tr('Lợi nhuận ròng', 'Net profit'), fmt(r.netProfit), r.netProfit >= 0 ? '#1f7a50' : '#c8641c')}${cell(tr('Thị phần', 'Share'), (r.share || 0).toFixed(1) + '%')}${cell(tr('Số dư', 'Balance'), fmt(r.balance || 0))}</div>
        <p class="bzs-h">📦 ${tr('SẢN LƯỢNG', 'VOLUME')}</p>
        ${line(tr('Nhu cầu thị trường', 'Market demand'), n(r.demandUnits) + ' sp')}${line(tr('Đã bán', 'Sold'), n(r.sold) + ' sp')}${line(tr('Mất doanh số (thiếu hàng)', 'Lost sales (stock-out)'), n(r.lostSales) + ' sp')}${line(tr('Tồn kho cuối vòng', 'Ending inventory'), n(r.inventory) + ' sp')}${line(tr('Giá thành đơn vị', 'Unit cost'), n(r.unitCost) + 'k')}
        <p class="bzs-h">💸 ${tr('CHI PHÍ', 'COSTS')} · ${fmt(cost)}</p>
        ${line(tr('Giá vốn (COGS)', 'COGS'), fmt(r.cogs || 0))}${line('Marketing', fmt(r.marketing || 0))}${line('R&D', fmt(r.rd || 0))}${line(tr('Chi phí cố định', 'Fixed cost'), fmt(r.fixed || 0))}${line(tr('Khấu hao', 'Depreciation'), fmt(r.depreciation || 0))}${line(tr('Lương + đào tạo', 'Wages + training'), fmt((r.wageCost || 0) + (r.trainingCost || 0)))}${line(tr('Lưu kho', 'Holding'), fmt(r.holding || 0))}${line(tr('Lãi vay + tín dụng', 'Loan + credit interest'), fmt((r.loanInterest || 0) + (r.creditInterest || 0)))}
        <p class="bzs-h">⚙️ ${tr('VẬN HÀN & TÁI CHÍNH', 'OPERATIONS & FINANCE')}</p>
        <div class="bzs-grid">${cell('OEE', n(r.oee) + '%')}${cell(tr('Phế phẩm', 'Defects'), (r.defect || 0).toFixed(1) + '%')}${cell(tr('Trung thành', 'Loyalty'), n(r.brandLoyalty) + '%')}${cell('Quick Ratio', (r.quickRatio || 0).toFixed(2))}${cell('ROI', (r.roi || 0).toFixed(1) + '%')}${cell('XP', '+' + n(r.xpGain))}</div>`;
      p.bd.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { sel = +b.dataset.r; draw(); });
    }
    draw();
  }

  // ---------- Thị trường sống (như renderMarket) ----------
  function market(ctx) {
    const s = gs(); let ev = {}; try { ev = currentEvent(s) || {}; } catch (e) {}
    const last = (s.history || [])[s.history.length - 1], share = last ? last.share : 25;
    const REF = typeof REF_PRICE !== 'undefined' ? REF_PRICE : 150, lastD = last ? last.decisions : { price: REF, marketing: 50, rd: 30 };
    const p = panel(ctx, '📡', tr('Thị trường sống', 'Market Pulse'), tr('Bản tin thị trường – chứa manh mối về đối thủ.', 'The market feed – full of clues about rivals.'), 'market');
    const ticker = [
      `🔴 ${ev.name || ''}: ${ev.desc || ''}`,
      tr('🔵 Alpha Dynamics duy trì chiến lược giá r�i – theo dõi biên lợi nhuận của họ', '🔵 Alpha Dynamics keeps its budget-price strategy – watch their margin'),
      tr(`🟢 Brand Loyalty của đội bạn: ${s.brandLoyalty}% ${s.brandLoyalty >= 70 ? '(khách hàng gắn bó!)' : '(cần đầu tư thương hiệu)'}`, `🟢 Your team's Brand Loyalty: ${s.brandLoyalty}% ${s.brandLoyalty >= 70 ? '(customers are loyal!)' : '(needs brand investment)'}`),
      tr('🟡 Star Clay Co. đẪy mạnh phân khúc cao cấp – cơ hội ở phân khúc phổ thông', '🟡 Star Clay Co. is pushing the premium segment – an opening in the mass market'),
      s.loan > 0 ? tr(`🏦 Đội đang có khoản vay ${s.loan}tr₫ – lãi trừ mỗi vòng`, `🏦 The team has a ${s.loan}m₫ loan – interest deducted every round`) : tr(`💰 Ví đội: ${fmt(s.balance)} – chưa dùng đòn bẩy`, `💰 Team wallet: ${fmt(s.balance)} – no leverage used yet`),
    ];
    const teams = [{ name: tr('BẠN', 'YOU'), share, me: true }].concat((s.competitors || []).map(c => ({ name: c.name, share: c.share || 25 })));
    const max = Math.max(1, ...teams.map(t => t.share));
    const COL = { 'Alpha Dynamics': '#e8762d', 'Mekong Ventures': '#00a0c8', 'Star Clay Co.': '#5a32a3' };
    const priceHigh = lastD.price > REF * 1.15;
    const voices = [
      s.brandLoyalty >= 70 ? [tr('KHÁCH TRUNG THÀNH', 'LOYAL CUSTOMER'), tr('Yêu quyết định đầu tư chất lượng của BizOn! Rất hợp bản sắc thương hiệu.', "Love BizOn's investment in quality! Really fits the brand identity."), '#1f7a50']
        : [tr('KHÁCH HÀNG MỚI', 'NEW CUSTOMER'), tr('Sản phẩm ổn nhưng thương hiệu chưa đủ thuyết phục mình gắn bó lâu dài.', "The product's fine, but the brand hasn't convinced me to stick around long-term."), '#5d6770'],
      priceHigh ? [tr('KHÁCH NHẠY GIÁ', 'PRICE-SENSITIVE CUSTOMER'), tr(`Giá ${Math.round(lastD.price).toLocaleString('vi-VN')}k hoi chát so với tùi tiền... đang ngó sang đối thủ. 📉`, `${Math.round(lastD.price)}k is a bit steep... eyeing a rival. 📉`), '#c0392b']
        : [tr('KHÁCH NHẠY GIÁ', 'PRICE-SENSITIVE CUSTOMER'), tr('Mức giá hiện tại khá hợp lý so với chất lượng nhận được!', "The current price feels fair for the quality I'm getting!"), '#1f7a50'],
      ev.id === 'EV_PRICEWAR' ? [tr('GIỚI PHÂN TÍCH', 'ANALYSTS'), tr('Đối thủ vừa giảm giá sâu. Thị trường chờ phản ứng của BizOn trong 48 giờ tới.', "A rival just made a deep price cut. The market awaits BizOn's response in 48 hours."), '#c0392b']
        : [tr('GIỚI PHÂN TÍCH', 'ANALYSTS'), tr(`R&D tích lũy ${Math.round(s.rdCumulative || 0)}tr₫ – nền tảng đổi mới của BizOn đang được chú ý.`, `Cumulative R&D of ${Math.round(s.rdCumulative || 0)}m₫ – BizOn's innovation base is getting noticed.`), '#5d6770'],
    ];
    p.bd.innerHTML = `<div class="bzs-row on"><span class="em">${ev.icon || '📡'}</span><div style="flex:1;min-width:0"><b>${tr('Vòng ', 'Round ')}${Math.min(s.round, 6)} · ${ev.name || ''}</b><small>${ev.desc || ''}</small></div></div>
      <p class="bzs-h">📰 ${tr('BẢN TIN', 'TICKER')}</p>${ticker.map(t => `<div style="font-size:12px;padding:4px 0">${t}</div>`).join('')}
      <p class="bzs-h">📊 ${tr('THỈ PHẦN THỜI GIAN THỰC', 'REAL-TIME SHARE')}</p>
      ${teams.map(t => `<div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:${t.me ? 900 : 700};margin:4px 0"><span style="width:120px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.name}</span><span style="flex:1;height:10px;border-radius:99px;background:#eef4f8;overflow:hidden"><span style="display:block;height:100%;width:${(t.share / max * 100).toFixed(1)}%;background:${t.me ? '#006687' : COL[t.name] || '#8a96a0'}"></span></span><span style="width:40px;text-align:right">${t.share.toFixed(1)}%</span></div>`).join('')}
      <p class="bzs-h">🗣️ ${tr('TIẾNG NÓI KHÁCH HÀNG', 'CUSTOMER VOICES')}</p>
      ${voices.map(v => `<div class="bzs-row"><div style="flex:1;min-width:0"><b style="font-size:10px;color:${v[2]};letter-spacing:.04em">${v[0]}</b><small style="font-size:12px;color:#033337">${v[1]}</small></div></div>`).join('')}`;
  }

  const MAP = { shop, skills, missions, achievements, leaderboard, minigame, reports, market };
  window.BizonStations = { can: id => !!MAP[id], open: (id, ctx) => MAP[id] && MAP[id](ctx) };
})();
