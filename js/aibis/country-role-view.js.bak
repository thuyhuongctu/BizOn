/* BizOn AIBIS — Mô hình dữ liệu quốc gia theo vai (Bước 2, bản giao việc)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * RÀNG BUỘC CỨNG (bản giao việc, Mục 2): nhãn "xuất xứ" và "chủ nhà" là QUAN HỆ,
 * không phải thuộc tính. TUYỆT ĐỐI không lưu `country.is_host = true`. Vai được
 * TÍNH từ ai đang nhìn — cùng một quốc gia hiển thị hai nhãn khác nhau cho hai
 * người chơi khác vai, cùng lúc. Nếu mô hình dữ liệu cho phép gán nhãn cố định,
 * giao diện sẽ dạy sai khái niệm.
 *
 * Hàm ở đây là THUẦN (pure): không sửa hồ sơ quốc gia, không lưu vai. Gọi cùng một
 * hồ sơ với hai `viewer` khác nhau cho ra hai khung nhìn khác nhau mà không để lại
 * side-effect — đúng tiêu chí "cùng lúc".
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnCountryRoleView = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Vai TÍNH theo người xem: quốc gia == quê của người xem -> xuất xứ; ngược lại -> chủ nhà.
  function roleOf(countryCode, viewer) {
    if (!viewer || !viewer.homeCode || !countryCode) return 'chu_nha';
    return String(countryCode).toUpperCase() === String(viewer.homeCode).toUpperCase()
      ? 'xuat_xu' : 'chu_nha';
  }

  // Hai tập trường theo vai (đúng bản giao việc). Mỗi trường tự mang nhãn song ngữ và
  // khoá đọc giá trị từ profile.roleFields (nullable — honest khi chưa có dữ liệu).
  var ORIGIN_FIELDS = [ // Nhìn từ phía XUẤT XỨ (doanh nghiệp đi ra)
    { key: 'domesticCapitalCost', vi: 'Chi phí vốn trong nước', en: 'Domestic cost of capital' },
    { key: 'profitRepatriationTax', vi: 'Thuế khi chuyển lợi nhuận về', en: 'Profit-repatriation tax' },
    { key: 'exportCreditSupport', vi: 'Hỗ trợ tín dụng xuất khẩu', en: 'Export credit support' },
    { key: 'tradeAgreements', vi: 'Hiệp định thương mại', en: 'Trade agreements' }
  ];
  var HOST_FIELDS = [ // Nhìn từ phía CHỦ NHÀ (doanh nghiệp đi vào)
    { key: 'entryBarriers', vi: 'Rào cản gia nhập', en: 'Entry barriers' },
    { key: 'foreignOwnershipLimit', vi: 'Giới hạn sở hữu nước ngoài', en: 'Foreign-ownership limits' },
    { key: 'localizationRequirements', vi: 'Yêu cầu nội địa hóa', en: 'Localization requirements' },
    { key: 'licensingWaitTime', vi: 'Thủ tục cấp phép, thời gian chờ', en: 'Licensing procedures, wait time' }
  ];

  // Nhãn vai theo VÒNG. Vòng 1–2 dùng ngôn ngữ VỊ TRÍ; chỉ đặt tên thuật ngữ từ vòng 3
  // (bản giao việc Bước 4) — vì "nước chủ nhà"/"nước chủ đầu tư" cùng bắt đầu bằng "chủ",
  // hai khái niệm đối lập lại nghe như họ hàng, nên chỉ đặt tên khi người học đã có thứ
  // để gắn tên vào.
  function roleLabel(role, round) {
    var early = typeof round === 'number' && round <= 2;
    if (role === 'xuat_xu') {
      return early ? { vi: 'Nước của bạn', en: 'Your country' }
                   : { vi: 'Nước xuất xứ', en: 'Home country' };
    }
    return early ? { vi: 'Nước bạn đang vào', en: 'The country you are entering' }
                 : { vi: 'Nước chủ nhà', en: 'Host country' };
  }

  function readField(profile, key) {
    var rf = profile && profile.roleFields;
    return rf && Object.prototype.hasOwnProperty.call(rf, key) ? rf[key] : null;
  }

  // Khung nhìn một quốc gia theo người xem: vai (tính, không lưu) + tập trường phù hợp.
  function roleView(profile, viewer, round) {
    var role = roleOf(profile && profile.iso2, viewer);
    var fields = role === 'xuat_xu' ? ORIGIN_FIELDS : HOST_FIELDS;
    return {
      iso2: profile && profile.iso2,
      name: profile && profile.name,
      role: role,
      roleLabel: roleLabel(role, round),
      fields: fields.map(function (f) {
        return { key: f.key, vi: f.vi, en: f.en, value: readField(profile, f.key) };
      })
    };
  }

  return Object.freeze({
    roleOf: roleOf,
    roleView: roleView,
    roleLabel: roleLabel,
    ORIGIN_FIELDS: ORIGIN_FIELDS,
    HOST_FIELDS: HOST_FIELDS
  });
});
