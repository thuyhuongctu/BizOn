/* BizOn – Đăng nhập sinh viên thật (thử nghiệm), CHƯA bật mặc định.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * Chỉ hoạt động khi URL có ?studentAuth=1 — mặc định KHÔNG tải/chạy gì cả,
 * màn hình đăng nhập tự khai (email/tên đội/mã lớp cũ) không bị đụng vào.
 * Cùng kiến trúc với js/app-shell/instructor-studio.js: gọi thẳng REST
 * của Supabase Auth (GoTrue) + RPC, không SDK, không tốn phí.
 *
 * Luồng: Đăng ký/Đăng nhập bằng email @student.ctu.edu.vn + mật khẩu →
 * Tham gia đội (Mã lớp + Tên đội + Vai trò, qua bizon_join_team) → Tải/Lưu
 * tiến trình qua bizon_student_get_save / bizon_student_upsert_save. Toàn
 * bộ đọc/ghi cùng bảng team_saves đang dùng cho luồng cũ nên Instructor
 * Studio và Dashboard cổ điển đọc được ngay, không cần đổi gì.
 *
 * Đây là bảng thử nghiệm độc lập, KHÔNG nối vào doLogin()/js/app.js —
 * việc nối vào làm luồng đăng nhập mặc định của trò chơi là một bước
 * riêng, chỉ làm khi được xác nhận. */
(function () {
  'use strict';

  let flagOn = false;
  try { flagOn = new URLSearchParams(window.location.search).get('studentAuth') === '1'; }
  catch (_) { flagOn = false; }
  if (!flagOn) return;

  document.addEventListener('DOMContentLoaded', init, { once: true });
  if (document.readyState !== 'loading') init();

  function init() {
    const panel = document.getElementById('student-auth-panel');
    if (!panel || panel.dataset.wired) return;
    panel.dataset.wired = '1';
    panel.classList.remove('hidden');
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
      setStatus('Đã đăng xuất.');
    }

    function showTeamBlock() {
      $('sa-auth-block')?.classList.add('hidden');
      $('sa-team-block')?.classList.remove('hidden');
      const line = $('sa-account-line');
      if (line) line.textContent = `Đã đăng nhập: ${state.session.email}`;
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
        $('sa-save-block')?.classList.remove('hidden');
        setStatus('Đã tham gia đội. Có thể thử Tải/Lưu tiến trình bên dưới.', 'success');
      } catch (e) {
        setStatus(`Không tham gia được (${e.message}).`, 'error');
      }
    }

    async function loadSave() {
      if (!state.team) return;
      setStatus('Đang tải tiến trình…');
      try {
        const rows = await rpc('bizon_student_get_save', { p_class_code: state.team.class_code });
        const row = Array.isArray(rows) ? rows[0] : rows;
        $('sa-save-out').textContent = row ? JSON.stringify(row.state_json, null, 2) : '(chưa có tiến trình lưu)';
        setStatus('Đã tải tiến trình.', 'success');
      } catch (e) {
        setStatus(`Không tải được (${e.message}).`, 'error');
      }
    }

    async function saveDemo() {
      if (!state.team) return;
      setStatus('Đang lưu thử…');
      try {
        await rpc('bizon_student_upsert_save', {
          p_class_code: state.team.class_code,
          p_state: { demo: true, saved_at: new Date().toISOString() },
        });
        setStatus('Đã lưu thử một trạng thái mẫu.', 'success');
      } catch (e) {
        setStatus(`Không lưu được (${e.message}).`, 'error');
      }
    }

    $('sa-signup')?.addEventListener('click', signUp);
    $('sa-signin')?.addEventListener('click', signIn);
    $('sa-signout')?.addEventListener('click', signOut);
    $('sa-join')?.addEventListener('click', joinTeam);
    $('sa-load')?.addEventListener('click', loadSave);
    $('sa-save')?.addEventListener('click', saveDemo);
  }
})();
