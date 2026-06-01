<template>
  <div style="display: flex; flex-direction: column; min-height: 100vh">
    <AppNavbar />
    <main style="flex: 1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
useHead({
  htmlAttrs: { lang: () => useI18n().locale.value },
  titleTemplate: (title) => title ? `${title} — NationView` : 'NationView',
  meta: [
    { name: 'theme-color', content: '#534AB7' },
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  ],
})
</script>
