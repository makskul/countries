<template>
  <div class="about-page">
    <div class="about-container">
      <div class="about-header">
        <span class="about-pill">{{ $t('pages.about.pill') }}</span>
        <h1>{{ $t('pages.about.title') }}</h1>
        <p class="about-lead">{{ $t('pages.about.lead') }}</p>
      </div>

      <div class="about-steps">
        <div v-for="(step, i) in ($tm('pages.about.steps') as any[])" :key="i" class="about-step">
          <div class="step-num">{{ i + 1 }}</div>
          <div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
          </div>
        </div>
      </div>

      <div class="about-mission">
        <h2>{{ $t('pages.about.missionTitle') }}</h2>
        <p>{{ $t('pages.about.mission1') }}</p>
        <p>{{ $t('pages.about.mission2') }}</p>
      </div>

      <div class="about-cta">
        <h2>{{ $t('pages.about.ctaTitle') }}</h2>
        <p>{{ $t('pages.about.ctaText') }}</p>
        <NuxtLinkLocale to="/review/new">
          <button class="about-btn">{{ $t('pages.about.ctaBtn') }}</button>
        </NuxtLinkLocale>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({
  title: () => t('seo.about.title'),
  description: () => t('seo.about.description'),
  robots: 'index, follow',
})
</script>

<style scoped>
/* keep the existing styles unchanged */
.about-page { background: var(--color-bg-secondary); min-height: 100vh; padding: 40px 24px; }
.about-container { max-width: 760px; margin: 0 auto; }
.about-header { text-align: center; margin-bottom: 48px; }
.about-pill {
  display: inline-block;
  background: var(--color-primary-light); color: var(--color-primary);
  font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em;
  border-radius: var(--radius-pill); padding: 5px 12px; margin-bottom: 16px;
}
.about-header h1 { font-size: 32px; font-weight: 700; margin: 0 0 12px; color: var(--color-text); }
.about-lead { font-size: 17px; color: var(--color-text-secondary); line-height: 1.6; margin: 0; }
.about-steps { display: flex; flex-direction: column; gap: 0; margin-bottom: 48px; }
.about-step {
  display: flex; align-items: flex-start; gap: 20px;
  background: #fff; border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: 20px 24px; margin-bottom: 10px;
}
.step-num {
  width: 36px; height: 36px; flex-shrink: 0;
  background: var(--color-primary); color: #fff;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700;
}
.about-step h3 { font-size: 16px; font-weight: 600; margin: 0 0 6px; color: var(--color-text); }
.about-step p { font-size: 14px; color: var(--color-text-secondary); margin: 0; line-height: 1.6; }
.about-mission {
  background: #fff; border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: 28px; margin-bottom: 24px;
}
.about-mission h2 { font-size: 20px; font-weight: 600; margin: 0 0 16px; color: var(--color-text); }
.about-mission p { font-size: 15px; color: var(--color-text-secondary); line-height: 1.7; margin: 0 0 12px; }
.about-cta {
  background: var(--color-primary-light); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: 32px; text-align: center;
}
.about-cta h2 { font-size: 20px; font-weight: 600; margin: 0 0 8px; color: var(--color-primary-dark); }
.about-cta p { font-size: 14px; color: var(--color-text-secondary); margin: 0 0 20px; }
.about-btn {
  background: var(--color-primary); color: #fff; border: none;
  border-radius: var(--radius-pill); padding: 11px 24px;
  font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: background 0.15s;
}
.about-btn:hover { background: var(--color-primary-hover); }
</style>
