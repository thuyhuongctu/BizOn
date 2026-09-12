'use strict';
const assert = require('node:assert/strict');
const RS = require('../js/aibis/round-swap.js');
const DL = require('../js/decision-log.js');

// --- Hoán vai ---
const teams = ['h_a', 'h_b', 'h_c', 'h_d'];
const asg = RS.assignRoles(teams, { swapAtRound: 4 });
// Chia hai vai ở vòng 1.
assert.equal(RS.roleForRound(asg, 'h_a', 1), 'home_outbound');
assert.equal(RS.roleForRound(asg, 'h_b', 1), 'host_inbound');
// Hoán vai từ vòng giữa (>=4).
assert.equal(RS.roleForRound(asg, 'h_a', 4), 'host_inbound', 'vai bị hoán ở vòng giữa');
assert.equal(RS.roleForRound(asg, 'h_b', 4), 'home_outbound');
// Ngôn ngữ vị trí vòng 1–2, thuật ngữ từ vòng 3.
assert.equal(RS.roleLabel('home_outbound', 1).vi, 'Nước của bạn');
assert.equal(RS.roleLabel('host_inbound', 2).vi, 'Nước bạn đang vào');
assert.equal(RS.roleLabel('home_outbound', 3).vi, 'Nước xuất xứ');

// --- Ảnh chụp dùng ĐÚNG lược đồ Bước 1 ---
function rec(over) {
  return Object.assign({
    decision_id: 'd', session_id: 's', cohort_id: '2026A', team_id: 'h_x',
    pillar: 'ho-chieu', role: 'host_inbound', scenario_pack: 'vn-out-jp-2026a',
    snapshot_hash: 'pending', decision: { gia: 150, san_luong: 1000 },
    timestamp: '2026-08-04T00:00:00Z', consent_version: 'v1'
  }, over || {});
}
const liveRecords = [rec({ team_id: 'h_p', decision: { gia: 140, san_luong: 1100 } }),
                     rec({ team_id: 'h_q', decision: { gia: 170, san_luong: 900 } })];
const snap = RS.freezeSnapshot(3, liveRecords, { scenarioPack: 'vn-out-jp-2026a' });
// Mỗi mục ảnh chụp là bản ghi hợp lệ theo lược đồ nhật ký (không cấu trúc riêng).
snap.entries.forEach(e => DL.FIELD_KEYS.forEach(k => {
  // Liệt kê ĐẦY ĐỦ mọi trường lược đồ (cố ý): thêm trường mới phải sửa test này một
  // cách có ý thức — phân loại rõ nó bắt buộc-trong-ảnh-chụp hay không. Với lược đồ
  // dùng làm dữ liệu nghiên cứu, đó là chốt toàn vẹn, không chỉ để CI xanh.
  if (['state_before', 'result_after', 'consent_purposes', 'session_tag'].includes(k)) return; // không bắt buộc trong ảnh chụp
  assert.ok(e[k] !== undefined, 'mục ảnh chụp thiếu trường lược đồ: ' + k);
}));
assert.ok(/^fnv1a:/.test(snap.snapshot_hash), 'ảnh chụp có mã băm');

// --- Chấm TRÊN BẢN ĐÓNG BĂNG, không phải trạng thái sống ---
assert.ok(Object.isFrozen(snap) && Object.isFrozen(snap.entries[0]), 'ảnh chụp bất biến');
// Sửa "trạng thái sống" (mảng gốc) SAU khi đóng băng: không được ảnh hưởng kết quả chấm.
liveRecords[0].decision.gia = 999;
const teamDecision = { gia: 150, san_luong: 1000 };
const r1 = RS.settleRound(snap, teamDecision);
liveRecords.push(rec({ team_id: 'h_new', decision: { gia: 60 } })); // thêm đối thủ vào state sống
const r2 = RS.settleRound(snap, teamDecision);
assert.equal(r1.share, r2.share, 'chấm chạy trên ảnh chụp đóng băng, không đổi theo state sống');

// --- Hợp đồng tái lập: cùng gói + cùng ảnh chụp + cùng quyết định -> giống hệt ---
const snaps = [snap, RS.freezeSnapshot(4, liveRecords.slice(0, 2), { scenarioPack: 'vn-out-jp-2026a' })];
const seq = [{ gia: 150 }, { gia: 160 }];
const run1 = RS.replay(snaps, seq);
const run2 = RS.replay(snaps, seq);
assert.deepEqual(run1, run2, 'chạy lại cho kết quả giống hệt');
assert.ok(run1[0].share > 0 && run1[0].share < 1, 'thị phần hợp lệ');

// --- Lấp hồ sơ neo (Bước 5): lớp nhỏ vẫn đối mặt thị trường lớn, vẫn xác định ---
const filledA = RS.settleRound(snap, teamDecision, { fillTo: 200 });
const filledB = RS.settleRound(snap, teamDecision, { fillTo: 200 });
assert.equal(filledA.share, filledB.share, 'lấp thị trường vẫn xác định');
assert.ok(filledA.share < r1.share, 'thị trường đông hơn -> thị phần đội nhỏ lại (có ý nghĩa kinh tế)');

console.log('AIBIS round-swap + frozen snapshot (Bước 4) contract passed.');
