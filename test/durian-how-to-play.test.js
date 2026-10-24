// Hộ Chiếu Sầu Riêng: màn «Cách chơi 6 vụ» – luật rút thẳng từ dữ liệu và tham số (DurianCore.howToPlay),
// hiện ở bản thẻ (nút trên thanh đầu trang + thẻ ở màn mở đầu) và bản 3D (nút thanh trên, lựa chọn ở cổng).
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// 1. Hàm dùng chung: 7 mục, số liệu khớp tham số, song ngữ.
const ctx = {}; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-data.js'), ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-core.js'), ctx);
const D = ctx.DurianData, C = ctx.DurianCore;
assert.equal(typeof C.howToPlay, 'function', 'DurianCore.howToPlay');
const VI = C.howToPlay(D, (a, b) => a), EN = C.howToPlay(D, (a, b) => b);
assert.equal(VI.length, 7, '7 mục');
assert.equal(JSON.stringify(VI.map(s => s.title)), JSON.stringify(['Vòng chơi', 'Năm quyết định, mỗi vai một việc', 'Đầu tư gì, mở kênh gì', 'Sáu kênh bán', 'Tiền, vay và hao hụt', 'Đối thủ và cờ', 'Điểm tổng 0–100']));
const flat = VI.flatMap(s => s.lines.map(l => l.join(' | ')));
const cuts = D.seasons.map(s => Math.round((s.borderCut || 0) * 100) + '%').join(' → ');
assert.ok(flat.some(l => l.includes(cuts)), 'mức cắt tiểu ngạch lấy từ seasons: ' + cuts);
assert.equal(VI[2].lines.length, D.priorities.length, 'mỗi ưu tiên một dòng');
assert.ok(VI[2].lines.some(l => l[0].includes('3 tỷ')), 'chi phí cấp đông lấy từ params.priorityCost');
assert.equal(VI[3].lines.length, D.channels.length, 'mỗi kênh một dòng');
assert.ok(VI[3].lines.find(l => l[0].includes('Nhật Bản'))[1].includes('cần kiểm nghiệm'), 'Nhật Bản cần kiểm nghiệm (channels.needs)');
assert.ok(VI[3].lines.find(l => l[0].includes('chính ngạch'))[1].includes('mã vùng trồng + mã đóng gói'), 'chính ngạch cần hai mã');
assert.ok(flat.some(l => l.includes(String(D.params.creditLimit) + ' tỷ')), 'hạn mức vay lấy từ params');
assert.ok(flat.some(l => l.includes(Math.round(D.params.baseLoss * 100) + '%')), 'hao hụt lấy từ params');
assert.equal(VI[6].lines.length, Object.keys(D.scoreWeights).length + 1, 'mỗi tiêu chí điểm một dòng + huy hiệu');
assert.ok(VI[6].lines[0][0].startsWith(D.scoreWeights.profit + '% '), 'trọng số lợi nhuận lấy từ scoreWeights');
assert.ok(VI[5].lines[0][1].includes('không giành thị phần'), 'nói rõ đối thủ là mốc so sánh');
assert.equal(EN.length, 7); assert.notEqual(EN[0].title, VI[0].title, 'bản tiếng Anh khác bản tiếng Việt');
assert.ok(EN[0].lines[0][1].includes('2.5×'), 'tiếng Anh dùng dấu chấm thập phân');
assert.ok(VI[0].lines[0][1].includes('2,5 lần'), 'tiếng Việt dùng dấu phẩy thập phân');

// 2. Bản thẻ: nút, khung, thẻ ở màn mở đầu, cùng một hàm.
const html2d = read('lab/ho-chieu-sau-rieng.html');
assert.match(html2d, /<button class="tbtn" id="rulesBtn" type="button"><\/button>/);
assert.match(html2d, /<div id="rulesModal" class="rules-modal" hidden>/);
assert.match(html2d, /DurianCore\.howToPlay\(D, L\)/);
assert.match(html2d, /\$\('rulesBtn'\)\.onclick = openRules;/);
assert.match(html2d, /📘 Cách chơi 6 vụ', '📘 How to play the 6 seasons'\)\}<\/h2>/);

// 3. Bản 3D (template trong bundle): nút thanh trên, khung, lựa chọn ở cổng, Esc, cùng một hàm.
const lines = read('lab/ho-chieu-sau-rieng-3d.html').split('\n');
const ti = lines.findIndex(l => l.trim() === '<script type="__bundler/template">');
const tpl = JSON.parse(lines[ti + 1]);
assert.match(tpl, /sc-camel-on-click="\{\{ openHp \}\}"[^>]*>\{\{ t\.howTo \}\}<\/div>/);
assert.match(tpl, /<sc-if value="\{\{ hp\.show \}\}">/);
assert.match(tpl, /howTo: '📘 Cách chơi', hpTag: 'CÁCH CHƠI 6 VỤ'/);
assert.match(tpl, /howTo: '📘 How to play', hpTag: 'HOW TO PLAY THE 6 SEASONS'/);
assert.match(tpl, /window\.DurianCore\.howToPlay\(window\.DurianData, tr2\)/);
assert.match(tpl, /l: tr\('📘 Đọc cách chơi 6 vụ trước', '📘 Read how to play first'\), fn: \(\) => \{ close\(\); this\.setState\(\{ hp: true \}\); \}/);
assert.match(tpl, /if \(e\.key === 'Escape'\) \{ if \(this\.state\.hp\) this\.setState\(\{ hp: false \}\);/);

console.log('durian-how-to-play: ok');
