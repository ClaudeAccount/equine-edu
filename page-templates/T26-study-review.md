# T26 — Study & Review Page

> **Added by Canon Resolution Phase 0 v1.0 §4 Amendment 2 (2026-06-13).** This spec documents the "Study & Review" page already in production across the multi-topic courses (horse behavior, health & disease prevention, nutrition, hoof care & farriery, gaits & movement, intro to tack). It records existing structure; it introduces no new educational rule. Read through Canon vocabulary (course / page / tier per C1–C2).

**Status:** Active (Amendment 2) — course-flow page, multi-topic archetype.
**File slot:** computed per Canon Resolution §3 (slug `study-review`); sequenced **after the Core Content pages and before the Training Barn (T06)**.
**Existing components:** `lesson-hero hero-centered`, `lesson-wrap`, vocabulary/term blocks, key-principle blocks.
**Institutional model:** consolidated end-of-content review that gathers the vocabulary and key principles taught across several content pages into one place, organized for self-assessment and Horse Bowl preparation. Content-heavy courses teach across multiple pages; a single consolidation page before practice supports retrieval and spacing [Roediger & Karpicke; Dunlosky].

**Required for:** the **multi-topic / content archetype** — courses that teach across several Core Content pages (rather than a single Core Catalog + Viewing Room). Visual/identification courses use T05 Viewing Room in this slot instead and do not carry a Study & Review page.

**Relationship to T16 Study Guide (they are distinct, and both appear in these courses):**

| | T26 Study & Review | T16 Study Guide |
|---|---|---|
| Sits | after content pages, **before** Training Barn | after Training Barn, **before** the quiz |
| Form | vocabulary + key-principles recap, organized by category | prompt → reveal retrieval |
| Job | consolidate everything taught; Horse Bowl-category framing | retrieve-then-check immediately before testing |

## Required sections (in order)

1. **Hero** — page title "**Study & Review**" + one-line purpose ("Vocabulary review, key principles, and Horse Bowl preparation for `<Course Name>`").
2. **Intro line** — one sentence stating the page reviews core vocabulary and principles from the course, organized for self-assessment and Horse Bowl preparation in the relevant category/categories.
3. **Vocabulary review** — the course's key terms with one-line definitions. **Definitions are verbatim from T14 (glossary) / T04 (catalog identifiers)** — no independent wording (canonical-wording chain, Canon §1.3; Execution Layer verbatim chain).
4. **Key principles** — the load-bearing concepts from each Core Content page, stated as concise recall points (not re-teaching prose).
5. **Horse Bowl preparation** — frames the above against the relevant Horse Bowl category(ies); feeds T17 bank entries via the same wording (a course update propagates to its bank entries in the same change — V2 §3).
6. **Continue CTA** — single button to the Training Barn (T06).

## Content rules

- **Review, not re-teach.** No new terminology, facts, or concepts may appear here that were not taught on a Core Content page (alignment; never introduce here).
- **Verbatim chain.** All term definitions and identifiers copy T14/T04 wording exactly; this page is a consumer, never a source.
- Organized for **self-assessment** — group by topic/category so a learner can check coverage before practice.
- Voice and accessibility per `equine-edu-course-template.md` §6 (third-person prose; alt text; reading-level ceiling).
- No scored elements — Study & Review is unscored consolidation; T07 remains the sole assessment.

## Do not

- Do not introduce content not taught earlier in the course.
- Do not author definitions; copy them from T14/T04 (verbatim chain).
- Do not duplicate the T16 Study Guide's prompt→reveal mechanic — that is a separate page, after the Training Barn.
- Do not place this page on visual/identification courses in place of the Viewing Room (T05).

## QA checklist

- [ ] Slug `study-review`, slotted after the last Core Content page and before the Training Barn
- [ ] Every term/definition matches T14/T04 verbatim
- [ ] No concept appears that was not taught on a content page
- [ ] Horse Bowl categories named match the T17 bank categories
- [ ] Single CTA → Training Barn
- [ ] Voice, alt-text, and reading-level passes complete
