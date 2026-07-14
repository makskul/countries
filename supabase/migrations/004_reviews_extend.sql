-- Extend reviews for review form + admin moderation
alter table reviews
  add column if not exists stay_purpose text,
  add column if not exists still_there boolean not null default false,
  add column if not exists climate text[],
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid;

-- New reviews require moderation by default
alter table reviews alter column is_approved set default false;

create index if not exists idx_reviews_pending on reviews (created_at desc) where is_approved = false;
