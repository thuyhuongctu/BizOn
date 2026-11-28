/* Lối vào cho người tự học (28/11/2026, rà UX trang chủ – docs/ux/ux-trang-chu-2026-11-28.md). Kiểm:
 * - nút «Bắt đầu» trên thanh menu (mọi trang) và cửa thứ ba cùng đưa người mới tới Bậc 1 – Bến Phù Sa, không còn vào Bật Nghiệp (Bậc 2);
 * - cửa thứ ba gọi đúng người tự học («Tôi tự học», nói rõ bắt đầu từ Bậc 1), VI và EN;
 * - viên «Lớp demo» nói rõ là màn hình cho giảng viên (sinh viên khỏi bấm nhầm vào bảng của thầy cô);
 * - phần mở đầu (từ tiêu đề tới hết hàng nhãn) không còn thuật ngữ nghiên cứu: engine, tất định, khoa học mở, deterministic, open science…;
 *   thuật ngữ vẫn còn ở phần Nghiên cứu phía dưới;
 * - thẻ «20/11» tự ẩn ngoài khoảng ngày đặt sẵn (data-tu … data-den), hiện trong khoảng đó;
 * - không tràn ngang ở 360, 390, 1280 px; không lỗi JS. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const JARGON = /engine|tất định|xác định|khoa học mở|deterministic|open science|rubric|CVP|CMR|Gravity|nghiên cứu và quốc tế hóa|research and internationali[sz]ation/i;

const html = R('index.html');
assert.ok(fs.readFileSync(path.join(__dirname, '..', 'index.html')).equals(fs.readFileSync(path.join(__dirname, '..', 'academia3d-v2.html'))), 'index.html trùng byte academia3d-v2.html');
assert.match(R('js/bizon-clay-nav.js'), /var CTA = \{ href:'ben-phu-sa\.html'/, 'nút «Bắt đầu» trỏ tới Bậc 1 – Bến Phù Sa');
assert.match(html, /data-door="khach" href="ben-phu-sa\.html"/, 'cửa thứ ba tới Bến Phù Sa');
assert.match(html, /data-en="I'm learning on my own">Tôi tự học</, 'cửa thứ ba: «Tôi tự học» / «I\'m learning on my own»');
assert.match(html, /data-en="Start at level 1: Bến Phù Sa\. Free, no sign-in\.">Bắt đầu từ Bậc 1: Bến Phù Sa\./, 'cửa thứ ba nói rõ bắt đầu từ Bậc 1');
assert.match(html, /data-door-extra="giang-vien"[\s\S]{0,300}data-en="Class screen for instructors">Màn hình lớp cho giảng viên</, 'viên «Lớp demo» nói rõ là cho giảng viên');
const moDau = html.slice(html.indexOf('<h1 class="hp-h1"'), html.indexOf('Bằng chứng lớp học ban đầu'));
assert.ok(moDau.length > 1000, 'cắt được phần mở đầu');
assert.doesNotMatch(moDau.replace(/<script[\s\S]*?<\/script>/g, ''), JARGON, 'phần mở đầu (VI lẫn data-en) không còn thuật ngữ nghiên cứu');
assert.match(html, /tái lập/, 'thuật ngữ vẫn còn ở phần Nghiên cứu phía dưới');
assert.ok(+(R('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 1018, 'sw.js tăng phiên bản');

const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); let fails = 0;
  const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
  const errs = [];
  async function mo(w, h, en, ngay) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 600, isMobile: w < 600 });
    await ctx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, en ? 'en' : 'vi');
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
    if (ngay) await pg.clock.setFixedTime(new Date(ngay + 'T09:00:00+07:00'));
    await pg.goto(BASE + '/index.html' + (en ? '?lang=en' : ''), { waitUntil: 'load' }); await pg.waitForTimeout(700);
    return { ctx, pg };
  }
  for (const [w, h, en] of [[360, 760, false], [390, 844, true], [1280, 860, false]]) {
    const tag = w + (en ? ' EN' : ' VI');
    const { ctx, pg } = await mo(w, h, en);
    const r = await pg.evaluate(() => {
      const cta = document.querySelector('#clay-nav .cn-cta'), cua = document.querySelector('#ba-cua [data-door="khach"]');
      const h1 = document.querySelector('.hp-h1'), cuoi = [...document.querySelectorAll('.hp-pill')].find(e => /Bằng chứng lớp học ban đầu|Preliminary classroom evidence/.test(e.textContent));   // nhãn cuối của phần mở đầu
      const tw = document.createTreeWalker(document.querySelector('main') || document.body, NodeFilter.SHOW_TEXT), chu = [];
      while (tw.nextNode()) { const n = tw.currentNode, e = n.parentElement; if (!e || !n.textContent.trim() || e.closest('script')) continue;
        if (h1.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING) continue; if (cuoi && (cuoi.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING) && !cuoi.contains(e)) continue;
        if (e.getBoundingClientRect().height > 0) chu.push(n.textContent.trim()); }
      return { cta: cta && cta.getAttribute('href'), ctaChu: cta && cta.textContent.trim(), cua: cua.getAttribute('href'), cuaChu: cua.querySelector('.hp-door-t').textContent.trim(),
        demo: document.querySelector('#ba-cua [data-door-extra="giang-vien"] .hp-more-d').textContent.trim(), chu: chu.join(' | '), sw: document.documentElement.scrollWidth };
    });
    ok(r.cta === 'ben-phu-sa.html' && r.cta === r.cua, tag + ': «' + r.ctaChu + '» trên thanh menu và cửa thứ ba cùng tới Bến Phù Sa (Bậc 1)');
    ok(en ? r.cuaChu === "I'm learning on my own" : r.cuaChu === 'Tôi tự học', tag + ': cửa thứ ba «' + r.cuaChu + '»');
    ok(en ? /instructors/.test(r.demo) : /giảng viên/.test(r.demo), tag + ': «Lớp demo» ghi rõ cho giảng viên («' + r.demo + '»)');
    ok(!new RegExp(JARGON.source, 'i').test(r.chu), tag + ': chữ đang hiện ở phần mở đầu không có thuật ngữ nghiên cứu' + (JARGON.test(r.chu) ? ' («' + r.chu.match(JARGON)[0] + '»)' : ''));
    ok(r.sw <= w, tag + ': không tràn ngang');
    await ctx.close();
  }
  // nút «Bắt đầu» ở trang khác cũng tới Bậc 1
  { const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + '/bang-chung.html', { waitUntil: 'load' }); await pg.waitForTimeout(500);
    ok(await pg.getAttribute('#clay-nav .cn-cta', 'href') === 'ben-phu-sa.html', 'trang Bằng chứng: «Bắt đầu» cũng tới Bến Phù Sa'); await ctx.close(); }
  // thẻ 20/11 tự ẩn ngoài khoảng ngày
  for (const [ngay, hien] of [['2026-11-20', true], ['2026-11-30', true], ['2026-12-01', false], ['2026-11-09', false]]) {
    const { ctx, pg } = await mo(390, 844, false, ngay);
    const v = await pg.evaluate(() => { const a = document.getElementById('hp-le-20-11'); return !!a && !a.hidden && a.getBoundingClientRect().height > 0; });
    ok(v === hien, 'thẻ 20/11 ngày ' + ngay + ': ' + (hien ? 'hiện' : 'ẩn'));
    await ctx.close();
  }
  ok(!errs.length, 'không lỗi JS' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  if (fails) { console.error('loi-vao-tu-hoc: ' + fails + ' lỗi'); process.exit(1); }
  console.log('loi-vao-tu-hoc: ok');
})().catch(e => { console.error(e); process.exit(1); });
