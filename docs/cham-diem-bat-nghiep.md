# Tiêu chí chấm điểm — BizOn Bật Nghiệp

**Ngày:** 23/09/2026 · **Dùng cho:** lớp KT330H (Khởi sự doanh nghiệp) và các lớp dùng game Bật Nghiệp

> Bản trích gọn, dùng ngay được, rút từ tài liệu đầy đủ `docs/chuan-dau-ra-va-rubric.md` (§4.1) trong repo BizOn.

---

## 1 · Cơ cấu điểm học phần

| Thành phần | Trọng số | Nguồn |
|---|:-:|---|
| Lợi nhuận lũy kế | **45%** | Tự động – báo cáo P&L cuối ván |
| Số cờ chinh phục (thắng thị phần vòng **và** có lãi) | **35%** | Tự động – Bản đồ chinh phục |
| Hợp tác vai trò & Bài học rút ra | **20%** | Giảng viên chấm – rubric ở Mục 2 |

> 🚧 45/35/20 là cơ cấu gốc 40/30/15/15 sau khi gộp 2 tiêu chí 15% cuối ("thảo luận vai trò" + "bài học rút ra") thành 1 và làm tròn lại phần dư — chưa chấm thử thực tế, điều chỉnh nếu không phù hợp với lớp cụ thể.

Hai thành phần đầu game tự tính, xem trên **Bản đồ chinh phục** và báo cáo **P&L** cuối ván (hoặc bảng điều khiển giảng viên `giang-vien.html`, xuất CSV).

---

## 2 · Rubric "Hợp tác vai trò & Bài học rút ra" (20%)

Nguồn minh chứng: **Nhật ký đội** (vai Thư ký ghi mỗi vòng) + tần suất sửa quyết định trước Commit + đánh giá đồng đẳng.

### Nhánh A · Thảo luận vai trò — chấm theo từng vòng trong 6 vòng (60% trọng số)

| Vòng | Bản đồ | Đạt (✓) nếu |
|---|---|---|
| 1 | Cần Thơ | ≥4/5 vai có ý kiến ghi lại trong Nhật ký |
| 2 | TP.HCM | Nhật ký ghi ≥1 ý kiến trái chiều về biến cố "Cơ Hội Vàng" |
| 3 | Khánh Hòa | Số lần sửa quyết định trước Commit ≥2 (phản ứng Price War) |
| 4 | Đà Nẵng | Nhật ký nêu được vai COO đề xuất gì (khủng hoảng năng lượng) |
| 5 | Thanh Hóa | Nhật ký ghi rõ ai đề xuất, ai phản đối (siết tín dụng) |
| 6 | Hà Nội | Nhật ký có đoạn tổng kết tranh luận, nêu quyết định cuối và ai nhượng bộ |

| Số vòng đạt ✓ (trên 6) | Mức | Điểm |
|---|---|---|
| 0–1 vòng | Chưa đạt | 1 |
| 2–3 vòng | Đạt | 2 |
| 4–5 vòng | Khá | 3 |
| 6 vòng, và ≥1 vòng chỉ ra quyết định thay đổi tốt lên rõ rệt nhờ tranh luận (có số liệu trước/sau) | Xuất sắc | 4 |

### Nhánh B · Bài học rút ra cuối ván (40% trọng số, chấm 1 lần)

| Mức | Mô tả | Điểm |
|---|---|---|
| Chưa đạt | Không rút bài học, hoặc chỉ chép lại kết quả (thắng/thua) | 1 |
| Đạt | Bài học chung chung, không gắn dữ liệu ván chơi cụ thể | 2 |
| Khá | Bài học gắn với 1 tình huống cụ thể — trích được vòng nào, quyết định gì, giải thích nguyên nhân–kết quả | 3 |
| Xuất sắc | Như mức Khá, cộng liên hệ được với doanh nghiệp Việt Nam thực tế (có ví dụ) và nêu điều sẽ làm khác nếu chơi lại | 4 |

### Công thức quy đổi

```
Điểm tiêu chí (1–4) = 0,6 × Nhánh A + 0,4 × Nhánh B

Quy đổi thang 10:
   3,5–4,0 → 9,0–10   ·   2,5–3,4 → 7,0–8,9   ·   1,5–2,4 → 5,0–6,9   ·   1,0–1,4 → dưới 5,0

Đóng góp vào tổng học phần = (điểm thang 10 ÷ 10) × 20%
```

**Lưu ý khi chấm:** chấm phần lập luận, không chấm kết quả ván chơi — một đội thua nhưng phân tích được vì sao mình thua có thể đạt mức 4. Từ mức 3 trở lên bắt buộc dẫn chứng cụ thể (trích Nhật ký, số liệu vòng nào).

---

## 3 · Sổ điểm mẫu

In một bản cho mỗi đội.

**Đội: ……………………………  ·  Lớp: …………  ·  Ngày: …………**

| Vòng | 1 | 2 | 3 | 4 | 5 | 6 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Nhánh A – đạt ✓? | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

| Thành phần | Điểm | Trọng số | Quy đổi /10 |
|---|:-:|:-:|:-:|
| Lợi nhuận lũy kế | …… | 45% | …… |
| Số cờ chinh phục | …/6 | 35% | …… |
| Nhánh A (…/4) × 0,6 + Nhánh B (…/4) × 0,4 = …/4 | | 20% | …… |
| **Điểm học phần** | | **100%** | **…… /10** |

Nhận xét cho đội:

……………………………………………………………………………………………

……………………………………………………………………………………………

### Chuẩn bị trước buổi chấm

1. Vào bảng điều khiển giảng viên (`giang-vien.html`), lọc theo mã lớp, **xuất tệp CSV** kết quả từng vòng của tất cả các đội (lợi nhuận, thị phần, số cờ)
2. In hoặc mở sẵn tệp CSV khi chấm để đối chiếu ngay số liệu người học trích
3. Thu **Nhật ký đội** (vai Thư ký ghi) trước khi vào buổi chấm Nhánh A

---

© 2026 Đỗ Thùy Hương & Phan Anh Tú. Tài liệu phục vụ mục đích giáo dục.
