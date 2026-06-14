# Equine Edu — Premium Design Transformation: Audit & Plan

Status: **EXECUTED 2026-06-10** — design system, atmosphere, motion unification, bulk cleanup, homepage, and course discovery are live. Background direction calibrated against the provided inspiration image (soft layered cream/dusty-blue terrain). Remaining: per-course editorial pass on lesson-page inline styles (reference course: Common Horse Colors), `tools/` pages (token-aligned only), and rebuilding `lesson-board`/`quiz-corral` index pages (lost to file corruption that predated this work — recover via OneDrive version history if possible).

---

## 1. Complete Design Audit

### 1.1 Architecture snapshot

| Layer | State |
|---|---|
| Pages | ~150 static HTML pages. No build step, no templating. Netlify + Supabase auth + Stripe paywall. |
| Shared CSS | 5 files, 2,033 lines: `core.css` (tokens/chrome), `components.css`, `course.css`, `game.css`, `learning-loft-games.css`. Loaded everywhere — high-leverage. |
| Shared JS | `layout.js` injects nav + footer on every page; `course-nav.js` + per-course `course-config.js` builds lesson sidebars. This is the site's de-facto templating system and the backbone for replicability. |
| Palette | New tokens (cream / dusty blue / tan / leather) already live in `core.css`, bridged to old names via legacy aliases (`--navy`, `--gold`, …). |
| Standalone monoliths | `index.html` (910 lines), `courses/index.html` (2,005), `lesson-board/index.html` (8,755), `quiz-corral/index.html` (19,437) — each carries its own large inline stylesheet. |

### 1.2 Hard findings (evidence-based)

1. **140 of ~150 pages carry inline `<style>` blocks**; 111 still reference legacy alias tokens; 79 course pages contain raw hex values. The design system exists, but most of the site routes around it.
2. **The homepage is still the old design.** `index.html` renders the legacy layout — 100vh dark hero, gold badge, stats bar, section stack — it only *looks* recolored because the aliases remap navy→heading-blue. This is exactly the "recolored layout" you said you don't want.
3. **Broken image references.** `components.css` `.hero-bg-*` classes point to `assets/images/course-heroes/*.png` — that folder doesn't exist (`assets/images/` holds one `placeholder.svg`). Viewing Room / Training Barn / Quiz hero backgrounds silently fail to a dark overlay on cream.
4. **Two motion systems** are maintained in parallel (`.motion-reveal` and `.fade-in`), both wired in `layout.js`.
5. **Token drift in the details:** 19 distinct `box-shadow` values in shared CSS alone; inline styles use radii of 2, 4, 5, 6, 8, 20, 999px against the tokenized 8/14/20; a harsh `0 4px 18px rgba(36,54,74,.22)` shadow sits on chips, flip cards, module rows, and number badges — visibly heavier than the soft system shadows around it.
6. **12 separate `-card` classes** (`module-card`, `info-card`, `term-card`, `lab-card`, `concept-card`, `game-card`, …) share one baseline via `:where()` but diverge in padding, shadow, and hover — duplicate patterns, not variants.
7. **Duplicate page:** `topics.html` and `courses/index.html` both serve "All Courses" (same title). One is stale.
8. **Encoding artifacts:** ~12 course files contain non-UTF-8 bytes (grep treats them as binary) — needs a cleanup pass.
9. **`.nojekyll`/`_headers` + `netlify.toml`** suggest a GitHub Pages → Netlify migration; both artifacts kept.

### 1.3 What's already good (keep, don't rebuild)

- Token architecture in `core.css` is clean and documented; the new palette is right for the brand.
- `layout.js` / `course-nav.js` injection pattern = one place to redesign nav, footer, and sidebar for all ~150 pages.
- `prefers-reduced-motion` handling is already correct.
- Course folder structure (`1-index` → `N-test-your-knowledge` + activities) is consistent and replicable.
- Accessibility basics: focus-visible styles, aria on burger menu, 44px min button heights.

---

## 2. Corporate / LMS Elements Identified

These are the patterns making the platform feel like course software:

1. **The SaaS hero** — full-viewport dark panel, uppercase badge chip, headline + sub + two buttons, decorative circles, followed by a stats bar. This is a startup landing page, not an equestrian publication.
2. **Boxes inside boxes** — virtually every content unit (terms, notes, outcomes, concepts, quizzes, games, sidebars) is the same white rounded-corner card on a cream canvas. Reading a lesson means reading a stack of cards.
3. **Section-stack architecture** — `learn-section` → `curriculum-section` → `track-section` → `cta-section`, each a 72–80px padded full-width band with alternating background, each opened by the identical label/title/desc header block. Hero → Section → Section → Footer, precisely the pattern you flagged.
4. **Uniform card grids** — 3-col module grids, 2-col term/concept/outcome grids, identical card sizes, identical hover. Course discovery feels like a file browser.
5. **University-portal heroes** on listing pages — dark photo overlay + centered white text + search input.
6. **Udemy-style enrollment card** — price block, checkmark list, guarantee line.
7. **Utility chrome** — full-width breadcrumb strip, ALL-CAPS tag chips on everything, checkmark bullets, boxed progress bar. Functional, but styled as admin UI rather than editorial wayfinding.
8. **The barn rooms don't exist visually.** Round Pen, Schooling Ring, Quiz Corral, Learning Loft are names in titles only — nothing in color, texture, illustration, or layout distinguishes the rooms or ties them into one environment.

## 3. Repetitive Layouts Identified

- The **lesson page archetype** (hero → 2-col card stack + sidebar) is identical across all ~75 lesson pages — good for consistency, but every card inside it is also identical, so pages have no rhythm.
- The **label/title/desc section header** opens nearly every section on every page.
- **Course landing pages** repeat the same 5-band stack regardless of subject.
- **Quiz pages** duplicate the same inline quiz CSS per course (~10×), including hardcoded feedback colors.
- **Game pages** re-declare shells that `game.css` already provides.
- `index.html`, `courses/index.html`, `topics.html`, `pricing.html` each re-implement buttons, heroes, and section headers inline, drifting from `components.css`.

---

## 4. Opportunities for Improvement (highest leverage first)

1. **Because nav, footer, and sidebar are JS-injected, the entire chrome can be transformed once.** A new soft-glass sidebar, editorial footer, and refined nav land on ~150 pages from two files.
2. **The card `:where()` baseline means "de-boxing" is centralized.** Retiring cards for editorial flow on text components (key terms, notes, intro) is a shared-CSS change, not 150 page edits.
3. **The atmosphere layer doesn't exist yet** — a site-wide layered background system is pure addition: one CSS file + one body class, zero functional risk.
4. **Lesson numbering is data we already have** (`1-index.html`…): oversized editorial chapter numerals, journey progress, and "next stop" storytelling can be driven by `course-nav.js` with no new content.
5. **The "rooms" can be expressed with one variable.** A per-section accent tint + line-art motif (`data-room="round-pen"`) gives each barn area identity inside one system.
6. **The homepage is the single biggest win** — it's the front door, it's still the old design, and it's self-contained.
7. **Inline-style consolidation doubles as the cleanup mandate** — migrating 140 pages' inline CSS into the shared system *is* the dead-code removal.

---

## 5. New Interaction Concepts

All built on one shared motion vocabulary (§8) — no per-page inventions.

1. **Course cards ("stable cards")** — photo-led card; on hover/focus: 4px lift, 1° tilt, image scales 1.04 inside its mask, a slide-up reveal shows lesson count + first three stops on the trail. On touch: whole card is the tap target, reveal content is always visible in a condensed footer row instead.
2. **Journey sidebar** — lesson list becomes a vertical trail: stops connected by a hand-drawn-style path, hoofprint fill for completed stops, current stop pulses softly once on load. Back/Forward live at the bottom of the rail (per the standing sidebar decision).
3. **Editorial term reveals** — key terms render as inline editorial entries (term in serif, definition in body) with an expand affordance for examples, replacing the 2-col card grid.
4. **Layered hero parallax** — background organic shapes drift at 0.9×/0.95× scroll speed (transform-only, disabled under reduced-motion); content never parallaxes.
5. **Quiz feedback choreography** — answer states ease in with a 240ms soft fade + 2px settle; score panel counts up; retry resets with a stagger. Same components, premium timing.
6. **Progress as a trail, not a bar** — course progress renders as a path with mile-markers in both sidebar and course landing; the fill animates on page entry.
7. **Contextual slide-out: "Field Notes"** — the existing notes-highlight content moves into a right-edge slide-out tab on lesson pages (desktop), bottom sheet (touch), keeping the reading column clean.

## 6. New Page Layout Concepts

One design language; layouts vary by composition, not by system.

1. **Homepage** — editorial cover, not SaaS hero: oversized serif masthead headline over the layered terrain background, horse imagery breaking the grid edge, a "begin the journey" path leading the eye down into a featured-course editorial spread (one large feature + two supporting, mixed widths), then "the rooms of the barn" as an illustrated map-like band, then a single quiet CTA. No stats bar, no 3-col feature grid.
2. **Course discovery (`courses/index.html`)** — magazine "issue contents": rooms as editorial sections with serif section openers, feature card + ranked list layout instead of uniform grids; filter chips replace the tab bar; search stays.
3. **Course landing** — editorial article opening: eyebrow (room name), oversized title, standfirst paragraph, meta line; curriculum as the illustrated trail; outcomes as a two-column editorial list with drop-cap lead; enroll card refined into a quiet floating panel.
4. **Lesson pages** — readable editorial column (measure ~68ch) with content *uncarded* by default; cards reserved for genuinely interactive objects (diagrams, mini-quiz, flip cards). Oversized chapter numeral behind the lesson title; pull-quotes for key facts; full-bleed image breaks between major blocks; soft wave/terrain transitions instead of hard section borders.
5. **Viewing Room / Training Barn / Quiz Corral** — same lesson shell, room-tinted atmosphere + room motif in the hero; activities presented as "stations" along the trail rather than a grid of identical panels.
6. **Pricing/membership** — editorial "join the barn" spread: one conversation-style column explaining membership, plans as two refined panels (not three SaaS columns).
7. **Auth/account** — quiet single-panel pages on the atmosphere background; same form system.

---

## 7. Design System Recommendations

Everything below lands in `core.css` (tokens) + `components.css` (components). Pages consume; pages never redefine.

### 7.1 Typography scale
- Keep Playfair Display (display) + DM Sans (body) — they already carry the editorial/premium pairing.
- Tokenized scale: `--text-xs .76rem / sm .875rem / base 1rem / lg 1.125rem / xl 1.375rem / 2xl clamp(1.6,2.5vw,2rem) / 3xl clamp(2,4vw,3rem) / display clamp(2.6,5.5vw,4.5rem)`.
- New editorial primitives: `.eyebrow` (the one sanctioned caps style), `.standfirst` (lede paragraph), `.prose` (measure, rhythm, drop-cap option), `.pull-quote`, `.chapter-numeral`.
- Reading sizes: lesson body moves from 0.9rem-ish to 1.0625rem/1.75 — current body text is too small for an education product.

### 7.2 Spacing, radius, shadow, grid
- Spacing tokens `--space-1…12` (4px base, jumps to 96px); section rhythm uses tokens, never raw 72/80px.
- Radius: exactly three — `--radius-sm 8px / --radius 14px / --radius-lg 20px` + `999px` pills. All inline 2/4/5/6px radii migrate.
- Shadow: exactly three elevations — `--shadow-rest`, `--shadow-raised`, `--shadow-float` (soft, blue-tinted, low alpha). The 19 ad-hoc values and the harsh `.22` alpha shadow are deleted.
- Grid: 12-col fluid, `max-width` tiers 68ch (prose) / 1100 (editorial) / 1400 (app shell); intentional asymmetry (7/5, 8/4) for editorial spreads.

### 7.3 Background & atmosphere system *(to be calibrated against your inspiration image)*
- `body::before` fixed layered canvas: cream base + 2–3 large soft radial forms + one SVG terrain curve, very low contrast, never behind reading columns at >3% visual noise.
- Section transitions via shared SVG wave/terrain dividers (`.flow-divider`), replacing hard `border-top` band changes.
- **Room tinting:** `[data-room]` sets one accent custom property (e.g. Round Pen warm tan, Schooling Ring dusty blue, Quiz Corral soft sage, Learning Loft muted clay) feeding eyebrows, trail fills, and atmosphere tint — one system, four rooms, exact hues confirmed with you before rollout.
- Optional texture: 2% grain + horse line-art motifs as masked, non-repeating accents (one per hero max).

### 7.4 Components (consolidation)
- **One `.card` system** with modifiers (`--feature`, `--interactive`, `--quiet`) replaces the 12 card classes; text content de-boxed into `.prose`.
- **One button system** (primary tan / secondary outline / tertiary text) — already close; inline re-implementations deleted.
- **Sidebar**: soft-glass floating rail (`backdrop-filter`, soft-white at 85%, `--shadow-float`), journey trail list, progress trail, back/forward — per standing decision, present on every course page including games.
- **Nav**: keep structure; refine to translucent soft-white with blur, serif logo, room indicator when inside a course.
- **Breadcrumb** restyled as an editorial wayfinding line ("Round Pen · Colors & Markings · Lesson 3") inside the hero, not a full-width strip.
- Forms, quiz, flip cards, diagrams: restyled to tokens, structure unchanged (zero functional risk).

## 8. Animation Recommendations

- **One system.** `.motion-reveal` stays; `.fade-in` is removed and its pages migrated.
- Vocabulary (all tokenized): reveal = 420ms fade + 12px rise, stagger 35ms capped at 210ms (existing, good); hover = 160ms transform/shadow only; heroes get one 600ms entrance; parallax limited to background shapes, transform-only, `will-change` scoped.
- Page-level: lesson → lesson gets a 200ms content fade via View Transitions API where supported (progressive enhancement, no SPA).
- Performance rules: animate only `transform`/`opacity`; no layout-affecting animation; reduced-motion already handled globally.

## 9. Responsive Design Strategy

Breakpoints: 480 / 768 / 1024 / 1280. Designed per device class, not shrunk:

- **Mobile (<768)**: single reading column; atmosphere simplified to one form (perf); sidebar becomes a **bottom sheet** opened by a floating "Course Trail" pill (thumb-reachable, 56px); prev/next as fixed bottom bar on lesson pages; course cards full-width with horizontal-scroll featured row; hover reveals replaced by always-visible condensed meta.
- **Tablet portrait (768–1024)**: the priority device for reading. Reading column centered at comfortable measure; sidebar = right-edge **slide-over** invoked from a persistent edge tab (keeps the mandate: sidebar exists, never crowds the page); 44–48px targets everywhere; flip cards/diagram points sized for fingers; swipe left/right advances lessons (with visible affordance).
- **Tablet landscape (≥1024)**: full two-column with **condensed rail** sidebar (icons + trail) expanding on tap/hover to full width.
- **Desktop (≥1280)**: full editorial compositions, sticky full sidebar, parallax active.
- QA matrix (per your checklist): 1920, 1440, 1280 laptop, iPad portrait + landscape (and iPad Mini width 744), 390 and 360 phones — navigation, sidebar, quizzes, games, forms, modals, hover/touch parity, no overlap, no loss.

## 10. Technical Cleanup Strategy

Executed *during* each phase (replace-then-delete, never both kept):

1. **Inline CSS migration** — each page archetype's inline `<style>` collapses into the shared system; target: course pages carry ≤30 lines of truly page-specific CSS (e.g., a specific diagram), most carry none.
2. **Delete legacy alias tokens** (`--navy`, `--gold`, …) from `core.css` once the 111 referencing pages are migrated — this is the "old system removed entirely" checkpoint.
3. **Delete `.fade-in`** system from `components.css` + `layout.js`.
4. **Collapse 12 card classes → 1 system**; remove duplicate button/hero re-implementations from monolith pages.
5. **Resolve `topics.html` vs `courses/index.html`** duplication (recommend: redirect/remove `topics.html` — confirm).
6. **Fix or remove `hero-bg-*` missing-image references** (currently silent 404s on every Viewing Room/Training Barn/Quiz page).
7. **Re-encode the ~12 non-UTF-8 files**; normalize all radii/shadows/hex to tokens (grep-verifiable: zero raw hex outside tokens & true illustration colors).
8. **Internal `tools/` pages**: aligned to tokens but exempt from full editorial treatment (authoring tools, not user-facing) — flagging per "entire site."
9. Final sweep: orphaned assets, stale `RESTRUCTURE-*.md` / `REDESIGN-PLAN.md` superseded docs archived to `docs/`, console-error pass, Lighthouse perf check.

---

## 11. Implementation Phases

| Phase | Scope | Checkpoint for your review |
|---|---|---|
| **0** | Calibrate background system against your inspiration image; confirm room accent hues | Atmosphere demo page (1 file, throwaway) |
| **1** | Design system: tokens, atmosphere, typography primitives, card/button/sidebar/nav/footer overhaul in shared CSS + `layout.js`/`course-nav.js` | Every page instantly inherits chrome + atmosphere; review on live pages |
| **2** | Homepage + course discovery rebuilt editorial | The two front doors |
| **3** | Reference course end-to-end (**Common Horse Colors** — fullest page-type set): lessons, viewing room, training barn, 3 games, quiz, downloads; update `docs/TEMPLATE-GUIDE.md` | The canonical pattern — approve before rollout |
| **4** | Roll out to remaining ~10 courses + lesson-board + quiz-corral monoliths; inline-style migration per course | Spot-check per course |
| **5** | Pricing, auth, account, tools; alias-token deletion; cleanup sweep | — |
| **6** | Full QA matrix (§9) + your 16-point quality checklist | Sign-off |

Each phase is a working site — no half-migrated states left between checkpoints.

---

## 12. Open Items Before Phase 0

1. **Attach the inspiration image** (drives §7.3).
2. **Room accent hues** — I'll propose exact values with the atmosphere demo; veto/adjust there.
3. **`topics.html`** — confirm it's stale and removable.
4. **Tack-illustration hex colors** (saddle/leather diagram tones in equipment courses) — I recommend keeping them as illustration constants, tokenized as `--ill-*` so they're documented, not stray.
