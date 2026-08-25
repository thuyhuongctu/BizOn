# VietLens AI MVP

**Vietnam business-data product built on depth and provenance — not velocity.** Quarterly, source-first indicators for the Mekong Delta and Vietnam: every figure carries its source, period, collection method and stated limitation.

## Repository status

This directory is a clean preview port of the original `feat/vietlens-mvp` work onto the current `main` history for visual review and QA.

VietLens remains a separate product identity from BizOn and M-AIDA. This preview must not be treated as permission to reuse restricted M-AIDA code, data, credentials or research materials. The production/commercial implementation should use a separate repository, database, API configuration and provenance ledger.

## Technical documentation

- Detailed current/runtime and target-production mechanism: [`docs/vietlens/VIETLENS-OPERATING-MECHANISM-V1.md`](../docs/vietlens/VIETLENS-OPERATING-MECHANISM-V1.md)

## Run locally

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000/vietlens/
```

No build step, API key or backend is required for this MVP.

## Positioning: depth and provenance, not velocity

VietLens deliberately inverts the real-time "monitor" model. Its value is **structural depth with verifiable origin**, on a **quarterly** cadence, for a narrow-and-deep scope (Vietnam and the Mekong Delta). What Vietnamese users lack is not numbers but **numbers with a checkable origin** — so the source-and-period label *is* the product, not a technical detail.

**One-line rule: no provenance, no board.** A single unsourced indicator undermines the credibility of a hundred sourced ones — `app.js` filters out any indicator missing a `source`.

### Scope discipline

- **In scope:** provincial/regional economic indicators (quarterly), core agri value chains (rice, shrimp, pangasius, fruit), trade by product & market, FDI by province & sector, provincial institutional environment. Each indicator carries source, period, method and limitation.
- **Out of scope (even when tempting):** real-time news, minute-level prices, unreviewed model-generated forecasts, and any indicator that cannot name its source.

### Three-tier build (gate discipline)

1. **Tier 1 — data layer, no UI.** Structured indicators with provenance, exported as JSON. This is infrastructure the two game pillars already depend on, and evidence the research needs — *not* a third product.
2. **Tier 2 — read dashboard.** Free, no sign-up. Ships after the two pillars pass their commercialization gate.
3. **Tier 3 — API & paid tiers.** Only after Tier 2 has real users and per-source redistribution rights are cleared.

## Current capabilities (preview)

- Vietnam Pulse composite.
- Provenance-first indicators: trade-by-commodity, rice & shrimp value chains, retail demand, FDI, provincial institution (PCI), quarterly FX, logistics and energy cost indices — each with source, period, method and limitation.
- Regional risk schematic.
- Quarterly Signal Room with confidence, source count and data period.
- 90-day scenario ensemble (labelled MVP; not investment advice).
- Shock simulator for energy, FX, logistics and export demand.
- Source ledger with status, lag and **redistribution-rights** column.
- Downloadable JSON report.

## Important limitation

The current data are transparent sample/proxy observations designed to validate product architecture and user experience. They are **not live official feeds** and the forecast equations are **not calibrated predictive models**.

The interface deliberately labels:

- source type;
- freshness;
- confidence;
- official versus proxy status;
- model version;
- data gaps;
- limitations.

## Next implementation phase

1. Move VietLens into its own repository and release history.
2. Add server-side source adapters for official/permitted Vietnamese sources.
3. Store observations in a separate PostgreSQL/TimescaleDB instance.
4. Add source health, retries, stale-on-error and provenance hashes.
5. Establish naïve forecast baselines and rolling backtests.
6. Publish forecast audit metrics before advertising predictive accuracy.
7. Add Mekong weather–agriculture module.
8. Create API contracts and commercial alert subscriptions.
9. Produce a clean-room compliance report, SBOM and data-rights register.

## Proposed architecture

```text
Official and permitted public sources
        ↓
Source adapters and provenance
        ↓
Observation store
        ↓
Signal fusion and anomaly detection
        ↓
Forecast registry and scenario engine
        ↓
Dashboard, alerts and forecast audit
```

## Safety and positioning

VietLens should be described as a **depth-and-provenance Vietnam business-data product** (with an MVP conditional-scenario lab), not as a real-time monitor or a system that predicts everything with certainty. It must not be used as the sole basis for financial, medical, legal, emergency or public-policy decisions.

**Biggest operational risk — redistribution rights.** Many statistical sources allow viewing but restrict redistribution, especially over an API or paid tier. Per-source terms must be checked *before* an indicator enters the board, not after a customer appears. Maintenance is a permanent commitment: even a quarterly cadence is four releases a year, forever, and needs a named owner.
