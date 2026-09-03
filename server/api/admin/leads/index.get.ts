export default defineEventHandler(async (event) => {
  const { supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })

  const query = getQuery(event)
  const country = query.country ? String(query.country).toUpperCase() : undefined
  const q = query.q ? String(query.q).trim() : ''
  const page = Math.max(1, Number(query.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 30)))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let builder = supabaseAdmin
    .from('leads')
    .select('id, country, author_nationality, email, message, source, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (country) builder = builder.eq('country', country)
  if (q) {
    const safe = q.replace(/[%_,.()]/g, ' ').trim()
    if (safe) {
      builder = builder.or(`email.ilike.%${safe}%,message.ilike.%${safe}%,source.ilike.%${safe}%`)
    }
  }

  const { data, error, count } = await builder
  if (error) throw createError({ statusCode: 500, message: error.message })

  return { items: data ?? [], total: count ?? 0, page, pageSize }
})
