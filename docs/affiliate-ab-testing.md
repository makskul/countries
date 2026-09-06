# Affiliate A/B testing (EPIC-3.1)

Lightweight two-bucket experiment for affiliate placement. No third-party A/B tool — variants are assigned via cookie and reported in Plausible custom events.

## Experiments

| Bucket | Values | What changes |
|--------|--------|--------------|
| **Sidebar position** | `top` / `bottom` | Partner block on country pages: after actions vs after similar countries |
| **Compare surface** | `compare_on` / `country_only` | Winner CTA on `/compare/[pair]` shown vs hidden (sidebar still shows on country pages) |

Cookie: `nv_aff_ab` — format `top,compare_on` or `bottom,country_only`. TTL 30 days. Assigned on first request by `app/middleware/affiliate-ab.global.ts`.

## Analytics

Every `affiliate_click` event includes:

| Prop | Example | Notes |
|------|---------|-------|
| `partner` | `safetywing` | Partner slug |
| `slot` | `sidebar`, `compare`, `map` | Placement surface |
| `country` | `pl` | Target country when known |
| `nat` | `UA` | Nationality filter when set |
| `ab_variant` | `top_compare_on` | Combined bucket label |

**Plausible setup (one-time):**

1. Site settings → **Goals** → add custom event `affiliate_click`.
2. Enable **Custom properties** for `ab_variant`, `slot`, `partner` (Plausible paid plan or self-hosted with props enabled).

## EPC report (weekly)

**EPC** = earnings per click = affiliate revenue ÷ tracked clicks (approximate until partner dashboards are linked).

### Step 1 — Clicks by variant (Plausible)

1. Open **Plausible → triplandr.com → Custom events → affiliate_click**.
2. Break down by **ab_variant** (or export CSV with props).
3. Also break down by **slot** to compare sidebar vs compare vs map independently of A/B.

Example table to fill:

| ab_variant | clicks | % of total |
|------------|--------|------------|
| top_compare_on | | |
| top_country_only | | |
| bottom_compare_on | | |
| bottom_country_only | | |

### Step 2 — Revenue (partner dashboards)

| Partner | Dashboard | Period | Commission / clicks |
|---------|-----------|--------|---------------------|
| SafetyWing | affiliate portal | same week | |
| iVisa | | | |
| Wise | | | |

Total revenue ÷ total `affiliate_click` = **blended EPC**.

### Step 3 — Decision rules (after ≥2 weeks, ≥100 clicks total)

| Signal | Action |
|--------|--------|
| Sidebar `bottom` EPC > `top` by ≥15% | Ship bottom placement for all users |
| `country_only` EPC ≥ `compare_on` (sidebar compensates) | Remove compare winner block |
| Compare slot EPC >> sidebar | Add compare links in Telegram + internal links |
| No variant wins (<10% diff) | Keep 50/50 or increase traffic before deciding |

Document outcome in [KPI retro](./kpi-retro-template.md).

## Manual override (debug)

Set cookie in browser console:

```js
document.cookie = 'nv_aff_ab=bottom,country_only; path=/; max-age=2592000; SameSite=Lax'
```

Reload country and compare pages to verify layout.

## Related

- [`app/utils/affiliateAb.ts`](../app/utils/affiliateAb.ts)
- [`app/utils/partners.ts`](../app/utils/partners.ts)
- [Monetization page](/about/monetization) — user-facing disclosure
