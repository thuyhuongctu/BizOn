(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const cfg = () => window.BIZON_BACKEND || {};
  const state = {
    timer: null,
    mode: null, // 'auth' | 'demo'
    classCode: '',
    session: null, // { accessToken, refreshToken, email, expiresAt }
    leaderboard: [],
    feed: [],
    brandPassport: [],
    learningTraces: [],
    surveys: []
  };

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  const fmtNumber = value => value == null || value === '' ? '–' : Number(value).toLocaleString('vi-VN');
  const fmtPercent = value => value == null || value === '' ? '–' : `${Number(value).toFixed(1)}%`;
  const fmtDateTime = value => {
    if (!value) return '–';
    try {
      return new Date(value).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (_) {
      return '–';
    }
  };

  // Prevent spreadsheet applications from interpreting untrusted text as formulas.
  const csvCell = value => {
    let text = String(value ?? '').replace(/\r?\n/g, ' ');
    if (/^[\t\r\n ]*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };

  const setStatus = (message, type = 'neutral') => {
    const node = $('bi-status');
    if (!node) return;
    node.textContent = message;
    node.dataset.state = type;
  };

  const clearPasswordInput = () => {
    const input = $('bi-password');
    if (input) input.value = '';
  };

  // ===================== Auth (Supabase GoTrue, raw REST) =====================
  const SESSION_KEY = 'bizon-instructor-session';

  function saveSession() {
    try {
      if (state.session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.session));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch (_) {}
  }

  function loadSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.accessToken && parsed.expiresAt > Date.now()) return parsed;
    } catch (_) {}
    return null;
  }

  async function authRequest(path, body) {
    const backend = cfg();
    if (!backend.url || !backend.anonKey) throw new Error('Backend chưa được cấu hình');
    const response = await fetch(`${backend.url.replace(/\/$/, '')}/auth/v1/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: backend.anonKey },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error_description || data.msg || data.error || `HTTP ${response.status}`);
    return data;
  }

  function applyAuthResponse(data, email) {
    if (!data.access_token) throw new Error('Máy chủ không trả về phiên đăng nhập hợp lệ.');
    state.session = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || null,
      email: (data.user && data.user.email) || email,
      expiresAt: Date.now() + (Number(data.expires_in || 3600) - 30) * 1000
    };
    saveSession();
  }

  async function refreshSession() {
    if (!state.session || !state.session.refreshToken) return false;
    try {
      const data = await authRequest('token?grant_type=refresh_token', { refresh_token: state.session.refreshToken });
      applyAuthResponse(data, state.session.email);
      return true;
    } catch (_) {
      state.session = null;
      saveSession();
      return false;
    }
  }

  async function signUp() {
    const email = $('bi-email')?.value.trim();
    const password = $('bi-password')?.value;
    if (!email || !password || password.length < 8) {
      setStatus('Cần email hợp lệ và mật khẩu tối thiểu 8 ký tự.', 'error');
      return;
    }
    setStatus('Đang tạo tài khoản…');
    try {
      const data = await authRequest('signup', { email, password });
      if (data.access_token) {
        applyAuthResponse(data, email);
        showClassBlock();
        setStatus('Đã tạo tài khoản và đăng nhập. Nhập Mã lớp để đăng ký lớp của bạn.', 'success');
      } else {
        setStatus('Đã tạo tài khoản. Kiểm tra email để xác nhận, rồi bấm "Đăng nhập".', 'success');
      }
    } catch (error) {
      setStatus(`Không tạo được tài khoản (${error.message}).`, 'error');
    } finally {
      clearPasswordInput();
    }
  }

  async function signIn() {
    const email = $('bi-email')?.value.trim();
    const password = $('bi-password')?.value;
    if (!email || !password) {
      setStatus('Cần nhập email và mật khẩu.', 'error');
      return;
    }
    setStatus('Đang đăng nhập…');
    try {
      const data = await authRequest('token?grant_type=password', { email, password });
      applyAuthResponse(data, email);
      showClassBlock();
      setStatus('Đã đăng nhập. Nhập Mã lớp để đăng ký hoặc theo dõi lớp của bạn.', 'success');
      try {
        const saved = localStorage.getItem('bizon-instructor-class');
        if (saved && $('bi-class-code')) $('bi-class-code').value = saved;
      } catch (_) {}
    } catch (error) {
      setStatus(`Không đăng nhập được (${error.message}).`, 'error');
    } finally {
      clearPasswordInput();
    }
  }

  function signOut() {
    state.session = null;
    state.classCode = '';
    saveSession();
    clearInterval(state.timer);
    $('bi-studio-content')?.classList.add('bi-hidden');
    $('bi-class-block')?.classList.add('bi-hidden');
    $('bi-auth-block')?.classList.remove('bi-hidden');
    setStatus('Đã đăng xuất.');
  }

  function showClassBlock() {
    $('bi-auth-block')?.classList.add('bi-hidden');
    $('bi-class-block')?.classList.remove('bi-hidden');
    const line = $('bi-account-line');
    if (line) line.textContent = `Đã đăng nhập: ${state.session.email} · `;
    if (line) {
      const signOutBtn = document.createElement('button');
      signOutBtn.type = 'button';
      signOutBtn.className = 'bi-btn';
      signOutBtn.style.cssText = 'padding:2px 10px;min-height:auto;font-size:.62rem';
      signOutBtn.textContent = 'Đăng xuất';
      signOutBtn.addEventListener('click', signOut);
      line.appendChild(signOutBtn);
    }
  }

  // ===================== RPC =====================
  async function rpc(functionName, args, { anon = false, retry = true } = {}) {
    const backend = cfg();
    if (!backend.url || !backend.anonKey) throw new Error('Backend chưa được cấu hình');
    const token = anon ? backend.anonKey : (state.session?.accessToken || backend.anonKey);
    const response = await fetch(`${backend.url.replace(/\/$/, '')}/rest/v1/rpc/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: backend.anonKey,
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(args)
    });
    if (response.status === 401 && !anon && retry) {
      const refreshed = await refreshSession();
      if (refreshed) return rpc(functionName, args, { anon, retry: false });
    }
    if (!response.ok) {
      const detail = await response.json().catch(() => null);
      throw new Error((detail && (detail.message || detail.hint)) || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async function safeRpc(functionName, args, fallback = []) {
    try {
      const result = await rpc(functionName, args);
      return Array.isArray(result) ? result : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function renderLeaderboard() {
    const body = $('bi-leaderboard-rows');
    if (!body) return;
    const medals = ['🥇', '🥈', '🥉'];
    body.innerHTML = state.leaderboard.length
      ? state.leaderboard.map((row, index) => `<tr>
          <td><strong>${medals[index] || index + 1}</strong></td>
          <td><strong>${escapeHtml(row.team_name)}</strong></td>
          <td>Chu kỳ ${Number(row.best_round || 0)}/6</td>
          <td><strong>${fmtPercent(row.share)}</strong></td>
          <td>${fmtNumber(row.net_profit)} ₫</td>
          <td>${fmtNumber(row.revenue)} ₫</td>
          <td>${fmtNumber(row.balance)} ₫</td>
          <td>${fmtNumber(row.submissions)}</td>
          <td>${fmtDateTime(row.last_submit)}</td>
        </tr>`).join('')
      : '<tr><td colspan="9" class="bi-empty">Chưa có đội nào nộp kết quả hoặc Mã lớp chưa đúng.</td></tr>';
  }

  function renderFeed() {
    const list = $('bi-feed');
    if (!list) return;
    list.innerHTML = state.feed.length
      ? state.feed.map(item => `<li><strong>${fmtDateTime(item.created_at)}</strong> · Đội <b>${escapeHtml(item.team_name)}</b> khóa vòng ${Number(item.round_number || 0)} · lợi nhuận ${fmtNumber(item.net_profit)} ₫ · thị phần ${fmtPercent(item.share)}</li>`).join('')
      : '<li>Chưa có lượt khóa vòng nào; hãy kiểm tra lại Mã lớp nếu lớp đã nộp bài.</li>';
  }

  function renderBrandPassport() {
    const body = $('bi-bp-rows');
    if (!body) return;
    body.innerHTML = state.brandPassport.length
      ? state.brandPassport.map((row, index) => `<tr>
          <td><strong>${['🥇', '🥈', '🥉'][index] || index + 1}</strong></td>
          <td><strong>${escapeHtml(row.player_name)}</strong></td>
          <td>${escapeHtml(row.company)}</td>
          <td><strong>${fmtNumber(row.best_score)}/100</strong></td>
          <td>${fmtNumber(row.best_profit)} tỷ ₫</td>
          <td>${escapeHtml(row.best_title || '–')}</td>
          <td>${fmtNumber(row.quarters)}/6</td>
          <td>${fmtNumber(row.plays)}</td>
          <td>${fmtDateTime(row.last_play)}</td>
        </tr>`).join('')
      : '<tr><td colspan="9" class="bi-empty">Chưa có kết quả Hộ Chiếu Thương Hiệu hoặc bản xem thử không tải mục này.</td></tr>';
  }

  function traceSummary(trace) {
    const payload = trace?.trace_json && typeof trace.trace_json === 'object' ? trace.trace_json : {};
    const records = Array.isArray(payload.records) ? payload.records : [];
    const reflections = records.filter(record => String(record?.student_reflection || '').trim()).length;
    const last = records.at(-1) || {};
    const decision = last?.decision?.label || last?.decision?.choice || last?.decision || '–';
    return { records, reflections, decision: typeof decision === 'string' ? decision : '–' };
  }

  function renderLearningTraces() {
    const body = $('bi-trace-rows');
    if (!body) return;
    body.innerHTML = state.learningTraces.length
      ? state.learningTraces.map((row, index) => {
          const summary = traceSummary(row);
          return `<tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(row.team_alias || 'anonymous')}</strong></td>
            <td>${escapeHtml(row.session_id || '–')}</td>
            <td>${summary.records.length}</td>
            <td>${summary.reflections}</td>
            <td>${escapeHtml(summary.decision)}</td>
            <td>${fmtDateTime(row.retention_until)}</td>
            <td>${fmtDateTime(row.updated_at)}</td>
          </tr>`;
        }).join('')
      : '<tr><td colspan="8" class="bi-empty">Chưa có Decision Trace còn trong thời hạn lưu giữ hoặc bản xem thử không tải mục này.</td></tr>';
  }

  function renderSurveySummary() {
    const rows = state.surveys;
    const latest = new Map();
    rows.forEach(row => {
      const key = `${row.instrument || 'batnghiep'}|${row.student_code}|${row.phase}`;
      if (!latest.has(key) || String(row.created_at) > String(latest.get(key).created_at)) latest.set(key, row);
    });
    const unique = [...latest.values()];
    const pre = unique.filter(row => row.phase === 'pre');
    const post = unique.filter(row => row.phase === 'post');
    const postKeys = new Set(post.map(row => `${row.instrument || 'batnghiep'}|${row.student_code}`));
    const pairs = pre.filter(row => postKeys.has(`${row.instrument || 'batnghiep'}|${row.student_code}`));
    const startup = unique.filter(row => (row.instrument || 'batnghiep') === 'batnghiep').length;
    const international = unique.filter(row => row.instrument === 'quocte').length;

    const set = (id, value) => { const node = $(id); if (node) node.textContent = value; };
    set('bi-survey-total', unique.length);
    set('bi-survey-pairs', pairs.length);
    set('bi-survey-startup', startup);
    set('bi-survey-international', international);
  }

  function renderSummary() {
    const set = (id, value) => { const node = $(id); if (node) node.textContent = value; };
    set('bi-team-count', state.leaderboard.length);
    set('bi-submit-count', state.leaderboard.reduce((sum, row) => sum + Number(row.submissions || 0), 0));
    set('bi-bp-count', state.brandPassport.length);
    set('bi-trace-count', state.learningTraces.length);
  }

  async function refreshCore() {
    if (state.mode === 'demo') {
      const [leaderboardResult, feedResult] = await Promise.all([
        rpc('bizon_demo_leaderboard', {}, { anon: true }),
        rpc('bizon_demo_feed', { p_limit: 30 }, { anon: true })
      ]);
      state.leaderboard = Array.isArray(leaderboardResult) ? leaderboardResult : [];
      state.feed = Array.isArray(feedResult) ? feedResult : [];
      state.brandPassport = [];
      state.learningTraces = [];
    } else {
      if (!state.classCode || !state.session) return;
      const [leaderboardResult, feedResult] = await Promise.all([
        rpc('bizon_leaderboard_v2', { p_class_code: state.classCode }),
        rpc('bizon_feed_v2', { p_class_code: state.classCode, p_limit: 30 })
      ]);
      const [brandPassport, traces] = await Promise.all([
        safeRpc('bizon_bp_board_v2', { p_class_code: state.classCode }),
        safeRpc('bizon_bp_learning_traces_v2', { p_class_code: state.classCode })
      ]);
      state.leaderboard = Array.isArray(leaderboardResult) ? leaderboardResult : [];
      state.feed = Array.isArray(feedResult) ? feedResult : [];
      state.brandPassport = brandPassport;
      state.learningTraces = traces;
    }
    renderLeaderboard();
    renderFeed();
    renderBrandPassport();
    renderLearningTraces();
    renderSummary();
    const updated = $('bi-updated');
    if (updated) updated.textContent = `Cập nhật ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  async function refreshWithStatus({ quiet = false } = {}) {
    try {
      await refreshCore();
      if (!quiet) {
        const label = state.mode === 'demo' ? 'lớp mẫu DEMO-2026' : `lớp ${state.classCode}`;
        setStatus(`Đã nhận phản hồi cho ${label}.`, 'success');
      }
      return true;
    } catch (error) {
      setStatus(`Không tải được dữ liệu lớp (${error.message}). Hãy kiểm tra mạng và thử lại.`, 'error');
      return false;
    }
  }

  async function connectClass() {
    if (!state.session) {
      setStatus('Cần đăng nhập trước khi đăng ký lớp.', 'error');
      return;
    }
    const classCode = $('bi-class-code')?.value.trim().toUpperCase();
    if (!classCode) {
      setStatus('Cần nhập Mã lớp.', 'error');
      return;
    }
    setStatus(`Đang đăng ký lớp ${classCode}…`);
    try {
      await rpc('bizon_claim_class', { p_class_code: classCode });
    } catch (error) {
      setStatus(`Không đăng ký được mã lớp (${error.message}).`, 'error');
      return;
    }

    state.mode = 'auth';
    state.classCode = classCode;
    $('bi-class-label').textContent = classCode;
    setStatus(`Đang tải dữ liệu lớp ${classCode}…`);

    const connected = await refreshWithStatus();
    if (!connected) {
      $('bi-studio-content').classList.add('bi-hidden');
      clearInterval(state.timer);
      return;
    }

    try { localStorage.setItem('bizon-instructor-class', classCode); } catch (_) {}
    $('bi-studio-content').classList.remove('bi-hidden');
    clearInterval(state.timer);
    state.timer = setInterval(() => refreshWithStatus({ quiet: true }), 10000);
  }

  async function runDemo() {
    state.mode = 'demo';
    state.classCode = 'DEMO-2026';
    $('bi-class-label').textContent = 'DEMO-2026 (xem thử)';
    setStatus('Đang tải lớp mẫu…');
    const connected = await refreshWithStatus();
    if (!connected) return;
    $('bi-studio-content').classList.remove('bi-hidden');
    clearInterval(state.timer);
    state.timer = setInterval(() => refreshWithStatus({ quiet: true }), 10000);
  }

  async function loadSurveys() {
    if (state.mode === 'demo') {
      setStatus('Bản xem thử không có dữ liệu khảo sát. Đăng nhập và đăng ký lớp thật để dùng mục này.', 'error');
      return;
    }
    if (!state.classCode || !state.session) {
      setStatus('Hãy đăng nhập và đăng ký lớp trước khi phân tích khảo sát.', 'error');
      return;
    }
    setStatus('Đang tải dữ liệu khảo sát…');
    try {
      const rows = await rpc('bizon_survey_export_v2', { p_class_code: state.classCode });
      state.surveys = Array.isArray(rows) ? rows : [];
      renderSurveySummary();
      setStatus(`Đã tải ${state.surveys.length} phiếu khảo sát. Các chỉ số chỉ là mô tả nhanh, không phải kết luận nghiên cứu.`, 'success');
    } catch (error) {
      setStatus(`Không tải được khảo sát (${error.message}).`, 'error');
    }
  }

  function download(name, content, type) {
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(new Blob([content], { type }));
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }

  function exportLeaderboard() {
    const header = 'hang,doi,vong_cao_nhat,thi_phan_pct,loi_nhuan_rong,doanh_thu,so_du,luot_nop,nop_gan_nhat\n';
    const rows = state.leaderboard.map((row, index) => [
      index + 1,
      csvCell(row.team_name),
      row.best_round,
      row.share,
      row.net_profit,
      row.revenue,
      row.balance,
      row.submissions,
      csvCell(row.last_submit)
    ].join(',')).join('\n');
    download(`bizon-leaderboard-${state.classCode || 'class'}.csv`, `﻿${header}${rows}`, 'text/csv;charset=utf-8');
  }

  function exportTraces() {
    const payload = {
      schema: 'bizon-instructor-trace-export-v1',
      class_code: state.classCode,
      exported_at: new Date().toISOString(),
      ai_scoring: false,
      note: 'Reflections are exported for instructor review only and are not automatically graded by AI.',
      traces: state.learningTraces
    };
    download(`bizon-decision-traces-${state.classCode || 'class'}.json`, `${JSON.stringify(payload, null, 2)}\n`, 'application/json');
  }

  function exportSurveys() {
    if (!state.surveys.length) {
      setStatus('Chưa có dữ liệu khảo sát trong phiên. Bấm “Tải khảo sát” trước.', 'error');
      return;
    }
    const header = 'bo_cau_hoi,phieu,ma_sv,vai_tro,so_vong,diem_A,diem_gioi_thieu,thich_nhat,can_cai_thien,nop_luc\n';
    const rows = state.surveys.map(row => [
      csvCell(row.instrument || 'batnghiep'),
      csvCell(row.phase),
      csvCell(row.student_code),
      csvCell(row.role || ''),
      row.rounds_played || '',
      row.score_a ?? '',
      row.nps ?? '',
      csvCell(row.open_like),
      csvCell(row.open_improve),
      csvCell(row.created_at)
    ].join(',')).join('\n');
    download(`bizon-survey-${state.classCode || 'class'}.csv`, `﻿${header}${rows}`, 'text/csv;charset=utf-8');
  }

  function selectTab(button) {
    document.querySelectorAll('.bi-tab').forEach(tab => tab.setAttribute('aria-selected', String(tab === button)));
    document.querySelectorAll('[data-bi-panel]').forEach(panel => {
      panel.classList.toggle('bi-hidden', panel.dataset.biPanel !== button.dataset.biTab);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const restored = loadSession();
    if (restored) {
      state.session = restored;
      showClassBlock();
      try {
        const saved = localStorage.getItem('bizon-instructor-class');
        if (saved && $('bi-class-code')) $('bi-class-code').value = saved;
      } catch (_) {}
    }

    $('bi-signup')?.addEventListener('click', signUp);
    $('bi-signin')?.addEventListener('click', signIn);
    $('bi-connect')?.addEventListener('click', connectClass);
    $('bi-demo')?.addEventListener('click', runDemo);
    $('bi-refresh')?.addEventListener('click', () => refreshWithStatus());
    $('bi-load-survey')?.addEventListener('click', loadSurveys);
    $('bi-export-leaderboard')?.addEventListener('click', exportLeaderboard);
    $('bi-export-traces')?.addEventListener('click', exportTraces);
    $('bi-export-surveys')?.addEventListener('click', exportSurveys);
    document.querySelectorAll('.bi-tab').forEach(button => button.addEventListener('click', () => selectTab(button)));
  });

  window.addEventListener('pagehide', () => {
    clearInterval(state.timer);
    clearPasswordInput();
  });
})();
