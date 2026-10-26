/* Hành trình 3 bậc – đồng bộ hộ chiếu với máy chủ lớp (J7): RPC bizon_journey_get / bizon_journey_upsert qua phiên sinh viên.
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Hộ chiếu cục bộ (js/journey-store.js) vẫn là nguồn chính; máy chủ chỉ là bản sao để chơi tiếp ở máy khác và để giảng viên xem.
 * Quy tắc hợp nhất (decide): bản nào mới hơn (updatedAt) thì thắng khi cùng journeyId; khác journeyId → 'conflict', người dùng chọn.
 * Chạy trình duyệt (window.BizOnJourneySync; có thể nạp trước js/core/journey.js vì chỉ đọc BizOnJourney lúc gọi) và Node (require: decide, create).
 * Trong game: journey-link.finish() gọi sync({ pushOnly: true }) sau khi ghi bậc – chỉ khi đã có phiên sinh viên (sessionStorage
 * 'bizon-student-session' do js/student-login.js hoặc js/student-auth.js ghi); trang không nạp StudentLogin thì dùng đường dự phòng
 * gọi thẳng REST với access token còn hạn (không làm mới token). */
(function (root, factory) {
  const isNode = typeof module === 'object' && module.exports;
  const api = factory(isNode ? () => require('./core/journey.js') : () => root.BizOnJourney, root);
  if (isNode) module.exports = api;
  else root.BizOnJourneySync = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (getJ, root) {
  'use strict';
  const J = () => { const j = getJ(); if (!j) throw new Error('BizOnJourney is required'); return j; };
  const APP_VERSION = 'bizon-journey-v1';
  const SESSION_KEY = 'bizon-student-session';
  const ts = p => { const n = Date.parse(p && p.updatedAt); return Number.isFinite(n) ? n : 0; };

  // 'none' (không có gì) | 'push' (chỉ có cục bộ hoặc cục bộ mới hơn) | 'pull' (chỉ có máy chủ hoặc máy chủ mới hơn) | 'same' | 'conflict' (khác journeyId)
  function decide(local, server) {
    if (!local && !server) return 'none';
    if (local && !server) return 'push';
    if (!local && server) return 'pull';
    if (local.journeyId !== server.journeyId) return 'conflict';
    const a = ts(local), b = ts(server);
    return a === b ? 'same' : a > b ? 'push' : 'pull';
  }

  // deps: { rpc(fn, args) → Promise, store: { load(), save(p) } }. sync(opts): opts.resolve = 'push' | 'pull' khi 'conflict'.
  function create(deps) {
    const rpc = deps.rpc, store = deps.store;
    async function fetchServer(local) {
      const r = await rpc('bizon_journey_get', { p_class_code: local.classCode, p_team_name: local.teamName });
      const p = r && r.passport;
      return p && J().validatePassport(p).valid ? { passport: p, mine: r.mine !== false, updatedAt: r.updated_at } : null;
    }
    async function push(local) {
      return rpc('bizon_journey_upsert', { p_class_code: local.classCode, p_team_name: local.teamName, p_passport: local, p_app_version: APP_VERSION });
    }
    // opts.pushOnly (trong game, ngay sau khi ghi bậc): chỉ đẩy bản cục bộ lên, không bao giờ kéo về giữa ván; khác journeyId → để yên.
    async function sync(opts) {
      const o = opts || {}; const local = store.load();
      if (!local) return { action: 'none' };
      const srv = await fetchServer(local); const server = srv ? srv.passport : null;
      let d = decide(local, server);
      if (o.pushOnly) { if (d === 'conflict') return { action: 'conflict', passport: local, server }; d = 'push'; }
      if (d === 'conflict' && (o.resolve === 'push' || o.resolve === 'pull')) d = o.resolve;
      if (d === 'push') { await push(local); return { action: 'push', passport: local }; }
      if (d === 'pull') { store.save(server); return { action: 'pull', passport: server, mine: srv.mine }; }
      return { action: d, passport: local, server };
    }
    return { sync, decide, fetchServer, push };
  }

  // Bản trình duyệt: dùng kho cục bộ và phiên sinh viên của trang (StudentLogin nếu có; không thì đọc phiên và gọi REST trực tiếp).
  const browser = root && root.document ? (function () {
    const S = () => root.BizOnJourneyStore, L = () => root.StudentLogin, B = () => root.BIZON_BACKEND || {};
    const session = () => { try { const s = JSON.parse(root.sessionStorage.getItem(SESSION_KEY) || 'null'); return s && s.accessToken ? s : null; } catch (e) { return null; } };
    const available = () => { const b = B(); return !!(b.enabled && b.url && b.anonKey && S()); };
    const signedIn = () => { if (!available()) return false; if (L()) return !!L().signedIn(); const s = session(); return !!(s && s.expiresAt > Date.now()); };
    async function restRpc(fn, args) {
      const s = session(); if (!s || !(s.expiresAt > Date.now())) throw new Error('Chưa đăng nhập');
      const res = await fetch(`${B().url.replace(/\/$/, '')}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: B().anonKey, Authorization: `Bearer ${s.accessToken}` }, body: JSON.stringify(args) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data && (data.message || data.error)) || `HTTP ${res.status}`);
      return data;
    }
    const live = () => create({ rpc: (fn, args) => (L() ? L().rpc(fn, args) : restRpc(fn, args)), store: { load: () => S().load(), save: p => S().save(p) } });
    return { available, signedIn, sync: opts => live().sync(opts) };
  })() : {};

  return Object.freeze(Object.assign({ APP_VERSION, decide, create }, browser));
});
