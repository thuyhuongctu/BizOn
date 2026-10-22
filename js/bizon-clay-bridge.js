/* ============================================================================
   BizOn Clay – cầu nối cho trang cũ đã chuyển sang menu/chân trang đất sét.
   Nút VI/EN của #clay-nav gọi bizon-clay-i18n.js; trang cũ còn bộ dịch riêng
   (assets/js/shell.js → window.setLang, js/site-ui.js → window.applyLang) cho
   các đoạn có thẻ con hoặc dịch theo từ điển. Tệp này nghe 'bizon:langchange'
   và gọi bộ dịch cũ (và ngược lại) để hai bên luôn cùng một ngôn ngữ.
   Nạp ngay SAU bizon-clay-i18n.js (trước nav/footer).
   ========================================================================== */
(function(){
  if(window.__bizonClayBridge) return; window.__bizonClayBridge = true;
  var busy = false;
  /* Trang tự dựng giao diện theo ngôn ngữ lúc nạp (các Lab): đặt
     window.BIZON_LANG_RELOAD = true trước tệp này → đổi VI/EN trên menu thì tải lại trang. */
  var startLang = null;
  try{ startLang = localStorage.getItem('bizon-lang'); }catch(err){}
  var userPick = false;
  document.addEventListener('click', function(e){
    if(e.target && e.target.closest && e.target.closest('#clay-nav .cn-lang button')) userPick = true;
  }, true);
  window.addEventListener('bizon:langchange', function(e){
    if(busy) return;
    var lang = e && e.detail && e.detail.lang === 'en' ? 'en' : 'vi';
    /* Tài liệu có bản riêng cho từng ngôn ngữ: window.BIZON_LANG_ALT = { en:'…html' } → người dùng bấm VI/EN trên menu thì mở bản kia */
    var alt = window.BIZON_LANG_ALT;
    if(alt && alt[lang] && userPick){ busy = true; location.href = alt[lang]; return; }
    if(window.BIZON_LANG_RELOAD){ if(startLang && lang !== startLang){ busy = true; location.reload(); } return; }
    busy = true;
    try{
      /* đổi từ nút cũ (vd VI/EN trong dock ⋯ → site-ui) thì kéo bộ dịch đất sét theo */
      if(typeof window.clayApplyLang === 'function' && window.__bizonLang && window.__bizonLang !== lang) window.clayApplyLang(lang);
      if(typeof window.setLang === 'function') window.setLang(lang);
      else if(typeof window.applyLang === 'function') window.applyLang(lang);
    }catch(err){}
    busy = false;
  });
})();
