// Bật Nghiệp 3D («BizOn Game 3D.html») – mở đầu gọn: truyện + bốc thăm nằm trong cảnh 3D, tour dẫn thẳng tới bàn
// quyết định, dải nút gom 5 mục, ô «Việc tiếp theo», nhạc chủ đề «Mekong Sunfire · Rise With The River».
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const g3d = read('BizOn Game 3D.html');
const app = read('js/app.js');

// 1. Cầu nối tắt hai lớp phủ toàn khung của game.html (truyện 6 slide, bốc thăm) – bản 3D tự kể trong cảnh.
assert.match(g3d, /W\.showIntro = cb => \{ try \{ W\.localStorage\.setItem\('bizon-intro-seen', '1'\); \} catch \(e\) \{\} if \(cb\) cb\(\); \};/);
assert.match(g3d, /W\.maybeShowCaseDraw = cb => \{ if \(cb\) cb\(\); \};/);
// game.html vẫn giữ chuỗi gốc cho bản 2D.
assert.match(app, /const afterIntro = \(\) => maybeShowCaseDraw\(\(\) => maybeShowEventIntro\(\)\);/);

// 2. Tour của Lumina gộp truyện: 3 bước có ảnh minh hoạ, kể vốn 500 triệu, bàn C-Suite, 6 tỉnh và luật cắm cờ.
const t3 = g3d.slice(g3d.indexOf('const T3 = ['), g3d.indexOf('let t3i = 0;'));
assert.equal((t3.match(/\{ cam: /g) || []).length, 3, 'tour 3 bước');
assert.equal((t3.match(/pic: 'assets\/illustrations\/game\//g) || []).length, 3, 'mỗi bước một ảnh truyện');
for (const pic of ['workshop-lumina', 'team-portrait', 'mekong-capital']) assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets/illustrations/game', pic + '.webp')), pic);
assert.match(t3, /500 triệu ₫/);
assert.match(t3, /CEO chèo lái, CFO giữ két sắt, CMO đánh chiếm thị trường, COO vận hành xưởng, SEC ghi biên bản/);
assert.match(t3, /Cần Thơ → TP\. Hồ Chí Minh → Khánh Hòa → Đà Nẵng → Thanh Hóa → Hà Nội/);
assert.match(t3, /dẫn thị phần VÀ có lãi/);
assert.match(g3d, /\$\{i \+ 1\}\/\$\{T3\.length\}/, 'đếm bước theo độ dài T3');
assert.match(g3d, /<img class="pic" src="\$\{st\.pic\}" alt="">/);

// 3. Ván mới: tour → bốc thăm đầu mùa → thẻ biến cố → «Vào bàn quyết định» mở thẳng phòng bàn núm.
assert.match(g3d, /function event3D\(force\) \{/);
assert.match(g3d, /tourThen = \(\) => caseDraw3D\(event3D\); tour3D\(0\); return; \}/);
assert.match(g3d, /if \(!force && caseDraw3D\(event3D\)\) return;/);
assert.match(g3d, /function drawPending\(\) \{ const s = ev\('typeof S!=="undefined"\?S:null'\); return !!\(s && !s\.caseDrawn && s\.round === 1 && !\(s\.history \|\| \[\]\)\.length\); \}/);
assert.match(g3d, /function caseDraw3D\(then\) \{\s*if \(!drawPending\(\)\) return false;\s*ev\('S\.caseDrawn=true;save\(\)'\);/);
assert.match(g3d, /CASE_INFO_LIST\(\)\[S\.caseId\]\|\|CASE_INFO_LIST\(\)\.A/);
assert.match(g3d, /\['A', 'B', 'C'\]\.map\(k => `<i class="\$\{k === id \? 'hit' : ''\}">\$\{k\}<\/i>`\)/, 'ba lá thăm, lá trúng nổi bật');
assert.match(g3d, /id="cdGo"/);
assert.match(g3d, /pend \? T\('🎲 Bốc thăm đầu mùa', '🎲 Season draw'\) : T\('🎯 Vào bàn quyết định', '🎯 To the decision table'\)/);
assert.match(g3d, /q\('#t3End'\)\.onclick = \(\) => \{ if \(!done\(\)\) window\.__openTab\('decisions'\); \};/);
assert.match(g3d, /id="evGo">\$\{e\.cta \? e\.cta\.label : T\('🎯 Vào bàn quyết định', '🎯 To the decision table'\)\}/);
// Xem lại thẻ biến cố (force) không ghi lại trạng thái và không mở lại phòng đối đầu.
assert.match(g3d, /if \(!force\) ev\('S\.eventShownRound=S\.round;save\(\)/);
assert.match(g3d, /if \(!force\) setTimeout\(\(\) => \{ if \(window\.__EVON\) room3D\('faceoff'\); \}, 1400\);/);
// Diorama (xem tự do) không hiện bảng bốc thăm.
assert.match(g3d, /if \(DIORAMA\) \{ if \(then\) then\(\); return true; \}/);

// 4. Dải nút: 5 mục ở tầng trên (Tổng quan, Lumina, Phân tích, Công ty, Thêm); 19 nút cũ vẫn còn nguyên id/data-tab.
const rail = g3d.slice(g3d.indexOf('<div id="rail" class="hud">'), g3d.indexOf('<div id="more" '));
const top = rail.split('\n').filter(l => /^  <(button|div class="rg")/.test(l));
assert.equal(top.length, 5, 'năm mục tầng trên: ' + top.map(l => l.slice(0, 40)).join(' | '));
assert.equal((rail.match(/class="rg"/g) || []).length, 3);
for (const id of ['homeBtn', 'musicBtn', 'instructorBtn', 'openRes', 'tourBtn', 'langBtn', 'night', 'lowBtn', 'moreBtn', 'bMis', 'bCo']) assert.match(rail, new RegExp(`id="${id}"`), id);
for (const tab of ['advisor', 'reports', 'shop', 'skills', 'missions', 'achievements', 'leaderboard', 'minigame', 'profile', 'journal', 'settings']) assert.match(rail, new RegExp(`data-tab="${tab}"`), tab);
assert.equal((rail.match(/<button/g) || []).length + (rail.match(/<a /g) || []).length, 20 + 3, '20 nút cũ (19 button + 1 link) + 3 nút nhóm');
assert.match(rail, /class="btn rgb" aria-expanded="false" aria-controls="rgmPlan"/);
// Nút nhóm mở/đóng, bấm nút con hoặc bấm ra ngoài thì đóng; huy hiệu nhiệm vụ nhân đôi lên nút nhóm Công ty.
assert.match(g3d, /rail\.addEventListener\('click', e => \{ if \(e\.target\.closest\('\.rgm \.btn'\)\) closeGroups\(\); \}\);/);
assert.match(g3d, /addEventListener\('pointerdown', e => \{ if \(!rail\.contains\(e\.target\)\) closeGroups\(\); \}\);/);
assert.match(g3d, /\['bMis', 'bCo'\]\.forEach\(id => \{ const bm = document\.getElementById\(id\);/);
// CSS: bảng con hiện khi mở, nhãn trong bảng con luôn có chữ; điện thoại bung lên; phòng 3D bung sang phải; diorama giấu nhóm Công ty.
assert.match(g3d, /#rail \.rg\.open \.rgm\{display:flex\}/);
assert.match(g3d, /#rail \.rgm \.btn span\{display:inline!important\}/);
assert.match(g3d, /#rail>\.btn span,#rail \.rgb span\{display:none\} #rail \.rgb::after\{display:none\}\n    #rail \.rgm\{top:auto;bottom:calc\(100% \+ 10px\);right:auto;left:50%;transform:translateX\(-50%\)\} #rail #rgMore \.rgm\{left:auto;right:0;transform:none\}/);
assert.match(g3d, /body\.room #rail>\*:not\(#rgMore\)\{display:none!important\}/);
assert.match(g3d, /body\.room #rail \.rgm\{right:auto;left:calc\(100% \+ 10px\);top:auto;bottom:0\}/);
assert.match(g3d, /body\.diorama #cta,body\.diorama #rail \[data-tab\],body\.diorama #rgCo\{display:none!important\}/);
assert.doesNotMatch(g3d, /#rail\{[^}]*overflow-y:auto/, 'dải nút không còn cuộn (bảng con sẽ bị cắt)');

// 5. Ô «Việc tiếp theo» cạnh nút chính: 3 việc, việc 1 mở lại thẻ biến cố, việc 2 mở bàn quyết định; ẩn khi đã khóa/đã xong.
assert.match(g3d, /<div id="next" hidden><b data-en="NEXT UP">VIỆC TIẾP THEO<\/b><button type="button" class="st" id="ns1">/);
assert.match(g3d, /function paintNext\(s\) \{/);
assert.match(g3d, /box\.hidden = !!s\.finished \|\| !!s\.committed;/);
assert.match(g3d, /const cur = s\.eventShownRound < s\.round \? 0 : !s\.committed \? 1 : 2;/);
assert.match(g3d, /getElementById\('ns1'\)\.onclick = \(\) => \{ if \(GS && GS\.eventShownRound >= GS\.round && !GS\.committed\) event3D\(true\); \};/);
assert.match(g3d, /getElementById\('ns2'\)\.onclick = \(\) => \{ if \(GS && !GS\.committed && GS\.eventShownRound >= GS\.round\) window\.__openTab\('decisions'\); \};/);
assert.match(g3d, /paintNext\(s\);/);

// 6. Nhạc chủ đề: bài mở game của Bật Nghiệp là «Mekong Sunfire · Rise With The River», ghi tên trong bước chào của tour, có nút bật nếu đang tắt.
assert.match(app, /const BGM_TRACKS = \[\n  'assets\/audio\/bat-nghiep-mekong-sunfire-rise\.mp3'/);
assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets/audio/bat-nghiep-mekong-sunfire-rise.mp3')));
assert.match(g3d, /const THEME_SONG = 'Mekong Sunfire · Rise With The River';/);
assert.match(g3d, /class="song">🎵 <span>\$\{T\('Nhạc chủ đề', 'Theme song'\)\}: <b>\$\{THEME_SONG\}<\/b><\/span>\$\{musicOn\(\) \? '' : '<button class="btn" id="t3Music">/);
assert.match(g3d, /q\('#t3Music'\)\.onclick = \(\) => \{ try \{ ev\('toggleMusic\(\)'\); ev\('startMusic\(\)'\); \}/);

console.log('bn3d-onboarding: OK');

// 7. Bảng con đang mở nằm trên nút chính (điện thoại: dải nút ở dưới nút chính, bảng bung lên); điện thoại bỏ dòng phụ dưới nút chính.
assert.match(g3d, /body\.railopen #rail\{z-index:28\}/);
assert.match(g3d, /document\.body\.classList\.toggle\('railopen', groups\.some\(g => g\.classList\.contains\('open'\)\)\)/);
assert.match(g3d, /#cta small\{display:none\}/);
