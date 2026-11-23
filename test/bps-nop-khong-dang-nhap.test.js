/* Bến Phù Sa: nộp kết quả không cần đăng nhập (23/11/2026). Chưa đăng nhập thì trang gọi bizon_submit_ft_result_khach bằng khóa
 * anon (không gửi email), báo «Đã nộp (chưa đăng nhập)»; máy chủ báo lỗi thì hiện đúng lời báo. Đã đăng nhập thì vẫn gọi hàm cũ
 * (kiểm ở test/journey-submit.test.js). Kiểm SQL ở test/sql/ben_phu_sa_nop_khong_dang_nhap_smoke.sql (workflow Supabase).
 * Chơi thật bản ben-phu-sa.html; bản 3D và v8 kiểm có cùng mã gọi hàm. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const sql = read('supabase/migrations/20261123010000_ben_phu_sa_nop_khong_dang_nhap.sql');
check(/grant execute on function public\.bizon_submit_ft_result_khach\([^)]*\) to anon, authenticated/.test(sql) && /student_email[\s\S]*null, null/.test(sql) && /nop_khong_dang_nhap/.test(sql), 'migration: khách gọi được, không lưu email, đánh dấu nộp không đăng nhập');
check(/ben_phu_sa_nop_khong_dang_nhap_smoke\.sql/.test(read('.github/workflows/supabase-student-login.yml')), 'workflow Supabase chạy kiểm SQL');
for (const t of ['ben-phu-sa-3d.html', 'ben-phu-sa-v8.html']) { const s = read(t); check(s.includes("'bizon_submit_ft_result_khach'") && s.includes('async function rpcKhach') && !s.includes("Đăng nhập email trường ở khung phía trên trước đã nhé"), t + ': cùng đường nộp không đăng nhập'); }
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 964, 'sw.js ≥ bizon-v964');
(async () => {
  const b = await chromium.launch();
  async function choi(traVe) {
    const ctx = await b.newContext({ viewport: { width: 1000, height: 800 } });
    await ctx.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
    await ctx.route(/googleapis|gstatic|goatcounter|\.mp3|\.mp4/, r => r.abort());
    const goi = [];
    await ctx.route('**/rest/v1/**', async r => {
      const u = r.request().url(), fn = u.includes('/rpc/') ? u.split('/rpc/')[1].split('?')[0] : '';
      let body = {}; try { body = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
      goi.push({ fn, body, auth: r.request().headers().authorization || '' });
      if (fn === 'bizon_submit_ft_result_khach') return r.fulfill(traVe);
      return r.fulfill({ status: 200, contentType: 'application/json', body: fn === 'bizon_student_domains' ? '["student.ctu.edu.vn"]' : 'null' });
    });
    const pg = await ctx.newPage();
    await pg.goto(BASE + '/ben-phu-sa.html?lop=qtkd-2026-a', { waitUntil: 'commit', timeout: 60000 });
    await pg.waitForFunction(() => !!window.ftTest, null, { timeout: 60000 });
    await pg.evaluate(() => { window.ftTeam(0); window.ftStart(); });
    for (let w = 0; w < 5; w++) {
      await pg.evaluate(() => { window.ftPick('menu', 0); window.ftPick('loc', 2); window.ftPick('m', 1); window.ftCommit(); });
      await pg.waitForTimeout(150);
      if (await pg.evaluate(() => window.ftTest.phase() === 'ritual')) await pg.evaluate(() => window.ftRitualNext(true));
    }
    await pg.waitForFunction(() => window.ftTest.phase() === 'end', null, { timeout: 15000 });
    await pg.evaluate(() => { document.getElementById('ft-name').value = 'Út Sen'; return window.ftSubmit(); });
    await pg.waitForTimeout(800);
    const tb = await pg.evaluate(() => document.getElementById('ft-send-msg').textContent);
    await ctx.close(); return { goi: goi.filter(g => /submit_ft/.test(g.fn)), tb };
  }
  try {
    let { goi, tb } = await choi({ status: 204, body: '' });
    check(goi.length === 1 && goi[0].fn === 'bizon_submit_ft_result_khach', 'chưa đăng nhập: gọi hàm nộp không đăng nhập (' + goi.map(g => g.fn).join(',') + ')');
    const p = (goi[0] || {}).body || {};
    check(p.p_class_code === 'QTKD-2026-A' && p.p_player_name === 'Út Sen' && p.p_final_rank >= 1 && p.p_final_rank <= 4 && !JSON.stringify(p).includes('@'), 'gửi mã lớp từ đường dẫn, biệt danh, hạng 1–4, không có email');
    check(/^Bearer sb_publishable_/.test((goi[0] || {}).auth || ''), 'dùng khóa anon công khai, không dùng phiên đăng nhập');
    check(/Đã nộp \(chưa đăng nhập\)/.test(tb), 'báo «Đã nộp (chưa đăng nhập)»: ' + tb.slice(0, 60));
    ({ tb } = await choi({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Quá nhiều lượt nộp cho lớp này trong một phút, thử lại sau.' }) }));
    check(/Quá nhiều lượt nộp/.test(tb), 'máy chủ từ chối: hiện đúng lời báo «' + tb.slice(0, 50) + '»');
  } catch (e) { console.error(e); fails++; }
  await b.close();
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nbps-nop-khong-dang-nhap: ok');
  process.exit(fails ? 1 : 0);
})();
