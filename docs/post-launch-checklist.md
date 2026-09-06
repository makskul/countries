# Post-launch checklist (Triplandr)

Manual steps after deploying the build wave. Env reference: [`.env.example`](../.env.example). Runtime mapping: [`nuxt.config.ts`](../nuxt.config.ts) → `runtimeConfig`.

---

## 1. Environment variables (Vercel / hosting)

Set production secrets before or immediately after first deploy.

| Variable | Required | Notes |
|----------|----------|-------|
| `SUPABASE_URL`, `SUPABASE_KEY` | Yes | Public anon key for client + RLS |
| `SUPABASE_SERVICE_KEY` | Yes | Review submit proxy, leads, admin login, Telegram callbacks |
| `SUPABASE_ACCESS_TOKEN` or `DATABASE_URL` | Yes (migrations) | Build/deploy pipeline; see [`admin-setup.md`](admin-setup.md) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First deploy | Bootstrap superadmin via `db:deploy` |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | For newsletter | Test send from admin panel |
| `NUXT_PUBLIC_PLAUSIBLE_DOMAIN` | Recommended | Analytics; empty = disabled |
| `NUXT_PUBLIC_SENTRY_DSN` | Optional | Client error capture |
| `TELEGRAM_*`, `SUPABASE_WEBHOOK_SECRET` | Optional | Leads + review moderation in Telegram |
| `DATABASE_URL` + AWS/R2 vars | Optional | Nightly backups — see [`backup-restore.md`](backup-restore.md) |

Cross-check: every key in `runtimeConfig` (private + `public`) has a corresponding entry in `.env.example`.

---

## 2. Google Search Console — submit sitemap

**Once per property** (also documented in [`backup-restore.md`](backup-restore.md#google-search-console-manual--epic-013)).

- [ ] Add property **triplandr.com** in [Google Search Console](https://search.google.com/search-console)
- [ ] Verify ownership (DNS TXT for domain property recommended)
- [ ] Submit sitemap: **`https://triplandr.com/sitemap.xml`**
- [ ] After 24–48 h, check **Pages** and **Sitemaps** for crawl errors

Dynamic URLs (countries, compare pairs, hubs) come from `/api/sitemap-urls` at build/runtime.

---

## 3. Resend — domain verification

Required before newsletter test send or production digests.

- [ ] Create API key at [resend.com/api-keys](https://resend.com/api-keys) → set `RESEND_API_KEY`
- [ ] Add and verify sending domain (DNS records) for the address in `RESEND_FROM_EMAIL`
- [ ] Set `RESEND_FROM_EMAIL` to a verified sender, e.g. `Triplandr <hello@triplandr.com>`
- [ ] Admin → Newsletter → send test (uses `ADMIN_EMAIL` as recipient)

---

## 4. Plausible — analytics domain

- [ ] Register site **triplandr.com** in [Plausible](https://plausible.io) (or self-hosted instance)
- [ ] Set `NUXT_PUBLIC_PLAUSIBLE_DOMAIN=triplandr.com` in production env
- [ ] Deploy; confirm `plausible.io/js/script.js` loads and events appear in dashboard
- [ ] Custom events: see [`app/composables/useAnalytics.ts`](../app/composables/useAnalytics.ts)

Leave empty in staging/preview to avoid polluting production stats.

---

## 5. Sentry — optional error monitoring

- [ ] Create a browser (JavaScript) project in Sentry
- [ ] Copy DSN → `NUXT_PUBLIC_SENTRY_DSN`
- [ ] Deploy; trigger a test error in preview or use Sentry verify step
- [ ] Skip entirely if unset — plugin no-ops ([`app/plugins/sentry.client.ts`](../app/plugins/sentry.client.ts))

---

## 6. Telegram — leads and review moderation

### Leads (country-page lead form)

- [ ] Create bot via [@BotFather](https://t.me/BotFather)
- [ ] Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID`
- [ ] Submit a test lead on a country page → message in admin chat ([`server/api/leads.post.ts`](../server/api/leads.post.ts))

Both vars must be set; otherwise leads are stored in DB only (no Telegram).

### Reviews (optional moderation workflow)

- [ ] Set `SUPABASE_WEBHOOK_SECRET` (random string)
- [ ] Supabase → Database → Webhooks → new webhook on `reviews` **INSERT**  
  URL: `https://triplandr.com/api/webhook/review`  
  Header: `x-webhook-secret: <same as SUPABASE_WEBHOOK_SECRET>`
- [ ] Register Telegram bot webhook:  
  `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://triplandr.com/api/webhook/telegram`
- [ ] Submit a test review → approve/reject buttons in Telegram

Details: [`admin-setup.md`](admin-setup.md#telegram-optional).

---

## 7. Content hub — article bodies (ES / PT / GE / TR / TH)

Migration `018_ua_hub_articles.sql` ships full articles for **PL, DE, CZ** only. These need CMS bodies:

| Code | Status |
|------|--------|
| ES, PT, GE, TR, TH | Excerpt only — add `article_body_*` in admin |

- [ ] For each country: Admin → Countries → edit → article blocks (UK / EN / RU)
- [ ] Follow outline in [`content-hub-remainder.md`](content-hub-remainder.md)
- [ ] Toggle “show article on site” when ready

---

## 8. Affiliate partner URLs

Replace placeholders in [`app/utils/partners.ts`](../app/utils/partners.ts) before monetization goes live:

| Partner | Current state | Action |
|---------|---------------|--------|
| `safetywing` | `referenceID=triplandr` | Confirm affiliate reference ID with SafetyWing |
| `ivisa` | Generic URL + UTM | Sign affiliate program; add tracking params |
| `uaVisaAgent` | **`https://example.com/...`** | Replace with real partner URL or remove slot |
| `wise` | `invite/triplandr` | Confirm Wise invite link |
| `housingAnywhere` | Generic URL + UTM | Confirm affiliate terms and deep-link format |

- [ ] Update `url` and `utm` per signed agreements
- [ ] Disclosure copy: [`app/components/PartnerDisclosure.vue`](../app/components/PartnerDisclosure.vue), [`app/pages/about/monetization.vue`](../app/pages/about/monetization.vue)
- [ ] Smoke-test sidebar / compare / map slots with `?nat=ua` on hub countries

---

## 9. Database backups (recommended)

- [ ] Add GitHub secrets for `DATABASE_URL` (or password + region) — see [`.github/workflows/backup-db.yml`](../.github/workflows/backup-db.yml)
- [ ] Optional: R2/S3 secrets for off-site storage
- [ ] Run workflow manually once; confirm artifact or S3 object
- [ ] Quarterly restore drill on staging — [`backup-restore.md`](backup-restore.md)

---

## 10. Smoke verification

- [ ] `npm run test:smoke` passes in CI ([`.github/workflows/smoke.yml`](../.github/workflows/smoke.yml))
- [ ] Homepage, `/countries`, one country hub, one compare pair
- [ ] Review form submit (requires `SUPABASE_SERVICE_KEY`)
- [ ] Lead form submit (optional Telegram)
- [ ] Admin login and newsletter dry-run

---

## Related docs

- [`admin-setup.md`](admin-setup.md) — migrations, admin bootstrap, Telegram webhooks
- [`backup-restore.md`](backup-restore.md) — backup cron, restore drill, GSC note
- [`content-hub-remainder.md`](content-hub-remainder.md) — hub article backlog
- [`moderation-sla.md`](moderation-sla.md) — review turnaround targets
