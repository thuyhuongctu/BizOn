// Hộ Chiếu Sầu Riêng 3D: nhân vật «Bạn» đổi dáng cậu bé / cô bé theo giới của vị trí C-suite người chơi thay.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// Dữ liệu: đủ 5 vị trí, mỗi vị trí có gender m/f đúng với nhân vật (Minh Long, Mạnh Chi nam; Bảo Ngọc, Thu Hà, Gia Hân nữ).
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-data.js'), ctx);
const team = ctx.window.DurianData.team;
assert.equal(JSON.stringify(team.map(m => [m.id, m.gender])), JSON.stringify([['ceo', 'm'], ['cmo', 'm'], ['coo', 'f'], ['cfo', 'f'], ['sec', 'f']])); // JSON vì mảng sinh trong vm khác realm

// Ảnh hai dáng có trong kho, nền trong suốt (webp có alpha).
for (const f of ['ban-non-la-dung-khong-de', 'ban-non-la-chay', 'ban-gai-non-la-dung-khong-de', 'ban-gai-non-la-di-cung-teo']) {
  assert.ok(fs.existsSync(path.join(ROOT, 'assets/hc/cast', f + '.webp')), 'thiếu ' + f);
}

// Bundle 3D: ME có hai bộ m/f, chọn qua meSet(pos); bảng xếp hạng và thẻ nhân vật cùng dùng meSet.
const b = read('lab/ho-chieu-sau-rieng-3d.html');
for (const need of ['static ME = {', "m: { idle: ['hc/cast/ban-non-la-dung-khong-de.webp'", "f: { idle: ['hc/cast/ban-gai-non-la-dung-khong-de.webp'",
  'static meSet(pos)', "m.gender === 'f' ? 'f' : 'm'", 'const me = Component.meSet(this.state.pos);', 'Component.meSet(s.pos).idle[0]', "(u.me || Component.ME.m)[k][1]"]) {
  assert.ok(b.includes(need), 'bundle 3D thiếu: ' + need);
}
assert.ok(!b.includes('Component.ME.idle'), 'không còn tham chiếu bộ ảnh cũ không phân giới');
console.log('durian-you-gender: ok');
