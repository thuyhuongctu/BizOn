# BizOn legacy state inventory

## Production save entry point

- Storage key: `bizon2026`
- Owner: `js/app.js`
- Runtime variable: `S`
- Save operation: `localStorage.setItem(STORAGE_KEY, JSON.stringify(S))`
- Load operation: parse JSON, then apply inline nullish-default migration.

## Observed top-level fields

The current runtime state contains at least:

- `profile`
- `round`
- `balance`
- `history`
- `competitors`
- `missionsClaimed`
- `aiAskedTotal`
- `itemsBought`
- `minigameBest`
- `minigamePlays`
- `roundLocked`
- `grantLog`
- `minigamePoints`
- `rewardsOwned`
- `rewardEquipped`
- `oee`
- `defect`
- `brandLoyalty`
- `adEff`
- `quickRatio`
- `roi`
- `energyLines`
- `lineUpgraded`
- `maintBonus`
- `maintenanceLog`
- `loan`
- `costCutter`
- `peakShare`
- `eventShownRound`
- `whatIfUsed`
- `advisorHistory`
- `whatIfTotal`
- `suggestionsApplied`
- `achShown`
- `achievements`
- `conquest`
- `aiHistory`
- `teamMembers`

## Legacy history observations

Mission rules in `js/engine.js` show that history entries include at least:

- `netProfit`
- `share`

Additional fields are intentionally copied through by the adapter without interpretation.

## Migration decision

The v2 core must not replace the production key yet.

The first adapter is read-only and feature-flagged:

1. Read `bizon2026`.
2. Parse and validate shape defensively.
3. Map only fields with known meaning to GameState v1.
4. Preserve the untouched legacy payload under a private migration envelope only when explicitly requested for debugging.
5. Write the converted session only to `bizon:v2:*` keys.
6. Never delete or overwrite `bizon2026`.

## Mapping

| Legacy | GameState v1 |
|---|---|
| `profile.classId` / `profile.classCode` | `session.classId` |
| `profile.teamId` / `profile.teamName` | `session.teamId` |
| `profile.teamName` | `metadata.legacyTeamName` |
| `round` | `game.currentRound` |
| `balance` | `company.cash` |
| latest `history[].revenue` | `company.revenue` |
| latest `history[].netProfit` | `company.profit` |
| latest `history[].share` | `company.marketShare` |
| `history` | `outcomes` |
| `grantLog` | `instructorActions` |
| `advisorHistory` / `aiHistory` | `aiInteractions` |

## Explicitly not inferred

The adapter does not infer risk, reputation, decisions, event semantics, or competitor state when the source does not provide a stable contract.

## Rollback

Delete the adapter, tests, docs, and workflow. No production data is modified.