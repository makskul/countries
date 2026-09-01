<template>
  <div class="cp-page">

    <!-- BREADCRUMB -->
    <div class="breadcrumb">
      <NuxtLinkLocale to="/" class="bc-link">{{ $t('nav.breadcrumbs.home') }}</NuxtLinkLocale>
      <span class="bc-sep">→</span>
      <NuxtLinkLocale to="/countries" class="bc-link">{{ $t('nav.breadcrumbs.countries') }}</NuxtLinkLocale>
      <span class="bc-sep">→</span>
      <NuxtLinkLocale :to="`/country/${slug.toLowerCase()}`" class="bc-link">{{ countryName }}</NuxtLinkLocale>
      <span class="bc-sep">→</span>
      <span class="bc-current">{{ cityName }}</span>
    </div>

    <!-- CITY HEADER -->
    <div class="country-header">
      <div class="ch-body">
        <div class="ch-left">
          <span class="ch-flag">{{ flag }}</span>
          <div>
            <h1 class="ch-title">{{ countryName }}, {{ cityName }}</h1>
            <div class="ch-meta">
              <span class="ch-region-pill">{{ $t(`countries.filters.regions.${region}`) }}</span>
              <span class="ch-nat-badge" v-if="nationality">
                {{ getFlagEmoji(nationality) }} {{ $t('country.header.reviewsBy') }} {{ getCountryNameLocalized(nationality) }}
              </span>
            </div>
          </div>
        </div>
        <div class="ch-right" v-if="overallAvg">
          <span class="ch-avg-score">{{ overallAvg }}</span>
          <Rating :modelValue="overallAvg" readonly :cancel="false" :stars="5" />
          <span class="ch-avg-label">{{ $t('country.header.overallRating') }}</span>
        </div>
      </div>
      <div class="ch-pills" v-if="totalReviews">
        <div class="ch-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {{ $t('country.header.totalReviews', { count: totalReviews }) }}
        </div>
      </div>
    </div>

    <WriteFirstBanner
      v-if="showWriteFirstBanner"
      :country-code="slug"
      :nationality-code="nationality"
      :campaign="isCampaignCountry"
    />

    <!-- TABS BAR -->
    <div class="tabs-bar">
      <button class="tab-btn" @click="navigateTo(localePath(`/country/${slug.toLowerCase()}`))">
        {{ $t('country.tabs.countryOverview') }}
      </button>

      <button
        v-for="city in (citiesWithReviews ?? []).slice(0, 4)"
        :key="city.city_id"
        class="tab-btn"
        :class="{ active: city.slug === citySlug }"
        @click="city.slug !== citySlug && navigateTo(localePath(`/country/${slug.toLowerCase()}/${city.slug}`))"
      >{{ getCityDisplayName(city) }}</button>

      <button
        v-if="(citiesWithReviews ?? []).length > 4"
        class="tab-btn tab-btn--more"
        @click="showAllCitiesDialog = true"
      >+ {{ $t('country.tabs.allCities') }}</button>
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
          {{ city.total_reviews }} {{ $t('common.labels.reviews') }} · ★ {{ city.avg_overall }}
        </span>
      </div>
    </Dialog>

    <!-- PAGE BODY -->
    <div class="page-body">
      <div class="main-col">
        <ContentArticle
          v-if="cityArticle"
          :section-label="$t('country.article.aboutCity')"
          :title="cityArticle.title"
          :excerpt="cityArticle.excerpt"
          :body="cityArticle.body"
        />

        <!-- No reviews at all for this city -->
        <div v-if="!pending && totalReviews === 0 && !nationality" class="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <h3 class="empty-h3">{{ $t('country.empty.title') }}</h3>
          <p class="empty-p">{{ $t('country.empty.subtitle', { country: cityName }) }}</p>
          <NuxtLinkLocale :to="`/review/new?country=${slug}`" class="empty-btn">{{ $t('country.empty.cta') }}</NuxtLinkLocale>
        </div>

        <template v-else>
          <NatFilterNotice v-if="nationality" :nationality="nationality" @change="showNatDialog = true" />

          <!-- No reviews for this nationality in this city -->
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
              <p class="nat-empty-cta-text">{{ $t('country.empty.subtitle', { country: cityName }) }}</p>
              <NuxtLinkLocale :to="`/review/new?country=${slug}`" class="empty-btn">
                {{ $t('country.empty.cta') }}
              </NuxtLinkLocale>
            </div>
          </div>

          <!-- Override active -->
          <div v-if="showAllOverride && nationality" class="nat-override-bar">
            <span>🌍 {{ $t('country.dialog.showAll') }}</span>
            <button class="nat-override-close" @click="showAllOverride = false">
              {{ $t('country.natFilter.change') }} ×
            </button>
          </div>

          <CategoryScoresCard
            v-if="natReviewsCount > 0 || showAllOverride || !nationality"
            :stats="catStats"
            :pending="pending"
          />
          <div v-if="natReviewsCount > 0 || showAllOverride || !nationality" class="reviews-section">
            <div class="rs-header">
              <div>
                <span class="section-label">{{ $t('country.reviews.sectionLabel') }}</span>
                <h2 class="rs-title">{{ $t('country.reviews.title') }}</h2>
              </div>
            </div>
            <div v-if="pending">
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
              <button class="load-more-btn" @click="loadMore">
                {{ $t('country.reviews.loadMore') }}
              </button>
            </div>
          </div>
        </template>
      </div>

      <CountrySidebar
        :countryCode="slug"
        :nationality="nationality"
        :similar="null"
        :write-first-highlight="showWriteFirstBanner"
      />
    </div>

    <!-- Nationality dialog -->
    <Dialog v-model:visible="showNatDialog" :header="$t('country.dialog.title')" modal style="width: 360px">
      <div style="display: flex; flex-direction: column; gap: 12px; padding-top: 4px">
        <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary)">{{ $t('country.dialog.subtitle') }}</p>
        <NationalitySelector v-model="dialogNationality" />
        <Button :label="$t('country.dialog.apply')" :disabled="!dialogNationality" @click="applyNationality" style="width: 100%" />
        <button class="show-all-btn" @click="store.setNationality(''); showNatDialog = false">
          🌍 {{ $t('country.dialog.showAll') }}
        </button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { APP_NAME, APP_URL } from '~/utils/appConfig'
import { getFlagEmoji } from '~/utils/countries'
import { getRegion } from '~/utils/regions'
import { useCityPage } from '~/composables/useCityPage'
import { isEmptyStateCampaignCountry } from '~/data/emptyStateCampaign'

const route = useRoute()
const store = useUserStore()
const { t, locale } = useI18n()

function getCityDisplayName(city: any): string {
  if (locale.value === 'uk' && city.name_uk) return city.name_uk
  if (locale.value === 'ru' && city.name_ru) return city.name_ru
  return city.name_en ?? city.city_name
}
const { getCountryNameLocalized } = useLocalizedCountries()

// Load nationality before composable
store.loadFromStorage()
const natParam = route.query.nat as string | undefined
if (natParam && natParam !== store.nationality) {
  store.setNationality(natParam)
}

onMounted(() => {
  if (!store.nationality) showNatDialog.value = true
})

const slug     = computed(() => (route.params.slug as string).toUpperCase())
const citySlug = computed(() => route.params.city as string)
const nationality = computed(() => store.nationality)

const countryName = computed(() => getCountryNameLocalized(slug.value))
const flag        = computed(() => getFlagEmoji(slug.value))
const region      = computed(() => getRegion(slug.value))

const {
  cityData,
  catStats,
  overallAvg,
  totalReviews,
  pagedReviews,
  hasMore,
  loadMore,
  pending,
  showAllOverride,
  natReviewsCount,
} = useCityPage(slug, citySlug, nationality)

const showWriteFirstBanner = computed(() =>
  !!nationality.value
  && natReviewsCount.value === 0
  && !showAllOverride.value
  && !pending.value
  && totalReviews.value > 0
)

const isCampaignCountry = computed(() =>
  isEmptyStateCampaignCountry(slug.value, nationality.value)
)

// showAllOverride is now from Pinia store (shared with country page)

const cityName = computed(() => {
  if (!cityData.value) return citySlug.value
  const d = cityData.value as any
  if (locale.value === 'uk' && d.name_uk) return d.name_uk
  if (locale.value === 'ru' && d.name_ru) return d.name_ru
  return d.name_en ?? citySlug.value
})

const cityArticle = computed(() => {
  const d = cityData.value as any
  if (!d) return null
  if (d.article_published === false) return null
  const pick = (uk: string | null, en: string | null, ru: string | null) =>
    (locale.value === 'uk' ? uk : locale.value === 'ru' ? ru : en) || en || uk || ru || null
  const title = pick(d.article_title_uk, d.article_title_en, d.article_title_ru)
  const excerpt = pick(d.article_excerpt_uk, d.article_excerpt_en, d.article_excerpt_ru)
  const body = pick(d.article_body_uk, d.article_body_en, d.article_body_ru)
  if (!title && !excerpt && !body) return null
  return { title, excerpt, body }
})

const natGenitive = computed(() =>
  nationality.value ? t(`nationalities.${nationality.value}.genitive`) : ''
)

useSeoMeta({
  title: () => `${cityName.value} · ${countryName.value} — ${t('seo.city.reviewsOf')} ${natGenitive.value}`,
  description: () => t('seo.city.description', { city: cityName.value, country: countryName.value, nationality: natGenitive.value }),
  ogTitle: () => `${cityName.value} · ${countryName.value}`,
  ogImage: APP_URL + '/og/home.png',
  ogUrl: () => `${APP_URL}/country/${slug.value.toLowerCase()}/${citySlug.value}`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

const showNatDialog = ref(false)
const showAllCitiesDialog = ref(false)
const localePath = useLocalePath()
const supabase = useSupabaseClient()

// Cities with reviews for tabs — respects showAllOverride from store
const { data: citiesWithReviews } = useLazyAsyncData(
  () => `cities-${slug.value}-${nationality.value}-${showAllOverride.value}`,
  async () => {
    if (!slug.value) return []
    let statsQuery = supabase
      .from('city_stats')
      .select('city_id, city_name, total_reviews, avg_overall')
      .eq('target_country', slug.value)
      .order('total_reviews', { ascending: false })
    if (nationality.value && !showAllOverride.value) {
      statsQuery = statsQuery.eq('author_nationality', nationality.value)
    }
    const { data: stats } = await statsQuery
    if (!stats?.length) return []
    const cityIds = stats.map((r: any) => r.city_id).filter(Boolean)
    const { data: cities } = await supabase
      .from('cities').select('id, slug, name_en, name_uk, name_ru').in('id', cityIds)
    const cityMap: Record<number, any> = {}
    for (const c of (cities ?? []) as any[]) {
      if (c.slug) cityMap[c.id] = c
    }
    return stats.filter((r: any) => cityMap[r.city_id])
      .map((r: any) => ({ ...r, slug: cityMap[r.city_id].slug, name_en: cityMap[r.city_id].name_en, name_uk: cityMap[r.city_id].name_uk, name_ru: cityMap[r.city_id].name_ru })) as any[]
  },
  { server: false, watch: [slug, nationality, showAllOverride] }
)
const dialogNationality = ref('')

function applyNationality() {
  if (!dialogNationality.value) return
  store.setNationality(dialogNationality.value)
  showNatDialog.value = false
}
</script>

<style scoped>
.cp-page { background: var(--color-bg-secondary); min-height: 100vh; }
.breadcrumb { background: var(--color-bg-secondary); padding: 12px 24px; font-size: 12px; display: flex; align-items: center; gap: 6px; }
.bc-link { color: var(--color-primary); text-decoration: none; }
.bc-link:hover { text-decoration: underline; }
.bc-sep { color: var(--color-text-muted); }
.bc-current { color: var(--color-text-secondary); }
.country-header { background: #fff; border-bottom: 1px solid var(--color-border); padding: 20px 24px; }
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
.ch-pill { display: flex; align-items: center; gap: 5px; background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-pill); padding: 5px 12px; font-size: 12px; color: var(--color-text-secondary); }
.page-body { display: grid; grid-template-columns: 1fr 280px; gap: 14px; padding: 16px 24px; align-items: start; max-width: 1200px; margin: 0 auto; }
.main-col { display: flex; flex-direction: column; gap: 14px; }
.reviews-section { }
.rs-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.section-label { display: block; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); margin-bottom: 2px; }
.rs-title { font-size: 15px; font-weight: 600; color: var(--color-text); margin: 0; }
.reviews-list { display: flex; flex-direction: column; gap: 12px; }
.load-more { text-align: center; margin-top: 4px; }
.load-more-btn { background: none; border: none; font-size: 13px; font-weight: 500; color: var(--color-primary); cursor: pointer; font-family: inherit; padding: 8px; }
.load-more-btn:hover { text-decoration: underline; }
.empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 48px 24px; background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
.empty-h3 { font-size: 16px; font-weight: 600; color: var(--color-text); margin: 0 0 8px; }
.empty-p { font-size: 14px; color: var(--color-text-secondary); margin: 0 0 20px; }
.empty-btn { background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-md); padding: 10px 22px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; text-decoration: none; }
.show-all-btn { background: none; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 9px; font-size: 13px; color: var(--color-text-secondary); cursor: pointer; font-family: inherit; }
.nat-empty-block { margin-bottom: 14px; }
.nat-empty-notice { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--color-warning-light); border: 1px solid #e8c97a; border-radius: var(--radius-md) var(--radius-md) 0 0; padding: 12px 14px; font-size: 13px; color: var(--color-warning); flex-wrap: wrap; }
.nat-empty-actions { display: flex; gap: 8px; flex-shrink: 0; }
.nat-action-btn { border-radius: var(--radius-md); padding: 7px 14px; font-size: 12px; font-weight: 500; cursor: pointer; font-family: inherit; white-space: nowrap; transition: background 0.15s; }
.nat-action-btn--secondary { background: #fff; border: 1px solid var(--color-border); color: var(--color-text-secondary); }
.nat-action-btn--primary { background: var(--color-primary); border: none; color: #fff; }
.nat-action-btn--primary:hover { background: var(--color-primary-hover); }
.nat-empty-cta { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff; border: 1px solid var(--color-border); border-top: none; border-radius: 0 0 var(--radius-md) var(--radius-md); padding: 12px 14px; flex-wrap: wrap; }
.nat-empty-cta-text { font-size: 13px; color: var(--color-text-secondary); margin: 0; }
.nat-override-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--color-primary-light); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 14px; font-size: 13px; color: var(--color-primary-dark); }
.nat-override-close { background: none; border: none; cursor: pointer; font-size: 12px; color: var(--color-primary); font-weight: 500; padding: 0; font-family: inherit; }
/* Tabs — identical to country page */
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
@media (max-width: 768px) { .page-body { grid-template-columns: 1fr; } .ch-flag { font-size: 32px; } .ch-avg-score { font-size: 24px; } }
</style>
