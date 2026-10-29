/* CHAM – Thẩm định kế hoạch: sáu phần của kế hoạch gốc dưới «bút đỏ», ghi chú thẩm định, ghi chú riêng của sinh viên
 * (localStorage 'cham-review-notes', theo chỉ số phần) và bản in / PDF đủ sáu phần (#rv-print, chỉ hiện khi in). */
(function () {
  'use strict';
  const K = window.ChamKit, t = K.t, esc = K.esc;
  const KEY = 'cham-review-notes';
  /* seg: [chữ, kiểu ('hl' tô vàng | 'strike' gạch), ghi chú bút đỏ] */
  const SEC = [
    { title: { vi: 'Thông tin dự án', en: 'Project basics' }, ref: { vi: 'Mục 1.1', en: '§1.1' }, page: 2,
      paras: { vi: [[['Tên homestay: CHAM Homestay. Địa điểm: Khu vực Lân Thạnh 2, Phường Tân Lộc, Quận Thốt Nốt, TP. Cần Thơ. Diện tích: 9000 m2. Thành lập: 19/3/2018.']],
        [['Vốn: Tổng vốn đầu tư là '], ['4 tỷ', 'hl', '← nhớ con số này'], [', trong đó vốn chủ sở hữu 3,5 tỷ, vốn đầu tư '], ['500 triệu đồng', 'hl'], ['.']],
        [['Loại hình: Hộ kinh doanh cá thể. Hai lĩnh vực cốt lõi: Khu du lịch sinh thái và Homestay.']]],
      en: [[['Name: CHAM Homestay. Location: Lân Thạnh 2, Tân Lộc ward, Thốt Nốt district, Cần Thơ. Area: 9,000 m². Founded 19 March 2018.']],
        [['Capital: total investment is '], ['4 billion đ', 'hl', '← remember this'], [', of which own capital is 3.5 billion and invested capital is '], ['500 million đ', 'hl'], ['.']],
        [['Business type: household business. Two core lines: an eco-tourism site and a homestay.']]] },
      notes: [] },
    { title: { vi: 'Thị trường & đối thủ', en: 'Market & competitors' }, ref: { vi: 'Mục 2.1–2.2 · 4.5', en: '§2.1–2.2 · §4.5' }, page: 4,
      paras: { vi: [[['Trong 8 tháng đầu năm 2017 Cần Thơ đón trên 5,2 triệu lượt khách, trong đó lưu trú chỉ khoảng 1,3 triệu lượt.']],
        [['Hiện có 4 cơ sở du lịch sinh thái trên cù lao Tân Lộc, nhưng '], ['chỉ có CHAM Homestay là cơ sở duy nhất kinh doanh homestay', 'hl'], ['.']],
        [['Rào cản gia nhập cùng ngành nghề là rất thấp; người dân địa phương có thể học hỏi mô hình.', 'hl', 'lợi thế chỉ tạm thời']]],
      en: [[['In the first 8 months of 2017 Cần Thơ received over 5.2 million visits, of which only about 1.3 million stayed overnight.']],
        [['On Tân Lộc there are 4 eco-tourism sites, but '], ['CHAM Homestay is the only homestay on the islet', 'hl'], ['.']],
        [['Barriers to entry are very low; local residents may copy the model.', 'hl', 'so the moat is temporary']]] },
      notes: [{ n: 1, sev: 'risk', t: { vi: 'Lợi thế đi đầu ngắn hạn', en: 'First-mover advantage is short' },
        d: { vi: 'Kế hoạch nêu rào cản thấp và dễ sao chép là thách thức, nhưng không phần nào giải thích CHAM giữ khách ra sao khi hàng xóm mở homestay. Ngày nay Homestay Cẩm Lụa (Long Châu, Tân Lộc) đã hoạt động.', en: 'The plan names low entry barriers and easy copying as threats, but no section explains how CHAM keeps guests once neighbours open homestays. Today Homestay Cẩm Lụa (Long Châu, Tân Lộc) is already open.' },
        fix: { vi: 'Hỏi: điều gì hàng xóm không sao chép được?', en: 'Ask: what can’t a neighbour copy?' } }] },
    { title: { vi: 'Khách mục tiêu & nhu cầu', en: 'Target guests & demand' }, ref: { vi: 'Mục 4.2–4.3', en: '§4.2–4.3' }, page: 7,
      paras: { vi: [[['Mục tiêu: Đạt trung bình '], ['trên 20 khách/ngày', 'hl'], ['.']],
        [['Nhóm 1: học sinh, sinh viên 15–24 tuổi, đi nhóm 5–10 người. Nhóm 2: người đi làm 24–30 tuổi, đi 2 người hoặc nhóm 4–5. Nhóm 3: gia đình.']],
        [['Bảng doanh thu: '], ['7200 vé vào cổng', 'hl', '= 20 × 360 ngày'], [' năm 1.']]],
      en: [[['Target: an average of '], ['more than 20 guests per day', 'hl'], ['.']],
        [['Group 1: students aged 15–24, groups of 5–10. Group 2: workers aged 24–30, in pairs or groups of 4–5. Group 3: families.']],
        [['Revenue table: '], ['7,200 entrance tickets', 'hl', '= 20 × 360 days'], [' in year 1.']]] },
      notes: [{ n: 2, sev: 'assumption', t: { vi: 'Không có mùa thấp điểm', en: 'No low season' },
        d: { vi: '7.200 vé nghĩa là 20 khách mỗi ngày trong 360 ngày. Kế hoạch không giảm nhu cầu cho mùa nước nổi hay ngày thường.', en: '7,200 tickets means 20 guests every day for 360 days. The plan does not reduce demand for flood season or weekdays.' },
        fix: { vi: '−25% khách → lợi nhuận năm 1 giảm ≈ 420 tr', en: '−25% visitors → year-1 profit falls by ≈ 420 M' } }] },
    { title: { vi: 'Chiến lược giá', en: 'Pricing' }, ref: { vi: 'Mục 4.7.2', en: '§4.7.2' }, page: 11,
      paras: { vi: [[['Vé vào cổng: 80.000 đồng/người. Trẻ em dưới 1m miễn phí vé, từ 1m–1,4m là 30.000 đồng/người.']],
        [['Vé thuê phòng 1 đêm: '], ['50.000 đồng/phòng', 'strike', '500.000 đ (giá xác nhận)'], ['.']],
        [['Tinh dầu cúc la mã: 50.000 đồng/15ml. Trà cúc la mã: '], ['80.000 đồng/500gr', 'hl', 'bảng doanh thu dùng 40'], ['.']]],
      en: [[['Entrance ticket: 80,000 đ per person. Children under 1 m free; 1–1.4 m 30,000 đ.']],
        [['One-night room: '], ['50,000 đ per room', 'strike', '500,000 đ (confirmed price)'], ['.']],
        [['Chamomile essential oil 50,000 đ / 15 ml. Chamomile tea '], ['80,000 đ / 500 g', 'hl', 'revenue table uses 40'], ['.']]] },
      notes: [{ n: 3, sev: 'conflict', t: { vi: 'Giá phòng', en: 'Room price' },
        d: { vi: 'Kế hoạch định giá phòng 50.000 đ và ghi doanh thu phòng 90 triệu đ. Giá đúng, đã được tác giả xác nhận, là 500.000 đ. Với 500.000 đ, doanh thu phòng tăng khoảng 810 triệu đ.', en: 'The plan prices a room at 50,000 đ and books 90 million đ of room revenue. The correct price, confirmed by the author, is 500,000 đ. At 500,000 đ, rooms add about 810 million đ.' },
        fix: { vi: 'Giá xác nhận 500.000 đ → +810 tr năm 1', en: 'Confirmed 500,000 đ → +810 M in year 1' } },
      { n: 4, sev: 'typo', t: { vi: 'Giá trà', en: 'Tea price' },
        d: { vi: 'Bảng giá ghi 80.000 đ/500 g; bảng doanh thu dùng 40.000 đ cho cùng gói, nên doanh thu trà có thể bị ghi thiếu 57,6 triệu đ.', en: 'The price list says 80,000 đ per 500 g; the revenue table uses 40,000 đ for the same pack, so tea revenue may be understated by 57.6 million đ.' },
        fix: { vi: '1.440 × 40 = thiếu 57,6 tr', en: '1,440 × 40 = 57.6 M missing' } }] },
    { title: { vi: 'Nhân sự & tiền lương', en: 'Team & payroll' }, ref: { vi: 'Mục 5.4 · Bảng 5.1', en: '§5.4 · Table 5.1' }, page: 14,
      paras: { vi: [[['Cơ cấu: Chủ Homestay, '], ['4 quản lý', 'hl'], [', 1 bán vé, 3 phục vụ, 3 bảo vệ, 3 vệ sinh.']],
        [['Bảng lương: 10 nhân viên, '], ['27.700 nghìn đồng/tháng', 'hl', 'quản lý = 0?'], ['.']]],
      en: [[['Organisation: an owner, '], ['4 managers', 'hl'], [', 1 ticket seller, 3 servers, 3 security, 3 cleaners.']],
        [['Payroll: 10 staff, '], ['27.7 million đ per month', 'hl', 'managers = 0?'], ['.']]] },
      notes: [{ n: 5, sev: 'omission', t: { vi: 'Quản lý không có lương', en: 'Managers are unpaid' },
        d: { vi: '4 quản lý và chủ homestay không có dòng lương. Chi phí nhân sự trong bảng lãi lỗ là 332,4 triệu đ, đúng bằng 12 × 27,7.', en: 'The 4 managers and the owner have no salary line. Staff cost in the P&L is 332.4 million đ, exactly 12 × 27.7.' },
        fix: { vi: '4 × 8 tr × 12 = +384 tr/năm', en: '4 × 8 M × 12 = +384 M / year' } }] },
    { title: { vi: 'Hòa vốn & NPV', en: 'Payback & NPV' }, ref: { vi: 'Mục 6.5', en: '§6.5' }, page: 19,
      paras: { vi: [[['Thời gian hòa vốn = Tổng vốn đầu tư / (Thực lãi + khấu hao tài sản)']],
        [['= '], ['500.000', 'strike', '4.000.000'], [' / (882.505 + 160.000) = 0,4796 (năm)']],
        [['→ Thời gian hòa vốn là '], ['5 tháng 23 ngày', 'strike', '≈ 3,8 năm'], ['. NPV = 4.598.481.086 đồng. Dự án khả thi.']]],
      en: [[['Payback = total investment / (net profit + depreciation)']],
        [['= '], ['500,000', 'strike', '4,000,000'], [' / (882,505 + 160,000) = 0.4796 years']],
        [['→ Payback is '], ['5 months 23 days', 'strike', '≈ 3.8 years'], ['. NPV = 4,598,481,086 đ. The project is feasible.']]] },
      notes: [{ n: 6, sev: 'error', t: { vi: 'Sai mẫu số', en: 'Wrong denominator' },
        d: { vi: 'Công thức ghi “tổng vốn đầu tư” nhưng dùng 500 triệu. Tổng vốn đầu tư ở mục 1.1 là 4 tỷ đ.', en: 'The formula says “total investment” but uses 500 million. Total investment in §1.1 is 4 billion đ.' },
        fix: { vi: '4.000 / 1.042,5 = 3,84 năm', en: '4,000 / 1,042.5 = 3.84 years' } }] }
  ];
  const SEV = { error: ['SAI', 'ERROR', '#d2402b'], conflict: ['MÂU THUẪN', 'CONFLICT', '#c0661a'], omission: ['THIẾU SÓT', 'OMISSION', '#8a5a00'],
    typo: ['LỖI GÕ?', 'TYPO?', '#7a7060'], assumption: ['GIẢ ĐỊNH', 'ASSUMPTION', '#3d6d78'], risk: ['RỦI RO', 'RISK', '#3d6d78'] };
  const TYPES = [{ vi: 'Câu hỏi', en: 'Question' }, { vi: 'Vấn đề', en: 'Issue' }, { vi: 'Ý tưởng', en: 'Idea' }];
  const SUMMARY = [
    [{ vi: 'Thời gian hòa vốn', en: 'Payback period' }, { vi: '5 th 23 ng', en: '5 mo 23 d' }, { vi: '3,8 năm', en: '3.8 years' }, { vi: 'Dùng tổng vốn 4 tỷ đ (mục 1.1) thay vì 500 triệu.', en: 'Total investment 4 billion đ (§1.1) instead of 500 million.' }],
    [{ vi: 'Doanh thu phòng năm 1', en: 'Room revenue, year 1' }, { vi: '90 tr', en: '90 M' }, { vi: '900 tr', en: '900 M' }, { vi: 'Giá 500.000 đ/đêm đã được tác giả xác nhận.', en: 'The author has confirmed 500,000 đ per night.' }],
    [{ vi: 'Doanh thu trà năm 1', en: 'Tea revenue, year 1' }, { vi: '57,6 tr', en: '57.6 M' }, { vi: '115,2 tr', en: '115.2 M' }, { vi: 'Dùng giá niêm yết 80.000 đ (mục 4.7.2).', en: 'Using the 80,000 đ list price (§4.7.2).' }],
    [{ vi: 'Chi phí nhân sự/năm', en: 'Staff cost, per year' }, { vi: '332,4 tr', en: '332.4 M' }, { vi: '716,4 tr', en: '716.4 M' }, { vi: 'Thêm 4 quản lý, 8 triệu đ/tháng (giả định minh họa).', en: 'Adding 4 managers at 8 million đ a month (illustrative).' }],
    [{ vi: 'Vé vào cổng năm 1', en: 'Entrance tickets, year 1' }, '7.200|7,200', '5.400|5,400', { vi: 'Trừ một phần tư năm do mùa nước nổi (giả định minh họa).', en: 'Allowing for a quarter of the year lost to flood season (illustrative).' }]
  ];
  const S = { sec: 0, pen: true, type: 0, my: K.get(KEY, {}) };
  if (!S.my || typeof S.my !== 'object') S.my = {};
  const total = SEC.reduce((a, x) => a + x.notes.length, 0);
  const pv = v => (typeof v === 'string' && v.includes('|') ? v.split('|')[K.en() ? 1 : 0] : t(v));

  const paras = (s, pen) => s.paras[K.en() ? 'en' : 'vi'].map(p => '<p>' + p.map(([txt, kind, mark]) =>
    (pen && kind ? '<span class="rv-' + kind + '">' + esc(txt) + '</span>' : esc(txt)) + (pen && mark ? '<span class="rv-mark">' + esc(mark) + '</span>' : '')).join('') + '</p>').join('');
  const notesHtml = s => s.notes.map(n => '<div class="rv-note"><span class="n">' + n.n + '</span><div><div class="t"><span>' + t(n.t) + '</span><span class="rv-sev" style="background:' + SEV[n.sev][2] + '">' + SEV[n.sev][K.en() ? 1 : 0] + '</span></div><div class="d">' + t(n.d) + '</div><div class="fix">' + t(n.fix) + '</div></div></div>').join('');
  const pageLbl = s => t({ vi: 'tr. ', en: 'p. ' }) + s.page;

  function render() {
    const s = SEC[S.sec], mine = S.my[S.sec] || [];
    const myCount = Object.values(S.my).reduce((a, v) => a + (Array.isArray(v) ? v.length : 0), 0);
    K.$('#rv-count').textContent = t({ vi: total + ' PHÁT HIỆN · ' + myCount + ' CỦA BẠN', en: total + ' FINDINGS · ' + myCount + ' YOURS' });
    const pen = K.$('#rv-pen'); pen.setAttribute('aria-pressed', String(S.pen)); pen.textContent = S.pen ? t({ vi: 'BÚT ĐỎ: BẬT', en: 'RED PEN: ON' }) : t({ vi: 'BÚT ĐỎ: TẮT', en: 'RED PEN: OFF' });
    K.$('#rv-toc').innerHTML = SEC.map((x, i) => '<li><button type="button" data-sec="' + i + '"' + (i === S.sec ? ' aria-current="true"' : '') + '><span>' + t(x.title) + '</span><span class="dots" aria-hidden="true">' + '●'.repeat(x.notes.length) + '</span></button></li>').join('');
    K.$('#rv-paper').innerHTML = '<div class="ref"><span>' + t(s.ref) + '</span><span>' + pageLbl(s) + '</span></div><h2>' + t(s.title) + '</h2>' + paras(s, S.pen) +
      '<div class="rv-nav"><button type="button" data-go="-1">' + t({ vi: '← TRƯỚC', en: '← PREVIOUS' }) + '</button><button type="button" data-go="1">' + t({ vi: 'TIẾP →', en: 'NEXT →' }) + '</button></div>';
    K.$('#rv-notes').innerHTML = S.pen
      ? '<div class="ch-k" style="color:var(--ch-red);margin-bottom:8px">' + t({ vi: 'Ghi chú thẩm định', en: 'Reviewer notes' }) + '</div>' + (s.notes.length ? notesHtml(s) : '<p class="ch-note">' + t({ vi: 'Phần này không có gì cần đánh dấu.', en: 'Nothing to flag in this section.' }) + '</p>')
      : '<p class="ch-note">' + t({ vi: 'Bút đỏ đang tắt. Bạn đang đọc kế hoạch như bản nộp.', en: 'The red pen is off. You are reading the plan as submitted.' }) + '</p>';
    K.$('#rv-mine').innerHTML = mine.map((m, j) => '<li><span class="ty">' + t(TYPES[m.type] || TYPES[0]) + '</span><span>' + esc(m.t) + '</span><button type="button" class="x" data-del="' + j + '">' + t({ vi: 'xóa', en: 'delete' }) + '</button></li>').join('');
    K.$('#rv-types').innerHTML = TYPES.map((ty, j) => '<button type="button" data-type="' + j + '" aria-pressed="' + (S.type === j) + '">' + t(ty) + '</button>').join('');
    K.$('#rv-sum').innerHTML = SUMMARY.map(r => '<tr><td>' + pv(r[0]) + '</td><td class="p">' + pv(r[1]) + '</td><td class="r">' + pv(r[2]) + '</td><td>' + pv(r[3]) + '</td></tr>').join('');
    /* Bản in: đủ sáu phần, bút đỏ bật, kèm ghi chú riêng */
    K.$('#rv-print').innerHTML = SEC.map((x, i) => '<section class="rv-psec"><div class="ch-k">' + t(x.ref) + ' · ' + pageLbl(x) + '</div><h2>' + t(x.title) + '</h2>' + paras(x, true) + notesHtml(x) +
      ((S.my[i] || []).length ? '<ul>' + S.my[i].map(m => '<li><b>' + t(TYPES[m.type] || TYPES[0]) + ':</b> ' + esc(m.t) + '</li>').join('') + '</ul>' : '') + '</section>').join('');
  }
  const save = () => K.set(KEY, S.my);

  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.id === 'rv-pen') { S.pen = !S.pen; render(); }
    else if (b.dataset.sec != null) { S.sec = +b.dataset.sec; render(); }
    else if (b.dataset.go != null) { S.sec = (S.sec + +b.dataset.go + SEC.length) % SEC.length; render(); }
    else if (b.dataset.type != null) { S.type = +b.dataset.type; render(); }
    else if (b.dataset.del != null) { S.my[S.sec] = (S.my[S.sec] || []).filter((_, x) => x !== +b.dataset.del); save(); render(); }
    else if (b.id === 'rv-add') {
      const d = K.$('#rv-draft'), txt = d.value.trim().slice(0, 1000); if (!txt) return;
      S.my[S.sec] = (S.my[S.sec] || []).concat([{ t: txt, type: S.type }]); d.value = ''; save(); render();
    } else if (b.id === 'rv-print-btn') window.print();
  });
  K.mount(render);
})();
