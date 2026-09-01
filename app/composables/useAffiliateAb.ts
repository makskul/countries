import {
  AFFILIATE_AB_COOKIE,
  AFFILIATE_AB_COOKIE_MAX_AGE,
  assignAffiliateAb,
  affiliateAbVariantLabel,
  parseAffiliateAbCookie,
  serializeAffiliateAb,
  type AffiliateAbState,
} from '~/utils/affiliateAb'

const DEFAULT_STATE: AffiliateAbState = {
  sidebarPosition: 'top',
  compareSurface: 'compare_on',
}

/** Read or assign affiliate A/B buckets (sidebar position + compare surface). */
export function useAffiliateAb() {
  const cookie = useCookie(AFFILIATE_AB_COOKIE, {
    maxAge: AFFILIATE_AB_COOKIE_MAX_AGE,
    sameSite: 'lax',
    path: '/',
  })

  const state = computed<AffiliateAbState>(() =>
    parseAffiliateAbCookie(cookie.value) ?? DEFAULT_STATE,
  )

  function ensureAssigned() {
    if (parseAffiliateAbCookie(cookie.value)) return
    const seed = import.meta.client && typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    cookie.value = serializeAffiliateAb(assignAffiliateAb(seed))
  }

  const sidebarAtTop = computed(() => state.value.sidebarPosition === 'top')
  const sidebarAtBottom = computed(() => state.value.sidebarPosition === 'bottom')
  const showCompareAffiliate = computed(() => state.value.compareSurface === 'compare_on')
  const abVariant = computed(() => affiliateAbVariantLabel(state.value))

  return {
    state,
    ensureAssigned,
    sidebarAtTop,
    sidebarAtBottom,
    showCompareAffiliate,
    abVariant,
  }
}
