/* BizOn Hộ Chiếu Thương Hiệu · bản gọn (brand-passport-v2.html) – lớp giao diện, KHÔNG có công thức mô phỏng.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Engine là chính trang brand-passport.html, nạp trong iframe ẩn với ?embed=1. Tệp này chỉ:
 * - đọc trạng thái qua cửa sổ chỉ-đọc window.bpTest của khung đó (state, data, signals, forecastQuarter, event, post…);
 * - gọi đúng các hàm công khai mà giao diện gốc gọi: bpFirm, bpStart, bpResume, bpPick, bpEnter, bpShip, bpIntel,
 *   bpBuyItem, bpUseItem, bpToDecide, bpCommit, bpEv, bpNext;
 * - vẽ lại mỗi quý thành MỘT thẻ quyết định (ưu tiên · mức vận hành · thị trường mới) có dự báo trước khi chốt, một
 *   thẻ biến cố và một thẻ kết quả – theo khuôn của bat-nghiep-v2.html (js/bn2-ui.js, css/bn2.css).
 * Ván xong thì hiện màn Kết thúc của engine (điểm, chứng nhận, nộp bài) ngay từ iframe, không vẽ lại.
 */
const BP2 = (() => {
  const $ = id => document.getElementById(id);
  const app = () => $('bp2-app');
  const lang = () => { try { return localStorage.getItem('bizon-lang') || 'vi'; } catch (e) { return 'vi'; } };
  const T = (vi, en) => lang() === 'en' ? en : vi;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const f1 = v => (Math.round(v * 10) / 10 || 0).toLocaleString(lang() === 'en' ? 'en-US' : 'vi-VN', { maximumFractionDigits: 1 });
  const TY = () => T(' tỷ', ' bn');
  const money = v => f1(v) + TY();
  const sgn = v => (v > 0 ? '+' : '') + f1(v);
  const clamp = v => Math.max(0, Math.min(100, Math.round(v)));
  const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };

  let W = null;        // cửa sổ của iframe engine
  let D = null;        // dữ liệu tĩnh của engine (MKTS, FIRMS, MODES…)
  let readyFlag = false;
  const ui = { screen: 'start', firm: 0, adv: false, intelMkt: 0, note: '', help: false, frameTimer: null, team: null, klass: null };
  const api = () => (W && W.bpTest) || null;
  const st = () => api().state();
  const call = (fn, ...args) => { try { return W[fn](...args); } catch (e) { console.error('bp2:', fn, e); return undefined; } };

  /* ---------- nạp engine ---------- */
  function mountEngine() {
    const fr = $('bp2-engine');
    const seed = (location.search.match(/[?&]seed=(\d{1,9})(?:&|$)/) || [])[1];
    const jm = /[?&]journey=([^&#]+)/.exec(location.search);   // hành trình 3 bậc: engine cũng đọc hộ chiếu để ghi Bậc 3 ở màn Kết thúc
    fr.src = 'brand-passport.html?embed=1' + (seed ? '&seed=' + seed : '') + (jm ? '&journey=' + jm[1] : '');
    // Nút «Chơi lại» ở màn Kết thúc của engine tải lại khung con – trang mẹ tải lại theo để về màn mở đầu.
    fr.addEventListener('load', () => { if (ui.screen === 'end') location.reload(); });
    const tick = setInterval(() => {
      try {
        const w = fr.contentWindow;
        if (w && w.bpTest && typeof w.bpStart === 'function' && typeof w.bpTest.data === 'function') {
          clearInterval(tick); W = w; D = w.bpTest.data(); readyFlag = true;
          if (ui.screen === 'start') render();
        }
      } catch (e) { /* khung chưa sẵn sàng */ }
    }, 120);
  }
  const hasSave = () => !!ls('bizon-bp-save');
  const team = () => (ls('bp-team') || '').trim();
  const klass = () => (ls('bp-class') || '').trim().toUpperCase();

  /* ---------- màn mở đầu ---------- */
  function viewStart() {
    const firms = D ? D.FIRMS : [];
    return `<main id="bp2-main" class="bn2-hero"><div class="bn2-card">
      ${ui.journey && ui.journey.id && window.BizOnJourneyLink ? BizOnJourneyLink.bannerHtml(ui.journey) : ''}
      <div class="bn2-row" style="justify-content:space-between">
        <img class="logo" src="assets/brand/bizon-wordmark-ink.png" alt="BizOn">
        <button class="bn2-iconbtn" data-act="lang">${T('EN', 'VI')}</button>
      </div>
      <p class="bn2-eyebrow" style="margin-top:14px">${T('Bậc 3 · Quốc tế hoá · bản gọn', 'Level 3 · Internationalisation · lean version')}</p>
      <h1 style="font-size:36px;margin:6px 0 4px">🛂 ${T('Hộ Chiếu Thương Hiệu', 'Brand Passport')}</h1>
      <p class="bn2-muted">${T('Đưa một thương hiệu Việt ra 7 thị trường giả tưởng trong 6 quý, đua với đối thủ Kim Long Exports. Mỗi quý chỉ một thẻ quyết định, có dự báo trước khi chốt. Cùng engine và cách chấm điểm với bản đầy đủ.', 'Take a Vietnamese brand into 7 fictional markets over 6 quarters, racing Kim Long Exports. One decision card per quarter, with a forecast before you commit. Same engine and scoring as the full version.')}</p>
      ${hasSave() ? `<div class="bn2-sunk" style="margin-top:14px">
        <p class="bn2-small" style="margin:0 0 8px">${T('Ván đang dở trên máy này', 'Game in progress on this device')}${team() ? ': <b>' + esc(team()) + '</b>' : ''}</p>
        <button class="bn2-btn teal block" data-act="resume" ${readyFlag ? '' : 'disabled'}>${T('Tiếp tục ván này →', 'Continue this game →')}</button></div>` : ''}
      <form id="bp2-login" style="margin-top:16px">
        <label class="bn2-small"><b>${T('Tên đội', 'Team name')}</b> <span class="bn2-muted">${T('(tuỳ chọn)', '(optional)')}</span>
          <input class="bn2-input" name="team" maxlength="40" value="${esc(ui.team == null ? team() : ui.team)}" placeholder="${T('VD: Đội Rồng Xanh', 'e.g. Green Dragon')}"></label>
        <label class="bn2-small" style="display:block;margin-top:10px"><b>${T('Mã lớp', 'Class code')}</b> <span class="bn2-muted">${T('(bỏ trống = chơi thử; có mã lớp thì cả lớp cùng một kịch bản)', '(leave blank = trial; with a code the whole class shares one scenario)')}</span>
          <input class="bn2-input" name="classId" maxlength="40" autocomplete="off" value="${esc(ui.klass == null ? klass() : ui.klass)}"></label>
        <p class="bn2-small" style="margin:12px 0 0"><b>${T('Doanh nghiệp của bạn', 'Your company')}</b> <span class="bn2-muted">${T('– không có lựa chọn «mạnh nhất»', '– there is no «strongest» pick')}</span></p>
        <div class="bp2-start-firms">${firms.map((f, i) => `<button type="button" class="bp2-opt bp2-firm ${ui.firm === i ? 'on' : ''}" data-act="firm" data-v="${i}" aria-pressed="${ui.firm === i}">
          ${f.img ? `<img src="${esc(f.img)}" alt="">` : `<span style="font-size:40px">${f.icon}</span>`}
          <span>${f.icon} ${esc(f.name)} · ${esc(T(f.prod, f.prodEn))}<small>✅ ${esc(T(f.adv, f.advEn))}</small><small>⚠️ ${esc(T(f.weak, f.weakEn))}</small></span></button>`).join('')}</div>
        <button class="bn2-btn pri block" style="margin-top:16px" type="submit" ${readyFlag ? '' : 'disabled'}>${readyFlag ? T('Vào chơi 6 quý', 'Start the 6 quarters') : `<span class="bp2-loading"><i></i>${T('Đang nạp engine…', 'Loading the engine…')}</span>`}</button>
      </form>
      <p class="bn2-small bn2-muted" style="margin-top:14px">${T('Muốn bản đầy đủ (video hướng dẫn, ban cố vấn, phòng đàm phán, tour)?', 'Want the full version (how-to video, advisory board, negotiation room, tour)?')} <a href="brand-passport.html">brand-passport.html</a> · <a href="Ho Chieu Thuong Hieu 3D.html">${T('bản 3D', '3D version')}</a></p>
    </div></main>`;
  }

  /* ---------- thanh trên + cột phải ---------- */
  function viewTop(s) {
    const f = D.FIRMS[s.firm];
    const name = team() || f.name;
    return `<header class="bn2-top"><div class="bn2-wrap">
      <img class="logo" src="assets/brand/bizon-wordmark-ink.png" alt="BizOn">
      <div style="min-width:0"><div class="team">${esc(name)}</div>
        <div class="bp2-top-sub sub">${f.icon} ${esc(f.name)} · ${klass() ? esc(klass()) : T('chơi thử', 'trial')}</div></div>
      <div class="sp"></div>
      <div class="bn2-rounds" aria-label="${T('Tiến trình 6 quý', '6-quarter progress')}">${[0, 1, 2, 3, 4, 5].map(i => `<span class="${i < s.q ? 'win' : i === s.q ? 'cur' : ''}" title="${T('Quý', 'Quarter')} ${i + 1}">${i < s.q ? '✓' : i + 1}</span>`).join('')}</div>
      <div class="bn2-cash" title="${T('Tiền mặt', 'Cash')}">💼 ${money(s.cash)}</div>
      <button class="bn2-iconbtn" data-act="lang">${T('EN', 'VI')}</button>
      <button class="bn2-iconbtn" data-act="help" aria-label="${T('Cách chơi', 'How to play')}">❓</button>
    </div></header>`;
  }

  function viewHud(s) {
    const kAvg = Math.round(s.know.reduce((a, b) => a + b, 0) / D.MKTS.length);
    const ent = D.MKTS.map((_, m) => m).filter(m => s.entered[m] !== null);
    const netArr = ent.length ? ent.map(m => s.net[m]) : s.net;
    const netAvg = Math.round(netArr.reduce((a, b) => a + b, 0) / netArr.length);
    const r = api().rival();
    const max = Math.max(s.profit, r.profit, 1), ahead = s.profit >= r.profit;
    return `<section class="bn2-card" aria-labelledby="bp2-hud-h">
      <h2 id="bp2-hud-h" style="font-size:20px">${T('Chỉ số của bạn', 'Your numbers')}</h2>
      <div class="bp2-hud">
        <div><span>⭐ ${T('Uy tín', 'Reputation')}</span><b>${clamp(s.rep)}</b></div>
        <div><span>🏭 ${T('Năng lực', 'Capability')}</span><b>${clamp(s.capab)}</b></div>
        <div><span>🛡️ ${T('Chống chịu', 'Resilience')}</span><b>${clamp(s.resil)}</b></div>
        <div><span>📚 ${T('Tri thức TB', 'Avg knowledge')}</span><b>${kAvg}</b></div>
        <div><span>🤝 ${T('Mạng lưới', 'Network')}</span><b>${netAvg}</b></div>
        <div><span>🌱 ${T('Bền vững', 'Sustainability')}</span><b>${s.susts}</b></div>
      </div>
      <p class="bn2-small" style="margin:12px 0 0"><b>🆚 ${T('Cuộc đua lợi nhuận với', 'Profit race with')} ${esc(r.name)}</b> · ${ahead ? T('bạn đang dẫn trước', 'you are ahead') : T('bạn đang bị dẫn', 'you are behind')}</p>
      <div class="bp2-race">
        <div class="row"><span>🏢 ${T('Bạn', 'You')}</span><div class="bn2-bar"><i style="width:${Math.max(4, s.profit / max * 100)}%;background:var(--clay-teal)"></i></div><b>${money(s.profit)}</b></div>
        <div class="row"><span>${r.icon} Kim Long</span><div class="bn2-bar"><i style="width:${Math.max(4, r.profit / max * 100)}%;background:var(--clay-orange)"></i></div><b>${money(r.profit)}</b></div>
      </div>
      <p class="bn2-small" style="margin:14px 0 0"><b>🌏 ${T('Thị trường đang hiện diện', 'Markets you are in')}</b> ${ent.length ? `(${ent.length}/${D.MKTS.length})` : ''}</p>
      ${ent.length ? `<div class="bp2-mkts">${ent.map(m => { const mk = D.MKTS[m], md = D.MODES[s.entered[m]], sh = D.SHIP_MODES[s.ship[m] == null ? 0 : s.ship[m]];
        return `<div class="bp2-mkt">${mk.img ? `<img src="${esc(mk.img)}" alt="">` : `<span style="font-size:26px">${mk.icon}</span>`}<div><b>${mk.icon} ${esc(mk.name)}</b> · ${md.icon} ${esc(T(md.name, md.nameEn))} · ${sh.icon}
          <small>📚 ${clamp(s.know[m])} · 🤝 ${clamp(s.net[m])} · 😊 ${T('hài lòng', 'satisfaction')} ${clamp(s.cust[m])}${r.in.indexOf(m) >= 0 ? ' · 🐉 ' + T('có Kim Long', 'Kim Long present') : ''}</small></div></div>`; }).join('')}</div>`
        : `<p class="bn2-small bn2-muted" style="margin:4px 0 0">${T('Chưa vào thị trường nào – chọn một thị trường mới ở bước 3 của thẻ quyết định.', 'No market yet – pick a new market in step 3 of the decision card.')}</p>`}
      <p class="bn2-small bn2-muted" style="margin:12px 0 0">${api().seedLine()}</p>
    </section>`;
  }

  function viewLog() {
    const rows = api().logs(6);
    if (!rows.length) return '';
    return `<section class="bn2-card"><h2 style="font-size:20px">${T('Nhật ký hành trình', 'Journey log')}</h2>
      <ul class="bp2-log">${rows.map(h => `<li>${h}</li>`).join('')}</ul>
      <p class="bn2-small bn2-muted" style="margin:8px 0 0">${T('Mới nhất ở trên. Nhật ký đầy đủ nằm trong bản đầy đủ.', 'Newest first. The full log lives in the full version.')}</p></section>`;
  }

  /* ---------- thẻ quyết định (một thẻ cho cả Quan sát + Quyết định của bản gốc) ---------- */
  function viewDecision(s) {
    const A = api(), sel = s.sel;
    const notIn = D.MKTS.map((_, m) => m).filter(m => s.entered[m] !== null ? false : true);
    if (ui.intelMkt == null || ui.intelMkt >= D.MKTS.length) ui.intelMkt = 0;
    const sig = A.signals(), adv = A.adviceRows(), ahead = A.forecastAhead();
    const fq = A.forecastQuarter();
    const enterCost = sel.enter !== null ? D.MODES[sel.enterMode].cost : 0;
    const prioCost = sel.prio === 2 ? 0.5 : sel.prio === 3 ? 0.8 : 0;
    const cantAfford = sel.enter !== null && s.cash - prioCost < enterCost;
    const ready = sel.prio !== null && (sel.enter === null || sel.shipMode != null) && !cantAfford;
    const aibis = sel.enter !== null ? (A.aibis(sel.enter) || {}) : {};
    const pfMid = (fq.pfLo + fq.pfHi) / 2;
    const used = sel.intel.length;
    const disc = sel.prio === 0 ? 0.5 : 1;
    const shop = A.shop();
    return `<section class="bn2-card" aria-labelledby="bp2-dec-h">
      <p class="bn2-eyebrow">${T('Quý', 'Quarter')} ${s.q + 1}/6 · ${T('Tin thị trường', 'Market news')}</p>
      ${sig.map(x => `<div class="bp2-sig">${x}</div>`).join('')}
      ${adv.map(a => `<div class="bp2-adv"><span class="face">${a.face ? `<img src="${esc(a.face)}" alt="">` : a.icon}</span><div><div class="who">${esc(a.who)}</div><p>${a.text}</p></div></div>`).join('')}
      ${ahead ? `<div class="bp2-note">🔮 ${ahead.mission ? T('Lumina: quý sau là một NHIỆM VỤ lớn, không phải sự kiện thường.', 'Lumina: next quarter is a major MISSION, not a regular event.') : T('Lumina dự báo sự kiện quý sau: ', 'Lumina forecasts next quarter\'s event: ') + ahead.cat + ' «' + esc(ahead.title) + '»'}</div>` : ''}

      <h2 id="bp2-dec-h" style="font-size:22px;margin-top:18px">${T('Quyết định quý', 'Decisions for quarter')} ${s.q + 1}</h2>
      <p class="bp2-step"><span>1</span>${T('Ưu tiên của quý', 'Priority this quarter')} <span class="bn2-muted" style="display:inline;width:auto;height:auto;background:none;color:var(--clay-sub);font-weight:500;text-transform:none;letter-spacing:0">(${T('bắt buộc', 'required')})</span></p>
      <div class="bp2-opts">${D.PRIOS.map((p, i) => `<button type="button" class="bp2-opt ${sel.prio === i ? 'on' : ''}" data-act="prio" data-v="${i}" aria-pressed="${sel.prio === i}">${p.icon} ${esc(T(p.name, p.nameEn))}<small>${esc(T(p.note, p.noteEn))}</small></button>`).join('')}</div>

      <p class="bp2-step"><span>2</span>${T('Mức vận hành', 'Operating level')}</p>
      <div class="bn2-seg" role="group">${D.BUDGETS.map((b, i) => `<button type="button" data-act="bud" data-v="${i}" class="${sel.budget === i ? 'on' : ''}" aria-pressed="${sel.budget === i}">${b.icon} ${esc(T(b.name, b.nameEn))}</button>`).join('')}</div>
      <small class="bn2-muted" style="display:block;margin-top:4px;font-size:12px">${T('Tiết kiệm: doanh thu ×0,9, chi vận hành ×0,7 · Cân bằng: ×1 · Dồn lực: doanh thu ×1,15, chi ×1,4, chống chịu −2.', 'Frugal: revenue ×0.9, operating cost ×0.7 · Balanced: ×1 · All-in: revenue ×1.15, cost ×1.4, resilience −2.')}</small>

      <p class="bp2-step"><span>3</span>${T('Thị trường mới', 'New market')} <span class="bn2-muted" style="display:inline;width:auto;height:auto;background:none;color:var(--clay-sub);font-weight:500;text-transform:none;letter-spacing:0">(${T('tuỳ chọn · tối đa 1/quý', 'optional · max 1 per quarter')})</span></p>
      ${notIn.length ? `<select data-sel="mkt" aria-label="${T('Chọn thị trường mới', 'Pick a new market')}">
        <option value="" ${sel.enter === null ? 'selected' : ''}>${T('— Không vào thêm thị trường quý này —', '— No new market this quarter —')}</option>
        ${notIn.map(m => { const mk = D.MKTS[m]; return `<option value="${m}" ${sel.enter === m ? 'selected' : ''}>${mk.icon} ${esc(mk.name)} · ${esc(T(mk.trait, mk.traitEn))} · 📚 ${clamp(s.know[m])}${s.know[m] < 25 ? T(' (mù mờ)', ' (foggy)') : ''}</option>`; }).join('')}
      </select>` : `<p class="bn2-small bn2-muted">${T('Bạn đã hiện diện ở cả 7 thị trường.', 'You are already present in all 7 markets.')}</p>`}
      ${sel.enter !== null ? `
        <p class="bn2-small" style="margin:10px 0 6px"><b>${T('Cách vào', 'Entry mode')} ${esc(D.MKTS[sel.enter].name)}</b> <span class="bn2-muted">· ${T('AIBIS chấm mức phù hợp 0–100 (tham khảo)', 'AIBIS scores fit 0–100 (reference)')}</span></p>
        <div class="bp2-opts" style="grid-template-columns:repeat(3,minmax(0,1fr))">${D.MODES.map(md => `<button type="button" class="bp2-opt ${sel.enterMode === md.id ? 'on' : ''}" data-act="mode" data-v="${md.id}" aria-pressed="${sel.enterMode === md.id}">${md.icon} ${esc(T(md.name, md.nameEn))}<small>${T('vốn', 'capital')} ${money(md.cost)} · ${esc(T(md.note, md.noteEn))}</small>${aibis[md.id] != null ? `<span class="aibis">AIBIS ${aibis[md.id]}</span>` : ''}</button>`).join('')}</div>
        <p class="bn2-small" style="margin:10px 0 6px"><b>🚚 ${T('Vận chuyển', 'Shipping')}</b></p>
        <div class="bn2-seg" role="group">${D.SHIP_MODES.map(sm => `<button type="button" data-act="ship" data-v="${sm.id}" class="${sel.shipMode === sm.id ? 'on' : ''}" aria-pressed="${sel.shipMode === sm.id}">${sm.icon} ${esc(T(sm.name, sm.nameEn))} · ${T('rủi ro chậm', 'delay risk')} ${Math.round(sm.risk * 100)}%</button>`).join('')}</div>
        ${(() => { const fr = A.forecast(sel.enter, sel.enterMode); return `<p class="bn2-small" style="margin:8px 0 0">🔮 <b>${T('Dự báo Lumina cho thị trường này', 'Lumina forecast for this market')}:</b> ${T('doanh thu quý ước', 'quarterly revenue about')} ${f1(fr.lo)}–${f1(fr.hi)}${TY()} · ${fr.comp >= 1.3 ? T('cạnh tranh cao', 'high competition') : fr.comp <= 0.85 ? T('cạnh tranh dịu', 'light competition') : T('cạnh tranh vừa', 'moderate competition')}${fr.rivalShare > 0.03 ? ' · 🐉 Kim Long ' + T('giữ khoảng', 'holds about') + ' ' + Math.round(fr.rivalShare * 100) + '% ' + T('thị phần', 'of the share') : ''}. ${s.know[sel.enter] < 25 ? T('Dải rộng vì tri thức còn thấp – mua tin ở «Nâng cao» để thu hẹp.', 'The range is wide because knowledge is low – buy intel under «Advanced» to narrow it.') : ''}</p>`; })()}` : ''}

      <button type="button" class="bp2-more" data-act="adv" aria-expanded="${ui.adv}">${T('Nâng cao: mua tin thị trường & vật phẩm', 'Advanced: buy market intel & items')}</button>
      ${ui.adv ? `<div class="bn2-sunk">
        <p class="bn2-small" style="margin:0 0 6px"><b>📡 ${T('Mua tin', 'Buy intel')}</b> <span class="bn2-muted">(${T('đã dùng', 'used')} ${used}/2 ${T('nguồn quý này', 'sources this quarter')}${disc < 1 ? ' · ' + T('giá −50% nhờ ưu tiên Thăm dò', '−50% thanks to the Scout priority') : ''})</span></p>
        <select data-sel="intelMkt" aria-label="${T('Thị trường muốn tìm hiểu', 'Market to research')}">${D.MKTS.map((mk, m) => `<option value="${m}" ${ui.intelMkt === m ? 'selected' : ''}>${mk.icon} ${esc(mk.name)} · 📚 ${clamp(s.know[m])}/100 · 🤝 ${clamp(s.net[m])}${s.entered[m] !== null ? ' · ' + T('đã vào', 'entered') : ''}</option>`).join('')}</select>
        <div class="bp2-list" style="margin-top:8px">${D.SOURCES.map((src, i) => { const cost = src.cost * disc, ok = used < 2 && s.cash >= cost;
          return `<div class="bp2-item"><span class="ic">${src.icon}</span><div><b>${esc(T(src.name, src.nameEn))}</b><small>+${src.know} ${T('tri thức', 'knowledge')}${src.net ? ' · +' + src.net + ' ' + T('mạng lưới', 'network') : ''} · ${esc(T(src.note, src.noteEn))}</small></div><button type="button" class="bn2-btn teal" data-act="intel" data-v="${i}" ${ok ? '' : 'disabled'}>${money(cost)}</button></div>`; }).join('')}</div>
        <p class="bn2-small" style="margin:14px 0 6px"><b>🛍️ ${T('Vật phẩm', 'Items')}</b> <span class="bn2-muted">${T('(trả bằng tiền mặt của công ty)', '(paid from company cash)')}</span></p>
        <div class="bp2-list">${shop.map(it => `<div class="bp2-item"><span class="ic">${it.icon}</span><div><b>${esc(it.name)}${it.count ? ' ×' + it.count : ''}</b><small>${esc(it.desc)}</small></div>
          <div style="display:grid;gap:4px">${it.owned ? `<span class="bn2-small bn2-muted">✅ ${it.type === 'invest' ? T('đủ', 'maxed') : T('đã có', 'owned')}</span>` : `<button type="button" class="bn2-btn" data-act="buy" data-v="${it.id}" ${s.cash >= it.price ? '' : 'disabled'}>${money(it.price)}</button>`}
          ${it.type === 'consumable' && it.count ? `<button type="button" class="bn2-btn pri" data-act="use" data-v="${it.id}" ${it.canUse ? '' : 'disabled'}>${T('Dùng', 'Use')}${it.id === 'SCOUT' ? ' → ' + D.MKTS[ui.intelMkt].icon : ''}</button>` : ''}</div></div>`).join('')}</div>
        ${ui.note ? `<div class="bp2-note">${ui.note}</div>` : ''}
      </div>` : ''}

      <div class="bn2-sunk" style="margin-top:14px"><p class="bn2-small" style="margin:0 0 8px"><b>${T('Dự báo trước khi chốt', 'Forecast before you commit')}</b> <span class="bn2-muted">${T('(ước tính từ dự báo Lumina – chưa gồm biến cố, chậm hàng và hệ số riêng từng thị trường)', '(estimate from Lumina\'s forecast – excludes events, delays and market-specific factors)')}</span></p>
        ${fq.markets ? `<div class="bn2-fc">
          <div><span>${T('Doanh thu ước', 'Est. revenue')}</span><b>${f1(fq.revLo)}–${f1(fq.revHi)}${TY()}</b></div>
          <div><span>${T('Chi vận hành', 'Operating cost')}</span><b>${money(fq.op)}</b></div>
          <div><span>${T('Lãi/lỗ dự kiến', 'Expected profit')}</span><b class="${fq.pfLo >= 0 ? 'pos' : fq.pfHi < 0 ? 'neg' : ''}">${sgn(fq.pfLo)} … ${sgn(fq.pfHi)}${TY()}</b></div>
          <div><span>${T('Chi một lần', 'One-off spend')}</span><b>${money(fq.spend)}</b></div>
        </div>
        <p class="bn2-small" style="margin:8px 0 0">💼 ${T('Tiền mặt cuối quý ước', 'Est. cash at quarter end')} <b>${money(s.cash - fq.spend + pfMid)}</b> (${T('hiện', 'now')} ${money(s.cash)}).${s.cash - fq.spend + pfMid < 0 ? ' <span class="neg">' + T('Âm tiền 2 quý liên tiếp là thua sớm.', 'Two straight quarters below zero means an early loss.') + '</span>' : ''}</p>`
        : `<p class="bn2-small" style="margin:0">${T('Chưa có thị trường nào nên quý này không có doanh thu quốc tế. Chọn một thị trường ở bước 3 để bắt đầu bán hàng.', 'No market yet, so there is no international revenue this quarter. Pick a market in step 3 to start selling.')}${fq.spend ? ' ' + T('Chi một lần', 'One-off spend') + ': <b>' + money(fq.spend) + '</b>.' : ''}</p>`}
        ${cantAfford ? `<p class="bn2-small neg" style="margin:8px 0 0">${T(`Không đủ tiền để vào ${D.MKTS[sel.enter].name} bằng ${D.MODES[sel.enterMode].name} (cần ${money(enterCost)}). Chọn cách vào rẻ hơn hoặc bỏ mục 3.`, `Not enough cash to enter ${D.MKTS[sel.enter].name} via ${D.MODES[sel.enterMode].nameEn} (needs ${money(enterCost)}). Pick a cheaper mode or skip step 3.`)}</p>` : ''}
      </div>
      <button class="bn2-btn pri block" style="margin-top:14px" data-act="commit" ${ready ? '' : 'disabled'}>${T('Chốt quý', 'Commit quarter')} ${s.q + 1} →</button>
      ${!ready ? `<p class="bn2-small bn2-muted" style="margin:6px 0 0;text-align:center">${sel.prio === null ? T('Chọn Ưu tiên (bước 1) để chốt.', 'Pick a Priority (step 1) to commit.') : sel.enter !== null && sel.shipMode == null ? T('Chọn cách vận chuyển cho thị trường mới.', 'Pick a shipping method for the new market.') : ''}</p>` : ''}
    </section>`;
  }

  /* ---------- thẻ biến cố ---------- */
  function viewEvent(ev) {
    return `<section class="bn2-card bp2-evt" aria-labelledby="bp2-ev-h">
      ${ev.img ? `<img src="${esc(ev.img)}" alt="">` : ''}
      <p class="bn2-eyebrow" style="margin-top:12px">${T('Quý', 'Quarter')} ${ev.q}/6 · ${T('Biến cố', 'Event')}</p>
      <h2 id="bp2-ev-h" style="font-size:24px;margin:6px 0">${ev.cat} ${esc(ev.title)}</h2>
      <p class="desc">${ev.desc}</p>
      <p class="bn2-small bn2-muted" style="margin:12px 0 4px">${T('Bạn chọn cách nào?', 'What do you do?')}</p>
      ${ev.choices.map((c, i) => `<button type="button" class="bp2-choice" data-act="ev" data-v="${i}">${esc(c)}</button>`).join('')}
    </section>`;
  }

  /* ---------- thẻ kết quả quý ---------- */
  function viewResult(s, post) {
    const d = post.delta || {}, r = api().rival();
    const verdict = d.profit >= 1 ? ['win', T('🎉 Quý bứt phá!', '🎉 Breakout quarter!')] : d.profit >= 0 ? ['win', T('📈 Quý ổn định', '📈 Steady quarter')] : ['lose', T('📉 Quý khó khăn', '📉 Tough quarter')];
    const chip = (ic, l, v, unit) => Math.round(v * 10) === 0 ? '' : `<span class="bn2-chip ${v > 0 ? 'up' : 'down'}">${ic} ${l} ${sgn(v)}${unit || ''}</span>`;
    const logs = api().logs(6).filter(h => !/🧾/.test(h));
    return `<section class="bn2-card" aria-labelledby="bp2-res-h">
      <p class="bn2-eyebrow">${T('Kết quả quý', 'Quarter result')} ${post.qDone}/6</p>
      <div class="bn2-flag ${verdict[0]}" id="bp2-res-h">${verdict[1]}</div>
      <div class="bn2-kpis">
        <div class="bn2-kpi"><span>${T('Lãi/lỗ quý', 'Quarter profit')}</span><b class="${d.profit >= 0 ? 'pos' : 'neg'}">${sgn(d.profit || 0)}${TY()}</b></div>
        <div class="bn2-kpi"><span>${T('Tiền mặt', 'Cash')}</span><b>${money(s.cash)}</b></div>
        <div class="bn2-kpi"><span>${T('LN tích luỹ', 'Cumulative profit')}</span><b>${money(s.profit)}</b></div>
        <div class="bn2-kpi"><span>${T('Chi ngoài LN', 'Spend outside profit')}</span><b>${money((d.profit || 0) - (d.cash || 0))}</b></div>
      </div>
      <div class="bn2-row" style="margin-top:10px">${chip('⭐', T('Uy tín', 'Reputation'), d.rep || 0)}${chip('🏭', T('Năng lực', 'Capability'), d.capab || 0)}${chip('🛡️', T('Chống chịu', 'Resilience'), d.resil || 0)}${chip('🌱', T('Bền vững', 'Sustainability'), d.susts || 0)}</div>
      <h3 style="font-size:17px;margin:16px 0 6px">${T('Theo thị trường', 'By market')}</h3>
      ${post.lines.length ? `<div style="overflow-x:auto"><table class="bp2-table"><thead><tr><th>${T('Thị trường', 'Market')}</th><th>${T('Doanh thu', 'Revenue')}</th><th>${T('Lợi nhuận', 'Profit')}</th><th>😊</th></tr></thead>
        <tbody>${post.lines.map(l => { const mk = D.MKTS[l.m], sh = D.SHIP_MODES[l.ship == null ? 0 : l.ship]; return `<tr><td>${mk.icon} ${esc(mk.name)} <span class="bn2-muted">${sh.icon}${l.delayed ? ' ⚠️ ' + T('chậm hàng', 'delayed') : ''}</span></td><td>${money(l.rev)}</td><td class="${l.pf >= 0 ? 'pos' : 'neg'}">${sgn(l.pf)}</td><td>${l.cust}</td></tr>`; }).join('')}</tbody></table></div>`
        : `<p class="bn2-small bn2-muted">${T('Chưa hiện diện thị trường nào – quý này không có doanh thu quốc tế.', 'No market yet – no international revenue this quarter.')}</p>`}
      <div class="bp2-note" style="margin-top:12px">${r.icon} <b>${esc(r.name)}</b>: ${T('lợi nhuận ước', 'estimated profit')} ${money(r.profit)} · ${s.profit >= r.profit ? T('bạn vẫn đang dẫn trước.', 'you are still ahead.') : T('bạn đang bị dẫn – tăng tốc thôi!', 'you are behind – time to pick up the pace!')}</div>
      <h3 style="font-size:17px;margin:16px 0 6px">${T('Chuyện gì đã xảy ra', 'What happened')}</h3>
      <ul class="bp2-log">${logs.map(h => `<li>${h}</li>`).join('')}</ul>
      <button class="bn2-btn pri block" style="margin-top:16px" data-act="next">📅 ${T('Sang quý', 'Go to quarter')} ${post.qDone + 1} →</button>
    </section>`;
  }

  /* ---------- màn kết thúc: hiện màn Kết thúc của engine ---------- */
  function viewEnd(s) {
    return viewTop(s) + `<main id="bp2-main" class="bn2-wrap"><section class="bn2-card" style="text-align:center">
      <p class="bn2-eyebrow">${T('Hành trình đã kết thúc', 'The journey is over')}</p>
      <h1 style="font-size:30px;margin:6px 0">${esc(team() || D.FIRMS[s.firm].name)}</h1>
      <p class="bn2-muted" style="margin:6px 0 0">${T('Điểm, huy hiệu, chứng nhận và phần nộp bài cho giảng viên ở ngay dưới – giống hệt bản đầy đủ.', 'Score, medal, certificate and the submission box for your instructor are right below – identical to the full version.')}</p>
      <div class="bn2-row" style="justify-content:center;margin-top:10px"><button class="bn2-btn ghost" data-act="again">🔄 ${T('Chơi ván mới', 'Play a new game')}</button></div>
    </section></main>`;
  }

  function viewHelp() {
    return `<div class="bn2-modal" role="dialog" aria-modal="true" aria-labelledby="bp2-help-h"><div class="bn2-card bp2-help">
      <h2 id="bp2-help-h" style="font-size:24px">❓ ${T('Cách chơi trong 1 phút', 'How to play in 1 minute')}</h2>
      <ol>
        <li><b>${T('Mỗi quý một thẻ', 'One card per quarter')}:</b> ${T('chọn Ưu tiên, Mức vận hành và (nếu muốn) một thị trường mới với cách vào + vận chuyển.', 'pick a Priority, an Operating level and, if you like, one new market with its entry mode and shipping.')}</li>
        <li><b>${T('Xem dự báo rồi mới chốt', 'Read the forecast, then commit')}:</b> ${T('dải doanh thu rộng = thị trường còn mù mờ; mua tin ở «Nâng cao» để thu hẹp.', 'a wide revenue range means the market is still foggy; buy intel under «Advanced» to narrow it.')}</li>
        <li><b>${T('Xử lý biến cố', 'Handle the event')}:</b> ${T('mỗi quý một tình huống thật – chọn cách ứng phó, rồi đọc kết quả quý.', 'one real-world situation each quarter – choose a response, then read the quarter result.')}</li>
        <li><b>${T('Đua với Kim Long', 'Race Kim Long')}:</b> ${T('đối thủ ảo chia thị phần thật với bạn ở mỗi thị trường cả hai cùng có mặt.', 'the virtual rival shares real market share with you wherever you both operate.')}</li>
        <li><b>${T('Điểm cuối', 'Final score')}:</b> ${T('30% lợi nhuận + 20% uy tín + 20% năng lực + 15% thích ứng + 15% bền vững, nhân hệ số bề rộng thị trường. Cạn tiền 2 quý hoặc uy tín sụp là thua sớm.', '30% profit + 20% reputation + 20% capability + 15% adaptability + 15% sustainability, times a market-breadth factor. Two quarters out of cash or a reputation collapse ends the game early.')}</li>
      </ol>
      <div class="bp2-rules">${api().rulesHtml()}</div>
      <p class="bn2-small bn2-muted" style="margin-top:10px">${T('Hướng dẫn chi tiết, video và ban cố vấn: ', 'Detailed guide, video and advisory board: ')}<a href="brand-passport.html">brand-passport.html</a> · <a href="docs/huong-dan-choi-ho-chieu-thuong-hieu.md">docs</a></p>
      <button class="bn2-btn pri block" style="margin-top:14px" data-act="closehelp">${T('Đã hiểu, chơi tiếp', 'Got it, back to the game')}</button>
    </div></div>`;
  }

  /* ---------- vẽ ---------- */
  function render() {
    const el = app(); if (!el) return;
    if (ui.screen === 'start' || !api()) { el.innerHTML = viewStart(); showFrame(false); return; }
    const A = api(), s = st();
    if (A.ended()) { ui.screen = 'end'; el.innerHTML = viewEnd(s); showFrame(true); return; }
    let main;
    if (s.phase === 'evt') {
      const post = A.post();
      main = post ? viewResult(s, post) : viewEvent(A.event());
    } else main = viewDecision(s);
    el.innerHTML = viewTop(s) + `<main id="bp2-main" class="bn2-wrap"><div class="bn2-grid main">
      <div class="bn2-grid">${main}</div>
      <div class="bn2-grid">${viewHud(s)}${viewLog()}</div>
    </div></main>` + (ui.help ? viewHelp() : '');
    showFrame(false);
  }
  // Màn kết thúc: hiện iframe (chỉ còn #bp-end bên trong nhờ CSS .bp-embed) và nới chiều cao theo nội dung.
  function showFrame(on) {
    const fr = $('bp2-engine'); if (!fr) return;
    if (on) {
      fr.hidden = false; fr.classList.add('bp2-frame');
      if (!ui.frameTimer) ui.frameTimer = setInterval(() => {
        try { const h = W.document.documentElement.scrollHeight; if (h > 200) fr.style.height = (h + 24) + 'px'; } catch (e) {}
      }, 400);
    } else {
      fr.hidden = true; fr.classList.remove('bp2-frame'); fr.style.height = '';
      if (ui.frameTimer) { clearInterval(ui.frameTimer); ui.frameTimer = null; }
    }
  }

  /* ---------- hành động ---------- */
  async function begin(teamName, classId) {
    ls('bp-team', teamName); ls('bp-class', classId.toUpperCase());
    call('bpFirm', ui.firm); call('bpStart');
    // Hành trình 3 bậc (?journey=): hỏi nhận hành trang Bậc 2 → 3 ở trang mẹ (iframe đang ẩn), rồi áp vào engine.
    if (window.BizOnJourneyLink && ui.journey && ui.journey.active) {
      const applied = await BizOnJourneyLink.offerCarry(ui.journey, { variant: 'brand' });
      call('bpApplyCarry', applied);
    }
    ui.screen = 'play'; ui.adv = false; ui.note = ''; render();
  }
  function pickMarket(v) {
    const s = st(), sel = s.sel;
    if (v === '') { if (sel.enter !== null) call('bpEnter', sel.enter, sel.enterMode); return; }
    const m = +v; if (sel.enter === m) return;
    let mode = sel.enterMode;
    if (mode == null) { const a = api().aibis(m) || {}; mode = 1; D.MODES.forEach(md => { if (a[md.id] != null && (a[mode] == null || a[md.id] > a[mode])) mode = md.id; }); }
    call('bpEnter', m, mode);
    if (st().sel.shipMode == null) call('bpShip', 0);   // mặc định đường biển, đổi được ngay bên dưới
    ui.intelMkt = m;
  }
  function onClick(e) {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act, v = b.dataset.v;
    if (act === 'lang') { const n = lang() === 'en' ? 'vi' : 'en'; ls('bizon-lang', n); document.documentElement.lang = n; try { if (W) W.dispatchEvent(new Event('bizon:langchange')); } catch (x) {} render(); return; }
    if (act === 'firm') { ui.firm = +v; document.querySelectorAll('[data-act=firm]').forEach(x => { const on = +x.dataset.v === ui.firm; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); return; } // không vẽ lại form để không mất chữ đã gõ
    if (act === 'resume') { if (!api()) return; call('bpResume'); ui.screen = 'play'; render(); return; }
    if (act === 'help') { ui.help = true; render(); return; }
    if (act === 'closehelp') { ui.help = false; render(); return; }
    if (act === 'again') { try { localStorage.removeItem('bizon-bp-save'); } catch (x) {} location.reload(); return; }
    if (!api()) return;
    const s = st();
    if (act === 'adv') { ui.adv = !ui.adv; render(); return; }
    if (s.phase === 'evt') {
      if (act === 'ev' && !api().post()) { call('bpEv', +v); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      if (act === 'next' && api().post()) { call('bpNext'); ui.adv = false; ui.note = ''; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      return;
    }
    if (act === 'prio') { call('bpPick', 'prio', +v); render(); return; }
    if (act === 'bud') { call('bpPick', 'bud', +v); render(); return; }
    if (act === 'mode') { if (s.sel.enter !== null && s.sel.enterMode !== +v) { call('bpEnter', s.sel.enter, +v); call('bpShip', 0); } render(); return; }
    if (act === 'ship') { call('bpShip', +v); render(); return; }
    if (act === 'intel') { call('bpIntel', +v, ui.intelMkt); ui.note = (api().logs(1)[0] || ''); render(); return; }
    if (act === 'buy') { call('bpBuyItem', v); ui.note = (api().logs(1)[0] || ''); render(); return; }
    if (act === 'use') { if (v === 'SCOUT') call('bpUseItem', v, ui.intelMkt); else call('bpUseItem', v); ui.note = (api().logs(1)[0] || ''); render(); return; }
    if (act === 'commit') {
      const sel = s.sel; if (sel.prio === null || (sel.enter !== null && sel.shipMode == null)) return;
      call('bpToDecide'); call('bpCommit'); ui.adv = false; ui.note = ''; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); return;
    }
  }
  function onChange(e) {
    const el = e.target.closest('[data-sel]'); if (!el || !api()) return;
    if (el.dataset.sel === 'mkt') { pickMarket(el.value); render(); }
    if (el.dataset.sel === 'intelMkt') { ui.intelMkt = +el.value; render(); }
  }
  function onInput(e) {
    const el = e.target; if (!el || !el.name) return;
    if (el.name === 'team') ui.team = el.value;
    if (el.name === 'classId') ui.klass = el.value;
  }
  function onSubmit(e) {
    if (!e.target || e.target.id !== 'bp2-login') return;
    e.preventDefault(); if (!api()) return;
    const fd = new FormData(e.target);
    begin(String(fd.get('team') || '').trim(), String(fd.get('classId') || '').trim());
  }

  function start() {
    ui.journey = window.BizOnJourneyLink ? BizOnJourneyLink.attach('t3', undefined, { variant: 'brand' }) : null;   // hành trình 3 bậc (?journey=)
    document.addEventListener('click', onClick);
    document.addEventListener('change', onChange);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('input', onInput);
    render(); mountEngine();
  }
  return { start, render, ready: () => readyFlag, engine: () => W, ui };
})();
window.BP2 = BP2;
