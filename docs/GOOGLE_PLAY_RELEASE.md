# Google Play / Android release runbook

Status: preparation guide for BizOn Bật Nghiệp. This document does not mean the app has been submitted or approved.

## Product definition

BizOn is one multi-game educational ecosystem. The Android app must open the ecosystem hub, not only the six-round simulation.

- Web origin: `https://thuyhuongctu.github.io`
- PWA path: `/BizOn/`
- Start URL: `https://thuyhuongctu.github.io/BizOn/index.html?source=pwa`
- Proposed package ID: `io.github.thuyhuongctu.bizon` (confirm before the first production release; a published package ID is effectively permanent)
- Distribution format: Android App Bundle (`.aab`)
- Wrapper: Trusted Web Activity (TWA) generated with Bubblewrap
- Target SDK: API 36 to meet the Google Play requirement applying to new apps and updates from 31 August 2026

Official references:

- TWA overview: https://developer.android.com/develop/ui/views/layout/webapps/trusted-web-activities
- Bubblewrap quick start: https://developer.android.com/develop/ui/views/layout/webapps/guide-trusted-web-activities-version2
- Target API requirement: https://developer.android.com/google/play/requirements/target-sdk
- Play Console registration: https://support.google.com/googleplay/android-developer/answer/6112435
- New personal-account testing: https://support.google.com/googleplay/android-developer/answer/14151465

## Readiness already present

- HTTPS hosting on GitHub Pages
- installable web manifest with 192 px and 512 px icons
- service worker and offline app shell
- standalone display mode
- Vietnamese and English interface
- public privacy policy at `/BizOn/chinh-sach.html`
- ecosystem hub, main simulation, Arcade and GO GlObal

## Blocking decisions

1. Confirm the final Play Console account owner.
2. Confirm the permanent Android package ID.
3. Decide whether to keep the `thuyhuongctu.github.io` origin or use a custom domain.
4. Decide the initial target audience. Current recommendation: higher education and training; do not mark the app as specifically directed to children unless the Families requirements are intentionally adopted.
5. Verify every data-safety answer against the production build.

## Digital Asset Links constraint

Android checks:

`https://thuyhuongctu.github.io/.well-known/assetlinks.json`

It does not check `/BizOn/.well-known/assetlinks.json` for ownership of the host. Therefore use one of these options:

- publish the final file from the root GitHub Pages repository `thuyhuongctu.github.io`; or
- move BizOn to a custom domain and publish `/.well-known/assetlinks.json` there.

Use `docs/assetlinks.template.json` only as a template. Replace the SHA-256 placeholder with the final Play App Signing certificate fingerprint.

## Build steps

1. Install Node.js, Java and the Android SDK.
2. Install Bubblewrap: `npm install -g @bubblewrap/cli`.
3. Initialize from `https://thuyhuongctu.github.io/BizOn/manifest.webmanifest`.
4. Confirm:
   - app name: `BizOn Bật Nghiệp`
   - launcher URL: ecosystem hub
   - package ID: final confirmed value
   - target SDK: 36
5. Generate an upload keystore outside the public repository.
6. Build and sign the Android App Bundle.
7. Enroll in Play App Signing.
8. Copy the final signing-certificate fingerprint into the root Digital Asset Links file.
9. Test verification. If verification fails, Android falls back to a browser Custom Tab with visible browser UI.

## Secrets rule

Never commit:

- `*.jks`, `*.keystore`
- keystore aliases or passwords
- `keystore.properties`
- Play service-account JSON
- production API keys
- final secret values in Actions workflow files

Store signing material in an encrypted offline backup. Losing an upload key can delay updates even when Play App Signing is enabled.

## Play Console checklist

- [ ] Pay the one-time USD 25 developer registration fee
- [ ] Verify identity, contact email and phone
- [ ] Complete physical Android-device verification if requested
- [ ] Create the app as a game/educational simulation
- [ ] Upload signed `.aab`
- [ ] Add privacy-policy URL
- [ ] Complete Data safety
- [ ] Complete Ads declaration
- [ ] Complete App access declaration
- [ ] Complete Target audience and content
- [ ] Complete IARC content rating
- [ ] Upload icon, feature graphic and phone/tablet screenshots
- [ ] Run internal testing
- [ ] For a new personal account: maintain at least 12 opted-in closed testers for 14 continuous days
- [ ] Apply for production access
- [ ] Review pre-launch report and fix crashes, layout issues and broken links
- [ ] Release gradually

## Current data-safety working assumptions

These are not final Play Console answers.

- game state, team name and preferences: stored locally on device
- accounts: none in the current version
- advertising: none
- in-app purchases: none
- optional voice input: browser/OS permission may be requested when the user actively invokes it
- external network services: GitHub Pages, Google Fonts, Tailwind CDN, CoinGecko and open.er-api.com may process technical request data under their own policies

Re-check these assumptions immediately before submission.
