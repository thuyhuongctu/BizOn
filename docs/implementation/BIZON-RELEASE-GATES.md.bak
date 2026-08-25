# BizOn Release Gates

This checklist governs movement from experimental development to technical pilot, academic pilot and paid commercial pilot.

## Gate 0 — Scope and ownership

Required before any release candidate:

- [ ] Release scope is limited to named product surfaces.
- [ ] Source files, characters, music, datasets and third-party components have a recorded owner or license.
- [ ] No M-AIDA restricted code, credentials or dissertation data are included.
- [ ] Release has a named product owner and technical owner.
- [ ] Non-scope items are explicitly documented.

**Failure rule:** any unresolved ownership or license question blocks paid release.

## Gate 1 — Deterministic simulation integrity

- [ ] Engine version is attached to every save and export.
- [ ] Same seed, state and decisions produce identical numerical results.
- [ ] 100 scripted six-round Startup simulations complete.
- [ ] Required AIBIS market × entry-mode scenarios complete.
- [ ] No `NaN`, `Infinity`, illegal transition or out-of-range KPI occurs.
- [ ] No single strategy dominates all calibrated scenarios without a documented pedagogical rationale.
- [ ] AI output cannot write directly to numerical state.

**Evidence:** automated test logs and calibration report.

## Gate 2 — Reliability and recovery

- [ ] Autosave occurs only at valid commit points.
- [ ] Resume restores the correct round, decisions and KPIs.
- [ ] Supported legacy saves migrate successfully.
- [ ] Corrupted local storage presents recovery choices.
- [ ] Service-worker update cannot trap users indefinitely on stale critical assets.
- [ ] Provider/API failure does not prevent completion of the core game.
- [ ] Rollback steps are documented.

## Gate 3 — Instructor operability

- [ ] New class setup takes under three minutes.
- [ ] Instructor can create class and team identifiers.
- [ ] Shared seed is applied consistently.
- [ ] Instructor can lock, unlock and pause rounds.
- [ ] Bonus, reset and injected event actions are audited.
- [ ] At least ten teams are visible in the technical pilot dashboard.
- [ ] CSV/JSON exports open successfully and match the data dictionary.
- [ ] Facilitator can run the session without developer intervention.

## Gate 4 — Accessibility and performance

- [ ] Core game is keyboard operable.
- [ ] Visible focus is present for all interactive controls.
- [ ] Form controls have accessible labels and error messages.
- [ ] Color contrast meets WCAG 2.2 AA for required text and controls.
- [ ] Reduced-motion preference is respected.
- [ ] Touch targets and mobile layouts support the core flow.
- [ ] LCP, CLS and page-weight budgets are met or exceptions are documented.
- [ ] Audio is optional and never required to understand a decision.

## Gate 5 — Privacy and research ethics

Required for any telemetry-enabled pilot:

- [ ] Participant information is available in Vietnamese and English.
- [ ] Consent is explicit, session-specific and revocable.
- [ ] No research upload occurs without active consent.
- [ ] Data dictionary identifies every collected field and purpose.
- [ ] Direct identifiers and free text are excluded by default.
- [ ] Retention period and deletion/withdrawal process are documented.
- [ ] Research exports are anonymized and validated.
- [ ] Classroom participation is not conditioned on research consent.
- [ ] Data controller and incident contact are identified.

## Gate 6 — AI governance

Required when generative Lumina is enabled:

- [ ] AI mode is visible to instructor and learner.
- [ ] Off, Explain, Socratic and Advanced modes behave as specified.
- [ ] Requests and responses conform to versioned schemas.
- [ ] Invalid responses are rejected or replaced by a safe fallback.
- [ ] Provider, model, prompt version, latency and fallback status are audited.
- [ ] Secrets are isolated from client-side source.
- [ ] AI limitations are disclosed.
- [ ] AI does not assign final grades or make irreversible learner decisions.
- [ ] Game remains usable when AI is unavailable.

## Gate 7 — Educational validity

- [ ] Learning outcomes are defined for each core module.
- [ ] Every major decision maps to a learning outcome.
- [ ] Theory Cards use approved citations and do not overstate evidence.
- [ ] Debriefing guidance exists.
- [ ] Assessment rubric exists.
- [ ] Pre-test/post-test instruments map to outcomes.
- [ ] Pilot analysis plan is defined before analyzing outcome data.
- [ ] Satisfaction is not the sole success metric.

## Gate 8 — Security and operations

- [ ] Production secrets are not stored in the repository.
- [ ] Inputs are validated and outputs encoded.
- [ ] Backend authorization is tested where applicable.
- [ ] Rate limits and abuse controls exist for AI and write endpoints.
- [ ] Error logging excludes sensitive data.
- [ ] Dependency and license inventory is current.
- [ ] Backup and recovery procedures are documented.
- [ ] Incident severity, contact and response process are defined.
- [ ] Release monitoring and rollback owner are assigned.

## Gate 9 — Commercial readiness

Required before charging a customer:

- [ ] Product scope and exclusions are written.
- [ ] Pricing and payment terms are written.
- [ ] License terms are approved.
- [ ] Privacy notice and data-processing terms are available.
- [ ] Onboarding checklist is complete.
- [ ] Support channel and response expectations are defined.
- [ ] Pilot success criteria and final report format are agreed.
- [ ] Customer data ownership and export rights are clear.
- [ ] At least one internal or unpaid technical pilot has completed.
- [ ] Commercial claims are supported by available evidence.

## Release classes

### Experimental

May be used by the development team. Must not collect production research data or be sold.

Minimum gates: 0, selected items from 1 and 2.

### Technical pilot

Used to validate workflows without research data collection.

Minimum gates: 0–4, 8.

### Academic pilot

Used in a real class, with optional research data collection.

Minimum gates: 0–8.

### Paid commercial pilot

Used under a paid agreement with onboarding and support.

Minimum gates: 0–9.

## Go/no-go record

Each candidate release must record:

```text
Release:
Commit/tag:
Release class:
Date:
Product owner:
Technical owner:
Passed gates:
Failed or deferred items:
Risk acceptance owner:
Rollback version:
Decision: GO / CONDITIONAL GO / NO-GO
```

A conditional go may not waive ownership, consent, simulation integrity or critical security requirements.
