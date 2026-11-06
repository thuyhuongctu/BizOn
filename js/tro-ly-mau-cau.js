/* BizOn — Trợ lý giảng viên: soạn bản nháp nhận xét cuối vòng (Bật Nghiệp).
 * Thiết kế: docs/design/tro-ly-giang-vien.md. Trợ lý là LUẬT, không phải mô hình ngôn ngữ: cùng số liệu luôn ra cùng chữ.
 * Mỗi bản nháp gồm một điểm ghi nhận và một câu hỏi gợi mở, cả hai dẫn số của chính đội.
 * Không bao giờ nói đội phải đặt giá hay chi bao nhiêu («Lumina không chọn giúp», rubric §1.2).
 *
 * Đổi ngưỡng hay mẫu câu giữa học kỳ thì TĂNG MAU_PHIEN_BAN: phiên bản được lưu vào biên nhận của mỗi nhận xét,
 * để dữ liệu nghiên cứu còn tách được lớp nào dùng bộ nào. */
(function (root) {
  const MAU_PHIEN_BAN = 1;
  const NGUONG = { quick: 1.0, hutHang: 0.10, pheTram: 4.0, oeeTot: 85 };

  // Thứ tự trong mảng là thứ tự ưu tiên (§4.2). clo chỉ để hiện nhãn cho giảng viên.
  const RUI_RO = ['R1', 'R2', 'R3', 'R4', 'R5'];
  const TOT = ['G1', 'G2', 'G3'];
  const CLO = { R1: 'B', R2: 'A·C', R3: 'A', R4: 'C', R5: 'A', G1: 'A', G2: 'B', G3: 'C', G0: '', Q0: '' };

  // Mẫu câu. Chỗ trống {x} điền bằng số đã định dạng. Không dùng «nên», «hãy», «should».
  const MAU = {
    R1: { vi: 'Quick ratio vòng {round} là {quick}, dưới mức {nguongQuick}. Khoản chi nào trong vòng này làm tiền mặt hụt so với nợ ngắn hạn?',
          en: 'Your quick ratio in round {round} is {quick}, below {nguongQuick}. Which spending this round left cash short of short-term liabilities?' },
    R2: { vi: 'Đội hụt {lost} sản phẩm so với nhu cầu, trong khi bán được {sold}. Điều gì trong kế hoạch sản xuất hay công suất khiến cung không theo kịp cầu?',
          en: 'The team was short {lost} units against demand, while selling {sold}. What in the production plan or capacity kept supply from meeting demand?' },
    R3: { vi: 'Thị phần cao nhất mà lỗ: đội chiếm {share}% thị trường (đối thủ mạnh nhất {rivalTop}%) nhưng lợi nhuận ròng là {np}. Phần doanh thu giành thêm có bù được chi phí bỏ ra để giành nó không?',
          en: 'Top market share but a loss: the team holds {share}% (strongest rival {rivalTop}%) yet net profit is {np}. Did the extra revenue cover what it cost to win it?' },
    R4: { vi: 'Tỉ lệ phế phẩm vòng {round} là {defect}%, cao hơn mức {nguongPhe}%. Phế phẩm tăng đã đẩy chi phí trên mỗi sản phẩm lên thế nào?',
          en: 'The defect rate in round {round} is {defect}%, above {nguongPhe}%. How did more defects push up the cost of each unit?' },
    R5: { vi: 'Chi marketing tăng từ {mktTruoc} lên {mkt} nhưng thị phần chỉ đổi {dShare} điểm. Vì sao phần chi thêm chưa chuyển thành khách hàng?',
          en: 'Marketing spend rose from {mktTruoc} to {mkt} but market share moved only {dShare} points. Why did the extra spend not turn into customers?' },
    Q0: { vi: 'Thị phần vòng {round} là {share}%, lợi nhuận ròng {np}. Quyết định nào của vòng này đội muốn giữ ở vòng sau, và số liệu nào cho thấy điều đó?',
          en: 'Round {round} market share is {share}%, net profit {np}. Which decision from this round does the team want to keep next round, and which number shows why?' },
    G1: { vi: 'Ghi nhận: thị phần lên {share}% từ {shareTruoc}%.',
          en: 'Well done: market share rose to {share}% from {shareTruoc}%.' },
    G2: { vi: 'Ghi nhận: đội có lãi trở lại, lợi nhuận ròng {np} sau vòng trước {npTruoc}.',
          en: 'Well done: the team is back in profit, net profit {np} after {npTruoc} last round.' },
    G3: { vi: 'Ghi nhận: OEE đạt {oee}% và phế phẩm chỉ {defect}%, dây chuyền chạy ổn định.',
          en: 'Well done: OEE reached {oee}% with only {defect}% defects; the line is running steadily.' },
    G0: { vi: 'Ghi nhận: đội đã nộp kết quả vòng {round}.',
          en: 'Noted: the team submitted its round {round} results.' },
  };
  const THIEU = { vi: 'Chưa đủ số liệu để soạn, giảng viên tự viết.', en: 'Not enough data to draft; please write this one yourself.' };

  // Số không hữu hạn (NaN, Infinity) hay không phải số: coi như thiếu (§5).
  const so = v => (typeof v === 'number' && isFinite(v)) ? v : null;
  const co = (...xs) => xs.every(x => x !== null);
  const loc = lang => (lang === 'en' ? 'en-US' : 'vi-VN');
  const fmt = (v, lang, d) => v.toLocaleString(loc(lang), { minimumFractionDigits: d, maximumFractionDigits: d });
  const tien = (v, lang) => fmt(Math.round(v), lang, 0) + (lang === 'en' ? 'M VND' : ' tr₫');

  // Đọc các chỉ số cần cho luật từ result_json rút gọn. Thiếu trường thì null.
  function chiSo(r) {
    r = r || {};
    const d = r.decisions || r.decision || {};
    return {
      round: so(r.round), share: so(r.share), netProfit: so(r.netProfit), quick: so(r.quickRatio),
      lost: so(r.lostSales), sold: so(r.sold), defect: so(r.defect), oee: so(r.oee),
      rivalTop: so(r.rivalTopShare), mkt: so(d.marketing),
    };
  }

  // Trả về mảng mã tín hiệu (rủi ro trước, theo thứ tự ưu tiên; rồi tín hiệu tốt) và cờ «có dùng được gì không».
  function tinHieu(r, p, nguong) {
    const N = Object.assign({}, NGUONG, nguong || {});
    const a = chiSo(r), b = p ? chiSo(p) : null;
    const out = [];
    let danhGiaDuoc = 0;
    const xet = (ma, duLieu, dk) => { if (!duLieu) return; danhGiaDuoc++; if (dk()) out.push(ma); };
    xet('R1', co(a.quick), () => a.quick < N.quick);
    // sold = 0: nhân với 0 thì luôn đúng, nên đổi thành «có hụt là hỏi» (§5).
    xet('R2', co(a.lost, a.sold), () => (a.sold === 0 ? a.lost > 0 : a.lost > N.hutHang * a.sold));
    xet('R3', co(a.netProfit, a.share, a.rivalTop), () => a.netProfit < 0 && a.share >= a.rivalTop);
    xet('R4', co(a.defect), () => a.defect > N.pheTram);
    xet('R5', b && co(a.mkt, b.mkt, a.share, b.share), () => a.mkt > b.mkt * 1.3 && a.share - b.share < 1);
    xet('G1', b && co(a.share, b.share), () => a.share - b.share >= 2);
    xet('G2', b && co(a.netProfit, b.netProfit), () => a.netProfit > 0 && b.netProfit <= 0);
    xet('G3', co(a.oee, a.defect), () => a.oee >= N.oeeTot && a.defect <= N.pheTram / 2);
    return { ma: out, danhGiaDuoc, a, b, N };
  }

  function dien(mau, vals) {
    return mau.replace(/\{(\w+)\}/g, (m, k) => (vals[k] === undefined || vals[k] === null ? m : vals[k]));
  }

  /* soan(r, p, opts) → bản nháp cho một đội ở một vòng.
   *   r: result_json vòng N; p: result_json vòng N−1 (hoặc null); opts: { lang: 'vi'|'en', nguong, round }
   * Kết quả: { thieu, hoi, ghiNhan, ruiRo: [...], mucChuY, quick, text, canCu } */
  function soan(r, p, opts) {
    opts = opts || {};
    const lang = opts.lang === 'en' ? 'en' : 'vi';
    const t = tinHieu(r, p, opts.nguong);
    const { a, b, N } = t;
    const ruiRo = t.ma.filter(m => RUI_RO.includes(m));
    const tot = t.ma.filter(m => TOT.includes(m));
    const round = a.round !== null ? a.round : so(opts.round);
    const coQ0 = co(a.share, a.netProfit);
    if (!t.danhGiaDuoc && !coQ0) {
      return { thieu: true, hoi: null, ghiNhan: null, ruiRo: [], mucChuY: 0, quick: a.quick, text: THIEU[lang],
               canCu: { hoi: null, ghi_nhan: null, so: {}, mau_phien_ban: MAU_PHIEN_BAN, nguong: N } };
    }
    const hoi = ruiRo[0] || (coQ0 ? 'Q0' : null);
    const ghiNhan = tot[0] || 'G0';
    // Chỉ số đã điền vào câu: giữ cả số gốc (biên nhận) lẫn chữ đã định dạng (để điền).
    const goc = {
      round, share: a.share, shareTruoc: b && b.share, netProfit: a.netProfit, netProfitTruoc: b && b.netProfit,
      quickRatio: a.quick, lostSales: a.lost, sold: a.sold, defect: a.defect, oee: a.oee, rivalTopShare: a.rivalTop,
      marketing: a.mkt, marketingTruoc: b && b.mkt,
    };
    const f = {
      round: round !== null ? String(round) : '?',
      share: a.share !== null ? fmt(a.share, lang, 1) : null,
      shareTruoc: b && b.share !== null ? fmt(b.share, lang, 1) : null,
      dShare: b && co(a.share, b.share) ? fmt(a.share - b.share, lang, 1) : null,
      np: a.netProfit !== null ? tien(a.netProfit, lang) : null,
      npTruoc: b && b.netProfit !== null ? tien(b.netProfit, lang) : null,
      quick: a.quick !== null ? fmt(a.quick, lang, 2) : null,
      nguongQuick: fmt(N.quick, lang, 2),
      lost: a.lost !== null ? fmt(Math.round(a.lost), lang, 0) : null,
      sold: a.sold !== null ? fmt(Math.round(a.sold), lang, 0) : null,
      defect: a.defect !== null ? fmt(a.defect, lang, 1) : null,
      nguongPhe: fmt(N.pheTram, lang, 1),
      oee: a.oee !== null ? fmt(a.oee, lang, 0) : null,
      rivalTop: a.rivalTop !== null ? fmt(a.rivalTop, lang, 1) : null,
      mkt: a.mkt !== null ? tien(a.mkt, lang) : null,
      mktTruoc: b && b.mkt !== null ? tien(b.mkt, lang) : null,
    };
    const cau = [dien(MAU[ghiNhan][lang], f)];
    if (hoi) cau.push(dien(MAU[hoi][lang], f));
    const so_ = {};
    Object.keys(goc).forEach(k => { if (goc[k] !== null && goc[k] !== undefined) so_[k] = goc[k]; });
    return {
      thieu: false, hoi, ghiNhan, ruiRo, mucChuY: ruiRo.length, quick: a.quick, text: cau.join('\n'),
      canCu: { hoi, ghi_nhan: ghiNhan, rui_ro: ruiRo, so: so_, mau_phien_ban: MAU_PHIEN_BAN, nguong: N },
    };
  }

  // Xếp bảng: nhiều tín hiệu rủi ro lên trước; hoà thì quick ratio thấp hơn trước; thiếu quick xuống sau; cuối cùng theo tên.
  function soSanh(x, y) {
    if (y.nhap.mucChuY !== x.nhap.mucChuY) return y.nhap.mucChuY - x.nhap.mucChuY;
    const qx = x.nhap.quick, qy = y.nhap.quick;
    if (qx !== qy) { if (qx === null) return 1; if (qy === null) return -1; return qx - qy; }
    return String(x.team).localeCompare(String(y.team), 'vi');
  }

  const api = { MAU_PHIEN_BAN, NGUONG, MAU, THIEU, CLO, RUI_RO, TOT, soan, tinHieu, soSanh };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BizOnTroLy = api;
})(typeof window !== 'undefined' ? window : this);
