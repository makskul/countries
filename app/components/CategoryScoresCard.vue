<template>
  <div class="csc-card">
    <span class="csc-title">{{ $t('country.scores.title') }}</span>

    <div v-if="pending" class="csc-list">
      <div v-for="i in 4" :key="i" class="csc-row">
        <Skeleton width="28px" height="28px" style="border-radius: 7px; flex-shrink: 0" />
        <Skeleton width="80px" height="12px" />
        <Skeleton style="flex: 1; height: 5px" />
        <Skeleton width="26px" height="13px" />
      </div>
    </div>

    <div v-else-if="!stats || stats.length === 0" class="csc-empty">{{ $t('common.labels.noData') }}</div>

    <div v-else class="csc-list">
      <div v-for="row in stats" :key="row.category" class="csc-row">
        <div class="csc-icon">
          <svg v-if="row.category === 'legalization'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          <svg v-else-if="row.category === 'attitude'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <svg v-else-if="row.category === 'cost_of_living'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <svg v-else-if="row.category === 'safety'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <svg v-else-if="row.category === 'bureaucracy'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
          <svg v-else-if="row.category === 'healthcare'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          <svg v-else-if="row.category === 'weather' || row.category === 'cleanliness'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <span class="csc-cat-name">{{ $t(`categories.${row.category}.name`) }}</span>
        <div class="csc-bar-wrap">
          <div class="csc-bar-fill" :style="{ width: row.barWidth + '%', background: barCss(row.color) }" />
        </div>
        <span class="csc-score">{{ row.avg }}</span>
        <span class="csc-count">{{ row.count }} {{ $t('common.labels.reviews') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stats: { category: string; label: string; avg: number | null; count: number; barWidth: number; color: string }[] | null
  pending: boolean
}>()

function barCss(color: string): string {
  if (color === 'success') return 'var(--color-success)'
  if (color === 'warning') return 'var(--color-warning)'
  if (color === 'danger')  return 'var(--color-danger)'
  return 'var(--color-border)'
}
</script>

<style scoped>
.csc-card { background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 14px; }
.csc-title { font-size: 13px; font-weight: 600; color: var(--color-text); display: block; margin-bottom: 14px; }
.csc-empty { font-size: 12px; color: var(--color-text-muted); }
.csc-list { display: flex; flex-direction: column; gap: 10px; }
.csc-row { display: flex; align-items: center; gap: 8px; }
.csc-icon { width: 28px; height: 28px; flex-shrink: 0; background: var(--color-primary-light); border-radius: 7px; display: flex; align-items: center; justify-content: center; }
.csc-cat-name { font-size: 12px; color: var(--color-text-secondary); width: 80px; flex-shrink: 0; }
.csc-bar-wrap { flex: 1; height: 5px; background: var(--color-bg-tertiary); border-radius: var(--radius-pill); overflow: hidden; }
.csc-bar-fill { height: 100%; border-radius: var(--radius-pill); transition: width 0.4s ease; }
.csc-score { font-size: 13px; font-weight: 600; color: var(--color-text); width: 26px; text-align: right; flex-shrink: 0; }
.csc-count { font-size: 11px; color: var(--color-text-muted); width: 48px; text-align: right; flex-shrink: 0; }
</style>
