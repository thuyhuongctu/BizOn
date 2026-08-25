# Core v2 Shadow Synchronization

## Purpose

Observe the production legacy save (`localStorage['bizon2026']`) and create a comparable Core v2 snapshot without changing gameplay, runtime state `S`, scoring, events, or the legacy save.

## Activation

```text
/?coreV2=1&shadowSync=1
```

`shadowSync=1` has no effect unless `coreV2=1` is also present.

## Storage contract

Shadow snapshots use an isolated namespace:

```text
bizon:v2:shadow:<sessionId>
```

They do not use the primary v2 namespace:

```text
bizon:v2:session:<sessionId>
```

A shadow snapshot is observational evidence only. It is not a resumable production save and must not be promoted automatically.

## Processing flow

1. Read the raw legacy value.
2. Compute a stable source hash.
3. Skip conversion when the hash is unchanged.
4. Convert using `legacy-state-adapter.js`.
5. Validate with `GameState.validateGameState()`.
6. Attach `metadata.shadowSync` provenance.
7. Verify the legacy raw value remains byte-for-byte unchanged.
8. Store only in the shadow namespace.

## Safety constraints

- No patching of legacy `save()` or `load()`.
- No mutation of global runtime state `S`.
- No automatic migration to the primary v2 namespace.
- No network upload.
- No changes to simulation results.
- Errors are contained and reported through controller status.
- Polling interval is at least 1 second; browser default is 2 seconds.

## Public API

```javascript
const controller = BizOnShadowSync.createController({
  storage: localStorage,
  intervalMs: 2000,
  persistShadow: true
});

controller.start();
controller.syncNow();
controller.stop();
controller.getStatus();
controller.getLastSnapshot();
```

## Acceptance criteria

- No URL flags: module is not loaded.
- `coreV2=1` only: bridge loads; shadow sync does not start.
- Both flags: controller starts and is exposed as `window.BIZON_CORE_V2_SHADOW`.
- Repeated unchanged legacy save does not create a new synchronization count.
- Changed legacy save creates a new validated snapshot.
- Legacy bytes remain unchanged.
- Primary v2 session namespace remains untouched.
- Corrupt legacy JSON produces a contained error.

## Rollback

Remove `shadow-sync.js`, its test, workflow and documentation, then revert the shadow loader block in `js/backend-config.js`. Existing shadow keys may be safely deleted because they are not production saves.
