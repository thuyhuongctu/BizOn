# Google Play Data Safety — BizOn Draft

**Package:** `vn.bizon.simulation`  
**Privacy policy:** `https://thuyhuongctu.github.io/BizOn/chinh-sach.html`  
**Status:** working paper for Play Console; not a submitted declaration.

## 1. Release scope used for this draft

This draft covers the Android Trusted Web Activity that opens the BizOn PWA under `/BizOn/`.

Native Android manifest:

- requests `android.permission.INTERNET` only;
- does not request contacts, location, camera, microphone, SMS, call log or storage permissions;
- embeds Android Browser Helper to open the HTTPS PWA;
- contains no advertising or analytics SDK configured by BizOn.

The declaration must nevertheless cover data transmitted by the web application, not only native Android permissions.

## 2. Data-mode distinction

### Local-only use

Game progress, team name, decisions, outcomes, theme and language may remain in browser storage. CSV/JSON export writes a file to the device. Data that stays exclusively on the device is not treated as off-device collection for this draft.

### Optional classroom submission

When a user explicitly enters a class code and submits a result, the web app may transmit:

- class code;
- team alias or player-chosen label;
- simulation score and outcome metrics;
- decisions, event choices and decision trace;
- reflection text when the relevant feature is enabled;
- application/schema version;
- scenario seed;
- client timestamp and server-created timestamp.

No legal name, email address or phone number is required by the current classroom result contracts.

## 3. Proposed Play Console answers

These answers must be rechecked against the exact production build and current Play Console taxonomy before submission.

| Play question | Draft answer | Basis / condition |
|---|---|---|
| Does the app collect or share required user data types? | **Yes — collection is optional** | Classroom submission can transmit user-entered and app-activity data off device. Local-only play does not. |
| Is all transmitted data encrypted in transit? | **Yes** | Production endpoints are HTTPS. Confirm Supabase project and every callable endpoint remain HTTPS before release. |
| Can users request deletion? | **Partially implemented / release gate** | Existing classroom results need an operational deletion process. Brand Passport Learning Pilot has a deletion-token design but remains Draft. Do not claim universal in-app deletion until operational coverage is complete. |
| Is data shared with third parties? | **No sale; provider processing requires review** | GitHub Pages and Supabase are infrastructure processors. Confirm whether Play taxonomy treats each flow as collection versus sharing under the final controller/processor relationship. |
| Is collection required? | **No, for core local simulation** | Users can use core simulation without classroom submission. A specific instructor-led activity may require submission for that activity. |
| Purposes | **App functionality; education/classroom management; optional research only under separate approval** | Do not select analytics, advertising or personalization unless later code actually performs those purposes. |

## 4. Candidate data-type mapping

Play Console labels can change. Use this as a mapping worksheet, not a final selection.

| BizOn field | Candidate Play category | Optional? | Purpose | Notes |
|---|---|---:|---|---|
| Team alias / player label | User-generated content or User ID, depending on implementation | Yes | Classroom identification | Instruct users not to enter legal names. |
| Reflection text | User-generated content | Yes | Education / app functionality | May contain personal data if a user voluntarily writes it; add visible guidance not to include sensitive data. |
| Decisions and event choices | App activity / other actions | Yes | Simulation feedback and classroom facilitation | Deterministic engine output, not AI-generated score. |
| Score and outcome metrics | App activity | Yes | Classroom result display | Pseudonymous unless user chooses an identifying alias. |
| Class code | Other information / app functionality | Yes | Route record to a class | Not an account credential. |
| Scenario seed and versions | App information / diagnostics-like metadata | Yes | Reproducibility and audit | Confirm exact Play category during form completion. |
| Client/server timestamps | App activity / diagnostics-like metadata | Yes | Ordering and audit | Retention must be declared. |
| IP address processed by hosting/database providers | Review required | Incidental | Security and network delivery | Confirm provider logging, retention and Play classification. |

## 5. Security and governance assertions allowed now

- No advertising SDK is intentionally integrated.
- No in-app purchase or billing SDK is integrated.
- No sensitive Android permissions are requested.
- Local-only game data is not transmitted merely because the app is opened or a game is played.
- Classroom submission requires an explicit user action.
- Anonymous clients are not intended to receive direct read access to classroom result tables.
- AI explanation does not change deterministic simulation scores.

## 6. Assertions not yet allowed

Do not state any of the following in Play Console until the named gate is closed:

- “The app collects no data.”
- “Every user can delete all server data in the app.”
- “All classroom records are retained for exactly 180 days.”
- “Brand Passport reflections are stored in production.”
- “The pilot has institutional or research-ethics approval.”
- “The Play App Signing certificate is verified.”

## 7. Release gates

- [ ] Inspect all production Supabase tables/RPCs reachable from the PWA.
- [ ] Identify the data controller and privacy contact displayed in Play listing.
- [ ] Define retention and deletion operations for existing classroom results.
- [ ] Decide whether optional research data is excluded from the first Play build.
- [ ] Obtain Play App Signing SHA-256 and append it to root Digital Asset Links.
- [ ] Upload the signed AAB and inspect the permission list generated by Play Console.
- [ ] Reconcile this worksheet with the exact Data Safety questions shown for the package.
- [ ] Confirm Privacy Policy wording and Data Safety answers match.
- [ ] Record approval date, approver and evidence before submission.

## 8. Recommended first Play release profile

For the lowest-risk internal test:

1. keep Brand Passport Learning Pilot remote submission disabled;
2. expose core simulation, AIBIS and existing classroom result submission only where operationally required;
3. instruct testers to use aliases rather than legal names;
4. use the public Privacy Policy URL above;
5. treat the Data Safety form as collecting optional app-activity/user-generated data for classroom functionality unless the first Android release disables all server submission routes.
