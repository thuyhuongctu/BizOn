/* BizOn – ngôn ngữ mặc định của site là tiếng Anh.
   Nạp sớm trong <head>, trước mọi script khác đọc localStorage 'bizon-lang':
   - Khách chưa chọn ngôn ngữ → đặt 'en' và đánh dấu "tự động".
   - ?lang=vi hoặc ?lang=en trên URL → ghi nhận như lựa chọn của người dùng.
   - Khi đang ở tiếng Anh tự động → hiện gợi ý nhỏ «Xem bằng tiếng Việt?»
     (tắt được, không hiện lại sau khi đã chọn hoặc đã đóng). */
(function () {
  var K = 'bizon-lang', AUTO = 'bizon-lang-auto', OFF = 'bizon-lang-hint-off', ls;
  try { ls = window.localStorage; ls.getItem(K); } catch (e) { return; }
  try {
    var q = (location.search.match(/[?&]lang=(en|vi)(?:&|$)/) || [])[1];
    if (q) { ls.setItem(K, q); ls.removeItem(AUTO); }
    else if (ls.getItem(K) !== 'en' && ls.getItem(K) !== 'vi') { ls.setItem(K, 'en'); ls.setItem(AUTO, '1'); }
    else if (ls.getItem(K) !== 'en') ls.removeItem(AUTO);
  } catch (e) { return; }

  function hint() {
    try {
      if (window.top !== window || ls.getItem(K) !== 'en' || ls.getItem(AUTO) !== '1' || ls.getItem(OFF) === '1') return;
    } catch (e) { return; }
    if (document.getElementById('bz-lang-hint')) return;
    // chỉ nhắc ở 2 lần mở trang đầu, mỗi lần tự ẩn sau 15 giây để không che nút của trang
    var seen = 0; try { seen = +ls.getItem('bizon-lang-hint-n') || 0; ls.setItem('bizon-lang-hint-n', String(seen + 1)); } catch (e) {}
    if (seen >= 2) return;
    var st = document.createElement('style');
    st.textContent = '#bz-lang-hint{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:2147483000;display:flex;align-items:center;gap:8px;max-width:calc(100vw - 24px);box-sizing:border-box;padding:8px 8px 8px 14px;border-radius:999px;background:#fffbf4;color:#033337;font:600 13px/1.3 "Be Vietnam Pro",system-ui,sans-serif;box-shadow:inset 0 -3px 0 rgba(110,70,30,.12),0 10px 24px -10px rgba(3,51,55,.45);animation:bzLh .35s ease both}' +
      '#bz-lang-hint button{font:inherit;cursor:pointer;border:0;border-radius:999px}' +
      '#bz-lang-hint .go{padding:7px 12px;background:#006687;color:#fff;font-weight:800}' +
      '#bz-lang-hint .go:focus-visible,#bz-lang-hint .x:focus-visible{outline:3px solid #fda127;outline-offset:2px}' +
      '#bz-lang-hint .x{width:30px;height:30px;background:transparent;color:#3e5a5c;font-size:18px;line-height:1}' +
      '@keyframes bzLh{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}' +
      '@media (prefers-reduced-motion:reduce){#bz-lang-hint{animation:none}}' +
      '@media print{#bz-lang-hint{display:none}}';
    var box = document.createElement('div');
    box.id = 'bz-lang-hint'; box.setAttribute('role', 'region'); box.setAttribute('aria-label', 'Language suggestion');
    box.setAttribute('lang', 'vi');
    box.innerHTML = '<span>🇻🇳 Xem bằng tiếng Việt?</span><button type="button" class="go">Tiếng Việt</button><button type="button" class="x" aria-label="Đóng gợi ý · Dismiss">×</button>';
    box.querySelector('.go').onclick = function () {
      try { ls.setItem(K, 'vi'); ls.removeItem(AUTO); } catch (e) {}
      location.reload();
    };
    box.querySelector('.x').onclick = function () {
      try { ls.setItem(OFF, '1'); } catch (e) {}
      box.remove();
    };
    document.head.appendChild(st); document.body.appendChild(box);
    setTimeout(function () { if (box.isConnected) box.remove(); }, 15000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(hint, 900); });
  else setTimeout(hint, 900);
})();
