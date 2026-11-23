/* Bản đồ hành trình trên trang chủ (23/11/2026): dải «Nối ba bậc» có ba trạm, giữa hai trạm ghi rõ hành trang mang sang.
 * Tĩnh: mọi con số trên bản đồ khớp mã nguồn – hành trang khớp js/core/journey.js PARAMS, số tuần/vòng/quý/vụ khớp engine từng game;
 * VI/EN đủ; index.html = academia3d-v2.html. Trình duyệt: máy tính ba trạm cùng một hàng, điện thoại một cột, không tràn ngang
 * ở 360 px, bản tiếng Anh, bấm vào tới hanh-trinh.html. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';

const home = R('index.html');
assert.equal(home, R('academia3d-v2.html'), 'index.html giống hệt academia3d-v2.html');
const ul = home.slice(home.indexOf('<ul class="hp-journey-steps">'), home.indexOf('</ul>', home.indexOf('<ul class="hp-journey-steps">')));
assert.equal((ul.match(/<li><b>\d<\/b>/g) || []).join(''), '<li><b>1</b><li><b>2</b><li><b>3</b>', 'ba trạm đúng thứ tự');
assert.equal((ul.match(/<li class="hp-jcarry">/g) || []).length, 2, 'hai đoạn hành trang giữa ba trạm');
for (const m of ul.matchAll(/<(span|small)\b([^>]*)>([^<]+)</g)) assert.ok(/\sdata-en="[^"]+"/.test(m[2]), 'thiếu data-en: ' + m[3]);

// Hành trang khớp PARAMS
const J = require(path.join(__dirname, '..', 'js/core/journey.js'));   // UMD: Node nhận module.exports
assert.ok(J && J.PARAMS, 'đọc được PARAMS của js/core/journey.js');
const P = J.PARAMS, vn = x => String(x).replace('.', ',');
assert.ok(ul.includes(`vốn tối đa +${P.T1_CASH_MAX} triệu; thương hiệu ×${vn(P.T1_BRAND.toFixed(2))} nếu hạng 1–${P.T1_BRAND_RANK_MAX}`), 'Bậc 1 → 2 (VI) khớp PARAMS');
assert.ok(ul.includes(`up to +${P.T1_CASH_MAX}m capital; brand ×${P.T1_BRAND.toFixed(2)} if ranked 1–${P.T1_BRAND_RANK_MAX}`), 'Bậc 1 → 2 (EN) khớp PARAMS');
assert.ok(ul.includes(`lệch tối đa ±${Math.round(P.T2_CASH_CAP * 100)} %; uy tín tối đa +${P.T2_REP_MAX}`), 'Bậc 2 → 3 (VI) khớp PARAMS');
assert.ok(ul.includes(`at most ±${Math.round(P.T2_CASH_CAP * 100)}%; reputation up to +${P.T2_REP_MAX}`), 'Bậc 2 → 3 (EN) khớp PARAMS');

// Độ dài từng bậc khớp engine
assert.ok(/S\.week >= 5/.test(R('ben-phu-sa.html')) && ul.includes('5 tuần') && ul.includes('5 weeks'), 'Bến Phù Sa 5 tuần');
assert.ok(/const ROUNDS_TOTAL = 6;/.test(R('js/engine.js')) && ul.includes('6 vòng') && ul.includes('6 rounds'), 'Bật Nghiệp 6 vòng');
assert.ok(/S\.q >= 6/.test(R('brand-passport.html')) && ul.includes('6 quý') && ul.includes('6 quarters'), 'Hộ Chiếu Thương Hiệu 6 quý');
const dctx = { window: {}, console }; dctx.window.window = dctx.window; vm.createContext(dctx);
vm.runInContext(R('lab/ho-chieu-sau-rieng-data.js'), dctx);
assert.equal(dctx.window.DurianData.seasons.length, 6); assert.ok(ul.includes('6 vụ') && ul.includes('6 seasons'), 'Hộ Chiếu Sầu Riêng 6 vụ');
assert.ok(+(R('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 969, 'sw.js tăng phiên bản');

let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('ban-do-hanh-trinh: cần playwright'); process.exit(1); }
(async () => {
  const b = await chromium.launch(); let fails = 0;
  const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
  for (const [w, lang] of [[1280, 'vi'], [390, 'vi'], [360, 'en']]) {
    const cx = await b.newContext({ viewport: { width: w, height: 900 } });
    await cx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await cx.route(/googleapis|gstatic|goatcounter|supabase\.co|\.mp3|\.mp4/, r => r.abort());
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + '/index.html?lang=' + lang, { waitUntil: 'load' }); await pg.waitForTimeout(900);
    const r = await pg.evaluate(() => {
      const st = [...document.querySelectorAll('#hp-journey .hp-journey-steps > li:not(.hp-jcarry)')].map(li => li.getBoundingClientRect());
      return { tops: st.map(x => Math.round(x.top)), lefts: st.map(x => Math.round(x.left)), over: document.documentElement.scrollWidth,
        carry: document.querySelector('#hp-journey .hp-jcarry').textContent };
    });
    const tag = w + ' px ' + lang + ': ';
    ok(r.over <= w, tag + 'không tràn ngang');
    if (w >= 1000) ok(new Set(r.tops).size === 1 && r.lefts[0] < r.lefts[1] && r.lefts[1] < r.lefts[2], tag + 'ba trạm cùng một hàng, trái sang phải');
    else ok(r.tops[0] < r.tops[1] && r.tops[1] < r.tops[2] && new Set(r.lefts).size === 1, tag + 'ba trạm xếp một cột');
    ok(lang === 'en' ? /^Carried to Level 2/.test(r.carry) : /^Mang sang Bậc 2/.test(r.carry), tag + 'chữ hành trang đúng ngôn ngữ');
    ok(!errs.length, tag + 'không lỗi JS' + (errs.length ? ': ' + errs[0] : ''));
    if (w === 1280) {
      await Promise.all([pg.waitForNavigation({ waitUntil: 'load' }), pg.click('#hp-journey .hp-jcarry')]);
      ok(/\/hanh-trinh\.html$/.test(pg.url()), tag + 'bấm vào bản đồ tới hanh-trinh.html');
    }
    await cx.close();
  }
  await b.close();
  if (fails) { console.error('ban-do-hanh-trinh: ' + fails + ' lỗi'); process.exit(1); }
  console.log('ban-do-hanh-trinh: ok');
})().catch(e => { console.error(e); process.exit(1); });
