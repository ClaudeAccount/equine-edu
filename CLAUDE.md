# Equine EDU — Build System Guardrails

This file is the single source of truth for how every page in the Equine EDU codebase must be built, reviewed, and maintained. All rules here apply to every session. Do not deviate unless the user explicitly overrides a specific rule in that session.

---

## MANDATORY PRE-COURSE READING

**Before producing, editing, or planning any course, lesson, quiz, study guide, activity, game, worksheet, or educational resource of any kind, the following files must be read in full:**

1. `C:\Users\Corie Jean\OneDrive\Documents\Claude\Projects\EQUINE EDU — GOVERNED BUILD SYSTEM\README.md` — system overview and all 9 research guardrails
2. `C:\Users\Corie Jean\OneDrive\Documents\Claude\Projects\EQUINE EDU — GOVERNED BUILD SYSTEM\governance\Research-Governance-Master.md` — gatekeeper for all course research
3. `C:\Users\Corie Jean\OneDrive\Documents\Claude\Projects\EQUINE EDU — GOVERNED BUILD SYSTEM\governance\Course-Creation-Master.md` — course creation standards
4. `C:\Users\Corie Jean\OneDrive\Documents\Claude\Projects\EQUINE EDU — GOVERNED BUILD SYSTEM\governance\Voice-and-Content-Standards.md` — voice, tone, and content rules
5. `C:\Users\Corie Jean\OneDrive\Documents\Claude\Projects\EQUINE EDU — GOVERNED BUILD SYSTEM\governance\Reading-Level-Standard.md` — learner-facing reading level, plain-language, and vocabulary rules
6. `C:\Users\Corie Jean\OneDrive\Documents\Claude\Projects\Equine Edu\equine-edu-main\equine-edu-main\page-templates\TEMPLATE-SYSTEM-V2.md` — page template system overview
7. `C:\Users\Corie Jean\OneDrive\Documents\Claude\Projects\EQUINE EDU — GOVERNED BUILD SYSTEM\governance\Visual-Standards-Manual.md` — visual identity, image generation, and educational asset standards
8. `C:\Users\Corie Jean\OneDrive\Documents\Claude\Projects\EQUINE EDU — GOVERNED BUILD SYSTEM\architecture\EDUCATIONAL-ACCURACY-KNOWLEDGE-VALIDATION-ENGINE-v1.0.md` — EAKVE accuracy, safety, evidence, hallucination, age-level, and assessment validation gate
9. `C:\Users\Corie Jean\OneDrive\Documents\Claude\Projects\EQUINE EDU — GOVERNED BUILD SYSTEM\architecture\CURRICULUM-ARCHITECTURE-INTEGRITY-SYSTEM-v1.0.md` — CAIS curriculum architecture, Concept Registry, curriculum consistency, prerequisites, pathways, and assessment-bank governance gate
10. The relevant T-spec file(s) from `page-templates/` for the page type(s) being built:
   - `T01-course-index.md` — course landing page
   - `T02-why-it-matters.md` — first lesson / orientation
   - `T03-concept-foundation.md` — prerequisite concept page
   - `T04-core-catalog.md` — core content / catalog lesson
   - `T05-viewing-room.md` — visual identification practice
   - `T06-training-barn.md` — interactive practice activities
   - `T07-test-your-knowledge.md` — quiz / assessment
   - `T16-study-guide.md` — study guide with reveal prompts
   - `T26-study-review.md` — study & review (multi-topic courses)
   - *(other T-specs as needed for games, downloads, and specialist pages)*

These files define what information may be included in courses, how it must be sourced, how it must be classified, what standards all learner-facing content must meet, and exactly how each page type must be structured. No course work begins until this reading is complete.

For any image, diagram, hero art, viewing-room asset, quiz image, worksheet image, or generated visual media, `Visual-Standards-Manual.md` is mandatory authority. Educational accuracy, subject recognition, and brand consistency override decorative appeal.

Before any course, lesson, quiz, study guide, activity, game, worksheet, explanation, or assessment is considered publishable, apply the Educational Accuracy and Knowledge Validation Engine (EAKVE). EAKVE is the independent pre-publication gate for factual correctness, equine safety, evidence support, hallucination detection, age-level fit, objective alignment, and assessment quality. Any EAKVE `FAIL` blocks publication. Any EAKVE `REVISION_REQUIRED` must be corrected before publication.

Before learner-facing instructional content is considered publishable, apply `Reading-Level-Standard.md`. Course text, quiz feedback, study guide prompts, activity instructions, captions, and explanations must be written at approximately Grade 5-6 regardless of course tier. Advanced courses become more rigorous through deeper concepts and stronger thinking tasks, not harder language. Correct equine terminology is retained when needed and explained in plain language.

Before any course enters course creation, apply the Curriculum Architecture and Curriculum Integrity System (CAIS). CAIS is the independent curriculum structure gate for approved Concept IDs, prerequisite order, pathway placement, course dependencies, cross-library consistency, and the 40-question assessment bank / 15-question attempt model. Any CAIS `BLOCKED` or high-severity CCE finding blocks course creation or release. Any CAIS `REVISION_REQUIRED` must be corrected before course creation continues.

**The governed build system is located at:**
`C:\Users\Corie Jean\OneDrive\Documents\Claude\Projects\EQUINE EDU — GOVERNED BUILD SYSTEM\`

This folder is the system of record. The `governance/` subfolder holds all semantic authority documents. The `registries/` subfolder holds shared state. The `architecture/` subfolder holds the platform architecture specs. All are read-only truth — changes go through the ratification process defined inside them.

---

## Styling — CSS Only

**Rule: All styling must come from the shared CSS files. No one-off or per-file styling unless the user explicitly asks for it in that session.**

The three shared stylesheets are:
- `assets/css/core.css` — design tokens, typography, base layout
- `assets/css/components.css` — all reusable UI components
- `assets/css/course.css` — course page structure and nav

`assets/css/game.css` is also shared and used by Training Barn pages.

**What this means in practice:**
- Do not add `<style>` blocks to lesson or study guide HTML files
- Do not add inline `style="..."` attributes to lesson or study guide elements
- If a design need cannot be met by an existing class, the fix goes into the shared CSS file — not the individual page
- The only permitted exception is `1-index.html` (course landing pages). Existing landing pages may keep a `<style>` block for hero layout only. New or revised landing-page styling should move into shared CSS unless the user explicitly asks for page-local styling.
- If the user says "add this style to this page," do it. If they don't ask, don't add it

---

## File Structure

Every course lives in: `courses/{collection}/{category}/{course-slug}/`

Required files per course:
```
1-index.html          ← course landing page
course-config.js      ← single source of truth for module list
2-*.html              ← first lesson (Why It Matters)
3-*.html              ← core content lesson(s)
N-study-guide.html    ← always before test
N+1-test-your-knowledge.html  ← always last
```

File numbering must match the `num` field in `course-config.js`. Files not referenced in the config are orphaned — leave them, do not delete.

---

## Quiz / Test Your Knowledge Rules

- Every course quiz must present exactly **15 questions** per attempt
- Those 15 questions must be selected from a verified **40-question bank for that course**
- Every bank question must map to a stated course outcome and taught course content
- Do not pad the bank with trivia, rare edge cases, unsupported facts, or out-of-scope material
- Course 2+ quizzes must still preserve the required prior-course review mix; final courses in a subject path must preserve the cumulative review mix

---

## Quiz Naming & Progress Key (PERMANENT)

- Every quiz/assessment page is named **"Test Your Knowledge"** everywhere it appears: the page `<title>`, the hero `<h1>`, the `course-config.js` module `title`, the module `type` (`Quiz`), and the file name (`N-test-your-knowledge.html`). The legacy label "Show Your Knowledge" is retired and must not be reintroduced.
- Every quiz page must set its progress key to exactly:

  ```js
  window.EE_QUIZ_CONFIG = { questionCount: 15, progressKey: "equineEduProgress.<courseIdCamel>.testYourKnowledge" };
  ```

  where `<courseIdCamel>` is the course id in camelCase. The key suffix is always `testYourKnowledge` so it matches the filename-derived key that `course-nav.js` checks for completion. Any other suffix (e.g. `showYourKnowledge`) silently breaks the course progress bar and the Horse Bowl "completed courses" filter.
- This rule is enforced in every course build going forward. When creating or editing a quiz, verify the title, file name, and progress key all use the `test`/`testYourKnowledge` form before publishing.

## course-config.js Rules

- `window.COURSE_CONFIG.modules[]` is the only thing that drives the sidebar — edit only this file to add or reorder modules
- Module `num` values must be sequential with no gaps and no duplicates
- Study Guide entry must appear in the array **before** Test Your Knowledge
- No number words (one, two, three, etc.) in `title` or `desc` fields — use neutral language ("essential", "all", "each")
- Every lesson HTML file must set `window.CURRENT_MODULE` to the matching `num` value from the config

---

## Lesson Page Structure (Gold Standard)

Every lesson page that contains a tab system must follow this structure inside each tab panel:

1. `.tab-intro` — one paragraph orienting the learner to the tab topic
2. `.visual-card` — 2–3 paragraphs of substantive content
3. `.callout-bar` — a key takeaway or important note
4. `.barn-note` — only on the **last tab** of the lesson

**DO NOT add `<details class="quick-check">` elements to any lesson page.** Quick-checks have been removed from the gold standard. The in-page "Things to Remember" block (see below) replaces them.

After the tab system (and before or after the jump tab bar), every tabbed lesson page must include a "Things to Remember" visible block:

```html
<div class="lesson-notes">
  <h3>Things to Remember</h3>
  <ul class="notes-list">
    <li>Key point one.</li>
    <li>Key point two.</li>
    <li>Key point three.</li>
  </ul>
</div>
```

Content in this block must match (or expand on) the items in `window.PAGE_NOTES`. Minimum 3 items, maximum 6.

Lessons without a tab system still require:
- At least one `.visual-card` block
- `window.PAGE_NOTES = { items: [...] }` for the Things to Remember sidebar section
- A `<div class="lesson-notes">` block as described above

---

## Did You Know Callouts

Lesson pages (both "Why It Matters" pages and core content pages) should include a "Did You Know" callout only where a naturally interesting, surprising, or contextualizing fact fits. These are optional when no suitable fact exists, but should be added wherever they support the lesson without distracting from the core teaching.

The Did You Know box uses these obfuscated classes from `assets/css/course-standardization.css`:

```html
<div class="ee-u-36082faa">
  <p class="ee-u-273ccaec">&#128161; Did You Know</p>
  <p class="ee-u-e6b583bc">Fact text goes here. This should be a genuinely interesting contextual note — not a primary teaching point, but something that gives depth or real-world connection to the topic.</p>
</div>
```

Rules:
- Place after a `.visual-card` or `.lesson-intro-card` at a natural break in the flow
- Content must be a standalone fact or note — not a restatement of the callout-bar
- Do not place inside a tab panel's `.visual-card` — place it between cards at the page level
- Do not add more than 2 Did You Know boxes per lesson page

---

## First Lesson Page Image Strip

Every "Why It Matters" page (`2-*.html`) must include a course-relevant 5-element visual strip after the `.lesson-intro-card` and before the first `.visual-card`. If course-specific images exist, use `<img>` tags inside a named strip div (e.g. `.marking-mini-row`). If images do not yet exist, use a CSS placeholder strip:

```html
<div class="lesson-mini-strip" aria-hidden="true">
  <div class="strip-placeholder"></div>
  <div class="strip-placeholder"></div>
  <div class="strip-placeholder"></div>
  <div class="strip-placeholder"></div>
  <div class="strip-placeholder"></div>
</div>
```

The `.lesson-mini-strip` and `.strip-placeholder` classes are defined in `assets/css/components.css`. Do not add inline styles. Placeholders are visual layout placeholders only; replace them with real course-relevant educational images when approved course imagery is available.

---

## PAGE_NOTES (Things to Remember)

Every lesson page must include a `window.PAGE_NOTES` block:

```js
window.PAGE_NOTES = {
  items: [
    "Key point one.",
    "Key point two.",
    "Key point three."
  ]
};
```

Minimum 3 items. These drive the Things to Remember sidebar section. Study guides, Training Barn pages, Viewing Rooms, and test pages are exempt.

---

## Study Guide Structure

Every study guide must include:
- `.study-rule` usage instructions at the top
- `.visual-card` container with 3 `.study-section` blocks (one per topic area)
- `<details class="reveal">` items inside each section (prompt → revealed answer)
- `.ready-panel` at the bottom with a link to the test

All study guide classes (`.study-rule`, `.study-section`, `.reveal`, `.ready-panel`) are defined in `assets/css/components.css`. Do not add a `<style>` block to study guide files — the shared CSS covers them.

---

## Landing Page (1-index.html) Rules

- Must load `course-config.js` and render the module list dynamically from `window.COURSE_CONFIG.modules`
- No Learning Outcomes section (`.learn-section`, `.outcomes-grid`, `.outcome-item`)
- If a `<style>` block already exists in the `<head>`, it is permitted only for hero layout styles. New landing-page styling should use shared CSS unless the user explicitly asks otherwise.
- Must include the standard `window.LAYOUT` block pointing to the correct nav CTA

---

## Voice and Tone

- Third-person instructional voice only in lesson body text — never "you" or direct address
- Imperative voice is allowed only in activity and navigation instructions
- Learner-facing instructional content must be written at approximately Grade 5-6 regardless of course tier
- Advanced courses become more rigorous through deeper concepts and stronger thinking tasks, not harder language
- Technical equine terms may be used when accurate and necessary, but must be defined immediately in plain language
- No number words in config descriptions
- No program names in learner-facing content (no FFA, 4-H, Pony Club, USPC)
- No difficulty labels in learner-facing content (no "beginner", "intermediate", "advanced")

---

## What Not to Touch

- Do not rewrite or restructure existing pages unless the user explicitly asks
- Do not delete files — orphan them if a rename is needed (Windows filesystem)
- Do not add `<style>` blocks or inline styles to lesson files
- Do not add Learning Outcomes sections to any page
- Do not place Study Guide after Test Your Knowledge in the config array
