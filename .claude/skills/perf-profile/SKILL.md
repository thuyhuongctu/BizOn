---
name: perf-profile
description: "Đo một trang hay game BizOn chạy chậm ở đâu trên điện thoại: thời gian tải, dung lượng tải về, ảnh/video/mô hình nặng, khung hình 3D giật, JS chặn luồng chính. Đo bằng Playwright (giả lập mạng 4G và CPU chậm), so với ngân sách, xếp việc tối ưu theo lợi ích. Chỉ đo và đề xuất."
argument-hint: "[tên-trang.html] [luồng: vd «mở game → vào phòng họp 3D»]"
user-invocable: true
---

<!-- Phỏng theo skill perf-profile của «Claude Code Game Studios» (Donchitos, giấy phép MIT – xem THIRD-PARTY-NOTICES.md mục 6),
     Việt hóa và chuyển từ profiler của engine sang đo trang web thật bằng Playwright cho BizOn. -->

# Đo hiệu năng một trang

Trả lời bằng tiếng Việt, xưng «em», gọi chị. Chỉ đo và đề xuất; sửa thì làm nhánh riêng sau khi chị đồng ý.

## 1. Ngân sách (mặc định, chị đổi được)

| Chỉ số | Điện thoại (4G, CPU chậm ×4) | Máy tính |
|---|---|---|
| Hiện nội dung chính (LCP) | ≤ 4 s | ≤ 2,5 s |
| Tải về trước khi dùng được | ≤ 5 MB (trang thường), ≤ 15 MB (game 3D) | — |
| Khung hình cảnh 3D | ≥ 30 fps, không khung nào > 100 ms | ≥ 50 fps |
| Tác vụ dài trên luồng chính | không tác vụ > 300 ms sau khi hiện | — |

## 2. Đo

- Bật máy chủ tĩnh (`python3 -m http.server 89xx --bind 127.0.0.1`), mở bằng Playwright; tắt máy chủ theo PID khi xong.
- Giả lập điện thoại 390×844, mạng qua CDP (`Network.emulateNetworkConditions`: ~1,6 Mb/s tải, 150 ms trễ) và
  `Emulation.setCPUThrottlingRate` = 4. Đo **lần đầu** (bộ nhớ đệm trống, chưa có service worker) và **lần hai** (có sw.js).
- Ghi: LCP và tác vụ dài (`PerformanceObserver`), tổng byte và 10 tệp nặng nhất (`page.on('response')` hoặc
  `performance.getEntriesByType('resource')`), số yêu cầu, lỗi JS.
- Game 3D: đi theo luồng chị nêu, đếm khung hình bằng `requestAnimationFrame` trong 10 giây ở mỗi cảnh, ghi số draw call nếu
  trang lộ `renderer.info`.
- Mỗi số đo chạy 3 lần lấy trung vị; ghi rõ máy đo là máy đám mây (số tuyệt đối chỉ để so sánh trước/sau, không thay máy thật).
- Thiếu số liệu mục nào (ví dụ trang không có cảnh 3D, không mở được) thì mục đó «CHƯA ĐÁNH GIÁ», không ghi đạt.

## 3. Phân tích và đề xuất

Tìm nguyên nhân hay gặp ở BizOn: ảnh/poster chưa WebP, video tải trước (`preload` khác `none`), mô hình `.glb` lớn tải ngay
từ đầu thay vì khi cần, thư viện 3D nạp ở trang không cần 3D, phông chữ nhiều biến thể, tệp không có trong `sw.js` nên lần hai
vẫn tải lại, vòng lặp vẽ chạy khi tab ẩn.

Báo cáo: bảng ngân sách (đo / ngưỡng / ĐẠT-VƯỢT / chưa đánh giá), điểm nóng, việc nên làm xếp theo lợi ích ÷ công sức
(ghi «việc nhanh < 1 giờ» riêng), việc cần tìm hiểu thêm. Kết luận **TRONG NGÂN SÁCH / VƯỢT NGÂN SÁCH / CHƯA ĐÁNH GIÁ**.

Rồi hỏi chị chọn: sửa ngay (nhánh riêng, đo lại sau khi sửa để chứng minh), giảm bớt tính năng, hay chấp nhận và ghi lại.
