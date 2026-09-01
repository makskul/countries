# Telegram content calendar (2 posts / week)

Ops template for Triplandr review-supply loop. Copy goes to the main channel; link to country or compare pages on triplandr.com.

**Cadence:** 2 posts per week (e.g. Tue + Fri, 18:00 Kyiv).

---

## Week template

| Day | Slot | Format | Owner | Status |
|-----|------|--------|-------|--------|
| Tue | Post 1 | **Compare of the week** | | ☐ |
| Fri | Post 2 | **Empty country spotlight** | | ☐ |

---

## Post 1 — Compare of the week

**Goal:** Drive traffic to indexable compare URLs and comments.

**Pick:** One pair from `app/data/comparePairs.ts` or top GSC compare query.

| Field | Example |
|-------|---------|
| Pair | PL vs DE |
| URL | `https://triplandr.com/uk/compare/pl-vs-de?nat=UA` |
| Hook | «Куди простіше легалізуватися українцю — Польща чи Німеччина?» |
| Body | 2–3 bullets from real stats if available; otherwise honest “мало відгуків — допоможіть”. |
| CTA | «Порівняти →» + «Напишіть відгук, якщо були в обох» |

**Checklist before publish**

- [ ] Link uses correct locale (`/uk/`, `/en/`, `/ru/`)
- [ ] `?nat=UA` when post targets Ukrainians
- [ ] No paid / sponsored wording unless disclosed

---

## Post 2 — Empty country spotlight

**Goal:** Fill gaps from `app/data/emptyStateCampaign.ts`.

**Pick:** Next country from campaign list with **0 UA reviews** (verify in admin).

| Field | Example |
|-------|---------|
| Country | Iceland (IS) |
| URL | `https://triplandr.com/uk/country/is?nat=UA` |
| Hook | «На Triplandr ще немає жодного відгуку українця про Ісландію» |
| Body | One line why country matters to audience (visa, relocation, remote work). |
| CTA | «Напишіть перший відгук →» |

**Rotation (Sep 2026 campaign queue)**

1. IS — Iceland  
2. MT — Malta  
3. CY — Cyprus  
4. LU — Luxembourg  
5. SI — Slovenia  
6. SK — Slovakia  
7. EE — Estonia  
8. LV — Latvia  
9. HR — Croatia  
10. BG — Bulgaria  

After 10 weeks, refresh list from `country_stats` (UA × target countries with `total_reviews = 0`).

---

## Monthly tracker

| Week | Compare pair | Empty country | Notes |
|------|--------------|---------------|-------|
| W1 | | | |
| W2 | | | |
| W3 | | | |
| W4 | | | |

**KPIs (review supply):** submitted reviews/week (goal ≥15), pending queue (see [moderation SLA](./moderation-sla.md)).

---

## Copy snippets (UA)

**Compare CTA:** «Відкрити порівняння на Triplandr →»  
**Empty CTA:** «Станьте першим — 5 хвилин, анонімно →»  
**Disclaimer:** «Відгуки модеруються; без замовних оцінок.»

---

## EN / RU variants

Duplicate post structure for `/en/` and `/ru/` channels or bilingual channel as needed; keep same URL pattern with locale prefix.
