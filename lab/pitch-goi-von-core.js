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

  /** Tự chấm 4 tiêu chí (mỗi tiêu chí 0–2,5, bước 0,5). Phạt 5 điểm thang 100 (0,5 thang 10), không âm. */
  function tinhDiem(diem, biPhat, luat) {
    const d = [0, 1, 2, 3].map(i => { const x = Number((diem || [])[i]); return Number.isFinite(x) ? Math.min(2.5, Math.max(0, Math.round(x * 2) / 2)) : 0; });
    const tuCham = d.reduce((a, b) => a + b, 0);
    const tong100 = Math.max(0, Math.round(tuCham * 10 - (biPhat ? luat.diemPhat : 0)));
    return { diem: d, tuCham, phat100: biPhat ? luat.diemPhat : 0, tong100, tong10: tong100 / 10 };
  }

  /** Kiểm ba con số (vốn xin, BEP/tháng, lợi nhuận mục tiêu/tháng) bằng số phụ đội nhập. Chỉ trả số tính theo công thức
   *  và số đội khai; KHÔNG đề xuất số thay. Thiếu số phụ thì bỏ qua phép kiểm đó.
   *  Đơn vị: tiền tổng (vonXin, lnMucTieu, dinhPhi, dauTu) = triệu đồng; giá, biến phí = nghìn đồng/sản phẩm;
   *  bep, sanLuong = sản phẩm/tháng; thangHoaVon = tháng.
   *  - bep: F × 1000 ÷ (giá − biến phí); lệch quá 10 % so với số khai thì báo.
   *  - ln: (sản lượng − BEP tính) × (giá − biến phí) ÷ 1000; mục tiêu lớn hơn thì báo.
   *  - von: đầu tư ban đầu + M × F ÷ 2 (giả định doanh số tăng đều từ 0 lên điểm hòa vốn trong M tháng); vốn xin nhỏ hơn thì báo. */
  function kiemBaCon(so) {
    const n = k => { const x = Number(so && so[k]); return Number.isFinite(x) && so[k] !== '' && so[k] !== null ? x : null; };
    const ra = [];
    const gia = n('gia'), bp = n('bienPhi'), F = n('dinhPhi');
    const bdg = gia !== null && bp !== null ? gia - bp : null;
    const bepTinh = bdg !== null && bdg > 0 && F !== null ? F * 1000 / bdg : null;
    if (n('bep') !== null && bdg !== null && F !== null) {
      if (bepTinh === null) ra.push({ ma: 'bep', ok: false, tinh: null, khai: n('bep'), lech: null });
      else { const lech = (n('bep') - bepTinh) / bepTinh; ra.push({ ma: 'bep', ok: Math.abs(lech) <= 0.10 + 1e-9, tinh: Math.round(bepTinh), khai: n('bep'), lech }); }
    }
    if (n('lnMucTieu') !== null && n('sanLuong') !== null && bepTinh !== null) {
      const toiDa = Math.round((n('sanLuong') - bepTinh) * bdg / 1000 * 10) / 10;
      ra.push({ ma: 'ln', ok: n('lnMucTieu') <= toiDa + 1e-9, tinh: toiDa, khai: n('lnMucTieu'), lech: null });
    }
    if (n('vonXin') !== null && n('dauTu') !== null && F !== null && n('thangHoaVon') !== null) {
      const can = Math.round((n('dauTu') + n('thangHoaVon') * F / 2) * 10) / 10;
      ra.push({ ma: 'von', ok: n('vonXin') >= can - 1e-9, tinh: can, khai: n('vonXin'), lech: null });
    }
    return ra;
  }

  const COT_CSV = ['thoi_diem', 'doi', 'nganh', 'ma_luot', 'tong_giay', 'bi_phat', 'giay_ceo_mo', 'giay_cmo', 'giay_cfo', 'giay_coo', 'giay_sec', 'giay_ceo_chot',
    'cau_hoi', 'diem_kha_thi', 'diem_doc_dao', 'diem_doi_ngu', 'diem_trinh_bay', 'diem_100', 'diem_10',
    'von_xin', 'bep_thang', 'ln_muc_tieu', 'gia', 'bien_phi', 'dinh_phi', 'san_luong', 'dau_tu', 'thang_hoa_von', 'so_canh_bao', 'phien_ban_cau_hoi'];

  /** CSV một dòng mỗi lượt; có BOM để Excel đọc đúng tiếng Việt; dòng kết thúc CRLF. */
  function taoCsv(luot) {
    const o = v => { const s = v === null || v === undefined ? '' : String(v); return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const dong = luot.map(l => {
      const s = l.so || {}, td = l.tungDoan || [];
      return [l.thoiDiem, l.doi, l.nganh, l.ma, Math.round(l.giay), l.phat ? 1 : 0, ...[0, 1, 2, 3, 4, 5].map(i => Math.round(td[i] || 0)),
        (l.cau || []).join(';'), ...(l.diem || []), l.tong100, l.tong10,
        s.vonXin, s.bep, s.lnMucTieu, s.gia, s.bienPhi, s.dinhPhi, s.sanLuong, s.dauTu, s.thangHoaVon, l.soLech, l.phienBan].map(o).join(',');
    });
    return '\uFEFF' + [COT_CSV.join(',')].concat(dong).join('\r\n') + '\r\n';
  }

  /** Phản ứng của Hội đồng cho một tín hiệu (đặc tả 012, PR 3). Trả danh sách { ai, dongTac, vi, en } theo bảng luật;
   *  'nguoi-hoi' đổi thành thành viên đang hỏi. Tín hiệu lạ thì trả mảng rỗng. Không đọc nội dung câu trả lời. */
  function phanUng(tinHieu, nguoiHoi, bang) {
    return (bang || []).filter(r => r.tinHieu === tinHieu).map(r => {
      const ai = r.ai === 'nguoi-hoi' ? nguoiHoi : r.ai;
      const loi = r.loi && r.loi.vi ? r.loi : (r.loi && r.loi[ai]) || { vi: '', en: '' };
      return { tinHieu, ai, dongTac: r.dongTac, vi: loi.vi, en: loi.en };
    }).filter(x => x.ai);
  }
  /** Câu hỏi vặn tài chính khi kiểm ba con số báo lệch: ưu tiên hòa vốn, rồi vốn xin, rồi lợi nhuận. Không lệch thì null. */
  function cauVan(kq, bangVan) {
    const lech = (kq || []).filter(x => !x.ok).map(x => x.ma);
    const ma = ['bep', 'von', 'ln'].find(m => lech.includes(m));
    if (!ma || !bangVan || !bangVan[ma]) return null;
    const c = bangVan[ma];
    return { id: 'van-' + ma, p: c.p, vai: 'cfo', hoi: 'minh-khang', vi: c.vi, en: c.en, van: ma };
  }

  const CORE = { phanUng, cauVan, trangThai, thoiGianTungDoan, taoDongHo, bam, mulberry32, rutCauHoi, maNgauNhien, mmss, tinhDiem, kiemBaCon, COT_CSV, taoCsv };
  if (typeof module === 'object' && module.exports) module.exports = CORE;
  else root.PitchCore = CORE;
})(typeof self !== 'undefined' ? self : this);
