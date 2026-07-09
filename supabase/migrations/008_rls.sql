-- Enable RLS on content tables
alter table reviews enable row level security;
alter table cities enable row level security;
alter table countries enable row level security;
alter table newsletter_subscribers enable row level security;
alter table admin_users enable row level security;
alter table moderation_log enable row level security;

-- Reviews: public read approved only, anyone can submit
drop policy if exists reviews_select_approved on reviews;
create policy reviews_select_approved on reviews
  for select using (is_approved = true);

drop policy if exists reviews_insert_anon on reviews;
create policy reviews_insert_anon on reviews
  for insert with check (true);

-- Cities & countries: public read
drop policy if exists cities_select_public on cities;
create policy cities_select_public on cities for select using (true);

drop policy if exists countries_select_public on countries;
create policy countries_select_public on countries for select using (true);

-- Newsletter: public insert
drop policy if exists newsletter_insert_public on newsletter_subscribers;
create policy newsletter_insert_public on newsletter_subscribers
  for insert with check (true);

-- Admin tables: no public access (service role bypasses RLS)
drop policy if exists admin_users_deny_all on admin_users;
create policy admin_users_deny_all on admin_users for all using (false);

drop policy if exists moderation_log_deny_all on moderation_log;
create policy moderation_log_deny_all on moderation_log for all using (false);
