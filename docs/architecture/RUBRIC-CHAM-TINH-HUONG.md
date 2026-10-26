# Rubric chấm bài tình huống và độ tin cậy liên chấm (R3, 27/10/2026)

Chấm phần **lý do** của 5 tình huống trắc nghiệm và **câu giải thích cơ chế** trong bài tình huống trước – sau (R2, `docs/architecture/BAI-TINH-HUONG.md`). Mã nguồn: `js/case-rubric-data.js` (`VERSION = 'rb-v1'`), trang `cham-tinh-huong.html`, hàm thống kê `js/core/irr.js`. Lựa chọn trắc nghiệm không chấm tay (cột `aligned` đã tính sẵn).

## 1 · Cấu trúc điểm

| Phần | Tiêu chí | Thang | Tối đa |
|---|---|---|---|
| Lựa chọn hợp lý thuyết | `aligned` của 5 tình huống (tự động) | 0/1 | 5 |
| Lý do (5 tình huống) | một tiêu chí theo cơ chế của tình huống | 0–2 | 10 |
| Giải thích cơ chế (câu x) | x1 tri thức → cam kết · x2 mạng lưới/outsidership · x3 hệ quả cụ thể · x4 cách giảm rủi ro | 0–2 mỗi tiêu chí | 8 |
| **Chất lượng quyết định** | | | **23** |

## 2 · Mốc điểm (anchors)

Nguyên tắc chung: **0** không có cơ chế (cảm tính, cơ hội, bắt chước); **1** nhắc đúng khái niệm nhưng không nối với tình huống hoặc không giải thích «vì sao»; **2** nêu cơ chế rõ, nối với tình huống, có điều kiện hoặc hệ quả.

### Lý do (theo cơ chế)
| Cơ chế | 0 | 1 | 2 |
|---|---|---|---|
| Uppsala (u1) | Dựa vào cơ hội, vốn sẵn, cảm tính | Nhắc tri thức/kinh nghiệm hoặc rủi ro chung chung | Cam kết phải tăng theo tri thức thị trường (học qua kênh hiện có trước); nêu rủi ro cụ thể khi nhảy cóc |
| Outsidership (o1) | Chỉ giá, quảng cáo, sản phẩm | Nhắc «quan hệ», «được giới thiệu» không nêu cơ chế | Người mua chỉ giao dịch trong mạng lưới quen; cần vị trí trong cuộc qua đối tác đã có quan hệ; chấp nhận chi phí vào |
| Khoảng trống thể chế (v1) | Tin hợp đồng/đối tác; từ chối không lý do | Nhắc rủi ro thanh toán hoặc trung gian, không nối với thiếu toà án/thông tin tín dụng | Thiếu thể chế nên hợp đồng ít giá trị; dùng trung gian/bảo lãnh thay thế và tăng dần |
| Effectuation (e1) | Ủng hộ kế hoạch/dự báo/chờ; không lý do | «Thử nhỏ trước» không nêu vì sao | Chưa biết thị trường → phương tiện sẵn có, tổn thất chấp nhận được, học qua phản hồi |
| Causation (e2) | Cảm giác, bắt chước, «cứ thử» | Cần tính toán nhưng không nêu vì sao tính được | Có số liệu nhiều năm → dự báo được; đầu tư lớn khó đảo ngược → hoà vốn/NPV, kế hoạch |

### Giải thích cơ chế (câu x)
| Tiêu chí | 0 | 1 | 2 |
|---|---|---|---|
| x1 tri thức → cam kết | Không nêu | «Chưa hiểu thị trường» không nối với cam kết | Cam kết đi trước tri thức → sai sản phẩm/giá/kênh; tri thức kinh nghiệm chỉ có qua hoạt động dần |
| x2 mạng lưới | Không nêu | «Chưa có quan hệ» chung chung | Chưa có vị trí trong mạng lưới → không được tin, không tiếp cận được; kho/công ty con không thay được |
| x3 hệ quả | Không nêu hoặc chỉ «thất bại» | Một hệ quả chung (lỗ, rủi ro) | Hệ quả cụ thể có cơ chế: chi phí chìm, hàng tồn, dòng tiền âm, rút lui tốn kém, học chậm |
| x4 giảm rủi ro | Không nêu hoặc «cẩn thận hơn» | Một cách, không giải thích | Vào dần theo bậc cam kết, đối tác trong cuộc, học trước, giới hạn tổn thất mỗi bước |

Lưu ý khi chấm: chấm **nội dung lập luận**, không chấm văn phong hay độ dài; câu dùng từ đời thường nhưng đúng cơ chế vẫn được 2; câu dùng thuật ngữ đúng nhưng không nối với tình huống chỉ được 1.

## 3 · Quy trình
1. **Hiệu chuẩn**: hai người chấm cùng chấm ~10 bài (lấy từ pilot), so điểm, thống nhất cách hiểu mốc; sửa anchor nếu cần (tăng `VERSION`).
2. **Chấm mù độc lập**: mỗi người mở `cham-tinh-huong.html`, nạp CSV bài tình huống (Trang Giảng viên → «⬇ CSV bài tình huống»), nhập mã người chấm. Trang xáo thứ tự bài theo người chấm và **không hiện giai đoạn (trước/sau) hay điều kiện lớp (hộp đen/hiện)**. Điểm lưu trên máy, xuất CSV khi xong.
3. **Độ tin cậy**: tab 2 nạp hai tệp điểm → κ Cohen (thường và trọng số bậc hai) cho từng tiêu chí và cho «lý do» gộp; ICC(2,1) và ICC(2,k) cho tổng lý do (0–10), tổng giải thích (0–8) và tổng (0–18); danh sách bất đồng.
4. **Hoà giải**: thảo luận các bất đồng ≥ 2 bậc trước, rồi ≥ 1 bậc; điểm cuối = điểm thống nhất (hoặc trung bình hai người nếu không hoà giải). Nếu κ < 0,61 ở tiêu chí nào: sửa anchor của tiêu chí đó, chấm lại mẫu hiệu chuẩn, chạy lại.
5. Báo cáo trong bài viết: κ trọng số và ICC(2,1) theo tiêu chí/tổng, n bài, phiên bản rubric.

## 4 · Thống kê (`js/core/irr.js`)
- κ Cohen: κ = (p_o − p_e)/(1 − p_e); bản trọng số bậc hai cho thang thứ bậc 0–2 (Cohen 1968). Kiểm thử: ví dụ 2×2 (a=20,b=5,c=10,d=15) → κ = 0,40.
- ICC hai chiều ngẫu nhiên, thống nhất tuyệt đối (Shrout & Fleiss 1979, ICC(2,1) và ICC(2,k); McGraw & Wong 1996). Kiểm thử: bộ số liệu 6×4 của Shrout & Fleiss → ICC(2,1) = 0,29, ICC(2,k) = 0,62.
- Ngưỡng tham khảo: Landis & Koch (1977) cho κ; Koo & Li (2016) cho ICC.

## 5 · Tệp
- CSV điểm (mỗi người chấm): `rater, class, student_key, phase, form, explain_condition, item, mech, criterion, score, rubric_version, scored_at`. Giai đoạn và điều kiện có trong tệp để phân tích, **không hiện** trên màn hình chấm.
- Báo cáo: CSV (κ theo tiêu chí, ICC theo tổng, bất đồng) + JSON đầy đủ.

## 6 · Tài liệu
Cohen, J. (1960). A coefficient of agreement for nominal scales. *Educational and Psychological Measurement, 20*(1), 37–46. · Cohen, J. (1968). Weighted kappa. *Psychological Bulletin, 70*(4), 213–220. · Shrout, P. E., & Fleiss, J. L. (1979). Intraclass correlations: Uses in assessing rater reliability. *Psychological Bulletin, 86*(2), 420–428. · McGraw, K. O., & Wong, S. P. (1996). Forming inferences about some intraclass correlation coefficients. *Psychological Methods, 1*(1), 30–46. · Landis, J. R., & Koch, G. G. (1977). The measurement of observer agreement for categorical data. *Biometrics, 33*(1), 159–174. · Koo, T. K., & Li, M. Y. (2016). A guideline of selecting and reporting intraclass correlation coefficients for reliability research. *Journal of Chiropractic Medicine, 15*(2), 155–163.
