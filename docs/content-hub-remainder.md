# Content hub remainder (admin)

EPIC-2.4 ships **8 UA×country hubs**. Migration `018_ua_hub_articles.sql` publishes:

| Code | Status | Admin action |
|------|--------|--------------|
| **PL** | Full article (uk/en/ru) | Optional polish in `/admin/countries/PL` |
| **DE** | Full article (uk/en/ru) | Optional polish |
| **CZ** | Full article (uk/en/ru) | Optional polish |
| **ES** | Excerpt only | Add `article_body_*` in CMS |
| **PT** | Excerpt only | Add `article_body_*` in CMS |
| **GE** | Excerpt only | Add `article_body_*` in CMS |
| **TR** | Excerpt only | Add `article_body_*` in CMS |
| **TH** | Excerpt only | Add `article_body_*` in CMS |

## Suggested body outline (excerpt-only countries)

Use the same paragraph structure as PL/DE/CZ:

1. Why Ukrainians choose this country (1 short paragraph)
2. Legalization / visa / registration steps (not legal advice — link official sources)
3. Housing + work reality for UA newcomers
4. CTA to compare pages (already linked in `CountryHubSection`)

## Internal links (live in UI)

- Country hub → up to 3 compare slugs from `app/data/comparePairs.ts`
- Compare page → hub country pages with `?nat=ua` for hub destinations

## Deploy

Apply migration via usual DB deploy pipeline (`npm run db:deploy` or CI). No app restart required beyond deploy.
