/* Bến BizOn (hub-3d.html, 10/11/2026, đặc tả specs/002-ben-bizon-3d, câu chuyện 1): Sảnh 3D nâng cấp thành một bến sông miền Tây
 * bằng đất sét. Người chơi chọn 1 trong 5 vai đội (mô hình 3D có xương), đi bộ bằng cần điều khiển / WASD / mũi tên, máy quay bám sau
 * lưng, tới gần một điểm thì hiện thẻ có nút «Vào», luôn có lối tắt «Đi tới…». Kiểm cả 360 px, VI/EN, giảm chuyển động, không có
 * WebGL, mô hình tải hỏng, không gọi mạng ra ngoài, nhân vật không bao giờ đứng trên nước. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const exists = f => fs.existsSync(path.join(__dirname, '..', f));

// ---- Kiểm tĩnh
const html = read('hub-3d.html');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 823, 'sw.js ≥ bizon-v823');
check(/name="robots" content="noindex"/.test(html), 'hub-3d.html vẫn noindex (trang thử)');
check(html.includes('"three": "./js/vendor/three.module.js"') && html.includes('js/di-chuyen-3d.js') && html.includes('js/ben-bizon.js'), 'trang nạp three.js bản mô-đun, di-chuyen-3d.js, ben-bizon.js');
check(!html.includes('js/hub3d.js') && !html.includes('three.min.js'), 'trang không còn nạp hub3d.js và three.js bản toàn cục');
check(exists('js/hub3d.js'), 'js/hub3d.js vẫn giữ trong kho');
check(/Bến BizOn/.test(html) && !/dạo phố|Phố BizOn/i.test(html), 'tên trang là «Bến BizOn», không gọi là phố');
const PLACES = ['hanh-trinh', 'ben-phu-sa', 'hc-thuong-hieu', 'bat-nghiep', 'hc-sau-rieng', 'arcade', 'lumina', 'thay-tu', 'may-hat', 'bang-tin', 'thanh-tich'];
const policy = read('chinh-sach.html');
check(/Arcade và game bậc 1 \(Bến Phù Sa\): miễn phí/.test(policy) && /học kỳ dùng thử/.test(policy), 'trang Chính sách: Arcade + Bến Phù Sa miễn phí, còn lại dùng thử (nguồn của nhãn)');

const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const st = pg => pg.evaluate(() => window.__benBizon.state());
const until = (pg, fn, arg, timeout = 25000) => pg.waitForFunction(fn, arg, { timeout, polling: 100 }).then(() => true, () => false);
const rect = (pg, sel) => pg.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(), c = getComputedStyle(e);
  return { x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom, on: c.display !== 'none' && c.visibility !== 'hidden' && r.width > 0 && r.height > 0 }; }, sel);
const overlap = (a, b) => a && b && a.on && b.on && a.x < b.r && b.x < a.r && a.y < b.b && b.y < a.b;

(async () => {
  const b = await chromium.launch({ args: ARGS });
  const open = async (o = {}) => {
    const ctx = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, hasTouch: true, reducedMotion: o.reduce ? 'reduce' : 'no-preference' });
    const pg = await ctx.newPage(); pg.errs = []; pg.reqs = [];
    pg.setDefaultTimeout(15000);
    pg.on('pageerror', e => pg.errs.push(e.message)); pg.on('request', r => pg.reqs.push(r.url()));
    await pg.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, o.lang || 'vi');
    if (o.init) await pg.addInitScript(o.init);
    await pg.route(/\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
    if (o.noGlb) await pg.route(/\.glb(\?|$)/, r => r.abort());
    await pg.goto(BASE + '/hub-3d.html?nv=3d', { waitUntil: 'load', timeout: 60000 });   // kiểm mô hình 3D (tranh động là mặc định từ 11/11/2026)
    return pg;
  };
  const pick = async (pg, vai = 'ceo') => { await pg.click(`#bb-pick [data-vai="${vai}"]`); return until(pg, () => window.__benBizon && window.__benBizon.state().ready); };
  try {
    // ---- 1. Chọn vai, toàn màn hình, mô hình 3D nhìn từ sau lưng, bến sông
    let pg = await open();
    check(await pg.locator('#bb-pick [data-vai]').count() === 5, 'màn chọn có đúng 5 vai đội');
    check(JSON.stringify(await pg.$$eval('#bb-pick [data-vai]', e => e.map(x => x.dataset.vai))) === '["ceo","cfo","cmo","coo","sec"]', 'năm vai: CEO, CFO, CMO, COO, Thư ký (không có Lumina, thầy Tu Phan)');
    check(await pick(pg, 'ceo'), 'chọn CEO → cảnh sẵn sàng');
    let s = await st(pg);
    const stage = await rect(pg, '#bb-stage'), vh = await pg.evaluate(() => innerHeight);
    check(stage.h >= vh * 0.9 && stage.w >= 389, `cảnh 3D chiếm toàn màn hình (${Math.round(stage.w)} × ${Math.round(stage.h)} trên ${vh})`);
    check(s.char === 'ceo', 'nhân vật điều khiển là vai đã chọn');
    check(await until(pg, () => window.__benBizon.state().glb === true), 'mô hình 3D có xương của nhân vật đã tải (thay tranh dựng đứng)');
    const info = await pg.evaluate(() => window.__benBizon.info());
    check(info.canh === 'ben-song' && info.nuoc === true && info.cauTau === true, 'bối cảnh là bến sông: có sông, có cầu tàu');
    check(JSON.stringify(info.diaDiem.slice().sort()) === JSON.stringify(PLACES.slice().sort()), 'đủ 11 địa điểm: ' + info.diaDiem.join(', '));
    s = await st(pg);
    const behind = (s.x - s.camX) * Math.sin(s.yaw) + (s.z - s.camZ) * Math.cos(s.yaw), dist = Math.hypot(s.x - s.camX, s.z - s.camZ);
    check(behind / dist > 0.8 && dist > 1.5 && dist < 7 && s.camY > 1, `máy quay ở sau lưng nhân vật (cách ${dist.toFixed(1)}, cao ${s.camY.toFixed(1)})`);
    const joy = await rect(pg, '.dc-joy');
    check(joy && joy.on && joy.x < 60 && joy.b > vh - 220 && joy.b <= vh && joy.w >= 104, 'cần điều khiển ở góc trái dưới, đường kính ≥ 104 px');
    const tag = await pg.textContent('#bb-tag');
    check(/CEO/.test(tag) && /Minh Long/.test(tag), 'tên nhân vật hiện bằng chữ: ' + tag.trim());
    check(await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, 'không tràn ngang ở 390 px');

    // ---- 2. Đi bằng bàn phím: quay mặt theo hướng đi, có động tác bước, máy quay đi theo, dừng thì đứng
    const z0 = s.z;
    await pg.keyboard.down('KeyW');
    check(await until(pg, z => window.__benBizon.state().z > z + 1.2, z0), 'giữ W → nhân vật đi về phía trước (ra bờ sông)');
    s = await st(pg);
    check(s.mode === 'walk' && s.clip === 'walk', 'đang đi: động tác «đi» (' + s.mode + '/' + s.clip + ')');
    check(Math.hypot(s.x - s.camX, s.z - s.camZ) < 7, 'máy quay đi theo nhân vật');
    // ---- 3. Thẻ «Vào»: hiện khi vào tầm, ẩn khi ra xa
    check(await until(pg, () => window.__benBizon.state().near === 'hanh-trinh'), 'đi tiếp → vào tầm cột mốc Hành trình 3 bậc');
    check((await rect(pg, '.dc-card')).on && /Hành trình 3 bậc/.test(await pg.textContent('.dc-card')), 'thẻ hiện tên địa điểm');
    check(await until(pg, () => window.__benBizon.state().near === null && window.__benBizon.state().z > 0.5), 'đi ra xa (lên cầu tàu) → thẻ ẩn');
    check(!(await rect(pg, '.dc-card')).on, 'thẻ «Vào» không còn hiện');
    check(await until(pg, () => window.__benBizon.state().near === 'ben-phu-sa'), 'đi dọc cầu tàu → tới ghe chợ nổi (Bến Phù Sa)');
    await pg.keyboard.up('KeyW');
    check(await until(pg, () => window.__benBizon.state().mode === 'idle' && window.__benBizon.state().speed < 0.05), 'thả phím → nhân vật đứng lại, động tác «đứng»');
    s = await st(pg);
    check(s.clip === 'idle', 'clip đứng sau khi dừng');
    const cardTxt = await pg.textContent('.dc-card');
    check(/Bến Phù Sa/.test(cardTxt) && /Miễn phí/i.test(cardTxt), 'thẻ Bến Phù Sa có nhãn «Miễn phí»');
    const vao = await rect(pg, '.dc-card .dc-vao');
    check(vao.on && vao.h >= 44 && vao.w >= 44 && /Vào/.test(await pg.textContent('.dc-card .dc-vao')), 'nút «Vào» ≥ 44 px');
    check(!overlap(await rect(pg, '.dc-card'), await rect(pg, '.dc-joy')) && !overlap(await rect(pg, '.dc-card'), await rect(pg, '.dc-goto-btn')), 'thẻ không che cần điều khiển và nút «Đi tới…»');
    // ---- 4. «Vào» bằng phím E mở đúng game
    await pg.keyboard.press('KeyE');
    check(await pg.waitForURL(/ben-phu-sa-3d\.html/, { timeout: 20000, waitUntil: 'commit' }).then(() => true, () => false), 'phím E → mở Bến Phù Sa 3D');
    check(pg.errs.length === 0, 'không lỗi JS ở Bến BizOn: ' + pg.errs.join(' | '));
    const out = pg.reqs.filter(u => /^https?:/.test(u) && !u.startsWith(BASE));
    check(out.length === 0, 'không có yêu cầu mạng nào ra ngoài trang: ' + out.slice(0, 3).join(', '));
    await pg.context().close();

    // ---- 5. Mũi tên + cần điều khiển; không rơi xuống nước
    pg = await open(); await pick(pg, 'coo');
    s = await st(pg);
    await pg.keyboard.down('ArrowUp'); check(await until(pg, z => window.__benBizon.state().z > z + 0.5, s.z), 'phím mũi tên đi được như WASD'); await pg.keyboard.up('ArrowUp');
    await pg.keyboard.down('KeyD');
    check(await until(pg, y => Math.abs(window.__benBizon.state().yaw - y) > 0.6, s.yaw), 'giữ D → nhân vật quay mặt sang hướng đi');
    check(await until(pg, y => Math.abs(window.__benBizon.state().camYaw - y) > 0.3, s.camYaw), 'máy quay xoay dần về sau lưng');
    await pg.keyboard.up('KeyD');
    await pg.evaluate(() => window.__benBizon.dat(-8, -4, 0));
    await until(pg, () => window.__benBizon.state().speed < 0.05);
    s = await st(pg);
    const j = await rect(pg, '.dc-joy'), cx = j.x + j.w / 2, cy = j.y + j.h / 2;
    await pg.mouse.move(cx, cy); await pg.mouse.down(); await pg.mouse.move(cx, cy - 46, { steps: 4 });
    check(await until(pg, z => window.__benBizon.state().z > z + 1, s.z), 'đẩy cần điều khiển lên → nhân vật đi tới');
    // tiếp tục đẩy về phía sông: dừng ở mép bờ
    let wet = 0, maxZ = -99;
    for (let i = 0; i < 40; i++) { await pg.waitForTimeout(100); const q = await pg.evaluate(() => { const t = window.__benBizon.state(); return { z: t.z, land: window.__benBizon.laBo(t.x, t.z) }; }); if (!q.land) wet++; maxZ = Math.max(maxZ, q.z); }
    await pg.mouse.up();
    check(wet === 0 && maxZ < 0.2, `đẩy mãi về phía sông: dừng ở mép bờ, không xuống nước (z lớn nhất ${maxZ.toFixed(2)})`);
    check(await until(pg, () => window.__benBizon.state().speed < 0.05), 'thả cần → dừng');

    // ---- 6. Lối tắt «Đi tới…» chỉ bằng bàn phím, tới được mọi địa điểm; nút «Vào» bấm được
    const gotoBtn = await rect(pg, '.dc-goto-btn');
    check(gotoBtn.on && gotoBtn.h >= 44 && /Đi tới/.test(await pg.textContent('.dc-goto-btn')), 'có nút «Đi tới…» ≥ 44 px');
    let reached = 0;
    for (const id of PLACES) {
      await pg.focus('.dc-goto-btn'); await pg.keyboard.press('Enter');
      if (!(await rect(pg, '.dc-goto')).on) break;
      await pg.focus(`.dc-goto [data-id="${id}"]`); await pg.keyboard.press('Enter');
      if (await until(pg, i => window.__benBizon.state().near === i, id, 4000)) reached++;
    }
    check(reached === PLACES.length, `«Đi tới…» bằng bàn phím tới được ${reached}/${PLACES.length} địa điểm`);
    check(!(await rect(pg, '.dc-goto')).on && await pg.evaluate(() => document.activeElement && document.activeElement.classList.contains('dc-vao')), 'chọn xong: danh sách đóng, tiêu điểm nằm ở nút «Vào»');
    const items = await pg.$$eval('.dc-goto [data-id]', e => e.map(x => x.tagName + ':' + (x.textContent || '').trim().length));
    check(items.length === PLACES.length && items.every(x => /^BUTTON:[1-9]/.test(x)), 'danh sách là các nút có chữ (trình đọc màn hình đọc được)');
    await pg.focus('.dc-goto-btn'); await pg.keyboard.press('Enter'); await pg.focus('.dc-goto [data-id="bat-nghiep"]'); await pg.keyboard.press('Enter');
    await until(pg, () => window.__benBizon.state().near === 'bat-nghiep');
    check(/Dùng thử/i.test(await pg.textContent('.dc-card')), 'thẻ Bật Nghiệp có nhãn «Dùng thử»');
    await pg.focus('.dc-goto-btn'); await pg.keyboard.press('Enter'); await pg.focus('.dc-goto [data-id="hc-sau-rieng"]'); await pg.keyboard.press('Enter');
    await until(pg, () => window.__benBizon.state().near === 'hc-sau-rieng');
    check(!/Miễn phí|Dùng thử/i.test(await pg.textContent('.dc-card')), 'game trang Chính sách chưa nói rõ (Hộ Chiếu Sầu Riêng): thẻ không ghi nhãn');
    // cố vấn: mở hội thoại, không rời trang
    await pg.focus('.dc-goto-btn'); await pg.keyboard.press('Enter'); await pg.focus('.dc-goto [data-id="lumina"]'); await pg.keyboard.press('Enter');
    await until(pg, () => window.__benBizon.state().near === 'lumina');
    await pg.click('.dc-card .dc-vao');
    check(await until(pg, () => { const d = document.querySelector('#bb-dlg'); return d && d.classList.contains('on') && /Lumina/.test(d.textContent); }, null, 5000), 'tới gần Lumina, bấm nút → mở hội thoại của Lumina');
    check(!/\bAI\b/.test(await pg.textContent('#bb-dlg')), 'lời Lumina không tự gọi là AI');
    await pg.click('#bb-dlg-close');
    // bấm nút «Vào» bằng chuột/chạm
    await pg.focus('.dc-goto-btn'); await pg.keyboard.press('Enter'); await pg.focus('.dc-goto [data-id="hc-thuong-hieu"]'); await pg.keyboard.press('Enter');
    await until(pg, () => window.__benBizon.state().near === 'hc-thuong-hieu');
    await pg.click('.dc-card .dc-vao');
    check(await pg.waitForURL(/Ho(%20| )Chieu(%20| )Thuong(%20| )Hieu(%20| )3D\.html/, { timeout: 20000, waitUntil: 'commit' }).then(() => true, () => false), 'bấm «Vào» ở con tàu → mở Hộ Chiếu Thương Hiệu 3D');
    check(pg.errs.length === 0, 'không lỗi JS: ' + pg.errs.join(' | '));
    await pg.context().close();

    // ---- 7. 360 px, tiếng Anh: không tràn, không chồng, nút đủ lớn, chữ tiếng Anh
    pg = await open({ w: 360, h: 740, lang: 'en' }); await pick(pg, 'sec');
    check(await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, '360 px: không tràn ngang');
    await pg.focus('.dc-goto-btn'); await pg.keyboard.press('Enter');
    const list = await rect(pg, '.dc-goto');
    check(list.on && list.x >= 0 && list.r <= 360 && list.b <= 740, '360 px: danh sách «Go to…» nằm gọn trong màn hình');
    check((await pg.$$eval('.dc-goto [data-id]', e => e.map(x => x.getBoundingClientRect().height))).every(h => h >= 44), 'mỗi mục trong danh sách ≥ 44 px');
    await pg.focus('.dc-goto [data-id="ben-phu-sa"]'); await pg.keyboard.press('Enter');
    await until(pg, () => window.__benBizon.state().near === 'ben-phu-sa');
    const enCard = await pg.textContent('.dc-card');
    check(/Free/.test(enCard) && /Enter/.test(await pg.textContent('.dc-card .dc-vao')) && /Go to/.test(await pg.textContent('.dc-goto-btn')), 'bản tiếng Anh: «Free», «Enter», «Go to…»');
    const R = { card: await rect(pg, '.dc-card'), joy: await rect(pg, '.dc-joy'), go: await rect(pg, '.dc-goto-btn'), exit: await rect(pg, '#bb-exit') };
    check(!overlap(R.card, R.joy) && !overlap(R.card, R.go) && !overlap(R.card, R.exit) && !overlap(R.joy, R.go), '360 px: thẻ, cần điều khiển, «Go to…», «Exit» không chồng lên nhau');
    check(R.card.x >= 0 && R.card.r <= 360 && R.exit.on && R.exit.h >= 44, '360 px: thẻ nằm trong màn hình; nút thoát ≥ 44 px');
    await pg.keyboard.press('Escape');
    await pg.click('#bb-exit');
    check(await until(pg, () => !document.documentElement.classList.contains('bb-play'), null, 5000) && (await rect(pg, '#bb-pick')).on, 'nút thoát → về màn chọn vai');
    check(pg.errs.length === 0, 'không lỗi JS (360 px, EN): ' + pg.errs.join(' | '));
    await pg.context().close();

    // ---- 8. Giảm chuyển động: máy quay không tự xoay
    pg = await open({ reduce: true }); await pick(pg, 'cfo');
    s = await st(pg);
    await pg.keyboard.down('KeyD'); await until(pg, y => Math.abs(window.__benBizon.state().yaw - y) > 0.6, s.yaw); await pg.waitForTimeout(500); await pg.keyboard.up('KeyD');
    const s2 = await st(pg);
    check(s2.giamChuyenDong === true && Math.abs(s2.camYaw - s.camYaw) < 0.01, '«giảm chuyển động»: máy quay không tự xoay khi nhân vật đổi hướng');
    await pg.context().close();

    // ---- 9. Mô hình tải hỏng: vẫn chơi được bằng tranh dựng đứng, có dòng báo
    pg = await open({ noGlb: true }); await pick(pg, 'cmo');
    check(await until(pg, () => /tranh/.test((document.querySelector('#bb-note') || {}).textContent || ''), null, 20000), 'mô hình không tải được → có dòng báo đang dùng tranh nhân vật');
    s = await st(pg);
    await pg.keyboard.down('KeyW'); const moved = await until(pg, z => window.__benBizon.state().z > z + 1, s.z); await pg.keyboard.up('KeyW');
    check(moved && (await st(pg)).glb === false, 'vẫn đi được bằng tranh dựng đứng');
    check(pg.errs.length === 0, 'không lỗi JS khi mô hình hỏng: ' + pg.errs.join(' | '));
    await pg.context().close();

    // ---- 10. Không có WebGL: báo và đưa danh sách liên kết thường
    pg = await open({ init: () => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t) { return /webgl/i.test(t) ? null : g.apply(this, arguments); }; } });
    await pg.click('#bb-pick [data-vai="ceo"]');
    check(await until(pg, () => { const f = document.querySelector('#bb-fallback'); return f && !f.hidden; }, null, 10000), 'không có WebGL → hiện lời báo');
    const links = await pg.$$eval('#bb-links a', a => a.map(x => x.getAttribute('href')));
    check(['ben-phu-sa-3d.html', 'BizOn Game 3D.html', 'Ho Chieu Thuong Hieu 3D.html', 'lab/ho-chieu-sau-rieng-3d.html', 'games.html', 'hanh-trinh.html'].every(u => links.includes(u)), 'danh sách liên kết thường tới 6 điểm game: ' + links.length);
    check(pg.errs.length === 0, 'không lỗi JS khi không có WebGL: ' + pg.errs.join(' | '));
    await pg.context().close();
  } catch (e) { console.error(e); fails++; }
  await b.close();
  console.log(fails ? `ben-bizon-di-bo: ${fails} lỗi` : 'ben-bizon-di-bo: ok');
  process.exit(fails ? 1 : 0);
})();
