# AIBIS implementation on the current BizOn codebase

**Status:** Foundation branch  
**Target:** Convert `global.html` from a four-quarter laboratory into a research-ready internationalization simulator without breaking the current public game.

## 1. Current-state constraint

`global.html` currently combines presentation, market data, state, scoring, simulation and feedback in one page. The migration therefore uses a strangler pattern: new modules are added beside the current logic, verified independently, and connected one feature at a time.

## 2. Files introduced in this phase

- `js/aibis-core.js`: deterministic world state, seeded RNG, readiness scoring, decision validation, audit log, round resolver and privacy-aware research export.
- `test/aibis-core.test.js`: regression tests for deterministic outcomes, valid ranges, decision logging and research export.
- `docs/AIBIS-IMPLEMENTATION.md`: staged integration plan tied to the existing repository.

## 3. Compatibility rules

1. The deterministic simulation engine owns numeric outcomes.
2. Generative AI may explain, negotiate and ask reflective questions, but must not overwrite engine results.
3. Every classroom run uses a scenario seed.
4. Research export excludes free-text rationale by default and requires an explicit consent flag.
5. Existing `global.html` remains functional until parity tests are complete.

## 4. Integration sequence

### Phase A — Foundation (this branch)

- Add canonical world state and decision schema.
- Add six-dimensional Internationalization Readiness Index.
- Add deterministic round resolution.
- Add anonymized research export.
- Add unit tests.

### Phase B — Connect to `global.html`

Add `<script src="js/aibis-core.js"></script>` after the existing shared scripts, then create an adapter rather than rewriting the page:

```js
window.aibisState = BizOnAIBIS.createWorldState({
  seed: `GLOBAL-${Date.now()}`,
  digitalCapability: Number(currentProfile.tech),
  classroomId: currentClassId || null,
  teamId: currentTeamId || null,
  consent: Boolean(researchConsent)
});
```

Map current UI actions to `appendDecision()` and map existing quarter inputs to `resolveRound()`. During this phase, calculate both legacy and AIBIS outputs and log differences without changing the user-visible score.

### Phase C — Decision telemetry

Add event capture for:

- selected market and entry mode;
- evidence sources opened;
- decision duration;
- AI advice requested;
- AI advice accepted or rejected;
- revisions and counterfactual comparisons;
- shock response;
- final outcome vector.

Do not collect names, email addresses or unstructured chat in the research export.

### Phase D — Eight-round journey

Replace the four identical quarters with explicit pedagogical rounds:

0. readiness;
1. market selection;
2. entry mode;
3. adaptation versus standardization;
4. negotiation;
5. global shock response;
6. expand, retreat or diversify;
7. capability building and board review.

Each round must declare learning objectives, allowed decisions, numeric inputs and debrief questions.

### Phase E — Instructor and research modes

Create three product modes:

- **Learn:** hints, theory cards and Lumina coaching;
- **Compete:** common seed, limited hints and leaderboard;
- **Research:** randomized treatment, protocol lock, consent, anonymous IDs and CSV/JSON export.

### Phase F — AI layer

Add the LLM gateway only after engine parity and telemetry are stable. Implement agents as prompt profiles over the same deterministic world state:

- Lumina Global — Socratic coach;
- Local Partner — negotiation counterparty;
- Competitor — strategic reaction;
- Regulator — policy and compliance;
- Board/Investor — performance accountability.

Agent responses must include the relevant state snapshot and must never mutate the state directly.

## 5. Proposed module map

```text
js/
├── aibis-core.js          # canonical state and resolver (created)
├── aibis-adapter.js       # bridge from global.html legacy state
├── aibis-markets.js       # market archetypes and evidence metadata
├── aibis-scenarios.js     # seeded shock library
├── aibis-counterfactual.js# clone-and-compare decisions
├── aibis-telemetry.js     # privacy-aware events
├── aibis-instructor.js    # classroom controls
└── aibis-agents.js        # prompt profiles; no numeric authority
```

## 6. Data model for Supabase

Minimum tables for the commercial pilot:

- `aibis_sessions`: seed, mode, classroom, team, consent, engine version;
- `aibis_decisions`: round, type, value, timing, evidence count, AI-use flags;
- `aibis_world_snapshots`: state JSON by round;
- `aibis_shocks`: scenario event and source;
- `aibis_ai_interactions`: agent, prompt version, model version, response status;
- `aibis_assessments`: pre-test, post-test, reflection rubric and final score.

Apply row-level security by classroom and team. Research exports use pseudonymous identifiers and omit free text unless separately approved.

## 7. Acceptance gates

The legacy public page must not be replaced until all gates pass:

- deterministic replay: identical seed and decisions produce identical outcomes;
- all numeric indicators remain within documented bounds;
- zero uncaught errors on mobile and desktop;
- offline page still loads;
- VI/EN switching remains intact;
- no personal data in default research export;
- instructor can reproduce a class run from seed and decision log;
- pre/post pilot protocol and consent text are approved.

## 8. Immediate next patch

The next code patch should add `aibis-adapter.js`, connect only **Step 0 — company profile** and **market/entry-mode decisions**, and run the legacy and AIBIS calculations in shadow mode. This is the smallest safe vertical slice before replacing any visible result.
