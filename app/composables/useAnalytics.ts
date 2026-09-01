type AnalyticsParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void
    gtag?: (...args: unknown[]) => void
  }
}

/** Product analytics hook — ready for GA4 / Plausible when EPIC-0.1 lands. */
export function useAnalytics() {
  function trackEvent(name: string, params?: AnalyticsParams) {
    if (!import.meta.client) return

    const props = params
      ? Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined),
        ) as Record<string, string | number | boolean>
      : undefined

    if (typeof window.plausible === 'function') {
      window.plausible(name, props ? { props } : undefined)
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, props)
    }
    if (import.meta.dev) {
      console.debug('[analytics]', name, props)
    }
  }

  function trackAffiliateClick(payload: {
    partner: string
    slot: string
    country?: string
    nat?: string
    vertical?: string
    ab_variant?: string
  }) {
    trackEvent('affiliate_click', payload)
  }

  function trackLeadSubmit(payload: { country: string; source: string }) {
    trackEvent('lead_submit', payload)
  }

  return { trackEvent, trackAffiliateClick, trackLeadSubmit }
}
