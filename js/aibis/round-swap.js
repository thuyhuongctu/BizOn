/* BizOn AIBIS — Khung hoán vai + ảnh chụp đồng khóa (Bước 4, bản giao việc)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Ba việc (bản giao việc Bước 4 + hiệu chỉnh của chủ dự án):
 *  1. Chia lớp làm hai vai ở vòng 1 (home_outbound / host_inbound), HOÁN VAI ở vòng giữa.
 *     Vòng 1–2 dùng ngôn ngữ vị trí; chỉ đặt tên thuật ngữ từ vòng 3.
 *  2. Cuối mỗi vòng: ĐÓNG BĂNG trạng thái đồng khóa + gắn MÃ BĂM.
 *  3. HỢP ĐỒNG TÁI LẬP: chấm điểm luôn chạy TRÊN BẢN ĐÓNG BĂNG, không phải trạng thái
 *     sống. Chạy lại cùng gói kịch bản + cùng ảnh chụp + cùng chuỗi quyết định -> kết
 *     quả GIỐNG HỆT.
 *
 * Ràng buộc (chủ dự án): ảnh chụp đồng khóa PHẢI dùng đúng LƯỢC ĐỒ của Bước 1
 * (js/decision-log.js). Không dựng cấu trúc riêng rồi ghép lại — mỗi mục trong ảnh
 * chụp là một bản ghi nhật ký quyết định hợp lệ. (Ghi nhật ký thật vẫn tắt sau cờ
 * đồng thuận; ảnh chụp là dữ liệu vận hành trong phiên, không phải thu thập nghiên cứu.)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory({
      DL: require('../decision-log.js'),
      AP: require('./anchor-profiles.js'),
      RV: require('./country-role-view.js')
    });
  } else {
    root.BizOnRoundSwap = factory({
      DL: root.BizOnDecisionLog, AP: root.BizOnAnchorProfiles, RV: root.BizOnCountryRoleView
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (deps) {
  'use strict';
  var DL = deps.DL, AP = deps.AP, RV = deps.RV;
  var REF_PRICE = AP.REF_PRICE;   // 150
  var ELASTICITY = 1.8;           // độ co giãn giá (khớp engine game)

  // --- Hoán vai ------------------------------------------------------------
  // Chia đội thành hai vai ở vòng 1 (xác định theo chỉ số), hoán vai từ swapAtRound.
  function assignRoles(teamIds, opts) {
    opts = opts || {};
    var swapAtRound = opts.swapAtRound || 4;
    var roles = {};
    teamIds.forEach(function (id, i) {
      roles[id] = (i % 2 === 0) ? 'home_outbound' : 'host_inbound';
    });
    return { swapAtRound: swapAtRound, baseRoles: roles };
  }
  function flip(role) { return role === 'home_outbound' ? 'host_inbound' : 'home_outbound'; }
  // Vai của một đội ở một vòng: hoán sau swapAtRound.
  function roleForRound(assignment, teamId, round) {
    var base = assignment.baseRoles[teamId];
    if (base === undefined) return null;
    return round >= assignment.swapAtRound ? flip(base) : base;
  }
  // Nhãn vai theo vòng: dùng lại quy tắc ngôn ngữ vị trí (vòng 1–2) / thuật ngữ (vòng 3+)
  // từ country-role-view. home_outbound<->xuat_xu, host_inbound<->chu_nha.
  function roleLabel(role, round) {
    var r = role === 'home_outbound' ? 'xuat_xu' : 'chu_nha';
    return RV.roleLabel(r, round);
  }

  // --- Băm xác định (canonical JSON) --------------------------------------
  function canonical(v) {
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
    return '{' + Object.keys(v).sort().map(function (k) { return JSON.stringify(k) + ':' + canonical(v[k]); }).join(',') + '}';
  }
  function hash(v) {
    var s = canonical(v), h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0; }
    return 'fnv1a:' + ('00000000' + h.toString(16)).slice(-8);
  }

  function deepFreeze(o) {
    if (o && typeof o === 'object' && !Object.isFrozen(o)) {
      Object.keys(o).forEach(function (k) { deepFreeze(o[k]); });
      Object.freeze(o);
    }
    return o;
  }

  // --- Ảnh chụp đồng khóa (dùng đúng lược đồ Bước 1) -----------------------
  // records: mảng "fields" theo lược đồ nhật ký. Mỗi mục được validate qua DL.createRecord
  // (đúng lược đồ). Trả về ảnh chụp BẤT BIẾN + mã băm để tái lập.
  function freezeSnapshot(round, records, opts) {
    opts = opts || {};
    var entries = records.map(function (f) {
      var r = DL.createRecord(Object.assign({ round: round }, f), { now: opts.now });
      // Deep-clone: ảnh chụp phải ĐỘC LẬP hoàn toàn với trạng thái sống, nếu không việc
      // sửa state sống sẽ rò vào bản đóng băng (phá hợp đồng chấm-trên-bản-đóng-băng).
      return JSON.parse(JSON.stringify(r));
    });
    var snap = { round: round, scenario_pack: opts.scenarioPack || null, entries: entries };
    snap.snapshot_hash = hash(snap);
    return deepFreeze(snap); // chấm điểm sẽ chạy trên bản đóng băng này, không phải trạng thái sống
  }

  // --- Chấm trên bản đóng băng (hợp đồng tái lập) --------------------------
  function attr(price) { return Math.pow(REF_PRICE / price, ELASTICITY); }

  // Thị phần của một đội trong MỘT vòng, tính TRÊN ẢNH CHỤP (đối thủ = các mục trong
  // snapshot). Có thể lấp thêm hồ sơ neo để lớp nhỏ vẫn đối mặt thị trường ~size chủ thể.
  function settleRound(snapshot, teamDecision, opts) {
    opts = opts || {};
    var myAttr = attr(teamDecision.gia);
    var rivalAttr = 0;
    snapshot.entries.forEach(function (e) {
      if (opts.selfTeamId && e.team_id === opts.selfTeamId) return; // bỏ chính mình nếu có trong ảnh chụp
      rivalAttr += attr(e.decision.gia);
    });
    // Lấp thị trường bằng hồ sơ neo (xác định) để đủ ~size chủ thể — nối Bước 5.
    if (opts.fillTo && opts.fillTo > snapshot.entries.length) {
      var pop = AP.buildPopulation({ size: opts.fillTo - snapshot.entries.length, estimated: [] });
      pop.forEach(function (a) {
        var p = AP.PROFILES.find(function (x) { return x.id === a.profileId; });
        var rivalPrice = AP.respondPrice(p, teamDecision.gia); // phản ứng xác định với giá của đội
        rivalAttr += attr(rivalPrice);
      });
    }
    var share = myAttr / (myAttr + rivalAttr);
    return { round: snapshot.round, snapshot_hash: snapshot.snapshot_hash, share: share };
  }

  // Chạy lại trọn một lượt: cùng chuỗi ảnh chụp + cùng chuỗi quyết định -> KẾT QUẢ GIỐNG HỆT.
  function replay(snapshots, decisionSeq, opts) {
    return snapshots.map(function (snap, i) { return settleRound(snap, decisionSeq[i], opts); });
  }

  return Object.freeze({
    REF_PRICE: REF_PRICE,
    assignRoles: assignRoles,
    roleForRound: roleForRound,
    roleLabel: roleLabel,
    hash: hash,
    canonical: canonical,
    freezeSnapshot: freezeSnapshot,
    settleRound: settleRound,
    replay: replay
  });
});
