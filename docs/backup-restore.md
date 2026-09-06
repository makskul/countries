# Database backup & restore runbook

Triplandr Postgres lives on Supabase. Nightly backups are created by [`scripts/backup-db.mjs`](../scripts/backup-db.mjs) (GitHub Actions cron) and stored locally and/or on S3-compatible storage (AWS S3 or Cloudflare R2).

## Backup (automated)

**Workflow:** [`.github/workflows/backup-db.yml`](../.github/workflows/backup-db.yml)

- **Schedule:** daily at 02:00 UTC
- **Manual run:** GitHub → Actions → “Backup database” → Run workflow

**What is backed up:**

- `public` schema (reviews, countries, CMS, etc.)
- Optional `auth` schema when `BACKUP_INCLUDE_AUTH=1` (admin users in Supabase Auth)

**Local manual run:**

```bash
# Same DB secrets as deploy-db.mjs
export DATABASE_URL="postgresql://..."
# or SUPABASE_DB_PASSWORD + SUPABASE_URL + SUPABASE_DB_REGION

node scripts/backup-db.mjs
# → ./backups/triplandr-YYYY-MM-DDTHH-MM-SS.sql.gz
```

**Optional S3/R2 upload** — set in GitHub secrets or `.env`:

| Variable | Purpose |
|----------|---------|
| `AWS_ACCESS_KEY_ID` | S3/R2 access key |
| `AWS_SECRET_ACCESS_KEY` | Secret key |
| `AWS_S3_BUCKET` | Bucket name |
| `AWS_REGION` | AWS region (`auto` for R2) |
| `AWS_ENDPOINT_URL` | R2 endpoint, e.g. `https://<account>.r2.cloudflarestorage.com` |
| `AWS_S3_PREFIX` | Key prefix (default `triplandr/backups/`) |
| `BACKUP_DELETE_LOCAL` | Set `1` to remove local file after upload |

Requires `@aws-sdk/client-s3` (`npm ci` in CI).

---

## Restore (staging drill)

> **Never restore a production dump directly onto production without a maintenance window and verified backup of the current state.**

### Prerequisites

- `postgresql-client` (`psql`, optionally `pg_restore` — dumps are plain SQL + gzip)
- A **staging** Supabase project (separate from production)
- A backup file: `triplandr-*.sql.gz`

### Dry-run on staging

1. **Download** the latest backup from S3/R2 or GitHub Actions artifact (if configured).
2. **Decompress** (keep original gzip as archive):

   ```bash
   gunzip -k triplandr-2026-09-01T02-00-00.sql.gz
   # → triplandr-2026-09-01T02-00-00.sql
   ```

3. **Connect** to staging DB (Dashboard → Settings → Database → Connection string, or pooler URI):

   ```bash
   export STAGING_DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
   ```

4. **Optional — reset public schema** on staging only:

   ```sql
   -- Run in Supabase SQL editor on STAGING
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO public;
   ```

5. **Restore:**

   ```bash
   psql "$STAGING_DATABASE_URL" -v ON_ERROR_STOP=1 -f triplandr-2026-09-01T02-00-00.sql
   ```

6. **Verify:**

   ```bash
   psql "$STAGING_DATABASE_URL" -c "SELECT count(*) FROM reviews;"
   psql "$STAGING_DATABASE_URL" -c "SELECT count(*) FROM countries;"
   npm run db:status   # against staging URL if exported
   ```

7. **Smoke-check** staging app: homepage, one country page, compare with two countries.

### If restore includes `auth` schema

Only restore `auth` on a fresh staging project or when you understand Supabase Auth implications. Prefer restoring `public` only for app data drills.

---

## Google Search Console (manual — EPIC 0.1.3)

Analytics and backups do not replace search indexing setup. **Do this once per property:**

1. Open [Google Search Console](https://search.google.com/search-console).
2. Add property **triplandr.com** (Domain or URL prefix).
3. Verify ownership (DNS TXT recommended for domain property).
4. Submit sitemap: **`https://triplandr.com/sitemap.xml`**
   - With i18n prefixes, the sitemap module may also expose locale variants; submit the root sitemap URL — Google will discover nested URLs.
5. After 24–48 h, check **Pages** and **Sitemaps** for crawl errors.
6. Optional: link GSC property to GA4/Plausible for cross-checking (Plausible has no native GSC integration; use GSC directly for search performance).

---

## Retention & monitoring

- Keep at least **7 daily** and **4 weekly** backups in object storage (configure bucket lifecycle rules).
- Alert if the GitHub Action “Backup database” fails two nights in a row.
- Before destructive migrations (`DROP`, bulk `DELETE`), confirm a fresh backup exists.

---

## Related

- Migrations: [`scripts/deploy-db.mjs`](../scripts/deploy-db.mjs), [`docs/admin-setup.md`](admin-setup.md)
- CI migrate workflow: [`.github/workflows/deploy-db.yml`](../.github/workflows/deploy-db.yml)
