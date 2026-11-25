/* BizOn Go Global – hồ sơ khí hậu của thị trường (đặc tả 009, specs/009-khi-hau-go-global).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Số liệu thật: ND-GAIN Country Index (University of Notre Dame), bản 2026, số của NƯỚC TRUNG TÂM
 * của mỗi thị trường (chị chốt 25/11/2026). Khối dữ liệu do scripts/research/trich-nd-gain.mjs sinh
 * từ tệp zip chính thức; test đối chiếu từng số với docs/research/du-lieu/nd-gain-2026-nuoc-trung-tam.csv.
 * Hệ số tác động (HE_SO) là MINH HỌA, chỉ hướng tác động lấy từ Oh, Rivera & Oetzel (2026).
 */
(function (root) {
  'use strict';

  /* nd-gain:bat-dau – sinh bởi scripts/research/trich-nd-gain.mjs, không sửa tay */
  const NAM = 0, TONG_SO_NUOC = 0, NGAY_TAI = '';
  const NUOC = {};
  /* nd-gain:ket-thuc */

  // Thị trường game → nước trung tâm (mã ISO3)
  const THI_TRUONG = { sea: 'SGP', eas: 'JPN', eu: 'DEU', na: 'USA', me: 'ARE', kr: 'KOR', af: 'KEN' };

  // Hệ số MINH HỌA (plan.md, mục Nghiên cứu). Chỉ dùng khi bật kịch bản khí hậu (?khihau=1, PR 2).
  const HE_SO = { chiPhiQuy: 12, vonThamChieu: 180, esgMin: 35, esgKhoang: 65, esgTran: 0.4, thienTaiCogs: 1.2, thienTaiCau: 0.08 };

  const TRICH = {
    ndgain: 'Notre Dame Global Adaptation Initiative Country Index (ND-GAIN). (2026). University of Notre Dame. https://gain.nd.edu/our-work/country-index/',
    oh: 'Oh, C. H., Rivera, J., & Oetzel, J. (2026). Adapting to the new abnormal: Multinational corporations’ foreign subsidiary investment and country resilience to climate change. Journal of International Business Studies. https://doi.org/10.1057/s41267-026-00912-4',
  };

  const hoSo = id => { const iso = THI_TRUONG[id]; return iso && NUOC[iso] ? { iso3: iso, ...NUOC[iso] } : null; };
  const coSoLieu = () => Object.keys(THI_TRUONG).every(id => hoSo(id));

  // Mức dễ tổn thương tương đối giữa 7 nước trung tâm, thuộc [0, 1]; giữ nguyên thứ tự của nguồn.
  function s(id) {
    const v = Object.values(THI_TRUONG).map(iso => NUOC[iso] && NUOC[iso].vul).filter(Number.isFinite);
    const h = hoSo(id); if (!h || v.length < 2) return 0;
    const lo = Math.min(...v), hi = Math.max(...v);
    return hi > lo ? (h.vul - lo) / (hi - lo) : 0;
  }
  // Mức cam kết tài sản của phương thức: vốn ban đầu / 180 (FDI = 1).
  const a = mode => Math.max(0, Math.min(1, (mode && mode.cost0 || 0) / HE_SO.vonThamChieu));
  // Hệ số giảm nhờ ESG: ESG 35 → 1; ESG 100 → 0,6 (trần giảm 40 %).
  const m = esg => 1 - HE_SO.esgTran * Math.min(1, Math.max(0, ((Number(esg) || 0) - HE_SO.esgMin) / HE_SO.esgKhoang));

  const api = { NAM, TONG_SO_NUOC, NGAY_TAI, NUOC, THI_TRUONG, HE_SO, TRICH, hoSo, coSoLieu, s, a, m };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GoGlobalKhiHau = api;
})(typeof window !== 'undefined' ? window : globalThis);
