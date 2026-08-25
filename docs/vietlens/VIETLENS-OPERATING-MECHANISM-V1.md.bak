# VietLens AI — Operating Mechanism v1.0

**Status:** architecture and runtime explanation  
**Current implementation:** static MVP preview using transparent sample/proxy data  
**Production status:** not implemented  
**Product boundary:** VietLens is independent from BizOn and M-AIDA

## 1. Purpose

VietLens is designed as a near-real-time monitoring, early-warning and conditional foresight platform for Vietnam. It does not claim certainty and must not be used as the sole basis for financial, medical, legal, emergency or public-policy decisions.

This document separates:

1. the mechanism currently implemented in `vietlens/`;
2. the target production mechanism proposed for later development.

## 2. Current MVP runtime

### 2.1 Files

```text
vietlens/
├── index.html       # visual surface and interaction controls
├── styles.css       # standalone responsive design system
├── sample-data.js   # transparent sample/proxy dataset
├── app.js           # deterministic calculations and rendering
└── README.md        # scope, limitations and next architecture
```

The MVP has no backend, database, API key or live source adapter. The browser loads the static dataset into `window.VIETLENS_SAMPLE` and executes deterministic JavaScript locally.

### 2.2 Runtime sequence

```text
Page load
   ↓
Load sample-data.js
   ↓
Validate VIETLENS_SAMPLE is present
   ↓
Initialize local UI state
   ↓
Calculate Vietnam Pulse and summary scores
   ↓
Render KPI cards, regional watch and signal room
   ↓
Calculate three baseline 90-day scenarios
   ↓
Run default shock simulation
   ↓
Render forecast audit and provenance table
   ↓
Bind user interactions and JSON export
```

If the dataset is unavailable, the runtime stops and displays an explicit fatal-state message rather than presenting an empty or misleading dashboard.

## 3. Input data contract

The sample dataset contains four major groups.

### 3.1 Indicators

Each indicator includes:

```text
id
label
value
human-readable display value
delta
unit
direction
domain
confidence
source description
official/proxy flag
freshness in minutes
```

The current six domains are:

- finance;
- trade;
- energy;
- weather;
- logistics;
- economy/consumer.

### 3.2 Regions

Each region contains fixed display coordinates and four scores:

- total risk;
- weather;
- trade;
- logistics.

These coordinates form a schematic regional watch, not a GIS boundary dataset.

### 3.3 Signals

Each signal contains:

- title and summary;
- severity: `high`, `medium` or `low`;
- domain;
- confidence;
- source count;
- freshness.

### 3.4 Provenance

Each provenance row contains:

- source name;
- domain;
- source type;
- availability status;
- expected lag.

The MVP records provenance descriptors but does not yet store content hashes, retrieval timestamps, licenses or raw payloads.

## 4. Vietnam Pulse mechanism

### 4.1 Domain weights

```text
trade       0.22
finance     0.18
energy      0.14
weather     0.16
logistics   0.16
economy     0.14
```

The weights sum to 1.00.

### 4.2 Direction normalization

For positive momentum domains, the input value is used directly:

```text
trade
economy
```

For pressure/risk domains, the value is inverted:

```text
finance
energy
weather
logistics

normalized value = 100 - raw value
```

This means a high weather-risk score lowers the overall pulse, while a high trade-momentum score raises it.

### 4.3 Confidence adjustment

Each normalized value is multiplied by both its domain weight and confidence:

```text
weighted contribution = normalized value × domain weight × confidence
```

The final score is:

```text
Vietnam Pulse = round(
  sum(weighted contribution)
  ÷
  sum(domain weight × confidence)
)
```

This is a deterministic composite index. It is not currently an empirically validated national index.

## 5. Summary score mechanism

### 5.1 Stability

Stability uses the four pressure/risk domains:

```text
finance, energy, weather, logistics
```

For each domain:

```text
stability contribution = 100 - risk value
```

The displayed stability score is the arithmetic mean of these four contributions.

### 5.2 Momentum

Momentum is currently the arithmetic mean of:

```text
trade value
consumer value
```

### 5.3 Uncertainty

Uncertainty is calculated from average indicator confidence:

```text
average confidence = sum(confidence) ÷ number of indicators
uncertainty = round(100 - average confidence × 100)
```

A lower average confidence therefore produces a higher uncertainty score.

### 5.4 Freshness label

The top-bar “updated” time records the latest local user-interface refresh action. In the MVP it does **not** fetch new data from external sources. Source freshness is carried separately by each indicator and signal.

## 6. KPI rendering

Each KPI card displays:

- indicator label;
- human-readable value;
- change direction and delta;
- confidence percentage;
- official/periodic or public-proxy classification;
- data freshness.

No KPI is calculated by a language model. All values come from the sample dataset and deterministic browser logic.

## 7. Regional Watch

The user may switch between:

- total risk;
- weather;
- trade;
- logistics.

Each regional score is mapped to a display class:

```text
0–49   low
50–64  medium
65–100 high
```

The regions are displayed at predefined schematic coordinates. The current MVP does not perform spatial interpolation, GIS analysis or province-level aggregation.

## 8. Signal Room

The Signal Room renders the signal registry in dataset order. Each card shows:

- severity;
- narrative summary;
- domain;
- number of supporting sources;
- confidence;
- freshness.

The “Chỉ cảnh báo” control filters the list to `high` severity signals. The MVP does not yet calculate signal ranking, deduplication, anomaly score or cross-source contradiction automatically.

## 9. Baseline 90-day forecast ensemble

The current forecast layer generates three deterministic scenarios using the four current inputs:

```text
trade
weather
logistics
FX pressure
```

### 9.1 Base scenario

```text
growth =
  trade × 0.10
  - weather × 0.025
  - logistics × 0.020
  - FX × 0.015

bounded to [-10, 12]
```

Displayed confidence: 74%.

### 9.2 Favourable recovery

```text
growth =
  trade × 0.13
  - weather × 0.012
  - logistics × 0.008

bounded to [-8, 15]
```

Displayed confidence: 61%.

### 9.3 Prolonged pressure

```text
growth =
  trade × 0.05
  - weather × 0.040
  - logistics × 0.035
  - FX × 0.025

bounded to [-15, 8]
```

Displayed confidence: 68%.

These percentages are MVP design values. They are not estimated probabilities and have not been validated by rolling backtests.

## 10. Scenario Lab

The user controls four shocks:

- energy price;
- FX;
- logistics cost;
- export demand.

The engine creates four outputs.

### 10.1 Export impact

```text
export impact =
  demand × 0.55
  - FX × 0.18
  - logistics × 0.12
  - energy × 0.07

bounded to [-40, 40]
```

### 10.2 Inflation pressure

```text
inflation impact =
  energy × 0.18
  + FX × 0.22
  + logistics × 0.08

bounded to [-10, 25]
```

### 10.3 Manufacturing impact

```text
manufacturing impact =
  demand × 0.25
  - FX × 0.12
  - logistics × 0.18
  - energy × 0.10

bounded to [-30, 25]
```

### 10.4 Agriculture impact

```text
agriculture impact =
  demand × 0.30
  - logistics × 0.16
  - energy × 0.08

bounded to [-30, 30]
```

The result includes:

- input values;
- calculated outputs;
- generation timestamp;
- model identifier `vietlens-scenario-0.1.0`.

The equations are transparent pedagogical baselines, not causal macroeconomic estimates.

## 11. Forecast Audit

The audit area displays:

- model version;
- source dataset generation time;
- number of provenance sources marked `available`;
- number of source groups not marked `available`;
- provenance table with source type, status and lag.

Current source health is a simple count of registry statuses. It does not perform network probes or verify upstream data quality.

## 12. JSON export

The export contains:

```text
product and version
export timestamp
source generation timestamp
Vietnam Pulse
indicators
signals
forecast scenarios
latest user scenario
provenance
limitations
```

The export is generated locally as a browser download. It is not uploaded to a server.

## 13. Interaction and state

The runtime stores only temporary in-memory state:

```text
alert-only filter
selected map metric
latest scenario result
latest local refresh time
```

Reloading the page resets this state. The MVP does not use local storage, cookies, authentication or telemetry.

## 14. Current trust and safety boundary

The current preview:

- has no live source connection;
- has no backend or database;
- has no user account;
- has no alert subscription;
- has no personal-data collection;
- has no generative-AI decision layer;
- does not write to BizOn gameplay or Supabase;
- does not use restricted M-AIDA code, data or credentials;
- cannot support operational or commercial predictive claims.

## 15. Target production mechanism — proposed, not implemented

The production architecture should use a separate repository, database, API configuration and provenance ledger.

### 15.1 Source acquisition

```text
Official/permitted public sources
        ↓
Source-specific adapters
        ↓
Raw payload capture
        ↓
License and provenance validation
```

Each ingestion event should record:

- source identifier and owner;
- endpoint/document location;
- retrieval timestamp;
- publication timestamp;
- raw payload hash;
- parser version;
- license/redistribution rule;
- success, stale or error state.

### 15.2 Data normalization

Raw source fields should be mapped into a versioned observation contract:

```text
indicator_id
geography
event_time
publication_time
value
unit
frequency
source_id
raw_hash
quality flags
confidence/freshness metadata
schema version
```

The system must preserve raw values and units rather than storing only normalized scores.

### 15.3 Observation store

A separate PostgreSQL/TimescaleDB store is proposed for:

- raw-source metadata;
- normalized observations;
- source health;
- signal events;
- model runs;
- forecasts;
- backtest results;
- audit records.

### 15.4 Source health

Production source health should evaluate:

- successful retrieval;
- data recency;
- schema drift;
- parsing errors;
- missing values;
- contradictory observations;
- stale-on-error fallback;
- retry and circuit-breaker status.

### 15.5 Signal fusion

A production signal should be created only after applying versioned rules for:

- threshold crossing;
- momentum/change rate;
- anomaly against historical baseline;
- confirmation by independent sources;
- freshness;
- confidence;
- contradiction penalty;
- geographic and sector relevance.

The signal must retain links to its supporting observations.

### 15.6 Forecast registry

Each model should have:

- model ID and version;
- training/estimation window;
- variables and transformations;
- baseline comparator;
- forecast horizon;
- prediction interval;
- calibration metrics;
- rolling backtest results;
- approved use and prohibited use;
- retirement status.

No model should be labelled predictive until it outperforms documented naïve baselines under rolling out-of-sample evaluation.

### 15.7 Scenario engine

The production Scenario Lab should remain separate from the statistical forecast layer:

- forecast: what the model estimates under observed data;
- scenario: conditional outcome under user-defined assumptions;
- stress test: deliberately adverse assumptions;
- narrative: explanation of the deterministic/statistical outputs.

Generative AI, if added later, may explain trade-offs but must not silently change numerical results.

### 15.8 Alerting

Alerts should require:

- versioned trigger rule;
- severity threshold;
- minimum source confirmation;
- freshness limit;
- cooldown/deduplication window;
- user subscription scope;
- delivery and acknowledgement log;
- correction or retraction mechanism.

### 15.9 Forecast audit

For every forecast, the audit package should preserve:

- data snapshot hash;
- model version;
- feature set;
- execution time;
- point estimate and interval;
- later observed outcome;
- error metrics;
- revision history;
- operator/system actor;
- known limitations.

### 15.10 API and product surfaces

The production system may expose:

- dashboard API;
- signal feed;
- scenario execution endpoint;
- forecast-audit endpoint;
- alert subscriptions;
- enterprise exports.

Every external surface requires authentication, authorization, rate limits, data-rights enforcement and audit logging.

## 16. Product interpretation

The correct interpretation is:

> VietLens observes data, organizes signals, computes transparent composite indicators, runs conditional scenarios and records forecast provenance.

The incorrect interpretation is:

> VietLens can predict every economic, weather or policy outcome with certainty.

## 17. Immediate next engineering gates

1. Create a dedicated VietLens repository.
2. Freeze the observation and provenance schemas.
3. Implement one official/permitted source adapter end to end.
4. Add raw-payload hashing and source-health monitoring.
5. Introduce a PostgreSQL/TimescaleDB observation store.
6. Establish naïve baselines and rolling backtests.
7. Replace fixed confidence labels with measured calibration evidence.
8. Add a Mekong weather–agriculture module only after the ingestion and audit foundation is stable.
9. Complete SBOM, clean-room compliance and data-rights registers.
10. Keep all commercial predictive claims blocked until forecast validation passes.
