/* BizOn Hộ Chiếu – lớp «dấu ấn»: lễ đóng dấu, Kim Long xuất hiện, thẻ nhiệm vụ, Hỏi thầy Tú, lồng tiếng.
 * Chỉ đọc window.__bp.S (ghi duy nhất cờ S.flags.askTu); không sửa luật chơi.
 * Giọng: Web Speech API (speechSynthesis) đọc trực tiếp text từ window.__HC_VOICE (ho-chieu-voice.js/-2.js,
 * nạp trước file này) — không có file mp3 ghi âm thật, trình duyệt không hỗ trợ speechSynthesis thì im lặng.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var B = function () { return window.__bp; }, S = function () { return B() && B().S; }, $ = function (id) { return document.getElementById(id); };
  var EN = function () { return (document.documentElement.lang || '').indexOf('en') === 0 || (function () { try { return localStorage.getItem('bizon-lang') === 'en'; } catch (e) { return false; } })(); };
  var T = function (vi, en) { return EN() ? en : vi; };
  var dec = function (v) { var s = (+v || 0).toFixed(1); return EN() ? s : s.replace('.', ','); };
  var TY = function () { return T(' tỷ', ' bn'); };

  // ---------- CSS ----------
  var css = document.createElement('style');
  css.textContent = [
    '.sg-ov{position:fixed;inset:0;z-index:9000;background:rgba(3,51,55,.82);display:grid;place-items:center;padding:16px;animation:sgFade .25s ease}',
    '@keyframes sgFade{from{opacity:0}to{opacity:1}}',
    '@keyframes sgStamp{0%{transform:scale(2.6) rotate(-24deg);opacity:0}55%{transform:scale(.92) rotate(-9deg);opacity:1}72%{transform:scale(1.05) rotate(-11deg)}100%{transform:scale(1) rotate(-10deg)}}',
    '@keyframes sgInk{0%{opacity:0;transform:scale(.4)}60%{opacity:.35}100%{opacity:0;transform:scale(1.6)}}',
    '@keyframes sgRise{from{transform:translateY(18px);opacity:0}to{transform:none;opacity:1}}',
    '.sg-page{position:relative;width:min(92vw,520px);background:#fbf5e6;border-radius:18px;padding:26px 26px 20px;box-shadow:0 30px 80px rgba(0,0,0,.4);color:#033337;font-family:Manrope,system-ui,sans-serif;background-image:repeating-linear-gradient(0deg,transparent 0 27px,rgba(0,102,135,.06) 27px 28px)}',
    '.sg-page h3{margin:0;font:800 20px/1.25 "Plus Jakarta Sans",sans-serif}',
    '.sg-eb{font:700 10.5px "Plus Jakarta Sans",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#b8561b}',
    '.sg-stamp{width:190px;height:190px;margin:18px auto 12px;border-radius:50%;border:6px double currentColor;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;text-align:center;animation:sgStamp .7s cubic-bezier(.2,1.4,.4,1) both;font:800 13px/1.15 "Plus Jakarta Sans",sans-serif;text-transform:uppercase;letter-spacing:.05em;position:relative}',
    '.sg-stamp .f{font-size:42px;line-height:1}.sg-stamp .d{font-size:10.5px;opacity:.8}',
    '.sg-ink{position:absolute;inset:-20px;border-radius:50%;background:currentColor;animation:sgInk .8s ease-out .35s both;pointer-events:none}',
    '.sg-q{margin:6px 0 0;font-size:14px;line-height:1.55;animation:sgRise .4s ease .6s both}',
    '.sg-btn{margin-top:16px;width:100%;padding:12px;border:0;border-radius:12px;background:#fda127;color:#033337;font:800 15px "Plus Jakarta Sans",sans-serif;cursor:pointer}',
    '.sg-kl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}',
    '.sg-kl div{background:#fff;border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:2px}.sg-kl b{font:800 20px "Plus Jakarta Sans",sans-serif}',
    '#sg-voice{position:fixed;right:14px;bottom:14px;z-index:800;width:46px;height:46px;border-radius:50%;border:0;background:#033337;color:#fff;font-size:20px;cursor:pointer;position:fixed;box-shadow:0 8px 24px rgba(0,0,0,.25)}',
    '#sg-asktu{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:0 0 12px;padding:10px 14px;border-radius:14px;background:#fff6ea;border:1.5px dashed #fda127;font:13px Manrope,sans-serif;color:#033337}',
    '#sg-asktu button{padding:8px 14px;border:0;border-radius:10px;background:#033337;color:#fff;font-weight:800;cursor:pointer}',
  ].join('\n');
  document.head.appendChild(css);

  // ---------- Giọng ----------
  var muted = false; try { muted = localStorage.getItem('bizon-bp-voice') === 'off'; } catch (e) {}
  var HC_LINES = {};
  (function () {
    var V = window.__HC_VOICE;
    if (!V || !V.groups) return;
    V.groups.forEach(function (g) { g.rows.forEach(function (r) { HC_LINES[r[0]] = { vi: r[1], en: r[2] }; }); });
  })();
  var canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  var speaking = false, queue = [];
  function play(code) {
    if (muted || !code || !canSpeak) return;
    var line = HC_LINES[code]; if (!line) return;
    queue.push(line); if (!speaking) next();
  }
  function next() {
    var line = queue.shift(); if (!line) { speaking = false; return; }
    speaking = true;
    var u = new SpeechSynthesisUtterance(T(line.vi, line.en));
    u.lang = EN() ? 'en-US' : 'vi-VN';
    u.onend = u.onerror = next;
    try { window.speechSynthesis.speak(u); } catch (e) { next(); }
  }
  function stopVoice() { queue = []; speaking = false; if (canSpeak) { try { window.speechSynthesis.cancel(); } catch (e) {} } }
  var vb = document.createElement('button'); vb.id = 'sg-voice'; vb.type = 'button';
  var paintVb = function () { vb.innerHTML = '🎙️' + (muted ? '<i style="position:absolute;left:10px;right:10px;top:22px;height:2.5px;background:#ff8a7a;transform:rotate(-40deg)"></i>' : ''); vb.title = T(muted ? 'Bật lồng tiếng nhân vật' : 'Tắt lồng tiếng nhân vật', muted ? 'Character voices on' : 'Character voices off'); vb.setAttribute('aria-label', vb.title); };
  vb.onclick = function () { muted = !muted; try { localStorage.setItem('bizon-bp-voice', muted ? 'off' : 'on'); } catch (e) {} if (muted) stopVoice(); paintVb(); };
  paintVb(); document.body.appendChild(vb);
  window.BPVoice = { play: play, stop: stopVoice };


  // ---------- Ảnh mới (assets/hc/…): có file thì dùng, thiếu thì giữ giao diện cũ ----------
  var IMGC = {};
  function img(path, cb) {
    var k = IMGC[path]; if (k === true) return cb('assets/hc/' + path); if (k === false) return; if (k) { k.push(cb); return; }
    IMGC[path] = [cb]; var im = new Image();
    im.onload = function () { var q = IMGC[path]; IMGC[path] = true; q.forEach(function (f) { f('assets/hc/' + path); }); };
    im.onerror = function () { IMGC[path] = false; };
    im.src = 'assets/hc/' + path;
  }
  var MODE_IMG = ['digital', 'export', 'alliance', 'licensing', 'jv', 'fdi'];
  var FIRM_SLUG = ['moc-nhien', 'phu-sa', 'lam-viet', 'mekong-digital'], FIRM_PROD = ['moc-nhien-dau-goi', 'phu-sa-banh-phong-tom', 'lam-viet-ao-linen', 'mekong-digital-laptop'];
  var CAST_SLUG = { 'Bà Sáu Lành': 'ba-sau-lanh', 'Minh Khang': 'minh-khang', 'An Nhiên': 'an-nhien', 'Thầy Tú Phan': 'tu-phan', 'Lina Park': 'lina-park', 'Lumina AI': 'lumina' };
  function fillImg(sel, path, style) { img(path, function (src) { var el = document.querySelector(sel); if (el) el.innerHTML = '<img src="' + src + '" alt="" style="' + style + '">'; }); }
  function hostCode(m) { var b = B(); try { return b.hostOf ? b.hostOf(m)[0] : ''; } catch (e) { return ''; } }
  window.BPImg = img;

  // ---------- Lớp phủ ----------
  var busy = false, pending = [];
  function overlay(html, onClose) {
    if (busy) { pending.push([html, onClose]); return; }
    busy = true;
    var o = document.createElement('div'); o.className = 'sg-ov'; o.innerHTML = '<div class="sg-page">' + html + '<button class="sg-btn" type="button">' + T('Tiếp tục', 'Continue') + ' →</button></div>';
    var close = function () { o.remove(); busy = false; if (onClose) onClose(); var p = pending.shift(); if (p) overlay(p[0], p[1]); };
    o.querySelector('.sg-btn').onclick = close;
    o.addEventListener('click', function (e) { if (e.target === o) close(); });
    document.body.appendChild(o);
  }

  // 1. Lễ đóng dấu
  var INK = ['#0f8f8b', '#c7811d', '#c0446a', '#6a4fc4', '#3f8a44', '#c0443a'];
  var LINE = [
    ['Thị trường đã mở cửa. Gian hàng trực tuyến chạy rồi – vào nhanh, lời mỏng, nhớ theo dõi đánh giá.', 'The market is open. Your online store is live – fast entry, thin margins, keep an eye on reviews.'],
    ['Container đầu tiên đã rời cảng. Xuất khẩu trực tiếp: mình tự kiểm soát giá và kênh.', 'The first container has left port. Direct export: we control price and channel.'],
    ['Bắt tay xong với đối tác địa phương. Mạng lưới của họ, sản phẩm của mình.', 'Deal done with a local partner. Their network, our product.'],
    ['Hợp đồng cấp phép đã ký. Tốn ít vốn, nhưng thương hiệu nằm trong tay đối tác – phải kiểm tra chất lượng.', 'Licence signed. Little capital, but the brand is in the partner’s hands – check quality.'],
    ['Liên doanh chính thức ra đời. Chia vốn, chia lời, và học thị trường nhanh hơn mỗi quý.', 'The joint venture is official. Shared capital, shared profit, faster learning every quarter.'],
    ['Nhà máy trăm phần trăm vốn đã khánh thành. Kiểm soát tối đa, rủi ro cũng tối đa.', 'Your wholly owned plant is open. Maximum control, maximum risk.'],
  ];
  function stamp(m, mode) {
    var b = B(), mk = b.MKTS[m], md = b.MODES[mode] || b.MODES[0], s = S(), real = mk.real || {};
    var n = s.entered.filter(function (v) { return v !== null && v !== undefined; }).length;
    var cc = hostCode(m); setTimeout(function () { img('mode/' + MODE_IMG[mode] + '.webp', function (src) { var el = $('sg-scene'); if (el) { el.style.height = '150px'; el.innerHTML = '<img src="' + src + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block">'; var pr = $('sg-prod'); if (pr) pr.style.top = '118px'; } }); img('stamp/' + cc + '.png', function (src) { var el = document.querySelector('.sg-stamp'); if (el) { el.style.border = '0'; el.innerHTML = '<img src="' + src + '" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain">'; img('stamp/mode-' + (mode + 1) + '.png', function (s2) { el.insertAdjacentHTML('beforeend', '<img src="' + s2 + '" alt="" style="position:absolute;inset:-8%;width:116%;height:116%;object-fit:contain">'); }); } }); fillImg('#sg-prod', 'prod/' + FIRM_PROD[s.firm | 0] + '.png', 'width:100%;height:100%;object-fit:contain'); }, 0);
    overlay('<div id="sg-scene" style="margin:-26px -26px 14px;height:0;overflow:hidden;border-radius:18px 18px 0 0"></div><div id="sg-prod" style="position:absolute;right:18px;top:18px;width:78px;height:78px"></div><span class="sg-eb">🛂 ' + T('Hộ chiếu thương hiệu · trang ', 'Brand passport · page ') + n + '</span>' +
      '<h3>' + (real.flag ? real.flag + ' ' : '') + mk.name + (real.c ? ' · ' + T(real.c, real.cEn) : '') + '</h3>' +
      '<div class="sg-stamp" style="color:' + INK[mode % 6] + '"><i class="sg-ink"></i><span class="f">' + md.icon + '</span>' + T(md.name, md.nameEn) + '<span class="d">' + T('Quý ', 'Q') + (s.q + 1) + ' · ' + new Date().getFullYear() + '</span></div>' +
      '<p class="sg-q"><b>Lina Park:</b> «' + T(LINE[mode][0], LINE[mode][1]) + '»</p>');
    stopVoice(); play('HC_LP_' + (10 + mode)); play('HC_NAR_20');
  }

  // 2. Kim Long
  var KL = {
    1: ['HC_KL_01', 'Kim Long chào đồng hương. Thế giới rộng lắm, nhưng thị phần thì có hạn đấy.', 'Kim Long greets a fellow countryman. The world is big, but market share is limited.'],
    3: ['HC_KL_02', 'Chúng tôi đã có mặt ở ba thị trường. Các bạn vẫn còn đang mua báo cáo à?', 'We’re already in three markets. Still buying reports?'],
    5: ['HC_KL_03', 'Quý cuối rồi. Để xem ai mới là thương hiệu đi xa nhất.', 'Final quarter. Let’s see whose brand travels furthest.'],
  };
  function kimLong(q) {
    var k = KL[q], s = S(); if (!k) return;
    var you = s.entered.filter(function (v) { return v !== null && v !== undefined; }).length, them = (s.rival.in || []).length;
    overlay('<span class="sg-eb">⚔️ ' + T('Đối thủ xuất hiện · Quý ', 'Rival appears · Q') + (q + 1) + '</span>' +
      '<div id="sg-kl-tower" style="margin:-26px -26px 12px;height:0;overflow:hidden;border-radius:18px 18px 0 0"></div><div style="display:flex;gap:12px;align-items:center"><div id="sg-kl-ceo" style="width:0;height:84px;flex:none"></div><h3>Kim Long Exports</h3></div><p class="sg-q" style="animation-delay:.1s"><b>CEO Kim Long:</b> «' + T(k[1], k[2]) + '»</p>' +
      '<div class="sg-kl"><div><span style="font-size:11px;opacity:.7">' + T('Bạn', 'You') + '</span><b>' + you + ' ' + T('thị trường', 'markets') + '</b><span style="font-size:12px">' + T('Lợi nhuận ', 'Profit ') + dec(s.profit) + TY() + '</span></div>' +
      '<div style="background:#fde8e4"><span style="font-size:11px;opacity:.7">Kim Long</span><b>' + them + ' ' + T('thị trường', 'markets') + '</b><span style="font-size:12px">' + T('Doanh số ', 'Sales ') + dec(s.rival.rev) + TY() + '</span></div></div>');
    play(k[0]);
    img('hq/kim-long-tower.webp', function (src) { var el = $('sg-kl-tower'); if (el) { el.style.height = '130px'; el.innerHTML = '<img src="' + src + '" alt="" style="width:100%;height:100%;object-fit:cover">'; } });
    img('cast/kim-long-ceo.png', function (src) { var el = $('sg-kl-ceo'); if (el) { el.style.width = '84px'; el.innerHTML = '<img src="' + src + '" alt="CEO Kim Long" style="width:100%;height:100%;object-fit:contain">'; } });
  }

  function cnt(s) { return s.entered.filter(function (v) { return v !== null && v !== undefined; }).length; }
  window.addEventListener('bp3d-quest', function () { play('HC_NAR_41'); });
  // 3. Hỏi thầy Tú (1 lần/ván)
  function riskiest() {
    var s = S(), b = B(), sel = s.sel;
    if (sel.enter != null) {
      var m = sel.enter, k = s.know[m], hi = b.homeInfo ? b.homeInfo(m) : { cd: 0, free: true };
      if (k < 40) return T('Em định cam kết vốn vào ' + b.MKTS[m].name + ' khi tri thức mới ' + Math.round(k) + '/100. Theo mô hình Uppsala, nên mua thêm thông tin trước.', 'You plan to commit capital to ' + b.MKTS[m].name + ' with only ' + Math.round(k) + '/100 knowledge. Uppsala says learn first.');
      if (!hi.free && (sel.enterMode === 1)) return T('Xuất khẩu vào ' + b.MKTS[m].name + ' không có FTA: thuế sẽ ăn vào biên lời. Cân nhắc liên doanh hoặc FDI để né thuế quan.', 'Exporting to ' + b.MKTS[m].name + ' without an FTA: tariffs eat your margin. Consider a JV or FDI.');
      if (hi.cd > 2.5 && sel.enterMode === 5) return T('FDI 100% vốn vào một thị trường xa về văn hoá là cam kết rủi ro nhất. Liên doanh giúp học nhanh hơn.', 'Wholly owned FDI in a culturally distant market is the riskiest commitment. A JV learns faster.');
    }
    if (s.cash < 2.5) return T('Tiền mặt chỉ còn ' + dec(s.cash) + ' tỷ. Rủi ro lớn nhất là thiếu thanh khoản: hạ ngân sách quý này.', 'Only ' + dec(s.cash) + ' bn cash left. The biggest risk is liquidity: lower this quarter’s budget.');
    if (cnt(s) <= 1 && s.q >= 2) return T('Em mới có mặt ở ' + cnt(s) + ' thị trường. Tập trung quá hẹp khiến một cú sốc có thể kéo cả doanh nghiệp đi xuống.', 'You’re in only ' + cnt(s) + ' market. Too narrow a focus means one shock can sink the firm.');
    return T('Thầy chưa thấy quyết định nào quá rủi ro. Hãy kiểm tra khoảng cách văn hoá và hiệp định thương mại trước khi chốt.', 'No decision looks too risky. Check cultural distance and trade agreements before locking in.');
  }
  function askBox() {
    var s = S(), st = $('bp-stage'); if (!s || !st || s.phase !== 'dec') return;
    var box = $('sg-asktu'); if (s.flags.askTu) { if (box) box.remove(); return; }
    if (box) return;
    box = document.createElement('div'); box.id = 'sg-asktu';
    box.innerHTML = '<span>🎓 <b>' + T('Hỏi thầy Tú', 'Ask Prof. Tú') + '</b> · ' + T('chỉ dùng được 1 lần mỗi ván', 'one use per game') + '</span><button type="button">' + T('Hỏi ngay', 'Ask now') + '</button>';
    box.querySelector('button').onclick = function () {
      s.flags.askTu = true; box.remove();
      overlay('<span class="sg-eb">🎓 ' + T('Gợi ý của thầy Tú Phan', 'A hint from Prof. Tú Phan') + '</span><h3>' + T('Quyết định rủi ro nhất lúc này', 'Your riskiest decision right now') + '</h3><p class="sg-q" style="animation-delay:.05s">' + riskiest() + '</p><p class="sg-q" style="font-size:12px;opacity:.75;animation-delay:.15s">' + T('Chi phí giao dịch: kiểm soát càng cao thì cam kết vốn càng lớn (Anderson & Gatignon, 1986).', 'Transaction costs: more control means more committed capital (Anderson & Gatignon, 1986).') + '</p>');
      play('HC_TP_30'); play('HC_TP_31');
      img('cast/tu-phan-lo.png', function (src) { var h = document.querySelector('.sg-page h3'); if (h) h.insertAdjacentHTML('beforebegin', '<img src="' + src + '" alt="Thầy Tú Phan" style="float:right;width:92px;height:92px;object-fit:contain;margin:0 0 6px 10px">'); });
    };
    st.insertAdjacentElement('afterbegin', box);
  }


  // 4. Chân dung chiến lược (5 kiểu) + 5. Hộ chiếu in được
  var PORT = {
    explorer: ['🧭', ['Nhà thám hiểm thận trọng', 'The cautious explorer'], ['Bạn đi từng bước: mua tri thức trước, chọn phương thức cam kết thấp rồi mới mở rộng. Đúng tinh thần mô hình Uppsala.', 'You moved step by step: learning first, low-commitment modes, then expansion. Textbook Uppsala.'], 'Johanson, J., & Vahlne, J.-E. (1977). The internationalization process of the firm. Journal of International Business Studies, 8(1), 23–32.'],
    conqueror: ['⚔️', ['Người chinh phục', 'The conqueror'], ['Bạn mở rộng nhanh và cam kết cao ở nhiều thị trường. Lợi thế đi trước lớn, nhưng rủi ro thanh khoản và khoảng cách chênh lệch về trình độ phát triển kinh tế xã hội cũng lớn.', 'You expanded fast with high commitment in many markets. Big first-mover gains, but big liquidity and psychic-distance risks.'], 'Anderson, E., & Gatignon, H. (1986). Modes of foreign entry. Journal of International Business Studies, 17(3), 1–26.'],
    architect: ['🤝', ['Kiến trúc sư đối tác', 'The partnership architect'], ['Bạn dựa vào liên minh, cấp phép và liên doanh: mượn mạng lưới và tri thức địa phương, đổi lại chia bớt lợi nhuận và kiểm soát.', 'You relied on alliances, licensing and JVs: borrowing local networks and knowledge in exchange for some profit and control.'], 'Contractor, F. J., & Lorange, P. (2002). The growth of alliances in the knowledge-based economy. International Business Review, 11(4), 485–502.'],
    investor: ['🌱', ['Nhà đầu tư dài hạn', 'The long-term investor'], ['Bạn giữ uy tín và hồ sơ bền vững cao, chấp nhận lời chậm để xây thương hiệu bền. Phù hợp các thị trường khó tính.', 'You kept reputation and sustainability high, accepting slower profit to build a lasting brand. It suits demanding markets.'], 'Porter, M. E., & Kramer, M. R. (2011). Creating shared value. Harvard Business Review, 89(1/2), 62–77.'],
    gambler: ['🎲', ['Tay chơi liều', 'The risk taker'], ['Bạn cam kết vốn khi tiền mặt hoặc tri thức còn mỏng và đã có quý âm tiền. Lần sau hãy thử «học trước, cam kết sau».', 'You committed capital while cash or knowledge was thin, and hit negative-cash quarters. Next time, try “learn first, commit later”.'], 'Johanson, J., & Vahlne, J.-E. (2009). The Uppsala internationalization process model revisited. Journal of International Business Studies, 40(9), 1411–1431.'],
  };
  function portraitKey() {
    var s = S(), sc = B().scores(), modes = s.entered.filter(function (v) { return v !== null && v !== undefined; }), n = modes.length;
    var partner = modes.filter(function (v) { return v === 2 || v === 3 || v === 4; }).length, high = modes.filter(function (v) { return v >= 4 || v === 1; }).length;
    if ((s.negQ || 0) >= 1 && sc.total < 65) return 'gambler';
    if (n >= 4 || (high >= 2 && n >= 3)) return 'conqueror';
    if (n && partner / n >= 0.5) return 'architect';
    if (sc.s >= 65 && sc.r >= 60) return 'investor';
    return 'explorer';
  }
  function stampsData() {
    var s = S(), b = B();
    return s.entered.map(function (v, m) { if (v === null || v === undefined) return null; var mk = b.MKTS[m], md = b.MODES[v], r = mk.real || {};
      var cc = hostCode(m); return { m: m, simg: IMGC['stamp/' + cc + '.png'] === true ? new URL('assets/hc/stamp/' + cc + '.png', location.href).href : '', flag: r.flag || mk.icon, name: mk.name, c: r.c ? T(r.c, r.cEn) : '', icon: md.icon, mode: T(md.name, md.nameEn), q: Math.max(1, s.q - (s.qin[m] || 1) + 2), ink: INK[v % 6] }; }).filter(Boolean);
  }
  function printPassport() {
    var s = S(), b = B(), sc = b.scores(), P = PORT[portraitKey()], f = b.FIRMS[s.firm] || {}, hm = b.HOME ? b.HOME() : { flag: '', c: '' };
    var name = ''; try { name = localStorage.getItem('bizon-bp-player') || localStorage.getItem('bizon-player-name') || ''; } catch (e) {}
    var st = stampsData();
    var page = function (inner) { return '<section class="pg">' + inner + '</section>'; };
    var html = '<!doctype html><html lang="' + (EN() ? 'en' : 'vi') + '"><head><meta charset="utf-8"><title>' + T('Hộ chiếu thương hiệu', 'Brand passport') + '</title><style>' +
      '@page{size:A5;margin:0}*{box-sizing:border-box}body{margin:0;font-family:"Plus Jakarta Sans",Manrope,system-ui,sans-serif;color:#033337}' +
      '.pg{width:148mm;height:210mm;padding:16mm 14mm;page-break-after:always;position:relative;overflow:hidden;background:#fbf5e6;background-image:repeating-linear-gradient(0deg,transparent 0 7mm,rgba(0,102,135,.07) 7mm 7.3mm)}' +
      '.cover{background:#033337;color:#fda127;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6mm}.cover h1{margin:0;font-size:24pt;letter-spacing:.08em}.cover p{margin:0;color:#fff;opacity:.8}' +
      '.eb{font-size:8pt;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#b8561b}h2{margin:2mm 0 5mm;font-size:16pt}' +
      '.row{display:grid;grid-template-columns:34mm 1fr;gap:3mm;padding:2.2mm 0;border-bottom:.3mm solid #d9cbb4;font-size:10pt}.row b{font-size:8pt;color:#5f7d81;text-transform:uppercase;letter-spacing:.06em}' +
      '.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8mm 6mm;margin-top:6mm}.st{width:52mm;height:52mm;border-radius:50%;border:1.6mm double currentColor;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;transform:rotate(-9deg);font-weight:800;font-size:8.5pt;text-transform:uppercase;gap:1mm;margin:auto}.st .f{font-size:22pt}' +
      '.score{font-size:40pt;font-weight:800;line-height:1}.mrz{position:absolute;left:14mm;right:14mm;bottom:12mm;font:9pt ui-monospace,monospace;letter-spacing:.12em;opacity:.7;word-break:break-all}' +
      '</style></head><body>' +
      page('').replace('class="pg"', 'class="pg cover"').replace('></section>', '><div style="font-size:40pt">🛂</div><h1>' + T('HỘ CHIẾU<br>THƯƠNG HIỆU', 'BRAND<br>PASSPORT') + '</h1><p>BizOn · ' + (f.name || '') + '</p><p style="font-size:8pt;margin-top:20mm">© 2026 Đỗ Thùy Hương & Phan Anh Tú</p></section>') +
      page('<span class="eb">' + T('Trang thông tin', 'Data page') + '</span><h2>' + (f.name || '') + '</h2>' +
        [[T('Người chơi', 'Holder'), name || '—'], [T('Quốc gia xuất phát', 'Home country'), (hm.flag || '') + ' ' + T(hm.c || '', hm.cEn || '')], [T('Số thị trường', 'Markets'), st.length], [T('Lợi nhuận tích lũy', 'Cumulative profit'), dec(s.profit) + TY()], [T('Ngày', 'Date'), new Date().toLocaleDateString(EN() ? 'en-GB' : 'vi-VN')]]
          .map(function (r) { return '<div class="row"><b>' + r[0] + '</b><span>' + r[1] + '</span></div>'; }).join('') +
        '<div style="display:flex;gap:8mm;align-items:flex-end;margin-top:8mm"><div><div class="eb">' + T('Điểm tổng', 'Total score') + '</div><div class="score">' + Math.round(sc.total) + '<span style="font-size:14pt">/100</span></div></div>' +
        '<div style="font-size:9pt;line-height:1.6">💹 ' + sc.p + ' · ⭐ ' + sc.r + ' · 🏭 ' + sc.c + '<br>🤸 ' + sc.a + ' · 🌱 ' + sc.s + '</div></div>' +
        '<div style="margin-top:8mm;padding:4mm 5mm;border-radius:4mm;background:#fff"><div class="eb">' + T('Chân dung chiến lược', 'Strategy portrait') + '</div><div style="font-size:14pt;font-weight:800;margin:1mm 0">' + P[0] + ' ' + T(P[1][0], P[1][1]) + '</div><div style="font-size:9.5pt;line-height:1.5">' + T(P[2][0], P[2][1]) + '</div><div style="font-size:7.5pt;opacity:.7;margin-top:2mm">' + P[3] + '</div></div>' +
        '<div class="mrz">P&lt;BIZON&lt;' + (f.name || '').toUpperCase().replace(/[^A-Z0-9]+/g, '&lt;') + '&lt;&lt;' + Math.round(sc.total) + '&lt;' + st.length + 'MKT&lt;&lt;&lt;</div>') +
      page('<div style="height:100%;border:1.6mm solid rgba(253,161,39,.6);border-radius:4mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:3mm;padding:8mm;background:#fffdf6"><div class="eb">🎓 ' + T(sc.total >= 40 ? 'Bằng tốt nghiệp BizOn' : 'Giấy chứng nhận tham gia', sc.total >= 40 ? 'BizOn graduation certificate' : 'Certificate of participation') + '</div><div style="font-size:17pt;font-weight:800">' + (sc.total >= 40 ? 'CERTIFICATE OF GRADUATION' : 'CERTIFICATE OF PARTICIPATION') + '</div><div style="font-style:italic;color:#5f7d81;font-size:9pt">' + T('Trao cho', 'Awarded to') + '</div><div style="font-size:18pt;font-weight:800;color:#006687;border-bottom:.5mm solid rgba(253,161,39,.6);padding:0 6mm 1mm">' + (name || f.name || '') + '</div><div style="font-size:10pt;line-height:1.5">' + T('đã hoàn thành 6 quý mô phỏng Hộ Chiếu Thương Hiệu 3D cùng ', 'has completed the 6-quarter Brand Passport 3D simulation with ') + (f.name || '') + T(', đạt ', ', scoring ') + Math.round(sc.total) + '/100 · ' + P[0] + ' ' + T(P[1][0], P[1][1]) + '.</div>' +
        '<div style="display:grid;grid-template-columns:1fr 18mm 1fr;gap:4mm;align-items:end;width:100%;margin-top:4mm;font-size:7.5pt"><div style="text-align:center"><img src="' + new URL('assets/docs/sig-huong.png', location.href).href + '" style="height:11mm"><div style="border-top:.3mm solid rgba(3,51,55,.25);margin-top:1mm;padding-top:1mm;font-weight:800">NCS. Đỗ Thùy Hương</div></div><div style="width:17mm;height:17mm;border-radius:50%;border:.5mm dashed #fda127;display:flex;align-items:center;justify-content:center;transform:rotate(12deg);color:#e8762d;font-weight:800">BizOn ✓</div><div style="text-align:center"><img src="' + new URL('assets/docs/sig-tu.png', location.href).href + '" style="height:10mm"><div style="border-top:.3mm solid rgba(3,51,55,.25);margin-top:1mm;padding-top:1mm;font-weight:800">PGS.TS. Phan Anh Tú</div></div></div><div style="font-size:7.5pt;color:#8aa0a3">' + new Date().toLocaleDateString(EN() ? 'en-GB' : 'vi-VN') + '</div></div>') +
      page('<span class="eb">' + T('Thị thực & con dấu', 'Visas & stamps') + '</span><h2>' + T('Các thị trường đã thâm nhập', 'Markets entered') + '</h2>' +
        (st.length ? '<div class="grid">' + st.map(function (x) { if (x.simg) return '<div class="st" style="border:0;color:' + x.ink + '"><img src="' + x.simg + '" style="width:100%;height:100%;object-fit:contain"></div>'; return '<div class="st" style="color:' + x.ink + '"><span class="f">' + x.flag + '</span>' + x.name + '<span style="font-size:7pt;opacity:.85">' + x.c + '</span>' + x.icon + ' ' + x.mode + '<span style="font-size:7pt">' + T('Quý ', 'Q') + x.q + '</span></div>'; }).join('') + '</div>' : '<p>' + T('Chưa có con dấu nào.', 'No stamps yet.') + '</p>')) +
      '<script>onload=function(){setTimeout(function(){print()},300)}<\/script></body></html>';
    var w = window.open('', '_blank'); if (!w) { alert(T('Trình duyệt chặn cửa sổ mới – hãy cho phép pop-up.', 'Pop-up blocked – please allow pop-ups.')); return; }
    w.document.open(); w.document.write(html); w.document.close();
  }
  function endExtras() {
    var host = $('bp-footprint'); if (!host || $('sg-portrait')) return;
    var P = PORT[portraitKey()];
    var box = document.createElement('div'); box.id = 'sg-portrait';
    box.style.cssText = 'margin-top:16px;text-align:left;background:#fff6ea;border:2px solid #fda127;border-radius:18px;padding:14px 16px;display:flex;flex-direction:column;gap:6px;color:#033337';
    box.innerHTML = '<span class="sg-eb">🧬 ' + T('Chân dung chiến lược', 'Strategy portrait') + '</span><b style="font:800 18px Plus Jakarta Sans,sans-serif">' + P[0] + ' ' + T(P[1][0], P[1][1]) + '</b><span style="font-size:13.5px;line-height:1.5">' + T(P[2][0], P[2][1]) + '</span><span style="font-size:11px;opacity:.7">' + P[3] + '</span>' +
      '<button type="button" style="align-self:flex-start;margin-top:6px;padding:10px 16px;border:0;border-radius:12px;background:#033337;color:#fff;font-weight:800;cursor:pointer">🖨️ ' + T('In hộ chiếu + bằng tốt nghiệp (PDF)', 'Print passport + certificate (PDF)') + '</button>';
    box.querySelector('button').onclick = printPassport;
    host.insertAdjacentElement('beforebegin', box);
    try { S().flags.portrait = portraitKey(); } catch (e) {}
  }
  window.BPPassport = { print: printPassport, portrait: portraitKey };


  function eventArt() {
    var s = S(), st = $('bp-stage'); if (!s || !st || s.phase !== 'evt') return;
    var id = (s.usedEv || [])[s.usedEv.length - 1]; if (s.q === 2 && s.flags && s.flags.missionDone === false) id = 'mission';
    if (!id || st.querySelector('.sg-evart[data-id="' + id + '"]')) return;
    img('event/' + id + '.webp', function (src) { if (st.querySelector('.sg-evart')) return; st.insertAdjacentHTML('afterbegin', '<div class="sg-evart" data-id="' + id + '" style="height:clamp(120px,22vw,220px);border-radius:18px;overflow:hidden;margin-bottom:12px;box-shadow:0 4px 0 rgba(3,51,55,.12)"><img src="' + src + '" alt="" style="width:100%;height:100%;object-fit:cover"></div>'); });
  }
  // cố vấn vui / lo theo kết quả quý: thay ảnh cố vấn đang hiện nếu có biểu cảm mới
  function castMood() {
    var s = S(); if (!s) return; var good = (s.lowQ || 0) === 0 && s.cash >= 3;
    document.querySelectorAll('img[src*="assets/character/advisors/"]').forEach(function (el) {
      if (el.dataset.sgMood === (good ? 'vui' : 'lo')) return;
      var m = el.getAttribute('src').match(/advisors\/([a-z-]+?)(?:-aodai)?-cut\.webp/); if (!m) return;
      var slug = m[1] === 'lumina-ve' ? 'lumina' : m[1];
      el.dataset.sgMood = good ? 'vui' : 'lo'; if (!el.dataset.sgOrig) el.dataset.sgOrig = el.getAttribute('src');
      img('cast/' + slug + '-' + (good ? 'vui' : 'lo') + '.png', function (src) { el.src = src; });
    });
  }

  // ---------- Vòng theo dõi ----------
  var last = null, endDone = false, wasPlay = false;
  function tick() {
    var s = S(); if (!s) return;
    var play0 = $('bp-play'), endEl = $('bp-end'), inPlay = play0 && !play0.classList.contains('hidden'), inEnd = endEl && !endEl.classList.contains('hidden');
    var cur2 = { q: s.q, phase: s.phase, entered: s.entered.slice() };
    if (inEnd && !endDone) {
      endDone = true;
      var tot = B().scores ? B().scores().total : 0;
      play(s.profit >= s.rival.rev ? 'HC_KL_04' : 'HC_KL_05');
      play(tot >= 85 ? 'HC_TP_20' : tot >= 72 ? 'HC_TP_21' : tot >= 60 ? 'HC_TP_22' : tot >= 45 ? 'HC_TP_23' : 'HC_TP_24');
      if (tot >= 72) play('HC_BSL_10'); play('HC_NAR_30');
    }
    if (inEnd) endExtras(); else { endDone = false; var op = $('sg-portrait'); if (op) op.remove(); }
    if (!inPlay) { last = cur2; wasPlay = false; return; }
    if (last) {
      cur2.entered.forEach(function (v, m) { if (v !== null && v !== undefined && (last.entered[m] === null || last.entered[m] === undefined)) stamp(m, v); });
      if (cur2.phase !== last.phase || cur2.q !== last.q) {
        if (cur2.phase === 'obs') { if (cur2.q > 0 && cur2.q !== last.q) play('HC_NAR_40'); if (cur2.q === 5) play('HC_NAR_15'); else if (cur2.q === 0) play('HC_NAR_11'); else play('HC_NAR_10'); if (KL[cur2.q] && cur2.q !== last.q) kimLong(cur2.q); }
        if (cur2.phase === 'dec' && cur2.q === 0) play('HC_NAR_12');
        if (cur2.phase === 'evt') play('HC_LUM_10');
      }
    }
    if (!wasPlay && cur2.q === 0 && cur2.phase === 'obs') { play('HC_NAR_01'); play('HC_NAR_05'); }
    wasPlay = true; last = cur2;
    askBox(); eventArt(); if (cur2.phase !== last.phase || cur2.q !== last.q) castMood();
  }
  ['us', 'de', 'kr', 'nz', 'jp', 'sg', 'id', 'vn'].forEach(function (c) { img('stamp/' + c + '.png', function () {}); });
  setInterval(tick, 400);
})();
