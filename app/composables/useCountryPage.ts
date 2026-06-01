import { CATEGORIES, CATEGORY_LABELS } from '~/utils/categories'
import { getRegion } from '~/utils/regions'

export interface RawReview {
  id: string
  created_at: string
  author_nationality: string
  ratings: Record<string, number>
  comments: Record<string, string>
}

export function useCountryPage(slug: Ref<string>, nationality: Ref<string>) {
  const supabase = useSupabaseClient()

  // Primary fetch: all reviews for this country+nationality
  const { data: rows, pending, refresh } = useLazyAsyncData(
    () => `country-${slug.value}-${nationality.value}`,
    async () => {
      if (!slug.value || !nationality.value) return [] as RawReview[]
      const { data, error } = await supabase
        .from('reviews')
        .select('id, ratings, comments, created_at, author_nationality')
        .eq('target_country', slug.value)
        .eq('author_nationality', nationality.value)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as RawReview[]
    },
    { server: false, watch: [slug, nationality] }
  )

  // Category stats computed client-side
  const catStats = computed(() => {
    return CATEGORIES.map(cat => {
      const withRating = (rows.value ?? []).filter(r => r.ratings?.[cat] != null)
      const avg = withRating.length
        ? withRating.reduce((sum, r) => sum + r.ratings[cat], 0) / withRating.length
        : null
      return {
        category: cat,
        label: CATEGORY_LABELS[cat],
        avg: avg !== null ? Math.round(avg * 10) / 10 : null,
        count: withRating.length,
        barWidth: avg !== null ? Math.round((avg / 5) * 100) : 0,
        color: avg === null ? 'neutral' : avg >= 4 ? 'success' : avg >= 3 ? 'warning' : 'danger',
      }
    })
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count)
  })

  // Overall average across all categories and all rows
  const overallAvg = computed(() => {
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
  }
}
