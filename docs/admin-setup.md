# Admin panel + DB migrations

## Блокер: service key ≠ доступ к SQL

| Ключ | Что даёт | Миграции? |
|------|----------|-----------|
| `SUPABASE_KEY` / publishable | чтение/запись через API + RLS | нет |
| `SUPABASE_SERVICE_KEY` | API без RLS, Auth Admin, bootstrap админа | **нет** |
| `SUPABASE_DB_PASSWORD` / `DATABASE_URL` | прямой Postgres | **да** |
| `SUPABASE_ACCESS_TOKEN` (`sbp_…`) | Management API → выполнить SQL | **да** |

Сейчас в `.env` есть service key и `ADMIN_*`, но **нет** ни пароля БД, ни access token — поэтому `db:deploy` пропускает миграции.

---

## Что попросить у владельца Supabase (один раз)

**Вариант A — проще для вас (рекомендуется):**

> Создай Personal Access Token:  
> https://supabase.com/dashboard/account/tokens → Generate new token  
> Пришли значение `sbp_…` (можно отозвать после деплоя).

Добавьте в `.env` и в Vercel / GitHub secrets:

```env
SUPABASE_ACCESS_TOKEN=sbp_...
```

**Вариант B — пароль базы:**

> Settings → Database → Database password (или Reset)  
> + регион из Connection string (например `eu-central-1`)

```env
SUPABASE_DB_PASSWORD=...
SUPABASE_DB_REGION=eu-central-1
```

---

## Локально применить миграции

```bash
# после добавления SUPABASE_ACCESS_TOKEN или SUPABASE_DB_PASSWORD в .env
npm run db:status
npm run db:deploy
```

Скрипт сам читает `.env`. Сделает:

1. `_schema_migrations` + SQL из `supabase/migrations/`
2. seed из `supabase/seed/`
3. первого superadmin (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) через Auth Admin API

---

## Vercel

`vercel.json` → `buildCommand: npm run build:deploy` (= `db:deploy` + `nuxt build`).

| Variable | Обязательно |
|----------|-------------|
| `SUPABASE_URL` | да |
| `SUPABASE_KEY` | да |
| `SUPABASE_SERVICE_KEY` | да |
| `SUPABASE_ACCESS_TOKEN` **или** `SUPABASE_DB_PASSWORD` (+ `SUPABASE_DB_REGION`) | да для миграций |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | да (первый раз) |

Без DB-кредов сборка приложения **не падает**, но схемы не будет — в логах будет явный skip.

Чтобы падать при ошибке миграций: `DB_DEPLOY_STRICT=1`.

---

## GitHub Actions

[`.github/workflows/deploy-db.yml`](../.github/workflows/deploy-db.yml) — push в `dev`/`main` при изменении миграций, или вручную.

Secrets: `SUPABASE_URL`, `SUPABASE_ACCESS_TOKEN` **или** `SUPABASE_DB_PASSWORD` (+ region), `SUPABASE_SERVICE_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

---

## Роли админки

| Role | Access |
|------|--------|
| `moderator` | Reviews, dashboard, moderation log |
| `editor` | + cities, countries CMS, newsletter |
| `superadmin` | Full |

Вход: `/admin/login`

## Как править контент (для редактора)

1. **Статья о стране** — Админка → «Страны и статьи» → карандаш → блок «Статья о стране» (UK / EN / RU). Кнопки **EN → UK / EN → RU** копируют черновик. Справа — превью «как на сайте». Переключатель **«Показывать статью на сайте»** скрывает блок без удаления текста.
2. **Картинка страны** — в карточке страны кнопка **Загрузить** (JPEG/PNG/WebP/GIF до 5 МБ) или вставка URL.
3. **Статья о городе** — «Города» → карандаш → тот же редактор статьи.
4. **Отзывы** — фильтры: статус, демо/реальные, страна, национальность, поиск по городу. Кнопки **Скрыть все демо** / **Удалить все демо**.
5. **Справка / виза** — в карточке страны блоки «Основные данные» и «Виза».

Подробнее про источники демо-текстов: [`content-sources.md`](content-sources.md).

## Демо-контент (статьи + отзывы)

Синтетическое наполнение на базе публичных источников — см. [`docs/content-sources.md`](content-sources.md).

```bash
npm run db:deploy          # миграции (в т.ч. article_* и FK)
npm run content:generate   # facts → supabase/seed/generated/
npm run db:seed-content    # города + статьи + 120+ отзывов
```

## Telegram (optional)

- Database Webhook on `reviews` INSERT → `POST /api/webhook/review`
- Telegram bot webhook → `POST /api/webhook/telegram`
