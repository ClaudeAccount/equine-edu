-- =============================================================================
-- Equine EDU launch security fixes
-- -----------------------------------------------------------------------------
-- Run this against the production Supabase project before launching the paid MVP.
-- It is intentionally narrow: it protects subscription/admin profile fields from
-- client-side spoofing while preserving user-owned display_name edits and Stripe
-- webhook writes through the service role.
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
