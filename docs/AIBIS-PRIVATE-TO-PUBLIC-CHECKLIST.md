# AIBIS private-to-public release gates

AIBIS remains private/staging on `feat/aibis-foundation`. Do not merge or publish until every P0 gate is evidenced.

## P0 — safety and non-regression

- [ ] Existing `engine.test.js` passes.
- [ ] Existing `brand-passport.test.js` passes.
- [ ] AIBIS core and telemetry tests pass.
- [ ] `global.html` visible revenue, profit, market share and completion remain unchanged in shadow mode.
- [ ] No uncaught browser error on desktop and 390px mobile viewport.
- [ ] AIBIS scripts fail closed: Go Global remains playable if they do not load.

## P0 — privacy and research ethics

- [ ] `uploadTelemetry=false` remains the public default.
- [ ] Consent UI and participant information sheet are approved before collection.
- [ ] Free-text rationale and chat content are excluded from research upload.
- [ ] Supabase migration is reviewed; anon has INSERT only and no SELECT/UPDATE/DELETE.
- [ ] Retention period, withdrawal process and data controller are documented.

## P0 — scientific validity

- [ ] Same seed + same decisions produces the same shadow outcome.
- [ ] At least 30 scripted scenarios cover all seven entry modes and seven markets.
- [ ] Parity report explains every material divergence from the legacy engine.
- [ ] Model card states formulas, assumptions, ranges, limitations and version.
- [ ] AI narrative layer cannot change deterministic outcome fields.

## P1 — pilot readiness

- [ ] Instructor can issue one shared scenario seed.
- [ ] Debug panel works only with `?debugAIBIS=1`.
- [ ] Research export opens in CSV/JSON tooling without personal identifiers.
- [ ] Pilot protocol includes pre-test, post-test, control/comparison condition and debriefing.
- [ ] Accessibility review covers keyboard, contrast, labels and reduced motion.

## P1 — commercial readiness

- [ ] Product naming and IP ownership are documented.
- [ ] Third-party licences and live-data attribution are complete.
- [ ] Pricing experiment distinguishes free demo, instructor and institution tiers.
- [ ] Support, incident response, backup and service-status procedures exist.
- [ ] English interface receives human academic review.

## Publication sequence

1. Internal branch testing.
2. Draft pull request for code review; no merge.
3. Private pilot URL or local build.
4. Controlled classroom pilot with consent.
5. Parity, usability and learning-outcome report.
6. Security/privacy review.
7. Merge to `main` only after explicit owner approval.
8. Public announcement after production smoke test.
