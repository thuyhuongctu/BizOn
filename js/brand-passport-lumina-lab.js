(() => {
  'use strict';

  const STORAGE_KEY = 'bizon-bp-lumina-trace-v1';
  const frame = document.querySelector('#bp-frame');
  const status = document.querySelector('#lab-status');
  const coachBox = document.querySelector('#coach-box');
  const criticBox = document.querySelector('#critic-box');
  const reflection = document.querySelector('#reflection');
  const saveReflectionButton = document.querySelector('#save-reflection');
  const exportButton = document.querySelector('#export-trace');
  const clearButton = document.querySelector('#clear-trace');
  const timeline = document.querySelector('#trace-timeline');
  const traceCount = document.querySelector('#trace-count');

  let previousSnapshot = null;
  let trace = loadTrace();

  function now() {
    return new Date().toISOString();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadTrace() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trace));
    } catch (_) {
      status.textContent = 'Không thể lưu audit trail trong trình duyệt này.';
    }
  }

  function safeState() {
    try {
      const api = frame.contentWindow && frame.contentWindow.bpTest;
      if (!api || typeof api.state !== 'function') return null;
      return clone(api.state());
    } catch (_) {
      return null;
    }
  }

  function phaseLabel(phase) {
    return ({ obs: 'Quan sát', dec: 'Quyết định', evt: 'Sự kiện' })[phase] || phase || 'Khởi tạo';
  }

  function stateKey(state) {
    if (!state) return '';
    return JSON.stringify({
      q: state.q,
      phase: state.phase,
      cash: state.cash,
      rep: state.rep,
      capab: state.capab,
      resil: state.resil,
      profit: state.profit,
      entered: state.entered,
      know: state.know,
      sel: state.sel,
      flags: state.flags,
    });
  }

  function diff(before, after) {
    if (!before) return { type: 'session_start', changed: ['session'] };
    const changed = [];
    ['q', 'phase', 'cash', 'rep', 'capab', 'resil', 'profit', 'adapt', 'susts', 'lowQ'].forEach((key) => {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) changed.push(key);
    });
    ['entered', 'know', 'qin', 'sel', 'flags'].forEach((key) => {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) changed.push(key);
    });
    let type = 'state_change';
    if (before.phase !== after.phase) type = `phase_${after.phase || 'unknown'}`;
    if (before.q !== after.q) type = 'quarter_advanced';
    if (JSON.stringify(before.sel) !== JSON.stringify(after.sel)) type = 'decision_selection';
    return { type, changed };
  }

  function recommendation(state) {
    if (!state) {
      return {
        coach: 'Mở hoặc bắt đầu Brand Passport để Lumina quan sát trạng thái mô phỏng.',
        critic: 'Lumina không đưa đáp án và không thay đổi điểm số. Engine BizOn vẫn là nguồn kết quả duy nhất.',
      };
    }

    const quarter = Number(state.q || 0) + 1;
    const selectedMarket = state.sel && Number.isInteger(state.sel.enter) ? state.sel.enter : null;
    const selectedMode = state.sel && Number.isInteger(state.sel.enterMode) ? state.sel.enterMode : null;

    if (state.phase === 'obs') {
      const weakestKnowledge = Math.min(...state.know);
      return {
        coach: `Quý ${quarter}: xác định một khoảng trống thông tin quan trọng trước khi mua nguồn tin. Mức tri thức thấp nhất hiện là ${weakestKnowledge}/100.`,
        critic: 'Nguồn tin nào có thể thiên lệch? Bạn sẽ kiểm tra chéo tín hiệu đó bằng dữ liệu hay hành vi thị trường nào?',
      };
    }

    if (state.phase === 'dec') {
      const marketText = selectedMarket === null ? 'chưa chọn thị trường mới' : `đã chọn thị trường số ${selectedMarket + 1}`;
      const modeText = selectedMode === null ? 'chưa chọn entry mode' : `entry mode số ${selectedMode + 1}`;
      return {
        coach: `Bạn ${marketText} và ${modeText}. Hãy nêu mục tiêu, nguồn lực cần dùng và chỉ báo cho thấy quyết định này thành công.`,
        critic: 'Trade-off lớn nhất là gì: kiểm soát, tốc độ, vốn, tri thức thị trường hay rủi ro đối tác? Vì sao bạn chấp nhận đánh đổi đó?',
      };
    }

    if (state.phase === 'evt') {
      return {
        coach: `Trước khi phản ứng với sự kiện quý ${quarter}, tách tác động ngắn hạn khỏi năng lực dài hạn của doanh nghiệp.`,
        critic: 'Phương án bạn chọn có giải quyết nguyên nhân gốc hay chỉ giảm triệu chứng? Điều gì có thể khiến lựa chọn này phản tác dụng?',
      };
    }

    return {
      coach: 'So sánh quyết định gần nhất với kết quả thực tế và xác định giả định nào đã đúng hoặc sai.',
      critic: 'Bạn có đang diễn giải kết quả tốt là do chiến lược, trong khi nó có thể đến từ điều kiện thị trường hoặc ngẫu nhiên của sự kiện?',
    };
  }

  function appendTrace(state) {
    const delta = diff(previousSnapshot, state);
    const entry = {
      trace_version: '1.0.0',
      session_id: getSessionId(),
      audit_timestamp: now(),
      quarter: Number(state.q || 0) + 1,
      phase: state.phase || null,
      event_type: delta.type,
      changed_fields: delta.changed,
      deterministic_state: clone(state),
      ai_role: 'coach_critic_reflection',
      ai_changes_score: false,
      human_decision_required: true,
      reflection: null,
    };
    trace.push(entry);
    previousSnapshot = clone(state);
    persist();
    renderTimeline();
  }

  function getSessionId() {
    let sessionId = sessionStorage.getItem('bizon-bp-lumina-session');
    if (!sessionId) {
      sessionId = `BP-${Date.now().toString(36).toUpperCase()}`;
      sessionStorage.setItem('bizon-bp-lumina-session', sessionId);
    }
    return sessionId;
  }

  function renderTimeline() {
    traceCount.textContent = String(trace.length);
    if (!trace.length) {
      timeline.innerHTML = '<p class="empty">Chưa có dấu vết quyết định. Bắt đầu game trong khung bên trái.</p>';
      return;
    }
    timeline.innerHTML = trace.slice().reverse().map((item) => {
      const fields = item.changed_fields && item.changed_fields.length ? item.changed_fields.join(', ') : '—';
      const reflectionText = item.reflection ? `<blockquote>${escapeHtml(item.reflection)}</blockquote>` : '';
      return `<article class="trace-item">
        <div class="trace-head"><strong>Quý ${item.quarter} · ${phaseLabel(item.phase)}</strong><time>${new Date(item.audit_timestamp).toLocaleTimeString('vi-VN')}</time></div>
        <p><b>${escapeHtml(item.event_type)}</b> · thay đổi: ${escapeHtml(fields)}</p>
        ${reflectionText}
      </article>`;
    }).join('');
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function updateCoach(state) {
    const guidance = recommendation(state);
    coachBox.textContent = guidance.coach;
    criticBox.textContent = guidance.critic;
  }

  function poll() {
    const state = safeState();
    if (!state) {
      status.textContent = 'Đang chờ Brand Passport khởi tạo…';
      updateCoach(null);
      return;
    }
    status.textContent = `Đã kết nối · Quý ${Number(state.q || 0) + 1} · ${phaseLabel(state.phase)}`;
    updateCoach(state);
    const key = stateKey(state);
    const previousKey = stateKey(previousSnapshot);
    if (key && key !== previousKey) appendTrace(state);
  }

  function saveReflection() {
    const value = reflection.value.trim();
    if (!value) {
      status.textContent = 'Nhập phản tư trước khi lưu.';
      return;
    }
    const state = safeState();
    const entry = {
      trace_version: '1.0.0',
      session_id: getSessionId(),
      audit_timestamp: now(),
      quarter: state ? Number(state.q || 0) + 1 : null,
      phase: state ? state.phase : null,
      event_type: 'human_reflection',
      changed_fields: [],
      deterministic_state: state,
      ai_role: 'reflection_prompt',
      ai_changes_score: false,
      human_decision_required: true,
      reflection: value,
    };
    trace.push(entry);
    persist();
    reflection.value = '';
    renderTimeline();
    status.textContent = 'Đã lưu phản tư vào audit trail.';
  }

  function exportTrace() {
    const payload = {
      schema: 'bizon.brand-passport.decision-trace.v1',
      exported_at: now(),
      governance: {
        deterministic_engine_is_authoritative: true,
        ai_may_change_score: false,
        human_retains_decision_authority: true,
      },
      entries: trace,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `brand-passport-trace-${getSessionId()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function clearTrace() {
    if (!window.confirm('Xóa toàn bộ audit trail cục bộ của phiên Lab?')) return;
    trace = [];
    previousSnapshot = null;
    localStorage.removeItem(STORAGE_KEY);
    renderTimeline();
    status.textContent = 'Đã xóa audit trail cục bộ.';
  }

  frame.addEventListener('load', () => {
    status.textContent = 'Brand Passport đã tải. Hãy bắt đầu hoặc tiếp tục game.';
    window.setTimeout(poll, 500);
  });
  saveReflectionButton.addEventListener('click', saveReflection);
  exportButton.addEventListener('click', exportTrace);
  clearButton.addEventListener('click', clearTrace);

  renderTimeline();
  window.setInterval(poll, 900);
})();
