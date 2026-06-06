<template>
  <div class="static-page">
    <div class="static-container">
      <h1>{{ $t('pages.contact.title') }}</h1>
      <p class="static-lead">{{ $t('pages.contact.lead') }}</p>
      <div class="static-section">
        <h3>{{ $t('pages.contact.email') }}</h3>
        <p><a :href="`mailto:${$t('pages.contact.address')}`" style="color: var(--color-primary)">{{ $t('pages.contact.address') }}</a></p>
      </div>
      <div class="static-section">
        <h3>{{ $t('pages.contact.social') }}</h3>
        <p>
          <a href="https://t.me/zeemler" target="_blank" style="color: var(--color-primary); margin-right: 16px">Telegram</a>
          <a href="https://twitter.com/zeemler" target="_blank" style="color: var(--color-primary); margin-right: 16px">X / Twitter</a>
          <a href="https://instagram.com/zeemler" target="_blank" style="color: var(--color-primary)">Instagram</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({ title: () => t('seo.contact.title'), description: () => t('seo.contact.description'), robots: 'noindex, nofollow' })
</script>

<style scoped>
.static-page { background: var(--color-bg-secondary); min-height: 100vh; padding: 40px 24px; }
.static-container { max-width: 760px; margin: 0 auto; }
.static-container h1 { font-size: 28px; font-weight: 700; margin: 0 0 12px; color: var(--color-text); }
.static-lead { font-size: 16px; color: var(--color-text-secondary); margin: 0 0 32px; }
.static-section { background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 20px 24px; margin-bottom: 12px; }
.static-section h3 { font-size: 15px; font-weight: 600; margin: 0 0 8px; color: var(--color-text); }
.static-section p { font-size: 14px; color: var(--color-text-secondary); margin: 0; line-height: 1.6; }
</style>
