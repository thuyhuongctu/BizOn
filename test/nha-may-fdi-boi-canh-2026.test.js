// Nhà máy FDI – bối cảnh 2026 (25/11/2026): quý 8 thêm số thật của WTO nhưng KHÔNG đổi tác động (giữ cân bằng);
// hai câu hỏi thảo luận mới dẫn OECD & UNCTAD (2026); chân trang nêu nguồn; bản VI/EN cùng số câu.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const D = require('../lab/nha-may-fdi-data.js');
const html = fs.readFileSync(path.join(__dirname, '..', 'lab/nha-may-fdi.html'), 'utf8');

// 1. Quý 8: tác động giữ nguyên như trước khi thêm bối cảnh
const q8 = D.events[7];
assert.equal(q8.q, 8);
assert.deepEqual(q8.tariff, { US: 0.20 }, 'quý 8 vẫn chỉ có thuế Hoa Kỳ 20%');
assert.deepEqual(q8.transship, { market: 'US', threshold: 0.30, rate: 0.40 }, 'quý 8 vẫn giữ ngưỡng nghi trung chuyển');
for (const k of ['demand', 'priceCut', 'disruption', 'importFreight']) assert.equal(q8[k], undefined, 'quý 8 không thêm tác động ' + k);
assert.equal(q8.inspired, 'G20, 2026');

// 2. Số trong lời biến cố khớp nguồn (29,6 % ↔ 0.296), cả hai ngôn ngữ
assert.equal(D.context2026.g20ImportStockpileShare, 0.296);
assert.ok(q8.textVi.includes('29,6%') && q8.textVi.includes('30/6/2026') && q8.textVi.includes('WTO'), 'lời VI có số, mốc và nguồn');
assert.ok(q8.textEn.includes('29.6%') && q8.textEn.includes('30 June 2026') && q8.textEn.includes('WTO'), 'lời EN có số, mốc và nguồn');
assert.match(D.context2026.wto, /^World Trade Organization \(2026, 23\/11\)\. .+ https:\/\/www\.wto\.org\//);
assert.match(D.context2026.oecdUnctad, /^OECD & UNCTAD \(2026\)\. 33rd OECD\/UNCTAD report on G20 investment measures\. https:\/\//);

// 3. Câu hỏi thảo luận: 6 câu mỗi ngôn ngữ; hai câu mới dẫn OECD & UNCTAD (2026)
const qs = [...html.matchAll(/qs: \[([\s\S]*?)\],\n/g)].map(m => m[1]);
assert.equal(qs.length, 2, 'có danh sách câu hỏi VI và EN');
for (const block of qs) {
  const n = (block.match(/', '/g) || []).length + 1;
  assert.equal(n, 6, 'mỗi ngôn ngữ 6 câu hỏi thảo luận');
  assert.equal((block.match(/OECD & UNCTAD, 2026/g) || []).length, 2, 'hai câu mới dẫn nguồn OECD & UNCTAD (2026)');
}
assert.ok(qs[0].includes('01/07/2026') && qs[1].includes('1 July 2026'), 'mốc hiệu lực thẩm định đầu tư ra nước ngoài của Trung Quốc');
assert.ok(qs[0].includes('vay nội bộ công ty') && qs[1].includes('intra-company loans'), 'nêu vay nội bộ công ty');

// 4. Chân trang hai ngôn ngữ nêu nguồn bối cảnh 2026
assert.ok(html.includes('Bối cảnh 2026: WTO (2026)') && html.includes('2026 context: WTO (2026)'), 'chân trang nêu nguồn 2026');

// 5. Cân bằng chiến lược không đổi (chạy lại phép thử của bộ test gốc với kịch bản mới)
const E = require('../lab/nha-may-fdi-engine.js');
const DIV = { US: 45, EU: 30, JPKR: 20, CNAS: 25 };
const play = (ind, f, seed) => { let s = E.newGame(D, ind, seed); for (let q = 1; q <= 8; q++) s = E.playQuarter(D, s, f(q)); return s; };
for (const ind of ['electronics', 'textile']) for (const seed of [1, 42, 2026]) {
  const A = E.summary(play(ind, () => ({ local: 0, alloc: { US: 100 }, invest: 0 }), seed)).profit;
  const B = E.summary(play(ind, () => ({ local: 0, alloc: DIV, invest: 0 }), seed)).profit;
  const C = E.summary(play(ind, q => ({ local: 0.45, alloc: DIV, invest: q <= 3 ? 5e5 : 0 }), seed)).profit;
  assert.ok(C > B && B > A, `${ind} seed ${seed}: cân bằng giữ nguyên`);
}

const v = +fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8').match(/bizon-v(\d+)/)[1];
assert.ok(v >= 987, 'sw.js phải ≥ bizon-v987, đang ' + v);
console.log('nha-may-fdi-boi-canh-2026: đạt');
