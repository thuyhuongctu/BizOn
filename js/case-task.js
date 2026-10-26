/* BizOn — Bài tình huống trước – sau (R2): trang bai-tinh-huong.html.
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 * Phụ thuộc (nạp trước): js/backend-config.js, js/student-login.js, js/explain-mode.js, js/case-task-data.js, js/bizon-clay-i18n.js.
 *
 * Quy trình: nhập mã lớp (+ tên đội) → nếu đã đăng nhập, hỏi máy chủ bài mình đã nộp (bizon_case_task_mine) → giai đoạn
 * = 'pre' khi chưa nộp gì, 'post' khi đã có pre; bản bài: pre theo băm (email | mã lớp) → A/B, post = bản còn lại của chính
 * bài pre đã nộp (đọc từ máy chủ, không băm lại). ?phase= và ?form= trên URL để giảng viên xem trước / kiểm thử.
 * Chưa đăng nhập vẫn làm được nhưng không nộp (kết quả không lưu). Điều kiện hộp đen của lớp (js/explain-mode.js) ghi kèm. */
(function () {
  'use strict';
  const D = window.BizOnCaseTaskData; if (!D) return;
  const APP_VERSION = 'bizon-ct-v1', LOCAL_KEY = 'bizon-case-task';
  const $ = id => document.getElementById(id);
  const lang = () => (typeof window.clayCurrentLang === 'function' ? window.clayCurrentLang() : 'vi');
  const t = (vi, en) => (lang() === 'en' ? en : vi);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const q = new URLSearchParams(location.search);
  const S = { phase: null, form: null, startedAt: 0, classCode: '', team: '', mine: [], practice: false, done: false };

  function fnv(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function baseForm(email, cls) { return fnv(String(email || '').toLowerCase() + '|' + cls) % 2 === 0 ? 'A' : 'B'; }
  function msg(id, text, ok) { const el = $(id); if (!el) return; el.textContent = text || ''; el.style.color = ok ? '#246b3a' : ''; }
  const signedIn = () => !!(window.StudentLogin && StudentLogin.signedIn && StudentLogin.signedIn());
  const email = () => { try { const s = StudentLogin.getSession(); return s && s.email || ''; } catch (e) { return ''; } };
  function readLocal() { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null') || {}; } catch (e) { return {}; } }
  function writeLocal(o) { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(Object.assign(readLocal(), o))); } catch (e) {} }

  // ---------- quyết định giai đoạn và bản bài ----------
  async function decide() {
    const cls = $('ct-class').value.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,40}$/.test(cls)) { msg('ct-msg-setup', t('Nhập mã lớp (3–40 ký tự: chữ, số, gạch nối).', 'Enter the class code (3–40 letters, digits, hyphens).')); $('ct-class').focus(); return; }
    S.classCode = cls; S.team = $('ct-team').value.trim().slice(0, 60); writeLocal({ classCode: cls, team: S.team });
    try { if (window.BizOnExplain) await BizOnExplain.init({ classCode: cls }); } catch (e) {}
    S.mine = []; S.practice = !signedIn();
    if (!S.practice) {
      try { S.mine = (await StudentLogin.rpc('bizon_case_task_mine', { p_class_code: cls })) || []; }
      catch (e) { msg('ct-msg-setup', t('Không đọc được bài đã nộp: ', 'Could not read submitted work: ') + (e && e.message ? e.message : e)); return; }
    }
    const pre = S.mine.find(r => r.phase === 'pre'), post = S.mine.find(r => r.phase === 'post');
    const fPhase = q.get('phase'), fForm = q.get('form');
    S.phase = fPhase === 'pre' || fPhase === 'post' ? fPhase : (pre ? 'post' : 'pre');
    if (fForm === 'A' || fForm === 'B') S.form = fForm;
    else if (S.phase === 'post' && pre) S.form = D.other(pre.form);
    else S.form = S.practice ? 'A' : baseForm(email(), cls);
    if (!fPhase && pre && post) { showDone(true); return; }
    renderTask();
  }

  // ---------- vẽ bài ----------
  function renderTask() {
    const L = lang(), items = D.FORMS[S.form];
    $('ct-setup').hidden = true; $('ct-done').hidden = true; $('ct-task').hidden = false;
    $('ct-meta').innerHTML = `<span><b>${esc(t('Lớp', 'Class'))}:</b> ${esc(S.classCode)}</span>` + (S.team ? `<span><b>${esc(t('Đội', 'Team'))}:</b> ${esc(S.team)}</span>` : '') +
      `<span><b>${esc(t('Giai đoạn', 'Phase'))}:</b> ${esc(S.phase === 'pre' ? t('TRƯỚC', 'BEFORE') : t('SAU', 'AFTER'))}</span><span><b>${esc(t('Bản', 'Form'))}:</b> ${esc(S.form)}</span>` +
      (S.practice ? `<span class="ct-warn">${esc(t('Chưa đăng nhập: làm thử, không nộp được.', 'Not signed in: practice only, cannot submit.'))}</span>` : '');
    $('ct-items').innerHTML = items.map((it, i) => {
      const c = it[L] || it.vi;
      if (it.mech === 'explain') return `<li class="ct-item" data-id="${esc(it.id)}"><h3>${i + 1}. ${esc(c.title)}</h3><p>${esc(c.text)}</p>
        <label class="ct-why"><span>${esc(t('Câu trả lời của bạn', 'Your answer'))}</span><textarea name="x-${esc(it.id)}" rows="7" maxlength="${D.EXPLAIN_MAX}" required></textarea></label></li>`;
      return `<li class="ct-item" data-id="${esc(it.id)}"><h3>${i + 1}. ${esc(c.title)}</h3><p>${esc(c.text)}</p>
        <div class="ct-opts" role="radiogroup" aria-label="${esc(c.title)}">${['a', 'b', 'c', 'd'].map(k => `<label class="ct-opt"><input type="radio" name="c-${esc(it.id)}" value="${k}" required><span><b>${k.toUpperCase()}.</b> ${esc(c.opts[k])}</span></label>`).join('')}</div>
        <label class="ct-why"><span>${esc(t('Vì sao bạn chọn vậy? (1–3 câu)', 'Why did you choose that? (1–3 sentences)'))}</span><textarea name="w-${esc(it.id)}" rows="2" maxlength="${D.WHY_MAX}" required></textarea></label></li>`;
    }).join('');
    $('ct-submit').textContent = S.practice ? t('Kiểm tra bài làm (không nộp)', 'Check answers (no submission)') : t('📨 Nộp bài', '📨 Submit');
    if (!S.startedAt) S.startedAt = Date.now();
    msg('ct-msg', '');
    window.scrollTo({ top: $('ct-task').offsetTop - 12, behavior: 'smooth' });
  }

  // ---------- thu thập và nộp ----------
  function collect() {
    const items = D.FORMS[S.form], out = [], L = lang(); let firstBad = null;
    for (const it of items) {
      const li = $('ct-items').querySelector(`.ct-item[data-id="${it.id}"]`);
      if (it.mech === 'explain') {
        const text = li.querySelector('textarea').value.trim();
        if (text.length < 20) { firstBad = firstBad || li; li.classList.add('bad'); } else li.classList.remove('bad');
        out.push({ id: it.id, mech: it.mech, text });
      } else {
        const ch = li.querySelector('input[type="radio"]:checked'), why = li.querySelector('textarea').value.trim();
        if (!ch || why.length < 5) { firstBad = firstBad || li; li.classList.add('bad'); } else li.classList.remove('bad');
        out.push({ id: it.id, mech: it.mech, choice: ch ? ch.value : null, why });
      }
    }
    return { answers: { version: D.VERSION, lang: L, items: out }, firstBad };
  }
  async function submit() {
    const { answers, firstBad } = collect();
    if (firstBad) { msg('ct-msg', t('Mỗi tình huống cần chọn một phương án và viết lý do; câu giải thích cần ít nhất vài câu.', 'Each situation needs one choice and a reason; the explanation needs at least a few sentences.')); firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (S.practice) { msg('ct-msg', t('Bài làm đủ. Đăng nhập email trường ở trên rồi bắt đầu lại để nộp.', 'All answered. Sign in with your school email above and start again to submit.'), true); return; }
    const btn = $('ct-submit'); btn.setAttribute('aria-disabled', 'true');
    try {
      const r = await StudentLogin.rpc('bizon_case_task_submit', { p_class_code: S.classCode, p_team_name: S.team, p_phase: S.phase, p_form: S.form, p_answers: answers,
        p_duration_s: Math.max(0, Math.round((Date.now() - S.startedAt) / 1000)), p_explain: window.BizOnExplain ? BizOnExplain.condition() : 'shown', p_app_version: APP_VERSION });
      writeLocal({ last: { classCode: S.classCode, phase: S.phase, form: S.form, at: (r && r.updated_at) || new Date().toISOString() } });
      S.done = true; showDone(false);
    } catch (e) { msg('ct-msg', t('Không nộp được: ', 'Could not submit: ') + (e && e.message ? e.message : e)); }
    finally { btn.removeAttribute('aria-disabled'); }
  }
  function showDone(both) {
    $('ct-setup').hidden = true; $('ct-task').hidden = true; $('ct-done').hidden = false;
    $('ct-done-text').textContent = both
      ? t('Bạn đã nộp cả bài TRƯỚC và bài SAU của lớp này. Cảm ơn bạn!', 'You have submitted both the BEFORE and AFTER tasks for this class. Thank you!')
      : (S.phase === 'pre' ? t('Đã nộp bài TRƯỚC. Sau khi lớp chơi xong ba bậc, quay lại trang này để làm bài SAU.', 'BEFORE task submitted. After the class finishes the three levels, come back here for the AFTER task.')
        : t('Đã nộp bài SAU. Cảm ơn bạn đã hoàn thành cả hai bài.', 'AFTER task submitted. Thank you for completing both tasks.'));
  }

  // ---------- khởi động ----------
  function init() {
    const loc = readLocal();
    if (loc.classCode && !$('ct-class').value) $('ct-class').value = loc.classCode;
    if (loc.team && !$('ct-team').value) $('ct-team').value = loc.team;
    if (q.get('class') && !$('ct-class').value) $('ct-class').value = q.get('class');
    if (window.StudentLogin && $('ct-login')) StudentLogin.mount($('ct-login'), { onChange: () => { $('ct-login-note').hidden = signedIn(); } });
    $('ct-login-note').hidden = signedIn();
    // Nút «Bắt đầu» là submit của form: chỉ bắt sự kiện submit (bắt cả click sẽ chạy decide() hai lần và vẽ lại bài đè lên câu trả lời).
    let deciding = false;
    $('ct-form').addEventListener('submit', e => { e.preventDefault(); if (deciding) return; deciding = true; decide().catch(e2 => msg('ct-msg-setup', String(e2 && e2.message || e2))).finally(() => { deciding = false; }); });
    $('ct-submit').addEventListener('click', () => { submit(); });
    $('ct-back').addEventListener('click', () => { $('ct-task').hidden = true; $('ct-setup').hidden = false; });
    window.addEventListener('bizon:langchange', () => { if (!$('ct-task').hidden && S.form) { const saved = collect().answers; renderTask(); restore(saved); } });
  }
  function restore(a) { try { for (const it of a.items) { const li = $('ct-items').querySelector(`.ct-item[data-id="${it.id}"]`); if (!li) continue; if (it.choice) { const r = li.querySelector(`input[value="${it.choice}"]`); if (r) r.checked = true; } li.querySelector('textarea').value = it.text || it.why || ''; } } catch (e) {} }
  window.__ctTest = { state: S, baseForm, fnv, collect, decide, renderTask };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
