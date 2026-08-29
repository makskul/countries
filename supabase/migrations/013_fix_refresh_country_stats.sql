-- Fix broken refresh_country_stats trigger:
-- INSERT listed avg_attitude but SELECT no longer computed it after attitude
-- was removed from the review form → "INSERT has more target columns than expressions"
-- which blocked every reviews INSERT/UPDATE.

create or replace function refresh_country_stats()
returns trigger language plpgsql as $$
begin
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
    count(*),
    now()
  from reviews
  where is_approved = true
    and target_country   = new.target_country
    and author_nationality = new.author_nationality
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
  return new;
end;
$$;
