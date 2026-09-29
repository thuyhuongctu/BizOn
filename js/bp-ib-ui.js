/* BizOn Hộ Chiếu – lớp giao diện bảng điều hành + hộ chiếu (không đổi luật chơi, chỉ đọc window.__bp).
 * KPI có sparkline theo quý · dải thị thực với con dấu nhập cảnh · hồ sơ quốc gia · bản đồ toàn màn · bảng điều hành quý và tổng kết.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var B = function () { return window.__bp; };
  var S = function () { return B() && B().S; };
  var EN = function () { return (document.documentElement.lang || '').indexOf('en') === 0 || (function () { try { return localStorage.getItem('bizon-lang') === 'en'; } catch (e) { return false; } })(); };
  var T = function (vi, en) { return EN() ? en : vi; };
  var dec = function (v, d) { var s = (+v).toFixed(d == null ? 1 : d); return EN() ? s : s.replace('.', ','); };
  var clamp = function (v) { return Math.max(0, Math.min(100, Math.round(+v || 0))); };
  // Số liệu làm tròn (≈ 2024, World Bank/IMF) – phục vụ giảng dạy
  var FACTS = {
    us: { cap: 'Washington, D.C.', hub: 'New York', pop: 340, gdp: 29.2, gpc: 86, cur: 'USD', fx: [1, 'Thấp – USD là tiền dự trữ', 'Low – USD is the reserve currency'], log: [3, 'Rất tốt, nhưng xa: 25–35 ngày đường biển', 'Very good but far: 25–35 days by sea'], rv: ['Liberty Naturals', 'Bán thẳng cho khách (D2C), ngân sách quảng cáo lớn', 'Direct-to-consumer, big ad budgets'] },
    de: { cap: 'Berlin', hub: 'Hamburg', pop: 84, gdp: 4.7, gpc: 55, cur: 'EUR', fx: [1, 'Thấp – EUR ổn định', 'Low – stable EUR'], log: [3, 'Hàng đầu thế giới; cảng Hamburg, Rotterdam', 'World-class; Hamburg and Rotterdam ports'], rv: ['Kräuterhaus GmbH', 'Chứng nhận hữu cơ, kênh nhà thuốc', 'Organic certification, pharmacy channel'] },
    kr: { cap: 'Seoul', hub: 'Busan', pop: 52, gdp: 1.9, gpc: 36, cur: 'KRW', fx: [2, 'Vừa – KRW biến động theo xuất khẩu', 'Moderate – KRW moves with exports'], log: [3, 'Rất tốt, gần: 5–7 ngày', 'Very good and close: 5–7 days'], rv: ['Hanbit Beauty', 'Ra mẫu mới mỗi tháng, KOL mạnh', 'Monthly launches, strong KOLs'] },
    nz: { cap: 'Wellington', hub: 'Auckland', pop: 5.3, gdp: 0.26, gpc: 49, cur: 'NZD', fx: [2, 'Vừa – NZD theo giá hàng hoá', 'Moderate – NZD tracks commodities'], log: [2, 'Tốt nhưng xa, ít tuyến trực tiếp', 'Good but remote, few direct routes'], rv: ['Kiwi Pure', 'Nguyên liệu bản địa, nhãn sinh thái', 'Native ingredients, eco-labels'] },
    jp: { cap: 'Tokyo', hub: 'Osaka', pop: 124, gdp: 4.0, gpc: 33, cur: 'JPY', fx: [2, 'Vừa – JPY yếu kéo dài', 'Moderate – prolonged weak JPY'], log: [3, 'Rất tốt, gần: 6–9 ngày', 'Very good and close: 6–9 days'], rv: ['Sakura Wakan', 'Uy tín lâu năm, hệ thống đại lý trung thành', 'Long-standing trust, loyal dealer network'] },
    sg: { cap: 'Singapore', hub: 'Cảng Singapore', hubEn: 'Port of Singapore', pop: 6.0, gdp: 0.55, gpc: 90, cur: 'SGD', fx: [1, 'Thấp – SGD neo theo rổ tiền', 'Low – SGD managed against a basket'], log: [3, 'Số 1 thế giới (LPI 2023), 2–3 ngày', 'World no. 1 (LPI 2023), 2–3 days'], rv: ['Merlion Trading', 'Nhà phân phối khu vực, chiết khấu sâu', 'Regional distributor, deep discounts'] },
    id: { cap: 'Jakarta', hub: 'Surabaya', pop: 281, gdp: 1.4, gpc: 5, cur: 'IDR', fx: [3, 'Cao – IDR biến động mạnh', 'High – volatile IDR'], log: [1, 'Trung bình; phân mảnh theo đảo', 'Average; fragmented across islands'], rv: ['Nusantara Herba', 'Chứng nhận Halal, phủ chợ truyền thống', 'Halal-certified, covers traditional markets'] },
    vn: { cap: 'Hà Nội', hub: 'TP. Hồ Chí Minh', hubEn: 'Ho Chi Minh City', pop: 101, gdp: 0.48, gpc: 4.7, cur: 'VND', fx: [2, 'Vừa – VND điều hành theo biên độ', 'Moderate – managed VND band'], log: [2, 'Khá; cảng Cát Lái, Cái Mép', 'Fair; Cat Lai and Cai Mep ports'], rv: ['Sông Hương Herbal', 'Giá rẻ, phủ TMĐT và chợ truyền thống', 'Low prices, strong e-commerce and wet-market reach'] },
  };
  setInterval(function () { document.querySelectorAll('.ib-rvimg:not([data-done])').forEach(function (el) { el.setAttribute('data-done', '1'); if (window.BPImg && el.dataset.rv) window.BPImg('rival/' + el.dataset.rv + '.webp', function (src) { el.style.height = '110px'; el.innerHTML = '<img src="' + src + '" alt="" style="width:100%;height:100%;object-fit:cover">'; }); }); }, 600);
  var code = function (m) { var b = B(); return b.hostOf ? b.hostOf(m)[0] : ''; };
  var RIVAL_IMG = { us: 'us-liberty-naturals', de: 'de-krauterhaus', kr: 'kr-hanbit', nz: 'nz-kiwi-pure', jp: 'jp-sakura-wakan', sg: 'sg-merlion', id: 'id-nusantara', vn: 'vn-song-huong' };
  var MODE_C = ['m0', 'm1', 'm2', 'm3', 'm4', 'm5'];
  var hist = {}, lastEntered = null, fresh = {};

  function snap() { var s = S(); if (!s) return; var k = s.q; if (!hist[k]) hist[k] = {}; hist[k] = { cash: s.cash, rep: s.rep, capab: s.capab, resil: s.resil, profit: s.profit, know: B().S.know.reduce(function (a, b) { return a + b; }, 0) / 7, mk: s.entered.filter(function (v) { return v !== null && v !== undefined; }).length }; }
  function series(key) { return Object.keys(hist).sort(function (a, b) { return a - b; }).map(function (k) { return hist[k][key]; }); }
  function spark(vals, color) {
    if (vals.length < 2) return '<svg viewBox="0 0 100 22"><line x1="0" y1="18" x2="100" y2="18" stroke="#d6e4e7" stroke-width="1.5"/></svg>';
    var mn = Math.min.apply(0, vals), mx = Math.max.apply(0, vals), r = mx - mn || 1;
    var pts = vals.map(function (v, i) { return (i / (vals.length - 1) * 100).toFixed(1) + ',' + (19 - (v - mn) / r * 16).toFixed(1); });
    return '<svg viewBox="0 0 100 22" preserveAspectRatio="none"><polyline points="' + pts.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>';
  }
  function delta(vals, d) { if (vals.length < 2) return '<span class="ib-d ib-eq">—</span>'; var x = vals[vals.length - 1] - vals[vals.length - 2]; var c = Math.abs(x) < 0.05 ? 'ib-eq' : x > 0 ? 'ib-up' : 'ib-dn'; return '<span class="ib-d ' + c + '">' + (x > 0 ? '▲ +' : x < 0 ? '▼ ' : '') + dec(x, d) + ' ' + T('so với quý trước', 'vs last Q') + '</span>'; }

  function renderKPI() {
    var s = S(), hud = $('bp-hud'); if (!s || !hud) return;
    snap();
    var box = $('ib-kpi'); if (!box) { box = document.createElement('div'); box.id = 'ib-kpi'; hud.parentNode.insertBefore(box, hud); }
    var tiles = [
      ['💰', T('Tiền mặt', 'Cash'), dec(s.cash) + T(' tỷ', ' bn'), 'cash', '#006687', 1],
      ['💹', T('LN tích lũy', 'Cum. profit'), dec(s.profit) + T(' tỷ', ' bn'), 'profit', '#3f8a44', 1],
      ['⭐', T('Uy tín', 'Reputation'), clamp(s.rep), 'rep', '#e8762d', 0],
      ['🏭', T('Năng lực', 'Capability'), clamp(s.capab), 'capab', '#2f8a8c', 0],
      ['🛡️', T('Chống chịu', 'Resilience'), clamp(s.resil), 'resil', '#5a6b74', 0],
      ['📚', T('Tri thức TB', 'Avg. intel'), clamp(series('know').slice(-1)[0]), 'know', '#7a5bb5', 0],
    ];
    box.innerHTML = tiles.map(function (t) { var v = series(t[3]);
      return '<div class="ib-tile"><span class="ib-eyebrow">' + t[0] + ' ' + t[1] + '</span><b>' + t[2] + '</b>' + spark(v, t[4]) + delta(v, t[5]) + '</div>'; }).join('');
    renderPassport();
  }

  function renderPassport() {
    var s = S(), b = B(), box = $('ib-passport'), anchor = $('ib-kpi'); if (!s || !anchor) return;
    if (!box) { box = document.createElement('div'); box.id = 'ib-passport'; anchor.parentNode.insertBefore(box, anchor.nextSibling); }
    var hm = b.HOME ? b.HOME() : { flag: '🇻🇳', c: 'Việt Nam', cEn: 'Vietnam' };
    if (lastEntered) s.entered.forEach(function (v, m) { if (v !== null && v !== undefined && (lastEntered[m] === null || lastEntered[m] === undefined)) fresh[m] = true; });
    lastEntered = s.entered.slice();
    var n = s.entered.filter(function (v) { return v !== null && v !== undefined; }).length;
    box.innerHTML = '<div class="ib-pp-head"><span class="ib-eyebrow">🛂 ' + T('Hộ chiếu thương hiệu · ', 'Brand passport · ') + hm.flag + ' ' + T(hm.c, hm.cEn) + ' · ' + n + '/7 ' + T('thị thực', 'visas') + '</span>' +
      '<span style="display:flex;gap:6px"><button class="ib-btn" type="button" onclick="IBUI.map()">🗺️ ' + T('Bản đồ toàn màn', 'Full-screen map') + '</button></span></div>' +
      '<div class="ib-visas">' + b.MKTS.map(function (mk, m) { var v = s.entered[m], r = mk.real || {}, on = v !== null && v !== undefined;
        var inner = on ? '<div class="ib-stamp ' + MODE_C[v] + (fresh[m] ? ' new' : '') + '"><span class="f">' + (r.flag || mk.icon) + '</span>' + mk.name + '<span>' + b.MODES[v].icon + ' Q' + (s.qin && s.qin[m] ? Math.max(1, s.q - s.qin[m] + 1) : s.q + 1) + '</span></div>'
          : '<span class="f" style="opacity:.55">' + (r.flag || mk.icon) + '</span><span class="n">' + mk.name + '</span><span style="opacity:.55">' + T('chưa cấp', 'no visa') + '</span>';
        return '<div class="ib-visa" role="button" tabindex="0" title="' + T('Mở hồ sơ ', 'Open dossier: ') + mk.name + '" onclick="IBUI.dossier(' + m + ')">' + inner + '</div>'; }).join('') + '</div>';
    fresh = {};
  }

  function hofBars(m) {
    var b = B(), host = b.hostOf ? b.hostOf(m)[1] : null, home = b.HOME ? b.HOME().h : null; if (!host || !home) return '';
    var lab = [['PDI', T('Khoảng cách quyền lực', 'Power distance')], ['IDV', T('Chủ nghĩa cá nhân', 'Individualism')], ['MAS', T('Nam tính', 'Masculinity')], ['UAI', T('Né tránh bất định', 'Uncertainty avoidance')]];
    return '<div class="ib-hof">' + lab.map(function (l, i) {
      return '<span title="' + l[1] + '"><b>' + l[0] + '</b></span><span style="display:flex;flex-direction:column;gap:2px"><i style="width:' + home[i] + '%;background:#fda127"></i><i style="width:' + host[i] + '%;background:#006687"></i></span><span class="ib-num" style="text-align:right">' + home[i] + '/' + host[i] + '</span>'; }).join('') +
      '</div><div class="ib-legend" style="margin-top:4px"><span><i style="background:#fda127"></i>' + T('Quốc gia của bạn', 'Home') + '</span><span><i style="background:#006687"></i>' + T('Thị trường', 'Host') + '</span><span>Hofstede et al. (2010)</span></div>';
  }
  var lvlPill = function (n, a, b2) { return '<span class="ib-pill ' + (n === 1 ? 'ok' : n === 2 ? 'warn' : 'bad') + '">' + T(a, b2) + '</span>'; };
  function dossierHtml(m) {
    var b = B(), s = S(), mk = b.MKTS[m], r = mk.real || {}, f = FACTS[code(m)] || {}, hi = b.homeInfo ? b.homeInfo(m) : null, v = s ? s.entered[m] : null, on = v !== null && v !== undefined;
    var rival = s && s.rival && s.rival.in && s.rival.in.indexOf(m) >= 0;
    return '<div class="ib-dhead"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="ib-eyebrow" style="color:#9cc3cb">' + T('Hồ sơ quốc gia · thị trường sở tại', 'Country dossier · host market') + '</span><button class="ib-btn" type="button" onclick="IBUI.close()">✕</button></div>' +
      '<h3>' + (r.flag || '') + ' ' + T(r.c || '', r.cEn || '') + '</h3><div style="opacity:.8;font-size:12.5px">' + T('Trong game: ', 'In the game: ') + '<b>' + mk.icon + ' ' + mk.name + '</b> · ' + T(mk.trait, mk.traitEn) + '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">' + (on ? '<span class="ib-pill ok">🛂 ' + T('Đã cấp thị thực · ', 'Visa granted · ') + b.MODES[v].icon + ' ' + T(b.MODES[v].name, b.MODES[v].nameEn) + '</span>' : '<span class="ib-pill">' + T('Chưa thâm nhập', 'Not entered') + '</span>') +
      (s ? '<span class="ib-pill">📚 ' + T('Tri thức ', 'Intel ') + clamp(s.know[m]) + '%</span>' : '') + (rival ? '<span class="ib-pill bad">⚔️ Kim Long ' + T('có mặt', 'present') + '</span>' : '') + '</div></div>' +
      '<div class="ib-dbody">' +
      '<div class="ib-facts"><div class="ib-fact"><span class="ib-eyebrow">' + T('Dân số', 'Population') + '</span><b>' + dec(f.pop, f.pop < 10 ? 1 : 0) + T(' tr', ' m') + '</b></div><div class="ib-fact"><span class="ib-eyebrow">GDP</span><b>' + dec(f.gdp, f.gdp < 1 ? 2 : 1) + T(' nghìn tỷ USD', ' tn USD') + '</b></div><div class="ib-fact"><span class="ib-eyebrow">' + T('GDP/người', 'GDP/capita') + '</span><b>≈' + f.gpc + 'k USD</b></div></div>' +
      '<div><div class="ib-row"><span>' + T('Thủ đô · hub', 'Capital · hub') + '</span><span>' + f.cap + ' · ' + T(f.hub, f.hubEn || f.hub) + '</span></div>' +
      '<div class="ib-row"><span>' + T('Hiệp định · thuế', 'Trade deal · tariff') + '</span><span>' + (hi ? (hi.free ? '✅ ' : '⚠️ ') + hi.fta : T(r.fta, r.ftaEn)) + '</span></div>' +
      '<div class="ib-row"><span>' + T('Rào cản gia nhập', 'Entry barriers') + '</span><span>' + T(r.bar || '', r.barEn || '') + '</span></div>' +
      '<div class="ib-row"><span>' + T('Tỷ giá', 'FX risk') + ' · ' + f.cur + '</span><span>' + lvlPill(f.fx[0], f.fx[0] === 1 ? 'Thấp' : f.fx[0] === 2 ? 'Vừa' : 'Cao', f.fx[0] === 1 ? 'Low' : f.fx[0] === 2 ? 'Moderate' : 'High') + ' ' + T(f.fx[1], f.fx[2]) + '</span></div>' +
      '<div class="ib-row"><span>Logistics</span><span>' + lvlPill(4 - f.log[0], f.log[0] === 3 ? 'Tốt' : f.log[0] === 2 ? 'Khá' : 'Trung bình', f.log[0] === 3 ? 'Good' : f.log[0] === 2 ? 'Fair' : 'Average') + ' ' + T(f.log[1], f.log[2]) + '</span></div>' +
      '<div class="ib-rvimg" data-rv="' + (RIVAL_IMG[code(m)] || '') + '" style="height:0;overflow:hidden;border-radius:10px"></div>' + '<div class="ib-row"><span>' + T('Đối thủ bản địa', 'Local rival') + '</span><span><b>' + f.rv[0] + '</b> ' + T('(giả tưởng) – ', '(fictional) – ') + T(f.rv[1], f.rv[2]) + (rival ? '<br>⚔️ ' + T('Kim Long (đối thủ cùng xuất phát) đã vào thị trường này.', 'Kim Long (your home-market rival) is already here.') : '') + '</span></div></div>' +
      '<div><span class="ib-eyebrow">' + T('Khoảng cách văn hoá', 'Cultural distance') + (hi ? ' · <span class="ib-num" style="color:#0b2a33">' + dec(hi.cd, 2) + '</span> (' + hi.lvl + ') · Kogut &amp; Singh (1988)' : '') + '</span><div style="margin-top:8px">' + hofBars(m) + '</div></div>' +
      '<p style="margin:0;font-size:10.5px;opacity:.6">' + T('Số liệu làm tròn (≈ 2024, World Bank/IMF), phục vụ giảng dạy. Thông số mô phỏng trong game đã cách điệu.', 'Rounded figures (≈ 2024, World Bank/IMF) for teaching. In-game parameters are stylised.') + '</p></div>';
  }
  function overlay(cls, html) { close(); var o = document.createElement('div'); o.className = 'ib-ovl ' + cls; o.id = 'ib-ovl'; o.innerHTML = html; o.addEventListener('click', function (e) { if (e.target === o) close(); }); document.body.appendChild(o); document.addEventListener('keydown', esc); return o; }
  function esc(e) { if (e.key === 'Escape') close(); }
  function close() { var o = $('ib-ovl'); if (o) o.remove(); document.removeEventListener('keydown', esc); }
  function dossier(m) { overlay('', '<div class="ib-drawer" role="dialog" aria-modal="true">' + dossierHtml(m) + '</div>'); }
  function map(pick) {
    var o = overlay('full', '<div class="ib-mapwin" role="dialog" aria-modal="true"><div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #d6e4e7"><span class="ib-eyebrow">🗺️ ' + T('Bản đồ thị trường toàn cầu – bấm một quốc gia để xem hồ sơ', 'Global market map – click a country for its dossier') + '</span><button class="ib-btn" type="button" onclick="IBUI.close()">✕</button></div><div class="body"><div id="ib-bigmap" style="overflow:auto;padding:8px"></div><div class="side" id="ib-mapside"></div></div></div>');
    var side = $('ib-mapside');
    var show = function (m) { side.innerHTML = dossierHtml(m).replace('<button class="ib-btn" type="button" onclick="IBUI.close()">✕</button>', ''); side.querySelector('.ib-dhead').style.position = 'static'; side.querySelector('.ib-dhead').style.borderRadius = '14px'; };
    show(pick != null ? pick : 0);
    if (window.BPWorldMap && B().mapData) BPWorldMap.render($('ib-bigmap'), Object.assign(B().mapData(), { onPick: show }));
    return o;
  }

  // Thẻ thị trường trên màn giới thiệu
  function renderIntroCards() {
    var list = $('bp-mkt-list'), b = B(); if (!list || !b || !b.homeInfo) return;
    list.className = 'ib-mgrid';
    list.innerHTML = b.MKTS.map(function (mk, m) { var r = mk.real || {}, hi = b.homeInfo(m), f = FACTS[code(m)] || {};
      return '<button type="button" class="ib-mcard" onclick="IBUI.dossier(' + m + ')"><div class="t"><b>' + (r.flag || mk.icon) + ' ' + mk.name + '</b><span class="ib-eyebrow">' + T(r.c || '', r.cEn || '') + '</span></div>' +
        '<small>' + T(mk.trait, mk.traitEn) + '</small><div style="display:flex;gap:5px;flex-wrap:wrap">' +
        '<span class="ib-pill ' + (hi.free ? 'ok' : 'warn') + '">' + (hi.free ? 'FTA ✓' : T('Không FTA', 'No FTA')) + '</span><span class="ib-pill">CD <span class="ib-num">' + dec(hi.cd) + '</span></span><span class="ib-pill">' + (f.cur || '') + '</span></div>' +
        '<span style="font-size:11px;font-weight:800;color:#006687">' + T('Xem hồ sơ quốc gia →', 'Open country dossier →') + '</span></button>'; }).join('');
  }

  // Tăng cường màn chơi: nút hồ sơ ở màn Quyết định, bản tin ở màn Sự kiện, bảng điều hành ở kết quả quý
  function enhanceStage() {
    var st = $('bp-stage'), s = S(); if (!st || !s) return;
    st.classList.toggle('ib-evt', s.phase === 'evt');
    if (s.phase === 'dec') st.querySelectorAll('.grid').forEach(function (g) {
      var btn = g.querySelector('[data-g="ent"]'); if (!btn || g.previousElementSibling && g.previousElementSibling.querySelector('.ib-dos')) return;
      var m = +btn.getAttribute('data-m'), lab = g.previousElementSibling; if (!lab) return;
      lab.insertAdjacentHTML('beforeend', ' <button type="button" class="ib-btn ib-dos" style="padding:3px 9px;font-size:11px" onclick="IBUI.dossier(' + m + ')">📇 ' + T('Hồ sơ', 'Dossier') + '</button>');
    });
    if (s.phase === 'evt') {
      var ev = st.querySelector('[onclick^="bpEv("]');
      if (ev && !st.querySelector('.ib-wire')) { var card = ev.closest('.clay-card') || st.firstElementChild; if (card) card.insertAdjacentHTML('afterbegin', '<div class="ib-wire">' + T('Bản tin thị trường · Quý ', 'Market wire · Q') + (s.q + 1) + '</div>'); }
      var nx = st.querySelector('[onclick="bpNext()"]');
      if (nx && !$('ib-qdash')) nx.insertAdjacentHTML('beforebegin', dashHtml('ib-qdash', T('Bảng điều hành sau quý ', 'Dashboard after Q') + (s.q + 1)));
    }
  }
  function lineChart(keys) {
    var W = 560, H = 150, P = 26, all = [];
    keys.forEach(function (k) { all = all.concat(series(k[0])); });
    if (!all.length) return '';
    var n = series(keys[0][0]).length, mn = Math.min(0, Math.min.apply(0, all)), mx = Math.max.apply(0, all), r = mx - mn || 1;
    var x = function (i) { return P + (n < 2 ? 0 : i / (n - 1) * (W - P * 2)); }, y = function (v) { return H - P - (v - mn) / r * (H - P * 2); };
    var g = '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + y(0) + '" y2="' + y(0) + '" stroke="#d6e4e7"/>';
    for (var i = 0; i < n; i++) g += '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="10" fill="#7b949a">Q' + (i + 1) + '</text>';
    keys.forEach(function (k) { var v = series(k[0]); g += '<polyline points="' + v.map(function (a, i) { return x(i) + ',' + y(a); }).join(' ') + '" fill="none" stroke="' + k[1] + '" stroke-width="2.5" stroke-linejoin="round"/>' + v.map(function (a, i) { return '<circle cx="' + x(i) + '" cy="' + y(a) + '" r="3" fill="' + k[1] + '"/>'; }).join(''); });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + T('Biểu đồ theo quý', 'Quarterly chart') + '">' + g + '</svg><div class="ib-legend">' + keys.map(function (k) { return '<span><i style="background:' + k[1] + '"></i>' + k[2] + '</span>'; }).join('') + '</div>';
  }
  function dashHtml(id, title) {
    snap();
    return '<div class="ib-dash" id="' + id + '"><span class="ib-eyebrow">📊 ' + title + '</span>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px"><div><span class="ib-eyebrow">' + T('Tài chính (tỷ ₫)', 'Finance (bn ₫)') + '</span>' + lineChart([['cash', '#006687', T('Tiền mặt', 'Cash')], ['profit', '#3f8a44', T('LN tích lũy', 'Cum. profit')]]) + '</div>' +
      '<div><span class="ib-eyebrow">' + T('Chỉ số thương hiệu (0–100)', 'Brand indices (0–100)') + '</span>' + lineChart([['rep', '#e8762d', T('Uy tín', 'Reputation')], ['capab', '#2f8a8c', T('Năng lực', 'Capability')], ['know', '#7a5bb5', T('Tri thức TB', 'Avg. intel')]]) + '</div></div></div>';
  }
  function enhanceEnd() {
    var end = $('bp-end'), bd = $('bp-breakdown'); if (!end || end.classList.contains('hidden') || !bd || $('ib-enddash')) return;
    var s = S(), b = B();
    var stamps = '<div class="ib-dash" style="background:linear-gradient(135deg,#123a45,#0b2a33);color:#e9f3f5;border:0"><span class="ib-eyebrow" style="color:#9cc3cb">🛂 ' + T('Hộ chiếu sau 6 quý', 'Your passport after 6 quarters') + '</span><div class="ib-visas">' +
      b.MKTS.map(function (mk, m) { var v = s.entered[m], r = mk.real || {}; return '<div class="ib-visa" onclick="IBUI.dossier(' + m + ')">' + (v !== null && v !== undefined ? '<div class="ib-stamp ' + MODE_C[v] + ' new" style="animation-delay:' + (m * 0.12) + 's"><span class="f">' + (r.flag || '') + '</span>' + mk.name + '<span>' + b.MODES[v].icon + '</span></div>' : '<span class="f" style="opacity:.4">' + (r.flag || '') + '</span><span class="n" style="opacity:.6">' + mk.name + '</span>') + '</div>'; }).join('') + '</div></div>';
    bd.insertAdjacentHTML('afterend', stamps + dashHtml('ib-enddash', T('Hành trình 6 quý', 'Your 6-quarter journey')));
  }


  // Trang chính: hero kiểu bảng điều hành + bìa hộ chiếu
  function renderHero() {
    var col = $('bp3d-col'), head = $('bp3d-head'), b = B(); if (!col || !head || !b) return;
    var box = $('ib-hero'); if (!box) { box = document.createElement('section'); box.id = 'ib-hero'; col.insertBefore(box, head); }
    var hm = b.HOME ? b.HOME() : { flag: '🇻🇳', c: 'Việt Nam', cEn: 'Vietnam' }, mis = $('bp-hero-mission');
    var canResume = $('bp-resume') && !$('bp-resume').classList.contains('hidden');
    var flags = b.MKTS.map(function (mk) { return mk.real ? mk.real.flag : mk.icon; });
    var stats = [['7', T('thị trường sở tại', 'host markets')], ['6', T('phương thức thâm nhập', 'entry modes')], ['6', T('quý kinh doanh', 'quarters')], [String((b.HOMES || []).length || 10), T('quốc gia xuất phát', 'home countries')]];
    var steps = [['🏠', T('Chọn quốc gia xuất phát', 'Pick a home country')], ['🏢', T('Chọn doanh nghiệp', 'Pick a company')], ['🔍', T('Mua thông tin, so nguồn tin', 'Buy and compare intel')], ['◐', T('Chọn thị trường & phương thức (AIBIS)', 'Choose market & mode (AIBIS)')], ['📰', T('Xử lý cú sốc thị trường', 'Handle market shocks')], ['🛂', T('Nhận hộ chiếu tổng kết', 'Collect your passport')]];
    var sig = [hm.flag, EN(), canResume, mis ? mis.innerHTML.length : 0].join('|'); if (box.dataset.sig === sig) return; box.dataset.sig = sig;
    box.innerHTML = '<div class="ib-hero-in">' +
      '<div class="ib-hero-l"><span class="ib-eyebrow" style="color:#9cc3cb">BizOn Go Global · ' + T('Mô phỏng kinh doanh quốc tế', 'International business simulation') + '</span>' +
        '<h1>' + T('Hộ Chiếu<br>Thương Hiệu', 'Brand<br>Passport') + '</h1>' +
        '<p class="ib-hero-sub">' + T('Từ ', 'From ') + hm.flag + ' ' + T(hm.c, hm.cEn) + T(' ra thế giới', ' to the world') + ' <span style="letter-spacing:.15em;opacity:.9">' + flags.join(' ') + '</span></p>' +
        (mis ? '<p class="ib-hero-mis">' + mis.innerHTML + '</p>' : '') +
        '<div class="ib-hero-cta"><button type="button" class="ib-btn ib-gold" onclick="IBUI.go()">🛫 ' + T('Bắt đầu hành trình', 'Start the journey') + '</button>' +
        (canResume ? '<button type="button" class="ib-btn" onclick="bpResume()">▶ ' + T('Tiếp tục ván đang chơi', 'Resume game') + '</button>' : '') +
        '<button type="button" class="ib-btn ib-ghost" onclick="IBUI.map()">🗺️ ' + T('Bản đồ thị trường', 'Market map') + '</button></div>' +
        '<div class="ib-hero-stats">' + stats.map(function (x) { return '<div><b class="ib-num">' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('') + '</div></div>' +
      '<div class="ib-hero-r" aria-hidden="true"><div class="ib-cover"><span class="ib-cover-t">' + T('HỘ CHIẾU THƯƠNG HIỆU', 'BRAND PASSPORT') + '</span><span class="ib-cover-e">🛂</span><span class="ib-cover-t" style="font-size:10px;opacity:.75">' + hm.flag + ' ' + T(hm.c, hm.cEn).toUpperCase() + ' · BIZON</span><span class="ib-cover-mrz ib-num">P&lt;BZN&lt;&lt;BRAND&lt;PASSPORT&lt;&lt;&lt;&lt;&lt;&lt;<br>Q1Q6&lt;7MKT&lt;6MODE&lt;&lt;AIBIS&lt;&lt;&lt;&lt;</span></div>' +
        b.MKTS.slice(0, 4).map(function (mk, i) { var r = mk.real || {}; return '<div class="ib-stamp m' + i + ' ib-hero-st" style="--x:' + [4, 66, 70, 8][i] + '%;--y:' + [6, 10, 66, 70][i] + '%;--r:' + [-14, 10, -6, 16][i] + 'deg"><span class="f">' + (r.flag || '') + '</span>' + mk.name + '<span>' + b.MODES[i].icon + '</span></div>'; }).join('') + '</div>' +
      '</div><ol class="ib-steps">' + steps.map(function (x, i) { return '<li><span class="ib-num">0' + (i + 1) + '</span><b>' + x[0] + '</b>' + x[1] + '</li>'; }).join('') + '</ol>';
  }
  function go() { var el = $('bp-intro'); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' }); }

  var busy = false;
  function sync() { if (busy) return; busy = true; try { var intro = !$('bp-play') || $('bp-play').classList.contains('hidden'), endV = $('bp-end') && !$('bp-end').classList.contains('hidden'); if (intro && !endV) { renderIntroCards(); renderHero(); var mi = $('bp-map-intro'); if (mi && !mi.firstChild && window.BPWorldMap && B().mapData) BPWorldMap.render(mi, B().mapData()); } else { var hh = $('ib-hero'); if (hh) hh.remove(); if (!intro) { renderKPI(); enhanceStage(); } } enhanceEnd(); } catch (e) { console.warn('IBUI', e); } finally { busy = false; } }
  function boot() {
    if (!B()) return setTimeout(boot, 200);
    var mo = new MutationObserver(function () { clearTimeout(boot.t); boot.t = setTimeout(sync, 30); });
    ['bp-hud', 'bp-stage', 'bp-end', 'bp-intro', 'bp-play'].forEach(function (id) { var el = $(id); if (el) mo.observe(el, id === 'bp-play' ? { attributes: true, attributeFilter: ['class'] } : { childList: true, subtree: id !== 'bp-intro', attributes: id === 'bp-end', ...(id === 'bp-end' ? { attributeFilter: ['class'] } : {}) }); });
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#bp-homes, #lang-btn, #bp-homes-wrap')) setTimeout(sync, 60); });
    sync();
  }
  window.IBUI = { go: go, dossier: dossier, map: map, close: close, sync: sync };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
