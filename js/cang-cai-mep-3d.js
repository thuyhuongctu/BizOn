// Bật Nghiệp 3D · Khu Cảng Cái Mép – Thị Vải (specs/005-cang-cai-mep, câu chuyện 1).
// Dựng bằng khối đất sét của bizon-hq-kit.js, đặt ngoài nền trụ sở (x > 8). Chạm từng chỗ mở thẻ kiến thức VI/EN.
// Mô-đun này KHÔNG chạm luật chơi: không ghi ván, không gọi engine. Câu chuyện 2 chỉ đọc qua window.BizonPort (js/cang-cai-mep.js).
// Nguồn số liệu (tra 16/11/2026, xem specs/005-cang-cai-mep/plan.md):
//  - Tàu 24.188 TEU cập cụm cảng Cái Mép – Thị Vải tháng 3/2023, lớn nhất từng cập cảng Việt Nam (VOV, SGGP).
//  - Hơn 20 tuyến tàu mẹ đi thẳng sang châu Âu, bờ Đông và bờ Tây Hoa Kỳ (Vietnamnet).
//  - Phí lưu container/lưu bãi khoảng 75–300 USD/container/ngày sau thời gian miễn phí (biểu phí hãng tàu 2025, nhà giao nhận).
//  - Incoterms 2020: FOB và CIF đều chuyển rủi ro khi hàng đã xếp lên tàu ở cảng đi.

const CARDS = [
  { key: 'crane', icon: '🏗️', t: ['Cầu cảng nước sâu', 'Deep-water berth'],
    b: ['Cái Mép – Thị Vải là cụm cảng nước sâu ở cửa sông Thị Vải, phía đông nam TP. Hồ Chí Minh. Tàu mẹ cỡ lớn cập thẳng; cụm cảng có hơn 20 tuyến đi thẳng sang châu Âu và hai bờ nước Mỹ. Hàng không phải chuyển tải qua một cảng trung chuyển khác, nên bớt một chặng: ít ngày hơn, ít phí hơn, ít rủi ro hư hỏng hơn.',
        'Cái Mép – Thị Vải is a deep-water port cluster at the mouth of the Thị Vải river, south-east of Ho Chi Minh City. Large mother vessels call directly, and the cluster runs more than 20 direct services to Europe and both US coasts. Cargo skips a transhipment hub, so there is one leg less: fewer days, lower fees and less risk of damage.'],
    q: ['Câu hỏi cho COO: nếu bán hàng sang châu Âu, đi thẳng từ Cái Mép hay chuyển tải sẽ hợp với đơn hàng của đội hơn?', 'Question for the COO: for an order to Europe, would a direct call from Cái Mép or a transhipment route suit our team better?'] },
  { key: 'ship', icon: '🚢', t: ['Tàu container và TEU', 'Container ships and TEU'],
    b: ['Tháng 3/2023, cụm cảng Cái Mép đón một tàu 24.188 TEU – tàu container lớn nhất từng cập cảng Việt Nam. 1 TEU là một container 20 feet; container 40 feet (FEU) bằng 2 TEU. Tàu càng lớn thì chi phí chở mỗi container càng thấp (lợi thế quy mô), nhưng chỉ cảng nước sâu mới đón được.',
        'In March 2023 the Cái Mép cluster received a 24,188 TEU ship – the largest container ship ever to call at a Vietnamese port. One TEU is one 20-foot container; a 40-foot container (FEU) counts as 2 TEU. The bigger the ship, the lower the cost per container (economies of scale), but only deep-water ports can take them.'],
    q: ['Câu hỏi cho CFO: chi phí vận chuyển mỗi sản phẩm của ta thay đổi thế nào nếu đi chung container với hàng của doanh nghiệp khác (LCL)?', 'Question for the CFO: how would our shipping cost per unit change if we shared a container with other firms (LCL)?'] },
  { key: 'yard', icon: '📦', t: ['Bãi container và Incoterms', 'Container yard and Incoterms'],
    b: ['Hợp đồng ghi điều kiện giao hàng (Incoterms) để biết ai trả gì và rủi ro chuyển lúc nào. FOB – giao lên tàu: người bán lo hàng tới khi xếp lên tàu ở cảng đi; cước biển và bảo hiểm do người mua trả. CIF: người bán trả thêm cước biển và bảo hiểm tới cảng đến, nhưng rủi ro vẫn chuyển sang người mua ngay khi hàng đã lên tàu.',
        'The contract states the delivery term (Incoterms): who pays what and when the risk passes. FOB – free on board: the seller is responsible until the goods are loaded at the port of shipment; the buyer pays ocean freight and insurance. CIF: the seller also pays freight and insurance to the destination port, yet the risk still passes to the buyer once the goods are on board.'],
    q: ['Câu hỏi cho CMO: báo giá FOB hay CIF giúp khách nước ngoài so sánh giá của ta dễ hơn?', 'Question for the CMO: does an FOB or a CIF quote make our price easier for an overseas buyer to compare?'] },
  { key: 'customs', icon: '🛃', t: ['Hải quan cửa khẩu', 'Customs checkpoint'],
    b: ['Bộ hồ sơ xuất khẩu thường gồm: hợp đồng và hóa đơn thương mại, phiếu đóng gói, vận đơn, mã HS đúng, giấy chứng nhận xuất xứ (C/O) để hưởng thuế ưu đãi theo FTA, và giấy kiểm dịch với nông sản, gỗ. Khai sai mã HS hay thiếu C/O, lô hàng có thể bị giữ lại kiểm tra và lỡ chuyến tàu.',
        'An export file usually includes: the contract and commercial invoice, packing list, bill of lading, the correct HS code, a certificate of origin (C/O) to claim FTA preferential tariffs, and phytosanitary certificates for farm or wood products. A wrong HS code or a missing C/O can hold the shipment for inspection and miss the vessel.'],
    q: ['Câu hỏi cho Thư ký: đội đã ghi đủ hồ sơ nào trong nhật ký trước khi chốt đơn xuất khẩu?', 'Question for the Secretary: which documents has the team logged before confirming an export order?'] },
  { key: 'jam', icon: '⏳', t: ['Khi cảng tắc', 'When the port is congested'],
    b: ['Tàu phải chờ cầu; container nằm bãi quá thời gian miễn phí thì bị tính phí lưu container và lưu bãi, theo biểu phí các hãng tàu thường khoảng 75–300 USD mỗi container mỗi ngày. Hàng giao trễ, khách mất lòng tin. Trong Bật Nghiệp, biến cố hậu cần ở vụ 5 làm giá thành tăng 25% và chỉ giao được 85% đơn.',
        'Ships wait for a berth; containers left in the yard beyond the free time incur demurrage and detention, which carrier tariffs typically set at about USD 75–300 per container per day. Deliveries run late and customers lose trust. In Bật Nghiệp, the round-5 logistics event raises unit cost by 25% and cuts order fulfilment to 85%.'],
    q: ['Câu hỏi cho CEO: nếu vụ 5 cảng tắc, đội chấp nhận tốn thêm chi phí hay chấp nhận giao thiếu hàng?', 'Question for the CEO: if the port jams in round 5, would the team rather pay more or deliver less?'] },
];
const SRC = ['Nguồn: VOV, SGGP (2023), Vietnamnet; biểu phí lưu container của hãng tàu (2025); Incoterms 2020.', 'Sources: VOV, SGGP (2023), Vietnamnet; carrier demurrage & detention tariffs (2025); Incoterms 2020.'];

export function buildPort(ctx) {
  const { THREE, scene, hq, camera, canvas, T } = ctx;
  const { B, Cy, G, mat, panel, TX } = hq;
  const port = G('cai_mep_port', scene, 12.6, 0, 0.4);
  const decor = [];
  // Nền cảng (bê tông) và mặt nước phía ngoài
  B(port, 'cm_quay', 4.6, 0.45, 11.6, mat(0x8f9aa0, 0.95), -0.9, -0.5, 0, 0.05);
  B(port, 'cm_quay_edge', 0.18, 0.12, 11.6, mat(0xf2c14e, 0.8), 1.33, -0.05, 0, 0.02);
  B(port, 'cm_water', 3.4, 0.3, 12.6, mat(0x3f8fb0, 0.3), 3.15, -0.62, 0, 0.05);
  // Tàu container dọc cầu cảng
  const ship = G('cm_ship', port, 3.05, -0.36, -0.4);
  B(ship, 'cm_hull_low', 1.9, 0.38, 8.2, mat(0xb4462f, 0.8), 0, 0, 0, 0.12);
  B(ship, 'cm_hull', 1.9, 0.5, 8.2, mat(0x24384f, 0.8), 0, 0.38, 0, 0.12);
  B(ship, 'cm_bridge', 1.5, 1.0, 0.9, mat(0xf3eee4, 0.9), 0, 0.88, -3.45, 0.05);
  B(ship, 'cm_funnel', 0.45, 0.5, 0.4, mat(0xe0623a, 0.8), 0, 1.88, -3.55, 0.04);
  const cCols = [0xc8643a, 0x2f8a8c, 0xe2b04a, 0x3f78c0, 0x8a5aa0, 0x6f8a60];
  for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < (i % 3 === 1 ? 2 : 3); k++) {
    const m = B(ship, 'cm_box', 0.78, 0.36, 1.0, mat(cCols[(i + j * 2 + k) % cCols.length], 0.85), j ? 0.4 : -0.4, 0.89 + k * 0.37, -2.4 + i * 1.08, 0.03);
    if (k > 0) decor.push(m);
  }
  // Cần cẩu bờ (hai chân, xà ngang vươn ra tàu)
  const crane = G('cm_crane', port, 0.6, 0, -1.6);
  const cm = mat(0x2c6fb0, 0.6), cy = mat(0xf2c14e, 0.7);
  for (const z of [-0.55, 0.55]) { B(crane, 'cm_leg', 0.16, 3.2, 0.16, cm, -0.5, 0, z, 0.02); B(crane, 'cm_leg', 0.16, 3.2, 0.16, cm, 0.6, 0, z, 0.02); }
  B(crane, 'cm_beam', 4.4, 0.22, 0.3, cy, 1.4, 3.2, 0, 0.03);
  B(crane, 'cm_cab', 0.5, 0.35, 0.5, mat(0xf3eee4, 0.9), 2.6, 2.85, 0, 0.04);
  Cy(crane, 'cm_cable', 0.015, 0.015, 1.4, mat(0x333333, 0.6), 2.6, 1.45, 0, 6);
  B(crane, 'cm_spreader', 0.8, 0.12, 0.4, cy, 2.6, 1.33, 0, 0.02);
  // Bãi container
  const yard = G('cm_yard', port, -1.6, 0, 1.9);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) for (let k = 0; k < 3 - ((r + c) % 2); k++) {
    const m = B(yard, 'cm_yard_box', 0.8, 0.38, 1.1, mat(cCols[(r * 2 + c + k) % cCols.length], 0.85), c * 0.95 - 0.45, k * 0.39, r * 1.25 - 1.25, 0.03);
    if (k > 0) decor.push(m);
  }
  // Trạm hải quan và rào chắn
  const customs = G('cm_customs', port, -1.8, 0, -4.4);
  B(customs, 'cm_house', 1.5, 0.95, 1.1, mat(0xf2d98c, 0.9), 0, 0, 0, 0.05);
  B(customs, 'cm_roof', 1.7, 0.16, 1.3, mat(0xc0392b, 0.8), 0, 0.95, 0, 0.04);
  B(customs, 'cm_door', 0.36, 0.6, 0.04, mat(0x2c6fb0, 0.7), 0, 0, 0.56, 0.01);
  const gate = G('cm_gate', customs, 1.2, 0, 0.9);
  Cy(gate, 'cm_gate_post', 0.06, 0.07, 0.75, mat(0x555555, 0.6), 0, 0, 0, 10);
  B(gate, 'cm_gate_arm', 1.5, 0.08, 0.08, mat(0xe74c3c, 0.6), 0.75, 0.66, 0, 0.02);
  // Biển tên cảng và bảng «Khi cảng tắc»
  const name = G('cm_sign', port, -1.2, 0, 4.9, -0.25);
  Cy(name, 'cm_sign_post', 0.04, 0.04, 1.3, mat(0x6e4428, 0.9), -0.9, 0, 0, 6); Cy(name, 'cm_sign_post', 0.04, 0.04, 1.3, mat(0x6e4428, 0.9), 0.9, 0, 0, 6);
  panel(name, 'cm_sign_face', 2.2, 0.55, TX.sign('CẢNG CÁI MÉP – THỊ VẢI', '#1f6f8a', '#fff3e0', 'CAI MEP – THI VAI PORT'), 0, 1.25, 0.05);
  const jam = G('cm_jam', port, -0.3, 0, -5.3, 0.3);
  Cy(jam, 'cm_jam_post', 0.04, 0.04, 1.1, mat(0x6e4428, 0.9), 0, 0, 0, 6);
  panel(jam, 'cm_jam_face', 1.1, 0.55, TX.sign('⏳ CẢNG TẮC?', '#e2b04a', '#2c3552', 'PORT JAM?'), 0, 1.2, 0.05);
  port.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  // Vùng chạm vô hình (đủ lớn trên điện thoại), mỗi vùng gắn một thẻ
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hits = {};
  const addHit = (key, parent, r, x, y, z) => { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), hitMat); s.position.set(x, y, z); s.userData.cmKey = key; s.name = 'cm_hit_' + key; parent.add(s); hits[key] = s; };
  addHit('crane', crane, 1.0, 1.0, 2.6, 0); addHit('ship', ship, 1.3, 0, 1.0, 1.2); addHit('yard', yard, 1.2, 0, 0.6, 0);
  addHit('customs', customs, 1.0, 0.2, 0.6, 0.2); addHit('jam', jam, 0.7, 0, 1.15, 0.1);
  for (const [k, g] of [['crane', crane], ['ship', ship], ['yard', yard], ['customs', customs], ['jam', jam], ['jam', name]]) g.userData.cmKey ??= k;

  // Thẻ kiến thức (DOM), ẩn khi ở phòng riêng, đấu trường hay màn đăng nhập
  if (!document.getElementById('cmStyle')) {
    const st = document.createElement('style'); st.id = 'cmStyle';
    st.textContent = '#cmCard{box-sizing:border-box;position:fixed;z-index:7;left:12px;bottom:64px;width:min(360px,calc(100vw - 24px));max-height:min(62vh,520px);overflow:auto;background:#fbf6ee;color:#2c3552;border:3px solid #e6d6bf;border-radius:18px;padding:12px 14px 12px;box-shadow:0 5px 0 #d9c5a8;font:14px/1.5 system-ui,sans-serif}'
      + '#cmCard[hidden]{display:none}#cmCard h4{margin:0 48px 6px 0;font-size:16px;color:#1f6f8a}#cmCard p{margin:0 0 8px}#cmCard .cm-q{background:#eef6f6;border-radius:12px;padding:6px 9px}#cmCard small{display:block;color:#6b5b47;font-size:12px}'
      + '#cmCard .cm-go{display:block;width:100%;min-height:44px;margin:4px 0 8px;border:0;border-radius:14px;background:#1f6f8a;color:#fff;font:inherit;font-weight:800;cursor:pointer}'
      + '#cmCard .cm-x{position:absolute;top:6px;right:6px;width:44px;height:44px;border:0;border-radius:50%;background:#efe3cf;color:#2c3552;font-size:18px;cursor:pointer}'
      + 'body.room #cmCard,body.arena #cmCard,body.login3d #cmCard,body.evt #cmCard{display:none!important}';
    document.head.appendChild(st);
  }
  const card = document.createElement('section'); card.id = 'cmCard'; card.hidden = true; card.setAttribute('role', 'dialog'); card.setAttribute('aria-live', 'polite');
  document.body.appendChild(card);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const L = a => T(a[0], a[1]);
  // Câu chuyện 2: ở vụ 5 (biến cố hậu cần), thẻ hải quan có nút «Ra quyết định» mở thẳng ô lựa chọn ở cảng trong bảng
  // Quyết định của game.html (iframe #gf), qua cầu nối window.__openTab có sẵn. Mô-đun này chỉ ĐỌC trạng thái qua BizonPort.
  const portApi = () => { try { const f = document.getElementById('gf'), w = f && f.contentWindow; return (w && w.BizonPort) || null; } catch (e) { return null; } };
  const portOpen = () => { const P = portApi(); try { return !!(P && P.now && P.now()); } catch (e) { return false; } };
  function open(key) {
    const c = CARDS.find(x => x.key === key); if (!c) return false;
    card.dataset.k = key;
    const go = key === 'customs' && portOpen();
    card.innerHTML = `<button type="button" class="cm-x" aria-label="${esc(T('Đóng', 'Close'))}">✕</button><h4>${c.icon} ${esc(L(c.t))}</h4><p>${esc(L(c.b))}</p>`
      + (go ? `<button type="button" class="cm-go">${esc(T('🚢 Ra quyết định: xử lý hàng kẹt ở Cái Mép', '🚢 Make the decision: cargo stuck at Cái Mép'))}</button>` : '')
      + `<p class="cm-q">${esc(L(c.q))}</p><small>${esc(L(SRC))}</small>`;
    card.querySelector('.cm-x').onclick = close;
    const b = card.querySelector('.cm-go');
    if (b) b.onclick = () => { close(); if (typeof window.__openTab === 'function') window.__openTab('decisions'); setTimeout(() => { const P = portApi(); if (P && P.focus) P.focus(); }, 450); };
    card.hidden = false; return true;
  }
  function close() { card.hidden = true; delete card.dataset.k; }
  const relang = () => { if (!card.hidden && card.dataset.k) open(card.dataset.k); };

  // Chạm: chỉ khi vật gần nhất dưới ngón tay thuộc khu cảng
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
  canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    const b = document.body.classList; if (b.contains('room') || b.contains('arena') || b.contains('login3d')) return;
    ndc.set(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1); ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(scene.children, true)[0]; if (!hit) return;
    let o = hit.object; while (o && !o.userData.cmKey) o = o.parent;
    if (o) open(o.userData.cmKey);
  });
  const lb = document.getElementById('langBtn'); if (lb) lb.addEventListener('click', () => setTimeout(relang, 0));
  addEventListener('bizon:langchange', () => setTimeout(relang, 0));

  const api = { port, hits, camera, keys: CARDS.map(c => c.key), open, close, relang };
  window.__caiMep = api; // hỗ trợ kiểm thử, không ảnh hưởng game
  return { port, decor, api };
}
