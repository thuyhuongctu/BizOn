/* BizOn · Cảng Cái Mép, vụ 5: đội chọn cách xử lý hàng kẹt (specs/005-cang-cai-mep, câu chuyện 2) · plugin cho game.html
 * và bat-nghiep-v2.html. Nạp SAU js/engine.js và js/market-dynamic.js:  <script src="js/cang-cai-mep.js"></script>
 * Gỡ thẻ <script> này là trở lại luật cũ. Không sửa dòng nào trong js/engine.js, js/app.js, js/backend.js.
 *
 * Luật (chỉ vụ 5, biến cố EV_SUPPLY / EV_SUPPLY_B / EV_SUPPLY_C của cả ba trường hợp A, B, C):
 *  (a) Trả phí ưu tiên: không cắt đơn; hệ số chi phí vụ CA thay cho 1,25 (giữ hệ số thành phố của thị trường động).
 *  (b) Chờ hoặc đổi cảng: như luật cũ (chi phí ×1,25, giao 85% đơn). Không chọn = (b), trùng từng con số với luật cũ.
 *  (c) Đàm phán lùi ngày giao: giao FULFILL_C số đơn; thương hiệu giảm U ngay sau vụ 5 (ảnh hưởng vụ 6).
 *  Khiên bảo hiểm giảm một nửa phần bất lợi của lựa chọn đã chọn (shieldedEvent của engine; với (c) giảm nửa U).
 *  Đối thủ ảo không chọn và không bị ảnh hưởng: lợi nhuận của họ ở vụ 5 lấy từ một lượt chạy song song theo (b).
 * Lựa chọn lưu ở S.portChoice ('a' | 'b' | 'c') và đi vào quyết định đã nộp của vụ 5 (decisions.portChoice), nên Trang
 * Giảng viên đọc được từ kết quả vòng; không thêm bảng, RPC hay migration. Không tính điểm riêng (chỉ để thảo luận).
 *
 * Số liệu tham khảo cho tham số (specs/005-cang-cai-mep/plan.md, «Nguồn số liệu»): phí lưu container/lưu bãi khoảng
 * 75–300 USD/container/ngày (biểu phí hãng tàu 2025); giao trễ làm 31,9% khách giảm lòng tin (Sendcloud 2025), 14% bỏ hẳn
 * nhà bán (Voxware 2014) – khảo sát của doanh nghiệp giao nhận, không phải nghiên cứu bình duyệt. Số chốt bằng /balance-check.
 */
(function () {
  'use strict';
  // ---------- Tham số cân bằng (chỉnh ở đây) ----------
  // Số chốt sau /balance-check ngày 19/11/2026 (bản nháp: CA 1,40). Chờ chị và thầy Tú duyệt bảng số trong PR.
  const CA = 1.30;          // hệ số chi phí vụ của (a), thay cho 1,25
  const U = 0.06;           // mức giảm thương hiệu (brand) của (c)
  const FULFILL_C = 0.95;   // tỷ lệ đáp ứng đơn của (c)
  const BASE_COST = 1.25;   // costMul gốc của biến cố hậu cần vụ 5 trong js/engine.js
  const ROUND = 5;

  const tr = (vi, en) => (typeof T === 'function' ? T(vi, en) : vi);
  const base = id => String(id || '').replace(/_(B|C)$/, '');
  const choice = s => (s && (s.portChoice === 'a' || s.portChoice === 'c') ? s.portChoice : 'b');
  const liveState = () => (typeof S !== 'undefined' ? S : null);
  const isPortEvent = (s, ev) => !!(s && ev && !s.finished && s.round === ROUND && ev.round === ROUND && base(ev.id) === 'EV_SUPPLY');
  let inner = null;   // currentEvent trước khi móc (engine + thị trường động)
  // Ô chỉ hiện khi biến cố vụ 5 thật sự là biến cố hậu cần (giảng viên có thể tung biến cố khác qua js/class-sync.js).
  function active(s) {
    if (!s || s.finished || s.round !== ROUND || typeof inner !== 'function') return false;
    try { return isPortEvent(s, inner(s)) && base((window.currentEvent(s) || {}).id) === 'EV_SUPPLY'; } catch (e) { return false; }
  }

  // ---------- Câu chữ ----------
  const CASE = {
    A: ['Tàu hàng chính chở linh kiện đang kẹt ở luồng vào Cái Mép – Thị Vải.', 'The main ship carrying our parts is stuck in the Cái Mép – Thị Vải channel.'],
    B: ['Hàng ngoại dồn về, cầu cảng Cái Mép – Thị Vải kín chỗ, container của ta phải xếp hàng chờ.', 'Imports pile up, the Cái Mép – Thị Vải berths are full and our containers are queuing.'],
    C: ['Kho quá tải mùa sale livestream, container của ta nằm chờ ở bãi Cái Mép – Thị Vải.', 'Warehouses overflow in the livestream sale season; our containers are waiting in the Cái Mép – Thị Vải yard.'],
  };
  const pct = v => Math.round(v * 100) + '%';
  const num = v => v.toFixed(2).replace('.', tr(',', '.'));
  const OPTS = () => [
    { v: 'a', t: tr('(a) Trả phí ưu tiên', '(a) Pay for priority'),
      d: tr('Thuê cầu cảng ưu tiên và vận tải nhanh, giao đủ hàng.', 'Book a priority berth and express haulage, deliver every order.'),
      e: tr(`Giao 100% đơn · chi phí sản xuất và cố định vụ này ×${num(CA)} (thay cho ×1,25)`, `100% of orders delivered · production and fixed costs this round ×${num(CA)} (instead of ×1.25)`) },
    { v: 'b', t: tr('(b) Chờ hoặc đổi cảng', '(b) Wait or switch port'),
      d: tr('Chờ cầu trống hoặc chuyển sang cảng khác, không tốn thêm phí.', 'Wait for a free berth or switch to another port, no extra fee.'),
      e: tr('Giao 85% đơn · chi phí ×1,25 như biến cố', '85% of orders delivered · costs ×1.25 as in the event') },
    { v: 'c', t: tr('(c) Đàm phán lùi ngày giao', '(c) Negotiate a later delivery date'),
      d: tr('Xin khách lùi hạn, giữ phần lớn đơn nhưng mất uy tín.', 'Ask buyers for more time, keep most orders but lose some trust.'),
      e: tr(`Giao ${pct(FULFILL_C)} đơn · chi phí ×1,25 · thương hiệu giảm ${num(U)} trước vụ 6`, `${pct(FULFILL_C)} of orders delivered · costs ×1.25 · brand drops ${num(U)} before round 6`) },
  ];
  const LABEL = { a: ['Trả phí ưu tiên', 'Pay for priority'], b: ['Chờ hoặc đổi cảng', 'Wait or switch port'], c: ['Đàm phán lùi ngày giao', 'Negotiate a later delivery date'] };
  const QUESTION = () => tr('Biên lợi nhuận mỗi sản phẩm của ta là bao nhiêu, và vụ 6 ta cần thương hiệu đến mức nào?',
    'What is our profit margin per unit, and how much will we need our brand in round 6?');
  const NOTE = c => c === 'a' ? tr('Phí ưu tiên cảng Cái Mép: giao đủ đơn, chi phí vụ 5 ×' + num(CA) + '.', 'Cái Mép port priority fee: all orders delivered, round 5 costs ×' + num(CA) + '.')
    : tr('Lùi ngày giao – uy tín giảm: giao ' + pct(FULFILL_C) + ' đơn, thương hiệu giảm trước vụ 6.', 'Later delivery – trust falls: ' + pct(FULFILL_C) + ' of orders delivered, brand drops before round 6.');
  // Dòng nhật ký (S.maintenanceLog) giữ cụm «Phí ưu tiên cảng» / «Lùi ngày giao – uy tín giảm» như đặc tả.
  const LOG = c => c === 'a' ? tr('Phí ưu tiên cảng Cái Mép – giao đủ đơn, chi phí vụ ×' + num(CA), 'Port priority fee at Cái Mép – all orders delivered, round costs ×' + num(CA))
    : tr('Lùi ngày giao – uy tín giảm (đàm phán ở Cái Mép, giao ' + pct(FULFILL_C) + ' đơn)', 'Later delivery – trust falls (negotiated at Cái Mép, ' + pct(FULFILL_C) + ' of orders delivered)');

  // ---------- Móc vào engine ----------
  const hook = () => {
    if (typeof window.currentEvent === 'function' && !window.currentEvent.__port) {
      const orig = window.currentEvent; inner = orig;
      const f = function (s) {
        const ev = orig.apply(this, arguments);
        if (!isPortEvent(s, ev)) return ev;
        const c = choice(s);
        // (a): bỏ fulfillMul (để undefined chứ không phải 1, vì js/app.js coi mọi giá trị khác rỗng là «85%»).
        if (c === 'a') return Object.assign({}, ev, { fulfillMul: undefined, costMul: (ev.costMul || 1) * (CA / BASE_COST), port: 'a' });
        if (c === 'c') return Object.assign({}, ev, { fulfillMul: FULFILL_C, port: 'c' });
        return ev;
      };
      f.__port = true; window.currentEvent = f;
    }
    if (typeof window.simulateRound === 'function' && !window.simulateRound.__port) {
      const orig = window.simulateRound;
      const f = function (s, d) {
        if (d && typeof d === 'object' && 'portChoice' in d) delete d.portChoice;   // bản v2 chép quyết định vụ trước sang vụ sau
        if (!s || s.finished || s.round !== ROUND) return orig.apply(this, arguments);
        let ev = null; try { ev = window.currentEvent(s); } catch (e) { ev = null; }
        const c = choice(s);
        const applied = !!ev && base(ev.id) === 'EV_SUPPLY' && (c === 'b' || ev.port === c);
        if (!applied) return orig.apply(this, arguments);
        if (d && typeof d === 'object') d.portChoice = c;
        // (a) đổi costMul chung của vụ, mà engine dùng cả cho giá vốn của đối thủ ảo. Chạy song song một bản sao theo (b)
        // để lấy đúng lợi nhuận đối thủ, rồi trả về cho ván thật: đối thủ không chọn ở cảng nên không chịu phí ưu tiên.
        let twin = null, twinRep = null;
        if (c === 'a') {
          try { twin = JSON.parse(JSON.stringify(s)); twin.portChoice = 'b'; twinRep = orig.call(this, twin, JSON.parse(JSON.stringify(d))); }
          catch (e) { twin = twinRep = null; console.warn('[BizonPort]', e); }
        }
        const rep = orig.apply(this, arguments);
        if (!rep) return rep;
        try {
          if (c === 'a' && twin && twinRep) {
            (s.competitors || []).forEach((x, i) => { const y = (twin.competitors || [])[i]; if (y && y.name === x.name) x.profit = y.profit; });
            rep.rivals = twinRep.rivals;
            const cm = s.mkt && s.mkt.cities && s.mkt.cities[ROUND - 1], tm = twin.mkt && twin.mkt.cities && twin.mkt.cities[ROUND - 1];
            if (cm && cm.played && tm && tm.played) cm.played.rivals = tm.played.rivals;
          }
          if (c === 'c') {
            const drop = rep.shielded ? U / 2 : U;
            s.brand = Math.max(0.5, s.brand - drop);
            s.brandLoyalty = Math.round(Math.min(95, 45 + s.brand * 25));
          }
          if (c !== 'b') { s.maintenanceLog = s.maintenanceLog || []; s.maintenanceLog.push({ round: ROUND, text: LOG(c) }); }
        } catch (e) { console.warn('[BizonPort]', e); }
        setTimeout(sync, 0);
        return rep;
      };
      f.__port = true; window.simulateRound = f;
    }
    // Lumina: một câu hỏi gợi mở ở vụ 5, nối vào lời khuyên «rủi ro». Không chọn giúp, không nói lựa chọn nào tốt hơn (FR-008).
    if (typeof window.luminaAdvice === 'function' && !window.luminaAdvice.__port) {
      const orig = window.luminaAdvice;
      const f = function (s, topic) {
        const a = orig.apply(this, arguments);
        if (!a || topic !== 'risk' || !active(s)) return a;
        return Object.assign({}, a, { text: a.text + ' 🚢 ' + tr('Câu hỏi cho cả đội ở Cái Mép: ', 'A question for the team at Cái Mép: ') + QUESTION() });
      };
      f.__port = true; window.luminaAdvice = f;
    }
    // Giải thích kết quả vòng (js/app.js, bản 3D dùng lại): thêm một dòng cho lựa chọn ở cảng của vụ 5.
    if (typeof window.explainRound === 'function' && !window.explainRound.__port) {
      const orig = window.explainRound;
      const f = function (r) {
        const t = orig.apply(this, arguments);
        const c = r && r.round === ROUND && r.decisions && r.decisions.portChoice;
        return c === 'a' || c === 'c' ? t + ' 🚢 ' + NOTE(c) : t;
      };
      f.__port = true; window.explainRound = f;
    }
    if (typeof window.renderDecisions === 'function' && !window.renderDecisions.__port) {
      const orig = window.renderDecisions;
      const f = function () { const r = orig.apply(this, arguments); try { sync(); } catch (e) { console.warn('[BizonPort]', e); } return r; };
      f.__port = true; window.renderDecisions = f;
    }
  };

  // ---------- Ô «🚢 Xử lý hàng kẹt ở Cái Mép» trong bảng Quyết định ----------
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  function css() {
    if (document.getElementById('bz-port-css') || !document.head) return;
    const st = document.createElement('style'); st.id = 'bz-port-css';
    st.textContent = '#bz-port{box-sizing:border-box;max-width:100%;min-width:0;margin:0 0 16px;padding:14px;border:2px solid #e2b04a;border-radius:20px;background:#fffaf0;color:#033337}'
      + '#bz-port[hidden]{display:none}#bz-port legend{float:left;width:100%;padding:0;margin:0 0 4px;font-weight:800;font-size:15px}'
      + '#bz-port .bzp-ctx{clear:both;margin:0 0 10px;font-size:12px;line-height:1.45;opacity:.8}'
      + '#bz-port label{box-sizing:border-box;display:flex;gap:10px;align-items:flex-start;min-height:44px;margin:0 0 8px;padding:10px 12px;border:2px solid rgba(0,102,135,.15);border-radius:14px;background:#fff;cursor:pointer;overflow-wrap:anywhere}'
      + '#bz-port label.on{border-color:#006687;background:#eef7f8}#bz-port input{flex:none;width:20px;height:20px;margin:2px 0 0;accent-color:#006687}'
      + '#bz-port label span{display:block;min-width:0}#bz-port b{display:block;font-size:13px}#bz-port small{display:block;font-size:12px;line-height:1.4;opacity:.8}'
      + '#bz-port .bzp-e{margin-top:3px;font-weight:700;opacity:.9}#bz-port .bzp-q{margin:4px 0 0;padding:8px 10px;border-radius:12px;background:#eef6f6;font-size:12px;line-height:1.45}'
      + '#bz-port .bzp-n{margin:8px 0 0;font-size:11px;opacity:.65}#bz-port.locked label{cursor:default;opacity:.75}'
      + 'html[data-theme="dark"] #bz-port{background:#1d2a2c;color:#e9f1f1;border-color:#9c7a2c}html[data-theme="dark"] #bz-port label{background:#243436;border-color:#3a5355}'
      + 'html[data-theme="dark"] #bz-port label.on{background:#1f3e45;border-color:#4fb3c9}html[data-theme="dark"] #bz-port .bzp-q{background:#24393b}';
    document.head.appendChild(st);
  }
  function html(s) {
    const c = choice(s), locked = !!(s.committed || s.roundLocked), cs = CASE[s.caseId] || CASE.A;
    return `<legend>${esc(tr('🚢 Xử lý hàng kẹt ở Cái Mép', '🚢 Handling cargo stuck at Cái Mép'))}</legend>`
      + `<p class="bzp-ctx">${esc(tr(cs[0], cs[1]))} ${esc(tr('COO đề xuất, CEO chốt cùng lúc chốt vụ.', 'The COO proposes; the CEO decides when committing the round.'))}</p>`
      + OPTS().map(o => `<label class="${o.v === c ? 'on' : ''}"><input type="radio" name="bz-port-choice" value="${o.v}"${o.v === c ? ' checked' : ''}${locked ? ' disabled' : ''}>`
        + `<span><b>${esc(o.t)}</b><small>${esc(o.d)}</small><small class="bzp-e">${esc(o.e)}</small></span></label>`).join('')
      + `<p class="bzp-q">🤖 ${esc(tr('Lumina hỏi: ', 'Lumina asks: '))}${esc(QUESTION())}</p>`
      + `<p class="bzp-n">${esc(tr('Không chọn thì tính là (b). Lựa chọn không tính điểm riêng; giảng viên dùng khi thảo luận sau ván.', 'No choice counts as (b). The choice is not scored separately; your instructor uses it in the debrief.'))}</p>`;
  }
  // Chỗ đặt ô: game.html – ngay sau khối COO (sau thanh sản lượng); bản v2 – trước khung dự báo trong thẻ quyết định.
  function anchor() {
    const prod = document.getElementById('in-prod'), coo = prod && prod.closest('#tab-decisions .mb-5');
    if (coo) return { where: 'afterend', el: coo };
    const sec = document.querySelector('[aria-labelledby="bn2-dec-h"]');
    if (sec) { const f = sec.querySelector('.bn2-sunk') || sec.querySelector('[data-act="commit"]'); if (f) return { where: 'beforebegin', el: f }; }
    const cb = document.getElementById('commit-box'); return cb ? { where: 'beforebegin', el: cb } : null;
  }
  let busy = false;
  function sync() {
    if (busy || typeof document === 'undefined' || !document.body) return;
    busy = true;
    try {
      const s = liveState(); let box = document.getElementById('bz-port');
      const on = !!s && active(s);
      if (!on) { if (box) box.hidden = true; return; }
      const a = anchor(); if (!a) return;
      css();
      if (!box) { box = document.createElement('fieldset'); box.id = 'bz-port'; box.addEventListener('change', onPick); }
      if (box.previousElementSibling !== a.el && box.nextElementSibling !== a.el) a.el.insertAdjacentElement(a.where, box);
      const key = [choice(s), !!(s.committed || s.roundLocked), s.caseId, tr('vi', 'en')].join('|');
      if (box.dataset.k !== key) { box.innerHTML = html(s); box.dataset.k = key; }
      box.classList.toggle('locked', !!(s.committed || s.roundLocked));
      box.hidden = false;
    } finally { busy = false; }
  }
  function onPick(e) {
    const t = e.target; if (!t || t.name !== 'bz-port-choice') return;
    const s = liveState(); if (!s || !active(s) || s.committed || s.roundLocked) { sync(); return; }
    s.portChoice = t.value === 'a' || t.value === 'c' ? t.value : 'b';
    try { if (typeof save === 'function') save(); } catch (x) { /* lưu máy chủ lỗi thì vẫn giữ ở máy */ }
    sync();
  }
  // Báo cáo vụ của bản v2 (js/bn2-ui.js tự giải thích kết quả, không qua explainRound): thêm dòng lựa chọn ở cảng.
  function noteV2() {
    const m = document.querySelector('.bn2-modal[aria-labelledby="bn2-rep-h"]'), s = liveState(); if (!m || !s || !s.history) return;
    const eb = m.querySelector('.bn2-eyebrow'), why = m.querySelector('.bn2-why');
    if (!eb || !why || why.querySelector('.bzp-note') || !/(^|\D)5\/6/.test(eb.textContent)) return;
    const r = s.history.find(h => h && h.round === ROUND), c = r && r.decisions && r.decisions.portChoice;
    if (c !== 'a' && c !== 'c') return;
    const p = document.createElement('span'); p.className = 'bzp-note'; p.textContent = ' 🚢 ' + NOTE(c); why.appendChild(p);
  }
  function focus() {
    sync(); const box = document.getElementById('bz-port'); if (!box || box.hidden) return false;
    box.scrollIntoView({ block: 'center' }); const i = box.querySelector('input:checked') || box.querySelector('input'); if (i) i.focus({ preventScroll: true });
    return true;
  }

  hook();
  const start = () => {
    hook(); sync();
    // Bản v2 vẽ lại toàn khung (#bn2-app) mỗi lần render(); game.html đã có móc renderDecisions.
    const app = document.getElementById('bn2-app');
    if (app && typeof MutationObserver === 'function') new MutationObserver(() => { sync(); noteV2(); }).observe(app, { childList: true });
    if (typeof addEventListener === 'function') addEventListener('bizon:langchange', () => setTimeout(sync, 0));
  };
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start(); }

  window.BizonPort = { CA, U, FULFILL_C, choice, active, now: () => active(liveState()), sync, focus, label: c => (LABEL[c] ? tr(LABEL[c][0], LABEL[c][1]) : ''), question: QUESTION };
})();
