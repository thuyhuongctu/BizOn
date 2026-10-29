/* BizOn – Thư viện tình huống: lọc case theo ngành học và vùng, xem chi tiết theo thẻ (tóm tắt, mục tiêu, mô phỏng, ghi chú).
 * Ghi chú giảng dạy đầy đủ nằm ở Bộ công cụ giảng dạy (cham/bo-cong-cu.html); trang này không giả lập khóa đăng nhập. */
(function () {
  'use strict';
  const K = window.ChamKit, t = K.t, esc = K.esc;
  const L = (vi, en) => ({ vi, en });
  const ALL = L('Tất cả', 'All');
  const CASES = [
    { id: 'cham', t: 'CHAM Homestay', d: L('Kế hoạch homestay đầu tiên trên cù lao Tân Lộc. Kế hoạch hòa vốn sau 5 tháng, nếu tin vào chính các con số của nó.', 'A plan for the first homestay on Tân Lộc islet. It breaks even in 5 months, if you trust its own numbers.'),
      disc: [L('Khởi nghiệp', 'Entrepreneurship'), L('Tài chính', 'Finance'), L('Marketing', 'Marketing')], region: L('Cần Thơ', 'Cần Thơ'), level: L('Bậc 2', 'Tier 2'), status: L('ĐẦY ĐỦ · 6 MÔ PHỎNG', 'COMPLETE · 6 SIMULATIONS'), bg: 'var(--ch-river)' },
    { id: 'bps', t: 'Bến Phù Sa', d: L('Gánh hàng rong trên chợ nổi: chọn phương thức, món hàng, địa điểm mỗi tuần. Khi nào thử nhanh, khi nào nhân rộng.', 'A street-vendor business on the floating market: choose method, product and place each week. When to test fast, when to scale.'),
      disc: [L('Khởi nghiệp', 'Entrepreneurship')], region: L('ĐBSCL', 'Mekong Delta'), level: L('Bậc 1', 'Tier 1'), status: L('CÓ MÔ PHỎNG · CASE ĐANG BIÊN SOẠN', 'SIMULATION READY · CASE IN PREPARATION'), bg: 'var(--ch-yellow-t)', game: 'ben-phu-sa-3d.html' },
    { id: 'srp', t: 'Hộ Chiếu Sầu Riêng', d: L('Đưa sầu riêng Việt ra thế giới: mã số vùng trồng, nghị định thư kiểm dịch, chính ngạch và tiểu ngạch.', 'Taking Vietnamese durian global: growing-area codes, quarantine protocols, formal and informal export.'),
      disc: [L('Quốc tế hóa', 'Internationalisation'), L('Chuỗi cung ứng', 'Supply chain')], region: L('Việt Nam', 'Vietnam'), level: L('Bậc 3', 'Tier 3'), status: L('CÓ MÔ PHỎNG · CASE ĐANG BIÊN SOẠN', 'SIMULATION READY · CASE IN PREPARATION'), bg: 'var(--ch-leaf)', game: 'ho-chieu-sau-rieng.html' }
  ];
  const SIMS = [
    [L('20 PHÚT · CÁ NHÂN', '20 MIN · SOLO'), L('Một ngày ở Tân Lộc', 'A day on Tân Lộc'), L('Đọc case qua 24 giờ trên cù lao.', 'Read the case as 24 hours on the islet.'), 'cham/mot-ngay.html', 'var(--ch-river)'],
    [L('30 PHÚT · NHÓM', '30 MIN · TEAMS'), L('Trò chơi nhà sáng lập', 'Founder game'), L('Bảy quyết định, kết quả 5 năm.', 'Seven decisions, five years of results.'), 'cham/tro-choi.html', 'var(--ch-yellow-t)'],
    [L('45 PHÚT · NHÓM', '45 MIN · TEAMS'), L('Thẩm định kế hoạch', 'Plan review'), L('Bút đỏ trên sáu phần của kế hoạch.', 'A red pen over six sections of the plan.'), 'cham/tham-dinh.html', 'var(--ch-brick-t)'],
    [L('2 BUỔI · 4 ĐỘI', '2 SESSIONS · 4 TEAMS'), L('Đấu trường Cù lao Tân Lộc', 'Tân Lộc Arena'), L('Kịch bản Bậc 2, sáu mùa, ba đối thủ.', 'Tier-2 scenario: six seasons, three rivals.'), 'cham/dau-truong.html', 'var(--ch-leaf)'],
    [L('GIẢNG VIÊN', 'INSTRUCTOR'), L('Bộ công cụ giảng dạy', 'Teaching kit'), L('Máy tính hòa vốn, soát lỗi, tin đăng mẫu, ghi chú.', 'Payback calculator, plan audit, sample listing, notes.'), 'cham/bo-cong-cu.html', 'var(--ch-raised)'],
    [L('GIẢNG VIÊN', 'INSTRUCTOR'), L('Bài giảng 8 slide', '8-slide teaching deck'), L('Trình chiếu trên lớp, in được ra PDF.', 'For class, printable to PDF.'), 'cham/bai-giang.html', 'var(--ch-lilac)']
  ];
  const GOALS = [L('Đọc và phản biện một kế hoạch kinh doanh khởi nghiệp.', 'Read and critique a startup business plan.'), L('Tính hòa vốn trên đúng khoản vốn đầu tư.', 'Calculate payback on the right investment base.'),
    L('Đánh giá chiến lược giá theo mùa và theo nhóm khách.', 'Evaluate pricing by season and by guest segment.'), L('Đề xuất cách khác biệt hóa khi rào cản gia nhập thấp, so sánh với đối thủ thật là Homestay Cẩm Lụa.', 'Propose differentiation when entry barriers are low, benchmarked against the real competitor Homestay Cẩm Lụa.')];
  const TABS = [L('Tóm tắt', 'Summary'), L('Mục tiêu học tập', 'Learning objectives'), L('Mô phỏng', 'Simulations'), L('Ghi chú giảng dạy', 'Teaching notes')];
  const S = { disc: 'vi:' + ALL.vi, region: 'vi:' + ALL.vi, open: 'cham', tab: 0 };
  const key = o => 'vi:' + o.vi;  /* lọc theo khóa tiếng Việt để đổi ngôn ngữ không mất bộ lọc */

  function chips(id, field, opts) {
    K.$('#' + id).innerHTML = opts.map(o => '<button type="button" class="ch-chip" data-f="' + field + '" data-v="' + esc(key(o)) + '" aria-pressed="' + (S[field] === key(o)) + '">' + esc(t(o)) + '</button>').join('');
  }
  function uniq(list) { const m = new Map(); list.forEach(o => m.set(o.vi, o)); return Array.from(m.values()); }

  function render() {
    chips('lb-disc', 'disc', [ALL].concat(uniq(CASES.flatMap(c => c.disc))));
    chips('lb-region', 'region', [ALL].concat(uniq(CASES.map(c => c.region))));
    const list = CASES.filter(c => (S.disc === key(ALL) || c.disc.some(d => key(d) === S.disc)) && (S.region === key(ALL) || key(c.region) === S.region));
    const meta = c => t(c.level) + ' · ' + t(c.region) + ' · ' + c.disc.map(t).join(', ');
    K.$('#lb-cases').innerHTML = list.map(c => '<button type="button" class="lb-case" data-open="' + c.id + '" aria-pressed="' + (S.open === c.id) + '" style="background:' + c.bg + '"><span class="st">' + t(c.status) + '</span><span class="ch-k">' + esc(meta(c)) + '</span><b>' + esc(c.t) + '</b><span class="d">' + esc(t(c.d)) + '</span></button>').join('');
    K.$('#lb-empty').hidden = list.length > 0;
    const cur = CASES.find(c => c.id === S.open) || CASES[0], isCham = cur.id === 'cham', tabs = isCham ? TABS : TABS.slice(0, 1), tab = Math.min(S.tab, tabs.length - 1);
    let body = '';
    if (!isCham) body = '<p class="ch-proto">' + t({ vi: 'Case đang biên soạn. Mô phỏng đã chơi được trên BizOn: ', en: 'Case in preparation. The simulation is already playable on BizOn: ' }) + '<a href="' + cur.game + '">' + esc(cur.t) + ' →</a></p><p style="margin-top:12px">' + esc(t(cur.d)) + '</p>';
    else if (tab === 0) body = '<div class="ch-grid" style="--ch-min:170px;margin-bottom:16px">' + [[L('Địa điểm', 'Location'), L('Cù lao Tân Lộc, Thốt Nốt', 'Tân Lộc islet, Thốt Nốt'), 'var(--ch-river)'], [L('Tổng vốn', 'Total capital'), L('4 tỷ đồng', '4 billion đ'), 'var(--ch-yellow-t)'], [L('Doanh thu năm 1 (KH)', 'Year-1 revenue (plan)'), L('1.761 triệu đ', '1,761 million đ'), 'var(--ch-leaf)'], [L('Hòa vốn (KH)', 'Payback (plan)'), L('5 tháng 23 ngày', '5 months 23 days'), 'var(--ch-brick-t)']]
        .map(([k, v, bg]) => '<div class="ch-card sm" style="background:' + bg + '"><div class="ch-k">' + t(k) + '</div><div class="ch-v" style="font-size:21px">' + t(v) + '</div></div>').join('') + '</div><p style="line-height:1.65">' +
        t({ vi: 'Cần Thơ đón trên 5,2 triệu lượt khách trong 8 tháng đầu năm 2017 nhưng chỉ khoảng 1,3 triệu lượt lưu trú. Trên cù lao Tân Lộc chưa có cơ sở nào cho khách ở lại qua đêm. CHAM đề xuất sáu nhà lá, vé tham quan 80.000 đ, ẩm thực đồng quê và đặc sản từ cúc la mã. Khi đối chiếu, các bảng trong kế hoạch có ít nhất năm chỗ không khớp nhau. Kế hoạch cho rằng CHAM là homestay duy nhất trên cù lao; thực tế hiện đã có Homestay Cẩm Lụa (khu vực Long Châu, phường Tân Lộc) với nhà vườn ven sông, chèo thuyền, câu cá, hái trái cây và BBQ, giá phòng 250.000–450.000 đ/đêm. Bên kia sông, cách 5–10 phút đò, khách sạn ở Thốt Nốt có giá khoảng 300.000–350.000 đ/đêm: đây là dịch vụ thay thế trực tiếp cho một đêm trên cù lao.',
          en: 'Cần Thơ had over 5.2 million visits in the first 8 months of 2017 but only about 1.3 million overnight stays, and Tân Lộc islet had nowhere to stay. CHAM proposes six thatched huts, an 80,000 đ day pass, country food and chamomile products. Checked against each other, the plan’s tables disagree in at least five places. The plan assumes CHAM will be the only homestay on the islet; today Homestay Cẩm Lụa (Long Châu, Tân Lộc ward) offers a riverside garden, boating, fishing, fruit picking and BBQ at 250,000–450,000 đ a night. Across the river, 5–10 minutes by ferry, hotels in Thốt Nốt charge about 300,000–350,000 đ: a direct substitute for a night on the islet.' }) +
        '</p><div class="ch-row" style="margin-top:14px"><a class="ch-btn" href="cham/">' + t({ vi: 'Mở dự án CHAM', en: 'Open the CHAM project' }) + '</a><a class="ch-btn soft" href="cham/ke-hoach-2017.html">' + t({ vi: 'Trang tình huống', en: 'Case page' }) + '</a></div>';
    else if (tab === 1) body = GOALS.map((g, i) => '<div class="lb-goal"><span class="n">' + (i + 1) + '</span><span>' + t(g) + '</span></div>').join('');
    else if (tab === 2) body = '<div class="lb-sims">' + SIMS.map(([tg, ti, d, href, bg]) => '<a href="' + href + '" style="background:' + bg + '"><span class="tg">' + t(tg) + '</span><b>' + t(ti) + ' →</b><span>' + t(d) + '</span></a>').join('') + '</div>';
    else body = '<p>' + t({ vi: 'Kế hoạch hai buổi học, đáp án gợi ý và rubric 100 điểm nằm trong Bộ công cụ giảng dạy.', en: 'The two-session plan, suggested answers and the 100-point rubric are in the teaching kit.' }) +
      '</p><p class="ch-note" style="margin-top:8px">' + t({ vi: 'Bản chính thức sẽ chỉ mở ghi chú khi giảng viên đăng nhập; hiện chưa có khóa.', en: 'The live version will open notes only after an instructor login; there is no lock yet.' }) + '</p><div class="ch-row" style="margin-top:12px"><a class="ch-btn" href="cham/bo-cong-cu.html#tk4">' + t({ vi: 'Mở ghi chú giảng dạy', en: 'Open teaching notes' }) + '</a></div>';
    K.$('#lb-detail').innerHTML = '<div class="ch-k">' + esc(meta(cur)) + '</div><h2 style="margin:4px 0 0">' + esc(cur.t) + '</h2>' +
      '<div class="lb-tabs" role="tablist">' + tabs.map((x, i) => '<button type="button" role="tab" id="lb-tab-' + i + '" aria-controls="lb-panel" data-tab="' + i + '" aria-selected="' + (i === tab) + '" tabindex="' + (i === tab ? 0 : -1) + '">' + t(x) + '</button>').join('') + '</div>' +
      '<div role="tabpanel" id="lb-panel" aria-labelledby="lb-tab-' + tab + '">' + body + '</div>';
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.f) { S[b.dataset.f] = b.dataset.v; render(); }
    else if (b.dataset.open) { S.open = b.dataset.open; S.tab = 0; render(); }
    else if (b.dataset.tab) { S.tab = +b.dataset.tab; render(); K.$('#lb-tab-' + S.tab).focus(); }
  });
  document.addEventListener('keydown', e => {
    const b = e.target.closest && e.target.closest('[role="tab"]'); if (!b || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    const n = K.$('#lb-detail').querySelectorAll('[role="tab"]').length; S.tab = (S.tab + (e.key === 'ArrowRight' ? 1 : -1) + n) % n; render(); K.$('#lb-tab-' + S.tab).focus();
  });
  K.mount(render);
})();
