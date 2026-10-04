/* ============================================================================
   BizOn Clay — i18n song ngữ tự chứa (VI/EN) cho các trang bản đất sét.
   Không phụ thuộc site-ui.js. Dùng thuộc tính data-en* ngay trên phần tử:
     data-en          → đổi textContent
     data-en-html     → đổi innerHTML (dùng cho đoạn có <b>/<a>…)
     data-en-ph       → đổi placeholder
     data-en-aria     → đổi aria-label
   Ngôn ngữ lưu ở localStorage['bizon-lang'] (dùng chung toàn site).
   Phát sự kiện 'bizon:langchange' để script khác (nav) đồng bộ nút VI/EN.
   ========================================================================== */
(function(){
  if(window.__bizonClayI18n) return; window.__bizonClayI18n = true;

  var KEY = 'bizon-lang';
  function saved(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
  function store(v){ try{ localStorage.setItem(KEY, v); }catch(e){} }

  function swapText(el, lang){
    /* An toàn: bỏ qua phần tử có con là thẻ (đặt data-en nhầm trên vùng chứa
       sẽ xoá mất các con như <input>). Dùng data-en-html cho vùng có thẻ con. */
    if(el.children.length) return;
    if(el.dataset.vi == null) el.dataset.vi = el.textContent;
    el.textContent = lang === 'en' ? el.dataset.en : el.dataset.vi;
  }
  function swapHtml(el, lang){
    if(el.dataset.viHtml == null) el.dataset.viHtml = el.innerHTML;
    el.innerHTML = lang === 'en' ? el.dataset.enHtml : el.dataset.viHtml;
  }
  function swapAttr(el, attr, viKey, enVal, lang){
    if(el.dataset[viKey] == null) el.dataset[viKey] = el.getAttribute(attr) || '';
    el.setAttribute(attr, lang === 'en' ? enVal : el.dataset[viKey]);
  }

  function apply(lang){
    lang = lang === 'en' ? 'en' : 'vi';
    document.querySelectorAll('[data-en]').forEach(function(el){ swapText(el, lang); });
    document.querySelectorAll('[data-en-html]').forEach(function(el){ swapHtml(el, lang); });
    document.querySelectorAll('[data-en-ph]').forEach(function(el){ swapAttr(el, 'placeholder', 'viPh', el.dataset.enPh, lang); });
    document.querySelectorAll('[data-en-aria]').forEach(function(el){ swapAttr(el, 'aria-label', 'viAria', el.dataset.enAria, lang); });
    document.documentElement.lang = lang;
    store(lang);
    window.__bizonLang = lang;
    try{ window.dispatchEvent(new CustomEvent('bizon:langchange', { detail:{ lang:lang } })); }catch(e){}
  }

  function current(){ return window.__bizonLang || (saved() === 'en' ? 'en' : 'vi'); }

  window.clayApplyLang = apply;
  window.clayCurrentLang = current;
  window.clayToggleLang = function(){ apply(current() === 'en' ? 'vi' : 'en'); };

  function init(){ apply(saved() === 'en' ? 'en' : 'vi'); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* Đăng ký service worker để trang đất sét vẫn chạy offline (idempotent). */
  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('sw.js', { updateViaCache:'none' }).catch(function(){});
    });
  }
})();
