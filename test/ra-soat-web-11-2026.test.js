/* Rà soát bizonland.com (14/11/2026): sửa các chỗ còn chữ Việt khi chọn tiếng Anh, thẻ mô tả thiếu và trang có hai H1.
 * Kiểm:
 *  1. Không trang nào dùng bizon-clay-i18n.js đặt data-en trên phần tử có thẻ con (tệp dịch bỏ qua phần tử đó → chữ Việt còn sót);
 *     chỗ có thẻ con phải dùng data-en-html.
 *  2. Mỗi trang 3D chỉ có một H1 (Hộ Chiếu Thương Hiệu 3D: H1 nằm ở phần giới thiệu do js/bp-ib-ui.js dựng); Bật Nghiệp 3D và CMR Lab có thẻ mô tả.
 *  3. Trong trình duyệt, chọn tiếng Anh: Go Global (global.html) hiện hồ sơ doanh nghiệp và thẻ đối thủ bằng tiếng Anh; bảng Lumina
 *     của Brand Passport Learning hiện tiếng Anh; ba đoạn có thẻ con (Trường học thuật, Thiết kế nghiên cứu, trang tải ứng dụng)
 *     đổi sang tiếng Anh. Chọn tiếng Việt thì giữ nguyên tiếng Việt. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), { execSync } = require('node:child_process');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');

// 1. data-en trên phần tử có thẻ con (bộ đếm thẻ đơn giản: đủ cho HTML tĩnh của kho)
const VOID = new Set(['br', 'img', 'input', 'meta', 'link', 'hr', 'wbr', 'source', 'track', 'area', 'col', 'embed', 'param']);
function dataEnCoThe(html) {
  const out = [], stack = [], re = /<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1>|<\/?([a-zA-Z][\w-]*)([^>]*)>/g; let m;
  while ((m = re.exec(html))) {
    if (!m[2]) continue;
    const tag = m[2].toLowerCase(), close = m[0][1] === '/', attrs = m[3] || '';
    if (close) { for (let i = stack.length - 1; i >= 0; i--) if (stack[i].tag === tag) { stack.splice(i).forEach(e => { if (e.en && e.kids) out.push(e.line); }); break; } continue; }
    if (stack.length && tag !== 'br' && tag !== 'wbr') stack[stack.length - 1].kids++;
    if (VOID.has(tag) || /\/\s*$/.test(attrs)) continue;
    stack.push({ tag, kids: 0, en: /\sdata-en=/.test(attrs) && !/\sdata-en-html=/.test(attrs), line: html.slice(0, m.index).split('\n').length });
  }
  return out;
}
const tep = execSync('git ls-files "*.html"', { cwd: R('.'), encoding: 'utf8' }).split('\n').filter(f => f && read(f).includes('bizon-clay-i18n.js'));
const loi = tep.flatMap(f => dataEnCoThe(read(f)).map(l => f + ':' + l));
check(tep.length > 50 && loi.length === 0, tep.length + ' trang dùng bizon-clay-i18n.js: không có data-en đặt trên phần tử có thẻ con' + (loi.length ? ' (' + loi.slice(0, 5).join(', ') + ')' : ''));

// 2. một H1 trong mã gốc; thẻ mô tả
check((read('ra-khoi-3d.html').match(/<h1\b/g) || []).length === 1, 'ra-khoi-3d.html: một H1 trong mã gốc (hộp thoại thị trường dùng H2)');
check(!/<h1\b/.test(read('Ho Chieu Thuong Hieu 3D.html')) && /'<h1>'/.test(read('js/bp-ib-ui.js')), 'Ho Chieu Thuong Hieu 3D.html: đầu trang tĩnh dùng H2, H1 duy nhất do phần giới thiệu dựng');
for (const f of ['BizOn Game 3D.html', 'lab/cmr-lab.html']) check(/<meta name="description" content="[^"]{60,}">/.test(read(f)), f + ': có thẻ mô tả');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 871, 'sw.js ≥ bizon-v871');

// 3. trong trình duyệt
const vn = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
(async () => {
  const b = await chromium.launch();
  const mo = async (u, lang) => { const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    const pg = await ctx.newPage(); const err = []; pg.on('pageerror', e => err.push(e.message));
    await pg.goto(BASE + '/' + u, { waitUntil: 'load' }); await pg.waitForTimeout(1500); return { ctx, pg, err }; };
  try {
    for (const lang of ['en', 'vi']) {
      let { ctx, pg, err } = await mo('global.html', lang);
      const g = await pg.evaluate(() => ({ prof: document.getElementById('prof-tech').textContent + document.getElementById('prof-exp').textContent + document.getElementById('prof-note').textContent,
        riv: document.getElementById('rivals-global').textContent }));
      check(lang === 'en' ? /Basic/.test(g.prof) && /First voyage/.test(g.prof) && !vn.test(g.prof.replace(/Lumina:/, '')) : /Cơ bản/.test(g.prof),
        'global.html, ' + lang + ': hồ sơ doanh nghiệp đúng ngôn ngữ');
      check(lang === 'en' ? /How to beat them/.test(g.riv) && /Your team/.test(g.riv) && !/Khắc chế/.test(g.riv) : /Khắc chế/.test(g.riv), 'global.html, ' + lang + ': thẻ đối thủ đúng ngôn ngữ');
      check(err.length === 0, 'global.html, ' + lang + ': không lỗi trang' + (err[0] ? ': ' + err[0] : '')); await ctx.close();

      ({ ctx, pg, err } = await mo('brand-passport-learning.html', lang));
      const bp = await pg.evaluate(() => [...document.querySelectorAll('#lumina-panel label, #lumina-panel small, .ethics-note, #save-reflection, #export-trace')].map(e => e.textContent).join(' | '));
      check(lang === 'en' ? /Learner reflection/.test(bp) && /Data governance/.test(bp) && /Save reflection/.test(bp) && !/Phản tư của người học/.test(bp) : /Phản tư của người học/.test(bp),
        'brand-passport-learning.html, ' + lang + ': bảng Lumina đúng ngôn ngữ');
      await ctx.close();

      for (const [u, sel, en] of [['truong-hoc-thuat.html', 'p.af-note', /full working notes/], ['thiet-ke-nghien-cuu.html', 'td[data-en-html]', /anchor items/], ['app/release.html', 'p[data-en-html]', /kept on this device/]]) {
        ({ ctx, pg } = await mo(u, lang));
        const t = await pg.evaluate(s => [...document.querySelectorAll(s)].map(e => e.textContent).join(' '), sel);
        check(lang === 'en' ? en.test(t) : !en.test(t) && vn.test(t), u + ', ' + lang + ': đoạn có thẻ con đúng ngôn ngữ');
        await ctx.close();
      }
    }
  } catch (e) { console.error(e); fails++; }
  await b.close();
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nra-soat-web-11-2026: ok');
  process.exit(fails ? 1 : 0);
})();
