/* BizOn – "Chứng nhận chính thức" (Certificate of Completion / Participation)
 * dùng chung cho cả 5 file game (bản tải thứ 2, cạnh chứng chỉ BizOn mặc định)
 * và Trang Giảng viên. Vẽ bằng canvas, độc lập – nhận toàn bộ dữ liệu qua tham
 * số, không đọc state riêng của từng trang.
 *
 * Đơn vị cấp: MẶC ĐỊNH là BizOn (bizonland.com, chữ ký in của hai nhà sáng lập: PGS.TS. Phan Anh Tú
 * bên trái, Đỗ Thùy Hương bên phải).
 * Lớp nào muốn chứng nhận mang tên trường mình thì giảng viên cấu hình trên
 * Trang Giảng viên (tên đơn vị, đơn vị trực thuộc, logo, người ký, chức danh,
 * ảnh chữ ký) – lưu ở class_cert_config (migration 20261029000000_cert_issuer.sql)
 * và trả về qua RPC công khai bizon_cert_feed cùng mã môn/tên môn/ngày học.
 * Không còn trường nào được viết cứng trong mã.
 *
 * API:
 *   window.OfficialCert.fetchConfig(classCode?) – Promise<cfg> với
 *     {course_code, course_name, course_dates, org_name, org_sub, org_logo,
 *      org_logo2, signer_name, signer_title, signer_sig}; đọc mã lớp đã nhập
 *     (localStorage 'bizon-ft-class'/'bizon-class' hoặc <NS>-class) rồi gọi RPC.
 *     Không có backend/mã lớp/lỗi mạng đều rơi về mặc định BizOn, không bao giờ
 *     reject. Kết quả gần nhất được nhớ lại để render() dùng phần đơn vị cấp.
 *   window.OfficialCert.render(opts) – Promise<canvas>. opts: name, courseCode,
 *     courseName, courseDates, verifyCode, signature (ảnh chữ ký thật, ghi đè),
 *     org (ghi đè đơn vị cấp: {org_name, org_sub, org_logo, org_logo2 (logo
 *     góc phải, trống = logo BizOn), signer_name, signer_title, signer_sig};
 *     mặc định lấy từ fetchConfig() gần nhất),
 *     title (ghi đè dòng tiêu đề tiếng Anh).
 *   window.OfficialCert.download(opts) – render rồi tải PNG.
 *   window.OfficialCert.issuer(cfg?) – đơn vị cấp đã chuẩn hoá (để kiểm thử/xem trước).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var isEN = function () { try { return (localStorage.getItem('bizon-lang') || 'vi') === 'en'; } catch (e) { return false; } };
  function T(vi, en) { return isEN() ? en : vi; }
  var DEFAULTS = { course_code: '', course_name: 'BizOn Bật Nghiệp', course_dates: '', org_name: '', org_sub: '', org_logo: '', org_logo2: '', signer_name: '', signer_title: '', signer_sig: '' };
  var BIZON = { logo: 'assets/icons/icon-512.png', sig: 'assets/docs/sig-huong-in.png', signer: 'Đỗ Thùy Hương', sig2: 'assets/docs/sig-tu-in.png', signer2: 'PGS.TS. Phan Anh Tú' };
  var lastCfg = null;

  function classCode() {
    try {
      var ns = window.BIZON_GAME_NS;
      if (ns) return (localStorage.getItem(ns + '-class') || '').trim().toUpperCase();
      return (localStorage.getItem('bizon-ft-class') || localStorage.getItem('bizon-class') || '').trim().toUpperCase();
    } catch (e) { return ''; }
  }
  function norm(j) {
    var out = {}, k;
    for (k in DEFAULTS) out[k] = j && typeof j[k] === 'string' ? j[k] : DEFAULTS[k];
    return out;
  }
  // Đơn vị cấp đã chuẩn hoá: {custom, name, sub, logo, logo2, signerName, signerTitle, signerSig}.
  // custom = true khi giảng viên đã điền tên đơn vị; khi đó người ký/chức danh/chữ ký
  // cũng lấy từ cấu hình (trống thì không vẽ chữ ký, chỉ ghi tên đơn vị).
  function issuer(cfg) {
    var c = norm(cfg || lastCfg || {}), name = (c.org_name || '').trim();
    if (!name) return { custom: false, name: 'BIZONLAND', logo2: '', sub: T('Hệ sinh thái mô phỏng kinh doanh BizOn', 'BizOn business simulation ecosystem'), logo: BIZON.logo, signerName: BIZON.signer, signerTitle: T('Người sáng lập BizOn', 'Founder, BizOn'), signerSig: BIZON.sig, signer2Name: BIZON.signer2, signer2Title: T('Đồng sáng lập · Cố vấn học thuật BizOn', 'Co-founder & Chief Academic Advisor, BizOn'), signer2Sig: BIZON.sig2, place: T('trên nền tảng BizOn · bizonland.com', 'on the BizOn platform · bizonland.com') };
    return { custom: true, name: name, sub: (c.org_sub || '').trim(), logo: (c.org_logo || '').trim(), logo2: (c.org_logo2 || '').trim() || BIZON.logo, signerName: (c.signer_name || '').trim(), signerTitle: (c.signer_title || '').trim() || name, signerSig: (c.signer_sig || '').trim(), place: T('tại ', 'at ') + [(c.org_sub || '').trim(), name].filter(Boolean).join(', ') + T(' · trên nền tảng BizOn', ' · on the BizOn platform') };
  }
  // classCodeOverride: truyền thẳng mã lớp khi trang không dùng chung khoá
  // localStorage (vd: game.html lưu mã lớp riêng trong S.profile.classId).
  function fetchConfig(classCodeOverride) {
    var cfg = window.BIZON_BACKEND || {};
    var c = (classCodeOverride || classCode() || '').trim().toUpperCase();
    var done = function (j) { lastCfg = norm(j); return lastCfg; };
    if (!cfg.enabled || !cfg.url || cfg.url.indexOf('YOUR-PROJECT') >= 0 || !c) return Promise.resolve(done(null));
    return fetch(cfg.url.replace(/\/$/, '') + '/rest/v1/rpc/bizon_cert_feed', {
      method: 'POST', headers: { apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_class_code: c }),
    }).then(function (r) { return r.ok ? r.json() : null; }).then(done).catch(function () { return done(null); });
  }

  function loadImg(src) {
    return new Promise(function (resolve) {
      if (!src) return resolve(null);
      var img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }
  function wrapText(g, text, x, y, maxWidth, lineHeight, align) {
    var words = text.split(' '), line = '', lines = [];
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (g.measureText(test).width > maxWidth && line) { lines.push(line); line = words[i]; } else line = test;
    }
    if (line) lines.push(line);
    var startY = y - (lines.length - 1) * lineHeight / 2;
    lines.forEach(function (l, i) { g.textAlign = align || 'center'; g.fillText(l, x, startY + i * lineHeight); });
    return lines.length;
  }
  // Vẽ ảnh vừa khung (giữ tỷ lệ, căn giữa).
  function drawFit(g, img, x, y, w, h) {
    var k = Math.min(w / img.width, h / img.height), dw = img.width * k, dh = img.height * k;
    g.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  // Mã xác thực ngắn, không phải chữ ký mật mã học – chỉ để giảng viên có
  // một chuỗi cố định (từ tên + mã môn + ngày) đối chiếu nhanh với bài nộp
  // trong ft_results khi cần, tránh tên tự gõ không gắn với gì cả.
  function shortCode(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h.toString(36).toUpperCase();
  }

  // Vẽ chứng nhận lên canvas 1400×990. opts.signature (tuỳ chọn): nguồn ảnh
  // chữ ký thay cho chữ ký in – Trang Giảng viên truyền ảnh chữ ký thật do
  // giảng viên tự chọn từ máy mình (chỉ lưu trong trình duyệt đó, không có trên web).
  function render(opts) {
    opts = opts || {};
    var I = issuer(opts.org);
    var name = opts.name || T('Học viên BizOn', 'BizOn Learner');
    var courseCode = (opts.courseCode || '').trim();
    var courseName = opts.courseName || DEFAULTS.course_name;
    var courseDates = opts.courseDates || new Date().toLocaleDateString(isEN() ? 'en-US' : 'vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    var verifyCode = opts.verifyCode || shortCode(name + '|' + courseCode + '|' + courseDates);
    var title = opts.title || (I.custom ? 'CERTIFICATE OF PARTICIPATION' : 'CERTIFICATE OF COMPLETION');
    var sigSrc = opts.signature || I.signerSig;

    // Chờ font của khuôn (nếu trang có nạp) để canvas không vẽ bằng font dự phòng.
    var fonts = document.fonts && document.fonts.load ? Promise.all(['800 46px "Plus Jakarta Sans"', '21px "Hanken Grotesk"', 'italic 21px "Hanken Grotesk"', '800 15px "Hanken Grotesk"'].map(function (f) { return document.fonts.load(f).catch(function () {}); })) : Promise.resolve();
    return Promise.all([loadImg(I.logo), loadImg(I.logo2), loadImg(sigSrc), I.signer2Name ? loadImg(I.signer2Sig) : null, fonts]).then(function (imgs) {
      var orgLogo = imgs[0], rightLogo = imgs[1], sig = imgs[2], sig2 = imgs[3];
      var cv = document.createElement('canvas'); cv.width = 1400; cv.height = 990;
      var g = cv.getContext('2d');

      g.fillStyle = '#fffdf6'; g.fillRect(0, 0, 1400, 990);
      g.strokeStyle = '#0a3d62'; g.lineWidth = 10; g.strokeRect(24, 24, 1352, 942);
      g.strokeStyle = '#c9a227'; g.lineWidth = 3; g.strokeRect(42, 42, 1316, 906);

      if (orgLogo) drawFit(g, orgLogo, 90, 70, 150, 150);
      if (rightLogo) drawFit(g, rightLogo, 1160, 70, 150, 150);

      g.fillStyle = '#0a3d62'; g.textAlign = 'center';
      g.font = '700 22px "Plus Jakarta Sans", sans-serif'; g.fillText(I.name.toUpperCase(), 700, 110);
      if (I.sub) { g.font = '700 18px "Plus Jakarta Sans", sans-serif'; g.fillStyle = '#1f7a50'; g.fillText(I.sub.toUpperCase(), 700, 140); }
      g.fillStyle = '#0a3d62'; g.font = '900 46px "Plus Jakarta Sans", sans-serif'; g.fillText(title, 700, 218);

      g.fillStyle = '#033337'; g.font = 'italic 21px "Hanken Grotesk", sans-serif'; g.fillText(T('Chứng nhận rằng', 'This is to certify that'), 700, 285);
      g.fillStyle = '#0a3d62'; g.font = '800 46px "Plus Jakarta Sans", sans-serif'; g.fillText(name, 700, 350);
      g.strokeStyle = '#c9a227'; g.lineWidth = 2; g.beginPath(); g.moveTo(480, 370); g.lineTo(920, 370); g.stroke();

      g.fillStyle = '#033337'; g.font = '21px "Hanken Grotesk", sans-serif';
      wrapText(g, I.custom ? T('đã hoàn thành các mô-đun mô phỏng kinh doanh của BizOn trong môn học', 'has successfully participated in the BizOn business simulation modules of the course') : T('đã hoàn thành các mô-đun mô phỏng kinh doanh', 'has successfully completed the business simulation modules'), 700, 425, 1050, 30);
      g.font = '800 28px "Plus Jakarta Sans", sans-serif'; g.fillStyle = '#0a3d62';
      g.fillText('“' + courseName + (courseCode ? ' – Code ' + courseCode : '') + '”', 700, 490);
      g.font = '19px "Hanken Grotesk", sans-serif'; g.fillStyle = '#033337';
      wrapText(g, T('Vào ', 'On ') + courseDates + ' – ' + I.place, 700, 535, 1050, 28);

      // chữ ký và người ký: đơn vị BizOn mặc định có hai người ký (trái: thầy Tú, phải: cô Hương)
      function signBlock(img, script, who, role, sx) {
        var sy = 700;
        g.textAlign = 'center';
        if (img) { var w = Math.min(300, img.width * 90 / img.height), h = w * img.height / img.width; g.drawImage(img, sx - w / 2, sy - h, w, h); }
        else if (script) { g.font = 'italic 36px "Segoe Script", cursive'; g.fillStyle = '#0a3d62'; g.fillText(script, sx, sy - 20); }
        g.strokeStyle = 'rgba(3,51,55,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(sx - 150, sy + 10); g.lineTo(sx + 150, sy + 10); g.stroke();
        g.fillStyle = '#033337'; g.font = '800 15px "Hanken Grotesk", sans-serif';
        g.fillText(who, sx, sy + 34);
        g.font = '700 12px "Hanken Grotesk", sans-serif'; g.fillStyle = 'rgba(3,51,55,.6)';
        g.fillText(role, sx, sy + 52);
      }
      if (I.signer2Name) signBlock(sig2, I.signer2Name, I.signer2Name, I.signer2Title, 400);
      signBlock(sig, I.signerName, I.signerName || I.name, I.signerTitle, 1000);

      g.textAlign = 'left'; g.font = '11px "Hanken Grotesk", sans-serif'; g.fillStyle = 'rgba(3,51,55,.4)';
      g.fillText(T('Cấp ngày ', 'Issued on ') + new Date().toLocaleDateString(isEN() ? 'en-US' : 'vi-VN') + '  ·  bizonland.com', 60, 950);
      g.textAlign = 'right'; g.fillText(T('Mã xác thực ', 'Verification code ') + verifyCode, 1340, 950);

      return cv;
    });
  }

  function fileName(opts) {
    var name = (opts && opts.name) || T('Học viên BizOn', 'BizOn Learner');
    // Tên tệp không dấu: có trình duyệt bỏ qua tên tệp có ký tự ngoài ASCII và lưu thành «download».
    var ascii = name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^A-Za-z0-9]+/g, '');
    return ((opts && opts.filenamePrefix) || 'BizOn') + '-ChungNhan-' + (ascii || 'HocVien') + '.png';
  }

  function download(opts) {
    return render(opts).then(function (cv) {
      var a = document.createElement('a');
      a.download = fileName(opts);
      a.href = cv.toDataURL('image/png');
      a.click();
    });
  }

  window.OfficialCert = { download: download, render: render, fileName: fileName, fetchConfig: fetchConfig, issuer: issuer, DEFAULTS: DEFAULTS };
})();
