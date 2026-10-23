/* ============================================================================
   BizOn Clay – i18n song ngữ tự chứa (VI/EN) cho các trang bản đất sét.
   Không phụ thuộc site-ui.js. Dùng thuộc tính data-en* ngay trên phần tử:
     data-en          → đổi textContent
     data-en-html     → đổi innerHTML (dùng cho đoạn có <b>/<a>…)
     data-en-ph       → đổi placeholder
     data-en-aria     → đổi aria-label
     data-en-content  → đổi content của <meta> (vd meta description)
     <title data-en>  → đổi tiêu đề tab (title không có thẻ con nên dùng data-en như chữ thường)
   Ngôn ngữ lưu ở localStorage['bizon-lang'] (dùng chung toàn site), CHỈ khi
   người dùng tự bấm chọn (clayApplyLang / clayToggleLang). Khách chưa chọn thì
   dùng mặc định của trang: EN cho trang web, VI cho trang khai báo
   <html data-default-lang="vi"> (game, trang làm việc của giảng viên) – mặc
   định này KHÔNG được lưu, vì game đọc chung khoá và phải giữ VI cho sinh viên.
   Script khác cần ngôn ngữ thì gọi window.clayCurrentLang(), đừng đọc thẳng khoá.
   Phát sự kiện 'bizon:langchange' để script khác (nav) đồng bộ nút VI/EN.
   ========================================================================== */
(function(){
  if(window.__bizonClayI18n) return; window.__bizonClayI18n = true;

  var KEY = 'bizon-lang';
  function saved(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
  function store(v){ try{ localStorage.setItem(KEY, v); }catch(e){} }
  function pageDefault(){ return document.documentElement.getAttribute('data-default-lang') === 'vi' ? 'vi' : 'en'; }
  function initial(){ var s = saved(); return s === 'en' || s === 'vi' ? s : pageDefault(); }

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

  /* persist: true khi người dùng tự chọn; dịch lại phần tử mới bơm thì không lưu */
  function apply(lang, persist){
    lang = lang === 'en' ? 'en' : 'vi';
    document.querySelectorAll('[data-en]').forEach(function(el){ swapText(el, lang); });
    document.querySelectorAll('[data-en-html]').forEach(function(el){ swapHtml(el, lang); });
    document.querySelectorAll('[data-en-ph]').forEach(function(el){ swapAttr(el, 'placeholder', 'viPh', el.dataset.enPh, lang); });
    document.querySelectorAll('[data-en-aria]').forEach(function(el){ swapAttr(el, 'aria-label', 'viAria', el.dataset.enAria, lang); });
    document.querySelectorAll('meta[data-en-content]').forEach(function(el){ swapAttr(el, 'content', 'viContent', el.dataset.enContent, lang); });
    document.querySelectorAll('img[data-en-src]').forEach(function(el){ swapAttr(el, 'src', 'viSrc', el.dataset.enSrc, lang); });
    document.documentElement.lang = lang;
    if(persist) store(lang);
    window.__bizonLang = lang;
    document.documentElement.classList.remove('clay-lang-wait'); /* bizon-boot.js tạm ẩn body chờ bước này */
    try{ window.dispatchEvent(new CustomEvent('bizon:langchange', { detail:{ lang:lang } })); }catch(e){}
  }

  function current(){ return window.__bizonLang || initial(); }

  window.clayApplyLang = function(lang){ apply(lang, true); };
  window.clayCurrentLang = current;
  window.clayToggleLang = function(){ apply(current() === 'en' ? 'vi' : 'en', true); };
  /* Dịch lại theo ngôn ngữ hiện tại (sau khi nav/footer bơm phần tử mới), không lưu */
  window.clayRefreshLang = function(){ apply(current(), false); };

  function init(){ apply(current(), false); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* Đăng ký service worker để trang đất sét vẫn chạy offline (idempotent). Đường dẫn tính từ
     chính tệp này (js/) để trang trong thư mục con cũng đăng ký đúng sw.js ở gốc. */
  if('serviceWorker' in navigator){
    var me = document.currentScript && document.currentScript.src;
    var swUrl = me ? new URL('../sw.js', me).href : 'sw.js';
    var swOpts = me ? { scope: new URL('../', me).href, updateViaCache:'none' } : { updateViaCache:'none' };
    window.addEventListener('load', function(){
      navigator.serviceWorker.register(swUrl, swOpts).catch(function(){});
    });
    /* Bản mới tiếp quản → chỉ hiện thanh «Tải lại», không tự tải lại (giống js/site-ui.js;
       cờ chung để trang nạp cả hai tệp chỉ gắn một lần). */
    if(!window.__bizonSwUpdateBar){
      window.__bizonSwUpdateBar = true;
      var hadCtl = !!navigator.serviceWorker.controller, barShown = false;
      navigator.serviceWorker.addEventListener('controllerchange', function(){
        if(!hadCtl || barShown || !document.body || document.getElementById('bizon-update-bar')) return;
        barShown = true;
        var en = current() === 'en';
        var bar = document.createElement('div');
        bar.id = 'bizon-update-bar';
        bar.setAttribute('role', 'status');
        bar.style.cssText = 'position:fixed;left:16px;right:16px;margin:0 auto;bottom:calc(76px + env(safe-area-inset-bottom,0px));z-index:2147483000;display:flex;align-items:center;gap:10px;max-width:520px;box-sizing:border-box;padding:8px 8px 8px 18px;border-radius:999px;background:#033337;color:#fff;font:600 14px/1.3 system-ui,sans-serif;box-shadow:0 10px 28px rgba(0,0,0,.3)';
        var msg = document.createElement('span');
        msg.style.cssText = 'flex:1;min-width:0';
        msg.textContent = en ? 'A new version of BizOn is ready.' : 'Đã có bản mới của BizOn.';
        var go = document.createElement('button');
        go.type = 'button'; go.textContent = en ? 'Reload' : 'Tải lại';
        go.style.cssText = 'border:0;border-radius:999px;padding:10px 16px;min-height:44px;background:#fda127;color:#033337;font:800 14px system-ui,sans-serif;cursor:pointer;flex:none';
        go.onclick = function(){ location.reload(); };
        var x = document.createElement('button');
        x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label', en ? 'Later' : 'Để sau');
        x.style.cssText = 'border:0;background:transparent;color:#fff;font:700 20px system-ui,sans-serif;min-width:44px;min-height:44px;cursor:pointer';
        x.onclick = function(){ bar.remove(); };
        bar.append(msg, go, x);
        document.body.appendChild(bar);
      });
    }
  }
})();
