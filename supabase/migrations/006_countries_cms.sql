create table if not exists countries (
  code text primary key,
  region text not null default 'other',
  is_active boolean not null default true,
  language_key text,
  currency text,
  climate_key text,
  cost_level text check (cost_level in ('low', 'medium', 'high', 'very_high')),
  residency_months text,
  tax_employee text,
  tax_corporate text,
  hero_image_url text,
  visa_info_uk text,
  visa_info_en text,
  visa_info_ru text,
  updated_at timestamptz not null default now()
);

create index if not exists idx_countries_active on countries (is_active) where is_active = true;
