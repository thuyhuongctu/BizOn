/* Thẻ «Mô hình hoạt động thế nào?» trong Hộ Chiếu Sầu Riêng (23/11/2026). Chỉ làm cho Sầu Riêng vì ba game còn lại đang khóa
 * theo hồ sơ quyền tác giả (docs/roadmap/KE-HOACH-DON-HE-SINH-THAI-2026-11.md §0). Kiểm:
 * - lõi: DurianCore.modelCard trả 5 dòng VI/EN, trọng số điểm đọc từ DurianData.scoreWeights, liên kết tới bảng tham số có thật;
 *   howToPlay vẫn đúng 7 mục (thẻ không chen vào Cách chơi của 2D/v2);
 * - thẻ là bề mặt giải thích cơ chế: nút và hộp thoại mang .bz-explain, được ghi vào docs/architecture/NHANH-HOP-DEN.md;
 *   ở lớp hộp đen (?explain=hidden) bản gọn không hiện nút;
 * - bản 3D: bundle khớp lab/*.js (cùng lõi) và template có khối thẻ .bz-explain trong Cách chơi;
 * - trình duyệt: bản 2D (360 và 1280 px, VI/EN) mở được thẻ, 5 dòng, Esc đóng, không tràn ngang; bản gọn mở/đóng được, Esc đóng;
 *   bản 3D: mục cuối của «Cách chơi» là thẻ 5 dòng. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const ROOT = path.join(__dirname, '..'), R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';

// --- Lõi ---
const ctx = { window: {}, console };
ctx.window.window = ctx.window;
vm.createContext(ctx);
for (const f of ['lab/ho-chieu-sau-rieng-engine.js', 'lab/ho-chieu-sau-rieng-data.js', 'lab/ho-chieu-sau-rieng-core.js']) vm.runInContext(R(f), ctx, { filename: f });
const D = ctx.window.DurianData, C = ctx.window.DurianCore;
assert.ok(D && C && typeof C.modelCard === 'function', 'DurianCore.modelCard có trong lõi');
const vi = (a) => a, en = (a, b) => b;
for (const [L, name] of [[vi, 'VI'], [en, 'EN']]) {
  const c = C.modelCard(D, L);
  assert.equal(c.lines.length, 5, name + ': đúng 5 dòng');
  for (const [k, v] of c.lines) assert.ok(k.length > 2 && v.length > 20, name + ': dòng có nhãn và nội dung');
  const W = D.scoreWeights, diem = c.lines[3][1];
  for (const w of Object.values(W)) assert.ok(diem.includes(String(w)), name + ': dòng điểm có trọng số ' + w);
  assert.equal(Object.values(W).reduce((a, b) => a + b, 0), 100, 'trọng số cộng đủ 100');
  assert.ok(/minh hoạ|illustrative/.test(c.lines[4][1]), name + ': dòng cuối nói rõ tham số minh hoạ');
  assert.doesNotMatch(c.lines.map(l => l[1]).join(' '), /vụ 6[^.]*kịch bản|season 6[^.]*scenario/, name + ': không gọi vụ 6 là kịch bản (nghị định thư đã ký 19/8/2024)');
}
assert.equal(C.modelCard(D, vi).title, 'Mô hình hoạt động thế nào?');
assert.equal(C.modelCard(D, en).title, 'How does the model work?');
const href = C.modelCard(D, vi).href, anchor = href.split('#')[1];
assert.ok(R(href.split('#')[0]).includes('id="' + anchor + '"'), 'liên kết tới neo có thật: ' + href);
assert.equal(C.howToPlay(D, vi).length, 7, 'howToPlay vẫn đúng 7 mục');
// Tài liệu hướng dẫn khớp dữ liệu: vụ 6 dựa trên nghị định thư đông lạnh đã ký 19/8/2024 (FROZENPROTO), không phải kịch bản giả định
const hd6 = R('docs/huong-dan-ho-chieu-sau-rieng.md');
assert.ok(D.seasons[5].frozenProtocol && /19\/8\/2024/.test(D.seasons[5].textVi), 'dữ liệu vụ 6: nghị định thư ký 19/8/2024');
assert.doesNotMatch(hd6, /Vụ 6[^\n]*là \*\*kịch bản giả định\*\*|đông lạnh \(giả định\)/, 'tài liệu không còn gọi vụ 6 là giả định');
assert.ok(hd6.includes('19/8/2024') && hd6.includes('FROZENPROTO'), 'tài liệu nêu mốc và nguồn của vụ 6');
assert.ok(/Không dùng Math\.random/.test(R('lab/ho-chieu-sau-rieng-engine.js')), 'engine vẫn tất định như thẻ nói');

// --- Hộp đen ---
const p2d = R('lab/ho-chieu-sau-rieng.html'), ui2 = R('js/dp2-ui.js');
assert.ok(p2d.includes('<button class="tbtn bz-explain" id="modelBtn" type="button" aria-haspopup="dialog">'), '2D: nút có type, .bz-explain');
assert.ok(p2d.includes('<div class=\\"bz-explain\\"><dl>') || p2d.includes('`<div class="bz-explain"><dl>'), '2D: nội dung thẻ trong .bz-explain');
assert.ok(/<button type="button" class="bn2-iconbtn bz-explain" data-act="model"/.test(ui2), 'bản gọn: nút có type, .bz-explain');
assert.ok(/<div class="bn2-modal bz-explain" role="dialog" aria-modal="true" aria-labelledby="dp2-model-h">/.test(ui2), 'bản gọn: hộp thoại trong .bz-explain');
const hd = R('docs/architecture/NHANH-HOP-DEN.md');
assert.ok(hd.includes('thẻ «Mô hình hoạt động thế nào?»') && hd.includes('23/11/2026'), 'đã ghi bề mặt mới vào NHANH-HOP-DEN.md');

// --- 3D ---
execFileSync(process.execPath, [path.join(ROOT, 'scripts/release/rebundle-ho-chieu-sau-rieng-3d.mjs'), '--check'], { cwd: ROOT, stdio: 'pipe' });
const tmp = path.join(require('node:os').tmpdir(), 'tpl-mo-hinh-' + process.pid + '.html');
execFileSync(process.execPath, [path.join(ROOT, 'scripts/release/rebundle-ho-chieu-sau-rieng-3d.mjs'), '--extract-template', tmp], { cwd: ROOT, stdio: 'pipe' });
const tpl = fs.readFileSync(tmp, 'utf8'); fs.unlinkSync(tmp);
assert.ok(/<div class="bz-explain"[^>]*>\s*<span class="hp-h">🔍 \{\{ hp\.mcTitle \}\}<\/span>/.test(tpl), '3D: khối thẻ .bz-explain trong Cách chơi');
assert.ok(tpl.includes('window.DurianCore.modelCard(window.DurianData, tr2)'), '3D: đọc cùng DurianCore.modelCard');
assert.ok(tpl.includes('href="../truong-hoc-thuat.html#tham-so-sau-rieng"'), '3D: liên kết bảng tham số');
assert.ok(+(R('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 967, 'sw.js tăng phiên bản');

// --- Trình duyệt ---
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('the-mo-hinh-sau-rieng: cần playwright'); process.exit(1); }
(async () => {
  const b = await chromium.launch(); let fails = 0;
  const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
  for (const [w, lang] of [[360, 'vi'], [1280, 'en']]) {
    const cx = await b.newContext({ viewport: { width: w, height: 800 } });
    await cx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await cx.route(/googleapis|gstatic|goatcounter|supabase\.co|\.mp3|\.mp4/, r => r.abort());
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + '/lab/ho-chieu-sau-rieng.html', { waitUntil: 'load' }); await pg.waitForTimeout(1200);
    const tag = '2D ' + w + ' px ' + lang + ': ';
    ok(await pg.evaluate(() => document.documentElement.scrollWidth) <= w, tag + 'không tràn ngang');
    await pg.click('#modelBtn'); await pg.waitForTimeout(200);
    ok(!(await pg.$eval('#rulesModal', m => m.hidden)), tag + 'mở thẻ');
    ok(await pg.$$eval('#rulesBody dt', d => d.length) === 5, tag + '5 dòng');
    const title = await pg.$eval('#rulesTitle', t => t.textContent);
    ok(lang === 'vi' ? /Mô hình hoạt động thế nào/.test(title) : /How does the model work/.test(title), tag + 'tiêu đề đúng ngôn ngữ');
    ok(await pg.evaluate(() => document.activeElement && document.activeElement.id === 'rulesClose'), tag + 'tiêu điểm vào nút đóng');
    await pg.keyboard.press('Escape');
    ok(await pg.$eval('#rulesModal', m => m.hidden), tag + 'Esc đóng thẻ');
    ok(!errs.length, tag + 'không lỗi JS' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await cx.close();
  }
  // Bản gọn: vào ván rồi mở thẻ; lớp hộp đen không thấy nút
  for (const q of ['', '?explain=hidden']) {
    const cx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await cx.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
    await cx.route(/googleapis|gstatic|goatcounter|supabase\.co|\.mp3|\.mp4/, r => r.abort());
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + '/lab/ho-chieu-sau-rieng-v2.html' + q, { waitUntil: 'load' });
    await pg.waitForSelector('#dp2-login');
    await pg.fill('input[name=cls]', 'MOHINH-T1'); await pg.fill('input[name=team]', 'doi_mh');
    await pg.click('[data-act=role][data-v=packer]'); await pg.click('#dp2-login button[type=submit]');
    await pg.waitForSelector('[data-act=model]', { state: 'attached' }); await pg.waitForTimeout(400);
    const tag = 'bản gọn' + (q ? ' (hộp đen)' : '') + ': ';
    const shown = await pg.$eval('[data-act=model]', e => getComputedStyle(e).display !== 'none');
    if (q) { ok(!shown, tag + 'nút thẻ mô hình bị ẩn'); }
    else {
      ok(shown, tag + 'nút thẻ mô hình hiện');
      await pg.click('[data-act=model]');
      ok(await pg.$$eval('.dp2-mc li', l => l.length) === 5, tag + 'thẻ 5 dòng');
      ok(await pg.evaluate(() => document.activeElement && document.activeElement.dataset.act === 'closemodel'), tag + 'tiêu điểm vào nút đóng');
      await pg.keyboard.press('Escape');
      ok(!(await pg.$('#dp2-model-h')), tag + 'Esc đóng thẻ');
      ok(await pg.evaluate(() => document.activeElement && document.activeElement.dataset.act === 'model'), tag + 'tiêu điểm trở về nút');
      ok(await pg.evaluate(() => document.documentElement.scrollWidth) <= 390, tag + 'không tràn ngang 390');
    }
    ok(!errs.length, tag + 'không lỗi JS' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await cx.close();
  }
  // Bản 3D: mở «Cách chơi» trên thanh trên; mục cuối là thẻ mô hình
  {
    const cx = await b.newContext({ viewport: { width: 1280, height: 800 } });
    await cx.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
    await cx.route(/googleapis|gstatic|goatcounter|supabase\.co|\.mp3|\.mp4/, r => r.abort());
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + '/lab/ho-chieu-sau-rieng-3d.html', { waitUntil: 'load' });
    const nut = pg.getByText('📘 Cách chơi', { exact: true }).first();
    await nut.waitFor({ state: 'attached', timeout: 30000 }); await nut.evaluate(e => e.click());
    await pg.waitForSelector('.bz-explain .hp-row', { timeout: 10000 }).catch(() => {});
    const r = await pg.evaluate(() => ({ h: [...document.querySelectorAll('.hp-h')].map(x => x.textContent),
      rows: document.querySelectorAll('.bz-explain .hp-row').length, a: (document.querySelector('.bz-explain a[href$="#tham-so-sau-rieng"]') || {}).textContent || '' }));
    ok(r.h[r.h.length - 1] === '🔍 Mô hình hoạt động thế nào?', '3D: mục cuối của Cách chơi là thẻ mô hình');
    ok(r.h.length === 8, '3D: 7 mục Cách chơi + thẻ mô hình');
    ok(r.rows === 5 && /Bảng tham số và nguồn/.test(r.a), '3D: thẻ 5 dòng, có liên kết bảng tham số');
    ok(!errs.length, '3D: không lỗi JS' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await cx.close();
  }
  await b.close();
  if (fails) { console.error('the-mo-hinh-sau-rieng: ' + fails + ' lỗi'); process.exit(1); }
  console.log('the-mo-hinh-sau-rieng: ok');
})().catch(e => { console.error(e); process.exit(1); });
