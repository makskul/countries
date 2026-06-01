<template>
  <div style="max-width: 800px; margin: 60px auto; padding: 0 28px">
    <h1>Правила сайта</h1>
    <p style="color: var(--color-text-secondary)">Правила публикации отзывов на NationView.</p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({ title: () => t('seo.rules.title'), description: () => t('seo.rules.description'), robots: 'index, follow' })
</script>
