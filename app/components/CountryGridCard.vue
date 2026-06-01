<template>
  <div class="cgc" @click="$emit('click')">
    <!-- Top row -->
    <div class="cgc-top">
      <span class="cgc-flag">{{ flag }}</span>
      <div class="cgc-info">
        <span class="cgc-name">{{ country.name }}</span>
        <span class="cgc-region">{{ country.region }}</span>
      </div>
    </div>

    <!-- Rating row -->
    <div class="cgc-rating">
      <Rating :modelValue="country.avgRating" readonly :cancel="false" :stars="5" />
      <span class="cgc-score">{{ country.avgRating }}</span>
      <span class="cgc-count">({{ country.totalReviews }} отзывов)</span>
    </div>

    <!-- Top 3 category mini-bars -->
    <div class="cgc-bars">
      <div v-for="cat in country.categoryStats.slice(0, 3)" :key="cat.category" class="cgc-bar-row">
        <span class="cgc-bar-label">{{ CAT_LABELS[cat.category] ?? cat.category }}</span>
        <div class="cgc-bar-track">
          <div class="cgc-bar-fill" :style="{ width: (cat.avg / 5 * 100) + '%' }" />
        </div>
        <span class="cgc-bar-score">{{ cat.avg }}</span>
      </div>
    </div>

    <!-- Bottom nationality pill -->
    <div class="cgc-nat">
      <span v-if="country.hasNatReviews" class="nat-pill nat-pill--green">Есть отзывы для вас</span>
      <span v-else class="nat-pill nat-pill--gray">Нет отзывов для вашей нац.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CountryStat } from '~/composables/useCountriesList'
import { getFlagEmoji } from '~/utils/countries'

const props = defineProps<{ country: CountryStat }>()
defineEmits<{ click: [] }>()

const flag = computed(() => getFlagEmoji(props.country.code))

const CAT_LABELS: Record<string, string> = {
  legalization: 'Легализация', attitude: 'Отношение',
  cost_of_living: 'Стоимость жизни', bureaucracy: 'Документы',
  cleanliness: 'Чистота', weather: 'Погода', safety: 'Безопасность',
  healthcare: 'Медицина', language_barrier: 'Язык', overall: 'Общая',
}
</script>

<style scoped>
.cgc {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cgc:hover { box-shadow: var(--shadow-hover); }

.cgc-top { display: flex; align-items: center; gap: 10px; }
.cgc-flag { font-size: 28px; line-height: 1; flex-shrink: 0; }
.cgc-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.cgc-name { font-size: 15px; font-weight: 600; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cgc-region {
  font-size: 11px;
  background: var(--color-bg-tertiary);
  color: var(--color-text-muted);
  border-radius: var(--radius-pill);
  padding: 2px 7px;
  display: inline-block;
  width: fit-content;
}

.cgc-rating { display: flex; align-items: center; gap: 8px; }
.cgc-score { font-size: 15px; font-weight: 600; color: var(--color-text); }
.cgc-count { font-size: 12px; color: var(--color-text-muted); }

.cgc-bars { display: flex; flex-direction: column; gap: 5px; }
.cgc-bar-row { display: flex; align-items: center; gap: 6px; }
.cgc-bar-label { font-size: 11px; color: var(--color-text-muted); width: 90px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cgc-bar-track { flex: 1; height: 4px; background: var(--color-border-subtle); border-radius: 2px; overflow: hidden; }
.cgc-bar-fill { height: 100%; background: var(--color-primary); border-radius: 2px; transition: width 0.4s ease; }
.cgc-bar-score { font-size: 11px; color: var(--color-text-muted); width: 24px; text-align: right; flex-shrink: 0; }

.cgc-nat { margin-top: 2px; }
.nat-pill {
  font-size: 11px;
  font-weight: 500;
  border-radius: var(--radius-pill);
  padding: 3px 9px;
  display: inline-block;
}
.nat-pill--green { background: var(--color-success-light); color: var(--color-success); }
.nat-pill--gray { background: var(--color-bg-tertiary); color: var(--color-text-muted); }
</style>
