/* BizOn Bật Nghiệp – Đấu trường C-Suite (5 cặp đối đầu) · plugin cho game.html
 * Nạp SAU js/app.js (và office-rounds.js / office-scene.js nếu có):  <script src="js/arena-duels.js"></script>
 * Ảnh: assets/arena/*.jpg (cắt từ bộ ảnh đất sét 27/09).
 * API: BizonArena.open(role?)  · tự gắn 2 thẻ trên Trang chủ: «Đấu trường C-Suite» và «Trụ sở 3D».
 */
(function () {
  const A = f => 'assets/arena/' + f;
  const gs = () => (typeof S !== 'undefined' ? S : null);
  const tr = (vi, en) => (typeof T === 'function' ? T(vi, en) : vi);
  const rivals = () => { try { return typeof AI_OPPONENTS_LIST === 'function' ? AI_OPPONENTS_LIST() : []; } catch (e) { return []; } };
  const teamName = () => { const s = gs(); return (s && s.profile && s.profile.teamName) || tr('Đội bạn', 'Your team'); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const DUELS = [
    { role: 'CEO', no: '01', topic: 'Tầm nhìn chiến lược', img: 'duel-ceo-alpha.jpg', me: 'CEO Minh Long', rival: 'Alpha Dynamics', ricon: '🐺', rcolor: '#e2622a', tension: 95,
      head: 'Bản lĩnh bền vững đối đầu cú đốt tiền giá rẻ', field: 'Phân khúc gốm tiêu dùng & quà tặng tại trục Mekong Delta – TP.HCM. Alpha đang dồn ngân sách livestream bán phá giá cắt máu.',
      mine: ['+35% tăng trưởng bền vững', 'Giữ vững định vị chất lượng cốt lõi', 'Định hướng mở rộng sa bàn 6 vòng'],
      theirs: ['−20% giảm giá sốc toàn phễu', 'Trợ giá livestream quy mô lớn', 'Mục tiêu độc quyền vòng 1–2'],
      tip: 'Kiên định giữ giá cốt lõi, tập trung R&D tạo tính độc bản thay vì cuốn vào bẫy phá giá tự triệt tiêu dòng tiền.' },
    { role: 'CFO', no: '02', topic: 'Quản trị dòng tiền & CVP', img: 'duel-cfo-mekong.jpg', me: 'CFO Thu Hà', rival: 'Mekong Ventures', ricon: '🐘', rcolor: '#1f8fa6', tension: 88,
      head: 'Cân bằng điểm hòa vốn trước thủ thành thâm hậu', field: 'Cân đối dòng tiền hoạt động, duy trì biên an toàn tài chính trước chiến lược trường kỳ kháng chiến của quỹ Mekong Ventures.',
      mine: ['{cash} tiền mặt khả dụng', 'Chu kỳ công nợ kiểm soát 30 ngày', 'Biên an toàn tài chính đạt 28%'],
      theirs: ['Quỹ dự phòng cực dày', 'Chi phí vốn (WACC) thấp ấn tượng', 'Lối chơi phòng ngự vắt kiệt đối thủ'],
      tip: 'Kiểm soát chặt nợ vay thấu chi, luân chuyển kho gốm nhanh nhằm giữ ROE > 15% xuyên suốt mùa thấp điểm.' },
    { role: 'CMO', no: '03', topic: 'Phễu tiếp thị & uy tín thương hiệu', img: 'duel-cmo-starclay.jpg', me: 'CMO Mạnh Chi', rival: 'Star Clay Co.', ricon: '🦚', rcolor: '#6a3fa8', tension: 92,
      head: 'Phù thủy viral Mekong đối đầu Nữ hoàng quà tặng xa xỉ', field: 'Tỷ lệ chuyển đổi khách hàng và điểm thiện cảm người dùng với dòng gốm thủ công mộc mạc đối đầu gốm mạ vàng thượng lưu.',
      mine: ['50tr ngân sách chiến dịch', 'Kể chuyện văn hóa gốm Mekong', '8.2% tỷ lệ chuyển đổi phễu'],
      theirs: ['Phân khúc quà tặng cao cấp mạ vàng', 'Biên lợi nhuận gộp trên đơn vượt trội', 'Khách hàng doanh nghiệp trung thành'],
      tip: 'Khai thác câu chuyện di sản Mekong tạo sợi dây cảm xúc chân thật, vượt qua sự xa cách của những hộp quà đóng gói công nghiệp.' },
    { role: 'COO', no: '04', topic: 'Vận hành & chuỗi cung ứng', img: 'duel-coo-logistics.jpg', me: 'COO Bảo Ngọc', rival: 'Đội xe Alpha Logistics', ricon: '🚚', rcolor: '#e2622a', tension: 84,
      head: 'Xưởng gốm OEE 85% trước làn sóng miễn phí vận chuyển', field: 'Tuyến Cần Thơ – TP.HCM – Đà Nẵng. Alpha tung «Free Shipping Wave · Giao hàng hỏa tốc» để giành đơn trong vòng này.',
      mine: ['OEE xưởng 85%', '1.200 sản phẩm mỗi ca', 'Lò nung & băng chuyền đồng bộ'],
      theirs: ['Miễn phí vận chuyển toàn tuyến', 'Đội xe tải phủ 3 thành phố', 'Giao hàng hỏa tốc trong ngày'],
      tip: 'Giữ công suất vừa đủ đơn hàng, ưu tiên tỷ lệ hàng đạt chuẩn và tồn kho gọn, thay vì đua tốc độ giao bằng chi phí vận chuyển.' },
    { role: 'SEC', no: '05', topic: 'Pháp lý & biến cố thị trường', img: 'duel-sec-legal.jpg', me: 'SEC Gia Hân', rival: 'Rủi ro pháp lý & biến cố', ricon: '⚖️', rcolor: '#c0443a', tension: 76,
      head: 'Lá chắn tuân thủ trước cơn bão thị trường', field: 'Thanh tra đột xuất, tranh chấp nhãn hiệu, thuế suất mới và biến động thị trường có thể xuất hiện ở bất kỳ vòng nào.',
      mine: ['Giấy phép kinh doanh', 'Bản quyền sở hữu trí tuệ', 'ESG Standards'],
      theirs: ['Thanh tra đột xuất', 'Tranh chấp nhãn hiệu', 'Thuế suất mới · biến động thị trường'],
      tip: 'Hoàn tất hồ sơ pháp lý trước khi mở rộng tỉnh mới, ghi biên bản mọi quyết định để đội phản ứng nhanh khi biến cố xảy ra.' },
  ];

  const CSS = `
  #bza{position:fixed;inset:0;z-index:60;background:#0f1a2e;overflow:auto;-webkit-overflow-scrolling:touch;font-family:"Be Vietnam Pro",system-ui,sans-serif;color:#1d2a3a}
  #bza .wrap{max-width:780px;margin:0 auto;padding:14px 14px 40px;display:flex;flex-direction:column;gap:14px}
  #bza .top{display:flex;align-items:center;gap:10px;color:#fff}
  #bza .top b{font:800 20px/1.2 "Baloo 2","Be Vietnam Pro",sans-serif;flex:1}
  #bza .top small{display:block;font:500 12px "Be Vietnam Pro";opacity:.7}
  #bza .ib{border:0;background:rgba(255,255,255,.12);color:#fff;border-radius:14px;min-width:44px;height:44px;font:700 18px sans-serif;cursor:pointer}
  #bza .hero{position:relative;border-radius:22px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35)}
  #bza .hero img{display:block;width:100%;aspect-ratio:909/503;object-fit:cover}
  #bza .hero .cap{position:absolute;left:0;right:0;bottom:0;padding:26px 14px 10px;background:linear-gradient(transparent,rgba(8,14,30,.85));color:#fff;display:flex;justify-content:space-between;gap:10px;font-size:11px;flex-wrap:wrap}
  #bza .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
  @media (max-width:560px){#bza .stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
  #bza .st{background:#fff;border-radius:16px;padding:9px 11px;box-shadow:inset 0 -3px 0 #e3ebf2}
  #bza .st small{display:block;font:700 10px "Be Vietnam Pro";letter-spacing:.06em;color:#5a6a7a;text-transform:uppercase}
  #bza .st b{font:800 17px "Baloo 2",sans-serif;color:#006687}
  #bza .st i{font-style:normal;font-size:11px;color:#3f8a44;margin-left:4px}
  #bza .chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none}
  #bza .chip{flex:none;border:0;border-radius:999px;padding:8px 12px;background:rgba(255,255,255,.12);color:#fff;font:700 12px "Be Vietnam Pro";cursor:pointer;white-space:nowrap}
  #bza .chip[aria-pressed="true"]{background:#f08a3c}
  #bza .card{background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.25);scroll-margin-top:12px}
  #bza .card.mine{outline:4px solid #f08a3c}
  #bza .card img{display:block;width:100%;aspect-ratio:909/500;object-fit:cover}
  #bza .cb{padding:14px;display:flex;flex-direction:column;gap:10px}
  #bza .pill{align-self:flex-start;font:800 11px "Be Vietnam Pro";letter-spacing:.06em;color:#006687;background:#e6f3f7;border-radius:999px;padding:4px 10px;text-transform:uppercase}
  #bza h3{margin:0;font:800 19px/1.25 "Baloo 2",sans-serif;color:#033337;text-wrap:balance}
  #bza .field{margin:0;font-size:13px;color:#4a5a6a;text-wrap:pretty}
  #bza .vs{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}
  #bza .side{border-radius:14px;padding:9px 10px;background:#fff6ec;border:2px solid #f6d9b8}
  #bza .side.r{background:#f5f3fa;border-color:var(--rc)}
  #bza .side b{display:block;font:800 13px "Baloo 2",sans-serif;margin-bottom:4px;color:#b8561a}
  #bza .side.r b{color:var(--rc)}
  #bza .side ul{margin:0;padding-left:16px;font-size:12px;line-height:1.5}
  #bza .tip{display:flex;gap:10px;align-items:flex-start;background:#eaf6f4;border-radius:14px;padding:10px}
  #bza .tip img{width:38px;height:38px;border-radius:12px;object-fit:cover;flex:none;aspect-ratio:auto}
  #bza .tip p{margin:0;font-size:12.5px;font-style:italic;color:#1f4f52}
  #bza .tip p b{display:block;font:800 11px "Be Vietnam Pro";font-style:normal;letter-spacing:.05em;color:#006687;margin-bottom:2px}
  #bza .ft{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  #bza .meter{flex:1;min-width:160px;font-size:11px;color:#5a6a7a}
  #bza .meter div{height:10px;border-radius:99px;background:#eef1f5;overflow:hidden;margin-top:4px}
  #bza .meter span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#f2c94c,#e2622a)}
  #bza .go{border:0;border-radius:14px;padding:11px 14px;min-height:44px;background:#006687;color:#fff;font:800 13px "Be Vietnam Pro";cursor:pointer;box-shadow:0 4px 0 #004a62}
  #bza .council{background:#fff;border-radius:22px;overflow:hidden}
  #bza .council img{display:block;width:100%;aspect-ratio:909/503;object-fit:cover}
  #bza .rv{display:grid;grid-template-columns:40px minmax(0,1fr);gap:10px;padding:10px 14px;border-top:1px solid #eef1f5;font-size:12px;color:#4a5a6a}
  #bza .rv span{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px}
  #bza .rv b{color:#033337;font-size:14px}
  #bza .sec-h{color:#fff;font:800 15px "Baloo 2",sans-serif;margin:6px 2px -4px;letter-spacing:.02em}
  .bza-entry{display:flex;align-items:center;gap:12px;width:100%;padding:0;margin-bottom:16px;text-align:left;overflow:hidden;border:0;cursor:pointer;background:#fff;border-radius:24px;box-shadow:0 6px 18px rgba(0,102,135,.12);text-decoration:none;color:inherit}
  .bza-entry img{width:112px;height:76px;object-fit:cover;flex:none}
  .bza-entry b{display:block;color:#006687;font-size:15px}
  .bza-entry small{display:block;font-size:11px;color:rgba(0,51,55,.6);margin-top:2px}
  .bza-entry em{font-style:normal;margin-left:auto;margin-right:14px;color:#f08a3c;font-weight:800}`;

  function stats() {
    const s = gs(); const last = s && s.history && s.history.length ? s.history[s.history.length - 1] : null;
    const share = last && last.share != null ? last.share : null, prev = s && s.history && s.history.length > 1 ? s.history[s.history.length - 2].share : null;
    const money = v => (typeof window.money === 'function' ? window.money(v) : Math.round(v).toLocaleString('vi-VN') + 'tr₫');
    return {
      round: s ? Math.min(s.round || 1, 6) : 1,
      share: share != null ? share.toFixed(1) + '%' : '—', shareDelta: share != null && prev != null ? (share - prev >= 0 ? '+' : '') + (share - prev).toFixed(1) : '',
      profit: last && last.netProfit != null ? (last.netProfit >= 0 ? '+' : '') + money(last.netProfit) : '—',
      brand: s && s.brand != null ? (+s.brand).toFixed(2) : '—',
      cash: s && s.balance != null ? money(s.balance) : '404tr₫',
      role: s && s.profile && s.profile.role ? String(s.profile.role).toUpperCase() : 'CEO',
    };
  }

  function open(focusRole) {
    if (!document.getElementById('bza-css')) { const st = document.createElement('style'); st.id = 'bza-css'; st.textContent = CSS; document.head.appendChild(st); }
    close();
    const k = stats(), team = esc(teamName()), dark = document.documentElement.dataset.theme === 'dark';
    const order = DUELS.slice().sort((a, b) => (b.role === (focusRole || k.role)) - (a.role === (focusRole || k.role)));
    const R = rivals();
    const root = document.createElement('div'); root.id = 'bza'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Đấu trường C-Suite');
    root.innerHTML = `<div class="wrap">
      <div class="top"><button class="ib" data-x aria-label="${tr('Đóng', 'Close')}">←</button><b>${tr('Đấu trường C-Suite', 'C-Suite Arena')}<small>${tr('Vòng', 'Round')} ${k.round}/6 · ${team} ${tr('đối đầu 3 đối thủ AI & biến cố thị trường', 'vs 3 AI rivals & market events')}</small></b></div>
      <div class="hero"><img src="${A(dark ? 'lineup-flags-night.jpg' : 'lineup-flags-day.jpg')}" alt="${tr('Đội C-Suite của bạn đối mắt ba đối thị quanh bàn sa bàn Việt Nam', 'Your C-suite faces three rivals around the Vietnam sand table')}">
        <div class="cap"><span>⚑ ${tr('Mặt trận: sa bàn kinh tế Đồng bằng sông Cửa Long & TP.HCM', 'Front: Mekong Delta & HCMC economic sand table')}</span><span>◎ ${tr('Lumina AI giám sát 24/7', 'Lumina AI on watch 24/7')}</span></div></div>
      <div class="stats">
        <div class="st"><small>${tr('Thỉ phần', 'Market share')}</small><b>${k.share}</b>${k.shareDelta ? `<i>${k.shareDelta}</i>` : ''}</div>
        <div class="st"><small>${tr('Lợi nhuận vòng trước', 'Last round profit')}</small><b>${k.profit}</b></div>
        <div class="st"><small>${tr('Chỉ số thương hiệu', 'Brand index')}</small><b>${k.brand}</b></div>
        <div class="st"><small>${tr('Khối phòng ban', 'Departments')}</small><b>5/5</b><i>${tr('sẵn sàng', 'ready')}</i></div>
      </div>
      <div class="chips">${order.map(d => `<button class="chip" data-go="${d.role}" aria-pressed="${d.role === order[0].role}">${d.role} vs ${esc(d.rival.split(' ')[0])}</button>`).join('')}</div>
      ${order.map(d => `<article class="card${d.role === k.role ? ' mine' : ''}" id="bza-${d.role}">
        <img src="${A(d.img)}" alt="${esc(d.me)} ${tr('đối đầu', 'vs')} ${esc(d.rival)}" loading="lazy">
        <div class="cb">
          <span class="pill">${tr('Cặp', 'Duel')} ${d.no} · ${esc(d.topic)}</span>
          <h3>${esc(d.me)} vs ${esc(d.rival)}: ${esc(d.head)}</h3>
          <p class="field">${esc(d.field)}</p>
          <div class="vs" style="--rc:${d.rcolor}">
            <div class="side"><b>🏺 ${team}</b><ul>${d.mine.map(x => `<li>${esc(x.replace('{cash}', k.cash))}</li>`).join('')}</ul></div>
            <div class="side r"><b>${d.ricon} ${esc(d.rival)}</b><ul>${d.theirs.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
          </div>
          <div class="tip"><img src="assets/icons/icon-192.png" alt="" onerror="this.remove()"><p><b>${tr('CỐ VẤN LUMINA AI KHUYÊN', 'LUMINA AI ADVISES')}</b>“${esc(d.tip)}”</p></div>
          <div class="ft"><div class="meter">${tr('Độ căng thẳng', 'Tension')}: <b>${d.tension}%</b><div><span style="width:${d.tension}%"></span></div></div>
            <button class="go" data-tab="decisions">${tr('Chốt lệnh', 'Commit')} ${d.role} →</button></div>
        </div></article>`).join('')}
      ${R.length ? `<p class="sec-h">${tr('Hội đồng đối thủ', 'Rival council')}</p>
      <div class="council"><img src="${A('rivals-lineup.jpg')}" alt="${tr('Ba lãnh đạo đối thệ: Alpha Dynamics, Mekong Ventures, Star Clay Co.', 'Three rival leaders')}" loading="lazy">
        ${R.map(r => `<div class="rv"><span style="background:${r.accent}22">${r.icon || ''}</span><div><b>${esc(r.name)}</b> · ${esc(r.style || '')}<br>${esc(r.motto || '')}<br><span style="all:unset;color:#006687;font-weight:700">↳ ${esc(r.counter || '')}</span></div></div>`).join('')}</div>` : ''}
    </div>`;
    document.body.appendChild(root);
    root.querySelector('[data-x]').onclick = close;
    root.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { root.querySelectorAll('[data-go]').forEach(x => x.setAttribute('aria-pressed', x === b)); const el = root.querySelector('#bza-' + b.dataset.go); if (el) root.scrollTo({ top: el.offsetTop - 10, behavior: 'smooth' }); });
    root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { close(); if (typeof window.showTab === 'function') window.showTab(b.dataset.tab); });
    document.addEventListener('keydown', esc_);
  }
  function esc_(e) { if (e.key === 'Escape') close(); }
  function close() { const r = document.getElementById('bza'); if (r) r.remove(); document.removeEventListener('keydown', esc_); }

  function mountEntry() {
    if (document.getElementById('bza-entry')) return;
    const anchor = document.getElementById('office-enter-btn') || document.getElementById('office-map-card') || (document.getElementById('conquest-map') && document.getElementById('conquest-map').closest('.clay-card'));
    if (!anchor) return;
    if (!document.getElementById('bza-css')) { const st = document.createElement('style'); st.id = 'bza-css'; st.textContent = CSS; document.head.appendChild(st); }
    anchor.insertAdjacentHTML('beforebegin', `
      <button id="bza-entry" type="button" class="bza-entry"><img src="${A('duel-ceo-alpha.jpg')}" alt=""><span><b>⚔️ ${tr('đấu trường C-Suite', 'C-Suite Arena')}</b><small>${tr('5 cặp đối đầu: CEO, CFO, CMO, COO, SEC vs đối thủ AI', '5 duels: your C-suite vs AI rivals')}</small></span><em>→</em></button>
      <a id="bza-hq" class="bza-entry" href="BizOn HQ Diorama.html"><img src="${A('hq-night-cutaway.jpg')}" alt=""><span><b>🏢 ${tr('Trụ sở 3D đất sét', '3D clay HQ')}</b><small>${tr('Đi dạo 6 phòng ban, ngày/đêm, xem kết quả cắm cờ', 'Tour 6 departments, day/night, flag results')}</small></span><em>→</em></a>`);
    document.getElementById('bza-entry').onclick = () => open();
  }
  if (window.OfficeRounds && OfficeRounds.render) { const r0 = OfficeRounds.render; OfficeRounds.render = function () { const out = r0.apply(this, arguments); setTimeout(mountEntry, 0); return out; }; }
  setTimeout(mountEntry, 0); setTimeout(mountEntry, 800);
  window.BizonArena = { open, close, duels: DUELS };
})();
