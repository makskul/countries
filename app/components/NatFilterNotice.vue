<template>
  <div class="nfn">
    <span class="nfn-text">
      {{ $t('country.natFilter.showing') }}
      <span class="nfn-flag">{{ getFlagEmoji(nationality) }}</span>
      <strong>{{ getCountryName(nationality) }}</strong>
    </span>
    <button class="nfn-change" @click="$emit('change')">{{ $t('country.natFilter.change') }}</button>
  </div>
</template>

<script setup lang="ts">
import { getFlagEmoji, getCountryName } from '~/utils/countries'
defineProps<{ nationality: string }>()
defineEmits<{ change: [] }>()
</script>

<style scoped>
.nfn {
  background: var(--color-primary-light);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  margin-bottom: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.nfn-text { font-size: 12px; color: var(--color-primary-dark); display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.nfn-flag { font-size: 16px; }
.nfn-change { background: none; border: none; font-size: 12px; color: var(--color-primary); cursor: pointer; font-family: inherit; padding: 0; font-weight: 500; }
.nfn-change:hover { text-decoration: underline; }
</style>
