/**
 * Loads Plausible Analytics when NUXT_PUBLIC_PLAUSIBLE_DOMAIN is set.
 * Queues custom events until the script is ready.
 */
export default defineNuxtPlugin(() => {
  const { public: { plausibleDomain } } = useRuntimeConfig()
  if (!plausibleDomain) return

  if (!window.plausible) {
    window.plausible = function (...args: unknown[]) {
      (window.plausible!.q = window.plausible!.q || []).push(args)
    }
    window.plausible.q = []
  }

  if (document.querySelector('script[data-plausible]')) return

  const script = document.createElement('script')
  script.defer = true
  script.dataset.domain = plausibleDomain
  script.dataset.plausible = '1'
  script.src = 'https://plausible.io/js/script.js'
  document.head.appendChild(script)
})
