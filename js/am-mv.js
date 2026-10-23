/* BizOn – MV trên Kho Âm nhạc: chỉ ảnh bìa (lưu trên trang) + nút ▶. Trình phát YouTube
 * (youtube-nocookie.com) chỉ tải khi người xem bấm, để lúc mở trang không tải mã hay cookie
 * của bên thứ ba (cam kết ở chinh-sach.html). Bấm phát thì dừng nhạc đang chạy trên bàn xoay. */
(function () {
  document.querySelectorAll('[data-yt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.dispatchEvent(new CustomEvent('bizon:mv-play'));
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(btn.getAttribute('data-yt')) + '?autoplay=1&rel=0&playsinline=1';
      f.title = btn.getAttribute('aria-label') || 'Video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
      btn.replaceWith(f);
    }, { once: true });
  });
})();
