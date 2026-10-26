// Bến Phù Sa 3D · dễ hiểu hơn: màn mở đầu rút gọn còn mục tiêu + 3 ý, luật chơi gập lại; tour spotlight 6 bước theo
// đúng vòng chơi (phương thức → món → điểm trên bản đồ → chốt → nhật ký), bước có cổng chỉ qua khi người chơi làm thật;
// điểm bản đồ nhấp nháy khi tới lượt chọn; tuần 1 giấu nút phụ (cửa hàng, chợ sỉ, đàm phán); chip «❓ Hướng dẫn» để xem lại.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'ben-phu-sa-3d.html'), 'utf8');
const tour = fs.readFileSync(path.join(ROOT, 'js/bps-tutorial.js'), 'utf8');
const scene = fs.readFileSync(path.join(ROOT, 'js/bps3d.js'), 'utf8');
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

// 1. Màn mở đầu: dải mục tiêu lên đầu, luật chơi cũ gập trong <details>, nút bắt đầu nói rõ có Lumina dẫn đường.
assert.match(html, /<div id="ft-goal"[^>]*>/);
assert.match(html, /5 tuần · mỗi tuần 3 quyết định · xếp hạng theo lợi nhuận/);
assert.match(html, /<details id="ft-rules"/);
assert.match(html, /Bắt đầu tuần 1 \(Lumina dẫn đường\)/);
assert.ok(html.indexOf('id="ft-goal"') < html.indexOf('id="ft-rules"'), 'mục tiêu phải đứng trước luật chơi');

// 2. Tour: tệp riêng, 6 bước, có cổng (chỉ qua khi làm thật), tự tiến theo sự kiện của game, nhớ đã xem.
assert.match(html, /<script src="js\/bps-tutorial\.js"><\/script>/);
assert.match(tour, /SEEN_KEY = 'bizon-bps-tour-seen'/);
assert.match(tour, /Làm bước này để đi tiếp/);
assert.match(tour, /addEventListener\('bps-pick'/);
assert.match(tour, /addEventListener\('bps-commit'/);
assert.match(tour, /window\.BPSTour = \{ auto: auto, replay: replay, close: stop, state:/);
assert.equal((tour.match(/sel: function/g) || []).length >= 6 || (tour.match(/\bsel:/g) || []).length >= 6, true, 'cần đủ 6 bước có selector');
// bước bản đồ nâng khung 3D lên trên lớp mờ ở máy tính; điện thoại chiếu vào ô «chưa chọn địa điểm»
assert.match(tour, /bps-tour-map/);
assert.match(tour, /#bps3d-pick/);

// 3. Trang nối tour với game: bật khi bắt đầu, lớp tuần 1 giấu nút phụ, gỡ sau lần chốt đầu, chip xem lại.
assert.match(html, /document\.body\.classList\.toggle\('bps-w1'/);
assert.match(html, /addEventListener\('bps-commit', function \(\) \{ document\.body\.classList\.remove\('bps-w1'\); \}\)/);
assert.match(html, /body\.bps-w1 #ft-shop-card,body\.bps-w1 #bps-hub-enter,body\.bps-w1 #bps-negot-enter\{display:none!important\}/);
assert.match(html, /body\.bps-tour-on #bps3d-coach\{display:none!important\}/);
assert.match(html, /<button type="button" id="bps3d-tour" class="bps3d-chip"[^>]*>❓ Hướng dẫn<\/button>/);
assert.match(html, /getElementById\('bps3d-tour'\)\.onclick = function \(\) \{ if \(window\.BPSTour\) BPSTour\.replay\(\); \}/);
assert.match(html, /if \(window\.BPSTour\) BPSTour\.auto\(\);/);

// 4. Cảnh 3D: điểm bản đồ nhấp nháy khi đã có phương thức + món mà chưa có địa điểm; chế độ tham quan nói rõ việc cần làm.
assert.match(scene, /need = !exploreMode && sel == null && g && g\.S\.sel\.m !== null && g\.S\.sel\.m !== 2 && g\.S\.sel\.menu !== null && g\.S\.sel\.loc === null/);
assert.match(scene, /s\.pad\.material\.opacity = need \? 0\.2 \+ 0\.18 \* Math\.sin\(t \* 3\.4 \+ i\) : 0/);
assert.match(scene, /Tham quan: bấm vào 8 cây bẹo/);

// 5. Service worker biết tệp tour mới.
assert.match(sw, /'\.\/js\/bps-tutorial\.js',/);

console.log('ben-phu-sa-3d-onboarding: ok');
