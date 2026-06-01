<template>
  <div class="cfb">
    <!-- Search -->
    <div class="cfb-search">
      <i class="pi pi-search cfb-search-icon" />
      <input
        v-model="localSearch"
        class="cfb-input"
        placeholder="Поиск страны..."
        type="text"
      />
    </div>

    <!-- Region filter -->
    <Select
      v-model="localRegion"
      :options="REGION_OPTIONS"
      optionLabel="label"
      optionValue="value"
      placeholder="Все регионы"
      class="cfb-select"
    />

    <!-- Category filter -->
    <Select
      v-model="localCategory"
      :options="CATEGORY_OPTIONS"
      optionLabel="label"
      optionValue="value"
      placeholder="Любая категория"
      class="cfb-select"
    />

    <!-- Spacer -->
    <div class="cfb-spacer" />

    <!-- Sort -->
    <Select
      v-model="localSort"
      :options="SORT_OPTIONS"
      optionLabel="label"
      optionValue="value"
      class="cfb-select cfb-sort"
    />

    <!-- Count -->
    <span class="cfb-count">Найдено {{ count }} стран</span>
  </div>
</template>

<script setup lang="ts">
import { REGION_OPTIONS } from '~/utils/regions'

const props = defineProps<{
  search: string
  region: string
  category: string
  sort: string
  count: number
}>()

const emit = defineEmits<{
  'update:search': [v: string]
  'update:region': [v: string]
  'update:category': [v: string]
  'update:sort': [v: string]
}>()

// debounced search
const localSearch = ref(props.search)
let debounceTimer: ReturnType<typeof setTimeout>
watch(localSearch, (v) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => emit('update:search', v), 300)
})

const localRegion = computed({
  get: () => props.region,
  set: (v) => emit('update:region', v),
})
const localCategory = computed({
  get: () => props.category,
  set: (v) => emit('update:category', v),
})
const localSort = computed({
  get: () => props.sort,
  set: (v) => emit('update:sort', v),
})

const CATEGORY_OPTIONS = [
  { label: 'Любая категория', value: '' },
  { label: 'Легализация', value: 'legalization' },
  { label: 'Стоимость жизни', value: 'cost_of_living' },
  { label: 'Безопасность', value: 'safety' },
  { label: 'Отношение', value: 'attitude' },
  { label: 'Документы', value: 'bureaucracy' },
  { label: 'Погода', value: 'weather' },
]

const SORT_OPTIONS = [
  { label: 'Популярные', value: 'popular' },
  { label: 'Лучший рейтинг', value: 'rating_desc' },
  { label: 'Худший рейтинг', value: 'rating_asc' },
  { label: 'Больше отзывов', value: 'reviews_desc' },
  { label: 'Недавно добавлены', value: 'recent' },
]
</script>

<style scoped>
.cfb {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.cfb-search {
  position: relative;
  flex: 0 0 200px;
}
.cfb-search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  font-size: 13px;
  pointer-events: none;
}
.cfb-input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 7px 10px 7px 30px;
  font-size: 13px;
  font-family: inherit;
  color: var(--color-text);
  background: #fff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.cfb-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(83, 74, 183, 0.12);
}
.cfb-input::placeholder { color: var(--color-text-muted); }
.cfb-select { font-size: 13px; flex-shrink: 0; }
.cfb-spacer { flex: 1; }
.cfb-sort { flex-shrink: 0; }
.cfb-count { font-size: 13px; color: var(--color-text-muted); white-space: nowrap; flex-shrink: 0; }
@media (max-width: 768px) {
  .cfb { gap: 8px; }
  .cfb-search { flex: 1 1 100%; }
  .cfb-spacer { display: none; }
  .cfb-count { width: 100%; }
}
</style>
