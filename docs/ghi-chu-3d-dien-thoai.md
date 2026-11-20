# Ghi chú làm game 3D chạy tốt trên điện thoại

Ngày: 20/11/2026.

Nguồn: em đọc kho «Guizang Game Skill 3D» (giấy phép AGPL-3.0) để học cách làm. Em không chép mã và không chép văn bản của kho đó. Mười hai bài học dưới đây do em tự viết lại, rồi đối chiếu với 4 game 3D của BizOn: Bật Nghiệp 3D, Bến Phù Sa 3D, Hộ Chiếu Thương Hiệu 3D và Hộ Chiếu Sầu Riêng 3D.

Cách dùng: đọc tệp này trước khi làm một cảnh 3D mới, hoặc trước khi sửa cảnh 3D cũ cho điện thoại.

## 1. Mười hai bài học

Cột «BizOn hiện nay» ghi tình trạng sau đợt 1 (các PR #1155, #1156 và PR thêm tệp này).

| # | Nhóm | Bài học | BizOn hiện nay |
|---|---|---|---|
| 1 | Tải trang | Cho người chơi thấy một thứ gì đó ngay. Dựng phần cảnh viết bằng mã trước. Mô hình nặng tải sau, xong thì hiện dần. Nhạc chỉ tải sau khi bấm «Bắt đầu». | Bật Nghiệp có màn chờ và thanh tiến trình. Ba game kia hiện bảng chơi trước. |
| 2 | Tải trang | Một tệp hỏng không được làm game treo mãi ở màn «Đang tải». Phải báo lỗi rõ, có nút «Thử lại» và lối sang bản nhẹ. Tệp không bắt buộc mà thiếu thì bỏ qua. | **Đã sửa ở đợt 1:** Bật Nghiệp (màn chờ), Bến Phù Sa, Hộ Chiếu Thương Hiệu, Hộ Chiếu Mini (`js/bao-loi-3d.js`). |
| 3 | Dung lượng | Thư viện 3D để sẵn trong kho, không gọi CDN ngoài lúc chạy. | Ba game dùng three.js lưu trong kho. Riêng Sầu Riêng vẫn còn đường dự phòng gọi esm.sh (đợt 2). |
| 4 | Dung lượng | Thu ảnh dán bề mặt (texture) về 1024 px, đồ nhỏ 512 px, chuyển sang WebP. Nén hình học. Nhạc dùng bitrate thấp. Tiết kiệm nhiều nhất là ở texture. | Ảnh đã là WebP. three.js vẫn là bản chưa rút gọn và có hai bản sao (lỗi 6, chờ chị cho phép). |
| 5 | Nhân vật | Nhân vật có xương thì khi nén không được lượng tử hoá lưới. Nén xong, so chiều cao và tỉ lệ với bản gốc. | BizOn chủ yếu dùng sprite và khối đất sét, chưa vướng. |
| 6 | Nhân vật | Đặt chân nhân vật xuống đất theo khung bao. Hoạt ảnh có sẵn phải khử độ trôi của gốc, nếu không nhân vật «trượt» khỏi chỗ đứng. | Chưa vướng (xem dòng 5). |
| 7 | Hiệu năng | Đặt ngân sách điểm ảnh: trên điện thoại DPR khoảng 1,25–1,5. Khi tụt khung hình thì hạ dần: giảm độ phân giải, rồi tắt bóng, rồi tắt hậu kỳ. | Hộ Chiếu Thương Hiệu: **đợt 1 đã cho vào cảnh ở DPR 1,25, chưa bật bóng, tự hạ sớm hơn.** Bến Phù Sa vẫn DPR 2, chưa tự hạ (đợt 2). |
| 8 | Hiệu năng | Dừng vòng vẽ khi tab ẩn. Xử lý sự kiện mất ngữ cảnh WebGL. Máy không có WebGL thì báo rõ, không để màn trắng. | Các game đều dừng vẽ khi tab ẩn. Máy không có WebGL: **đã báo (đợt 1).** Mất ngữ cảnh: three.js tự khôi phục, rủi ro thấp. |
| 9 | Điều khiển | Trên điện thoại, cần điều khiển nổi ở nửa trái, nút bấm ở góc phải. Nút giữ phải nhả được ở cả `pointerup`, `pointercancel` và `pointerleave`. Bỏ sự kiện chuột giả mà trình duyệt sinh ra sau khi chạm. | Sầu Riêng: **đợt 1 đã giữ cần điều khiển khi xoay ngang và trên máy tính bảng.** |
| 10 | Bàn phím | Xoá mọi phím đang giữ khi cửa sổ mất focus, hoặc khi bấm Ctrl, Alt, Cmd. Bấm một hướng thì bỏ hướng ngược lại. Không đoán phím đã nhả dựa vào auto-repeat. | Chưa thử (ghi lại để rà sau). |
| 11 | Màn hình và âm thanh | Màn dọc: mở rộng góc nhìn camera, thanh trạng thái để lên trên, chừa phần dưới cho ngón cái. Tính vùng an toàn (safe-area) bằng JS. Nhạc nền chỉ to khoảng 1/3 so với âm hiệu ứng. | Sầu Riêng: **đợt 1 dùng `100dvh`, khung cảnh không cao hơn màn.** |
| 12 | Kiểm thử | Có móc gỡ lỗi: đẩy khung hình bằng tay, tham số URL để vào thẳng một màn. Kết luận dựa trên số đo, ảnh chụp chỉ để minh hoạ. | Đã có `?tinh-chinh=1` (#1154), `window.__bp3dKiosks`, `window.__bps3d`. Mỗi lỗi đã sửa đều có test Playwright. |

## 2. Số đo trước đợt 1

Cách đo:

- Playwright + swiftshader (vẽ bằng CPU), máy chủ tĩnh 127.0.0.1:8899, không nén gzip.
- Điện thoại giả lập 390×844, DPR 3.
- FPS chỉ nên dùng để so các game với nhau, không phải số thật trên điện thoại.
- Dung lượng là số thô: qua gzip/CDN sẽ nhỏ hơn.

ĐT = điện thoại, MT = máy tính.

| | Bật Nghiệp 3D | Bến Phù Sa 3D | HC Thương Hiệu 3D | HC Sầu Riêng 3D |
|---|---|---|---|---|
| Thấy nút vào game (ĐT / MT) | 3,6 s / 4,1 s | 1,3 s / 1,3 s | 2,5 s / 4,2 s | 3,6–4,2 s / 8,3 s |
| Cảnh 3D sẵn sàng sau khi bấm (ĐT / MT) | +1,3 s / +1,1 s | +4,3 s / +2,7 s | **+7,6 s** / +2,6 s | không đo tự động được |
| Dung lượng tải (thô) / số yêu cầu | **9,9 MB** / 176 | 4,8 MB / 94 | 5,4 MB / 115 | 2,5 MB / 58 |
| Tệp lớn nhất | three.core.js 1394 KB | three.core.js 1394 KB | three.core.js 1394 KB | chính trang HTML 1361 KB |
| Giới hạn DPR | ĐT 1,5 / MT 2 | 2, không tự hạ | 1,6 / 1,75, có tự hạ | ĐT 1,25 / MT 2 |
| three.js tải hỏng | **kẹt ở màn chờ hơn 45 s** | khung 3D trống, không báo | khung 3D trống, không báo | không thử (trang một tệp) |
| Xoay ngang 844×390 | đạt | đạt | đạt | **không đạt** (mất cần điều khiển, cắt đáy) |
| FPS swiftshader (so tương đối) | 6,4 | **1,1** | 0,5 lúc đầu, 3,3 sau khi tự hạ | 2,5 |

## 3. Việc đã làm và việc còn lại

| Lỗi | Nội dung | Tình trạng |
|---|---|---|
| 1 | Sầu Riêng 3D xoay ngang: mất cần điều khiển, cắt đáy | PR #1155 |
| 3 | Hộ Chiếu Thương Hiệu 3D vào cảnh chậm trên điện thoại | PR #1156 |
| 4 | Bật Nghiệp 3D kẹt ở màn chờ khi three.js hỏng | PR thêm tệp này (chỉ sửa phần màn chờ trong HTML, không đụng `js/engine.js`, `js/app.js`, `js/backend.js`) |
| 5 | Bến Phù Sa, Hộ Chiếu Thương Hiệu, Hộ Chiếu Mini: khung 3D trống khi three.js hỏng | PR thêm tệp này (`js/bao-loi-3d.js`) |
| 2 | Bến Phù Sa 3D nặng nhất: DPR 2, bóng 2048, không tự hạ, vẽ cả khi bảng che kín | Đợt 2 |
| 8 | Sầu Riêng: `preserveDrawingBuffer`, dự phòng esm.sh, đường dẫn âm thanh tuyệt đối | Đợt 2 |
| 6 | three.js chưa rút gọn và có hai bản sao (`vendor/three/` và `js/vendor/`). Gộp lại phải sửa importmap của «BizOn Game 3D.html» | **Chờ chị cho phép** |
| 7 | Bật Nghiệp tải 9,9 MB trước khi vào: sprite nên tải khi cần | **Chờ chị cho phép** |
| 9 | Mất ngữ cảnh WebGL: chưa hiện thông báo «Đang khôi phục đồ hoạ…» | Rủi ro thấp, để sau |

## 4. Kiểm nhanh trước khi gộp một cảnh 3D

- [ ] Mở ở 390×844 và xoay ngang 844×390: cần điều khiển và nút còn trong màn, không tràn ngang, không cắt đáy.
- [ ] Chặn `three.module.js` (Playwright `page.route(..., r => r.abort())`): có lời báo, có «Thử lại», có lối sang bản 2D.
- [ ] Điện thoại giả lập: DPR lúc vào cảnh ≤ 1,5. Bóng và hậu kỳ chỉ bật khi máy đủ khỏe.
- [ ] Ẩn tab: vòng vẽ dừng.
- [ ] Không gọi CDN ngoài lúc chạy. Tệp mới được thêm vào `sw.js` nếu trang đã được lưu sẵn.
- [ ] Có test trong `test/*.test.js` cho mỗi lỗi đã sửa.
