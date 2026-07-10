-- Link reviews.city_id → cities.id so PostgREST can embed cities(...)
-- Without this FK, country/city pages fail with PGRST200 and show zero reviews.

-- Align types (city_id was bigint; cities.id is serial/integer)
alter table reviews
  alter column city_id type integer using nullif(city_id, 0)::integer;

-- Drop orphaned references before adding FK
update reviews r
set city_id = null
where city_id is not null
  and not exists (select 1 from cities c where c.id = r.city_id);

alter table reviews
  drop constraint if exists reviews_city_id_fkey;

alter table reviews
  add constraint reviews_city_id_fkey
  foreign key (city_id) references cities (id)
  on delete set null;

create index if not exists reviews_city_id_idx on reviews (city_id);

-- Refresh PostgREST schema cache (Supabase)
notify pgrst, 'reload schema';
