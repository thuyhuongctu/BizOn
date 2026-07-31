# BizOn Academia 3D — Homepage Redesign Specification

Status: design implementation branch

## Objective
Elevate BizOn from a playful claymorphism homepage into a premium, international, research-driven EdTech experience while preserving its Vietnamese identity, explainable simulation positioning, PWA compatibility, and existing game routes.

## Design principles
1. Academic credibility before marketing claims.
2. Premium 3D depth without sacrificing performance.
3. Clear product hierarchy: Bật Nghiệp, Brand Passport, IE Lab, Arcade.
4. Vietnamese identity expressed through áo dài, Mekong-inspired motifs, and restrained cultural cues.
5. Accessible motion with `prefers-reduced-motion` support.
6. No unverified metrics or partner endorsements.

## Visual system
- Primary navy: #071D3A
- Deep blue: #103A68
- Teal: #078A96
- Cyan: #38C6DF
- Pearl: #F7FAFC
- Paper: #FFFFFF
- Champagne gold: #C6A76B (accent only)

Typography:
- Display/headline: editorial serif (DM Serif Display / Cormorant Garamond class)
- UI/body: Manrope
- Data labels: restrained mono only where useful

## Homepage information architecture
1. Sticky glass navigation
2. Hero — simulation-based business learning from Vietnam to the world
3. Product gateways — Bật Nghiệp / Brand Passport / IE Lab / Arcade
4. Evidence-before-marketing section
5. Theory-to-decision academic flow
6. Founder profile
7. Soundtrack mini-player
8. Academic/open-science footer

## Motion hierarchy
- Micro: 120–180 ms
- UI: 240–360 ms
- Narrative: 600–900 ms
- Cinematic: 900–1600 ms

Infinite animation allowed only for subtle globe drift, ambient particles, breathing, and gentle floating.

## 3D layers
Hero target depth:
- background particles: 2–4 px parallax
- globe: 5–7 px
- avatars: 8–10 px
- holographic cards: 14–18 px
- passport object: 20–24 px

Disable pointer parallax on touch/mobile.

## Performance budget
- LCP < 2.5 s
- CLS < 0.1
- INP < 200 ms
- initial hero assets < 1.5 MB
- homepage initial payload target < 3 MB
- lazy-load nonessential 3D/video assets

## Accessibility
- WCAG AA contrast
- semantic headings
- visible focus
- keyboard navigation
- alt text
- `prefers-reduced-motion`
- motion must not be the only carrier of information

## Implementation approach
Keep the current static-site/PWA architecture. Do not migrate the whole project to a new framework only for visual redesign.

Add reusable layers:
- `css/bizon-academia3d.css`
- `js/homepage-academia3d.js`

Then progressively refactor `index.html` while preserving existing routes, language/theme behavior, and offline/PWA features.

## Release strategy
Implement on a dedicated branch first. Validate desktop, mobile, reduced-motion, and performance before merge to `main`.
