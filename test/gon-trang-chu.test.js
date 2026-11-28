/* Trang chủ gọn (28/11/2026, rà UX trang chủ – docs/ux/ux-trang-chu-2026-11-28.md, chị duyệt «gộp thu gọn»). Kiểm:
 * - mục «Mỗi người dùng có một lối vào riêng» (lặp ba cửa ở màn đầu) thu lại thành «Bạn đến để nghiên cứu hay hợp tác?»,
 *   chỉ giữ hai thẻ Nhà nghiên cứu và Nhà trường · đối tác · quỹ (VI/EN), đủ liên kết của hai thẻ đó;
 * - không mất đích nào của hai thẻ bỏ đi: ba game vẫn có liên kết thẳng trên trang chủ, Hộ Chiếu Sầu Riêng vẫn có;
 *   Bảng điều khiển lớp và Thang điểm vẫn ở trang Giảng viên (mục «Giảng viên» của menu chung, một lần bấm);
 * - chữ nội dung (main) và chân trang ≥ 13 px ở 360, 390, 1280 px (trừ nhãn viết hoa như «TIN MỚI», «BẬC 1 · …»); trang chủ ngắn hơn trước (≤ 24 màn ở 360 px);
 *   chân trang trang khác cũng ≥ 13 px; không tràn ngang; không lỗi JS. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const html = R('index.html');
assert.ok(fs.readFileSync(path.join(__dirname, '..', 'index.html')).equals(fs.readFileSync(path.join(__dirname, '..', 'academia3d-v2.html'))), 'index.html trùng byte academia3d-v2.html');
assert.doesNotMatch(html, /Mỗi người dùng có một lối vào riêng|Each audience has its own way in/, 'bỏ tiêu đề mục lặp ba cửa');
assert.match(html, /data-en="Here for research or a partnership\?">Bạn đến để nghiên cứu hay hợp tác\?</, 'tiêu đề mới VI/EN');
const muc = html.slice(html.indexOf('Bạn đến để nghiên cứu hay hợp tác?'), html.indexOf('<!-- PRODUCTS -->'));
assert.equal((muc.match(/padding:26px 24px;border-radius:30px;/g) || []).length, 2, 'mục còn đúng hai thẻ');
assert.match(muc, /data-en="Researchers">Nhà nghiên cứu</, 'thẻ Nhà nghiên cứu');
assert.match(muc, /data-en="Institutions · partners · funders">Nhà trường · đối tác · quỹ</, 'thẻ Nhà trường · đối tác · quỹ');
for (const h of ['truong-hoc-thuat.html', 'lab/ie-lab.html', 'bang-chung.html', 'giai-phap.html']) assert.ok(muc.includes('href="' + h + '"'), 'hai thẻ giữ liên kết ' + h);
assert.doesNotMatch(muc, /data-en="Students">|data-en="Instructors">/, 'không còn thẻ Sinh viên, Giảng viên');
for (const h of ['ben-phu-sa-3d.html', 'game.html', 'ho-chieu-thuong-hieu.html']) assert.ok(html.includes('href="' + h + '"'), 'trang chủ vẫn có liên kết ' + h);
assert.match(html, /href="lab\/ho-chieu-sau-rieng[^"]*\.html"/, 'trang chủ vẫn có liên kết Hộ Chiếu Sầu Riêng');
assert.match(R('js/bizon-clay-nav.js'), /\{ href:'giang-vien\.html',\s*vi:'Giảng viên'/, 'menu chung có mục Giảng viên');
const gv = R('giang-vien.html');
assert.ok(gv.includes('Trang Giang Vien.dc.html') && gv.includes('id="thang-diem"'), 'trang Giảng viên có Bảng điều khiển lớp và mục Thang điểm');
assert.ok(+(R('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 1020, 'sw.js tăng phiên bản');

const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); let fails = 0;
  const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
  const errs = [];
  const nho = chiChanTrang => [...document.querySelectorAll(chiChanTrang ? '#clay-footer *' : 'main *, #clay-footer *')].filter(e => {
    if (e.closest('#bb-stage, svg, [aria-hidden="true"]')) return false;
    const t = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(''); if (t.length < 4) return false;
    if (getComputedStyle(e).textTransform === 'uppercase' || t === t.toUpperCase()) return false;   // nhãn viết hoa (TIN MỚI, BẬC 1 · …) không phải chữ nội dung
    const r = e.getBoundingClientRect(); return r.height > 0 && parseFloat(getComputedStyle(e).fontSize) < 13;
  }).map(e => parseFloat(getComputedStyle(e).fontSize) + 'px «' + e.textContent.trim().slice(0, 40) + '»');
  for (const [w, h, url, en] of [[360, 760, 'index.html'], [390, 844, 'index.html', true], [1280, 860, 'index.html'], [390, 844, 'games.html']]) {
    const tag = w + ' ' + url + (en ? ' EN' : '');
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, en ? 'en' : 'vi');
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(url + ': ' + e.message));
    await pg.route(/\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await pg.goto(BASE + '/' + url + (en ? '?lang=en' : ''), { waitUntil: 'load', timeout: 60000 }); await pg.waitForTimeout(700);
    const r = await pg.evaluate(([f, chan]) => ({ nho: eval(f)(chan), man: document.documentElement.scrollHeight / innerHeight, sw: document.documentElement.scrollWidth - innerWidth,
      tieuDe: [...document.querySelectorAll('h2')].map(x => x.textContent.trim()).find(t => /research or a partnership|nghiên cứu hay hợp tác/.test(t)) || null }), ['(' + nho.toString() + ')', url !== 'index.html']);   // trang khác: chỉ kiểm chân trang dùng chung
    ok(!r.nho.length, tag + (url === 'index.html' ? ': chữ nội dung và chân trang ≥ 13 px' : ': chữ chân trang ≥ 13 px') + (r.nho.length ? ' (' + r.nho.slice(0, 3).join('; ') + ')' : ''));
    ok(r.sw <= 1, tag + ': không tràn ngang');
    if (url === 'index.html') ok(!!r.tieuDe, tag + ': có mục «' + r.tieuDe + '»');
    if (w === 360) ok(r.man <= 24, tag + ': trang chủ ngắn hơn (' + r.man.toFixed(1) + ' màn, trước đây 24,6)');
    await ctx.close();
  }
  ok(!errs.length, 'không lỗi JS' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  if (fails) { console.error('gon-trang-chu: ' + fails + ' lỗi'); process.exit(1); }
  console.log('gon-trang-chu: ok');
})().catch(e => { console.error(e); process.exit(1); });
