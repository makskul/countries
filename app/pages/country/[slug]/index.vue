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
            <h1 class="ch-title">{{ pageH1 }}</h1>
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
          {{ $t('country.header.lastReview', { time: timeAgo(headerStats.lastReviewAt, locale) }) }}
        </div>
      </div>
      <div v-else-if="pending" class="ch-pills">
        <Skeleton v-for="i in 3" :key="i" width="140px" height="28px" style="border-radius: 999px" />
      </div>
    </div>

    <!-- Write-first banner when no reviews for selected nationality -->
    <WriteFirstBanner
      v-if="showWriteFirstBanner"
      :country-code="slug"
      :nationality-code="nationality"
      :campaign="isCampaignCountry"
    />

    <!-- TABS BAR -->
    <div class="tabs-bar">
      <button
        class="tab-btn active"
      >{{ $t('country.tabs.countryOverview') }}</button>

      <button
        v-for="city in (citiesWithReviews ?? []).slice(0, 4)"
        :key="city.city_id"
        class="tab-btn"
        @click="navigateTo(localePath(`/country/${slug.toLowerCase()}/${city.slug}`))"
      >{{ getCityDisplayName(city) }}</button>

      <button
        v-if="(citiesWithReviews ?? []).length > 4"
        class="tab-btn tab-btn--more"
        @click="showAllCitiesDialog = true"
      >+ {{ $t('country.tabs.allCities') }}</button>
    </div>

    <!-- PAGE BODY -->
    <div class="page-body">

      <!-- MAIN COLUMN -->
      <div class="main-col">

        <CountryHubSection
          v-if="isHubCountry"
          :country-code="slug"
          :country-name="countryName"
          :article="countryArticle"
          :header-stats="headerStats"
          :cat-stats="catStats"
          :featured-reviews="featuredHubReviews"
          :pending="pending"
          :nat-query="landingNat || nationality || ''"
        />

        <ContentArticle
          v-else-if="countryArticle"
          :section-label="$t('country.article.aboutCountry')"
          :title="countryArticle.title"
          :excerpt="countryArticle.excerpt"
          :body="countryArticle.body"
        />

        <!-- No reviews at all -->
        <div v-if="!pending && !countryHasAnyReviews" class="empty-state empty-state--prominent">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <h3 class="empty-h3">{{ $t('country.empty.title') }}</h3>
          <p class="empty-p">{{ $t('country.empty.subtitle', { country: countryName }) }}</p>
          <NuxtLinkLocale :to="`/review/new?country=${slug}`" class="empty-btn">{{ $t('country.empty.cta') }}</NuxtLinkLocale>
        </div>

        <template v-else>
          <!-- Nationality filter notice / selector -->
          <NatFilterNotice
            v-if="nationality"
            :nationality="nationality"
            @change="showNatDialog = true"
          />
          <div v-else class="no-nat-bar">
            <span style="font-size: 13px; color: var(--color-text-secondary)">{{ $t('country.noNat.message') }}</span>
            <button class="no-nat-btn" @click="showNatDialog = true">{{ $t('country.noNat.cta') }}</button>
          </div>

          <!-- No reviews for this nationality: two action buttons + write CTA -->
          <div v-if="nationality && natReviewsCount === 0 && !pending && !showAllOverride" class="nat-empty-block">
            <div class="nat-empty-notice">
              <span>{{ $t('country.empty.title') }}</span>
              <div class="nat-empty-actions">
                <button class="nat-action-btn nat-action-btn--secondary" @click="showNatDialog = true">
                  {{ $t('country.natFilter.change') }}
                </button>
                <button class="nat-action-btn nat-action-btn--primary" @click="showAllOverride = true">
                  🌍 {{ $t('country.dialog.showAll') }}
                </button>
              </div>
            </div>
            <div class="nat-empty-cta">
              <p class="nat-empty-cta-text">{{ $t('country.empty.subtitle', { country: countryName }) }}</p>
              <NuxtLinkLocale :to="`/review/new?country=${slug}`" class="empty-btn">
                {{ $t('country.empty.cta') }}
              </NuxtLinkLocale>
            </div>
          </div>

          <!-- Override active: showing all nationalities -->
          <div v-if="showAllOverride && nationality" class="nat-override-bar">
            <span>🌍 {{ $t('country.dialog.showAll') }}</span>
            <button class="nat-override-close" @click="showAllOverride = false">
              {{ $t('country.natFilter.change') }} ×
            </button>
          </div>

          <!-- Category scores — hide when no reviews for this nationality -->
          <CategoryScoresCard
            v-if="natReviewsCount > 0 || showAllOverride || !nationality"
            :stats="catStats"
            :pending="pending"
          />

          <!-- Lead form when legalization score is low -->
          <LeadForm
            v-if="showLeadForm"
            :country-code="slug"
            :nationality-code="nationality"
          />

          <!-- Cities with reviews block -->
          <div v-if="citiesWithReviews && citiesWithReviews.length" class="cities-block">
            <div class="cities-block-header">
              <span class="section-label">{{ $t('country.cityView.citiesWithReviews') }}</span>
            </div>
            <div class="cities-grid">
              <div
                v-for="city in citiesWithReviews"
                :key="city.city_id"
                class="city-stat-card"
                @click="navigateTo(localePath(`/country/${slug.toLowerCase()}/${city.slug}`))"
              >
                <div class="city-stat-name">{{ getCityDisplayName(city) }}</div>
                <div class="city-stat-meta">
                  <Rating :modelValue="getCityAvgRating(city)" readonly :cancel="false" :stars="5" />
                  <span class="city-stat-count">{{ city.total_reviews }} {{ $t('common.labels.reviews') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Reviews section — hide when no reviews for this nationality -->
          <div v-if="natReviewsCount > 0 || showAllOverride || !nationality" class="reviews-section">
            <div class="rs-header">
              <div>
                <span class="section-label">{{ $t('country.reviews.sectionLabel') }}</span>
                <h2 class="rs-title">{{ $t('country.reviews.title') }}</h2>
              </div>
            </div>

            <div v-if="pending && (!pagedReviews || pagedReviews.length === 0)">
              <Skeleton v-for="i in 3" :key="i" height="110px" style="margin-bottom: 10px; border-radius: var(--radius-lg)" />
            </div>

            <div class="reviews-list">
              <ReviewCard
                v-for="review in pagedReviews"
                :key="review.id"
                :review="review"
              />
            </div>

            <div v-if="hasMore" class="load-more">
              <button class="load-more-btn" @click="loadMore" :disabled="pending">
                {{ pending ? $t('common.labels.loading') : $t('country.reviews.loadMore') }}
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- SIDEBAR -->
      <CountrySidebar
        :countryCode="slug"
        :nationality="nationality"
        :similar="similarCountries"
        :write-first-highlight="showWriteFirstBanner"
      />
    </div>

    <!-- All cities dialog -->
    <Dialog v-model:visible="showAllCitiesDialog" :header="$t('country.cityView.citiesWithReviews')" modal style="width: 400px">
      <div
        v-for="city in citiesWithReviews"
        :key="city.city_id"
        @click="navigateTo(localePath(`/country/${slug.toLowerCase()}/${city.slug}`)); showAllCitiesDialog = false"
        style="padding: 10px 0; border-bottom: 1px solid var(--color-border); cursor: pointer; display: flex; justify-content: space-between; align-items: center;"
      >
        <span style="font-size: 13px; font-weight: 600;">{{ getCityDisplayName(city) }}</span>
        <span style="font-size: 12px; color: var(--color-text-muted)">
          {{ city.total_reviews }} {{ $t('common.labels.reviews') }} · ★ {{ getCityAvgRating(city) }}
        </span>
      </div>
    </Dialog>

    <!-- Nationality dialog -->
    <Dialog v-model:visible="showNatDialog" :header="$t('country.dialog.title')" modal style="width: 360px">
      <div style="display: flex; flex-direction: column; gap: 12px; padding-top: 4px">
        <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary)">
          {{ $t('country.dialog.subtitle') }}
        </p>
        <NationalitySelector v-model="dialogNationality" />
        <Button :label="$t('country.dialog.apply')" :disabled="!dialogNationality" @click="applyNationality" style="width: 100%" />
        <button class="show-all-btn" @click="showAllNationalities">
          🌍 {{ $t('country.dialog.showAll') }}
        </button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { APP_NAME, APP_URL } from '~/utils/appConfig'
import { getFlagEmoji, timeAgo, isDestinationAllowed } from '~/utils/countries'
import { getRegion } from '~/utils/regions'
import { useCountryPage } from '~/composables/useCountryPage'
import { isEmptyStateCampaignCountry } from '~/data/emptyStateCampaign'
import { isContentHubCountry } from '~/data/contentHubCountries'

const route = useRoute()
const router = useRouter()
const store = useUserStore()
const { t, locale } = useI18n()
const { getCountryNameLocalized } = useLocalizedCountries()

const pageCountryCode = (route.params.slug as string).toUpperCase()
if (!isDestinationAllowed(pageCountryCode)) {
  throw createError({ statusCode: 404, statusMessage: 'Country not found' })
}

function getCityDisplayName(city: any): string {
  if (locale.value === 'uk' && city.name_uk) return city.name_uk
  if (locale.value === 'ru' && city.name_ru) return city.name_ru
  return city.name_en ?? city.city_name
}

// Average of all category fields (excluding 'overall') — same logic as country detail
function getCityAvgRating(city: any): number {
  const vals = [
    city.avg_legalization, city.avg_cost_of_living, city.avg_safety,
    city.avg_bureaucracy, city.avg_weather, city.avg_language_barrier,
    city.avg_cleanliness, city.avg_healthcare,
  ].filter((v: any) => v !== null && v !== undefined).map(Number)
  if (!vals.length) return Number(city.avg_overall) || 0
  return Math.round((vals.reduce((a: number, b: number) => a + b, 0) / vals.length) * 10) / 10
}

onMounted(() => {
  store.loadFromStorage()
  if (!store.nationality && !landingNat.value) {
    showNatDialog.value = true
  }
  // Read city from store (set by homepage city card)
  if (store.selectedCityId) {
    selectedCityId.value = store.selectedCityId
    store.setSelectedCity(null)
  }
})

const slug = computed(() => (route.params.slug as string).toUpperCase())
const landingNat = computed(() => {
  const q = route.query.nat as string | undefined
  return q?.trim().toUpperCase() || ''
})
const nationality = computed(() => store.nationality)
const countryName = computed(() => getCountryNameLocalized(slug.value))
const pageH1 = computed(() => {
  if (landingNat.value) {
    return t('seo.countryNat.h1', {
      country: countryName.value,
      nationality: t(`nationalities.${landingNat.value}.genitive`),
    })
  }
  return countryName.value
})
const flag = computed(() => getFlagEmoji(slug.value))
const region = computed(() => getRegion(slug.value))

const countryFlag = computed(() => getFlagEmoji(slug.value))

const natGenitive = computed(() =>
  nationality.value ? t(`nationalities.${nationality.value}.genitive`) : ''
)

const { article: countryArticle, row: countryRow } = useCountryMetaData(slug)

const defaultSeoTitle = computed(() =>
  `${countryFlag.value} ${countryName.value} — ${t('seo.country.reviewsOf')} ${natGenitive.value}`,
)
const defaultSeoDescription = computed(() =>
  t('seo.country.description', { nationality: natGenitive.value, country: countryName.value }),
)

const natLandingSeoTitle = computed(() => {
  if (!landingNat.value) return ''
  return t('seo.countryNat.title', {
    country: countryName.value,
    nationality: t(`nationalities.${landingNat.value}.genitive`),
  })
})

const natLandingSeoDescription = computed(() => {
  if (!landingNat.value) return ''
  return t('seo.countryNat.description', {
    country: countryName.value,
    nationality: t(`nationalities.${landingNat.value}.genitive`),
  })
})

const seoTitle = computed(() => {
  if (landingNat.value) return natLandingSeoTitle.value
  const row = countryRow.value
  if (!row) return defaultSeoTitle.value
  const custom = locale.value === 'uk'
    ? row.seo_title_uk
    : locale.value === 'ru'
      ? row.seo_title_ru
      : row.seo_title_en
  return (custom || row.seo_title_en || row.seo_title_uk || row.seo_title_ru || '').trim() || defaultSeoTitle.value
})

const seoDescription = computed(() => {
  if (landingNat.value) return natLandingSeoDescription.value
  const row = countryRow.value
  if (!row) return defaultSeoDescription.value
  const custom = locale.value === 'uk'
    ? row.seo_description_uk
    : locale.value === 'ru'
      ? row.seo_description_ru
      : row.seo_description_en
  return (custom || row.seo_description_en || row.seo_description_uk || row.seo_description_ru || '').trim()
    || defaultSeoDescription.value
})

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogImage: APP_URL + '/og/home.png',
  ogUrl: () => `${APP_URL}/country/${slug.value.toLowerCase()}`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{
    rel: 'canonical',
    href: computed(() => `${APP_URL}/country/${slug.value.toLowerCase()}`),
  }],
  script: [{
    type: 'application/ld+json',
    innerHTML: computed(() => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: seoTitle.value,
      description: seoDescription.value,
      url: `${APP_URL}/country/${slug.value.toLowerCase()}`,
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
  selectedCityId,
  citiesWithReviews,
  natReviewsCount,
  showAllOverride,
  countryHasAnyReviews,
} = useCountryPage(slug, nationality)

const isHubCountry = computed(() =>
  isContentHubCountry(slug.value)
  && (landingNat.value === 'UA' || nationality.value === 'UA'),
)

const featuredHubReviews = computed(() => (pagedReviews.value ?? []).slice(0, 3))

const showWriteFirstBanner = computed(() =>
  !!nationality.value
  && natReviewsCount.value === 0
  && !showAllOverride.value
  && !pending.value
  && countryHasAnyReviews.value
)

const isCampaignCountry = computed(() =>
  isEmptyStateCampaignCountry(slug.value, nationality.value)
)

const showLeadForm = computed(() => {
  if (pending.value || !nationality.value || showAllOverride.value) return false
  if (natReviewsCount.value === 0) return false
  const leg = catStats.value?.find(c => c.category === 'legalization')
  return leg?.avg != null && leg.avg < 3
})

const showAllCitiesDialog = ref(false)
const localePath = useLocalePath()

// Nationality dialog
const showNatDialog = ref(false)
const dialogNationality = ref('')

function applyNationality() {
  if (!dialogNationality.value) return
  store.setNationality(dialogNationality.value)
  showNatDialog.value = false
}

function showAllNationalities() {
  store.setNationality('')
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
.reviews-list { display: flex; flex-direction: column; gap: 12px; }
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
.empty-state--prominent {
  background: linear-gradient(180deg, #F8F7FC 0%, #fff 100%);
  border: 1.5px solid #C8BFE8;
  padding: 56px 32px;
}
.empty-state--prominent .empty-btn {
  padding: 13px 28px;
  font-size: 14px;
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
.no-nat-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  background: var(--color-bg-secondary); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 14px;
}
.no-nat-btn {
  background: var(--color-primary); color: #fff; border: none;
  border-radius: var(--radius-pill); padding: 6px 14px;
  font-size: 12px; font-weight: 500; cursor: pointer; font-family: inherit;
  white-space: nowrap;
}
.no-nat-btn:hover { background: var(--color-primary-hover); }
.nat-empty-block { margin-bottom: 14px; }
.nat-empty-notice {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  background: var(--color-warning-light); border: 1px solid #e8c97a;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  padding: 12px 14px;
  font-size: 13px; color: var(--color-warning); flex-wrap: wrap;
}
.nat-empty-cta {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  background: #fff; border: 1px solid var(--color-border); border-top: none;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  padding: 12px 14px; flex-wrap: wrap;
}
.nat-empty-cta-text { font-size: 13px; color: var(--color-text-secondary); margin: 0; }
.nat-empty-actions { display: flex; gap: 8px; flex-shrink: 0; }
.nat-action-btn {
  border-radius: var(--radius-md); padding: 7px 14px;
  font-size: 12px; font-weight: 500; cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: background 0.15s;
}
.nat-action-btn--secondary {
  background: #fff; border: 1px solid var(--color-border); color: var(--color-text-secondary);
}
.nat-action-btn--secondary:hover { background: var(--color-bg-secondary); }
.nat-action-btn--primary {
  background: var(--color-primary); border: none; color: #fff;
}
.nat-action-btn--primary:hover { background: var(--color-primary-hover); }
.nat-override-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  background: var(--color-primary-light); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 14px;
  font-size: 13px; color: var(--color-primary-dark);
}
.nat-override-close {
  background: none; border: none; cursor: pointer; font-size: 12px;
  color: var(--color-primary); font-weight: 500; padding: 0; font-family: inherit;
}
.nat-override-close:hover { text-decoration: underline; }
.show-all-btn {
  background: none; border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: 9px;
  font-size: 13px; color: var(--color-text-secondary);
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.show-all-btn:hover { background: var(--color-bg-secondary); }

/* City view */
.city-back {
  font-size: 13px; color: var(--color-primary);
  cursor: pointer; margin-bottom: 12px; display: inline-block;
}
.city-back:hover { text-decoration: underline; }
.city-view-header {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 14px; padding: 14px 16px;
  background: #fff; border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}
.cities-block { margin-bottom: 14px; }
.cities-block-header { margin-bottom: 8px; }
.cities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.city-stat-card {
  background: #fff; border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: 10px 12px;
  cursor: pointer; transition: box-shadow 0.15s;
}
.city-stat-card:hover { box-shadow: var(--shadow-card); }
.city-stat-name { font-size: 13px; font-weight: 600; color: var(--color-text); margin-bottom: 4px; }
.city-stat-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.city-stat-count { font-size: 11px; color: var(--color-text-muted); }

/* Responsive */
@media (max-width: 768px) {
  .page-body { grid-template-columns: 1fr; }
  .ch-body { gap: 10px; }
  .ch-flag { font-size: 32px; }
  .ch-avg-score { font-size: 24px; }
}
@media (max-width: 600px) { .cities-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
