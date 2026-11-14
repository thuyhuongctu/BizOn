/* Video hai thứ tiếng (dùng chung): video vẽ tay CHAM «Hòa vốn sau năm tháng» (cham/tham-dinh.html, 14/11/2026) và
 * Bến Phù Sa «Thứ không treo lên sào được» (ben-phu-sa-3d.html, 14/11/2026).
 * Mỗi video có bản lời đọc tiếng Việt và tiếng Anh (giọng tác giả Đỗ Thùy Hương). Khách chọn tiếng Anh thì phát bản tiếng Anh.
 * Video ghi sẵn data-vi-src / data-en-src, data-vi-poster / data-en-poster; tệp này đổi nguồn theo ngôn ngữ, cả khi khách đổi
 * ngôn ngữ giữa chừng (sự kiện bizon:langchange của bizon-clay-i18n.js). Không tải trước (preload="none"). */
(function () {
  'use strict';
  function lang() {
    var s = null; try { s = localStorage.getItem('bizon-lang'); } catch (e) {}
    var l = s === 'en' || s === 'vi' ? s : (window.__bizonLang || document.documentElement.lang || 'vi');
    return l === 'en' ? 'en' : 'vi';
  }
  function apply(l) {
    document.querySelectorAll('video[data-en-src]').forEach(function (v) {
      var src = v.getAttribute('data-' + l + '-src'), poster = v.getAttribute('data-' + l + '-poster'), s = v.querySelector('source');
      if (v.hasAttribute('data-en-aria')) {                    // nhãn đọc màn hình theo ngôn ngữ (trang không tự đổi aria)
        if (!v.hasAttribute('data-vi-aria')) v.setAttribute('data-vi-aria', v.getAttribute('aria-label') || '');
        v.setAttribute('aria-label', v.getAttribute('data-' + l + '-aria'));
      }
      if (!s || s.getAttribute('src') === src) return;
      var dangChay = !v.paused;
      if (dangChay) v.pause();
      s.setAttribute('src', src);
      if (poster) v.setAttribute('poster', poster);
      v.setAttribute('data-lang', l);
      v.load();
    });
  }
  function init() { apply(lang()); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('bizon:langchange', function (e) { var l = e && e.detail && e.detail.lang; apply(l === 'en' || l === 'vi' ? l : lang()); });
})();
