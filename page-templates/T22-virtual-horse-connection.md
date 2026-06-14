# T22 — Virtual Horse Connection

**Status:** Adopted in principle — **Future Phase**, gated on Virtual Horse gameplay existing. Until then: no learner-visible pages (no placeholders, per project guardrails). What ships now is invisible: concept tagging.
**Placement:** When live — a connection block on the T07 wrap-up and a hub in the Virtual Horse area; not a separate page inside the course flow.
**Institutional model & evidence:** Simulation-based learning shows real but conditional gains — retention ~9% higher (d ≈ 0.22) and procedural knowledge ~14% higher for simulation games *versus* comparison instruction, but **only when the simulation supplements other instruction; simulation alone underperformed** (Sitzmann 2011; Wouters et al. 2013 meta-analyses). That condition is exactly this template: courses teach, the Virtual Horse applies. The design must keep that order — gameplay rewards applying taught knowledge; it never becomes the sole teacher of testable content.

**Visible now or later (the research question):** later. A "coming soon" connection page is placeholder content with zero current learning value. Now-phase work is data architecture only.

## Phase 1 (now): concept tagging — invisible infrastructure

- Every course tags the concepts it teaches in a shared taxonomy (e.g., `colors.base.bay`, `health.vitals.heart-rate`, `tack.western.cinch`).
- T17 bank questions and T19 image pools already use these tags; Virtual Horse systems will consume the same taxonomy.
- Cost: a metadata field per page. No UI.

## Phase 2 (at gameplay launch): connection block + hub

**Connection block** (appended to T07 wrap-up, ~80–120 words + one CTA):

1. **What was learned → where it plays** — 1–2 sentences mapping the course's tagged concepts to a named gameplay system ("Vital signs knowledge unlocks the health-check action in the stable").
2. **Stakes in play** — one sentence on what good and poor decisions do in the simulation ("A missed temperature spike becomes a vet call and a recovery period").
3. **CTA** — one button into the relevant Virtual Horse activity.

**Virtual Horse hub** (T13 collection-hub variant): gameplay systems as cards, each listing the courses that prepare for it — the reverse mapping, so players who struggle in-game are routed back to the right lesson.

## Content rules

- Consequence framing is realistic but never punitive-graphic; welfare outcomes follow AAEP-aligned course content (a colicking virtual horse gets a vet, recovers or is treated — the lesson is early recognition, not loss).
- In-game knowledge checks reuse course wording verbatim.
- The simulation may *exercise* anything, but every fact a player is held accountable for must exist in a course first (instruction-before-simulation, per the meta-analytic condition).

## Do not

- Ship any learner-facing "Virtual Horse" page before gameplay exists.
- Teach new testable facts only inside the game.
- Tie course quiz outcomes (T07) to game rewards in ways that pressure retakes into grinding.

## QA checklist (Phase 2)

- [ ] Block ≤ 120 words, one CTA
- [ ] Concept tags resolve to real gameplay systems
- [ ] Welfare consequences AAEP-aligned, recoverable
- [ ] Reverse mapping (game → course) present in hub
