/* BizOn — đồng bộ điều khiển lớp từ Trang Giảng viên (khóa vòng, cấp/trừ vốn, biến cố, thông báo).
 * Chỉ chạy khi backend bật và đội có Mã lớp. Cần migration 20260928000000_class_controls.sql. */
(function () {
  const cfg = () => window.BIZON_BACKEND || {};
  const on = () => cfg().enabled && cfg().url && cfg().anonKey;
  let ctl = null, lastMsg = '';
  async function feed(code, team) {
    const r = await fetch(cfg().url.replace(/\/$/, '') + '/rest/v1/rpc/bizon_class_feed', { method: 'POST', headers: { apikey: cfg().anonKey, Authorization: 'Bearer ' + cfg().anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_class_code: code, p_team_name: team }) });
    if (!r.ok) throw new Error('class_feed ' + r.status); return r.json();
  }
  function toast(msg, pose) {
    let el = document.getElementById('bizon-class-msg');
    if (!el) { el = document.createElement('div'); el.id = 'bizon-class-msg'; Object.assign(el.style, { position: 'fixed', left: '50%', top: '12px', transform: 'translateX(-50%)', zIndex: 9999, background: '#1f4a55', color: '#fff', padding: '10px 16px', borderRadius: '14px', font: '700 14px "Be Vietnam Pro",sans-serif', boxShadow: '0 4px 0 #10303a', maxWidth: '90vw', textAlign: 'center' }); document.body.appendChild(el); }
    el.innerHTML = '<img src="assets/character/' + (pose || 'rong-xanh') + '.webp" alt="" style="width:40px;vertical-align:middle;margin-right:8px">👩‍🏫 '; el.appendChild(document.createTextNode(msg)); el.style.display = 'block'; clearTimeout(el._t); el._t = setTimeout(() => { el.style.display = 'none'; }, 9000);
  }
  // Đồng hồ thi theo «Thang điểm game Bật Nghiệp»: 10' chuẩn bị + 6 vòng × 8' + 2' báo cáo = 60'.
  const EXAM_SETUP_MIN = 10, EXAM_ROUND_MIN = 8, EXAM_ROUNDS = 6, EXAM_TOTAL_MIN = 60;
  function examPhase(startedAt, now) {
    const elapsedMin = Math.max(0, (now - new Date(startedAt).getTime()) / 60000);
    if (elapsedMin < EXAM_SETUP_MIN) return { phase: 'setup', round: 0, remainMs: (EXAM_SETUP_MIN - elapsedMin) * 60000 };
    if (elapsedMin < EXAM_SETUP_MIN + EXAM_ROUNDS * EXAM_ROUND_MIN) {
      const idx = Math.floor((elapsedMin - EXAM_SETUP_MIN) / EXAM_ROUND_MIN);
      return { phase: 'round', round: idx + 1, remainMs: (EXAM_SETUP_MIN + (idx + 1) * EXAM_ROUND_MIN - elapsedMin) * 60000 };
    }
    if (elapsedMin < EXAM_TOTAL_MIN) return { phase: 'final', round: EXAM_ROUNDS, remainMs: (EXAM_TOTAL_MIN - elapsedMin) * 60000 };
    return { phase: 'done', round: EXAM_ROUNDS, remainMs: 0 };
  }
  function mmss(ms) { const s = Math.max(0, Math.round(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
  function examBar(text, color) {
    let el = document.getElementById('bizon-exam-bar');
    if (!text) { if (el) el.style.display = 'none'; return; }
    if (!el) { el = document.createElement('div'); el.id = 'bizon-exam-bar'; Object.assign(el.style, { position: 'fixed', left: '50%', bottom: '10px', transform: 'translateX(-50%)', zIndex: 9998, background: '#1f4a55', color: '#fff', padding: '8px 16px', borderRadius: '999px', font: '800 13px "Be Vietnam Pro",sans-serif', boxShadow: '0 3px 0 #10303a', textAlign: 'center', letterSpacing: '.2px' }); document.body.appendChild(el); }
    el.textContent = text; el.style.background = color; el.style.display = 'block';
  }
  let autoCommitting = false;
  function examTick() {
    if (!ctl || !ctl.exam_started_at) { examBar(''); return; }
    const S = (typeof window.S !== 'undefined' && window.S) || null;
    const ep = examPhase(ctl.exam_started_at, Date.now());
    const label = ep.phase === 'setup' ? `⏳ Chuẩn bị · còn ${mmss(ep.remainMs)}`
      : ep.phase === 'round' ? `⏱ Vòng ${ep.round} · còn ${mmss(ep.remainMs)}`
      : ep.phase === 'final' ? `📊 Xem báo cáo · còn ${mmss(ep.remainMs)}`
      : '✅ Đã hết giờ thi';
    examBar(label, ep.phase === 'final' || ep.phase === 'done' ? '#e8843a' : '#1f4a55');
    if (!S || !S.profile || S.profile.role !== 'CEO' || autoCommitting) return;
    const dueThru = ep.phase === 'setup' ? 0 : ep.phase === 'round' ? ep.round - 1 : EXAM_ROUNDS;
    if (S.finished || S.committed || S.round > dueThru) return;
    const box = document.getElementById('commit-box');
    if (!box || box.classList.contains('hidden')) return;
    if (typeof window.commitDecisions !== 'function') return;
    autoCommitting = true;
    try { window.commitDecisions(); } finally { setTimeout(() => { autoCommitting = false; }, 500); }
  }
  // Biến cố do GV tung: thay currentEvent đúng vòng được chỉ định.
  const orig = window.currentEvent;
  if (typeof orig === 'function') window.currentEvent = function (s) {
    const e = orig.apply(this, arguments);
    if (!ctl || !ctl.forced_event || !s || ctl.forced_event_round !== s.round) return e;
    const pick = (typeof MARKET_EVENTS_LIST === 'function' ? MARKET_EVENTS_LIST() : []).find(x => x && x.id === ctl.forced_event);
    return pick ? Object.assign({}, pick, { round: s.round, tag: '👩‍🏫 BIẾN CỐ DO GIẢNG VIÊN TUNG', luminaMsg: 'Biến cố bất ngờ từ giảng viên! Đọc kỹ tác động trước khi chốt.' }) : e;
  };
  async function tick() {
    const S = (typeof window.S !== 'undefined' && window.S) || (function () { try { return eval('S'); } catch (e) { return null; } })(); if (!on() || !S || !S.profile) return;
    const code = String(S.profile.classId || '').trim().toUpperCase(), team = String(S.profile.teamName || '').trim();
    if (!code || !team) return;
    let j; try { j = await feed(code, team); } catch (e) { return; }
    ctl = (j && j.controls) || null; let dirty = false;
    const lk = ctl && ctl.locked_round != null ? S.round > ctl.locked_round : false;
    if (S.roundLocked !== lk) { S.roundLocked = lk; dirty = true; if (lk) toast(`Cả lớp đang chờ nhau. Giảng viên sẽ mở vòng ${ctl.locked_round + 1} khi mọi đội xong.`, 'rong-xanh-ngap'); else toast('Giảng viên đã mở vòng mới. Tiếp tục thôi!', 'rong-xanh-y-tuong'); }
    S.classGrantIds = S.classGrantIds || [];
    ((j && j.grants) || []).forEach(g => { if (S.classGrantIds.includes(g.id)) return; S.classGrantIds.push(g.id); S.balance += +g.amount || 0;
      (S.grantLog = S.grantLog || []).push({ team: team, amount: +g.amount, round: Math.min(S.round, 6), reason: g.reason || 'Giảng viên' }); dirty = true;
      toast(g.amount >= 0 ? `Giảng viên thưởng ${Math.abs(g.amount)}tr₫ cho đội – ${g.reason || 'Giảng viên'}` : `Giảng viên trừ ${Math.abs(g.amount)}tr₫ – ${g.reason || 'Giảng viên'}`, g.amount >= 0 ? 'rong-xanh-tim' : 'rong-xanh-ngac-nhien'); });
    if (ctl && ctl.message && ctl.message !== lastMsg) { lastMsg = ctl.message; toast(ctl.message); }
    if (dirty) { try { save(); renderAll(); } catch (e) {} }
    examTick();
  }
  window.BizOnClassSync = { tick, get controls() { return ctl; } };
  setTimeout(tick, 2500); setInterval(tick, 20000);
  setInterval(examTick, 1000);
  addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
})();
