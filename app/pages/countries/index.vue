<template>
  <div class="cp-page">
    <!-- Page header -->
    <div class="cp-header">
      <div class="cp-header-left">
        <h1 class="cp-h1">{{ $t('countries.title') }}</h1>
        <p class="cp-sub">{{ $t('countries.subtitle') }}</p>
      </div>
      <div class="cp-header-right">
        <span class="section-label" style="display: block; margin-bottom: 4px">{{ $t('countries.viewingAs') }}</span>
        <NationalitySelector v-model="nationality" style="width: 220px; font-size: 13px" @update:modelValue="onNationalityChange" />
      </div>
    </div>

    <!-- Filter bar -->
    <CountryFilterBar
      v-model:search="search"
      v-model:region="region"
      v-model:category="category"
      v-model:sort="sort"
      :count="filteredCountries.length"
      style="margin-bottom: 16px"
    />

    <!-- View toggle + grid -->
    <div v-if="pending" class="cp-grid">
      <Skeleton v-for="i in 6" :key="i" height="200px" style="border-radius: var(--radius-lg)" />
    </div>

    <div v-else-if="filteredCountries.length === 0">
      <Message severity="info" :closable="false">
        {{ $t('countries.empty.message') }}
      </Message>
      <div style="margin-top: 12px">
        <Button :label="$t('countries.empty.reset')" severity="secondary" @click="resetFilters" />
      </div>
    </div>

    <template v-else>
      <!-- View toggle -->
      <div class="cp-toolbar">
        <span class="cp-toolbar-count">{{ $t('countries.filters.found', { count: filteredCountries.length }) }}</span>
        <div class="cp-view-toggle">
          <Button
            icon="pi pi-th-large"
            :severity="viewMode === 'grid' ? 'primary' : 'secondary'"
            text
            @click="viewMode = 'grid'"
          />
          <Button
            icon="pi pi-list"
            :severity="viewMode === 'list' ? 'primary' : 'secondary'"
            text
            @click="viewMode = 'list'"
          />
        </div>
      </div>

      <!-- GRID VIEW -->
      <div v-if="viewMode === 'grid'" class="cp-grid">
        <CountryGridCard
          v-for="c in pagedCountries"
          :key="c.code"
          :country="c"
          @click="navigateTo(c.code)"
        />
      </div>

      <!-- LIST VIEW -->
      <div v-else class="cp-list">
        <CountryListRow
          v-for="c in pagedCountries"
          :key="c.code"
          :country="c"
          @click="navigateTo(c.code)"
        />
      </div>

      <!-- Paginator -->
      <div ref="paginatorEl" style="margin-top: 24px">
        <Paginator
          v-model:first="pageFirst"
          :rows="pageSize"
          :totalRecords="filteredCountries.length"
          :rowsPerPageOptions="[]"
          @page="onPageChange"
        />
      </div>
    </template>

    <!-- Nationality guard dialog -->
    <Dialog v-model:visible="showNatDialog" :header="$t('countries.dialog.title')" modal style="width: 360px">
      <div style="display: flex; flex-direction: column; gap: 16px; padding-top: 4px">
        <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary)">
          {{ $t('countries.dialog.subtitle') }}
        </p>
        <NationalitySelector v-model="dialogNationality" />
        <Button :label="$t('common.buttons.continue')" :disabled="!dialogNationality" @click="confirmNat" style="width: 100%" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useCountriesList, type CountryStat } from '~/composables/useCountriesList'

const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.countries.title'),
  description: () => t('seo.countries.description'),
  ogTitle: () => t('seo.countries.title'),
  ogDescription: () => t('seo.countries.description'),
  ogImage: 'https://nationview.app/og/countries.png',
  ogUrl: 'https://nationview.app/countries',
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

// Filters — pre-fill from URL query params
const search = ref((route.query.search as string) || '')
const region = ref((route.query.region as string) || '')
const category = ref((route.query.category as string) || '')
const sort = ref((route.query.sort as string) || 'popular')

function resetFilters() {
  search.value = ''
  region.value = ''
  category.value = ''
  sort.value = 'popular'
}

const { countries, pending } = useCountriesList()
const { getCountryNameLocalized } = useLocalizedCountries()

// Sync filters back to URL so links are shareable
watch([search, region, category, sort], () => {
  const query: Record<string, string> = {}
  if (search.value)          query.search   = search.value
  if (region.value)          query.region   = region.value
  if (category.value)        query.category = category.value
  if (sort.value !== 'popular') query.sort  = sort.value
  router.replace({ query })
})

// Client-side filtering + sorting
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

  switch (sort.value) {
    case 'rating_desc': list = [...list].sort((a, b) => b.avgRating - a.avgRating); break
    case 'rating_asc':  list = [...list].sort((a, b) => a.avgRating - b.avgRating); break
    case 'reviews_desc': list = [...list].sort((a, b) => b.totalReviews - a.totalReviews); break
    case 'popular':
    default: list = [...list].sort((a, b) => b.totalReviews - a.totalReviews); break
  }

  return list
})

// Pagination
const viewMode = ref<'grid' | 'list'>('grid')
const pageFirst = ref(0)
const pageSize = computed(() => viewMode.value === 'grid' ? 24 : 30)

const pagedCountries = computed(() =>
  filteredCountries.value.slice(pageFirst.value, pageFirst.value + pageSize.value)
)

// Reset page when filters change
watch([search, region, category, sort], () => { pageFirst.value = 0 })

const paginatorEl = ref<HTMLElement | null>(null)
function onPageChange() {
  nextTick(() => {
    paginatorEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

// Navigation with nationality guard
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

<style scoped>
.cp-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px;
  min-height: 100vh;
}
.cp-header {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.cp-header-left { flex: 1; min-width: 0; }
.cp-h1 { font-size: 24px; font-weight: 600; margin: 0 0 4px; color: var(--color-text); }
.cp-sub { font-size: 14px; color: var(--color-text-secondary); margin: 0; }
.cp-header-right { flex-shrink: 0; }

.cp-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.cp-toolbar-count { font-size: 13px; color: var(--color-text-muted); }
.cp-view-toggle { display: flex; gap: 4px; }
.cp-view-btn {
  width: 32px; height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: #fff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-muted);
  transition: all 0.15s;
  font-size: 14px;
}
.cp-view-btn.active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.cp-view-btn:hover:not(.active) { background: var(--color-bg-secondary); }

.cp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.cp-list {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

@media (max-width: 900px) {
  .cp-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .cp-page { padding: 16px; }
  .cp-grid { grid-template-columns: 1fr; }
  .cp-header { padding: 16px; }
  .cp-header-right { width: 100%; }
}
</style>
