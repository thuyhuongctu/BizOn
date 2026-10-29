/* CHAM – Bộ công cụ giảng dạy: máy tính doanh thu & hòa vốn năm 1 (ChamEngine.kitCalc) và giá trên tin đăng mẫu. */
(function () {
  'use strict';
  const K = window.ChamKit, E = window.ChamEngine, t = K.t;
  const S = Object.assign({}, E.KIT_DEFAULT);
  const SL = [
    ['visitors', { vi: 'Lượt khách mua vé / năm', en: 'Ticketed visitors / year' }, 2000, 15000, 100, v => K.num(v) + t({ vi: ' lượt', en: '' }), { vi: 'Kế hoạch năm 1: 7.200 lượt (20 khách/ngày)', en: 'Plan year 1: 7,200 (20 a day)' }],
    ['ticket', { vi: 'Giá vé vào cổng', en: 'Entrance ticket' }, 30, 150, 5, v => K.vnd(v * 1000), { vi: 'Kế hoạch: 80.000 đ/người lớn', en: 'Plan: 80,000 đ per adult' }],
    ['rentals', { vi: 'Lượt thuê phòng / năm', en: 'Room rentals / year' }, 0, 2190, 30, v => K.num(v) + t({ vi: ' lượt', en: '' }), { vi: '6 phòng × 365 đêm = tối đa 2.190 lượt', en: '6 rooms × 365 nights = at most 2,190' }],
    ['room', { vi: 'Giá phòng / đêm', en: 'Room price / night' }, 50, 800, 10, v => K.vnd(v * 1000), { vi: 'Kế hoạch 2017: 50.000 đ · giá xác nhận: 500.000 đ', en: 'Plan 2017: 50,000 đ · confirmed price: 500,000 đ' }],
    ['fnb', { vi: 'Ăn uống + đặc sản (triệu đ)', en: 'Food + specialties (million đ)' }, 0, 2500, 5, v => K.num(v), { vi: 'Kế hoạch năm 1: ≈ 1.095 triệu (món ăn, đồ uống, combo, đặc sản)', en: 'Plan year 1: ≈ 1,095 million (dishes, drinks, combos, specialties)' }],
    ['cost', { vi: 'Tổng chi phí (triệu đ)', en: 'Total costs (million đ)' }, 300, 1500, 1, v => K.num(v), { vi: 'Kế hoạch năm 1: 798 triệu, đã gồm khấu hao 160', en: 'Plan year 1: 798 million, including 160 depreciation' }]
  ];
  const CAP = [[500, { vi: '500 triệu (như kế hoạch)', en: '500 million (as in the plan)' }], [4000, { vi: '4 tỷ (tổng vốn)', en: '4 billion (total capital)' }]];
  const box = K.$('#tk-sliders');

  function build() {
    box.innerHTML = SL.map(([k, lab, min, max, step, , note]) => '<div class="tk-sl"><div class="row"><label for="tk-' + k + '">' + t(lab) + '</label><output id="tk-o-' + k + '" for="tk-' + k + '"></output></div>' +
      '<input class="ch-range" type="range" id="tk-' + k + '" data-k="' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + S[k] + '"><div class="ch-note">' + t(note) + '</div></div>').join('');
    K.$('#tk-cap').setAttribute('aria-label', t({ vi: 'Vốn đầu tư dùng để tính hòa vốn', en: 'Investment used for payback' }));
    update();
  }
  function update() {
    SL.forEach(([k, , , , , disp]) => { K.$('#tk-o-' + k).textContent = disp(S[k]); K.$('#tk-' + k).value = S[k]; });
    K.$('#tk-cap').innerHTML = CAP.map(([v, l]) => '<button type="button" data-cap="' + v + '" aria-pressed="' + (S.cap === v) + '">' + t(l) + '</button>').join('');
    const r = E.kitCalc(S), f = v => K.num(v, 1);
    K.$('#tk-lines').innerHTML = [
      [{ vi: 'Vé vào cổng', en: 'Entrance tickets' }, f(r.tickets)], [{ vi: 'Phòng', en: 'Rooms' }, f(r.rooms)], [{ vi: 'Ăn uống + đặc sản', en: 'Food + specialties' }, f(r.fnb)],
      [{ vi: 'Tổng doanh thu', en: 'Total revenue' }, f(r.rev)], [{ vi: 'Tổng chi phí', en: 'Total costs' }, '− ' + f(r.cost)], [{ vi: 'Thuế (≈4,5% doanh thu + môn bài)', en: 'Tax (≈4.5% of revenue + licence fee)' }, '− ' + f(r.tax)]
    ].map(([k, v]) => '<div><span>' + t(k) + '</span><span>' + v + '</span></div>').join('') +
      '<div class="tot"><span>' + t({ vi: 'Lợi nhuận sau thuế', en: 'Profit after tax' }) + '</span><span>' + f(r.profit) + '</span></div>';
    K.$('#tk-pay').textContent = r.years == null ? t({ vi: 'Không hòa vốn', en: 'Never pays back' })
      : r.years < 1 ? K.num(r.years * 12, 1) + t({ vi: ' tháng', en: ' months' }) : K.num(r.years, 2) + t({ vi: ' năm', en: ' years' });
    K.$('#tk-ota').textContent = K.vnd(S.room * 1000);
  }
  box.addEventListener('input', e => { const k = e.target.dataset.k; if (!k) return; S[k] = Number(e.target.value); update(); });
  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.cap) { S.cap = +b.dataset.cap; update(); }
    else if (b.id === 'tk-reset') { Object.assign(S, E.KIT_DEFAULT); update(); }
  });
  K.mount(build);
})();
