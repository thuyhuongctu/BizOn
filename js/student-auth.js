/* BizOn – Đăng nhập sinh viên thật, luồng mặc định.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * Cùng kiến trúc với js/app-shell/instructor-studio.js: gọi thẳng REST
 * của Supabase Auth (GoTrue) + RPC, không SDK, không tốn phí.
 *
 * Luồng: Đăng ký/Đăng nhập bằng email @student.ctu.edu.vn + mật khẩu →
 * Tham gia đội (Mã lớp + Tên đội + Vai trò, qua bizon_join_team, gắn danh
 * tính xác thực vào student_team_membership) → "Bắt đầu mô phỏng" điền
 * sẵn Email/Tên đội/Mã lớp/Vai trò rồi gọi thẳng doLogin() có sẵn trong
 * js/app.js (script này load sau app.js, cùng phạm vi global của script
 * cổ điển nên gọi thẳng được doLogin()/pickRole() mà không cần export) —
 * phần lưu/tải tiến trình thật vẫn đi qua BizonBackend/team_saves y hệt
 * đường cũ, không đổi gì ở đó. Đường đăng nhập tự khai cũ (gõ tự do) vẫn
 * còn bên dưới, dành cho "Chơi thử nhanh, không cần tài khoản". */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init, { once: true });
  if (document.readyState !== 'loading') init();

  function init() {
    const panel = document.getElementById('student-auth-panel');
    if (!panel || panel.dataset.wired) return;
    panel.dataset.wired = '1';
    wire(panel);
  }

  function wire(panel) {
    const $ = id => panel.querySelector('#' + id);
    const cfg = () => window.BIZON_BACKEND || {};
    const SESSION_KEY = 'bizon-student-session';
    const state = { session: null, team: null };

    const setStatus = (message, kind) => {
      const el = $('sa-status');
      if (!el) return;
      el.textContent = message;
      el.style.color = kind === 'error' ? '#c0392b' : kind === 'success' ? '#1a7a4c' : '';
    };

    function saveSession() {
      try {
        if (state.session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.session));
        else sessionStorage.removeItem(SESSION_KEY);
      } catch (_) {}
    }

    // Khôi phục phiên đã đăng nhập nếu còn hạn — đổi trang/lỡ tải lại giữa
    // buổi học không bắt gõ lại mật khẩu. Hết hạn thì coi như chưa đăng nhập.
    function restoreSession() {
      try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (saved && saved.accessToken && saved.expiresAt > Date.now()) {
          state.session = saved;
          showTeamBlock();
          setStatus('Đã khôi phục phiên đăng nhập. Nhập Mã lớp + Tên đội để tham gia.', 'success');
        } else {
          sessionStorage.removeItem(SESSION_KEY);
        }
      } catch (_) {}
    }

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
      state.session = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || null,
        email: (data.user && data.user.email) || email,
        expiresAt: Date.now() + (Number(data.expires_in || 3600) - 30) * 1000,
      };
      saveSession();
    }

    async function rpc(fn, args) {
      const backend = cfg();
      if (!backend.url || !backend.anonKey) throw new Error('Backend chưa được cấu hình');
      if (!state.session) throw new Error('Chưa đăng nhập');
      const res = await fetch(`${backend.url.replace(/\/$/, '')}/rest/v1/rpc/${fn}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: backend.anonKey,
          Authorization: `Bearer ${state.session.accessToken}`,
        },
        body: JSON.stringify(args),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data && (data.message || data.error)) || `HTTP ${res.status}`);
      return data;
    }

    async function signUp() {
      const email = $('sa-email')?.value.trim();
      const password = $('sa-password')?.value;
      if (!email || !password || password.length < 8) {
        setStatus('Cần email @student.ctu.edu.vn hợp lệ và mật khẩu tối thiểu 8 ký tự.', 'error');
        return;
      }
      setStatus('Đang tạo tài khoản…');
      try {
        const data = await authRequest('signup', { email, password });
        if (data.access_token) {
          applyAuthResponse(data, email);
          showTeamBlock();
          setStatus('Đã tạo tài khoản và đăng nhập. Nhập Mã lớp + Tên đội để tham gia.', 'success');
        } else {
          setStatus('Đã tạo tài khoản. Kiểm tra email để xác nhận, rồi bấm "Đăng nhập".', 'success');
        }
      } catch (e) {
        setStatus(`Không tạo được tài khoản (${e.message}).`, 'error');
      } finally {
        if ($('sa-password')) $('sa-password').value = '';
      }
    }

    async function signIn() {
      const email = $('sa-email')?.value.trim();
      const password = $('sa-password')?.value;
      if (!email || !password) {
        setStatus('Cần nhập email và mật khẩu.', 'error');
        return;
      }
      setStatus('Đang đăng nhập…');
      try {
        const data = await authRequest('token?grant_type=password', { email, password });
        applyAuthResponse(data, email);
        showTeamBlock();
        setStatus('Đã đăng nhập. Nhập Mã lớp + Tên đội để tham gia.', 'success');
      } catch (e) {
        setStatus(`Không đăng nhập được (${e.message}).`, 'error');
      } finally {
        if ($('sa-password')) $('sa-password').value = '';
      }
    }

    function signOut() {
      state.session = null;
      state.team = null;
      saveSession();
      $('sa-team-block')?.classList.add('hidden');
      $('sa-auth-block')?.classList.remove('hidden');
      $('sa-start')?.classList.add('hidden');
      $('sa-delete-account')?.classList.add('hidden');
      setStatus('Đã đăng xuất.');
    }

    function showTeamBlock() {
      $('sa-auth-block')?.classList.add('hidden');
      $('sa-team-block')?.classList.remove('hidden');
      $('sa-delete-account')?.classList.remove('hidden');
      const line = $('sa-account-line');
      if (line) line.textContent = `Đã đăng nhập: ${state.session.email}`;
    }

    // Xóa tài khoản Supabase Auth thật của chính người gọi (bizon_delete_my_account,
    // migration 20261006000000) — đáp ứng yêu cầu Google Play Data Safety: app cho
    // tạo tài khoản thì phải cho tự xóa tài khoản ngay trong app. Không đụng
    // team_saves/round_submissions vì đó là kết quả chung của cả đội.
    async function deleteAccount() {
      if (!state.session) return;
      const ok = window.confirm('Xóa tài khoản sẽ xóa vĩnh viễn đăng nhập email này và tư cách thành viên đội của bạn. Kết quả/tiến trình của cả đội KHÔNG bị xóa. Không thể hoàn tác. Tiếp tục?');
      if (!ok) return;
      setStatus('Đang xóa tài khoản…');
      try {
        await rpc('bizon_delete_my_account', {});
        state.session = null;
        state.team = null;
        saveSession();
        $('sa-team-block')?.classList.add('hidden');
        $('sa-auth-block')?.classList.remove('hidden');
        $('sa-start')?.classList.add('hidden');
        $('sa-delete-account')?.classList.add('hidden');
        setStatus('Đã xóa tài khoản.', 'success');
      } catch (e) {
        setStatus(`Không xóa được (${e.message}).`, 'error');
      }
    }

    async function joinTeam() {
      const classCode = $('sa-class')?.value.trim();
      const teamName = $('sa-team')?.value.trim();
      const role = $('sa-role')?.value;
      if (!classCode || !teamName) {
        setStatus('Cần nhập Mã lớp và Tên đội.', 'error');
        return;
      }
      setStatus('Đang tham gia đội…');
      try {
        const rows = await rpc('bizon_join_team', { p_class_code: classCode, p_team_name: teamName, p_role: role });
        const row = Array.isArray(rows) ? rows[0] : rows;
        state.team = row;
        $('sa-team-label').textContent = `${row.team_name} · ${row.role} · lớp ${row.class_code}`;
        $('sa-start')?.classList.remove('hidden');
        setStatus('Đã tham gia đội. Bấm "Bắt đầu mô phỏng" để vào trò chơi.', 'success');
      } catch (e) {
        setStatus(`Không tham gia được (${e.message}).`, 'error');
      }
    }

    // Điền danh tính đã xác thực vào màn login cũ rồi gọi thẳng doLogin() có
    // sẵn trong js/app.js (cùng phạm vi global, script này load sau app.js) —
    // tái dùng nguyên vẹn logic khôi phục tiến trình/vào app/nhạc/giọng chào,
    // không viết lại. Việc lưu/tải tiến trình khi chơi vẫn qua BizonBackend/
    // team_saves y hệt đường cũ bằng (Mã lớp, Tên đội) — không đổi gì ở đó.
    function startSimulation() {
      if (!state.team || !state.session) return;
      const emailEl = document.getElementById('login-email');
      const teamEl = document.getElementById('login-team');
      const classEl = document.getElementById('login-class');
      if (emailEl) emailEl.value = state.session.email;
      if (teamEl) teamEl.value = state.team.team_name;
      if (classEl) classEl.value = state.team.class_code;
      if (typeof pickRole === 'function') pickRole(state.team.role);
      window.__bizonAuthedJoin = true; // đã qua bizon_join_team (chặn trùng vai) – mở cổng cho doLogin() dùng Mã lớp
      if (typeof doLogin === 'function') doLogin();
    }

    $('sa-signup')?.addEventListener('click', signUp);
    $('sa-signin')?.addEventListener('click', signIn);
    $('sa-signout')?.addEventListener('click', signOut);
    $('sa-join')?.addEventListener('click', joinTeam);
    $('sa-start')?.addEventListener('click', startSimulation);
    $('sa-delete-account')?.addEventListener('click', deleteAccount);

    restoreSession();
  }
})();
