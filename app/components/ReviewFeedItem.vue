<template>
  <div class="rfi-card">

    <!-- Top block: country row + text — grows to fill available height -->
    <div class="rfi-top">
      <!-- Row 1: country flag + name + category icon | stars -->
      <div class="rfi-row1">
        <div class="rfi-left">
          <span class="rfi-flag">{{ targetFlag }}</span>
          <span class="rfi-country">{{ targetName }}</span>
          <span class="rfi-cat-icon" :class="`cat-${chosenEntry.key}`">
            <svg v-if="catIconName(chosenEntry.key) === 'shield'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            <svg v-else-if="catIconName(chosenEntry.key) === 'dollar'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <svg v-else-if="catIconName(chosenEntry.key) === 'badge'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <svg v-else-if="catIconName(chosenEntry.key) === 'clipboard'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>
            <svg v-else-if="catIconName(chosenEntry.key) === 'cloud'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
            <svg v-else-if="catIconName(chosenEntry.key) === 'chat'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <svg v-else-if="catIconName(chosenEntry.key) === 'heart'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <svg v-else-if="catIconName(chosenEntry.key) === 'sparkles'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </span>
        </div>
        <Rating :modelValue="displayRating" readonly :cancel="false" :stars="5" />
      </div>

      <!-- Comment with gray box -->
      <div v-if="displayComment" class="rfi-text-box">
        <p class="rfi-comment">{{ displayComment }}</p>
      </div>
    </div>

    <!-- Author row — always at bottom -->
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
import { CATEGORY_ICONS } from '~/utils/categories'
import { getFlagEmoji, timeAgo } from '~/utils/countries'

const { t } = useI18n()
const { getCountryNameLocalized } = useLocalizedCountries()

const props = defineProps<{ review: Review }>()

const targetFlag    = computed(() => getFlagEmoji(props.review.target_country))
const targetName    = computed(() => getCountryNameLocalized(props.review.target_country))
const authorFlag    = computed(() => getFlagEmoji(props.review.author_nationality))
const authorNatLabel = computed(() => getCountryNameLocalized(props.review.author_nationality))
const time          = computed(() => timeAgo(props.review.created_at))

function catIconName(key: string): string {
  return CATEGORY_ICONS[key] ?? 'star'
}

// Pick the best category: prefer one with a comment, fallback to highest rated
const chosenEntry = computed(() => {
  const ratings: Record<string, number>      = (props.review.ratings  as Record<string, number>)      ?? {}
  const comments: Record<string, string | null> = (props.review.comments as Record<string, string | null>) ?? {}

  const withComment = Object.entries(comments).find(([, text]) => text && text.trim().length > 0)
  if (withComment) {
    return { key: withComment[0], rating: ratings[withComment[0]] ?? 0, comment: withComment[1] ?? '' }
  }
  const highest = Object.entries(ratings).sort((a, b) => b[1] - a[1])[0]
  if (highest) return { key: highest[0], rating: highest[1], comment: '' }
  return { key: 'overall', rating: 0, comment: '' }
})

const displayRating  = computed(() => chosenEntry.value.rating)
const displayComment = computed(() => {
  const c = chosenEntry.value.comment
  if (!c) return ''
  return c.length > 200 ? c.slice(0, 200) + '…' : c
})
</script>

<style scoped>
.rfi-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Top block grows to fill space, content aligned to top */
.rfi-top {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.rfi-row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}
.rfi-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.rfi-flag    { font-size: 16px; }
.rfi-country { font-size: 13px; font-weight: 600; color: var(--color-text); }

.rfi-cat-icon {
  width: 22px; height: 22px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; flex-shrink: 0;
}
.rfi-cat-icon i { font-size: 11px; }

/* Category icon colors */
.cat-legalization      { background: #E1F5EE; color: #0F6E56; }
.cat-safety            { background: #FCEBEB; color: #A32D2D; }
.cat-weather           { background: #E6F1FB; color: #185FA5; }
.cat-cost_of_living    { background: #FAEEDA; color: #854F0B; }
.cat-bureaucracy       { background: #FCEBEB; color: #A32D2D; }
.cat-language_barrier  { background: var(--color-primary-light); color: var(--color-primary-dark); }
.cat-cleanliness       { background: #E1F5EE; color: #0F6E56; }
.cat-healthcare        { background: #E6F1FB; color: #185FA5; }
.cat-overall           { background: var(--color-primary-light); color: var(--color-primary-dark); }

.rfi-text-box {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
}
.rfi-comment {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Author row — always at bottom */
.rfi-row3 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}
.rfi-nationality { display: flex; align-items: center; gap: 4px; }
.rfi-nat-label   { font-size: 12px; color: var(--color-text-muted); }
.rfi-time        { font-size: 12px; color: var(--color-text-muted); }
.rfi-read        { font-size: 12px; color: var(--color-primary); text-decoration: none; white-space: nowrap; }
.rfi-read:hover  { text-decoration: underline; }
</style>
