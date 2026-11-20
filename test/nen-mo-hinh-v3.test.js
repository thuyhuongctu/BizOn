// Bản nén ceo-v4.glb, tu-v4.glb của hai mô hình tám động tác v3 (20/11/2026): tệp v3 còn nguyên; bản nén nhẹ hơn một nửa, cùng số tam
// giác, cùng bộ xương 24 khớp và tám clip; màu vẽ WebP, tọa độ nén bằng phần mở rộng GLTFLoader đọc sẵn (không meshopt, không draco).
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const doc = f => { const b = fs.readFileSync(R('assets/models/nhan-vat/' + f)); return { b, j: JSON.parse(b.subarray(20, 20 + b.readUInt32LE(12)).toString()) }; };
const tam = j => j.meshes.flatMap(m => m.primitives).reduce((a, p) => a + j.accessors[p.indices].count / 3, 0);
for (const id of ['ceo', 'tu']) {
  const g = doc(id + '-v3.glb'), n = doc(id + '-v4.glb');
  assert.ok(n.b.length < g.b.length * 0.6, id + '-v4 nhẹ hơn 40 %: ' + (n.b.length / 1e6).toFixed(2) + ' MB');
  assert.equal(tam(n.j), tam(g.j), id + ': cùng số tam giác');
  assert.deepEqual(n.j.animations.map(a => a.name), ['Idle', 'Talk', 'Wave', 'Think', 'Cheer', 'Sit', 'Walk', 'Run'], id + ': đủ tám clip');
  assert.equal(n.j.skins[0].joints.length, 24, id + ': bộ xương 24 khớp');
  assert.equal(n.j.images[0].mimeType, 'image/webp');
  assert.ok(n.j.extensionsUsed.includes('KHR_mesh_quantization') && !n.j.extensionsUsed.some(e => /meshopt|draco/i.test(e)), id + ': không cần bộ giải nén ngoài');
}
assert.match(read('assets/models/SOURCES.md'), /ceo-v4\.glb[\s\S]*tu-v4\.glb/);
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 921);
console.log('nen-mo-hinh-v3: ok');
