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

## 2. Confirmed preserved inventory

The repository IP inventory records:

- 93 character images across six grouped folders;
- 21 illustration and background assets;
- 3 brand-icon assets;
- 2 merchandise images;
- character sheets `VN-BIZON-BP-CAST-001` and `VN-HƯƠNG-CLAY-001`;
- a consistent claymorphism design system;
- 21 Brand Passport character assets standardized to 760 × 1100 px.

## 3. Priority assets and placements

| Asset / family | Primary use | Secondary use | Treatment |
|---|---|---|---|
| `assets/illustrations/lumina-holo-classroom.webp` | Homepage founder/Lumina panel | Classroom and Lumina introduction | Preserve framing; use responsive `object-position`; do not redraw |
| `assets/illustrations/anh-tu-lecture-hall.webp` | Homepage academic-advisor panel | Instructor Studio and About | Preserve identity and existing scene |
| Lumina white-áo-dài character family | Lumina advisor, learning prompts, music and creative library | Empty states and onboarding | Use original poses; select by context rather than creating new poses |
| Tú Phan white-áo-dài family | Academic advisor and instructor guidance | Institutional/partner pages | Preserve the eight known pose assets: welcome-cut, cheer, open-arms, point, present, tablet, think, welcome |
| `assets/illustrations/arena-vietnam-map.png` | Bật Nghiệp domestic simulation | Homepage journey and Mekong Compass | Keep bilingual HTML label overlays outside the image |
| `assets/illustrations/giai-dieu-bizon.jpg` | BizOn Music / Giai điệu BizOn | Explore Universe | Preserve existing cover and Lumina depiction |
| Brand Passport cast assets | Brand Passport gameplay and cast library | Character library | Keep 760 × 1100 standard and shared baseline |
| Game Bật Nghiệp scene assets | Main six-round simulation | Homepage product explanation | Use screenshots/scenes only when they reflect current gameplay |
| AIBIS / Go Global assets | International-market simulation | Command Center and Store screenshots | Use project data and current engine outputs; avoid illustrative numbers presented as real-world claims |
| Vietnam journey / regional map assets | Homepage ecosystem and domestic journey | About and academic context | Preserve Vietnamese/English overlays at all call sites |
| Music duo and studio assets | BizOn Music | Creative Library | Keep as secondary Explore Universe content |

## 4. Page-by-page mapping

### Public homepage (`index.html`)

- Hero left: existing Hương/Lumina scene.
- Hero right: existing Tú Phan lecture-hall scene.
- Main portals: Learner, Instructor, Organisation/Partner.
- Ecosystem section: existing clay globe and module illustrations.
- Vietnam journey: existing 3D Vietnam map.
- Product proof: current screenshots from Bật Nghiệp, AIBIS, Brand Passport, and Instructor Studio.

### Web/PWA landing (`app/release.html`)

- Use compact derived variants from the same preserved homepage asset families.
- Do not duplicate full-resolution source files unnecessarily.
- Keep Command Center and AIBIS screenshots tied to current build data.

### Command Center (`app/command-center.html`)

- Lumina character: existing advisor asset or cropped existing scene.
- Team/role portraits: existing role library only.
- World map remains an interface visualization, not a substitute character illustration.

### AIBIS (`app/aibis.html`)

- Use existing market and globalisation visuals.
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

- Use Tú Phan white-áo-dài assets for academic guidance.
- Use existing Lumina assets only for learning support and reflection prompts.
- Do not imply that AI automatically grades students.

### Music and Creative Library

- Preserve `giai-dieu-bizon.jpg` and the existing duo/studio images.
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

## 8. Next implementation slice

1. Enumerate repository image paths into a machine-readable manifest.
2. Match existing assets to this page map.
3. Identify duplicates and unused files without deleting originals.
4. Generate only technical derivatives from approved existing assets.
5. Update homepage and app-shell references through a reviewable PR.
6. Re-capture desktop/mobile visual QA and Play Store screenshots.
