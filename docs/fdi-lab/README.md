# Handoff: FDI Lab · Nhà máy FDI

## Overview
Re-skin of the existing 8-quarter FDI factory simulation (repo `thuyhuongctu/Fdi-Lab`, live at `thuyhuongctu.github.io/BizOn/lab/nha-may-fdi.html`) into the BizOn Lab visual system shared with CMR Lab and CVP Lab, plus a gamification layer: 5 teams, XP, levels, a class leaderboard and a teacher projector view that controls which quarters are open. VI/EN toggle throughout.

## About the Design Files
`FDI Lab.dc.html` is a **design reference built in HTML**, a working prototype rather than production code. Rebuild it in the target codebase (the existing static `lab/` pages). **Keep `nha-may-fdi-engine.js` and `nha-may-fdi-data.js` unchanged**: the prototype loads and calls them directly (`FactoryEngine.newGame / playQuarter / normalizeAlloc / summary / decisionLog / seedFrom`, `FactoryData.industries / markets / events / benchmarks`). Only the UI and the XP layer are new. To try it, open the file in a browser with `support.js` and both engine files next to it. All three artboards share one state.

## Fidelity
High-fidelity. Final colors, type, spacing, radii, shadows and copy in both VI and EN.

## Screens
### 1a: Student desktop (1440 wide)
- **Top bar** (pill `#FBF9F4`): logo tile "B" `#3E5C8A`, brand + subtitle, link to the class script (`https://bizonland.com/lop-hoc.html`), VI/EN segmented control, XP chip (`#C9A24A`, team-color dot).
- **Setup phase**
  - Hero: eyebrow pill, headline (Baloo 2 800, 68px), lead text, two source chips (gold dot: illustrative parameters; green dot: real Customs reference figures). Dragon with magnifier in the middle.
  - Team card in the team's color: level name, LVL coin, XP bar (`xp % 100`), XP rules.
  - Team picker: 5 tiles, 104px tall.
  - Industry choice: 2 cards from `FactoryData.industries`; the selected card is `#3E5C8A` with a navy outline. Optional cohort-code input, then the Start button `#8C2F39`.
- **Play phase**
  - Industry label, "Quarter q/8" (64px), 8-segment progress bar: done `#8FAF98`, current `#3E5C8A` with a ring, future `#E0DACB`.
  - **Event card** `#F3EAD3` with the dragon-boat image: "Inspired by …" tag, title, text, and effect chips built from the event fields (`demand`, `disruption`, `importFreight`, `priceCut`, `tariff`, `transship`). Chips are green when good, burgundy when bad, plum for transshipment.
  - **Decisions card** (560px):
    - Local-input slider (0 to `maxLocal`, step 5) and the current local premium: `localPremium·exp(−supplierCum/supplierScale)`.
    - Two status dots: rule of origin met at ≥40% (green); transshipment risk below 30% (burgundy).
    - 4 market sliders (0–100) with the normalized share and a normal-demand hint.
    - Supplier investment: 4 options (0 / 0.25 / 0.5 / 1.0 million USD).
    - "Commit quarter q" button. It is grey with "Waiting for teacher" while `q > gate`.
  - **Results card**:
    - 4 KPI tiles: profit (sage when positive, burgundy when negative), exports `#A9B4CF`, imported inputs `#E3C7C2`, domestic value-added share (green ≥45%, gold <30%, blue otherwise).
    - Market table: offered, sold, tariff (green 0%, copper above 0%, burgundy ≥20%), revenue in USD millions.
    - Output note and unsold note.
  - **Chart**: SVG 760×240, exports `#3E5C8A` and imported inputs `#8C2F39` side by side per quarter, domestic value-added % above each pair, 5 gridlines.
  - **Leaderboard** (navy card).
- **End phase**
  - Title "Report after 8 quarters" with the dragon-scroll image.
  - 4 KPI tiles for the whole game.
  - Badge pills from `summary().badges`: resilient and upgrader are blue; assembler and transship_flag are burgundy.
  - Full chart.
  - Benchmark card `#E4E8F1`: your imported-inputs/exports ratio against the Customs figure for the FDI sector, plus the note.
  - 4 discussion questions.
  - Buttons: download the decision log (JSON) and play again.
- **Footer**: credit line (translated), sources note, APA citation with DOI link.
- **Overlays**: level-up modal (dragon-jump image, LVL coin) and a "+N XP" toast for 1.8s.

### 1b: Student mobile (390×844)
- Header: dragon-wink image, brand, VI/EN toggle, XP chip.
- Bottom tab bar with 4 tabs: Decide / Results / Chart / Ranking. The first tab shows Setup, Decide or the end screen depending on the phase. Targets are at least 44px.

### 1c: Teacher projector (1920×1080)
- Navy background, dragon-wave image in a circle, "Team race", Total XP and "Open through Qn".
- Large event card for the current gate quarter, to discuss in class.
- 5 vertical XP bars, one per team.
- Right column:
  - "Open quarters": 8 buttons. Current is gold, opened is sage, locked is cream.
  - "Award bonus XP": 5 team buttons, +10 each.
  - Reset class: XP back to the starting values, gate back to Q1, current game cleared.

## XP rules
- +10 for each committed quarter.
- +10 if that quarter's profit ≥ 0.
- +10 if that quarter's domestic value-added share ≥ 45%.
- On the last quarter, +25 for each positive badge (assembler and transship_flag don't count).
- Level = floor(xp/100). Level names: Thực tập sinh / Quản đốc / Giám đốc nhà máy / Tổng giám đốc (Intern / Floor manager / Plant director / CEO).
- Starting XP for the demo: [70, 150, 40, 120, 95].

## Behavior notes
- Seed: the same cohort code gives the same random path, using `seedFrom(code + '|' + industry)`. With no code, the seed comes from `Date.now()`.
- The investment choice resets to 0 after each commit. Local share and market split carry over to the next quarter.
- Number formatting follows the language: `vi-VN` or `en-US`.
- localStorage key `fdilab-v1` saves lang, team, xp, industry, cohort, game, decisions, gate and tab. In production, XP and the gate should come from a server so they sync in real time across the classroom.
- Prop `demoPhase` (live/play/end) fills a preview game for review only. It is not needed in production.

## Design tokens
Same as CVP Lab:
- Navy `#1F2A44`, cream `#F4F1EA`, card `#FBF9F4`, input `#ECE7DC`
- Burgundy `#8C2F39`, gold `#C9A24A`, blue `#3E5C8A`, copper `#A8703A`, plum `#7E5E77`, sage `#8FAF98`, green `#3F6E52`, periwinkle `#A9B4CF`, sand `#F3EAD3`, mist `#E4E8F1`
- Team colors: `#8C2F39`, `#A8703A`, `#C9A24A` (with dark text), `#3E5C8A`, `#7E5E77`
- Fonts: Baloo 2 for headings and numbers, Nunito for body text
- Radii: 999 (pills), 36–44 (large cards), 22–30 (medium), 16–24 (inputs)
- "Clay" shadows: a soft outer drop shadow plus a light/dark inset pair

## Files
- `FDI Lab.dc.html`: the prototype. Strings are in `T.vi` / `T.en`; the UI logic is in `renderVals()`.
- `nha-may-fdi-engine.js`, `nha-may-fdi-data.js`: the original engine and data, copied unchanged from the repo.
- `support.js`: the runtime needed to open the prototype.
- `assets/`: the dragon images (JPG on white, shown with `mix-blend-mode: multiply`).
  - magnifier: setup hero
  - boat: event card
  - scroll: end report
  - jump: level-up modal
  - wink: mobile header
  - wave: teacher view
