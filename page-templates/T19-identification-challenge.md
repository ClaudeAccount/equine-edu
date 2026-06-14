# T19 — Identification Challenge

**Status:** Adopted — fifth member of the game family (T08–T11), not a new course-flow page
**Skill level:** Remember → Apply, with progressive difficulty inside one activity
**Placement:** Training Barn ladder for every visual-identification course, slotted between Match (T08) and Scenario (T11). **Practice, not assessment** — unscored, unlimited attempts; T07 remains the only assessment.
**Institutional model:** 4-H/FFA judging and hippology ID stations — rapid-fire identification of many real specimens — and Horse Bowl ID rounds. Research basis: study and testing are different events; the Viewing Room builds the schema, and separate retrieval attempts on *novel* examples strengthen and verify it (testing effect — Roediger & Karpicke; novel-exemplar transfer — Kornell & Bjork; Kang). The separation from T05 is educationally real, which is why this was adopted rather than merged into the Viewing Room.

## Required structure

1. **Instruction line** (imperative, ≤ 25 words) — unscored, repeatable, images get harder as the learner streaks.
2. **Image pool** — minimum 4 novel images per catalog item (not used in T04 or T05). Shared pool with T17 ID questions and T16 spot-checks; tagged by item and difficulty.
3. **Progressive rounds** — three stages in one session:
   - *Stage 1 — Clear cases:* textbook-quality examples, multiple-choice from near-miss options.
   - *Stage 2 — Field conditions:* varied angles, lighting, coat states; same format.
   - *Stage 3 — Edge cases* (Schooling Ring+): boundary examples (sock vs. stocking heights, dark bay vs. brown) and recall-format answers (type or pick from full list, no shortlist).
4. **Feedback per image** — correct: item name + the catalog one-line identifier. Incorrect: correct answer, identifier, and the distinguishing feature highlighted on the image.
5. **Interleaving** — items always mixed; never two consecutive images of the same item.
6. **Session summary** — accuracy by item, "items to revisit" linking back to T05 contrast pairs, replay with reshuffle.

## Content rules

- 10–20 images per session, drawn randomly from the pool so replays differ.
- Distractor options are near-misses only (same family).
- Round Pen courses may cap at Stage 2.
- Alt text per image still names the distinguishing feature (it serves the feedback state; the challenge image itself loads without revealing alt text in the prompt UI — verify with the dev team how alt text is exposed during play).

## Do not

- Reuse T04/T05 images in the challenge.
- Score, rank, or gate progress on results.
- Group images by item (the blocked condition is the documented weaker one).

## QA checklist

- [ ] ≥ 4 novel images per item in the pool
- [ ] Three stages, near-miss distractors, full interleaving
- [ ] Miss feedback shows feature on the image
- [ ] Pool shared with T17/T16, tagged by difficulty
