# BizOn Academia 3D V2 — QA status

## Automated quality gates

The pull request includes GitHub Actions workflows for the standalone preview `academia3d-v2.html`.

Current automated gates:

- HTML validation
- Local link and asset existence checks
- Local preview server smoke test
- Lighthouse desktop audit
- Lighthouse mobile audit
- Accessibility score threshold: 0.90
- Best practices score threshold: 0.90
- SEO score threshold: 0.90
- Performance warning thresholds: 0.75 desktop and 0.65 mobile

Latest result: all quality-gate steps passed on 2026-08-01.

## Automated visual matrix

Playwright captures and validates the following Chromium states:

- Desktop 1440 × 1000 — Vietnamese, light mode
- Desktop 1440 × 1000 — Vietnamese, dark mode
- Desktop 1440 × 1000 — English, light mode
- Android-class viewport — Vietnamese, light mode
- Android-class viewport — Vietnamese, dark mode
- Android-class viewport — English, light mode
- Android-class viewport — reduced motion

The visual workflow checks:

- no horizontal overflow;
- page returned to `scrollY = 0` before capture;
- all reveal sections became visible after scrolling;
- selected language and theme were applied;
- hero, globe and Brand Passport entry remained present;
- no uncaught page or console errors.

Latest result: all seven visual scenarios passed on 2026-08-01. The screenshot artifact is retained by GitHub Actions for 14 days.

## Visual review findings

- The desktop hierarchy is coherent and substantially more academic than the current homepage.
- The mobile layout preserves the hero, four product gateways, evidence, research flow, people and soundtrack sections without horizontal overflow.
- Dark mode remains readable and visually consistent.
- English copy fits the mobile layout without clipping.
- Reduced-motion mode reveals all content and removes continuous motion dependencies.

## Manual review still required

- Safari on macOS or iOS
- A physical Android device at approximately 360–430 px width
- Final Vietnamese and English copy approval
- Final approval of hero imagery and academic-advisor representation
- Final decision on replacing `index.html`

## Release rule

Do not replace the production homepage until the remaining physical-device and Safari checks are completed and the preview is explicitly approved.
