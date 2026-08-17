# Cấu hình chế độ lớp học (cohort) + telemetry — Học kỳ demo HK1 2026–2027

> Phạm vi **tối thiểu khả dụng cho buổi 0 (kỹ thuật)**, làm ở mức config/thay đổi nhỏ,
> tránh refactor lớn. Đây là **PR B** trong Task Brief. PR A (thoại Lumina) tách riêng.
> © 2026 Đỗ Thùy Hương & Phan Anh Tú.

## Đã có sẵn trong repo (không dựng lại)

| Hạ tầng | Nơi | Ghi chú |
|---|---|---|
| Lược đồ telemetry theo vòng | `js/decision-log.js` | `cohort_id` (mã lớp), `team_id` **băm**, `round`, `decision`, `timestamp`, `snapshot_hash`… |
| Cổng đồng thuận hai mục đích | `js/decision-log.js` | research/product tách riêng; mặc định **tắt** → không ghi gì |
| Xuất CSV một thao tác | `js/decision-log.js` → `toCSV()` | cột theo lược đồ, **không** chứa danh tính |
| Seed thị trường tất định | `js/core/seed-engine.js` | `createSeed(classId, teamId, scenarioId, ver)` + RNG mulberry32 |

## Bổ sung trong PR này (nhỏ, có test)

1. **`session_tag`** — trường tự do gắn mỗi phiên (vd `kt330-l01-b1`, `mekong-20260926`),
   lưu kèm telemetry, **không** bắt buộc, **không** chứa danh tính (chặn bởi bộ lọc PII sẵn có).
   Tự động có trong CSV xuất ra. Ngày trong tag dùng **`YYYYMMDD`** (không dùng `DDMM` — thiếu
   năm sẽ trùng khóa sau 12 tháng).
2. **Khóa seed theo lớp** — `Seed.createCohortSeed(classId, scenarioId, ver)`: bỏ `teamId`
   để **mọi nhóm cùng mã lớp chạy CÙNG kịch bản thị trường** (buổi 3–4 so sánh công bằng).
3. **Preset vòng rút gọn** — `js/demo-presets.js`: `demo-basic` (mở 3 biến: giá · sản lượng ·
   marketing, cho buổi 1 "tạo phấn khởi") và `demo-full` (đủ biến, buổi 2–4). Chọn preset theo phiên.
   Bất biến: `demo-basic ⊆ demo-full` (kiểm trong test).
4. **View tổng hợp theo lớp** — `DecisionLog.entriesByCohort()` / `groupByCohort()` /
   `filterBySessionTag()`: gom bản ghi theo `cohort_id` cho bảng của giảng viên.

Test: `test/hk1-demo-config.test.js` (chạy `node --test`).

## Ràng buộc riêng tư (giữ nguyên)

- **Không** lưu họ tên/email trong bảng phân tích — chỉ `team_id` đã băm.
- **Đây là bí danh hoá (pseudonymized), KHÔNG phải ẩn danh (anonymous).** Băm `team_id`
  không biến dữ liệu thành vô danh: với 6–8 đội một lớp, giảng viên vẫn biết đội nào là đội nào.
  Trong code và tài liệu dùng đúng chữ **pseudonymized**; không mô tả là "anonymous/ẩn danh"
  ở bất kỳ đâu. (Mô tả trong phiếu đồng thuận do chủ dự án tự chỉnh.)
- Ghi thật chỉ diễn ra khi **bật cờ đồng thuận** (đang tắt); trước đó `record()` bỏ qua.
- `session_tag` phải là chuỗi kỹ thuật (vd `kt330-l01-b1`, `mekong-20260926`), không nhét danh tính.

## Chưa làm trong PR này — tách issue riêng

- **Nút "tạm dừng toàn lớp"** (giảng viên chốt điểm debrief): cần đồng bộ thời gian thực
  giữa các phòng nhóm (Supabase Realtime), vượt phạm vi "thay đổi nhỏ" → **tách thành issue
  riêng** thay vì nhồi vào PR này (theo đúng Task Brief mục 6).

## Điểm cần Hương/thầy xác nhận

- Tên khóa biến quyết định trong `demo-presets.js` (`gia`, `san_luong`, `marketing`, …) cần
  khớp đúng khóa engine đang dùng khi nối vào phần hiển thị biến — hiện là hợp đồng đề xuất.
- Quy ước đặt `session_tag` cho từng lớp/buổi (đề xuất: `kt330-l<NN>-b<N>`, `mekong-<YYYYMMDD>`).
