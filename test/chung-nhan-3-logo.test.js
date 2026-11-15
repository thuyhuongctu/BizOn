// Chứng nhận nhiều logo (15/11/2026, lớp quốc tế UM Kendari × ĐH Cần Thơ): ô logo trái/phải ở Trang Giảng viên nhận tối đa 2 đường dẫn
// cách nhau bằng «|» – không đổi cơ sở dữ liệu (cột org_logo/org_logo2 ≤ 300 ký tự). Logo UM Kendari nền trong suốt ở assets/docs.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 873);
const cert = read('js/official-cert.js');
assert.match(cert, /function splitLogos\(v\) \{ return String\(v \|\| ''\)\.split\('\|'\)[^\n]*\.slice\(0, 2\); \}/);
assert.match(cert, /drawLogos\(g, leftLogos, false\);\s*drawLogos\(g, rightLogos, true\);/);
const gv = read('Trang Giang Vien.dc.html');
assert.match(gv, /k43: t\('Đường dẫn logo bên trái \(tuỳ chọn; hai logo thì cách nhau bằng dấu \|\)'/);
assert.match(gv, /k44: t\('Đường dẫn logo bên phải [^']*cách nhau bằng dấu \|\)'/);
// Ngôn ngữ chứng nhận: mặc định English, giảng viên chọn Tiếng Việt trước khi in (15/11/2026)
assert.match(cert, /var lang = opts\.lang === 'vi' \? 'vi' : 'en';/);
assert.ok(gv.includes("certOpts(st) { const s = this.state; return { lang: s.certLang === 'vi' ? 'vi' : 'en',"));
assert.ok(gv.includes('<select value="{{ certLangSel }}" onChange="{{ onCertLang }}"') && gv.includes('<option value="en">English</option><option value="vi">Tiếng Việt</option>'));
assert.ok(gv.includes("certLangLabel: t('Ngôn ngữ chứng nhận', 'Certificate language')"));
const umk = fs.readFileSync(path.join(ROOT, 'assets/docs/umk-logo.png'));
assert.equal(umk.slice(1, 4).toString(), 'PNG'); assert.equal(umk[25], 6, 'PNG có kênh alpha (nền trong suốt)');
const LOGOS = ['assets/docs/ctu-logo.png', 'assets/docs/soe-logo.png', 'assets/docs/umk-logo.png'];
assert.ok('assets/docs/ctu-logo.png | assets/docs/soe-logo.png'.length <= 300);

(async () => {
  const b = await chromium.launch(); const errs = [];
  try {
    const p = await b.newPage(); p.on('pageerror', e => errs.push(e.message));
    const got = []; p.on('request', r => { const m = /assets\/docs\/[\w-]+\.png/.exec(r.url()); if (m) got.push(m[0]); });
    await p.goto(BASE + '/game.html?lang=en', { waitUntil: 'load', timeout: 60000 });
    await p.waitForFunction(() => window.OfficialCert, null, { timeout: 30000 });
    await p.evaluate(() => { window.BIZON_BACKEND = { enabled: false }; });
    const org = { org_name: 'Can Tho University', org_sub: 'School of Economics', org_logo: 'assets/docs/ctu-logo.png | assets/docs/soe-logo.png', org_logo2: 'assets/docs/umk-logo.png', signer_name: 'Assoc. Prof. Dr. Phan Anh Tu', signer_title: 'Lecturer' };
    // Đếm số ảnh thật sự vẽ lên canvas (logo + chữ ký) bằng cách bọc drawImage.
    const r = await p.evaluate(async (org) => {
      const C = CanvasRenderingContext2D.prototype, d0 = C.drawImage; const drawn = [];
      C.drawImage = function (img, x, y, w, h) { drawn.push([img.src.replace(/^.*\/assets/, 'assets'), Math.round(x), Math.round(y), Math.round(w), Math.round(h)]); return d0.apply(this, arguments); };
      const cv = await OfficialCert.render({ name: 'Siti', courseCode: 'KT330H', courseName: 'Entrepreneurship', courseDates: '17–19 November 2026', org });
      const one = []; C.drawImage = function (img, x, y, w, h) { one.push([img.src.replace(/^.*\/assets/, 'assets'), Math.round(w)]); return d0.apply(this, arguments); };
      await OfficialCert.render({ name: 'A', org: { org_name: 'X', org_logo: 'assets/docs/ctu-logo.png', org_logo2: 'assets/docs/soe-logo.png' } });
      C.drawImage = d0; return { w: cv.width, drawn, one };
    }, org);
    assert.equal(r.w, 1400);
    const logos = r.drawn.filter(d => /docs\/(ctu|soe|umk)-logo/.test(d[0]));
    assert.deepEqual(logos.map(d => d[0]), LOGOS, 'vẽ đủ 3 logo theo thứ tự trái → phải');
    assert.ok(logos.slice(0, 2).every(d => d[3] <= 115 && d[4] <= 115 && d[2] >= 60), 'hai logo bên trái thu về khung 115 px: ' + JSON.stringify(logos));
    assert.ok(logos[2][4] > 115, 'một logo bên phải giữ khung 150 px');
    assert.ok(logos[0][1] < logos[1][1] && logos[1][1] + logos[1][3] < 330, 'hai logo trái nằm cạnh nhau, không lấn tiêu đề');
    assert.ok(logos[2][1] > 1080, 'logo UM Kendari ở góc phải');
    const one = r.one.filter(d => /docs\/(ctu|soe)-logo/.test(d[0]));
    assert.equal(one.length, 2); assert.ok(one.every(d => d[1] > 115), 'một logo mỗi bên vẫn dùng khung 150 px như cũ');
    for (const l of LOGOS) assert.ok(got.includes(l), 'đã tải ' + l);
    assert.deepEqual(errs, []);
    console.log('chung-nhan-3-logo: ok');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
