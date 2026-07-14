create table if not exists cities (
  id serial primary key,
  country text not null,
  name_en text not null,
  name_uk text,
  name_ru text,
  slug text not null,
  population integer not null default 0,
  created_at timestamptz not null default now(),
  unique (country, slug)
);

create index if not exists idx_cities_country on cities (country);
create index if not exists idx_cities_population on cities (country, population desc);
