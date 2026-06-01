<template>
  <div class="rc-card">
    <div v-for="cat in filledCategories" :key="cat" class="rc-entry">
      <!-- Row 1 -->
      <div class="rc-row1">
        <span class="rc-chip">{{ $t(`categories.${cat}.name`) }}</span>
        <Rating :modelValue="review.ratings[cat]" readonly :cancel="false" :stars="5" />
      </div>
      <!-- Comment -->
      <p v-if="review.comments[cat]" class="rc-comment">{{ review.comments[cat] }}</p>
    </div>

    <!-- Footer -->
    <div class="rc-row3">
      <span class="rc-author">{{ getFlagEmoji(review.author_nationality) }} {{ getCountryNameLocalized(review.author_nationality) }}</span>
      <span class="rc-time">{{ time }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getFlagEmoji, timeAgo } from '~/utils/countries'
import { CATEGORIES } from '~/utils/categories'
import type { RawReview } from '~/composables/useCountryPage'

const { getCountryNameLocalized } = useLocalizedCountries()
const props = defineProps<{ review: RawReview }>()
const time = computed(() => timeAgo(props.review.created_at))

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
</style>
