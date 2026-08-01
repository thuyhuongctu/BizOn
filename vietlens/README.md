# VietLens AI MVP

**Vietnam real-time intelligence and foresight dashboard.**

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
- Prioritized signal room with confidence, source count and freshness.
- 90-day scenario ensemble.
- Shock simulator for energy, FX, logistics and export demand.
- Source provenance and data-gap table.
- Downloadable JSON report.

## Important limitation

The current data are transparent sample/proxy observations designed to validate the product architecture and user experience. They are **not live official feeds** and the forecast equations are **not calibrated predictive models**.

The interface deliberately labels:

- source type;
- freshness;
- confidence;
- official versus proxy status;
- model version;
- data gaps;
- limitations.

## Next implementation phase

1. Add server-side source adapters for official Vietnamese sources.
2. Store observations in PostgreSQL/TimescaleDB.
3. Add source health, retries, stale-on-error and provenance hashes.
4. Establish naïve forecast baselines and rolling backtests.
5. Publish forecast audit metrics before advertising predictive accuracy.
6. Add Mekong weather–agriculture module.
7. Create API contracts and commercial alert subscriptions.

## Proposed architecture

```text
Official and public sources
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