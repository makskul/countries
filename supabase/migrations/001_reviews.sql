-- Create reviews table (idempotent — never DROP; preserves existing data)
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  author_nationality text not null,
  target_country text not null,
  ratings jsonb not null,    -- { "legalization": 4, "attitude": 5, ... }
  comments jsonb not null,   -- { "legalization": "Takes 2 months", ... }
  is_approved boolean not null default true
);

-- Index for querying reviews for a country, nationality and approval state
create index if not exists reviews_target_nat_approved_idx
  on reviews (target_country, author_nationality, is_approved);
