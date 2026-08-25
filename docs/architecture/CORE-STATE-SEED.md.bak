# BizOn Core State & Seed Contract

Status: implementation candidate for Commercial Pilot v1

## Scope

This change introduces two independent core modules without changing the current public gameplay:

- `js/core/game-state.js`
- `js/core/seed-engine.js`

The legacy engine remains the source of truth until adapter and parity work is completed in later pull requests.

## GameState v1

Required top-level sections:

- `schemaVersion`
- `engineVersion`
- `session`
- `game`
- `company`
- `decisions`
- `outcomes`
- `events`
- `instructorActions`
- `aiInteractions`
- `metadata`

### Invariants

1. Startup has six rounds; AIBIS has eight rounds.
2. `marketShare`, `reputation`, and `risk` remain within 0–100.
3. Monetary values must be finite numbers.
4. Mutable histories are represented as arrays.
5. `schemaVersion` defines persistence compatibility.
6. `engineVersion` identifies the calculation contract.

## Seed contract

Canonical seed:

```text
CLASS_ID:TEAM_ID:SCENARIO_ID:ENGINE_VERSION
```

The seed engine provides deterministic namespace-isolated streams. The same seed and namespace produce the same sequence. Separate namespaces prevent market generation from being changed by unrelated event calls.

Examples:

```javascript
const seed = BizOnSeedEngine.createSeed('IB01', 'T03', 'pilot-a');
const eventRandom = BizOnSeedEngine.randomFromSeed(seed, 'round-3:event');
const rivalRandom = BizOnSeedEngine.randomFromSeed(seed, 'round-3:rival-alpha');
```

## Migration strategy

This pull request does not migrate existing `localStorage` records. The next persistence pull request will:

1. identify legacy save shapes;
2. create explicit migration functions;
3. retain a backup of the original payload;
4. reject malformed payloads safely;
5. provide import/export for recovery.

## Acceptance criteria

- Modules work in Node/CommonJS tests and directly in browsers.
- Same seed and namespace produce identical sequences.
- Inputs are normalized and bounded.
- Invalid states return explicit validation errors.
- No existing public page imports these modules yet.
- Rollback consists only of deleting the two modules and their tests.
