<template>
  <div
    class="gcard"
    :class="{ 'gcard--list': list }"
    @click="$emit('click')"
  >
    <div class="gc-img">
      <img :src="image" :alt="name">
      <div v-if="country.hasNatReviews" class="gc-badge-match">
        {{ $t('countries.card.hasReviews') }}
      </div>
    </div>
    <div class="gc-body">
      <div class="gc-col-main">
        <div class="gc-top">
          <div class="gc-name">
            <span>{{ flag }}</span>
            {{ name }}
          </div>
        </div>
        <div class="gc-region">{{ regionLabel }}</div>
        <div class="gc-rating">
          <span class="stars">★</span>
          {{ country.avgRating || '—' }}
        </div>
        <div class="gc-reviews">
          {{ $t('countries.card.reviews', { count: country.totalReviews }) }}
        </div>
      </div>

      <div class="gc-col-metrics">
        <div class="gc-metrics">
          <div v-for="m in metrics" :key="m.key" class="gc-metric">
            <div class="gc-metric-val">{{ m.value }}</div>
            <div class="gc-metric-lab">{{ m.label }}</div>
          </div>
        </div>
        <div v-if="!list && topCategories.length" class="gc-say">{{ $t('countries.card.whatPeopleSay') }}</div>
        <div v-if="!list && topCategories.length" class="gc-tags">
          <div v-for="cat in topCategories" :key="cat.category" class="gc-tag pos">
            ✓ {{ $t(`categories.${cat.category}.name`) }} · {{ cat.avg }}
          </div>
        </div>
      </div>

      <div class="gc-actions">
        <button type="button" class="gc-btn-primary" @click.stop="$emit('click')">
          {{ $t('countries.card.viewReviews') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CountryStat } from '~/composables/useCountriesList'
import { getCountryImage } from '~/utils/countryImages'
import { getFlagEmoji } from '~/utils/countries'

const props = withDefaults(defineProps<{
  country: CountryStat
  list?: boolean
}>(), {
  list: false,
})

defineEmits<{ click: [] }>()

const { t } = useI18n()
const { getCountryNameLocalized } = useLocalizedCountries()

const flag = computed(() => getFlagEmoji(props.country.code))
const name = computed(() => getCountryNameLocalized(props.country.code))
const image = computed(() => getCountryImage(props.country.code))
const regionLabel = computed(() => t(`countries.filters.regions.${props.country.region}`))

function catAvg(key: string): number | null {
  return props.country.categoryStats.find(c => c.category === key)?.avg ?? null
}

function fmt(val: number | null): string {
  return val !== null ? String(val) : '—'
}

const metrics = computed(() => [
  { key: 'cost_of_living', value: fmt(catAvg('cost_of_living')), label: t('categories.cost_of_living.name') },
  { key: 'safety', value: fmt(catAvg('safety')), label: t('categories.safety.name') },
  { key: 'weather', value: fmt(catAvg('weather')), label: t('categories.weather.name') },
  {
    key: 'overall',
    value: catAvg('overall') !== null ? `${Math.round((catAvg('overall')! / 5) * 100)}%` : '—',
    label: t('countries.card.recommend'),
  },
])

const topCategories = computed(() =>
  [...props.country.categoryStats]
    .filter(c => c.category !== 'overall')
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 2)
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
  height: 150px;
  overflow: hidden;
}
.gc-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.gcard:hover .gc-img img { transform: scale(1.06); }

.gc-badge-match {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 2;
  background: rgba(31, 170, 107, 0.94);
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 100px;
}

.gc-body { padding: 16px; }
.gc-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 3px; }
.gc-name {
  font-size: 17px;
  font-weight: 800;
  font-family: 'Manrope', sans-serif;
  display: flex;
  align-items: center;
  gap: 7px;
}
.gc-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 800;
  color: var(--ink, #1A1730);
  font-size: 14px;
  margin-top: 6px;
}
.gc-rating .stars { color: #F0A947; }
.gc-region { font-size: 12px; color: var(--ink-soft, #5B5876); font-weight: 500; margin-bottom: 2px; }
.gc-reviews { font-size: 11.5px; color: var(--ink-soft, #5B5876); margin-bottom: 14px; }

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
.gc-metric-lab { font-size: 9.5px; color: var(--ink-soft, #5B5876); margin-top: 1px; }

.gc-say { font-size: 11px; font-weight: 700; color: var(--ink-soft, #5B5876); margin-bottom: 8px; }
.gc-tags { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.gc-tag { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; }
.gc-tag.pos { color: #1FAA6B; }

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

.gcard--list {
  display: flex;
  transform: none;
}
.gcard--list:hover { transform: none; }
.gcard--list .gc-img {
  width: 220px;
  height: auto;
  min-height: 160px;
  flex-shrink: 0;
}
.gcard--list .gc-body {
  flex: 1;
  display: grid;
  grid-template-columns: 1.3fr 2fr 1fr;
  gap: 16px;
  align-items: center;
  padding: 18px 20px;
}
.gcard--list .gc-metrics { margin-bottom: 0; }
.gcard--list .gc-tags,
.gcard--list .gc-say { display: none; }
.gcard--list .gc-reviews { margin-bottom: 0; }
.gcard--list .gc-actions { flex-direction: column; }

@media (max-width: 900px) {
  .gcard--list .gc-body { grid-template-columns: 1fr; gap: 10px; }
  .gcard--list .gc-img { width: 100%; height: 150px; }
  .gcard--list { flex-direction: column; }
}
</style>
