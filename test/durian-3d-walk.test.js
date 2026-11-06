// Hộ Chiếu Sầu Riêng 3D: nhân vật (thẻ ảnh) đi bộ bằng bước chân «rối giấy», không nhảy.
// Trước đây cả thẻ ảnh bị nhấc lên 8–12 cm mỗi bước và «Bạn» đổi sang ảnh «chạy» thấp hơn, nên trông như nhảy.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '..', 'lab/ho-chieu-sau-rieng-3d.html'), 'utf8');

// hàm chung: chia lưới thẻ, chân trái/phải đưa ngược chiều dưới hông, tính từ position (không cần thuộc tính uv)
assert.match(html, /walkify\(mesh\) \{/);
assert.match(html, /new T\.PlaneGeometry\(W, H, 6, 16\)/);
assert.match(html, /float vx = position\.x \/ uW \+ 0\.5, vy = position\.y \/ uH \+ 0\.5, hip = 0\.44;/);
assert.match(html, /walkStep\(mesh, moving, ph\) \{/);
// gắn cho cả ba loại nhân vật: thợ, «Bạn», đội 5 vai/NPC
assert.equal((html.match(/this\.walkify\((card|m)\)/g) || []).length, 3, 'walkify cho thợ, «Bạn» và NPC');
assert.match(html, /this\.walkStep\(w\.card, moving, w\.step\)/);
assert.match(html, /this\.walkStep\(A\.card, mv, ph\)/);
assert.equal((html.match(/this\.walkStep\(n\.card, di,/g) || []).length, 2, 'NPC đi theo đội và NPC đi dạo');
// «Bạn» giữ một ảnh đứng khi đi; không còn nhấc cả thẻ lên khi bước
assert.match(html, /this\.avatarPose\('idle'\); \/\/ một ảnh đứng cho cả lúc đi/);
assert.doesNotMatch(html, /avatarPose\(mv && u\.tx\.run \? 'run' : 'idle'\)/);
assert.doesNotMatch(html, /Math\.abs\(Math\.sin\(w\.step\)\) \* 0\.09/);
assert.doesNotMatch(html, /Math\.abs\(Math\.sin\(now \/ 140 \+ fi\)\) \* 0\.1/);
assert.doesNotMatch(html, /Math\.abs\(Math\.sin\(now \/ 150 \+ n\.hz\)\) \* 0\.08/);
console.log('durian-3d-walk: ok');
