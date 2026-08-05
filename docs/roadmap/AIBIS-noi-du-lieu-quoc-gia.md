# AIBIS — nối dữ liệu quốc gia khi có xuất xứ

Trạng thái: **engine đã có, hợp đồng dữ liệu đã có; chờ dữ liệu quốc gia có xuất xứ để cắm vào.** Ghi lại theo yêu cầu "tất cả và có data sẽ nối vào".

## AIBIS là gì

AIBIS = **Global Market Engine** — engine tất định đứng sau Bậc 2B *Hộ chiếu Thương hiệu*: cho một hồ sơ doanh nghiệp và một hồ sơ quốc gia, nó **chấm 6 phương thức thâm nhập** (Export · Licensing · Joint Venture · Strategic Alliance · Wholly-Owned FDI · Digital Entry) trên 8 chiều ưu tiên, trọng số công bố công khai.

Đã có sẵn trong repo (5/5 test PASS):

| Thành phần | Tệp | Vai trò |
|---|---|---|
| Engine chấm | `js/aibis/entry-mode-engine.js` | `scoreMode` · `rankModes` · `compareModes` (v0.1.0, tất định) |
| Danh mục phương thức | `js/aibis/entry-mode-models.js` | 6 mode + lý thuyết nền + `evidenceConfidence` |
| **Hợp đồng dữ liệu quốc gia** | `js/aibis/country-profile-registry.js` | schema 1.0, kiểm định + đóng băng hồ sơ quốc gia có xuất xứ |
| Nguồn & mẫu | `country-profile-sources.js` · `country-profile-template.js` | khai báo nguồn, khung điền |
| Giao diện | `app/aibis.html` · `aibis-entry-mode-preview.html` | workspace + trang xem thử |

## Chỗ "có data sẽ cắm vào" — hợp đồng đã sẵn sàng

`country-profile-registry.js` đã định nghĩa **schema có xuất xứ** cho mỗi chỉ tiêu quốc gia (12 chiều: marketSize, institutionQuality, politicalRisk, culturalDistance, logisticsQuality, tariffPressure, digitalReadiness, ipProtection, …). Mỗi chỉ tiêu **bắt buộc**:

```
value · rawValue · rawUnit · direction · sourceId · sourceUrl ·
referenceYear · retrievedAt · freshness · confidence · license · notes
```

Khi có dữ liệu thật:
1. Điền theo `country-profile-template.js`, khai nguồn trong `country-profile-sources.js`.
2. Gọi `createProfile(input)` — nó **validate** (thiếu chỉ tiêu / thiếu nguồn / value sai → ném lỗi), rồi **đóng băng** hồ sơ kèm `provenance.reviewStatus`.
3. Truyền hồ sơ vào `context.country` của `scoreMode`/`rankModes` — `countryFit` của từng mode tự dùng số mới. **Không phải sửa engine.**

Nghĩa là: engine không cần đổi; chỉ cần **thay hồ sơ placeholder bằng hồ sơ đã kiểm định**. Đó là toàn bộ việc "nối data".

## Ba việc — trạng thái

- **A · Nối lối vào** — ✅ đã làm: `universe.html` có mô-đun 08 *AIBIS Global · Bậc 2B* → `aibis-entry-mode-preview.html`; trang preview có băng "Preview kỹ thuật · số liệu minh hoạ · đang kiểm định mô hình · dữ liệu có xuất xứ sẽ cắm vào khi sẵn sàng" + lối về Vũ trụ.
- **B · Nối engine vào game** — nối `brand-passport.html` (Hộ chiếu) gọi `entry-mode-engine.js` để điểm phương thức thâm nhập chạy trên engine tất định.
- **C · Nối dữ liệu quốc gia** — *giai đoạn sau, chờ data*: khi có bộ chỉ tiêu quốc gia có xuất xứ (nguồn + năm + độ tin + giấy phép), nạp qua `createProfile` là chạy. Hợp đồng đã sẵn.

## Giới hạn hiện tại (nói thẳng)

Theo `docs/architecture/AIBIS-APP-ENGINE-INTEGRATION.md` và `entry-mode-models.js` (`status: 'simulation-calibration-required'`):

- Chỉ số Nhật Bản và mức "sẵn sàng của doanh nghiệp" là **đầu vào dạy học minh hoạ**, không phải xếp hạng quốc gia thật hay tư vấn đầu tư.
- "Khoảng cách thể chế / văn hoá" là **placeholder** — cần module home-host (song phương) và kiểm định chuyên gia + phân tích độ nhạy trọng số.
- Vì vậy AIBIS để **Preview** cho tới khi hoàn tất hiệu chỉnh mô hình và có dữ liệu có xuất xứ.
