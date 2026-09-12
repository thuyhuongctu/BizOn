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
    { key: 'session_tag', required: false, kind: 'string' },// nhãn phiên tự do (vd 'kt330-l01-b1', 'mekong-2609') — KHÔNG chứa danh tính
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
    { key: 'consent_version', required: true, kind: 'string' },// phiên bản phiếu đồng thuận — bắt buộc
    { key: 'consent_purposes', required: false, kind: 'array' }// tập mục đích được cấp phép cho bản ghi (research/product)
  ];
  var FIELD_KEYS = FIELDS.map(function (f) { return f.key; });

  // Hai mục đích TÁCH RIÊNG (bộ mở khóa hai điểm chặn, Phần B2): nghiên cứu học thuật
  // và cải tiến sản phẩm là hai bản chất khác nhau — gộp một ô là ép buộc gián tiếp.
  var PURPOSES = ['research', 'product'];

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
      if (f.kind === 'array' && !Array.isArray(v)) throw new Error(f.key + ' phải là mảng');
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

  // Đường ghi có CỔNG ĐỒNG THUẬN HAI MỤC ĐÍCH. Mặc định cả hai TẮT: record() bỏ qua.
  function DecisionLog(config) {
    config = config || {};
    // Mỗi mục đích một cờ + phiên bản riêng — TÁCH RIÊNG, không gộp (Phần B2).
    this.consent = {};
    PURPOSES.forEach(function (p) {
      var c = (config.consent && config.consent[p]) || {};
      this.consent[p] = { enabled: c.enabled === true, version: c.version || null };
    }, this);
    this.sink = typeof config.sink === 'function' ? config.sink : null; // kho bền cắm ngoài (không localStorage)
    this._buffer = [];
    this._withdrawn = {}; // team_id -> true
  }
  // Bật MỘT mục đích khi đã có phiếu đồng thuận + phê duyệt đạo đức (chỉ bật cờ, không viết lại).
  DecisionLog.prototype.enablePurpose = function (purpose, version) {
    if (PURPOSES.indexOf(purpose) < 0) throw new Error('Mục đích không hợp lệ: ' + purpose);
    if (!version) throw new Error('Bật mục đích phải kèm phiên bản phiếu đồng thuận');
    this.consent[purpose] = { enabled: true, version: version };
  };
  DecisionLog.prototype.activePurposes = function () {
    return PURPOSES.filter(function (p) { return this.consent[p].enabled; }, this);
  };
  // Rút lui: ngừng dùng dữ liệu đội trong các lần ghi/ước lượng SAU. KHÔNG gỡ được phần
  // đã gộp vào tham số cụm trước đó — giới hạn này phải nói thẳng trong phiếu (Phần B3).
  DecisionLog.prototype.withdraw = function (teamId) { this._withdrawn[teamId] = true; };
  DecisionLog.prototype.isWithdrawn = function (teamId) { return this._withdrawn[teamId] === true; };
  DecisionLog.prototype.record = function (fields, opts) {
    opts = opts || {};
    if (this.isWithdrawn(fields.team_id)) return { recorded: false, reason: 'withdrawn' };
    // Ghi cho GIAO của (mục đích đội đã đồng ý) ∩ (mục đích đang bật). Rỗng -> bỏ qua.
    var consented = opts.consentedPurposes || [];
    var active = this.activePurposes();
    var allowed = consented.filter(function (p) { return active.indexOf(p) >= 0; });
    if (!allowed.length) return { recorded: false, reason: 'no_active_consent' };
    var version = this.consent[allowed[0]].version;
    var rec = createRecord(Object.assign({}, fields, { consent_version: version, consent_purposes: allowed.slice() }), opts);
    this._buffer.push(rec);
    if (this.sink) this.sink(rec);
    return { recorded: true, record: rec };
  };
  // entries({purpose, excludeWithdrawn}) — lọc theo mục đích cấp phép và loại đội đã rút lui.
  DecisionLog.prototype.entries = function (opts) {
    opts = opts || {};
    var self = this;
    return this._buffer.filter(function (r) {
      if (opts.purpose && (!r.consent_purposes || r.consent_purposes.indexOf(opts.purpose) < 0)) return false;
      if (opts.excludeWithdrawn && self.isWithdrawn(r.team_id)) return false;
      return true;
    });
  };
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

  // Gom bản ghi theo mã lớp (cohort_id) — dữ liệu cho view tổng hợp của giảng viên.
  // Trả về { cohort_id: [record, ...] }. Không đụng danh tính (chỉ team_id đã băm).
  function groupByCohort(entries) {
    var out = {};
    (entries || []).forEach(function (r) {
      var k = r && r.cohort_id ? String(r.cohort_id) : '(khong-ma-lop)';
      (out[k] || (out[k] = [])).push(r);
    });
    return out;
  }
  // Lọc bản ghi của một phiên theo nhãn phiên (session_tag), vd 'kt330-l01-b1'.
  function filterBySessionTag(entries, tag) {
    return (entries || []).filter(function (r) { return r && r.session_tag === tag; });
  }
  DecisionLog.prototype.entriesByCohort = function (opts) { return groupByCohort(this.entries(opts)); };

  return Object.freeze({
    FIELDS: FIELDS,
    FIELD_KEYS: FIELD_KEYS,
    PURPOSES: PURPOSES,
    hashTeamId: hashTeamId,
    createRecord: createRecord,
    validate: validate,
    DecisionLog: DecisionLog,
    toCSV: toCSV,
    groupByCohort: groupByCohort,
    filterBySessionTag: filterBySessionTag
  });
});
