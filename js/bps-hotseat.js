// 2 người chung máy: cùng seed thị trường, chơi lần lượt, so kết quả
(function () {
  var EN = function () { try { return localStorage.getItem('bizon-lang') === 'en'; } catch (e) { return false; } };
  var T = function (vi, en) { return EN() ? en : vi; };
  var $ = function (id) { return document.getElementById(id); };
  var f1 = function (v) { return (Math.round(v * 10) / 10).toLocaleString('vi-VN'); };
  var HS = null; try { HS = JSON.parse(sessionStorage.getItem('bps-hs') || 'null'); } catch (e) {}
  function save() { sessionStorage.setItem('bps-hs', JSON.stringify(HS)); }
  function reset() { sessionStorage.removeItem('bps-hs'); location.reload(); }
  window.bpsHotseat = function () {
    var n1 = prompt(T('Tên người chơi 1:', 'Player 1 name:'), T('Người chơi 1', 'Player 1')); if (n1 === null) return;
    var n2 = prompt(T('Tên người chơi 2:', 'Player 2 name:'), T('Người chơi 2', 'Player 2')); if (n2 === null) return;
    HS = { seed: Math.floor(Math.random() * 1e9), stage: 1, n: [n1 || 'P1', n2 || 'P2'], tot: [] }; save(); location.reload();
  };
  if (!HS) return;
  var intro = $('ft-intro');
  if (intro) {
    var d = document.createElement('div');
    d.style.cssText = 'margin:0 0 14px;padding:12px 14px;border-radius:18px;background:#033337;color:#fff;font-weight:600;font-size:14px;line-height:1.45;display:flex;gap:10px;align-items:center';
    var who = HS.n[HS.stage - 1];
    d.innerHTML = '<span style="font-size:24px">👥</span><span>' + T('Lượt của <b>' + who + '</b> (' + HS.stage + '/2). Hai người chơi cùng thị trường, cùng sự kiện, cùng đối thủ.', '<b>' + who + '</b>\'s turn (' + HS.stage + '/2). Both players face the same market, events and rivals.') +
      '</span><button type="button" style="margin-left:auto;min-height:40px;padding:0 12px;border:0;border-radius:12px;background:rgba(255,255,255,.15);color:#fff;font-weight:800;cursor:pointer">' + T('Huỷ', 'Cancel') + '</button>';
    d.querySelector('button').onclick = reset;
    intro.insertBefore(d, intro.firstChild);
  }
  var end = $('ft-end'); if (!end) return;
  new MutationObserver(function () { if (!end.classList.contains('hidden')) setTimeout(render, 30); }).observe(end, { attributes: true, attributeFilter: ['class'] });
  function render() {
    var tot = window.__bps && window.__bps.S ? window.__bps.S.total : 0;
    if (HS.tot[HS.stage - 1] == null) { HS.tot[HS.stage - 1] = Math.round(tot * 10) / 10; save(); }
    var box = $('bps-hs-end');
    if (!box) { box = document.createElement('div'); box.id = 'bps-hs-end';
      box.style.cssText = 'margin:0 0 16px;padding:18px;border-radius:22px;background:#033337;color:#fff;text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center';
      end.insertBefore(box, end.firstChild); }
    var btn = 'min-height:48px;padding:0 22px;border:0;border-radius:16px;font-weight:800;font-size:15px;cursor:pointer;';
    if (HS.stage === 1) {
      box.innerHTML = '<p style="margin:0;font-size:15px;font-weight:600">' + T('<b>' + HS.n[0] + '</b> được ' + f1(HS.tot[0]) + ' tr. Đừng cho người chơi 2 xem bảng này.', '<b>' + HS.n[0] + '</b> scored ' + f1(HS.tot[0]) + ' mn. Don\'t let player 2 see this screen.') + '</p>' +
        '<button type="button" style="' + btn + 'background:linear-gradient(180deg,#ffd38a,#fda127);color:#033337;box-shadow:0 4px 0 #c97a12">' + T('Chuyển máy cho ' + HS.n[1] + ' →', 'Hand over to ' + HS.n[1] + ' →') + '</button>';
      box.querySelector('button').onclick = function () { HS.stage = 2; save(); location.reload(); };
    } else {
      var a = HS.tot[0], b = HS.tot[1], win = a === b ? -1 : (a > b ? 0 : 1);
      box.innerHTML = '<p style="margin:0;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fda127">' + T('Kết quả 2 người', 'Two-player result') + '</p>' +
        '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;width:100%">' + [0, 1].map(function (i) {
          return '<div style="padding:12px;border-radius:16px;' + (win === i ? 'background:#fda127;color:#033337' : 'background:rgba(255,255,255,.1)') + '"><div style="font-weight:800">' + (win === i ? '🏆 ' : '') + HS.n[i] + '</div><div style="font-size:22px;font-weight:800">' + f1(HS.tot[i]) + ' ' + T('tr', 'mn') + '</div></div>';
        }).join('') + '</div>' +
        '<p style="margin:0;font-size:14px">' + (win < 0 ? T('Hoà!', 'A draw!') : T(HS.n[win] + ' thắng, hơn ' + f1(Math.abs(a - b)) + ' tr.', HS.n[win] + ' wins by ' + f1(Math.abs(a - b)) + ' mn.')) + '</p>' +
        '<button type="button" style="' + btn + 'background:rgba(255,255,255,.15);color:#fff">' + T('Chơi ván mới', 'New game') + '</button>';
      box.querySelector('button').onclick = reset;
    }
  }
})();
