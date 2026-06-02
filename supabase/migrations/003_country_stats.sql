-- Materialized stats table for fast country page queries
create table if not exists country_stats (
  target_country     text not null,
  author_nationality text not null,
  avg_legalization     numeric(3,2),
  avg_attitude         numeric(3,2),
  avg_cost_of_living   numeric(3,2),
  avg_safety           numeric(3,2),
  avg_bureaucracy      numeric(3,2),
  avg_weather          numeric(3,2),
  avg_language_barrier numeric(3,2),
  avg_cleanliness      numeric(3,2),
  avg_healthcare       numeric(3,2),
  avg_overall          numeric(3,2),
  total_reviews        int not null default 0,
  updated_at           timestamptz not null default now(),
  primary key (target_country, author_nationality)
);

-- Add city + profile columns to reviews table
alter table reviews
  add column if not exists city_name    text,
  add column if not exists city_id      bigint,
  add column if not exists author_profile text;

-- Function to upsert country_stats when a review is inserted/updated
create or replace function refresh_country_stats()
returns trigger language plpgsql as $$
begin
  insert into country_stats (
    target_country, author_nationality,
    avg_legalization, avg_attitude, avg_cost_of_living, avg_safety,
    avg_bureaucracy, avg_weather, avg_language_barrier,
    avg_cleanliness, avg_healthcare, avg_overall,
    total_reviews, updated_at
  )
  select
    target_country, author_nationality,
    round(avg((ratings->>'legalization')::numeric),    2),
    round(avg((ratings->>'attitude')::numeric),        2),
    round(avg((ratings->>'cost_of_living')::numeric),  2),
    round(avg((ratings->>'safety')::numeric),          2),
    round(avg((ratings->>'bureaucracy')::numeric),     2),
    round(avg((ratings->>'weather')::numeric),         2),
    round(avg((ratings->>'language_barrier')::numeric),2),
    round(avg((ratings->>'cleanliness')::numeric),     2),
    round(avg((ratings->>'healthcare')::numeric),      2),
    round(avg((ratings->>'overall')::numeric),         2),
    count(*),
    now()
  from reviews
  where is_approved = true
    and target_country   = new.target_country
    and author_nationality = new.author_nationality
  group by target_country, author_nationality
  on conflict (target_country, author_nationality) do update set
    avg_legalization     = excluded.avg_legalization,
    avg_attitude         = excluded.avg_attitude,
    avg_cost_of_living   = excluded.avg_cost_of_living,
    avg_safety           = excluded.avg_safety,
    avg_bureaucracy      = excluded.avg_bureaucracy,
    avg_weather          = excluded.avg_weather,
    avg_language_barrier = excluded.avg_language_barrier,
    avg_cleanliness      = excluded.avg_cleanliness,
    avg_healthcare       = excluded.avg_healthcare,
    avg_overall          = excluded.avg_overall,
    total_reviews        = excluded.total_reviews,
    updated_at           = now();
  return new;
end;
$$;

create trigger trg_refresh_country_stats
  after insert or update on reviews
  for each row execute function refresh_country_stats();

-- Backfill existing data
insert into country_stats (
  target_country, author_nationality,
  avg_legalization, avg_attitude, avg_cost_of_living, avg_safety,
  avg_bureaucracy, avg_weather, avg_language_barrier,
  avg_cleanliness, avg_healthcare, avg_overall,
  total_reviews
)
select
  target_country, author_nationality,
  round(avg((ratings->>'legalization')::numeric),    2),
  round(avg((ratings->>'attitude')::numeric),        2),
  round(avg((ratings->>'cost_of_living')::numeric),  2),
  round(avg((ratings->>'safety')::numeric),          2),
  round(avg((ratings->>'bureaucracy')::numeric),     2),
  round(avg((ratings->>'weather')::numeric),         2),
  round(avg((ratings->>'language_barrier')::numeric),2),
  round(avg((ratings->>'cleanliness')::numeric),     2),
  round(avg((ratings->>'healthcare')::numeric),      2),
  round(avg((ratings->>'overall')::numeric),         2),
  count(*)
from reviews
where is_approved = true
group by target_country, author_nationality
on conflict (target_country, author_nationality) do nothing;
