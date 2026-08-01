# BizOn Core v2 Feature-Flag Integration

## Purpose

Connect the versioned GameState, persistence service, and legacy adapter to the current website without changing public gameplay or the production save contract.

## Activation

The integration is disabled by default. Internal reviewers enable it with:

```text
/?coreV2=1
```

`js/backend-config.js` then loads, in order:

1. `js/core/game-state.js`
2. `js/core/persistence.js`
3. `js/core/legacy-state-adapter.js`
4. `js/core/core-v2-bridge.js`

Without the query flag, none of these four scripts are loaded by the integration loader.

## Internal panel

The bridge mounts a small internal panel that can:

- inspect `localStorage['bizon2026']`;
- preview the converted GameState v1;
- show the target v2 storage key;
- explicitly copy the converted state into v2 storage.

The panel does not modify decisions, scores, events, UI state, or the runtime variable `S`.

## Migration semantics

Migration is copy-only:

```text
bizon2026
   ↓ read and validate
converted GameState v1
   ↓ explicit user action
bizon:v2:session:<sessionId>
```

The bridge compares the legacy value before and after persistence. Any mutation raises `legacy_save_mutated`.

## Safety boundaries

- disabled by default;
- explicit URL flag required;
- explicit button click required to persist;
- legacy key is preserved byte-for-byte;
- no automatic migration during page load;
- no deletion of legacy data;
- no upload or backend call;
- no replacement of `save()`/`load()` in `js/app.js`;
- migration errors are displayed in the panel and do not stop the website.

## Internal validation URL

```text
https://thuyhuongctu.github.io/BizOn/?coreV2=1
```

For local testing:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/?coreV2=1
```

## Acceptance criteria

- no flag: no Core v2 integration scripts are dynamically loaded;
- flag enabled: scripts load sequentially;
- preview performs no write;
- migration creates one v2 session copy;
- `bizon2026` remains byte-for-byte unchanged;
- corrupt or missing legacy state produces a clear non-fatal status;
- current public gameplay remains unchanged.

## Rollback

Revert the loader block in `js/backend-config.js` and delete `js/core/core-v2-bridge.js`, its test, workflow, and this document. No production data migration is required.
