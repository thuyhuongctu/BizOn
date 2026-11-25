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
  const NAM = 2024, TONG_SO_NUOC = 190, NGAY_TAI = '2026-11-25';
  const NUOC = {
    SGP: { vi: "Singapore", en: "Singapore", nam: 2024, gain: 68.5, vul: 0.379, ready: 0.749, hang: 6 },
    JPN: { vi: "Nhật Bản", en: "Japan", nam: 2024, gain: 65.7, vul: 0.353, ready: 0.667, hang: 18 },
    DEU: { vi: "Đức", en: "Germany", nam: 2024, gain: 69.2, vul: 0.296, ready: 0.68, hang: 3 },
    USA: { vi: "Hoa Kỳ", en: "United States", nam: 2024, gain: 65.7, vul: 0.317, ready: 0.632, hang: 17 },
    ARE: { vi: "Các Tiểu vương quốc Ả Rập Thống nhất", en: "United Arab Emirates", nam: 2024, gain: 53.7, vul: 0.416, ready: 0.49, hang: 56 },
    KOR: { vi: "Hàn Quốc", en: "South Korea", nam: 2024, gain: 68.3, vul: 0.356, ready: 0.722, hang: 7 },
    KEN: { vi: "Kenya", en: "Kenya", nam: 2024, gain: 39.3, vul: 0.482, ready: 0.268, hang: 147 },
  };
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

  // Kịch bản khí hậu (?khihau=1, PR 2). Mọi độ lớn là minh họa; chỉ hướng tác động theo Oh, Rivera & Oetzel (2026).
  // Chi phí rủi ro khí hậu mỗi quý (nghìn USD): tăng theo mức dễ tổn thương và mức cam kết tài sản, giảm theo ESG.
  const chiPhiQuy = (id, mode, esg) => HE_SO.chiPhiQuy * s(id) * a(mode) * m(esg);
  // Biến cố thiên tai khi bật kịch bản: chi phí thêm mỗi sản phẩm (USD) và hệ số cầu.
  // Không bật thì game giữ nguyên +1,2 USD/sp và cầu × 0,92 như cũ.
  const thienTai = (id, mode, esg) => ({
    cogsAdd: HE_SO.thienTaiCogs * (0.5 + s(id)) * (0.5 + 0.5 * a(mode)) * m(esg),
    demand: 1 - HE_SO.thienTaiCau * (0.5 + s(id)),
  });
  // Mức rủi ro khí hậu tương đối (chỉ để hiện chữ): chia ba khoảng đều của s.
  const mucRuiRo = id => { const v = s(id); return v < 1 / 3 ? 'thap' : v < 2 / 3 ? 'vua' : 'cao'; };

  const api = { NAM, TONG_SO_NUOC, NGAY_TAI, NUOC, THI_TRUONG, HE_SO, TRICH, hoSo, coSoLieu, s, a, m, chiPhiQuy, thienTai, mucRuiRo };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GoGlobalKhiHau = api;
})(typeof window !== 'undefined' ? window : globalThis);
