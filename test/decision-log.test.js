'use strict';
const assert = require('node:assert/strict');
const DL = require('../js/decision-log.js');

const NOW = '2026-08-04T09:12:33Z';
function sampleFields(over) {
  return Object.assign({
    decision_id: 'd-1', session_id: 's-1', cohort_id: '2026A-KT330H',
    team_id: DL.hashTeamId('Đội Sen'), pillar: 'bat-nghiep', role: 'home_outbound',
    round: 3, scenario_pack: 'vn-2026a', snapshot_hash: 'sha256:abc',
    decision: { gia: 168000, san_luong: 1200 }, timestamp: NOW, consent_version: 'v1'
  }, over || {});
}

// 1) Lược đồ là hợp đồng dữ liệu — có đủ trường bản giao việc (nguồn cho Bước 3 & 4).
['decision_id','session_id','cohort_id','team_id','pillar','role','round','scenario_pack','snapshot_hash','decision','timestamp','consent_version']
  .forEach(k => assert.ok(DL.FIELD_KEYS.includes(k), 'lược đồ thiếu trường: ' + k));

// 2) HAI MỤC ĐÍCH TÁCH RIÊNG — hằng số phơi ra đúng hai ô đồng ý.
assert.deepEqual(DL.PURPOSES, ['research', 'product'], 'hai mục đích tách riêng: research + product');

// 3) Mặc định cả hai mục đích TẮT -> record() bỏ qua, không giữ gì.
const log = new DL.DecisionLog();
const off = log.record(sampleFields(), { consentedPurposes: ['research'] });
assert.equal(off.recorded, false);
assert.equal(off.reason, 'no_active_consent');
assert.equal(log.entries().length, 0, 'chưa bật mục đích nào thì không ghi gì');

// 4) Bật một mục đích PHẢI kèm phiên bản phiếu; bật rồi mới ghi được cho GIAO của
//    (đội đồng ý) ∩ (mục đích đang bật).
assert.throws(() => log.enablePurpose('research'), /phiên bản/);
assert.throws(() => log.enablePurpose('quang-cao', 'v1'), /không hợp lệ/);
log.enablePurpose('research', 'v1');
assert.deepEqual(log.activePurposes(), ['research']);

// Đội chỉ đồng ý 'product' nhưng chỉ 'research' đang bật -> giao rỗng -> bỏ qua.
const mismatch = log.record(sampleFields(), { consentedPurposes: ['product'] });
assert.equal(mismatch.recorded, false);
assert.equal(mismatch.reason, 'no_active_consent');

// Đội đồng ý 'research' -> ghi hợp lệ, đóng dấu phiên bản + tập mục đích cấp phép.
const on = log.record(sampleFields(), { consentedPurposes: ['research'] });
assert.equal(on.recorded, true);
assert.equal(log.entries().length, 1);
assert.equal(on.record.consent_version, 'v1', 'consent_version được đóng dấu');
assert.deepEqual(on.record.consent_purposes, ['research'], 'chỉ ghi mục đích đang bật ∩ đội đồng ý');
assert.equal(on.record.team_id.slice(0, 2), 'h_', 'team_id là bản băm');

// 5) Hai mục đích ĐỘC LẬP: bật thêm 'product', đội đồng ý cả hai -> bản ghi mang cả hai.
log.enablePurpose('product', 'v1');
assert.deepEqual(log.activePurposes(), ['research', 'product']);
const both = log.record(sampleFields({ decision_id: 'd-both' }), { consentedPurposes: ['research', 'product'] });
assert.deepEqual(both.record.consent_purposes, ['research', 'product']);
// entries({purpose}) lọc đúng theo mục đích cấp phép.
assert.equal(log.entries({ purpose: 'product' }).length, 1, 'chỉ bản ghi có product');
assert.equal(log.entries({ purpose: 'research' }).length, 2, 'cả hai bản ghi có research');

// 6) QUYỀN RÚT LUI có giới hạn kỹ thuật: chỉ chặn các lần ghi SAU; bản đã ghi vẫn còn
//    trong bộ đệm (không gỡ được phần đã gộp vào tham số cụm) nhưng bị loại khi lọc.
const t2 = DL.hashTeamId('Đội Lúa');
log.record(sampleFields({ decision_id: 'd-lua', team_id: t2 }), { consentedPurposes: ['research'] });
log.withdraw(t2);
assert.equal(log.isWithdrawn(t2), true);
const afterWithdraw = log.record(sampleFields({ decision_id: 'd-lua-2', team_id: t2 }), { consentedPurposes: ['research'] });
assert.equal(afterWithdraw.recorded, false);
assert.equal(afterWithdraw.reason, 'withdrawn', 'rút lui chặn lần ghi sau');
assert.ok(log.entries().some(r => r.team_id === t2), 'bản ghi trước khi rút lui vẫn tồn tại trong bộ đệm');
assert.ok(log.entries({ excludeWithdrawn: true }).every(r => r.team_id !== t2), 'lọc excludeWithdrawn loại đội đã rút lui');

// 7) Thiếu trường bắt buộc -> ném lỗi.
assert.throws(() => DL.createRecord({ decision_id: 'x' }), /Thiếu trường bắt buộc/);

// 8) KHÔNG lưu danh tính: team_id thô (tên/email) bị chặn; bản băm được nhận.
assert.throws(() => DL.createRecord(sampleFields({ team_id: 'Đỗ Thùy Hương' })), /băm|định danh/);
assert.throws(() => DL.createRecord(sampleFields({ team_id: 'huong@example.edu.vn' })), /băm|định danh/);
assert.ok(DL.createRecord(sampleFields()), 'team_id đã băm thì hợp lệ');

// 9) enum kiểm soát: role/pillar sai -> lỗi; consent_purposes phải là mảng.
assert.throws(() => DL.createRecord(sampleFields({ role: 'invader' })), /không hợp lệ/);
assert.throws(() => DL.createRecord(sampleFields({ consent_purposes: 'research' })), /mảng/);

// 10) hashTeamId xác định.
assert.equal(DL.hashTeamId('Đội Sen'), DL.hashTeamId('Đội Sen'));
assert.notEqual(DL.hashTeamId('Đội Sen'), DL.hashTeamId('Đội Lúa'));

// 11) Tiêu chí hoàn thành Bước 1: một "ván" sinh nhật ký đầy đủ, xuất CSV, không PII.
const play = new DL.DecisionLog();
play.enablePurpose('research', 'v1');
for (let r = 1; r <= 3; r++) play.record(sampleFields({ decision_id: 'd-' + r, round: r }), { consentedPurposes: ['research'] });
const csv = DL.toCSV(play.entries());
assert.equal(csv.split('\n').length, 4, 'tiêu đề + 3 dòng');
assert.ok(csv.includes('team_id') && csv.includes('h_'), 'CSV có cột team_id đã băm');
assert.ok(!/@|Đỗ Thùy Hương/.test(csv), 'CSV không chứa danh tính');

console.log('Decision-log schema + two-purpose consent gate + withdrawal (Bước 1) contract passed.');
