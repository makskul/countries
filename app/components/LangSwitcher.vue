<template>
  <div class="lang-switcher">
    <NuxtLink
      v-for="loc in availableLocales"
      :key="loc.code"
      :to="switchLocalePath(loc.code)"
      class="lang-option"
      :class="{ active: locale === loc.code }"
    >
      {{ { uk: 'UA', en: 'EN', ru: 'RU' }[loc.code] ?? loc.code.toUpperCase() }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const availableLocales = computed(() => locales.value)
</script>

<style scoped>
.lang-switcher {
  display: flex;
  align-items: center;
  gap: 2px;
}
.lang-option {
  font-size: 12px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  color: var(--color-text-muted);
  transition: background 0.15s, color 0.15s;
  user-select: none;
}
.lang-option:hover {
  color: var(--color-text-secondary);
}
.lang-option.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
</style>
