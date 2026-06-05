import { CATEGORIES, CATEGORY_LABELS } from '~/utils/categories'
import { getRegion } from '~/utils/regions'

export interface RawReview {
  id: string
  created_at: string
  author_nationality: string
  ratings: Record<string, number>
  comments: Record<string, string>
  city_id?: number | null
  author_profile?: string | null
  stay_purpose?: string | null
  still_there?: boolean | null
  climate?: string[] | null
  cities?: { id: number; name_en: string; name_uk?: string | null; name_ru?: string | null; slug?: string } | null
}

export function useCountryPage(slug: Ref<string>, nationality: Ref<string>) {
  const supabase = useSupabaseClient()
  const store = useUserStore()

  const selectedCityId = ref<number | null>(null)
  // Persisted in store so city page shares the same state
  const showAllOverride = computed({
    get: () => store.showAllReviews,
    set: (v) => store.setShowAllReviews(v),
  })

  // Primary fetch: reviews filtered by nationality (empty or override = all nationalities)
  const { data: rows, pending, refresh } = useLazyAsyncData(
    () => `country-${slug.value}-${nationality.value}-${selectedCityId.value ?? 'all'}-${showAllOverride.value}`,
    async () => {
      if (!slug.value) return [] as RawReview[]
      let query = supabase
        .from('reviews')
        .select('id, ratings, comments, created_at, author_nationality, city_id, author_profile, stay_purpose, still_there, climate, cities(id, name_en, name_uk, name_ru, slug)')
        .eq('target_country', slug.value)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
      // Filter by nationality unless override is active
      if (nationality.value && !showAllOverride.value) {
        query = query.eq('author_nationality', nationality.value)
      }
      if (selectedCityId.value) {
        query = query.eq('city_id', selectedCityId.value)
      }
      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as RawReview[]
    },
    { server: false, watch: [slug, nationality, selectedCityId, showAllOverride] }
  )

  // Reset override when nationality changes
  watch(nationality, () => { showAllOverride.value = false })

  const natReviewsCount = computed(() =>
    showAllOverride.value ? 0 : (rows.value ?? []).length
  )

  // Total reviews for the country regardless of nationality (for empty state check)
  const { data: totalCountData } = useLazyAsyncData(
    () => `country-total-${slug.value}`,
    async () => {
      if (!slug.value) return 0
      const { count } = await supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('target_country', slug.value)
        .eq('is_approved', true)
      return count ?? 0
    },
    { server: false, watch: [slug] }
  )
  const countryHasAnyReviews = computed(() => (totalCountData.value ?? 0) > 0)

  // Fetch aggregated stats from country_stats table
  const { data: statsRow } = useLazyAsyncData(
    () => `country-stats-${slug.value}-${nationality.value}`,
    async () => {
      if (!slug.value || !nationality.value) return null
      const { data } = await supabase
        .from('country_stats')
        .select('*')
        .eq('target_country', slug.value)
        .eq('author_nationality', nationality.value)
        .maybeSingle()
      return data
    },
    { server: false, watch: [slug, nationality] }
  )

  // Cities with reviews (filtered by nationality, or all when override active)
  const { data: citiesWithReviews } = useLazyAsyncData(
    () => `cities-${slug.value}-${nationality.value}-${showAllOverride.value}`,
    async () => {
      if (!slug.value) return []
      // Step 1: get city stats — filter by nationality unless override
      let statsQuery = supabase
        .from('city_stats')
        .select('city_id, city_name, total_reviews, avg_overall')
        .eq('target_country', slug.value)
        .order('total_reviews', { ascending: false })
      if (nationality.value && !showAllOverride.value) {
        statsQuery = statsQuery.eq('author_nationality', nationality.value)
      }
      const { data: stats, error } = await statsQuery
      if (error) { console.error('[citiesWithReviews]', error.message); return [] }
      if (!stats?.length) return []

      // Step 2: fetch slug + localized names from cities table
      const cityIds = stats.map((r: any) => r.city_id).filter(Boolean)
      const { data: cities } = await supabase
        .from('cities')
        .select('id, slug, name_en, name_uk, name_ru')
        .in('id', cityIds)
      const cityMap: Record<number, any> = {}
      for (const c of (cities ?? []) as any[]) {
        if (c.slug) cityMap[c.id] = c
      }

      // Step 3: merge — only include cities that have a slug
      return stats
        .filter((r: any) => cityMap[r.city_id])
        .map((r: any) => ({ ...r, slug: cityMap[r.city_id].slug, name_en: cityMap[r.city_id].name_en, name_uk: cityMap[r.city_id].name_uk, name_ru: cityMap[r.city_id].name_ru })) as any[]
    },
    { server: false, watch: [slug, nationality, showAllOverride] }
  )

  // City stats (when a city tab is selected)
  const { data: cityStats } = useLazyAsyncData(
    () => `cityStats-${slug.value}-${nationality.value}-${selectedCityId.value}`,
    async () => {
      if (!selectedCityId.value || !slug.value || !nationality.value) return null
      const { data } = await supabase
        .from('city_stats')
        .select('*')
        .eq('city_id', selectedCityId.value)
        .eq('target_country', slug.value)
        .eq('author_nationality', nationality.value)
        .maybeSingle()
      return data
    },
    { server: false, watch: [selectedCityId, slug, nationality] }
  )

  // Category stats — uses cityStats when in city view, otherwise statsRow
  const catStats = computed(() => {
    const source = selectedCityId.value ? cityStats.value : statsRow.value
    if (source) {
      const s = source as any
      const cats = [
        { category: 'legalization',     avg: s.avg_legalization     },
        { category: 'cost_of_living',   avg: s.avg_cost_of_living   },
        { category: 'safety',           avg: s.avg_safety           },
        { category: 'bureaucracy',      avg: s.avg_bureaucracy      },
        { category: 'weather',          avg: s.avg_weather          },
        { category: 'language_barrier', avg: s.avg_language_barrier },
        { category: 'cleanliness',      avg: s.avg_cleanliness      },
        { category: 'healthcare',       avg: s.avg_healthcare       },
        { category: 'overall',          avg: s.avg_overall          },
      ]
      return cats
        .filter(c => c.avg !== null && c.avg !== undefined)
        .map(c => {
          const avg = Math.round(Number(c.avg) * 10) / 10
          return {
            category: c.category,
            label: c.category,
            avg,
            count: (source as any).total_reviews ?? 0,
            barWidth: Math.round((avg / 5) * 100),
            color: avg >= 4 ? 'success' : avg >= 3 ? 'warning' : 'danger',
          }
        })
        .sort((a, b) => b.avg - a.avg)
    }
    // Fallback: compute from raw rows
    return CATEGORIES.map(cat => {
      const withRating = (rows.value ?? []).filter(r => r.ratings?.[cat] != null)
      const avg = withRating.length
        ? withRating.reduce((sum, r) => sum + r.ratings[cat], 0) / withRating.length
        : null
      return {
        category: cat,
        label: cat,
        avg: avg !== null ? Math.round(avg * 10) / 10 : null,
        count: withRating.length,
        barWidth: avg !== null ? Math.round((avg / 5) * 100) : 0,
        color: avg === null ? 'neutral' : avg >= 4 ? 'success' : avg >= 3 ? 'warning' : 'danger',
      }
    })
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count)
  })

  // Overall avg from country_stats or computed from rows
  const overallAvg = computed(() => {
    if ((statsRow.value as any)?.avg_overall) return Math.round(Number((statsRow.value as any).avg_overall) * 10) / 10
    const r = rows.value
    if (!r?.length) return null
    const allVals: number[] = []
    for (const row of r) {
      for (const val of Object.values(row.ratings ?? {})) {
        if (typeof val === 'number') allVals.push(val)
      }
    }
    if (!allVals.length) return null
    return Math.round((allVals.reduce((a, b) => a + b, 0) / allVals.length) * 10) / 10
  })

  // Header stats
  const headerStats = computed(() => {
    const r = rows.value
    if (!r) return null
    return {
      total: r.length,
      overallAvg: overallAvg.value,
      lastReviewAt: r[0]?.created_at ?? null,
    }
  })

  // Similar countries from same region (fetch separately)
  const { data: similarCountries } = useLazyAsyncData(
    () => `similar-${slug.value}-${nationality.value}`,
    async () => {
      if (!nationality.value || !slug.value) return []
      const myRegion = getRegion(slug.value)
      const { data, error } = await supabase
        .from('reviews')
        .select('target_country, ratings')
        .neq('target_country', slug.value)
        .eq('author_nationality', nationality.value)
        .eq('is_approved', true)
      if (error) return []
      if (!data?.length) return []

      const grouped: Record<string, number[]> = {}
      for (const row of data as { target_country: string; ratings: Record<string, number> }[]) {
        if (getRegion(row.target_country) !== myRegion) continue
        if (!grouped[row.target_country]) grouped[row.target_country] = []
        for (const val of Object.values(row.ratings ?? {})) {
          if (typeof val === 'number') grouped[row.target_country].push(val)
        }
      }
      return Object.entries(grouped)
        .map(([code, vals]) => ({
          code,
          avgRating: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
        }))
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 3)
    },
    { server: false, watch: [slug, nationality] }
  )

  // Pagination (client-side slicing)
  const offset = ref(0)
  const PAGE_SIZE = 10
  const pagedReviews = computed(() => (rows.value ?? []).slice(0, offset.value + PAGE_SIZE))
  const hasMore = computed(() => (rows.value?.length ?? 0) > offset.value + PAGE_SIZE)
  function loadMore() { offset.value += PAGE_SIZE }
  watch([slug, nationality], () => { offset.value = 0 })

  // Helpful counter (optimistic — no RPC needed)
  function markHelpful(_reviewId: string) {
    // no-op until RPC is added to Supabase
  }

  return {
    rows,
    catStats,
    overallAvg,
    headerStats,
    pending,
    refresh,
    pagedReviews,
    hasMore,
    loadMore,
    similarCountries,
    markHelpful,
    selectedCityId,
    citiesWithReviews,
    natReviewsCount,
    showAllOverride,
    countryHasAnyReviews,
  }
}
