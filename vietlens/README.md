# VietLens AI MVP

**Vietnam near-real-time intelligence, early-warning and conditional foresight dashboard.**

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

## Current capabilities

- Vietnam Pulse composite.
- Six economic, trade, weather, finance, logistics and consumer indicators.
- Regional risk schematic.
- Prioritized Signal Room with confidence, source count and freshness.
- 90-day scenario ensemble.
- Shock simulator for energy, FX, logistics and export demand.
- Source provenance and data-gap table.
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

VietLens should be described as a **near-real-time monitoring, early-warning and conditional scenario platform**, not as a system that predicts everything with certainty. It must not be used as the sole basis for financial, medical, legal, emergency or public-policy decisions.
