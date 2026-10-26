// Bến Phù Sa 3D · «Sa bàn đất sét»: chip «🧱 Sa bàn» phủ ảnh sa bàn (ngày tuần 1–3, đêm tuần 4–5) lên bản đồ 3D với 6 ghim
// địa điểm theo đúng thứ tự LOCS; bấm ghim = ftPick('loc', i); ghim nhấp nháy khi tới lượt chọn địa điểm; nhớ bật/tắt; khám phá thì tắt.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'ben-phu-sa-3d.html'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'js/bps-saban.js'), 'utf8');
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

// 1. Ảnh có thật, kích thước 688×384 (tỉ lệ khung .bps-sb-box)
['assets/bps/sa-ban-ngay.webp', 'assets/bps/sa-ban-dem.webp', 'assets/bps/sa-ban-cap-1.webp'].forEach(p => assert.ok(fs.existsSync(path.join(ROOT, p)), 'thiếu ' + p));
assert.match(js, /IMG = \{ day: 'assets\/bps\/sa-ban-ngay\.webp', night: 'assets\/bps\/sa-ban-dem\.webp' \}/);
assert.match(js, /function night\(\) \{ var s = S\(\); return !!s && s\.week >= 3; \}/);

// 2. 6 ghim theo thứ tự LOCS, bấm ghim chọn địa điểm qua ftPick, không chọn khi đang khám phá
assert.match(js, /PIN = \{ day: \[\[46, 60\], \[76, 57\], \[34, 30\], \[16, 50\], \[52, 20\], \[63, 36\]\], night: \[\[33, 58\], \[60, 60\], \[68, 28\], \[20, 35\], \[47, 20\], \[85, 33\]\] \}/);
assert.match(js, /for \(var i = 0; i < 6; i\+\+\)/);
assert.match(js, /if \(explore\) return; if \(typeof window\.ftPick === 'function'\) window\.ftPick\('loc', k\);/);
// nhấp nháy đúng quy tắc của bản đồ 3D (có phương thức ≠ khảo sát + có món, chưa có địa điểm); nhãn 🔥 đông / 🌧️ mưa bão như nhãn 3D
assert.match(js, /var need = s\.sel\.m !== null && s\.sel\.m !== 2 && s\.sel\.menu !== null && s\.sel\.loc === null;/);
assert.match(js, /i === storm \? ' · 🌧️ ' \+ T\('mưa bão', 'storm'\) : w0 >= 1\.1 \? ' · 🔥 ' \+ T\('đông', 'busy'\) : ''/);
assert.match(js, /p\.classList\.toggle\('bps-sb-sel', s\.sel\.loc === i\); p\.classList\.toggle\('bps-sb-need', need\);/);

// 3. Bật/tắt: chip trong thanh chế độ, nhớ localStorage, khám phá thì tắt, cập nhật theo sự kiện game
assert.match(html, /<button type="button" id="bps3d-mode-saban" class="bps3d-chip"[^>]*>🧱 Sa bàn<\/button>/);
assert.match(js, /KEY = 'bizon-bps-saban'/);
assert.match(js, /\['bps-pick', 'bps-week', 'bps-lang', 'bps-commit'\]\.forEach\(function \(n\) \{ addEventListener\(n, render\); \}\);/);
assert.match(js, /explore = !!\(e\.detail && e\.detail\.mode === 'explore'\); if \(explore\) set\(false\);/);
assert.match(js, /window\.BPSSaban = \{ set: set, toggle:/);
// lần đầu bật sẵn, sau đó nhớ theo người chơi
assert.match(js, /want = v == null \? true : v === '1';/);

// 4. Lớp phủ nằm ngay sau cảnh 3D (trước hàng chip tuần) để chip tuần và nút toàn màn hình vẫn bấm được; giấu dòng gợi ý khi bật
const iSb = html.indexOf('<div id="bps-saban"'), i3d = html.indexOf('<div id="bps3d" '), iTod = html.indexOf('<span id="bps3d-tod"');
assert.ok(i3d < iSb && iSb < iTod, 'vị trí lớp sa bàn');
assert.match(html, /body\.bps-saban-on #bps3d-hint\{display:none!important\}/);
assert.match(html, /@keyframes bpsSbPulse/);
assert.match(html, /<script src="js\/bps-saban\.js"><\/script>/);
// màn mở đầu: ảnh sa bàn cấp 1 trong ô mục tiêu
assert.match(html, /<img src="assets\/bps\/sa-ban-cap-1\.webp"[^>]*class="w-full rounded-xl mb-3"/);

// 5. Service worker
assert.match(sw, /'\.\/js\/bps-saban\.js',/);

console.log('ben-phu-sa-saban: ok');
