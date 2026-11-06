// Tranh «Thanh Long cưỡi mây»: ảnh nền bản v4 (06/11/2026: phóng gấp đôi 2752×1536 và làm nét viền từ v3, vì ảnh nền toàn màn hình BizOn Game 3D bị vỡ trên màn hình lớn).
// Bản v3 (05/11/2026: hai người vừa sửa làm nét và khớp màu với cả tranh; bìa Bật Nghiệp giữ trọn bề ngang, không cắt đuôi rồng).
// Trước đó, bản v2 cho người đứng đầu và cô áo xanh ngồi trên lưng rồng như cả đội.
// Mọi trang và dữ liệu phải dùng bản v2 (ba khổ: ảnh nền 1376×768, ảnh trang game 1100×614, bìa Bật Nghiệp 1280×800);
// ảnh gốc vẫn giữ trong kho (không ghi đè) nhưng không còn chỗ nào trỏ tới.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..');
const CU = ['rong-bay-doi-bizon.webp', 'dragon-hoa-rong.webp', 'bat-nghiep-3d.webp', 'rong-bay-doi-bizon-v2.webp', 'dragon-hoa-rong-v2.webp', 'bat-nghiep-3d-v2.webp', 'rong-bay-doi-bizon-v3.webp'];
const MOI = ['assets/illustrations/rong-bay-doi-bizon-v4.webp', 'assets/illustrations/game/dragon-hoa-rong-v3.webp', 'assets/covers/bat-nghiep-3d-v3.webp'];
for (const f of MOI) assert.ok(fs.statSync(path.join(ROOT, f)).size > 50000, 'thiếu ' + f);
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  if (['.git', 'node_modules', 'test', 'supabase'].includes(e.name)) continue;
  const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(html|js|jsx|css|json|md|webmanifest)$/.test(e.name)) files.push(p); } })(ROOT);
const con = [];
for (const p of files) { const s = fs.readFileSync(p, 'utf8'); for (const c of CU) if (new RegExp('(^|[/\'"( ])' + c.replace(/\./g, '\\.')).test(s)) con.push(path.relative(ROOT, p) + ' → ' + c); }
assert.deepEqual(con, [], 'còn trỏ tới ảnh rồng cũ');
const game3d = fs.readFileSync(path.join(ROOT, 'BizOn Game 3D.html'), 'utf8');
assert.ok(game3d.includes("url('assets/illustrations/rong-bay-doi-bizon-v4.webp')") && game3d.includes("achievements: 'rong-bay-doi-bizon-v4'"), 'màn đăng nhập, màn khởi động và phòng thành tích BizOn Game 3D dùng bản v4');
{ const b = fs.readFileSync(path.join(ROOT, 'assets/illustrations/rong-bay-doi-bizon-v4.webp')); assert.ok(b.length > 200000 && fs.existsSync(path.join(ROOT, 'assets/illustrations/rong-bay-doi-bizon-v3.webp')), 'v4 có, v3 giữ nguyên trong kho'); }
console.log('rong-bay-ngoi: ok (' + files.length + ' tệp)');
