# Equine EDU — Course Game System

**Version:** v1.0
**Status:** Reusable engine + shared styles built and verified; ready to roll out to courses that lack games.
**Scope:** Interactive learning games that reinforce real equine science, tied to specific lessons, scalable across all course categories.

> **Note:** The original pilot was built on "Intro to Parts of the Horse," which has since been consolidated into the main **Equine Anatomy → Parts of the Horse** course. That surviving course already carries three games (a region-based Label, a Region Sort, and a Term Match). The engine and shared styles below are course-independent and are the foundation for adding games to the courses that currently have none.

---

## Research summary — what actually makes a learning game work

Before designing anything, the strongest, best-supported findings from learning science and from the most-used classroom game platforms (Kahoot, Quizizz, Blooket, Gimkit, Quizlet, Duolingo) were used to set the rules of this system:

- **Retrieval practice beats re-reading.** Being asked to produce an answer strengthens memory far more than reviewing it. Every game here is built around active recall, not passive viewing.
- **Streaks are the single highest-impact mechanic.** They are simple to build and produce the biggest behavior change. Recall-style games track and reward streaks.
- **Immediate feedback with a brief explanation** turns a wrong answer into a teaching moment. Every game reveals the correct answer and, where useful, a one-line reason.
- **Mode variety is what keeps engagement alive.** Kahoot loses novelty after a few weeks because the format never changes; Blooket's main advantage is rotating between many game modes. This is the direct reason the system offers **eight game types** and assigns each course **the three that best fit its content**.
- **Self-paced and forgiving.** Generous tolerances, "play again for a fresh set," and per-attempt sampling let learners repeat without frustration.
- **Gamification supports the learning, never replaces it.** Points and streaks are wrapped around accurate, lesson-aligned content — not trivia.

These principles are baked into the shared engine, so every game across the platform inherits them.

---

## The eight game types

Each course uses **three** of these — whichever three carry that course's knowledge best. All eight run on one shared engine (`assets/js/ee-games.js`) and one shared stylesheet (`assets/css/game.css`).

| # | Type (engine key) | Mechanic | Input | Best for |
|---|---|---|---|---|
| 1 | Speed Recall (`recall`) | Timed multiple choice, streaks, scoring — the Horse Bowl mechanic | Click / tap | Facts, definitions, "which is correct" |
| 2 | Term Match (`match`) | Match term → definition | Dropdown select | Vocabulary, terminology |
| 3 | Label It (`label`) | Click the named part on a course image | Click on image | Anatomy, tack parts, pulse points, markings |
| 4 | Sort It (`sort`) | Place each item in the correct category | Click bucket | Grouping: regions, feed types, English vs Western |
| 5 | Order the Steps (`order`) | Put a procedure in sequence | Click in order | Grooming, tacking up, first-aid response |
| 6 | Slider Estimate (`slider`) | Drag a slider to the correct value within a tolerance band | Range slider | Vital-sign ranges, height in hands, feed amounts, age by teeth |
| 7 | Right vs Wrong (`truefalse`) | Judge correct vs incorrect handling/care | Click | Safety, handling, welfare judgement |
| 8 | Memory Match (`memory`) | Flip cards to find matching pairs | Click | Reinforcing term–meaning links, lighter review |

**Slider note:** per request, Slider Estimate games are surfaced **inside the Training Barn page itself** (not only on the Learning Loft hub) for courses that use them, so a learner can practice an estimate right where the lesson hands off to practice.

**Front-facing cards:** every game appears as a front-facing card (image thumb, badge, title, "Play Now") on the course's Learning Loft group — the same card pattern the PDF downloads use on the Lesson Board.

---

## Where games live (mirrors the PDF downloads model)

```
Training Barn (per course)  →  links to  →  Learning Loft (per category hub)
   courses/schooling-ring/<cat>/<course>/N-training-barn.html
   courses/learning-loft/<cat>/index.html        ← front-facing game cards (one group per course)

Game files:
   courses/schooling-ring/<cat>/<course>/<games-folder>/<game>.html   ← thin page + data
   assets/js/ee-games.js                                              ← one shared engine
   assets/css/game.css                                                ← one shared stylesheet
```

Downloads (PDFs) sit on the **Lesson Board** hub; games sit on the **Learning Loft** hub. Both are reached from the same Training Barn page through the two portal cards already in place. This system slots games into the existing structure exactly the way downloads already work.

---

## STRICT OUTPUT — the three game systems

### Game 1: Horse Bowl System

- **Overview:** A fast recall game (engine type `recall`). A question appears with four answer choices; the learner answers as many as possible, building a streak. It is the competition backbone of the platform and can run as individual practice or as a barn/team event.
- **Learning goal:** Rapid, durable recall of facts, terms, and "which is correct" judgements across any course.
- **Rules:** 10–15 questions per round, drawn at random from the course's verified question bank. One question on screen at a time; one answer locks the choice and reveals the correct answer plus a short reason.
- **Scoring system:** +1 per correct answer. A live streak counter rewards consecutive correct answers (visually "heats up" at 3+). End screen shows score out of total and saves a personal best. (Optional timed mode: a per-question countdown for speed events.)
- **Difficulty scaling:** Three tiers tied to course placement — Foundations (recognition, 12–15s if timed), Core Studies (application, 8–10s), Expanding Knowledge (analysis/comparison, 6–8s). Tiers change item depth and timer, never reading level.
- **Example questions (anatomy):** "Where is a horse's height measured?" → Withers. "Which joint in the hind leg is like a human ankle?" → Hock. "Which part is the soft lower face including the nostrils and lips?" → Muzzle.
- **Implementation notes:** `EEGames.mount({ type:'recall', rounds:15, seconds:0, data:{ questions:[{p,a,o[],explain}] } })`. Bank questions should map 1:1 to stated course outcomes (reuse the Test Your Knowledge 40-question bank). Team mode = same engine, scores aggregated per barn at the event layer.

### Game 2: Virtual Horse System

> Design specified here; built after the mini-game pilot is approved. It is a separate persistent simulation, not one of the eight drop-in mini-games.

- **Overview:** A scenario-based simulation where the learner cares for a virtual horse over a series of "days." Each day presents care decisions whose outcomes are governed by what the courses teach. It is the platform's long-arc, mastery layer — knowledge from many lessons applied over time.
- **Core mechanics:** Daily decision cycle → stat changes → consequences → unlocks. Decisions are drawn from real lesson content, so doing well requires having learned it.
- **Stats system (0–100 each):**
  - *Health Score* — driven by feeding correctness, exercise balance, and timely health responses.
  - *Trust Score* — driven by gentle, correct handling and consistency (Right vs Wrong logic).
  - *Care Score* — driven by grooming, stall management, and routine.
  - *Training Progress* — driven by appropriate, well-paced exercise and groundwork.
- **Daily gameplay loop:** Morning check (read the horse's state) → choose feeding → choose grooming/stall care → choose exercise → respond to any event (e.g., a minor wound, a hot day) → end-of-day summary showing stat movement and why.
- **Decision tree example (feeding):**
  - Horse is in light work, good weight → *Offer mostly forage (hay), small hard feed* → Health +3, Care +1.
  - → *Offer a large grain meal, little hay* → Health −4, with note: forage should be the base of the diet (ties to Nutrition course).
  - → *Skip feeding to save for later* → Health −6, Trust −2.
- **Stat-change logic:** Each option carries a vector of stat deltas plus an explanation string. Deltas are clamped 0–100. Sustained good choices raise stats slowly; a single unsafe choice can drop one sharply, mirroring real consequence asymmetry. Stats below thresholds trigger warning events.
- **Consequences (good and bad):** Good — unlocks, calmer horse, faster Training Progress. Bad — illness event, reduced Trust (harder future handling), a vet visit that pauses progress. All consequences reference the lesson that explains them.
- **Unlockables:** tack (halter → bridle → saddle), feed types (hay → balanced ration → supplements), breeds (as new breed courses ship), stable upgrades (stall → paddock → barn). Unlocks are gated by sustained stat levels, not by spending alone.
- **Example scenario tied to a lesson:** *Course:* Health & First Aid → *Lesson:* Vital Signs → *Event:* "The horse seems dull and its flanks are heaving. Its breathing rate reads 40 breaths/min." → Options: rest and recheck / call the vet / continue exercise. Correct response references the normal respiration range taught in the lesson; "continue exercise" drops Health and Trust.

### Game 3: Training & Skills Mini-Games

- **Overview:** Short, lesson-specific exercises — the everyday practice layer. Each is one of the eight types, chosen to fit the lesson, and reachable as a front-facing card from the Learning Loft.
- **Game types list:** Speed Recall, Term Match, Label It, Sort It, Order the Steps, Slider Estimate, Right vs Wrong, Memory Match (defined above).
- **Input methods:** click/tap (recall, sort, right-vs-wrong, label, memory, order), dropdown select (match), range slider (slider). All work on touch and mouse.
- **Feedback system:** Every answer is checked immediately. Correct → confirmation (+ streak where applicable). Incorrect → the correct answer is revealed (Label It marks the true spot on the image; Order names the next correct step) with a short plain-language reason. End screen gives a score, an encouraging rating, Play Again, and Back to Training Barn.
- **Example mini-game designs (one per category):**
  - *Equine Anatomy → Parts of the Horse → "Label the Horse" (Label It):* click each named part on the region diagrams. **Pilot pattern.**
  - *Health & First Aid → Vital Signs → "In the Normal Range?" (Slider Estimate):* drag to the normal heart rate, then respiration, then temperature; tolerance band counts "close enough." (Slider game → also placed on the Training Barn page.)
  - *Colors & Markings → Face Markings → "Name That Marking" (Label It / Speed Recall):* identify the marking from the course image.
  - *Horse Care → Grooming → "Grooming in Order" (Order the Steps):* sequence the grooming routine.
  - *Riding Foundations → Gaits → "Sort the Gaits" (Sort It):* sort movements into walk / trot / canter / gallop.
  - *Tack & Equipment → English vs Western → "Right Tack, Right Saddle" (Sort It / Right vs Wrong):* sort equipment to its discipline.
- **Course mapping example:** *Course:* Equine Anatomy — Parts of the Horse · *Lesson:* Parts of the Horse · *Games:* Label the Horse, Term Match, Memory Match · *Knowledge reinforced:* locating and naming the major external parts from poll to hoof.

---

## Platform Game Architecture Summary

- **How all games connect:** One engine (`ee-games.js`) renders all eight mini-game types into one shared visual shell (`game.css`). The Horse Bowl is the `recall` type running as practice or as a scored event. The Virtual Horse is a separate persistent layer that *consumes* the same course content (its decisions and events are authored from the same lesson facts the mini-games test). A learner therefore meets the same knowledge three ways: quick practice (mini-games), speed/competition (Horse Bowl), and applied over time (Virtual Horse).
- **Shared scoring/progression system:** Every game writes to the existing `localStorage` progress namespace, e.g. `equineEduProgress.<courseIdCamel>.trainingBarn` to mark practice done, and `<key>.best` to store a personal best percentage. This is the same mechanism the course navigation and Horse Bowl "completed courses" filter already read, so games light up existing progress UI with no new plumbing. Accounts sync this state via the existing Supabase client already loaded on every game page.
- **How data is stored (high level):** Game *content* lives next to the course as plain data inside each thin game page (questions, pairs, coordinates, slider targets) — versioned with the course, easy to audit against the lesson. Game *progress* lives in the per-user progress store (local + account sync). No game logic is duplicated per page; only data differs.
- **How courses feed games dynamically:** Adding a game to a new course is: (1) create a thin HTML page that loads `ee-games.js`, (2) define a data object sampled from that course's content, (3) add a front-facing card to the category's Learning Loft group. No new JavaScript or CSS. The eight types are fixed building blocks; courses supply the content. This is what makes the system scale to new courses continuously.

---

## Delivered foundation

- **Engine:** `assets/js/ee-games.js` — all eight types implemented and verified.
- **Styles:** new shared section added to `assets/css/game.css` (label hotspots, slider, memory flip, order list, streak chip). No per-page styles.
- **First course fully on the engine — Equine Anatomy → Parts of the Horse.** Its three games were converted from standalone scripts to the shared engine, in place (same file paths, so Learning Loft cards and thumbnails are unchanged):
  - `activities/game-1/label-horse.html` — **Label It** (`label`), all five region diagrams (head, neck & shoulder, body, front legs, back legs) fed in as views using the course's own anchor coordinates.
  - `activities/game-2/region-sort.html` — **Sort It** (`sort`), 45 parts into Head / Neck & Shoulder / Body / Legs.
  - `activities/game-3/term-match.html` — **Term Match** (`match`), descriptions from the course term bank.
- **Next step:** roll the engine out to courses that currently have no games, assigning each its best-fit three types.

---

## Version Block

- **Version:** v1.0 — engine + pilot course.
- **Notes for future updates:**
  - Scale type-by-type across the remaining 32 courses; assign each course its best-fit three.
  - Build the Slider Estimate games next (Vital Signs is the natural first) and embed them in the Training Barn page per the slider rule.
  - Build the Virtual Horse layer after mini-games are broadly in place; author its events from existing lesson facts.
  - All learner-facing game text stays at roughly Grade 5–6; all banks map to stated course outcomes and pass the existing accuracy/curriculum gates before release.
