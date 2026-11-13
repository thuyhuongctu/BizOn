/* Dựng lại / sửa ảnh minh họa sai lệch (rà soát 13/11/2026). Kiểm tĩnh: trang dùng tệp mới, tệp mới tồn tại,
 * ảnh gốc vẫn còn (không ghi đè), và các trang không bị khóa không quay lại tệp cũ.
 * Tệp game đang chờ giấy chứng nhận quyền tác giả (office-scene.js, app.js, bizon-characters.js, ben-phu-sa*.html,
 * brand-passport.html, Ho Chieu Thuong Hieu 3D.html, BizOn Game 3D.html…) cố ý chưa đổi nên không kiểm ở đây. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const ROOT = path.join(__dirname, '..');
const R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const co = f => fs.existsSync(path.join(ROOT, f));
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };

// [trang, ảnh cũ, ảnh mới, lý do]
const DOI = [
  ['giang-vien.html', 'giang-vien/thang-diem-bat-nghiep.webp', 'giang-vien/thang-diem-bat-nghiep-v2.webp', 'chữ «BẤT NGHIỆP», vẽ lộ trình tốt nghiệp'],
  ['giang-vien.html', 'giang-vien/bang-giao-vien-bps.webp', 'giang-vien/bang-giao-vien-bps-v2.webp', '«BẾN PHÚ SA» sai dấu, lớp tiểu học, logo mạng xã hội'],
  ['lab/ho-chieu-sau-rieng-data.js', 'scenes/border.jpg', 'scenes/border-v2.webp', 'cổng cửa khẩu cắm cờ Thái Lan, chữ giả Hán'],
  ['lab/ho-chieu-sau-rieng-data.js', 'hc/durian/ky-hop-dong-cang.webp', 'hc/durian/ky-hop-dong-cang-v2.webp', 'cặp cờ Việt Nam – Thái Lan trên bàn ký'],
  ['lab/ho-chieu-sau-rieng-data.js', 'hc/durian/nem-thu-tai-cang.webp', 'hc/durian/nem-thu-tai-cang-v2.webp', 'cờ lạ trên bàn'],
  ['lab/ho-chieu-sau-rieng-data.js', 'hc/durian/ban-do-4-chang.webp', 'hc/durian/ban-do-4-chang-v2.webp', 'nhãn chữ tiếng Anh vô nghĩa'],
  ['giang-vien.html', 'giang-vien/bang-diem-csv.webp', 'giang-vien/bang-diem-csv-v2.webp', 'tên hãng thật Nike, Lego, Google, Rolex'],
  ['giang-vien.html', 'giang-vien/so-diem-dong-bang.webp', 'giang-vien/so-diem-dong-bang-v2.webp', 'trùng tệp với ảnh bảng điểm CSV, có tên hãng thật'],
  ['lab/ho-chieu-sau-rieng-data.js', 'hc/pipeline/harvest.webp', 'hc/pipeline/harvest-v2.webp', 'tách nền hỏng, người mất nửa thân'],
  ['lab/ho-chieu-sau-rieng-data.js', 'hc/pipeline/payment.webp', 'hc/pipeline/payment-v2.webp', 'mảng chậu cây lơ lửng trên laptop'],
  ['js/thu-vien-data.js', 'rivals/star.webp', 'rivals/star-v2.webp', 'mảnh đất sét thừa dưới chân'],
  ['js/thu-vien-data.js', 'firms/lam-viet-cut.webp', 'firms/lam-viet-cut-v2.webp', 'vệt mờ do tách nền'],
  ['js/thu-vien-data.js', 'hc/chain2/cast-doi-nguyen-cuu-vuon-v3.webp', 'hc/chain2/cast-doi-nguyen-cuu-vuon-v4.webp', 'quần, tóc bị khuyết'],
];
const KHUNG = ['ceo-cfo-revenue-targets', 'ceo-minh-long-expansion-compass-hstss', 'ceo-sec-market-checkpoint-hstss', 'goo-coo-production-planning',
  'holo-strategy-briefing', 'oee-logistics-tablet', 'sec-compliance-checklist', 'strategy-notes-podium', 'team-victory-celebration'];
for (const k of KHUNG) DOI.push(['js/thu-vien-data.js', k + '.webp', k + '-v2.webp', 'còn khung tối của ảnh chụp màn hình']);

// Đường dẫn trong mã → tệp trên đĩa
const tep = p => KHUNG.some(k => path.basename(p).startsWith(k)) ? 'assets/illustrations/' + path.basename(p)
  : /^(rivals|firms)\//.test(p) ? 'assets/character/' + p : 'assets/' + p;
const re = t => new RegExp("['\"/]" + t.replace(/[.\-]/g, m => '\\' + m) + "['\"]");
for (const [trang, cu, moi, ly] of DOI) {
  const s = R(trang), tenCu = path.basename(cu), tenMoi = path.basename(moi);
  check(s.includes(tenMoi) && !re(tenCu).test(s), trang + ': dùng ' + tenMoi + ' thay ' + tenCu + ' (' + ly + ')');
  check(co(tep(moi)) && co(tep(cu)), tep(moi) + ' có, ảnh gốc ' + tep(cu) + ' vẫn giữ');
}
// Bản tiếng Anh của Thư viện tra chú thích theo tên tệp: phải đổi cùng lúc
const en = R('js/thu-vien-data-en.js');
check(['rivals/star-v2.webp', 'firms/lam-viet-cut-v2.webp', 'cast-doi-nguyen-cuu-vuon-v4.webp'].concat(KHUNG.map(k => k + '-v2.webp')).every(t => en.includes(t)), 'thu-vien-data-en.js: khóa chú thích tiếng Anh đổi theo tên tệp mới');
// Bảng biểu cảm áo dài nam: bỏ dải chữ cụt ở đáy
check(R('js/thu-vien-clay.js').includes("k==='aodai-nam'?'-expressions-v2'") && co('assets/character/expressions/aodai-nam-expressions-v2.webp'), 'Thư viện: bảng biểu cảm áo dài nam dùng bản đã cắt dải chữ cụt');
// Chú thích: kho hàng sân bay không nằm trong nhóm cửa khẩu đường bộ; Tân Thanh và Hữu Nghị là hai cửa khẩu khác nhau
const d = R('lab/ho-chieu-sau-rieng-data.js');
const nhom = id => (new RegExp("\\{ id: '" + id + "'[\\s\\S]*?\\] \\}").exec(d) || [''])[0];
check(!nhom('border').includes('23-gacc-fast-track') && nhom('air').includes('23-gacc-fast-track'), 'Sầu Riêng: ảnh kho hàng không (PVG AIR CARGO HUB) chuyển sang nhóm «Đường hàng không»');
check(!d.includes('cửa khẩu quốc tế Tân Thanh – Hữu Nghị'), 'Sầu Riêng: chú thích không gộp Tân Thanh và Hữu Nghị thành một cửa khẩu');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(R('sw.js')) || [])[1] >= 849, 'sw.js ≥ bizon-v849');
if (fails) { console.error(fails + ' kiểm tra thất bại'); process.exit(1); }
console.log('anh-sua-lai: ok');
