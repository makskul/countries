export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const status = String(query.status ?? 'all')
  const country = query.country ? String(query.country) : undefined
  const nationality = query.nationality ? String(query.nationality) : undefined
  const page = Math.max(1, Number(query.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 20)))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { supabaseAdmin } = await requireAdmin(event)

  let builder = supabaseAdmin
    .from('reviews')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status === 'pending') builder = builder.eq('is_approved', false)
  else if (status === 'approved') builder = builder.eq('is_approved', true)
  else if (status === 'rejected') builder = builder.eq('is_approved', false)

  if (country) builder = builder.eq('target_country', country.toUpperCase())
  if (nationality) builder = builder.eq('author_nationality', nationality.toUpperCase())

  const { data, error, count } = await builder
  if (error) throw createError({ statusCode: 500, message: error.message })

  const pendingRes = await supabaseAdmin
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('is_approved', false)

  return {
    items: data ?? [],
    total: count ?? 0,
    pending: pendingRes.count ?? 0,
    page,
    pageSize,
  }
})
