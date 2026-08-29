<template>
  <div class="sidebar">
    <!-- Card 1: Actions -->
    <div class="s-card">
      <NuxtLinkLocale :to="`/review/new?country=${countryCode}`" class="s-btn-primary">
        + {{ $t('common.buttons.writeReview').replace('+ ', '') }} {{ countryName }}
      </NuxtLinkLocale>
      <button class="s-btn-secondary" @click="handleShare">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        {{ $t('country.sidebar.share') }}
      </button>
    </div>

    <!-- Card 2: Quick facts -->
    <div class="s-card" v-if="meta">
      <div class="s-card-title">{{ $t('country.sidebar.quickFacts') }}</div>

      <div class="sb-stat-row">
        <span class="sb-stat-label">{{ $t('country.sidebar.costOfLiving') }}</span>
        <span class="sb-stat-val" :class="costLevelClass">
          {{ $t(`country.costLevels.${meta.costLevel}`) }}
        </span>
      </div>

      <div class="sb-stat-row">
        <span class="sb-stat-label">{{ $t('country.sidebar.language') }}</span>
        <span class="sb-stat-val">{{ $t(`country.languages.${meta.languageKey}`) }}</span>
      </div>

      <div class="sb-stat-row">
        <span class="sb-stat-label">{{ $t('country.sidebar.currency') }}</span>
        <span class="sb-stat-val">{{ meta.currency }}</span>
      </div>

      <div class="sb-stat-row">
        <span class="sb-stat-label">{{ $t('country.sidebar.residencyTime') }}</span>
        <span class="sb-stat-val">{{ meta.residencyMonths }} {{ $t('country.sidebar.months') }}</span>
      </div>

      <div class="sb-stat-row">
        <span class="sb-stat-label">{{ $t('country.sidebar.climate') }}</span>
        <span class="sb-stat-val">{{ $t(`country.climates.${meta.climateKey}`) }}</span>
      </div>

      <div class="sb-stat-row">
        <span class="sb-stat-label">{{ $t('country.sidebar.taxEmployee') }}</span>
        <span class="sb-stat-val">{{ meta.tax_employee }}</span>
      </div>

      <div class="sb-stat-row" style="border-bottom: none">
        <span class="sb-stat-label">{{ $t('country.sidebar.taxCorporate') }}</span>
        <span class="sb-stat-val">{{ meta.tax_corporate }}</span>
      </div>
    </div>

    <!-- Card 3: Similar countries -->
    <div class="s-card" v-if="similar && similar.length">
      <span class="s-card-title">{{ $t('country.sidebar.similarCountries') }}</span>
      <div class="s-similar">
        <div
          v-for="c in similar"
          :key="c.code"
          class="s-similar-row"
          @click="router.push(localePath(`/country/${c.code.toLowerCase()}`))"
        >
          <span class="s-similar-left">
            {{ getFlagEmoji(c.code) }}
            <span class="s-similar-name">{{ getCountryNameLocalized(c.code) }}</span>
          </span>
          <span class="s-similar-right">{{ c.avgRating }} ★ →</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getFlagEmoji } from '~/utils/countries'
import { APP_NAME } from '~/utils/appConfig'
import { useCountryMetaData } from '~/composables/useCountryMetaData'

const { getCountryNameLocalized } = useLocalizedCountries()
const router = useRouter()
const localePath = useLocalePath()

const props = defineProps<{
  countryCode: string
  nationality: string
  similar: { code: string; avgRating: number }[] | null
}>()

const countryName = computed(() => getCountryNameLocalized(props.countryCode))
const { meta } = useCountryMetaData(() => props.countryCode)

const costLevelClass = computed(() => {
  switch (meta.value?.costLevel) {
    case 'low':      return 'good'
    case 'medium':   return ''
    case 'high':     return 'warn'
    case 'very_high': return 'bad'
    default:         return ''
  }
})

async function handleShare() {
  const url = window.location.href
  if (navigator.share) {
    await navigator.share({ title: `${APP_NAME} — ${countryName.value}`, url })
  } else {
    await navigator.clipboard.writeText(url)
  }
}
</script>

<style scoped>
.sidebar { display: flex; flex-direction: column; gap: 12px; }
/* Stick beside main column on desktop; disabled when stacked under 768px */
@media (min-width: 769px) {
  .sidebar {
    position: sticky;
    top: 74px; /* 58px sticky navbar + 16px breathing room */
    align-self: start;
  }
}
.s-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.s-btn-primary {
  display: block; width: 100%; text-decoration: none;
  background: var(--color-primary); color: #fff;
  border: none; border-radius: var(--radius-md);
  padding: 11px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
  text-align: center; box-sizing: border-box;
}
.s-btn-primary:hover { background: var(--color-primary-hover); }
.s-btn-secondary {
  width: 100%; background: #fff; color: var(--color-text-secondary);
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
  padding: 9px; font-size: 13px; cursor: pointer; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: background 0.15s;
}
.s-btn-secondary:hover { background: var(--color-bg-secondary); }
.s-card-title { font-size: 13px; font-weight: 600; color: var(--color-text); margin-bottom: 2px; }

/* Quick facts rows */
.sb-stat-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 7px 0;
  border-bottom: 1px solid var(--color-border-subtle);
  gap: 8px;
}
.sb-stat-label {
  font-size: 12px; color: var(--color-text-secondary); flex-shrink: 0;
}
.sb-stat-val {
  font-size: 12px; font-weight: 500; color: var(--color-text); text-align: right;
}
.sb-stat-val.good { color: var(--color-success); }
.sb-stat-val.warn { color: var(--color-warning); }
.sb-stat-val.bad  { color: var(--color-danger); }

/* Similar countries */
.s-similar { display: flex; flex-direction: column; }
.s-similar-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 6px; border-radius: var(--radius-sm);
  cursor: pointer; transition: background 0.15s; gap: 8px;
}
.s-similar-row:hover { background: var(--color-bg-secondary); }
.s-similar-left { display: flex; align-items: center; gap: 6px; }
.s-similar-name { font-size: 12px; color: var(--color-text-secondary); }
.s-similar-right { font-size: 12px; color: var(--color-primary); white-space: nowrap; }
</style>
