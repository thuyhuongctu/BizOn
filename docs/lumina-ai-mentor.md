# Lumina AI Mentor – API, Database & Logic "Nếu – Thì"

Module Cố vấn AI Lumina (Je m'appelle Hương): kết nối giao diện người chơi với
hệ thống kịch bản và cơ sở dữ liệu AI. Bản prototype hiện thực thi logic này
**client-side** trong `js/engine.js` (`whatIfSimulate`, `luminaAdvice`).

## 1. API Endpoints (backend dự kiến)

Base URL: `/v1/ai` · Auth: Bearer JWT

| Endpoint | Mô tả |
|---|---|
| `GET /advisor/consult?role=` | Tư vấn chiến thuật theo vai trò (CEO/CFO/CMO/COO/SEC) – quét dữ liệu, chọn kịch bản từ `ai_scenarios_logic` |
| `POST /advisor/simulate` | Chạy mô phỏng "Nếu – Thì" với thông số giả định trước khi Commit |
| `GET /usage/status` | Số lượt còn lại: `consult_limit` = 3, `what_if_limit` = 2 mỗi vòng |
| `GET /advisor/history` | Nhật ký tư vấn – nguồn cho "Bộ nhớ doanh nghiệp" (SEC) |

Mã lỗi riêng: `ERR_AI_LIMIT_REACHED`, `ERR_AI_INSUFFICIENT_DATA`, `ERR_AI_SIMULATION_FAILED`.

## 2. Database (PostgreSQL)

- **`ai_advisor_history`** – mỗi lời thoại của Hương: `role_target`, `context_json`
  (chụp nhanh số liệu), `ai_message`, `recommendations` (JSONB), `risk_level`
  (Low/Medium/High/Critical).
- **`ai_usage_limits`** – `consult_count`, `what_if_count` theo (team, round), UNIQUE.
- **`ai_scenarios_logic`** – kịch bản trigger-based: `trigger_condition`
  (vd `liquidity_ratio < 1.0`), `priority`, `template_vietnam`, `template_global`,
  `suggested_actions`. Seed mẫu: *Cash Crunch*, *Price War Defense*.

Script khởi tạo đầy đủ: xem bản SQL trong hồ sơ handoff (enum `advisor_role`,
`risk_level`, index theo team+round).

## 3. Logic What-If Analysis

### CEO – STRATEGIC_OVERVIEW (đánh đổi nguồn lực)
- Input: `hypothetical_price`, `hypothetical_marketing`, `hypothetical_expansion`, `hypothetical_training`.
- Dự báo thị phần: `Delta_Share = (Mkt_Spend × Ad_Efficiency) − (Price_Gap × Price_Sensitivity)`.
- Điểm hòa vốn mới khi mở rộng: chi phí cố định tăng (khấu hao), biến phí giảm (tự động hóa).
- Kết luận mẫu: `VIABLE_BUT_RISKY` – "chiếm thêm X% thị phần nhưng lợi nhuận âm – bạn có sẵn sàng đánh đổi?"

### CFO – FINANCIAL_STRESS_TEST (an toàn tài chính)
- Input: `hypothetical_loan_amount`, `hypothetical_payment_term`, `hypothetical_cost_cut`, `hypothetical_dividend`.
- **Quick Ratio** = (Tiền mặt + Phải thu − Chi dự kiến) / Nợ ngắn hạn – **cảnh báo khi < 1.1**.
- **Đòn bẩy**: `ROI_hypothetical > Interest_Rate` → "Đòn bẩy hiệu quả"; ngược lại → "Cảnh báo mòn vốn".
- Output chuẩn: `projected_cash_balance`, `projected_quick_ratio`, `interest_coverage_ratio`, `wacc`, `lumina_verdict {status, primary_warning, strategic_tip}`.

## 4. Triển khai trong prototype

- Nút **🔮 Mô phỏng "Nếu – Thì"** trong màn hình Quyết định: 2 chế độ (CEO/CFO),
  dùng đúng thông số các slider hiện tại, giới hạn **2 lượt/vòng**.
- Kết quả: badge trạng thái (AN TOÀN / KHẢ THI NHƯNG RỦI RO / NGUY CƠ MẤT THANH
  KHOẢN...), bảng chỉ số, lời thoại Hương theo mẫu tài liệu.
- **Bộ nhớ doanh nghiệp**: mọi lời tư vấn được lưu (`advisorHistory`, tối đa 20
  bản ghi) và hiển thị trong tab Advisor – mô phỏng bảng `ai_advisor_history`.
