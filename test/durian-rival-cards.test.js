// Hộ Chiếu Sầu Riêng: thẻ giới thiệu 3 đối thủ AI đầu ván – kịch bản cố định đọc từ dữ liệu, nói rõ là mốc so sánh.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ctx = {}; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-data.js'), ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-core.js'), ctx);
const D = ctx.DurianData, C = ctx.DurianCore;

// 1. Hàm dùng chung: mỗi đối thủ một thẻ, kế hoạch 6 vụ và chia kênh đọc thẳng từ dữ liệu.
assert.equal(typeof C.rivalCard, 'function'); assert.equal(typeof C.rivalNote, 'function');
for (const rv of D.rivals) {
  const c = C.rivalCard(D, rv, (a, b) => a), e = C.rivalCard(D, rv, (a, b) => b);
  assert.equal(c.plan.length, rv.plan.length, rv.id + ': kế hoạch đủ 6 vụ');
  assert.equal(c.plan[0], D.priorities.find(p => p.id === rv.plan[0]).vi, rv.id + ': tên ưu tiên từ dữ liệu');
  const top = Object.keys(rv.alloc).sort((a, b) => rv.alloc[b] - rv.alloc[a])[0];
  assert.ok(c.alloc.startsWith(D.channels.find(x => x.id === top).emoji), rv.id + ': kênh lớn nhất đứng đầu');
  assert.ok(!c.alloc.includes(' 0%'), rv.id + ': không liệt kê kênh 0%');
  assert.ok(c.linked.includes(Math.round(rv.linked * 100) + '%'), rv.id + ': vùng liên kết');
  assert.ok(['Tuân thủ cao', 'Kênh và quy mô', 'Đi tắt'].includes(c.group), rv.id + ': nhóm có nhãn');
  assert.notEqual(e.style, c.style, rv.id + ': bản tiếng Anh khác');
}
assert.ok(C.rivalNote((a, b) => a).includes('không giành thị phần'), 'câu nói rõ đối thủ là mốc so sánh');
assert.ok(C.rivalNote((a, b) => b).includes('benchmark'));

// 2. Bản thẻ: thẻ đối thủ trong màn vụ, mở sẵn ở vụ 1, dùng chung hàm.
const html2d = read('lab/ho-chieu-sau-rieng.html');
assert.match(html2d, /<details class="refcard" id="rivalCards" \$\{n === 1 \? 'open' : ''\}>/);
assert.match(html2d, /RIVALS\.map\(r => DurianCore\.rivalCard\(D, rivalInfo\(r\.id\), L\)\)/);
assert.match(html2d, /\$\{DurianCore\.rivalNote\(L\)\}/);

// 3. Bản 3D: khung mở tự động khi bắt đầu ván, nút «Đối thủ» ở Bảng xếp hạng lớp, Esc, dùng chung hàm.
const lines = read('lab/ho-chieu-sau-rieng-3d.html').split('\n');
const tpl = JSON.parse(lines[lines.findIndex(l => l.trim() === '<script type="__bundler/template">') + 1]);
assert.match(tpl, /<sc-if value="\{\{ rv\.show \}\}">/);
assert.match(tpl, /this\.setState\(\{ rv: true, log: \[\], recorded: false, phase: 'play'/);
assert.match(tpl, /sc-camel-on-click="\{\{ openRv \}\}"[^>]*>\{\{ t\.rvBtn \}\}<\/div>/);
assert.match(tpl, /window\.DurianCore\.rivalCard\(window\.DurianData, x, tr2\)/);
assert.match(tpl, /note: window\.DurianCore\.rivalNote\(tr2\)/);
assert.match(tpl, /if \(e\.key === 'Escape'\) \{ if \(this\.state\.rv\) this\.setState\(\{ rv: false \}\);/);
assert.match(tpl, /rvTag: 'ĐỐI THỦ CỦA VÁN NÀY', rvBtn: '👥 Đối thủ'/);

console.log('durian-rival-cards: ok');
