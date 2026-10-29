# Kịch bản Bật Nghiệp Bậc 2 · Cù lao Tân Lộc: bốn homestay, sáu mùa

> Tài liệu thiết kế, bản phác thảo 1 (chuyển từ bản mẫu «Bat Nghiep Tan Loc Scenario», 10/2026).
> Bản chơi thử: [`cham/dau-truong.html`](../../cham/dau-truong.html). Engine: `arena*` trong [`js/cham-engine.js`](../../js/cham-engine.js).
> CHAM™ và nội dung tình huống © 2017–2026 Đỗ Thùy Hương, dùng trên BizOn theo giấy phép không độc quyền.

Bốn đội cùng vận hành bốn homestay trên một cù lao. Bối cảnh, giá và chi phí gốc lấy từ kế hoạch CHAM. Các tham số engine dưới đây là **đề xuất ban đầu**, cần hiệu chỉnh khi chạy thử với lớp thật.

## A1. Mục tiêu học tập

1. **Định giá theo mùa** – cân đối giá phòng, vé và công suất khi nhu cầu thay đổi theo mùa.
2. **Chi phí và hòa vốn** – đọc định phí, biến phí và tính hòa vốn trên đúng khoản vốn.
3. **Cạnh tranh khi rào cản thấp** – phản ứng khi đối thủ sao chép mô hình trên cùng cù lao.
4. **Rủi ro mùa nước** – lập kế hoạch dòng tiền cho mùa thấp điểm và sự cố môi trường.

## A2. Thiết lập ván chơi

| Mục | Giá trị | Ghi chú |
|---|---|---|
| Số đội | 4 đội, mỗi đội 3–5 người | CHAM, Homestay Cẩm Lụa (đối thủ có thật ở khu vực Long Châu: phòng 250.000–450.000 đ/đêm, mâm cơm 100.000–150.000 đ/người) và hai cơ sở giả định (Sơn Ca Garden, Green Lộc Retreat). Bản mẫu hiện tại: ba đội còn lại do máy điều khiển. |
| Tài sản ban đầu | 6 phòng · vốn lưu động 500 triệu đ | Đất và nhà (3,5 tỷ) tính vào vốn đầu tư phải thu hồi. |
| Thị trường chung | ≈ 7.200 khách/mùa cho cả cù lao | Mỗi đội trung bình 1.800 khách/mùa. |
| Dịch vụ thay thế | Khách sạn bên kia sông | Khách sạn ở Thốt Nốt khoảng 300.000–350.000 đ/đêm, cách 5–10 phút đò. Giá phòng trên cù lao vượt mức này thì một phần khách ngủ ở bờ. |
| Thời lượng | 6 vòng · 15–20 phút/vòng | Vừa hai buổi học, hoặc một buổi dài kèm debrief. |

## A3. Sáu vòng = sáu mùa

| Vòng | Tháng | Mùa | Hệ số khách | Sự kiện |
|---|---|---|---|---|
| 1 | T3–5 | Khai trương | ×1,0 | Mùa hoa cúc la mã; đội chọn chiến dịch ra mắt. |
| 2 | T6–8 | Hè cao điểm | ×1,4 | Học sinh, sinh viên nghỉ hè. |
| 3 | T9–11 | Mùa nước nổi | ×0,6 | Sạt lở một đoạn bờ, mỗi đội chi 60 triệu đ sửa chữa. |
| 4 | T12–2 | Tết | ×1,2 | Đặc sản mang về bán gấp đôi. |
| 5 | T3–5 năm 2 | Đối thủ thứ năm | ×1,0 (thị trường còn 90%) | Một hộ dân mở homestay giá rẻ, giành 10% thị trường. |
| 6 | T6–8 năm 2 | Tái cao điểm | ×1,4 | Nhận biết và chất lượng tích lũy quyết định kết quả. |

Tháng của mùa nước nổi là giả định, **cần xác nhận**.

## A4. Năm cần gạt mỗi vòng

| Cần gạt | Khoảng | Tác động |
|---|---|---|
| Giá phòng/đêm | 50.000–800.000 đ (kế hoạch: 50.000; trang tình huống: 500.000) | Giá cao giảm sức hút, tăng doanh thu mỗi đêm. |
| Giá vé vào cổng | 30.000–150.000 đ (kế hoạch: 80.000) | Ảnh hưởng lượt khách ngày và doanh thu ăn uống kéo theo. |
| Marketing | 0–60 triệu đ/vòng | Tăng nhận biết; nhận biết giảm 30% mỗi vòng nếu không duy trì. |
| Nhân sự | 6–14 nhân viên; trả hay không trả lương 4 quản lý | Tỷ lệ nhân viên/khách quyết định điểm chất lượng. |
| Sản phẩm mới | Đêm nhạc tài tử 20, lớp nấu ăn 15, chụp ảnh cưới/kỷ yếu 10, đặc sản 25 (triệu đ, một lần) | +8 / +6 / +5 / +5% sức hút; đặc sản nhân đôi doanh thu đặc sản. |

## A5. Engine tất định (đề xuất)

Đơn vị: giá phòng và vé tính bằng nghìn đồng, tiền tính bằng triệu đồng.

```
giá_i        = vé_i + 5% × giá_phòng_i
nhận_biết_i  ← min(1; 0,7 × nhận_biết_i + marketing_i / 60)
chất_lượng_i = clamp(nhân_viên_i / 10; 0,6; 1,2) × (1,05 nếu trả lương quản lý, ngược lại 0,95)
sức_hút_i    = (giá_TB / giá_i)^1,2 × (0,4 + 0,6 × nhận_biết_i) × chất_lượng_i × (1 + Σ tăng sức hút sản phẩm)
khách_i      = 7.200 × hệ_số_mùa × sức_hút_i / Σ sức_hút
tỷ_lệ_ở_lại_i= min(60%; 30% × (giá_phòng_TB / giá_phòng_i)^0,8) × hệ_số_khách_sạn_i
               hệ_số_khách_sạn_i = 1 nếu giá phòng ≤ 350.000 đ, ngược lại max(0,5; 1 − (giá − 350)/900)
đêm_phòng_i  = min(khách_i × tỷ_lệ_ở_lại_i / 2,5; 546)
doanh_thu_i  = khách_i × vé + khách_i × 150 (ăn uống) + đêm_phòng_i × giá_phòng + khách_i × 20 × hệ_số_đặc_sản
chi_phí_i    = nhân_viên × 2,77 × 3 + (96 nếu trả lương quản lý) + 60 + 90 + 30% ăn uống + 40.000 đ/khách
               + 60.000 đ × (khách vượt 200 × nhân viên) + marketing + đầu tư sản phẩm + (60 nếu mùa nước)
```

Cùng đầu vào cho cùng kết quả (không có số ngẫu nhiên). Chạy thử 2026 với mặc định, chỉ đổi giá phòng: giá tốt nhất nằm khoảng 200.000–350.000 đ.

## A6. Chỉ số cuối vòng

Doanh thu · lợi nhuận · lợi nhuận lũy kế so với 4 tỷ · công suất phòng · thị phần · nhận biết.

## A7. Lumina gợi câu hỏi

Gắn với năm phát hiện trong Thẩm định kế hoạch. Ví dụ, khi đội tính hòa vốn trên 500 triệu: “Đất và nhà 3,5 tỷ đã nằm trong phép tính chưa?”. Danh sách gợi ý: `arenaHints()` trong engine, chữ ở `js/cham-arena.js`.

## A8. Rubric (100 điểm)

Kết quả tài chính 30 · Lập luận định giá 25 · Ứng phó mùa nước 20 · Khác biệt hóa trước đối thủ 15 · Phản tư cuối ván 10.

## A9. Nối hành trình

Nhận từ Bậc 1: độ nhận biết và vốn lưu động có trần. Trao cho Bậc 3: dòng đặc sản (trà cúc, mắm cá tra) làm sản phẩm xuất khẩu.

## Phần B · Thư viện tình huống

BizOn học cấu trúc thư viện tình huống trên web (lọc theo ngành học và khu vực, mục tiêu học tập xây cùng giảng viên), nhưng giữ khác biệt riêng: **mỗi tình huống có một mô phỏng chơi được và một bản soát số liệu**. Trang đầu tiên: [`thu-vien-tinh-huong.html`](../../thu-vien-tinh-huong.html) với 3 case (CHAM, Bến Phù Sa, Hộ Chiếu Sầu Riêng).

- Phân loại theo ngành học và vùng (ĐBSCL, Việt Nam, ASEAN).
- Trang case: tóm tắt, dữ kiện, câu hỏi.
- Ghi chú giảng dạy (kế hoạch buổi học, đáp án gợi ý, rubric) chỉ mở khi đăng nhập giảng viên — **chưa làm**, hiện nằm công khai ở Bộ công cụ giảng dạy.
- Nguồn case: kế hoạch thật của sinh viên trong học phần Khởi sự doanh nghiệp, **chỉ khi có đồng ý của tác giả**.
- Mạng lưới: mời giảng viên trong vùng viết và phản biện case, ghi công trên trang.
