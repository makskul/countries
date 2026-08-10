<template>
  <div class="cmp-page">

    <!-- BREADCRUMB -->
    <div class="breadcrumb">
      <NuxtLinkLocale to="/" class="bc-link">{{ $t('nav.breadcrumbs.home') }}</NuxtLinkLocale>
      <span class="bc-sep">→</span>
      <span class="bc-current">{{ $t('compare.title') }}</span>
    </div>

    <!-- PAGE HEADER -->
    <div class="cmp-header">
      <div class="cmp-header-inner">
        <span class="section-label">{{ $t('compare.sectionLabel') }}</span>
        <h1 class="cmp-title">{{ $t('compare.title') }}</h1>
        <p class="cmp-subtitle">{{ $t('compare.subtitle') }}</p>
      </div>
    </div>

    <!-- SELECTORS ROW -->
    <div class="cmp-selectors-wrap">
      <div class="cmp-selectors">
        <!-- Country A -->
        <Select
          v-model="countryA"
          :options="countryList"
          optionLabel="name"
          optionValue="code"
          :placeholder="$t('compare.selectCountry')"
          filter
          class="cmp-select"
        >
          <template #option="{ option }">
            <span>{{ option.flag }} {{ option.name }}</span>
          </template>
          <template #value="{ value }">
            <span v-if="value">{{ getFlagEmoji(value) }} {{ getCountryNameLocalized(value) }}</span>
            <span v-else style="color:var(--color-text-muted)">{{ $t('compare.selectCountry') }}</span>
          </template>
        </Select>

        <span class="cmp-vs">VS</span>

        <!-- Country B -->
        <Select
          v-model="countryB"
          :options="countryList"
          optionLabel="name"
          optionValue="code"
          :placeholder="$t('compare.selectCountry')"
          filter
          class="cmp-select"
        >
          <template #option="{ option }">
            <span>{{ option.flag }} {{ option.name }}</span>
          </template>
          <template #value="{ value }">
            <span v-if="value">{{ getFlagEmoji(value) }} {{ getCountryNameLocalized(value) }}</span>
            <span v-else style="color:var(--color-text-muted)">{{ $t('compare.selectCountry') }}</span>
          </template>
        </Select>

        <!-- Country C (optional) -->
        <template v-if="showThird">
          <span class="cmp-vs">VS</span>
          <div style="display:flex; align-items:center; gap:6px">
            <Select
              v-model="countryC"
              :options="countryList"
              optionLabel="name"
              optionValue="code"
              :placeholder="$t('compare.selectCountry')"
              filter
              class="cmp-select"
            >
              <template #option="{ option }">
                <span>{{ option.flag }} {{ option.name }}</span>
              </template>
              <template #value="{ value }">
                <span v-if="value">{{ getFlagEmoji(value) }} {{ getCountryNameLocalized(value) }}</span>
                <span v-else style="color:var(--color-text-muted)">{{ $t('compare.selectCountry') }}</span>
              </template>
            </Select>
            <button class="cmp-remove-btn" @click="showThird = false; countryC = ''">×</button>
          </div>
        </template>

        <!-- Add third country -->
        <button v-if="!showThird" class="cmp-add-btn" @click="showThird = true">
          {{ $t('compare.addCountry') }}
        </button>

        <!-- Nationality filter -->
        <div class="cmp-nat-filter">
          <span class="cmp-filter-label">{{ $t('compare.filterBy') }}</span>
          <Select
            v-model="localNat"
            :options="nationalityList"
            optionLabel="name"
            optionValue="code"
            :placeholder="$t('compare.allNationalities')"
            showClear
            class="cmp-select cmp-select--nat"
          >
            <template #option="{ option }">
              <span>{{ option.flag }} {{ option.name }}</span>
            </template>
            <template #value="{ value }">
              <span v-if="value">{{ getFlagEmoji(value) }} {{ getCountryNameLocalized(value) }}</span>
            </template>
          </Select>
        </div>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="cmp-content">

      <!-- Empty hint -->
      <div v-if="selectedCountries.length < 2" class="cmp-empty">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" stroke-width="1" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/></svg>
        <p>{{ $t('compare.selectHint') }}</p>
      </div>

      <template v-else>
        <!-- No nationality info -->
        <Message v-if="!localNat" severity="info" :closable="false" style="margin-bottom:16px; font-size:13px">
          {{ $t('compare.noNatHint') }}
        </Message>

        <!-- Skeleton while loading -->
        <div v-if="pending" class="cmp-skeleton">
          <Skeleton height="200px" style="border-radius:var(--radius-lg)" />
        </div>

        <template v-else-if="statsData">
          <!-- RATINGS TABLE -->
          <div class="cmp-table-wrap">
            <div class="cmp-table" :style="`grid-template-columns: 180px repeat(${selectedCountries.length}, 1fr)`">

              <!-- Header row -->
              <div class="cmp-cell cmp-cell--label" />
              <div
                v-for="item in statsData"
                :key="item.country"
                class="cmp-cell cmp-cell--head"
              >
                <div class="cmp-country-flag">{{ getFlagEmoji(item.country) }}</div>
                <div class="cmp-country-name">{{ getCountryNameLocalized(item.country) }}</div>
                <div class="cmp-overall-score">
                  {{ item.stats?.avg_overall ? Number(item.stats.avg_overall).toFixed(1) : '—' }}
                </div>
                <Rating
                  v-if="item.stats?.avg_overall"
                  :modelValue="Number(item.stats.avg_overall)"
                  readonly :cancel="false" :stars="5"
                />
                <div class="cmp-overall-label">{{ $t('compare.overallLabel') }}</div>
                <a
                  :href="localePath(`/country/${item.country.toLowerCase()}`)"
                  target="_blank"
                  rel="noopener"
                  class="cmp-country-link"
                >{{ $t('compare.goToReviews') }} →</a>
              </div>

              <!-- Category rows -->
              <template v-for="cat in COMPARE_CATEGORIES" :key="cat.key">
                <!-- Label cell -->
                <div class="cmp-cell cmp-cell--label">
                  <div class="cmp-cat-icon">
                    <svg v-if="cat.icon === 'shield'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                    <svg v-else-if="cat.icon === 'dollar'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    <svg v-else-if="cat.icon === 'safety'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <svg v-else-if="cat.icon === 'clipboard'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>
                    <svg v-else-if="cat.icon === 'cloud'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
                    <svg v-else-if="cat.icon === 'chat'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <svg v-else-if="cat.icon === 'sparkles'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                    <svg v-else-if="cat.icon === 'heart'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <span class="cmp-cat-name">{{ $t(`categories.${cat.key}.name`) }}</span>
                </div>

                <!-- Value cells -->
                <div
                  v-for="item in statsData"
                  :key="`${cat.key}-${item.country}`"
                  class="cmp-cell cmp-cell--val"
                >
                  <template v-if="getCatAvg(item.stats, cat.key) !== null">
                    <div class="cmp-bar-wrap">
                      <div
                        class="cmp-bar"
                        :style="{
                          width: ((getCatAvg(item.stats, cat.key) ?? 0) / 5 * 100) + '%',
                          background: barColor(getCatAvg(item.stats, cat.key) ?? 0),
                        }"
                      />
                    </div>
                    <div class="cmp-score-row">
                      <span class="cmp-score">{{ (getCatAvg(item.stats, cat.key) ?? 0).toFixed(1) }}</span>
                      <span
                        v-if="isWinner(cat.key, item.country)"
                        class="cmp-winner"
                      >{{ $t('compare.winner') }}</span>
                    </div>
                    <!-- Weather climate icons from climateKey -->
                    <div v-if="cat.key === 'weather'" class="compare-climate-icons">
                      <span
                        v-if="getCountryMeta(item.country)?.climateKey"
                        :title="$t(`country.climates.${getCountryMeta(item.country)!.climateKey}`)"
                      >{{ CLIMATE_ICONS[getCountryMeta(item.country)!.climateKey] ?? '🌡️' }}</span>
                      <span class="compare-climate-text">{{ $t(`country.climates.${getCountryMeta(item.country)?.climateKey ?? 'temperate'}`) }}</span>
                    </div>
                    <!-- Cost of living label -->
                    <div
                      v-if="cat.key === 'cost_of_living'"
                      class="compare-cost-label"
                      :class="getCostClass(getCountryMeta(item.country)?.costLevel)"
                    >{{ getCostLabel(getCountryMeta(item.country)?.costLevel) }}</div>
                  </template>
                  <span v-else class="cmp-no-data">—</span>
                </div>
              </template>
            </div>
          </div>

          <!-- STATIC INFO TABLE -->
          <div class="cmp-static-wrap" v-if="metaList.some(m => m.meta)">
            <div class="cmp-static-header">{{ $t('compare.staticInfo') }}</div>
            <div class="cmp-table" :style="`grid-template-columns: 180px repeat(${selectedCountries.length}, 1fr)`">
              <template v-for="row in staticRows" :key="row.key">
                <div class="cmp-cell cmp-cell--label cmp-cell--static-label">{{ row.label }}</div>
                <div
                  v-for="item in metaList"
                  :key="`${row.key}-${item.country}`"
                  class="cmp-cell cmp-cell--val cmp-cell--static-val"
                  :class="row.key === 'cost' ? costClass(item.meta?.costLevel) : ''"
                >
                  {{ row.getValue(item.meta) }}
                </div>
              </template>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getFlagEmoji } from '~/utils/countries'
import { getCountryMeta } from '~/utils/countryMeta'

const route = useRoute()
const router = useRouter()
const { t, locale, tm } = useI18n()
const localePath = useLocalePath()

const getWeatherIcon = (key: string): string => {
  const opts = tm('common.weatherOptions') as any
  return opts[key]?.icon ?? '🌡️'
}

const CLIMATE_ICONS: Record<string, string> = {
  mediterranean: '☀️',
  temperate:     '🌤️',
  northern:      '🌨️',
  subarctic:     '❄️',
  alpine:        '⛰️',
  tropical:      '🌴',
}

const getCostLabel = (level?: string): string =>
  level ? t(`country.costLevels.${level}`) : ''

const getCostClass = (level?: string): string => ({
  low:       'cost-low',
  medium:    'cost-medium',
  high:      'cost-high',
  very_high: 'cost-very-high',
}[level ?? ''] ?? '')
const supabase = useSupabaseClient()
const { countryList, nationalityList, getCountryNameLocalized } = useLocalizedCountries()

// ── Local state (NO store/cookie read) ──────────────────
const countryA  = ref((route.query.a as string) || '')
const countryB  = ref((route.query.b as string) || '')
const countryC  = ref((route.query.c as string) || '')
const showThird = ref(!!route.query.c)
const localNat  = ref((route.query.nat as string) || '')

// Sync URL
watch([countryA, countryB, countryC, showThird, localNat], () => {
  router.replace({
    query: {
      a: countryA.value || undefined,
      b: countryB.value || undefined,
      c: (showThird.value && countryC.value) ? countryC.value : undefined,
      nat: localNat.value || undefined,
    },
  })
})

// ── SEO ─────────────────────────────────────────────────
useSeoMeta({
  title: () => countryA.value && countryB.value
    ? `${getCountryNameLocalized(countryA.value)} vs ${getCountryNameLocalized(countryB.value)} — ${t('compare.seoTitle')}`
    : t('compare.title'),
  description: () => t('compare.seoDescription', {
    a: getCountryNameLocalized(countryA.value),
    b: getCountryNameLocalized(countryB.value),
  }),
})

// ── Selected countries ───────────────────────────────────
const selectedCountries = computed(() =>
  [countryA.value, countryB.value, showThird.value ? countryC.value : '']
    .filter(Boolean)
)

// ── Data fetch ───────────────────────────────────────────
const { data: statsData, pending } = useLazyAsyncData(
  () => `compare-${selectedCountries.value.join('-')}-${localNat.value}`,
  async () => {
    if (selectedCountries.value.length < 2) return []
    const results = await Promise.all(
      selectedCountries.value.map(async code => {
        let q = supabase
          .from('country_stats')
          .select('*')
          .eq('target_country', code)
        if (localNat.value) {
          q = q.eq('author_nationality', localNat.value)
        }
        const { data } = await q
        if (!data?.length) return { country: code, stats: null }
        // With a nationality filter there is at most one row.
        if (localNat.value) return { country: code, stats: data[0] ?? null }
        // "All nationalities": weight category avgs by total_reviews (not data[0]).
        return { country: code, stats: aggregateCountryStats(data as Record<string, unknown>[]) }
      })
    )
    return results
  },
  { server: false, watch: [selectedCountries, localNat] }
)

// ── Country meta ─────────────────────────────────────────
const metaList = computed(() =>
  selectedCountries.value.map(code => ({ country: code, meta: getCountryMeta(code) }))
)

// ── Categories ───────────────────────────────────────────
const COMPARE_CATEGORIES = [
  { key: 'legalization',    icon: 'shield'    },
  { key: 'cost_of_living',  icon: 'dollar'    },
  { key: 'safety',          icon: 'safety'    },
  { key: 'bureaucracy',     icon: 'clipboard' },
  { key: 'weather',         icon: 'cloud'     },
  { key: 'language_barrier',icon: 'chat'      },
  { key: 'cleanliness',     icon: 'sparkles'  },
  { key: 'healthcare',      icon: 'heart'     },
  { key: 'overall',         icon: 'star'      },
]

const AVG_KEYS = [
  'avg_legalization', 'avg_cost_of_living', 'avg_safety', 'avg_bureaucracy',
  'avg_weather', 'avg_language_barrier', 'avg_cleanliness', 'avg_healthcare', 'avg_overall',
] as const

/** Weight per-nationality country_stats rows by total_reviews. */
function aggregateCountryStats(rows: Record<string, unknown>[]) {
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

function getCatAvg(stats: Record<string, unknown> | null, key: string): number | null {
  if (!stats) return null
  const val = stats[`avg_${key}`]
  return val !== null && val !== undefined ? Math.round(Number(val) * 10) / 10 : null
}

function barColor(avg: number): string {
  if (avg >= 4) return 'var(--color-success)'
  if (avg >= 3) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

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

// ── Static info rows ─────────────────────────────────────
const staticRows = computed(() => [
  { key: 'currency',  label: t('country.sidebar.currency'),      getValue: (m: ReturnType<typeof getCountryMeta>) => m?.currency ?? '—' },
  { key: 'language',  label: t('country.sidebar.language'),      getValue: (m: ReturnType<typeof getCountryMeta>) => m ? t(`country.languages.${m.languageKey}`) : '—' },
  { key: 'residency', label: t('country.sidebar.residencyTime'), getValue: (m: ReturnType<typeof getCountryMeta>) => m ? `${m.residencyMonths} ${t('country.sidebar.months')}` : '—' },
  { key: 'tax_emp',   label: t('country.sidebar.taxEmployee'),   getValue: (m: ReturnType<typeof getCountryMeta>) => m?.tax_employee ?? '—' },
  { key: 'tax_corp',  label: t('country.sidebar.taxCorporate'),  getValue: (m: ReturnType<typeof getCountryMeta>) => m?.tax_corporate ?? '—' },
])
</script>

<style scoped>
.cmp-page { background: var(--color-bg-secondary); min-height: 100vh; }

/* Breadcrumb */
.breadcrumb { padding: 12px 24px; font-size: 12px; display: flex; align-items: center; gap: 6px; max-width: 1200px; margin: 0 auto; }
.bc-link { color: var(--color-primary); text-decoration: none; }
.bc-link:hover { text-decoration: underline; }
.bc-sep { color: var(--color-text-muted); }
.bc-current { color: var(--color-text-secondary); }

/* Header */
.cmp-header { background: #fff; border-bottom: 1px solid var(--color-border); padding: 24px; }
.cmp-header-inner { max-width: 1152px; margin: 0 auto; }
.cmp-title { font-size: 24px; font-weight: 700; color: var(--color-text); margin: 4px 0 6px; }
.cmp-subtitle { font-size: 14px; color: var(--color-text-secondary); margin: 0; }

/* Selectors */
.cmp-selectors-wrap { background: #fff; border-bottom: 1px solid var(--color-border); padding: 16px 24px; }
.cmp-selectors { max-width: 1152px; margin: 0 auto; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.cmp-select { min-width: 180px; font-size: 13px; }
.cmp-select--nat { min-width: 160px; }
.cmp-vs { font-size: 11px; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.06em; flex-shrink: 0; }
.cmp-add-btn {
  background: var(--color-primary-light); color: var(--color-primary);
  border: 1.5px dashed var(--color-primary); border-radius: var(--radius-md);
  padding: 8px 14px; font-size: 13px; cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: background 0.15s;
}
.cmp-add-btn:hover { background: var(--color-primary-light); opacity: 0.8; }
.cmp-remove-btn {
  background: none; border: 1px solid var(--color-border); border-radius: 50%;
  width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 14px; color: var(--color-text-muted); flex-shrink: 0;
}
.cmp-remove-btn:hover { background: var(--color-bg-secondary); }
.cmp-nat-filter { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.cmp-filter-label { font-size: 12px; color: var(--color-text-muted); white-space: nowrap; }

/* Content */
.cmp-content { max-width: 1200px; margin: 0 auto; padding: 20px 24px; }
.cmp-empty { text-align: center; padding: 60px 24px; color: var(--color-text-muted); font-size: 15px; }
.cmp-empty svg { display: block; margin: 0 auto 16px; }
.cmp-skeleton { margin-bottom: 20px; }

/* Table */
.cmp-table-wrap { background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 16px; }
.cmp-table { display: grid; min-width: 600px; }

.cmp-cell {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border-subtle);
  border-right: 1px solid var(--color-border-subtle);
  display: flex; align-items: center; gap: 8px;
}
.cmp-cell:last-child { border-right: none; }

/* Header cells */
.cmp-cell--head {
  flex-direction: column; align-items: center; text-align: center;
  background: var(--color-bg-secondary); padding: 16px 14px; gap: 4px;
}
.cmp-country-flag { font-size: 28px; line-height: 1; }
.cmp-country-name { font-size: 13px; font-weight: 600; color: var(--color-text); }
.cmp-overall-score { font-size: 22px; font-weight: 700; color: var(--color-primary); line-height: 1; margin-top: 4px; }
.cmp-overall-label { font-size: 10px; color: var(--color-text-muted); }
.cmp-country-link { font-size: 11px; color: var(--color-primary); text-decoration: none; margin-top: 4px; }
.cmp-country-link:hover { text-decoration: underline; }

/* Label cells */
.cmp-cell--label { background: var(--color-bg-secondary); font-size: 12px; color: var(--color-text-secondary); }
.cmp-cat-icon {
  width: 26px; height: 26px; flex-shrink: 0;
  background: var(--color-primary-light); border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
}
.cmp-cat-name { font-size: 12px; color: var(--color-text-secondary); }

/* Value cells */
.cmp-cell--val { flex-direction: column; align-items: flex-start; gap: 4px; }
.cmp-bar-wrap { width: 100%; height: 4px; background: var(--color-bg-tertiary); border-radius: 2px; overflow: hidden; }
.cmp-bar { height: 100%; border-radius: 2px; transition: width 0.4s ease; }
.cmp-score-row { display: flex; align-items: center; gap: 6px; }
.cmp-score { font-size: 12px; font-weight: 600; color: var(--color-text); }
.cmp-winner { font-size: 10px; background: var(--color-success); color: #fff; border-radius: var(--radius-pill); padding: 1px 6px; white-space: nowrap; }
.cmp-no-data { font-size: 13px; color: var(--color-text-muted); }
.compare-climate-icons { display: flex; align-items: center; gap: 5px; margin-top: 4px; flex-wrap: wrap; }
.compare-climate-icons span:first-child { font-size: 14px; line-height: 1; }
.compare-climate-text { font-size: 11px; color: var(--color-text-muted); }
.compare-cost-label { font-size: 11px; font-weight: 500; margin-top: 4px; width: fit-content; padding: 1px 7px; border-radius: 999px; }
.cost-low       { background: var(--color-success-light); color: var(--color-success); }
.cost-medium    { background: var(--color-bg-tertiary);   color: var(--color-text-secondary); }
.cost-high      { background: var(--color-warning-light); color: var(--color-warning); }
.cost-very-high { background: var(--color-danger-light);  color: var(--color-danger); }

/* Static info */
.cmp-static-wrap { background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow-x: auto; -webkit-overflow-scrolling: touch; }
.cmp-static-header { background: var(--color-primary-light); padding: 10px 16px; font-size: 12px; font-weight: 600; color: var(--color-primary-dark); min-width: 600px; }
.cmp-cell--static-label { font-size: 12px; color: var(--color-text-secondary); background: var(--color-bg-secondary); }
.cmp-cell--static-val { font-size: 12px; font-weight: 500; color: var(--color-text); }
.val-success { color: var(--color-success) !important; }
.val-warn    { color: var(--color-warning) !important; }
.val-danger  { color: var(--color-danger) !important; }

@media (max-width: 768px) {
  .cmp-selectors { gap: 8px; }
  .cmp-nat-filter { margin-left: 0; width: 100%; }
  .cmp-select { min-width: 140px; }
}
</style>
