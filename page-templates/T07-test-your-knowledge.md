# T07 — Test Your Knowledge Page

> **Canon errata applied (Canon Resolution Phase 0 v1.0 §6, items 9, 10 & 12; Amendment 3).** File slot is computed per Canon §3 (always last). T07's path-level spacing wording (20–30% prior-course items from the 2nd course in a path; ≥30% cumulative final course) remains canonical and is the source other documents are read against. Amendment 3 replaces the former 8–15 question range with exactly 15 delivered questions per attempt from a verified 40-question course bank. Tier references use **Loft tier** (Canon §2.2).

**File slot:** computed per Canon Resolution §3 (slug `test-your-knowledge`; always the last page) *(Canon §6 erratum, item 9)*
**Existing components:** `lesson-hero`, quiz interaction components
**Institutional model:** CHA ends every level with a written test; horse bowl trains from question banks; the testing effect makes low-stakes quizzing itself a learning event (Roediger & Karpicke; Roediger, Agarwal et al. classroom studies).

**Naming standard (canonical — do not vary):** the file slug, page `<title>`, hero heading, and every internal link to this page are **always "Test Your Knowledge"** (slug `test-your-knowledge`). **"Show Your Knowledge" is never used** — it is a retired variant. Any course found using `show-your-knowledge` (currently driving-equipment and english-equipment) is corrected to `test-your-knowledge` in file name, title, and inbound links. This is the canonical wording everywhere; it does not wander by course, tier, or author (Canon C3 naming invariant).

## Required sections (in order)

1. **Intro line** — 15 questions, what's covered, retakes allowed. One sentence each.
2. **Questions** — exactly 15 delivered questions per learner attempt, selected from a verified 40-question bank for this course. Every bank question maps to a stated course objective; nothing untaught appears.
3. **Per-question feedback** — on completion, each question shows the correct answer, a 1–2 sentence *why*, and a link back to the page section that teaches it.
4. **Results + wrap-up block** — score, a 50–100 word module summary, and a one-line bridge to the next course in the path ("Leg markings build directly on these face-marking skills…").
5. **CTAs** — Retake, Back to Training Barn, Next course.

## Question construction rules

- **Visual subjects:** use photos the learner has **not** seen on the catalog or Viewing Room pages — identification of new examples is the real skill (Kornell & Bjork; Kang).
- **Course bank:** every course has exactly 40 verified bank questions before implementation. Do not pad the bank with trivia, rare exceptions, unsupported facts, or material outside the course scope.
- **Distractors are near-misses:** for a "star" question, the wrong answers are snip, strip, blaze — never items from another category. Plausible same-family distractors force the discrimination being taught.
- **Mixed order:** never group questions by item type; interleave.
- **Spacing:** from the 2nd course in a subject path onward, 20–30% of delivered questions must come from prior-course material; final courses in a subject path are cumulative with at least 30% prior-course items.
