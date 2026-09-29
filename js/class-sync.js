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
  }
  window.BizOnClassSync = { tick, get controls() { return ctl; } };
  setTimeout(tick, 2500); setInterval(tick, 20000);
  addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
})();
