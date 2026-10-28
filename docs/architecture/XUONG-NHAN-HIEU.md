# Xưởng Nhãn Hiệu (`xuong-nhan-hieu.html`)

Bài tập chương 5 học phần Khởi sự doanh nghiệp: một nhóm sinh viên khởi nghiệp bán đặc sản địa phương
(nông sản chế biến hoặc thủ công truyền thống), quy mô nhỏ, vốn ít, chưa có thương hiệu, khách trong nước,
ưu tiên bán trực tuyến và trực tiếp. Sinh viên làm hai phần như đề bài: **xây dựng nhãn hiệu** (tên,
slogan, giải thích) và **marketing hỗn hợp 4P**. Trang nằm giữa Bến Phù Sa (gánh hàng) và Bật Nghiệp.

## Ba quyết định thiết kế

1. **Không gửi lên máy chủ.** Bài làm tự lưu trong trình duyệt (`localStorage`, khoá `bizon-xuong-nhan-hieu`);
   sinh viên in phiếu A4 / lưu PDF, tải tệp `.json` hoặc sao chép văn bản để nộp theo cách giảng viên thu bài.
   Lý do: nộp lên Supabase cần bảng và RPC mới, mà `bizon_purge_expired` được định nghĩa lại ở từng
   migration (xem ghi chú trong `20261028000000_case_tasks.sql`), nên mỗi bảng mới kéo theo việc sửa chuỗi
   migration và chạy trên cơ sở dữ liệu thật. Với bài chuyên cần, rủi ro ấy chưa đáng.
2. **Lumina góp ý theo luật cố định** (`js/brand-workshop-data.js`, hàm `gopY`): cùng bài làm thì cùng lời góp
   ý, mỗi lời góp ý nói rõ vì sao. Bốn mức: ✏️ còn trống · ⚠️ nên sửa · 💡 gợi ý · ✅ tốt.
3. **Không chấm điểm.** Chỉ có «mức hoàn thành» (số phần đề bài yêu cầu đã điền, 13 phần). Bộ chấm duy nhất của
   BizOn vẫn là `js/bizon-grading.js`; giảng viên chấm bài chuyên cần theo yêu cầu học phần.

## Các luật đáng chú ý

- **Tên chỉ gồm từ mô tả chung** («Xanh Sạch», «Đặc Sản Quê») → cảnh báo: nhãn hiệu phải có khả năng phân biệt,
  tên chung chung dễ trùng và khó bảo hộ. Kèm bước **tra trùng trên WIPO Publish của Cục Sở hữu trí tuệ**.
- **Slogan và mô tả sản phẩm sáo rỗng** («uy tín», «chất lượng cao, đáp ứng nhu cầu khách hàng») → cảnh báo.
- **Biên lợi nhuận gộp** tính từ giá vốn và giá bán; dưới 20% → cảnh báo (phí sàn, thanh toán, vận chuyển).
- **Giá cao cấp / hớt váng** khi chưa có lý do khách thấy được (hộp quà, chứng nhận, nghệ nhân) → cảnh báo.
- **Kênh**: phải có cả trực tuyến lẫn trực tiếp (đúng đề bài); hơn 4 kênh → dàn trải; chuỗi siêu thị → khó với
  doanh nghiệp mới vốn ít.
- **Quảng bá**: chỉ giảm giá → cảnh báo; giảm giá đi cùng giá theo giá trị hay cao cấp → mâu thuẫn; quảng bá
  trực tuyến mà không có kênh bán trực tuyến → cảnh báo.

Gợi ý sản phẩm là đặc sản miền Tây quen thuộc, ghi theo tên gọi truyền thống của đặc sản (địa danh gốc), chỉ
để sinh viên chọn nhanh, không phải danh mục chính thức.

Kiểm thử: `test/brand-workshop.test.js` (luật trong Node, không cần trình duyệt; và các chỗ nối tĩnh).
