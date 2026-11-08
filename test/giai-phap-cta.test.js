/* Trang Giải pháp: nút kêu gọi hành động theo chính sách 07/11/2026 (đặc tả specs/001-giai-phap-cta).
 * - Đầu trang và cuối trang: đúng một nút chính «Đăng ký học kỳ dùng thử», dẫn sang Liên hệ với ?y=dung-thu.
 * - Nút ba gói giá mang ?y=pilot | instructor-pro | institution.
 * - Không còn nút «Bắt đầu chơi» / «Chơi thử ngay» chung chung; lối chơi ngay ghi Bến Phù Sa miễn phí.
 * - Trang Liên hệ điền sẵn chủ đề và lời nhắn đúng ý định, đúng ngôn ngữ; giá trị lạ bỏ qua; không điền đè.
 * - 360 và 390 px: không tràn ngang, nút ≥ 44 px. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

const gp = R('giai-phap.html');
check(!/>Bắt đầu chơi</.test(gp) && !/data-en="Start playing"/.test(gp) && !/>Chơi thử ngay →</.test(gp), 'không còn nút «Bắt đầu chơi» / «Chơi thử ngay» chung chung');
for (const y of ['dung-thu', 'pilot', 'instructor-pro', 'institution']) check(gp.includes(`href="lien-he.html?y=${y}"`), 'có lối sang Liên hệ với ?y=' + y);
check((gp.match(/href="lien-he\.html\?y=dung-thu"/g) || []).length === 2, 'nút đăng ký học kỳ dùng thử ở đầu trang và cuối trang');
check(/href="ben-phu-sa\.html"[^>]*data-en="Play Bến Phù Sa – free"/.test(gp), 'nút phụ chơi ngay: Bến Phù Sa – miễn phí');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(R('sw.js')) || [])[1] >= 819, 'sw.js ≥ bizon-v819');

(async () => {
  const b = await chromium.launch();
  const mo = async (u, w, lang) => {
    const p = await b.newPage({ viewport: { width: w, height: 844 } });
    await p.route(/googleapis|gstatic|goatcounter|gc\.zgo|\.mp3|\.mp4/, r => r.abort());
    await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await p.goto(BASE + '/' + u, { waitUntil: 'load' }); await p.waitForTimeout(500);
    return p;
  };
  try {
    for (const w of [360, 390]) {
      const p = await mo('giai-phap.html', w, 'vi');
      const r = await p.evaluate(() => {
        const nut = [...document.querySelectorAll('.gp-hero-btns a, .gp-cta a, a[href^="lien-he.html?y="]')].filter(a => a.getClientRects().length);
        return { tran: document.documentElement.scrollWidth - innerWidth, nho: nut.filter(a => a.getBoundingClientRect().height < 44).map(a => a.textContent.trim()),
          hero: document.querySelectorAll('.gp-hero-btns a').length, heroChinh: document.querySelector('.gp-hero-btns a').getAttribute('href') };
      });
      check(r.tran <= 0, `${w}px: không tràn ngang (${r.tran})`);
      check(!r.nho.length, `${w}px: nút hành động ≥ 44 px ${r.nho.join(', ')}`);
      check(r.hero === 2 && r.heroChinh === 'lien-he.html?y=dung-thu', `${w}px: đầu trang có 2 nút, nút đầu tiên (chính) là đăng ký học kỳ dùng thử`);
      await p.close();
    }
    // Trang Liên hệ điền sẵn theo ý định và ngôn ngữ
    for (const [y, lang, can] of [['dung-thu', 'vi', 'học kỳ dùng thử'], ['pilot', 'vi', 'Pilot Classroom'], ['instructor-pro', 'en', 'Instructor Pro'], ['institution', 'en', 'Institution Pass'], ['dung-thu', 'en', 'trial semester']]) {
      const p = await mo('lien-he.html?y=' + y, 390, lang);
      const s = await p.evaluate(() => ({ msg: document.getElementById('lh-msg').value, topic: document.getElementById('lh-topic').selectedIndex }));
      check(s.msg.includes(can) && s.topic === 0, `Liên hệ ?y=${y} (${lang}): chủ đề «Hợp tác giảng dạy», lời nhắn có «${can}»`);
      await p.close();
    }
    {
      const p = await mo('lien-he.html?y=<script>', 390, 'vi');
      const s = await p.evaluate(() => document.getElementById('lh-msg').value);
      check(s === '', 'giá trị ?y= lạ: bỏ qua, ô lời nhắn trống');
      await p.close();
    }
  } catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await b.close();
  if (fails) { console.log('giai-phap-cta: ' + fails + ' lỗi'); process.exit(1); }
  console.log('giai-phap-cta: ok');
})();
