<template>
  <div class="rc-card">
    <div v-for="cat in filledCategories" :key="cat" class="rc-entry">
      <!-- Row 1 -->
      <div class="rc-row1">
        <div style="display:flex; align-items:center; gap:6px; min-width:0">
          <span class="rc-chip">{{ $t(`categories.${cat}.name`) }}</span>
          <span v-if="cat === 'cost_of_living'" class="rc-cost-label" :class="`rc-cost-${review.ratings[cat]}`">
            {{ getCostLabel(review.ratings[cat]) }}
          </span>
        </div>
        <Rating :modelValue="review.ratings[cat]" readonly :cancel="false" :stars="5" />
      </div>
      <!-- Weather icons for weather category -->
      <div v-if="cat === 'weather' && review.climate && review.climate.length" class="rc-weather-icons">
        <span
          v-for="key in review.climate"
          :key="key"
          class="rc-weather-icon"
          :title="getWeatherLabel(key)"
        >{{ getWeatherIcon(key) }}</span>
      </div>
      <!-- Comment -->
      <p v-if="review.comments[cat]" class="rc-comment">{{ review.comments[cat] }}</p>
    </div>

    <!-- Footer -->
    <div class="rc-row3">
      <span class="rc-author">{{ getFlagEmoji(review.author_nationality) }} {{ getCountryNameLocalized(review.author_nationality) }}</span>
      <span class="rc-time">{{ time }}</span>
    </div>
    <div v-if="cityName || review.stay_purpose || review.still_there" class="rc-meta">
      <span v-if="cityName" class="rc-city">📍 {{ cityName }}</span>
      <template v-if="review.stay_purpose">
        <span class="rc-dot">·</span>
        <span class="rc-profile">{{ $t(`common.stayPurposes.${review.stay_purpose}.label`) }}</span>
      </template>
      <template v-if="review.still_there">
        <span class="rc-dot">·</span>
        <span style="color: var(--color-success); font-size: 11px">📍 {{ $t('common.stillThere') }}</span>
      </template>
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
const time = computed(() => timeAgo(props.review.created_at))

const cityName = computed(() => {
  const c = props.review.cities
  if (!c) return null
  if (locale.value === 'uk' && c.name_uk) return c.name_uk
  if (locale.value === 'ru' && c.name_ru) return c.name_ru
  return c.name_en
})

function getCostLabel(value: number): string {
  const opts = tm('common.costOptions') as Array<{ value: number; icon: string; label: string }>
  const opt = opts.find(o => o.value === value)
  return opt ? `${opt.icon} ${opt.label}` : ''
}

function getWeatherIcon(key: string): string {
  const opts = tm('common.weatherOptions') as Record<string, { icon: string; label: string }>
  return opts[key]?.icon ?? '🌡️'
}
function getWeatherLabel(key: string): string {
  const opts = tm('common.weatherOptions') as Record<string, { icon: string; label: string }>
  return opts[key]?.label ?? key
}

const filledCategories = computed(() =>
  CATEGORIES.filter(cat =>
    props.review.ratings?.[cat] != null || props.review.comments?.[cat]?.trim()
  )
)
</script>

<style scoped>
.rc-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rc-entry { display: flex; flex-direction: column; gap: 6px; }
.rc-row1 { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.rc-chip {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  border-radius: var(--radius-pill);
  font-size: 11px; font-weight: 500;
  padding: 3px 10px;
}
.rc-comment { margin: 0; font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; }
.rc-row3 {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid var(--color-border-subtle);
}
.rc-author { font-size: 12px; color: var(--color-text-muted); }
.rc-time { font-size: 12px; color: var(--color-text-muted); }
.rc-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding-top: 4px; }
.rc-city { font-size: 12px; color: var(--color-text-muted); }
.rc-profile { font-size: 11px; background: var(--color-bg-secondary); border-radius: var(--radius-pill); padding: 2px 8px; color: var(--color-text-secondary); }
.rc-cost-label { font-size: 12px; font-weight: 500; }
.rc-cost-5 { color: #0F6E56; }
.rc-cost-4 { color: #2A7A52; }
.rc-cost-3 { color: #854F0B; }
.rc-cost-2 { color: #7A3A0A; }
.rc-cost-1 { color: #7A1010; }
.rc-weather-icons { display: flex; gap: 4px; flex-wrap: wrap; }
.rc-weather-icon { font-size: 16px; line-height: 1; cursor: default; }
</style>
