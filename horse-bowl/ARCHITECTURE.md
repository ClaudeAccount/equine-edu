# Horse Bowl Practice System — Architecture

The Horse Bowl Arena is a practice engine for Equine Edu. It reads from one
central question bank shared by every course, generates custom rounds, scores
them, and teaches through full per-question explanations. It is built to the
same vanilla-HTML + Supabase stack the rest of the site already uses.

## 1. Single source of truth

Every question in the platform lives in one place — the `questions` table in
Supabase (mirrored to `assets/data/question-bank.json` for offline/static use).
Courses do **not** store questions; they hold a list of question IDs in
`course_questions`. The Horse Bowl stores nothing of its own — it queries the
same master bank at runtime and filters it. Editing one question row updates the
course quiz, the Horse Bowl, and analytics everywhere on the next read. A trigger
bumps `version` and `last_updated` on each edit so any cache can detect staleness.

The existing per-course quizzes embed their questions inline in each
`test-your-knowledge.html`. Those inline banks were the duplication this system
removes. `tools/build-question-bank.js` migrated all of them: it reads the quiz
referenced by each `course-config.js`, extracts the bank, assigns a stable ID,
category, course ID, difficulty, and explanation fields, de-duplicates across
courses, and writes the master JSON plus a SQL seed. The run produced **1,314
unique questions across 33 courses**.

## 2. Data schema (Supabase / PostgreSQL)

`db/horse-bowl-schema.sql` defines four tables.

`questions` is the master bank: `id` (text, e.g. `q_000123`), `question`,
`options` (jsonb array), `correct_answer`, `category`, `course_id`, `difficulty`
(easy/medium/hard), `explanation_correct`, `explanation_incorrect`, `version`,
`last_updated`. Indexed on category, difficulty, and course_id.

`courses` holds IDs and metadata only (`id`, `title`, `category`, `collection`).

`course_questions` is the join table (`course_id`, `question_id`, `position`) —
this is how a course "owns" questions without copying them.

`session_results` is optional analytics: the selected filters, counts, score,
percentage, per-category breakdown, the served question IDs, and the user's
responses, scoped to `auth.users`.

Row Level Security makes questions, courses, and the join table world-readable
(writes go through the service role / admin tools) while `session_results` is
private to each user. A `horse_bowl_questions(...)` RPC does balanced randomized
selection in the database for when the bank grows large.

Each question follows the structure given in the build spec:

```json
{
  "id": "q_000123",
  "question": "What is the purpose of the withers?",
  "options": ["Neck flexibility", "Saddle placement reference point", "Hind limb propulsion", "Hoof shock absorption"],
  "correctAnswer": "Saddle placement reference point",
  "category": "anatomy",
  "courseId": "parts-of-the-horse",
  "difficulty": "easy",
  "explanationCorrect": "...",
  "explanationIncorrect": "...",
  "version": 1,
  "lastUpdated": "timestamp"
}
```

## 3. Session flow

The page is a three-stage state machine (`setup -> active -> results`), each
stage a section that is shown or hidden — no page reloads.

**Setup.** The learner picks categories (multi-select, or "all categories"),
a question count (10 / 20 / 30 only), and timed or untimed mode (with a per
question seconds choice). The category list and the live "questions available"
count are rendered from the bank, so the screen always reflects the real data.
Empty categories (e.g. breeds, which has no questions yet) appear disabled.

**Active practice.** One question at a time: progress indicator, category tag,
optional countdown, the question, and shuffled options. Selecting an answer
locks the choices, marks correct/incorrect, and immediately shows feedback. In
timed mode a timeout records the question as missed and reveals the answer.

**Results.** A score summary (correct / total and percentage), a per-category
accuracy breakdown with bars, strength categories (≥80%) and the top one to
three weak categories (<70%), and then the full question review.

## 4. Filtering and selection logic

`HorseBowl.Filter.apply()` filters the bank by selected categories, optional
course IDs, and optional difficulty — all strictly enforced. `HorseBowl.Session`
then selects questions:

When a single category (or "all") is chosen, it shuffles the filtered pool and
takes the requested count. When several categories are chosen, it distributes
the count as evenly as possible across them (e.g. 30 across 3 categories → 10 /
10 / 10), capped by what each category actually has, then backfills any
shortfall from categories with a surplus. Selection is randomized and free of
duplicates within a round. Only after the entire distinct pool is exhausted does
it allow controlled repeats to reach the requested count, and it flags the round
as repeated so the results screen can say so.

## 5. UI component breakdown

The page (`horse-bowl/index.html`) is three stages plus the shared site nav and
footer injected by `layout.js`.

Setup stage: category grid (`.hb-cat` tiles with live counts), the count
selector, and the timer selector. Active stage: progress text, category tag,
timer, progress bar, question, options, feedback panel, and the Next button.
Results stage: score ring, strengths/focus cards, the category breakdown bars,
the review list, and actions (practice again with the same setup, change setup,
or return to the campus hub). All styling is in the shared `assets/css/horse-bowl.css`
using the existing design tokens — no inline or per-page design CSS.

The Arena is reached from the campus hub (`hub/index.html`): the Horse Bowl
Arena destination card's "Enter the Arena" button links to `horse-bowl/index.html`.

## 6. State management

State is plain in-memory JavaScript, which suits a static site with no build
step. `setup` holds the chosen categories, count, and timer settings. A
`Session` instance owns the selected questions, the per-question responses
(recorded the moment an answer is chosen), the current index, the pool size, and
the repeated flag. The DOM is the single rendered view of that state; switching
stages just toggles an `.is-active` class. Optionally, a completed session is
written to `session_results` for signed-in users (best-effort; it never blocks
the UI).

## 7. Code map

```
assets/data/question-bank.json   master bank (offline/static source of truth)
assets/data/courses.json         course -> question-ID reference lists
assets/js/horse-bowl.js          engine: Questions, Filter, Session services
assets/js/horse-bowl-ui.js       UI controller / state machine
assets/css/horse-bowl.css        Arena styles (tokens only)
horse-bowl/index.html            the Arena page (3 stages)
db/horse-bowl-schema.sql         Supabase tables, RLS, RPC
db/horse-bowl-seed.sql           generated seed (courses + 1,314 questions + joins)
tools/build-question-bank.js     one-time migration from inline course banks
```

## 8. Supabase vs Firebase

This build uses **Supabase**, which is the right fit because the site already
has Supabase wired in (`assets/js/supabase-client.js`, auth, and a `profiles`
table) and the data is naturally relational — a many-to-many between courses and
questions. A SQL join table models that cleanly, RLS gives per-user analytics
security for free, indexes and a single RPC handle filtered random selection,
and "single source of truth" is enforced by foreign keys.

A Firebase (Firestore) version would keep a `/questions` collection as the
master, a `/courses` collection storing only arrays of question IDs, and a
`/sessions` collection for results. It reads well for simple lookups and scales
horizontally, but the course↔question relationship has to be maintained by hand
(no foreign keys or joins), category/difficulty filtering with random selection
is more awkward (no `ORDER BY random()`, so you over-fetch and shuffle client
side or maintain index documents), and cross-collection integrity is the app's
responsibility. Given the existing stack and the relational shape of the data,
Supabase is the clearer choice; Firebase would be the alternative only if the
rest of the platform were already on it.

## 9. Re-running the migration

If course quizzes change, regenerate the bank with:

```
node tools/build-question-bank.js <repo-root>
```

It rewrites `assets/data/*.json` and `db/horse-bowl-seed.sql`. Re-running the
seed against Supabase is safe — questions use `on conflict do nothing` and
courses upsert their metadata.
