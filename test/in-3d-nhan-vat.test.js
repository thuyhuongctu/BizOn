// Tệp in 3D nhân vật (assets/in-3d/, 21/11/2026): STL nhị phân hợp lệ, cao khoảng 10 cm, lưới kín (mỗi cạnh dùng đúng hai lần,
// hai chiều ngược nhau), một khối liền; có kịch bản dựng lại và hướng dẫn in.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
for (const f of ['tu-v3-10cm.stl', 'ceo-v3-10cm.stl']) {
  const b = fs.readFileSync(R('assets/in-3d/' + f)), n = b.readUInt32LE(80);
  assert.equal(b.length, 84 + n * 50, f + ': STL nhị phân đúng kích thước');
  const key = new Map(), id = o => { const k = b.toString('latin1', o, o + 12); let i = key.get(k); if (i === undefined) key.set(k, i = key.size); return i; };   // đỉnh chung có cùng 12 byte
  const canh = new Map(), lk = new Map(); let zmin = Infinity, zmax = -Infinity;
  const tim = a => { let r = a; while (lk.get(r) !== r) r = lk.get(r); while (a !== r) { const t = lk.get(a); lk.set(a, r); a = t; } return r; };   // nén đường đi
  for (let i = 0; i < n; i++) {
    const o = 84 + i * 50 + 12, v = [0, 1, 2].map(j => { const z = b.readFloatLE(o + j * 12 + 8); if (z < zmin) zmin = z; if (z > zmax) zmax = z; return id(o + j * 12); });
    for (const a of v) if (!lk.has(a)) lk.set(a, a);
    for (let j = 0; j < 3; j++) { const a = v[j], c = v[(j + 1) % 3], k = a * 4194304 + c; canh.set(k, (canh.get(k) || 0) + 1); lk.set(tim(a), tim(c)); }
  }
  let ho = 0; for (const [k, c] of canh) { const a = Math.floor(k / 4194304), d = k % 4194304; if (c !== 1 || canh.get(d * 4194304 + a) !== 1) ho++; }
  assert.equal(ho, 0, f + ': lưới kín, không cạnh hở');
  assert.ok(zmax - zmin > 95 && zmax - zmin < 110 && Math.abs(zmin) < 0.5, f + ': cao khoảng 10 cm, đáy chạm mặt in (' + (zmax - zmin).toFixed(1) + ' mm)');
  assert.equal(new Set([...lk.keys()].map(tim)).size, 1, f + ': một khối liền');
}
assert.match(read('scripts/3d/glb-thanh-stl.py'), /REMESH/);
assert.match(read('assets/in-3d/README.md'), /support/);
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 942);
console.log('in-3d-nhan-vat: ok');
