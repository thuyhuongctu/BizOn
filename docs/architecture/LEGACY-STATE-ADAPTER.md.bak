# Legacy state adapter

## Purpose

Convert the existing `localStorage['bizon2026']` startup-game state into GameState schema 1.0 without changing the public game or deleting the legacy save.

## Safety contract

- Read-only against `bizon2026`.
- No automatic conversion on page load.
- No raw legacy payload in the converted state unless `includeRawDebug: true` is explicitly supplied.
- Converted sessions may be persisted only through the v2 persistence service and therefore use `bizon:v2:*` keys.
- Unsupported or corrupt input returns a clear error.

## Public API

```js
BizOnLegacyStateAdapter.inspect(localStorage)
BizOnLegacyStateAdapter.readAndConvert(localStorage)
BizOnLegacyStateAdapter.convert(legacyObject)
```

## Feature-flag integration planned for the next PR

```js
window.BIZON_CORE_V2 = {
  enabled: false,
  legacyReadOnly: true,
  autoMigrate: false
};
```

The production UI must not call `readAndConvert()` until an explicit user or developer action is added and tested.

## Acceptance criteria

- Detect missing, valid, malformed JSON, and non-object saves.
- Convert known profile, round, KPI, history, instructor, and AI fields.
- Preserve unknown history record fields by deep copy.
- Keep `bizon2026` byte-for-byte unchanged.
- Reject invalid converted GameState.
- Do not infer unsupported semantics.

## Rollback

Delete the adapter, tests, workflow, and these documents. No storage migration or production-page modification is included.