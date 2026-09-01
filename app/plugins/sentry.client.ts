/**
 * Optional client error capture when NUXT_PUBLIC_SENTRY_DSN is set (EPIC-2.2.4).
 * Lightweight: no tracing, no default integrations — only vue/app errors.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const dsn = useRuntimeConfig().public.sentryDsn as string
  if (!dsn) return

  void import('@sentry/browser').then(({ init, captureException }) => {
    init({
      dsn,
      defaultIntegrations: false,
      integrations: [],
    })

    nuxtApp.hook('vue:error', (err) => {
      captureException(err)
    })

    nuxtApp.hook('app:error', (err) => {
      captureException(err)
    })
  })
})
