# BizOn Existing Asset Usage Map V1

**Status:** Working baseline for the unified redesign  
**Rule:** Use only existing BizOn visual assets. Do not generate replacement characters or overwrite the original clay-style library.

## 1. Preservation rules

1. Preserve the original 3D clay visual language and character identity.
2. Keep source files unchanged; optimize only through derived web variants when required.
3. Do not replace Hương/Lumina, Tú Phan, the Vietnam clay map, game scenes, music illustrations, or character sheets with newly generated images.
4. Do not include Food Truck assets in the preserved public redesign inventory.
5. Keep deterministic simulation, model cards, research evidence, and Zenodo metadata independent from visual presentation changes.
6. Every public image must have meaningful Vietnamese and English alternative text where the page is bilingual.

## 2. Confirmed repository inventory

The automated manifest generated from the current repository records **122 image assets**:

| Classification | Count |
|---|---:|
| Character library | 53 |
| Lumina | 25 |
| Tú Phan | 19 |
| Other illustrations | 13 |
| Brand assets | 5 |
| Vietnam-map assets | 4 |
| Music assets | 2 |
| Game / character-sheet asset | 1 |

The current scan found one exact duplicate group:

- `assets/character/anh-tu-ao-dai-cut.webp`
- `assets/character/anh-tu-ao-dai-smile-cut.webp`

Both files remain preserved until usage references and IP records are reviewed. No original is deleted automatically.

The repository IP inventory additionally records the character sheets `VN-BIZON-BP-CAST-001` and `VN-HƯƠNG-CLAY-001`, a consistent claymorphism design system, and 21 Brand Passport character assets standardized to 760 × 1100 px.

## 3. Priority assets and placements

| Asset / family | Primary use | Secondary use | Treatment |
|---|---|---|---|
| `assets/illustrations/lumina-holo-classroom.webp` | Homepage founder/Lumina panel | Classroom and Lumina introduction | Preserve framing; use responsive `object-position`; do not redraw |
| `assets/illustrations/anh-tu-lecture-hall.webp` | Homepage academic-advisor panel | Instructor Studio and About | Preserve identity and existing scene |
| `assets/character/lumina-office-present.webp` | Command Center and AIBIS reflection guidance | Brand Passport learning layer | Keep Lumina visually separate from deterministic engine outcomes |
| `assets/character/lumina-ao-dai.webp` and pose family | Startup Lab, Lumina pages and Vietnamese identity | Onboarding and character library | Select an existing pose by context; do not create replacement poses |
| Tú Phan áo-dài family | Academic advisor and instructor guidance | Institutional/partner pages | Preserve the existing explain, point, smile, welcome and work variants |
| `assets/illustrations/arena-vietnam-map-v2.webp` | Bật Nghiệp domestic simulation | Homepage journey and Mekong Compass | Keep bilingual HTML label overlays outside the image |
| `assets/illustrations/giai-dieu-bizon.webp` | BizOn Music / Giai điệu BizOn | Explore Universe | Preserve existing cover and Lumina depiction |
| `assets/illustrations/phong-thu-bizon.webp` | BizOn Music studio section | Creative Library | Preserve the original scene |
| `assets/character/bizon-duo-phong-thu-cut.webp` | Music duo / authorship scene | Creative Library | Preserve the cut-out source and transparent edges |
| `assets/illustrations/cast-sheet-brand-passport.webp` | Brand Passport character library | IP evidence and documentation | Preserve the character-sheet relationship and identifiers |
| Team role assets under `assets/character/team/` | Startup Lab roles and collaboration | Command Center | Distinguish the legal-secretary role from the four C-Suite roles |
| AIBIS / global-market assets | International-market simulation | Command Center and Store screenshots | Use current project data and engine outputs; avoid presenting illustrative values as real-world claims |

## 4. Page-by-page mapping

### Public homepage (`index.html`)

- Hero left: existing Hương/Lumina scene.
- Hero right: existing Tú Phan lecture-hall scene.
- Main portals: Learner, Instructor, Organisation/Partner.
- Ecosystem section: existing clay globe and module illustrations.
- Vietnam journey: `arena-vietnam-map-v2.webp`.
- Product proof: current screenshots from Bật Nghiệp, AIBIS, Brand Passport, and Instructor Studio.

### Web/PWA landing (`app/release.html`)

- Use the existing Hương/Lumina and Tú Phan scenes through the approved asset registry.
- Do not duplicate full-resolution source files unnecessarily.
- Keep Command Center and AIBIS screenshots tied to current build data.

### Command Center (`app/command-center.html`)

- Use `lumina-office-present.webp` for reflection guidance.
- Team/role portraits must come from the existing role library.
- World-map interface visualization does not replace the character library.

### AIBIS (`app/aibis.html`)

- Use the existing Lumina advisor image only to support interpretation.
- Keep country and entry-mode data sourced from the project registry and deterministic engine.
- Do not add decorative images that obscure decision criteria.

### Startup Lab / Bật Nghiệp (`game.html` and related pages)

- Preserve the clay Vietnam map and six-round game imagery.
- Preserve five leadership/team roles while distinguishing the legal-secretary role from the four C-Suite roles.

### Brand Passport

- Use the existing 21-character standardized cast.
- Preserve character IDs and character-sheet relationships.
- Keep Lumina Coach/Critic visually distinct from deterministic outcomes.

### Classroom / Instructor Studio

- Use existing Tú Phan áo-dài assets for academic guidance.
- Use existing Lumina assets only for learning support and reflection prompts.
- Do not imply that AI automatically grades students.

### Music and Creative Library

- Preserve `giai-dieu-bizon.webp`, `phong-thu-bizon.webp` and `bizon-duo-phong-thu-cut.webp`.
- Keep Arcade, Music, Character Library, and Merchandise in the secondary Explore Universe area.

## 5. Web optimization policy

Derived variants may be created without changing the source artwork:

- WebP/AVIF derivatives;
- responsive widths such as 480, 768, 1200, and 1600 px;
- thumbnails;
- safe crops that do not remove essential character features;
- compression with visual review;
- lazy loading below the fold;
- explicit width and height attributes to prevent layout shift.

Original files remain the archival and IP-reference copies.

## 6. Naming and metadata

Use stable, descriptive names for derived variants:

```text
<asset-name>--w480.webp
<asset-name>--w768.webp
<asset-name>--w1200.webp
<asset-name>--thumb.webp
```

Every mapped asset should eventually have:

- source path;
- derived path(s);
- character/module classification;
- copyright/IP grouping;
- allowed pages;
- Vietnamese alt text;
- English alt text;
- source dimensions;
- web dimensions;
- file size;
- status: preserve / optimize / archive / exclude.

## 7. Exclusions

- Newly generated replacement character images from the redesign discussion.
- Food Truck artifacts.
- Decorative world-map images from third-party social posts.
- Screenshots with unverified external branding or data.
- Any asset whose ownership or licence is unclear.

## 8. Implementation sequence

1. Generate and review the machine-readable repository manifest.
2. Maintain an approved registry for public and app surfaces.
3. Identify duplicates and unused files without deleting originals.
4. Generate only technical derivatives from approved existing assets.
5. Update homepage and app-shell references through a reviewable PR.
6. Re-capture desktop/mobile visual QA and Play Store screenshots.
