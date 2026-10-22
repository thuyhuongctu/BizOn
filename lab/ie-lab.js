/* IE Lab · Khởi nghiệp quốc tế (International Entrepreneurship) – Bậc 3 · Quốc tế hóa · BizOn
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Giao diện «BizOn Lab» (cùng hệ với CMR / CVP / FDI Lab) cho phòng thí nghiệm
 * mô phỏng số liệu trước đây nằm trong global.html (<section id="ip-lab">),
 * thêm lớp trò chơi: 5 nhóm, XP, cấp độ, 5 nhiệm vụ, bảng xếp hạng và màn hình lớp.
 *
 * LÕI MÔ PHỎNG – IP_MARKETS và ipPerf() dưới đây được chép NGUYÊN VĂN từ global.html.
 * Không sửa tay ở đây: test/ie-lab.test.js so khớp từng byte với global.html.
 */
'use strict';

/* ================= LÕI MÔ PHỎNG (chép nguyên văn từ global.html) ================= */
const IP_MARKETS = [
  { id: 'vn',   flag: '🇻🇳', name: 'Việt Nam (nội địa)', regime: 'transition', note: 'Thể chế chuyển đổi – chữ U ngược rõ nét, đỉnh ≈ 43% FSTS. Chỉ bán trong nước (FSTS = 0) là điểm xuất phát an toàn nhưng bỏ lỡ lợi ích học hỏi quốc tế.' },
  { id: 'sg',   flag: '🇸🇬', name: 'Singapore', regime: 'strong', shield: true, note: 'Thể chế mạnh – quan hệ gần tuyến tính, càng quốc tế hóa càng lợi. Đặc biệt: DAI tạo "lá chắn số" giảm rủi ro khi FSTS cao.' },
  { id: 'cn',   flag: '🇨🇳', name: 'Trung Quốc', regime: 'transition', note: 'Thể chế chuyển đổi quy mô lớn – chữ U ngược, quá đà (FSTS > 43%) chi phí phối hợp vượt lợi ích.' },
  { id: 'in',   flag: '🇮🇳', name: 'Ấn Độ', regime: 'transition', note: 'Thị trường chuyển đổi đông dân – chữ U ngược; năng lực số nâng mặt bằng hiệu quả ở mọi mức FSTS.' },
  { id: 'jp',   flag: '🇯🇵', name: 'Nhật Bản', regime: 'strong', note: 'Thể chế mạnh trưởng thành – đường cong phẳng gần tuyến tính, điểm ngoặt vượt ngoài vùng quan sát.' },
  { id: 'sids', flag: '🏝️', name: 'Đảo nhỏ Thái Bình Dương (SIDS)', regime: 'fip', note: 'Kịch bản mô phỏng đặc biệt: FIP – "hình phạt quốc tế hóa cưỡng bức": thị trường nội địa quá nhỏ buộc doanh nghiệp ra biển sớm, càng quốc tế hóa hiệu quả càng giảm, không có điểm ngoặt.' },
  { id: 'asia', flag: '🌏', name: 'Toàn châu Á (50 nền kinh tế)', regime: 'pooled', note: 'Kịch bản mô phỏng gộp toàn châu Á: chữ U ngược với điểm ngoặt ≈ 43,6% FSTS – mức quốc tế hóa "vừa đủ sâu" là tối ưu.' },
];
function ipPerf(m, x, tci, dai) {
  const lvl = 0.14 * tci + 0.12 * dai;                      // TCI/DAI nâng mặt bằng (hiệu ứng phổ quát)
  if (m.regime === 'fip') return 58 + lvl - 0.34 * x;       // SIDS: âm đơn điệu (FIP)
  if (m.regime === 'strong') {
    let bend = m.shield ? 0.0016 * (1 - dai / 130) : 0.0016; // Singapore: DAI làm phẳng phần cong xuống
    return 40 + lvl + 0.38 * x - Math.max(0, bend) * x * x * 0.55;
  }
  const peak = m.regime === 'pooled' ? 43.6 : 43;           // chuyển đổi & mẫu gộp: chữ U ngược
  return 40 + lvl + 0.9 * x - (0.9 / (2 * peak)) * x * x;
}
/* ================= HẾT LÕI MÔ PHỎNG ================= */

/* Bản tiếng Anh + mã 2 chữ cho từng thị trường (chỉ là lớp hiển thị, không đụng công thức). */
const IP_EN = {
  vn: { code: 'VN', name: 'Vietnam (domestic)', note: 'Transition institutions – a clear inverted U, peaking at ≈ 43% FSTS. Selling only at home (FSTS = 0) is a safe start but misses the benefits of international learning.' },
  sg: { code: 'SG', name: 'Singapore', note: 'Strong institutions – a near-linear relationship: the more international, the better. Notably, DAI creates a "digital shield" that cuts risk at high FSTS.' },
  cn: { code: 'CN', name: 'China', note: 'Large-scale transition institutions – an inverted U; going too far (FSTS > 43%) makes coordination costs exceed the benefits.' },
  in: { code: 'IN', name: 'India', note: 'A populous transition market – an inverted U; digital capability lifts performance at every FSTS level.' },
  jp: { code: 'JP', name: 'Japan', note: 'Mature strong institutions – a flat, near-linear curve; the turning point lies beyond the observed range.' },
  sids: { code: 'SI', name: 'Pacific small island states (SIDS)', note: 'A special simulated scenario: FIP – the "forced internationalisation penalty": the home market is too small, pushing firms abroad early; the more international, the lower the performance, with no turning point.' },
  asia: { code: 'AS', name: 'All of Asia (50 economies)', note: 'A pooled all-Asia scenario: an inverted U with a turning point at ≈ 43.6% FSTS – "just deep enough" internationalisation is optimal.' },
};

/* So sánh 4 phương thức thâm nhập – cùng bộ tham số mô phỏng (thang 0–10) với ipDrawModes() cũ của global.html.
   Thứ tự mỗi dòng: [vốn đầu tư, kiểm soát, rủi ro]. Minh họa – cần giảng viên xác nhận. */
const IE_MODES = { export: [2, 4, 3], lic: [1, 2, 2.5], jv: [5.5, 5.5, 5], fdi: [9, 9.5, 8.5] };

const COLORS = ['#8C2F39', '#A8703A', '#C9A24A', '#3E5C8A', '#7E5E77'];
const DARK = [false, false, true, false, false];
const START_XP = [70, 150, 40, 120, 95];
const REL0 = [true, true, true, false, false];
const REG = { transition: '#3E5C8A', strong: '#3F6E52', fip: '#8C2F39', pooled: '#A8703A' };
const DIMC = ['#3E5C8A', '#3F6E52', '#8C2F39'];
const STORE = 'ielab-v1';
const LEVELS = {
  vi: ['Người khám phá', 'Nhà xuất khẩu', 'Nhà khởi nghiệp toàn cầu', 'Born global'],
  en: ['Explorer', 'Exporter', 'Global entrepreneur', 'Born global'],
};

/* ---------- logic thuần (không DOM) – dùng chung cho trang và cho kiểm thử ---------- */
function ieMarket(id) { return IP_MARKETS.find(m => m.id === id) || IP_MARKETS[0]; }
function ieLevel(xp) { return Math.floor(xp / 100); }
function ieLevelName(xp, lang) { return LEVELS[lang === 'vi' ? 'vi' : 'en'][Math.min(3, ieLevel(xp))]; }
/* Ba nhiệm vụ "Kiểm tra" (chỉ số 0–2) xét trạng thái hiện tại của thanh trượt. */
function ieCheck(ci, s) {
  if (ci === 0) return s.mk === 'vn' && s.x >= 40 && s.x <= 46;
  if (ci === 1) return s.mk === 'sids' && ipPerf(ieMarket('sids'), s.x, s.tci, s.dai) >= 60;
  if (ci === 2) return s.mk === 'sg' && s.x >= 80 && s.dai >= 80;
  return false;
}
/* Hai câu trắc nghiệm: đáp án đúng luôn là phương án 0 (NV4: SIDS · NV5: +5,6 vì 0,14 × 40). */
const IE_MCQ_ORDER = { 3: [1, 0, 2], 4: [0, 2, 1] };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { IP_MARKETS, ipPerf, IP_EN, IE_MODES, START_XP, REL0, LEVELS, STORE, ieMarket, ieLevel, ieLevelName, ieCheck, IE_MCQ_ORDER };
}

/* ================= GIAO DIỆN ================= */
if (typeof document !== 'undefined') (function () {
  const T = {
    vi: {
      title: 'IE Lab – Bậc 3 · Quốc tế hóa · BizOn',
      sub: 'Khởi nghiệp quốc tế · BizOn Lab', back: '← BizOn Go Global', kicker: 'IE LAB · MÔ PHỎNG SỐ LIỆU', hero1: 'Quốc tế hóa', hero2: 'bao nhiêu', hero3: 'là vừa?',
      intro: 'Chọn thị trường, kéo mức quốc tế hóa (FSTS %) và đầu tư năng lực số – xem hiệu quả doanh nghiệp thay đổi theo từng kiểu thể chế. Hoàn thành 5 nhiệm vụ để nhận XP cho nhóm.',
      xpp: 'Điểm kinh nghiệm', badges: 'Kiểu thị trường đã khám phá', pick: 'Chọn nhóm của bạn', teamSub: 'T01 – T05 · mỗi nhóm có XP riêng.', step: 'BƯỚC', chooseM: 'Chọn thị trường',
      fsts: 'Mức quốc tế hóa – FSTS', fstsH: '% doanh thu từ nước ngoài', tci: 'Năng lực công nghệ (TCI)', tciH: 'Nâng mặt bằng hiệu quả ở mọi mức FSTS', dai: 'Ứng dụng số (DAI)', daiH: 'Ở Singapore còn tạo "lá chắn số"',
      perf: 'Hiệu quả doanh nghiệp (điểm)', peak: 'đỉnh ≈', reg: { transition: 'Thể chế chuyển đổi', strong: 'Thể chế mạnh', fip: 'Đảo nhỏ (SIDS)', pooled: 'Gộp châu Á' },
      vFipHi: 'Lumina: bạn đang thấy FIP vận hành – ở SIDS, mỗi % FSTS thêm vào lại bào mòn hiệu quả. Bài học: quốc tế hóa không phải lúc nào cũng tốt!', vFipLo: 'Lumina: giữ FSTS thấp là hợp lý ở SIDS – thị trường nội địa nhỏ nhưng quốc tế hóa cưỡng bức còn tệ hơn.',
      vStrong: 'Lumina: thể chế mạnh hấp thụ chi phí phối hợp – cứ tự tin vươn xa', vShield: ', và đầu tư DAI để kích hoạt "lá chắn số"!',
      vOver: 'Lumina: bạn đã vượt điểm ngoặt – chi phí phối hợp, thanh khoản ngoại tệ và quản trị đa thị trường đang nuốt lợi ích. Lùi về gần 43% nhé.', vUnder: 'Lumina: còn dư địa – tăng dần FSTS để hưởng lợi ích học hỏi và quy mô, đỉnh nằm quanh 43%.', vOpt: 'Lumina: vùng tối ưu! Mức quốc tế hóa "vừa đủ sâu" đúng vùng đẹp nhất của mô phỏng.',
      cmp: 'So sánh 4 kiểu thị trường', cmpNote: 'Cùng mức năng lực số hiện tại. Chuyển đổi: chữ U ngược · Thể chế mạnh: gần tuyến tính · SIDS: giảm đơn điệu · Gộp châu Á: đỉnh ≈ 43,6%.',
      modes: 'So sánh 4 phương thức thâm nhập', modesNote: 'Thang 0–10, tham số mô phỏng. Càng kiểm soát cao càng tốn vốn và rủi ro.', dims: ['Vốn đầu tư', 'Kiểm soát', 'Rủi ro'], modeL: ['Xuất khẩu', 'Cấp phép', 'Liên doanh', 'FDI'],
      illus: 'Minh họa – cần giảng viên xác nhận',
      missions: 'Nhiệm vụ', check: 'Kiểm tra', wait: 'Chờ giảng viên mở', notq: 'Chưa đúng', notYet: 'Chưa đạt – chỉnh thanh trượt rồi thử lại',
      mq: ['Việt Nam: đặt FSTS đúng vùng điểm ngoặt (40–46%).', 'SIDS: đạt hiệu quả ≥ 60 điểm.', 'Singapore: FSTS ≥ 80% và kích hoạt "lá chắn số" (DAI ≥ 80).', 'Kiểu thị trường nào có hiệu quả giảm đơn điệu, không có điểm ngoặt?', 'Tăng TCI từ 40 lên 80 (giữ nguyên FSTS, DAI) làm hiệu quả thay đổi bao nhiêu điểm?'],
      m4: ['Đảo nhỏ (SIDS)', 'Chuyển đổi', 'Gộp châu Á'], m5: ['+5,6', '+14', '+2,8'],
      board: 'Bảng xếp hạng lớp', boardS: 'Xếp hạng', lvlUp: 'Lên cấp!', unlocked: 'Bạn đã mở khóa cấp mới', cont: 'Tiếp tục', done: 'Hoàn thành! +10 XP', team: 'Nhóm',
      stiT: 'Bối cảnh thực: Việt Nam trong Sustainable Trade Index 2025', real: 'Số liệu thật · không đưa vào mô phỏng',
      stiIntro: 'Hinrich Foundation &amp; IMD World Competitiveness Center xếp hạng 30 nền kinh tế theo mức sẵn sàng thương mại bền vững. Hồ sơ 2025 của Việt Nam – điểm tham chiếu thực tế, không phải dữ liệu đưa vào mô phỏng.',
      stiL: ['Tổng điểm', 'Trụ Kinh tế', 'Trụ Xã hội', 'Trụ Môi trường'], rank: 'Hạng',
      stiF: ['FDI ròng: 4.23% GDP (hạng 5/30, 2024) – đối chiếu thực tế cho thanh trượt FSTS.', '16 hiệp định thương mại khu vực đang có hiệu lực (APEC, CPTPP, RCEP).', '78.1% dân số dùng Internet · 130.99 thuê bao di động/100 dân (2023) – nền tảng thực phía sau thanh trượt TCI/DAI.', 'GDP đầu người: 4.536 USD (2024, mức thu nhập trung bình).'],
      stiSrc: 'Nguồn: Hinrich Foundation &amp; IMD World Competitiveness Center, <i>Sustainable Trade Index 2025 – Vietnam Economy Profile</i>.',
      disc: 'IE Lab là công cụ mô phỏng số liệu phục vụ học tập môn Khởi nghiệp quốc tế – các đường cong, điểm ngoặt (≈ 43% FSTS), hiệu ứng "lá chắn số" và trường hợp đảo nhỏ đều là tham số mô phỏng minh họa, không phải số liệu thống kê thực của bất kỳ doanh nghiệp nào.',
      credit: 'IE Lab · Bậc 3 · Quốc tế hóa · © 2026 Đỗ Thùy Hương & Phan Anh Tú · BizOn – Bảo lưu mọi quyền.',
      uni: 'Vũ trụ →', teacherLink: 'Màn hình giảng viên →', tabs: ['Phòng lab', 'Đường cong', 'Nhiệm vụ', 'Xếp hạng'],
      classView: 'IE LAB · MÀN HÌNH LỚP', race: 'Đua nhóm', total: 'Tổng XP', live: 'Nhiệm vụ đang mở', release: 'Mở nhiệm vụ', award: 'Thưởng XP', reset: 'Đặt lại lớp', backStudent: '← Quay lại màn hình sinh viên',
      rel: ['NV1 · Điểm ngoặt VN', 'NV2 · SIDS ≥ 60', 'NV3 · Lá chắn số SG', 'NV4 · Không điểm ngoặt', 'NV5 · Hiệu ứng TCI'],
      chartAria: 'Đường cong hiệu quả theo FSTS của thị trường đang chọn', cmpAria: 'Bốn đường cong hiệu quả theo FSTS trên cùng một trục',
      dragonHero: 'Rồng BizOn cầm kính lúp', dragonScroll: 'Rồng BizOn đọc cuộn giấy', dragonUp: 'Rồng BizOn ăn mừng', dragonWave: 'Rồng BizOn vẫy tay', langSw: 'Switch to English',
    },
    en: {
      title: 'IE Lab – Level 3 · Internationalisation · BizOn',
      sub: 'International Entrepreneurship · BizOn Lab', back: '← BizOn Go Global', kicker: 'IE LAB · DATA SIMULATION', hero1: 'How much', hero2: 'internationalisation', hero3: 'is enough?',
      intro: 'Pick a market, drag the internationalisation level (FSTS %) and invest in digital capability – see firm performance change across institution types. Complete 5 missions to earn XP for your team.',
      xpp: 'Experience points', badges: 'Market types explored', pick: 'Pick your team', teamSub: 'T01 – T05 · each team has its own XP.', step: 'STEP', chooseM: 'Choose a market',
      fsts: 'Internationalisation – FSTS', fstsH: '% of revenue from abroad', tci: 'Technological capability (TCI)', tciH: 'Lifts performance at every FSTS level', dai: 'Digital adoption (DAI)', daiH: 'In Singapore it also builds a "digital shield"',
      perf: 'Firm performance (points)', peak: 'peak ≈', reg: { transition: 'Transition institutions', strong: 'Strong institutions', fip: 'Small islands (SIDS)', pooled: 'Pooled Asia' },
      vFipHi: 'Lumina: you are watching FIP at work – in SIDS, every extra % of FSTS erodes performance. Lesson: internationalising is not always good!', vFipLo: 'Lumina: keeping FSTS low makes sense in SIDS – the home market is small, but forced internationalisation is worse.',
      vStrong: 'Lumina: strong institutions absorb coordination costs – go far with confidence', vShield: ', and invest in DAI to switch on the "digital shield"!',
      vOver: 'Lumina: you are past the turning point – coordination costs, FX liquidity and multi-market governance are eating the gains. Step back towards 43%.', vUnder: 'Lumina: there is room to grow – raise FSTS step by step to gain learning and scale benefits; the peak is around 43%.', vOpt: 'Lumina: optimal zone! "Just deep enough" internationalisation is the sweet spot of the simulation.',
      cmp: 'Comparing 4 market types', cmpNote: 'At the current digital capability. Transition: inverted U · Strong: near-linear · SIDS: monotonic decline · Pooled Asia: peak ≈ 43.6%.',
      modes: 'Comparing 4 entry modes', modesNote: '0–10 scale, simulation parameters. More control costs more capital and risk.', dims: ['Capital', 'Control', 'Risk'], modeL: ['Export', 'Licensing', 'Joint venture', 'FDI'],
      illus: 'Illustrative – to be confirmed by the instructor',
      missions: 'Missions', check: 'Check', wait: 'Waiting for teacher', notq: 'Not quite', notYet: 'Not yet – adjust the sliders and try again',
      mq: ['Vietnam: set FSTS in the turning-point zone (40–46%).', 'SIDS: reach a performance of ≥ 60 points.', 'Singapore: FSTS ≥ 80% with the "digital shield" on (DAI ≥ 80).', 'Which market type declines monotonically, with no turning point?', 'Raising TCI from 40 to 80 (FSTS and DAI unchanged) changes performance by how many points?'],
      m4: ['Small islands (SIDS)', 'Transition', 'Pooled Asia'], m5: ['+5.6', '+14', '+2.8'],
      board: 'Class leaderboard', boardS: 'Leaderboard', lvlUp: 'Level up!', unlocked: "You've unlocked a new level", cont: 'Continue', done: 'Completed! +10 XP', team: 'Team',
      stiT: 'Real-world benchmark: Vietnam in the Sustainable Trade Index 2025', real: 'Real data · not a simulation input',
      stiIntro: 'Hinrich Foundation &amp; IMD World Competitiveness Center rank 30 economies on readiness to trade sustainably. Vietnam\'s 2025 profile – a reference point, not a simulation input.',
      stiL: ['Overall', 'Economic pillar', 'Societal pillar', 'Environmental pillar'], rank: 'Rank',
      stiF: ['FDI net inflows: 4.23% of GDP (rank 5/30, 2024) – a real counterpart to the FSTS slider.', 'Regional trade agreements in force: 16 (APEC, CPTPP, RCEP).', 'Internet users: 78.1% of population · 130.99 mobile subscriptions per 100 people (2023) – the real baseline behind the TCI/DAI sliders.', 'GDP per capita: US$4,536 (2024, medium-income tier).'],
      stiSrc: 'Source: Hinrich Foundation &amp; IMD World Competitiveness Center, <i>Sustainable Trade Index 2025 – Vietnam Economy Profile</i>.',
      disc: 'IE Lab is a data simulation tool for learning International Entrepreneurship – the curves, turning point (≈ 43% FSTS), "digital shield" effect and small-island case are illustrative simulation parameters, not real statistics from any company.',
      credit: 'IE Lab · Level 3 · Internationalisation · © 2026 Đỗ Thùy Hương & Phan Anh Tú · BizOn – All rights reserved.',
      uni: 'Universe →', teacherLink: 'Teacher view →', tabs: ['Lab', 'Curves', 'Missions', 'Ranking'],
      classView: 'IE LAB · CLASS VIEW', race: 'Team race', total: 'Total XP', live: 'Missions live', release: 'Release missions', award: 'Award bonus XP', reset: 'Reset class', backStudent: '← Back to student view',
      rel: ['M1 · VN turning point', 'M2 · SIDS ≥ 60', 'M3 · SG digital shield', 'M4 · No turning point', 'M5 · TCI effect'],
      chartAria: 'Firm performance curve across FSTS for the selected market', cmpAria: 'Four performance curves across FSTS on one axis',
      dragonHero: 'BizOn dragon with a magnifier', dragonScroll: 'BizOn dragon reading a scroll', dragonUp: 'BizOn dragon celebrating', dragonWave: 'BizOn dragon waving', langSw: 'Chuyển sang tiếng Việt',
    },
  };
  /* Số liệu thật – chép nguyên từ global.html (Sustainable Trade Index 2025, hồ sơ Việt Nam). */
  const STI = [['58.4', 14], ['74.2', 12], ['38.5', 19], ['66.7', 13]];
  const BC = [['transition', 'CĐ', 'TR'], ['strong', 'TM', 'ST'], ['fip', 'SI', 'SI'], ['pooled', 'AS', 'AS']];
  const CV = [{ regime: 'transition' }, { regime: 'strong', shield: true }, { regime: 'fip' }, { regime: 'pooled' }];

  const DEFAULT = { lang: 'en', team: 0, xp: START_XP.slice(), mk: 'vn', x: 30, tci: 40, dai: 40, seen: ['transition'], answers: {}, released: REL0.slice(), tab: 0 };
  let S = clone(DEFAULT);
  let modal = false, toast = null, toastTimer = null, view = 'student';
  const mq = window.matchMedia('(max-width: 720px)');

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function $(id) { return document.getElementById(id); }
  function txt(id, s) { const el = $(id); if (el && el.textContent !== String(s)) el.textContent = s; }
  function html(id, s) { const el = $(id); if (el && el.innerHTML !== s) el.innerHTML = s; }
  function no(i) { return String(i + 1).padStart(2, '0'); }
  function fg(i) { return DARK[i] ? '#1F2A44' : '#fff'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function nf(v, d) { return v.toLocaleString(S.lang === 'vi' ? 'vi-VN' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function clamp(v) { v = Math.round(Number(v)); return isFinite(v) ? Math.max(0, Math.min(100, v)) : 0; }

  // Ngôn ngữ chung toàn site (bizon-lang) thắng lựa chọn riêng đã lưu của lab.
  function siteLang() { try { const g = localStorage.getItem('bizon-lang'); if (g === 'vi' || g === 'en') S.lang = g; } catch (e) {} }
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (d && typeof d === 'object') {
        const n = Object.assign(clone(DEFAULT), d);
        if (!Array.isArray(n.xp) || n.xp.length !== 5 || n.xp.some(x => typeof x !== 'number' || !isFinite(x))) n.xp = START_XP.slice();
        if (!Array.isArray(n.released) || n.released.length !== 5) n.released = REL0.slice();
        n.released = n.released.map(Boolean);
        n.team = Math.floor(n.team); if (!(n.team >= 0 && n.team <= 4)) n.team = 0;
        if (n.lang !== 'vi' && n.lang !== 'en') n.lang = 'en';
        if (!IP_MARKETS.some(m => m.id === n.mk)) n.mk = 'vn';
        n.x = clamp(n.x); n.tci = clamp(n.tci); n.dai = clamp(n.dai);
        if (!Array.isArray(n.seen)) n.seen = ['transition'];
        n.seen = n.seen.filter(r => REG[r]);
        if (!n.answers || typeof n.answers !== 'object' || Array.isArray(n.answers)) n.answers = {};
        n.tab = Math.floor(n.tab); if (!(n.tab >= 0 && n.tab <= 3)) n.tab = 0;
        S = n;
      }
    } catch (e) {}
    siteLang();
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }
  function setLang(l) {
    S.lang = l === 'vi' ? 'vi' : 'en';
    try { localStorage.setItem('bizon-lang', S.lang); localStorage.removeItem('bizon-lang-auto'); } catch (e) {}
  }

  /* ---------- đồ thị ---------- */
  const X = v => +(56 + v / 100 * 572).toFixed(1);
  function series(m) { const a = []; for (let i = 0; i <= 100; i += 2) a.push([i, ipPerf(m, i, S.tci, S.dai)]); return a; }
  const F = 'font-family="Nunito, sans-serif" font-weight="800"';

  function oneChart(m, y, t) {
    const a = series(m), lo = Math.min(...a.map(p => p[1])), hi = Math.max(...a.map(p => p[1])), sp = hi - lo || 1;
    const Y = v => +(264 - (v - lo) / sp * 228).toFixed(1);
    const pooled = m.regime === 'pooled', pk = pooled ? 43.6 : 43, hasPk = m.regime === 'transition' || pooled;
    const pts = a.map(p => X(p[0]) + ',' + Y(p[1])).join(' '), dx = X(S.x), dy = Y(y);
    let s = `<svg viewBox="0 0 640 300" role="img" aria-label="${esc(t.chartAria)}">`;
    s += `<line x1="56" y1="264" x2="628" y2="264" stroke="#9AA0AC" stroke-width="2"/><line x1="56" y1="16" x2="56" y2="264" stroke="#9AA0AC" stroke-width="2"/>`;
    if (hasPk) s += `<line x1="${X(pk)}" y1="16" x2="${X(pk)}" y2="264" stroke="#C9A24A" stroke-width="3" stroke-dasharray="6 6"/><text x="${X(pk) + 8}" y="34" ${F} font-size="14" fill="#8A6A1E">${t.peak} ${nf(pk, pooled ? 1 : 0)}%</text>`;
    s += `<polyline points="${pts}" fill="none" stroke="${REG[m.regime]}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<line x1="${dx}" y1="264" x2="${dx}" y2="${dy}" stroke="#1F2A44" stroke-width="2" stroke-dasharray="3 5"/>`;
    s += `<circle cx="${dx}" cy="${dy}" r="11" fill="#C9A24A" stroke="#1F2A44" stroke-width="3"/>`;
    s += `<text x="62" y="288" ${F} font-size="13" fill="#5F6675">FSTS 0%</text><text x="628" y="288" text-anchor="end" ${F} font-size="13" fill="#5F6675">100%</text>`;
    s += `<text x="48" y="${Y(hi) + 4}" text-anchor="end" font-family="Nunito, sans-serif" font-weight="700" font-size="12" fill="#5F6675">${nf(hi, 0)}</text>`;
    s += `<text x="48" y="268" text-anchor="end" font-family="Nunito, sans-serif" font-weight="700" font-size="12" fill="#5F6675">${nf(lo, 0)}</text>`;
    return s + '</svg>';
  }

  function cmpChart(t, m) {
    const all = CV.map(series), flat = all.flat().map(p => p[1]), lo = Math.min(...flat), sp = (Math.max(...flat) - lo) || 1;
    const Ya = v => +(264 - (v - lo) / sp * 236).toFixed(1);
    let s = `<svg viewBox="0 0 640 300" role="img" aria-label="${esc(t.cmpAria)}">`;
    s += `<line x1="56" y1="264" x2="628" y2="264" stroke="#9AA0AC" stroke-width="2"/>`;
    s += `<line x1="${X(43)}" y1="16" x2="${X(43)}" y2="264" stroke="#C9A24A" stroke-width="${m ? 3 : 2}" stroke-dasharray="${m ? '6 6' : '5 6'}"/>`;
    CV.forEach((c, i) => { s += `<polyline points="${all[i].map(p => X(p[0]) + ',' + Ya(p[1])).join(' ')}" fill="none" stroke="${REG[c.regime]}" stroke-width="${m ? 7 : 4.5}" stroke-linecap="round" stroke-linejoin="round"/>`; });
    if (!m) s += `<text x="62" y="288" ${F} font-size="13" fill="#5F6675">FSTS 0%</text><text x="628" y="288" text-anchor="end" ${F} font-size="13" fill="#5F6675">100%</text>`;
    return s + '</svg>';
  }

  /* ---------- hiển thị ---------- */
  function render() {
    const t = T[S.lang], vi = S.lang === 'vi';
    document.documentElement.lang = S.lang;
    if (document.title !== t.title) document.title = t.title;
    document.querySelectorAll('[data-act="lang"]').forEach(b => { const on = b.dataset.v === S.lang; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    if (view === 'teacher') renderTeacher(t); else renderStudent(t, vi);
    save();
  }

  function renderStudent(t, vi) {
    const m = ieMarket(S.mk), y = ipPerf(m, S.x, S.tci, S.dai), mob = mq.matches;
    const xp = S.xp[S.team], max = Math.max(...S.xp, 1);
    const enM = IP_EN[m.id];

    // nav
    txt('navSub', t.sub); txt('backLink', t.back); txt('lang1', vi ? 'EN' : 'VI');
    $('lang1').setAttribute('aria-label', t.langSw);
    const nb = $('navBadge'); nb.textContent = no(S.team); nb.style.background = COLORS[S.team]; nb.style.color = fg(S.team);
    txt('navXp', xp + ' XP');

    // hero + team card
    txt('eyebrow', t.kicker); txt('hero1', t.hero1); txt('hero2', t.hero2); txt('hero3', t.hero3); txt('intro', t.intro);
    $('heroDragon').alt = t.dragonHero;
    const tc = $('teamCard'); tc.style.background = COLORS[S.team]; tc.style.color = fg(S.team);
    txt('tcName', t.team.toUpperCase() + ' T' + no(S.team)); txt('tcLevel', ieLevelName(xp, S.lang)); txt('lvlNo', ieLevel(xp) + 1);
    txt('xpLbl', t.xpp); txt('xpTxt', (xp % 100) + ' / 100 XP'); $('xpFill').style.width = (xp % 100) + '%';
    txt('bdT', t.badges);
    html('badges', BC.map(([r, cv, ce]) => {
      const on = S.seen.includes(r), code = vi ? cv : ce;
      return `<div class="bdg${on ? ' on' : ''}" role="img" title="${esc(t.reg[r])}" aria-label="${esc(code + ': ' + t.reg[r] + (on ? ' ✓' : ''))}" style="${on ? 'background:' + REG[r] : ''}">${code}</div>`;
    }).join(''));

    // team picker
    txt('pickTitle', t.pick); txt('pickSub', t.teamSub);
    html('teams', S.xp.map((x, i) => `<button type="button" class="team-tile${i === S.team ? ' on' : ''}" data-act="team" data-i="${i}" aria-pressed="${i === S.team}" aria-label="${esc(t.team)} T${no(i)} · ${x} XP" style="background:${COLORS[i]};color:${fg(i)}"><b><i>T</i>${no(i)}</b><span>${x} XP</span></button>`).join(''));

    // step 1
    txt('chooseM', t.chooseM); txt('step1', t.step + ' 1');
    html('markets', IP_MARKETS.map(k => {
      const on = k.id === S.mk, e = IP_EN[k.id], name = vi ? k.name : e.name;
      return `<button type="button" class="mk${on ? ' on' : ''}" data-act="mk" data-id="${k.id}" aria-pressed="${on}" aria-label="${esc(name + ' · ' + t.reg[k.regime])}"><span class="dot" style="background:${REG[k.regime]}">${e.code}</span><span class="nm">${esc(name)}</span><span class="cd">${e.code}</span></button>`;
    }).join(''));
    [['x', t.fsts, t.fstsH, '%'], ['tci', t.tci, t.tciH, '/100'], ['dai', t.dai, t.daiH, '/100']].forEach(([k, l, h, u]) => {
      txt('l_' + k, l); txt('h_' + k, h); txt('v_' + k, S[k] + u);
      const inp = $('in_' + k); if (inp.value !== String(S[k])) inp.value = S[k];
    });
    const perf = $('perf'); perf.style.background = REG[m.regime];
    txt('perfL', t.perf); txt('perfR', t.reg[m.regime]); txt('score', nf(y, 1));
    html('chartOne', oneChart(m, y, t));
    $('scrollDragon').alt = t.dragonScroll;
    let verdict;
    if (m.regime === 'fip') verdict = S.x > 30 ? t.vFipHi : t.vFipLo;
    else if (m.regime === 'strong') verdict = t.vStrong + (m.shield ? t.vShield : '.');
    else verdict = S.x > 55 ? t.vOver : S.x < 20 ? t.vUnder : t.vOpt;
    txt('note', vi ? m.note : enM.note); txt('verdict', verdict);

    // step 2
    txt('cmpT', t.cmp); txt('step2', t.step + ' 2'); txt('cmpNote', t.cmpNote);
    html('cmpLegend', CV.map(c => `<span><i style="background:${REG[c.regime]}"></i>${esc(t.reg[c.regime])}</span>`).join(''));
    html('chartAll', cmpChart(t, mob));
    txt('modesT', t.modes); txt('illus', t.illus); txt('modesNote', t.modesNote);
    html('dims', t.dims.map((l, i) => `<span><i style="background:${DIMC[i]}"></i>${esc(l)}</span>`).join(''));
    html('modeBars', Object.keys(IE_MODES).map((k, i) => `<div class="mg"><div class="mb">${IE_MODES[k].map((v, j) => `<i title="${esc(t.dims[j] + ': ' + nf(v, 1))}" style="height:${v * 10}%;background:${DIMC[j]}"></i>`).join('')}</div><b>${esc(t.modeL[i])}</b></div>`).join(''));

    // step 3 – missions
    const solved = Object.values(S.answers).filter(a => a === 0).length;
    txt('missT', t.missions); txt('solved', solved + '/5'); txt('step3', t.step + ' 3');
    const mcq = { 3: t.m4, 4: t.m5 };
    html('missions', t.mq.map((q, ci) => {
      const a = S.answers[ci], done = a !== undefined, rel = S.released[ci], right = a === 0;
      const tag = !rel ? t.wait : done ? (right ? '+10 XP ✓' : t.notq) : '+10 XP';
      const tagBg = done ? (right ? '#3F6E52' : '#8C2F39') : rel ? '#C9A24A' : '#B9B5AC', tagFg = done ? '#fff' : '#1F2A44';
      const off = !rel || done ? ' disabled' : '';
      let opts;
      if (ci < 3) {
        const bg = done ? '#8FAF98' : rel ? '#3E5C8A' : '#ECE7DC', col = done ? '#1F2A44' : rel ? '#fff' : '#9AA0AC';
        opts = `<div class="opts c1"><button type="button" class="opt" data-act="check" data-ci="${ci}" style="background:${bg};color:${col}"${off}>${done ? '✓' : esc(t.check)}</button></div>`;
      } else {
        opts = `<div class="opts" role="group" aria-label="${esc(q)}">` + IE_MCQ_ORDER[ci].map(oi => {
          const bg = done && oi === 0 ? '#8FAF98' : a === oi ? '#8C2F39' : '#ECE7DC';
          const col = a === oi && oi !== 0 ? '#fff' : rel ? '#1F2A44' : '#9AA0AC';
          return `<button type="button" class="opt" data-act="answer" data-ci="${ci}" data-oi="${oi}" style="background:${bg};color:${col}"${off}>${esc(mcq[ci][oi])}</button>`;
        }).join('') + '</div>';
      }
      return `<div class="mis${rel ? '' : ' locked'}" data-ci="${ci}" data-state="${!rel ? 'locked' : done ? (right ? 'right' : 'wrong') : 'open'}"><div class="mis-top"><p class="q">${esc(q)}</p><span class="mtag" style="background:${tagBg};color:${tagFg}">${esc(tag)}</span></div>${opts}</div>`;
    }).join(''));

    // leaderboard
    txt('boardT', t.board); txt('boardS', t.boardS);
    html('boardRows', S.xp.map((x, i) => ({ i, x })).sort((a, b) => b.x - a.x).map((r, k) => `<div class="brow${r.i === S.team ? ' me' : ''}"><div class="rank" style="background:${COLORS[r.i]};color:${fg(r.i)}">${k + 1}</div><div><div class="bname">${esc(t.team)} T${no(r.i)} · ${esc(ieLevelName(r.x, S.lang))}</div><div class="bbar"><i style="width:${r.x / max * 100}%;background:${COLORS[r.i]}"></i></div></div><div class="bxp">${r.x} XP</div></div>`).join(''));

    // real-world benchmark
    txt('stiT', t.stiT); txt('stiReal', t.real); html('stiIntro', t.stiIntro);
    html('stiTiles', STI.map(([v, r], i) => `<div class="kpi"><span>${esc(t.stiL[i])}</span><b>${v}</b><small>${t.rank} ${r}/30</small></div>`).join(''));
    html('stiFacts', t.stiF.map(f => `<li>${esc(f)}</li>`).join(''));
    html('stiSrc', t.stiSrc);

    // footer
    txt('credit', t.credit); txt('disc', t.disc); txt('uniLink', t.uni); txt('teacherLink', t.teacherLink);

    // mobile tabs
    html('tabbar', t.tabs.map((l, i) => `<button type="button" class="${S.tab === i ? 'on' : ''}" data-act="tab" data-i="${i}" aria-pressed="${S.tab === i}">${esc(l)}</button>`).join(''));
    document.querySelectorAll('#student [data-tab]').forEach(el => el.classList.toggle('on', el.dataset.tab.split(' ').includes(String(S.tab))));

    // overlays
    $('modal').hidden = !modal;
    txt('mLvl', ieLevel(xp) + 1); txt('mTitle', t.lvlUp); txt('mText', t.unlocked + ' · ' + ieLevelName(xp, S.lang)); txt('mCont', t.cont);
    $('jumpDragon').alt = t.dragonUp;
    const to = $('toast'); to.hidden = !toast;
    if (toast) { to.textContent = toast.text; to.style.background = toast.bg; }
  }

  function renderTeacher(t) {
    const max = Math.max(...S.xp, 1);
    $('waveDragon').alt = t.dragonWave;
    txt('tClass', t.classView); txt('tRace', t.race);
    txt('tTotalL', t.total); txt('tTotal', S.xp.reduce((a, b) => a + b, 0));
    txt('tLiveL', t.live); txt('tLive', S.released.filter(Boolean).length + '/5');
    html('tcols', S.xp.map((x, i) => `<div class="tc"><div class="v">${x}</div><div class="bw"><i style="height:${Math.max(6, x / max * 100)}%;background:${COLORS[i]}"></i></div><div class="tn">T${no(i)}</div></div>`).join(''));
    txt('tRel', t.release);
    html('relCtl', t.rel.map((l, i) => `<button type="button" class="rel${S.released[i] ? ' on' : ''}" role="switch" aria-checked="${S.released[i]}" data-act="rel" data-i="${i}"><span>${esc(l)}</span><span class="track" aria-hidden="true"><i></i></span></button>`).join(''));
    txt('tAward', t.award);
    html('awardCtl', S.xp.map((x, i) => `<button type="button" data-act="award" data-i="${i}" aria-label="${esc(t.award)} T${no(i)} +10 XP" style="background:${COLORS[i]};color:${fg(i)}"><b>T${no(i)}</b><span>+10</span></button>`).join(''));
    txt('tReset', t.reset); txt('tBack', t.backStudent);
    $('modal').hidden = true; $('toast').hidden = true;
  }

  function applyView() {
    const q = new URLSearchParams(location.search);
    view = location.hash === '#teacher' || q.get('view') === 'teacher' ? 'teacher' : 'student';
    $('student').hidden = view === 'teacher';
    $('teacher').hidden = view !== 'teacher';
    document.body.classList.toggle('is-teacher', view === 'teacher');
    render();
  }

  function flash(text, bg) {
    toast = { text, bg };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast = null; render(); }, 1800);
  }
  function gain(n) {
    const before = ieLevel(S.xp[S.team]);
    S.xp = S.xp.slice(); S.xp[S.team] += n;
    if (ieLevel(S.xp[S.team]) > before) modal = true;
  }

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act, t = T[S.lang];
    if (act === 'lang') setLang(el.dataset.v);
    else if (act === 'langT') setLang(S.lang === 'vi' ? 'en' : 'vi');
    else if (act === 'team') { S.team = Number(el.dataset.i); S.answers = {}; }
    else if (act === 'mk') { const k = ieMarket(el.dataset.id); S.mk = k.id; if (!S.seen.includes(k.regime)) S.seen = S.seen.concat(k.regime); }
    else if (act === 'tab') { S.tab = Number(el.dataset.i); window.scrollTo(0, 0); }
    else if (act === 'check') {
      const ci = Number(el.dataset.ci);
      if (!S.released[ci] || S.answers[ci] !== undefined) return;
      if (ieCheck(ci, S)) { S.answers = Object.assign({}, S.answers, { [ci]: 0 }); gain(10); flash(t.done, '#8FAF98'); }
      else flash(t.notYet, '#E3C7C2');
    }
    else if (act === 'answer') {
      const ci = Number(el.dataset.ci), oi = Number(el.dataset.oi);
      if (!S.released[ci] || S.answers[ci] !== undefined) return;
      S.answers = Object.assign({}, S.answers, { [ci]: oi });
      if (oi === 0) { gain(10); flash(t.done, '#8FAF98'); }
    }
    else if (act === 'close') modal = false;
    else if (act === 'rel') { const i = Number(el.dataset.i); S.released = S.released.slice(); S.released[i] = !S.released[i]; }
    else if (act === 'award') { const i = Number(el.dataset.i); S.xp = S.xp.slice(); S.xp[i] += 10; }
    else if (act === 'reset') { S.xp = START_XP.slice(); S.answers = {}; S.released = REL0.slice(); S.seen = ['transition']; }
    else if (act === 'teacher') { e.preventDefault(); location.hash = 'teacher'; return; }
    else if (act === 'student') {
      e.preventDefault();
      const q = new URLSearchParams(location.search); q.delete('view');
      const qs = q.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
      applyView(); return;
    }
    else return;
    render();
    if (modal && (act === 'check' || act === 'answer')) $('mCont').focus();
  });

  ['x', 'tci', 'dai'].forEach(k => $('in_' + k).addEventListener('input', e => { S[k] = clamp(e.target.value); render(); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal) { modal = false; render(); } });
  // Màn hình lớp (#teacher hoặc ?view=teacher) mở ở cửa sổ khác trên cùng máy → đồng bộ qua localStorage.
  window.addEventListener('storage', e => {
    if (e.key === STORE || e.key === 'bizon-lang') { const tab = S.tab; load(); S.tab = tab; render(); }
  });
  window.addEventListener('hashchange', applyView);
  if (mq.addEventListener) mq.addEventListener('change', render); else if (mq.addListener) mq.addListener(render);

  // Cho kiểm thử và bảng điều khiển giảng viên đọc trạng thái (chỉ đọc).
  window.ieLabState = () => clone(S);

  load();
  applyView();
})();
