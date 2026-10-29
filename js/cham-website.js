/* CHAM – mẫu website cho khách: điều hướng theo #mã-màn-hình, ô đếm đêm ở trang chủ, lưới 6 nhà lá, giỏ đặc sản,
 * quy trình đặt phòng 3 bước có trạng thái dùng chung với màn hình xác nhận. Bản mẫu cho bài học: không gửi dữ liệu đi đâu.
 * Quy tắc giá theo bản bàn giao: phòng 500.000 đ/đêm (tác giả xác nhận 29/10/2026; kế hoạch gốc ghi 50.000 đ), bữa tối ~120.000 đ/khách. */
(function () {
  'use strict';
  const K = window.ChamKit, t = K.t, esc = K.esc;
  const ROOM = 500000, DINNER = 120000, BOOKED = [2, 5];
  const SCREENS = Array.from(document.querySelectorAll('.ws-screen')).map(s => s.dataset.screen);
  const S = { nights: 1, cart: 0, step: 1, bNights: 1, bRooms: 1, bGuests: 2, dinner: true, cls: false, name: '', phone: '' };
  const LIM = { nights: [1, 7], bNights: [1, 7], bRooms: [1, 6] };
  const PRODUCTS = [
    { img: 'tea-oil', bg: 'var(--ch-yellow-t)', name: { vi: 'Trà cúc la mã khô', en: 'Dried chamomile tea' }, price: { vi: '80.000 đ / 500 g', en: '80,000 đ / 500 g' }, art: { vi: 'hộp trà', en: 'tea tin' } },
    { img: 'tea-oil', bg: 'var(--ch-leaf)', name: { vi: 'Tinh dầu cúc la mã', en: 'Chamomile essential oil' }, price: { vi: '50.000 đ / 15 ml', en: '50,000 đ / 15 ml' }, art: { vi: 'chai tinh dầu', en: 'oil bottle' } },
    { img: 'mam-jar', bg: 'var(--ch-brick-t)', name: { vi: 'Mắm cá tra', en: 'Fermented pangasius (mắm cá tra)' }, price: { vi: '120.000 đ / kg', en: '120,000 đ / kg' }, art: { vi: 'hũ sành', en: 'clay jar' } }
  ];
  const clamp = (v, [lo, hi]) => Math.max(lo, Math.min(hi, v));
  const roomLine = () => S.bRooms * S.bNights * ROOM, dinnerLine = () => (S.dinner ? S.bGuests * DINNER : 0);
  const total = () => roomLine() + dinnerLine();

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
      [['dinner', { vi: 'Bữa tối đồng quê cho cả nhóm', en: 'Country dinner for everyone' }, { vi: '~120.000 đ / khách', en: '~120,000 đ / guest' }], ['cls', { vi: 'Lớp nấu ăn', en: 'Cooking class' }, { vi: 'Giá cần xác nhận', en: 'Price to confirm' }]]
        .map(([k, n, p]) => '<button type="button" class="ws-extra" data-extra="' + k + '" aria-pressed="' + S[k] + '"><i aria-hidden="true">' + (S[k] ? '✓' : '') + '</i><span><b>' + t(n) + '</b><span class="ch-note">' + t(p) + '</span></span></button>').join('');
    else h += '<h2 style="font-size:26px;margin:16px 0 10px">' + t({ vi: 'Thông tin của bạn', en: 'Your details' }) + '</h2>' +
      '<label class="ch-k" for="ws-name">' + t({ vi: 'Họ tên', en: 'Full name' }) + '</label><input id="ws-name" class="ch-field" style="margin:6px 0 12px" autocomplete="off" value="' + esc(S.name) + '" placeholder="Nguyễn Văn A">' +
      '<label class="ch-k" for="ws-phone">' + t({ vi: 'Điện thoại / Zalo', en: 'Phone / Zalo' }) + '</label><input id="ws-phone" class="ch-field" style="margin:6px 0 12px" inputmode="tel" autocomplete="off" value="' + esc(S.phone) + '" placeholder="09xx xxx xxx">' +
      '<p class="ch-proto">' + t({ vi: 'Bản mẫu: thông tin nhập ở đây không được lưu hay gửi đi.', en: 'Mockup: what you type here is not stored or sent.' }) + '</p>' +
      '<p style="margin-top:10px"><span class="ch-tbc">' + t({ vi: 'Chính sách thanh toán và hủy: cần xác nhận', en: 'Payment and cancellation policy: to confirm' }) + '</span></p>';
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
      (S.cls ? '<div class="ln"><span>' + t({ vi: 'Lớp nấu ăn', en: 'Cooking class' }) + '</span><span class="ch-tbc">' + t({ vi: 'cần xác nhận', en: 'to confirm' }) + '</span></div>' : '') +
      '<div class="ln tot"><span>' + t({ vi: 'Tạm tính', en: 'Estimated total' }) + '</span><span>' + K.vnd(total()) + '</span></div>';
  }
  function render() {
    K.$('#ws-nights').textContent = S.nights;
    K.$('#ws-from').textContent = K.vnd(ROOM * S.nights);
    K.$('#ws-cart').textContent = S.cart;
    K.$('#ws-huts').innerHTML = [1, 2, 3, 4, 5, 6].map(i => { const b = BOOKED.includes(i);
      return '<div class="' + (b ? 'booked' : 'free') + '"><b>' + i + '</b>' + (b ? t({ vi: 'Đã đặt', en: 'Booked' }) : t({ vi: 'Trống', en: 'Free' })) + '</div>'; }).join('');
    K.$('#ws-shop').innerHTML = PRODUCTS.map((p, i) => '<div class="ws-prod" style="background:' + p.bg + '"><img src="../assets/cham/clay/' + p.img + '.png" width="924" height="540" loading="lazy" alt="' + esc(t({ vi: 'Hình đất sét: ', en: 'Clay render: ' }) + t(p.art)) + '"><b>' + t(p.name) + '</b><span class="ch-row" style="justify-content:space-between"><span style="font-weight:800;color:var(--ch-teal)">' + t(p.price) + '</span><button type="button" class="ch-btn sm" data-add="' + i + '">' + t({ vi: '+ Thêm', en: '+ Add' }) + '</button></span></div>').join('');
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
