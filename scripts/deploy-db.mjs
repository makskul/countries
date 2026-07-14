#!/usr/bin/env node
/**
 * Applies Supabase SQL migrations and seeds during deploy/CI.
 *
 * Database connection (one of):
 *   DATABASE_URL — full Postgres URI
 *   SUPABASE_DB_PASSWORD + SUPABASE_URL — builds direct URI automatically
 *   SUPABASE_DB_PASSWORD + SUPABASE_URL + SUPABASE_DB_REGION — pooler URI
 *
 * Optional env (first-time admin bootstrap):
 *   SUPABASE_SERVICE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
 *
 * Skips silently when no DB credentials (local `nuxt build` without DB).
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const MIGRATIONS_DIR = join(ROOT, 'supabase/migrations')
const SEED_DIR = join(ROOT, 'supabase/seed')

const {
  SUPABASE_URL,
  NUXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} = process.env

function extractProjectRef(supabaseUrl) {
  try {
    const ref = new URL(supabaseUrl).hostname.split('.')[0]
    return ref || null
  } catch {
    return null
  }
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

  if (region) {
    const host = process.env.SUPABASE_DB_HOST || `aws-0-${region}.pooler.supabase.com`
    const port = process.env.SUPABASE_DB_PORT || '6543'
    return `postgresql://postgres.${ref}:${encoded}@${host}:${port}/postgres`
  }

  const host = process.env.SUPABASE_DB_HOST || `db.${ref}.supabase.co`
  const port = process.env.SUPABASE_DB_PORT || '5432'
  return `postgresql://postgres:${encoded}@${host}:${port}/postgres`
}

async function main() {
  const databaseUrl = resolveDatabaseUrl()
  if (!databaseUrl) {
    console.log('[deploy-db] No DATABASE_URL / SUPABASE_DB_PASSWORD — skipping migrations (OK for local build)')
    console.log('[deploy-db] Set SUPABASE_DB_PASSWORD in Vercel/GitHub secrets to enable auto-migrations')
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
    console.error('[deploy-db] Tip: on Vercel use pooler — set SUPABASE_DB_REGION (e.g. eu-central-1) or full DATABASE_URL with pooler host')
    throw err
  }

  console.log('[deploy-db] Connected to database')

  try {
    await ensureMigrationTable(client)
    await runMigrations(client)
    await runSeeds(client)
    await bootstrapAdmin()
    console.log('[deploy-db] Done')
  } finally {
    await client.end()
  }
}

async function ensureMigrationTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _schema_migrations (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `)
}

async function runMigrations(client) {
  if (!existsSync(MIGRATIONS_DIR)) {
    console.log('[deploy-db] No migrations directory')
    return
  }

  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()

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

async function runSeeds(client) {
  if (!existsSync(SEED_DIR)) return

  const files = readdirSync(SEED_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()

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
  if (!supabaseUrl || !SUPABASE_SERVICE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('[deploy-db] Admin bootstrap skipped (set ADMIN_EMAIL + ADMIN_PASSWORD to enable)')
    return
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: existing } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', ADMIN_EMAIL)
    .maybeSingle()

  if (existing) {
    console.log(`[deploy-db] Admin already exists: ${ADMIN_EMAIL}`)
    return
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  })

  if (createError) {
    if (createError.message?.includes('already been registered')) {
      const { data: list } = await supabase.auth.admin.listUsers()
      const user = list?.users?.find(u => u.email === ADMIN_EMAIL)
      if (!user) throw createError

      await supabase.from('admin_users').upsert({
        id: user.id,
        email: ADMIN_EMAIL,
        role: 'superadmin',
      }, { onConflict: 'id' })
      console.log(`[deploy-db] Linked existing auth user as admin: ${ADMIN_EMAIL}`)
      return
    }
    throw createError
  }

  if (!created.user) throw new Error('Failed to create admin user')

  const { error: insertError } = await supabase.from('admin_users').insert({
    id: created.user.id,
    email: ADMIN_EMAIL,
    role: 'superadmin',
  })

  if (insertError) throw insertError
  console.log(`[deploy-db] Created superadmin: ${ADMIN_EMAIL}`)
}

async function printStatus() {
  const databaseUrl = resolveDatabaseUrl()
  if (!databaseUrl) {
    console.log('[deploy-db] status: NO_DB_CREDENTIALS')
    console.log('  Add DATABASE_URL or SUPABASE_DB_PASSWORD to .env / Vercel / GitHub secrets')
    process.exit(1)
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    await ensureMigrationTable(client)

    const { rows: applied } = await client.query(
      'SELECT filename, applied_at FROM _schema_migrations ORDER BY applied_at',
    )

    const migrationFiles = existsSync(MIGRATIONS_DIR)
      ? readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort()
      : []

    const seedFiles = existsSync(SEED_DIR)
      ? readdirSync(SEED_DIR).filter(f => f.endsWith('.sql')).sort()
      : []

    const appliedSet = new Set(applied.map(r => r.filename))

    console.log('[deploy-db] status: CONNECTED')
    console.log(`  applied: ${applied.length} records in _schema_migrations`)

    for (const file of migrationFiles) {
      console.log(`  migration ${appliedSet.has(file) ? '✓' : '✗'} ${file}`)
    }
    for (const file of seedFiles) {
      const key = `seed:${file}`
      console.log(`  seed      ${appliedSet.has(key) ? '✓' : '✗'} ${file}`)
    }

    const supabaseUrl = SUPABASE_URL || NUXT_PUBLIC_SUPABASE_URL
    const adminReady = Boolean(supabaseUrl && SUPABASE_SERVICE_KEY && ADMIN_EMAIL && ADMIN_PASSWORD)
    console.log(`  admin bootstrap env: ${adminReady ? 'configured' : 'missing ADMIN_EMAIL/PASSWORD'}`)
  } finally {
    await client.end()
  }
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
    // Preview/Production Vercel builds should still ship the app if DB is unreachable.
    console.error('[deploy-db] Continuing without migrations (set DB_DEPLOY_STRICT=1 to fail the build)')
    process.exit(0)
  })
}
