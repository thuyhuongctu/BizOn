# BizOn Persistence, Save/Resume and Migration Contract

## Scope

This module adds versioned persistence without changing the public game UI or the existing legacy `localStorage` keys.

## Public API

- `saveGame(state, options)`
- `loadGame(sessionId, options)`
- `deleteGame(sessionId, options)`
- `listGames(options)`
- `exportGame(state)`
- `importGame(payload, options)`
- `migrateLegacyState(input)`
- `createAutosave(options)`

## Storage contract

Current sessions use:

```text
bizon:v2:session:<sessionId>
```

The previous valid copy is stored at:

```text
bizon:v2:backup:<sessionId>
```

The lightweight session index is stored at:

```text
bizon:v2:index
```

No existing BizOn production key is modified in this PR.

## Save sequence

1. Normalize or migrate the input state.
2. Validate against `GameState v1`.
3. Move the current saved copy to backup when one exists.
4. Write the new state.
5. Update the session index.

## Resume and recovery

1. Read the primary save.
2. Parse and validate it.
3. If the primary save is corrupted, read the backup.
4. Restore the valid backup as the primary copy.
5. Raise an explicit error if neither copy is valid.

Recovery never silently invents business outcomes.

## Legacy migration

The provisional migration adapter accepts a minimal legacy shape and maps:

- session/class/team identifiers;
- product and mode;
- round and status;
- headline company KPIs;
- decision, outcome, event, instructor and AI arrays when present.

The migrated record stores its original version in `metadata.migratedFrom`.

This adapter is deliberately conservative. Connecting it to the current public game requires a separate inventory of the actual legacy keys and shapes.

## Export format

```json
{
  "format": "bizon-session-export",
  "exportVersion": "1.0",
  "exportedAt": "ISO-8601 timestamp",
  "state": {}
}
```

Import validates and migrates before optional persistence.

## Autosave

`createAutosave()` accepts a `getState` callback and an interval of at least one second. It supports explicit `flush()`, `start()` and `stop()` operations. The game remains playable when autosave fails; callers receive the error through `onError` and `getLastError()`.

## Security and privacy

- Session identifiers are sanitized before becoming storage keys.
- The service does not upload data.
- The service does not add names, emails, chat transcripts or research consent fields.
- Browser storage remains device-local.

## Acceptance criteria

- Save and resume preserve state values and arrays.
- A second save creates a recoverable backup.
- Corrupted primary data recovers from a valid backup.
- Legacy input migrates to schema `1.0`.
- Invalid state is rejected with validation errors.
- Export/import round-trips successfully.
- Delete removes the session, backup and index entry.

## Integration plan

A later PR will add a thin adapter between the legacy game state and this service. Until then, this module is not imported by `index.html` or `global.html`.

## Rollback

Remove `js/core/persistence.js`, its tests, workflow and this document. No production key or database migration is involved.
