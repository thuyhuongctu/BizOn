#!/usr/bin/env node
/* BizOn – quay lại video hướng dẫn chơi Hộ Chiếu Thương Hiệu (brand-passport.html) theo đúng game hiện tại.
 * Lưu trong kho để lần sau game đổi giao diện hay luật chỉ cần chạy lại (các bản trước quay bằng script tạm, đã mất).
 *
 * Dùng:  NODE_PATH=… node scripts/video/quay-ho-chieu-thuong-hieu.mjs --ban ngan|chi-tiet --lang vi|en --out <thư mục>
 *        [--thu]  chỉ chụp ảnh từng bước (xem nhanh bố cục, không dựng video)
 * Kết quả: <out>/<tên>.mp4 (720×1280, 30 khung/giây, H.264 + AAC, faststart, −15 LUFS) – kiểm bằng scripts/kiem-video.mjs.
 *
 * Cách làm: tự bật máy chủ tĩnh, mở trang ở khổ điện thoại 360×640 (tỉ lệ điểm ảnh 2 → 720×1280), bấm thật vào nút
 * (có vòng chạm màu cam), phụ đề là một dải chữ gắn vào trang (chữ Be Vietnam Pro, nét như giao diện), ghi hình bằng
 * Chrome DevTools screencast (ảnh JPEG chất lượng cao kèm mốc thời gian) rồi ghép bằng ffmpeg, lồng nhạc chủ đề
 * «Hộ Chiếu Thương Hiệu – Phần III (remix 2)». Ván minh họa: hạt giống 42, Mekong Digital vào Hải Lam qua nền tảng số. */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, rmSync } from 'node:fs';
import { join, extname, resolve, sep, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const BAN = arg('--ban') || 'ngan', LANG = arg('--lang') || 'vi', OUT = resolve(arg('--out') || join(ROOT, 'out-video')), THU = process.argv.includes('--thu');
const EN = LANG === 'en';
const L = (vi, en) => (EN ? en : vi);
mkdirSync(OUT, { recursive: true });

// ---------- máy chủ tĩnh ----------
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.glb': 'model/gltf-binary', '.vtt': 'text/vtt' };
const server = createServer((req, res) => {
  const p = resolve(ROOT, '.' + decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT + sep) || !existsSync(p) || !statSync(p).isFile()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

// ---------- trình duyệt ----------
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block', locale: EN ? 'en-US' : 'vi-VN' });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
await page.addInitScript(lang => {
  try { localStorage.clear(); localStorage.setItem('bizon-lang', lang); localStorage.setItem('bizon-bp-tour-seen', '{"obs":1,"dec":1,"evt":1}'); } catch (e) {}
}, LANG);
await page.route(/\.mp3(\?|$)/, r => r.abort()); // nhạc lồng sau bằng ffmpeg
await page.goto(`${BASE}/brand-passport.html?seed=42`, { waitUntil: 'load' });
await page.waitForFunction(() => !!window.bpTest && !!document.getElementById('g3d-demo'));
await page.evaluate(() => document.fonts && document.fonts.ready);
await page.addStyleTag({ content: `
  #vd-cap{position:fixed;left:10px;right:10px;bottom:12px;z-index:2147483600;padding:10px 14px;border-radius:16px;
    background:rgba(3,51,55,.92);color:#fff;font:700 15.5px/1.38 'Be Vietnam Pro',system-ui,sans-serif;text-align:center;
    box-shadow:0 8px 24px rgba(0,0,0,.28);opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s;pointer-events:none}
  #vd-cap.on{opacity:1;transform:none} #vd-cap b{color:#FDA127} #vd-cap.top{bottom:auto;top:12px}
  #vd-tap{position:fixed;z-index:2147483601;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;border:4px solid #FDA127;
    background:rgba(253,161,39,.18);pointer-events:none;opacity:0}
  #vd-tap.go{animation:vdtap .55s ease-out}
  @keyframes vdtap{0%{opacity:1;transform:scale(.55)}70%{opacity:.9;transform:scale(1.05)}100%{opacity:0;transform:scale(1.25)}}
  /* nút nổi của trang không che phụ đề trong video */
  [id*="lumina"][style*="fixed"],.bz-fab,#bz-more{visibility:hidden!important}` });
await page.evaluate(() => { for (const id of ['vd-cap', 'vd-tap']) { const d = document.createElement('div'); d.id = id; document.body.appendChild(d); } });

// ---------- ghi hình bằng screencast ----------
const frames = [];
const cdp = await ctx.newCDPSession(page);
cdp.on('Page.screencastFrame', async f => { frames.push({ t: f.metadata.timestamp, data: f.data }); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (e) {} });
const wait = ms => page.waitForTimeout(ms);
let shotN = 0;
const shot = async name => { if (THU) await page.screenshot({ path: join(OUT, `${String(shotN++).padStart(2, '0')}-${name}.png`) }); };

async function cap(html, ms = 0, top = false) {
  await page.evaluate(([h, t]) => { const c = document.getElementById('vd-cap'); c.classList.toggle('top', t); if (!h) { c.classList.remove('on'); return; } c.innerHTML = h; c.classList.add('on'); }, [html, top]);
  if (ms) await wait(ms);
}
async function scrollTo(sel, block = 'center', ms = 900) {
  await page.evaluate(([s, b]) => { const el = typeof s === 'number' ? null : document.querySelector(s); if (el) el.scrollIntoView({ behavior: 'smooth', block: b }); else window.scrollTo({ top: s, behavior: 'smooth' }); }, [sel, block]);
  await wait(ms);
}
async function tap(sel, { before = 500, after = 800, block = 'center' } = {}) {
  await page.waitForSelector(sel, { state: 'attached', timeout: 15000 });
  await scrollTo(sel, block, before);
  const ok = await page.evaluate(s => {
    const el = document.querySelector(s); if (!el) return false;
    const r = el.getBoundingClientRect(), t = document.getElementById('vd-tap');
    t.style.left = (r.left + r.width / 2) + 'px'; t.style.top = (r.top + r.height / 2) + 'px';
    t.classList.remove('go'); void t.offsetWidth; t.classList.add('go'); return true;
  }, sel);
  if (!ok) throw new Error('không thấy ' + sel);
  await wait(260);
  await page.evaluate(s => document.querySelector(s).click(), sel);
  await wait(after);
}
// Bảng «Sau quý» so với đối thủ Kim Long hiện sau khi chốt quý – đọc một nhịp rồi bấm «Tiếp tục»
async function arena(slow = true) {
  const has = await page.waitForSelector('#bp-rival-arena', { timeout: 2500 }).then(() => true, () => false);
  if (!has) return;
  if (slow) await cap(L('Sau mỗi quý: so tài với đối thủ <b>Kim Long Exports</b>', 'After each quarter: measure up against rival <b>Kim Long Exports</b>'), 1500);
  else await wait(500);
  await tap('#bp-rival-arena [onclick="BPRivalIntel.closeArena()"]', { before: 100, after: 600 });
}

if (!THU) await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 720, maxHeight: 1280, everyNthFrame: 1 });
await wait(600);

// ================= KỊCH BẢN =================
const FIRM = 3, MKT = 0, MODE = 0, SHIP = 1;            // Mekong Digital → Hải Lam qua Nền tảng số, hỏa tốc
const PLAN = [[0, 1], [2, 1], [3, 1], [1, 1], [4, 1], [1, 2]]; // [ưu tiên, mức vận hành] từng quý

await cap(L('🛂 <b>Hộ Chiếu Thương Hiệu</b>: đưa một thương hiệu Việt ra thế giới trong 6 quý', '🛂 <b>Brand Passport</b>: take a Vietnamese brand global in 6 quarters'), 2600, true);
await shot('cong');
await cap(L('Vào nhanh: tên đội, email, mã lớp – hoặc bỏ trống để <b>chơi thử</b>', 'Quick start: team, email, class code – or leave blank for a <b>quick play</b>'), 1400, true);
await tap('#g3d-demo', { after: 1100 });
await shot('gioi-thieu');
await scrollTo('[onclick="bpFirm(0)"]', 'center', 1000);
await cap(L('Chọn <b>1 trong 4 doanh nghiệp</b> – mỗi nhà một điểm mạnh, một điểm yếu', 'Pick <b>1 of 4 companies</b> – each has its own strength and weakness'), 1500);
await tap(`[onclick="bpFirm(${FIRM})"]`, { after: 1300 });
await shot('chon-dn');
if (BAN === 'chi-tiet') {
  await cap(L('Luật chơi và cách tính điểm luôn mở sẵn – đọc trước khi bắt đầu', 'The rules and scoring are always open – read them before you start'), 0);
  await scrollTo('#bp-rules-block', 'start', 1600); await wait(1500);
}
await cap(L('Bắt đầu hành trình 6 quý 🛫', 'Begin the 6-quarter journey 🛫'), 600);
await tap('[onclick="bpStart()"]', { after: 1400 });

async function quarterFull(qi, { intel = null, enter = null, shop = false, slow = true } = {}) {
  const [prio, bud] = PLAN[qi];
  await scrollTo(0, 'start', 500);
  await shot(`q${qi + 1}-quansat`);
  if (qi === 0) await cap(L('Mỗi quý ba bước: <b>① Quan sát → ② Quyết định → ③ Biến cố</b>', 'Every quarter has three steps: <b>① Observe → ② Decide → ③ Event</b>'), 2000);
  await cap(L(`Quý ${qi + 1} · ① <b>Quan sát & Tình báo</b>: đọc tín hiệu thị trường${intel !== null ? ', mua thêm tin (tối đa 2 nguồn)' : ''}`, `Quarter ${qi + 1} · ① <b>Observe & Intel</b>: read the market signals${intel !== null ? ', buy extra intel (2 sources max)' : ''}`), slow ? 1700 : 700);
  if (intel !== null) {
    await tap(`[onclick="bpIntel(${intel})"]`, { after: 700 });
    await tap(`#bp-mkt-pick [data-pm="${MKT}"]`, { before: 200, after: 1100 });
    await shot(`q${qi + 1}-tinbao`);
  }
  if (shop) {
    await cap(L('🛒 Cửa hàng vật phẩm: chứng nhận, khảo sát, bảo hiểm… dùng đúng lúc mới có lợi', '🛒 Item shop: certificates, surveys, insurance… only worth it at the right time'), 0);
    await tap('[onclick="bpToggleShop()"]', { after: 1800 });
    await tap('[onclick="bpToggleShop()"]', { after: 400 });
  }
  await tap('[onclick="bpToDecide()"]', { after: 900 });
  await shot(`q${qi + 1}-quyetdinh`);
  await cap(L('② <b>Quyết định</b>: chọn ưu tiên và mức vận hành' + (enter ? ', thị trường, cách vào, vận chuyển' : ''), '② <b>Decide</b>: pick a priority and an operating stance' + (enter ? ', a market, an entry mode and freight' : '')), slow ? 900 : 300);
  await tap(`.bp-opt[data-g="prio"][data-i="${prio}"]`, { after: slow ? 600 : 250 });
  if (enter) {
    await tap(`[onclick="bpEnter(${enter[0]},${enter[1]})"]`, { after: 700 });
    if (slow && qi === 0) await cap(L('Vận chuyển: <b>đường biển</b> rẻ nhưng dễ chậm hàng, <b>hỏa tốc</b> đắt nhưng chắc', 'Freight: <b>sea</b> is cheap but often late, <b>express</b> costs more but arrives'), 900);
    await tap(`[onclick="bpShip(${enter[2]})"]`, { after: 800 });
  }
  await tap(`.bp-opt[data-g="bud"][data-i="${bud}"]`, { after: slow ? 600 : 250 });
  await shot(`q${qi + 1}-dachon`);
  await tap('[onclick="bpCommit()"]', { after: 900 });
  await shot(`q${qi + 1}-bienco`);
  await cap(L('③ <b>Biến cố</b> bất ngờ: chọn cách ứng phó – cách nào cũng có cái giá', '③ A surprise <b>event</b>: choose a response – every option has a cost'), slow ? 1500 : 600);
  await tap('[onclick="bpEv(0)"]', { after: 1000 });
  await arena(slow);
  await scrollTo(0, 'start', 400);
  await shot(`q${qi + 1}-ketqua`);
}

if (BAN === 'ngan') {
  await quarterFull(0, { intel: 1, enter: [MKT, MODE, SHIP] });
  await cap(L('Kết quả quý: doanh thu, lợi nhuận, uy tín… và đối thủ <b>Kim Long</b> cũng đang chạy', 'Quarter results: revenue, profit, reputation… and rival <b>Kim Long</b> is racing too'), 1200);
  await scrollTo('#bp-log', 'center', 1500); await scrollTo(0, 'start', 600);
  await cap(L('Quý 2 → 6: tri thức tích lũy dần, quyết định nhanh và chắc hơn', 'Quarters 2 → 6: knowledge builds up, decisions get faster and surer'), 0);
  for (let i = 1; i < 6; i++) {
    if (await page.evaluate(() => window.bpTest.ended())) break;
    await tap('[onclick="bpNext()"]', { before: 250, after: 450 });
    await tap('[onclick="bpToDecide()"]', { before: 250, after: 450 });
    await tap(`.bp-opt[data-g="prio"][data-i="${PLAN[i][0]}"]`, { before: 250, after: 200 });
    await tap(`.bp-opt[data-g="bud"][data-i="${PLAN[i][1]}"]`, { before: 250, after: 200 });
    await tap('[onclick="bpCommit()"]', { before: 250, after: 450 });
    await tap('[onclick="bpEv(0)"]', { before: 250, after: 500 });
    await arena(false);
  }
} else {
  await quarterFull(0, { intel: 1, enter: [MKT, MODE, SHIP] });
  await cap(L('Kết quả quý hiện ngay: doanh thu, lợi nhuận, uy tín, và đường đua với đối thủ <b>Kim Long</b>', 'Results show up at once: revenue, profit, reputation, and the race against rival <b>Kim Long</b>'), 1400);
  await scrollTo('#bp-log', 'center', 1800);
  await cap(L('Nhật ký hành trình ghi lại mọi quyết định – dùng khi thảo luận cuối buổi', 'The journey log records every decision – handy for the class debrief'), 1600);
  await scrollTo(0, 'start', 600);
  await tap('[onclick="bpNext()"]', { after: 700 });
  await quarterFull(1, { intel: 0, shop: true, slow: false });
  await cap(L('Quý 2: uy tín lên nhờ xây thương hiệu – tri thức về thị trường cũng tích lũy dần', 'Quarter 2: brand building lifts reputation – market knowledge keeps building'), 1500);
  for (let i = 2; i < 6; i++) {
    if (await page.evaluate(() => window.bpTest.ended())) break;
    await tap('[onclick="bpNext()"]', { after: 600 });
    await quarterFull(i, { slow: false });
    if (i === 3) await cap(L('Sương mù thông tin: không có đáp án đúng duy nhất – mỗi đội một con đường', 'Fog of information: there is no single right answer – each team finds its own path'), 1500);
  }
}

// ---------- màn kết thúc ----------
await page.waitForFunction(() => window.bpTest.ended(), null, { timeout: 15000 });
await scrollTo(0, 'start', 700); await wait(1600);
await shot('ket-thuc');
await cap(L('Điểm tổng = 30% Lợi nhuận + 20% Uy tín + 20% Năng lực + 15% Thích ứng + 15% Bền vững', 'Total = 30% Profit + 20% Reputation + 20% Capability + 15% Adaptability + 15% Sustainability'), 0);
await scrollTo('#bp-breakdown', 'center', 2800);
await shot('diem');
if (BAN === 'chi-tiet') {
  await cap(L('So với đối thủ, và <b>tiền đi đâu</b>: vốn ban đầu + lợi nhuận − chi ngoài lợi nhuận = tiền mặt', 'Versus the rival, and <b>where the money went</b>: starting cash + profit − off-profit spending = cash'), 0);
  await scrollTo('#bp-rival-final', 'start', 2200);
  await scrollTo('#bp-cash-bridge', 'center', 2600);
  await shot('tien-di-dau');
  await cap(L('Hoàn thành 6 quý: nhận giấy chứng nhận, nộp kết quả cho giảng viên', 'Finish 6 quarters: get your certificate and submit results to your instructor'), 0);
  await scrollTo('#bp-cert-box', 'center', 2600);
  await shot('chung-nhan');
}
await scrollTo(0, 'start', 900);
await cap(L('Không có một con đường đúng cho mọi doanh nghiệp. <b>Vào chơi và tự rút ra bài học!</b>', 'There is no single right path for every company. <b>Play and draw your own lessons!</b>'), 2600);
await cap('', 500);

const st = await page.evaluate(() => ({ sc: window.bpTest.scores(), s: window.bpTest.state() }));
if (!THU) await cdp.send('Page.stopScreencast');
await browser.close(); server.close();
console.log(`Ván minh họa: điểm ${st.sc.total}/100, lợi nhuận ${st.s.profit.toFixed(2)} tỷ, tiền mặt ${st.s.cash.toFixed(2)} tỷ, quý ${st.s.q}`);
if (errors.length) { console.error('Lỗi JS trên trang:\n' + errors.join('\n')); process.exit(1); }
if (THU) process.exit(0);

// ---------- dựng video ----------
const name = `bp-huong-dan-${BAN === 'ngan' ? 'choi' : 'chi-tiet'}-${LANG}`;
const tmp = join(OUT, name + '-khung'); rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp);
let list = 'ffconcat version 1.0\n';
frames.forEach((f, i) => {
  const fn = `f${String(i).padStart(5, '0')}.jpg`; writeFileSync(join(tmp, fn), Buffer.from(f.data, 'base64'));
  const d = i + 1 < frames.length ? Math.max(0.001, frames[i + 1].t - f.t) : 0.5;
  list += `file ${fn}\nduration ${d.toFixed(4)}\n`;
});
list += `file f${String(frames.length - 1).padStart(5, '0')}.jpg\n`;
writeFileSync(join(tmp, 'list.txt'), list);
const dur = frames[frames.length - 1].t - frames[0].t + 0.5;
const silent = join(OUT, name + '-hinh.mp4'), final = join(OUT, name + '.mp4');
const ff = (...a) => { const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' }); if (r.status !== 0) throw new Error('ffmpeg lỗi'); };
ff('-f', 'concat', '-safe', '0', '-i', join(tmp, 'list.txt'), '-vf', 'fps=30,scale=720:1280:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-profile:v', 'high', '-level', '4.0', silent);
const music = join(ROOT, 'assets/audio/ho-chieu-p3-en-remix2.mp3');
ff('-i', silent, '-i', music, '-filter_complex', `[1:a]atrim=0:${dur.toFixed(2)},afade=t=in:d=0.8,afade=t=out:st=${Math.max(0, dur - 2.2).toFixed(2)}:d=2,loudnorm=I=-15:TP=-1.5:LRA=7,aresample=48000[a]`,
  '-map', '0:v:0', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', final);
rmSync(tmp, { recursive: true, force: true }); rmSync(silent, { force: true });
console.log('Xong: ' + final + ` (${dur.toFixed(1)} s, ${frames.length} ảnh screencast)`);
