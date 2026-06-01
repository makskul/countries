<template>
  <div class="rfi-card">
    <div class="rfi-row1">
      <div class="rfi-left">
        <span class="rfi-flag">{{ targetFlag }}</span>
        <span class="rfi-country">{{ targetName }}</span>
        <span class="rfi-chip">{{ categoryLabel }}</span>
      </div>
      <Rating :modelValue="displayRating" readonly :cancel="false" :stars="5" />
    </div>
    <p v-if="displayComment" class="rfi-comment">{{ displayComment }}</p>
    <div class="rfi-row3">
      <span class="rfi-nationality">
        <span>{{ authorFlag }}</span>
        <span class="rfi-nat-label">{{ authorNatLabel }}</span>
      </span>
      <span class="rfi-time">{{ time }}</span>
      <NuxtLinkLocale :to="`/country/${review.target_country.toLowerCase()}`" class="rfi-read">{{ $t('common.buttons.readMore') }}</NuxtLinkLocale>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Review } from '~/types/review'
import { CATEGORIES } from '~/types/review'
import { getFlagEmoji, timeAgo } from '~/utils/countries'

const { t } = useI18n()
const { getCountryNameLocalized } = useLocalizedCountries()

const props = defineProps<{ review: Review }>()

const targetFlag = computed(() => getFlagEmoji(props.review.target_country))
const targetName = computed(() => getCountryNameLocalized(props.review.target_country))
const authorFlag = computed(() => getFlagEmoji(props.review.author_nationality))
const authorNatLabel = computed(() => getCountryNameLocalized(props.review.author_nationality))
const time = computed(() => timeAgo(props.review.created_at))

// Pick the best category to display: prefer one with a comment, fallback to highest rated
const chosenEntry = computed(() => {
  const ratings: Record<string, number> = (props.review.ratings as Record<string, number>) ?? {}
  const comments: Record<string, string | null> = (props.review.comments as Record<string, string | null>) ?? {}

  const withComment = Object.entries(comments).find(([, text]) => text && text.trim().length > 0)
  if (withComment) {
    return { key: withComment[0], rating: ratings[withComment[0]] ?? 0, comment: withComment[1] ?? '' }
  }

  const highest = Object.entries(ratings).sort((a, b) => b[1] - a[1])[0]
  if (highest) {
    return { key: highest[0], rating: highest[1], comment: '' }
  }

  return { key: 'overall', rating: 0, comment: '' }
})

const categoryLabel = computed(() => t(`categories.${chosenEntry.value.key}.name`))
const displayRating = computed(() => chosenEntry.value.rating)
const displayComment = computed(() => {
  const c = chosenEntry.value.comment
  if (!c) return ''
  return c.length > 160 ? c.slice(0, 160) + '…' : c
})
</script>

<style scoped>
.rfi-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rfi-row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.rfi-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.rfi-flag { font-size: 16px; }
.rfi-country { font-size: 13px; font-weight: 600; color: var(--color-text); }
.rfi-chip {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
}
.rfi-comment {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rfi-row3 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.rfi-nationality {
  display: flex;
  align-items: center;
  gap: 4px;
}
.rfi-nat-label {
  font-size: 12px;
  color: var(--color-text-muted);
}
.rfi-time {
  font-size: 12px;
  color: var(--color-text-muted);
}
.rfi-read {
  font-size: 12px;
  color: var(--color-primary);
  text-decoration: none;
  cursor: pointer;
}
.rfi-read:hover { text-decoration: underline; }
</style>
