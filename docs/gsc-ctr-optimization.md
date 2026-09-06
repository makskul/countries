# GSC CTR optimization (EPIC-3.2)

Process to improve click-through rate on queries with high impressions and low CTR. Goal: **+10% relative CTR** on at least **5 URLs** per retro cycle (see [KPI retro](./kpi-retro-template.md)).

Plausible shows sessions; **Google Search Console** shows impressions, clicks, CTR, and average position for search snippets.

---

## Weekly workflow (30 min)

1. **GSC → Performance → Search results** — last 28 days, filter **Pages** or **Queries**.
2. Sort by **Impressions** descending; note rows where **CTR < expected** for position:

   | Avg position | Rough expected CTR |
   |--------------|-------------------|
   | 1–3 | 15–30% |
   | 4–7 | 5–12% |
   | 8–12 | 2–5% |

3. Pick up to **5 URLs** to tune this week (prioritize compare slugs and `?nat=UA` country landings).
4. For each URL, record **before** metrics in the tracker below.
5. Apply title/description tweak (see checklist); deploy; request re-index in GSC if urgent.
6. After **14–21 days**, record **after** metrics; mark win if CTR improved ≥10% relative (e.g. 2.0% → 2.2%+).

---

## Title tweak checklist

Use for `<title>` / `useSeoMeta` — uk primary, mirror en/ru.

- [ ] **Primary keyword first** — country name or «{A} vs {B}» before brand.
- [ ] **Intent match** — query contains «віза», «легалізація», «відгуки» → reflect in title.
- [ ] **Specificity** — nationality in title when landing is `?nat=UA` (`Відгуки українців про Польщу`).
- [ ] **Differentiation** — avoid duplicate titles across locales; each locale has native phrasing.
- [ ] **Length** — aim 50–60 characters visible in SERP; trim brand suffix if needed.
- [ ] **No clickbait** — stats must match page content (review counts, honest empty states).
- [ ] **Description** — 150–160 chars; one concrete benefit + CTA verb («Порівняй», «Читай відгуки»).

**Code locations:**

- Compare: `app/locales/*/compare.ts` (`seoTitleWithNat`, `seoDescription`)
- Nat landings: `app/locales/*/seo.ts` (`countryNat.title`, `countryNat.description`)
- Homepage / list: `app/locales/*/seo.ts` (`home`, `countries`)

---

## Baseline title improvements (Sep 2026 deploy)

Applied in locale files for common high-impression patterns:

| URL pattern | Change |
|-------------|--------|
| `/compare/{pair}?nat=UA` | Question-style title: «{A} чи {B} для {nat}?» + legalization/visa keywords |
| `/country/{slug}?nat=UA` | Nat landing title includes visa + legalization + year |
| `/uk/` homepage | Stronger benefit clause in meta description |
| `/uk/countries` | «Усі країни» + filter hint in description |
| `/uk/compare/pl-vs-de` (template) | Same compare formula for all pairs via i18n |

Re-measure these five page types in GSC after 3 weeks.

---

## URL tracker (copy per cycle)

| # | URL | Top query | Impr. | CTR before | Change made | CTR after | Δ |
|---|-----|-----------|-------|------------|-------------|-----------|---|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |
| 4 | | | | | | | |
| 5 | | | | | | | |

**Example row:**

| URL | Top query | Impr. | CTR before | Change | CTR after |
|-----|-----------|-------|------------|--------|-----------|
| `/uk/compare/pl-vs-de?nat=UA` | польща чи німеччина для українців | 1200 | 1.8% | Question title + «легалізація» | 2.1% |

---

## Indexing checks

- Sitemap submitted: see [backup-restore.md](./backup-restore.md#google-search-console-manual--epic-013).
- Compare pairs in sitemap: `server/api/sitemap-urls.ts`.
- After title deploy: GSC → URL inspection → **Request indexing** for changed URLs only (avoid spam).

---

## Related

- [Telegram calendar](./telegram-content-calendar.md) — promote compare pairs that gain CTR
- [KPI retro](./kpi-retro-template.md) — record organic/session outcomes
