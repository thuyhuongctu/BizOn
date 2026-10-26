'use strict';
// Hành trình 3 bậc – kho hộ chiếu cục bộ (js/journey-store.js) và thẻ Hành trang (js/journey-card.js) trong Node.
const assert = require('node:assert/strict');
const J = require('../js/core/journey.js');
const S = require('../js/journey-store.js');
const C = require('../js/journey-card.js');

(function storeRoundTrip() {
  const storage = S.memoryStorage();
  assert.equal(S.load({ storage }), null);
  const p = S.getOrCreate({ classCode: 'QTKD-K48', teamName: 'Đội Phù Sa' }, { storage });
  assert.equal(p.journeyId.startsWith('J-QTKD-K48-DOI-PHU-SA-'), true);
  assert.deepEqual(S.load({ storage }), p);
  assert.equal(S.getOrCreate({ teamName: 'Khác' }, { storage }).journeyId, p.journeyId, 'đã có thì không tạo mới');
  // update: hàm thuần, ghi lại, bản cũ thành sao lưu
  const q = S.update(x => J.recordTier1(x, { total: 4.2, result: { eff: 71, rank: 2 }, history: [], knownPairs: { '0-2': true, '1-4': true, '2-1': true } }), { storage });
  assert.equal(q.tiers.t1.status, 'done');
  assert.equal(JSON.parse(storage.getItem(S.BACKUP_KEY)).tiers.t1.status, 'pending');
  assert.equal(S.load({ storage }).tiers.t1.eff, 71);
})();

(function rejectsBroken() {
  const storage = S.memoryStorage();
  storage.setItem(S.KEY, '{broken');
  assert.equal(S.load({ storage }), null);
  // khóa chính hỏng nhưng sao lưu còn tốt → phục hồi
  const good = J.createPassport({ teamName: 'A' });
  storage.setItem(S.BACKUP_KEY, JSON.stringify(good));
  assert.deepEqual(S.load({ storage }), good);
  assert.equal(JSON.parse(storage.getItem(S.KEY)).journeyId, good.journeyId, 'ghi lại khóa chính từ sao lưu');
  // save từ chối hộ chiếu nhảy cóc
  const skip = J.createPassport({ teamName: 'B' }); skip.tiers.t3.status = 'playing';
  assert.throws(() => S.save(skip, { storage }), e => e.message === 'invalid_passport' && e.errors.includes('tier_order_t3'));
  S.clear({ storage }); assert.equal(S.load({ storage }), null);
})();

(function exportImport() {
  const p = J.recordTier1(J.createPassport({ teamName: 'Đội Xuất' }), { total: 3, result: { eff: 50, rank: 3 }, history: [], knownPairs: {} });
  const txt = S.exportJson(p); const obj = JSON.parse(txt);
  assert.equal(obj.format, S.EXPORT_FORMAT); assert.equal(obj.version, 1); assert.deepEqual(obj.passport, p);
  assert.deepEqual(S.importJson(txt), p, 'gói xuất');
  assert.deepEqual(S.importJson(JSON.stringify(p)), p, 'hộ chiếu trần');
  assert.equal(S.importJson('nope'), null); assert.equal(S.importJson('{"format":"bizon-journey-export","passport":{"schemaVersion":9}}'), null);
})();

(function cardAndLinks() {
  const p = J.recordTier1(J.createPassport({ classCode: 'QTKD-K48', teamName: 'Đội Phù Sa', createdAt: '2026-11-03T02:10:00Z' }), { total: 4.2, result: { eff: 71, rank: 2 }, history: [], knownPairs: { '0-2': true, '1-4': true, '2-1': true } });
  assert.equal(C.gameLink(p, 't1'), 'ben-phu-sa.html?journey=J-QTKD-K48-DOI-PHU-SA-2026-11-03');
  assert.equal(C.gameLink(p, 't2'), 'game.html?journey=J-QTKD-K48-DOI-PHU-SA-2026-11-03');
  assert.equal(C.gameLink(p, 't3'), 'lab/ho-chieu-sau-rieng-v2.html?journey=J-QTKD-K48-DOI-PHU-SA-2026-11-03', 'mặc định Sầu Riêng');
  assert.equal(C.gameLink(p, 't3', 'brand'), 'brand-passport-v2.html?journey=J-QTKD-K48-DOI-PHU-SA-2026-11-03');
  assert.equal(C.journeyIdFromUrl('?x=1&journey=J-QTKD-K48-DOI-PHU-SA-2026-11-03'), 'J-QTKD-K48-DOI-PHU-SA-2026-11-03');
  assert.equal(C.journeyIdFromUrl('?lang=vi'), null);
  // thẻ hành trang: 3 dòng T1→T2, hai nút; tiếng Anh; thoát HTML
  const carry = J.journeyCarry(p, 't2');
  const html = C.html(carry, { lang: 'vi' });
  assert.equal((html.match(/class="jc-line"/g) || []).length, 3);
  assert.match(html, /Hành trang vào Bật Nghiệp/); assert.match(html, /id="jc-accept"/); assert.match(html, /id="jc-solo"/); assert.match(html, /\+28/);
  const en = C.html(carry, { lang: 'en', buttons: false });
  assert.match(en, /Carry-over into Bật Nghiệp/); assert.doesNotMatch(en, /jc-accept/); assert.match(en, /starting capital 528m/);
  // hành trang tắt: không có nút nhận, có lời giải thích, thẻ mờ
  const off = C.html(J.journeyCarry(p, 't2', { enabled: false }), { lang: 'vi' });
  assert.match(off, /jc-card jc-off/); assert.doesNotMatch(off, /jc-accept/); assert.match(off, /Hành trang đang tắt/);
  // chưa có hành trang
  const none = C.html(J.journeyCarry(J.createPassport({}), 't2'), { lang: 'vi' });
  assert.match(none, /Chưa có hành trang/);
  assert.equal(C.esc('<b>&"'), '&lt;b&gt;&amp;&quot;');
  assert.equal(C.tierName('t3', 'en', 'brand'), 'Brand Passport');
})();

console.log('journey-store: OK');
