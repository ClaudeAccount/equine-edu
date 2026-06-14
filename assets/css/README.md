# Equine Edu — CSS Architecture

Three shared partials power every page. No course has its own stylesheet anymore.
To change how something looks across the platform, edit it once here.

## Files (load order matters)

| File | Loaded on | Purpose |
|---|---|---|
| `core.css` | every page | Design tokens (`:root`), reset, base typography, site nav / breadcrumb / footer, motion utilities, reduced-motion handling |
| `components.css` | every page | Reusable UI: buttons (pill), hero blocks, the unified card system (solid / quiet / glass), modules, journey sidebar, flip cards, quiz |
| `course.css` | every page | Page layout wrappers (`.lesson-wrap`), landing/track/CTA sections (translucent washes), responsive breakpoints |

Every page links all three in this order:

```html
<link rel="stylesheet" href="{relative-prefix}/assets/css/core.css">
<link rel="stylesheet" href="{relative-prefix}/assets/css/components.css">
<link rel="stylesheet" href="{relative-prefix}/assets/css/course.css">
```

The `{relative-prefix}` depth depends on where the page lives, e.g.:
- Root `index.html` → `assets/css/...`
- `courses/all-courses/index.html` → `../../assets/css/...`
- `courses/all-courses/colors-markings/base-coat-colors/bay-horses.html` → `../../../../assets/css/...`

## Design tokens (current palette)

The site uses a cream / dusty-blue / leather equestrian palette. Defined in `core.css` `:root`:

| Token | Value | Use |
|---|---|---|
| `--cream-bg` | `#F8F4EE` | Primary page background |
| `--cream-secondary` | `#EFE8DE` | Secondary section background |
| `--soft-white` | `#FCFAF7` | Card/surface background |
| `--blue-primary` | `#7F98B2` | Nav highlights, active states, interactive accents |
| `--blue-secondary` | `#A9BACB` | Borders/accents on blue elements |
| `--blue-light` | `#D9E3EC` | Light blue fills (callouts) |
| `--tan` | `#C8A27A` | Primary buttons, progress fills, badges |
| `--leather` | `#A9825A` | Text accents, small labels, hover states |
| `--leather-dark` | `#7A5D45` | Darker accent details |
| `--heading` | `#24364A` | Heading text |
| `--body-text` | `#4F5B66` | Body copy |
| `--muted-text` | `#7D858D` | Captions, muted labels |
| `--success` / `--success-bg` / `--success-bd` | greens-via-blue | Quiz "correct" feedback (soft, not bright green) |
| `--error` / `--error-bg` / `--error-bd` | warm browns | Quiz "incorrect" feedback (soft, not bright red) |
| `--border` / `--border-mid` | `rgba(36,54,74,...)` | Default borders |

**Legacy aliases are gone.** `--navy`, `--gold`, `--off-white`, `--text-mid`, etc.
have been removed from `core.css` and every page has been migrated to the named
tokens above. Do not reintroduce them. Additional token groups now in `core.css`:

- **Type scale**: `--text-xs` … `--text-3xl`, `--text-display`; `--measure` (68ch reading width)
- **Spacing scale**: `--space-1` (4px) … `--space-9` (96px)
- **Elevation**: three shadows — `--shadow-rest`, `--shadow-raised`, `--shadow-float` —
  plus `--shadow-nested`, the ambient halo for white cards/buttons sitting INSIDE
  a white panel (white-on-white). Never hardcode shadow values; the nested-surface
  rules in `components.css` §3 apply `--shadow-nested` automatically to `*-card`
  elements and the standard option/choice buttons inside any white container
  (`.visual-card`, `.game-shell`, `.game-card`, `.game-panel`, `.quiz-panel`,
  `.quiz-card`, `.game-play-area`). New pages get this for free — do not redefine
  `box-shadow` in page-level `<style>` blocks.
- **Room accents**: `--room-accent` / `--room-wash`, set automatically via
  `body[data-room]` (layout.js derives the room from the URL: round-pen,
  schooling-ring, quiz-corral, lesson-board). Components reference these so each
  "room of the barn" gets its own tint inside one design system.
- **Illustration constants**: `--ill-*` for tack/equipment diagram colors.

The site-wide layered **atmosphere background** lives on `body::before` in
`core.css` — soft terrain gradients tinted by `--room-wash`. The `.flow-divider`
utility provides the terrain curve between content areas. Editorial primitives
(`.eyebrow`, `.standfirst`, `.prose`, `.pull-quote`, `.chapter-numeral`) are also
in `core.css`.

Motion: one system only — `.motion-reveal`, observed by `layout.js`. The old
`.fade-in` observer has been removed; elements still carrying `.fade-in` are
picked up by the unified observer.

## Where to change things

**Brand color, font, or motion speed:** `core.css` → `:root` tokens. One edit, every page updates.

**A button, card, or quiz looks wrong:** `components.css`. Find the section heading (1-19) and edit there.

**Page wrapper / column / responsive breakpoint:** `course.css`.

**A genuinely one-of-a-kind page layout:** keep a small `<style>` block on that page only. The `full-horse-review.html` page is the example pattern.

## Course pages: sidebar + progress pattern

Every lesson, practice, training barn, quiz, and game/activity page has a
persistent right-hand sidebar (`#course-sidebar` + `#course-sidebar-nav` inside
`.lesson-right`) showing the module list, progress, and prev/next navigation
(or a single "Back to Training Barn" button on game pages). This is built by
`assets/js/course-nav.js` from each course's `course-config.js` and the page's
`window.CURRENT_MODULE` / `window.LAYOUT` settings.

**See `assets/css/TEMPLATE-GUIDE.md` for the full conversion checklist** —
required `<head>` links, body structure, script blocks, and the token
migration table. `courses/round-pen/colors-markings/common-horse-colors/` is
the reference implementation; copy its pattern when converting other courses.

## Naming conventions

- kebab-case for classes (`.lesson-intro-card`)
- `--token-name` for CSS custom properties in `:root`
- `.is-*` for state classes (e.g. `.motion-reveal.is-visible`)
- Modifier classes are space-separated (`class="lesson-hero hero-centered"`)

## Adding a new course

A new course page should not need any new CSS. Reuse:
- `.course-hero` + `.course-hero-inner` for the landing hero
- `.module-grid` + `.module-card` for module cards
- `.lesson-hero` + `.lesson-hero-inner` for lesson pages
- `.lesson-wrap` + `.lesson-left` + `.lesson-right` for the two-column lesson body
- `.quiz-panel` + `.answer-btn` for assessments

If you find yourself wanting a new variant, prefer adding a modifier class
to `components.css` rather than copying an existing block.

## Hero Header Rules

- Standard lesson heroes are centered text only.
- Course index/landing heroes may use a right-side image with `.course-hero.has-hero-art` and `.course-hero-art`.
- Do not add side image slots to lesson headers. Legacy lesson classes such as `.local-hero-with-art` and `.lesson-hero-art-slot` are guarded in `components.css` so older lesson markup cannot recreate the old split header layout.
- All heroes are light, layered, room-tinted washes over the atmosphere (no dark photo overlays — the referenced hero images never existed in the repo). Page-type washes: `.hero-bg-viewing-room` (dusty blue), `.hero-bg-training-barn` (warm tan), `.hero-bg-quiz` (soft sage), `.hero-bg-lesson` (room accent). One treatment per page type, identical across every course.
