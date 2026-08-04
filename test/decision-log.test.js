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

// 2) CỜ ĐỒNG THUẬN mặc định TẮT -> record() bỏ qua, không giữ gì.
const log = new DL.DecisionLog();
const off = log.record(sampleFields());
assert.equal(off.recorded, false);
assert.equal(off.reason, 'consent_off');
assert.equal(log.entries().length, 0, 'tắt đồng thuận thì không ghi gì');

// 3) Bật đồng thuận (chỉ bật cờ + phiên bản, không viết lại) -> ghi hợp lệ.
log.enableConsent('v1');
const on = log.record(sampleFields());
assert.equal(on.recorded, true);
assert.equal(log.entries().length, 1);
assert.equal(on.record.consent_version, 'v1', 'consent_version được đóng dấu');
assert.equal(on.record.team_id.slice(0, 2), 'h_', 'team_id là bản băm');

// 4) Thiếu trường bắt buộc -> ném lỗi.
assert.throws(() => DL.createRecord({ decision_id: 'x' }), /Thiếu trường bắt buộc/);

// 5) KHÔNG lưu danh tính: team_id thô (tên/email) bị chặn; bản băm được nhận.
assert.throws(() => DL.createRecord(sampleFields({ team_id: 'Đỗ Thùy Hương' })), /băm|định danh/);
assert.throws(() => DL.createRecord(sampleFields({ team_id: 'huong@vlute.edu.vn' })), /băm|định danh/);
assert.ok(DL.createRecord(sampleFields()), 'team_id đã băm thì hợp lệ');

// 6) enum kiểm soát: role/pillar sai -> lỗi.
assert.throws(() => DL.createRecord(sampleFields({ role: 'invader' })), /không hợp lệ/);

// 7) hashTeamId xác định.
assert.equal(DL.hashTeamId('Đội Sen'), DL.hashTeamId('Đội Sen'));
assert.notEqual(DL.hashTeamId('Đội Sen'), DL.hashTeamId('Đội Lúa'));

// 8) Tiêu chí hoàn thành Bước 1: một "ván" sinh nhật ký đầy đủ, xuất CSV, không PII.
const play = new DL.DecisionLog({ consentEnabled: true, consentVersion: 'v1' });
for (let r = 1; r <= 3; r++) play.record(sampleFields({ decision_id: 'd-' + r, round: r }));
const csv = DL.toCSV(play.entries());
assert.equal(csv.split('\n').length, 4, 'tiêu đề + 3 dòng');
assert.ok(csv.includes('team_id') && csv.includes('h_'), 'CSV có cột team_id đã băm');
assert.ok(!/@|Đỗ Thùy Hương/.test(csv), 'CSV không chứa danh tính');

console.log('Decision-log schema + consent-gated write (Bước 1) contract passed.');
