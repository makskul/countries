import Aura from '@primevue/themes/aura'


export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  app: {
    head: {
      script: [
        {
          innerHTML: `(function(){var s=document.createElement("script");s.async=1;s.src='https://emrld.ltd/NTQ1NzIx.js?t=545721';document.head.appendChild(s);})();`,
          'data-noptimize': '1',
          'data-cfasync': 'false',
        },
      ],
    },
  },
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
  },
  css: [
    'primeicons/primeicons.css',
    '@fontsource/inter/400.css',
    '@fontsource/inter/500.css',
    '@fontsource/inter/600.css',
    '@fontsource/manrope/700.css',
    '@fontsource/manrope/800.css',
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
            },
            colorScheme: {
              light: {
                rating: {
                  icon: {
                    active: { color: '#EF9F27' },
                    hover:  { color: '#EF9F27' },
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  site: {
    url: 'https://triplandr.com'
  },
  sitemap: {
    // Static pages
    urls: [
      { loc: '/',          changefreq: 'weekly',  priority: 1.0, lastmod: '2026-07-08' },
      { loc: '/countries', changefreq: 'weekly',  priority: 0.9, lastmod: '2026-07-08' },
      { loc: '/compare',   changefreq: 'monthly', priority: 0.7, lastmod: '2026-07-08' },
      { loc: '/about',     changefreq: 'monthly', priority: 0.5, lastmod: '2026-07-08' },
      { loc: '/rules',     changefreq: 'monthly', priority: 0.4, lastmod: '2026-07-08' },
      { loc: '/privacy',   changefreq: 'monthly', priority: 0.4, lastmod: '2026-07-08' },
    ],
    // Dynamic pages from Supabase — fetched at build/runtime
    sources: [
      '/api/sitemap-urls',
    ],
  },
  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/admin/login',
      callback: '/confirm',
      exclude: ['/admin', '/admin/*'],
    },
  },
  runtimeConfig: {
    telegramBotToken:      process.env.TELEGRAM_BOT_TOKEN      || '',
    telegramAdminChatId:   process.env.TELEGRAM_ADMIN_CHAT_ID  || '',
    supabaseWebhookSecret: process.env.SUPABASE_WEBHOOK_SECRET || '',
    supabaseServiceKey:    process.env.SUPABASE_SERVICE_KEY    || '',
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_KEY || ''
    }
  }
})
