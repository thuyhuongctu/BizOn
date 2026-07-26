# 📊 Đề án: V-Monitor — Bảng theo dõi thị trường Việt Nam thời gian thực

> Đề xuất phát triển thành **một dự án độc lập** (tách khỏi BizOn), lấy cảm hứng từ mô hình WorldMonitor nhưng **chỉ thu thập thông tin thực tại Việt Nam** — hiện chưa có sản phẩm mã nguồn mở tương tự cho thị trường Việt Nam.
> Đề xuất bởi: Đỗ Thùy Hương · Cố vấn: Phan Anh Tú — 2026.

## 1. Ý tưởng & khoảng trống thị trường

- WorldMonitor (và các dashboard tương tự trên GitHub) tổng hợp chỉ số **toàn cầu**: chứng khoán Mỹ, crypto, dầu, vàng, FX.
- **Chưa có** dashboard mã nguồn mở "một trang, thuần tĩnh, không máy chủ" chuyên cho **thị trường Việt Nam**: VN-Index, tỷ giá USD/VND niêm yết, giá vàng SJC/nhẫn, xăng dầu, lãi suất, CPI, xuất nhập khẩu.
- V-Monitor lấp khoảng trống đó: **terminal tối giản kiểu tài chính, song ngữ Việt–Anh, chạy hoàn toàn trên GitHub Pages**, dữ liệu thật cập nhật tự động.

## 2. Nguồn dữ liệu khả thi (miễn phí / công khai)

| Nhóm | Chỉ số | Nguồn khả thi | Ghi chú |
|---|---|---|---|
| FX | USD/VND, EUR/VND, JPY/VND | open.er-api.com, frankfurter.app | CORS mở, không cần khóa |
| Chứng khoán | VN-Index, VN30, HNX | API công khai của CTCK (TCBS, SSI, VNDIRECT) | Cần kiểm tra CORS; có thể qua proxy serverless miễn phí |
| Vàng | SJC, nhẫn 9999 | Trang giá vàng công khai (SJC/DOJI/PNJ) | Thường phải scrape → dùng GitHub Actions cron ghi JSON tĩnh |
| Crypto | BTC, ETH (đối chiếu VND) | CoinGecko | CORS mở |
| Vĩ mô | CPI, GDP quý, XNK | GSO / TCTK công bố định kỳ | Cập nhật tay hoặc Actions hàng tháng |
| Xăng dầu | RON95, DO | Petrolimex công bố kỳ điều hành | Scrape qua Actions |

**Kiến trúc đề xuất (không máy chủ):** GitHub Actions chạy cron (15–60 phút) → thu số liệu → ghi `data/*.json` vào repo → GitHub Pages phục vụ trang tĩnh đọc JSON đó. Trình duyệt chỉ fetch thêm các API CORS-mở (FX, crypto) để có số "sống" giữa hai kỳ cron. Đây đúng mô hình các dashboard mã nguồn mở quốc tế đang dùng, chi phí vận hành = 0₫.

## 3. Phạm vi phiên bản

- **v0 (1–2 tuần):** FX + crypto (fetch trực tiếp) + khung giao diện terminal song ngữ, LIVE/SAMPLE badge — tái sử dụng module World Market đã có trong BizOn Global.
- **v1:** GitHub Actions cron cho vàng SJC + VN-Index + xăng dầu; sparkline lịch sử 30 ngày từ chuỗi JSON tích lũy.
- **v2:** trang chuyên sâu từng chỉ số, cảnh báo ngưỡng, nhúng được vào BizOn (tab Thị trường sống đọc dữ liệu thật Việt Nam thay vì mô phỏng).

## 4. Sở hữu trí tuệ

Theo đúng mô hình đã làm với **M-AIDA** (đăng ký quyền tác giả chương trình máy tính qua Trường Đại học Cần Thơ, đồng sở hữu Trường + tác giả; lưu trữ Zenodo lấy DOI):

1. Đặt tên + nhận diện riêng (đề xuất: **V-Monitor** hoặc **VietPulse**), repo riêng tách khỏi BizOn.
2. Ghi `IP_REGISTER.md` ngay từ commit đầu (định danh phiên bản chuẩn tham chiếu).
3. Nộp hồ sơ đăng ký quyền tác giả phần mềm qua ĐHCT; phát hành Zenodo để có DOI trích dẫn.
4. Giấy phép đề xuất: Academic Source-Available (như M-AIDA) — công khai minh bạch nhưng bảo lưu quyền.

## 5. Giá trị với hệ sinh thái

- Sản phẩm phái sinh **độc lập, có thể công bố** bên cạnh luận án (như M-AIDA đã làm).
- Nguồn dữ liệu thật cho BizOn: sinh viên ra quyết định trong game với bối cảnh giá vàng/tỷ giá/VN-Index **thật của ngày hôm đó**.
- Công cụ giảng dạy tài chính – vĩ mô cho các học phần khác của Trường.

---
*Tài liệu đề án — chưa phải cam kết phát triển. Bước tiếp theo đề xuất: tạo repo `V-Monitor`, dựng v0 từ module World Market của BizOn Global.*
