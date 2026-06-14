# Equine EDU — Build System Guardrails

This file is the single source of truth for how every page in the Equine EDU codebase must be built, reviewed, and maintained. All rules here apply to every session. Do not deviate unless the user explicitly overrides a specific rule in that session.

---

## MANDATORY PRE-COURSE READING

**Before producing, editing, or planning any course, lesson, quiz, study guide, activity, game, worksheet, or educational resource of any kind, the following files must be read in full:**

1. `C:\Users\Corie Jean\OneDrive\Documents\Claude\Projects\EQUINE EDU — GOVERNED BUILD SYSTEM\README.md` — system overview and all 9 research guardrails
2. `C:\Users\Corie Jean\OneDrive\Documents\Claude\Projects\EQUINE EDU — GOVERNED BUILD SYSTEM\governance\Research-Governance-Master.md` — gatekeeper for all course research
3. `C:\Users\Corie Jean\OneDrive\Documents\Claude\Projects\EQUINE EDU — GOVERNED BUILD SYSTEM\governance\Course-Creation-Master.md` — course creation standards
4. `C:\Users\Corie Jean\OneDrive\Documents\Claude\Projects\EQUINE EDU — GOVERNED BUILD SYSTEM\governance\Voice-and-Content-Standards.md` — voice, tone, and content rules
5. `C:\Users\Corie Jean\OneDrive\Documents\Claude\Projects\Equine Edu\equine-edu-main\equine-edu-main\page-templates\TEMPLATE-SYSTEM-V2.md` — page template system overview
6. The relevant T-spec file(s) from `page-templates/` for the page type(s) being built:
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
- The only permitted exception is `1-index.html` (course landing pages), which may carry a `<style>` block for the hero layout — that block already exists, should not grow, and is the sole remaining exception to this rule
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
4. `<details class="quick-check">` — an inline self-check question with a revealed answer
5. `.barn-note` — only on the **last tab** of the lesson

Lessons without a tab system still require:
- At least one `.visual-card` block
- `window.PAGE_NOTES = { items: [...] }` for the Things to Remember sidebar section

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
- The `<style>` block in the `<head>` is permitted and should only contain hero layout styles
- Must include the standard `window.LAYOUT` block pointing to the correct nav CTA

---

## Voice and Tone

- Third-person instructional voice only in lesson body text — never "you" or direct address
- Imperative voice is allowed only in activity and navigation instructions
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
