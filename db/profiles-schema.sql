-- =============================================================================
-- Equine EDU — profiles schema (Supabase / PostgreSQL)
-- -----------------------------------------------------------------------------
-- Defines the `profiles` table that the auth + subscription system depends on.
-- Consumed by:
--   assets/js/supabase-client.js     getProfile() / updateProfile()
--   assets/js/paywall.js             reads subscription_tier + subscription_status
--   netlify/functions/stripe-webhook.js   writes tier/status/stripe ids (service role)
--   netlify/functions/create-portal.js    reads stripe_customer_id (service role)
--   account/index.html, hub/index.html    read display_name / subscription_*
--
-- Run this AFTER enabling Supabase Auth. Safe to re-run (idempotent).
--
-- NOTE: The campus hub (hub/index.html) also queries tables that are NOT yet
-- defined anywhere in this repo: a course-progress/enrollment table
-- (user_id, course_id, progress_percent, last_accessed), a quiz-scores table
-- (user_id, score, topic, created_at), an achievements table
-- (user_id, type, title, earned_at), and richer `courses` columns
-- (slug, thumbnail, difficulty_level). Those are tracked separately; this file
-- only covers `profiles`.
-- =============================================================================

-- ---- table ------------------------------------------------------------------
create table if not exists public.profiles (
  id                     uuid        primary key
                           references auth.users (id) on delete cascade,
  email                  text,
  display_name           text,
  role                   text        not null default 'user'
                           check (role in ('user','admin')),
  subscription_tier      text        not null default 'free'
                           check (subscription_tier in ('free','pro')),
  -- No CHECK constraint: Stripe owns this vocabulary (active, past_due,
  -- canceled, trialing, unpaid, incomplete, paused, ...) and the webhook
  -- throws on any rejected write, so over-constraining here would break it.
  subscription_status    text        not null default 'inactive',
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Webhook updates match the row by stripe_customer_id, so index it.
create index if not exists idx_profiles_stripe_customer
  on public.profiles (stripe_customer_id);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles enable row level security;

-- A user may read only their own profile row.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

-- A user may update only their own profile row. The trigger below also prevents
-- client-side edits to billing, role, and auth-owned columns; Stripe/webhook
-- writes use the service role and are allowed through.
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- No client INSERT policy on purpose: rows are created by the signup trigger
-- below (security definer). No client DELETE policy: cascade from auth.users.

-- =============================================================================
-- Protect billing/admin fields from client-side profile updates
-- =============================================================================
create or replace function public.prevent_profile_restricted_client_update()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role'
     and current_user not in ('postgres', 'supabase_admin') then
    if new.email is distinct from old.email
       or new.role is distinct from old.role
       or new.subscription_tier is distinct from old.subscription_tier
       or new.subscription_status is distinct from old.subscription_status
       or new.stripe_customer_id is distinct from old.stripe_customer_id
       or new.stripe_subscription_id is distinct from old.stripe_subscription_id
       or new.created_at is distinct from old.created_at then
      raise exception 'Restricted profile fields cannot be updated by the client';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_restricted_client_update on public.profiles;
create trigger trg_profiles_restricted_client_update
  before update on public.profiles
  for each row execute function public.prevent_profile_restricted_client_update();

-- =============================================================================
-- Auto-create a profile row on signup
-- Without this, getProfile() returns null for every new user and the paywall
-- can never grant access (and account/hub pages render empty).
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- Keep updated_at fresh on every write
-- =============================================================================
create or replace function public.touch_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_profile on public.profiles;
create trigger trg_touch_profile
  before update on public.profiles
  for each row execute function public.touch_profile_updated_at();

-- =============================================================================
-- Backfill: create profile rows for any users who signed up before this trigger
-- existed (no-op on a fresh project).
-- =============================================================================
insert into public.profiles (id, email, display_name)
select u.id, u.email, coalesce(u.raw_user_meta_data ->> 'display_name', '')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
