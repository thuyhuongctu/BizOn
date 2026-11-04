// Hộ Chiếu Sầu Riêng – mốc ngày đối chiếu nguồn gốc (04/11/2026):
// mở cửa 27/7/2022 = Thông báo số 66/2022 của Hải quan Trung Quốc (nghị định thư ký 7/2022);
// cảnh báo cadimi 30 lô tính từ 5/2023 (Tuổi Trẻ 23/3/2024 dẫn Cục BVTV), không phải 6/2023.
'use strict';
const assert = require('node:assert/strict');
const D = require('../lab/ho-chieu-sau-rieng-data.js');

assert.equal(D.facts.openDate.v, '27/7/2022');
assert.equal(D.facts.openDate.src, 'GACC66');
assert.match(D.sources.GACC66, /Thông báo số 66\/2022/);
assert.match(D.sourcesEn.GACC66, /Announcement No\. 66 of 2022/);
assert.match(D.facts.openDate.vi, /66\/2022/);

assert.equal(D.facts.cadmium.src, 'CADMI');
assert.match(D.facts.cadmium.vi, /Từ 5\/2023 đến 1\/2024/);
assert.match(D.facts.cadmium.en, /From May 2023 to Jan 2024/);
const s4 = D.seasons.find(s => s.anchor === 'cadmium');
assert.match(s4.textVi, /5\/2023–1\/2024/); assert.match(s4.textEn, /May 2023–Jan 2024/);
assert.ok(!JSON.stringify(D).includes('6/2023') && !JSON.stringify(D).includes('Jun 2023'), 'không còn mốc 6/2023');
// mọi dữ kiện trỏ tới nguồn có thật (VI và EN)
// (vài nguồn vốn viết bằng tiếng Anh chỉ có ở danh sách VI; hai nguồn mới thì phải có cả EN)
for (const [k, f] of Object.entries(D.facts)) if (f.src) assert.ok(D.sources[f.src], 'thiếu nguồn ' + k);
for (const k of ['GACC66', 'CADMI']) assert.ok(D.sources[k] && D.sourcesEn[k], 'nguồn mới thiếu VI/EN: ' + k);
console.log('sau-rieng-moc-ngay: ok');
