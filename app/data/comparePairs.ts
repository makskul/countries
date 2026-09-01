import { canonicalCompareCodes, parseCompareSlug, toCompareSlug } from '~/utils/compareSlug'

/** Curated UA-relevant country pairs for SEO compare pages (50 unique slugs). */
export const COMPARE_PAIRS: readonly (readonly [string, string])[] = [
  ['PL', 'DE'],
  ['PL', 'CZ'],
  ['PL', 'NL'],
  ['PL', 'ES'],
  ['PL', 'PT'],
  ['PL', 'IT'],
  ['PL', 'FR'],
  ['PL', 'GB'],
  ['PL', 'AT'],
  ['PL', 'CH'],
  ['PL', 'BE'],
  ['PL', 'SE'],
  ['PL', 'NO'],
  ['PL', 'DK'],
  ['PL', 'FI'],
  ['PL', 'IE'],
  ['PL', 'RO'],
  ['PL', 'BG'],
  ['PL', 'HU'],
  ['PL', 'SK'],
  ['PL', 'LT'],
  ['PL', 'LV'],
  ['PL', 'EE'],
  ['PL', 'HR'],
  ['PL', 'SI'],
  ['PL', 'CY'],
  ['DE', 'NL'],
  ['DE', 'CZ'],
  ['DE', 'AT'],
  ['DE', 'CH'],
  ['DE', 'ES'],
  ['DE', 'PT'],
  ['DE', 'IT'],
  ['DE', 'FR'],
  ['DE', 'GB'],
  ['CZ', 'SK'],
  ['CZ', 'AT'],
  ['ES', 'PT'],
  ['ES', 'IT'],
  ['ES', 'FR'],
  ['GE', 'TR'],
  ['GE', 'DE'],
  ['GE', 'PL'],
  ['TR', 'DE'],
  ['TR', 'NL'],
  ['NL', 'BE'],
  ['AT', 'CH'],
  ['FR', 'BE'],
  ['GB', 'IE'],
  ['US', 'CA'],
  ['IL', 'DE'],
  ['KZ', 'PL'],
  ['BY', 'PL'],
  ['GR', 'DE'],
] as const

/** Deduplicated canonical slugs for sitemap and routing. */
export const COMPARE_PAIR_SLUGS: string[] = [
  ...new Set(COMPARE_PAIRS.map(([a, b]) => toCompareSlug(a, b))),
]

/** First curated pair that includes `code`, for internal compare links. */
export function getFeaturedCompareSlug(countryCode: string): string | null {
  const slugs = getCompareSlugsForCountry(countryCode, 1)
  return slugs[0] ?? null
}

/** Curated compare slugs that include `code` (for hub internal links). */
export function getCompareSlugsForCountry(countryCode: string, limit = 3): string[] {
  const upper = countryCode.toUpperCase()
  const out: string[] = []
  for (const [a, b] of COMPARE_PAIRS) {
    if (a !== upper && b !== upper) continue
    const slug = toCompareSlug(a, b)
    if (out.includes(slug)) continue
    out.push(slug)
    if (out.length >= limit) break
  }
  return out
}

/** ISO codes from a canonical compare slug. */
export function codesFromCompareSlug(slug: string): [string, string] | null {
  const parsed = parseCompareSlug(slug)
  if (!parsed) return null
  return [parsed.a, parsed.b]
}

/** Featured pairs for homepage / countries hub (unique slugs, capped). */
export function getFeaturedCompareSlugs(limit = 8): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const [a, b] of COMPARE_PAIRS) {
    const slug = toCompareSlug(a, b)
    if (seen.has(slug)) continue
    seen.add(slug)
    out.push(slug)
    if (out.length >= limit) break
  }
  return out
}
