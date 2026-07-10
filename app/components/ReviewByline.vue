<template>
  <div class="review-byline" :class="{ 'review-byline--compact': compact, 'review-byline--stack': stack }">
    <span class="rb-part rb-from">
      <span class="rb-label">{{ $t('common.reviewAttribution.from') }}</span>
      <span class="rb-flag" aria-hidden="true">{{ fromFlag }}</span>
      <span class="rb-name">{{ fromName }}</span>
    </span>
    <span class="rb-sep" aria-hidden="true">→</span>
    <span class="rb-part rb-about">
      <span class="rb-label">{{ $t('common.reviewAttribution.about') }}</span>
      <span class="rb-flag" aria-hidden="true">{{ aboutFlag }}</span>
      <span class="rb-name">{{ aboutName }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { getFlagEmoji } from '~/utils/countries'

const props = withDefaults(defineProps<{
  from: string
  about: string
  compact?: boolean
  stack?: boolean
}>(), {
  compact: false,
  stack: false,
})

const { getCountryNameLocalized } = useLocalizedCountries()

const fromFlag = computed(() => getFlagEmoji(props.from))
const aboutFlag = computed(() => getFlagEmoji(props.about))
const fromName = computed(() => getCountryNameLocalized(props.from))
const aboutName = computed(() => getCountryNameLocalized(props.about))
</script>

<style scoped>
.review-byline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  line-height: 1.35;
}

.review-byline--stack {
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.review-byline--stack .rb-sep {
  display: none;
}

.rb-part {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.rb-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-muted, #6b7280);
  text-transform: lowercase;
}

.rb-flag {
  font-size: 14px;
  line-height: 1;
}

.rb-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text, #1a1730);
}

.rb-sep {
  font-size: 12px;
  color: var(--color-text-muted, #6b7280);
  flex-shrink: 0;
}

.review-byline--compact .rb-label {
  font-size: 10px;
}

.review-byline--compact .rb-flag {
  font-size: 12px;
}

.review-byline--compact .rb-name {
  font-size: 12px;
}

.review-byline--stack .rb-about .rb-name {
  font-weight: 700;
}

.review-byline--stack .rb-from .rb-name {
  font-weight: 600;
}
</style>
