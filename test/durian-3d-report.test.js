// Hộ Chiếu Sầu Riêng 3D: màn «Báo cáo sau 6 vụ» – bù cho bản 3D những gì bản 2D đã có ở màn kết
// (chứng nhận cho ván có Mã lớp, dấu vết quyết định với chỉ số thích nghi, câu hỏi thảo luận, CSV đội–vụ).
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const zlib = require('node:zlib');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const html3d = fs.readFileSync(path.join(ROOT, 'lab/ho-chieu-sau-rieng-3d.html'), 'utf8');
const lines = html3d.split('\n');
const at = tag => { const i = lines.findIndex(l => l.trim() === '<script type="' + tag + '">'); assert.ok(i >= 0, 'bundle thiếu ' + tag); return JSON.parse(lines[i + 1]); };
const manifest = at('__bundler/manifest'), template = at('__bundler/template');
const decode = e => { const raw = Buffer.from(e.data, 'base64'); return e.compressed ? zlib.gunzipSync(raw) : raw; };

// 1. Hai tệp dùng chung toàn site được nhúng và nạp: cấu hình backend công khai và chứng nhận ĐHCT (như bản 2D nạp ../js/official-cert.js).
const ASSETS = { '5d1f0c7e-9a3b-4c2d-8e1f-0a1b2c3d4e5f': 'js/backend-config.js', '7e2a9b4c-1d3f-4a5b-9c6d-1e2f3a4b5c6d': 'js/official-cert.js' };
for (const [uuid, file] of Object.entries(ASSETS)) {
  assert.ok(manifest[uuid], file + ': chưa có trong manifest (chạy scripts/release/rebundle-ho-chieu-sau-rieng-3d.mjs)');
  assert.ok(decode(manifest[uuid]).equals(fs.readFileSync(path.join(ROOT, file))), file + ': bản nhúng khác tệp nguồn');
  assert.ok(template.includes('<script src="' + uuid + '"></script>'), file + ': template không nạp uuid ' + uuid);
}
const rebundle = fs.readFileSync(path.join(ROOT, 'scripts/release/rebundle-ho-chieu-sau-rieng-3d.mjs'), 'utf8');
for (const [uuid, file] of Object.entries(ASSETS)) assert.ok(rebundle.includes(`'${uuid}': '${file}'`), 'rebundle script thiếu ' + file);

// 2. Khung báo cáo, nút mở trên bảng tổng kết, lựa chọn trong hội thoại của Hương, Esc đóng khung.
assert.match(template, /<sc-if value="\{\{ rp\.show \}\}">/);
assert.match(template, /sc-camel-on-click="\{\{ openRp \}\}"[^>]*>\{\{ t\.report \}\}<\/div>/);
assert.match(template, /report: 'BÁO CÁO 6 VỤ', repTag: 'BÁO CÁO SAU 6 VỤ'/);
assert.match(template, /report: '6-SEASON REPORT', repTag: 'REPORT AFTER 6 SEASONS'/);
assert.match(template, /l: tr\('📊 Xem báo cáo sau 6 vụ', '📊 See the six-season report'\), fn: \(\) => \{ close\(\); this\.setState\(\{ rp: true/);
assert.match(template, /if \(e\.key === 'Escape'\) \{ if \(this\.state\.rp\) this\.setState\(\{ rp: false \}\);/);
assert.match(template, /out\.rp = this\.reportOut\(L, t, cls\);/);

// 3. Chứng nhận chỉ cho ván có Mã lớp của giảng viên (mã mặc định BIZON-01 không được cấp), tên lấy theo vị trí người chơi giữ.
assert.match(template, /realClass\(\) \{ const c = \(this\.state\.classCode \|\| ''\)\.trim\(\)\.toUpperCase\(\); return c && c !== 'BIZON-01' \? c : ''; \}/);
assert.match(template, /certName\(\) \{ const s = this\.state, me = s\.pos \? \(s\.names\[s\.pos\] \|\| ''\)\.trim\(\) : '';/);
assert.match(template, /async certDone\(\) \{\n\s+if \(!this\.realClass\(\)\) return;/);
assert.match(template, /window\.OfficialCert\.fetchConfig\(cls\)\.then\(cfg => window\.OfficialCert\.download\(\{ name: this\.certName\(\), courseCode: cfg\.course_code/);

// 4. Nhật ký vụ ghi lượt dự báo cuối cùng trước khi chốt, để bảng dấu vết so dự báo – thực tế.
assert.match(template, /notes: last\.notes, fc: s\.fcRes && s\.fcRes\.main && s\.fcRes\.main\.f \? s\.fcRes\.main\.f\.profit : null \};/);

// 5. Chỉ số thích nghi: chạy đúng hàm trong template với lịch sử giả.
const m = /adaptIdx\(h, k\) \{([\s\S]*?)\n  \}\n/.exec(template);
assert.ok(m, 'không tìm thấy adaptIdx trong template');
const ctx = { window: { DurianData: { channels: [{ id: 'CN' }, { id: 'BORDER' }, { id: 'DOM' }, { id: 'TW' }] } } };
vm.createContext(ctx);
const adaptIdx = vm.runInContext('(function (h, k) {' + m[1] + '\n})', ctx);
const dec = (priority, linked, alloc, intel) => ({ decision: { priority, linked, alloc, intel } });
const same = [dec('area', 0.3, { BORDER: 50, DOM: 40, TW: 10 }, ['depot']), dec('area', 0.3, { BORDER: 50, DOM: 40, TW: 10 }, ['depot'])];
assert.equal(adaptIdx(same, 2), 0, 'không đổi gì → 0');
const all = [dec('area', 0, { BORDER: 100 }, []), dec('pack', 1, { DOM: 100 }, ['depot'])];
assert.equal(adaptIdx(all, 2), 4, 'đổi hết bốn biến → 4 (mỗi biến tối đa 1)');
const half = [dec('area', 0.3, { BORDER: 50, DOM: 50 }, ['depot', 'tw']), dec('area', 0.3, { BORDER: 50, TW: 50 }, ['depot'])];
assert.ok(Math.abs(adaptIdx(half, 2) - 1) < 1e-9, 'đổi nửa cơ cấu kênh (0,5) + bỏ một trong hai nguồn tin (0,5) → 1');

console.log('durian-3d-report: ok');
