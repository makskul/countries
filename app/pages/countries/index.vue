<template>
  <div class="countries-page">
    <CountriesPageHero
      :stats="stats"
      :map-review-data="mapReviewData"
      :featured-review="featuredReview"
      :last-review-label="lastReviewLabel"
    />

    <!-- Controls -->
    <div class="controls-section">
      <div class="controls-top">
        <div class="nat-row">
          <span class="nat-label">{{ $t('countries.viewingAs') }}</span>
          <NationalitySelector v-model="nationality" class="nat-select" @update:modelValue="onNationalityChange" />
        </div>
      </div>
      <div class="controls-bar">
        <CountryFilterBar
          v-model:search="search"
          v-model:region="region"
          v-model:category="category"
          v-model:sort="sort"
          :count="filteredCountries.length"
        />
        <div class="view-toggle">
          <button
            type="button"
            class="favorites-toggle"
            :class="{ active: favoritesOnly }"
            :title="$t('countries.filters.favoritesOnly')"
            @click="favoritesOnly = !favoritesOnly"
          >
            <i class="pi" :class="favoritesOnly ? 'pi-heart-fill' : 'pi-heart'" />
            <span class="favorites-toggle-label">{{ $t('countries.filters.favoritesOnly') }}</span>
          </button>
          <button type="button" :class="{ active: viewMode === 'grid' }" :title="$t('countries.view.grid')" @click="viewMode = 'grid'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </button>
          <button type="button" :class="{ active: viewMode === 'list' }" :title="$t('countries.view.list')" @click="viewMode = 'list'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
        </div>
      </div>

      <HorizontalScroller class="pill-scroller">
        <div class="pill-row">
          <button
            v-for="pill in categoryPills"
            :key="pill.value"
            type="button"
            class="pill"
            :class="{ active: category === pill.value }"
            @click="setCategory(pill.value)"
          >
            {{ pill.label }}
          </button>
        </div>
      </HorizontalScroller>
    </div>

    <!-- Results -->
    <div class="results-count">
      {{ $t('countries.filters.found', { count: filteredCountries.length }) }}
    </div>

    <div v-if="pending" class="grid-skeleton">
      <Skeleton v-for="i in 8" :key="i" height="360px" style="border-radius: 14px" />
    </div>

    <div v-else-if="filteredCountries.length === 0" class="empty-block">
      <h3>{{ favoritesOnly ? $t('countries.emptyFavorites.title') : $t('countries.empty.title') }}</h3>
      <p>{{ favoritesOnly ? $t('countries.emptyFavorites.message') : $t('countries.empty.message') }}</p>
      <Button
        :label="favoritesOnly ? $t('countries.emptyFavorites.showAll') : $t('countries.empty.reset')"
        severity="secondary"
        style="margin-top: 16px"
        @click="favoritesOnly ? (favoritesOnly = false) : resetFilters()"
      />
    </div>

    <template v-else>
      <div class="country-grid" :class="{ 'list-view': viewMode === 'list' }">
        <CountryGridCard
          v-for="c in pagedCountries"
          :key="c.code"
          :country="c"
          :list="viewMode === 'list'"
          @click="navigateTo(c.code)"
        />
      </div>

      <div ref="paginatorEl" class="paginator-wrap">
        <Paginator
          v-model:first="pageFirst"
          :rows="pageSize"
          :totalRecords="filteredCountries.length"
          @page="onPageChange"
        />
      </div>
    </template>

    <!-- AI banner -->
    <div class="ai-banner-bottom">
      <div class="ai-left">
        <div class="ai-bot">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="4" y="8" width="16" height="12" rx="3"/><circle cx="9" cy="14" r="1.3" fill="white"/><circle cx="15" cy="14" r="1.3" fill="white"/><path d="M12 8V4M9 4h6"/></svg>
        </div>
        <div>
          <h3>{{ $t('countries.ai.title') }}</h3>
          <p>{{ $t('countries.ai.subtitle') }}</p>
        </div>
        <NuxtLinkLocale to="/countries" class="ai-cta">{{ $t('countries.ai.cta') }}</NuxtLinkLocale>
      </div>
      <div>
        <div class="how-it-works-title">{{ $t('countries.ai.howTitle') }}</div>
        <div class="how-it-works">
          <div class="hiw-step"><div class="hiw-num">1</div><div class="hiw-text">{{ $t('countries.ai.step1') }}</div></div>
          <div class="hiw-step"><div class="hiw-num">2</div><div class="hiw-text">{{ $t('countries.ai.step2') }}</div></div>
          <div class="hiw-step"><div class="hiw-num">3</div><div class="hiw-text">{{ $t('countries.ai.step3') }}</div></div>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="showNatDialog" :header="$t('countries.dialog.title')" modal style="width: 360px">
      <div style="display: flex; flex-direction: column; gap: 16px; padding-top: 4px">
        <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary)">
          {{ $t('countries.dialog.subtitle') }}
        </p>
        <NationalitySelector v-model="dialogNationality" />
        <Button :label="$t('common.buttons.continue')" :disabled="!dialogNationality" style="width: 100%" @click="confirmNat" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { MapReviewEntry } from '~/components/HomeWorldMap.vue'
import { APP_URL } from '~/utils/appConfig'
import { useCountriesList, type CountryStat } from '~/composables/useCountriesList'
import { useHomepageData } from '~/composables/useHomepageData'
import { timeAgo } from '~/utils/countries'
import { codeToMapName } from '~/utils/worldMapGeo'

const { t, locale } = useI18n()

useSeoMeta({
  title: () => t('seo.countries.title'),
  description: () => t('seo.countries.description'),
  ogTitle: () => t('seo.countries.title'),
  ogDescription: () => t('seo.countries.description'),
  ogImage: APP_URL + '/og/countries.png',
  ogUrl: APP_URL + '/countries',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

const store = useUserStore()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()

onMounted(() => store.loadFromStorage())

const nationality = ref(store.nationality)
function onNationalityChange(v: string) {
  store.setNationality(v)
}

const search = ref((route.query.search as string) || '')
const region = ref((route.query.region as string) || '')
const category = ref((route.query.category as string) || '')
const sort = ref((route.query.sort as string) || 'popular')
const favoritesOnly = ref((route.query.favorites as string) === '1')

function resetFilters() {
  search.value = ''
  region.value = ''
  category.value = ''
  sort.value = 'popular'
  favoritesOnly.value = false
}

function setCategory(value: string) {
  category.value = value
}

const categoryPills = computed(() => [
  { value: '', label: t('countries.pills.all') },
  { value: 'legalization', label: t('countries.pills.visa') },
  { value: 'cost_of_living', label: t('countries.pills.cost') },
  { value: 'safety', label: t('countries.pills.safety') },
  { value: 'weather', label: t('countries.pills.climate') },
  { value: 'healthcare', label: t('countries.pills.health') },
  { value: 'bureaucracy', label: t('countries.pills.work') },
])

const { countries, pending } = useCountriesList()
const { stats, latest } = useHomepageData()
const { getCountryNameLocalized } = useLocalizedCountries()

const mapReviewData = computed<Record<string, MapReviewEntry>>(() => {
  const out: Record<string, MapReviewEntry> = {}
  for (const c of countries.value ?? []) {
    const mapName = codeToMapName(c.code, c.name)
    out[mapName] = { code: c.code, rating: c.avgRating, reviews: c.totalReviews }
  }
  return out
})

const featuredReview = computed(() => latest.value?.[0] ?? null)

const lastReviewLabel = computed(() =>
  featuredReview.value ? timeAgo(featuredReview.value.created_at, locale.value) : '—'
)

watch([search, region, category, sort, favoritesOnly], () => {
  const query: Record<string, string> = {}
  if (search.value) query.search = search.value
  if (region.value) query.region = region.value
  if (category.value) query.category = category.value
  if (sort.value !== 'popular') query.sort = sort.value
  if (favoritesOnly.value) query.favorites = '1'
  router.replace({ query })
})

const filteredCountries = computed<CountryStat[]>(() => {
  let list = countries.value ?? []

  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      getCountryNameLocalized(c.code).toLowerCase().includes(q)
    )
  }

  if (region.value) {
    list = list.filter(c => c.region === region.value)
  }

  if (category.value) {
    list = list.filter(c => c.categoryStats.some(cs => cs.category === category.value))
  }

  if (favoritesOnly.value) {
    list = list.filter(c => store.isFavorite(c.code))
  }

  switch (sort.value) {
    case 'rating_desc': list = [...list].sort((a, b) => b.avgRating - a.avgRating); break
    case 'rating_asc': list = [...list].sort((a, b) => a.avgRating - b.avgRating); break
    case 'reviews_desc': list = [...list].sort((a, b) => b.totalReviews - a.totalReviews); break
    case 'popular':
    default: list = [...list].sort((a, b) => b.totalReviews - a.totalReviews); break
  }

  return list
})

const viewMode = ref<'grid' | 'list'>('grid')
const pageFirst = ref(0)
const pageSize = ref(12)

const pagedCountries = computed(() =>
  filteredCountries.value.slice(pageFirst.value, pageFirst.value + pageSize.value)
)

watch([search, region, category, sort, favoritesOnly, pageSize], () => { pageFirst.value = 0 })

const paginatorEl = ref<HTMLElement | null>(null)
function onPageChange() {
  nextTick(() => {
    paginatorEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const showNatDialog = ref(false)
const dialogNationality = ref('')
const pendingCode = ref('')

function navigateTo(code: string) {
  if (!store.nationality) {
    pendingCode.value = code
    dialogNationality.value = ''
    showNatDialog.value = true
    return
  }
  router.push(localePath(`/country/${code.toLowerCase()}`))
}

function confirmNat() {
  if (!dialogNationality.value) return
  store.setNationality(dialogNationality.value)
  nationality.value = dialogNationality.value
  showNatDialog.value = false
  router.push(localePath(`/country/${pendingCode.value.toLowerCase()}`))
}
</script>

<style>
@import '~/assets/styles/countries.css';
</style>
