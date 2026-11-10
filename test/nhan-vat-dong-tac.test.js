// Bản thử «thêm động tác cho nhân vật» (10/11/2026): assets/models/nhan-vat/ceo-v2.glb là mô hình CEO có tám clip
// (Idle, Talk, Wave, Think, Cheer, Sit, Walk, Run) lấy tự động qua API Meshy. Kiểm tĩnh: tệp hợp lệ và đủ nhẹ, đủ clip, một bộ xương,
// la bàn cầm tay đã buộc cứng vào bàn tay phải (không còn bị kéo dài khi giơ tay), tệp gốc ceo.glb không đổi, script không chứa khóa API.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), R = f => path.join(ROOT, f), read = f => fs.readFileSync(R(f), 'utf8');
function glb(f) {
  const b = fs.readFileSync(R(f)); assert.equal(b.subarray(0, 4).toString(), 'glTF', f + ' không phải GLB');
  const ln = b.readUInt32LE(12); return { size: b.length, js: JSON.parse(b.subarray(20, 20 + ln).toString()), bin: b.subarray(20 + ln + 8) };
}
const v2 = glb('assets/models/nhan-vat/ceo-v2.glb'), js = v2.js;
assert.ok(v2.size > 5e5 && v2.size < 2e6, 'ceo-v2.glb nặng ' + (v2.size / 1e6).toFixed(2) + ' MB (cho phép 0,5–2 MB)');
assert.deepEqual(js.animations.map(a => a.name), ['Idle', 'Talk', 'Wave', 'Think', 'Cheer', 'Sit', 'Walk', 'Run'], 'đủ tám clip, đúng tên');
assert.equal(js.skins.length, 1); assert.equal(js.skins[0].joints.length, 24, 'một bộ xương 24 khớp');
assert.equal(js.images.length, 1); assert.equal(js.images[0].mimeType, 'image/jpeg', 'một lớp màu JPEG');
const names = js.skins[0].joints.map(i => js.nodes[i].name);
for (const a of js.animations) for (const c of a.channels) assert.ok(js.nodes[c.target.node], 'clip ' + a.name + ' trỏ tới nút không có');
// la bàn: ít nhất 400 đỉnh buộc 100% vào bàn tay phải
const p = js.meshes[0].primitives[0], SZ = { 5121: 1, 5123: 2, 5126: 4 };
function rows(i) {
  const a = js.accessors[i], v = js.bufferViews[a.bufferView], o = (v.byteOffset || 0) + (a.byteOffset || 0), sz = SZ[a.componentType], st = v.byteStride || sz * 4, out = [];
  const get = k => (a.componentType === 5126 ? v2.bin.readFloatLE(k) : sz === 2 ? v2.bin.readUInt16LE(k) : v2.bin.readUInt8(k));
  for (let k = 0; k < a.count; k++) out.push([0, 1, 2, 3].map(c => get(o + k * st + c * sz)));
  return out;
}
const J = rows(p.attributes.JOINTS_0), W = rows(p.attributes.WEIGHTS_0), tay = names.indexOf('RightHand');
assert.ok(tay >= 0, 'có xương RightHand');
const cung = J.filter((j, k) => j[0] === tay && W[k][1] === 0 && W[k][2] === 0 && W[k][3] === 0 && W[k][0] > 0).length;
assert.ok(cung >= 400, 'la bàn phải buộc cứng vào bàn tay phải: mới có ' + cung + ' đỉnh');
// bản thử hướng B (ceo-v3.glb): mô hình dựng lại từ ảnh mẫu mới, cùng tám clip, cùng bộ xương 24 khớp, có ảnh mẫu và prompt đi kèm
const v3 = glb('assets/models/nhan-vat/ceo-v3.glb');
assert.ok(v3.size > 5e5 && v3.size < 3e6, 'ceo-v3.glb nặng ' + (v3.size / 1e6).toFixed(2) + ' MB (cho phép 0,5–3 MB)');
assert.deepEqual(v3.js.animations.map(a => a.name), ['Idle', 'Talk', 'Wave', 'Think', 'Cheer', 'Sit', 'Walk', 'Run'], 'ceo-v3: đủ tám clip');
assert.equal(v3.js.skins[0].joints.length, 24, 'ceo-v3: bộ xương 24 khớp');
assert.deepEqual(v3.js.skins[0].joints.map(i => v3.js.nodes[i].name), names, 'ceo-v3 dùng cùng tên xương với ceo-v2 (mã game dùng chung được)');
assert.ok(fs.existsSync(R('assets/models/nhan-vat/nguon/ceo-huong-b.webp')), 'có ảnh mẫu của hướng B');
assert.ok(read('docs/prompt-nhan-vat-3d.md').includes('Hướng B'), 'có tệp prompt');
// thầy Tu Phan dựng lại từ ảnh mẫu «bản 2» (tu-v3.glb): cùng tám clip, cùng bộ xương; tệp gốc tu.glb không đổi
const tu = glb('assets/models/nhan-vat/tu-v3.glb');
assert.ok(tu.size > 5e5 && tu.size < 3e6, 'tu-v3.glb nặng ' + (tu.size / 1e6).toFixed(2) + ' MB (cho phép 0,5–3 MB)');
assert.deepEqual(tu.js.animations.map(a => a.name), ['Idle', 'Talk', 'Wave', 'Think', 'Cheer', 'Sit', 'Walk', 'Run'], 'tu-v3: đủ tám clip');
assert.deepEqual(tu.js.skins[0].joints.map(i => tu.js.nodes[i].name), names, 'tu-v3 dùng cùng tên xương với ceo-v2');
assert.ok(fs.existsSync(R('assets/models/nhan-vat/nguon/tu-dau-hoi-to-v3.webp')), 'có ảnh mẫu thầy Tu Phan bản 2');
assert.deepEqual(glb('assets/models/nhan-vat/tu.glb').js.animations.map(a => a.name), ['Idle', 'Talk', 'Walk'], 'tu.glb gốc không đổi');
assert.ok(read('assets/models/SOURCES.md').includes('tu-v3.glb'), 'SOURCES.md ghi nguồn tu-v3.glb');
// tệp gốc giữ nguyên ba clip; script không chứa khóa; có ghi nguồn
assert.deepEqual(glb('assets/models/nhan-vat/ceo.glb').js.animations.map(a => a.name), ['Idle', 'Talk', 'Walk'], 'ceo.glb gốc không đổi');
for (const f of ['scripts/3d/meshy-dong-tac.py', 'scripts/3d/glb-do-vat-cung.py', 'scripts/3d/meshy-dung-nhan-vat.py', 'scripts/3d/meshy-anh.py', 'docs/prompt-nhan-vat-3d.md']) assert.ok(!/msy_[A-Za-z0-9]{8,}/.test(read(f)), f + ': không được chứa khóa API');
assert.match(read('scripts/3d/meshy-dong-tac.py'), /os\.environ\['MESHY_API_KEY'\]/, 'khóa đọc từ biến môi trường');
assert.ok(read('assets/models/SOURCES.md').includes('ceo-v2.glb') && read('assets/models/SOURCES.md').includes('ceo-v3.glb'), 'SOURCES.md ghi nguồn ceo-v2.glb và ceo-v3.glb');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 824);
console.log('nhan-vat-dong-tac: ok');
