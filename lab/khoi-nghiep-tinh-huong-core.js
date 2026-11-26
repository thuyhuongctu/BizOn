/* BizOn – lõi Tình huống khởi nghiệp: hàm thuần, chạy được trong trình duyệt và Node (test).
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 * Không chấm điểm: chỉ ghi lựa chọn và lý do, tính tiến độ, tổng kết, xuất CSV; giảng viên gộp CSV của lớp. */
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

  /** Đọc một tệp CSV do taoCsv xuất (BOM, CRLF, ô bọc nháy kép, dấu ' chặn công thức) thành mảng đối tượng theo COT_CSV.
   *  Ném lỗi nếu thiếu cột. Đọc trên máy giảng viên, không tải lên đâu. */
  function docCsv(text) {
    const s = String(text || '').replace(/^\uFEFF/, ''), hang = []; let o = '', dong = [], nhay = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (nhay) { if (c === '"') { if (s[i + 1] === '"') { o += '"'; i++; } else nhay = false; } else o += c; }
      else if (c === '"') nhay = true;
      else if (c === ',') { dong.push(o); o = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && s[i + 1] === '\n') i++; dong.push(o); hang.push(dong); dong = []; o = ''; }
      else o += c;
    }
    if (o !== '' || dong.length) { dong.push(o); hang.push(dong); }
    const rong = hang.filter(h => h.some(x => x.trim() !== ''));
    if (!rong.length) throw new Error('Tệp trống');
    const dau = rong[0].map(x => x.trim()), thieu = COT_CSV.filter(c => !dau.includes(c));
    if (thieu.length) throw new Error('Thiếu cột: ' + thieu.join(', '));
    const bo = v => (/^'[=+\-@\t\r]/.test(v) ? v.slice(1) : v);
    return rong.slice(1).map(h => { const r = {}; dau.forEach((c, i) => { if (COT_CSV.includes(c)) r[c] = bo(h[i] == null ? '' : h[i]); }); return r; });
  }

  /** Gộp nhiều tệp CSV của lớp: [{ ten, noiDung }] → { dong, loi: [{ tep, ly }], trung }.
   *  Cùng một đội (tên đội không trống) nộp hai lần cho cùng tình huống thì giữ lần mới nhất theo thoi_diem. */
  function gopCsv(tep) {
    const loi = [], theoKhoa = new Map(), khongTen = []; let trung = 0;
    (tep || []).forEach(f => {
      let rows; try { rows = docCsv(f.noiDung); } catch (e) { loi.push({ tep: f.ten, ly: e.message }); return; }
      rows.forEach(r => {
        if (!r.bo || !r.tinh_huong || !r.phuong_an) return;
        const doi = String(r.doi || '').trim();
        if (!doi) { khongTen.push(r); return; }
        const k = doi.toLowerCase() + '|' + r.bo + '|' + r.tinh_huong, cu = theoKhoa.get(k);
        if (cu) { trung++; if (String(r.thoi_diem) > String(cu.thoi_diem)) theoKhoa.set(k, r); } else theoKhoa.set(k, r);
      });
    });
    return { dong: [...theoKhoa.values(), ...khongTen], loi, trung };
  }

  /** Phân bố lựa chọn của lớp theo bộ và tình huống. Dòng khác PHIEN_BAN hoặc mã phương án lạ được đếm riêng. */
  function phanBo(D, dong) {
    return D.BO.map(b => ({
      bo: b.id, ten: b.ten,
      tinhHuong: b.tinhHuong.map(t => {
        const cua = (dong || []).filter(r => r.bo === b.id && r.tinh_huong === t.id);
        const hop = cua.filter(r => r.phien_ban === D.PHIEN_BAN && t.phuongAn.some(p => p.id === r.phuong_an));
        const tong = hop.length;
        return {
          id: t.id, tieuDe: t.tieuDe, tong, khac: cua.length - tong,
          pa: t.phuongAn.map(p => { const n = hop.filter(r => r.phuong_an === p.id).length; return { id: p.id, nhan: p.nhan, logic: p.logic, n, tiLe: tong ? Math.round(n * 100 / tong) : 0 }; }),
        };
      }),
    }));
  }

  /** Văn bản Markdown gồm mọi phần «Vì sao?» và danh mục nguồn, để kiểm trích dẫn bằng scripts/research/kiem-trich-dan.mjs. */
  function vanBanTrichDan(D, lang) {
    const l = lang || 'vi', dung = new Set(), than = [];
    D.BO.forEach(b => b.tinhHuong.forEach(t => { (t.nguon || []).forEach(k => dung.add(k)); t.phuongAn.forEach(p => than.push(p.viSao[l])); }));
    return '# ' + (l === 'vi' ? 'Phần «Vì sao?»' : 'The «Why?» sections') + '\n\n' + than.join('\n\n') +
      '\n\n## ' + (l === 'vi' ? 'Tài liệu tham khảo' : 'References') + '\n\n' + [...dung].sort().map(k => D.NGUON[k]).join('\n\n') + '\n';
  }

  const CORE = { lyDoHopLe, tienDo, ghiChon, tongKet, COT_CSV, oCsv, taoCsv, docCsv, gopCsv, phanBo, vanBanTrichDan };
  if (typeof module === 'object' && module.exports) module.exports = CORE;
  else root.KhoiNghiepCore = CORE;
})(typeof self !== 'undefined' ? self : this);
