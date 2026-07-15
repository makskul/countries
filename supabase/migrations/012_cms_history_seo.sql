-- CMS edit history on moderation_log + country SEO overrides

alter table moderation_log drop constraint if exists moderation_log_action_check;
alter table moderation_log
  add constraint moderation_log_action_check
  check (action in (
    'approve', 'reject', 'edit', 'delete', 'create',
    'cms_edit', 'cms_publish', 'cms_media'
  ));

alter table moderation_log
  add column if not exists entity_type text,
  add column if not exists entity_ref text;

create index if not exists idx_moderation_log_entity
  on moderation_log (entity_type, entity_ref);

-- Optional SEO title/description per locale (empty = use site defaults)
alter table countries
  add column if not exists seo_title_uk text,
  add column if not exists seo_title_en text,
  add column if not exists seo_title_ru text,
  add column if not exists seo_description_uk text,
  add column if not exists seo_description_en text,
  add column if not exists seo_description_ru text;
