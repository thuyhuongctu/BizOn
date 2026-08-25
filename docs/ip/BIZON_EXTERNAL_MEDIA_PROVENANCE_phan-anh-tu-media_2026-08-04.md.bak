# Ghi chú nguồn gốc — Kho media ngoài `phan-anh-tu-media` (04/08/2026)

## 0. Mục đích và giới hạn

Ghi chú này ghi lại nguồn gốc tài sản của kho **`thuyhuongctu/phan-anh-tu-media`** để **không lẫn** nó vào hồ sơ đăng ký BizOn. Đây là tài liệu làm việc, **không tự xác lập quyền**, không thay thế ý kiến pháp lý. Các mục 🔎 là việc cần lưu chứng cứ, **không phải tranh chấp quyền**.

> **Kết luận phạm vi:** kho này là **một tác phẩm RIÊNG**, tách khỏi BizOn. Không đưa vào đơn đăng ký chương trình máy tính / mỹ thuật / âm nhạc của BizOn. Nếu muốn bảo hộ thì lập **chain of title riêng**.

## 1. Kho này là gì

- **Sản phẩm:** video thuyết trình **"Nhận diện và phòng, chống tham nhũng"** (~8,5 phút, 8 phần).
- **Người dẫn:** nhân vật AI hoạt hình 3D tên *"Phát thanh viên AI"* — **người dẫn nam Việt chung chung, KHÔNG phải chân dung Phan Anh Tú**.
- **Công cụ sinh:** Seedance 2.5 qua dịch vụ **MuAPI** (khớp khẩu hình theo audio, ghép bằng ffmpeg).
- **Giọng:** giọng đọc **clone** (xem mục 3 — đã xác định nguồn).

## 2. Kiểm kê tài sản (theo đúng tệp trong kho)

| Nhóm | Tệp | Phân loại quyền |
|---|---|---|
| Ảnh nhân vật (AI) | `assets/character/dung-toan-than.png`, `dung-gioi-thieu.png`, `ngoi-laptop.jpg`, `chi-man-hinh-hologram.png`, `suy-nghi-canh.jpg`, `suy-nghi-man-hinh.png` | AI-assisted — cần chứng cứ đóng góp người (prompt/chọn ảnh) |
| Logo bên thứ ba | `assets/character/logo-ctu.png` | **Nhãn hiệu Trường ĐH Cần Thơ** — bên thứ ba, đưa vào **bảng loại trừ**, không kê là tài sản của nhóm |
| Âm thanh (giọng clone) | `assets/audio/phan-1…phan-8.mp3` (8) + `assets/audio/du-phong/phan-1-ban-dai-47s.mp3`, `phan-1-ban-ngan-13s.mp3` | Giọng của chính tác giả — xem mục 3 |
| Mã bên thứ ba | `pipeline/seedance_api.py` | Vendored từ SamurAIGPT/Seedance-2.5-API — **MIT**, đã có `pipeline/SEEDANCE_API_LICENSE`; ổn |

## 3. Nguồn giọng clone — ĐÃ XÁC ĐỊNH (chủ dự án xác nhận 04/08/2026)

Giọng clone trong hệ sinh thái là **giọng của chính hai tác giả**, không phải bên thứ ba:

| Giọng clone | Là giọng của | Dùng cho nhân vật |
|---|---|---|
| Lumina AI | **Đỗ Thùy Hương** | Lumina (cố vấn AI trong BizOn) |
| Tú Phan | **Phan Anh Tú** | Tú Phan; và **giọng dẫn video** trong kho này |

**Hệ quả:** **không có vấn đề quyền nhân thân giọng của bên thứ ba** — giọng thuộc chính người sở hữu, tự đồng ý. Việc còn lại là *ghi hồ sơ đúng*, không phải giải quyết tranh chấp. (Khớp yêu cầu manifest BizOn mục 4.3 / dòng 125 về "quyền sử dụng giọng tổng hợp" và "đồng ý của người có giọng".)

## 4. Việc cần lưu chứng cứ (🔎 — không phải tranh chấp quyền)

1. 🔎 **Công cụ clone giọng + Điều khoản dịch vụ tại thời điểm tạo.** Ghi rõ đã dùng dịch vụ nào để tạo mô hình giọng Lumina/Tú Phan, và điều khoản của dịch vụ đó về quyền với mô hình/âm thanh tổng hợp. (Là giọng của chính mình, nhưng dịch vụ tạo mô hình có thể ràng buộc điều khoản riêng.)
2. 🔎 **Điều khoản MuAPI/Seedance** về sở hữu **ảnh/video output** tại thời điểm tạo — lưu một bản. (Đúng tiêu chí No-Go: "asset AI phải lưu điều khoản" trong manifest BizOn.)
3. 🔎 **Chứng cứ đóng góp người cho ảnh AI**: prompt log, ảnh tham chiếu đầu vào, các lựa chọn/biên tập — để chứng minh phần sáng tạo của con người (manifest BizOn dòng 124).
4. 🔎 **`logo-ctu.png`**: xác nhận chỉ dùng trong ngữ cảnh cho phép; đưa vào **bảng loại trừ bên thứ ba**, không tuyên bố sở hữu.
5. 🔎 **Xác nhận giọng dẫn video** đúng là bản clone **Tú Phan (Phan Anh Tú)** — để khớp chain of title của tác phẩm video.

## 5. Khuyến nghị

- Coi video "Phòng, chống tham nhũng" là **tác phẩm nghe–nhìn độc lập**; quyết định sau: đăng ký riêng hay không đăng ký. **Không** gộp vào đơn BizOn.
- Trước khi đăng ký (nếu có), hoàn tất 5 mục 🔎 ở trên.
- Cập nhật **danh mục kiểm kê IP**: thêm tác phẩm video + tài sản kèm theo như một *nhóm riêng, nguồn `phan-anh-tu-media`*; chuyển `logo-ctu.png` sang bảng loại trừ.

## 6. Lưu ý phạm vi truy cập

Tại thời điểm lập ghi chú, phạm vi GitHub của phiên làm việc chỉ gồm hai kho: `thuyhuongctu/phan-anh-tu-media` và `thuyhuongctu/bizon`. Nếu còn **các nguồn media khác** ("+5 more" trong giao diện) chưa nằm trong phạm vi này, **danh mục kiểm kê chưa đầy đủ** cho tới khi các nguồn đó được rà tương tự.
