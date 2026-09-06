/** Product analytics events tracked via Plausible (see app/plugins/plausible.client.ts). */

export type ProductEvent =
  | 'nat_set'
  | 'review_submit'
  | 'compare_run'
  | 'affiliate_click'
  | 'lead_submit'
  | 'map_country_select'
  | 'auth_signup_start'
  | 'auth_signup_complete'
  | 'auth_login'
  | 'review_claim'

export type ProductEventProps = {
  nat_set: { nationality: string; source?: string }
  review_submit: { country: string; nationality: string; has_city?: boolean }
  compare_run: { countries: string; nationality?: string }
  affiliate_click: { partner: string; country?: string; placement: string; ab_variant?: string }
  lead_submit: { country: string; source: string }
  map_country_select: { country: string; has_reviews: boolean }
  auth_signup_start: { method: string }
  auth_signup_complete: { method: string }
  auth_login: Record<string, never>
  review_claim: { review_id: string }
}

declare global {
  interface Window {
    plausible?: {
      (event: string, options?: { props?: Record<string, string | number | boolean> }): void
      q?: unknown[]
    }
  }
}

/** Fire a product event when Plausible is loaded (no-op on server or without site ID). */
export function trackEvent<E extends ProductEvent>(
  event: E,
  props: ProductEventProps[E],
): void {
  if (!import.meta.client) return
  try {
    window.plausible?.(event, {
      props: Object.fromEntries(
        Object.entries(props as Record<string, unknown>)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => [k, typeof v === 'boolean' ? String(v) : String(v)]),
      ),
    })
  } catch {
    // analytics must never break UX
  }
}
