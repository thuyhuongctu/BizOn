// Hộ Chiếu Sầu Riêng 3D: nhân vật là đất sét 3D (makeClayRig) đi bằng chân, không còn thẻ ảnh phẳng nhảy lên xuống.
// Lịch sử: thẻ ảnh bị nhấc 8–12 cm mỗi bước (#1008 thêm bước chân «rối giấy»); nay «Bạn», thợ và NPC đều là nhân vật 3D.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '..', 'lab/ho-chieu-sau-rieng-3d.html'), 'utf8');

// dựng một lần mỗi kiểu rồi nhân bản (40 thợ + 18 NPC), tìm lại khớp chân tay theo thứ tự duyệt cây
assert.match(html, /clayRigFor\(o\) \{/);
assert.match(html, /static NPCSTYLE = \{/);
for (const id of ['ceo', 'cfo', 'cmo', 'coo', 'sec', 'huong', 'tuphan', 'basau', 'trader', 'bCN', 'bBORDER', 'bFROZEN', 'bTW', 'bJP', 'bDOM']) assert.match(html, new RegExp('\\b' + id + ': \\{ shirt: '), 'kiểu đất sét cho ' + id);
assert.match(html, /npcStyle\(id\) \{/); assert.match(html, /workerStyle\(job, i\) \{/);
// «Bạn»: nhân vật 3D hiện ra, không tạo thẻ ảnh
assert.match(html, /this\.rig = this\.makeClayRig\(Object\.assign\(\{\}, Component\.STYLE\.farmer, girl \?/);
assert.match(html, /this\.rig\.g\.visible = true;/);
assert.doesNotMatch(html, /this\.avatarCard = \{ g, card, ring \}/);
// thợ và NPC: nhân vật 3D, quay theo hướng đi, chân tay cử động bằng animRig
assert.match(html, /const rig = this\.clayRigFor\(this\.workerStyle\(job, i\)\)/);
assert.match(html, /this\.animRig\(w\.rig, moving, w\.step,/);
assert.match(html, /const rig = this\.clayRigFor\(this\.npcStyle\(id\)\)/);
assert.equal((html.match(/this\.animRig\(n\.rig, di \? 1 : 0,/g) || []).length, 2, 'NPC đi theo đội và NPC đi dạo');
assert.doesNotMatch(html, /this\.npcs\[id\]\.card = m/);
// không còn nhấc cả nhân vật lên khi bước
assert.doesNotMatch(html, /Math\.abs\(Math\.sin\(w\.step\)\) \* 0\.09/);
assert.doesNotMatch(html, /Math\.abs\(Math\.sin\(now \/ 140 \+ fi\)\) \* 0\.1/);
console.log('durian-3d-walk: ok');
