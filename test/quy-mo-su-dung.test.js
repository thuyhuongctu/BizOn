/* Quy mô sử dụng (23/11/2026): hàm công khai bizon_quy_mo_su_dung() chỉ trả số tổng (kiểm SQL ở test/sql/quy_mo_su_dung_smoke.sql,
 * chạy trong workflow Supabase); trang Bằng chứng hiện khối «Quy mô sử dụng» khi hàm trả số, ẩn khi lỗi hoặc chưa có lớp nào;
 * số và ngày đổi theo ngôn ngữ. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const sql = read('supabase/migrations/20261123000000_quy_mo_su_dung.sql');
check(/security definer/.test(sql) && /grant execute on function public\.bizon_quy_mo_su_dung\(\) to anon, authenticated/.test(sql) && /\^\(DEMO\|TEST\)/.test(sql), 'migration: hàm security definer, khách gọi được, bỏ lớp DEMO/TEST');
check(!/\b(insert\s+into|update\s+[\w.]+\s+set|delete\s+from|truncate)\b/i.test(sql.replace(/--.*$/gm, '')), 'migration chỉ đọc');
check(/quy_mo_su_dung_smoke\.sql/.test(read('.github/workflows/supabase-student-login.yml')), 'workflow Supabase chạy kiểm SQL');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 959, 'sw.js ≥ bizon-v959');
const MAU = { lop: 12, doi_bat_nghiep: 1234, van_bat_nghiep_xong: 87, luot_ben_phu_sa: 456, luot_ho_chieu: 78, tu_ngay: '2026-08-04' };
(async () => {
  const b = await chromium.launch();
  const mo = async (lang, traVe) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
    await ctx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await ctx.route(/googleapis|gstatic|goatcounter/, r => r.abort());
    await ctx.route(/rest\/v1\/rpc\/bizon_quy_mo_su_dung/, r => traVe ? r.fulfill(traVe) : r.abort());
    const pg = await ctx.newPage(), loi = []; pg.on('pageerror', e => loi.push(e.message));
    await pg.goto(BASE + '/bang-chung.html', { waitUntil: 'load' }); await pg.waitForTimeout(1500);
    const st = await pg.evaluate(() => { const s = document.getElementById('quy-mo'); return { an: s.hidden, so: [...s.querySelectorAll('[data-qm]')].map(e => e.textContent), an0: [...s.querySelectorAll('.bc-stat')].filter(e => e.hidden).map(e => e.querySelector('[data-qm]').getAttribute('data-qm')), tran: document.documentElement.scrollWidth > innerWidth }; });
    await ctx.close(); return { st, loi };
  };
  try {
    let { st, loi } = await mo('vi', { status: 200, contentType: 'application/json', body: JSON.stringify(MAU) });
    check(!st.an && st.so.join('|') === '12|1.234|87|456|78|04/08/2026', 'vi: hiện khối, số định dạng Việt (' + st.so.join(', ') + ')');
    check(!st.tran && !loi.length, 'vi: không tràn ngang ở 390 px, không lỗi trang');
    ({ st } = await mo('en', { status: 200, contentType: 'application/json', body: JSON.stringify(MAU) }));
    check(!st.an && st.so.join('|') === '12|1,234|87|456|78|08/04/2026', 'en: số và ngày định dạng Anh (' + st.so.join(', ') + ')');
    ({ st, loi } = await mo('vi', { status: 404, contentType: 'application/json', body: '{}' }));
    check(st.an && !loi.length, 'chưa có hàm (404): khối ẩn, không lỗi');
    ({ st } = await mo('vi', { status: 200, contentType: 'application/json', body: JSON.stringify({ ...MAU, luot_ben_phu_sa: 0 }) }));
    check(!st.an && st.an0.join() === 'luot_ben_phu_sa', 'ô bằng 0 (chưa có ván Bến Phù Sa nào nộp) thì ẩn, các ô khác vẫn hiện');
    ({ st } = await mo('vi', null));
    check(st.an, 'mất mạng: khối ẩn');
    ({ st } = await mo('vi', { status: 200, contentType: 'application/json', body: JSON.stringify({ ...MAU, lop: 0 }) }));
    check(st.an, 'chưa có lớp nào: khối ẩn');
  } catch (e) { console.error(e); fails++; }
  await b.close();
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nquy-mo-su-dung: ok');
  process.exit(fails ? 1 : 0);
})();
