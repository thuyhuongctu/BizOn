/* ============================================================================
   BizOn – tương tác trang Học thuật (truong-hoc-thuat.html), bản 10-2026.
   Chạy trên DOM tĩnh (nội dung VI/EN vẫn nằm trong HTML, dịch bằng data-en của
   js/bizon-clay-i18n.js): mục lục dính + chỉ báo tiến độ theo cuộn, ba góc nhìn
   model card, lọc/tìm bảng tham số kèm nhãn «có nguồn / minh hoạ» và mã nguồn
   bấm được, hai sơ đồ lý thuyết chọn được, mô phỏng mã băm tái lập, rubric chọn
   mức, nút chép trích dẫn, bản in. Không dựng nội dung bằng JS ngoài số đếm.
   API chỉ đọc cho kiểm thử: window.AF.
   ========================================================================== */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = $('.af');
  if (!root) return;

  var state = { active: '', q: '', kind: 'all', src: null, tier: 't3', node: 'n1', rp: { pack: 0, round: 5, seq: 0 }, lvl: 3, showSrc: false };
  var SECS = $$('.af-sec[id]').map(function (s) { return s.id; });

  /* ---- Chiều cao menu đất sét (dính) → biến CSS cho mục lục, hàng chip và scroll-margin ---- */
  function navH() {
    var n = document.getElementById('clay-nav');
    root.style.setProperty('--af-nav-h', (n ? n.offsetHeight : 0) + 'px');
  }
  navH();
  window.addEventListener('resize', navH);
  window.addEventListener('load', navH);

  /* ---- Mục lục: mục đang đọc = mục cuối có mép trên vượt ngưỡng; cuối trang → Tài liệu ---- */
  var tocLinks = $$('.af-toc-list a, .af-chips a');
  var progLabel = $('#af-prog-label'), progBar = $('#af-prog-bar'), chips = $('.af-chips');
  function setActive(id) {
    state.active = id;
    tocLinks.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    var i = SECS.indexOf(id), n = SECS.length;
    if (progLabel) progLabel.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
    if (progBar) progBar.style.width = ((i + 1) / n * 100) + '%';
    var chip = chips && $('a[aria-current="true"]', chips);
    if (chip && chips.scrollWidth > chips.clientWidth) {
      try { chips.scrollTo({ left: Math.max(0, chip.offsetLeft - 16), behavior: 'smooth' }); } catch (e) { chips.scrollLeft = chip.offsetLeft - 16; }
    }
  }
  function spy() {
    var navPx = parseFloat(getComputedStyle(root).getPropertyValue('--af-nav-h')) || 0;
    var off = navPx + 100, cur = SECS[0];
    SECS.forEach(function (id) { var el = document.getElementById(id); if (el && el.getBoundingClientRect().top < off) cur = id; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = SECS[SECS.length - 1];
    if (cur !== state.active) setActive(cur);
  }
  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy);
  spy();

  /* ---- 01 Model card: ba góc nhìn (tab) trong mỗi thẻ ---- */
  $$('.af-tabs').forEach(function (tabs) {
    var card = tabs.closest('.af-model');
    function pick(b) {
      $$('button[data-tab]', tabs).forEach(function (x) { var on = x === b; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; });
      $$('.af-panel', card).forEach(function (p) { p.hidden = p.dataset.panel !== b.dataset.tab; });
    }
    tabs.addEventListener('click', function (e) { var b = e.target.closest('button[data-tab]'); if (b) pick(b); });
    tabs.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var bs = $$('button[data-tab]', tabs), i = bs.indexOf(document.activeElement); if (i < 0) return;
      var nb = bs[(i + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length]; nb.focus(); pick(nb); e.preventDefault();
    });
  });

  /* ---- 02 Tham số: nhãn loại nguồn tính từ chuỗi nguồn tiếng Anh (data-en), mã nguồn bấm được ---- */
  var codes = $$('#af-srclist li').map(function (li) { return { code: li.querySelector('b').textContent.trim(), li: li }; });
  function kindOf(src) { if (/^illustrative|^balanced/.test(src)) return 'illustrative'; if (/illustrative/.test(src)) return 'mixed'; return 'sourced'; }
  function codeRe(c) { return new RegExp('(^|[^A-Z])' + c + '([^A-Z]|$)'); }
  var KIND_VI = { illustrative: 'Minh hoạ', mixed: 'Có nguồn + minh hoạ', sourced: 'Có nguồn' };
  var KIND_EN = { illustrative: 'Illustrative', mixed: 'Sourced + illustrative', sourced: 'Sourced' };
  var P = $$('#af-ptable tbody tr[data-param]').map(function (tr) {
    var td = tr.querySelector('td.s'), span = td && td.querySelector('[data-en]');
    var srcEn = span ? span.dataset.en : (td ? td.textContent : '');
    var kind = kindOf(srcEn);
    var used = codes.filter(function (c) { return codeRe(c.code).test(srcEn); }).map(function (c) { return c.code; });
    tr.dataset.kind = kind;
    if (td) {
      var badge = document.createElement('span');
      badge.className = 'af-kind ' + kind; badge.setAttribute('data-en', KIND_EN[kind]); badge.textContent = KIND_VI[kind];
      td.insertBefore(badge, td.firstChild);
      if (used.length) {
        var wrap = document.createElement('span'); wrap.className = 'af-codes';
        used.forEach(function (c) {
          var b = document.createElement('button'); b.type = 'button'; b.dataset.code = c; b.textContent = c + ' ↗'; b.setAttribute('aria-pressed', 'false');
          wrap.appendChild(b);
        });
        td.appendChild(wrap);
      }
    }
    return { tr: tr, key: tr.dataset.param, kind: kind, used: used };
  });
  var counts = { all: P.length };
  P.forEach(function (p) { counts[p.kind] = (counts[p.kind] || 0) + 1; });
  $$('.af-filters button').forEach(function (b) { var i = b.querySelector('i'); if (i) i.textContent = counts[b.dataset.kind] || 0; });
  $$('.af-legend > span').forEach(function (s) { var i = s.querySelector('i'); if (i) i.textContent = counts[s.dataset.kind] || 0; });
  $$('.af-ratio i').forEach(function (seg) { seg.style.width = ((counts[seg.dataset.kind] || 0) / Math.max(1, P.length) * 100).toFixed(1) + '%'; });
  var search = $('#af-search'), countN = $('#af-count-n'), empty = $('#af-empty');
  function applyFilter() {
    var q = state.q.trim().toLowerCase(), n = 0;
    P.forEach(function (p) {
      var ok = (state.kind === 'all' || p.kind === state.kind) && (!q || p.tr.textContent.toLowerCase().indexOf(q) !== -1);
      p.tr.hidden = !ok; if (ok) n++;
    });
    if (countN) countN.textContent = n + ' / ' + P.length;
    if (empty) empty.hidden = n > 0;
    $$('.af-filters button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.kind === state.kind ? 'true' : 'false'); });
    return n;
  }
  function setKind(k) { state.kind = k; return applyFilter(); }
  function setQuery(q) { state.q = q || ''; if (search && search.value !== state.q) search.value = state.q; return applyFilter(); }
  if (search) search.addEventListener('input', function () { setQuery(search.value); });
  $('.af-filters').addEventListener('click', function (e) { var b = e.target.closest('button[data-kind]'); if (b) setKind(b.dataset.kind); });

  var srcPanel = $('#af-srcpanel'), srcList = $('#af-srclist');
  function pickSource(code) {
    state.src = (state.src === code || !code) ? null : code;
    $$('.af-codes button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.code === state.src ? 'true' : 'false'); });
    if (!srcPanel) return;
    var c = null; codes.forEach(function (x) { if (x.code === state.src) c = x; });
    if (!c) { srcPanel.hidden = true; return; }
    var span = c.li.querySelector('span[data-en]');
    $('.code', srcPanel).textContent = c.code;
    $('.txt .t', srcPanel).textContent = (span ? span.textContent : c.li.textContent).trim();
    $('.uses .u', srcPanel).textContent = P.filter(function (p) { return p.used.indexOf(c.code) !== -1; }).map(function (p) { return p.key; }).join(' · ');
    srcPanel.hidden = false;
  }
  function showSources(on) {
    state.showSrc = !!on;
    if (srcList) srcList.hidden = !state.showSrc;
    var b = $('[data-act="togglesrc"]');
    if (b) { b.setAttribute('aria-expanded', state.showSrc ? 'true' : 'false'); $('.s0', b).hidden = state.showSrc; $('.s1', b).hidden = !state.showSrc; }
  }

  /* ---- 03 / 05: nhóm nút chọn một (bậc, nút vòng Uppsala, mức rubric) ---- */
  function group(btnSel, panelAttr, key, after) {
    function pick(v) {
      v = String(v); state[key] = v;
      $$(btnSel).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset[key] === v ? 'true' : 'false'); });
      $$('[' + panelAttr + ']').forEach(function (p) { p.hidden = p.getAttribute(panelAttr) !== v; });
      if (after) after(v);
    }
    $$(btnSel).forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset[key]); }); });
    return pick;
  }
  var pickTier = group('.af-tier', 'data-tier-panel', 'tier');
  var pickNode = group('.af-node', 'data-node-panel', 'node');
  var sampleLvl = $('#af-sample-lvl');
  var pickLevel = group('.af-rub', 'data-sample', 'lvl', function (v) {
    var tile = $('.af-rub[data-lvl="' + v + '"]');
    if (tile && sampleLvl) sampleLvl.textContent = tile.querySelector('.lvl').textContent + ' · ' + tile.querySelector('.nm').textContent;
  });
  pickTier(state.tier); pickNode(state.node); pickLevel(state.lvl);

  /* ---- 04 Mô phỏng mã băm tái lập (bản demo, không phải hàm băm của engine) ---- */
  function H(str) {
    var h = 5381, g = 52711;
    for (var i = 0; i < str.length; i++) { var c = str.charCodeAt(i); h = (h * 33) ^ c; g = (g * 31) ^ c; }
    return (h >>> 0).toString(16).padStart(8, '0') + (g >>> 0).toString(16).padStart(8, '0');
  }
  var PACKS = ['durian-v2026.10', 'durian-v2026.09'], SEQS = ['A', 'B'], REF = { pack: 0, round: 5, seq: 0 };
  function hashOf(r) { return H(PACKS[r.pack] + '|round' + (r.round + 1) + '|' + SEQS[r.seq]); }
  var hashYou = $('#af-hash-you'), hashRef = $('#af-hash-ref'), match = $('#af-match');
  function renderHash() {
    var you = hashOf(state.rp), ref = hashOf(REF);
    if (hashYou) hashYou.textContent = you;
    if (hashRef) hashRef.textContent = ref;
    if (match) match.classList.toggle('ok', you === ref);
    $$('.af-hash [data-rp]').forEach(function (b) { var kv = b.dataset.rp.split(':'); b.setAttribute('aria-pressed', String(state.rp[kv[0]]) === kv[1] ? 'true' : 'false'); });
    return you === ref;
  }
  function setRp(k, v) { if (k in state.rp) state.rp[k] = +v; return renderHash(); }
  var hashBox = $('.af-hash');
  if (hashBox) hashBox.addEventListener('click', function (e) { var b = e.target.closest('[data-rp]'); if (!b) return; var kv = b.dataset.rp.split(':'); setRp(kv[0], kv[1]); });
  renderHash();

  /* ---- Chép trích dẫn / tài liệu ---- */
  var lastCopied = '';
  function copyText(t) {
    lastCopied = t;
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).catch(function () {}); return; } } catch (e) {}
    try {
      var ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    } catch (e2) {}
  }
  function flash(btn) { btn.classList.add('copied'); clearTimeout(btn._t); btn._t = setTimeout(function () { btn.classList.remove('copied'); }, 1600); }
  function refText(li) {
    var t = li.querySelector('.t'); if (!t) return '';
    var a = t.querySelector('a[href^="https://doi.org/"]');
    var txt = t.textContent.replace(/\s+/g, ' ').trim();
    if (a) txt = txt.replace(a.textContent.trim(), '').replace(/\s+$/, '') + ' ' + a.getAttribute('href');
    return txt;
  }
  function allRefs() { return $$('.af-refs li').map(refText).join('\n'); }

  /* ---- Bản in: ép sáng, mở hết model card, hiện danh mục nguồn, bỏ lọc; in xong trả lại ---- */
  var printSaved = null;
  function beforePrint() {
    if (printSaved) return;
    printSaved = { theme: document.documentElement.getAttribute('data-theme'), open: $$('.af-model').map(function (d) { return d.open; }), showSrc: state.showSrc, q: state.q, kind: state.kind };
    document.documentElement.setAttribute('data-theme', 'light');
    $$('.af-model').forEach(function (d) { d.open = true; });
    showSources(true); state.q = ''; state.kind = 'all'; if (search) search.value = ''; applyFilter();
  }
  function afterPrint() {
    if (!printSaved) return;
    var s = printSaved; printSaved = null;
    if (s.theme) document.documentElement.setAttribute('data-theme', s.theme);
    $$('.af-model').forEach(function (d, i) { d.open = !!s.open[i]; });
    showSources(s.showSrc); state.kind = s.kind; setQuery(s.q);
  }
  window.addEventListener('beforeprint', beforePrint);
  window.addEventListener('afterprint', afterPrint);

  /* ---- Uỷ quyền bấm nút ---- */
  root.addEventListener('click', function (e) {
    var cb = e.target.closest('.af-codes button');
    if (cb) { pickSource(cb.dataset.code); return; }
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.dataset.act;
    if (act === 'copy') { copyText(b.dataset.copy || ''); flash(b); }
    else if (act === 'copyref') { var li = b.closest('li'); if (li) { copyText(refText(li)); flash(b); } }
    else if (act === 'copyall') { copyText(allRefs()); flash(b); }
    else if (act === 'togglesrc') showSources(!state.showSrc);
    else if (act === 'closesrc') pickSource(null);
    else if (act === 'clear') { state.kind = 'all'; setQuery(''); if (search) search.focus(); }
    else if (act === 'print') { try { window.print(); } catch (e2) {} }
  });

  /* ---- Đổi VI/EN: dịch nhãn vừa bơm, làm mới số đếm, bảng nguồn và tiêu đề câu mẫu ---- */
  function onLang() {
    applyFilter();
    if (state.src) { var c = state.src; state.src = null; pickSource(c); }
    pickLevel(state.lvl);
  }
  if (typeof window.clayRefreshLang === 'function') window.clayRefreshLang(); /* dịch nhãn loại nguồn vừa thêm nếu đang EN */
  window.addEventListener('bizon:langchange', onLang);
  onLang();

  window.AF = {
    state: function () { return JSON.parse(JSON.stringify(state)); },
    counts: function () { return JSON.parse(JSON.stringify(counts)); },
    params: function () { return P.map(function (p) { return { key: p.key, kind: p.kind, used: p.used.slice(), hidden: p.tr.hidden }; }); },
    setKind: setKind, search: setQuery, pickSource: pickSource, showSources: showSources,
    pickTier: pickTier, pickNode: pickNode, pickLevel: pickLevel, setRp: setRp, hash: H, hashOf: hashOf,
    refText: allRefs, lastCopied: function () { return lastCopied; }, spy: spy
  };
})();
