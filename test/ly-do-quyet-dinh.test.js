/* Đặc tả 007, câu chuyện 3 (21/11/2026): lý do ra quyết định và dòng thời gian từng đội.
 *
 * - Sau khi đội chốt vòng (luồng chốt KHÔNG đổi), hiện thẻ nhỏ «Đội chốt dựa vào gì?»: chọn tối đa 2 lý do trong 6 lý do
 *   trung tính, ghi chú tuỳ ý, «Gửi» hoặc «Bỏ qua». Gửi được trong ≤ 2 lần chạm. Chỉ hiện khi phiên đang nộp về lớp
 *   (có mã lớp, đã đăng nhập); chơi thử không hiện, không gửi gì.
 * - Lý do đi vào nhật ký đội (bizon_log_member) dưới dạng dòng 'commit' có payload.reasonsOnly, không cần migration.
 *   Các hàm chấm (bizon-grading members/memberActivity, member-log teamStats) bỏ qua dòng này nên điểm B5 không đổi.
 * - bizon-grading.timeline() dựng dòng thời gian theo đội × vòng: đề xuất theo vai → Nếu–Thì → Lumina → lý do → quyết định → kết quả.
 * - Bảng điều khiển giảng viên hiện dòng thời gian trong thẻ hoạt động mỗi đội.
 * - js/engine.js, js/app.js, js/backend.js không đổi (hồ sơ quyền tác giả); cùng hạt giống, cùng quyết định → cùng kết quả. */
'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '..', f))).digest('hex');

// ---- Phần 1: tĩnh ----
assert.ok(fs.existsSync(path.join(__dirname, '..', 'js/ly-do-quyet-dinh.js')), 'có js/ly-do-quyet-dinh.js');
const game = read('game.html');
assert.ok(game.indexOf('<script src="js/member-log.js"></script>') < game.indexOf('<script src="js/ly-do-quyet-dinh.js"></script>'), 'game.html nạp mô-đun sau member-log.js');
assert.ok(read('Trang Giang Vien.dc.html').includes('<script src="js/ly-do-quyet-dinh.js"></script>'), 'bảng điều khiển giảng viên nạp danh sách lý do');
assert.ok(read('sw.js').includes("'./js/ly-do-quyet-dinh.js'") && +(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 945, 'sw.js lưu sẵn mô-đun, ≥ v945');
// Ba tệp lõi giữ nguyên (cùng mã băm với test/bat-nghiep-sprite-khi-can.test.js)
assert.equal(sha('js/engine.js').slice(0, 8), '0927c799', 'js/engine.js không đổi');
assert.equal(sha('js/app.js').slice(0, 8), '1d340a84', 'js/app.js không đổi');
assert.equal(sha('js/backend.js').slice(0, 8), '454c4902', 'js/backend.js không đổi');

// ---- Phần 2: danh sách lý do và hàm chấm (vm) ----
const ctx = { window: {}, console, Math, JSON, Date };
ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(read('js/ly-do-quyet-dinh.js'), ctx);
vm.runInContext(read('js/bizon-grading.js'), ctx);
const R = ctx.BizonLyDo && ctx.BizonLyDo.REASONS;
assert.ok(Array.isArray(R) && R.length >= 5 && R.length <= 6, '5–6 lý do');
assert.ok(R.every(r => r.id && r.vi && r.en), 'mỗi lý do có mã, VI, EN');
const P = ctx.BizOnInstructorPage;
const at = (m) => `2026-11-21T08:${String(m).padStart(2, '0')}:00Z`;
const LOG = [
  { team_name: 'Rồng Xanh', round_number: 1, role: 'CMO', member_name: 'an', kind: 'proposal', payload: { price: 120, marketing: 40 }, created_at: at(1) },
  { team_name: 'Rồng Xanh', round_number: 1, role: 'CFO', member_name: 'binh', kind: 'whatif', payload: { role: 'CFO' }, created_at: at(2) },
  { team_name: 'Rồng Xanh', round_number: 1, role: 'CEO', member_name: 'chi', kind: 'commit', payload: { price: 120, marketing: 40, production: 2000, netProfit: 12.5, overdraft: 0 }, created_at: at(3) },
  { team_name: 'Rồng Xanh', round_number: 1, role: 'CEO', member_name: 'chi', kind: 'commit', payload: { reasonsOnly: true, reasons: ['doi-thu', 'dong-tien'], note: 'Đối thủ hạ giá' }, created_at: at(4) },
];
const actWith = P.memberActivity(LOG), actWithout = P.memberActivity(LOG.slice(0, 3));
assert.equal(JSON.stringify(actWith), JSON.stringify(actWithout), 'memberActivity bỏ qua dòng lý do (số lần chốt không đổi)');
const T = [{ name: 'Rồng Xanh', rs: [{ round_number: 1, result_json: { netProfit: 12.5, share: 31.2 } }] }];
assert.equal(JSON.stringify(P.members(T, LOG)), JSON.stringify(P.members(T, LOG.slice(0, 3))), 'members (B5) bỏ qua dòng lý do');
const TL = P.timeline(LOG, T);
const r1 = TL[0] && TL[0].rounds.find(r => r.round === 1);
assert.ok(r1, 'timeline có vòng 1');
assert.deepEqual(Array.from(r1.reasons), ['doi-thu', 'dong-tien'], 'timeline: lý do');
assert.equal(r1.note, 'Đối thủ hạ giá', 'timeline: ghi chú');
assert.deepEqual(Array.from(r1.proposals), ['CMO'], 'timeline: đề xuất theo vai');
assert.equal(r1.whatif, 1, 'timeline: số lượt Nếu–Thì');
assert.ok(r1.committed && r1.decision.price === 120, 'timeline: quyết định đã chốt');
assert.equal(r1.profit, 12.5, 'timeline: kết quả vòng');

// ---- Phần 3: trình duyệt ----
(async () => {
  const b = await chromium.launch();
  try {
    for (const [lang, w] of [['vi', 390], ['en', 360], ['vi', 1280]]) {
      const ctxB = await b.newContext({ viewport: { width: w, height: 844 }, serviceWorkers: 'block' });
      const p = await ctxB.newPage(), errs = [], sent = [];
      p.on('pageerror', e => errs.push(e.message));
      await p.route(/supabase\.co/, r => { const req = r.request(); if (/bizon_log_member/.test(req.url())) sent.push(JSON.parse(req.postData() || '{}')); r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }); });
      await p.route(/\.(mp3|m4a|mp4|woff2?)(\?|$)/, r => r.abort());
      await p.addInitScript(l => { localStorage.setItem('bizon-lang', l); }, lang);
      await p.goto(BASE + '/game.html', { waitUntil: 'load', timeout: 60000 });
      await p.waitForFunction(() => typeof window.doLoginDemo === 'function' && window.BizonLyDo, null, { timeout: 60000 });
      await p.evaluate(() => { window.doLoginDemo(); });
      await p.waitForTimeout(600);
      await p.evaluate(() => document.querySelectorAll('.fixed.inset-0').forEach(d => d.remove()));
      const tag = lang + ' ' + w;

      // 3a. Chơi thử (không mã lớp): chốt xong không hiện thẻ, không gửi gì; kết quả như khi không có mô-đun
      const r = await p.evaluate(() => { S.balance = 1e6; window.commitDecisions(); return { committed: S.committed, card: !!document.getElementById('lydo-card') }; });
      assert.ok(r.committed, tag + ': chốt vòng vẫn chạy');
      assert.equal(r.card, false, tag + ': chơi thử không hiện thẻ lý do');
      assert.equal(sent.length, 0, tag + ': chơi thử không gửi gì');

      // 3b. Phiên nộp về lớp (giả lập): chốt vòng sau → hiện thẻ; chọn 1 lý do + Gửi = 2 chạm
      await p.evaluate(() => {
        window.BIZON_BACKEND = Object.assign({}, window.BIZON_BACKEND, { enabled: true, url: 'https://abc.supabase.co', anonKey: 'x' });
        window.StudentLogin = Object.assign({}, window.StudentLogin, { signedIn: () => true, token: async () => 't' });
        S.profile = Object.assign({}, S.profile, { classId: 'LOP-THU-1', teamName: 'Rồng Xanh', role: 'CEO', email: 'chi@student.ctu.edu.vn' });
        S.committed = false; S.round = 2; S.balance = 1e6;
        window.commitDecisions();
      });
      await p.waitForSelector('#lydo-card', { timeout: 5000 });
      const card = await p.evaluate(() => { const c = document.getElementById('lydo-card'), bs = [...c.querySelectorAll('button')];
        return { n: c.querySelectorAll('[data-lydo]').length, txt: c.innerText, minH: Math.min(...bs.map(x => x.getBoundingClientRect().height)), sw: document.documentElement.scrollWidth };
      });
      assert.ok(card.n >= 5 && card.n <= 6, tag + ': 5–6 nút lý do');
      assert.ok(lang === 'en' ? /What did your team base this decision on/.test(card.txt) && /Skip/.test(card.txt) : /Đội chốt dựa vào gì/.test(card.txt) && /Bỏ qua/.test(card.txt), tag + ': chữ đúng ngôn ngữ');
      assert.ok(card.minH >= 44, tag + ': vùng chạm ≥ 44 px');
      assert.ok(card.sw <= w, tag + ': không tràn ngang');
      // chọn tối đa 2
      await p.click('[data-lydo="doi-thu"]'); await p.click('[data-lydo="dong-tien"]'); await p.click('[data-lydo="ton-kho"]');
      assert.equal(await p.$$eval('[data-lydo][aria-pressed="true"]', a => a.length), 2, tag + ': chọn tối đa 2 lý do');
      await p.click('#lydo-gui'); await p.waitForTimeout(400);
      assert.equal(await p.$('#lydo-card'), null, tag + ': gửi xong thẻ đóng');
      const reasonRow = sent.find(x => x.p_payload && x.p_payload.reasonsOnly);
      assert.ok(reasonRow && reasonRow.p_kind === 'commit' && reasonRow.p_round === 2 && reasonRow.p_payload.reasons.join() === 'doi-thu,dong-tien', tag + ': gửi lý do vào nhật ký đội: ' + JSON.stringify(sent));
      // 3c. Bỏ qua: 1 chạm, không gửi thêm dòng lý do
      const before = sent.length;
      await p.evaluate(() => { S.committed = false; S.round = 3; window.commitDecisions(); });
      await p.waitForSelector('#lydo-card', { timeout: 5000 });
      await p.click('#lydo-bo-qua'); await p.waitForTimeout(300);
      assert.equal(await p.$('#lydo-card'), null, tag + ': Bỏ qua đóng thẻ');
      assert.ok(!sent.slice(before).some(x => x.p_payload && x.p_payload.reasonsOnly), tag + ': Bỏ qua không gửi lý do');
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await ctxB.close();
    }
    // 3d. Bảng điều khiển giảng viên: thẻ hoạt động của đội có «Dòng thời gian ra quyết định» (nhật ký mẫu chèn vào lớp demo)
    for (const lang of ['vi', 'en']) {
      const ctxB = await b.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
      const p = await ctxB.newPage(), errs = [];
      p.on('pageerror', e => errs.push(e.message));
      await p.addInitScript(l => {
        try { localStorage.setItem('bizon-lang', l); localStorage.removeItem('bizon-lang-auto'); } catch (e) {}
        const t = m => new Date(Date.now() - (50 - m) * 60000).toISOString();
        const LOG = [
          { team_name: 'Đội Rồng Vàng', round_number: 1, role: 'CMO', member_name: 'an', kind: 'proposal', payload: { price: 145, marketing: 59 }, created_at: t(1) },
          { team_name: 'Đội Rồng Vàng', round_number: 1, role: 'CFO', member_name: 'binh', kind: 'whatif', payload: { role: 'CFO' }, created_at: t(2) },
          { team_name: 'Đội Rồng Vàng', round_number: 1, role: 'CEO', member_name: 'chi', kind: 'commit', payload: { price: 145, marketing: 59, production: 2000, netProfit: 78 }, created_at: t(3) },
          { team_name: 'Đội Rồng Vàng', round_number: 1, role: 'CEO', member_name: 'chi', kind: 'commit', payload: { reasonsOnly: true, reasons: ['doi-thu', 'dong-tien'], note: 'Đối thủ hạ giá' }, created_at: t(4) },
        ];
        let api; Object.defineProperty(window, 'BizOnInstructor', { configurable: true, get: () => api, set: v => { api = v; if (v) v.memberLog = async () => LOG; } });
      }, lang);
      await p.goto(BASE + '/Trang%20Giang%20Vien.dc.html', { timeout: 60000 }); await p.waitForTimeout(2500);
      await p.getByText(lang === 'en' ? 'DEMO-2026 sample class' : 'lớp mẫu DEMO-2026').first().click(); await p.waitForTimeout(2000);
      await p.getByText(lang === 'en' ? 'Open dashboard →' : 'Mở bảng điều khiển →').first().click(); await p.waitForTimeout(2000);
      await p.getByText(lang === 'en' ? 'Gradebook' : 'Sổ điểm', { exact: false }).first().click();   // thẻ hoạt động từng đội nằm ở tab này await p.waitForTimeout(1200);
      const sum = p.getByText(lang === 'en' ? 'Decision timeline' : 'Dòng thời gian ra quyết định').first();
      assert.ok(await sum.count() > 0, lang + ': thẻ đội có mục dòng thời gian');
      await sum.click(); await p.waitForTimeout(400);
      const txt = await p.evaluate(() => [...document.querySelectorAll('details.gv-tl')].map(d => d.innerText).join('\n'));
      if (lang === 'en') assert.ok(/Round 1/.test(txt) && /Proposals: CMO/.test(txt) && /Reasons: Competitors’ prices and moves, Cash flow and loans/.test(txt) && /Decision: price 145k/.test(txt), 'EN: dòng thời gian đủ ý: ' + txt);
      else assert.ok(/Vòng 1/.test(txt) && /Đề xuất: CMO/.test(txt) && /1 lượt Nếu–Thì/.test(txt) && /Lý do: Giá và động thái đối thủ, Dòng tiền, vốn vay – «Đối thủ hạ giá»/.test(txt) && /Chốt: giá 145k/.test(txt) && /Lợi nhuận/.test(txt), 'VI: dòng thời gian đủ ý: ' + txt);
      assert.ok(!/\{\{/.test(await p.evaluate(() => document.body.innerText)), lang + ': không lộ {{ }}');
      assert.deepEqual(errs, [], lang + ': bảng giảng viên không lỗi JS');
      await ctxB.close();
    }
    // 3e. Bản 3D: game.html nằm trong khung #gf → thẻ hiện ở trang ngoài; bản hồ sơ ?giao-dien=goc không hiện; chốt vẫn thành công
    for (const q of ['', '?giao-dien=goc']) {
      const ctxB = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
      const p = await ctxB.newPage(), errs = [];
      p.on('pageerror', e => errs.push(e.message));
      await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }));
      await p.route(/\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await p.goto(BASE + '/BizOn%20Game%203D.html' + q, { waitUntil: 'load', timeout: 90000 });
      await p.waitForFunction(() => { const w = document.getElementById('gf').contentWindow; return w && typeof w.doLoginDemo === 'function' && w.BizonLyDo; }, null, { timeout: 90000 });
      const fw = p.frames().find(x => /game\.html/.test(x.url()));
      await fw.evaluate(() => { window.doLoginDemo(); }); await p.waitForTimeout(600);
      await fw.evaluate(() => {
        window.BIZON_BACKEND = Object.assign({}, window.BIZON_BACKEND, { enabled: true, url: 'https://abc.supabase.co', anonKey: 'x' });
        window.StudentLogin = Object.assign({}, window.StudentLogin, { signedIn: () => true, token: async () => 't' });
        S.profile = Object.assign({}, S.profile, { classId: 'LOP-THU-1', teamName: 'Rồng Xanh', role: 'CEO' }); S.committed = false; S.balance = 1e6;
        window.commitDecisions();
      });
      await p.waitForTimeout(600);
      const tag = '3D' + (q || ' (giao diện mới)');
      assert.ok(await fw.evaluate(() => S.committed), tag + ': chốt vòng vẫn thành công');
      assert.equal(await p.evaluate(() => !!document.getElementById('lydo-card')), !q, tag + (q ? ': bản hồ sơ không hiện thẻ' : ': thẻ hiện ở trang 3D bên ngoài'));
      assert.equal(await fw.evaluate(() => !!document.getElementById('lydo-card')), false, tag + ': không hiện thẻ trong khung ẩn');
      assert.deepEqual(errs, [], tag + ': không lỗi JS');
      await ctxB.close();
    }
    console.log('ly-do-quyet-dinh: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
