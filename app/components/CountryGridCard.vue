<template>
  <div
    class="gcard"
    :class="{ 'gcard--list': list }"
    @click="$emit('click')"
  >
    <div class="gc-img">
      <img :src="image" :alt="name">
      <div class="gc-img-shade" aria-hidden="true" />

      <button
        type="button"
        class="gc-heart"
        :class="{ liked: isLiked }"
        :aria-label="$t('countries.card.favorite')"
        :aria-pressed="isLiked"
        @click.stop="store.toggleFavorite(country.code)"
      >
        <i class="pi" :class="isLiked ? 'pi-heart-fill' : 'pi-heart'" />
      </button>

      <div class="gc-img-top">
        <div class="gc-name">
          <span>{{ flag }}</span>
          {{ name }}
        </div>
        <div class="gc-region">{{ regionLabel }}</div>
      </div>

      <div class="gc-img-bottom">
        <div class="gc-img-rating">
          <div class="gc-rating">
            <span class="stars">★</span>
            {{ country.avgRating || '—' }}
          </div>
          <div class="gc-reviews">
            {{ $t('countries.card.reviews', { count: country.totalReviews }) }}
          </div>
        </div>
        <div v-if="matchPercent !== null" class="gc-badge-match">
          {{ $t('countries.card.match', { percent: matchPercent }) }}
        </div>
      </div>
    </div>

    <div class="gc-body">
      <div class="gc-metrics">
        <div v-for="m in metrics" :key="m.key" class="gc-metric">
          <div class="gc-metric-val">
            <span v-if="m.key === 'cost_of_living'" class="gc-metric-icon" aria-hidden="true">
            </span>
            <span v-else-if="m.key === 'safety'" class="gc-metric-icon" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6C4CE0" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </span>
            <span v-else-if="m.key === 'weather'" class="gc-metric-icon" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F0A947" stroke-width="2.2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            </span>
            <span v-else-if="m.key === 'overall'" class="gc-metric-icon" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E15B5B" stroke-width="2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </span>
            {{ m.value }}
          </div>
          <div class="gc-metric-lab">{{ m.label }}</div>
        </div>
      </div>

      <template v-if="!list && (pros.length || cons.length)">
        <div class="gc-say">{{ $t('countries.card.whatPeopleSay') }}</div>
        <div class="gc-tags">
          <div class="gc-tags-col">
            <div v-for="cat in pros" :key="cat.category" class="gc-tag pos">
              <span class="gc-tag-mark"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
              {{ $t(`categories.${cat.category}.name`) }}
            </div>
          </div>
          <div class="gc-tags-col">
            <div v-for="cat in cons" :key="cat.category" class="gc-tag neg">
              <span class="gc-tag-mark"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>
              {{ $t(`categories.${cat.category}.name`) }}
            </div>
          </div>
        </div>
      </template>

      <div class="gc-actions">
        <button type="button" class="gc-btn-primary" @click.stop="$emit('click')">
          {{ $t('countries.card.viewReviews') }}
        </button>
        <NuxtLinkLocale :to="compareLink" class="gc-compare" @click.stop>
          <input type="checkbox" tabindex="-1" aria-hidden="true">
          {{ $t('countries.card.compare') }}
        </NuxtLinkLocale>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CountryStat } from '~/composables/useCountriesList'
import { getCountryImage } from '~/utils/countryImages'
import { getFlagEmoji } from '~/utils/countries'
import { getCountryMeta } from '~/utils/countryMeta'

const props = withDefaults(defineProps<{
  country: CountryStat
  list?: boolean
}>(), {
  list: false,
})

defineEmits<{ click: [] }>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getCountryNameLocalized } = useLocalizedCountries()
const store = useUserStore()

const isLiked = computed(() => store.isFavorite(props.country.code))

const flag = computed(() => getFlagEmoji(props.country.code))
const name = computed(() => getCountryNameLocalized(props.country.code))
const image = computed(() => getCountryImage(props.country.code))
const regionLabel = computed(() => t(`countries.filters.regions.${props.country.region}`))
const compareLink = computed(() => localePath(`/compare?a=${props.country.code.toLowerCase()}`))

function catAvg(key: string): number | null {
  return props.country.categoryStats.find(c => c.category === key)?.avg ?? null
}

const matchPercent = computed(() => {
  const overall = catAvg('overall')
  const base = overall ?? props.country.avgRating
  if (!base) return props.country.hasNatReviews ? 75 : null
  return Math.min(99, Math.max(50, Math.round((base / 5) * 100)))
})

const COST_ESTIMATE: Record<string, number> = {
  low: 900,
  medium: 1500,
  high: 1900,
  very_high: 2500,
}

const SUNNY_DAYS: Record<string, number> = {
  mediterranean: 280,
  tropical: 320,
  temperate: 200,
  northern: 150,
  alpine: 180,
  subarctic: 120,
}

function fmtCost(): string {
  const meta = getCountryMeta(props.country.code)
  const amount = meta ? COST_ESTIMATE[meta.costLevel] ?? 1500 : null
  if (!amount) return '—'
  const loc = locale.value === 'uk' ? 'uk-UA' : locale.value === 'en' ? 'en-US' : 'ru-RU'
  const currency = meta?.currency === 'EUR' ? '€' : meta?.currency === 'GBP' ? '£' : meta?.currency === 'USD' ? '$' : '€'
  return `${currency} ${new Intl.NumberFormat(loc).format(amount)}`
}

function fmtSafety(): string {
  const val = catAvg('safety')
  return val !== null ? (val * 2).toFixed(1) : '—'
}

function fmtSunnyDays(): string {
  const meta = getCountryMeta(props.country.code)
  if (meta?.climateKey) return String(SUNNY_DAYS[meta.climateKey] ?? 200)
  const val = catAvg('weather')
  return val !== null ? String(Math.round(val * 56)) : '—'
}

function fmtRecommend(): string {
  const val = catAvg('overall')
  return val !== null ? `${Math.round((val / 5) * 100)}%` : '—'
}

const metrics = computed(() => [
  {
    key: 'cost_of_living',
    value: fmtCost(),
    label: t('categories.cost_of_living.name'),
  },
  {
    key: 'safety',
    value: fmtSafety(),
    label: t('categories.safety.name'),
  },
  {
    key: 'weather',
    value: fmtSunnyDays(),
    label: t('countries.card.sunnyDays'),
  },
  {
    key: 'overall',
    value: fmtRecommend(),
    label: t('countries.card.recommend'),
  },
])

const rankedCategories = computed(() =>
  [...props.country.categoryStats]
    .filter(c => c.category !== 'overall' && c.category !== 'attitude')
    .sort((a, b) => b.avg - a.avg)
)

const pros = computed(() => rankedCategories.value.filter(c => c.avg >= 3.5).slice(0, 2))
const cons = computed(() =>
  [...rankedCategories.value]
    .filter(c => c.avg < 3.5)
    .slice(-2)
    .reverse()
)
</script>

<style scoped>
.gcard {
  border: 1px solid var(--line, #EAE7F5);
  border-radius: 14px;
  background: white;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.gcard:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(42, 27, 107, 0.08);
}

.gc-img {
  position: relative;
  height: 200px;
  overflow: hidden;
}
.gc-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.gcard:hover .gc-img img { transform: scale(1.06); }

.gc-img-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(180deg, rgba(15, 12, 35, 0.55) 0%, rgba(15, 12, 35, 0.08) 42%, rgba(15, 12, 35, 0.62) 100%);
  pointer-events: none;
}

.gc-heart {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 3;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-soft, #5B5876);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.15s, transform 0.15s;
}
.gc-heart .pi { font-size: 14px; }
.gc-heart:hover { transform: scale(1.1); }
.gc-heart.liked { color: #E15B5B; }

.gc-img-top {
  position: absolute;
  top: 12px;
  left: 14px;
  z-index: 2;
  max-width: calc(100% - 56px);
}
.gc-img-bottom {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 12px;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
}
.gc-img-rating { min-width: 0; }

.gc-name {
  font-size: 18px;
  font-weight: 800;
  font-family: var(--font-display);
  display: flex;
  align-items: center;
  gap: 7px;
  color: white;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.25);
}
.gc-region {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.88);
  font-weight: 500;
  margin-top: 2px;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
}
.gc-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 800;
  color: white;
  font-size: 22px;
  line-height: 1.1;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.25);
}
.gc-rating .stars { color: #F0A947; font-size: 20px; }
.gc-reviews {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 2px;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
}

.gc-badge-match {
  flex-shrink: 0;
  background: rgba(212, 245, 228, 0.96);
  color: #168A55;
  font-size: 11px;
  font-weight: 800;
  padding: 5px 10px;
  border-radius: 100px;
  white-space: nowrap;
}

.gc-body { padding: 16px; }

.gc-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 14px;
}
.gc-metric { text-align: center; }
.gc-metric-val {
  font-weight: 800;
  font-size: 13px;
  color: var(--ink, #1A1730);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
}
.gc-metric-icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}
.gc-metric-lab { font-size: 9.5px; color: var(--ink-soft, #5B5876); margin-top: 1px; }

.gc-say { font-size: 11px; font-weight: 700; color: var(--ink-soft, #5B5876); margin-bottom: 8px; }
.gc-tags {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
  margin-bottom: 16px;
}
.gc-tags-col { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.gc-tag { display: flex; align-items: flex-start; gap: 6px; font-size: 10px; font-weight: 600; line-height: 1.35; color: var(--ink-soft, #5B5876); }
.gc-tag-mark { flex-shrink: 0; display: inline-flex; align-items: center; margin-top: 1px; }
.gc-tag.pos .gc-tag-mark { color: #1FAA6B; }
.gc-tag.neg .gc-tag-mark { color: #E15B5B; }

.gc-actions { display: flex; gap: 8px; }
.gc-btn-primary {
  flex: 1;
  justify-content: center;
  padding: 10px;
  font-size: 13px;
  font-weight: 700;
  border: none;
  border-radius: 11px;
  background: var(--purple-600, #6C4CE0);
  color: white;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(108, 76, 224, 0.32);
  transition: background 0.15s, transform 0.15s;
}
.gc-btn-primary:hover { background: var(--purple-700, #5B3DE0); transform: translateY(-1px); }

.gc-compare {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1.5px solid var(--line, #EAE7F5);
  border-radius: 11px;
  padding: 10px 12px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink-soft, #5B5876);
  transition: border-color 0.15s, color 0.15s;
  flex: 1;
  justify-content: center;
  text-decoration: none;
  background: white;
}
.gc-compare:hover { border-color: #7C5CF0; color: #6C4CE0; }
.gc-compare input { accent-color: #6C4CE0; pointer-events: none; }

.gcard--list {
  display: flex;
  transform: none;
}
.gcard--list:hover { transform: none; }
.gcard--list .gc-img {
  width: 220px;
  height: auto;
  min-height: 200px;
  flex-shrink: 0;
}
.gcard--list .gc-body {
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  align-items: center;
  padding: 18px 20px;
}
.gcard--list .gc-metrics { margin-bottom: 0; }
.gcard--list .gc-tags,
.gcard--list .gc-say { display: none; }
.gcard--list .gc-actions { flex-direction: column; }

@media (max-width: 900px) {
  .gcard--list .gc-body { grid-template-columns: 1fr; gap: 10px; }
  .gcard--list .gc-img { width: 100%; height: 200px; }
  .gcard--list { flex-direction: column; }
}
</style>
