/* Bến Phù Sa – Chơi nhóm: "Bến tàu ra khơi", màn chờ đất sét đi lại được
 * trước khi tạo/vào phòng, dùng js/clay-hub.js (engine dùng chung với
 * js/bps-hub.js ở bản chơi 1 mình). Thuần hiển thị + điều hướng tới 2 ô
 * nhập liệu đã có (tên, mã phòng) — không đụng tới logic phòng/PeerJS.
 * Tự mở 1 lần/phiên khi màn "Sảnh chính" đã lên (dò bằng id ô nhập tên);
 * nếu người chơi đang có phòng dở (màn sảnh chính không hiện) thì không
 * tự mở, tránh chen vào ván đang chơi. Luôn có thể mở lại qua nút nhỏ.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var isEN = function () { try { return (localStorage.getItem('bizon-lang') || 'vi') === 'en'; } catch (e) { return false; } };
  function T(vi, en) { return isEN() ? en : vi; }
  var $ = function (id) { return document.getElementById(id); };
  var SEEN_KEY = 'bizon-bps-nhom-hub-seen';

  function focusField(id) {
    var el = $(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () { el.focus(); }, 350);
  }

  function buildConfig() {
    return {
      title: T('⛵ Bến tàu ra khơi', '⛵ The Launch Wharf'),
      subtitle: T('Chơi nhóm 5 vai', '5-role team play'),
      hint: T('WASD / mũi tên / joystick / chạm sàn để đi. Đến gần rồi bấm <b>E</b> hoặc chạm để nói.', 'WASD / arrows / joystick / tap the floor to move. Get close and press <b>E</b> or tap to interact.'),
      exitLabel: T('Bỏ qua, vào thẳng ▸', 'Skip, go straight in ▸'),
      byeLabel: T('Rõ rồi.', 'Got it.'),
      width: 1400, height: 900,
      decor: [
        { x: 160, y: 20, w: 200, h: 130, img: 'assets/illustrations/game/river-worldmap.webp' },
        { x: 1040, y: 20, w: 200, h: 130, img: 'assets/illustrations/game/mekong-capital.webp' },
      ],
      player: { img: 'assets/character/team/minh-long-cut.webp', name: T('Bạn', 'You'), x: 700, y: 760 },
      npcs: [
        { id: 'lumina', img: 'assets/character/phu-sa/huong-cut.webp', icon: '🤖', name: 'Lumina', x: 700, y: 560,
          desc: T(
            'Đội Rồng Xanh có 5 vai: CEO chốt bến, CFO giữ quỹ, CMO lo cách bán và quảng cáo, COO chọn món và số lượng nấu, Thư ký trinh sát. Mỗi vai chỉ thấy một phần tin — cả đội phải nói chuyện với nhau rồi cùng chốt trước khi hết giờ.',
            "Team Rồng Xanh has 5 roles: the CEO picks the landing, the CFO holds the funds, the CMO runs selling and ads, the COO picks the product and quantity, the Secretary scouts. Each role sees only part of the intel, so the team has to talk and lock in before time runs out."
          ) },
      ],
      stations: [
        { id: 'create', icon: '⛵', art: 'assets/illustrations/game/celebrate-shop.webp', name: T('Tạo phòng mới', 'Create a room'), x: 420, y: 380,
          onOpen: function (api) {
            api.dialogue(
              { name: T('Tạo phòng mới', 'Create a room'), icon: '⛵', art: 'assets/illustrations/game/celebrate-shop.webp', station: true },
              T('Bạn sẽ làm chủ phòng. Nhập tên rồi bấm «Tạo phòng» — mã phòng hiện ra để chia cho cả đội.', "You'll be the room host. Enter your name, then tap «Create room» — a room code appears for your team."),
              [{ text: T('Dẫn tôi tới đó', 'Take me there'), primary: true, onPick: function () { api.exit(); focusField('bps-nhom-name-input'); } }]
            );
          } },
        { id: 'join', icon: '🔑', art: 'assets/illustrations/game/paths-compass.webp', name: T('Vào phòng có sẵn', 'Join a room'), x: 980, y: 380,
          onOpen: function (api) {
            api.dialogue(
              { name: T('Vào phòng có sẵn', 'Join a room'), icon: '🔑', art: 'assets/illustrations/game/paths-compass.webp', station: true },
              T('Đã có mã phòng từ đồng đội? Nhập tên, gõ mã phòng rồi bấm «Vào».', 'Already have a room code from a teammate? Enter your name, type the room code, then tap «Join».'),
              [{ text: T('Dẫn tôi tới đó', 'Take me there'), primary: true, onPick: function () { api.exit(); focusField('bps-nhom-code-input'); } }]
            );
          } },
      ],
    };
  }

  function mountReopenButton() {
    if ($('bps-nhom-hub-enter')) return;
    var anchor = $('bps-nhom-name-wrap');
    if (!anchor) return;
    var btn = document.createElement('button');
    btn.id = 'bps-nhom-hub-enter'; btn.type = 'button';
    btn.style.cssText = 'align-self:flex-start;border:none;background:transparent;padding:0;margin-top:-4px;font-size:12px;font-weight:800;color:#006687;cursor:pointer;font-family:inherit;';
    btn.textContent = T('⛵ Xem lại bến tàu', '⛵ Revisit the wharf');
    btn.onclick = function () { window.ClayHub.open(buildConfig()); };
    anchor.insertAdjacentElement('beforebegin', btn);
  }

  var tries = 0;
  (function wait() {
    var nameField = $('bps-nhom-name-input');
    if (nameField) {
      mountReopenButton();
      var seen = false;
      try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; } catch (e) {}
      if (!seen && window.ClayHub) {
        try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
        window.ClayHub.open(buildConfig());
      }
      return;
    }
    if (++tries < 40) setTimeout(wait, 250);
  })();
})();
