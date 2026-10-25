/* BizOn Bến Phù Sa · bản gọn (ben-phu-sa-v2.html) – lớp giao diện, KHÔNG có công thức mô phỏng.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Engine là chính trang ben-phu-sa.html, nạp trong iframe ẩn với ?embed=1. Tệp này chỉ:
 * - đọc trạng thái qua cửa sổ chỉ-đọc window.ftTest của khung đó (data, state, phase, forecast, weekLogs, rivals, shop…);
 * - gọi đúng các hàm công khai mà giao diện gốc gọi: ftTeam, ftCap, ftStart, ftPick, ftPickPair, ftBuyItem, ftUseItem,
 *   ftCommit, ftRitualNext;
 * - vẽ mỗi tuần thành MỘT thẻ đi từng bước (Món hàng → Địa điểm → Cách bán, vật phẩm trong «Nâng cao») có dự báo trước
 *   khi chốt, rồi một thẻ kết quả tuần; lễ cúng Bà Cậu giữa mùa là một thẻ riêng – theo khuôn bat-nghiep-v2.html.
 * Ván xong thì hiện màn Kết thúc của engine (xếp hạng, hiệu suất, đáp án, chứng nhận, nộp bài) từ iframe, không vẽ lại.
 */
const BPS2 = (() => {
  const $ = id => document.getElementById(id);
  const app = () => $('bps2-app');
  const lang = () => { try { return localStorage.getItem('bizon-lang') || 'vi'; } catch (e) { return 'vi'; } };
  const T = (vi, en) => lang() === 'en' ? en : vi;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const f1 = v => (Math.round(v * 10) / 10 || 0).toLocaleString(lang() === 'en' ? 'en-US' : 'vi-VN', { maximumFractionDigits: 1 });
  const MU = () => T(' triệu ₫', ' mn ₫');
  const money = v => f1(v) + MU();
  const sgn = v => (v > 0 ? '+' : '') + f1(v);
  const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };

  let W = null, D = null, readyFlag = false;
  const ui = { screen: 'start', team: 0, cap: 0, view: 'decide', adv: false, note: '', help: false, frameTimer: null, teamName: null, klass: null, lastWeek: 0 };
  const api = () => (W && W.ftTest) || null;
  const st = () => api().state();
  const call = (fn, ...args) => { try { return W[fn](...args); } catch (e) { console.error('bps2:', fn, e); return undefined; } };

  function mountEngine() {
    const fr = $('bps2-engine');
    fr.src = 'ben-phu-sa.html?embed=1';
    fr.addEventListener('load', () => { if (ui.screen === 'end') location.reload(); });
    const tick = setInterval(() => {
      try {
        const w = fr.contentWindow;
        if (w && w.ftTest && typeof w.ftStart === 'function' && typeof w.ftTest.data === 'function') {
          clearInterval(tick); W = w; D = w.ftTest.data(); readyFlag = true;
          if (ui.screen === 'start') render();
        }
      } catch (e) { /* khung chưa sẵn sàng */ }
    }, 120);
  }
  const team = () => (ls('bps-team') || '').trim();
  const klass = () => (ls('bps-class') || '').trim().toUpperCase();
  const mName = i => T(D.MENUS[i][1], D.MENUS[i][3]), mSub = i => T(D.MENUS[i][2], D.MENUS[i][4]);
  const lName = i => T(D.LOCS[i][1], D.LOCS[i][3]), lSub = i => T(D.LOCS[i][2], D.LOCS[i][4]);
  const mdName = i => T(D.METHODS[i].name, D.METHODS[i].nameEn);
  const MD_HELP = [
    { vi: 'Thuê ghe, bán gấp ba – nhưng mất 1,5 triệu phí dù bán được hay không. Dùng khi đã biết chắc món và chỗ.', en: 'Hire a boat and sell triple – but pay 1.5 mn whether it sells or not. Use once you know the product and spot.' },
    { vi: 'Không tốn phí, bán ít nhưng nghe ngóng được nhiều tin ở chợ. Cách thử rẻ nhất.', en: 'No fee, small sales, but you pick up lots of market talk. The cheapest way to test.' },
    { vi: 'Tuần này không bán gì, trả 0,3 triệu để xem sổ cũ của tiểu thương: cặp bán chạy nhất mùa trước (có thể lỗi thời).', en: 'No sales this week; pay 0.3 mn for the old trader ledger: last season\'s best pair (may be stale).' },
  ];

  /* ---------- màn mở đầu ---------- */
  function viewStart() {
    const teams = D ? D.TEAMS : [];
    const members = teams.length ? teams[ui.team].members : [];
    return `<main id="bps2-main" class="bn2-hero"><div class="bn2-card">
      <div class="bn2-row" style="justify-content:space-between">
        <img class="logo" src="assets/brand/bizon-wordmark-ink.png" alt="BizOn">
        <button class="bn2-iconbtn" data-act="lang">${T('EN', 'VI')}</button>
      </div>
      <p class="bn2-eyebrow" style="margin-top:14px">${T('Bậc 1 · Khởi sự kinh doanh · bản gọn', 'Level 1 · Venture start-up · lean version')}</p>
      <h1 style="font-size:36px;margin:6px 0 4px">🧺 Bến Phù Sa</h1>
      <p class="bn2-muted">${T('Năm tuần bán hàng ở một thị trấn sông nước, đấu với 3 đối thủ ảo. Mỗi tuần chỉ ba bước: chọn Món hàng, chọn Địa điểm, chọn Cách bán – có dự báo trước khi chốt. Cùng engine và bảng xếp hạng với bản đầy đủ.', 'Five weeks of selling in a river town, against 3 virtual rivals. Each week only three steps: pick a Product, a Location and a Way to sell – with a forecast before you commit. Same engine and leaderboard as the full version.')}</p>
      <form id="bps2-login" style="margin-top:16px">
        <label class="bn2-small"><b>${T('Tên đội', 'Team name')}</b> <span class="bn2-muted">${T('(tuỳ chọn)', '(optional)')}</span>
          <input class="bn2-input" name="team" maxlength="40" value="${esc(ui.teamName == null ? team() : ui.teamName)}" placeholder="${T('VD: Đội Rồng Xanh', 'e.g. Green Dragon')}"></label>
        <label class="bn2-small" style="display:block;margin-top:10px"><b>${T('Mã lớp', 'Class code')}</b> <span class="bn2-muted">${T('(tuỳ chọn – dùng khi nộp kết quả)', '(optional – used when submitting)')}</span>
          <input class="bn2-input" name="classId" maxlength="40" autocomplete="off" value="${esc(ui.klass == null ? klass() : ui.klass)}"></label>
        <p class="bn2-small" style="margin:12px 0 0"><b>${T('Đội mẫu', 'Team roster')}</b></p>
        <div class="bn2-seg" role="group">${teams.map((t, i) => `<button type="button" data-act="team" data-v="${i}" class="${ui.team === i ? 'on' : ''}" aria-pressed="${ui.team === i}">${t.icon} ${esc(T(t.name, t.nameEn))}</button>`).join('')}</div>
        <p class="bn2-small" style="margin:12px 0 0"><b>${T('Thuyền trưởng', 'Captain')}</b></p>
        <div class="bps2-cap" style="grid-template-columns:repeat(${Math.min(5, members.length || 1)},minmax(0,1fr))">${members.map((m, i) => `<button type="button" data-act="cap" data-v="${i}" class="${ui.cap === i ? 'on' : ''}" aria-pressed="${ui.cap === i}"><img src="${esc(m.img)}" alt="">${esc(m.name)}<small style="display:block;font-weight:600;opacity:.6">${esc(T(m.role, m.roleEn))}</small></button>`).join('')}</div>
        <button class="bn2-btn pri block" style="margin-top:16px" type="submit" ${readyFlag ? '' : 'disabled'}>${readyFlag ? T('Bắt đầu 5 tuần', 'Start the 5 weeks') : `<span class="bp2-loading"><i></i>${T('Đang nạp engine…', 'Loading the engine…')}</span>`}</button>
      </form>
      <p class="bn2-small bn2-muted" style="margin-top:14px">${T('Muốn bản đầy đủ (luật chơi chi tiết, góc văn hoá thương hồ, nhạc)?', 'Want the full version (detailed rules, river-trader culture, music)?')} <a href="ben-phu-sa.html">ben-phu-sa.html</a> · <a href="ben-phu-sa-3d.html">${T('bản 3D', '3D version')}</a></p>
    </div></main>`;
  }

  /* ---------- thanh trên + cột phải ---------- */
  function viewTop(s) {
    const name = team() || T(D.TEAMS[s.team].name, D.TEAMS[s.team].nameEn);
    return `<header class="bn2-top"><div class="bn2-wrap">
      <img class="logo" src="assets/brand/bizon-wordmark-ink.png" alt="BizOn">
      <div style="min-width:0"><div class="team">${esc(name)}</div><div class="bp2-top-sub sub">⚓ ${esc(D.TEAMS[s.team].members[s.cap].name)}${klass() ? ' · ' + esc(klass()) : ''}</div></div>
      <div class="sp"></div>
      <div class="bps2-dots" aria-label="${T('Tiến trình 5 tuần', '5-week progress')}">${[0, 1, 2, 3, 4].map(i => `<span class="${i < s.week ? 'done' : i === s.week ? 'cur' : ''}">${i < s.week ? '✓' : i + 1}</span>`).join('')}</div>
      <div class="bn2-cash" title="${T('Lợi nhuận tích luỹ', 'Cumulative profit')}">💰 ${money(s.total)}</div>
      <button class="bn2-iconbtn" data-act="lang">${T('EN', 'VI')}</button>
      <button class="bn2-iconbtn" data-act="help" aria-label="${T('Cách chơi', 'How to play')}">❓</button>
    </div></header>`;
  }
  function viewHud(s) {
    const rv = api().rivals();
    const rows = [{ me: true, name: team() || T(D.TEAMS[s.team].name, D.TEAMS[s.team].nameEn), img: D.TEAMS[s.team].members[s.cap].img, total: s.total, sub: T('Đội bạn', 'Your team') }]
      .concat(rv.map(r => ({ name: r.name, img: r.img, total: r.total, sub: r.style }))).sort((a, b) => b.total - a.total);
    const known = Object.keys(s.knownPairs).length;
    return `<section class="bn2-card"><h2 style="font-size:20px">${T('Bảng xếp hạng', 'Standings')}</h2>
      <div class="bps2-rank">${rows.map((r, i) => `<div class="row ${r.me ? 'me' : ''}"><img src="${esc(r.img)}" alt=""><div style="min-width:0">${['🥇', '🥈', '🥉', '4️⃣'][i]} ${esc(r.name)}<small style="display:block;font-weight:500;color:var(--clay-sub)">${esc(r.sub)}</small></div><b>${money(r.total)}</b></div>`).join('')}</div>
      <div class="bp2-hud"><div><span>🪙 ${T('Vốn riêng mua vật phẩm', 'Item budget')}</span><b>${money(s.budget)}</b></div><div><span>🔎 ${T('Cặp đã biết nhu cầu', 'Pairs with known demand')}</span><b>${known}/18</b></div><div><span>🛍️ ${T('Đã chi vật phẩm', 'Spent on items')}</span><b>${money(s.shopSpent)}</b></div></div>
    </section>`;
  }
  function viewLog() {
    const rows = api().logs(8); if (!rows.length) return '';
    return `<section class="bn2-card"><h2 style="font-size:20px">${T('Nhật ký thương hồ', 'Trader\'s log')}</h2><ul class="bp2-log">${rows.map(li => li.replace(/^<li>/, '<li>').replace(/<\/li>$/, '')).map(h => `<li>${h.replace(/^<li>/, '')}</li>`).join('')}</ul></section>`;
  }

  /* ---------- thẻ quyết định ---------- */
  function viewDecide(s) {
    const A = api(), sel = s.sel, w = s.week;
    const news = w > 0 ? A.weekLogs(w).filter(li => !/^<li><b>(Tuần|Week) \d+:<\/b> (⛵|🧺|📋) /.test(li)) : [];
    const fr = A.forecast();
    const research = sel.m === 2;
    const ready = sel.m !== null && (research || (sel.menu !== null && sel.loc !== null));
    const shop = A.shop();
    return `<section class="bn2-card" aria-labelledby="bps2-dec-h">
      <p class="bn2-eyebrow">${T('Tuần', 'Week')} ${w + 1}/5 · ${w > 0 ? T('Tin nghe được tuần trước', 'What you heard last week') : T('Tuần đầu', 'First week')}</p>
      ${w > 0 && news.length ? `<ul class="bps2-news" style="margin:8px 0 0;padding:0">${news.map(li => li.replace(/^<li>/, '<li>')).join('')}</ul>`
        : `<div class="bp2-note">${T('Chưa có tin gì. Gợi ý: tuần đầu bán bằng gánh hàng rong (không phí) để nghe ngóng, rồi những tuần sau mới thuê ghe cho cặp đã biết chắc.', 'No news yet. Tip: sell from the street cart in week 1 (no fee) to listen around, then hire the boat later for a pair you know.')}</div>`}

      <h2 id="bps2-dec-h" style="font-size:22px;margin-top:18px">${T('Quyết định tuần', 'Decisions for week')} ${w + 1}</h2>
      <p class="bp2-step"><span>1</span>${T('Món hàng', 'Product')}</p>
      <div class="bps2-menu">${D.MENUS.map((m, i) => `<button type="button" class="bp2-opt ${sel.menu === i ? 'on' : ''}" data-act="menu" data-v="${i}" aria-pressed="${sel.menu === i}" ${research ? 'disabled' : ''}><span class="ic">${m[0]}</span>${esc(mName(i))}<small>${esc(mSub(i))}</small></button>`).join('')}</div>
      <p class="bp2-step"><span>2</span>${T('Địa điểm', 'Location')} <span class="bn2-muted" style="display:inline;width:auto;height:auto;background:none;color:var(--clay-sub);font-weight:500;text-transform:none;letter-spacing:0">(${T('✓ = đã biết nhu cầu của món đang chọn ở đó', '✓ = demand known for the chosen product there')})</span></p>
      <div class="bps2-locs">${D.LOCS.map((l, i) => { const dm = sel.menu !== null ? A.demand(sel.menu, i) : null;
        return `<button type="button" class="bp2-opt ${sel.loc === i ? 'on' : ''}" data-act="loc" data-v="${i}" aria-pressed="${sel.loc === i}" ${research ? 'disabled' : ''}><span class="ic">${l[0]}</span>${esc(lName(i))}<small>${esc(lSub(i))}</small>${dm != null ? `<span class="tag known">✓ ${f1(dm)}</span>` : (sel.menu !== null ? '<span class="tag">?</span>' : '')}</button>`; }).join('')}</div>
      <p class="bp2-step"><span>3</span>${T('Cách bán', 'How to sell')}</p>
      <div class="bps2-methods">${D.METHODS.map((md, i) => `<button type="button" class="bp2-opt ${sel.m === i ? 'on' : ''}" data-act="method" data-v="${i}" aria-pressed="${sel.m === i}"><span class="ic">${md.icon}</span><b>${esc(mdName(i))}</b><small>${esc(T(MD_HELP[i].vi, MD_HELP[i].en))}</small></button>`).join('')}</div>

      <button type="button" class="bp2-more" data-act="adv" aria-expanded="${ui.adv}">${T('Nâng cao: vật phẩm', 'Advanced: items')} (${T('vốn riêng', 'budget')} ${money(s.budget)})</button>
      ${ui.adv ? `<div class="bn2-sunk"><p class="bn2-small bn2-muted" style="margin:0 0 8px">${T('Mua bằng vốn riêng nhỏ; tiền mua trừ thẳng vào lợi nhuận như mọi chi phí khác.', 'Paid from a small side budget; the cost is deducted from profit like any other expense.')}</p>
        <div class="bp2-list">${shop.map(it => `<div class="bp2-item"><span class="ic">${it.icon}</span><div><b>${esc(it.name)}${it.count ? ' ×' + it.count : ''}</b><small>${esc(it.desc)}${it.pending ? ' · ' + T('đã kích hoạt', 'active') : ''}</small></div>
          <div style="display:grid;gap:4px">${it.owned ? `<span class="bn2-small bn2-muted">✅ ${T('đã có', 'owned')}</span>` : `<button type="button" class="bn2-btn" data-act="buy" data-v="${it.id}" ${it.afford ? '' : 'disabled'}>${money(it.price)}</button>`}
          ${it.type === 'consumable' && it.count ? `<button type="button" class="bn2-btn pri" data-act="use" data-v="${it.id}" ${it.canUse ? '' : 'disabled'}>${T('Dùng', 'Use')}</button>` : ''}</div></div>`).join('')}</div>
        ${ui.note ? `<div class="bp2-note">${ui.note}</div>` : ''}</div>` : ''}

      <div class="bn2-sunk" style="margin-top:14px"><p class="bn2-small" style="margin:0 0 8px"><b>${T('Dự báo trước khi chốt', 'Forecast before you commit')}</b> <span class="bn2-muted">${T('(chưa tính đụng độ với đối thủ)', '(before any rival clash)')}</span></p>
        ${research ? `<p class="bn2-small" style="margin:0">📋 ${T('Tuần này không bán. Trả', 'No sales this week. You pay')} <b>${money(D.SURVEY_COST)}</b> ${T('để xem sổ cũ: cặp bán chạy nhất mùa trước.', 'to read the old ledger: last season\'s best-selling pair.')}</p>`
        : fr ? `<div class="bn2-fc"><div><span>${T('Lợi nhuận tuần ước', 'Est. weekly profit')}</span><b class="${fr.lo >= 0 ? 'pos' : fr.hi < 0 ? 'neg' : ''}">${sgn(fr.lo)} … ${sgn(fr.hi)}${MU()}</b></div><div><span>${T('Phí cố định', 'Fixed cost')}</span><b>${money(fr.cost)}</b></div></div>
          <p class="bn2-small bn2-muted" style="margin:8px 0 0">${fr.known ? T('Dải hẹp vì bạn đã biết nhu cầu cặp này.', 'Narrow range because you already know this pair\'s demand.') : T('Dải rộng vì chưa biết nhu cầu – bán thử bằng gánh hoặc dùng Thám tử chợ để thu hẹp.', 'Wide range because demand is unknown – test with the cart or use the Market Scout to narrow it.')}</p>`
        : `<p class="bn2-small" style="margin:0">${T('Chọn đủ Món hàng, Địa điểm và Cách bán để xem dự báo.', 'Pick a Product, Location and Way to sell to see the forecast.')}</p>`}
      </div>
      <button class="bn2-btn pri block" style="margin-top:14px" data-act="commit" ${ready ? '' : 'disabled'}>${T('Chốt tuần', 'Commit week')} ${w + 1} →</button>
    </section>`;
  }

  /* ---------- thẻ kết quả tuần ---------- */
  function viewResult(s) {
    const A = api(), w = ui.lastWeek, h = s.history[s.history.length - 1] || {};
    const logs = A.weekLogs(w + 1);
    const sale = logs.find(li => /^<li><b>(Tuần|Week) \d+:<\/b> (⛵|🧺|📋) /.test(li)) || '';
    const others = logs.filter(li => li !== sale && !/⚔️/.test(li));
    const rv = A.rivals();
    const clash = h.m !== 2 && h.loc != null ? rv.filter(r => r.lastLoc === h.loc).length : 0;
    const verdict = h.m === 2 ? ['lose', '📋 ' + T('Tuần khảo sát', 'Survey week')] : h.net >= 2 ? ['win', '🎉 ' + T('Tuần bội thu!', 'Bumper week!')] : h.net >= 0 ? ['win', '📈 ' + T('Tuần có lãi', 'Profitable week')] : ['lose', '📉 ' + T('Tuần lỗ', 'Loss-making week')];
    const next = s.week >= 5 ? T('🏁 Xem tổng kết 5 tuần →', '🏁 See the 5-week summary →') : api().phase() === 'ritual' ? T('🕯️ Rằm giữa mùa →', '🕯️ Mid-season full moon →') : T('Sang tuần', 'Go to week') + ' ' + (s.week + 1) + ' →';
    return `<section class="bn2-card bps2-result" aria-labelledby="bps2-res-h">
      <p class="bn2-eyebrow">${T('Kết quả tuần', 'Week result')} ${w + 1}/5</p>
      <div class="bn2-flag ${verdict[0]}" id="bps2-res-h">${verdict[1]}</div>
      <div class="bn2-kpis"><div class="bn2-kpi"><span>${T('Lãi/lỗ tuần', 'Week profit')}</span><b class="${h.net >= 0 ? 'pos' : 'neg'}">${sgn(h.net || 0)}${MU()}</b></div><div class="bn2-kpi"><span>${T('Lợi nhuận tích luỹ', 'Cumulative profit')}</span><b>${money(s.total)}</b></div>
        <div class="bn2-kpi"><span>${T('Đụng độ', 'Clashes')}</span><b>${clash ? '⚡ ' + clash : '0'}</b></div><div class="bn2-kpi"><span>${T('Hạng hiện tại', 'Current rank')}</span><b>${['🥇', '🥈', '🥉', '4️⃣'][rv.filter(r => r.total > s.total).length]}</b></div></div>
      ${sale ? `<div class="bp2-note" style="margin-top:12px">${sale.replace(/^<li><b>[^<]*<\/b> /, '').replace(/<\/li>$/, '')}</div>` : ''}
      <h3 style="font-size:17px;margin:16px 0 6px">${T('Đối thủ tuần này', 'Rivals this week')}</h3>
      <div class="bps2-rank">${rv.map(r => `<div class="row"><img src="${esc(r.img)}" alt=""><div>${r.icon} ${esc(r.name)}<small style="display:block;font-weight:500;color:var(--clay-sub)">${r.lastLoc != null ? (r.lastBoat ? '⛵ ' : '🧺 ') + esc(lName(r.lastLoc)) : ''}${h.m !== 2 && r.lastLoc === h.loc ? ' · ⚡ ' + T('cùng chỗ với bạn', 'same spot as you') : ''}</small></div><b>${money(r.total)}</b></div>`).join('')}</div>
      ${others.length ? `<h3 style="font-size:17px;margin:16px 0 6px">${T('Nghe ngóng & điềm báo', 'Street talk & omens')}</h3><ul class="bps2-news" style="margin:0;padding:0">${others.join('')}</ul>` : ''}
      <button class="bn2-btn pri block" style="margin-top:16px" data-act="next">${next}</button>
    </section>`;
  }

  /* ---------- lễ cúng Bà Cậu ---------- */
  function viewRitual() {
    return `<section class="bn2-card bps2-ritual"><p class="big">🕯️</p>
      <p class="bn2-eyebrow">${T('Rằm giữa mùa', 'Mid-season full moon')}</p>
      <h2 style="font-size:24px;margin:6px 0">${T('Lễ cúng Bà Cậu', 'The Bà Cậu offering')}</h2>
      <p class="bn2-muted" style="max-width:520px;margin:8px auto 0">${T('Theo tục thương hồ miền Tây, ngày 16 và 29 âm lịch chủ ghe bày mâm cúng trước mũi ghe tạ ơn Bà Cậu: vịt luộc, ba chén cháo, trà, rượu, bánh ngọt. Người xưa tin Bà Cậu phạt kẻ mua bán gian dối.', 'By Mekong river-trader custom, on the 16th and 29th lunar days boat owners lay an offering at the bow to thank Bà Cậu: boiled duck, three bowls of porridge, tea, rice wine, sweet cakes. The old belief holds that Bà Cậu punishes cheating traders.')}</p>
      <p style="margin:16px 0 8px"><b>${T('Tuần vừa qua bạn có cân đủ, niêm yết giá thật với khách không?', 'This past week, did you weigh fairly and post honest prices?')}</b></p>
      <div class="bn2-row" style="justify-content:center"><button class="bn2-btn teal" data-act="ritual" data-v="1">🕯️ ${T('Có – tôi bán thật', 'Yes – I sold honestly')}</button><button class="bn2-btn" data-act="ritual" data-v="0">🤔 ${T('Tôi sẽ giữ mình hơn', 'I\'ll be more careful')}</button></div>
      <p class="bn2-small bn2-muted" style="margin-top:12px">${T('Chỉ để suy ngẫm – không cộng trừ điểm.', 'For reflection only – no points added or subtracted.')}</p></section>`;
  }

  /* ---------- kết thúc: màn của engine ---------- */
  function viewEnd(s) {
    return viewTop(s) + `<main id="bps2-main" class="bn2-wrap"><section class="bn2-card" style="text-align:center">
      <p class="bn2-eyebrow">${T('Hết 5 tuần', 'Five weeks are over')}</p>
      <h1 style="font-size:30px;margin:6px 0">${esc(team() || T(D.TEAMS[s.team].name, D.TEAMS[s.team].nameEn))}</h1>
      <p class="bn2-muted" style="margin:6px 0 0">${T('Xếp hạng, hiệu suất so với kịch bản hoàn hảo, đáp án của ván, chứng nhận và phần nộp bài ở ngay dưới – giống hệt bản đầy đủ.', 'Standings, efficiency versus perfect play, this run\'s answer key, certificate and submission are right below – identical to the full version.')}</p>
      <div class="bn2-row" style="justify-content:center;margin-top:10px"><button class="bn2-btn ghost" data-act="again">🔄 ${T('Chơi ván mới', 'Play a new game')}</button></div>
    </section></main>`;
  }
  function viewHelp() {
    return `<div class="bn2-modal" role="dialog" aria-modal="true" aria-labelledby="bps2-help-h"><div class="bn2-card bp2-help">
      <h2 id="bps2-help-h" style="font-size:24px">❓ ${T('Cách chơi trong 1 phút', 'How to play in 1 minute')}</h2>
      <ol><li><b>${T('Ba bước mỗi tuần', 'Three steps each week')}:</b> ${T('chọn Món hàng, chọn Địa điểm, chọn Cách bán, rồi chốt.', 'pick a Product, a Location and a Way to sell, then commit.')}</li>
        <li><b>${T('Thử rẻ trước', 'Test cheap first')}:</b> ${T('gánh hàng rong không tốn phí và cho nhiều tin; ghe hàng bông bán gấp ba nhưng tốn 1,5 triệu mỗi tuần.', 'the street cart is free and brings lots of intel; the trading boat sells triple but costs 1.5 mn a week.')}</li>
        <li><b>${T('Nhu cầu bị ẩn', 'Demand is hidden')}:</b> ${T('mỗi cặp Món × Địa điểm có nhu cầu riêng, mỗi ván mỗi khác. Bán thử hoặc dùng Thám tử chợ để biết.', 'every Product × Location pair has its own demand, different every run. Sell there or use the Market Scout to learn it.')}</li>
        <li><b>${T('Đụng độ', 'Clashes')}:</b> ${T('bán cùng chỗ với đối thủ thì chia nhau khách.', 'selling where a rival sells means splitting the customers.')}</li>
        <li><b>${T('Xếp hạng theo lợi nhuận', 'Ranked by profit')}:</b> ${T('doanh thu trừ phí ghe, phí khảo sát và tiền vật phẩm.', 'revenue minus boat fees, survey fees and item purchases.')}</li></ol>
      <div class="bp2-rules">${api().rulesHtml()}</div>
      <button class="bn2-btn pri block" style="margin-top:14px" data-act="closehelp">${T('Đã hiểu, chơi tiếp', 'Got it, back to the game')}</button></div></div>`;
  }

  /* ---------- vẽ ---------- */
  function render() {
    const el = app(); if (!el) return;
    if (ui.screen === 'start' || !api()) { el.innerHTML = viewStart(); showFrame(false); return; }
    const A = api(), s = st(), ph = A.phase();
    if (ph === 'end' && ui.view !== 'result') { ui.screen = 'end'; el.innerHTML = viewEnd(s); showFrame(true); return; }
    let main;
    if (ui.view === 'result') main = viewResult(s);
    else if (ph === 'ritual') main = viewRitual();
    else main = viewDecide(s);
    el.innerHTML = viewTop(s) + `<main id="bps2-main" class="bn2-wrap"><div class="bn2-grid main"><div class="bn2-grid">${main}</div><div class="bn2-grid">${viewHud(s)}${viewLog()}</div></div></main>` + (ui.help ? viewHelp() : '');
    showFrame(false);
  }
  function showFrame(on) {
    const fr = $('bps2-engine'); if (!fr) return;
    if (on) {
      fr.hidden = false; fr.classList.add('bp2-frame');
      if (!ui.frameTimer) ui.frameTimer = setInterval(() => { try { const h = W.document.documentElement.scrollHeight; if (h > 200) fr.style.height = (h + 24) + 'px'; } catch (e) {} }, 400);
    } else {
      fr.hidden = true; fr.classList.remove('bp2-frame'); fr.style.height = '';
      if (ui.frameTimer) { clearInterval(ui.frameTimer); ui.frameTimer = null; }
    }
  }

  /* ---------- hành động ---------- */
  function onClick(e) {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act, v = b.dataset.v;
    if (act === 'lang') { const n = lang() === 'en' ? 'vi' : 'en'; ls('bizon-lang', n); document.documentElement.lang = n; try { if (W) W.dispatchEvent(new Event('bizon:langchange')); } catch (x) {} render(); return; }
    if (act === 'team') { ui.team = +v; ui.cap = 0; render(); return; }
    if (act === 'cap') { ui.cap = +v; document.querySelectorAll('[data-act=cap]').forEach(x => { const on = +x.dataset.v === ui.cap; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); return; }
    if (act === 'help') { ui.help = true; render(); return; }
    if (act === 'closehelp') { ui.help = false; render(); return; }
    if (act === 'again') { location.reload(); return; }
    if (!api()) return;
    if (act === 'adv') { ui.adv = !ui.adv; render(); return; }
    if (act === 'menu') { call('ftPick', 'menu', +v); render(); return; }
    if (act === 'loc') { call('ftPick', 'loc', +v); render(); return; }
    if (act === 'method') { call('ftPick', 'm', +v); render(); return; }
    if (act === 'buy') { call('ftBuyItem', v); ui.note = (api().logs(1)[0] || '').replace(/<\/?li>/g, ''); render(); return; }
    if (act === 'use') { call('ftUseItem', v); ui.note = (api().logs(1)[0] || '').replace(/<\/?li>/g, ''); render(); return; }
    if (act === 'commit') { const s = st(); if (s.sel.m === null) return; ui.lastWeek = s.week; call('ftCommit'); ui.view = 'result'; ui.adv = false; ui.note = ''; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (act === 'next') { ui.view = 'decide'; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (act === 'ritual') { call('ftRitualNext', v === '1'); ui.view = 'decide'; render(); return; }
  }
  function onInput(e) { const el = e.target; if (!el || !el.name) return; if (el.name === 'team') ui.teamName = el.value; if (el.name === 'classId') ui.klass = el.value; }
  function onSubmit(e) {
    if (!e.target || e.target.id !== 'bps2-login') return;
    e.preventDefault(); if (!api()) return;
    const fd = new FormData(e.target);
    ls('bps-team', String(fd.get('team') || '').trim()); ls('bps-class', String(fd.get('classId') || '').trim().toUpperCase());
    call('ftTeam', ui.team); call('ftCap', ui.cap); call('ftStart');
    ui.screen = 'play'; ui.view = 'decide'; render();
  }
  function start() {
    document.addEventListener('click', onClick); document.addEventListener('submit', onSubmit); document.addEventListener('input', onInput);
    render(); mountEngine();
  }
  return { start, render, ready: () => readyFlag, engine: () => W, ui };
})();
window.BPS2 = BPS2;
