(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const cfg = () => window.BIZON_BACKEND || {};
  const state = {
    timer: null,
    classCode: '',
    instructorKey: '',
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

  const setStatus = (message, type = 'neutral') => {
    const node = $('bi-status');
    if (!node) return;
    node.textContent = message;
    node.dataset.state = type;
  };

  async function rpc(functionName, args) {
    const backend = cfg();
    if (!backend.url || !backend.anonKey) throw new Error('Backend chưa được cấu hình');
    const response = await fetch(`${backend.url.replace(/\/$/, '')}/rest/v1/rpc/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: backend.anonKey,
        Authorization: `Bearer ${backend.anonKey}`
      },
      body: JSON.stringify(args)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  const scopedArgs = extra => ({
    p_class_code: state.classCode,
    p_key: state.instructorKey,
    ...extra
  });

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
          <td>Vòng ${Number(row.best_round || 0)}/6</td>
          <td><strong>${fmtPercent(row.share)}</strong></td>
          <td>${fmtNumber(row.net_profit)} ₫</td>
          <td>${fmtNumber(row.revenue)} ₫</td>
          <td>${fmtNumber(row.balance)} ₫</td>
          <td>${fmtNumber(row.submissions)}</td>
          <td>${fmtDateTime(row.last_submit)}</td>
        </tr>`).join('')
      : '<tr><td colspan="9" class="bi-empty">Chưa có đội nào nộp kết quả hoặc khóa giảng viên chưa hợp lệ.</td></tr>';
  }

  function renderFeed() {
    const list = $('bi-feed');
    if (!list) return;
    list.innerHTML = state.feed.length
      ? state.feed.map(item => `<li><strong>${fmtDateTime(item.created_at)}</strong> · Đội <b>${escapeHtml(item.team_name)}</b> khóa vòng ${Number(item.round_number || 0)} · lợi nhuận ${fmtNumber(item.net_profit)} ₫ · thị phần ${fmtPercent(item.share)}</li>`).join('')
      : '<li>Chưa có lượt khóa vòng nào trong lớp này.</li>';
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
      : '<tr><td colspan="9" class="bi-empty">Chưa có kết quả Hộ Chiếu Thương Hiệu được nộp.</td></tr>';
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
      : '<tr><td colspan="8" class="bi-empty">Chưa có Decision Trace còn trong thời hạn lưu giữ.</td></tr>';
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
    if (!state.classCode || !state.instructorKey) return;
    const [leaderboard, feed, brandPassport, traces] = await Promise.all([
      safeRpc('bizon_leaderboard', scopedArgs()),
      safeRpc('bizon_feed', scopedArgs({ p_limit: 30 })),
      safeRpc('bizon_bp_board', scopedArgs()),
      safeRpc('bizon_bp_learning_traces', scopedArgs())
    ]);
    state.leaderboard = leaderboard;
    state.feed = feed;
    state.brandPassport = brandPassport;
    state.learningTraces = traces;
    renderLeaderboard();
    renderFeed();
    renderBrandPassport();
    renderLearningTraces();
    renderSummary();
    const updated = $('bi-updated');
    if (updated) updated.textContent = `Cập nhật ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  async function connect() {
    const classCode = $('bi-class-code')?.value.trim().toUpperCase();
    const instructorKey = $('bi-instructor-key')?.value.trim();
    if (!classCode || !instructorKey) {
      setStatus('Cần nhập Mã lớp và Khóa giảng viên.', 'error');
      return;
    }

    state.classCode = classCode;
    state.instructorKey = instructorKey;
    try { localStorage.setItem('bizon-instructor-class', classCode); } catch (_) {}
    $('bi-class-label').textContent = classCode;
    $('bi-studio-content').classList.remove('bi-hidden');
    setStatus(`Đang kết nối lớp ${classCode}…`);
    await refreshCore();
    setStatus(`Đang theo dõi lớp ${classCode}. Khóa giảng viên chỉ giữ trong bộ nhớ của phiên hiện tại.`, 'success');
    clearInterval(state.timer);
    state.timer = setInterval(refreshCore, 10000);
  }

  async function loadSurveys() {
    if (!state.classCode || !state.instructorKey) {
      setStatus('Hãy kết nối lớp trước khi phân tích khảo sát.', 'error');
      return;
    }
    setStatus('Đang tải dữ liệu khảo sát…');
    state.surveys = await safeRpc('bizon_survey_export', scopedArgs());
    renderSurveySummary();
    setStatus(`Đã tải ${state.surveys.length} phiếu khảo sát. Các chỉ số chỉ là mô tả nhanh, không phải kết luận nghiên cứu.`, 'success');
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
      `"${String(row.team_name || '').replace(/"/g, '""')}"`,
      row.best_round,
      row.share,
      row.net_profit,
      row.revenue,
      row.balance,
      row.submissions,
      row.last_submit
    ].join(',')).join('\n');
    download(`bizon-leaderboard-${state.classCode || 'class'}.csv`, `\ufeff${header}${rows}`, 'text/csv;charset=utf-8');
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
    const quote = value => `"${String(value ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    const header = 'bo_cau_hoi,phieu,ma_sv,vai_tro,so_vong,diem_A,diem_gioi_thieu,thich_nhat,can_cai_thien,nop_luc\n';
    const rows = state.surveys.map(row => [
      row.instrument || 'batnghiep', row.phase, row.student_code, row.role || '', row.rounds_played || '', row.score_a ?? '',
      row.nps ?? '', quote(row.open_like), quote(row.open_improve), row.created_at
    ].join(',')).join('\n');
    download(`bizon-survey-${state.classCode || 'class'}.csv`, `\ufeff${header}${rows}`, 'text/csv;charset=utf-8');
  }

  function selectTab(button) {
    document.querySelectorAll('.bi-tab').forEach(tab => tab.setAttribute('aria-selected', String(tab === button)));
    document.querySelectorAll('[data-bi-panel]').forEach(panel => {
      panel.classList.toggle('bi-hidden', panel.dataset.biPanel !== button.dataset.biTab);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    try {
      const saved = localStorage.getItem('bizon-instructor-class');
      if (saved && $('bi-class-code')) $('bi-class-code').value = saved;
    } catch (_) {}

    $('bi-connect')?.addEventListener('click', connect);
    $('bi-refresh')?.addEventListener('click', refreshCore);
    $('bi-load-survey')?.addEventListener('click', loadSurveys);
    $('bi-export-leaderboard')?.addEventListener('click', exportLeaderboard);
    $('bi-export-traces')?.addEventListener('click', exportTraces);
    $('bi-export-surveys')?.addEventListener('click', exportSurveys);
    document.querySelectorAll('.bi-tab').forEach(button => button.addEventListener('click', () => selectTab(button)));
  });

  window.addEventListener('pagehide', () => {
    clearInterval(state.timer);
    state.instructorKey = '';
    if ($('bi-instructor-key')) $('bi-instructor-key').value = '';
  });
})();
