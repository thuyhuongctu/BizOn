/* BizOn — Rubric chấm bài tình huống trước – sau (R3): tiêu chí, mốc điểm 0–2, bản VI/EN.
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Chấm phần LÝ DO của 5 tình huống trắc nghiệm (mỗi tình huống một tiêu chí theo cơ chế, 0–2) và CÂU GIẢI THÍCH CƠ CHẾ
 * (4 tiêu chí, mỗi tiêu chí 0–2). Người chấm không thấy giai đoạn (trước/sau) và điều kiện lớp (hộp đen/hiện) – chấm mù.
 * Lựa chọn trắc nghiệm không chấm tay: cột `aligned` trong CSV đã tính sẵn (R2).
 * Tổng: lý do 0–10 · giải thích 0–8 · lựa chọn hợp lý thuyết 0–5 → chất lượng quyết định 0–23.
 * Đổi tiêu chí hoặc mốc = tăng VERSION và ghi vào docs/architecture/RUBRIC-CHAM-TINH-HUONG.md. */
(function (root) {
  'use strict';
  const VERSION = 'rb-v1';
  // Tiêu chí cho phần lý do, theo cơ chế của tình huống (xem js/case-task-data.js)
  const WHY = {
    uppsala: { key: 'why', vi: { name: 'Lý do nêu cơ chế tri thức → cam kết', a0: 'Không nêu cơ chế; dựa vào cơ hội, vốn sẵn hoặc cảm tính.', a1: 'Nhắc tri thức/kinh nghiệm thị trường hoặc rủi ro nhưng chung chung, không nối với mức cam kết.', a2: 'Nêu rõ cam kết phải tăng theo tri thức thị trường (học qua kênh hiện có trước), và rủi ro cụ thể khi nhảy cóc.' },
      en: { name: 'Reason states the knowledge → commitment mechanism', a0: 'No mechanism; relies on opportunity, available capital or gut feeling.', a1: 'Mentions market knowledge/experience or risk in general terms, not linked to the commitment level.', a2: 'States clearly that commitment should follow market knowledge (learn through the current channel first) and names a concrete risk of leaping.' } },
    outsidership: { key: 'why', vi: { name: 'Lý do nêu vị trí trong mạng lưới', a0: 'Chỉ nói về giá, quảng cáo hoặc chất lượng sản phẩm.', a1: 'Nhắc "quan hệ" hoặc "được giới thiệu" nhưng không nêu vì sao người ngoài cuộc không bán được.', a2: 'Nêu rõ người mua chỉ giao dịch trong mạng lưới quen, cần vị trí người trong cuộc qua đối tác đã có quan hệ, và chấp nhận chi phí ban đầu để vào.' },
      en: { name: 'Reason states network position', a0: 'Only price, advertising or product quality.', a1: 'Mentions "relationships" or "being introduced" without saying why an outsider cannot sell.', a2: 'States that buyers trade only inside known networks, that an insider position via a connected partner is needed, and that an entry cost is accepted.' } },
    void: { key: 'why', vi: { name: 'Lý do nêu khoảng trống thể chế và cách lấp', a0: 'Tin vào hợp đồng hoặc vào đối tác; hoặc từ chối không nêu lý do.', a1: 'Nhắc rủi ro thanh toán hoặc trung gian nhưng không nối với việc thiếu toà án/thông tin tín dụng.', a2: 'Nêu rõ thiếu thể chế (toà án chậm, không có thông tin tín dụng) nên hợp đồng ít giá trị, phải dùng trung gian/bảo lãnh thay thế và tăng dần.' },
      en: { name: 'Reason states the institutional void and how to fill it', a0: 'Trusts the contract or the partner; or refuses without a reason.', a1: 'Mentions payment risk or an intermediary without linking it to missing courts/credit information.', a2: 'States that missing institutions (slow courts, no credit information) make contracts weak, so substitutes (intermediary, guarantee) and gradual scaling are needed.' } },
    'eff-high': { key: 'why', vi: { name: 'Lý do nêu bất định cao → effectuation', a0: 'Ủng hộ kế hoạch/dự báo/chờ nhà đầu tư; hoặc không có lý do.', a1: 'Nói "thử nhỏ trước" nhưng không nêu vì sao (bất định, chưa biết khách).', a2: 'Nêu rõ chưa biết thị trường nên bắt đầu từ phương tiện sẵn có, giới hạn tổn thất chấp nhận được và học qua phản hồi thay vì dự báo.' },
      en: { name: 'Reason states high uncertainty → effectuation', a0: 'Favors planning/forecasting/waiting for investors; or no reason.', a1: 'Says "try small first" without saying why (uncertainty, unknown customers).', a2: 'States that the market is unknown, so start from available means, cap the affordable loss and learn from feedback instead of forecasting.' } },
    'eff-low': { key: 'why', vi: { name: 'Lý do nêu có số liệu → causation', a0: 'Dựa vào cảm giác, bắt chước đối thủ hoặc "cứ thử".', a1: 'Nói cần tính toán nhưng không nêu vì sao ở đây tính được (số liệu ổn định, bất định thấp).', a2: 'Nêu rõ có số liệu nhiều năm và đơn đặt trước nên dự báo được; đầu tư lớn, khó đảo ngược nên cần hoà vốn/NPV và kế hoạch.' },
      en: { name: 'Reason states data available → causation', a0: 'Gut feeling, imitating competitors or "just try".', a1: 'Says calculation is needed without saying why it works here (stable data, low uncertainty).', a2: 'States that years of data and advance orders make forecasting possible; a large, irreversible investment needs break-even/NPV and a plan.' } }
  };
  // Bốn tiêu chí cho câu giải thích cơ chế (item x)
  const EXPLAIN = [
    { key: 'x1', vi: { name: 'Cơ chế tri thức → cam kết', a0: 'Không nêu.', a1: 'Nhắc "chưa hiểu thị trường" nhưng không nối với mức cam kết.', a2: 'Nêu rõ cam kết đi trước tri thức thị trường dẫn đến quyết định sai về sản phẩm, giá, kênh; tri thức kinh nghiệm chỉ có được qua hoạt động dần.' },
      en: { name: 'Knowledge → commitment mechanism', a0: 'Absent.', a1: 'Mentions "not understanding the market" without linking it to the commitment level.', a2: 'States that commitment ahead of market knowledge leads to wrong product, price and channel decisions; experiential knowledge only comes from gradual activity.' } },
    { key: 'x2', vi: { name: 'Mạng lưới và bất lợi người ngoài cuộc', a0: 'Không nêu.', a1: 'Nhắc "chưa có quan hệ" chung chung.', a2: 'Nêu rõ chưa có vị trí trong mạng lưới nên không được tin, không tiếp cận được nhà phân phối/khách; kho và công ty con không thay được vị trí đó.' },
      en: { name: 'Network and liability of outsidership', a0: 'Absent.', a1: 'Mentions "no relationships" in general.', a2: 'States that without a network position the firm is not trusted and cannot reach distributors/customers; a warehouse or subsidiary does not substitute for that position.' } },
    { key: 'x3', vi: { name: 'Hệ quả cụ thể', a0: 'Không nêu hệ quả hoặc chỉ nói "thất bại".', a1: 'Nêu một hệ quả chung (lỗ, rủi ro).', a2: 'Nêu hệ quả cụ thể và có cơ chế: chi phí cố định/chìm lớn, hàng tồn, dòng tiền âm, rút lui tốn kém, học chậm vì không có phản hồi thật.' },
      en: { name: 'Concrete consequences', a0: 'No consequence, or just "failure".', a1: 'One general consequence (loss, risk).', a2: 'Specific, mechanism-based consequences: large fixed/sunk costs, inventory, negative cash flow, costly exit, slow learning without real feedback.' } },
    { key: 'x4', vi: { name: 'Cách giảm rủi ro', a0: 'Không nêu hoặc chỉ "cẩn thận hơn".', a1: 'Nêu một cách (ví dụ thử nhỏ) không giải thích.', a2: 'Nêu cách giảm rủi ro gắn với cơ chế: vào dần theo bậc cam kết (đại lý → văn phòng → công ty con), đi qua đối tác trong cuộc, học thị trường trước, giới hạn tổn thất ở mỗi bước.' },
      en: { name: 'Risk reduction', a0: 'Absent, or just "be more careful".', a1: 'One way (e.g. start small) without explanation.', a2: 'Mechanism-linked risk reduction: enter by commitment steps (agent → office → subsidiary), go through an insider partner, learn the market first, cap the loss at each step.' } }
  ];
  const LEVELS = [0, 1, 2];
  const MAX = { why: 10, explain: 8, aligned: 5, total: 23 };
  const API = { VERSION, WHY, EXPLAIN, LEVELS, MAX,
    // Danh sách tiêu chí của một câu trả lời: item trắc nghiệm → [tiêu chí why theo cơ chế]; item x → 4 tiêu chí
    criteriaFor: (mech) => (mech === 'explain' ? EXPLAIN : (WHY[mech] ? [WHY[mech]] : [])),
    criterionKeys: () => ['why', ...EXPLAIN.map(c => c.key)] };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.BizOnCaseRubric = API;
})(typeof window !== 'undefined' ? window : globalThis);
