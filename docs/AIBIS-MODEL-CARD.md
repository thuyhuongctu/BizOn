# AIBIS Model Card — Foundation 0.1.0

## 1. Intended use

AIBIS Foundation is a deterministic shadow simulation for BizOn Go Global. It is intended for internal validation, classroom research design, model comparison and staged migration. It is not yet intended to replace the visible legacy score engine or provide real-world investment advice.

## 2. Architecture

- Deterministic simulation engine: computes outcomes.
- Adapter: maps the current Go Global state to canonical AIBIS inputs.
- AI/generative layer: not authorized to alter deterministic scores.
- Telemetry layer: disabled by default and gated by backend, feature flag and explicit consent.

## 3. Core inputs

- Market growth, institutional risk and tariff pressure.
- Localization fit and execution quality.
- Digital capability.
- Scenario shock magnitude and type.
- Seed, market and entry mode.

## 4. Core outputs

- Revenue and profit.
- Market share and cash.
- Risk, reputation and ESG.
- Degree of internationalization.
- International learning.

## 5. Readiness construct

Internationalization Readiness Index weights:

- Financial capacity: 20%.
- Managerial capability: 15%.
- Technology capability: 15%.
- International experience: 15%.
- Product scalability: 20%.
- Network capability: 15%.

These weights are provisional design parameters and require empirical validation. They must not be presented as a validated diagnostic scale.

## 6. Reproducibility

A round uses the seed pattern `<session seed>:<round>`. The same state, seed and inputs must produce the same result. Tests cover 35 market-entry combinations in staging.

## 7. Known limitations

- Parameter values are pedagogical and provisional.
- The shadow engine does not yet model entry-mode-specific costs in full detail.
- Market archetypes are simplified and must not be interpreted as fixed national stereotypes.
- Legacy–shadow parity is not expected before calibration.
- The current readiness profile uses defaults for capabilities not yet collected by the Go Global UI.
- No causal or predictive validity has been established.

## 8. Data governance

Research export excludes free-text rationale. Upload is denied unless explicit consent is true and telemetry is enabled. Anonymous users have insert-only access under Supabase RLS; no anonymous read, update or delete policy is defined.

## 9. Release gates

Public release requires:

1. Existing BizOn and Brand Passport tests pass.
2. AIBIS tests and syntax checks pass.
3. At least 30 parity records are reviewed.
4. No P0 privacy or regression issue remains.
5. Research participant information and withdrawal process are approved.
6. Parameters and theoretical sources are documented and reviewed.

## 10. Versioning

- Engine: 0.1.0
- Parameter registry: 0.1.0
- Telemetry: 0.1.0
- Status: private/staging
