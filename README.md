# Equine EDU

Equestrian science learning platform.

## Mandatory Guardrails

Before creating or revising any course, lesson, quiz, worksheet, activity, game,
educational resource, or visual asset, read `CLAUDE.md` and the authoritative
documents in:

`C:\Users\Corie Jean\OneDrive\Documents\Claude\Projects\EQUINE EDU — GOVERNED BUILD SYSTEM`

The governed build system controls research, course creation, educational
accuracy, reading accessibility, visual standards, assessment requirements, and
publication approval.

## Repository Structure

- `courses/schooling-ring/` — course pages
- `courses/learning-loft/` — game and practice entry points
- `courses/lesson-board/` — downloads and printable resources
- `assets/css/` — shared styling
- `assets/js/` — shared browser behavior
- `assets/data/` — course and question-bank data
- `netlify/functions/` — authenticated Stripe and subscription endpoints
- `db/` — Horse Bowl database schema and synchronization files
- `scripts/` — deterministic repository validation
- `reports/` — generated audit reports

## Validation

Run these checks before publication:

```text
npm run audit:links
npm run audit:courses
npm run audit:security
npm run audit:quizzes
```

`npm test` runs the blocking link, course-structure, and Stripe ownership checks.
The quiz audit produces a report but does not create or modify educational
questions.
