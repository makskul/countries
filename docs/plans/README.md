# Triplandr — Future Features Roadmap

Планы следующей волны развития (после growth backlog EPIC 0–3). Не коммитить secrets; реализация — после стабилизации build wave R1–R5.

## Активный 30-дневный execution plan

**→ [30-day-revenue-plan.md](./30-day-revenue-plan.md)** — план выхода на **стабильный доход** (affiliate + leads + outreach; AdSense/choropleth/full premium отложены). Обновлять KPI weekly через [kpi-retro-template.md](../kpi-retro-template.md).

## Документы

| Приоритет | Документ | Статус | Gate / условие старта |
|-----------|----------|--------|------------------------|
| **NOW** | [30-day-revenue-plan.md](./30-day-revenue-plan.md) | **Active** | Production live + measurement (см. P0 blockers в плане) |
| P0 | [auth-all-users.md](./auth-all-users.md) | Ready / MVP on `dev` | После R1–R5 deploy; фундамент premium/B2B |
| P1 | [premium-paywall-reviews.md](./premium-paywall-reviews.md) | Ready | Требует Auth (Phase 1); в месяце 1 — только waitlist/soft CTA |
| P1 | [budget-game.md](./budget-game.md) | Ready | Анонимный MVP; **не** в фокусе месяца 1 revenue |
| P2 | [choropleth-map-search-deferred.md](./choropleth-map-search-deferred.md) | **DEFER** | ≥5k organic/mo, compare indexed ≥90% |
| P3 | [adsense-hero-deferred.md](./adsense-hero-deferred.md) | **DEFER** | ≥50k sessions/mo, CMP, affiliate baseline |
| P3 | [b2b-api.md](./b2b-api.md) | Ready (MVP spec) | Auth + ≥40 стран с 5+ отзывами; месяц 1 — outreach only |

## Зависимости

```mermaid
flowchart TD
  deploy[R1–R5 deploy + SEO baseline]
  auth[Auth all users]
  premium[Premium paywall]
  budget[Budget game MVP]
  choropleth[Choropleth / map search]
  adsense[AdSense in-content]
  b2b[B2B API MVP]

  deploy --> auth
  deploy --> budget
  deploy --> choropleth
  auth --> premium
  auth --> b2b
  deploy --> adsense
  choropleth -.->|SEO gate| deploy
  adsense -.->|traffic gate| deploy
```

## Рекомендуемая очередность

1. **Deploy build wave** (R1→R5) — compare SEO, hubs, leads, smoke CI
2. **30-day revenue execution** — [план](./30-day-revenue-plan.md): affiliate + leads + media-kit outreach
3. **Auth Phase 0–1** — profiles, magic link + Google, review ownership (MVP может уже быть на `dev`)
4. **Premium paywall Phase 1** — после Auth + demand (waitlist); freemium 3 reviews + soft blur
5. **Budget game MVP** — параллельно *после* стабилизации revenue loop; affiliate slot `budget`
6. **Дешёвые map wins** — поиск в списке, клики по карте (из choropleth doc, до gate)
7. **B2B API read-only** — после Auth + достаточной плотности отзывов
8. **Choropleth full** — только после SEO gate (2+ мес метрик)
9. **AdSense** — in-content/sidebar, не hero; после traffic gate

## Cross-links

- **30-day revenue:** [30-day-revenue-plan.md](./30-day-revenue-plan.md)
- Monetization transparency: `/about/monetization`, [media-kit-v0.md](../media-kit-v0.md)
- Affiliate A/B: [affiliate-ab-testing.md](../affiliate-ab-testing.md)
- GSC/KPI: [gsc-ctr-optimization.md](../gsc-ctr-optimization.md), [kpi-retro-template.md](../kpi-retro-template.md)
- Post-launch ops: [post-launch-checklist.md](../post-launch-checklist.md)

## Не делать рано

- Mass AdSense в hero — бьёт по finder UX и trust positioning
- MapLibre rewrite — SVG incremental достаточен до gate
- B2B leads API — до DPA и explicit consent (Phase 3 в b2b-api.md)
- Premium без SEO-safe SSR — риск cloaking
