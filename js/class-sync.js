/* BizOn — đồng bộ điều khiển lớp từ Trang Giảng viên (khóa vòng, cấp/trừ vốn, biến cố, thông báo).
 * Chỉ chạy khi backend bật và đội có Mã lớp. Cần migration 20260928000000_class_controls.sql. */
(function () {
  const cfg = () => window.BIZON_BACKEND || {};
  const on = () => cfg().enabled && cfg().url && cfg().anonKey;
  const TT = (vi, en) => (typeof T === 'function' ? T(vi, en) : vi);
  // Không khai báo biến tên S trong hàm gọi getS(): eval('S') sẽ đọc trúng chính biến đó (vùng TDZ) thay vì S của app.js.
  const getS = function () { return (typeof window.S !== 'undefined' && window.S) || (function () { try { return eval('S'); } catch (e) { return null; } })(); };
  let ctl = null, lastMsg = '';
  async function feed(code, team) {
    const r = await fetch(cfg().url.replace(/\/$/, '') + '/rest/v1/rpc/bizon_class_feed', { method: 'POST', headers: { apikey: cfg().anonKey, Authorization: 'Bearer ' + cfg().anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_class_code: code, p_team_name: team }) });
    if (!r.ok) throw new Error('class_feed ' + r.status); return r.json();
  }
  function toast(msg, pose) {
    // Trong «BizOn Game 3D.html» game nằm trong iframe thường bị ẩn – chuyển thông báo lên khung ngoài.
    try { if (window.parent !== window && typeof window.parent.__toast3D === 'function' && window.parent.__toast3D('👩‍🏫 ' + msg, pose)) return; } catch (e) {}
    let el = document.getElementById('bizon-class-msg');
    if (!el) { el = document.createElement('div'); el.id = 'bizon-class-msg'; Object.assign(el.style, { position: 'fixed', left: '50%', top: '12px', transform: 'translateX(-50%)', zIndex: 9999, background: '#1f4a55', color: '#fff', padding: '10px 16px', borderRadius: '14px', font: '700 14px "Be Vietnam Pro",sans-serif', boxShadow: '0 4px 0 #10303a', maxWidth: '90vw', textAlign: 'center' }); document.body.appendChild(el); }
    el.innerHTML = '<img src="assets/dragon/' + (pose || 'wave') + '.png" alt="" style="width:40px;vertical-align:middle;margin-right:8px">👩‍🏫 '; el.appendChild(document.createTextNode(msg)); el.style.display = 'block'; clearTimeout(el._t); el._t = setTimeout(() => { el.style.display = 'none'; }, 9000);
  }
  // Thẻ «Nhận xét của giảng viên · vòng N»: ở lại tới khi đội bấm Đóng (nhận xét dài hơn một thông báo 9 giây).
  function feedbackCard(f) {
    try { if (window.parent !== window && typeof window.parent.__toast3D === 'function') window.parent.__toast3D('👩‍🏫 ' + TT(`Giảng viên vừa gửi nhận xét vòng ${f.round}`, `Your instructor sent round ${f.round} feedback`), 'checklist'); } catch (e) {}
    let el = document.getElementById('bizon-class-feedback');
    if (!el) {
      el = document.createElement('section'); el.id = 'bizon-class-feedback'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
      Object.assign(el.style, { position: 'fixed', left: '50%', bottom: '16px', transform: 'translateX(-50%)', zIndex: 9999, width: 'min(560px, calc(100vw - 32px))', background: '#FFFBF4', color: '#033337', padding: '14px 16px', borderRadius: '18px', border: '2px solid #2F8A8C', boxShadow: '0 10px 24px -12px rgba(16,48,58,.5)', font: '500 15px/1.5 "Be Vietnam Pro",sans-serif', maxHeight: '60vh', overflowY: 'auto' });
      document.body.appendChild(el);
    }
    el.textContent = '';
    const h = document.createElement('b'); h.style.display = 'block'; h.style.marginBottom = '6px';
    h.textContent = '👩‍🏫 ' + TT(`Nhận xét của giảng viên · vòng ${f.round}`, `Instructor feedback · round ${f.round}`) + (f.da_sua ? TT(' (đã sửa)', ' (edited)') : '');
    const p = document.createElement('p'); p.style.margin = '0'; p.style.whiteSpace = 'pre-wrap'; p.textContent = f.noi_dung || '';
    const b = document.createElement('button'); b.type = 'button'; b.textContent = TT('Đóng', 'Close');
    Object.assign(b.style, { marginTop: '10px', minHeight: '44px', padding: '8px 18px', borderRadius: '999px', border: '0', background: '#2F8A8C', color: '#fff', font: '800 15px "Be Vietnam Pro",sans-serif', cursor: 'pointer' });
    b.addEventListener('click', () => { el.style.display = 'none'; });
    el.append(h, p, b); el.style.display = 'block';
  }
  // Biến cố do GV tung: thay currentEvent đúng vòng được chỉ định.
  const orig = window.currentEvent;
  if (typeof orig === 'function') window.currentEvent = function (s) {
    const e = orig.apply(this, arguments);
    if (!ctl || !ctl.forced_event || !s || ctl.forced_event_round !== s.round) return e;
    const pick = (typeof MARKET_EVENTS_LIST === 'function' ? MARKET_EVENTS_LIST() : []).find(x => x && x.id === ctl.forced_event);
    return pick ? Object.assign({}, pick, { round: s.round, tag: TT('👩‍🏫 BIẾN CỐ DO GIẢNG VIÊN TUNG', '👩‍🏫 INSTRUCTOR-TRIGGERED EVENT'), luminaMsg: TT('Biến cố bất ngờ từ giảng viên! Đọc kỹ tác động trước khi chốt.', 'A surprise event from your instructor! Read the impact carefully before you commit.') }) : e;
  };
  async function tick() {
    const S = getS(); if (!on() || !S || !S.profile) return;
    const code = String(S.profile.classId || '').trim().toUpperCase(), team = String(S.profile.teamName || '').trim();
    if (!code || !team || code === 'DEMO-2026') return;   // Đội Demo dùng chung mã lớp mẫu – không nhận lệnh lớp
    let j; try { j = await feed(code, team); } catch (e) { return; }
    ctl = (j && j.controls) || null; let dirty = false;
    if (window.BizOnExplain) BizOnExplain.applyControls(ctl || {}, code);   // nhánh hộp đen (R1): cờ explain_hidden của lớp
    const lk = ctl && ctl.locked_round != null ? S.round > ctl.locked_round : false;
    if (S.roundLocked !== lk) { S.roundLocked = lk; dirty = true; if (lk) toast(TT(`Cả lớp đang chờ nhau. Giảng viên sẽ mở vòng ${ctl.locked_round + 1} khi mọi đội xong.`, `The class is waiting for everyone. Your instructor will open round ${ctl.locked_round + 1} once all teams finish.`), 'checklist'); else toast(TT('Giảng viên đã mở vòng mới. Tiếp tục thôi!', 'Your instructor opened a new round. Let\'s go!'), 'wave'); }
    S.classGrantIds = S.classGrantIds || [];
    ((j && j.grants) || []).forEach(g => { if (S.classGrantIds.includes(g.id)) return; S.classGrantIds.push(g.id); S.balance += +g.amount || 0;
      (S.grantLog = S.grantLog || []).push({ team: team, amount: +g.amount, round: Math.min(S.round, 6), reason: g.reason || 'Giảng viên' }); dirty = true;
      const why = g.reason || TT('Giảng viên', 'Instructor'), amt = typeof money === 'function' ? money(Math.abs(g.amount)) : Math.abs(g.amount) + 'tr₫';
      toast(g.amount >= 0 ? TT(`Giảng viên thưởng ${amt} cho đội – ${why}`, `Your instructor awarded the team ${amt} – ${why}`) : TT(`Giảng viên trừ ${amt} – ${why}`, `Your instructor deducted ${amt} – ${why}`), g.amount >= 0 ? 'thumbs' : 'magnifier'); });
    if (ctl && ctl.message && ctl.message !== lastMsg) { lastMsg = ctl.message; toast(ctl.message); }
    // Nhận xét cuối vòng giảng viên đã duyệt (trợ lý giảng viên, migration 20261106000000_class_feedback.sql).
    // Feed chỉ trả phiên bản mới nhất đang gửi của đúng đội; mỗi phiên bản một id, nên bản sửa lại cũng hiện lại.
    const fbs = (j && Array.isArray(j.feedback)) ? j.feedback : [];
    S.classFeedback = fbs.map(f => ({ id: f.id, round: f.round, text: f.noi_dung, lang: f.ngon_ngu, edited: !!f.da_sua, at: f.created_at }));
    S.classFeedbackSeen = S.classFeedbackSeen || [];
    fbs.filter(f => f && f.id && !S.classFeedbackSeen.includes(f.id)).forEach(f => { S.classFeedbackSeen.push(f.id); dirty = true; feedbackCard(f); });
    if (dirty) { try { save(); renderAll(); } catch (e) {} }
  }
  // Đọc controls của lớp một lần, không đụng trạng thái ván (dùng trước khi áp hành trang hành trình 3 bậc). null nếu backend tắt/lỗi/không mã lớp.
  async function fetchControls(code, team) { code = String(code || '').trim().toUpperCase(); team = String(team || '').trim(); if (!on() || !code || !team || code === 'DEMO-2026') return null; try { const j = await feed(code, team); return (j && j.controls) || null; } catch (e) { return null; } }
  window.BizOnClassSync = { tick, fetchControls, get controls() { return ctl; } };
  setTimeout(tick, 2500); setInterval(tick, 20000);
  addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
})();
