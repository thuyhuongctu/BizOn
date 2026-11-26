/* BizOn – Phòng pitch, rubric nghiên cứu và chấm cặp mù (đặc tả specs/012-pitch-nang-cap, PR 2).
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Rubric 6 tiêu chí, thang 1–5 có mô tả neo, chạy SONG SONG với điểm lớp 4 × 2,5 (làm rõ 2): chỉ dùng cho chấm cặp và nghiên cứu.
 * Biến kết quả «ý định đầu tư» 1–5 không phải tiêu chí chấm. Cơ sở: docs/research/DO-TIN-CAY-PITCH.md (có tài liệu tham khảo APA).
 * Chấm mù: màn chiếu (chủ phòng) giữ phiếu; bản tin gửi cho mọi người chỉ có SỐ người đã nộp cho tới khi đủ người
 * hoặc giảng viên bấm mở điểm. Phần dưới là hàm thuần, test được trong Node. */
(function (root) {
  'use strict';

  const neo = (a, b, c, d, e) => ({ 1: a, 2: b, 3: c, 4: d, 5: e });
  const TIEU_CHI = [
    { id: 'chuan_bi', nguon: 'Chen, Yao & Kotha (2009)',
      vi: 'Mức chuẩn bị', en: 'Preparedness',
      hoi: { vi: 'Bài trình bày có cấu trúc, số liệu sẵn sàng, các vai nối nhau mạch lạc?', en: 'Is the pitch structured, with figures ready and roles handing over smoothly?' },
      neo: neo(
        { vi: 'Lộn xộn, đọc giấy, thiếu số liệu, các vai không biết ai nói tiếp.', en: 'Disorganised, read from notes, figures missing, roles unsure who speaks next.' },
        { vi: 'Có khung nhưng nhảy cóc; số liệu rời rạc, phải tìm.', en: 'Some structure but jumps around; figures scattered and searched for.' },
        { vi: 'Đủ phần theo PASTOR, số liệu chính có sẵn; vài chỗ chuyển vai còn vấp.', en: 'All PASTOR parts present, key figures ready; a few rough handovers.' },
        { vi: 'Mạch lạc, đúng giờ từng vai, số liệu nằm đúng chỗ cần.', en: 'Coherent, each role on time, figures exactly where needed.' },
        { vi: 'Chặt chẽ như đã tập nhiều lần: mỗi luận điểm có số liệu đi kèm, chuyển vai trơn tru, dự phòng sẵn câu hỏi khó.', en: 'Tight, clearly rehearsed: every claim backed by a figure, seamless handovers, hard questions anticipated.' }) },
    { id: 'nhiet_huyet', nguon: 'Chen, Yao & Kotha (2009)',
      vi: 'Nhiệt huyết thể hiện', en: 'Displayed passion',
      hoi: { vi: 'Giọng nói, ánh mắt, cử chỉ cho thấy đội tin vào dự án đến mức nào?', en: 'How much do voice, eye contact and gestures show the team believes in the venture?' },
      neo: neo(
        { vi: 'Đều đều, tránh nhìn người nghe, như đọc bài hộ.', en: 'Monotone, avoids the audience, as if reading for someone else.' },
        { vi: 'Thỉnh thoảng có hứng, phần lớn còn rụt rè.', en: 'Occasional energy, mostly hesitant.' },
        { vi: 'Tự tin vừa phải, giọng có điểm nhấn ở phần chính.', en: 'Moderately confident, voice stresses the main points.' },
        { vi: 'Hào hứng rõ, nhìn người nghe, cử chỉ hợp lời.', en: 'Clearly enthusiastic, eye contact, gestures match words.' },
        { vi: 'Cuốn hút từ đầu đến cuối; cả đội cùng một năng lượng, người nghe muốn nghe tiếp.', en: 'Compelling throughout; the whole team shares the energy, listeners want more.' }) },
    { id: 'tai_chinh', nguon: 'đặc tả 010 (ba con số)',
      vi: 'Logic tài chính', en: 'Financial logic',
      hoi: { vi: 'Vốn xin, điểm hòa vốn, lợi nhuận mục tiêu có khớp nhau và có cơ sở?', en: 'Do the funding ask, break-even and target profit fit together and rest on evidence?' },
      neo: neo(
        { vi: 'Không nêu được ba con số, hoặc các số mâu thuẫn nhau.', en: 'Cannot state the three numbers, or they contradict each other.' },
        { vi: 'Nêu số nhưng không giải thích được cách tính.', en: 'States numbers but cannot explain how they were calculated.' },
        { vi: 'Ba con số khớp nhau, giả định chính có nêu nhưng còn lạc quan.', en: 'The three numbers fit, key assumptions stated but optimistic.' },
        { vi: 'Số khớp, giả định có dẫn nguồn (giá, chi phí, sản lượng), vốn xin đủ đến điểm hòa vốn.', en: 'Numbers fit, assumptions sourced (price, cost, volume), the ask covers the months to break-even.' },
        { vi: 'Như mức 4, thêm kịch bản xấu: nói được nếu doanh số thấp hơn 20 % thì cần thêm bao nhiêu và trong bao lâu.', en: 'As level 4, plus a downside case: can say how much more is needed, and for how long, if sales are 20 % lower.' }) },
    { id: 'van_de_giai_phap', nguon: 'Clingingsmith & Shane (2018)',
      vi: 'Vấn đề và giải pháp rõ', en: 'Clear problem and solution',
      hoi: { vi: 'Khách hàng là ai, vấn đề có thật không, giải pháp của đội khác gì cách đang có?', en: 'Who is the customer, is the problem real, how does the solution differ from current options?' },
      neo: neo(
        { vi: 'Không rõ bán cho ai, vấn đề do đội tự nghĩ ra.', en: 'Unclear who buys; the problem is assumed by the team.' },
        { vi: 'Có nhóm khách hàng nhưng quá rộng; giải pháp giống đối thủ.', en: 'A customer group, but too broad; solution similar to rivals.' },
        { vi: 'Khách hàng và vấn đề rõ; điểm khác biệt có nêu nhưng chưa có bằng chứng.', en: 'Clear customer and problem; difference stated without evidence.' },
        { vi: 'Có bằng chứng vấn đề (phỏng vấn, số liệu thị trường) và lý do khách sẽ đổi sang.', en: 'Evidence of the problem (interviews, market data) and a reason customers would switch.' },
        { vi: 'Như mức 4, thêm dấu hiệu lực kéo thật: đơn đặt thử, khách quay lại, đối tác cam kết.', en: 'As level 4, plus real traction: trial orders, repeat customers, committed partners.' }) },
    { id: 'doi_ngu', nguon: 'kịch bản Đại hội Cổ đông',
      vi: 'Đội ngũ đáng tin', en: 'Credible team',
      hoi: { vi: 'Đội có đủ người, đủ kỹ năng để làm được điều vừa hứa không?', en: 'Does the team have the people and skills to deliver what it just promised?' },
      neo: neo(
        { vi: 'Không rõ ai làm gì; một người nói hết.', en: 'Unclear who does what; one person does all the talking.' },
        { vi: 'Có phân vai trên giấy nhưng các vai không trả lời được phần của mình.', en: 'Roles on paper, but members cannot answer for their own part.' },
        { vi: 'Mỗi vai nói được phần mình; còn thiếu một kỹ năng quan trọng mà đội chưa nhận ra.', en: 'Each role covers its part; one key skill missing and not acknowledged.' },
        { vi: 'Vai rõ, mỗi người có lý do vì sao hợp vai; đội nói được chỗ còn thiếu và cách bù.', en: 'Clear roles, each person fits for a reason; the team names its gaps and how it will fill them.' },
        { vi: 'Như mức 4, các vai bổ sung nhau khi trả lời; người nghe tin đội này làm được.', en: 'As level 4, members back each other up in Q&A; listeners trust this team to deliver.' }) },
    { id: 'tra_loi', nguon: 'Clingingsmith & Shane (2018)',
      vi: 'Cách trả lời câu hỏi', en: 'Handling questions',
      hoi: { vi: 'Đội trả lời đúng trọng tâm, có số liệu, thừa nhận chỗ chưa biết?', en: 'Does the team answer to the point, with figures, and admit what it does not know?' },
      neo: neo(
        { vi: 'Né câu hỏi, lạc đề hoặc im lặng.', en: 'Dodges, goes off-topic or stays silent.' },
        { vi: 'Trả lời chung chung, không có số liệu.', en: 'Generic answers without figures.' },
        { vi: 'Đúng trọng tâm phần lớn câu; vài câu còn vòng vo.', en: 'Most answers on point; a few roundabout.' },
        { vi: 'Ngắn gọn, có số liệu, đúng người đúng vai trả lời.', en: 'Concise, with figures, answered by the right role.' },
        { vi: 'Như mức 4, thẳng thắn nhận chỗ chưa biết và nói cách sẽ kiểm chứng.', en: 'As level 4, openly admits unknowns and says how they will be tested.' }) },
  ];
  const Y_DINH = { id: 'y_dinh', nguon: 'Huang & Pearce (2015)',
    vi: 'Ý định đầu tư', en: 'Intention to invest',
    hoi: { vi: 'Nếu đây là tiền thật của bạn, bạn muốn đầu tư vào đội này đến mức nào?', en: 'If this were your own money, how much would you want to invest in this team?' },
    neo: neo({ vi: 'Chắc chắn không', en: 'Definitely not' }, { vi: 'Có lẽ không', en: 'Probably not' }, { vi: 'Phân vân', en: 'Unsure' }, { vi: 'Có lẽ có', en: 'Probably yes' }, { vi: 'Chắc chắn có', en: 'Definitely yes' }) };

  const co = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const maHopLe = x => typeof x === 'string' && x.length <= 40 && /^[A-Za-z0-9_-]+$/.test(x) && x !== '__proto__';
  const sao = s => JSON.parse(JSON.stringify(s));
  const diem15 = v => Number.isInteger(v) && v >= 1 && v <= 5;

  /** Sổ chấm: giảng viên chấm (gv) và các vòng chấm theo đội. */
  function taoSoCham() { return { gv: {}, vong: {} }; }

  /** Giảng viên vào chấm từ máy riêng (?gv=1); chờ màn chiếu duyệt như quỹ. */
  function gvXin(s0, id, ten) {
    const s = sao(s0), t = String(ten || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (!maHopLe(id) || !t) return { s, ok: false, ly: 'thieu-ten' };
    if (co(s.gv, id)) return { s, ok: true, ly: 'da-co' };
    if (Object.keys(s.gv).length >= 5) return { s, ok: false, ly: 'day' };
    s.gv[id] = { id, ten: t, trangThai: 'cho' }; return { s, ok: true };
  }
  function gvDuyet(s0, id) { const s = sao(s0); if (!co(s.gv, id)) return { s, ok: false }; s.gv[id].trangThai = 'duyet'; return { s, ok: true }; }
  function gvTuChoi(s0, id) { const s = sao(s0); if (!co(s.gv, id) || s.gv[id].trangThai !== 'cho') return { s, ok: false }; delete s.gv[id]; return { s, ok: true }; }

  /** Người phải chấm đội `doi`: các quỹ đã duyệt trừ chính đội, cùng giảng viên đã duyệt. `so` là sổ góp vốn của PitchLop. */
  function nguoiCan(s, so, doi) {
    const ban = (so.thuTu || []).filter(id => id !== doi && so.quy[id] && so.quy[id].trangThai === 'duyet');
    const gv = Object.keys(s.gv).filter(id => s.gv[id].trangThai === 'duyet');
    return { ban, gv, tat: ban.concat(gv) };
  }

  /** Một phiếu chấm. tin = { nguoi, doi, diem: [6 số 1–5], yDinh: 1–5 }. Mỗi người một phiếu cho một đội; gửi lại không đổi phiếu. */
  function nop(s0, so, tin, now) {
    const s = sao(s0), nguoi = tin && tin.nguoi, doi = tin && tin.doi;
    if (!maHopLe(nguoi) || !maHopLe(doi)) return { s, ok: false, ly: 'thieu-ma' };
    if (!so.quy[doi] || so.quy[doi].trangThai !== 'duyet') return { s, ok: false, ly: 'doi-la' };
    const can = nguoiCan(s, so, doi);
    if (nguoi === doi) return { s, ok: false, ly: 'cua-minh' };
    if (!can.tat.includes(nguoi)) return { s, ok: false, ly: 'khong-cham' };
    const d = Array.isArray(tin.diem) ? tin.diem.map(Number) : [];
    if (d.length !== TIEU_CHI.length || !d.every(diem15) || !diem15(Number(tin.yDinh))) return { s, ok: false, ly: 'sai-diem' };
    if (!co(s.vong, doi)) s.vong[doi] = { phieu: {}, mo: false };
    const v = s.vong[doi];
    if (co(v.phieu, nguoi)) return { s, ok: true, ly: 'trung' };
    v.phieu[nguoi] = { vai: can.gv.includes(nguoi) ? 'gv' : 'ban', diem: d, yDinh: Number(tin.yDinh), luc: now };
    return { s, ok: true };
  }

  /** Giảng viên mở điểm sớm (chưa đủ người nộp). */
  function moDiem(s0, doi) { const s = sao(s0); if (!co(s.vong, doi)) s.vong[doi] = { phieu: {}, mo: false }; s.vong[doi].mo = true; return { s, ok: true }; }

  const tb = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  /** Tóm tắt một vòng. Chưa mở thì KHÔNG có điểm (chấm mù), chỉ có số người đã nộp và ai đã nộp (để máy họ thôi gửi lại). */
  function tomTat(s, so, doi) {
    const can = nguoiCan(s, so, doi), v = co(s.vong, doi) ? s.vong[doi] : { phieu: {}, mo: false };
    const daNop = Object.keys(v.phieu), soCan = can.tat.length;
    const mo = v.mo || (soCan > 0 && can.tat.every(id => co(v.phieu, id)));
    const kq = { doi, soNop: daNop.length, soCan, mo, daNop };
    if (mo) {
      const ph = Object.values(v.phieu), nhom = vai => ph.filter(p => p.vai === vai);
      const tbTC = ds => TIEU_CHI.map((_, i) => tb(ds.map(p => p.diem[i])));
      kq.tb = tbTC(ph); kq.tbGv = tbTC(nhom('gv')); kq.tbBan = tbTC(nhom('ban')); kq.yDinh = tb(ph.map(p => p.yDinh));
    }
    return kq;
  }

  const COT_CSV = ['ma_buoi', 'doi', 'nguoi_cham', 'vai', 'tieu_chi', 'diem', 'thoi_diem'];
  function oCsv(v) { let x = v == null ? '' : String(v); if (/^[=+\-@\t\r]/.test(x)) x = "'" + x; return /[",\r\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; }
  /** CSV dạng dài: một dòng cho một người chấm, một tiêu chí (cả y_dinh). Người chấm ghi bằng tên đội hoặc «gv-1», «gv-2», không tên thật. */
  function taoCsv(s, so) {
    const tenDoi = id => (so.quy[id] ? so.quy[id].ten : id);
    const gvSo = {}; Object.keys(s.gv).forEach((id, i) => { gvSo[id] = 'gv-' + (i + 1); });
    const dong = [];
    Object.keys(s.vong).forEach(doi => Object.keys(s.vong[doi].phieu).forEach(nguoi => {
      const p = s.vong[doi].phieu[nguoi], ten = p.vai === 'gv' ? (gvSo[nguoi] || 'gv') : tenDoi(nguoi), luc = p.luc ? new Date(p.luc).toISOString() : '';
      TIEU_CHI.forEach((tc, i) => dong.push([so.phong, tenDoi(doi), ten, p.vai, tc.id, p.diem[i], luc]));
      dong.push([so.phong, tenDoi(doi), ten, p.vai, Y_DINH.id, p.yDinh, luc]);
    }));
    return '﻿' + [COT_CSV.join(',')].concat(dong.map(r => r.map(oCsv).join(','))).join('\r\n') + '\r\n';
  }

  const R = { TIEU_CHI, Y_DINH, COT_CSV, taoSoCham, gvXin, gvDuyet, gvTuChoi, nguoiCan, nop, moDiem, tomTat, taoCsv };
  if (typeof module === 'object' && module.exports) module.exports = R;
  else root.PitchRubric = R;
})(typeof self !== 'undefined' ? self : this);
