-- =============================================================================
-- Equine EDU — campus hub / dashboard schema (Supabase / PostgreSQL)
-- -----------------------------------------------------------------------------
-- Defines the tables the dashboard (hub/index.html) queries but that were not
-- yet defined anywhere in the repo. Run AFTER db/horse-bowl-schema.sql (which
-- creates `courses`) and db/profiles-schema.sql. Safe to re-run (idempotent).
--
-- Tables created/extended here, with the exact columns hub/index.html reads:
--   courses              + slug, thumbnail, difficulty_level   (ALTER existing)
--   enrollments          user_id, course_id, progress_percent, last_accessed
--   horsebowl_activity   user_id, score, topic, category_breakdown,
--                        duration_secs, created_at
--   achievements         user_id, type, title, earned_at
--
-- IMPORTANT — dashboard data source status:
--   * enrollments  — course progress is written here (no localStorage):
--                    course-nav.js upserts module completion on each lesson
--                    visit, and quiz-standard.js marks the course complete when
--                    Test Your Knowledge is passed at >=80% (the completion event).
--   * horsebowl_activity — the Horse Bowl engine writes round summaries here
--                    for the MVP dashboard.
--   * achievements — no badge/achievement engine exists yet; this is the
--                    backing store for that future feature.
-- Course-progress writers are now wired (course-nav.js + quiz-standard.js).
-- The achievements writer does not exist yet, so that panel renders an empty
-- state until a badge engine writes rows. No panel uses sample/mock data.
-- =============================================================================

-- ---- extend the existing courses table -------------------------------------
-- NOTE on FK type consistency: public.courses.id is TEXT (course slugs such as
-- 'appaloosa-patterns'), so every course_id reference in the schema is TEXT
-- (questions.course_id, course_questions.course_id, enrollments.course_id).
-- The FK types already match — do not convert any course_id to UUID.
alter table public.courses add column if not exists slug             text;
alter table public.courses add column if not exists thumbnail        text;
alter table public.courses add column if not exists difficulty_level integer;

create index if not exists idx_courses_difficulty
  on public.courses (difficulty_level);

-- slug must be unique to prevent routing conflicts. A UNIQUE INDEX is the
-- idempotent way to enforce this (CREATE UNIQUE INDEX IF NOT EXISTS); multiple
-- NULL slugs are still allowed, so unpopulated courses do not collide.
create unique index if not exists uq_courses_slug
  on public.courses (slug);

-- ---- enrollments: a user's progress through a course -----------------------
-- course_id is TEXT to match public.courses.id (see FK-consistency note above).
create table if not exists public.enrollments (
  user_id          uuid        not null references auth.users (id) on delete cascade,
  course_id        text        not null references public.courses (id) on delete cascade,
  progress_percent numeric(5,2) not null default 0
                     check (progress_percent >= 0 and progress_percent <= 100),
  last_accessed    timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  primary key (user_id, course_id)
);
create index if not exists idx_enrollments_user
  on public.enrollments (user_id, last_accessed desc);

-- Per-module completion lives here (JSON array of module keys, e.g.
-- ["whyGroomingMatters","groomingTools"]). This is the single source of truth
-- for course progress; course-nav.js upserts it on each lesson visit and
-- derives progress_percent from it. Replaces the old localStorage scheme.
alter table public.enrollments
  add column if not exists completed_modules jsonb not null default '[]'::jsonb;

-- ---- horsebowl_activity: per-round summary surfaced on the dashboard -------
create table if not exists public.horsebowl_activity (
  id                 uuid        primary key default gen_random_uuid(),
  user_id            uuid        not null references auth.users (id) on delete cascade,
  score              integer     not null,
  topic              text,
  category_breakdown jsonb       not null default '{}'::jsonb,
  duration_secs      integer,
  created_at         timestamptz not null default now()
);
create index if not exists idx_hbactivity_user
  on public.horsebowl_activity (user_id, created_at desc);

alter table public.horsebowl_activity
  add column if not exists category_breakdown jsonb not null default '{}'::jsonb;
alter table public.horsebowl_activity
  add column if not exists duration_secs integer;

-- Leaderboard support: highest scores first.
create index if not exists idx_hbactivity_score
  on public.horsebowl_activity (score desc);

-- ---- achievements: earned badges / milestones ------------------------------
create table if not exists public.achievements (
  id        uuid        primary key default gen_random_uuid(),
  user_id   uuid        not null references auth.users (id) on delete cascade,
  type      text        not null,
  title     text        not null,
  earned_at timestamptz not null default now()
);
create index if not exists idx_achievements_user
  on public.achievements (user_id, earned_at desc);

-- =============================================================================
-- Integrity hardening
-- -----------------------------------------------------------------------------
-- Constraints are applied via DROP IF EXISTS + ADD so this section is safe on
-- both a fresh database (tables just created above) and an existing one where
-- the tables predate these checks. PostgreSQL has no "ADD CONSTRAINT IF NOT
-- EXISTS", so drop-then-add is the idempotent pattern. All checks permit NULL
-- where the column is optional, so existing rows are never invalidated.
-- =============================================================================

-- difficulty_level must be 1..5 when set (NULL allowed until courses are tagged).
alter table public.courses
  drop constraint if exists courses_difficulty_level_check;
alter table public.courses
  add  constraint courses_difficulty_level_check
  check (difficulty_level is null or difficulty_level between 1 and 5);

-- horsebowl_activity.topic: lightweight length cap to keep the free-text field
-- consistent and leave room for future normalization without a new table.
alter table public.horsebowl_activity
  drop constraint if exists horsebowl_activity_topic_len;
alter table public.horsebowl_activity
  add  constraint horsebowl_activity_topic_len
  check (topic is null or char_length(topic) <= 60);

alter table public.horsebowl_activity
  drop constraint if exists horsebowl_activity_duration_secs_valid;
alter table public.horsebowl_activity
  add  constraint horsebowl_activity_duration_secs_valid
  check (duration_secs is null or duration_secs >= 0);

-- achievements.type: reject empty / runaway values without forcing an enum.
alter table public.achievements
  drop constraint if exists achievements_type_valid;
alter table public.achievements
  add  constraint achievements_type_valid
  check (char_length(type) between 1 and 40);

-- =============================================================================
-- Row Level Security — each user sees and writes only their own rows.
-- `courses` itself stays world-readable (policy lives in horse-bowl-schema.sql).
-- =============================================================================
alter table public.enrollments        enable row level security;
alter table public.horsebowl_activity enable row level security;
alter table public.achievements       enable row level security;

-- enrollments: owner full access
drop policy if exists enrollments_select_own on public.enrollments;
create policy enrollments_select_own on public.enrollments
  for select using (auth.uid() = user_id);

drop policy if exists enrollments_insert_own on public.enrollments;
create policy enrollments_insert_own on public.enrollments
  for insert with check (auth.uid() = user_id);

drop policy if exists enrollments_update_own on public.enrollments;
create policy enrollments_update_own on public.enrollments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- horsebowl_activity: a user reads and inserts only their own rows
drop policy if exists hbactivity_select_own on public.horsebowl_activity;
create policy hbactivity_select_own on public.horsebowl_activity
  for select using (auth.uid() = user_id);

drop policy if exists hbactivity_insert_own on public.horsebowl_activity;
create policy hbactivity_insert_own on public.horsebowl_activity
  for insert with check (auth.uid() = user_id);

-- achievements: a user reads only their own; awards are written by the service
-- role (or a future server function), so no client INSERT policy is granted.
drop policy if exists achievements_select_own on public.achievements;
create policy achievements_select_own on public.achievements
  for select using (auth.uid() = user_id);
