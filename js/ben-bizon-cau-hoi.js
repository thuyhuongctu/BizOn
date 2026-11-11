/* BizOn – Bến BizOn: câu hỏi nhanh ở mỗi điểm game (đặc tả specs/003-ben-bizon-nhiem-vu, câu chuyện 3).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Sáu câu trắc nghiệm 3 lựa chọn, soạn từ dòng mô tả trên thẻ của từng điểm (js/ben-bizon.js, mảng NOI). Câu hỏi chỉ hỏi
 * game dạy gì, thuộc bậc nào, chơi bao lâu; không hỏi kiến thức kinh doanh chấm điểm, để không trùng rubric của từng game
 * (docs/chuan-dau-ra-va-rubric.md). Trả lời sai chỉ hiện gợi ý chỗ đọc lại, không lộ đáp án; không giới hạn số lần thử,
 * không tính điểm. Câu chữ chờ chị duyệt trong PR của câu chuyện 3.
 * dung: chỉ số (0–2) của lựa chọn đúng trong mảng chon.
 */
export const CAU_HOI = {
  'ben-phu-sa': {
    hoi: { vi: 'Ở Bến Phù Sa, bạn sẽ làm gì?', en: 'What will you do at Bến Phù Sa?' },
    chon: [
      { vi: 'Bậc 1: khởi sự kinh doanh trên ghe chợ nổi trong 5 tuần', en: 'Tier 1: start a business on a floating-market boat in 5 weeks' },
      { vi: 'Bậc 2: điều hành công ty tại trụ sở qua sáu vòng', en: 'Tier 2: run a company from its head office over six rounds' },
      { vi: 'Bậc 3: đưa thương hiệu Việt ra bảy thị trường', en: 'Tier 3: take a Vietnamese brand to seven markets' },
    ],
    dung: 0,
    goiY: { vi: 'Gợi ý: thẻ ghi bậc mấy, và nhắc tới loại ghe nào?', en: 'Hint: which tier does the card name, and what kind of boat?' },
  },
  'bat-nghiep': {
    hoi: { vi: 'Ở Bật Nghiệp, ai cùng điều hành doanh nghiệp, và qua bao nhiêu vòng?', en: 'In Bật Nghiệp, who runs the company, and for how many rounds?' },
    chon: [
      { vi: 'Một người chơi một mình, trong 5 tuần', en: 'One player alone, for 5 weeks' },
      { vi: 'Năm vai điều hành trong một đội, qua sáu vòng', en: 'Five executive roles in one team, over six rounds' },
      { vi: 'Bảy đội đấu với nhau, qua bảy thị trường', en: 'Seven rival teams, across seven markets' },
    ],
    dung: 1,
    goiY: { vi: 'Gợi ý: thẻ Bật Nghiệp nhắc tới mấy vai và mấy vòng?', en: 'Hint: how many roles and rounds does the Bật Nghiệp card mention?' },
  },
  'hc-thuong-hieu': {
    hoi: { vi: 'Trong Hộ Chiếu Thương Hiệu, bạn đưa thương hiệu Việt ra bao nhiêu thị trường?', en: 'In Brand Passport, how many markets do you take a Vietnamese brand to?' },
    chon: [
      { vi: 'Ba thị trường', en: 'Three markets' },
      { vi: 'Năm thị trường', en: 'Five markets' },
      { vi: 'Bảy thị trường', en: 'Seven markets' },
    ],
    dung: 2,
    goiY: { vi: 'Gợi ý: con số nằm ngay trong dòng mô tả «con tàu ra khơi».', en: 'Hint: the number is right in the line about «the outbound ship».' },
  },
  'hc-sau-rieng': {
    hoi: { vi: 'Hộ Chiếu Sầu Riêng thuộc bậc nào trong Hành trình 3 bậc?', en: 'Which tier of the 3-tier journey is Durian Passport?' },
    chon: [
      { vi: 'Bậc 1: khởi sự kinh doanh', en: 'Tier 1: starting a business' },
      { vi: 'Bậc 2: điều hành doanh nghiệp', en: 'Tier 2: running a company' },
      { vi: 'Bậc 3: xuất khẩu ra thế giới', en: 'Tier 3: exporting to the world' },
    ],
    dung: 2,
    goiY: { vi: 'Gợi ý: trái sầu riêng được đưa đi đâu? Bậc được ghi ở đầu dòng mô tả.', en: 'Hint: where does the durian go? The tier is named at the start of the card\'s line.' },
  },
  'arcade': {
    hoi: { vi: 'Mỗi trò chơi ở BizOn Arcade kéo dài khoảng bao lâu?', en: 'About how long does each BizOn Arcade game last?' },
    chon: [
      { vi: 'Vài phút', en: 'A few minutes' },
      { vi: 'Trọn một buổi học', en: 'A whole class session' },
      { vi: 'Năm tuần', en: 'Five weeks' },
    ],
    dung: 0,
    goiY: { vi: 'Gợi ý: đây là nhà sàn của các trò chơi nhỏ.', en: 'Hint: this stilt house is home to mini games.' },
  },
  'hanh-trinh': {
    hoi: { vi: 'Hành trình 3 bậc đi theo thứ tự nào?', en: 'In what order does the 3-tier journey go?' },
    chon: [
      { vi: 'Thế giới → Bật Nghiệp → Phù Sa', en: 'The world → Bật Nghiệp → Phù Sa' },
      { vi: 'Phù Sa → Bật Nghiệp → Thế giới', en: 'Phù Sa → Bật Nghiệp → the world' },
      { vi: 'Bật Nghiệp → Thế giới → Phù Sa', en: 'Bật Nghiệp → the world → Phù Sa' },
    ],
    dung: 1,
    goiY: { vi: 'Gợi ý: thẻ ghi «Từ … ra …». Hành trình bắt đầu từ đâu?', en: 'Hint: the card says «From … to …». Where does the journey begin?' },
  },
};

export const CHU_CAU_HOI = {
  nut: { vi: '❓ Câu hỏi nhanh', en: '❓ Quick quiz' },
  tieuDe: { vi: '❓ Câu hỏi nhanh', en: '❓ Quick quiz' },
  dung: { vi: '✅ Đúng rồi!', en: '✅ That\'s right!' },
  sai: { vi: 'Chưa đúng. ', en: 'Not quite. ' },
};
