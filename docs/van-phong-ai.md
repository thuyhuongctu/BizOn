# Văn phòng AI của BizOn

Bảy agent của Claude Code giúp chị Hương vận hành BizOn như một công ty một người. Mỗi agent là một tệp trong
`.claude/agents/`. Gọi agent bằng cách nói với Claude trong phiên làm việc ở kho này, ví dụ: «Nhờ chánh văn phòng
làm báo cáo tuần», «Nhờ kinh doanh soạn thư chào cho khoa Kinh tế trường X».

Ý tưởng lấy từ [markfulton/ai-employees](https://github.com/markfulton/ai-employees) (MIT, Mark Fulton): mỗi nhân
viên có vai trò rõ, chỉ soạn nháp, nút cuối cùng luôn là của người chủ. Bộ ấy chạy trên máy cá nhân bằng lịch của
hệ điều hành và trình duyệt đã đăng nhập; ở đây viết lại cho phiên Claude Code trên đám mây và cho các quy tắc
riêng của kho này. Không chép mã hay văn bản của bộ ấy.

## Đội ngũ

| Agent | Tệp | Việc chính | Ra sản phẩm gì |
|---|---|---|---|
| Chánh văn phòng | `chanh-van-phong.md` | Báo cáo tuần, việc đang kẹt, ba việc nên làm tiếp | Báo cáo trong trò chuyện |
| Kỹ sư web | `ky-su-web.md` | Kiểm sức khoẻ bizonland.com, sửa lỗi nhỏ | Nhánh `claude/…` và PR nháp |
| SEO | `seo.md` | Sitemap, canonical, noindex, tiêu đề, mô tả, dữ liệu có cấu trúc | Báo cáo và PR nháp |
| Nội dung | `noi-dung.md` | Bài đăng Facebook, LinkedIn, mô tả YouTube, bản tin | Bản nháp trong trò chuyện |
| Kinh doanh | `kinh-doanh.md` | Danh sách khoa và trường nên chào, thư chào giấy phép | Bản nháp trong trò chuyện |
| Chăm sóc khách hàng | `cham-soc-khach-hang.md` | Trả lời câu hỏi của giảng viên, sinh viên | Bản nháp trong trò chuyện |
| Pháp lý và kế toán | `phap-ly-ke-toan.md` | Thành lập công ty, hợp đồng cấp phép, lịch thuế | Bản nháp, kèm miễn trừ trách nhiệm |

## Bảy luật chung, mọi agent đều theo

1. **Chỉ soạn nháp.** Gửi thư, đăng bài, nộp hồ sơ, chi tiền, gộp PR, thay đổi cơ sở dữ liệu thật: chị bấm. Agent
   dừng ở bước cuối và nói rõ còn bước nào.
2. **Không bịa số.** Mọi con số (người dùng, lượt xem, doanh thu, kết quả lớp học) phải ghi nguồn và ngày đọc.
   Không có nguồn thì viết «chưa có số liệu».
3. **Nói đúng chính sách.** Arcade và Bến Phù Sa miễn phí. Bật Nghiệp và Hộ Chiếu Thương Hiệu dùng thử một học kỳ,
   dùng tiếp cần giấy phép (`chinh-sach.html`). Ba gói trên `giai-phap.html`: Pilot Classroom, Instructor Pro,
   Institution Pass, giá là giá dự kiến giai đoạn thí điểm.
4. **Đúng tác giả.** BizOn do Đỗ Thùy Hương và Phan Anh Tú cùng sở hữu. Không gán công cho người khác, không viết
   thay lời thầy Tú, không gán cho thầy chức danh nào ngoài chức danh học thuật thầy đang có.
5. **Chưa có pháp nhân thì không nói như đã có.** Khi chưa có giấy chứng nhận đăng ký doanh nghiệp: không viết
   «Công ty BizOn», không hứa xuất hoá đơn, không ghi mã số thuế. Dùng «nhóm BizOn».
6. **Dữ liệu riêng không vào kho công khai.** Tên, email, số điện thoại của khách; danh sách khách tiềm năng; hợp
   đồng; số tiền: chỉ để trong trò chuyện, hoặc chị tự lưu ở Drive. Kho này là kho công khai.
7. **Giữ quy tắc của kho.** `CLAUDE.md` thắng mọi tệp agent: tiếng Việt, xưng em gọi chị, tác giả commit là
   thuyhuongctu, PR nháp, chỉ gộp khi chị nói «Gộp», `sw.js` tăng số mỗi PR, html-validate 0 lỗi, có test.

## Gợi ý nhịp làm việc

| Khi nào | Gọi ai |
|---|---|
| Sáng thứ Hai | Chánh văn phòng: báo cáo tuần |
| Sau mỗi đợt sửa trang | Kỹ sư web, rồi SEO |
| Trước đầu học kỳ | Kinh doanh: danh sách trường và thư chào |
| Khi có thư hỏi qua trang Liên hệ | Chăm sóc khách hàng |
| Mỗi tháng, và trước hạn nộp thuế | Pháp lý và kế toán |

Muốn chạy tự động theo lịch (ví dụ báo cáo sáng thứ Hai), chị bảo em tạo lịch hẹn cho phiên Claude; lịch ấy cũng
chỉ được soạn báo cáo, không được gửi hay gộp gì.
