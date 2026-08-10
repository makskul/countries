-- refresh_country_stats used INSERT...SELECT of approved reviews only.
-- When approved count for a (country, nationality) bucket hit 0, SELECT returned
-- no rows → INSERT did nothing → stale country_stats rows kept old averages.
-- Mirror city_stats (014): delete when count is 0; refresh OLD bucket on key change.

create or replace function upsert_country_stats_for(
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
  if p_target_country is null or p_author_nationality is null then
    return;
  end if;

  select count(*) into v_count
  from reviews
  where is_approved = true
    and target_country = p_target_country
    and author_nationality = p_author_nationality;

  if v_count = 0 then
    delete from country_stats
    where target_country = p_target_country
      and author_nationality = p_author_nationality;
    return;
  end if;

  insert into country_stats (
    target_country, author_nationality,
    avg_legalization, avg_cost_of_living, avg_safety,
    avg_bureaucracy, avg_weather, avg_language_barrier,
    avg_cleanliness, avg_healthcare, avg_overall,
    total_reviews, updated_at
  )
  select
    target_country, author_nationality,
    round(avg((ratings->>'legalization')::numeric),    2),
    round(avg((ratings->>'cost_of_living')::numeric),  2),
    round(avg((ratings->>'safety')::numeric),          2),
    round(avg((ratings->>'bureaucracy')::numeric),     2),
    round(avg((ratings->>'weather')::numeric),         2),
    round(avg((ratings->>'language_barrier')::numeric),2),
    round(avg((ratings->>'cleanliness')::numeric),     2),
    round(avg((ratings->>'healthcare')::numeric),      2),
    round(avg((ratings->>'overall')::numeric),         2),
    count(*)::int,
    now()
  from reviews
  where is_approved = true
    and target_country = p_target_country
    and author_nationality = p_author_nationality
  group by target_country, author_nationality
  on conflict (target_country, author_nationality) do update set
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

create or replace function refresh_country_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and (
       old.target_country is distinct from new.target_country
       or old.author_nationality is distinct from new.author_nationality
     ) then
    perform upsert_country_stats_for(old.target_country, old.author_nationality);
  end if;

  perform upsert_country_stats_for(new.target_country, new.author_nationality);
  return new;
end;
$$;

-- Remove rows with no remaining approved reviews, then recompute all buckets.
delete from country_stats cs
where not exists (
  select 1
  from reviews r
  where r.is_approved = true
    and r.target_country = cs.target_country
    and r.author_nationality = cs.author_nationality
);

insert into country_stats (
  target_country, author_nationality,
  avg_legalization, avg_cost_of_living, avg_safety,
  avg_bureaucracy, avg_weather, avg_language_barrier,
  avg_cleanliness, avg_healthcare, avg_overall,
  total_reviews, updated_at
)
select
  target_country, author_nationality,
  round(avg((ratings->>'legalization')::numeric),    2),
  round(avg((ratings->>'cost_of_living')::numeric),  2),
  round(avg((ratings->>'safety')::numeric),          2),
  round(avg((ratings->>'bureaucracy')::numeric),     2),
  round(avg((ratings->>'weather')::numeric),         2),
  round(avg((ratings->>'language_barrier')::numeric),2),
  round(avg((ratings->>'cleanliness')::numeric),     2),
  round(avg((ratings->>'healthcare')::numeric),      2),
  round(avg((ratings->>'overall')::numeric),         2),
  count(*)::int,
  now()
from reviews
where is_approved = true
group by target_country, author_nationality
on conflict (target_country, author_nationality) do update set
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
