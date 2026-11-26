/* BizOn – Phòng pitch, chế độ lớp «Hội đồng nhà đầu tư cả lớp» (đặc tả specs/012-pitch-nang-cap, PR 1).
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Mỗi đội là một «quỹ» có 1 tỷ đồng vốn ảo cho cả buổi. Khi giảng viên mở cửa sổ rót vốn (60 giây) cho đội đang pitch,
 * các quỹ khác rót theo bậc 50 triệu, tối đa 500 triệu cho một đội, không rót cho chính mình.
 * Màn chiếu (chủ phòng) là nguồn sự thật duy nhất: nó kiểm mọi luật, bỏ tin sai luật, chống cộng hai lần theo mã lượt rót.
 * Máy chủ không lưu gì: tin đi qua Supabase Realtime (js/phong-realtime.js, kênh 'bizon-pitch-<mã>') hoặc BroadcastChannel
 * (kênh 'local', để thử trên một máy và để test). Màn chiếu xuất CSV.
 * Phần trên (sổ góp vốn) là hàm thuần, test được trong Node; phần chuyển tin chỉ chạy trong trình duyệt. */
(function (root) {
  'use strict';

  const LUAT = { vonQuy: 1e9, bac: 5e7, tran: 5e8, cuaSoGiay: 60 };
  const KY_TU = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // bỏ I, O, 0, 1 cho dễ đọc trên màn chiếu

  /** Mã phòng 6 ký tự. `rand` trả số trong [0,1) (truyền vào để test tất định). */
  function maPhongMoi(rand) { const r = rand || Math.random; let s = ''; for (let i = 0; i < 6; i++) s += KY_TU[Math.floor(r() * KY_TU.length)]; return s; }
  const maPhongHopLe = s => /^[A-HJ-NP-Z2-9]{6}$/.test(String(s || ''));

  function taoPhong(phong) { return { phong, quy: {}, thuTu: [], dangPitch: null, gop: [], bo: [], daThay: {}, lich: [] }; }
  const sao = st => JSON.parse(JSON.stringify(st));
  const tenSach = s => String(s || '').replace(/\s+/g, ' ').trim().slice(0, 40);
  // Tin đến từ mạng: mã quỹ, mã lượt chỉ nhận chữ, số, gạch; tra bằng thuộc tính riêng (không đụng prototype).
  const maHopLe = (x, dai) => typeof x === 'string' && x.length <= dai && /^[A-Za-z0-9_-]+$/.test(x) && x !== '__proto__';
  const co = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const SO_QUY_TOI_DA = 60;

  /** Đã rót của một quỹ cho một đội. */
  const daRotCho = (st, quy, doi) => st.gop.filter(g => g.quy === quy && g.doi === doi).reduce((a, g) => a + g.so, 0);
  const vonCon = (st, quy) => LUAT.vonQuy - st.gop.filter(g => g.quy === quy).reduce((a, g) => a + g.so, 0);

  /** Một đội xin vào phòng làm quỹ (chờ giảng viên duyệt). */
  function xinVao(st, quy, ten, luc) {
    const s = sao(st); const t = tenSach(ten);
    if (!maHopLe(quy, 40) || !t) return { st: s, ok: false, ly: 'thieu-ten' };
    if (co(s.quy, quy)) { if (s.quy[quy].trangThai === 'cho') s.quy[quy].ten = t; return { st: s, ok: true, ly: 'da-co' }; }
    if (s.thuTu.length >= SO_QUY_TOI_DA) return { st: s, ok: false, ly: 'day' };
    s.quy[quy] = { id: quy, ten: t, trangThai: 'cho', luc: luc || '' }; s.thuTu.push(quy);
    return { st: s, ok: true };
  }
  function duyet(st, quy) { const s = sao(st); if (!co(s.quy, quy)) return { st: s, ok: false, ly: 'khong-co' }; s.quy[quy].trangThai = 'duyet'; return { st: s, ok: true }; }
  function tuChoi(st, quy) { const s = sao(st); if (!co(s.quy, quy) || s.quy[quy].trangThai !== 'cho') return { st: s, ok: false }; delete s.quy[quy]; s.thuTu = s.thuTu.filter(x => x !== quy); return { st: s, ok: true }; }

  /** Giảng viên mở cửa sổ rót vốn cho đội đang pitch. `now` tính bằng ms. */
  function moRot(st, doi, mucTieu, now) {
    const s = sao(st);
    if (!co(s.quy, doi) || s.quy[doi].trangThai !== 'duyet') return { st: s, ok: false, ly: 'doi-chua-duyet' };
    s.dangPitch = { doi, mucTieu: Math.max(0, +mucTieu || 0), moLuc: now, hetHan: now + LUAT.cuaSoGiay * 1000 };
    if (!s.lich.includes(doi)) s.lich.push(doi);
    return { st: s, ok: true };
  }
  function dongRot(st, now) { const s = sao(st); if (s.dangPitch) s.dangPitch.hetHan = Math.min(s.dangPitch.hetHan, now); return { st: s, ok: true }; }
  const dangMo = (st, now) => !!(st.dangPitch && now <= st.dangPitch.hetHan);

  /** Một lượt rót vốn từ quỹ. Trả { st, ok, ly }. Tin trùng mã: không cộng, coi như đã nhận (ok, ly 'trung'). */
  function rot(st, tin, now) {
    const s = sao(st), ma = String(tin && tin.ma || ''), quy = tin && tin.quy, doi = tin && tin.doi, so = Number(tin && tin.so);
    if (!maHopLe(ma, 80)) return { st: s, ok: false, ly: 'thieu-ma' };
    if (co(s.daThay, ma)) return { st: s, ok: s.daThay[ma] === 'nhan', ly: 'trung' };   // 'nhan' hoặc 'bo:<lý do>'
    const boDi = ly => { s.daThay[ma] = 'bo:' + ly; s.bo.push({ ma, quy: String(quy || '').slice(0, 40), doi: String(doi || '').slice(0, 40), so: Number.isFinite(so) ? so : 0, ly, luc: now }); return { st: s, ok: false, ly }; };
    if (!co(s.quy, quy) || s.quy[quy].trangThai !== 'duyet') return boDi('quy-chua-duyet');
    if (!s.dangPitch) return boDi('chua-mo');
    if (now > s.dangPitch.hetHan) return boDi('het-gio');
    if (doi !== s.dangPitch.doi) return boDi('sai-doi');
    if (quy === doi) return boDi('cua-minh');
    if (!Number.isInteger(so) || so <= 0 || so % LUAT.bac !== 0) return boDi('sai-bac');
    if (daRotCho(s, quy, doi) + so > LUAT.tran) return boDi('vuot-tran');
    if (vonCon(s, quy) < so) return boDi('het-von');
    s.daThay[ma] = 'nhan'; s.gop.push({ ma, quy, doi, so, luc: now });
    return { st: s, ok: true };
  }

  /** Tổng gọi được của một đội và số quỹ đã rót. */
  function tongDoi(st, doi) { const g = st.gop.filter(x => x.doi === doi); return { tong: g.reduce((a, x) => a + x.so, 0), soQuy: new Set(g.map(x => x.quy)).size }; }
  /** Bảng xếp hạng gọi vốn: các đội đã pitch, xếp theo tổng giảm dần, cùng tổng thì nhiều quỹ hơn đứng trước. */
  function xepHang(st) {
    return st.lich.map(doi => Object.assign({ doi, ten: st.quy[doi] ? st.quy[doi].ten : doi }, tongDoi(st, doi)))
      .sort((a, b) => b.tong - a.tong || b.soQuy - a.soQuy || a.ten.localeCompare(b.ten));
  }
  /** Danh mục của một quỹ: đội nhận và số vốn, cùng vốn còn lại. */
  function danhMuc(st, quy) {
    const m = {}; st.gop.filter(g => g.quy === quy).forEach(g => { m[g.doi] = (m[g.doi] || 0) + g.so; });
    return { vonCon: vonCon(st, quy), khoan: Object.keys(m).map(doi => ({ doi, ten: st.quy[doi] ? st.quy[doi].ten : doi, so: m[doi] })) };
  }

  /** Bản rút gọn màn chiếu gửi cho các quỹ: không có lịch sử chi tiết của quỹ khác, chỉ những gì quỹ cần để tự kiểm. */
  function banTin(st, now) {
    return {
      phong: st.phong, luc: now,
      quy: st.thuTu.map(id => ({ id, ten: st.quy[id].ten, trangThai: st.quy[id].trangThai, vonCon: vonCon(st, id) })),
      dangPitch: st.dangPitch ? Object.assign({}, st.dangPitch, { ten: st.quy[st.dangPitch.doi] ? st.quy[st.dangPitch.doi].ten : '' }, tongDoi(st, st.dangPitch.doi), { conMo: dangMo(st, now) }) : null,
      daXet: Object.keys(st.daThay).slice(-300).map(ma => [ma, st.daThay[ma]]),
      gop: st.gop.map(g => [g.quy, g.doi, g.so]),
      lich: st.lich.slice(),
    };
  }
  /** Dựng lại trạng thái tối thiểu từ bản tin (cho màn xem và trang quỹ) để dùng chung tongDoi, xepHang, danhMuc, vonCon. */
  function tuBanTin(bt) {
    const s = taoPhong(bt && bt.phong || ''); if (!bt) return s;
    (bt.quy || []).forEach(x => { s.quy[x.id] = { id: x.id, ten: x.ten, trangThai: x.trangThai }; s.thuTu.push(x.id); });
    s.gop = (bt.gop || []).map(([quy, doi, so]) => ({ quy, doi, so }));
    s.lich = (bt.lich || []).slice();
    s.dangPitch = bt.dangPitch ? { doi: bt.dangPitch.doi, mucTieu: bt.dangPitch.mucTieu, moLuc: bt.dangPitch.moLuc, hetHan: bt.dangPitch.hetHan } : null;
    (bt.daXet || []).forEach(([ma, v]) => { s.daThay[ma] = v; });
    return s;
  }

  /** Số tiền đồng → chữ ngắn: 350 triệu, 1 tỷ, 1,25 tỷ (EN: 350 million, 1.25 billion). */
  function dinhTien(v, lang) {
    const n = Number(v) || 0, en = lang === 'en', ty = Math.abs(n) >= 1e9;
    let so = String(Math.round((ty ? n / 1e9 : n / 1e6) * 100) / 100);
    if (!en) so = so.replace('.', ',');
    return so + (ty ? (en ? ' billion' : ' tỷ') : (en ? ' million' : ' triệu'));
  }

  const COT_CSV = ['ma_buoi', 'loai', 'ma_luot', 'quy', 'doi', 'so_von', 'ly_do', 'thoi_diem'];
  function oCsv(v) { let s = v == null ? '' : String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  /** CSV mỗi lượt rót một dòng (cả lượt bị bỏ, kèm lý do); tên đội do lớp đặt, không tên thật. BOM, CRLF. */
  function taoCsv(st) {
    const ten = id => (st.quy[id] ? st.quy[id].ten : id), iso = ms => (ms ? new Date(ms).toISOString() : '');
    const dong = st.gop.map(g => [st.phong, 'gop', g.ma, ten(g.quy), ten(g.doi), g.so, '', iso(g.luc)])
      .concat(st.bo.map(b => [st.phong, 'bo', b.ma, ten(b.quy), ten(b.doi), b.so, b.ly, iso(b.luc)]));
    return '﻿' + [COT_CSV.join(',')].concat(dong.map(r => r.map(oCsv).join(','))).join('\r\n') + '\r\n';
  }

  /* ---------- Chuyển tin (chỉ trong trình duyệt) ----------
   * taoKenh({ kieu: 'realtime' | 'local', phong, id, onTin(loai, du) }) → Promise<{ gui(loai, du), dong() }> */
  function taoKenh(o) {
    const ten = 'bizon-pitch-' + String(o.phong).toLowerCase();
    if (o.kieu === 'local' || typeof WebSocket === 'undefined') {
      const bc = new BroadcastChannel(ten);
      bc.onmessage = e => { const d = e.data || {}; try { o.onTin && o.onTin(d.loai, d.du); } catch (er) {} };
      return Promise.resolve({ kieu: 'local', gui: (loai, du) => bc.postMessage({ loai, du }), dong: () => bc.close() });
    }
    const cfg = (root.BIZON_BACKEND || {});
    if (!cfg.enabled || !cfg.url || !cfg.anonKey) return Promise.reject(new Error('khong-co-backend'));
    return import(o.duongDanRealtime || '../js/phong-realtime.js').then(m => {
      const p = m.moPhong({ url: cfg.url, key: cfg.anonKey, phong: String(o.phong).toLowerCase(), id: o.id, tienTo: 'bizon-pitch-',
        trangThai: () => ({ vai: o.vai || 'quy' }), onTin: (loai, du) => { try { o.onTin && o.onTin(loai, du); } catch (er) {} }, onTrangThai: o.onTrangThai });
      return { kieu: 'realtime', gui: (loai, du) => p.phat(loai, du), dong: () => p.dong() };
    });
  }

  const LOP = { LUAT, COT_CSV, maPhongMoi, maPhongHopLe, taoPhong, xinVao, duyet, tuChoi, moRot, dongRot, dangMo, rot, tongDoi, xepHang, danhMuc, vonCon, banTin, tuBanTin, taoCsv, dinhTien, taoKenh };
  if (typeof module === 'object' && module.exports) module.exports = LOP;
  else root.PitchLop = LOP;
})(typeof self !== 'undefined' ? self : this);
