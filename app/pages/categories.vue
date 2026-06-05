<template>
  <div class="cat-page">
    <div class="cat-container">
      <div class="cat-header">
        <h1>{{ $t('pages.categories.title') }}</h1>
        <p class="cat-lead">{{ $t('pages.categories.lead') }}</p>
      </div>

      <div class="cat-grid">
        <div v-for="cat in categories" :key="cat.key" class="cat-card">
          <div class="cat-icon-wrap">
            <svg v-if="cat.icon === 'shield'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            <svg v-else-if="cat.icon === 'users'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <svg v-else-if="cat.icon === 'dollar'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <svg v-else-if="cat.icon === 'badge'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <svg v-else-if="cat.icon === 'clipboard'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>
            <svg v-else-if="cat.icon === 'cloud'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
            <svg v-else-if="cat.icon === 'chat'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <svg v-else-if="cat.icon === 'heart'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <svg v-else-if="cat.icon === 'sparkles'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <h3 class="cat-name">{{ $t(`categories.${cat.key}.name`) }}</h3>
          <p class="cat-hint">{{ $t(`categories.${cat.key}.hint`) }}</p>
          <NuxtLinkLocale :to="`/countries?category=${cat.key}`" class="cat-link">
            {{ $t('common.buttons.seeAll') }}
          </NuxtLinkLocale>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('pages.categories.title'),
  description: () => t('seo.about.description'),
  robots: 'index, follow',
})

const categories = [
  { key: 'legalization',     icon: 'shield'    },
  { key: 'cost_of_living',   icon: 'dollar'    },
  { key: 'safety',           icon: 'badge'     },
  { key: 'bureaucracy',      icon: 'clipboard' },
  { key: 'weather',          icon: 'cloud'     },
  { key: 'language_barrier', icon: 'chat'      },
  { key: 'cleanliness',      icon: 'sparkles'  },
  { key: 'healthcare',       icon: 'heart'     },
  { key: 'overall',          icon: 'star'      },
]
</script>

<style scoped>
.cat-page { background: var(--color-bg-secondary); min-height: 100vh; padding: 40px 24px; }
.cat-container { max-width: 1000px; margin: 0 auto; }
.cat-header { text-align: center; margin-bottom: 40px; }
.cat-header h1 { font-size: 28px; font-weight: 700; margin: 0 0 10px; color: var(--color-text); }
.cat-lead { font-size: 16px; color: var(--color-text-secondary); margin: 0; }
.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
.cat-card {
  background: #fff; border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: 20px;
  display: flex; flex-direction: column; gap: 8px;
  transition: box-shadow 0.2s;
}
.cat-card:hover { box-shadow: var(--shadow-hover); }
.cat-icon-wrap {
  width: 44px; height: 44px;
  background: var(--color-primary-light);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.cat-name { font-size: 15px; font-weight: 600; color: var(--color-text); margin: 4px 0 0; }
.cat-hint { font-size: 13px; color: var(--color-text-secondary); margin: 0; line-height: 1.5; flex: 1; }
.cat-link {
  font-size: 12px; font-weight: 500; color: var(--color-primary);
  text-decoration: none; margin-top: 4px;
}
.cat-link:hover { text-decoration: underline; }
</style>
