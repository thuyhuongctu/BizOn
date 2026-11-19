/* Trang Giảng viên, mục «Nguồn dữ liệu mở» (19/11/2026): chỉ mở cho sinh viên/giảng viên đã đăng nhập bằng email trường,
 * hoặc khách để lại email có đồng ý (lưu qua RPC bizon_guest_signup, migration 20261119000000_khach_dang_ky_email.sql).
 * Kiểm: chưa mở thì không có liên kết nào trong trang; khách thiếu đồng ý/email sai bị chặn và không gửi gì;
 * gửi đúng thì mở và nhớ trên máy; phiên sinh viên hoặc giảng viên mở thẳng; máy chủ lỗi thì vẫn khóa; VI/EN; 360 px không tràn. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }

const mig = fs.readFileSync(path.join(ROOT, 'supabase/migrations/20261119000000_khach_dang_ky_email.sql'), 'utf8');
assert.match(mig, /alter table public\.guest_signups enable row level security/);
assert.match(mig, /revoke all on table public\.guest_signups from public, anon, authenticated/);
assert.match(mig, /security definer\s+set search_path = public/);
assert.match(mig, /grant execute on function public\.bizon_guest_signup\(text, boolean, text, text\) to anon, authenticated/);
assert.ok(!/drop table|delete from|truncate/i.test(mig), 'migration không xoá dữ liệu');
assert.ok(fs.readFileSync(path.join(ROOT, '.github/workflows/supabase-migrate.yml'), 'utf8').includes('20261119000000_khach_dang_ky_email.sql'), 'có trong danh sách áp migration');
assert.ok(fs.readFileSync(path.join(ROOT, '.github/workflows/supabase-student-login.yml'), 'utf8').includes('-f test/sql/khach_dang_ky_email_smoke.sql'), 'CI chạy smoke SQL');
assert.ok(+(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 897, 'sw.js ≥ v897');

(async () => {
  const b = await chromium.launch(); const errs = [];
  async function page({ lang = 'vi', width = 1280, init, rpc = 200 } = {}) {
    const ctx = await b.newContext({ viewport: { width, height: 900 } });
    const p = await ctx.newPage(); const sent = [];
    p.on('pageerror', e => errs.push(e.message));
    await ctx.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await ctx.route(/supabase\.co\//, r => {
      const u = r.request().url();
      if (/rpc\/bizon_guest_signup/.test(u)) { sent.push(JSON.parse(r.request().postData() || '{}')); return r.fulfill({ status: rpc, contentType: 'application/json', body: rpc === 200 ? 'true' : '{"message":"lỗi máy chủ"}' }); }
      return r.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await ctx.addInitScript(([l, extra]) => { try { localStorage.setItem('bizon-lang', l); localStorage.setItem('bizon-tour-seen', '1'); if (extra) (new Function(extra))(); } catch (e) {} }, [lang, init || '']);
    await p.goto(BASE + '/giang-vien.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 });
    await p.waitForTimeout(500);
    return { p, ctx, sent };
  }
  const state = p => p.evaluate(() => ({
    locked: !document.getElementById('nguon-mo-khoa').hidden,
    links: document.querySelectorAll('#nguon-mo a[href*="marinetraffic"], #nguon-mo a[href*="worldbank"]').length,
    text: document.getElementById('nguon-mo').innerText,
    flag: localStorage.getItem('bizon-nguon-mo'),
    over: document.documentElement.scrollWidth - innerWidth,
  }));
  try {
    // 1. Khách mới: khóa, không có liên kết; thiếu đồng ý hoặc email sai thì không gửi.
    let { p, ctx, sent } = await page();
    let s = await state(p);
    assert.ok(s.locked && s.links === 0, 'khách mới: mục bị khóa, chưa có liên kết');
    assert.ok(s.text.includes('Dành cho sinh viên, giảng viên và khách đã đăng ký'));
    await p.fill('#nguon-mo-email', 'khach@vidu.com'); await p.click('#nguon-mo-form button[type=submit]');
    assert.match(await p.textContent('#nguon-mo-msg'), /đồng ý/); assert.equal(sent.length, 0, 'thiếu đồng ý thì không gửi');
    await p.fill('#nguon-mo-email', 'khong-phai-email'); await p.check('#nguon-mo-dongy'); await p.click('#nguon-mo-form button[type=submit]');
    assert.match(await p.textContent('#nguon-mo-msg'), /Email chưa đúng/); assert.equal(sent.length, 0, 'email sai thì không gửi');
    // 2. Gửi đúng: mở danh sách, nhớ trên máy, tải lại vẫn mở.
    await p.fill('#nguon-mo-email', 'khach@vidu.com'); await p.click('#nguon-mo-form button[type=submit]');
    await p.waitForFunction(() => document.getElementById('nguon-mo-khoa').hidden);
    assert.deepEqual(sent, [{ p_email: 'khach@vidu.com', p_consent: true, p_lang: 'vi', p_source: 'giang-vien' }]);
    s = await state(p); assert.ok(!s.locked && s.links === 2 && s.flag === 'khach', 'gửi xong: mở danh sách và nhớ trên máy');
    await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(400);
    s = await state(p); assert.ok(!s.locked && s.links === 2, 'tải lại: vẫn mở');
    await ctx.close();

    // 3. Máy chủ lỗi: vẫn khóa, báo lỗi, không nhớ.
    ({ p, ctx, sent } = await page({ rpc: 500 }));
    await p.fill('#nguon-mo-email', 'khach@vidu.com'); await p.check('#nguon-mo-dongy'); await p.click('#nguon-mo-form button[type=submit]');
    await p.waitForFunction(() => /Chưa lưu được/.test(document.getElementById('nguon-mo-msg').textContent));
    s = await state(p); assert.ok(s.locked && s.links === 0 && !s.flag, 'máy chủ lỗi: vẫn khóa');
    await ctx.close();

    // 4. Sinh viên đăng nhập (phiên trong sessionStorage) và giảng viên đăng nhập: mở thẳng, không cần email.
    ({ p, ctx } = await page({ init: "sessionStorage.setItem('bizon-student-session', JSON.stringify({accessToken:'x', refreshToken:'y', email:'sv@student.ctu.edu.vn', expiresAt: Date.now()+3e6}))" }));
    s = await state(p); assert.ok(!s.locked && s.links === 2, 'sinh viên đăng nhập: mở thẳng'); await ctx.close();
    ({ p, ctx } = await page({ init: "localStorage.setItem('bizon-instructor-session', JSON.stringify({access:'x', refresh:'y', exp: Date.now()+3e6, email:'gv@ctu.edu.vn'}))" }));
    s = await state(p); assert.ok(!s.locked && s.links === 2, 'giảng viên đăng nhập: mở thẳng'); await ctx.close();

    // 5. Tiếng Anh, điện thoại 360 px: khóa bằng tiếng Anh, gửi xong danh sách cũng tiếng Anh, không tràn ngang.
    ({ p, ctx, sent } = await page({ lang: 'en', width: 360 }));
    s = await state(p);
    assert.ok(s.text.includes('For students, instructors and registered guests') && s.over <= 0, 'en 360: khóa tiếng Anh, không tràn (' + s.over + ')');
    await p.fill('#nguon-mo-email', 'guest@example.com'); await p.check('#nguon-mo-dongy'); await p.click('#nguon-mo-form button[type=submit]');
    await p.waitForFunction(() => document.getElementById('nguon-mo-khoa').hidden);
    s = await state(p);
    assert.equal(sent[0].p_lang, 'en');
    assert.ok(s.text.includes('real container ships around Cát Lái port right now'), 'en: danh sách mở ra bằng tiếng Anh');
    assert.ok(s.over <= 0, 'en 360 sau khi mở: không tràn ' + s.over);
    await ctx.close();

    assert.deepEqual(errs, []);
    console.log('nguon-mo-khoa: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
