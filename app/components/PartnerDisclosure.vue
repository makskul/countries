<template>
  <p class="partner-disclosure" :class="{ compact }">
    {{ $t('partners.disclosure') }}
  </p>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  compact?: boolean
}>(), {
  compact: false,
})
</script>

<style scoped>
.partner-disclosure {
  margin: 6px 0 0;
  font-size: 10px;
  line-height: 1.4;
  color: var(--color-text-muted);
}
.partner-disclosure.compact {
  margin-top: 4px;
  font-size: 9px;
}
</style>
