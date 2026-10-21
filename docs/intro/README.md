# Handoff: BizOn homepage intro animation

## Overview
A 63-second, 16:9 (1920×1080) animated intro for bizonland.com. A single camera moves down a recreation of the homepage, section by section: Hero → Roles → Game levels → Support tools → Trailers → Evidence → Theory→Decision → Close. Each section's elements animate in as motion graphics. It ends on the wordmark, the "Start with Bến Phù Sa →" CTA and "bizonland.com", then fades to cream. English voiceover clips play in sync.

## About the design files
These files are **design references built in HTML**. They show the intended look and motion and are not production code to ship as-is. Rebuild the animation in the BizOn repo (thuyhuongctu/BizOn, a static HTML/CSS/JS site) using its own patterns. Two good options:
1. **Live hero on the site:** add a section to index.html, driven by one `requestAnimationFrame` clock with the same timeline math.
2. **Video file:** render the reference to MP4 and embed it with `<video>`, using assets/video/*-poster.jpg-style posters.

## Fidelity
**High fidelity.** Colors, type, radii and clay shadows come straight from `css/bizon-clay.css` and `index.html`. Copy is the homepage's English (`data-en`) text, verbatim.

## Architecture (reference)
- `BizOn Intro.dc.html` is the entry point. It loads the fonts, the scene list (`window.OM_SCENES`) and the tweak defaults, and mounts `BizonIntro`.
- `bizon-intro.jsx` holds all the content. The **world** is a 1600 px-wide column of 900 px-tall panels (TOP offsets: Hero 0, Roles 900, Games 1800, Tools 2700, Trailers 3600, Evidence 4500, Flow 5400, Close 6300), drawn at base scale 1.2. Every frame is a pure function of time T, so scrubbing and export are deterministic.
- `camera(T)` interpolates keyframes `[time, x, y, scale]` with easeInOutCubic. The world transform is `translate(960,540) scale(1.2*s) translate(-x,-y)`. Panels further than one panel height from the camera are `display:none` for performance.
- `animations-v3.jsx` is the timeline engine: scene cues, playback, scrubber and export. Replace it with your own clock.

## Timeline (scene durations, in seconds)
Hero 10 · Roles 8 · Games 13 · Tools 6 · Trailers 7 · Evidence 7 · Flow 6 · Close 6 = **63 s**, looping.

- **Hero (0–10):** The nav pill drops in (−40 px, 0.8 s). Then the badge, the two headline lines (0.7 s / 1.1 s, rising 40 px), the lead text (1.7 s), three CTAs on one row (staggered 0.15 s from 2.2 s), the "▶ Watch the 1-minute intro" pill (2.65 s) and three pills (scale-pop from 2.9 s). Left column 600 px wide; HeroStage at left 900, width 500. On the right, the drum (rotating 4.5°/s), the plinth, Hương, Anh Tú, Tèo Sói, the VN stamp and the passport pop in with easeOutBack from 0.3 s. A two-layer scalloped river (#5DB8C4 / #1E7E8C) scrolls, with the floating-market boat drifting on a 22 s cycle. The camera holds for 3.4 s, then pushes to 1.45× on the characters.
- **Roles (10–18):** Teal panel (#1E7E8C). Eyebrow "Start from your role" in #FFD58A, then H2 "Each audience has its own way in." Four cards (#FFD58A, #7FD3DC, #A9DCC4, #F4B6C2; radius 30) rise 80 px with a ±4° settle, staggered 0.18 s; link pills pop in after them. The camera zooms to 1.55× and pans left → right, lifting the card in focus by 12 px.
- **Games (18–31):** H2 "Learn business by making consequential decisions." The game cards form a horizontal carousel, one card at a time, stepping every 2.8 s (0.7 s ease). Inactive cards sit at 35% opacity and 0.92 scale. Each image does a slow Ken Burns zoom (+10%). A level-tracker row below highlights the active game.
- **Tools (31–37):** "Support tools" row cards (IE Lab, Practicum labs with four labs incl. FDI Lab, Arcade) are stacked in a flex column (gap 16) and slide in from alternating sides (±160 px, staggered 0.35 s).
- **Trailers (37–44):** Dark #033337 panel with scalloped top and bottom edges. "Watch before you play." Four poster cards rise; each then lifts in turn (1.1 s apart: −14 px, scale 1.05, play button 1.18).
- **Evidence (44–51):** On the left, H2 "Learning that can be examined.", three gold-dot bullets and two buttons. On the right, three principle cards slide in from +120 px, staggered 0.4 s.
- **Flow (51–57):** A tray card with "From theory to decision." Seven numbered circles pop in 0.45 s apart while a teal connector line draws across.
- **Close (57–63):** Wordmark at 132 px pops in, then the CTA "Start with Bến Phù Sa →" (gentle pulse) and "bizonland.com". The characters and river re-enter on the right. Fades to #FBF4E8 over the final 0.7 s.

## Motion primitives
- `enter(s, d=0.7, dist=34)`: opacity 0→1 and translate dist→0, easeOutCubic.
- `pop(s, d=0.6)`: scale 0.4→1 with easeOutBack; opacity is quicker.
- `wave(T, period, amp)`: idle floating for characters (cosine).

## Voiceover
Eight clips in `assets/vo/`. Each starts at its scene's cue plus an offset: hero +1.0, roles +1.0, games +0.8, tools +0.6, trailers +1.0, evidence +0.1, flow +1.0, close +1.2. During playback, each clip re-syncs if it drifts more than 0.3 s from the timeline. The script is in `Voiceover Script.md`.
Music: `assets/audio/and-the-world-say-hello.mp3` (BizOn – And The World Say Hello! Original, 2:22; included). It is synced to the timeline from 0 s, fades in over 1.5 s, ducks to 22% while a voice clip plays, and fades out over the last 2.5 s. Default volume is 0.6.

## Design tokens
Colors: bg #FBF4E8 · card #FFFBF4 · tray #F3E6CF · ink #033337 · ink-2 #24403F · sub #3E5A5C · teal #006687 · teal-2 #1E7E8C · orange #E8762D · gold #FDA127 · accent #C2581B · clay-1 #7FD3DC · clay-2 #FFD58A · clay-3 #F4B6C2 · clay-4 #A9DCC4 · clay-5 #D9F0F2. Level colors: L1 #2E7139, L2 #A84A14, L3 #006687.
Type: headings Plus Jakarta Sans 800, letter-spacing −0.02em, line-height 1.14 (H1 56, H2 52). Body Be Vietnam Pro 400–800, 15–18 px, line-height 1.55–1.65. Self-hosted woff2 files in assets/fonts/.
Radii: pills 999 · CTA 22 · cards 26–36 · media 22–26.
Clay shadow pattern: `inset 0 -Npx 0 rgba(0,0,0,.08–.2), inset 0 Mpx 0 rgba(255,255,255,.35–.95), 0 Ypx Bpx -Spx <tinted shadow>`.

## Assets used (all from the repo)
- Characters: assets/character/huong-ao-dai-sen.png, anh-tu-ao-dai-welcome-cut-v2.webp, teo-soi-wink-cut.webp, phu-sa/huong-tu-ghe-chonoi-v2.webp
- Brand: assets/brand/trong-dong.svg, assets/hc/stamp/vn.png, passport-cover-cut.webp
- Games: assets/covers/ben-phu-sa-3d.webp, bat-nghiep-3d.webp, ho-chieu-thuong-hieu-3d.webp, ho-chieu-sau-rieng-3d.webp (included)
- Tools: assets/hc/item/forecast.png, assets/cmr-lab/dragon-magnifier.jpg, assets/character/arcade-rong-bay-sau-rieng.webp
- Trailers: assets/video/bizon-trailer-poster.jpg, ben-phu-sa-trailer-poster.jpg, bp-trailer-poster.jpg, srp-trailer-poster.jpg
- Voiceover: assets/vo/01-hero.mp3 … 08-close.mp3 (included; 04-tools re-recorded: "four practicum labs")
- Music: assets/audio/and-the-world-say-hello.mp3

## Files
- `BizOn Intro.dc.html`: entry point (open it in a browser next to an `assets/` folder from the repo)
- `bizon-intro.jsx`: all scenes, the camera and the voiceover sync
- `animations-v3.jsx`, `tweaks-panel.jsx`, `support.js`: preview runtime only
- `Voiceover Script.md`: narration text and timings

## Bản đã dựng trong repo / What shipped
- Live preview: `BizOn Intro.dc.html` at the repo root (uses the root `support.js`, `animations-v3.jsx`, `tweaks-panel.jsx`, `bizon-intro.jsx`). The music is the repo's existing `assets/audio/and-the-world-say-hello.mp3` (byte-identical to the package's `music.mp3`, so no duplicate file was added); `useMusic` in `bizon-intro.jsx` points to it.
- Homepage video: `assets/video/bizon-intro-1min-en-v2.mp4` (1920×1080, 30 fps, H.264 level 4.0, AAC stereo 48 kHz) + poster `assets/video/bizon-intro-1min-v2-poster.jpg`, opened by the «Xem intro 1 phút / Watch the 1-minute intro» button in the homepage hero (same dialog as the trailers). The first cut (`bizon-intro-1min-en.mp4`, «Hương and the World (EN)») is kept in the repo but no longer linked.
- The MP4 was rendered frame by frame from the live preview (seek event `data-om-seek-to-time-frame`). Voice + music were mixed in ffmpeg at the package's levels: music 0.6, ducked to 22 % (0.132) under each VO clip with 0.3 s ramps, 1.5 s fade-in, 2.5 s fade-out. `assets/vo/04-tools.mp3` is the re-recorded clip ("four practicum labs").
