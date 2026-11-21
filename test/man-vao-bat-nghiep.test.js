/* Đặc tả 006, câu chuyện 2 (19/11/2026): màn vào Bật Nghiệp 3D «chọn đường trước, điền sau». Buổi UMK cho thấy ở 390 px nút
 * «Bắt đầu» và «Chơi thử với Đội Demo» nằm dưới mép màn. Màn mới có hai nút lớn «Tôi có mã lớp» / «Chơi thử với Đội Demo»;
 * chọn «Tôi có mã lớp» mới hiện các ô, nút «Bắt đầu ▶» dính đáy trên điện thoại. ?lop=MÃ điền sẵn mã lớp và mở thẳng đường đó.
 * ?giao-dien=goc trả về đúng màn vào bản đã nộp hồ sơ quyền tác giả (câu làm rõ 4). Kiểm:
 * - tĩnh: bỏ ba phần tử mới và khối bọc #l3Form thì khối #login3d trùng từng ký tự bản hồ sơ (băm); các dòng CSS #login3d cũ còn nguyên;
 * - 390×844 (VI, EN) và 1280×800: hai nút nằm trong màn đầu; chọn đường thì «Bắt đầu ▶» thấy được không cần cuộn; quay lại được;
 * - ?lop=: mã lớp đã điền (chữ hoa, bỏ khoảng trắng), đường «Tôi có mã lớp» mở sẵn;
 * - ?giao-dien=goc: ba phần tử mới ẩn; vị trí mọi phần tử trong thẻ trùng với khi tháo khối bọc (bố cục y như bản hồ sơ);
 * - Đội Demo và đường mã lớp (không mã) đều vào được game như trước; không lỗi JS.
 * Đổi CSS hay chữ của màn vào cũ thì test này hỏng: đó là bản trong hồ sơ, phải hỏi chị trước. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
const html = read('BizOn Game 3D.html');

// ---- Tĩnh ----
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 911, 'sw.js ≥ bizon-v911');
for (const id of ['l3PathClass', 'l3Back', 'l3Form', 'l3GocLink', 'l3Email', 'l3Team', 'l3Class', 'l3Sync', 'l3Roles', 'l3Go', 'l3Demo', 'l3Classic'])
  check(html.split('id="' + id + '"').length === 2, 'có đúng một #' + id);
{
  const card = html.slice(html.indexOf('<div id="login3d">'), html.indexOf('<canvas id="c">'));
  const goc = card.replace(/ *<button type="button" class="go l3-path" id="l3PathClass"[^\n]*\n/, '')
    .replace(/ *<button type="button" class="l3-back" id="l3Back"[^\n]*\n/, '').replace(/ *<div id="l3Form">\n/, '')
    .replace(/(id="l3Go"[^\n]*\n) *<\/div>\n/, '$1').replace(/<a href="\?giao-dien=goc" id="l3GocLink"[^>]*>[^<]*<\/a>/, '');
  check(sha(goc) === 'dec180a96b677de250e25bd34d66f2d51965f929e37b9f8a10b1e864ea3b14f5', 'bỏ phần mới thì khối #login3d trùng bản hồ sơ (chữ, thứ tự ô, nút)');
  const css = html.split('\n').filter(l => l.includes('#login3d') && !/goc|l3-back|focus-visible/.test(l)).join('\n');
  check(sha(css) === 'f67d50e60e9ab61e01b0f0f3fa3411226e1d69aa2ce4ea150d7c8ccab7095faa', 'các dòng CSS #login3d của bản hồ sơ còn nguyên');
}
check(/document\.getElementById\('l3Go'\)\.onclick = \(\) => l3Enter\(false\);/.test(html) && /document\.getElementById\('l3Demo'\)\.onclick = \(\) => l3Enter\(true\);/.test(html), 'trình xử lý #l3Go, #l3Demo giữ nguyên');
check(/qs\.get\('giao-dien'\) === 'goc'/.test(html) && /classList\.add\('goc'\)/.test(html), 'đọc ?giao-dien=goc');

// ---- Chạy thật ----
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const until = (pg, fn, arg, timeout = 90000) => pg.waitForFunction(fn, arg, { timeout, polling: 250 }).then(() => true, () => false);

async function mo(b, { w, h, lang = 'vi', q = '' }) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
  const pg = await ctx.newPage(); pg._loi = []; pg.on('pageerror', e => pg._loi.push(e.message));
  await pg.route(/fonts\.(googleapis|gstatic)\.com|\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
  await pg.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await pg.goto(BASE + '/BizOn%20Game%203D.html' + q, { waitUntil: 'load', timeout: 90000 });
  pg._ok = await until(pg, () => document.body.classList.contains('login3d'));
  await pg.evaluate(() => { const e = document.getElementById('boot'); if (e) e.remove(); });
  await pg.waitForTimeout(400);
  return { ctx, pg };
}
const hop = (pg, sel) => pg.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
  return { top: r.top, bottom: r.bottom, h: r.height, shown: cs.display !== 'none' && cs.visibility !== 'hidden' && r.height > 0, text: e.textContent.trim() }; }, sel);
const vaoGame = pg => until(pg, () => { const W = document.getElementById('gf').contentWindow, s = W && W.document && W.document.getElementById('app-shell');
  return !!s && !s.classList.contains('hidden') && !document.body.classList.contains('login3d'); });

(async () => {
  const b = await chromium.launch({ args: ARGS });
  try {
    // 1. Màn mới: hai nút trong màn đầu; chọn đường thì «Bắt đầu» thấy được; quay lại được
    for (const [w, h, lang] of [[390, 844, 'vi'], [390, 844, 'en'], [1280, 800, 'vi']]) {
      const tag = w + ' ' + lang.toUpperCase();
      const { ctx, pg } = await mo(b, { w, h, lang });
      check(pg._ok, tag + ': hiện màn vào');
      const lop = await hop(pg, '#l3PathClass'), demo = await hop(pg, '#l3Demo');
      check(lop && lop.shown && lop.top >= 0 && lop.bottom <= h && lop.h >= 44, tag + ': «Tôi có mã lớp» trong màn đầu (' + (lop && Math.round(lop.bottom)) + ' ≤ ' + h + ')');
      check(demo && demo.shown && demo.top >= 0 && demo.bottom <= h && demo.h >= 44, tag + ': «Chơi thử với Đội Demo» trong màn đầu (' + (demo && Math.round(demo.bottom)) + ' ≤ ' + h + ')');
      check(lang === 'en' ? /I have a class code/.test(lop.text) && /Demo Team/.test(demo.text) : /Tôi có mã lớp/.test(lop.text) && /Đội Demo/.test(demo.text), tag + ': chữ nút đúng ngôn ngữ');
      check(!(await hop(pg, '#l3Form')).shown && !(await hop(pg, '#l3Go')).shown, tag + ': chưa chọn đường thì chưa hiện các ô');
      check((await hop(pg, '#l3GocLink')).shown, tag + ': có lối «Giao diện bản hồ sơ»');
      check(/giao-dien=goc/.test(await pg.getAttribute('#l3GocLink', 'href')), tag + ': lối bản hồ sơ trỏ tới ?giao-dien=goc');
      await pg.click('#l3PathClass'); await pg.waitForTimeout(250);
      const go = await hop(pg, '#l3Go');
      check((await hop(pg, '#l3Form')).shown && !(await hop(pg, '#l3PathClass')).shown, tag + ': chọn «Tôi có mã lớp» thì hiện các ô');
      check(go && go.shown && go.top >= 0 && go.bottom <= h, tag + ': «Bắt đầu ▶» thấy được không cần cuộn (' + (go && Math.round(go.top)) + '–' + (go && Math.round(go.bottom)) + ')');
      check(await pg.evaluate(() => ['l3Email', 'l3Team', 'l3Class', 'l3Roles'].every(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.height > 0; })), tag + ': đủ ô Email, Tên đội, Mã lớp, Vai');
      check(await pg.evaluate(() => document.activeElement && /l3Email|l3Back/.test(document.activeElement.id)), tag + ': con trỏ chuyển vào khối vừa mở');
      await pg.click('#l3Back'); await pg.waitForTimeout(200);
      check((await hop(pg, '#l3PathClass')).shown && !(await hop(pg, '#l3Form')).shown, tag + ': «Quay lại» trả về hai lựa chọn');
      const sw = await pg.evaluate(() => document.documentElement.scrollWidth);
      check(sw <= w, tag + ': không tràn ngang (' + sw + ')');
      check(!pg._loi.length, tag + ': không lỗi JS ' + pg._loi.join(' / '));
      await ctx.close();
    }

    // 2. ?lop= điền sẵn mã lớp, mở thẳng đường mã lớp
    { const { ctx, pg } = await mo(b, { w: 390, h: 844, q: '?lop=umk%202026' });
      check(await pg.inputValue('#l3Class') === 'UMK2026', '?lop=: mã lớp đã điền, chữ hoa, bỏ khoảng trắng');
      check(await pg.evaluate(() => document.getElementById('login3d').classList.contains('dien')) && (await hop(pg, '#l3Go')).shown, '?lop=: đường «Tôi có mã lớp» mở sẵn');
      await ctx.close(); }
    { const { ctx, pg } = await mo(b, { w: 390, h: 844, q: '?lop=UMK-2026' });
      check(await pg.inputValue('#l3Class') === 'UMK-2026', '?lop=UMK-2026 giữ dấu gạch');
      await ctx.close(); }

    // 3. ?giao-dien=goc: bố cục bản hồ sơ
    for (const [w, h] of [[390, 844], [1280, 800]]) {
      const { ctx, pg } = await mo(b, { w, h, q: '?giao-dien=goc' });
      const r = await pg.evaluate(() => {
        const vis = id => { const e = document.getElementById(id); return getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0; };
        const card = document.querySelector('#login3d .card');
        const snap = () => [...card.querySelectorAll('*')].filter(e => !['l3PathClass', 'l3Back', 'l3Form', 'l3GocLink'].includes(e.id) && !e.closest('#l3PathClass,#l3Back,#l3GocLink'))
          .map(e => { const q = e.getBoundingClientRect(); return [e.tagName, e.id, Math.round(q.left * 2) / 2, Math.round(q.top * 2) / 2, Math.round(q.width * 2) / 2, Math.round(q.height * 2) / 2].join(':'); });
        const truoc = snap(), chu = card.innerText;
        const out = { goc: document.body.classList.contains('goc'), moi: ['l3PathClass', 'l3Back', 'l3GocLink'].some(vis), cu: ['l3Email', 'l3Team', 'l3Class', 'l3Go', 'l3Demo', 'l3Classic'].every(vis) };
        // Tháo khối bọc và ba phần tử mới: bố cục phải y hệt
        ['l3PathClass', 'l3Back', 'l3GocLink'].forEach(id => document.getElementById(id).remove());
        const f = document.getElementById('l3Form'); while (f.firstChild) f.parentNode.insertBefore(f.firstChild, f); f.remove();
        const sau = snap(); out.khac = truoc.filter((x, i) => x !== sau[i]).slice(0, 4); out.n = [truoc.length, sau.length]; out.chu = chu === card.innerText;
        return out;
      });
      check(r.goc && !r.moi && r.cu, w + ' goc: ba phần tử mới ẩn, đủ ô và nút cũ');
      check(r.n[0] === r.n[1] && !r.khac.length && r.chu, w + ' goc: vị trí mọi phần tử trùng bố cục bản hồ sơ ' + (r.khac.length ? JSON.stringify(r.khac) : ''));
      const go = await hop(pg, '#l3Go');
      check(go.shown, w + ' goc: nút «Bắt đầu» hiện như cũ');
      check(!pg._loi.length, w + ' goc: không lỗi JS ' + pg._loi.join(' / '));
      await ctx.close();
    }

    // 4. Vào game: Đội Demo; đường mã lớp để trống mã (chơi thử)
    { const { ctx, pg } = await mo(b, { w: 390, h: 844 });
      await pg.click('#l3Demo');
      check(await vaoGame(pg), 'Đội Demo vào được game');
      check(await pg.evaluate(() => { const W = document.getElementById('gf').contentWindow; return W.eval('typeof S!=="undefined"&&!!S&&S.round>=1'); }).catch(() => false), 'Đội Demo: ván bắt đầu (S.round ≥ 1)');
      check(!pg._loi.length, 'Đội Demo: không lỗi JS ' + pg._loi.join(' / '));
      await ctx.close(); }
    { const { ctx, pg } = await mo(b, { w: 390, h: 844 });
      await pg.click('#l3PathClass'); await pg.fill('#l3Team', 'Đội Thử Màn Vào'); await pg.fill('#l3Class', '');
      await pg.click('#l3Go');
      check(await vaoGame(pg), 'Đường mã lớp (để trống mã) vào được game');
      check(!pg._loi.length, 'Đường mã lớp: không lỗi JS ' + pg._loi.join(' / '));
      await ctx.close(); }
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await b.close();
  if (fails) { console.log('man-vao-bat-nghiep: ' + fails + ' lỗi'); process.exit(1); }
  console.log('man-vao-bat-nghiep: ok');
})();
