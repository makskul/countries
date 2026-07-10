-- Content articles for countries and cities (uk / en / ru)
alter table countries
  add column if not exists article_title_uk text,
  add column if not exists article_title_en text,
  add column if not exists article_title_ru text,
  add column if not exists article_excerpt_uk text,
  add column if not exists article_excerpt_en text,
  add column if not exists article_excerpt_ru text,
  add column if not exists article_body_uk text,
  add column if not exists article_body_en text,
  add column if not exists article_body_ru text;

alter table cities
  add column if not exists article_title_uk text,
  add column if not exists article_title_en text,
  add column if not exists article_title_ru text,
  add column if not exists article_excerpt_uk text,
  add column if not exists article_excerpt_en text,
  add column if not exists article_excerpt_ru text,
  add column if not exists article_body_uk text,
  add column if not exists article_body_en text,
  add column if not exists article_body_ru text;

-- Unique city slug per country (for idempotent upserts)
create unique index if not exists cities_country_slug_uidx on cities (country, slug);
