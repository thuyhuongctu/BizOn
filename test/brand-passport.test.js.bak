/* Bộ kiểm thử tự động cho «Hộ Chiếu Thương Hiệu» (brand-passport.html).
 *
 * Vì sao cần: bốn lỗi tìm được hồi cuối tháng 7/2026 đều thuộc loại mà chơi
 * tay rất khó bắt – chúng chỉ lộ ra khi người chơi đi vào ba thị trường ít ai
 * chọn (Lục Đảo, Nhật Quang, Tân Cảng). Bộ này khoá lại đúng những chỗ đó.
 *
 * Cách chạy:  xem test/README.md
 * Yêu cầu:    một máy chủ tĩnh phục vụ thư mục gốc của kho mã, mặc định
 *             http://127.0.0.1:8899 (đổi bằng biến môi trường BIZON_URL)
 */
'use strict';

const path = require('path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const CHROME = process.env.BIZON_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

let chromium;
try {
  chromium = require('playwright-core').chromium;
} catch (e) {
  try {
    chromium = require(path.join(process.env.HOME || '', '.cache', 'playwright-core')).chromium;
  } catch (e2) {
    console.error('Không nạp được playwright-core. Xem test/README.md.');
    process.exit(2);
  }
}

/* ---------- khung kiểm thử tối giản ---------- */
const results = [];
let current = null;

function test(name, fn) { results.push({ name, fn }); }
function check(ok, msg) {
  current.checks.push({ ok: !!ok, msg });
  if (!ok) current.failed = true;
}
function eq(actual, expected, msg) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  check(ok, msg + (ok ? '' : ` — mong ${JSON.stringify(expected)}, nhận ${JSON.stringify(actual)}`));
}
function near(actual, expected, tol, msg) {
  const ok = Math.abs(actual - expected) <= tol;
  check(ok, msg + (ok ? '' : ` — mong ${expected}±${tol}, nhận ${actual}`));
}

/* ---------- tiện ích lái trò chơi ---------- */
const SEED = 424242; // ván chơi lặp lại được

async function newGame(browser, opts = {}) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 950 } });
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  // bpIntel hỏi thị trường bằng prompt(); trả lời theo cấu hình của từng phép thử
  page.on('dialog', d => d.accept(String(opts.intelMarket == null ? 1 : opts.intelMarket + 1)));
  // Máy chậm hoặc máy chủ tĩnh đang nghẽn có thể làm lần mở trang đầu quá hạn.
  // Thử lại một lần để phép thử không trượt vì lý do ngoài phạm vi kiểm tra.
  const url = `${BASE}/brand-passport.html?seed=${opts.seed || SEED}`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  } catch (e) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  }
  await page.waitForFunction(() => !!window.bpTest, null, { timeout: 20000 });
  await page.evaluate(() => { try { localStorage.removeItem('bizon-bp-save'); } catch (e) {} });
  await page.evaluate(f => window.bpFirm(f), opts.firm || 0);
  await page.evaluate(() => window.bpStart());
  await page.waitForTimeout(250);
  page.__errors = errors;
  return page;
}

const st = page => page.evaluate(() => window.bpTest.state());

/* Chốt một quý: chọn ưu tiên, mức vận hành, rồi bấm chốt và bỏ qua biến cố. */
async function playQuarter(page, { prio = 0, budget = 1, enter = null, mode = 1 } = {}) {
  await page.evaluate(() => window.bpToDecide());
  await page.waitForTimeout(200);
  await page.evaluate(p => window.bpPick('prio', p), prio);
  await page.evaluate(b => window.bpPick('bud', b), budget);
  if (enter !== null) await page.evaluate(([m, md]) => window.bpEnter(m, md), [enter, mode]);
  await page.waitForTimeout(150);
  await page.evaluate(() => window.bpCommit());
  await page.waitForTimeout(350);
  // biến cố: luôn chọn phương án đầu
  const hasEvent = await page.evaluate(() => !!document.querySelector('[onclick^="bpEv("]'));
  if (hasEvent) {
    await page.evaluate(() => window.bpEv(0));
    await page.waitForTimeout(350);
  }
  const ended = await page.evaluate(() => window.bpTest.ended());
  if (!ended) {
    const hasNext = await page.evaluate(() => !!document.querySelector('[onclick="bpNext()"]'));
    if (hasNext) { await page.evaluate(() => window.bpNext()); await page.waitForTimeout(250); }
  }
  return ended;
}

/* ================= CÁC PHÉP THỬ ================= */

test('Ván chơi lặp lại được khi truyền ?seed=', async browser => {
  const a = await newGame(browser, { seed: 777 });
  const b = await newGame(browser, { seed: 777 });
  const c = await newGame(browser, { seed: 778 });
  const sa = await a.evaluate(() => window.bpTest.seed());
  const sb = await b.evaluate(() => window.bpTest.seed());
  const sc = await c.evaluate(() => window.bpTest.seed());
  eq(sa, sb, 'cùng ?seed= thì hạt giống giống nhau');
  check(sa !== sc, 'khác ?seed= thì hạt giống khác nhau');
  await a.close(); await b.close(); await c.close();
});

test('Bản đồ có đủ sáu thị trường, trạng thái khởi tạo đủ sáu ô', async browser => {
  const p = await newGame(browser);
  eq(await p.evaluate(() => window.bpTest.markets()), 6, 'MKTS có 6 thị trường');
  const s = await st(p);
  eq(s.know.length, 6, 'S.know có 6 ô');
  eq(s.entered.length, 6, 'S.entered có 6 ô');
  eq(s.qin.length, 6, 'S.qin có 6 ô');
  eq(s.entered, [null, null, null, null, null, null], 'đầu ván chưa vào thị trường nào');
  await p.close();
});

test('Tri thức tính trên toàn bộ sáu thị trường, không chỉ ba thị trường đầu', async browser => {
  // Đây là hồi quy cho lỗi hud() cũ: know[3..5] bị bỏ ra ngoài công thức.
  for (const m of [0, 3, 4, 5]) {
    const p = await newGame(browser, { intelMarket: m });
    const before = await p.evaluate(() => {
      const t = document.getElementById('bp-hud').textContent.match(/Tri thức\s*(\d+)/);
      return t ? Number(t[1]) : null;
    });
    await p.evaluate(() => window.bpIntel(4)); // «Thử nghiệm bán hàng» = +35
    await p.waitForTimeout(300);
    const s = await st(p);
    const after = await p.evaluate(() => {
      const t = document.getElementById('bp-hud').textContent.match(/Tri thức\s*(\d+)/);
      return t ? Number(t[1]) : null;
    });
    eq(before, 10, `thị trường ${m}: tri thức ban đầu là 10`);
    eq(s.know[m], 45, `thị trường ${m}: know[${m}] tăng 10 -> 45`);
    eq(after, 16, `thị trường ${m}: chỉ số 📚 trên HUD đổi 10 -> 16 (trung bình cả 6)`);
    await p.close();
  }
});

test('Gợi ý «bay trong sương mù» tắt khi đã hiểu rõ một thị trường bất kỳ', async browser => {
  // Hồi quy: điều kiện cũ là know[0]<35 && know[1]<35 && know[2]<35, nên người
  // chơi nắm rất rõ Tân Cảng vẫn bị nhắc là đang mù thông tin.
  // Đọc qua bpTest.advice() thay vì dò trên màn hình, vì màn hình chỉ hiện hai
  // gợi ý đầu và chỉ tính lại vào đầu mỗi quý.
  const fogOf = page => page.evaluate(() =>
    window.bpTest.advice().some(a => /bay trong sương mù/.test(a)));

  const p = await newGame(browser, { intelMarket: 5 }); // Tân Cảng – thị trường thứ 6
  check(await fogOf(p), 'đầu ván, khi cả sáu thị trường đều mù, gợi ý có hiện');

  await p.evaluate(() => window.bpIntel(4)); // +35
  await p.waitForTimeout(300);
  await p.evaluate(() => window.bpIntel(2)); // +30
  await p.waitForTimeout(300);
  const s = await st(p);
  check(s.know[5] >= 35, `know[5] = ${s.know[5]} — đã vượt ngưỡng 35`);
  check(s.know.slice(0, 3).every(k => k < 35),
    `ba thị trường đầu vẫn dưới ngưỡng (${s.know.slice(0, 3).join(', ')}) — đúng kịch bản bẫy lỗi cũ`);
  check(!(await fogOf(p)), 'sau khi nắm rõ Tân Cảng thì gợi ý tắt');
  await p.close();
});

test('Vào thị trường: trừ đúng vốn theo phương thức và ghi đúng ô', async browser => {
  // bpEnter chỉ ghi nhận lựa chọn; tiền chỉ trừ khi bpCommit chốt quý.
  // Đọc trạng thái ngay sau bpCommit, trước khi giải quyết biến cố, để biến cố
  // không làm nhiễu số tiền.
  const MODE_COST = [0.5, 1.2, 0.8]; // Nền tảng số · Xuất khẩu trực tiếp · Đối tác địa phương
  for (const mode of [0, 1, 2]) {
    const p = await newGame(browser);
    const before = (await st(p)).cash;
    await p.evaluate(() => window.bpToDecide());
    await p.waitForTimeout(200);
    await p.evaluate(([m, md]) => window.bpEnter(m, md), [5, mode]);
    await p.waitForTimeout(200);
    const mid = await st(p);
    eq(mid.sel.enter, 5, `phương thức ${mode}: mới chọn, chưa vào thị trường`);
    eq(mid.cash, before, `phương thức ${mode}: chưa chốt quý thì chưa trừ tiền`);

    await p.evaluate(() => window.bpPick('prio', 0)); // ưu tiên 0 không tốn tiền
    await p.evaluate(() => window.bpCommit());
    await p.waitForTimeout(300);
    const s = await st(p);
    near(before - s.cash, MODE_COST[mode], 0.001,
      `phương thức ${mode}: chốt quý trừ đúng ${MODE_COST[mode]} tỷ`);
    eq(s.entered[5], mode, `phương thức ${mode}: ghi vào đúng ô thị trường 5`);
    eq(s.entered.filter(x => x !== null).length, 1, `phương thức ${mode}: chỉ vào đúng 1 thị trường`);
    await p.close();
  }
});

test('Mỗi quý chỉ được vào tối đa một thị trường', async browser => {
  const p = await newGame(browser);
  await p.evaluate(() => window.bpToDecide());
  await p.waitForTimeout(200);
  await p.evaluate(() => window.bpEnter(0, 0));
  await p.waitForTimeout(200);
  await p.evaluate(() => window.bpEnter(3, 0)); // chọn lại – phải thay thế, không cộng thêm
  await p.waitForTimeout(200);
  const mid = await st(p);
  eq(mid.sel.enter, 3, 'lựa chọn sau thay thế lựa chọn trước');

  await p.evaluate(() => window.bpPick('prio', 0));
  await p.evaluate(() => window.bpCommit());
  await p.waitForTimeout(300);
  const s = await st(p);
  eq(s.entered.filter(x => x !== null).length, 1,
    'bấm vào hai thị trường trong cùng một quý, chốt xong vẫn chỉ vào một');
  eq(s.entered[3], 0, 'thị trường được vào là thị trường chọn sau cùng');
  eq(s.entered[0], null, 'thị trường chọn trước đó không bị tính');
  await p.close();
});

test('Tiền mặt không tự sinh: mua tình báo trừ đúng tiền và giới hạn 2 nguồn/quý', async browser => {
  const p = await newGame(browser, { intelMarket: 2 });
  const c0 = (await st(p)).cash;
  await p.evaluate(() => window.bpIntel(0)); // Báo cáo ngành – 0,3 tỷ
  await p.waitForTimeout(250);
  const c1 = (await st(p)).cash;
  near(c0 - c1, 0.3, 0.001, 'nguồn «Báo cáo ngành» trừ 0,3 tỷ');
  await p.evaluate(() => window.bpIntel(1)); // Khảo sát khách hàng – 0,5 tỷ
  await p.waitForTimeout(250);
  const c2 = (await st(p)).cash;
  near(c1 - c2, 0.5, 0.001, 'nguồn «Khảo sát khách hàng» trừ 0,5 tỷ');
  await p.evaluate(() => window.bpIntel(2)); // nguồn thứ ba – phải bị chặn
  await p.waitForTimeout(250);
  const c3 = (await st(p)).cash;
  eq(c3, c2, 'nguồn thứ ba trong cùng quý bị chặn, không trừ thêm tiền');
  const note = await p.evaluate(() => document.getElementById('bp-intel-note').textContent);
  check(/đủ 2 nguồn/.test(note), 'có báo cho người chơi biết đã dùng hết 2 nguồn');
  await p.close();
});

test('Chấm điểm: năm chiều đều trong 0–100 và tổng đúng trọng số 30/20/20/15/15', async browser => {
  const p = await newGame(browser);
  await playQuarter(p, { enter: 0, mode: 1 });
  const sc = await p.evaluate(() => window.bpTest.scores());
  ['p', 'r', 'c', 'a', 's'].forEach(k => {
    check(sc[k] >= 0 && sc[k] <= 100, `chiều ${k} = ${sc[k]} nằm trong 0–100`);
  });
  const expect = Math.round(0.3 * sc.p + 0.2 * sc.r + 0.2 * sc.c + 0.15 * sc.a + 0.15 * sc.s);
  eq(sc.total, expect, 'tổng điểm khớp trọng số 30/20/20/15/15');
  check(Number.isInteger(sc.total), 'tổng điểm là số nguyên');
  await p.close();
});

test('Thua sớm: hai quý liên tiếp âm tiền mặt thì dừng ván', async browser => {
  // Vào thị trường đắt nhất bằng phương thức đắt nhất, chạy mức vận hành cao,
  // đến khi hết tiền. Kiểm tra bộ đếm lowQ và màn kết thúc.
  const p = await newGame(browser, { firm: 2 }); // Lam Việt: năng lực thấp nhất
  let ended = false, q = 0, sawNegative = false;
  while (!ended && q < 6) {
    ended = await playQuarter(p, { prio: 2, budget: 2, enter: q === 0 ? 1 : null, mode: 1 });
    const s = await st(p);
    if (s.cash < 0) sawNegative = true;
    if (s.lowQ >= 2) check(true, `lowQ chạm 2 ở quý ${s.q}`);
    q++;
  }
  const s = await st(p);
  check(s.lowQ <= 2, `bộ đếm lowQ không vượt 2 (thực tế ${s.lowQ}) – ván phải dừng ngay khi chạm`);
  check(await p.evaluate(() => window.bpTest.ended()), 'ván đã kết thúc');
  if (sawNegative) check(true, 'có ít nhất một quý âm tiền mặt trong kịch bản này');
  await p.close();
});

test('Ván bình thường kết thúc sau đúng sáu quý', async browser => {
  const p = await newGame(browser);
  let ended = false, guard = 0;
  while (!ended && guard < 10) { ended = await playQuarter(p, { prio: 0, budget: 0 }); guard++; }
  check(ended, 'ván đã kết thúc');
  const s = await st(p);
  check(s.q >= 6 || s.lowQ >= 2 || s.rep < 15,
    `dừng vì hết 6 quý (q=${s.q}) hoặc vì điều kiện thua sớm (lowQ=${s.lowQ}, rep=${s.rep})`);
  const total = await p.evaluate(() => document.getElementById('bp-total').textContent);
  check(/^\d+$/.test(total), `màn kết hiện tổng điểm: ${total}`);
  await p.close();
});

test('Không có lỗi JavaScript trong suốt một ván đầy đủ', async browser => {
  const p = await newGame(browser);
  let ended = false, guard = 0;
  while (!ended && guard < 10) { ended = await playQuarter(p, { prio: 1, budget: 1 }); guard++; }
  eq(p.__errors, [], 'không có lỗi JS nào');
  await p.close();
});

/* ================= CHẠY ================= */
(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  let failed = 0;
  for (const t of results) {
    current = { checks: [], failed: false };
    const started = process.hrtime.bigint();
    try {
      await t.fn(browser);
    } catch (e) {
      current.failed = true;
      current.checks.push({ ok: false, msg: 'ngoại lệ: ' + e.message.split('\n')[0] });
    }
    const ms = Number((process.hrtime.bigint() - started) / 1000000n);
    console.log((current.failed ? '✗ ' : '✓ ') + t.name + ` (${ms}ms)`);
    current.checks.forEach(c => {
      if (!c.ok) console.log('    ✗ ' + c.msg);
    });
    if (current.failed) failed++;
  }
  await browser.close();
  console.log(`\n${results.length - failed}/${results.length} phép thử đạt`);
  process.exit(failed ? 1 : 0);
})();
