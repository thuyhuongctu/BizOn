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
  window.addEventListener('bizon:langchange', function(e){
    if(busy) return;
    var lang = e && e.detail && e.detail.lang === 'en' ? 'en' : 'vi';
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
