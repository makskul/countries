<template>
  <div class="review-card">

    <!-- Categories: one block per filled category -->
    <template v-for="cat in filledCategories" :key="cat">
      <div class="rc-cat-block">
        <!-- Badge + stars on same row -->
        <div class="rc-cat-row">
          <span class="rc-cat-badge" :class="`cat-${cat}`">
            {{ $t(`categories.${cat}.name`) }}
          </span>
          <!-- Weather uses climate tags, not star ratings -->
          <Rating
            v-if="cat !== 'weather'"
            :modelValue="review.ratings[cat]"
            readonly
            :cancel="false"
            :stars="5"
          />
          <div v-else-if="review.climate?.length" class="rc-weather-icons">
            <span
              v-for="key in review.climate"
              :key="key"
              class="rc-weather-icon"
              :title="getWeatherLabel(key)"
            >{{ getWeatherIcon(key) }}</span>
          </div>
          <Rating
            v-else-if="review.ratings?.weather != null"
            :modelValue="review.ratings.weather"
            readonly
            :cancel="false"
            :stars="5"
          />
        </div>

        <!-- Comment text (no box, no background) -->
        <p v-if="review.comments[cat]" class="rc-text">{{ review.comments[cat] }}</p>
      </div>
    </template>

    <!-- Author row -->
    <div class="rc-author-row">
      <div class="rc-avatar">{{ nationalityFlag }}</div>
      <div class="rc-author-info">
        <div class="rc-author-line">
          <span class="rc-from-label">{{ $t('common.reviewAttribution.from') }}</span>
          {{ nationalityName }}
          <span v-if="review.stay_purpose">
            · {{ $t(`common.stayPurposes.${review.stay_purpose}.label`) }}
          </span>
        </div>
        <div class="rc-author-sub">
          <span v-if="review.still_there" class="rc-still-there">
            📍 {{ $t('common.stillThere') }}
          </span>
          <span v-else class="rc-left">{{ $t('common.alreadyLeft') }}</span>
          <span v-if="cityName" class="rc-city-tag">· {{ cityName }}</span>
        </div>
      </div>
      <span class="rc-time">{{ time }}</span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { getFlagEmoji, timeAgo } from '~/utils/countries'
import { CATEGORIES } from '~/utils/categories'
import type { RawReview } from '~/composables/useCountryPage'

const { getCountryNameLocalized } = useLocalizedCountries()
const { tm, locale } = useI18n()
const props = defineProps<{ review: RawReview }>()
const time = computed(() => timeAgo(props.review.created_at, locale.value))

const cityName = computed(() => {
  const c = props.review.cities
  if (!c) return null
  if (locale.value === 'uk' && c.name_uk) return c.name_uk
  if (locale.value === 'ru' && c.name_ru) return c.name_ru
  return c.name_en
})

function getWeatherIcon(key: string): string {
  const opts = tm('common.weatherOptions') as Record<string, { icon: string; label: string }>
  return opts[key]?.icon ?? '🌡️'
}
function getWeatherLabel(key: string): string {
  const opts = tm('common.weatherOptions') as Record<string, { icon: string; label: string }>
  return opts[key]?.label ?? key
}

const filledCategories = computed(() =>
  CATEGORIES.filter(cat => {
    if (cat === 'weather') {
      return (props.review.climate?.length ?? 0) > 0
        || props.review.ratings?.[cat] != null
        || !!props.review.comments?.[cat]?.trim()
    }
    return props.review.ratings?.[cat] != null || !!props.review.comments?.[cat]?.trim()
  })
)

const overallRating = computed(() => {
  if (props.review.ratings?.overall != null) return props.review.ratings.overall
  const vals = Object.entries(props.review.ratings ?? {})
    .filter(([key]) => key !== 'overall')
    .map(([, v]) => v)
    .filter((v): v is number => typeof v === 'number')
  if (!vals.length) return 0
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
})

const nationalityFlag = computed(() => getFlagEmoji(props.review.author_nationality))
const nationalityName = computed(() => getCountryNameLocalized(props.review.author_nationality))
</script>

<style scoped>
.review-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Overall stars row */
.rc-stars-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rc-score {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

/* Per-category block */
.rc-cat-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rc-cat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.rc-cat-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

/* Category badge colors */
.cat-legalization      { background: #E1F5EE; color: #0F6E56; }
.cat-safety            { background: #FCEBEB; color: #A32D2D; }
.cat-weather           { background: #E6F1FB; color: #185FA5; }
.cat-cost_of_living    { background: #FAEEDA; color: #854F0B; }
.cat-bureaucracy       { background: #FCEBEB; color: #A32D2D; }
.cat-language_barrier  { background: var(--color-primary-light); color: var(--color-primary-dark); }
.cat-cleanliness       { background: #E1F5EE; color: #0F6E56; }
.cat-healthcare        { background: #E6F1FB; color: #185FA5; }
.cat-overall           { background: var(--color-primary-light); color: var(--color-primary-dark); }

/* Comment text — no box, no background */
.rc-text {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.rc-weather-icons { display: flex; gap: 4px; flex-wrap: wrap; }
.rc-weather-icon  { font-size: 16px; line-height: 1; cursor: default; }

/* Author row */
.rc-author-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
  margin-top: 2px;
}
.rc-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.rc-author-info { flex: 1; min-width: 0; }
.rc-author-line {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rc-from-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: lowercase;
  margin-right: 2px;
}
.rc-author-sub {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 1px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.rc-still-there { font-size: 10px; color: var(--color-success); font-weight: 500; }
.rc-left        { font-size: 10px; color: var(--color-text-muted); }
.rc-city-tag    { font-size: 10px; color: var(--color-text-muted); }
.rc-time        { font-size: 11px; color: var(--color-text-muted); flex-shrink: 0; }
</style>
