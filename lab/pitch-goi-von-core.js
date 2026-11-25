/* BizOn – lõi Phòng luyện pitch gọi vốn: hàm thuần, chạy được trong trình duyệt và Node (test).
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * - Đồng hồ tính theo giờ thật (hàm now() truyền vào), không đếm khung hình: chuyển tab hay khóa màn hình vẫn đúng.
 * - Đoạn vai: mỗi đoạn (trừ đoạn cuối) tự chuyển khi hết giờ của đoạn, hoặc sớm hơn khi đội bấm «Xong, chuyển vai».
 *   Đoạn cuối (CEO chốt) được dùng hết phần còn lại của 7 phút. Quá 7:00 là quá giờ; chạm 7:30 thì trừ điểm và dừng.
 * - Rút câu hỏi: tất định theo mã lượt (cùng mã, cùng câu), mỗi thành viên hỏi phần PASTOR của mình, không lặp câu,
 *   ưu tiên mỗi câu hỏi một vai khác nhau. */
(function (root) {
  'use strict';

  /** Trạng thái pitch tại thời điểm t (giây) với danh sách mốc «chuyển vai sớm» (giây, tăng dần). */
  function trangThai(t, chuyenSom, doan, luat) {
    const som = (chuyenSom || []).slice().sort((a, b) => a - b);
    const cuoi = doan.length - 1;
    const daDung = []; // giây đã dùng của từng đoạn đã xong
    let bd = 0;
    for (let i = 0; i < cuoi; i++) {
      const tuDong = bd + doan[i].giay;
      const m = som.find(x => x > bd && x < tuDong);
      const ket = m !== undefined ? m : tuDong;
      if (t < ket) return ketQua(i, bd, t - bd, ket - t);
      daDung.push(ket - bd);
      bd = ket;
    }
    return ketQua(cuoi, bd, t - bd, luat.tongGiay - t);

    function ketQua(i, batDau, trongDoan, conLaiDoan) {
      const phat = t >= luat.hanPhatGiay;
      return {
        doan: i, vai: doan[i].vai, batDauDoan: batDau, trongDoan, conLaiDoan,
        conLaiTong: luat.tongGiay - t,
        baoTruoc: !phat && conLaiDoan > 0 && conLaiDoan <= luat.baoTruocGiay,
        quaGio: t > luat.tongGiay, phat, dung: phat,
        daDung: daDung.concat([Math.min(t, phat ? luat.hanPhatGiay : t) - batDau]),
      };
    }
  }

  /** Giây đã dùng của từng đoạn khi pitch kết thúc tại tKet. Đoạn chưa tới thì 0. */
  function thoiGianTungDoan(tKet, chuyenSom, doan, luat) {
    const s = trangThai(tKet, chuyenSom, doan, luat);
    const ra = doan.map(() => 0);
    s.daDung.forEach((g, i) => { ra[i] = Math.max(0, Math.round(g * 10) / 10); });
    return ra;
  }

  /** Đồng hồ giờ thật có tạm dừng. now() trả mili giây. */
  function taoDongHo(now) {
    let chay = false, moc = 0, tichLuy = 0;
    return {
      batDau() { if (!chay) { chay = true; moc = now(); } },
      tamDung() { if (chay) { tichLuy += now() - moc; chay = false; } },
      dangChay() { return chay; },
      giay() { return (tichLuy + (chay ? now() - moc : 0)) / 1000; },
      datLai() { chay = false; moc = 0; tichLuy = 0; },
    };
  }

  /** Băm FNV-1a 32 bit cho mã lượt. */
  function bam(s) {
    let h = 0x811c9dc5;
    for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function tron(mang, rnd) {
    const a = mang.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /** Mã lượt ngẫu nhiên dễ đọc (6 ký tự, bỏ chữ dễ nhầm). */
  function maNgauNhien(rnd) {
    const b = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = '';
    for (let i = 0; i < 6; i++) s += b[Math.floor((rnd || Math.random)() * b.length)];
    return s;
  }

  /** Rút n câu (kẹp trong [soCauToiThieu, soCauToiDa]) theo mã lượt. Lần lượt từng thành viên Hội đồng hỏi. */
  function rutCauHoi(cauHoi, hoiDong, ma, n, luat) {
    const so = Math.max(luat.soCauToiThieu, Math.min(luat.soCauToiDa, Math.round(Number(n) || luat.soCauMacDinh)));
    const rnd = mulberry32(bam(String(ma || '').trim().toUpperCase()));
    const thuTu = tron(hoiDong.map(h => h.id), rnd);
    const hang = {};
    thuTu.forEach(id => { hang[id] = tron(cauHoi.filter(c => c.hoi === id), rnd); });
    const ra = [], vaiDaHoi = new Set();
    for (let k = 0; ra.length < so && k < so * thuTu.length * 4; k++) {
      const id = thuTu[k % thuTu.length], ds = hang[id];
      if (!ds.length) continue;
      let i = ds.findIndex(c => !vaiDaHoi.has(c.vai));
      if (i < 0) i = 0;
      const c = ds.splice(i, 1)[0];
      ra.push(c); vaiDaHoi.add(c.vai);
    }
    return ra;
  }

  /** Định dạng giây thành m:ss (âm thì có dấu +, dùng cho quá giờ). */
  function mmss(giay) {
    // Đếm ngược thì làm tròn lên (còn 9,1 giây hiện 0:10); quá giờ đếm lên thì làm tròn xuống (quá 12,2 giây hiện +0:12).
    const am = giay < 0, g = am ? Math.floor(-giay + 1e-9) : Math.ceil(giay - 1e-9);
    return (am ? '+' : '') + Math.floor(g / 60) + ':' + String(g % 60).padStart(2, '0');
  }

  const CORE = { trangThai, thoiGianTungDoan, taoDongHo, bam, mulberry32, rutCauHoi, maNgauNhien, mmss };
  if (typeof module === 'object' && module.exports) module.exports = CORE;
  else root.PitchCore = CORE;
})(typeof self !== 'undefined' ? self : this);
