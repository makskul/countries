-- Lead-gen: visa/consultation requests from country pages (EPIC-2.1)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  author_nationality text not null,
  email text not null,
  message text,
  source text not null default 'country_page',
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_country_idx on leads (country);

alter table leads enable row level security;

-- Public insert only; no public read (service role bypasses RLS for admin)
drop policy if exists leads_insert_public on leads;
create policy leads_insert_public on leads
  for insert with check (true);
