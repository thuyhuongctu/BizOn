/* BizOn International Blueprint 2030 (app/blueprint-2030.html) – phần tương tác.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Vẽ từ khối JSON #bp30-data trong trang: thẻ hiện trạng, 10 trụ cột với bộ lọc trạng thái và 4 góc nhìn (thẻ, ma
 * trận, lớp, dòng thời gian), lộ trình 3 lớp với điều kiện nâng trạng thái. Ngôn ngữ lấy từ js/bizon-clay-i18n.js
 * (window.clayCurrentLang) và vẽ lại khi có 'bizon:langchange'. Góc nhìn/bộ lọc đang chọn nhớ trong URL (#pillars?…)
 * không cần – chỉ giữ trong bộ nhớ trang. Không có công thức hay dữ liệu production nào ở đây.
 */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var dataEl = $('bp30-data');
  if (!dataEl) return;
  var DATA;
  try { DATA = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var lang = function () { return typeof window.clayCurrentLang === 'function' ? window.clayCurrentLang() : (document.documentElement.getAttribute('data-default-lang') === 'vi' ? 'vi' : 'en'); };
  var L = function (v) { return v && typeof v === 'object' ? (v[lang()] || v.vi || v.en || '') : (v || ''); };

  var T = {
    vi: { all: 'Tất cả', live: 'Đang chạy & nền tảng', preview: 'Preview', planned: 'Kế hoạch', cards: 'Thẻ', matrix: 'Ma trận', layers: 'Lớp', timeline: 'Dòng thời gian',
      empty: 'Không có trụ cột nào khớp bộ lọc.', layer: 'Lớp', layerU: 'LỚP', target: 'mục tiêu', thP: 'Trụ cột', thS: 'Trạng thái', thL: 'Lớp', thT: 'Mục tiêu', thV: 'Kiểm chứng',
      mapNote: 'Việc gán trụ cột vào lớp là đề xuất dựa trên mô tả các lớp trong lộ trình. Cần xác nhận trước khi công bố.',
      yearNote: 'Năm tạm thời, sắp theo trạng thái hiện tại. Thay bằng mốc thực tế.', gatesK: 'ĐIỀU KIỆN NÂNG TRẠNG THÁI', linkedK: 'TRỤ CỘT LIÊN QUAN (ĐỀ XUẤT)',
      gates: ['Contract', 'Visual QA', 'Governance', 'Kiểm thử thiết bị'], open: 'Mở', close: 'Thu gọn', focus: 'Xem thẻ' },
    en: { all: 'All', live: 'Live & foundation', preview: 'Preview', planned: 'Planned', cards: 'Cards', matrix: 'Matrix', layers: 'Layers', timeline: 'Timeline',
      empty: 'No pillars match this filter.', layer: 'Layer', layerU: 'LAYER', target: 'target', thP: 'Pillar', thS: 'Status', thL: 'Layer', thT: 'Target', thV: 'Verification',
      mapNote: 'Pillar-to-layer mapping is a proposal based on the roadmap layer descriptions. Confirm before publishing.',
      yearNote: 'Placeholder years, ordered by current status. Replace with real milestones.', gatesK: 'PROMOTION GATES', linkedK: 'LINKED PILLARS (PROPOSED)',
      gates: ['Contract', 'Visual QA', 'Governance', 'Device testing'], open: 'Open', close: 'Collapse', focus: 'See card' },
  };
  var t = function (k) { return (T[lang()] || T.vi)[k]; };
  var tagCls = function (tag) { return tag === 'EXPERIMENTAL' ? 'exp' : tag === 'QA READY' ? 'preview' : 'live'; };
  var status = function (cls, label) { return '<span class="bp30-status ' + cls + '"><i></i>' + esc(label) + '</span>'; };

  var state = { filter: 'all', view: 'cards', open: null, layer: 'A' };
  var FILTERS = ['all', 'live', 'preview', 'planned'];
  var VIEWS = ['cards', 'matrix', 'layers', 'timeline'];
  var YEARS = ['2026', '2027', '2028', '2029', '2030'];
  var visible = function () { return DATA.pillars.filter(function (p) { return state.filter === 'all' || p.grp === state.filter; }); };
  var layerOf = function (id) { for (var i = 0; i < DATA.layers.length; i++) if (DATA.layers[i].id === id) return DATA.layers[i]; return null; };

  /* ---------- hiện trạng ---------- */
  function renderLive() {
    var el = $('bp30-live'); if (!el) return;
    el.innerHTML = DATA.live.map(function (c) {
      return '<a class="bp30-live" href="' + esc(c.href) + '">' +
        '<div class="bp30-live-img"><img src="' + esc(c.img) + '" alt="">' + status(tagCls(c.tag), c.tag) + '</div>' +
        '<div class="bp30-live-body"><h3>' + esc(c.title) + '</h3><p>' + esc(L(c.desc)) + '</p><strong>' + esc(L(c.cta)) + '</strong></div></a>';
    }).join('');
  }

  /* ---------- 10 trụ cột ---------- */
  function renderToolbar() {
    var f = $('bp30-filters'), v = $('bp30-views'); if (!f || !v) return;
    var count = function (g) { return DATA.pillars.filter(function (p) { return g === 'all' || p.grp === g; }).length; };
    f.innerHTML = FILTERS.map(function (id) {
      return '<button type="button" data-filter="' + id + '" aria-pressed="' + (state.filter === id) + '">' + esc(t(id)) + ' · ' + count(id) + '</button>';
    }).join('');
    v.innerHTML = VIEWS.map(function (id) {
      return '<button type="button" role="tab" data-view="' + id + '" aria-selected="' + (state.view === id) + '">' + esc(t(id)) + '</button>';
    }).join('');
  }
  function cardMore(p) {
    var items = p.items && p.items.length ? '<div class="bp30-chips">' + p.items.map(function (it) { return '<span>' + esc(it) + '</span>'; }).join('') + '</div>' : '';
    var link = p.link ? '<a href="' + esc(p.link.href) + '">' + esc(L(p.link)) + '</a>' : '';
    return '<div class="bp30-card-more">' + items + link + '<small>' + esc(t('layer')) + ' ' + esc(p.layer) + ' · ' + esc(t('target')) + ' ' + esc(p.year) + '</small></div>';
  }
  function viewCards(ps) {
    return '<div class="bp30-cards">' + ps.map(function (p) {
      var open = state.open === p.n;
      return '<article class="bp30-card ' + p.grp + (open ? ' open' : '') + '" data-open="' + p.n + '" id="bp30-p' + p.n + '" tabindex="0" role="button" aria-expanded="' + open + '">' +
        '<b aria-hidden="true">' + p.n + '</b>' + status(p.grp, p.status) +
        '<h3>' + esc(p.title) + '</h3><p>' + esc(L(p.desc)) + '</p>' + (open ? cardMore(p) : '') + '</article>';
    }).join('') + '</div>';
  }
  function viewMatrix(ps) {
    return '<div class="bp30-matrix"><table><thead><tr><th>#</th><th>' + esc(t('thP')) + '</th><th>' + esc(t('thS')) + '</th><th>' + esc(t('thL')) + '</th><th>' + esc(t('thT')) + '</th><th>' + esc(t('thV')) + '</th></tr></thead><tbody>' +
      ps.map(function (p) {
        return '<tr><td class="n">' + p.n + '</td><td class="t">' + esc(p.title) + '</td><td>' + status(p.grp, p.status) + '</td><td>' + esc(t('layer')) + ' ' + esc(p.layer) + '</td><td class="y">' + esc(p.year) + '</td>' +
          '<td class="v">' + (p.items || []).map(function (it) { return '<span>' + esc(it) + '</span>'; }).join('') + (p.link ? '<a href="' + esc(p.link.href) + '">' + esc(L(p.link)) + '</a>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  function viewLayers(ps) {
    return '<div class="bp30-layers">' + DATA.layers.slice().reverse().map(function (l) {
      var mine = ps.filter(function (p) { return p.layer === l.id; });
      return '<div class="bp30-layer" style="--lc:' + esc(l.color) + '"><div class="bp30-layer-id"><span class="bp30-kicker">' + esc(t('layerU')) + ' ' + esc(l.id) + '</span><strong>' + esc(l.name) + '</strong><span>' + esc(L(l.desc)) + '</span></div>' +
        '<div class="bp30-layer-pills">' + mine.map(function (p) {
          return '<button type="button" class="bp30-pill" data-focus="' + p.n + '" title="' + esc(t('focus')) + '"><span class="num ' + p.grp + '">' + p.n + '</span><span class="txt"><strong>' + esc(p.title) + '</strong><small class="' + p.grp + '">' + esc(p.status) + '</small></span></button>';
        }).join('') + '</div></div>';
    }).join('') + '<p class="bp30-note">' + esc(t('mapNote')) + '</p></div>';
  }
  function viewTimeline(ps) {
    return '<div class="bp30-timeline"><div class="bp30-years">' + YEARS.map(function (y) {
      var mine = ps.filter(function (p) { return p.year === y; });
      return '<div class="bp30-year"><span>' + y + '</span><div>' + mine.map(function (p) {
        return '<button type="button" class="bp30-tl" data-focus="' + p.n + '" title="' + esc(t('focus')) + '">' + status(p.grp, p.n + ' · ' + p.status) + '<strong>' + esc(p.title) + '</strong></button>';
      }).join('') + '</div></div>';
    }).join('') + '</div><p class="bp30-note">' + esc(t('yearNote')) + '</p></div>';
  }
  function renderPillars() {
    var el = $('bp30-pillars'); if (!el) return;
    var ps = visible();
    if (!ps.length) { el.innerHTML = '<p class="bp30-empty">' + esc(t('empty')) + '</p>'; return; }
    el.innerHTML = state.view === 'matrix' ? viewMatrix(ps) : state.view === 'layers' ? viewLayers(ps) : state.view === 'timeline' ? viewTimeline(ps) : viewCards(ps);
  }

  /* ---------- lộ trình ---------- */
  function renderRoad() {
    var stack = $('bp30-road'), det = $('bp30-road-detail'); if (!stack || !det) return;
    stack.innerHTML = DATA.layers.map(function (l, i) {
      var on = state.layer === l.id;
      return '<button type="button" class="bp30-road-btn" role="tab" data-layer="' + l.id + '" aria-selected="' + on + '" style="--lc:' + esc(l.color) + '">' +
        '<span class="num">0' + (i + 1) + '</span><span class="txt"><strong>' + esc(t('layer')) + ' ' + l.id + ' · ' + esc(l.name) + '</strong><span class="d">' + esc(L(l.desc)) + '</span></span></button>';
    }).join('');
    var cur = layerOf(state.layer) || DATA.layers[0];
    var idx = DATA.layers.indexOf(cur);
    var linked = DATA.pillars.filter(function (p) { return p.layer === cur.id; });
    det.style.setProperty('--lc', cur.color);
    det.innerHTML = '<span class="bp30-kicker">' + esc(t('layerU')) + ' ' + cur.id + ' · 0' + (idx + 1) + '</span><h3>' + esc(cur.name) + '</h3><p>' + esc(L(cur.desc)) + '</p>' +
      '<div class="grp"><span>' + esc(t('gatesK')) + '</span><div class="bp30-gates">' + t('gates').map(function (g) { return '<span><i></i>' + esc(g) + '</span>'; }).join('') + '</div></div>' +
      '<div class="grp"><span>' + esc(t('linkedK')) + '</span><div class="bp30-linked">' + linked.map(function (p) { return '<span class="' + p.grp + '">' + p.n + ' ' + esc(p.title) + '</span>'; }).join('') + '</div></div>';
  }

  function renderAll() { renderLive(); renderToolbar(); renderPillars(); renderRoad(); }

  /* ---------- tương tác ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-filter],[data-view],[data-open],[data-focus],[data-layer]'); if (!b) return;
    if (e.target.closest('a')) return; // liên kết kiểm chứng trong thẻ đang mở: để trình duyệt đi theo
    if (b.dataset.filter) { state.filter = b.dataset.filter; renderToolbar(); renderPillars(); return; }
    if (b.dataset.view) { state.view = b.dataset.view; renderToolbar(); renderPillars(); return; }
    if (b.dataset.open) { state.open = state.open === b.dataset.open ? null : b.dataset.open; renderPillars(); return; }
    if (b.dataset.focus) {
      state.open = b.dataset.focus; state.view = 'cards'; renderToolbar(); renderPillars();
      var card = $('bp30-p' + b.dataset.focus); if (card) { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); card.focus({ preventScroll: true }); }
      return;
    }
    if (b.dataset.layer) { state.layer = b.dataset.layer; renderRoad(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var c = e.target.closest && e.target.closest('.bp30-card[data-open]'); if (!c) return;
    e.preventDefault(); state.open = state.open === c.dataset.open ? null : c.dataset.open; renderPillars();
    var again = $('bp30-p' + c.dataset.open); if (again) again.focus({ preventScroll: true });
  });
  window.addEventListener('bizon:langchange', renderAll);

  /* Thanh công cụ dính nằm dưới menu đất sét dùng chung: đo chiều cao thật của #clay-nav (khác nhau giữa máy tính và điện thoại). */
  function navHeight() {
    var nav = $('clay-nav');
    document.body.style.setProperty('--bp30-navh', (nav ? nav.offsetHeight : 90) + 'px');
  }
  window.addEventListener('resize', navHeight);
  window.addEventListener('load', navHeight);

  renderAll(); navHeight();
  window.BP30 = { state: state, render: renderAll, data: DATA };
})();
