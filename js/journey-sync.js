/* Hành trình 3 bậc – đồng bộ hộ chiếu với máy chủ lớp (J7): RPC bizon_journey_get / bizon_journey_upsert qua phiên sinh viên.
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Hộ chiếu cục bộ (js/journey-store.js) vẫn là nguồn chính; máy chủ chỉ là bản sao để chơi tiếp ở máy khác và để giảng viên xem.
 * Quy tắc hợp nhất (decide): bản nào mới hơn (updatedAt) thì thắng khi cùng journeyId; khác journeyId → 'conflict', người dùng chọn.
 * Chạy trình duyệt (window.BizOnJourneySync, cần window.StudentLogin + BIZON_BACKEND) và Node (require: decide, create). */
(function (root, factory) {
  const J = typeof module === 'object' && module.exports ? require('./core/journey.js') : root.BizOnJourney;
  const api = factory(J, root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnJourneySync = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (J, root) {
  'use strict';
  if (!J) throw new Error('BizOnJourney is required');
  const APP_VERSION = 'bizon-journey-v1';
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
      return p && J.validatePassport(p).valid ? { passport: p, mine: r.mine !== false, updatedAt: r.updated_at } : null;
    }
    async function push(local) {
      return rpc('bizon_journey_upsert', { p_class_code: local.classCode, p_team_name: local.teamName, p_passport: local, p_app_version: APP_VERSION });
    }
    async function sync(opts) {
      const o = opts || {}; const local = store.load();
      if (!local) return { action: 'none' };
      const srv = await fetchServer(local); const server = srv ? srv.passport : null;
      let d = decide(local, server);
      if (d === 'conflict' && (o.resolve === 'push' || o.resolve === 'pull')) d = o.resolve;
      if (d === 'push') { await push(local); return { action: 'push', passport: local }; }
      if (d === 'pull') { store.save(server); return { action: 'pull', passport: server, mine: srv.mine }; }
      return { action: d, passport: local, server };
    }
    return { sync, decide, fetchServer, push };
  }

  // Bản trình duyệt: dùng kho cục bộ và phiên sinh viên của trang.
  const browser = root && root.document ? (function () {
    const S = () => root.BizOnJourneyStore, L = () => root.StudentLogin;
    const available = () => { const b = root.BIZON_BACKEND; return !!(b && b.enabled && b.url && b.anonKey && L() && S()); };
    const signedIn = () => available() && !!L().signedIn();
    const live = () => create({ rpc: (fn, args) => L().rpc(fn, args), store: { load: () => S().load(), save: p => S().save(p) } });
    return { available, signedIn, sync: opts => live().sync(opts) };
  })() : {};

  return Object.freeze(Object.assign({ APP_VERSION, decide, create }, browser));
});
