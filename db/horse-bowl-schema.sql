-- =============================================================================
-- Equine EDU — Horse Bowl Practice System schema (Supabase / PostgreSQL)
-- -----------------------------------------------------------------------------
-- SINGLE SOURCE OF TRUTH. Every question in the platform lives in `questions`.
-- Courses and the Horse Bowl reference the same rows — no duplicate banks.
-- Run this file first, then db/horse-bowl-seed.sql to load the migrated bank.
-- =============================================================================

-- ---- master question bank ---------------------------------------------------
create table if not exists questions (
  id                    text primary key,            -- e.g. q_000123
  question              text        not null,
  options               jsonb       not null,         -- ["A","B","C","D"]
  correct_answer        text        not null,         -- must be one of options
  category              text        not null,         -- anatomy, colors, ...
  course_id             text,                          -- origin course (optional)
  image_url             text,                          -- optional image for image-based questions
  difficulty            text        not null default 'medium'
                          check (difficulty in ('easy','medium','hard')),
  explanation_correct   text        not null,
  explanation_incorrect text        not null,
  version               integer     not null default 1,
  last_updated          timestamptz not null default now()
);

create index if not exists idx_questions_category   on questions (category);
create index if not exists idx_questions_difficulty on questions (difficulty);
create index if not exists idx_questions_course     on questions (course_id);

-- keep last_updated fresh + bump version on every edit (auto-propagation)
create or replace function touch_question() returns trigger as $$
begin
  new.last_updated := now();
  if (new.* is distinct from old.*) then new.version := old.version + 1; end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_question on questions;
create trigger trg_touch_question before update on questions
  for each row execute function touch_question();

-- ---- courses (IDs + metadata only — NO questions stored here) ---------------
create table if not exists courses (
  id          text primary key,
  title       text not null,
  category    text,
  collection  text,
  created_at  timestamptz not null default now()
);

-- ---- join table: which questions belong to which course --------------------
create table if not exists course_questions (
  course_id   text not null references courses (id)    on delete cascade,
  question_id text not null references questions (id)  on delete cascade,
  position    integer,
  primary key (course_id, question_id)
);
create index if not exists idx_cq_question on course_questions (question_id);

-- ---- session analytics (optional) ------------------------------------------
create table if not exists session_results (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users (id) on delete set null,
  mode           text not null default 'horse-bowl',
  categories     jsonb       not null default '[]'::jsonb,  -- selected filters
  question_count integer     not null,
  timed          boolean     not null default false,
  score          integer     not null,
  total          integer     not null,
  percentage     numeric(5,2) not null,
  category_breakdown jsonb    not null default '{}'::jsonb,  -- {anatomy:{correct,total}}
  question_ids   jsonb       not null default '[]'::jsonb,   -- served question ids
  responses      jsonb       not null default '[]'::jsonb,   -- per-question answers
  duration_secs  integer,
  created_at     timestamptz not null default now()
);
create index if not exists idx_sessions_user on session_results (user_id, created_at desc);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table questions        enable row level security;
alter table courses          enable row level security;
alter table course_questions enable row level security;
alter table session_results  enable row level security;

-- questions / courses / join: world-readable, writes go through service role only
drop policy if exists questions_read on questions;
create policy questions_read on questions for select using (true);

drop policy if exists courses_read on courses;
create policy courses_read on courses for select using (true);

drop policy if exists cq_read on course_questions;
create policy cq_read on course_questions for select using (true);

-- session_results: a user sees and writes only their own rows
drop policy if exists sessions_owner_select on session_results;
create policy sessions_owner_select on session_results
  for select using (auth.uid() = user_id);

drop policy if exists sessions_owner_insert on session_results;
create policy sessions_owner_insert on session_results
  for insert with check (auth.uid() = user_id);

-- =============================================================================
-- Convenience RPC: server-side Horse Bowl filtering (optional fast path)
-- The client can also filter in JS against the cached bank; this RPC lets the
-- DB do balanced, randomized selection when the bank grows large.
-- =============================================================================
create or replace function horse_bowl_questions(
  p_categories  text[]  default null,   -- null/empty = all categories
  p_course_ids  text[]  default null,
  p_difficulty  text    default null,
  p_limit       integer default 20
) returns setof questions as $$
  select *
  from questions q
  where (p_categories is null or array_length(p_categories,1) is null
         or q.category = any(p_categories))
    and (p_course_ids is null or array_length(p_course_ids,1) is null
         or q.course_id = any(p_course_ids))
    and (p_difficulty is null or q.difficulty = p_difficulty)
  order by random()
  limit greatest(p_limit, 0);
$$ language sql stable;

-- =============================================================================
-- NOTE on automatic propagation
-- Because courses and Horse Bowl both read from `questions`, any UPDATE to a
-- question row is reflected everywhere on next read. The trigger above bumps
-- `version` and `last_updated` so caches/clients can detect staleness.
-- =============================================================================
