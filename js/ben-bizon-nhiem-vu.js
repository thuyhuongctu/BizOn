/* BizOn – Bến BizOn: bảng nhiệm vụ (đặc tả specs/003-ben-bizon-nhiem-vu, câu chuyện 1).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Nhiệm vụ «Làm quen Bến BizOn»: 5 việc tích ô (chị duyệt ngày 11/11/2026), «việc tiếp theo», tiến độ x/5, nút «Dẫn đường»
 * (dùng lối tắt «Đi tới…» có sẵn) và nút thu gọn. Việc được tích ngay khi hành động của nó xảy ra, không cần theo thứ tự.
 * Tiến độ chỉ lưu trên máy (localStorage), không gửi đi đâu. Tệp này không biết gì về three.js: js/ben-bizon.js báo sự kiện
 * qua bao({ loai, noi }) và truyền hàm dẫn đường vào.
 * Câu chuyện 3: nhiệm vụ thứ hai «Một vòng quanh bến» (6 việc, loại 'cau-hoi': trả lời đúng câu hỏi nhanh ở mỗi điểm game)
 * chỉ mở sau khi «Làm quen» xong.
 * Ý tưởng cơ chế (danh sách việc tích ô, «việc tiếp theo») học từ một game khám phá thành phố 3D chị gửi làm tham khảo;
 * không chép giao diện, tên hay hình.
 */
const KHOA = 'bizon-ben-nhiem-vu';

// loai: 'thoai' (mở hội thoại), 'gan' (thẻ của điểm hiện ra), 'xem' (mở bảng), 'vao' (bấm «Vào»)
export const NHIEM_VU = [{
  id: 'lam-quen',
  ten: { vi: 'Làm quen Bến BizOn', en: 'Get to know BizOn Wharf' },
  viec: [
    { id: 'hoi-lumina', noi: 'lumina', khi: ['thoai'], nhan: { vi: 'Hỏi đường Lumina', en: 'Ask Lumina the way' } },
    { id: 'doc-bang-tin', noi: 'bang-tin', khi: ['thoai'], nhan: { vi: 'Đọc Bảng tin', en: 'Read the notice board' } },
    { id: 'ghe-hanh-trinh', noi: 'hanh-trinh', khi: ['gan', 'vao'], url: 'hanh-trinh.html', nhan: { vi: 'Ghé Hành trình 3 bậc', en: 'Stop by the 3-tier journey' } },
    { id: 'hoi-thay-tu', noi: 'thay-tu', khi: ['thoai'], nhan: { vi: 'Hỏi thầy Tu Phan game dựng trên mô hình nào', en: 'Ask Thầy Tu Phan which models the games are built on' } },
    { id: 'xem-thanh-tich', noi: 'thanh-tich', khi: ['xem'], nhan: { vi: 'Xem Bảng thành tích', en: 'Look at the achievement board' } },
  ],
  chuc: { vi: '🎉 Bạn đã làm quen xong Bến BizOn! Bước tiếp theo: Bậc 1, Bến Phù Sa.', en: '🎉 You know your way around BizOn Wharf! Next step: Tier 1, Bến Phù Sa.' },
  tiep: { noi: 'ben-phu-sa', nhan: { vi: '🛶 Tới Bến Phù Sa', en: '🛶 Go to Bến Phù Sa' } },
}, {
  id: 'vong-quanh',
  ten: { vi: 'Một vòng quanh bến', en: 'A lap around the wharf' },
  viec: [
    { id: 'cau-ben-phu-sa', noi: 'ben-phu-sa', khi: ['cau-hoi'], nhan: { vi: 'Câu hỏi nhanh: Bến Phù Sa', en: 'Quick quiz: Bến Phù Sa' } },
    { id: 'cau-bat-nghiep', noi: 'bat-nghiep', khi: ['cau-hoi'], nhan: { vi: 'Câu hỏi nhanh: Bật Nghiệp', en: 'Quick quiz: Bật Nghiệp' } },
    { id: 'cau-hc-thuong-hieu', noi: 'hc-thuong-hieu', khi: ['cau-hoi'], nhan: { vi: 'Câu hỏi nhanh: Hộ Chiếu Thương Hiệu', en: 'Quick quiz: Brand Passport' } },
    { id: 'cau-hc-sau-rieng', noi: 'hc-sau-rieng', khi: ['cau-hoi'], nhan: { vi: 'Câu hỏi nhanh: Hộ Chiếu Sầu Riêng', en: 'Quick quiz: Durian Passport' } },
    { id: 'cau-arcade', noi: 'arcade', khi: ['cau-hoi'], nhan: { vi: 'Câu hỏi nhanh: BizOn Arcade', en: 'Quick quiz: BizOn Arcade' } },
    { id: 'cau-hanh-trinh', noi: 'hanh-trinh', khi: ['cau-hoi'], nhan: { vi: 'Câu hỏi nhanh: Hành trình 3 bậc', en: 'Quick quiz: The 3-tier journey' } },
  ],
  chuc: { vi: '🎉 Bạn đã đi một vòng quanh bến! Chọn game đúng bậc của buổi học rồi bấm «Vào».', en: '🎉 You have done a lap of the wharf! Pick the game for today\'s tier and press «Enter».' },
}];

const CHU = {
  nhiemVu: { vi: 'Nhiệm vụ', en: 'Quest' }, tiepTheo: { vi: 'Tiếp theo:', en: 'Next:' }, danDuong: { vi: '🧭 Dẫn đường', en: '🧭 Guide me' },
  gon: { vi: 'Thu gọn bảng nhiệm vụ', en: 'Collapse the quest panel' }, mo: { vi: 'Mở bảng nhiệm vụ', en: 'Open the quest panel' },
  daXong: { vi: 'Đã xong', en: 'Done' }, vuaXong: { vi: 'Đã xong: ', en: 'Done: ' }, dong: { vi: 'Đóng', en: 'Close' },
};

function docLuu() { try { const v = JSON.parse(localStorage.getItem(KHOA) || 'null'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } }
function ghiLuu(v) { try { localStorage.setItem(KHOA, JSON.stringify(v)); } catch (e) {} }

/* host: phần tử <section id="bb-nv">; L(v): chọn chữ VI/EN; goTo(noi): đưa người chơi tới một điểm; daGhe(): danh sách trang đã ghé */
export function taoNhiemVu({ host, L, goTo, daGhe }) {
  const cu = docLuu(), moiViec = NHIEM_VU.flatMap(n => n.viec);
  const xong = new Set((Array.isArray(cu.xong) ? cu.xong : []).filter(id => moiViec.some(v => v.id === id)));
  // daChuc: các nhiệm vụ đã đóng lời chúc (bản cũ lưu true/false cho riêng «Làm quen»)
  const daChuc = new Set(Array.isArray(cu.daChuc) ? cu.daChuc : cu.daChuc ? ['lam-quen'] : []);
  let gon = !!cu.gon, tamMo = false;
  // việc gắn với một trang đã ghé từ trước (dữ liệu «đã ghé» có sẵn của Bảng thành tích) thì tính luôn
  try { const g = daGhe() || []; moiViec.forEach(v => { if (v.url && g.indexOf(v.url) !== -1) xong.add(v.id); }); } catch (e) {}
  const luu = () => ghiLuu({ xong: [...xong], gon, daChuc: [...daChuc] });
  luu();

  host.innerHTML = '<div class="nv-dau"><p class="nv-ten"><b id="bb-nv-ten"></b> <span id="bb-nv-tien"></span></p>' +
    '<button type="button" id="bb-nv-gon" aria-controls="bb-nv-than"></button></div>' +
    '<div id="bb-nv-than"><p id="bb-nv-tiep-theo"></p><ul id="bb-nv-ds"></ul><p id="bb-nv-chuc" hidden></p>' +
    '<div class="nv-nut"><button type="button" id="bb-nv-dan"></button><button type="button" id="bb-nv-tiep" hidden></button></div></div>' +
    '<p id="bb-nv-bao" class="nv-an" aria-live="polite"></p>';
  const $ = id => host.querySelector('#' + id);
  const thap = () => window.innerHeight < 420;
  const xongNv = n => n.viec.every(v => xong.has(v.id));
  // nhiệm vụ thứ i mở khi mọi nhiệm vụ trước nó đã xong
  const daMo = n => NHIEM_VU.slice(0, NHIEM_VU.indexOf(n)).every(xongNv);
  // nhiệm vụ đang hiện: nhiệm vụ đã xong mà chưa đóng lời chúc; nếu không thì nhiệm vụ đầu tiên chưa xong; hết thì nhiệm vụ cuối
  const dangHien = () => NHIEM_VU.find(n => xongNv(n) && !daChuc.has(n.id)) || NHIEM_VU.find(n => !xongNv(n)) || NHIEM_VU[NHIEM_VU.length - 1];
  const tiepTheo = n => n.viec.find(x => !xong.has(x.id)) || null;
  const gonThat = () => (gon || (thap() && !tamMo));

  function ve() {
    const nv = dangHien(), xg = xongNv(nv), tt = xg ? null : tiepTheo(nv), g = gonThat(), chucMo = xg && !daChuc.has(nv.id);
    const soXong = nv.viec.filter(v => xong.has(v.id)).length;
    $('bb-nv-ten').textContent = xg ? L(CHU.daXong) + ' · ' + L(nv.ten) : L(nv.ten);
    $('bb-nv-tien').textContent = soXong + '/' + nv.viec.length;
    $('bb-nv-tiep-theo').textContent = tt ? L(CHU.tiepTheo) + ' ' + L(tt.nhan) : '';
    $('bb-nv-tiep-theo').hidden = !tt;
    const ds = $('bb-nv-ds'); ds.innerHTML = '';
    nv.viec.forEach(v => { const li = document.createElement('li'); li.className = xong.has(v.id) ? 'xong' : ''; li.textContent = (xong.has(v.id) ? '✅ ' : '⬜ ') + L(v.nhan); ds.appendChild(li); });
    ds.hidden = xg;   // xong cả nhiệm vụ thì không cần danh sách nữa
    $('bb-nv-chuc').hidden = !chucMo; $('bb-nv-chuc').textContent = L(nv.chuc);
    $('bb-nv-tiep').hidden = !chucMo; $('bb-nv-tiep').textContent = nv.tiep ? L(nv.tiep.nhan) : L(CHU.dong);
    $('bb-nv-dan').hidden = !tt; $('bb-nv-dan').textContent = L(CHU.danDuong);
    $('bb-nv-than').hidden = g || (xg && !chucMo);
    const nut = $('bb-nv-gon'); nut.textContent = g ? '▸' : '▾';
    nut.setAttribute('aria-expanded', g ? 'false' : 'true'); nut.setAttribute('aria-label', L(g ? CHU.mo : CHU.gon)); nut.title = L(g ? CHU.mo : CHU.gon);
    host.setAttribute('aria-label', L(CHU.nhiemVu) + ': ' + L(nv.ten) + ' ' + soXong + '/' + nv.viec.length);
    host.classList.toggle('gon', g); host.classList.toggle('da-xong', xg && !chucMo);
  }

  $('bb-nv-gon').addEventListener('click', () => { if (thap() && !gon) tamMo = !tamMo; else { gon = !gon; tamMo = !gon; luu(); } ve(); });
  $('bb-nv-dan').addEventListener('click', () => { const tt = tiepTheo(dangHien()); if (tt) goTo(tt.noi); });
  $('bb-nv-tiep').addEventListener('click', () => { const nv = dangHien(); daChuc.add(nv.id); luu(); ve(); if (nv.tiep) goTo(nv.tiep.noi); });
  const doiCo = () => ve(); window.addEventListener('resize', doiCo);
  ve();

  return {
    bao(sk) {
      if (!sk || !sk.noi) return false;
      const nv = NHIEM_VU.find(n => daMo(n) && n.viec.some(x => x.noi === sk.noi && x.khi.indexOf(sk.loai) !== -1 && !xong.has(x.id)));
      if (!nv) return false;
      const v = nv.viec.find(x => x.noi === sk.noi && x.khi.indexOf(sk.loai) !== -1 && !xong.has(x.id));
      xong.add(v.id); luu(); ve();
      const soXong = nv.viec.filter(x => xong.has(x.id)).length;
      $('bb-nv-bao').textContent = L(CHU.vuaXong) + L(v.nhan) + ' (' + soXong + '/' + nv.viec.length + ')';
      return true;
    },
    // câu hỏi nhanh (câu chuyện 3) chỉ mở khi nhiệm vụ «Một vòng quanh bến» đã mở
    moCauHoi: () => daMo(NHIEM_VU[1]),
    state() {
      const nv = dangHien(), tt = tiepTheo(nv);
      return { dangTheo: nv.id, xong: [...xong], tong: nv.viec.length, tiepTheo: tt ? tt.id : null, hoanThanh: xongNv(nv), gon: gonThat(),
        moVongQuanh: daMo(NHIEM_VU[1]), xongHet: NHIEM_VU.every(xongNv) };
    },
    lamMoiChu: ve,
    dispose() { window.removeEventListener('resize', doiCo); host.innerHTML = ''; },
  };
}
