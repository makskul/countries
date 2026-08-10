import { CATEGORIES } from '~/utils/categories'
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

  // Cookie fallback: on SSR the plugin seeds the store from cookie,
  // but useCookie here ensures the key is correct even if the plugin
  // hasn't run yet (e.g. first cold request with no store state).
  const natCookie = useCookie('nv_nationality')
  const effectiveNationality = computed(() => nationality.value || natCookie.value || '')

  const selectedCityId = ref<number | null>(null)
  // Persisted in store so city page shares the same state
  const showAllOverride = computed({
    get: () => store.showAllReviews,
    set: (v) => store.setShowAllReviews(v),
  })

  // Primary fetch: reviews filtered by nationality (empty or override = all)
  // No server:false — runs on SSR with effectiveNationality already known
  const { data: rows, pending, refresh } = useAsyncData(
    () => `country-${slug.value}-${effectiveNationality.value}-${selectedCityId.value ?? 'all'}-${showAllOverride.value}`,
    async () => {
      if (!slug.value) return [] as RawReview[]
      const selectWithCity = 'id, ratings, comments, created_at, author_nationality, city_id, author_profile, stay_purpose, still_there, climate, cities(id, name_en, name_uk, name_ru, slug)'
      const selectPlain = 'id, ratings, comments, created_at, author_nationality, city_id, author_profile, stay_purpose, still_there, climate'

      async function run(select: string) {
        let query = supabase
          .from('reviews')
          .select(select)
          .eq('target_country', slug.value)
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
        if (effectiveNationality.value && !showAllOverride.value) {
          query = query.eq('author_nationality', effectiveNationality.value)
        }
        if (selectedCityId.value) {
          query = query.eq('city_id', selectedCityId.value)
        }
        return query
      }

      let { data, error } = await run(selectWithCity)
      if (error?.code === 'PGRST200' || error?.message?.includes('relationship')) {
        ;({ data, error } = await run(selectPlain))
      }
      if (error) throw error
      return (data ?? []) as RawReview[]
    },
    { watch: [slug, effectiveNationality, selectedCityId, showAllOverride] }
  )

  // Reset override when nationality changes
  watch(effectiveNationality, () => { showAllOverride.value = false })

  const natReviewsCount = computed(() =>
    showAllOverride.value ? 0 : (rows.value ?? []).length
  )

  // Total reviews for the country regardless of nationality (for empty state check)
  const { data: totalCountData } = useAsyncData(
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
    { watch: [slug] }
  )
  const countryHasAnyReviews = computed(() => (totalCountData.value ?? 0) > 0)

  // Aggregated stats from country_stats (pre-computed by Supabase trigger)
  const { data: statsRow } = useAsyncData(
    () => `country-stats-${slug.value}-${effectiveNationality.value}`,
    async () => {
      if (!slug.value || !effectiveNationality.value) return null
      const { data } = await supabase
        .from('country_stats')
        .select('*')
        .eq('target_country', slug.value)
        .eq('author_nationality', effectiveNationality.value)
        .maybeSingle()
      return data
    },
    { watch: [slug, effectiveNationality] }
  )

  // Cities with reviews (filtered by nationality, or all when override active)
  const { data: citiesWithReviews } = useAsyncData(
    () => `cities-${slug.value}-${effectiveNationality.value}-${showAllOverride.value}`,
    async () => {
      if (!slug.value) return []
      let statsQuery = supabase
        .from('city_stats')
        .select('city_id, city_name, total_reviews, avg_overall, avg_legalization, avg_cost_of_living, avg_safety, avg_bureaucracy, avg_weather, avg_language_barrier, avg_cleanliness, avg_healthcare')
        .eq('target_country', slug.value)
        .order('total_reviews', { ascending: false })
      if (effectiveNationality.value && !showAllOverride.value) {
        statsQuery = statsQuery.eq('author_nationality', effectiveNationality.value)
      }
      const { data: stats, error } = await statsQuery
      if (error) { console.error('[citiesWithReviews]', error.message); return [] }
      if (!stats?.length) return []

      // When showing all nationalities, city_stats has one row per nat — merge by city_id.
      const AVG_KEYS = [
        'avg_legalization', 'avg_cost_of_living', 'avg_safety', 'avg_bureaucracy',
        'avg_weather', 'avg_language_barrier', 'avg_cleanliness', 'avg_healthcare', 'avg_overall',
      ] as const
      const merged: any[] = []
      if (effectiveNationality.value && !showAllOverride.value) {
        merged.push(...stats)
      } else {
        const byCity: Record<number, any[]> = {}
        for (const r of stats as any[]) {
          if (!r.city_id) continue
          if (!byCity[r.city_id]) byCity[r.city_id] = []
          byCity[r.city_id].push(r)
        }
        for (const rows of Object.values(byCity)) {
          const total = rows.reduce((s, r) => s + (Number(r.total_reviews) || 0), 0)
          const base = { ...rows[0], total_reviews: total }
          for (const key of AVG_KEYS) {
            let sum = 0
            let weight = 0
            for (const r of rows) {
              const v = r[key]
              const w = Number(r.total_reviews) || 0
              if (v !== null && v !== undefined && w > 0) {
                sum += Number(v) * w
                weight += w
              }
            }
            base[key] = weight ? Math.round((sum / weight) * 100) / 100 : null
          }
          merged.push(base)
        }
        merged.sort((a, b) => (b.total_reviews ?? 0) - (a.total_reviews ?? 0))
      }

      const cityIds = merged.map((r: any) => r.city_id).filter(Boolean)
      const { data: cities } = await supabase
        .from('cities')
        .select('id, slug, name_en, name_uk, name_ru')
        .in('id', cityIds)
      const cityMap: Record<number, any> = {}
      for (const c of (cities ?? []) as any[]) {
        if (c.slug) cityMap[c.id] = c
      }

      return merged
        .filter((r: any) => cityMap[r.city_id])
        .map((r: any) => ({ ...r, slug: cityMap[r.city_id].slug, name_en: cityMap[r.city_id].name_en, name_uk: cityMap[r.city_id].name_uk, name_ru: cityMap[r.city_id].name_ru })) as any[]
    },
    { watch: [slug, effectiveNationality, showAllOverride] }
  )

  // City stats (when a city tab is selected)
  const { data: cityStats } = useAsyncData(
    () => `cityStats-${slug.value}-${effectiveNationality.value}-${selectedCityId.value}`,
    async () => {
      if (!selectedCityId.value || !slug.value || !effectiveNationality.value) return null
      const { data } = await supabase
        .from('city_stats')
        .select('*')
        .eq('city_id', selectedCityId.value)
        .eq('target_country', slug.value)
        .eq('author_nationality', effectiveNationality.value)
        .maybeSingle()
      return data
    },
    { watch: [selectedCityId, slug, effectiveNationality] }
  )

  // Category stats — uses cityStats when in city view, otherwise statsRow.
  // Skip precomputed stats when showing all nationalities (stats are per-nat).
  const catStats = computed(() => {
    const source = !showAllOverride.value
      ? (selectedCityId.value ? cityStats.value : statsRow.value)
      : null
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

  // Overall avg — average of category averages (excluding the 'overall' field itself).
  // Prefer city_stats when a city tab is selected; skip precomputed stats when
  // showing all nationalities (those rows are per author_nationality).
  const overallAvg = computed(() => {
    const source = !showAllOverride.value
      ? (selectedCityId.value ? cityStats.value : statsRow.value)
      : null
    if (source) {
      const s = source as any
      const catVals = [
        s.avg_legalization, s.avg_cost_of_living, s.avg_safety,
        s.avg_bureaucracy, s.avg_weather, s.avg_language_barrier,
        s.avg_cleanliness, s.avg_healthcare,
      ].filter(v => v !== null && v !== undefined).map(Number)
      if (catVals.length) {
        return Math.round((catVals.reduce((a, b) => a + b, 0) / catVals.length) * 10) / 10
      }
    }
    // Fallback: micro-average of category ratings from raw rows (excl. 'overall')
    const r = rows.value
    if (!r?.length) return null
    const vals = r.flatMap(row =>
      Object.entries(row.ratings ?? {})
        .filter(([key]) => key !== 'overall')
        .map(([, v]) => v)
        .filter((v): v is number => typeof v === 'number')
    )
    if (!vals.length) return null
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
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

  // Similar countries from same region
  const { data: similarCountries } = useLazyAsyncData(
    () => `similar-${slug.value}-${effectiveNationality.value}`,
    async () => {
      if (!effectiveNationality.value || !slug.value) return []
      const myRegion = getRegion(slug.value)
      const { data, error } = await supabase
        .from('reviews')
        .select('target_country, ratings')
        .neq('target_country', slug.value)
        .eq('author_nationality', effectiveNationality.value)
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
    { server: false, watch: [slug, effectiveNationality] }
  )

  // Pagination (client-side slicing)
  const offset = ref(0)
  const PAGE_SIZE = 10
  const pagedReviews = computed(() => (rows.value ?? []).slice(0, offset.value + PAGE_SIZE))
  const hasMore = computed(() => (rows.value?.length ?? 0) > offset.value + PAGE_SIZE)
  function loadMore() { offset.value += PAGE_SIZE }
  watch([slug, effectiveNationality], () => { offset.value = 0 })

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
