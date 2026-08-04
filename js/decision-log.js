/* BizOn — Nhật ký quyết định: LƯỢC ĐỒ + ĐƯỜNG GHI có cổng đồng thuận (Bước 1)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Vì sao tồn tại (bản giao việc Bước 1 + hiệu chỉnh của chủ dự án):
 *  - Chưa được THU THẬP dữ liệu người học (chờ cơ sở pháp lý + phiếu đồng thuận),
 *    nhưng ĐƯỢC xây HẠ TẦNG GHI ngay: định nghĩa lược đồ, dựng đường ghi, và KHÓA
 *    việc ghi thật sau một CỜ ĐỒNG THUẬN đang TẮT. Khi phiếu đồng thuận xong thì
 *    bật cờ — không viết lại từ đầu.
 *  - Lược đồ ở đây là NGUỒN DÙNG CHUNG: Instructor Studio (Bước 3) đọc đúng lược đồ
 *    này ("quyết định của từng đội theo vòng"), không dựng cấu trúc tạm rồi ghép lại.
 *
 * Ràng buộc cứng (bản giao việc Mục 2):
 *  - KHÔNG lưu danh tính: team_id phải là bản BĂM, không phải tên/email thật.
 *  - KHÔNG dùng localStorage cho dữ liệu cần bền (đã có hướng lưu trữ riêng). Module
 *    này KHÔNG tự chọn kho bền; nó nhận một `sink` cắm ngoài. Khi cờ đồng thuận tắt,
 *    KHÔNG ghi đi đâu cả (discard) — không sink, không bộ đệm bền.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnDecisionLog = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // LƯỢC ĐỒ — hợp đồng dữ liệu duy nhất. Instructor Studio và đường ống ước lượng
  // đều đọc từ đây. Giữ snake_case đúng bản giao việc.
  var FIELDS = [
    { key: 'decision_id', required: true, kind: 'id' },
    { key: 'session_id', required: true, kind: 'id' },
    { key: 'cohort_id', required: true, kind: 'string' },   // ví dụ '2026A-KT330H' (mã lớp, không phải danh tính cá nhân)
    { key: 'team_id', required: true, kind: 'hashed' },      // BẮT BUỘC băm — không lưu danh tính
    { key: 'pillar', required: true, kind: 'enum', values: ['bat-nghiep', 'ho-chieu'] },
    { key: 'role', required: true, kind: 'enum', values: ['home_outbound', 'host_inbound'] },
    { key: 'round', required: true, kind: 'int' },
    { key: 'scenario_pack', required: true, kind: 'string' },
    { key: 'snapshot_hash', required: true, kind: 'string' },// mã băm ảnh chụp đồng khóa (Bước 4) — để tái lập
    { key: 'decision', required: true, kind: 'object' },
    { key: 'state_before', required: false, kind: 'object' },
    { key: 'result_after', required: false, kind: 'object' },
    { key: 'timestamp', required: true, kind: 'iso' },
    { key: 'consent_version', required: true, kind: 'string' }// phiên bản phiếu đồng thuận — bắt buộc
  ];
  var FIELD_KEYS = FIELDS.map(function (f) { return f.key; });

  // Băm định danh đội — placeholder FNV-1a (xác định, đồng bộ, đa nền). SẢN XUẤT nên
  // thay bằng SHA-256 kèm salt. Điểm cốt lõi: log KHÔNG bao giờ chứa tên/email thật.
  function hashTeamId(raw) {
    var s = String(raw), h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0; }
    return 'h_' + ('00000000' + h.toString(16)).slice(-8);
  }

  // Dấu hiệu danh tính thô (tên có dấu cách, email…) — để CHẶN lọt PII vào log.
  function looksLikePII(v) {
    if (typeof v !== 'string') return false;
    if (v.indexOf('@') >= 0) return true;                 // email
    if (/\s/.test(v.trim()) && !/^h_/.test(v)) return true; // tên nhiều từ (không phải mã băm h_)
    return false;
  }

  function validate(record) {
    FIELDS.forEach(function (f) {
      var v = record[f.key];
      if (f.required && (v === undefined || v === null || v === '')) {
        throw new Error('Thiếu trường bắt buộc: ' + f.key);
      }
      if (v === undefined || v === null) return;
      if (f.kind === 'enum' && f.values.indexOf(v) < 0) throw new Error('Giá trị không hợp lệ cho ' + f.key + ': ' + v);
      if (f.kind === 'int' && !Number.isInteger(v)) throw new Error(f.key + ' phải là số nguyên');
      if (f.kind === 'hashed' && looksLikePII(v)) throw new Error('team_id phải là bản băm, không được chứa danh tính thật');
    });
    // Chặn PII lọt vào mọi trường chuỗi cấp cao.
    FIELD_KEYS.forEach(function (k) { if (looksLikePII(record[k])) throw new Error('Phát hiện dữ liệu định danh ở trường ' + k); });
    return record;
  }

  // Dựng một bản ghi hợp lệ theo lược đồ. `now` truyền vào để xác định/kiểm thử được.
  function createRecord(fields, opts) {
    opts = opts || {};
    var rec = {};
    FIELD_KEYS.forEach(function (k) { if (fields[k] !== undefined) rec[k] = fields[k]; });
    if (!rec.timestamp && opts.now) rec.timestamp = opts.now;
    return validate(rec);
  }

  // Đường ghi có CỔNG ĐỒNG THUẬN. Mặc định TẮT: record() bỏ qua, không giữ gì.
  function DecisionLog(config) {
    config = config || {};
    this.consentEnabled = config.consentEnabled === true; // MẶC ĐỊNH TẮT
    this.consentVersion = config.consentVersion || null;
    this.sink = typeof config.sink === 'function' ? config.sink : null; // kho bền cắm ngoài (không localStorage)
    this._buffer = [];
  }
  // Bật ghi khi đã có phiếu đồng thuận (không viết lại code — chỉ bật cờ + đặt phiên bản).
  DecisionLog.prototype.enableConsent = function (version) {
    if (!version) throw new Error('Bật đồng thuận phải kèm phiên bản phiếu (consent_version)');
    this.consentEnabled = true; this.consentVersion = version;
  };
  DecisionLog.prototype.record = function (fields, opts) {
    if (!this.consentEnabled) return { recorded: false, reason: 'consent_off' }; // discard — không giữ gì
    opts = opts || {};
    var rec = createRecord(Object.assign({}, fields, { consent_version: this.consentVersion }), opts);
    this._buffer.push(rec);
    if (this.sink) this.sink(rec); // kho bền tương lai; nay mặc định null
    return { recorded: true, record: rec };
  };
  DecisionLog.prototype.entries = function () { return this._buffer.slice(); };
  DecisionLog.prototype.clear = function () { this._buffer = []; };

  // Xuất CSV — cột theo lược đồ, KHÔNG chứa danh tính (chỉ team_id đã băm).
  function toCSV(entries) {
    var cols = FIELD_KEYS;
    var esc = function (v) {
      if (v === undefined || v === null) return '';
      var s = typeof v === 'object' ? JSON.stringify(v) : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    var head = cols.join(',');
    var rows = entries.map(function (r) { return cols.map(function (c) { return esc(r[c]); }).join(','); });
    return [head].concat(rows).join('\n');
  }

  return Object.freeze({
    FIELDS: FIELDS,
    FIELD_KEYS: FIELD_KEYS,
    hashTeamId: hashTeamId,
    createRecord: createRecord,
    validate: validate,
    DecisionLog: DecisionLog,
    toCSV: toCSV
  });
});
