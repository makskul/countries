export default defineEventHandler(async (event) => {
  const { supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })

  const query = getQuery(event)
  const status = query.status === 'draft' || query.status === 'published' ? String(query.status) : undefined
  const q = query.q ? String(query.q).trim() : ''
  const page = Math.max(1, Number(query.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 30)))
  const from = (page - 1) * pageSize

  let builder = supabaseAdmin
    .from('blog_posts')
    .select('id, slug, status, published_at, updated_at, title_uk, title_en, title_ru', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (status) builder = builder.eq('status', status)
  if (q) {
    const safe = q.replace(/[%_,.()]/g, ' ').trim()
    if (safe) {
      builder = builder.or(`slug.ilike.%${safe}%,title_uk.ilike.%${safe}%,title_en.ilike.%${safe}%,title_ru.ilike.%${safe}%`)
    }
  }

  const { data, error, count } = await builder
  if (error) throw createError({ statusCode: 500, message: error.message })
  return { items: data ?? [], total: count ?? 0, page, pageSize }
})
