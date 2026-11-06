/* Dây Chuyền Sầu Riêng – giao diện. © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
   Chỉ là giao diện: mọi luật chấm nằm ở day-chuyen-sau-rieng-data.js.
   Giọng đọc dùng chung js/durian-voice.js với Hộ Chiếu Sầu Riêng (Web Speech API; nút 🎙️ góc màn hình bật/tắt). */
(function () {
  'use strict';
  const D = window.DayChuyenData;
  const KHOA = 'durian_line_v1';
  const $ = s => document.querySelector(s);
  const lang = () => (window.clayCurrentLang ? window.clayCurrentLang() : 'vi') === 'en' ? 'en' : 'vi';
  const L = (vi, en) => (lang() === 'en' ? en : vi);
  const T = o => D.tl(o, lang());
  const IMG = f => '../assets/hc/' + f;
  const anh = (f, cls, w, h, lazy) => el('img', { src: IMG(f), alt: '', class: cls, width: String(w), height: String(h), loading: lazy ? 'lazy' : null, decoding: 'async' });
  const voice = () => window.DurianVoice;
  // Giọng thật của chị Hương: assets/voice/day-chuyen/{vi-v2,en-v2}/ – đủ 147 câu mỗi thứ tiếng, mọi chữ hiển thị trên trang
  // (kịch bản: docs/ghi-am/day-chuyen-sau-rieng-{vi,en}.md). Bộ 34 câu đầu tiên (vi/, en/) giữ nguyên trong kho.
  // Con số đổi theo lượt chơi (điểm, giá trị thanh trượt) và tệp nào tải hỏng thì đọc bằng giọng máy, nối tiếp trong cùng một lượt đọc.
  // Nút 🎙️ của durian-voice (khoá 'bizon-hcsr-voice') tắt cả hai.
  const GIONG = '../assets/voice/day-chuyen/';
  const THU_MUC = { vi: 'vi-v2', en: 'en-v2' };
  const coTep = (l, f) => !!f;
  const tatTieng = () => { try { return localStorage.getItem('bizon-hcsr-voice') === 'off'; } catch (e) { return false; } };
  let hangPhat = [], dangPhat = null;
  const im = () => {
    luot++; hangPhat = []; if (dangPhat) { try { dangPhat.pause(); } catch (e) { /* bỏ qua */ } dangPhat = null; }
    const v = voice(); if (v) v.stop();
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { /* bỏ qua */ }
  };
  // Đọc một câu bằng giọng máy rồi gọi xong() khi đọc hết (trình duyệt không đọc được thì gọi ngay).
  function noiRoi(text, xong) {
    const ss = window.speechSynthesis;
    if (!text || !ss || typeof SpeechSynthesisUtterance === 'undefined') { xong(); return; }
    const u = new SpeechSynthesisUtterance(String(text).replace(/[«»▶💡📚✅⚠️⛔]/g, ' '));
    u.lang = lang() === 'en' ? 'en-US' : 'vi-VN';
    let xg = false; const het = () => { if (!xg) { xg = true; xong(); } };
    u.onend = u.onerror = het;
    try { ss.speak(u); } catch (e) { het(); }
  }
  // Phát lần lượt các mục { f: tên tệp ghi âm, t: chữ }: có tệp thì phát tệp, chưa có tệp hay tệp hỏng thì đọc t bằng giọng máy.
  // Chuỗi trần là tên tệp không kèm chữ. Hết hàng thì gọi sau().
  let luot = 0;
  function phat(muc, sau) {
    im();
    if (tatTieng()) return;
    const l = lang(), id = ++luot;
    hangPhat = muc.filter(Boolean).map(m => (typeof m === 'string' ? { f: m } : m));
    const tiep = () => {
      if (id !== luot) return;
      const m = hangPhat.shift();
      if (!m) { dangPhat = null; if (sau) sau(); return; }
      const may = () => { if (id === luot) { dangPhat = null; noiRoi(m.t, tiep); } };
      if (!coTep(l, m.f)) { may(); return; }
      const a = new Audio(GIONG + THU_MUC[l] + '/' + m.f + '.mp3'); dangPhat = a;
      a.onended = () => { if (dangPhat === a) tiep(); };
      a.onerror = () => { if (dangPhat === a) may(); };
      try { const pr = a.play(); if (pr && pr.catch) pr.catch(() => { if (dangPhat === a) may(); }); } catch (e) { may(); }
    };
    tiep();
  }
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#durian-voice-btn')) setTimeout(() => { if (tatTieng()) im(); }, 0); });
  const el = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    for (const k in attrs || {}) {
      if (attrs[k] == null) continue;
      if (k === 'class') n.className = attrs[k];
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    for (const c of kids) if (c != null) n.append(c);
    return n;
  };
  const loa = (title, fn, cls) => el('button', { type: 'button', class: 'dc-loa' + (cls ? ' ' + cls : ''), title, 'aria-label': title, onclick: fn }, '🔊');
  const so2 = n => String(n).padStart(2, '0');
  const soTram = id => so2(D.THU_TU_KHO.indexOf(id) + 1);
  const chu = s => { const n = $(s); return n ? n.textContent.trim() : ''; };

  // Ô «Dữ kiện có nguồn»: đọc DurianData.facts + sources của Hộ Chiếu (không chép lại nội dung).
  function veDk(keys) {
    const DD = window.DurianData;
    if (!DD || !keys || !keys.length) return null;
    const l = lang(), src = l === 'en' ? Object.assign({}, DD.sources, DD.sourcesEn) : DD.sources;
    const li = keys.filter(k => DD.facts[k]).map(k => {
      const f = DD.facts[k], cau = (f.v ? f.v + ' · ' : '') + (l === 'en' ? f.en : f.vi), nguon = L('Nguồn: ', 'Source: ') + (src[f.src] || f.src);
      return el('li', null, cau + ' ', loa(L('Nghe dữ kiện này', 'Listen to this fact'), () => phat([{ f: 'du-kien-' + k, t: cau + ' ' + nguon }]), 'dc-loa-nho'), el('small', null, nguon));
    });
    if (!li.length) return null;
    return el('details', { class: 'dc-dk' }, el('summary', null, L('📚 Dữ kiện có nguồn (', '📚 Sourced facts (') + li.length + ')'), el('ul', null, ...li));
  }

  const TS0 = { chin: 70, gio: 30, nhiet: 25 };
  function moi() { return { don: 0, ketQua: [], day: [], ts: Object.assign({}, TS0), goiY: 0, xem: null }; }
  let S = moi();
  try { const s = JSON.parse(localStorage.getItem(KHOA)); if (s && Array.isArray(s.day) && s.ts) S = Object.assign(moi(), s); } catch (e) { /* trình duyệt chặn lưu */ }
  const luu = () => { try { localStorage.setItem(KHOA, JSON.stringify(S)); } catch (e) { /* bỏ qua */ } };
  const donHienTai = () => D.DON[S.don];
  let dangChay = false, ketQuaMo = null, goiYChu = '';
  const sao = n => '★'.repeat(n) + '☆'.repeat(3 - n);

  // ---- Vẽ ----
  function veTienDo() {
    const tp = $('#dc-tien-do'); tp.innerHTML = '';
    D.DON.forEach((d, i) => {
      const k = S.ketQua[i];
      tp.append(el('li', { class: 'dc-td' + (i === S.don ? ' dang' : '') },
        el('span', { 'aria-hidden': 'true' }, d.icon),
        el('span', null, L('Đơn ', 'Order ') + (i + 1)),
        el('b', null, k ? sao(k.sao) : (i === S.don ? L('đang làm', 'in progress') : '–'))));
    });
    $('#dc-tong-diem').textContent = S.ketQua.reduce((a, k) => a + k.tong, 0) + ' / ' + D.DON.length * 100;
  }

  function docDon() {
    const t = T(donHienTai());
    phat([{ f: 'don-' + (S.don + 1), t: t.ten + '. ' + t.khach + '. ' + t.tomTat + ' ' + L('Biến cố: ', 'Event: ') + t.bienCo }]);
  }
  function docTram(id) { const t = T(D.TRAM[id]); phat([{ f: 'tram-' + soTram(id) + '-' + id, t: t.ten + '. ' + t.mo }]); }
  function docTramNgan(id) { const t = T(D.TRAM[id]); phat([{ f: 'tram-ngan-' + soTram(id) + '-' + id, t: t.ten + ': ' + t.ngan + '.' }]); }
  function veDon() {
    const d = donHienTai(), t = T(d);
    const a = $('#dc-don-anh'); a.innerHTML = ''; a.append(anh(D.ANH.don[d.id], 'dc-don-img', 688, 384));
    $('#dc-don-so').textContent = L('Đơn ', 'Order ') + (S.don + 1) + ' / ' + D.DON.length;
    const h = $('#dc-don-ten'); h.textContent = t.ten + ' ';
    const b = loa(L('Nghe đơn hàng', 'Listen to the order'), docDon); if (b) h.append(b);
    $('#dc-don-khach').textContent = t.khach;
    $('#dc-don-tom').textContent = t.tomTat;
    $('#dc-don-bien').textContent = t.bienCo;
    const dk = $('#dc-don-dk'); dk.innerHTML = ''; const n = veDk(D.DU_KIEN.don[d.id]); if (n) dk.append(n);
  }

  function veKho() {
    const kho = $('#dc-kho'); kho.innerHTML = '';
    for (const id of D.THU_TU_KHO) {
      const t = T(D.TRAM[id]), da = S.day.includes(id);
      kho.append(el('button', { type: 'button', class: 'dc-tram' + (da ? ' da' : ''), 'aria-pressed': String(da), 'data-tram': id, disabled: dangChay ? '' : null,
        onclick: () => { if (da) bo(id); else them(id); } },
        anh(D.ANH[id].vat, 'dc-tram-img', 56, 56),
        el('span', { class: 'dc-tram-chu' }, el('b', null, t.ten), el('small', null, t.ngan))));
    }
  }

  function veDay() {
    const day = $('#dc-day'); day.innerHTML = '';
    if (!S.day.length) day.append(el('li', { class: 'dc-day-trong' }, L('Chưa có trạm nào. Bấm trạm trong kho bên trên theo đúng thứ tự trái đi qua.', 'No stations yet. Tap stations above in the order the fruit passes through.')));
    S.day.forEach((id, i) => {
      const t = T(D.TRAM[id]);
      day.append(el('li', { class: 'dc-o' + (S.xem === id ? ' xem' : ''), 'data-id': id },
        el('button', { type: 'button', class: 'dc-o-chinh', onclick: () => { S.xem = id; veDay(); veXem(); }, 'aria-label': L('Xem trạm ', 'View station ') + t.ten },
          el('span', { class: 'dc-o-so' }, String(i + 1)),
          anh(D.ANH[id].vat, 'dc-o-icon', 64, 64),
          el('span', { class: 'dc-o-ten' }, t.ten)),
        el('span', { class: 'dc-o-nut' },
          el('button', { type: 'button', 'aria-label': L('Đưa lên trước', 'Move earlier'), disabled: i === 0 || dangChay ? '' : null, onclick: () => doi(i, -1) }, '◀'),
          el('button', { type: 'button', 'aria-label': L('Tháo trạm', 'Remove station'), disabled: dangChay ? '' : null, onclick: () => bo(id) }, '✕'),
          el('button', { type: 'button', 'aria-label': L('Đưa ra sau', 'Move later'), disabled: i === S.day.length - 1 || dangChay ? '' : null, onclick: () => doi(i, 1) }, '▶'))));
    });
    $('#dc-chay').disabled = dangChay || S.day.length === 0;
  }

  function veXem() {
    const x = $('#dc-xem'); x.innerHTML = '';
    if (!S.xem) { x.append(el('p', { class: 'dc-nhat' }, L('Bấm một trạm trên dây chuyền để đọc trạm ấy làm gì.', 'Tap a station on the line to read what it does.'))); return; }
    const t = T(D.TRAM[S.xem]);
    x.append(anh(D.ANH[S.xem].canh, 'dc-xem-img', 688, 384, true), el('h3', null, t.ten + ' ', loa(L('Nghe trạm này', 'Listen to this station'), () => docTram(S.xem))), el('p', null, t.mo), veDk(D.DU_KIEN[S.xem]));
  }

  const NHAN = { chin: v => v + '%', gio: v => v + L(' giờ', ' h'), nhiet: v => v + ' °C' };
  function veThanh() { for (const k of ['chin', 'gio', 'nhiet']) { $('#dc-tt-' + k).value = S.ts[k]; $('#dc-gt-' + k).textContent = NHAN[k](S.ts[k]); } }

  const MUC_CHU = { tot: '✅', tam: '⚠️', hong: '⛔' };
  function veKetQua() {
    const k = $('#dc-ket-qua');
    if (!ketQuaMo) { k.hidden = true; k.innerHTML = ''; return; }
    const r = ketQuaMo, l = lang();
    k.hidden = false; k.innerHTML = ''; k.className = 'dc-ket-qua kq-' + r.ketQua;
    const rows = [[L('Thứ tự & đủ trạm', 'Order & stations'), r.diem.thuTu, D.DIEM.thuTu], [L('Độ già khi cắt', 'Maturity at cutting'), r.diem.chin, D.DIEM.chin],
      [L('Thời gian tới kho lạnh', 'Time to cold store'), r.diem.gio, D.DIEM.gio], [L('Nhiệt độ chuỗi lạnh', 'Cold-chain temperature'), r.diem.nhiet, D.DIEM.nhiet]];
    k.append(
      el('div', { class: 'dc-kq-dau' },
        el('h3', null, D.KET_QUA[l][r.ketQua] + ' ', loa(L('Nghe kết quả', 'Listen to the result'), () => docKetQua(r))),
        el('p', { class: 'dc-kq-sao', 'aria-label': r.sao + L(' trên 3 sao', ' of 3 stars') }, sao(r.sao)),
        el('p', { class: 'dc-kq-diem' }, el('b', null, String(r.tong)), L(' / 100 điểm', ' / 100 points')),
        r.ketQua === 'dat' ? anh('tool/con-dau-pass.webp', 'dc-kq-dau-img', 80, 80) : null),
      el('p', { class: 'dc-kq-nghe' }, loa(L('Nghe bảng điểm', 'Listen to the score table'), () => docBang(r)), ' ', L('Nghe bảng điểm', 'Listen to the score table')),
      el('table', { class: 'dc-kq-bang' }, el('tbody', null,
        ...rows.map(([a, b, c]) => el('tr', null, el('th', { scope: 'row' }, a), el('td', null, (Math.round(b * 10) / 10) + ' / ' + c))),
        r.diem.goiY ? el('tr', null, el('th', { scope: 'row' }, L('Gợi ý đã dùng', 'Hints used')), el('td', null, String(r.diem.goiY))) : null)),
      el('ul', { class: 'dc-kq-nx' }, ...r.nhanXet[l].map(n => el('li', { class: 'nx-' + n.muc }, el('span', { 'aria-hidden': 'true' }, MUC_CHU[n.muc] + ' '), n.text))),
      el('div', { class: 'dc-hang' },
        el('button', { type: 'button', class: 'clay-btn clay-btn-ghost dc-sua', onclick: () => { im(); ketQuaMo = null; veKetQua(); $('#dc-day').scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, L('Sửa rồi chạy lại', 'Fix and run again')),
        el('button', { type: 'button', class: 'clay-btn dc-chot', onclick: () => chot(r) }, S.don + 1 < D.DON.length ? L('Chốt đơn, sang đơn tiếp theo →', 'Close order, next one →') : L('Chốt đơn, xem tổng kết →', 'Close order, see summary →'))));
  }
  // Kết quả: câu kết quả lô, nhận xét thứ tự (từng lỗi thiếu, thừa, trùng trạm), lời giải thích từng thông số chưa tốt,
  // rồi hai nút để làm tiếp. Lỗi «A đặt trước B là ngược» dùng câu ghi âm chung «Thứ tự các trạm chưa đúng».
  function tepLoi(x) {
    const [loai, tram] = x.id.split(':');
    if (loai === 'thua' || loai === 'thieu') return 'loi-' + loai + '-' + soTram(tram) + '-' + tram;
    if (loai === 'trung') { const t = S.day.find((v, i) => S.day.indexOf(v) !== i); return t ? 'loi-trung-' + soTram(t) + '-' + t : null; }
    return 'nhan-xet-thu-tu-chua-dung';
  }
  function docKetQua(r) {
    const l = lang(), nx = r.nhanXet[l];
    const dongKhong = S.ts.nhiet < 0 && !S.day.includes('capDong');
    const tot = r.thuTu.dung && ['chin', 'gio', 'nhiet'].every(k => r.muc[k] === 'tot');
    const giaiThich = k => { const n = nx.find(x => x.nhom === k), gt = { f: 'giai-thich-don-' + (S.don + 1) + '-' + k, t: n ? n.text : '' };
      if (k !== 'nhiet' || !dongKhong) return [gt];
      // Nhiệt độ âm mà không có trạm cấp đông: câu cảnh báo riêng rồi lời giải thích nhiệt độ của đơn.
      return [{ f: 'nhan-xet-dong-khong-cap-dong', t: L('Đặt nhiệt độ âm mà dây chuyền không có trạm cấp đông: trái tươi đông đá dần trong container, vỏ thâm, cơm úng.', 'A below-zero setting with no freezing station: fresh fruit slowly freezes in the container, the husk blackens, the pulp goes soggy.') },
        { f: gt.f, t: T(donHienTai()).nhiet }]; };
    phat([
      { f: 'ket-qua-' + r.ketQua, t: D.KET_QUA[l][r.ketQua].replace(/^\S+\s/, '') + '.' },
      r.thuTu.dung ? { f: 'nhan-xet-dung-thu-tu', t: L('Dây chuyền đúng thứ tự, đủ trạm.', 'The line is complete and in the right order.') } : null,
      ...r.thuTu.loi.map(x => ({ f: tepLoi(x), t: x[l] })),
      ...['chin', 'gio', 'nhiet'].filter(k => r.muc[k] !== 'tot').flatMap(giaiThich),
      tot ? { f: 'moi-muc-deu-tot', t: L('Mọi mục đều tốt.', 'Everything is good.') } : null,
      { f: 'nut-sua-chay-lai', t: L('Sửa rồi chạy lại.', 'Fix and run again.') },
      S.don + 1 < D.DON.length ? { f: 'nut-chot-don-tiep', t: L('Chốt đơn, sang đơn tiếp theo.', 'Close order, next one.') } : { f: 'nut-chot-don-tong-ket', t: L('Chốt đơn, xem tổng kết.', 'Close order, see summary.') }
    ]);
  }
  // Bảng điểm: nhãn từng dòng bằng giọng thật, con số bằng giọng máy.
  function docBang(r) {
    const so = (a, b) => ({ t: (Math.round(a * 10) / 10) + L(' trên ', ' out of ') + b });
    phat([
      { f: 'bang-thu-tu', t: L('Thứ tự và đủ trạm.', 'Order and stations.') }, so(r.diem.thuTu, D.DIEM.thuTu),
      { f: 'bang-do-gia', t: L('Độ già khi cắt.', 'Maturity at cutting.') }, so(r.diem.chin, D.DIEM.chin),
      { f: 'bang-thoi-gian', t: L('Thời gian tới kho lạnh.', 'Time to cold store.') }, so(r.diem.gio, D.DIEM.gio),
      { f: 'bang-nhiet-do', t: L('Nhiệt độ chuỗi lạnh.', 'Cold-chain temperature.') }, so(r.diem.nhiet, D.DIEM.nhiet),
      r.diem.goiY ? { f: 'bang-goi-y', t: L('Gợi ý đã dùng.', 'Hints used.') } : null, r.diem.goiY ? { t: String(r.diem.goiY) } : null,
      { t: r.tong + L(' trên 100 điểm.', ' out of 100 points.') }
    ]);
  }
  const mucTong = () => { const tb = S.ketQua.reduce((a, k) => a + k.tong, 0) / D.DON.length; return tb >= 90 ? 'gioi' : tb >= 70 ? 'kha' : 'lam-lai'; };
  function docTong() {
    const tong = S.ketQua.reduce((a, k) => a + k.tong, 0);
    phat([{ f: 'tong-ket-tieu-de', t: L('Tổng kết ca làm. Bốn đơn hàng đã chốt.', 'Shift summary. All four orders closed.') },
      { f: 'trang-tong-diem', t: L('Tổng điểm:', 'Total score:') }, { t: tong + L(' trên ', ' out of ') + D.DON.length * 100 },
      { f: 'tong-ket-' + mucTong(), t: chu('#dc-tong-loi') },
      { f: 'nut-in-phieu', t: L('In phiếu, lưu PDF.', 'Print, save PDF.') }, { f: 'nut-choi-lai', t: L('Chơi lại.', 'Play again.') }]);
  }
  function docBangTong() {
    const l = lang();
    phat([{ f: 'tong-ket-cot-bang', t: L('Đơn. Kết quả. Sao. Điểm. Dây chuyền và thông số.', 'Order. Result. Stars. Score. Line and settings.') },
      ...S.ketQua.map((k, i) => ({ t: T(D.DON[i]).ten + '. ' + D.KET_QUA[l][k.ketQua].replace(/^\S+\s/, '') + '. ' + k.sao + L(' sao. ', ' stars. ') + k.tong + L(' điểm.', ' points.') }))]);
  }

  function veTong() {
    const l = lang(), tong = S.ketQua.reduce((a, k) => a + k.tong, 0);
    const b = $('#dc-tong-bang'); b.innerHTML = '';
    S.ketQua.forEach((k, i) => {
      const d = D.DON[i];
      b.append(el('tr', null, el('td', null, d.icon + ' ' + T(d).ten), el('td', null, D.KET_QUA[l][k.ketQua]), el('td', null, sao(k.sao)), el('td', null, String(k.tong)),
        el('td', { class: 'dc-nho' }, k.day.map(x => D.tenTram(x, l)).join(' → ') + ' · ' + k.ts.chin + '% · ' + NHAN.gio(k.ts.gio) + ' · ' + k.ts.nhiet + ' °C')));
    });
    $('#dc-tong-so').textContent = tong + ' / ' + D.DON.length * 100;
    const nut = $('#dc-tong-loa'); nut.innerHTML = ''; nut.append(loa(L('Nghe tổng kết', 'Listen to the summary'), docTong));
    const nb = $('#dc-tong-bang-loa'); if (nb) { nb.innerHTML = ''; nb.append(loa(L('Nghe bảng tổng kết', 'Listen to the summary table'), docBangTong), ' ' + L('Nghe bảng tổng kết', 'Listen to the summary table')); }
    const tb = tong / D.DON.length;
    $('#dc-tong-loi').textContent = tb >= 90 ? L('Quản đốc giỏi: dây chuyền nào cũng chạy đúng, lô nào cũng đạt.', 'Top line manager: every line ran right and every lot passed.')
      : tb >= 70 ? L('Khá: còn vài thông số lệch. Xem cột «Dây chuyền & thông số» để biết đơn nào cần làm lại.', 'Good: a few settings were off. Check the «Line & settings» column to see which order to redo.')
      : L('Cần làm lại: đọc lại nhận xét từng đơn, chú ý khác nhau giữa hàng tươi, hàng đông và hàng bán trong nước.', 'Needs another go: reread each order’s feedback and mind the difference between fresh, frozen and domestic goods.');
  }

  function veTatCa() {
    const xong = S.don >= D.DON.length;
    $('#dc-man-choi').hidden = xong; $('#dc-man-tong').hidden = !xong;
    veTienDo();
    if (xong) { veTong(); return; }
    veDon(); veKho(); veDay(); veXem(); veThanh(); veKetQua();
    $('#dc-goi-y-chu').textContent = goiYChu;
  }

  // ---- Thao tác ----
  const doiDay = () => { ketQuaMo = null; luu(); veKho(); veDay(); veXem(); veKetQua(); };
  function them(id) { if (dangChay || S.day.includes(id)) return; S.day.push(id); S.xem = id; doiDay(); docTramNgan(id); }
  function bo(id) { if (dangChay) return; S.day = S.day.filter(x => x !== id); if (S.xem === id) S.xem = null; doiDay(); }
  function doi(i, b) { const j = i + b; if (dangChay || j < 0 || j >= S.day.length) return; [S.day[i], S.day[j]] = [S.day[j], S.day[i]]; doiDay(); }

  // Tệp ghi âm của lời gợi ý: so đúng câu với các mẫu trong day-chuyen-sau-rieng-data.js (goiY).
  function tepGoiY(msg) {
    const l = lang();
    if (msg === L('Các trạm bắt buộc đã đủ và đúng thứ tự. Giờ chỉnh ba thanh thông số.', 'All required stations are in, in order. Now set the three sliders.')) return 'goi-y-du-roi';
    for (const id of D.THU_TU_KHO) {
      const ten = D.tenTram(id, l);
      if (msg === L('Trạm tiếp theo: «' + ten + '».', 'Next station: «' + ten + '».')) return 'goi-y-tiep-' + soTram(id) + '-' + id;
      if (msg === L('Bỏ «' + ten + '»: đơn này không cần trạm ấy.', 'Remove «' + ten + '»: this order does not need it.')) return 'goi-y-bo-' + soTram(id) + '-' + id;
    }
    return null;
  }
  function goiY() {
    S.goiY++; luu();
    const msg = D.goiY(donHienTai(), S.day, lang());
    goiYChu = '💡 ' + msg + L(' (đã dùng ' + S.goiY + ' gợi ý, mỗi gợi ý −' + D.DIEM.goiY + ' điểm)', ' (' + S.goiY + ' hint(s) used, −' + D.DIEM.goiY + ' points each)');
    $('#dc-goi-y-chu').textContent = goiYChu;
    phat([{ f: tepGoiY(msg), t: msg }]);
  }

  function chay() {
    if (dangChay || !S.day.length) return;
    im(); dangChay = true; ketQuaMo = null; veKetQua(); veKho(); veDay();
    const o = [...document.querySelectorAll('#dc-day .dc-o')];
    const giam = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let i = 0;
    const buoc = () => {
      o.forEach(n => n.classList.remove('chay'));
      if (i < o.length) { o[i].classList.add('chay', 'qua'); i++; setTimeout(buoc, giam ? 60 : 420); return; }
      dangChay = false;
      ketQuaMo = D.cham(donHienTai(), S.day, S.ts, S.goiY);
      veKho(); veDay(); veKetQua();
      $('#dc-ket-qua').scrollIntoView({ behavior: giam ? 'auto' : 'smooth', block: 'start' });
      docKetQua(ketQuaMo);
    };
    buoc();
  }

  function chot(r) {
    im();
    S.ketQua[S.don] = { id: donHienTai().id, tong: r.tong, sao: r.sao, ketQua: r.ketQua, day: S.day.slice(), ts: Object.assign({}, S.ts), goiY: S.goiY };
    S.don++; S.day = []; S.goiY = 0; S.xem = null; S.ts = Object.assign({}, TS0);
    ketQuaMo = null; goiYChu = '';
    luu(); veTatCa();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (S.don < D.DON.length) docDon(); else docTong();
  }

  // ---- Gắn sự kiện ----
  for (const k of ['chin', 'gio', 'nhiet']) {
    $('#dc-tt-' + k).addEventListener('input', e => { S.ts[k] = Number(e.target.value); $('#dc-gt-' + k).textContent = NHAN[k](S.ts[k]); ketQuaMo = null; veKetQua(); luu(); });
  }
  $('#dc-chay').addEventListener('click', chay);
  $('#dc-goi-y').addEventListener('click', goiY);
  $('#dc-tham-khao').addEventListener('click', () => { S.ts = D.thamKhao(donHienTai()); ketQuaMo = null; veKetQua(); luu(); veThanh(); });
  $('#dc-xoa').addEventListener('click', () => { if (dangChay) return; S.day = []; S.xem = null; doiDay(); });
  $('#dc-in').addEventListener('click', () => window.print());
  $('#dc-lai').addEventListener('click', () => {
    const hoi = L('Chơi lại từ đơn 1? Kết quả bốn đơn sẽ bị xoá.', 'Start again from order 1? The four results will be cleared.');
    phat([{ f: 'hoi-choi-lai', t: hoi }]);
    if (!confirm(hoi)) { im(); return; }
    im(); S = moi(); ketQuaMo = null; goiYChu = ''; luu(); veTatCa();
  });
  { const m = $('#dc-mo-dau'); if (m) m.append(loa(L('Nghe lời mở đầu', 'Listen to the introduction'), () => phat([{ f: 'trang-tieu-de', t: chu('.dc-hero h1') }, { f: 'mo-dau', t: chu('.dc-hero .lead') }]))); }
  // 🔊 ở góc mỗi mục: đọc tiêu đề, lời hướng dẫn, nhãn thanh trượt (kèm giá trị đang chọn bằng giọng máy) và các nút.
  const MUC = {
    'dc-h-kho': () => [{ f: 'trang-muc-1', t: chu('#dc-h-kho') }, { f: 'trang-muc-1-huong-dan', t: chu('#dc-h-kho + .dc-muc-phu') }],
    'dc-h-day': () => [{ f: 'trang-muc-2', t: chu('#dc-h-day') }, { f: 'trang-muc-2-huong-dan', t: chu('#dc-h-day + .dc-muc-phu') },
      S.day.length ? null : { f: 'trang-day-trong', t: chu('.dc-day-trong') }, S.xem ? null : { f: 'trang-chon-tram', t: chu('#dc-xem .dc-nhat') }],
    'dc-h-ts': () => [{ f: 'trang-muc-3', t: chu('#dc-h-ts') },
      ...[['chin', 'do-gia'], ['gio', 'gio'], ['nhiet', 'nhiet']].flatMap(([k, f]) => [{ f: 'thanh-' + f, t: chu('label[for="dc-tt-' + k + '"] span') }, { t: chu('#dc-gt-' + k) },
        { f: 'thanh-' + f + '-chu-thich', t: chu('#dc-tt-' + k + ' + small') }]),
      { f: 'nut-chay', t: chu('#dc-chay') }, { f: 'nut-goi-y', t: chu('#dc-goi-y') }, { f: 'nut-tham-khao', t: chu('#dc-tham-khao') }, { f: 'nut-thao-het', t: chu('#dc-xoa') }],
    'dc-h-chu-y': () => [{ f: 'chu-y-tieu-de', t: chu('#dc-h-chu-y') }, ...[...document.querySelectorAll('.dc-chu-y li')].map((li, i) => ({ f: 'chu-y-' + (i + 1), t: li.textContent.trim() }))]
  };
  for (const id in MUC) {
    const h = document.getElementById(id); if (!h || !h.parentNode) continue;
    const ten = { 'dc-h-kho': ['Nghe hướng dẫn kho trạm', 'Listen: station store'], 'dc-h-day': ['Nghe hướng dẫn dây chuyền', 'Listen: your line'],
      'dc-h-ts': ['Nghe phần thông số', 'Listen: settings'], 'dc-h-chu-y': ['Nghe phần lưu ý số liệu', 'Listen: notes on the numbers'] }[id];
    const b = el('button', { type: 'button', class: 'dc-loa dc-loa-goc', 'data-muc': id, onclick: () => phat(MUC[id]()) }, '🔊');
    const nhan = () => { const v = ten[lang() === 'en' ? 1 : 0]; b.title = v; b.setAttribute('aria-label', v); };
    nhan(); window.addEventListener('bizon:langchange', nhan);
    h.parentNode.classList.add('dc-co-loa'); h.parentNode.append(b);
  }
  window.addEventListener('bizon:langchange', () => { im(); veTatCa(); });
  veTatCa();
  window.DayChuyen = { state: () => S };
})();
