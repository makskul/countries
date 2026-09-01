import {
  AFFILIATE_AB_COOKIE,
  AFFILIATE_AB_COOKIE_MAX_AGE,
  assignAffiliateAb,
  parseAffiliateAbCookie,
  serializeAffiliateAb,
} from '~/utils/affiliateAb'

/** Assign affiliate A/B cookie on first visit so SSR and client render the same variant. */
export default defineNuxtRouteMiddleware(() => {
  const cookie = useCookie(AFFILIATE_AB_COOKIE, {
    maxAge: AFFILIATE_AB_COOKIE_MAX_AGE,
    sameSite: 'lax',
    path: '/',
  })

  if (parseAffiliateAbCookie(cookie.value)) return

  const seed = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  cookie.value = serializeAffiliateAb(assignAffiliateAb(seed))
})
