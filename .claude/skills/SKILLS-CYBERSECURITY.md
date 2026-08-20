# Ba kỹ năng an ninh — nguồn gốc và giấy phép

Ba thư mục kỹ năng dưới đây được chọn lọc từ
[mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills)
v1.3.0 (commit `4c0b700`), lấy về ngày 20/08/2026. Giấy phép **Apache-2.0**;
mỗi thư mục kỹ năng mang sẵn bản `LICENSE` riêng của nó.

> **Lưu ý về tên:** kho gốc tên là "Anthropic-Cybersecurity-Skills" nhưng
> **không liên quan tới Anthropic PBC** — chính README của kho ghi rõ đây là
> dự án cộng đồng độc lập. Tác giả: mukul975 / mahipal.

| Kỹ năng | Vì sao chọn cho kho này |
|---|---|
| `implementing-secrets-scanning-in-ci-cd` | Kho có khoá Supabase staging (`js/backend-config.js`, `supabase-staging-gate.yml`, `supabase-staging-first-run.yml`) và khoá ký bản phát hành Android. Kỹ năng hướng dẫn gắn gitleaks/trufflehog vào CI để chặn khoá lọt ra trước khi đẩy |
| `detecting-supply-chain-attacks-in-ci-cd` | Kho có **32 workflow**, dùng action bên thứ ba (`peaceiris/actions-gh-pages@v4`, `android-actions/setup-android@v3`) ghim theo nhãn chứ không theo SHA. Kỹ năng rà đúng lớp rủi ro này: action không ghim, chèn lệnh qua biểu thức `${{ }}`, nhầm lẫn tên gói, lộ secret |
| `performing-privacy-impact-assessment` | Kho có `test/privacy-play-readiness.test.js`, nhật ký quyết định của đội sinh viên và bộ hồ sơ nộp Play Store. Kỹ năng theo phương pháp NIST PRAM + DPIA Điều 35 GDPR, dùng khi cần lập đánh giá tác động riêng tư cho dữ liệu sinh viên |

## Vì sao **không** lấy cả kho

Kho gốc có **817 kỹ năng, 59 MB**. Ba lý do không đưa trọn vào đây:

1. **Loãng lựa chọn.** Kho này hiện có 21 kỹ năng; thêm 817 kỹ năng an ninh
   (C2, khai thác lỗ hổng, pháp y bộ nhớ, phân tích mã độc…) sẽ làm tác nhân
   khó chọn đúng kỹ năng cho một game mô phỏng kinh doanh.
2. **Không đúng lĩnh vực.** Phần lớn nội dung là hồng đội / pháp y / an ninh
   đám mây, không dính gì tới một ứng dụng web tĩnh dạy học.
3. **Tên kho gây hiểu nhầm.** Đưa nguyên một kho mang chữ "Anthropic" vào một
   kho công khai có DOI dễ bị đọc thành có sự bảo trợ của Anthropic, điều mà
   chính tác giả kho gốc phủ nhận.

Nếu về sau cần trọn bộ 817 kỹ năng, cách đúng là **cài như plugin** (kho gốc
có sẵn `.claude-plugin/marketplace.json`) chứ không sao chép vào kho này —
như vậy nó nằm ngoài mã nguồn được trích dẫn và tự cập nhật theo bản gốc.

## Đã kiểm trước khi cài

- Kho gốc **không có hook**: `.claude-plugin/plugin.json` chỉ khai `name`,
  `description`, `version`; không có `hooks`, `commands`, `agents`,
  `mcpServers`.
- Các tệp `scripts/agent.py` chỉ chạy khi được gọi tay. Lệnh gọi mạng duy
  nhất là tra `registry.npmjs.org` và `pypi.org` trong
  `detecting-supply-chain-attacks-in-ci-cd` để phát hiện nhầm lẫn tên gói —
  đúng chức năng, không gửi dữ liệu của kho đi đâu.

## Giấy phép

Apache License 2.0 — toàn văn nằm trong tệp `LICENSE` của từng thư mục kỹ
năng. Bản quyền thuộc tác giả gốc; phần này **không** thuộc phạm vi bản quyền
BizOn nêu trong `LICENSE` ở gốc kho. Ba thư mục được sao chép nguyên trạng,
không sửa nội dung.
