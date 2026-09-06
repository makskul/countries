# Premium Paywall на отзывах — Product & Technical Roadmap

**Проект:** Triplandr (`/Users/ievgen_no/maks_projects/countries`)  
**Дата:** 2026-09-01  
**Статус:** Draft / планирование  
**Связанные EPIC:** EPIC-2.1 (LeadForm), EPIC-3.1 (Affiliate A/B), EPIC-3.2 (GSC CTR)

---

## 0. Executive Summary

Triplandr сегодня монетизируется через **партнёрские ссылки** (affiliate) и **lead-gen** (форма консультаций при низком score легализации). Весь контент открыт: отзывы читаются анонимно, без регистрации. Бренд-обещание на `/about/monetization`: *«Мы не продаём отзывы, спонсорские рейтинги или продвигаемые страны»*.

Premium paywall на отзывах — **новая revenue-линия**, которая должна:

1. **Не противоречить доверию** — платят за *доступ к архиву и инструментам*, а не за изменение рейтингов или «лучшие» отзывы.
2. **Сохранить SEO-трафик** — агрегаты, первые N отзывов и editorial-контент остаются crawlable.
3. **Требовать Auth** — Supabase Auth для читателей (сейчас auth только для admin).
4. **Интегрироваться** с LeadForm и affiliate A/B, а не конкурировать с ними.

**Рекомендуемый провайдер платежей:** **Lemon Squeezy** (Merchant of Record, VAT/EU, карты diaspora, webhook API). Stripe — запасной вариант при наличии EU-юрлица.

**Рекомендуемая модель freemium:** первые **3 полных отзыва** бесплатно → soft paywall (blur + CTA) на country/city → Premium unlocks archive + compare export + alerts.

---

## 1. Контекст продукта (as-is)

### 1.1 Текущая архитектура отзывов

| Компонент | Файл | Поведение |
|-----------|------|-----------|
| Fetch отзывов | `app/composables/useCountryPage.ts` | Supabase client, RLS `reviews_select_approved`, фильтр по `target_country` + `author_nationality` |
| Пагинация | `PAGE_SIZE = 10`, load more | Client-side slice, все строки уже загружены в память |
| Карточка отзыва | `app/components/ReviewCard.vue` | Полный текст всех категорий + рейтинги |
| Country page | `app/pages/country/[slug]/index.vue` | CategoryScoresCard, LeadForm, ReviewCard list |
| City page | `app/pages/country/[slug]/[city].vue` | Аналогично, через `useCityPage.ts` |
| Compare | `app/components/ComparePageView.vue` | Агрегированные stats из `country_stats`, не полные тексты отзывов |
| RLS | `supabase/migrations/008_rls.sql` | `select using (is_approved = true)` — публичный read |

### 1.2 Текущая монетизация

| Канал | Триггер | Файлы |
|-------|---------|-------|
| Affiliate | Sidebar/compare/map | `AffiliatePartnerLinks.vue`, `docs/affiliate-ab-testing.md` |
| Lead-gen | `legalization avg < 3` + nationality set | `LeadForm.vue`, `server/api/leads.post.ts` |
| Disclosure | Footer, partner blocks | `PartnerDisclosure.vue`, `/about/monetization` |

### 1.3 Auth (as-is)

- **Читатели:** без auth. Nationality — cookie `nv_nationality` + Pinia (`app/stores/user.ts`).
- **Admin:** Supabase Auth + `admin_users` table + `app/middleware/admin-auth.ts`.
- **Privacy page** заявляет: *«Мы не требуем регистрации»* — потребует обновления.

### 1.4 Аналитика (as-is)

Plausible events: `nat_set`, `review_submit`, `compare_run`, `affiliate_click`, `lead_submit`, `map_country_select` (`app/utils/analytics.ts`).

---

## 2. Принципы Premium без нарушения trust positioning

### 2.1 Что мы продаём (формулировка для пользователя)

> **Triplandr Premium** — расширенный доступ к *уже опубликованным* community-отзывам и инструментам планирования переезда. Модерация, рейтинги и порядок отзывов **одинаковы для всех**. Premium не покупает «лучший» рейтинг и не скрывает негатив.

### 2.2 Чего мы НИКОГДА не делаем (наследуем из monetization page)

- ❌ Платные/спонсорские отзывы
- ❌ Продвижение стран в рейтингах за деньги
- ❌ Разный контент модерации для Premium vs free
- ❌ Pay-to-remove-negative-review
- ❌ Разная выдача для Googlebot vs пользователя (cloaking)

### 2.3 Обновление `/about/monetization`

Добавить секцию **«Triplandr Premium»** (uk/en/ru):

```text
Premium — подписка для читателей, которые хотят читать полный архив отзывов
и пользоваться инструментами сравнения. Это не влияет на модерацию и рейтинги.
Авторы отзывов по-прежнему публикуют бесплатно.
```

Обновить `app/locales/*/pages.ts` → `monetization.sections[]`.

---

## 3. FREE vs PREMIUM — матрица entitlements

### 3.1 Рекомендуемое разделение (v1)

| Функция | FREE (аноним / logged-in free) | PREMIUM |
|---------|-------------------------------|---------|
| **Выбор nationality** | ✅ Cookie/store, без auth | ✅ + sync across devices |
| **Header stats** (avg, count, last review) | ✅ | ✅ |
| **CategoryScoresCard** (средние по категориям) | ✅ | ✅ |
| **Editorial articles** (CountryHub, ContentArticle) | ✅ | ✅ |
| **Compare aggregated bars** | ✅ | ✅ |
| **Affiliate partner links** | ✅ | ✅ (без изменений) |
| **LeadForm** (legalization < 3) | ✅ | ✅ |
| **Первые N полных отзывов** (country/city) | ✅ N=3 | ✅ unlimited |
| **Архив отзывов** (4+) | 🔒 blur + teaser | ✅ |
| **Load more** beyond free quota | 🔒 CTA Premium | ✅ |
| **City-level full archive** | 🔒 same N=3 per city page | ✅ |
| **Compare: sample review excerpts** | ✅ 1 excerpt per country (если есть) | ✅ all excerpts |
| **Compare PDF/CSV export** | ❌ | ✅ |
| **Email alerts** (новый отзыв по стране+nat) | ❌ (только newsletter digest) | ✅ targeted alerts |
| **Saved countries / favorites sync** | localStorage only | ✅ cloud sync |
| **Early access** к новым compare pairs | ❌ | optional v2 |
| **Написание отзыва** | ✅ always free | ✅ always free |
| **Admin moderation** | N/A | N/A |

### 3.2 Параметр N (free quota) — конфигурируемый

```ts
// app/utils/premiumEntitlements.ts
export const PREMIUM_CONFIG = {
  freeReviewQuota: 3,        // A/B testable: 2, 3, 5
  freeCompareExcerpts: 1,      // per country in compare view
  teaserChars: 120,            // chars visible in blurred card
} as const
```

**Почему N=3:**
- Достаточно для «попробовать ценность» (legalization + cost + safety часто в разных отзывах).
- Не обнуляет SEO — 3 полных ReviewCard в SSR HTML.
- При avg 8–15 отзывов на страну создаёт ощутимый upsell (~60–80% контента за paywall).

### 3.3 Альтернативные модели (отложить / A/B)

| Модель | Плюсы | Минусы | Решение |
|--------|-------|--------|---------|
| Freemium N reviews | SEO-safe, понятно | Меньше ARPU | **Ship v1** |
| Metered (10 стран/мес) | Гибко | Сложно объяснить | v2 |
| Pay-per-country unlock | Высокий ARPU на hot pages | Фрагментирует UX | v2 как add-on |
| Hard paywall (0 free) | Max revenue | SEO collapse, trust hit | ❌ Never |
| Category-based (legalization free) | Intent match | Сложная логика | A/B v1.1 |

---

## 4. Pricing tiers & валюты

### 4.1 Целевая аудитория

- **Primary:** UA diaspora (uk locale, `?nat=UA`) — Польша, Германия, Чехия, etc.
- **Secondary:** RU-speaking expats (ru locale)
- **Tertiary:** EN — digital nomads, broader EU

География платежеспособности: пользователи часто с **EU bank cards** (Revolut, Wise, local EU banks), часть — **UA cards** (ограниченнее после 2022).

### 4.2 Рекомендуемые тарифы (v1)

| Tier | Цена | Billing | Positioning |
|------|------|---------|-------------|
| **Premium Monthly** | **€7.99/mo** | recurring | «Попробовать перед переездом» |
| **Premium Annual** | **€59.99/yr** (~€5/mo, -37%) | recurring | Default highlighted |
| **Premium Lifetime** | **€149 once** | one-time | Limited offer, первые 6 мес |

**UA-friendly display (не отдельная валюта billing):**
- Показывать эквивалент **~350 ₴/мес** / **~2 650 ₴/год** (курс ECB + disclaimer «списание в EUR»).
- **Не** биллить в UAH напрямую на v1 — FX/regulatory complexity.

### 4.3 Student / hardship discount (v1.1)

- 50% off annual через coupon `RELOCATE50` — manual или Lemon Squeezy discount codes.
- Не публиковать широко; давать в Telegram/community.

### 4.4 Pricing psychology для trust

- **Annual as default** — меньше «subscription fatigue», выше LTV.
- **7-day free trial** на annual (Lemon Squeezy supports) — снижает friction, но требует card upfront.
- **No trial on monthly** — проще unit economics.
- **Гарантия:** 14-day money-back (см. Legal §12).

### 4.5 Competitive reference (не fake numbers — ориентиры)

| Конкурент / аналог | Модель | Цена |
|--------------------|--------|------|
| Numbeo | Free + API paid | — |
| Expat forums | Free | — |
| Nomad List | Subscription | ~$99/yr |
| VPN/insurance affiliates | CPA | Triplandr уже monetizes |

Premium Triplandr — **ниже Nomad List**, positioning: «access to real nationality-filtered reviews».

---

## 5. Payment provider: Stripe vs Lemon Squeezy vs Paddle

### 5.1 Сравнительная таблица

| Критерий | Stripe | Lemon Squeezy | Paddle |
|----------|--------|---------------|--------|
| Merchant of Record (VAT EU) | ❌ вы сами | ✅ | ✅ |
| UA-основанный merchant без EU entity | ⚠️ сложно | ✅ (LS Inc, US MoR) | ✅ (UK/US) |
| EU diaspora cards | ✅ | ✅ | ✅ |
| UA local cards | ⚠️ через Stripe UA/EU entity | ✅ international cards | ✅ |
| Subscription webhooks | ✅ excellent | ✅ good | ✅ good |
| Nuxt/Supabase integration | ✅ official, больше docs | ✅ REST + webhooks | ✅ |
| Checkout UX | Stripe Checkout | LS Checkout overlay | Paddle Checkout |
| Fee (ориентир) | 2.9% + €0.25 | 5% + $0.50 (includes MoR) | 5% + $0.50 |
| Tax invoices для EU customers | DIY | ✅ auto | ✅ auto |
| Sanctions/compliance | Stripe rules strict | LS acceptable for UA diaspora | Similar |

### 5.2 Рекомендация: **Lemon Squeezy** (primary)

**Причины для Triplandr + UA diaspora:**

1. **MoR** — EU VAT (OSS) handled; пользователи в DE/PL/CZ получают proper invoice без вашей регистрации в каждой стране.
2. **No EU legal entity required** на старте — критично для solo/small team.
3. **International cards** — diaspora на Revolut/Wise/N26 платят без friction.
4. **Subscription + license keys** — можно мапить `subscription_id` → Supabase entitlements.
5. **Webhook reliability** — HMAC-signed, проще чем self-hosted Stripe Tax.

**Stripe — когда перейти:**
- Появилось EU юрлицо (PL/DE s.r.o.) и нужен lower fee at scale (>€10k MRR).
- Нужен Stripe Connect для marketplace (не актуально сейчас).

**Paddle — альтернатива LS:**
- Схожий MoR; выбор между LS и Paddle — по fee, UX checkout A/B, support responsiveness.

### 5.3 Implementation sketch (Lemon Squeezy)

```
User clicks Upgrade
  → POST /api/billing/checkout { plan: 'annual' }
  → Server creates LS checkout URL (variant_id from env)
  → Redirect / overlay checkout
  → LS webhook subscription_created / subscription_updated
  → server/api/webhook/lemon-squeezy.post.ts
  → Upsert subscriptions + entitlements in Supabase
  → User redirected to /premium/success
```

Env vars:
```
LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_STORE_ID=
LEMON_SQUEEZY_WEBHOOK_SECRET=
LEMON_SQUEEZY_VARIANT_MONTHLY=
LEMON_SQUEEZY_VARIANT_ANNUAL=
LEMON_SQUEEZY_VARIANT_LIFETIME=
```

---

## 6. Supabase schema: subscriptions, entitlements, webhooks

### 6.1 Новые таблицы (migration `019_premium_subscriptions.sql`)

```sql
-- Reader accounts (extends auth.users — NOT admin_users)
create table if not exists reader_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  nationality text,                    -- sync from user store on login
  locale text default 'uk',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Subscription records (source of truth from payment provider)
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references reader_profiles(id) on delete cascade,
  provider text not null check (provider in ('lemon_squeezy', 'stripe', 'paddle', 'manual')),
  provider_subscription_id text not null,
  provider_customer_id text,
  plan text not null check (plan in ('monthly', 'annual', 'lifetime')),
  status text not null check (status in (
    'trialing', 'active', 'past_due', 'cancelled', 'expired', 'paused'
  )),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  trial_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subscription_id)
);

create index subscriptions_user_id_idx on subscriptions (user_id);
create index subscriptions_status_idx on subscriptions (status);

-- Denormalized entitlements for fast RLS checks
create table if not exists entitlements (
  user_id uuid primary key references reader_profiles(id) on delete cascade,
  is_premium boolean not null default false,
  premium_until timestamptz,           -- null = lifetime
  plan text,
  source_subscription_id uuid references subscriptions(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- Webhook idempotency log
create table if not exists billing_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now(),
  unique (provider, event_id)
);

-- Premium alerts (v1.1 but schema now)
create table if not exists review_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references reader_profiles(id) on delete cascade,
  target_country text not null,
  author_nationality text not null,
  city_id int references cities(id) on delete cascade,
  is_active boolean not null default true,
  last_notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, target_country, author_nationality, city_id)
);

-- Link leads to premium upsell funnel
alter table leads add column if not exists user_id uuid references reader_profiles(id) on delete set null;
alter table leads add column if not exists premium_offer_shown boolean default false;
```

### 6.2 RLS policies

```sql
alter table reader_profiles enable row level security;
alter table subscriptions enable row level security;
alter table entitlements enable row level security;
alter table review_alerts enable row level security;

-- reader_profiles: user reads/writes own row
create policy reader_profiles_self on reader_profiles
  for all using (auth.uid() = id);

-- subscriptions: user reads own
create policy subscriptions_self on subscriptions
  for select using (auth.uid() = user_id);

-- entitlements: user reads own
create policy entitlements_self on entitlements
  for select using (auth.uid() = user_id);

-- review_alerts: user CRUD own
create policy review_alerts_self on review_alerts
  for all using (auth.uid() = user_id);
```

### 6.3 Reviews RLS — **критическое изменение**

**Проблема:** сейчас client-side Supabase fetch отдаёт все approved reviews любому.

**Решение v1 (рекомендуется):** Server API gate вместо прямого client fetch для paywalled content.

```
GET /api/reviews/country/:slug?nat=UA&offset=0&limit=10
  → Server checks auth + entitlements
  → Returns:
      - items[0..2]: full review objects
      - items[3+]: { id, teaser, ratings_summary, locked: true } OR omit comments
  → Premium: full objects
```

**RLS остаётся** `is_approved = true` для backward compat, но **комments truncation** на server layer.

**Альтернатива (v2):** Postgres RLS function `can_read_full_review(user_id, review_id)` — сложнее, но zero-trust client.

### 6.4 Webhook handler events (Lemon Squeezy)

| Event | Action |
|-------|--------|
| `subscription_created` | Insert subscription, set entitlements.is_premium=true |
| `subscription_updated` | Update status, period dates |
| `subscription_cancelled` | status=cancelled, premium_until=period_end |
| `subscription_expired` | is_premium=false |
| `subscription_payment_success` | Extend premium_until |
| `subscription_payment_failed` | status=past_due, grace 3 days |
| `order_created` (lifetime) | is_premium=true, premium_until=null |

**Idempotency:** check `billing_webhook_events` before processing.

### 6.5 Supabase Auth setup для readers

```ts
// nuxt.config.ts — расширить supabase redirect
supabase: {
  redirect: true,
  redirectOptions: {
    login: '/login',
    callback: '/auth/callback',
    exclude: ['/', '/countries', '/country/**', '/compare/**', '/about/**', '/admin', '/admin/**'],
  },
}
```

Providers v1:
- **Email magic link** (primary — низкий friction для diaspora)
- **Google OAuth** (secondary)

---

## 7. UX: soft paywall, blur, CTA placement

### 7.1 Компонентная архитектура

```
app/components/premium/
  PremiumPaywall.vue       — inline CTA block
  PremiumBlurCard.vue      — обёртка ReviewCard с blur
  PremiumBadge.vue         — navbar badge «Premium»
  PremiumUpgradeModal.vue  — modal checkout entry
  PremiumPricingTable.vue  — /premium page
  PremiumGate.vue          — slot wrapper: <PremiumGate requires="full_archive">
```

### 7.2 Country page (`/country/[slug]?nat=UA`)

**Placement map:**

```
[Header stats]                    — FREE, no change
[CategoryScoresCard]              — FREE
[LeadForm if leg<3]               — FREE, see §8 upsell
[Cities grid]                     — FREE
[Reviews section]
  ReviewCard × 3                  — FREE, full
  PremiumBlurCard × (n-3)         — teaser 120 chars + blur overlay
  [PremiumPaywall inline]         — after 3rd card
  [Load more]                     — triggers paywall if not premium
[CountrySidebar affiliates]       — FREE, EPIC-3 A/B unchanged
```

**PremiumPaywall copy (uk):**
> «Ще {count} відгуки від {nat} про {country}. Розблокуйте повний архів з Triplandr Premium — €5/міс при річній підписці.»

**CTA buttons:**
- Primary: «Розблокувати архів»
- Secondary: «Увійти» (if anonymous)
- Tertiary link: «Як ми заробляємо» → `/about/monetization`

### 7.3 City page

- Тот же N=3 quota **per city page** (not global daily limit).
- Rationale: пользователь на Warsaw page cares about Warsaw reviews.

### 7.4 Compare page (`/compare/[pair]`)

| Element | FREE | PREMIUM |
|---------|------|---------|
| Category bars | ✅ | ✅ |
| Winner affiliate CTA | ✅ EPIC-3 | ✅ |
| Review excerpts section | 1 per country | All available |
| Export button | Hidden / locked | «Export PDF/CSV» |

**CTA placement:** below comparison table, before affiliate winner block — A/B with EPIC-3 `compare_on` variant.

### 7.5 Navbar / global

- Anonymous: «Увійти» + subtle «Premium» link
- Logged free: avatar + «Upgrade»
- Premium: «Premium ✓» badge, link to `/account/subscription`

### 7.6 Soft vs hard paywall rules

| Interaction | Behavior |
|-------------|----------|
| Scroll to blurred card | Blur visible, no scroll-jack modal |
| Click blurred card | Upgrade modal |
| Click Load more (free) | Upgrade modal |
| Direct URL with hash #review-5 | Page loads, card 5 blurred |
| Share link | Recipient sees same free quota (not gift) |

### 7.7 CSS blur implementation

```css
.premium-blur-card {
  position: relative;
  max-height: 180px;
  overflow: hidden;
}
.premium-blur-card::after {
  content: '';
  position: absolute;
  inset: 0;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  mask-image: linear-gradient(to bottom, transparent 20%, black 80%);
}
```

**Accessibility:** blurred content remains in DOM — screen readers get teaser only via `aria-hidden` on locked portion.

---

## 8. Auth (required) — flows

### 8.1 Auth gates

| Action | Auth required? |
|--------|----------------|
| Read 3 free reviews | ❌ |
| Read full archive | ✅ + Premium |
| Checkout | ✅ (create account pre-checkout or during) |
| Manage subscription | ✅ |
| Write review | ❌ (unchanged) |
| Save favorites sync | ✅ (free tier ok) |
| Review alerts | ✅ + Premium |

### 8.2 Recommended flow: «Auth at paywall»

1. User hits blur → modal: «Увійти або створити акаунт» + email magic link.
2. After auth → return URL → pricing step (if not premium).
3. Minimize steps: **don't force auth on landing**, only at conversion moment.

### 8.3 Nationality sync on login

```ts
// On auth callback:
if (store.nationality && !profile.nationality) {
  await supabase.from('reader_profiles').update({ nationality: store.nationality })
}
```

### 8.4 Account pages (new)

| Route | Purpose |
|-------|---------|
| `/login` | Magic link + Google |
| `/auth/callback` | Supabase callback |
| `/account` | Profile, nationality, favorites |
| `/account/subscription` | Plan, cancel, invoices (LS portal link) |
| `/premium` | Pricing + FAQ |
| `/premium/success` | Post-checkout confirmation |

---

## 9. LeadForm — upsell path (legalization < 3)

### 9.1 Current behavior

```ts
// app/pages/country/[slug]/index.vue
const showLeadForm = computed(() => {
  const leg = catStats.value?.find(c => c.category === 'legalization')
  return leg?.avg != null && leg.avg < 3
})
```

LeadForm → `POST /api/leads` → admin Telegram + `admin/leads`.

### 9.2 Premium relation — **complementary, not competing**

**Insight:** Low legalization score = high intent user. They're anxious about visa path — prime conversion segment.

**Upsell placement (below LeadForm, not replacing it):**

```
[LeadForm — FREE consultation request]     ← keep trust / human help
[PremiumUpsellBanner — soft]               ← "Поки чекаєте відповідь — прочитайте 12 повних відгуків про легалізацію"
```

### 9.3 Funnel logic

| User state | LeadForm | Premium CTA |
|------------|----------|-------------|
| Anonymous, leg<3 | Show form | Below form: «Або розблокуйте архів зараз» |
| Logged free, leg<3 | Show form | Personalized: «{n} відгуків про легалізацію за paywall» |
| Premium | Hide upsell | LeadForm still shown if they want human help |
| Lead submitted | Success msg | «Тим часом — Premium дає доступ до...» |

### 9.4 Analytics cross-track

Extend `lead_submit` props:
```ts
lead_submit: { country, source, premium_offer_shown: boolean, is_premium: boolean }
```

New event:
```ts
premium_upsell_view: { placement: 'lead_form' | 'review_blur' | 'compare', country, nat }
premium_checkout_start: { plan, source_placement }
premium_convert: { plan, revenue_cents, source_placement }
```

### 9.5 Backend: leads table extension

Track `premium_offer_shown` + `user_id` to measure lead→premium conversion in admin dashboard.

---

## 10. SEO implications & cloaking risk

### 10.1 Google cloaking policy (critical)

**Cloaking = showing different content to Googlebot vs users.** Penalty risk.

### 10.2 Safe approach (recommended)

| Content | Googlebot | Anonymous user | Premium user |
|---------|-----------|----------------|--------------|
| Title, meta, H1 | Full | Full | Full |
| Aggregate stats | Full | Full | Full |
| First 3 ReviewCard HTML | **Full text** | Full text | Full text |
| Review 4+ | **Teaser in HTML** (120 chars) | Blurred teaser | Full text via client hydrate |

**Key rule:** SSR HTML for reviews 4+ must be **identical** for bot and anonymous user — truncated teaser, not empty.

```html
<!-- SSR output for locked review #4 — SAME for bot and user -->
<article data-review-id="..." class="review-card review-card--locked">
  <p class="review-teaser">Takes about 3 months for temporary...</p>
  <div class="premium-blur-overlay" aria-hidden="true">...</div>
</article>
```

### 10.3 What stays fully crawlable

- ✅ All country/compare URLs in sitemap (`server/api/sitemap-urls.ts`)
- ✅ Aggregate ratings (CategoryScoresCard data)
- ✅ Editorial hub articles (`018_ua_hub_articles.sql`)
- ✅ First N full reviews (unique text per page)
- ✅ `/premium` pricing page
- ✅ Updated `/about/monetization`

### 10.4 What NOT to do

- ❌ `if (isGooglebot) show all reviews`
- ❌ `robots: noindex` on country pages to hide paywall
- ❌ Fetch full reviews client-only after empty SSR (soft 404 for Google)
- ❌ Different review count in JSON-LD vs visible content

### 10.5 Structured data

Keep `AggregateRating` in JSON-LD based on **all approved reviews**, not just free quota — consistent with visible aggregate stats.

Do **not** add `Review` schema for locked cards beyond teaser — or mark only free reviews.

### 10.6 GSC monitoring post-launch

From `docs/gsc-ctr-optimization.md`:
- Watch `/country/{slug}?nat=UA` CTR week-over-week
- Alert if impressions drop >20% (possible ranking signal)
- Rollback trigger: 3 consecutive weeks decline + support complaints

---

## 11. i18n strategy (uk / en / ru)

### 11.1 New locale namespace

```
app/locales/{uk,en,ru}/premium.ts
app/locales/{uk,en,ru}/account.ts
```

Export from `index.ts`.

### 11.2 Copy principles

| Locale | Tone | Notes |
|--------|------|-------|
| **uk** | Primary, direct, trust-first | Default pricing display € + ₴ equiv |
| **ru** | Mirror uk, slightly formal | Same EUR pricing |
| **en** | International, concise | EUR/USD display optional |

### 11.3 Key strings (uk examples)

```ts
// premium.ts
export default {
  paywall: {
    title: 'Повний архів відгуків — Premium',
    subtitle: 'Ще {count} відгуків від {nationality} про {country}',
    cta: 'Розблокувати архів',
    loginCta: 'Увійти',
    trustLine: 'Модерація однакова для всіх. Premium не купує рейтинги.',
    priceFrom: 'від {price}/міс',
  },
  plans: {
    monthly: { name: 'Місячний', price: '€7.99/міс' },
    annual: { name: 'Річний', price: '€59.99/рік', badge: 'Найвигідніший' },
    lifetime: { name: 'Назавжди', price: '€149' },
  },
  features: {
    fullArchive: 'Повний архів відгуків',
    compareExport: 'Експорт порівнянь PDF/CSV',
    alerts: 'Сповіщення про нові відгуки',
    sync: 'Синхронізація обраних країн',
  },
}
```

### 11.4 Monetization page updates (all locales)

Add section to `pages.monetization.sections`:
- uk: «Triplandr Premium»
- en: «Triplandr Premium»
- ru: «Triplandr Premium»

Update `privacy.sections` — mention account data, billing via Lemon Squeezy.

### 11.5 SEO meta for `/premium`

```ts
// uk
title: 'Triplandr Premium — повний доступ до відгуків релокантів'
description: 'Розблокуйте архів відгуків за національністю, експорт порівнянь і сповіщення. Без впливу на модерацію.'
```

### 11.6 Legal pages

New `/terms/subscription` or section in existing `/terms` — uk primary, en/ru translation.

---

## 12. Admin: subscription management

### 12.1 Admin routes (new)

```
/admin/subscriptions          — list all subscriptions
/admin/subscriptions/[id]     — detail, manual actions
/admin/billing-events         — webhook log (debug)
```

### 12.2 Admin capabilities

| Action | Who | Implementation |
|--------|-----|----------------|
| View subscriptions | moderator+ | service role query |
| Grant manual premium | superadmin | insert entitlements, provider='manual' |
| Revoke premium | superadmin | entitlements.is_premium=false |
| View lead→premium funnel | moderator+ | join leads + subscriptions |
| Reconcile LS dashboard | superadmin | export CSV compare |

### 12.3 Admin UI fields

- User email, nationality, plan, status, period end
- Provider link (LS subscription URL)
- `premium_offer_shown` on related leads
- Webhook event history

### 12.4 Alerts to Telegram (extend existing)

On `premium_convert` → notify admin channel (like review webhook):
```
💎 Premium: user@email.com
Plan: annual · €59.99
Source: country_page blur / PL / UA
```

---

## 13. Legal: terms, refund, VAT

### 13.1 Terms of Service updates

Add **Subscription Terms** section:

1. **Service description:** access to digital content archive, not advisory services.
2. **Auto-renewal disclosure:** annual/monthly renews until cancelled.
3. **Cancellation:** via LS customer portal or `/account/subscription`.
4. **Effect of cancellation:** access until period end.
5. **No impact on review moderation** (trust clause).
6. **Prohibited:** scraping, reselling content.

### 13.2 Refund policy

| Case | Policy |
|------|--------|
| Annual within 14 days, <10 reviews read post-purchase | Full refund |
| Technical failure (no access 48h+) | Full refund |
| Monthly | No refund, cancel anytime |
| Lifetime | 14-day refund window |
| Chargeback abuse | account ban |

Process: email `billing@triplandr.com` or LS portal; superadmin manual refund in LS.

### 13.3 VAT & tax (Lemon Squeezy MoR)

- LS calculates VAT based on customer billing country.
- B2C EU: VAT included in displayed price (€7.99 gross).
- Display on pricing: «Ціна включає ПДВ для країн ЄС» (uk).
- UA customers: typically no EU VAT; LS handles US sales tax.
- **Invoices:** LS customer portal — link from `/account/subscription`.

### 13.4 Consumer rights (EU)

- 14-day withdrawal right for digital content **if** not consumed — waiver checkbox at checkout:
  «Я погоджуюсь на негайний доступ і втрату права на повернення після перегляду контенту»
- Consult legal counsel before launch (not legal advice in this doc).

### 13.5 Privacy updates

- Store: email, subscription status, payment provider customer ID (not card numbers).
- Lemon Squeezy as data processor — link to their DPA.
- Update `app/locales/*/pages.ts` privacy sections.

---

## 14. Phased rollout

### Phase 0: Foundation (2–3 weeks)

- [ ] Supabase Auth for readers (magic link)
- [ ] `reader_profiles`, `subscriptions`, `entitlements` migrations
- [ ] Lemon Squeezy account + test products
- [ ] `/premium` pricing page (no paywall yet)
- [ ] Update monetization + privacy copy
- [ ] Analytics events scaffold

**Exit criteria:** test checkout in LS test mode, entitlement reflected in DB.

### Phase 1: Soft paywall MVP (2 weeks)

- [ ] `GET /api/reviews/...` server gate
- [ ] `PremiumBlurCard`, `PremiumPaywall` on country/city
- [ ] N=3 free quota
- [ ] Auth-at-paywall flow
- [ ] Webhook handler production
- [ ] Admin subscriptions list (read-only)

**Exit criteria:** E2E purchase → unlock on country page.

### Phase 2: Compare + LeadForm upsell (1 week)

- [ ] Compare excerpts gate + export (PDF basic)
- [ ] LeadForm upsell banner
- [ ] Premium success page + email (Resend)

**Exit criteria:** lead_form placement tracking live.

### Phase 3: Alerts & polish (2 weeks)

- [ ] Review alerts (email via Resend)
- [ ] Favorites cloud sync
- [ ] `/account/subscription` self-service cancel
- [ ] Admin manual grant/revoke

### Phase 4: Optimize (ongoing)

- [ ] A/B tests (§16)
- [ ] Pricing experiments
- [ ] Stripe migration evaluation if MRR threshold hit

### Rollout strategy

1. **Internal dogfood** — team accounts, 1 week
2. **5% traffic** — feature flag `premium_paywall_enabled` via cookie/env
3. **50% traffic** — monitor GSC + conversion 2 weeks
4. **100%** — if metrics neutral/positive

Feature flag:
```ts
// app/utils/featureFlags.ts
export function isPremiumPaywallEnabled(): boolean {
  return useRuntimeConfig().public.premiumPaywallEnabled === 'true'
}
```

---

## 15. Revenue projections framework (assumptions, not forecasts)

### 15.1 Variables (fill with real data)

| Variable | Symbol | How to measure |
|----------|--------|----------------|
| Monthly unique visitors | `UV` | Plausible |
| Country page views / UV | `CPV` | Plausible funnel |
| Review section engagement rate | `E` | scroll to reviews / CPV |
| Paywall impression rate | `PI` | premium_upsell_view / review viewers |
| Checkout start rate | `CS` | premium_checkout_start / premium_upsell_view |
| Trial/purchase conversion | `C` | premium_convert / premium_checkout_start |
| Monthly churn | `CH` | cancelled / active base |
| ARPU monthly equiv | `A` | plan mix weighted |

### 15.2 Formula

```
New subscribers/month ≈ UV × CPV_rate × E × PI × CS × C

MRR ≈ (Active_subscribers × A) - (Active_subscribers × CH × A)

LTV ≈ A × avg_lifetime_months
avg_lifetime_months ≈ 1 / CH   (geometric approx)
```

### 15.3 Scenario template (plug your numbers)

| Scenario | UV | Engaged | PI | CS | C | New subs | A | MRR |
|----------|-----|---------|----|----|---|----------|---|-----|
| Pessimistic | 10k | 2% | 30% | 20% | 5% | 0.6 | €6 | €4 |
| Base | 10k | 5% | 40% | 25% | 8% | 4 | €6 | €24 |
| Optimistic | 25k | 8% | 50% | 30% | 12% | 36 | €7 | €252 |

**Note:** Numbers above are **structural examples** — replace with Plausible baselines before decisions.

### 15.4 Break-even vs affiliate

Track **blended RPM:**
```
RPM_premium = (MRR × 1000) / (UV × CPV_rate)
RPM_affiliate = (affiliate_revenue × 1000) / UV
```

Goal: premium **complements** affiliate (high-intent users convert premium; low-intent still click affiliate).

---

## 16. A/B test ideas (EPIC-3 integration)

### 16.1 Existing A/B infrastructure

From `docs/affiliate-ab-testing.md`:
- Cookie `nv_aff_ab`: `{sidebar_position},{compare_surface}`
- Middleware: `app/middleware/affiliate-ab.global.ts`
- Analytics: `ab_variant` prop on events

### 16.2 New premium bucket (extend cookie or separate)

**Option A:** Extend cookie → `nv_aff_ab=top,compare_on,paywall_3`  
**Option B:** Separate `nv_premium_ab` cookie (cleaner)

| Experiment | Variants | Metric |
|------------|----------|--------|
| Free quota N | `N2` / `N3` / `N5` | premium_convert, GSC CTR |
| Paywall placement | `after_3rd` / `after_scores` | premium_upsell_view → convert |
| Blur vs truncate | `blur` / `fade_text` | CS rate |
| Price anchor | `monthly_first` / `annual_first` | ARPU |
| LeadForm upsell | `upsell_on` / `upsell_off` | lead_submit, premium_convert |
| Compare export tease | `export_locked` / `no_export_mention` | compare page convert |

### 16.3 Cross-experiment with affiliate

**Hypothesis:** `compare_on` + `export_locked` → higher premium conversion without hurting affiliate EPC.

Track:
```
premium_convert.ab_variant = sidebar_compare_premium combo
affiliate_click.ab_variant = same
```

Decision matrix after ≥2 weeks, ≥50 premium_upsell_view per variant (from affiliate doc methodology).

### 16.4 Plausible goals (add)

- `premium_upsell_view`
- `premium_checkout_start`
- `premium_convert`

---

## 17. Metrics: conversion, churn, LTV

### 17.1 North star

**Premium MRR** + **Premium LTV:CAC** (if paid acquisition later)

### 17.2 Funnel metrics

| Stage | Event | Target (tune post-baseline) |
|-------|-------|------------------------------|
| Awareness | page view country/compare | — |
| Engagement | scroll to reviews | baseline |
| Paywall seen | premium_upsell_view | — |
| Intent | premium_checkout_start | 15–25% of upsell views |
| Conversion | premium_convert | 5–12% of checkout starts |
| Activation | first_full_archive_read within 7d | >80% of converts |

### 17.3 Retention & churn

| Metric | Definition | Healthy range |
|--------|------------|---------------|
| Monthly churn | cancels / start of month active | <8% monthly |
| Annual renewal | renewed / up for renewal | >70% |
| D30 retention | still active 30d post sub | >85% |
| DAU/MAU premium | daily read / monthly subs | >20% |

### 17.4 LTV calculation

```
LTV = ARPU × (1 / churn_rate) × gross_margin
gross_margin ≈ 1 - (LS_fee ~5%) - (support_cost_per_user)
```

Cohort table (admin dashboard):

| Cohort | Subs | M1 retain | M3 retain | ARPU | LTV est |
|--------|------|-----------|-----------|------|---------|
| 2026-10 | | | | | |

### 17.5 Trust metrics (guardrails)

| Metric | Alert if |
|--------|----------|
| Review submit rate | drops >15% vs pre-paywall |
| GSC impressions country pages | drops >20% for 3 weeks |
| Support tickets «scam/paywall» | >5/week |
| Affiliate EPC | drops >20% (cannibalization) |

### 17.6 LTV vs Lead value

Compare:
- `LTV_premium` vs `lead_value` (manual: % leads converted to paid consultation × commission)

If `lead_value > LTV` on leg<3 pages → soften premium upsell there.

---

## 18. Technical implementation checklist

### 18.1 New files (planned)

```
app/components/premium/*           — UI components
app/composables/usePremium.ts    — entitlement check
app/composables/useBilling.ts    — checkout session
app/pages/premium.vue
app/pages/premium/success.vue
app/pages/login.vue
app/pages/account/index.vue
app/pages/account/subscription.vue
app/pages/admin/subscriptions/index.vue
app/middleware/premium-optional.global.ts
app/utils/premiumEntitlements.ts
app/locales/*/premium.ts
app/locales/*/account.ts
server/api/reviews/country/[slug].get.ts
server/api/reviews/city/[slug]/[city].get.ts
server/api/billing/checkout.post.ts
server/api/billing/portal.post.ts
server/api/webhook/lemon-squeezy.post.ts
server/utils/billing/lemonSqueezy.ts
server/utils/billing/entitlements.ts
supabase/migrations/019_premium_subscriptions.sql
tests/e2e/premium-paywall.spec.ts
```

### 18.2 Modified files

```
app/composables/useCountryPage.ts   — switch to API fetch
app/composables/useCityPage.ts      — switch to API fetch
app/pages/country/[slug]/index.vue  — PremiumBlurCard integration
app/pages/country/[slug]/[city].vue — same
app/components/ComparePageView.vue  — export gate
app/pages/country/[slug]/index.vue  — LeadForm upsell
app/utils/analytics.ts              — new events
app/locales/*/pages.ts              — monetization, privacy, terms
nuxt.config.ts                      — auth redirect, runtimeConfig
.env.example                        — LS keys
```

### 18.3 `usePremium` composable sketch

```ts
export function usePremium() {
  const user = useSupabaseUser()
  const entitlement = useState<{ isPremium: boolean; until: string | null }>('premium', () => ({ isPremium: false, until: null }))

  async function refreshEntitlement() {
    if (!user.value) return
    const data = await $fetch('/api/billing/entitlement')
    entitlement.value = data
  }

  const isPremium = computed(() => entitlement.value.isPremium)

  return { isPremium, refreshEntitlement, entitlement }
}
```

---

## 19. Risks & mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| SEO ranking drop | High | Same SSR for bot/user, keep N free full reviews |
| Trust backlash | High | Clear monetization copy, no rating payola |
| Low conversion | Medium | A/B quota, annual default, trial |
| Affiliate cannibalization | Medium | Track EPC by variant, keep affiliate free |
| Payment failures UA cards | Medium | LS + Wise/Revolut works; show alt methods |
| Webhook desync | Medium | Idempotency log + daily reconcile cron |
| Privacy «no registration» contradiction | Low | Update privacy before launch |
| Legal EU withdrawal | Medium | Waiver checkbox + counsel review |

---

## 20. Open questions (decisions needed)

1. **N=3** — confirm vs A/B 2/5?
2. **Lifetime tier** — launch day or wait for product-market fit?
3. **7-day trial** — annual only?
4. **City quota** — per-city N=3 or shared account-wide daily limit?
5. **Compare export** — v1 scope: CSV only or PDF too?
6. **EU legal entity** — timeline for Stripe migration?
7. **Review authors** — free Premium for contributors (≥1 approved review)?

---

## 21. Success criteria (90 days post-100% rollout)

| KPI | Target |
|-----|--------|
| Premium MRR | >€500 (adjust to baseline UV) |
| Conversion upsell→checkout | >5% |
| Monthly churn | <10% |
| GSC impressions | ±10% vs pre-launch |
| Review submit rate | ±5% vs pre-launch |
| NPS/ trust complaints | <3/month |
| Affiliate EPC | no >15% sustained drop |

---

## Appendix A: Trust-safe messaging cheat sheet

| ❌ Don't say | ✅ Say instead |
|-------------|----------------|
| «Premium отзывы» | «Premium доступ к архиву» |
| «Эксклюзивные рейтинги» | «Все рейтинги публичны в агрегатах» |
| «Лучшие отзывы» | «Полный архив community-отзывов» |
| «Подписка для авторов» | «Авторам — бесплатно, как и раньше» |

---

## Appendix B: Related docs

- [`docs/affiliate-ab-testing.md`](../affiliate-ab-testing.md) — EPIC-3.1
- [`docs/gsc-ctr-optimization.md`](../gsc-ctr-optimization.md) — EPIC-3.2
- [`docs/kpi-retro-template.md`](../kpi-retro-template.md)
- [`docs/moderation-sla.md`](../moderation-sla.md)
- `/about/monetization` — user-facing trust page

---

*Document owner: product/engineering. Next review: after Phase 0 spike completion.*
