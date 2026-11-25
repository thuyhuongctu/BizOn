// Đặc tả 009 · PR 3 (Câu chuyện 3): câu hỏi thảo luận về rủi ro khí hậu ở màn kết quả Go Global và hai cột CSV mới.
//  - Chơi đủ 4 quý (link thường và ?khihau=1): màn kết quả có 2 câu hỏi, có số ND-GAIN của nước trung tâm,
//    không chứa đáp án gợi ý; bản tiếng Anh không còn chữ Việt.
//  - CSV xuất ra: 21 cột cũ giữ nguyên tên và thứ tự, thêm ndgain, climate_mode ở cuối; giá trị đúng với ván và chế độ.
//  - Tài liệu: chuẩn đầu ra CLO-D và hướng dẫn giảng viên nhắc ?khihau=1 và hai cột mới.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const KH = require('../js/go-global-khi-hau.js');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

const COT_CU = ['time', 'market', 'mode', 'nego', 'tech', 'exp', 'quarter', 'event', 'price', 'marketing', 'localization', 'share', 'profit', 'esg', 'risk', 'doi', 'rep', 'learn', 'result', 'avgShare', 'totalProfit'];
assert.match(R('docs/chuan-dau-ra-va-rubric.md'), /\| CLO-D \|[^\n]*khihau=1[^\n]*ND-GAIN/, 'CLO-D nhắc kịch bản khí hậu và ND-GAIN');
assert.match(R('docs/huong-dan-giang-vien.md'), /global\.html\?khihau=1/, 'hướng dẫn giảng viên có link ?khihau=1');
assert.match(R('docs/huong-dan-giang-vien.md'), /`ndgain`[^\n]*`climate_mode`/, 'hướng dẫn giảng viên nhắc hai cột CSV mới');
const v = +R('sw.js').match(/bizon-v(\d+)/)[1];
assert.ok(v >= 992, 'sw.js phải ≥ bizon-v992, đang ' + v);

(async () => {
  const b = await chromium.launch();
  let fail = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
  const choi = async (q, lang) => {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(l => {
      try { localStorage.clear(); localStorage.setItem('bizon-lang', l); } catch (e) {}
      // bắt nội dung CSV khi game gọi gExportCSV (Blob + thẻ <a> tải về)
      const B = window.Blob; window.__csv = null;
      window.Blob = function (parts, opt) { if (opt && /csv/.test(opt.type || '')) window.__csv = parts.join(''); return new B(parts, opt); };
      HTMLAnchorElement.prototype.click = function () {};
    }, lang);
    await p.goto(BASE + '/global.html' + q, { timeout: 60000 }); await p.waitForTimeout(800);
    const kq = await p.evaluate(() => {
      pickMarket('af'); pickMode('fdi');
      for (let i = 0; i < 4; i++) gCommit();
      const box = document.getElementById('kh-cau-hoi');
      gExportCSV();
      return { cauHoi: box ? box.innerText : '', csv: window.__csv };
    });
    await p.close();
    return { ...kq, errs };
  };

  const ken = KH.hoSo('af');
  for (const [q, mode] of [['', 'off'], ['?khihau=1', 'on']]) {
    const r = await choi(q, 'vi');
    const so = String(ken.gain).replace('.', ',');
    check((r.cauHoi.match(/^\d\. /gm) || []).length === 2 && r.cauHoi.includes(`ND-GAIN ${so}`) && r.cauHoi.includes(`hạng ${ken.hang}/${KH.TONG_SO_NUOC}`), `${mode}: màn kết quả có 2 câu hỏi khí hậu, có số ND-GAIN của Kenya`);
    check(!/nên chọn|hãy chọn|đáp án|nên đổi/i.test(r.cauHoi), `${mode}: câu hỏi không chứa đáp án gợi ý`);
    check(mode === 'off' ? /chỉ để tham khảo/.test(r.cauHoi) : !/chỉ để tham khảo/.test(r.cauHoi), `${mode}: ghi đúng chỉ số có tính vào điểm hay không`);
    const dong = (r.csv || '').replace(/^﻿/, '').split('\n');
    const dau = dong[0].split(',');
    check(JSON.stringify(dau.slice(0, 21)) === JSON.stringify(COT_CU) && dau[21] === 'ndgain' && dau[22] === 'climate_mode' && dau.length === 23, `${mode}: CSV giữ 21 cột cũ, thêm ndgain, climate_mode ở cuối`);
    const cuoi = dong.slice(1).map(l => l.split(',').map(x => x.replace(/^"|"$/g, '')));
    check(cuoi.length === 4 && cuoi.every(c => c[21] === String(ken.gain) && c[22] === mode), `${mode}: 4 dòng của ván có ndgain = ${ken.gain}, climate_mode = ${mode}`);
    check(r.errs.length === 0, `${mode}: không lỗi JS` + (r.errs[0] ? ' → ' + r.errs[0] : ''));
  }
  const en = await choi('?khihau=1', 'en');
  const VN = /[àáạảãâầấậẩẫăằắặẳẵẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  check(/Discussion questions: climate risk/.test(en.cauHoi) && !VN.test(en.cauHoi) && !/should choose|the answer/i.test(en.cauHoi), 'EN: câu hỏi bằng tiếng Anh, không gợi ý đáp án');
  await b.close();
  if (fail) { console.log(`    ${fail} kiểm tra thất bại`); process.exit(1); }
  console.log('go-global-khi-hau-p3: đạt');
})().catch(e => { console.error(e); process.exit(1); });
