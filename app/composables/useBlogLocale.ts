import type { BlogPostRow } from '~/types/blog'

/** Picks the localized value of a blog field with fallback en → uk → ru. */
export function useBlogLocale() {
  const { locale } = useI18n()

  function pick(post: BlogPostRow, field: 'title' | 'excerpt' | 'body' | 'seo_title' | 'seo_description'): string {
    const row = post as unknown as Record<string, string | null>
    const loc = locale.value
    const own = row[`${field}_${loc}`]
    return (own || row[`${field}_en`] || row[`${field}_uk`] || row[`${field}_ru`] || '').trim()
  }

  function formatDate(iso: string | null): string {
    if (!iso) return ''
    const tag = locale.value === 'uk' ? 'uk-UA' : locale.value === 'ru' ? 'ru-RU' : 'en-US'
    return new Date(iso).toLocaleDateString(tag, { year: 'numeric', month: 'long', day: 'numeric' })
  }

  function readingMinutes(body: string): number {
    const words = body.trim().split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.round(words / 200))
  }

  return { pick, formatDate, readingMinutes }
}
