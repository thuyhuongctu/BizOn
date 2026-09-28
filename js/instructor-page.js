/* BizOn — tính toán cho Trang Giảng viên (dữ liệu → bảng, điểm, Excel). */
(function () {
  const money = v => { const m = +v || 0; return (Math.abs(m) >= 1000 ? (m / 1000).toFixed(2) + ' tỷ' : Math.round(m) + ' tr') + '₫'; };
  const r0 = s => s.result_json || {};
  function teams(subs) {
    const by = {}; (subs || []).forEach(s => { (by[s.team_name] = by[s.team_name] || []).push(s); });
    return Object.keys(by).map(name => {
      const rs = by[name].sort((a, b) => a.round_number - b.round_number), last = rs[rs.length - 1];
      const profit = rs.reduce((a, r) => a + (+r0(r).netProfit || 0), 0);
      const flags = rs.filter(r => r0(r).win === true || (r0(r).win == null && (+r0(r).share || 0) >= 25 && +r0(r).netProfit > 0)).length;
      return { name, rs, last, profit, flags, share: +(+r0(last).share || 0).toFixed(1) };
    }).sort((a, b) => b.profit - a.profit);
  }
  function grades(T, scores, edits) {
    const maxP = Math.max(1, ...T.map(t => t.profit));
    const S = {}; (scores || []).forEach(s => { S[s.team_name] = s; });
    return T.map(t => {
      const e = Object.assign({}, S[t.name] || {}, edits[t.name] || {});
      const reasoning = e.reasoning ?? '', teamwork = e.teamwork ?? '', note = e.note ?? '';
      const pP = Math.max(0, t.profit) / maxP * 45, pF = t.flags / 6 * 35;
      const pR = ((+reasoning || 0) + (+teamwork || 0)) / 20 * 20;
      return { name: t.name, rounds: t.rs.length, share: t.share, profit: t.profit, flags: t.flags, pP, pF, reasoning, teamwork, note, total: pP + pF + pR };
    });
  }
  function decRows(team) {
    const head = ['Vòng', 'Giá (k₫)', 'Marketing', 'Sản lượng', 'R&D', 'Nhân công', 'Vốn', 'Thị phần', 'Lợi nhuận', 'Kết quả'];
    const cells = [];
    (team ? team.rs : []).forEach(r => {
      const j = r0(r), d = j.decision || j.decisions || j.input || {};
      const pick = (...k) => { for (const x of k) if (d[x] != null) return d[x]; return '–'; };
      const np = +j.netProfit || 0;
      [['V' + r.round_number, 700], [pick('price', 'gia'), 400], [pick('marketing', 'mkt'), 400], [pick('production', 'prod'), 400], [pick('rd'), 400], [pick('workers'), 400],
        [pick('funding') === 'loan' ? 'Vay' : pick('funding') === 'equity' ? 'Vốn CSH' : pick('funding'), 400], [(+j.share || 0).toFixed(1) + '%', 700], [money(np), 700], [j.win ? '🚩 Cắm cờ' : np > 0 ? 'Có lãi' : 'Lỗ', 700]]
        .forEach(([v, w], i) => cells.push({ v, w, color: i === 8 ? (np >= 0 ? '#3f8a44' : '#c0443a') : '#1f3f4a' }));
    });
    return { head, cells };
  }
  function xls(code, T, G) {
    const esc = v => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const row = c => '<Row>' + c.map(x => `<Cell><Data ss:Type="${typeof x === 'number' && isFinite(x) ? 'Number' : 'String'}">${esc(x)}</Data></Cell>`).join('') + '</Row>';
    const sheet = (n, rows) => `<Worksheet ss:Name="${esc(n)}"><Table>${rows.join('')}</Table></Worksheet>`;
    const s1 = [row(['Đội', 'Số vòng', 'Thị phần cuối (%)', 'LN lũy kế (tr₫)', 'Cờ', 'Điểm LN /45', 'Điểm cờ /35', 'Lập luận /10', 'Hợp tác /10', 'Tổng /100', 'Nhận xét'])]
      .concat(G.map(g => row([g.name, g.rounds, g.share, Math.round(g.profit), g.flags, +g.pP.toFixed(1), +g.pF.toFixed(1), g.reasoning === '' ? '' : +g.reasoning, g.teamwork === '' ? '' : +g.teamwork, +g.total.toFixed(1), g.note])));
    const s2 = [row(['Đội', 'Vòng', 'Giá', 'Marketing', 'Sản lượng', 'R&D', 'Nhân công', 'Vốn', 'Thị phần (%)', 'Doanh thu (tr₫)', 'Lợi nhuận (tr₫)', 'Số dư (tr₫)', 'Nộp lúc'])];
    T.forEach(t => t.rs.forEach(r => { const j = r0(r), d = j.decision || j.decisions || j.input || {};
      s2.push(row([t.name, r.round_number, d.price ?? d.gia ?? '', d.marketing ?? '', d.production ?? '', d.rd ?? '', d.workers ?? '', d.funding ?? '', +(+j.share || 0).toFixed(1), Math.round(+j.revenue || 0), +(+j.netProfit || 0).toFixed(1), Math.round(+j.balance || 0), new Date(r.created_at).toLocaleString('vi-VN')])); }));
    const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${sheet('Sổ điểm', s1)}${sheet('Quyết định theo vòng', s2)}</Workbook>`;
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([xml], { type: 'application/vnd.ms-excel' })); a.download = `BizOn-${code}-so-diem.xls`; document.body.appendChild(a); a.click(); a.remove();
  }
  const EVENTS = [['', 'Theo kịch bản (không can thiệp)'], ['EV_STABLE', '🌤️ Thị trường ổn định'], ['EV_GOLDEN', '🌟 Cơ hội vàng – tổng cầu tăng'], ['EV_PRICEWAR', '⚔️ Cạnh tranh về giá – nhạy giá'], ['EV_RECESSION', '⚡ Khủng hoảng năng lượng'], ['EV_SUPPLY', '🚢 Khủng hoảng chuỗi cung ứng'], ['EV_MILESTONE', '🐉 Việt Nam hóa Rồng']];
  window.BizOnInstructorPage = { money, teams, grades, decRows, xls, EVENTS };
})();
