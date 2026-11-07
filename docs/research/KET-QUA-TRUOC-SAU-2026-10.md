# Phiếu trước – sau đợt 10/2026 · hai lớp KTM330HM01, KTM330HM02

**Nguồn:** hai gói dữ liệu nghiên cứu ẩn danh tải từ Trang Giảng viên ngày 07/11/2026 (`surveys.csv`), phân tích bằng
`scripts/research/phan-tich-truoc-sau.mjs`. Phiếu thu từ 15/10 đến 19/10/2026. Gói không có bài nộp Bật Nghiệp nào dưới
hai mã lớp này (`rounds.csv` trống), nên chưa nối được phiếu với dấu vết chơi.

## Tóm tắt gộp hai lớp (49 cặp ghép từ 125 phiếu: 67 trước, 58 sau; 18 phiếu trước và 9 phiếu sau không ghép được mã)

| Chỉ số | Trước | Sau | Δ | d_z | p (t cặp) | p (Wilcoxon) |
|---|---|---|---|---|---|---|
| Kiến thức Phần A (/15) | 14,22 | 14,20 | −0,02 | −0,02 | 0,88 | 0,95 |
| Tự tin Phần B tổng (/40) | 30,61 | 31,10 | +0,49 | 0,25 | 0,09 | 0,14 |

- **Trần điểm:** 28/67 phiếu trước (42%) đạt 15/15 và 56/67 (84%) đạt từ 14/15, nên bộ 15 câu không còn chỗ để đo thay đổi
  kiến thức. Đây là giới hạn công cụ, không phải bằng chứng «không học được gì».
- **Tự tin:** tăng nhẹ, rõ hơn ở KTM330HM02 (+0,72, d_z 0,36), gần như không đổi ở KTM330HM01 (+0,06). Câu tăng nhiều nhất là
  b_6 «ước tính điểm hòa vốn» (+0,31, 12 tăng / 17 giữ / 3 giảm ở HM02) và b_7 «so sánh phương thức thâm nhập» (+0,19).
- **NPS gộp −3** (n = 58; HM01 +14, HM02 −14), điểm giới thiệu trung bình 7,2/10, 26/58 cho 8 điểm.
- **Trải nghiệm (phiếu sau, 1–5, n = 58):** c_4 «giải thích Vì sao? giúp rút bài học» 4,14 · c_2 «làm thử dễ hiểu hơn nghe giảng» 4,03 ·
  c_5 «muốn tiếp tục dùng» 3,97 · c_1 «cuốn hút hơn buổi thường» 3,91 · c_3 «họp đội và cố vấn AI giúp biết cần làm gì» 3,41 (thấp nhất).

**Kết luận thận trọng:** thiết kế một nhóm trước–sau, không nhóm đối chứng, công cụ kiến thức bị trần; chỉ nói được «tự tin tăng nhẹ,
chưa đủ mạnh để kết luận», «phần giải thích cơ chế được đánh giá cao nhất», «họp đội và cố vấn AI là điểm cần cải thiện».
Đợt sau cần bộ câu hỏi khó hơn (mục tiêu trung bình trước ≈ 9–10/15) và mã lớp thống nhất để ghép được nhiều cặp hơn.

---

## Bảng do script sinh

Thiết kế một nhóm trước–sau, không có nhóm đối chứng: kết quả là **mức thay đổi đo được**, không phải tác động nhân quả của BizOn.

| Lớp | Phiếu | Cặp ghép | Lẻ (trước / sau) | Điểm A trước → sau (/15) | Δ | d_z | p (t cặp) | p (Wilcoxon) | Tự tin B tổng trước → sau | Δ | d_z | NPS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| KTM330HM01 | 51 | 17 | 12 / 5 | 13,88 → 13,76 | -0,12 | -0,09 | 0,718 | 0,863 | 30,18 → 30,24 | 0,06 | 0,03 | 14 (n=22) |
| KTM330HM02 | 74 | 32 | 6 / 4 | 14,41 → 14,44 | 0,03 | 0,05 | 0,768 | 0,763 | 30,84 → 31,56 | 0,72 | 0,36 | -14 (n=36) |

## KTM330HM01 · từng phát biểu tự tin (Likert 1–5, cặp n=17)

| Câu | Trước | Sau | Δ | d_z | Tăng / giữ / giảm |
|---|---|---|---|---|---|
| b_1 | 3,71 | 3,71 | 0 | 0 | 2 / 13 / 2 |
| b_2 | 4,06 | 3,88 | -0,18 | -0,28 | 1 / 13 / 3 |
| b_3 | 3,71 | 3,76 | 0,06 | 0,09 | 4 / 10 / 3 |
| b_4 | 3,18 | 3,29 | 0,12 | 0,2 | 4 / 11 / 2 |
| b_5 | 4 | 3,94 | -0,06 | -0,09 | 3 / 10 / 4 |
| b_6 | 3,76 | 3,82 | 0,06 | 0,07 | 4 / 9 / 4 |
| b_7 | 3,71 | 3,76 | 0,06 | 0,08 | 4 / 11 / 2 |
| b_8 | 4,06 | 4,06 | 0 | 0 | 3 / 11 / 3 |

### KTM330HM01 · điểm theo chuẩn đầu ra

| Chuẩn | Trước | Sau | Δ | d_z |
|---|---|---|---|---|
| out_chienluoc | 2,82 | 2,76 | -0,06 | -0,14 |
| out_kdqt | 2,47 | 2,41 | -0,06 | -0,09 |
| out_marketing | 2,82 | 2,88 | 0,06 | 0,24 |
| out_taichinh | 2,82 | 2,82 | 0 | 0 |
| out_vanhanh | 2,94 | 2,88 | -0,06 | -0,24 |

### KTM330HM01 · trải nghiệm (phiếu sau, 1–5): c_1 4 (n=22) · c_2 4,09 (n=22) · c_3 3,77 (n=22) · c_4 3,91 (n=22) · c_5 4,14 (n=22)

## KTM330HM02 · từng phát biểu tự tin (Likert 1–5, cặp n=32)

| Câu | Trước | Sau | Δ | d_z | Tăng / giữ / giảm |
|---|---|---|---|---|---|
| b_1 | 4 | 4,03 | 0,03 | 0,06 | 4 / 26 / 2 |
| b_2 | 3,97 | 3,91 | -0,06 | -0,14 | 2 / 26 / 4 |
| b_3 | 3,75 | 3,88 | 0,13 | 0,15 | 10 / 18 / 4 |
| b_4 | 3,5 | 3,53 | 0,03 | 0,07 | 4 / 25 / 3 |
| b_5 | 4,06 | 4,09 | 0,03 | 0,04 | 4 / 23 / 5 |
| b_6 | 3,84 | 4,16 | 0,31 | 0,45 | 12 / 17 / 3 |
| b_7 | 3,69 | 3,88 | 0,19 | 0,35 | 6 / 25 / 1 |
| b_8 | 4,03 | 4,09 | 0,06 | 0,07 | 7 / 21 / 4 |

### KTM330HM02 · điểm theo chuẩn đầu ra

| Chuẩn | Trước | Sau | Δ | d_z |
|---|---|---|---|---|
| out_chienluoc | 2,94 | 2,97 | 0,03 | 0,18 |
| out_kdqt | 2,59 | 2,63 | 0,03 | 0,1 |
| out_marketing | 2,94 | 2,97 | 0,03 | 0,18 |
| out_taichinh | 2,94 | 2,94 | 0 | 0 |
| out_vanhanh | 3 | 2,94 | -0,06 | -0,25 |

### KTM330HM02 · trải nghiệm (phiếu sau, 1–5): c_1 3,86 (n=36) · c_2 4 (n=36) · c_3 3,19 (n=36) · c_4 4,28 (n=36) · c_5 3,86 (n=36)

Cách đọc: d_z = chênh lệch trung bình ÷ độ lệch chuẩn của chênh lệch (0,2 nhỏ · 0,5 vừa · 0,8 lớn). p xấp xỉ; mẫu nhỏ (< 20 cặp) chỉ nên nêu mô tả. Sinh viên có điểm trần (15/15 ở phiếu trước) không thể tăng, cần nêu tỷ lệ trần.
