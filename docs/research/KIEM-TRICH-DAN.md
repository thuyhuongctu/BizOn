# Kiểm trích dẫn trước khi nộp bài

Script `scripts/research/kiem-trich-dan.mjs` kiểm trích dẫn theo APA 7 trong một tài liệu Markdown: dàn ý bài hội thảo, tài liệu thiết kế nghiên cứu, hồ sơ. Không cần cài thêm gì.

```
node scripts/research/kiem-trich-dan.mjs docs/research/TEN-TEP.md            # kiểm ngoại tuyến
node scripts/research/kiem-trich-dan.mjs docs/research/TEN-TEP.md --crossref # thêm tra DOI trên Crossref
```

## Script kiểm gì

| Kiểm | Lỗi hay cảnh báo |
|---|---|
| Mỗi trích dẫn `(Tác giả, năm)` hoặc `Tác giả (năm)` có mục trong «Tài liệu tham khảo» / «References» (khớp họ tác giả đầu và năm) | Lỗi |
| Mỗi mục tham khảo được trích ít nhất một lần | Lỗi |
| Số tác giả đúng APA 7: một tên với 1 tác giả, `A & B` với 2 tác giả, `A et al.` với từ 3 tác giả | Lỗi |
| DOI viết dạng `https://doi.org/10.…` | Lỗi |
| Hai mục cùng tác giả đầu và năm mà chưa thêm a/b | Lỗi |
| Mục không có DOI (sách, báo cáo của tổ chức) | Cảnh báo, kiểm tay |
| `--crossref`: họ tác giả đầu, năm (bản in hoặc trực tuyến) và tên bài khớp bản ghi Crossref của DOI | Lỗi |

Có lỗi thì mã thoát là 1. Script chỉ đọc metadata công khai của Crossref, không gửi thông tin người dùng.

## Giới hạn

- Script chỉ kiểm **trích dẫn khớp với danh mục**, không kiểm **nội dung bài được trích có nói đúng điều mình viết hay không**. Việc đó vẫn phải đọc bài (ghi rõ «mới đọc abstract» khi chưa đọc toàn văn).
- Trích dẫn theo số thứ tự ([1], [2]) chưa được hỗ trợ.

Kiểm ngày 25/11/2026: ba tài liệu (`THIET-KE-DOT-KHAO-SAT-SAU.md`, `doi-sanh-nen-tang-mo-phong.md`, dàn ý ISAGA 2027) không có lỗi; 25 DOI đều khớp Crossref.
