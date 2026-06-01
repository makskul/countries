<template>
  <div class="clr" @click="$emit('click')">
    <div class="clr-left">
      <span class="clr-flag">{{ flag }}</span>
      <div>
        <span class="clr-name">{{ getCountryNameLocalized(country.code) }}</span>
        <span class="clr-region">{{ country.region }}</span>
      </div>
    </div>
    <div class="clr-center">
      <Rating :modelValue="country.avgRating" readonly :cancel="false" :stars="5" />
      <span class="clr-score">{{ country.avgRating }}</span>
    </div>
    <div class="clr-count">{{ country.totalReviews }} {{ $t('common.labels.reviews') }}</div>
    <div class="clr-cat" v-if="country.categoryStats.length">
      <span class="clr-chip">{{ $t(`categories.${country.categoryStats[0].category}.name`) }}</span>
    </div>
    <span class="clr-link">{{ $t('common.buttons.readMore') }}</span>
  </div>
</template>

<script setup lang="ts">
import type { CountryStat } from '~/composables/useCountriesList'
import { getFlagEmoji } from '~/utils/countries'

const props = defineProps<{ country: CountryStat }>()
defineEmits<{ click: [] }>()
const flag = computed(() => getFlagEmoji(props.country.code))
const { getCountryNameLocalized } = useLocalizedCountries()
</script>

<style scoped>
.clr {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border-subtle);
  cursor: pointer;
  transition: background 0.15s;
  background: #fff;
}
.clr:last-child { border-bottom: none; }
.clr:hover { background: var(--color-bg-secondary); }
.clr-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.clr-flag { font-size: 22px; flex-shrink: 0; }
.clr-name { font-size: 14px; font-weight: 600; color: var(--color-text); display: block; }
.clr-region { font-size: 11px; color: var(--color-text-muted); }
.clr-center { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.clr-score { font-size: 14px; font-weight: 600; color: var(--color-text); }
.clr-count { font-size: 13px; color: var(--color-text-muted); flex-shrink: 0; min-width: 90px; text-align: right; }
.clr-cat { flex-shrink: 0; }
.clr-chip {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 500;
  padding: 3px 9px;
}
.clr-link { font-size: 13px; font-weight: 500; color: var(--color-primary); flex-shrink: 0; }
@media (max-width: 640px) {
  .clr-count, .clr-cat { display: none; }
}
</style>
