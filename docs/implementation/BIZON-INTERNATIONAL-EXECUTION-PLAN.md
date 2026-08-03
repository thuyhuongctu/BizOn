# BizOn International Execution Plan v1.0

**Status:** implementation source of truth  
**Base branch:** `main`  
**Planning branch:** `plan/bizon-international-implementation-v1`  
**Primary delivery branches:** small feature branches created per sprint  
**Product scope:** BizOn Bật Nghiệp, AIBIS/Go Global, Instructor Studio

## 1. Purpose

This document converts the BizOn International Blueprint into an executable delivery plan. It does not authorize a full rewrite. Existing game behavior must remain available while modules are extracted and replaced incrementally.

## 2. Product outcome

BizOn will become an explainable AI business-simulation platform with three production surfaces:

1. **BizOn Bật Nghiệp** — domestic entrepreneurship and business-management simulation.
2. **AIBIS** — internationalization and international-business simulation.
3. **Instructor Studio** — class setup, control, learning analytics and research export.

Supporting assets such as Arcade, music, characters and Brand Passport remain available, but they are not allowed to block completion of the three production surfaces.

## 3. Delivery principles

1. Deterministic engine first; generative AI second.
2. Same seed + same state + same decision must produce the same numerical result.
3. Every engine change must have tests and an explicit engine version.
4. Research telemetry is opt-in and consent-gated.
5. No M-AIDA source code, restricted data or credentials may be incorporated into BizOn.
6. Each pull request must be independently reversible.
7. Public pages remain operational during refactoring.
8. Commercial claims require evidence; visual polish cannot substitute for validation.

## 4. Current-state assessment

### 4.1 Strengths already present

- Six-round deterministic business simulation.
- Three AI rivals with different playbooks.
- Lumina advisor and What-If logic.
- Go Global and IE Lab.
- Class IDs, round locking and instructor bonus audit trail.
- PWA, service worker and Android TWA assets.
- Bilingual VI/EN experience.
- Existing engine and Brand Passport tests.
- DOI, citation metadata and proprietary licensing statement.
- Recent performance and asset optimization work.

### 4.2 Main gaps

- Core state, scoring, events and UI remain tightly coupled.
- Instructor workflow is not yet a complete product surface.
- AIBIS branch is 32 commits ahead but 2 commits behind `main`; it must be reconciled before merge.
- No unified product-maturity registry.
- No single release-gate document covering technical, educational, privacy and commercial readiness.
- AI governance is not yet enforced by a formal request/response contract.
- Research telemetry and consent are not yet part of the public production flow.
- Commercial packaging, onboarding and support process are incomplete.

## 5. Target architecture

```text
js/
├── core/
│   ├── state.js
│   ├── seed.js
│   ├── scoring.js
│   ├── events.js
│   ├── audit.js
│   ├── storage.js
│   └── version.js
├── startup/
│   ├── startup-engine.js
│   ├── startup-parameters.js
│   ├── rivals.js
│   └── startup-ui.js
├── aibis/
│   ├── aibis-engine.js
│   ├── readiness.js
│   ├── markets.js
│   ├── entry-modes.js
│   ├── negotiation.js
│   ├── shocks.js
│   └── aibis-ui.js
├── instructor/
│   ├── classroom.js
│   ├── teams.js
│   ├── round-control.js
│   ├── analytics.js
│   └── export.js
├── ai/
│   ├── lumina-gateway.js
│   ├── prompt-registry.js
│   ├── coach.js
│   ├── fallback.js
│   └── ai-audit.js
└── shared/
    ├── i18n.js
    ├── accessibility.js
    ├── validation.js
    └── ui-components.js
```

This is a target structure, not a requirement to move all files immediately. A module is moved only when a regression test protects its existing behavior.

## 6. Workstreams

### WS1 — Product stabilization

**Objective:** make current BizOn safe to extend.

Deliverables:

- canonical `GameState` schema;
- engine version field;
- deterministic seed utility;
- save/resume and state migration;
- corrupted-state fallback;
- full-game smoke test;
- browser error boundary;
- service-worker compatibility check.

Acceptance criteria:

- 100 scripted seeds complete six rounds without `NaN` or uncaught exceptions;
- saved games resume at the correct round with identical KPIs;
- invalid local storage does not produce a blank screen;
- current engine and Brand Passport tests remain green.

### WS2 — Instructor Studio v1

**Objective:** a lecturer can run a class without editing code.

Deliverables:

- class creation;
- class ID and team IDs;
- shared seed generator;
- game mode and AI mode selection;
- round lock/unlock;
- bonus-funding audit;
- class status table;
- team result CSV;
- decision log CSV;
- class summary JSON;
- facilitator quick-start guide.

Acceptance criteria:

- a class can be configured in under three minutes;
- at least 10 teams can be tracked concurrently in a technical pilot;
- every instructor mutation has an immutable audit entry;
- exports contain no unnecessary personal identifiers.

### WS3 — AIBIS research-ready

**Objective:** replace the Go Global beta with an academically governed internationalization simulation.

Eight-round journey:

0. readiness assessment;
1. market selection;
2. entry-mode selection;
3. pricing and localization;
4. partner negotiation;
5. shock response;
6. expand, hold or withdraw;
7. capability building;
8. board review and debrief.

Core KPIs:

- revenue;
- profit;
- cash;
- market share;
- risk;
- reputation;
- ESG;
- DOI;
- international learning;
- digital capability.

Acceptance criteria:

- seven markets and seven entry modes are covered by scripted tests;
- same seed and decisions are reproducible;
- all parameters are documented in the Model Card;
- research mode does not upload without consent;
- AIBIS numerical output is independent of LLM availability.

### WS4 — Lumina AI governance

**Objective:** add controlled generative support without compromising simulation integrity.

Modes:

- Off;
- Explain;
- Socratic;
- Advanced.

The AI may explain, ask questions, identify trade-offs and point to approved Theory Cards. It may not modify the deterministic state, KPI values, seed, events or grading.

Required audit fields:

- provider;
- model;
- model version;
- prompt version;
- request timestamp;
- latency;
- fallback used;
- response validation status.

Acceptance criteria:

- structured output validates against the response schema;
- invalid AI output falls back safely;
- disabling AI leaves the game fully usable;
- instructor can select the AI mode at class level.

### WS5 — Learning analytics and research

**Objective:** generate evidence, not only satisfaction data.

Telemetry events:

- session started/completed;
- round entered/completed;
- decision committed;
- evidence source viewed;
- AI advice requested;
- AI advice followed/rejected;
- counterfactual explored;
- strategy revised;
- debrief completed.

Research package:

- participant information;
- consent record;
- anonymous participant/team code;
- data dictionary;
- pre-test/post-test;
- reflection rubric;
- analysis plan;
- export and deletion procedure.

Acceptance criteria:

- all research fields have definitions and permissible values;
- free-text content is excluded by default;
- withdrawal workflow is documented;
- AI-off and AI-on conditions can be configured reproducibly.

### WS6 — Commercial pilot

**Objective:** sell a supported pilot, not an unfinished platform promise.

Initial offers:

1. **Classroom Free** — limited self-service classroom use.
2. **Instructor Pro Pilot** — Instructor Studio, exports and guided onboarding.
3. **Institution Pilot** — multiple instructors, support and institutional reporting.
4. **Enterprise Workshop** — facilitated simulation, custom debrief and report.

Acceptance criteria:

- pricing sheet;
- license terms;
- privacy notice;
- onboarding checklist;
- support contact and response policy;
- incident log;
- at least one documented pilot case.

## 7. Twelve-sprint sequence

Each sprint is two weeks unless explicitly shortened.

| Sprint | Main outcome | Primary workstream |
|---|---|---|
| S01 | Baseline audit and branch reconciliation | WS1 |
| S02 | Canonical state, seed and engine version | WS1 |
| S03 | Save/resume, migration and recovery | WS1 |
| S04 | Full-game and mobile smoke testing | WS1 |
| S05 | Class/team/shared-seed workflow | WS2 |
| S06 | Round control, audit and export | WS2 |
| S07 | AIBIS readiness, markets and entry modes | WS3 |
| S08 | AIBIS rounds, shocks and board review | WS3 |
| S09 | Consent, telemetry and research export | WS5 |
| S10 | Lumina contract, modes and fallback | WS4 |
| S11 | Pilot instruments and facilitator package | WS5/WS6 |
| S12 | Technical pilot, calibration and go/no-go | All |

Detailed tasks are stored in `BIZON-12-SPRINT-BACKLOG.csv`.

## 8. Branch and pull-request strategy

- `main`: public production.
- `plan/bizon-international-implementation-v1`: planning source of truth.
- `feat/aibis-foundation`: existing AIBIS experimental implementation; reconcile with current `main` before review.
- New feature branches: one sprint outcome per branch.

Required PR structure:

1. problem statement;
2. scope and non-scope;
3. files changed;
4. behavior before/after;
5. tests executed;
6. migration and rollback;
7. privacy/AI implications;
8. acceptance criteria checklist.

## 9. Product maturity model

- **L1 Concept:** idea and intended outcome documented.
- **L2 Design Complete:** flows, data and acceptance criteria documented.
- **L3 Implementation Ready:** technical specification and test cases exist.
- **L4 Production Ready:** implementation tested and operable.
- **L5 Commercial Ready:** production evidence, support, licensing and onboarding complete.

The current and target levels are maintained in `BIZON-PRODUCT-MATURITY.csv`.

## 10. Governance cadence

Weekly:

- backlog review;
- blockers;
- quality metrics;
- scope-control decision.

At each sprint close:

- demo;
- test evidence;
- acceptance decision;
- maturity-level update;
- release note.

Quarterly:

- educational evidence review;
- commercial review;
- IP and licensing review;
- AI governance review;
- roadmap re-prioritization.

## 11. Immediate next actions

1. Reconcile `feat/aibis-foundation` with the two commits now on `main`.
2. Run its complete CI suite and document failures.
3. Split the branch into reviewable PRs: foundation, telemetry/privacy, staging UI and documentation.
4. Start S01 baseline audit against the current production commit.
5. Freeze non-core feature expansion until the first paid-pilot release gate is met.

## 12. Definition of done

A task is complete only when:

- code or document is committed;
- automated tests exist where applicable;
- acceptance criteria pass;
- user-facing text is VI/EN when required;
- accessibility is checked;
- privacy and AI implications are recorded;
- rollback is documented;
- maturity registry is updated.
