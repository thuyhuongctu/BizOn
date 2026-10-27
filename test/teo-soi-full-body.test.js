// Tèo Soi chỉ hiện bằng ảnh đứng đủ người (thấy chân). Bỏ ảnh bị cắt ngang bụng (teo-soi/lick) và các ảnh
// rồng ngồi sau bàn/quầy/máy/thuyền (livestream, analyst, brix, cold-check, customs, envoy, judge, packing,
// pilot, captain, stall, keynote, boat*) khỏi Hộ Chiếu Sầu Riêng 3D và Thư viện. Tệp ảnh gốc giữ nguyên.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const lines = read('lab/ho-chieu-sau-rieng-3d.html').split('\n');
const tpl = JSON.parse(lines[lines.findIndex(l => l.trim() === '<script type="__bundler/template">') + 1]);

const NOT_FULL = ['lick', 'livestream', 'analyst', 'brix', 'cold-check', 'customs', 'envoy', 'judge', 'packing', 'pilot', 'captain', 'stall', 'keynote', 'boat', 'boat-hat', 'boat-scarf'];
const keys = new Set();
const dimg = tpl.match(/static DIMG = \{[\s\S]*?\n  \};/)[0];
for (const m of dimg.matchAll(/'([a-z0-9-]+)'/g)) keys.add(m[1]);
const ts = tpl.match(/static TS = \[([^\]]*)\]/)[1];
for (const m of ts.matchAll(/'([a-z0-9-]+)'/g)) keys.add('ts-' + m[1]);
const sprite = tpl.match(/keys = \[([^\]]*)\];\n    keys\.forEach/)[1];
for (const m of sprite.matchAll(/'([a-z0-9-]+)'/g)) keys.add(m[1]);
for (const m of tpl.matchAll(/'(ts-[a-z0-9-]+)'/g)) keys.add(m[1]);

for (const k of keys) {
  const bare = k.replace(/^ts-/, '');
  if (k.startsWith('hc-') || k === 'board-hq') continue;
  assert.ok(!NOT_FULL.includes(bare), 'Tèo Soi không đủ người vẫn được dùng: ' + k);
  const f = k.startsWith('ts-') ? 'assets/dragon/teo-soi/' + bare + '.webp' : 'assets/dragon/' + k + '.png';
  assert.ok(fs.existsSync(path.join(ROOT, f)), 'thiếu ảnh ' + f);
}
for (const k of ['ts-lick', "'livestream'", "'envoy'", "'boat-scarf'"]) assert.ok(!tpl.includes(k), 'mẫu 3D còn ' + k);
assert.match(tpl, /'ts-eat', 'ts-good-job', 'ts-high-five'/);
assert.match(tpl, /\/DOM\|sell\/\.test\(nr\) \? 'ts-heart'/);

// Thư viện không liệt kê ảnh bị cắt ngang
assert.ok(!read('js/thu-vien-data.js').includes('teo-soi/lick') && !read('js/thu-vien-data-en.js').includes('teo-soi/lick'), 'Thư viện còn teo-soi/lick');
// không xóa ảnh gốc
assert.ok(fs.existsSync(path.join(ROOT, 'assets/dragon/teo-soi/lick.webp')));
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 692, 'sw.js nâng phiên bản bộ nhớ đệm');
console.log('teo-soi-full-body: ok (' + keys.size + ' khóa ảnh)');
