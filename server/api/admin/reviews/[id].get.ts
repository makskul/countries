export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' })

  const { supabaseAdmin } = await requireAdmin(event)
  const { data, error } = await supabaseAdmin.from('reviews').select('*').eq('id', id).single()
  if (error || !data) throw createError({ statusCode: 404, message: 'Review not found' })
  return data
})
