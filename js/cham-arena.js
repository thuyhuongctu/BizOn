/* CHAM – Đấu trường Cù lao Tân Lộc (kịch bản Bậc 2, bản mẫu một đội): giao diện cho engine tất định ChamEngine.arena*.
 * Ván đang chơi lưu ở localStorage 'cham-arena-state' để tải lại trang không mất. */
(function () {
  'use strict';
  const K = window.ChamKit, E = window.ChamEngine, t = K.t, esc = K.esc;
  const KEY = 'cham-arena-state';
  const L = (vi, en) => ({ vi, en });
  const SEASONS = [
    { m: L('T3–5', 'Mar–May'), t: L('Khai trương', 'Opening'), e: L('Mùa hoa cúc la mã. Ba homestay khác cùng mở cửa trên cù lao.', 'Chamomile season. Three other homestays open on the islet.'), bg: '#fbe6a6', fg: '#3a2a00' },
    { m: L('T6–8', 'Jun–Aug'), t: L('Hè cao điểm', 'Summer peak'), e: L('Học sinh, sinh viên nghỉ hè. Nhu cầu tăng 40%.', 'School holidays. Demand up 40%.'), bg: '#f2c94c', fg: '#3a2a00' },
    { m: L('T9–11', 'Sep–Nov'), t: L('Mùa nước nổi', 'Flood season'), e: L('Khách giảm 40%. Sạt lở một đoạn bờ: mỗi homestay chi 60 triệu đ sửa chữa.', 'Visitors down 40%. A riverbank collapse costs each homestay 60 million đ in repairs.'), bg: '#0e2a33', fg: '#eef3f1' },
    { m: L('T12–2', 'Dec–Feb'), t: L('Tết', 'Tết'), e: L('Gia đình về quê. Đặc sản mang về bán gấp đôi.', 'Families come home. Take-home specialties sell double.'), bg: '#e98a6b', fg: '#2a1408' },
    { m: L('T3–5 năm 2', 'Mar–May, yr 2'), t: L('Đối thủ thứ năm', 'A fifth rival'), e: L('Một hộ dân mở homestay giá rẻ, lấy 10% thị trường.', 'A local family opens a budget homestay and takes 10% of the market.'), bg: '#cfe7e9', fg: '#123f4c' },
    { m: L('T6–8 năm 2', 'Jun–Aug, yr 2'), t: L('Tái cao điểm', 'Peak again'), e: L('Độ nhận biết và chất lượng tích lũy quyết định kết quả.', 'Accumulated awareness and quality decide the result.'), bg: '#f2c94c', fg: '#3a2a00' }
  ];
  const PNAME = { music: L('Đêm nhạc tài tử', 'Đờn ca tài tử nights'), cook: L('Lớp nấu ăn', 'Cooking class'), photo: L('Chụp ảnh cưới, kỷ yếu', 'Wedding & yearbook photos'), spec: L('Đặc sản mang về', 'Take-home specialties') };
  const HINTS = {
    hotel: L('Khách sạn ở Thốt Nốt chỉ khoảng 300.000–350.000 đ/đêm, cách 5–10 phút đò. Đêm ở nhà lá của CHAM có gì đáng trả thêm?', 'Hotels in Thốt Nốt cost about 300,000–350,000 đ a night, 5–10 minutes by ferry. What makes a night in CHAM’s hut worth paying more for?'),
    planPrice: L('Giá phòng đang ở mức kế hoạch gốc (50.000 đ). Mỗi đêm phòng đóng góp bao nhiêu so với một suất ăn?', 'The room price is at the original plan level (50,000 đ). How much does a room-night earn compared with one meal?'),
    floodMk: L('Mùa nước nổi chỉ còn 60% khách. Chi marketing lúc này mua được bao nhiêu khách thật?', 'Flood season brings only 60% of visitors. How many real guests does marketing buy now?'),
    staff: L('Ít nhân viên làm điểm chất lượng giảm. Đội đã tính đến khách quay lại vòng sau chưa?', 'Fewer staff lowers quality. Have you thought about repeat guests next round?'),
    mgr: L('Bốn quản lý vẫn chưa có lương, giống bảng lương trong kế hoạch. Lợi nhuận đang được tính trước hay sau phần này?', 'The four managers are still unpaid, as in the plan’s payroll. Is your profit before or after that cost?'),
    share: L('Thị phần của CHAM dưới 20%. Đối thủ nào đang hút khách, bằng giá hay bằng sản phẩm?', 'CHAM’s share is below 20%. Which rival is winning guests, on price or on product?'),
    copycat: L('Một hộ dân vừa mở homestay giá rẻ. Điều gì ở CHAM khó sao chép nhất?', 'A local family just opened a budget homestay. What about CHAM is hardest to copy?'),
    balanced: L('Quyết định đang cân bằng. Thử thay đổi một cần gạt và dự đoán kết quả trước khi chốt.', 'Your decisions look balanced. Change one lever and predict the result before you submit.')
  };
  const SL = [['room', L('Giá phòng / đêm', 'Room price / night'), 10, v => K.vnd(v * 1000)], ['ticket', L('Giá vé vào cổng', 'Entrance ticket'), 5, v => K.vnd(v * 1000)],
    ['mk', L('Marketing trong vòng', 'Marketing this round'), 5, v => v + t({ vi: ' triệu đ', en: ' million đ' })], ['staff', L('Số nhân viên', 'Staff'), 1, v => v + t({ vi: ' người', en: ' people' })]];

  let S = load();
  function load() {
    const s = K.get(KEY, null);
    if (s && s.round >= 1 && s.round <= E.ROUNDS + 1 && Array.isArray(s.cum) && s.cum.length === 4 && Array.isArray(s.history)) return s;
    return E.arenaInit();
  }
  const save = () => K.set(KEY, S);
  const f = v => K.num(Math.round(v));
  const names = () => [t({ vi: 'CHAM (đội bạn)', en: 'CHAM (your team)' })].concat(E.RIVALS.map(r => r.name));

  function boardHtml() {
    const last = S.history[S.history.length - 1], nm = names();
    const order = [0, 1, 2, 3].sort((a, b) => S.cum[b] - S.cum[a]);
    return '<div class="ch-row" style="justify-content:space-between"><h3 style="margin:0;font-size:22px">' + t({ vi: 'Đấu trường cù lao', en: 'Islet arena' }) + '</h3><span class="ch-k" style="color:var(--ch-on-night-2)">' +
      (last ? t({ vi: 'Sau vòng ', en: 'After round ' }) + last.round : t({ vi: 'Chưa có kết quả', en: 'No results yet' })) + '</span></div>' +
      '<div class="ch-scroll"><table class="ar-board"><thead><tr><th scope="col"></th><th scope="col">' + t({ vi: 'Thị phần', en: 'Share' }) + '</th><th scope="col">' + t({ vi: 'Lãi vòng (tr)', en: 'Round profit (M)' }) + '</th><th scope="col">' + t({ vi: 'Lũy kế (tr)', en: 'Cumulative (M)' }) + '</th></tr></thead><tbody>' +
      order.map(i => '<tr' + (i === 0 ? ' class="me"' : '') + '><td>' + esc(nm[i]) + '</td><td>' + (last ? Math.round(last.res[i].share * 100) + '%' : '–') + '</td><td>' + (last ? f(last.res[i].profit) : '–') + '</td><td>' + f(S.cum[i]) + '</td></tr>').join('') + '</tbody></table></div>';
  }

  function playing() {
    const se = SEASONS[S.round - 1], d = S.dec;
    const pips = SEASONS.map((x, i) => '<span class="' + (i + 1 < S.round ? 'done' : i + 1 === S.round ? 'now' : '') + '">' + t({ vi: 'V', en: 'R' }) + (i + 1) + '</span>').join('');
    const prods = E.PRODUCTS.map(p => { const own = S.owned[p.id], pend = S.pending[p.id];
      return '<button type="button" data-prod="' + p.id + '"' + (own ? ' disabled' : ' aria-pressed="' + !!pend + '"') + '><b>' + t(PNAME[p.id]) + '</b><small>' +
        (own ? t({ vi: 'Đã có', en: 'Owned' }) : (pend ? t({ vi: 'Đã chọn · ', en: 'Chosen · ' }) : '') + p.cost + t({ vi: ' tr đ · +', en: ' M đ · +' }) + Math.round(p.boost * 100) + t({ vi: '% sức hút', en: '% appeal' })) + '</small></button>'; }).join('');
    return '<div class="ar-pips" aria-hidden="true">' + pips + '</div><div class="ar-grid"><div>' +
      '<div class="ar-season" style="background:' + se.bg + ';color:' + se.fg + '"><div class="k">' + t({ vi: 'VÒNG ', en: 'ROUND ' }) + S.round + ' / 6 · ' + t(se.m) + t({ vi: ' · HỆ SỐ KHÁCH ×', en: ' · DEMAND ×' }) + K.num(E.SEASON_K[S.round - 1], 1) + '</div><h2>' + t(se.t) + '</h2><p style="margin:0;line-height:1.5">' + t(se.e) + '</p></div>' +
      '<div class="ar-panel"><h3 style="margin:0;font-size:20px">' + t({ vi: 'Quyết định của CHAM', en: 'CHAM’s decisions' }) + '</h3>' +
      SL.map(([k, lab, step, disp]) => '<div class="ar-sl"><div class="row"><label for="ar-' + k + '">' + t(lab) + '</label><output id="ar-o-' + k + '">' + disp(d[k]) + '</output></div><input class="ch-range" type="range" id="ar-' + k + '" data-k="' + k + '" min="' + E.LIMITS[k][0] + '" max="' + E.LIMITS[k][1] + '" step="' + step + '" value="' + d[k] + '"></div>').join('') +
      '<button type="button" class="ar-check" id="ar-mgr" aria-pressed="' + !!d.mgr + '"><i aria-hidden="true">' + (d.mgr ? '✓' : '') + '</i>' + t({ vi: 'Trả lương 4 quản lý (8 triệu đ/tháng/người)', en: 'Pay the 4 managers (8 million đ each per month)' }) + '</button>' +
      '<div class="ch-k" style="color:var(--ch-on-night-2);margin-top:12px">' + t({ vi: 'Sản phẩm mới (đầu tư một lần)', en: 'New products (one-off investment)' }) + '</div><div class="ar-prods">' + prods + '</div>' +
      '<div style="margin-top:16px"><button type="button" class="ch-btn yellow" id="ar-submit">' + (S.round === 6 ? t({ vi: 'Chốt vòng cuối →', en: 'Submit final round →' }) : t({ vi: 'Chốt quyết định vòng ' + S.round + ' →', en: 'Submit round ' + S.round + ' →' })) + '</button></div></div></div>' +
      '<div>' + boardHtml() + '<div class="ar-lumina"><span class="av" aria-hidden="true">L</span><div><b>' + t({ vi: 'Lumina gợi ý', en: 'Lumina asks' }) + '</b><ul>' + E.arenaHints(S).map(h => '<li>' + t(HINTS[h]) + '</li>').join('') + '</ul></div></div>' +
      '<p class="ar-note">' + t({ vi: 'Khách sạn bên kia sông (khoảng 300.000–350.000 đ/đêm) là dịch vụ thay thế: giá phòng trên 350.000 đ làm một phần khách về bờ ngủ. Đối thủ chơi theo chiến lược cố định: Sơn Ca giá rẻ, Green Lộc cao cấp (hai cơ sở giả định), và Homestay Cẩm Lụa, một homestay có thật ở khu vực Long Châu: nhà vườn ven sông, chèo thuyền, câu cá, hái trái cây, BBQ. Giá phòng 350.000 đ lấy giữa khoảng thực tế 250.000–450.000 đ/đêm; mâm cơm thực tế 100.000–150.000 đ/người; tắm sông miễn phí nên vé trong game đặt ở mức thấp nhất (30.000 đ, giả định). Cùng quyết định cho cùng kết quả.',
        en: 'Hotels across the river (about 300,000–350,000 đ a night) are a substitute: room prices above 350,000 đ send some guests back to the mainland to sleep. Rivals play fixed strategies: Sơn Ca is budget and Green Lộc premium (both fictional), and Homestay Cẩm Lụa is a real homestay in Long Châu with a riverside garden, boating, fishing, fruit picking and BBQ. Its 350,000 đ room price is the midpoint of the real 250,000–450,000 đ range; real meals cost 100,000–150,000 đ per person; river swimming is free, so its game ticket is the minimum (30,000 đ, assumed). Same decisions, same results.' }) + '</p></div></div>';
  }

  function debrief() {
    const rank = E.arenaRank(S), H = S.history, prof = H.map(h => h.res[0].profit), max = Math.max(1, ...prof.map(Math.abs));
    const occ = H.length ? H.reduce((a, h) => a + h.res[0].occ, 0) / H.length : 0, pay = E.arenaPaybackYears(S);
    const kp = [[{ vi: 'Lợi nhuận lũy kế', en: 'Cumulative profit' }, f(S.cum[0]) + t({ vi: ' tr đ', en: ' M đ' })], [{ vi: 'Xếp hạng', en: 'Rank' }, rank + ' / 4'],
      [{ vi: 'Công suất phòng TB', en: 'Avg occupancy' }, Math.round(occ * 100) + '%'], [{ vi: 'Thu hồi 4 tỷ ở nhịp này', en: 'Payback on 4 bn at this pace' }, pay ? K.num(pay, 1) + t({ vi: ' năm', en: ' years' }) : t({ vi: 'chưa thu hồi', en: 'not recovered' })]];
    return '<div class="ch-row" style="justify-content:space-between;align-items:flex-end"><div><div class="ch-k" style="color:var(--ch-on-night-2)">' + t({ vi: 'DEBRIEF · SAU 6 MÙA', en: 'DEBRIEF · AFTER 6 SEASONS' }) + '</div><h2 style="margin:6px 0 0;font-size:clamp(32px,5vw,56px)">' +
      (rank === 1 ? t({ vi: 'CHAM dẫn đầu cù lao.', en: 'CHAM leads the islet.' }) : t({ vi: 'CHAM đứng thứ ' + rank + ' trên 4 homestay.', en: 'CHAM finishes ' + ['', '1st', '2nd', '3rd', '4th'][rank] + ' of 4 homestays.' })) + '</h2></div>' +
      '<button type="button" class="ch-btn yellow" id="ar-restart">' + t({ vi: 'Chơi lại', en: 'Play again' }) + '</button></div>' +
      '<div class="ar-kpis">' + kp.map(k => '<div><div class="ch-k" style="color:var(--ch-on-night-2)">' + t(k[0]) + '</div><div class="ch-v" style="color:var(--ch-on-night)">' + k[1] + '</div></div>').join('') + '</div>' +
      '<div class="ar-grid"><div class="ar-panel" style="margin:0"><h3 style="margin:0;font-size:18px">' + t({ vi: 'Lợi nhuận CHAM theo mùa (triệu đ)', en: 'CHAM profit by season (million đ)' }) + '</h3><div class="ch-bars night">' +
      prof.map((p, i) => '<div class="b"><span>' + f(p) + '</span><div class="w"><i style="height:' + Math.max(2, Math.abs(p) / max * 100) + '%;background:' + (p < 0 ? 'var(--ch-brick)' : 'var(--ch-yellow)') + '"></i></div><small>' + t({ vi: 'V', en: 'R' }) + (i + 1) + '</small></div>').join('') + '</div></div>' +
      '<div>' + boardHtml() + '<div class="ar-lumina"><span class="av" aria-hidden="true">L</span><div><b>' + t({ vi: 'Câu hỏi phản tư', en: 'Reflection questions' }) + '</b><ul><li>' +
      [L('Mùa nào quyết định nhất kết quả của đội, và vì sao?', 'Which season decided your result most, and why?'), L('Với lợi nhuận lũy kế này, bao lâu nữa CHAM thu hồi được 4 tỷ đồng vốn?', 'At this cumulative profit, how long until CHAM recovers its 4 billion đ?'), L('Khi hộ dân mở homestay giá rẻ, đội đã phản ứng bằng giá hay bằng sản phẩm?', 'When a local family opened a budget homestay, did you respond with price or product?')].map(t).join('</li><li>') + '</li></ul></div></div></div></div>';
  }

  function render() { K.$('#ar').innerHTML = S.round <= E.ROUNDS ? playing() : debrief(); }

  document.addEventListener('input', e => {
    const k = e.target.dataset && e.target.dataset.k; if (!k || !e.target.closest('#ar')) return;
    S.dec[k] = Number(e.target.value); const sl = SL.find(x => x[0] === k); K.$('#ar-o-' + k).textContent = sl[3](S.dec[k]); save();
  });
  document.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.k && e.target.closest('#ar')) { const id = e.target.id; render(); const el = K.$('#' + id); if (el) el.focus(); } });
  document.addEventListener('click', e => {
    const b = e.target.closest('#ar button'); if (!b) return;
    if (b.id === 'ar-mgr') { S.dec.mgr = !S.dec.mgr; save(); render(); K.$('#ar-mgr').focus(); }
    else if (b.dataset.prod) { const id = b.dataset.prod; if (S.pending[id]) delete S.pending[id]; else S.pending[id] = true; save(); render(); const nb = K.$('[data-prod="' + id + '"]'); if (nb) nb.focus(); }
    else if (b.id === 'ar-submit') { S = E.arenaSubmit(S); save(); render(); K.$('#ar').scrollIntoView({ block: 'start', behavior: K.reduced() ? 'auto' : 'smooth' }); }
    else if (b.id === 'ar-restart') { S = E.arenaInit(); save(); render(); }
  });
  K.mount(render);
})();
