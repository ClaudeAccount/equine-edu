# T01 — Course Index Page

> **Canon errata applied (Canon Resolution Phase 0 v1.0 §6, items 8 & 12).** "Module list" reads **"Page list"** (Canon §1.2; component class `module-list` unchanged). Tier references use the canonical name **Loft tier** (not "Learning Loft," which names the place — Canon §2.2). File slot is computed per Canon §3 (T01 is always slot 1, slug `index`).

**File slot:** `index` (computed per Canon §3; T01 is always the first page of every course)
**Existing components:** `course-hero`, `curriculum-section`, `module-list`, `module-num`, `module-title`, `module-type`, `meta-item`, `cta-section`
**Institutional model:** Extension fact-sheet headers (Penn State) and QM Standard 1 — the course's purpose, structure, and expectations are stated before any content. Pony Club study guides open the same way: what this level covers and what the member must demonstrate.

## Required sections (in order)

1. **Hero** — course title + one-sentence promise (≤ 25 words) stating what the learner will be able to do. Tier badge (Round Pen / Schooling Ring / Loft tier) and subject tag.
2. **Meta strip** — page count, estimated total time, tier, last-updated. Use existing `meta-item` blocks.
3. **Course outcomes** — heading "What Learners Will Be Able to Do," then 3–5 measurable outcomes using the tier verb list (see `equine-edu-course-template.md` §3). No "know/understand/learn about."
4. **Page list** — every page in the course in order, using `module-list` (component class unchanged per Canon §1.2). Each entry: number, title, page type label (Lesson / Viewing Room / Training Barn / Quiz), one-line description (≤ 15 words).
5. **How this course works** — 2–3 sentences for first-time learners explaining the page types. Reuse the same standard paragraph site-wide; do not rewrite it per course.
6. **Start CTA** — single button to page 2. One CTA only.

## Content rules

- Word count: 150–300 total. No instructional content, no terminology teaching on this page.
- Outcomes here must match the objectives shown on
