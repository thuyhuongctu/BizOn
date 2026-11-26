/* BizOn – Phòng pitch, màn chiếu «Hội đồng nhà đầu tư cả lớp» (đặc tả specs/012-pitch-nang-cap, PR 1).
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Bật bằng nút «Chế độ lớp» hoặc ?hoidong=1 (&p=MÃ để giữ mã phòng, &kenh=local để chạy trên một máy, không mạng).
 * Màn chiếu đầu tiên mở phòng là chủ phòng: giữ sổ góp vốn (pitch-goi-von-lop.js), phát bản tin mỗi giây.
 * Máy mở sau cùng mã phòng nghe thấy nhịp của chủ phòng thì chỉ xem. Sổ lưu trong sessionStorage của tab để tải lại không mất. */
(function () {
  'use strict';
  const P = window.PitchLop, RB = window.PitchRubric; if (!P || !RB) return;
  const $ = id => document.getElementById(id);
  const qs = new URLSearchParams(location.search);
  const CHO_CHU_MS = 2500, NHIP_MS = 1000;

  const T = {
    vi: {
      cheDoLop: '👥 Chế độ lớp', roiLop: 'Rời chế độ lớp', lopTieuDe: 'Hội đồng nhà đầu tư cả lớp', maPhong: 'Mã phòng',
      lopGoiY: 'Mỗi đội là một quỹ 1 tỷ đồng. Mở trang quỹ trên điện thoại bằng mã QR hoặc gõ đường dẫn, nhập tên đội, chờ giảng viên duyệt.',
      quyTieuDe: 'Các quỹ trong phòng', chuaCoQuy: 'Chưa có quỹ nào vào phòng.', duyet: 'Duyệt', tuChoi: 'Từ chối', choDuyet: 'chờ duyệt', daDuyet: 'đã duyệt', conVon: 'còn',
      rotTieuDe: 'Rót vốn', doiPitch: 'Đội đang pitch', mucTieu: 'Vốn đội xin (triệu đồng)', moRot: 'Mở rót vốn 60 giây', dongRot: 'Đóng sớm',
      chuaMo: 'Chưa mở cửa sổ rót vốn.', dangMo: 'Đang nhận rót vốn', daDong: 'Cửa sổ đã đóng', goiDuoc: 'Gọi được', soQuy: 'Số quỹ đã rót', conLai: 'Còn lại', cuaMucTieu: 'của vốn xin',
      xhTieuDe: 'Bảng xếp hạng gọi vốn', cotHang: 'Hạng', cotDoi: 'Đội', cotTong: 'Gọi được', cotSoQuy: 'Số quỹ', chuaCoXh: 'Chưa có đội nào gọi vốn.', xuatCsv: 'Xuất CSV của buổi',
      vaiChu: 'Màn chiếu chính: màn này giữ sổ góp vốn. Đừng đóng tab trước khi xuất CSV.', vaiXem: 'Màn này chỉ xem: một màn chiếu khác đang giữ phòng này.', vaiCho: 'Đang vào phòng…',
      knLocal: 'Kênh trên máy này (thử nghiệm, không qua mạng).', knOnline: 'Đã kết nối phòng trực tuyến.', knMat: 'Mất kết nối, đang nối lại…', knKhong: 'Không kết nối được máy chủ: phòng chỉ chạy trên máy này.',
      chuVang: 'Chưa nghe thấy màn chiếu chính trong vài giây.', boTin: n => n + ' lượt rót bị bỏ vì sai luật (xem trong CSV).',
      chanLop: 'Chế độ lớp: trang gửi qua mạng (Supabase Realtime) chỉ mã phòng, tên đội do lớp đặt, số vốn rót và thời điểm. Máy chủ chỉ chuyển tin, không lưu; màn chiếu giữ sổ góp vốn và xuất CSV. Không dùng AI, không ghi âm, không ghi hình.',
      qrAlt: ma => 'Mã QR mở trang quỹ của phòng ' + ma,
      gvCham: 'giảng viên chấm', chamTieuDe: 'Chấm điểm nghiên cứu (chấm mù)', chamGoiY: 'Song song với điểm lớp 4 × 2,5. Các quỹ và giảng viên chấm 6 tiêu chí trên máy riêng; không ai thấy điểm của người khác trước khi mọi người nộp xong. Giảng viên mở trang chấm bằng đường dẫn có thêm &gv=1.',
      chamChua: 'Mở rót vốn cho một đội thì vòng chấm của đội đó bắt đầu.', chamTien: (ten, a, b) => 'Đội ' + ten + ': đã nộp ' + a + '/' + b + ' phiếu. Điểm còn ẩn cho tới khi đủ phiếu.', chamMo: (ten, a) => 'Đội ' + ten + ': điểm đã mở (' + a + ' phiếu).',
      moDiem: 'Mở điểm sớm', xuatCham: 'Xuất CSV chấm điểm', cotTieuChi: 'Tiêu chí', cotCaLop: 'Cả lớp', cotGv: 'Giảng viên', cotBan: 'Bạn học',
    },
    en: {
      cheDoLop: '👥 Class mode', roiLop: 'Leave class mode', lopTieuDe: 'Whole-class investor board', maPhong: 'Room code',
      lopGoiY: 'Each team is a fund with 1 billion VND. Open the fund page on a phone with the QR code or the link, enter the team name and wait for the instructor to approve.',
      quyTieuDe: 'Funds in the room', chuaCoQuy: 'No fund has joined yet.', duyet: 'Approve', tuChoi: 'Reject', choDuyet: 'waiting', daDuyet: 'approved', conVon: 'left',
      rotTieuDe: 'Investment window', doiPitch: 'Team pitching', mucTieu: 'Funding ask (million VND)', moRot: 'Open a 60-second window', dongRot: 'Close early',
      chuaMo: 'No investment window open yet.', dangMo: 'Taking investments', daDong: 'Window closed', goiDuoc: 'Raised', soQuy: 'Funds invested', conLai: 'Time left', cuaMucTieu: 'of the ask',
      xhTieuDe: 'Funding leaderboard', cotHang: 'Rank', cotDoi: 'Team', cotTong: 'Raised', cotSoQuy: 'Funds', chuaCoXh: 'No team has raised funds yet.', xuatCsv: 'Export session CSV',
      vaiChu: 'Main screen: this screen keeps the investment ledger. Do not close the tab before exporting the CSV.', vaiXem: 'View only: another screen is running this room.', vaiCho: 'Joining the room…',
      knLocal: 'Channel on this device (test mode, no network).', knOnline: 'Connected to the online room.', knMat: 'Connection lost, reconnecting…', knKhong: 'Could not reach the server: the room runs on this device only.',
      chuVang: 'The main screen has not been heard for a few seconds.', boTin: n => n + ' investments rejected for breaking the rules (see the CSV).',
      chanLop: 'Class mode: the page sends over the network (Supabase Realtime) only the room code, team names chosen by the class, amounts invested and times. The server only relays messages and stores nothing; the main screen keeps the ledger and exports a CSV. No AI, no audio or video recording.',
      qrAlt: ma => 'QR code to open the fund page for room ' + ma,
      gvCham: 'instructor rater', chamTieuDe: 'Research scoring (blind)', chamGoiY: 'Runs alongside the 4 × 2.5 class score. Funds and instructors rate 6 criteria on their own devices; nobody sees anyone else\'s scores until everyone has submitted. Instructors open the rating page with &gv=1 added to the link.',
      chamChua: 'Opening an investment window for a team starts that team\'s scoring round.', chamTien: (ten, a, b) => 'Team ' + ten + ': ' + a + '/' + b + ' score sheets in. Scores stay hidden until all are in.', chamMo: (ten, a) => 'Team ' + ten + ': scores revealed (' + a + ' sheets).',
      moDiem: 'Reveal scores now', xuatCham: 'Export scoring CSV', cotTieuChi: 'Criterion', cotCaLop: 'Whole class', cotGv: 'Instructor', cotBan: 'Peers',
    },
  };
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'vi');
  const t = k => T[lang()][k];
  const tien = v => P.dinhTien(v, lang());
  const mmss = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const ngauNhien = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

  let phong = null, kenh = null, vai = 'cho', st = null, sc = null, chamXem = null, tu = 0, myId = '', ban = null, lechGio = 0, nghe = 0, henChu = null, nhip = null, hen = null, ketNoi = '';
  const khoa = () => 'bizon-pitch-lop-' + phong;

  function luu() { try { sessionStorage.setItem(khoa(), JSON.stringify({ st, sc, tu, id: myId })); } catch (e) {} }
  function docLuu(p) { try { const o = JSON.parse(sessionStorage.getItem('bizon-pitch-lop-' + p) || 'null'); return o && o.st && o.st.phong === p ? o : null; } catch (e) { return null; } }

  function dichChu() {
    document.querySelectorAll('[data-kl]').forEach(el => { const v = T[lang()][el.dataset.kl]; if (typeof v === 'string') el.textContent = v; });
    if (phong) { const img = document.querySelector('#lop-qr img'); if (img) img.alt = t('qrAlt')(phong); }
  }

  // Bản tin đang hiển thị: chủ phòng dựng từ sổ của mình; màn xem dùng bản tin nhận được.
  const banHien = () => (vai === 'chu' ? P.banTin(st, Date.now()) : ban);
  const gioChu = () => Date.now() - (vai === 'chu' ? 0 : lechGio);

  function ve() {
    if (!phong) return;
    $('lop-vai').textContent = vai === 'chu' ? t('vaiChu') : vai === 'xem' ? t('vaiXem') : t('vaiCho');
    $('lop-ket-noi').textContent = ketNoi ? t(ketNoi) : '';
    $('lop-dieu-khien').hidden = vai !== 'chu';
    $('nut-lop-csv').hidden = vai !== 'chu'; $('nut-cham-csv').hidden = vai !== 'chu';
    const bt = banHien(), s = P.tuBanTin(bt);
    // Danh sách quỹ
    const ds = $('lop-ds-quy'); ds.innerHTML = '';
    if (!s.thuTu.length) { const li = document.createElement('li'); li.className = 'goi-y'; li.textContent = t('chuaCoQuy'); ds.appendChild(li); }
    s.thuTu.forEach(id => {
      const x = s.quy[id], li = document.createElement('li'), ten = document.createElement('b'), tt = document.createElement('span');
      ten.textContent = x.ten; tt.className = 'chip'; tt.textContent = x.trangThai === 'duyet' ? t('daDuyet') + ' · ' + t('conVon') + ' ' + tien(P.vonCon(s, id)) : t('choDuyet');
      li.appendChild(ten); li.appendChild(tt);
      if (vai === 'chu' && x.trangThai === 'cho') {
        const ok = document.createElement('button'), no = document.createElement('button');
        ok.type = no.type = 'button'; ok.className = 'btn phu'; no.className = 'btn';
        ok.textContent = t('duyet'); no.textContent = t('tuChoi'); ok.dataset.duyet = id; no.dataset.tuChoi = id;
        li.appendChild(ok); li.appendChild(no);
      }
      ds.appendChild(li);
    });
    // Giảng viên chấm (vào bằng &gv=1)
    const gvDs = vai === 'chu' ? Object.values(sc.gv) : (chamXem ? chamXem.gv : []);
    gvDs.forEach(g => {
      const li = document.createElement('li'), ten = document.createElement('b'), tt = document.createElement('span');
      ten.textContent = g.ten; tt.className = 'chip'; tt.textContent = t('gvCham') + ' · ' + (g.trangThai === 'duyet' ? t('daDuyet') : t('choDuyet'));
      li.appendChild(ten); li.appendChild(tt);
      if (vai === 'chu' && g.trangThai === 'cho') {
        const ok = document.createElement('button'), no = document.createElement('button');
        ok.type = no.type = 'button'; ok.className = 'btn phu'; no.className = 'btn';
        ok.textContent = t('duyet'); no.textContent = t('tuChoi'); ok.dataset.duyetGv = g.id; no.dataset.tuChoiGv = g.id;
        li.appendChild(ok); li.appendChild(no);
      }
      ds.appendChild(li);
    });
    if (gvDs.length && ds.firstChild && ds.firstChild.className === 'goi-y') ds.removeChild(ds.firstChild);
    // Chọn đội (giữ lựa chọn cũ)
    if (vai === 'chu') {
      const se = $('lop-doi'), cu = se.value; se.innerHTML = '';
      s.thuTu.filter(id => s.quy[id].trangThai === 'duyet').forEach(id => { const o = document.createElement('option'); o.value = id; o.textContent = s.quy[id].ten; se.appendChild(o); });
      if (cu && s.quy[cu]) se.value = cu;
      $('nut-mo-rot').disabled = !se.options.length;
    }
    veBang(bt, s);
    // Bảng xếp hạng
    const tb = $('lop-xep-hang').querySelector('tbody'); tb.innerHTML = '';
    const xh = P.xepHang(s);
    xh.forEach((x, i) => { const tr = document.createElement('tr'); [String(i + 1), x.ten, tien(x.tong), String(x.soQuy)].forEach((v, j) => { const c = document.createElement(j === 1 ? 'th' : 'td'); if (j === 1) c.scope = 'row'; c.textContent = v; tr.appendChild(c); }); tb.appendChild(tr); });
    $('lop-xh-trong').hidden = xh.length > 0;
    const soBo = vai === 'chu' ? st.bo.length : 0;
    $('lop-bo').textContent = soBo ? t('boTin')(soBo) : '';
    veCham(s);
  }

  // Bản tin chấm: chỉ có số phiếu và ai đã nộp; điểm trung bình chỉ có khi vòng đã mở (chấm mù).
  function chamTin() {
    const dp = st.dangPitch, daCham = [];
    Object.keys(sc.vong).forEach(d => Object.keys(sc.vong[d].phieu).forEach(n => daCham.push([n, d])));
    return { gv: Object.values(sc.gv).map(g => ({ id: g.id, ten: g.ten, trangThai: g.trangThai })), tt: dp ? RB.tomTat(sc, st, dp.doi) : null, daCham };
  }
  const so2 = v => (v == null ? '–' : (Math.round(v * 100) / 100).toFixed(2).replace('.', lang() === 'vi' ? ',' : '.'));
  function veCham(s) {
    const c = vai === 'chu' ? chamTin() : chamXem, tt = c && c.tt;
    const ten = tt && s.quy[tt.doi] ? s.quy[tt.doi].ten : '';
    $('lop-cham-tien').textContent = !tt ? t('chamChua') : tt.mo ? t('chamMo')(ten, tt.soNop) : t('chamTien')(ten, tt.soNop, tt.soCan);
    $('nut-mo-diem').hidden = !(vai === 'chu' && tt && !tt.mo);
    const coBang = !!(tt && tt.mo && tt.tb);
    $('lop-cham-bang').hidden = !coBang;
    if (!coBang) return;
    const tb = $('lop-cham-bang').querySelector('tbody'); tb.innerHTML = '';
    RB.TIEU_CHI.concat([RB.Y_DINH]).forEach((tc, i) => {
      const tr = document.createElement('tr'), th = document.createElement('th'); th.scope = 'row'; th.textContent = tc[lang()]; tr.appendChild(th);
      const hang = i < RB.TIEU_CHI.length ? [tt.tb[i], tt.tbGv[i], tt.tbBan[i]] : [tt.yDinh, null, null];
      hang.forEach(v => { const td = document.createElement('td'); td.className = 'num'; td.textContent = so2(v); tr.appendChild(td); });
      tb.appendChild(tr);
    });
  }

  // Bảng trực tiếp: phần đổi theo giây, vẽ riêng cho nhẹ.
  function veBang(bt, s) {
    bt = bt || banHien(); s = s || P.tuBanTin(bt);
    const dp = bt && bt.dangPitch;
    $('lop-bang').hidden = !dp; $('lop-chua-mo').hidden = !!dp;
    $('nut-dong-rot').disabled = !(dp && gioChu() <= dp.hetHan);
    if (!dp) return;
    const tg = P.tongDoi(s, dp.doi), con = (dp.hetHan - gioChu()) / 1000, mo = con > 0;
    $('lop-ten-doi').textContent = s.quy[dp.doi] ? s.quy[dp.doi].ten : '';
    $('lop-trang-thai').textContent = mo ? t('dangMo') : t('daDong');
    $('lop-tong').textContent = tien(tg.tong);
    $('lop-so-quy').textContent = String(tg.soQuy);
    $('lop-dem').textContent = mo ? mmss(con) : '0:00';
    const muc = dp.mucTieu || 0, pt = muc ? Math.min(100, Math.round(tg.tong / muc * 100)) : 0;
    $('lop-tien-do').hidden = !muc; $('lop-tien-do-day').style.width = pt + '%';
    $('lop-phan-tram').textContent = muc ? pt + ' % ' + t('cuaMucTieu') + ' ' + tien(muc) : '';
    $('the-lop-bang').classList.toggle('dang-mo', mo);
  }

  // Phát bản tin (gom nhiều thay đổi trong 200 ms thành một tin).
  function phatNgay() { if (vai !== 'chu' || !kenh) return; kenh.gui('ban', { chu: myId, tu, ban: P.banTin(st, Date.now()), cham: chamTin() }); }
  function henPhat() { if (hen) return; hen = setTimeout(() => { hen = null; phatNgay(); }, 200); }
  function doi(r) { st = r.st; luu(); ve(); henPhat(); }
  function doiCham(r) { sc = r.s; luu(); ve(); henPhat(); }

  function lamChu() {
    if (vai === 'xem') return;
    vai = 'chu'; clearInterval(nhip); nhip = setInterval(phatNgay, NHIP_MS); phatNgay(); ve();
  }
  function lamXem() { vai = 'xem'; clearInterval(nhip); clearTimeout(henChu); ve(); }

  function onTin(loai, du) {
    if (!du || typeof du !== 'object') return;
    if (loai === 'ban' && du.chu && du.chu !== myId) {
      const hoThang = du.tu < tu || (du.tu === tu && String(du.chu) < myId);
      if (vai !== 'xem' && hoThang) lamXem();
      if (vai === 'xem' && du.ban && du.ban.phong === phong) { ban = du.ban; chamXem = du.cham || null; lechGio = Date.now() - du.ban.luc; nghe = Date.now(); ve(); }
      return;
    }
    if (vai !== 'chu') return;
    if (loai === 'hoi') { henPhat(); return; }
    if (loai === 'xin') { doi(P.xinVao(st, String(du.quy || ''), du.ten, new Date().toISOString())); return; }
    if (loai === 'rot') { doi(P.rot(st, { ma: du.ma, quy: du.quy, doi: du.doi, so: du.so }, Date.now())); return; }
    if (loai === 'gv-xin') { doiCham(RB.gvXin(sc, String(du.id || ''), du.ten)); return; }
    if (loai === 'cham') { doiCham(RB.nop(sc, st, { nguoi: du.nguoi, doi: du.doi, diem: du.diem, yDinh: du.yDinh }, Date.now())); }
  }

  function veQr() {
    const url = new URL('pitch-quy.html?p=' + phong + (kenh && kenh.kieu === 'local' ? '&kenh=local' : ''), location.href);
    const a = $('lop-link'); a.href = url.href; a.textContent = url.host + url.pathname.replace(/\/[^/]*$/, '/') + 'pitch-quy.html';
    const box = $('lop-qr'); box.innerHTML = '';
    if (typeof window.qrcode !== 'function') return;
    try { const q = window.qrcode(0, 'M'); q.addData(url.href); q.make(); const img = document.createElement('img'); img.src = q.createDataURL(6, 8); img.alt = t('qrAlt')(phong); img.width = img.height = 196; box.appendChild(img); } catch (e) {}
  }

  async function vao(maMuon) {
    if (phong) return;
    phong = P.maPhongHopLe(maMuon) ? maMuon : P.maPhongMoi();
    const cu = docLuu(phong);
    st = cu ? cu.st : P.taoPhong(phong); sc = cu && cu.sc ? cu.sc : RB.taoSoCham(); tu = cu ? cu.tu : Date.now(); myId = cu ? cu.id : 'chieu-' + ngauNhien(); luu();
    const u = new URL(location.href); u.searchParams.set('hoidong', '1'); u.searchParams.set('p', phong);
    try { history.replaceState(null, '', u.href); } catch (e) {}
    $('man-lop').hidden = false; $('chan-lop').hidden = false; $('chan-mot-may').hidden = true; $('nut-che-do-lop').hidden = true;
    $('lop-ma').textContent = phong;
    vai = 'cho'; ve();
    const muon = qs.get('kenh') === 'local' ? 'local' : 'realtime';
    const moKenh = kieu => P.taoKenh({ kieu, phong, id: myId, vai: 'chieu', onTin, onTrangThai: s => { ketNoi = s === 'da-vao' ? 'knOnline' : s === 'mat-ket-noi' ? 'knMat' : ketNoi; ve(); } });
    try { kenh = await moKenh(muon); if (kenh.kieu === 'local') ketNoi = muon === 'local' ? 'knLocal' : 'knKhong'; }
    catch (e) { kenh = await moKenh('local'); ketNoi = 'knKhong'; }
    veQr(); dichChu(); ve();
    kenh.gui('hoi', { id: myId });
    henChu = setTimeout(lamChu, CHO_CHU_MS);
    setTimeout(() => $('man-lop').scrollIntoView({ block: 'start' }), 50);
  }

  function roi() {
    if (kenh) try { kenh.dong(); } catch (e) {}
    const u = new URL(location.href); u.searchParams.delete('hoidong'); u.searchParams.delete('p'); u.searchParams.delete('kenh');
    location.href = u.href;
  }

  function xuatCsv() {
    if (vai !== 'chu') return;
    const blob = new Blob([P.taoCsv(st)], { type: 'text/csv;charset=utf-8' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'pitch-lop-' + phong + '-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  $('nut-che-do-lop').addEventListener('click', () => vao(null));
  $('nut-roi-lop').addEventListener('click', roi);
  $('nut-lop-csv').addEventListener('click', xuatCsv);
  $('nut-cham-csv').addEventListener('click', () => {
    if (vai !== 'chu') return;
    const blob = new Blob([RB.taoCsv(sc, st)], { type: 'text/csv;charset=utf-8' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'pitch-cham-' + phong + '-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });
  $('nut-mo-diem').addEventListener('click', () => { if (vai === 'chu' && st.dangPitch) doiCham(RB.moDiem(sc, st.dangPitch.doi)); });
  $('lop-ds-quy').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || vai !== 'chu') return;
    if (b.dataset.duyet) doi(P.duyet(st, b.dataset.duyet));
    else if (b.dataset.tuChoi) doi(P.tuChoi(st, b.dataset.tuChoi));
    else if (b.dataset.duyetGv) doiCham(RB.gvDuyet(sc, b.dataset.duyetGv));
    else if (b.dataset.tuChoiGv) doiCham(RB.gvTuChoi(sc, b.dataset.tuChoiGv));
  });
  $('nut-mo-rot').addEventListener('click', () => {
    const doiId = $('lop-doi').value, muc = Math.max(0, Number($('lop-muc-tieu').value) || 0) * 1e6;
    if (doiId) doi(P.moRot(st, doiId, muc, Date.now()));
  });
  $('nut-dong-rot').addEventListener('click', () => doi(P.dongRot(st, Date.now())));
  // Trang đổi ngôn ngữ trước (bộ xử lý của trang gắn trước), rồi dịch phần lớp.
  $('nut-lang').addEventListener('click', () => { dichChu(); ve(); });
  setInterval(() => {
    if (!phong) return;
    veBang();
    if (vai === 'xem' && nghe && Date.now() - nghe > 6000) $('lop-ket-noi').textContent = t('chuVang');
  }, 250);
  dichChu();
  if (qs.get('hoidong') === '1') vao((qs.get('p') || '').toUpperCase());

  window.__pitchLop = { vai: () => vai, st: () => (vai === 'chu' ? JSON.parse(JSON.stringify(st)) : P.tuBanTin(ban)), phong: () => phong, sc: () => (vai === 'chu' ? JSON.parse(JSON.stringify(sc)) : null), cham: () => (vai === 'chu' ? chamTin() : chamXem) };
})();
