-- SiteTrack database schema
-- Run this file in the Supabase SQL Editor for a new project.

create extension if not exists pgcrypto;

create table if not exists public.compounds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  default_unit text not null check (default_unit in ('mg', 'mcg', 'mL', 'IU', 'units', 'g')),
  color text not null default '#d36f4b' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists compounds_user_name_unique
  on public.compounds (user_id, lower(name));

create index if not exists compounds_user_id_idx
  on public.compounds (user_id);

create table if not exists public.injections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  injected_at timestamptz not null,
  route text not null check (route in ('intramuscular', 'subcutaneous', 'other')),
  site text not null check (site in (
    'left_deltoid', 'right_deltoid',
    'left_ventrogluteal', 'right_ventrogluteal',
    'left_glute', 'right_glute',
    'left_thigh', 'right_thigh',
    'left_abdomen', 'right_abdomen',
    'other'
  )),
  notes text check (char_length(notes) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists injections_user_date_idx
  on public.injections (user_id, injected_at desc);

create index if not exists injections_user_site_idx
  on public.injections (user_id, site, injected_at desc);

create table if not exists public.injection_items (
  id uuid primary key default gen_random_uuid(),
  injection_id uuid not null references public.injections (id) on delete cascade,
  compound_id uuid not null references public.compounds (id) on delete restrict,
  amount numeric(14, 4) not null check (amount > 0),
  unit text not null check (unit in ('mg', 'mcg', 'mL', 'IU', 'units', 'g')),
  created_at timestamptz not null default now(),
  unique (injection_id, compound_id)
);

create index if not exists injection_items_injection_id_idx
  on public.injection_items (injection_id);

create index if not exists injection_items_compound_id_idx
  on public.injection_items (compound_id);

-- Restrict Data API access to signed-in users. RLS below then limits each
-- signed-in user to rows they own.
revoke all on table public.compounds from anon;
revoke all on table public.injections from anon;
revoke all on table public.injection_items from anon;

grant select, insert, update, delete on table public.compounds to authenticated;
grant select, insert, update, delete on table public.injections to authenticated;
grant select, insert, update, delete on table public.injection_items to authenticated;

alter table public.compounds enable row level security;
alter table public.injections enable row level security;
alter table public.injection_items enable row level security;

drop policy if exists "Users select their compounds" on public.compounds;
create policy "Users select their compounds"
  on public.compounds for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users insert their compounds" on public.compounds;
create policy "Users insert their compounds"
  on public.compounds for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users update their compounds" on public.compounds;
create policy "Users update their compounds"
  on public.compounds for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete their compounds" on public.compounds;
create policy "Users delete their compounds"
  on public.compounds for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users select their injections" on public.injections;
create policy "Users select their injections"
  on public.injections for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users insert their injections" on public.injections;
create policy "Users insert their injections"
  on public.injections for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users update their injections" on public.injections;
create policy "Users update their injections"
  on public.injections for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete their injections" on public.injections;
create policy "Users delete their injections"
  on public.injections for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users select their injection items" on public.injection_items;
create policy "Users select their injection items"
  on public.injection_items for select
  to authenticated
  using (
    exists (
      select 1
      from public.injections
      where injections.id = injection_items.injection_id
        and injections.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users insert their injection items" on public.injection_items;
create policy "Users insert their injection items"
  on public.injection_items for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.injections
      where injections.id = injection_items.injection_id
        and injections.user_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.compounds
      where compounds.id = injection_items.compound_id
        and compounds.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users update their injection items" on public.injection_items;
create policy "Users update their injection items"
  on public.injection_items for update
  to authenticated
  using (
    exists (
      select 1
      from public.injections
      where injections.id = injection_items.injection_id
        and injections.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.injections
      where injections.id = injection_items.injection_id
        and injections.user_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.compounds
      where compounds.id = injection_items.compound_id
        and compounds.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users delete their injection items" on public.injection_items;
create policy "Users delete their injection items"
  on public.injection_items for delete
  to authenticated
  using (
    exists (
      select 1
      from public.injections
      where injections.id = injection_items.injection_id
        and injections.user_id = (select auth.uid())
    )
  );
