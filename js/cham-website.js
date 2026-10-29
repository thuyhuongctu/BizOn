/* CHAM – mẫu website cho khách: điều hướng theo #mã-màn-hình, ô đếm đêm ở trang chủ, lưới 6 nhà lá, giỏ đặc sản,
 * quy trình đặt phòng 3 bước có trạng thái dùng chung với màn hình xác nhận. Bản mẫu cho bài học: không gửi dữ liệu đi đâu.
 * Quy tắc giá theo bản bàn giao: phòng 500.000 đ/đêm (tác giả xác nhận 29/10/2026; kế hoạch gốc ghi 50.000 đ), bữa tối ~120.000 đ/khách. */
(function () {
  'use strict';
  const K = window.ChamKit, t = K.t, esc = K.esc;
  const ROOM = 500000, DINNER = 120000, COOK = 150000, BOOKED = [2, 5];
  const HUTS = [{ vi: 'Nhà Cúc', en: 'Chamomile' }, { vi: 'Nhà Dừa', en: 'Coconut' }, { vi: 'Nhà Ổi', en: 'Guava' }, { vi: 'Nhà Mận', en: 'Plum' }, { vi: 'Nhà Lục Bình', en: 'Water Hyacinth' }, { vi: 'Nhà Đom Đóm', en: 'Firefly' }];
  const SCREENS = Array.from(document.querySelectorAll('.ws-screen')).map(s => s.dataset.screen);
  const S = { nights: 1, cart: 0, step: 1, bNights: 1, bRooms: 1, bGuests: 2, dinner: true, cls: false, name: '', phone: '' };
  const LIM = { nights: [1, 7], bNights: [1, 7], bRooms: [1, 6] };
  const PRODUCTS = [
    { img: '../assets/cham/anh/tra-cuc.webp', bg: 'var(--ch-yellow-t)', name: { vi: 'Trà cúc la mã khô', en: 'Dried chamomile tea' }, price: { vi: '80.000 đ / 500 g', en: '80,000 đ / 500 g' }, art: { vi: 'hộp trà', en: 'tea tin' } },
    { img: '../assets/cham/anh/tinh-dau.webp', bg: 'var(--ch-leaf)', name: { vi: 'Tinh dầu cúc la mã', en: 'Chamomile essential oil' }, price: { vi: '50.000 đ / 15 ml', en: '50,000 đ / 15 ml' }, art: { vi: 'chai tinh dầu', en: 'oil bottle' } },
    { img: '../assets/cham/anh/mam-ca-tra.webp', bg: 'var(--ch-brick-t)', name: { vi: 'Mắm cá tra', en: 'Fermented pangasius (mắm cá tra)' }, price: { vi: '120.000 đ / kg', en: '120,000 đ / kg' }, art: { vi: 'hũ sành', en: 'clay jar' } }
  ];
  /* Khám phá cù lao: ảnh minh họa đất sét do tác giả cung cấp (assets/cham/anh/) */
  const G = (vi, en, items) => ({ vi, en, items });
  const EXPLORE = [
    G('Vườn trái cây', 'Orchards', [['vuon-xoai', 'Vườn xoài', 'Mango grove'], ['vuon-oi', 'Vườn ổi', 'Guava orchard'], ['vuon-man', 'Vườn mận', 'Rose-apple orchard'],
      ['vuon-nhan', 'Nhãn xuồng cơm vàng', 'Xuồng cơm vàng longan'], ['vuon-vu-sua', 'Vú sữa Lò Rèn & bơ hồng', 'Lò Rèn star apple & avocado'], ['vuon-dau', 'Dâu Hạ Châu', 'Hạ Châu baccaurea'],
      ['vuon-mang-cau', 'Mãng cầu', 'Soursop'], ['vuon-thanh-long', 'Thanh long ruột đỏ', 'Red dragon fruit'], ['vuon-buoi', 'Bưởi da xanh', 'Green-skin pomelo'],
      ['vuon-mit', 'Mít Thái', 'Thai jackfruit'], ['vuon-sau-rieng', 'Sầu riêng', 'Durian'], ['vuon-mang-cut', 'Măng cụt', 'Mangosteen'], ['vuon-trai-cay', 'Mận An Phước & xoài', 'An Phước plums & mangoes']]),
    G('Làng nghề & đặc sản', 'Crafts & specialties', [['nuoc-mam-ca-linh', 'Nước mắm cá linh', 'Mud-carp fish sauce'], ['mam', 'Mắm cá', 'Fermented fish'], ['chao-mon', 'Chao môn', 'Taro fermented tofu'],
      ['keo-dua', 'Kẹo dừa', 'Coconut candy'], ['banh-trang-ngot', 'Bánh tráng ngọt dừa mè sữa', 'Sweet coconut-sesame rice paper'], ['com-dep', 'Cốm dẹp & nổ cốm gạo', 'Flattened & puffed rice'],
      ['nau-duong', 'Nấu đường thốt nốt', 'Palm sugar'], ['mat-hoa-dua', 'Mật hoa dừa', 'Coconut-blossom nectar'], ['bo-choi', 'Bó chổi đót & chổi cọng dừa', 'Broom making'],
      ['dan-may-tre', 'Đan đát mây tre', 'Rattan & bamboo weaving'], ['det-chieu', 'Dệt chiếu', 'Mat weaving'], ['dan-luoi', 'Đan lưới', 'Net mending'], ['be-ca', 'Bè nuôi cá', 'Fish rafts']]),
    G('Món ăn miệt sông', 'River food', [['lau-mam', 'Lẩu mắm', 'Fermented-fish hotpot'], ['canh-chua-bong-lau', 'Canh chua cá bông lau', 'Sour soup with bông lau catfish'], ['ca-loc-nuong-trui', 'Cá lóc nướng trui', 'Straw-roasted snakehead'],
      ['ca-linh-kho', 'Cá linh kho lạt trái bần', 'Mud carp braised with bần fruit'], ['ca-tai-tuong', 'Cá tai tượng chiên xù', 'Crispy elephant-ear fish'], ['vit-nau-chao', 'Vịt xiêm nấu chao', 'Muscovy duck in fermented tofu'],
      ['ga-hap-ruou-sen', 'Gà hấp rượu sen', 'Chicken steamed in lotus wine'], ['goi-ga-mang-cut', 'Gỏi gà măng cụt', 'Mangosteen chicken salad'], ['oc-buou-nuong', 'Ốc bươu nướng tiêu xanh', 'Grilled apple snails with green pepper'],
      ['oc-lac-luoc', 'Ốc lác luộc', 'Boiled snails'], ['banh-xeo', 'Bánh xèo', 'Crispy bánh xèo'], ['cha-ca', 'Chả cá', 'Fish cakes'], ['banh-tet-la-cam', 'Bánh tét lá cẩm', 'Purple-leaf bánh tét'],
      ['banh-bo-thot-not', 'Bánh bò thốt nốt nướng', 'Baked palm-sugar cake'], ['che-buoi', 'Chè bưởi', 'Pomelo sweet soup']]),
    G('Thức uống', 'Drinks', [['tra-mang-cau', 'Trà mãng cầu', 'Soursop tea'], ['tra-sen', 'Trà sen', 'Lotus tea'], ['nuoc-dua-xiem', 'Nước dừa xiêm', 'Green coconut water'],
      ['nuoc-mia-sau-rieng', 'Nước mía sầu riêng', 'Sugarcane juice with durian'], ['ca-phe-sua-da', 'Cà phê sữa đá', 'Iced coffee with condensed milk']])
  ];
  let exTab = 0;
  function renderExplore() {
    K.$('#ws-ex-tabs').innerHTML = EXPLORE.map((g, i) => '<button type="button" class="ch-chip" data-ex="' + i + '" aria-pressed="' + (i === exTab) + '">' + esc(t(g)) + ' · ' + g.items.length + '</button>').join('');
    K.$('#ws-gal').innerHTML = EXPLORE[exTab].items.map(([f, vi, en]) => '<figure><img src="../assets/cham/anh/' + f + '.webp" width="600" height="448" loading="lazy" alt="' + esc(t({ vi: 'Hình đất sét 3D: ' + vi, en: '3D clay render: ' + en })) + '"><figcaption>' + esc(t({ vi, en })) + (K.en() ? '<small>' + esc(vi) + '</small>' : '') + '</figcaption></figure>').join('');
  }
  const clamp = (v, [lo, hi]) => Math.max(lo, Math.min(hi, v));
  const roomLine = () => S.bRooms * S.bNights * ROOM, dinnerLine = () => (S.dinner ? S.bGuests * DINNER : 0);
  const cookLine = () => (S.cls ? S.bGuests * COOK : 0);
  const total = () => roomLine() + dinnerLine() + cookLine();

  /* ---------- điều hướng ---------- */
  function route(nav) {
    const id = location.hash.slice(1);
    if (id && !SCREENS.includes(id)) return; /* ví dụ #noi-dung của liên kết «Bỏ qua tới nội dung» */
    const cur = id || 'trang-chu';
    if (cur === 'xac-nhan' && S.step !== 4) { location.replace('#dat-phong'); return; }
    document.querySelectorAll('.ws-screen').forEach(s => { s.hidden = s.dataset.screen !== cur; });
    document.querySelectorAll('.ws-nav a').forEach(a => { if (a.getAttribute('href') === '#' + cur) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (id && nav) { const sc = K.$('[data-screen="' + cur + '"]'); const h = sc.querySelector('h1'); K.$('.ws-top').scrollIntoView({ block: 'start', behavior: K.reduced() ? 'auto' : 'smooth' }); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  }

  /* ---------- vẽ ---------- */
  function counter(key, label, hint) {
    return '<div class="ws-ctr"><div><b id="lbl-' + key + '">' + t(label) + '</b><span class="ch-note">' + t(hint) + '</span></div><span class="ws-step">' +
      '<button type="button" data-step="' + key + '" data-d="-1" aria-label="' + esc(t(label)) + ' −1">−</button><output aria-labelledby="lbl-' + key + '">' + S[key] + '</output>' +
      '<button type="button" data-step="' + key + '" data-d="1" aria-label="' + esc(t(label)) + ' +1">+</button></span></div>';
  }
  function bookStep() {
    const tabs = [{ vi: 'Ngày', en: 'Dates' }, { vi: 'Dịch vụ thêm', en: 'Extras' }, { vi: 'Thông tin', en: 'Details' }];
    let h = '<div class="ws-tabs" aria-label="' + esc(t({ vi: 'Các bước', en: 'Steps' })) + '">' + tabs.map((x, i) => '<span' + (i + 1 === S.step ? ' aria-current="step"' : '') + '>' + (i + 1) + '. ' + t(x) + '</span>').join('') + '</div>';
    if (S.step === 1) h += '<h2 style="font-size:26px;margin:16px 0 4px">' + t({ vi: 'Ngày & số khách', en: 'Dates & guests' }) + '</h2><p class="ch-note">' + t({ vi: 'Nhận phòng Thứ Bảy, 14 tháng 11 (ví dụ)', en: 'Check-in Saturday, 14 November (example)' }) + '</p>' +
      counter('bNights', { vi: 'Số đêm', en: 'Nights' }, { vi: '500.000 đ / phòng / đêm', en: '500,000 đ / room / night' }) +
      counter('bRooms', { vi: 'Số phòng', en: 'Rooms' }, { vi: '2–4 khách mỗi phòng', en: '2–4 guests per room' }) +
      counter('bGuests', { vi: 'Số khách', en: 'Guests' }, { vi: 'Tối đa 4 khách/phòng', en: 'Up to 4 per room' });
    else if (S.step === 2) h += '<h2 style="font-size:26px;margin:16px 0 4px">' + t({ vi: 'Thêm vào chuyến đi', en: 'Add to your stay' }) + '</h2>' +
      [['dinner', { vi: 'Bữa tối đồng quê cho cả nhóm', en: 'Country dinner for everyone' }, { vi: '~120.000 đ / khách', en: '~120,000 đ / guest' }], ['cls', { vi: 'Lớp nấu ăn', en: 'Cooking class' }, { vi: '150.000 đ / khách, tối thiểu 4 người', en: '150,000 đ / guest, minimum 4' }]]
        .map(([k, n, p]) => '<button type="button" class="ws-extra" data-extra="' + k + '" aria-pressed="' + S[k] + '"><i aria-hidden="true">' + (S[k] ? '✓' : '') + '</i><span><b>' + t(n) + '</b><span class="ch-note">' + t(p) + '</span></span></button>').join('');
    else h += '<h2 style="font-size:26px;margin:16px 0 10px">' + t({ vi: 'Thông tin của bạn', en: 'Your details' }) + '</h2>' +
      '<label class="ch-k" for="ws-name">' + t({ vi: 'Họ tên', en: 'Full name' }) + '</label><input id="ws-name" class="ch-field" style="margin:6px 0 12px" autocomplete="off" value="' + esc(S.name) + '" placeholder="Nguyễn Văn A">' +
      '<label class="ch-k" for="ws-phone">' + t({ vi: 'Điện thoại / Zalo', en: 'Phone / Zalo' }) + '</label><input id="ws-phone" class="ch-field" style="margin:6px 0 12px" inputmode="tel" autocomplete="off" value="' + esc(S.phone) + '" placeholder="09xx xxx xxx">' +
      '<p class="ch-proto">' + t({ vi: 'Bản mẫu: thông tin nhập ở đây không được lưu hay gửi đi.', en: 'Mockup: what you type here is not stored or sent.' }) + '</p>' +
      '<div class="ch-sunk" style="margin-top:12px;font-size:14px;line-height:1.55"><b>' + t({ vi: 'Thanh toán và hủy', en: 'Payment and cancellation' }) + '</b><ul style="margin:6px 0 0;padding-left:1.1em">' +
        [{ vi: 'Xác nhận qua Zalo; đặt cọc 30% bằng chuyển khoản (dịp Tết 50%), phần còn lại trả khi nhận phòng.', en: 'Confirmed on Zalo; 30% deposit by bank transfer (50% at Tết), the rest on arrival.' },
         { vi: 'Hủy trước 7 ngày: hoàn 100% cọc · 3–6 ngày: hoàn 50% · dưới 3 ngày hoặc đặt dịp Tết: không hoàn.', en: 'Cancel 7+ days ahead: 100% of the deposit back · 3–6 days: 50% · under 3 days or Tết bookings: no refund.' },
         { vi: 'Mùa nước: khi homestay «Tạm đóng», dời lịch miễn phí hoặc hoàn 100% cọc.', en: 'Flood season: if the homestay is “Closed”, move your dates free or get the full deposit back.' },
         { vi: 'Nhận phòng 14:00 · trả phòng 11:00.', en: 'Check-in 14:00 · check-out 11:00.' }].map(x => '<li>' + t(x) + '</li>').join('') + '</ul></div>';
    h += '<div class="ch-row" style="justify-content:space-between;margin-top:18px">' + (S.step > 1 ? '<button type="button" class="ch-btn soft" data-book="back" aria-label="' + esc(t({ vi: 'Quay lại', en: 'Back' })) + '">←</button>' : '<span></span>') +
      '<button type="button" class="ch-btn" data-book="next">' + nextLabel() + '</button></div>';
    return h;
  }
  const nextLabel = () => (S.step === 3 ? t({ vi: 'Xác nhận', en: 'Confirm' }) : t({ vi: 'Tiếp tục', en: 'Continue' }));
  const stayText = sep => t({ vi: S.bRooms + ' phòng' + sep + S.bNights + ' đêm', en: S.bRooms + (S.bRooms > 1 ? ' rooms' : ' room') + sep + S.bNights + (S.bNights > 1 ? ' nights' : ' night') });
  function summary() {
    const rn = stayText(' × ');
    return '<span class="ch-k">' + t({ vi: 'Chuyến đi của bạn', en: 'Your stay' }) + '</span>' +
      '<div class="ln"><span>' + rn + '</span><span>' + K.vnd(roomLine()) + '</span></div>' +
      (S.dinner ? '<div class="ln"><span>' + t({ vi: 'Bữa tối × ', en: 'Dinner × ' }) + S.bGuests + '</span><span>' + K.vnd(dinnerLine()) + '</span></div>' : '') +
      (S.cls ? '<div class="ln"><span>' + t({ vi: 'Lớp nấu ăn × ', en: 'Cooking class × ' }) + S.bGuests + '</span><span>' + K.vnd(cookLine()) + '</span></div>' + (S.bGuests < 4 ? '<p class="ch-note">' + t({ vi: 'Lớp mở khi đủ 4 người (có thể ghép với khách khác).', en: 'Classes run with at least 4 people (you may join other guests).' }) + '</p>' : '') : '') +
      '<div class="ln tot"><span>' + t({ vi: 'Tạm tính', en: 'Estimated total' }) + '</span><span>' + K.vnd(total()) + '</span></div>';
  }
  function render() {
    K.$('#ws-nights').textContent = S.nights;
    K.$('#ws-from').textContent = K.vnd(ROOM * S.nights);
    K.$('#ws-cart').textContent = S.cart;
    K.$('#ws-huts').innerHTML = [1, 2, 3, 4, 5, 6].map(i => { const b = BOOKED.includes(i);
      return '<div class="' + (b ? 'booked' : 'free') + '"><b>' + i + '</b><small style="display:block;font-size:12.5px;margin-bottom:2px">' + t(HUTS[i - 1]) + '</small>' + (b ? t({ vi: 'Đã đặt', en: 'Booked' }) : t({ vi: 'Trống', en: 'Free' })) + '</div>'; }).join('');
    K.$('#ws-shop').innerHTML = PRODUCTS.map((p, i) => '<div class="ws-prod" style="background:' + p.bg + '"><img src="' + p.img + '" width="924" height="540" style="height:auto;aspect-ratio:4/3;object-fit:cover" loading="lazy" alt="' + esc(t({ vi: 'Hình đất sét: ', en: 'Clay render: ' }) + t(p.art)) + '"><b>' + t(p.name) + '</b><span class="ch-row" style="justify-content:space-between"><span style="font-weight:800;color:var(--ch-teal)">' + t(p.price) + '</span><button type="button" class="ch-btn sm" data-add="' + i + '">' + t({ vi: '+ Thêm', en: '+ Add' }) + '</button></span></div>').join('');
    renderExplore();
    K.$('#ws-step').innerHTML = bookStep();
    K.$('#ws-sum').innerHTML = summary();
    K.$('#ws-mtotal').textContent = K.vnd(total());
    K.$('#ws-mnext').textContent = nextLabel();
    K.$('#ws-conf').innerHTML = [[{ vi: 'Mã đặt phòng (ví dụ)', en: 'Booking code (example)' }, 'CHAM-1411'], [{ vi: 'Nhận phòng', en: 'Check-in' }, t({ vi: 'T7, 14/11', en: 'Sat, 14 Nov' })],
      [{ vi: 'Lưu trú', en: 'Stay' }, stayText(' · ')], [{ vi: 'Tạm tính', en: 'Estimated total' }, K.vnd(total())]]
      .map(([k, v]) => '<div class="ch-card sm"><div class="ch-k">' + t(k) + '</div><div class="ch-v">' + esc(v) + '</div></div>').join('');
  }

  /* ---------- tương tác ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('.ws button'); if (!b) return;
    if (b.dataset.step) {
      const k = b.dataset.step, d = +b.dataset.d;
      if (k === 'bGuests') S.bGuests = Math.max(1, Math.min(S.bRooms * 4, S.bGuests + d));
      else { S[k] = clamp(S[k] + d, LIM[k]); if (k === 'bRooms') S.bGuests = Math.min(S.bGuests, S.bRooms * 4); }
      render(); const nb = K.$('.ws [data-step="' + k + '"][data-d="' + d + '"]'); if (nb) nb.focus();
    } else if (b.dataset.extra) { S[b.dataset.extra] = !S[b.dataset.extra]; render(); K.$('[data-extra="' + b.dataset.extra + '"]').focus(); }
    else if (b.dataset.ex) { exTab = +b.dataset.ex; renderExplore(); K.$('[data-ex="' + exTab + '"]').focus(); }
    else if (b.dataset.add) { S.cart++; render(); K.$('[data-add="' + b.dataset.add + '"]').focus(); }
    else if (b.dataset.book === 'back') { S.step = Math.max(1, S.step - 1); render(); }
    else if (b.dataset.book === 'next') {
      if (S.step < 3) { S.step++; render(); K.$('#ws-step').querySelector('h2').scrollIntoView({ block: 'nearest' }); }
      else { S.step = 4; render(); location.hash = 'xac-nhan'; }
    }
  });
  document.addEventListener('input', e => { if (e.target.id === 'ws-name') S.name = e.target.value; else if (e.target.id === 'ws-phone') S.phone = e.target.value; });
  window.addEventListener('hashchange', () => { if (location.hash === '#dat-phong' && S.step === 4) { S.step = 1; render(); } route(true); });
  K.mount(() => { render(); route(); });
})();
