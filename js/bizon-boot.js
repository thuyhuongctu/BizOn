/* ============================================================================
   BizOn Clay – khởi động sớm cho các trang web đất sét (KHÔNG nạp trên game).
   Nạp ĐỒNG BỘ trong <head>, trước css/bizon-clay.css, để không nháy:
   1) Sáng/tối: localStorage['bizon-theme'] ('light'/'dark') nếu người dùng đã
      bấm chọn, không thì theo prefers-color-scheme của máy. Đặt
      <html data-theme="light|dark">. Chỉ LƯU khi người dùng bấm nút ☀️/🌙.
   2) Ngôn ngữ: khách chưa có localStorage['bizon-lang'] thì dùng mặc định của
      trang (EN; game ghi <html data-default-lang="vi">). Chữ gốc trong HTML là
      VI nên khi sẽ ra EN thì đặt sẵn lang="en" và tạm ẩn chữ trong <body> (class
      clay-lang-wait) tới khi bizon-clay-i18n.js dịch xong. Hạn chót an toàn
      1,5 giây: i18n lỗi hay không tải được thì chữ vẫn hiện.
   ========================================================================== */
(function(){
  if(window.__bizonBoot) return; window.__bizonBoot = true;
  var root = document.documentElement;
  function get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function set(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }

  /* ---------- Sáng / tối ---------- */
  var TKEY = 'bizon-theme';
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function chosen(){ var t = get(TKEY); return t === 'dark' || t === 'light' ? t : null; }
  function systemTheme(){ return mq && mq.matches ? 'dark' : 'light'; }
  function paint(t){
    root.setAttribute('data-theme', t);
    try{ window.dispatchEvent(new CustomEvent('bizon:themechange', { detail:{ theme:t } })); }catch(e){}
  }
  window.clayCurrentTheme = function(){ return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; };
  /* Người dùng bấm chọn: áp dụng và lưu (từ đó không theo máy nữa) */
  window.clayApplyTheme = function(t){ t = t === 'dark' ? 'dark' : 'light'; set(TKEY, t); paint(t); };
  window.clayToggleTheme = function(){ window.clayApplyTheme(window.clayCurrentTheme() === 'dark' ? 'light' : 'dark'); };
  root.setAttribute('data-theme', chosen() || systemTheme());
  /* Chưa chọn thì đổi theo máy ngay khi máy đổi chế độ */
  if(mq){
    var onSys = function(){ if(!chosen()) paint(systemTheme()); };
    if(mq.addEventListener) mq.addEventListener('change', onSys); else if(mq.addListener) mq.addListener(onSys);
  }

  /* ---------- Ngôn ngữ (cùng quy tắc với bizon-clay-i18n.js) ---------- */
  var l = get('bizon-lang');
  if(l !== 'en' && l !== 'vi') l = root.getAttribute('data-default-lang') === 'vi' ? 'vi' : 'en';
  if(l === 'en'){
    root.lang = 'en';
    root.classList.add('clay-lang-wait');
    setTimeout(function(){
      root.classList.remove('clay-lang-wait');
      if(!window.__bizonLang) root.lang = 'vi'; /* i18n chưa chạy: chữ vẫn là VI gốc */
    }, 1500);
  }
})();
