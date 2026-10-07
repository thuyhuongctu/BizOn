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
  async function teamAllLog() {
    const w = who(); if (!w || !w.live) return [];
    try { const c = cfg(); const r = await fetch(c.url.replace(/\/$/, '') + '/rest/v1/rpc/bizon_team_all_log', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: c.anonKey, Authorization: 'Bearer ' + c.anonKey }, body: JSON.stringify({ p_class_code: w.classCode, p_team_name: w.team }) });
      return r.ok ? (await r.json()) || [] : []; } catch (e) { return []; }
  }
  // Gộp nhật ký đội thành thống kê theo thành viên (vai + tên) cho tab "Hiệu suất thành viên".
  // Đếm số hành động ghi nhận được – KHÔNG phải điểm chấm, chỉ đo mức độ tham gia tương đối.
  function teamStats(rows) {
    const byMember = {}; // key: role+'|'+name
    const keyOf = r => r.role + '|' + (r.member_name || r.role);
    rows.forEach(r => {
      const k = keyOf(r); if (!byMember[k]) byMember[k] = { role: r.role, name: r.member_name || r.role, proposals: 0, minutes: 0, whatif: 0, lumina: 0, commits: 0, overdraftRounds: 0, lastAt: r.created_at };
      const m = byMember[k];
      if (r.kind === 'proposal') m.proposals++;
      else if (r.kind === 'minutes') m.minutes++;
      else if (r.kind === 'whatif') m.whatif++;
      else if (r.kind === 'lumina') m.lumina++;
      else if (r.kind === 'commit') { m.commits++; if ((r.payload || {}).overdraft > 0) m.overdraftRounds++; }
      if (r.created_at > m.lastAt) m.lastAt = r.created_at;
    });
    const members = Object.values(byMember).map(m => ({ ...m, actions: m.proposals + m.minutes + m.whatif + m.lumina + m.commits }));
    const maxActions = Math.max(1, ...members.map(m => m.actions));
    members.forEach(m => { m.score = Math.round(m.actions / maxActions * 100); });
    // Cân bằng đội: 100 trừ chênh lệch điểm tham gia cao nhất–thấp nhất (đội đều tay → điểm cao)
    const scores = members.map(m => m.score);
    const balance = members.length ? Math.max(0, 100 - (Math.max(...scores) - Math.min(...scores))) : 100;
    return { members, balance };
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
        const S2 = st(); if (S2 && !was && S2.committed) { const last = S2.history && S2.history[S2.history.length - 1];
          record('commit', Object.assign({}, d, last ? { overdraft: last.overdraft || 0, netProfit: last.netProfit } : {})); } return x; }; window.commitDecisions.__ml = true;
    }
    if (typeof window.askLumina === 'function' && !window.askLumina.__ml) {
      const o = window.askLumina; window.askLumina = function (topic) { const S = st(), before = S && S.aiAskedTotal; const x = o.apply(this, arguments);
        const S2 = st(); if (S2 && S2.aiAskedTotal > before) record('lumina', { topic }); return x; }; window.askLumina.__ml = true;
    }
  }
  hook(); document.addEventListener('DOMContentLoaded', hook); window.addEventListener('load', () => { hook(); setTimeout(hook, 1500); });
  window.addEventListener('online', flush); document.addEventListener('DOMContentLoaded', flush);
  setInterval(() => { const w = who(); if (w && w.role === 'CEO' && $('member-panel') && !document.hidden) render(); }, 20000);

  const ROLE_NAME = { CEO: 'CEO', CFO: 'CFO', CMO: 'CMO', COO: 'COO', SEC: TT('Thư ký', 'Secretary') };
  function statLine(m) {
    const parts = [];
    if (m.proposals) parts.push(TT(`${m.proposals} đề xuất`, `${m.proposals} proposals`));
    if (m.minutes) parts.push(TT(`${m.minutes} biên bản`, `${m.minutes} minutes`));
    if (m.whatif) parts.push(TT(`${m.whatif} lượt Nếu–Thì`, `${m.whatif} what-ifs`));
    if (m.lumina) parts.push(TT(`${m.lumina} lượt hỏi Lumina`, `${m.lumina} Lumina asks`));
    if (m.commits) parts.push(TT(`${m.commits} lần chốt vòng`, `${m.commits} commits`));
    if (m.overdraftRounds) parts.push(`<span class="text-orange-600">${TT(`${m.overdraftRounds} vòng thấu chi`, `${m.overdraftRounds} overdraft rounds`)}</span>`);
    return parts.join(' · ') || TT('Chưa ghi nhận hành động nào', 'No actions recorded yet');
  }
  async function renderReport(body) {
    const w = who();
    if (!w || !w.live) { body.innerHTML = `<div class="clay-card p-8 text-center text-sm text-deep-teal/50">${TT('Tab này chỉ có dữ liệu khi đội chơi bằng Mã lớp thật và máy chủ đang bật.', 'This tab only has data when the team plays with a real class code and the server is on.')}</div>`; return; }
    body.innerHTML = `<div class="clay-card p-8 text-center text-sm text-deep-teal/50">${TT('Đang tải…', 'Loading…')}</div>`;
    const rows = await teamAllLog();
    if (!rows.length) { body.innerHTML = `<div class="clay-card p-8 text-center text-sm text-deep-teal/50">${TT('Chưa có dữ liệu – đội chưa gửi đề xuất, biên bản hay hỏi Lumina lần nào.', 'No data yet – the team has not sent proposals, minutes or asked Lumina yet.')}</div>`; return; }
    const { members, balance } = teamStats(rows);
    members.sort((a, b) => b.score - a.score);
    body.innerHTML = `
      <div class="clay-card p-5 mb-3">
        <h3 class="font-display font-bold text-deep-teal text-sm mb-1">${TT('📈 Hiệu suất thành viên', '📈 Member performance')}</h3>
        <p class="text-[11px] text-deep-teal/60 mb-4">${TT('Ai đóng góp gì trong trận – dựa trên số lượng hành động ghi nhận, không theo thắng/thua.', 'Who contributed what this match – based on the number of logged actions, not win/lose.')}</p>
        <div class="clay-sunken rounded-2xl p-4">
          <p class="text-[10px] font-extrabold text-deep-teal/60 uppercase tracking-wide mb-1">${TT('Chỉ số đồng đội · Team balance', 'Team balance index')}</p>
          <p class="font-display font-black text-deep-teal text-3xl">${balance}<span class="text-sm text-deep-teal/40">/100</span></p>
        </div>
      </div>
      <div class="clay-card p-5">
        <h4 class="font-display font-bold text-deep-teal text-xs mb-3">${TT('Đội hình', 'Lineup')}</h4>
        ${members.map(m => `
          <div class="clay-sunken rounded-2xl p-3 mb-2">
            <div class="flex items-center justify-between mb-1">
              <p class="text-xs font-extrabold text-deep-teal">${m.name} <span class="text-primary">${ROLE_NAME[m.role] || m.role}</span></p>
              <p class="font-display font-bold text-deep-teal text-sm">${m.score}<span class="text-[10px] text-deep-teal/40">${TT('đ', 'pt')}</span></p>
            </div>
            <div class="w-full h-1.5 rounded-full bg-primary/10 overflow-hidden mb-1.5"><div class="h-full bg-primary rounded-full" style="width:${m.score}%"></div></div>
            <p class="text-[10px] text-deep-teal/60">${statLine(m)}</p>
          </div>`).join('')}
      </div>`;
  }
  window.BizonMemberLog = { record, flush, render, renderReport };
})();
