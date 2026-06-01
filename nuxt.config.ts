import Aura from '@primevue/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/i18n', '@primevue/nuxt-module', '@nuxtjs/supabase', '@pinia/nuxt', '@nuxtjs/sitemap'],
  i18n: {
    locales: [
      { code: 'uk', name: 'Українська', language: 'uk-UA', file: 'uk/index.ts' },
      { code: 'en', name: 'English',    language: 'en-US', file: 'en/index.ts' },
      { code: 'ru', name: 'Русский',    language: 'ru-RU', file: 'ru/index.ts' },
    ],
    defaultLocale: 'uk',
    restructureDir: 'app',
    langDir: 'locales/',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'nv_locale',
      redirectOn: 'root',
      fallbackLocale: 'uk',
    },
    lazy: true,
  },
  css: [
    '@fontsource/inter/400.css',
    '@fontsource/inter/500.css',
    '@fontsource/inter/600.css',
    '~/assets/styles/tokens.css',
    '~/assets/styles/primevue.css',
    '~/assets/styles/global.css',
  ],
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: { darkModeSelector: false },
        extend: {
          semantic: {
            primary: {
              50:  '#EEEDFE',
              100: '#CECBF6',
              200: '#AFA9EC',
              300: '#9088E5',
              400: '#7F77DD',
              500: '#534AB7',
              600: '#4840A0',
              700: '#3C3489',
              800: '#2E2870',
              900: '#26215C',
            }
          }
        }
      }
    }
  },
  sitemap: {
    hostname: 'https://nationview.app',
    urls: [
      '/',
      '/countries',
      '/about',
      '/rules',
      '/privacy',
    ],
  },
  supabase: {
    redirect: false
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_KEY || ''
    }
  }
})
