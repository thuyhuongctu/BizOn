/* BizOn — Ghi nhận đóng góp từng thành viên (B5, B6 tự động trên Trang Giảng viên).
 * Mỗi thành viên đăng nhập trên máy riêng với cùng Mã lớp + Tên đội và vai của mình.
 *  - CFO/CMO/COO: gửi đề xuất theo mảng vai trò (lấy từ thanh trượt đang chỉnh).
 *  - SEC: gửi biên bản vòng.
 *  - CEO: xem đề xuất của đội, bấm Áp dụng; lúc Commit, hệ thống ghi quyết định đã chốt.
 *  - Mọi vai: mỗi lần chạy mô phỏng Nếu–Thì được ghi lại.
 * Mất mạng: xếp hàng trong localStorage, tự gửi lại. Cần migration 20260930000000_member_log.sql. */
(function () {
  const QKEY = 'bizon-member-log-queue';
  const cfg = () => window.BIZON_BACKEND || {};
  const on = () => cfg().enabled && cfg().url && !cfg().url.includes('YOUR-PROJECT');
  const $ = id => document.getElementById(id);
  const TT = (vi, en) => (typeof T === 'function' ? T(vi, en) : vi);
  const FIELDS = {
    CFO: [['in-rd', 'rd', 'R&D', 'tr'], ['in-term', 'paymentTerm', 'Kỳ hạn thanh toán', ' ngày']],
    CMO: [['in-price', 'price', 'Giá bán', 'k'], ['in-mkt', 'marketing', 'Marketing', 'tr']],
    COO: [['in-prod', 'production', 'Sản lượng', ' sp'], ['in-workers', 'workers', 'Nhân công', ''], ['in-train', 'training', 'Đào tạo', 'tr']],
  };
  const st = () => (typeof S !== 'undefined' ? S : null); // biến toàn cục `let S` của app.js
  const who = () => { const S = st(); if (!S || !S.profile) return null; const p = S.profile, c = (p.classId || '').trim();
    return { S, classCode: c, team: (p.teamName || '').trim(), role: p.role || 'CEO', email: p.email || null, name: (p.email || '').split('@')[0] || p.role, live: !!c && c !== 'DEMO-2026' && on() }; };
  const readQ = () => { try { return JSON.parse(localStorage.getItem(QKEY) || '[]'); } catch (e) { return []; } };
  const writeQ = q => { try { localStorage.setItem(QKEY, JSON.stringify(q.slice(-120))); } catch (e) {} };
  async function post(row) {
    const c = cfg();
    const r = await fetch(c.url.replace(/\/$/, '') + '/rest/v1/member_log', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: c.anonKey, Authorization: 'Bearer ' + c.anonKey, Prefer: 'return=minimal' }, body: JSON.stringify(row) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
  }
  async function flush() { if (!on() || !navigator.onLine) return; const q = readQ(); if (!q.length) return; const rest = []; for (const row of q) { try { await post(row); } catch (e) { rest.push(row); } } writeQ(rest); }
  function record(kind, payload) {
    const w = who(); if (!w || !w.live || !w.team) return false;
    const round = Math.min(6, Math.max(1, w.S.round || 1));
    const q = readQ(); q.push({ class_code: w.classCode, team_name: w.team, round_number: round, member_email: w.email, member_name: w.name, role: w.role, kind, payload: payload || {}, client_ts: new Date().toISOString() });
    writeQ(q); flush(); return true;
  }
  async function teamLog() {
    const w = who(); if (!w || !w.live) return [];
    try { const c = cfg(); const r = await fetch(c.url.replace(/\/$/, '') + '/rest/v1/rpc/bizon_team_log', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: c.anonKey, Authorization: 'Bearer ' + c.anonKey }, body: JSON.stringify({ p_class_code: w.classCode, p_team_name: w.team, p_round: Math.min(6, w.S.round || 1) }) });
      return r.ok ? (await r.json()) || [] : []; } catch (e) { return []; }
  }
  const sent = {}; // vòng đã gửi trên máy này: { 'r3': true }
  function valsFor(role) { const o = {}; (FIELDS[role] || []).forEach(([id, k]) => { const el = $(id); if (el) o[k] = +el.value; }); return o; }
  function fmt(role, p) { return (FIELDS[role] || []).filter(f => p[f[1]] != null).map(f => `${f[2]} <b>${(+p[f[1]]).toLocaleString('vi-VN')}${f[3]}</b>`).join(' · '); }

  async function render() {
    const w = who(); const anchor = $('team-meeting'); if (!w || !anchor) return;
    let box = $('member-panel'); if (!box) { box = document.createElement('div'); box.id = 'member-panel'; box.className = 'mb-3'; anchor.insertAdjacentElement('afterend', box); }
    if (w.S.finished || w.S.committed) { box.innerHTML = ''; return; }
    const r = w.S.round || 1, key = 'r' + r;
    const head = `<p class="font-display font-bold text-deep-teal text-sm mb-1">${TT('📋 Ghi nhận đóng góp – vòng ' + r, '📋 Contribution log – round ' + r)} <span class="text-[10px] font-extrabold text-primary">${w.role}</span></p>`;
    if (!w.live) { box.innerHTML = `<div class="clay-card p-4">${head}<p class="text-[11px] text-deep-teal/60">${TT('Đóng góp của từng thành viên chỉ được ghi nhận khi đội chơi bằng Mã lớp thật và máy chủ đang bật.', 'Individual contributions are only logged when the team plays with a real class code and the server is on.')}</p></div>`; return; }
    if (w.role === 'CEO') {
      box.innerHTML = `<div class="clay-card p-4">${head}<p class="text-[11px] text-deep-teal/60 mb-2">${TT('Đề xuất các thành viên gửi từ máy của họ. Áp dụng rồi mới Commit – đề xuất được dùng sẽ được tính điểm cho người gửi.', 'Proposals members send from their own devices. Apply before you Commit – adopted proposals earn points for the sender.')}</p><div id="mp-list" class="text-xs text-deep-teal/60">${TT('Đang tải…', 'Loading…')}</div></div>`;
      const rows = await teamLog(), list = $('mp-list'); if (!list) return;
      const latest = {}; rows.forEach(x => { if (!latest[x.role + x.kind]) latest[x.role + x.kind] = x; });
      const L = Object.values(latest);
      list.innerHTML = L.length ? L.map((x, i) => `<div class="clay-sunken rounded-2xl p-3 mb-2"><p class="text-[11px] font-extrabold text-deep-teal">${x.role} · ${x.member_name || ''}</p>
        <p class="text-[11px] text-deep-teal/75 mt-0.5">${x.kind === 'minutes' ? '📝 ' + String((x.payload || {}).text || '').replace(/</g, '&lt;') : fmt(x.role, x.payload || {})}</p>
        ${x.kind === 'proposal' ? `<button data-mp="${i}" class="clay-btn bg-surface-bright text-primary text-[10px] font-extrabold px-3 py-1.5 mt-1.5">${TT('👍 Áp dụng vào thanh trượt', '👍 Apply to sliders')}</button>` : ''}</div>`).join('')
        : TT('Chưa có đề xuất nào. Nhắc CFO, CMO, COO gửi đề xuất và SEC gửi biên bản.', 'No proposals yet. Remind the CFO, CMO and COO to send proposals and the SEC to send minutes.');
      list.querySelectorAll('[data-mp]').forEach(b => b.onclick = () => { const x = L[+b.dataset.mp]; (FIELDS[x.role] || []).forEach(([id, k]) => { const el = $(id); if (el && x.payload[k] != null) { el.value = x.payload[k]; el.dispatchEvent(new Event('input', { bubbles: true })); } });
        if (typeof syncDecisionLabels === 'function') syncDecisionLabels(); b.textContent = TT('✓ Đã áp dụng', '✓ Applied'); b.classList.add('opacity-60'); });
      return;
    }
    if (w.role === 'SEC') {
      box.innerHTML = `<div class="clay-card p-4">${head}<p class="text-[11px] text-deep-teal/60 mb-2">${TT('Ghi biên bản cuộc họp đội: biến cố, ý kiến từng vai, quyết định thống nhất (tối thiểu 30 ký tự).', 'Write the team meeting minutes: the event, each role\'s view, the agreed decision (30 characters minimum).')}</p>
        <textarea id="mp-min" rows="3" class="w-full rounded-2xl border-2 border-primary/10 bg-surface-bright p-2 text-xs"></textarea>
        <button id="mp-send" class="clay-btn bg-primary text-white text-xs font-extrabold px-4 py-2 mt-2">${sent[key] ? TT('✓ Đã gửi – gửi lại', '✓ Sent – resend') : TT('📤 Gửi biên bản', '📤 Send minutes')}</button></div>`;
      $('mp-send').onclick = () => { const t = ($('mp-min').value || '').trim(); if (t.length < 30) { alert(TT('Biên bản cần tối thiểu 30 ký tự.', 'Minutes need at least 30 characters.')); return; }
        if (record('minutes', { text: t.slice(0, 1500) })) { sent[key] = true; render(); } };
      return;
    }
    const p = valsFor(w.role);
    box.innerHTML = `<div class="clay-card p-4">${head}<p class="text-[11px] text-deep-teal/60 mb-2">${TT('Chỉnh các thanh trượt thuộc mảng của bạn rồi gửi cho CEO. Đề xuất được áp dụng sẽ tính điểm cho bạn.', 'Adjust the sliders in your area, then send them to the CEO. Adopted proposals earn you points.')}</p>
      <p class="text-xs text-deep-teal mb-2">${fmt(w.role, p)}</p>
      <button id="mp-send" class="clay-btn bg-primary text-white text-xs font-extrabold px-4 py-2">${sent[key] ? TT('✓ Đã gửi – gửi bản mới', '✓ Sent – send an update') : TT('📤 Gửi đề xuất cho CEO', '📤 Send proposal to the CEO')}</button></div>`;
    $('mp-send').onclick = () => { if (record('proposal', valsFor(w.role))) { sent[key] = true; render(); } };
  }

  let wDepth = 0; // chống ghi 2 lần nếu runWhatIf bị bọc nhiều lớp
  function hook() {
    if (typeof window.renderTeamMeeting === 'function' && !window.renderTeamMeeting.__ml) {
      const o = window.renderTeamMeeting; window.renderTeamMeeting = function () { const x = o.apply(this, arguments); render(); return x; }; window.renderTeamMeeting.__ml = true;
    }
    if (typeof window.runWhatIf === 'function' && !window.runWhatIf.__ml) {
      const o = window.runWhatIf; window.runWhatIf = function (role) { if (wDepth) return o.apply(this, arguments); wDepth++; try { const S = st(), before = S && S.whatIfUsed; const x = o.apply(this, arguments); const S2 = st(); if (S2 && S2.whatIfUsed > before) record('whatif', { role }); return x; } finally { wDepth--; } }; window.runWhatIf.__ml = true;
    }
    if (typeof window.commitDecisions === 'function' && !window.commitDecisions.__ml) {
      const o = window.commitDecisions; window.commitDecisions = function () { const S = st(), was = S && S.committed, d = typeof currentDecisionInput === 'function' ? currentDecisionInput() : {}; const x = o.apply(this, arguments);
        const S2 = st(); if (S2 && !was && S2.committed) record('commit', d); return x; }; window.commitDecisions.__ml = true;
    }
  }
  hook(); document.addEventListener('DOMContentLoaded', hook); window.addEventListener('load', () => { hook(); setTimeout(hook, 1500); });
  window.addEventListener('online', flush); document.addEventListener('DOMContentLoaded', flush);
  setInterval(() => { const w = who(); if (w && w.role === 'CEO' && $('member-panel') && !document.hidden) render(); }, 20000);
  window.BizonMemberLog = { record, flush, render };
})();
