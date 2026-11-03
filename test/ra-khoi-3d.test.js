// Ra Khơi Cùng Lớp 3D (03/11/2026): phòng nhiều người của Hộ Chiếu Thương Hiệu qua Supabase Realtime.
// 1. Giao thức: js/phong-realtime.js chạy với một WebSocket giả – vào kênh, track presence, nhận broadcast, dọn người rời phòng.
// 2. Gắn vào site: thẻ trong ho-chieu-thuong-hieu.html, sw.js, sitemap.xml; tên người chơi không bao giờ đi qua innerHTML.
// 3. Chạy thật (không mạng: backend tắt): vào phòng, không lỗi trang, tiếng Anh đúng chữ.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';

const page = read('ra-khoi-3d.html'), game = read('js/ra-khoi-3d.js'), rt = read('js/phong-realtime.js');
assert.ok(read('ho-chieu-thuong-hieu.html').includes('href="ra-khoi-3d.html"'), 'trang Hộ Chiếu chưa dẫn tới phòng 3D');
const sw = read('sw.js');
for (const f of ['./ra-khoi-3d.html', './js/ra-khoi-3d.js', './js/phong-realtime.js']) assert.ok(sw.includes("'" + f + "'"), 'sw.js thiếu ' + f);
assert.ok(+(sw.match(/bizon-v(\d+)/) || [])[1] >= 761);
assert.ok(read('sitemap.xml').includes('https://bizonland.com/ra-khoi-3d.html<'));
assert.ok(page.includes('<link rel="canonical" href="https://bizonland.com/ra-khoi-3d.html">'));
assert.ok(!/innerHTML/.test(game) && !/innerHTML/.test(rt), 'tên người chơi phải đi qua textContent / canvas');
assert.ok(!/service_role/i.test(game + rt), 'không dùng khoá bí mật');
assert.match(game, /const SUC_CHUA = 30;/);

(async () => {
  // 1. giao thức với WebSocket giả
  const sent = []; let sock;
  globalThis.WebSocket = class { constructor(u) { this.url = u; this.readyState = 1; sock = this; setTimeout(() => this.onopen && this.onopen(), 0); }
    send(s) { sent.push(JSON.parse(s)); } close() { this.readyState = 3; } };
  const { moPhong } = await import(path.join(ROOT, 'js/phong-realtime.js'));
  const tin = [], ds = [], tt = [];
  const p = moPhong({ url: 'https://x.supabase.co', key: 'sb_publishable_test', phong: 'kdqt-k48', id: 'me',
    trangThai: () => ({ ten: 'Lan', cty: 'moc-nhien', dau: 2 }), onTin: (e, d) => tin.push([e, d]), onDanhSach: l => ds.push(l), onTrangThai: s => tt.push(s) });
  await new Promise(r => setTimeout(r, 5));
  assert.match(sock.url, /^wss:\/\/x\.supabase\.co\/realtime\/v1\/websocket\?apikey=sb_publishable_test&vsn=1\.0\.0$/);
  const join = sent.find(m => m.event === 'phx_join');
  assert.equal(join.topic, 'realtime:bizon-ra-khoi-kdqt-k48');
  assert.deepEqual(join.payload.config, { broadcast: { self: false, ack: false }, presence: { key: 'me' } });
  const T = 'realtime:bizon-ra-khoi-kdqt-k48', nhan = o => sock.onmessage({ data: JSON.stringify(Object.assign({ topic: T }, o)) });
  nhan({ event: 'phx_reply', ref: join.ref, payload: { status: 'ok', response: {} } });
  assert.equal(tt.at(-1), 'da-vao');
  const track = sent.find(m => m.event === 'presence');
  assert.deepEqual(track.payload, { type: 'presence', event: 'track', payload: { ten: 'Lan', cty: 'moc-nhien', dau: 2 } });
  nhan({ event: 'presence_state', payload: { me: { metas: [{ ten: 'Lan' }] }, b: { metas: [{ ten: 'Minh', cty: 'lam-viet', dau: 0 }] } } });
  assert.deepEqual(ds.at(-1).map(x => x.id).sort(), ['b', 'me']);
  nhan({ event: 'presence_diff', payload: { joins: {}, leaves: { b: { metas: [] } } } });
  assert.deepEqual(ds.at(-1).map(x => x.id), ['me']);
  nhan({ event: 'broadcast', payload: { type: 'broadcast', event: 'p', payload: { i: 'b', x: 1, z: 2, h: 0 } } });
  assert.deepEqual(tin.at(-1), ['p', { i: 'b', x: 1, z: 2, h: 0 }]);
  nhan({ topic: 'realtime:khac', event: 'broadcast', payload: { type: 'broadcast', event: 'p', payload: {} } });
  assert.equal(tin.length, 1, 'bỏ qua tin của kênh khác');
  p.phat('e', { i: 'me', k: 'vay' });
  assert.deepEqual(sent.at(-1).payload, { type: 'broadcast', event: 'e', payload: { i: 'me', k: 'vay' } });
  p.dong(); assert.equal(sock.readyState, 3);
  delete globalThis.WebSocket;

  // 3. chạy thật, backend tắt để không cần mạng
  let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.log('ra-khoi-3d: ok (bỏ qua phần trình duyệt: chưa cài playwright)'); return; }
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-gl=swiftshader'] }); const errs = [];
  try {
    for (const lang of ['vi', 'en']) {
      const pg = await b.newPage({ viewport: { width: 390, height: 844 } }); pg.on('pageerror', e => errs.push(e.message));
      await pg.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
      await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await pg.route(/backend-config\.js/, r => r.fulfill({ contentType: 'text/javascript', body: 'window.BIZON_BACKEND = { enabled: false };' }));
      await pg.goto(BASE + '/ra-khoi-3d.html', { waitUntil: 'load', timeout: 60000 }); await pg.waitForTimeout(1500);
      assert.equal(await pg.textContent('#rk-vao-h'), lang === 'en' ? '⛵ Set sail with your class' : '⛵ Ra khơi cùng lớp');
      assert.equal(await pg.locator('.rk-firm').count(), 4);
      await pg.waitForFunction(() => document.body.dataset.moHinh, null, { timeout: 30000 });
      assert.equal(await pg.evaluate(() => document.body.dataset.moHinh), '19/19', 'đủ 19 mô hình Kenney');
      await pg.fill('#rk-ten', '<b>Lan</b>'); await pg.click('.rk-firm:nth-child(3)'); await pg.fill('#rk-ma', 'kdqt k48'); await pg.click('.rk-go');
      await pg.waitForTimeout(800);
      assert.ok(await pg.isHidden('#rk-vao'), 'màn vào phải đóng');
      assert.match(await pg.textContent('#rk-room-t'), /^KDQTK48 · 1\/30$/);
      await pg.click('#rk-room');
      assert.match(await pg.textContent('#rk-list-ul'), lang === 'en' ? /bLan\/b \(you\)/ : /bLan\/b \(bạn\)/);
      await pg.close();
    }
  } finally { await b.close(); }
  assert.deepEqual(errs, []);
  console.log('ra-khoi-3d: ok');
})().catch(e => { console.error(e); process.exit(1); });
