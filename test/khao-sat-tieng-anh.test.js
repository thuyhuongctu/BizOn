/* Phiếu khảo sát bản tiếng Anh cho lớp sinh viên quốc tế (11/2026): link có «lang=en» thì cả công cụ đo (phần A, thang B, C), phần đồng thuận,
 * nhãn và thông báo đều bằng tiếng Anh; link không có tham số ấy vẫn ra câu hỏi tiếng Việt (kể cả khi trình duyệt để tiếng Anh) để các lớp đang
 * thu số liệu không bị đổi công cụ. Bản tiếng Anh giữ nguyên thứ tự câu và lựa chọn nên đáp án, điểm và dòng nộp về máy chủ không đổi.
 * Kèm: thông báo đăng ký/vào đội của Bật Nghiệp (js/student-auth.js) có tiếng Anh. Có phần chạy thật bằng Playwright. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const VI = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

// ----- Tệp bản dịch: đủ câu, đủ lựa chọn, không sót chữ Việt -----
const w = {}; vm.runInNewContext(R('js/khao-sat-en.js'), { window: w }); const E = w.BIZON_KS_EN;
const w2 = {}; vm.runInNewContext(R('js/khao-sat-bo2.js'), { window: w2 }); const B2 = w2.BIZON_KS_BO2;
check(E && E.qa.length === 15 && E.qaIb.length === 15, 'khao-sat-en.js: 15 câu cho mỗi bộ');
check([...E.qa, ...E.qaIb, ...Object.values(E.thay)].every(it => it.q.length > 15 && it.o.length === 4 && it.o.every(o => o.length > 2)), 'mỗi câu có đề và đúng 4 lựa chọn');
check(Object.keys(E.thay).sort().join(',') === Object.keys(B2.thay).sort().join(','), 'bộ 2 tiếng Anh thay đúng các câu của js/khao-sat-bo2.js');
check(E.likertB.length === 8 && E.likertBIb.length === 8 && E.likertC.length === 5, 'thang B 8 câu mỗi bộ, thang C 5 câu');
const moiChu = [...E.qa, ...E.qaIb, ...Object.values(E.thay)].flatMap(it => [it.q, ...it.o]).concat(E.likertB, E.likertBIb, E.likertC);
check(!moiChu.some(s => VI.test(s) || /[₫«»]/.test(s)), 'bản tiếng Anh không còn chữ có dấu tiếng Việt, ký hiệu ₫ hay ngoặc «»');
check(E.ghep2().length === 15 && E.ghep2()[1] === E.thay[2] && E.ghep2()[0] === E.qa[0], 'ghep2() ghép 10 câu neo với 5 câu vận dụng');
// Số liệu của 5 câu vận dụng phải khớp bản tiếng Việt (cùng đáp án): lấy mọi con số trong đề và lựa chọn, bỏ dấu ngăn nghìn
const so = s => (s.match(/\d[\d.,]*/g) || []).map(x => x.replace(/[.,]/g, '')).join(' ');
check(Object.keys(B2.thay).every(n => so(B2.thay[n].q) === so(E.thay[n].q) && B2.thay[n].o.every((o, i) => so(o) === so(E.thay[n].o[i]))), '5 câu vận dụng: con số trong đề và từng lựa chọn khớp bản tiếng Việt');

// ----- Trang khảo sát và trang giảng viên -----
const on = R('khao-sat-online.html');
check(on.includes('src="js/khao-sat-en.js"') && /INSTR_EN = \/\[\?&\]lang=en\(\?:&\|\$\)\/\.test\(location\.search\)/.test(on), 'phiếu online nạp bản dịch, chỉ đổi công cụ đo khi URL có lang=en');
check(on.includes('key: KEY, out: OUTCOMES, likb: EN ? EN.likertB : LIKERT_B') && on.includes('key: BO2.key') && on.includes('key: KEY_IB'), 'bản tiếng Anh dùng chung đáp án với bản tiếng Việt');
check(on.includes('<option value="Thư ký" data-en="Secretary (SEC)">Thư ký</option>'), 'vai trò Thư ký lưu cùng một giá trị ở hai ngôn ngữ');
check(R('js/site-ui.js').includes("{ page: 'khao-sat-online', sel: 'header .max-w-3xl h1 + p'"), 'site-ui.js: câu giới thiệu tiếng Anh đặt đúng đoạn dưới tiêu đề (trước đây đè lên dòng nhãn nhỏ)');
check(R('app/instructor-studio.html').includes('id="bi-survey-lang"') && R('js/app-shell/instructor-studio.js').includes("url.searchParams.set('lang', 'en')"), 'Instructor Studio tạo được link phiếu tiếng Anh');
const sa = R('js/student-auth.js');
check(sa.includes("const tr = (vi, en) => (typeof T === 'function' ? T(vi, en) : vi)") && !/setStatus\(['`]/.test(sa) && (sa.match(/setStatus\(tr\(/g) || []).length >= 15, 'student-auth.js: mọi thông báo đều qua tr(vi, en)');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(R('sw.js')) || [])[1] >= 842, 'sw.js ≥ bizon-v842');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  // Chữ đang hiển thị trong <main> còn dấu tiếng Việt (bỏ tên riêng của game)
  const conViet = p => p.evaluate(src => {
    const re = new RegExp(src, 'i'), out = []; const tw = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) { const t = tw.currentNode.textContent.replace(/Bật Nghiệp|Hộ Chiếu Thương Hiệu/g, '').trim(); if (t && re.test(t) && tw.currentNode.parentElement.getClientRects().length) out.push(t.slice(0, 60)); }
    document.querySelectorAll('main [placeholder]').forEach(el => { if (/^VD\b/.test(el.placeholder) || re.test(el.placeholder)) out.push('placeholder ' + el.placeholder); });
    return out;
  }, VI.source);
  try {
    // --- Sinh viên quốc tế: link có lang=en, trình duyệt tiếng Indonesia ---
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'id-ID' }); const p = await ctx.newPage(); const loi = []; p.on('pageerror', e => loi.push(e.message));
    const gui = []; await p.route(/\/rest\/v1\/survey_responses/, r => { gui.push(JSON.parse(r.request().postData())); r.fulfill({ status: 201, body: '' }); });
    for (const bo of ['batnghiep', 'batnghiep2', 'quocte']) {
      await p.goto(BASE + '/khao-sat-online.html?phieu=sau&lop=KT330H-UMK&lang=en&bo=' + bo, { timeout: 60000 }); await p.waitForTimeout(1500);
      const con = await conViet(p);
      check(con.length === 0, 'lang=en, bộ ' + bo + ': phiếu SAU không còn chữ Việt' + (con.length ? ' → ' + con.join(' | ') : ''));
      check((await p.evaluate(() => document.querySelectorAll('#ks-a input[type=radio]').length)) === 60 && (await p.evaluate(() => document.querySelectorAll('#ks-b .likert-row, #ks-c .likert-row').length)) === 13, 'lang=en, bộ ' + bo + ': 15 câu × 4 lựa chọn, 8 + 5 dòng thang đo');
      check(await p.evaluate(() => document.documentElement.scrollWidth <= 390), 'lang=en, bộ ' + bo + ': không tràn ngang ở 390 px');
    }
    await p.goto(BASE + '/khao-sat-online.html?phieu=sau&lop=KT330H-UMK&lang=en', { timeout: 60000 }); await p.waitForTimeout(1500);
    const a = await p.evaluate(() => ({ a: document.getElementById('ks-a').innerText, note: document.getElementById('ks-a-note').textContent, intro: document.querySelector('header h1 + p').textContent, eyebrow: document.querySelector('header p').textContent, lop: document.getElementById('ks-class').value, khoa: document.getElementById('ks-class').readOnly, ph: document.getElementById('ks-code').placeholder }));
    check(a.a.includes('1. The "break-even point" of a business') && a.a.includes('a. Revenue equals total costs') && a.a.includes('15. Why should an important business decision'), 'lang=en: câu hỏi phần A bằng tiếng Anh');
    check(a.note === 'Pick one answer per question (15 questions).' && a.intro.startsWith('An anonymous survey') && a.eyebrow === 'Pilot class · Anonymous', 'lang=en: ghi chú phần A, câu giới thiệu và dòng nhãn đúng chỗ');
    check(a.lop === 'KT330H-UMK' && a.khoa && a.ph === 'e.g. HT25', 'lang=en: mã lớp vẫn điền sẵn và khóa; gợi ý mã bằng tiếng Anh');
    // Bấm nộp khi còn trống → thông báo tiếng Anh
    await p.click('button[onclick="ksSubmit()"]');
    const thieu = await p.textContent('#ks-status');
    check(/^⚠️ \d+ items are still unanswered/.test(thieu) && !VI.test(thieu), 'lang=en: báo thiếu mục bằng tiếng Anh («' + thieu.slice(0, 44) + '…»)');
    // Điền đủ: chọn đúng đáp án chuẩn của bộ 1 → 15/15, vai trò Secretary lưu thành «Thư ký»
    await p.evaluate(() => {
      const KEY = ['a','b','b','b','b','b','b','c','b','b','a','a','b','a','b'];
      document.getElementById('ks-consent-chk').checked = true; document.getElementById('ks-code').value = 'um26';
      KEY.forEach((k, i) => { document.querySelector(`input[name="a${i + 1}"][value="${k}"]`).checked = true; });
      for (let i = 1; i <= 8; i++) document.querySelector(`input[name="b${i}"][value="4"]`).checked = true;
      for (let i = 1; i <= 5; i++) document.querySelector(`input[name="c${i}"][value="5"]`).checked = true;
      const r = document.getElementById('ks-role'); r.selectedIndex = 5; document.getElementById('ks-rounds').value = '6';
    });
    const vaiTro = await p.evaluate(() => { const r = document.getElementById('ks-role'); return [r.options[r.selectedIndex].textContent, r.value, r.options[0].textContent]; });
    check(vaiTro[0] === 'Secretary (SEC)' && vaiTro[1] === 'Thư ký' && vaiTro[2] === '– select –', 'lang=en: ô vai trò hiện tiếng Anh, giá trị lưu không đổi');
    await p.click('button[onclick="ksSubmit()"]'); await p.waitForTimeout(800);
    const xong = await p.evaluate(() => document.getElementById('ks-done').innerText);
    check(xong.includes('Your response has been recorded!') && xong.includes('Thank you! Your POST survey – code UM26, class KT330H-UMK') && xong.includes('Back to the BizOn home page') && !VI.test(xong), 'lang=en: màn hình nộp xong bằng tiếng Anh');
    const row = gui[0] || {};
    check(gui.length === 1 && row.instrument === 'batnghiep' && row.phase === 'post' && row.class_code === 'KT330H-UMK' && row.student_code === 'UM26' && row.score_a === 15 && row.role === 'Thư ký' && row.rounds_played === 6 && row.likert_b.length === 8 && row.likert_c.length === 5 && Object.values(row.score_by_outcome).every(v => v === 3), 'lang=en: dòng nộp về máy chủ giống bản tiếng Việt (15/15, 5 cụm × 3, vai trò «Thư ký»)');
    check(Object.keys(row).sort().join(',') === 'answers_a,class_code,client_ts,instrument,likert_b,likert_c,nps,open_improve,open_like,phase,role,rounds_played,score_a,score_by_outcome,student_code', 'lang=en: không thêm cột mới vào dòng nộp');
    check(!loi.length, 'lang=en: không lỗi JS: ' + loi.join(' | '));
    await ctx.close();

    // --- Lớp trong nước: link không có lang=en. Trình duyệt tiếng Anh vẫn làm câu hỏi tiếng Việt; trình duyệt tiếng Việt thấy toàn tiếng Việt ---
    for (const [locale, ten] of [['en-US', 'trình duyệt tiếng Anh'], ['vi-VN', 'trình duyệt tiếng Việt']]) {
      const c2 = await b.newContext({ viewport: { width: 390, height: 844 }, locale }); const q = await c2.newPage(); const loi2 = []; q.on('pageerror', e => loi2.push(e.message));
      await q.goto(BASE + '/khao-sat-online.html?phieu=truoc&lop=THU-2026', { timeout: 60000 }); await q.waitForTimeout(1500);
      const t = await q.evaluate(() => ({ a: document.getElementById('ks-a').innerText, b: document.getElementById('ks-b').innerText, note: document.getElementById('ks-a-note').textContent, h: document.querySelector('#ks-consent-card h2').textContent }));
      check(t.a.includes('1. «Điểm hòa vốn» của một doanh nghiệp') && t.b.includes('Tôi tự tin định giá cho một sản phẩm mới.'), 'không có lang=en, ' + ten + ': công cụ đo vẫn là bản tiếng Việt');
      check(locale === 'vi-VN' ? (t.note === 'Chọn một đáp án mỗi câu (15 câu).' && t.h === '🔒 Đồng thuận tham gia khảo sát') : (t.note.includes('in Vietnamese to keep the research instrument consistent') && t.h === '🔒 Consent to take part in the survey'), 'không có lang=en, ' + ten + ': nhãn theo ngôn ngữ của site, ghi chú phần A đúng');
      check(!loi2.length, 'không có lang=en, ' + ten + ': không lỗi JS: ' + loi2.join(' | '));
      await c2.close();
    }
  } finally { await b.close(); }
  if (fails) { console.error(fails + ' kiểm tra thất bại'); process.exit(1); } console.log('khao-sat-tieng-anh: ok');
})().catch(e => { console.error(e); process.exit(1); });
