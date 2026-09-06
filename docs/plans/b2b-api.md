# Triplandr — Roadmap: B2B API

**Версия:** 1.0 · **Дата:** сентябрь 2026  
**Статус:** планирование — Phase 0 (design + MVP spec)  
**Связанные артефакты:** [`country_stats`](../../supabase/migrations/003_country_stats.sql), [`useComparePage.ts`](../../app/composables/useComparePage.ts), [`leads.post.ts`](../../server/api/leads.post.ts), [media kit v0](../media-kit-v0.md)

---

## Executive summary

Triplandr накопил уникальный датасет: **модерируемые отзывы эмигрантов**, агрегированные по паре `(target_country, author_nationality)` в `country_stats`, плюс compare-логика и лид-форма. B2B API монетизирует этот актив для **relocation agencies, HR, insurers, media** без компромисса consumer-бренда («честные отзывы»).

**Рекомендация:** Phase 1 MVP — **read-only REST API** (stats + anonymized snippets + compare) с API keys, rate tiers, OpenAPI spec. Leads API и write-endpoints — Phase 3+. Инфраструктура: начать с **Nuxt server routes** + Supabase + CDN cache; выделить отдельный сервис при >500k API calls/mo или enterprise SLA.

---

## 1. Стратегический контекст

### 1.1 Почему B2B API для Triplandr

| Consumer (B2C) | Business (B2B) |
|----------------|----------------|
| Читает отзывы, сравнивает страны | Встраивает данные в CRM, лендинги, отчёты |
| Monetization: affiliate, ads, sponsor | Monetization: API subscription, enterprise license |
| Trust = no pay-for-play reviews | Trust = **licensed aggregates**, no PII |

Triplandr уже имеет:

- **Materialized stats** (`country_stats`): 10 rating dimensions + `total_reviews`.
- **Compare engine** (`aggregateCountryStats`, `/compare/[pair]`).
- **Nationality filter** — редкое конкурентное преимущество (UA-first, расширяемо).
- **Moderation pipeline** — качество данных выше open scraping.
- **Leads** (`server/api/leads.post.ts`, таблица `leads`) — потенциальный Phase 3 product.

### 1.2 Чего API **не** делает (brand guardrails)

- Не отдаёт PII авторов отзывов.
- Не позволяет «покупать» рейтинги или влиять на stats.
- Не re-identify reviewers (k-anonymity thresholds).
- Не конкурирует с consumer UX (premium features — см. §10).

### 1.3 Positioning statement (для sales)

> **Triplandr Data API** — агрегированные рейтинги и анонимизированные цитаты реальных эмигрантов по странам и национальностям. Для продуктов релокации, HR и медиа, которым нужны данные «из поля», а не маркeting brochures.

---

## 2. Целевые клиенты (ICP)

### 2.1 Primary ICP

| Segment | Use case | API products | Willingness to pay |
|---------|----------|--------------|-------------------|
| **Relocation agencies** | Widget «рейтинг страны для UA» на лендинге | Stats, compare, snippets | €99–499/mo |
| **Visa / immigration services** | Контент для blog + lead qual | Stats by nat, hub metadata | €49–199/mo |
| **HR / relocation platforms** | Destination scoring for assignees | Compare, multi-country stats | €299–2k/mo |
| **Insurers (expat health/travel)** | Risk/destination insights | Safety, healthcare aggregates | Enterprise |
| **Media / research** | Citations, data journalism | Snippets + stats export | €199–999/mo |

### 2.2 Secondary ICP

| Segment | Use case | Notes |
|---------|----------|-------|
| **PropTech / housing abroad** | Country attractiveness index | Aligns with housing affiliate vertical |
| **EdTech (study abroad)** | Compare destinations | EN locale growth |
| **Government diaspora programs** | Aggregate sentiment (anonymized) | Public sector; longer sales cycle |
| **Chatbot / AI assistants** | RAG over licensed snippets | Requires strict ToS on retraining |

### 2.3 Anti-ICP (do not sell)

- Data brokers для re-identification.
- Конкуренты review platforms для bulk scrape replacement.
- Affiliate arbitrage без disclosure.
- Политические кампании / influence ops.

### 2.4 Buyer personas

| Persona | Title | Pain | Message |
|---------|-------|------|---------|
| **Agency owner** | CEO, relocation firm | «Клиенты спрашивают про Польшу vs Чехию — нужны цифры» | Compare API + embed widget |
| **Product manager** | HR tech | «Нет niche data по nationality» | Stats API + webhooks (Phase 2) |
| **Editor** | Media outlet | «Нужна цитата + цифра для статьи» | Snippets + attribution license |
| **Data analyst** | Insurer | «Aggregate safety/healthcare trends» | Bulk export (Enterprise) |

---

## 3. Продуктовая линейка API

### 3.1 Product matrix

| Product ID | Name | Description | Phase |
|------------|------|-------------|-------|
| `stats` | Country Stats | Aggregates from `country_stats` | **MVP** |
| `snippets` | Review Snippets | Truncated anonymized text, no author ID | **MVP** |
| `compare` | Compare | Head-to-head two countries for nationality | **MVP** |
| `catalog` | Catalog | Countries, nationalities, review counts | **MVP** |
| `trends` | Trends | MoM delta in avg_overall (computed) | Phase 2 |
| `leads` | Leads Referral | Qualified relocation leads (opt-in) | Phase 3 |
| `webhooks` | Webhooks | Stats refresh, new hub article | Phase 2 |
| `embed` | Embed widgets | Hosted iframe/JS widget | Phase 2 |

### 3.2 Stats API (core)

**Source:** `country_stats` table.

**Dimensions:**

- `target_country` (ISO 3166-1 alpha-2)
- `author_nationality` (ISO 3166-1 alpha-2)

**Metrics per cell:**

```
avg_legalization, avg_attitude, avg_cost_of_living, avg_safety,
avg_bureaucracy, avg_weather, avg_language_barrier,
avg_cleanliness, avg_healthcare, avg_overall, total_reviews, updated_at
```

**Privacy rule:** если `total_reviews < k` (k=5 default, 10 for enterprise export) → **404 или masked** (`null` averages, only band «low sample»).

### 3.3 Review Snippets API

**Source:** `reviews` where `is_approved = true`.

**Output fields (allowlist):**

| Field | Exposed | Notes |
|-------|---------|-------|
| `id` | ✅ | Opaque UUID — **not** linkable to author |
| `target_country` | ✅ | |
| `author_nationality` | ✅ | |
| `city_name` | ✅ optional | If not identifying |
| `ratings.overall` | ✅ | |
| `text` | ✅ truncated | Max 280 chars default; full text Enterprise |
| `created_at` | ✅ month precision only | `2026-08` not exact timestamp |
| `author_profile` | ❌ | Never |
| email / IP | ❌ | Never |

**k-anonymity:** snippet list only returned if ≥5 reviews exist for `(country, nat)` filter.

### 3.4 Compare API

Wraps logic from `useComparePage.ts` / `aggregateCountryStats`:

```
GET /v1/compare?a=PL&b=DE&nat=UA
```

Response: winner per category, weighted averages, review counts, optional `methodology` block.

**Indexable parity:** same data as public `/compare/pl-vs-de?nat=UA` — API не даёт «secret» ratings.

### 3.5 Leads API (Phase 3 — sensitive)

**Current:** consumer POST `server/api/leads.post.ts` → Supabase `leads` → Telegram notify.

**B2B product options:**

| Model | Description | Risk |
|-------|-------------|------|
| **Lead referral** | Agency receives opt-in leads matching country/nat | GDPR, consent wording |
| **Lead insights** | Aggregate count of leads per country (no PII) | Low risk — Phase 2 |
| **Webhook on lead** | Real-time notify partner | High — needs DPA |

**Requirement:** explicit checkbox consent on `LeadForm.vue`; separate `partner_id` routing; **never** sell raw email without double opt-in.

### 3.6 Catalog API

```
GET /v1/countries          — list with review counts
GET /v1/nationalities      — list with review counts  
GET /v1/countries/{code}/cities — if city_stats exposed
```

Supports discovery and SDK generation.

---

## 4. Аутентификация и rate tiers

### 4.1 Auth methods by phase

| Phase | Method | Use case |
|-------|--------|----------|
| MVP | **API Key** (`Authorization: Bearer tpd_live_xxx`) | Server-to-server |
| Phase 2 | **OAuth 2.0 client credentials** | Enterprise SSO integration |
| Phase 2 | **Scoped keys** (read:stats, read:snippets) | Principle of least privilege |
| Never MVP | User OAuth (3-legged) | Consumer login not required |

### 4.2 API key format

```
tpd_live_{32_hex}   — production
tpd_test_{32_hex}   — sandbox (synthetic/snapshot data)
```

Storage: hash (SHA-256) in Supabase `api_keys` table; prefix stored for identification.

### 4.3 Rate tiers

| Tier | Price | Requests/mo | Rate limit | Snippets/call | Support |
|------|-------|-------------|------------|---------------|---------|
| **Free** | €0 | 1 000 | 10 req/min | 3 max | Community |
| **Starter** | €49/mo | 25 000 | 60 req/min | 10 | Email |
| **Pro** | €199/mo | 250 000 | 300 req/min | 25 | Email + SLA 48h |
| **Enterprise** | Custom | Unlimited* | Custom | 100 | DPA, dedicated |

*Fair use; soft cap + overage €0.50/1k requests.

### 4.4 Quota headers

Every response:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1693526400
X-Triplandr-Tier: pro
```

429 body: `{ "error": "rate_limit_exceeded", "retry_after": 12 }`

---

## 5. REST API design

### 5.1 Base URL and versioning

```
Production:  https://api.triplandr.com/v1
Sandbox:     https://api.sandbox.triplandr.com/v1
```

- Version in path (`/v1`) — breaking changes → `/v2`.
- Non-breaking additions (new optional fields) allowed in v1.
- Deprecation policy: 12 months notice; `Sunset` header.

### 5.2 Endpoint catalog (MVP)

#### Stats

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/stats` | List stats; query: `country`, `nat`, `min_reviews` |
| GET | `/v1/stats/{country}` | All nationalities for country |
| GET | `/v1/stats/{country}/{nat}` | Single cell |

#### Snippets

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/snippets` | Query: `country`, `nat`, `limit`, `min_overall` |
| GET | `/v1/snippets/{id}` | Single snippet |

#### Compare

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/compare` | Query: `a`, `b`, `nat` (required) |
| GET | `/v1/compare/pairs` | Curated popular pairs (from `comparePairs.ts`) |

#### Catalog

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/countries` | |
| GET | `/v1/nationalities` | |

#### Meta

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/health` | Public, no auth |
| GET | `/v1/openapi.json` | Public spec |

### 5.3 Example: GET /v1/stats/PL/UA

**Request:**

```http
GET /v1/stats/PL/UA HTTP/1.1
Host: api.triplandr.com
Authorization: Bearer tpd_live_a1b2c3...
Accept: application/json
Accept-Language: uk
```

**Response 200:**

```json
{
  "data": {
    "target_country": "PL",
    "author_nationality": "UA",
    "total_reviews": 142,
    "averages": {
      "legalization": 3.8,
      "attitude": 4.2,
      "cost_of_living": 3.5,
      "safety": 4.1,
      "bureaucracy": 2.9,
      "weather": 3.0,
      "language_barrier": 2.8,
      "cleanliness": 4.0,
      "healthcare": 3.7,
      "overall": 3.9
    },
    "updated_at": "2026-08-28T14:22:00Z"
  },
  "meta": {
    "attribution": "Data © Triplandr — triplandr.com",
    "license": "https://triplandr.com/terms/api"
  }
}
```

**Response 404 (k-anonymity):**

```json
{
  "error": "insufficient_sample",
  "message": "Fewer than 5 reviews for this country/nationality pair"
}
```

### 5.4 Example: GET /v1/compare?a=PL&b=CZ&nat=UA

```json
{
  "data": {
    "nationality": "UA",
    "countries": ["PL", "CZ"],
    "review_counts": { "PL": 142, "CZ": 87 },
    "categories": [
      {
        "key": "overall",
        "values": { "PL": 3.9, "CZ": 4.1 },
        "winner": "CZ"
      }
    ],
    "methodology": "Weighted by total_reviews per country_stats row"
  }
}
```

### 5.5 Error model

| HTTP | Code | When |
|------|------|------|
| 400 | `invalid_parameter` | Bad country code |
| 401 | `unauthorized` | Missing/invalid key |
| 403 | `forbidden` | Tier doesn't include endpoint |
| 404 | `not_found` / `insufficient_sample` | |
| 429 | `rate_limit_exceeded` | |
| 500 | `internal_error` | |

### 5.6 Pagination

Cursor-based for list endpoints:

```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6...",
    "has_more": true
  }
}
```

---

## 6. OpenAPI spec outline

**File:** `docs/api/openapi.v1.yaml` (to create in Phase 0)

```yaml
openapi: 3.1.0
info:
  title: Triplandr Data API
  version: 1.0.0
  description: Aggregated relocation review statistics and anonymized snippets.
  contact:
    email: api@triplandr.com
  license:
    name: Triplandr API Terms
    url: https://triplandr.com/terms/api

servers:
  - url: https://api.triplandr.com/v1
  - url: https://api.sandbox.triplandr.com/v1

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: API Key

  schemas:
    CountryCode:
      type: string
      pattern: '^[A-Z]{2}$'
    StatsCell:
      type: object
      required: [target_country, author_nationality, total_reviews, averages]
      properties:
        target_country: { $ref: '#/components/schemas/CountryCode' }
        author_nationality: { $ref: '#/components/schemas/CountryCode' }
        total_reviews: { type: integer, minimum: 0 }
        averages: { $ref: '#/components/schemas/RatingAverages' }
        updated_at: { type: string, format: date-time }
    RatingAverages:
      type: object
      properties:
        overall: { type: number, minimum: 1, maximum: 5 }
        # ... other dimensions
    Snippet:
      type: object
      properties:
        id: { type: string, format: uuid }
        text: { type: string, maxLength: 280 }
        target_country: { $ref: '#/components/schemas/CountryCode' }
        author_nationality: { $ref: '#/components/schemas/CountryCode' }
        period: { type: string, example: '2026-08' }
    ApiError:
      type: object
      required: [error, message]
      properties:
        error: { type: string }
        message: { type: string }

paths:
  /stats/{country}/{nat}:
    get:
      operationId: getStatsCell
      tags: [Stats]
      summary: Get aggregated stats for country × nationality
      parameters:
        - name: country
          in: path
          required: true
          schema: { $ref: '#/components/schemas/CountryCode' }
        - name: nat
          in: path
          required: true
          schema: { $ref: '#/components/schemas/CountryCode' }
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  data: { $ref: '#/components/schemas/StatsCell' }
        '404':
          description: Not found or insufficient sample
  # ... compare, snippets, catalog
```

**Tooling:**

- Generate docs: Scalar / Redoc at `developers.triplandr.com`
- SDK Phase 2: `openapi-typescript` → `@triplandr/api-client`

---

## 7. Data licensing и Terms of Service

### 7.1 License model

| Tier | License scope |
|------|---------------|
| Free | Internal evaluation; attribution required; no resale |
| Starter/Pro | Production embed; attribution; no bulk redistribution |
| Enterprise | Custom: white-label, offline export, media syndication |

### 7.2 Mandatory attribution

```
Data © Triplandr (triplandr.com)
```

Link required on public-facing surfaces using API data.

### 7.3 Prohibited uses (API ToS)

1. **Re-identification** of reviewers (combine with external datasets).
2. **Scraping** consumer site to bypass API or enrich beyond licensed fields.
3. **Misrepresentation** as official government or embassy data.
4. **Training ML models** on snippet text without Enterprise AI addendum.
5. **Sub-licensing** without written consent.
6. Influencing or requesting moderation changes tied to payment.

### 7.4 GDPR / privacy

| Data type | Legal basis | Notes |
|-----------|-------------|-------|
| Aggregates | Legitimate interest / license | No PII |
| Snippets | Same; anonymized at source | Month-precision dates |
| Leads (Phase 3) | Consent | Separate DPA with partner |

**DPA template:** Enterprise tier; subprocessors: Supabase, Vercel.

### 7.5 Consumer site alignment

Update `/about/terms` + new `/about/terms/api` (ru/en/uk):

- API customers ≠ review sponsors.
- Stats reflect moderated UGC, not official statistics.

---

## 8. Pricing и packaging

### 8.1 Freemium rationale

Free tier (1k req/mo) enables:

- Developer evaluation
- Small agency pilot
- Media single-article citation

Conversion trigger: rate limit hit → in-dashboard upgrade.

### 8.2 Pricing table (launch)

| Plan | Monthly | Annual (−20%) | Best for |
|------|---------|---------------|----------|
| Free | €0 | — | Dev / trial |
| Starter | €49 | €470 | Single-country agency site |
| Pro | €199 | €1 910 | Multi-country HR widget |
| Enterprise | from €999 | Custom | Insurer, platform, media group |

### 8.3 Add-ons

| Add-on | Price | Description |
|--------|-------|-------------|
| Embed widget | +€29/mo | Hosted compare/stats widget |
| AI summary | +€99/mo | Pre-computed country summaries (Phase 2) |
| Leads bundle | CPL €15–40 | Qualified leads (Phase 3) |
| Custom nationality report | €500 one-time | PDF + data export |

### 8.4 Revenue projections (illustrative)

| Month | Free | Starter | Pro | Enterprise | MRR |
|-------|------|---------|-----|------------|-----|
| M6 | 40 | 3 | 0 | 0 | €147 |
| M12 | 80 | 12 | 3 | 1 | €1 785 |
| M18 | 120 | 25 | 8 | 2 | €4 712 |

Assumes outbound sales + inbound from media kit / SEO «Triplandr API».

---

## 9. Инфраструктура

### 9.1 Architecture options

```
Option A (MVP — recommended)
┌──────────────┐     ┌─────────────────────┐     ┌───────────┐
│   Client     │────►│ Nuxt server routes  │────►│ Supabase  │
│  (B2B app)   │     │ /server/api/v1/*    │     │ Postgres  │
└──────────────┘     └─────────┬───────────┘     └───────────┘
                               │
                               ▼
                     ┌───────────────────┐
                     │ Vercel Edge Cache │
                     │ Cache-Control     │
                     └───────────────────┘

Option B (Scale — >500k req/mo)
┌──────────────┐     ┌─────────────────────┐
│   Client     │────►│ api.triplandr.com   │
└──────────────┘     │ (dedicated service) │
                     └─────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐    ┌────────────┐   ┌──────────┐
        │ Redis    │    │ Supabase   │   │ CDN      │
        │ rate lim │    │ read rep   │   │ Cloudflare│
        └──────────┘    └────────────┘   └──────────┘
```

### 9.2 MVP: Nuxt server routes

**Pros:**

- Reuse Supabase client, types, `aggregateCountryStats`.
- Single deploy pipeline (Vercel).
- Fast time-to-market.

**Cons:**

- Couples B2B traffic with consumer app.
- Rate limiting needs Upstash Redis or Vercel KV.

**Route layout:**

```
server/api/v1/stats/[country]/[nat].get.ts
server/api/v1/stats/index.get.ts
server/api/v1/snippets/index.get.ts
server/api/v1/compare/index.get.ts
server/api/v1/countries/index.get.ts
server/api/v1/health.get.ts
server/middleware/api-auth.ts
server/utils/apiKeys.ts
server/utils/apiRateLimit.ts
server/utils/apiResponse.ts
```

**Subdomain routing (`nuxt.config.ts` / Vercel):**

- `api.triplandr.com` → same Nuxt project, path prefix `/api/v1`

### 9.3 Caching strategy

| Endpoint | TTL | Cache key |
|----------|-----|-----------|
| `/stats/{c}/{n}` | 1 hour | `stats:PL:UA` |
| `/compare` | 1 hour | `cmp:PL:DE:UA` |
| `/snippets` | 15 min | `snip:PL:UA:limit10` |
| `/catalog` | 24 hours | `catalog:countries` |

Headers:

```
Cache-Control: public, max-age=3600, s-maxage=3600
ETag: "abc123"
Vary: Authorization  # tier-specific fields only if needed
```

**Invalidation:** on review approval webhook → purge keys for affected `(country, nat)`.

### 9.4 CDN / edge

- Vercel Edge cache for GET responses.
- Cloudflare in front (optional) for DDoS + WAF rules on `/v1/*`.
- Geo blocking: none MVP; log anomalous regions.

### 9.5 Database access

- MVP: Supabase service role **read-only** views:

```sql
create view api_country_stats as
select * from country_stats
where total_reviews >= 5;

create view api_review_snippets as
select
  id,
  target_country,
  author_nationality,
  left(text, 280) as text,
  to_char(created_at, 'YYYY-MM') as period,
  (ratings->>'overall')::numeric as overall
from reviews
where is_approved = true;
```

- RLS bypass only in server routes with key validation — never expose service key client-side.

### 9.6 Sandbox environment

- `api.sandbox.triplandr.com` serves **snapshot** JSON (frozen dataset) or `total_reviews` fuzzed.
- Test keys `tpd_test_*` never hit production DB.

---

## 10. Связь с premium consumer product

### 10.1 Product boundary

| Feature | Consumer free | Consumer premium (future) | B2B API |
|---------|---------------|---------------------------|---------|
| Read reviews on site | ✅ | ✅ | ❌ (use snippets license) |
| Compare tool | ✅ | ✅ + save/history | ✅ programmatic |
| Ad-free | — | ✅ | N/A |
| Export PDF report | — | ✅ | Enterprise |
| API access | ❌ | ❌ (except power-user tier?) | ✅ |
| Leads to agencies | opt-in form | — | ✅ paid |

### 10.2 Premium consumer (hypothesis)

**Triplandr Plus** €5–9/mo:

- Saved comparisons
- Email alerts when country stats change
- Ad-free (if display ads exist)
- **No raw API** — prevents cannibalization

B2B API buyers pay for **scale, embed, license, SLA** — not for same UX as consumer.

### 10.3 Single data pipeline

```
reviews (moderated) → country_stats refresh trigger → consumer UI + B2B API views
```

One source of truth; no «API-only» rating manipulation.

---

## 11. Sales motion и media kit

### 11.1 Go-to-market phases

| Phase | Motion | Target |
|-------|--------|--------|
| MVP | Founder-led outbound | 5 UA relocation agencies |
| M6 | Self-serve Stripe checkout | Starter tier |
| M12 | Partner integrations (HR platforms) | Pro + Enterprise |
| M18 | Data journalism bundles | Media |

### 11.2 Sales collateral

| Asset | Status | Link |
|-------|--------|------|
| Media kit v0 | ✅ Exists | [media-kit-v0.md](../media-kit-v0.md) |
| API one-pager PDF | 🔲 Create | Export from this doc + OpenAPI |
| Developer portal | 🔲 Phase 1 | `developers.triplandr.com` |
| Sample widget demo | 🔲 Phase 2 | Embed on `/about/api-demo` |

### 11.3 Pitch email template (agency)

> Subject: Дані Triplandr для вашого лендингу — рейтинги UA в PL/CZ/DE  
>  
> Triplandr — {N} модерованих відгуків емігрантів. Пропонуємо API/widget: агреговані оцінки по 10 критеріях для українців у {country}.  
>  
> Free tier — 1000 запитів/міс для тесту. [Media kit](../media-kit-v0.md) · API docs

### 11.4 Inbound channels

- Footer link «API для бизнеса» → `/developers`
- Mention in [monetization page](https://triplandr.com/about/monetization) (B2B section)
- Post in Telegram channel (1× after launch)

### 11.5 CRM tracking

Log in admin or Notion:

- Lead source, tier interest, countries needed, integration type (widget vs backend).

---

## 12. Фазовый roadmap

### Phase 0 — Design (недели 1–4)

- [ ] Finalize OpenAPI v1 draft
- [ ] Legal: API Terms draft
- [ ] `api_keys` migration + admin UI sketch
- [ ] k-anonymity thresholds signed off
- [ ] Landing `/developers` copy (ru/en/uk)
- [ ] Identify 10 design partners (agencies)

**Exit criteria:** OpenAPI reviewed; 2 LOIs from agencies.

### Phase 1 — MVP Read-only (недели 5–12)

**Scope:**

- [ ] Auth: API keys + rate limiting (Upstash)
- [ ] Endpoints: stats, snippets, compare, catalog, health
- [ ] Supabase views with k-anonymity
- [ ] CDN caching + ETag
- [ ] Public OpenAPI + Scalar docs
- [ ] Free + Starter Stripe billing
- [ ] Admin: key issuance, revoke, usage dashboard basic

**Exit criteria:** 3 paying Starter customers; p99 latency <300ms; zero PII leaks in audit.

### Phase 2 — Growth (месяцы 4–6)

- [ ] OAuth client credentials
- [ ] Webhooks (stats updated)
- [ ] Embed widget (compare + stats)
- [ ] Trends endpoint (MoM delta)
- [ ] Pro tier + overage billing
- [ ] SDK `@triplandr/api-client` (TS)
- [ ] Sandbox environment

**Exit criteria:** 250k API calls/mo; 1 Enterprise pilot.

### Phase 3 — Platform (месяцы 7–12)

- [ ] Leads referral API (with DPA)
- [ ] Lead aggregate insights (non-PII)
- [ ] AI summaries add-on (precomputed, not live LLM on PII)
- [ ] Evaluate dedicated API service (Option B)
- [ ] SOC2-lite security questionnaire for Enterprise

**Exit criteria:** Leads CPL revenue; 2 Enterprise contracts.

### Phase 4 — Scale (12+ месяцев)

- [ ] GraphQL gateway (if demanded)
- [ ] Bulk historical export
- [ ] White-label embed
- [ ] International expansion data (beyond UA-first nat)

---

## 13. Security и abuse prevention

### 13.1 Threat model

| Threat | Mitigation |
|--------|------------|
| API key leak | Rotate keys; prefix in logs only; hash at rest |
| Scraping via API | Rate limits; anomaly detection; ToS |
| Key sharing | Per-key usage patterns; seat-based Enterprise |
| DDoS | Cloudflare + Vercel protection |
| SQL injection | Parameterized Supabase queries |
| Mass enumeration of snippets | Cursor pagination max; rate limit |
| Re-identification attacks | k-anonymity; truncate text; month dates |
| Insider abuse | Audit log on admin key creation |

### 13.2 Rate limiting implementation

```ts
// server/utils/apiRateLimit.ts — sketch
// Upstash Redis sliding window: key = api_key_id + window
// Free: 10/min; Starter: 60/min; Pro: 300/min
```

Return 429 with `Retry-After`.

### 13.3 Audit logging

Table `api_request_logs` (retention 90 days):

- `key_id`, `endpoint`, `status`, `latency_ms`, `ip_hash`, `timestamp`
- No query string with sensitive data

### 13.4 Security headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000
```

### 13.5 Pen test checklist (pre-Enterprise)

- [ ] IDOR on snippet UUIDs
- [ ] Bypass k-anonymity via parameter fuzzing
- [ ] Key scope escalation
- [ ] Cache poisoning between tiers

### 13.6 Incident response

1. Revoke compromised keys (admin one-click).
2. Post-mortem within 72h for PII breach.
3. Notify Enterprise customers per DPA.

---

## 14. Observability и SLA

| Metric | Target (Pro) |
|--------|--------------|
| Uptime | 99.5% |
| p95 latency | <500ms |
| Error rate | <0.1% |

**Stack:** Sentry (`sentry.client.ts` pattern for server), Vercel logs, optional Datadog.

**Status page:** `status.triplandr.com` (Phase 2).

---

## 15. Admin и developer experience

### 15.1 Developer portal pages

| Page | Content |
|------|---------|
| `/developers` | Overview, pricing, CTA |
| `/developers/docs` | Scalar OpenAPI UI |
| `/developers/dashboard` | Keys, usage, billing (Phase 1) |
| `/developers/changelog` | API version history |

### 15.2 Admin extensions

Extend `app/pages/admin/`:

- `admin/api-keys/index.vue` — list/create/revoke keys
- `admin/api-usage/index.vue` — requests per key, top endpoints

---

## 16. KPIs

| KPI | M6 target | M12 target |
|-----|-----------|------------|
| Paying API customers | 5 | 25 |
| API MRR | €250 | €2 000 |
| API calls/mo | 50k | 500k |
| Churn (Starter) | <10%/q | <8%/q |
| Sales lead → paid conversion | 15% | 20% |
| PII incidents | 0 | 0 |

Track in [KPI retro template](../kpi-retro-template.md).

---

## 17. Риски

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low sample sizes | API useless for long-tail | Set expectations; catalog shows counts |
| Legal challenge (UGC) | High | ToS + moderation + anonymization |
| Cannibalize consumer SEO | Medium | API serves aggregates, not full HTML |
| Partner wants exclusive data | Medium | Enterprise custom; no exclusivity on public stats |
| Engineering distraction | Medium | Strict MVP scope; Phase gates |

---

## 18. Open questions

1. Publish exact review text vs 280 chars — Enterprise only?
2. City-level stats API (`city_stats`) — Phase 2 if n≥5 per city?
3. Stripe Tax for EU B2B VAT?
4. Ukrainian legal entity for invoicing agencies?

---

## 19. Связанные документы

- [Media kit v0](../media-kit-v0.md) — sponsorship + outreach
- [Affiliate A/B testing](../affiliate-ab-testing.md) — consumer monetization parallel track
- [Moderation SLA](../moderation-sla.md) — data quality guarantee
- [AdSense hero deferred plan](./adsense-hero-deferred.md) — B2C display strategy
- [KPI retro template](../kpi-retro-template.md)

---

## Appendix A — Database schema (api_keys)

```sql
-- supabase/migrations/0XX_api_keys.sql (draft)
create table api_keys (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  key_prefix    text not null,          -- first 8 chars for display
  key_hash      text not null unique,   -- sha256(full key)
  tier          text not null default 'free'
                check (tier in ('free','starter','pro','enterprise')),
  scopes        text[] not null default '{read:stats,read:snippets,read:compare}',
  owner_email   text not null,
  stripe_customer_id text,
  revoked_at    timestamptz,
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz
);

create table api_usage_daily (
  key_id        uuid references api_keys(id),
  day           date not null,
  request_count int not null default 0,
  primary key (key_id, day)
);
```

## Appendix B — Middleware sketch

```ts
// server/middleware/api-auth.ts
export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/v1/')) return
  if (event.path === '/api/v1/health') return

  const token = getBearerToken(event)
  if (!token) throw createError({ statusCode: 401, message: 'Missing API key' })

  const key = await validateApiKey(token)
  if (!key) throw createError({ statusCode: 401, message: 'Invalid API key' })

  await enforceRateLimit(key)
  event.context.apiKey = key
})
```

## Appendix C — Competitive landscape

| Competitor | Gap Triplandr fills |
|------------|---------------------|
| Numbeo | No nationality-filtered emigrant reviews |
| Expat forums | Unstructured, not API-ready |
| Government stats | Not experiential / emigrant POV |
| Generic review APIs | Not relocation-specific dimensions |

---

*Документ не является юридической консультацией. API Terms и DPA требуют review с legal до Phase 1 launch.*
