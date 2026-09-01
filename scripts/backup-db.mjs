#!/usr/bin/env node
/**
 * Nightly Postgres backup: pg_dump public schema → gzip → optional S3/R2 upload.
 *
 * DB connection (same as scripts/deploy-db.mjs):
 *   DATABASE_URL | SUPABASE_DB_PASSWORD + SUPABASE_URL (+ SUPABASE_DB_REGION for pooler)
 *
 * Optional object storage (S3 or Cloudflare R2):
 *   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET
 *   AWS_REGION (default us-east-1), AWS_ENDPOINT_URL (required for R2)
 *   AWS_S3_PREFIX (default triplandr/backups/)
 *
 * Optional:
 *   BACKUP_DIR          — local output dir (default ./backups)
 *   BACKUP_INCLUDE_AUTH — set to 1 to also dump auth schema
 *
 * Loads repo-root `.env` for local runs.
 */

import { readFileSync, mkdirSync, existsSync, createWriteStream, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { createGzip } from 'node:zlib'
import { pipeline } from 'node:stream/promises'
import { createReadStream } from 'node:fs'
import { resolveDatabaseUrl } from './deploy-db.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const ENV_FILE = join(ROOT, '.env')

loadEnvFile(ENV_FILE)

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

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

function runPgDump(databaseUrl, schemas, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '--dbname', databaseUrl,
      '--no-owner',
      '--no-acl',
      '--format=plain',
      ...schemas.flatMap(s => ['--schema', s]),
    ]
    const child = spawn('pg_dump', args, {
      env: { ...process.env, PGSSLMODE: databaseUrl.includes('localhost') ? 'prefer' : 'require' },
    })

    const gzip = createGzip({ level: 9 })
    const out = createWriteStream(outputPath)

    let stderr = ''
    child.stderr.on('data', (chunk) => { stderr += chunk.toString() })
    child.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(new Error('pg_dump not found — install postgresql-client (apt/brew)'))
      } else {
        reject(err)
      }
    })

    pipeline(child.stdout, gzip, out)
      .then(() => new Promise((res, rej) => {
        child.on('close', (code) => {
          if (code === 0) res()
          else rej(new Error(`pg_dump exited ${code}: ${stderr.trim()}`))
        })
      }))
      .then(resolve)
      .catch(reject)
  })
}

async function uploadToS3(filePath, objectKey) {
  const bucket = process.env.AWS_S3_BUCKET
  const accessKey = process.env.AWS_ACCESS_KEY_ID
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY
  if (!bucket || !accessKey || !secretKey) {
    console.log('[backup-db] S3 upload skipped (set AWS_S3_BUCKET + AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY)')
    return false
  }

  let S3Client, PutObjectCommand
  try {
    ;({ S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3'))
  } catch {
    console.warn('[backup-db] @aws-sdk/client-s3 not installed — run npm install for S3 upload')
    return false
  }

  const region = process.env.AWS_REGION || 'auto'
  const endpoint = process.env.AWS_ENDPOINT_URL || undefined

  const client = new S3Client({
    region,
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  })

  const body = createReadStream(filePath)
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    Body: body,
    ContentType: 'application/gzip',
    ContentEncoding: 'gzip',
  }))

  const location = endpoint
    ? `${endpoint}/${bucket}/${objectKey}`
    : `s3://${bucket}/${objectKey}`
  console.log(`[backup-db] Uploaded to ${location}`)
  return true
}

async function main() {
  const databaseUrl = resolveDatabaseUrl()
  if (!databaseUrl) {
    console.error('[backup-db] No DB credentials')
    console.error('  Set DATABASE_URL or SUPABASE_DB_PASSWORD + SUPABASE_URL')
    process.exit(1)
  }

  const backupDir = process.env.BACKUP_DIR || join(ROOT, 'backups')
  mkdirSync(backupDir, { recursive: true })

  const schemas = ['public']
  if (process.env.BACKUP_INCLUDE_AUTH === '1') {
    schemas.push('auth')
  }

  const filename = `triplandr-${timestamp()}.sql.gz`
  const localPath = join(backupDir, filename)

  console.log(`[backup-db] Dumping schemas: ${schemas.join(', ')}`)
  await runPgDump(databaseUrl, schemas, localPath)
  console.log(`[backup-db] Wrote ${localPath}`)

  const prefix = (process.env.AWS_S3_PREFIX || 'triplandr/backups/').replace(/\/+$/, '') + '/'
  const objectKey = `${prefix}${filename}`

  const uploaded = await uploadToS3(localPath, objectKey)
  if (uploaded && process.env.BACKUP_DELETE_LOCAL === '1') {
    unlinkSync(localPath)
    console.log('[backup-db] Removed local file after upload')
  }

  console.log('[backup-db] Done')
}

main().catch((err) => {
  console.error('[backup-db] Failed:', err.message ?? err)
  process.exit(1)
})
