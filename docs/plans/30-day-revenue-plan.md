# Triplandr — 30-дневный план выхода на стабильный доход

**Версия:** 1.0 · **Дата:** сентябрь 2026  
**Ветка контекста:** `dev` (часть wave R1–R5 / Auth MVP может ещё ждать merge в `main` — см. PR #8)  
**Владелец:** founder (solo)  
**Связанные документы:** [README планов](./README.md), [post-launch-checklist.md](../post-launch-checklist.md), [media-kit-v0.md](../media-kit-v0.md), [affiliate-ab-testing.md](../affiliate-ab-testing.md), [kpi-retro-template.md](../kpi-retro-template.md), [premium-paywall-reviews.md](./premium-paywall-reviews.md), [b2b-api.md](./b2b-api.md), [adsense-hero-deferred.md](./adsense-hero-deferred.md)

---

## 1. Цель месяца

### Операционное определение «стабильного дохода»

К концу ~30 дней проект считается на **стабильном доходе**, если одновременно выполняются:

| Критерий | Определение «да» | Определение «нет» |
|----------|------------------|-------------------|
| **Предсказуемость** | Есть **еженедельный** приток денег (или подтверждённых комиссий в партнёрских кабинетах) ≥ 3 из 4 недель подряд | Один разовый платёж / один lead payout без повторения |
| **Диверсификация** | ≥ **2 канала** дали измеримый вклад (не обязательно оба $ — один $ + один квалифицированный lead/pipeline) | 100% от одного случайного клика или одной сделки |
| **Повторяемость ops** | Есть зафиксированный playbook: daily TG + weekly newsletter + weekly partner/KPI ретро | Доход зависит от разового «героического» outreach |
| **Атрибуция** | Клики/лиды/сессии видны в Plausible + GSC + partner dashboards | «Кажется, что-то зарабатываем», без цифр |

**Стабильный доход ≠ большой MRR.** На месяце 1 цель — **повторяемый денежный контур**, а не «закрыть зарплату». Масштаб $ растёт с трафиком и партнёрскими ставками.

### Framework диапазонов (не прогноз)

Подставляйте **свои** EPC / lead fee / session baseline после Week 1. Таблица — для планирования чувствительности, не для отчётности инвесторам.

| Сценарий | Допущения (пример) | Ориентир weekly gross* |
|----------|--------------------|-------------------------|
| **Conservative** | Мало органики; EPC низкий; 0–1 lead/нед | Ниже порога «кофе»; главное — **ненулевой** attribution trail |
| **Base** | Sessions растут WoW; 1–2 партнёра с live tracking; lead fee по согласованию | Покрывает часть ops-расходов (домен/Resend/Plausible) |
| **Stretch** | Compare SEO даёт intent-трафик; affiliate A/B winner; 1 agency soft-deal или hub sponsor | Первый «ощутимый» week + pipeline на месяц 2 |

\*Не заполняйте фейковыми $. Формулы:

```
affiliate_week ≈ affiliate_clicks × EPC
lead_week      ≈ qualified_leads × fee_per_lead   (или 0 до подписанного CPA)
sponsor_week   ≈ (hub_deals × monthly_rate) / 4   (после подписания)
```

Заполните EPC из SafetyWing / Wise / iVisa dashboards после ≥50–100 кликов (см. [affiliate-ab-testing.md](../affiliate-ab-testing.md)).

### Success / stretch / fail на D30

| Уровень | Условие |
|---------|---------|
| **Fail** | Production не монетизирует (placeholders, нет Plausible goals) **или** 0 атрибутируемых кликов/лидов за 4 недели |
| **Minimum success** | ≥1 канал с повторяемыми событиями + ≥1 неделя с ненулевым $ **или** подписанный lead/partner deal с понятным payout |
| **Success (цель)** | ≥2 канала в работе; weekly KPI retro заполнен 4×; playbook ops живой |
| **Stretch** | Первый sponsor/B2B soft commit **или** premium waitlist ≥ порога спроса (см. Week 3) |

---

## 2. Текущая база (что уже есть для монетизации)

Не строить заново — **включить и измерить**.

| Актив | Где | Как зарабатывает сейчас |
|-------|-----|-------------------------|
| **Affiliate slots + A/B** | `partners.ts`, `AffiliatePartnerLinks`, cookie `nv_aff_ab` | Комиссия с кликов → конверсий (SafetyWing, Wise, iVisa, HousingAnywhere; `uaVisaAgent` — placeholder) |
| **Lead form** | Country pages при низком legalization score; `POST /api/leads` + Telegram | CPA / fixed fee с юр./visa агентством (после договора) |
| **Newsletter (Resend)** | Footer subscribe, admin send | Спонсорский блок позже ([media kit](../media-kit-v0.md) ~indicative €150/issue) — **после размера списка** |
| **Content hubs** | PL, DE, CZ (+ ES/PT/GE/TR/TH bodies backlog) | Органика → affiliate/leads; hub sponsor badge |
| **Compare SEO** | 54 пары × locales | Decision-stage traffic → compare slot affiliate |
| **Nat landings** | Sitemap / country?nat= | Intent + nationality filter → релевантные партнёры |
| **Telegram pipeline** | Daily content + calendar 2 posts/wk | Трафик + будущий co-post sponsor |
| **Media kit v0** | `docs/media-kit-v0.md` | Outreach: hub / compare / newsletter / TG |
| **Auth MVP** | Magic link, profiles, `/account` | Soft gates, premium waitlist foundation |
| **Transparency** | `/about/monetization`, `/terms`, PartnerDisclosure | Trust = конверсия и партнёрские сделки |
| **Measurement** | Plausible, smoke CI, KPI retro template | Без этого «доход» не управляется |
| **RU/BY destinations off** | Hotfix | Фокус на live destinations; меньше токсичного/рискового трафика |

**Бренд-инвариант:** нет платных/фейковых отзывов; партнёрки и спонсорство — только с disclosure.

---

## 3. P0 blockers before revenue

Пока это не закрыто, «месяц дохода» не стартовал — только подготовка.

| # | Блокер | Действие | Done when |
|---|--------|----------|-----------|
| 1 | **Merge growth/Auth wave в production** | Review + merge PR #8 (или эквивалент `dev` → `main`); Vercel production deploy | Live URLs на triplandr.com совпадают с `dev` features |
| 2 | **Vercel / env** | Пройти [post-launch-checklist §1–6](../post-launch-checklist.md): Supabase, Resend, Plausible domain, Telegram bot/chat, service key | Leads → Telegram; newsletter test send OK |
| 3 | **Реальные affiliate URL** | В [`app/utils/partners.ts`](../../app/utils/partners.ts): подтвердить SafetyWing `referenceID`, Wise invite, iVisa/HousingAnywhere tracking; **заменить или убрать** `uaVisaAgent` (`example.com`) | Нет кликов на example.com; partner dashboards видят трафик |
| 4 | **Google Search Console** | Property + sitemap `https://triplandr.com/sitemap.xml` | Sitemap «Success»; появляются impressions |
| 5 | **Plausible goals** | Custom events: `affiliate_click`, `lead_submit`, `review_submit`, `compare_run`, `homepage_finder_submit` (+ props если план позволяет) | Events в dashboard, не только pageviews |
| 6 | **Telegram content chat / channel** | Daily pipeline + ручной calendar; отдельный admin chat для leads/moderation | Посты уходят по расписанию; test lead в admin chat |
| 7 | **Baseline KPI sheet** | Скопировать [kpi-retro-template.md](../kpi-retro-template.md) → Week 0 snapshot | Есть «до» цифры для WoW |

**Правило:** не тратить Week 2–4 на outreach, пока клики affiliate не атрибутируются и placeholders не убиты.

---

## 4. План по неделям (4 недели)

Owner везде: **founder**, если не указано иное. Оценка времени — solo, ~1–2 ч/день + блокеры.

### Week 1 — Production live + measurement + activate affiliate/leads

**Тема:** включить кран денег и счётчик.

| Задача | Deliverable | Success metric |
|--------|-------------|----------------|
| Merge → main → production | Deploy checklist зелёный | Features R1–R5 + Auth MVP на prod |
| Env + Telegram + Resend | Checklist §1–6 | Test lead + test newsletter |
| Partners.ts live URLs | PR на `dev`/`main` | 0 placeholder URL в UI |
| Plausible goals + smoke | Goals list + 1 ручной клик по каждому event | Events появляются <1 ч |
| GSC sitemap | Submitted | Status OK |
| Affiliate program accounts | Логины SafetyWing / Wise / … | Dashboard access |
| Lead partner shortlist | 5 агентств (UA→EU) с контактом | Список в notes; 0 писем ещё можно |
| Week 0 KPI retro | Заполненный шаблон | Baseline sessions / reviews / clicks |

**Не делать на W1:** массовый cold outreach, premium build, AdSense.

### Week 2 — Outreach + content cadence + convert compare SEO

**Тема:** трафик на money pages + первые партнёрские разговоры.

| Задача | Deliverable | Success metric |
|--------|-------------|----------------|
| Media kit PDF/Docs | Export [media-kit-v0](../media-kit-v0.md) + актуальные Plausible цифры | Файл готов к attach |
| Outreach batch 1 | 10–15 писем: affiliate managers + 5 relocation/visa agencies | ≥3 ответа / 15 писем (норма) |
| Daily TG + 2 calendar posts | Посты с deep-link на compare/country `?nat=UA` | Plausible referral from t.me |
| Internal linking | С хабов/homepage на top compare pairs | ↑ compare_run / organic compare |
| Hub bodies backlog | ≥1 из ES/PT/GE/TR/TH full body (если SEO gap) | Статья live |
| Moderation SLA | Queue ≤20; <48h approve | [moderation-sla](../moderation-sla.md) |
| Affiliate clicks watch | Таблица clicks by partner/slot | ≥N кликов для старта A/B (цель к W3: ≥100 total) |

**Success Week 2:** живой content loop + pipeline ответов; деньги могут ещё быть $0 — это OK, если clicks растут.

### Week 3 — Soft gates / nurture / first paid experiments

**Тема:** конверсия и первые деньги/договорённости.

| Задача | Deliverable | Success metric |
|--------|-------------|----------------|
| Affiliate A/B conclude | Решение по [decision rules](../affiliate-ab-testing.md) (≥2 нед, ≥100 clicks) | Winner shipped **или** «keep 50/50, мало данных» зафиксировано |
| Lead nurture | Ответ <24h на каждый lead; follow-up шаблон | ≥1 qualified conversation |
| Soft premium waitlist (opt.) | CTA на `/account` или country soft blur **без** полного paywall | Waitlist count; **не** ломать SSR SEO |
| Agency / B2B outreach | 5 писем с media kit + «stats snapshot» (не полный API) | ≥1 call booked |
| Newsletter #1–2 | Digest: top compare + 1 country + CTA review | Open rate зафиксирован; list growth WoW |
| First $ or signed term | Screenshot dashboard **или** signed CPA/sponsor term sheet | Атрибуция в KPI retro |

**Premium:** только waitlist / soft CTA если Auth на prod. Полный paywall (Lemon Squeezy, blur archive) — **скорее >30d**, см. [premium-paywall-reviews.md](./premium-paywall-reviews.md).

**Budget game:** не строить; максимум заметка «slot `budget` later».

### Week 4 — Stabilize winning channel + playbook + recurring ops

**Тема:** сделать доход **операционным**, не «проектным».

| Задача | Deliverable | Success metric |
|--------|-------------|----------------|
| Double-down winner | 80% времени на #1 канал (обычно affiliate **или** leads) | WoW ↑ по выбранной метрике |
| Kill / pause losers | Список «стоп» (партнёр без tracking, формат без ответа) | Меньше распыления |
| Ops playbook 1-pager | Daily/weekly checklist (ниже §6) в этом же doc или Notion | Можно выполнять «на автомате» |
| Partner reporting | Еженедельный CSV: clicks → partner; 1 email менеджеру | Relationship hygiene |
| Month retro | Полный [kpi-retro](../kpi-retro-template.md) + go/no-go sponsorship | Решение на месяц 2 |
| Month-2 backlog | 5 пунктов max (premium Phase 1? budget MVP? ещё hubs?) | Приоритеты согласованы с [README](./README.md) gates |

---

## 5. Каналы дохода: что зарабатывает NOW vs позже

Ранжирование для **горизонта 30 дней**.

| # | Канал | 30d роль | Когда деньги | Действие месяца |
|---|-------|----------|--------------|-----------------|
| 1 | **Affiliate** (SafetyWing, Wise, iVisa, Housing…) | **Primary** | После live URL + трафика; payout по cookie window партнёра | Activate → A/B → scale winner slots |
| 2 | **Lead gen** (legalization help) | **Secondary** | После договора CPA/fixed; Telegram alert | Fix delivery → 5 agencies → close 1 term |
| 3 | **B2B / media kit deals** | Parallel outreach | 2–6 недель цикл сделки | Hub/compare/TG packages; не строить API |
| 4 | **Newsletter sponsorship** | Later in funnel | После list size (ориентир: сотни+, не десятки) | Растить list; **не** продавать пустой лист |
| 5 | **Premium paywall** | Soft only | Полноценно после Auth + demand signal | Waitlist / soft CTA; **не** full build |
| 6 | **B2B API** | Spec + talk | После Auth + плотности отзывов ([gate](./b2b-api.md)) | Discovery calls; OpenAPI не блокер месяца 1 |
| 7 | **AdSense** | **DEFER** | Gate: ≥50k sessions/mo, CMP, 8 нед affiliate baseline, CWV… ([adsense-hero-deferred.md](./adsense-hero-deferred.md) §3.1) | Не подавать / не вставлять в hero |

### Приоритет усилий (время founder)

```
W1–W2:  50% unblock+measure  30% content/SEO  20% partner setup
W3–W4:  40% winning channel  25% outreach close  20% content  15% soft premium/B2B talk
```

---

## 6. Daily / weekly ops cadence

### Ежедневно (30–60 мин)

| Мин | Действие |
|-----|----------|
| 5 | Plausible: sessions, `affiliate_click`, `lead_submit` (вчера) |
| 10 | Модерация отзывов / Telegram approve (SLA <48h) |
| 5 | Ответ на leads и partner replies |
| 10–15 | Telegram daily post (pipeline) **или** правка кандидата |
| 5–10 | 1 micro-SEO: GSC query → title/internal link **или** 1 outreach email |

### Еженедельно (1 блок 90–120 мин)

| День (пример) | Блок |
|---------------|------|
| Пн | KPI retro (шаблон) + affiliate partner dashboards → EPC |
| Вт | Calendar post #1 (compare) |
| Ср | Outreach batch (5 писем) + follow-ups |
| Чт | Newsletter draft / send (когда list + Resend готовы) |
| Пт | Calendar post #2 + backlog triage (что **не** делать) |
| Вс | Лёгкий review: risks, kill switches |

Автоматизация: `npm run content:daily` + [content-data-sources.md](../content-data-sources.md); ручной слой — [telegram-content-calendar.md](../telegram-content-calendar.md).

---

## 7. KPI dashboard

Источник правды для ретро: **[kpi-retro-template.md](../kpi-retro-template.md)**.

### Weekly targets (framework — подставьте baseline Week 0)

Цели — **направление**, не обещание рынку. Пересчитывайте после W1.

| Metric | W1 | W2 | W3 | W4 | Источник |
|--------|----|----|----|----|----------|
| Sessions | baseline | +WoW | +WoW | +WoW | Plausible |
| Organic clicks | GSC on | ↑ | ↑ | ↑ | GSC |
| Reviews submitted / wk | ≥5 | ≥8 | ≥10 | ≥12 | Supabase/admin |
| `affiliate_click` / wk | измерение | ↑ | ≥ порога для A/B | winner steady | Plausible |
| `lead_submit` / wk | test OK | ≥1 | ≥2 | ≥2 | Plausible + DB |
| Affiliate $ (attributed) | 0 OK | tracking | first $ **or** pending | repeat week | Partner dashboards |
| Newsletter subs (cum.) | verify | +N | +N | +N | Resend/DB |
| Outreach replies | — | ≥3 | ≥1 call | ≥1 term **or** clear no | Mail |

**Go/no-go sponsorship** — критерии уже в KPI retro (§ sponsorship). Не продавать hub sponsor до proof of traffic + trust.

---

## 8. Risks & kill switches

| Риск | Симптом | Kill switch / ответ |
|------|---------|---------------------|
| **Trust damage** | Жалобы на «рекламный сайт»; путаница отзывов и affiliate | Усилить disclosure; убрать агрессивный slot; **никогда** не трогать рейтинги за деньги |
| **Low traffic** | Sessions flat 2+ недели | Стоп широкий outreach sponsors; 100% SEO+TG+reviews; сузить countries |
| **Partner rejection / no tracking** | Клики есть, dashboard пустой | Сменить ссылку за 48h или disable partner в `partners.ts` |
| **Placeholder leak** | Клики на `example.com` | Немедленно remove `uaVisaAgent` из primary slots |
| **Lead quality junk** | Спам в Telegram | Rate limit + ручной qualify; не слать агентствам сырой мусор |
| **Auth/premium backlash** | «Раньше было бесплатно» | Только soft waitlist; публичный archive агрегатов остаётся |
| **Burnout solo** | Cadence >60 мин/день каждый день | Резать outreach, не модерацию и не measurement |
| **Legal/compliance** | Affiliate без disclosure / spam email | Следовать `/about/monetization`; outreach personal, не blast |

---

## 9. Do NOT do in month 1

Явный anti-backlog (согласовано с deferred plans):

| Не делать | Почему | Когда можно |
|-----------|--------|-------------|
| **Choropleth / MapLibre rewrite** | SEO gate ≥5k organic/mo, compare indexed — [choropleth doc](./choropleth-map-search-deferred.md) | После gate |
| **Mass AdSense в hero** | Trust + finder UX; gate ≥50k sessions — [adsense doc](./adsense-hero-deferred.md) | После G1–G7 |
| **Heavy Budget game** | Отвлекает от affiliate/leads; Auth v2 для leaderboard | Parallel **после** стабилизации revenue loop; MVP anon later |
| **Full premium paywall build** | Нужен demand + SEO-safe SSR; Auth только фундамент | После waitlist signal; Phase 1 в premium doc |
| **B2B leads API / write API** | DPA, consent — Phase 3 | После read-only MVP и legal |
| **Продажа фейковых/бустнутых отзывов** | Убивает бренд навсегда | Никогда |
| **Новые locales / масса стран** | Размывает UA-first intent | После плотности отзывов на core EU |
| **Реактивация RU/BY как destinations** | Сознательно выключено | Только отдельное продуктовое решение |

### Рекомендуемый порядок после месяца 1 (если success)

1. Масштабировать winning channel + content  
2. Premium Phase 1 **или** Budget MVP (не оба full-time)  
3. B2B read-only API при плотности данных  
4. Choropleth / AdSense — строго по gates в [README](./README.md)

---

## 10. Чеклист старта (распечатать)

- [ ] PR #8 / `dev` → `main` merged, production healthy  
- [ ] Vercel env = post-launch checklist  
- [ ] `partners.ts` без `example.com`; tracking IDs подтверждены  
- [ ] GSC sitemap + Plausible goals  
- [ ] Telegram: content + admin leads  
- [ ] Week 0 KPI retro заполнен  
- [ ] Календарь: daily 30–60 мин заблокирован в schedule  

**Конец месяца:** заполненный Month retro + 1-page playbook + решение «что масштабируем в месяце 2».

