// Hộ Chiếu Sầu Riêng 3D: màn đầu dễ hiểu hơn – hướng dẫn 4 bước theo ngữ cảnh, nút biến cố nói rõ «trả lời ngay»,
// thanh trên gom nút phụ sau «⋯ Thêm» khi vào vụ, ảnh biến cố mờ thay bằng ảnh nét, ảnh mới cho kênh/chuỗi lạnh.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const lines = read('lab/ho-chieu-sau-rieng-3d.html').split('\n');
const tpl = JSON.parse(lines[lines.findIndex(l => l.trim() === '<script type="__bundler/template">') + 1]);

// 1. Nút trên bảng biến cố: mở Văn phòng đội ngay (goHq), nhãn không còn gợi ý phải đi bộ.
assert.match(tpl, /eventGo: 'Trả lời ngay · mở Văn phòng đội'/);
assert.match(tpl, /eventGo: 'Respond now · open the team office'/);
assert.ok(!tpl.includes('Đến Văn phòng đội để trả lời'));
assert.match(tpl, /sc-camel-on-click="\{\{ goHq \}\}"[^>]*>\{\{ t\.eventGo \}\}<\/div>/);

// 2. Hướng dẫn 4 bước theo ngữ cảnh: 2 bước ở cổng, bước 3 ở bảng biến cố, bước 4 ở Văn phòng đội.
assert.match(tpl, /\['Ván chơi 6 vụ', '[^']*6 vụ \(2022–2025\)[^']*cắm được cờ\.'\]/);
assert.match(tpl, /\['Đi lại và nói chuyện', '[^']*«Việc tiếp theo»[^']*'\]/);
assert.match(tpl, /\['Mỗi vụ mở đầu bằng một biến cố', '[^']*không cần đi bộ[^']*'\]/);
assert.match(tpl, /\['Văn phòng đội: 4 việc rồi chốt', '[^']*Chuỗi \(nguồn hàng\), Tin \(mua thông tin\), Đầu tư, Kênh \(chia sản lượng\)[^']*'\]/);
assert.match(tpl, /\['A six-season game', /); assert.match(tpl, /\['Team office: 4 jobs, then commit', /);
assert.match(tpl, /const tutDue = ti == null \? false : ti < 2 \? s\.phase !== 'play' : ti === 2 \? s\.focus === 'board-event' : s\.focus === 'board-hq';/);
assert.match(tpl, /show: tutDue && !s\.talk && !s\.lb && !s\.rv && !s\.hp && !s\.jr && !s\.rp && !s\.ov && !this\.needPick\(\)/, 'không che thẻ đối thủ, cách chơi, nhật ký, báo cáo, toàn cảnh');
assert.match(tpl, /nextL: ti === 1 \? tr2\('Bắt đầu', 'Start'\) : ti < 3 \? tr2\('Tiếp', 'Next'\) : tr2\('Bắt đầu chơi', 'Start playing'\)/);
assert.match(tpl, /if \(out\.tut\.show\) out\.goal = Object\.assign\(\{\}, out\.goal, \{ show: false \}\);/, 'ô Việc tiếp theo chỉ ẩn khi thẻ hướng dẫn đang hiện');
// vị trí thẻ: đang nhìn bảng thì kê sang mép (máy tính) hoặc xuống đáy (điện thoại); template nhận {{ tut.pos }}
assert.match(tpl, /const tutPos = s\.focus \? \(s\.mobile \? 'left:12px;right:12px;bottom:76px;width:auto;' : 'left:12px;top:' \+ \(\(s\.tbH \|\| 56\) \+ 10\) \+ 'px;max-width:360px;'\)/);
assert.match(tpl, /box-shadow:0 20px 40px -16px rgba\(0,0,0,\.5\);\{\{ tut\.pos \}\}">/);
assert.ok(!tpl.includes('{{ tut.top }}'));
// ván lưu đang giữa vụ mà chưa xem hướng dẫn: nhảy tới bước 3, không hiện hai bước ở cổng
assert.match(tpl, /if \(!tutDone && sv\.phase === 'play'\) this\.pending\.tut = 2;/);
// ảnh bước 1 là bộ ba nhân vật
assert.match(tpl, /ti === 0 \? 'assets\/hc\/durian\/bo-ba-trang\.webp'/);

// 3. Thanh trên: nút phụ gom sau «⋯ Thêm» từ lúc vào vụ (máy tính) và ☰ (điện thoại); «Cách chơi» luôn thấy trên máy tính.
assert.match(tpl, /const lean = \(s\.mobile \|\| s\.phase === 'play'\) && !s\.menu;/);
assert.match(tpl, /out\.mItem = lean \? 'none' : 'block'; out\.mItemF = lean \? 'none' : 'flex'; out\.hpDisp = s\.mobile \? out\.mItem : 'block'; out\.menuBtn = s\.mobile \|\| s\.phase === 'play';/);
assert.match(tpl, /out\.menuL = s\.mobile \? \(s\.menu \? '✕' : '☰'\) : s\.menu \? tr2\('✕ Thu gọn', '✕ Less'\) : tr2\('⋯ Thêm', '⋯ More'\);/);
assert.match(tpl, /out\.songDisp = s\.mobile \|\| lean \? 'none' : 'flex';/);
assert.match(tpl, /<sc-if value="\{\{ menuBtn \}\}"><div role="button" tabindex="0" sc-camel-on-click="\{\{ toggleMenu \}\}"/);
assert.match(tpl, /sc-camel-on-click="\{\{ openHp \}\}" style="display:\{\{ hpDisp \}\};/);
assert.match(tpl, /else if \(this\.state\.menu\) this\.setState\(\{ menu: false \}\); else this\.unfocus\(\); return; \}/, 'Esc đóng «Thêm»');
// các nút chính của vụ không bị gom
assert.match(tpl, /sc-camel-on-click="\{\{ goHq \}\}" style="cursor:pointer;white-space:nowrap;flex-shrink:0;border/);
assert.match(tpl, /sc-camel-on-click="\{\{ goMap \}\}" style="cursor:pointer;white-space:nowrap;flex-shrink:0;border/);

// 4. Ảnh biến cố: ba ảnh mờ (green, pricewar, data) không còn dùng; đường dẫn đầy đủ dưới assets/.
assert.match(tpl, /static EVIMG = \{ break: 'hc\/event\/betray\.webp', pest: 'hc\/event\/defect\.webp', glut: 'hc\/durian\/an-duoi-goc-cay\.webp', residue: 'hc\/event\/held\.webp', fake: 'hc\/event\/copy\.webp', rain: 'hc\/durian\/tau-bao\.webp', salinity: 'hc\/event\/port\.webp', thaidrought: 'hc\/scene\/xep-hang-mua\.webp' \};/);
assert.match(tpl, /img: 'assets\/' \+ \(Component\.EVIMG\[ev\.id\] \|\| 'hc\/event\/betray\.webp'\)/);
for (const bad of ['hc/event/green.webp', 'hc/event/pricewar.webp', 'hc/event/data.webp']) assert.ok(!tpl.includes(bad), 'còn ảnh mờ ' + bad);
// bảng kênh dùng ảnh mới; ảnh thắng vụ có bản cô bé khi người chơi giữ vai nữ
assert.match(tpl, /CN: 'hc\/durian\/tau-keo-roi-cang\.webp', BORDER: 'hc\/chain2\/21-xe-lanh-cua-khau-huu-nghi\.webp', FROZEN: 'hc\/durian\/nha-may-che-bien-phc\.webp', TW: 'hc\/durian\/tau-ca-heo\.webp', JP: 'hc\/durian\/tau-dem-cuc-quang\.webp', DOM: 'hc\/durian\/cua-hang-durian-passport\.webp'/);
assert.match(tpl, /Component\.meSet\(s\.pos\) === Component\.ME\.f \? 'assets\/hc\/durian\/' \+ \['co-be-dut-rong', 'co-be-rong-an'\]\[r\.n % 2\] \+ '\.webp'/);
// mọi ảnh hc/durian được nhắc tới đều có trên đĩa
const ctx = {}; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-data.js'), ctx);
const D = ctx.DurianData;
const used = new Set([...tpl.matchAll(/hc\/durian\/[a-z0-9-]+\.webp/g)].map(m => m[0]).concat([...tpl.matchAll(/'assets\/hc\/durian\/' \+ \[([^\]]+)\]/g)].flatMap(m => m[1].split(',').map(x => 'hc/durian/' + x.trim().replace(/'/g, '') + '.webp'))));
D.chain2.stages.forEach(st => st.items.forEach(it => { if (it.img.startsWith('hc/durian/')) used.add(it.img); }));
D.eightSteps.steps.forEach(st => { if (st.img && st.img.startsWith('hc/durian/')) used.add(st.img); });
assert.ok(used.size >= 24, 'ít nhất 24 ảnh mới được dùng, thấy ' + used.size);
used.forEach(img => assert.ok(fs.existsSync(path.join(ROOT, 'assets', img)), 'thiếu ' + img));
const onDisk = fs.readdirSync(path.join(ROOT, 'assets/hc/durian')).filter(f => f.endsWith('.webp'));
onDisk.forEach(f => assert.ok(used.has('hc/durian/' + f), 'ảnh chưa dùng tới: ' + f));
// bước 6 quy trình 8 bước nay có ảnh; chuỗi lạnh có thêm ảnh tàu, xe, vườn
assert.equal(D.eightSteps.steps.find(s => s.n === 6).img, 'hc/durian/cau-container.webp');
assert.ok(D.chain2.stages.find(s => s.id === 'rail-sea').items.some(it => it.img === 'hc/durian/tau-bao.webp'));
assert.equal(D.chain2.stages.find(s => s.id === 'farm').items[0].img, 'hc/durian/ban-do-4-chang.webp', 'chặng Tại vườn mở đầu bằng bản đồ 4 chặng');

console.log('durian-3d-onboarding: ok');
