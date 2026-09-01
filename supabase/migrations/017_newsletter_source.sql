-- Ensure newsletter_subscribers.source exists (idempotent for older DBs)
alter table newsletter_subscribers
  add column if not exists source text not null default 'footer';
