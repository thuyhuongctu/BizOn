# BizOn Supabase Staging — First Remote Run

Use this checklist only with the protected GitHub Environment `supabase-staging`.

## First run

Open **Actions → BizOn Supabase Staging Gate → Run workflow** on branch `main`.

Inputs:

- `confirm_project_ref`: `kdpjlbqvdlnsthrmchm`
- `apply_migration`: `true`
- `run_retention_purge`: `true`

Approve the protected environment deployment when GitHub requests review.

Expected jobs:

1. `staging safety contract`
2. `protected staging migration and smoke test`

Expected checks include production-ref blocking, staging URL/database matching, instructor-key bootstrap, canonical migration, RLS, governed RPCs, class isolation, consent rejection, `ai_scoring=true` rejection, deletion-token verification, retention purge and fixture cleanup.

## Second run

After the first run passes, run again with:

- `confirm_project_ref`: `kdpjlbqvdlnsthrmchm`
- `apply_migration`: `false`
- `run_retention_purge`: `true`

This verifies idempotent operation without reapplying the migration.

## Security

Do not paste database URLs, publishable keys, instructor keys, deletion tokens, or learner data into issues, pull requests, logs, screenshots, or chat.
