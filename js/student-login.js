/* BizOn – Tiện ích đăng nhập sinh viên thật dùng chung cho các game nộp điểm
 * một lần (Hộ Chiếu Mini, Bến Phù Sa) – khác với js/student-auth.js (dành
 * riêng cho Bật Nghiệp, có thêm bước "tham gia đội"/lưu tiến trình).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * Cùng một Supabase Auth với Bật Nghiệp (email @student.ctu.edu.vn + mật
 * khẩu, gọi thẳng REST GoTrue, không SDK) và CÙNG khóa sessionStorage
 * ('bizon-student-session') nên một sinh viên đã đăng nhập ở game.html rồi
 * mở Hộ Chiếu Mini/Bến Phù Sa trong cùng tab/phiên trình duyệt sẽ thấy
 * mình đã đăng nhập sẵn, không phải gõ lại mật khẩu.
 *
 * API: window.StudentLogin.mount(container, {onChange}) – vẽ UI đăng nhập
 * gọn vào container; .getSession() – phiên hiện tại hoặc null nếu hết hạn/
 * chưa đăng nhập; .rpc(fn, args) – gọi RPC xác thực, báo lỗi rõ nếu chưa
 * đăng nhập. Nộp điểm ẩn danh (không đăng nhập) vẫn hoạt động y nguyên ở
 * nơi gọi – StudentLogin chỉ CỘNG THÊM lựa chọn, không bắt buộc. */
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
      if (s && s.accessToken && s.expiresAt > Date.now()) return s;
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
      email: (data.user && data.user.email) || email,
      expiresAt: Date.now() + (Number(data.expires_in || 3600) - 30) * 1000,
    };
    saveSession(session);
    return session;
  }

  async function rpc(fn, args) {
    const backend = cfg();
    if (!backend.url || !backend.anonKey) throw new Error('Backend chưa được cấu hình');
    if (!session) throw new Error('Chưa đăng nhập');
    const res = await fetch(`${backend.url.replace(/\/$/, '')}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: backend.anonKey, Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify(args),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data && (data.message || data.error)) || `HTTP ${res.status}`);
    return data;
  }

  function getSession() { session = session || loadSession(); return session; }

  function mount(container, opts) {
    opts = opts || {};
    const onChange = opts.onChange || function () {};
    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'border:2px solid #006687;border-radius:16px;padding:12px 14px;margin-bottom:10px;font:600 13px/1.4 inherit';
    container.appendChild(wrap);

    function render() {
      wrap.innerHTML = '';
      if (session) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap';
        const label = document.createElement('span');
        label.style.color = '#006687';
        label.textContent = '🔒 Đã đăng nhập: ' + session.email;
        const signOutBtn = document.createElement('button');
        signOutBtn.type = 'button';
        signOutBtn.textContent = 'Đăng xuất';
        signOutBtn.style.cssText = 'border:0;border-radius:10px;padding:5px 10px;background:#eef3f3;cursor:pointer;font:700 12px inherit';
        signOutBtn.onclick = () => { session = null; saveSession(null); render(); onChange(null); };
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.textContent = '🗑️ Xóa tài khoản';
        delBtn.style.cssText = 'border:0;border-radius:10px;padding:5px 10px;background:transparent;color:#b91c1c;text-decoration:underline;cursor:pointer;font:700 12px inherit';
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
        title.textContent = '🔒 Đăng nhập bằng email trường (tùy chọn)';
        const hint = document.createElement('p');
        hint.style.cssText = 'margin:0 0 8px;opacity:.65;font-weight:600;font-size:11px';
        hint.textContent = 'Để giảng viên truy được đúng người qua email khi chấm điểm/thi. Không đăng nhập vẫn nộp được bình thường.';
        const emailEl = document.createElement('input');
        emailEl.type = 'email'; emailEl.placeholder = '23017163@student.ctu.edu.vn';
        emailEl.style.cssText = 'width:100%;box-sizing:border-box;border:1.5px solid rgba(0,102,135,.25);border-radius:10px;padding:8px 10px;margin-bottom:6px;font:600 13px inherit';
        const pwEl = document.createElement('input');
        pwEl.type = 'password'; pwEl.placeholder = 'Mật khẩu (≥ 8 ký tự)';
        pwEl.style.cssText = emailEl.style.cssText;
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:8px';
        const signUpBtn = document.createElement('button');
        signUpBtn.type = 'button'; signUpBtn.textContent = 'Đăng ký';
        const signInBtn = document.createElement('button');
        signInBtn.type = 'button'; signInBtn.textContent = 'Đăng nhập';
        [signUpBtn, signInBtn].forEach(b => { b.style.cssText = 'flex:1;border:0;border-radius:10px;padding:8px;background:#eef3f3;cursor:pointer;font:700 12px inherit'; });
        const status = document.createElement('p');
        status.style.cssText = 'margin:6px 0 0;font-size:11px;font-weight:700;opacity:.75';

        async function doAuth(path, successMsg) {
          const email = emailEl.value.trim(), password = pwEl.value;
          if (!email || !password || password.length < 8) { status.textContent = 'Cần email @student.ctu.edu.vn hợp lệ và mật khẩu ≥ 8 ký tự.'; status.style.color = '#c0392b'; return; }
          status.textContent = 'Đang xử lý…'; status.style.color = '';
          try {
            const data = await authRequest(path, { email, password });
            if (data.access_token) {
              applyAuthResponse(data, email);
              render();
              onChange(session);
            } else {
              status.textContent = 'Đã tạo tài khoản. Kiểm tra email để xác nhận, rồi bấm "Đăng nhập".';
              status.style.color = '#1a7a4c';
            }
          } catch (e) { status.textContent = successMsg + ' thất bại (' + e.message + ').'; status.style.color = '#c0392b'; }
        }
        signUpBtn.onclick = () => doAuth('signup', 'Đăng ký');
        signInBtn.onclick = () => doAuth('token?grant_type=password', 'Đăng nhập');

        row.appendChild(signUpBtn); row.appendChild(signInBtn);
        wrap.appendChild(title); wrap.appendChild(hint); wrap.appendChild(emailEl); wrap.appendChild(pwEl); wrap.appendChild(row); wrap.appendChild(status);
      }
    }
    render();
    if (session) onChange(session);
  }

  window.StudentLogin = { mount, getSession, rpc };
})();
