# Vendored third-party skill — huashu-design

Skill này là **mã bên thứ ba**, nhúng vào BizOn để hỗ trợ tạo prototype/slide/
motion/dataviz. Tách biệt với mã độc quyền của BizOn.

| Mục | Giá trị |
|---|---|
| Nguồn | https://github.com/alchaincyf/huashu-design |
| Commit nhúng | `1572d431f1411c82ec0baea94dea6a45f6063b26` |
| Giấy phép | **MIT** © 2026 alchaincyf (花叔 · 花生) — xem `LICENSE` trong thư mục này |
| Ngày nhúng | 2026-08-12 |

## Đã LƯỢC khi nhúng (giữ kho gọn, tránh media bên thứ ba)
- `assets/bgm-*.mp3` (~27MB nhạc nền) — lấy lại từ repo gốc nếu cần nhạc cho video.
- `assets/showcases/` (~3.3MB ảnh ví dụ) — không cần cho chức năng.

## Tính năng cloud — KHÔNG kèm, mặc định TẮT
`scripts/cloud/` (TTS Doubao, AI review qua Volcano ARK) cần API key Trung Quốc
riêng, mặc định bị chặn bởi cờ `HUASHU_CLOUD_OK`. Không dùng cho BizOn; không kèm key.

## Ghi chú
Đây là bản MIT; giữ nguyên `LICENSE` để đúng attribution. Không kích hoạt hook tự
động — chỉ thêm thư mục skill, không đụng `settings.json`.
