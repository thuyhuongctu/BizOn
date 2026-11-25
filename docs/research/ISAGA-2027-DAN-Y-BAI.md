# Dàn ý bài ISAGA 2027 · BizOn như một mô phỏng «mở được hộp đen»

**Lập ngày 25/11/2026.** Bài nộp cho ISAGA 2027 Tokyo (23–27/08/2027), loại *Research Paper*. Phần dàn ý bên dưới viết bằng tiếng Anh vì bài nộp bằng tiếng Anh.

## Dành cho chị: các mốc và quyết định cần chốt

**Mốc thời gian** (đã mở trang hội thảo ngày 25/11/2026 để xác nhận):

| Mốc | Ngày |
|---|---|
| Mở cổng nộp bài trên ConfTool | 29/10/2026 |
| **Hạn nộp bài nghiên cứu (research paper)** | **14/02/2027** |
| Hạn đăng ký tổ chức workshop (60 hoặc 90 phút, tóm tắt 300–600 từ) | 28/02/2027 |
| Hạn nộp poster (tóm tắt 300–600 từ) | 31/03/2027 |
| Báo kết quả | 30/04/2027 |
| Hạn nộp bản sửa | 31/05/2027 |

**Yêu cầu của bài nghiên cứu:**
- Viết bằng tiếng Anh, dài 6–15 trang, tính cả tóm tắt, hình, bảng và tài liệu tham khảo.
- Tóm tắt dài 150–250 từ.
- Theo khuôn chương sách (book chapter) của Springer.
- Phải khai báo việc dùng công cụ AI theo hướng dẫn của Springer.
- Phản biện một chiều ẩn danh (single-blind).
- Bài tốt có thể được chọn in trong bộ *Translational Systems Sciences* của Springer.

**Vì sao chọn bài thiết kế kèm thí điểm.** Trước 14/02/2027 chưa có số liệu của nhánh hộp đen: lớp ẩn giải thích chỉ bắt đầu từ học kỳ sau. Bài vì thế dựng trên ba thứ đã có thật:
1. Thiết kế công cụ: cờ ẩn giải thích, bảng mã dấu vết dc-v1, gói dữ liệu ẩn danh.
2. Đợt thí điểm tháng 10/2026, n = 125 phiếu.
3. Kế hoạch nghiên cứu hai nhánh với giả thuyết H1–H3, đã ghi trước trong `thiet-ke-nghien-cuu.html`.

ISAGA nhận cả bài ngắn về việc đang làm, nên hướng này hợp lệ. Bài cũng khớp với «bài phương pháp và công cụ» đã dự kiến gửi *Simulation & Gaming*. ISAGA là bước trình bày trước để lấy góp ý; bản tạp chí sau đó phải viết lại đủ mới để không trùng lặp.

**Chị cần chốt:**
1. Tác giả và thứ tự tác giả. Đề xuất: Đỗ Thùy Hương (tác giả liên hệ), Phan Anh Tú.
2. Có nộp thêm workshop chơi thử BizOn bản tiếng Anh, 90 phút, hạn 28/02 không.
3. Đợt 10/2026 có quyết định của hội đồng đạo đức hay phiếu đồng thuận lưu ở đâu. Em chưa thấy trong kho, nên mục «Ethics» bên dưới để trống chờ chị điền, em không tự viết.
4. Nguồn tài trợ, nếu có.

---

## Working title

**Opening the black box of a classroom business simulation: design, decision-trace analytics and pilot evidence from BizOn in the Mekong Delta**

Alternative: *Explainable or black-box? A design and pilot study of a bilingual international business simulation*

## Abstract (draft, 150–250 words)

<!-- abstract:start -->
Classroom business simulations are widely used, yet evidence about how they produce learning remains thin: most studies rely on short interventions and learner self-reports, and the simulation itself is usually treated as a black box. This paper presents BizOn, a bilingual (Vietnamese–English) web-based simulation suite for international business education developed at a university in the Mekong Delta, Viet Nam, and designed as a research instrument as well as a teaching tool. Three design features make this possible. First, a class-level switch hides the in-game explanations of mechanisms (adviser comments, forecasts and what-if previews) while events, data and scoring stay identical, which turns explainable versus black-box play into a controllable condition. Second, a rule-based scheme codes each logged decision as effectual, causal, leap or adaptive, and as consistent or inconsistent with the Uppsala sequence of knowledge before commitment. Third, an anonymised data pack links decision traces, case-based transfer tasks and blind rubric scores. A one-group pre–post pilot in two classes (125 questionnaires, 49 matched pairs) showed no change in knowledge (14.22 vs 14.20 out of 15) because of a ceiling effect, a small rise in self-efficacy (d_z = 0.25, p = .09), and the highest experience rating for the mechanism explanations (4.14 out of 5). We discuss what the pilot teaches about measurement and outline the planned two-arm study.
<!-- abstract:end -->

Keywords: business simulation; explainability; debriefing; learning analytics; internationalization; Uppsala model; effectuation

## Page budget (Springer chapter, target 13 of 15 pages)

| Section | Pages | Figures and tables |
|---|---|---|
| 1. Introduction | 1.5 | – |
| 2. Theoretical background | 1.5 | – |
| 3. Design of BizOn as a research instrument | 3.0 | Fig. 1 data flow; Table 1 hidden vs kept surfaces; Table 2 decision codes |
| 4. Pilot study | 2.5 | Table 3 pre–post results; Fig. 2 experience items |
| 5. Discussion | 2.0 | – |
| 6. Planned two-arm study | 1.0 | Fig. 3 2 × 2 design |
| 7. Conclusion and declarations | 0.5 | – |
| References | 1.0 | about 15 items |

## 1. Introduction

- **Problem.** Business simulations are a long-standing part of management education (Faria et al., 2009). Meta-analyses report learning gains from simulation games (Sitzmann, 2011; Wouters et al., 2013; Clark et al., 2016). Yet a recent mapping review of 71 studies in business education finds small samples, short interventions and a reliance on self-report measures (Salapi et al., 2026).
- **Gap 1: the black box.** Studies rarely isolate which part of a simulation does the teaching. The debate on guidance (Kirschner et al., 2006) and evidence on adaptive advice in a management simulation game (Leemkuil & de Jong, 2012) suggest that explanations and advice matter. In most published games, however, the explanatory layer cannot be switched off for comparison.
- **Gap 2: outcome versus process.** A recent foresight board game showed no clear advantage in output quality but strong process experience: engagement, understanding and interaction (Jirásek, 2026). This raises the question of what a simulation should be judged on. Debriefing scholarship places learning in the processing of experience (Crookall, 2010; Kriz, 2010).
- **This paper.** We describe how BizOn turns its explanatory layer into an experimental factor and logs decisions in a theory-coded form. We then report what a first pilot showed.
- **Questions addressed in this paper:**
  - (a) How can a classroom simulation be built so that explanation is a controllable condition?
  - (b) How can logged decisions be coded against internationalization theory?
  - (c) What did a first pilot reveal about feasibility and measurement?
- **Link to the conference theme.** «Sharing diverse realities»: BizOn brings the realities of small exporters in the Mekong Delta into a bilingual simulation. The black-box switch then gives two groups of learners deliberately different views of the same reality. Keep this link to one short paragraph and do not overclaim.

## 2. Theoretical background

- **Uppsala model.** Firms increase foreign market commitment as experiential knowledge accumulates (Johanson & Vahlne, 1977). In BizOn the adviser turns each round's results into an explanation of what is driving them. The primary mechanism tested later is whether this explanation converts play experience into transferable knowledge.
- **Effectuation and causation.** Entrepreneurs either act with available means and learn from feedback, or plan and commit on forecasts (Sarasvathy, 2001). Decision traces show which logic teams use after market events.
- **Explanation, advice and transfer.** Fully unguided discovery is inefficient (Kirschner et al., 2006). Adaptive advice can improve learning in simulation games (Leemkuil & de Jong, 2012). The expected pattern: explanations should improve reasoning about *why*, more than the choice of *what*.

## 3. Design of BizOn as a research instrument

- **3.1 The suite.** A three-tier journey: tier 1 is Bến Phù Sa (floating-market trading), tier 2 is Bật Nghiệp (six-round firm simulation against three rule-based rival CEOs), tier 3 is the Passports (brand and durian export). It ships in Vietnamese and English, and an instructor dashboard and classroom screen support whole-class play.
- **3.2 The explanation switch** (source: `docs/architecture/NHANH-HOP-DEN.md`).
  - The class flag `explain_hidden` hides the surfaces that say *why* or *what will happen*: adviser comments, forecasts, what-if previews and lesson cards.
  - It keeps the surfaces that say *what happened* or *what you can do*: events and their quantified effects, results, rules and purchased market data.
  - The condition is written on every submission.
  - **Table 1** lists hidden versus kept surfaces per game.
- **3.3 Decision-trace coding dc-v1** (source: `docs/research/MA-HOA-DAU-VET.md`).
  - Each decision is labelled effectual, causal, leap, adaptive or start, and flagged `uppsala_ok` when commitment follows knowledge or a demand signal.
  - In tier 2, an expansion of at least 15 % in production counts as informed if the previous round had lost sales.
  - The paper will report a sensitivity analysis at 10 % and 20 %.
  - **Table 2** shows the coding rules for the three tiers.
  - Limitation to state: the scheme has not yet been validated against hand coding. The plan is two coders on 30 decisions, reporting Cohen's κ.
- **3.4 Research data pack and blind scoring.**
  - Anonymised keys (FNV-1a hashes) link participants, teams, rounds, decisions, case tasks and surveys.
  - The case task has two parallel forms, A and B.
  - A blind scoring page computes Cohen's κ and ICC.
  - **Fig. 1** shows the data flow from game to analysis.

## 4. Pilot study (October 2026)

- **Setting.** Two undergraduate international business classes (KTM330HM01, KTM330HM02) played Bật Nghiệp. Questionnaires were collected from 15 to 19 October 2026. All play took place with explanations shown, because the switch was added on 27 October 2026.
- **Instrument.** 15 knowledge items, 8 self-efficacy items (Likert 1–5), 5 experience items (post only), net promoter score and two open questions.
- **Analysis.** Paired t-test and Wilcoxon signed-rank test, effect size d_z, script `scripts/research/phan-tich-truoc-sau.mjs`.
- **Results** (source: `docs/research/KET-QUA-TRUOC-SAU-2026-10.md`). **Table 3** reports:
  - **Sample:** 125 questionnaires (67 pre, 58 post), 49 matched pairs; 27 questionnaires (18 pre, 9 post) could not be matched because class codes were typed inconsistently.
  - **Knowledge:** 14.22 → 14.20 out of 15, d_z = −0.02, p = .88. Ceiling: 28 of 67 pre questionnaires (42 %) scored 15/15, and 56 of 67 (84 %) scored at least 14.
  - **Self-efficacy (total out of 40):** 30.61 → 31.10, d_z = 0.25, p = .09 (Wilcoxon p = .14).
  - **Largest single item:** break-even estimation, +0.31 in KTM330HM02, d_z = 0.45.
  - **Experience (post, n = 58; Fig. 2):**
    - mechanism explanations helped draw lessons: 4.14;
    - learning by doing was clearer than lectures: 4.03;
    - want to keep using: 3.97;
    - more engaging than a usual class: 3.91;
    - team meeting and AI adviser helped me know what to do: 3.41 (lowest).
  - **Net promoter score:** −3 (n = 58).
- **What the pilot cannot show.** No control group, a ceiling-limited knowledge test, and self-report only. Round-level logs (`rounds.csv`) were empty for these class codes, so questionnaires could not be linked to decision traces.

## 5. Discussion

- **Measurement lessons.**
  - The ceiling led to a second knowledge set with five harder items; target pre-test mean about 9–10 out of 15.
  - Matching losses led to class codes locked in the survey link.
  - Both changes are documented before the next round of data collection.
- **Outcome versus process.** Like Jirásek (2026), the pilot shows stronger evidence on process experience than on measured outcomes. The paper should say this plainly rather than present experience ratings as learning.
- **The adviser item.** The lowest-rated experience item concerns the team meeting and AI adviser. This is a reason to test explanations experimentally rather than assume they help, which is the purpose of the explanation switch.
- **Limitations.**
  - Single site, two classes, one instructor.
  - Self-report measures.
  - Behavioural traces not yet linked to questionnaires.
  - The coding scheme not yet validated.

## 6. Planned two-arm study (pre-registered in the design page)

- **Design.** Classes are assigned to explanation shown or hidden (class-level flag, set before week 1). The case task is given before and after six rounds, with forms A and B alternated. Two blind raters score it with rubric rb-v1. **Fig. 3** shows the 2 × 2 design.
- **Hypotheses** (from `thiet-ke-nghien-cuu.html`):
  - **H1:** after six rounds, shown classes reason better (WHY score) than hidden classes, adjusting for the pre score. Expected Hedges' g ≥ 0.4. Model: Post = β₀ + β₁·Shown + β₂·Pre + u_class + ε.
  - **H2:** correct choices (ALIGNED) rise in both arms; mechanism explanations (EXPLAIN) rise only in the shown arm. Tested as phase × condition interaction.
  - **H3:** teams with a higher share of adaptive decisions after events score higher on WHY; teams with more leap decisions score lower. Associational, not causal.
- **Power.** 60–100 students can detect only d ≥ 0.5–0.6. Clustering by class must be modelled and reported. Inter-rater thresholds: κ ≥ 0.60 for WHY, ICC(2,k) ≥ 0.75 for EXPLAIN.

## 7. Conclusion and declarations

- **Contribution.** A reusable pattern for making the explanatory layer of a simulation an experimental factor, plus a theory-coded decision log. The paper also reports honestly what a first pilot can and cannot show.
- **Declarations required by Springer and ISAGA:**
  - **Use of AI tools:** state which tools were used in software development and in drafting or editing text, and confirm that the authors checked all content. Chị chốt câu chữ.
  - **Ethics:** chị điền (xem mục «Chị cần chốt» ở trên).
  - **Funding:** chị điền.
  - **Competing interests:** the authors developed BizOn.

## References (APA 7; every DOI checked on Crossref on 25/11/2026)

Clark, D. B., Tanner-Smith, E. E., & Killingsworth, S. S. (2016). Digital games, design, and learning: A systematic review and meta-analysis. *Review of Educational Research, 86*(1), 79–122. https://doi.org/10.3102/0034654315582065

Crookall, D. (2010). Serious games, debriefing, and simulation/gaming as a discipline. *Simulation & Gaming, 41*(6), 898–920. https://doi.org/10.1177/1046878110390784

Faria, A. J., Hutchinson, D., Wellington, W. J., & Gold, S. (2009). Developments in business gaming: A review of the past 40 years. *Simulation & Gaming, 40*(4), 464–487. https://doi.org/10.1177/1046878108327585

Jirásek, M. (2026). Distant Futures: Developing future scenarios through a board game. *Simulation & Gaming*. Advance online publication. https://doi.org/10.1177/10468781261509429

Johanson, J., & Vahlne, J.-E. (1977). The internationalization process of the firm: A model of knowledge development and increasing foreign market commitments. *Journal of International Business Studies, 8*(1), 23–32. https://doi.org/10.1057/palgrave.jibs.8490676

Kirschner, P. A., Sweller, J., & Clark, R. E. (2006). Why minimal guidance during instruction does not work: An analysis of the failure of constructivist, discovery, problem-based, experiential, and inquiry-based teaching. *Educational Psychologist, 41*(2), 75–86. https://doi.org/10.1207/s15326985ep4102_1

Kriz, W. C. (2010). A systemic-constructivist approach to the facilitation and debriefing of simulations and games. *Simulation & Gaming, 41*(5), 663–680. https://doi.org/10.1177/1046878108319867

Leemkuil, H., & de Jong, T. (2012). Adaptive advice in learning with a computer-based knowledge management simulation game. *Academy of Management Learning & Education, 11*(4), 653–665. https://doi.org/10.5465/amle.2010.0141

Salapi, C. E., Orias, M. C., & Sarsale, M. (2026). Gamification in business education: A Scopus-based systematic mapping review. *Entrepreneurship Education*. Advance online publication. https://doi.org/10.1007/s41959-026-00205-9

Sarasvathy, S. D. (2001). Causation and effectuation: Toward a theoretical shift from economic inevitability to entrepreneurial contingency. *Academy of Management Review, 26*(2), 243–263. https://doi.org/10.2307/259121

Sitzmann, T. (2011). A meta-analytic examination of the instructional effectiveness of computer-based simulation games. *Personnel Psychology, 64*(2), 489–528. https://doi.org/10.1111/j.1744-6570.2011.01190.x

Wouters, P., van Nimwegen, C., van Oostendorp, H., & van der Spek, E. D. (2013). A meta-analysis of the cognitive and motivational effects of serious games. *Journal of Educational Psychology, 105*(2), 249–265. https://doi.org/10.1037/a0031311

**Ghi chú về nguồn:**
- Salapi et al. (2026) và Jirásek (2026) mới đọc abstract. Phải đọc toàn văn trước khi trích kết quả cụ thể trong bài nộp.
- Tên bài và phụ đề của Clark et al. (2016) và Faria et al. (2009) đã khớp với trường `title` và `subtitle` trên Crossref.
- DOI của Sarasvathy (2001) dùng bản chuẩn trên Crossref (10.2307/259121). Địa chỉ cũ 10.5465/amr.2001.4378020 chuyển hướng về DOI này.

## Kế hoạch đến 14/02/2027

| Tuần | Việc | Người làm |
|---|---|---|
| 01/12–14/12/2026 | Chốt tác giả, đạo đức, workshop; đọc toàn văn Salapi, Jirásek, Leemkuil & de Jong | Chị |
| 01/12–21/12/2026 | Mã hóa tay 30 quyết định để tính κ cho dc-v1 (nếu kịp, đưa vào mục 3.3) | Hai người mã hóa |
| 15/12/2026–10/01/2027 | Viết bản thảo đủ 7 mục theo khuôn Springer; vẽ Hình 1–3 | Chị, em hỗ trợ |
| 11/01–31/01/2027 | Thầy Tú đọc góp ý; sửa | Thầy Tú, chị |
| 01/02–10/02/2027 | Soát số liệu với `KET-QUA-TRUOC-SAU-2026-10.md`, soát DOI, đếm trang, khai báo AI | Chị, em hỗ trợ |
| trước 14/02/2027 | Nộp trên ConfTool | Chị |
