// Hộ Chiếu Sầu Riêng 3D · «Sa bàn đất sét»: trong Toàn cảnh có tab «Ảnh sa bàn» (ảnh đất sét 8 chặng + 8 ghim + 4 doanh nghiệp,
// bấm ghim đi tới chặng; ghim gần người chơi nhấp nháy) và tab «3D xoay 360°»; nhớ lựa chọn. Thợ trong cảnh là thẻ ảnh người thật
// cắt nền (lật theo hướng đi, nhún khi bước) thay cho mô hình khối makeRig.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const lines = fs.readFileSync(path.join(ROOT, 'lab/ho-chieu-sau-rieng-3d.html'), 'utf8').split('\n');
const tpl = JSON.parse(lines[lines.findIndex(l => l.trim() === '<script type="__bundler/template">') + 1]);

// 1. Ảnh sa bàn: 8 ghim theo % ảnh, toạ độ thế giới của 8 chặng, tab và lớp phủ nằm TRƯỚC thanh trên (để thanh trên vẫn bấm được).
assert.match(tpl, /static SB_PIN = \[\[13\.3, 28\.5\], \[11, 41\], \[45\.8, 62\], \[38\.6, 29\.5\], \[64\.6, 46\], \[53\.8, 56\], \[72\.3, 64\.5\], \[57\.9, 18\.5\]\];/);
assert.match(tpl, /static Z8POS = \[\[-39, 31, 0\], \[-11, 22, 4\], \[-8, -50, 13\], \[-24, -50, 13\], \[-21, -22, 4\], \[24, -15, 3\], \[62, -21, 3\], \[34, -50, 9\.5\]\];/); // chỗ đứng nằm ngoài vòng va chạm của đồi, nhà máy, gian bán lẻ
assert.ok(tpl.indexOf('<sc-if value="{{ sb.show }}">') < tpl.indexOf('<div ref="{{ tbRef }}"'), 'lớp sa bàn phải đứng trước thanh trên');
assert.match(tpl, /<img src="\{\{ sb\.img \}\}" alt="" style="position:absolute;inset:0;width:100%;height:100%;border-radius:18px;display:block">/);
assert.match(tpl, /img: 'assets\/hc\/durian\/dao-8-chang\.webp'/);
assert.match(tpl, /const sbOn = this\.sbOn = !!\(s\.ov && s\.ready && s\.sb !== '3d'\)/);
assert.match(tpl, /tabs: \[\['img', tr2\('🧱 Ảnh sa bàn', '🧱 Clay model'\)\], \['3d', tr2\('🔄 3D xoay 360°', '🔄 3D turntable'\)\]\]/);
assert.match(tpl, /pulse: k === nearZ \? 'animation:srPulse 1\.3s ease-in-out infinite' : ''/);
assert.match(tpl, /@keyframes srPulse/);
// 4 doanh nghiệp liên minh → chặng tương ứng
assert.match(tpl, /tr2\('HTX Sầu Riêng Đắk Lắk', 'Dak Lak Durian Co-op'\), tr2\('Chặng 1–2 · vùng trồng PUC', 'Stages 1–2 · PUC orchard'\), 1\]/);
assert.match(tpl, /tr2\('XNK & Cảng TP\.HCM', 'HCMC Export & Seaport'\), tr2\('Chặng 6–8 · xe lạnh, cảng, bán lẻ', 'Stages 6–8 · reefer, port, retail'\), 7\]/);
// nhớ lựa chọn; bấm ghim: về nhân vật, đi qua cổng trước nếu đang đứng ngoài cổng
assert.match(tpl, /setSb\(v\) \{ this\.sfx\('click'\); this\.setState\(\{ sb: v \}\); try \{ localStorage\.setItem\('bizon-sr3d-saban', v\); \} catch \(e\) \{\} \}/);
assert.match(tpl, /if \(this\.player && this\.player\.position\.z > 31 && z < 31\) \{ this\.targetNext = fin; this\.target = new T\.Vector3\(2\.4, 0, 26\); \}/);
// né vật cản khi đi tới điểm đã chọn
assert.match(tpl, /if \(this\.detour && now < this\.detour\.until\) \{ const a = 1\.2,/);
assert.match(tpl, /if \(this\.targetNext\) \{ this\.target = this\.targetNext; this\.targetNext = null; \}/);
// khi sa bàn bật: ẩn bản đồ nhỏ + thanh phím, đổi dòng gợi ý
assert.match(tpl, /out\.showMini = s\.ready && !s\.focus && !s\.mobile && !this\.sbOn;/);
assert.match(tpl, /out\.keysDisp = dockOn \|\| this\.sbOn \? 'none' : 'flex';/);
assert.match(tpl, /if \(sbOn\) out\.ovHint = /);
// điện thoại: danh sách 8 chặng dưới ảnh; máy tính: nhãn cạnh ghim + 4 chip doanh nghiệp
assert.match(tpl, /<sc-if value="\{\{ sb\.narrow \}\}">\s*<div style="position:absolute;left:12px;right:12px;top:\{\{ sb\.listTop \}\};display:grid;grid-template-columns:1fr 1fr/);
assert.match(tpl, /<sc-if value="\{\{ sb\.wide \}\}">/);

// 2. Thợ = thẻ ảnh người thật: không còn makeRig trong initWorkers; ảnh nạp chung; lật/nhún trong tickWorkers.
const iw = tpl.slice(tpl.indexOf('  initWorkers() {'), tpl.indexOf('  tickWorkers(dt, now) {'));
assert.ok(!/makeRig\(/.test(iw), 'initWorkers không còn mô hình khối');
assert.match(iw, /const src = Component\.workerImg\(job, j\[1\], i\)/);
assert.match(iw, /this\.workerTex\(src\.p, tx => \{ const h = src\.h \|\| 1\.9, wd = h \* tx\.image\.width \/ tx\.image\.height;/);
const tw = tpl.slice(tpl.indexOf('  tickWorkers(dt, now) {'), tpl.indexOf('  layoutNpcs() {'));
assert.ok(!/w\.rig/.test(tw), 'tickWorkers không còn w.rig');
assert.match(tw, /w\.card\.rotation\.y = ry;/);
assert.match(tw, /if \(Math\.abs\(sx\) > 0\.25\) w\.flip = sx > 0 \? 1 : -1;/);
assert.match(tw, /w\.card\.scale\.x = w\.w \* w\.flip;/);
assert.match(tpl, /workerTex\(p, cb\) \{/);
// mọi ảnh thợ khai báo đều có thật trong kho
const m = tpl.match(/static WORKER_IMG = \{[\s\S]*?\n  \};/); assert.ok(m, 'WORKER_IMG');
const paths = Array.from(m[0].matchAll(/p: '([^']+)'/g)).map(x => x[1]);
assert.ok(paths.length >= 12, 'đủ dáng thợ: ' + paths.length);
paths.forEach(pp => assert.ok(fs.existsSync(path.join(ROOT, 'assets', pp)), 'thiếu ảnh ' + pp));
['harvest', 'carry', 'pack', 'load', 'guard', 'clean', 'sell'].forEach(j => assert.ok(new RegExp("job === '" + j + "'").test(tpl), 'workerImg thiếu ' + j));

console.log('durian-3d-saban: ok');
