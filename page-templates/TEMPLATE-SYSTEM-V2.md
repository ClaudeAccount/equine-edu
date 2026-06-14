# Equine EDU Template System — Version 2

**Status:** Authoritative blueprint. Supersedes the V1 set list in README.md; T01–T14 specs are unchanged and remain in force.
**Decision rule applied throughout:** a proposal becomes a template only if it adds measurable educational value that no existing template can absorb. Four proposals passed, two were adopted for future phases, two were merged into existing templates. Numbering is frozen — merged/retired numbers are documented, never reused.
**Build requirement:** all course and game builds derived from this template set must pass Governance Execution Layer v1.0 validation (`GOVERNANCE-EXECUTION-LAYER-v1.md`, Equine EDU Template Governance System) before deployment. Read this file through Canon Resolution Phase 0 v1.0 vocabulary.

---

## 1. Evaluation results (T15–T22)

| # | Proposal | Ruling | Required? | Placement |
|---|----------|--------|-----------|-----------|
| T15 | Vocabulary Builder | **Adopt (modified)** — retrieval component, not a teaching page | Situational (≥ ~8 new terms); Loft trainer site-wide | Training Barn slot + Learning Loft |
| T16 | Study Guide / Review | **Adopt (modified)** — retrieval-prompt format only | Recommended; required at Learning Loft + Horse Bowl feeder courses | Between Training Barn and quiz; printable via T12 |
| T17 | Horse Bowl Study Bank | **Adopt** — one site-level bank, course-level feeders | Required (site feature) | Learning Loft |
| T18 | Real-World Application | **Merge** — no standalone page | — | Into T02 (hook), T04 ("In the Barn" closer), T11 (scenarios) |
| T19 | Identification Challenge | **Adopt** — fifth game template; practice, not assessment | Required for visual-ID courses | Training Barn ladder, after T08 |
| T20 | Instructor Guide | **Adopt — Future Phase** (spec frozen, build with Instructor Area) | Required per course once area ships | Instructor Area |
| T21 | Course Completion Packet | **Merge into T12** — auto-compiled "Course Packet" PDF section | Recommended | T12 downloads page |
| T22 | Virtual Horse Connection | **Adopt — Future Phase**; now-phase = invisible concept tagging only | Phase-gated | T07 wrap-up block + game hub, at gameplay launch |

### Justifications in brief

**T15 — Adopt (modified).** Retrieval-first flashcard practice reliably beats restudying for terminology, and gains grow across rounds; system-scheduled mastery beats learner self-management (successive relearning). But standalone vocabulary *teaching* pages would duplicate the catalog and glossary — so V2 adopts the retrieval mechanic, sources every definition from T14, and rejects the re-teaching page. Answers the proposal's question directly: reusable component + Learning Loft feature; standalone required page: no.

**T16 — Adopt (modified).** The decisive evidence is negative as well as positive: summaries and rereading are low-utility, practice testing and spacing are top-utility (Dunlosky et al.), and spaced retrieval-to-mastery improved authentic exam grades by over a letter grade (Rawson & Dunlosky; Janes et al.). Therefore the adopted study guide is 100% prompt→reveal; the proposed "Important Facts" restatement section was deliberately dropped, and "use this twice on different days" is built into the page.

**T17 — Adopt.** Question banks are the established Horse Bowl prep convention (state 4-H banks), and they operationalize retrieval + spacing + interleaving in one system. Site-level placement (not per-course pages) keeps one maintainable source; courses feed it through T16 focus sections. Difficulty scales by mapping question categories to the existing three tiers, not by inventing a new scale. Home: **Learning Loft** — the Quiz Corral is the gamified fun-quiz space (T23) and carries no study or assessment role.

**T18 — Merge.** Application focus does aid transfer, but every proposed section already has a home: scenarios are T11's entire identity, relevance is T02's, and practical use belongs at the moment of learning, not on a separate page that lengthens every course. V2 change: T04 gains a required **"In the Barn"** closing block (50–100 words: where this knowledge shows up in real care/riding) — the smallest change that captures the proposal's value. Standalone pages only ever as a Learning Loft situational exception for management-heavy topics, decided case-by-case.

**T19 — Adopt.** Study and self-testing are distinct learning events; identification of *novel* exemplars is the actual competency (Kornell & Bjork; Kang), and the Viewing Room shouldn't be both textbook and gauntlet. Classified as **practice** (Training Barn family), keeping T07 the single assessment — this answers the proposal's practice-vs-assessment question and preserves the low-stakes architecture.

**T20 — Adopt, Future Phase.** Facilitator guides are a unanimous convention across 4-H, FFA, CHA, USPC, extension, and CTE — flagged honestly as convention, not learning-science evidence; the value is adoption by leaders, parents, and instructors. Spec is frozen now so courses can be written guide-ready; nothing ships until the Instructor Area exists. Guides public (extension practice), instructor-only rationale gated.

**T21 — Merge into T12.** A packet is aggregation, not instruction — every proposed item already exists (T12 printables, T16 guide, T17 links). Usability value is real, so T12 gains a **"Course Packet"** card: one combined, auto-compiled PDF (study sheet + worksheets + answer keys + study guide printable). Auto-generation recommended so packets never drift from source pages. No new template number.

**T22 — Adopt, Future Phase.** Meta-analytic evidence supports simulation *as a supplement* to instruction (retention +9%, d ≈ 0.22) and shows simulation-alone underperforming (Sitzmann; Wouters) — which validates the course→game architecture and rules out the game as a primary teacher. Visible-now would mean placeholder pages, which project guardrails prohibit; the now-phase deliverable is the shared concept-tag taxonomy (also consumed by T17 and T19), making this adoption free of UI cost today.

---

## 2. The V2 template set

**Course flow** (5–10 pages per course, in order)

| # | Template | Required? |
|---|----------|-----------|
| T01 | Course Index | Always |
| T02 | Why It Matters / Orientation | Always |
| T03 | Concept Foundation | When the catalog/content has a prerequisite |
| T04 | Core Catalog / Content *(+ "In the Barn" closing block — from T18)* | Always (one or more pages) |
| T05 | Viewing Room | Visual-ID subjects |
| T26 | Study & Review | Multi-topic / Horse Bowl-feeder courses (after content, before Training Barn) |
| T06 | Training Barn | Always |
| T16 | Study Guide | Present in all current courses; required at Loft + Horse Bowl feeders |
| T07 | Test Your Knowledge *(+ Virtual Horse block at Phase 2 — T22)* | Always — always titled **"Test Your Knowledge"** |

*File slots computed per Canon Resolution §3 (Canon §6 erratum, item 7; Amendment 2). T04 Core Catalog/Content is present one or more times (single catalog page for visual/ID courses; several content pages for multi-topic courses). T26 Study & Review serves the multi-topic archetype. T16 sits between T06 and T07; T07 is always last and always named `test-your-knowledge` (never `show-your-knowledge`); 5–10 pages total. **Two production archetypes** — catalog/visual-ID and multi-topic/content (Canon C3 Amendment 2).*

**Interactive activities** (Training Barn ladder)

| # | Template | Bloom rung |
|---|----------|------------|
| T08 | Match & Memory | Remember |
| T19 | Identification Challenge | Remember → Apply (progressive) |
| T09 | Sort & Classify | Apply |
| T10 | Label It | Apply |
| T11 | Scenario Challenge | Analyze–Evaluate |
| T15 | Vocabulary Builder (component) | Remember (retrieval) |

Standard ladder: T08 → T19 (visual courses) → T09 or T10 → T11 (T11 optional at Round Pen). T15 joins when term count justifies it.

**Support & navigation**

| # | Template | Notes |
|---|----------|-------|
| T12 | Downloads & Worksheets | + Course Packet section (absorbed T21) |
| T13 | Hub Page | Also patterns the T17 bank home, Corral hub, and future Virtual Horse hub |
| T14 | Reference Library | Canonical definitions; feeds T15 |
| T17 | Horse Bowl Study Bank | Site-level; lives in the Learning Loft |
| T23 | Fun Quiz | Quiz Corral's page kind: personality & challenge quizzes for engagement and organic traffic; no assessment role |
| T24 | Quick Reference Card | Topic-specific job aid, print + digital; distributed via T12/T14/Loft (V2.1) |
| T25 | Skill Check | Hands-on criteria checklist, formative only; optional course closer (V2.1) |

**Future Phase (specs frozen, build gated)**

| # | Template | Gate |
|---|----------|------|
| T20 | Instructor Guide | Instructor Area launch |
| T22 | Virtual Horse Connection | Virtual Horse gameplay launch (concept tagging starts now) |

**Retired numbers:** T18 (merged into T02/T04/T11), T21 (merged into T12). Never reuse.

---

## 3. Template relationships (single-source-of-truth map)

- **T14 Glossary** → canonical definitions → consumed by T15 cards, T04 key terms, T16 vocabulary section.
- **T04 Catalog** → canonical item names + one-line identifiers → consumed by T05 captions, T07 answers, T08–T11/T19 feedback, T16 reveals, T17 answers, T12 study sheets.
- **Novel-image pool** (tagged by item + difficulty) → shared by T19 stages, T07 quiz images, T17 ID questions, T16 spot-checks, and T23 Format-B challenge quizzes. Viewing Room images are a separate pool; the two never mix.
- **Concept-tag taxonomy** (from T22 Phase 1) → tags every course's concepts → consumed by T17 organization, T19 pools, future Virtual Horse systems, future instructor analytics.
- **T16 Horse Bowl focus** → feeds → T17 bank entries. A course update propagates to its bank entries in the same change.
- **T12 Course Packet** → auto-compiled from T12 printables + T16 printable. Generated, never hand-maintained.

## 4. Integration plans

**Learning Loft.** The Loft is where cross-course tools live: the site-wide T15 Vocabulary Trainer (successive-relearning scheduling across all completed courses), Loft-tier T16 guides (required), Stage-3 T19 edge-case rounds, and T17 Challenge-category questions. The Loft is also where two-defensible-answers T11 scenarios belong.

**Horse Bowl.** Pipeline: course content (T04/T14) → T16 focus section → T17 bank → mixed/buzzer rounds. Competitors get one front door (the Learning Loft) and always land back on the lesson that teaches a missed question.

**Quiz Corral.** The gamified layer: T23 fun quizzes (personality matches and challenge quizzes) serving existing learners and organic search traffic. One-way relationship with the curriculum: fun quizzes *draw from* course content and image pools and *convert into* course enrollments via result-page CTAs, but no study, assessment, or Horse Bowl content is branded into the Corral, and no fun quizzes appear inside course flows. Format-B challenge quizzes ("How many colors can you identify?") are retrieval practice in disguise — instructionally honest because they reuse the shared image pools and catalog wording.

**Virtual Horse.** Now: tag concepts (invisible). At launch: T22 blocks on T07 wrap-ups + a game hub (T13 variant) with reverse game→course routing. Standing rule: instruction before simulation; the game never solely teaches testable content.

**Instructor Area.** Courses are written guide-ready from now on (outcomes verbatim, Common Mistakes maintained in T16) so T20 guides can be produced mechanically at launch. Guides public; gated content limited to instructor-only rationale/analytics.

## 5. Rollout order

1. **Now, zero-build:** add "In the Barn" blocks to existing T04 pages; start the concept-tag taxonomy; add Course Packet cards to T12 pages (manual compile until automated).
2. **Next content cycle:** T16 study guides for Schooling Ring courses; T15 component for high-term courses (tack, anatomy).
3. **Learning Loft buildout:** T17 bank seeded from existing course quizzes + new T16 focus sections. In parallel, Quiz Corral seeded with 3–5 T23 fun quizzes (the existing color-compare page converts to Format B).
4. **Training Barn upgrade:** T19 challenges for all visual-ID courses (needs novel-image pool buildout — the largest asset lift in V2).
5. **Phase-gated:** T20 with Instructor Area; T22 Phase 2 with gameplay.

## 6. New sources cited in V2 (extends `../equine-edu-course-template.md` §7)

- Rawson, K. A., & Dunlosky, J. (2013). The power of successive relearning. *Educational Psychology Review.* https://link.springer.com/article/10.1007/s10648-013-9240-4
- Janes, J. L., Dunlosky, J., Rawson, K. A., & Jasnow, A. (2020). Successive relearning improves performance on a high-stakes exam. *Applied Cognitive Psychology.* https://onlinelibrary.wiley.com/doi/abs/10.1002/acp.3699
- Sitzmann, T. (2011). A meta-analytic examination of the instructional effectiveness of computer-based simulation games. *Personnel Psychology, 64*(2), 489–528. https://onlinelibrary.wiley.com/doi/10.1111/j.1744-6570.2011.01190.x
- Wouters, P., van Nimwegen, C., van Oostendorp, H., & van der Spek, E. D. (2013). A meta-analysis of the cognitive and motivational effects of serious games. *Journal of Educational Psychology, 105*(2), 249–265.
- Wouters, P., & van Oostendorp, H. (2013). A meta-analytic review of the role of instructional support in game-based learning. *Computers & Education, 60*(1), 412–425. https://www.sciencedirect.com/science/article/abs/pii/S0360131512001984
- Digital flashcard retrieval-practice studies: https://pmc.ncbi.nlm.nih.gov/articles/PMC9239377/ and https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12649105/
- Successive relearning practitioner summary: https://www.retrievalpractice.org/strategies/2018/successive-relearning

**Convention vs. evidence flags for V2:** evidence-backed — retrieval-first vocabulary practice, prompt-format study guides, spaced/interleaved banks, novel-exemplar ID practice, instruction-supplemented simulation. Convention — instructor guides (unanimous industry practice, adoption value), packet aggregation (usability), bank category names, the ≥ 8-term threshold for T15 (a working default, not a studied number).

---

# V2.1 Addendum — T24 & T25 Evaluation

## 7. Evaluation results

| # | Proposal | Ruling | Required? | Placement |
|---|----------|--------|-----------|-----------|
| T24 | Quick Reference Card | **Adopt (modified)** — topic-specific job aid, print + digital from one source | Recommended; required for safety-critical topics | Distributed via T12 + T14 + Learning Loft card set |
| T25 | Skill Check | **Adopt (modified)** — criteria-referenced barn checklist, formative only; recognition examples removed to T19/T11 | Situational: hands-on topic courses only | Optional final course element after T07; printable in T12 |

### T24 — justification

Adopted as **performance support, not a retention tool** — the honest answer to the proposal's first research question is *no*, reference material does not build long-term retention; it offloads memory so a task is performed correctly at the point of need (job-aid/performance-support practice, Rossett & Schafer; cognitive-load rationale). That function is real, unduplicated, and exactly what extension programs and AAEP already publish for barn use. Topic-specific (one canonical card per topic, reused by every course that touches it), print-first with an identical digital version, and a quiet second role as a shareable organic-traffic asset alongside T23.

### T25 — justification

Practical demonstration is the mastery gate in every program reviewed (USPC, CHA, 4-H, CTE) — and the one thing an online platform cannot verify. The adopted form is the defensible middle: a **criteria-referenced self-assessment checklist** for barn use. The modification is evidence-driven: unguided self-assessment is unreliable (weakest learners overrate themselves most), while checklist/rubric-referenced self-assessment improves both accuracy and performance — so every item is an observable behavior on a three-level scale, never a feeling. Formative only; no scores, badges, or competency claims. The proposal's "Horse Identification" example was excluded as a duplicate of T19. Future hooks (instructor verification via T20, achievement tags via the T22 taxonomy, Virtual Horse skill mapping) are designed in but not built.

## 8. Comparative analysis

**T24 vs. its neighbors** — four artifacts, four different jobs:

| Artifact | Job | Used | Form |
|---|---|---|---|
| T12 worksheet | Practice (do once, builds skill) | During learning | Blanks, activities, answer key |
| T16 study guide | Retrieval prep (builds memory) | Before quiz, twice, spaced | Prompt → reveal |
| T14 reference library | Comprehensive lookup | Whenever curious | Searchable digital entries |
| **T24 card** | **Performance support (replaces memory at point of need)** | **During the real task, indefinitely** | **One printed side, no prose** |

The card is the only artifact designed to be used *instead of* remembering — in the barn, mid-task. That function exists nowhere else in the system, which is why T24 is a template and not a T12 row: it has its own design discipline (one side, no prose, verified thresholds, version-dated) that worksheet rules don't enforce.

**T25 vs. its neighbors** — what each assesses:

| Tool | Assesses | Where it happens |
|---|---|---|
| T07 quiz | Recall and understanding of taught content | On screen |
| T17 Horse Bowl | Precise rapid recall under competition format | On screen |
| T19 ID Challenge | Visual recognition of novel examples | On screen |
| T11 Scenario | Judgment in described situations | On screen |
| **T25 Skill Check** | **Physical procedure with a real horse/equipment** | **At the barn** |

Everything above the line is cognitive and screen-assessable; T25 covers the psychomotor domain the system otherwise omits entirely. Genuinely new value — provided its scope stays physical. Any proposed Skill Check item answerable on a screen belongs to an existing template, and the spec enforces that boundary.

## 9. V2.1 integration

- **Courses:** T24 cards linked from relevant T04/T07 pages via T12; T25 as the optional "Take It to the Barn" close for procedure courses.
- **Learning Loft:** a collected card set (T24) joins the Vocabulary Trainer and T17 bank; Loft-tier T25 checklists may chain into multi-skill sequences (mirroring USPC level breadth).
- **Horse Bowl:** T24 values cards double as fact-verification artifacts for bank answers (same verified source, same wording).
- **Instructor Area (future):** T20 session plans reference T24 cards as handouts and T25 printables as meeting activities; observer line upgrades to instructor verification.
- **Virtual Horse (future):** T25 criteria tags map to gameplay actions; T24 content can surface as the in-game reference UI — same single source.
- **Achievement systems (future):** only verified T25 checks (instructor/observer-confirmed) may feed achievements; self-report ne