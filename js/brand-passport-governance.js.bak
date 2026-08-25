/* BizOn Brand Passport Pilot Data Governance v1
 *
 * Default: local-only. Không có request ghi dữ liệu nào trước khi người học
 * chủ động nhập mã lớp, đánh dấu consent và bấm gửi.
 */
(function () {
  'use strict';

  var VERSION = 'bp-governance-v1.0.0';
  var CONSENT_VERSION = 'bp-learning-consent-v1';
  var RETENTION_DAYS = 180;
  var RECEIPT_PREFIX = 'bizon-bp-learning-receipt:';
  var frame = document.getElementById('learning-frame');
  var panel = document.getElementById('data-panel');
  var openBtn = document.getElementById('data-open');
  var closeBtn = document.getElementById('data-close');
  var classEl = document.getElementById('pilot-class-code');
  var consentEl = document.getElementById('pilot-consent');
  var submitBtn = document.getElementById('pilot-submit');
  var receiptBtn = document.getElementById('pilot-receipt');
  var deleteBtn = document.getElementById('pilot-delete');
  var manualIdEl = document.getElementById('manual-trace-id');
  var manualTokenEl = document.getElementById('manual-delete-token');
  var manualDeleteBtn = document.getElementById('manual-delete');
  var statusEl = document.getElementById('pilot-status');
  var modeEl = document.getElementById('storage-mode');
  var learningWin = null;
  var receipt = null;

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function iso() { return new Date().toISOString(); }
  function safeText(value, max) {
    return String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max || 500);
  }
  function uuid() {
    if (crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 3 | 8)).toString(16);
    });
  }
  function secretToken() {
    var bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
  }
  function cfg() {
    var c = window.BIZON_BACKEND || {};
    if (!c.enabled || !c.url || !c.anonKey) throw new Error('Máy chủ lớp học chưa được cấu hình.');
    return c;
  }
  function headers() {
    var c = cfg();
    return {
      'Content-Type': 'application/json',
      apikey: c.anonKey,
      Authorization: 'Bearer ' + c.anonKey
    };
  }
  function rpcUrl(name) { return cfg().url.replace(/\/$/, '') + '/rest/v1/rpc/' + name; }
  function setStatus(message, kind) {
    statusEl.textContent = message;
    statusEl.classList.toggle('ok', kind === 'ok');
    statusEl.classList.toggle('error', kind === 'error');
  }
  function openPanel(open) {
    var value = typeof open === 'boolean' ? open : !panel.classList.contains('open');
    panel.classList.toggle('open', value);
    panel.setAttribute('aria-hidden', value ? 'false' : 'true');
    if (value) window.setTimeout(function () { classEl.focus(); }, 100);
  }
  function getLearning() {
    if (!learningWin || !learningWin.BizOnLearning || !learningWin.BizOnLearning.ready) return null;
    return learningWin.BizOnLearning;
  }
  function getAudit() {
    var learning = getLearning();
    if (!learning) throw new Error('Learning Edition chưa sẵn sàng.');
    return learning.getAudit();
  }
  function receiptKey(sessionId) { return RECEIPT_PREFIX + sessionId; }
  function loadReceipt(audit) {
    try {
      var saved = JSON.parse(localStorage.getItem(receiptKey(audit.session_id)));
      receipt = saved && saved.trace_id && saved.delete_token ? saved : null;
    } catch (e) { receipt = null; }
    updateReceiptUi();
  }
  function saveReceipt(value) {
    receipt = value;
    localStorage.setItem(receiptKey(value.session_id), JSON.stringify(value));
    updateReceiptUi();
  }
  function clearReceipt() {
    if (receipt && receipt.session_id) localStorage.removeItem(receiptKey(receipt.session_id));
    receipt = null;
    updateReceiptUi();
  }
  function updateReceiptUi() {
    var has = Boolean(receipt && receipt.trace_id && receipt.delete_token);
    receiptBtn.disabled = !has;
    deleteBtn.disabled = !has;
    modeEl.textContent = has ? 'Đã gửi theo opt-in' : 'Chỉ lưu trên thiết bị';
    if (has) {
      manualIdEl.value = receipt.trace_id;
      manualTokenEl.value = receipt.delete_token;
    }
  }
  function normalizeClassCode(value) {
    var code = safeText(value, 40).toUpperCase();
    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) {
      throw new Error('Mã lớp cần 3–40 ký tự: chữ, số, gạch dưới hoặc gạch nối.');
    }
    return code;
  }
  function teamAlias(audit) {
    return safeText(audit.team_id, 80) || 'anonymous';
  }
  function governanceAudit(audit, consentedAt, classCode) {
    var copy = clone(audit);
    copy.data_governance = {
      storage_mode: 'server-opt-in',
      class_code: classCode,
      participant_identifier: 'team_alias_only',
      consent_version: CONSENT_VERSION,
      consented_at: consentedAt,
      retention_days: RETENTION_DAYS,
      right_to_delete: 'deletion receipt token',
      instructor_access: 'class code + instructor key',
      ai_scoring: false
    };
    return copy;
  }
  function getOrCreateReceipt(audit, classCode) {
    if (receipt && receipt.session_id === audit.session_id) return receipt;
    return {
      receipt_version: 'bizon.learning.deletion-receipt.v1',
      trace_id: uuid(),
      delete_token: secretToken(),
      session_id: audit.session_id,
      class_code: classCode,
      consent_version: CONSENT_VERSION,
      retention_days: RETENTION_DAYS,
      created_at: iso()
    };
  }

  async function submitTrace() {
    submitBtn.disabled = true;
    try {
      var audit = getAudit();
      if (!audit.records || !audit.records.length) throw new Error('Chưa có Decision Trace hoàn tất để gửi.');
      var classCode = normalizeClassCode(classEl.value);
      if (!consentEl.checked) throw new Error('Cần đánh dấu đồng ý tự nguyện trước khi gửi.');
      var consentedAt = iso();
      var nextReceipt = getOrCreateReceipt(audit, classCode);
      nextReceipt.class_code = classCode;
      var payload = {
        p_id: nextReceipt.trace_id,
        p_class_code: classCode,
        p_team_alias: teamAlias(audit),
        p_session_id: safeText(audit.session_id, 120),
        p_game_seed: safeText(audit.game_seed, 80),
        p_schema_version: safeText(audit.schema_version, 80),
        p_learning_layer_version: safeText(audit.learning_layer_version, 80),
        p_consent_version: CONSENT_VERSION,
        p_consented_at: consentedAt,
        p_trace_json: governanceAudit(audit, consentedAt, classCode),
        p_delete_token: nextReceipt.delete_token,
        p_client_ts: iso()
      };
      setStatus('Đang gửi bản ghi đã consent…');
      var response = await fetch(rpcUrl('bizon_submit_learning_trace'), {
        method: 'POST', headers: headers(), body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Máy chủ từ chối yêu cầu (HTTP ' + response.status + ').');
      var data = await response.json();
      var row = Array.isArray(data) ? data[0] : data;
      if (!row || !row.trace_id) throw new Error('Máy chủ không trả về biên nhận hợp lệ.');
      nextReceipt.trace_id = row.trace_id;
      nextReceipt.retention_until = row.retention_until || null;
      nextReceipt.stored_at = row.stored_at || iso();
      nextReceipt.last_submitted_at = iso();
      saveReceipt(nextReceipt);
      setStatus('Đã gửi tự nguyện. Hãy tải và giữ biên nhận xóa. Dữ liệu không được dùng để AI chấm điểm.', 'ok');
    } catch (error) {
      setStatus(error.message || 'Không gửi được dữ liệu.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  }

  function downloadReceipt() {
    if (!receipt) return;
    var blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'bizon-deletion-receipt-' + receipt.trace_id + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  async function deleteRemote(traceId, token, fromSavedReceipt) {
    traceId = safeText(traceId, 80);
    token = safeText(token, 180);
    if (!traceId || !token) throw new Error('Cần Trace ID và deletion token.');
    var response = await fetch(rpcUrl('bizon_delete_learning_trace'), {
      method: 'POST', headers: headers(), body: JSON.stringify({ p_trace_id: traceId, p_delete_token: token })
    });
    if (!response.ok) throw new Error('Không xóa được bản ghi (HTTP ' + response.status + ').');
    var deleted = await response.json();
    if (deleted !== true) throw new Error('Không tìm thấy bản ghi hoặc deletion token không đúng.');
    if (fromSavedReceipt) clearReceipt();
    setStatus('Đã xóa bản ghi trên máy chủ. Bản local trên thiết bị vẫn do bạn kiểm soát.', 'ok');
    return true;
  }

  async function deleteSaved() {
    deleteBtn.disabled = true;
    try {
      if (!receipt) throw new Error('Không có biên nhận trên thiết bị này.');
      await deleteRemote(receipt.trace_id, receipt.delete_token, true);
    } catch (error) { setStatus(error.message, 'error'); }
    finally { deleteBtn.disabled = false; updateReceiptUi(); }
  }
  async function deleteManual() {
    manualDeleteBtn.disabled = true;
    try { await deleteRemote(manualIdEl.value, manualTokenEl.value, false); }
    catch (error) { setStatus(error.message, 'error'); }
    finally { manualDeleteBtn.disabled = false; }
  }

  function connect() {
    learningWin = frame.contentWindow;
    var tries = 0;
    var timer = window.setInterval(function () {
      tries += 1;
      try {
        var learning = getLearning();
        if (learning) {
          window.clearInterval(timer);
          var audit = learning.getAudit();
          loadReceipt(audit);
          window.BizOnGovernance = {
            version: VERSION,
            consentVersion: CONSENT_VERSION,
            retentionDays: RETENTION_DAYS,
            ready: true,
            getAudit: function () { return governanceAudit(learning.getAudit(), null, classEl.value || null); },
            getReceipt: function () { return receipt ? clone(receipt) : null; },
            submit: submitTrace,
            deleteRemote: deleteRemote,
            open: openPanel
          };
        }
      } catch (e) {}
      if (tries > 400) {
        window.clearInterval(timer);
        setStatus('Không kết nối được với Learning Edition.', 'error');
      }
    }, 50);
  }
  function initFrame() { frame.src = 'brand-passport-learning.html' + (location.search || ''); }

  openBtn.addEventListener('click', function () { openPanel(true); });
  closeBtn.addEventListener('click', function () { openPanel(false); });
  submitBtn.addEventListener('click', submitTrace);
  receiptBtn.addEventListener('click', downloadReceipt);
  deleteBtn.addEventListener('click', deleteSaved);
  manualDeleteBtn.addEventListener('click', deleteManual);
  frame.addEventListener('load', connect);
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') openPanel(false); });
  initFrame();
})();
