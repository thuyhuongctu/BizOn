// Giọng thu tiếng Anh cho Bật Nghiệp (14/11/2026, lớp UM Kendari): 57 bản thu ở assets/audio/voice/en/ (cùng tên với bản tiếng Việt).
// Ở chế độ EN: lời chào thầy Tú ở màn đăng nhập, câu của vai mình + lời thầy Tú mở vòng ở phòng đối đầu, câu mở đầu từng vai trong
// cuộc họp đội 3D; nút «Voice: On/Off» tắt được. Ở chế độ VI không tải bản thu tiếng Anh (giọng tiếng Việt vẫn tắt chờ thu lại).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 870);

// 1. Tệp: đủ bộ, mp3 hợp lệ, không tệp nào rỗng hay quá dài; danh sách EN_VOICE trong app.js khớp thư mục.
const DIR = path.join(ROOT, 'assets/audio/voice/en');
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.mp3')).map(f => f.slice(0, -4)).sort();
assert.equal(files.length, 57, 'đủ 57 bản thu');
for (const id of files) {
  const b = fs.readFileSync(path.join(DIR, id + '.mp3'));
  assert.ok(b.length > 15000 && b.length < 400000, id + ' cỡ ' + b.length);
  assert.ok(b.slice(0, 3).toString() === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0), id + ' không phải mp3');
}
const app = read('js/app.js');
const listed = (app.match(/const EN_VOICE = new Set\(\[([^\]]*)\]\)/) || [])[1];
assert.ok(listed, 'EN_VOICE');
assert.deepEqual(listed.match(/'[^']+'/g).map(s => s.slice(1, -1)).sort(), files, 'EN_VOICE khớp thư mục voice/en');
for (const id of ['tu-welcome-01', 'tu-round-01', 'tu-round-06', 'tu-wrap-01', 'tu-wrap-04', 'sec-meet-01', 'sec-meet-02', 'cmo-r2', 'coo-r3', 'sec-r4', 'adv-01', 'intro-06', 'glob-03', 'chat-08'])
  assert.ok(files.includes(id), 'thiếu ' + id);
// Câu chưa thu (CEO, CFO) không có trong danh sách → im lặng, không dùng giọng máy.
assert.ok(!files.some(f => /^(ceo|cfo)-/.test(f)));
// Mọi mã câu engine/app dùng đều có tệp tiếng Anh, trừ những câu đã biết là chưa thu.
const known = new Set(['chat-02', 'adv-14', 'adv-15', 'adv-16', 'adv-17', 'kpi-01', 'kpi-03', 'ceo-r1', 'cfo-r5', 'ceo-r6', 'cfo-meet-01', 'cfo-meet-02']);
for (const src of ['js/app.js', 'js/engine.js', 'BizOn Game 3D.html', 'global.html'])
  for (const m of read(src).matchAll(/'((?:adv|kpi|risk|chat|quote|glob|intro|tu|ceo|cfo|cmo|coo|sec)-(?:[a-z]+-)?\d+)'/g))
    if (!known.has(m[1]) && !/-0$/.test(m[1])) assert.ok(files.includes(m[1]), src + ': ' + m[1] + ' chưa có bản thu tiếng Anh');
assert.match(read('global.html'), /'assets\/audio\/voice\/' \+ \(en \? 'en\/' : ''\) \+ clip/);

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const errs = [];
  const open = async lang => {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage(); const voice = [];
    p.on('pageerror', e => errs.push(e.message));
    p.on('request', r => { const m = /assets\/audio\/voice\/(en\/)?([\w-]+)\.mp3/.exec(r.url()); if (m) voice.push((m[1] || '') + m[2]); });
    await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); localStorage.setItem('bizon-music', 'off'); } catch (e) {} }, lang);
    await p.goto(BASE + '/BizOn%20Game%203D.html?lang=' + lang, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForSelector('#l3Team', { state: 'visible', timeout: 90000 });
    await p.waitForFunction(() => { const f = document.getElementById('gf'); return f && f.contentWindow && typeof f.contentWindow.playVoice === 'function'; }, null, { timeout: 90000 });
    return { p, ctx, voice };
  };
  const click = async (p, sel, wait = 1500) => { await p.waitForSelector(sel, { state: 'visible', timeout: 60000 }); await p.click(sel); await p.waitForTimeout(wait); };
  const waitVoice = (voice, id, ms = 20000) => new Promise((res, rej) => { const t0 = Date.now(); const k = setInterval(() => { if (voice.includes(id)) { clearInterval(k); res(); } else if (Date.now() - t0 > ms) { clearInterval(k); rej(new Error('không phát ' + id + ' – đã phát: ' + voice.join(', '))); } }, 200); });
  try {
    // EN: chào → Demo → hướng dẫn → bốc thăm → đối đầu → bàn quyết định → họp đội
    const { p, ctx, voice } = await open('en');
    await p.click('#l3Team'); await waitVoice(voice, 'en/tu-welcome-01');
    assert.equal(await p.locator('#voiceBtn').textContent(), '🗣️Voice: On');
    await click(p, '#l3Demo', 6000);
    for (const s of ['#t3Next', '#t3Next', '#t3End']) await click(p, s, 3000);
    await click(p, '#cdGo', 3000);
    await waitVoice(voice, 'en/tu-round-01', 30000);
    assert.match(await p.locator('#rmCard').textContent(), /Phan Anh Tú: “This round lays the foundation/);
    await click(p, '#foGo', 4000);
    await click(p, '#dcMeet', 3000);
    for (let i = 0; i < 3; i++) await click(p, '#tmNext', 1500);
    await waitVoice(voice, 'en/sec-meet-01'); await waitVoice(voice, 'en/sec-meet-02');
    assert.ok(voice.every(v => v.startsWith('en/')), 'chế độ EN chỉ tải bản thu tiếng Anh: ' + voice);
    // Tắt giọng → không tải thêm
    await click(p, '#tmClose', 1500);
    await p.evaluate(() => document.getElementById('voiceBtn').click());
    assert.equal(await p.locator('#voiceBtn').textContent(), '🔇Voice: Off');
    assert.equal(await p.evaluate(() => localStorage.getItem('bizon-voice-en')), 'off');
    const n = voice.length;
    assert.equal(await p.evaluate(() => document.getElementById('gf').contentWindow.playVoice('adv-02')), false);
    await p.waitForTimeout(800); assert.equal(voice.length, n);
    await ctx.close();
    // VI: không có nút giọng, không tải bản thu tiếng Anh
    const vi = await open('vi');
    await vi.p.click('#l3Team'); await vi.p.waitForTimeout(1500);
    assert.equal(await vi.p.locator('#voiceBtn').isVisible(), false);
    assert.deepEqual(vi.voice, []);
    assert.equal(await vi.p.evaluate(() => document.getElementById('gf').contentWindow.playVoice('adv-02')), false);
    await vi.ctx.close();
    assert.deepEqual(errs.filter(e => !/WebGL|three/i.test(e)), []);
    console.log('giong-tieng-anh: ok');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
