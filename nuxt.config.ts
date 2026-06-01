import Aura from '@primevue/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@primevue/nuxt-module', '@nuxtjs/supabase', '@pinia/nuxt'],
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
