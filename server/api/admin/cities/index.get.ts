export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const country = query.country ? String(query.country).toUpperCase() : undefined
  const page = Math.max(1, Number(query.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 50)))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })

  let builder = supabaseAdmin
    .from('cities')
    .select('*', { count: 'exact' })
    .order('population', { ascending: false })
    .range(from, to)

  if (country) builder = builder.eq('country', country)

  const { data, error, count } = await builder
  if (error) throw createError({ statusCode: 500, message: error.message })

  return { items: data ?? [], total: count ?? 0, page, pageSize }
})
