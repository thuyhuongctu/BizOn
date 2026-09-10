-- ============================================================
-- Brand Passport Learning Pilot — lock remote submission
--
-- brand-passport-learning-pilot.html was never linked from site
-- navigation, but bizon_submit_learning_trace stayed callable by
-- `anon` in production with no separate feature flag gating it —
-- window.BIZON_BACKEND.enabled is shared with the main game and is
-- true in production, so anyone who found the pilot URL could have
-- written real rows before the pilot's own governance conditions
-- (data controller named, consent instrument live, staging test
-- done — see docs/learning/BRAND_PASSPORT_DATA_GOVERNANCE_V1.md
-- §4/§12) were actually met.
--
-- Revoke EXECUTE on the submit RPC so the pilot is truly local-only
-- until those conditions are met and this migration is reverted
-- (re-run the `grant execute ... to anon, authenticated` line from
-- 20260802000000_bp_learning_traces.sql). Read/delete RPCs are left
-- untouched: an instructor with a valid key still reads nothing (no
-- rows exist), and a student can still self-delete any row created
-- before this lock.
-- ============================================================

revoke execute on function public.bizon_submit_learning_trace(
  uuid, text, text, text, text, text, text, text, timestamptz, jsonb, text, timestamptz
) from anon, authenticated;
