<template>
  <div class="sidebar">
    <!-- Card 1: Actions -->
    <div class="s-card">
      <NuxtLink :to="`/review/new?country=${countryCode}`">
        <button class="s-btn-primary">+ Написать отзыв о {{ countryName }}</button>
      </NuxtLink>
      <button class="s-btn-secondary" @click="handleShare">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        Поделиться страницей
      </button>
    </div>

    <!-- Card 2: Quick facts -->
    <div class="s-card" v-if="meta">
      <span class="s-card-title">Быстрая справка</span>
      <div class="s-facts">
        <div class="s-fact-row" v-if="visaInfo">
          <span class="s-fact-label">Виза</span>
          <span class="s-fact-val" :class="`s-fact--${visaInfo.severity}`">{{ visaInfo.label }}</span>
        </div>
        <div class="s-fact-row">
          <span class="s-fact-label">Стоимость жизни</span>
          <span class="s-fact-val" :class="costClass">{{ meta.costLevel }}</span>
        </div>
        <div class="s-fact-row">
          <span class="s-fact-label">Язык</span>
          <span class="s-fact-val">{{ meta.language }}</span>
        </div>
        <div class="s-fact-row">
          <span class="s-fact-label">Валюта</span>
          <span class="s-fact-val">{{ meta.currency }}</span>
        </div>
        <div class="s-fact-row">
          <span class="s-fact-label">Срок ВНЖ</span>
          <span class="s-fact-val">{{ meta.residencyMonths }}</span>
        </div>
        <div class="s-fact-row" style="border: none">
          <span class="s-fact-label">Климат</span>
          <span class="s-fact-val">{{ meta.climate }}</span>
        </div>
      </div>
    </div>

    <!-- Card 3: Similar countries -->
    <div class="s-card" v-if="similar && similar.length">
      <span class="s-card-title">Похожие страны</span>
      <div class="s-similar">
        <div
          v-for="c in similar"
          :key="c.code"
          class="s-similar-row"
          @click="router.push(`/country/${c.code.toLowerCase()}`)"
        >
          <span class="s-similar-left">
            {{ getFlagEmoji(c.code) }}
            <span class="s-similar-name">{{ getCountryName(c.code) }}</span>
          </span>
          <span class="s-similar-right">{{ c.avgRating }} ★ →</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getFlagEmoji, getCountryName } from '~/utils/countries'
import { getCountryMeta } from '~/utils/countryMeta'
import { getVisaInfo } from '~/utils/visaInfo'

const props = defineProps<{
  countryCode: string
  nationality: string
  similar: { code: string; avgRating: number }[] | null
}>()

const router = useRouter()
const countryName = computed(() => getCountryName(props.countryCode))
const meta = computed(() => getCountryMeta(props.countryCode))
const visaInfo = computed(() => props.nationality ? getVisaInfo(props.nationality, props.countryCode) : null)
const costClass = computed(() => {
  const m = meta.value
  if (!m) return ''
  if (m.costLevel === 'Низкая') return 's-fact--success'
  if (m.costLevel === 'Средняя') return 's-fact--warning'
  return 's-fact--danger'
})

async function handleShare() {
  const url = window.location.href
  if (navigator.share) {
    await navigator.share({ title: `NationView — ${countryName.value}`, url })
  } else {
    await navigator.clipboard.writeText(url)
  }
}
</script>

<style scoped>
.sidebar { display: flex; flex-direction: column; gap: 12px; }
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
  width: 100%; background: var(--color-primary); color: #fff;
  border: none; border-radius: var(--radius-md);
  padding: 11px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
  text-align: center;
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
.s-card-title { font-size: 13px; font-weight: 600; color: var(--color-text); }
.s-facts { display: flex; flex-direction: column; }
.s-fact-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-subtle);
  gap: 8px;
}
.s-fact-label { font-size: 12px; color: var(--color-text-secondary); flex-shrink: 0; }
.s-fact-val { font-size: 12px; font-weight: 600; color: var(--color-text); text-align: right; }
.s-fact--success { color: var(--color-success) !important; }
.s-fact--warning { color: var(--color-warning) !important; }
.s-fact--danger { color: var(--color-danger) !important; }
.s-fact--neutral { color: var(--color-text-muted) !important; }
.s-similar { display: flex; flex-direction: column; }
.s-similar-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 6px; border-radius: var(--radius-sm);
  cursor: pointer; transition: background 0.15s;
  gap: 8px;
}
.s-similar-row:hover { background: var(--color-bg-secondary); }
.s-similar-left { display: flex; align-items: center; gap: 6px; }
.s-similar-name { font-size: 12px; color: var(--color-text-secondary); }
.s-similar-right { font-size: 12px; color: var(--color-primary); white-space: nowrap; }
</style>
