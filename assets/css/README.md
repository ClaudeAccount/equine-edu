# Equine Edu — CSS Architecture

Three shared partials power every page. No course has its own stylesheet anymore.
To change how something looks across the platform, edit it once here.

## Files (load order matters)

| File | Loaded on | Purpose |
|---|---|---|
| `core.css` | every page | Design tokens (`:root`), reset, base typography, site nav / breadcrumb / footer, motion utilities, reduced-motion handling |
| `components.css` | every page | Reusable UI: buttons, hero blocks, cards, modules, sidebars, diagrams, flip cards, chips, quiz / mini-quiz, video embed |
| `course.css` | every page | Page layout wrappers (`.course-wrap`, `.lesson-wrap`, `.quiz-wrap`), curriculum / CTA sections, responsive breakpoints |

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

## Where to change things

**Brand color, font, or motion speed:** `core.css` → `:root` tokens. One edit, every page updates.

**A button, card, or quiz looks wrong:** `components.css`. Find the section heading (1-19) and edit there.

**Page wrapper / column / responsive breakpoint:** `course.css`.

**A genuinely one-of-a-kind page layout:** keep a small `<style>` block on that page only. The `full-horse-review.html` page is the example pattern.

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
- `.quiz-wrap` + `.quiz-panel` + `.answer-btn` for assessments

If you find yourself wanting a new variant, prefer adding a modifier class
to `components.css` rather than copying an existing block.

## Hero Header Rules

- Standard lesson heroes are centered text only.
- Course index/landing heroes may use a right-side image with `.course-hero.has-hero-art` and `.course-hero-art`.
- Do not add side image slots to lesson headers. Legacy lesson classes such as `.local-hero-with-art` and `.lesson-hero-art-slot` are guarded in `components.css` so older lesson markup cannot recreate the old split header layout.
- Plain navy lesson heroes use the darker header background and subtle ring detail.
- Image-background heroes are reserved for `all courses`, `viewing room`, `training barn`, and `quiz` experiences.
