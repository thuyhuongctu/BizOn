/* BizOn — Nhánh nghiên cứu «hộp đen»: ẩn phần giải thích cơ chế trong game theo cờ lớp class_controls.explain_hidden (R1).
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Cùng engine, cùng biến cố, cùng thông tin về môi trường; chỉ khác: lớp «hộp đen» không thấy lời giải cơ chế
 * (phần tử có lớp .bz-explain hoặc trong danh sách css/explain-mode.css). Điều kiện được ghi vào mọi kết quả nộp
 * (p_detail_json.explain / result_json.explain) và vào hộ chiếu hành trình (tiers.tN.explain) → tách nhóm khi phân tích.
 *
 * Nguồn cờ, theo thứ tự: ?explain=hidden|shown trên URL (xem trước, kiểm thử) → mã lớp đưa vào init() → mã lớp trong hộ chiếu
 * hành trình / ván lưu của trang → không có mã lớp thật → 'shown'. Cờ lớp đọc ẩn danh qua bizon_class_feed, nhớ 5 phút trong
 * sessionStorage để ba game của một hành trình không hỏi lại. Trang không có backend → luôn 'shown'. */
(function () {
  'use strict';
  const CACHE = 'bizon-explain-cache', TTL = 5 * 60 * 1000, CLS = 'bz-blackbox';
  const cfg = () => window.BIZON_BACKEND || {};
  const on = () => !!(cfg().enabled && cfg().url && cfg().anonKey);
  const norm = c => String(c || '').trim().toUpperCase();
  const real = c => !!c && c !== 'DEMO-2026' && c !== 'TU-HOC';
  let hidden = false, source = 'default', code = '', ready;

  function apply(h, src, c) {
    hidden = !!h; source = src; code = c || code;
    try { document.documentElement.classList.toggle(CLS, hidden); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('bizon:explain', { detail: { hidden, source } })); } catch (e) {}
    return hidden;
  }
  function cached(c) { try { const j = JSON.parse(sessionStorage.getItem(CACHE) || 'null'); return j && j.code === c && Date.now() - j.at < TTL ? !!j.hidden : null; } catch (e) { return null; } }
  function remember(c, h) { try { sessionStorage.setItem(CACHE, JSON.stringify({ code: c, hidden: !!h, at: Date.now() })); } catch (e) {} }
  async function fetchFlag(c) {
    const r = await fetch(cfg().url.replace(/\/$/, '') + '/rest/v1/rpc/bizon_class_feed', { method: 'POST', headers: { apikey: cfg().anonKey, Authorization: 'Bearer ' + cfg().anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_class_code: c, p_team_name: '-' }) });
    if (!r.ok) throw new Error('class_feed ' + r.status);
    const j = await r.json(); return !!(j && j.controls && j.controls.explain_hidden === true);
  }
  // Mã lớp đoán từ trang khi init() không đưa: hộ chiếu hành trình (khi có ?journey=), rồi các khóa lưu của từng game.
  function guessClass() {
    try { if (/[?&]journey=/.test(location.search)) { const p = JSON.parse(localStorage.getItem('bizon-journey') || 'null'); if (p && p.classCode) return p.classCode; } } catch (e) {}
    try { const g = JSON.parse(localStorage.getItem('bizon2026') || 'null'); if (g && g.profile && g.profile.classId) return g.profile.classId; } catch (e) {}
    for (const k of ['bps-class', 'bp-class']) { try { const v = localStorage.getItem(k); if (v) return v; } catch (e) {} }
    try { const d = JSON.parse(localStorage.getItem('durian_class_v2') || 'null'); if (d && d.cls) return d.cls; } catch (e) {}
    return '';
  }
  // init({ classCode }) – gọi lại được khi người chơi nhập mã lớp; trả Promise<boolean hidden>.
  function init(opts) {
    const o = opts || {};
    const u = /[?&]explain=(hidden|shown)/.exec(location.search);
    if (u) { ready = Promise.resolve(apply(u[1] === 'hidden', 'url', norm(o.classCode))); return ready; }
    const c = norm(o.classCode || guessClass());
    if (!real(c) || !on()) { ready = Promise.resolve(apply(false, 'none', c)); return ready; }
    const hit = cached(c);
    if (hit !== null) { ready = Promise.resolve(apply(hit, 'cache', c)); return ready; }
    ready = fetchFlag(c).then(h => { remember(c, h); return apply(h, 'class', c); }).catch(() => apply(false, 'error', c));
    return ready;
  }
  // Áp từ controls đã có sẵn (class-sync của Bật Nghiệp đọc feed mỗi ~20 s).
  function applyControls(ctl, c) { if (!ctl || typeof ctl !== 'object' || source === 'url') return hidden; const cc = norm(c || code); if (cc) remember(cc, ctl.explain_hidden === true); return apply(ctl.explain_hidden === true, 'class', cc); }
  const condition = () => (hidden ? 'hidden' : 'shown');
  window.BizOnExplain = { init, applyControls, condition, ready: () => ready, get hidden() { return hidden; }, get source() { return source; }, get classCode() { return code; } };
  // Tự khởi động khi trang đã dựng xong (trang có thể gọi init() sớm hơn với mã lớp của mình); ready() gọi trước đó vẫn chờ được.
  ready = new Promise(res => { const go = () => res(source === 'default' ? init() : hidden); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go(); });
})();
