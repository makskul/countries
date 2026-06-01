import { getCountryName } from '~/utils/countries'
import { getRegion } from '~/utils/regions'
import { CATEGORIES } from '~/utils/categories'

export interface CountryStat {
  code: string
  name: string
  region: string
  totalReviews: number
  avgRating: number
  nationalitiesCount: number
  categoryStats: { category: string; avg: number; count: number }[]
  hasNatReviews: boolean
}

export function useCountriesList() {
  const supabase = useSupabaseClient()
  const store = useUserStore()

  const { data: rows, pending } = useLazyAsyncData('countries-list', async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('target_country, ratings, author_nationality, created_at')
      .eq('is_approved', true)
    if (error) {
      console.error('[countries-list] Supabase error:', error.message, error.details)
      return [] as { target_country: string; ratings: Record<string, number>; author_nationality: string; created_at: string }[]
    }
    if (!data?.length) {
      console.warn('[countries-list] Query returned 0 rows — check is_approved values in DB')
    }
    return (data ?? []) as {
      target_country: string
      ratings: Record<string, number>
      author_nationality: string
      created_at: string
    }[]
  }, { server: false, dedupe: 'defer' })

  // aggregate per-country stats
  const countriesMap = computed(() => {
    const map: Record<string, {
      totalReviews: number
      ratingSum: number
      ratingCount: number
      nationalities: Set<string>
      catRatings: Record<string, number[]>
    }> = {}

    for (const row of rows.value ?? []) {
      const code = row.target_country
      if (!map[code]) {
        map[code] = { totalReviews: 0, ratingSum: 0, ratingCount: 0, nationalities: new Set(), catRatings: {} }
      }
      const entry = map[code]
      entry.totalReviews++
      entry.nationalities.add(row.author_nationality)

      const ratings = row.ratings as Record<string, number>
      for (const [cat, val] of Object.entries(ratings)) {
        if (typeof val === 'number') {
          entry.ratingSum += val
          entry.ratingCount++
          if (!entry.catRatings[cat]) entry.catRatings[cat] = []
          entry.catRatings[cat].push(val)
        }
      }
    }

    return map
  })

  const countries = computed<CountryStat[]>(() => {
    const nat = store.nationality
    const natSet = new Set(
      (rows.value ?? [])
        .filter(r => r.author_nationality === nat)
        .map(r => r.target_country)
    )

    return Object.entries(countriesMap.value)
      .map(([code, entry]) => {
        const avgRating = entry.ratingCount > 0
          ? Math.round((entry.ratingSum / entry.ratingCount) * 10) / 10
          : 0

        const categoryStats = Object.entries(entry.catRatings)
          .map(([cat, vals]) => ({
            category: cat,
            avg: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
            count: vals.length,
          }))
          .sort((a, b) => b.count - a.count)

        return {
          code,
          name: getCountryName(code),
          region: getRegion(code),
          totalReviews: entry.totalReviews,
          avgRating,
          nationalitiesCount: entry.nationalities.size,
          categoryStats,
          hasNatReviews: natSet.has(code),
        }
      })
      .sort((a, b) => b.totalReviews - a.totalReviews)
  })

  return { countries, pending }
}
