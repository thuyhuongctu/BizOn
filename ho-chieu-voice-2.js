/* Phần 2 kịch bản thoại: phương thức, biến cố, Kim Long, chế độ thi, kết thúc */
(function () {
  var G = window.__HC_VOICE.groups;
  G.push({ title: '4.4 Lễ đóng dấu – vào thị trường (Lina Park)', rows: [
    ['HC_LP_10', 'Thị trường đã mở cửa. Gian hàng trực tuyến chạy rồi – vào nhanh, lời mỏng, nhớ theo dõi đánh giá.', 'The market is open. Your online store is live – fast entry, thin margins, keep an eye on reviews.', 1],
    ['HC_LP_11', 'Container đầu tiên đã rời cảng. Xuất khẩu trực tiếp: mình tự kiểm soát giá và kênh.', 'The first container has left port. Direct export: we control price and channel ourselves.', 1],
    ['HC_LP_12', 'Bắt tay xong với đối tác địa phương. Mạng lưới của họ, sản phẩm của mình.', 'Deal done with a local partner. Their network, our product.', 1],
    ['HC_LP_13', 'Hợp đồng cấp phép đã ký. Tốn ít vốn, nhưng thương hiệu nằm trong tay đối tác – phải kiểm tra chất lượng thường xuyên.', 'The licensing deal is signed. Little capital needed, but our brand is in the partner’s hands – check quality often.', 1],
    ['HC_LP_14', 'Liên doanh chính thức ra đời. Chia vốn, chia lời, và học thị trường nhanh hơn mỗi quý.', 'The joint venture is official. Shared capital, shared profit, and faster market learning every quarter.', 1],
    ['HC_LP_15', 'Nhà máy trăm phần trăm vốn đã khánh thành. Kiểm soát tối đa, rủi ro cũng tối đa.', 'Our wholly owned plant is open. Maximum control, and maximum risk.', 1],
    ['HC_NAR_20', 'Một con dấu mới trong hộ chiếu của bạn.', 'A new stamp in your passport.', 1],
  ] });
  var EV = [['trend', 'Sản phẩm bất ngờ thành xu hướng.', 'Your product has suddenly gone viral.'], ['pricewar', 'Đối thủ đồng loạt giảm giá hai mươi phần trăm.', 'Competitors have all cut prices by twenty percent.'], ['green', 'Khách hàng đang chuyển sang tiêu dùng xanh.', 'Customers are shifting to green consumption.'], ['celeb', 'Một người nổi tiếng vừa nhắc đến thương hiệu của bạn.', 'A celebrity just mentioned your brand.'], ['subst', 'Một sản phẩm thay thế giá rẻ vừa xuất hiện.', 'A cheap substitute product has appeared.'], ['fx', 'Tỷ giá đang thuận lợi cho bạn.', 'The exchange rate is moving in your favour.'], ['reg', 'Quy định nhập khẩu vừa thay đổi.', 'Import regulations have changed.'], ['tax', 'Thuế nhập khẩu tăng.', 'Import tariffs have gone up.'], ['cert', 'Bắc Phong yêu cầu chứng nhận mới.', 'Bắc Phong now requires a new certification.'], ['data', 'Luật bảo vệ dữ liệu người dùng bị siết chặt.', 'User data protection rules have been tightened.'], ['greenlaw', 'Có ưu đãi mới cho doanh nghiệp bền vững.', 'New incentives for sustainable businesses.'], ['port', 'Lô hàng vướng thủ tục kiểm tra.', 'A shipment is stuck in inspection.'], ['talent', 'Một nhân sự chủ chốt muốn nghỉ việc.', 'A key employee wants to leave.'], ['supplier', 'Nhà cung cấp giao hàng trễ.', 'A supplier is delivering late.'], ['defect', 'Phát hiện lỗi chất lượng ở một lô hàng.', 'A quality defect was found in one batch.'], ['cashflow', 'Vốn lưu động đang căng thẳng.', 'Working capital is under strain.'], ['conflict', 'Đội ngũ mâu thuẫn về chiến lược.', 'The team is divided over strategy.'], ['training', 'Có cơ hội đào tạo vận hành quốc tế.', 'An international operations training opportunity has opened.'], ['review', 'Một làn sóng đánh giá tiêu cực đang lan ra.', 'A wave of negative reviews is spreading.'], ['held', 'Container bị giữ tại cảng nước ngoài.', 'A container is being held at a foreign port.'], ['devalue', 'Đồng tiền thị trường mất giá mạnh.', 'The market’s currency has dropped sharply.'], ['betray', 'Đối tác vi phạm cam kết.', 'A partner has broken its commitments.'], ['copy', 'Thương hiệu của bạn bị sao chép.', 'Your brand has been copied.'], ['board', 'Hội đồng quản trị muốn chất vấn bạn.', 'The board wants to question you.']];
  G.push({ title: '4.5 Biến cố (Lumina đọc tiêu đề)', rows: [['HC_LUM_10', 'Biến cố thị trường.', 'Market event.']].concat(EV.map(function (e, i) { return ['HC_LUM_E' + String(i + 1).padStart(2, '0'), e[1], e[2]]; })) });
  G.push({ title: '4.6 Kim Long Exports (MỚI)', rows: [
    ['HC_KL_01', 'Kim Long chào đồng hương. Thế giới rộng lắm, nhưng thị phần thì có hạn đấy.', 'Kim Long greets a fellow newcomer. The world is big, but market share is not.', 1],
    ['HC_KL_01B', 'Kim Long để ý đồng hương đi khá nhanh đấy. Để xem giữ được phong độ bao lâu.', 'Kim Long notices a fellow countryman moving fast. Let’s see how long that lasts.', 1],
    ['HC_KL_02', 'Chúng tôi đã có mặt ở ba thị trường. Các bạn vẫn còn đang mua báo cáo à?', 'We’re already in three markets. Are you still buying reports?', 1],
    ['HC_KL_02B', 'Thừa nhận đi, thị phần các bạn đang nhỉnh hơn tụi tôi rồi. Quý tới tụi tôi sẽ tăng tốc.', 'Fine, I’ll admit it — your market share is ahead of ours right now. We’re speeding up next quarter.', 1],
    ['HC_KL_03', 'Quý cuối rồi. Để xem ai mới là thương hiệu đi xa nhất.', 'Final quarter. Let’s see whose brand has travelled furthest.', 1],
    ['HC_KL_03B', 'Quý cuối rồi. Các bạn đang dẫn trước – nhưng thương trường còn dài, đừng vội ăn mừng.', 'Final quarter. You’re ahead right now – but the market is a long game, don’t celebrate yet.', 1],
    ['HC_KL_04', 'Lần này các bạn thắng. Nhưng thị trường còn dài lắm.', 'You win this time. But the market is a long game.', 1],
    ['HC_KL_05', 'Kim Long dẫn trước. Lần sau nhớ đi nhanh hơn.', 'Kim Long stays ahead. Move faster next time.', 1],
  ] });
  G.push({ title: '4.7 Chế độ thi (Thầy Tú Phan)', rows: [
    ['HC_TP_10', 'Phòng thi đã mở. Các đội đăng nhập và chọn vai trong thời gian chuẩn bị.', 'The exam room is open. Teams, log in and choose roles during the setup time.'],
    ['HC_TP_11', 'Quý mới đã mở. Đồng hồ bắt đầu chạy.', 'The new quarter is open. The clock is running.'],
    ['HC_TP_12', 'Còn năm phút cho quý này.', 'Five minutes left in this quarter.'],
    ['HC_TP_13', 'Còn một phút. Hãy chốt quyết định.', 'One minute left. Lock in your decision.'],
    ['HC_TP_14', 'Hết giờ. Hệ thống đã tự chốt lựa chọn hiện tại của bạn.', 'Time’s up. The system has locked in your current choice.'],
    ['HC_TP_15', 'Bài thi đã kết thúc. Kết quả của bạn đã được gửi cho giảng viên.', 'The exam is over. Your result has been sent to your lecturer.'],
  ] });
  G.push({ title: '4.8 Kết thúc theo mức điểm (Thầy Tú Phan)', rows: [
    ['HC_TP_20', 'Xuất sắc. Bạn mở rộng từng bước, học trước khi cam kết và giữ được tiền mặt. Đó chính là quốc tế hoá bài bản.', 'Excellent. You expanded step by step, learned before committing and protected your cash. That is textbook internationalisation.'],
    ['HC_TP_21', 'Rất tốt. Chiến lược vững, chỉ còn vài quyết định có thể tối ưu hơn. Xem lại quý bạn lỗ nhiều nhất.', 'Very good. A solid strategy, with a few decisions that could be sharper. Review the quarter where you lost the most.'],
    ['HC_TP_22', 'Khá. Bạn đã vào được thị trường, nhưng đôi lúc cam kết vốn trước khi đủ tri thức.', 'Good. You entered markets, but sometimes committed capital before you knew enough.'],
    ['HC_TP_23', 'Đạt. Hãy xem lại khoảng cách chênh lệch về trình độ phát triển kinh tế xã hội và thang cam kết nguồn lực, rồi chơi lại một ván.', 'Pass. Revisit psychic distance and the resource-commitment ladder, then play another round.'],
    ['HC_TP_24', 'Chưa đạt lần này. Không sao – doanh nghiệp thật cũng học từ thất bại. Chơi lại và thử đi chậm hơn.', 'Not a pass this time. That’s fine – real companies learn from failure too. Play again and try moving more slowly.'],
    ['HC_BSL_10', 'Con làm tốt lắm. Mùi thảo mộc Vàm Thịnh giờ đã đi khắp nơi rồi.', 'You did so well, my dear. The scent of Vàm Thịnh herbs has travelled everywhere now.'],
    ['HC_NAR_30', 'Hộ chiếu của bạn đã hoàn tất. Cảm ơn bạn đã chơi Hộ Chiếu Thương Hiệu.', 'Your passport is complete. Thank you for playing Brand Passport.'],
  ] });
  G.push({ title: '4.9 Thẻ nhiệm vụ và "Hỏi thầy Tú" (MỚI)', rows: [
    ['HC_NAR_40', 'Nhiệm vụ quý này đã sẵn sàng.', 'This quarter’s mission is ready.', 1],
    ['HC_NAR_41', 'Hoàn thành nhiệm vụ! Bạn nhận được phần thưởng.', 'Mission complete! You’ve earned a reward.', 1],
    ['HC_TP_30', 'Thầy chỉ gợi ý một lần thôi nhé. Quyết định rủi ro nhất của em đang nằm ở đây.', 'I’ll only give one hint. Your riskiest decision is right here.', 1],
    ['HC_TP_31', 'Nhớ đến chi phí giao dịch: kiểm soát càng cao thì cam kết vốn càng lớn.', 'Remember transaction costs: the more control you want, the more capital you commit.', 1],
  ] });
})();
