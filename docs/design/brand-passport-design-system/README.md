# Hộ Chiếu Thương Hiệu · Brand Passport — Design System

> **Lưu ý:** đây là tài liệu tham khảo, trích xuất bằng một công cụ thiết kế bên ngoài để đối chiếu
> màu/font/spacing với game thật. `styles.css` và `support.js` trong thư mục này thuộc runtime của
> công cụ đó (không phải code của BizOn) và **không** được game tải — giữ lại chỉ để tra cứu.
> `SOURCE-SYNC.md` là log đồng bộ với repo tại thời điểm trích xuất.

Visual system extracted from the **Brand Passport 3D** game (BizOn Go Global, © 2026 Đỗ Thùy Hương & Phan Anh Tú, Can Tho University). Source repo: `github.com/thuyhuongctu/BizOn` (branch `main`) — `Ho Chieu Thuong Hieu 3D.html`, `bp3d.js`, `Pho Thi Truong 3D.html`. Derived in this project from `Brand Passport 3D Game.dc.html`, `bp-scene.js`, `bp-core.js`.

**Product:** a bilingual (VI/EN) educational business game. Players run a Mekong Delta SME from the home port *Vàm Thịnh*, sail a clay-style 3D archipelago of 7 markets, choose entry modes, handle quarterly events, race the rival *Kim Long Exports*, and collect visa stamps in a passport.

## Index
- `styles.css` — entry; imports `design-system/tokens/*.css`
- `design-system/tokens/` — colors, typography, spacing, effects, fonts
- `design-system/guidelines/*.card.html` — foundation specimen cards
- `design-system/components/core/` — Button, HudPill, DockCard, AdvisorBubble, StatTile
- `assets/` — character art (`character/advisors`, `character/firms`), scene photography (`bp3d/`), stamps, logos (`docs/ctu-logo.png`, `docs/soe-logo.png`)
- UI reference: `Brand Passport 3D Game.dc.html` (live game), `Brand Passport Mockups.dc.html`
- `SKILL.md`

## Content fundamentals
- **Bilingual always.** Vietnamese first, English second: section eyebrows are `KẾT QUẢ · RESULT`; buttons switch whole-string by language toggle.
- **Second person, warm coach voice.** "Bạn đã chặn đầu Kim Long…", "Lái tới đó để chặn!". Advisors speak in first person with personality; Kim Long is cocky ("Chậm chân thì mất phần.").
- **Emoji are part of the brand** — every action/status leads with one: `⚓ Thả neo`, `🐉 2/7 · nhắm Kim Sa 61%`, `🛡️ Chặn đầu`, `🌫️ tri thức 34%`. One emoji per label, at the start.
- **Numbers are concrete and local-formatted:** `0,3 tỷ` (vi) / `0.3 bn` (en), percentages without space.
- Sentence case; `·` (middle dot) separates facts in one line; `–` en dash for asides.
- Academic grounding is explicit in small print (citations like *Anderson & Gatignon, 1986*).

## Visual foundations
- **Vibe:** playful clay diorama — chunky, soft, toy-like. Sea teal + sand + warm orange; never neon, never purple gradients.
- **Color:** ink `--bp-ink #033337` for all text; teal `--bp-teal` for info/eyebrows; orange `--bp-orange` primary; amber `--bp-amber` for in-world CTAs (sail, decide); red `--bp-rival` reserved for Kim Long; blue `--bp-shield` for protection. Six fixed entry-mode hues tag flags, stamps and borders.
- **Type:** Baloo 2 (rounded, heavy 800) for titles and numbers; Be Vietnam Pro for body (full Vietnamese diacritics); Manrope 800 for HUD pills, buttons, labels.
- **Surfaces:** cream panel `#fbf4ea` with white cards (radius 14px) inside. HUD floats over the 3D scene as white 94% pills (radius 999px) with `--shadow-hud`. Floating cards (dock, bubble) use a **3px colored border** keyed to context (mode hue, rival red, teal) — full border, never left-only.
- **Shadows:** soft, teal-tinted (`rgba(0,60,80,.4–.5)`), negative spread. Primary CTA uses a hard "clay" bottom shadow `0 5px 0 #a94c12`.
- **Radii:** 10 / 12 / 14 / 18px, pills 999px, avatars and round stamps 50%; alternate stamps are 12px rounded rectangles.
- **Imagery:** warm, saturated, diorama-like JPG photography (`assets/bp3d/`) for shops, HQs, modes; cut-out character WEBPs on soft tinted circles.
- **Motion:** eased camera flights (cubic out, ~1s), bobbing boats/buoys, pop-in scale for flags and people, confetti + shockwave ring on market opening, lightning flash + shake for crises. UI itself has minimal transitions.
- **Transparency:** HUD pills 94% white; hint toasts `rgba(3,51,55,.86)`; fog puffs 62% white. No backdrop blur.
- **Hit targets:** ≥ 40px pills, ≥ 44px buttons on mobile; virtual joystick 120px.
- **Layout:** desktop = 3D scene + right panel 422px; mobile = full-bleed scene, bottom HUD row, panel as sheet.

## Iconography
- **Emoji only** — no icon font or SVG set in the source. Country flags are emoji (🇰🇷 🇯🇵 …). Market icons, mode icons (📱 🚢 🤝 📜 🏗️ 🏭), stats (💹 ⭐ 🏭 🤸 🌱) and status glyphs all emoji.
- Stamps are raster (`assets/bp3d/stamp-*.jpg`, `assets/hc/stamp/`).
- Logos: CTU and School of Economics PNGs in `assets/docs/`. No product logo mark exists — the product name is set in Baloo 2 type.

## Intentional additions
None beyond the components extracted from the game HUD.

## Substitutions / caveats
- Fonts load from Google Fonts (no binaries in repo).
