/* BizOn – phòng nhiều người qua Supabase Realtime (broadcast + presence), không cần bảng dữ liệu.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 * Viết thẳng giao thức Phoenix trên WebSocket (khỏi nạp supabase-js 100 KB cho một tính năng).
 * Kênh là kênh công khai: chỉ chuyển tiếp tin giữa những người đang mở cùng phòng, máy chủ không lưu gì.
 * Khoá dùng là khoá công khai (publishable) đã khai ở js/backend-config.js. */
export function moPhong({ url, key, phong, id, trangThai, onTin, onDanhSach, onTrangThai }) {
  const wsUrl = url.replace(/^http/, 'ws').replace(/\/$/, '') + '/realtime/v1/websocket?apikey=' + encodeURIComponent(key) + '&vsn=1.0.0';
  const topic = 'realtime:bizon-ra-khoi-' + phong;
  let ws = null, ref = 0, joinRef = null, nhip = null, lanThu = 0, dong = false, daVao = false;
  const presence = {};   // id → meta mới nhất
  const gui = (event, payload) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify({ topic, event, payload, ref: String(++ref), join_ref: joinRef })); };
  const bao = s => { try { onTrangThai && onTrangThai(s); } catch (e) {} };
  const phat = () => { try { onDanhSach && onDanhSach(Object.entries(presence).map(([k, m]) => Object.assign({ id: k }, m))); } catch (e) {} };
  function apDiff(joins, leaves) {
    for (const k in leaves || {}) delete presence[k];
    for (const k in joins || {}) { const m = joins[k].metas; if (m && m.length) presence[k] = m[m.length - 1]; }
    phat(); }
  function ketNoi() {
    if (dong) return;
    bao('dang-noi');
    try { ws = new WebSocket(wsUrl); } catch (e) { henLai(); return; }
    ws.onopen = () => {
      lanThu = 0; joinRef = String(++ref);
      ws.send(JSON.stringify({ topic, event: 'phx_join', ref: joinRef, join_ref: joinRef,
        payload: { config: { broadcast: { self: false, ack: false }, presence: { key: id } } } }));
      clearInterval(nhip); nhip = setInterval(() => { if (ws && ws.readyState === 1) ws.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(++ref) })); }, 25000);
    };
    ws.onmessage = ev => { let d; try { d = JSON.parse(ev.data); } catch (e) { return; }
      if (d.topic !== topic) return;
      if (d.event === 'phx_reply' && d.ref === joinRef) {
        if (d.payload && d.payload.status === 'ok') { daVao = true; gui('presence', { type: 'presence', event: 'track', payload: trangThai() }); bao('da-vao'); }
        else bao('loi'); return; }
      if (d.event === 'presence_state') { for (const k in presence) delete presence[k]; apDiff(d.payload, {}); return; }
      if (d.event === 'presence_diff') { apDiff(d.payload.joins, d.payload.leaves); return; }
      if (d.event === 'broadcast' && d.payload) { try { onTin && onTin(d.payload.event, d.payload.payload); } catch (e) {} } };
    ws.onclose = () => { clearInterval(nhip); daVao = false; for (const k in presence) delete presence[k]; phat(); if (!dong) henLai(); };
    ws.onerror = () => {};
  }
  function henLai() { bao('mat-ket-noi'); const cho = Math.min(15000, 1000 * Math.pow(2, lanThu++)); setTimeout(ketNoi, cho); }
  ketNoi();
  return {
    phat(event, payload) { if (daVao) gui('broadcast', { type: 'broadcast', event, payload }); },
    capNhat() { if (daVao) gui('presence', { type: 'presence', event: 'track', payload: trangThai() }); },
    danhSach: () => Object.entries(presence).map(([k, m]) => Object.assign({ id: k }, m)),
    dong() { dong = true; clearInterval(nhip); try { gui('phx_leave', {}); ws && ws.close(); } catch (e) {} },
  };
}
