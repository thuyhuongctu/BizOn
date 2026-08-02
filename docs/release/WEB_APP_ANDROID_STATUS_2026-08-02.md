# BizOn Web/PWA/Android — Verified Status

**Date:** 2026-08-02  
**Package:** `vn.bizon.simulation`

## Operational now

| Surface | URL / artifact | Verification |
|---|---|---|
| Marketing website | `https://thuyhuongctu.github.io/BizOn/` | Existing GitHub Pages production |
| Web application | `https://thuyhuongctu.github.io/BizOn/app/` | Public endpoint and manifest checked in Android CI |
| AIBIS workspace | `https://thuyhuongctu.github.io/BizOn/app/aibis.html` | Versioned deterministic engine integration merged |
| Installable PWA | Manifest under `/BizOn/app/` with scope `/BizOn/` | Contract CI passed; routes remain in installed-app scope |
| Android debug app | `BizOn-debug.apk` | SDK 35 build passed; APK signed; checksum verified |
| Digital Asset Links | `https://thuyhuongctu.github.io/.well-known/assetlinks.json` | Root endpoint, package and debug fingerprint CI passed |
| Privacy Policy | `https://thuyhuongctu.github.io/BizOn/chinh-sach.html` | Local-only/classroom distinction and Android disclosure CI passed |

## Android artifact identity

```text
Application ID: vn.bizon.simulation
Version: 0.1.0-alpha
Version code: 1
APK SHA-256: e6e25680b7a128cb9e832ec3a87990be3b267c3c4ba6bf731a46890638886ac2
Debug certificate SHA-256:
90:1F:4E:09:2B:15:A9:3A:77:F7:A0:A0:AD:9E:5A:1D:5C:06:3B:ED:3A:D7:69:1A:05:13:AE:9D:8B:80:AD:06
```

## Merged release increments

- Standalone `/app/` PWA shell and offline fallback.
- AIBIS engine/model/provenance integration.
- Unified installed-app scope and corrected internal routing.
- Android Trusted Web Activity project and build workflow.
- Root Digital Asset Links in the user-site repository.
- `.nojekyll` to publish `.well-known` on GitHub Pages.
- Privacy Policy and Data Safety working paper.

## Explicitly not production-ready

- Google Play application has not been created or submitted.
- Play App Signing fingerprint is not yet present in Digital Asset Links.
- No long-lived release/upload keystore has been configured.
- No signed production AAB has been generated.
- No real-device Android/Safari QA evidence has been recorded in the repository.
- Brand Passport Learning Pilot remains Draft and is not enabled for production data collection.
- Data controller and operational deletion process remain release gates for expanded classroom/pilot collection.

## Next controlled release step

1. Install the delivered debug APK on a real Android device.
2. Verify launch, full-screen TWA, Startup Lab, AIBIS, classroom route, offline fallback and privacy link.
3. Record device model, Android version, Chrome version, screenshots and any defects.
4. Create the Play Console app using the fixed package ID.
5. Obtain Play App Signing SHA-256 and append it to root Digital Asset Links.
6. Create a durable upload key and signed AAB.
7. Complete Play App Content forms from the Data Safety worksheet.
8. Publish to Internal testing before any public track.
