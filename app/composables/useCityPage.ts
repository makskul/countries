import { CATEGORIES } from '~/utils/categories'

export function useCityPage(
  slug: Ref<string>,
  citySlug: Ref<string>,
  nationality: Ref<string>
) {
  const supabase = useSupabaseClient()
  const store = useUserStore()

  // Cookie fallback so SSR always knows nationality
  const natCookie = useCookie('nv_nationality')
  const effectiveNationality = computed(() => nationality.value || natCookie.value || '')

  // Shared with country page via Pinia store
  const showAllOverride = computed({
    get: () => store.showAllReviews,
    set: (v) => store.setShowAllReviews(v),
  })

  // Single merged fetch — city lookup + reviews + stats in one go.
  // No cascade dependency: city id is resolved inside the same async function.
  const { data, pending } = useAsyncData(
    () => `city-page-${slug.value}-${citySlug.value}-${effectiveNationality.value}-${showAllOverride.value}`,
    async () => {
      // Step 1: resolve city id from slug
      const { data: city } = await supabase
        .from('cities')
        .select('id, name_en, name_uk, name_ru, country, slug, article_published, article_title_uk, article_title_en, article_title_ru, article_excerpt_uk, article_excerpt_en, article_excerpt_ru, article_body_uk, article_body_en, article_body_ru')
        .eq('country', slug.value)
        .eq('slug', citySlug.value)
        .maybeSingle()

      if (!city) return { city: null, rows: [], statsRow: null }

      // Step 2: fetch reviews and city_stats in parallel
      const [reviewsResult, statsResult] = await Promise.all([
        // Reviews — filtered by nationality unless showAllOverride
        (async () => {
          const selectWithCity = 'id, ratings, comments, created_at, author_nationality, city_id, author_profile, stay_purpose, still_there, climate, cities(id, name_en, name_uk, name_ru, slug)'
          const selectPlain = 'id, ratings, comments, created_at, author_nationality, city_id, author_profile, stay_purpose, still_there, climate'
          async function run(select: string) {
            let q = supabase
              .from('reviews')
              .select(select)
              .eq('target_country', slug.value)
              .eq('city_id', city.id)
              .eq('is_approved', true)
              .order('created_at', { ascending: false })
            if (effectiveNationality.value && !showAllOverride.value) {
              q = q.eq('author_nationality', effectiveNationality.value)
            }
            return q
          }
          let { data, error } = await run(selectWithCity)
          if (error?.code === 'PGRST200' || error?.message?.includes('relationship')) {
            ;({ data, error } = await run(selectPlain))
          }
          if (error) throw error
          return (data ?? []) as any[]
        })(),

        // City stats — only meaningful when nationality is known
        (async () => {
          if (!effectiveNationality.value) return null
          const { data } = await supabase
            .from('city_stats')
            .select('*')
            .eq('city_id', city.id)
            .eq('target_country', slug.value)
            .eq('author_nationality', effectiveNationality.value)
            .maybeSingle()
          return data ?? null
        })(),
      ])

      return { city, rows: reviewsResult, statsRow: statsResult }
    },
    { watch: [slug, citySlug, effectiveNationality, showAllOverride] }
  )

  // Reset override when nationality changes
  watch(effectiveNationality, () => { showAllOverride.value = false })

  // Convenience refs from merged data
  const cityRaw   = computed(() => data.value?.city   ?? null)
  const rows      = computed(() => data.value?.rows   ?? [])
  const statsRow  = computed(() => data.value?.statsRow ?? null)

  const natReviewsCount = computed(() =>
    showAllOverride.value ? 0 : rows.value.length
  )

  // Category stats
  const catStats = computed(() => {
    if (!showAllOverride.value && statsRow.value) {
      const s = statsRow.value as any
      return CATEGORIES
        .map(cat => {
          const avg = s[`avg_${cat}`] ? Math.round(Number(s[`avg_${cat}`]) * 10) / 10 : null
          return { category: cat, label: cat, avg, count: s.total_reviews ?? 0, barWidth: avg ? Math.round((avg / 5) * 100) : 0, color: avg === null ? 'neutral' : avg >= 4 ? 'success' : avg >= 3 ? 'warning' : 'danger' }
        })
        .filter(c => c.avg !== null)
        .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
    }
    // Fallback: compute from raw rows
    const r = rows.value
    if (!r.length) return []
    return CATEGORIES.map(cat => {
      const vals = r.map((row: any) => row.ratings?.[cat]).filter((v: any) => typeof v === 'number')
      if (!vals.length) return null
      const avg = Math.round((vals.reduce((a: number, b: number) => a + b, 0) / vals.length) * 10) / 10
      return { category: cat, label: cat, avg, count: vals.length, barWidth: Math.round((avg / 5) * 100), color: avg >= 4 ? 'success' : avg >= 3 ? 'warning' : 'danger' }
    }).filter(Boolean).sort((a: any, b: any) => b.avg - a.avg) as any[]
  })

  // Overall avg — average of category fields (excluding 'overall')
  const overallAvg = computed(() => {
    if (!showAllOverride.value && statsRow.value) {
      const s = statsRow.value as any
      const catVals = [
        s.avg_legalization, s.avg_cost_of_living, s.avg_safety,
        s.avg_bureaucracy, s.avg_weather, s.avg_language_barrier,
        s.avg_cleanliness, s.avg_healthcare,
      ].filter(v => v !== null && v !== undefined).map(Number)
      if (catVals.length) return Math.round((catVals.reduce((a, b) => a + b, 0) / catVals.length) * 10) / 10
    }
    const r = rows.value
    if (!r.length) return null
    const vals = (r as any[]).flatMap(row =>
      Object.entries(row.ratings ?? {})
        .filter(([key]) => key !== 'overall')
        .map(([, v]) => v)
        .filter((v): v is number => typeof v === 'number')
    )
    if (!vals.length) return null
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  })

  const totalReviews = computed(() => {
    if (showAllOverride.value) return rows.value.length
    return (statsRow.value as any)?.total_reviews ?? rows.value.length
  })

  // Pagination
  const PAGE_SIZE = 10
  const offset = ref(0)
  const pagedReviews = computed(() => rows.value.slice(0, offset.value + PAGE_SIZE))
  const hasMore = computed(() => rows.value.length > offset.value + PAGE_SIZE)
  function loadMore() { offset.value += PAGE_SIZE }
  watch([slug, citySlug, effectiveNationality], () => { offset.value = 0 })

  return {
    cityData: cityRaw,
    catStats,
    overallAvg,
    totalReviews,
    pagedReviews,
    hasMore,
    loadMore,
    pending,
    reviewsPending: pending,
    showAllOverride,
    natReviewsCount,
  }
}
