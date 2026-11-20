/* Mừng Ngày Nhà giáo Việt Nam 20/11/2026: trang ngay-nha-giao-20-11.html (lời tri ân chung của BizOn, rồng xanh,
 * công cụ «Viết thiệp gửi thầy cô» tải thiệp PNG, không gửi dữ liệu đi đâu) và dải chào trên trang chủ chỉ hiện
 * từ 10/11 đến hết 30/11 (theo ngày trên máy người xem). */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;

// Tĩnh
const page = read('ngay-nha-giao-20-11.html');
assert.match(page, /<link rel="canonical" href="https:\/\/bizonland\.com\/ngay-nha-giao-20-11\.html">/, 'trang có canonical');
assert.match(read('sitemap.xml'), /bizonland\.com\/ngay-nha-giao-20-11\.html/, 'sitemap.xml có trang 20/11');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 924, 'sw.js ≥ v924');
assert.ok(fs.readFileSync(R('index.html')).equals(fs.readFileSync(R('academia3d-v2.html'))), 'index.html trùng byte academia3d-v2.html');
assert.ok(fs.existsSync(R('assets/dragon/wave-v2.webp')), 'có ảnh rồng xanh wave-v2.webp');
assert.ok(fs.existsSync(R('assets/dragon/wave.png')), 'ảnh gốc wave.png vẫn còn');
assert.doesNotMatch(page, /fetch\(|supabase|XMLHttpRequest|sendBeacon/i, 'trang thiệp không gửi dữ liệu đi đâu');
assert.doesNotMatch(page, /Phan Anh Tú<\/|PGS\.TS\. Phan Anh Tú,/, 'trang công khai chỉ có lời chúc chung, không có thiệp riêng');
const MP4 = 'assets/video/trong-toi-co-mot-nuoc-nam-demo-720p.mp4';
assert.ok(fs.existsSync(R(MP4)) && fs.statSync(R(MP4)).size < 10e6, 'video bài hát có mặt, nhẹ hơn 10 MB');
assert.ok(fs.existsSync(R('assets/video/trong-toi-co-mot-nuoc-nam-demo-poster.webp')), 'có ảnh bìa video');
assert.ok(fs.existsSync(R('assets/illustrations/hoa-hong-vang-dat-set.webp')), 'có ảnh bó hoa hồng vàng');
assert.match(page, /<video controls preload="none"[^>]*poster="assets\/video\/trong-toi-co-mot-nuoc-nam-demo-poster\.webp"/, 'video không tự tải, có ảnh bìa');
assert.ok(page.includes(MP4), 'trang dẫn tới video bài hát');
{ const b = fs.readFileSync(R(MP4)); assert.ok(b.indexOf('moov') > 0 && b.indexOf('moov') < b.indexOf('mdat'), 'video faststart (moov trước mdat)'); }
const pill = read('index.html').match(/<a class="hp-news hp-le"[^>]*>/);
assert.ok(pill && /\bhidden\b/.test(pill[0]) && /data-tu="2026-11-10"/.test(pill[0]) && /data-den="2026-11-30"/.test(pill[0]), 'dải chào trang chủ ẩn sẵn, có khoảng ngày');

async function open(b, url, w, h, opt = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  const p = await ctx.newPage();
  p._errs = []; p.on('pageerror', e => p._errs.push(e.message));
  await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await p.route(/\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
  if (opt.ngay) await p.clock.setFixedTime(new Date(opt.ngay));
  await p.addInitScript(l => localStorage.setItem('bizon-lang', l), opt.en ? 'en' : 'vi');
  if (opt.dark) await p.addInitScript(() => localStorage.setItem('bizon-theme', 'dark'));
  await p.goto(BASE + url, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(600);
  return p;
}

(async () => {
  const b = await chromium.launch();
  try {
    // 1. Dải chào trên trang chủ theo ngày
    for (const [ngay, hien] of [['2026-11-20T09:00:00', true], ['2026-11-30T22:00:00', true], ['2026-11-05T09:00:00', false], ['2026-12-01T08:00:00', false]]) {
      const p = await open(b, '/index.html', 390, 844, { ngay });
      const st = await p.evaluate(() => { const a = document.getElementById('hp-le-20-11'); return { vis: !!a && a.getClientRects().length > 0, href: a && a.getAttribute('href') }; });
      assert.equal(st.vis, hien, ngay + ': dải chào ' + (hien ? 'hiện' : 'ẩn'));
      assert.equal(st.href, 'ngay-nha-giao-20-11.html');
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth) <= 390, ngay + ': trang chủ không tràn ngang');
      assert.deepEqual(p._errs, [], ngay + ': không lỗi JS');
      await p.context().close();
    }

    // 2. Trang 20/11: VI, EN, tối, 360 px
    for (const [w, h, en, dark] of [[360, 740, false, false], [390, 844, true, false], [390, 844, false, true], [1280, 800, true, false]]) {
      const tag = w + (en ? ' EN' : ' VI') + (dark ? ' tối' : '');
      const p = await open(b, '/ngay-nha-giao-20-11.html', w, h, { en, dark });
      const st = await p.evaluate(() => ({
        h1: document.querySelector('h1').innerText, sw: document.documentElement.scrollWidth,
        rong: (() => { const im = document.querySelector('.le-rong'); return im.complete && im.naturalWidth > 0; })(),
        hoa: (() => { const im = document.querySelector('.le-hoa-bo'), r = im.getBoundingClientRect(); return im.complete && im.naturalWidth > 0 && Math.abs(r.width / r.height - 440 / 640) < 0.12; })(),
        video: (() => { const v = document.querySelector('#bai-hat video'), r = v.getBoundingClientRect(); return r.width > 200 && r.right <= innerWidth; })(),
        loi: document.getElementById('t-loi').value, xem: document.getElementById('x-gui').textContent,
        form: document.querySelector('#thiep-form').innerText
      }));
      assert.equal(st.h1, en ? 'Thank you, teachers' : 'Tri ân thầy cô', tag + ': tiêu đề');
      assert.ok(st.sw <= w, tag + ': không tràn ngang (' + st.sw + ')');
      assert.ok(st.rong, tag + ': ảnh rồng xanh tải được');
      assert.ok(st.hoa, tag + ': bó hoa hồng vàng tải được, không bị méo');
      assert.ok(st.video, tag + ': khung video vừa màn hình');
      if (en) { assert.ok(!VI.test(st.loi), tag + ': lời chúc mặc định tiếng Anh'); assert.ok(!VI.test(st.form), tag + ': form tiếng Anh: ' + st.form); assert.match(st.xem, /^Dear /); }
      else { assert.match(st.loi, /20\/11/, tag + ': lời chúc mặc định tiếng Việt'); assert.match(st.xem, /^Kính gửi /); }
      assert.deepEqual(p._errs, [], tag + ': không lỗi JS');
      await p.context().close();
    }

    // 3. Viết thiệp: xem trước đổi theo, tải PNG, không gọi mạng ra ngoài
    const p = await open(b, '/ngay-nha-giao-20-11.html', 390, 844);
    const ra = []; p.on('request', r => { if (!r.url().startsWith(BASE) && !r.url().startsWith('data:')) ra.push(r.url()); });
    await p.fill('#t-gui', 'Cô Lê Thị Mai');
    await p.fill('#t-ky', 'Em, Minh');
    assert.equal(await p.textContent('#x-gui'), 'Kính gửi Cô Lê Thị Mai,', 'xem trước có tên người nhận');
    assert.equal(await p.textContent('#x-ky'), 'Em, Minh', 'xem trước có người gửi');
    await p.fill('#t-loi', 'Em cảm ơn cô.');
    assert.equal(await p.textContent('#x-loi'), 'Em cảm ơn cô.');
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 20000 }), p.click('#t-tai')]);
    assert.equal(dl.suggestedFilename(), 'thiep-20-11-bizon.png', 'tên tệp tải về');
    const buf = fs.readFileSync(await dl.path());
    assert.ok(buf.length > 20000 && buf.slice(1, 4).toString() === 'PNG', 'tải được ảnh PNG (' + buf.length + ' byte)');
    assert.equal(buf.readUInt32BE(16), 1080, 'ảnh rộng 1080');
    assert.equal(buf.readUInt32BE(20), 1350, 'ảnh cao 1350');
    assert.match(await p.textContent('#t-tb'), /Đã tải/, 'báo đã tải');
    await p.click('#t-lai');
    assert.match(await p.inputValue('#t-loi'), /20\/11/, 'nút đặt lại lời chúc');
    assert.deepEqual(ra.filter(u => !/fonts\.(googleapis|gstatic)/.test(u)), [], 'không gửi gì ra ngoài: ' + ra.join(', '));
    assert.deepEqual(p._errs, [], 'không lỗi JS khi tạo thiệp');
    await p.context().close();
    console.log('ngay-nha-giao-20-11: đạt');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
