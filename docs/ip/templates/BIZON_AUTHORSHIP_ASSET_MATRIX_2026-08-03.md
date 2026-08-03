# BIZON — MA TRẬN TÁC GIẢ, TÀI SẢN VÀ CHỦ SỞ HỮU

**Mã tài liệu:** BIZON-IP-MATRIX-2026-08-03  
**Mục đích:** Ghi nhận bằng chứng theo từng tài sản trước khi điền tờ khai quyền tác giả, quyền liên quan hoặc nhãn hiệu.

## 1. Nguyên tắc ghi nhận

1. `Tác giả` là người trực tiếp sáng tạo phần thể hiện cụ thể.
2. `Người đóng góp chuyên môn` không tự động là tác giả mã nguồn hoặc tác giả mỹ thuật.
3. `Chủ sở hữu quyền tài sản` có thể khác tác giả nếu có căn cứ đồng sở hữu, chuyển giao hoặc thỏa thuận hợp pháp.
4. `Người nộp hồ sơ/đại diện thủ tục` không đồng nghĩa là chủ sở hữu duy nhất.
5. Thành phần bên thứ ba và AI-assisted phải được tách rõ, không ghi là sáng tạo nguyên gốc nếu không có bằng chứng phù hợp.

## 2. Thông tin chung đã xác nhận

| Nội dung | Ghi nhận hiện tại |
|---|---|
| Đồng chủ sở hữu dự kiến | Đỗ Thùy Hương và Phan Anh Tú |
| Người trực tiếp nộp/đại diện thủ tục | Phan Anh Tú |
| Tác giả mã nguồn dự kiến | Đỗ Thùy Hương, chờ đối chiếu Git history |
| Đóng góp học thuật/chuyên môn | Phan Anh Tú đối với phần trực tiếp sáng tạo và phản biện |
| Vai trò CTU | Không phải chủ thể dự án theo xác nhận của hai đồng chủ sở hữu |
| Tỷ lệ đồng sở hữu | Chưa xác định; không mặc nhiên 50/50 |

## 3. Ma trận tài sản cần hoàn thiện

| ID | Nhóm tài sản | Tên/đường dẫn cụ thể | Tác giả trực tiếp | Người đóng góp chuyên môn | Chủ sở hữu quyền tài sản | Bên thứ ba/AI | Bằng chứng | Trạng thái ký |
|---|---|---|---|---|---|---|---|---|
| SW-001 | Chương trình máy tính | BizOn Core / deterministic engine | Đỗ Thùy Hương — dự kiến | Phan Anh Tú — yêu cầu học thuật/chuyên môn | Đỗ Thùy Hương & Phan Anh Tú | Thư viện/framework cần loại trừ | Git log, commit map, source snapshot, SHA-256 | Chưa ký |
| SW-002 | Chương trình máy tính | Brand Passport |  |  | Đỗ Thùy Hương & Phan Anh Tú |  |  | Chưa ký |
| SW-003 | Chương trình máy tính | AIBIS / IE Lab |  |  | Đỗ Thùy Hương & Phan Anh Tú |  |  | Chưa ký |
| SW-004 | Chương trình máy tính | Instructor Studio |  |  | Đỗ Thùy Hương & Phan Anh Tú |  |  | Chưa ký |
| SW-005 | Cơ sở dữ liệu/migration | Supabase schema, RLS, RPC, retention |  |  | Đỗ Thùy Hương & Phan Anh Tú | Supabase là nền tảng bên thứ ba | SQL history, migration log | Chưa ký |
| UI-001 | Mỹ thuật ứng dụng/UI | Academia 3D homepage |  |  | Đỗ Thùy Hương & Phan Anh Tú, trừ phần bên thứ ba | Font, icon, asset, AI-assisted | Screen sheet, file nguồn, prompt log, edit history | Chưa ký |
| UI-002 | Mỹ thuật ứng dụng/UI | Clay design system |  |  | Đỗ Thùy Hương & Phan Anh Tú, trừ phần bên thứ ba |  |  | Chưa ký |
| BR-001 | Nhận diện | Logo BizOn / BizOn Bật Nghiệp |  |  | Đỗ Thùy Hương & Phan Anh Tú, trừ phần bên thứ ba |  | Vector/source, phương án thiết kế | Chưa ký |
| CH-001 | Nhân vật | Lumina |  |  | Đỗ Thùy Hương & Phan Anh Tú, trừ phần bên thứ ba | AI-assisted nếu có | Character sheet, prompt, chỉnh sửa | Chưa ký |
| CH-002 | Nhân vật | Hương AI |  |  | Đỗ Thùy Hương & Phan Anh Tú, trừ phần bên thứ ba | Quyền hình ảnh/giọng |  | Chưa ký |
| CH-003 | Nhân vật | Tú Phan |  |  | Đỗ Thùy Hương & Phan Anh Tú, trừ phần bên thứ ba | Quyền hình ảnh |  | Chưa ký |
| EDU-001 | Tài liệu giáo dục | Luật chơi và kịch bản lớp học |  | Phan Anh Tú và/hoặc Đỗ Thùy Hương theo từng tài liệu | Đỗ Thùy Hương & Phan Anh Tú |  | Bản thảo, lịch sử chỉnh sửa | Chưa ký |
| EDU-002 | Tài liệu giáo dục | Rubric, model card, governance notes |  |  | Đỗ Thùy Hương & Phan Anh Tú |  |  | Chưa ký |
| MUS-001 | Tác phẩm âm nhạc | Dấu Mộc Vươn Xa / Brand Passport song |  |  | Theo thỏa thuận riêng | Công cụ nhạc/giọng AI nếu có | Lyrics, melody source, master, terms | Chưa ký |
| REC-001 | Bản ghi âm | Bản master ca khúc |  |  | Theo thỏa thuận riêng | Giọng tổng hợp/nhà cung cấp | Master, license, consent | Chưa ký |
| TM-001 | Nhãn hiệu | BIZON | Không áp dụng | Không áp dụng | Hai đồng chủ đơn nếu chọn đồng sở hữu |  | Search report, Nice classes, application | Chưa ký |
| TM-002 | Nhãn hiệu | BIZON BẬT NGHIỆP | Không áp dụng | Không áp dụng | Hai đồng chủ đơn nếu chọn đồng sở hữu |  |  | Chưa ký |
| TM-003 | Nhãn hiệu | Logo chữ–hình BizOn | Không áp dụng | Không áp dụng | Hai đồng chủ đơn nếu chọn đồng sở hữu |  |  | Chưa ký |

## 4. Bảng đối chiếu mã nguồn

| Commit/PR | Khoảng thời gian | Tệp/mô-đun | Người thực hiện trực tiếp | Công cụ hỗ trợ | Phần bên thứ ba | Kết luận tác giả |
|---|---|---|---|---|---|---|
| PR #304 / release `f38c47e...` | 03/08/2026 | Homepage, Instructor Studio, IP evidence workflow |  | GitHub/Coding tools nếu có | Liệt kê riêng | Chờ rà soát |
|  |  |  |  |  |  |  |

## 5. Checklist chứng cứ theo từng tài sản

Đánh dấu sau khi hoàn tất:

- [ ] Tệp nguồn hoặc bản thể hiện cuối.
- [ ] Ngày tạo và lịch sử phiên bản.
- [ ] Người trực tiếp sáng tạo.
- [ ] Người góp ý/chuyên môn nhưng không trực tiếp sáng tạo.
- [ ] Chủ sở hữu quyền tài sản.
- [ ] Mã băm SHA-256.
- [ ] Thành phần bên thứ ba.
- [ ] Điều khoản giấy phép.
- [ ] Prompt log và bằng chứng chỉnh sửa của con người nếu AI-assisted.
- [ ] Chấp thuận hình ảnh/giọng nếu có.
- [ ] Chữ ký xác nhận của Đỗ Thùy Hương.
- [ ] Chữ ký xác nhận của Phan Anh Tú.

## 6. Xác nhận

### Đỗ Thùy Hương

Tôi xác nhận các nội dung liên quan đến phần sáng tạo, mã nguồn và tài sản do tôi trực tiếp thực hiện là đúng theo hiểu biết và chứng cứ hiện có.

Ngày: ........................................

Chữ ký:



### Phan Anh Tú

Tôi xác nhận các nội dung liên quan đến đóng góp học thuật, chuyên môn, phản biện và tài sản do tôi trực tiếp sáng tạo là đúng theo hiểu biết và chứng cứ hiện có.

Ngày: ........................................

Chữ ký:
