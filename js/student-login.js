/* BizOn – Tiện ích đăng nhập sinh viên thật dùng chung cho các game nộp điểm
 * một lần (Hộ Chiếu Mini, Bến Phù Sa) – khác với js/student-auth.js (dành
 * riêng cho Bật Nghiệp, có thêm bước "tham gia đội"/lưu tiến trình).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * Cùng một Supabase Auth với Bật Nghiệp (email trường – @student.ctu.edu.vn hoặc trường đối tác – + mật
 * khẩu, gọi thẳng REST GoTrue, không SDK) và CÙNG khóa sessionStorage
 * ('bizon-student-session') nên một sinh viên đã đăng nhập ở game.html rồi
 * mở Hộ Chiếu Mini/Bến Phù Sa trong cùng tab/phiên trình duyệt sẽ thấy
 * mình đã đăng nhập sẵn, không phải gõ lại mật khẩu.
 *
 * API: window.StudentLogin.mount(container, {onChange}) – vẽ UI đăng nhập
 * gọn vào container; .getSession() – phiên hiện tại hoặc null nếu hết hạn/
 * chưa đăng nhập; .token() – access token còn hạn (tự làm mới bằng refresh
 * token khi hết hạn, null nếu chưa đăng nhập); .rpc(fn, args) – gọi RPC
 * xác thực, báo lỗi rõ nếu chưa đăng nhập.
 * Từ 10/2026 nộp kết quả về lớp BẮT BUỘC đăng nhập (migration
 * 20261023000000_require_student_login.sql): không đăng nhập vẫn chơi được,
 * nhưng kết quả chỉ nằm trên máy. */
(function () {
  'use strict';
  const SESSION_KEY = 'bizon-student-session';
  const cfg = () => window.BIZON_BACKEND || {};
  let session = null;

  function loadSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      // Hết hạn nhưng còn refresh token thì giữ lại để token() làm mới.
      if (s && s.accessToken && (s.expiresAt > Date.now() || s.refreshToken)) return s;
      sessionStorage.removeItem(SESSION_KEY);
    } catch (_) {}
    return null;
  }
  function saveSession(s) {
    try {
      if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch (_) {}
  }
  session = loadSession();

  async function authRequest(path, body) {
    const backend = cfg();
    if (!backend.url || !backend.anonKey) throw new Error('Backend chưa được cấu hình');
    const res = await fetch(`${backend.url.replace(/\/$/, '')}/auth/v1/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: backend.anonKey },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error_description || data.msg || data.error || `HTTP ${res.status}`);
    return data;
  }
  function applyAuthResponse(data, email) {
    if (!data.access_token) throw new Error('Máy chủ không trả về phiên đăng nhập hợp lệ.');
    session = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || (session && session.refreshToken) || null,
      email: (data.user && data.user.email) || email,
      expiresAt: Date.now() + (Number(data.expires_in || 3600) - 30) * 1000,
    };
    saveSession(session);
    return session;
  }

  // Access token còn hạn; hết hạn thì đổi refresh token lấy phiên mới (buổi học
  // dài hơn 1 giờ vẫn nộp được). Không làm mới được thì coi như đăng xuất.
  let refreshing = null;
  async function token() {
    const s = getSession();
    if (!s) return null;
    if (s.expiresAt > Date.now()) return s.accessToken;
    if (!s.refreshToken) { session = null; saveSession(null); return null; }
    if (!refreshing) {
      refreshing = authRequest('token?grant_type=refresh_token', { refresh_token: s.refreshToken })
        .then(data => applyAuthResponse(data, s.email).accessToken)
        .catch(() => { session = null; saveSession(null); return null; })
        .finally(() => { refreshing = null; });
    }
    return refreshing;
  }
  // Tên miền email sinh viên được nộp bài: CTU + trường đối tác quản trị thêm trên máy chủ
  // (bảng student_email_domains). Chỉ để báo lỗi sớm trên trang; máy chủ vẫn tự kiểm.
  let domains = ['student.ctu.edu.vn'];
  (async () => {
    try {
      const c = cfg();
      if (!c.enabled || !c.url || !c.anonKey) return;
      const res = await fetch(`${c.url.replace(/\/$/, '')}/rest/v1/rpc/bizon_student_domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: c.anonKey, Authorization: `Bearer ${c.anonKey}` },
        body: '{}',
      });
      const d = res.ok ? await res.json() : null;
      if (Array.isArray(d) && d.length) domains = d.map(x => String(x).toLowerCase());
    } catch (_) {}
  })();
  const isStudentEmail = e => {
    const m = /^[^@\s]+@([^@\s]+)$/.exec(String(e || '').trim().toLowerCase());
    return !!m && domains.includes(m[1]);
  };
  // Tiếng Anh cho mọi ngôn ngữ không phải tiếng Việt (vd bản Indonesia của Hộ Chiếu Mini).
  const EN = () => !/^vi/i.test(document.documentElement.lang || 'vi');
  const TT = (vi, en) => (EN() ? en : vi);

  async function rpc(fn, args) {
    const backend = cfg();
    if (!backend.url || !backend.anonKey) throw new Error('Backend chưa được cấu hình');
    const t = await token();
    if (!t) throw new Error(TT('Chưa đăng nhập', 'Not signed in'));
    const res = await fetch(`${backend.url.replace(/\/$/, '')}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: backend.anonKey, Authorization: `Bearer ${t}` },
      body: JSON.stringify(args),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data && (data.message || data.error)) || `HTTP ${res.status}`);
    return data;
  }

  // Đọc lại sessionStorage mỗi lần: trên game.html, js/student-auth.js đăng nhập/
  // đăng xuất ghi vào cùng khóa, nên bản nhớ tạm ở đây không được giữ phiên cũ.
  function getSession() { session = loadSession(); return session; }
  // Phiên còn dùng được (còn hạn hoặc làm mới được) – để trang quyết định có cho bấm Nộp không.
  function signedIn() { const s = getSession(); return !!(s && (s.expiresAt > Date.now() || s.refreshToken)); }

  function mount(container, opts) {
    opts = opts || {};
    const onChange = opts.onChange || function () {};
    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'border:2px solid #006687;border-radius:16px;padding:12px 14px;margin-bottom:10px;font-weight:600;font-size:13px;line-height:1.4';
    container.appendChild(wrap);

    function render() {
      wrap.innerHTML = '';
      if (signedIn()) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap';
        const label = document.createElement('span');
        label.style.color = '#006687';
        label.textContent = TT('🔒 Đã đăng nhập: ', '🔒 Signed in: ') + session.email;
        const signOutBtn = document.createElement('button');
        signOutBtn.type = 'button';
        signOutBtn.textContent = TT('Đăng xuất', 'Sign out');
        signOutBtn.style.cssText = 'border:0;border-radius:10px;padding:5px 10px;background:#eef3f3;cursor:pointer;font-weight:700;font-size:12px;font-family:inherit';
        signOutBtn.onclick = () => { session = null; saveSession(null); render(); onChange(null); };
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.textContent = TT('🗑️ Xóa tài khoản', '🗑️ Delete account');
        delBtn.style.cssText = 'border:0;border-radius:10px;padding:5px 10px;background:transparent;color:#b91c1c;text-decoration:underline;cursor:pointer;font-weight:700;font-size:12px;font-family:inherit';
        delBtn.onclick = async () => {
          if (!window.confirm('Xóa tài khoản sẽ xóa vĩnh viễn đăng nhập email này. Kết quả đã nộp của lớp KHÔNG bị xóa. Không thể hoàn tác. Tiếp tục?')) return;
          try { await rpc('bizon_delete_my_account', {}); } catch (e) { alert('Không xóa được: ' + e.message); return; }
          session = null; saveSession(null); render(); onChange(null);
        };
        row.appendChild(label);
        const btns = document.createElement('div');
        btns.style.cssText = 'display:flex;gap:8px;align-items:center';
        btns.appendChild(signOutBtn); btns.appendChild(delBtn);
        row.appendChild(btns);
        wrap.appendChild(row);
      } else {
        const title = document.createElement('p');
        title.style.cssText = 'color:#006687;font-weight:800;margin:0 0 6px;text-transform:uppercase;font-size:11px;letter-spacing:.04em';
        title.textContent = TT('🔒 Đăng nhập bằng email trường để nộp về lớp', '🔒 Sign in with your school email to submit');
        const hint = document.createElement('p');
        hint.style.cssText = 'margin:0 0 8px;opacity:.65;font-weight:600;font-size:11px';
        hint.textContent = TT('Bắt buộc để kết quả về bảng của giảng viên. Không đăng nhập vẫn chơi được, nhưng kết quả chỉ lưu trên máy này. Bảng xếp hạng lớp chỉ hiện biệt danh, không hiện email.',
          'Required for your result to reach the instructor. You can still play without signing in, but results stay on this device. The class leaderboard shows nicknames only, never emails.');
        const emailEl = document.createElement('input');
        emailEl.type = 'email'; emailEl.placeholder = TT('b2400001@student.ctu.edu.vn', 'you@student.your-school.edu');
        emailEl.style.cssText = 'width:100%;box-sizing:border-box;border:1.5px solid rgba(0,102,135,.25);border-radius:10px;padding:8px 10px;margin-bottom:6px;font-weight:600;font-size:13px;font-family:inherit;color:inherit;background:transparent';
        const pwEl = document.createElement('input');
        pwEl.type = 'password'; pwEl.placeholder = TT('Mật khẩu (≥ 8 ký tự)', 'Password (≥ 8 characters)');
        pwEl.style.cssText = emailEl.style.cssText;
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:8px';
        const signUpBtn = document.createElement('button');
        signUpBtn.type = 'button'; signUpBtn.textContent = TT('Đăng ký', 'Sign up');
        const signInBtn = document.createElement('button');
        signInBtn.type = 'button'; signInBtn.textContent = TT('Đăng nhập', 'Sign in');
        [signUpBtn, signInBtn].forEach(b => { b.style.cssText = 'flex:1;border:0;border-radius:10px;padding:8px;background:#eef3f3;cursor:pointer;font-weight:700;font-size:12px;font-family:inherit'; });
        const status = document.createElement('p');
        status.style.cssText = 'margin:6px 0 0;font-size:11px;font-weight:700;opacity:.75';

        async function doAuth(path, successMsg) {
          const email = emailEl.value.trim(), password = pwEl.value;
          if (!isStudentEmail(email) || !password || password.length < 8) { status.textContent = TT('Cần email trường (vd @student.ctu.edu.vn) và mật khẩu ≥ 8 ký tự.', 'Use your school email (e.g. @student.ctu.edu.vn) and a password of 8+ characters.'); status.style.color = '#c0392b'; return; }
          status.textContent = TT('Đang xử lý…', 'Working…'); status.style.color = '';
          try {
            const data = await authRequest(path, { email, password });
            if (data.access_token) {
              applyAuthResponse(data, email);
              render();
              onChange(session);
            } else {
              status.textContent = TT('Đã tạo tài khoản. Kiểm tra email để xác nhận, rồi bấm "Đăng nhập".', 'Account created. Confirm it from your email, then tap "Sign in".');
              status.style.color = '#1a7a4c';
            }
          } catch (e) { status.textContent = successMsg + TT(' thất bại (', ' failed (') + e.message + ').'; status.style.color = '#c0392b'; }
        }
        signUpBtn.onclick = () => doAuth('signup', TT('Đăng ký', 'Sign-up'));
        signInBtn.onclick = () => doAuth('token?grant_type=password', TT('Đăng nhập', 'Sign-in'));

        row.appendChild(signUpBtn); row.appendChild(signInBtn);
        wrap.appendChild(title); wrap.appendChild(hint); wrap.appendChild(emailEl); wrap.appendChild(pwEl); wrap.appendChild(row); wrap.appendChild(status);
      }
    }
    render();
    if (signedIn()) onChange(session);
    return { render };
  }

  window.StudentLogin = { mount, getSession, signedIn, token, rpc, isStudentEmail };
})();
