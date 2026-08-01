# AIBIS Entry Mode Simulator Preview

## Purpose
Visual prototype for comparing six international market entry modes: Export, Licensing, Joint Venture, Strategic Alliance, Wholly Owned FDI, and Digital Entry.

## Safety boundary
- Illustrative parameters only.
- No production GameState read/write.
- No Supabase upload.
- No change to `global.html` or current gameplay.
- No investment recommendation claim.

## Interaction
Users adjust five priorities: control, speed, learning, capital constraint, and risk tolerance. The preview recalculates a transparent weighted-fit score and ranks all modes.

## Next engineering step
Replace illustrative registry values with a versioned AIBIS parameter registry, reviewed by subject-matter experts and backed by model cards. Integration with Core v2 must occur through selectors and commands, not direct DOM mutation of simulation state.

## Acceptance criteria
- Six unique modes.
- All parameter values remain within 0–100.
- Responsive layout at 360, 768, 1366, and 1920 px.
- Selection and comparison work without backend access.
- Page is isolated from production gameplay.