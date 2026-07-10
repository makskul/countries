# Admin panel setup

## Что нужно без доступа к Supabase Dashboard

| Переменная | Откуда взять | Зачем |
|------------|--------------|-------|
| `SUPABASE_URL` | уже есть | API + auth |
| `SUPABASE_KEY` | уже есть | клиент сайта |
| `SUPABASE_SERVICE_KEY` | уже есть | admin API, bootstrap админа |
| `SUPABASE_DB_PASSWORD` | **один раз у владельца проекта** | SQL-миграции |
| `ADMIN_EMAIL` + `ADMIN_PASSWORD` | придумываете сами | первый вход в `/admin/login` |

**Service key ≠ пароль базы.** Миграции идут через Postgres (`pg`), для этого нужен `SUPABASE_DB_PASSWORD` или готовый `DATABASE_URL`.

Попросите владельца Supabase: *Settings → Database → Database password* (или «Reset database password» и передать новый пароль).

---

## Автоматический деплой БД

Скрипт [`scripts/deploy-db.mjs`](../scripts/deploy-db.mjs) при каждом деплое:

1. Подключается к Postgres (`DATABASE_URL` или `SUPABASE_DB_PASSWORD` + `SUPABASE_URL`)
2. Применяет новые SQL из `supabase/migrations/` (таблица `_schema_migrations`)
3. Запускает seed из `supabase/seed/` (один раз)
4. Создаёт первого superadmin через **Auth Admin API** (без Dashboard)

### Проверка локально

```bash
# .env с SUPABASE_DB_PASSWORD (+ ADMIN_EMAIL/PASSWORD для bootstrap)
npm run db:status   # список применённых / ожидающих миграций
npm run db:deploy   # применить
```

### Vercel (основной путь)

В [`vercel.json`](../vercel.json):

```json
{ "buildCommand": "npm run build:deploy" }
```

**Environment Variables** (Production + Preview):

| Variable | Обязательно |
|----------|-------------|
| `SUPABASE_URL` | да |
| `SUPABASE_KEY` | да |
| `SUPABASE_SERVICE_KEY` | да |
| `SUPABASE_DB_PASSWORD` | да (для миграций) |
| `ADMIN_EMAIL` | да (первый deploy) |
| `ADMIN_PASSWORD` | да (первый deploy) |

После первого успешного деплоя `ADMIN_PASSWORD` можно убрать из Vercel — админ уже создан.

Если direct `:5432` с Vercel не коннектится, добавьте:

```env
SUPABASE_DB_REGION=eu-central-1   # регион из Supabase → Database → Connection string
```

Миграции на Vercel **не валят** деплой приложения, если БД недоступна (в логах будет warning). Чтобы сборка падала при ошибке миграций, задайте `DB_DEPLOY_STRICT=1` (так работает GitHub Actions CI).

### GitHub Actions (запасной путь)

Workflow [`.github/workflows/deploy-db.yml`](../.github/workflows/deploy-db.yml) — при push в `dev`/`main`, если менялись миграции, или вручную (*Actions → Deploy database → Run workflow*).

**Repository secrets:**

- `DATABASE_URL` **или** `SUPABASE_DB_PASSWORD` + `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (первый раз)

---

## Ручной режим (если есть SQL Editor)

1. `supabase/migrations/001` … `008`
2. `supabase/seed/countries.sql`
3. Создать пользователя в Auth + `INSERT INTO admin_users` (см. ниже)

---

## Supabase Auth (если есть Dashboard)

1. Authentication → Providers → **Email**
2. Disable public sign-ups
3. Users → Add user — **или** положитесь на `ADMIN_EMAIL`/`ADMIN_PASSWORD` при деплое

## Grant admin access (ручной SQL)

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
| `moderator` | Reviews, dashboard, moderation log |
| `editor` | + cities, countries CMS, newsletter |
| `superadmin` | Full access |

## Telegram webhooks (optional)

- Database Webhook on `reviews` INSERT → `POST /api/webhook/review`
- Telegram bot webhook → `POST /api/webhook/telegram`

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/admin/login`
