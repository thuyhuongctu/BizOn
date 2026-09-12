# Superpowers skills — nguồn gốc và giấy phép

Mười ba thư mục kỹ năng dưới đây được sao chép từ dự án
[obra/superpowers](https://github.com/obra/superpowers), **phiên bản v6.3.0**
(commit `b36e082`), lấy về ngày 19/08/2026.

| Kỹ năng | Dùng khi |
|---|---|
| `brainstorming` | Làm rõ ý tưởng mơ hồ trước khi bắt tay viết mã |
| `writing-plans` | Viết kế hoạch triển khai chi tiết |
| `executing-plans` | Thi hành kế hoạch đã duyệt, từng bước |
| `subagent-driven-development` | Thi hành kế hoạch bằng nhiều tác tử con |
| `dispatching-parallel-agents` | Chạy nhiều tác tử song song cho việc độc lập |
| `using-git-worktrees` | Tạo không gian làm việc cô lập cho mỗi nhánh |
| `test-driven-development` | Viết kiểm thử trước, mã sau |
| `systematic-debugging` | Truy lỗi có phương pháp thay vì đoán mò |
| `verification-before-completion` | Bắt buộc có bằng chứng trước khi tuyên bố "xong" |
| `requesting-code-review` | Cử tác tử con phản biện phần việc vừa làm |
| `receiving-code-review` | Xử lý góp ý phản biện một cách nghiêm túc |
| `finishing-a-development-branch` | Quyết định cách hợp nhất một nhánh đã xong |
| `writing-skills` | Viết và kiểm thử kỹ năng mới cho kho này |

Hai kỹ năng đáng chú ý nhất với kho này là `test-driven-development` và
`verification-before-completion`: `js/engine.js` là engine dùng để **chấm điểm
sinh viên**, và `test/README.md` đã nêu rõ một sai số ở đó làm sai điểm và phá
tuyên bố "engine xác định, kết quả tái lập được" trong hồ sơ học thuật.

## Những gì **không** được cài

- **`using-superpowers`** — kỹ năng khởi động của bản plugin, không cần thiết
  khi các kỹ năng nằm trực tiếp trong `.claude/skills/`.
- **Hook `SessionStart`** của dự án gốc, vốn chèn một khối chỉ dẫn
  `<EXTREMELY_IMPORTANT>` vào đầu mọi phiên làm việc trong kho.

Trong văn bản các kỹ năng còn giữ cách gọi chéo theo kiểu plugin
(`superpowers:tên-kỹ-năng`). Ở kho này chúng chỉ là tên thư mục trong
`.claude/skills/`, bỏ tiền tố `superpowers:` khi tra cứu.

## Giấy phép

```
MIT License

Copyright (c) 2025 Jesse Vincent

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Giấy phép MIT yêu cầu giữ nguyên thông báo bản quyền ở trên trong mọi bản sao;
đó là lý do tệp này tồn tại. Phần kỹ năng nhập từ Superpowers **không** thuộc
phạm vi bản quyền của BizOn nêu trong `LICENSE`.
