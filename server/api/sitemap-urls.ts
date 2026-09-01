import { createClient } from '@supabase/supabase-js'
import { COMPARE_PAIR_SLUGS } from '../../app/data/comparePairs'
import { UA_NAT_LANDING_COUNTRIES } from '../../app/data/natLandingCountries'

// Called by @nuxtjs/sitemap at build time and on-demand
// Returns SitemapUrl[] for all country + city pages across 3 locales
export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)

  const urls: { loc: string; changefreq: string; priority: number; lastmod?: string }[] = []

  // ── 1. Country pages — lastmod = date of latest review per country ──────
  const { data: countries } = await supabase
    .from('reviews')
    .select('target_country, created_at')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  const countryLastmod: Record<string, string> = {}
  for (const r of (countries ?? []) as { target_country: string; created_at: string }[]) {
    if (!countryLastmod[r.target_country]) {
      countryLastmod[r.target_country] = r.created_at.slice(0, 10)
    }
  }

  for (const [code, lastmod] of Object.entries(countryLastmod)) {
    const slug = code.toLowerCase()
    urls.push({ loc: `/country/${slug}`,    changefreq: 'daily', priority: 0.8, lastmod })
    urls.push({ loc: `/en/country/${slug}`, changefreq: 'daily', priority: 0.8, lastmod })
    urls.push({ loc: `/ru/country/${slug}`, changefreq: 'daily', priority: 0.8, lastmod })
  }

  // ── 2. City pages — lastmod = date of latest review per city ────────────
  const { data: cityReviews } = await supabase
    .from('reviews')
    .select('city_id, created_at')
    .eq('is_approved', true)
    .not('city_id', 'is', null)
    .order('created_at', { ascending: false })

  const cityLastmod: Record<number, string> = {}
  for (const r of (cityReviews ?? []) as { city_id: number; created_at: string }[]) {
    if (!cityLastmod[r.city_id]) {
      cityLastmod[r.city_id] = r.created_at.slice(0, 10)
    }
  }

  const uniqueCityIds = Object.keys(cityLastmod).map(Number)

  if (uniqueCityIds.length > 0) {
    const { data: cities } = await supabase
      .from('cities')
      .select('id, slug, country')
      .in('id', uniqueCityIds)
      .not('slug', 'is', null)

    for (const city of (cities ?? []) as { id: number; slug: string; country: string }[]) {
      if (!city.slug) continue
      const countrySlug = city.country.toLowerCase()
      const lastmod = cityLastmod[city.id]
      urls.push({ loc: `/country/${countrySlug}/${city.slug}`,    changefreq: 'weekly', priority: 0.6, lastmod })
      urls.push({ loc: `/en/country/${countrySlug}/${city.slug}`, changefreq: 'weekly', priority: 0.6, lastmod })
      urls.push({ loc: `/ru/country/${countrySlug}/${city.slug}`, changefreq: 'weekly', priority: 0.6, lastmod })
    }
  }

  // ── 3. Compare pair pages (curated list × uk/en/ru) ─────────────────────
  const compareCodes = new Set<string>()
  for (const slug of COMPARE_PAIR_SLUGS) {
    const [a, b] = slug.split('-vs-')
    compareCodes.add(a!.toUpperCase())
    compareCodes.add(b!.toUpperCase())
  }

  const { data: compareReviews } = await supabase
    .from('reviews')
    .select('target_country, created_at')
    .eq('is_approved', true)
    .in('target_country', [...compareCodes])
    .order('created_at', { ascending: false })

  const compareCountryLastmod: Record<string, string> = {}
  for (const r of (compareReviews ?? []) as { target_country: string; created_at: string }[]) {
    if (!compareCountryLastmod[r.target_country]) {
      compareCountryLastmod[r.target_country] = r.created_at.slice(0, 10)
    }
  }

  for (const slug of COMPARE_PAIR_SLUGS) {
    const [a, b] = slug.split('-vs-')
    const lastmodA = compareCountryLastmod[a!.toUpperCase()]
    const lastmodB = compareCountryLastmod[b!.toUpperCase()]
    const lastmod = lastmodA && lastmodB
      ? (lastmodA > lastmodB ? lastmodA : lastmodB)
      : lastmodA ?? lastmodB

    urls.push({ loc: `/compare/${slug}`, changefreq: 'weekly', priority: 0.7, lastmod })
    urls.push({ loc: `/en/compare/${slug}`, changefreq: 'weekly', priority: 0.7, lastmod })
    urls.push({ loc: `/ru/compare/${slug}`, changefreq: 'weekly', priority: 0.7, lastmod })
  }

  // ── 4. UA nationality landings (?nat=UA) — top destinations × 3 locales ─
  for (const code of UA_NAT_LANDING_COUNTRIES) {
    const slug = code.toLowerCase()
    const lastmod = countryLastmod[code]
    const loc = `/country/${slug}?nat=UA`
    urls.push({ loc, changefreq: 'weekly', priority: 0.75, lastmod })
    urls.push({ loc: `/en/country/${slug}?nat=UA`, changefreq: 'weekly', priority: 0.75, lastmod })
    urls.push({ loc: `/ru/country/${slug}?nat=UA`, changefreq: 'weekly', priority: 0.75, lastmod })
  }

  return urls
})
