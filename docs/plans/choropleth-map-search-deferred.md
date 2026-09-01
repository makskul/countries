# Choropleth / Map Search — отложенный продуктово-технический roadmap

**Проект:** Triplandr (`/countries`)  
**Статус:** 🛑 **DEFER** — не начинать до выполнения gate-критериев SEO  
**Дата:** 2026-09-01  
**Связанные артефакты:** `HomeWorldMap.vue`, `worldMapGeo.ts`, `worldMapRegions.ts`, `country_stats`, Compare SEO (54 пары)

---

## Краткое резюме

Интерактивная карта на главной (`HomeWorldMap.vue`) **уже решает задачу «обзор + CTA»** через список стран и подсветку SVG, **без кликабельных полигонов** — это осознанное продуктовое решение. Полноценный **choropleth** (градиент по рейтингу / стоимости / кол-ву отзывов) + **поиск по названию страны** + **фильтры на карте** — отдельный EPIC уровня **3–5 недель** (MVP) / **6–8 недель** (production-ready с мобилой, a11y, SEO-страницами).

**Стратегия:** сначала монетизировать и масштабировать **SEO-трафик** (compare-лендинги 54 пары × 3 локали, nat-лендинги `?nat=UA`, country hub). Карта — **engagement-слой**, не acquisition. Строить choropleth имеет смысл, когда органика стабильна и compare CTR отработан — иначе инвестиция уйдёт в фичу с низким ROI при текущем объёме сессий.

---

## 1. Почему откладываем (WHY DEFER)

### 1.1 SEO-first стратегия

| Приоритет (сейчас) | Статус | Ожидаемый эффект |
|--------------------|--------|------------------|
| Compare pages (`/compare/{pair}?nat=UA`) | ✅ Shipped (54 пары) | Long-tail «A чи B для українців», индексируемые URL |
| Nat country landings (`/country/{slug}?nat=UA`) | ✅ В sitemap | Высокий intent, visa/legalization queries |
| GSC CTR optimization | 🔄 В процессе ([gsc-ctr-optimization.md](../gsc-ctr-optimization.md)) | +10% relative CTR на 5+ URL за цикл |
| Content hub / region pages | 📋 Backlog | Кластерные landing под регионы |
| **Choropleth / map search** | 🛑 **DEFER** | Retention/engagement, не новые landing |

**Логика:** поисковый трафик приходит на **текстовые landing** (compare, country, nat). Карта на `/` не индексируется как отдельный URL и не ранжируется по «карта отзывов украинцев». Доработка карты **не увеличит impressions** в GSC; compare и country pages — да.

**Opportunity cost:** 3–5 недель инженерии на choropleth = столько же недель **не** потраченных на:
- CTR-тюнинг 54 compare slug × 3 локали;
- region hub pages (`/countries/europe`, `/countries/asia`);
- контент hub (UA × target countries с `total_reviews = 0`);
- E2E/smoke покрытие compare funnel.

### 1.2 Текущая UX-рациональность карты (as-is)

`HomeWorldMap.vue` спроектирован как **«карта-иллюстрация + список-навigator»**:

```
┌─────────────────────────────────────────────────────────┐
│  [World][Europe][Asia]…  →  [E.Europe][W.Europe]…       │
│  Scope: 🇺🇦 Showing reviews from Ukrainians  [Show all]  │
├──────────────────────────┬──────────────────────────────┤
│                          │  Detail panel (selected)     │
│   SVG world map          │  ─────────────────────────   │
│   pointer-events: none   │  Country list (listbox)      │
│   highlight via list     │  ← единственный input        │
└──────────────────────────┴──────────────────────────────┘
```

**Ключевые решения в коде:**

| Решение | Где | Зачем |
|---------|-----|-------|
| `pointer-events: none` на `.worldmap` и `.map-country` | CSS строки 690–699 | Карта не перехватывает клики; нет «случайных» тапов по мелким странам (Benelux, Baltics) |
| Выбор только из списка (`role="listbox"`) | Template строки 170–198 | Предсказуемый UX, полная клавиатурная навигация по списку |
| Бинарная заливка `has-data` / no-data | CSS `.map-country.has-data` | Простая легенда; не вводит пользователя в заблуждение при sparse data |
| Фильтр по nationality scope | Props `scopeNationality`, `showAllNationalities` | Персонализация без auth |
| Анимация viewBox при выборе | `animateViewBox`, `getCountryFocusViewBox` | Визуальная связь список ↔ карта без hit-testing |
| Событие `map_country_select` | `useAnalytics.ts` | Уже есть baseline для post-launch A/B |

**Hint в UI (en):** *«Pick a region, then a country from the list — it highlights on the map»* — явно задаёт mental model.

**Вывод:** choropleth + click-on-map **меняет mental model** и требует переобучения пользователей + новых паттернов a11y. Делать это до product-market fit по SEO — преждевременно.

### 1.3 Стоимость ресурсов

| Статья | Оценка | Комментарий |
|--------|--------|-------------|
| Frontend (choropleth + search + filters) | 2–3 нед. | Зависит от стека (SVG increment vs MapLibre) |
| Backend / data layer | 0.5–1 нед. | Агрегация `country_stats`, API endpoint, кэш |
| Mobile UX (touch targets, bottom sheet) | 1–1.5 нед. | Критично: 60%+ трафика mobile |
| Accessibility (WCAG 2.1 AA) | 0.5–1 нед. | Keyboard map nav, screen reader, contrast |
| SEO (indexable map views, structured data) | 0.5–1 нед. | Опционально; может добавить thin content risk |
| QA + E2E | 0.5 нед. | Playwright smoke для map interactions |
| Design (legend, color scales, empty states) | 0.5 нед. | Colorblind-safe palettes |
| **Итого MVP** | **3–5 нед.** | 1 FTE |
| **Production-ready** | **6–8 нед.** | + indexable views, premium filters, perf hardening |

**Bundle impact:** текущий `worldMapGeo.ts` ≈ **206 KB** (173 страны, inline SVG paths). MapLibre GL + style/tiles добавят **~200–400 KB gzip** client-side. D3 choropleth — **~30 KB** + geojson **~100–300 KB** (можно lazy-load).

---

## 2. Gate-критерии: когда greenlight

Все критерии — **AND** (все должны быть выполнены **2 месяца подряд** или **3 из 4** при явном решении PM). Источники: Plausible, GSC, Supabase admin, [KPI retro template](../kpi-retro-template.md).

### 2.1 Органические сессии (Plausible)

| Метрика | Порог greenlight | Текущий baseline (ориентир) |
|---------|------------------|----------------------------|
| **Organic sessions / month** | ≥ **5 000** | План: 3k → 5k ([kpi-retro](../kpi-retro-template.md)) |
| **Organic share of total sessions** | ≥ **55%** | Убедиться, что рост не только paid/social |
| **MoM organic growth** | ≥ **+8%** или flat при ≥8k | Стабильность важнее spike |

**Почему 5k:** при ~200 DAU organics engagement-фича карты получает ~30–50 map interactions/day — достаточно для валидации choropleth metric toggle.

### 2.2 Индексация (GSC + sitemap)

| Метрика | Порог | Как считать |
|---------|-------|-------------|
| **Compare URLs indexed** | ≥ **90%** от `(54 pairs × 3 locales)` = **≥ 146 / 162** | GSC → Pages, filter `/compare/` |
| **Nat country landings indexed** | ≥ **85%** от target set (30+ UA hubs) | GSC filter `?nat=` |
| **Coverage errors (critical)** | **0** | GSC Coverage, no mass 404/redirect on compare |
| **Sitemap submitted & processed** | ✅ без «Couldn't fetch» | GSC Sitemaps |

**Почему:** если compare ещё не в индексе, SEO-EPIC не завершён — карта не приоритет.

### 2.3 Compare landing CTR (GSC)

| Метрика | Порог | Детали |
|---------|-------|--------|
| **Median CTR top-20 compare URLs** | ≥ **2.5%** при avg position 8–15 | 28-day window |
| **≥ 5 compare URLs с CTR uplift** | **+10% relative** vs baseline | По [gsc-ctr-optimization.md](../gsc-ctr-optimization.md) |
| **Impressions top compare slug** | ≥ **500 / 28d** хотя бы на 10 парах | Достаточный объём для stat sig |

**Пример:** `/uk/compare/pl-vs-de?nat=UA` — impressions ≥500, CTR ≥2.0% после title tweak.

### 2.4 Контентная плотность (Supabase)

| Метрика | Порог | Зачем для choropleth |
|---------|-------|---------------------|
| **Countries with ≥5 reviews (any nat)** | ≥ **40** | Иначе choropleth = 90% «no data» grey |
| **Countries with ≥10 reviews (UA authors)** | ≥ **25** | Nat-scoped choropleth meaningful |
| **Approved reviews / week** | ≥ **15** | Данные обновляются достаточно часто |

### 2.5 Engagement baseline (Plausible)

| Метрика | Порог | Действие если НЕ выполнен |
|---------|-------|---------------------------|
| `map_country_select` / session on `/` | ≥ **0.08** (8%) | Сначала улучшить list UX (см. §10) |
| Bounce rate `/` (organic) | ≤ **65%** | Hero/compare CTAs важнее карты |

### 2.6 Gate review process

1. **Ежемесячно** на KPI retro заполнять секцию «Map EPIC gate».
2. **Greenlight meeting:** PM + eng + SEO — чеклист §2.1–2.5.
3. **Document decision** в retro + создать Linear/Jira EPIC с ссылкой на этот doc.
4. **Soft start allowed:** только §10 «дешёвые победы» без gate — в любой момент.

---

## 3. Текущее состояние (as-is architecture)

### 3.1 Компоненты

```
app/components/HomeWorldMap.vue     ← главная карта (list-driven)
app/components/CountriesMiniMap.vue ← hover tooltip, pins (countries page hero)
app/utils/worldMapGeo.ts            ← 173 страны, SVG paths, RU_NAMES, ~206KB
app/utils/worldMapRegions.ts        ← континенты, subregions, viewBox, MAP_NAME_TO_CODE
app/composables/useHomepageData.ts  ← mapCountries: client-side agg from reviews table
app/pages/index.vue                 ← mapReviewData computed, nationality scope
```

### 3.2 Data flow (сейчас)

```
reviews (is_approved=true)
    │
    ▼ useHomepageData.mapCountries  ← full table scan + client-side groupBy
    │
    ▼ index.vue mapReviewData       ← filter by nationality scope
    │
    ▼ HomeWorldMap reviewData       ← Record<mapName, { code, rating, reviews }>
    │
    └── SVG path fill: has-data (binary purple) | default grey
```

**Проблемы для scale:**
- `mapCountries` тянет **все** approved reviews без pagination — O(n reviews).
- Не использует **`country_stats`** materialized table (хотя она есть и используется на country pages).
- Choropleth по категориям (cost, safety, …) потребует **multi-field** stats — `country_stats` уже содержит `avg_cost_of_living`, `avg_safety`, etc.

### 3.3 Geo data model

```typescript
// worldMapGeo.ts
type WorldCountry = [name: string, path: string, cx: number, cy: number]
// 173 entries, Natural Earth–derived simplified paths
```

Mapping: `MAP_NAME_TO_CODE` / `mapNameToCode()` / `codeToMapName()` — best-effort (England→GB, USA, Kosovo→XK, Cyprus split).

### 3.4 Analytics

| Event | Props | Status |
|-------|-------|--------|
| `map_country_select` | `country`, `has_reviews` | ✅ Live |

**Нужно добавить при choropleth:** `map_metric_change`, `map_search`, `map_country_click`, `map_filter_apply`.

---

## 4. Vision: целевой продукт

### 4.1 User stories

| ID | Как пользователь | Хочу | Чтобы |
|----|------------------|------|-------|
| V1 | UA migrant на `/` | Видеть **тепловую карту** по avg overall rating | Быстро понять «куда лучше» без чтения списка |
| V2 | Пользователь с nat=PL | Переключить метрику на **cost of living** | Найти affordable страны |
| V3 | Mobile user | **Искать** «Німеччина» / «Germany» | Не скроллить 40 стран в списке |
| V4 | Power user | Фильтр **min reviews ≥ 5** | Не видеть misleading 1-review outliers |
| V5 | Returning user | Кликнуть страну **на карте** | Открыть country page или side panel |
| V6 | SEO visitor на `/map/europe/rating` | Индексируемый обзор региона | Попасть с SERP (optional phase 3) |

### 4.2 Choropleth metrics (приоритет)

| # | Metric key | Source field | Color scale | Empty state |
|---|------------|--------------|-------------|-------------|
| 1 | `overall` | `avg_overall` | Red → Yellow → Green (1–5) | `#E7E4F3` grey |
| 2 | `reviews` | `total_reviews` | White → Deep purple (0–100+) | Grey |
| 3 | `cost` | `avg_cost_of_living` | Green (cheap) → Red (expensive) | Grey |
| 4 | `safety` | `avg_safety` | Ditto rating scale | Grey |
| 5 | `legalization` | `avg_legalization` | Ditto | Grey |

**Nat scope:** все метрики пересчитываются per `author_nationality` (как сейчас scope toggle).

**Legend:** continuous gradient bar + quantile breaks (5 buckets) — подписи локализованы.

### 4.3 Search

| Requirement | Spec |
|-------------|------|
| Input type | Combobox с autocomplete |
| Match fields | Localized name (uk/ru/en), ISO code, aliases («UK»→GB, «Чехия»→CZ) |
| Min chars | 2 |
| Results max | 8 |
| On select | Highlight country, pan map, open detail panel, track `map_search` |
| Empty | «No countries found» + link to `/countries` full list |

**Reuse:** `getCountryNameLocalized`, `RU_NAMES`, `CountryFilterBar` search logic from `/countries`.

### 4.4 Filters

| Filter | Type | Default |
|--------|------|---------|
| Nationality scope | Toggle (existing) | User nat or all |
| Metric | Segmented control | `overall` |
| Min reviews | Slider 0 / 3 / 5 / 10 | 0 |
| Region | Existing continent/subregion chips | `world` |
| Has data only | Checkbox | off |

**URL state (optional phase 2):** `/` query `?map_metric=cost&map_min_reviews=5&map_region=eastern_europe` — shareable, но **noindex** на query variants.

### 4.5 Interaction model (target)

**Desktop:** click country on map OR list → detail panel (keep).  
**Mobile:** tap country → bottom sheet (detail + CTA). Map scroll/zoom optional phase 2.

**Conflict resolution:** если включить map clicks, сохранить list as primary a11y path; map clicks = enhancement (`pointer-events: auto` only on countries with data or all countries).

---

## 5. Технические опции: MapLibre vs D3 vs SVG (current)

### 5.1 Сравнительная таблица

| Критерий | **A. Current SVG** (increment) | **B. D3 + GeoJSON** | **C. MapLibre GL JS** |
|----------|-------------------------------|---------------------|------------------------|
| **Migration effort** | ★ Low | ★★ Medium | ★★★ High |
| **Bundle size** | +5–20 KB (logic only) | +30 KB d3 + 100–300 KB geo (lazy) | +200–400 KB |
| **Choropleth** | Manual fill interpolation | `d3.scaleSequential`, quantiles | Fill layer + data-driven style |
| **Click/hover hit test** | SVG paths native | SVG or canvas | Built-in |
| **Zoom/pan** | viewBox animation (exists) | d3-zoom | Native, smooth |
| **Mobile perf** | Good (no WebGL) | Good | Medium (GPU, memory) |
| **SSR / Nuxt** | ✅ Client-only SVG | ✅ Client-only | ⚠️ WebGL client-only, no SSR |
| **Geo alignment** | ✅ Already have paths | Need GeoJSON from same source | Need tiles or geojson source |
| **Search + highlight** | Easy | Easy | Medium (feature-state) |
| **Accessibility** | Full control | Full control | Harder (canvas/WebGL) |
| **SEO (static fallback)** | Easy `<img>`/inline SVG | Medium | Hard (canvas) |
| **Future: city pins** | Manual cx/cy | d3 projection | Native symbol layers |

### 5.2 Рекомендация

**Phase 1 (recommended): Increment on current SVG (Option A+)**

- Enable `pointer-events: auto` on paths **после** добавления keyboard parity.
- Choropleth via computed `fill` from metric scale (`interpolateHsl` or CSS custom properties per path).
- Reuse `WORLD_COUNTRIES`, `worldMapRegions.ts`, `getCountryFocusViewBox`.
- **Why:** 80% vision, 30% effort; zero new dependencies; aligns with `CountriesMiniMap.vue` patterns.

**Phase 2 (if needed): D3 for scales only**

- Import `d3-scale`, `d3-interpolate` (~15 KB) — not full geo pipeline.
- Optional: convert `worldMapGeo.ts` → compressed GeoJSON at build time for consistency.

**Option C (MapLibre)** — только если product требует:
- pinch-zoom world exploration как core UX;
- overlay city clusters / routes;
- vector tile server уже есть.

**Не рекомендуется сейчас:** MapLibre для static choropleth on homepage — overkill + a11y tax.

### 5.3 Color scale implementation sketch (SVG path)

```typescript
// utils/mapChoropleth.ts
import { scaleLinear, scaleQuantile } from 'd3-scale'
import { interpolateRgb } from 'd3-interpolate'

export function buildCountryFill(
  value: number | null,
  metric: MapMetric,
  domain: [number, number],
): string {
  if (value == null) return '#E7E4F3'
  const scale = scaleLinear<string>()
    .domain(domain)
    .range(METRIC_COLORS[metric])
    .interpolate(interpolateRgb)
  return scale(value)
}
```

---

## 6. Data pipeline: `country_stats` и performance

### 6.1 Target schema usage

`country_stats` уже содержит:

```sql
primary key (target_country, author_nationality)
-- avg_overall, avg_cost_of_living, avg_safety, … (9 categories)
-- total_reviews, updated_at
```

**Trigger:** `refresh_country_stats()` на insert/update reviews ([003_country_stats.sql](../../supabase/migrations/003_country_stats.sql), fix in 016).

### 6.2 Proposed API

**New endpoint:** `GET /api/map-stats?nat=UA&metric=overall`

```typescript
// Response shape
type MapStatsResponse = {
  countries: Array<{
    code: string           // ISO-2
    mapName: string        // for SVG join
    totalReviews: number
    metrics: Record<MapMetric, number | null>
  }>
  generatedAt: string
  nat: string | null       // null = global aggregate
}
```

**Server logic:**
1. Query `country_stats` with optional `author_nationality = :nat`.
2. For global view: aggregate weighted by `total_reviews` across nationalities (same as [useComparePage.ts](../../app/composables/useComparePage.ts)).
3. Join map names via `codeToMapName`.
4. Cache: `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`.

### 6.3 Global vs nat aggregation

| Mode | SQL strategy |
|------|--------------|
| **Nat-scoped** | `SELECT * FROM country_stats WHERE author_nationality = $1` |
| **Global** | Weighted avg: `SUM(avg_overall * total_reviews) / SUM(total_reviews)` GROUP BY target_country |
| **Min reviews filter** | `HAVING SUM(total_reviews) >= $min` |

### 6.4 Performance at scale

| Scale | Reviews | country_stats rows | Strategy |
|-------|---------|-------------------|----------|
| Now | ~500–2k | ~500 | Single query, <50ms |
| 10k reviews | 10k | ~2k | Indexed PK, cache 5 min |
| 100k reviews | 100k | ~10k | CDN cache + optional materialized view `country_stats_global` |
| 1M reviews | 1M | ~50k | Pre-aggregate global table nightly; map reads only aggregates |

**Indexes (already):** PK `(target_country, author_nationality)`.

**Optional migration `019_map_stats_global.sql`:**

```sql
create materialized view if not exists country_stats_global as
select target_country,
  sum(total_reviews) as total_reviews,
  round(sum(avg_overall * total_reviews) / nullif(sum(total_reviews), 0), 2) as avg_overall,
  -- … other weighted avgs
  max(updated_at) as updated_at
from country_stats
group by target_country;

create unique index on country_stats_global (target_country);
-- refresh via cron / post-review trigger debounced
```

### 6.5 Client migration from useHomepageData

| Step | Change |
|------|--------|
| 1 | Add `/api/map-stats` |
| 2 | Replace `mapCountries` full review scan with API call |
| 3 | Keep `mapReviewData` shape for backward compat |
| 4 | Deprecate client-side groupBy in `useHomepageData` |

**Payload budget:** ~173 countries × ~120 bytes ≈ **20 KB JSON** — acceptable.

### 6.6 Staleness & empty states

- `updated_at` max age > 24h → show subtle «Data updated X ago» in legend footer.
- Country in map but not in stats → grey + «No reviews yet» (unchanged).
- Stats without map path (edge code) → log Sentry breadcrumb, skip render.

---

## 7. Mobile UX

### 7.1 Current mobile behavior

Breakpoint `@media (max-width: 860px)`:
- Grid → single column (map above list).
- List `max-height: 280px`.
- Map `max-height: 340px`.

### 7.2 Target mobile UX

```
┌─────────────────────────┐
│ [Metric ▼] [Search 🔍]  │
│ [Continent chips scroll]│
├─────────────────────────┤
│                         │
│      Map (45vh)         │
│   tap country → sheet   │
│                         │
├─────────────────────────┤
│ Country list (collapsible)│
└─────────────────────────┘
        ↓ tap
┌─────────────────────────┐
│ 🇩🇪 Germany    ★ 4.2   │
│ 47 reviews              │
│ [Open country] [Review] │
└─────────────────────────┘
```

| Requirement | Spec |
|-------------|------|
| Touch target | min **44×44 px** effective on country paths (invisible hit area padding) |
| Search | Sticky top on mobile; native `inputmode="search"` |
| Bottom sheet | `vaul` or PrimeVue Drawer; swipe to dismiss |
| Map zoom | Pinch optional phase 2; phase 1 keep region chips |
| Performance | `will-change: transform` on pan; throttle hover |
| Orientation | Portrait primary; landscape = side-by-side if width ≥640 |

### 7.3 Cheaper mobile win (pre-choropleth)

- Add search to existing list **without** choropleth — 2–3 days.
- Collapse list by default on mobile when country selected — 1 day.

---

## 8. Accessibility (a11y)

### 8.1 Current a11y (strengths)

- ✅ Continent tabs: `role="tablist"`, `aria-selected`.
- ✅ Country list: `role="listbox"`, `role="option"`, `aria-selected`.
- ✅ Map SVG: `role="img"`, `aria-label`.
- ✅ Focus visible on chips and list items.

### 8.2 Gaps for choropleth + map clicks

| Gap | WCAG | Remediation |
|-----|------|-------------|
| Map paths not focusable | 2.1.1 Keyboard | Roving tabindex on visible countries OR «Skip to list» pattern |
| Color-only metric encoding | 1.4.1 Use of Color | Patterns/hatching overlay OR always show numeric in list |
| Contrast on mid-scale colors | 1.4.3 Contrast | Test all quantile buckets; border `#3617A8` on focus |
| Screen reader map state | 4.1.2 Name, Role | `aria-live="polite"` region for «Germany selected, rating 4.2, 47 reviews» |
| Search combobox | 2.4.3 Focus Order | WAI-ARIA combobox pattern (PrimeVue AutoComplete a11y) |
| Reduced motion | 2.3.3 | Respect `prefers-reduced-motion` → skip viewBox animation |

### 8.3 Recommended pattern: **List-primary, map-secondary**

- Map clicks = convenience; **all actions reachable via list + search**.
- Announce metric changes in live region: «Showing cost of living. 23 countries with data.»

### 8.4 Colorblind-safe palette

Use **ColorBrewer** `RdYlGn` (rating) and `Purples` (review count). Test with Coblis simulator. Provide **pattern overlay** toggle in settings (phase 2).

---

## 9. SEO: indexable map views и structured data

### 9.1 Default: карта на `/` — **NOT a separate SEO play**

- Homepage already indexed; map is embedded widget.
- **Do not** create thin `/map` unless unique copy + ≥300 words intro.

### 9.2 Optional indexable views (Phase 3 only)

| URL pattern | Index? | Content requirements |
|-------------|--------|---------------------|
| `/countries/map` | `noindex, follow` | Utility page, avoid cannibalization |
| `/countries/europe` (region hub) | **Yes** | 500+ words, country cards, FAQ schema |
| `/map?region=europe&metric=rating` | **No** | Query params = duplicate content |

**Recommendation:** invest in **region hub pages** (§10) rather than map-specific URLs.

### 9.3 Structured data

| Type | Apply? | Notes |
|------|--------|-------|
| `WebApplication` | ❌ | Overkill |
| `ItemList` on region hubs | ✅ | List of Country entities with `aggregateRating` where reviews exist |
| `Dataset` for choropleth | ❌ | Google doesn't reward map widgets |
| `BreadcrumbList` | ✅ | Region hubs |

**aggregateRating snippet (country with reviews):**

```json
{
  "@type": "Country",
  "name": "Poland",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.1",
    "reviewCount": "128",
    "bestRating": "5"
  }
}
```

Only on **country pages** (already), not map polygons.

### 9.4 SEO risks

| Risk | Mitigation |
|------|------------|
| Thin content on map URLs | Don't index utility map |
| Cannibalize `/countries` | Map search → canonical to country pages |
| CLS from map load | Fixed aspect-ratio container (already `aspectRatio` in wrapStyle) |
| JS-only content | SSR legend text + country list in HTML |

---

## 10. Альтернативные дешёвые победы (до full choropleth)

Выполнять **до gate** — высокий ROI, низкий effort.

| # | Initiative | Effort | Impact | Notes |
|---|------------|--------|--------|-------|
| 1 | **Search in map list** | 2–3 d | High | Filter `regionCountries` by query; reuse `/countries` search |
| 2 | **Switch map data to `country_stats` API** | 3–4 d | Perf + enables metrics | Removes full review scan |
| 3 | **Region hub pages** `/countries/{region}` | 1–2 w | **SEO High** | Indexable, internal linking; reuse `MAP_REGION_IDS` |
| 4 | **Better list filters** on `/countries` | 3–5 d | SEO Medium | Sort by rating, min reviews — already has `CountryFilterBar` |
| 5 | **Quantile legend (binary → 3 buckets)** | 2 d | Medium | «High / Medium / Low» without full D3 |
| 6 | **Enable map click → same as list select** | 2 d | Medium | Remove `pointer-events: none`; a11y via list parity |
| 7 | **CountriesMiniMap hover on mobile** | 1 d | Low | Long-press tooltip |
| 8 | **Compare links from map detail** | 1 d | SEO Medium | «Compare PL vs DE» in detail panel |

**Recommended pre-gate bundle (1 sprint):** #1 + #2 + #6 = **~1.5 weeks**, validates engagement before choropleth investment.

---

## 11. Migration path от HomeWorldMap

### 11.1 Strategy: **Incremental enhancement** (не rewrite)

```
Phase 0 (now)          Phase 1 (pre-gate)      Phase 2 (post-gate)        Phase 3 (optional)
─────────────────────────────────────────────────────────────────────────────────────────
List + binary map  →  + search, map clicks  →  + choropleth metrics   →  region hub pages
                      + country_stats API      + filters                  + MapLibre eval
```

### 11.2 File-level plan

| File | Phase 1 | Phase 2 |
|------|---------|---------|
| `HomeWorldMap.vue` | Add search; `pointer-events: auto`; click handler | Metric selector, dynamic fill |
| `utils/mapChoropleth.ts` | — | Scales, legends, domains |
| `composables/useMapStats.ts` | Fetch `/api/map-stats` | Metric/nat/filter state |
| `server/api/map-stats.get.ts` | New | Global aggregate view |
| `useHomepageData.ts` | Remove mapCountries scan | Cleanup |
| `worldMapGeo.ts` | No change | Optional GeoJSON export script |
| `CountriesMiniMap.vue` | Share choropleth util | Same scales |

### 11.3 Feature flags

```typescript
// nuxt.config.ts runtimeConfig.public
mapChoroplethEnabled: false  // flip at gate
mapClickEnabled: true       // can ship earlier
mapSearchEnabled: true
```

Use existing `affiliate-ab` pattern or env var.

### 11.4 Rollback plan

- Flags off → revert to binary `has-data` fill.
- API failure → fallback to current `useHomepageData` client agg (keep deprecated path 1 release).

### 11.5 Testing checklist (post-gate)

- [ ] Playwright: select country via list → detail panel
- [ ] Playwright: click country on map (if enabled)
- [ ] Playwright: search «Pol» → Poland highlighted
- [ ] Playwright: metric toggle changes fill colors
- [ ] Visual regression: 5 countries, 3 metrics, 2 locales
- [ ] axe-core: no critical violations on `/`
- [ ] Lighthouse mobile perf: LCP < 2.5s (map panel)

---

## 12. Effort estimate (when greenlit)

### 12.1 Work breakdown

| Epic | Tasks | Days |
|------|-------|------|
| **E1: Data layer** | API, cache, global agg, migrate homepage | 4–5 |
| **E2: Choropleth UI** | Scales, legend, metric toggle, nat scope | 5–7 |
| **E3: Search** | Combobox, i18n aliases, analytics | 2–3 |
| **E4: Filters** | Min reviews, has-data, URL state | 2–3 |
| **E5: Map interactions** | Click/hover, keyboard, focus sync | 3–4 |
| **E6: Mobile** | Bottom sheet, sticky search, touch targets | 4–5 |
| **E7: A11y** | Live regions, contrast audit, reduced motion | 2–3 |
| **E8: Analytics** | 4 new events, Plausible dashboard | 1 |
| **E9: QA + E2E** | Smoke tests, cross-browser | 2–3 |
| **E10: SEO (optional)** | Region hubs content, ItemList schema | 5–8 |
| | **MVP total (E1–E5, E8–E9)** | **18–25 days (~4–5 wks)** |
| | **Full (incl. E6–E7)** | **25–35 days (~5–7 wks)** |
| | **+ Region hubs (E10)** | **+5–8 days** |

### 12.2 Team assumptions

- 1 senior frontend (Vue/Nuxt)
- 0.25 backend (Supabase/API)
- 0.25 design (color scales, mobile mocks)
- PM/SEO review at gate

### 12.3 Dependencies timeline

```
Week 1: E1 API + E3 search (parallel)
Week 2: E2 choropleth + E5 clicks
Week 3: E4 filters + E8 analytics
Week 4: E6 mobile + E7 a11y
Week 5: E9 QA + staged rollout 10% → 100%
```

---

## 13. Зависимости: auth, premium, infra

### 13.1 Auth — **optional**

| Feature | Auth required? |
|---------|----------------|
| View choropleth | ❌ |
| Nat scope from profile | Optional enhancement (store.nationality already in localStorage) |
| Save favorite metric | ✅ logged-in users (future) |
| Premium filters (e.g. bureaucracy deep-dive) | ✅ if monetization |

Current `user.ts` store + nationality in localStorage — **достаточно для MVP**.

### 13.2 Premium — **optional, Phase 3+**

Potential gated features:
- Export map as PNG/PDF
- Historical metric trends (needs time-series table)
- City-level drill-down map
- Ad-free map experience

**Do not block MVP on premium infra.**

### 13.3 Infrastructure

| Dependency | Status | Needed for |
|------------|--------|------------|
| Supabase `country_stats` | ✅ | Choropleth metrics |
| Plausible custom events | ✅ | Validation |
| Sentry client | ✅ | Error tracking map render |
| CDN cache (Vercel/CF) | ✅ | `/api/map-stats` |
| Geo tile server | ❌ | Only if MapLibre |
| Redis | ❌ | Optional at 100k+ reviews |

### 13.4 Cross-feature dependencies

| Feature | Depends on map EPIC? |
|---------|---------------------|
| Compare pages | ❌ Independent |
| Affiliate A/B on map slot | ✅ Already live (`AffiliatePartnerLinks partner-slot="map"`) |
| Lead form on country | ❌ |
| Content hub articles | ❌ Synergy with region hubs |

---

## 14. Risks и mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Sparse data → misleading choropleth | High | Trust | Min reviews filter default 3; grey empty |
| Mobile tap on tiny countries (Baltics) | High | UX | Search-first; invisible hit padding |
| Performance regression on `/` | Medium | SEO | Lazy load map panel (`ClientOnly` + Intersection Observer) |
| Scope creep → MapLibre rewrite | Medium | Timeline | Lock Option A in ADR at greenlight |
| a11y regression map clicks | Medium | Legal/brand | List-primary pattern; axe in CI |
| API cache stale after review approve | Low | UX | `stale-while-revalidate` + trigger revalidation hook |
| Geo mapping bugs (England/GB, Cyprus) | Low | Data | Unit tests for `mapNameToCode` |

---

## 15. Success metrics (post-launch)

| Metric | Target (90 days post-launch) |
|--------|------------------------------|
| `map_country_select` rate | +50% vs pre-choropleth baseline |
| `map_metric_change` adoption | ≥15% of map sessions |
| `map_search` usage | ≥10% of map sessions |
| Organic bounce `/` | No degradation (>5% relative) |
| Country page CTR from map detail | ≥20% click «Open country» |
| LCP homepage mobile | <2.5s p75 |

---

## 16. Open questions (resolve at greenlight)

1. **Default metric:** `overall` vs `reviews` (density)?
2. **Map clicks on mobile:** enable phase 1 or wait for bottom sheet?
3. **Indexable region hubs:** who writes copy (UA/ru/en)?
4. **Compare shortcut in map detail:** static pairs or dynamic top compare?
5. **Premium timeline:** block or parallel?
6. **ADR:** SVG increment vs D3 — formal sign-off?

---

## 17. Decision log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-01 | **DEFER** choropleth EPIC | Compare SEO just shipped; SEO gates not met |
| 2026-09-01 | Keep list-primary map UX | `pointer-events: none` intentional; a11y + mobile |
| 2026-09-01 | Prefer SVG increment over MapLibre | Cost/benefit; existing 206KB geo asset |
| TBD | Greenlight review | When §2 gates met |

---

## Appendix A: Key file references

| Path | Role |
|------|------|
| [app/components/HomeWorldMap.vue](../../app/components/HomeWorldMap.vue) | Main map component |
| [app/utils/worldMapGeo.ts](../../app/utils/worldMapGeo.ts) | 173 SVG country paths |
| [app/utils/worldMapRegions.ts](../../app/utils/worldMapRegions.ts) | Regions, viewBox, code mapping |
| [app/composables/useHomepageData.ts](../../app/composables/useHomepageData.ts) | Current data fetch (to replace) |
| [app/pages/index.vue](../../app/pages/index.vue) | mapReviewData wiring |
| [supabase/migrations/003_country_stats.sql](../../supabase/migrations/003_country_stats.sql) | Stats table schema |
| [app/utils/analytics.ts](../../app/utils/analytics.ts) | `map_country_select` event |
| [docs/gsc-ctr-optimization.md](../gsc-ctr-optimization.md) | CTR gate process |
| [docs/kpi-retro-template.md](../kpi-retro-template.md) | Monthly gate review |

## Appendix B: Gate checklist (copy to retro)

```
☐ Organic sessions ≥ 5k/mo (2 mo)
☐ Compare indexed ≥ 90% (146/162)
☐ Nat landings indexed ≥ 85%
☐ Top-20 compare median CTR ≥ 2.5%
☐ ≥ 5 compare URLs +10% CTR uplift
☐ ≥ 40 countries with 5+ reviews
☐ map_country_select / session ≥ 0.08
☐ PM + eng sign-off
```

---

*Документ не является коммитом в git. Обновлять при изменении gate-критериев или greenlight.*
