/* BizOn Bật Nghiệp – giao diện web: chế độ Sáng/Tối + song ngữ Việt/Anh
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền. */
(function () {
  'use strict';

  /* ---------- Chế độ Sáng / Tối ---------- */
  function themeBtnSync() {
    var dark = document.documentElement.dataset.theme === 'dark';
    var b = document.getElementById('theme-btn');
    if (b) b.textContent = dark ? '☀️' : '🌙';
    var c = document.getElementById('theme-toggle-check');
    if (c) c.checked = dark;
  }
  window.toggleTheme = function () {
    var el = document.documentElement;
    var wasDark = el.dataset.theme === 'dark';
    if (wasDark) delete el.dataset.theme; else el.dataset.theme = 'dark';
    try { localStorage.setItem('bizon-theme', wasDark ? 'light' : 'dark'); } catch (e) {}
    themeBtnSync();
  };

  /* ---------- Song ngữ Việt / Anh ---------- */
  var EN = new Map([
[
"Tính năng",
"Features"
],
[
"Chơi thử",
"Demo"
],
[
"Nhân vật",
"Characters"
],
[
"Đội ngũ",
"Team"
],
[
"🎮 CHƠI NGAY",
"🎮 PLAY NOW"
],
[
"Giới thiệu",
"About"
],
[
"Trang giới thiệu",
"About page"
],
[
"Đóng",
"Close"
],
[
"🔄 Chơi lại",
"🔄 Play again"
],
[
"Bắt đầu",
"Start"
],
[
"Đoán",
"Guess"
],
[
"Chơi",
"Play"
],
[
"🚀 Chơi miễn phí trên Web",
"🚀 Play free on the Web"
],
[
"🕹️ Thử Mini-game",
"🕹️ Try Mini-games"
],
[
"🔊 Nghe giọng Hương AI",
"🔊 Hear Hương AI's voice"
],
[
"📱 Cài như App (PWA)",
"📱 Install as an App (PWA)"
],
[
"🎓 Dành cho lớp khởi nghiệp",
"🎓 Built for startup classes"
],
[
"🇻🇳 100% tiếng Việt",
"🇻🇳 Made in Vietnam"
],
[
"Vòng thị trường",
"Market rounds"
],
[
"Vai trò C-Suite",
"C-Suite roles"
],
[
"Báo cáo quản trị",
"Business reports"
],
[
"Thành tựu & nhiệm vụ",
"Achievements & quests"
],
[
"🎙️ VOICE CHAT TIẾNG VIỆT",
"🎙️ VIETNAMESE VOICE CHAT"
],
[
"Bài học thật.",
"Real lessons."
],
[
"Cỗ máy thị trường thật",
"A real market engine"
],
[
"Độ co giãn giá, thị phần, biến cố Cơ Hội Vàng · Price War · Khủng hoảng năng lượng – mỗi vòng là một ván cờ mới với 3 đối thủ AI.",
"Price elasticity, market share, Golden Opportunity · Price War · energy-crisis events – every round is a fresh chess match against 3 AI rivals."
],
[
"Cố vấn AI Lumina",
"Lumina AI advisor"
],
[
"Trò chuyện bằng giọng nói tiếng Việt, mô phỏng \"Nếu – Thì\" trước khi chốt, bộ não cố vấn riêng cho CEO · CFO · COO · CMO.",
"Vietnamese voice chat, \"What-If\" simulations before you commit, and a dedicated advisor brain for CEO · CFO · COO · CMO."
],
[
"7 báo cáo chuẩn giáo trình",
"7 textbook-grade reports"
],
[
"P&L, dòng tiền 3 hoạt động, CVP hòa vốn, nhân sự, BMC, khấu hao, kiểm toán năng lượng – số liệu sống từ chính quyết định của bạn.",
"P&L, 3-activity cash flow, CVP break-even, HR, BMC, depreciation, energy audit – living numbers driven by your own decisions."
],
[
"Tài chính C-Suite",
"C-Suite finance"
],
[
"Gọi vốn chủ sở hữu hay vay ngân hàng, kỳ hạn thanh toán 30/60/90 ngày, chế độ khủng hoảng thanh khoản CFO – như phòng họp HĐQT thật.",
"Raise equity or take bank loans, 30/60/90-day payment terms, CFO liquidity-crisis mode – just like a real boardroom."
],
[
"Học mà chơi",
"Learn by playing"
],
[
"Nhiệm vụ, thành tựu, cây kỹ năng, chứng nhận hoàn thành, nhật ký đội và chế độ giảng viên cho lớp học khởi nghiệp.",
"Quests, achievements, a skill tree, completion certificates, a team journal and an instructor mode for startup classes."
],
[
"Web + App một chạm",
"Web + App in one tap"
],
[
"Chạy mượt trên trình duyệt, cài lên điện thoại như app thật (PWA), chơi offline sau lần tải đầu tiên.",
"Runs smoothly in the browser, installs on your phone like a native app (PWA), plays offline after the first load."
],
[
"Bối cảnh",
"The world"
],
[
"Nhân vật đất nặn 3D",
"3D clay characters"
],
[
"Gặp gỡ những người đồng hành",
"Meet your companions"
],
[
"Người dẫn chuyện",
"The narrator"
],
[
"Chúc mừng chiến thắng và trao chứng nhận hoàn thành của bạn.",
"Celebrates your victories and hands you your completion certificate."
],
[
"Cố vấn chiến lược AI",
"AI strategy advisor"
],
[
"Phân tích Nếu – Thì, cảnh báo rủi ro, đồng hành cùng cả 4 vai trò C-Suite.",
"What-If analysis, risk alerts, supporting all four C-Suite roles."
],
[
"Cố vấn học thuật",
"Academic advisor"
],
[
"Xuất hiện ở những khoảnh khắc then chốt với lời khuyên quản trị kinh điển.",
"Appears at pivotal moments with classic management wisdom."
],
[
"Demo tương tác",
"Interactive demo"
],
[
"🎮 Chơi thử 1 vòng BizOn",
"🎮 Play one BizOn round"
],
[
"Kéo 3 thanh quyết định – thị trường phản ứng ngay lập tức, đúng công thức của game thật.",
"Drag 3 decision sliders – the market reacts instantly, using the real game's formula."
],
[
"🎯 Quyết định của bạn (CEO)",
"🎯 Your decisions (CEO)"
],
[
"💲 Giá bán",
"💲 Price"
],
[
"📣 Ngân sách Marketing",
"📣 Marketing budget"
],
[
"🏭 Sản lượng",
"🏭 Production"
],
[
"Thị phần",
"Market share"
],
[
"Doanh thu",
"Revenue"
],
[
"Lợi nhuận",
"Profit"
],
[
"· 12.000 sp tổng cầu · 3 đối thủ AI",
"· 12,000-unit demand · 3 AI rivals"
],
[
"Bản demo rút gọn từ engine thật (độ co giãn giá 1.8, giá tham chiếu 150k). Bản đầy đủ có 6 vòng, biến cố, nhân sự, tài chính, cố vấn AI.",
"A trimmed-down demo of the real engine (price elasticity 1.8, reference price 150k). The full game adds 6 rounds, events, HR, finance and the AI advisor."
],
[
"🚀 Chơi bản đầy đủ 6 vòng",
"🚀 Play the full 6-round game"
],
[
"Chơi thử ngay",
"Try it now"
],
[
"🕹️ Mini-game khởi nghiệp",
"🕹️ Startup mini-games"
],
[
"Không cần đăng nhập – thử tố chất CEO của bạn trong 60 giây.",
"No sign-in needed – test your CEO instincts in 60 seconds."
],
[
"Trắc nghiệm Khởi nghiệp",
"Startup Quiz"
],
[
"8 câu hỏi về tài chính & chiến lược – kiểm tra tố chất CEO của bạn.",
"8 questions on finance & strategy – test your CEO instincts."
],
[
"Đoán Giá Thị Trường",
"Guess the Market Price"
],
[
"Thị trường đã \"chốt\" một mức giá cân bằng từ 50–250 nghìn ₫. Bạn có 7 lần đoán!",
"The market has locked in an equilibrium price between 50–250k ₫. You get 7 guesses!"
],
[
"Bắt Vốn Vàng",
"Golden Capital Catch"
],
[
"30 giây gọi vốn: hứng đồng vàng, né chi phí phát sinh 💣. Điều khiển bằng chạm / chuột / phím ← →.",
"A 30-second fundraise: catch gold coins, dodge surprise costs 💣. Touch / mouse / ← → keys."
],
[
"Đội ngũ sáng lập",
"The founding team"
],
[
"👥 Xem trang đội ngũ đầy đủ →",
"👥 See the full team page →"
],
[
"Sáng lập & Thiết kế game",
"Founder & Game Designer"
],
[
"Hóa thân thành cố vấn AI Lumina trong game – áo dài truyền thống & vest trắng hiện đại.",
"Embodied in-game as the AI advisor Lumina – traditional áo dài & modern white vest."
],
[
"Đồng sáng lập · Cố vấn chuyên môn",
"Co-founder · Expert Advisor"
],
[
"Bảo chứng học thuật cho mô hình mô phỏng kinh doanh và chế độ giảng viên.",
"Academic guarantee behind the business-simulation model and instructor mode."
],
[
"Sẵn sàng \"Bật Nghiệp\"?",
"Ready to \"Bật Nghiệp\"?"
],
[
"Lập đội, chọn vai trò CEO · CFO · COO · CMO và chinh phục TOP 1 thị phần Việt Nam 2026.",
"Build your team, pick a role – CEO · CFO · COO · CMO – and conquer the #1 market share of Vietnam 2026."
],
[
"🚀 VÀO GAME NGAY – MIỄN PHÍ",
"🚀 PLAY NOW – FREE"
],
[
"Game mô phỏng kinh doanh 3D Claymorphism dành cho thế hệ khởi nghiệp Việt Nam.",
"A 3D claymorphism business-simulation game for Vietnam's startup generation."
],
[
"Khám phá",
"Explore"
],
[
"Chơi game đầy đủ",
"Play the full game"
],
[
"BizOn Arcade (tất cả trò chơi)",
"BizOn Arcade (all games)"
],
[
"Pháp lý",
"Legal"
],
[
"Bảo lưu mọi quyền · Nhãn hiệu đang đăng ký",
"All rights reserved · Trademark pending"
],
[
"Hương AI dẫn đường",
"Hương AI tour guide"
],
[
"Xin chào! Mình là Hương – hướng dẫn viên AI của BizOn Bật Nghiệp. Để mình dẫn bạn tham quan trò chơi nhé?",
"Hi! I'm Hương – BizOn Bật Nghiệp's AI tour guide. Shall I show you around?"
],
[
"▶️ Bắt đầu tour",
"▶️ Start the tour"
],
[
"Trung tâm trò chơi",
"Game hub"
],
[
"6 trò chơi của hệ sinh thái BizOn Bật Nghiệp – từ mô phỏng chiến lược 6 vòng đến các game phản xạ 30 giây. Chọn và chơi ngay!",
"The BizOn Bật Nghiệp game ecosystem – from the 6-round strategy sim to 30-second reflex games. Pick one and play!"
],
[
"Chọn phiên bản & chế độ chơi",
"Choose your version & mode"
],
[
"ĐANG MỞ",
"OPEN NOW"
],
[
"SẮP RA MẮT",
"COMING SOON"
],
[
"Vào game",
"Enter game"
],
[
"Thị trường nội địa 2026: biến cố Hóa Rồng, đối thủ Việt, bản tin Thị trường sống. Chơi đơn (offline) cùng 3 đội AI.",
"The 2026 domestic market: Rising Dragon events, Vietnamese rivals, a live market newsfeed. Single-player (offline) against 3 AI teams."
],
[
"GAME CHÍNH",
"MAIN GAME"
],
[
"🎮 GAME CHÍNH",
"🎮 MAIN GAME"
],
[
"6 vòng",
"6 rounds"
],
[
"Game chính",
"Main game"
],
[
"⏱️ 30–60 phút · 👥 chơi theo đội 5 vai trò · 📱 cài được lên điện thoại",
"⏱️ 30–60 minutes · 👥 team play with 5 roles · 📱 installs on your phone"
],
[
"🚀 Chơi ngay",
"🚀 Play now"
],
[
"Demo 1 vòng",
"1-round demo"
],
[
"KHÔNG CẦN ĐĂNG NHẬP",
"NO SIGN-IN NEEDED"
],
[
"Kéo 3 thanh quyết định, xem thị trường phản ứng tức thì – hiểu luật chơi trong 60 giây.",
"Drag 3 decision sliders and watch the market react instantly – learn the rules in 60 seconds."
],
[
"PHẢN XẠ 30s",
"30s REFLEX"
],
[
"Băng chuyền xưởng đất sét – chạm đúng món hàng được đặt để đóng gói. Trong game chính, điểm đổi được quà ở Clay Reward Shop!",
"A clay-factory conveyor – tap the ordered items to pack them. In the main game, points buy gifts at the Clay Reward Shop!"
],
[
"KIẾN THỨC",
"KNOWLEDGE"
],
[
"8 câu về hòa vốn, thanh khoản, Price War, đòn bẩy – kiểm tra tố chất CEO.",
"8 questions on break-even, liquidity, price wars and leverage – test your CEO instincts."
],
[
"TƯ DUY",
"THINKING"
],
[
"Thị trường đã chốt giá cân bằng 50–250 nghìn ₫ – bạn có 7 lượt tìm ra nó.",
"The market locked an equilibrium price between 50–250k ₫ – you get 7 tries to find it."
],
[
"Clay Sort – Phân loại",
"Clay Sort – Sorting"
],
[
"Băng chuyền thả hình đất nặn – chạm đúng thùng (Hộp / Cầu / Tháp) trước khi hàng rơi xuống. Chuỗi đúng liên tiếp nhân điểm!",
"Clay shapes drop from the belt – tap the right bin (Box / Ball / Tower) before they fall. Streaks multiply your score!"
],
[
"📦 Hộp",
"📦 Box"
],
[
"🔴 Cầu",
"🔴 Ball"
],
[
"🔺 Tháp",
"🔺 Tower"
],
[
"Đấu Trường 1v1",
"1v1 Arena"
],
[
"CHIẾN THUẬT",
"TACTICS"
],
[
"Đối đầu CEO AI qua 3 hiệp: mỗi hiệp chọn 1 chiến lược giá – kết thúc bằng màn so tài chỉ số Head-to-Head.",
"Face an AI CEO over 3 rounds: pick a pricing strategy each round – ending in a head-to-head stat showdown."
],
[
"Gọi vốn 30 giây: hứng đồng vàng, né chi phí phát sinh 💣. Chạm / chuột / phím ← →.",
"A 30-second fundraise: catch gold coins, dodge surprise costs 💣. Touch / mouse / ← → keys."
],
[
"Chọn chiến lược giá cho hiệp này:",
"Pick your pricing strategy for this round:"
],
[
"🧑‍💼 BẠN",
"🧑‍💼 YOU"
],
[
"🔄 Tái đấu",
"🔄 Rematch"
],
[
"Mẹo khắc chế: 🏷️ Giá rẻ thắng 💎 Cao cấp · 💎 Cao cấp thắng ⚖️ Cân bằng · ⚖️ Cân bằng thắng 🏷️ Giá rẻ",
"Counter tips: 🏷️ Budget beats 💎 Premium · 💎 Premium beats ⚖️ Balanced · ⚖️ Balanced beats 🏷️ Budget"
],
[
"Đội ngũ Sáng lập BizOn",
"BizOn Founding Team"
],
[
"Hóa thân Lumina AI",
"Lumina AI persona"
],
[
"Sứ mệnh & Tầm nhìn 2026",
"Mission & Vision 2026"
],
[
"Sứ mệnh",
"Mission"
],
[
"Tầm nhìn 2026",
"Vision 2026"
],
[
"Dân chủ hóa giáo dục quản trị thông qua công nghệ Gamification và AI vượt trội.",
"Democratizing management education through gamification and cutting-edge AI."
],
[
"Trở thành nền tảng mô phỏng kinh doanh số 1 tại Đông Nam Á cho thế hệ trẻ.",
"To become Southeast Asia's #1 business-simulation platform for the young generation."
],
[
"✉️ Liên hệ hợp tác",
"✉️ Partner with us"
],
[
"© 2026 Đỗ Thùy Hương & Phan Anh Tú · BizOn Bật Nghiệp – Bảo lưu mọi quyền.",
"© 2026 Đỗ Thùy Hương & Phan Anh Tú · BizOn Bật Nghiệp – All rights reserved."
],
[
"Chào mừng trở lại!",
"Welcome back!"
],
[
"Tên đội",
"Team name"
],
[
"Vai trò của bạn",
"Your role"
],
[
"Bắt đầu mô phỏng 🚀",
"Start the simulation 🚀"
],
[
"Trang chủ",
"Home"
],
[
"Quyết định",
"Decisions"
],
[
"Báo cáo",
"Reports"
],
[
"Cửa hàng",
"Shop"
],
[
"Trung tâm điều hành",
"Command center"
],
[
"Đang chờ quyết định",
"Awaiting decisions"
],
[
"Đã khóa – chờ kết quả",
"Locked – awaiting results"
],
[
"Dòng tiền",
"Cash flow"
],
[
"Thương hiệu",
"Brand"
],
[
"Truy cập nhanh",
"Quick access"
],
[
"Hỏi",
"Ask"
],
[
"Nhập quyết định vòng này ➜",
"Enter this round's decisions ➜"
],
[
"Nhiệm vụ",
"Quests"
],
[
"Sổ tay",
"Handbook"
],
[
"Kỹ năng",
"Skills"
],
[
"Xếp hạng",
"Rankings"
],
[
"Thành tựu",
"Achievements"
],
[
"Giảng viên",
"Instructor"
],
[
"Thị trường sống",
"Live market"
],
[
"Nhật ký đội",
"Team journal"
],
[
"Cài đặt",
"Settings"
],
[
"🗺️ Hành trình chinh phục Việt Nam",
"🗺️ Vietnam Conquest Journey"
],
[
"Thắng mỗi vòng để cắm cờ công ty – từ Cần Thơ tới Thủ đô Hà Nội.",
"Win each round to plant your company flag – from Cần Thơ to Hà Nội."
],
[
"⚙️ Cài đặt",
"⚙️ Settings"
],
[
"🔔 Thông báo vòng chơi",
"🔔 Round notifications"
],
[
"🔊 Âm thanh hiệu ứng",
"🔊 Sound effects"
],
[
"🎵 Nhạc nền (BizOn Theme)",
"🎵 Music (BizOn Theme)"
],
[
"🌙 Chế độ tối (Dark mode)",
"🌙 Dark mode"
],
[
"🌐 Giao diện tiếng Anh (English)",
"🌐 English interface"
],
[
"🎬 Giới thiệu game (Intro)",
"🎬 Game intro"
],
[
"📖 Sổ tay hướng dẫn (User Manual)",
"📖 User Manual"
],
[
"🌐 Trang giới thiệu",
"🌐 About page"
],
[
"🕹️ BizOn Arcade (trung tâm trò chơi)",
"🕹️ BizOn Arcade (game hub)"
],
[
"🐞 Gửi báo cáo lỗi",
"🐞 Report a bug"
],
[
"♻️ Chơi lại từ đầu (Reset)",
"♻️ Restart (Reset)"
],
[
"Lợi nhuận ròng",
"Net profit"
],
[
"Đã bán",
"Units sold"
],
[
"Tiếp tục",
"Continue"
],
[
"Việt Nam 2026",
"Vietnam 2026"
],
[
"6 vòng · 6 tỉnh thành",
"6 rounds · 6 provinces"
],
[
"Đội hình C-Suite",
"Your C-Suite"
],
[
"Mục tiêu của bạn",
"Your goal"
],
[
"Tiếp theo →",
"Next →"
],
[
"Bỏ qua",
"Skip"
],
[
"← Trước",
"← Back"
],
[
"Bắt đầu 🚀",
"Start 🚀"
],
[
"🧪 BẢN THỬ NGHIỆM",
"🧪 BETA"
],
[
"THỬ NGHIỆM",
"BETA"
],
[
"🗺️ Bước 1 – Chọn thị trường quốc tế",
"🗺️ Step 1 – Pick an international market"
],
[
"Xuất phát từ Việt Nam – chạm vào một điểm đến trên bản đồ thế giới.",
"Starting from Vietnam – tap a destination on the world map."
],
[
"🛂 Bước 2 – Chọn phương thức thâm nhập (Entry mode)",
"🛂 Step 2 – Choose your entry mode"
],
[
"📊 Bước 3 – Kinh doanh trong kỷ nguyên số",
"📊 Step 3 – Do business in the digital era"
],
[
"📚 Bốn phương thức thâm nhập quốc tế",
"📚 Four international entry modes"
],
[
"Xuất khẩu (Export)",
"Export"
],
[
"Nhượng quyền (Licensing)",
"Licensing"
],
[
"Liên doanh (Joint Venture)",
"Joint Venture"
],
[
"Đầu tư mới – Greenfield (FDI)",
"Greenfield FDI"
],
[
"Vốn thấp, triển khai nhanh – nhưng chịu thuế quan và kiểm soát kênh phân phối thấp. Phù hợp thăm dò thị trường.",
"Low capital, fast to launch – but exposed to tariffs with little channel control. Good for testing a market."
],
[
"Đối tác bản địa sản xuất, ta thu phí bản quyền – rủi ro vốn thấp nhất nhưng lợi nhuận mỏng và có rủi ro thương hiệu.",
"A local partner produces while you collect royalties – lowest capital risk, but thin margins and brand risk."
],
[
"Chia vốn, chia lợi nhuận với đối tác am hiểu bản địa – giảm mạnh khoảng cách văn hóa và rào cản pháp lý.",
"Share capital and profit with a local partner – sharply reduces cultural distance and legal barriers."
],
[
"Xây nhà máy/công ty con 100% vốn – kiểm soát tối đa, né thuế quan, nhưng vốn lớn và rủi ro cao nhất.",
"Build a wholly-owned plant/subsidiary – maximum control, tariff-free, but the biggest capital and risk."
],
[
"Chốt quý này 🚀",
"Commit this quarter 🚀"
],
[
"🌍 Thị trường phản ứng",
"🌍 Market reaction"
],
[
"Kho GitHub",
"GitHub repos"
],
[
"⭐ BizOn – mã nguồn",
"⭐ BizOn – source code"
],
[
"🎼 M-AIDA – mã nguồn",
"🎼 M-AIDA – source code"
],
[
"🌏 BizOn Go Global (thử nghiệm)",
"🌏 BizOn Go Global (beta)"
],
[
"🌏 BizOn Go Global (thử nghiệm quốc tế)",
"🌏 BizOn Go Global (international beta)"
],
[
"⭐ Mã nguồn trên GitHub",
"⭐ Source code on GitHub"
],
[
"⭐ GitHub BizOn",
"⭐ BizOn on GitHub"
],
[
"🎼 GitHub M-AIDA",
"🎼 M-AIDA on GitHub"
],
[
"🌏 Trang M-AIDA",
"🌏 M-AIDA site"
],
[
"Từ Việt Nam vươn ra thế giới: chọn thị trường Á · Âu · Mỹ, chọn phương thức thâm nhập (Export, Licensing, Liên doanh, FDI) và kinh doanh trong kỷ nguyên số.",
"From Vietnam to the world: pick a market in Asia · Europe · America, choose an entry mode (Export, Licensing, Joint Venture, FDI) and do business in the digital era."
],
[
"Nhà lãnh đạo tầm nhìn",
"Visionary Leader"
],
[
"Chiến lược gia tài chính",
"Financial Strategist"
],
[
"Phù thủy marketing",
"Marketing Guru"
],
[
"Chuyên gia vận hành",
"Operations Expert"
],
[
"Thư ký pháp chế",
"Compliance Officer"
],
[
"👥 Chơi thử với Đội Demo (5 nhân vật)",
"👥 Try the Demo Team (5 characters)"
],
[
"⚔️ 3 đối thủ AI của bạn",
"⚔️ Your 3 AI rivals"
],
[
"🚀 IE Lab – Khởi nghiệp quốc tế (International Entrepreneurship)",
"🚀 IE Lab – International Entrepreneurship"
],
[
"🏢 Bước 0 – Hồ sơ doanh nghiệp của bạn",
"🏢 Step 0 – Your company profile"
],
[
"Trước khi ra khơi, hãy khai báo năng lực xuất phát – hồ sơ ảnh hưởng đến toàn bộ mô phỏng.",
"Before setting sail, declare your starting capabilities – the profile affects the whole simulation."
],
[
"🖥️ Năng lực công nghệ",
"🖥️ Technology capability"
],
[
"🌏 Kinh nghiệm quốc tế",
"🌏 International experience"
],
[
"📥 Xuất nhật ký quyết định (CSV) – dữ liệu nghiên cứu / chấm điểm",
"📥 Export decision log (CSV) – research / grading data"
],
[
"Phiên bản tiếng Pháp · bản thu có lời",
"French version · vocal recording"
],
[
"Tú Phan – Áo dài trắng",
"Tú Phan – White áo dài"
],
[
"Trang phục lễ nghi · đeo cài áo Bản đồ Việt Nam",
"Ceremonial outfit · wearing the Vietnam Map lapel pin"
],
[
"Tú Phan – Nụ cười chiến thắng",
"Tú Phan – Victory smile"
],
[
"Áo dài trắng & cài áo Việt Nam · phiên bản tươi vui",
"White áo dài & Vietnam pin · the cheerful version"
],
[
"Tú Phan – Chào đón",
"Tú Phan – Welcome"
],
[
"Dang rộng vòng tay chào người chơi mới",
"Open arms welcoming new players"
],
[
"Tú Phan – Hướng dẫn",
"Tú Phan – Guiding"
],
[
"Chỉ tay giới thiệu bảng số liệu & luật chơi",
"Pointing out the data board & game rules"
],
[
"Tú Phan – Giảng giải",
"Tú Phan – Explaining"
],
[
"Đưa tay diễn giải khái niệm kinh doanh",
"Gesturing through a business concept"
],
[
"Tú Phan – Bàn làm việc",
"Tú Phan – At the desk"
],
[
"Phân tích dữ liệu mô phỏng trên laptop",
"Analyzing simulation data on a laptop"
],
[
"Biến lớp học kinh doanh thành sân chơi mô phỏng",
"Turning the business classroom into a simulation playground"
],
[
"🧩 Bốn giải pháp cốt lõi",
"🧩 Four core solutions"
],
[
"Game mô phỏng Bật Nghiệp",
"Bật Nghiệp business simulation game"
],
[
"Cố vấn AI trong game",
"In-game AI advisors"
],
[
"Claymorphism & Âm nhạc gốc",
"Claymorphism & original music"
],
[
"🏫 Quy trình triển khai trong lớp học",
"🏫 Classroom rollout process"
],
[
"💡 Vì sao chọn BizOn?",
"💡 Why choose BizOn?"
],
[
"Sẵn sàng «bật nghiệp» cùng lớp của bạn?",
"Ready to launch a venture with your class?"
],
[
"Biến ý tưởng thành sản phẩm thật",
"Turning ideas into real products"
],
[
"Muốn cùng kiến tạo dự án tiếp theo?",
"Want to build the next project together?"
],
[
"Cùng nhào nặn tương lai với BizOn",
"Mold the future together with BizOn"
],
[
"🧬 Ba giá trị của nhóm",
"🧬 Three team values"
],
[
"📌 Vị trí cộng tác đang mở",
"📌 Open collaboration roles"
],
[
"Sẵn sàng tạo dấu ấn của bạn?",
"Ready to make your mark?"
],
[
"Kết nối với nhóm BizOn",
"Connect with the BizOn team"
],
[
"✍️ Gửi lời nhắn",
"✍️ Send a message"
],
[
"📡 Kênh chính thức",
"📡 Official channels"
],
[
"🤝 Nhóm đang tìm kiếm",
"🤝 Who we're looking for"
],
[
"Giải pháp",
"Solutions"
],
[
"Danh mục dự án",
"Projects portfolio"
],
[
"Tham gia nhóm",
"Join the team"
],
[
"Liên hệ & Hợp tác",
"Contact & Partnership"
],
[
"Bộ công cụ EdTech cho lớp học",
"An EdTech toolkit for the classroom"
],
[
"Sản phẩm nhóm đã thực hiện",
"Products the team has shipped"
],
[
"Văn hóa & vị trí cộng tác",
"Culture & collaboration roles"
],
[
"Kết nối với nhóm BizOn",
"Connect with the BizOn team"
],
[
"Nhóm khởi nghiệp BizOn",
"BizOn startup team"
],
[
"\"Kế hoạch cân bằng, có lãi ổn định. Trong game thật, biến cố thị trường mỗi vòng sẽ thử thách chiến lược này của bạn!\"",
"\"A balanced plan with steady profit. In the real game, a market event each round will put this strategy to the test!\""
],
[
"/giảng viên/năm",
"/instructor/year"
],
[
"/khoa/trường",
"/faculty/school"
],
[
"/lớp/học kỳ",
"/class/semester"
],
[
"1 bản",
"1 recording"
],
[
"1 · Chia đội & nhận vai",
"1 · Form teams & assign roles"
],
[
"1. Tóm tắt",
"1. Summary"
],
[
"21 tạo hình trên cùng khung chuẩn · tài liệu đăng ký quyền tác giả mỹ thuật ứng dụng · mã VN-BIZON-BP-CAST-001",
"21 designs on one standard frame · applied fine art copyright filing document · ref. VN-BIZON-BP-CAST-001"
],
[
"2 bản",
"2 recordings"
],
[
"2 · Chơi 6 vòng",
"2 · Play 6 rounds"
],
[
"2. Dữ liệu lưu trên thiết bị",
"2. Data stays on your device"
],
[
"3 bản",
"3 recordings"
],
[
"3 góc nhìn chuẩn (trước · nghiêng 45° · sau) · tài liệu đăng ký bản quyền mỹ thuật ứng dụng · mã VN-HƯƠNG-CLAY-001",
"3 standard views (front · 45° · back) · applied fine art copyright filing document · ref. VN-HƯƠNG-CLAY-001"
],
[
"3 · Sự kiện & cố vấn",
"3 · Events & advisers"
],
[
"3. Những gì chúng tôi KHÔNG làm",
"3. What we do NOT do"
],
[
"4 bản",
"4 recordings"
],
[
"4 · Tổng kết bằng dữ liệu",
"4 · Debrief with the data"
],
[
"4. Dịch vụ bên thứ ba",
"4. Third-party services"
],
[
"5. Trẻ em",
"5. Children"
],
[
"6 bài · nhịp nhanh.",
"6 tracks · up-tempo."
],
[
"6. Tính chất giáo dục & phi chính trị",
"6. Educational and non-political nature"
],
[
"8 bài · màu Việt Nam.",
"8 tracks · Vietnamese colour."
],
[
"7 thị trường · entry mode",
"7 markets · entry modes"
],
[
"7. Liên hệ",
"7. Contact"
],
[
"8 bài · màu quốc tế hóa.",
"8 tracks · internationalisation colour."
],
[
"8 bản",
"8 recordings"
],
[
"90 phút · 15 tuần · Đại hội Cổ đông",
"90 minutes · 15 weeks · Shareholders' Meeting"
],
[
"Alpha Corp (giá rẻ)",
"Alpha Corp (low price)"
],
[
"Avatar khung chat cố vấn",
"Adviser chat avatar"
],
[
"Beta Ltd (cân bằng)",
"Beta Ltd (balanced)"
],
[
"Biến cố thị trường bất ngờ và lời khuyên AI giữ nhịp thảo luận sôi nổi.",
"Surprise market events and AI advice keep the discussion lively."
],
[
"Bạn có thể xóa toàn bộ dữ liệu này bất cứ lúc nào bằng cách xóa dữ liệu trang web trong cài đặt trình duyệt, hoặc dùng nút «Chơi lại từ đầu» trong game.",
"You can erase all of this data at any time by clearing site data in your browser settings, or with the «Start over» button in the game."
],
[
"Bản chơi tự do luôn miễn phí. Các gói dưới đây dành cho triển khai có hỗ trợ trong khoa/trường/trung tâm đào tạo khởi nghiệp (giai đoạn pilot – giá dự kiến, liên hệ để chốt phạm vi).",
"Free play is always free. The packages below are for supported rollouts in a faculty, school or entrepreneurship centre (pilot stage – indicative pricing, contact us to scope it)."
],
[
"Bản phối dài 4:43 · hợp cho buổi học chạy trọn 6 quý",
"Extended mix, 4:43 · fits a session running all 6 quarters"
],
[
"Bản phối instrumental (bản thu có lời sắp ra mắt)",
"Instrumental mix (vocal recording coming soon)"
],
[
"Bản phối lại 2:56 · cùng lời, màu nhạc dày hơn",
"Remixed, 2:56 · same lyrics, fuller sound"
],
[
"Bản phối lại mới · hành trình Go Global gói trong một bài hát: entry mode, đường cong chữ U ngược, «bốn ba phần trăm – vừa đủ để bay cao»",
"New remix · the Go Global journey in one song: entry modes, the inverted U-curve, «forty-three percent – just enough to fly high»"
],
[
"Bản phối lại mở rộng",
"Extended remix"
],
[
"Bản phối lại – cùng lời, màu nhạc mới",
"Remix – same lyrics, new colour"
],
[
"Bản phối trung bình · hợp buổi học chạy 3 quý",
"Mid-length mix · fits a session running 3 quarters"
],
[
"Bản remix dài 3:48 · hợp làm nhạc nền chạy suốt buổi chơi",
"Remix, 3:48 · good as background music for a whole session"
],
[
"Bản thu có lời",
"Vocal recording"
],
[
"Bản thu có lời chính thức",
"Official vocal recording"
],
[
"Bản thu có lời – Golden silt, we rise!",
"Vocal recording – Golden silt, we rise!"
],
[
"Bản thu gốc có lời tiếng Anh · 3:03",
"Original English vocal recording · 3:03"
],
[
"Bản thu khác cùng độ dài 3:03 · hòa âm mới",
"Alternate take, same 3:03 length · new arrangement"
],
[
"Bản thu tiếng Việt",
"Vietnamese recording"
],
[
"Bảng điều khiển lớp",
"Class dashboard"
],
[
"Bấm «Soạn email» sẽ mở ứng dụng thư của bạn với nội dung điền sẵn – trang web không thu thập hay lưu trữ thông tin nào.",
"«Compose email» opens your mail app with the message pre-filled – this website collects and stores nothing."
],
[
"Bằng chứng ban đầu từ lớp học thật",
"Early evidence from a real classroom"
],
[
"Bằng chứng lớp học",
"Classroom evidence"
],
[
"Bộ nhận diện đất nặn 3D độc quyền, kho âm nhạc gốc đa ngôn ngữ (Việt · Anh · Pháp) và bộ quà tặng cài áo Bản đồ Việt Nam – tất cả do nhóm tự sản xuất.",
"An original 3D clay identity, a multilingual catalogue of original music (Vietnamese · English · French) and the Vietnam Map lapel pin set – all produced in-house."
],
[
"COO Bảo Ngọc · CFO Thu Hà · CEO Minh Long · CMO Lan Chi · Compliance Officer Gia Hân",
"COO Bảo Ngọc · CFO Thu Hà · CEO Minh Long · CMO Lan Chi · Compliance Officer Gia Hân"
],
[
"Ca khúc chủ đề game Việt Nam",
"Theme song of the Vietnam game"
],
[
"Ca khúc chủ đề game Việt Nam · V-pop electronic 112 BPM",
"Theme song of the Vietnam game · V-pop electronic, 112 BPM"
],
[
"Ca khúc mang đúng tên game · 2:52 · nhạc nền mặc định trong game",
"The song that shares the game's name · 2:52 · default in-game music"
],
[
"Ca khúc tiếng Việt về «đường cong ta học»",
"Vietnamese song about «the curve we learn»"
],
[
"Character Turnaround Sheet – hồ sơ tạo hình nhân vật",
"Character Turnaround Sheet – character design record"
],
[
"Chuyên gia khởi nghiệp, đổi mới sáng tạo và khởi nghiệp quốc tế – dẫn dắt định hướng học thuật, chuyển hóa nghiên cứu thành mô phỏng kinh doanh ứng dụng AI và học tập theo dự án.",
"Specialist in entrepreneurship, innovation and international entrepreneurship – leads the academic direction, turning research into AI-enhanced business simulation and project-based learning."
],
[
"Chuyển đổi Việt/Anh một chạm ngay trong game – phù hợp cả lớp học chương trình tiên tiến.",
"One-tap Vietnamese/English switching inside the game – suitable for advanced-programme classes too."
],
[
"Chính sách",
"Policy"
],
[
"Chính sách quyền riêng tư",
"Privacy policy"
],
[
"Chúng tôi luôn sẵn sàng lắng nghe – từ góp ý về trò chơi, đề xuất hợp tác giảng dạy, đến những ý tưởng sáng tạo mới.",
"We are always glad to hear from you – feedback on the game, teaching partnerships, or new creative ideas."
],
[
"Chơi ngay →",
"Play now →"
],
[
"Chủ đề",
"Theme"
],
[
"Các vị trí dưới đây là cộng tác theo dự án (không phải việc làm toàn thời gian). Ghi rõ vị trí quan tâm khi liên hệ nhé!",
"The roles below are project-based collaborations, not full-time jobs. Please name the role you are interested in when you get in touch."
],
[
"Cánh đồng năng lượng sạch",
"Clean energy field"
],
[
"Cố vấn chiến lược AI trong game",
"AI strategy adviser in the game"
],
[
"Cố vấn học thuật · xuất hiện ở khoảnh khắc then chốt",
"Academic adviser · appears at the pivotal moments"
],
[
"Cổng Giảng viên",
"Instructor portal"
],
[
"Cổng Người học",
"Learner portal"
],
[
"Cổng Tổ chức & Đối tác",
"Institution & partner portal"
],
[
"Cổng chào phát triển kinh tế & mũi tên vàng – hình sự kiện vòng chung kết",
"Economic development gateway & golden arrow – final-round event artwork"
],
[
"Delta Inc (cao cấp)",
"Delta Inc (premium)"
],
[
"Dáng giới thiệu · ảnh chủ đạo trang Kịch bản lớp học",
"Presenting pose · lead image of the Classroom Scenario page"
],
[
"Dùng thử miễn phí ngay hôm nay, hoặc liên hệ nhóm để được hướng dẫn triển khai cho môn học của bạn.",
"Try it free today, or contact the team for help rolling it out in your course."
],
[
"Dịch thuật & bản địa hóa",
"Translation & localisation"
],
[
"Dữ liệu & Bằng chứng",
"Data & evidence"
],
[
"Dự án",
"Project"
],
[
"Game mô phỏng điều hành doanh nghiệp linh vật đất sét: 6 vòng kinh doanh, 5 vai trò, sự kiện thị trường, đấu trường đối thủ và cố vấn AI. Ứng dụng web PWA, chơi được cả khi ngoại tuyến.",
"A business management simulation with clay mascots: 6 business rounds, 5 roles, market events, a rival arena and an AI adviser. A PWA web app that also runs offline."
],
[
"Giáo dục trước tiên",
"Education first"
],
[
"Giải pháp & gói triển khai",
"Solutions & rollout packages"
],
[
"Giải pháp EdTech",
"EdTech solution"
],
[
"Giảng viên & nhà trường",
"Instructors & institutions"
],
[
"Giảng viên thử nghiệm",
"Pilot instructor"
],
[
"Giờ nghiên cứu ở thư viện",
"Research hours in the library"
],
[
"Gói triển khai cho khoa/trường/trung tâm khởi nghiệp: Pilot Classroom, Instructor Pro, Institution Pass – kèm bằng chứng học thuật.",
"Rollout packages for faculties, schools and entrepreneurship centres: Pilot Classroom, Instructor Pro, Institution Pass – with academic evidence."
],
[
"Gặp cố vấn →",
"Meet the adviser →"
],
[
"Gửi email giới thiệu ngắn về bản thân và sản phẩm bạn từng làm (nếu có) – nhóm sẽ phản hồi sớm nhất có thể.",
"Email us a short introduction about yourself and anything you have built – we will reply as soon as we can."
],
[
"Hai tay giơ cao – khoảnh khắc cắm cờ thị trường mới",
"Both hands raised – the moment a new market is claimed"
],
[
"Hoạt động ngoại tuyến",
"Works offline"
],
[
"Hình sự kiện vòng 4 – thử thách quản trị rủi ro của COO & CFO",
"Round 4 event artwork – a risk-management test for the COO & CFO"
],
[
"Hệ thống game mô phỏng và mini-game của hệ sinh thái – từ chiến lược nhiều vòng đến phản xạ 30 giây.",
"The ecosystem's simulation games and mini-games – from multi-round strategy to 30-second reflexes."
],
[
"Họ và tên",
"Full name"
],
[
"Họa sĩ claymorphism 3D",
"3D claymorphism artist"
],
[
"Học thuật",
"Academics"
],
[
"Học thuật & Model Cards",
"Academics & Model Cards"
],
[
"Kho Âm nhạc",
"Music library"
],
[
"Khoa học mở",
"Open science"
],
[
"Khám phá →",
"Explore →"
],
[
"Không có quảng cáo, không có công cụ theo dõi (tracker) hay phân tích của bên thứ ba.",
"No ads, no third-party trackers or analytics."
],
[
"Không mua bán trong ứng dụng.",
"No in-app purchases."
],
[
"Không truy cập danh bạ, máy ảnh, micro hay bất kỳ quyền nhạy cảm nào của thiết bị.",
"No access to contacts, camera, microphone or any sensitive device permission."
],
[
"Không yêu cầu tài khoản, không thu thập họ tên, email, số điện thoại hay vị trí.",
"No account required; we collect no name, email, phone number or location."
],
[
"Khảo sát trước–sau",
"Pre/post survey"
],
[
"Khởi nghiệp quốc tế",
"International entrepreneurship"
],
[
"Khủng hoảng năng lượng",
"Energy crisis"
],
[
"Kịch bản lớp học",
"Classroom scenario"
],
[
"Kịch bản lớp học 40–60 sinh viên →",
"Scenario for a class of 40–60 students →"
],
[
"Kịch bản trọn gói cho lớp 40–60 sinh viên: buổi 90 phút hoặc giải đấu 15 tuần, kèm Rubric, bảng tổng sắp Excel và hướng dẫn chấm bài.",
"A complete scenario for classes of 40–60 students: a 90-minute session or a 15-week league, with a rubric, an Excel standings sheet and grading guidance."
],
[
"Kịch bản «Việt Nam 2026»",
"The «Vietnam 2026» scenario"
],
[
"Linh hoạt",
"Flexible"
],
[
"Liên hệ",
"Contact"
],
[
"Liên hệ →",
"Contact →"
],
[
"Logo «Bo» – bản nền tối",
"The «Bo» logo – dark background version"
],
[
"Là PWA nên vẫn chơi được khi mạng lớp học chập chờn – cài lên màn hình chính như ứng dụng.",
"Being a PWA, it keeps working when classroom Wi-Fi is unreliable – install it to the home screen like an app."
],
[
"Lập trình web (JavaScript)",
"Web development (JavaScript)"
],
[
"Lớp học & Giải đấu",
"Classroom & league"
],
[
"Lớp học mô phỏng hologram",
"Holographic simulation classroom"
],
[
"Ma trận chuẩn đầu ra & Model Cards",
"Learning outcome matrix & Model Cards"
],
[
"Minh họa vật phẩm Pin Mặt Trời – chiến lược ESG trong game",
"Artwork for the Solar Panel item – ESG strategy in the game"
],
[
"Miễn phí cho lớp học & mã nguồn công khai",
"Free for classrooms & source-available"
],
[
"Màn chào & chứng nhận hoàn thành",
"Welcome screen & certificate of completion"
],
[
"Mã nguồn",
"Source code"
],
[
"Mô phỏng khởi nghiệp quốc tế: chọn 1 trong 7 thị trường, đàm phán với đối tác AI, quản trị ESG và rủi ro, rồi xuất nhật ký quyết định (CSV) cho giảng viên chấm và thảo luận.",
"An international entrepreneurship simulation: pick 1 of 7 markets, negotiate with AI partners, manage ESG and risk, then export the decision log (CSV) for the instructor to grade and discuss."
],
[
"Mô phỏng đưa sản phẩm Việt ra 7 thị trường thế giới: chọn phương thức thâm nhập, đàm phán AI, quản trị ESG – kèm phòng thí nghiệm số liệu IE Lab và xuất CSV cho nghiên cứu, giảng dạy.",
"A simulation of taking Vietnamese products into 7 world markets: choose an entry mode, negotiate with AI, manage ESG – with the IE Lab data workbench and CSV export for research and teaching."
],
[
"Mọi ý tưởng đều nặn được lại từ đầu. Sai thì bóp lại, nặn tiếp – thử nghiệm nhanh quan trọng hơn hoàn hảo ngay.",
"Every idea can be moulded again from scratch. If it is wrong, squash it and remould – fast iteration matters more than being perfect straight away."
],
[
"Mỗi vòng 5–7 phút; một ván trọn vẹn ≈ 30–45 phút, vừa một buổi học.",
"5–7 minutes per round; a full game ≈ 30–45 minutes, the length of one class."
],
[
"Mỗi đội 3–5 người: CEO, CFO, CMO, COO và Thư ký pháp chế.",
"Teams of 3–5: CEO, CFO, CMO, COO and Compliance Officer."
],
[
"Mở game ngay trên trình duyệt hoặc cài lên điện thoại như app thật (PWA) – hoàn toàn miễn phí, không cần tài khoản. Học trên lớp thì nhập Class ID do giảng viên cung cấp khi đăng nhập.",
"Open the game in your browser or install it on your phone like a real app (PWA) – completely free, no account needed. For classroom use, enter the Class ID your instructor gives you when you log in."
],
[
"Nghe nhạc →",
"Listen →"
],
[
"Người học là trung tâm. Mỗi tính năng phải trả lời được: «Điều này giúp sinh viên hiểu bài hơn thế nào?»",
"The learner comes first. Every feature must answer: «How does this help students understand better?»"
],
[
"Nhà nghiên cứu",
"Researcher"
],
[
"Nhóm luôn chào đón giảng viên, nhà nghiên cứu và cộng tác viên sáng tạo.",
"We always welcome instructors, researchers and creative collaborators."
],
[
"Nhạc nền game · instrumental",
"In-game music · instrumental"
],
[
"Nội dung",
"Content"
],
[
"Pháp · France",
"France"
],
[
"Phát triển tính năng game, tối ưu PWA và trải nghiệm di động. Biết Tailwind hoặc canvas là điểm cộng.",
"Build game features and optimise the PWA and mobile experience. Tailwind or canvas experience is a plus."
],
[
"Ra biển lớn →",
"Go global →"
],
[
"Ra quyết định dưới điều kiện không chắc chắn. Học kinh doanh bằng hậu quả của chính lựa chọn của bạn – nền tảng mô phỏng kinh doanh AI-enhanced với engine xác định, giải thích được.",
"Decide under uncertainty. Learn business through the consequences of your own choices – an AI-enhanced business simulation platform with a deterministic, explainable engine."
],
[
"Song ngữ Việt – Anh",
"Vietnamese – English bilingual"
],
[
"Song ngữ Việt–Anh",
"Vietnamese–English bilingual"
],
[
"Sơ mi thêu chữ LR, jeans & kính tròn – phiên bản đời thường",
"LR-embroidered shirt, jeans & round glasses – the everyday version"
],
[
"Sản phẩm chủ lực",
"Flagship products"
],
[
"Sản xuất âm nhạc",
"Music production"
],
[
"Số liệu thật",
"Real data"
],
[
"Thiết kế & quà tặng",
"Design & merchandise"
],
[
"Thư viện",
"Library"
],
[
"Thương hiệu & Âm nhạc",
"Brand & music"
],
[
"Thầy Tú bên laptop, sách mở và cà phê – nơi các Model Card ra đời",
"Tú at his laptop with open books and coffee – where the Model Cards were written"
],
[
"Toàn bộ dự án phát triển công khai trên GitHub – từ mã nguồn game, tài liệu hướng dẫn giảng viên đến quy trình phát hành từng phiên bản.",
"The whole project is developed in the open on GitHub – game source, instructor documentation and the release process for every version."
],
[
"Trò chơi vui nhưng mô hình phía sau nghiêm túc: mô phỏng định lượng, dữ liệu mở, kết quả tái lập được.",
"The game is fun but the model behind it is serious: quantitative simulation, open data, checkable results."
],
[
"Tuyển cộng tác viên",
"Open collaborations"
],
[
"Tùy chọn giao diện (chế độ sáng/tối, ngôn ngữ Việt/Anh) cũng lưu cục bộ.",
"Interface preferences (light/dark mode, Vietnamese/English) are also stored locally."
],
[
"Tạo hình nhân vật và bối cảnh đất nặn – đặc biệt đang cần 3 tạo hình con người cho các công ty đối thủ trong đấu trường.",
"Clay character and scene design – we especially need 3 human designs for the rival companies in the arena."
],
[
"Từ Việt Nam ra thế giới",
"From Vietnam to the world"
],
[
"Việt Nam",
"Vietnam"
],
[
"Vào game →",
"Enter the game →"
],
[
"Xem bản ghi DOI ↗",
"View the DOI record ↗"
],
[
"Xem các vị trí cộng tác →",
"See open collaborations →"
],
[
"Xem thư viện →",
"Browse the library →"
],
[
"Xuất CSV nhật ký quyết định (IE Lab) để chấm điểm và rút bài học.",
"Export the decision log (IE Lab) as CSV for grading and debriefing."
],
[
"Zenodo (trích dẫn học thuật)",
"Zenodo (academic citation)"
],
[
"chinh phục bản đồ Việt Nam",
"conquering the map of Vietnam"
],
[
"chiến lược quốc tế hóa & hiệu quả doanh nghiệp",
"internationalisation strategy & firm performance"
],
[
"chuẩn đầu ra · Model Cards",
"learning outcomes · Model Cards"
],
[
"claymorphism · nhạc gốc",
"claymorphism · original music"
],
[
"giảng dạy, học tập và nghiên cứu khoa học",
"teaching, learning and scientific research"
],
[
"không đại diện, không liên kết và không nhận tài trợ từ bất kỳ tổ chức chính trị nào",
"does not represent, is not affiliated with and receives no funding from any political organisation"
],
[
"kịch bản giả định",
"hypothetical scenario"
],
[
"localStorage của trình duyệt trên chính thiết bị của bạn",
"your browser's localStorage, on your own device"
],
[
"mỹ thuật ứng dụng",
"applied fine art"
],
[
"pre/post-test · pilot thật",
"pre/post-test · real pilot"
],
[
"tải trực tiếp về thiết bị của bạn",
"downloaded straight to your device"
],
[
"xem mục Truyền thông & báo chí",
"see the Press & media section"
],
[
"Áo len dệt tên dự án âm nhạc – cầu nối hai hệ sinh thái",
"Knitted sweater bearing the music project's name – the bridge between two ecosystems"
],
[
"Âm nhạc",
"Music"
],
[
"Âm nhạc gốc",
"Original music"
],
[
"Điều hành một doanh nghiệp.",
"Run a business."
],
[
"Điều hành xưởng linh vật đất sét qua 6 vòng kinh doanh: định giá, marketing, sản xuất, R&D, nhân sự và tài chính. Đội 3–5 người, mỗi ván ≈ 30–45 phút – vừa một buổi học.",
"Run a clay-mascot workshop through 6 business rounds: pricing, marketing, production, R&D, staffing and finance. Teams of 3–5, about 30–45 minutes per game – the length of one class."
],
[
"Đăng ký pilot →",
"Register for a pilot →"
],
[
"Đất sét trong tay",
"Clay in your hands"
],
[
"Đặt lịch demo →",
"Book a demo →"
],
[
"Đối tác sáng tạo",
"Creative partner"
],
[
"Ứng dụng web",
"Web app"
],
[
"• 1 lớp tối đa 60 sinh viên",
"• 1 class, up to 60 students"
],
[
"• Báo cáo tổng kết cuối pilot",
"• Final report at the end of the pilot"
],
[
"• Bộ công cụ giảng dạy đầy đủ + xuất dữ liệu",
"• Full teaching toolkit + data export"
],
[
"• Gói Research Edition: dữ liệu ẩn danh phục vụ nghiên cứu",
"• Research Edition: anonymised data for research"
],
[
"• Hỗ trợ trực tuyến trong buổi chơi",
"• Live online support during the session"
],
[
"• Không giới hạn lớp học",
"• Unlimited classes"
],
[
"• Kịch bản triển khai + Rubric + bảng tổng sắp",
"• Rollout scenario + rubric + standings sheet"
],
[
"• Kịch bản tùy biến theo học phần",
"• Scenario tailored to your course"
],
[
"• Thư viện giáo án & chứng nhận đội",
"• Lesson-plan library & team certificates"
],
[
"• Thương hiệu riêng của đơn vị",
"• Your institution's own branding"
],
[
"• Tất cả giảng viên trong đơn vị",
"• All instructors in the institution"
],
[
"• Đào tạo giảng viên & đồng hành triển khai",
"• Instructor training & rollout support"
],
[
"✉️ Gửi email cho nhóm",
"✉️ Email the team"
],
[
"✉️ Liên hệ",
"✉️ Contact"
],
[
"✉️ Liên hệ ngay",
"✉️ Get in touch"
],
[
"✉️ Liên hệ nhóm",
"✉️ Contact the team"
],
[
"⭐ Mã nguồn GitHub",
"⭐ GitHub source"
],
[
"🇻🇳 Tiếng Việt",
"🇻🇳 Vietnamese"
],
[
"🌏 Bản gốc – tiếng Việt",
"🌏 Original – Vietnamese"
],
[
"🌏 Hoặc chinh phục thị trường quốc tế – Go Global",
"🌏 Or conquer international markets – Go Global"
],
[
"🌏 Hệ sinh thái khởi nghiệp – từ Việt Nam vươn ra quốc tế",
"🌏 A startup ecosystem – from Vietnam to the world"
],
[
"🌏 Đồng hồ thế giới · World clocks",
"🌏 World clocks"
],
[
"🌟 Bản gốc ⭐",
"🌟 Original ⭐"
],
[
"🌾 Bản gốc",
"🌾 Original"
],
[
"🌾 Bản gốc (4 phút)",
"🌾 Original (4 minutes)"
],
[
"🎓 Sinh viên chơi",
"🎓 Students play"
],
[
"🎛️ Tiện ích · Quick controls",
"🎛️ Quick controls"
],
[
"🎤 Bản giọng nam",
"🎤 Male vocal version"
],
[
"🎨 Thư viện Sáng tạo & Cài áo Việt Nam",
"🎨 Creative Library & Vietnam lapel pins"
],
[
"🎮 Bắt đầu chơi",
"🎮 Start playing"
],
[
"🎮 CHƠI NGAY →",
"🎮 PLAY NOW →"
],
[
"🎮 Chơi thử ngay",
"🎮 Try it now"
],
[
"🎮 Nhạc nào cho game nào?",
"🎮 Which music for which game?"
],
[
"🏛️ Nhà trường nhân rộng",
"🏛️ Institutions scale it up"
],
[
"🐉 Bản gốc – instrumental",
"🐉 Original – instrumental"
],
[
"👋 Bản gốc",
"👋 Original"
],
[
"👥 Gặp đội ngũ hiện tại",
"👥 Meet the current team"
],
[
"👨‍🏫 Giảng viên chấm & phản hồi",
"👨‍🏫 Instructors grade & give feedback"
],
[
"📊 Bảng xếp hạng lớp thời gian thực",
"📊 Real-time class leaderboard"
],
[
"📊 Bằng chứng học tập",
"📊 Learning evidence"
],
[
"📊 Bằng chứng từ lớp học thật · ✉️ Đặt lịch pilot",
"📊 Evidence from a real classroom · ✉️ Book a pilot"
],
[
"📐 Chuẩn đầu ra & Model Cards",
"📐 Learning outcomes & Model Cards"
],
[
"📣 Chia sẻ · Share",
"📣 Share"
],
[
"📤 Kết quả tự nộp về hệ thống",
"📤 Results submitted automatically"
],
[
"📦 Bộ dữ liệu mở trên Zenodo",
"📦 Open dataset on Zenodo"
],
[
"📦 Gói triển khai cho tổ chức & đối tác",
"📦 Rollout packages for institutions & partners"
],
[
"📨 Soạn email",
"📨 Compose email"
],
[
"🔁 Bản remix",
"🔁 Remix"
],
[
"🔁 Bản remix (remastered)",
"🔁 Remix (remastered)"
],
[
"🔒 Chính sách Quyền riêng tư · Privacy Policy",
"🔒 Privacy Policy"
],
[
"🚀 Dự án",
"🚀 Project"
],
[
"🤝 Hợp tác cùng nhóm",
"🤝 Partner with the team"
],
[
"🤝 Tham gia nhóm",
"🤝 Join the team"
],
[
"🧑‍💻 Kho mã trên GitHub",
"🧑‍💻 GitHub repository"
],
[
"🧩 Giải pháp",
"🧩 Solutions"
],
[
"🧭 Bản gốc",
"🧭 Original"
],
[
"🪁 Bản gốc (remastered)",
"🪁 Original (remastered)"
],
[
"Hương sans frontières (nam)",
"Hương sans frontières (male vocals)"
],
[
"Bản phối giọng nam · lời tiếng Anh",
"Male-vocal mix · English lyrics"
],
[
"Lumina AI – Áo dài",
"Lumina AI – Áo dài"
],
[
"Lễ phục · màn chào và đêm trao Hộ chiếu Thương hiệu",
"Gala outfit · the welcome screen and Brand Passport night"
],
[
"Giám đốc tài chính · ly cà phê giữa hai phiên họp",
"CFO · a coffee between two meetings"
],
[
"Lễ phục · đọc dòng tiền trên bảng số liệu",
"Gala outfit · reading cash flow off the dashboard"
],
[
"Chiến lược & đổi mới · bảng số liệu thị trường trong tay",
"Strategy & innovation · market dashboard in hand"
],
[
"Lễ phục · dựng câu chuyện thương hiệu",
"Gala outfit · building the brand story"
],
[
"Victor Lâm – Đời thường",
"Victor Lâm – Everyday"
],
[
"Áo khoác len và huy hiệu địa cầu trên ngực",
"Knitted jacket with a globe pin on the chest"
],
[
"Mỹ phẩm thảo mộc · ôm chậu thảo mộc nguyên liệu",
"Herbal cosmetics · holding a pot of the raw herb"
],
[
"Lễ phục · câu chuyện thương hiệu là thế mạnh",
"Gala outfit · brand storytelling is the strength"
],
[
"Mekong Digital – Đời thường",
"Mekong Digital – Everyday"
],
[
"Áo hoodie và túi đeo chéo trên đường tới lớp",
"Hoodie and a crossbody bag on the way to class"
],
[
"Lumina – Ăn mừng",
"Lumina – Celebrating"
],
[
"Áo dài trắng, hai tay giơ cao – khoảnh khắc cả đội về đích",
"White áo dài, both arms raised – the moment the team crosses the line"
],
[
"Lumina – Làm tốt lắm",
"Lumina – Well done"
],
[
"Áo dài trắng huy hiệu cờ đỏ · giơ ngón cái khen quyết định hay",
"White áo dài with the red flag badge · thumbs up for a good call"
],
[
"Lumina – Mời vào phòng họp",
"Lumina – Welcome to the meeting"
],
[
"Đầm công sở trắng · một tay chống hông, một tay mời",
"White office dress · one hand on the hip, the other inviting you in"
],
[
"Bản remix 2",
"Remix 2"
],
[
"Bản phối thứ hai dài 3:24 · nhịp dày hơn cho màn tổng kết",
"Second remix, 3:24 · denser groove for the debrief"
],
[
"🏙️ Bối cảnh & minh họa",
"🏙️ Scenes & illustrations"
],
[
"Character Sheet – Bảng tạo hình «Hộ Chiếu Thương Hiệu»",
"Character Sheet – the «Brand Passport» cast board"
],
[
"🛂 Dàn nhân vật «Hộ Chiếu Thương Hiệu»",
"🛂 The «Brand Passport» cast"
],
[
"Cố vấn AI · người dẫn chuyện suốt sáu quý chơi",
"AI adviser · narrator across all six quarters"
],
[
"Nhà sáng lập · giữ hồn nghề, tay nâng hũ đặc sản gia truyền",
"Founder · keeper of the craft, holding the family speciality jar"
],
[
"Lễ phục · giỏ quà quê trong đêm trao Hộ chiếu Thương hiệu",
"Gala outfit · hometown gift basket on Brand Passport night"
],
[
"Giám đốc tài chính · đọc dòng tiền trên bảng số liệu",
"CFO · reading cash flow off the dashboard"
],
[
"Chiến lược & đổi mới · dựng câu chuyện thương hiệu",
"Strategy & innovation · building the brand story"
],
[
"Cố vấn quốc tế hóa · ôm tập báo cáo thị trường",
"Internationalisation adviser · market reports in hand"
],
[
"Lễ phục · hộp hồ sơ thị trường xuất khẩu",
"Gala outfit · export market dossier box"
],
[
"Cố vấn phân phối · bút chỉ và bản đồ tuyến hàng",
"Distribution adviser · pointer and shipping-route map"
],
[
"Lễ phục · bản vẽ tuyến phân phối cuộn trong tay",
"Gala outfit · rolled distribution-route plan in hand"
],
[
"Mỹ phẩm thảo mộc · câu chuyện thương hiệu là thế mạnh",
"Herbal cosmetics · brand storytelling is the strength"
],
[
"Thực phẩm chế biến · khay hũ đặc sản miền Tây",
"Processed foods · tray of Mekong Delta speciality jars"
],
[
"Lễ phục · mâm món ăn giới thiệu tại hội chợ",
"Gala outfit · tasting tray for the trade fair"
],
[
"Thời trang bền vững · vải chàm nhuộm tay và khung dệt",
"Sustainable fashion · hand-dyed indigo cloth and loom"
],
[
"Lễ phục · áo dài thêu hoa, tay nâng mẫu vải chàm",
"Gala outfit · embroidered áo dài, holding an indigo fabric swatch"
],
[
"Phần mềm quản trị · kênh số mạnh, biên lời cao",
"Management software · strong digital channel, high margin"
],
[
"Tú Phan – Vest xanh rêu",
"Tú Phan – Moss-green suit"
],
[
"🐺 CEO Alpha Dynamics",
"🐺 Alpha Dynamics CEO"
],
[
"Đối thủ AI · giá rẻ tốc chiến, khoanh tay thách thức",
"AI rival · low-price blitz, arms crossed in defiance"
],
[
"🐘 CEO Mekong Ventures",
"🐘 Mekong Ventures CEO"
],
[
"Đối thủ AI · cân bằng chắc chắn như đồng bằng",
"AI rival · steady balance, solid as the delta"
],
[
"🦚 CEO Star Clay Co.",
"🦚 Star Clay Co. CEO"
],
[
"Đối thủ AI · cao cấp thương hiệu, tay nâng cúp RIVAL",
"AI rival · premium branding, holding the RIVAL trophy"
],
[
"👆 Chạm vào một đối thủ để xem hồ sơ tình báo",
"👆 Tap a rival to open their intelligence file"
],
[
"Cắm cờ đầu tiên",
"First flag planted"
],
[
"Thắng một vòng trên bản đồ chinh phục.",
"Win a round on the conquest map."
],
[
"Chiến lược gia Nếu–Thì",
"What-If strategist"
],
[
"Dùng mô phỏng Nếu–Thì của Lumina ít nhất một lần.",
"Use Lumina's What-If simulation at least once."
],
[
"Lắng nghe đội",
"Team listener"
],
[
"Áp dụng 3 gợi ý từ Cuộc họp đội.",
"Apply 3 suggestions from the Team Meeting."
],
[
"Vô địch BizOn",
"BizOn champion"
],
[
"Kết thúc 6 vòng với lợi nhuận cao nhất sàn đấu.",
"Finish all 6 rounds with the highest profit in the arena."
],
[
"Dang tay chào đón · cài áo Bản đồ Việt Nam trên ve áo",
"Open-armed welcome · Vietnam Map pin on the lapel"
],
[
"Trung tâm Điều hành Doanh nghiệp",
"Business Command Center"
],
[
"Biểu đồ 3D, la bàn vàng & cúp chiến thắng – quản trị dựa trên dữ liệu",
"3D charts, golden compass & victory trophy – data-driven management"
],
[
"Bàn họp chiến lược hologram",
"Holographic strategy table"
],
[
"5 vai trò nòng cốt thảo luận quanh biểu đồ Gantt – như trong Cuộc họp đội mỗi vòng",
"The 5 core roles discussing around a Gantt chart – just like each round's Team Meeting"
],
[
"Vươn ra biển lớn",
"Sailing to the open sea"
],
[
"Các tuyến bay & tàu hàng tỏa ra từ ghim Việt Nam – tinh thần BizOn Go Global",
"Flight & cargo routes radiating from the Vietnam pin – the BizOn Go Global spirit"
],
[
"Nơi mọi quyết định hội tụ: biểu đồ thị phần, la bàn chiến lược và chiếc cúp dành cho đội thắng cuộc – quản trị dựa trên dữ liệu qua từng vòng chơi.",
"Where every decision converges: market-share charts, a strategy compass and the trophy for the winning team – data-driven management across every round."
],
[
"Tú Phan",
"Tu Phan"
],
[
"⏱️ Một ván 6 vòng ≈ 30–45 phút (mỗi vòng 5–7 phút) – vừa một buổi học. Chơi thử nhanh với Đội Demo: ~10 phút cho 2 vòng đầu.",
"⏱️ A full 6-round match ≈ 30–45 minutes (5–7 min per round) – fits one class session. Quick try with the Demo Team: ~10 minutes for the first 2 rounds."
],
[
"🌐 VI/EN",
"🌐 EN/VI"
],
[
"Kho Âm nhạc BizOn",
"BizOn Music Library"
],
[
"Bài hát chính của BizOn · bản thu có lời",
"BizOn's main theme song · vocal recording"
],
[
"Ca khúc tiếng Việt về «đường cong ta học» · bản thu có lời (remastered)",
"Vietnamese song about «the curve we all learn» · vocal recording (remastered)"
],
[
"Ca khúc tiếng Việt · bản thu có lời",
"Vietnamese song · vocal recording"
],
[
"🎵 Nhạc nền (Hương on Return)",
"🎵 Background music (Hương on Return)"
],
[
"🧷 Sản phẩm & Quà tặng",
"🧷 Merchandise & Gifts"
],
[
"Bộ cài áo (lapel pin) chính thức của BizOn – quà tặng cho đội vô địch và vật phẩm nhận diện thương hiệu.",
"BizOn's official lapel-pin collection – champion-team gifts and brand keepsakes."
],
[
"Cài áo Bản đồ Việt Nam",
"Vietnam Map lapel pin"
],
[
"Men đỏ viền vàng, sao vàng Lũng Cú – biểu tượng hành trình chinh phục 6 vòng chơi",
"Red enamel with gold trim and the Lũng Cú gold star – symbol of the 6-round conquest"
],
[
"Bộ ba Sao đỏ · +84 · VIETNAM",
"Red Star · +84 · VIETNAM trio"
],
[
"Bộ pin BizOn Go Global – mang mã vùng +84 ra thế giới",
"The BizOn Go Global pin set – carrying the +84 dialing code to the world"
],
[
"Tú Phan với cài áo Việt Nam",
"Tú Phan with the Vietnam pin"
],
[
"Cố vấn học thuật đeo cài áo bản đồ Việt Nam trên ve áo vest",
"The academic advisor wearing the Vietnam-map pin on his lapel"
],
[
"🔗 Khám phá thêm",
"🔗 Explore more"
],
[
"Toàn bộ tài sản sáng tạo của",
"All creative assets of"
],
[
"Ca khúc BizOn Go Global · International pop 118 BPM · bản thu tiếng Việt",
"BizOn Go Global theme song · International pop 118 BPM · Vietnamese vocal recording"
],
[
"Bản song ngữ Anh–Việt cho phát hành quốc tế · bản thu có lời",
"English–Vietnamese bilingual version for international release · vocal recording"
],
[
"Ca khúc BizOn Go Global · bản tiếng Việt",
"BizOn Go Global theme song · Vietnamese version"
],
[
"Bản song ngữ Anh–Việt · phát hành quốc tế",
"English–Vietnamese bilingual · international release"
],
[
"Bản phối giọng nam · lời tiếng Anh song ngữ",
"Male-vocal arrangement · bilingual English lyrics"
],
[
"Bản phối giọng nam · lời tiếng Anh",
"Male-vocal arrangement · English lyrics"
],
[
"🎶 Kho Âm nhạc BizOn",
"🎶 BizOn Music Library"
],
[
"Ca khúc gốc, trình phát đầy đủ, lời bài hát và giọng Lumina AI.",
"Original songs, a full player, lyrics and the Lumina AI voice."
],
[
"Toàn bộ ca khúc gốc và giọng Lumina của riêng BizOn – trình phát đầy đủ.",
"All of BizOn's own original songs and Lumina voice clips – with a full player."
],
[
"Toàn bộ ca khúc gốc và giọng nói của vũ trụ BizOn Bật Nghiệp – sáng tác riêng cho game, thuộc bản quyền của nhóm tác giả.",
"All original songs and voices of the BizOn Bật Nghiệp universe – composed for the game, copyright of the authors."
],
[
"💿 Ca khúc gốc",
"💿 Original songs"
],
[
"🎙️ Giọng Lumina AI",
"🎙️ Lumina AI voice"
],
[
"🎮 Nghe nhạc ở đâu trong game?",
"🎮 Where does the music play in-game?"
],
[
"Game chính",
"Main game"
],
[
"Nút 🎵 trên đầu game – playlist tự xoay vòng cả ba ca khúc.",
"The 🎵 button in the game header – the playlist rotates through all three songs."
],
[
"«Hương sans frontières» – ca khúc chủ đề hành trình ra biển lớn.",
"«Hương sans frontières» – the theme song of the voyage to the open sea."
],
[
"Nhạc nền tùy chọn khi chơi các mini-game phản xạ.",
"Optional background music while playing the reflex mini-games."
],
[
"Lời chào Hương",
"Hương's greeting"
],
[
"Cố vấn xin chào",
"Advisor hello"
],
[
"Kết quả vòng chơi",
"Round result"
],
[
"Chúc mừng chiến thắng",
"Victory cheer"
],
[
"▶ Nghe thử",
"▶ Preview"
],
[
"📚 Thư viện",
"📚 Library"
],
[
"🧪 Lưu ý: IE Lab là công cụ mô phỏng số liệu phục vụ học tập môn Khởi nghiệp quốc tế – các đường cong, điểm ngoặt (≈ 43% FSTS), hiệu ứng \"lá chắn số\" và trường hợp đảo nhỏ đều là tham số mô phỏng minh họa, không phải số liệu thống kê thực của bất kỳ doanh nghiệp nào.",
"🧪 Note: the IE Lab is a data-simulation tool for International Entrepreneurship courses – the curves, turning point (≈ 43% FSTS), \"digital shield\" effect and small-island scenario are illustrative simulation parameters, not real statistics of any firm."
],
[
"📈 So sánh 4 kiểu thị trường (cùng mức năng lực số hiện tại)",
"📈 Comparing 4 market types (at your current digital-capability level)"
],
[
"Bốn đường cong mô phỏng trên cùng một trục: thể chế chuyển đổi (chữ U ngược), thể chế mạnh (gần tuyến tính), đảo nhỏ SIDS (giảm đơn điệu) và kịch bản gộp toàn châu Á.",
"Four simulated curves on one axis: transition institutions (inverted U), strong institutions (near-linear), small islands SIDS (monotonic decline) and the pooled all-Asia scenario."
],
[
"🧭 So sánh 4 phương thức thâm nhập",
"🧭 Comparing 4 entry modes"
],
[
"Vốn đầu tư ban đầu, mức kiểm soát và độ rủi ro (thang 0–10, tham số mô phỏng) – đổi lấy nhau: càng kiểm soát cao càng tốn vốn và rủi ro.",
"Upfront capital, control level and risk (0–10 scale, simulation parameters) – trade-offs: more control costs more capital and carries more risk."
],
[
"Đầu tư mới (FDI)",
"Greenfield (FDI)"
],
[
"Triết lý 5 góc nhìn",
"The 5-lens philosophy"
],
[
"5 vai trò lãnh đạo cốt lõi",
"5 core leadership roles"
],
[
"Tổng giám đốc điều hành – người cầm lái chiến lược.",
"Chief Executive Officer – the one steering strategy."
],
[
"Giám đốc tài chính – quản trị dòng tiền & lợi nhuận.",
"Chief Financial Officer – managing cash flow & profit."
],
[
"Giám đốc marketing – chiếm lĩnh thị phần.",
"Chief Marketing Officer – capturing market share."
],
[
"Giám đốc vận hành – tối ưu hóa quy trình.",
"Chief Operating Officer – optimizing processes."
],
[
"Thư ký hội đồng – quản lý thông tin & rủi ro.",
"Board Secretary – managing information & risk."
],
[
"Lộ trình trải nghiệm 6 vòng",
"The 6-round journey"
],
[
"Nghiên cứu",
"Research"
],
[
"Thiết lập",
"Setup"
],
[
"Thâm nhập",
"Entry"
],
[
"Vận hành",
"Operations"
],
[
"Tăng tốc",
"Scale-up"
],
[
"Chốt sổ",
"Closing"
],
[
"Phân tích thị trường & đối thủ.",
"Analyze the market & rivals."
],
[
"Định vị sản phẩm & giá bán.",
"Position your product & price."
],
[
"Triển khai chiến dịch marketing.",
"Launch marketing campaigns."
],
[
"Quản trị sản xuất & tồn kho.",
"Manage production & inventory."
],
[
"Mở rộng quy mô kinh doanh.",
"Scale up the business."
],
[
"Báo cáo P&L & chứng nhận.",
"Final P&L & certificate."
],
[
"Cố vấn chiến lược Lumina",
"Lumina, your strategy advisor"
],
[
"Lumina phân tích số liệu mô phỏng của đội bạn theo thời gian thực – đề xuất kịch bản tối ưu và cảnh báo rủi ro sớm để bạn dẫn đầu thị trường.",
"Lumina analyzes your team's simulation data in real time – proposing optimal scenarios and early risk alerts so you stay ahead of the market."
],
[
"Dành cho giảng viên & doanh nghiệp",
"For instructors & businesses"
],
[
"Mang BizOn vào lớp học hoặc chương trình đào tạo: Class ID cho từng lớp, chế độ Giảng viên (khóa vòng, cấp vốn thưởng, nhật ký), hành vi đối thủ AI tất định – kết quả tái lập được, tiện chấm điểm giữa các đội.",
"Bring BizOn to your classroom or training program: per-class Class IDs, an Instructor mode (round locks, bonus funding, logs), and deterministic AI rivals – reproducible results, easy to grade across teams."
],
[
"📖 Hướng dẫn giảng viên",
"📖 Instructor guide"
],
[
"🚀 Dùng cho lớp học",
"🚀 Use it in class"
],
[
"✅ Kèm khung chấm điểm, bảng hành vi AI và gợi ý tổ chức lớp đầy đủ trên GitHub",
"✅ Includes a grading rubric, AI behavior tables and full classroom tips on GitHub"
],
[
"Hỗ trợ",
"Support"
],
[
"Câu hỏi thường gặp",
"Frequently asked questions"
],
[
"Founder & Creative Lead",
"Founder & Creative Lead"
],
[
"Academic Advisor",
"Academic Advisor"
],
[
"Kiến trúc sư chính của BizOn – hóa thân thành cố vấn AI Lumina, tập trung vào trải nghiệm người dùng và thẩm mỹ Claymorphism hiện đại.",
"BizOn's lead architect – embodied as the Lumina AI advisor, focused on user experience and modern claymorphism aesthetics."
],
[
"Cố vấn học thuật cao cấp – đảm bảo tính thực tiễn và chiều sâu kiến thức kinh doanh trong mọi kịch bản mô phỏng.",
"Senior academic advisor – ensuring practical rigor and business depth in every simulation scenario."
],
[
"Chào mừng đến BizOn!",
"Welcome to BizOn!"
],
[
"Trò chơi mô phỏng kinh doanh 3D phong cách đất sét dành cho đào tạo khởi nghiệp – chọn một cánh cửa để bắt đầu.",
"A 3D claymorphism business-simulation game for entrepreneurship education – pick a door to begin."
],
[
"Chinh phục bản đồ Việt Nam từ Cần Thơ tới Hà Nội cùng cố vấn Lumina AI.",
"Conquer the map of Vietnam from Cần Thơ to Hà Nội with the Lumina AI advisor."
],
[
"CHƠI NGAY →",
"PLAY NOW →"
],
[
"Thư viện Sáng tạo",
"Creative Library"
],
[
"📚 Thư viện Sáng tạo",
"📚 Creative Library"
],
[
"🏠 Trang chủ BizOn",
"🏠 BizOn Home"
],
[
"🏠 Trang chủ",
"🏠 Home"
],
[
"Tạo hình nhân vật, âm nhạc, lời bài hát – kết nối hệ sinh thái Je m'appelle Hương & M-AIDA.",
"Character art, original music and lyrics – connected to the Je m'appelle Hương & M-AIDA ecosystem."
],
[
"Demo tương tác, 5 vai trò lãnh đạo, lộ trình 6 vòng, mini-game và FAQ.",
"Interactive demo, 5 leadership roles, the 6-round journey, mini-games and FAQ."
],
[
"8 trò chơi của hệ sinh thái – từ mô phỏng chiến lược đến phản xạ 30 giây.",
"8 games in the ecosystem – from strategy sim to 30-second reflex games."
],
[
"Từ Việt Nam ra thế giới: phương thức thâm nhập, World Market LIVE và IE Lab Khởi nghiệp quốc tế.",
"From Vietnam to the world: entry modes, World Market LIVE and the International Entrepreneurship Lab."
],
[
"Đỗ Thùy Hương & Phan Anh Tú – sứ mệnh và tầm nhìn 2026.",
"Do Thuy Huong & Phan Anh Tu – mission and vision 2026."
],
[
"🎨 Tạo hình nhân vật",
"🎨 Character art"
],
[
"🎵 Âm nhạc gốc",
"🎵 Original music"
],
[
"Ca khúc BizOn Go Global · bản thu có lời",
"BizOn Go Global theme song · vocal recording"
],
[
"Đội Demo Bật Nghiệp – 5 thành viên đất nặn",
"The Bật Nghiệp demo team – 5 clay members"
],
[
"COO Bảo Ngọc · CFO Thu Hà · CEO Minh Long · CMO Lan Chi · Thư ký pháp chế Gia Hân",
"COO Bảo Ngọc · CFO Thu Hà · CEO Minh Long · CMO Lan Chi · Compliance Officer Gia Hân"
],
[
"🌉 Hệ sinh thái Je m'appelle Hương",
"🌉 The Je m'appelle Hương ecosystem"
],
[
"BizOn và M-AIDA chia sẻ cùng một vũ trụ sáng tạo – nhân vật Hương, bản đồ Việt Nam và âm nhạc gốc.",
"BizOn and M-AIDA share one creative universe – the Hương character, the map of Vietnam and original music."
],
[
"🎼 Ứng dụng M-AIDA",
"🎼 M-AIDA app"
],
[
"🎨 Creative Library (M-AIDA)",
"🎨 Creative Library (M-AIDA)"
],
[
"👩‍🎓 Trang cá nhân Đỗ Thùy Hương",
"👩‍🎓 Do Thuy Huong's personal page"
],
[
"Trang cá nhân Đỗ Thùy Hương",
"Do Thuy Huong's personal page"
],
[
"Dành cho giảng viên · Pilot Classroom",
"For instructors · Pilot Classroom"
],
[
"Bảng điều khiển lớp học",
"Classroom dashboard"
],
[
"🔑 Kết nối lớp",
"🔑 Connect your class"
],
[
"Mã lớp học (sinh viên nhập khi đăng nhập game)",
"Class ID (students enter it at game login)"
],
[
"Khóa giảng viên",
"Instructor key"
],
[
"📡 Theo dõi lớp",
"📡 Watch class"
],
[
"Chưa kết nối. Nhập Mã lớp + Khóa giảng viên rồi bấm \"Theo dõi lớp\".",
"Not connected. Enter the Class ID + Instructor key, then press \"Watch class\"."
],
[
"⬇️ Xuất CSV",
"⬇️ Export CSV"
],
[
"📋 CSV khảo sát",
"📋 Survey CSV"
],
[
"Đội",
"Team"
],
[
"Vòng",
"Round"
],
[
"Số dư",
"Balance"
],
[
"Lượt nộp",
"Submissions"
],
[
"Nộp gần nhất",
"Last submitted"
],
[
"Xếp theo thị phần của vòng cao nhất mỗi đội. Một đội chơi lại vòng sẽ tính lần nộp mới nhất.",
"Ranked by market share of each team's highest locked round. Replays count the latest submission."
],
[
"⏱️ Dòng thời gian nộp bài",
"⏱️ Submission timeline"
],
[
"📊 Phân tích khảo sát trước–sau",
"📊 Pre–post survey analysis"
],
[
"🔬 Phân tích ngay",
"🔬 Analyze now"
],
[
"Ghép cặp phiếu trước–sau theo mã tự đặt (lấy lần nộp mới nhất mỗi phiếu) và tính sẵn các chỉ số nghiên cứu. Muốn dữ liệu thô đầy đủ thì dùng nút \"CSV khảo sát\" ở trên.",
"Pairs pre–post surveys by self-chosen code (latest submission each) and computes the key research metrics. For full raw data use the \"Survey CSV\" button above."
],
[
"Bấm \"Phân tích ngay\" sau khi lớp đã nộp phiếu.",
"Press \"Analyze now\" once the class has submitted surveys."
],
[
"❓ Hướng dẫn nhanh",
"❓ Quick guide"
],
[
"Phiếu trước",
"Pre surveys"
],
[
"Phiếu sau",
"Post surveys"
],
[
"Cặp ghép được",
"Matched pairs"
],
[
"theo mã tự đặt",
"by self-code"
],
[
"Điểm giới thiệu TB",
"Avg. recommend score"
],
[
"Δ Kiến thức",
"Δ Knowledge"
],
[
"Δ Tự tin",
"Δ Confidence"
],
[
"ảnh hưởng lớn",
"large effect"
],
[
"ảnh hưởng vừa",
"medium effect"
],
[
"ảnh hưởng nhỏ",
"small effect"
],
[
"chưa rõ ảnh hưởng",
"unclear effect"
],
[
"cần cặp trước–sau",
"needs pre–post pairs"
],
[
"cần ≥ 2 cặp",
"needs ≥ 2 pairs"
],
[
"Chuẩn đầu ra (cụm 3 câu)",
"Learning outcome (3-item cluster)"
],
[
"Trước /3",
"Pre /3"
],
[
"Sau /3",
"Post /3"
],
[
"Giá & marketing",
"Pricing & marketing"
],
[
"Tài chính",
"Finance"
],
[
"Vận hành",
"Operations"
],
[
"KD quốc tế",
"International business"
],
[
"Chiến lược",
"Strategy"
],
[
"📚 Kịch bản lớp học",
"📚 Classroom playbook"
],
[
"🎮 Vào game",
"🎮 Play the game"
],
[
"Lớp thử nghiệm · Ẩn danh",
"Pilot class · Anonymous"
],
[
"Khảo sát trước–sau BizOn",
"BizOn pre–post survey"
],
[
"📋 Thông tin phiếu",
"📋 Survey info"
],
[
"Bạn đang làm phiếu nào?",
"Which survey are you taking?"
],
[
"Mã tự đặt – 2 chữ cái + 2 số (nhớ dùng lại ở phiếu sau)",
"Self-chosen code – 2 letters + 2 digits (reuse it on the post survey)"
],
[
"Mã lớp học (giảng viên phát)",
"Class ID (from your instructor)"
],
[
"Vai trò trong đội",
"Your team role"
],
[
"Số vòng đã chơi",
"Rounds played"
],
[
"🧠 Phần A – Kiến thức kinh doanh",
"🧠 Part A – Business knowledge"
],
[
"Chọn một đáp án mỗi câu (15 câu).",
"Pick one answer per question (15 questions – in Vietnamese to keep the research instrument consistent)."
],
[
"💪 Phần B – Mức độ tự tin",
"💪 Part B – Confidence"
],
[
"1 = hoàn toàn không tự tin · 5 = rất tự tin",
"1 = not confident at all · 5 = very confident"
],
[
"🎮 Phần C – Trải nghiệm với BizOn",
"🎮 Part C – Your BizOn experience"
],
[
"1 = hoàn toàn không đồng ý · 5 = hoàn toàn đồng ý",
"1 = strongly disagree · 5 = strongly agree"
],
[
"Trên thang 0–10, bạn sẵn lòng giới thiệu BizOn cho bạn học khác ở mức nào?",
"On a 0–10 scale, how likely are you to recommend BizOn to a classmate?"
],
[
"Điều bạn thích nhất ở BizOn?",
"What did you like most about BizOn?"
],
[
"Điều gì còn khó hiểu hoặc cần cải thiện?",
"What was confusing or could be improved?"
],
[
"Kiểm tra kỹ rồi bấm nộp – mỗi phiếu chỉ nộp một lần.",
"Double-check your answers – each survey can be submitted only once."
],
[
"📨 Nộp phiếu",
"📨 Submit survey"
],
[
"🖨️ Bản in A4",
"🖨️ Printable A4"
],
["Mô phỏng khởi nghiệp · 5 tuần", "Startup simulation · 5 weeks"],
["🧺 Gánh Hàng Khởi Nghiệp: Bến Phù Sa", "🧺 Entrepreneurial Street Vendor: Ben Phu Sa"],
["Gánh Hàng Khởi Nghiệp", "Entrepreneurial Street Vendor"],
["Khởi nghiệp hàng rong ở thị trấn giả tưởng Bến Phù Sa: mỗi tuần chọn Phương thức – Món hàng – Địa điểm. Bản địa hóa giảng dạy phi thương mại dựa trên cấu trúc «Food Truck Challenge» (HBP), theo định hướng của PGS.TS. Phan Anh Tú.", "A street-vendor startup in the fictional river town of Bến Phù Sa: each week pick Method – Product – Location. A non-commercial teaching localization built on the structure of HBP's \"Food Truck Challenge\", guided by Assoc. Prof. Dr. Phan Anh Tú."],
["«Từ một gánh hàng nhỏ, bạn có thể xây dựng nên một thương hiệu lớn – nếu biết quan sát thị trường, thấu hiểu khách hàng và ra quyết định đúng lúc.»", "\"From one small street stall, you can build a big brand – if you watch the market, understand your customers, and decide at the right moment.\""],
["💡 Phương án bản địa hóa phục vụ giảng dạy, xây dựng dựa trên cấu trúc mô phỏng «The Food Truck Challenge» (Michael A. Roberto – Harvard Business Publishing · Forio), theo định hướng sư phạm của PGS.TS. Phan Anh Tú (Trường Kinh tế, ĐH Cần Thơ) · Chỉ dùng nội bộ lớp học, phi thương mại · Nhân vật, giao diện và lời thoại do BizOn tự phát triển.", "💡 A teaching localization built on the structure of the simulation \"The Food Truck Challenge\" (Michael A. Roberto – Harvard Business Publishing · Forio), under the pedagogical guidance of Assoc. Prof. Dr. Phan Anh Tú (School of Economics, Can Tho University) · For in-class, non-commercial use only · Characters, interface and writing developed by BizOn."],
["📜 Luật chơi", "📜 How to play"],
["Chọn đội của bạn", "Choose your team"],
["Chọn thuyền trưởng", "Pick your captain"],
["🚀 Bắt đầu 5 tuần kinh doanh", "🚀 Start your 5-week venture"],
["🐉 Đội Demo Rồng Xanh", "🐉 Green Dragon Demo Team"],
["5 thành viên", "5 members"],
["🌾 Đội Phù Sa", "🌾 Phù Sa Team"],
["🔒 Đang tạo hình nhân vật – sắp ra mắt!", "🔒 Characters in the making – coming soon!"],
["Thư ký", "Secretary"],
["triệu ₫", "million ₫"],
["Tuần", "Week"],
["chọn 3 quyết định", "make 3 decisions"],
["1 · Phương thức", "1 · Method"],
["2 · Món hàng", "2 · Product"],
["3 · Địa điểm", "3 · Location"],
["Xe bán hàng lưu động", "Mobile vending cart"],
["Gánh hàng rong", "Street hawking"],
["Khảo sát chợ", "Market survey"],
["Phục vụ nhanh", "Fast service"],
["Cần bảo quản", "Needs careful storage"],
["Biên lời cao · chậm", "High margin · slow brew"],
["du khách sáng sớm", "early-morning tourists"],
["khách vãng lai", "passers-by"],
["sinh viên", "students"],
["gia đình cuối tuần", "weekend families"],
["công nhân tan ca", "workers after shift"],
["giới trẻ về đêm", "late-night crowd"],
["Doanh thu ×3", "Revenue ×3"],
["Doanh thu ×1 · nhiều tin", "Revenue ×1 · more intel"],
["Không bán · dữ liệu cũ", "No sales · old data"],
["Chè bưởi", "Pomelo sweet soup"],
["Cà phê phin", "Phin coffee"],
["Chợ nổi", "Floating market"],
["Bến phà", "Ferry pier"],
["Làng đại học", "University village"],
["Công viên bờ sông", "Riverside park"],
["Khu công nghiệp", "Industrial zone"],
["Chợ đêm", "Night market"],
["🔒 Chốt tuần này", "🔒 Lock in this week"],
["Chọn đủ Phương thức + Món hàng + Địa điểm để chốt.", "Pick a Method + Product + Location to lock in."],
["Tuần này bạn dừng bán để mua dữ liệu lịch sử.", "This week you pause sales to buy historical data."],
["🔎 Quan sát thị trường", "🔎 Market observations"],
["Thông tin thu được sau mỗi tuần – manh mối quan trọng nhất của bạn.", "What you learn after each week – your most valuable clues."],
["Chưa có dữ liệu – hãy chốt tuần đầu tiên.", "No data yet – lock in your first week."],
["Vô địch Bến Phù Sa!", "Champion of Bến Phù Sa!"],
["Á quân Bến Phù Sa – sát nút!", "Bến Phù Sa runner-up – so close!"],
["Hạng 3 – thị trường khốc liệt", "3rd place – a brutal market"],
["Về chót… nhưng bài học là thật", "Last place… but the lessons are real"],
["🔄 Chơi lại", "🔄 Play again"],
["🎓 Câu hỏi tổng kết (thảo luận cùng lớp)", "🎓 Debrief questions (for class discussion)"],
["📡 Nộp kết quả cho giảng viên (tùy chọn)", "📡 Submit your result to the instructor (optional)"],
["Nộp", "Submit"],
["Đang gửi…", "Sending…"],
["Nhập Mã lớp trước đã nhé.", "Please enter your Class code first."],
["✅ Đã nộp! Kết quả đã hiện trên bảng của giảng viên.", "✅ Submitted! Your result now shows on the instructor's board."],
["⚠️ Chưa gửi được – kiểm tra mạng rồi thử lại.", "⚠️ Could not send – check your connection and try again."],
["🧺 Gánh Hàng Khởi Nghiệp – kết quả lớp", "🧺 Entrepreneurial Street Vendor – class results"],
["Hộ Chiếu Thương Hiệu", "Brand Passport"],
["BizOn Go Global: chọn 1 trong 4 doanh nghiệp, đưa thương hiệu Việt từ Vàm Thịnh ra 6 thị trường giả tưởng – sương mù thông tin, đàm phán đối tác, sự kiện bất định; thành công đo bằng 5 chiều: lợi nhuận, uy tín, năng lực, thích ứng, bền vững.", "BizOn Go Global: pick 1 of 4 companies and take a Vietnamese brand from Vàm Thịnh to 6 fictional markets – information fog, partner negotiation, uncertain events; success measured in 5 dimensions: profit, reputation, capability, adaptability, sustainability."],
["Sinh viên nộp từ màn kết thúc của game (cùng Mã lớp). Mỗi người tính ván có hiệu suất cao nhất; hạng là thứ hạng so với 3 đối thủ AI trong ván đó.", "Students submit from the game's end screen (same Class code). Each player counts their best-efficiency run; rank is their placing against the 3 AI rivals in that run."],
["Sinh viên", "Student"],
["Hiệu suất", "Efficiency"],
["Hạng trong ván", "In-game rank"],
["Lượt chơi", "Plays"],
["Lần cuối", "Last played"],
["Tuần 1 bạn chọn gì? Vì sao?", "What did you choose in week 1? Why?"],
["Bạn có đổi chiến lược sau khi nhận phản hồi thị trường không?", "Did you change strategy after market feedback?"],
["Bài học nào áp dụng được cho khởi nghiệp thật?", "Which lessons carry over to real startups?"],
[
"6 bài",
"6 tracks"
],
[
"8 bài",
"8 tracks"
],
[
"9 bài",
"9 tracks"
],
[
"Màu Việt Nam",
"Vietnamese colour"
],
[
"Màu quốc tế hóa",
"Internationalisation colour"
],
[
"Phù sa Mekong và đa ngôn ngữ",
"Mekong silt, multilingual"
],
[
"Nhịp nhanh",
"Up-tempo"
],
[
"Mở danh sách bài ▸",
"Open the tracklist ▸"
],
[
"Đang mở ▾",
"Open ▾"
],
[
"Tuyển tập",
"Collection"
],
[
"▶ Phát cả tuyển tập",
"▶ Play the whole collection"
],
[
"⏸ Tạm dừng",
"⏸ Pause"
],
[
"Thể loại",
"Genre"
],
[
"Dùng trong",
"Used in"
],
[
"Bản quyền",
"Copyright"
],
[
"🎮 Game mô phỏng chính",
"🎮 Main simulation game"
],
[
"🛂 Game Hộ Chiếu Thương Hiệu",
"🛂 Brand Passport game"
],
[
"🌏 Bản đồ Go Global",
"🌏 Go Global map"
],
[
"🕹️ Khu mini-game",
"🕹️ Mini-game arcade"
],
[
"Nhạc nền xoay vòng suốt 6 vòng chơi của game mô phỏng khởi nghiệp – giữ màu V-pop và tinh thần đội nhóm.",
"Background music cycling through all six rounds of the start-up simulation – V-pop colour and team spirit throughout."
],
[
"Tuyến nhạc của hành trình đưa thương hiệu ra khỏi biên giới – từ «Brand Passport» tới «Stamps Beyond Borders».",
"The soundtrack of taking a brand beyond its borders – from «Brand Passport» to «Stamps Beyond Borders»."
],
[
"Tuyển tập đa ngôn ngữ Việt – Anh – Pháp, lấy dòng Mekong làm mạch chính. Gồm trọn bộ «Je m'appelle Hương sans frontières».",
"A Vietnamese–English–French collection running along the Mekong. Includes the complete «Je m'appelle Hương sans frontières» set."
],
[
"Các bài nhịp nhanh, hợp những mini-game đòi phản xạ – nghe ngắn, vào thẳng cao trào.",
"Up-tempo tracks for reflex mini-games – short, straight into the chorus."
],
[
"«Mon histoire»",
"«Mon histoire»"
],
[
"Ca khúc lời tiếng Pháp · nhịp nhanh, dùng trong BizOn Arcade",
"French-language song · up-tempo, used in BizOn Arcade"
],
[
"«BizOn Theme»",
"«BizOn Theme»"
],
[
"Nhạc hiệu instrumental của hệ sinh thái · dùng làm nền chung cho Bật Nghiệp và Arcade",
"The ecosystem's instrumental signature · shared background for Bật Nghiệp and Arcade"
],
[
"French version – «Hương et le Monde»",
"French version – «Hương et le Monde»"
],
[
"Bản lời tiếng Pháp · dùng cho tuyến Pháp ngữ của BizOn Go Global",
"French-language version · used for the Francophone track of BizOn Go Global"
],
[
"Bản thu có lời tiếng Pháp",
"Recording with French lyrics"
],
[
"Bản phối không lời",
"Instrumental arrangement"
],
[
"Game mô phỏng chính",
"Main simulation game"
],
[
"Game Hộ Chiếu Thương Hiệu",
"Brand Passport game"
],
[
"Bản đồ Go Global",
"Go Global map"
],
[
"Khu mini-game",
"Mini-game arcade"
],
[
"🎶 Âm nhạc",
"🎶 Music"
],
[
"Thẻ mô tả hệ thống",
"System card"
],
[
"🤖 Cố vấn Lumina AI",
"🤖 Lumina AI advisor"
],
[
"Trang này công bố Lumina thực sự hoạt động bằng gì, đọc dữ liệu nào và có giới hạn ra sao. Chúng tôi công bố để người dạy, người học và người phản biện kiểm chứng được – chứ không mô tả Lumina mạnh hơn thực tế.",
"This page states what Lumina actually runs on, what data it reads and where its limits are. We publish it so teachers, learners and reviewers can verify it for themselves – not to make Lumina sound stronger than it is."
],
[
"Tóm tắt trong một câu",
"In one sentence"
],
[
"nhân vật cố vấn trong trò chơi",
"an in-game advisor character"
],
[
"không phải",
"is not"
],
[
"✅ Lumina là gì – và không phải là gì",
"✅ What Lumina is – and what it is not"
],
[
"Đúng như công bố",
"Accurate as stated"
],
[
"• Đọc trạng thái ván chơi hiện tại để chọn kịch bản lời khuyên phù hợp.",
"• Reads the current game state to pick the matching advice scenario."
],
[
"• Chạy trên trình duyệt, không cần mạng sau lần tải đầu.",
"• Runs in the browser; no network needed after the first load."
],
[
"• Cùng một trạng thái ván chơi luôn cho ra cùng một lời khuyên – đây là tính chất của bộ luật tất định, kiểm chứng được bằng cách đọc mã nguồn.",
"• The same game state always yields the same advice – a property of the deterministic rule set, verifiable by reading the source."
],
[
"thấp / trung bình / cao",
"low / medium / high"
],
[
"Không phải – xin đừng hiểu nhầm",
"Not this – please do not misread it"
],
[
"Không",
"No"
],
[
"🔎 Lumina đọc gì và trả về gì",
"🔎 What Lumina reads and what it returns"
],
[
"Toàn bộ đầu vào đều là số liệu của chính ván chơi, nằm trong bộ nhớ trình duyệt.",
"Every input is data from the game session itself, held in browser storage."
],
[
"Đầu vào",
"Input"
],
[
"• Biến cố của vòng đang chơi và sắc thái của nó",
"• The current round's event and its tone"
],
[
"• Số đơn hàng bị hụt ở vòng trước",
"• Orders lost to stock-outs in the previous round"
],
[
"• Thị phần và số dư ví ảo hiện tại",
"• Current market share and virtual wallet balance"
],
[
"• Chủ đề người chơi hỏi: giá bán, marketing hoặc rủi ro",
"• The topic asked about: pricing, marketing or risk"
],
[
"• Giá tham chiếu thị trường của trò chơi",
"• The game's market reference price"
],
[
"Đầu ra",
"Output"
],
[
"• Một đoạn lời khuyên bằng tiếng Việt",
"• A passage of advice in Vietnamese"
],
[
"• Một mức rủi ro: thấp, trung bình hoặc cao",
"• A risk level: low, medium or high"
],
[
"• Gợi ý hành động cụ thể trong trò chơi (giảm giá, tăng marketing, mua vật phẩm phòng thủ…)",
"• Concrete in-game actions (cut price, raise marketing, buy a defensive item…)"
],
[
"• Với «Nếu – Thì»: dự báo thị phần và điểm hòa vốn theo thông số giả định",
"• For «What-If»: projected market share and break-even point under hypothetical settings"
],
[
"⏱️ Giới hạn lượt hỏi",
"⏱️ Consultation limits"
],
[
"Giới hạn này là dụng ý sư phạm: người học phải tự phân tích trước, hỏi cố vấn sau – chứ không hỏi thay cho suy nghĩ.",
"The limit is pedagogical by design: learners must analyse first and consult second – asking must not replace thinking."
],
[
"lượt tư vấn mỗi vòng",
"consultations per round"
],
[
"nếu mua kỹ năng «Cộng hưởng Lumina»",
"if the «Lumina Resonance» skill is bought"
],
[
"lượt mô phỏng «Nếu – Thì» mỗi vòng",
"«What-If» simulations per round"
],
[
"vòng chơi trong một ván đầy đủ",
"rounds in a full session"
],
[
"🎙️ Giọng nói của Lumina",
"🎙️ Lumina's voice"
],
[
"49 câu",
"49 lines"
],
[
"4 tệp giọng đã thu",
"4 voice files recorded"
],
[
"46 câu còn lại đã có sẵn tên tệp trong danh sách nhưng chưa thu",
"the remaining 46 lines already have filenames assigned but have not been recorded"
],
[
"🔒 Dữ liệu người học",
"🔒 Learner data"
],
[
"không có dữ liệu nào rời khỏi máy",
"no data leaves the device"
],
[
"Chơi trong lớp",
"Playing in class"
],
[
"Khi người học nhập Mã lớp, kết quả từng vòng mới được gửi lên cơ sở dữ liệu để giảng viên theo dõi và chấm.",
"Only when a learner enters a Class ID are round results sent to the database for the instructor to follow and grade."
],
[
"Không dùng để huấn luyện",
"Never used for training"
],
[
"Dữ liệu chơi không được dùng huấn luyện bất kỳ mô hình nào – hệ thống không có mô hình để huấn luyện.",
"Gameplay data is not used to train any model – the system has no model to train."
],
[
"⚠️ Hạn chế đã biết",
"⚠️ Known limitations"
],
[
"Nêu ra để người dạy biết trước khi đưa vào buổi học.",
"Stated so teachers know before bringing it into a class."
],
[
"Bộ luật còn hẹp.",
"The rule set is narrow."
],
[
"Chỉ đúng trong mô hình mô phỏng.",
"Valid only inside the simulation model."
],
[
"Chỉ có tiếng Việt trong trò chơi.",
"In-game advice is Vietnamese only."
],
[
"Chưa có nghiên cứu hiệu quả.",
"No effectiveness study yet."
],
[
"Hình ảnh nhân vật do công cụ AI tạo ảnh hỗ trợ,",
"Character artwork was produced with AI image tools,"
],
[
"🔬 Cách tự kiểm chứng",
"🔬 How to verify this yourself"
],
[
"Mọi tuyên bố ở trang này đều đọc được trực tiếp trong mã nguồn công bố:",
"Every claim on this page can be read directly in the published source:"
],
[
"Lưu ý: kho mã công bố là phần chạy trên trình duyệt. Nhóm tác giả giữ riêng một số tài liệu nội bộ và chưa công bố toàn bộ hồ sơ dự án.",
"Note: the published repository covers what runs in the browser. The authors keep some internal documents private and have not published the entire project dossier."
],
[
"Hậu trường",
"Behind the scenes"
],
[
"Ghi chép sản xuất",
"Production notes"
],
[
"🎚️ Hậu trường Kho Âm nhạc",
"🎚️ Behind the BizOn music library"
],
[
"Kho nhạc của BizOn được làm ra thế nào, ai làm phần nào, và phần nào có công cụ AI tham gia. Trang này viết ra để phục vụ hồ sơ quyền tác giả – nên chỉ ghi những gì kiểm chứng được.",
"How the BizOn music library was made, who did which part, and where AI tools were involved. This page exists to support the copyright dossier – so it records only what can be verified."
],
[
"📊 Kho nhạc tính đến hôm nay",
"📊 The library as it stands today"
],
[
"ca khúc riêng biệt",
"distinct songs"
],
[
"bản thu (gồm bản phối và remix)",
"recordings (including arrangements and remixes)"
],
[
"ngôn ngữ: Việt, Anh, Pháp",
"languages: Vietnamese, English, French"
],
[
"tuyển tập theo game",
"collections, one per game"
],
[
"🛠️ Một ca khúc đi qua những bước nào",
"🛠️ The steps a song goes through"
],
[
"Trình tự dưới đây áp dụng cho toàn bộ kho nhạc.",
"The sequence below applies to the whole library."
],
[
"1 · Ý tưởng gắn với một game cụ thể",
"1 · An idea tied to a specific game"
],
[
"Mỗi ca khúc sinh ra để phục vụ một màn chơi: «Bật Nghiệp» cho game mô phỏng chính, «Brand Passport» cho game Hộ Chiếu Thương Hiệu, «Đội Phù Sa» làm bài hát đội. Nhạc không đặt ngoài rồi lắp vào.",
"Every song is born to serve a particular level: «Bật Nghiệp» for the main simulation, «Brand Passport» for the Brand Passport game, «Đội Phù Sa» as a team anthem. The music is not commissioned elsewhere and bolted on."
],
[
"2 · Viết lời",
"2 · Writing the lyrics"
],
[
"4 · Làm nhiều bản cho nhiều tình huống lớp học",
"4 · Several versions for different class formats"
],
[
"Một buổi học 3 quý và một buổi chạy trọn 6 quý cần độ dài nhạc khác nhau, nên nhiều ca khúc có bản gọn và bản mở rộng. «Stamps Beyond Borders» có tới bốn bản, từ 3:03 tới 4:43.",
"A three-quarter class and a full six-quarter session need different music lengths, so many songs have a short and an extended version. «Stamps Beyond Borders» has four, from 3:03 to 4:43."
],
[
"5 · Chuyển ngữ cho tuyến quốc tế",
"5 · Translation for the international track"
],
[
"«Je m'appelle Hương sans frontières» có bốn bản: tiếng Việt, tiếng Anh, giọng nam và tiếng Pháp «Hương et le Monde». Đây là tuyến nhạc cho phần BizOn Go Global.",
"«Je m'appelle Hương sans frontières» exists in four versions: Vietnamese, English, a male vocal, and the French «Hương et le Monde». This is the soundtrack line for BizOn Go Global."
],
[
"6 · Sàng lọc vào tuyển tập của từng game",
"6 · Curating into each game's collection"
],
[
"🎧 Vì sao một bài lại có nhiều bản?",
"🎧 Why does one song have several versions?"
],
[
"Độ dài buổi học",
"Class length"
],
[
"Buổi 3 quý và buổi 6 quý cần nhạc dài ngắn khác nhau, không muốn nhạc lặp lại giữa chừng.",
"Three-quarter and six-quarter sessions need different lengths; we did not want the music looping mid-session."
],
[
"Ngôn ngữ lớp học",
"Class language"
],
[
"Lớp tiếng Việt, lớp quốc tế và tuyến Pháp ngữ dùng bản lời khác nhau của cùng ca khúc.",
"Vietnamese classes, international classes and the Francophone track use different lyric versions of the same song."
],
[
"Sắc thái màn chơi",
"The mood of the level"
],
[
"Màn tổng kết cần nhịp dày hơn màn mở đầu, nên có bản remix riêng cho từng thời điểm.",
"A closing level needs a denser beat than an opening one, so each moment has its own remix."
],
[
"🤖 Công cụ AI tham gia đến đâu",
"🤖 How far AI tools were involved"
],
[
"Ghi rõ để hồ sơ quyền tác giả minh bạch ngay từ đầu, tránh phải giải trình về sau.",
"Stated plainly so the copyright dossier is transparent from the start and needs no explaining later."
],
[
"Nhóm tác giả làm",
"Done by the authors"
],
[
"• Ý tưởng ca khúc và vai trò của nó trong từng game",
"• The song concept and its role in each game"
],
[
"• Viết lời tiếng Việt và các bản chuyển ngữ",
"• Writing the Vietnamese lyrics and the translated versions"
],
[
"• Quyết định thể loại, nhịp độ, sắc thái",
"• Deciding genre, tempo and mood"
],
[
"• Nghe, chọn bản, yêu cầu chỉnh sửa, duyệt bản cuối",
"• Listening, choosing takes, requesting edits, approving the final cut"
],
[
"• Sàng lọc và xếp bài vào tuyển tập của từng game",
"• Curating and assigning songs to each game's collection"
],
[
"Công cụ AI hỗ trợ",
"Assisted by AI tools"
],
[
"• Dựng phần hòa âm từ lời và ý đồ âm nhạc đã có",
"• Building the arrangement from the existing lyrics and musical intent"
],
[
"• Tổng hợp giọng hát cho các bản thu",
"• Synthesising the vocals for the recordings"
],
[
"• Tạo các bản phối lại từ bản gốc",
"• Generating remixes from the original"
],
[
"• Tổng hợp giọng nói tiếng Việt cho cố vấn Lumina",
"• Synthesising the Vietnamese speaking voice for advisor Lumina"
],
[
"phần sáng tác là của nhóm tác giả, phần dựng âm thanh có máy tham gia.",
"the composition belongs to the authors; the audio production had machine involvement."
],
[
"📝 Phần còn dở",
"📝 Still unfinished"
],
[
"«Bật Nghiệp» mới có bản instrumental.",
"«Bật Nghiệp» exists only as an instrumental."
],
[
"trang tuyển dụng",
"the recruitment page"
],
[
"46 câu thoại của Lumina chưa thu.",
"46 of Lumina's lines are unrecorded."
],
[
"Chưa nêu tên công cụ sản xuất cụ thể.",
"The specific production tools are not yet named."
],
[
"Chưa đăng ký quyền tác giả cho các bản thu.",
"The recordings are not yet registered for copyright."
],
[
"© Quyền tác giả",
"© Copyright"
],
[
"Đỗ Thùy Hương và Phan Anh Tú",
"Đỗ Thùy Hương and Phan Anh Tú"
],
[
"🤖 Thẻ mô tả Lumina",
"🤖 Lumina system card"
],
[
"🎶 Kho Âm nhạc",
"🎶 Music library"
],
[
"Hậu trường sản xuất nhạc",
"Music production notes"
],
[
"Thẻ mô tả Lumina AI",
"Lumina AI system card"
],
[
"Đơn vị sản xuất",
"Produced by"
],
[
"Tất cả",
"All"
],
[
"tác phẩm mỹ thuật",
"artworks"
],
[
"bản thu",
"recordings"
],
[
"nhóm",
"groups"
],
[
"Lumina AI – Chắp tay cảm ơn",
"Lumina AI – Hands together in thanks"
],
[
"Áo dài trắng, tai nghe · dáng chào và cảm ơn cuối buổi chơi",
"White áo dài with headphones · the greeting and thank-you at the end of a session"
],
[
"Lumina AI – Có ý tưởng",
"Lumina AI – An idea strikes"
],
[
"Giơ ngón trỏ, tia sáng vàng · khoảnh khắc gợi ý chiến lược",
"Index finger raised, golden sparkles · the moment a strategy is suggested"
],
[
"Lumina AI – Vỗ tay chúc mừng",
"Lumina AI – Applause"
],
[
"Kim tuyến và sao vàng rơi quanh · đội chơi hoàn thành mục tiêu",
"Confetti and gold stars falling · the team hits its target"
],
[
"Lumina AI – Báo biến cố thị trường",
"Lumina AI – Market event alert"
],
[
"Bảng hologram biểu đồ giá · khoảnh khắc thị trường biến động bất ngờ",
"Holographic price chart · the moment the market moves unexpectedly"
],
[
"Lumina AI – Nghe nhạc (váy)",
"Lumina AI – Listening (dress)"
],
[
"Tạo hình Hậu trường sản xuất · trang phục thường, khuông nhạc cuộn quanh",
"Production-notes artwork · everyday outfit, a stave curling around her"
],
[
"Lumina AI – Nghe nhạc (vest)",
"Lumina AI – Listening (suit)"
],
[
"Tạo hình Thẻ mô tả hệ thống · trang phục công sở, khuông nhạc cuộn quanh",
"System-card artwork · office outfit, a stave curling around her"
],
[
"Lumina AI – Nghe nhạc (đứng)",
"Lumina AI – Listening (standing)"
],
[
"Tạo hình Kho Âm nhạc · áo dài trắng, tai nghe và nốt nhạc bay",
"Music-library artwork · white áo dài, headphones and floating notes"
],
[
"Lumina AI – Nghe nhạc (ngồi)",
"Lumina AI – Listening (seated)"
],
[
"Tạo hình Kho Âm nhạc · ngồi ghế đất sét, cánh hoa rơi quanh",
"Music-library artwork · seated on a clay bench, petals drifting past"
],
[
"🏭 Quy trình sản xuất tại BizOn",
"🏭 The production process at BizOn"
],
[
"Toàn bộ kho nhạc được làm trong nội bộ BizOn, không thuê đơn vị bên ngoài.",
"The entire music library is made in-house at BizOn, with no outside contractor."
],
[
"Sáng tác",
"Composition"
],
[
"Dựng bản thu và biên tập",
"Recording and editing"
],
[
"• Dựng hòa âm và giọng hát theo lời và ý đồ âm nhạc đã có",
"• Building the arrangement and vocals from the existing lyrics and musical intent"
],
[
"• Làm các bản phối lại từ bản gốc",
"• Making remixes from the original"
],
[
"• Nghe, chọn bản, chỉnh sửa, duyệt bản cuối",
"• Listening, choosing takes, editing, approving the final cut"
],
[
"Nhóm tác giả giữ quyền quyết định ở mọi khâu, từ ý tưởng ca khúc tới bản thu cuối cùng.",
"The authors hold decision rights at every stage, from the song concept to the final recording."
],
[
"3 · Hòa âm và dựng bản thu",
"3 · Arrangement and recording"
],
[
"Phần hòa âm và giọng hát được dựng từ lời và ý đồ âm nhạc đã định. Nhóm tác giả nghe, chọn bản, chỉnh sửa và lặp lại cho tới khi đạt.",
"Arrangement and vocals are built from the settled lyrics and musical intent. The authors listen, choose takes, edit and iterate until it is right."
],
[
"Kho nhạc của BizOn được làm ra thế nào và đi qua những bước nào. Trang này viết ra để phục vụ hồ sơ quyền tác giả – nên chỉ ghi những gì kiểm chứng được.",
"How the BizOn music library was made and the steps it goes through. This page exists to support the copyright dossier – so it records only what can be verified."
],
[
"Nhạc và lời do nhóm tác giả sáng tác, sản xuất tại BizOn. Toàn bộ bản thu thuộc quyền của nhóm tác giả và chỉ dùng cho mục đích giáo dục, nghiên cứu.",
"Music and lyrics written by the authors, produced at BizOn. All recordings belong to the authors and are used for educational and research purposes only."
],
[
"Lumina giới thiệu thư viện",
"Lumina introducing the library"
],
[
"Giai điệu BizOn",
"BizOn Melodies"
],
[
"Thuyền rời bến Vàm Thịnh",
"Setting out from Vàm Thịnh wharf"
],
[
"Phù điêu đất sét · dòng sông sen lúc bình minh – ảnh chủ đạo game Hộ Chiếu Thương Hiệu",
"Clay relief · a lotus river at dawn – the hero image of the Brand Passport game"
],
[
"«Hộ Chiếu Thương Hiệu» – tổ khúc tiếng Việt",
"«Brand Passport» – Vietnamese song cycle"
],
[
"Tổ khúc ba phần bằng tiếng Việt kể trọn hành trình của game – hiện đã thu hai phần đầu",
"A three-part Vietnamese song cycle telling the game's whole journey – the first two parts are recorded"
],
[
"Phần I – «Từ dòng Mekong»",
"Part I – «From the Mekong»"
],
[
"Phần mở đầu tổ khúc · 3:56 · khởi hành từ bến sông quê",
"Opening movement · 3:56 · setting out from the home wharf"
],
[
"Phần II – «Qua Những Thị Trường»",
"Part II – «Across the Markets»"
],
[
"Phần giữa tổ khúc · 4:03 · sáu quý băng qua các thị trường xa",
"Middle movement · 4:03 · six quarters crossing distant markets"
],
[
"Tổ khúc tiếng Việt của Hộ Chiếu Thương Hiệu mới có hai trong ba phần.",
"The Brand Passport Vietnamese song cycle has only two of its three parts."
],
[
"Phần III – «Việt Nam ra thế giới»",
"Part III – «Vietnam Reaches the World»"
],
[
"Phần kết tổ khúc · 5:09 · thương hiệu Việt đứng được trên bản đồ thế giới",
"Closing movement · 5:09 · a Vietnamese brand earns its place on the world map"
],
[
"Tổ khúc ba phần bằng tiếng Việt kể trọn hành trình của game – từ bến sông quê ra tới thế giới",
"A three-part Vietnamese song cycle telling the game's whole journey – from the home wharf out to the world"
],
[
"Phần giữa tổ khúc · 4:18 · sáu quý băng qua các thị trường xa",
"Middle movement · 4:18 · six quarters crossing distant markets"
],
[
"Phần III – bản remix",
"Part III – remix"
],
[
"Bản phối lại phần kết · 5:22 · nhịp dày hơn cho màn tổng kết ván chơi",
"A remix of the closing movement · 5:22 · a denser beat for the end-of-session wrap-up"
],
[
"Phần III – bản remix 2",
"Part III – remix 2"
],
[
"Bản phối thứ hai của phần kết · 5:21 · hòa âm khác",
"A second remix of the closing movement · 5:21 · a different arrangement"
],
[
"«Hộ Chiếu Thương Hiệu» – tổ khúc ba phần",
"«Brand Passport» – a song cycle in three parts"
],
[
"Tổ khúc kể trọn hành trình của game – từ bến sông quê ra tới thế giới · lời tiếng Việt, phần kết có thêm bản tiếng Anh",
"A song cycle telling the game's whole journey – from the home wharf out to the world · Vietnamese lyrics, with an English version of the closing part"
],
[
"Phần III – «Vietnam to the World» (lời tiếng Anh)",
"Part III – «Vietnam to the World» (English lyrics)"
],
[
"Bản lời tiếng Anh của phần kết · 5:20 · dùng cho lớp quốc tế",
"English-language version of the closing movement · 5:20 · for international classes"
],
[
"Phần III tiếng Anh – bản remix",
"Part III English – remix"
],
[
"Bản phối lại của phần kết tiếng Anh · 4:42 · gọn hơn bản gốc, hợp màn tổng kết",
"A remix of the English closing movement · 4:42 · tighter than the original, suited to the wrap-up"
],
[
"🎮 Trò chơi · Games",
"🎮 Games"
],
[
"🎨 Kho sáng tạo · Creative",
"🎨 Creative library"
],
[
"🎓 Giảng dạy · Educators",
"🎓 Educators & research"
],
[
"🏛️ Về BizOn · About",
"🏛️ About BizOn"
],
[
"Game Bật Nghiệp",
"Bật Nghiệp game"
],
[
"Phiếu khảo sát (bản in A4)",
"Survey form (A4 print)"
],
[
"Làm mới ứng dụng",
"Refresh the app"
],
[
"🧭 Bắt đầu từ đâu?",
"🧭 Where do I start?"
],
[
"Học cách điều hành một doanh nghiệp. Sáu vòng trên bản đồ Việt Nam, năm vai trò lãnh đạo, ba đối thủ máy.",
"Learn how to run a business. Six rounds across a map of Vietnam, five leadership roles, three AI rivals."
],
[
"Bắt đầu ở đây →",
"Start here →"
],
[
"Học cách đưa doanh nghiệp ra nước ngoài. Sáu thị trường, sáu quý, quyết định trong sương mù thông tin.",
"Learn how to take it abroad. Six markets, six quarters, decisions made in an information fog."
],
[
"Chơi bản chiến lược →",
"Play the strategy game →"
],
[
"Thử nghiệm lý thuyết quốc tế hóa bằng số liệu mô phỏng: kéo mức FSTS, đổi năng lực số, xem đường cong phản ứng. Nằm trên trang BizOn Go Global.",
"Explore internationalization theory with simulated data: drag the FSTS level, change digital capability, watch the response curves. Lives on the BizOn Go Global page."
],
[
"Vào phòng thí nghiệm →",
"Enter the lab →"
],
[
"Luyện nhanh từng kỹ năng riêng lẻ: mini-game phản xạ, bài toán thăm dò – khai thác, đọc số liệu.",
"Practise one specific skill fast: reflex mini-games, the explore–exploit problem, reading the numbers."
],
[
"Xem tất cả trò chơi →",
"See every game →"
],
[
"🛂 Hoặc đưa thương hiệu Việt ra thế giới – Hộ Chiếu Thương Hiệu",
"🛂 Or take a Vietnamese brand to the world – Brand Passport"
],
[
"6 thị trường · sương mù thông tin",
"6 markets · information fog"
],
[
"BizOn Lab · IE Lab – phòng thí nghiệm quốc tế hóa",
"BizOn Lab · IE Lab – the internationalization sandbox"
],
[
"Sáu vòng, sáu vùng kinh tế. Thắng thị phần vòng nào thì cắm cờ doanh nghiệp lên vùng đó – từ Cần Thơ ngược ra Hà Nội. Đây đúng là tấm bản đồ hiện trong ván chơi.",
"Six rounds, six economic regions. Win market share in a round and you plant your company flag on that region – from Cần Thơ north to Hà Nội. This is the very map that appears in the game."
],
[
"Đồng bằng sông Cửu Long",
"Mekong Delta"
],
[
"Đông Nam Bộ",
"Southeast region"
],
[
"Duyên hải Nam Trung Bộ",
"South Central Coast"
],
[
"Duyên hải miền Trung",
"Central Coast"
],
[
"Bắc Trung Bộ",
"North Central Coast"
],
[
"Đồng bằng sông Hồng",
"Red River Delta"
],
[
"Quần đảo Hoàng Sa và Trường Sa thuộc chủ quyền Việt Nam. Cột cờ Lũng Cú (Hà Giang) là điểm cực Bắc.",
"The Hoàng Sa and Trường Sa archipelagos are Vietnamese sovereign territory. The Lũng Cú flag tower (Hà Giang) marks the northernmost point."
],
[
"🎮 Vào chơi sáu vòng →",
"🎮 Play the six rounds →"
],
[
"Miền Bắc",
"Northern Vietnam"
],
[
"Miền Trung",
"Central Vietnam"
],
[
"Tây Nguyên",
"Central Highlands"
],
[
"Nam Bộ",
"Southern Vietnam"
],
[
"Hoàng Sa",
"Hoàng Sa"
],
[
"Trường Sa",
"Trường Sa"
],
[
"Bản đồ đất sét ba chiều của Việt Nam chia theo vùng kinh tế, kèm hai quần đảo Hoàng Sa và Trường Sa ngoài khơi.",
"Three-dimensional clay map of Vietnam divided by economic region, with the Hoàng Sa and Trường Sa archipelagos offshore."
],
[
"«Việt Nam Trong Tim»",
"«Việt Nam Trong Tim» (Vietnam in My Heart)"
],
[
"Ca khúc tiếng Việt mới của kho nhạc BizOn",
"A new Vietnamese-language song in the BizOn music library"
],
[
"Bản thu có lời · 2:36",
"Vocal recording · 2:36"
],
[
"Phần I – bản remix",
"Part I – remix"
],
[
"Bản phối lại phần mở đầu · 3:51 · gọn hơn bản gốc",
"Remix of the opening part · 3:51 · tighter than the original"
],
[
"Phần I – bản remix 2",
"Part I – remix 2"
],
[
"Bản phối thứ hai của phần mở đầu · 4:07",
"Second remix of the opening part · 4:07"
],
[
"Phần I – bản remix 3",
"Part I – remix 3"
],
[
"Bản phối thứ ba của phần mở đầu · 4:18 · bản dài nhất",
"Third remix of the opening part · 4:18 · the longest cut"
],
[
"Phần II – bản remix",
"Part II – remix"
],
[
"Bản phối lại phần giữa · 4:04",
"Remix of the middle part · 4:04"
],
[
"Phần III – bản remix 3",
"Part III – remix 3"
],
[
"Bản phối thứ ba của phần kết · 5:02",
"Third remix of the closing part · 5:02"
],
[
"Bản remix 3",
"Remix 3"
],
[
"Bản phối thứ ba dài 4:15 · bản dài nhất của ca khúc",
"Third remix, 4:15 · the longest cut of the song"
],
[
"Phần III tiếng Anh – bản remix 2 ⭐",
"Part III in English – remix 2 ⭐"
],
[
"Bản phối thứ hai của phần kết tiếng Anh · 5:33 · nhạc nền mặc định trong game Hộ Chiếu Thương Hiệu",
"Second remix of the English closing part · 5:33 · default in-game music for Brand Passport"
],
[
"«Brand Passport» – bản gốc",
"«Brand Passport» – original"
],
[
"Ca khúc mang đúng tên game · 2:52",
"The song that shares the game's name · 2:52"
],
[
"🎵 Bật nhạc chủ đề",
"🎵 Play the theme music"
],
[
"⏸️ Tạm dừng nhạc chủ đề",
"⏸️ Pause the theme music"
],
[
"Bản thu có lời ⭐",
"Vocal recording ⭐"
],
[
"Ca khúc chủ đề game Bật Nghiệp · 3:23 · nhạc nền mở đầu trong game",
"Theme song of the Bật Nghiệp game · 3:23 · the opening music in-game"
],
[
"Bản instrumental",
"Instrumental version"
],
[
"Bản phối không lời · 1:20 · dùng xen giữa các vòng",
"Instrumental cut · 1:20 · played between rounds"
],
[
"Ca khúc chủ đề game Việt Nam · bản thu có lời",
"Theme song of the Vietnam game · vocal recording"
],
]);
  var SPECIAL = [
    { page: 'giai-phap', sel: '#gp-oss-note', en: "Free to use at the official URL for non-commercial teaching – no account needed. The source is published for academic transparency and verification; commercial exploitation rights remain with BizOn (see <a href=\"https://github.com/thuyhuongctu/BizOn/blob/main/LICENSE\" target=\"_blank\" rel=\"noopener\" class=\"underline font-bold\">LICENSE</a>)." },
    { page: 'food-truck', sel: 'header p.text-sm', en: "You are the founder of a street-food startup in <b>Bến Phù Sa</b> – a fictional river town inspired by Vietnam's Mekong Delta. Each week, pick <b>Method – Product – Location</b>. Goal: the highest total revenue after 5 weeks. The secret is to <b>test fast, then scale at the right moment</b>." },
    { page: 'food-truck', sel: '#ft-intro ul li:nth-child(1)', en: "🛵 <b>Mobile vending cart</b>: revenue <b>×3</b> – but product &amp; location are locked for the whole week. For when you already <i>know</i> the winning formula." },
    { page: 'food-truck', sel: '#ft-intro ul li:nth-child(2)', en: "🧺 <b>Street hawking</b>: ~1/3 the revenue – but you weave through every market lane and pick up <b>lots of market intel</b>. The experimenter's weapon." },
    { page: 'food-truck', sel: '#ft-intro ul li:nth-child(3)', en: "📋 <b>Market survey</b>: spend a full week not selling and receive <b>historical data</b> (directionally right, possibly outdated)." },
    { page: 'food-truck', sel: '#ft-intro ul li:nth-child(4)', en: "🎯 True demand for each <b>Product × Location</b> pair is hidden – different every game. Weekly observation is your best clue." },
    { page: 'food-truck', sel: '#ft-intro ul li:nth-child(5)', en: "🧾 Each product runs a different operating model: 🥖 <b>bánh mì</b> serves fast (extra upside in peak weeks) · 🍧 <b>sweet soup</b> needs careful storage (occasional spoilage) · ☕ <b>phin coffee</b> has high margins but brews slowly." },
    { page: 'food-truck', sel: '#ft-intro ul li:nth-child(6)', en: "⚔️ <b>3 AI rivals</b> – Alpha Dynamics 🐺, Mekong Ventures 🐘, Star Clay Co. 🦚 – also trade all over Bến Phù Sa. Share a location and you <b>split the customers</b>!" },
    { page: 'food-truck', sel: '#ft-end ol li:nth-child(3)', en: "How did you balance <b>learning</b> (street hawking) and <b>scaling</b> (mobile vending cart)?" },
    { page: 'food-truck', sel: '#ft-end ol + p', en: "💡 Core lesson: <b>test cheap and fast first</b> (prototype by street hawking); only when the signal is clear do you <b>bet big</b> (mobile vending cart). Historical data is directional – direct observation is gold." },
    { page: 'food-truck', sel: '#ft-end ol + p + p', en: "📰 True story: Croatian founder <b>Matko Kmezic</b> runs the «Viet Drip» phin-coffee cart with low plastic stools, Vietnamese-sidewalk style, in Amsterdam – selling just 3–4 cups a day at first, patiently explaining robusta to every customer, until people started queueing. Exactly this game's lesson: test small, learn fast, scale at the right time. <a href=\"https://znews.vn/xe-ca-phe-phin-ghe-nhua-do-kieu-viet-o-ha-lan-post1672015.html\" target=\"_blank\" rel=\"noopener\" class=\"underline font-bold\">Znews, Jul 26, 2026 →</a>" },
    { page: 'giang-vien', sel: 'header p.max-w-2xl', en: "Watch teams submit results <b>live during class</b>: the leaderboard refreshes every 10 seconds, a timeline logs every locked round, and CSV export makes grading easy. Data opens only with the <b>Instructor key</b> – students cannot see each other's data." },
    { page: 'khao-sat-online', sel: 'header .max-w-3xl p', en: "An <b>anonymous</b> survey used only to improve the game and for educational research. There are no answers that earn grades – please answer honestly based on what you know right now." },
    { sel: '#top h1', en: "Build your<br><span class=\"hero-grad\">business</span> empire" },
    { sel: '#top .max-w-6xl > div > p.mt-5', en: "Run your company through <b class=\"text-white\">6 fierce market rounds</b> – pricing, production, marketing, fundraising – outsmarting 3 AI rivals with advisor <b class=\"lumina-name font-display\">Lumina AI</b> <span class=\"signature text-lg text-white\">Je m'appelle Hương</span> at your side. All inside a one-of-a-kind 3D clay world." }
  ];

  function langBtnSync(lang) {
    var b = document.getElementById('lang-btn');
    var want = lang === 'en' ? 'VI' : 'EN';
    if (b && b.textContent !== want) b.textContent = want;
    var c = document.getElementById('lang-toggle-check');
    if (c) c.checked = lang === 'en';
  }

  window.applyLang = function (lang) {
    document.querySelectorAll('h1,h2,h3,h4,p,a,button,span,b,label,th,td,li,small,summary').forEach(function (el) {
      if (el.childElementCount) return;
      var vi = el.dataset.vi || el.textContent.trim();
      if (!EN.has(vi)) return;
      el.dataset.vi = vi;
      var want = lang === 'en' ? EN.get(vi) : vi;
      if (el.textContent !== want) el.textContent = want;
    });
    SPECIAL.forEach(function (s) {
      if (s.page && location.pathname.indexOf(s.page) === -1) return;
      var el = document.querySelector(s.sel);
      if (!el) return;
      if (!el.dataset.viHtml) el.dataset.viHtml = el.innerHTML;
      var html = lang === 'en' ? s.en : el.dataset.viHtml;
      if (el.innerHTML !== html) el.innerHTML = html;
    });
    document.documentElement.lang = lang === 'en' ? 'en' : 'vi';
    langBtnSync(lang);
    try { localStorage.setItem('bizon-lang', lang); } catch (e) {}
  };
  window.toggleLang = function () {
    var next = 'en';
    try { next = localStorage.getItem('bizon-lang') === 'en' ? 'vi' : 'en'; } catch (e) {}
    window.applyLang(next);
  };

  var obsTimer = null;
  function watchRerenders() {
    new MutationObserver(function () {
      var lang = 'vi';
      try { lang = localStorage.getItem('bizon-lang') || 'vi'; } catch (e) {}
      if (lang !== 'en') return;
      clearTimeout(obsTimer);
      obsTimer = setTimeout(function () {
        // Đọc lại lựa chọn tại thời điểm chạy: người dùng có thể vừa bấm về VI trong lúc chờ
        var now = 'vi';
        try { now = localStorage.getItem('bizon-lang') || 'vi'; } catch (e) {}
        if (now === 'en') window.applyLang('en');
      }, 150);
    }).observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    themeBtnSync();
    var lang = 'vi';
    try { lang = localStorage.getItem('bizon-lang') || 'vi'; } catch (e) {}
    if (lang === 'en') window.applyLang('en'); else langBtnSync('vi');
    watchRerenders();
  });
})();

/* ===== Service worker toàn site: đăng ký + kiểm tra bản mới bỏ qua HTTP cache
 * + tự tải lại trang một lần khi phiên bản mới tiếp quản (mọi trang, không riêng game) ===== */
(function () {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
      .then(function (reg) { if (reg && reg.update) reg.update(); })
      .catch(function () {});
  });
  var hadController = !!navigator.serviceWorker.controller;
  var swReloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!hadController || swReloaded) return;
    swReloaded = true;
    location.reload();
  });
})();

/* Accessibility toàn site (WCAG 2.2): tôn trọng prefers-reduced-motion + trạng thái focus rõ ràng */
(function () {
  var st = document.createElement('style');
  st.textContent =
    '@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}}' +
    ':focus-visible{outline:3px solid #fda127 !important;outline-offset:2px !important}';
  document.head.appendChild(st);
})();
