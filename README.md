# BizOn Bật Nghiệp — Business Simulation Game

> A **3D-claymorphism EdTech business-simulation game** — student teams run a virtual company through **6 rounds** across a map of Vietnam, guided by the AI advisor **Lumina (Je m'appelle Hương)**, then expand to international markets with **BizOn GO GlObal**.

![version](https://img.shields.io/badge/version-1.0-blue)
![license](https://img.shields.io/badge/license-Proprietary%20·%20All%20rights%20reserved-lightgrey)
![PWA](https://img.shields.io/badge/PWA-offline%20ready-5cc4e6)
![deploy](https://img.shields.io/badge/GitHub%20Pages-live-2ea44f)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21613899.svg)](https://doi.org/10.5281/zenodo.21613899)

| | |
|---|---|
| **Authors** | **Do Thuy Huong** (Founder & Creative Lead) · **Phan Anh Tu** (Co-founder & Academic Advisor) |
| **Affiliation** | Can Tho University (CTU), Vietnam |
| **Play now** | 🎮 [Game](https://thuyhuongctu.github.io/BizOn/) · 🌐 [Landing page](https://thuyhuongctu.github.io/BizOn/gioi-thieu.html) · 🕹️ [Arcade](https://thuyhuongctu.github.io/BizOn/games.html) · 🌏 [BizOn GO GlObal](https://thuyhuongctu.github.io/BizOn/global.html) |
| **Contact** | thuyhuongctu@gmail.com |
| **Archive & DOI** | Zenodo concept DOI: [10.5281/zenodo.21613899](https://doi.org/10.5281/zenodo.21613899) — every release is permanently archived |

---

## 🗺️ Ecosystem

| Page | Content |
|---|---|
| [`index.html`](https://thuyhuongctu.github.io/BizOn/) | **Main game** — a 6-round conquest across the map of Vietnam (Cần Thơ → Hà Nội); win a round's market share to plant your flag 🚩; the map features the Lũng Cú flag tower and the Hoàng Sa & Trường Sa archipelagos |
| [`gioi-thieu.html`](https://thuyhuongctu.github.io/BizOn/gioi-thieu.html) | International-style landing page: interactive demo, 5 leadership roles, the 6-round journey, mini-games, an AI tour guide, FAQ, instructor section |
| [`games.html`](https://thuyhuongctu.github.io/BizOn/games.html) | **BizOn Arcade** — 8 games in the ecosystem |
| [`global.html`](https://thuyhuongctu.github.io/BizOn/global.html) | **BizOn GO GlObal** (beta) — from Vietnam to the world: pick a market and an entry mode (Export · Licensing · Joint Venture · Greenfield FDI), with a live World Market board and the **IE Lab** (International Entrepreneurship, data simulation) |
| [`doi-ngu.html`](https://thuyhuongctu.github.io/BizOn/doi-ngu.html) | Founding team, mission & vision 2026 |

Every page supports **light/dark mode**, a **Vietnamese–English bilingual interface**, and **background music** (two original theme songs, «Bật Nghiệp» and «Je m'appelle Hương sans frontières» — lyrics in [`docs/loi-bai-hat.md`](docs/loi-bai-hat.md)).

## 🎮 Key features

| Area | Details |
|---|---|
| Rounds | 6 rounds = 6 provinces on Vietnam's new administrative map; each round brings a market event (Golden Opportunity, Price War, Energy Crisis, Credit Squeeze, Vietnam Rising Dragon) |
| Decisions | Price · Marketing · R&D · Production volume · Workforce & training · Funding source (equity / 8.5% loans) · 30/60/90-day payment terms · Maintenance |
| AI rivals | 🐺 Alpha Dynamics (budget) · 🐘 Mekong Ventures (balanced) · 🦚 Star Clay Co. (premium) — behavior is **deterministic per team seed**, which makes grading easy |
| Lumina AI advisor | "What-If" scenarios, role-specific risk alerts, Vietnamese voice chat (STT/TTS), a dedicated advisor brain for CEO · CFO · CMO · COO · SEC |
| Reports | P&L, three-activity cash flow, CVP break-even, HR, Business Model Canvas, depreciation, energy audit ⚡ |
| Learn by playing | Quests, achievements, a skill tree, completion certificates, a team journal, the Clay Reward Shop, mini-games |
| Instructor tools | Class IDs, round locking, bonus funding with an audit log — full guide at [`docs/huong-dan-giang-vien.md`](docs/huong-dan-giang-vien.md) |
| BizOn Monitor | A terminal-style market board: sparklines for the team's metrics and all 3 AI rivals, round by round |

## 🔬 Simulation model

The **IE Lab** mode (on the BizOn GO GlObal page) is a **data-simulation sandbox** for International Entrepreneurship courses: players pick a market type, drag the internationalization level (FSTS %) and digital-capability sliders, and watch simulated firm performance respond. The stylized scenarios include:

- An **inverted-U** curve with an illustrative turning point around **43% FSTS** (transition markets and the pooled all-Asia scenario);
- Strong-institution economies (Singapore, Japan): near-linear curves, with a **"digital shield"** effect in the Singapore scenario;
- A small-island scenario (Pacific SIDS): a monotonically negative curve — internationalization is not always beneficial.

> All curves and figures in the IE Lab are illustrative simulation parameters for teaching, not real statistics of any firm or dataset.

## 🚀 Run & deploy

```bash
# run locally (no install needed)
python3 -m http.server 8000   # then open http://localhost:8000
```

- **Web:** the [`deploy-pages.yml`](.github/workflows/deploy-pages.yml) workflow auto-deploys to GitHub Pages on every push to `main`.
- **Mobile (PWA):** open the link on a phone → "Add to Home Screen" — runs full-screen and plays offline (service worker + manifest).
- Game progress is saved in each device's `localStorage`.

## 🧱 Source layout

```
index.html            # Game SPA — all screens + Tailwind config + PWA registration
gioi-thieu.html       # International landing page
games.html            # BizOn Arcade (8 games)
global.html           # BizOn GO GlObal + World Market LIVE + IE Lab
doi-ngu.html          # Founding-team page
js/engine.js          # Simulation engine: 6 rounds, events, items, skills
js/app.js             # Game UI: rendering, navigation, conquest map, intro
js/site-ui.js         # Shared light/dark mode + Vietnamese–English dictionary
sw.js                 # Service worker — app shell, offline play
assets/character/     # 3D characters: Lumina Áo Dài, Lumina Vest Trắng, Phan Anh Tú
assets/audio/         # Music: BizOn Theme, Bật Nghiệp, Hương sans frontières, Hương's voice
docs/                 # Instructor guide, song lyrics, technical docs
```

## 📚 Citation & archiving

If you use BizOn in teaching or research, please cite:

> Do, T. H., & Phan, A. T. (2026). *BizOn Bật Nghiệp: A 3D claymorphism business-simulation game for entrepreneurship education* [Computer software]. Can Tho University. https://doi.org/10.5281/zenodo.21613899

- Machine-readable citation file: [`CITATION.cff`](CITATION.cff) (GitHub shows a **"Cite this repository"** button).
- **Zenodo:** concept DOI [10.5281/zenodo.21613899](https://doi.org/10.5281/zenodo.21613899) (represents all versions); each GitHub release is automatically archived with its own version DOI.

## ⚖️ Copyright & intellectual property

**Proprietary software** — see [`LICENSE`](LICENSE). The source code, the simulation-engine algorithms, the character design **Lumina — Je m'appelle Hương**, and the **BizOn Bật Nghiệp** name and identity belong to the authors **Do Thuy Huong & Phan Anh Tu**; copying or commercial use without written permission is prohibited.

Registration dossiers (copyright, trademark) and the commercialization strategy are managed in the authors' private document repository.

Third-party components: Tailwind CSS (MIT), Google Fonts Plus Jakarta Sans & Manrope (OFL 1.1) — their original licenses apply.

## 🛣️ Roadmap

1. Backend API per [`docs/api-structure.md`](docs/api-structure.md) (JWT, commit-processing queue) → real-time multi-team mode.
2. PostgreSQL database per [`docs/database-schema.md`](docs/database-schema.md).
3. A real AI advisor via a large-language-model API, replacing the rule-based advisor.
4. **V-Monitor** — a real-data dashboard for the Vietnamese market, to be developed as an independent project (internal proposal).

---

## 👥 Authors

| Author | Role |
|---|---|
| **Do Thuy Huong** | Founder & Creative Lead — game design, embodiment of the Lumina AI character · thuyhuongctu@gmail.com |
| **Phan Anh Tu** | Co-founder & Academic Advisor — academic oversight, business-administration expertise · patu@ctu.edu.vn |

© 2026 Do Thuy Huong & Phan Anh Tu · **BizOn Bật Nghiệp** — All rights reserved.
