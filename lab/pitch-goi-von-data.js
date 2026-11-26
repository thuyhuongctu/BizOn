/* BizOn – Phòng luyện pitch gọi vốn «Hội đồng đầu tư» (đặc tả specs/010-phong-pitch-goi-von).
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Luật lấy đúng kịch bản «Đại hội Cổ đông & Pitch xin vốn» (js/lop-hoc-data.js): pitch 7 phút theo 5 vai,
 * CEO nói hai lần (mở 30 giây, chốt 90 giây); quá 7 phút 30 giây thì trừ 5 điểm và dừng phần trình bày.
 * Bộ câu hỏi Hội đồng: mỗi câu gắn một chữ của PASTOR, một vai và một người hỏi:
 *   thầy Tu Phan (chủ tịch, chiến lược) hỏi P (Problem) và R (Response);
 *   Victor Lâm (thị trường, quốc tế hóa) hỏi A (Answer) và S (Story);
 *   Minh Khang (tài chính) hỏi T (Traction) và O (Offer).
 * Câu hỏi soạn sẵn, KHÔNG kèm đáp án, không chấm nội dung trả lời. Sửa câu hỏi = đổi PHIEN_BAN. */
(function (root) {
  'use strict';
  const PHIEN_BAN = 'pq-v1';

  const DOAN = [
    { vai: 'ceo', giay: 30, vi: 'Mở màn: hook và vấn đề khách hàng', en: 'Opening: hook and the customer problem' },
    { vai: 'cmo', giay: 90, vi: 'Thị trường và chân dung khách hàng', en: 'Market size and customer profile' },
    { vai: 'cfo', giay: 90, vi: 'Tài chính: hòa vốn, biên an toàn', en: 'Finance: break-even, margin of safety' },
    { vai: 'coo', giay: 60, vi: 'Vận hành và cấu trúc chi phí', en: 'Operations and cost structure' },
    { vai: 'sec', giay: 60, vi: 'Rủi ro, pháp lý, dự phòng', en: 'Risk, legal, contingency' },
    { vai: 'ceo', giay: 90, vi: 'Lời chốt, số vốn xin, cam kết SMART', en: 'Close, the ask, SMART commitment' },
  ];

  const LUAT = { tongGiay: 420, hanPhatGiay: 450, diemPhat: 5, baoTruocGiay: 10, giayMoiCau: 60, soCauMacDinh: 3, soCauToiThieu: 3, soCauToiDa: 5 };

  const VAI = {
    ceo: { vi: 'CEO', en: 'CEO', icon: '👑' },
    cmo: { vi: 'CMO', en: 'CMO', icon: '📣' },
    cfo: { vi: 'CFO', en: 'CFO', icon: '💰' },
    coo: { vi: 'COO', en: 'COO', icon: '🏭' },
    sec: { vi: 'Thư ký (SEC)', en: 'Secretary (SEC)', icon: '📔' },
  };

  const PASTOR = {
    P: { vi: 'Problem – nỗi đau', en: 'Problem' },
    A: { vi: 'Answer – giải pháp', en: 'Answer' },
    S: { vi: 'Story – câu chuyện', en: 'Story' },
    T: { vi: 'Traction – số liệu hòa vốn', en: 'Traction' },
    O: { vi: 'Offer – số vốn xin', en: 'Offer' },
    R: { vi: 'Response – đề nghị ký sổ', en: 'Response' },
  };

  const HOI_DONG = [
    { id: 'tu-phan', vi: 'Thầy Tu Phan', en: 'Professor Tu Phan', vaiTro: { vi: 'Chủ tịch Hội đồng · chiến lược', en: 'Board chair · strategy' }, chu: ['P', 'R'], anh: '../assets/character/advisors/tu-phan-cut-v3.webp' },
    { id: 'victor-lam', vi: 'Victor Lâm', en: 'Victor Lâm', vaiTro: { vi: 'Thị trường và quốc tế hóa', en: 'Markets and internationalization' }, chu: ['A', 'S'], anh: '../assets/character/advisors/victor-lam-cut.webp' },
    { id: 'minh-khang', vi: 'Minh Khang', en: 'Minh Khang', vaiTro: { vi: 'Tài chính', en: 'Finance' }, chu: ['T', 'O'], anh: '../assets/character/advisors/minh-khang-cut.webp' },
  ];

  // id: chữ PASTOR + vai + số thứ tự. hoi: người hỏi (theo chữ PASTOR).
  const q = (id, p, vai, vi, en) => ({ id, p, vai, hoi: p === 'P' || p === 'R' ? 'tu-phan' : p === 'A' || p === 'S' ? 'victor-lam' : 'minh-khang', vi, en });
  const CAU_HOI = [
    // P – Problem (thầy Tu Phan)
    q('P-ceo-1', 'P', 'ceo', 'Nỗi đau khách hàng mà đội nêu ở câu mở đầu: các bạn đã tận mắt thấy nó ở đâu, với ai?', 'The customer pain in your opening: where, and with whom, did you see it first-hand?'),
    q('P-ceo-2', 'P', 'ceo', 'Nếu vấn đề này tự biến mất trong hai năm tới, doanh nghiệp của các bạn còn lý do tồn tại không?', 'If this problem disappeared on its own in the next two years, would your business still have a reason to exist?'),
    q('P-cmo-1', 'P', 'cmo', 'Các bạn đã hỏi bao nhiêu khách hàng thật trước khi kết luận đây là vấn đề? Họ nói gì khiến các bạn bất ngờ nhất?', 'How many real customers did you talk to before deciding this is a problem? What did they say that surprised you most?'),
    q('P-cmo-2', 'P', 'cmo', 'Nhóm khách hàng nào chịu nỗi đau này nặng nhất? Vì sao đội chọn họ trước?', 'Which customer group feels this pain most? Why did you choose them first?'),
    q('P-cfo-1', 'P', 'cfo', 'Vấn đề này làm khách hàng tốn bao nhiêu tiền hoặc thời gian mỗi tháng? Con số đó lấy từ đâu?', 'How much money or time does this problem cost a customer each month? Where does that number come from?'),
    q('P-coo-1', 'P', 'coo', 'Hiện nay khách hàng đang tự xoay xở với vấn đề này bằng cách nào? Cách đó dở ở khâu nào?', 'How do customers cope with this problem today? Where exactly does their workaround fail?'),
    q('P-sec-1', 'P', 'sec', 'Có quy định, giấy phép hay tiêu chuẩn nào khiến vấn đề này khó giải hơn người ta tưởng không?', 'Is there a regulation, licence or standard that makes this problem harder to solve than it looks?'),
    // A – Answer (Victor Lâm)
    q('A-ceo-1', 'A', 'ceo', 'Giải pháp này khác gì cách đối thủ lớn nhất đang làm? Khách hàng cần bao lâu để nhận ra điểm khác đó?', 'How is your solution different from what the biggest competitor does? How long until a customer notices the difference?'),
    q('A-cmo-1', 'A', 'cmo', 'Khách hàng sẽ tìm thấy sản phẩm của các bạn qua kênh nào trước tiên? Vì sao là kênh đó?', 'Through which channel will customers find you first? Why that channel?'),
    q('A-cmo-2', 'A', 'cmo', 'Nếu đưa sản phẩm này ra một thị trường nước ngoài, các bạn sẽ phải đổi điều gì đầu tiên?', 'If you took this product to a foreign market, what would you have to change first?'),
    q('A-cfo-1', 'A', 'cfo', 'Phần nào của giải pháp tốn tiền nhất để làm ra? Bỏ bớt phần đó thì khách hàng có còn trả tiền không?', 'Which part of the solution is the most expensive to make? Would customers still pay if you cut it?'),
    q('A-coo-1', 'A', 'coo', 'Nếu số đơn hàng tăng gấp mười, khâu nào trong quy trình sẽ vỡ trước?', 'If orders grew tenfold, which step in your process would break first?'),
    q('A-coo-2', 'A', 'coo', 'Đội cần bao lâu để giao sản phẩm đầu tiên đến tay khách? Khâu nào tốn thời gian nhất?', 'How long will it take to deliver the first product to a customer? Which step takes the longest?'),
    q('A-sec-1', 'A', 'sec', 'Ý tưởng này có dễ bị sao chép không? Đội bảo vệ nó bằng cách nào: nhãn hiệu, bí quyết hay tốc độ?', 'How easy is this idea to copy? How will you protect it: trademark, know-how or speed?'),
    // S – Story (Victor Lâm)
    q('S-ceo-1', 'S', 'ceo', 'Câu chuyện đội vừa kể có thật không? Nhân vật trong câu chuyện bây giờ ra sao?', 'Is the story you just told real? What has happened to the person in it since?'),
    q('S-ceo-2', 'S', 'ceo', 'Vì sao chính đội này, chứ không phải đội khác, là người nên làm việc này?', 'Why is this team, and not another, the right one to do this?'),
    q('S-cmo-1', 'S', 'cmo', 'Nếu khách hàng chỉ có 15 giây để nghe, các bạn sẽ kể câu chuyện nào?', 'If a customer had only 15 seconds to listen, which story would you tell?'),
    q('S-cfo-1', 'S', 'cfo', 'Có con số nào làm chứng cho câu chuyện, hay câu chuyện đang đứng một mình?', 'Is there a number that backs up the story, or does the story stand alone?'),
    q('S-coo-1', 'S', 'coo', 'Hãy kể một lần đội làm thử và thất bại. Lần đó dạy đội điều gì về cách vận hành?', 'Tell us about a time the team tried something and failed. What did it teach you about operations?'),
    q('S-sec-1', 'S', 'sec', 'Câu chuyện có dùng hình ảnh, tên hay lời kể của người thật không? Đội đã xin phép họ chưa?', 'Does the story use real people\'s images, names or words? Did you ask their permission?'),
    // T – Traction (Minh Khang)
    q('T-ceo-1', 'T', 'ceo', 'Đến nay có bằng chứng nào cho thấy khách hàng chịu trả tiền: đơn đặt trước, đơn thử, hay chỉ là lời khen?', 'What evidence do you have that customers will pay: pre-orders, trial orders, or only compliments?'),
    q('T-cmo-1', 'T', 'cmo', 'Chi phí để có một khách hàng mới là bao nhiêu? Một khách hàng mang lại bao nhiêu biên đóng góp?', 'What does it cost to win one new customer? How much contribution margin does one customer bring?'),
    q('T-cfo-1', 'T', 'cfo', 'Điểm hòa vốn mỗi tháng là bao nhiêu sản phẩm? Nếu giá bán giảm 10 %, con số đó thành bao nhiêu?', 'What is your monthly break-even in units? If the price fell by 10 %, what would it become?'),
    q('T-cfo-2', 'T', 'cfo', 'Biên đóng góp trên mỗi sản phẩm là bao nhiêu? Đội đã kiểm con số này với giá nhà cung cấp thật chưa?', 'What is the contribution margin per unit? Have you checked it against real supplier prices?'),
    q('T-coo-1', 'T', 'coo', 'Trong chi phí của một sản phẩm, khoản nào là biến phí, khoản nào là định phí? Khoản nào đội chưa chắc?', 'In the cost of one unit, which items are variable and which are fixed? Which are you unsure about?'),
    q('T-sec-1', 'T', 'sec', 'Biên an toàn hiện là bao nhiêu? Rủi ro nào có thể ăn hết biên an toàn đó?', 'What is your margin of safety now? Which risk could wipe it out?'),
    q('T-sec-2', 'T', 'sec', 'Nếu một khách hàng lớn hủy đơn, doanh thu tháng đó còn trên điểm hòa vốn không?', 'If one large customer cancelled, would that month\'s revenue still be above break-even?'),
    // O – Offer (Minh Khang)
    q('O-ceo-1', 'O', 'ceo', 'Đội xin chính xác bao nhiêu? Vì sao không ít hơn, cũng không nhiều hơn?', 'Exactly how much are you asking for? Why not less, and why not more?'),
    q('O-cmo-1', 'O', 'cmo', 'Bao nhiêu phần trăm số vốn dành cho marketing? Đội sẽ biết khoản đó hiệu quả hay không bằng cách nào?', 'What share of the funding goes to marketing? How will you know whether it works?'),
    q('O-cfo-1', 'O', 'cfo', 'Với số vốn này, đội cầm cự được bao nhiêu tháng nếu doanh thu chỉ bằng một nửa dự kiến?', 'With this funding, how many months can you last if revenue is only half of your forecast?'),
    q('O-cfo-2', 'O', 'cfo', 'Nếu Hội đồng chỉ cấp vốn theo từng đợt, đội đề nghị chia mấy đợt, mỗi đợt gắn với mốc nào?', 'If the board released funds in tranches, how many would you propose, and tied to which milestones?'),
    q('O-coo-1', 'O', 'coo', 'Trong ba việc sẽ chi tiền, việc nào phải làm trước? Nếu nhà cung cấp giao chậm thì kế hoạch đổi ra sao?', 'Of the three things you will spend on, which comes first? If a supplier delivers late, how does the plan change?'),
    q('O-sec-1', 'O', 'sec', 'Khoản dự phòng trong số vốn xin là bao nhiêu? Đội sẽ dùng nó trong tình huống nào?', 'How much of the ask is a contingency reserve? In which situation would you use it?'),
    // R – Response (thầy Tu Phan)
    q('R-ceo-1', 'R', 'ceo', 'Nếu hôm nay Hội đồng chỉ ký một nửa số vốn các bạn xin, đội sẽ cắt việc gì trước?', 'If the board signed only half of your ask today, what would you cut first?'),
    q('R-ceo-2', 'R', 'ceo', 'Vì sao Hội đồng nên quyết hôm nay, thay vì đợi đội chạy thử thêm ba tháng?', 'Why should the board decide today rather than wait for three more months of trials?'),
    q('R-cmo-1', 'R', 'cmo', 'Sau khi nhận vốn, 30 ngày đầu đội sẽ làm gì để có 10 khách hàng trả tiền đầu tiên?', 'After funding, what will you do in the first 30 days to win your first 10 paying customers?'),
    q('R-cfo-1', 'R', 'cfo', 'Hội đồng nên theo dõi chỉ số nào mỗi tháng để biết số vốn này đang được dùng đúng?', 'Which indicator should the board track each month to know the money is being used well?'),
    q('R-cfo-2', 'R', 'cfo', 'Hội đồng sẽ nhận lại gì cho số vốn này, và khi nào?', 'What will the board get back for this funding, and when?'),
    q('R-coo-1', 'R', 'coo', 'Mốc vận hành đầu tiên mà Hội đồng có thể đến tận nơi kiểm tra là gì, vào lúc nào?', 'What is the first operational milestone the board could come and inspect in person, and when?'),
    q('R-sec-1', 'R', 'sec', 'Nếu sau 6 tháng cam kết SMART không đạt, đội đề nghị Hội đồng xử lý thế nào?', 'If the SMART commitment is missed after 6 months, what do you propose the board should do?'),
  ];

  // Tự chấm sau pitch: 4 tiêu chí × 2,5 điểm, theo kịch bản «Đại hội Cổ đông».
  const TIEU_CHI = [
    { id: 'kha-thi', toiDa: 2.5, vi: 'Khả thi tài chính', en: 'Financial feasibility' },
    { id: 'doc-dao', toiDa: 2.5, vi: 'Độc đáo', en: 'Originality' },
    { id: 'doi-ngu', toiDa: 2.5, vi: 'Đội ngũ', en: 'Team' },
    { id: 'trinh-bay', toiDa: 2.5, vi: 'Trình bày', en: 'Delivery' },
  ];

  const NGANH = [
    { id: 'nong-san', vi: 'Nông sản tươi', en: 'Fresh produce' },
    { id: 'che-bien', vi: 'Thực phẩm chế biến', en: 'Processed food' },
    { id: 'thu-cong', vi: 'Thủ công mỹ nghệ', en: 'Handicrafts' },
    { id: 'du-lich', vi: 'Dịch vụ du lịch', en: 'Tourism services' },
    { id: 'cong-nghe', vi: 'Ứng dụng, công nghệ', en: 'App or technology' },
    { id: 'khac', vi: 'Ngành khác', en: 'Other' },
  ];

  /* ---------- Hội đồng phản ứng theo luật (đặc tả 012, PR 3) ----------
   * Chỉ dựa trên tín hiệu trang đo được: thời gian, nút đội tự bấm, kết quả kiểm ba con số, nhóm PASTOR của câu hỏi.
   * Trang không ghi âm, không dùng AI, không hiểu nội dung câu trả lời. 'nguoi-hoi' = thành viên đang hỏi câu hiện tại. */
  const TINH_CACH = {
    'tu-phan': { vi: 'Học thuật, hay hỏi «vì sao», soi lập luận và chiến lược.', en: 'Academic; keeps asking «why»; tests the reasoning and the strategy.' },
    'victor-lam': { vi: 'Thị trường và khách hàng: ai mua, vì sao đổi sang, đi xa được không.', en: 'Markets and customers: who buys, why they switch, how far it can go.' },
    'minh-khang': { vi: 'Tài chính: soi ba con số, hòa vốn và số vốn xin.', en: 'Finance: checks the three numbers, break-even and the funding ask.' },
  };
  const DONG_TAC = {
    gat: { vi: 'gật đầu', en: 'nods', icon: '👍' },
    'cau-may': { vi: 'cau mày', en: 'frowns', icon: '🤨' },
    nghieng: { vi: 'nghiêng người tới', en: 'leans in', icon: '👀' },
    'ghi-chep': { vi: 'ghi chép', en: 'takes notes', icon: '📝' },
    chuong: { vi: 'gõ chuông', en: 'rings the bell', icon: '🔔' },
  };
  const PHAN_UNG = [
    { tinHieu: 'bat-dau-cau', ai: 'nguoi-hoi', dongTac: 'nghieng', loi: {
      'tu-phan': { vi: 'Tôi muốn hiểu vì sao đội chọn cách này.', en: 'I want to understand why you chose this path.' },
      'victor-lam': { vi: 'Khách hàng sẽ nghĩ gì về điều này?', en: 'What will the customer think about this?' },
      'minh-khang': { vi: 'Nói chuyện con số nhé.', en: "Let's talk numbers." } } },
    { tinHieu: 'lech-so', ai: 'minh-khang', dongTac: 'cau-may', loi: { vi: 'Ba con số chưa khớp nhau. Tôi hỏi thêm một câu tài chính.', en: "Your three numbers don't fit together. One more finance question." } },
    { tinHieu: 'con-10', ai: 'nguoi-hoi', dongTac: 'nghieng', loi: { vi: 'Còn 10 giây, đội chốt ý chính đi.', en: 'Ten seconds left: give me the main point.' } },
    { tinHieu: 'qua-gio', ai: 'lumina', dongTac: 'chuong', loi: { vi: 'Hết một phút cho câu này.', en: 'One minute is up for this question.' } },
    { tinHieu: 'qua-gio', ai: 'nguoi-hoi', dongTac: 'ghi-chep', loi: { vi: 'Tôi ghi lại để hỏi tiếp sau.', en: "I'll note that and come back to it." } },
    { tinHieu: 'tra-loi-som', ai: 'nguoi-hoi', dongTac: 'gat', loi: { vi: 'Gọn gàng. Cảm ơn đội.', en: 'Concise. Thank you.' } },
    { tinHieu: 'tu-tin', ai: 'nguoi-hoi', dongTac: 'nghieng', loi: { vi: 'Vậy cho tôi một con số cụ thể.', en: 'Then give me one specific number.' } },
    { tinHieu: 'chua-chac', ai: 'nguoi-hoi', dongTac: 'gat', loi: { vi: 'Nhận chỗ chưa biết là tốt. Đội sẽ kiểm chứng bằng cách nào?', en: "Admitting what you don't know is good. How will you test it?" } },
  ];
  /** Trả lời xong khi còn ít nhất chừng này giây thì tính là «trả lời gọn». */
  const GIAY_TRA_LOI_SOM = 20;
  /** Câu hỏi vặn của Minh Khang (tài chính) khi kiểm ba con số báo lệch; chèn lên đầu phần hỏi đáp. */
  const CAU_VAN = {
    bep: { p: 'T', vi: 'Điểm hòa vốn đội khai lệch với cách tính từ giá, biến phí và định phí. Đội tính lại giúp tôi: mỗi tháng cần bán bao nhiêu sản phẩm?', en: 'Your stated break-even does not match the price, variable cost and fixed cost. Walk me through it again: how many units a month?' },
    von: { p: 'O', vi: 'Số vốn xin chưa đủ trang trải đến điểm hòa vốn. Thiếu thì đội lấy tiền ở đâu, và cầm cự được bao lâu?', en: 'The ask does not cover the months until break-even. Where does the gap come from, and how long can you last?' },
    ln: { p: 'T', vi: 'Lợi nhuận mục tiêu cao hơn mức sản lượng dự kiến cho phép. Đội sẽ hạ mục tiêu hay tăng sản lượng, và dựa vào đâu?', en: 'Your target profit is higher than the expected volume allows. Will you lower the target or raise volume, and on what basis?' },
  };
  const GHI_CHU_PHAN_UNG = { vi: 'Hội đồng phản ứng theo thời gian, nút đội tự bấm và kết quả kiểm ba con số; không nghe, không chấm nội dung câu trả lời.', en: 'The board reacts to time, the buttons the team presses and the three-number check; it does not listen to or grade the answers.' };

  const DATA = { PHIEN_BAN, DOAN, LUAT, VAI, PASTOR, HOI_DONG, CAU_HOI, TIEU_CHI, NGANH, TINH_CACH, DONG_TAC, PHAN_UNG, GIAY_TRA_LOI_SOM, CAU_VAN, GHI_CHU_PHAN_UNG };
  if (typeof module === 'object' && module.exports) module.exports = DATA;
  else root.PitchData = DATA;
})(typeof self !== 'undefined' ? self : this);
