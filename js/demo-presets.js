/* BizOn — Preset vòng chơi cho học kỳ demo (KT330H).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Vì sao tồn tại (Task Brief PR B, mục 4): buổi 1 chỉ nên mở 3–4 biến quyết định để
 * "tạo phấn khởi"; các buổi sau mở đủ. Đây là CẤU HÌNH thuần dữ liệu — chọn preset
 * theo phiên, KHÔNG refactor engine. Engine đọc `decisionKeys` để quyết định biến
 * nào hiển thị/cho phép; nếu chưa đọc, đây vẫn là hợp đồng chung để nối sau.
 *
 * Bất biến: demo-basic là TẬP CON của demo-full (không mở biến ngoài bộ đầy đủ).
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnDemoPresets = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Bộ biến quyết định đầy đủ của mô phỏng chính (khớp tên khóa dùng trong engine).
  var FULL_KEYS = ['gia', 'san_luong', 'marketing', 'kenh', 'vay_tra', 'rnd', 'nhan_su', 'bao_hiem'];

  var PRESETS = {
    // Buổi 1 — "Tạo phấn khởi": chỉ 3–4 biến cốt lõi để SV không ngợp.
    'demo-basic': {
      label: 'Demo cơ bản (buổi 1)',
      decisionKeys: ['gia', 'san_luong', 'marketing'],
      note: 'Chỉ mở giá · sản lượng · marketing — vừa đủ để cảm nhận quyết định–hậu quả.'
    },
    // Buổi 2–4: mở đủ biến.
    'demo-full': {
      label: 'Demo đầy đủ (buổi 2–4)',
      decisionKeys: FULL_KEYS.slice(),
      note: 'Mở toàn bộ biến quyết định, gồm tài chính và vòng cạnh tranh.'
    }
  };

  function list() { return Object.keys(PRESETS); }

  function presetFor(name) {
    var p = PRESETS[name];
    if (!p) throw new Error('Preset không tồn tại: ' + name + ' (có: ' + list().join(', ') + ')');
    // Bảo đảm bất biến subset ⊆ full ngay khi đọc.
    p.decisionKeys.forEach(function (k) {
      if (FULL_KEYS.indexOf(k) < 0) throw new Error('Preset ' + name + ' mở biến ngoài bộ đầy đủ: ' + k);
    });
    return { name: name, label: p.label, decisionKeys: p.decisionKeys.slice(), note: p.note };
  }

  return Object.freeze({
    FULL_KEYS: FULL_KEYS,
    list: list,
    presetFor: presetFor
  });
});
