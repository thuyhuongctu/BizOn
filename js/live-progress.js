/* BizOn – Gửi tiến độ từng vụ cho Màn hình lớp học (migration 20261103000000_live_progress.sql).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Game gọi sau mỗi vụ / tuần / quý:
 *   BizOnLive.report({ game: 'bps' | 'hcth' | 'hcsr', round, roundsTotal, score, stage, finished, team, classCode, detail })
 * Chỉ gửi khi biết MÃ LỚP và sinh viên ĐÃ ĐĂNG NHẬP email trường; thiếu một trong hai thì im lặng bỏ qua.
 * Không bao giờ làm hỏng game: mọi lỗi mạng chỉ ghi console.warn.
 *
 * Mã lớp lấy theo thứ tự: tham số classCode → ?lop= trên URL (giảng viên phát đường dẫn, được nhớ lại) → hộ chiếu Hành trình
 * → mã lớp đã dùng trong game (bps-class / bp-class). Khi URL có ?lop=, góc dưới trái hiện một nhãn nhỏ cho biết đã gửi
 * tiến độ hay cần đăng nhập (nút mở ô đăng nhập của js/student-login.js nếu trang có nạp). */
(function (root) {
  'use strict';
  const KEY = 'bizon-live-class', SESSION_KEY = 'bizon-student-session', GAMES = ['bps', 'hcth', 'hcsr'];
  const GAME_CLASS_KEY = { bps: 'bps-class', hcth: 'bp-class', hcsr: null };
  const get = k => { try { return root.localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  const set = (k, v) => { try { root.localStorage.setItem(k, v); } catch (e) {} };
  const clean = (v, n) => String(v == null ? '' : v).replace(/[<>&"]/g, '').trim().slice(0, n);
  const code = v => { const c = clean(v, 40).toUpperCase(); return /^[A-Z0-9_-]{3,40}$/.test(c) ? c : ''; };
  const lang = () => { try { return typeof root.clayCurrentLang === 'function' ? root.clayCurrentLang() : (get('bizon-lang') === 'en' ? 'en' : 'vi'); } catch (e) { return 'vi'; } };
  const T = (vi, en) => (lang() === 'en' ? en : vi);

  let urlClass = '';
  try { urlClass = code(new URLSearchParams(root.location.search).get('lop')); if (urlClass) set(KEY, urlClass); } catch (e) {}

  function passport() { try { return root.BizOnJourneyStore && root.BizOnJourneyStore.load ? root.BizOnJourneyStore.load() : null; } catch (e) { return null; } }
  function classFor(game, explicit) {
    const p = passport();
    return code(explicit) || urlClass || code(p && p.classCode) || code(GAME_CLASS_KEY[game] ? get(GAME_CLASS_KEY[game]) : '') || code(get(KEY));
  }
  function teamFor(explicit) { const p = passport(); return clean(explicit, 60) || clean(p && p.teamName, 60); }
  function session() {
    try { const s = JSON.parse(root.sessionStorage.getItem(SESSION_KEY) || 'null'); return s && s.accessToken && s.expiresAt > Date.now() ? s : null; } catch (e) { return null; }
  }
  function signedIn() { return !!((root.StudentLogin && root.StudentLogin.signedIn && root.StudentLogin.signedIn()) || session()); }
  async function call(args) {
    if (root.StudentLogin && root.StudentLogin.signedIn && root.StudentLogin.signedIn()) return root.StudentLogin.rpc('bizon_live_progress_upsert', args);
    const s = session(), c = root.BIZON_BACKEND || {};
    if (!s || !c.url || !c.anonKey) throw new Error('no session');
    const r = await root.fetch(c.url.replace(/\/$/, '') + '/rest/v1/rpc/bizon_live_progress_upsert', {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: c.anonKey, Authorization: 'Bearer ' + s.accessToken }, body: JSON.stringify(args) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json().catch(() => null);
  }

  let last = '', state = 'idle';
  async function report(o) {
    o = o || {};
    const c = root.BIZON_BACKEND || {};
    if (!c.enabled || !c.url || String(c.url).includes('YOUR-PROJECT')) return 'skip:backend';
    if (!GAMES.includes(o.game)) return 'skip:game';
    const total = Math.max(1, Math.min(24, Math.round(+o.roundsTotal || 0)));
    const round = Math.max(0, Math.min(total, Math.round(+o.round || 0)));
    const cls = classFor(o.game, o.classCode);
    if (!cls) return 'skip:no-class';
    if (!signedIn()) { state = 'login'; chip(cls); return 'skip:no-login'; }
    const args = { p_class_code: cls, p_game: o.game, p_team_name: teamFor(o.team), p_round: round, p_rounds_total: total,
      p_score: Number.isFinite(+o.score) ? Math.round(+o.score * 10) / 10 : null,
      p_stage: Number.isInteger(o.stage) && o.stage >= 0 && o.stage <= 7 ? o.stage : null,
      p_finished: !!o.finished, p_detail: o.detail && typeof o.detail === 'object' ? o.detail : null };
    const sig = JSON.stringify([cls, o.game, round, total, args.p_score, args.p_finished]);
    if (sig === last) return 'skip:same';
    try { await call(args); last = sig; state = 'sent'; chip(cls, round, total); return 'sent'; }
    catch (e) { state = 'error'; chip(cls); try { console.warn('BizOnLive:', e && e.message); } catch (x) {} return 'error'; }
  }

  // Nhãn nhỏ góc dưới trái, chỉ khi giảng viên phát đường dẫn có ?lop=
  let el = null;
  function chip(cls, round, total) {
    if (!urlClass || !root.document || !root.document.body) return;
    if (!el) {
      el = root.document.createElement('div'); el.id = 'bz-live-chip'; el.setAttribute('role', 'status');
      el.style.cssText = 'position:fixed;left:10px;bottom:10px;z-index:2147483000;display:flex;align-items:center;gap:8px;max-width:calc(100vw - 20px);padding:7px 10px 7px 12px;border-radius:999px;background:rgba(255,251,244,.96);color:#033337;font:700 12.5px/1.3 "Be Vietnam Pro",system-ui,sans-serif;box-shadow:0 8px 18px -8px rgba(60,40,20,.45)';
      root.document.body.appendChild(el);
    }
    const msg = state === 'sent' ? T('📡 Lớp ' + cls + ' · đã gửi vụ ' + round + '/' + total, '📡 Class ' + cls + ' · sent round ' + round + '/' + total)
      : state === 'error' ? T('📡 Lớp ' + cls + ' · chưa gửi được tiến độ, sẽ thử lại vụ sau', '📡 Class ' + cls + ' · could not send progress, will retry next round')
      : T('📡 Lớp ' + cls + ' · đăng nhập email trường để giảng viên thấy tiến độ', '📡 Class ' + cls + ' · sign in with your school email so the instructor sees your progress');
    el.replaceChildren(Object.assign(root.document.createElement('span'), { textContent: msg }));
    if (state === 'login' && root.StudentLogin && root.StudentLogin.mount) {
      const b = Object.assign(root.document.createElement('button'), { type: 'button', textContent: T('Đăng nhập', 'Sign in') });
      b.style.cssText = 'border:0;border-radius:999px;padding:5px 10px;background:#FDA127;color:#14231F;font:800 12px "Be Vietnam Pro",system-ui,sans-serif;cursor:pointer';
      b.addEventListener('click', () => {
        let box = root.document.getElementById('bz-live-login');
        if (!box) { box = root.document.createElement('div'); box.id = 'bz-live-login';
          box.style.cssText = 'position:fixed;left:10px;bottom:52px;z-index:2147483000;width:min(360px,calc(100vw - 20px));padding:12px;border-radius:18px;background:#FFFBF4;color:#033337;box-shadow:0 14px 28px -12px rgba(60,40,20,.5)';
          root.document.body.appendChild(box); root.StudentLogin.mount(box); }
        else box.hidden = !box.hidden;
      });
      el.appendChild(b);
    }
    const x = Object.assign(root.document.createElement('button'), { type: 'button', textContent: '×' });
    x.setAttribute('aria-label', T('Ẩn', 'Hide'));
    x.style.cssText = 'border:0;background:transparent;color:inherit;font:800 15px system-ui,sans-serif;cursor:pointer;padding:0 2px';
    x.addEventListener('click', () => { el.hidden = true; });
    el.appendChild(x);
  }
  function init() { const cls = urlClass; if (cls && !signedIn()) { state = 'login'; chip(cls); } }
  if (root.document) { if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', init); else init(); }

  root.BizOnLive = { report, classFor, teamFor, signedIn };
})(typeof window !== 'undefined' ? window : globalThis);
