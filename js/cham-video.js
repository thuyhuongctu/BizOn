/* CHAM – video vẽ tay khổ dọc «Hòa vốn sau năm tháng» (14/11/2026).
 * Hai bản lời đọc (giọng tác giả Đỗ Thùy Hương): tiếng Việt và tiếng Anh. Khách chọn tiếng Anh thì phát bản tiếng Anh.
 * Video ghi sẵn data-vi-src / data-en-src, data-vi-poster / data-en-poster; tệp này đổi nguồn theo ngôn ngữ, cả khi khách đổi
 * ngôn ngữ giữa chừng (sự kiện bizon:langchange của bizon-clay-i18n.js). Không tải trước (preload="none"). */
(function () {
  'use strict';
  function lang() {
    var l = window.__bizonLang || document.documentElement.lang || 'vi';
    try { var s = localStorage.getItem('bizon-lang'); if (!window.__bizonLang && (s === 'en' || s === 'vi')) l = s; } catch (e) {}
    return l === 'en' ? 'en' : 'vi';
  }
  function apply(l) {
    document.querySelectorAll('video[data-en-src]').forEach(function (v) {
      var src = v.getAttribute('data-' + l + '-src'), poster = v.getAttribute('data-' + l + '-poster'), s = v.querySelector('source');
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
  window.addEventListener('bizon:langchange', function (e) { apply(e && e.detail && e.detail.lang === 'en' ? 'en' : 'vi'); });
})();
