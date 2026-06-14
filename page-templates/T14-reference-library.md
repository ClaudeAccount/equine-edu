# T14 — Reference Library Page (Glossary / Breed Library)

**Covers existing pages:** `round-pen/common-terms/index.html`, `round-pen/horse-and-pony-breeds/index.html`
**Institutional model:** HorseQuest's reference architecture and USPC manual glossaries — every institution maintains lookup references *separate from* lessons. References serve a different behavior (lookup) than courses (learning), so they get their own page kind instead of bloating lessons.

Two variants:
- **Glossary variant** (common terms): term entries, A–Z with search/filter.
- **Library variant** (breeds): richer entries — photo, key facts, description — browsable by filter (size, origin, use).

## Required structure

1. **Hero** — what this reference covers and how to use it (1–2 sentences).
2. **Search / filter bar** — alphabet jump for glossary; facet filters for library (e.g., breed size, discipline).
3. **Entries** — fixed anatomy per variant:
   - *Glossary entry:* term → plain-language definition (≤ 40 words) → optional "used in" link to the course that teaches it.
   - *Library entry:* name → photo (alt text = distinguishing features) → quick-facts row (height range, origin, primary uses) → 80–150 word description → "learn more" course link if one exists.
4. **Cross-links** — entries link to courses; courses may link key terms here. One-way bloat (copying course content into entries) is not allowed.

## Content rules

- Definitions are the canonical wording: when a course and the glossary define the same term, the glossary wording wins and the course copies it.
- Breed facts verified against the breed registry; heights as ranges; no invented statistics. Anything unverifiable: omit, never approximate.
- Entries are reference voice — even more concise than lesson prose. No hooks, no scenarios.

## Do not

- Teach procedures or sequences here — that's a course's job.
- Let entry formats drift; every entry in a reference is structurally identical.

## QA checklist

- [ ] Fixed entry anatomy throughout
- [ ] Definitions match course usage (glossary is canonical)
- [ ] Registry-verified facts only, ranges not point values
- [ ] Search/filter works by keyboard
