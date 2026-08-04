'use strict';
const assert = require('node:assert/strict');
const RoleView = require('../js/aibis/country-role-view.js');

// Một hồ sơ quốc gia: chỉ là DỮ LIỆU, không mang nhãn vai cố định.
const japan = Object.freeze({
  iso2: 'JP', name: 'Nhật Bản',
  roleFields: Object.freeze({
    entryBarriers: 'cao', foreignOwnershipLimit: 'trung bình',
    tradeAgreements: 'CPTPP', profitRepatriationTax: '5%'
  })
});

// Hai người chơi khác vai, cùng nhìn CÙNG một quốc gia (Nhật Bản), CÙNG LÚC.
const vnFirm = { homeCode: 'VN' }; // doanh nghiệp Việt đi ra -> Nhật là CHỦ NHÀ
const jpFirm = { homeCode: 'JP' }; // doanh nghiệp Nhật -> Nhật là XUẤT XỨ

// 1) Vai được tính từ người xem, không lưu trên quốc gia.
assert.equal(RoleView.roleOf('JP', vnFirm), 'chu_nha');
assert.equal(RoleView.roleOf('JP', jpFirm), 'xuat_xu');
assert.equal(RoleView.roleOf('jp', { homeCode: 'jp' }), 'xuat_xu', 'so khớp không phân biệt hoa thường');
assert.equal(RoleView.roleOf('JP', {}), 'chu_nha', 'thiếu homeCode -> mặc định chủ nhà');

// 2) Tiêu chí hoàn thành: cùng một quốc gia hiển thị HAI nhãn khác nhau, CÙNG LÚC.
const asHost = RoleView.roleView(japan, vnFirm, 3);
const asOrigin = RoleView.roleView(japan, jpFirm, 3);
assert.equal(asHost.role, 'chu_nha');
assert.equal(asOrigin.role, 'xuat_xu');
assert.notEqual(asHost.roleLabel.vi, asOrigin.roleLabel.vi, 'hai vai phải cho hai nhãn khác nhau');
assert.equal(asHost.roleLabel.vi, 'Nước chủ nhà');
assert.equal(asOrigin.roleLabel.vi, 'Nước xuất xứ');

// Hai tập trường khác nhau theo vai.
const hostKeys = asHost.fields.map(f => f.key);
const originKeys = asOrigin.fields.map(f => f.key);
assert.ok(hostKeys.includes('entryBarriers') && hostKeys.includes('foreignOwnershipLimit'));
assert.ok(originKeys.includes('profitRepatriationTax') && originKeys.includes('tradeAgreements'));
assert.ok(!hostKeys.includes('profitRepatriationTax'), 'khung chủ nhà không lẫn trường xuất xứ');

// Giá trị đọc từ hồ sơ (nullable khi chưa có dữ liệu — honest).
const entry = asHost.fields.find(f => f.key === 'entryBarriers');
assert.equal(entry.value, 'cao');
const exportCredit = asOrigin.fields.find(f => f.key === 'exportCreditSupport');
assert.equal(exportCredit.value, null, 'trường chưa có dữ liệu trả về null, không bịa');

// 3) Vòng 1–2 dùng ngôn ngữ VỊ TRÍ; chỉ đặt tên thuật ngữ từ vòng 3.
assert.equal(RoleView.roleView(japan, vnFirm, 1).roleLabel.vi, 'Nước bạn đang vào');
assert.equal(RoleView.roleView(japan, jpFirm, 2).roleLabel.vi, 'Nước của bạn');
assert.equal(RoleView.roleView(japan, vnFirm, 3).roleLabel.vi, 'Nước chủ nhà');

// 4) Không lưu nhãn cố định: hồ sơ KHÔNG bị sửa sau khi dựng khung nhìn.
const snapshot = JSON.stringify(japan);
RoleView.roleView(japan, vnFirm, 3);
RoleView.roleView(japan, jpFirm, 3);
assert.equal(JSON.stringify(japan), snapshot, 'roleView phải thuần, không mutate hồ sơ quốc gia');
assert.ok(!('is_host' in japan) && !('role' in japan), 'quốc gia không mang thuộc tính vai cố định');

console.log('AIBIS country role-view (Bước 2) contract passed.');
