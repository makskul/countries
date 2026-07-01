import { CATEGORIES, CATEGORY_LABELS } from '~/utils/categories'

export function useHomepageData() {
  const supabase = useSupabaseClient()

  // Hero stats
  const { data: stats, pending: statsPending } = useAsyncData('heroStats', async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('target_country, author_nationality')
      .eq('is_approved', true)
    if (error) { console.error('[heroStats]', error.message); return { total: 0, countries: 0, nationalities: 0 } }
    if (!data?.length) return { total: 0, countries: 0, nationalities: 0 }
    return {
      total: data.length,
      countries: new Set(data.map((r: any) => r.target_country)).size,
      nationalities: new Set(data.map((r: any) => r.author_nationality)).size,
    }
  })

  // Trending: last 30 days, fallback to all-time top 100 if empty
  const { data: trending, pending: trendingPending } = useAsyncData('trending', async () => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    let { data, error } = await supabase
      .from('reviews')
      .select('target_country, ratings')
      .eq('is_approved', true)
      .gte('created_at', since)
    if (error) { console.error('[trending]', error.message); return [] }

    // Fallback: if nothing in last 30 days, load all-time top
    if (!data?.length) {
      const fb = await supabase
        .from('reviews')
        .select('target_country, ratings')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(200)
      if (fb.error) { console.error('[trending fallback]', fb.error.message); return [] }
      data = fb.data
    }
    if (!data?.length) return []

    const grouped: Record<string, { reviewCount: number; ratingVals: number[]; cats: string[] }> = {}
    for (const row of data as { target_country: string; ratings: Record<string, number> }[]) {
      const code = row.target_country
      if (!grouped[code]) grouped[code] = { reviewCount: 0, ratingVals: [], cats: [] }
      grouped[code].reviewCount++ // count reviews (rows), not individual category values
      for (const [cat, val] of Object.entries(row.ratings ?? {})) {
        if (typeof val === 'number') {
          grouped[code].ratingVals.push(val)
          if (!grouped[code].cats.includes(cat)) grouped[code].cats.push(cat)
        }
      }
    }

    return Object.entries(grouped)
      .map(([code, { reviewCount, ratingVals, cats }]) => ({
        code,
        total: reviewCount, // correct: number of reviews (not category values)
        avgRating: Math.round((ratingVals.reduce((a, b) => a + b, 0) / ratingVals.length) * 10) / 10,
        topCategories: cats.slice(0, 2),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)
  })

  // Latest 3 reviews (show first category with a comment)
  const { data: latest, pending: latestPending } = useAsyncData('latest', async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, target_country, author_nationality, ratings, comments, created_at')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(4)
    if (error) { console.error('[latest]', error.message); return [] }
    return (data ?? []) as any[]
  })

  // Category highlights (4 selected categories — keys match JSONB in DB)
  const HIGHLIGHT_CATS = ['legalization', 'cost_of_living', 'safety', 'weather']
  const { data: catStats, pending: catPending } = useLazyAsyncData('catStats', async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('ratings, target_country')
      .eq('is_approved', true)
    if (error) { console.error('[catStats]', error.message); return [] }
    if (!data?.length) return []

    const grouped: Record<string, { vals: number[]; countries: Record<string, number[]> }> = {}
    for (const row of data as { ratings: Record<string, number>; target_country: string }[]) {
      for (const cat of HIGHLIGHT_CATS) {
        const val = row.ratings?.[cat]
        if (typeof val !== 'number') continue
        if (!grouped[cat]) grouped[cat] = { vals: [], countries: {} }
        grouped[cat].vals.push(val)
        if (!grouped[cat].countries[row.target_country]) grouped[cat].countries[row.target_country] = []
        grouped[cat].countries[row.target_country].push(val)
      }
    }

    return HIGHLIGHT_CATS.map(cat => {
      const g = grouped[cat]
      if (!g) return { category: cat, total: 0, avgRating: 0, topCountry: '' }
      const avgRating = Math.round((g.vals.reduce((a, b) => a + b, 0) / g.vals.length) * 10) / 10
      const topCountry = Object.entries(g.countries)
        .map(([code, vals]) => ({ code, avg: vals.reduce((a, b) => a + b, 0) / vals.length }))
        .sort((a, b) => b.avg - a.avg)[0]?.code ?? ''
      return { category: cat, total: g.vals.length, avgRating, topCountry }
    })
  })

  // All countries with reviews — for interactive world map
  const { data: mapCountries, pending: mapCountriesPending } = useAsyncData('mapCountries', async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('target_country, ratings')
      .eq('is_approved', true)
    if (error) { console.error('[mapCountries]', error.message); return [] }

    const grouped: Record<string, number[]> = {}
    for (const row of data as { target_country: string; ratings: Record<string, number> }[]) {
      const code = row.target_country
      if (!grouped[code]) grouped[code] = []
      const vals = Object.values(row.ratings ?? {}).filter(v => typeof v === 'number')
      const rowAvg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
      grouped[code].push(rowAvg)
    }

    return Object.entries(grouped).map(([code, avgs]) => ({
      code,
      total: avgs.length,
      avgRating: Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10,
    }))
  })

  return {
    stats, statsPending,
    trending, trendingPending,
    latest, latestPending,
    catStats, catPending,
    mapCountries, mapCountriesPending,
  }
}
