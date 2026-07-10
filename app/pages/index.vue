<template>
  <div class="home-page">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-visual-bg">
        <img
          class="bg-img"
          src="https://images.unsplash.com/photo-1585208798174-6cedd86e019a?q=80&w=1600&auto=format&fit=crop"
          alt=""
        >
      </div>

      <div class="hero-floats">
        <template v-if="!topCountriesPending && heroFloatCountries.length">
          <div
            v-for="(c, idx) in heroFloatCountries"
            :key="c.code"
            class="float-card"
            :class="floatClasses[idx]"
          >
            <div class="fc-flag">
              <span class="fc-flag-emoji">{{ getFlagEmoji(c.code) }}</span>
              <span class="fc-flag-name">{{ getCountryNameLocalized(c.code) }}</span>
            </div>
            <div class="fc-rating">★ <span>{{ c.avgRating }}</span></div>
            <template v-if="idx === 2">
              <div class="fc-sub">{{ c.total }} {{ $t('common.labels.reviews') }}</div>
            </template>
          </div>
        </template>

        <div v-if="heroReview" class="review-card">
          <div class="rc-content">
            <div class="review-top">
              <div>
                <ReviewByline
                  compact
                  stack
                  :from="heroReview.author_nationality"
                  :about="heroReview.target_country"
                />
                <div class="review-time">{{ timeAgo(heroReview.created_at) }}</div>
              </div>
            </div>
            <div class="review-text">{{ heroReviewSnippet }}</div>
          </div>
        </div>
      </div>

      <div class="hero-grid">
        <div class="hero-copy">
          <div class="hero-mobile-banner">
            <div class="hero-mobile-bg" aria-hidden="true">
              <HomeHeroMapOverlay class="hero-map-layer" />
              <img
                class="hero-mobile-img"
                src="https://images.unsplash.com/photo-1585208798174-6cedd86e019a?q=80&w=1200&auto=format&fit=crop"
                alt=""
              >
            </div>

            <div class="hero-mobile-inner">
              <h1>
                {{ $t('homepage.hero.title') }}<br>
                <span class="accent">{{ $t('homepage.hero.titleAccent') }}</span>
              </h1>
              <p class="lead">{{ $t('homepage.hero.subtitle') }}</p>
            </div>

            <div v-if="heroFloatCountries.length" class="hero-mobile-chips-wrap">
              <HorizontalScroller class="hero-chips-scroller">
                <div class="hero-mobile-chips">
                  <div
                    v-for="c in heroFloatCountries.slice(0, 3)"
                    :key="c.code"
                    class="hero-mobile-chip"
                  >
                    <span class="hero-mobile-chip-flag">{{ getFlagEmoji(c.code) }}</span>
                    <span class="hero-mobile-chip-name">{{ getCountryNameLocalized(c.code) }}</span>
                    <span class="hero-mobile-chip-rating">★ {{ c.avgRating }}</span>
                  </div>
                </div>
              </HorizontalScroller>
            </div>
          </div>

          <div class="stat-row">
            <div class="stat-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2a1 1 0 011 1v1.06A8.99 8.99 0 0119.94 11H21a1 1 0 010 2h-1.06A8.99 8.99 0 0113 19.94V21a1 1 0 01-2 0v-1.06A8.99 8.99 0 014.06 13H3a1 1 0 010-2h1.06A8.99 8.99 0 0111 4.06V3a1 1 0 011-1z"/></svg>
              <template v-if="stats">{{ stats.total }}</template><template v-else>—</template>
              <span class="light">{{ $t('common.labels.reviews') }}</span>
            </div>
            <div class="stat-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20z"/></svg>
              <template v-if="stats">{{ stats.countries }}</template><template v-else>—</template>
              <span class="light">{{ $t('common.labels.countries') }}</span>
            </div>
            <div class="stat-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <template v-if="stats">{{ stats.nationalities }}</template><template v-else>—</template>
              <span class="light">{{ $t('common.labels.nationalities') }}</span>
            </div>
          </div>

          <form class="finder" @submit.prevent="handleSubmit">
            <div class="finder-fields">
              <div class="field">
                <label>{{ $t('homepage.hero.selectNationalityLabel') }}</label>
                <NationalitySelector v-model="nationality" />
              </div>
              <div class="field">
                <label>{{ $t('homepage.hero.selectCountryLabel') }}</label>
                <CountrySelector v-model="targetCountry" />
              </div>
              <button type="submit" class="btn btn-primary" :disabled="!nationality || !targetCountry">
                {{ $t('homepage.hero.cta') }}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
            </div>
            <div v-if="popularCountries.length" class="popular-line">
              <span>{{ $t('homepage.hero.popularTags') }}</span>
              <div class="popular-tags-row">
                <NuxtLinkLocale
                  v-for="c in popularCountries"
                  :key="c.code"
                  class="tag"
                  :to="`/country/${c.code.toLowerCase()}`"
                >{{ getCountryNameLocalized(c.code) }}</NuxtLinkLocale>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>

    <div class="container">
      <!-- POPULAR COUNTRIES -->
      <section class="section" style="padding-top: 50px">
        <div class="section-head">
          <h2>{{ $t('homepage.trending.title') }}</h2>
          <div class="section-head-actions">
            <NuxtLinkLocale to="/countries">{{ $t('common.buttons.seeAll') }}</NuxtLinkLocale>
          </div>
        </div>

        <HorizontalScroller v-if="trendingPending" class="trending-scroller">
          <div class="card-scroller">
            <Skeleton v-for="i in 5" :key="i" width="240px" height="280px" style="border-radius: 14px; flex-shrink: 0" />
          </div>
        </HorizontalScroller>
        <Message v-else-if="!trending?.length" severity="info" :closable="false">
          {{ $t('homepage.trending.empty') }}
        </Message>
        <HorizontalScroller v-else class="trending-scroller">
          <div class="card-scroller">
          <NuxtLinkLocale
            v-for="item in trending"
            :key="item.code"
            :to="`/country/${item.code.toLowerCase()}`"
            class="country-card"
          >
            <div class="cc-img">
              <img :src="getCountryImage(item.code)" :alt="getCountryNameLocalized(item.code)">
              <div class="cc-img-overlay">
                <div class="cc-title">
                  <span class="cc-title-flag">{{ getFlagEmoji(item.code) }}</span>
                  <span class="cc-title-name">{{ getCountryNameLocalized(item.code) }}</span>
                </div>
                <div class="cc-rating-row">
                  <div class="cc-rating"><span class="stars">★</span> {{ item.avgRating }}</div>
                  <div>{{ item.total }} {{ $t('common.labels.reviews') }}</div>
                </div>
              </div>
            </div>
            <div class="cc-body">
              <div class="cc-metrics">
                <div>
                  <div class="cc-metric-val">{{ item.avgRating }}/5</div>
                  <div class="cc-metric-lab">{{ $t('categories.overall.name') }}</div>
                </div>
                <div>
                  <div class="cc-metric-val">{{ item.total }}</div>
                  <div class="cc-metric-lab">{{ $t('common.labels.reviews') }}</div>
                </div>
                <div>
                  <div class="cc-metric-val">{{ Math.round(item.avgRating / 5 * 100) }}%</div>
                  <div class="cc-metric-lab">{{ $t('homepage.trending.score') }}</div>
                </div>
              </div>
            </div>
          </NuxtLinkLocale>
          </div>
        </HorizontalScroller>
      </section>

      <!-- PROMO + COMPARE + REVIEWS -->
      <section class="section" style="padding-top: 0">
        <div class="tri-grid">
          <NuxtLinkLocale to="/review/new" class="panel promo-panel">
            <img
              class="promo-panel-img"
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=900&auto=format&fit=crop"
              alt=""
            >
            <div class="promo-panel-overlay">
              <div class="promo-panel-badge">Triplandr</div>
              <h3>{{ $t('homepage.promo.title') }}</h3>
              <p>{{ $t('homepage.promo.subtitle') }}</p>
              <span class="promo-panel-cta">{{ $t('homepage.promo.cta') }} →</span>
            </div>
          </NuxtLinkLocale>

          <div class="panel">
            <div class="panel-head">
              <h3>{{ $t('homepage.compare.title') }}</h3>
              <NuxtLinkLocale to="/compare">{{ $t('homepage.compare.seeAll') }} →</NuxtLinkLocale>
            </div>
            <template v-if="comparePair.length === 2">
              <div class="compare-head-row">
                <div class="compare-flag">
                  <span class="compare-flag-emoji">{{ getFlagEmoji(comparePair[0].code) }}</span>
                  <span>{{ getCountryNameLocalized(comparePair[0].code) }}</span>
                </div>
                <div class="compare-vs">{{ $t('homepage.compare.vs') }}</div>
                <div class="compare-flag">
                  <span class="compare-flag-emoji">{{ getFlagEmoji(comparePair[1].code) }}</span>
                  <span>{{ getCountryNameLocalized(comparePair[1].code) }}</span>
                </div>
              </div>
              <div class="compare-rows">
                <div class="cmp-row">
                  <div class="cmp-label">★ {{ $t('categories.overall.name') }}</div>
                  <div class="cmp-val">{{ comparePair[0].avgRating }} / {{ comparePair[1].avgRating }}</div>
                </div>
                <div class="cmp-row">
                  <div class="cmp-label">{{ $t('common.labels.reviews') }}</div>
                  <div class="cmp-val">{{ comparePair[0].total }} / {{ comparePair[1].total }}</div>
                </div>
              </div>
            </template>
            <Message v-else severity="info" :closable="false" style="margin: 16px 18px">
              {{ $t('homepage.trending.empty') }}
            </Message>
          </div>

          <div class="panel">
            <div class="panel-head">
              <h3>{{ $t('homepage.latest.title') }}</h3>
              <NuxtLinkLocale to="/reviews">{{ $t('homepage.latest.seeAll') }} →</NuxtLinkLocale>
            </div>
            <div v-if="latestPending">
              <Skeleton v-for="i in 2" :key="i" height="100px" style="margin: 14px 18px" />
            </div>
            <template v-else-if="latest?.length">
              <div v-for="r in latest.slice(0, 2)" :key="r.id" class="review-item">
                <div class="ri-top">
                  <ReviewByline
                    compact
                    :from="r.author_nationality"
                    :about="r.target_country"
                  />
                  <div class="ri-time">{{ timeAgo(r.created_at) }}</div>
                </div>
                <div class="ri-stars">★★★★★</div>
                <div class="ri-text">{{ reviewSnippet(r) }}</div>
              </div>
            </template>
            <Message v-else severity="info" :closable="false" style="margin: 14px 18px">
              {{ $t('homepage.latest.empty') }}
            </Message>
          </div>
        </div>

        <div class="panel map-panel-below">
          <HomeWorldMap :review-data="mapReviewData" />
          <div class="map-legend">
            <div class="map-legend-item">
              <span class="map-legend-swatch" style="background:#B9A8ED" />
              {{ $t('homepage.map.legendHasData') }}
            </div>
            <div class="map-legend-item">
              <span class="map-legend-swatch" style="background:#E7E4F3" />
              {{ $t('homepage.map.legendNoData') }}
            </div>
          </div>
          <div class="map-hint">{{ $t('homepage.map.hint') }}</div>
        </div>
      </section>

      <!-- CATEGORIES -->
      <section class="section">
        <div class="section-head">
          <h2>{{ $t('homepage.categories.title') }}</h2>
          <NuxtLinkLocale to="/categories">{{ $t('homepage.categories.seeAll') }}</NuxtLinkLocale>
        </div>
        <div v-if="catPending" class="topics-grid">
          <Skeleton v-for="i in 4" :key="i" height="120px" style="border-radius: 14px" />
        </div>
        <Message v-else-if="!catStats?.length" severity="info" :closable="false">
          {{ $t('homepage.categories.empty') }}
        </Message>
        <div v-else class="topics-grid">
          <CategoryHighlight v-for="item in catStats" :key="item.category" :item="item" />
        </div>
      </section>

      <!-- CTA -->
      <section class="section" style="padding-top: 0">
        <div class="cta-banner">
          <div class="cta-left">
            <div class="cta-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg>
            </div>
            <div>
              <h3>{{ $t('homepage.cta.title') }}</h3>
              <p>{{ $t('homepage.cta.subtitle') }}</p>
            </div>
          </div>
          <NuxtLinkLocale to="/review/new" class="btn btn-primary">{{ $t('common.buttons.writeReview') }}</NuxtLinkLocale>
          <div v-if="stats" class="cta-stats">
            <div><div class="cta-stat-num">{{ stats.total }}</div><div class="cta-stat-lab">{{ $t('common.labels.reviews') }}</div></div>
            <div><div class="cta-stat-num">{{ stats.countries }}</div><div class="cta-stat-lab">{{ $t('common.labels.countries') }}</div></div>
            <div><div class="cta-stat-num">{{ stats.nationalities }}</div><div class="cta-stat-lab">{{ $t('common.labels.nationalities') }}</div></div>
          </div>
        </div>
      </section>

      <div class="trust-row">
        <div>
          <div class="trust-label">{{ $t('homepage.cta.trustTitle') }}</div>
          <div class="trust-brands">
            <div class="trust-brand">★ Trustpilot <b>4.8/5</b></div>
            <div class="trust-brand">Google <b>4.7/5</b></div>
          </div>
        </div>
        <div class="trust-avatars">{{ $t('homepage.cta.trustText') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { APP_URL } from '~/utils/appConfig'
import { countryToSlug, getCountryName, getFlagEmoji, timeAgo } from '~/utils/countries'
import { getCountryImage } from '~/utils/countryImages'
import { codeToMapName } from '~/utils/worldMapGeo'

interface MapReviewEntry {
  code: string
  rating: number
  reviews: number
}

const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.home.title'),
  description: () => t('seo.home.description'),
  ogTitle: () => t('seo.home.title'),
  ogDescription: () => t('seo.home.description'),
  ogImage: APP_URL + '/og/home.png',
  ogUrl: APP_URL,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('seo.home.title'),
  twitterDescription: () => t('seo.home.description'),
  twitterImage: APP_URL + '/og/home.png',
})

const store = useUserStore()
const router = useRouter()
const localePath = useLocalePath()
const { getCountryNameLocalized } = useLocalizedCountries()

onMounted(() => store.loadFromStorage())

const nationality = ref(store.nationality)
const targetCountry = ref('')

const {
  stats, trending, trendingPending,
  latest, latestPending,
  catStats, catPending,
  mapCountries,
} = useHomepageData()

const mapReviewData = computed<Record<string, MapReviewEntry>>(() => {
  const result: Record<string, MapReviewEntry> = {}
  for (const item of mapCountries.value ?? []) {
    const mapName = codeToMapName(item.code, getCountryName(item.code))
    result[mapName] = {
      code: item.code,
      rating: item.avgRating,
      reviews: item.total,
    }
  }
  return result
})

const { data: topCountries, pending: topCountriesPending } = useAsyncData(
  'heroTopCountries',
  async () => {
    const supabase = useSupabaseClient()
    const { data } = await supabase
      .from('reviews')
      .select('target_country, ratings')
      .eq('is_approved', true)
      .limit(500)
    if (!data?.length) return []
    const grouped: Record<string, number[]> = {}
    for (const r of data as any[]) {
      if (!grouped[r.target_country]) grouped[r.target_country] = []
      const vals = Object.values((r.ratings ?? {}) as Record<string, number>).filter(v => typeof v === 'number')
      grouped[r.target_country].push(vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0)
    }
    return Object.entries(grouped)
      .map(([code, avgs]) => ({
        code,
        total: avgs.length,
        avgRating: Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
  },
)

const floatClasses = ['flag-de', 'flag-pl', 'flag-pt']
const heroFloatCountries = computed(() => topCountries.value ?? [])
const popularCountries = computed(() => (trending.value ?? []).slice(0, 5))
const comparePair = computed(() => (trending.value ?? []).slice(0, 2))
const heroReview = computed(() => latest.value?.[0] ?? null)

const heroReviewSnippet = computed(() => {
  if (!heroReview.value) return ''
  return reviewSnippet(heroReview.value)
})

function reviewSnippet(review: any): string {
  const comments = (review.comments ?? {}) as Record<string, string | null>
  const text = Object.values(comments).find(c => c && c.trim())
  if (!text) return t('homepage.latest.empty')
  return text.length > 120 ? text.slice(0, 120) + '…' : text
}

function handleSubmit() {
  if (!nationality.value || !targetCountry.value) return
  store.setNationality(nationality.value)
  router.push(localePath(`/country/${countryToSlug(targetCountry.value)}`))
}
</script>

<style>
@import '~/assets/styles/homepage.css';
</style>

<style scoped>
.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 32px;
}

.section-head-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.section-head-actions a {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--purple-600, #6C4CE0);
  text-decoration: none;
}

.finder-fields {
  grid-template-columns: 1fr 1fr auto;
}

.field :deep(.p-select) {
  width: 100%;
  min-height: 45px;
  border: 1.5px solid var(--line, #EAE7F5);
  border-radius: 11px;
  background: white;
  box-shadow: none;
}

.field :deep(.p-select:not(.p-disabled):hover) {
  border-color: var(--purple-500, #7C5CF0);
}

.btn.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12.5px 22px;
  border-radius: 11px;
  font-weight: 700;
  font-size: 14.5px;
  background: var(--purple-600, #6C4CE0);
  color: white;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  height: 45px;
  box-shadow: 0 6px 16px rgba(108, 76, 224, 0.32);
  text-decoration: none;
}

.btn.btn-primary:hover:not(:disabled) {
  background: var(--purple-700, #5B3DE0);
}

.btn.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.country-card {
  text-decoration: none;
  color: inherit;
}

.topics-grid :deep(.cat-card) {
  border: 1px solid var(--line, #EAE7F5);
  border-radius: var(--radius-md, 14px);
  transition: box-shadow 0.2s, transform 0.2s;
}

.topics-grid :deep(.cat-card:hover) {
  box-shadow: var(--shadow-sm);
  transform: translateY(-3px);
}

.trust-label {
  font-weight: 700;
  font-size: 13px;
  color: var(--ink-soft, #5B5876);
  margin-bottom: 12px;
}

/* Full-bleed horizontal scroll on mobile */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .finder-fields {
    grid-template-columns: 1fr;
  }

  .finder-fields .btn.btn-primary {
    width: 100%;
    justify-content: center;
  }

  .cta-banner .btn.btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>
