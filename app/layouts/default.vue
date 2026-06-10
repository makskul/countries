<template>
  <div style="display: flex; flex-direction: column; min-height: 100vh">
    <AppNavbar />
    <main style="flex: 1">
      <slot />
    </main>
    <AppFooter />
    <CookieBanner />
  </div>
</template>

<script setup lang="ts">
import { APP_NAME } from '~/utils/appConfig'
const { locale } = useI18n()
useHead({
  htmlAttrs: { lang: computed(() => locale.value) },
  titleTemplate: (title) => title ? `${title} — ${APP_NAME}` : APP_NAME,
  meta: [
    { name: 'theme-color', content: '#534AB7' },
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'preload', as: 'style', href: '/@fontsource/inter/400.css' },
  ],
})
</script>
