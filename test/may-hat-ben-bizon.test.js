/* Máy hát Bến BizOn (hub-3d.html, 26/11/2026) – chị báo «có nhạc nhưng không tắt được khỏi màn hình», muốn thêm bài có lời và nhạc thư giãn. Kiểm:
 * - tĩnh: mọi tệp nhạc trong danh sách có thật trong assets/audio/ và đều là ca khúc gốc có trong Kho Âm nhạc (js/music-data.js);
 *   đủ ba nhóm (có lời ≥ 8 bài, không lời, thư giãn); âm thanh thư giãn không tải tệp; ghi chú không nói chữa bệnh
 *   (không có «chữa», «trị», «giảm đau», «đau đầu»…) và nói rõ không thay cho điều trị y khoa; sw.js nạp sẵn mô-đun;
 * - thẻ địa điểm có nút ✕: bấm thì thẻ ẩn, rời đi rồi quay lại thì thẻ hiện lại;
 * - máy hát mở bảng (hộp thoại có tên), Esc đóng; chọn bài có lời thì phát đúng tệp, «Bài kế» sang bài kế trong nhóm, hết bài tự sang bài kế;
 *   chọn âm thanh thư giãn thì tắt nhạc tệp; tiếng bến sông nhỏ lại khi có nhạc;
 * - viên «đang phát» hiện khi có nhạc (ẩn khi thẻ địa điểm hay bảng đang hiện), bấm thì dừng; thoát bến thì dừng hết;
 * - 360 px: bảng không tràn ngang, mọi nút ≥ 44 px; không lỗi JS, không gọi mạng ra ngoài. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';

(async () => {
  const { BAI, NHOM } = await import(path.join(ROOT, 'js/ben-bizon-may-hat.js'));
  global.window = {}; require(path.join(ROOT, 'js/music-data.js'));
  const kho = new Set(window.BZ_MUSIC.groups.flatMap(g => g[3].map(v => v[2])));
  for (const b of BAI.filter(x => x.f)) {
    assert.ok(fs.existsSync(path.join(ROOT, 'assets/audio', b.f)), 'tệp có thật: ' + b.f);
    assert.ok(kho.has(b.f.replace(/(-v2)?\.mp3$/, '')), 'ca khúc gốc trong Kho Âm nhạc: ' + b.f);
  }
  assert.ok(BAI.filter(x => x.nhom === 'loi').length >= 8, 'nhóm có lời ≥ 8 bài');
  assert.ok(BAI.some(x => x.nhom === 'khong') && BAI.filter(x => x.nhom === 'thu-gian').length >= 3, 'có nhóm không lời và ≥ 3 âm thanh thư giãn');
  assert.ok(BAI.filter(x => x.nhom === 'thu-gian').every(x => !x.f && x.tg), 'âm thanh thư giãn tạo trong trình duyệt, không tải tệp');
  const ghi = NHOM.find(n => n.id === 'thu-gian').ghi, chu = JSON.stringify(BAI.filter(x => x.nhom === 'thu-gian')) + ghi.vi + ghi.en;
  assert.doesNotMatch(chu, /chữa|điều trị (đau|bệnh)|giảm đau|đau đầu|trị liệu|cure|heal|headache|pain relief|therapy/i, 'không hứa chữa bệnh');
  assert.ok(/không thay cho tư vấn hay điều trị y khoa/.test(ghi.vi) && /not a substitute for medical/.test(ghi.en), 'ghi rõ không thay cho điều trị y khoa');
  const mod = R('js/ben-bizon-may-hat.js'); assert.doesNotMatch(mod, /https?:\/\/|fetch\(/, 'mô-đun không gọi mạng');
  const sw = R('sw.js'); assert.ok(sw.includes("'./js/ben-bizon-may-hat.js'") && +(sw.match(/bizon-v(\d+)/) || [])[1] >= 1014, 'sw.js nạp sẵn mô-đun, tăng phiên bản');
  const hub = R('hub-3d.html');
  assert.match(hub, /<div id="bb-mh" role="dialog" aria-modal="true" aria-labelledby="bb-mh-ten" hidden>/, 'bảng máy hát là hộp thoại có tên');
  assert.match(hub, /<button type="button" id="bb-mh-chip" hidden>/, 'viên «đang phát» là button có type');

  const { chromium } = require('playwright');
  const b = await chromium.launch(); let fails = 0;
  const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
  const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
  const ngoai = []; const tai = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:')) { ngoai.push(u); return r.abort(); } if (/\.mp3(\?|$)/.test(u)) tai.push(u.split('/').pop()); return r.continue(); });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  const st = () => pg.evaluate(() => window.__benBizon.state());
  const mh = () => pg.evaluate(() => window.__benBizon.mayHat());
  const hien = sel => pg.evaluate(s => { const e = document.querySelector(s); return !!e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none'; }, sel);

  await pg.goto(BASE + '/hub-3d.html', { waitUntil: 'load' });
  await pg.click('#bb-pick [data-vai="ceo"]');
  await pg.waitForFunction(() => window.__benBizon && window.__benBizon.state().ready, null, { timeout: 90000 });
  ok(tai.length === 0, 'chưa chọn bài thì không tải tệp nhạc nào');

  // thẻ địa điểm: nút ✕
  await pg.evaluate(() => window.__benBizon.goTo('may-hat')); await pg.waitForTimeout(250);
  ok(await hien('.dc-card') && /Ẩn thẻ này: Máy hát/.test(await pg.getAttribute('.dc-an', 'aria-label') || ''), 'thẻ Máy hát có nút ✕ «Ẩn thẻ này»');
  const an = await pg.evaluate(() => { const r = document.querySelector('.dc-an').getBoundingClientRect(); return r.width >= 44 && r.height >= 44 && r.right <= innerWidth; });
  ok(an, 'nút ✕ ≥ 44 × 44 px, trong màn hình');
  await pg.click('.dc-an'); await pg.waitForTimeout(150);
  let s = await st(); ok(s.near === 'may-hat' && s.theAn && !(await hien('.dc-card')), 'bấm ✕: thẻ ẩn dù vẫn đứng cạnh máy hát');
  await pg.evaluate(() => window.__benBizon.dat(0, -7, 0)); await pg.waitForTimeout(250);
  await pg.evaluate(() => window.__benBizon.dat(6.2, -2.6, 0)); await pg.waitForTimeout(250);
  s = await st(); ok(s.near === 'may-hat' && !s.theAn && await hien('.dc-card'), 'rời đi rồi quay lại: thẻ hiện lại');

  // bảng máy hát
  await pg.click('.dc-vao'); await pg.waitForTimeout(250);
  ok((await mh()).mo && /Máy hát/.test(await pg.textContent('#bb-mh-ten')), 'bấm «Chọn bài»: mở bảng máy hát');
  ok(await pg.evaluate(() => document.activeElement && document.activeElement.closest('#bb-mh') !== null), 'tiêu điểm vào trong bảng');
  const nhom = await pg.$$eval('.bb-mh-nhom h3', h => h.map(x => x.textContent));
  ok(nhom.length === 3 && /Có lời/.test(nhom[0]) && /Không lời/.test(nhom[1]) && /Thư giãn/.test(nhom[2]), 'ba nhóm: Có lời, Không lời, Thư giãn');
  ok(/không thay cho tư vấn hay điều trị y khoa/.test(await pg.textContent('.bb-mh-ghi')), 'nhóm thư giãn có ghi chú y khoa');
  const bo = await pg.evaluate(() => { const box = document.getElementById('bb-mh-box'); const nut = [...box.querySelectorAll('button')].filter(e => e.getBoundingClientRect().width > 0); return { tran: box.scrollWidth > box.clientWidth + 1 || document.documentElement.scrollWidth > innerWidth, nho: nut.filter(e => e.getBoundingClientRect().height < 44).map(e => e.id || e.textContent.slice(0, 20)) }; });
  ok(!bo.tran && !bo.nho.length, '360 px: bảng không tràn ngang, mọi nút ≥ 44 px' + (bo.nho.length ? ' (' + bo.nho.join(', ') + ')' : ''));
  ok(await pg.isDisabled('#bb-mh-dung') && await pg.isDisabled('#bb-mh-ke'), 'chưa phát: «Dừng nhạc», «Bài kế» chưa bấm được');

  await pg.click('[data-bai="lesprit"]'); await pg.waitForTimeout(600);
  let m = await mh(); let am = await pg.evaluate(() => window.__benBizon.amThanh());
  ok(m.dang === 'lesprit' && m.audio === 'bizon-lesprit-du-mekong-v2.mp3' && tai.includes('bizon-lesprit-du-mekong-v2.mp3'), 'chọn «L’Esprit du Mékong»: phát đúng tệp');
  ok(await pg.getAttribute('[data-bai="lesprit"]', 'aria-pressed') === 'true' && /Đang phát: BizOn – L’Esprit du Mékong/.test(await pg.textContent('#bb-mh-dang')), 'bài đang phát được đánh dấu, dòng «Đang phát» đúng tên');
  await pg.click('#bb-mh-ke'); await pg.waitForTimeout(400);
  m = await mh(); ok(m.dang === 'bat-nghiep-loi' && m.audio === 'bat-nghiep-co-loi.mp3', '«Bài kế»: sang «Bật Nghiệp» (có lời)');
  await pg.click('[data-bai="alpha"]'); await pg.waitForTimeout(500);
  m = await mh(); ok(m.dang === 'alpha' && m.thuGian && !m.audio, 'chọn «Sóng alpha»: âm thanh thư giãn chạy, nhạc tệp dừng');
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
  ok(!(await mh()).mo, 'Esc đóng bảng');
  ok(!(await hien('#bb-mh-chip')), 'viên «đang phát» nhường chỗ khi thẻ địa điểm đang hiện');
  await pg.evaluate(() => window.__benBizon.dat(0, -7, 0)); await pg.waitForTimeout(300);
  ok(await hien('#bb-mh-chip') && /Sóng alpha/.test(await pg.textContent('#bb-mh-chip')), 'rời máy hát: viên «🎵 Sóng alpha ⏹» hiện');
  const chip = await pg.evaluate(() => { const c = document.getElementById('bb-mh-chip').getBoundingClientRect(), j = document.querySelector('.dc-joy').getBoundingClientRect(); return c.height >= 44 && c.bottom <= j.top && c.right <= innerWidth; });
  ok(chip, 'viên ≥ 44 px, nằm trên cần điều khiển, trong màn hình');
  await pg.click('#bb-mh-chip'); await pg.waitForTimeout(300);
  m = await mh(); ok(!m.dang && !m.thuGian && !(await hien('#bb-mh-chip')), 'bấm viên: dừng nhạc, viên ẩn');

  // hết bài tự sang bài kế; thoát bến thì dừng
  await pg.evaluate(() => window.__benBizon.goTo('may-hat')); await pg.click('.dc-vao'); await pg.click('[data-bai="compass"]'); await pg.waitForTimeout(400);
  await pg.evaluate(() => new Promise(r => { const a = window.__benBizon.__audio && window.__benBizon.__audio(); if (!a) return r(); a.dispatchEvent(new Event('ended')); setTimeout(r, 300); }));
  m = await mh(); ok(m.dang === 'lesprit', 'hết bài cuối nhóm «Có lời»: quay về bài đầu');
  await pg.keyboard.press('Escape'); await pg.click('#bb-exit'); await pg.waitForTimeout(300);
  m = await mh(); ok(!m.dang && !m.mo, 'thoát bến: dừng nhạc, đóng bảng');
  ok(!errs.length, 'không lỗi JS' + (errs.length ? ': ' + errs[0] : ''));
  ok(!ngoai.length, 'không gọi mạng ra ngoài' + (ngoai.length ? ': ' + ngoai[0] : ''));
  await b.close();
  if (fails) { console.error('may-hat-ben-bizon: ' + fails + ' lỗi'); process.exit(1); }
  console.log('may-hat-ben-bizon: ok');
})().catch(e => { console.error(e); process.exit(1); });
