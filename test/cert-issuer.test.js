'use strict';
// Chứng nhận chính thức: đơn vị cấp do giảng viên cấu hình, mặc định BizOn (không còn ĐH Cần Thơ viết cứng trong mã).
// Migration 20261029000000_cert_issuer.sql, js/official-cert.js, Trang Giảng viên, nhãn nút ở mọi game, trang chính sách, README.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// --- 1 · mô-đun: không còn trường nào viết cứng; mặc định BizOn ---
const cert = read('js/official-cert.js'), certCode = cert.slice(cert.indexOf('*/'));   // bỏ chú thích đầu tệp (dòng bản quyền)
for (const bad of ['ctu-logo', 'soe-logo', 'sig-tu-in', 'CAN THO UNIVERSITY', 'SCHOOL OF ECONOMICS', 'Phan Anh T', 'KT330H', 'Entrepreneurship', 'Cần Thơ']) assert.ok(!certCode.includes(bad), 'official-cert.js còn: ' + bad);
assert.match(cert, /var BIZON = \{ logo: 'assets\/icons\/icon-512\.png', sig: 'assets\/docs\/sig-huong-in\.png', signer: 'Đỗ Thùy Hương' \};/);
assert.match(cert, /window\.OfficialCert = \{ download: download, render: render, fileName: fileName, fetchConfig: fetchConfig, issuer: issuer, DEFAULTS: DEFAULTS \};/);
assert.ok(cert.includes("'-ChungNhan-'") && !cert.includes('ChungNhanDHCT'));
assert.ok(fs.existsSync(path.join(ROOT, 'assets/docs/sig-huong-in.png')) && fs.existsSync(path.join(ROOT, 'assets/icons/icon-512.png')));

// --- 2 · migration + API + Trang Giảng viên ---
const mig = read('supabase/migrations/20261029000000_cert_issuer.sql');
for (const col of ['org_name', 'org_sub', 'org_logo', 'org_logo2', 'signer_name', 'signer_title', 'signer_sig']) { assert.ok(mig.includes('add column if not exists ' + col), col); assert.ok(mig.includes("'" + col + "', c." + col), 'feed ' + col); }
assert.match(mig, /create or replace function public\.bizon_set_cert_issuer\(p_class_code text, p_org_name text, p_org_sub text, p_org_logo text, p_org_logo2 text, p_signer_name text, p_signer_title text, p_signer_sig text\)/);
assert.ok(mig.includes("if not bizon_owns_class(v) then raise exception"));
assert.ok(mig.includes("grant execute on function public.bizon_set_cert_issuer(text,text,text,text,text,text,text,text) to authenticated;"));
assert.ok(mig.includes("'course_code', '', 'course_name', 'BizOn Bật Nghiệp'"), 'feed mặc định không còn KT330H');
const api = read('js/instructor-api.js');
assert.match(api, /async setCertIssuer\(code, c\) \{ if \(demo\) \{ Object\.assign\(D\.cert, c\); return true; \}/);
assert.ok(api.includes("rpc('bizon_set_cert_issuer', { p_class_code: code, p_org_name: c.org_name || ''"));
assert.ok(api.includes("cert: { course_code: '', course_name: 'BizOn Bật Nghiệp', course_dates: '', org_name: ''"));
const gv = read('Trang Giang Vien.dc.html');
for (const k of ['certOrgName', 'certOrgSub', 'certOrgLogo', 'certOrgLogo2', 'certSignerName', 'certSignerTitle']) assert.ok(gv.includes('value="{{ ' + k + ' }}"') && gv.includes(k + ': s.' + k), 'Trang GV ' + k);
assert.ok(gv.includes('saveCertIssuer: () => this.saveCertIssuer()') && gv.includes('org: this.certIssuer()'));
assert.ok(!gv.includes('ĐHCT') && !gv.includes('ĐH Cần Thơ') && !gv.includes("'KT330H'"), 'Trang GV còn tham chiếu ĐHCT');

// --- 3 · nhãn nút: không còn «ĐHCT» / «CTU certificate» ở trang và template ---
const pages = ['game.html', 'brand-passport.html', 'ben-phu-sa.html', 'ben-phu-sa-v8.html', 'ben-phu-sa-3d.html', 'Ho Chieu Thuong Hieu 3D.html', 'lab/ho-chieu-sau-rieng.html', 'Ho Chieu Mini.dc.html', 'giang-vien.html', 'js/app.js'];
for (const f of pages) { const s = read(f); assert.ok(!/ĐHCT|CTU certificate|kiểu ĐH Cần Thơ/.test(s), f + ' còn nhãn ĐHCT'); }
assert.ok(read('game.html').includes('🎓 Chứng nhận chính thức</button>'));
assert.ok(read('brand-passport.html').includes('data-en="🎓 Official certificate"'));
{ const lines = read('lab/ho-chieu-sau-rieng-3d.html').split('\n'); const tpl = JSON.parse(lines[lines.findIndex(l => l.trim() === '<script type="__bundler/template">') + 1]);
  assert.ok(tpl.includes("rpCertOfficial: '🎓 Chứng nhận chính thức'") && tpl.includes("rpCertOfficial: '🎓 Official certificate'") && !tpl.includes('ĐHCT'), 'template Sầu Riêng 3D'); }
// chính sách + README: CTU dùng theo giấy phép, không còn «miễn phí cho CTU»
assert.ok(read('chinh-sach.html').includes('Trường Đại học Cần Thơ sử dụng theo giấy phép bằng văn bản do tác giả cấp'));
assert.ok(!read('chinh-sach.html').includes('miễn phí cho Trường Đại học Cần Thơ'));
assert.ok(read('README.md').includes('**Can Tho University** uses the two pillars under a written licence granted by the authors'));
assert.ok(!read('README.md').includes('are free for **Can Tho University**'));
{ const sw = read('sw.js'); assert.match(sw, /const CACHE = 'bizon-v\d+';/); assert.ok(sw.includes("'./js/official-cert.js'")); }

// --- 4 · trình duyệt: vẽ chứng nhận mặc định BizOn và chứng nhận theo đơn vị cấu hình ---
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } }); const errors = [];
  page.on('pageerror', e => errors.push('err: ' + e.message));
  await page.route(/\.(mp3|m4a|mp4|webm)(\?|$)/, r => r.abort());
  await page.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {}
    window.__drawn = []; window.__imgs = [];
    const ft = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (t) { window.__drawn.push(String(t)); return ft.apply(this, arguments); };
    const di = CanvasRenderingContext2D.prototype.drawImage; CanvasRenderingContext2D.prototype.drawImage = function (img) { window.__imgs.push(img && img.src ? img.src.replace(/^.*\/assets\//, 'assets/') : '?'); return di.apply(this, arguments); }; });
  await page.goto(`${BASE}/game.html`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.OfficialCert && window.OfficialCert.issuer, null, { timeout: 30000 });
  // Không gọi máy chủ thật: tắt backend trong trang để fetchConfig rơi về mặc định (feed trực tiếp phụ thuộc migration đã áp hay chưa).
  await page.evaluate(() => { window.BIZON_BACKEND = { enabled: false }; });
  const r1 = await page.evaluate(async () => { const cfg = await OfficialCert.fetchConfig('ANY-CLASS'); const I = OfficialCert.issuer(); window.__drawn = []; window.__imgs = []; const cv = await OfficialCert.render({ name: 'Nguyễn Văn A', courseDates: '20/10/2026' }); return { cfg, custom: I.custom, w: cv.width, h: cv.height, drawn: window.__drawn, imgs: window.__imgs, file: OfficialCert.fileName({ name: 'Nguyễn Văn A', filenamePrefix: 'BizOn-BatNghiep' }) }; });
  assert.equal(r1.custom, false); assert.equal(r1.cfg.org_name, ''); assert.equal(r1.cfg.course_name, 'BizOn Bật Nghiệp'); assert.equal(r1.cfg.course_code, '');
  assert.deepEqual([r1.w, r1.h], [1400, 990]);
  for (const t of ['BIZONLAND', 'CERTIFICATE OF COMPLETION', 'Nguyễn Văn A', 'Đỗ Thùy Hương', 'Người sáng lập BizOn', '“BizOn Bật Nghiệp”']) assert.ok(r1.drawn.includes(t), 'mặc định thiếu: ' + t);
  assert.ok(r1.drawn.some(t => t.includes('trên nền tảng BizOn · bizonland.com')));
  assert.ok(!r1.drawn.some(t => /CAN THO|Cần Thơ|Phan Anh/.test(t)), 'mặc định không nhắc ĐHCT: ' + r1.drawn.join(' | '));
  assert.ok(r1.imgs.includes('assets/icons/icon-512.png') && r1.imgs.includes('assets/docs/sig-huong-in.png'), 'logo BizOn + chữ ký in: ' + r1.imgs.join(','));
  assert.equal(r1.file, 'BizOn-BatNghiep-ChungNhan-NguyenVanA.png');
  const r2 = await page.evaluate(async () => { window.__drawn = []; window.__imgs = []; await OfficialCert.render({ name: 'Trần Thị B', courseCode: 'KT330H', courseName: 'Entrepreneurship', courseDates: '4–11/3/2026', org: { org_name: 'Trường Đại học Cần Thơ', org_sub: 'Trường Kinh tế', org_logo: 'assets/docs/ctu-logo.png', org_logo2: 'assets/docs/soe-logo.png', signer_name: 'PGS.TS. Phan Anh Tú', signer_title: 'Trường Kinh tế, Đại học Cần Thơ', signer_sig: 'assets/docs/sig-tu-in.png' } }); return { drawn: window.__drawn, imgs: window.__imgs }; });
  for (const t of ['TRƯỜNG ĐẠI HỌC CẦN THƠ', 'TRƯỜNG KINH TẾ', 'CERTIFICATE OF PARTICIPATION', 'Trần Thị B', '“Entrepreneurship – Code KT330H”', 'PGS.TS. Phan Anh Tú', 'Trường Kinh tế, Đại học Cần Thơ']) assert.ok(r2.drawn.includes(t), 'theo đơn vị thiếu: ' + t);
  assert.ok(r2.drawn.some(t => t.includes('tại Trường Kinh tế, Trường Đại học Cần Thơ · trên nền tảng BizOn')));
  assert.ok(r2.imgs.includes('assets/docs/ctu-logo.png') && r2.imgs.includes('assets/docs/soe-logo.png') && r2.imgs.includes('assets/docs/sig-tu-in.png') && !r2.imgs.includes('assets/icons/icon-512.png'), 'mẫu CTU như cũ: logo CTU trái, logo Trường Kinh tế phải, chữ ký thầy, không logo BizOn: ' + r2.imgs.join(','));
  assert.ok(!r2.drawn.includes('Đỗ Thùy Hương'), 'mẫu CTU chỉ một người ký');
  // đơn vị có tên nhưng không có người ký: ghi tên đơn vị thay chữ ký, không vẽ ảnh chữ ký
  const r3 = await page.evaluate(async () => { window.__drawn = []; window.__imgs = []; await OfficialCert.render({ name: 'C', org: { org_name: 'Đại học X' } }); return { drawn: window.__drawn, imgs: window.__imgs }; });
  assert.ok(r3.drawn.includes('ĐẠI HỌC X') && r3.drawn.filter(t => t === 'Đại học X').length >= 2 && !r3.imgs.some(s => /sig-/.test(s)) && r3.imgs.includes('assets/icons/icon-512.png'), 'không có logo thứ hai → logo BizOn góc phải');
  await browser.close();
  assert.deepEqual(errors, [], 'không lỗi JS');
  console.log('cert-issuer: OK');
})().catch(e => { console.error(e); process.exit(1); });
