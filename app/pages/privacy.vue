<template>
  <div style="max-width: 800px; margin: 60px auto; padding: 0 28px">
    <h1>Политика конфиденциальности</h1>
    <p style="color: var(--color-text-secondary)">Мы уважаем вашу конфиденциальность и не передаём данные третьим лицам.</p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({ title: () => t('seo.privacy.title'), description: () => t('seo.privacy.description'), robots: 'index, follow' })
</script>
