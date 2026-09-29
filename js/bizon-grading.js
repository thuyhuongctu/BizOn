/* BizOn — tính toán cho Trang Giảng viên (dữ liệu → bảng, điểm, Excel).
 * Chấm điểm theo «Hướng dẫn chấm điểm chi tiết» (Thang Diem Chi Tiet.dc.html): mỗi game thang 10, lấy từ kết quả game. */
(function () {
  const money = v => { const m = +v || 0; return (Math.abs(m) >= 1000 ? (m / 1000).toFixed(2) + ' tỷ' : Math.round(m) + ' tr') + '₫'; };
  const r0 = s => s.result_json || {};
  const clamp = v => Math.max(0, Math.min(100, +v || 0));
  const band = (v, steps) => { for (const [min, pts] of steps) if (v >= min) return pts; return 0; };
  const LETTERS = [[9, 'A', 4], [8, 'B+', 3.5], [7, 'B', 3], [6.5, 'C+', 2.5], [5.5, 'C', 2], [5, 'D+', 1.5], [4, 'D', 1], [-1, 'F', 0]];
  const letter = v => { const x = Math.round((+v || 0) * 10) / 10, m = LETTERS.find(([min]) => x >= min); return { l: m[1], g4: m[2], pass: m[2] >= 1 }; };
  const f1 = v => v == null ? '–' : (+v).toFixed(1).replace('.', ',');
  function teams(subs) {
    const by = {}; (subs || []).forEach(s => { (by[s.team_name] = by[s.team_name] || []).push(s); });
    return Object.keys(by).map(name => {
      const rs = by[name].sort((a, b) => a.round_number - b.round_number), last = rs[rs.length - 1];
      const profit = rs.reduce((a, r) => a + (+r0(r).netProfit || 0), 0);
      const flags = rs.filter(r => r0(r).win === true || (r0(r).win == null && (+r0(r).share || 0) >= 25 && +r0(r).netProfit > 0)).length;
      return { name, rs, last, profit, flags, share: +(+r0(last).share || 0).toFixed(1) };
    }).sort((a, b) => b.profit - a.profit);
  }

  /* ---------- Bật Nghiệp: B1–B6 /10 ----------
   * Lưu vào bảng điểm sẵn có: reasoning = số vòng đóng góp (B5, 0–6), teamwork = chuẩn bị trước biến cố (B6, 0/1). */
  const ADVERSE = ['EV_PRICEWAR', 'EV_RECESSION', 'EV_SUPPLY'];

  /* ---------- Nhật ký thành viên → B5 từng người (tự động) ----------
   * Tham gia: vòng có ghi nhận trước khi đội chốt (đề xuất, biên bản, Nếu–Thì, CEO chốt) → tối đa 0,75.
   * Được áp dụng: đề xuất lệch ≤ 10% so với quyết định đã chốt; biên bản ≥ 30 ký tự; CEO: chốt vòng có dùng ít nhất 1 đề xuất → tối đa 0,75. */
  const ROLE_KEYS = { CFO: ['rd', 'paymentTerm'], CMO: ['price', 'marketing'], COO: ['production', 'workers', 'training'] };
  const near = (a, b) => b != null && Math.abs(+a - +b) <= Math.max(1, Math.abs(+b) * .1);
  function members(T, log) {
    const out = [], byTeam = {};
    (log || []).forEach(l => { (byTeam[l.team_name] = byTeam[l.team_name] || []).push(l); });
    Object.keys(byTeam).forEach(team => {
      const L = byTeam[team], t = T.find(x => x.name === team), commitAt = {}, dec = {};
      L.filter(l => l.kind === 'commit').forEach(l => { if (!commitAt[l.round_number] || l.created_at < commitAt[l.round_number]) commitAt[l.round_number] = l.created_at; });
      (t ? t.rs : []).forEach(r => { const j = r0(r); dec[r.round_number] = j.decisions || j.decision || {}; if (!commitAt[r.round_number]) commitAt[r.round_number] = r.created_at; });
      const M = {};
      L.forEach(l => {
        const k = (l.member_email || l.member_name || '?') + '|' + l.role;
        const m = M[k] = M[k] || { team, name: l.member_name || l.member_email || '?', email: l.member_email || '', role: l.role, part: {}, applied: {}, whatif: 0, props: 0 };
        if (commitAt[l.round_number] && l.created_at > commitAt[l.round_number]) return; // gửi sau khi đội đã chốt: không tính
        m.part[l.round_number] = true;
        if (l.kind === 'whatif') m.whatif++;
        if (l.kind === 'minutes' && String((l.payload || {}).text || '').trim().length >= 30) m.applied[l.round_number] = true;
        if (l.kind === 'proposal') { m.props++; const keys = ROLE_KEYS[l.role] || [], d = dec[l.round_number], p = l.payload || {};
          if (d && keys.some(x => p[x] != null) && keys.every(x => p[x] == null || near(p[x], d[x]))) m.applied[l.round_number] = true; }
      });
      const ms = Object.values(M);
      ms.filter(m => m.role === 'CEO').forEach(m => Object.keys(m.part).forEach(r => {
        if (L.some(l => l.kind === 'commit' && String(l.round_number) === r) && ms.some(o => o !== m && o.role !== 'SEC' && o.applied[r])) m.applied[r] = true; }));
      ms.forEach(m => { m.p = Object.keys(m.part).length; m.a = Object.keys(m.applied).length;
        m.b5 = band(m.p, [[5, .75], [3, .5], [1, .2]]) + band(m.a, [[4, .75], [2, .5], [1, .2]]);
        m.dots = [1, 2, 3, 4, 5, 6].map(n => m.applied[n] ? 2 : m.part[n] ? 1 : 0); out.push(m); });
    });
    const RO = { CEO: 0, CFO: 1, CMO: 2, COO: 3, SEC: 4 };
    return out.sort((a, b) => a.team.localeCompare(b.team) || RO[a.role] - RO[b.role]);
  }
  // Chuẩn bị trước biến cố (B6): vòng biến cố bất lợi có Nếu–Thì hoặc ≥ 3 ghi nhận đề xuất/biên bản trước khi chốt
  function autoPrep(t, log) {
    const L = (log || []).filter(l => l.team_name === t.name); if (!L.length) return null;
    const adv = t.rs.filter(r => ADVERSE.includes(r0(r).eventId)).map(r => r.round_number);
    return adv.some(n => { const R = L.filter(l => l.round_number === n); return R.some(l => l.kind === 'whatif') || R.filter(l => l.kind === 'proposal' || l.kind === 'minutes').length >= 3; });
  }
  function grades(T, scores, edits, log) {
    const MB = members(T, log);
    const S = {}; (scores || []).forEach(s => { S[s.team_name] = s; });
    const n = T.length; // T đã xếp theo lợi nhuận giảm dần
    return T.map((t, i) => {
      const e = Object.assign({}, S[t.name] || {}, edits[t.name] || {});
      const mine = MB.filter(m => m.team === t.name), auto = mine.length > 0, ap = autoPrep(t, log);
      const b5r = e.reasoning ?? '', prep = ap != null ? ap : +(e.teamwork ?? 0) > 0, note = e.note ?? '';
      const J = t.rs.map(r0), L = J[J.length - 1] || {};
      const q = n ? i / n : 0;
      let b1 = q < .25 ? 2 : q < .5 ? 1.5 : q < .75 ? 1 : .5; if (t.profit < 0) b1 = Math.min(b1, .5);
      const b2 = band(t.share, [[30, 2], [25, 1.6], [20, 1.2], [-1e9, .8]]);
      const oe = J.filter(j => j.oee != null).map(j => +j.oee), oee = oe.length ? oe.reduce((a, b) => a + b, 0) / oe.length : null;
      const defect = L.defect != null ? +L.defect : null, qr = L.quickRatio != null ? +L.quickRatio : null;
      const b3 = (oee == null ? 0 : band(oee, [[85, 1], [80, .7], [-1e9, .3]])) + (defect != null && defect <= 2 ? .4 : 0) + (qr != null && qr >= 1 ? .6 : 0);
      const ach = L.ach != null ? +L.ach : null, b4 = ach == null ? 0 : Math.min(1.5, ach * .15);
      const b5 = auto ? mine.reduce((a, m) => a + m.b5, 0) / mine.length : b5r === '' ? 0 : band(+b5r, [[5, 1.5], [3, 1], [1, .4]]);
      const adv = J.filter(j => ADVERSE.includes(j.eventId));
      const qrBad = adv.filter(j => j.quickRatio != null && +j.quickRatio < 1).length, pOk = adv.filter(j => +j.netProfit >= 0).length;
      const b6 = (qrBad === 0 ? .4 : qrBad === 1 ? .2 : 0) + (!adv.length || pOk === adv.length ? .4 : pOk >= adv.length / 2 ? .2 : 0) + (prep ? .2 : 0);
      const missing = oee == null || defect == null || qr == null || ach == null;
      return { name: t.name, rounds: t.rs.length, share: t.share, profit: t.profit, flags: t.flags, oee, defect, qr, ach, adv: adv.length, advOk: pOk,
        b1, b2, b3, b4, b5, b6, reasoning: b5r, teamwork: prep ? 1 : 0, note, missing, auto, autoPrep: ap != null, members: mine.length, total: b1 + b2 + b3 + b4 + b5 + b6 };
    });
  }

  /* ---------- Hộ Chiếu: A1–A4 /10 ----------
   * Lựa chọn «Vững» theo bảng 2.3. Mảng = chỉ số lựa chọn được tính; hàm = có điều kiện (ảnh chụp chỉ số lúc chọn). */
  const SOLID = {
    trend: [0, 1], pricewar: [1], green: [0], celeb: [0], subst: [0], fx: [1], reg: [0], tax: [0, 1], cert: [0], data: [0],
    port: [0], talent: [0], supplier: [0], defect: [0], cashflow: [0, 1], conflict: [0], training: [0], review: [0], held: [0],
    devalue: [0], copy: [0],
    greenlaw: p => p.susts >= 2 ? [0] : [1],
    betray: p => (p.kp >= 50 || p.rep >= 60) ? [0, 1] : [0],
    board: p => p.k >= 40 ? [0] : [],
    mission: p => [1, 3, 4].concat(p.capab >= 55 && p.cash >= 2 ? [0] : [], (p.rep >= 55 || p.k1 >= 60) ? [2] : []),
  };
  function bpGrade(r) {
    const d = r.detail_json || {}, pd = clamp(+r.profit / 12 * 100);
    const dims = [pd, clamp(r.rep), clamp(r.capab), clamp(r.adapt), clamp(r.sust)], lo = Math.min(...dims), tot = +r.total_score || 0;
    let a1 = tot * .05; if (d.fail) a1 = Math.min(a1, 1.5);
    const a2 = (tot >= 72 && lo >= 60 ? .6 : 0) + (d.rival != null && +r.profit > +d.rival ? .4 : 0);
    const a3 = band(lo, [[60, 2], [45, 1.4], [30, .7]]);
    const P = Array.isArray(d.picks) ? d.picks : null;
    const solid = P ? P.filter(p => { const s = SOLID[p.id], ok = typeof s === 'function' ? s(p) : s; return ok && ok.includes(p.i); }).length : null;
    const a4a = P == null ? null : !P.length ? 1.5 : band(solid / P.length, [[.8, 1.5], [.6, 1.1], [.4, .7], [0, .3]]);
    const a4b = d.negQ == null ? null : d.negQ === 0 ? .5 : d.negQ === 1 ? .25 : 0;
    return { a1, a2, a3, a4a, a4b, solid, picks: P ? P.length : null, negQ: d.negQ ?? null, lo, missing: a4a == null || a4b == null, total: a1 + a2 + a3 + (a4a || 0) + (a4b || 0) };
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
  function xls(code, T, G, BP, MB) {
    const esc = v => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const row = c => '<Row>' + c.map(x => `<Cell><Data ss:Type="${typeof x === 'number' && isFinite(x) ? 'Number' : 'String'}">${esc(x)}</Data></Cell>`).join('') + '</Row>';
    const sheet = (n, rows) => `<Worksheet ss:Name="${esc(n)}"><Table>${rows.join('')}</Table></Worksheet>`;
    const r1 = v => v == null ? '' : Math.round(v * 100) / 100;
    const s1 = [row(['Đội', 'Số vòng', 'LN lũy kế (tr₫)', 'Thị phần V6 (%)', 'OEE TB', 'Lỗi V6 (%)', 'Quick ratio V6', 'Thành tựu', 'Vòng biến cố bất lợi', 'Vòng đóng góp (B5)', 'Chuẩn bị (B6)',
      'B1 /2', 'B2 /2', 'B3 /2', 'B4 /1,5', 'B5 /1,5', 'B6 /1', 'Tổng /10', 'Điểm chữ', 'Thang 4', 'Tích lũy', 'Nhận xét'])]
      .concat(G.map(g => row([g.name, g.rounds, Math.round(g.profit), g.share, r1(g.oee), r1(g.defect), r1(g.qr), g.ach ?? '', g.adv, g.reasoning === '' ? '' : +g.reasoning, g.teamwork ? 'Có' : 'Không',
        r1(g.b1), r1(g.b2), r1(g.b3), r1(g.b4), r1(g.b5), r1(g.b6), +g.total.toFixed(1), letter(g.total).l, letter(g.total).g4, letter(g.total).pass ? 'Đạt' : 'Không', g.note])));
    const s2 = [row(['Đội', 'Vòng', 'Biến cố', 'Giá', 'Marketing', 'Sản lượng', 'R&D', 'Nhân công', 'Vốn', 'Thị phần (%)', 'Doanh thu (tr₫)', 'Lợi nhuận (tr₫)', 'Số dư (tr₫)', 'OEE', 'Lỗi (%)', 'Quick ratio', 'Nộp lúc'])];
    T.forEach(t => t.rs.forEach(r => { const j = r0(r), d = j.decision || j.decisions || j.input || {};
      s2.push(row([t.name, r.round_number, j.eventId || '', d.price ?? d.gia ?? '', d.marketing ?? '', d.production ?? '', d.rd ?? '', d.workers ?? '', d.funding ?? '', +(+j.share || 0).toFixed(1), Math.round(+j.revenue || 0), +(+j.netProfit || 0).toFixed(1), Math.round(+j.balance || 0), j.oee ?? '', j.defect ?? '', j.quickRatio ?? '', new Date(r.created_at).toLocaleString('vi-VN')])); }));
    const s3 = [row(['Sinh viên', 'Doanh nghiệp', 'Điểm tổng /100', 'Chiều thấp nhất', 'Lựa chọn Vững', 'Số sự kiện', 'Quý âm tiền', 'A1 /5', 'A2 /1', 'A3 /2', 'A4a /1,5', 'A4b /0,5', 'Tổng /10', 'Điểm chữ', 'Thang 4', 'Tích lũy', 'Nộp lúc'])]
      .concat((BP || []).map(r => { const a = bpGrade(r); return row([r.player_name || 'Ẩn danh', r.company || '', r.total_score ?? '', Math.round(a.lo), a.solid ?? '', a.picks ?? '', a.negQ ?? '',
        r1(a.a1), r1(a.a2), r1(a.a3), r1(a.a4a), r1(a.a4b), +a.total.toFixed(1), letter(a.total).l, letter(a.total).g4, letter(a.total).pass ? 'Đạt' : 'Không', new Date(r.created_at).toLocaleString('vi-VN')]); }));
    const s4 = [row(['Đội', 'Thành viên', 'Email', 'Vai', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'Vòng tham gia', 'Vòng được áp dụng', 'Lần Nếu–Thì', 'B5 cá nhân /1,5', 'Tổng cá nhân /10', 'Điểm chữ', 'Thang 4', 'Tích lũy'])]
      .concat((MB || []).map(m => { const g = G.find(x => x.name === m.team), tot = g ? g.total - g.b5 + m.b5 : m.b5, L = letter(tot);
        return row([m.team, m.name, m.email, m.role].concat(m.dots.map(d => d === 2 ? 'Áp dụng' : d === 1 ? 'Tham gia' : ''), [m.p, m.a, m.whatif, r1(m.b5), +tot.toFixed(1), L.l, L.g4, L.pass ? 'Đạt' : 'Không'])); }));
    const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${sheet('Bật Nghiệp', s1)}${sheet('Quyết định theo vòng', s2)}${sheet('Hộ Chiếu', s3)}${sheet('Thành viên', s4)}</Workbook>`;
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([xml], { type: 'application/vnd.ms-excel' })); a.download = `BizOn-${code}-so-diem.xls`; document.body.appendChild(a); a.click(); a.remove();
  }
  const EVENTS = [['', 'Theo kịch bản (không can thiệp)'], ['EV_STABLE', '🌤️ Thị trường ổn định'], ['EV_GOLDEN', '🌟 Cơ hội vàng – tổng cầu tăng'], ['EV_PRICEWAR', '⚔️ Cạnh tranh về giá – nhạy giá'], ['EV_RECESSION', '⚡ Khủng hoảng năng lượng'], ['EV_SUPPLY', '🚢 Khủng hoảng chuỗi cung ứng'], ['EV_MILESTONE', '🐉 Việt Nam hóa Rồng']];
  window.BizOnInstructorPage = { money, f1, letter, members, teams, grades, bpGrade, decRows, xls, EVENTS };
})();
