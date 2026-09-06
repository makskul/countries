/** Lightweight affiliate A/B buckets (EPIC-3.1). Persisted in cookie `nv_aff_ab`. */

export type SidebarAffiliatePosition = 'top' | 'bottom'
export type CompareAffiliateSurface = 'compare_on' | 'country_only'

export interface AffiliateAbState {
  sidebarPosition: SidebarAffiliatePosition
  compareSurface: CompareAffiliateSurface
}

export const AFFILIATE_AB_COOKIE = 'nv_aff_ab'
export const AFFILIATE_AB_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function pickVariant<T extends string>(options: readonly T[], seed: string): T {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return options[h % options.length]!
}

export function assignAffiliateAb(seed: string): AffiliateAbState {
  return {
    sidebarPosition: pickVariant(['top', 'bottom'] as const, `${seed}:sidebar`),
    compareSurface: pickVariant(['compare_on', 'country_only'] as const, `${seed}:surface`),
  }
}

export function parseAffiliateAbCookie(raw: string | null | undefined): AffiliateAbState | null {
  if (!raw) return null
  const [sidebar, surface] = raw.split(',')
  if (
    (sidebar === 'top' || sidebar === 'bottom')
    && (surface === 'compare_on' || surface === 'country_only')
  ) {
    return { sidebarPosition: sidebar, compareSurface: surface }
  }
  return null
}

export function serializeAffiliateAb(state: AffiliateAbState): string {
  return `${state.sidebarPosition},${state.compareSurface}`
}

/** Plausible `ab_variant` prop, e.g. `top_compare_on`. */
export function affiliateAbVariantLabel(state: AffiliateAbState): string {
  return `${state.sidebarPosition}_${state.compareSurface}`
}
