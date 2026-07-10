-- Article publish flags + public media bucket for country heroes

alter table countries
  add column if not exists article_published boolean not null default true;

alter table cities
  add column if not exists article_published boolean not null default true;

-- Storage bucket (public read; writes via service role)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'country-media',
  'country-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists country_media_public_read on storage.objects;
create policy country_media_public_read
  on storage.objects
  for select
  using (bucket_id = 'country-media');
