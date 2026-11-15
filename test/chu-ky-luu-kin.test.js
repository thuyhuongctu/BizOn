/* Chữ ký thật lưu kín theo lớp (chị Hương, 15/11/2026 – lớp quốc tế UM Kendari, thầy Tú không có sẵn tệp ở máy khác).
 * - Migration: bảng riêng bật RLS, không cấp cho anon/authenticated; chỉ chủ lớp đọc/ghi qua hàm; feed công khai không đổi.
 * - Trang Giảng viên: chọn ảnh chữ ký → lưu kín cho lớp đang mở; mở lớp ở máy khác (không còn ảnh trên máy) vẫn tự nạp.
 * - Bản sinh viên tự tải: người ký là thầy Tú/cô Hương thì dùng chữ ký in (sig-tu-in/sig-huong-in), người khác chỉ in tên.
 * Chạy thật bằng Playwright với lớp mẫu DEMO-2026. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const mig = R('supabase/migrations/20261115010000_chu_ky_luu_kin.sql');
assert.match(mig, /create table if not exists public\.class_cert_signature/);
assert.match(mig, /alter table public\.class_cert_signature enable row level security;/);
assert.match(mig, /revoke all on table public\.class_cert_signature from public, anon, authenticated;/);
assert.ok(!/create policy/i.test(mig), 'không mở policy nào cho bảng chữ ký');
assert.ok(!/bizon_cert_feed/.test(mig.replace(/^--.*$/gm, '')), 'không đụng tới feed công khai');
for (const fn of ['bizon_get_cert_signature(text)', 'bizon_set_cert_signature(text, text)']) {
  assert.ok(mig.includes('revoke all on function public.' + fn + ' from public, anon;'), 'khoá anon: ' + fn);
  assert.ok(mig.includes('grant execute on function public.' + fn + ' to authenticated;'), 'cấp cho người đăng nhập: ' + fn);
}
assert.equal((mig.match(/if not bizon_owns_class\(v\) then raise exception/g) || []).length, 2, 'cả hai hàm kiểm chủ lớp');
assert.match(mig, /\^data:image\/\(png\|jpeg\|webp\);base64,/);
const wf = R('.github/workflows/supabase-student-login.yml'), mg = R('.github/workflows/supabase-migrate.yml');
assert.ok(wf.includes('test/sql/chu_ky_luu_kin_smoke.sql') && wf.includes('supabase/migrations/20261115010000_chu_ky_luu_kin.sql'), 'CI chạy smoke + áp lại');
assert.ok(mg.includes('- 20261115010000_chu_ky_luu_kin.sql'), 'workflow áp production có migration này');
const api = R('js/instructor-api.js');
assert.ok(api.includes("rpc('bizon_get_cert_signature', { p_class_code: code })") && api.includes("rpc('bizon_set_cert_signature', { p_class_code: code, p_sig: sig || '' })"));
const cert = R('js/official-cert.js');
assert.match(cert, /signerSig: \(c\.signer_sig \|\| ''\)\.trim\(\) \|\| printedSig\(c\.signer_name\)/);
assert.ok(!/getCertSignature|bizon_get_cert_signature/.test(cert), 'chứng nhận sinh viên không gọi hàm chữ ký kín');
assert.ok(+(R('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 876, 'sw.js ≥ bizon-v876');
const SIG = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '..', 'assets/docs/sig-tu-in.png')).toString('base64');

(async () => {
  const m = await import('../scripts/release/apply-supabase-migration.mjs');
  assert.ok(m.CHECKS.chu_ky_luu_kin && m.CHECKS.chu_ky_luu_kin.pre.length >= 1 && m.CHECKS.chu_ky_luu_kin.post.length >= 4, 'có kiểm tra trước/sau khi áp');
  const b = await chromium.launch();
  try {
    const ctx = await b.newContext({ viewport: { width: 1200, height: 900 } }); const p = await ctx.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); localStorage.removeItem('bizon-lang-auto'); } catch (e) {} });
    await p.goto(BASE + '/Trang%20Giang%20Vien.dc.html', { timeout: 60000 }); await p.waitForTimeout(2500);
    await p.getByText('lớp mẫu DEMO-2026').first().click(); await p.waitForTimeout(2500);
    const openDash = async () => { await p.getByText('Mở bảng điều khiển →').first().click(); await p.waitForTimeout(2500); await p.getByText('🎛 Điều khiển lớp', { exact: true }).first().click(); await p.waitForTimeout(1200); };
    await openDash();
    assert.equal(await p.getByText('☁️ Đã lưu kín trên hệ thống cho lớp này').count(), 0, 'chưa có chữ ký thì chưa báo đã lưu');
    // Chọn ảnh chữ ký → tự lưu kín cho lớp đang mở.
    await p.locator('input[type=file][accept^="image/png"]').setInputFiles({ name: 'chu-ky.png', mimeType: 'image/png', buffer: Buffer.from(SIG.split(',')[1], 'base64') });
    await p.waitForTimeout(1500);
    assert.ok(await p.getByText('☁️ Đã lưu kín trên hệ thống cho lớp này').count(), 'báo đã lưu kín');
    assert.ok(await p.getByText(/Đã lưu kín chữ ký trên hệ thống cho lớp DEMO-2026/).count(), 'thông báo lưu kín');
    assert.ok(await p.evaluate(() => (window.BizOnInstructor && window.BizOnInstructor.getCertSignature('DEMO-2026'))).then(s => /^data:image\/png;base64,/.test(s)), 'hệ thống (demo) giữ ảnh');
    // Máy khác: xoá ảnh trên máy, mở lại lớp → vẫn tự nạp từ hệ thống.
    await p.evaluate(() => localStorage.removeItem('bizon-gv-sig-tu'));
    await p.getByText('← Lớp của tôi').first().click(); await p.waitForTimeout(1500);
    await openDash();
    assert.ok(await p.getByText('☁️ Đã lưu kín trên hệ thống cho lớp này').count(), 'mở lại lớp: tự nạp chữ ký đã lưu kín');
    assert.ok(await p.evaluate(() => [...document.querySelectorAll('img[alt="Chữ ký đã chọn"]')].some(i => i.src.startsWith('data:image/png;base64,') && i.naturalWidth > 10)), 'hiện ảnh chữ ký đã nạp');
    // Xoá khỏi hệ thống.
    p.on('dialog', d => d.accept());
    await p.getByText('Xoá khỏi hệ thống', { exact: true }).first().click(); await p.waitForTimeout(800);
    assert.equal(await p.getByText('☁️ Đã lưu kín trên hệ thống cho lớp này').count(), 0, 'đã xoá khỏi hệ thống');
    assert.equal(await p.evaluate(() => window.BizOnInstructor.getCertSignature('DEMO-2026')), '');
    // Bản sinh viên tự tải: chữ ký in cho thầy Tú, người ký khác chỉ in tên.
    const imgs = await p.evaluate(async () => {
      const C = CanvasRenderingContext2D.prototype, d0 = C.drawImage, out = {};
      for (const [k, who] of [['tu', 'Assoc. Prof. Dr. Phan Anh Tu'], ['tuVi', 'PGS.TS. Phan Anh Tú'], ['khac', 'TS. Nguyễn Văn B']]) {
        const got = []; C.drawImage = function (img) { got.push(String(img.src).replace(/^.*\/assets/, 'assets')); return d0.apply(this, arguments); };
        await OfficialCert.render({ name: 'T07 Kendari Clay', org: { org_name: 'Can Tho University', signer_name: who, signer_title: 'Lecturer', signer_sig: '' } }); out[k] = got;
      }
      C.drawImage = d0; return out;
    });
    assert.ok(imgs.tu.includes('assets/docs/sig-tu-in.png') && imgs.tuVi.includes('assets/docs/sig-tu-in.png'), 'thầy Tú: chữ ký in');
    assert.ok(!imgs.khac.some(s => /sig-/.test(s)), 'người ký khác: không gắn chữ ký của ai');
    assert.deepEqual(loi, [], 'không lỗi JS');
    console.log('chu-ky-luu-kin: ok');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
