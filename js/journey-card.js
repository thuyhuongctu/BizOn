/* Hành trình 3 bậc – thẻ «Hành trang» dùng chung và liên kết sâu tới từng bậc.
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Trang hanh-trinh.html dùng để xem trước; mỗi game (J4–J6) dùng trước màn mở đầu: từng khoản, con số, một câu
 * giải thích; hai nút «Nhận hành trang» / «Chơi độc lập». Chỉ sinh HTML (chuỗi), không đụng DOM, không mạng.
 * CSS: css/journey.css (.jc-*). Chạy trình duyệt (window.BizOnJourneyCard) và Node (require).
 */
(function (root, factory) {
  const J = typeof module === 'object' && module.exports ? require('./core/journey.js') : root.BizOnJourney;
  const api = factory(J);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnJourneyCard = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (J) {
  'use strict';
  if (!J) throw new Error('BizOnJourney is required');

  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const t = (lang, vi, en) => (lang === 'en' ? en : vi);

  // Trang vào của từng bậc (bản 2D trước – nguyên tắc N6); bản 3D nhận cùng mô-đun ở J8.
  const GAME_URL = Object.freeze({ t1: 'ben-phu-sa.html', t2: 'game.html', t3: Object.freeze({ durian: 'lab/ho-chieu-sau-rieng-v2.html', brand: 'brand-passport-v2.html' }) });
  // Bản 3D của ba bậc (J8) – cùng mô-đun, cùng hộ chiếu; trang Hành trình đưa cả hai lối vào.
  const GAME_URL_3D = Object.freeze({ t1: 'ben-phu-sa-3d.html', t2: 'BizOn Game 3D.html', t3: Object.freeze({ durian: 'lab/ho-chieu-sau-rieng-3d.html', brand: 'Ho Chieu Thuong Hieu 3D.html' }) });
  const TIER = Object.freeze({
    t1: { n: 1, icon: '🛶', vi: 'Bến Phù Sa', en: 'Bến Phù Sa', subVi: 'Khởi nghiệp gánh hàng · 5 tuần', subEn: 'Street-cart start-up · 5 weeks' },
    t2: { n: 2, icon: '🏭', vi: 'Bật Nghiệp', en: 'Bật Nghiệp', subVi: 'Xưởng đất sét · 6 vòng · 6 tỉnh', subEn: 'Clay workshop · 6 rounds · 6 provinces' },
    t3: { n: 3, icon: '🛂', vi: 'Hộ Chiếu', en: 'Passport', subVi: 'Ra thế giới · 6 quý/vụ', subEn: 'Going global · 6 quarters/seasons' }
  });
  const VARIANT = Object.freeze({ durian: { vi: 'Hộ Chiếu Sầu Riêng', en: 'Durian Passport' }, brand: { vi: 'Hộ Chiếu Thương Hiệu', en: 'Brand Passport' } });
  const DURIAN_ROLES = Object.freeze({ htx: { vi: 'HTX nhà vườn Cai Lậy', en: 'Cai Lậy growers\' cooperative', cashAdj: -2 }, packer: { vi: 'Cơ sở đóng gói', en: 'Packing facility', cashAdj: 0 }, exporter: { vi: 'Công ty xuất khẩu TP.HCM', en: 'Ho Chi Minh City exporter', cashAdj: 6 }, frozen: { vi: 'Doanh nghiệp cấp đông Tiền Giang', en: 'Tiền Giang freezing company', cashAdj: 2 } });

  function tierName(tier, lang, variant) {
    const d = TIER[tier]; if (!d) return tier;
    if (tier === 't3' && VARIANT[variant]) return t(lang, VARIANT[variant].vi, VARIANT[variant].en);
    return t(lang, d.vi, d.en);
  }
  // Liên kết sâu: ?journey=<journeyId> (game đọc tham số, nạp hộ chiếu cục bộ, gọi journeyCarry).
  function gameLink(p, tier, variant, mode) {
    const U = mode === '3d' ? GAME_URL_3D : GAME_URL;
    const base = encodeURI(tier === 't3' ? U.t3[VARIANT[variant] ? variant : (p && p.tiers && p.tiers.t3 && p.tiers.t3.variant) || J.DEFAULT_T3_VARIANT] : U[tier]);
    if (!base) return '#';
    const id = p && p.journeyId ? encodeURIComponent(p.journeyId) : '';
    return id ? base + (base.includes('?') ? '&' : '?') + 'journey=' + id : base;
  }
  function journeyIdFromUrl(search) {
    const q = typeof search === 'string' ? search : (typeof location !== 'undefined' ? location.search : '');
    const m = /[?&]journey=([^&#]+)/.exec(q || ''); try { return m ? decodeURIComponent(m[1]) : null; } catch (e) { return null; }
  }

  const fmtVal = (key, v, lang) => {
    if (typeof v === 'boolean') return v ? '✓' : '–';
    if (key === 'cash' || key === 'brand') return '×' + Number(v).toFixed(2);
    if (Array.isArray(v)) return v.length ? '+' + v[0].add : '–';
    if (typeof v === 'number') return (v > 0 ? '+' : '') + (Number.isInteger(v) ? v : v.toFixed(2));
    return esc(v);
  };

  // html(carry, { lang, tier, variant, buttons, title, note }) → chuỗi HTML của thẻ.
  // carry = kết quả journeyCarry (có .lines, .applied, .enabled, .preview). Hành trang tắt → hiện «xem trước» mờ.
  function html(carry, opts = {}) {
    const lang = opts.lang === 'en' ? 'en' : 'vi';
    const c = carry || { lines: [], applied: {}, enabled: false, empty: true };
    const tier = opts.tier || c.tier || 't2';
    const title = opts.title || t(lang, 'Hành trang vào ' + tierName(tier, lang, opts.variant), 'Carry-over into ' + tierName(tier, lang, opts.variant));
    const lines = c.lines && c.lines.length ? c.lines : [];
    const off = !c.enabled;
    const body = lines.length
      ? '<ul class="jc-lines">' + lines.map(l => `<li class="jc-line" data-key="${esc(l.key)}"><b class="jc-val">${fmtVal(l.key, l.value, lang)}</b><span>${esc(t(lang, l.vi, l.en))}</span></li>`).join('') + '</ul>' + `<p class="jc-bb jc-muted">${esc(t(lang, 'Hành trang đã áp; chi tiết từng khoản được ẩn trong lớp này.', 'Carry-over applied; the line-by-line details are hidden in this class.'))}</p>`
      : (c.preview && Object.keys(c.preview).length
        ? `<p class="jc-muted">${esc(t(lang, 'Hành trang đang tắt (lớp chấm điểm hoặc bạn đã chọn chơi độc lập). Kết quả bậc trước vẫn được ghi vào hộ chiếu.', 'Carry-over is off (graded class, or you chose to play standalone). The previous level\'s result is still recorded in the passport.'))}</p>`
        : `<p class="jc-muted">${esc(t(lang, 'Chưa có hành trang: hoàn thành bậc trước để nhận.', 'No carry-over yet: finish the previous level to earn it.'))}</p>`);
    const note = opts.note === false ? '' : `<p class="jc-note">${esc(t(lang, 'Hành trang chỉ đổi điểm xuất phát (vốn, vài chỉ số, một ít thông tin), có trần, không đổi luật hay biến cố của bậc này.', 'Carry-over only changes the starting point (capital, a few indices, a little information), is capped, and never changes this level\'s rules or events.'))}</p>`;
    const buttons = opts.buttons === false ? '' : `<div class="jc-actions">${off || !lines.length ? '' : `<button type="button" class="jc-btn jc-primary" id="jc-accept">${esc(t(lang, '🎒 Nhận hành trang', '🎒 Take the carry-over'))}</button>`}<button type="button" class="jc-btn" id="jc-solo">${esc(t(lang, off || !lines.length ? 'Bắt đầu' : 'Chơi độc lập', off || !lines.length ? 'Start' : 'Play standalone'))}</button></div>`;
    return `<section class="jc-card${off ? ' jc-off' : ''}" aria-label="${esc(title)}"><span class="jc-tag">🧭 ${esc(t(lang, 'HÀNH TRÌNH 3 BẬC', '3-LEVEL JOURNEY'))}</span><h3 class="jc-title">${esc(title)}</h3>${body}${note}${buttons}</section>`;
  }

  return Object.freeze({ GAME_URL, GAME_URL_3D, TIER, VARIANT, DURIAN_ROLES, tierName, gameLink, journeyIdFromUrl, html, esc });
});
