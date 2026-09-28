/* BizOn · Cảnh mới: Xưởng sản xuất · Kho hàng · Phòng đối thủ · plugin cho game.html
 * Nạp SAU js/engine.js, js/app.js, js/market-dynamic.js:  <script src="js/office-scenes.js"></script>
 * Mở: BizonScenes.open('factory' | 'warehouse' | 'rivals'). Trong văn phòng (#bzo) có cửa + nút trên HUD.
 * Dữ liệu live từ S (OEE, dây chuyền, tồn kho, đối thủ) + BizonMarket (vận chuyển, kế hoạch đối thủ theo thành phố).
 */
(function () {
  'use strict';
  const tr = (vi, en) => (typeof T === 'function' ? T(vi, en) : vi);
  const st = () => (typeof S !== 'undefined' ? S : null);
  const num = v => Math.round(v || 0).toLocaleString(tr('vi-VN', 'en-US'));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const IMG = { coo: ['assets/character/v2/coo.png', 'assets/character/team/coo-cut.webp'], sec: ['assets/character/v2/sec.png', 'assets/character/team/sec-cut.webp'],
    ceo: ['assets/character/v2/ceo.png', 'assets/character/team/ceo-full-cut.webp'], cfo: ['assets/character/v2/cfo.png', 'assets/character/team/cfo-cut.webp'], cmo: ['assets/character/v2/cmo.png', 'assets/character/team/cmo-cut.webp'],
    lumina: ['assets/character/v2/lumina.png', 'assets/character/advisors/lumina-vest-cut.webp'],
    alpha: ['assets/character/rivals/alpha.webp'], mekong: ['assets/character/rivals/mekong.webp'], star: ['assets/character/rivals/star.webp'] };
  const img = (k, extra = '') => { const [a, b] = IMG[k] || IMG.lumina; return `<img src="${a}" ${b ? `onerror="this.onerror=null;this.src='${b}'"` : ''} alt="" ${extra}>`; };
  const RIV = { aggressive: { k: 'alpha', icon: '🐺', c: '#e8762d', base: [125, 90] }, balanced: { k: 'mekong', icon: '🐘', c: '#2e8b57', base: [150, 60] }, premium: { k: 'star', icon: '🦚', c: '#6a3fb5', base: [195, 75] } };
  const NAME = { coo: 'Bảo Đông · COO', sec: 'Gia Hân · SEC' };
  const roleKey = s => { const r = String((s && s.profile && s.profile.role) || 'CEO').toLowerCase(); return IMG[r] ? r : 'ceo'; };

  const CSS = `
#bzs{position:fixed;inset:0;z-index:70;background:#cfdde4;font-family:inherit;color:#033337;overflow:hidden;user-select:none;touch-action:none}
#bzs *{box-sizing:border-box}
#bzs .w{position:absolute;left:0;top:0;transform-origin:0 0}
#bzs .fl{position:absolute;inset:0;border-radius:0}
#bzs .wl{position:absolute;left:0;top:0;right:0;height:150px;box-shadow:0 6px 0 rgba(0,0,0,.12),0 18px 30px -12px rgba(0,0,0,.35)}
#bzs .ttl{position:absolute;left:50%;top:34px;transform:translateX(-50%);background:rgba(255,255,255,.95);border-radius:16px;padding:10px 26px;font-weight:900;color:#006687;letter-spacing:.04em;white-space:nowrap;box-shadow:0 8px 20px rgba(0,0,0,.18);text-align:center}
#bzs .ttl small{display:block;font-size:12px;font-weight:700;letter-spacing:0;color:#033337}
#bzs .hs{position:absolute;transform:translate(-50%,-50%);cursor:pointer}
#bzs .hs.near{filter:drop-shadow(0 0 10px rgba(0,196,255,.95))}
#bzs .tg{position:absolute;left:50%;transform:translateX(-50%);bottom:-26px;background:#033337;color:#fff;font-size:11px;font-weight:800;padding:3px 10px;border-radius:999px;white-space:nowrap}
#bzs .npc{position:absolute;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;cursor:pointer}
#bzs .npc img{height:200px;width:auto;animation:bzs-idle 2.6s ease-in-out infinite;transform-origin:bottom center}
#bzs .npc.rv img{height:180px}
#bzs .npc .tg{position:static;transform:none;margin-top:6px}
#bzs .npc.rv .tg{background:#b0501a}
#bzs .npc.near img{filter:drop-shadow(0 0 8px rgba(0,196,255,.9))}
#bzs .pl{position:absolute;transform:translate(-50%,-100%);pointer-events:none}
#bzs .pl img{height:220px;width:auto;transform-origin:bottom center}
#bzs .pl .sh{position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:100px;height:20px;border-radius:50%;background:rgba(0,0,0,.2);filter:blur(2px)}
#bzs .hud{position:absolute;top:12px;left:12px;right:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;z-index:3}
#bzs .pill{background:rgba(255,255,255,.92);border:2px solid #dbe9f0;border-radius:999px;padding:6px 12px;font-size:13px;font-weight:800}
#bzs .bk{font:inherit;font-weight:800;border:0;border-radius:999px;padding:8px 16px;cursor:pointer;background:#006687;color:#fff;margin-left:auto}
#bzs .hint{position:absolute;bottom:14px;right:14px;background:rgba(3,51,55,.78);color:#fff;font-size:12px;padding:8px 12px;border-radius:12px;max-width:300px;z-index:3}
#bzs .joy{position:absolute;bottom:26px;left:26px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.35);border:4px solid rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;z-index:3;touch-action:none}
#bzs .joy i{width:52px;height:52px;border-radius:50%;background:#fff;box-shadow:4px 4px 12px rgba(0,0,0,.15)}
#bzs .dlg{position:absolute;left:16px;right:16px;bottom:18px;max-width:900px;margin:0 auto;background:#fff;border:4px solid #dbe9f0;border-radius:28px;box-shadow:10px 10px 30px rgba(0,40,60,.3);padding:16px 18px;display:flex;gap:14px;align-items:flex-start;z-index:4;max-height:60%;overflow:auto}
#bzs .dlg>img{height:110px;width:auto;flex-shrink:0}
#bzs .dlg .ic{font-size:44px;line-height:1;flex-shrink:0}
#bzs .dlg h3{margin:0 0 4px;font-size:16px;font-weight:900;color:#006687}
#bzs .dlg p{margin:0 0 8px;font-size:14px;line-height:1.5;text-wrap:pretty}
#bzs .dlg .kv{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:6px;margin:6px 0 10px}
#bzs .dlg .kv div{background:#f4faff;border-radius:12px;padding:7px 10px}
#bzs .dlg .kv small{display:block;font-size:10px;font-weight:700;color:#5d6770}
#bzs .dlg .kv b{font-size:16px;font-weight:900}
#bzs .dlg .bad{color:#c0392b}#bzs .dlg .ok{color:#0a7a45}
#bzs .dlg .ch{display:flex;flex-wrap:wrap;gap:8px}
#bzs .dlg button{font:inherit;font-weight:800;border:2px solid #dbe9f0;border-radius:14px;padding:9px 14px;cursor:pointer;background:#f4faff;color:#006687;font-size:13px}
#bzs .dlg button.p{background:#006687;color:#fff;border-color:#006687}
#bzs .dlg button:disabled{opacity:.5;cursor:not-allowed}
#bzs .toast{position:absolute;top:64px;left:50%;transform:translateX(-50%);background:#033337;color:#fff;border-radius:14px;padding:9px 16px;font-size:13px;font-weight:700;opacity:0;transition:opacity .3s;z-index:5;pointer-events:none}
#bzs .toast.on{opacity:1}
#bzs .belt{position:absolute;height:54px;border-radius:12px;background:repeating-linear-gradient(90deg,#3a4148 0 26px,#2b3137 26px 52px);box-shadow:inset 0 5px 0 rgba(255,255,255,.12),0 10px 18px -8px rgba(0,0,0,.5);animation:bzs-belt 1.2s linear infinite}
#bzs .belt.slow{animation-duration:2.4s}
#bzs .belt i{position:absolute;top:9px;width:36px;height:36px;border-radius:9px;background:#e7a86a;box-shadow:inset 0 -5px 0 #c98a4d}
#bzs .mch{position:absolute;width:150px;height:130px;border-radius:18px;background:linear-gradient(#6f8a96,#4a616c);box-shadow:inset 0 -10px 0 rgba(0,0,0,.2),0 16px 24px -10px rgba(0,0,0,.5);display:flex;align-items:flex-start;justify-content:center;padding-top:14px}
#bzs .mch .lt{width:18px;height:18px;border-radius:50%;box-shadow:0 0 12px currentColor;background:currentColor}
#bzs .mch .sc{position:absolute;left:16px;right:16px;bottom:20px;height:40px;border-radius:8px;background:#0d1117;color:#35d07f;font:800 12px/40px ui-monospace,Menlo,monospace;text-align:center}
#bzs .brd{position:absolute;background:#0d1117;border-radius:14px;padding:12px 14px;color:#cfe3dc;font:700 12px/1.5 ui-monospace,Menlo,Consolas,monospace;box-shadow:inset 0 0 0 6px #1b1f23,0 10px 20px rgba(0,0,0,.3)}
#bzs .brd b{color:#fff}#bzs .brd .h{color:#8fa89f;font-size:11px;letter-spacing:.1em;margin-bottom:4px}
#bzs .brd .u{color:#35d07f}#bzs .brd .d{color:#ff6b5e}#bzs .brd .y{color:#ffc94a}
#bzs .shelf{position:absolute;width:300px;height:120px;border-radius:10px;background:linear-gradient(#a57a4e,#8a633d);box-shadow:inset 0 -10px 0 rgba(0,0,0,.25),0 14px 20px -10px rgba(0,0,0,.5);display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(3,1fr);gap:5px;padding:9px}
#bzs .shelf i{border-radius:5px;background:#e7a86a;box-shadow:inset 0 -4px 0 #c98a4d}
#bzs .shelf i.e{background:rgba(0,0,0,.12);box-shadow:none}
#bzs .truck{position:absolute;width:170px;height:84px}
#bzs .truck .bx{position:absolute;left:0;top:0;width:118px;height:70px;border-radius:10px;background:#fbfaf7;box-shadow:inset 0 -8px 0 #d9d2c5;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;color:#006687;text-align:center;line-height:1.2}
#bzs .truck .cb{position:absolute;left:120px;top:18px;width:48px;height:52px;border-radius:10px 16px 8px 8px;background:#006687}
#bzs .truck .wh{position:absolute;bottom:0;width:26px;height:26px;border-radius:50%;background:#2b3137;box-shadow:inset 0 0 0 7px #4a525a}
#bzs .rt{position:absolute;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fbfaf7,#e2d9ca);box-shadow:inset 0 -14px 0 #cfc6b8,0 20px 30px -12px rgba(40,30,20,.5)}
@keyframes bzs-idle{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes bzs-belt{to{background-position:52px 0}}
@media (max-width:760px){#bzs .hint{display:none}#bzs .dlg{flex-direction:column}#bzs .dlg>img{height:80px}}`;
  const css = () => { if (!document.getElementById('bzs-css')) { const e = document.createElement('style'); e.id = 'bzs-css'; e.textContent = CSS; document.head.appendChild(e); } };

  // ---------- Dữ liệu từng cảnh ----------
  function rivalPlanFor(s, c) {
    const b = RIV[c.style] || { base: [150, 55] }; let p = b.base[0] * 1.025, m = b.base[1] * 1.025, why = [];
    const r = window.BizonMarket && BizonMarket.rivalPlan ? BizonMarket.rivalPlan(s, c.style, p, m) : null;
    if (r) { p = r.price; m = r.mkt; why = r.why; }
    return { price: Math.round(p), mkt: Math.round(m), why };
  }
  const cityNow = s => { const sn = window.BizonMarket ? BizonMarket.snapshot(s) : null; return sn ? sn.cities[Math.min(s.round || 1, 6) - 1] : null; };

  function factory(s) {
    const er = typeof energyReport === 'function' ? energyReport(s) : { lines: [0, 1, 2].map(i => ({ name: tr('Dây chuyền ', 'Line ') + (i + 1), kwh: 2000, status: 'ok', upgraded: false })), total: 6000, target: 7000 };
    const last = (s.history || []).slice(-1)[0];
    const col = { ok: '#35d07f', warn: '#ffc94a', bad: '#ff5e4e' };
    const W = 1800, H = 1100;
    const lines = er.lines.map((l, i) => {
      const y = 330 + i * 230;
      return { y, l, html: `<div class="belt ${l.status === 'bad' ? '' : 'slow'}" style="left:360px;top:${y}px;width:900px">${[0, 1, 2, 3, 4, 5, 6].map(k => `<i style="left:${40 + k * 125}px"></i>`).join('')}</div>
        <div class="mch hs" data-h="line${i}" style="left:300px;top:${y + 27}px;color:${col[l.status]}"><span class="lt"></span><div class="sc">${num(l.kwh)} kWh</div><span class="tg">${l.name}${l.upgraded ? ' ✓' : ''}</span></div>` };
    });
    const hot = [
      ...lines.map((x, i) => ({ id: 'line' + i, x: 300, y: x.y + 27, talk: () => {
        const l = er.lines[i], can = !l.upgraded && typeof optimizeLine === 'function';
        return { icon: '⚙️', title: l.name, text: l.status === 'bad' ? tr('Dây chuyền đang ngốn điện quá mức. Nếu nang cấp, điện năng giảm 40% và OEE tăng 5%.', 'This line is drawing far too much power. Upgrading cuts power 40% and lifts OEE 5%.')
            : l.status === 'warn' ? tr('Tiêu thụ điện ở mức cần theo dõi, nhất là khi có khụng hoảng năng lương.', 'Power use needs watching, especially in an energy crisis.') : tr('Dây chuyền chạy ổn định.', 'The line is running steadily.'),
          kv: [[tr('Điện năng', 'Power'), num(l.kwh) + ' kWh', l.status !== 'ok'], [tr('Trạng thái', 'Status'), l.upgraded ? tr('Đã nâng cấp', 'Upgraded') : tr('Chưa nâng cấp', 'Not upgraded')], [tr('Tổng xưėng', 'Plant total'), `${num(er.total)} / ${num(er.target)} kWh`, er.total > er.target]],
          actions: can ? [{ text: tr('Nâng cấp dây chuyền (−150tr₫)', 'Upgrade line (−150m₫)'), primary: true, disabled: s.balance < 150, run: () => optimizeLine(s, i) ? tr(`Đã nâng cấp ${l.name}: −40% điện, OEE +5%.`, `${l.name} upgraded: −40% power, OEE +5%.`) : tr('Không đủ tiền.', 'Not enough cash.') }] : [] };
      } })),
      { id: 'board', x: 1500, y: 260, talk: () => ({ icon: '📟', title: tr('Bảng điều khiển xưởng', 'Plant control board'), text: tr('Số liệu vận hành từ vòng gần nhất.', 'Operations data from the latest round.'),
        kv: [['OEE', Math.round(s.oee ?? 85) + '%', (s.oee ?? 85) < 80], [tr('Phế phẩm', 'Defects'), (s.defect ?? 2) + '%', (s.defect ?? 2) > 4.3], [tr('Công suất máy', 'Machine capacity'), num(s.machineCapacity) + ' sp'],
          [tr('Sản lượng vòng trước', 'Last output'), last ? num(last.decisions.production) + ' sp' : '–'], [tr('Nhân công', 'Workers'), last ? String(last.workers || last.decisions.workers || 45) : '45'], [tr('Hàng lỗi ước tính', 'Est. defective'), last ? num(last.decisions.production * (s.defect || 2) / 100) + ' sp' : '–']] }) },
      { id: 'coo', npc: 'coo', x: 1480, y: 900, talk: () => {
        const b = typeof cooBrain === 'function' ? cooBrain(s) : { dialogue: tr('Xưởng đang ổn, mình theo dõi OEE mỗi vòng.', 'The plant is fine; I track OEE each round.'), actions: [] };
        return { npc: 'coo', title: NAME.coo, text: b.dialogue, badge: b.badge, list: b.actions,
          actions: typeof doMaintenance === 'function' ? [{ text: tr('Bảo trì định kỳ (−60tr₫)', 'Routine maintenance (−60m₫)'), primary: true, disabled: s.balance < 60, run: () => doMaintenance(s) ? tr('Đã bảo trì: OEE +3%, giảm phế phẩm.', 'Maintenance done: OEE +3%, fewer defects.') : tr('Không đủ tiền.', 'Not enough cash.') }] : [] };
      } },
    ];
    const brd = `<div class="brd hs" data-h="board" style="left:1500px;top:260px;width:300px"><div class="h">OEE · ${tr('PHẾ PHẨM', 'DEFECTS')} · ${tr('ĐIỆN', 'POWER')}</div>
      <div>OEE <b class="${(s.oee ?? 85) < 80 ? 'd' : 'u'}">${Math.round(s.oee ?? 85)}%</b> · ${tr('lỗi', 'def.')} <b class="${(s.defect ?? 2) > 4.3 ? 'd' : 'u'}">${s.defect ?? 2}%</b></div>
      <div>${tr('Điện', 'Power')} <b class="${er.total > er.target ? 'd' : 'u'}">${num(er.total)}</b>/${num(er.target)} kWh</div><div>${tr('Công suất', 'Capacity')} <b>${num(s.machineCapacity)}</b> sp</div><span class="tg">${tr('Bảng điều khiển', 'Control board')}</span></div>`;
    return { W, H, start: [1000, 1000], floor: 'repeating-linear-gradient(90deg,rgba(0,0,0,.05) 0 2px,transparent 2px 120px),repeating-linear-gradient(0deg,#c9d3d8 0 118px,#bfcacf 118px 120px)',
      wall: 'linear-gradient(#e5ebee,#d3dce0)', title: tr('XƯỞNG SẢN XUẤT', 'PRODUCTION FLOOR'), sub: tr('Dây chuyền đất sét · COO phụ trách', 'Clay lines · run by the COO'),
      html: lines.map(x => x.html).join('') + brd + `<div style="position:absolute;left:1360px;top:430px;width:300px;height:280px;border-radius:20px;background:repeating-linear-gradient(45deg,#ffd54a 0 20px,#2b3137 20px 40px);opacity:.25"></div>`, hot };
  }

  function warehouse(s) {
    const inv = s.inventory || 0, cap = Math.max(3000, s.machineCapacity || 1500), fill = clamp(inv / cap, 0, 1);
    const last = (s.history || []).slice(-1)[0];
    const sn = window.BizonMarket ? BizonMarket.snapshot(s) : null;
    const cells = 24 * 4, full = Math.round(fill * cells);
    const shelves = [0, 1, 2, 3].map(i => `<div class="shelf" style="left:${170 + (i % 2) * 420}px;top:${280 + Math.floor(i / 2) * 260}px">${Array.from({ length: 24 }, (_, k) => `<i class="${i * 24 + k < full ? '' : 'e'}"></i>`).join('')}</div>`).join('');
    const trucks = (sn ? sn.cities : []).map((c, i) => `<div class="truck hs" data-h="t${c.n}" style="left:${1140 + (i % 2) * 220}px;top:${280 + Math.floor(i / 2) * 200}px"><div class="bx">${c.short}<br><span style="font-size:11px;color:${c.ship >= 1.08 ? '#c0392b' : '#0a7a45'}">+${Math.round((c.ship - 1) * 100)}%</span></div><div class="cb"></div><div class="wh" style="left:14px"></div><div class="wh" style="left:130px"></div><span class="tg">${c.status === 'done' ? '✓ ' : c.status === 'cur' ? '▶ ' : ''}${c.short}</span></div>`).join('');
    const hot = [
      { id: 'stock', x: 520, y: 520, talk: () => ({ icon: '📦', title: tr('Kệ hàng thành phẩm', 'Finished goods shelves'), text: inv > cap * 0.4 ? tr('Kho đang đầy – chi phí lưu kho ăn vào lợi nhuận. Nếu giảm sản lượng hoặc đẩy marketing, hàng sẽ thoát nhanh hơn.', 'The warehouse is filling up – holding costs eat profit. Cutting output or pushing marketing clears it faster.')
          : inv === 0 && last && last.lostSales > 0 ? tr('Kho trống và vòng trước còn hụt đơn. Cần tăng sản lượng.', 'The warehouse is empty and we missed orders last round. Raise output.') : tr('Tồn kho ở mức an toàn.', 'Stock is at a safe level.'),
        kv: [[tr('Tồn kho', 'Inventory'), num(inv) + ' sp', inv > cap * 0.4], [tr('Lấp đầy kho', 'Fill'), Math.round(fill * 100) + '%'], [tr('Phí lưu kho/vòng', 'Holding/round'), (inv * 0.005).toFixed(1) + 'tr₫'], [tr('Hụt đơn vòng trước', 'Missed last round'), last ? num(last.lostSales) : '–', last && last.lostSales > 200], [tr('Bán vòng trước', 'Sold last round'), last ? num(last.sold) : '–']] }) },
      ...(sn ? sn.cities : []).map((c, i) => ({ id: 't' + c.n, x: 1140 + (i % 2) * 220 + 85, y: 280 + Math.floor(i / 2) * 200 + 42, talk: () => ({ icon: '🚚', title: tr(`Tuyến ${c.name}`, `${c.name} route`),
        text: c.ship >= 1.08 ? tr('Tuyến xa, chi phí vận chuyển cao – giá thành mỗi sản phẩm tăng tương ứng.', 'A long route with high shipping cost – unit cost rises accordingly.') : tr('Tuyến gần, chi phí vận chuyển thấp.', 'A short route with low shipping cost.'),
        kv: [[tr('Phụ phí vận chuyển', 'Shipping surcharge'), '+' + Math.round((c.ship - 1) * 100) + '%', c.ship >= 1.08], [tr('Nhu cầu', 'Demand'), num(c.units) + ' sp'], [tr('Giá TB', 'Avg price'), Math.round(BizonMarket.livePrice(c.n)) + 'k'], [tr('Trạng thái', 'Status'), c.status === 'done' ? tr('Đã giao', 'Delivered') : c.status === 'cur' ? tr('Đang giao', 'In progress') : tr('Sắp tới', 'Upcoming')]] }) })),
      { id: 'sec', npc: 'sec', x: 820, y: 960, talk: () => ({ npc: 'sec', title: NAME.sec, text: last ? tr(`Vòng trước mình bán ${num(last.sold)}/${num(last.demandUnits)} sp${last.lostSales ? `, hụt ${num(last.lostSales)} đơn` : ''}. Tồn kho hiện ${num(inv)} sp. Mình đã ghi vào Nhật ký đội để COO và CMO cùng cân lại sản lượng.`, `Last round we sold ${num(last.sold)}/${num(last.demandUnits)} units${last.lostSales ? `, missing ${num(last.lostSales)} orders` : ''}. Inventory is ${num(inv)}. I've logged it in the Team Journal so the COO and CMO can rebalance output.`)
          : tr('Chưa có vòng nào kết thúc. Sau vòng 1, mình sẽ ghi số liệu nhạp – xuất kho ở đây.', 'No round finished yet. After round 1 I\'ll log stock in/out here.') }) },
    ];
    return { W: 1800, H: 1100, start: [900, 1000], floor: 'repeating-linear-gradient(0deg,#d8cdb8 0 2px,transparent 2px 90px),linear-gradient(#e7ddc9,#ddd1ba)', wall: 'linear-gradient(#efe7d8,#e0d5c1)',
      title: tr('KHO HÀNG & LOGISTICS', 'WAREHOUSE & LOGISTICS'), sub: tr('Tồn kho · 6 tuyến vận chuyển', 'Inventory · 6 shipping routes'),
      html: shelves + `<div class="hs" data-h="stock" style="left:520px;top:520px;width:10px;height:10px"><span class="tg" style="bottom:auto;top:250px">${tr('Kệ hàng', 'Shelves')} · ${num(inv)} sp</span></div>` + trucks
        + `<div style="position:absolute;left:1100px;top:880px;width:480px;height:60px;border-radius:12px;background:repeating-linear-gradient(90deg,#ffd54a 0 30px,#2b3137 30px 60px);opacity:.3"></div>`, hot };
  }

  function rivalsRoom(s) {
    const c = cityNow(s), comps = s.competitors || [];
    const pos = [[640, 560], [1160, 560], [900, 900]];
    const hot = comps.map((x, i) => {
      const r = RIV[x.style] || RIV.balanced, plan = rivalPlanFor(s, x);
      return { id: r.k, npc: r.k, rv: true, name: `${r.icon} ${x.name}`, x: pos[i][0], y: pos[i][1], talk: () => ({ npc: r.k, title: `${r.icon} ${x.name}`,
        text: (plan.why.length ? tr(`Ở ${c ? c.short : 'thành phố này'}, chúng tôi sẽ ${plan.why.join('; ')}.`, `In ${c ? c.short : 'this city'}, we will ${plan.why.join('; ')}.`) : tr('Chúng tôi giữ chiến lược quen thuộc.', 'We stick to our usual playbook.'))
          + ' ' + tr('(Tình báo ước tính, số thật dao động ±10%.)', '(Intel estimate; actual figures vary ±10%.)'),
        kv: [[tr('Giá dự kiến', 'Expected price'), plan.price + 'k'], [tr('Marketing dự kiến', 'Expected marketing'), plan.mkt + 'tr'], [tr('Thị phần vòng trước', 'Last share'), (x.share != null ? (Math.round(x.share * 10) / 10) + '%' : '–')], [tr('Lãi lũy kế', 'Cumulative profit'), num(x.profit || 0) + 'tr₫', (x.profit || 0) < 0]] }) };
    });
    const board = `<div class="brd hs" data-h="wb" style="left:1330px;top:250px;width:360px"><div class="h">${tr('KẾ HOẠCH ĐỐI THỦ', 'RIVAL PLANS')} · ${c ? c.short.toUpperCase() : ''}</div>${comps.map(x => { const r = RIV[x.style] || RIV.balanced, p = rivalPlanFor(s, x); return `<div>${r.icon} <b>${x.name.split(' ')[0]}</b> ${p.price}k · ${p.mkt}tr</div>`; }).join('')}<span class="tg">${tr('Bảng tình báo', 'Intel board')}</span></div>`;
    hot.push({ id: 'wb', x: 1500, y: 300, talk: () => ({ icon: '🕵️', title: tr('Bảng tình báo đối thủ', 'Rival intel board'), text: c ? tr(`Dự đoán cách 3 đối thủ chơi ở ${c.name}: cầu ${c.demand.toFixed(2)}×, cạnh tranh ${c.comp}, niềm tin ${c.trust}. Đối thủ đổi chiến thuật theo thị trường thành phố và theo phong độ của đội bạn.`, `How the 3 rivals are expected to play in ${c.name}: demand ${c.demand.toFixed(2)}×, competition ${c.comp}, trust ${c.trust}. Rivals adapt to each city's market and to your form.`) : '',
      kv: comps.map(x => { const p = rivalPlanFor(s, x); return [x.name, `${p.price}k · ${p.mkt}tr`]; }) }) });
    return { W: 1800, H: 1100, start: [900, 1060], floor: 'radial-gradient(circle at 50% 55%,#d9c8ae 0 340px,transparent 342px),repeating-linear-gradient(45deg,#cdbb9d 0 16px,#c3b193 16px 32px)', wall: 'linear-gradient(#4a3a52,#35283d)',
      title: tr('PHÒNG HỌP ĐỐI THỦ', 'RIVALS\' MEETING ROOM'), sub: c ? tr(`Hội nghị ngành tại ${c.name}`, `Industry summit in ${c.name}`) : '',
      html: `<div class="rt" style="left:700px;top:520px;width:400px;height:260px"></div>` + board, hot };
  }

  const BUILD = { factory, warehouse, rivals: rivalsRoom };

  // ---------- Bộ khung cảnh: di chuyển + điểm tương tác ----------
  function open(kind, onClose) {
    const s = st(); if (!s || !BUILD[kind]) return; css();
    document.getElementById('bzs')?.remove();
    let sc = BUILD[kind](s);
    const root = document.createElement('div'); root.id = 'bzs';
    const me = roleKey(s);
    root.innerHTML = `<div class="w" style="width:${sc.W}px;height:${sc.H}px"><div class="fl" style="background:${sc.floor}"></div><div class="wl" style="background:${sc.wall}"></div>
      <div class="ttl">${sc.title}<small>${sc.sub}</small></div><div class="ct"></div><div class="npcs"></div>
      <div class="pl"><div class="sh"></div>${img(me, 'class="pi"')}</div></div>
      <div class="hud"><span class="pill">💰 ${num(s.balance)}tr₫</span><span class="pill">⚙️ OEE ${Math.round(s.oee ?? 85)}%</span><span class="pill">📦 ${num(s.inventory)} sp</span><button class="bk">◂ ${tr('Về văn phòng', 'Back to office')}</button></div>
      <div class="hint">${tr('WASD / mũi tên / joystick / bấm sàn để đi. Đến gần rồi bấm <b>E</b> hoặc chạm để xem.', 'WASD / arrows / joystick / tap floor to move. Get close and press <b>E</b> or tap to inspect.')}</div>
      <div class="toast"></div><div class="joy"><i></i></div>`;
    document.body.appendChild(root);
    const q = x => root.querySelector(x), world = q('.w'), pl = q('.pl'), pimg = q('.pi'), toastEl = q('.toast');
    let dlg = null, px = sc.start[0], py = sc.start[1], keys = {}, vec = { x: 0, y: 0 }, target = null, facing = 1, nearId = null, camX = 0, camY = 0, last = performance.now(), raf, toastT, drag = false, pid = null, jc = {};
    const paint = () => {
      q('.ct').innerHTML = sc.html;
      q('.npcs').innerHTML = sc.hot.filter(h => h.npc).map(h => `<div class="npc ${h.rv ? 'rv' : ''}" data-h="${h.id}" style="left:${h.x}px;top:${h.y}px">${img(h.npc, `style="animation-delay:${(-Math.random() * 3).toFixed(2)}s"`)}<span class="tg">${h.name || NAME[h.npc] || h.npc}</span></div>`).join('');
      root.querySelectorAll('[data-h]').forEach(el => { el.addEventListener('pointerdown', e => e.stopPropagation()); el.onclick = e => { e.stopPropagation(); talk(el.dataset.h); }; });
    };
    const toast = m => { toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 3000); };
    const closeDlg = () => { if (dlg) { dlg.remove(); dlg = null; } };
    function talk(id) {
      const h = sc.hot.find(x => x.id === id); if (!h) return;
      if (Math.hypot(h.x - px, h.y - py) > 280) { target = { x: h.x + (px < h.x ? -140 : 140), y: h.y + 40, then: () => talk(id) }; return; }
      const d = h.talk(); closeDlg();
      dlg = document.createElement('div'); dlg.className = 'dlg';
      dlg.innerHTML = `${d.npc ? img(d.npc) : `<span class="ic">${d.icon || 'ℹ️'}</span>`}<div style="flex:1;min-width:0"><h3>${d.title}${d.badge ? ` <span style="font-size:11px;font-weight:900;color:#b0501a">· ${d.badge}</span>` : ''}</h3><p>${d.text || ''}</p>
        ${d.kv ? `<div class="kv">${d.kv.map(([k, v, bad]) => `<div><small>${k}</small><b class="${bad ? 'bad' : ''}">${v}</b></div>`).join('')}</div>` : ''}
        ${d.list && d.list.length ? `<p style="font-size:13px;color:#33525a">${d.list.map(x => '• ' + x).join('<br>')}</p>` : ''}
        <div class="ch">${(d.actions || []).map((a, i) => `<button class="${a.primary ? 'p' : ''}" data-a="${i}" ${a.disabled ? 'disabled' : ''}>${a.text}</button>`).join('')}<button data-x>${tr('Đóng', 'Close')}</button></div></div>`;
      root.appendChild(dlg);
      dlg.querySelector('[data-x]').onclick = closeDlg;
      dlg.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { const msg = d.actions[+b.dataset.a].run(); if (typeof save === 'function') save(); toast(msg); closeDlg(); sc = BUILD[kind](s); paint(); hud(); });
    }
    const hud = () => { const p = root.querySelectorAll('.hud .pill'); p[0].textContent = '💰 ' + num(s.balance) + 'tr₫'; p[1].textContent = '⚙️ OEE ' + Math.round(s.oee ?? 85) + '%'; p[2].textContent = '📦 ' + num(s.inventory) + ' sp'; };
    paint();
    const joy = q('.joy'), thumb = joy.querySelector('i');
    joy.addEventListener('pointerdown', e => { e.stopPropagation(); drag = true; pid = e.pointerId; joy.setPointerCapture(pid); const r = joy.getBoundingClientRect(); jc = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    joy.addEventListener('pointermove', e => { if (!drag || e.pointerId !== pid) return; let dx = e.clientX - jc.x, dy = e.clientY - jc.y, dd = Math.hypot(dx, dy); if (dd > 46) { dx *= 46 / dd; dy *= 46 / dd; } thumb.style.transform = `translate(${dx}px,${dy}px)`; vec = { x: dx / 46, y: dy / 46 }; target = null; });
    const jr = e => { if (e.pointerId !== pid) return; drag = false; pid = null; thumb.style.transform = ''; vec = { x: 0, y: 0 }; };
    joy.addEventListener('pointerup', jr); joy.addEventListener('pointercancel', jr);
    world.addEventListener('pointerdown', e => { if (dlg) return; const r = world.getBoundingClientRect(); target = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    // Bắt phím ở pha capture để văn phòng bên dưới không nhận
    const kd = e => { if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName || '')) return; e.stopImmediatePropagation(); const k = e.key.toLowerCase(); if (k.startsWith('arrow')) e.preventDefault();
      if (k === 'escape') { dlg ? closeDlg() : close(); return; } if (k === 'e' && nearId && !dlg) talk(nearId); keys[k] = true; };
    const ku = e => { e.stopImmediatePropagation(); keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', kd, true); window.addEventListener('keyup', ku, true);
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!dlg) {
        let vx = vec.x, vy = vec.y;
        if (!drag) { const kx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0), ky = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0); if (kx || ky) { vx = kx; vy = ky; target = null; } }
        if (target) { const dx = target.x - px, dy = target.y - py, dd = Math.hypot(dx, dy); if (dd < 8) { const t = target.then; target = null; t && t(); } else { vx = dx / dd; vy = dy / dd; } }
        const sp = 380 * dt, l = Math.hypot(vx, vy) || 1, mv = Math.min(1, Math.hypot(vx, vy));
        px = clamp(px + vx / l * mv * sp, 80, sc.W - 80); py = clamp(py + vy / l * mv * sp, 220, sc.H - 20);
        if (Math.abs(vx) > 0.05) facing = vx < 0 ? -1 : 1;
        pimg.style.transform = mv > 0.05 ? `scaleX(${facing}) translateY(${Math.abs(Math.sin(now / 85)) * -7}px)` : `scaleX(${facing})`;
      } else keys = {};
      pl.style.left = px + 'px'; pl.style.top = py + 'px';
      const vw = root.clientWidth, vh = root.clientHeight;
      const tx = clamp(px - vw / 2, 0, Math.max(0, sc.W - vw)), ty = clamp(py - vh / 2 - 60, 0, Math.max(0, sc.H - vh));
      camX += (tx - camX) * Math.min(1, dt * 6); camY += (ty - camY) * Math.min(1, dt * 6);
      world.style.transform = `translate3d(${-camX}px,${-camY}px,0)`;
      nearId = null; let best = 240;
      for (const h of sc.hot) { const dd = Math.hypot(h.x - px, h.y - py); if (dd < best) { best = dd; nearId = h.id; } }
      root.querySelectorAll('[data-h]').forEach(el => el.classList.toggle('near', el.dataset.h === nearId));
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    function close() { cancelAnimationFrame(raf); clearTimeout(toastT); window.removeEventListener('keydown', kd, true); window.removeEventListener('keyup', ku, true); root.remove(); onClose && onClose(); }
    q('.bk').onclick = close;
    return { close };
  }

  // ---------- Cửa & nút trong văn phòng ----------
  const DOORS = [
    { k: 'factory', icon: '🏭', vi: 'Xưởng', en: 'Factory', x: 0, y: 330 },
    { k: 'warehouse', icon: '📦', vi: 'Kho hàng', en: 'Warehouse', x: 2352, y: 330 },
    { k: 'rivals', icon: '🤝', vi: 'Phòng đối thủ', en: 'Rivals\' room', x: 2352, y: 1180 },
  ];
  function decorate(o) {
    if (!o || o.__bzs) return; o.__bzs = true; css();
    const hud = o.querySelector('.hud'), w = o.querySelector('.w');
    DOORS.forEach(d => {
      if (hud) { const b = document.createElement('button'); b.className = 'pill'; b.style.cssText = 'font:inherit;font-weight:800;font-size:13px;cursor:pointer'; b.textContent = `${d.icon} ${tr(d.vi, d.en)}`; b.onclick = e => { e.stopPropagation(); open(d.k); }; const sk = hud.querySelector('.sw'); hud.insertBefore(b, sk || null); }
      if (w) { const el = document.createElement('div'); el.style.cssText = `position:absolute;left:${d.x}px;top:${d.y}px;width:48px;height:150px;border-radius:${d.x ? '14px 0 0 14px' : '0 14px 14px 0'};background:linear-gradient(#0f7596,#0c5a78);box-shadow:inset 0 0 0 5px rgba(255,255,255,.35),0 10px 20px rgba(0,0,0,.25);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:22px;z-index:1`;
        el.innerHTML = `<span>${d.icon}</span><span style="position:absolute;top:158px;${d.x ? 'right:0' : 'left:0'};background:#033337;color:#fff;font-size:11px;font-weight:800;padding:3px 10px;border-radius:999px;white-space:nowrap">${tr(d.vi, d.en)}</span>`;
        el.addEventListener('pointerdown', e => e.stopPropagation()); el.onclick = e => { e.stopPropagation(); open(d.k); }; w.appendChild(el); }
    });
  }
  const mo = new MutationObserver(() => { const o = document.getElementById('bzo'); if (o && !o.__bzs) setTimeout(() => decorate(o), 80); });
  const start = () => { if (document.body) mo.observe(document.body, { childList: true }); const o = document.getElementById('bzo'); if (o) decorate(o); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  window.BizonScenes = { open };
})();
