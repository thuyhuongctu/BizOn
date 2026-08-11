# 🎙️ Lumina AI advisor – English voice-over script

> Bản thoại tiếng Anh để thu giọng, song song với bản tiếng Việt trong
> [`loi-thoai-lumina.md`](loi-thoai-lumina.md).
>
> **Tên tệp giữ nguyên như bản tiếng Việt, chỉ khác thư mục:**
> tiếng Việt `assets/audio/voice/adv-02.mp3` → tiếng Anh `assets/audio/voice/en/adv-02.mp3`.
> Nhờ vậy game chỉ cần đổi tiền tố thư mục theo nút VI/EN, không phải dò bảng.
>
> **Chưa thu câu nào.** 51/51 câu đang chờ.

## Vì sao bản tiếng Anh ngắn hơn bản tiếng Việt một câu

`chat-01` bị loại khỏi danh sách thu ở cả hai ngôn ngữ. Câu đó không phải một
câu thoại mà là khuôn định dạng `【vai trò】 nội dung` trong `js/app.js:1188`:
cả hai phần đều do máy điền, phần nội dung chính là các câu `adv-XX` đã có bản
thu riêng. Đọc `chat-01` sẽ chỉ tạo ra một bản trùng.

Vì vậy: **51 câu** cần thu, không phải 52.

## Điểm khác biệt lớn nhất so với bản tiếng Việt

Bản tiếng Việt phải viết dài các từ viết tắt vì đọc "CEO", "ROI" theo lối Việt
nghe không chuẩn. **Tiếng Anh thì ngược lại:** CEO, CFO, CMO, COO, ROI, OEE,
KPI, R&D đều là cách nói hằng ngày, đọc thẳng theo từng chữ cái là đúng nhất.
Nên bảng tra bên dưới ngắn hơn nhiều.

### Bảng tra – chỉ những chỗ cần đọc khác mặt chữ

| Trong câu | Đọc thành | Vì sao |
|---|---|---|
| `SEC` | **Secretary** | Đọc "S-E-C" trong tiếng Anh dễ bị hiểu là Uỷ ban Chứng khoán Mỹ. Trong game đây là vai Thư ký. |
| `₫` · `tr₫` · `k₫` | **dong** · **million dong** · **thousand dong** | |
| `ERR_AI_LIMIT_REACHED` | **bỏ, không đọc** | Mã lỗi hiện trên màn hình; câu sau đã nói đủ ý. |
| `R&D` | **R and D** | |
| `%` | **percent** | |
| Số trong ngoặc `{…}` | đọc một con số bất kỳ | Chỗ trống điền số liệu động. |

**Không đổi:** CEO, CFO, CMO, COO, ROI, OEE, KPI, ESG, Marketing Mix,
Marketing Boost, R&D Upgrade, Branding Premium, Brand Loyalty, Commit – đọc
nguyên văn theo lối tiếng Anh.

### Tên riêng tiếng Việt

Giữ nguyên cách phát âm tiếng Việt, đừng Anh hoá – đó là bản sắc của sản phẩm:
**Cần Thơ, Đà Nẵng, Khánh Hòa, Thanh Hóa, Hà Nội, Hồ Chí Minh, Bật Nghiệp,
Lumina, Tú Phan, Đỗ Thùy Hương.** Riêng `BizOn`, `BizOn Go Global`,
`Brand Passport` đọc theo tiếng Anh.

---

## 1. Role advisor brain — 17 câu (`adv-01` … `adv-17`)

| File | Line |
|---|---|
| `voice/en/adv-01.mp3` | Customers are steadily drifting away to our competitors — a sign our brand is losing its pull. Consider a repositioning campaign before we lose more market share. |
| `voice/en/adv-02.mp3` | Rivals are taking over our segment with cheap prices. We need to raise the advertising budget, or launch a new **R and D** product. |
| `voice/en/adv-03.mp3` | Dear CMO, our marketing spend is far too high but it isn't converting into matching revenue. Let's review the campaign message. |
| `voice/en/adv-04.mp3` | Market demand is very strong but we don't have enough stock to sell. Please coordinate with the COO to raise output. |
| `voice/en/adv-05.mp3` | CMO, a competitor has just cut prices by fifteen **percent** and taken eight **percent** of our market share. If we don't respond next round, we will lose our leading position. |
| `voice/en/adv-06.mp3` | Inventory is piling up and wasting storage costs. Please work with the CMO to push sales, or cut production. |
| `voice/en/adv-07.mp3` | COO, I'm seeing a sharp rise in the defect rate. The cause is that our new staff haven't been properly trained. We should invest in the "Advanced Training" package to get back on form. |
| `voice/en/adv-08.mp3` | COO, the factory is running over capacity. If we don't invest in expansion now, we'll miss the sales window next round. |
| `voice/en/adv-09.mp3` | The market is thirsty for our product but we can't supply enough. This is the moment to add overtime shifts, or expand capacity. |
| `voice/en/adv-10.mp3` | Operations are running smoothly, COO. Keep up the scheduled maintenance and watch the OEE to hold this form. |
| `voice/en/adv-11.mp3` | **Secretary**, the departments still haven't agreed on the final numbers. Remind the CEO to commit right away, before the system locks us out! |
| `voice/en/adv-12.mp3` | The history log is empty. The **Secretary** needs to note the key events, so the team has something to analyse in later rounds. |
| `voice/en/adv-13.mp3` | Excellent! The whole team is ready. **Secretary**, run one last check, then tell the CEO to hit that legendary Commit button. |
| `voice/en/adv-14.mp3` | CFO, liquidity is in the red zone! Cash is down to {…} **million dong**, and inventory turnover has stretched to {…} days. Approve an emergency loan or cut costs right now — don't let us miss payroll. |
| `voice/en/adv-15.mp3` | Our current ROI, {…} **percent**, is running above the cost of borrowed capital, {…} **percent**. This is a good moment to use financial leverage and expand production, CFO. |
| `voice/en/adv-16.mp3` | Liquidity is stable, and inventory turnover of {…} days sits inside the safe range. Keep spending disciplined and track cash flow every round. |
| `voice/en/adv-17.mp3` | The event "{…}" has just hit! **Secretary**, gather the production picture from the COO quickly and report to the CEO, so we can adjust the selling price in time. |

## 2. KPI congratulations — 3 câu

| File | Line |
|---|---|
| `voice/en/kpi-01.mp3` | Wonderful work, CFO! Your capital-structure strategy has delivered record profit — an ROI of {…} **percent**. Cash flow is more than strong enough to reinvest and expand! |
| `voice/en/kpi-02.mp3` | Congratulations, CMO! Your Marketing Mix campaign has beaten the competition outright. The team's brand is now the customers' number one choice! |
| `voice/en/kpi-03.mp3` | COO, factory performance has hit an unbelievable level — OEE {…} **percent**, defects {…} **percent**! Preventive maintenance and worker training have kept the line running perfectly. |

## 3. Risk alerts — 2 câu

| File | Line |
|---|---|
| `voice/en/risk-01.mp3` | The production line is crying for help! A defect rate this high will eat straight into gross profit. Don't push the machines past their limit and skip maintenance — schedule regular servicing and train the technical staff. |
| `voice/en/risk-02.mp3` | CEO, we are standing at the edge of technical insolvency. The trade-off between fast growth and cash-flow safety has slipped out of balance — call an emergency team meeting and review the decisions. |

## 4. Lumina in the chat panel — 7 câu (`chat-02` … `chat-08`)

`chat-01` đã loại, xem phần đầu tài liệu.

| File | Line |
|---|---|
| `voice/en/chat-02.mp3` | Hello, Je m'appelle Hương! I'm Lumina, the AI advisor for team {…}. Pick a question below and I'll run a what-if analysis for you. |
| `voice/en/chat-03.mp3` | The three hundred **million dong** loan has been disbursed! Note: interest of five **percent** per round — fifteen **million dong** — comes off your profit every remaining round. Use the capital well, so your ROI beats the cost of capital. |
| `voice/en/chat-04.mp3` | Cost cutting is active — fixed costs drop fifteen **percent** next round. Be careful not to cut into long-term investment! |
| `voice/en/chat-05.mp3` | Branding Premium is active! Brand value is up — market share and Brand Loyalty will improve from next round. |
| `voice/en/chat-06.mp3` | Emergency maintenance is scheduled! OEE will improve by three points and the defect rate will fall next round. |
| `voice/en/chat-07.mp3` | *(bỏ mã lỗi)* You've used up your advisory turns for this round. They refresh once you commit your decision! |
| `voice/en/chat-08.mp3` | *(bỏ mã lỗi)* Lumina is busy! You've used up your advisory turns for this round. Your questions refresh once you commit the decision. |

## 5. Topic advice — 7 câu

| File | Line |
|---|---|
| `voice/en/topic-01.mp3` | This round is a Price War — customers are extremely price-sensitive. If you hold your price above {…} **thousand dong**, market share could fall sharply. Consider cutting ten to fifteen **percent** and making it up on volume. |
| `voice/en/topic-02.mp3` | Last round you lost {…} orders to stockouts — demand is outstripping supply. If you raise the price five to ten **percent**, your margin improves while market share barely moves. |
| `voice/en/topic-03.mp3` | The market reference price is {…} **thousand dong**. Cut the price ten **percent** and the model forecasts a three to four point gain in market share, but a thinner margin — only worth it if your volume is large enough. |
| `voice/en/topic-04.mp3` | Raise the marketing budget another fifteen **percent** and market share is projected to reach {…} **percent** next round.{…} Recommended: Marketing Boost, **R and D** Upgrade. |
| `voice/en/topic-05.mp3` | Red alert: {…} — {…} If you don't keep at least fifteen **percent** of your capital in reserve, the team could go cash-flow negative. Consider buying the "Insurance Shield" in the Shop. |
| `voice/en/topic-06.mp3` | The main risk this round: {…}. {…} Adjust your cost structure before you commit. |
| `voice/en/topic-07.mp3` | An emerald opportunity: {…}. {…} This is the time to invest boldly and break away on market share. |

## 6. Team Journal quotes — 6 câu

| File | Giọng | Line |
|---|---|---|
| `voice/en/quote-01.mp3` | Lumina AI | The goal is not to defeat your competitors, but to make them irrelevant. |
| `voice/en/quote-02.mp3` | **Secretary** | Every financial report tells a story — make sure your team is writing a successful chapter. |
| `voice/en/quote-03.mp3` | Phan Anh Tú | Data tells us the past. The decisions we make today write the future. |
| `voice/en/quote-04.mp3` | Lumina AI | A crisis is the best test there is of cash-flow management. |
| `voice/en/quote-05.mp3` | Phan Anh Tú | Market share can be bought with money, but loyalty has to be built with value. |
| `voice/en/quote-06.mp3` | **Secretary** | Don't be afraid of committing to the wrong call — be afraid of learning nothing from it. |

## 7. BizOn Go Global slider hints — 3 câu

| File | Line |
|---|---|
| `voice/en/glob-01.mp3` | Lumina here: market share is weak — consider lowering the price, or localising further to fit the local culture. |
| `voice/en/glob-02.mp3` | Lumina here: you're running a loss this quarter — tighten the budget, or accept it as market-entry investment. |
| `voice/en/glob-03.mp3` | Lumina here: nicely balanced! The digital era rewards those who dare to invest in digital marketing at the right moment. |

## 8. Game intro slides — 6 câu

| File | Slide | Line |
|---|---|---|
| `voice/en/intro-01.mp3` | 🇻🇳 Vietnam 2026 | The economy is rising — the dragon is waking. Your team runs a clay toy company: a start-up from the Mekong Delta, with ambitions across both the domestic and the international market. |
| `voice/en/intro-02.mp3` | 🏺 Your business | You run a handmade clay toy workshop in **Cần Thơ**, with starting capital of five hundred **million dong**. Your flagship product: the "Vietnamese Clay Mascot Set" — a gift and collectors' line, reference price one hundred and fifty **thousand dong** per set. Your company's name is whatever your team chose at login! |
| `voice/en/intro-03.mp3` | 🗺️ 6 rounds · 6 provinces | Each round is a business quarter in one province or city on the new map: **Cần Thơ**, then **Hồ Chí Minh** City, then **Khánh Hòa**, then **Đà Nẵng**, then **Thanh Hóa**, then **Hà Nội**. Win a round and your team plants its flag on that province! Each round runs five to seven minutes; a full game, thirty to forty-five. |
| `voice/en/intro-04.mp3` | 👥 The C-Suite | The CEO steers strategy, the CFO guards the treasury, the CMO takes the market, the COO runs the workshop, and the **Secretary** keeps the minutes — alongside your advisor Lumina AI, and Professor **Tú Phan**. |
| `voice/en/intro-05.mp3` | 🌏 Then: the open sea | Conquered Vietnam? BizOn Go Global is waiting — choose one of seven international markets, negotiate with local partners, and test yourself against four entry modes. |
| `voice/en/intro-06.mp3` | 🏆 Your goal | Plant the most flags, take the number one share of the Vietnamese market, and earn your certificate of completion. Ready for **Bật Nghiệp**? |

---

## Ba câu chào đăng nhập

Bản tiếng Việt có thêm ba câu chào ngoài bảng (`huong-intro.mp3` và hai câu
cùng nhóm). Chưa soạn bản tiếng Anh cho ba câu này vì nội dung còn phụ thuộc
màn đăng nhập – sẽ bổ sung khi chốt.

## Ghi chú kỹ thuật

- Định dạng nên giống bản tiếng Việt: MP3, 44,1 kHz, khoảng 192 kbps.
- Ước tính tổng thời lượng: **khoảng 7 tới 8 phút** cho cả 51 câu.
- Chưa nối vào game. Việc nối chờ đủ cả hai ngôn ngữ, để nút VI/EN đổi giọng
  cùng lúc với đổi chữ, tránh tình trạng nửa tiếng Việt nửa tiếng Anh.
