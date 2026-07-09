create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null default 'moderator'
    check (role in ('moderator', 'editor', 'superadmin')),
  created_at timestamptz not null default now()
);

create table if not exists moderation_log (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references reviews(id) on delete set null,
  admin_id uuid references admin_users(id) on delete set null,
  action text not null check (action in ('approve', 'reject', 'edit', 'delete', 'create')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_moderation_log_created on moderation_log (created_at desc);
create index if not exists idx_moderation_log_review on moderation_log (review_id);
