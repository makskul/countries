<template>
  <div class="cp-page">

    <!-- BREADCRUMB -->
    <div class="breadcrumb">
      <NuxtLinkLocale to="/" class="bc-link">{{ $t('nav.breadcrumbs.home') }}</NuxtLinkLocale>
      <span class="bc-sep">→</span>
      <NuxtLinkLocale to="/countries" class="bc-link">{{ $t('nav.breadcrumbs.countries') }}</NuxtLinkLocale>
      <span class="bc-sep">→</span>
      <span class="bc-current">{{ countryName }}</span>
    </div>

    <!-- COUNTRY HEADER -->
    <div class="country-header">
      <div class="ch-body">
        <div class="ch-left">
          <span class="ch-flag">{{ flag }}</span>
          <div>
            <h1 class="ch-title">{{ countryName }}</h1>
            <div class="ch-meta">
              <span class="ch-region-pill">{{ $t(`countries.filters.regions.${region}`) }}</span>
              <span class="ch-nat-badge" v-if="nationality">
                {{ getFlagEmoji(nationality) }} {{ $t('country.header.reviewsBy') }} {{ getCountryNameLocalized(nationality) }}
              </span>
            </div>
          </div>
        </div>
        <div class="ch-right" v-if="headerStats">
          <span class="ch-avg-score">{{ headerStats.overallAvg }}</span>
          <Rating :modelValue="headerStats.overallAvg" readonly :cancel="false" :stars="5" />
          <span class="ch-avg-label">{{ $t('country.header.overallRating') }}</span>
        </div>
      </div>

      <!-- Stat pills -->
      <div class="ch-pills" v-if="headerStats">
        <div class="ch-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {{ $t('country.header.totalReviews', { count: headerStats.total }) }}
        </div>
        <div class="ch-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {{ $t('country.header.ratedBy', { count: headerStats.total }) }}
        </div>
        <div class="ch-pill" v-if="headerStats.lastReviewAt">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          {{ $t('country.header.lastReview', { time: timeAgo(headerStats.lastReviewAt) }) }}
        </div>
      </div>
      <div v-else-if="pending" class="ch-pills">
        <Skeleton v-for="i in 3" :key="i" width="140px" height="28px" style="border-radius: 999px" />
      </div>
    </div>

    <!-- TABS BAR -->
    <div class="tabs-bar">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >{{ tab.label }}</button>
    </div>

    <!-- PAGE BODY -->
    <div class="page-body">

      <!-- MAIN COLUMN -->
      <div class="main-col">

        <!-- Empty state -->
        <div v-if="!pending && headerStats && headerStats.total === 0" class="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <h3 class="empty-h3">{{ $t('country.empty.title') }}</h3>
          <p class="empty-p">{{ $t('country.empty.subtitle', { country: countryName }) }}</p>
          <NuxtLinkLocale :to="`/review/new?country=${slug.toUpperCase()}`">
            <button class="empty-btn">{{ $t('country.empty.cta') }}</button>
          </NuxtLinkLocale>
        </div>

        <template v-else-if="nationality">
          <!-- Nat filter notice -->
          <NatFilterNotice :nationality="nationality" @change="showNatDialog = true" />

          <!-- Category scores -->
          <CategoryScoresCard :stats="catStats" :pending="pending" />

          <!-- Reviews section -->
          <div class="reviews-section">
            <div class="rs-header">
              <div>
                <span class="section-label">{{ $t('country.reviews.sectionLabel') }}</span>
                <h2 class="rs-title">{{ $t('country.reviews.title') }}</h2>
              </div>
            </div>

            <div v-if="pending && (!pagedReviews || pagedReviews.length === 0)">
              <Skeleton v-for="i in 3" :key="i" height="110px" style="margin-bottom: 10px; border-radius: var(--radius-lg)" />
            </div>

            <ReviewCard
              v-for="review in pagedReviews"
              :key="review.id"
              :review="review"
            />

            <div v-if="hasMore" class="load-more">
              <button class="load-more-btn" @click="loadMore" :disabled="pending">
                {{ pending ? $t('common.labels.loading') : $t('country.reviews.loadMore') }}
              </button>
            </div>
          </div>
        </template>

        <div v-else class="no-nat-state">
          <p>{{ $t('country.noNat.message') }}</p>
          <button class="empty-btn" @click="showNatDialog = true">{{ $t('country.noNat.cta') }}</button>
        </div>
      </div>

      <!-- SIDEBAR -->
      <CountrySidebar
        :countryCode="slug.toUpperCase()"
        :nationality="nationality"
        :similar="similarCountries"
      />
    </div>

    <!-- Nationality dialog -->
    <Dialog v-model:visible="showNatDialog" :header="$t('country.dialog.title')" modal style="width: 360px">
      <div style="display: flex; flex-direction: column; gap: 16px; padding-top: 4px">
        <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary)">
          {{ $t('country.dialog.subtitle') }}
        </p>
        <NationalitySelector v-model="dialogNationality" />
        <Button :label="$t('country.dialog.apply')" :disabled="!dialogNationality" @click="applyNationality" style="width: 100%" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { getFlagEmoji, timeAgo } from '~/utils/countries'
import { getRegion } from '~/utils/regions'
import { useCountryPage } from '~/composables/useCountryPage'
import { getNationalityName } from '~/utils/nationalities'

const route = useRoute()
const router = useRouter()
const store = useUserStore()
const { t } = useI18n()
const { getCountryNameLocalized } = useLocalizedCountries()

onMounted(() => {
  store.loadFromStorage()
  // honour ?nat query param
  const natParam = route.query.nat as string | undefined
  if (natParam && natParam !== store.nationality) {
    store.setNationality(natParam)
  }
  if (!store.nationality) {
    showNatDialog.value = true
  }
})

const slug = computed(() => (route.params.slug as string).toUpperCase())
const nationality = computed(() => store.nationality)
const countryName = computed(() => getCountryNameLocalized(slug.value))
const flag = computed(() => getFlagEmoji(slug.value))
const region = computed(() => getRegion(slug.value))

const countryFlag = computed(() => getFlagEmoji(slug.value))

useSeoMeta({
  title: () => `${countryFlag.value} ${countryName.value} — ${t('seo.country.reviewsOf')} ${getNationalityName(nationality.value)}`,
  description: () => t('seo.country.description', { nationality: getNationalityName(nationality.value), country: countryName.value }),
  ogTitle: () => `${countryName.value} — ${getNationalityName(nationality.value)}`,
  ogDescription: () => t('seo.country.description', { nationality: getNationalityName(nationality.value), country: countryName.value }),
  ogImage: 'https://nationview.app/og/home.png',
  ogUrl: () => `https://nationview.app/country/${slug.value.toLowerCase()}`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: computed(() => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${countryName.value} — отзывы эмигрантов`,
      description: `Реальные отзывы о жизни в ${countryName.value}`,
      url: `https://nationview.app/country/${slug.value.toLowerCase()}`,
    })).value,
  }],
})

const {
  rows,
  catStats,
  overallAvg,
  headerStats,
  pending,
  pagedReviews,
  hasMore,
  loadMore,
  similarCountries,
  markHelpful,
} = useCountryPage(slug, nationality)

// Tabs
const TABS = computed(() => [
  { key: 'overview', label: t('country.tabs.overview') },
  { key: 'legalization', label: t('country.tabs.legalization') },
  { key: 'cost_of_living', label: t('country.tabs.cost') },
  { key: 'safety', label: t('country.tabs.safety') },
  { key: 'attitude', label: t('country.tabs.attitude') },
  { key: 'bureaucracy', label: t('country.tabs.documents') },
  { key: 'weather', label: t('country.tabs.weather') },
  { key: 'all', label: t('country.tabs.allReviews') },
])
const activeTab = ref('overview')

// Nationality dialog
const showNatDialog = ref(false)
const dialogNationality = ref('')

function applyNationality() {
  if (!dialogNationality.value) return
  store.setNationality(dialogNationality.value)
  showNatDialog.value = false
}
</script>

<style scoped>
.cp-page { background: var(--color-bg-secondary); min-height: 100vh; }

/* Breadcrumb */
.breadcrumb {
  background: var(--color-bg-secondary);
  padding: 12px 24px;
  font-size: 12px;
  display: flex; align-items: center; gap: 6px;
}
.bc-link { color: var(--color-primary); text-decoration: none; }
.bc-link:hover { text-decoration: underline; }
.bc-sep { color: var(--color-text-muted); }
.bc-current { color: var(--color-text-secondary); }

/* Country header */
.country-header {
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  padding: 20px 24px;
}
.ch-body { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 14px; }
.ch-left { display: flex; align-items: flex-start; gap: 14px; }
.ch-flag { font-size: 44px; line-height: 1; flex-shrink: 0; }
.ch-title { font-size: 22px; font-weight: 700; color: var(--color-text); margin: 0 0 6px; }
.ch-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ch-region-pill { font-size: 11px; background: var(--color-bg-tertiary); color: var(--color-text-muted); border-radius: var(--radius-pill); padding: 2px 8px; }
.ch-nat-badge { font-size: 11px; font-weight: 500; background: var(--color-primary-light); color: var(--color-primary-dark); border-radius: var(--radius-pill); padding: 2px 8px; }
.ch-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.ch-avg-score { font-size: 32px; font-weight: 700; color: var(--color-primary); line-height: 1; }
.ch-avg-label { font-size: 11px; color: var(--color-text-muted); }
.ch-pills { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ch-pill {
  display: flex; align-items: center; gap: 5px;
  background: var(--color-bg-secondary); border: 1px solid var(--color-border);
  border-radius: var(--radius-pill); padding: 5px 12px;
  font-size: 12px; color: var(--color-text-secondary);
}

/* Tabs */
.tabs-bar {
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  padding: 0 24px;
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
}
.tabs-bar::-webkit-scrollbar { display: none; }
.tab-btn {
  padding: 12px 16px;
  font-size: 13px; font-weight: 500;
  color: var(--color-text-muted);
  background: none; border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer; white-space: nowrap;
  font-family: inherit;
  transition: color 0.15s, border-color 0.15s;
  margin-bottom: -1px;
}
.tab-btn.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
.tab-btn:hover:not(.active) { color: var(--color-text-secondary); }

/* Page body */
.page-body {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 14px;
  padding: 16px 24px;
  align-items: start;
  max-width: 1200px;
  margin: 0 auto;
}

/* Reviews section */
.reviews-section { }
.rs-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.section-label { display: block; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); margin-bottom: 2px; }
.rs-title { font-size: 15px; font-weight: 600; color: var(--color-text); margin: 0; }

/* Load more */
.load-more { text-align: center; margin-top: 4px; }
.load-more-btn { background: none; border: none; font-size: 13px; font-weight: 500; color: var(--color-primary); cursor: pointer; font-family: inherit; padding: 8px; }
.load-more-btn:hover { text-decoration: underline; }
.load-more-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Empty / no-nat state */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 48px 24px;
  background: #fff; border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}
.empty-h3 { font-size: 16px; font-weight: 600; color: var(--color-text); margin: 0 0 8px; }
.empty-p { font-size: 14px; color: var(--color-text-secondary); margin: 0 0 20px; }
.empty-btn {
  background: var(--color-primary); color: #fff; border: none;
  border-radius: var(--radius-md); padding: 10px 22px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: background 0.15s;
}
.empty-btn:hover { background: var(--color-primary-hover); }
.no-nat-state { text-align: center; padding: 32px 24px; background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-lg); }

/* Responsive */
@media (max-width: 768px) {
  .page-body { grid-template-columns: 1fr; }
  .ch-body { gap: 10px; }
  .ch-flag { font-size: 32px; }
  .ch-avg-score { font-size: 24px; }
}
</style>
