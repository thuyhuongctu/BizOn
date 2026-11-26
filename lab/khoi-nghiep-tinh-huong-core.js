/* BizOn – lõi Tình huống khởi nghiệp: hàm thuần, chạy được trong trình duyệt và Node (test).
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 * Không chấm điểm: chỉ ghi lựa chọn và lý do, tính tiến độ, tổng kết, xuất CSV. */
(function (root) {
  'use strict';

  /** Lý do hợp lệ: bỏ khoảng trắng hai đầu, gộp khoảng trắng, đủ số ký tự tối thiểu. */
  function lyDoHopLe(s, toiThieu) {
    return String(s || '').replace(/\s+/g, ' ').trim().length >= toiThieu;
  }

  /** Lựa chọn đã lưu còn hợp lệ: có mã phương án và mã đó vẫn có trong tình huống. */
  const daLam = (t, c) => !!(c[t.id] && c[t.id].pa && t.phuongAn.some(p => p.id === c[t.id].pa));

  /** Tiến độ một bộ: { xong, tong, tiep (chỉ số tình huống chưa làm đầu tiên, −1 nếu xong hết) } */
  function tienDo(bo, chon) {
    const c = chon || {};
    const xong = bo.tinhHuong.filter(t => daLam(t, c)).length;
    const tiep = bo.tinhHuong.findIndex(t => !daLam(t, c));
    return { xong, tong: bo.tinhHuong.length, tiep };
  }

  /** Ghi một lựa chọn (trả bản mới, không sửa đối tượng cũ). Lý do không đủ thì ném lỗi. */
  function ghiChon(chon, tinhHuong, paId, lyDo, toiThieu, luc) {
    if (!tinhHuong.phuongAn.some(p => p.id === paId)) throw new Error('Phương án không có: ' + paId);
    if (!lyDoHopLe(lyDo, toiThieu)) throw new Error('Lý do chưa đủ ' + toiThieu + ' ký tự');
    return Object.assign({}, chon, { [tinhHuong.id]: { pa: paId, lyDo: String(lyDo).replace(/\s+/g, ' ').trim(), luc: luc || new Date().toISOString() } });
  }

  /** Dòng tổng kết theo thứ tự tình huống. */
  function tongKet(bo, chon) {
    return bo.tinhHuong.map(t => {
      const c = (chon || {})[t.id]; const p = c && t.phuongAn.find(x => x.id === c.pa);
      return { id: t.id, tieuDe: t.tieuDe, phuongAn: p ? p.nhan : null, logic: p ? p.logic : null, lyDo: c ? c.lyDo : '', luc: c ? c.luc : '' };
    });
  }

  const COT_CSV = ['bo', 'phien_ban', 'tinh_huong', 'phuong_an', 'logic', 'ly_do', 'thoi_diem', 'doi'];
  /** Một ô CSV. Ô bắt đầu bằng = + - @ tab hay CR được thêm dấu ' phía trước để Excel không chạy như công thức
   *  (lý do và tên đội do sinh viên gõ). Ô có dấu phẩy, nháy kép hay xuống dòng được bọc nháy kép. */
  function oCsv(v) {
    let s = v == null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  /** CSV một dòng mỗi tình huống đã làm; BOM để Excel đọc đúng tiếng Việt; CRLF. */
  function taoCsv(bo, chon, phienBan, doi) {
    const o = oCsv;
    const dong = tongKet(bo, chon).filter(d => d.logic).map(d => {
      const c = chon[d.id];
      return [bo.id, phienBan, d.id, c.pa, d.logic, d.lyDo, d.luc, doi || ''].map(o).join(',');
    });
    return '﻿' + [COT_CSV.join(',')].concat(dong).join('\r\n') + '\r\n';
  }

  /** Văn bản Markdown gồm mọi phần «Vì sao?» và danh mục nguồn, để kiểm trích dẫn bằng scripts/research/kiem-trich-dan.mjs. */
  function vanBanTrichDan(D, lang) {
    const l = lang || 'vi', dung = new Set(), than = [];
    D.BO.forEach(b => b.tinhHuong.forEach(t => { (t.nguon || []).forEach(k => dung.add(k)); t.phuongAn.forEach(p => than.push(p.viSao[l])); }));
    return '# ' + (l === 'vi' ? 'Phần «Vì sao?»' : 'The «Why?» sections') + '\n\n' + than.join('\n\n') +
      '\n\n## ' + (l === 'vi' ? 'Tài liệu tham khảo' : 'References') + '\n\n' + [...dung].sort().map(k => D.NGUON[k]).join('\n\n') + '\n';
  }

  const CORE = { lyDoHopLe, tienDo, ghiChon, tongKet, COT_CSV, oCsv, taoCsv, vanBanTrichDan };
  if (typeof module === 'object' && module.exports) module.exports = CORE;
  else root.KhoiNghiepCore = CORE;
})(typeof self !== 'undefined' ? self : this);
