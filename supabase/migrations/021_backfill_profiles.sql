-- Backfill profiles for users created before 019 (fixes reviews_user_id_fkey violations)
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
