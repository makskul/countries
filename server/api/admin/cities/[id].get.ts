export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' })

  const { supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })
  const { data, error } = await supabaseAdmin
    .from('cities')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) throw createError({ statusCode: 404, message: error?.message ?? 'Not found' })
  return data
})
