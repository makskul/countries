/**
 * EPIC-1.3 empty-state campaign: target countries with 0 (or very few) UA reviews.
 * Refresh quarterly from admin stats (`country_stats` where author_nationality = 'UA').
 */
export const EMPTY_STATE_CAMPAIGN_NATIONALITY = 'UA'

/** Top-10 Triplandr targets prioritized for UA review supply (Sep 2026). */
export const EMPTY_STATE_CAMPAIGN_COUNTRIES = [
  'IS', // Iceland
  'MT', // Malta
  'CY', // Cyprus
  'LU', // Luxembourg
  'SI', // Slovenia
  'SK', // Slovakia
  'EE', // Estonia
  'LV', // Latvia
  'HR', // Croatia
  'BG', // Bulgaria
] as const

export type EmptyStateCampaignCountry = typeof EMPTY_STATE_CAMPAIGN_COUNTRIES[number]

export function isEmptyStateCampaignCountry(
  countryCode: string,
  nationality?: string,
): boolean {
  const nat = (nationality || EMPTY_STATE_CAMPAIGN_NATIONALITY).toUpperCase()
  if (nat !== EMPTY_STATE_CAMPAIGN_NATIONALITY) return false
  return EMPTY_STATE_CAMPAIGN_COUNTRIES.includes(countryCode.toUpperCase() as EmptyStateCampaignCountry)
}
