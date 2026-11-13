/* BizOn – Đăng nhập sinh viên thật, luồng mặc định.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * Cùng kiến trúc với js/app-shell/instructor-studio.js: gọi thẳng REST
 * của Supabase Auth (GoTrue) + RPC, không SDK, không tốn phí.
 *
 * Luồng: Đăng ký/Đăng nhập bằng email @student.ctu.edu.vn (sinh viên – học viên) hoặc
 * @gstudent.ctu.edu.vn (nghiên cứu sinh) + mật khẩu →
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

    // Song ngữ: T(vi, en) của js/app.js (script này nạp sau app.js). Trang không có T() thì giữ tiếng Việt.
    const tr = (vi, en) => (typeof T === 'function' ? T(vi, en) : vi);
    // Lỗi máy chủ (SQL, Supabase Auth) trả về bằng tiếng Việt hoặc tiếng Anh kỹ thuật; ở chế độ tiếng Anh thì đổi các câu
    // sinh viên hay gặp sang lời dễ hiểu. Câu không có trong bảng thì giữ nguyên để còn tra được.
    const ERR_EN = [
      [/^Cần dùng đúng email trường/, 'Please use your school email address to join a team.'],
      [/^Vai trò (\S+) của đội (.+) trong lớp (\S+) đã có người khác giữ\.?$/, 'The role $1 of team $2 in class $3 is already taken by someone else.'],
      [/^Mã lớp cần 3-40 ký tự/, 'The Class ID needs 3–40 characters: capital letters, digits, underscore or hyphen.'],
      [/^Tên đội cần 1-60 ký tự/, 'The team name needs 1–60 characters.'],
      [/^Vai trò phải là một trong/, 'The role must be one of CEO, CFO, CMO, COO, SEC.'],
      [/^Cần đăng nhập trước khi tham gia đội/, 'Please sign in before joining a team.'],
      [/^Bạn chưa tham gia đội nào trong lớp này/, 'You have not joined a team in this class yet.'],
      [/^Phiên đăng nhập đã hết/, 'Your session has expired, please sign in again'],
      [/^Chưa đăng nhập$/, 'Not signed in'],
      [/^Backend chưa được cấu hình$/, 'The server connection is not configured'],
      [/^Máy chủ không trả về phiên đăng nhập hợp lệ/, 'The server did not return a valid session.'],
      [/^Invalid login credentials$/i, 'wrong email or password'],
      [/^Email not confirmed$/i, 'email not confirmed yet – open the link in the confirmation email first'],
      [/^User already registered$/i, 'this email already has an account – use "Sign in"'],
      [/rate limit/i, 'too many attempts right now – wait a few minutes and try again'],
    ];
    const errText = e => {
      const m = String((e && e.message) || e || '');
      if (tr('vi', 'en') !== 'en') return m;
      for (const [re, en] of ERR_EN) if (re.test(m)) return m.replace(re, en);
      return m;
    };

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
        // Hết hạn nhưng còn refresh token vẫn dùng được (StudentLogin.token() tự làm mới).
        if (saved && saved.accessToken && (saved.expiresAt > Date.now() || (saved.refreshToken && window.StudentLogin))) {
          state.session = saved;
          showTeamBlock();
          setStatus(tr('Đã khôi phục phiên đăng nhập. Nhập Mã lớp + Tên đội để tham gia.', 'Session restored. Enter the Class ID and team name to join.'), 'success');
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
      // Buổi học dài hơn 1 giờ: lấy token qua StudentLogin để tự làm mới khi hết hạn.
      const t = window.StudentLogin ? await StudentLogin.token() : state.session.accessToken;
      if (!t) { signOut(); throw new Error('Phiên đăng nhập đã hết, hãy đăng nhập lại'); }
      const res = await fetch(`${backend.url.replace(/\/$/, '')}/rest/v1/rpc/${fn}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: backend.anonKey,
          Authorization: `Bearer ${t}`,
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
      if (window.StudentLogin && StudentLogin.loadDomains) await StudentLogin.loadDomains();
      if (!email || !password || password.length < 8 || (window.StudentLogin && !StudentLogin.isStudentEmail(email))) {
        setStatus(tr('Cần email trường hợp lệ (@student.ctu.edu.vn hoặc @gstudent.ctu.edu.vn) và mật khẩu tối thiểu 8 ký tự.', 'Use the email address issued by your school (a domain registered with BizOn) and a password of at least 8 characters.'), 'error');
        return;
      }
      setStatus(tr('Đang tạo tài khoản…', 'Creating your account…'));
      try {
        const data = await authRequest('signup', { email, password });
        if (data.access_token) {
          applyAuthResponse(data, email);
          showTeamBlock();
          setStatus(tr('Đã tạo tài khoản và đăng nhập. Nhập Mã lớp + Tên đội để tham gia.', 'Account created and signed in. Enter the Class ID and team name to join.'), 'success');
        } else {
          setStatus(tr('Đã tạo tài khoản. Kiểm tra email để xác nhận, rồi bấm "Đăng nhập".', 'Account created. Check your email to confirm it, then press "Sign in".'), 'success');
        }
      } catch (e) {
        setStatus(tr(`Không tạo được tài khoản (${errText(e)}).`, `Could not create the account (${errText(e)}).`), 'error');
      } finally {
        if ($('sa-password')) $('sa-password').value = '';
      }
    }

    async function signIn() {
      const email = $('sa-email')?.value.trim();
      const password = $('sa-password')?.value;
      if (!email || !password) {
        setStatus(tr('Cần nhập email và mật khẩu.', 'Please enter your email and password.'), 'error');
        return;
      }
      setStatus(tr('Đang đăng nhập…', 'Signing in…'));
      try {
        const data = await authRequest('token?grant_type=password', { email, password });
        applyAuthResponse(data, email);
        showTeamBlock();
        setStatus(tr('Đã đăng nhập. Nhập Mã lớp + Tên đội để tham gia.', 'Signed in. Enter the Class ID and team name to join.'), 'success');
      } catch (e) {
        setStatus(tr(`Không đăng nhập được (${errText(e)}).`, `Could not sign in (${errText(e)}).`), 'error');
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
      setStatus(tr('Đã đăng xuất.', 'Signed out.'));
    }

    function showTeamBlock() {
      $('sa-auth-block')?.classList.add('hidden');
      $('sa-team-block')?.classList.remove('hidden');
      $('sa-delete-account')?.classList.remove('hidden');
      const line = $('sa-account-line');
      if (line) line.textContent = tr(`Đã đăng nhập: ${state.session.email}`, `Signed in: ${state.session.email}`);
    }

    // Xóa tài khoản Supabase Auth thật của chính người gọi (bizon_delete_my_account,
    // migration 20261006000000) — đáp ứng yêu cầu Google Play Data Safety: app cho
    // tạo tài khoản thì phải cho tự xóa tài khoản ngay trong app. Không đụng
    // team_saves/round_submissions vì đó là kết quả chung của cả đội.
    async function deleteAccount() {
      if (!state.session) return;
      const ok = window.confirm(tr('Xóa tài khoản sẽ xóa vĩnh viễn đăng nhập email này và tư cách thành viên đội của bạn. Kết quả/tiến trình của cả đội KHÔNG bị xóa. Không thể hoàn tác. Tiếp tục?',
        'Deleting your account permanently removes this email sign-in and your team membership. The results and progress of the whole team are NOT deleted. This cannot be undone. Continue?'));
      if (!ok) return;
      setStatus(tr('Đang xóa tài khoản…', 'Deleting your account…'));
      try {
        await rpc('bizon_delete_my_account', {});
        state.session = null;
        state.team = null;
        saveSession();
        $('sa-team-block')?.classList.add('hidden');
        $('sa-auth-block')?.classList.remove('hidden');
        $('sa-start')?.classList.add('hidden');
        $('sa-delete-account')?.classList.add('hidden');
        setStatus(tr('Đã xóa tài khoản.', 'Account deleted.'), 'success');
      } catch (e) {
        setStatus(tr(`Không xóa được (${errText(e)}).`, `Could not delete the account (${errText(e)}).`), 'error');
      }
    }

    async function joinTeam() {
      const classCode = $('sa-class')?.value.trim();
      const teamName = $('sa-team')?.value.trim();
      const role = $('sa-role')?.value;
      if (!classCode || !teamName) {
        setStatus(tr('Cần nhập Mã lớp và Tên đội.', 'Please enter the Class ID and team name.'), 'error');
        return;
      }
      setStatus(tr('Đang tham gia đội…', 'Joining the team…'));
      try {
        const rows = await rpc('bizon_join_team', { p_class_code: classCode, p_team_name: teamName, p_role: role });
        const row = Array.isArray(rows) ? rows[0] : rows;
        state.team = row;
        $('sa-team-label').textContent = tr(`${row.team_name} · ${row.role} · lớp ${row.class_code}`, `${row.team_name} · ${row.role} · class ${row.class_code}`);
        $('sa-start')?.classList.remove('hidden');
        setStatus(tr('Đã tham gia đội. Bấm "Bắt đầu mô phỏng" để vào trò chơi.', 'You have joined the team. Press "Start the simulation" to enter the game.'), 'success');
      } catch (e) {
        setStatus(tr(`Không tham gia được (${errText(e)}).`, `Could not join the team (${errText(e)}).`), 'error');
      }
    }

    // Điền danh tính đã xác thực vào màn login cũ rồi gọi thẳng doLogin() có
    // sẵn trong js/app.js (cùng phạm vi global, script này load sau app.js) —
    // tái dùng nguyên vẹn logic khôi phục tiến trình/vào app/nhạc/giọng chào,
    // không viết lại. Lưu/tải tiến trình và nộp kết quả khi chơi đi qua
    // BizonBackend bằng chính phiên đăng nhập này (đội lấy theo tài khoản).
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
