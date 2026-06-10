<template>
  <div class="cat-card">
    <div class="cat-icon">
      <!-- Shield Check for legalization -->
      <svg v-if="item.category === 'legalization'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
      <!-- Currency Dollar for cost_of_living -->
      <svg v-else-if="item.category === 'cost_of_living'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
      <!-- Shield for safety -->
      <svg v-else-if="item.category === 'safety'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <!-- Cloud for weather -->
      <svg v-else-if="item.category === 'weather'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8"><circle cx="12" cy="12" r="10"/></svg>
    </div>
    <div class="cat-name">{{ $t(`categories.${item.category}.name`) }}</div>
    <div class="cat-score">{{ item.avgRating || '—' }}</div>
    <div class="cat-count">{{ item.total }} {{ $t('common.labels.reviews') }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ item: { category: string; total: number; avgRating: number } }>()
</script>

<style scoped>
.cat-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.cat-icon {
  width: 36px;
  height: 36px;
  background: var(--color-primary-light);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cat-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  margin-top: 2px;
}
.cat-score {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}
.cat-count {
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>
