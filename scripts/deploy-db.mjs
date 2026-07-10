#!/usr/bin/env node
/**
 * Applies Supabase SQL migrations and seeds during deploy/CI.
 *
 * Auth (one of):
 *   A) SUPABASE_ACCESS_TOKEN  — Management API (no Postgres password needed)
 *      Create at: https://supabase.com/dashboard/account/tokens
 *   B) DATABASE_URL           — full Postgres URI
 *   C) SUPABASE_DB_PASSWORD + SUPABASE_URL — builds URI (add SUPABASE_DB_REGION for pooler)
 *
 * Optional admin bootstrap (service key, not DB password):
 *   SUPABASE_SERVICE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
 *
 * Loads repo-root `.env` automatically for local runs.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { assertSafeMigrationSql } from './assert-safe-migration.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const MIGRATIONS_DIR = join(ROOT, 'supabase/migrations')
const SEED_DIR = join(ROOT, 'supabase/seed')
const ENV_FILE = join(ROOT, '.env')

loadEnvFile(ENV_FILE)

const {
  SUPABASE_URL,
  NUXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  SUPABASE_ACCESS_TOKEN,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} = process.env

const MIGRATION_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS _schema_migrations (
  filename text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
`

function loadEnvFile(path) {
  if (!existsSync(path)) return
  const text = readFileSync(path, 'utf8')
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq <= 0) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

function extractProjectRef(supabaseUrl) {
  try {
    const ref = new URL(supabaseUrl).hostname.split('.')[0]
    return ref || null
  } catch {
    return null
  }
}

function projectRef() {
  return extractProjectRef(SUPABASE_URL || NUXT_PUBLIC_SUPABASE_URL || '')
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

function listSqlFiles(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter(f => f.endsWith('.sql')).sort()
}

/** @returns {string | null} */
export function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  const password = process.env.SUPABASE_DB_PASSWORD
  const supabaseUrl = SUPABASE_URL || NUXT_PUBLIC_SUPABASE_URL
  if (!password || !supabaseUrl) {
    return null
  }

  const ref = extractProjectRef(supabaseUrl)
  if (!ref) {
    return null
  }

  const encoded = encodeURIComponent(password)
  const region = process.env.SUPABASE_DB_REGION

  if (region || process.env.SUPABASE_DB_HOST) {
    const host = process.env.SUPABASE_DB_HOST || `aws-0-${region}.pooler.supabase.com`
    const port = process.env.SUPABASE_DB_PORT || '6543'
    return `postgresql://postgres.${ref}:${encoded}@${host}:${port}/postgres`
  }

  if (process.env.VERCEL === '1') {
    console.warn('[deploy-db] On Vercel without SUPABASE_DB_REGION — trying direct db host (often blocked). Prefer SUPABASE_ACCESS_TOKEN or set SUPABASE_DB_REGION.')
  }

  const host = process.env.SUPABASE_DB_HOST || `db.${ref}.supabase.co`
  const port = process.env.SUPABASE_DB_PORT || '5432'
  return `postgresql://postgres:${encoded}@${host}:${port}/postgres`
}

function credentialsHint() {
  return [
    '[deploy-db] Need ONE of:',
    '  1) SUPABASE_ACCESS_TOKEN  (recommended without Dashboard DB access)',
    '     → owner creates at https://supabase.com/dashboard/account/tokens',
    '  2) SUPABASE_DB_PASSWORD   (Database password from project Settings → Database)',
    '  3) DATABASE_URL           (full Postgres URI, prefer pooler on Vercel)',
  ].join('\n')
}

async function main() {
  const accessToken = SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_ACCESS_TOKEN
  const databaseUrl = resolveDatabaseUrl()

  if (accessToken) {
    const ref = projectRef()
    if (!ref) {
      throw new Error('SUPABASE_URL is required when using SUPABASE_ACCESS_TOKEN')
    }
    console.log(`[deploy-db] Using Management API for project ${ref}`)
    const api = createManagementClient(accessToken, ref)
    await ensureMigrationTableApi(api)
    await runMigrationsApi(api)
    await runSeedsApi(api)
    await bootstrapAdmin()
    console.log('[deploy-db] Done')
    return
  }

  if (!databaseUrl) {
    console.error('[deploy-db] No DB credentials — migrations skipped')
    console.error(credentialsHint())
    if (process.env.VERCEL === '1' || process.env.CI === 'true') {
      console.error('[deploy-db] Add SUPABASE_ACCESS_TOKEN or SUPABASE_DB_PASSWORD to Vercel/GitHub secrets')
    }
    return
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 12_000,
  })

  try {
    await client.connect()
  } catch (err) {
    const message = err?.message ?? String(err)
    console.error('[deploy-db] Could not connect to database:', message)
    console.error('[deploy-db] Tip: set SUPABASE_DB_REGION for pooler, or use SUPABASE_ACCESS_TOKEN instead')
    throw err
  }

  console.log('[deploy-db] Connected via Postgres')

  try {
    await ensureMigrationTablePg(client)
    await runMigrationsPg(client)
    await runSeedsPg(client)
    await bootstrapAdmin()
    console.log('[deploy-db] Done')
  } finally {
    await client.end()
  }
}

function createManagementClient(token, ref) {
  const base = `https://api.supabase.com/v1/projects/${ref}`

  async function runQuery(query) {
    const res = await fetch(`${base}/database/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })
    const text = await res.text()
    let body
    try {
      body = text ? JSON.parse(text) : null
    } catch {
      body = text
    }
    if (!res.ok) {
      const detail = typeof body === 'string' ? body : JSON.stringify(body)
      throw new Error(`Management API ${res.status}: ${detail}`)
    }
    return body
  }

  return { runQuery }
}

async function ensureMigrationTableApi(api) {
  await api.runQuery(MIGRATION_TABLE_SQL)
}

async function appliedSetApi(api) {
  const rows = await api.runQuery('SELECT filename FROM _schema_migrations')
  const list = Array.isArray(rows) ? rows : []
  return new Set(list.map(r => r.filename).filter(Boolean))
}

async function runMigrationsApi(api) {
  const files = listSqlFiles(MIGRATIONS_DIR)
  if (!files.length) {
    console.log('[deploy-db] No migrations directory')
    return
  }

  const applied = await appliedSetApi(api)
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`[deploy-db] skip migration (already applied): ${file}`)
      continue
    }
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8')
    console.log(`[deploy-db] applying migration: ${file}`)
    await api.runQuery(`
${sql}

INSERT INTO _schema_migrations (filename) VALUES (${sqlString(file)});
`)
  }
}

async function runSeedsApi(api) {
  const files = listSqlFiles(SEED_DIR)
  if (!files.length) return

  const applied = await appliedSetApi(api)
  for (const file of files) {
    const seedKey = `seed:${file}`
    if (applied.has(seedKey)) {
      console.log(`[deploy-db] skip seed (already applied): ${file}`)
      continue
    }
    const sql = readFileSync(join(SEED_DIR, file), 'utf8')
    console.log(`[deploy-db] applying seed: ${file}`)
    await api.runQuery(`
${sql}

INSERT INTO _schema_migrations (filename) VALUES (${sqlString(seedKey)});
`)
  }
}

async function ensureMigrationTablePg(client) {
  await client.query(MIGRATION_TABLE_SQL)
}

async function runMigrationsPg(client) {
  const files = listSqlFiles(MIGRATIONS_DIR)
  if (!files.length) {
    console.log('[deploy-db] No migrations directory')
    return
  }

  for (const file of files) {
    const { rows } = await client.query(
      'SELECT 1 FROM _schema_migrations WHERE filename = $1',
      [file],
    )
    if (rows.length > 0) {
      console.log(`[deploy-db] skip migration (already applied): ${file}`)
      continue
    }

    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8')
    console.log(`[deploy-db] applying migration: ${file}`)
    await client.query('BEGIN')
    try {
      await client.query(sql)
      await client.query(
        'INSERT INTO _schema_migrations (filename) VALUES ($1)',
        [file],
      )
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    }
  }
}

async function runSeedsPg(client) {
  const files = listSqlFiles(SEED_DIR)
  if (!files.length) return

  for (const file of files) {
    const seedKey = `seed:${file}`
    const { rows } = await client.query(
      'SELECT 1 FROM _schema_migrations WHERE filename = $1',
      [seedKey],
    )
    if (rows.length > 0) {
      console.log(`[deploy-db] skip seed (already applied): ${file}`)
      continue
    }

    const sql = readFileSync(join(SEED_DIR, file), 'utf8')
    console.log(`[deploy-db] applying seed: ${file}`)
    await client.query('BEGIN')
    try {
      await client.query(sql)
      await client.query(
        'INSERT INTO _schema_migrations (filename) VALUES ($1)',
        [seedKey],
      )
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    }
  }
}

async function bootstrapAdmin() {
  const supabaseUrl = SUPABASE_URL || NUXT_PUBLIC_SUPABASE_URL
  const serviceKey = SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY
  const adminEmail = ADMIN_EMAIL || process.env.ADMIN_EMAIL
  const adminPassword = ADMIN_PASSWORD || process.env.ADMIN_PASSWORD

  if (!supabaseUrl || !serviceKey || !adminEmail || !adminPassword) {
    console.log('[deploy-db] Admin bootstrap skipped (set ADMIN_EMAIL + ADMIN_PASSWORD to enable)')
    return
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: existing } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', adminEmail)
    .maybeSingle()

  if (existing) {
    console.log(`[deploy-db] Admin already exists: ${adminEmail}`)
    return
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  })

  if (createError) {
    if (createError.message?.includes('already been registered')) {
      const { data: list } = await supabase.auth.admin.listUsers()
      const user = list?.users?.find(u => u.email === adminEmail)
      if (!user) throw createError

      await supabase.from('admin_users').upsert({
        id: user.id,
        email: adminEmail,
        role: 'superadmin',
      }, { onConflict: 'id' })
      console.log(`[deploy-db] Linked existing auth user as admin: ${adminEmail}`)
      return
    }
    throw createError
  }

  if (!created.user) throw new Error('Failed to create admin user')

  const { error: insertError } = await supabase.from('admin_users').insert({
    id: created.user.id,
    email: adminEmail,
    role: 'superadmin',
  })

  if (insertError) throw insertError
  console.log(`[deploy-db] Created superadmin: ${adminEmail}`)
}

async function printStatus() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN
  const databaseUrl = resolveDatabaseUrl()

  if (accessToken) {
    const ref = projectRef()
    if (!ref) throw new Error('SUPABASE_URL required for status via Management API')
    const api = createManagementClient(accessToken, ref)
    await ensureMigrationTableApi(api)
    const applied = await appliedSetApi(api)
    console.log(`[deploy-db] status: CONNECTED (Management API, ${ref})`)
    printApplied(applied)
    return
  }

  if (!databaseUrl) {
    console.log('[deploy-db] status: NO_DB_CREDENTIALS')
    console.log(credentialsHint())
    process.exit(1)
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 12_000,
  })

  try {
    await client.connect()
    await ensureMigrationTablePg(client)
    const { rows: appliedRows } = await client.query(
      'SELECT filename FROM _schema_migrations ORDER BY applied_at',
    )
    console.log('[deploy-db] status: CONNECTED (Postgres)')
    printApplied(new Set(appliedRows.map(r => r.filename)))
  } finally {
    await client.end()
  }
}

function printApplied(appliedSet) {
  console.log(`  applied: ${appliedSet.size} records in _schema_migrations`)
  for (const file of listSqlFiles(MIGRATIONS_DIR)) {
    console.log(`  migration ${appliedSet.has(file) ? '✓' : '✗'} ${file}`)
  }
  for (const file of listSqlFiles(SEED_DIR)) {
    const key = `seed:${file}`
    console.log(`  seed      ${appliedSet.has(key) ? '✓' : '✗'} ${file}`)
  }
  const supabaseUrl = SUPABASE_URL || NUXT_PUBLIC_SUPABASE_URL
  const adminReady = Boolean(
    supabaseUrl
    && (SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY)
    && (ADMIN_EMAIL || process.env.ADMIN_EMAIL)
    && (ADMIN_PASSWORD || process.env.ADMIN_PASSWORD),
  )
  console.log(`  admin bootstrap env: ${adminReady ? 'configured' : 'missing ADMIN_EMAIL/PASSWORD'}`)
}

const isStatus = process.argv.includes('--status')
const strict = process.env.DB_DEPLOY_STRICT === '1'
  || (process.env.CI === 'true' && process.env.VERCEL !== '1')

if (isStatus) {
  printStatus().catch((err) => {
    console.error('[deploy-db] status failed:', err.message ?? err)
    process.exit(1)
  })
} else {
  main().catch((err) => {
    console.error('[deploy-db] Failed:', err.message ?? err)
    if (strict) {
      process.exit(1)
    }
    console.error('[deploy-db] Continuing without migrations (set DB_DEPLOY_STRICT=1 to fail the build)')
    process.exit(0)
  })
}
