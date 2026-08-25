# AIBIS App Engine Integration

## Purpose
Connect the visual AIBIS workspace to versioned, deterministic entry-mode scoring and provenance-aware country-profile contracts.

## Runtime order
1. `country-profile-registry.js`
2. `entry-mode-models.js`
3. `entry-mode-engine.js`
4. `aibis-workspace.js`

## Boundaries
- UI never computes entry-mode scores independently.
- Fit score and evidence confidence remain separate.
- Demo country indicators retain source, year, confidence, license and limitations.
- Cultural and institutional distance remain bilateral constructs; current values are placeholders pending a home-host module.
- No localStorage, Supabase or production GameState access.

## Current demo limitations
Japan indicators and firm readiness values are illustrative teaching inputs. They are not current country ratings, investment advice or causal estimates. The engine weights remain transparent simulation-design parameters requiring expert validation and sensitivity analysis.

## Production migration
Replace the inline demo profile with an approved Country Pack, replace firm inputs with Firm Readiness selectors, then bind priorities and the selected mode to Core v2 commands. Preserve engine version, profile version and provenance in the decision audit log.
