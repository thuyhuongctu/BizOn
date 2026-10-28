# Phụ đề VI/EN cho video giới thiệu và trailer (28/10/2026)

Tệp: `assets/video/subs/<tên video>.<vi|en>.vtt` (WebVTT), gắn bằng `js/video-subs.js` ở hộp thoại trailer của trang chủ
(`index.html` = `academia3d-v2.html`) và video giới thiệu của `universe.html`. Tên bỏ đuôi `-720p`, nên bản 720p và bản gốc
dùng chung một tệp phụ đề.

| Video | Tiếng trong video |
|---|---|
| `bizon-intro-en-v3` | Anh |
| `bizon-intro-vi-v4` | Việt |
| `ben-phu-sa-trailer-v2`, `bizon-trailer-v3`, `bp-trailer-v2`, `srp-trailer`, `gravity-lab-trailer` | Anh |

**Khi nào hiện:** phụ đề tự bật khi tiếng trong video khác ngôn ngữ giao diện (giao diện tiếng Việt mở trailer tiếng Anh thì
thấy phụ đề tiếng Việt). Cùng ngôn ngữ thì để tắt; người xem bật bằng nút CC của trình phát.

**Không làm phụ đề rời** cho 6 video hướng dẫn dạng dọc (`bizon-huong-dan-choi-*`, `bp-huong-dan-*`): các video này đã in sẵn
phụ đề trên hình và có bản riêng cho mỗi ngôn ngữ.

## Cách làm
1. Nhận dạng lời bằng faster-whisper (mô hình medium, chạy trên máy, có mốc thời gian từng từ).
2. Sửa tay lỗi nhận dạng, nhất là tên riêng: «Bison» → BizOn, «Ben Phu Xe» → Bến Phù Sa, «Gun Teh» → Cần Thơ,
   «Ba So Leng, Kaila» → Bà Sáu Lành, Cái Lậy, «market bolt» → market boat (ghe hàng bông), «nô phỏng tắc định» → mô phỏng tất định.
   Lời trailer Bật Nghiệp lấy đúng theo `docs/video/trailer-bat-nghiep-loi-doc.md`.
3. Dịch sang ngôn ngữ còn lại; câu dài chia thành nhiều phụ đề, tối đa hai dòng mỗi phụ đề.

Không đưa vào phụ đề: lời bài hát nền trong video giới thiệu tiếng Anh, và câu chào cuối trailer Bến Phù Sa (máy nhận dạng không
nghe rõ). Nên nghe lại một lượt trước khi phát hành rộng.

Kiểm thử: `test/video-subs.test.js`.
