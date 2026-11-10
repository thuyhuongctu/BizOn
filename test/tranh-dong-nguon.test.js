// Hướng «tranh gốc thành hoạt hình» cho nhân vật Bến BizOn (10/11/2026): ảnh mẫu CEO không có la bàn (chị Hương yêu cầu bỏ) và công cụ
// tách nền xanh thành tờ sprite. Kiểm tĩnh: ảnh mẫu có mặt, đúng định dạng và đủ nhẹ; công cụ không chứa khóa, không gọi mạng; có ghi nguồn.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const MAU = ['ceo', 'cfo', 'cmo', 'coo', 'sec', 'lumina', 'tu', 'teo'].flatMap(n => [n + '-tranh-dong-truoc-v1.jpg', n + '-tranh-dong-sau-v1.jpg']);   // năm vai đội, hai cố vấn và rồng Tèo Soi
for (const f of MAU) {
  const b = fs.readFileSync(R('assets/models/nhan-vat/nguon/' + f));
  assert.ok(b[0] === 0xFF && b[1] === 0xD8, f + ' phải là JPEG (công cụ tạo video chỉ nhận JPG/PNG)');
  assert.ok(b.length > 20000 && b.length < 300000, f + ' nặng ' + Math.round(b.length / 1024) + ' KB (cho phép 20–300 KB)');
}
const py = read('scripts/3d/tach-nen-sprite.py');
assert.ok(!/msy_[A-Za-z0-9]{8,}|sk-[A-Za-z0-9]{12,}/.test(py), 'công cụ tách nền không được chứa khóa API');
assert.ok(!/urllib|requests|http\.client|socket/.test(py), 'công cụ tách nền không gọi mạng');
assert.match(py, /sys\.argv\[3\]/, 'tên sprite truyền qua tham số');
// tờ sprite đã làm (trả tiền để vẽ nên phải nằm trong kho): WebP hợp lệ, JSON khớp số khung, đủ nhẹ
const TD = 'assets/character/tranh-dong/', co = fs.readdirSync(R(TD)).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
for (const t of co) {
  const w = fs.readFileSync(R(TD + t + '.webp')), j = JSON.parse(read(TD + t + '.json')), dung = /-(dung|noi)$/.test(t);
  assert.ok(w.subarray(0, 4).toString() === 'RIFF' && w.subarray(8, 12).toString() === 'WEBP', t + '.webp phải là WebP');
  assert.ok(w.length < 600000, t + '.webp nặng ' + Math.round(w.length / 1024) + ' KB (cho phép < 600 KB)');
  assert.ok(j.khung >= 12 && j.khung <= j.cot * j.hang && j.cao === 256 && j.rong > 100, t + '.json: số khung và lưới hợp lệ');
  assert.ok(dung ? (j.quaLai === true && j.fps >= 6 && j.fps <= 12) : (j.fps === 24 && !j.quaLai), t + '.json: nhịp hợp với động tác (đứng/nói phát qua lại, đi phát vòng)');
}
// mọi tờ mà game khai báo (BO_TRANH) đều có trong kho
const td = read('js/ben-bizon-tranh-dong.js'), bo = /export const BO_TRANH = \{([\s\S]*?)\n\};/.exec(td)[1];
const khai = [...bo.matchAll(/(\w+): \[([^\]]*)\]/g)].flatMap(m => m[2].replace('...DI', "'di-truoc', 'di-ngang', 'di-sau'").match(/'[^']+'/g).map(x => m[1] + '-' + x.slice(1, -1)));
assert.ok(khai.length >= 16, 'BO_TRANH khai báo ít nhất bốn vai đội đủ bốn tờ (đang có ' + khai.length + ' tờ)');
for (const t of khai) assert.ok(co.includes(t), 'game khai báo tờ ' + t + ' nhưng kho chưa có');
assert.match(py, /xanh-duong/, 'công cụ tách được nền xanh dương (nhân vật mặc đồ xanh lá)');
const src = read('assets/models/SOURCES.md');
assert.ok(src.includes('ceo-tranh-dong-truoc-v1.jpg') && /bỏ la bàn/.test(src), 'SOURCES.md ghi nguồn ảnh mẫu và việc bỏ la bàn');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 827);
console.log('tranh-dong-nguon: ok');
