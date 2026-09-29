/* BizOn — API giảng viên (Supabase Auth + RPC). Dùng chung cho Trang Giảng viên.
 * Nếu backend tắt hoặc chọn "Dùng thử", chạy dữ liệu mẫu trong bộ nhớ (DEMO-2026). */
(function () {
  const cfg = () => window.BIZON_BACKEND || {};
  const base = () => (cfg().url || '').replace(/\/$/, '');
  const SKEY = 'bizon-instructor-session';
  let session = null, demo = false;
  try { session = JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch (e) {}
  const saveS = s => { session = s; try { s ? localStorage.setItem(SKEY, JSON.stringify(s)) : localStorage.removeItem(SKEY); } catch (e) {} };

  async function auth(path, body) {
    const r = await fetch(base() + '/auth/v1/' + path, { method: 'POST', headers: { apikey: cfg().anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error_description || j.msg || j.message || ('Lỗi đăng nhập ' + r.status));
    return j;
  }
  async function authPut(path, tok, body) {
    const r = await fetch(base() + '/auth/v1/' + path, { method: 'PUT', headers: { apikey: cfg().anonKey, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error_description || j.msg || j.message || ('Lỗi ' + r.status));
    return j;
  }
  const keep = j => saveS({ access: j.access_token, refresh: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, email: j.user && j.user.email });
  async function token() {
    if (!session) throw new Error('Chưa đăng nhập.');
    if (Date.now() > session.exp - 60000) keep(await auth('token?grant_type=refresh_token', { refresh_token: session.refresh }));
    return session.access;
  }
  async function rpc(fn, args) {
    const r = await fetch(base() + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { apikey: cfg().anonKey, Authorization: 'Bearer ' + await token(), 'Content-Type': 'application/json' }, body: JSON.stringify(args || {}) });
    const j = await r.json().catch(() => null);
    if (!r.ok) throw new Error((j && (j.message || j.hint)) || ('Lỗi máy chủ ' + r.status));
    return j;
  }

  // ---------- dữ liệu mẫu ----------
  const D = { classes: [{ class_code: 'DEMO-2026', created_at: new Date().toISOString() }], controls: { locked_round: null, forced_event: null, message: '' }, grants: [], scores: {}, subs: [] };
  (function seed() {
    const T = [['Đội Rồng Vàng', 1.0], ['Đội Sông Hậu', 0.9], ['Đội Miệt Vườn', 0.8], ['Đội Phù Sa', 1.1], ['Đội Gốm Đỏ', 0.7]];
    T.forEach(([n, k], ti) => { const rounds = 6 - (ti % 3); for (let r = 1; r <= rounds; r++) {
      const price = 140 + ((ti * 7 + r * 5) % 40), mkt = 50 + ((ti * 11 + r * 9) % 60), share = +(16 + k * r * 1.6 + (ti % 2 ? -1.2 : 1.1)).toFixed(1), np = +(k * 60 + r * 18 - (ti === 4 ? 70 : 0)).toFixed(1);
      D.subs.push({ team_name: n, round_number: r, created_at: new Date(Date.now() - (60 - r * 8 - ti) * 60000).toISOString(),
        result_json: { share, netProfit: np, revenue: Math.round((1300 + r * 220) * k), balance: Math.round(500 + r * 60 * k), win: share > 20 && np > 0,
          decision: { price, marketing: mkt, production: 900 + r * 120, rd: 20 + ti * 4, workers: 8 + r, training: 5 + ti, funding: r % 2 ? 'equity' : 'loan' } } }); } });
  })();
  const dRows = code => D.subs.filter(s => code === 'DEMO-2026');
  const MIG = 'Cần chạy migration supabase/migrations/20260928000000_class_controls.sql trong Supabase SQL Editor để dùng Khóa vòng / Cấp vốn / Biến cố / Chấm điểm.';
  const missing = e => /Could not find the function|PGRST202|schema cache/i.test((e && e.message) || '');
  const guard = async p => { try { return await p; } catch (e) { if (missing(e)) { api.needsMigration = true; throw new Error(MIG); } throw e; } };

  const ADMIN_EMAILS = ['thuyhuongctu@gmail.com', 'patu@ctu.edu.vn'];
  var api = {
    get demo() { return demo; },
    get email() { return demo ? 'khach@demo' : session && session.email; },
    get signedIn() { return demo || !!session; },
    get backendOn() { return !!(cfg().enabled && cfg().url && cfg().anonKey); },
    get isAdmin() { return ADMIN_EMAILS.includes(String(api.email || '').toLowerCase()); },
    useDemo() { demo = true; },
    async signIn(email, password) { demo = false; keep(await auth('token?grant_type=password', { email, password })); },
    async signUp(email, password) { const j = await auth('signup', { email, password }); if (j.access_token) keep(j); return !!j.access_token; },
    signOut() { demo = false; saveS(null); },
    async resetPassword(email) { return auth('recover?redirect_to=' + encodeURIComponent(location.href.split('#')[0]), { email }); },
    async completeRecovery(recoveryToken, password) { return authPut('user', recoveryToken, { password }); },
    async myClasses() { return demo ? D.classes : rpc('bizon_my_classes'); },
    async claimClass(code) { code = String(code || '').trim().toUpperCase(); if (demo) { if (!D.classes.some(c => c.class_code === code)) D.classes.unshift({ class_code: code, created_at: new Date().toISOString() }); return true; } return rpc('bizon_claim_class', { p_class_code: code }); },
    async deleteClass(code) { code = String(code || '').trim().toUpperCase(); if (demo) { const i = D.classes.findIndex(c => c.class_code === code); if (i >= 0) D.classes.splice(i, 1); return true; } return rpc('bizon_delete_class', { p_class_code: code }); },
    async adminAllClasses() { return demo ? [] : rpc('bizon_admin_all_classes'); },
    needsMigration: false, migrationNote: MIG,
    async submissions(code) { if (demo) return dRows(code);
      try { return await rpc('bizon_submissions_v2', { p_class_code: code }); }
      catch (e) { if (!missing(e)) throw e; api.needsMigration = true;
        const rows = await rpc('bizon_feed_v2', { p_class_code: code, p_limit: 100 }) || [];
        const seen = {}; return rows.filter(r => { const k = r.team_name + '#' + r.round_number; if (seen[k]) return false; seen[k] = 1; return true; })
          .map(r => ({ team_name: r.team_name, round_number: r.round_number, created_at: r.created_at, result_json: { share: +r.share || 0, netProfit: +r.net_profit || 0 } })); } },
    async state(code) { if (demo) return { controls: D.controls, grants: D.grants, scores: Object.values(D.scores) };
      try { return (await rpc('bizon_class_state_v2', { p_class_code: code })) || {}; } catch (e) { if (missing(e)) { api.needsMigration = true; return {}; } throw e; } },
    async setControls(code, c) { if (demo) { Object.assign(D.controls, c); return true; }
      return guard(rpc('bizon_set_controls', { p_class_code: code, p_locked_round: c.locked_round ?? null, p_forced_event: c.forced_event || '', p_forced_event_round: c.forced_event_round ?? null, p_message: c.message || '', p_exam_started_at: c.exam_started_at ?? null })); },
    async grant(code, team, amount, reason) { if (demo) { D.grants.unshift({ team_name: team, amount, reason, created_at: new Date().toISOString() }); return true; } return guard(rpc('bizon_grant', { p_class_code: code, p_team_name: team, p_amount: amount, p_reason: reason || '' })); },
    async saveScore(code, team, reasoning, teamwork, note) { if (demo) { D.scores[team] = { team_name: team, reasoning, teamwork, note }; return true; } return guard(rpc('bizon_save_score', { p_class_code: code, p_team_name: team, p_reasoning: reasoning, p_teamwork: teamwork, p_note: note || '' })); },
    async memberLog(code) { if (demo) return []; try { return (await rpc('bizon_member_log', { p_class_code: code })) || []; } catch (e) { if (missing(e)) return []; throw e; } },
    async bpResults(code) { if (demo) return []; try { return (await rpc('bizon_bp_results', { p_class_code: code })) || []; } catch (e) { if (missing(e)) return []; throw e; } },
  };
  window.BizOnInstructor = api;
})();
