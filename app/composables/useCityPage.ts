import { CATEGORIES } from '~/utils/categories'

export function useCityPage(
  slug: Ref<string>,
  citySlug: Ref<string>,
  nationality: Ref<string>
) {
  const supabase = useSupabaseClient()
  const store = useUserStore()

  // Shared with country page via Pinia store
  const showAllOverride = computed({
    get: () => store.showAllReviews,
    set: (v) => store.setShowAllReviews(v),
  })

  // Fetch city data from cities table by slug
  const { data: cityRaw } = useAsyncData(
    () => `city-${slug.value}-${citySlug.value}`,
    async () => {
      const { data } = await supabase
        .from('cities')
        .select('id, name_en, name_uk, name_ru, country, slug')
        .eq('country', slug.value)
        .eq('slug', citySlug.value)
        .maybeSingle()
      return data
    },
    { watch: [slug, citySlug] }
  )

  // Fetch city stats from city_stats table
  const { data: statsRow, pending } = useLazyAsyncData(
    () => `cityStats-${slug.value}-${citySlug.value}-${nationality.value}`,
    async () => {
      if (!cityRaw.value?.id) return null
      const { data } = await supabase
        .from('city_stats')
        .select('*')
        .eq('city_id', cityRaw.value.id)
        .eq('target_country', slug.value)
        .eq('author_nationality', nationality.value || '')
        .maybeSingle()
      return data
    },
    { server: false, watch: [nationality, cityRaw] }
  )

  // When true — show all reviews ignoring nationality filter
  const _showAllOverride = showAllOverride ?? ref(false)

  // Fetch reviews for this city
  const { data: rows, pending: reviewsPending } = useLazyAsyncData(
    () => `cityReviews-${slug.value}-${citySlug.value}-${nationality.value}-${_showAllOverride.value}`,
    async () => {
      if (!cityRaw.value?.id) return []
      let q = supabase
        .from('reviews')
        .select('id, ratings, comments, created_at, author_nationality, city_id, author_profile, stay_purpose, still_there, climate, cities(id, name_en, name_uk, name_ru, slug)')
        .eq('target_country', slug.value)
        .eq('city_id', cityRaw.value.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (nationality.value && !_showAllOverride.value) {
        q = q.eq('author_nationality', nationality.value)
      }
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as any[]
    },
    { server: false, watch: [nationality, cityRaw, _showAllOverride] }
  )

  // Category stats — from city_stats when nationality filtered,
  // or computed from raw rows when showAllOverride active
  const catStats = computed(() => {
    if (_showAllOverride.value || !statsRow.value) {
      // Compute from raw rows (all nationalities)
      const r = rows.value ?? []
      if (!r.length) return []
      return CATEGORIES.map(cat => {
        const vals = r.map((row: any) => row.ratings?.[cat]).filter((v: any) => typeof v === 'number')
        if (!vals.length) return null
        const avg = Math.round((vals.reduce((a: number, b: number) => a + b, 0) / vals.length) * 10) / 10
        return {
          category: cat, label: cat, avg,
          count: vals.length,
          barWidth: Math.round((avg / 5) * 100),
          color: avg >= 4 ? 'success' : avg >= 3 ? 'warning' : 'danger',
        }
      }).filter(Boolean).sort((a: any, b: any) => b.avg - a.avg) as any[]
    }
    const s = statsRow.value as any
    return CATEGORIES
      .map(cat => {
        const key = `avg_${cat}`
        const avg = s[key] ? Math.round(Number(s[key]) * 10) / 10 : null
        return { category: cat, label: cat, avg, count: s.total_reviews ?? 0, barWidth: avg ? Math.round((avg / 5) * 100) : 0, color: avg === null ? 'neutral' : avg >= 4 ? 'success' : avg >= 3 ? 'warning' : 'danger' }
      })
      .filter(c => c.avg !== null)
      .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
  })

  const overallAvg = computed(() => {
    if (_showAllOverride.value || !statsRow.value) {
      const r = rows.value ?? []
      if (!r.length) return null
      const allVals: number[] = []
      for (const row of r as any[]) {
        for (const val of Object.values(row.ratings ?? {})) {
          if (typeof val === 'number') allVals.push(val)
        }
      }
      if (!allVals.length) return null
      return Math.round((allVals.reduce((a, b) => a + b, 0) / allVals.length) * 10) / 10
    }
    return statsRow.value ? Math.round(Number((statsRow.value as any).avg_overall) * 10) / 10 : null
  })

  const totalReviews = computed(() => {
    if (_showAllOverride.value) return (rows.value ?? []).length
    return (statsRow.value as any)?.total_reviews ?? 0
  })

  // Reset override when nationality changes
  watch(nationality, () => { _showAllOverride.value = false })

  const natReviewsCount = computed(() =>
    _showAllOverride.value ? 0 : (rows.value ?? []).length
  )

  // Pagination
  const PAGE_SIZE = 10
  const offset = ref(0)
  const pagedReviews = computed(() => (rows.value ?? []).slice(0, offset.value + PAGE_SIZE))
  const hasMore = computed(() => (rows.value?.length ?? 0) > offset.value + PAGE_SIZE)
  function loadMore() { offset.value += PAGE_SIZE }

  return {
    cityData: cityRaw,
    catStats,
    overallAvg,
    totalReviews,
    pagedReviews,
    hasMore,
    loadMore,
    pending,
    reviewsPending,
    showAllOverride: _showAllOverride,
    natReviewsCount,
  }
}
