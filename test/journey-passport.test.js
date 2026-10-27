'use strict';
// Hành trình 3 bậc – lược đồ hộ chiếu: tạo, kiểm tra, không bỏ qua bậc, từ chối JSON hỏng.
const assert = require('node:assert/strict');
const J = require('../js/core/journey.js');

(function createDefaults() {
  const p = J.createPassport({ classCode: ' qtkd-k48 ', teamName: 'Đội Phù Sa', createdAt: '2026-11-03T02:10:00Z' });
  assert.equal(p.schemaVersion, 1);
  assert.equal(p.journeyId, 'J-QTKD-K48-DOI-PHU-SA-2026-11-03');
  assert.equal(p.seed, 'QTKD-K48:DOI-PHU-SA:journey-v1:j1');
  assert.equal(p.carryEnabled, true);
  assert.deepEqual(Object.keys(p.tiers), ['t1', 't2', 't3']);
  assert.deepEqual(p.tiers.t3, { status: 'pending', variant: 'durian' });
  assert.deepEqual(J.validatePassport(p), { valid: true, errors: [] });
  const self = J.createPassport({});
  assert.equal(self.classCode, 'TU-HOC');
  assert.equal(J.createPassport({ variant: 'brand' }).tiers.t3.variant, 'brand');
  assert.equal(J.createPassport({ variant: 'xyz' }).tiers.t3.variant, 'durian');
})();

(function rejectBroken() {
  assert.equal(J.parsePassport('{not json'), null);
  assert.equal(J.parsePassport('null'), null);
  assert.equal(J.parsePassport(JSON.stringify({ schemaVersion: 2, journeyId: 'x', tiers: {} })), null);
  const v = J.validatePassport({ schemaVersion: 1, journeyId: '', tiers: { t1: { status: 'done' }, t2: { status: 'weird' } } });
  assert.equal(v.valid, false);
  assert.deepEqual(v.errors, ['journey_id', 'tier_status_t2', 'tier_status_t3']);
  assert.deepEqual(J.validatePassport({ schemaVersion: 1, journeyId: 'J', tiers: { t1: { status: 'pending' }, t2: { status: 'pending' }, t3: { status: 'pending', variant: 'nope' } } }).errors, ['t3_variant']);
})();

(function noSkipping() {
  const skip2 = { schemaVersion: 1, journeyId: 'J', tiers: { t1: { status: 'pending' }, t2: { status: 'done' }, t3: { status: 'pending' } } };
  assert.deepEqual(J.validatePassport(skip2).errors, ['tier_order_t2'], 'Bậc 2 xong mà Bậc 1 chưa');
  const skip3 = { schemaVersion: 1, journeyId: 'J', tiers: { t1: { status: 'done' }, t2: { status: 'pending' }, t3: { status: 'playing' } } };
  assert.deepEqual(J.validatePassport(skip3).errors, ['tier_order_t3'], 'vào thẳng Bậc 3 với hộ chiếu chỉ có Bậc 1');
  const ok = J.createPassport({});
  ok.tiers.t1.status = 'done'; ok.tiers.t2.status = 'playing';
  assert.equal(J.validatePassport(ok).valid, true);
  assert.equal(J.nextTier(ok), 't2');
  assert.equal(J.canPlay(ok, 't2'), true); assert.equal(J.canPlay(ok, 't3'), false); assert.equal(J.canPlay(ok, 't1'), false, 'bậc đã xong không chơi lại trong cùng hành trình');
  assert.equal(J.canPlay(ok, 't9'), false);
})();

(function roundTrip() {
  const p = J.createPassport({ classCode: 'QTKD-K48', teamName: 'Đội Phù Sa' });
  const q = J.parsePassport(JSON.stringify(p));
  assert.deepEqual(q, p);
  const r = J.recordTier1(q, { total: 4.2, result: { eff: 71, rank: 2 }, history: [], knownPairs: {} }, { appVersion: 'bizon-bps3d-v2', finishedAt: '2026-11-03T03:00:00Z' });
  assert.equal(r.tiers.t1.appVersion, 'bizon-bps3d-v2');
  assert.equal(r.tiers.t1.finishedAt, '2026-11-03T03:00:00Z');
  assert.equal(p.tiers.t1.status, 'pending', 'record* không sửa hộ chiếu gốc');
  assert.equal(J.validatePassport(JSON.parse(JSON.stringify(r))).valid, true);
})();

console.log('journey-passport: OK');
