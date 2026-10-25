// Hộ Chiếu Sầu Riêng: nhãn điểm «Ứng phó biến cố» (khoá engine vẫn là adaptation) – tách khỏi «chỉ số thích nghi»
// của báo cáo (mức thay đổi quyết định giữa hai vụ), để debrief và bài viết không lẫn hai khái niệm.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const ctx = {}; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-data.js'), ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-core.js'), ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-engine.js'), ctx);
const D = ctx.DurianData, C = ctx.DurianCore, E = ctx.DurianEngine;
assert.ok(Object.keys(D.scoreWeights).includes('adaptation'), 'khoá điểm trong engine không đổi');
const st = E.newGame(D, 'packer', 1); const sm = E.summary(D, st);
assert.ok('adaptation' in sm.parts, 'summary vẫn trả về phần adaptation');
const vi = C.howToPlay(D, (a, b) => a), en = C.howToPlay(D, (a, b) => b);
assert.ok(vi[6].lines.some(l => l[0] === D.scoreWeights.adaptation + '% Ứng phó biến cố'), 'Cách chơi: nhãn tiếng Việt');
assert.ok(en[6].lines.some(l => l[0] === D.scoreWeights.adaptation + '% Shock response'), 'Cách chơi: nhãn tiếng Anh');

const html2d = read('lab/ho-chieu-sau-rieng.html');
assert.match(html2d, /adaptation: L\('Ứng phó biến cố', 'Shock response'\)/, 'bản thẻ: partName');
assert.match(html2d, /<small>\$\{L\('Ứng phó biến cố', 'Shock response'\)\}<\/small><b class="num">\$\{nf\(g\.adapt\)\}/, 'bản thẻ: KPI màn kết quả');
assert.ok(!/L\('Thích ứng', 'Adaptation'\)/.test(html2d), 'bản thẻ: không còn nhãn cũ');

const lines = read('lab/ho-chieu-sau-rieng-3d.html').split('\n');
const tpl = JSON.parse(lines[lines.findIndex(l => l.trim() === '<script type="__bundler/template">') + 1]);
assert.match(tpl, /adaptation: 'Ứng phó biến cố'/, 'bản 3D: nhãn tiếng Việt (HUD, tổng kết, báo cáo)');
assert.match(tpl, /adaptation: 'Shock response'/, 'bản 3D: nhãn tiếng Anh');
assert.ok(!/adaptation: 'Thích ứng'/.test(tpl) && !/adaptation: 'Adaptability'/.test(tpl), 'bản 3D: không còn nhãn cũ');
// «Chỉ số thích nghi» của báo cáo vẫn giữ tên riêng
assert.match(tpl, /rpAdapt: 'Thích nghi'/);
console.log('durian-score-labels: ok');
