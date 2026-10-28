/* BizOn — Xưởng Nhãn Hiệu: giao diện trang xuong-nhan-hieu.html.
 * © 2026 Đỗ Thùy Hương & PGS.TS. Phan Anh Tú. Bảo lưu mọi quyền.
 * Phụ thuộc (nạp trước): js/brand-workshop-data.js, js/bizon-clay-i18n.js.
 *
 * Mọi thứ chạy trên máy sinh viên: bài làm tự lưu trong trình duyệt (localStorage), Lumina góp ý ngay khi gõ
 * theo luật trong brand-workshop-data.js. Không gửi lên máy chủ nào: sinh viên in phiếu A4 (hoặc lưu PDF),
 * tải tệp .json hay sao chép văn bản để nộp theo cách giảng viên thu bài.
 */
(function () {
  'use strict';
  const D = window.BizOnBrandWorkshop; if (!D) return;
  const KEY = 'bizon-xuong-nhan-hieu', APP = 'bizon-xnh-v1';
  const $ = id => document.getElementById(id);
  const lang = () => (typeof window.clayCurrentLang === 'function' ? window.clayCurrentLang() : 'vi');
  const t = (vi, en) => (lang() === 'en' ? en : vi);
  const L = o => (o ? (lang() === 'en' ? o.en : o.vi) : '');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let W = D.trong();

  function doc() { try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); return o && o.v === 1 ? Object.assign(D.trong(), o) : D.trong(); } catch (e) { return D.trong(); } }
  function luu() { try { localStorage.setItem(KEY, JSON.stringify(W)); } catch (e) {} }

  // ---------- vẽ các nhóm lựa chọn (đổi ngôn ngữ thì vẽ lại, giữ lựa chọn) ----------
  const nhomChon = (ds, name, kieu, chon) => ds.map(o => `<label class="xn-chip"><input type="${kieu}" name="${name}" value="${esc(o.id)}"${(Array.isArray(chon) ? chon.includes(o.id) : chon === o.id) ? ' checked' : ''}><span>${esc(L(o))}</span></label>`).join('');
  function veLuaChon() {
    $('xn-nhom').innerHTML = Object.entries(D.NHOM).map(([id, o]) => `<label class="xn-chip"><input type="radio" name="sp-nhom" value="${id}"${W.sp.nhom === id ? ' checked' : ''}><span>${esc(L(o))}</span></label>`).join('');
    $('xn-goi-y').innerHTML = (D.GOI_Y[W.sp.nhom] || [...D.GOI_Y['nong-san'], ...D.GOI_Y['thu-cong']]).map(o => `<option value="${esc(L(o))}">`).join('');
    $('xn-thuoc-tinh').innerHTML = nhomChon(D.THUOC_TINH, 'sp-tt', 'checkbox', W.sp.thuocTinh);
    $('xn-gia').innerHTML = nhomChon(D.GIA, 'gia-cl', 'radio', W.gia.chienLuoc);
    $('xn-kenh').innerHTML = nhomChon(D.KENH, 'kenh', 'checkbox', W.kenh.chon);
    $('xn-qb').innerHTML = nhomChon(D.QUANG_BA, 'qb', 'checkbox', W.qb.chon);
  }
  const O = [   // ô nhập ↔ trường trong bài làm
    ['xn-sv-ten', 'sv', 'ten'], ['xn-sv-mssv', 'sv', 'mssv'], ['xn-sv-lop', 'sv', 'lop'],
    ['xn-sp-ten', 'sp', 'ten'], ['xn-sp-noi', 'sp', 'noi'], ['xn-sp-mo-ta', 'sp', 'moTa'],
    ['xn-nh-ten', 'nh', 'ten'], ['xn-nh-slogan', 'nh', 'slogan'], ['xn-nh-giai-thich', 'nh', 'giaiThich'],
    ['xn-nh-tra', 'nh', 'traTrung'], ['xn-nh-ket-qua', 'nh', 'ketQuaTra'],
    ['xn-g-von', 'gia', 'von'], ['xn-g-ban', 'gia', 'ban'], ['xn-g-doi-thu', 'gia', 'doiThu'], ['xn-g-ghi-chu', 'gia', 'ghiChu'],
    ['xn-kenh-ghi-chu', 'kenh', 'ghiChu'], ['xn-qb-ke-hoach', 'qb', 'keHoach'],
  ];
  function dien() { for (const [id, a, b] of O) { const el = $(id); if (el) el.value = W[a][b] || ''; } $('xn-ket-qua-wrap').hidden = W.nh.traTrung !== 'da-tra'; }
  function gom() {
    for (const [id, a, b] of O) { const el = $(id); if (el) W[a][b] = el.value; }
    const r = n => { const x = document.querySelector(`input[name="${n}"]:checked`); return x ? x.value : ''; };
    const c = n => [...document.querySelectorAll(`input[name="${n}"]:checked`)].map(x => x.value);
    W.sp.nhom = r('sp-nhom'); W.sp.thuocTinh = c('sp-tt'); W.gia.chienLuoc = r('gia-cl'); W.kenh.chon = c('kenh'); W.qb.chon = c('qb');
    $('xn-ket-qua-wrap').hidden = W.nh.traTrung !== 'da-tra';
  }

  // ---------- góp ý ----------
  const PHAN = { sp: ['Sản phẩm', 'Product choice'], nh: ['Nhãn hiệu', 'Brand'], p: ['Product', 'Product'], g: ['Price', 'Price'], l: ['Place', 'Place'], m: ['Promotion', 'Promotion'] };
  const BIEU = { thieu: '✏️', 'canh-bao': '⚠️', 'goi-y': '💡', tot: '✅' };
  function veGopY() {
    const ds = D.gopY(W), h = D.hoanThanh(W);
    $('xn-tien-do').style.width = Math.round(h.xong / h.tong * 100) + '%';
    $('xn-tien-do-chu').textContent = t(`Đã điền ${h.xong}/${h.tong} phần đề bài yêu cầu`, `${h.xong}/${h.tong} required parts filled in`);
    const nhom = Object.keys(PHAN).map(p => {
      const m = ds.filter(x => x.phan === p); if (!m.length) return '';
      return `<div class="xn-gy-nhom"><h3>${esc(t(PHAN[p][0], PHAN[p][1]))}</h3><ul>${m.map(x => `<li class="xn-gy ${x.muc}" data-id="${x.id}"><span aria-hidden="true">${BIEU[x.muc]}</span> ${esc(lang() === 'en' ? x.en : x.vi)}</li>`).join('')}</ul></div>`;
    }).join('');
    $('xn-gop-y').innerHTML = nhom || `<p>${esc(t('Chưa có góp ý.', 'No feedback yet.'))}</p>`;
  }
  function doi() { gom(); luu(); veGopY(); }

  // ---------- phiếu nộp (in A4 / văn bản / tệp) ----------
  const tenCua = (ds, id) => L(ds.find(x => x.id === id)) || '';
  function dongPhieu() {
    const g = W.gia, von = Number(String(g.von).replace(/[^\d.]/g, '')), ban = Number(String(g.ban).replace(/[^\d.]/g, ''));
    const bien = von > 0 && ban > 0 ? Math.round((ban - von) / ban * 100) + '%' : '—';
    return [
      [t('Họ tên', 'Name'), W.sv.ten], [t('MSSV', 'Student ID'), W.sv.mssv], [t('Lớp', 'Class'), W.sv.lop],
      [t('Nhóm sản phẩm', 'Product group'), L(D.NHOM[W.sp.nhom])], [t('Sản phẩm', 'Product'), W.sp.ten], [t('Địa phương', 'Place'), W.sp.noi],
      ['§', t('1. Xây dựng nhãn hiệu', '1. Brand')],
      [t('Tên thương hiệu', 'Brand name'), W.nh.ten], [t('Slogan', 'Slogan'), W.nh.slogan], [t('Vì sao phù hợp với doanh nghiệp mới', 'Why it suits a new business'), W.nh.giaiThich],
      [t('Tra trùng nhãn hiệu', 'Trademark search'), W.nh.traTrung === 'da-tra' ? ({ 'khong-trung': t('đã tra, chưa thấy nhãn hiệu giống', 'searched, no similar mark found'), 'gan-giong': t('đã tra, có nhãn hiệu gần giống', 'searched, a similar mark exists') }[W.nh.ketQuaTra] || t('đã tra', 'searched')) : t('chưa tra', 'not yet')],
      ['§', t('2. Marketing hỗn hợp (4P)', '2. Marketing mix (4P)')],
      ['Product', [W.sp.thuocTinh.map(id => tenCua(D.THUOC_TINH, id)).join('; '), W.sp.moTa].filter(Boolean).join(' — ')],
      ['Price', [tenCua(D.GIA, g.chienLuoc), g.von && t(`giá vốn ${g.von} đ`, `cost ${g.von} VND`), g.ban && t(`giá bán ${g.ban} đ`, `price ${g.ban} VND`), g.doiThu && t(`đối thủ ${g.doiThu} đ`, `competitors ${g.doiThu} VND`), t('biên gộp ', 'gross margin ') + bien, g.ghiChu].filter(Boolean).join('; ')],
      ['Place', [W.kenh.chon.map(id => tenCua(D.KENH, id)).join('; '), W.kenh.ghiChu].filter(Boolean).join(' — ')],
      ['Promotion', [W.qb.chon.map(id => tenCua(D.QUANG_BA, id)).join('; '), W.qb.keHoach].filter(Boolean).join(' — ')],
    ];
  }
  function vanBan() {
    const h = D.hoanThanh(W);
    return [t('BÀI TẬP TÌNH HUỐNG CHƯƠNG 5 · XÂY DỰNG NHÃN HIỆU & MARKETING MIX (làm cá nhân)', 'CHAPTER 5 CASE · BRAND & MARKETING MIX (individual)'), '']
      .concat(dongPhieu().map(([k, v]) => k === '§' ? '\n' + v.toUpperCase() : `${k}: ${v || '—'}`))
      .concat(['', t(`Mức hoàn thành: ${h.xong}/${h.tong} phần. Góp ý của Lumina là góp ý tự động theo luật, không phải điểm.`, `Completion: ${h.xong}/${h.tong} parts. Lumina's notes are rule-based feedback, not a grade.`),
        t('Làm trên BizOn · Xưởng Nhãn Hiệu (bizonland.com)', 'Made with BizOn · Brand Workshop (bizonland.com)')]).join('\n');
  }
  function vePhieu() {
    const h = D.hoanThanh(W), gy = D.gopY(W).filter(x => x.muc !== 'tot');
    $('xn-phieu').innerHTML = `<div class="xn-phieu-dau"><b>BizOn · ${esc(t('Xưởng Nhãn Hiệu', 'Brand Workshop'))}</b><span>${esc(t('Bài tập tình huống chương 5 · Xây dựng nhãn hiệu & Marketing mix · làm cá nhân', 'Chapter 5 case · Brand & marketing mix · individual'))}</span></div>
      <table>${dongPhieu().map(([k, v]) => k === '§' ? `<tr class="muc"><th colspan="2">${esc(v)}</th></tr>` : `<tr><th>${esc(k)}</th><td>${esc(v || '—')}</td></tr>`).join('')}</table>
      <p class="xn-phieu-ht">${esc(t(`Mức hoàn thành: ${h.xong}/${h.tong} phần đề bài yêu cầu.`, `Completion: ${h.xong}/${h.tong} required parts.`))}</p>
      ${gy.length ? `<h4>${esc(t('Góp ý tự động của Lumina (theo luật, không phải điểm)', 'Lumina\'s automatic notes (rule-based, not a grade)'))}</h4><ul>${gy.map(x => `<li>${BIEU[x.muc]} ${esc(lang() === 'en' ? x.en : x.vi)}</li>`).join('')}</ul>` : ''}
      <p class="xn-phieu-chan">${esc(t('In từ bizonland.com · Giảng viên chấm theo yêu cầu của học phần.', 'Printed from bizonland.com · The instructor grades according to the course requirements.'))} ${esc(new Date().toLocaleDateString(lang() === 'en' ? 'en-GB' : 'vi-VN'))}</p>`;
  }
  function tenTep(duoi) { const s = D.boDau([W.sv.mssv, W.sv.ten].filter(Boolean).join('-') || 'bai-lam').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); return `xuong-nhan-hieu-${s}.${duoi}`; }
  function taiTep() {
    const blob = new Blob([JSON.stringify({ app: APP, luc: new Date().toISOString(), bai: W, hoanThanh: D.hoanThanh(W), gopY: D.gopY(W).map(x => x.id) }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = tenTep('json'); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  async function saoChep() {
    const s = vanBan();
    try { await navigator.clipboard.writeText(s); bao(t('Đã sao chép bài làm. Dán vào nơi giảng viên thu bài.', 'Copied. Paste it where your instructor collects work.'), true); }
    catch (e) { const ta = $('xn-van-ban'); ta.hidden = false; ta.value = s; ta.select(); bao(t('Trình duyệt không cho sao chép tự động: chọn và sao chép trong ô bên dưới.', 'Automatic copy was blocked: select and copy from the box below.')); }
  }
  function bao(s, ok) { const el = $('xn-bao'); el.textContent = s; el.style.color = ok ? '#246b3a' : ''; }

  function veLai() { veLuaChon(); dien(); veGopY(); }
  function init() {
    W = doc();
    veLai();
    $('xn-bai').addEventListener('input', doi);
    $('xn-bai').addEventListener('change', e => { if (e.target && e.target.name === 'sp-nhom') { gom(); veLuaChon(); } doi(); });
    $('xn-in').addEventListener('click', () => { gom(); vePhieu(); window.print(); });
    $('xn-tai').addEventListener('click', () => { gom(); taiTep(); bao(t('Đã tải tệp .json của bài làm.', 'Downloaded the .json file of your work.'), true); });
    $('xn-chep').addEventListener('click', () => { gom(); saoChep(); });
    $('xn-moi').addEventListener('click', () => { if (!confirm(t('Xoá bài làm trên máy này và làm lại từ đầu?', 'Delete the work on this device and start over?'))) return; W = D.trong(); luu(); veLai(); bao(''); });
    // phiếu là con trực tiếp của <body>: lúc in ẩn mọi thứ khác (cùng cách phiếu kết quả của Bật Nghiệp)
    const phieu = $('xn-phieu'); if (phieu.parentNode !== document.body) document.body.appendChild(phieu);
    window.addEventListener('beforeprint', () => { gom(); vePhieu(); document.body.classList.add('xn-printing'); });
    window.addEventListener('afterprint', () => document.body.classList.remove('xn-printing'));
    window.addEventListener('bizon:langchange', () => { gom(); veLai(); });
  }
  window.__xnTest = { get bai() { return W; }, vanBan, dongPhieu, gom, veLai };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
