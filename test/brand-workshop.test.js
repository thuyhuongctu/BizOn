'use strict';
// Xưởng Nhãn Hiệu (xuong-nhan-hieu.html): bài tập chương 5 Khởi sự doanh nghiệp, Lumina góp ý theo luật.
// Kiểm luật góp ý trong Node (không cần trình duyệt) và các chỗ nối tĩnh: thứ tự nạp, sw.js, sitemap, trang giảng viên.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const D = require('../js/brand-workshop-data.js');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const ids = w => D.gopY(w).map(x => x.id);
const muc = (w, id) => (D.gopY(w).find(x => x.id === id) || {}).muc;

// --- bài trống: mọi phần đề bài yêu cầu đều báo «thiếu», mức hoàn thành 0 ---
{ const w = D.trong(); const thieu = D.gopY(w).filter(x => x.muc === 'thieu').map(x => x.id);
  assert.deepEqual([...thieu].sort(), [...D.BAT_BUOC].sort()); assert.deepEqual(D.hoanThanh(w), { xong: 0, tong: D.BAT_BUOC.length }); }
// mọi lời góp ý có đủ hai thứ tiếng, và cùng bài làm thì cùng lời góp ý (tất định)
function mau() {
  const w = D.trong();
  Object.assign(w.sp, { nhom: 'nong-san', ten: 'Kẹo dừa (Bến Tre)', noi: 'Bến Tre', thuocTinh: ['nguon-goc', 'cong-thuc'],
    moTa: 'Kẹo dừa nấu từ nước cốt dừa Bến Tre theo công thức gia đình ba đời, ít đường, gói giấy gạo, hộp in tranh làng nghề.' });
  Object.assign(w.nh, { ten: 'Bà Tư Dừa', slogan: 'Ngọt như chuyện quê', traTrung: 'da-tra', ketQuaTra: 'khong-trung',
    giaiThich: 'Tên gợi người làm kẹo ở làng nghề Bến Tre nên khách nhớ ngay, hợp với khách trẻ mua quà cho gia đình; chi phí xây dựng thấp vì câu chuyện có sẵn, không cần quảng cáo lớn khi vốn còn ít.' });
  Object.assign(w.gia, { chienLuoc: 'gia-tri', von: '30000', ban: '55000', doiThu: '50000' });
  w.kenh.chon = ['san-tmdt', 'hoi-cho']; w.qb.chon = ['cau-chuyen', 'video-ngan', 'dung-thu'];
  w.qb.keHoach = 'Tháng đầu: quay video ngắn ở lò kẹo mỗi tuần, cho dùng thử ở hội chợ trường, mở gian hàng trên sàn với hộp quà Tết.';
  return w;
}
{ const g = D.gopY(mau()); for (const x of g) { assert.ok(x.vi && x.en, x.id); assert.ok(['thieu', 'canh-bao', 'goi-y', 'tot'].includes(x.muc), x.id); }
  assert.deepEqual(D.gopY(mau()), g, 'tất định'); }
// bài mẫu tốt: đủ 13/13 phần, không cảnh báo nào
{ const w = mau(); assert.deepEqual(D.hoanThanh(w), { xong: 13, tong: 13 });
  assert.deepEqual(D.gopY(w).filter(x => x.muc === 'canh-bao').map(x => x.id), []);
  for (const id of ['nh-tra-ok', 'l-ca-hai-ok', 'g-bien']) assert.equal(muc(w, id), 'tot', id); }

// --- từng luật ---
{ const w = mau(); w.nh.ten = 'Xanh Sạch'; assert.equal(muc(w, 'nh-chung'), 'canh-bao', 'tên chỉ gồm từ chung (ví dụ trong slide gợi ý)'); }
{ const w = mau(); w.nh.ten = 'Đặc Sản Quê'; assert.equal(muc(w, 'nh-chung'), 'canh-bao'); }
{ const w = mau(); w.nh.ten = 'Kẹo dừa'; assert.equal(muc(w, 'nh-trung-sp'), 'canh-bao', 'tên = tên gọi chung của sản phẩm'); }
{ const w = mau(); w.nh.ten = 'Một Hai Ba Bốn Năm'; assert.equal(muc(w, 'nh-dai'), 'canh-bao'); }
{ const w = mau(); w.nh.traTrung = 'chua'; assert.equal(muc(w, 'nh-tra'), 'goi-y'); w.nh.traTrung = 'da-tra'; w.nh.ketQuaTra = 'gan-giong'; assert.equal(muc(w, 'nh-gan'), 'canh-bao'); }
{ const w = mau(); w.nh.slogan = 'Hướng tới tương lai xanh'; assert.equal(muc(w, 'nh-slogan-chung'), 'canh-bao'); }
{ const w = mau(); w.nh.slogan = 'một hai ba bốn năm sáu bảy tám chín mười mười một'; assert.equal(muc(w, 'nh-slogan-dai'), 'canh-bao'); }
{ const w = mau(); w.nh.giaiThich = 'Tên dễ nhớ.'; assert.ok(['nh-giai-thich-ngan', 'nh-cho-ai', 'nh-dia-phuong'].every(i => ids(w).includes(i))); }
{ const w = mau(); w.sp.moTa = 'Cung cấp sản phẩm chất lượng cao, đáp ứng nhu cầu khách hàng.'; assert.equal(muc(w, 'p-chung'), 'canh-bao'); }
{ const w = mau(); w.sp.thuocTinh = ['an-toan', 'nho-gon', 'qua-tang', 'chung-nhan']; assert.equal(muc(w, 'p-nhieu'), 'canh-bao'); }
{ const w = mau(); w.sp.thuocTinh = ['qua-tang']; assert.equal(muc(w, 'p-truyen-thong'), 'goi-y'); assert.equal(muc(w, 'p-an-toan'), 'goi-y'); }
{ const w = mau(); w.gia.ban = '28000'; assert.equal(muc(w, 'g-lo'), 'canh-bao'); w.gia.ban = '34000'; assert.equal(muc(w, 'g-bien-thap'), 'canh-bao'); }
{ const w = mau(); w.gia.chienLuoc = 'tham-nhap'; w.gia.ban = '60000'; assert.equal(muc(w, 'g-tham-nhap-cao'), 'canh-bao'); }
{ const w = mau(); w.gia.ban = '38000'; assert.equal(muc(w, 'g-gia-tri-thap'), 'goi-y'); }
{ const w = mau(); w.gia.chienLuoc = 'cao-cap'; assert.equal(muc(w, 'g-cao'), 'canh-bao'); w.sp.thuocTinh = ['nguon-goc', 'qua-tang']; assert.equal(muc(w, 'g-cao-co-ly-do'), 'goi-y'); }
{ const w = mau(); w.kenh.chon = ['san-tmdt', 'mxh']; assert.equal(muc(w, 'l-ca-hai'), 'canh-bao', 'đề bài: ưu tiên trực tuyến VÀ trực tiếp'); }
{ const w = mau(); w.kenh.chon = ['san-tmdt', 'mxh', 'web', 'cho', 'hoi-cho']; assert.equal(muc(w, 'l-nhieu'), 'canh-bao'); }
{ const w = mau(); w.kenh.chon = ['san-tmdt', 'cho', 'sieu-thi']; assert.equal(muc(w, 'l-sieu-thi'), 'canh-bao'); }
{ const w = mau(); w.qb.chon = ['giam-gia']; assert.equal(muc(w, 'm-chi-giam-gia'), 'canh-bao'); assert.equal(muc(w, 'm-giam-gia-mau-thuan'), 'canh-bao'); assert.equal(muc(w, 'm-ke-chuyen'), 'goi-y'); }
{ const w = mau(); w.kenh.chon = ['cho', 'hoi-cho']; w.qb.chon = ['livestream']; assert.equal(muc(w, 'm-khong-kenh'), 'canh-bao'); }
{ const w = mau(); w.qb.keHoach = 'Khuyến mãi.'; assert.equal(muc(w, 'm-ke-hoach-ngan'), 'canh-bao'); }
// danh mục lựa chọn: mã không trùng, đủ hai thứ tiếng; gợi ý sản phẩm có ở cả hai nhóm
for (const ds of [D.THUOC_TINH, D.GIA, D.KENH, D.QUANG_BA]) { assert.equal(new Set(ds.map(x => x.id)).size, ds.length); for (const x of ds) assert.ok(x.vi && x.en, x.id); }
assert.ok(D.GOI_Y['nong-san'].length >= 4 && D.GOI_Y['thu-cong'].length >= 3);
assert.ok(D.KENH.some(x => x.loai === 'online') && D.KENH.some(x => x.loai === 'truc-tiep'));
// không có thang điểm riêng: bộ chấm duy nhất là js/bizon-grading.js
{ const src = read('js/brand-workshop-data.js') + read('js/brand-workshop.js'); assert.ok(!/\b(diem|score)\s*[:=]/i.test(src.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '')), 'không tự chấm điểm'); }

// --- tĩnh ---
const page = read('xuong-nhan-hieu.html');
assert.ok(page.includes('<script src="js/brand-workshop-data.js" defer></script>\n<script src="js/bizon-clay-i18n.js" defer></script>\n<script src="js/brand-workshop.js" defer></script>'), 'thứ tự nạp');
for (const id of ['xn-bai', 'xn-nhom', 'xn-sp-ten', 'xn-nh-ten', 'xn-nh-slogan', 'xn-nh-giai-thich', 'xn-thuoc-tinh', 'xn-gia', 'xn-kenh', 'xn-qb', 'xn-gop-y', 'xn-in', 'xn-tai', 'xn-chep', 'xn-phieu']) assert.ok(page.includes(`id="${id}"`), id);
assert.match(page, /body\.xn-printing > \*:not\(#xn-phieu\)\{display:none !important\}/, 'in riêng phiếu');
{ const sw = read('sw.js'); assert.match(sw, /const CACHE = 'bizon-v\d+';/); for (const f of ["'./xuong-nhan-hieu.html'", "'./js/brand-workshop.js'", "'./js/brand-workshop-data.js'"]) assert.ok(sw.includes(f), 'sw ' + f); }
assert.ok(read('sitemap.xml').includes('https://bizonland.com/xuong-nhan-hieu.html<'));
assert.match(read('truong-giang-vien.html'), /href="xuong-nhan-hieu\.html"/);
console.log('brand-workshop: ok');
