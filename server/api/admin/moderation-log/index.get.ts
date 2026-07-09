export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const action = query.action ? String(query.action) : undefined
  const page = Math.max(1, Number(query.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 30)))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { supabaseAdmin } = await requireAdmin(event)

  let builder = supabaseAdmin
    .from('moderation_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (action) builder = builder.eq('action', action)

  const { data, error, count } = await builder
  if (error) throw createError({ statusCode: 500, message: error.message })

  return { items: data ?? [], total: count ?? 0, page, pageSize }
})
