/* CHAM – Bảng điều khiển giảng viên: đọc bảng xếp hạng 'cham-founder-board' trên thiết bị, nhận thêm mã kết quả
 * dán từ máy khác, xếp hạng theo dòng tiền 5 năm và cho thấy tỷ lệ chọn từng phương án. Chưa có máy chủ:
 * dữ liệu chỉ nằm trên thiết bị này (xem docs/cham/README.md, việc còn mở). */
(function () {
  'use strict';
  const K = window.ChamKit, E = window.ChamEngine, t = K.t, esc = K.esc;
  const BOARD = 'cham-founder-board';
  const D = [
    ['room', { vi: 'Giá phòng', en: 'Room price' }, { vi: '50.000 đ', en: '50,000 đ' }, { vi: '500.000 đ', en: '500,000 đ' }],
    ['demand', { vi: 'Nhu cầu', en: 'Demand' }, { vi: '20 khách/ngày', en: '20 a day' }, { vi: 'Trừ mùa nước', en: 'Flood-season cut' }],
    ['mkt', { vi: 'Ra mắt', en: 'Launch' }, { vi: 'Foody + người ảnh hưởng', en: 'Foody + influencers' }, { vi: 'Fanpage + trường học', en: 'Fanpage + schools' }],
    ['staff', { vi: 'Trả lương quản lý?', en: 'Managers paid?' }, { vi: 'Không', en: 'No' }, { vi: 'Có', en: 'Yes' }],
    ['tea', { vi: 'Giá trà', en: 'Tea price' }, { vi: '40.000 đ', en: '40,000 đ' }, { vi: '80.000 đ', en: '80,000 đ' }],
    ['occ', { vi: 'Công suất phòng', en: 'Occupancy' }, { vi: 'Kín 82%', en: '82% full' }, { vi: 'Kín một nửa', en: 'Half full' }],
    ['cap', { vi: 'Vốn tính hòa vốn', en: 'Payback base' }, { vi: '500 triệu', en: '500 million' }, { vi: '4 tỷ', en: '4 billion' }]
  ];
  let status = '';
  const load = () => E.rankBoard(E.cleanBoard(K.get(BOARD, [])), 200);
  const M = () => t({ vi: ' tr', en: ' M' });

  function render() {
    const B = load(), f = v => K.num(Math.round(v));
    const kp = [
      [{ vi: 'Số nhóm', en: 'Teams' }, String(B.length)],
      [{ vi: 'Dòng tiền 5 năm cao nhất', en: 'Best 5-year cash' }, B.length ? f(B[0].cash) + M() : '–'],
      [{ vi: 'Dòng tiền 5 năm trung vị', en: 'Median 5-year cash' }, B.length ? f(B[Math.floor(B.length / 2)].cash) + M() : '–'],
      [{ vi: 'Hòa vốn trong 5 năm', en: 'Recovered within 5 years' }, B.length ? Math.round(B.filter(b => b.pay).length / B.length * 100) + '%' : '–']
    ];
    K.$('#db-kpis').innerHTML = kp.map(k => '<div><div class="ch-k" style="color:var(--ch-on-night-2)">' + t(k[0]) + '</div><div class="ch-v" style="color:var(--ch-on-night)">' + k[1] + '</div></div>').join('');
    const max = Math.max(1, ...B.map(b => Math.abs(b.cash)));
    K.$('#db-teams').innerHTML = B.length ? B.map((b, i) => '<div class="db-team"><span class="nm">' + (i + 1) + '. ' + esc(b.name) + '</span><span class="tr"><i style="width:' + Math.max(2, Math.abs(b.cash) / max * 100) + '%;background:' + (b.cash < 0 ? 'var(--ch-brick)' : i === 0 ? 'var(--ch-yellow)' : '#0a9cc4') + '"></i></span><span class="v">' + f(b.cash) + M() + '</span></div>').join('')
      : '<p style="color:var(--ch-on-night-2)">' + t({ vi: 'Chưa có nhóm nào. Lưu điểm trong trò chơi trên thiết bị này, hoặc dán mã ở trên.', en: 'No teams yet. Save scores in the game on this device, or paste codes above.' }) + '</p>';
    K.$('#db-splits').innerHTML = D.map(([k, q, a, b]) => {
      const n = B.length, na = B.filter(x => x.c[k] === E.PLAN[k]).length, pa = n ? Math.round(na / n * 100) : 50;
      return '<div class="db-split"><div class="q">' + t(q) + '</div><div class="tr" role="img" aria-label="' + esc(t(a) + ' ' + (n ? pa + '%' : '–') + ', ' + t(b) + ' ' + (n ? 100 - pa + '%' : '–')) + '"><i class="a" style="width:' + pa + '%"></i><i class="b" style="width:' + (100 - pa) + '%"></i></div>' +
        '<div class="lb"><span>' + t(a) + ' · ' + (n ? pa + '%' : '–') + '</span><span>' + (n ? 100 - pa + '%' : '–') + ' · ' + t(b) + '</span></div></div>';
    }).join('');
    K.$('#db-status').textContent = status;
  }

  K.$('#db-add').addEventListener('click', () => {
    const r = E.decodeMany(K.$('#db-paste').value);
    if (r.ok.length) K.set(BOARD, E.rankBoard(load().concat(r.ok), 200));
    K.$('#db-paste').value = '';
    status = r.ok.length ? t({ vi: r.ok.length + ' nhóm đã được thêm.', en: r.ok.length + ' team(s) added.' }) + (r.bad.length ? t({ vi: ' Bỏ qua ' + r.bad.length + ' mã không hợp lệ.', en: ' Skipped ' + r.bad.length + ' invalid code(s).' }) : '')
      : t({ vi: 'Không tìm thấy mã hợp lệ.', en: 'No valid codes found.' });
    render();
  });
  K.$('#db-clear').addEventListener('click', () => {
    if (!confirm(t({ vi: 'Xóa toàn bộ nhóm trên thiết bị này?', en: 'Clear all teams on this device?' }))) return;
    K.del(BOARD); status = ''; render();
  });
  window.addEventListener('storage', e => { if (e.key === BOARD) render(); });
  K.mount(render);
})();
