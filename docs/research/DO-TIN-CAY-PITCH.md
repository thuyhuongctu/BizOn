# Rubric pitch và độ tin cậy giữa người chấm

Tài liệu cho PR 2 của đặc tả 012 (`specs/012-pitch-nang-cap`). Phần mã: `lab/pitch-goi-von-rubric.js` (rubric, chấm mù) và `scripts/research/do-tin-cay-pitch.mjs` (tính độ tin cậy). Test: `test/pitch-rubric.test.js`.

## 1. Rubric chạy song song với điểm lớp

Điểm lớp vẫn là thang 4 × 2,5 của kịch bản «Đại hội Cổ đông & Pitch xin vốn» (đội tự chấm trong Phòng luyện pitch). Rubric nghiên cứu là phần thêm, chỉ dùng cho chấm cặp và phân tích:

| Mã cột CSV | Tiêu chí | Cơ sở |
|---|---|---|
| `chuan_bi` | Mức chuẩn bị | Nhà đầu tư mạo hiểm chú ý mức chuẩn bị nhiều hơn độ nhiệt huyết (Chen et al., 2009). |
| `nhiet_huyet` | Nhiệt huyết thể hiện | Tách riêng để kiểm lại phát hiện trên (Chen et al., 2009). |
| `tai_chinh` | Logic tài chính | Khớp với phần «kiểm ba con số» của đặc tả 010. |
| `van_de_giai_phap` | Vấn đề và giải pháp rõ | Huấn luyện pitch tập trung vào nội dung giúp được rót vốn (Clingingsmith & Shane, 2018). |
| `doi_ngu` | Đội ngũ đáng tin | Nối với thang «Đội ngũ» của điểm lớp. |
| `tra_loi` | Cách trả lời câu hỏi | Phần hỏi đáp trong thí nghiệm huấn luyện pitch (Clingingsmith & Shane, 2018). |
| `y_dinh` | Ý định đầu tư (biến kết quả, không phải tiêu chí) | Dùng để xem «cảm giác» của nhà đầu tư dựa vào tiêu chí nào (Huang & Pearce, 2015). |

Mỗi tiêu chí có thang 1–5 với mô tả neo cho từng mức (tiếng Việt và tiếng Anh) trong `lab/pitch-goi-von-rubric.js`. Người chấm thấy câu hỏi gợi ý và mô tả của mức vừa chọn ngay trên điện thoại.

## 2. Chấm mù trên lớp

1. Màn chiếu bật «Chế độ lớp». Mỗi đội vào bằng trang quỹ như ở PR 1. Giảng viên mở cùng đường dẫn trang quỹ, thêm `&gv=1`, nhập tên hiển thị (ví dụ «GV 1»), rồi màn chiếu duyệt.
2. Khi giảng viên mở rót vốn cho một đội, vòng chấm của đội đó bắt đầu. Các quỹ khác và giảng viên thấy phiếu 6 tiêu chí cùng câu ý định đầu tư. Đội đang pitch không chấm chính mình.
3. Màn chiếu chỉ hiện số phiếu đã nộp. Bản tin gửi tới các máy không có điểm cho tới khi đủ phiếu, hoặc khi giảng viên bấm «Mở điểm sớm».
4. Khi đã mở, màn chiếu hiện trung bình từng tiêu chí của cả lớp, của giảng viên và của bạn học.
5. Cuối buổi bấm «Xuất CSV chấm điểm». Tệp ở dạng dài, mỗi dòng là một người chấm cho một tiêu chí, với các cột `ma_buoi, doi, nguoi_cham, vai, tieu_chi, diem, thoi_diem`. Người chấm ghi bằng tên đội hoặc `gv-1`, `gv-2`, không có tên thật.

## 3. Tính độ tin cậy

```
node scripts/research/do-tin-cay-pitch.mjs pitch-cham-ABC234-2026-12-01.csv pitch-cham-XYZ789-2026-12-08.csv
node scripts/research/do-tin-cay-pitch.mjs *.csv --tieu-chi tai_chinh --json ket-qua.json
```

- Mỗi lượt pitch là một cặp (mã buổi, đội). Điểm của một người chấm cho một lượt là trung bình 6 tiêu chí; muốn xem riêng một tiêu chí thì dùng `--tieu-chi`.
- **ICC(2,1) và ICC(2,k):** dùng mô hình hai chiều ngẫu nhiên, đồng thuận tuyệt đối (Shrout & Fleiss, 1979). Hai «người chấm» là giảng viên và trung bình bạn học, chỉ tính các lượt có cả hai. Khoảng tin cậy 95 % tính theo McGraw và Wong (1996); khoảng của ICC(2,k) suy từ khoảng của ICC(2,1) bằng công thức Spearman–Brown.
- **α Krippendorff (thang khoảng):** tính trên từng người chấm riêng lẻ và chấp nhận ô trống (Hayes & Krippendorff, 2007). Khoảng tin cậy 95 % lấy bằng bootstrap theo lượt pitch (2 000 lần, hạt giống cố định nên chạy lại ra cùng kết quả).
- **Ngưỡng:** ICC(2,k) ≥ 0,75 là mức tốt (Koo & Li, 2016), cùng ngưỡng đã ghi trong dàn ý bài ISAGA 2027.
- **Cảnh báo:** script cảnh báo khi có dưới 30 lượt pitch, vì khi đó khoảng tin cậy còn rộng.

**Đối chiếu khi viết test:**
- ICC: bộ số liệu 6 đối tượng × 4 người chấm của Shrout và Fleiss (1979) cho ICC(2,1) = 0,29 và ICC(2,4) = 0,62, đúng như bài gốc; khoảng tin cậy 0,019–0,761.
- α Krippendorff: ví dụ 4 người chấm × 12 đơn vị có ô trống cho α = 0,849 với thang khoảng và 0,743 với thang định danh, đúng như ví dụ của tác giả.

## 4. Giới hạn

- Ở một lớp khoảng 12 đội, giảng viên thường chỉ chấm được một lần cho mỗi đội. Muốn đủ 30 lượt pitch cần gộp 3 buổi trở lên.
- Bạn học không chấm chính đội mình. Đội nào vắng hay nộp thiếu thì α vẫn tính được vì α chấp nhận ô trống.
- Ý định đầu tư và số vốn rót (ở CSV sổ góp vốn của PR 1) là biến kết quả. Script này chưa phân tích quan hệ giữa ý định đầu tư và 6 tiêu chí; phần đó làm ở bước phân tích của bài báo.

## Tài liệu tham khảo

Chen, X.-P., Yao, X., & Kotha, S. (2009). Entrepreneur passion and preparedness in business plan presentations: A persuasion analysis of venture capitalists' funding decisions. *Academy of Management Journal, 52*(1), 199–214. https://doi.org/10.5465/amj.2009.36462018
Clingingsmith, D., & Shane, S. (2018). Training aspiring entrepreneurs to pitch experienced investors: Evidence from a field experiment in the United States. *Management Science, 64*(11), 5164–5179. https://doi.org/10.1287/mnsc.2017.2882
Hayes, A. F., & Krippendorff, K. (2007). Answering the call for a standard reliability measure for coding data. *Communication Methods and Measures, 1*(1), 77–89. https://doi.org/10.1080/19312450709336664
Huang, L., & Pearce, J. L. (2015). Managing the unknowable: The effectiveness of early-stage investor gut feel in entrepreneurial investment decisions. *Administrative Science Quarterly, 60*(4), 634–670. https://doi.org/10.1177/0001839215597270
Koo, T. K., & Li, M. Y. (2016). A guideline of selecting and reporting intraclass correlation coefficients for reliability research. *Journal of Chiropractic Medicine, 15*(2), 155–163. https://doi.org/10.1016/j.jcm.2016.02.012
McGraw, K. O., & Wong, S. P. (1996). Forming inferences about some intraclass correlation coefficients. *Psychological Methods, 1*(1), 30–46. https://doi.org/10.1037/1082-989X.1.1.30
Shrout, P. E., & Fleiss, J. L. (1979). Intraclass correlations: Uses in assessing rater reliability. *Psychological Bulletin, 86*(2), 420–428. https://doi.org/10.1037/0033-2909.86.2.420
