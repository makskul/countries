# Admin panel setup

## Environment variables

Add to `.env` (see `.env.example`):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

TELEGRAM_BOT_TOKEN=          # optional: review notifications
TELEGRAM_ADMIN_CHAT_ID=
SUPABASE_WEBHOOK_SECRET=
```

`SUPABASE_SERVICE_KEY` is required for admin API routes (bypasses RLS).

## Автоматический деплой БД

Скрипт [`scripts/deploy-db.mjs`](../scripts/deploy-db.mjs) при деплое:

1. Применяет новые SQL-миграции из `supabase/migrations/` (таблица `_schema_migrations`)
2. Запускает seed из `supabase/seed/` (один раз)
3. Опционально создаёт первого superadmin (если заданы `ADMIN_EMAIL` + `ADMIN_PASSWORD`)

### Локально

```bash
# .env с DATABASE_URL
npm run db:deploy
```

### Vercel

В [`vercel.json`](../vercel.json) указано:

```json
{ "buildCommand": "npm run build:deploy" }
```

Добавьте в Vercel → Environment Variables:

| Variable | Назначение |
|----------|------------|
| `DATABASE_URL` | Postgres URI (обязательно для миграций) |
| `SUPABASE_SERVICE_KEY` | service role (для bootstrap admin) |
| `ADMIN_EMAIL` | email первого админа (опционально) |
| `ADMIN_PASSWORD` | пароль (опционально, только первый deploy) |

Если `DATABASE_URL` не задан, скрипт **пропускается** — обычный `nuxt build` не ломается.

### GitHub Actions

Workflow [`.github/workflows/deploy-db.yml`](../.github/workflows/deploy-db.yml) запускается при push в `dev`/`main`, если изменились миграции.

Добавьте secrets в репозитории: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, при необходимости `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

### Что не автоматизируется

- Telegram webhooks — настраиваются вручную один раз
- Supabase Auth «Disable sign ups» — в Dashboard
- Повторное создание админов — только первый `ADMIN_EMAIL`; дальше через Dashboard + SQL

## Database migrations (ручной режим)

Run in order in Supabase SQL Editor (or `npm run db:deploy`):

1. `supabase/migrations/001_reviews.sql` … `003_country_stats.sql` (if not applied)
2. `004_reviews_extend.sql` … `008_rls.sql`
3. Seed: `supabase/seed/countries.sql`

## Supabase Auth

1. Dashboard → Authentication → Providers → enable **Email**
2. Disable public sign-ups (invite-only)
3. Create first user: Authentication → Users → Add user (email + password)

## Grant admin access

After creating the Auth user, insert into `admin_users`:

```sql
INSERT INTO admin_users (id, email, role)
VALUES (
  'UUID-FROM-AUTH-USERS',
  'admin@example.com',
  'superadmin'
);
```

Roles:

| Role | Access |
|------|--------|
| `moderator` | Reviews moderation, dashboard, moderation log |
| `editor` | + cities, countries CMS, newsletter |
| `superadmin` | Full access |

## Telegram webhooks (optional)

- Database Webhook on `reviews` INSERT → `POST /api/webhook/review`
- Telegram bot webhook → `POST /api/webhook/telegram`

Admin panel at `/admin` is the primary moderation UI; Telegram remains a notification channel.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/admin/login`
