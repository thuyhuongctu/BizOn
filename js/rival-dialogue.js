/* BizOn – Hội thoại đối thủ ảo: một màn khiêu khích ngắn từ 1 trong 3 đối
 * thủ AI (Alpha Dynamics / Mekong Ventures / Star Clay Co.) ngay trước khi
 * vào tab Quyết định mỗi vòng. Người chơi chọn 1 trong 3 phản ứng, tác
 * động nhẹ lên S.brand/S.balance – KHÔNG thay thế các quyết định giá/
 * marketing/sản xuất thật ở tab Decisions, chỉ là một lớp tương tác/nhập
 * vai thêm trước đó, lấy cảm hứng từ prototype "Dialogue_Joystick".
 *
 * Mỗi vòng hiện đúng 1 lần (S.rivalDialogueShownRound, cùng cơ chế với
 * S.eventShownRound). Đối thủ lên tiếng luân phiên theo vòng: vòng 1/4 →
 * Alpha Dynamics, vòng 2/5 → Mekong Ventures, vòng 3/6 → Star Clay Co.
 *
 * Cùng trang game.html, load sau js/app.js nên dùng thẳng các global đã
 * có sẵn ở đó (S, T, $, save, renderAll, AI_OPPONENTS_LIST) mà không cần
 * khai báo lại. Được gọi từ maybeShowEventIntro() (app.js) trước khi
 * chuyển sang tab tiếp theo của biến cố thị trường.
 */
(function () {
  'use strict';

  var CHOICES = [
    {
      key: 'aggressive',
      label: function () { return T('⚔️ Đối đầu trực diện, tăng ngân sách marketing.', '⚔️ Meet them head-on, raise the marketing budget.'); },
      brand: 0.05,
      cash: -15,
      reply: function () { return T('Được thôi, tôi không ngán đâu! Nhưng đốt tiền mặt sớm thế này, đội các bạn trụ được bao lâu?', "Bring it on, I'm not scared! But burning cash this early — how long can your team hold out?"); }
    },
    {
      key: 'quality',
      label: function () { return T('🛡️ Giữ giá, dồn lực vào chất lượng & thương hiệu.', '🛡️ Hold the price, invest in quality & brand instead.'); },
      brand: 0.08,
      cash: -8,
      reply: function () { return T('Khôn ngoan đấy... nhưng khách hàng có đủ kiên nhẫn chờ thương hiệu của các bạn lớn lên không?', 'Clever move... but will customers be patient enough to wait for your brand to grow?'); }
    },
    {
      key: 'retreat',
      label: function () { return T('🏳️ Bảo toàn dòng tiền, quan sát thêm trước khi ra đòn.', '🏳️ Preserve cash, watch a little longer before acting.'); },
      brand: -0.02,
      cash: 8,
      reply: function () { return T('Hahaha, biết người biết ta là tốt! Vậy thì cứ ôm số tiền đó mà phòng thủ đi nhé.', 'Ha, knowing when to hold back is smart! Go ahead and sit on that cash then.'); }
    }
  ];

  function pickRivalIndex() {
    var round = (S && S.round) || 1;
    return (Math.max(1, round) - 1) % 3;
  }

  function taunt(o) {
    var team = (S.profile && S.profile.teamName) || T('của bạn', 'yours');
    return T(
      o.name + ' nhìn thẳng vào đội bạn: "' + o.motto + '. Vòng này, đội ' + team + ' định làm gì?"',
      o.name + ' looks your team dead in the eye: "' + o.motto + '. So, what is Team ' + team + ' doing this round?"'
    );
  }

  function cardShell(o, bodyHtml) {
    return '<div class="clay-card max-w-sm w-full overflow-hidden text-left">' +
      '<div class="relative pt-5 px-5 pb-0 flex items-end justify-center" style="background:linear-gradient(160deg, ' + o.accent + '33 0%, ' + o.accent + '0d 100%)">' +
        '<img src="' + o.img + '" alt="' + o.name + '" class="h-40 w-auto drop-shadow-xl">' +
        '<span class="absolute top-3 right-3 text-[10px] font-extrabold text-white px-2.5 py-1 rounded-full" style="background:' + o.accent + '">' + o.icon + ' ' + o.style + '</span>' +
      '</div>' +
      '<div class="p-5">' +
        '<h3 class="font-display font-extrabold text-deep-teal text-lg">' + o.name + '</h3>' +
        bodyHtml +
      '</div></div>';
  }

  // Gọi khi bắt đầu một vòng mới (từ maybeShowEventIntro trong app.js), sau
  // khi màn biến cố thị trường đã đóng. onDone() luôn được gọi đúng 1 lần –
  // ngay lập tức nếu không có gì để hiện, hoặc sau khi người chơi đã chọn
  // xong 1 phản ứng và đóng hộp thoại.
  function maybeShow(onDone) {
    if (!S || S.finished || typeof AI_OPPONENTS_LIST !== 'function') { onDone(); return; }
    if (S.rivalDialogueShownRound >= S.round) { onDone(); return; }
    S.rivalDialogueShownRound = S.round;
    save();

    var opponents = AI_OPPONENTS_LIST();
    var o = opponents[pickRivalIndex()];
    if (!o) { onDone(); return; }

    var div = document.createElement('div');
    div.className = 'fixed inset-0 z-[70] bg-deep-teal/60 backdrop-blur-sm flex items-center justify-center p-5 overflow-y-auto';
    div.innerHTML = cardShell(o,
      '<p class="text-sm text-deep-teal italic leading-relaxed mb-4">"' + taunt(o) + '"</p>' +
      '<div id="rd-choices" class="flex flex-col gap-2"></div>');
    document.body.appendChild(div);

    var box = div.querySelector('#rd-choices');
    CHOICES.forEach(function (c) {
      var btn = document.createElement('button');
      btn.className = 'w-full text-left p-3 clay-sunken rounded-2xl text-xs font-semibold text-deep-teal hover:bg-surface-bright cursor-pointer';
      btn.textContent = c.label();
      btn.onclick = function () {
        S.brand = Math.max(0.6, Math.min(1.6, S.brand + c.brand));
        S.balance += c.cash;
        save();
        if (typeof renderAll === 'function') renderAll();
        div.innerHTML = cardShell(o,
          '<p class="text-sm text-deep-teal italic leading-relaxed">"' + c.reply() + '"</p>' +
          '<button id="rd-close" class="clay-btn w-full bg-primary text-white font-display font-bold py-3 mt-4">' + T('Vào vòng ➜', 'Enter the round ➜') + '</button>');
        div.querySelector('#rd-close').onclick = function () { div.remove(); onDone(); };
      };
      box.appendChild(btn);
    });
  }

  window.RivalDialogue = { maybeShow: maybeShow };
})();
