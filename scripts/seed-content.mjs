#!/usr/bin/env node
/**
 * Seeds cities, articles, and demo reviews into Supabase.
 *
 * Requires same credentials as deploy-db.mjs:
 *   SUPABASE_ACCESS_TOKEN  or  SUPABASE_DB_PASSWORD / DATABASE_URL
 *
 * Usage:
 *   npm run content:generate
 *   npm run db:seed-content
 */

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SEED = join(ROOT, 'supabase/seed')
const GEN = join(SEED, 'generated')
const CHUNK = 25

loadEnvFile(join(ROOT, '.env'))

const {
  SUPABASE_URL,
  NUXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ACCESS_TOKEN,
} = process.env

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const raw of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq <= 0) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

function sqlString(value) {
  if (value === null || value === undefined) return 'NULL'
  return `'${String(value).replace(/'/g, "''")}'`
}

function sqlJson(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`
}

function sqlTextArray(arr) {
  if (!arr?.length) return 'ARRAY[]::text[]'
  return `ARRAY[${arr.map(sqlString).join(',')}]::text[]`
}

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function projectRef() {
  try {
    return new URL(SUPABASE_URL || NUXT_PUBLIC_SUPABASE_URL || '').hostname.split('.')[0] || null
  } catch {
    return null
  }
}

function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  const password = process.env.SUPABASE_DB_PASSWORD
  const supabaseUrl = SUPABASE_URL || NUXT_PUBLIC_SUPABASE_URL
  if (!password || !supabaseUrl) return null
  const ref = projectRef()
  if (!ref) return null
  const encoded = encodeURIComponent(password)
  const region = process.env.SUPABASE_DB_REGION
  if (region) {
    return `postgresql://postgres.${ref}:${encoded}@aws-0-${region}.pooler.supabase.com:6543/postgres`
  }
  return `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`
}

function createManagementClient(token, ref) {
  const base = `https://api.supabase.com/v1/projects/${ref}`
  return {
    async runQuery(query) {
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
      try { body = text ? JSON.parse(text) : null } catch { body = text }
      if (!res.ok) throw new Error(`Management API ${res.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`)
      return body
    },
  }
}

function createPgRunner(client) {
  return {
    async runQuery(query) {
      const result = await client.query(query)
      return result.rows
    },
  }
}

function readJson(name) {
  const path = join(GEN, name)
  if (!existsSync(path)) {
    throw new Error(`Missing ${path}. Run: npm run content:generate`)
  }
  return JSON.parse(readFileSync(path, 'utf8'))
}

async function seedCities(api) {
  const cities = JSON.parse(readFileSync(join(SEED, 'cities.json'), 'utf8'))
  console.log(`[seed-content] upserting ${cities.length} cities`)
  for (const group of chunk(cities, CHUNK)) {
    const values = group.map(c => `(
  ${sqlString(c.country)},
  ${sqlString(c.name_en)},
  ${sqlString(c.name_uk)},
  ${sqlString(c.name_ru)},
  ${sqlString(c.slug)},
  ${Number(c.population) || 0}
)`).join(',\n')
    await api.runQuery(`
INSERT INTO cities (country, name_en, name_uk, name_ru, slug, population)
VALUES ${values}
ON CONFLICT (country, slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_uk = EXCLUDED.name_uk,
  name_ru = EXCLUDED.name_ru,
  population = EXCLUDED.population;
`)
  }
}

async function seedCountryArticles(api) {
  const articles = readJson('country-articles.json')
  console.log(`[seed-content] updating ${articles.length} country articles`)
  for (const group of chunk(articles, 10)) {
    const stmts = group.map(a => `
UPDATE countries SET
  article_title_uk = ${sqlString(a.article_title_uk)},
  article_title_en = ${sqlString(a.article_title_en)},
  article_title_ru = ${sqlString(a.article_title_ru)},
  article_excerpt_uk = ${sqlString(a.article_excerpt_uk)},
  article_excerpt_en = ${sqlString(a.article_excerpt_en)},
  article_excerpt_ru = ${sqlString(a.article_excerpt_ru)},
  article_body_uk = ${sqlString(a.article_body_uk)},
  article_body_en = ${sqlString(a.article_body_en)},
  article_body_ru = ${sqlString(a.article_body_ru)},
  updated_at = now()
WHERE code = ${sqlString(a.code)};`).join('\n')
    await api.runQuery(stmts)
  }
}

async function seedCityArticles(api) {
  const articles = readJson('city-articles.json')
  console.log(`[seed-content] updating ${articles.length} city articles`)
  for (const group of chunk(articles, 10)) {
    const stmts = group.map(a => `
UPDATE cities SET
  article_title_uk = ${sqlString(a.article_title_uk)},
  article_title_en = ${sqlString(a.article_title_en)},
  article_title_ru = ${sqlString(a.article_title_ru)},
  article_excerpt_uk = ${sqlString(a.article_excerpt_uk)},
  article_excerpt_en = ${sqlString(a.article_excerpt_en)},
  article_excerpt_ru = ${sqlString(a.article_excerpt_ru)},
  article_body_uk = ${sqlString(a.article_body_uk)},
  article_body_en = ${sqlString(a.article_body_en)},
  article_body_ru = ${sqlString(a.article_body_ru)}
WHERE country = ${sqlString(a.country)} AND slug = ${sqlString(a.slug)};`).join('\n')
    await api.runQuery(stmts)
  }
}

async function seedReviews(api) {
  const reviews = readJson('reviews.json')
  console.log(`[seed-content] clearing previous seed reviews`)
  await api.runQuery(`DELETE FROM reviews WHERE author_profile = 'seed';`)

  const cityRows = await api.runQuery(`SELECT id, country, slug, name_en FROM cities`)
  const cityList = Array.isArray(cityRows) ? cityRows : []
  const byKey = new Map(cityList.map(r => [`${r.country}:${r.slug}`, r]))

  console.log(`[seed-content] inserting ${reviews.length} reviews`)
  for (const group of chunk(reviews, CHUNK)) {
    const values = group.map((r) => {
      const city = byKey.get(`${r.target_country}:${r.city_slug}`)
      const cityId = city?.id ?? null
      const cityName = city?.name_en || r.city_name || null
      return `(
  ${sqlString(r.created_at)}::timestamptz,
  ${sqlString(r.author_nationality)},
  ${sqlString(r.target_country)},
  ${sqlJson(r.ratings)},
  ${sqlJson(r.comments)},
  true,
  ${sqlString(cityName)},
  ${cityId === null ? 'NULL' : Number(cityId)},
  'seed',
  ${sqlString(r.stay_purpose)},
  ${r.still_there ? 'true' : 'false'},
  ${sqlTextArray(r.climate)}
)`
    }).join(',\n')

    await api.runQuery(`
INSERT INTO reviews (
  created_at, author_nationality, target_country, ratings, comments,
  is_approved, city_name, city_id, author_profile, stay_purpose, still_there, climate
) VALUES ${values};
`)
  }
}

async function runAll(api) {
  await seedCities(api)
  await seedCountryArticles(api)
  await seedCityArticles(api)
  await seedReviews(api)
  console.log('[seed-content] Done')
}

async function main() {
  const token = SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_ACCESS_TOKEN

  if (token) {
    const ref = projectRef()
    if (!ref) throw new Error('SUPABASE_URL required with SUPABASE_ACCESS_TOKEN')
    console.log(`[seed-content] Management API project ${ref}`)
    await runAll(createManagementClient(token, ref))
    return
  }

  const databaseUrl = resolveDatabaseUrl()
  if (!databaseUrl) {
    throw new Error('Set SUPABASE_ACCESS_TOKEN or SUPABASE_DB_PASSWORD / DATABASE_URL')
  }
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 12_000,
  })
  await client.connect()
  console.log('[seed-content] Connected via Postgres')
  try {
    await runAll(createPgRunner(client))
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('[seed-content] Failed:', err.message ?? err)
  process.exit(1)
})
