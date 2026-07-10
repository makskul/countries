#!/usr/bin/env node
/**
 * Safety: refuse SQL files that DROP core data tables unless explicitly allowed.
 * Used by deploy-db.mjs before applying a migration.
 */
const DESTRUCTIVE_RE = /\bdrop\s+table\b/i
const PROTECTED = /\b(reviews|newsletter_subscribers|country_stats|cities|countries|admin_users)\b/i

export function assertSafeMigrationSql(filename, sql, { allowDestructive = false } = {}) {
  if (allowDestructive) return
  if (DESTRUCTIVE_RE.test(sql) && PROTECTED.test(sql)) {
    throw new Error(
      `Refusing destructive migration ${filename}: contains DROP TABLE for a core table. `
      + 'Fix the SQL (use IF NOT EXISTS / ALTER) or set ALLOW_DESTRUCTIVE_MIGRATIONS=1',
    )
  }
}
