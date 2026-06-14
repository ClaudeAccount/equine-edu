# Equine Edu — Course Page Template Guide

This is the conversion checklist used to bring **Common Horse Colors** to the
new cream / dusty-blue / leather design system with persistent sidebars.
Use it as the pattern for converting every remaining course.

Read this alongside `assets/css/README.md` (token reference + file architecture).

---

## 1. Page types in a course

Every course has the same shape. Each type gets the same treatment:

| Page | Example | Sidebar content |
|---|---|---|
| Course landing page | `1-index.html` | None — not part of `COURSE_CONFIG.modules` |
| Lesson | `2-why-colors-matter.html`, `3-color-types.html` | Module list + progress + prev/next |
| Practice / Viewing Room | `4-viewing-room.html` | Module list + progress + prev/next |
| Learning Lab / Training Barn | `5-training-barn.html` | Module list + progress + prev/next |
| Quiz | `6-test-your-knowledge.html` | Module list + progress + prev/next |
| Game / activity pages | `activities/game-*/*.html` | Module list + progress + single "Back to Training Barn" button |

---

## 2. Required `<head>` links (in this order)

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{prefix}/assets/css/core.css">
<link rel="stylesheet" href="{prefix}/assets/css/components.css">
<link rel="stylesheet" href="{prefix}/assets/css/course.css">
<!-- Game/activity pages only: -->
<link rel="stylesheet" href="{prefix}/assets/css/game.css">
```

`{prefix}` is the relative path back to the project root (count folder depth).

---

## 2b. Tabbed lesson pages — THE canonical pattern

Any lesson that organizes content into categories uses ONE tab pattern
(modeled on Face Markings `4-face-markings.html`). No page defines its own
tab CSS or JS — appearance comes from `components.css` §11b, behavior from
`layout.js` (`window.switchTab` / `window.jumpToTab`).

Rules:
- The page intro (`.lesson-intro-card`) sits ABOVE the tab system, never
  inside a card with the tabs.
- Tabs always fit on ONE line at every screen size (buttons shrink; never
  stack or wrap).
- Every panel = `.tab-intro` (short description) then `.visual-card`(s).
- A mirrored bottom bar (`.tab-bar.tab-bar--jump`) repeats the top tabs and
  scrolls back to the top bar at medium speed.
- All tabs use the standard scheme (dusty-blue active, white text). No
  per-tab color themes, no navy/gold, no one-off styling.
- Anything else (notes, downloads) goes BELOW the bottom bar.

```html
<div class="lesson-intro-card">
  <h2>Intro heading</h2>
  <p>Intro paragraph. Use the tabs below to explore each category.</p>
</div>

<div class="tab-system" id="my-tabs">
  <div class="tab-bar" role="tablist">
    <button class="tab-btn active" role="tab" aria-selected="true"  aria-controls="tab-one">One</button>
    <button class="tab-btn"        role="tab" aria-selected="false" aria-controls="tab-two">Two</button>
  </div>

  <div class="tab-panel active" id="tab-one" role="tabpanel">
    <div class="tab-intro"><p>Short description of this tab.</p></div>
    <div class="visual-card"> ...content... </div>
  </div>
  <div class="tab-panel" id="tab-two" role="tabpanel">
    <div class="tab-intro"><p>Short description.</p></div>
    <div class="visual-card"> ...content... </div>
  </div>
</div>

<div class="tab-bar tab-bar--jump" role="tablist" aria-label="Jump back to tabs">
  <button class="tab-btn active" data-jump-target="tab-one">One</button>
  <button class="tab-btn"        data-jump-target="tab-two">Two</button>
</div>

<div id="course-notes"></div>  <!-- everything else goes below -->
```

No `<script>` needed — `layout.js` wires `aria-controls` and
`data-jump-target` automatically.

---

## 3. Body structure

### Lesson / Practice / Training Barn / Quiz pages

```html
<div id="site-nav"></div>
<div id="course-breadcrumb"></div>

<section class="lesson-hero ...">...</section>

<div class="lesson-wrap">
  <main class="lesson-left">
    <!-- page content -->
  </main>
  <aside class="lesson-right">
    <div id="course-sidebar"></div>
    <div id="course-sidebar-nav"></div>
  </aside>
</div>

<div id="site-footer"></div>
```

The quiz page previously used its own `.quiz-layout` / `.quiz-main` wrapper —
this was replaced with the standard `.lesson-wrap` / `.lesson-left` /
`.lesson-right` so all pages share one layout system. Don't reintroduce a
page-specific wrapper for new quizzes; reuse `.lesson-wrap`.

### Game/activity pages

Same pattern, but the page is usually wrapped in `loft-game-page` behavior via
`game.css` (single-column game body, sidebar still present on the right).

---

## 4. Scripts (end of `<body>`)

### Lesson pages (e.g. module 1-5, in the course's own folder)

```html
<script>
  window.CURRENT_MODULE = <module number, 1-based>;
  window.LAYOUT = {
    homeUrl:    '{prefix}/index.html',
    coursesUrl: '{prefix}/courses/.../index.html',
    navCta:     { label: 'Back to <Course Name>', url: '1-index.html' },
    navExtras:  [{ label: '<Next module label>', url: '<next-file>.html' }]  // optional
  };
  // Viewing Room pages may also set window.PAGE_NOTES = { items: [...], highlight: '...' }
</script>
<script src="course-config.js"></script>
<script src="{prefix}/assets/js/layout.js"></script>
<script src="{prefix}/assets/js/course-nav.js"></script>
<script>try{localStorage.setItem('equineEduProgress.<courseIdCamel>.<moduleTitleCamel>','true')}catch(e){}</script>
```

### Game/activity pages (nested under `activities/game-N/`)

```html
<script>
  window.CURRENT_MODULE = <Training Barn's module number>;
  window.LAYOUT = {
    homeUrl:    '{deeper-prefix}/index.html',
    coursesUrl: '{deeper-prefix}/courses/.../index.html',
    navCta:     { label: 'Back to Training Barn', url: '../../<N>-training-barn.html' }
  };
</script>
<script src="../../course-config.js"></script>
<script>
  (function(){
    if(!window.COURSE_CONFIG) return;
    window.COURSE_CONFIG.homeUrl       = '../' + window.COURSE_CONFIG.homeUrl;
    window.COURSE_CONFIG.allCoursesUrl = '../' + window.COURSE_CONFIG.allCoursesUrl;
  })();
</script>
<script src="{deeper-prefix}/assets/js/layout.js"></script>
<script src="{deeper-prefix}/assets/js/course-nav.js"></script>
```

`course-nav.js` detects `navCta.label` matching `/back to training barn/i` on a
path containing `/games?/` or `/downloads?/` and renders a single
**"Back to Training Barn"** sidebar button instead of prev/next nav.

---

## 5. Token migration (legacy → new)

When converting an existing page's inline `<style>` block, apply these
replacements. Bulk `sed` for the 1:1 swaps, then manually review the flagged
"contextual" ones — naive renaming produces poor contrast in those spots.

### 1:1 swaps (safe to bulk-replace)

| Legacy | New |
|---|---|
| `var(--off-white)` | `var(--cream-bg)` |
| `var(--text-mid)` | `var(--body-text)` |
| `var(--text-dark)` | `var(--heading)` |
| `var(--text-light)` | `var(--muted-text)` |
| `var(--page-bg)` | `var(--cream-bg)` |
| `rgba(13,27,62,X)` / `rgba(13, 27, 62,X)` | `rgba(36,54,74,X)` |
| `rgba(201,168,76,X)` / `rgba(201, 168, 76,X)` | `rgba(127,152,178,X)` |

### Contextual (review each occurrence)

| Legacy | New | When |
|---|---|---|
| `var(--navy)` | `var(--heading)` | Plain headings/labels/text on light backgrounds |
| `var(--navy)` | `var(--blue-primary)` | Active/interactive accent needing contrast (tab actives, hover borders) |
| `var(--gold)` | `var(--leather)` | Text/small accent labels on light backgrounds |
| `var(--gold)` | `var(--tan)` | Solid button backgrounds, progress fills, score badges — pair with `var(--white)` text |
| `var(--gold)` | `var(--white)` | Text sitting on a dark photo overlay |
| `var(--navy)`/`var(--gold)` button combo | `var(--blue-primary)`/`var(--white)` | Tab "active" states |
| `var(--navy)`/`var(--gold)` button combo | `var(--tan)`/`var(--white)` | Primary CTA / "Next" / score buttons |
| Badge over a dark photo overlay (was `var(--leather)`) | `var(--tan)` | Improves visibility against dark images |

### Quiz feedback states

Use the soft semantic tokens — never bright green/red:

| Old | New |
|---|---|
| `#2d7a4f` / `#e8f7ef` / `#1a5c38` (correct) | `var(--success-bd)` / `var(--success-bg)` / `var(--success)` |
| `#c0392b` / `#fdf2f2` / `#8b1a1a` (incorrect) | `var(--error-bd)` / `var(--error-bg)` / `var(--error)` |

---

## 6. Per-page checklist

For each page in a course being converted:

1. [ ] Confirm CSS `<link>` order and relative prefixes are correct.
2. [ ] Add `#course-sidebar` / `#course-sidebar-nav` placeholders inside `.lesson-right`.
3. [ ] Set `window.CURRENT_MODULE` and `window.LAYOUT` (and `navExtras` / `PAGE_NOTES` if applicable).
4. [ ] Confirm `course-config.js` lists this page with the correct `num`, `title`, `type`, `file`, `desc`.
5. [ ] Load `course-config.js`, `layout.js`, `course-nav.js` (and the relative-path-adjustment snippet for nested game pages).
6. [ ] Run the token migration pass (sed bulk + manual contextual review) on any inline `<style>`.
7. [ ] Quiz pages: confirm feedback colors use `--success*` / `--error*` tokens, and layout uses `.lesson-wrap` / `.lesson-left` / `.lesson-right` (not a custom wrapper).
8. [ ] Game pages: confirm `navCta.label` is exactly `"Back to Training Barn"` and the path contains `games`/`activities` so the sidebar shows the single return button.
9. [ ] Visually verify: sidebar renders, progress highlights the current module, prev/next (or return button) work, and no legacy navy/gold colors remain on light backgrounds.

---

## 7. Reference implementation

`courses/round-pen/colors-markings/common-horse-colors/` is the fully-converted
reference course — copy its structure, `course-config.js` shape, and per-page
script blocks when starting a new course conversion.
