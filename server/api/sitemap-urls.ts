import { createClient } from '@supabase/supabase-js'

// Called by @nuxtjs/sitemap at build time and on-demand
// Returns SitemapUrl[] for all country + city pages across 3 locales
export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)

  const urls: { loc: string; changefreq: string; priority: number; lastmod?: string }[] = []

  // ── 1. Country pages ────────────────────────────────────────────────────
  const { data: countries } = await supabase
    .from('reviews')
    .select('target_country')
    .eq('is_approved', true)

  const uniqueCountries = [...new Set((countries ?? []).map((r: any) => r.target_country as string))]

  for (const code of uniqueCountries) {
    const slug = code.toLowerCase()
    // uk (default, no prefix)
    urls.push({ loc: `/country/${slug}`,     changefreq: 'daily', priority: 0.8 })
    // en
    urls.push({ loc: `/en/country/${slug}`,  changefreq: 'daily', priority: 0.8 })
    // ru
    urls.push({ loc: `/ru/country/${slug}`,  changefreq: 'daily', priority: 0.8 })
  }

  // ── 2. City pages ────────────────────────────────────────────────────────
  const { data: cities } = await supabase
    .from('cities')
    .select('slug, country')
    .not('slug', 'is', null)

  for (const city of (cities ?? []) as { slug: string; country: string }[]) {
    if (!city.slug) continue
    const countrySlug = city.country.toLowerCase()
    urls.push({ loc: `/country/${countrySlug}/${city.slug}`,     changefreq: 'weekly', priority: 0.6 })
    urls.push({ loc: `/en/country/${countrySlug}/${city.slug}`,  changefreq: 'weekly', priority: 0.6 })
    urls.push({ loc: `/ru/country/${countrySlug}/${city.slug}`,  changefreq: 'weekly', priority: 0.6 })
  }

  return urls
})
