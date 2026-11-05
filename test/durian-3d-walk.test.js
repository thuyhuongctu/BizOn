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
// dáng đi kiểu phim hoạt hình: tay chân hai đốt có gối, khuỷu; gập gối khi đưa chân, khuỷu cong khi vung tay; người chỉ nhún ±2 cm
assert.match(html, /pv\.userData\.jt = jt; g\.add\(pv\); return pv;/);
assert.match(html, /kneeL: legL\.userData\.jt, kneeR: legR\.userData\.jt, elbowL: armL\.userData\.jt, elbowR: armR\.userData\.jt/);
assert.match(html, /r\.kneeL\.rotation\.x = mv \* \(0\.08 \+ Math\.max\(0, cs\) \* 0\.95\); r\.kneeR\.rotation\.x = mv \* \(0\.08 \+ Math\.max\(0, -cs\) \* 0\.95\);/);
assert.match(html, /r\.elbowL\.rotation\.x = -\(0\.22 \+ mv \* \(0\.1 \+ Math\.max\(0, -sn\) \* 0\.5\)\)/);
assert.match(html, /\(1 - Math\.abs\(sn\)\) \* 0\.02 - 0\.01/);
// giữ nhẹ: nhân vật nhân bản gộp khối theo đốt, lưới thưa (lod), không đổ bóng thật; thợ ở xa không vẽ
// (journey-3d.test.js hết giờ trên CI khi 59 nhân vật 3D chưa gộp: số lượt vẽ mỗi khung tăng 3,5 lần)
assert.match(html, /bakeRig\(r\) \{/);
assert.match(html, /const r = this\.makeClayRig\(Object\.assign\(\{\}, o, \{ lod: 1 \}\)\); this\.bakeRig\(r\);/);
assert.match(html, /const LD = o\.lod \? 0\.55 : 1/);
assert.match(html, /w\.g\.visible = dd0 < \(this\.low \? 34 : 48\);/);
// không còn nhấc cả nhân vật lên khi bước
assert.doesNotMatch(html, /Math\.abs\(Math\.sin\(w\.step\)\) \* 0\.09/);
assert.doesNotMatch(html, /Math\.abs\(Math\.sin\(now \/ 140 \+ fi\)\) \* 0\.1/);
console.log('durian-3d-walk: ok');
