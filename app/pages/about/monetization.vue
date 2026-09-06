<template>
  <div class="static-page">
    <div class="static-container">
      <h1>{{ $t('pages.monetization.title') }}</h1>
      <p class="static-lead">{{ $t('pages.monetization.lead') }}</p>
      <div
        v-for="(s, i) in ($tm('pages.monetization.sections') as any[])"
        :key="i"
        class="static-section"
      >
        <h3>{{ s.title }}</h3>
        <p>{{ s.text }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({
  title: () => t('seo.monetization.title'),
  description: () => t('seo.monetization.description'),
  robots: 'index, follow',
})
</script>

<style scoped>
.static-page { background: var(--color-bg-secondary); min-height: 100vh; padding: 40px 24px; }
.static-container { max-width: 760px; margin: 0 auto; }
.static-container h1 { font-size: 28px; font-weight: 700; margin: 0 0 12px; color: var(--color-text); }
.static-lead { font-size: 16px; color: var(--color-text-secondary); margin: 0 0 32px; line-height: 1.6; }
.static-section { background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 20px 24px; margin-bottom: 12px; }
.static-section h3 { font-size: 15px; font-weight: 600; margin: 0 0 8px; color: var(--color-text); }
.static-section p { font-size: 14px; color: var(--color-text-secondary); margin: 0; line-height: 1.6; }
</style>
