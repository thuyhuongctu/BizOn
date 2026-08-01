# BizOn Academia 3D V2 — QA status

## Automated checks

The pull request includes a GitHub Actions workflow for the standalone preview `academia3d-v2.html`.

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

Latest result: all automated steps passed on 2026-08-01.

## Manual review still required

- Chrome/Edge desktop visual review
- Safari visual review
- Android 360–430 px visual review
- Dark mode visual review
- Vietnamese/English copy review
- Reduced-motion interaction review
- Final decision on replacing `index.html`

## Release rule

Do not replace the production homepage until the manual visual checks are completed and the preview is approved.
