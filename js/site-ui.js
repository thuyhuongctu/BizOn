/* BizOn Bật Nghiệp — giao diện web: chế độ Sáng/Tối + song ngữ Việt/Anh
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
"Độ co giãn giá, thị phần, biến cố Cơ Hội Vàng · Price War · Khủng hoảng năng lượng — mỗi vòng là một ván cờ mới với 3 đối thủ AI.",
"Price elasticity, market share, Golden Opportunity · Price War · energy-crisis events — every round is a fresh chess match against 3 AI rivals."
],
[
"Cố vấn AI Lumina",
"Lumina AI advisor"
],
[
"Trò chuyện bằng giọng nói tiếng Việt, mô phỏng \"Nếu — Thì\" trước khi chốt, bộ não cố vấn riêng cho CEO · CFO · COO · CMO.",
"Vietnamese voice chat, \"What-If\" simulations before you commit, and a dedicated advisor brain for CEO · CFO · COO · CMO."
],
[
"7 báo cáo chuẩn giáo trình",
"7 textbook-grade reports"
],
[
"P&L, dòng tiền 3 hoạt động, CVP hòa vốn, nhân sự, BMC, khấu hao, kiểm toán năng lượng — số liệu sống từ chính quyết định của bạn.",
"P&L, 3-activity cash flow, CVP break-even, HR, BMC, depreciation, energy audit — living numbers driven by your own decisions."
],
[
"Tài chính C-Suite",
"C-Suite finance"
],
[
"Gọi vốn chủ sở hữu hay vay ngân hàng, kỳ hạn thanh toán 30/60/90 ngày, chế độ khủng hoảng thanh khoản CFO — như phòng họp HĐQT thật.",
"Raise equity or take bank loans, 30/60/90-day payment terms, CFO liquidity-crisis mode — just like a real boardroom."
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
"Phân tích Nếu — Thì, cảnh báo rủi ro, đồng hành cùng cả 4 vai trò C-Suite.",
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
"Kéo 3 thanh quyết định — thị trường phản ứng ngay lập tức, đúng công thức của game thật.",
"Drag 3 decision sliders — the market reacts instantly, using the real game's formula."
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
"Không cần đăng nhập — thử tố chất CEO của bạn trong 60 giây.",
"No sign-in needed — test your CEO instincts in 60 seconds."
],
[
"Trắc nghiệm Khởi nghiệp",
"Startup Quiz"
],
[
"8 câu hỏi về tài chính & chiến lược — kiểm tra tố chất CEO của bạn.",
"8 questions on finance & strategy — test your CEO instincts."
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
"Hóa thân thành cố vấn AI Lumina trong game — áo dài truyền thống & vest trắng hiện đại.",
"Embodied in-game as the AI advisor Lumina — traditional áo dài & modern white vest."
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
"Build your team, pick a role — CEO · CFO · COO · CMO — and conquer the #1 market share of Vietnam 2026."
],
[
"🚀 VÀO GAME NGAY — MIỄN PHÍ",
"🚀 PLAY NOW — FREE"
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
"Xin chào! Mình là Hương — hướng dẫn viên AI của BizOn Bật Nghiệp. Để mình dẫn bạn tham quan trò chơi nhé?",
"Hi! I'm Hương — BizOn Bật Nghiệp's AI tour guide. Shall I show you around?"
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
"6 trò chơi của hệ sinh thái BizOn Bật Nghiệp — từ mô phỏng chiến lược 6 vòng đến các game phản xạ 30 giây. Chọn và chơi ngay!",
"The BizOn Bật Nghiệp game ecosystem — from the 6-round strategy sim to 30-second reflex games. Pick one and play!"
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
"Kéo 3 thanh quyết định, xem thị trường phản ứng tức thì — hiểu luật chơi trong 60 giây.",
"Drag 3 decision sliders and watch the market react instantly — learn the rules in 60 seconds."
],
[
"PHẢN XẠ 30s",
"30s REFLEX"
],
[
"Băng chuyền xưởng đất sét — chạm đúng món hàng được đặt để đóng gói. Trong game chính, điểm đổi được quà ở Clay Reward Shop!",
"A clay-factory conveyor — tap the ordered items to pack them. In the main game, points buy gifts at the Clay Reward Shop!"
],
[
"KIẾN THỨC",
"KNOWLEDGE"
],
[
"8 câu về hòa vốn, thanh khoản, Price War, đòn bẩy — kiểm tra tố chất CEO.",
"8 questions on break-even, liquidity, price wars and leverage — test your CEO instincts."
],
[
"TƯ DUY",
"THINKING"
],
[
"Thị trường đã chốt giá cân bằng 50–250 nghìn ₫ — bạn có 7 lượt tìm ra nó.",
"The market locked an equilibrium price between 50–250k ₫ — you get 7 tries to find it."
],
[
"Clay Sort — Phân loại",
"Clay Sort — Sorting"
],
[
"Băng chuyền thả hình đất nặn — chạm đúng thùng (Hộp / Cầu / Tháp) trước khi hàng rơi xuống. Chuỗi đúng liên tiếp nhân điểm!",
"Clay shapes drop from the belt — tap the right bin (Box / Ball / Tower) before they fall. Streaks multiply your score!"
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
"Đối đầu CEO AI qua 3 hiệp: mỗi hiệp chọn 1 chiến lược giá — kết thúc bằng màn so tài chỉ số Head-to-Head.",
"Face an AI CEO over 3 rounds: pick a pricing strategy each round — ending in a head-to-head stat showdown."
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
"© 2026 Đỗ Thùy Hương & Phan Anh Tú · BizOn Bật Nghiệp — Bảo lưu mọi quyền.",
"© 2026 Đỗ Thùy Hương & Phan Anh Tú · BizOn Bật Nghiệp — All rights reserved."
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
"Đã khóa — chờ kết quả",
"Locked — awaiting results"
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
"Thắng mỗi vòng để cắm cờ công ty — từ Cần Thơ tới Thủ đô Hà Nội.",
"Win each round to plant your company flag — from Cần Thơ to Hà Nội."
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
"🗺️ Bước 1 — Chọn thị trường quốc tế",
"🗺️ Step 1 — Pick an international market"
],
[
"Xuất phát từ Việt Nam — chạm vào một điểm đến trên bản đồ thế giới.",
"Starting from Vietnam — tap a destination on the world map."
],
[
"🛂 Bước 2 — Chọn phương thức thâm nhập (Entry mode)",
"🛂 Step 2 — Choose your entry mode"
],
[
"📊 Bước 3 — Kinh doanh trong kỷ nguyên số",
"📊 Step 3 — Do business in the digital era"
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
"Đầu tư mới — Greenfield (FDI)",
"Greenfield FDI"
],
[
"Vốn thấp, triển khai nhanh — nhưng chịu thuế quan và kiểm soát kênh phân phối thấp. Phù hợp thăm dò thị trường.",
"Low capital, fast to launch — but exposed to tariffs with little channel control. Good for testing a market."
],
[
"Đối tác bản địa sản xuất, ta thu phí bản quyền — rủi ro vốn thấp nhất nhưng lợi nhuận mỏng và có rủi ro thương hiệu.",
"A local partner produces while you collect royalties — lowest capital risk, but thin margins and brand risk."
],
[
"Chia vốn, chia lợi nhuận với đối tác am hiểu bản địa — giảm mạnh khoảng cách văn hóa và rào cản pháp lý.",
"Share capital and profit with a local partner — sharply reduces cultural distance and legal barriers."
],
[
"Xây nhà máy/công ty con 100% vốn — kiểm soát tối đa, né thuế quan, nhưng vốn lớn và rủi ro cao nhất.",
"Build a wholly-owned plant/subsidiary — maximum control, tariff-free, but the biggest capital and risk."
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
"⭐ BizOn — mã nguồn",
"⭐ BizOn — source code"
],
[
"🎼 M-AIDA — mã nguồn",
"🎼 M-AIDA — source code"
],
[
"🌏 BizOn Global (thử nghiệm)",
"🌏 BizOn Global (beta)"
],
[
"🌏 BizOn Global (thử nghiệm quốc tế)",
"🌏 BizOn Global (international beta)"
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
"🎓 I–P Lab — Quốc tế hóa & Hiệu quả doanh nghiệp",
"🎓 I–P Lab — Internationalization & Firm Performance"
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
"Tổng giám đốc điều hành — người cầm lái chiến lược.",
"Chief Executive Officer — the one steering strategy."
],
[
"Giám đốc tài chính — quản trị dòng tiền & lợi nhuận.",
"Chief Financial Officer — managing cash flow & profit."
],
[
"Giám đốc marketing — chiếm lĩnh thị phần.",
"Chief Marketing Officer — capturing market share."
],
[
"Giám đốc vận hành — tối ưu hóa quy trình.",
"Chief Operating Officer — optimizing processes."
],
[
"Thư ký hội đồng — quản lý thông tin & rủi ro.",
"Board Secretary — managing information & risk."
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
"Lumina phân tích số liệu mô phỏng của đội bạn theo thời gian thực — đề xuất kịch bản tối ưu và cảnh báo rủi ro sớm để bạn dẫn đầu thị trường.",
"Lumina analyzes your team's simulation data in real time — proposing optimal scenarios and early risk alerts so you stay ahead of the market."
],
[
"Dành cho giảng viên & doanh nghiệp",
"For instructors & businesses"
],
[
"Mang BizOn vào lớp học hoặc chương trình đào tạo: Class ID cho từng lớp, chế độ Giảng viên (khóa vòng, cấp vốn thưởng, nhật ký), hành vi đối thủ AI tất định — kết quả tái lập được, tiện chấm điểm giữa các đội.",
"Bring BizOn to your classroom or training program: per-class Class IDs, an Instructor mode (round locks, bonus funding, logs), and deterministic AI rivals — reproducible results, easy to grade across teams."
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
"Kiến trúc sư chính của BizOn — hóa thân thành cố vấn AI Lumina, tập trung vào trải nghiệm người dùng và thẩm mỹ Claymorphism hiện đại.",
"BizOn's lead architect — embodied as the Lumina AI advisor, focused on user experience and modern claymorphism aesthetics."
],
[
"Cố vấn học thuật cao cấp — đảm bảo tính thực tiễn và chiều sâu kiến thức kinh doanh trong mọi kịch bản mô phỏng.",
"Senior academic advisor — ensuring practical rigor and business depth in every simulation scenario."
]
]);
  var SPECIAL = [
    { sel: '#top h1', en: "Build your<br><span class=\"hero-grad\">business</span> empire" },
    { sel: '#top .max-w-6xl > div > p.mt-5', en: "Run your company through <b class=\"text-white\">6 fierce market rounds</b> — pricing, production, marketing, fundraising — outsmarting 3 AI rivals with advisor <b class=\"lumina-name font-display\">Lumina AI</b> <span class=\"signature text-lg text-white\">Je m'appelle Hương</span> at your side. All inside a one-of-a-kind 3D clay world." }
  ];

  function langBtnSync(lang) {
    var b = document.getElementById('lang-btn');
    if (b) b.textContent = lang === 'en' ? 'VI' : 'EN';
    var c = document.getElementById('lang-toggle-check');
    if (c) c.checked = lang === 'en';
  }

  window.applyLang = function (lang) {
    document.querySelectorAll('h1,h2,h3,h4,p,a,button,span,b').forEach(function (el) {
      if (el.childElementCount) return;
      var vi = el.dataset.vi || el.textContent.trim();
      if (!EN.has(vi)) return;
      el.dataset.vi = vi;
      var want = lang === 'en' ? EN.get(vi) : vi;
      if (el.textContent !== want) el.textContent = want;
    });
    SPECIAL.forEach(function (s) {
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
      obsTimer = setTimeout(function () { window.applyLang('en'); }, 150);
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
