<template>
  <div style="max-width: 800px; margin: 60px auto; padding: 0 28px">
    <h1>Связаться с нами</h1>
    <p style="color: var(--color-text-secondary)">Напишите нам: <a href="mailto:hello@nationview.app">hello@nationview.app</a></p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({ title: () => t('seo.contact.title'), description: () => t('seo.contact.description'), robots: 'noindex, nofollow' })
</script>
