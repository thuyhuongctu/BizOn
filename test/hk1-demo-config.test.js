'use strict';
// Test cho gói cấu hình học kỳ demo (Task Brief PR B):
// session_tag, khóa seed theo lớp, preset vòng rút gọn, gom theo cohort.
const assert = require('node:assert/strict');
const DL = require('../js/decision-log.js');
const Seed = require('../js/core/seed-engine.js');
const Presets = require('../js/demo-presets.js');

const NOW = '2026-09-26T02:00:00Z';
function fields(over) {
  return Object.assign({
    decision_id: 'd-1', session_id: 's-1', cohort_id: '2026A-KT330H',
    team_id: DL.hashTeamId('Đội Sen'), pillar: 'bat-nghiep', role: 'home_outbound',
    round: 1, scenario_pack: 'vn-2026a', snapshot_hash: 'sha256:abc',
    decision: { gia: 168000 }, timestamp: NOW, consent_version: 'v1'
  }, over || {});
}

// 1) session_tag có trong lược đồ, KHÔNG bắt buộc, và ghi/xuất được.
assert.ok(DL.FIELD_KEYS.includes('session_tag'), 'lược đồ phải có session_tag');
const log = new DL.DecisionLog();
log.enablePurpose('research', 'v1');
const r = log.record(fields({ session_tag: 'kt330-l01-b1' }), { consentedPurposes: ['research'] });
assert.equal(r.recorded, true);
assert.equal(r.record.session_tag, 'kt330-l01-b1', 'session_tag được ghi');
assert.ok(DL.toCSV(log.entries()).split('\n')[0].includes('session_tag'), 'CSV có cột session_tag');

// 2) session_tag vẫn phải sạch danh tính (không email/tên có dấu cách).
assert.throws(() => DL.validate(fields({ session_tag: ' nguyen van a@ctu.edu.vn' })), /định danh|team_id/);

// 3) Lọc theo session_tag + gom theo cohort (view giảng viên).
log.record(fields({ decision_id: 'd-2', cohort_id: '2026B-KT330H', session_tag: 'kt330-l02-b1' }),
  { consentedPurposes: ['research'] });
assert.equal(DL.filterBySessionTag(log.entries(), 'kt330-l01-b1').length, 1);
const grouped = log.entriesByCohort();
assert.deepEqual(Object.keys(grouped).sort(), ['2026A-KT330H', '2026B-KT330H']);

// 4) Khóa seed theo lớp: MỌI nhóm cùng lớp → CÙNG seed thị trường; xác định; khác seed cá nhân.
const a = Seed.createCohortSeed('2026A-KT330H', 'vn-2026a');
const b = Seed.createCohortSeed('2026A-KT330H', 'vn-2026a');
assert.equal(a, b, 'cùng lớp + kịch bản → cùng seed');
assert.notEqual(a, Seed.createCohortSeed('2026B-KT330H', 'vn-2026a'), 'khác lớp → khác seed');
const personal = Seed.createSeed('2026A-KT330H', DL.hashTeamId('Đội Sen'), 'vn-2026a');
assert.notEqual(a, personal, 'seed khóa-lớp khác seed theo nhóm');
// RNG từ cùng seed phải tái lập được.
assert.equal(Seed.randomFromSeed(a, 'demand')(), Seed.randomFromSeed(b, 'demand')(), 'RNG tái lập từ seed khóa-lớp');

// 5) Preset: demo-basic ⊆ demo-full; presetFor trả bản sao; tên lạ thì ném lỗi.
const basic = Presets.presetFor('demo-basic');
const full = Presets.presetFor('demo-full');
assert.ok(basic.decisionKeys.length >= 3 && basic.decisionKeys.length <= 4, 'basic mở 3–4 biến');
basic.decisionKeys.forEach((k) => assert.ok(full.decisionKeys.includes(k), 'basic ⊆ full: ' + k));
assert.ok(full.decisionKeys.length > basic.decisionKeys.length, 'full nhiều biến hơn basic');
assert.throws(() => Presets.presetFor('khong-co'), /không tồn tại/);

console.log('OK hk1-demo-config: session_tag + cohort seed + presets + grouping');
