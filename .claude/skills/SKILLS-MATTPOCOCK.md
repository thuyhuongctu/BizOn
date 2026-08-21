# Skills For Real Engineers (mattpocock/skills) — nguồn gốc và giấy phép

Sáu thư mục kỹ năng dưới đây được sao chép từ dự án
[mattpocock/skills](https://github.com/mattpocock/skills), commit `885e2ca`,
lấy về ngày 19/08/2026. Tất cả đều thuộc nhóm `skills/productivity/` của kho
gốc — nhóm không phụ thuộc ngôn ngữ lập trình.

| Kỹ năng | Dùng khi |
|---|---|
| `grilling` | Chất vấn liên tục một kế hoạch, quyết định hay ý tưởng theo "cây quyết định": mỗi vòng hỏi trọn một lớp câu hỏi kèm phương án đề xuất, rồi đợi trả lời |
| `grill-me` | Bí danh gọi tay của `grilling` |
| `handoff` | Nén cuộc hội thoại hiện tại thành tài liệu bàn giao cho phiên sau tiếp tục |
| `wait-what` | Khi một câu trả lời không lọt tai: buộc trình bày lại từ đầu theo cách khác |
| `to-questionnaire` | Biến một quyết định mình không tự trả lời được thành bảng hỏi cho người khác điền |
| `teach` | Dạy người dùng một khái niệm hay kỹ năng mới ngay trong kho làm việc |

Thư mục `agents/openai.yaml` trong mỗi kỹ năng là siêu dữ liệu dành cho Codex;
để nguyên cũng không ảnh hưởng Claude Code.

## Những gì **không** lấy và lý do

- **Nhóm `engineering/`** — phần lớn giả định một dự án TypeScript có issue
  tracker được cấu hình sẵn, và **trùng vai trò** với bộ Superpowers cài cùng
  đợt (xem `SUPERPOWERS.md`): `tdd` ↔ `test-driven-development`, `code-review`
  ↔ `requesting-code-review` + `receiving-code-review`, `diagnosing-bugs` ↔
  `systematic-debugging`, `implement`/`to-spec` ↔ `writing-plans` +
  `executing-plans`. Cài cả hai bộ sẽ tạo ra hai quy trình cạnh tranh nhau cho
  cùng một việc.
- **`productivity/writing-for-agents`** — trùng vai trò với `writing-skills`
  của Superpowers.
- **`misc/git-guardrails-claude-code`** — cài hook chặn `git push` (mọi biến
  thể), `git reset --hard`, `git clean -f`, `git branch -D`. Nghe thì an toàn
  nhưng sẽ chặn đứng quy trình nhánh phát triển + pull request của kho này.
  Muốn bảo vệ nhánh chính thì bật branch protection trên GitHub, đúng chỗ hơn.
- **`misc/*` còn lại** (Husky pre-commit, shoehorn cho TypeScript,
  scaffold-exercises) và **nhóm `in-progress/`** mà tác giả ghi rõ là chưa
  hoàn thiện.

## Giấy phép

```
MIT License

Copyright (c) 2026 Matt Pocock

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
đó là lý do tệp này tồn tại. Phần kỹ năng nhập từ kho này **không** thuộc phạm
vi bản quyền của BizOn nêu trong `LICENSE`.
