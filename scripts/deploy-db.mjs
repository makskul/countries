#!/usr/bin/env node
/**
 * Applies Supabase SQL migrations and seeds during deploy/CI.
 *
 * Required env:
 *   DATABASE_URL — Postgres connection string (Supabase → Settings → Database)
 *
 * Optional env (first-time admin bootstrap):
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
 *
 * Skips silently when DATABASE_URL is unset (local `nuxt build` without DB).
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const MIGRATIONS_DIR = join(ROOT, 'supabase/migrations')
const SEED_DIR = join(ROOT, 'supabase/seed')

const { DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env

async function main() {
  if (!DATABASE_URL) {
    console.log('[deploy-db] DATABASE_URL not set — skipping migrations (OK for local build)')
    return
  }

  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  })

  await client.connect()
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
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('[deploy-db] Admin bootstrap skipped (set ADMIN_EMAIL + ADMIN_PASSWORD to enable)')
    return
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
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

main().catch((err) => {
  console.error('[deploy-db] Failed:', err.message ?? err)
  process.exit(1)
})
