# BizOn International Blueprint 2030 — Repository Integration Map

Status: living product architecture; not a claim that all modules are implemented.

## Product direction

BizOn evolves from a business simulation game into an **AI Business Decision Intelligence Platform**. The transition follows a strangler pattern: preserve working public experiences, introduce versioned deterministic core services, and promote experimental modules only after contract, visual, governance and device QA.

## Ten strategic pillars

1. Business Digital Twin
2. AI Multi-Agent Economy
3. Global Market Engine
4. Scenario Generator
5. Learning Intelligence
6. Research Laboratory
7. Enterprise Edition
8. Marketplace
9. Cloud Platform
10. AI Research Hub linking BizOn and M-AIDA through governed Evidence Packages, Theory Cards and Parameter Libraries rather than shared restricted source or data.

## Current repository mapping

| Pillar | Repository surface | Status |
|---|---|---|
| Business Digital Twin | `js/core/game-state.js`, `seed-engine.js`, `persistence.js`, legacy adapter | Foundation / experimental |
| AI Multi-Agent Economy | Agent contracts not yet implemented | Planned |
| Global Market Engine | AIBIS entry-mode engine and country profile registry | Preview / model validation required |
| Scenario Generator | Instructor Studio is available; no-code generator not implemented | Planned |
| Learning Intelligence | Decision Trace, Instructor Studio and governed learning-trace work | In progress |
| Research Laboratory | Academic/report surfaces exist; governed research export remains planned | Planned |
| Enterprise Edition | No tenant-isolated enterprise case system yet | Planned |
| Marketplace | No creator marketplace or commercial contract layer yet | Planned |
| Cloud Platform | Web/PWA/Android foundations and release contracts | Foundation |
| AI Research Hub | Conceptual BizOn–M-AIDA bridge only | Planned / governance required |

## Interface source of truth

- Public homepage: `index.html` (Academia 3D)
- Web/PWA landing: `app/release.html`
- Unified portfolio view: `app/blueprint-2030.html`
- Command workspace: `app/command-center.html`
- Instructor workspace: `app/instructor-studio.html`
- AIBIS workspace: `app/aibis.html`
- AIBIS entry-mode preview: `aibis-entry-mode-preview.html`

## Guardrails

- Deterministic engine remains the source of simulation outcomes.
- AI may explain, critique and support reflection; it does not silently alter scores or grades.
- Core v2 remains disabled unless `?coreV2=1` is supplied.
- Shadow sync additionally requires `shadowSync=1` and never overwrites `localStorage['bizon2026']`.
- Country profile values require provenance, year, confidence and licence review.
- Experimental entry-mode weights are simulation design parameters, not causal estimates or investment advice.
- Production Supabase, Android signing, Zenodo metadata and protected learner data are outside this integration.

## Specialist document programme

The full Blueprint is organised into twenty specifications: Master Product Vision; Software Architecture; Business Simulation Engine; AIBIS; AI Multi-Agent Framework; Learning Analytics; Research Mode; Instructor Studio; Scenario Builder; Enterprise Edition; Marketplace; Mobile & PWA; Cloud & API; Security & Privacy; Commercialisation; International Expansion; Responsible AI; Testing & QA; Brand & UX; and the Five-Year Product Roadmap.
