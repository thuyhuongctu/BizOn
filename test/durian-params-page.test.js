// Trang Học thuật: bảng tham số Hộ Chiếu Sầu Riêng phải bằng đúng tệp dữ liệu của game.
// Mỗi dòng có data-param và data-value (JSON); phép thử so với DurianData (và vài hằng trong engine).
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ctx = {}; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-data.js'), ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-engine.js'), ctx);
const D = ctx.DurianData, E = ctx.DurianEngine;

const html = read('truong-hoc-thuat.html');
const sec = html.slice(html.indexOf('<section id="tham-so-sau-rieng"'), html.indexOf('<section id="ly-thuyet-kdqt"'));
assert.ok(sec.length > 1000, 'có mục tham số trước mục lý thuyết');
const unesc = x => x.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&');
const rows = {}; const re = /<tr data-param="([^"]+)" data-value="([^"]*)">/g; let m;
while ((m = re.exec(sec))) rows[m[1]] = JSON.parse(unesc(m[2]));
const expect = {
  cash0: D.params.cash0, creditLimit: D.params.creditLimit, depotMain: D.params.depotMain, offMult: D.params.offMult, farmCost: D.params.farmCost, offFarmMult: D.params.offFarmMult,
  linkedPremium: D.params.linkedPremium, baseLoss: D.params.baseLoss, traceLossCut: D.params.traceLossCut, offYieldCut: D.params.offYieldCut, treeHealthCost: D.params.treeHealthCost,
  rejectedDiscount: D.params.rejectedDiscount, fraudMult: D.params.fraudMult, sampling: D.params.sampling, priorityCost: D.params.priorityCost,
  'channels.priceMult': Object.fromEntries(D.channels.map(c => [c.id, c.priceMult])),
  'channels.cap': Object.fromEntries(D.channels.filter(c => c.cap).map(c => [c.id, c.cap])),
  'channels.TW.tariff': D.channels.find(c => c.id === 'TW').tariff,
  'seasons.borderCut': D.seasons.map(s => s.borderCut || 0), 'seasons.demand': D.seasons.map(s => s.demand),
  scoreWeights: D.scoreWeights,
  cadmiumRiskMult: D.params.cadmiumRiskMult, thaiDryPriceMult: D.params.thaiDryPriceMult, frozenProtoMult: D.params.frozenProtoMult, cleanSamplingMult: D.params.cleanSamplingMult,
  'roles.benchMargin': Object.fromEntries(Object.keys(D.roles).map(k => [k, D.roles[k].benchMargin])),
  capability: (() => { const c = a => E.capability(Object.assign({ test: 0 }, a)), b0 = c({}); return { base: b0, area: c({ area: 1 }) - b0, pack: c({ pack: 1 }) - b0, testPerLevel: c({ test: 1 }) - b0, trace: c({ trace: 1 }) - b0, freezer: c({ freezer: 1 }) - b0 }; })()
};
for (const [k, v] of Object.entries(expect)) {
  assert.ok(k in rows, 'bảng thiếu dòng ' + k);
  assert.equal(JSON.stringify(rows[k]), JSON.stringify(v), 'dòng ' + k + ' lệch dữ liệu: bảng ' + JSON.stringify(rows[k]) + ' · mã ' + JSON.stringify(v));
}
assert.equal(Object.keys(rows).length, Object.keys(expect).length, 'không có dòng thừa ngoài danh sách kiểm');
// Nguồn dẫn: mọi mã trong cột nguồn đều có trong danh mục dưới bảng và trong D.sources
for (const code of ['PROTO', 'KQTC', 'CAILAY', 'PDIEN', 'BC0224', 'BC1223', 'JETRO', 'TW', 'GMSARN', 'MYSOP', 'GS1', 'FROZENPROTO']) {
  assert.ok(D.sources[code], 'D.sources thiếu ' + code);
  assert.ok(sec.includes('<li><b>' + code + '</b>'), 'danh mục dưới bảng thiếu ' + code);
}
// Bốn hệ số theo mốc không còn nằm cứng trong engine: engine đọc từ params
for (const k of ['cadmiumRiskMult', 'thaiDryPriceMult', 'frozenProtoMult', 'cleanSamplingMult']) {
  assert.equal(typeof D.params[k], 'number', 'params.' + k);
  assert.ok(read('lab/ho-chieu-sau-rieng-engine.js').includes('P.' + k), 'engine đọc P.' + k);
}
assert.ok(!/price \*= 0\.92;|price \*= 1\.15;|risk \*= 2\.5;|\? 0\.6 : 1;/.test(read('lab/ho-chieu-sau-rieng-engine.js')), 'không còn hệ số theo mốc viết cứng trong engine');
// Hai luật trong mã engine được nêu đúng số
assert.match(read('lab/ho-chieu-sau-rieng-engine.js'), /Math\.min\(debt, lim\) \* 0\.08 \+ Math\.max\(0, debt - lim\) \* 0\.15/, 'lãi 8 %/15 % trong engine');
assert.match(read('lab/ho-chieu-sau-rieng-engine.js'), /fraudExposed = rnd\(\) < 0\.5/, 'xác suất 50 % bị phát hiện');
assert.ok(sec.includes('8 %/vụ trong hạn mức và 15 % phần vượt') && sec.includes('xác suất 50 %'), 'trang nêu hai luật ấy');
console.log('durian-params-page: ok (' + Object.keys(rows).length + ' dòng)');
