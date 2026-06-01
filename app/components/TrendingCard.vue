<template>
  <div class="trending-card" @click="$emit('click')">
    <div class="tc-row1">
      <span class="tc-flag">{{ flag }}</span>
      <span class="tc-name">{{ countryName }}</span>
      <span class="tc-count">{{ item.total }} отзывов</span>
    </div>
    <div class="tc-row2">
      <Rating :modelValue="item.avgRating" readonly :cancel="false" :stars="5" />
      <span class="tc-score">{{ item.avgRating }}</span>
    </div>
    <div class="tc-row3">
      <span
        v-for="(cat, idx) in item.topCategories.slice(0, 2)"
        :key="cat"
        class="tc-chip"
        :class="idx === 1 ? 'tc-chip--green' : ''"
      >{{ getCategoryLabel(cat) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCountryName, getFlagEmoji } from '~/utils/countries'

const props = defineProps<{
  item: { code: string; total: number; avgRating: number; topCategories: string[] }
}>()
defineEmits<{ click: [] }>()

const flag = computed(() => getFlagEmoji(props.item.code))
const countryName = computed(() => getCountryName(props.item.code))

function getCategoryLabel(key: string) {
  const map: Record<string, string> = {
    legalization: 'Легализация',
    attitude: 'Отношение',
    cost_of_living: 'Стоимость жизни',
    bureaucracy: 'Бюрократия',
    cleanliness: 'Чистота',
    weather: 'Климат',
    safety: 'Безопасность',
    healthcare: 'Медицина',
    language_barrier: 'Языковой барьер',
    overall: 'Общая оценка',
  }
  return map[key] ?? key
}
</script>

<style scoped>
.trending-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.trending-card:hover {
  box-shadow: var(--shadow-hover);
}
.tc-row1 {
  display: flex;
  align-items: center;
  gap: 6px;
}
.tc-flag { font-size: 22px; line-height: 1; }
.tc-name { font-size: 14px; font-weight: 600; color: var(--color-text); flex: 1; }
.tc-count { font-size: 11px; color: var(--color-text-muted); white-space: nowrap; }
.tc-row2 {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tc-score { font-size: 14px; font-weight: 600; color: var(--color-text); }
.tc-row3 {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.tc-chip {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 500;
  padding: 3px 9px;
  white-space: nowrap;
}
.tc-chip--green {
  background: var(--color-success-light);
  color: var(--color-success);
}
</style>
