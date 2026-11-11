/* BizOn – Bến BizOn: câu hỏi nhanh ở mỗi điểm game (đặc tả specs/003-ben-bizon-nhiem-vu, câu chuyện 3).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Sáu câu trắc nghiệm 3 lựa chọn, soạn từ dòng mô tả trên thẻ của từng điểm (js/ben-bizon.js, mảng NOI). Câu hỏi chỉ hỏi
 * game dạy gì, thuộc bậc nào, chơi bao lâu; không hỏi kiến thức kinh doanh chấm điểm, để không trùng rubric của từng game
 * (docs/chuan-dau-ra-va-rubric.md). Trả lời sai chỉ hiện gợi ý chỗ đọc lại, không lộ đáp án; không giới hạn số lần thử,
 * không tính điểm. Câu chữ chờ chị duyệt trong PR của câu chuyện 3.
 * dung: chỉ số (0–2) của lựa chọn đúng trong mảng chon.
 */
const GOI_Y_THE = { vi: 'Đọc lại dòng mô tả trên thẻ của điểm này rồi chọn lại nhé.', en: 'Read the line on this spot\'s card again, then try another answer.' };

export const CAU_HOI = {
  'ben-phu-sa': {
    hoi: { vi: 'Ở Bến Phù Sa, bạn làm gì?', en: 'What do you do at Bến Phù Sa?' },
    chon: [
      { vi: 'Bậc 1: khởi sự kinh doanh trên ghe chợ nổi trong 5 tuần', en: 'Tier 1: start a business on a floating-market boat in 5 weeks' },
      { vi: 'Bậc 2: điều hành trụ sở công ty qua sáu vòng', en: 'Tier 2: run a company head office over six rounds' },
      { vi: 'Bậc 3: đưa thương hiệu Việt tới bảy thị trường', en: 'Tier 3: take a Vietnamese brand to seven markets' },
    ],
    dung: 0,
    goiY: { vi: 'Gợi ý: thẻ ghi bậc mấy và nói tới chiếc ghe nào?', en: 'Hint: which tier does the card name, and which boat?' },
  },
  'bat-nghiep': {
    hoi: { vi: 'Ở Bật Nghiệp, ai điều hành doanh nghiệp và trong bao lâu?', en: 'In Bật Nghiệp, who runs the company, and for how long?' },
    chon: [
      { vi: 'Một người chơi, trong 5 tuần', en: 'One player, for 5 weeks' },
      { vi: 'Năm vai trong đội, qua sáu vòng', en: 'Five roles in a team, over six rounds' },
      { vi: 'Bảy đội thi với nhau, qua bảy thị trường', en: 'Seven competing teams, across seven markets' },
    ],
    dung: 1,
    goiY: { vi: 'Gợi ý: thẻ Bật Nghiệp ghi có mấy vai và mấy vòng?', en: 'Hint: how many roles and rounds does the Bật Nghiệp card mention?' },
  },
  'hc-thuong-hieu': {
    hoi: { vi: 'Hộ Chiếu Thương Hiệu đưa thương hiệu Việt tới bao nhiêu thị trường?', en: 'How many markets does Brand Passport take a Vietnamese brand to?' },
    chon: [
      { vi: 'Ba thị trường', en: 'Three markets' },
      { vi: 'Năm thị trường', en: 'Five markets' },
      { vi: 'Bảy thị trường', en: 'Seven markets' },
    ],
    dung: 2,
    goiY: { vi: 'Gợi ý: con số nằm ngay trong dòng mô tả của con tàu ra khơi.', en: 'Hint: the number is right in the line about the outbound ship.' },
  },
  'hc-sau-rieng': {
    hoi: { vi: 'Hộ Chiếu Sầu Riêng thuộc bậc nào của hành trình?', en: 'Which tier of the journey is Durian Passport?' },
    chon: [
      { vi: 'Bậc 1: khởi sự', en: 'Tier 1: starting up' },
      { vi: 'Bậc 2: điều hành', en: 'Tier 2: running a company' },
      { vi: 'Bậc 3: xuất khẩu ra thế giới', en: 'Tier 3: exporting to the world' },
    ],
    dung: 2,
    goiY: { vi: 'Gợi ý: đưa trái sầu riêng đi đâu? Thẻ ghi bậc ở đầu dòng.', en: 'Hint: where does the durian go? The card names the tier at the start of the line.' },
  },
  'arcade': {
    hoi: { vi: 'Mỗi trò ở BizOn Arcade chơi trong khoảng bao lâu?', en: 'How long does each BizOn Arcade game take?' },
    chon: [
      { vi: 'Vài phút', en: 'A few minutes' },
      { vi: 'Cả một buổi học', en: 'A whole class session' },
      { vi: 'Năm tuần', en: 'Five weeks' },
    ],
    dung: 0,
    goiY: { vi: 'Gợi ý: nhà sàn này có các trò chơi nhỏ.', en: 'Hint: this stilt house holds mini games.' },
  },
  'hanh-trinh': {
    hoi: { vi: 'Hành trình 3 bậc đi theo thứ tự nào?', en: 'In what order does the 3-tier journey go?' },
    chon: [
      { vi: 'Thế giới → Bật Nghiệp → Phù Sa', en: 'The world → Bật Nghiệp → Phù Sa' },
      { vi: 'Phù Sa → Bật Nghiệp → ra Thế giới', en: 'Phù Sa → Bật Nghiệp → out to the world' },
      { vi: 'Bật Nghiệp → Thế giới → Phù Sa', en: 'Bật Nghiệp → the world → Phù Sa' },
    ],
    dung: 1,
    goiY: { vi: 'Gợi ý: thẻ ghi «Từ … ra …»: hành trình bắt đầu ở đâu?', en: 'Hint: the card says «From … to …»: where does the journey start?' },
  },
};

export const CHU_CAU_HOI = {
  nut: { vi: '❓ Câu hỏi nhanh', en: '❓ Quick quiz' },
  tieuDe: { vi: '❓ Câu hỏi nhanh', en: '❓ Quick quiz' },
  dung: { vi: '✅ Đúng rồi!', en: '✅ That\'s right!' },
  sai: { vi: 'Chưa đúng. ', en: 'Not quite. ' },
  theChung: GOI_Y_THE,
};
