/* BizOn – Bản đồ văn phòng: một widget nhỏ trên Trang chủ ghi lại hành
 * trình 6 vòng/6 tỉnh thành (Cần Thơ → Hà Nội), độc lập với thẻ "Lộ trình
 * mở rộng thị trường" (js/app.js, cắm cờ theo luật thắng/thua thị phần).
 * Ở đây một thành phố được "cắm cờ" ngay khi vòng đó đã chốt quyết định –
 * dù thắng hay thua – để động viên đi hết hành trình thay vì chỉ ghi nhận
 * đội thắng. Sau khi xem kết quả vòng, một "cảnh cắm cờ" toàn màn hình sẽ
 * hiện ra trước khi vào vòng tiếp theo (gọi từ showRoundResult trong app.js).
 *
 * Cùng trang game.html, load sau js/engine.js + js/app.js nên dùng thẳng
 * các global đã có sẵn ở đó (S, T, $, money, ROUNDS_TOTAL, CONQUEST_STOPS)
 * mà không cần import/khai báo lại.
 */
(function () {
  'use strict';

  function stops() {
    return (typeof CONQUEST_STOPS !== 'undefined' && CONQUEST_STOPS) || [];
  }
  function total() {
    return stops().length || (typeof ROUNDS_TOTAL !== 'undefined' ? ROUNDS_TOTAL : 6);
  }

  // Một thành phố được cắm cờ khi vòng đó đã có trong lịch sử (đã chốt
  // quyết định) HOẶC người chơi đang ở vòng sau nó – vế sau chỉ để đảm bảo
  // nếu vì lý do gì đó dữ liệu lịch sử không đủ dài, tiến độ vẫn hiện đúng
  // thay vì phụ thuộc cứng vào một nguồn dữ liệu duy nhất.
  function isCityFlagged(i) {
    if (!S) return false;
    var committed = (S.history || []).length > i;
    var passed = S.finished || S.round > i + 1;
    return committed || passed;
  }

  function flaggedCount() {
    var n = 0;
    for (var i = 0; i < total(); i++) if (isCityFlagged(i)) n++;
    return n;
  }

  function currentCityIndex() {
    if (!S) return -1;
    return Math.min(S.round, total()) - 1;
  }

  function isComplete() {
    return flaggedCount() >= total();
  }

  var CARD_HTML =
    '<div class="clay-card p-5 mb-4">' +
      '<div class="flex items-center justify-between mb-1">' +
        '<h3 class="font-display font-bold text-deep-teal">🖼️ Bản đồ văn phòng</h3>' +
        '<span id="office-flag-count" class="text-[10px] font-extrabold text-clay-orange shrink-0">🚩 0/6</span>' +
      '</div>' +
      '<p class="text-[11px] text-deep-teal/50 mb-3">Treo trên tường – bấm vào để xem lại cả Hành trình BizOn.</p>' +
      '<button id="office-map-widget" type="button" class="relative block w-full rounded-2xl overflow-hidden clay-sunken mx-auto" style="max-width:220px; aspect-ratio:768/1376" aria-label="Mở Hành trình BizOn"></button>' +
    '</div>';

  function mountWidget() {
    if ($('office-map-widget')) return;
    var anchor = $('conquest-map');
    var card = anchor && anchor.closest('.clay-card');
    if (!card) return;
    card.insertAdjacentHTML('beforebegin', CARD_HTML);
    $('office-map-widget').addEventListener('click', openJourneyCard);
  }

  function renderMap() {
    var box = $('office-map-widget');
    if (!box || !S) return;
    var st = stops();
    var curIdx = currentCityIndex();
    var pathPts = st.map(function (s) { return (s.fx * 100).toFixed(1) + ',' + (s.fy * 179).toFixed(1); }).join(' ');
    var dots = st.map(function (s, i) {
      var flagged = isCityFlagged(i);
      var isCur = !S.finished && i === curIdx;
      return '<div class="absolute" style="left:' + (s.fx * 100) + '%; top:' + (s.fy * 100) + '%; transform:translate(-50%,-50%); z-index:5">' +
        '<span class="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white ' + (flagged ? 'bg-clay-orange' : 'bg-white/70') + (isCur ? ' cq-pulse' : '') + '" style="box-shadow:0 1px 3px rgba(0,0,0,.3)">' +
        (flagged ? '<span style="font-size:9px; line-height:1">🚩</span>' : '') +
        '</span></div>';
    }).join('');
    box.innerHTML =
      '<svg viewBox="0 0 100 179" class="absolute inset-0 w-full h-full" preserveAspectRatio="none">' +
        '<rect width="100" height="179" fill="#dcece3"></rect>' +
        '<polyline points="' + pathPts + '" fill="none" stroke="#0f8f6b" stroke-width="1.6" stroke-dasharray="3.2 2.6" stroke-linecap="round" opacity=".65"></polyline>' +
      '</svg>' + dots;
    box.classList.toggle('office-map-complete', isComplete());
    var cnt = $('office-flag-count');
    if (cnt) cnt.textContent = (isComplete() ? '🏅 ' : '🚩 ') + flaggedCount() + '/' + total();
  }

  function render() {
    mountWidget();
    renderMap();
  }

  // Bản đồ chinh phục thật (S.conquest, recordConquest trong app.js) khắt khe
  // hơn hẳn: chỉ đội có thị phần cao nhất VÀ có lãi vòng đó mới thật sự giữ
  // tỉnh, còn không thì tỉnh "tạm về tay" đối thủ AI. Hành trình BizOn ở đây
  // vẫn giữ cờ động viên (cắm dù thắng hay thua) làm chỉ số chính – dòng này
  // chỉ CHÚ THÍCH THÊM ai đang thực sự giữ tỉnh theo luật cạnh tranh, không
  // đổi cách tính cờ/tiến độ đã có.
  function conquestNote(i) {
    var cq = (S.conquest || [])[i];
    if (!cq) return '';
    var text = cq.win
      ? T('🚩 Thực tế: đội bạn đang giữ tỉnh này', '🚩 In reality: your team holds this province')
      : cq.hasTopShare
      ? T('⚠️ Thực tế: thị phần cao nhất nhưng lỗ vòng đó – tạm về tay ' + cq.winner, '⚠️ In reality: top share but a loss that round – held for now by ' + cq.winner)
      : T('🏴 Thực tế: ' + cq.winner + ' đang giữ tỉnh này', '🏴 In reality: ' + cq.winner + ' holds this province');
    return '<p class="text-[10px] text-deep-teal/40 mt-0.5">' + text + '</p>';
  }

  function journeyRow(st, i) {
    var flagged = isCityFlagged(i);
    var isCur = !S.finished && i === currentCityIndex();
    var rep = (S.history || [])[i];
    var detail = rep
      ? T('Giá ' + Math.round(rep.decisions.price).toLocaleString('vi-VN') + 'k · Marketing ' + rep.decisions.marketing + 'tr · Lãi ' + money(rep.netProfit),
          'Price ' + Math.round(rep.decisions.price).toLocaleString('en-US') + 'k · Marketing ' + rep.decisions.marketing + 'm · Profit ' + money(rep.netProfit))
      : isCur
      ? T('⚔️ Đang ở vòng này', '⚔️ Currently here')
      : T('⏳ Chưa tới', '⏳ Not reached yet');
    return '<div class="flex items-start gap-3 py-2' + (i < total() - 1 ? ' border-b border-deep-teal/10' : '') + '">' +
      '<span class="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-extrabold ' + (flagged ? 'bg-clay-orange text-white' : 'bg-deep-teal/10 text-deep-teal/50') + '">' + (flagged ? '🚩' : (i + 1)) + '</span>' +
      '<div class="flex-1 min-w-0">' +
        '<p class="font-bold text-sm text-deep-teal">' + T('Vòng ', 'Round ') + (i + 1) + ' · ' + st.name + '</p>' +
        '<p class="text-[11px] text-deep-teal/55">' + detail + '</p>' +
        conquestNote(i) +
      '</div></div>';
  }

  var BADGE_SEEN_KEY = 'bizon-office-badge-seen';

  // Huy hiệu "chiến tích" – khác với tiêu đề "Hoàn thành hành trình!" ở cảnh
  // cắm cờ (chỉ hiện đúng lúc vừa xong vòng 6): huy hiệu này hiện MỌI LẦN mở
  // lại Hành trình BizOn sau khi đã cắm đủ cờ, như một vật treo cố định
  // trong văn phòng chứ không phải một thông báo nhất thời.
  function badgeHtml() {
    if (!isComplete()) return '';
    return '<div class="clay-sunken rounded-2xl p-4 text-center mb-3">' +
      '<p class="text-4xl">🏅</p>' +
      '<p class="font-display font-extrabold text-deep-teal text-sm mt-1">' + T('Đã chinh phục cả ' + total() + ' tỉnh thành!', 'Conquered all ' + total() + ' provinces!') + '</p>' +
      '<p class="text-[11px] text-deep-teal/55">' + T('Huân chương hành trình – treo lên tường văn phòng của đội.', "The journey's medal, hung on the team's office wall.") + '</p>' +
    '</div>';
  }

  function maybeCelebrateBadge() {
    if (!isComplete()) return;
    var seen = false;
    try { seen = !!localStorage.getItem(BADGE_SEEN_KEY); } catch (e) {}
    if (seen) return;
    try { localStorage.setItem(BADGE_SEEN_KEY, '1'); } catch (e) {}
    if (typeof createConfetti === 'function') createConfetti();
  }

  function openJourneyCard() {
    if (!S) return;
    var st = stops();
    var div = document.createElement('div');
    div.className = 'fixed inset-0 z-[65] bg-deep-teal/50 backdrop-blur-sm flex items-center justify-center p-6';
    div.innerHTML =
      '<div class="clay-card max-w-sm w-full p-6 max-h-[85vh] overflow-y-auto">' +
        '<h3 class="font-display font-extrabold text-deep-teal text-lg mb-1">🗺️ ' + T('Hành trình BizOn', 'The BizOn Journey') + '</h3>' +
        '<p class="text-xs text-deep-teal/55 mb-3">' + T('Cần Thơ đến Hà Nội, mỗi vòng một điểm dừng.', 'Cần Thơ to Hà Nội, one stop per round.') + '</p>' +
        badgeHtml() +
        st.map(journeyRow).join('') +
        '<button class="clay-btn w-full bg-primary text-white font-display font-bold py-3 mt-4">' + T('Đóng', 'Close') + '</button>' +
      '</div>';
    div.querySelector('button').onclick = function () { div.remove(); };
    div.addEventListener('click', function (e) { if (e.target === div) div.remove(); });
    document.body.appendChild(div);
    maybeCelebrateBadge();
  }

  // Gọi từ showRoundResult (app.js) sau khi bấm "Xác nhận & tiếp tục 🚩" –
  // report.decisions/netProfit/balance đều đã có sẵn từ simulateRound.
  function showFlagScene(report, onContinue) {
    var st = stops();
    var stop = st[report.round - 1] || { name: '' };
    var count = flaggedCount();
    var tot = total();
    var isLast = report.round >= tot;
    var d = report.decisions || {};
    var div = document.createElement('div');
    div.className = 'fixed inset-0 z-[75] bg-deep-teal/60 backdrop-blur-sm flex items-center justify-center p-6';
    div.innerHTML =
      '<div class="clay-card max-w-sm w-full p-6 text-center">' +
        '<div class="office-flag-drop text-5xl mb-2">🚩</div>' +
        '<h3 class="font-display font-extrabold text-deep-teal text-lg">' +
          (isLast ? T('🏁 Hoàn thành hành trình!', '🏁 Journey complete!') : T('Đã cắm cờ tại ' + stop.name + '!', 'Flag planted at ' + stop.name + '!')) +
        '</h3>' +
        '<p class="text-xs text-deep-teal/60 mb-3">' + T('Vòng ', 'Round ') + report.round + '/' + tot + '</p>' +
        '<div class="clay-sunken rounded-2xl p-3 text-left text-[11px]">' +
          '<p class="font-extrabold text-deep-teal/50 uppercase mb-1">' + T('Quyết định đã chọn', 'Decision made') + '</p>' +
          '<p class="text-deep-teal/80">' +
            T('Giá <b>' + (d.price || 0).toLocaleString('vi-VN') + 'k</b> · Marketing <b>' + (d.marketing || 0) + 'tr</b> · Sản xuất <b>' + (d.production || 0).toLocaleString('vi-VN') + ' sp</b>',
              'Price <b>' + (d.price || 0).toLocaleString('en-US') + 'k</b> · Marketing <b>' + (d.marketing || 0) + 'm</b> · Production <b>' + (d.production || 0).toLocaleString('en-US') + ' units</b>') +
          '</p>' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-2 text-left text-sm mt-2">' +
          '<div class="bg-surface-bright rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">' + T('Lợi nhuận ròng', 'Net profit') + '</p><p class="font-display font-bold ' + (report.netProfit >= 0 ? 'text-emerald-600' : 'text-orange-600') + '">' + money(report.netProfit) + '</p></div>' +
          '<div class="bg-surface-bright rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">' + T('Số dư mới', 'New balance') + '</p><p class="font-display font-bold text-deep-teal">' + money(report.balance) + '</p></div>' +
        '</div>' +
        '<div class="mt-4">' +
          '<div class="flex justify-between text-[11px] font-bold text-deep-teal/60 mb-1"><span>' + T('Đã cắm cờ', 'Flags planted') + '</span><span>' + count + '/' + tot + '</span></div>' +
          '<div class="w-full h-2.5 rounded-full bg-deep-teal/10 overflow-hidden"><div class="h-full bg-clay-orange rounded-full" style="width:' + Math.round(count / tot * 100) + '%"></div></div>' +
        '</div>' +
        '<button class="clay-btn w-full bg-primary text-white font-display font-bold py-3 mt-4">' +
          (isLast ? T('Xem báo cáo tổng kết ➜', 'View season report ➜') : T('Vào vòng tiếp theo ➜', 'Go to next round ➜')) +
        '</button>' +
      '</div>';
    div.querySelector('button').onclick = function () {
      div.remove();
      render();
      onContinue();
    };
    document.body.appendChild(div);
  }

  window.OfficeRounds = { render: render, showFlagScene: showFlagScene };
})();
