/** CMS content hubs: UA×country landing articles (EPIC-2.4). */
export const CONTENT_HUB_COUNTRIES: readonly string[] = [
  'PL', 'DE', 'CZ', 'ES', 'PT', 'GE', 'TR', 'TH',
] as const

/** Published with full article_body_* (remainder = excerpt-only scaffolds). */
export const CONTENT_HUB_FULL_ARTICLE: readonly string[] = ['PL', 'DE', 'CZ'] as const

export function isContentHubCountry(code: string): boolean {
  return CONTENT_HUB_COUNTRIES.includes(code.toUpperCase())
}

export function isContentHubFullArticle(code: string): boolean {
  return CONTENT_HUB_FULL_ARTICLE.includes(code.toUpperCase())
}
