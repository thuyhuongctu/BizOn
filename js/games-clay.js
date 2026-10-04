/* ============================================================================
   BizOn Clay — Trung tâm trò chơi (Arcade): thẻ game + 3 mini-game tương tác.
   Song ngữ theo window.clayCurrentLang(). EnQuiz dùng ngân hàng QUIZ_BANK
   (js/quiz-bank.js). Nạp SAU bizon-clay-i18n.js và quiz-bank.js.
   ========================================================================== */
(function(){
  if(window.__bizonArcade) return; window.__bizonArcade = true;

  var CLAY = ['#7FD3DC','#FFD58A','#F4B6C2','#A9DCC4'];
  var BEATS = {0:2,2:1,1:0}, BASE = [[40,42],[70,30],[110,20]];
  var B = 'https://thuyhuongctu.github.io/BizOn/';

  var T = {
    vi:{ psTitle:'Tất cả trò chơi đã mở và có trên CH Play', psBody:'Cài ứng dụng BizOn lên điện thoại Android để chơi mọi lúc, kể cả khi mạng chập chờn.', gp:'Tải trên Google Play',
      h1:'Trung tâm trò chơi', lead:'Hệ thống game mô phỏng và mini-game của BizOn Bật Nghiệp – từ chiến lược nhiều vòng đến phản xạ 30 giây. Chọn và chơi ngay!',
      pathTag:'3 game chính · mỗi game có bản 2D & 3D', pathTitle:'Đi từ bến sông ra biển lớn', play:'Chơi ngay', d3:'Bản 3D',
      mains:[['BẬC 1 · BẮT ĐẦU Ở ĐÂY','','Gánh Hàng Khởi Nghiệp: Bến Phù Sa','Khởi nghiệp hàng rong 5 tuần ở thị trấn sông nước Bến Phù Sa (cảm hứng chợ nổi miền Tây): mỗi tuần chọn Phương thức – Món hàng – Địa điểm, học quan sát thị trường và bài toán thử nhanh rồi nhân rộng. Đậm chất miền Tây: ghe hàng bông, cây bẹo, lễ cúng Bà Cậu.','5–10 phút · chơi đơn, offline · làm quen trước khi vào Bật Nghiệp'],['BẬC 2A · GAME CHÍNH','','BizOn Bật Nghiệp','Mô phỏng kinh doanh chiến lược 6 vòng: định giá, sản xuất, marketing, nhân sự, tài chính – đấu với 3 đối thủ AI qua các biến cố Price War, Khủng hoảng năng lượng, Việt Nam Hóa Rồng. Có cố vấn AI Lumina, 7 báo cáo quản trị, cửa hàng vật phẩm, cây kỹ năng và chứng nhận hoàn thành.','30–60 phút · chơi theo đội 5 vai trò · cài được lên điện thoại'],['BẬC 2B · GAME CHÍNH','QUỐC TẾ HÓA · 6 QUÝ','Hộ Chiếu Thương Hiệu','BizOn Go Global: chọn 1 trong 4 doanh nghiệp, đưa thương hiệu Việt từ Vàm Thịnh ra 7 thị trường giả tưởng – sương mù thông tin, đàm phán đối tác, sự kiện bất định; thành công đo bằng 5 chiều: lợi nhuận, uy tín, năng lực, thích ứng, bền vững.','30–60 phút · chơi đơn, offline · tiếp theo sau Bến Phù Sa']],
      sides:[['Hộ Chiếu Thương Hiệu Mini','MỚI · 30 PHÚT','Bản rút gọn của Hộ Chiếu Thương Hiệu cho sinh viên không chuyên kinh doanh quốc tế: 3 thị trường, mỗi quý chỉ 3 quyết định (đầu tư, chính sách, chuyển lợi nhuận về nước).','Chơi'],['BizOn Việt Nam','ĐANG MỞ','Thị trường nội địa 2026: biến cố Hóa Rồng, đối thủ Việt, bản tin Thị trường sống. Chơi đơn (offline) cùng 3 đội AI.','Vào game'],['BizOn Go Global','ĐANG MỞ','Từ Việt Nam vươn ra thế giới: chọn thị trường Á · Âu · Mỹ, chọn phương thức thâm nhập (Export, Licensing, Liên doanh, FDI) và kinh doanh trong kỷ nguyên số.','Chơi thử']],
      miniTag:'Trò chơi nhỏ · demo & ôn luyện', miniTitle:'Luyện một kỹ năng trong vài phút', start:'Chơi', guess:'Đoán', open:'Mở',
      qName:'EnQuiz · Trắc nghiệm Khởi nghiệp', qTag:'SẮP CÓ TRÊN CH PLAY', qFull:'Mở toàn màn hình', qPlay:'Chơi ngay tại đây', qClose:'Thu gọn', qDesc:'Ứng dụng trắc nghiệm EnQuiz – chơi ngay trong trang hoặc mở toàn màn hình. Đã lưu trữ trên Zenodo và sắp được công khai trên CH Play.', qNew:'Bộ đề mới', qOk:'Chính xác! ', qNo:'Đáp án đúng: ', qNext:'Câu tiếp theo', qEnd:'Xem kết quả', qQ:'Câu', qRight:'Đúng', qDone:'HOÀN THÀNH · Ngân hàng 100 câu – mỗi lượt là một bộ đề khác nhau', qTier:['📚 Vào game chính học qua thực chiến nhé!','👍 Nền tảng vững – luyện thêm nhé!','🥇 Nhà sáng lập tiềm năng!','🏆 Tố chất CEO thực thụ!'], qRes:'Kết quả',
      pName:'Đoán Giá Thị Trường', pDesc:'Thị trường đã chốt giá cân bằng 50–250 nghìn ₫ – bạn có 7 lượt tìm ra nó.', pInit:'Thị trường đã chốt giá cân bằng. Còn 7 lượt đoán.', pBad:'⚠️ Nhập một mức giá từ 50 đến 250 (nghìn ₫).', pWin:function(n){return '🎉 Chuẩn! Giá cân bằng là '+n+' nghìn ₫ – đúng chất CFO!';}, pLose:function(n){return '💥 Hết lượt! Giá cân bằng là '+n+' nghìn ₫. Nhấn "Chơi" để thử lại.';}, pLow:'📈 Giá bạn đặt THẤP hơn thị trường (dư cầu).', pHigh:'📉 Giá bạn đặt CAO hơn thị trường (ế hàng).', pHot:' 🔥 Rất gần rồi!', pLeft:function(n){return ' Còn '+n+' lượt.';},
      hName:'Đấu Trường 1v1', hDesc:'Đối đầu CEO AI qua 3 hiệp: mỗi hiệp chọn 1 chiến lược giá – kết thúc bằng màn so tài chỉ số Head-to-Head.', hRound:function(r){return 'Hiệp '+r+'/3 · Bạn ⚔️ CEO AI "Delta"';}, hMoves:[['Giá rẻ','Giành thị phần, biên mỏng'],['Cân bằng','Ổn định đôi đường'],['Cao cấp','Biên dày, kén khách']], hW:'THẮNG', hL:'THUA', hT:'HÒA', hWin:'🏆 BẠN THẮNG TRẬN ĐỐI ĐẦU!', hLose:'💪 CEO AI thắng trận này!', hScore:function(y,a,yp,ap){return 'Tỷ số hiệp: Bạn '+y+' – '+a+' AI · Lợi nhuận '+yp+'tr – '+ap+'tr';}, hTip:'Mẹo khắc chế: Giá rẻ thắng Cao cấp · Cao cấp thắng Cân bằng · Cân bằng thắng Giá rẻ',
      ext:[['Demo 1 vòng','KHÔNG CẦN ĐĂNG NHẬP','Kéo 3 thanh quyết định, xem thị trường phản ứng tức thì – hiểu luật chơi trong 60 giây.','gioi-thieu.html#demo'],['Clay Factory Frenzy','PHẢN XẠ 30s','Băng chuyền xưởng đất sét – chạm đúng món hàng được đặt để đóng gói. Trong game chính, điểm đổi được quà ở Clay Reward Shop!','games.html'],['Clay Sort – Phân loại','PHẢN XẠ 30s','Băng chuyền thả hình đất nặn – chạm đúng thùng (Hộp / Cầu / Tháp) trước khi hàng rơi xuống. Chuỗi đúng liên tiếp nhân điểm!','games.html'],['Bắt Vốn Vàng','PHẢN XẠ 30s','Gọi vốn 30 giây: hứng đồng vàng, né chi phí phát sinh. Chạm / chuột / phím ← →.','games.html']],
      contact:'Liên hệ:' },
    en:{ psTitle:'Every game is open and on Google Play', psBody:'Install the BizOn app on Android to play anytime, even on patchy connections.', gp:'Get it on Google Play',
      h1:'Game centre', lead:'BizOn Bật Nghiệp’s simulations and mini-games – from multi-round strategy to 30-second reflex drills. Pick one and play!',
      pathTag:'3 main games · each with 2D & 3D versions', pathTitle:'From the riverbank to the open sea', play:'Play now', d3:'3D version',
      mains:[['LEVEL 1 · START HERE','','Street-Vendor Start-up: Bến Phù Sa','A 5-week street-vendor venture in the river town of Bến Phù Sa (inspired by Mekong floating markets): each week pick a Mode – Product – Location, learning to read the market and to test fast, then scale. Full of Mekong flavour: produce boats, bẹo poles, the Bà Cậu offering festival.','5–10 min · solo, offline · warm-up before Bật Nghiệp'],['LEVEL 2A · MAIN GAME','','BizOn Bật Nghiệp','A 6-round strategic business simulation: pricing, production, marketing, HR and finance – against 3 AI rivals through Price War, Energy Crisis and Vietnam Rising events. With the Lumina AI advisor, 7 management reports, an item shop, a skill tree and a completion certificate.','30–60 min · teams of 5 roles · installable on phones'],['LEVEL 2B · MAIN GAME','INTERNATIONALISATION · 6 QUARTERS','Brand Passport','BizOn Go Global: pick 1 of 4 firms and take a Vietnamese brand from Vàm Thịnh to 7 fictional markets – information fog, partner negotiations, uncertain events; success is measured on 5 dimensions: profit, reputation, capability, adaptation, sustainability.','30–60 min · solo, offline · next after Bến Phù Sa']],
      sides:[['Brand Passport Mini','NEW · 30 MIN','A condensed Brand Passport for students outside international business: 3 markets, only 3 decisions per quarter (investment, policy, profit repatriation).','Play'],['BizOn Vietnam','OPEN','The 2026 domestic market: Vietnam Rising events, Vietnamese rivals, a live market feed. Solo (offline) against 3 AI teams.','Enter'],['BizOn Go Global','OPEN','From Vietnam to the world: choose Asian · European · American markets and an entry mode (Export, Licensing, Joint venture, FDI) in the digital era.','Try it']],
      miniTag:'Mini-games · demos & practice', miniTitle:'Practise one skill in a few minutes', start:'Play', guess:'Guess', open:'Open',
      qName:'EnQuiz · Start-up Quiz', qTag:'COMING TO GOOGLE PLAY', qFull:'Open full screen', qPlay:'Play here', qClose:'Collapse', qDesc:'The EnQuiz quiz app – play right on this page or open it full screen. Archived on Zenodo and coming soon to Google Play.', qNew:'New set', qOk:'Correct! ', qNo:'Correct answer: ', qNext:'Next question', qEnd:'See result', qQ:'Question', qRight:'Correct', qDone:'DONE · 100-question bank – every round is a new set', qTier:['📚 Learn by doing in the main game!','👍 Solid basics – keep practising!','🥇 Promising founder!','🏆 True CEO material!'], qRes:'Result',
      pName:'Guess the Market Price', pDesc:'The market has settled on an equilibrium price of 50–250 thousand ₫ – you have 7 tries to find it.', pInit:'The market price is set. 7 guesses left.', pBad:'⚠️ Enter a price between 50 and 250 (thousand ₫).', pWin:function(n){return '🎉 Spot on! The equilibrium price is '+n+' thousand ₫ – a true CFO!';}, pLose:function(n){return '💥 Out of guesses! The equilibrium price was '+n+' thousand ₫. Press "Play" to retry.';}, pLow:'📈 Your price is BELOW the market (excess demand).', pHigh:'📉 Your price is ABOVE the market (unsold stock).', pHot:' 🔥 Very close!', pLeft:function(n){return ' '+n+' left.';},
      hName:'1v1 Arena', hDesc:'Face an AI CEO over 3 rounds: pick one pricing strategy per round – ending in a head-to-head stats showdown.', hRound:function(r){return 'Round '+r+'/3 · You ⚔️ AI CEO "Delta"';}, hMoves:[['Low price','Win share, thin margin'],['Balanced','Steady both ways'],['Premium','Thick margin, picky buyers']], hW:'WIN', hL:'LOSS', hT:'DRAW', hWin:'🏆 YOU WIN THE SHOWDOWN!', hLose:'💪 The AI CEO wins this one!', hScore:function(y,a,yp,ap){return 'Rounds: You '+y+' – '+a+' AI · Profit '+yp+'m – '+ap+'m';}, hTip:'Counter tip: Low price beats Premium · Premium beats Balanced · Balanced beats Low price',
      ext:[['1-round demo','NO SIGN-IN','Drag 3 decision sliders and watch the market react instantly – learn the rules in 60 seconds.','gioi-thieu.html#demo'],['Clay Factory Frenzy','30s REFLEX','A clay-workshop conveyor – tap the ordered item to pack it. In the main game, points buy rewards at the Clay Reward Shop!','games.html'],['Clay Sort','30s REFLEX','Clay shapes drop down – tap the right bin (Box / Ball / Tower) before they fall. Streaks multiply your score!','games.html'],['Catch the Golden Capital','30s REFLEX','A 30-second funding round: catch gold coins, dodge surprise costs. Touch / mouse / ← → keys.','games.html']],
      contact:'Contact:' }
  };
  function lang(){ return (window.clayCurrentLang && window.clayCurrentLang()) === 'en' ? 'en' : 'vi'; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function bank(){ return (typeof QUIZ_BANK !== 'undefined') ? QUIZ_BANK : (window.QUIZ_BANK || []); }

  /* ---- Trạng thái mini-game ---- */
  var quiz = null, price = null, h2h = null, enq = false;

  /* =================== Static blocks =================== */
  function renderStatic(){
    var t = T[lang()];
    var set = function(id, html){ var e = document.getElementById(id); if(e) e.innerHTML = html; };
    set('ar-h1', esc(t.h1));
    set('ar-lead', esc(t.lead));
    set('ar-ps', '<div style="flex:1 1 300px"><div style="font-family:var(--clay-head);font-size:22px;font-weight:800;line-height:1.2;color:#fff">'+esc(t.psTitle)+'</div><div style="margin-top:4px;font-size:14px;color:#9CC9C9">'+esc(t.psBody)+'</div></div>'
      + '<a href="https://play.google.com/store/apps/details?id=io.github.thuyhuongctu.bizon" style="display:flex;align-items:center;gap:10px;padding:12px 20px;border-radius:18px;background:var(--clay-gold);color:#033337;font:800 17px var(--clay-head);box-shadow:inset 0 -5px 0 rgba(0,0,0,.18),inset 0 3px 0 rgba(255,255,255,.4)">▶ '+esc(t.gp)+'</a>');
    set('ar-pathtag', esc(t.pathTag));
    set('ar-pathtitle', esc(t.pathTitle));
    set('ar-minitag', esc(t.miniTag));
    set('ar-minititle', esc(t.miniTitle));

    /* jumps */
    set('ar-jumps', t.mains.map(function(m,i){
      var nm = m[2].split(':').pop().trim();
      return '<a href="#g'+i+'" style="display:flex;align-items:center;gap:8px;padding:9px 14px 9px 9px;border-radius:999px;background:var(--clay-card);color:var(--clay-ink);font-size:14px;font-weight:800;box-shadow:inset 0 -4px 0 rgba(110,70,30,.12),0 10px 16px -12px rgba(110,70,30,.6)"><span style="display:grid;place-items:center;min-width:30px;height:30px;padding:0 8px;border-radius:999px;background:'+CLAY[i]+';font-size:12px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.12)">'+['1','2A','2B'][i]+'</span>'+esc(nm)+'</a>';
    }).join(''));

    /* mains */
    var img = ['assets/concept/tier-1-ben-phu-sa.jpg','assets/concept/tier-2a-bat-nghiep.jpg','assets/concept/tier-2b-ho-chieu.jpg'];
    var tagBg = ['#0F5C4E','#E8762D','#B3541A'];
    var play = [B+'ben-phu-sa.html', B+'game.html', B+'brand-passport.html'];
    var d3 = [B+'ben-phu-sa-3d.html', B+'BizOn Game 3D.html', B+'Ho Chieu Thuong Hieu 3D.html'];
    set('ar-mains', t.mains.map(function(m,i){
      return '<article id="g'+i+'" style="display:flex;flex-wrap:wrap;gap:22px;align-items:center;padding:14px;border-radius:32px;background:var(--clay-card);box-shadow:inset 0 -9px 0 rgba(110,70,30,.08),inset 0 5px 0 #fff,0 26px 36px -26px rgba(110,70,30,.55)">'
        + '<div style="flex:1 1 220px;max-width:300px;margin:0 auto;position:relative;aspect-ratio:540/666;border-radius:24px;overflow:hidden;background:var(--clay-tray)"><img src="'+img[i]+'" alt="" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></div>'
        + '<div style="flex:999 1 320px;padding:8px 14px 8px 4px;display:flex;flex-direction:column;gap:10px">'
        + '<div style="display:flex;flex-wrap:wrap;gap:8px"><span style="padding:5px 12px;border-radius:999px;background:'+tagBg[i]+';color:#fff;font-size:12px;font-weight:800;box-shadow:inset 0 -3px 0 rgba(0,0,0,.15)">'+esc(m[0])+'</span>'+(m[1]?'<span style="padding:5px 12px;border-radius:999px;background:#D9F0F2;color:#03474F;font-size:12px;font-weight:800">'+esc(m[1])+'</span>':'')+'</div>'
        + '<h3 style="margin:0;font-family:var(--clay-head);font-size:30px;font-weight:800;line-height:1.14">'+esc(m[2])+'</h3>'
        + '<p style="margin:0;font-size:15px;line-height:1.6;color:var(--clay-sub)">'+esc(m[3])+'</p>'
        + '<div style="font-size:13px;font-weight:700;color:#6B7F80">'+esc(m[4])+'</div>'
        + '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:4px">'
        + '<a href="'+esc(play[i])+'" style="padding:13px 22px;border-radius:18px;background:#E8762D;color:#fff;font-family:var(--clay-head);font-size:18px;font-weight:800;box-shadow:inset 0 -6px 0 rgba(0,0,0,.18),inset 0 3px 0 rgba(255,255,255,.3),0 12px 18px -10px rgba(232,118,45,.8)">'+esc(t.play)+'</a>'
        + '<a href="'+esc(d3[i])+'" style="padding:13px 20px;border-radius:18px;background:var(--clay-tray);color:var(--clay-ink);font-family:var(--clay-head);font-size:18px;font-weight:800;box-shadow:inset 0 -5px 0 rgba(110,70,30,.15)">'+esc(t.d3)+'</a>'
        + '</div></div></article>';
    }).join(''));

    /* sides */
    var sbg = ['#DDF1E4','#FFE6B8','#D9F0F2'];
    var shref = [B+'Ho Chieu Mini.dc.html', B+'game.html', B+'global.html'];
    set('ar-sides', t.sides.map(function(s,i){
      return '<a href="'+esc(shref[i])+'" style="display:flex;flex-direction:column;gap:8px;padding:22px;border-radius:28px;background:'+sbg[i]+';color:var(--clay-ink);box-shadow:inset 0 -8px 0 rgba(0,0,0,.07),inset 0 5px 0 rgba(255,255,255,.5),0 20px 28px -22px rgba(110,70,30,.55)">'
        + '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><span style="font-family:var(--clay-head);font-size:22px;font-weight:800">'+esc(s[0])+'</span><span style="padding:3px 10px;border-radius:999px;background:var(--clay-card);font-size:11px;font-weight:800">'+esc(s[1])+'</span></div>'
        + '<p style="margin:0;font-size:14px;line-height:1.55;color:#24403F">'+esc(s[2])+'</p>'
        + '<span style="margin-top:auto;font-size:14px;font-weight:800;color:var(--clay-teal)">'+esc(s[3])+' →</span></a>';
    }).join(''));

    /* ext reflex games */
    var xbg = ['#DDF1E4','#FFE6B8','#FFE6B8','#FFE6B8'];
    set('ar-ext', t.ext.map(function(x){
      return '<a href="'+esc(B+x[3])+'" style="display:flex;justify-content:space-between;gap:12px;align-items:start;padding:22px;border-radius:28px;background:var(--clay-card);color:var(--clay-ink);box-shadow:inset 0 -8px 0 rgba(110,70,30,.08),inset 0 5px 0 #fff,0 20px 28px -22px rgba(110,70,30,.55)">'
        + '<div><div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><span style="font-family:var(--clay-head);font-size:22px;font-weight:800">'+esc(x[0])+'</span><span style="padding:3px 10px;border-radius:999px;background:'+xbg[0]+';font-size:11px;font-weight:800">'+esc(x[1])+'</span></div><p style="margin:4px 0 0;font-size:14px;line-height:1.5;color:var(--clay-sub)">'+esc(x[2])+'</p></div>'
        + '<span style="flex:none;padding:10px 14px;border-radius:16px;background:var(--clay-tray);font:800 15px var(--clay-head);box-shadow:inset 0 -4px 0 rgba(110,70,30,.15)">'+esc(t.open)+' ↗</span></a>';
    }).join(''));
  }

  /* =================== EnQuiz =================== */
  function renderQuiz(){
    var t = T[lang()], el = document.getElementById('ar-quiz'); if(!el) return;
    var cur = quiz && !quiz.done ? quiz.set[quiz.i] : null;
    var head =
      '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;align-items:center">'
      + '<div style="flex:1 1 320px"><div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><span style="font-family:var(--clay-head);font-size:26px;font-weight:800;line-height:1.14">'+esc(t.qName)+'</span><span style="padding:4px 10px;border-radius:999px;background:#FFE6B8;color:#7A4A0E;font-size:11px;font-weight:800;box-shadow:inset 0 -2px 0 rgba(0,0,0,.08)">'+esc(t.qTag)+'</span></div>'
      + '<p style="margin:6px 0 0;font-size:15px;line-height:1.55;color:#03343A">'+esc(t.qDesc)+'</p>'
      + '<a href="https://doi.org/10.5281/zenodo.21850735" style="display:inline-flex;margin-top:10px;padding:6px 12px;border-radius:999px;background:var(--clay-card);color:var(--clay-ink);font-family:var(--clay-mono);font-size:12px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.08)">Zenodo · DOI 10.5281/zenodo.21850735</a></div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:10px">'
      + '<button type="button" id="ar-enq-toggle" style="border:0;cursor:pointer;padding:13px 20px;border-radius:18px;background:var(--clay-teal);color:#fff;font:800 17px var(--clay-head);box-shadow:inset 0 -5px 0 rgba(0,0,0,.2),inset 0 3px 0 rgba(255,255,255,.25)">'+esc(enq?t.qClose:t.qPlay)+'</button>'
      + '<a href="https://thuyhuongctu.github.io/EnQuiz/" target="_blank" rel="noopener" style="padding:13px 20px;border-radius:18px;background:var(--clay-card);color:var(--clay-ink);font:800 17px var(--clay-head);box-shadow:inset 0 -5px 0 rgba(110,70,30,.12)">'+esc(t.qFull)+' ↗</a>'
      + '</div></div>';

    /* in-page quiz widget */
    var widget = '<div style="margin-top:18px;padding:18px;border-radius:24px;background:var(--clay-card);box-shadow:inset 0 4px 8px rgba(0,60,80,.12)">';
    if(!quiz){
      widget += '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;align-items:center"><div style="font-size:14px;color:var(--clay-sub)">'+esc(t.qDone)+'</div>'
        + '<button type="button" id="ar-quiz-start" style="border:0;cursor:pointer;padding:11px 18px;border-radius:16px;background:var(--clay-teal);color:#fff;font:800 15px var(--clay-head);box-shadow:inset 0 -4px 0 rgba(0,0,0,.2)">'+esc(t.start)+'</button></div>';
    } else if(quiz.done){
      var tier = t.qTier[quiz.score>=9?3:quiz.score>=7?2:quiz.score>=5?1:0];
      widget += '<div style="font-family:var(--clay-head);font-size:20px;font-weight:800">'+esc(t.qRes+': '+quiz.score+'/'+quiz.set.length+' – '+tier)+'</div>'
        + '<button type="button" id="ar-quiz-start" style="margin-top:12px;border:0;cursor:pointer;padding:11px 18px;border-radius:16px;background:var(--clay-teal);color:#fff;font:800 15px var(--clay-head);box-shadow:inset 0 -4px 0 rgba(0,0,0,.2)">'+esc(t.qNew)+'</button>';
    } else {
      widget += '<div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#7A4A0E">'+esc(t.qQ+' '+(quiz.i+1)+'/'+quiz.set.length+' · '+cur.c+' · '+t.qRight+': '+quiz.score)+'</div>';
      widget += '<div style="margin-top:10px;font-size:17px;font-weight:800;line-height:1.4">'+esc(cur.q)+'</div>';
      widget += '<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">';
      if(quiz.picked == null){
        widget += cur.o.map(function(o,k){
          return '<button type="button" data-qpick="'+k+'" style="border:0;cursor:pointer;text-align:left;padding:12px 14px;border-radius:14px;background:var(--clay-bg);font:600 15px var(--clay-sans);color:var(--clay-ink);box-shadow:inset 0 -3px 0 rgba(110,70,30,.1)">'+'ABCD'[k]+'. '+esc(o)+'</button>';
        }).join('');
        widget += '</div>';
      } else {
        widget += cur.o.map(function(o,k){
          var right = k===cur.a, chosen = k===quiz.picked;
          var bg = right ? '#DDF1E4' : (chosen ? '#FDE1CE' : 'var(--clay-bg)');
          return '<div style="padding:12px 14px;border-radius:14px;background:'+bg+';font:600 15px var(--clay-sans);color:var(--clay-ink)">'+'ABCD'[k]+'. '+esc(o)+(right?' ✅':(chosen?' ❌':''))+'</div>';
        }).join('');
        widget += '</div>';
        var fb = (quiz.picked===cur.a ? '✅ '+t.qOk : '❌ '+t.qNo+'ABCD'[cur.a]+'. '+cur.o[cur.a]+' – ') + cur.e;
        widget += '<p style="margin:12px 0 0;font-size:14px;line-height:1.55;color:#24403F">'+esc(fb)+'</p>';
        widget += '<button type="button" id="ar-quiz-next" style="margin-top:12px;border:0;cursor:pointer;padding:11px 18px;border-radius:16px;background:#FFD58A;color:#033337;font:800 15px var(--clay-head);box-shadow:inset 0 -4px 0 rgba(0,0,0,.12)">'+esc(quiz.i+1<quiz.set.length?t.qNext:t.qEnd)+' →</button>';
      }
    }
    widget += '</div>';

    var iframe = enq ? '<div style="margin-top:18px;padding:8px;border-radius:24px;background:var(--clay-card);box-shadow:inset 0 4px 8px rgba(0,60,80,.18)"><iframe src="https://thuyhuongctu.github.io/EnQuiz/" title="EnQuiz" loading="lazy" allow="autoplay; fullscreen" style="display:block;width:100%;height:min(78vh,720px);border:0;border-radius:18px;background:#fff"></iframe></div>' : '';

    el.innerHTML = head + widget + iframe;

    var tg = document.getElementById('ar-enq-toggle'); if(tg) tg.onclick = function(){ enq = !enq; renderQuiz(); };
    var st = document.getElementById('ar-quiz-start'); if(st) st.onclick = function(){ var b = bank(); quiz = { set: b.slice().sort(function(){ return Math.random()-.5; }).slice(0,10), i:0, score:0, picked:null, done:false }; renderQuiz(); };
    el.querySelectorAll('button[data-qpick]').forEach(function(b){ b.onclick = function(){
      if(quiz.picked != null) return; var k = +b.getAttribute('data-qpick');
      if(k === quiz.set[quiz.i].a) quiz.score++; quiz.picked = k; renderQuiz();
    }; });
    var nx = document.getElementById('ar-quiz-next'); if(nx) nx.onclick = function(){
      if(quiz.i+1 < quiz.set.length){ quiz.i++; quiz.picked = null; } else quiz.done = true; renderQuiz();
    };
  }

  /* =================== Đoán giá =================== */
  function renderPrice(){
    var t = T[lang()], el = document.getElementById('ar-price'); if(!el) return;
    var head = '<div style="display:flex;justify-content:space-between;gap:12px;align-items:start"><div><div style="font-family:var(--clay-head);font-size:22px;font-weight:800">'+esc(t.pName)+'</div><p style="margin:4px 0 0;font-size:14px;line-height:1.5;color:var(--clay-sub)">'+esc(t.pDesc)+'</p></div>'
      + '<button type="button" id="ar-price-start" style="flex:none;border:0;cursor:pointer;padding:10px 16px;border-radius:16px;background:var(--clay-teal);color:#fff;font:800 15px var(--clay-head);box-shadow:inset 0 -4px 0 rgba(0,0,0,.2)">'+esc(t.start)+'</button></div>';
    var body = '';
    if(price){
      body = '<div style="display:flex;gap:8px;margin-top:16px">'
        + '<input type="number" min="50" max="250" id="ar-price-in" value="'+esc(price.val)+'" placeholder="150" style="flex:1;min-width:0;border:0;outline:none;padding:12px 14px;border-radius:16px;background:var(--clay-tray);font:700 15px var(--clay-sans);color:var(--clay-ink);box-shadow:inset 3px 4px 8px rgba(110,70,30,.18)">'
        + '<button type="button" id="ar-price-guess" style="border:0;cursor:pointer;padding:0 18px;border-radius:16px;background:#E8762D;color:#fff;font:800 15px var(--clay-head);box-shadow:inset 0 -4px 0 rgba(0,0,0,.18)">'+esc(t.guess)+'</button></div>'
        + '<p style="margin:10px 0 0;font-size:13px;line-height:1.5;color:#24403F">'+esc(price.fb || t.pInit)+'</p>';
    }
    el.innerHTML = head + body;
    var st = document.getElementById('ar-price-start'); if(st) st.onclick = function(){ price = { target: 50+Math.floor(Math.random()*201), left:7, val:'', fb:null }; renderPrice(); };
    var inp = document.getElementById('ar-price-in');
    if(inp){
      inp.oninput = function(){ price.val = inp.value; };
      inp.onkeydown = function(e){ if(e.key === 'Enter') doGuess(); };
    }
    var g = document.getElementById('ar-price-guess'); if(g) g.onclick = doGuess;
    function doGuess(){
      if(!price || !price.left) return; var v = parseInt(price.val, 10);
      if(isNaN(v) || v<50 || v>250){ price.fb = t.pBad; renderPrice(); return; }
      price.left--;
      if(v === price.target){ price.left = 0; price.val=''; price.fb = t.pWin(price.target); }
      else if(!price.left){ price.val=''; price.fb = t.pLose(price.target); }
      else { price.fb = (v<price.target?t.pLow:t.pHigh) + (Math.abs(v-price.target)<=15?t.pHot:'') + t.pLeft(price.left); price.val=''; }
      renderPrice();
    }
  }

  /* =================== Đấu trường 1v1 =================== */
  function renderH2H(){
    var t = T[lang()], el = document.getElementById('ar-h2h'); if(!el) return;
    var res = {y:t.hW,a:t.hL,t:t.hT}, resBg = {y:'#A9DCC4',a:'#F4B6C2',t:'#F3E6CF'};
    var head = '<div style="display:flex;justify-content:space-between;gap:12px;align-items:start"><div><div style="font-family:var(--clay-head);font-size:22px;font-weight:800">'+esc(t.hName)+'</div><p style="margin:4px 0 0;font-size:14px;line-height:1.5;color:var(--clay-sub)">'+esc(t.hDesc)+'</p></div>'
      + '<button type="button" id="ar-h2h-start" style="flex:none;border:0;cursor:pointer;padding:10px 16px;border-radius:16px;background:var(--clay-teal);color:#fff;font:800 15px var(--clay-head);box-shadow:inset 0 -4px 0 rgba(0,0,0,.2)">'+esc(t.start)+'</button></div>';
    var body = '';
    if(h2h){
      var headline = h2h.done ? ((h2h.y.w>h2h.a.w || (h2h.y.w===h2h.a.w && h2h.y.p>=h2h.a.p)) ? t.hWin : t.hLose) : t.hRound(h2h.round);
      body += '<div style="margin-top:16px;font-size:13px;font-weight:800;color:#6B5A3A">'+esc(headline)+'</div>';
      if(!h2h.done){
        body += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px">'
          + t.hMoves.map(function(m,k){ return '<button type="button" data-move="'+k+'" style="border:0;cursor:pointer;padding:12px 6px;border-radius:16px;background:'+CLAY[k]+';color:var(--clay-ink);font:800 14px var(--clay-head);box-shadow:inset 0 -5px 0 rgba(0,0,0,.1),inset 0 3px 0 rgba(255,255,255,.5)"><span style="display:block;font-size:17px">'+esc(m[0])+'</span><span style="display:block;font:600 11px var(--clay-sans);color:var(--clay-sub);margin-top:2px">'+esc(m[1])+'</span></button>'; }).join('')
          + '</div>';
      }
      body += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">'
        + h2h.log.map(function(l){ return '<span style="padding:5px 10px;border-radius:999px;background:'+resBg[l.win]+';font-size:12px;font-weight:800">'+esc(t.hMoves[l.m][0]+' vs '+t.hMoves[l.ai][0]+' · '+res[l.win])+'</span>'; }).join('')
        + '</div>';
      if(h2h.done) body += '<p style="margin:10px 0 0;font-size:13px;line-height:1.5;color:#24403F">'+esc(t.hScore(h2h.y.w,h2h.a.w,Math.round(h2h.y.p),Math.round(h2h.a.p))+' · '+t.hTip)+'</p>';
    }
    el.innerHTML = head + body;
    var st = document.getElementById('ar-h2h-start'); if(st) st.onclick = function(){ h2h = { round:1, y:{p:0,w:0}, a:{p:0,w:0}, log:[], done:false }; renderH2H(); };
    el.querySelectorAll('button[data-move]').forEach(function(b){ b.onclick = function(){
      if(h2h.done) return; var m = +b.getAttribute('data-move');
      var ai = Math.floor(Math.random()*3), j = function(){ return .85+Math.random()*.3; };
      var yp = BASE[m][0]*j(), ap = BASE[ai][0]*j();
      if(BEATS[m]===ai){ yp*=1.45; ap*=.65; } else if(BEATS[ai]===m){ ap*=1.45; yp*=.65; }
      var win = yp>ap?'y':ap>yp?'a':'t';
      h2h.y.p += yp; h2h.y.w += (win==='y'?1:0); h2h.a.p += ap; h2h.a.w += (win==='a'?1:0);
      h2h.log.push({m:m,ai:ai,win:win}); if(h2h.round>=3) h2h.done = true; else h2h.round++;
      renderH2H();
    }; });
  }

  function renderAll(){ renderStatic(); renderQuiz(); renderPrice(); renderH2H(); }

  function init(){ renderAll(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('bizon:langchange', renderAll);
})();
