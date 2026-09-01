# Triplandr — Media kit v0 (EPIC-3.4)

**Version:** 0.1 · **Updated:** Sep 2026  
**Contact:** hello@triplandr.com · **Site:** [triplandr.com](https://triplandr.com)

> Export to PDF: open this file in VS Code / Cursor → Markdown PDF extension, or paste sections into Google Docs → File → Download PDF. Attach to sponsorship outreach emails.

---

## One-liner

**Triplandr** — платформа реальних відгуків емігрантів про країни, відфільтрованих за **національністю** (спочатку українці). Без заказних відгуків; партнерські посилання розкриті прозоро.

---

## Audience

| Segment | Description |
|---------|-------------|
| **Primary** | Українці, що розглядають релокацію / вже за кордоном (EU, UK, GE, TR, Asia) |
| **Secondary** | PL/DE/EN expats comparing destinations |
| **Locales** | uk (primary), en, ru — prefix URLs `/uk/`, `/en/`, `/ru/` |
| **Intent** | High — visa, legalization, cost of living, safety before move |

**Traffic (fill before outreach):**

| Metric | Current | Notes |
|--------|---------|-------|
| Monthly sessions | _Plausible_ | |
| Top countries (content) | PL, DE, CZ, ES… | |
| Compare tool usage | _compare_run events_ | |
| Email list | _newsletter_subscribers_ | |

---

## Product surfaces (inventory)

| Surface | URL pattern | Best for sponsors |
|---------|-------------|-------------------|
| **Country hub articles** | `/country/{slug}` + CMS hub | Native guides «UA в {country}» |
| **Compare pages** | `/compare/pl-vs-de?nat=UA` | Decision-stage audience |
| **Country reviews** | `/country/{slug}?nat=UA` | Long-tail SEO |
| **Homepage map** | `/` | Brand visibility |
| **Newsletter** | footer subscribe | Retention |

Published hub countries (CMS): PL, DE, CZ, ES, PT, GE, TR, TH — see `app/data/contentHubCountries.ts`.

---

## Sponsorship formats (v0)

All sponsored content **labeled**; no influence on review moderation ([/about/monetization](https://triplandr.com/about/monetization)).

### 1. Hub sponsor badge

- **Placement:** Top of content hub article «Українці в {country}»
- **Includes:** Logo, one-line offer, single CTA link (visa / insurance / relocation service)
- **Duration:** 1–3 months per country
- **Indicative:** _Fill rate card — e.g. €200–500/mo per hub_

### 2. Compare page mention

- **Placement:** Text block under comparison table (not winner algorithm)
- **Includes:** «Партнер рекомендує» + disclosure
- **Duration:** Monthly rotation per compare pair
- **Indicative:** _€100–300/mo per pair_

### 3. Newsletter feature

- **Placement:** One sponsor block in weekly digest (uk)
- **Includes:** 80 words + link; sent via Resend
- **Indicative:** _€150/issue_

### 4. Telegram co-post

- **Placement:** 1 of 2 weekly posts ([content calendar](./telegram-content-calendar.md))
- **Includes:** Compare or country link + sponsor mention
- **Indicative:** _€100/post_

---

## What we don’t sell

- Paid or fake reviews
- Hidden affiliate links
- Ranking manipulation in compare «winner»
- Exclusive category lock that misleads users

---

## Editorial & moderation

- Reviews moderated; target **<48h** approve ([moderation SLA](./moderation-sla.md))
- Partner links use `rel="sponsored"` + `PartnerDisclosure` component
- Analytics: `affiliate_click` tracked; sponsor reporting available on request

---

## Technical specs (creatives)

| Asset | Spec |
|-------|------|
| Logo | SVG or PNG, min 120×40, light background |
| CTA URL | HTTPS; UTM: `utm_source=triplandr&utm_medium=sponsor&utm_campaign={partner}` |
| Copy | uk primary; en/ru optional |
| Tracking | Sponsor clicks reported separately if needed (custom UTM campaign) |

---

## Outreach checklist

- [ ] Fill traffic table from Plausible + KPI retro
- [ ] Export this doc to PDF
- [ ] Target: relocation agencies, visa services, insurance (UA diaspora)
- [ ] Pitch hub sponsor for one country (e.g. PL) as pilot
- [ ] Log responses in team sheet

---

## Related docs

- [KPI retro template](./kpi-retro-template.md)
- [Affiliate A/B testing](./affiliate-ab-testing.md)
- [GSC CTR optimization](./gsc-ctr-optimization.md)
