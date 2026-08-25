'use strict';
const assert = require('node:assert/strict');
const DL = require('../js/decision-log.js');
const RS = require('../js/aibis/round-swap.js');
const GB = require('../js/instructor-gradebook.js');

const NOW = '2026-08-04T09:00:00Z';
function fields(over) {
  return Object.assign({
    decision_id: 'd', session_id: 's', cohort_id: '2026A',
    team_id: 'h_a', pillar: 'ho-chieu', role: 'host_inbound',
    round: 3, scenario_pack: 'vn-out-jp-2026a', snapshot_hash: 'pending',
    decision: { gia: 150, san_luong: 1000 }, timestamp: NOW, consent_version: 'v1'
  }, over || {});
}

// Ảnh chụp đóng băng cho vòng 3 (đối thủ = hai đội) — dùng đúng lược đồ Bước 1.
const snap3 = RS.freezeSnapshot(3, [
  fields({ team_id: 'h_a', decision: { gia: 140, san_luong: 1100 } }),
  fields({ team_id: 'h_b', decision: { gia: 170, san_luong: 900 } })
], { scenarioPack: 'vn-out-jp-2026a', now: NOW });

// Nhật ký quyết định canonical — hai đội.
const entries = [
  DL.createRecord(fields({ decision_id: 'd1', team_id: 'h_a', decision: { gia: 150, san_luong: 1000 }, consent_purposes: ['research'] })),
  DL.createRecord(fields({ decision_id: 'd2', team_id: 'h_b', decision: { gia: 160, san_luong: 950 }, consent_purposes: ['research'] }))
];

// 1) Sổ điểm đọc ĐÚNG lược đồ, gom theo đội/vòng, chấm TRÊN ẢNH CHỤP; hợp đồng đúng.
const gb = GB.buildGradebook(entries, [snap3]);
assert.equal(gb.graded_on, 'frozen_snapshot');
assert.equal(gb.auto_rubric, false, 'KHÔNG tự chấm rubric — chỉ cấp bằng chứng');
assert.equal(gb.teams.length, 2);
const a = gb.teams.find(t => t.team_id === 'h_a');
assert.equal(a.rounds.length, 1);
assert.equal(a.rounds[0].round, 3);
assert.equal(a.rounds[0].snapshot_hash, snap3.snapshot_hash, 'đóng dấu mã băm ảnh chụp');
assert.ok(a.rounds[0].share > 0 && a.rounds[0].share < 1, 'chỉ số neo hợp lệ');

// 2) HỢP ĐỒNG TÁI LẬP: cùng nhật ký + cùng ảnh chụp -> sổ điểm GIỐNG HỆT.
const gb2 = GB.buildGradebook(entries, [snap3]);
assert.deepEqual(gb2, gb, 'tái lập: hai lần dựng cho kết quả giống hệt');

// 3) Chấm TRÊN ẢNH CHỤP, không theo state sống: sửa mảng records gốc SAU khi đóng băng
//    không được làm đổi điểm (ảnh chụp là bản sao sâu, bất biến).
const liveRecords = [fields({ team_id: 'h_a', decision: { gia: 140, san_luong: 1100 } }),
                     fields({ team_id: 'h_b', decision: { gia: 170, san_luong: 900 } })];
const snapLive = RS.freezeSnapshot(3, liveRecords, { scenarioPack: 'vn-out-jp-2026a', now: NOW });
const before = GB.buildGradebook(entries, [snapLive]).teams.find(t => t.team_id === 'h_a').rounds[0].share;
liveRecords[0].decision.gia = 999; // sửa "trạng thái sống"
const after = GB.buildGradebook(entries, [snapLive]).teams.find(t => t.team_id === 'h_a').rounds[0].share;
assert.equal(before, after, 'điểm chạy trên ảnh chụp đóng băng, không đổi theo state sống');

// 4) CỔNG ĐỒNG THUẬN — lọc theo mục đích cấp phép.
const mixed = [
  DL.createRecord(fields({ decision_id: 'd3', team_id: 'h_a', consent_purposes: ['research'] })),
  DL.createRecord(fields({ decision_id: 'd4', team_id: 'h_b', consent_purposes: ['product'] }))
];
const onlyResearch = GB.buildGradebook(mixed, [snap3], { purpose: 'research' });
assert.equal(onlyResearch.teams.length, 1, 'chỉ đội đồng ý research');
assert.equal(onlyResearch.teams[0].team_id, 'h_a');
assert.equal(onlyResearch.purpose, 'research');
// Mặc định (không mục đích) = chấm cả lớp: chấm điểm là hoạt động dạy học hợp pháp.
assert.equal(GB.buildGradebook(mixed, [snap3]).teams.length, 2, 'không lọc mục đích -> gom cả lớp để chấm');

// 5) RÚT LUI — loại đội đã rút khỏi sổ điểm dùng cho mục đích nghiên cứu.
const gw = GB.buildGradebook(entries, [snap3], { withdrawn: ['h_b'] });
assert.ok(gw.teams.every(t => t.team_id !== 'h_b'), 'đội rút lui bị loại');
const gwFn = GB.buildGradebook(entries, [snap3], { isWithdrawn: id => id === 'h_a' });
assert.deepEqual(gwFn.teams.map(t => t.team_id), ['h_b'], 'isWithdrawn dạng hàm cũng loại đúng');

// 6) Vòng thiếu ảnh chụp -> không chấm, ghi vào meta, KHÔNG ném.
const gmiss = GB.buildGradebook([DL.createRecord(fields({ round: 5 }))], [snap3]);
assert.equal(gmiss.teams.length, 0);
assert.equal(gmiss.skipped_no_snapshot, 1, 'ghi số bản ghi thiếu ảnh chụp');

// 7) CSV — có team_id (băm) + share, KHÔNG danh tính.
const csv = GB.toGradebookCSV(gb);
const head = csv.split('\n')[0];
assert.ok(head.includes('team_id') && head.includes('share') && head.includes('snapshot_hash'));
assert.ok(csv.includes('h_a') && !/@|Đỗ Thùy Hương/.test(csv), 'CSV không chứa danh tính');

console.log('Instructor gradebook: canonical schema + frozen-snapshot grading + consent gate (Bước 3) contract passed.');
