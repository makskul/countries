<script setup lang="ts">
import { FORM_CATEGORIES } from '~/composables/useReviewForm'

const props = defineProps<{
  ratings: Record<string, number>
  comments: Record<string, string>
  climate: string[]
}>()

const emit = defineEmits<{
  'update:ratings': [v: Record<string, number>]
  'update:comments': [v: Record<string, string>]
  'update:climate': [v: string[]]
}>()

const climateOptions = [
  { key: 'sunny', label: 'Солнечно', icon: '☀️' },
  { key: 'warm', label: 'Тепло', icon: '🌤️' },
  { key: 'rainy', label: 'Дождь', icon: '🌧️' },
  { key: 'cloudy', label: 'Облачно', icon: '🌥️' },
  { key: 'cold', label: 'Холодно', icon: '❄️' },
  { key: 'snow', label: 'Снег', icon: '🌨️' },
  { key: 'windy', label: 'Ветрено', icon: '💨' },
  { key: 'humid', label: 'Влажно', icon: '💧' },
]

function setRating(key: string, val: number) {
  emit('update:ratings', { ...props.ratings, [key]: val })
}

function setComment(key: string, val: string) {
  emit('update:comments', { ...props.comments, [key]: val })
}

function toggleClimate(key: string) {
  const next = props.climate.includes(key)
    ? props.climate.filter(k => k !== key)
    : [...props.climate, key]
  emit('update:climate', next)
}
</script>

<template>
  <div class="ratings-editor">
    <div v-for="cat in FORM_CATEGORIES" :key="cat.key" class="ratings-editor-row">
      <div class="ratings-editor-label">{{ cat.key }}</div>
      <template v-if="cat.key === 'weather'">
        <div class="weather-grid">
          <button
            v-for="opt in climateOptions"
            :key="opt.key"
            type="button"
            class="w-btn"
            :class="{ active: climate.includes(opt.key) }"
            @click="toggleClimate(opt.key)"
          >
            <span class="w-icon">{{ opt.icon }}</span>
            <span class="w-label">{{ opt.label }}</span>
          </button>
        </div>
      </template>
      <template v-else>
        <div class="ratings-editor-stars">
          <button
            v-for="i in 5"
            :key="i"
            type="button"
            class="star-btn"
            :class="{ active: (ratings[cat.key] ?? 0) >= i }"
            @click="setRating(cat.key, i)"
          >
            ★
          </button>
        </div>
      </template>
      <InputText
        :model-value="comments[cat.key] ?? ''"
        placeholder="Комментарий"
        class="w-full mt-2"
        @update:model-value="setComment(cat.key, String($event))"
      />
    </div>
  </div>
</template>

<style scoped>
.ratings-editor { display: flex; flex-direction: column; gap: 14px; }
.ratings-editor-row { border-bottom: 1px solid var(--color-border); padding-bottom: 12px; }
.ratings-editor-label { font-size: 12px; font-weight: 600; text-transform: capitalize; margin-bottom: 6px; }
.ratings-editor-stars { display: flex; gap: 4px; }
.star-btn {
  border: none; background: none; font-size: 20px; cursor: pointer;
  color: var(--color-border); padding: 0; line-height: 1;
}
.star-btn.active { color: var(--color-star); }
.mt-2 { margin-top: 8px; }
</style>
