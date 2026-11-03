/* BizOn – Màn hình lớp học: chuyển kết quả đã nộp thành dữ liệu hiển thị (thuần, không DOM, không mạng).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Nguồn dữ liệu (đều là KẾT QUẢ CUỐI VÁN sinh viên đã nộp, không phải tiến độ từng vòng):
 *   bps  Bến Phù Sa           ft_class_leaderboard(mã lớp)  → team_name, total_revenue, efficiency, final_rank
 *   hcth Hộ Chiếu Thương Hiệu bizon_bp_results(mã lớp)       → company, player_name, total_score, detail_json.markets (7 thị trường)
 *   hcsr Hộ Chiếu Sầu Riêng   bizon_journey_class(mã lớp)    → passport.tiers.t3 (variant 'durian'): total, channelOrder
 * Không bao giờ trả về email: màn hình này chiếu cho cả lớp xem. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnClassScreen = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const GAMES = {
    bps: { vi: 'Bến Phù Sa', en: 'Ben Phu Sa', unit: 'triệu ₫' },
    hcth: { vi: 'Hộ Chiếu Thương Hiệu', en: 'Brand Passport', unit: 'điểm' },
    hcsr: { vi: 'Hộ Chiếu Sầu Riêng', en: 'Durian Passport', unit: 'điểm' },
  };
  // Thứ tự đúng như S.entered trong brand-passport.html (id 0–6)
  const BP_MARKETS = ['Hải Lam', 'Bắc Phong', 'Kim Sa', 'Lục Đảo', 'Nhật Quang', 'Tân Cảng', 'Hỏa Sơn'];
  // Kênh trong lab/ho-chieu-sau-rieng-data.js
  const DURIAN_CHANNELS = { DOM: 'Nội địa', BORDER: 'Biên mậu', CN: 'Trung Quốc chính ngạch', FROZEN: 'Cấp đông', TW: 'Đài Loan', JP: 'Nhật Bản' };
  const STAGES = 8;

  const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  const text = (v, max = 40) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max);
  const noEmail = s => (/@/.test(s) ? s.split('@')[0] : s);
  const fmt = n => Math.round(n).toLocaleString('vi-VN');

  // Giữ một dòng tốt nhất cho mỗi tên; xếp giảm dần theo điểm; tiến độ = điểm / điểm cao nhất (hoặc / thang tuyệt đối)
  function finish(list, scale) {
    const best = new Map();
    for (const t of list) { const k = t.name.toLowerCase(); const o = best.get(k); if (!o || t.score > o.score) best.set(k, t); }
    const out = [...best.values()].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'vi'));
    const top = scale || Math.max(1, ...out.map(t => t.score));
    out.forEach((t, i) => { t.rank = i + 1; t.progress = Math.max(0.04, Math.min(1, t.score / top)); });
    return out;
  }

  function fromFt(rows) {
    const list = (rows || []).map(r => ({
      name: noEmail(text(r.team_name) || text(r.player_name) || 'Nhóm'),
      score: num(r.total_revenue),
      label: fmt(num(r.total_revenue)) + ' triệu ₫',
      sub: 'Hiệu quả ' + Math.round(num(r.efficiency)) + (r.final_rank ? ' · hạng ván ' + r.final_rank : ''),
    }));
    return { game: 'bps', teams: finish(list), submitted: list.length };
  }

  function fromBp(rows) {
    const marketCount = BP_MARKETS.map(() => 0);
    const list = (rows || []).map(r => {
      const d = r.detail_json && typeof r.detail_json === 'object' ? r.detail_json : {};
      const entered = Array.isArray(d.markets) ? d.markets : [];
      const set = BP_MARKETS.map((_, i) => entered[i] != null);
      const company = text(r.company), player = noEmail(text(r.player_name));
      return { name: company && player ? company + ' · ' + player : company || player || 'Doanh nghiệp', score: num(r.total_score),
        label: Math.round(num(r.total_score)) + ' điểm', sub: set.filter(Boolean).length + ' / 7 thị trường', markets: set };
    });
    const teams = finish(list, 100);
    teams.forEach(t => t.markets.forEach((on, i) => { if (on) marketCount[i]++; }));
    return { game: 'hcth', teams, submitted: list.length, markets: BP_MARKETS.map((vi, i) => ({ vi, count: marketCount[i] })) };
  }

  function fromJourney(rows) {
    const playing = [], list = [];
    for (const r of rows || []) {
      const p = r.passport && typeof r.passport === 'object' ? r.passport : {};
      const t3 = p.tiers && p.tiers.t3;
      if (!t3 || (t3.variant && t3.variant !== 'durian')) continue;
      const name = noEmail(text(r.team_name) || 'Nhóm');
      if (t3.status !== 'done') { if (t3.status === 'playing') playing.push(name); continue; }
      const ch = Array.isArray(t3.channelOrder) ? t3.channelOrder.map(c => String(c).toUpperCase()).filter(c => DURIAN_CHANNELS[c]) : [];
      list.push({ name, score: num(t3.total), label: Math.round(num(t3.total)) + ' điểm', sub: ch.length ? ch.map(c => DURIAN_CHANNELS[c]).join(', ') : 'chưa có kênh', channels: ch });
    }
    const teams = finish(list, 100);
    teams.forEach(t => { t.stage = Math.min(STAGES - 1, Math.floor(t.progress * STAGES - 1e-9)); });
    return { game: 'hcsr', teams, submitted: list.length, playing: [...new Set(playing)] };
  }

  // Dữ liệu minh hoạ cố định (không ngẫu nhiên) để thử máy chiếu khi chưa có lớp thật
  const DEMO_NAMES = ['Phù Sa', 'Sen Hồng', 'Cá Linh', 'Đom Đóm', 'Bông Điên Điển', 'Gió Chướng', 'Ghe Lườn', 'Lục Bình', 'Mù U', 'Bần Chua'];
  function demo(game) {
    if (game === 'bps') return fromFt(DEMO_NAMES.map((n, i) => ({ team_name: 'Nhóm ' + n, total_revenue: 980 - i * 71 - (i % 3) * 13, efficiency: 88 - i * 5, final_rank: (i % 4) + 1 })));
    if (game === 'hcth') return fromBp(DEMO_NAMES.map((n, i) => ({ company: n + ' Foods', total_score: 91 - i * 6 - (i % 2) * 2,
      detail_json: { markets: [0, 1, 2, 3, 4, 5, 6].map(m => ([5, 2, 0, 3, 4, 1, 6].indexOf(m) < 7 - Math.floor(i * 0.6) ? (m % 6) + 1 : null)) } })));
    return fromJourney(DEMO_NAMES.map((n, i) => ({ team_name: 'Nhóm ' + n,
      passport: { tiers: { t3: i === 9 ? { status: 'playing', variant: 'durian' } : { status: 'done', variant: 'durian', total: 94 - i * 8, channelOrder: ['DOM', 'BORDER', 'CN', 'FROZEN', 'TW', 'JP'].slice(0, 6 - (i % 5)) } } } })));
  }

  return { GAMES, BP_MARKETS, DURIAN_CHANNELS, STAGES, fromFt, fromBp, fromJourney, demo };
});
