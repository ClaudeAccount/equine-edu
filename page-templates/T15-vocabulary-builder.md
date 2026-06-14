# T15 — Vocabulary Builder

**Status:** Adopted (modified from proposal) — reusable interactive component, situational as a page
**Skill level:** Remember → Understand
**Placement:** Training Barn activity slot when a course introduces ~8+ new terms; site-wide trainer in the Learning Loft
**Institutional model:** Horse bowl flashcard drilling and USPC manual glossary study. Research basis: retrieval-based flashcard practice consistently outperforms restudying for terminology, and the benefit grows with repeated rounds; structured scheduling (the system decides when a term is "done") beats learner self-dropping (successive relearning — Rawson & Dunlosky).

## Evaluation summary

- **Standalone page per course?** No — embedded terms-in-context plus the existing Key Terms recap stay primary; a dedicated page that *re-teaches* terms would duplicate content and violate the single-source rule.
- **Reusable component?** Yes — this is the adoption. A flashcard/retrieval widget whose data comes from the T14 glossary (canonical definitions) filtered to the course's term list.
- **Required course element?** Situational: required when a course introduces ~8 or more new terms (tack, anatomy); skipped for light-terminology courses.
- **Learning Loft feature?** Yes — a cross-course Vocabulary Trainer drawing from all completed courses, scheduled by successive-relearning rules (each term must be retrieved correctly in ≥ 2 separate sessions before retiring).

## Required structure (component)

1. **Instruction line** (imperative, ≤ 25 words).
2. **Card set** — per term: term → retrieval prompt first (definition hidden), reveal on interaction. Optional fields: pronunciation guide (plain respelling, e.g., "WIH-thers"), visual example for concrete terms, 1–2 related terms, "taught in" course link.
3. **Three modes,** in difficulty order: see term → recall definition; see definition/image → recall term; type-the-term (Learning Loft).
4. **Scheduling** — system tracks correct retrievals; a term retires after 2 correct recalls in separate sessions (Loft trainer) or 2 correct in-session passes (course component). No learner self-dropping.
5. **Round summary** — terms mastered, terms to revisit, replay link.

## Content rules

- Definitions pulled verbatim from the T14 glossary — never retyped per course. If a term isn't in the glossary yet, add it there first.
- Course component includes only terms taught in that course plus up to 20% review terms from the prior course in the path.
- Visuals required for visually identifiable terms (markings, parts); omitted for abstract terms rather than forced.

## Do not

- Show definition-first by default (that's restudy, the documented weaker condition).
- Create a separate "vocabulary lesson" page that re-explains terms in prose.

## QA checklist

- [ ] All definitions sourced from T14 glossary
- [ ] Retrieval-first card behavior
- [ ] Scheduling enforced by system, not learner
- [ ] Term count ≥ 8 justifies inclusion; otherwise cut
