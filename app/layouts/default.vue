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
useHead({
  htmlAttrs: { lang: 'ru' },
  titleTemplate: '%s — NationView',
  meta: [
    { name: 'description', content: 'Реальные отзывы эмигрантов о странах — отфильтрованные по твоей национальности.' },
    { name: 'theme-color', content: '#534AB7' },
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  ],
})
</script>
