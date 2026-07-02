<template>
  <div class="page-hero">
    <div class="hero-banner">
      <div class="hero-banner-map" aria-hidden="true">
        <CountriesMiniMap
          :review-data="mapReviewData"
          view-box="0 0 1000 190"
          preserve-aspect-ratio="xMidYMin slice"
        />
        <div class="hero-banner-map-tint" />
      </div>

      <div class="hero-banner-body">
        <div class="hero-banner-head">
          <div class="hero-copy">
            <h1>{{ $t('countries.title') }}</h1>
            <p class="lead">{{ $t('countries.hero.lead') }}</p>
          </div>

          <div v-if="featuredReview" class="review-float">
            <div class="review-top">
              <img class="avatar" :src="reviewAvatar" alt="">
              <div>
                <div class="review-name">
                  <span class="review-name-flag">{{ getFlagEmoji(featuredReview.target_country) }}</span>
                  <span class="review-name-text">{{ getCountryNameLocalized(featuredReview.target_country) }}</span>
                </div>
                <div class="review-time">{{ reviewMeta }}</div>
              </div>
            </div>
            <div v-if="reviewRating" class="review-stars">
              <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(reviewRating) }">★</span>
            </div>
            <div class="review-text">{{ reviewText }}</div>
            <NuxtLinkLocale :to="`/country/${featuredReview.target_country.toLowerCase()}`" class="see-link">
              {{ $t('countries.hero.seeReview') }} →
            </NuxtLinkLocale>
          </div>
        </div>

        <div v-if="stats" class="stat-strip">
          <div class="stat-box">
            <div class="stat-box-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20z"/></svg>
            </div>
            <div>
              <div class="stat-box-num">{{ fmt(stats.countries) }}</div>
              <div class="stat-box-lab">{{ $t('countries.stats.countries') }}</div>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-box-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </div>
            <div>
              <div class="stat-box-num">{{ fmt(stats.total) }}</div>
              <div class="stat-box-lab">{{ $t('countries.stats.reviews') }}</div>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-box-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <div>
              <div class="stat-box-num">{{ fmt(stats.nationalities) }}+</div>
              <div class="stat-box-lab">{{ $t('countries.stats.nationalities') }}</div>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-box-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div>
              <div class="stat-box-num">{{ lastReviewLabel }}</div>
              <div class="stat-box-lab">{{ $t('countries.stats.lastReview') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MapReviewEntry } from '~/components/HomeWorldMap.vue'
import { getFlagEmoji, timeAgo } from '~/utils/countries'

const props = defineProps<{
  stats: { total: number; countries: number; nationalities: number } | null
  mapReviewData: Record<string, MapReviewEntry>
  featuredReview: Record<string, any> | null
  lastReviewLabel: string
}>()

const { t, locale } = useI18n()
const { getCountryNameLocalized } = useLocalizedCountries()

function fmt(n: number | undefined): string {
  if (n === undefined || n === null) return '—'
  const loc = locale.value === 'uk' ? 'uk-UA' : locale.value === 'en' ? 'en-US' : 'ru-RU'
  return new Intl.NumberFormat(loc).format(n)
}

const reviewAvatar = computed(() =>
  props.featuredReview
    ? `https://i.pravatar.cc/64?u=${props.featuredReview.id}`
    : ''
)

const reviewMeta = computed(() => {
  if (!props.featuredReview) return ''
  const code = props.featuredReview.author_nationality
  const natRaw = t(`nationalities.${code}.nominative`, code)
  const natLabel = natRaw.includes(' / ') ? natRaw.split(' / ')[0] : natRaw
  const when = timeAgo(props.featuredReview.created_at, locale.value)
  return `${natLabel} · ${when}`
})

const reviewText = computed(() => {
  if (!props.featuredReview) return ''
  const comments = (props.featuredReview.comments ?? {}) as Record<string, string | null>
  const text = Object.values(comments).find(c => c && c.trim())
  if (!text) return t('homepage.latest.empty')
  return text.length > 100 ? text.slice(0, 100) + '…' : text
})

const reviewRating = computed(() => {
  if (!props.featuredReview?.ratings) return 0
  const ratings = props.featuredReview.ratings as Record<string, number>
  const vals = Object.values(ratings).filter(v => typeof v === 'number')
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
})
</script>
