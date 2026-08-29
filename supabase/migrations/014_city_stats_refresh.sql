-- city_stats existed in production without a migration or refresh trigger.
-- Country pages read city tabs/ratings from city_stats, so approved reviews
-- with city_id never appeared in the cities-with-reviews block.
-- Mirror refresh_country_stats (013): skip avg_attitude in INSERT/SELECT.

create table if not exists city_stats (
  id                   uuid primary key default gen_random_uuid(),
  city_id              integer not null,
  city_name            text not null,
  target_country       text not null,
  author_nationality   text not null,
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
  unique (city_id, target_country, author_nationality)
);

create index if not exists city_stats_target_country_author_nationality_idx
  on city_stats (target_country, author_nationality);

create index if not exists city_stats_city_id_idx
  on city_stats (city_id);

alter table city_stats enable row level security;

drop policy if exists "Public read city_stats" on city_stats;
create policy "Public read city_stats" on city_stats
  for select using (true);

-- Recompute one (city, country, nationality) bucket from approved reviews.
-- SECURITY DEFINER: anon review INSERT must not fail on city_stats RLS.
create or replace function upsert_city_stats_for(
  p_city_id integer,
  p_target_country text,
  p_author_nationality text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if p_city_id is null
     or p_target_country is null
     or p_author_nationality is null then
    return;
  end if;

  select count(*) into v_count
  from reviews
  where is_approved = true
    and city_id = p_city_id
    and target_country = p_target_country
    and author_nationality = p_author_nationality;

  if v_count = 0 then
    delete from city_stats
    where city_id = p_city_id
      and target_country = p_target_country
      and author_nationality = p_author_nationality;
    return;
  end if;

  insert into city_stats (
    city_id, city_name, target_country, author_nationality,
    avg_legalization, avg_cost_of_living, avg_safety,
    avg_bureaucracy, avg_weather, avg_language_barrier,
    avg_cleanliness, avg_healthcare, avg_overall,
    total_reviews, updated_at
  )
  select
    r.city_id,
    coalesce(
      nullif(max(r.city_name), ''),
      (select c.name_en from cities c where c.id = r.city_id)
    ),
    r.target_country,
    r.author_nationality,
    round(avg((r.ratings->>'legalization')::numeric),    2),
    round(avg((r.ratings->>'cost_of_living')::numeric),  2),
    round(avg((r.ratings->>'safety')::numeric),          2),
    round(avg((r.ratings->>'bureaucracy')::numeric),     2),
    round(avg((r.ratings->>'weather')::numeric),         2),
    round(avg((r.ratings->>'language_barrier')::numeric),2),
    round(avg((r.ratings->>'cleanliness')::numeric),     2),
    round(avg((r.ratings->>'healthcare')::numeric),      2),
    round(avg((r.ratings->>'overall')::numeric),         2),
    count(*)::int,
    now()
  from reviews r
  where r.is_approved = true
    and r.city_id = p_city_id
    and r.target_country = p_target_country
    and r.author_nationality = p_author_nationality
  group by r.city_id, r.target_country, r.author_nationality
  on conflict (city_id, target_country, author_nationality) do update set
    city_name            = excluded.city_name,
    avg_legalization     = excluded.avg_legalization,
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
end;
$$;

create or replace function refresh_city_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform upsert_city_stats_for(old.city_id, old.target_country, old.author_nationality);
    return old;
  end if;

  -- Pending inserts must not touch city_stats (and would fail under invoker RLS).
  if tg_op = 'INSERT' and not coalesce(new.is_approved, false) then
    return new;
  end if;

  if tg_op = 'UPDATE'
     and old.city_id is not null
     and (
       old.city_id is distinct from new.city_id
       or old.target_country is distinct from new.target_country
       or old.author_nationality is distinct from new.author_nationality
     ) then
    perform upsert_city_stats_for(old.city_id, old.target_country, old.author_nationality);
  end if;

  if new.city_id is not null then
    perform upsert_city_stats_for(new.city_id, new.target_country, new.author_nationality);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_refresh_city_stats on reviews;
create trigger trg_refresh_city_stats
  after insert or update or delete on reviews
  for each row execute function refresh_city_stats();

-- Backfill from all approved city reviews (idempotent upsert)
insert into city_stats (
  city_id, city_name, target_country, author_nationality,
  avg_legalization, avg_cost_of_living, avg_safety,
  avg_bureaucracy, avg_weather, avg_language_barrier,
  avg_cleanliness, avg_healthcare, avg_overall,
  total_reviews, updated_at
)
select
  r.city_id,
  coalesce(
    nullif(max(r.city_name), ''),
    (select c.name_en from cities c where c.id = r.city_id)
  ),
  r.target_country,
  r.author_nationality,
  round(avg((r.ratings->>'legalization')::numeric),    2),
  round(avg((r.ratings->>'cost_of_living')::numeric),  2),
  round(avg((r.ratings->>'safety')::numeric),          2),
  round(avg((r.ratings->>'bureaucracy')::numeric),     2),
  round(avg((r.ratings->>'weather')::numeric),         2),
  round(avg((r.ratings->>'language_barrier')::numeric),2),
  round(avg((r.ratings->>'cleanliness')::numeric),     2),
  round(avg((r.ratings->>'healthcare')::numeric),      2),
  round(avg((r.ratings->>'overall')::numeric),         2),
  count(*)::int,
  now()
from reviews r
where r.is_approved = true
  and r.city_id is not null
group by r.city_id, r.target_country, r.author_nationality
on conflict (city_id, target_country, author_nationality) do update set
  city_name            = excluded.city_name,
  avg_legalization     = excluded.avg_legalization,
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
