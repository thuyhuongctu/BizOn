/* Đặc tả 007, câu chuyện 2 (19/11/2026): truong-giang-vien.html viết lại thành tài liệu tập huấn theo trình tự một buổi dạy,
 * giữ địa chỉ cũ (câu làm rõ 2A). Kiểm:
 * - đúng 6 bước theo thứ tự: tạo lớp → gửi mã/link → chiếu Màn hình lớp học → theo dõi → chốt và chấm → xuất kết quả và chứng nhận;
 * - mỗi bước có ảnh màn hình thật (VI và EN, tệp có, có alt, có kích thước, nhẹ), một việc cần làm, một lỗi hay gặp và cách xử lý;
 * - ảnh do scripts/chup-tap-huan.mjs chụp trên lớp mẫu DEMO-2026, script không ghi đè ảnh đã có;
 * - vẫn còn yêu cầu kỹ thuật và câu hỏi thường gặp ở cuối; liên kết «Tập huấn 6 bước» ở Góc giảng viên;
 * - 360 px VI và EN không tràn ngang; bản EN không còn chữ Việt ngoài tên riêng, hiện ảnh EN;
 * - bản in: không menu, không chân trang, mỗi bước không bị cắt giữa hai trang A4. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const html = read('truong-giang-vien.html');
const IDS = ['tao-lop', 'gui-ma', 'chieu', 'theo-doi', 'cham', 'xuat'];
const VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
const NAMES = /Bến Phù Sa|Bật Nghiệp|Hộ Chiếu Sầu Riêng|Hộ Chiếu Thương Hiệu|Cần Thơ|Đỗ Thùy Hương|Phan Anh Tú/g;

// ---- Tĩnh ----
check(/<link rel="canonical" href="https:\/\/bizonland\.com\/truong-giang-vien\.html">/.test(html), 'giữ địa chỉ và canonical cũ');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 912, 'sw.js ≥ bizon-v912');
const arts = [...html.matchAll(/<article class="buoc" id="([\w-]+)" data-buoc="(\d)">([\s\S]*?)<\/article>/g)];
check(arts.length === 6 && arts.map(a => a[1]).join() === IDS.join() && arts.every((a, i) => +a[2] === i + 1), 'đúng 6 bước theo thứ tự ' + arts.map(a => a[1]).join(' → '));
for (const [, id, n, body] of arts) {
  check(/<h3 data-vi="[^"]+" data-en="[^"]+">/.test(body), 'bước ' + n + ': tiêu đề có bản EN');
  check(/class="buoc-viec"><p class="k" data-vi="Việc cần làm"[^>]*>[\s\S]*?<p class="body" data-vi="[^"]{40,}" data-en="[^"]{40,}">/.test(body), 'bước ' + n + ': có «Việc cần làm» (VI và EN)');
  check(/class="buoc-loi"><p class="k" data-vi="Lỗi hay gặp"[^>]*>[\s\S]*?class="body loi" data-vi="[^"]{15,}" data-en="[^"]{15,}"[\s\S]*?class="body sua" data-vi="Cách xử lý: [^"]{15,}" data-en="Fix: [^"]{15,}"/.test(body), 'bước ' + n + ': có «Lỗi hay gặp» và cách xử lý (VI và EN)');
  for (const l of ['vi', 'en']) {
    const m = new RegExp('<img class="th-img chi-' + l + '[^"]*" src="(assets/tap-huan/buoc-' + n + '-' + l + '\\.webp)" alt="([^"]{20,})" width="(\\d+)" height="(\\d+)"').exec(body);
    const ok = m && fs.existsSync(R(m[1])), size = ok ? fs.statSync(R(m[1])).size : 0, head = ok ? fs.readFileSync(R(m[1])).subarray(0, 12).toString('latin1') : '';
    check(ok && /^RIFF....WEBP$/.test(head) && size > 3000 && size < 200000, 'bước ' + n + ' ' + l.toUpperCase() + ': ảnh WebP có thật, có alt, ' + Math.round(size / 1024) + ' KB');
  }
}
{ const sc = read('scripts/chup-tap-huan.mjs');
  check(/DEMO-2026/.test(sc) && /buoc-' \+ s\.n \+ '-' \+ lang/.test(sc) && (sc.match(/\{ n: \d,/g) || []).length === 6, 'script chụp 6 bước trên lớp mẫu, VI và EN');
  check(/existsSync\(file\) && !process\.env\.GHI_DE/.test(sc), 'script không ghi đè ảnh đã có'); }
check(html.includes('data-vi="Câu hỏi thường gặp"') && html.includes('data-vi="Yêu cầu kỹ thuật"'), 'giữ yêu cầu kỹ thuật và câu hỏi thường gặp');
check(html.indexOf('id="xuat"') < html.indexOf('data-vi="Yêu cầu kỹ thuật"') && html.indexOf('data-vi="Yêu cầu kỹ thuật"') < html.indexOf('data-vi="Câu hỏi thường gặp"'), 'yêu cầu kỹ thuật và hỏi đáp nằm sau 6 bước');
check(html.includes('Hệ thống KHÔNG tự chấm rubric') && html.includes('số liệu đã chốt'), 'bước chấm nói rõ hệ thống không tự chấm rubric, chấm trên số liệu đã chốt');
{ const gv = read('giang-vien.html');
  check(gv.includes('>Lần đầu? Tập huấn 6 bước</a>') && gv.includes('data-en="New here? 6-step training"') && !/5 bước|5-step/.test(gv), 'Góc giảng viên: liên kết đổi thành «Tập huấn 6 bước»'); }
check(/@media print\{[\s\S]*?#clay-nav,#clay-footer[\s\S]*?\.buoc\{break-inside:avoid/.test(html), 'có CSS bản in');

// ---- Chạy thật ----
(async () => {
  const b = await chromium.launch();
  try {
    for (const lang of ['vi', 'en']) {
      const ctx = await b.newContext({ viewport: { width: 360, height: 780 } });
      await ctx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
      const p = await ctx.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message));
      await p.route(/\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await p.goto(BASE + '/truong-giang-vien.html', { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(900);
      const r = await p.evaluate(() => {
        const shown = [...document.querySelectorAll('.th-img')].filter(i => getComputedStyle(i).display !== 'none').map(i => i.getAttribute('src'));
        const txt = [], tw = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
        while (tw.nextNode()) { const t = tw.currentNode.textContent.trim(), el = tw.currentNode.parentElement; if (t && el.offsetParent !== null && !el.closest('[lang="vi"]')) txt.push(t); }
        const sw2 = [...document.querySelectorAll('.th-lang')].filter(a => getComputedStyle(a).display !== 'none').map(a => a.getAttribute('href'));
        return { sw: document.documentElement.scrollWidth, shown, txt, n: document.querySelectorAll('article.buoc').length, sw2 };
      });
      check(r.n === 6, '360 ' + lang.toUpperCase() + ': hiện 6 bước');
      check(r.sw2.length === 1 && r.sw2[0] === (lang === 'vi' ? '?lang=en' : '?lang=vi'), '360 ' + lang.toUpperCase() + ': nút sang bản ' + (lang === 'vi' ? 'tiếng Anh' : 'tiếng Việt') + ' ' + JSON.stringify(r.sw2));
      check(r.sw <= 360, '360 ' + lang.toUpperCase() + ': không tràn ngang (' + r.sw + ')');
      check(r.shown.length === 6 && r.shown.every(s => s.endsWith('-' + lang + '.webp')), '360 ' + lang.toUpperCase() + ': hiện đúng 6 ảnh ' + lang.toUpperCase());
      if (lang === 'en') { const vi = r.txt.filter(t => VI.test(t.replace(NAMES, ''))); check(!vi.length, '360 EN: không còn chữ Việt ngoài tên riêng ' + JSON.stringify(vi.slice(0, 4))); }
      check(!loi.length, '360 ' + lang.toUpperCase() + ': không lỗi JS ' + loi.join(' / '));
      await ctx.close();
    }
    // Bản in A4: khổ in 210 mm ≈ 794 px; vùng in cao ≈ 273 mm (lề 12 mm) ≈ 1030 px
    { const ctx = await b.newContext({ viewport: { width: 794, height: 1123 } }); const p = await ctx.newPage();
      await p.goto(BASE + '/truong-giang-vien.html', { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(900);
      await p.emulateMedia({ media: 'print' });
      const r = await p.evaluate(() => {
        const hidden = s => { const e = document.querySelector(s); return !e || getComputedStyle(e).display === 'none'; };
        return { nav: hidden('#clay-nav'), foot: hidden('#clay-footer'), cta: hidden('.cta2'), muc: hidden('.th-muc'),
          steps: [...document.querySelectorAll('article.buoc')].map(a => ({ br: getComputedStyle(a).breakInside, h: Math.round(a.getBoundingClientRect().height) })) };
      });
      check(r.nav && r.foot, 'bản in: không có menu và chân trang');
      check(r.cta && r.muc, 'bản in: bỏ khối nút đăng ký và mục lục nút bấm');
      check(r.steps.length === 6 && r.steps.every(s => s.br === 'avoid'), 'bản in: mỗi bước không bị tách (break-inside: avoid)');
      check(r.steps.every(s => s.h <= 1030), 'bản in: mỗi bước vừa một trang A4 (' + r.steps.map(s => s.h).join(', ') + ' px)');
      await ctx.close(); }
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await b.close();
  if (fails) { console.log('tap-huan-giang-vien: ' + fails + ' lỗi'); process.exit(1); }
  console.log('tap-huan-giang-vien: ok');
})();
