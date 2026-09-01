# Budget Game — продуктово-технический roadmap (Triplandr)

> **Статус:** черновик плана · **Дата:** сентябрь 2026  
> **Контекст:** Triplandr — платформа отзывов экспатов (страны/города, compare, рейтинги по категориям). Budget Game — интерактивная геймификация для оценки и сравнения стоимости жизни за рубежом vs ожидания пользователя.

---

## 1. Executive summary

**Budget Game** («Бюджетный челлендж» / «Угадай свой бюджет») — короткая интерактивная сессия (3–5 мин), где пользователь вводит свой месячный бюджет и образ жизни, выбирает целевую страну/город, а система показывает:

1. **Прогноз расходов** по категориям (жильё, еда, транспорт, страховка, «прочее»).
2. **Gap score** — насколько ожидания расходятся с моделью Triplandr и отзывами сообщества.
3. **Shareable result** — карточка для Telegram / OG с «ваш бюджет vs реальность в {город}».
4. **Следующие шаги** — compare, отзывы, affiliate (Wise, страховка, жильё).

Фича усиливает существующие активы: `cost_level`, `avg_cost_of_living`, compare-пары, UA-контент-хабы, affiliate-слоты. Не дублирует Numbeo — позиционируется как **«сообщество + ваш сценарий»**, с явным disclaimer.

**MVP (4–6 недель):** анонимный калькулятор-квиз на `/budget/` + результат с share-ссылкой + 3 indexable landing-страницы (PL, DE, CZ).  
**v2 (8–12 недель):** leaderboard, сохранение сессий, city-level данные, remittance-партнёры, Telegram bot deep link.

---

## 2. Проблема и ценность

### 2.1 Jobs-to-be-done

| JTBD | Как Budget Game помогает |
|------|--------------------------|
| «Хватит ли мне €X в {стране}?» | Калькулятор с breakdown по категориям |
| «Я думал, что Польша дешёвая — правда ли?» | Gap между ожиданием (cost_level / медиа) и вводом пользователя |
| «Сравнить 2 города по моему бюджету» | Режим compare-budget (связка с `/compare/`) |
| «Поделиться с друзьями / в чате» | Shareable card + Telegram |
| «Понять, куда дальше копать» | CTA → country page, review, affiliate |

### 2.2 Метрики успеха (North Star + воронка)

| Метрика | MVP target (90 дней) | v2 target |
|---------|----------------------|-----------|
| `budget_session_start` / week | 200 | 800 |
| Completion rate (start → result) | ≥55% | ≥65% |
| Share rate (result → share click) | ≥12% | ≥20% |
| CTR на country/compare после result | ≥25% | ≥35% |
| `affiliate_click` из slot `budget` | baseline | +15% EPC vs sidebar |
| Отзывы с source `budget_game` | 5% новых reviews | 10% |

---

## 3. Core loop & UX

### 3.1 Общая схема core loop

```
[Entry] → [Profile] → [Budget input] → [Destination] → [Reveal] → [Share / CTA]
   ↑                                                                      │
   └──────────────────── «Попробовать другую страну» ←─────────────────────┘
```

### 3.2 Режимы игры (по приоритету)

#### Режим A — «Budget Reality Check» (MVP, основной)

**Формат:** guided quiz + calculator (не чистый quiz — пользователь вводит реальные цифры).

| Шаг | Экран | Детали UX |
|-----|-------|-----------|
| 0 | Landing `/budget/` | Hero: «Проверь, хватит ли твоего бюджета в …». CTA «Начать». Featured: PL, DE, CZ cards. |
| 1 | Профиль | Национальность (prefill из `useUserStore.nationality`), семейный статус (solo / couple / family+1 child), тип дохода (remote EU / local / savings). |
| 2 | Бюджет | Слайдер + input: **net monthly budget** в EUR (default) с конвертацией из UAH/USD/PLN. Опционально: «сколько готов на жильё» (% или €). |
| 3 | Направление | Country Select (PrimeVue, как compare) → опционально City (top cities by population из `cities`). Quick picks: PL, DE, CZ, ES, PT, GE. |
| 4 | Lifestyle toggles | 3–4 бинарных: готовить дома / eating out, центр vs outskirts, машина / transit, private vs public healthcare expectation. |
| 5 | Reveal | Animated «meter»: surplus / tight / deficit. Breakdown bars. **Gap score** 0–100. Community insight block. |
| 6 | Result actions | Share, Compare with origin country, Read reviews, Affiliate block, «Save» (v2). |

**Gamification без токсичности:** не «вы проиграли», а «ваш бюджет покрывает ~78% типичных расходов в Kraków для профиля remote-solo».

#### Режим B — «Guess the City» (v1.5, viral)

Показываем breakdown без названия города → пользователь угадывает из 4 вариантов.  
Очки за точность + streak. Leaderboard weekly (anon nickname).  
**SEO:** `/budget/quiz/` — отдельная indexable страница.

#### Режим C — «Budget Compare Duel» (v2)

Два города / две страны side-by-side на **одном** пользовательском бюджете.  
Deep link: `/budget/compare/pl-krakow-vs-cz-prague?budget=2500&nat=UA`.  
Связка с существующим `/compare/[pair]` — cross-link, не замена.

### 3.3 Gap score — формула (продуктовая)

```
gap_score = weighted_avg(
  |user_rent_pct - model_rent_pct|,
  |user_total - model_total| / model_total,
  |user_lifestyle_index - community_cost_rating|
)
```

- `community_cost_rating` — inverse map из `avg_cost_of_living` (1=дорого → 5=дёшево) и `cost_level`.
- Отображение: «Вы недооценили жильё на ~€340/мес» / «Вы близки к отзывам украинцев в PL».

### 3.4 UI-компоненты (переиспользование)

| Существующее | Использование в Budget Game |
|--------------|----------------------------|
| `Select` + `countryList` из `useLocalizedCountries` | Выбор страны/города |
| `costOptions` из `common.costOptions` | Lifestyle / community scale labels |
| `getCostLabel` / `getCostClass` из `useComparePage` | Badges cost_level на result |
| `AffiliatePartnerLinks` | Slot `budget` (новый) |
| `PartnerDisclosure` | Обязателен на result |
| `WriteFirstBanner` pattern | «Помогите уточнить данные — напишите отзыв» |
| Progress stepper | Новый `BudgetGameStepper.vue` |

### 3.5 Wireframe-описание Result screen

```
┌─────────────────────────────────────────────────────────┐
│  🇵🇱 Kraków · solo · remote · €2 400/мес                │
│  ━━━━━━━━━━━━━━━●━━━━━━━━  78% coverage                 │
│  ⚠️ Жильё: вы заложили €800, модель €1 050 (+€250)     │
├─────────────────────────────────────────────────────────┤
│  [Rent ████████░░] [Food ██████░░░░] [Transit ░░] ...  │
├─────────────────────────────────────────────────────────┤
│  💬 Сообщество: avg cost_of_living 4.2/5 (UA, n=12)    │
│  📊 cost_level страны: low · валюта PLN                 │
├─────────────────────────────────────────────────────────┤
│  [Поделиться] [Сравнить с UA→PL] [Отзывы о PL]         │
│  Affiliate: Wise · SafetyWing                           │
│  Disclaimer: оценка, не финсовет                        │
└─────────────────────────────────────────────────────────┘
```

### 3.6 Leaderboard (v2)

| Поле | Описание |
|------|----------|
| Тип | Weekly « smallest gap wins » или « most countries tested » |
| Идентификация | Anon `display_name` + optional email; auth не обязателен |
| Anti-cheat | Rate limit по IP/fingerprint; min session duration 45s |
| Moderation | Report button; admin hide |

Не финансовый leaderboard («кто больше заработал») — **engagement** leaderboard.

### 3.7 Shareable result

- **URL:** `/budget/result/{share_id}` — SSR для OG.
- **Query fallback (MVP):** `/budget/result?c=PL&city=krakow&budget=2400&gap=78` (encoded, signed hash optional).
- **OG image:** `@nuxt/og-image` или edge function `og/budget/[id].png` — budget meter + flags.
- **Telegram:** `t.me/share/url` + prepared text из locale.
- **Copy formats:** «Мой бюджет €2400 в Kraków — Triplandr говорит, жильё съест на €250 больше → {link}»

---

## 4. Связь с существующими данными

### 4.1 `cost_level` (страна)

**Источник:** `countries.cost_level` ∈ `low | medium | high | very_high`; дублируется в `app/utils/countryMeta.ts` (`COUNTRY_META`).

**Использование в Budget Game:**

| cost_level | Базовый мультипликатор к EU median (EUR) | Примечание |
|------------|------------------------------------------|------------|
| low | 0.55–0.70 | PL, BG, HU, RO |
| medium | 0.75–0.95 | CZ, ES, PT, IT |
| high | 1.00–1.25 | DE, FR, GB |
| very_high | 1.30–1.60 | CH, NO, IE, NL |

- На **country result** — badge как на compare (`getCostClass`).
- В **модели** — anchor для total budget когда нет city data.
- **Disclaimer:** «грубая классификация редактора; уточняйте по отзывам».

### 4.2 `avg_cost_of_living` (отзывы)

**Источник:** `country_stats.avg_cost_of_living`, `city_stats.avg_cost_of_living` — среднее `ratings.cost_of_living` (1–5).

**Маппинг на модель** (калибровка MVP):

| Rating | Интерпретация | Коррекция модели |
|--------|---------------|------------------|
| 5 | Очень дёшево | −12% к rent+food |
| 4 | Дёшево | −6% |
| 3 | Комфортно | baseline |
| 2 | Дороговато | +8% |
| 1 | Очень дорого | +15% |

- Фильтр по `author_nationality` (как compare `?nat=UA`) — **приоритет UA cohort** если n≥3, иначе fallback all nat.
- Показывать `n` отзывов: «на основе 12 отзывов украинцев» vs «общие данные, мало UA-отзывов».

### 4.3 Compare pages

**Существующее:** `/compare/[pair]`, `COMPARE_PAIRS`, категория `cost_of_living` в `COMPARE_CATEGORIES`.

**Интеграция:**

1. **Entry:** блок на compare page — «Проверь *свой* бюджет в {A} и {B}» → `/budget/compare?a=PL&b=DE`.
2. **Exit:** result → «Полное сравнение PL vs DE» → `/compare/pl-vs-de?nat=UA`.
3. **SEO cluster:** compare title дополняется FAQ schema link на `/budget/pl` (не cannibalize — разный intent: «отзывы» vs «калькулятор»).
4. **Winner logic:** не использовать `isWinner('cost_of_living')` для budget — у пользователя свой бюджет.

### 4.4 Review comments (NLP-lite, v2)

Seed-отзывы содержат паттерны: «оренда з'їла більшість бюджету», «Eurostat ~115% EU».

**v2:** regex/keyword extraction из `comments.cost_of_living` для city hints (rent stress factor).  
**MVP:** не парсим — только aggregate rating.

### 4.5 Cities

**Источник:** `cities` + `city_stats`.

- MVP: city picker для top-5 cities by population per hub country.
- v2: полная таблица `city_cost_profiles` (см. §5).

---

## 5. Data model (Supabase)

### 5.1 ER-диаграмма (целевая)

```
countries (existing)
    │
    ├── city_cost_profiles (new) ── cities (existing)
    │
budget_sessions (new)
    │
    ├── budget_session_shares (new, optional MVP via query)
    │
budget_user_profiles (new, v2, optional auth link)
```

### 5.2 Таблица `city_cost_profiles`

Базовые месячные ориентиры в EUR (net), редактируемые в admin.

```sql
-- migration 019_budget_game.sql (draft)
create table if not exists city_cost_profiles (
  id uuid primary key default gen_random_uuid(),
  city_id integer not null references cities(id) on delete cascade,
  profile_key text not null default 'default', -- 'solo_remote', 'family_local', ...
  currency text not null default 'EUR',
  rent_studio_center_eur numeric(10,2),
  rent_1br_center_eur numeric(10,2),
  rent_1br_outskirts_eur numeric(10,2),
  food_monthly_eur numeric(10,2),
  transport_monthly_eur numeric(10,2),
  utilities_monthly_eur numeric(10,2),
  insurance_monthly_eur numeric(10,2),
  misc_monthly_eur numeric(10,2),
  data_source text,          -- 'manual', 'numbeo_snapshot', 'community_calibrated'
  source_url text,
  valid_from date not null default current_date,
  valid_until date,
  updated_at timestamptz not null default now(),
  unique (city_id, profile_key, valid_from)
);

create index idx_city_cost_profiles_city on city_cost_profiles(city_id);
```

**MVP seed:** 15 городов × 1 profile (`solo_remote`) — PL (Warsaw, Kraków, Wrocław), DE (Berlin, Munich), CZ (Prague, Brno), ES (Barcelona, Valencia), PT (Lisbon), GE (Tbilisi), UA origin baseline (Kyiv — для compare-from).

### 5.3 Таблица `country_cost_fallback`

Когда city profile отсутствует — fallback на country-level.

```sql
create table if not exists country_cost_fallback (
  country_code text primary key references countries(code),
  rent_pct_of_budget numeric(4,3) not null default 0.35,  -- типичная доля жилья
  food_pct numeric(4,3) not null default 0.20,
  transport_pct numeric(4,3) not null default 0.08,
  utilities_pct numeric(4,3) not null default 0.07,
  insurance_pct numeric(4,3) not null default 0.05,
  misc_pct numeric(4,3) not null default 0.25,
  base_monthly_eur numeric(10,2) not null,  -- median для cost_level
  updated_at timestamptz not null default now()
);
```

Инициализация из `cost_level` + `COUNTRY_META`.

### 5.4 Таблица `budget_sessions`

```sql
create table if not exists budget_sessions (
  id uuid primary key default gen_random_uuid(),
  share_slug text unique,                    -- короткий id для OG URL
  created_at timestamptz not null default now(),

  -- anon identity
  visitor_id text,                           -- cookie nv_budget_vid
  user_id uuid references auth.users(id),    -- null в MVP

  author_nationality text,
  origin_country text,                       -- откуда переезжает (optional)
  target_country text not null,
  target_city_id integer references cities(id),

  -- inputs
  monthly_budget_eur numeric(10,2) not null,
  budget_currency text not null default 'EUR',
  household text not null default 'solo',    -- solo | couple | family
  income_type text,                          -- remote | local | savings
  lifestyle jsonb not null default '{}',

  -- outputs (computed server-side)
  model_total_eur numeric(10,2),
  model_breakdown jsonb,                     -- { rent, food, transport, ... }
  coverage_pct numeric(5,2),               -- 0-100+
  gap_score numeric(5,2),
  community_cost_rating numeric(3,2),
  community_sample_size integer default 0,

  -- attribution
  source text not null default 'budget_landing',  -- budget_landing | compare | country | telegram
  locale text not null default 'uk',
  completed boolean not null default false,
  shared boolean not null default false
);

create index idx_budget_sessions_created on budget_sessions(created_at desc);
create index idx_budget_sessions_target on budget_sessions(target_country, target_city_id);
create index idx_budget_sessions_share on budget_sessions(share_slug) where share_slug is not null;
```

### 5.5 Таблица `budget_user_profiles` (v2)

```sql
create table if not exists budget_user_profiles (
  id uuid primary key default gen_random_uuid(),
  visitor_id text unique,
  user_id uuid unique references auth.users(id),
  saved_budgets jsonb not null default '[]',  -- last 5 scenarios
  display_name text,
  leaderboard_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 5.6 RLS policies

| Таблица | SELECT | INSERT | UPDATE |
|---------|--------|--------|--------|
| `city_cost_profiles` | public read | admin | admin |
| `country_cost_fallback` | public read | admin | admin |
| `budget_sessions` | public by `share_slug` only | public (anon) | service role |
| `budget_user_profiles` | owner (visitor_id / user_id) | owner | owner |

**Принцип:** не хранить email в sessions; PII минимум.

### 5.7 Edge Function: `budget-calculate`

```
POST /functions/v1/budget-calculate
Body: { target_country, target_city_id?, monthly_budget_eur, household, lifestyle, author_nationality? }
Response: { model_total_eur, breakdown, coverage_pct, gap_score, community, disclaimers[] }
```

**Зачем server-side:** единая формула, не expos'ить calibration constants, rate limit, audit log.

**Альтернатива MVP:** `server/api/budget/calculate.post.ts` в Nuxt — достаточно для старта.

---

## 6. Auth: anonymous vs logged-in

### 6.1 Текущее состояние Triplandr

- Нет публичной регистрации пользователей.
- `useUserStore`: nationality + favorites в localStorage/cookie.
- Admin auth через Supabase отдельно.

### 6.2 Рекомендация по фазам

| Функция | MVP | v2 |
|---------|-----|-----|
| Пройти игру | ✅ anon | ✅ anon |
| Share link | ✅ anon (session id) | ✅ |
| История сессий (local) | ✅ localStorage last 3 | ✅ |
| Cloud save сценариев | ❌ | ✅ optional email magic link |
| Leaderboard | ❌ | ✅ anon nickname |
| Привязка к favorites | ✅ client-side | ✅ |

**Cookie `nv_budget_vid`:** UUID, 1 year, SameSite=Lax — как `nv_nationality`.

**Logged-in (v2):** Supabase anonymous auth или magic link только при «Сохранить навсегда» — не блокировать воронку.

### 6.3 Merge при login

Если позже появится auth: merge `visitor_id` sessions → `user_id` (одноразовый token в email link).

---

## 7. Monetization hooks

### 7.1 Расширение `app/utils/partners.ts`

Добавить vertical и slot:

```typescript
export type PartnerVertical = 'visa' | 'insurance' | 'housing' | 'banking' | 'remittance'
export type PartnerSlot = 'sidebar' | 'compare' | 'map' | 'budget'
```

**Новые партнёры (draft config):**

| slug | vertical | slot | Trigger на result |
|------|----------|------|-------------------|
| `wise` (existing) | banking | budget | «Открыть multi-currency счёт» — если target≠origin currency |
| `revolut` | banking | budget | alt A/B |
| `remitly` | remittance | budget | если origin=UA и budget currency UAH |
| `safetywing` (existing) | insurance | budget | если insurance line >0 или household=family |
| `housingAnywhere` (existing) | housing | budget | если rent gap >15% |

### 7.2 Контекстные правила показа

```typescript
interface BudgetPartnerContext extends PartnerContext {
  rentGapPct?: number
  originCountry?: string
  targetCountry?: string
  incomeType?: string
}
```

- **Rent gap high** → housing partner first.
- **Cross-border** → Wise/Remitly.
- **Family** → SafetyWing priority.

### 7.3 A/B testing

Расширить `nv_aff_ab` или отдельный cookie `nv_budget_aff`:  
`wise_first` vs `housing_first` на result screen.  
Track: `affiliate_click` с `placement: 'budget'`, `ab_variant`.

### 7.4 Lead gen

Не дублировать `LeadForm` на каждом шаге.  
На result при **deficit >20%:** soft CTA «Получить чек-лист релокации» → email → `leads` table с `source: 'budget_game'`.

### 7.5 Disclosure

`PartnerDisclosure` + locale string: «Калькулятор носит оценочный характер. Ссылки на партнёров — affiliate.»  
Link → `/about/monetization`.

---

## 8. Viral & share mechanics

### 8.1 Telegram

| Механика | Детали |
|----------|--------|
| Share URL | `https://t.me/share/url?url={encoded}&text={hook}` |
| Channel posts | Новый slot в `docs/telegram-content-calendar.md`: «Budget challenge недели» |
| Deep link | `https://triplandr.com/uk/budget/?country=PL&utm_source=telegram&utm_campaign=budget_w12` |
| Bot (v2) | `/budget` command → inline buttons выбора страны |

**UA diaspora hooks:**

- «Скільки треба на життя в Kraków у 2026? Перевір свій бюджет»
- «€2000 в Berlin — myth or reality?»
- «Порівняй свій бюджет: Warsaw vs Prague»

### 8.2 OG cards

**MVP:** статический template og-image с параметрами:
- Flags target + origin
- Budget amount
- Coverage bar (78%)
- Triplandr logo

**Tech:** `nuxt-og-image` route `/budget/result/__og.png?` или Supabase Edge + Satori.

**Размеры:** 1200×630; locale-specific title in OG meta.

### 8.3 Referral loop (v2)

«Пригласи друга — сравните бюджеты» — shared compare link с двумя `share_slug` side by side.  
Без денежных referral — только social proof.

### 8.4 UGC prompt

После share click: «Насколько точной была оценка?» 1-tap survey → feeds calibration (v2).

---

## 9. Content strategy (UA diaspora)

### 9.1 Углы контента

| Угол | Пример | Канал |
|------|--------|-------|
| Страна-хаб | «Бюджет украинца в Польше 2026» | `/budget/pl` SEO + hub article link |
| Compare narrative | «Warsaw vs Berlin на €2500» | Telegram + `/budget/compare/...` |
| Myth busting | «Португалия не всегда дешевле Польши» | Blog excerpt in hub |
| Origin contrast | «Kyiv vs emigration» | Emotional hook для UA audience |
| Visa + budget | «После легализации: реальный бюджет» | Cross-link legalization reviews |

### 9.2 Локали

| Locale | Приоритет | Tone |
|--------|-----------|------|
| uk | P0 | Основной, «ти», diaspora |
| ru | P0 | Зеркало для RU-speaking expats |
| en | P1 | Remote workers, broader SEO |

### 9.3 Связь с content hubs

`CONTENT_HUB_COUNTRIES`: PL, DE, CZ, ES, PT, GE, TR, TH — первые budget landing pages.

На hub country pages (`CountryHubSection`): embed «Budget checker» CTA.

### 9.4 Editorial calendar ( первые 8 недель )

| Неделя | Telegram | SEO page | Compare tie-in |
|--------|----------|----------|----------------|
| W1 | Launch PL | `/budget/pl` | pl-vs-de |
| W2 | Kraków focus | `/budget/pl/krakow` | — |
| W3 | DE Berlin | `/budget/de` | pl-vs-de |
| W4 | CZ Prague | `/budget/cz` | pl-vs-cz |
| W5 | ES Valencia digital nomad | `/budget/es` | — |
| W6 | PT Lisbon | `/budget/pt` | es-vs-pt |
| W7 | GE Tbilisi | `/budget/ge` | ge-vs-de |
| W8 | User stories roundup | `/budget/` refresh | — |

---

## 10. Technical stack fit

### 10.1 Frontend (Nuxt 3)

| Артефакт | Path | Notes |
|----------|------|-------|
| Landing | `app/pages/budget/index.vue` | SSR, i18n |
| Wizard | `app/pages/budget/play.vue` | Client-heavy, `<NuxtLayout name="minimal">` optional |
| Result | `app/pages/budget/result/[slug].vue` | SSR для OG |
| Country SEO | `app/pages/budget/[country].vue` | Static paths from hub list |
| City SEO | `app/pages/budget/[country]/[city].vue` | v1.5 |
| Compare budget | `app/pages/budget/compare.vue` | v2 |
| Composable | `app/composables/useBudgetGame.ts` | State machine |
| Utils | `app/utils/budgetModel.ts` | Pure functions + tests |
| Data | `app/data/budgetHubCountries.ts` | mirrors content hub |
| Locales | `app/locales/*/budget.ts` | |
| Components | `app/components/budget/*` | Stepper, Meter, BreakdownChart, ShareCard |

### 10.2 Backend

| Endpoint | Purpose |
|----------|---------|
| `POST /api/budget/calculate` | Run model, optionally persist session |
| `GET /api/budget/session/[slug]` | Fetch shared result |
| `POST /api/budget/session` | Create share slug |
| `GET /api/admin/budget/profiles` | Admin CRUD city profiles |

Rate limit: reuse pattern from `server/utils/reviewRateLimit.ts` — 30 calc/hour/IP.

### 10.3 Supabase

- Migrations in `supabase/migrations/019_budget_game.sql`
- RLS as §5.6
- Optional Edge Function if calculate becomes heavy (FX rates API)

### 10.4 FX rates (v1.5)

- ECB or frankfurter.app daily cache in `budget_fx_rates` table.
- MVP: hardcode EUR; input UI shows «≈ EUR» for UAH with static rate + disclaimer.

### 10.5 Sitemap

Extend `server/api/sitemap-urls.ts`:

```typescript
// budget hub countries × locales
for (const code of BUDGET_HUB_COUNTRIES) {
  urls.push({ loc: `/budget/${code.toLowerCase()}`, priority: 0.7, changefreq: 'weekly' })
}
// top city budget pages
```

### 10.6 Testing

| Layer | Tool |
|-------|------|
| Unit | Vitest для `budgetModel.ts` |
| E2E | Playwright — smoke: start → result → share link loads |
| Visual | Optional screenshot compare for OG |

Add to `tests/e2e/smoke.spec.ts`: `/uk/budget/` loads, wizard step 1→2.

---

## 11. SEO strategy

### 11.1 Indexable URL structure

| URL | Intent | Index? |
|-----|--------|--------|
| `/budget/` | Tool landing + FAQ | ✅ |
| `/budget/pl` | «Стоимость жизни в Польше калькулятор» | ✅ |
| `/budget/pl/krakow` | Long-tail city | ✅ v1.5 |
| `/budget/result/{slug}` | User results | ⚠️ noindex по default; index только curated «example results» |
| `/budget/play` | Wizard | noindex (thin) |
| `/budget/compare/pl-vs-de` | Budget compare | ✅ v2 |

### 11.2 Meta templates (uk)

```
title: «Калькулятор бюджета в {country} — сколько нужно на жизнь | Triplandr»
description: «Проверь, хватит ли твоего бюджета в {country}. Оценка по данным сообщества экспатов и типичным расходам. Бесплатно.»
```

### 11.3 Schema.org

- `WebApplication` на `/budget/`
- `FAQPage` — 5 вопросов (accuracy, sources, vs Numbeo)
- `BreadcrumbList`

### 11.4 Internal linking

- Country page sidebar: «Проверить бюджет →»
- Compare page: budget CTA block
- Footer: новая колонка «Инструменты» → Budget Game
- Hub articles: inline CTA после section про cost

### 11.5 Cannibalization guard

- Country SEO pages focus **reviews**; budget pages focus **calculator intent**.
- Cross-link, не duplicate H1.
- GSC monitor: «бюджет польша», «cost of living poland calculator ukrainian»

---

## 12. Analytics (Plausible)

### 12.1 Новые events

Extend `app/utils/analytics.ts`:

```typescript
export type ProductEvent =
  | ... existing ...
  | 'budget_session_start'
  | 'budget_step_complete'
  | 'budget_calculate'
  | 'budget_result_view'
  | 'budget_share_click'
  | 'budget_cta_country'
  | 'budget_cta_compare'
  | 'budget_cta_review'
```

### 12.2 Props

| Event | Props |
|-------|-------|
| `budget_session_start` | `source`, `locale`, `nat` |
| `budget_step_complete` | `step` (1-5), `target_country` |
| `budget_calculate` | `target_country`, `target_city`, `budget_eur`, `household`, `coverage_pct`, `gap_score` |
| `budget_result_view` | `share_slug`, `deficit` (bool) |
| `budget_share_click` | `channel` (telegram, copy, native) |
| `budget_cta_country` | `target_country` |
| `budget_cta_compare` | `pair` |
| `budget_cta_review` | `target_country` |
| `affiliate_click` | add `placement: 'budget'` |

### 12.3 Plausible goals setup

1. Goals: all `budget_*` events.
2. Funnels: start → calculate → share.
3. Breakdown by `target_country`, `nat`, `source`.
4. Weekly dashboard row in KPI retro template.

### 12.4 Privacy

- Не отправлять exact budget в URL props для third-party — только buckets: `<1500`, `1500-2500`, `2500-4000`, `4000+`.

---

## 13. Phased roadmap & effort estimates

### Phase 0 — Discovery & data prep (1 week, ~20h)

| Task | Owner | h |
|------|-------|---|
| Finalize budget model formula doc | Product | 4 |
| Seed 15 city_cost_profiles (manual research) | Content | 8 |
| country_cost_fallback seed from cost_level | Dev | 2 |
| UX wireframes sign-off | Design | 4 |
| Legal disclaimer draft | Legal/content | 2 |

**Exit criteria:** signed formula + seed SQL ready.

---

### Phase 1 — MVP (3–4 weeks, ~80–100h)

**Scope:** Mode A only, anon, no leaderboard, 3 country landings (PL, DE, CZ).

| Task | h |
|------|---|
| Migration 019 + seeds | 6 |
| `budgetModel.ts` + unit tests | 12 |
| `POST /api/budget/calculate` | 8 |
| `useBudgetGame` composable | 10 |
| Pages: index, play, result | 20 |
| Components: Stepper, Meter, Breakdown | 16 |
| i18n uk/ru/en | 8 |
| Affiliate slot `budget` + Wise/SafetyWing | 4 |
| Analytics events | 4 |
| OG meta (static image MVP) | 4 |
| E2E smoke test | 4 |
| Sitemap + 3 SEO landings | 6 |
| Country page CTA embed | 4 |

**Exit criteria:**
- [ ] User completes flow anon
- [ ] Share URL renders OG
- [ ] Plausible funnel live
- [ ] Disclaimer visible
- [ ] Mobile responsive

---

### Phase 1.5 — Expansion (2 weeks, ~40h)

| Task | h |
|------|---|
| +5 hub countries landings (ES, PT, GE, TR, TH) | 8 |
| City pages top-3 per country | 12 |
| Compare page budget CTA | 4 |
| Telegram calendar update | 2 |
| FX input UAH/PLN/USD | 8 |
| Admin UI for city_cost_profiles | 6 |

---

### Phase 2 — v2 Engagement (4 weeks, ~70h)

| Task | h |
|------|---|
| `budget_sessions` persist + share_slug | 10 |
| Leaderboard weekly | 12 |
| Mode B Guess the City | 16 |
| Mode C Budget Compare Duel | 12 |
| Remittance partners + rules engine | 8 |
| Email save (magic link) | 8 |
| Dynamic OG image | 6 |
| Community calibration job (weekly) | 8 |

---

### Phase 3 — v3 Intelligence (ongoing, ~60h+)

| Task | h |
|------|---|
| NLP rent hints from reviews | 20 |
| Personalised recommendations | 12 |
| API for partners | 16 |
| A/B price sensitivity tests | 12 |

---

### Gantt (упрощённый)

```
Sep W1-W2   [Phase 0]
Sep W3      [Phase 1 kickoff]
Oct W1-W2   [Phase 1 ship]
Oct W3-W4   [Phase 1.5]
Nov         [Phase 2]
Dec+        [Phase 3]
```

**Total estimate:** MVP ~100h, full v2 ~210h (1 FTE × 2.5 месяца или 2 dev × 6 недель).

---

## 14. Budget model (техническая спецификация MVP)

### 14.1 Inputs

```typescript
interface BudgetInput {
  monthlyBudgetEur: number
  targetCountry: string
  targetCityId?: number
  household: 'solo' | 'couple' | 'family'
  incomeType: 'remote' | 'local' | 'savings'
  lifestyle: {
    cookAtHome: boolean
    center: boolean
    hasCar: boolean
  }
  authorNationality?: string
}
```

### 14.2 Algorithm (pseudocode)

```
1. Load city_cost_profiles[targetCityId, profile_key(household, incomeType)]
   OR country_cost_fallback[targetCountry]

2. Adjust base lines:
   - rent = pick rent_* by household + center/outskirts
   - food *= lifestyle.cookAtHome ? 0.85 : 1.15
   - transport = hasCar ? car_cost : transit_cost

3. model_total = sum(lines)

4. Fetch community:
   - city_stats or country_stats filtered by nat
   - apply community multiplier (§4.2)

5. model_total_adjusted = model_total * community_multiplier

6. coverage_pct = (monthlyBudgetEur / model_total_adjusted) * 100

7. gap_score = f(coverage_pct, rent_delta, community_delta)

8. Return breakdown + disclaimers
```

### 14.3 Profile key mapping

| household | incomeType | profile_key |
|-----------|------------|-------------|
| solo | remote | solo_remote |
| solo | local | solo_local |
| couple | remote | couple_remote |
| family | * | family_default |

MVP: только `solo_remote`.

---

## 15. Admin & operations

### 15.1 Admin pages

- `app/pages/admin/budget/profiles.vue` — CRUD city_cost_profiles
- `app/pages/admin/budget/sessions.vue` — analytics dump (counts by country)
- Link from `AdminSidebar`

### 15.2 Data refresh cadence

| Data | Frequency | Owner |
|------|-----------|-------|
| city_cost_profiles | Quarterly manual | Content |
| country_cost_fallback | On cost_level change | Admin |
| community multiplier | Auto on stats refresh | DB trigger |
| FX rates | Daily cron (v1.5) | Edge function |

### 15.3 Moderation

- Leaderboard names: profanity filter list
- Report flow → hide session from leaderboard

---

## 16. Risks & mitigations

### 16.1 Data accuracy

| Risk | Impact | Mitigation |
|------|--------|------------|
| Устаревшие цены на жильё | High — trust loss | `valid_from` dates; «данные на {month}»; CTA «уточните в отзывах» |
| Мало UA-отзывов для города | Medium | Fallback all nat + banner «мало данных» |
| Расхождение с Numbeo/Expatistan | Medium | Disclaimer; не claim «точность»; cite community |
| FX volatility UAH | Medium | Daily rate + range «±5%» |

**Обязательный disclaimer (uk):**

> Оценка носит информационный характер и не является финансовой или юридической консультацией. Реальные расходы зависят от образа жизни, района и даты. Источники: редакторские профили и агрегированные отзывы Triplandr.

### 16.2 Legal & compliance

| Risk | Mitigation |
|------|------------|
| Financial advice regulations | Language: «оценка», «ориентир»; не «вы должны» |
| Affiliate disclosure | `PartnerDisclosure` + monetization page |
| GDPR / email capture | Opt-in checkbox; minimal fields; privacy policy link |
| Misleading OG shares | OG shows «оценка Triplandr», not «official cost of living» |

### 16.3 Product risks

| Risk | Mitigation |
|------|------------|
| Low completion rate | Shorten to 4 steps; smart defaults from nationality |
| SEO cannibalization | Distinct intents; monitor GSC |
| Affiliate spam perception | Max 2 partners on result; contextual only |
| Leaderboard toxicity | Anon only; no money metrics |

### 16.4 Technical risks

| Risk | Mitigation |
|------|------------|
| Calculate abuse | Rate limit |
| OG generation cost | Cache 24h by slug |
| Model drift | Version field in API response `model_version: '2026-09-1'` |

---

## 17. Open questions (decision log)

| # | Question | Options | Recommendation | Decision |
|---|----------|---------|----------------|----------|
| 1 | Default currency input | EUR only vs multi | Multi display, EUR canonical | TBD |
| 2 | Index user result pages | noindex vs index | noindex default | TBD |
| 3 | Numbeo API license | paid API vs manual | Manual MVP | TBD |
| 4 | Leaderboard scope | global vs UA-only | UA-only first | TBD |
| 5 | Auth provider for save | magic link vs anonymous auth | magic link v2 | TBD |

---

## 18. Appendix: файлы кодовой базы для интеграции

| Файл | Роль |
|------|------|
| `app/utils/countryMeta.ts` | cost_level, currency |
| `app/composables/useComparePage.ts` | cost labels, stats fetch pattern |
| `app/data/comparePairs.ts` | cross-link pairs |
| `app/utils/partners.ts` | affiliate extension |
| `app/utils/analytics.ts` | Plausible events |
| `app/stores/user.ts` | nationality prefill |
| `app/components/AffiliatePartnerLinks.vue` | partner UI |
| `server/api/sitemap-urls.ts` | SEO URLs |
| `supabase/migrations/003_country_stats.sql` | avg_cost_of_living |
| `supabase/migrations/014_city_stats_refresh.sql` | city-level ratings |
| `app/locales/*/common.ts` | costOptions labels |
| `docs/telegram-content-calendar.md` | distribution |
| `docs/affiliate-ab-testing.md` | A/B framework |

---

## 19. Success review checklist (90 days post-MVP)

- [ ] ≥500 completed budget sessions
- [ ] Share rate ≥10%
- [ ] ≥3 budget landing pages in GSC top-20 for target queries
- [ ] `affiliate_click` placement=budget ≥50 clicks
- [ ] ≥10 reviews with referral from budget CTA
- [ ] No legal/accuracy complaints
- [ ] Completion rate ≥50%
- [ ] Decision: proceed Phase 2 or pivot model

---

*Документ подготовлен для команды Triplandr. Обновлять по мере решений из §17.*
