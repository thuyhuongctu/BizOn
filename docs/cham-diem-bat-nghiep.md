# Tiêu chí chấm điểm — BizOn Bật Nghiệp

**Ngày:** 23/09/2026 · **Dùng cho:** lớp KT330H (Khởi sự doanh nghiệp) và các lớp dùng game Bật Nghiệp

> Bản trích gọn, dùng ngay được, rút từ tài liệu đầy đủ `docs/chuan-dau-ra-va-rubric.md` (§4.1) trong repo BizOn.

---

## 1 · Cơ cấu điểm học phần

| Thành phần | Trọng số | Nguồn |
|---|:-:|---|
| Điểm game B1–B6, thang 10 đã công bố cho sinh viên (B1 lợi nhuận /2 · B2 thị phần /2 · B3 vận hành /2 · B4 thành tựu /1,5 · B5 đóng góp cá nhân /1,5 · B6 ứng biến /1) | **50%** | Tự động – Excel «Tổng /10» từ bảng điều khiển giảng viên; B5 theo Nhật ký thành viên |
| Rubric lập luận CLO-A…E (`docs/chuan-dau-ra-va-rubric.md` §4.1, thang 4 mức, quy đổi /10 theo §4.3) | **30%** | Giảng viên chấm bài thảo luận hoặc bản thu hoạch sau ván |
| Hợp tác vai trò & Bài học rút ra (Nhánh A thảo luận vai trò 60% + Nhánh B bài học 40%) | **20%** | Giảng viên chấm từ Nhật ký đội và đánh giá đồng đẳng |

> ✅ **Quyết định 07/11/2026** (sau đợt rà 06/11/2026), thay cho cơ cấu cũ 45 · 35 · 20: giữ nguyên thang B1–B6 đã phát cho sinh viên (`Thang Diem Bat Nghiep - Sinh Vien.dc.html`, đã dùng ở lớp KT330H-M02) làm phần kết quả 50%; 50% còn lại do giảng viên chấm lập luận và hợp tác, khớp tuyên bố «chấm phần lập luận, không chấm kết quả ván chơi». Không cần đổi tệp Excel hay cơ sở dữ liệu. Lớp đang học giữa kỳ theo cơ cấu cũ thì giữ tới hết kỳ.

Điểm game B1–B6 lấy từ tệp Excel «⬇ Xuất Excel» ở bảng điều khiển giảng viên (`Trang Giang Vien.dc.html`, tab Chấm điểm); cách tính từng mục ghi ở `Thang Diem Bat Nghiep - Sinh Vien.dc.html`.

---

## 2 · Rubric "Hợp tác vai trò & Bài học rút ra" (20%) — phần lập luận 30% chấm theo rubric CLO-A…E ở `docs/chuan-dau-ra-va-rubric.md` §4.1

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
| Điểm game B1–B6 (Excel «Tổng /10») | …/10 | 50% | …… |
| Rubric lập luận CLO-A…E (…/4 → …/10 theo §4.3) | …/4 | 30% | …… |
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
