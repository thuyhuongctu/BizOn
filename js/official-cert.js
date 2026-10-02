/* BizOn – "Chứng nhận chính thức" (Certificate of Participation) kiểu Đại
 * học Cần Thơ / Trường Kinh tế, dùng chung cho cả 5 file game (bản tải thứ 2,
 * cạnh chứng chỉ BizOn mặc định sẵn có). Vẽ bằng canvas, độc lập – nhận toàn
 * bộ dữ liệu qua tham số, không đọc state riêng của từng trang. Mã môn/tên
 * môn/ngày học mặc định theo khóa KT330H thật (Entrepreneurship, ĐH Cần
 * Thơ) nếu giảng viên chưa cấu hình gì khác qua Trang Giảng Viên.
 *
 * API:
 *   window.OfficialCert.download({ name, courseCode, courseName,
 *     courseDates, filenamePrefix }) – tất cả tham số đều tuỳ chọn.
 *   window.OfficialCert.fetchConfig() – trả về Promise<{course_code,
 *     course_name, course_dates}>, đọc mã lớp đã nhập (localStorage khoá
 *     'bizon-ft-class'/'bizon-class', dùng chung với tất cả các game) rồi
 *     gọi RPC công khai bizon_cert_feed (migration
 *     20261001010000_cert_config.sql). Không có backend/mã lớp/lỗi mạng
 *     đều rơi về mặc định KT330H/Entrepreneurship, không bao giờ reject.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var isEN = function () { try { return (localStorage.getItem('bizon-lang') || 'vi') === 'en'; } catch (e) { return false; } };
  function T(vi, en) { return isEN() ? en : vi; }
  var DEFAULTS = { course_code: 'KT330H', course_name: 'Entrepreneurship', course_dates: '' };

  function classCode() { try { return (localStorage.getItem('bizon-ft-class') || localStorage.getItem('bizon-class') || '').trim().toUpperCase(); } catch (e) { return ''; } }
  // classCodeOverride: truyền thẳng mã lớp khi trang không dùng chung khoá
  // localStorage (vd: game.html lưu mã lớp riêng trong S.profile.classId).
  function fetchConfig(classCodeOverride) {
    var cfg = window.BIZON_BACKEND || {};
    var c = (classCodeOverride || classCode() || '').trim().toUpperCase();
    if (!cfg.enabled || !cfg.url || cfg.url.indexOf('YOUR-PROJECT') >= 0 || !c) return Promise.resolve(DEFAULTS);
    return fetch(cfg.url.replace(/\/$/, '') + '/rest/v1/rpc/bizon_cert_feed', {
      method: 'POST', headers: { apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_class_code: c }),
    }).then(function (r) { return r.ok ? r.json() : DEFAULTS; }).then(function (j) { return j || DEFAULTS; }).catch(function () { return DEFAULTS; });
  }

  function loadImg(src) {
    return new Promise(function (resolve) {
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

  function download(opts) {
    opts = opts || {};
    var name = opts.name || T('Học viên BizOn', 'BizOn Learner');
    var courseCode = opts.courseCode || 'KT330H';
    var courseName = opts.courseName || T('Khởi nghiệp (Entrepreneurship)', 'Entrepreneurship');
    var courseDates = opts.courseDates || new Date().toLocaleDateString(isEN() ? 'en-US' : 'vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    var filenamePrefix = opts.filenamePrefix || 'BizOn';

    Promise.all([loadImg('assets/docs/ctu-logo.png'), loadImg('assets/docs/soe-logo.png'), loadImg('assets/docs/sig-tu.png')]).then(function (imgs) {
      var ctuLogo = imgs[0], soeLogo = imgs[1], sigTu = imgs[2];
      var cv = document.createElement('canvas'); cv.width = 1400; cv.height = 990;
      var g = cv.getContext('2d');

      g.fillStyle = '#fffdf6'; g.fillRect(0, 0, 1400, 990);
      g.strokeStyle = '#0a3d62'; g.lineWidth = 10; g.strokeRect(24, 24, 1352, 942);
      g.strokeStyle = '#c9a227'; g.lineWidth = 3; g.strokeRect(42, 42, 1316, 906);

      if (ctuLogo) g.drawImage(ctuLogo, 90, 70, 150, 150);
      if (soeLogo) g.drawImage(soeLogo, 1160, 70, 150, 150);

      g.fillStyle = '#0a3d62'; g.textAlign = 'center';
      g.font = '700 22px "Plus Jakarta Sans", sans-serif'; g.fillText('CAN THO UNIVERSITY', 700, 110);
      g.font = '700 18px "Plus Jakarta Sans", sans-serif'; g.fillStyle = '#1f7a50'; g.fillText('SCHOOL OF ECONOMICS', 700, 140);
      g.fillStyle = '#0a3d62'; g.font = '900 46px "Plus Jakarta Sans", sans-serif'; g.fillText('CERTIFICATE OF PARTICIPATION', 700, 218);

      g.fillStyle = '#033337'; g.font = 'italic 21px "Hanken Grotesk", sans-serif'; g.fillText(T('Chứng nhận rằng', 'This is to certify that'), 700, 285);
      g.fillStyle = '#0a3d62'; g.font = '800 46px "Plus Jakarta Sans", sans-serif'; g.fillText(name, 700, 350);
      g.strokeStyle = '#c9a227'; g.lineWidth = 2; g.beginPath(); g.moveTo(480, 370); g.lineTo(920, 370); g.stroke();

      g.fillStyle = '#033337'; g.font = '21px "Hanken Grotesk", sans-serif';
      wrapText(g, T('đã hoàn thành các mô-đun mô phỏng kinh doanh của BizOn trong môn học', 'has successfully participated in the BizOn business simulation modules of the course'), 700, 425, 1050, 30);
      g.font = '800 28px "Plus Jakarta Sans", sans-serif'; g.fillStyle = '#0a3d62';
      g.fillText('“' + courseName + ' – Code ' + courseCode + '”', 700, 490);
      g.font = '19px "Hanken Grotesk", sans-serif'; g.fillStyle = '#033337';
      wrapText(g, T('Vào ', 'On ') + courseDates + T(' – tại Trường Kinh tế, Trường Đại học Cần Thơ, Việt Nam', ' – at School of Economics, Can Tho University, Vietnam'), 700, 535, 1050, 28);

      // chữ ký
      var sx = 1000, sy = 700;
      if (sigTu) { var h = 90, w = sigTu.width * h / sigTu.height; g.drawImage(sigTu, sx - w / 2, sy - h, w, h); }
      else { g.font = 'italic 36px "Segoe Script", cursive'; g.fillStyle = '#0a3d62'; g.fillText('Phan Anh Tu', sx, sy - 20); }
      g.strokeStyle = 'rgba(3,51,55,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(sx - 150, sy + 10); g.lineTo(sx + 150, sy + 10); g.stroke();
      g.fillStyle = '#033337'; g.font = '800 15px "Hanken Grotesk", sans-serif';
      g.fillText(T('Assoc. Prof. Dr. Phan Anh Tu', 'Assoc. Prof. Dr. Phan Anh Tu'), sx, sy + 34);
      g.font = '700 12px "Hanken Grotesk", sans-serif'; g.fillStyle = 'rgba(3,51,55,.6)';
      g.fillText(T('Phó Hiệu trưởng – Trường Kinh tế', 'Vice Dean – School of Economics'), sx, sy + 52);

      g.textAlign = 'left'; g.font = '11px "Hanken Grotesk", sans-serif'; g.fillStyle = 'rgba(3,51,55,.4)';
      g.fillText(T('Cấp ngày ', 'Issued on ') + new Date().toLocaleDateString(isEN() ? 'en-US' : 'vi-VN') + '  ·  bizon.app', 60, 950);

      var a = document.createElement('a');
      a.download = filenamePrefix + '-ChungNhanDHCT-' + name.replace(/[^\p{L}\p{N}]+/gu, '') + '.png';
      a.href = cv.toDataURL('image/png');
      a.click();
    });
  }

  window.OfficialCert = { download: download, fetchConfig: fetchConfig };
})();
