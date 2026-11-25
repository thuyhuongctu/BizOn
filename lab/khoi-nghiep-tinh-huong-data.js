/* BizOn – Tình huống khởi nghiệp (đặc tả specs/011-tinh-huong-khoi-nghiep).
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * TÌNH HUỐNG GIẢ ĐỊNH, dựng từ các mẫu thường gặp ở ĐBSCL; số liệu là số minh họa, không gắn doanh nghiệp có thật.
 * Không chấm điểm, không có «đáp án đúng» trên màn hình: mỗi phương án có hệ quả, «Vì sao?» (khung lý thuyết, có trích
 * dẫn) và câu hỏi phản biện. `logic` là nhãn dùng khi phân tích CSV, không hiện cho sinh viên.
 * KHÔNG dùng lại bề mặt câu chuyện của bộ đo trước – sau ct-v1 (js/case-task-data.js). Sửa nội dung = đổi PHIEN_BAN. */
(function (root) {
  'use strict';
  const PHIEN_BAN = 'kn-v1';
  const L = (vi, en) => ({ vi, en });
  const pa = (id, logic, nhan, heQua, viSao, phanBien) => ({ id, logic, nhan, heQua, viSao, phanBien });

  const NGUON = {
    camuffo2020: 'Camuffo, A., Cordova, A., Gambardella, A., & Spina, C. (2020). A scientific approach to entrepreneurial decision making: Evidence from a randomized control trial. *Management Science, 66*(2), 564–586. https://doi.org/10.1287/mnsc.2018.3249',
    sarasvathy2001: 'Sarasvathy, S. D. (2001). Causation and effectuation: Toward a theoretical shift from economic inevitability to entrepreneurial contingency. *Academy of Management Review, 26*(2), 243–263. https://doi.org/10.5465/amr.2001.4378020',
    nickerson1998: 'Nickerson, R. S. (1998). Confirmation bias: A ubiquitous phenomenon in many guises. *Review of General Psychology, 2*(2), 175–220. https://doi.org/10.1037/1089-2680.2.2.175',
    blank2013: 'Blank, S. (2013). Why the lean start-up changes everything. *Harvard Business Review, 91*(5), 63–72.',
    fitzpatrick2013: 'Fitzpatrick, R. (2013). *The Mom Test: How to talk to customers and learn if your business is a good idea when everyone is lying to you*. CreateSpace.',
    ries2011: 'Ries, E. (2011). *The lean startup*. Crown Business.',
  };

  const KIEM_DINH = {
    id: 'kiem-dinh',
    ten: L('Kiểm định ý tưởng', 'Validating an idea'),
    moTa: L('Bốn quyết định từ một ý tưởng đến lần thử đầu tiên với khách thật.', 'Four decisions from an idea to the first test with real customers.'),
    nhanVat: L('Đội «Rổ Rau Xanh»: bốn sinh viên ở Cần Thơ muốn giao rau sạch theo tuần cho nhân viên văn phòng.',
      'Team «Green Basket»: four students in Cần Thơ who want to deliver clean vegetables weekly to office workers.'),
    tinhHuong: [
      {
        id: 'kd1', nguon: ['camuffo2020', 'ries2011'],
        tieuDe: L('Vấn đề có thật không?', 'Is the problem real?'),
        boiCanh: L('Đội tin rằng nhân viên văn phòng ở Cần Thơ lo rau ngoài chợ không sạch nhưng không có thời gian đi chợ. Chưa ai trong đội hỏi một khách hàng nào. Một người quen sẵn sàng cho thuê bếp với giá 6 triệu đồng một tháng.',
          'The team believes office workers in Cần Thơ worry that market vegetables are not clean but have no time to shop. Nobody on the team has asked a single customer yet. An acquaintance offers to rent them a kitchen for 6 million đồng a month.'),
        cauHoi: L('Đội nên làm gì trước tiên?', 'What should the team do first?'),
        phuongAn: [
          pa('a', 'build-first', L('Thuê bếp, mua 200 thùng giữ lạnh, ra mắt ngay để chiếm thị trường trước đối thủ.', 'Rent the kitchen, buy 200 cool boxes and launch now to beat competitors to the market.'),
            L('Sau ba tháng, đội có 41 khách, phần lớn chỉ đặt một tuần rồi thôi. Tiền thuê bếp và thùng đã tiêu hết số vốn ban đầu, nhưng đội vẫn chưa biết vì sao khách bỏ đi.', 'After three months the team has 41 customers, most of whom order once and stop. Kitchen rent and boxes have used up the starting capital, and the team still does not know why customers leave.'),
            L('Bỏ tiền làm trước khi kiểm là đặt cược cả vốn vào một giả thuyết chưa ai thử. Khi thất bại, đội không biết sai ở chỗ nào: sai khách, sai nỗi đau, sai giá hay sai cách giao. Cách làm «xây trước, hỏi sau» là thứ lean startup muốn tránh (Ries, 2011).', 'Spending before testing bets all the capital on an untested hypothesis. When it fails, the team cannot tell what was wrong: the customer, the pain, the price or the delivery. "Build first, ask later" is exactly what the lean startup approach warns against (Ries, 2011).'),
            L('Có trường hợp nào ra mắt thật nhanh là hợp lý không? Khi đó cái giá của việc chậm phải lớn đến mức nào?', 'Is there a case where launching fast makes sense? How large would the cost of waiting need to be?')),
          pa('b', 'hypothesis', L('Viết ra giả thuyết cụ thể: ai, nỗi đau gì, đang tự xoay xở ra sao, sẵn sàng trả bao nhiêu; đặt trước ngưỡng nào thì coi là đúng.', 'Write down specific hypotheses (who, which pain, how they cope today, what they would pay) and set in advance the threshold that counts as "true".'),
            L('Đội ghi được bốn giả thuyết và một ngưỡng: «ít nhất 10 trên 20 người được hỏi đang tự đi chợ sáng sớm và than mất thời gian». Đội chưa tốn đồng nào, và biết rõ cần hỏi ai, hỏi gì.', 'The team writes four hypotheses and one threshold: "at least 10 of 20 people interviewed shop at dawn themselves and complain about the time". Nothing has been spent, and the team knows whom to ask and what.'),
            L('Coi ý tưởng như giả thuyết cần kiểm giúp ra quyết định tốt hơn. Trong một thử nghiệm ngẫu nhiên với các công ty khởi nghiệp ở Ý, nhóm được huấn luyện cách làm này đổi hướng hoặc dừng ý tưởng kém sớm hơn và có doanh thu cao hơn nhóm đối chứng (Camuffo et al., 2020). Ngưỡng đặt trước giúp đội không tự diễn giải kết quả cho vừa ý mình.', 'Treating an idea as a hypothesis to test leads to better decisions. In a randomized trial with Italian start-ups, the group trained this way pivoted or dropped weak ideas earlier and earned more revenue than the control group (Camuffo et al., 2020). A threshold set in advance stops the team from reading results the way it hopes.'),
            L('Ngưỡng «10 trên 20» đặt cao hay thấp quá thì điều gì xảy ra? Ai trong đội nên giữ ngưỡng này?', 'What happens if the "10 of 20" threshold is set too high or too low? Who on the team should guard it?')),
          pa('c', 'survey-intent', L('Đăng khảo sát online «Bạn có quan tâm đến rau sạch không?» lên các nhóm Facebook.', 'Post an online survey, "Are you interested in clean vegetables?", in Facebook groups.'),
            L('Có 230 người trả lời, 87 % chọn «rất quan tâm». Đội gửi lời mời đặt thử tuần đầu cho tất cả, nhưng chỉ có 3 người để lại số điện thoại.', '230 people reply and 87 % choose "very interested". The team invites all of them to order a first week, but only 3 leave a phone number.'),
            L('«Quan tâm» không tốn gì của người trả lời, nên không phải bằng chứng họ sẽ trả tiền. Câu hỏi về ý định và mẫu tự chọn trên mạng thường cho con số đẹp hơn hành vi thật. Cần bằng chứng có cái giá: thời gian, số điện thoại, tiền đặt cọc.', '"Interest" costs the respondent nothing, so it is not evidence they will pay. Questions about intention, answered by a self-selected online sample, usually look better than real behaviour. Look for evidence that costs something: time, a phone number, a deposit.'),
            L('Khảo sát online có thể dùng vào việc gì cho đúng, ví dụ đo quy mô một nhóm khách đã biết?', 'What could an online survey be used for properly, for example sizing a customer group you already know?')),
          pa('d', 'opinion', L('Hỏi giảng viên, gia đình và bạn bè xem ý tưởng có hay không.', 'Ask lecturers, family and friends whether the idea is good.'),
            L('Ai cũng khen ý tưởng hay, vài người góp thêm tên thương hiệu. Không ai trong số họ là nhân viên văn phòng đi chợ hằng tuần.', 'Everyone says the idea is great, and a few suggest brand names. None of them is an office worker who shops every week.'),
            L('Người thân muốn động viên, nên lời khen của họ cho biết họ quý đội, không cho biết khách có cần sản phẩm không. Ý kiến chuyên gia có ích cho việc soạn giả thuyết, nhưng không thay được việc hỏi đúng người.', 'People close to you want to encourage you, so their praise shows they like the team, not that customers need the product. Expert opinion helps you draft hypotheses but cannot replace talking to the right people.'),
            L('Giảng viên có thể giúp đội ở bước nào thì hữu ích nhất?', 'At which step could a lecturer help the team most?')),
        ],
      },
      {
        id: 'kd2', nguon: ['fitzpatrick2013', 'blank2013'],
        tieuDe: L('Hỏi khách thế nào cho đúng?', 'How should you ask customers?'),
        boiCanh: L('Đội hẹn được 20 nhân viên văn phòng ở hai tòa nhà gần bến Ninh Kiều, mỗi người 15 phút giờ nghỉ trưa. Đội chỉ có một lần gặp với mỗi người.', 'The team has booked 20 office workers in two buildings near Ninh Kiều wharf, 15 minutes each over lunch. Each person can be met only once.'),
        cauHoi: L('Đội nên hỏi theo cách nào?', 'How should the team ask?'),
        phuongAn: [
          pa('a', 'intent', L('Hỏi thẳng: «Nếu có dịch vụ giao rau sạch 150.000 đ một tuần, anh chị có mua không?»', 'Ask directly: "If there were a clean-vegetable delivery for 150,000 đ a week, would you buy it?"'),
            L('17 trên 20 người nói «có». Khi đội mở nhận đơn, chỉ 2 người trong số đó đặt.', '17 of 20 say "yes". When the team opens orders, only 2 of them buy.'),
            L('Hỏi về tương lai thì người ta đoán, và thường đoán theo hướng lịch sự. Lời hứa không tốn gì. Cách hỏi này cho đội con số đẹp nhưng sai (Fitzpatrick, 2013).', 'Asking about the future makes people guess, and they guess politely. A promise costs nothing. This question gives the team a nice but wrong number (Fitzpatrick, 2013).'),
            L('Vì sao người được hỏi không cố ý nói dối mà kết quả vẫn sai?', 'Why is the result wrong even though nobody is deliberately lying?')),
          pa('b', 'past-behaviour', L('Hỏi về chuyện đã xảy ra: lần gần nhất mua rau là khi nào, ở đâu, mất bao lâu, tốn bao nhiêu, đã thử cách nào khác.', 'Ask about what already happened: when they last bought vegetables, where, how long it took, how much it cost, what else they have tried.'),
            L('Đội biết 9 trên 20 người tự đi chợ trước 6 giờ sáng. 5 người từng đặt rau qua nhóm Zalo nhưng bỏ vì giao trễ. Những người còn lại để người nhà đi chợ và không thấy phiền.', 'The team learns that 9 of 20 shop before 6 a.m. themselves; 5 once ordered through a Zalo group but quit because deliveries were late; the rest have a family member shop and are not bothered.'),
            L('Hành vi đã xảy ra là bằng chứng mạnh hơn ý định. Người đã tốn thời gian, đã thử cách khác và đã bỏ cuộc mới là người có nỗi đau thật. Phỏng vấn khách hàng theo hướng «khám phá khách hàng» bắt đầu từ chuyện có thật, không bắt đầu từ sản phẩm (Blank, 2013).', 'Past behaviour is stronger evidence than intention. People who have spent time, tried alternatives and given up are the ones with a real pain. Customer-discovery interviews start from real events, not from the product (Blank, 2013).'),
            L('Con số «9 trên 20» đã vượt ngưỡng đội đặt ra chưa? Đội có nên đếm cả 5 người từng bỏ nhóm Zalo không?', 'Does "9 of 20" pass the team\'s threshold? Should the 5 who quit the Zalo group count?')),
          pa('c', 'pitch', L('Trình bày ý tưởng 5 phút cho thật hấp dẫn, rồi hỏi «anh chị thấy thế nào?».', 'Pitch the idea for 5 minutes, as attractively as possible, then ask "what do you think?".'),
            L('Người nghe gật đầu, khen bao bì đẹp, hỏi ngày ra mắt. Đội có nhiều lời khen nhưng không biết gì thêm về việc họ mua rau ra sao.', 'Listeners nod, praise the packaging and ask about the launch date. The team gets plenty of praise but learns nothing about how they buy vegetables.'),
            L('Khi nghe đội trình bày trước, người được hỏi sẽ phản hồi về bài trình bày, không kể về cuộc sống của họ. Nhận lời khen không phải mục tiêu của buổi phỏng vấn.', 'Pitching first makes people react to the pitch rather than describe their own lives. Collecting compliments is not the goal of an interview.'),
            L('Khi nào thì đội nên trình bày sản phẩm, trước hay sau khi đã hiểu nỗi đau?', 'When should the team show the product: before or after understanding the pain?')),
          pa('d', 'convenience', L('Hỏi người thân và bạn cùng lớp vì dễ hẹn, đủ 20 người trong một buổi chiều.', 'Ask relatives and classmates because they are easy to reach: 20 people in one afternoon.'),
            L('Đội có đủ 20 câu trả lời rất nhanh. Nhưng chỉ 3 người đi làm văn phòng, và cả 3 đều ăn ở căng tin công ty.', 'The team gets 20 answers quickly, but only 3 are office workers, and all 3 eat at a company canteen.'),
            L('Mẫu tiện lợi trả lời câu hỏi của một nhóm khác với nhóm khách đội nhắm tới. Số lượng không bù được việc hỏi sai người.', 'A convenience sample answers for a different group from the one the team is targeting. Quantity does not make up for asking the wrong people.'),
            L('Làm sao tìm được đúng nhóm khách mà không tốn nhiều tiền?', 'How can the team reach the right customers without spending much?')),
        ],
      },
      {
        id: 'kd3', nguon: ['sarasvathy2001', 'ries2011'],
        tieuDe: L('Thử rẻ trước', 'Test cheaply first'),
        boiCanh: L('Sau phỏng vấn, đội thấy có một nhóm khách đáng thử. Quỹ của đội có 5 triệu đồng. Một bạn trong đội đề nghị làm app riêng, báo giá 60 triệu đồng.', 'After the interviews the team sees a group worth testing. It has 5 million đồng. One member proposes building a dedicated app, quoted at 60 million đồng.'),
        cauHoi: L('Lần thử đầu tiên nên là gì?', 'What should the first test be?'),
        phuongAn: [
          pa('a', 'smoke-test-paid', L('Mở trang đặt trước và nhóm Zalo, nhận đặt cọc 50.000 đ cho tuần đầu, tự giao bằng xe máy cho 15 khách.', 'Open a pre-order page and a Zalo group, take a 50,000 đ deposit for the first week, and deliver to 15 customers by motorbike.'),
            L('Có 15 người đặt cọc trong 6 ngày. Tổng chi cho rau, túi và xăng là 3,1 triệu đồng. Đội biết khách đặt lúc mấy giờ, chê gì, và mỗi đơn giao mất bao lâu.', '15 people pay a deposit within 6 days. Vegetables, bags and fuel cost 3.1 million đồng in total. The team learns when customers order, what they complain about and how long each delivery takes.'),
            L('Một lần thử nhỏ với tiền thật đo đúng hành vi cần biết, mà khoản lỗ tối đa đội chấp nhận được (Sarasvathy, 2001). Đây là một sản phẩm khả dụng tối thiểu: đủ để học, chưa cần đẹp (Ries, 2011).', 'A small test with real money measures the behaviour that matters, with a maximum loss the team can afford (Sarasvathy, 2001). It is a minimum viable product: enough to learn, not yet polished (Ries, 2011).'),
            L('Tự giao bằng xe máy không nhân rộng được. Vậy vì sao vẫn nên làm ở bước này?', 'Delivering by motorbike does not scale. Why do it at this stage anyway?')),
          pa('b', 'build-app', L('Vay thêm để làm app 60 triệu đồng, vì khách văn phòng quen dùng app.', 'Borrow to build the 60-million-đồng app, because office workers are used to apps.'),
            L('App làm mất bốn tháng. Trong lúc chờ, hai trong số năm khách từng bỏ nhóm Zalo đã tìm được một sạp rau giao tận nơi.', 'The app takes four months. Meanwhile two of the five customers who had quit the Zalo group find a market stall that delivers.'),
            L('Làm app là làm phần đắt nhất trước khi biết khách có trả tiền không. Nếu ý tưởng sai, khoản lỗ vượt xa mức đội chịu được.', 'Building the app does the most expensive part before knowing whether customers will pay. If the idea is wrong, the loss is far beyond what the team can bear.'),
            L('Tín hiệu nào cần thấy trước, để làm app trở thành quyết định hợp lý?', 'What signal would make building the app a sensible decision?')),
          pa('c', 'flyer-interest', L('In 2.000 tờ rơi phát ở cổng các tòa văn phòng, đếm số người gọi điện hỏi.', 'Print 2,000 flyers for office-building entrances and count the calls.'),
            L('Có 38 cuộc gọi hỏi giá, 4 người đặt thử. Tờ rơi tốn 1,8 triệu đồng.', '38 people call to ask the price and 4 place a trial order. The flyers cost 1.8 million đồng.'),
            L('Tờ rơi đo được mức quan tâm và chi phí để có một khách hỏi, nhưng một cuộc gọi chưa phải là trả tiền. Có thể ghép tờ rơi với nhận đặt cọc để đo cả hai.', 'Flyers measure interest and the cost of getting someone to ask, but a call is not a payment. Combine flyers with deposits to measure both.'),
            L('Từ số liệu này, chi phí để có một khách đặt thử là bao nhiêu? So với lãi mỗi tuần của một khách thì sao?', 'From these numbers, what does one trial customer cost? How does that compare with the weekly margin per customer?')),
          pa('d', 'over-research', L('Chờ thêm hai tháng để khảo sát 300 người cho chắc.', 'Wait two more months to survey 300 people and be sure.'),
            L('Đội có thêm nhiều số liệu về ý định, nhưng vẫn chưa ai trả đồng nào. Học kỳ sắp hết.', 'The team collects more data on intentions, but still nobody has paid a đồng. The semester is almost over.'),
            L('Thêm số liệu về ý định không trả lời được câu hỏi «khách có trả tiền không». Hỏi thêm cũng có cái giá của nó: thời gian và cơ hội bị mất.', 'More data on intentions cannot answer "will customers pay?". More research also has a cost: time and lost opportunities.'),
            L('Khi nào thì hỏi thêm là đúng, khi nào là cách để né một lần thử?', 'When is more research right, and when is it a way to avoid testing?')),
        ],
      },
      {
        id: 'kd4', nguon: ['nickerson1998', 'camuffo2020'],
        tieuDe: L('Đổi hướng hay đi tiếp?', 'Pivot or persevere?'),
        boiCanh: L('Sau bốn tuần thử: tuần 1 có 15 khách, tuần 4 còn 6. Cả 6 người ở lại đều là gia đình có con nhỏ, không phải nhân viên văn phòng. Mỗi đơn 150.000 đ lãi gộp 12.000 đ, nhưng giao mất 25 phút. Ngưỡng đội đặt trước là giữ được ít nhất một nửa số khách sau bốn tuần.', 'After four weeks of testing: 15 customers in week 1, 6 in week 4. All 6 who stayed are families with young children, not office workers. Each 150,000 đ order leaves a 12,000 đ gross margin but takes 25 minutes to deliver. The team\'s preset threshold was keeping at least half of its customers after four weeks.'),
        cauHoi: L('Đội quyết định thế nào?', 'What does the team decide?'),
        phuongAn: [
          pa('a', 'persevere', L('Đi tiếp như cũ và tăng quảng cáo, vì «mới có bốn tuần».', 'Carry on as before and advertise more, because "it has only been four weeks".'),
            L('Quảng cáo kéo thêm 12 khách văn phòng. Bốn tuần sau họ cũng rời đi giống nhóm đầu, và tiền quảng cáo bị mất.', 'Advertising brings 12 more office workers, who leave after four weeks just like the first group. The ad money is lost.'),
            L('Đổi luật sau khi đã thấy kết quả là dấu hiệu của thiên kiến xác nhận: người ta tìm lý do để tin vào điều mình muốn tin (Nickerson, 1998). Ngưỡng đặt trước có tác dụng chính là ngăn điều này.', 'Moving the goalposts after seeing results is a sign of confirmation bias: people look for reasons to believe what they want (Nickerson, 1998). Preventing this is the main job of a preset threshold.'),
            L('Có lý do chính đáng nào để kéo dài lần thử không? Lý do đó nên được ghi ra từ lúc nào?', 'Is there a legitimate reason to extend the test? When should that reason have been written down?')),
          pa('b', 'pivot-segment', L('Đổi nhóm khách sang gia đình có con nhỏ, gom đơn giao theo cụm phường, đặt ngưỡng mới cho bốn tuần tiếp.', 'Switch the target to families with young children, batch deliveries by ward, and set a new threshold for the next four weeks.'),
            L('Gom đơn theo cụm giúp thời gian giao giảm còn khoảng 9 phút một đơn. Ở lần thử thứ hai, 11 trên 16 gia đình ở lại sau bốn tuần.', 'Batching by ward cuts delivery to about 9 minutes per order. In the second test, 11 of 16 families stay after four weeks.'),
            L('Đổi hướng là đổi một thành phần của mô hình, ở đây là nhóm khách, và giữ lại những gì đã học. Dữ liệu cho thấy nỗi đau thật nằm ở nhóm khác với giả thuyết ban đầu. Đây là kết quả tốt của việc kiểm định, không phải thất bại (Camuffo et al., 2020).', 'A pivot changes one element of the model (here, the customer group) and keeps what has been learned. The data showed the real pain sits with a different group from the original hypothesis. That is a good outcome of testing, not a failure (Camuffo et al., 2020).'),
            L('Còn giả thuyết nào khác chưa kiểm, ví dụ giá hoặc tần suất giao?', 'Which hypotheses remain untested, for example price or delivery frequency?')),
          pa('c', 'stop', L('Dừng hẳn vì không đạt ngưỡng.', 'Stop entirely because the threshold was missed.'),
            L('Đội dừng, tổng lỗ khoảng 3 triệu đồng, và viết lại những gì đã học. Hai tháng sau, một bạn trong đội dùng chính cách làm này để kiểm một ý tưởng khác.', 'The team stops with a total loss of about 3 million đồng and writes up what it learned. Two months later a member uses the same method to test another idea.'),
            L('Dừng sớm với khoản lỗ nhỏ cũng là một quyết định tốt, vì giữ được vốn và thời gian cho ý tưởng khác. Tuy vậy, dữ liệu vẫn để ngỏ một hướng chưa thử: nhóm gia đình có con nhỏ.', 'Stopping early with a small loss is also a good decision, because it saves capital and time for other ideas. Still, the data left one direction untried: families with young children.'),
            L('Dừng hay đổi hướng: cần thêm thông tin gì để chọn?', 'Stop or pivot: what extra information would help choose?')),
          pa('d', 'discount', L('Giảm giá 30 % để giữ khách.', 'Cut the price by 30 % to keep customers.'),
            L('Mức giảm 45.000 đ mỗi đơn lớn hơn khoản lãi gộp 12.000 đ, nên càng bán càng lỗ. Số khách tăng nhẹ rồi lại giảm.', 'The 45,000 đ discount per order is larger than the 12,000 đ gross margin, so every sale loses money. Customer numbers rise slightly, then fall again.'),
            L('Giảm giá khi chưa biết vì sao khách bỏ đi là chữa sai bệnh. Theo số liệu, khách văn phòng rời đi vì hợp với nhóm khác hơn, không vì giá. Phải kiểm biên đóng góp trước mỗi lần giảm giá.', 'Discounting without knowing why customers leave treats the wrong illness. The data says office workers left because the service fits another group better, not because of price. Check the contribution margin before any discount.'),
            L('Giảm giá bao nhiêu thì vẫn chưa lỗ trên mỗi đơn? Nếu muốn giảm giá, đội cần thử gì trước?', 'How big a discount still keeps each order profitable? What should the team test before cutting prices?')),
        ],
      },
    ],
  };

  const BO = [KIEM_DINH];
  const LUAT = { lyDoToiThieu: 10 };
  const DATA = { PHIEN_BAN, NGUON, BO, LUAT };
  if (typeof module === 'object' && module.exports) module.exports = DATA;
  else root.KhoiNghiepData = DATA;
})(typeof self !== 'undefined' ? self : this);
