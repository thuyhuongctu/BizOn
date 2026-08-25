/* BizOn Brand Passport Learning Layer v1
 *
 * Mục tiêu: thêm Coach–Critic–Reflection và Decision Trace mà KHÔNG sửa
 * deterministic engine trong brand-passport.html. Lớp này chạy ở trang bọc
 * cùng origin, chỉ đọc window.bpTest.state(), bọc các hàm UI công khai và lưu
 * audit trail cục bộ trong localStorage.
 */
(function () {
  'use strict';

  var VERSION = 'bp-learning-v1.0.0';
  var SCHEMA = 'bizon.learning.trace.v1';
  var STORAGE_PREFIX = 'bizon-bp-learning-v1:';
  var MAX_REFLECTION = 2000;
  var gameFrame = document.getElementById('bp-game');
  var panel = document.getElementById('lumina-panel');
  var statusEl = document.getElementById('learning-status');
  var coachEl = document.getElementById('coach-text');
  var criticEl = document.getElementById('critic-text');
  var reflectionEl = document.getElementById('reflection-text');
  var traceEl = document.getElementById('trace-list');
  var teamEl = document.getElementById('team-id');
  var panelToggle = document.getElementById('lumina-toggle');
  var closePanel = document.getElementById('lumina-close');
  var saveReflectionBtn = document.getElementById('save-reflection');
  var exportBtn = document.getElementById('export-trace');
  var clearBtn = document.getElementById('clear-trace');
  var gameWin = null;
  var pending = null;
  var lastPrompt = null;
  var audit = null;
  var storageKey = null;

  var PRIORITIES = [
    'Thu thập thông tin',
    'Tăng trưởng doanh thu',
    'Đầu tư thương hiệu',
    'Nâng cấp năng lực',
    'Củng cố nội lực'
  ];
  var BUDGETS = ['Thận trọng', 'Cân bằng', 'Tăng tốc'];
  var MODES = ['Nền tảng số', 'Xuất khẩu trực tiếp', 'Đối tác địa phương'];
  var MARKETS = ['Hải Lam', 'Bắc Phong', 'Kim Sa', 'Lục Đảo', 'Nhật Quang', 'Tân Cảng'];

  function uid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return 'bp-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function iso() { return new Date().toISOString(); }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function safeText(value, max) {
    return String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max || 500);
  }

  function seedFromUrl() {
    var params = new URLSearchParams(location.search);
    return params.get('seed') || 'auto';
  }

  function makeStorageKey(sessionId) {
    return STORAGE_PREFIX + seedFromUrl() + ':' + sessionId;
  }

  function baseAudit(sessionId) {
    return {
      schema_version: SCHEMA,
      learning_layer_version: VERSION,
      session_id: sessionId,
      team_id: safeText(teamEl && teamEl.value, 80) || 'anonymous',
      game_seed: seedFromUrl(),
      engine_source: 'brand-passport.html deterministic engine',
      ai_mode: 'rule-based instructional prototype; no LLM scoring',
      created_at: iso(),
      updated_at: iso(),
      records: []
    };
  }

  function loadAudit() {
    var sessionId = sessionStorage.getItem('bizon-bp-learning-session') || uid();
    sessionStorage.setItem('bizon-bp-learning-session', sessionId);
    storageKey = makeStorageKey(sessionId);
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey));
      audit = saved && saved.schema_version === SCHEMA ? saved : baseAudit(sessionId);
    } catch (e) {
      audit = baseAudit(sessionId);
    }
    if (teamEl) teamEl.value = audit.team_id === 'anonymous' ? '' : audit.team_id;
    persist();
  }

  function newSession() {
    var sessionId = uid();
    sessionStorage.setItem('bizon-bp-learning-session', sessionId);
    storageKey = makeStorageKey(sessionId);
    audit = baseAudit(sessionId);
    pending = null;
    reflectionEl.value = '';
    persist();
    renderTrace();
  }

  function persist() {
    if (!audit) return;
    audit.team_id = safeText(teamEl && teamEl.value, 80) || 'anonymous';
    audit.updated_at = iso();
    try { localStorage.setItem(storageKey, JSON.stringify(audit)); } catch (e) {}
  }

  function getState() {
    if (!gameWin || !gameWin.bpTest || typeof gameWin.bpTest.state !== 'function') return null;
    return clone(gameWin.bpTest.state());
  }

  function marketName(index) { return index == null ? null : (MARKETS[index] || ('Market ' + (index + 1))); }
  function modeName(index) { return index == null ? null : (MODES[index] || ('Mode ' + index)); }
  function priorityName(index) { return index == null ? null : (PRIORITIES[index] || ('Priority ' + index)); }
  function budgetName(index) { return index == null ? null : (BUDGETS[index] || ('Budget ' + index)); }

  function selectedDecision(state) {
    var sel = state && state.sel ? state.sel : {};
    return {
      priority_id: sel.prio,
      priority: priorityName(sel.prio),
      budget_id: sel.budget,
      budget: budgetName(sel.budget),
      entry_market_id: sel.enter,
      entry_market: marketName(sel.enter),
      entry_mode_id: sel.enterMode,
      entry_mode: modeName(sel.enterMode),
      intelligence_source_ids: Array.isArray(sel.intel) ? sel.intel.slice() : []
    };
  }

  function coachFor(state) {
    if (!state) return 'Lumina đang kết nối với ván chơi.';
    var sel = state.sel || {};
    if (state.phase !== 'dec') {
      return 'Quan sát dữ liệu của quý, xác định điều gì đã thay đổi và chuẩn bị một giả thuyết cho quyết định tiếp theo.';
    }
    if (sel.prio == null) {
      return 'Xác định mục tiêu quan trọng nhất của quý trước khi chọn hành động. Mục tiêu đó liên hệ thế nào với tiền mặt, uy tín, năng lực và chống chịu?';
    }
    if (sel.enter != null) {
      return 'So sánh ba đánh đổi của phương thức thâm nhập: mức kiểm soát, vốn cần thiết và khả năng tạo tính chính danh địa phương.';
    }
    return 'Giải thích vì sao quý này nên hoặc chưa nên vào thị trường mới. Đừng chỉ nhìn tăng trưởng; hãy kiểm tra thanh khoản và mức hiểu biết thị trường.';
  }

  function criticFor(state) {
    if (!state) return 'Chưa đủ dữ liệu để chất vấn quyết định.';
    var sel = state.sel || {};
    if (state.cash < 2) {
      return 'Phản biện: quyết định này có thể làm doanh nghiệp mất khả năng thanh toán trong hai quý liên tiếp không? Kế hoạch dự phòng là gì?';
    }
    if (sel.enter != null && state.know && state.know[sel.enter] < 35) {
      return 'Phản biện: bằng chứng thị trường hiện còn yếu. Điều gì có thể khiến nhận định về ' + marketName(sel.enter) + ' sai?';
    }
    if (sel.enterMode === 2) {
      return 'Phản biện: đối tác địa phương giúp tiếp cận mạng lưới, nhưng rủi ro phụ thuộc, hành vi cơ hội và kiểm soát thương hiệu đã được xử lý chưa?';
    }
    if (sel.enterMode === 1) {
      return 'Phản biện: xuất khẩu trực tiếp tăng kiểm soát nhưng đòi hỏi vốn và năng lực vận hành. Doanh nghiệp đã đủ sức hấp thụ chi phí chưa?';
    }
    if (sel.enterMode === 0) {
      return 'Phản biện: kênh số giảm vốn ban đầu, nhưng liệu sản phẩm có cần thích nghi địa phương hoặc chứng nhận mà nền tảng số không giải quyết được?';
    }
    return 'Phản biện: bằng chứng nào có thể bác bỏ lựa chọn hiện tại? Hãy nêu ít nhất một kịch bản bất lợi trước khi chốt.';
  }

  function updatePrompt() {
    var state = getState();
    lastPrompt = { coach: coachFor(state), critic: criticFor(state), state: state };
    coachEl.textContent = lastPrompt.coach;
    criticEl.textContent = lastPrompt.critic;
    if (statusEl) {
      statusEl.textContent = state ? ('Quý ' + (state.q + 1) + ' · ' + (state.phase || 'observe')) : 'Đang kết nối';
    }
  }

  function diff(before, after) {
    var keys = ['cash', 'profit', 'rep', 'capab', 'resil', 'susts', 'adapt'];
    var out = {};
    keys.forEach(function (key) {
      var a = Number(before && before[key] || 0);
      var b = Number(after && after[key] || 0);
      out[key] = Math.round((b - a) * 1000) / 1000;
    });
    return out;
  }

  function consequenceText(delta, after) {
    var labels = {
      cash: 'tiền mặt', profit: 'lợi nhuận tích lũy', rep: 'uy tín',
      capab: 'năng lực', resil: 'chống chịu', susts: 'bền vững', adapt: 'thích nghi'
    };
    var parts = [];
    Object.keys(labels).forEach(function (key) {
      var value = delta[key];
      if (Math.abs(value) >= 0.001) parts.push(labels[key] + ' ' + (value > 0 ? '+' : '') + value);
    });
    if (!parts.length) parts.push('không có thay đổi định lượng đáng kể trong các chỉ số được theo dõi');
    if (after && after.lowQ > 0) parts.push('cảnh báo thanh khoản: ' + after.lowQ + ' quý âm liên tiếp');
    return parts.join(' · ');
  }

  function explanationFor(record) {
    var d = record.decision;
    var parts = [];
    if (d.entry_market) {
      parts.push('Doanh nghiệp chọn ' + d.entry_mode + ' để vào ' + d.entry_market + ', tạo một cam kết có ảnh hưởng đến vốn, quyền kiểm soát và khả năng học từ thị trường.');
    } else {
      parts.push('Doanh nghiệp không mở thị trường mới trong quý này; kết quả chủ yếu phản ánh vị thế hiện có, ưu tiên và mức vận hành.');
    }
    if (d.intelligence_source_ids.length) {
      parts.push('Quyết định có sử dụng ' + d.intelligence_source_ids.length + ' nguồn tình báo; cần đánh giá độ tin cậy và thiên lệch của từng nguồn.');
    }
    parts.push('Các thay đổi được ghi nhận sau khi deterministic engine xử lý quyết định và biến cố của quý; Lumina chỉ diễn giải, không sửa kết quả.');
    return parts.join(' ');
  }

  function cloFor(record) {
    var clos = [];
    if (record.decision.entry_market) clos.push('CLO 1 — đánh giá mức hấp dẫn và mức hiểu biết thị trường');
    if (record.decision.entry_mode) clos.push('CLO 2 — lựa chọn phương thức thâm nhập phù hợp');
    if (record.decision.intelligence_source_ids.length) clos.push('CLO 3 — đánh giá độ tin cậy và thiên lệch của thông tin');
    clos.push('CLO 5 — nhận diện path dependence và hệ quả của chuỗi quyết định');
    clos.push('CLO 6 — ra quyết định đa tiêu chí và giải thích trade-off');
    return clos;
  }

  function currentReflection() {
    return safeText(reflectionEl && reflectionEl.value, MAX_REFLECTION);
  }

  function startPending() {
    var before = getState();
    if (!before) return;
    updatePrompt();
    pending = {
      record_id: uid(),
      round: before.q + 1,
      phase: 'awaiting_event',
      decision: selectedDecision(before),
      coach_prompt: lastPrompt.coach,
      critic_question: lastPrompt.critic,
      student_reflection: currentReflection(),
      outcome_before_engine: before,
      event_choice_index: null,
      event_choice_label: null,
      created_at: iso()
    };
  }

  function finalizePending(eventIndex, eventLabel) {
    if (!pending) return;
    var after = getState();
    if (!after) return;
    pending.event_choice_index = eventIndex;
    pending.event_choice_label = safeText(eventLabel, 300);
    pending.outcome_after_engine = after;
    pending.outcome_delta = diff(pending.outcome_before_engine, after);
    pending.consequence = consequenceText(pending.outcome_delta, after);
    pending.explanation = explanationFor(pending);
    pending.learning_outcomes = cloFor(pending);
    pending.engine_outcome_source = 'deterministic';
    pending.ai_changed_score = false;
    pending.audit_timestamp = iso();
    pending.phase = 'complete';
    audit.records.push(clone(pending));
    pending = null;
    reflectionEl.value = '';
    persist();
    renderTrace();
    updatePrompt();
  }

  function saveDraftReflection() {
    if (pending) pending.student_reflection = currentReflection();
    persist();
    saveReflectionBtn.textContent = '✓ Đã lưu phản tư';
    window.setTimeout(function () { saveReflectionBtn.textContent = 'Lưu phản tư'; }, 1200);
  }

  function escapeHtml(text) {
    return String(text == null ? '' : text).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function renderTrace() {
    if (!audit || !traceEl) return;
    if (!audit.records.length) {
      traceEl.innerHTML = '<p class="empty-trace">Chưa có quyết định hoàn tất. Sau khi chốt quý và xử lý biến cố, trace sẽ xuất hiện tại đây.</p>';
      return;
    }
    traceEl.innerHTML = audit.records.slice().reverse().map(function (r) {
      var decision = r.decision.entry_market
        ? r.decision.entry_market + ' · ' + r.decision.entry_mode
        : 'Không mở thị trường mới';
      return '<article class="trace-card">' +
        '<div class="trace-head"><strong>Quý ' + r.round + '</strong><span>' + escapeHtml(r.audit_timestamp.slice(0, 19).replace('T', ' ')) + '</span></div>' +
        '<p><b>Decision</b> ' + escapeHtml(r.decision.priority || 'Chưa ghi') + ' · ' + escapeHtml(r.decision.budget || 'Chưa ghi') + ' · ' + escapeHtml(decision) + '</p>' +
        '<p><b>Consequence</b> ' + escapeHtml(r.consequence) + '</p>' +
        '<p><b>Explanation</b> ' + escapeHtml(r.explanation) + '</p>' +
        '<p><b>Reflection</b> ' + escapeHtml(r.student_reflection || 'Người học chưa nhập phản tư.') + '</p>' +
        '<details><summary>Learning outcomes & audit</summary><ul>' + r.learning_outcomes.map(function (x) { return '<li>' + escapeHtml(x) + '</li>'; }).join('') + '</ul>' +
        '<code>' + escapeHtml(r.record_id) + '</code></details>' +
        '</article>';
    }).join('');
  }

  function wrap(name, wrapper) {
    var original = gameWin[name];
    if (typeof original !== 'function' || original.__bizonLearningWrapped) return;
    var wrapped = wrapper(original);
    wrapped.__bizonLearningWrapped = true;
    wrapped.__bizonLearningOriginal = original;
    gameWin[name] = wrapped;
  }

  function instrument() {
    wrap('bpStart', function (original) {
      return function () {
        newSession();
        var out = original.apply(this, arguments);
        window.setTimeout(updatePrompt, 50);
        return out;
      };
    });
    wrap('bpResume', function (original) {
      return function () {
        var out = original.apply(this, arguments);
        window.setTimeout(updatePrompt, 50);
        return out;
      };
    });
    wrap('bpToDecide', function (original) {
      return function () {
        var out = original.apply(this, arguments);
        window.setTimeout(updatePrompt, 20);
        return out;
      };
    });
    wrap('bpPick', function (original) {
      return function () {
        var out = original.apply(this, arguments);
        updatePrompt();
        return out;
      };
    });
    wrap('bpEnter', function (original) {
      return function () {
        var out = original.apply(this, arguments);
        updatePrompt();
        return out;
      };
    });
    wrap('bpIntel', function (original) {
      return function () {
        var before = getState();
        var out = original.apply(this, arguments);
        var after = getState();
        if (before && after && after.sel.intel.length > before.sel.intel.length) {
          persist();
          updatePrompt();
        }
        return out;
      };
    });
    wrap('bpCommit', function (original) {
      return function () {
        startPending();
        var out = original.apply(this, arguments);
        persist();
        updatePrompt();
        return out;
      };
    });
    wrap('bpEv', function (original) {
      return function (index) {
        var label = '';
        try {
          var btn = gameWin.document.querySelector('[onclick="bpEv(' + index + ')"]');
          label = btn ? btn.textContent.trim() : '';
        } catch (e) {}
        var out = original.apply(this, arguments);
        finalizePending(index, label);
        return out;
      };
    });
    wrap('bpNext', function (original) {
      return function () {
        var out = original.apply(this, arguments);
        window.setTimeout(updatePrompt, 20);
        return out;
      };
    });

    window.BizOnLearning = {
      version: VERSION,
      schema: SCHEMA,
      ready: true,
      getAudit: function () { return clone(audit); },
      getPending: function () { return pending ? clone(pending) : null; },
      getPrompt: function () { return lastPrompt ? clone(lastPrompt) : null; },
      getGameState: getState,
      saveReflection: saveDraftReflection,
      resetSession: newSession
    };

    statusEl.textContent = 'Đã kết nối · engine xác định được bảo vệ';
    updatePrompt();
    renderTrace();
    document.documentElement.classList.add('learning-ready');
  }

  function connect() {
    gameWin = gameFrame && gameFrame.contentWindow;
    if (!gameWin) return;
    var tries = 0;
    var timer = window.setInterval(function () {
      tries++;
      try {
        if (gameWin.bpTest && typeof gameWin.bpCommit === 'function' && typeof gameWin.bpEv === 'function') {
          window.clearInterval(timer);
          instrument();
        }
      } catch (e) {}
      if (tries > 300) {
        window.clearInterval(timer);
        statusEl.textContent = 'Không kết nối được với game';
      }
    }, 50);
  }

  function exportAudit() {
    persist();
    var blob = new Blob([JSON.stringify(audit, null, 2)], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'bizon-brand-passport-trace-' + audit.session_id + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function clearAudit() {
    if (!window.confirm('Xóa toàn bộ decision trace của phiên hiện tại?')) return;
    audit.records = [];
    pending = null;
    reflectionEl.value = '';
    persist();
    renderTrace();
  }

  function openPanel(open) {
    var shouldOpen = typeof open === 'boolean' ? open : !panel.classList.contains('open');
    panel.classList.toggle('open', shouldOpen);
    panel.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
    panelToggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    if (shouldOpen) window.setTimeout(function () { reflectionEl.focus(); }, 120);
  }

  function initFrameUrl() {
    var query = location.search || '';
    gameFrame.src = 'brand-passport.html' + query;
  }

  loadAudit();
  initFrameUrl();
  teamEl.addEventListener('change', persist);
  teamEl.addEventListener('input', persist);
  panelToggle.addEventListener('click', function () { openPanel(); });
  closePanel.addEventListener('click', function () { openPanel(false); });
  saveReflectionBtn.addEventListener('click', saveDraftReflection);
  exportBtn.addEventListener('click', exportAudit);
  clearBtn.addEventListener('click', clearAudit);
  gameFrame.addEventListener('load', connect);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') openPanel(false);
  });
  renderTrace();
})();
