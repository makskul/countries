# Источники данных для ежедневных публикаций Triplandr

Каталог **легальных / пригодных** источников для наполнения канала и SEO-трафика.
Приоритет: **внутренние данные Triplandr** → официальные open data / RSS → курируемые подсказки.
Полный репаблиш чужих статей **запрещён**; только краткая выжимка + атрибуция + ссылка.

Связанные документы: [content-sources.md](./content-sources.md) (seed-факты), [telegram-content-calendar.md](./telegram-content-calendar.md).

---

## Как устроен пайплайн

1. `scripts/daily-content.mjs` собирает кандидата поста на день.
2. Источники (по приоритету):
   - **A)** Supabase: новые approved-отзывы, `country_stats`, hub-статьи, compare-пары
   - **B)** Курируемый календарь / tips из `telegram-content-calendar.md` + empty-state campaign
   - **C)** Опционально 2–3 публичных RSS (только title + link + 1–2 предложения)
3. JSON → `data/content-queue/YYYY-MM-DD.json` (+ `latest.json`)
4. GitHub Action `.github/workflows/daily-content.yml` постит в Telegram (09:00 Киев = 06:00 UTC)

```
[Internal DB] ──┐
[Calendar tips]─┼──► buildDailyCandidates ──► JSON queue ──► Telegram send
[Safe RSS] ─────┘                              │
                                               └── (опц.) weekly newsletter rollup
```

---

## Каталог источников

### Официальные / open data

| Источник | URL | Лицензия / ToS | Тип | Как использовать | Приоритет UA |
|----------|-----|----------------|-----|------------------|--------------|
| **Eurostat** | [ec.europa.eu/eurostat](https://ec.europa.eu/eurostat) | OK (EU open data; указать источник) | stats, cost of living | API / Statistics Explained; цифры-ориентиры в постах и хабах | **Высокий** |
| **Eurostat News** | [News](https://ec.europa.eu/eurostat/web/main/news) | OK + attribution | news / stats | Ручной мониторинг или RSS; коротко + ссылка | Высокий |
| **EU Temporary Protection** | [Consilium](https://www.consilium.europa.eu/), [EUR-Lex](https://eur-lex.europa.eu/) | OK (официальные пресс-релизы) | visa / legal updates | Только официальные даты/формулировки; без «гарантий статуса» | **Критический** |
| **Consilium Press RSS** | [press-releases RSS](https://www.consilium.europa.eu/en/press/press-releases/rss/) | OK + attribution | official news | RSS в пайплайне (title + link) | **Критический** |
| **UNHCR** | [unhcr.org](https://www.unhcr.org/), Ukraine situation | OK (attribution) | diaspora / protection stats | Официальные цифры/дашборды; не копировать отчёты целиком | Высокий |
| **Нацстаты (GUS PL, Destatis DE, ČSÚ CZ…)** | сайты НСО стран | OK (open data / attribution) | stats | Вручную / API где есть; для compare-постов | Средний–высокий |
| **EU migration / home affairs** | [home-affairs.ec.europa.eu](https://home-affairs.ec.europa.eu/) | OK | visa / policy | Ссылки в хабах; мониторинг изменений TPD | Высокий |
| **OECD** | [oecd.org](https://www.oecd.org/) | OK + attribution | cost of living / QoL | Better Life Index и т.п. как ориентир | Средний |
| **World Bank** | [data.worldbank.org](https://data.worldbank.org/) | OK (open data) | stats / economy | Макро-контекст в статьях | Низкий–средний |

### Стоимость жизни

| Источник | URL | Лицензия / ToS | Тип | Как использовать | Приоритет UA |
|----------|-----|----------------|-----|------------------|--------------|
| **Numbeo** | [numbeo.com](https://www.numbeo.com/cost-of-living/) | **Caution / avoid scrape** | cost of living | Только качественные ориентиры; **не** парсить и не копировать таблицы | Средний (осторожно) |
| **OECD / Eurostat PPP** | см. выше | OK | cost of living | Предпочтительная замена Numbeo для цифр | Высокий |

### Новости RSS (диаспора / релокация) — только title + link + краткий пересказ

| Источник | URL / feed | Лицензия / ToS | Тип | Как использовать | Приоритет UA |
|----------|------------|----------------|-----|------------------|--------------|
| **Consilium Press** | `https://www.consilium.europa.eu/en/press/press-releases/rss/` | OK | official EU | Авто-RSS в CI | Высокий |
| **UNHCR News** | `https://www.unhcr.org/rss.xml` | OK + attribution | diaspora / protection | Авто-RSS; фильтр по Ukraine/Europe вручную при курации | Высокий |
| **Euronews / BBC Ukraine** | публичные RSS разделов | **attribution; no full-text** | news | Вручную или RSS **только заголовок + ссылка**; без репаблиша | Средний |
| **Официальные посольства / EUAA** | RSS или пресс-страницы | OK для официальных | diaspora news | Курация вручную; проверять ToS | Высокий (курация) |

> Пайплайн по умолчанию тянет только **Consilium** + **UNHCR** (официальные). Остальное — вручную или после явной проверки ToS.

### Внутренние источники Triplandr (приоритет №1)

| Источник | Где лежит | ToS | Тип | Как использовать | Приоритет |
|----------|-----------|-----|-----|------------------|-----------|
| **country_stats** | Supabase | OK (свои) | stats / social proof | «N отзывов украинцев о PL» | **Наивысший** |
| **Новые approved reviews** | `reviews` | OK | UGC | Счётчик за 7 дней + CTA написать отзыв | **Наивысший** |
| **Compare pairs** | `app/data/comparePairs.ts` | OK | SEO pages | Ротация «сравнение дня» → `/uk/compare/…?nat=UA` | **Наивысший** |
| **Empty-state campaign** | `app/data/emptyStateCampaign.ts` | OK | review supply | Spotlight стран с 0 UA-отзывов | Высокий |
| **Hub articles** | CMS / migration 018 | OK | long-form | Ссылки на `/uk/country/pl?nat=UA` и т.д. | Высокий |
| **Telegram calendar tips** | `docs/telegram-content-calendar.md` | OK | tips | Статические слоты + ежедневная ротация | Высокий |

### Чего избегать

| Практика | Почему |
|----------|--------|
| Scraping Numbeo / Mercer / платных рейтингов | ToS / copyright |
| Полный текст чужих новостей / статей | copyright |
| Непроверенные «гарантии визы/статуса» | юридический риск + доверие |
| Платные отчёты EIU/Mercer без лицензии | proprietary |

---

## Схема элемента публикации

```ts
type ContentItem = {
  id: string              // e.g. "2026-09-03-compare-pl-de"
  date: string            // YYYY-MM-DD (календарный день Europe/Kyiv)
  type: 'compare' | 'empty_country' | 'hub' | 'reviews_digest' | 'tip' | 'rss'
  locale: 'uk' | 'en' | 'ru'   // TG primary = uk
  title: string
  body: string
  cta_url: string
  source: string          // "triplandr" | feed URL | "calendar"
  tags: string[]
  country_codes: string[]
}
```

Типы и newsletter rollup: `server/utils/contentQueue.ts`.
JSON-выход: `data/content-queue/YYYY-MM-DD.json`, зеркало `data/content-queue/latest.json`.

---

## Secrets / включение

| Переменная | Где | Назначение |
|------------|-----|------------|
| `TELEGRAM_BOT_TOKEN` | GitHub Actions + `.env` | Существующий бот |
| `TELEGRAM_CONTENT_CHAT_ID` | GitHub Actions + `.env` | Канал/чат для контента (рекомендуется) |
| `TELEGRAM_ADMIN_CHAT_ID` | fallback | Если content chat не задан — постить в admin (для тестов) |
| `SUPABASE_URL` | CI (опц.) | Внутренняя статистика |
| `SUPABASE_SERVICE_KEY` | CI (опц.) | Чтение reviews / country_stats / hubs |
| `CONTENT_RSS_ENABLED` | `1` / `0` | Включить безопасные RSS (по умолчанию вкл.) |

См. также `.env.example`.

### Локально

```bash
# собрать пост на сегодня (без отправки) + печать Telegram payload
npm run content:daily -- --dry-run

# записать JSON в data/content-queue/
npm run content:daily -- --write

# отправить в Telegram (нужны TELEGRAM_* в .env)
npm run content:daily -- --post

# очередь на 7 дней (для превью / newsletter rollup)
npm run content:daily -- --days=7 --write
```

### GitHub Actions

- Workflow: `.github/workflows/daily-content.yml`
- Cron: `0 6 * * *` (06:00 UTC ≈ 09:00 Europe/Kyiv)
- `workflow_dispatch` с `dry_run=true` — только лог payload, без send

Secrets в репозитории: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CONTENT_CHAT_ID` (и опционально Supabase).

---

## Top-10 shortlist (быстрый старт)

1. Внутренние compare pages + `?nat=UA`
2. Empty-state countries (кампания IS…BG)
3. Hub articles PL/DE/CZ (+ excerpt hubs)
4. `country_stats` / счётчик новых UA-отзывов
5. EU Temporary Protection (Consilium / EUR-Lex)
6. Eurostat PPP / price levels
7. Consilium Press RSS
8. UNHCR Ukraine / Europe updates
9. Национальные stat offices (PL/DE/CZ) — вручную для compare
10. OECD Better Life — качественный контекст (не scrape Numbeo)

---

## i18n

- Telegram: **uk** как primary.
- en/ru — поздняя ротация тем же `ContentItem` с другим `locale` / отдельными каналами.
- CTA URL всегда с префиксом локали: `/uk/…`, `/en/…`, `/ru/…`.
