import { getCountryMeta } from '~/utils/countryMeta'
import { APP_URL } from '~/utils/appConfig'
import { toCompareSlug } from '~/utils/compareSlug'
import { isDestinationAllowed } from '~/utils/countries'

export const COMPARE_CATEGORIES = [
  { key: 'legalization', icon: 'shield' },
  { key: 'cost_of_living', icon: 'dollar' },
  { key: 'safety', icon: 'safety' },
  { key: 'bureaucracy', icon: 'clipboard' },
  { key: 'weather', icon: 'cloud' },
  { key: 'language_barrier', icon: 'chat' },
  { key: 'cleanliness', icon: 'sparkles' },
  { key: 'healthcare', icon: 'heart' },
  { key: 'overall', icon: 'star' },
] as const

export const CLIMATE_ICONS: Record<string, string> = {
  mediterranean: '☀️',
  temperate: '🌤️',
  northern: '🌨️',
  subarctic: '❄️',
  alpine: '⛰️',
  tropical: '🌴',
}

const AVG_KEYS = [
  'avg_legalization', 'avg_cost_of_living', 'avg_safety', 'avg_bureaucracy',
  'avg_weather', 'avg_language_barrier', 'avg_cleanliness', 'avg_healthcare', 'avg_overall',
] as const

/** Weight per-nationality country_stats rows by total_reviews. */
export function aggregateCountryStats(rows: Record<string, unknown>[]) {
  const total = rows.reduce((s, r) => s + (Number(r.total_reviews) || 0), 0)
  const out: Record<string, unknown> = { total_reviews: total }
  for (const key of AVG_KEYS) {
    let sum = 0
    let weight = 0
    for (const row of rows) {
      const v = row[key]
      const w = Number(row.total_reviews) || 0
      if (v !== null && v !== undefined && w > 0) {
        sum += Number(v) * w
        weight += w
      }
    }
    out[key] = weight ? Math.round((sum / weight) * 100) / 100 : null
  }
  return out
}

export function getCatAvg(stats: Record<string, unknown> | null, key: string): number | null {
  if (!stats) return null
  const val = stats[`avg_${key}`]
  return val !== null && val !== undefined ? Math.round(Number(val) * 10) / 10 : null
}

export function barColor(avg: number): string {
  if (avg >= 4) return 'var(--color-success)'
  if (avg >= 3) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

export interface UseComparePageOptions {
  /** When set, country pickers are initialized from slug route (indexable page). */
  fixedPair?: { a: string; b: string }
  /** Enable SSR data fetch (true for /compare/[pair]). */
  ssr?: boolean
}

export function useComparePage(options: UseComparePageOptions = {}) {
  const route = useRoute()
  const router = useRouter()
  const { t, locale } = useI18n()
  const localePath = useLocalePath()
  const supabase = useSupabaseClient()
  const { countryList, nationalityList, getCountryNameLocalized } = useLocalizedCountries()

  // For `/compare/{slug}` we must hydrate selects + data fetch using the exact ISO codes
  // (all DB rows use upper-case country codes).
  const countryA = ref((options.fixedPair?.a ?? ((route.query.a as string)?.toUpperCase() || '')).toUpperCase())
  const countryB = ref((options.fixedPair?.b ?? ((route.query.b as string)?.toUpperCase() || '')).toUpperCase())
  const countryC = ref((route.query.c as string)?.toUpperCase() || '')
  if (!isDestinationAllowed(countryA.value)) countryA.value = ''
  if (!isDestinationAllowed(countryB.value)) countryB.value = ''
  if (!isDestinationAllowed(countryC.value)) countryC.value = ''
  const showThird = ref(!!countryC.value)
  const localNat = ref(((route.query.nat as string) || '').toUpperCase())

  function pairQuery() {
    return {
      nat: localNat.value ? localNat.value.toLowerCase() : undefined,
      c: (showThird.value && countryC.value) ? countryC.value.toLowerCase() : undefined,
    }
  }

  // Avoid firing route updates on initial mount (would wipe query / loop).
  let routeSyncReady = false
  onMounted(() => { routeSyncReady = true })

  watch([countryA, countryB, countryC, showThird, localNat], () => {
    if (!routeSyncReady) return

    if (options.fixedPair) {
      router.replace({
        path: route.path,
        query: pairQuery(),
      })
      return
    }

    // Landing: once both countries are chosen, go to the canonical SEO pair URL.
    if (countryA.value && countryB.value) {
      const slug = toCompareSlug(countryA.value, countryB.value)
      navigateTo({
        path: localePath(`/compare/${slug}`),
        query: pairQuery(),
      })
      return
    }

    // Partial selection — keep shareable draft query on /compare
    router.replace({
      query: {
        a: countryA.value ? countryA.value.toLowerCase() : undefined,
        b: countryB.value ? countryB.value.toLowerCase() : undefined,
        ...pairQuery(),
      },
    })
  })

  if (options.fixedPair) {
    watch([countryA, countryB], ([a, b]) => {
      if (!routeSyncReady) return
      if (!a || !b) return
      const slug = toCompareSlug(a, b)
      const current = (route.params.pair as string | undefined)?.toLowerCase()
      if (current === slug) return
      navigateTo({
        path: localePath(`/compare/${slug}`),
        query: pairQuery(),
      })
    })
  }

  const isSlugPage = computed(() => !!options.fixedPair)

  const selectedCountries = computed(() =>
    [countryA.value, countryB.value, showThird.value ? countryC.value : '']
      .filter(Boolean),
  )

  const { data: statsData, pending } = useLazyAsyncData(
    () => `compare-${selectedCountries.value.join('-')}-${localNat.value}`,
    async () => {
      if (selectedCountries.value.length < 2) return []
      const results = await Promise.all(
        selectedCountries.value.map(async (code) => {
          let q = supabase
            .from('country_stats')
            .select('*')
            .eq('target_country', code)
          if (localNat.value) {
            q = q.eq('author_nationality', localNat.value)
          }
          const { data } = await q
          if (!data?.length) return { country: code, stats: null }
          if (localNat.value) return { country: code, stats: data[0] ?? null }
          return { country: code, stats: aggregateCountryStats(data as Record<string, unknown>[]) }
        }),
      )
      return results
    },
    {
      server: options.ssr ?? false,
      watch: [selectedCountries, localNat],
    },
  )

  const metaList = computed(() =>
    selectedCountries.value.map(code => ({ country: code, meta: getCountryMeta(code) })),
  )

  const totalReviewCount = computed(() => {
    if (!statsData.value?.length) return 0
    return statsData.value.reduce((sum, item) => {
      const n = Number((item.stats as Record<string, unknown> | null)?.total_reviews) || 0
      return sum + n
    }, 0)
  })

  const isLowData = computed(() =>
    selectedCountries.value.length >= 2
    && !pending.value
    && totalReviewCount.value < 3,
  )

  function isWinner(catKey: string, country: string): boolean {
    if (!statsData.value || statsData.value.length < 2) return false
    const avgs = statsData.value.map(item => getCatAvg(item.stats, catKey) ?? 0)
    const max = Math.max(...avgs)
    if (max === 0) return false
    const countryItem = statsData.value.find(i => i.country === country)
    const countryAvg = getCatAvg(countryItem?.stats ?? null, catKey) ?? 0
    const secondMax = avgs.filter(v => v !== max).reduce((a, b) => Math.max(a, b), 0)
    return countryAvg === max && (max - secondMax) > 0.2
  }

  function costClass(level?: string): string {
    if (level === 'low') return 'val-success'
    if (level === 'high') return 'val-warn'
    if (level === 'very_high') return 'val-danger'
    return ''
  }

  const getCostLabel = (level?: string): string =>
    level ? t(`country.costLevels.${level}`) : ''

  const getCostClass = (level?: string): string => ({
    low: 'cost-low',
    medium: 'cost-medium',
    high: 'cost-high',
    very_high: 'cost-very-high',
  }[level ?? ''] ?? '')

  const staticRows = computed(() => [
    { key: 'currency', label: t('country.sidebar.currency'), getValue: (m: ReturnType<typeof getCountryMeta>) => m?.currency ?? '—' },
    { key: 'language', label: t('country.sidebar.language'), getValue: (m: ReturnType<typeof getCountryMeta>) => m ? t(`country.languages.${m.languageKey}`) : '—' },
    { key: 'residency', label: t('country.sidebar.residencyTime'), getValue: (m: ReturnType<typeof getCountryMeta>) => m ? `${m.residencyMonths} ${t('country.sidebar.months')}` : '—' },
    { key: 'tax_emp', label: t('country.sidebar.taxEmployee'), getValue: (m: ReturnType<typeof getCountryMeta>) => m?.tax_employee ?? '—' },
    { key: 'tax_corp', label: t('country.sidebar.taxCorporate'), getValue: (m: ReturnType<typeof getCountryMeta>) => m?.tax_corporate ?? '—' },
  ])

  const pageTitle = computed(() => {
    if (!countryA.value || !countryB.value) return t('compare.title')
    const a = getCountryNameLocalized(countryA.value)
    const b = getCountryNameLocalized(countryB.value)
    if (localNat.value) {
      const natLabel = t(`nationalities.${localNat.value}.genitive`)
      return t('compare.seoTitleWithNat', { a, b, nat: natLabel })
    }
    return `${a} vs ${b} — ${t('compare.seoTitle')}`
  })

  const pageDescription = computed(() => {
    if (!countryA.value || !countryB.value) return t('compare.landingSeoDescription')
    return t('compare.seoDescription', {
      a: getCountryNameLocalized(countryA.value),
      b: getCountryNameLocalized(countryB.value),
    })
  })

  const pageH1 = computed(() => {
    if (!countryA.value || !countryB.value) return t('compare.title')
    const a = getCountryNameLocalized(countryA.value)
    const b = getCountryNameLocalized(countryB.value)
    if (localNat.value) {
      return t('compare.h1WithNat', {
        a,
        b,
        nat: t(`nationalities.${localNat.value}.genitive`),
      })
    }
    return t('compare.h1Pair', { a, b })
  })

  const canonicalPath = computed(() => {
    if (!countryA.value || !countryB.value) return localePath('/compare')
    const slug = toCompareSlug(countryA.value, countryB.value)
    const base = localePath(`/compare/${slug}`)
    if (!localNat.value) return base
    return `${base}?nat=${localNat.value.toLowerCase()}`
  })

  useSeoMeta({
    title: () => pageTitle.value,
    description: () => pageDescription.value,
    ogTitle: () => pageTitle.value,
    ogDescription: () => pageDescription.value,
    ogUrl: () => `${APP_URL}${canonicalPath.value}`,
    ogType: 'website',
  })

  useHead({
    link: [{
      rel: 'canonical',
      href: computed(() => {
        if (!countryA.value || !countryB.value) return `${APP_URL}${localePath('/compare')}`
        const slug = toCompareSlug(countryA.value, countryB.value)
        return `${APP_URL}${localePath(`/compare/${slug}`)}`
      }),
    }],
  })

  const firstReviewCountry = computed(() => countryA.value || countryB.value)

  return {
    countryA,
    countryB,
    countryC,
    showThird,
    localNat,
    countryList,
    nationalityList,
    getCountryNameLocalized,
    selectedCountries,
    statsData,
    pending,
    metaList,
    isLowData,
    totalReviewCount,
    isWinner,
    costClass,
    getCostLabel,
    getCostClass,
    staticRows,
    pageH1,
    pageTitle,
    localePath,
    isSlugPage,
    firstReviewCountry,
  }
}
