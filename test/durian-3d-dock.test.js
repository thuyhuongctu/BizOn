// Hộ Chiếu Sầu Riêng 3D · «Trạm điều phối»: trên máy tính rộng (≥1180px) khi đang trong ván, ngăn kéo Văn phòng đội
// bên phải liệt kê 5 việc của vụ với trạng thái sống, thẻ biến cố nhỏ, dự báo, nút chốt; dải 4 chặng dưới đáy; HUD dịch chỗ;
// bảng đang xem phóng tới cỡ đọc được (tối đa 1:1) thay vì chỉ thu nhỏ.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const lines = fs.readFileSync(path.join(ROOT, 'lab/ho-chieu-sau-rieng-3d.html'), 'utf8').split('\n');
const tpl = JSON.parse(lines[lines.findIndex(l => l.trim() === '<script type="__bundler/template">') + 1]);

// 1. Điều kiện bật: máy tính rộng, đang trong ván, không ở toàn cảnh, không ở màn chọn vai. Hội thoại vẫn giữ ngăn kéo.
assert.match(tpl, /const dockOn = this\.dockOn = !!\(s\.ready && !s\.mobile && rootW >= 1180 && inGame && !s\.ov && !this\.needPick\(\)\);/);
assert.match(tpl, /<sc-if value="\{\{ dock\.show \}\}">\s*<div style="position:absolute;right:0;top:0;bottom:0;width:360px;box-sizing:border-box;z-index:3;/);

// 2. Năm việc theo đúng 4 tab của Văn phòng đội + chốt vụ; mỗi việc gắn vai và trạng thái từ dec.
assert.match(tpl, /\['chain', tr2\('Biến cố & chuỗi', 'Event & chain'\), 'sec', dec\.option != null, goTab\('chain'\)\]/);
assert.match(tpl, /\['intel', tr2\('Tin · mua tối đa 2 nguồn', 'Intel · buy up to 2'\), 'cmo', dec\.intel\.length > 0, goTab\('intel'\)\]/);
assert.match(tpl, /\['invest', tr2\('Đầu tư · một ưu tiên', 'Invest · one priority'\), 'cfo', !!dec\.priority, goTab\('invest'\)\]/);
assert.match(tpl, /\['channel', tr2\('Kênh · chia sản lượng', 'Channels · split output'\), 'cmo', !!dec\.chOk, \(\) => \{ this\.sfx\('click'\); this\.focusOn\('board-map'\); \}\]/);
assert.match(tpl, /\['commit', tr2\('Xem lại & chốt vụ', 'Review & commit'\), 'ceo', false, \(\) => \{ this\.sfx\('click'\); this\.setState\(\{ commit: true \}, \(\) => this\.focusOn\('board-hq'\)\); \}\]/);
assert.match(tpl, /const goTab = id => \(\) => \{ this\.sfx\('click'\); this\.setState\(\{ tab: id, commit: false \}, \(\) => this\.focusOn\('board-hq'\)\); \};/);
// việc đang chờ = việc đầu tiên chưa xong; nhật ký phản tư chưa ghi thì ưu tiên trước
assert.match(tpl, /let curIx = defs\.findIndex\(d => !d\[3\]\); if \(curIx < 0\) curIx = 4;/);
assert.match(tpl, /mainGo: \(\) => \{ this\.sfx\('click'\); if \(pr\) this\.openRf\(pr\.n\); else if \(allOk\) this\.setState\(\{ commit: true \}, \(\) => this\.focusOn\('board-hq'\)\); else this\.focusOn\('board-hq'\); \}/);
// thẻ biến cố nhỏ chỉ hiện khi chưa chọn cách ứng phó; chọn ngay trong ngăn kéo dùng cùng hàm pick của bảng biến cố
assert.match(tpl, /evShow: !!ev && dec\.option == null/);
assert.match(tpl, /<sc-for list="\{\{ ev\.opts \}\}" as="o" hint-placeholder-count="3"><span role="button" tabindex="0" sc-camel-on-click="\{\{ o\.pick \}\}"/);
// «Việc tiếp theo» và nút Việc của tôi / Hỏi Tèo Soi nằm trong ngăn kéo; bản nổi ẩn đi
assert.match(tpl, /nextShow: !!\(this\.goalTxt\), nextTxt: this\.goalTxt \|\| '', nextGo: \(\) => \{ const g2 = this\.goalNpc; if \(g2\) this\.talkTo\(g2\); \}/);
assert.match(tpl, /out\.askDisp = dockOn \? 'none' : 'flex'; out\.keysDisp = dockOn \? 'none' : 'flex'; out\.myTaskDisp = dockOn \? 'none' : 'flex';/);
assert.match(tpl, /if \(dockOn\) \{[\s\S]*?out\.goal = Object\.assign\(\{\}, out\.goal, \{ show: false \}\);\n    \}/);

// 3. Dải 4 chặng: số liệu sống (mã vùng trồng, mã đóng gói, cấp đông, kênh lớn nhất, kết quả vụ trước), ẩn khi đang xem bảng hoặc hội thoại.
assert.match(tpl, /out\.chain = \{ show: !s\.focus && !s\.talk, chips: \[/);
assert.match(tpl, /t: tr2\('CHẶNG 1 · VƯỜN', 'STAGE 1 · ORCHARD'\)/);
assert.match(tpl, /t: tr2\('CHẶNG 2 · NHÀ MÁY', 'STAGE 2 · PLANT'\), b: A\.pack \? tr2\('Đóng gói · PHC', 'Packing · PHC'\)/);
assert.match(tpl, /t: tr2\('CHẶNG 3 · CẢNG & KÊNH', 'STAGE 3 · PORT & CHANNELS'\), b: topCh \? chName\(topCh\) \+ ' ' \+ alloc\[topCh\] \+ '%'/);
assert.match(tpl, /t: tr2\('CHẶNG 4 · BÁN LẺ & KẾT QUẢ', 'STAGE 4 · RETAIL & RESULTS'\)/);
assert.match(tpl, /<sc-if value="\{\{ chain\.show \}\}">\s*<div style="position:absolute;left:184px;right:376px;bottom:16px;/);

// 4. HUD nhường chỗ: thanh trên, ô mục tiêu, nút gần trạm, hộp thoại; bảng đang xem kẹp trong phần không bị che và phóng tới 1:1.
assert.match(tpl, /<div ref="\{\{ tbRef \}\}" style="position:absolute;left:12px;right:\{\{ hudRight \}\};top:12px;/);
assert.match(tpl, /out\.hudRight = '376px'/);
assert.match(tpl, /out\.dlgLeft = dockOn \? 'calc\(50% - 180px\)' : '50%'; out\.dlgW = dockOn \? 'calc\(100% - 384px\)' : 'calc\(100% - 24px\)';/);
assert.match(tpl, /Wa = this\.dockOn \? W - 368 : W; k = Math\.max\(k, Math\.min\(1, \(Wa - 16\) \/ ew, \(H - top - 16\) \/ eh\)\); k = Math\.min\(k, \(Wa - 16\) \/ ew, \(H - top - 8\) \/ eh\);/);
assert.match(tpl, /cx = Math\.min\(Math\.max\(sx, 8 \+ hw\), \(this\.dockOn \? W - 368 : W\) - 8 - hw\);/);

// 5. Điện thoại và màn hẹp không đổi: ngăn kéo tắt, các nút nổi vẫn hiện.
assert.ok(tpl.includes("out.hudRight = dockOn ? '376px' : (s.mobile ? '16px' : '16px');"));

console.log('durian-3d-dock: ok');
