import { isDestinationAllowed } from '~/utils/countries'

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
    const destinationReviews = data.filter((r: any) => isDestinationAllowed(r.target_country))
    return {
      total: destinationReviews.length,
      countries: new Set(destinationReviews.map((r: any) => r.target_country)).size,
      nationalities: new Set(data.map((r: any) => r.author_nationality)).size,
    }
  })

  // Trending: recently active countries with real review counts + averages
  const { data: trending, pending: trendingPending } = useAsyncData('trending', async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('target_country, ratings, created_at')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) { console.error('[trending]', error.message); return [] }
    if (!data?.length) return []

    type Acc = { code: string; totals: number[]; lastAt: number; topCategories: string[] }
    const byCode = new Map<string, Acc>()

    for (const row of data as { target_country: string; ratings: Record<string, number>; created_at: string }[]) {
      const code = row.target_country
      if (!isDestinationAllowed(code)) continue
      const vals = Object.values(row.ratings ?? {}).filter((v): v is number => typeof v === 'number')
      const rowAvg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
      const existing = byCode.get(code)
      if (!existing) {
        byCode.set(code, {
          code,
          totals: [rowAvg],
          lastAt: new Date(row.created_at).getTime(),
          topCategories: Object.keys(row.ratings ?? {}).slice(0, 2),
        })
      } else {
        existing.totals.push(rowAvg)
      }
    }

    return [...byCode.values()]
      .map(acc => ({
        code: acc.code,
        total: acc.totals.length,
        avgRating: Math.round((acc.totals.reduce((a, b) => a + b, 0) / acc.totals.length) * 10) / 10,
        topCategories: acc.topCategories,
        lastAt: acc.lastAt,
      }))
      .sort((a, b) => b.lastAt - a.lastAt || b.total - a.total)
      .slice(0, 8)
      .map(({ lastAt: _lastAt, ...rest }) => rest)
  })

  // Latest reviews (fetch a few extra so deactivated destinations can be skipped)
  const { data: latest, pending: latestPending } = useAsyncData('latest', async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, target_country, author_nationality, ratings, comments, created_at')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) { console.error('[latest]', error.message); return [] }
    return ((data ?? []) as any[]).filter(r => isDestinationAllowed(r.target_country)).slice(0, 4)
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
      if (!isDestinationAllowed(row.target_country)) continue
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

  // All countries with reviews — for interactive world map (incl. nationality breakdown)
  const { data: mapCountries, pending: mapCountriesPending } = useAsyncData('mapCountriesByNat', async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('target_country, author_nationality, ratings')
      .eq('is_approved', true)
    if (error) { console.error('[mapCountries]', error.message); return [] }

    type Bucket = { all: number[]; byNat: Record<string, number[]> }
    const grouped: Record<string, Bucket> = {}
    for (const row of data as {
      target_country: string
      author_nationality: string
      ratings: Record<string, number>
    }[]) {
      const code = row.target_country
      if (!isDestinationAllowed(code)) continue
      if (!grouped[code]) grouped[code] = { all: [], byNat: {} }
      const vals = Object.values(row.ratings ?? {}).filter(v => typeof v === 'number')
      const rowAvg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
      grouped[code].all.push(rowAvg)
      const nat = (row.author_nationality || '').toUpperCase()
      if (nat) {
        if (!grouped[code].byNat[nat]) grouped[code].byNat[nat] = []
        grouped[code].byNat[nat].push(rowAvg)
      }
    }

    const avg = (avgs: number[]) =>
      Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10

    return Object.entries(grouped).map(([code, bucket]) => ({
      code,
      total: bucket.all.length,
      avgRating: avg(bucket.all),
      byNationality: Object.fromEntries(
        Object.entries(bucket.byNat).map(([nat, avgs]) => [
          nat,
          { total: avgs.length, avgRating: avg(avgs) },
        ]),
      ) as Record<string, { total: number; avgRating: number }>,
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
