# BizOn 1.0.0 — Internal Release Candidate 1

## Release identity

- Product: BizOn
- Developer profile: Thuy Huong Digital Learning
- Package: `vn.bizon.simulation`
- Version name: `1.0.0`
- Version code: `1`
- Track: Google Play Internal testing
- Distribution: Free
- Category: Education
- Target SDK: 36
- Minimum SDK: 23
- Start URL: `https://thuyhuongctu.github.io/BizOn/app/release.html`
- Privacy Policy: `https://thuyhuongctu.github.io/BizOn/chinh-sach.html`

## Current account gate

The Google Play developer registration fee has been paid. Identity verification is pending. Phone verification, Android-device verification, app creation and Play App Signing remain external Play Console steps.

No repository secret, keystore or password is required for the release-candidate audit.

## What the no-secret audit proves

Workflow `Android Internal RC Audit`:

1. validates the package, SDK versions, launcher URL and Android permissions;
2. confirms that only the Internet permission is declared;
3. confirms that Brand Passport remote submission remains disabled;
4. confirms that the production AAB workflow does not require Play App Signing SHA-256 for the first signed bundle;
5. compiles an unsigned release bundle using version `1.0.0` and code `1`;
6. validates the ZIP structure and publishes an audit artifact.

The unsigned audit artifact must never be uploaded to Google Play.

## Signing sequence after account approval

### A. Create and protect the upload key

Create an upload keystore locally with Android Studio or `keytool`. Keep the keystore and passwords outside the repository. Back up the keystore in an encrypted offline location.

Configure GitHub environment `google-play-release` with:

- `BIZON_UPLOAD_KEYSTORE_BASE64`
- `BIZON_UPLOAD_STORE_PASSWORD`
- `BIZON_UPLOAD_KEY_ALIAS`
- `BIZON_UPLOAD_KEY_PASSWORD`

`PLAY_APP_SIGNING_SHA256` is optional for the first AAB build.

### B. Build the first signed AAB

Run workflow `Android Production AAB` with:

- `version_name`: `1.0.0`
- `version_code`: `1`

Expected output:

- `BizOn-1.0.0-1.aab`
- `BizOn-1.0.0-1.aab.sha256`
- `release-metadata.json`
- either `assetlinks.json` or `assetlinks-status.txt`

### C. Upload to Internal testing

Create the Play Console app as a free Education app and upload the signed AAB to Internal testing. Use release name `1.0.0 Internal`.

Vietnamese release note:

> Phiên bản thử nghiệm đầu tiên của BizOn, gồm Startup Lab, Brand Passport, AIBIS và không gian hỗ trợ giảng dạy.

### D. Complete Play App Signing association

After Play App Signing is enabled:

1. copy the SHA-256 of the **App signing key certificate**, not the upload certificate;
2. store it as `PLAY_APP_SIGNING_SHA256` in the protected release environments;
3. run the protected root Digital Asset Links publication workflow in `thuyhuongctu/thuyhuongctu.github.io`;
4. install BizOn from the Internal testing link;
5. confirm that the Trusted Web Activity opens without a browser toolbar.

## Data boundary for RC1

- Core simulation can be used locally.
- Brand Passport remote submission remains disabled.
- No advertising SDK is integrated.
- Android requests Internet access only.
- Lumina does not change deterministic simulation scores.
- Data Safety must not claim “no data collected” if any classroom submission route is enabled in the final Play build.

## Version discipline

Once version code `1` has been uploaded to Play Console, it must never be reused. Subsequent builds use an increasing integer, for example:

- `1.0.1` / version code `2`
- `1.1.0` / version code `3`

Web-only interface updates can be deployed without a new AAB when Android permissions, package, launcher configuration and native assets do not change. Significant behavior or data-flow changes still require Store Listing, Privacy Policy and Data Safety review.
