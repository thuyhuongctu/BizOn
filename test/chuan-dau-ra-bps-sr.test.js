/* Chuẩn đầu ra cho Bến Phù Sa và Hộ Chiếu Sầu Riêng (PR 6 của kế hoạch docs/roadmap/KE-HOACH-DON-HE-SINH-THAI-2026-11.md, 06/11/2026):
 * rubric có Mục 3b (BPS-1…5) và 3c (SR-1…6) với chỉ số quan sát có thật trong gói dữ liệu / engine, tiêu chí đạt đếm được, tóm tắt EN. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const rb = R('docs/chuan-dau-ra-va-rubric.md');
for (const h of ['# 3b · Ma trận chuẩn đầu ra – Bến Phù Sa', '# 3c · Ma trận chuẩn đầu ra – Hộ Chiếu Sầu Riêng', '## 3b.1 ·', '## 3c.1 ·', '## 3b–3c · English summary']) assert.ok(rb.includes(h), 'thiếu ' + h);
for (let i = 1; i <= 5; i++) assert.ok(rb.includes('**BPS-' + i + '**'), 'thiếu BPS-' + i);
for (let i = 1; i <= 6; i++) assert.ok(rb.includes('**SR-' + i + '**'), 'thiếu SR-' + i);
assert.ok(rb.includes('[3b · Ma trận chuẩn đầu ra – Bến Phù Sa]') && rb.includes('[3c · Ma trận chuẩn đầu ra – Hộ Chiếu Sầu Riêng]'), 'mục lục có 3b, 3c');
assert.ok(/Tiêu chí đạt theo tuần/.test(rb) && /Tiêu chí đạt theo vụ/.test(rb), 'có tiêu chí đạt đếm được cho cả hai game');
// Chỉ số nêu trong 3b phải có trong từ điển biến gói dữ liệu; chỉ số 3c phải có trong engine Hộ Chiếu Sầu Riêng
const td = R('docs/research/TU-DIEN-BIEN.md');
for (const v of ['t1_eff', 't1_rank', 't1_total', 't1_explore_weeks', 't1_exploit_weeks', 't1_survey_weeks', 't1_explain', 'effectuation_index']) assert.ok(td.includes('`' + v + '`'), 'TU-DIEN-BIEN thiếu ' + v);
const eng = R('lab/ho-chieu-sau-rieng-engine.js');
for (const v of ['rep', 'adapt', 'sus', 'audit', 'byChannel', 'capability']) assert.ok(new RegExp('\\b' + v + '\\b').test(eng), 'engine HCSR thiếu ' + v);
assert.ok(/30% lợi nhuận \+ 20% uy tín \+ 20% năng lực \+ 15% thích ứng \+ 15% bền vững/.test(R('docs/huong-dan-ho-chieu-sau-rieng.md')), 'trọng số điểm HCSR như hướng dẫn');
assert.ok(R('docs/huong-dan-ho-chieu-sau-rieng.md').includes('Mục 3c'), 'hướng dẫn HCSR dẫn tới Mục 3c');
console.log('chuan-dau-ra-bps-sr: ok');
