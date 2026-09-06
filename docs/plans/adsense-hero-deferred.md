# Triplandr — Roadmap: AdSense в hero (отложенная стратегия)

**Версия:** 1.0 · **Дата:** сентябрь 2026  
**Статус:** планирование — **не внедрять «массовую рекламу в hero» на старте**  
**Связанные артефакты:** [`partners.ts`](../../app/utils/partners.ts), [`AffiliatePartnerLinks.vue`](../../app/components/AffiliatePartnerLinks.vue), [`affiliate-ab-testing.md`](../affiliate-ab-testing.md), [/about/monetization](https://triplandr.com/about/monetization)

---

## Executive summary

Triplandr монетизируется через **контекстные партнёрские ссылки** (виза, страховка, жильё) в слотах `sidebar`, `compare`, `map` с прозрачным раскрытием (`PartnerDisclosure`, `rel="sponsored"`). Идея «массового AdSense в hero» технически реализуема, но **противоречит позиционированию бренда** («честные отзывы без заказной рекламы») и **снижает ценность главного конверсионного экрана** (finder: национальность → страна → CTA).

**Рекомендация:** отложить hero-AdSense до достижения порогов трафика и RPM; на Phase 0–2 тестировать **in-content** и **нижний sidebar**, сохраняя hero «чистым». Параллельно масштабировать affiliate + спонсорство ([media kit v0](../media-kit-v0.md)), где EPC на intent-трафике обычно выше display RPM.

---

## 1. Контекст и текущее состояние

### 1.1 Что уже есть

| Компонент | Роль |
|-----------|------|
| `AffiliatePartnerLinks.vue` | 1–2 партнёра на слот, UTM, `affiliate_click` в Plausible |
| `partners.ts` | Конфиг партнёров: SafetyWing, iVisa, Wise, HousingAnywhere и др. |
| `useAffiliateAb` + cookie `nv_aff_ab` | A/B: позиция sidebar, compare surface |
| `/about/monetization` | Пользовательское раскрытие модели заработка |
| Plausible (`plausible.client.ts`) | Privacy-friendly аналитика, custom events |
| Hero (`app/pages/index.vue`) | H1, finder-form, float-cards, live review snippet — **без рекламы** |

### 1.2 Что такое «mass AdSense in hero»

Под этим понимается:

- один или несколько **display-блоков Google AdSense** (728×90, 320×100, responsive, in-feed) **внутри или поверх** hero-секции;
- возможно sticky/mobile anchor в зоне первого экрана;
- потенциально auto ads на всём сайте с приоритетом above-the-fold.

Это **не** партнёрский блок с disclosure — это programmatic display, часто с низкой предсказуемостью креатива (финансы, dating, «заработок онлайн»), что особенно рискованно для UGC/review-бренда.

---

## 2. Почему отложить или жёстко ограничить

### 2.1 UX и продуктовая логика

Hero — единственный экран, где пользователь **формирует intent** (национальность + целевая страна). Любой display-блок:

| Риск | Эффект |
|------|--------|
| Визуальный шум | Снижение completion rate finder-form |
| Misclick / accidental tap (mobile) | Frustration, bounce |
| Конкуренция с CTA «Смотреть отзывы» | Падение глубины сессии |
| CLS при lazy-load рекламы | «Прыгающий» hero ломает первое впечатление |
| Замена float-cards / review snippet | Потеря social proof — ключевого дифференциатора |

**Метрика успеха hero сегодня:** `homepage_finder_submit` → переход на `/country/{slug}?nat=…` → чтение отзывов → affiliate_click. Display в hero оптимизирует **impressions**, а не **intent completion**.

### 2.2 Доверие к бренду vs affiliate-модель

Triplandr строит доверие на:

- анонимных модерируемых отзывах;
- отсутствии заказных рейтингов;
- явной странице монетизации.

Affiliate-ссылки **контекстны** («оформить визу в {country}») и помечены как sponsored. AdSense:

- показывает **сторонние** объявления без редакционного контроля;
- может визуально напоминать «рекламный сайт», а не «сообщество эмигрантов»;
- создаёт когнитивный диссонанс рядом с live review snippet («реальный человек написал…» → «Кредит под 0%»).

**Порог восприятия:** один аккуратный блок в sidebar/country page терпим; **hero, забитый баннерами**, воспринимается как типичный MFA (made-for-ads) сайт — обратный эффект для SEO и word-of-mouth в UA diaspora.

### 2.3 Core Web Vitals (CWV)

Hero — LCP-элемент (фоновое изображение, float-cards, finder). AdSense добавляет:

| Метрика | Типичное влияние AdSense above-the-fold |
|---------|----------------------------------------|
| **LCP** | +200–800 ms (script + auction + render) |
| **CLS** | 0.05–0.25 при вставке responsive unit без reserved slot |
| **INP** | Доп. main-thread work от GPT / SafeFrame |
| **TBT** | Блокировка при синхронной загрузке без defer |

Google использует CWV как ranking signal; для молодого SEO-проекта **потеря позиций** может стоить больше, чем $50–200/мес display на низком RPM.

**Требование при любом внедрении:** reserved ad slot (min-height), client-only mount после `requestIdleCallback` или intersection observer, **никогда** sync script в `<head>` без consent.

### 2.4 Экономика на текущем масштабе

При типичном RPM $1–4 для RU/UK/EN geo-mix и <50k sessions/мес:

```
display_revenue ≈ (sessions × pageviews_per_session × ad_slots_filled × RPM) / 1000
```

Пример: 15k sessions, 2.2 PV, 1 slot, RPM $2 → **~$66/мес**.

Affiliate при EPC $0.80–3.00 и 200 clicks/мес → **$160–600/мес** без деградации UX.

Вывод: **до 30–50k sessions/мес display в hero — negative ROI** с учётом риска bounce и brand damage.

---

## 3. Когда включать AdSense (пороги и framework)

### 3.1 Gate-условия (все должны выполняться)

| # | Условие | Порог | Источник данных |
|---|---------|-------|-----------------|
| G1 | Monthly sessions | ≥ **50 000** | Plausible |
| G2 | Одобренных отзывов | ≥ **500** | Supabase `reviews` |
| G3 | AdSense account | Approved, no policy strikes | AdSense console |
| G4 | CMP / consent | Рабочий баннер EU+UK | Cookiebot / CookieYes / custom |
| G5 | Affiliate baseline | ≥ **8 недель** EPC-отчётов | [affiliate-ab-testing.md](../affiliate-ab-testing.md) |
| G6 | CWV baseline | LCP < 2.5s, CLS < 0.1 на hero (p75) | CrUX / Vercel Speed Insights |
| G7 | Legal | Обновлены Privacy + Cookies (AdSense, IAB TCF) | `/about/privacy`, `/about/cookies` |

### 3.2 RPM expectations framework

Использовать **консервативные** диапазоны по сегментам (обновлять ежеквартально):

| Сегмент трафика | Geo | Ожидаемый RPM (display) | Комментарий |
|-----------------|-----|-------------------------|-------------|
| UA diaspora, uk locale | UA, PL, DE, CZ | $0.8 – 2.5 | Низкий CPC, высокий intent на affiliate |
| RU locale | RU, KZ, BY | $0.5 – 1.8 | AdSense fill variable |
| EN expat | US, UK, CA | $2 – 6 | Лучший RPM, меньший % трафика |
| Compare pages | Mixed | $1 – 3 | Длинный dwell time, mid-scroll OK |

**Формула решения «включать ли hero»:**

```
expected_hero_display_monthly = sessions_home × fill_rate × hero_rpm / 1000
affiliate_opportunity_cost    = Δbounce × sessions × downstream_epc

GO hero ads ONLY IF:
  expected_hero_display_monthly > affiliate_opportunity_cost × 1.5
  AND hero_finder_submit_rate drop < 3% (A/B)
```

### 3.3 Decision tree

```
START
  │
  ├─ sessions < 50k? ──YES──► NO hero ads; focus affiliate + content
  │
  ├─ AdSense not approved? ──YES──► Apply when ≥30k sessions + sufficient content
  │
  ├─ CMP not ready (EU traffic >5%)? ──YES──► Block all ad scripts in EU
  │
  ├─ Test in-content first (Phase 1)
  │     │
  │     ├─ RPM < $1.5 blended? ──YES──► Re-evaluate in 90 days; keep affiliate priority
  │     │
  │     └─ RPM OK + no CWV regression
  │           │
  │           └─ A/B hero vs no-hero (Phase 2, 10% traffic, 4 weeks)
  │                 │
  │                 ├─ finder_submit ↓ >3%? ──YES──► ROLLBACK hero ads permanently
  │                 └─ Revenue lift >15% total monetization? ──YES──► Ship limited hero unit
```

---

## 4. Варианты размещения и рекомендации

### 4.1 Сравнительная таблица

| Placement | Приоритет Phase | UX impact | RPM potential | Brand risk | Рекомендация |
|-----------|-----------------|-----------|---------------|------------|--------------|
| **Hero (above finder)** | Phase 3+ | 🔴 Critical | Medium | 🔴 High | **Не делать** до gate + A/B |
| **Hero (below finder, in-section)** | Phase 3 | 🟠 High | Medium | 🟠 Medium | Только 1 responsive unit, mobile-only test |
| **Country sidebar (below affiliate)** | Phase 1 | 🟢 Low | Low–Med | 🟢 Low | **Старт здесь** |
| **Between reviews (in-content)** | Phase 1 | 🟢 Low | Med | 🟢 Low | После 3-го отзыва, desktop + mobile |
| **Compare table footer** | Phase 2 | 🟢 Low | Med | 🟢 Low | Не рядом с affiliate winner CTA |
| **Article hub (CMS)** | Phase 1 | 🟢 Low | Med–High | 🟢 Low | Длинный контент, natural break |
| **Sticky anchor (mobile)** | Phase 4 | 🔴 High | Med | 🔴 High | Избегать; конфликт с footer nav |
| **Auto ads (site-wide)** | Never first | 🟠 Variable | Unknown | 🟠 Medium | Только после ручных placements стабильны |

### 4.2 Рекомендуемая стратегия размещения

**Phase 0 (сейчас):** zero display. Affiliate + спонсорство.

**Phase 1:** in-content на country pages + hub articles; optional sidebar unit **ниже** `AffiliatePartnerLinks` (не заменяя).

**Phase 2:** compare footer; homepage **ниже** trending section (не в hero).

**Phase 3:** controlled hero test — **один** `data-ad-format="horizontal"` под stat-row, только non-EU или post-consent.

**Против «mass in hero»:** несколько units + auto ads в hero уничтожают finder funnel и violate spirit of «clean first screen».

### 4.3 Координация с affiliate-слотами

Текущие слоты (`PartnerSlot`): `sidebar | compare | map`.

Правило: **affiliate всегда выше display** в sidebar; disclosure остаётся видимым. Display не использовать в слоте `map` на homepage (`HomeWorldMap.vue` уже содержит affiliate).

---

## 5. AdSense policy compliance (UGC / review sites)

### 5.1 Требования Google (чеклист)

| Policy area | Triplandr action |
|-------------|----------------|
| **Sufficient content** | Модерируемые отзывы + hub articles; не thin pages |
| **Original content** | UGC OK если moderated; hub — editorial |
| **Navigable site** | Footer links, sitemap, about/contact |
| **Invalid traffic** | Не покупать traffic; monitor AdSense IVT alerts |
| **Site behavior** | No deceptive overlays; ads ≠ fake download buttons |
| **Restricted content** | Модерация: no hate, illegal, adult in reviews |
| **Copyright** | Unsplash с license; user text moderated |

### 5.2 UGC-specific риски

- **Prohibited content in ads proximity:** если отзыв содержит sensitive topics, не размещать ad **внутри** review card.
- **User-generated pages:** country pages с <3 отзывами — **no ads** (low value + policy «thin content»).
- **Compare pages:** OK если есть aggregated stats из `country_stats`.
- **Login/admin:** `/admin/*` — exclude via ads.txt / no ad components.

### 5.3 ads.txt и transparency

```
# ads.txt (production)
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Обновить `/about/monetization` (ru/en/uk): добавить секцию «Рекламные объявления Google» **до** включения скрипта.

### 5.4 Модерация ↔ monetization firewall

Как и для affiliate: **реклама не влияет на модерацию**. Документировать в internal policy ([moderation-sla.md](../moderation-sla.md) appendix).

---

## 6. Техническая реализация (Nuxt 4)

### 6.1 Архитектура

```
┌─────────────────────────────────────────────────────────┐
│  nuxt.config.ts — NO sync AdSense in global head        │
├─────────────────────────────────────────────────────────┤
│  app/plugins/adsense.client.ts                          │
│    • load only if consent + feature flag                │
│    • inject adsbygoogle.js once                         │
├─────────────────────────────────────────────────────────┤
│  app/composables/useAdConsent.ts                        │
│    • read CMP consent (marketing)                       │
│    • geo: EU requires opt-in                            │
├─────────────────────────────────────────────────────────┤
│  app/components/AdSenseUnit.vue                         │
│    • ClientOnly wrapper                                 │
│    • reserved min-height slot                           │
│    • IntersectionObserver lazy load                     │
│    • placement prop: sidebar | in-content | footer      │
├─────────────────────────────────────────────────────────┤
│  app/composables/useAdsenseAb.ts (optional Phase 3)     │
│    • cookie nv_ads_ab: control | incontent | hero       │
│    • track ads_impression, ads_click via Plausible      │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Feature flags (runtimeConfig)

```ts
// nuxt.config.ts → runtimeConfig.public
adsenseEnabled: process.env.NUXT_PUBLIC_ADSENSE_ENABLED === 'true',
adsenseClientId: process.env.NUXT_PUBLIC_ADSENSE_CLIENT_ID || '',
adsenseHeroEnabled: process.env.NUXT_PUBLIC_ADSENSE_HERO === 'true', // default false
```

### 6.3 Client-only plugin (sketch)

```ts
// app/plugins/adsense.client.ts
export default defineNuxtPlugin(() => {
  const { public: cfg } = useRuntimeConfig()
  if (!cfg.adsenseEnabled || !cfg.adsenseClientId) return

  const { hasMarketingConsent } = useAdConsent()
  if (!hasMarketingConsent.value) return

  if (document.querySelector('script[data-adsense]')) return

  const s = document.createElement('script')
  s.async = true
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cfg.adsenseClientId}`
  s.crossOrigin = 'anonymous'
  s.dataset.adsense = '1'
  document.head.appendChild(s)
})
```

### 6.4 AdSenseUnit component (sketch)

```vue
<template>
  <ClientOnly>
    <div
      v-if="shouldShow"
      ref="slotEl"
      class="ad-slot"
      :style="{ minHeight: minHeightPx + 'px' }"
    >
      <ins
        v-if="visible"
        class="adsbygoogle"
        :data-ad-client="clientId"
        :data-ad-slot="adSlot"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  </ClientOnly>
</template>
```

- `shouldShow`: consent + `total_reviews >= 3` + not admin + feature flag.
- `visible`: IntersectionObserver `rootMargin: 200px`.
- After mount: `(window.adsbygoogle = window.adsbygoogle || []).push({})`.

### 6.5 Consent / CMP (GDPR)

| Region | Behavior |
|--------|----------|
| EU / UK / CH | No ad script until **marketing** consent (IAB TCF v2.2) |
| UA | Consent recommended (best practice) |
| Rest of world | Soft opt-out via cookie banner |

**CMP options (ranked):**

1. **Cookiebot / CookieYes** — быстрый старт, TCF, geo-targeting.
2. **Google Consent Mode v2** — обязателен для EU traffic + AdSense.
3. **Custom banner** — только если юридически проработан; дороже в поддержке.

Integration points:

- Block `adsense.client.ts` until `gtag('consent', 'update', { ad_storage: 'granted' })`.
- Plausible остаётся cookieless / minimal — не смешивать с ad cookies в одном banner без категорий.

### 6.6 Lazy load и CWV

| Technique | Implementation |
|-----------|----------------|
| Reserved space | CSS `min-height: 280px` (mobile), `90px` (horizontal) |
| Deferred script | Plugin on `requestIdleCallback` or first scroll |
| No hero load on SSR | `ClientOnly` — zero ad HTML in SSR output |
| Preconnect | `<link rel="preconnect" href="https://pagead2.googlesyndication.com">` only post-consent |
| Monitoring | Sentry performance + Vercel Analytics + weekly CWV check |

### 6.7 Analytics events

Extend `app/utils/analytics.ts`:

| Event | Props |
|-------|-------|
| `ads_impression` | `placement`, `page_type`, `ab_variant` |
| `ads_consent_granted` | `region` |
| `ads_consent_denied` | `region` |

Correlate with `affiliate_click` in weekly KPI retro ([kpi-retro-template.md](../kpi-retro-template.md)).

---

## 7. A/B: display vs текущая affiliate-стратегия

### 7.1 Что уже работает (affiliate A/B)

- Cookie `nv_aff_ab`: sidebar top/bottom, compare on/off.
- Event `affiliate_click` с `ab_variant`, `slot`, `partner`.
- EPC-отчёт weekly.

### 7.2 Предлагаемый ads A/B (Phase 3)

| Bucket | Experience |
|--------|------------|
| `control` | Affiliate only (current) |
| `incontent_ads` | Affiliate + in-content AdSense on country |
| `hero_ads` | Affiliate + **one** hero unit (experimental) |

Cookie: `nv_ads_ab`, TTL 30 days. Assignment in middleware (parallel to `affiliate-ab.global.ts`).

**Primary metric:** `total_monetization_proxy = affiliate_clicks × blended_epc + ads_rpm × impressions / 1000`  
**Guardrail metrics:** `finder_submit_rate`, `bounce_rate`, `pages_per_session`, LCP/CLS.

### 7.3 Правила остановки эксперимента

- Любой guardrail ↓ >5% absolute → pause ads 30 days.
- AdSense policy warning → immediate disable all units.
- Affiliate EPC ↓ >20% при росте display <15% revenue → remove competing placements.

### 7.4 Cannibalization hypothesis

Display и affiliate конкурируют за **внимание**, не за один клик. Sidebar display **снижает** affiliate CTR на 10–30% (industry typical). Поэтому sidebar display только **под** affiliate block.

---

## 8. Модель сравнения revenue: affiliate vs display

### 8.1 Базовые определения

| Term | Formula |
|------|---------|
| **RPM** | (Ad revenue / Impressions) × 1000 |
| **EPC** | Affiliate revenue / `affiliate_click` count |
| **EPV** | Total revenue / Pageviews |
| **Blended ARPU** | Total revenue / MAU |

### 8.2 Scenario calculator (шаблон)

Заполнять ежемесячно в KPI retro:

| Input | Month N |
|-------|---------|
| Sessions | |
| Pageviews | |
| `affiliate_click` | |
| Affiliate revenue (partner dashboards) | |
| Ad impressions | |
| Ad revenue (AdSense) | |

**Computed:**

```
EPC_affiliate     = affiliate_revenue / affiliate_clicks
RPM_display       = (ad_revenue / ad_impressions) × 1000
EPV_affiliate     = affiliate_revenue / pageviews
EPV_display       = ad_revenue / pageviews
EPV_blended       = EPV_affiliate + EPV_display
```

### 8.3 Три сценария (illustrative)

Assumptions: 40k sessions, 2.5 PV/session = 100k PV, 350 affiliate clicks, EPC $1.50.

| Scenario | Display | Affiliate rev | Display rev | Total | EPV |
|----------|---------|---------------|-------------|-------|-----|
| A: Affiliate only | — | $525 | $0 | **$525** | $0.0053 |
| B: In-content only (30k imp, RPM $2) | sidebar+content | $500 (−5% CTR) | $60 | **$560** | $0.0056 |
| C: Hero + site (80k imp, RPM $1.8, −8% finder) | aggressive | $420 | $144 | **$564** | $0.0056 |

При малых объёмах сценарий C **не оправдан** из-за brand/CWV/finder risk; B — единственный разумный первый шаг.

### 8.4 Break-even sessions для hero ad

```
incremental_hero_rev = sessions × hero_fill × hero_rpm / 1000
incremental_affiliate_loss = Δepc_clicks × EPC

Break-even when incremental_hero_rev = incremental_affiliate_loss
```

При EPC $2, потере 15 clicks/мес из-за bounce: need **$30+** incremental hero revenue → при RPM $2 нужно **15k+ hero impressions** только to break even on click loss, excluding CWV/SEO cost.

---

## 9. Фазовый roadmap внедрения

### Phase 0 — Foundation (сейчас – +8 недель)

- [ ] Заполнить traffic table в [media-kit-v0.md](../media-kit-v0.md)
- [ ] 8+ недель affiliate EPC baseline
- [ ] Подготовить Privacy/Cookies drafts (AdSense, CMP)
- [ ] CWV baseline hero (Vercel Speed Insights)
- [ ] **Explicit decision: hero remains ad-free**

### Phase 1 — Soft display (+8 – +16 недель)

**Gate:** ≥25k sessions/mo, AdSense approved, CMP live.

- [ ] `AdSenseUnit.vue` + plugin + consent
- [ ] Placements: country in-content, hub articles
- [ ] Min 3 reviews rule per page
- [ ] Update monetization page (3 locales)
- [ ] ads.txt
- [ ] Weekly RPM tracking in KPI retro

### Phase 2 — Expand (+16 – +24 недели)

**Gate:** ≥50k sessions, blended RPM >$1.50, no CWV regression.

- [ ] Compare page footer unit
- [ ] Homepage below trending (NOT hero)
- [ ] `nv_ads_ab` A/B: control vs incontent
- [ ] Document cannibalization vs affiliate

### Phase 3 — Hero experiment (+24 недели, optional)

**Gate:** Phase 2 success, leadership sign-off, legal review.

- [ ] Single hero unit below stat-row, 10% traffic
- [ ] 4-week test: finder_submit, bounce, total EPV
- [ ] Rollback trigger automated via feature flag

### Phase 4 — Optimize (ongoing)

- [ ] Seasonal RPM review
- [ ] Block low-quality ad categories in AdSense dashboard
- [ ] Consider Mediavine/Ezoic **only if** sessions >100k and display becomes strategic pillar

---

## 10. Риски и mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AdSense rejection (UGC) | Medium | High | Hub content, moderation SLA, apply at 25k+ sessions |
| Policy strike (invalid traffic) | Low | Critical | No paid traffic; monitor referrers |
| EU consent violation | Medium | Legal | CMP before any ad script |
| Brand damage «MFA site» | High if hero | High | Defer hero; sponsor > display for brand campaigns |
| Affiliate EPC drop | Medium | Medium | Ads below affiliate; A/B guardrails |
| CWV ranking drop | Medium | Medium | Lazy load, reserved slots, kill switch flag |

---

## 11. Kill switch

One env var disables all ad components instantly:

```
NUXT_PUBLIC_ADSENSE_ENABLED=false
```

Redeploy <2 min. No code change required in incident.

---

## 12. Open questions

1. **Premium consumer tier** (если появится): ad-free subscription — display становится opt-out для paying users.
2. **Direct deals vs AdSense:** при RPM >$8 на hub pages рассмотреть direct sponsor over programmatic.
3. **RU locale AdSense:** учитывать geo restrictions и fill rate; возможно disable ads on `/ru/*` if RPM < threshold.

---

## 13. Связанные документы

- [Affiliate A/B testing](../affiliate-ab-testing.md)
- [Media kit v0](../media-kit-v0.md)
- [KPI retro template](../kpi-retro-template.md)
- [Moderation SLA](../moderation-sla.md)
- [GSC CTR optimization](../gsc-ctr-optimization.md)

---

## Appendix A — File checklist (implementation)

| File | Action |
|------|--------|
| `app/plugins/adsense.client.ts` | Create |
| `app/components/AdSenseUnit.vue` | Create |
| `app/composables/useAdConsent.ts` | Create |
| `app/composables/useAdsenseAb.ts` | Create (Phase 3) |
| `app/middleware/adsense-ab.global.ts` | Create (Phase 3) |
| `app/pages/country/[slug]/index.vue` | Add in-content slot |
| `app/locales/*/pages.ts` | Monetization section update |
| `public/ads.txt` | Create |
| `.env.example` | `NUXT_PUBLIC_ADSENSE_*` vars |

## Appendix B — Monetization page copy stub (ru)

> **Рекламные объявления.** На некоторых страницах Google может показывать контекстную рекламу. Объявления не влияют на модерацию отзывов и не означают одобрение рекламируемых продуктов. Партнёрские ссылки по-прежнему отделены и помечены явно.

---

*Документ не является юридической консультацией. Перед включением AdSense в EU — review с legal.*
