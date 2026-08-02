# BizOn — Play Console submission worksheet

**Package name:** `vn.bizon.simulation`  
**Release channel first:** Internal testing  
**Production entry:** `https://thuyhuongctu.github.io/BizOn/app/release.html`  
**Privacy policy:** `https://thuyhuongctu.github.io/BizOn/chinh-sach.html`

## 1. App setup

| Field | Value |
|---|---|
| App name | BizOn: Business Simulation |
| Default language | English (United States) |
| App or game | App |
| Free or paid | Free |
| Category | Education |
| Package | `vn.bizon.simulation` |
| Ads | No |
| In-app purchases | No |

Add Vietnamese as a localized listing using `listing/vi-VN.md`.

## 2. App access

Core modules do not require an account or password. Classroom activities may ask for a class code supplied by an instructor. The first internal-testing release must remain usable without a class code through the launcher, Startup Lab, Brand Passport, and AIBIS.

Recommended Play Console response:

- All functionality is available without special access: **Yes**, provided the submitted build keeps core routes open.
- Reviewer instructions: open the app and select a module from the launcher; no login is required.

Recheck this answer whenever authentication or an institution-only route is introduced.

## 3. Content and audience

- Intended use: higher education, professional learning, and adult self-directed learning.
- No advertising, gambling, real-money rewards, or financial transactions.
- Simulation outputs are educational and are not investment, legal, or financial advice.
- Complete the IARC content-rating questionnaire from the actual submitted build. Do not infer a rating in advance.
- Complete the Target audience and content form based on the selected countries and institutional deployment. The listing should not be positioned as a child-directed product.

## 4. Data safety

Use `docs/release/GOOGLE_PLAY_DATA_SAFETY_DRAFT.md` as the working basis. The final declaration must cover the web application and its infrastructure, not only native Android permissions.

Before moving beyond internal testing:

- inspect every enabled Supabase endpoint and RPC;
- confirm whether classroom result submission is enabled in the submitted build;
- document retention and deletion operations;
- identify the responsible data controller and operational privacy contact;
- reconcile the declaration with the production privacy policy;
- review third-party processing by GitHub Pages and Supabase.

Do not answer “No data collected” while optional classroom submission remains available.

## 5. Store assets

Required package produced by the `Play Store Submission Kit` workflow:

- 512 × 512 app icon;
- 1024 × 500 feature graphic;
- four phone screenshots at 1080 × 1920;
- screenshot alt-text file;
- Vietnamese and English listing text.

All screenshots must show the current interface. Do not add rankings, download claims, awards, prices, testimonials, or misleading features.

## 6. Signing and Digital Asset Links

Production release requires the `google-play-release` GitHub environment and these secrets:

- `BIZON_UPLOAD_KEYSTORE_BASE64`
- `BIZON_UPLOAD_STORE_PASSWORD`
- `BIZON_UPLOAD_KEY_ALIAS`
- `BIZON_UPLOAD_KEY_PASSWORD`
- `PLAY_APP_SIGNING_SHA256`

After Play App Signing is enabled:

1. copy the SHA-256 fingerprint of the **App signing key certificate**, not only the upload certificate;
2. run the production AAB workflow;
3. review the generated `assetlinks.json`;
4. publish it at `https://thuyhuongctu.github.io/.well-known/assetlinks.json` or move the app to a host where the root well-known path can be controlled;
5. verify the relation with the Digital Asset Links API;
6. install through the Play internal-testing link and confirm the TWA opens without a browser toolbar.

### Current hosting constraint

The application is served from the GitHub Pages project path `/BizOn/`, while Digital Asset Links must be available at the host root `/.well-known/assetlinks.json`. A file committed only to the BizOn project repository is served at `/BizOn/.well-known/assetlinks.json` and does not satisfy host-root verification. Production TWA verification therefore requires one of these controlled solutions:

- publish the root file through the `thuyhuongctu.github.io` user-site repository;
- use a custom domain and publish the root file there;
- keep the Android build in Custom Tabs mode until domain verification is completed.

## 7. Release sequence

1. Generate and review store assets.
2. Create the app in Play Console with package `vn.bizon.simulation`.
3. Enable Play App Signing.
4. Configure GitHub release secrets.
5. Build signed AAB with an increasing version code.
6. Upload to Internal testing.
7. Complete app content, privacy, content rating, and target-audience sections.
8. Add testers and verify installation, navigation, offline fallback, and external links.
9. Publish root Digital Asset Links and verify TWA association.
10. Promote to closed or production testing only after the Data Safety and deletion operations are approved.

## 8. Release blockers

- [ ] Play Console developer account and app record exist.
- [ ] Package name is accepted and reserved.
- [ ] Play App Signing is enabled.
- [ ] Upload key is stored only in protected secrets.
- [ ] App-signing SHA-256 has been obtained.
- [ ] Root Digital Asset Links hosting is resolved.
- [ ] Data Safety declaration has an accountable approver.
- [ ] Retention and deletion operations are active for every enabled server submission route.
- [ ] Store screenshots have been reviewed on a physical Android phone.
- [ ] Signed internal-test build opens all four advertised modules.
