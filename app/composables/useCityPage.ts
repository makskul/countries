import { CATEGORIES } from '~/utils/categories'

export function useCityPage(
  slug: Ref<string>,
  citySlug: Ref<string>,
  nationality: Ref<string>
) {
  const supabase = useSupabaseClient()

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

  // Fetch reviews for this city
  const { data: rows, pending: reviewsPending } = useLazyAsyncData(
    () => `cityReviews-${slug.value}-${citySlug.value}-${nationality.value}`,
    async () => {
      if (!cityRaw.value?.id) return []
      let q = supabase
        .from('reviews')
        .select('id, ratings, comments, created_at, author_nationality, city_id, author_profile, stay_purpose, still_there, climate, cities(id, name_en, name_uk, name_ru, slug)')
        .eq('target_country', slug.value)
        .eq('city_id', cityRaw.value.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (nationality.value) {
        q = q.eq('author_nationality', nationality.value)
      }
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as any[]
    },
    { server: false, watch: [nationality, cityRaw] }
  )

  // Category stats computed from city_stats row
  const catStats = computed(() => {
    const s = statsRow.value as any
    if (!s) return []
    return CATEGORIES
      .map(cat => {
        const key = `avg_${cat}`
        const avg = s[key] ? Math.round(Number(s[key]) * 10) / 10 : null
        return {
          category: cat,
          label: cat,
          avg,
          count: s.total_reviews ?? 0,
          barWidth: avg ? Math.round((avg / 5) * 100) : 0,
          color: avg === null ? 'neutral' : avg >= 4 ? 'success' : avg >= 3 ? 'warning' : 'danger',
        }
      })
      .filter(c => c.avg !== null)
      .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
  })

  const overallAvg = computed(() =>
    statsRow.value ? Math.round(Number((statsRow.value as any).avg_overall) * 10) / 10 : null
  )

  const totalReviews = computed(() => (statsRow.value as any)?.total_reviews ?? 0)

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
  }
}
