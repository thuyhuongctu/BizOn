/* BizOn Bật Nghiệp · giao diện mới (bat-nghiep-v2.html) — bảng điểm dự kiến ở màn tổng kết 6 vòng.
 *
 * Không có công thức chấm riêng: dựng lại dữ liệu nộp bài từ S.history (đúng các trường js/backend.js gửi lên)
 * rồi gọi BizOnInstructorPage.grades() của Trang Giảng viên (js/bizon-grading.js). Điểm ở đây và ở tab
 * «Chấm điểm» của giảng viên vì thế tính bằng cùng một mã, theo «Thang Diem Bat Nghiep - Sinh Vien».
 *
 * Ba phần máy sinh viên không biết được thì để thành khoảng, ghi «chờ giảng viên»:
 *  - B5 đọc nhật ký từng thành viên (member_log) – chỉ giảng viên có;
 *  - mục «Chuẩn bị» 0,2 của B6 cũng đọc nhật ký ấy;
 *  - B1 xếp hạng lợi nhuận trong lớp – chỉ tính khi đọc được bảng xếp hạng lớp (≥ 3 đội khác).
 */
(function () {
  'use strict';
  const L = (vi, en) => (typeof T === 'function' ? T(vi, en) : vi);
  const en = () => (typeof currentLang === 'function' && currentLang() === 'en');
  const f1 = v => { const s = (Math.round((+v || 0) * 10 + 1e-7) / 10).toFixed(1); return en() ? s : s.replace('.', ','); };
  const e = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tkey = n => String(n == null ? '' : n).trim().replace(/\s+/g, ' ').toLowerCase();
  const MIN_OTHERS = 3;
  let board = { cls: '', rows: null, at: 0 };

  const classOf = s => String((s && s.profile && s.profile.classId) || '').trim();
  const isTrial = s => { const c = classOf(s); return !c || c === 'DEMO-2026'; };

  // Dữ liệu nộp bài như js/backend.js submitRound() gửi lên (result_json), từng vòng.
  function subsOf(s) {
    const ach = Array.isArray(s.achievements) ? s.achievements.length : null;
    return s.history.map(r => {
      const cq = (s.conquest || []).find(q => q.round === r.round);
      return { team_name: s.profile.teamName, round_number: r.round, created_at: '', student_email: (s.profile && s.profile.email) || '',
        result_json: { round: r.round, eventId: r.event && r.event.id, decisions: r.decisions, netProfit: r.netProfit, share: r.share,
          oee: r.oee, quickRatio: r.quickRatio, defect: r.defect, ach, win: cq ? !!cq.win : undefined } };
    });
  }

  // Các đội khác trong lớp (đã tới vòng 6), bỏ đội của chính mình và đội giảng viên chơi thử («GV …»).
  function othersOf(s, rows) {
    const me = tkey(s.profile.teamName);
    return (rows || []).filter(r => tkey(r.team_name) !== me && (+r.round || 0) >= 6 && !/^gv(\s|$)/i.test(String(r.team_name || '').trim()))
      .map(r => ({ name: String(r.team_name), rs: [], last: null, profit: +r.total_profit || 0, flags: 0, share: +r.last_share || 0, staff: false }));
  }

  function compute(s, rows) {
    const P = window.BizOnInstructorPage;
    if (!P || !s || !s.history || !s.history.length) return null;
    const mine = P.teams(subsOf(s))[0];
    const others = othersOf(s, rows), classKnown = others.length >= MIN_OTHERS;
    const g = P.grades(classKnown ? [mine].concat(others) : [mine], [], {}, []).find(x => x.name === mine.name);
    const b1 = classKnown ? [g.b1, g.b1] : [0.5, mine.profit < 0 ? 0.5 : 2];
    const sure = g.b2 + g.b3 + g.b4 + g.b6;           // g.b6 chưa gồm mục «Chuẩn bị» (không có nhật ký)
    const lo = sure + b1[0], hi = sure + b1[1] + 1.5 + 0.2;
    return { g, mine, others: others.length, classKnown, b1, lo, hi, Llo: P.letter(lo), Lhi: P.letter(hi) };
  }

  function rowsHtml(c) {
    const g = c.g, pend = L('chờ giảng viên', 'instructor sets');
    const rank = c.classKnown ? L(`tạm xếp theo ${c.others + 1} đội đã tới vòng 6`, `provisional rank among ${c.others + 1} teams at round 6`)
      : L('cần bảng xếp hạng lớp', 'needs the class leaderboard');
    const R = [
      ['B1', L('Lợi nhuận tích lũy (xếp hạng lớp)', 'Cumulative profit (class rank)'), `${f1(c.mine.profit)} ${L('triệu ₫', 'million ₫')} · ${rank}`,
        c.classKnown ? f1(g.b1) : `${f1(c.b1[0])}–${f1(c.b1[1])}`, 2, !c.classKnown],
      ['B2', L('Thị phần vòng 6', 'Round-6 market share'), `${f1(g.share)}%`, f1(g.b2), 2, false],
      ['B3', L('Vận hành và tài chính', 'Operations and finance'),
        `OEE ${g.oee == null ? '–' : f1(g.oee)} · ${L('lỗi', 'defects')} ${g.defect == null ? '–' : f1(g.defect) + '%'} · quick ratio ${g.qr == null ? '–' : f1(g.qr)}`, f1(g.b3), 2, false],
      ['B4', L('Thành tựu', 'Achievements'), `${g.ach == null ? 0 : g.ach} ${L('thành tựu', 'unlocked')}`, f1(g.b4), 1.5, false],
      ['B5', L('Đóng góp cá nhân', 'Individual contribution'), L('tính từ nhật ký từng thành viên', 'from each member\'s log'), `0–${f1(1.5)}`, 1.5, true],
      ['B6', L('Ứng phó biến cố', 'Handling shocks'),
        `${g.adv ? L(`có lãi ${g.advOk}/${g.adv} vòng bất lợi`, `profit in ${g.advOk}/${g.adv} adverse rounds`) : L('không có vòng bất lợi', 'no adverse round')} · ${L('«Chuẩn bị» +0,2', '«Prepared» +0.2')} ${pend}`,
        `${f1(g.b6)}–${f1(g.b6 + 0.2)}`, 1, true],
    ];
    return R.map(([k, name, what, pts, max, wait]) => `<tr><td><b>${k}</b> ${e(name)}<br><small class="bn2-muted">${e(what)}</small></td>
      <td>${pts} / ${f1(max)}${wait ? `<br><small class="bn2-muted">${pend}</small>` : ''}</td></tr>`).join('');
  }

  function inner(s) {
    const c = compute(s, board.cls === classOf(s) ? board.rows : null);
    if (!c) return '';
    const same = c.Llo.l === c.Lhi.l;
    const trial = isTrial(s)
      ? `<p class="bn2-flag lose" style="font-size:15px">${L('Ván chơi thử (không có Mã lớp thật): theo hướng dẫn chấm, ván này không tính điểm. Bảng dưới chỉ để tham khảo.', 'Trial game (no real class code): under the grading guide this game is not graded. The table below is for reference only.')}</p>` : '';
    return `<p class="bn2-eyebrow">${L('Bảng điểm dự kiến · thang 10', 'Provisional score sheet · out of 10')}</p>
      ${trial}
      <div class="bn2-grade-total"><b>${f1(c.lo)}–${f1(c.hi)}</b><span>/ 10 · ${same ? c.Llo.l : `${c.Llo.l} – ${c.Lhi.l}`}</span></div>
      <table class="bn2-table bn2-grade-tab"><thead><tr><th>${L('Tiêu chí', 'Criterion')}</th><th>${L('Điểm', 'Points')}</th></tr></thead><tbody>${rowsHtml(c)}</tbody></table>
      <p class="bn2-muted bn2-small" style="margin-top:10px">${L('Điểm tính bằng đúng mã của Trang Giảng viên. Khoảng điểm là vì B5, mục «Chuẩn bị» của B6 và (nếu chưa đủ dữ liệu lớp) B1 do giảng viên chốt. Điểm chính thức là điểm giảng viên công bố.', 'Scored with the same code as the Instructor page. The range exists because B5, the «Prepared» part of B6 and (until class data is available) B1 are set by the instructor. The official score is the one your instructor publishes.')}
      <a href="Thang%20Diem%20Bat%20Nghiep%20-%20Sinh%20Vien.dc.html">${L('Xem cách tính', 'How it is scored')}</a></p>`;
  }

  function html(s) {
    const body = inner(s);
    return body ? `<section class="bn2-card" id="bn2-grade" aria-live="polite" style="margin-top:16px">${body}</section>` : '';
  }

  // Đọc bảng xếp hạng lớp một lần mỗi 60 giây rồi vẽ lại riêng khung bảng điểm.
  function load(s) {
    const cls = classOf(s);
    if (isTrial(s) || !window.BizonBackend || typeof BizonBackend.classLeaderboard !== 'function') return;
    if (board.cls === cls && Date.now() - board.at < 60000) return;
    board = { cls, rows: board.cls === cls ? board.rows : null, at: Date.now() };
    BizonBackend.classLeaderboard(cls).then(rows => {
      if (!rows) return;
      board = { cls, rows, at: Date.now() };
      const el = document.getElementById('bn2-grade'); if (el) el.innerHTML = inner(s);
    }).catch(() => {});
  }

  window.BN2Grade = { html, load, compute };
})();
