/* BizOn — Sổ điểm giảng viên: đọc LƯỢC ĐỒ Bước 1 + chấm trên ẢNH CHỤP Bước 4 (Bước 3)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Vì sao tồn tại (bản giao việc Bước 3 + hiệu chỉnh của chủ dự án):
 *  - Instructor Studio PHẢI đọc ĐÚNG lược đồ nhật ký quyết định (js/decision-log.js) —
 *    "quyết định của từng đội theo vòng" — và chấm TRÊN BẢN ĐÓNG BĂNG (js/aibis/round-swap.js),
 *    KHÔNG dựng cấu trúc tạm rồi ghép lại. Module này là hợp đồng đó ở dạng THUẦN, kiểm thử được.
 *  - KHÔNG tự chấm điểm rubric: rubric chấm LẬP LUẬN của người học. Module chỉ cung cấp CHỈ SỐ
 *    NEO tái lập (thị phần tính trên ảnh chụp đóng băng) làm BẰNG CHỨNG để giảng viên chấm —
 *    đúng nguyên tắc "không dùng AI tự chấm" và "rubric chấm lập luận, không chấm kết quả".
 *  - Cổng đồng thuận: chấm điểm là hoạt động dạy học hợp pháp nên mặc định gom mọi bản ghi;
 *    khi dùng cho MỤC ĐÍCH nghiên cứu/sản phẩm thì lọc theo mục đích cấp phép và loại đội rút lui.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory({ DL: require('./decision-log.js'), RS: require('./aibis/round-swap.js') });
  } else {
    root.BizOnInstructorGradebook = factory({ DL: root.BizOnDecisionLog, RS: root.BizOnRoundSwap });
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (deps) {
  'use strict';
  var RS = deps.RS;

  // Lập chỉ mục ảnh chụp theo vòng để tra nhanh.
  function indexSnapshots(snapshots) {
    var byRound = {};
    (snapshots || []).forEach(function (s) { if (s && s.round != null) byRound[s.round] = s; });
    return byRound;
  }

  // Cổng đồng thuận: khi opts.purpose đặt, chỉ nhận bản ghi được cấp phép cho mục đích đó;
  // loại đội đã rút lui (qua danh sách opts.withdrawn hoặc hàm opts.isWithdrawn).
  function allow(entry, opts) {
    if (opts.purpose) {
      if (!Array.isArray(entry.consent_purposes) || entry.consent_purposes.indexOf(opts.purpose) < 0) return false;
    }
    if (typeof opts.isWithdrawn === 'function' && opts.isWithdrawn(entry.team_id)) return false;
    if (Array.isArray(opts.withdrawn) && opts.withdrawn.indexOf(entry.team_id) >= 0) return false;
    return true;
  }

  // Sổ điểm: gom quyết định theo ĐỘI -> VÒNG; mỗi vòng tính chỉ số neo (thị phần) TÁI LẬP
  // bằng cách chấm quyết định của đội TRÊN ẢNH CHỤP ĐÓNG BĂNG của vòng đó. Vòng không có
  // ảnh chụp thì không chấm được — ghi vào meta.skipped_no_snapshot, không ném lỗi.
  function buildGradebook(entries, snapshots, opts) {
    opts = opts || {};
    var byRound = indexSnapshots(snapshots);
    var teams = {};
    var skipped = 0;
    (entries || []).forEach(function (e) {
      if (!allow(e, opts)) return;
      var snap = byRound[e.round];
      if (!snap) { skipped++; return; }
      var t = teams[e.team_id] || (teams[e.team_id] = { team_id: e.team_id, rounds: [] });
      var settled = RS.settleRound(snap, e.decision, { selfTeamId: e.team_id });
      t.rounds.push({
        round: e.round,
        decision: e.decision,
        snapshot_hash: snap.snapshot_hash, // đóng dấu ảnh chụp -> tái lập, truy được
        share: settled.share,
        consent_purposes: Array.isArray(e.consent_purposes) ? e.consent_purposes.slice() : []
      });
    });
    var teamList = Object.keys(teams).map(function (id) {
      teams[id].rounds.sort(function (a, b) { return a.round - b.round; });
      return teams[id];
    }).sort(function (a, b) { return a.team_id < b.team_id ? -1 : (a.team_id > b.team_id ? 1 : 0); });
    return {
      graded_on: 'frozen_snapshot', // hợp đồng: chấm trên bản đóng băng, không phải trạng thái sống
      auto_rubric: false,           // KHÔNG tự chấm rubric — chỉ cấp chỉ số neo làm bằng chứng
      purpose: opts.purpose || null,
      skipped_no_snapshot: skipped,
      teams: teamList
    };
  }

  // Xuất CSV sổ điểm — cột chỉ số neo theo đội/vòng; team_id đã băm, KHÔNG danh tính.
  function toGradebookCSV(gradebook) {
    var cols = ['team_id', 'round', 'snapshot_hash', 'share', 'gia', 'consent_purposes'];
    var esc = function (v) {
      if (v === undefined || v === null) return '';
      var s = typeof v === 'object' ? JSON.stringify(v) : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    var rows = [];
    (gradebook.teams || []).forEach(function (t) {
      t.rounds.forEach(function (r) {
        rows.push([t.team_id, r.round, r.snapshot_hash, r.share, (r.decision && r.decision.gia), (r.consent_purposes || []).join('|')].map(esc).join(','));
      });
    });
    return [cols.join(',')].concat(rows).join('\n');
  }

  return Object.freeze({
    buildGradebook: buildGradebook,
    toGradebookCSV: toGradebookCSV
  });
});
