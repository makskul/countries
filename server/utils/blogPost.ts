const LOCALES = ['uk', 'en', 'ru'] as const

export const BLOG_POST_FIELDS = [
  'slug', 'status', 'published_at', 'author_name',
  'cover_image_url', 'cover_alt', 'og_image_url',
  ...LOCALES.flatMap(l => [`title_${l}`, `excerpt_${l}`, `body_${l}`, `seo_title_${l}`, `seo_description_${l}`]),
] as const

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Whitelist + normalise admin input for blog_posts. */
export function pickPostFields(body: Record<string, unknown>, opts: { partial: boolean }) {
  const out: Record<string, unknown> = {}

  for (const key of BLOG_POST_FIELDS) {
    if (body[key] === undefined) continue
    const v = body[key]
    out[key] = typeof v === 'string' ? (v.trim() === '' ? null : v) : v
  }

  if (out.slug !== undefined || !opts.partial) {
    const slug = String(out.slug ?? '').trim().toLowerCase()
    if (!SLUG_RE.test(slug)) {
      throw createError({
        statusCode: 400,
        message: 'Slug: только латиница, цифры и дефисы (например, my-first-post)',
      })
    }
    out.slug = slug
  }

  if (out.status !== undefined && out.status !== 'draft' && out.status !== 'published') {
    throw createError({ statusCode: 400, message: 'Invalid status' })
  }

  for (const key of ['cover_image_url', 'og_image_url'] as const) {
    const url = out[key]
    if (typeof url === 'string' && !/^https?:\/\//i.test(url) && !url.startsWith('/')) {
      throw createError({ statusCode: 400, message: `${key}: нужен http(s)-адрес или путь, начинающийся с /` })
    }
  }

  if (out.published_at !== undefined && out.published_at !== null) {
    const d = new Date(String(out.published_at))
    if (Number.isNaN(d.getTime())) throw createError({ statusCode: 400, message: 'Invalid published_at' })
    out.published_at = d.toISOString()
  }

  if (!opts.partial) {
    const hasTitle = LOCALES.some(l => out[`title_${l}`])
    if (!hasTitle) throw createError({ statusCode: 400, message: 'Нужен заголовок хотя бы на одном языке' })
  }

  return out
}
