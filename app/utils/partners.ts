export type PartnerVertical = 'visa' | 'insurance' | 'housing'

export type PartnerSlot = 'sidebar' | 'compare' | 'map'

export interface PartnerConfig {
  slug: string
  vertical: PartnerVertical
  /** i18n key under partners.{slug} */
  labelKey: string
  ctaKey: string
  /** Base URL; placeholders: {country}, {nat}, {slot} */
  url: string
  utm: {
    source: string
    medium: string
    campaign: string
  }
  /** ISO nationality codes; omit = all nationalities */
  natFilter?: string[]
  slots: PartnerSlot[]
}

export interface PartnerContext {
  slot: PartnerSlot
  country?: string
  nat?: string
  vertical?: PartnerVertical
}

const PARTNERS: PartnerConfig[] = [
  {
    slug: 'safetywing',
    vertical: 'insurance',
    labelKey: 'partners.safetywing.label',
    ctaKey: 'partners.safetywing.cta',
    url: 'https://safetywing.com/?referenceID=triplandr&utm_source={utm_source}&utm_medium={utm_medium}&utm_campaign={utm_campaign}',
    utm: { source: 'triplandr', medium: 'affiliate', campaign: 'safetywing' },
    slots: ['sidebar', 'compare', 'map'],
  },
  {
    slug: 'ivisa',
    vertical: 'visa',
    labelKey: 'partners.ivisa.label',
    ctaKey: 'partners.ivisa.cta',
    url: 'https://www.ivisa.com/?utm_source={utm_source}&utm_medium={utm_medium}&utm_campaign={utm_campaign}&country={country}',
    utm: { source: 'triplandr', medium: 'affiliate', campaign: 'ivisa' },
    slots: ['sidebar', 'compare', 'map'],
  },
  {
    slug: 'uaVisaAgent',
    vertical: 'visa',
    labelKey: 'partners.uaVisaAgent.label',
    ctaKey: 'partners.uaVisaAgent.cta',
    url: 'https://example.com/ua-visa-agent?utm_source={utm_source}&utm_medium={utm_medium}&utm_campaign={utm_campaign}&nat={nat}&country={country}',
    utm: { source: 'triplandr', medium: 'affiliate', campaign: 'ua_visa' },
    natFilter: ['UA'],
    slots: ['sidebar', 'compare', 'map'],
  },
  {
    slug: 'wise',
    vertical: 'housing',
    labelKey: 'partners.wise.label',
    ctaKey: 'partners.wise.cta',
    url: 'https://wise.com/invite/triplandr?utm_source={utm_source}&utm_medium={utm_medium}&utm_campaign={utm_campaign}',
    utm: { source: 'triplandr', medium: 'affiliate', campaign: 'wise' },
    slots: ['sidebar'],
  },
  {
    slug: 'housingAnywhere',
    vertical: 'housing',
    labelKey: 'partners.housingAnywhere.label',
    ctaKey: 'partners.housingAnywhere.cta',
    url: 'https://housinganywhere.com/?utm_source={utm_source}&utm_medium={utm_medium}&utm_campaign={utm_campaign}&country={country}',
    utm: { source: 'triplandr', medium: 'affiliate', campaign: 'housing' },
    slots: ['sidebar', 'map'],
  },
]

export function getPartnersForContext(ctx: PartnerContext): PartnerConfig[] {
  const nat = ctx.nat?.toUpperCase()
  return PARTNERS.filter(p => {
    if (!p.slots.includes(ctx.slot)) return false
    if (ctx.vertical && p.vertical !== ctx.vertical) return false
    if (p.natFilter?.length && (!nat || !p.natFilter.includes(nat))) return false
    return true
  })
}

/** Prefer visa + insurance for sidebar/map; first match for compare CTA. */
export function getPrimaryPartners(ctx: PartnerContext, limit = 2): PartnerConfig[] {
  const all = getPartnersForContext(ctx)
  const order: PartnerVertical[] = ['visa', 'insurance', 'housing']
  const picked: PartnerConfig[] = []
  for (const vertical of order) {
    const match = all.find(p => p.vertical === vertical && !picked.includes(p))
    if (match) picked.push(match)
    if (picked.length >= limit) break
  }
  return picked.length ? picked : all.slice(0, limit)
}

export function resolvePartnerUrl(partner: PartnerConfig, ctx: PartnerContext): string {
  const params: Record<string, string> = {
    utm_source: partner.utm.source,
    utm_medium: partner.utm.medium,
    utm_campaign: `${partner.utm.campaign}_${ctx.slot}`,
    country: (ctx.country ?? '').toLowerCase(),
    nat: (ctx.nat ?? '').toLowerCase(),
    slot: ctx.slot,
  }
  return partner.url.replace(/\{(\w+)\}/g, (_, key: string) => encodeURIComponent(params[key] ?? ''))
}

export function getCompareWinnerPartner(ctx: Omit<PartnerContext, 'vertical'>): PartnerConfig | null {
  const visa = getPartnersForContext({ ...ctx, vertical: 'visa' })
  return visa[0] ?? getPartnersForContext(ctx)[0] ?? null
}
