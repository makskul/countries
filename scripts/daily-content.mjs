/**
 * Daily content pipeline for Triplandr Telegram / publication queue.
 *
 * Builds one ContentItem per day from (priority order):
 *   A) Internal Supabase data (reviews, country_stats, hub titles)
 *   B) Curated calendar / compare / empty-state / hub tips
 *   C) Optional safe official RSS (Consilium, UNHCR) — title + link only
 *
 * Usage:
 *   node scripts/daily-content.mjs --dry-run
 *   node scripts/daily-content.mjs --write
 *   node scripts/daily-content.mjs --post
 *   node scripts/daily-content.mjs --write --post --dry-run
 *   node scripts/daily-content.mjs --date=2026-09-03 --days=7 --write
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const ENV_FILE = join(ROOT, '.env')
const OUT_DIR = join(ROOT, 'data/content-queue')
const APP_URL = 'https://triplandr.com'
const APP_NAME = 'Triplandr'

loadEnvFile(ENV_FILE)

const COMPARE_PAIRS = [
  ['PL', 'DE'], ['PL', 'CZ'], ['PL', 'NL'], ['DE', 'NL'], ['DE', 'AT'],
  ['CZ', 'SK'], ['ES', 'PT'], ['GE', 'PL'], ['TR', 'DE'], ['GB', 'IE'],
]

const EMPTY_COUNTRIES = ['IS', 'MT', 'CY', 'LU', 'SI', 'SK', 'EE', 'LV', 'HR', 'BG']

const HUB_COUNTRIES = [
  { code: 'PL', title: 'Українці в Польщі: легалізація, житло та повсякденність' },
  { code: 'DE', title: 'Українці в Німеччині: тимчасовий захист, Anmeldung і робота' },
  { code: 'CZ', title: 'Українці в Чехії: Прага, документи та вартість життя' },
  { code: 'ES', title: 'Українці в Іспанії: стиль життя, оренда та документи' },
  { code: 'PT', title: 'Українці в Португалії: клімат, AIMA та житло в Лісабоні' },
  { code: 'GE', title: 'Українці в Грузії: безвіз, житло та повсякденність' },
  { code: 'TR', title: 'Українці в Туреччині: ikamet, оренда та робота' },
  { code: 'TH', title: 'Українці в Таїланді: візи, оренда та remote-формат' },
]

const TIPS = [
  {
    title: 'Порівняйте країни очима українців',
    body: 'На Triplandr відгуки фільтруються за національністю автора — бачите реальний досвід своїх, не «середній експат».',
    tags: ['product', 'tip'],
    ctaPath: '/uk/compare/pl-vs-de?nat=UA',
    country_codes: ['PL', 'DE'],
  },
  {
    title: '5 хвилин — і ваш досвід допомагає іншим',
    body: 'Анонімний відгук про країну проживання: легалізація, оренда, бюрократія, безпека. Модерація без замовних оцінок.',
    tags: ['reviews', 'cta'],
    ctaPath: '/uk?nat=UA',
    country_codes: ['UA'],
  },
  {
    title: 'Тимчасовий захист у ЄС — перевіряйте офіційні джерела',
    body: 'Дати й умови TPD змінюються. У хабах Triplandr — практичний досвід + посилання на Consilium / національні портали.',
    tags: ['legal', 'eu', 'tpd'],
    ctaPath: '/uk/country/de?nat=UA',
    country_codes: ['DE'],
  },
]

/** Official feeds only — short title + link, no full-text republication. */
const SAFE_RSS_FEEDS = [
  {
    id: 'consilium',
    url: 'https://www.consilium.europa.eu/en/press/press-releases/rss/',
    label: 'Consilium',
  },
  {
    id: 'unhcr',
    url: 'https://www.unhcr.org/rss.xml',
    label: 'UNHCR',
  },
]

const SLOT_TYPES = [
  'compare',
  'empty_country',
  'hub',
  'reviews_digest',
  'tip',
  'rss',
  'compare',
]

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

function parseArgs(argv) {
  const opts = {
    dryRun: false,
    write: false,
    post: false,
    date: null,
    days: 1,
    locale: 'uk',
  }
  for (const arg of argv) {
    if (arg === '--dry-run') opts.dryRun = true
    else if (arg === '--write') opts.write = true
    else if (arg === '--post') opts.post = true
    else if (arg.startsWith('--date=')) opts.date = arg.slice(7)
    else if (arg.startsWith('--days=')) opts.days = Math.max(1, Number(arg.slice(7)) || 1)
    else if (arg.startsWith('--locale=')) opts.locale = arg.slice(9)
  }
  return opts
}

/** Calendar date in Europe/Kyiv as YYYY-MM-DD. */
function kyivDateString(base = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Kyiv',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(base)
}

function addDaysIso(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d))
  utc.setUTCDate(utc.getUTCDate() + days)
  return utc.toISOString().slice(0, 10)
}

function dayIndex(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000)
}

function countryNameUk(code) {
  try {
    return new Intl.DisplayNames(['uk-UA'], { type: 'region' }).of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

function toCompareSlug(a, b) {
  const x = a.toLowerCase()
  const y = b.toLowerCase()
  return x < y ? `${x}-vs-${y}` : `${y}-vs-${x}`
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchInternalSignals() {
  const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_KEY || ''
  if (!url || !key) {
    return { ok: false, reviewCount7d: null, topStats: [], hubRows: [] }
  }

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
  }

  const since = new Date(Date.now() - 7 * 86_400_000).toISOString()

  try {
    const reviewsUrl = new URL(`${url.replace(/\/$/, '')}/rest/v1/reviews`)
    reviewsUrl.searchParams.set('select', 'id')
    reviewsUrl.searchParams.set('is_approved', 'eq.true')
    reviewsUrl.searchParams.set('created_at', `gte.${since}`)
    reviewsUrl.searchParams.set('author_nationality', 'eq.UA')

    const statsUrl = new URL(`${url.replace(/\/$/, '')}/rest/v1/country_stats`)
    statsUrl.searchParams.set('select', 'target_country,total_reviews,avg_overall')
    statsUrl.searchParams.set('author_nationality', 'eq.UA')
    statsUrl.searchParams.set('order', 'total_reviews.desc')
    statsUrl.searchParams.set('limit', '8')

    const hubsUrl = new URL(`${url.replace(/\/$/, '')}/rest/v1/countries`)
    hubsUrl.searchParams.set('select', 'code,article_title_uk')
    hubsUrl.searchParams.set('code', `in.(${HUB_COUNTRIES.map(h => h.code).join(',')})`)

    const [reviewsRes, statsRes, hubsRes] = await Promise.all([
      fetch(reviewsUrl, { headers }),
      fetch(statsUrl, { headers }),
      fetch(hubsUrl, { headers }),
    ])

    const reviews = reviewsRes.ok ? await reviewsRes.json() : []
    const topStats = statsRes.ok ? await statsRes.json() : []
    const hubRows = hubsRes.ok ? await hubsRes.json() : []

    return {
      ok: true,
      reviewCount7d: Array.isArray(reviews) ? reviews.length : null,
      topStats: Array.isArray(topStats) ? topStats : [],
      hubRows: Array.isArray(hubRows) ? hubRows : [],
    }
  } catch (err) {
    console.warn('[content] Supabase fetch failed:', err?.message || err)
    return { ok: false, reviewCount7d: null, topStats: [], hubRows: [] }
  }
}

async function fetchSafeRssItem(feed) {
  try {
    const res = await fetch(feed.url, {
      headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' },
      signal: AbortSignal.timeout(12_000),
    })
    if (!res.ok) return null
    const xml = await res.text()
    const itemMatch = xml.match(/<item[\s\S]*?<\/item>/i) || xml.match(/<entry[\s\S]*?<\/entry>/i)
    if (!itemMatch) return null
    const block = itemMatch[0]
    const title = stripHtml(
      (block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '',
    )
    const link = stripHtml(
      (block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1]
      || (block.match(/<link[^>]+href=["']([^"']+)["']/i) || [])[1]
      || '',
    )
    if (!title || !link) return null
    return { title, link, feedId: feed.id, label: feed.label }
  } catch (err) {
    console.warn(`[content] RSS ${feed.id} failed:`, err?.message || err)
    return null
  }
}

async function pickRssCandidate(isoDate, locale) {
  if (process.env.CONTENT_RSS_ENABLED === '0') return null
  for (const feed of SAFE_RSS_FEEDS) {
    const item = await fetchSafeRssItem(feed)
    if (!item) continue
    return {
      id: `${isoDate}-rss-${feed.id}`,
      date: isoDate,
      type: 'rss',
      locale,
      title: `${item.label}: ${item.title}`.slice(0, 180),
      body: [
        'Коротко з офіційного джерела (не повний текст статті).',
        `Джерело: ${item.label}`,
        'Перевірте деталі за посиланням — політики й дати змінюються.',
      ].join('\n'),
      cta_url: item.link,
      source: feed.url,
      tags: ['rss', 'official', feed.id],
      country_codes: [],
    }
  }
  return null
}

function buildCompareItem(isoDate, locale, idx) {
  const [a, b] = COMPARE_PAIRS[idx % COMPARE_PAIRS.length]
  const slug = toCompareSlug(a, b)
  const nameA = countryNameUk(a)
  const nameB = countryNameUk(b)
  return {
    id: `${isoDate}-compare-${slug}`,
    date: isoDate,
    type: 'compare',
    locale,
    title: `Куди простіше легалізуватися — ${nameA} чи ${nameB}?`,
    body: [
      `Порівняння для українців на ${APP_NAME}: відгуки, рейтинги та практичні нюанси.`,
      `• ${nameA} vs ${nameB}`,
      '• Фільтр національності автора = UA',
      'Напишіть відгук, якщо були в обох країнах.',
    ].join('\n'),
    cta_url: `${APP_URL}/${locale}/compare/${slug}?nat=UA`,
    source: 'triplandr',
    tags: ['compare', 'seo', 'ua'],
    country_codes: [a, b],
  }
}

function buildEmptyCountryItem(isoDate, locale, idx) {
  const code = EMPTY_COUNTRIES[idx % EMPTY_COUNTRIES.length]
  const name = countryNameUk(code)
  return {
    id: `${isoDate}-empty-${code.toLowerCase()}`,
    date: isoDate,
    type: 'empty_country',
    locale,
    title: `Ще немає відгуку українця про ${name}`,
    body: [
      `На ${APP_NAME} бракує першого UA-досвіду про ${name}.`,
      'Станьте першим — 5 хвилин, анонімно. Відгуки модеруються.',
    ].join('\n'),
    cta_url: `${APP_URL}/${locale}/country/${code.toLowerCase()}?nat=UA`,
    source: 'triplandr',
    tags: ['empty_state', 'review_supply', 'ua'],
    country_codes: [code],
  }
}

function buildHubItem(isoDate, locale, idx, signals) {
  const hub = HUB_COUNTRIES[idx % HUB_COUNTRIES.length]
  const fromDb = signals.hubRows.find(r => String(r.code).toUpperCase() === hub.code)
  const title = (fromDb?.article_title_uk || hub.title).trim()
  return {
    id: `${isoDate}-hub-${hub.code.toLowerCase()}`,
    date: isoDate,
    type: 'hub',
    locale,
    title,
    body: [
      `Гайд для українців: легалізація, житло, побут у країні ${countryNameUk(hub.code)}.`,
      'Всередині — практичний досвід і лінки на порівняння країн.',
    ].join('\n'),
    cta_url: `${APP_URL}/${locale}/country/${hub.code.toLowerCase()}?nat=UA`,
    source: 'triplandr',
    tags: ['hub', 'ua', hub.code.toLowerCase()],
    country_codes: [hub.code],
  }
}

function buildReviewsDigestItem(isoDate, locale, signals) {
  const count = signals.reviewCount7d
  const top = (signals.topStats || []).slice(0, 3)
  const lines = top.map((row) => {
    const code = String(row.target_country || '').toUpperCase()
    const n = row.total_reviews ?? 0
    const avg = row.avg_overall != null ? Number(row.avg_overall).toFixed(1) : '—'
    return `• ${countryNameUk(code)}: ${n} відгуків (avg ${avg})`
  })

  const countLine = count == null
    ? 'Нові відгуки українців з’являються щотижня — перевірте свіжі оцінки.'
    : count === 0
      ? 'За останні 7 днів нових UA-відгуків ще не було — ваш може стати першим.'
      : `За 7 днів: ${count} нових схвалених відгуків від українців.`

  return {
    id: `${isoDate}-reviews-digest`,
    date: isoDate,
    type: 'reviews_digest',
    locale,
    title: 'Що пишуть українці про країни цього тижня',
    body: [countLine, ...(lines.length ? ['Топ за кількістю:', ...lines] : []), `Читайте й додавайте свій досвід на ${APP_NAME}.`].join('\n'),
    cta_url: `${APP_URL}/${locale}?nat=UA`,
    source: 'triplandr',
    tags: ['reviews', 'stats', 'ua'],
    country_codes: top.map(r => String(r.target_country).toUpperCase()).filter(Boolean),
  }
}

function buildTipItem(isoDate, locale, idx) {
  const tip = TIPS[idx % TIPS.length]
  return {
    id: `${isoDate}-tip-${idx % TIPS.length}`,
    date: isoDate,
    type: 'tip',
    locale,
    title: tip.title,
    body: tip.body,
    cta_url: tip.ctaPath.startsWith('http') ? tip.ctaPath : `${APP_URL}${tip.ctaPath}`,
    source: 'calendar',
    tags: tip.tags,
    country_codes: tip.country_codes,
  }
}

/** @returns {Promise<object>} ContentItem */
async function buildDailyContentItem(isoDate, locale = 'uk', signals = null) {
  const sig = signals || await fetchInternalSignals()
  const idx = dayIndex(isoDate)
  const slot = SLOT_TYPES[idx % SLOT_TYPES.length]

  if (slot === 'compare') return buildCompareItem(isoDate, locale, idx)
  if (slot === 'empty_country') return buildEmptyCountryItem(isoDate, locale, idx)
  if (slot === 'hub') return buildHubItem(isoDate, locale, idx, sig)
  if (slot === 'reviews_digest') return buildReviewsDigestItem(isoDate, locale, sig)
  if (slot === 'tip') return buildTipItem(isoDate, locale, idx)

  const rss = await pickRssCandidate(isoDate, locale)
  if (rss) return rss
  // Fallback if RSS unavailable — keep channel filled with product content
  return buildCompareItem(isoDate, locale, idx + 3)
}

function formatTelegramHtml(item) {
  const tags = (item.tags || []).map(t => `#${t.replace(/\s+/g, '_')}`).join(' ')
  return [
    `<b>${escapeHtml(item.title)}</b>`,
    '',
    escapeHtml(item.body),
    '',
    `👉 <a href="${escapeHtml(item.cta_url)}">Відкрити на Triplandr</a>`,
    tags ? `\n${escapeHtml(tags)}` : '',
  ].filter(Boolean).join('\n')
}

async function sendTelegramMessage(text, { dryRun = false } = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN || ''
  const chatId = process.env.TELEGRAM_CONTENT_CHAT_ID
    || process.env.TELEGRAM_ADMIN_CHAT_ID
    || ''

  if (!token || !chatId) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN and TELEGRAM_CONTENT_CHAT_ID (or TELEGRAM_ADMIN_CHAT_ID)')
  }

  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: false,
  }

  if (dryRun) {
    console.log('[content] dry-run Telegram payload:')
    console.log(JSON.stringify(payload, null, 2))
    return { ok: true, dryRun: true }
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.ok === false) {
    throw new Error(`Telegram send failed: ${res.status} ${JSON.stringify(data)}`)
  }
  return data
}

function writeQueueFile(item) {
  mkdirSync(OUT_DIR, { recursive: true })
  const dayPath = join(OUT_DIR, `${item.date}.json`)
  const latestPath = join(OUT_DIR, 'latest.json')
  const json = `${JSON.stringify(item, null, 2)}\n`
  writeFileSync(dayPath, json)
  writeFileSync(latestPath, json)
  return dayPath
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const startDate = opts.date || kyivDateString()
  const signals = await fetchInternalSignals()
  console.log(`[content] internal signals: ${signals.ok ? 'ok' : 'skipped (no Supabase env)'}`)

  const items = []
  for (let i = 0; i < opts.days; i++) {
    const iso = addDaysIso(startDate, i)
    const item = await buildDailyContentItem(iso, opts.locale, signals)
    items.push(item)
    if (opts.write) {
      const path = writeQueueFile(item)
      console.log(`[content] wrote ${path}`)
    }
  }

  const today = items[0]
  console.log('[content] candidate:')
  console.log(JSON.stringify(today, null, 2))

  if (opts.post || opts.dryRun) {
    // dry-run alone should still print telegram payload for CI workflow_dispatch
    const shouldPost = opts.post || opts.dryRun
    if (shouldPost) {
      const html = formatTelegramHtml(today)
      await sendTelegramMessage(html, { dryRun: opts.dryRun || !opts.post })
      if (opts.dryRun && !opts.post) {
        console.log('[content] dry-run complete (not sent)')
      } else if (opts.post && !opts.dryRun) {
        console.log('[content] posted to Telegram')
      } else if (opts.post && opts.dryRun) {
        console.log('[content] --post --dry-run: payload printed, not sent')
      }
    }
  }

  // When only --write without post: done
  if (!opts.write && !opts.post && !opts.dryRun) {
    console.log('[content] tip: pass --write and/or --post [--dry-run]')
  }
}

main().catch((err) => {
  console.error('[content] failed:', err)
  process.exit(1)
})
