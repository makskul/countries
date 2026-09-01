-- Reader profiles + review ownership (Auth Phase 0–1)

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  display_name text,
  default_nationality char(2),
  locale text check (locale is null or locale in ('uk', 'en', 'ru'))
);

create index if not exists idx_profiles_nationality on profiles (default_nationality);

alter table reviews
  add column if not exists user_id uuid references profiles(id) on delete set null;

create index if not exists idx_reviews_user_id on reviews (user_id)
  where user_id is not null;

create index if not exists idx_reviews_user_pending on reviews (user_id, created_at desc)
  where is_approved = false;

-- RLS: profiles — owner read/update only
alter table profiles enable row level security;

drop policy if exists profiles_select_own on profiles;
create policy profiles_select_own on profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_update_own on profiles;
create policy profiles_update_own on profiles
  for update using (auth.uid() = id);

-- RLS: reviews — owner sees own (any status); public still sees approved via existing policy
drop policy if exists reviews_select_own on reviews;
create policy reviews_select_own on reviews
  for select using (auth.uid() = user_id);

drop policy if exists reviews_insert_authenticated on reviews;
create policy reviews_insert_authenticated on reviews
  for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
