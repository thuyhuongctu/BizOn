/* CHAM – trang tổng hợp: thêm mã QR mở đúng bản ngôn ngữ đang xem (?lang=vi|en) cho mỗi thẻ.
 * Địa chỉ lấy từ chính trang đang mở, nên mã đúng cả trên bizonland.com lẫn bản chạy thử. */
(function () {
  'use strict';
  const K = window.ChamKit;
  K.mount(() => {
    if (typeof window.qrcode !== 'function' || !/^https?:$/.test(location.protocol)) return;
    const lang = K.lang();
    document.querySelectorAll('.hub-card[data-href]').forEach(card => {
      const url = new URL(card.dataset.href, location.href);
      url.search = '?lang=' + lang;
      let box = card.querySelector('.hub-qr');
      if (!box) { box = document.createElement('div'); box.className = 'hub-qr'; card.insertBefore(box, card.querySelector('.ch-row')); }
      let src = '';
      try { const q = window.qrcode(0, 'M'); q.addData(url.href); q.make(); src = q.createDataURL(4, 8); } catch (e) { box.remove(); return; }
      box.innerHTML = '<img alt="" src="' + src + '"><span>' + K.esc(K.t({ vi: 'Quét để mở bản tiếng Việt', en: 'Scan to open in English' })) + '</span>';
      box.querySelector('img').alt = K.t({ vi: 'Mã QR: ', en: 'QR code: ' }) + card.querySelector('h3').textContent;
    });
  });
})();
