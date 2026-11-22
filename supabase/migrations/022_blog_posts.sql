-- Mini blog: standalone posts, independent from countries/cities content.
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  author_name text,

  cover_image_url text,
  cover_alt text,

  title_uk text, title_en text, title_ru text,
  excerpt_uk text, excerpt_en text, excerpt_ru text,
  body_uk text, body_en text, body_ru text,

  -- SEO overrides (empty = fall back to title / excerpt of the post)
  seo_title_uk text, seo_title_en text, seo_title_ru text,
  seo_description_uk text, seo_description_en text, seo_description_ru text,
  og_image_url text
);

create index if not exists idx_blog_posts_published
  on blog_posts (published_at desc)
  where status = 'published';

alter table blog_posts enable row level security;

-- Public can read only published posts whose publish date has come.
-- Writes go through the service role (admin API), so no write policies.
drop policy if exists blog_posts_public_read on blog_posts;
create policy blog_posts_public_read on blog_posts
  for select using (
    status = 'published' and (published_at is null or published_at <= now())
  );
