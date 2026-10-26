/* Bến Phù Sa 3D · «Sa bàn đất sét»: ảnh sa bàn (ban ngày tuần 1–3, ban đêm tuần 4–5) phủ lên bản đồ 3D với
   6 ghim địa điểm của game. Bấm ghim = chọn địa điểm như bấm trên bản đồ 3D (ftPick('loc', i)); ghim nhấp nháy
   khi đã có phương thức + món mà chưa có địa điểm; ghim đang chọn được viền sáng; nhãn ghi lượng khách / mưa bão
   theo đúng quy tắc nhãn 3D. Chip «🧱 Sa bàn» trong thanh chế độ bật/tắt, nhớ cho lần sau; vào chế độ khám phá thì tắt. */
(function () {
  var KEY = 'bizon-bps-saban';
  var IMG = { day: 'assets/bps/sa-ban-ngay.webp', night: 'assets/bps/sa-ban-dem.webp' };
  // vị trí ghim theo % ảnh, theo thứ tự LOCS: Chợ nổi · Bến phà · Làng đại học · Công viên bờ sông · Khu công nghiệp · Chợ đêm
  var PIN = { day: [[46, 60], [76, 57], [34, 30], [16, 50], [52, 20], [63, 36]], night: [[33, 58], [60, 60], [68, 28], [20, 35], [47, 20], [85, 33]] };
  var COL = ['#006687', '#2a7f62', '#5b4fcf', '#2e8b3a', '#8a5a2b', '#b8336a'];
  var isEN = function () { try { return (localStorage.getItem('bizon-lang') || 'vi') === 'en'; } catch (e) { return false; } };
  function T(vi, en) { return isEN() ? en : vi; }
  var S = function () { return window.__bps && window.__bps.S; };
  var narrow = function () { return innerWidth < 1024; };
  var on = false, explore = false, box, frame, img, pins = [], legend, chip;

  function build() {
    box = document.getElementById('bps-saban'); if (!box) return false;
    frame = box.querySelector('.bps-sb-box'); img = box.querySelector('img'); legend = box.querySelector('.bps-sb-legend');
    var host = box.querySelector('.bps-sb-pins');
    for (var i = 0; i < 6; i++) {
      var p = document.createElement('button'); p.type = 'button'; p.className = 'bps-sb-pin'; p.dataset.i = i; p.style.setProperty('--c', COL[i]);
      p.innerHTML = '<span class="bps-sb-dot"></span><span class="bps-sb-tag"><b class="bps-sb-name"></b><small class="bps-sb-sub"></small></span>';
      p.onclick = function () { var k = +this.dataset.i; if (explore) return; if (typeof window.ftPick === 'function') window.ftPick('loc', k); };
      host.appendChild(p); pins.push(p);
    }
    chip = document.getElementById('bps3d-mode-saban'); if (chip) chip.onclick = function () { set(!on); };
    addEventListener('resize', size);
    return true;
  }
  function night() { var s = S(); return !!s && s.week >= 3; }
  function size() {
    if (!on || !box || !frame) return;
    var r = box.getBoundingClientRect(), n = narrow();
    var aw = r.width - 24, ah = n ? Math.min(r.height * 0.48, r.height - 100) - 100 : r.height - 130;
    var w = Math.max(200, Math.min(aw, ah * 688 / 384));
    frame.style.width = w + 'px';
    frame.style.top = n ? '96px' : Math.max(70, (r.height - w * 384 / 688) / 2) + 'px';
  }
  function render() {
    if (!box || !on) return; var s = S(), g = window.__bps; if (!s || !g) return;
    var mode = night() ? 'night' : 'day'; if (img.getAttribute('src') !== IMG[mode]) img.src = IMG[mode];
    var L = g.LOCS, wk = g.W && g.W[s.week], lo = wk ? wk.indexOf(Math.min.apply(null, wk)) : -1, storm = wk && wk[lo] < 0.9 ? lo : -1;
    var need = s.sel.m !== null && s.sel.m !== 2 && s.sel.menu !== null && s.sel.loc === null;
    pins.forEach(function (p, i) {
      var c = PIN[mode][i], w0 = wk ? wk[i] : 1;
      p.style.left = c[0] + '%'; p.style.top = c[1] + '%';
      p.querySelector('.bps-sb-dot').textContent = L[i][0];
      p.querySelector('.bps-sb-name').textContent = T(L[i][1], L[i][3]);
      p.querySelector('.bps-sb-sub').textContent = T(L[i][2], L[i][4]) + (i === storm ? ' · 🌧️ ' + T('mưa bão', 'storm') : w0 >= 1.1 ? ' · 🔥 ' + T('đông', 'busy') : '');
      p.classList.toggle('bps-sb-sel', s.sel.loc === i); p.classList.toggle('bps-sb-need', need);
      p.setAttribute('aria-pressed', s.sel.loc === i ? 'true' : 'false');
    });
    legend.textContent = (mode === 'night' ? '🌙 ' : '☀️ ') + T('Tuần ', 'Week ') + (s.week + 1) + '/5 · ' + (explore ? T('đang khám phá – quay về Kinh doanh để chọn', 'exploring – back to Business to choose') : need ? T('bấm một bến để chọn địa điểm', 'tap a spot to choose a location') : T('bấm một bến để chọn · 🔥 đông = nhiều khách', 'tap a spot to choose · 🔥 busy = more customers'));
    size();
  }
  function set(v) {
    on = !!v; document.body.classList.toggle('bps-saban-on', on);
    if (box) box.style.display = on ? 'block' : 'none';
    if (chip) { chip.classList.toggle('bps3d-mode-on', on); chip.setAttribute('aria-pressed', on ? 'true' : 'false'); }
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
    if (on) render();
  }
  function init() {
    if (!build()) return;
    ['bps-pick', 'bps-week', 'bps-lang', 'bps-commit'].forEach(function (n) { addEventListener(n, render); });
    addEventListener('bps-mode', function (e) { explore = !!(e.detail && e.detail.mode === 'explore'); if (explore) set(false); else render(); });
    // lần đầu (chưa có lựa chọn) bật sẵn sa bàn; sau đó nhớ theo người chơi
    var want = true; try { var v = localStorage.getItem(KEY); want = v == null ? true : v === '1'; } catch (e) {}
    if (want) set(true);
  }
  window.BPSSaban = { set: set, toggle: function () { set(!on); }, render: render, state: function () { return { on: on, night: night() }; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
