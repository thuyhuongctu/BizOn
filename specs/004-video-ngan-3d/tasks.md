# Việc cần làm: Video ngắn dọc 3D với nhân vật đất sét BizOn

**Đầu vào**: [spec.md](spec.md), [plan.md](plan.md) · **Định dạng**: `[Mã] [P?] [Câu chuyện] Mô tả` – `[P]` làm song song
được (khác tệp, không phụ thuộc). Mỗi câu chuyện là một PR; test viết trước và phải thấy hỏng trước khi viết mã.

## Giai đoạn 1 – Bộ dựng video dọc 3D (câu chuyện 1, P1)

**Mục tiêu**: một lệnh dựng được cảnh thử 10 giây thành mp4 dọc, tất định, không tốn phí.

### Test (viết trước, phải hỏng)

- [ ] T001 [US1] Viết `test/video-3d-bo-dung.test.js`:
  - chạy `dung-video-3d.mjs scripts/video/3d/ke-hoach-thu.mjs` khổ nhỏ (270 × 480, 2 giây) cho nhanh trong CI;
  - mp4 đúng khổ, 30 khung/giây, số khung = thời lượng × 30 (lệch ≤ 1);
  - dựng hai lần, so khung ở 3 mốc: giống hệt từng điểm ảnh (SC-002);
  - kế hoạch gọi GLB không có → mã thoát khác 0, thông báo tiếng Việt nêu tên cảnh và tệp;
  - không cảnh nào đứng hình quá 0,5 giây: so hai khung cách 15 khung trong mỗi cảnh, phải khác nhau;
  - mã không import `bizon-characters.js` và không chứa tệp của kho tham khảo.

### Làm

- [ ] T002 [US1] `scripts/video/3d/canh-3d.html` + `canh-3d.js`:
  - renderer, ánh sáng đất sét, phông ảnh;
  - nạp kế hoạch, nạp GLB bằng `GLTFLoader` và `SkeletonUtils.clone`;
  - `veKhung(n)` thuần theo `t`; `window.__san` khi tải xong.
- [ ] T003 [P] [US1] `scripts/video/3d/dao-cu.js`: nón lá, thùng xốp, bàn kiểm, container, hàng rào, cây sầu riêng.
- [ ] T004 [US1] Ghép clip thiếu từ `dong-tac-v1.glb`; chuẩn hóa chiều cao nhân vật bằng hộp bao.
- [ ] T005 [US1] `scripts/video/3d/dung-video-3d.mjs`:
  - máy chủ tĩnh tạm, Chromium, chụp từng khung, ghép mp4;
  - hai chế độ phụ: `--thu` (một ảnh giữa mỗi cảnh) và `--tu/--den` (chỉ dựng một đoạn);
  - báo lỗi tiếng Việt.
- [ ] T006 [US1] `scripts/video/3d/ke-hoach-thu.mjs`: CEO và CFO, đẩy máy vào, 10 giây.
- [ ] T007 [US1] `THIRD-PARTY-NOTICES.md` mục 6: ghi kỹ thuật học từ `thuann-vn/claude-3d-animated-shorts` (MIT).
- [ ] T008 [US1] `sw.js` nâng `CACHE`.
  - Đo thời gian dựng 10 giây ở 1080 × 1920 trên máy đám mây, ghi vào PR (để ước SC-001).
  - Gửi chị 3 ảnh khung thử.

**Điểm dừng**: chị xem ảnh khung thử, duyệt nhìn và cảm giác đất sét trước khi làm video thật.

## Giai đoạn 2 – Video thử «Một trái sầu riêng, cả vùng cùng sầu» bản dọc 3D (câu chuyện 2, P2)

**Mục tiêu**: video dọc khoảng 45 giây, 7 câu, giọng tác giả, qua `kiem-video.mjs`.

### Test (viết trước, phải hỏng)

- [ ] T009 [US2] Viết `test/video-3d-sau-rieng.test.js`:
  - kế hoạch có đúng 7 cảnh, ứng với các câu 1, 3, 4, 7, 10, 12, 14; mỗi cảnh trỏ đúng tệp giọng `vi/NN.mp3`;
  - mỗi câu trong kế hoạch trùng chữ với câu tương ứng trong hồ sơ kịch bản;
  - kế hoạch không chứa chữ «chỉ vì một con số» và không có câu nào trong mục «Chưa xác minh»;
  - anh Tư có nón lá và dùng GLB có sẵn;
  - thành phẩm (nếu có trong kho):
    - 1080 × 1920, 30 khung/giây, dài 40–50 giây;
    - chạy `kiem-video.mjs` mã thoát 0;
    - −16 ≤ LUFS ≤ −14, đỉnh thật ≤ −1 dBTP;
    - cỡ ≤ 8 MB;
    - có kèm `.vi.vtt` và `.en.vtt` hợp lệ, 7 mục, mốc khớp mốc câu (FR-007).

### Làm

- [ ] T010 [US2] Thêm mục «Bản dọc 3D 45 giây» vào `docs/video/kich-ban-sau-rieng-ma-so-vung-trong.md` (7 câu, cột cảnh 3D); gửi chị duyệt danh sách câu.
- [ ] T011 [US2] `scripts/video/3d/sau-rieng-doc/ke-hoach.mjs`: 7 cảnh theo bảng ở plan.md.
- [ ] T012 [US2] `scripts/video/3d/sau-rieng-doc/dung-sau-rieng-doc.mjs`:
  - ghép giọng, nhạc nền hạ khi có lời;
  - dựng, trộn tiếng, `loudnorm`;
  - poster, phụ đề `.vi.vtt`/`.en.vtt` theo mốc câu (như `dung-sau-rieng.mjs`), chạy `kiem-video.mjs`.
- [ ] T013 [US2] Dựng thành phẩm `assets/video/sau-rieng-ma-so-doc-3d-vi.mp4` + poster.
  - Gửi chị video và tờ khung hình để chị chấm (SC-004).
- [ ] T014 [US2] `sw.js` nâng `CACHE`; chạy test.

## Giai đoạn 3 – Phụ đề từng chữ (câu chuyện 3, P3)

**Mục tiêu**: chữ hiện từng chữ theo giọng, trong vùng an toàn; kèm `.vtt` VI/EN.

### Test (viết trước, phải hỏng)

- [ ] T015 [US3] Viết `test/video-3d-phu-de.test.js`:
  - `moc-tu.json` đủ từ của 7 câu, mốc tăng dần, nằm trong khoảng của câu;
  - khung chụp ở mốc giữa 5 từ ngẫu nhiên: chữ đang đọc được tô;
  - hộp phụ đề nằm trong 15 %–80 % chiều cao;
  - `.vi.vtt` và `.en.vtt` hợp lệ, 7 mục, cùng mốc câu.

### Làm

- [ ] T016 [US3] `scripts/video/3d/moc-tu.mjs`:
  - thử `faster-whisper` trước; nếu không được thì chia theo âm tiết và neo bằng `silencedetect`;
  - ghi `moc-tu.json`, cho sửa tay.
- [ ] T017 [US3] Lớp phụ đề trong `canh-3d.js` (HTML phủ, chụp cùng khung), bật bằng tùy chọn trong kế hoạch.
- [ ] T018 [US3] Dựng bản có chữ `assets/video/sau-rieng-ma-so-doc-3d-vi-v2.mp4` (giữ `.vtt` của PR 2); gửi chị xem.
- [ ] T019 [US3] `sw.js` nâng `CACHE`; chạy test.

## Phụ thuộc

- PR 2 cần PR 1 (bộ dựng). PR 3 cần PR 2 (giọng đã ghép và mốc câu).
- T003 làm song song với T002.

## Kế hoạch PR

| PR | Câu chuyện | Nhánh | Test hỏng trước | Tệp chính |
|---|---|---|---|---|
| 0 | Đặc tả (tài liệu) | `claude/video-ngan-3d` | – | `specs/004-video-ngan-3d/` |
| 1 | P1: bộ dựng video dọc 3D | `claude/video-3d-bo-dung` | `test/video-3d-bo-dung.test.js` | `scripts/video/3d/*`, `THIRD-PARTY-NOTICES.md` |
| 2 | P2: video thử sầu riêng dọc 3D | `claude/video-3d-sau-rieng` | `test/video-3d-sau-rieng.test.js` | `scripts/video/3d/sau-rieng-doc/*`, `assets/video/sau-rieng-ma-so-doc-3d-vi.mp4` + `.vtt`, mục mới trong kịch bản |
| 3 | P3: phụ đề từng chữ | `claude/video-3d-phu-de` | `test/video-3d-phu-de.test.js` | `scripts/video/3d/moc-tu.mjs`, `canh-3d.js`, mp4 `-v2` |

Cả ba PR đều không đổi trang web, không đổi Supabase, không có việc chị phải làm tay ngoài:
- duyệt ảnh khung thử (sau PR 1);
- duyệt danh sách câu và chấm video (PR 2);
- bấm «Delete branch» sau mỗi lần gộp.
